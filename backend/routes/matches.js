const express = require('express');
const router = express.Router();
const matchController = require('../controllers/matchController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Create match
router.post('/', authenticateToken, matchController.createMatch);

// Get all matches
router.get('/', authenticateToken, matchController.getAllMatches);

// Get user's matches
router.get('/my-matches', authenticateToken, matchController.getUserMatches);

// Accept match
router.post('/:id/accept', authenticateToken, authorizeRole(['ngo']), matchController.acceptMatch);

// Decline match
router.post('/:id/decline', authenticateToken, authorizeRole(['ngo']), matchController.declineMatch);

// Get match statistics
router.get('/stats/summary', authenticateToken, matchController.getMatchStatistics);

module.exports = router;
