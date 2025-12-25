# Database Schema Documentation

## MongoDB Collections

### 1. Users Collection

```javascript
{
  _id: ObjectId,
  name: String,                    // Full name
  email: String (unique),          // Email address
  password: String,                // Hashed password
  phone: String,                   // Contact number
  role: String,                    // 'donor', 'ngo', 'admin'
  address: String,                 // Physical address
  location: {
    latitude: Number,
    longitude: Number,
    city: String,
    state: String,
    zipcode: String
  },
  
  // Donor specific
  organizationName: String,        // Restaurant/Business name
  
  // NGO specific
  ngoName: String,                 // NGO name
  dailyCapacity: Number,           // kg per day
  foodPreferences: [String],       // Food types preferred
  
  // Common fields
  profileImage: String,            // Image URL
  rating: Number,                  // 0-5 rating
  reviewCount: Number,             // Number of reviews
  isVerified: Boolean,             // Verification status
  verificationDocuments: [String], // Document URLs
  rewardPoints: Number,            // Total points
  badges: [String],                // Unlocked badge IDs
  status: String,                  // 'active', 'inactive', 'suspended'
  createdAt: Date,                 // Registration date
  updatedAt: Date                  // Last update
}
```

### 2. Donations Collection

```javascript
{
  _id: ObjectId,
  donorId: ObjectId (ref: User),   // Donor reference
  foodType: String,                // Type of food
  quantity: Number,                // Amount in kg
  unit: String,                    // 'kg' (default)
  freshness: String,               // 'fresh', 'good', 'fair'
  expiryTime: Date,                // When food expires
  description: String,             // Additional info
  images: [String],                // Photo URLs
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  status: String,                  // 'posted', 'matched', 'accepted',
                                   // 'delivered', 'cancelled', 'expired'
  matchedNGO: ObjectId (ref: User),// Matched NGO
  deliveryMethod: String,          // 'donor', 'ngo', 'volunteer', null
  createdAt: Date,                 // Posted time
  updatedAt: Date,
  deliveredAt: Date                // Delivery time
}
```

### 3. Matches Collection

```javascript
{
  _id: ObjectId,
  donationId: ObjectId (ref: Donation),  // Linked donation
  donorId: ObjectId (ref: User),         // Donor ID
  ngoId: ObjectId (ref: User),           // NGO ID
  matchScore: Number,                    // 0-100 score
  distance: Number,                      // in km
  eta: Number,                           // in minutes
  status: String,                        // 'proposed', 'accepted',
                                         // 'declined', 'expired'
  createdAt: Date,                       // When match created
  acceptedAt: Date,                      // When accepted
  declinedAt: Date                       // When declined
}
```

### 4. Rewards Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),          // User ID
  points: Number,                        // Points awarded
  reason: String,                        // Why points awarded
  activity: String,                      // Activity type
  relatedEntityId: ObjectId,             // Related donation/match ID
  createdAt: Date                        // Award time
}
```

### 5. Badges Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),          // User ID
  badgeId: String,                       // Badge identifier
  badgeName: String,                     // Badge display name
  badgeIcon: String,                     // Emoji icon
  unlockedAt: Date                       // When unlocked
}
```

### 6. Notifications Collection

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),          // Recipient
  title: String,                         // Notification title
  message: String,                       // Notification content
  type: String,                          // 'donation', 'match', 'delivery',
                                         // 'reward', 'alert'
  relatedEntityId: ObjectId,             // Linked document ID
  relatedEntityType: String,             // Type of linked entity
  read: Boolean,                         // Read status
  createdAt: Date                        // Creation time
}
```

### 7. Reviews Collection

```javascript
{
  _id: ObjectId,
  reviewerId: ObjectId (ref: User),      // Who reviewed
  revieweeId: ObjectId (ref: User),      // Who was reviewed
  relatedDonationId: ObjectId (ref: Donation), // Related donation
  rating: Number,                        // 1-5 rating
  comment: String,                       // Review text
  createdAt: Date                        // Review date
}
```

## Indexes

For optimal performance, create these indexes:

```javascript
// Users
db.users.createIndex({ email: 1 });
db.users.createIndex({ status: 1 });
db.users.createIndex({ role: 1 });
db.users.createIndex({ createdAt: -1 });
db.users.createIndex({ "location": "2dsphere" }); // Geo-spatial

