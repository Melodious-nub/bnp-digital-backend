const express = require('express');
const router = express.Router();
const excelController = require('../controllers/excelController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for Excel parsing

router.post('/import', authenticateToken, authorizeRole(['super_admin']), upload.single('file'), excelController.importCandidates);

module.exports = router;
