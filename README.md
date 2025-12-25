# SmartFood Donation Platform

A comprehensive full-stack web application that connects food donors with NGOs in real-time using an intelligent matching algorithm to reduce food waste and help those in need.

## 🎯 Features

### Smart Matching Algorithm
- Real-time matching of surplus food with nearest NGOs
- Location-based proximity calculation using Haversine formula
- Quality and freshness scoring system
- NGO capacity and food preference matching

### Quality & Freshness Tagging
- Donors specify food type, quantity, expiry date, and safe consumption time
- Freshness indicators (Fresh, Good, Fair)
- Predictive alerts for expiring donations
- Quality verification on delivery

### Real-Time Notifications
- Instant notifications when donations are posted
- Match found alerts for both donors and NGOs
- Delivery status updates
- Reward points notifications
- Browser notifications support

### Gamified Rewards System
- Reward points for donations and deliveries
- Badge unlocking system (First Donor, Helper, Champion, Eco Warrior, Legend, etc.)
- Leaderboards showcasing top contributors
- Referral bonuses

### Scalable Architecture
- Support for multiple restaurants, hotels, and NGOs
- Centralized database for managing all operations
- Real-time data synchronization using WebSockets
- Modular code structure for easy maintenance

### Admin Dashboard
- User management and verification
- Donation tracking and analytics
- Platform statistics and health monitoring
- Audit logs and reports

## 🏗️ Project Structure

```
smartfooddonation/
├── frontend/
│   ├── index.html           # Main HTML file
│   ├── styles/
│   │   ├── style.css        # Global styles with pastel design
│   │   ├── components.css   # Component-specific styles
│   │   └── dashboard.css    # Dashboard styles
│   └── js/
│       ├── main.js          # Main application logic
│       ├── auth.js          # Authentication module
│       ├── donor.js         # Donor module
│       ├── ngo.js           # NGO receiver module
│       ├── matching.js      # Smart matching algorithm
│       ├── notification.js  # Notification system
│       ├── rewards.js       # Gamification module
│       └── admin.js         # Admin functionality
├── backend/
│   ├── server.js            # Express server & WebSocket setup
│   ├── models/
│   │   └── index.js         # MongoDB schemas (User, Donation, Match, etc.)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── donationController.js
│   │   ├── matchController.js
│   │   └── rewardController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── donors.js
│   │   ├── ngos.js
│   │   ├── donations.js
│   │   ├── matches.js
│   │   ├── rewards.js
│   │   ├── admin.js
│   │   └── notifications.js
│   ├── middleware/
│   │   └── auth.js          # JWT & role-based auth
│   ├── utils/               # Utility functions
│   └── config/              # Configuration files
├── package.json
├── .env.example
└── README.md
```

## 🎨 Design Philosophy

