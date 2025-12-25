const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { Notification } = require('../models');

// Get user notifications
router.get('/', authenticateToken, async (req, res) => {
    try {
        const notifications = await Notification.find({ userId: req.user.id })
            .sort({ createdAt: -1 })
            .limit(20);

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );

        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get unread notification count
router.get('/unread/count', authenticateToken, async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            userId: req.user.id,
            read: false
        });

        res.json({ unreadCount: count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Clear all notifications
router.delete('/clear/all', authenticateToken, async (req, res) => {
    try {
        await Notification.deleteMany({ userId: req.user.id });
        res.json({ message: 'All notifications cleared' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
