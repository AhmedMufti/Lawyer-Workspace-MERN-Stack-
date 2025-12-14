/**
 * Standard API Response Formatter
 * Ensures consistent response structure across all endpoints
 */

/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Object} data - Response data
 */
const sendSuccess = (res, statusCode, message, data = null) => {
    const response = {
        success: true,
        message,
        ...(data && { data })
    };

    res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 * @param {Array} errors - Validation errors (optional)
 */
const sendError = (res, statusCode, message, errors = null) => {
    const response = {
        success: false,
        message,
        ...(errors && { errors })
    };

    res.status(statusCode).json(response);
};

/**
 * Send paginated response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Success message
 * @param {Array} data - Response data array
 * @param {Object} pagination - Pagination metadata
 */
const sendPaginated = (res, statusCode, message, data, pagination) => {
    const response = {
        success: true,
        message,
        data,
        pagination: {
            page: pagination.page,
            limit: pagination.limit,
            total: pagination.total,
            totalPages: Math.ceil(pagination.total / pagination.limit),
            hasMore: pagination.page < Math.ceil(pagination.total / pagination.limit)
        }
    };

    res.status(statusCode).json(response);
};

module.exports = {
    sendSuccess,
    sendError,
    sendPaginated
};
