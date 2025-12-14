const Transaction = require('../models/Transaction');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess, sendPaginated } = require('../utils/responseFormatter');

/**
 * @desc    Create transaction (initiate payment)
 * @route   POST /api/payments/transactions
 * @access  Private
 */
exports.createTransaction = catchAsync(async (req, res, next) => {
    const transaction = await Transaction.create({
        ...req.body,
        user: req.user._id
    });

    sendSuccess(res, 201, 'Transaction initiated', { transaction });
});

/**
 * @desc    Get user transactions
 * @route   GET /api/payments/transactions
 * @access  Private
 */
exports.getMyTransactions = catchAsync(async (req, res, next) => {
    const { page = 1, limit = 20, status } = req.query;

    const query = { user: req.user._id };
    if (status) query.status = status;

    const skip = (page - 1) * limit;
    const transactions = await Transaction.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit));

    const total = await Transaction.countDocuments(query);

    sendPaginated(res, 200, 'Transactions retrieved', transactions, {
        page: parseInt(page),
        limit: parseInt(limit),
        total
    });
});

/**
 * @desc    Get transaction by ID
 * @route   GET /api/payments/transactions/:id
 * @access  Private
 */
exports.getTransactionById = catchAsync(async (req, res, next) => {
    const transaction = await Transaction.findOne({
        _id: req.params.id,
        user: req.user._id
    });

    if (!transaction) {
        return next(new AppError('Transaction not found', 404));
    }

    sendSuccess(res, 200, 'Transaction retrieved', { transaction });
});

/**
 * @desc    Verify payment (manual verification)
 * @route   POST /api/payments/transactions/:id/verify
 * @access  Private (Admin only)
 */
exports.verifyTransaction = catchAsync(async (req, res, next) => {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) {
        return next(new AppError('Transaction not found', 404));
    }

    transaction.status = 'Completed';
    transaction.isVerified = true;
    transaction.verifiedBy = req.user._id;
    transaction.verifiedAt = Date.now();

    await transaction.save();

    sendSuccess(res, 200, 'Transaction verified successfully', { transaction });
});

/**
 * @desc    Get subscription packages
 * @route   GET /api/payments/packages
 * @access  Public
 */
exports.getPackages = catchAsync(async (req, res, next) => {
    const packages = [
        {
            tier: 'Standard',
            price: 1000,
            duration: 1,
            features: ['Basic case management', 'Document storage (5GB)', 'Email support']
        },
        {
            tier: 'Gold',
            price: 2500,
            duration: 1,
            features: ['All Standard features', 'Document storage (20GB)', 'Priority support', 'Marketplace listing']
        },
        {
            tier: 'Premium',
            price: 5000,
            duration: 1,
            features: ['All Gold features', 'Document storage (50GB)', '24/7 support', 'Featured profile', 'AI features']
        },
        {
            tier: 'Platinum',
            price: 10000,
            duration: 1,
            features: ['All Premium features', 'Unlimited storage', 'Dedicated account manager', 'Custom branding']
        }
    ];

    sendSuccess(res, 200, 'Packages retrieved', { packages });
});

module.exports = exports;
