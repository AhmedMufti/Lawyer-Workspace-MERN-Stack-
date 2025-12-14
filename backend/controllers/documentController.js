const Document = require('../models/Document');
const Case = require('../models/Case');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendPaginated } = require('../utils/responseFormatter');
const path = require('path');
const fs = require('fs').promises;

/**
 * @desc    Upload document to case
 * @route   POST /api/documents/:caseId
 * @access  Private
 */
exports.uploadDocument = catchAsync(async (req, res, next) => {
    const { caseId } = req.params;

    // Check if file was uploaded
    if (!req.file) {
        return next(new AppError('Please upload a file', 400));
    }

    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
        return next(new AppError('Case not found', 404));
    }

    // Check access to case
    if (!caseData.canAccess(req.user._id) && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to upload documents to this case', 403));
    }

    // Extract file information
    const {
        documentTitle,
        documentType,
        category,
        description,
        keywords,
        tags,
        isConfidential,
        importance
    } = req.body;

    // Create document record
    const document = await Document.create({
        documentTitle: documentTitle || req.file.originalname,
        documentType: documentType || 'Other',
        category: category || 'Internal',
        description,
        keywords: keywords ? (Array.isArray(keywords) ? keywords : JSON.parse(keywords)) : [],
        tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
        case: caseId,
        fileName: req.file.filename,
        originalFileName: req.file.originalname,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        fileExtension: path.extname(req.file.originalname).toLowerCase().substring(1),
        uploadedBy: req.user._id,
        uploadSource: 'Web Upload',
        isConfidential: isConfidential === 'true',
        importance: importance || 'Medium'
    });

    // Update case document count
    await Case.findByIdAndUpdate(caseId, {
        $inc: { totalDocuments: 1 }
    });

    // Populate uploader
    await document.populate('uploadedBy', 'firstName lastName email');

    sendSuccess(res, 201, 'Document uploaded successfully', { document });
});

/**
 * @desc    Get documents for a case
 * @route   GET /api/documents/case/:caseId
 * @access  Private
 */
