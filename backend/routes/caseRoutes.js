const express = require('express');
const caseController = require('../controllers/caseController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
    createCaseSchema,
    updateCaseSchema,
    addLawyerSchema,
    addTaskSchema,
    searchCaseSchema
} = require('../validators/caseValidators');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * Statistics and Search Routes (must come before :id routes)
 */

// Get case statistics
router.get('/statistics', caseController.getCaseStatistics);

// Search cases
router.get('/search', validate(searchCaseSchema, 'query'), caseController.searchCases);

// Get upcoming hearings
router.get('/upcoming-hearings', caseController.getUpcomingHearings);

/**
 * General Case Routes
 */

// Get all cases for current user & Create new case
router.route('/')
    .get(caseController.getMyCases)
    .post(
        restrictTo('lawyer'),
        validate(createCaseSchema),
        caseController.createCase
    );

/**
 * Specific Case Routes
 */

// Get, update, delete specific case
router.route('/:id')
    .get(caseController.getCaseById)
    .patch(validate(updateCaseSchema), caseController.updateCase)
    .delete(caseController.deleteCase);

// Archive case
router.post('/:id/archive', caseController.archiveCase);

/**
 * Case Team Management
 */

// Add lawyer to case
router.post(
    '/:id/lawyers',
    validate(addLawyerSchema),
    caseController.addLawyer
);

// Add clerk to case
router.post('/:id/clerks', caseController.addClerk);

/**
 * Task Management
 */

// Add task to case
router.post(
    '/:id/tasks',
    validate(addTaskSchema),
    caseController.addTask
);

// Update task status
router.patch('/:id/tasks/:taskId', caseController.updateTaskStatus);

module.exports = router;
