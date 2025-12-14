const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendError } = require('../utils/responseFormatter');
const {
    generateTokenPair,
    generatePasswordResetToken,
    generateEmailVerificationToken,
    hashToken,
    verifyToken,
    getTokenCookieOptions
} = require('../utils/jwtUtils');

/**
  * @desc    Register a new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = catchAsync(async (req, res, next) => {
    const {
        email,
        password,
        firstName,
        lastName,
        phone,
        role,
        barLicenseNumber,
        barAssociation,
        yearsOfExperience
    } = req.body;

    // 1) Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return next(new AppError('Email already registered. Please use a different email or log in.', 400));
    }

    // 2) Check if bar license number is already registered (for lawyers)
    if (role === 'lawyer' && barLicenseNumber) {
        const existingBar = await User.findOne({ barLicenseNumber });
        if (existingBar) {
            return next(new AppError('Bar license number already registered.', 400));
        }
    }

    // 3) Create user object
    const userData = {
        email,
        password,
        firstName,
        lastName,
        phone,
        role
    };

    // Add lawyer-specific fields if role is lawyer
    if (role === 'lawyer') {
        userData.barLicenseNumber = barLicenseNumber;
        userData.barAssociation = barAssociation;
        if (yearsOfExperience !== undefined) {
            userData.yearsOfExperience = yearsOfExperience;
        }
    }

    // 4) Create new user
    const user = await User.create(userData);

    // 5) Generate email verification token
    const { token: verificationToken, hashedToken, expires } = generateEmailVerificationToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = expires;
    await user.save({ validateBeforeSave: false });

    // TODO: Send verification email
    // In production, queue this to a background job
    // await sendVerificationEmail(user.email, verificationToken);

    // 6) Generate tokens
    const tokens = generateTokenPair(user._id, user.role);

    // 7) Remove password from output
    user.password = undefined;

    // 8) Send response
    res.status(201).json({
        success: true,
        message: 'Registration successful. Please check your email to verify your account.',
        data: {
            user,
            ...tokens,
            verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
        }
    });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = catchAsync(async (req, res, next) => {
    const { email, password, rememberMe } = req.body;

    // 1) Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        return next(new AppError('Invalid email or password.', 401));
    }

    // 2) Check if account is locked
    if (user.isLocked) {
        const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
        return next(
            new AppError(
                `Account locked due to multiple failed login attempts. Try again in ${lockTimeRemaining} minutes.`,
                423
            )
        );
    }

    // 3) Check if password is correct
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        // Increment login attempts
        await user.incLoginAttempts();
        return next(new AppError('Invalid email or password.', 401));
    }

    // 4) Check account status
    if (user.accountStatus === 'suspended') {
        return next(new AppError('Account is suspended. Please contact support.', 403));
    }

    if (user.accountStatus === 'banned') {
        return next(new AppError('Account has been banned. Please contact support.', 403));
    }

    // 5) Reset login attempts on successful login
    if (user.loginAttempts > 0 || user.lockUntil) {
        await user.resetLoginAttempts();
    }

    // 6) Update last login
    user.lastLogin = Date.now();
    user.lastActive = Date.now();

    // Set account to active if it was pending verification
    if (user.accountStatus === 'pending_verification' && user.isEmailVerified) {
        user.accountStatus = 'active';
    }

    await user.save({ validateBeforeSave: false });

    // 7) Generate tokens
    const tokens = generateTokenPair(user._id, user.role);

    // 8) Set token in HTTP-only cookie
    const cookieOptions = getTokenCookieOptions(rememberMe);
    res.cookie('token', tokens.accessToken, cookieOptions);
    res.cookie('refreshToken', tokens.refreshToken, cookieOptions);

    // 9) Remove password from output
    user.password = undefined;

    // 10) Send response
    sendSuccess(res, 200, 'Login successful', {
        user,
        ...tokens
    });
});

/**
 * @desc    Logout user
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = catchAsync(async (req, res, next) => {
    // Clear cookies
    res.cookie('token', 'logged out', {
        expires: new Date(Date.now() + 1000),
        httpOnly: true
    });

    res.cookie('refreshToken', 'logged out', {
        expires: new Date(Date.now() + 1000),
        httpOnly: true
    });

    sendSuccess(res, 200, 'Logged out successfully');
});

/**
 * @desc    Refresh access token
 * @route   POST /api/auth/refresh
 * @access  Public
 */