exports.getCaseDocuments = catchAsync(async (req, res, next) => {
    const { caseId } = req.params;
    const { page = 1, limit = 20, type, category } = req.query;

    // Verify case exists and user has access
    const caseData = await Case.findById(caseId);
    if (!caseData) {
        return next(new AppError('Case not found', 404));
    }

    if (!caseData.canAccess(req.user._id) && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to view documents for this case', 403));
    }

    // Build query
    const query = { case: caseId };
    if (type) query.documentType = type;
    if (category) query.category = category;

    // Execute query
    const skip = (page - 1) * limit;
    const documents = await Document.find(query)
        .populate('uploadedBy', 'firstName lastName email')
        .sort({ uploadDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Document.countDocuments(query);

    sendPaginated(res, 200, 'Documents retrieved successfully', documents, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

/**
 * @desc    Get document by ID
 * @route   GET /api/documents/:id
 * @access  Private
 */
exports.getDocumentById = catchAsync(async (req, res, next) => {
    const document = await Document.findById(req.params.id)
        .populate('uploadedBy', 'firstName lastName email')
        .populate('case', 'caseNumber caseTitle');

    if (!document) {
        return next(new AppError('Document not found', 404));
    }

    // Check access
    const hasAccess = await document.canAccess(req.user._id);
    if (!hasAccess && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to view this document', 403));
    }

    // Increment view count
    await document.incrementViewCount(req.user._id);

    sendSuccess(res, 200, 'Document retrieved successfully', { document });
});

/**
 * @desc    Download document
 * @route   GET /api/documents/:id/download
 * @access  Private
 */
exports.downloadDocument = catchAsync(async (req, res, next) => {
    const document = await Document.findById(req.params.id).populate('case');

    if (!document) {
        return next(new AppError('Document not found', 404));
    }

    // Check access
    const hasAccess = await document.canAccess(req.user._id);
    if (!hasAccess && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to download this document', 403));
    }

    // Check if file exists
    try {
        await fs.access(document.filePath);
    } catch (error) {
        return next(new AppError('File not found on server', 404));
    }

    // Increment download count
    await document.incrementDownloadCount();

    // Send file
    res.download(document.filePath, document.originalFileName);
});

/**
 * @desc    Update document metadata
 * @route   PATCH /api/documents/:id
 * @access  Private
 */
exports.updateDocument = catchAsync(async (req, res, next) => {
    const document = await Document.findById(req.params.id).populate('case');

    if (!document) {
        return next(new AppError('Document not found', 404));
    }

    // Check if user is uploader or has case access
    const isUploader = document.uploadedBy.toString() === req.user._id.toString();
    const hasAccess = await document.canAccess(req.user._id);

    if (!isUploader && !hasAccess && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to update this document', 403));
    }

    // Don't allow changing file-related fields
    const allowedUpdates = [
        'documentTitle',
        'description',
        'keywords',
        'tags',
        'status',
        'importance',
        'category'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
        if (req.body[field] !== undefined) {
            updates[field] = req.body[field];
        }
    });

    Object.assign(document, updates);
    await document.save();

    sendSuccess(res, 200, 'Document updated successfully', { document });
});

/**
 * @desc    Delete document
 * @route   DELETE /api/documents/:id
 * @access  Private
 */
exports.deleteDocument = catchAsync(async (req, res, next) => {
    const document = await Document.findById(req.params.id).populate('case');

    if (!document) {
        return next(new AppError('Document not found', 404));
    }

    // Check permission (uploader or lead lawyer or admin)
    const isUploader = document.uploadedBy.toString() === req.user._id.toString();
    const isLeadLawyer = document.case.leadLawyer.toString() === req.user._id.toString();

    if (!isUploader && !isLeadLawyer && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to delete this document', 403));
    }

    // Soft delete
    document.isDeleted = true;
    document.deletedAt = Date.now();
    document.deletedBy = req.user._id;
    await document.save();

    // Update case document count
    await Case.findByIdAndUpdate(document.case._id, {
        $inc: { totalDocuments: -1 }
    });

    sendSuccess(res, 200, 'Document deleted successfully');
});

/**
 * @desc    Search documents
 * @route   GET /api/documents/search
 * @access  Private
 */
exports.searchDocuments = catchAsync(async (req, res, next) => {
    const { query, type, category, caseId, page = 1, limit = 20 } = req.query;

    if (!query || query.trim() === '') {
        return next(new AppError('Search query is required', 400));
    }

    // Get cases user has access to
    let accessibleCases;
    if (req.user.role === 'admin') {
        accessibleCases = await Case.find().select('_id');
    } else {
        accessibleCases = await Case.find({
            $or: [
                { leadLawyer: req.user._id },
                { 'associatedLawyers.lawyer': req.user._id },
                { clerks: req.user._id },
                { createdBy: req.user._id }
            ]
        }).select('_id');
    }

    const caseIds = accessibleCases.map(c => c._id);

    // Build search query
    const searchQuery = {
        case: { $in: caseIds }
    };

    if (caseId) {
        searchQuery.case = caseId;
    }

    if (type) searchQuery.documentType = type;
    if (category) searchQuery.category = category;

    // Execute search
    const skip = (page - 1) * limit;
    const documents = await Document.searchDocuments(query, caseId)
        .populate('uploadedBy', 'firstName lastName')
        .populate('case', 'caseNumber caseTitle')
        .skip(skip)
        .limit(parseInt(limit));

    const total = documents.length; // Approximate

    sendPaginated(res, 200, 'Search results retrieved successfully', documents, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

/**
 * @desc    Get my uploaded documents
 * @route   GET /api/documents/my-uploads
 * @access  Private
 */
exports.getMyUploads = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const documents = await Document.find({ uploadedBy: req.user._id })
        .populate('case', 'caseNumber caseTitle')
        .sort({ uploadDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Document.countDocuments({ uploadedBy: req.user._id });

    sendPaginated(res, 200, 'Your uploads retrieved successfully', documents, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

/**
 * @desc    Get document statistics
 * @route   GET /api/documents/statistics
 * @access  Private
 */
exports.getDocumentStatistics = catchAsync(async (req, res, next) => {
    // Get accessible cases
    const cases = await Case.findByLawyer(req.user._id);
    const caseIds = cases.map(c => c._id);

    const documents = await Document.find({ case: { $in: caseIds } });

    const statistics = {
        total: documents.length,
        byType: {},
        byCategory: {},
        totalSize: 0,
        averageSize: 0,
        recentUploads: 0 // last 7 days
    };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    documents.forEach(doc => {
        // By type
        statistics.byType[doc.documentType] =
            (statistics.byType[doc.documentType] || 0) + 1;

        // By category
        statistics.byCategory[doc.category] =
            (statistics.byCategory[doc.category] || 0) + 1;

        // Total size
        statistics.totalSize += doc.fileSize;

        // Recent uploads
        if (doc.uploadDate >= sevenDaysAgo) {
            statistics.recentUploads += 1;
        }
    });

    statistics.averageSize = statistics.total > 0
        ? Math.round(statistics.totalSize / statistics.total / 1024)
        : 0; // in KB
    statistics.totalSize = Math.round(statistics.totalSize / 1024 / 1024 * 100) / 100; // in MB

    sendSuccess(res, 200, 'Statistics retrieved successfully', { statistics });
});

module.exports = exports;
