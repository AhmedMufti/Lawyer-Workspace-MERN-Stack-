const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        // Review Target
        reviewType: {
            type: String,
            enum: ['Lawyer', 'Item', 'Service'],
            required: true,
            index: true
        },
        targetId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: 'reviewType',
            index: true
        },

        // Reviewer
        reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },

        // Rating & Review
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        title: {
            type: String,
            trim: true,
            maxlength: 200
        },
        comment: {
            type: String,
            required: true,
            maxlength: 2000
        },

        // Additional Ratings (for lawyers)
        detailedRatings: {
            expertise: { type: Number, min: 1, max: 5 },
            communication: { type: Number, min: 1, max: 5 },
            professionalism: { type: Number, min: 1, max: 5 },
            value: { type: Number, min: 1, max: 5 }
        },

        // Verification
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationNotes: String,

        // Status
        status: {
            type: String,
            enum: ['Pending', 'Approved', 'Rejected', 'Flagged'],
            default: 'Approved',
            index: true
        },

        // Moderation
        moderatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        moderationNotes: String,

        // Helpfulness
        helpfulCount: {
            type: Number,
            default: 0
        },
        markedHelpfulBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],

        // Response from reviewed party
        response: {
            text: String,
            respondedAt: Date
        }
    },
    {
        timestamps: true
    }
);

// Compound indexes
reviewSchema.index({ reviewType: 1, targetId: 1 });
reviewSchema.index({ reviewer: 1, targetId: 1 }, { unique: true }); // One review per user per target

// Update ratings when review is saved
reviewSchema.post('save', async function () {
    if (this.reviewType === 'Lawyer' && this.status === 'Approved') {
        const LawyerProfile = mongoose.model('LawyerProfile');
        const reviews = await this.constructor.find({
            reviewType: 'Lawyer',
            targetId: this.targetId,
            status: 'Approved'
        });

        const avgRating = reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length;

        await LawyerProfile.findOneAndUpdate(
            { user: this.targetId },
            {
                averageRating: Math.round(avgRating * 10) / 10,
                totalReviews: reviews.length
            }
        );
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
