const express = require('express');
const researchController = require('../controllers/researchController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * GENERAL RESEARCH ROUTES
 */

// Get research statistics (public)
router.get('/statistics', researchController.getResearchStatistics);

/**
 * ACTS/LEGISLATION ROUTES
 */

// Search acts (public)
router.get('/acts/search', researchController.searchActs);

// Get acts by category (public)
router.get('/acts/category/:category', researchController.getActsByCategory);

// Get all acts & get act by ID
router.route('/acts')
    .get(researchController.getAllActs);

router.route('/acts/:id')
    .get(researchController.getActById);

// Download act PDF
router.get('/acts/:id/download', researchController.downloadAct);

/**
 * CASE LAW ROUTES
 */

// Search case laws (public)
router.get('/case-laws/search', researchController.searchCaseLaws);

// Get landmark cases (public)
router.get('/case-laws/landmark', researchController.getLandmarkCases);

// Get my bookmarks (private)
router.get('/case-laws/my-bookmarks', protect, researchController.getMyBookmarks);

// Get all case laws & get by ID
router.route('/case-laws')
    .get(researchController.getAllCaseLaws);

router.route('/case-laws/:id')
    .get(researchController.getCaseLawById);

// Bookmark operations (private)
router.route('/case-laws/:id/bookmark')
    .post(protect, researchController.bookmarkCaseLaw)
    .delete(protect, researchController.removeBookmark);

// Download case law PDF
router.get('/case-laws/:id/download', researchController.downloadCaseLaw);

/**
 * COURT FORMS ROUTES
 */

// Search forms (public)
router.get('/forms/search', researchController.searchForms);

// Get forms by category (public)
router.get('/forms/category/:category', researchController.getFormsByCategory);

// Get all forms & get by ID
router.route('/forms')
    .get(researchController.getAllForms);

router.route('/forms/:id')
    .get(researchController.getFormById);

// Download form (supports pdf, word, fillable)
router.get('/forms/:id/download', researchController.downloadForm);

module.exports = router;
