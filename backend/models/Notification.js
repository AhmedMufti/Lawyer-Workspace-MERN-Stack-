const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        // Recipient Information
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: [true, 'Recipient is required'],
            index: true
        },

        // Notification Type
        type: {
            type: String,
            enum: {
                values: [
                    'Hearing Reminder',
                    'Case Update',
                    'Document Uploaded',
                    'Task Assigned',
                    'Order Sheet Updated',
                    'Payment Due',
                    'Subscription Expiry',
                    'System Alert',
                    'Message Received',
                    'Case Status Change',
                    'Deadline Approaching',
                    'Other'
                ],
                message: '{VALUE} is not a valid notification type'
            },
            required: true,
            index: true
        },

        // Notification Content
        title: {
            type: String,
            required: [true, 'Notification title is required'],
            maxlength: [200, 'Title cannot exceed 200 characters']
        },
        message: {
            type: String,
            required: [true, 'Notification message is required'],
            maxlength: [1000, 'Message cannot exceed 1000 characters']
        },

        // Priority
        priority: {
            type: String,
            enum: ['Low', 'Medium', 'High', 'Urgent'],
            default: 'Medium',
            index: true
        },

        // Related References
        relatedCase: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Case'
        },
        relatedHearing: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Hearing'
        },
        relatedDocument: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Document'
        },

        // Delivery Channels
        channels: {
            email: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                sent: {
                    type: Boolean,
                    default: false
                },
                sentAt: Date,
                status: {
                    type: String,
                    enum: ['Pending', 'Sent', 'Failed', 'Bounced'],
                    default: 'Pending'
                },
                error: String
            },
            sms: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                sent: {
                    type: Boolean,
                    default: false
                },
                sentAt: Date,
                status: {
                    type: String,
                    enum: ['Pending', 'Sent', 'Failed', 'Delivered'],
                    default: 'Pending'
                },
                error: String,
                messageId: String
            },
            push: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                sent: {
                    type: Boolean,
                    default: false
                },
                sentAt: Date,
                status: {
                    type: String,
                    enum: ['Pending', 'Sent', 'Failed', 'Delivered'],
                    default: 'Pending'
                },
                error: String
            },
            inApp: {
                enabled: {
                    type: Boolean,
                    default: true
                },
                read: {
                    type: Boolean,
                    default: false
                },
                readAt: Date
            }
        },

        // Scheduling
        scheduledFor: Date,
        sendImmediately: {
            type: Boolean,
            default: true
        },

        // Status
        overallStatus: {
            type: String,
            enum: ['Pending', 'Scheduled', 'Sending', 'Sent', 'Partially Sent', 'Failed'],
            default: 'Pending',
            index: true
        },

        // Actions
        actionUrl: String, // URL to navigate when clicked
        actionLabel: String, // Button text

        // Metadata
        metadata: mongoose.Schema.Types.Mixed, // Additional data

        // Tracking
        attemptCount: {
            type: Number,
            default: 0
        },
        lastAttemptAt: Date,
        maxRetries: {
            type: Number,
            default: 3
        },

        // Expiry
        expiresAt: Date,

        // Created By
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },

        // Soft Delete
        isDeleted: {
            type: Boolean,
            default: false,
            select: false
        }
    },
    {
        timestamps: true
    }
);

// Indexes
notificationSchema.index({ recipient: 1, createdAt: -1 });
notificationSchema.index({ overallStatus: 1, scheduledFor: 1 });
notificationSchema.index({ 'channels.inApp.read': 1 });
notificationSchema.index({ relatedCase: 1 });
notificationSchema.index({ isDeleted: 1 });

// Instance method to mark as read
notificationSchema.methods.markAsRead = async function () {
    this.channels.inApp.read = true;
    this.channels.inApp.readAt = Date.now();
    await this.save();
};

// Instance method to send notification
notificationSchema.methods.send = async function () {
    this.overallStatus = 'Sending';
    this.attemptCount += 1;
    this.lastAttemptAt = Date.now();

    const results = {
        email: false,
        sms: false,
        push: false
    };

    try {
        // Send email
        if (this.channels.email.enabled) {
            // TODO: Implement email sending logic
            // await sendEmail(this.recipient.email, this.title, this.message);
            this.channels.email.sent = true;
            this.channels.email.sentAt = Date.now();
            this.channels.email.status = 'Sent';
            results.email = true;
        }

        // Send SMS
        if (this.channels.sms.enabled) {
            // TODO: Implement SMS sending logic
            // await sendSMS(this.recipient.phone, this.message);
            this.channels.sms.sent = true;
            this.channels.sms.sentAt = Date.now();
            this.channels.sms.status = 'Sent';
            results.sms = true;
        }

        // Send push notification
        if (this.channels.push.enabled) {
            // TODO: Implement push notification logic
            // await sendPush(this.recipient._id, this.title, this.message);
            this.channels.push.sent = true;
            this.channels.push.sentAt = Date.now();
            this.channels.push.status = 'Sent';
            results.push = true;
        }

        // Determine overall status
        const allSent = Object.values(results).every(v => v === true);
        const someSent = Object.values(results).some(v => v === true);

        if (allSent) {
            this.overallStatus = 'Sent';
        } else if (someSent) {
            this.overallStatus = 'Partially Sent';
        } else {
            this.overallStatus = 'Failed';
        }

        await this.save();
        return results;
    } catch (error) {
        this.overallStatus = 'Failed';
        await this.save();
        throw error;
    }
};

// Static method to find unread notifications
notificationSchema.statics.findUnread = function (userId) {
    return this.find({
        recipient: userId,
        'channels.inApp.enabled': true,
        'channels.inApp.read': false,
        isDeleted: false
    }).sort({ createdAt: -1 });
};

// Static method to get notification count
notificationSchema.statics.getUnreadCount = async function (userId) {
    return await this.countDocuments({
        recipient: userId,
        'channels.inApp.enabled': true,
        'channels.inApp.read': false,
        isDeleted: false
    });
};

// Static method to find pending notifications
notificationSchema.statics.findPending = function () {
    return this.find({
        overallStatus: { $in: ['Pending', 'Scheduled'] },
        $or: [
            { scheduledFor: { $lte: new Date() } },
            { sendImmediately: true }
        ],
        isDeleted: false
    });
};

// Static method to create case update notification
notificationSchema.statics.createCaseUpdate = async function (caseId, recipientId, message, createdBy) {
    return await this.create({
        recipient: recipientId,
        type: 'Case Update',
        title: 'Case Update',
        message,
        priority: 'Medium',
        relatedCase: caseId,
        createdBy,
        sendImmediately: true
    });
};

// Static method to create hearing reminder
notificationSchema.statics.createHearingReminder = async function (hearingId, caseId, recipientId, hearingDate) {
    const daysUntil = Math.floor((hearingDate - Date.now()) / (1000 * 60 * 60 * 24));

    return await this.create({
        recipient: recipientId,
        type: 'Hearing Reminder',
        title: 'Upcoming Hearing Reminder',
        message: `You have a hearing scheduled in ${daysUntil} day(s). Please ensure you are prepared.`,
        priority: daysUntil <= 1 ? 'Urgent' : 'High',
        relatedHearing: hearingId,
        relatedCase: caseId,
        scheduledFor: new Date(hearingDate.getTime() - (24 * 60 * 60 * 1000)), // 1 day before
        sendImmediately: false
    });
};

// Query middleware to exclude deleted notifications
notificationSchema.pre(/^find/, function (next) {
    if (!this.getQuery().isDeleted) {
        this.find({ isDeleted: { $ne: true } });
    }
    next();
});

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
