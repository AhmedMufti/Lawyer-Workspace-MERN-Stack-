const express = require('express');
const { createPoll, getPolls, getPollById, voteOnPoll, getPollResults } = require('../controllers/chatPollController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getPolls);
router.get('/:id', getPollById);
router.get('/:id/results', getPollResults);

// Protected routes
router.post('/', protect, createPoll);
router.post('/:id/vote', protect, voteOnPoll);

module.exports = router;
