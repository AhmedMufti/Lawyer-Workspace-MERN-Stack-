const express = require('express');
const documentController = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const { uploadSingle, handleMulterError } = require('../middleware/uploadMiddleware');

const router = express.Router();

// All routes require authentication
router.use(protect);

/**
 * Statistics and Search Routes
 */

// Get document statistics
router.get('/statistics', documentController.getDocumentStatistics);

// Search documents
router.get('/search', documentController.searchDocuments);

// Get my uploads
router.get('/my-uploads', documentController.getMyUploads);

/**
 * Case Documents
 */

// Upload document to case
router.post(
    '/:caseId',
    uploadSingle,
    handleMulterError,
    documentController.uploadDocument
);

// Get all documents for a case
router.get('/case/:caseId', documentController.getCaseDocuments);

/**
 * Specific Document Routes
 */

// Get, update, delete specific document
router.route('/:id')
    .get(documentController.getDocumentById)
    .patch(documentController.updateDocument)
    .delete(documentController.deleteDocument);

// Download document
router.get('/:id/download', documentController.downloadDocument);

module.exports = router;
