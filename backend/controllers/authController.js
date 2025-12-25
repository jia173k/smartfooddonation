const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Register user
exports.register = async (req, res) => {
    try {
        const { name, email, password, phone, role, address, organizationName, ngoName, dailyCapacity } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role,
            address,
            organizationName: role === 'donor' ? organizationName : undefined,
            ngoName: role === 'ngo' ? ngoName : undefined,
            dailyCapacity: role === 'ngo' ? dailyCapacity : undefined
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, role: newUser.role },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check user status
        if (user.status !== 'active') {
            return res.status(403).json({ error: 'User account is inactive or suspended' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your_secret_key',
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                rating: user.rating,
                rewardPoints: user.rewardPoints
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Logout
exports.logout = (req, res) => {
    res.json({ message: 'Logout successful' });
};

// Update password
exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id);

        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
