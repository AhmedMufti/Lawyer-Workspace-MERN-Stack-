const Case = require('../models/Case');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendPaginated } = require('../utils/responseFormatter');

/**
 * @desc    Create a new case
 * @route   POST /api/cases
 * @access  Private (Lawyers only)
 */
exports.createCase = catchAsync(async (req, res, next) => {
    // Check if user is a lawyer
    if (req.user.role !== 'lawyer') {
        return next(new AppError('Only lawyers can create cases', 403));
    }

    // Check if case number already exists
    const existingCase = await Case.findOne({ caseNumber: req.body.caseNumber });
    if (existingCase) {
        return next(new AppError('Case number already exists', 400));
    }

    // Set lead lawyer to current user
    req.body.leadLawyer = req.user._id;
    req.body.createdBy = req.user._id;

    // Create case
    const newCase = await Case.create(req.body);

    // Populate references
    await newCase.populate([
        { path: 'leadLawyer', select: 'firstName lastName email barLicenseNumber' },
        { path: 'associatedLawyers.lawyer', select: 'firstName lastName email' },
        { path: 'clerks', select: 'firstName lastName email' }
    ]);

    sendSuccess(res, 201, 'Case created successfully', { case: newCase });
});

/**
 * @desc    Get all cases for current user
 * @route   GET /api/cases
 * @access  Private
 */
exports.getMyCases = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 10, status, type, priority } = req.query;

    // Build query based on user role
    let query = {};

    if (req.user.role === 'admin') {
        // Admin can see all cases
        query = {};
    } else {
        // Find cases where user is involved
        query = {
            $or: [
                { leadLawyer: req.user._id },
                { 'associatedLawyers.lawyer': req.user._id },
                { clerks: req.user._id },
                { createdBy: req.user._id }
            ]
        };
    }

    // Add filters
    if (status) query.caseStatus = status;
    if (type) query.caseType = type;
    if (priority) query.priority = priority;

    // Execute query with pagination
    const skip = (page - 1) * limit;
    const cases = await Case.find(query)
        .populate('leadLawyer', 'firstName lastName email')
        .populate('associatedLawyers.lawyer', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Case.countDocuments(query);

    sendPaginated(res, 200, 'Cases retrieved successfully', cases, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

/**
 * @desc    Get case by ID
 * @route   GET /api/cases/:id
 * @access  Private
 */
exports.getCaseById = catchAsync(async (req, res, next) => {
    const caseData = await Case.findById(req.params.id)
        .populate('leadLawyer', 'firstName lastName email phone barLicenseNumber')
        .populate('associatedLawyers.lawyer', 'firstName lastName email phone')
        .populate('clerks', 'firstName lastName email phone')
        .populate('createdBy', 'firstName lastName email')
        .populate('lastModifiedBy', 'firstName lastName');

    if (!caseData) {
        return next(new AppError('Case not found', 404));
    }

    // Check if user has access to this case
    if (!caseData.canAccess(req.user._id) && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to access this case', 403));
    }

    sendSuccess(res, 200, 'Case retrieved successfully', { case: caseData });
});

/**
 * @desc    Update case
 * @route   PATCH /api/cases/:id
 * @access  Private
 */
exports.updateCase = catchAsync(async (req, res, next) => {
    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
        return next(new AppError('Case not found', 404));
    }

    // Check if user has permission to update
    const isLeadLawyer = caseData.leadLawyer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isLeadLawyer && !isAdmin) {
        return next(new AppError('Only the lead lawyer can update this case', 403));
    }

    // Set userId in locals for middleware to use
    caseData.$locals.userId = req.user._id;

    // Don't allow changing lead lawyer through this route
    delete req.body.leadLawyer;
    delete req.body.createdBy;

    // Update case
    Object.assign(caseData, req.body);
    await caseData.save();

    // Populate and return
    await caseData.populate([
        { path: 'leadLawyer', select: 'firstName lastName email' },
        { path: 'lastModifiedBy', select: 'firstName lastName' }
    ]);

    sendSuccess(res, 200, 'Case updated successfully', { case: caseData });
});

/**
 * @desc    Delete case (soft delete)
 * @route   DELETE /api/cases/:id
 * @access  Private (Lead lawyer or Admin)
 */
exports.deleteCase = catchAsync(async (req, res, next) => {
    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
        return next(new AppError('Case not found', 404));
    }

    // Check permission
    const isLeadLawyer = caseData.leadLawyer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isLeadLawyer && !isAdmin) {
        return next(new AppError('You do not have permission to delete this case', 403));
    }

    // Soft delete
    caseData.isDeleted = true;
    caseData.deletedAt = Date.now();
    await caseData.save();

    sendSuccess(res, 200, 'Case deleted successfully');
});

