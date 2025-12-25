const express = require('express');
const router = express.Router();

// Placeholder routes for donors
router.get('/profile', (req, res) => {
    res.json({ message: 'Donor profile' });
});

router.get('/stats', (req, res) => {
    res.json({ message: 'Donor statistics' });
});

module.exports = router;
