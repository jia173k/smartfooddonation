// ============ Rewards & Gamification Module ============

class RewardsManager {
    constructor() {
        this.userPoints = {};
        this.userBadges = {};
        this.leaderboard = [];
    }

    /**
     * Award points for various activities
     */
    awardPoints(userId, points, reason) {
        if (!this.userPoints[userId]) {
            this.userPoints[userId] = 0;
        }

        this.userPoints[userId] += points;

        // Notify user
        notificationManager.notifyRewardPoints(points, reason);

        // Check for badge unlocking
        this.checkBadgeUnlock(userId);

        return {
            userId,
            pointsAwarded: points,
            totalPoints: this.userPoints[userId],
            reason
        };
    }

    /**
     * Points for different activities
     */
    calculatePoints(activity, amount = 1) {
        const pointsMap = {
            'first_donation': 100,
            'donation_posted': 10,
            'donation_accepted': 25,
            'donation_delivered': 50,
            'kg_donated': 5, // per kg
            'ngo_joined': 100,
            'donation_received': 10,
            'kg_received': 2, // per kg
            'donation_reviewed': 15,
            'community_feedback': 20
        };

        return (pointsMap[activity] || 0) * amount;
    }

    /**
     * Get user total points
     */
    getTotalPoints(userId) {
        return this.userPoints[userId] || 0;
    }

    /**
     * Define badges
     */
    getBadges() {
        return {
            'first_donor': {
                name: 'First Donor',
                icon: '🌟',
                description: 'Made your first donation',
                requirement: 'Post 1 donation',
                points: 0
            },
            'helper': {
                name: 'Helper',
                icon: '🤝',
                description: 'Helped someone in need',
                requirement: 'Successfully deliver 1 donation',
                points: 50
            },
            'champion': {
                name: 'Champion',
                icon: '👑',
                description: 'Delivered 10 successful donations',
                requirement: '10 successful deliveries',
                points: 250
            },
            'eco_warrior': {
                name: 'Eco Warrior',
                icon: '🌱',
                description: 'Saved 100kg of food',
                requirement: '100kg total donations',
                points: 500
            },
            'legend': {
                name: 'Legend',
                icon: '⚡',
                description: 'Saved 500kg of food',
                requirement: '500kg total donations',
                points: 1000
            },
            'guardian': {
                name: 'Guardian',
                icon: '🛡️',
                description: 'Maintain 4.8+ rating',
                requirement: '4.8+ rating for 6 months',
                points: 750
            },
            'speedster': {
                name: 'Speedster',
                icon: '⚡',
                description: 'Complete 5 donations within 1 week',
                requirement: '5 donations in 7 days',
                points: 300
            },
            'trusted': {
                name: 'Trusted Partner',
                icon: '✅',
                description: 'Verified account with perfect record',
                requirement: '10 successful donations',
                points: 400
            }
        };
    }

    /**
     * Unlock a badge
     */
    unlockBadge(userId, badgeId) {
        if (!this.userBadges[userId]) {
            this.userBadges[userId] = [];
        }

        if (!this.userBadges[userId].includes(badgeId)) {
            this.userBadges[userId].push(badgeId);

            const badges = this.getBadges();
            const badge = badges[badgeId];

            if (badge) {
                notificationManager.notifyBadgeUnlocked(badge.name);
            }

            return true;
        }

        return false;
    }

    /**
     * Check and automatically unlock badges
     */
    checkBadgeUnlock(userId) {
        // Mock logic - would be more complex in real app
        const stats = userType === 'donor' 
            ? donorManager.getDonorStats(userId)
            : ngoManager.getNGOStats(userId);

        if (stats.totalDonations === 1) {
            this.unlockBadge(userId, 'first_donor');
        }
        if (stats.totalDonations === 10) {
            this.unlockBadge(userId, 'trusted');
        }
        if (stats.totalQuantity >= 100) {
            this.unlockBadge(userId, 'eco_warrior');
        }
    }

    /**
     * Get user badges
     */
    getUserBadges(userId) {
        const badges = this.getBadges();
        const userBadgeIds = this.userBadges[userId] || [];

        return userBadgeIds.map(id => ({
            id,
            ...badges[id],
            earned: true
        })).concat(
            Object.entries(badges)
                .filter(([id]) => !userBadgeIds.includes(id))
                .map(([id, badge]) => ({
                    id,
                    ...badge,
                    earned: false
                }))
        );
    }

    /**
     * Get leaderboard
     */
    getLeaderboard(limit = 10) {
        const leaderboard = Object.entries(this.userPoints)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([userId, points], index) => ({
                rank: index + 1,
                userId,
                points,
                badges: (this.userBadges[userId] || []).length
            }));

        return leaderboard;
    }

    /**
     * Get user rank
     */
    getUserRank(userId) {
        const leaderboard = this.getLeaderboard(10000);
        const userRank = leaderboard.findIndex(u => u.userId === userId);
        return userRank >= 0 ? userRank + 1 : null;
    }

    /**
     * Redeem points (future feature)
     */
    redeemPoints(userId, points, reward) {
        const currentPoints = this.getTotalPoints(userId);

        if (currentPoints >= points) {
            this.userPoints[userId] -= points;

            notificationManager.sendNotification(
                'Points Redeemed',
                `You redeemed ${points} points for: ${reward}`,
                'success'
            );

            return {
                success: true,
                pointsRedeemed: points,
                reward,
                remainingPoints: this.userPoints[userId]
            };
        }

        return {
            success: false,
            message: 'Insufficient points'
        };
    }

    /**
     * Get available rewards for redemption
     */
    getAvailableRewards() {
        return [
            { id: 1, name: 'Discount Voucher', points: 100, description: '$5 off' },
            { id: 2, name: 'Premium Membership', points: 250, description: '1 month access' },
            { id: 3, name: 'Gift Card', points: 500, description: '$50 value' },
            { id: 4, name: 'Tree Planting', points: 150, description: 'Plant a tree in your name' }
        ];
    }

    /**
     * Get referral bonus
     */
    addReferralBonus(referrerId, newUserId) {
        const referralBonus = 50;
        this.awardPoints(referrerId, referralBonus, 'Referred a new user');
        return { success: true, pointsAwarded: referralBonus };
    }

    /**
     * Get achievement progress
     */
    getAchievementProgress(userId) {
        const stats = userType === 'donor'
            ? donorManager.getDonorStats(userId)
            : ngoManager.getNGOStats(userId);

        return {
            totalDonations: {
                current: stats.totalDonations,
                milestone: 10,
                percentage: (stats.totalDonations / 10) * 100
            },
            foodSaved: {
                current: Math.round(stats.totalQuantity || stats.totalFoodReceived),
                milestone: 100,
                percentage: ((stats.totalQuantity || stats.totalFoodReceived) / 100) * 100
            },
            rating: {
                current: stats.rating || 0,
                milestone: 4.8,
                percentage: ((stats.rating || 0) / 4.8) * 100
            },
            successRate: {
                current: stats.successRate || 0,
                milestone: 95,
                percentage: (stats.successRate || 0) / 95
            }
        };
    }
}

// Initialize rewards manager
const rewardsManager = new RewardsManager();

// Export for use in other modules
window.rewardsManager = rewardsManager;
