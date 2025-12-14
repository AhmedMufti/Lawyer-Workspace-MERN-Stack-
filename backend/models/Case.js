const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema(
    {
        // Case Identification
        caseNumber: {
            type: String,
            required: [true, 'Case number is required'],
            unique: true,
            trim: true,
            uppercase: true,
            index: true
        },
        caseTitle: {
            type: String,
            required: [true, 'Case title is required'],
            trim: true,
            maxlength: [500, 'Case title cannot exceed 500 characters']
        },
        caseType: {
            type: String,
            enum: {
                values: [
                    'Civil',
                    'Criminal',
                    'Family',
                    'Corporate',
                    'Constitutional',
                    'Tax',
                    'Labor',
                    'Property',
                    'Intellectual Property',
                    'Administrative',
                    'Other'
                ],
                message: '{VALUE} is not a valid case type'
            },
            required: [true, 'Case type is required'],
            index: true
        },
        caseStatus: {
            type: String,
            enum: {
                values: [
                    'Filed',
                    'Under Review',
                    'Admitted',
                    'In Progress',
                    'Hearing Scheduled',
                    'Judgment Reserved',
                    'Decided',
                    'Dismissed',
                    'Withdrawn',
                    'Settled',
                    'Archived'
                ],
                message: '{VALUE} is not a valid case status'
            },
            default: 'Filed',
            index: true
        },
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Urgent'],
            default: 'Medium'
        },

        // Court Information
        court: {
            name: {
                type: String,
                required: [true, 'Court name is required'],
                trim: true
            },
            city: {
                type: String,
                required: [true, 'Court city is required'],
                trim: true,
                index: true
            },
            state: {
                type: String,
                trim: true
            },
            courtType: {
                type: String,
                enum: ['Supreme Court', 'High Court', 'District Court', 'Sessions Court', 'Magistrate Court', 'Tribunal', 'Other'],
                required: true
            },
            courtNumber: String,
            judge: {
                type: String,
                trim: true
            }
        },

        // Parties Information
        petitioner: {
            name: {
                type: String,
                required: [true, 'Petitioner name is required'],
                trim: true
            },
            contactNumber: String,
            email: String,
            address: {
                street: String,
                city: String,
                state: String,
                zipCode: String
            },
            cnic: String // National ID
        },
        respondent: {
            name: {
                type: String,
                required: [true, 'Respondent name is required'],
                trim: true
            },
            contactNumber: String,
            email: String,
            address: {
                street: String,
                city: String,
                state: String,
                zipCode: String
            },
            cnic: String
        },
        additionalParties: [{
            role: {
                type: String,
                enum: ['Co-Petitioner', 'Co-Respondent', 'Intervener', 'Witness', 'Other']
            },
            name: String,
            contactNumber: String
        }],

        // Legal Team
        leadLawyer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Lead lawyer is required'],
            index: true
        },
        associatedLawyers: [{
            lawyer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ['Senior Counsel', 'Junior Counsel', 'Assistant', 'Consultant']
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }],
        clerks: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],

        // Case Details
        filingDate: {
            type: Date,
            required: [true, 'Filing date is required'],
            index: true
        },
        firstHearingDate: Date,
        nextHearingDate: {
            type: Date,
            index: true
        },
        expectedClosureDate: Date,
        actualClosureDate: Date,

        description: {
            type: String,
            maxlength: [5000, 'Description cannot exceed 5000 characters']
        },
        legalIssues: [{
            type: String,
            trim: true
        }],
        lawsInvolved: [{
            actName: String,
            section: String,
            articleNumber: String
        }],

        // Financial Information
        estimatedValue: {
            type: Number,
            min: 0
        },
        courtFees: {
            type: Number,
            default: 0
        },
        professionalFees: {
            type: Number,
            default: 0
        },
        otherExpenses: {
            type: Number,
            default: 0
        },
        totalCost: {
            type: Number,
            default: 0
        },

        // Case Progress
        totalHearings: {
            type: Number,
            default: 0
        },
        completedHearings: {
            type: Number,
            default: 0
        },
        pendingTasks: [{
            task: String,
            dueDate: Date,
            assignedTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            status: {
                type: String,
                enum: ['Pending', 'In Progress', 'Completed'],
                default: 'Pending'
            }
        }],

        // Document References
        totalDocuments: {
            type: Number,
            default: 0
        },

        // Notifications & Alerts
        smsAlertsEnabled: {
            type: Boolean,
            default: true
        },
        emailAlertsEnabled: {
            type: Boolean,
            default: true
        },
        subscribedUsers: [{
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            notificationPreferences: {
                sms: { type: Boolean, default: true },
                email: { type: Boolean, default: true },
                push: { type: Boolean, default: true }
            }
        }],

        // Case Outcome
        judgmentSummary: {
            type: String,
            maxlength: [2000, 'Judgment summary cannot exceed 2000 characters']
        },
        judgmentDate: Date,
        judgmentInFavor: {
            type: String,
            enum: ['Petitioner', 'Respondent', 'Partial', 'N/A']
        },
        appealStatus: {
            type: String,
            enum: ['Not Applicable', 'Appeal Filed', 'Appeal Pending', 'Appeal Decided'],
            default: 'Not Applicable'
        },

        // Access Control
        visibility: {
            type: String,
            enum: ['Private', 'Team Only', 'Client Access', 'Public'],
            default: 'Team Only'
        },
        allowedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],

        // Tags and Categories
        tags: [{
            type: String,
            trim: true,
            lowercase: true
        }],
        category: String,

        // Metadata
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        lastModifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        // Archive and Soft Delete
        isArchived: {
            type: Boolean,
            default: false,
            index: true
        },
        archivedAt: Date,
        archivedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        isDeleted: {
            type: Boolean,
            default: false,
            select: false
        },
        deletedAt: Date
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Indexes for performance
caseSchema.index({ caseNumber: 1 });
caseSchema.index({ leadLawyer: 1, caseStatus: 1 });
caseSchema.index({ 'court.city': 1, caseType: 1 });
caseSchema.index({ nextHearingDate: 1 });
caseSchema.index({ filingDate: -1 });
caseSchema.index({ tags: 1 });
caseSchema.index({ isArchived: 1, isDeleted: 1 });

