const mongoose = require('mongoose');

const caseLawSchema = new mongoose.Schema(
    {
        // Case Identification
        caseTitle: {
            type: String,
            required: [true, 'Case title is required'],
            trim: true,
            index: true
        },
        citation: {
            type: String,
            required: [true, 'Citation is required'],
            unique: true,
            trim: true,
            index: true
        },
        alternativeCitations: [{
            type: String,
            trim: true
        }],

        // Parties
        petitioner: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        respondent: {
            type: String,
            required: true,
            trim: true,
            index: true
        },

        // Court Information
        court: {
            type: String,
            required: [true, 'Court name is required'],
            enum: {
                values: [
                    'Supreme Court of Pakistan',
                    'Lahore High Court',
                    'Sindh High Court',
                    'Peshawar High Court',
                    'Balochistan High Court',
                    'Islamabad High Court',
                    'Federal Shariat Court',
                    'District Court',
                    'Other'
                ],
                message: '{VALUE} is not a valid court'
            },
            index: true
        },
        bench: {
            type: String,
            enum: ['Single', 'Division', 'Full Bench', 'Larger Bench', 'Constitutional Bench'],
            default: 'Single'
        },

        // Judges
        judges: [{
            type: String,
            trim: true,
            index: true
        }],
        chiefJudge: {
            type: String,
            trim: true
        },

        // Dates
        decisionDate: {
            type: Date,
            required: [true, 'Decision date is required'],
            index: true
        },
        hearingDates: [{
            type: Date
        }],
        filingDate: Date,

        // Case Details
        caseType: {
            type: String,
            enum: ['Civil', 'Criminal', 'Constitutional', 'Administrative', 'Tax', 'Service', 'Other'],
            required: true,
            index: true
        },
        caseNumber: {
            type: String,
            trim: true
        },
        year: {
            type: Number,
            required: true,
            index: true
        },

        // Judgment
        judgmentText: {
            type: String,
            required: [true, 'Judgment text is required']
        },
        headnotes: {
            type: String,
            maxlength: 5000
        },
        summary: {
            type: String,
            maxlength: 2000
        },
        ratio: {
            type: String, // Ratio decidendi
            maxlength: 2000
        },

        // Judgment Details
        judgmentBy: {
            type: String, // Judge who wrote the judgment
            trim: true
        },
        judgmentType: {
            type: String,
            enum: ['Majority', 'Unanimous', 'Dissenting', 'Concurring', 'Per Curiam'],
            default: 'Majority'
        },
        disposition: {
            type: String,
            enum: ['Allowed', 'Dismissed', 'Partly Allowed', 'Set Aside', 'Remanded', 'Withdrawn', 'Other'],
            required: true
        },

        // Legal References
        actsReferred: [{
            actName: String,
            sections: [String],
            articles: [String]
        }],
        casesReferred: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CaseLaw'
        }],
        casesCited: [{
            citation: String,
            title: String,
            distinguishedOrFollowed: {
                type: String,
                enum: ['Followed', 'Distinguished', 'Overruled', 'Considered', 'Referred']
            }
        }],

        // Subject Matter
        subjects: [{
            type: String,
            trim: true,
            lowercase: true,
            index: true
        }],
        legalPrinciples: [{
            type: String,
            trim: true
        }],
        keywords: [{
            type: String,
            trim: true,
            lowercase: true,
            index: true
        }],

        // Importance
        importance: {
            type: String,
            enum: ['Landmark', 'Important', 'Standard', 'Routine'],
            default: 'Standard',
            index: true
        },
        isPrecedent: {
            type: Boolean,
            default: false
        },

        // Document
        pdfUrl: String,
        pdfPath: String,
        downloadCount: {
            type: Number,
            default: 0
        },

        // Analytics
        viewCount: {
            type: Number,
            default: 0
        },
        citedByCount: {
            type: Number,
            default: 0
        },
        bookmarkCount: {
            type: Number,
            default: 0
        },

        // User Interactions
        bookmarkedBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
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

// Text index for full-text search
caseLawSchema.index({
    caseTitle: 'text',
    citation: 'text',
    petitioner: 'text',
    respondent: 'text',
    judgmentText: 'text',
    headnotes: 'text',
    summary: 'text',
    keywords: 'text',
    'judges': 'text'
});

