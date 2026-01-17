const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/gallery', authenticateToken, upload.array('files', 50), mediaController.uploadGalleryFiles);
router.delete('/gallery/:id', authenticateToken, mediaController.deleteGalleryItem);

// Admin Gallery Upload
router.post('/gallery/admin', authenticateToken, authorizeRole('super_admin'), upload.array('files', 50), mediaController.uploadCandidateGalleryAdmin);

// Admin Profile Photo Update
router.post('/profile-photo/:slug', authenticateToken, authorizeRole('super_admin'), upload.single('file'), mediaController.updateCandidateProfilePhoto);

module.exports = router;
