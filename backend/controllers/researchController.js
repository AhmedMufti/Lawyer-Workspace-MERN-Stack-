const Act = require('../models/Act');
const CaseLaw = require('../models/CaseLaw');
const CourtForm = require('../models/CourtForm');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendPaginated } = require('../utils/responseFormatter');
const path = require('path');
const fs = require('fs');

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

    // Construct absolute path
    const absolutePath = path.resolve(__dirname, '..', act.pdfPath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
        console.error(`File not found at: ${absolutePath}`);
        return next(new AppError('File not found on server', 404));
    }

    // Increment download count
    await act.incrementDownloadCount();

    // Send file
    res.download(absolutePath, `${act.title} ${act.year}.pdf`);
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

    // Construct absolute path
    const absolutePath = path.resolve(__dirname, '..', caseLaw.pdfPath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
        console.error(`File not found at: ${absolutePath}`);
        return next(new AppError('File not found on server', 404));
    }

    // Increment download count
    await caseLaw.incrementDownloadCount();

    // Send file
    res.download(absolutePath, `${caseLaw.citation}.pdf`);
});

// ... (Bookmarks)

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

    // Construct absolute path
    const absolutePath = path.resolve(__dirname, '..', filePath);

    // Check if file exists
    if (!fs.existsSync(absolutePath)) {
        console.error(`File not found at: ${absolutePath}`);
        return next(new AppError('File not found on server', 404));
    }

    // Increment download count
    await form.incrementDownloadCount();

    // Send file
    res.download(absolutePath, fileName);
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