// Compound indexes
caseLawSchema.index({ court: 1, decisionDate: -1 });
caseLawSchema.index({ year: -1, court: 1 });
caseLawSchema.index({ caseType: 1, importance: 1 });
caseLawSchema.index({ subjects: 1, decisionDate: -1 });

// Virtual for short citation
caseLawSchema.virtual('shortCitation').get(function () {
    return `${this.petitioner} v. ${this.respondent}`;
});

// Virtual for case age
caseLawSchema.virtual('ageInYears').get(function () {
    return new Date().getFullYear() - this.year;
});

// Instance methods
caseLawSchema.methods.incrementViewCount = async function () {
    this.viewCount += 1;
    await this.save({ validateBeforeSave: false });
};

caseLawSchema.methods.incrementDownloadCount = async function () {
    this.downloadCount += 1;
    await this.save({ validateBeforeSave: false });
};

caseLawSchema.methods.addBookmark = async function (userId) {
    if (!this.bookmarkedBy.includes(userId)) {
        this.bookmarkedBy.push(userId);
        this.bookmarkCount += 1;
        await this.save({ validateBeforeSave: false });
    }
};

caseLawSchema.methods.removeBookmark = async function (userId) {
    const index = this.bookmarkedBy.indexOf(userId);
    if (index > -1) {
        this.bookmarkedBy.splice(index, 1);
        this.bookmarkCount -= 1;
        await this.save({ validateBeforeSave: false });
    }
};

// Static methods
caseLawSchema.statics.advancedSearch = function (params) {
    const query = { isDeleted: false };

    // Text search (Regex replacement)
    if (params.searchTerm) {
        const searchRegex = new RegExp(params.searchTerm, 'i');
        query.$or = [
            { caseTitle: searchRegex },
            { citation: searchRegex },
            { petitioner: searchRegex },
            { respondent: searchRegex },
            { judgmentText: searchRegex },
            { keywords: searchRegex },
            { headnotes: searchRegex }
        ];
    }

    // Filters
    if (params.court) query.court = params.court;
    if (params.judge) query.judges = { $in: [new RegExp(params.judge, 'i')] };
    if (params.caseType) query.caseType = params.caseType;
    if (params.year) query.year = params.year;
    if (params.disposition) query.disposition = params.disposition;
    if (params.importance) query.importance = params.importance;

    // Party search
    if (params.party) {
        // If $or exists (from searchTerm), we need to handle it carefully, but usually party is separate or specific.
        // If party specific search is requested, meaningful AND logic applies.
        // But for simplicity in this schema helper:
        const partyRegex = new RegExp(params.party, 'i');
        if (query.$or) {
            query.$and = [
                { $or: query.$or },
                { $or: [{ petitioner: partyRegex }, { respondent: partyRegex }] }
            ];
            delete query.$or;
        } else {
            query.$or = [
                { petitioner: partyRegex },
                { respondent: partyRegex }
            ];
        }
    }

    // Date range
    if (params.fromDate || params.toDate) {
        query.decisionDate = {};
        if (params.fromDate) query.decisionDate.$gte = new Date(params.fromDate);
        if (params.toDate) query.decisionDate.$lte = new Date(params.toDate);
    }

    // Subject/keyword (Exact/Regex)
    if (params.subject) query.subjects = new RegExp(params.subject, 'i');
    if (params.keyword) query.keywords = new RegExp(params.keyword, 'i');

    return this.find(query).sort({ decisionDate: -1 });
};

caseLawSchema.statics.findByCourt = function (court, limit = 20) {
    return this.find({
        court,
        isDeleted: false
    })
        .sort({ decisionDate: -1 })
        .limit(limit);
};

caseLawSchema.statics.findLandmarkCases = function () {
    return this.find({
        importance: 'Landmark',
        isDeleted: false
    }).sort({ decisionDate: -1 });
};

// Query middleware
caseLawSchema.pre(/^find/, function (next) {
    if (!this.getQuery().isDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});

const CaseLaw = mongoose.model('CaseLaw', caseLawSchema);

module.exports = CaseLaw;