exports.refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        return next(new AppError('Refresh token is required.', 400));
    }

    try {
        // Verify refresh token
        const decoded = verifyToken(refreshToken, 'refresh');

        // Get user
        const user = await User.findById(decoded.id);

        if (!user) {
            return next(new AppError('User not found.', 404));
        }

        if (user.accountStatus !== 'active') {
            return next(new AppError('Account is not active.', 403));
        }

        // Generate new tokens
        const tokens = generateTokenPair(user._id, user.role);

        sendSuccess(res, 200, 'Token refreshed successfully', tokens);
    } catch (error) {
        return next(new AppError(error.message, 401));
    }
});

/**
 * @desc    Verify email
 * @route   GET /api/auth/verify-email/:token
 * @access  Public
 */
exports.verifyEmail = catchAsync(async (req, res, next) => {
    const { token } = req.params;

    // Hash the token from params
    const hashedToken = hashToken(token);

    // Find user with this token and check if not expired
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError('Verification token is invalid or has expired.', 400));
    }

    // Update user
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;

    // Activate account if it was pending verification
    if (user.accountStatus === 'pending_verification') {
        user.accountStatus = 'active';
    }

    await user.save({ validateBeforeSave: false });

    sendSuccess(res, 200, 'Email verified successfully');
});

/**
 * @desc    Resend verification email
 * @route   POST /api/auth/resend-verification
 * @access  Public
 */
exports.resendVerification = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    if (!email) {
        return next(new AppError('Email is required.', 400));
    }

    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError('No user found with that email.', 404));
    }

    if (user.isEmailVerified) {
        return next(new AppError('Email is already verified.', 400));
    }

    // Generate new verification token
    const { token: verificationToken, hashedToken, expires } = generateEmailVerificationToken();
    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpires = expires;
    await user.save({ validateBeforeSave: false });

    // TODO: Send verification email
    // await sendVerificationEmail(user.email, verificationToken);

    sendSuccess(res, 200, 'Verification email sent successfully', {
        verificationToken: process.env.NODE_ENV === 'development' ? verificationToken : undefined
    });
});

/**
 * @desc    Forgot password
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = catchAsync(async (req, res, next) => {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
        return next(new AppError('No user found with that email address.', 404));
    }

    // Generate reset token
    const { token: resetToken, hashedToken, expires } = generatePasswordResetToken();
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expires;
    await user.save({ validateBeforeSave: false });

    // TODO: Send password reset email
    // await sendPasswordResetEmail(user.email, resetToken);

    sendSuccess(res, 200, 'Password reset token sent to your email', {
        resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
});

/**
 * @desc    Reset password
 * @route   POST /api/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = catchAsync(async (req, res, next) => {
    const { token } = req.params;
    const { password } = req.body;

    // Hash the token from params
    const hashedToken = hashToken(token);

    // Find user with this token and check if not expired
    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
        return next(new AppError('Reset token is invalid or has expired.', 400));
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();

    // Generate new tokens
    const tokens = generateTokenPair(user._id, user.role);

    sendSuccess(res, 200, 'Password reset successful', tokens);
});

/**
 * @desc    Change password (when logged in)
 * @route   POST /api/auth/change-password
 * @access  Private
 */
exports.changePassword = catchAsync(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check if current password is correct
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
        return next(new AppError('Current password is incorrect.', 401));
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Generate new tokens (invalidate old ones)
    const tokens = generateTokenPair(user._id, user.role);

    sendSuccess(res, 200, 'Password changed successfully', tokens);
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    sendSuccess(res, 200, 'User retrieved successfully', { user });
});

/**
 * @desc    Update current user profile
 * @route   PATCH /api/auth/me
 * @access  Private
 */
exports.updateMe = catchAsync(async (req, res, next) => {
    // Don't allow password update through this route
    if (req.body.password || req.body.confirmPassword) {
        return next(
            new AppError('This route is not for password updates. Use /change-password instead.', 400)
        );
    }

    // Don't allow role or subscription changes
    const restrictedFields = ['role', 'subscriptionTier', 'isEmailVerified', 'isBarLicenseVerified', 'accountStatus'];
    restrictedFields.forEach(field => {
        if (req.body[field]) {
            delete req.body[field];
        }
    });

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        req.body,
        {
            new: true,
            runValidators: true
        }
    );

    sendSuccess(res, 200, 'Profile updated successfully', { user: updatedUser });
});

module.exports = exports;
