const jwt = require('jsonwebtoken');
const crypto = require('crypto');

/**
 * JWT Utility Functions for Token Management
 */

/**
 * Generate Access Token (short-lived)
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @returns {String} - JWT access token
 */
const generateAccessToken = (userId, role) => {
    return jwt.sign(
        {
            id: userId,
            role,
            type: 'access'
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m'
        }
    );
};

/**
 * Generate Refresh Token (long-lived)
 * @param {String} userId - User ID
 * @returns {String} - JWT refresh token
 */
const generateRefreshToken = (userId) => {
    return jwt.sign(
        {
            id: userId,
            type: 'refresh'
        },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
        }
    );
};

/**
 * Generate both access and refresh tokens
 * @param {String} userId - User ID
 * @param {String} role - User role
 * @returns {Object} - Object containing both tokens
 */
const generateTokenPair = (userId, role) => {
    return {
        accessToken: generateAccessToken(userId, role),
        refreshToken: generateRefreshToken(userId)
    };
};

/**
 * Verify JWT token
 * @param {String} token - JWT token to verify
 * @param {String} type - Token type ('access' or 'refresh')
 * @returns {Object} - Decoded token payload
 * @throws {Error} - If token is invalid or expired
 */
const verifyToken = (token, type = 'access') => {
    try {
        const secret = type === 'refresh'
            ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
            : process.env.JWT_SECRET;

        const decoded = jwt.verify(token, secret);

        // Verify token type matches
        if (decoded.type !== type) {
            throw new Error(`Invalid token type. Expected ${type}, got ${decoded.type}`);
        }

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new Error('Token has expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new Error('Invalid token');
        } else {
            throw error;
        }
    }
};

/**
 * Generate password reset token
 * @returns {Object} - Object containing token and hashed token
 */
const generatePasswordResetToken = () => {
    // Generate random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Hash token for storage in database
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    return {
        token: resetToken,
        hashedToken,
        expires: Date.now() + 10 * 60 * 1000 // 10 minutes
    };
};

/**
 * Generate email verification token
 * @returns {Object} - Object containing token and hashed token
 */
const generateEmailVerificationToken = () => {
    // Generate random token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Hash token for storage in database
    const hashedToken = crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex');

    return {
        token: verificationToken,
        hashedToken,
        expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    };
};

/**
 * Hash a token using SHA256
 * @param {String} token - Token to hash
 * @returns {String} - Hashed token
 */
const hashToken = (token) => {
    return crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
};

/**
 * Extract token from Authorization header
 * @param {String} authHeader - Authorization header value
 * @returns {String|null} - Extracted token or null
 */
const extractTokenFromHeader = (authHeader) => {
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.substring(7);
    }
    return null;
};

/**
 * Set token cookie options
 * @param {Boolean} rememberMe - Whether to use long-lived cookie
 * @returns {Object} - Cookie options
 */
const getTokenCookieOptions = (rememberMe = false) => {
    return {
        httpOnly: true, // Prevents JavaScript access (XSS protection)
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: rememberMe
            ? 7 * 24 * 60 * 60 * 1000 // 7 days
            : 24 * 60 * 60 * 1000  // 1 day
    };
};

module.exports = {
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    verifyToken,
    generatePasswordResetToken,
    generateEmailVerificationToken,
    hashToken,
    extractTokenFromHeader,
    getTokenCookieOptions
};
