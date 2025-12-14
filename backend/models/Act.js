const mongoose = require('mongoose');

const actSchema = new mongoose.Schema(
    {
        // Act Identification
        title: {
            type: String,
            required: [true, 'Act title is required'],
            trim: true,
            index: true
        },
        shortTitle: {
            type: String,
            trim: true,
            index: true
        },
        year: {
            type: Number,
            required: [true, 'Year is required'],
            min: 1800,
            max: 2100,
            index: true
        },
        actNumber: {
            type: String,
            trim: true
        },

        // Classification
        category: {
            type: String,
            enum: {
                values: [
                    'Constitutional Law',
                    'Criminal Law',
                    'Civil Law',
                    'Family Law',
                    'Corporate Law',
                    'Tax Law',
                    'Labor Law',
                    'Property Law',
                    'Administrative Law',
                    'Other'
                ],
                message: '{VALUE} is not a valid category'
            },
            required: true,
            index: true
        },
        jurisdiction: {
            type: String,
            enum: ['Federal', 'Punjab', 'Sindh', 'KPK', 'Balochistan', 'Islamabad', 'Gilgit-Baltistan', 'Kashmir'],
            default: 'Federal',
            index: true
        },

        // Content
        preamble: {
            type: String,
            maxlength: 10000
        },
        fullText: {
            type: String,
            required: [true, 'Full text is required']
        },
        sections: [{
            sectionNumber: String,
            title: String,
            content: String,
            subsections: [{
                subsectionNumber: String,
                content: String
            }]
        }],

        // Status
        status: {
            type: String,
            enum: ['Active', 'Repealed', 'Amended', 'Superseded'],
            default: 'Active',
            index: true
        },

        // Amendment History
        amendments: [{
            amendmentAct: String,
            amendmentYear: Number,
            amendmentDate: Date,
            description: String,
            sectionsAffected: [String]
        }],
        repealed: {
            type: Boolean,
            default: false
        },
        repealedBy: {
            act: String,
            date: Date
        },

        // Related Acts
        relatedActs: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Act'
        }],
        supersededBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Act'
        },

        // Document
        pdfUrl: {
            type: String
        },
        pdfPath: {
            type: String
        },
        downloadCount: {
            type: Number,
            default: 0
        },

        // Keywords for Search
        keywords: [{
            type: String,
            trim: true,
            lowercase: true
        }],
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],

        // Metadata
        language: {
            type: String,
            enum: ['English', 'Urdu', 'Both'],
            default: 'English'
        },
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        lastUpdated: Date,

        // Analytics
        viewCount: {
            type: Number,
            default: 0
        },
        searchCount: {
            type: Number,
            default: 0
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

// Text index for full-text search
actSchema.index({
    title: 'text',
    shortTitle: 'text',
    fullText: 'text',
    keywords: 'text',
    'sections.title': 'text',
    'sections.content': 'text'
});

// Compound indexes
actSchema.index({ category: 1, year: -1 });
actSchema.index({ year: -1, status: 1 });
actSchema.index({ jurisdiction: 1, category: 1 });

// Virtual for citation
actSchema.virtual('citation').get(function () {
    return `${this.title}, ${this.year}${this.actNumber ? ` (Act No. ${this.actNumber})` : ''}`;
});

// Instance method to increment view count
actSchema.methods.incrementViewCount = async function () {
    this.viewCount += 1;
    await this.save({ validateBeforeSave: false });
};

// Instance method to increment download count
actSchema.methods.incrementDownloadCount = async function () {
    this.downloadCount += 1;
    await this.save({ validateBeforeSave: false });
};

// Static method to search acts
actSchema.statics.searchActs = function (query, filters = {}) {
    const searchQuery = {
        $text: { $search: query },
        isDeleted: false
    };

    // Apply filters
    if (filters.category) searchQuery.category = filters.category;
    if (filters.year) searchQuery.year = filters.year;
    if (filters.jurisdiction) searchQuery.jurisdiction = filters.jurisdiction;
    if (filters.status) searchQuery.status = filters.status;

    return this.find(searchQuery, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } });
};

// Static method to find by category
actSchema.statics.findByCategory = function (category) {
    return this.find({
        category,
        status: 'Active',
        isDeleted: false
    }).sort({ year: -1 });
};

// Query middleware
actSchema.pre(/^find/, function (next) {
    if (!this.getQuery().isDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});

const Act = mongoose.model('Act', actSchema);

module.exports = Act;
