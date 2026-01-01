const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const Poll = require('../models/Poll');
const Vote = require('../models/Vote');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendPaginated } = require('../utils/responseFormatter');

/**
 * CHAT ROOM CONTROLLERS
 */

// @desc    Get all chat rooms
// @route   GET /api/chat/rooms
// @access  Private
exports.getChatRooms = catchAsync(async (req, res, next) => {
    const { roomType, barAssociation } = req.query;

    const query = { isActive: true };
    if (roomType) query.roomType = roomType;
    if (barAssociation) query.barAssociation = barAssociation;

    // Filter by user's role and bar
    if (req.user.role === 'clerk') {
        query.allowedRoles = 'clerk';
    } else if (req.user.role === 'lawyer') {
        query.allowedRoles = 'lawyer';
    }

    const rooms = await ChatRoom.find(query)
        .sort({ lastMessageAt: -1 })
        .limit(50);

    sendSuccess(res, 200, 'Chat rooms retrieved', { rooms });
});

// @desc    Get room messages
// @route   GET /api/chat/rooms/:roomId/messages
// @access  Private
exports.getRoomMessages = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 50 } = req.query;

    const skip = (page - 1) * limit;
    const messages = await Message.find({
        room: req.params.roomId,
        isDeleted: false
    })
        .populate('sender', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    sendPaginated(res, 200, 'Messages retrieved', messages.reverse(), {
        page: parseInt(page),
        limit: parseInt(limit),
        total: messages.length
    });
});

/**
 * POLL/ELECTION CONTROLLERS
 */

// @desc    Create poll
// @route   POST /api/polls
// @access  Private
exports.createPoll = catchAsync(async (req, res, next) => {
    const poll = await Poll.create({
        ...req.body,
        createdBy: req.user._id
    });

    await poll.populate('createdBy', 'firstName lastName');
    sendSuccess(res, 201, 'Poll created', { poll });
});

// @desc    Get active polls
// @route   GET /api/polls
// @access  Public
exports.getPolls = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20, barAssociation, status = 'Active' } = req.query;

    const query = { status };
    if (barAssociation) query['targetAudience.barAssociation'] = barAssociation;

    console.log('Poll Query:', JSON.stringify(query));

    const skip = (page - 1) * limit;
    const polls = await Poll.find(query)
        .populate('createdBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    console.log('Polls Found:', polls.length);

    const total = await Poll.countDocuments(query);

    sendPaginated(res, 200, 'Polls retrieved', polls, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

// @desc    Get poll by ID
// @route   GET /api/polls/:id
// @access  Public
exports.getPollById = catchAsync(async (req, res, next) => {
    const poll = await Poll.findById(req.params.id)
        .populate('createdBy', 'firstName lastName');

    if (!poll) {
        return next(new AppError('Poll not found', 404));
    }

    sendSuccess(res, 200, 'Poll retrieved', { poll });
});

// @desc    Vote on poll
// @route   POST /api/polls/:id/vote
// @access  Private
exports.voteOnPoll = catchAsync(async (req, res, next) => {
    const { optionId } = req.body;
    const pollId = req.params.id;

    const poll = await Poll.findById(pollId);
    if (!poll) {
        return next(new AppError('Poll not found', 404));
    }

    if (poll.status !== 'Active') {
        return next(new AppError('Poll is not active', 400));
    }

    // Check if user already voted
    let vote = await Vote.findOne({ poll: pollId, voter: req.user._id });

    if (vote) {
        if (!poll.allowVoteChange) {
            return next(new AppError('Vote changing not allowed for this poll', 400));
        }
        // Change vote
        vote.previousVote = {
            optionId: vote.selectedOption,
            changedAt: Date.now()
        };
        vote.selectedOption = optionId;
        vote.changeCount += 1;
        await vote.save();
    } else {
        // New vote
        vote = await Vote.create({
            poll: pollId,
            voter: req.user._id,
            selectedOption: optionId
        });
    }

    sendSuccess(res, 200, 'Vote registered successfully', { vote });
});

// @desc    Get poll results
// @route   GET /api/polls/:id/results
// @access  Public
exports.getPollResults = catchAsync(async (req, res, next) => {
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
        return next(new AppError('Poll not found', 404));
    }

    poll.calculatePercentages();

    const results = {
        pollId: poll._id,
        title: poll.title,
        totalVotes: poll.totalVotes,
        uniqueVoters: poll.uniqueVoters,
        options: poll.options,
        status: poll.status
    };

    sendSuccess(res, 200, 'Results retrieved', { results });
});

module.exports = exports;
