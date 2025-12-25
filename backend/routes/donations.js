const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationController');
const { authenticateToken, authorizeRole } = require('../middleware/auth');

// Create donation
router.post('/', authenticateToken, authorizeRole(['donor']), donationController.createDonation);

// Get all donations
router.get('/', authenticateToken, donationController.getDonations);

// Get donation by ID
router.get('/:id', authenticateToken, donationController.getDonationById);

// Get donor's donations
router.get('/my-donations', authenticateToken, authorizeRole(['donor']), donationController.getDonorDonations);

// Update donation status
router.patch('/:id/status', authenticateToken, donationController.updateDonationStatus);

// Cancel donation
router.post('/:id/cancel', authenticateToken, donationController.cancelDonation);

// Get statistics
router.get('/stats/summary', authenticateToken, donationController.getDonationStats);

module.exports = router;