// Donations
db.donations.createIndex({ donorId: 1 });
db.donations.createIndex({ status: 1 });
db.donations.createIndex({ createdAt: -1 });
db.donations.createIndex({ expiryTime: 1 });
db.donations.createIndex({ "location": "2dsphere" }); // Geo-spatial
db.donations.createIndex({ status: 1, createdAt: -1 });

// Matches
db.matches.createIndex({ donationId: 1 });
db.matches.createIndex({ donorId: 1 });
db.matches.createIndex({ ngoId: 1 });
db.matches.createIndex({ status: 1 });
db.matches.createIndex({ createdAt: -1 });

// Rewards
db.rewards.createIndex({ userId: 1 });
db.rewards.createIndex({ createdAt: -1 });

// Badges
db.badges.createIndex({ userId: 1 });

// Notifications
db.notifications.createIndex({ userId: 1 });
db.notifications.createIndex({ read: 1 });
db.notifications.createIndex({ createdAt: -1 });

// Reviews
db.reviews.createIndex({ revieweeId: 1 });
db.reviews.createIndex({ createdAt: -1 });
```

## Data Relationships

```
User
├── Donations (1 to Many)
├── Rewards (1 to Many)
├── Badges (1 to Many)
├── Notifications (1 to Many)
├── Reviews Given (1 to Many)
└── Reviews Received (1 to Many)

Donation
├── Donor (Many to 1 User)
├── MatchedNGO (Many to 1 User)
├── Matches (1 to Many)
└── Reviews (1 to Many)

Match
├── Donation (Many to 1)
├── Donor (Many to 1 User)
└── NGO (Many to 1 User)

Review
├── Reviewer (Many to 1 User)
├── Reviewee (Many to 1 User)
└── Related Donation (Many to 1)
```

## Data Size Estimates

For 10,000 users platform:
- **Users**: ~10,000 documents (~2.5 MB)
- **Donations**: ~50,000 documents (~15 MB)
- **Matches**: ~40,000 documents (~8 MB)
- **Rewards**: ~100,000 documents (~10 MB)
- **Notifications**: ~500,000 documents (~100 MB)
- **Reviews**: ~10,000 documents (~2.5 MB)

**Total: ~150 MB** (with media files on separate storage)

## Backup Strategy

```bash
# Daily backup
mongodump --db smartfood --out /backups/daily/$(date +%Y%m%d)

# Weekly archive
tar -czf /backups/weekly/smartfood_$(date +%Y%m%d).tar.gz \
  /backups/daily/$(date +%Y%m%d)

# Monthly cloud backup
aws s3 cp /backups/weekly/smartfood_*.tar.gz s3://smartfood-backups/
```

## Migration Guide (Schema Updates)

### Example: Add new field to Users

```javascript
// Add new field with default value
db.users.updateMany(
  {},
  { $set: { newField: defaultValue } }
);
```

### Example: Rename field

```javascript
db.users.updateMany(
  {},
  { $rename: { "oldField": "newField" } }
);
```

### Example: Remove field

```javascript
db.users.updateMany(
  {},
  { $unset: { fieldToRemove: "" } }
);
```

## Query Examples

### Find active donations within 5km
```javascript
db.donations.find({
  status: "posted",
  location: {
    $near: {
      $geometry: {
        type: "Point",
        coordinates: [longitude, latitude]
      },
      $maxDistance: 5000
    }
  }
});
```

### Get user statistics
```javascript
db.donations.aggregate([
  { $match: { donorId: ObjectId("...") } },
  { $group: {
    _id: "$donorId",
    totalDonations: { $sum: 1 },
    totalQuantity: { $sum: "$quantity" },
    avgFreshness: { $avg: "$freshness" }
  }}
]);
```

### Get leaderboard
```javascript
db.users.find({ status: "active" })
  .sort({ rewardPoints: -1 })
  .limit(10);
```

## Data Validation Rules

- **Email**: Must be unique, valid format
- **Phone**: Must be 10+ digits
- **Rating**: Must be 0-5
- **Quantity**: Must be > 0
- **Match Score**: Must be 0-100
- **Status**: Must match predefined enum
- **Role**: Must be 'donor', 'ngo', or 'admin'

---

**Database designed for scalability and performance! 💾**
