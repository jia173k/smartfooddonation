const jwt = require('jsonwebtoken');

// Verify JWT Token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'No token provided' });

    jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Verify role-based access
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        if (!allowedRoles.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }

        next();
    };
};

// Verify user status
const checkUserStatus = (req, res, next) => {
    if (req.user && req.user.status !== 'active') {
        return res.status(403).json({ error: 'User account is inactive or suspended' });
    }
    next();
};

module.exports = {
    authenticateToken,
    authorizeRole,
    checkUserStatus
};
