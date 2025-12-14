const Joi = require('joi');

/**
 * Validation Schemas for Authentication Routes
 */

// Registration validation - SIMPLIFIED for easier registration
const registerSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .min(6)
        .max(128)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        }),

    firstName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .trim()
        .messages({
            'string.min': 'First name must be at least 2 characters',
            'any.required': 'First name is required'
        }),

    lastName: Joi.string()
        .min(2)
        .max(50)
        .required()
        .trim()
        .messages({
            'string.min': 'Last name must be at least 2 characters',
            'any.required': 'Last name is required'
        }),

    phone: Joi.string()
        .required()
        .messages({
            'any.required': 'Phone number is required'
        }),

    role: Joi.string()
        .valid('lawyer', 'litigant', 'clerk')
        .required()
        .messages({
            'any.only': 'Role must be either lawyer, litigant, or clerk',
            'any.required': 'Role is required'
        }),

    // Optional fields for lawyers
    barLicenseNumber: Joi.string().optional().allow(''),
    enrollmentDate: Joi.date().optional().allow(''),
    barAssociation: Joi.string().optional().allow(''),
    yearsOfExperience: Joi.number().optional().min(0).max(70)
});

// Login validation
const loginSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        }),

    password: Joi.string()
        .required()
        .messages({
            'any.required': 'Password is required'
        }),

    rememberMe: Joi.boolean().default(false)
});

// Forgot password validation
const forgotPasswordSchema = Joi.object({
    email: Joi.string()
        .email()
        .required()
        .lowercase()
        .trim()
        .messages({
            'string.email': 'Please provide a valid email address',
            'any.required': 'Email is required'
        })
});

// Reset password validation
const resetPasswordSchema = Joi.object({
    password: Joi.string()
        .min(6)
        .max(128)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'Password is required'
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref('password'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Password confirmation is required'
        })
});

// Change password validation
const changePasswordSchema = Joi.object({
    currentPassword: Joi.string()
        .required()
        .messages({
            'any.required': 'Current password is required'
        }),

    newPassword: Joi.string()
        .min(6)
        .max(128)
        .required()
        .messages({
            'string.min': 'Password must be at least 6 characters long',
            'any.required': 'New password is required'
        }),

    confirmPassword: Joi.string()
        .valid(Joi.ref('newPassword'))
        .required()
        .messages({
            'any.only': 'Passwords do not match',
            'any.required': 'Password confirmation is required'
        })
});

// Update profile validation
const updateProfileSchema = Joi.object({
    firstName: Joi.string()
        .min(2)
        .max(50)
        .trim(),

    lastName: Joi.string()
        .min(2)
        .max(50)
        .trim(),

    phone: Joi.string(),

    bio: Joi.string()
        .max(500)
        .allow(''),

    specializations: Joi.array()
        .items(Joi.string().trim())
        .max(10),

    firmName: Joi.string()
        .max(100)
        .allow(''),

    officeAddress: Joi.object({
        street: Joi.string().max(200),
        city: Joi.string().max(100),
        state: Joi.string().max(100),
        zipCode: Joi.string().max(20),
        country: Joi.string().max(100)
    }),

    preferredLanguage: Joi.string()
        .valid('en', 'ur', 'sd', 'ps', 'bal', 'ar', 'zh', 'fr', 'nl'),

    emailNotifications: Joi.boolean(),
    smsNotifications: Joi.boolean()
});

module.exports = {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    changePasswordSchema,
    updateProfileSchema
};
