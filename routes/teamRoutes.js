const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticateToken } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/public', teamController.getPublicGlobalTeam);
router.get('/public/:slug', teamController.getPublicTeamByCandidateSlug);
router.get('/', authenticateToken, teamController.getTeamMembers);
router.post('/', authenticateToken, upload.single('image'), teamController.addTeamMember);
router.put('/:id', authenticateToken, upload.single('image'), teamController.updateTeamMember);
router.delete('/:id', authenticateToken, teamController.deleteTeamMember);

module.exports = router;
