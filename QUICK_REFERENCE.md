# SmartFood - Quick Reference Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Installation
```bash
cd smartfooddonation
npm install
cp .env.example .env
```

### Step 2: Start Services
```bash
# Terminal 1: Start MongoDB
mongod

# Terminal 2: Start Backend
npm run dev

# Terminal 3 (or Browser): Open Frontend
open frontend/index.html
```

## 🎯 Testing the Platform

### Test Account 1: Donor
```
Email: donor@restaurant.com
Password: password123
Role: Food Donor
```

### Test Account 2: NGO
```
Email: ngo@foodbank.com
Password: password123
Role: NGO Receiver
```

### Test Account 3: Admin
```
Email: admin@smartfood.com
Password: password123
Role: Admin
```

## 📝 Key Features Quick Links

| Feature | File | Function |
|---------|------|----------|
| Authentication | `js/auth.js` | handleLogin() |
| Donations | `js/donor.js` | submitDonation() |
| Matching | `js/matching.js` | findMatches() |
| Notifications | `js/notification.js` | sendNotification() |
| Rewards | `js/rewards.js` | awardPoints() |
| Admin | `js/admin.js` | getAnalytics() |

## 🔌 API Quick Reference

### Auth Endpoints
```bash
POST   /api/auth/register    # Register new user
POST   /api/auth/login       # Login
GET    /api/auth/me          # Get current user
POST   /api/auth/logout      # Logout
```

### Donation Endpoints
```bash
POST   /api/donations        # Create donation
GET    /api/donations        # List donations
GET    /api/donations/:id    # Get details
PATCH  /api/donations/:id/status  # Update status
```

### Matching Endpoints
```bash
POST   /api/matches          # Create match
GET    /api/matches          # List matches
POST   /api/matches/:id/accept  # Accept match
POST   /api/matches/:id/decline # Decline match
```

### Reward Endpoints
```bash
POST   /api/rewards/award    # Award points
GET    /api/rewards/points   # Get points
GET    /api/rewards/leaderboard # Get leaderboard
```

## 🎨 Color Reference

```css
--primary-dark: #C9A5DB     /* Purple */
--primary-light: #E8D5F2    /* Light Purple */
--accent-green: #98C8A3     /* Green - Success */
--accent-blue: #D5E0F2      /* Blue */
--accent-peach: #F5E0D5     /* Peach */
--danger: #D9A5A5           /* Red - Alerts */
```

## 📂 File Structure at a Glance

```
frontend/
├── index.html          (Main UI)
├── styles/
│   ├── style.css      (Global styles)
│   ├── components.css (Components)
│   └── dashboard.css  (Dashboard)
└── js/
    ├── main.js        (Core logic)
    ├── auth.js        (Authentication)
    ├── donor.js       (Donor features)
    ├── ngo.js         (NGO features)
    ├── matching.js    (Matching algorithm)
    ├── notification.js (Alerts)
    ├── rewards.js     (Gamification)
    └── admin.js       (Admin panel)

backend/
├── server.js          (Express app)
├── models/
│   └── index.js      (Database schemas)
├── controllers/
│   ├── authController.js
│   ├── donationController.js
│   ├── matchController.js
│   └── rewardController.js
├── routes/
│   ├── auth.js
│   ├── donations.js
│   ├── matches.js
│   ├── rewards.js
│   ├── admin.js
│   ├── donors.js
│   ├── ngos.js
│   └── notifications.js
└── middleware/
    └── auth.js       (JWT validation)
```

## 🔑 Important Functions

### Frontend Functions
```javascript
// Auth
handleLogin(event)
handleSignup(event)
handleLogout()

// Donor
handleDonation(event)
loadDonationForm()
displayMatchedNGOs(ngos)

// NGO
loadAvailableDonations()
acceptDonation(donationId)
declineDonation(donationId)

// Matching
matchingEngine.findMatches(donation, ngos)
matchingEngine.calculateMatchScore(donation, ngo, distance)

// Notifications
notificationManager.sendNotification(title, message, type)
notificationManager.notifyDonationMatched(donation, ngo)

// Rewards
rewardsManager.awardPoints(userId, points, reason)
rewardsManager.unlockBadge(userId, badgeId)
```

### Backend Functions
```javascript
// Auth
register(req, res)
login(req, res)
getCurrentUser(req, res)

// Donations
createDonation(req, res)
getDonations(req, res)
updateDonationStatus(req, res)

// Matching
getMatchedNGOs(donation)
createMatch(req, res)
acceptMatch(req, res)

// Rewards
awardPoints(req, res)
getUserPoints(req, res)
getLeaderboard(req, res)
```

## 🧪 Common Testing Flows

### Flow 1: Register & Donate
1. Sign up as donor
2. Click "Donate Food" tab
3. Fill donation form
4. Submit → See matched NGOs

### Flow 2: Accept Donation (NGO)
1. Sign up as NGO
2. Click "Receive Donations" tab
3. See available donations
4. Click "Accept" → Arrange pickup

### Flow 3: Check Rewards
1. Login (after donations)
2. Click "Rewards & Badges" tab
3. View points and badges
4. See position in leaderboard

### Flow 4: Admin Dashboard
1. Login as admin
2. Click "Admin Panel" tab
3. View users, donations, analytics
4. Manage platform

## 📊 Database Collections

| Collection | Purpose |
|-----------|---------|
| users | Users (donors, NGOs, admins) |
| donations | Food donations |
| matches | Matches between donors & NGOs |
| rewards | Points history |
| badges | Unlocked badges |
| notifications | User notifications |
| reviews | User reviews |

## 🐛 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Port 5000 in use | `lsof -i :5000` then `kill -9 PID` |
| MongoDB not connecting | Start `mongod` in separate terminal |
| Frontend not showing | Open `frontend/index.html` directly |
| API 404 errors | Ensure backend is running on 5000 |
| Login not working | Check .env JWT_SECRET |

## 📈 Performance Tips

- Use browser DevTools to monitor API calls
- Check Network tab for slow requests
- Monitor MongoDB performance with Atlas dashboard
- Use pagination for large datasets
- Enable caching where appropriate

## 🔐 Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Enable HTTPS
- [ ] Validate all inputs
- [ ] Use CORS properly
- [ ] Hash passwords
- [ ] Protect sensitive routes
- [ ] Rate limit endpoints
- [ ] Monitor suspicious activity

## 📱 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS/Android)

## 🚀 Deployment Checklist

- [ ] All environment variables set
- [ ] Database backups configured
- [ ] HTTPS/SSL enabled
- [ ] Error monitoring setup
- [ ] Logging configured
- [ ] Database indexes created
- [ ] Admin user created
- [ ] Initial data seeded

## 💬 Common Commands

```bash
# Backend
npm run dev          # Start development server
npm start            # Start production server
npm test             # Run tests (when added)

# Database
mongod              # Start MongoDB
mongosh             # Connect to MongoDB shell

# Git
git status          # Check status
git add .           # Stage changes
git commit -m "msg" # Commit
git push            # Push to remote
```

## 📞 Support Resources

- **README.md** - Project overview
- **SETUP_GUIDE.md** - Installation details
- **FEATURES.md** - Feature documentation
- **DATABASE.md** - Database schema
- **PROJECT_OVERVIEW.md** - Architecture details

## 🎯 Next Steps

1. **Customize**: Update colors, text, logos
2. **Extend**: Add new features
3. **Deploy**: Move to production
4. **Monitor**: Track metrics
5. **Improve**: Based on user feedback

---

**Keep this guide handy for quick reference! 📌**

**Happy coding! 💻**
