const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
    {
        // User
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },

        // Transaction Type
        transactionType: {
            type: String,
            enum: ['Subscription', 'Marketplace', 'Consultation', 'Other'],
            required: true,
            index: true
        },

        // Amount
        amount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'PKR'
        },

        // Payment Method
        paymentMethod: {
            type: String,
            enum: ['JazzCash', 'EasyPaisa', 'Bank Transfer', 'Cash'],
            required: true,
            index: true
        },

        // Payment Gateway Details
        gateway: {
            transactionId: String,
            referenceNumber: String,
            phoneNumber: String,
            accountNumber: String
        },

        // Subscription Details
        subscription: {
            tier: {
                type: String,
                enum: ['Standard', 'Gold', 'Premium', 'Platinum']
            },
            duration: Number, // in months
            startDate: Date,
            endDate: Date
        },

        // Status
        status: {
            type: String,
            enum: ['Pending', 'Processing', 'Completed', 'Failed', 'Cancelled', 'Refunded'],
            default: 'Pending',
            index: true
        },

        // Payment Proof (for manual verification)
        paymentProof: {
            screenshotPath: String,
            uploadedAt: Date
        },

        // Verification
        isVerified: {
            type: Boolean,
            default: false
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        verifiedAt: Date,

        // Notes
        notes: String,
        adminNotes: String,

        // Refund
        refund: {
            amount: Number,
            reason: String,
            processedAt: Date,
            processedBy: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            }
        }
    },
    {
        timestamps: true
    }
);

// Indexes
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ status: 1, paymentMethod: 1 });
transactionSchema.index({ 'gateway.transactionId': 1 });

// Update user subscription after completed payment
transactionSchema.post('save', async function () {
    if (this.status === 'Completed' && this.transactionType === 'Subscription' && this.subscription) {
        const User = mongoose.model('User');
        await User.findByIdAndUpdate(this.user, {
            subscriptionTier: this.subscription.tier.toLowerCase(),
            subscriptionActive: true,
            subscriptionStartDate: this.subscription.startDate,
            subscriptionEndDate: this.subscription.endDate
        });
    }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
