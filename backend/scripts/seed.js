require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, Donation } = require('../models');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartfood';

async function connect() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB for seeding');
}

async function clearAndSeed() {
  try {
    // Remove demo users with these emails if they exist
    const demoEmails = ['donor@example.com', 'ngo@example.com', 'admin@example.com'];
    await User.deleteMany({ email: { $in: demoEmails } });

    // Create users
    const salt = await bcrypt.genSalt(10);
    const donorPass = await bcrypt.hash('password123', salt);
    const ngoPass = await bcrypt.hash('password123', salt);
    const adminPass = await bcrypt.hash('password123', salt);

    const donor = new User({
      name: 'Demo Donor',
      email: 'donor@example.com',
      password: donorPass,
      phone: '0000000000',
      role: 'donor',
      address: '123 Demo Street',
      organizationName: 'Demo Restaurant',
      location: { latitude: 51.5074, longitude: -0.1278, city: 'DemoCity' },
      isVerified: true,
      rewardPoints: 120
    });

    const ngo = new User({
      name: 'Demo NGO',
      email: 'ngo@example.com',
      password: ngoPass,
      phone: '0000000001',
      role: 'ngo',
      address: '45 Charity Ave',
      ngoName: 'Demo Food Bank',
      dailyCapacity: 200,
      location: { latitude: 51.5098, longitude: -0.1180, city: 'DemoCity' },
      isVerified: true
    });

    const admin = new User({
      name: 'Platform Admin',
      email: 'admin@example.com',
      password: adminPass,
      phone: '0000000002',
      role: 'admin',
      address: 'Platform HQ',
      isVerified: true
    });

    await donor.save();
    await ngo.save();
    await admin.save();

    console.log('Created demo users: donor, ngo, admin');

    // Create demo donations
    await Donation.deleteMany({ donorId: donor._id });

    const donations = [
      {
        donorId: donor._id,
        foodType: 'Cooked Rice',
        quantity: 5,
        freshness: 'fresh',
        deliveryMethod: 'donor',
        expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 4), // 4 hours
        description: 'Leftover cooked rice from evening service',
        location: { latitude: 51.5074, longitude: -0.1278, address: 'Demo Restaurant, 123 Demo Street' }
      },
      {
        donorId: donor._id,
        foodType: 'Mixed Vegetables',
        quantity: 8,
        freshness: 'good',
        deliveryMethod: 'donor',
        expiryTime: new Date(Date.now() + 1000 * 60 * 60 * 6), // 6 hours
        description: 'Extra vegetables pack',
        location: { latitude: 51.5074, longitude: -0.1278, address: 'Demo Restaurant, 123 Demo Street' }
      }
    ];

    await Donation.insertMany(donations);
    console.log('Inserted demo donations');

    console.log('\nSeeding complete. Demo accounts:');
    console.log('donor@example.com / password123');
    console.log('ngo@example.com / password123');
    console.log('admin@example.com / password123');

    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

connect().then(clearAndSeed).catch(err => {
  console.error('Connection failed:', err);
  process.exit(1);
});
