const Act = require('../models/Act');
const CaseLaw = require('../models/CaseLaw');
const CourtForm = require('../models/CourtForm');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendPaginated } = require('../utils/responseFormatter');

/**
 * ACTS/LEGISLATION CONTROLLERS
 */

// @desc    Get all acts
// @route   GET /api/research/acts
// @access  Public
exports.getAllActs = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20, category, year, jurisdiction, status } = req.query;

    const query = {};
    if (category) query.category = category;
    if (year) query.year = parseInt(year);
    if (jurisdiction) query.jurisdiction = jurisdiction;
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const acts = await Act.find(query)
        .select('-fullText') // Exclude full text for list view
        .sort({ year: -1, title: 1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Act.countDocuments(query);

    sendPaginated(res, 200, 'Acts retrieved successfully', acts, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

// @desc    Get act by ID
// @route   GET /api/research/acts/:id
// @access  Public
exports.getActById = catchAsync(async (req, res, next) => {
    const act = await Act.findById(req.params.id);

    if (!act) {
        return next(new AppError('Act not found', 404));
    }

    // Increment view count
    await act.incrementViewCount();

    sendSuccess(res, 200, 'Act retrieved successfully', { act });
});

// @desc    Search acts
// @route   GET /api/research/acts/search
// @access  Public
exports.searchActs = catchAsync(async (req, res, next) => {
    const { query, category, year, jurisdiction, page = 1, limit = 20 } = req.query;

    if (!query || query.trim() === '') {
        return next(new AppError('Search query is required', 400));
    }

    const filters = {};
    if (category) filters.category = category;
    if (year) filters.year = parseInt(year);
    if (jurisdiction) filters.jurisdiction = jurisdiction;

    const skip = (page - 1) * limit;
    const acts = await Act.searchActs(query, filters)
        .select('-fullText')
        .skip(skip)
        .limit(parseInt(limit));

    sendPaginated(res, 200, 'Search results retrieved successfully', acts, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: acts.length
    });
});

// @desc    Get acts by category
// @route   GET /api/research/acts/category/:category
// @access  Public
exports.getActsByCategory = catchAsync(async (req, res, next) => {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const acts = await Act.findByCategory(category)
        .select('-fullText')
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Act.countDocuments({ category, status: 'Active' });

    sendPaginated(res, 200, `Acts in ${category} retrieved successfully`, acts, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

// @desc    Download act PDF
// @route   GET /api/research/acts/:id/download
// @access  Public
exports.downloadAct = catchAsync(async (req, res, next) => {
    const act = await Act.findById(req.params.id);

    if (!act) {
        return next(new AppError('Act not found', 404));
    }

    if (!act.pdfPath) {
        return next(new AppError('PDF not available for this act', 404));
    }

    // Increment download count
    await act.incrementDownloadCount();

    // Send file
    res.download(act.pdfPath, `${act.title} ${act.year}.pdf`);
});

/**
 * CASE LAW CONTROLLERS
 */

// @desc    Get all case laws
// @route   GET /api/research/case-laws
// @access  Public
exports.getAllCaseLaws = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20, court, caseType, year, importance } = req.query;

    const query = {};
    if (court) query.court = court;
    if (caseType) query.caseType = caseType;
    if (year) query.year = parseInt(year);
    if (importance) query.importance = importance;

    const skip = (page - 1) * limit;
    const caseLaws = await CaseLaw.find(query)
        .select('-judgmentText') // Exclude full judgment for list view
        .sort({ decisionDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await CaseLaw.countDocuments(query);

    sendPaginated(res, 200, 'Case laws retrieved successfully', caseLaws, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

// @desc    Get case law by ID
// @route   GET /api/research/case-laws/:id
// @access  Public
exports.getCaseLawById = catchAsync(async (req, res, next) => {
    const caseLaw = await CaseLaw.findById(req.params.id)
        .populate('casesReferred', 'citation caseTitle');

    if (!caseLaw) {
        return next(new AppError('Case law not found', 404));
    }

    // Increment view count
    await caseLaw.incrementViewCount();

    sendSuccess(res, 200, 'Case law retrieved successfully', { caseLaw });
});

// @desc    Advanced case law search
// @route   GET /api/research/case-laws/search
// @access  Public
exports.searchCaseLaws = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20, ...searchParams } = req.query;

    const skip = (page - 1) * limit;
    const caseLaws = await CaseLaw.advancedSearch(searchParams)
        .select('-judgmentText')
        .skip(skip)
        .limit(parseInt(limit));

    sendPaginated(res, 200, 'Search results retrieved successfully', caseLaws, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: caseLaws.length
    });
});

// @desc    Get landmark cases
// @route   GET /api/research/case-laws/landmark
// @access  Public
exports.getLandmarkCases = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const caseLaws = await CaseLaw.findLandmarkCases()
        .select('-judgmentText')
        .skip(skip)
        .limit(parseInt(limit));

    const total = await CaseLaw.countDocuments({ importance: 'Landmark' });

    sendPaginated(res, 200, 'Landmark cases retrieved successfully', caseLaws, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

// @desc    Bookmark case law
// @route   POST /api/research/case-laws/:id/bookmark
// @access  Private
exports.bookmarkCaseLaw = catchAsync(async (req, res, next) => {
    const caseLaw = await CaseLaw.findById(req.params.id);

    if (!caseLaw) {
        return next(new AppError('Case law not found', 404));
    }

    await caseLaw.addBookmark(req.user._id);

    sendSuccess(res, 200, 'Case law bookmarked successfully');
});

// @desc    Remove bookmark
// @route   DELETE /api/research/case-laws/:id/bookmark
// @access  Private
exports.removeBookmark = catchAsync(async (req, res, next) => {
    const caseLaw = await CaseLaw.findById(req.params.id);

    if (!caseLaw) {
        return next(new AppError('Case law not found', 404));
    }

    await caseLaw.removeBookmark(req.user._id);

    sendSuccess(res, 200, 'Bookmark removed successfully');
});

// @desc    Download case law PDF
// @route   GET /api/research/case-laws/:id/download
// @access  Public
exports.downloadCaseLaw = catchAsync(async (req, res, next) => {
    const caseLaw = await CaseLaw.findById(req.params.id);

    if (!caseLaw) {
        return next(new AppError('Case law not found', 404));
    }

    if (!caseLaw.pdfPath) {
        return next(new AppError('PDF not available for this case', 404));
    }

    // Increment download count
    await caseLaw.incrementDownloadCount();

    // Send file
    res.download(caseLaw.pdfPath, `${caseLaw.citation}.pdf`);
});

// @desc    Get my bookmarks
// @route   GET /api/research/case-laws/my-bookmarks
// @access  Private
exports.getMyBookmarks = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const caseLaws = await CaseLaw.find({
        bookmarkedBy: req.user._id
    })
        .select('-judgment Text')
        .sort({ decisionDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await CaseLaw.countDocuments({ bookmarkedBy: req.user._id });

    sendPaginated(res, 200, 'Bookmarked cases retrieved successfully', caseLaws, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

/**
 * COURT FORMS CONTROLLERS
 */

// @desc    Get all court forms
// @route   GET /api/research/forms
// @access  Public
exports.getAllForms = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20, category, jurisdiction } = req.query;

    const query = { status: 'Active' };
    if (category) query.category = category;
    if (jurisdiction) query.jurisdiction = jurisdiction;

    const skip = (page - 1) * limit;
    const forms = await CourtForm.find(query)
        .select('-instructions') // Exclude lengthy instructions for list view
        .sort({ formNumber: 1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await CourtForm.countDocuments(query);

    sendPaginated(res, 200, 'Court forms retrieved successfully', forms, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

// @desc    Get form by ID
// @route   GET /api/research/forms/:id
// @access  Public
exports.getFormById = catchAsync(async (req, res, next) => {
    const form = await CourtForm.findById(req.params.id);

    if (!form) {
        return next(new AppError('Form not found', 404));
    }

    // Increment view count
    await form.incrementViewCount();

    sendSuccess(res, 200, 'Form retrieved successfully', { form });
});

// @desc    Search forms
// @route   GET /api/research/forms/search
// @access  Public
exports.searchForms = catchAsync(async (req, res, next) => {
    const { query, category, page = 1, limit = 20 } = req.query;

    if (!query || query.trim() === '') {
        return next(new AppError('Search query is required', 400));
    }

    const skip = (page - 1) * limit;
    const forms = await CourtForm.searchForms(query, category)
        .select('-instructions')
        .skip(skip)
        .limit(parseInt(limit));

    sendPaginated(res, 200, 'Search results retrieved successfully', forms, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: forms.length
    });
});

// @desc    Get forms by category
// @route   GET /api/research/forms/category/:category
// @access  Public
exports.getFormsByCategory = catchAsync(async (req, res, next) => {
    const { category } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const forms = await CourtForm.findByCategory(category)
        .select('-instructions')
        .skip(skip)
        .limit(parseInt(limit));

    const total = await CourtForm.countDocuments({ category, status: 'Active' });

    sendPaginated(res, 200, `Forms in ${category} retrieved successfully`, forms, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

// @desc    Download form
// @route   GET /api/research/forms/:id/download
// @access  Public
exports.downloadForm = catchAsync(async (req, res, next) => {
    const { type = 'pdf' } = req.query; // pdf, word, fillable

    const form = await CourtForm.findById(req.params.id);

    if (!form) {
        return next(new AppError('Form not found', 404));
    }

    let filePath;
    let fileName;

    switch (type) {
        case 'word':
            filePath = form.wordDocPath;
            fileName = `${form.formNumber} - ${form.formTitle}.docx`;
            break;
        case 'fillable':
            filePath = form.fillablePdfPath;
            fileName = `${form.formNumber} - ${form.formTitle} (Fillable).pdf`;
            break;
        default:
            filePath = form.pdfPath;
            fileName = `${form.formNumber} - ${form.formTitle}.pdf`;
    }

    if (!filePath) {
        return next(new AppError(`${type} version not available for this form`, 404));
    }

    // Increment download count
    await form.incrementDownloadCount();

    // Send file
    res.download(filePath, fileName);
});

/**
 * GENERAL RESEARCH CONTROLLERS
 */

// @desc    Get research statistics
// @route   GET /api/research/statistics
// @access  Public
exports.getResearchStatistics = catchAsync(async (req, res, next) => {
    const statistics = {
        acts: {
            total: await Act.countDocuments({ isDeleted: false }),
            byCategory: {},
            byJurisdiction: {}
        },
        caseLaws: {
            total: await CaseLaw.countDocuments({ isDeleted: false }),
            byCourt: {},
            landmark: await CaseLaw.countDocuments({ importance: 'Landmark' })
        },
        forms: {
            total: await CourtForm.countDocuments({ status: 'Active', isDeleted: false }),
            byCategory: {}
        }
    };

    // Acts by category
    const actCategories = await Act.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    actCategories.forEach(cat => {
        statistics.acts.byCategory[cat._id] = cat.count;
    });

    // Case laws by court
    const courtCounts = await CaseLaw.aggregate([
        { $match: { isDeleted: { $ne: true } } },
        { $group: { _id: '$court', count: { $sum: 1 } } }
    ]);
    courtCounts.forEach(court => {
        statistics.caseLaws.byCourt[court._id] = court.count;
    });

    // Forms by category
    const formCategories = await CourtForm.aggregate([
        { $match: { status: 'Active', isDeleted: { $ne: true } } },
        { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    formCategories.forEach(cat => {
        statistics.forms.byCategory[cat._id] = cat.count;
    });

    sendSuccess(res, 200, 'Research statistics retrieved successfully', { statistics });
});

module.exports = exports;