// TEMPORARY SEEDING FUNCTION
exports.seedData = catchAsync(async (req, res, next) => {
    const seedActs = [
        {
            title: 'The Constitution of the Islamic Republic of Pakistan',
            shortTitle: 'Constitution of Pakistan',
            year: 1973,
            actNumber: 'N/A',
            category: 'Constitutional Law',
            jurisdiction: 'Federal',
            status: 'Active',
            fullText: 'The Constitution of the Islamic Republic of Pakistan is the supreme law of Pakistan...',
            preamble: 'Whereas sovereignty over the entire Universe belongs to Almighty Allah alone...',
            keywords: ['constitution', 'fundamental rights', 'parliament', 'judiciary'],
            pdfPath: 'uploads/research/dummy.pdf',
            isDeleted: false
        },
        {
            title: 'Pakistan Penal Code',
            shortTitle: 'PPC',
            year: 1860,
            actNumber: 'XLV',
            category: 'Criminal Law',
            jurisdiction: 'Federal',
            status: 'Active',
            fullText: 'An Act to provide a general Penal Code for Pakistan...',
            keywords: ['crime', 'punishment', 'offences', 'murder', 'theft', 'robbery'],
            pdfPath: 'uploads/research/dummy.pdf',
            isDeleted: false
        },
        {
            title: 'Code of Civil Procedure',
            shortTitle: 'CPC',
            year: 1908,
            category: 'Civil Law',
            status: 'Active',
            fullText: 'An Act to consolidate and amend the laws relating to the Procedure of the Courts of Civil Judicature...',
            keywords: ['civil', 'court', 'procedure', 'summons', 'decree'],
            pdfPath: 'uploads/research/dummy.pdf',
            isDeleted: false
        },
        {
            title: 'Code of Criminal Procedure',
            shortTitle: 'CrPC',
            year: 1898,
            category: 'Criminal Law',
            status: 'Active',
            fullText: 'An Act to consolidate and amend the law relating to the Criminal Procedure...',
            keywords: ['criminal', 'arrest', 'bail', 'investigation', 'police'],
            pdfPath: 'uploads/research/dummy.pdf',
            isDeleted: false
        },
        {
            title: 'Family Courts Act',
            shortTitle: 'Family Courts Act',
            year: 1964,
            category: 'Family Law',
            status: 'Active',
            fullText: 'An Act to provide for the establishment of Family Courts...',
            keywords: ['family', 'divorce', 'khula', 'dower', 'maintenance'],
            pdfPath: 'uploads/research/dummy.pdf',
            isDeleted: false
        },
        {
            title: 'Prevention of Electronic Crimes Act',
            shortTitle: 'PECA',
            year: 2016,
            category: 'Criminal Law',
            status: 'Active',
            fullText: 'An Act to make provision for prevention of electronic crimes...',
            keywords: ['cybercrime', 'internet', 'privacy', 'data', 'defamation'],
            pdfPath: 'uploads/research/dummy.pdf',
            isDeleted: false
        },
        {
            title: 'Companies Act',
            shortTitle: 'Companies Act',
            year: 2017,
            category: 'Corporate Law',
            status: 'Active',
            fullText: 'An Act to reform and consolidate the law relating to companies...',
            keywords: ['company', 'corporate', 'shares', 'directors', 'secp'],
            pdfPath: 'uploads/research/dummy.pdf',
            isDeleted: false
        }
    ];

    const seedCases = [
        {
            caseTitle: 'Asma Jilani vs. The Government of the Punjab',
            citation: 'PLD 1972 SC 139',
            petitioner: 'Asma Jilani',
            respondent: 'Government of the Punjab',
            court: 'Supreme Court of Pakistan',
            decisionDate: new Date('1972-04-20'),
            caseType: 'Constitutional',
            year: 1972,
            judgmentText: 'The Doctrine of Necessity was declared invalid...',
            summary: 'Landmark decision against martial law.',
            importance: 'Landmark',
            keywords: ['martial law', 'necessity', 'constitution'],
            pdfPath: 'uploads/research/dummy.pdf',
            disposition: 'Allowed'
        },
        {
            caseTitle: 'Al-Jehad Trust vs. Federation of Pakistan',
            citation: 'PLD 1996 SC 324',
            petitioner: 'Al-Jehad Trust',
            respondent: 'Federation of Pakistan',
            court: 'Supreme Court of Pakistan',
            decisionDate: new Date('1996-03-20'),
            caseType: 'Constitutional',
            year: 1996,
            judgmentText: 'Principles regarding the appointment of judges...',
            summary: 'Judges Appointment Case.',
            importance: 'Landmark',
            keywords: ['judiciary', 'appointment', 'independence'],
            pdfPath: 'uploads/research/dummy.pdf',
            disposition: 'Allowed'
        },
        {
            caseTitle: 'Wardan vs. The State',
            citation: '2023 SCMR 1234',
            petitioner: 'Wardan',
            respondent: 'The State',
            court: 'Supreme Court of Pakistan',
            decisionDate: new Date('2023-01-15'),
            caseType: 'Criminal',
            year: 2023,
            judgmentText: 'Bail granted in case of further inquiry...',
            summary: 'Grant of post-arrest bail in a murder case.',
            importance: 'Important',
            keywords: ['bail', 'murder', 'criminal'],
            pdfPath: 'uploads/research/dummy.pdf',
            disposition: 'Allowed'
        },
        {
            caseTitle: 'Messrs ABC Pvt Ltd vs. FBR',
            citation: '2022 PTD 567',
            petitioner: 'Messrs ABC Pvt Ltd',
            respondent: 'Federal Board of Revenue',
            court: 'Sindh High Court',
            decisionDate: new Date('2022-06-10'),
            caseType: 'Tax',
            year: 2022,
            judgmentText: 'Sales tax input adjustment allowed...',
            summary: 'Decision regarding input tax adjustment.',
            importance: 'Standard',
            keywords: ['tax', 'fbr', 'corporate'],
            pdfPath: 'uploads/research/dummy.pdf',
            disposition: 'Allowed'
        },
        {
            caseTitle: 'Suo Moto Case No. 4 of 2010',
            citation: 'PLD 2011 SC 997',
            petitioner: 'Suo Moto',
            respondent: 'The State',
            court: 'Supreme Court of Pakistan',
            decisionDate: new Date('2011-06-08'),
            caseType: 'Constitutional',
            year: 2011,
            judgmentText: 'Regarding law and order situation in Karachi...',
            summary: 'Karachi Law and Order Case.',
            importance: 'Landmark',
            keywords: ['karachi', 'human rights', 'terrorism'],
            pdfPath: 'uploads/research/dummy.pdf',
            disposition: 'Other'
        }
    ];

    const seedForms = [
        {
            formNumber: 'CP-01',
            formTitle: 'Plaint in a Civil Suit',
            category: 'Civil Procedure',
            purpose: 'To initiate a civil lawsuit.',
            pdfPath: 'uploads/research/dummy.pdf',
            status: 'Active'
        },
        {
            formNumber: 'CrP-12',
            formTitle: 'Bail Application (Post-Arrest)',
            category: 'Criminal Procedure',
            purpose: 'To apply for bail.',
            pdfPath: 'uploads/research/dummy.pdf',
            status: 'Active'
        },
        {
            formNumber: 'Fam-05',
            formTitle: 'Suit for Dissolution of Marriage (Khula)',
            category: 'Family Courts',
            purpose: 'For wife to seek divorce.',
            pdfPath: 'uploads/research/dummy.pdf',
            status: 'Active'
        },
        {
            formNumber: 'Rent-02',
            formTitle: 'Ejectment Petition',
            category: 'Civil Procedure',
            purpose: 'To evict a tenant.',
            pdfPath: 'uploads/research/dummy.pdf',
            status: 'Active'
        },
        {
            formNumber: 'Corp-09',
            formTitle: 'Company Incorporation Form II',
            category: 'Other',
            purpose: 'For registering a new company.',
            pdfPath: 'uploads/research/dummy.pdf',
            status: 'Active'
        }
    ];

    let count = 0;
    for (const act of seedActs) {
        if (!await Act.findOne({ title: act.title })) {
            await Act.create(act);
            count++;
        }
    }
    for (const c of seedCases) {
        if (!await CaseLaw.findOne({ citation: c.citation })) {
            await CaseLaw.create(c);
            count++;
        }
    }
    for (const f of seedForms) {
        if (!await CourtForm.findOne({ formNumber: f.formNumber })) {
            await CourtForm.create(f);
            count++;
        }
    }

    sendSuccess(res, 200, `Seeding completed. Added ${count} new items.`);
});

module.exports = exports;
