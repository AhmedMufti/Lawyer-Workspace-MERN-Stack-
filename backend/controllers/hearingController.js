const Hearing = require('../models/Hearing');
const Case = require('../models/Case');
const Notification = require('../models/Notification');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendPaginated } = require('../utils/responseFormatter');

/**
 * @desc    Schedule new hearing
 * @route   POST /api/hearings/:caseId
 * @access  Private
 */
exports.scheduleHearing = catchAsync(async (req, res, next) => {
    const { caseId } = req.params;

    // Verify case exists
    const caseData = await Case.findById(caseId);
    if (!caseData) {
        return next(new AppError('Case not found', 404));
    }

    // Check if user has access
    if (!caseData.canAccess(req.user._id) && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to schedule hearings for this case', 403));
    }

    // Create hearing
    const hearing = await Hearing.create({
        ...req.body,
        case: caseId,
        createdBy: req.user._id
    });

    // Update case next hearing date
    await Case.findByIdAndUpdate(caseId, {
        nextHearingDate: req.body.scheduledDate
    });

    // Create notifications for team members
    const teamMembers = [
        caseData.leadLawyer,
        ...caseData.associatedLawyers.map(al => al.lawyer),
        ...caseData.clerks
    ];

    // Remove duplicates
    const uniqueMembers = [...new Set(teamMembers.map(id => id.toString()))];

    // Create hearing reminder notifications
    for (const memberId of uniqueMembers) {
        await Notification.createHearingReminder(
            hearing._id,
            caseId,
            memberId,
            new Date(req.body.scheduledDate)
        );
    }

    await hearing.populate('createdBy', 'firstName lastName email');

    sendSuccess(res, 201, 'Hearing scheduled successfully', { hearing });
});

/**
 * @desc    Get hearings for a case
 * @route   GET /api/hearings/case/:caseId
 * @access  Private
 */
