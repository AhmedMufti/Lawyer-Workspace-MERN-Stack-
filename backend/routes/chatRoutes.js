const express = require('express');
const { getChatRooms, getRoomMessages } = require('../controllers/chatPollController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all chat rooms
router.get('/rooms', getChatRooms);

// Get room messages
router.get('/rooms/:roomId/messages', getRoomMessages);

// Note: Real-time messaging handled by Socket.io

module.exports = router;
