const { Reward, Badge, User } = require('../models');

// Award points
exports.awardPoints = async (req, res) => {
    try {
        const { userId, points, reason, activity } = req.body;

        const reward = new Reward({
            userId,
            points,
            reason,
            activity
        });

        await reward.save();

        // Update user's total points
        const user = await User.findById(userId);
        user.rewardPoints += points;
        await user.save();

        // Check for badge unlocks
        await checkBadgeUnlocks(userId);

        res.status(201).json({
            message: 'Points awarded',
            reward,
            totalPoints: user.rewardPoints
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's total points
exports.getUserPoints = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const rewards = await Reward.find({ userId: req.user.id }).sort({ createdAt: -1 });

        res.json({
            totalPoints: user.rewardPoints,
            rewardHistory: rewards
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Unlock badge
const checkBadgeUnlocks = async (userId) => {
    try {
        const user = await User.findById(userId);
        const badges = {
            'first_donor': { name: 'First Donor', requirement: 'donations >= 1' },
            'trusted': { name: 'Trusted Partner', requirement: 'donations >= 10' },
            'champion': { name: 'Champion', requirement: 'donations >= 25' },
            'eco_warrior': { name: 'Eco Warrior', requirement: 'points >= 500' },
            'legend': { name: 'Legend', requirement: 'points >= 1000' }
        };

        for (const [badgeId, badge] of Object.entries(badges)) {
            // Check if badge already unlocked
            const existing = await Badge.findOne({ userId, badgeId });
            if (existing) continue;

            // Check requirements and unlock
            let shouldUnlock = false;

            if (badgeId === 'first_donor' && user.rewardPoints >= 10) shouldUnlock = true;
            if (badgeId === 'trusted' && user.rewardPoints >= 250) shouldUnlock = true;
            if (badgeId === 'champion' && user.rewardPoints >= 500) shouldUnlock = true;
            if (badgeId === 'eco_warrior' && user.rewardPoints >= 500) shouldUnlock = true;
            if (badgeId === 'legend' && user.rewardPoints >= 1000) shouldUnlock = true;

            if (shouldUnlock) {
                const newBadge = new Badge({
                    userId,
                    badgeId,
                    badgeName: badge.name
                });
                await newBadge.save();
                user.badges.push(badgeId);
            }
        }

        await user.save();
    } catch (error) {
        console.error('Error checking badge unlocks:', error);
    }
};

// Get user badges
exports.getUserBadges = async (req, res) => {
    try {
        const badges = await Badge.find({ userId: req.user.id });
        res.json(badges);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get leaderboard
exports.getLeaderboard = async (req, res) => {
    try {
        const limit = req.query.limit || 10;

        const leaderboard = await User.find({ status: 'active' })
            .sort({ rewardPoints: -1 })
            .limit(parseInt(limit))
            .select('name rewardPoints rating');

        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get reward history
exports.getRewardHistory = async (req, res) => {
    try {
        const rewards = await Reward.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(rewards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Redeem points
exports.redeemPoints = async (req, res) => {
    try {
        const { pointsToRedeem, rewardId } = req.body;

        const user = await User.findById(req.user.id);

        if (user.rewardPoints < pointsToRedeem) {
            return res.status(400).json({ error: 'Insufficient points' });
        }

        user.rewardPoints -= pointsToRedeem;
        await user.save();

        res.json({
            message: 'Points redeemed successfully',
            remainingPoints: user.rewardPoints,
            rewardId
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get rewards statistics
exports.getRewardsStats = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const totalRewards = await Reward.countDocuments({ userId: req.user.id });
        const badgesCount = await Badge.countDocuments({ userId: req.user.id });

        res.json({
            totalPoints: user.rewardPoints,
            totalRewards,
            badgesUnlocked: badgesCount,
            level: calculateLevel(user.rewardPoints)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Calculate level based on points
function calculateLevel(points) {
    if (points < 100) return 'Beginner';
    if (points < 250) return 'Helper';
    if (points < 500) return 'Champion';
    if (points < 1000) return 'Hero';
    return 'Legend';
}
