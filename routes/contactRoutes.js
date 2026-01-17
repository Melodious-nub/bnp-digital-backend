const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Public route - Submit contact form
router.post('/submit', contactController.submitContact);

// Private routes - Get messages
router.get('/messages', authenticateToken, authorizeRole('super_admin'), contactController.getAllMessages);
router.get('/my-messages', authenticateToken, contactController.getMyMessages);
router.put('/messages/:id/mark-read', authenticateToken, contactController.markAsRead);

module.exports = router;
