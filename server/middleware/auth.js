const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('FATAL: JWT_SECRET environment variable is not set. Server cannot start without it.');
}

// Verify JWT token and attach userId to request
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, error: 'Token invalid or expired' });
    req.userId = decoded.userId;
    next();
  });
};

// Require admin role (must be used after verifyToken)
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('role blocked');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.blocked) return res.status(403).json({ success: false, error: 'Account is blocked' });
    if (user.role !== 'admin') return res.status(403).json({ success: false, error: 'Admin access required' });
    req.userRole = user.role;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Authorization check failed' });
  }
};

// Require teacher or admin role (must be used after verifyToken)
const requireTeacherOrAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('role blocked approved');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user.blocked) return res.status(403).json({ success: false, error: 'Account is blocked' });
    if (user.role === 'student') return res.status(403).json({ success: false, error: 'Teacher or admin access required' });
    req.userRole = user.role;
    req.userApproved = user.approved;
    next();
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Authorization check failed' });
  }
};

module.exports = { JWT_SECRET, verifyToken, requireAdmin, requireTeacherOrAdmin };
