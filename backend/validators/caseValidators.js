const Joi = require('joi');

/**
 * Validation Schemas for Case Management Routes
 */

// Create case validation
const createCaseSchema = Joi.object({
    caseNumber: Joi.string()
        .required()
        .trim()
        .uppercase()
        .max(100)
        .messages({
            'any.required': 'Case number is required',
            'string.max': 'Case number cannot exceed 100 characters'
        }),

    caseTitle: Joi.string()
        .required()
        .trim()
        .max(500)
        .messages({
            'any.required': 'Case title is required',
            'string.max': 'Case title cannot exceed 500 characters'
        }),

    caseType: Joi.string()
        .valid('Civil', 'Criminal', 'Family', 'Corporate', 'Constitutional', 'Tax', 'Labor', 'Property', 'Intellectual Property', 'Administrative', 'Other')
        .required()
        .messages({
            'any.required': 'Case type is required',
            'any.only': 'Invalid case type'
        }),

    priority: Joi.string()
        .valid('Low', 'Medium', 'High', 'Urgent')
        .default('Medium'),

    // Court information
    court: Joi.object({
        name: Joi.string().required().trim(),
        city: Joi.string().required().trim(),
        state: Joi.string().trim().allow(''),
        courtType: Joi.string().valid('Supreme Court', 'High Court', 'District Court', 'Sessions Court', 'Magistrate Court', 'Tribunal', 'Other').required(),
        courtNumber: Joi.string().allow(''),
        judge: Joi.string().trim().allow('')
    }).required().messages({
        'any.required': 'Court information is required'
    }),

    // Parties
    petitioner: Joi.object({
        name: Joi.string().required().trim(),
        contactNumber: Joi.string().allow(''),
        email: Joi.string().email().allow(''),
        address: Joi.object({
            street: Joi.string().allow(''),
            city: Joi.string().allow(''),
            state: Joi.string().allow(''),
            zipCode: Joi.string().allow('')
        }),
        cnic: Joi.string().allow('')
    }).required(),

    respondent: Joi.object({
        name: Joi.string().required().trim(),
        contactNumber: Joi.string().allow(''),
        email: Joi.string().email().allow(''),
        address: Joi.object({
            street: Joi.string().allow(''),
            city: Joi.string().allow(''),
            state: Joi.string().allow(''),
            zipCode: Joi.string().allow('')
        }),
        cnic: Joi.string().allow('')
    }).required(),

    additionalParties: Joi.array().items(
        Joi.object({
            role: Joi.string().valid('Co-Petitioner', 'Co-Respondent', 'Intervener', 'Witness', 'Other'),
            name: Joi.string().trim(),
            contactNumber: Joi.string().allow('')
        })
    ),

    // Dates
    filingDate: Joi.date()
        .required()
        .max('now')
        .messages({
            'any.required': 'Filing date is required',
            'date.max': 'Filing date cannot be in the future'
        }),

    firstHearingDate: Joi.date().min(Joi.ref('filingDate')),
    nextHearingDate: Joi.date(),
    expectedClosureDate: Joi.date(),

    // Details
    description: Joi.string().max(5000).allow(''),
    legalIssues: Joi.array().items(Joi.string().trim()),
    lawsInvolved: Joi.array().items(
        Joi.object({
            actName: Joi.string(),
            section: Joi.string(),
            articleNumber: Joi.string()
        })
    ),

    // Financial
    estimatedValue: Joi.number().min(0),
    courtFees: Joi.number().min(0).default(0),
    professionalFees: Joi.number().min(0).default(0),
    otherExpenses: Joi.number().min(0).default(0),

    // Associate lawyers
    associatedLawyers: Joi.array().items(
        Joi.object({
            lawyer: Joi.string().regex(/^[0-9a-fA-F]{24}$/), // MongoDB ObjectId
            role: Joi.string().valid('Senior Counsel', 'Junior Counsel', 'Assistant', 'Consultant')
        })
    ),

    clerks: Joi.array().items(
        Joi.string().regex(/^[0-9a-fA-F]{24}$/)
    ),

    // Visibility
    visibility: Joi.string().valid('Private', 'Team Only', 'Client Access', 'Public').default('Team Only'),
    tags: Joi.array().items(Joi.string().trim().lowercase()),
    category: Joi.string().allow('')
});

