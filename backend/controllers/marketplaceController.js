const LawyerProfile = require('../models/LawyerProfile');
const MarketplaceItem = require('../models/MarketplaceItem');
const Review = require('../models/Review');
const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendPaginated } = require('../utils/responseFormatter');

/**
 * LAWYER PROFILE CONTROLLERS
 */

// @desc    Create/Update lawyer profile
// @route   POST /api/marketplace/profile
// @access  Private (Lawyers only)
exports.createOrUpdateProfile = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'lawyer') {
        return next(new AppError('Only lawyers can create profiles', 403));
    }

    let profile = await LawyerProfile.findOne({ user: req.user._id });

    if (profile) {
        // Update existing
        Object.assign(profile, req.body);
        await profile.save();
    } else {
        // Create new
        profile = await LawyerProfile.create({
            ...req.body,
            user: req.user._id
        });
    }

    await profile.populate('user', 'firstName lastName email phone');
    sendSuccess(res, profile ? 200 : 201, 'Profile saved successfully', { profile });
});

// @desc    Get current lawyer profile
// @route   GET /api/marketplace/profiles/me
// @access  Private (Lawyers only)
exports.getMyProfile = catchAsync(async (req, res, next) => {
    if (req.user.role !== 'lawyer') {
        return next(new AppError('Only lawyers have profiles', 403));
    }

    const profile = await LawyerProfile.findOne({ user: req.user._id })
        .populate('user', 'firstName lastName email phone');

    if (!profile) {
        return next(new AppError('Profile not found', 404));
    }

    sendSuccess(res, 200, 'Profile retrieved', { profile });
});

// @desc    Get lawyer profiles
// @route   GET /api/marketplace/profiles
// @access  Public
exports.getProfiles = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20, city, specialization, minExperience, isPremium, minRating } = req.query;

    const filters = {};
    if (city) filters.city = city;
    if (specialization) filters.specialization = specialization;
    if (minExperience) filters.minExperience = minExperience;
    if (isPremium) filters.isPremium = isPremium;
    if (minRating) filters.minRating = minRating;

    const skip = (page - 1) * limit;
    const profiles = await LawyerProfile.searchProfiles(null, filters)
        .skip(skip)
        .limit(parseInt(limit));

    const total = await LawyerProfile.countDocuments({ isPubliclyVisible: true });

    sendPaginated(res, 200, 'Profiles retrieved successfully', profiles, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

// @desc    Search lawyer profiles
// @route   GET /api/marketplace/profiles/search
// @access  Public
exports.searchProfiles = catchAsync(async (req, res, next) => {
    const { query, page = 1, limit = 20, ...filters } = req.query;

    let userIds = [];
    if (query) {
        const users = await User.find({
            $or: [
                { firstName: { $regex: query, $options: 'i' } },
                { lastName: { $regex: query, $options: 'i' } }
            ]
        }).select('_id');
        userIds = users.map(u => u._id);
    }

    const skip = (page - 1) * limit;
    const profiles = await LawyerProfile.searchProfiles(query, filters, userIds)
        .skip(skip)
        .limit(parseInt(limit));

    sendPaginated(res, 200, 'Search results retrieved', profiles, {
        page: parseInt(page),
        limit: parseInt(limit),
        total: profiles.length
    });
});

// @desc    Get profile by ID
// @route   GET /api/marketplace/profiles/:id
// @access  Public
exports.getProfileById = catchAsync(async (req, res, next) => {
    const profile = await LawyerProfile.findById(req.params.id)
        .populate('user', 'firstName lastName email phone');

    if (!profile) {
        return next(new AppError('Profile not found', 404));
    }

    await profile.incrementViews();
    sendSuccess(res, 200, 'Profile retrieved', { profile });
});

/**
 * MARKETPLACE ITEM CONTROLLERS
 */

// @desc    Create marketplace item
// @route   POST /api/marketplace/items
// @access  Private
exports.createItem = catchAsync(async (req, res, next) => {
    const item = await MarketplaceItem.create({
        ...req.body,
        seller: req.user._id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    await item.populate('seller', 'firstName lastName phone email');
    sendSuccess(res, 201, 'Item created successfully', { item });
});

// @desc    Get marketplace items
// @route   GET /api/marketplace/items
// @access  Public
exports.getItems = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20, category, city, isFree } = req.query;

    const query = { status: 'Active' };
    if (category) query.category = category;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (isFree) query.isFree = isFree === 'true';

    const skip = (page - 1) * limit;
    const items = await MarketplaceItem.find(query)
        .populate('seller', 'firstName lastName phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await MarketplaceItem.countDocuments(query);

    sendPaginated(res, 200, 'Items retrieved', items, { page: parseInt(page), limit: parseInt(limit), total });
});

// @desc    Search items
// @route   GET /api/marketplace/items/search
// @access  Public
exports.searchItems = catchAsync(async (req, res, next) => {
    const { query, page = 1, limit = 20, ...filters } = req.query;

    const skip = (page - 1) * limit;
    const items = await MarketplaceItem.searchItems(query, filters)
        .skip(skip)
        .limit(parseInt(limit));

    sendPaginated(res, 200, 'Search results', items, { page: parseInt(page), limit: parseInt(limit), total: items.length });
});

/**
 * REVIEW CONTROLLERS
 */

// @desc    Create review
// @route   POST /api/marketplace/reviews
// @access  Private
exports.createReview = catchAsync(async (req, res, next) => {
    const review = await Review.create({
        ...req.body,
        reviewer: req.user._id
    });

    await review.populate('reviewer', 'firstName lastName');
    sendSuccess(res, 201, 'Review submitted', { review });
});

// @desc    Get reviews
// @route   GET /api/marketplace/reviews/:reviewType/:targetId
// @access  Public
exports.getReviews = catchAsync(async (req, res, next) => {
    const { reviewType, targetId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (page - 1) * limit;
    const reviews = await Review.find({
        reviewType,
        targetId,
        status: 'Approved'
    })
        .populate('reviewer', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Review.countDocuments({ reviewType, targetId, status: 'Approved' });

    sendPaginated(res, 200, 'Reviews retrieved', reviews, { page: parseInt(page), limit: parseInt(limit), total });
});

module.exports = exports;
