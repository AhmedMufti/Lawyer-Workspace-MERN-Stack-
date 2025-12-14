const express = require('express');
const hearingController = require('../controllers/hearingController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * Special Routes (must come before :id routes)
 */

// Get upcoming hearings
router.get('/upcoming', hearingController.getUpcomingHearings);

// Get today's hearings
router.get('/today', hearingController.getTodayHearings);

/**
 * Case Hearings
 */

// Schedule new hearing for a case
router.post('/:caseId', hearingController.scheduleHearing);

// Get all hearings for a case
router.get('/case/:caseId', hearingController.getCaseHearings);

/**
 * Specific Hearing Routes
 */

// Get, update, delete specific hearing
router.route('/:id')
    .get(hearingController.getHearingById)
    .patch(hearingController.updateHearing)
    .delete(hearingController.deleteHearing);

// Add proceedings to hearing
router.post('/:id/proceedings', hearingController.addProceedings);

// Mark hearing as completed
router.post('/:id/complete', hearingController.completeHearing);

// Adjourn hearing
router.post('/:id/adjourn', hearingController.adjournHearing);

module.exports = router;