exports.getCaseHearings = catchAsync(async (req, res, next) => {
    const { caseId } = req.params;
    const { page = 1, limit = 20, status } = req.query;

    // Verify case and access
    const caseData = await Case.findById(caseId);
    if (!caseData) {
        return next(new AppError('Case not found', 404));
    }

    if (!caseData.canAccess(req.user._id) && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to view hearings for this case', 403));
    }

    // Build query
    const query = { case: caseId };
    if (status) query.status = status;

    // Execute query
    const skip = (page - 1) * limit;
    const hearings = await Hearing.find(query)
        .populate('createdBy', 'firstName lastName')
        .sort({ scheduledDate: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Hearing.countDocuments(query);

    sendPaginated(res, 200, 'Hearings retrieved successfully', hearings, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

/**
 * @desc    Get hearing by ID
 * @route   GET /api/hearings/:id
 * @access  Private
 */
exports.getHearingById = catchAsync(async (req, res, next) => {
    const hearing = await Hearing.findById(req.params.id)
        .populate('case', 'caseNumber caseTitle leadLawyer')
        .populate('createdBy', 'firstName lastName email')
        .populate('attendees.person', 'firstName lastName email')
        .populate('tasksAssigned.assignedTo', 'firstName lastName email');

    if (!hearing) {
        return next(new AppError('Hearing not found', 404));
    }

    // Check access through case
    await hearing.populate('case.leadLawyer case.associatedLawyers.lawyer case.clerks');

    const hasAccess = hearing.case.canAccess(req.user._id);
    if (!hasAccess && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to view this hearing', 403));
    }

    sendSuccess(res, 200, 'Hearing retrieved successfully', { hearing });
});

/**
 * @desc    Update hearing
 * @route   PATCH /api/hearings/:id
 * @access  Private
 */
exports.updateHearing = catchAsync(async (req, res, next) => {
    const hearing = await Hearing.findById(req.params.id).populate('case');

    if (!hearing) {
        return next(new AppError('Hearing not found', 404));
    }

    // Check if user has access
    const isLeadLawyer = hearing.case.leadLawyer.toString() === req.user._id.toString();
    const isCreator = hearing.createdBy.toString() === req.user._id.toString();

    if (!isLeadLawyer && !isCreator && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to update this hearing', 403));
    }

    // Don't allow changing case or hearing number
    delete req.body.case;
    delete req.body.hearingNumber;

    // Update hearing
    Object.assign(hearing, req.body);
    hearing.updatedBy = req.user._id;
    await hearing.save();

    // If next hearing date is updated, update case
    if (req.body.nextHearingDate) {
        await Case.findByIdAndUpdate(hearing.case._id, {
            nextHearingDate: req.body.nextHearingDate
        });
    }

    await hearing.populate('updatedBy', 'firstName lastName');

    sendSuccess(res, 200, 'Hearing updated successfully', { hearing });
});

/**
 * @desc    Add proceedings to hearing
 * @route   POST /api/hearings/:id/proceedings
 * @access  Private
 */
exports.addProceedings = catchAsync(async (req, res, next) => {
    const { proceedings, orderSheet, arguments, evidencePresented } = req.body;

    const hearing = await Hearing.findById(req.params.id).populate('case');

    if (!hearing) {
        return next(new AppError('Hearing not found', 404));
    }

    // Check access
    const hasAccess = hearing.case.canAccess(req.user._id);
    if (!hasAccess && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to add proceedings', 403));
    }

    // Update proceedings
    if (proceedings) hearing.proceedings = proceedings;
    if (orderSheet) hearing.orderSheet = orderSheet;
    if (arguments) hearing.arguments = arguments;
    if (evidencePresented) hearing.evidencePresented = evidencePresented;

    hearing.updatedBy = req.user._id;
    await hearing.save();

    sendSuccess(res, 200, 'Proceedings added successfully', { hearing });
});

/**
 * @desc    Mark hearing as completed
 * @route   POST /api/hearings/:id/complete
 * @access  Private
 */
exports.completeHearing = catchAsync(async (req, res, next) => {
    const hearing = await Hearing.findById(req.params.id).populate('case');

    if (!hearing) {
        return next(new AppError('Hearing not found', 404));
    }

    // Check if user can complete
    const isLeadLawyer = hearing.case.leadLawyer.toString() === req.user._id.toString();

    if (!isLeadLawyer && req.user.role !== 'admin') {
        return next(new AppError('Only the lead lawyer can mark hearing as completed', 403));
    }

    await hearing.markCompleted(req.user._id);

    sendSuccess(res, 200, 'Hearing marked as completed', { hearing });
});

/**
 * @desc    Adjourn hearing
 * @route   POST /api/hearings/:id/adjourn
 * @access  Private
 */
exports.adjournHearing = catchAsync(async (req, res, next) => {
    const { reason, nextHearingDate } = req.body;

    if (!nextHearingDate) {
        return next(new AppError('Next hearing date is required', 400));
    }

    const hearing = await Hearing.findById(req.params.id).populate('case');

    if (!hearing) {
        return next(new AppError('Hearing not found', 404));
    }

    // Check permission
    const isLeadLawyer = hearing.case.leadLawyer.toString() === req.user._id.toString();

    if (!isLeadLawyer && req.user.role !== 'admin') {
        return next(new AppError('Only the lead lawyer can adjourn hearing', 403));
    }

    await hearing.adjourn(reason, new Date(nextHearingDate), req.user._id);

    sendSuccess(res, 200, 'Hearing adjourned successfully', { hearing });
});

/**
 * @desc    Get upcoming hearings for user
 * @route   GET /api/hearings/upcoming
 * @access  Private
 */
exports.getUpcomingHearings = catchAsync(async (req, res, next) => {
    const { days = 7 } = req.query;

    // Get cases user has access to
    const cases = await Case.findByLawyer(req.user._id);
    const caseIds = cases.map(c => c._id);

    // Find upcoming hearings
    const hearings = await Hearing.findUpcoming(parseInt(days))
        .where('case').in(caseIds)
        .populate('case', 'caseNumber caseTitle')
        .populate('createdBy', 'firstName lastName');

    sendSuccess(res, 200, 'Upcoming hearings retrieved successfully', {
        hearings,
        count: hearings.length
    });
});

/**
 * @desc    Get today's hearings
 * @route   GET /api/hearings/today
 * @access  Private
 */
exports.getTodayHearings = catchAsync(async (req, res, next) => {
    // Get cases user has access to
    const cases = await Case.findByLawyer(req.user._id);
    const caseIds = cases.map(c => c._id);

    // Find today's hearings
    const hearings = await Hearing.findToday()
        .where('case').in(caseIds)
        .populate('case', 'caseNumber caseTitle court')
        .populate('createdBy', 'firstName lastName');

    sendSuccess(res, 200, "Today's hearings retrieved successfully", {
        hearings,
        count: hearings.length
    });
});

/**
 * @desc    Delete hearing
 * @route   DELETE /api/hearings/:id
 * @access  Private
 */
exports.deleteHearing = catchAsync(async (req, res, next) => {
    const hearing = await Hearing.findById(req.params.id).populate('case');

    if (!hearing) {
        return next(new AppError('Hearing not found', 404));
    }

    // Check permission
    const isLeadLawyer = hearing.case.leadLawyer.toString() === req.user._id.toString();
    const isCreator = hearing.createdBy.toString() === req.user._id.toString();

    if (!isLeadLawyer && !isCreator && req.user.role !== 'admin') {
        return next(new AppError('You do not have permission to delete this hearing', 403));
    }

    // Soft delete
    hearing.isDeleted = true;
    hearing.deletedAt = Date.now();
    await hearing.save();

    sendSuccess(res, 200, 'Hearing deleted successfully');
});

module.exports = exports;
