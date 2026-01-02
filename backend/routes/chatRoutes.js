const express = require('express');
const { getChatRooms, getRoomMessages, startDirectChat } = require('../controllers/chatPollController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get all chat rooms
router.get('/rooms', getChatRooms);

// Start direct chat
router.post('/rooms/dm', startDirectChat);

// Get room messages
router.get('/rooms/:roomId/messages', getRoomMessages);

// Note: Real-time messaging handled by Socket.io

module.exports = router;
