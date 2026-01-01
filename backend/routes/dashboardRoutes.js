const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All dashboard routes are protected

router.get('/', dashboardController.getDashboardStats);

module.exports = router;
