const express = require('express');
const paymentController = require('../controllers/paymentController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/packages', paymentController.getPackages);

// Protected routes
router.use(protect);

router.route('/transactions')
    .get(paymentController.getMyTransactions)
    .post(paymentController.createTransaction);

router.get('/transactions/:id', paymentController.getTransactionById);

// Admin only
router.post('/transactions/:id/verify', restrictTo('admin'), paymentController.verifyTransaction);

module.exports = router;
