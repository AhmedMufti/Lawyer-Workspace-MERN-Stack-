const mongoose = require('mongoose');

const hearingSchema = new mongoose.Schema(
    {
        // Associated Case
        case: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Case',
            required: [true, 'Case reference is required'],
            index: true
        },

        // Hearing Identification
        hearingNumber: {
            type: Number,
            required: true
        },
        hearingType: {
            type: String,
            enum: {
                values: [
                    'First Hearing',
                    'Regular Hearing',
                    'Final Hearing',
                    'Evidence Recording',
                    'Arguments',
                    'Cross Examination',
                    'Judgment',
                    'Status Update',
                    'Procedural',
                    'Emergency Hearing',
                    'Other'
                ],
                message: '{VALUE} is not a valid hearing type'
            },
            required: [true, 'Hearing type is required']
        },

        // Hearing Schedule
        scheduledDate: {
            type: Date,
            required: [true, 'Scheduled date is required'],
            index: true
        },
        scheduledTime: {
            type: String, // Format: "HH:MM AM/PM"
            required: true
        },
        expectedDuration: {
            type: Number, // in minutes
            default: 60
        },
        actualStartTime: Date,
        actualEndTime: Date,

        // Court Information
        courtroom: String,
        judge: {
            type: String,
            required: true,
            trim: true
        },
        additionalJudges: [{
            type: String,
            trim: true
        }],

        // Hearing Status
        status: {
            type: String,
            enum: {
                values: [
                    'Scheduled',
                    'Confirmed',
                    'In Progress',
                    'Completed',
                    'Adjourned',
                    'Postponed',
                    'Cancelled',
                    'No Proceeding'
                ],
                message: '{VALUE} is not a valid status'
            },
            default: 'Scheduled',
            index: true
        },

        // Attendance
        attendees: [{
            person: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            role: {
                type: String,
                enum: ['Lead Lawyer', 'Associate Lawyer', 'Clerk', 'Client', 'Witness', 'Other']
            },
            attended: {
                type: Boolean,
                default: false
            },
            remarks: String
        }],

        // Hearing Details
        purpose: {
            type: String,
            maxlength: [500, 'Purpose cannot exceed 500 characters']
        },
        agenda: [{
            item: String,
            order: Number,
            completed: {
                type: Boolean,
                default: false
            }
        }],

        // Order Sheet
        orderSheet: {
            content: {
                type: String,
                maxlength: [5000, 'Order sheet content cannot exceed 5000 characters']
            },
            issuedBy: String, // Judge name
            issuedDate: Date,
            orderType: {
                type: String,
                enum: ['Interim Order', 'Final Order', 'Procedural Order', 'Judgment', 'Decision', 'Other']
            }
        },

        // Proceedings
        proceedings: {
            type: String,
            maxlength: [10000, 'Proceedings cannot exceed 10000 characters']
        },
        arguments: [{
            presentedBy: {
                type: String,
                enum: ['Petitioner', 'Respondent', 'Intervener']
            },
            summary: String,
            duration: Number // in minutes
        }],
        evidencePresented: [{
            evidenceType: String,
            description: String,
            documentRef: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Document'
            },
            markedAs: String // e.g., "Exhibit A"
        }],
        witnessesExamined: [{
            witnessName: String,
            examinedBy: {
                type: String,
                enum: ['Petitioner', 'Respondent', 'Court']
            },
            examinationType: {
                type: String,
                enum: ['Chief Examination', 'Cross Examination', 'Re-examination']
            },
            summary: String
        }],

        // Next Steps
        nextHearingDate: Date,
        nextHearingPurpose: String,
        tasksAssigned: [{
            task: String,
            assignedTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            dueDate: Date,
            status: {
                type: String,
                enum: ['Pending', 'In Progress', 'Completed'],
                default: 'Pending'
            }
        }],
        adjournmentReason: String,

        // Documents Related to Hearing
        relatedDocuments: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document'
        }],

        // Notes
        lawyerNotes: {
            type: String,
            maxlength: [3000, 'Lawyer notes cannot exceed 3000 characters']
        },
        clerkNotes: {
            type: String,
            maxlength: [2000, 'Clerk notes cannot exceed 2000 characters']
        },
        internalNotes: {
            type: String,
            maxlength: [2000, 'Internal notes cannot exceed 2000 characters']
        },

        // Notifications
        remindersSent: {
            type: Boolean,
            default: false
        },
        alertsSent: [{
            sentTo: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            sentAt: Date,
            type: {
                type: String,
                enum: ['Email', 'SMS', 'Push']
            }
        }],

        // Recording Information
        isRecorded: {
            type: Boolean,
            default: false
        },
        recordingPath: String,
        transcriptPath: String,

        // Metadata
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        // Soft Delete
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

