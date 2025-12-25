const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
const { authenticateToken } = require('../middleware/auth');

// Award points
router.post('/award', authenticateToken, rewardController.awardPoints);

// Get user's points
router.get('/points', authenticateToken, rewardController.getUserPoints);

// Get user badges
router.get('/badges', authenticateToken, rewardController.getUserBadges);

// Get leaderboard
router.get('/leaderboard', rewardController.getLeaderboard);

// Get reward history
router.get('/history', authenticateToken, rewardController.getRewardHistory);

// Redeem points
router.post('/redeem', authenticateToken, rewardController.redeemPoints);

// Get rewards statistics
router.get('/stats', authenticateToken, rewardController.getRewardsStats);

module.exports = router;
