const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, error: 'No token provided' });
  
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ success: false, error: 'Token invalid' });
    req.userId = decoded.userId;
    next();
  });
};

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }

    const user = new User({ name, email, password, role });
    await user.save();

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, message: 'User registered', token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Missing email or password' });
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

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all users (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can view all users' });
    }

    const users = await User.find().select('-password');
    res.json({ success: true, users });
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update user
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (req.userId !== req.params.id) {
      const requestingUser = await User.findById(req.userId);
      if (requestingUser.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Can only update your own profile' });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Block user (admin only)
router.post('/:id/block', verifyToken, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can block users' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { blocked: true }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User blocked', user });
  } catch (err) {
    console.error('Block user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Unblock user (admin only)
router.post('/:id/unblock', verifyToken, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can unblock users' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { blocked: false }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User unblocked', user });
  } catch (err) {
    console.error('Unblock user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Approve user (admin only)
router.post('/:id/approve', verifyToken, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can approve users' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { approved: true }, { new: true });
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User approved', user });
  } catch (err) {
    console.error('Approve user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete user (admin only)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const requestingUser = await User.findById(req.userId);
    if (requestingUser.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can delete users' });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Validate admin credentials
router.post('/admin/validate', async (req, res) => {
  try {
    const { email, password, adminCode } = req.body;
    
    // Admin credentials from environment or defaults
    const ADMIN_CODE = process.env.ADMIN_CODE || 'ADMIN123456';
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@jigyasa.com';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@12345';
    
    console.log('🔐 Admin login attempt received');
    
    // Validate admin code
    if (adminCode !== ADMIN_CODE) {
      console.log('❌ Invalid admin code provided');
      return res.status(401).json({ success: false, error: 'Invalid admin code' });
    }
    
    // Validate email and password
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      console.log('❌ Invalid admin credentials provided');
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }
    
    // Try to ensure admin user exists in MongoDB
    try {
      let adminUser = await User.findOne({ email: ADMIN_EMAIL });
      
      if (!adminUser) {
        console.log('📝 Creating admin user in MongoDB...');
        const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
        adminUser = new User({
          name: 'Admin',
          email: ADMIN_EMAIL,
          password: hashedPassword,
          role: 'admin',
          approved: true
        });
        await adminUser.save();
        console.log('✅ Admin user created');
      } else {
        console.log('✅ Admin user verified');
      }
      
      // Generate JWT token
      const token = jwt.sign({ userId: adminUser._id }, JWT_SECRET, { expiresIn: '24h' });
      
      console.log('✅ Admin session initialized');
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
      return res.status(500).json({ success: false, error: 'Database error: ' + dbErr.message });
    }
  } catch (err) {
    console.error('Admin validation error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;