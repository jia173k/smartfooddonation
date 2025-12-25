require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smartfood');
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

connectDB();

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/donors', require('./routes/donors'));
app.use('/api/ngos', require('./routes/ngos'));
app.use('/api/donations', require('./routes/donations'));
app.use('/api/matches', require('./routes/matches'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/notifications', require('./routes/notifications'));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'Server is running', timestamp: new Date() });
});

// WebSocket events for real-time updates
io.on('connection', (socket) => {
    console.log('New user connected:', socket.id);

    // Join room based on user type
    socket.on('user_type', (userType) => {
        socket.join(userType);
        console.log(`User joined room: ${userType}`);
    });

    // Listen for donation posted events
    socket.on('donation_posted', (donationData) => {
        io.to('ngo').emit('new_donation', donationData);
        console.log('Donation posted:', donationData);
    });

    // Listen for donation accepted events
    socket.on('donation_accepted', (matchData) => {
        io.to('donor').emit('match_update', matchData);
        console.log('Donation accepted:', matchData);
    });

    // Listen for delivery updates
    socket.on('delivery_update', (deliveryData) => {
        io.emit('delivery_status', deliveryData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`✓ Server running on http://localhost:${PORT}`);
    console.log(`✓ WebSocket server running on ws://localhost:${PORT}`);
});

module.exports = { app, io };