// Virtual for case age in days
caseSchema.virtual('caseAgeDays').get(function () {
    return Math.floor((Date.now() - this.filingDate) / (1000 * 60 * 60 * 24));
});

// Virtual for days until next hearing
caseSchema.virtual('daysUntilNextHearing').get(function () {
    if (!this.nextHearingDate) return null;
    return Math.floor((this.nextHearingDate - Date.now()) / (1000 * 60 * 60 * 24));
});

// Virtual for progress percentage
caseSchema.virtual('progressPercentage').get(function () {
    if (this.totalHearings === 0) return 0;
    return Math.round((this.completedHearings / this.totalHearings) * 100);
});

// Pre-save middleware to calculate total cost
caseSchema.pre('save', function (next) {
    this.totalCost = (this.courtFees || 0) + (this.professionalFees || 0) + (this.otherExpenses || 0);
    next();
});

// Pre-save middleware to update lastModifiedBy
caseSchema.pre('save', function (next) {
    if (!this.isNew && this.$locals.userId) {
        this.lastModifiedBy = this.$locals.userId;
    }
    next();
});

// Instance method to check if user has access
caseSchema.methods.canAccess = function (userId) {
    // Lead lawyer always has access
    if (this.leadLawyer.toString() === userId.toString()) {
        return true;
    }

    // Check associated lawyers
    const isAssociatedLawyer = this.associatedLawyers.some(
        al => al.lawyer.toString() === userId.toString()
    );
    if (isAssociatedLawyer) return true;

    // Check clerks
    const isClerk = this.clerks.some(
        clerk => clerk.toString() === userId.toString()
    );
    if (isClerk) return true;

    // Check allowed users
    const isAllowedUser = this.allowedUsers.some(
        user => user.toString() === userId.toString()
    );
    if (isAllowedUser) return true;

    // Check if created by user
    if (this.createdBy.toString() === userId.toString()) {
        return true;
    }

    return false;
};

// Instance method to add associated lawyer
caseSchema.methods.addLawyer = function (lawyerId, role = 'Junior Counsel') {
    // Check if already added
    const exists = this.associatedLawyers.some(
        al => al.lawyer.toString() === lawyerId.toString()
    );

    if (!exists) {
        this.associatedLawyers.push({
            lawyer: lawyerId,
            role,
            addedAt: Date.now()
        });
    }
};

// Static method to find cases by lawyer
caseSchema.statics.findByLawyer = function (lawyerId) {
    return this.find({
        $or: [
            { leadLawyer: lawyerId },
            { 'associatedLawyers.lawyer': lawyerId },
            { clerks: lawyerId }
        ],
        isDeleted: false
    });
};

// Static method to find active cases
caseSchema.statics.findActive = function () {
    return this.find({
        isArchived: false,
        isDeleted: false,
        caseStatus: { $nin: ['Decided', 'Dismissed', 'Withdrawn', 'Settled'] }
    });
};

// Static method to find upcoming hearings
caseSchema.statics.findUpcomingHearings = function (days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.find({
        nextHearingDate: {
            $gte: new Date(),
            $lte: futureDate
        },
        isDeleted: false
    }).sort({ nextHearingDate: 1 });
};

// Query middleware to exclude deleted cases
caseSchema.pre(/^find/, function (next) {
    if (!this.getQuery().isDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});

const Case = mongoose.model('Case', caseSchema);

module.exports = Case;
