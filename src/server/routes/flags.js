const express = require('express');
const router = express.Router();
const Flag = require('../models/Flag');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

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

// Create flag / report content
router.post('/', verifyToken, async (req, res) => {
  try {
    const { quizId, gameId, reason, description, severity = 'medium' } = req.body;
    
    const flag = new Flag({
      userId: req.userId,
      quizId,
      gameId,
      reason,
      description,
      severity,
      status: 'open',
    });

    await flag.save();
    res.json({ success: true, message: 'Content flagged', flag });
  } catch (err) {
    console.error('Create flag error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all flags (admin only)
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can view flags' });
    }

    const flags = await Flag.find()
      .populate('userId', 'name email')
      .populate('quizId', 'title')
      .populate('gameId', 'gameName')
      .populate('reviewedBy', 'name')
      .sort({ timestamp: -1 });
    
    res.json({ success: true, flags });
  } catch (err) {
    console.error('Get flags error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user's own flags
router.get('/user', verifyToken, async (req, res) => {
  try {
    const flags = await Flag.find({ userId: req.userId })
      .populate('quizId', 'title')
      .populate('gameId', 'gameName')
      .sort({ timestamp: -1 });
    res.json({ success: true, flags });
  } catch (err) {
    console.error('Get user flags error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get flag by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const flag = await Flag.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('quizId', 'title')
      .populate('gameId', 'gameName')
      .populate('reviewedBy', 'name');
    
    if (!flag) return res.status(404).json({ success: false, error: 'Flag not found' });
    
    const user = await User.findById(req.userId);
    if (user.role !== 'admin' && flag.userId._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Can only view your own flags' });
    }

    res.json({ success: true, flag });
  } catch (err) {
    console.error('Get flag error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Review flag (admin only)
router.post('/:id/review', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can review flags' });
    }

    const { status, resolution } = req.body;

    const flag = await Flag.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolution,
        reviewedBy: req.userId,
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!flag) return res.status(404).json({ success: false, error: 'Flag not found' });

    res.json({ success: true, message: 'Flag reviewed', flag });
  } catch (err) {
    console.error('Review flag error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get flags by status (admin only)
router.get('/status/:status', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can view flags' });
    }

    const flags = await Flag.find({ status: req.params.status })
      .populate('userId', 'name email')
      .populate('quizId', 'title')
      .populate('gameId', 'gameName')
      .sort({ timestamp: -1 });
    
    res.json({ success: true, flags });
  } catch (err) {
    console.error('Get flags by status error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get flags by severity (admin only)
router.get('/severity/:severity', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Only admins can view flags' });
    }

    const flags = await Flag.find({ severity: req.params.severity })
      .populate('userId', 'name email')
      .populate('quizId', 'title')
      .populate('gameId', 'gameName')
      .sort({ timestamp: -1 });
    
    res.json({ success: true, flags });
  } catch (err) {
    console.error('Get flags by severity error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete flag
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const flag = await Flag.findById(req.params.id);
    if (!flag) return res.status(404).json({ success: false, error: 'Flag not found' });
    
    const user = await User.findById(req.userId);
    if (user.role !== 'admin' && flag.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Can only delete your own flags' });
    }

    await Flag.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Flag deleted' });
  } catch (err) {
    console.error('Delete flag error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