/**
 * @desc    Archive case
 * @route   POST /api/cases/:id/archive
 * @access  Private (Lead lawyer or Admin)
 */
exports.archiveCase = catchAsync(async (req, res, next) => {
    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
        return next(new AppError('Case not found', 404));
    }

    // Check permission
    const isLeadLawyer = caseData.leadLawyer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isLeadLawyer && !isAdmin) {
        return next(new AppError('You do not have permission to archive this case', 403));
    }

    caseData.isArchived = true;
    caseData.archivedAt = Date.now();
    caseData.archivedBy = req.user._id;
    caseData.caseStatus = 'Archived';
    await caseData.save();

    sendSuccess(res, 200, 'Case archived successfully', { case: caseData });
});

/**
 * @desc    Add lawyer to case
 * @route   POST /api/cases/:id/lawyers
 * @access  Private (Lead lawyer or Admin)
 */
exports.addLawyer = catchAsync(async (req, res, next) => {
    const { lawyerId, role } = req.body;

    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
        return next(new AppError('Case not found', 404));
    }

    // Check permission
    const isLeadLawyer = caseData.leadLawyer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isLeadLawyer && !isAdmin) {
        return next(new AppError('Only the lead lawyer can add lawyers to this case', 403));
    }

    // Verify lawyer exists and is actually a lawyer
    const lawyer = await User.findById(lawyerId);
    if (!lawyer) {
        return next(new AppError('Lawyer not found', 404));
    }

    if (lawyer.role !== 'lawyer') {
        return next(new AppError('User is not a lawyer', 400));
    }

    // Add lawyer
    caseData.addLawyer(lawyerId, role);
    await caseData.save();

    await caseData.populate('associatedLawyers.lawyer', 'firstName lastName email');

    sendSuccess(res, 200, 'Lawyer added to case successfully', { case: caseData });
});

/**
 * @desc    Add clerk to case
 * @route   POST /api/cases/:id/clerks
 * @access  Private (Lead lawyer or Admin)
 */
exports.addClerk = catchAsync(async (req, res, next) => {
    const { clerkId } = req.body;

    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
        return next(new AppError('Case not found', 404));
    }

    // Check permission
    const isLeadLawyer = caseData.leadLawyer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isLeadLawyer && !isAdmin) {
        return next(new AppError('Only the lead lawyer can add clerks to this case', 403));
    }

    // Verify clerk exists
    const clerk = await User.findById(clerkId);
    if (!clerk) {
        return next(new AppError('Clerk not found', 404));
    }

    if (clerk.role !== 'clerk') {
        return next(new AppError('User is not a clerk', 400));
    }

    // Check if already added
    if (caseData.clerks.includes(clerkId)) {
        return next(new AppError('Clerk already added to this case', 400));
    }

    caseData.clerks.push(clerkId);
    await caseData.save();

    await caseData.populate('clerks', 'firstName lastName email');

    sendSuccess(res, 200, 'Clerk added to case successfully', { case: caseData });
});

/**
 * @desc    Add task to case
 * @route   POST /api/cases/:id/tasks
 * @access  Private
 */
exports.addTask = catchAsync(async (req, res, next) => {
    const { task, dueDate, assignedTo } = req.body;

    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
        return next(new AppError('Case not found', 404));
    }

    // Check if user has access
    if (!caseData.canAccess(req.user._id) && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to add tasks to this case', 403));
    }

    // Verify assigned user has access to case
    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
        return next(new AppError('Assigned user not found', 404));
    }

    caseData.pendingTasks.push({
        task,
        dueDate,
        assignedTo,
        status: 'Pending'
    });

    await caseData.save();
    await caseData.populate('pendingTasks.assignedTo', 'firstName lastName email');

    sendSuccess(res, 200, 'Task added successfully', { case: caseData });
});

/**
 * @desc    Update task status
 * @route   PATCH /api/cases/:id/tasks/:taskId
 * @access  Private
 */
exports.updateTaskStatus = catchAsync(async (req, res, next) => {
    const { status } = req.body;

    const caseData = await Case.findById(req.params.id);

    if (!caseData) {
        return next(new AppError('Case not found', 404));
    }

    const task = caseData.pendingTasks.id(req.params.taskId);

    if (!task) {
        return next(new AppError('Task not found', 404));
    }

    // Check if user is assigned to this task or has case access
    const isAssigned = task.assignedTo.toString() === req.user._id.toString();
    const hasAccess = caseData.canAccess(req.user._id);

    if (!isAssigned && !hasAccess && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to update this task', 403));
    }

    task.status = status;
    await caseData.save();

    sendSuccess(res, 200, 'Task status updated successfully', { task });
});

