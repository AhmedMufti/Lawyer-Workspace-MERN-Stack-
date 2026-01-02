const express = require('express');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const { sendSuccess, sendError } = require('../utils/responseFormatter');

const router = express.Router();

/**
 * @desc    Search user by email
 * @route   GET /api/users/search
 * @access  Protected
 */
router.get('/search', protect, async (req, res) => {
    try {
        const { email } = req.query;

        if (!email) {
            return sendError(res, 400, 'Email query parameter is required');
        }

        const user = await User.findOne({ email: email.toLowerCase() })
            .select('_id firstName lastName email role');

        if (!user) {
            return sendError(res, 404, 'No user found with this email');
        }

        sendSuccess(res, 200, 'User found', { user });
    } catch (error) {
        console.error('Search user error:', error);
        sendError(res, 500, 'Error searching for user');
    }
});

module.exports = router;
