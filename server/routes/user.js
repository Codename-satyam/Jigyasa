const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { JWT_SECRET, verifyToken, requireAdmin } = require('../middleware/auth');
const { isValidString, isValidEmail, sanitizeString } = require('../middleware/validate');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs
  message: { success: false, error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // stricter limit for admin login
  message: { success: false, error: 'Too many admin login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Allowed roles for registration
const ALLOWED_ROLES = ['student', 'teacher'];

// Register new user
router.post('/register', authLimiter, async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    if (!isValidString(name, 100)) {
      return res.status(400).json({ success: false, error: 'Invalid name' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      });
    }

    // Prevent self-assigning admin role via registration
    const safeRole = ALLOWED_ROLES.includes(role) ? role : 'student';

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const user = new User({ name: sanitizeString(name, 100), email, password, role: safeRole });
    await user.save();

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: 'User registered', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: 'Registration failed' });
  }
});

// Login user
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Missing email or password' });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email format' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    if (user.blocked) {
      return res.status(403).json({ success: false, error: 'User is blocked', blocked: true });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ 
      success: true, 
      message: 'Login successful', 
      token, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        avatarId: user.avatarId,
        blocked: user.blocked,
        approved: user.approved
      } 
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Login failed' });
  }
});

// Get current user
router.get('/me', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    
    if (user.blocked) {
      return res.status(403).json({ success: false, error: 'User is blocked', blocked: true });
    }

    res.json({ success: true, user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
});

// Get all users (admin only)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

// Get user by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ success: false, error: 'Failed to get user' });
  }
});

// Update user (fix: use .toString() for ObjectId comparison)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.userId.toString() !== req.params.id) {
      const requestingUser = await User.findById(req.userId).select('role');
      if (!requestingUser || requestingUser.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Can only update your own profile' });
      }
    }

    if (req.body.password && !PASSWORD_REGEX.test(req.body.password)) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character',
      });
    }

    // Prevent role escalation: non-admins cannot change their own role
    const updateData = { ...req.body };
    if (req.userId.toString() === req.params.id) {
      delete updateData.role; // users cannot change their own role
    }
    // Never allow updating these through generic update
    delete updateData._id;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, error: 'Failed to update user' });
  }
});

// Block user (admin only)
router.post('/:id/block', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: true }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User blocked', user });
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({ success: false, error: 'Failed to block user' });
  }
});

// Unblock user (admin only)
router.post('/:id/unblock', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { blocked: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User unblocked', user });
  } catch (err) {
    console.error('Unblock user error:', err);
    res.status(500).json({ success: false, error: 'Failed to unblock user' });
  }
});

// Approve user (admin only)
router.post('/:id/approve', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User approved', user });
  } catch (err) {
    console.error('Approve user error:', err);
    res.status(500).json({ success: false, error: 'Failed to approve user' });
  }
});

// Delete user (admin only)
router.delete('/:id', verifyToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete user' });
  }
});

// Validate admin credentials
router.post('/admin/validate', adminLoginLimiter, async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;
    
    // Admin credentials MUST come from environment variables
    const ADMIN_CODE = process.env.ADMIN_CODE;
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (!ADMIN_CODE || !ADMIN_EMAIL || !ADMIN_PASSWORD) {
      console.error('FATAL: Admin credentials not configured in environment variables');
      return res.status(500).json({ success: false, error: 'Admin login is not configured' });
    }
    
    if (!email || !password || !adminCode) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Validate admin code
    if (adminCode !== ADMIN_CODE) {
      return res.status(401).json({ success: false, error: 'Invalid admin code' });
    }
    
    // Validate email and password
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }
    
    // Try to ensure admin user exists in MongoDB
    try {
      let adminUser = await User.findOne({ email: ADMIN_EMAIL });
      
      if (!adminUser) {
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        adminUser = new User({
          name: 'Admin',
          email: ADMIN_EMAIL,
          password: hashedPassword,
          role: 'admin',
          approved: true
        });
        await adminUser.save();
      }
      
      // Generate JWT token
      const token = jwt.sign({ userId: adminUser._id }, JWT_SECRET, { expiresIn: '24h' });
      
      // Return success with token
      res.json({ 
        success: true, 
        message: 'Admin credentials validated',
        token,
        user: {
          id: adminUser._id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role
        }
      });
    } catch (dbErr) {
      console.error('Database error:', dbErr.message);
      return res.status(500).json({ success: false, error: 'Admin login failed' });
    }
  } catch (err) {
    console.error('Admin validation error:', err);
    res.status(500).json({ success: false, error: 'Admin validation failed' });
  }
});

module.exports = router;