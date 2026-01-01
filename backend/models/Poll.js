const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema(
    {
        // Poll Basic Info
        title: {
            type: String,
            required: true,
            trim: true,
            maxlength: 300
        },
        description: {
            type: String,
            maxlength: 2000
        },

        // Poll Type
        pollType: {
            type: String,
            enum: ['Opinion', 'Election', 'Survey'],
            default: 'Opinion',
            index: true
        },

        // Target Audience
        targetAudience: {
            barAssociation: {
                type: String,
                enum: [
                    'All Bars',
                    'Pakistan Bar Council',
                    'Punjab Bar Council',
                    'Sindh Bar Council',
                    'KPK Bar Council',
                    'Balochistan Bar Council',
                    'Islamabad Bar Council',
                    'Supreme Court Bar',
                    'Lahore High Court Bar',
                    'Other'
                ],
                default: 'All Bars'
            },
            roles: [{
                type: String,
                enum: ['lawyer', 'clerk']
            }]
        },

        // Options
        options: [{
            optionText: {
                type: String,
                required: true,
                trim: true
            },
            voteCount: {
                type: Number,
                default: 0
            },
            percentage: {
                type: Number,
                default: 0
            }
        }],

        // Voting Settings
        allowMultipleChoices: {
            type: Boolean,
            default: false
        },
        allowVoteChange: {
            type: Boolean,
            default: true // Per instructions.md
        },
        requireVerification: {
            type: Boolean,
            default: false
        },
        isAnonymous: {
            type: Boolean,
            default: true
        },

        // Duration
        startDate: {
            type: Date,
            default: Date.now
        },
        endDate: {
            type: Date,
            required: true,
            index: true
        },

        // Status
        status: {
            type: String,
            enum: ['Draft', 'Active', 'Closed', 'Cancelled'],
            default: 'Active',
            index: true
        },

        // Results
        totalVotes: {
            type: Number,
            default: 0
        },
        uniqueVoters: {
            type: Number,
            default: 0
        },

        // Visibility
        isPublic: {
            type: Boolean,
            default: true
        },
        showResultsBeforeVoting: {
            type: Boolean,
            default: false
        },
        showResultsAfterVoting: {
            type: Boolean,
            default: true
        },

        // Creator
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // Metadata
        category: String,
        tags: [String]
    },
    {
        timestamps: true
    }
);

// Indexes
pollSchema.index({ status: 1, endDate: 1 });
pollSchema.index({ 'targetAudience.barAssociation': 1 });
pollSchema.index({ createdAt: -1 });

// Method to calculate percentages
pollSchema.methods.calculatePercentages = function () {
    if (this.totalVotes > 0) {
        this.options.forEach(option => {
            option.percentage = Math.round((option.voteCount / this.totalVotes) * 100 * 10) / 10;
        });
    }
};

// Auto-close expired polls
pollSchema.pre('find', async function (next) {
    try {
        const now = new Date();
        // Use this.model to access the model constructor from the query instance
        // and await the execution ensures it runs before the find results are returned
        await this.model.updateMany(
            { endDate: { $lt: now }, status: 'Active' },
            { $set: { status: 'Closed' } }
        );
    } catch (error) {
        console.error('Error auto-closing polls:', error);
    }
    next();
});

const Poll = mongoose.model('Poll', pollSchema);

module.exports = Poll;