// Update case validation
const updateCaseSchema = Joi.object({
    caseTitle: Joi.string().trim().max(500),
    caseStatus: Joi.string().valid('Filed', 'Under Review', 'Admitted', 'In Progress', 'Hearing Scheduled', 'Judgment Reserved', 'Decided', 'Dismissed', 'Withdrawn', 'Settled', 'Archived'),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent'),
    court: Joi.object({
        name: Joi.string().trim(),
        city: Joi.string().trim(),
        state: Joi.string().trim().allow(''),
        courtType: Joi.string().valid('Supreme Court', 'High Court', 'District Court', 'Sessions Court', 'Magistrate Court', 'Tribunal', 'Other'),
        courtNumber: Joi.string().allow(''),
        judge: Joi.string().trim().allow('')
    }),
    nextHearingDate: Joi.date(),
    expectedClosureDate: Joi.date(),
    description: Joi.string().max(5000).allow(''),
    legalIssues: Joi.array().items(Joi.string().trim()),
    lawsInvolved: Joi.array().items(
        Joi.object({
            actName: Joi.string(),
            section: Joi.string(),
            articleNumber: Joi.string()
        })
    ),
    courtFees: Joi.number().min(0),
    professionalFees: Joi.number().min(0),
    otherExpenses: Joi.number().min(0),
    judgmentSummary: Joi.string().max(2000).allow(''),
    judgmentDate: Joi.date(),
    judgmentInFavor: Joi.string().valid('Petitioner', 'Respondent', 'Partial', 'N/A'),
    appealStatus: Joi.string().valid('Not Applicable', 'Appeal Filed', 'Appeal Pending', 'Appeal Decided'),
    visibility: Joi.string().valid('Private', 'Team Only', 'Client Access', 'Public'),
    tags: Joi.array().items(Joi.string().trim().lowercase()),
    category: Joi.string().allow('')
}).min(1).messages({
    'object.min': 'At least one field must be provided for update'
});

// Add lawyer to case validation
const addLawyerSchema = Joi.object({
    lawyerId: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'any.required': 'Lawyer ID is required',
            'string.pattern.base': 'Invalid lawyer ID format'
        }),
    role: Joi.string()
        .valid('Senior Counsel', 'Junior Counsel', 'Assistant', 'Consultant')
        .default('Junior Counsel')
});

// Add task validation
const addTaskSchema = Joi.object({
    task: Joi.string()
        .required()
        .max(500)
        .messages({
            'any.required': 'Task description is required',
            'string.max': 'Task description cannot exceed 500 characters'
        }),
    dueDate: Joi.date()
        .min('now')
        .required()
        .messages({
            'any.required': 'Due date is required',
            'date.min': 'Due date cannot be in the past'
        }),
    assignedTo: Joi.string()
        .regex(/^[0-9a-fA-F]{24}$/)
        .required()
        .messages({
            'any.required': 'Assigned user is required',
            'string.pattern.base': 'Invalid user ID format'
        })
});

// Case search validation
const searchCaseSchema = Joi.object({
    query: Joi.string().trim().allow(''),
    caseType: Joi.string().valid('Civil', 'Criminal', 'Family', 'Corporate', 'Constitutional', 'Tax', 'Labor', 'Property', 'Intellectual Property', 'Administrative', 'Other'),
    caseStatus: Joi.string().valid('Filed', 'Under Review', 'Admitted', 'In Progress', 'Hearing Scheduled', 'Judgment Reserved', 'Decided', 'Dismissed', 'Withdrawn', 'Settled', 'Archived'),
    city: Joi.string().trim(),
    fromDate: Joi.date(),
    toDate: Joi.date().min(Joi.ref('fromDate')),
    priority: Joi.string().valid('Low', 'Medium', 'High', 'Urgent'),
    tags: Joi.array().items(Joi.string()),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
});

module.exports = {
    createCaseSchema,
    updateCaseSchema,
    addLawyerSchema,
    addTaskSchema,
    searchCaseSchema
};
