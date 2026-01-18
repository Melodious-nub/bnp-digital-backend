const express = require('express');
const router = express.Router();
const candidateController = require('../controllers/candidateController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

/**
 * @openapi
 * /api/candidates:
 *   get:
 *     summary: (Private) Get all candidates (Superadmin Only)
 *     tags: [Candidates]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticateToken, authorizeRole('super_admin'), candidateController.getAllCandidates);

/**
 * @openapi
 * /api/candidates/by-district:
 *   get:
 *     tags: [Candidates]
 *     summary: Get candidates by district
 */
router.get('/by-district', candidateController.getCandidatesByDistrict);

/**
 * @openapi
 * /api/candidates/profile/{slug}:
 *   get:
 *     tags: [Candidates]
 *     summary: Get profile by slug
 */
router.get('/profile/:slug', candidateController.getCandidateProfile);

/**
 * @openapi
 * /api/candidates/{id}:
 *   put:
 *     tags: [Candidates]
 *     summary: (Private) Update candidate profile (Superadmin Only)
 *     security:
 *       - bearerAuth: []
 */
router.put('/:slug', authenticateToken, authorizeRole('super_admin'), candidateController.updateCandidate);

module.exports = router;
