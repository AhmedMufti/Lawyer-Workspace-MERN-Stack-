const { sendError } = require('../utils/responseFormatter');

/**
 * Validation Middleware Factory
 * Creates middleware to validate request data against Joi schema
 * 
 * @param {Object} schema - Joi validation schema
 * @param {String} property - Request property to validate ('body', 'query', 'params')
 * @returns {Function} - Express middleware function
 */
const validate = (schema, property = 'body') => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req[property], {
            abortEarly: false, // Return all errors, not just the first one
            stripUnknown: true // Remove unknown keys from validated data
        });

        if (error) {
            // Format validation errors
            const errors = error.details.map(detail => ({
                field: detail.path.join('.'),
                message: detail.message
            }));

            return sendError(
                res,
                400,
                'Validation failed',
                errors
            );
        }

        // Replace request data with validated and sanitized data
        req[property] = value;
        next();
    };
};

module.exports = validate;
