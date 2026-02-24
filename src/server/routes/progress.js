const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
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

// Create or get progress for a subject
router.post('/', verifyToken, async (req, res) => {
  try {
    const { subject } = req.body;
    
    let progress = await Progress.findOne({ userId: req.userId, subject });
    
    if (!progress) {
      progress = new Progress({
        userId: req.userId,
        subject,
        topicIndex: 0,
        completedVideos: [],
        lastViewed: 0,
      });
      await progress.save();
    }

    res.json({ success: true, progress });
  } catch (err) {
    console.error('Create progress error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all progress for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId });
    res.json({ success: true, progress });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get progress by subject
router.get('/:subject', verifyToken, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.userId, subject: req.params.subject });
    if (!progress) return res.status(404).json({ success: false, error: 'Progress not found' });
    res.json({ success: true, progress });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update progress - mark video as completed
router.post('/:subject/mark-video', verifyToken, async (req, res) => {
  try {
    const { videoIndex } = req.body;
    
    let progress = await Progress.findOne({ userId: req.userId, subject: req.params.subject });
    
    if (!progress) {
      progress = new Progress({
        userId: req.userId,
        subject: req.params.subject,
        topicIndex: 0,
        completedVideos: [videoIndex],
        lastViewed: videoIndex,
      });
      await progress.save();
    } else {
      if (!progress.completedVideos.includes(videoIndex)) {
        progress.completedVideos.push(videoIndex);
      }
      progress.lastViewed = videoIndex;
      progress.lastViewedTime = new Date();
      await progress.save();
    }

    res.json({ success: true, progress });
  } catch (err) {
    console.error('Mark video error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update progress - move to next topic
router.post('/:subject/next-topic', verifyToken, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.userId, subject: req.params.subject });
    
    if (!progress) {
      return res.status(404).json({ success: false, error: 'Progress not found' });
    }

    progress.topicIndex += 1;
    progress.completedVideos = [];
    progress.lastViewed = 0;
    await progress.save();

    res.json({ success: true, progress });
  } catch (err) {
    console.error('Next topic error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update progress - move to previous topic
router.post('/:subject/prev-topic', verifyToken, async (req, res) => {
  try {
    let progress = await Progress.findOne({ userId: req.userId, subject: req.params.subject });
    
    if (!progress) {
      return res.status(404).json({ success: false, error: 'Progress not found' });
    }

    if (progress.topicIndex > 0) {
      progress.topicIndex -= 1;
      progress.completedVideos = [];
      progress.lastViewed = 0;
      await progress.save();
    }

    res.json({ success: true, progress });
  } catch (err) {
    console.error('Prev topic error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Reset progress
router.post('/:subject/reset', verifyToken, async (req, res) => {
  try {
    const progress = await Progress.findOneAndUpdate(
      { userId: req.userId, subject: req.params.subject },
      {
        topicIndex: 0,
        completedVideos: [],
        lastViewed: 0,
      },
      { new: true }
    );

    if (!progress) return res.status(404).json({ success: false, error: 'Progress not found' });

    res.json({ success: true, progress });
  } catch (err) {
    console.error('Reset progress error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete progress
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    if (!progress) return res.status(404).json({ success: false, error: 'Progress not found' });
    
    if (progress.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Can only delete your own progress' });
    }

    await Progress.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Progress deleted' });
  } catch (err) {
    console.error('Delete progress error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
