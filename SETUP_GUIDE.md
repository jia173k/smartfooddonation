# SmartFood Donation Platform - Setup & Deployment Guide

## Local Development Setup

### 1. Prerequisites Installation

#### Windows
- **Node.js**: Download from https://nodejs.org/ (v14 or higher)
- **MongoDB**: Download from https://www.mongodb.com/try/download/community
- **Git**: Download from https://git-scm.com/download/win

#### macOS
```bash
# Using Homebrew
brew install node
brew install mongodb-community
brew install git
```

#### Linux (Ubuntu/Debian)
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo apt-get install -y mongodb
```

### 2. Environment Setup

1. Navigate to project directory:
```bash
cd smartfooddonation
```

2. Create `.env` file from example:
```bash
cp .env.example .env
```

3. Edit `.env` with your configuration:
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smartfood
JWT_SECRET=your_secret_key_here
FRONTEND_URL=http://localhost:3000
```

### 3. Database Setup

#### Using Local MongoDB
```bash
# Start MongoDB service (Windows)
mongod

# Start MongoDB service (macOS)
brew services start mongodb-community

# Start MongoDB service (Linux)
sudo systemctl start mongod
```

#### Using MongoDB Atlas (Cloud)
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a cluster
3. Get connection string
4. Update MONGODB_URI in .env:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartfood
```

### 4. Backend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Server should run on http://localhost:5000
```

### 5. Frontend Setup

Option A - Using Live Server (VS Code)
1. Install "Live Server" extension in VS Code
2. Right-click `frontend/index.html`
3. Select "Open with Live Server"

Option B - Using Node HTTP Server
```bash
npx http-server frontend
# Access at http://localhost:8080
```

## Testing the Application

### 1. Test User Registration

1. Open frontend in browser
2. Click "Get Started" or "Sign Up"
3. Fill registration form:
   - Select role: Food Donor or NGO
   - Fill all required fields
   - Submit form

### 2. Test Donation Flow (Donor)

1. Login as donor
2. Go to "Donate Food" tab
3. Fill donation details:
   - Food Type: "Cooked Rice"
   - Quantity: "5"
   - Expiry Time: (future date/time)
   - Freshness: "Fresh"
   - Description: "Extra rice from lunch"
   - Location: "123 Main St"
4. Submit - should see matched NGOs

### 3. Test Donation Acceptance (NGO)

1. Login as NGO
2. Go to "Receive Donations" tab
3. See available donations
4. Click "Accept" on any donation
5. Arrange pickup/delivery

### 4. Test Rewards

1. Complete donations to earn points
2. View "Rewards & Badges" tab
3. Check leaderboard and earned badges

## API Testing

### Using cURL

```bash
# Register User
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "9876543210",
    "role": "donor",
    "address": "123 Main St"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Create Donation (use token from login)
curl -X POST http://localhost:5000/api/donations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "foodType": "Cooked Rice",
    "quantity": 5,
    "freshness": "fresh",
    "expiryTime": "2025-12-31T20:00:00Z",
    "description": "Extra food",
    "location": {"latitude": 19.0760, "longitude": 72.8777}
  }'
```

### Using Postman

1. Import API collection (create manually)
2. Set base URL: `http://localhost:5000/api`
3. For authenticated endpoints:
   - Get token from login
   - Set Authorization: Bearer {token}

## Deployment

### Option 1: Heroku Deployment

1. Install Heroku CLI:
```bash
npm install -g heroku
```

2. Login to Heroku:
```bash
heroku login
```

3. Create Heroku app:
```bash
heroku create smartfood-donation
```

4. Set environment variables:
```bash
heroku config:set JWT_SECRET=your_secret
heroku config:set MONGODB_URI=your_mongodb_atlas_uri
```

5. Deploy:
```bash
git push heroku main
```

### Option 2: AWS/DigitalOcean Deployment

1. Create EC2 instance or Droplet
2. Install Node.js and MongoDB
3. Clone repository
4. Install dependencies
5. Set environment variables
6. Start application:
```bash
npm start
```

7. Setup nginx as reverse proxy
8. Enable SSL with Let's Encrypt

### Option 3: Docker Deployment

1. Create `Dockerfile`:
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

2. Create `docker-compose.yml`:
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      MONGODB_URI: mongodb://mongo:27017/smartfood
    depends_on:
      - mongo
  mongo:
    image: mongo:5.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
volumes:
  mongo_data:
```

3. Run:
```bash
docker-compose up
```

## Production Checklist

- [ ] Change JWT_SECRET to strong value
- [ ] Set NODE_ENV to production
- [ ] Configure HTTPS/SSL
- [ ] Setup database backups
- [ ] Enable CORS properly
- [ ] Setup logging system
- [ ] Configure error monitoring (Sentry)
- [ ] Setup CI/CD pipeline
- [ ] Performance testing
- [ ] Security audit
- [ ] Setup monitoring/alerts
- [ ] Create admin user manually

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongosh

# If connection fails:
1. Ensure MongoDB is started
2. Check MONGODB_URI in .env
3. Check firewall rules
4. Check MongoDB service status
```

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### Module Not Found
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install
```

### Frontend Not Connecting to Backend
1. Check backend is running on port 5000
2. Check CORS is enabled
3. Check API_BASE URL in main.js
4. Check browser console for errors

## Performance Optimization

1. **Database Indexing**:
```javascript
// Add indexes in models
userSchema.index({ email: 1 });
donationSchema.index({ status: 1, createdAt: -1 });
```

2. **Caching**: Implement Redis for frequently accessed data

3. **Image Optimization**: Use CDN for images

4. **Code Splitting**: Lazy load frontend modules

5. **Database Pagination**: Implement pagination in all list endpoints

## Monitoring & Logging

1. **Setup Logs**:
```bash
npm install winston
```

2. **Error Tracking**: Setup Sentry account

3. **Performance Monitoring**: Use New Relic or DataDog

## Regular Maintenance

- Update dependencies monthly
- Review security advisories
- Backup database regularly
- Monitor disk space
- Clean up old donation records
- Archive analytics data
- Update SSL certificates

## Support & Issues

For technical support:
1. Check README.md
2. Review error logs
3. Check MongoDB connectivity
4. Verify environment variables
5. Contact development team

---

**Happy Food Sharing! 🍱**
