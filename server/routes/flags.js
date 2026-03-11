const express = require('express');
const router = express.Router();
const Flag = require('../models/Flag');
const User = require('../models/User');
const { verifyToken, requireAdmin } = require('../middleware/auth');
const { isValidString, isValidObjectId, sanitizeString } = require('../middleware/validate');

// Create flag / report content (with validation)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { quizId, gameId, reason, description, severity = 'medium' } = req.body;

    if (!isValidString(reason, 200)) {
      return res.status(400).json({ success: false, error: 'Reason is required (max 200 chars)' });
    }
    if (description && !isValidString(description, 2000)) {
      return res.status(400).json({ success: false, error: 'Description too long (max 2000 chars)' });
    }
    if (!['low', 'medium', 'high'].includes(severity)) {
      return res.status(400).json({ success: false, error: 'Invalid severity level' });
    }
    if (quizId && !isValidObjectId(quizId)) {
      return res.status(400).json({ success: false, error: 'Invalid quiz ID' });
    }
    if (gameId && !isValidObjectId(gameId)) {
      return res.status(400).json({ success: false, error: 'Invalid game ID' });
    }
    
    const flag = new Flag({
      userId: req.userId,
      quizId: quizId || undefined,
      gameId: gameId || undefined,
      reason: sanitizeString(reason, 200),
      description: sanitizeString(description || '', 2000),
      severity,
      status: 'open',
    });

    await flag.save();
    res.json({ success: true, message: 'Content flagged', flag });
  } catch (err) {
    console.error('Create flag error:', err);
    res.status(500).json({ success: false, error: 'Failed to create flag' });
  }
});

// Get all flags (admin only - using middleware)
router.get('/', verifyToken, requireAdmin, async (req, res) => {
  try {
    const flags = await Flag.find()
      .populate('userId', 'name email')
      .populate('quizId', 'title')
      .populate('gameId', 'gameName')
      .populate('reviewedBy', 'name')
      .sort({ timestamp: -1 });
    
    res.json({ success: true, flags });
  } catch (err) {
    console.error('Get flags error:', err);
    res.status(500).json({ success: false, error: 'Failed to get flags' });
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
    res.status(500).json({ success: false, error: 'Failed to get flags' });
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
    
    const user = await User.findById(req.userId).select('role');
    if (user.role !== 'admin' && flag.userId._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, error: 'Can only view your own flags' });
    }

    res.json({ success: true, flag });
  } catch (err) {
    console.error('Get flag error:', err);
    res.status(500).json({ success: false, error: 'Failed to get flag' });
  }
});

// Review flag (admin only)
router.post('/:id/review', verifyToken, requireAdmin, async (req, res) => {
  try {
    const { status, resolution } = req.body;

    if (!['open', 'reviewed', 'resolved'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid status' });
    }

    const flag = await Flag.findByIdAndUpdate(
      req.params.id,
      {
        status,
        resolution: sanitizeString(resolution || '', 1000),
        reviewedBy: req.userId,
      },
      { new: true }
    ).populate('userId', 'name email');

    if (!flag) return res.status(404).json({ success: false, error: 'Flag not found' });

    res.json({ success: true, message: 'Flag reviewed', flag });
  } catch (err) {
    console.error('Review flag error:', err);
    res.status(500).json({ success: false, error: 'Failed to review flag' });
  }
});

// Get flags by status (admin only)
router.get('/status/:status', verifyToken, requireAdmin, async (req, res) => {
  try {
    const flags = await Flag.find({ status: req.params.status })
      .populate('userId', 'name email')
      .populate('quizId', 'title')
      .populate('gameId', 'gameName')
      .sort({ timestamp: -1 });
    
    res.json({ success: true, flags });
  } catch (err) {
    console.error('Get flags by status error:', err);
    res.status(500).json({ success: false, error: 'Failed to get flags' });
  }
});

// Get flags by severity (admin only)
router.get('/severity/:severity', verifyToken, requireAdmin, async (req, res) => {
  try {
    const flags = await Flag.find({ severity: req.params.severity })
      .populate('userId', 'name email')
      .populate('quizId', 'title')
      .populate('gameId', 'gameName')
      .sort({ timestamp: -1 });
    
    res.json({ success: true, flags });
  } catch (err) {
    console.error('Get flags by severity error:', err);
    res.status(500).json({ success: false, error: 'Failed to get flags' });
  }
});

// Delete flag
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const flag = await Flag.findById(req.params.id);
    if (!flag) return res.status(404).json({ success: false, error: 'Flag not found' });
    
    const user = await User.findById(req.userId).select('role');
    if (user.role !== 'admin' && flag.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, error: 'Can only delete your own flags' });
    }

    await Flag.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Flag deleted' });
  } catch (err) {
    console.error('Delete flag error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete flag' });
  }
});

module.exports = router;
