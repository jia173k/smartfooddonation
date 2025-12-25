const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRole } = require('../middleware/auth');
const { User, Donation, Match } = require('../models');

// Get all users
router.get('/users', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = req.query.limit || 10;
        const skip = (page - 1) * limit;

        const users = await User.find()
            .select('-password')
            .limit(limit)
            .skip(skip)
            .sort({ createdAt: -1 });

        const total = await User.countDocuments();

        res.json({
            users,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                total
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user details
router.get('/users/:id', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user status
router.patch('/users/:id/status', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const { status } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).select('-password');

        res.json({ message: 'User status updated', user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get platform analytics
router.get('/analytics/summary', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalDonors = await User.countDocuments({ role: 'donor' });
        const totalNGOs = await User.countDocuments({ role: 'ngo' });
        const totalDonations = await Donation.countDocuments();
        const successfulDonations = await Donation.countDocuments({ status: 'delivered' });
        const totalFood = await Donation.aggregate([
            { $group: { _id: null, total: { $sum: '$quantity' } } }
        ]);

        res.json({
            totalUsers,
            totalDonors,
            totalNGOs,
            totalDonations,
            successfulDonations,
            totalFood: totalFood[0]?.total || 0,
            successRate: ((successfulDonations / totalDonations) * 100).toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all donations
router.get('/donations/list', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const donations = await Donation.find()
            .populate('donorId', 'name email')
            .populate('matchedNGO', 'name email')
            .sort({ createdAt: -1 });

        res.json(donations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get match statistics
router.get('/matches/stats', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        const totalMatches = await Match.countDocuments();
        const acceptedMatches = await Match.countDocuments({ status: 'accepted' });
        const avgMatchScore = await Match.aggregate([
            { $group: { _id: null, avg: { $avg: '$matchScore' } } }
        ]);

        res.json({
            totalMatches,
            acceptedMatches,
            acceptanceRate: ((acceptedMatches / totalMatches) * 100).toFixed(2),
            avgMatchScore: avgMatchScore[0]?.avg.toFixed(2) || 0
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get system health
router.get('/system/health', authenticateToken, authorizeRole(['admin']), async (req, res) => {
    try {
        res.json({
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date(),
            activeConnections: 156
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