/**
 * @desc    Search cases
 * @route   GET /api/cases/search
 * @access  Private
 */
exports.searchCases = catchAsync(async (req, res, next) => {
    const {
        query,
        caseType,
        caseStatus,
        city,
        fromDate,
        toDate,
        priority,
        tags,
        page = 1,
        limit = 10
    } = req.query;

    // Build search query
    let searchQuery = {};

    // User access filter (non-admin)
    if (req.user.role !== 'admin') {
        searchQuery.$or = [
            { leadLawyer: req.user._id },
            { 'associatedLawyers.lawyer': req.user._id },
            { clerks: req.user._id },
            { createdBy: req.user._id }
        ];
    }

    // Text search
    if (query) {
        searchQuery.$and = searchQuery.$and || [];
        searchQuery.$and.push({
            $or: [
                { caseNumber: new RegExp(query, 'i') },
                { caseTitle: new RegExp(query, 'i') },
                { description: new RegExp(query, 'i') },
                { 'petitioner.name': new RegExp(query, 'i') },
                { 'respondent.name': new RegExp(query, 'i') }
            ]
        });
    }

    // Filters
    if (caseType) searchQuery.caseType = caseType;
    if (caseStatus) searchQuery.caseStatus = caseStatus;
    if (city) searchQuery['court.city'] = new RegExp(city, 'i');
    if (priority) searchQuery.priority = priority;
    if (tags) searchQuery.tags = { $in: Array.isArray(tags) ? tags : [tags] };

    // Date range
    if (fromDate || toDate) {
        searchQuery.filingDate = {};
        if (fromDate) searchQuery.filingDate.$gte = new Date(fromDate);
        if (toDate) searchQuery.filingDate.$lte = new Date(toDate);
    }

    // Execute search
    const skip = (page - 1) * limit;
    const cases = await Case.find(searchQuery)
        .populate('leadLawyer', 'firstName lastName email')
        .sort({ filingDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Case.countDocuments(searchQuery);

    sendPaginated(res, 200, 'Search results retrieved successfully', cases, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

/**
 * @desc    Get upcoming hearings for user's cases
 * @route   GET /api/cases/upcoming-hearings
 * @access  Private
 */
exports.getUpcomingHearings = catchAsync(async (req, res, next) => {
    const { days = 7 } = req.query;

    const cases = await Case.findByLawyer(req.user._id);
    const caseIds = cases.map(c => c._id);

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + parseInt(days));

    const upcomingCases = await Case.find({
        _id: { $in: caseIds },
        nextHearingDate: {
            $gte: new Date(),
            $lte: futureDate
        }
    })
        .populate('leadLawyer', 'firstName lastName email')
        .sort({ nextHearingDate: 1 });

    sendSuccess(res, 200, 'Upcoming hearings retrieved successfully', {
        cases: upcomingCases,
        count: upcomingCases.length
    });
});

/**
 * @desc    Get case statistics
 * @route   GET /api/cases/statistics
 * @access  Private
 */
exports.getCaseStatistics = catchAsync(async (req, res, next) => {
    const userCases = await Case.findByLawyer(req.user._id);

    const statistics = {
        total: userCases.length,
        byStatus: {},
        byType: {},
        byPriority: {},
        active: 0,
        archived: 0,
        upcomingHearings: 0
    };

    // Calculate statistics
    userCases.forEach(caseData => {
        // By status
        statistics.byStatus[caseData.caseStatus] =
            (statistics.byStatus[caseData.caseStatus] || 0) + 1;

        // By type
        statistics.byType[caseData.caseType] =
            (statistics.byType[caseData.caseType] || 0) + 1;

        // By priority
        statistics.byPriority[caseData.priority] =
            (statistics.byPriority[caseData.priority] || 0) + 1;

        // Active vs archived
        if (caseData.isArchived) {
            statistics.archived += 1;
        } else {
            statistics.active += 1;
        }

        // Upcoming hearings (next 7 days)
        if (caseData.nextHearingDate) {
            const daysUntil = Math.floor(
                (caseData.nextHearingDate - Date.now()) / (1000 * 60 * 60 * 24)
            );
            if (daysUntil >= 0 && daysUntil <= 7) {
                statistics.upcomingHearings += 1;
            }
        }
    });

    sendSuccess(res, 200, 'Statistics retrieved successfully', { statistics });
});

module.exports = exports;
