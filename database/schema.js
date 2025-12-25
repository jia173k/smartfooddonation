/*
===========================================
MongoDB Database Schema for FoodShare
===========================================
*/

// === Users Collection ===
db.createCollection("users");
db.users.insertOne({
    _id: ObjectId(),
    name: "John Donor",
    email: "donor@example.com",
    password: "$2a$10$...", // bcrypt hashed
    role: "donor", // donor, ngo, admin, volunteer
    phone: "+91 9876543210",
    address: "123 Main Street",
    city: "Delhi",
    latitude: 28.7041,
    longitude: 77.1025,
    profileImage: null,
    isActive: true,
    createdAt: ISODate("2024-12-08T10:00:00Z")
});

// === Donations Collection ===
db.createCollection("donations");
db.donations.insertOne({
    _id: ObjectId(),
    donorId: ObjectId(), // Reference to donor user
    foodType: "Biryani",
    quantity: 5,
    unit: "kg",
    quality: "fresh", // fresh, good, acceptable
    expiryTime: ISODate("2024-12-08T18:00:00Z"),
    safeConsumptionTime: ISODate("2024-12-08T20:00:00Z"),
    location: {
        latitude: 28.7041,
        longitude: 77.1025,
        address: "Delhi"
    },
    status: "available", // available, matched, accepted, picked, donated, expired
    description: "Freshly cooked biryani, can serve 10 people",
    image: null,
    matchedNGO: ObjectId(), // Reference to NGO user
    createdAt: ISODate("2024-12-08T10:00:00Z")
});

// === Notifications Collection ===
db.createCollection("notifications");
db.notifications.insertOne({
    _id: ObjectId(),
    recipientId: ObjectId(), // Reference to user
    type: "donation_match", // donation_match, donation_accepted, reward_earned
    title: "🍽️ New Food Donation Available",
    message: "5kg of Biryani is available for pickup",
    donationId: ObjectId(), // Reference to donation
    isRead: false,
    createdAt: ISODate("2024-12-08T10:05:00Z")
});

// === Rewards Collection ===
db.createCollection("rewards");
db.rewards.insertOne({
    _id: ObjectId(),
    userId: ObjectId(), // Reference to donor user
    points: 150,
    badges: [
        {
            name: "First Donor",
            icon: "🎉",
            unlockedAt: ISODate("2024-12-08T10:00:00Z")
        }
    ],
    level: "silver", // bronze, silver, gold, platinum
    totalDonations: 15,
    createdAt: ISODate("2024-12-08T10:00:00Z"),
    updatedAt: ISODate("2024-12-08T10:00:00Z")
});

// === CREATE INDEXES ===
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.donations.createIndex({ donorId: 1 });
db.donations.createIndex({ matchedNGO: 1 });
db.donations.createIndex({ status: 1 });
db.notifications.createIndex({ recipientId: 1 });
db.rewards.createIndex({ userId: 1 }, { unique: true });

// Setup instructions saved
