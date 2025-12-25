const mongoose = require('mongoose');

// User Schema (Donor and NGO)
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['donor', 'ngo', 'admin'],
        required: true
    },
    address: {
        type: String,
        required: true
    },
    location: {
        latitude: Number,
        longitude: Number,
        city: String,
        state: String,
        zipcode: String
    },
    // Donor specific fields
    organizationName: String,
    // NGO specific fields
    ngoName: String,
    dailyCapacity: Number,
    foodPreferences: [String],
    // Common fields
    profileImage: String,
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDocuments: [String],
    rewardPoints: {
        type: Number,
        default: 0
    },
    badges: [String],
    status: {
        type: String,
        enum: ['active', 'inactive', 'suspended'],
        default: 'active'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Donation Schema
const donationSchema = new mongoose.Schema({
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    foodType: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        default: 'kg'
    },
    freshness: {
        type: String,
        enum: ['fresh', 'good', 'fair'],
        required: true
    },
    expiryTime: {
        type: Date,
        required: true
    },
    description: String,
    images: [String],
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    status: {
        type: String,
        enum: ['posted', 'matched', 'accepted', 'delivered', 'cancelled', 'expired'],
        default: 'posted'
    },
    matchedNGO: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    deliveryMethod: {
        type: String,
        enum: ['donor', 'ngo', 'volunteer'],
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    deliveredAt: Date
});

// Match Schema
const matchSchema = new mongoose.Schema({
    donationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation',
        required: true
    },
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    ngoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    matchScore: {
        type: Number,
        required: true
    },
    distance: Number,
    eta: Number, // in minutes
    status: {
        type: String,
        enum: ['proposed', 'accepted', 'declined', 'expired'],
        default: 'proposed'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    acceptedAt: Date,
    declinedAt: Date
});

// Reward Schema
const rewardSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    reason: String,
    activity: {
        type: String,
        enum: ['donation_posted', 'donation_accepted', 'donation_delivered', 'donation_received', 'badge_unlocked', 'referral']
    },
    relatedEntityId: mongoose.Schema.Types.ObjectId,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Badge Schema
const badgeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    badgeId: String,
    badgeName: String,
    badgeIcon: String,
    unlockedAt: {
        type: Date,
        default: Date.now
    }
});

// Notification Schema
const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: String,
    message: String,
    type: {
        type: String,
        enum: ['donation', 'match', 'delivery', 'reward', 'alert'],
        required: true
    },
    relatedEntityId: mongoose.Schema.Types.ObjectId,
    relatedEntityType: String,
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Review Schema
const reviewSchema = new mongoose.Schema({
    reviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    revieweeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    relatedDonationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Donation'
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Create Models
const User = mongoose.model('User', userSchema);
const Donation = mongoose.model('Donation', donationSchema);
const Match = mongoose.model('Match', matchSchema);
const Reward = mongoose.model('Reward', rewardSchema);
const Badge = mongoose.model('Badge', badgeSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Review = mongoose.model('Review', reviewSchema);

module.exports = {
    User,
    Donation,
    Match,
    Reward,
    Badge,
    Notification,
    Review
};
