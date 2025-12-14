const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema(
    {
        // Poll Reference
        poll: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Poll',
            required: true,
            index: true
        },

        // Voter
        voter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },

        // Vote Selection
        selectedOption: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },

        // Multiple choices (if allowed)
        selectedOptions: [{
            type: mongoose.Schema.Types.ObjectId
        }],

        // Metadata
        votedAt: {
            type: Date,
            default: Date.now
        },

        // Vote Change History
        previousVote: {
            optionId: mongoose.Schema.Types.ObjectId,
            changedAt: Date
        },
        changeCount: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

// Compound index - one vote per user per poll
voteSchema.index({ poll: 1, voter: 1 }, { unique: true });

// Update poll vote counts after vote
voteSchema.post('save', async function () {
    const Poll = mongoose.model('Poll');
    const poll = await Poll.findById(this.poll);

    // Recalculate vote counts
    const votes = await this.constructor.find({ poll: this.poll });
    poll.uniqueVoters = votes.length;

    // Reset all option counts
    poll.options.forEach(opt => opt.voteCount = 0);

    // Count votes for each option
    votes.forEach(vote => {
        const option = poll.options.id(vote.selectedOption);
        if (option) option.voteCount += 1;
    });

    poll.totalVotes = votes.length;
    poll.calculatePercentages();
    await poll.save();
});

const Vote = mongoose.model('Vote', voteSchema);

module.exports = Vote;
