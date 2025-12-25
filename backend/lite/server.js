// Minimal lite backend that re-uses existing mongoose models
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { User, Donation, Notification } = require('../models');

const app = express();
app.use(cors());
app.use(express.json());

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/smartfood';

mongoose.connect(MONGODB_URI).then(()=>console.log('Lite server: MongoDB connected')).catch(err=>{ console.error('Lite server DB connect error', err.message); process.exit(1);});

// Register
app.post('/api/auth/register', async (req,res)=>{
  try{
    const { name, email, password, role } = req.body;
    if(!name||!email||!password||!role) return res.status(400).json({ error: 'Missing fields' });
    const existing = await User.findOne({ email });
    if(existing) return res.status(400).json({ error: 'User already exists' });
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const user = new User({ name, email, password: hashed, role, phone: '0000000000', address: 'Not provided', status: 'active' });
    await user.save();
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.status(201).json({ message: 'ok', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  }catch(err){ console.error(err); res.status(500).json({ error: err.message }); }
});

// Login
app.post('/api/auth/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    if(!email||!password) return res.status(400).json({ error: 'Missing fields' });
    const user = await User.findOne({ email });
    if(!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, user.password);
    if(!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if(user.status !== 'active') return res.status(403).json({ error: 'Inactive account' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    res.json({ message: 'ok', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  }catch(err){ console.error(err); res.status(500).json({ error: err.message }); }
});

// Verify JWT middleware
function verifyToken(req, res, next) {
  const auth = req.headers.authorization || req.query.token || req.headers['x-access-token'];
  let token = null;
  if (typeof auth === 'string' && auth.startsWith('Bearer ')) token = auth.slice(7);
  else if (req.query && req.query.token) token = req.query.token;
  else token = auth;

  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// Post a donation (protected)
app.post('/api/donations', verifyToken, async (req, res) => {
  try {
    const { foodType, quantity, freshness, expiryTime, description } = req.body;
    if (!foodType || !quantity) return res.status(400).json({ error: 'Missing fields' });
    // set defaults
    const donorId = req.user.id;
    const donation = new Donation({
      donorId,
      foodType,
      quantity,
      freshness: freshness || 'fresh',
      expiryTime: expiryTime ? new Date(expiryTime) : new Date(Date.now() + 4 * 60 * 60 * 1000),
      description: description || '',
      deliveryMethod: 'donor'
    });
    await donation.save();

    // create a simple notification for the donor
    await Notification.create({ userId: donorId, title: 'Donation posted', message: `Your donation of ${quantity} kg ${foodType} was posted.`, type: 'donation' });
    // Send SSE notification to connected clients for this donor (if any)
    try {
      const clients = sseClients.get(String(donorId));
      if (clients && clients.size) {
        const payload = { title: 'Donation posted', message: `Your donation of ${quantity} kg ${foodType} was posted.` };
        for (const r of clients) {
          try {
            r.write(`event: notification\ndata: ${JSON.stringify(payload)}\n\n`);
          } catch (e) { /* ignore per-client write errors */ }
        }
      }
    } catch (e) { console.warn('SSE notify error', e && e.message); }

    res.status(201).json({ message: 'donation posted', donation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// SSE client registry: Map<userId, Set<res>>
const sseClients = new Map();

// Server-Sent Events stream for realtime notifications (stores connections per user)
app.get('/api/stream', async (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).json({ error: 'Missing token for stream' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    const userId = decoded.id;

    // set headers for SSE
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive'
    });

    // send initial event
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'connected', userId })}\n\n`);

    // register client
    const set = sseClients.get(String(userId)) || new Set();
    set.add(res);
    sseClients.set(String(userId), set);

    // cleanup on close
    req.on('close', () => {
      const s = sseClients.get(String(userId));
      if (s) {
        s.delete(res);
        if (s.size === 0) sseClients.delete(String(userId));
      }
    });

  } catch (err) {
    return res.status(401).json({ error: 'Invalid token for stream' });
  }
});

const PORT = parseInt(process.env.LITE_PORT, 10) || 5000;

function startServer(port, retries = 5) {
  const server = app.listen(port, () => console.log(`Lite backend listening on port ${port}`));
  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE' && retries > 0) {
      console.warn(`Port ${port} in use, trying ${port + 1}...`);
      setTimeout(() => startServer(port + 1, retries - 1), 300);
    } else {
      console.error('Lite server failed to start:', err && err.message ? err.message : err);
      process.exit(1);
    }
  });
}

startServer(PORT);
