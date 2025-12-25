const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

// Register
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Get current user
router.get('/me', authenticateToken, authController.getCurrentUser);

// Logout
router.post('/logout', authenticateToken, authController.logout);

// Update password
router.post('/update-password', authenticateToken, authController.updatePassword);

module.exports = router;
