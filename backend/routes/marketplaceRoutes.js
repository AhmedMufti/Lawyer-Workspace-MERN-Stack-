const express = require('express');
const marketplaceController = require('../controllers/marketplaceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * LAWYER PROFILES
 */

// Search profiles (public)
router.get('/profiles/search', marketplaceController.searchProfiles);

// Get all profiles & create/update own profile
router.route('/profiles')
    .get(marketplaceController.getProfiles)
    .post(protect, restrictTo('lawyer'), marketplaceController.createOrUpdateProfile);

// Get profile by ID
router.get('/profiles/:id', marketplaceController.getProfileById);

/**
 * MARKETPLACE ITEMS
 */

// Search items (public)
router.get('/items/search', marketplaceController.searchItems);

// Get all items & create item
router.route('/items')
    .get(marketplaceController.getItems)
    .post(protect, marketplaceController.createItem);

/**
 * REVIEWS
 */

// Create review
router.post('/reviews', protect, marketplaceController.createReview);

// Get reviews for target
router.get('/reviews/:reviewType/:targetId', marketplaceController.getReviews);

module.exports = router;
