console.log('ROOM ROUTES LOADED');

const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    updateProfileSchema
} = require('../validators/authValidators');

const router = express.Router();

/**
 * Public Routes
 */


// Register
router.post(
    '/register',
    validate(registerSchema),
    authController.register
);

// Login
router.post(
    '/login',
    validate(loginSchema),
    authController.login
);

// Refresh token
router.post('/refresh', authController.refreshToken);

// Verify email
router.get('/verify-email/:token', authController.verifyEmail);

// Resend verification email
router.post('/resend-verification', authController.resendVerification);

// Forgot password
router.post(
    '/forgot-password',
    validate(forgotPasswordSchema),
    authController.forgotPassword
);

// Reset password
router.post(
    '/reset-password/:token',
    validate(resetPasswordSchema),
    authController.resetPassword
);

/**
 * Protected Routes (require authentication)
 */

// Logout
// Logout (Public to allow clearing cookies even if token expired)
router.post('/logout', authController.logout);

// Change password
router.post(
    '/change-password',
    protect,
    validate(changePasswordSchema),
    authController.changePassword
);

// Get current user
router.get('/me', protect, authController.getMe);

// Update current user
router.patch(
    '/me',
    protect,
    validate(updateProfileSchema),
    authController.updateMe
);

module.exports = router;
