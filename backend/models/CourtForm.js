const mongoose = require('mongoose');

const courtFormSchema = new mongoose.Schema(
    {
        // Form Identification
        formNumber: {
            type: String,
            required: [true, 'Form number is required'],
            unique: true,
            trim: true,
            uppercase: true,
            index: true
        },
        formTitle: {
            type: String,
            required: [true, 'Form title is required'],
            trim: true,
            index: true
        },

        // Classification
        category: {
            type: String,
            enum: {
                values: [
                    'Civil Procedure',
                    'Criminal Procedure',
                    'Family Courts',
                    'Revenue Courts',
                    'Labor Courts',
                    'Banking Courts',
                    'Consumer Courts',
                    'Service Tribunals',
                    'High Court',
                    'Supreme Court',
                    'Other'
                ],
                message: '{VALUE} is not a valid category'
            },
            required: true,
            index: true
        },
        subcategory: {
            type: String,
            trim: true
        },

        // Purpose & Usage
        purpose: {
            type: String,
            required: [true, 'Purpose is required'],
            maxlength: 1000
        },
        instructions: {
            type: String,
            maxlength: 5000
        },
        whenToUse: {
            type: String,
            maxlength: 1000
        },

        // Legal Reference
        relatedAct: {
            type: String,
            trim: true
        },
        relatedRule: {
            type: String,
            trim: true
        },
        relatedOrder: {
            type: String,
            trim: true
        },

        // Form Details
        isFillable: {
            type: Boolean,
            default: true
        },
        requiredDocuments: [{
            type: String,
            trim: true
        }],
        fees: {
            courtFee: Number,
            stampPaper: Number,
            otherCharges: Number,
            totalEstimate: Number
        },

        // Files
        pdfUrl: String,
        pdfPath: {
            type: String,
            required: [true, 'PDF path is required']
        },
        wordDocPath: String,
        fillablePdfPath: String,
        sampleFilledPath: String,

        // Metadata
        language: {
            type: String,
            enum: ['English', 'Urdu', 'Both'],
            default: 'English'
        },
        jurisdiction: {
            type: String,
            enum: ['Federal', 'Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'All'],
            default: 'All',
            index: true
        },

        // Status
        status: {
            type: String,
            enum: ['Active', 'Obsolete', 'Revised'],
            default: 'Active',
            index: true
        },
        revisedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CourtForm'
        },
        lastRevisionDate: Date,

        // Search Keywords
        keywords: [{
            type: String,
            trim: true,
            lowercase: true,
            index: true
        }],
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],

        // Analytics
        viewCount: {
            type: Number,
            default: 0
        },
        downloadCount: {
            type: Number,
            default: 0
        },

        // User Contribution
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        isVerified: {
            type: Boolean,
            default: false
        },

        // Soft Delete
        isDeleted: {
            type: Boolean,
            default: false,
            select: false
        }
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Text index
courtFormSchema.index({
    formTitle: 'text',
    purpose: 'text',
    instructions: 'text',
    keywords: 'text'
});

// Compound indexes
courtFormSchema.index({ category: 1, status: 1 });
courtFormSchema.index({ jurisdiction: 1, category: 1 });

// Pre-save middleware to calculate total fees
courtFormSchema.pre('save', function (next) {
    if (this.fees) {
        this.fees.totalEstimate =
            (this.fees.courtFee || 0) +
            (this.fees.stampPaper || 0) +
            (this.fees.otherCharges || 0);
    }
    next();
});

// Instance methods
courtFormSchema.methods.incrementViewCount = async function () {
    this.viewCount += 1;
    await this.save({ validateBeforeSave: false });
};

courtFormSchema.methods.incrementDownloadCount = async function () {
    this.downloadCount += 1;
    await this.save({ validateBeforeSave: false });
};

// Static methods
courtFormSchema.statics.searchForms = function (query, category = null) {
    const searchRegex = new RegExp(query, 'i');
    const searchQuery = {
        $or: [
            { formTitle: searchRegex },
            { purpose: searchRegex },
            { instructions: searchRegex },
            { keywords: searchRegex },
            { formNumber: searchRegex }
        ],
        status: 'Active',
        isDeleted: false
    };

    if (category) {
        searchQuery.category = category;
    }

    return this.find(searchQuery).sort({ formNumber: 1 });
};

courtFormSchema.statics.findByCategory = function (category) {
    return this.find({
        category,
        status: 'Active',
        isDeleted: false
    }).sort({ formNumber: 1 });
};

// Query middleware
courtFormSchema.pre(/^find/, function (next) {
    if (!this.getQuery().isDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});

const CourtForm = mongoose.model('CourtForm', courtFormSchema);

module.exports = CourtForm;
