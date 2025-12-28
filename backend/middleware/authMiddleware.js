const User = require('../models/User');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { verifyToken, extractTokenFromHeader } = require('../utils/jwtUtils');

/**
 * Middleware to protect routes - requires authentication
 */
exports.protect = catchAsync(async (req, res, next) => {
    // 1) Get token from header or cookie
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader) {
        token = extractTokenFromHeader(authHeader);
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        return next(
            new AppError('You are not logged in. Please log in to access this resource.', 401)
        );
    }

    // 2) Verify token
    let decoded;
    try {
        decoded = verifyToken(token, 'access');
    } catch (error) {
        return next(new AppError(error.message, 401));
    }

    // 3) Check if user still exists
    const user = await User.findById(decoded.id).select('+password');
    if (!user) {
        return next(
            new AppError('The user belonging to this token no longer exists.', 401)
        );
    }

    // 4) Check if user is deleted
    if (user.isDeleted) {
        return next(
            new AppError('This account has been deleted.', 401)
        );
    }

    // 5) Check if account is active (Auto-activate if pending)
    if (user.accountStatus === 'pending_verification') {
        user.accountStatus = 'active';
        user.isEmailVerified = true;
        await user.save({ validateBeforeSave: false });
    } else if (user.accountStatus !== 'active') {
        return next(
            new AppError(`Account is ${user.accountStatus}. Please contact support.`, 403)
        );
    }

    // 6) Check if account is locked
    if (user.isLocked) {
        const lockTimeRemaining = Math.ceil((user.lockUntil - Date.now()) / 1000 / 60);
        return next(
            new AppError(
                `Account is locked due to multiple failed login attempts. Please try again in ${lockTimeRemaining} minutes.`,
                423
            )
        );
    }

    // 7) Check if password was changed after token was issued
    if (user.changedPasswordAfter(decoded.iat)) {
        return next(
            new AppError('Password was recently changed. Please log in again.', 401)
        );
    }

    // 8) Update last active timestamp
    user.lastActive = Date.now();
    await user.save({ validateBeforeSave: false });

    // 9) Grant access to protected route
    req.user = user;
    next();
});

/**
 * Middleware to restrict access to specific roles
 * @param  {...String} roles - Allowed roles
 */
exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError('You do not have permission to perform this action.', 403)
            );
        }
        next();
    };
};

/**
 * Middleware to check subscription tier
 * @param  {...String} tiers - Required subscription tiers
 */
exports.requireSubscription = (...tiers) => {
    return (req, res, next) => {
        if (!req.user.subscriptionActive) {
            return next(
                new AppError('Your subscription has expired. Please renew to access this feature.', 403)
            );
        }

        if (!tiers.includes(req.user.subscriptionTier)) {
            return next(
                new AppError(
                    `This feature requires ${tiers.join(' or ')} subscription. Please upgrade your plan.`,
                    403
                )
            );
        }

        next();
    };
};

/**
 * Middleware to check if email is verified
 */
exports.requireEmailVerification = (req, res, next) => {
    if (!req.user.isEmailVerified) {
        return next(
            new AppError('Please verify your email address to access this feature.', 403)
        );
    }
    next();
};

/**
 * Middleware to check if bar license is verified (for lawyers)
 */
exports.requireBarVerification = (req, res, next) => {
    if (req.user.role === 'lawyer' && !req.user.isBarLicenseVerified) {
        return next(
            new AppError('Please verify your bar license to access this feature.', 403)
        );
    }
    next();
};

/**
 * Optional authentication - doesn't fail if no token
 * Useful for endpoints that behave differently for logged-in users
 */
exports.optionalAuth = catchAsync(async (req, res, next) => {
    // Try to get token
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader) {
        token = extractTokenFromHeader(authHeader);
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    // If no token, just continue without user
    if (!token) {
        return next();
    }

    // Try to verify token
    try {
        const decoded = verifyToken(token, 'access');
        const user = await User.findById(decoded.id);

        if (user && !user.isDeleted && user.accountStatus === 'active') {
            req.user = user;
        }
    } catch (error) {
        // Silently fail - just continue without user
    }

    next();
});

/**
 * Middleware to check if user owns the resource
 * Compares req.user.id with req.params.userId or req.params.id
 */
exports.checkOwnership = (paramName = 'id') => {
    return (req, res, next) => {
        const resourceUserId = req.params[paramName] || req.params.userId;

        if (!resourceUserId) {
            return next(new AppError('Resource ID not found in request', 400));
        }

        // Admin can access any resource
        if (req.user.role === 'admin') {
            return next();
        }

        // Check if user owns the resource
        if (req.user._id.toString() !== resourceUserId.toString()) {
            return next(
                new AppError('You do not have permission to access this resource.', 403)
            );
        }

        next();
    };
};