// Compound index for case and hearing number
hearingSchema.index({ case: 1, hearingNumber: 1 }, { unique: true });
hearingSchema.index({ scheduledDate: 1, status: 1 });
hearingSchema.index({ isDeleted: 1 });

// Virtual for actual duration
hearingSchema.virtual('actualDuration').get(function () {
    if (this.actualStartTime && this.actualEndTime) {
        return Math.round((this.actualEndTime - this.actualStartTime) / (1000 * 60)); // in minutes
    }
    return null;
});

// Virtual for days until hearing
hearingSchema.virtual('daysUntilHearing').get(function () {
    if (this.scheduledDate && this.status === 'Scheduled') {
        return Math.floor((this.scheduledDate - Date.now()) / (1000 * 60 * 60 * 24));
    }
    return null;
});

// Virtual for is upcoming
hearingSchema.virtual('isUpcoming').get(function () {
    return this.scheduledDate > Date.now() && this.status === 'Scheduled';
});

// Pre-save middleware to set hearing number
hearingSchema.pre('save', async function (next) {
    if (this.isNew && !this.hearingNumber) {
        const Hearing = this.constructor;
        const lastHearing = await Hearing.findOne({ case: this.case })
            .sort({ hearingNumber: -1 })
            .select('hearingNumber');

        this.hearingNumber = lastHearing ? lastHearing.hearingNumber + 1 : 1;
    }
    next();
});

// Pre-save middleware to update case hearing counts
hearingSchema.post('save', async function () {
    const Case = mongoose.model('Case');

    // Count total and completed hearings
    const Hearing = this.constructor;
    const totalHearings = await Hearing.countDocuments({
        case: this.case,
        isDeleted: false
    });

    const completedHearings = await Hearing.countDocuments({
        case: this.case,
        status: 'Completed',
        isDeleted: false
    });

    // Update case
    await Case.findByIdAndUpdate(this.case, {
        totalHearings,
        completedHearings
    });
});

// Instance method to mark as completed
hearingSchema.methods.markCompleted = async function (userId) {
    this.status = 'Completed';
    this.actualEndTime = Date.now();
    this.updatedBy = userId;
    await this.save();
};

// Instance method to adjourn hearing
hearingSchema.methods.adjourn = async function (reason, nextDate, userId) {
    this.status = 'Adjourned';
    this.adjournmentReason = reason;
    this.nextHearingDate = nextDate;
    this.updatedBy = userId;
    await this.save();

    // Update case next hearing date
    const Case = mongoose.model('Case');
    await Case.findByIdAndUpdate(this.case, {
        nextHearingDate: nextDate
    });
};

// Static method to find by case
hearingSchema.statics.findByCase = function (caseId) {
    return this.find({
        case: caseId,
        isDeleted: false
    }).sort({ scheduledDate: -1 });
};

// Static method to find upcoming hearings
hearingSchema.statics.findUpcoming = function (days = 7) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.find({
        scheduledDate: {
            $gte: new Date(),
            $lte: futureDate
        },
        status: 'Scheduled',
        isDeleted: false
    }).sort({ scheduledDate: 1 });
};

// Static method to find today's hearings
hearingSchema.statics.findToday = function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return this.find({
        scheduledDate: {
            $gte: today,
            $lt: tomorrow
        },
        isDeleted: false
    }).sort({ scheduledTime: 1 });
};

// Query middleware to exclude deleted hearings
hearingSchema.pre(/^find/, function (next) {
    if (!this.getQuery().isDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});

const Hearing = mongoose.model('Hearing', hearingSchema);

module.exports = Hearing;
