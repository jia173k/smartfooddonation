const express = require('express');
const router = express.Router();

// Placeholder routes for NGOs
router.get('/profile', (req, res) => {
    res.json({ message: 'NGO profile' });
});

router.get('/available-donations', (req, res) => {
    res.json({ message: 'Available donations for NGO' });
});

router.get('/inventory', (req, res) => {
    res.json({ message: 'NGO inventory' });
});

module.exports = router;