### Aesthetic UI with Pastel Colors
- Primary: Purple (#C9A5DB)
- Secondary: Light Purple (#E8D5F2)
- Accents: Peach, Green, Blue for status indicators
- Clean, modern design with smooth animations
- Fully responsive mobile-first approach

### User Experience
- Intuitive navigation for both donors and NGOs
- Clear feedback on all actions
- Toast notifications for important updates
- Real-time data updates
- Minimal and aesthetic design

## 📋 User Workflows

### Donor Workflow
1. Register as Food Donor
2. Post donation details (type, quantity, expiry, freshness)
3. View matched NGOs with distance and match score
4. Confirm donation with preferred NGO
5. Track delivery status
6. Receive reward points upon successful delivery
7. Earn badges and unlock achievements

### NGO Workflow
1. Register as NGO Receiver
2. Browse available donations in nearby area
3. Accept or decline donations based on capacity and needs
4. Arrange delivery (donor, NGO, or volunteer)
5. Verify food quality on arrival
6. Update distribution status
7. Track inventory and analytics

### Admin Workflow
1. Monitor all users and donations
2. View platform analytics and statistics
3. Manage user verification and status
4. Handle complaints and issues
5. Generate reports on food waste prevention
6. Monitor system health

## 🚀 Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd smartfooddonation
```

2. **Install dependencies**
```bash
npm install
```

3. **Setup environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start MongoDB**
```bash
# Make sure MongoDB is running
mongod
```

5. **Start the backend server**
```bash
npm run dev
```
Server will run on `http://localhost:5000`

6. **Start the frontend**
- Open `frontend/index.html` in your browser
- Or use a local server: `npx http-server frontend`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Donations
- `POST /api/donations` - Create donation
- `GET /api/donations` - Get all donations
- `GET /api/donations/:id` - Get donation details
- `PATCH /api/donations/:id/status` - Update status
- `POST /api/donations/:id/cancel` - Cancel donation

### Matches
- `POST /api/matches` - Create match
- `GET /api/matches` - Get all matches
- `POST /api/matches/:id/accept` - Accept match (NGO)
- `POST /api/matches/:id/decline` - Decline match (NGO)

### Rewards
- `POST /api/rewards/award` - Award points
- `GET /api/rewards/points` - Get user points
- `GET /api/rewards/leaderboard` - Get leaderboard
- `POST /api/rewards/redeem` - Redeem points

### Admin
- `GET /api/admin/users` - Get all users
- `GET /api/admin/analytics/summary` - Get platform analytics
- `GET /api/admin/system/health` - Get system health

## 🔒 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- Password hashing with bcryptjs
- Input validation
- CORS protection
- User status verification

## 📊 Smart Matching Algorithm

The algorithm considers:
1. **Distance** - Proximity to NGO (1.5 points penalty per km)
2. **Freshness** - Food quality and time until expiry (up to 15 points bonus)
3. **Capacity** - NGO's daily capacity (5-10 points bonus)
4. **Rating** - NGO's historical rating (up to 10 points bonus)
5. **Preferences** - Food type preferences (5 points bonus)

Final score ranges from 0-100, with 50+ being acceptable matches.

## 🎮 Gamification System

### Points Awards
- Post donation: 10 points
- Donation accepted: 25 points
- Donation delivered: 50 points
- 5 kg donated: 5 points per kg
- Review given: 15 points

### Badges
- **First Donor** - Make first donation
- **Helper** - Successfully deliver 1 donation
- **Champion** - Deliver 10 successful donations
- **Eco Warrior** - Save 100kg of food
- **Legend** - Save 500kg of food
- **Guardian** - Maintain 4.8+ rating
- **Speedster** - Complete 5 donations in 1 week

## 📈 Analytics & Reporting

### For Donors
- Total donations and quantities
- Success rate and delivery times
- Rating and reviews
- Reward points and badges
- Impact statistics

### For NGOs
- Donations received
- Food inventory and capacity utilization
- People served
- Distribution history
- Food quality metrics

### For Admin
- Platform growth metrics
- User engagement statistics
- Donation success rates
- Geographic distribution
- System performance
- Financial impact (economic value saved)

## 🔄 Real-Time Features

- WebSocket-based notifications
- Live donation matching
- Real-time delivery updates
- Instant reward notifications
- Live leaderboard updates

## 🌐 Future Enhancements

- IoT integration with temperature sensors
- Mobile app (React Native/Flutter)
- Payment integration for premium features
- Advanced analytics dashboard
- Machine learning for donation demand prediction
- SMS/WhatsApp notifications
- Integration with food delivery services
- Blockchain for transparency
- Environmental impact calculator

## 📞 Contact & Support

For issues, suggestions, or contributions, please reach out to:
- Email: support@smartfooddonation.com
- GitHub: [Repository URL]

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

Contributions are welcome! Please follow the standard GitHub fork and pull request workflow.

## 🙏 Acknowledgments

This platform is built with the mission to reduce food waste and support communities in need through technology and social responsibility.

---

**Together, we can make food abundance accessible to all! 🌱**
