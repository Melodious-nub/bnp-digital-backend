const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

const upload = require('../middleware/upload');

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new candidate
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               candidateNameEn: { type: string }
 *               candidateNameBn: { type: string }
 *               divisionId: { type: integer }
 *               districtId: { type: integer }
 *               constituteNo: { type: integer }
 *               password: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201:
 *         description: User registered
 */
router.post('/register', upload.single('image'), authController.register);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: User login
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Success
 */
router.post('/login', authController.login);

const { authenticateToken } = require('../middleware/auth');

/**
 * @openapi
 * /api/auth/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Update candidate profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile updated
 */
router.put('/profile', authenticateToken, upload.single('image'), authController.updateProfile);

/**
 * @openapi
 * /api/auth/divisions:
 *   get:
 *     tags: [Auth]
 *     summary: Get all divisions
 */
router.get('/divisions', authController.getDivisions);

/**
 * @openapi
 * /api/auth/districts:
 *   get:
 *     tags: [Auth]
 *     summary: Get districts
 */
router.get('/districts', authController.getDistricts);

/**
 * @openapi
 * /api/auth/constituencies:
 *   get:
 *     tags: [Auth]
 *     summary: Get constituencies
 */
router.get('/constituencies', authController.getConstituencies);

module.exports = router;
