const express = require('express');
const router = express.Router();
const Progress = require('../models/Progress');
const { verifyToken } = require('../middleware/auth');
const { isValidString, isValidPositiveInt, sanitizeString } = require('../middleware/validate');

// Create or get progress for a subject
router.post('/', verifyToken, async (req, res) => {
  try {
    const { subject } = req.body;
    
    if (!isValidString(subject, 100)) {
      return res.status(400).json({ success: false, error: 'Invalid subject name' });
    }
    const safeSubject = sanitizeString(subject, 100);
    
    let progress = await Progress.findOne({ userId: req.userId, subject: safeSubject });
    
    if (!progress) {
      progress = new Progress({
        userId: req.userId,
        subject: safeSubject,
        topicIndex: 0,
        completedVideos: [],
        lastViewed: 0,
      });
      await progress.save();
    }

    res.json({ success: true, progress });
  } catch (err) {
    console.error('Create progress error:', err);
    res.status(500).json({ success: false, error: 'Failed to create progress' });
  }
});

// Get all progress for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const progress = await Progress.find({ userId: req.userId });
    res.json({ success: true, progress });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ success: false, error: 'Failed to get progress' });
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
    res.status(500).json({ success: false, error: 'Failed to get progress' });
  }
});

// Update progress - mark video as completed
router.post('/:subject/mark-video', verifyToken, async (req, res) => {
  try {
    const { videoIndex } = req.body;
    
    // Validate videoIndex is a reasonable non-negative integer
    if (!isValidPositiveInt(videoIndex, 10000)) {
      return res.status(400).json({ success: false, error: 'Invalid video index' });
    }
    const safeVideoIndex = Number(videoIndex);
    
    let progress = await Progress.findOne({ userId: req.userId, subject: req.params.subject });
    
    if (!progress) {
      progress = new Progress({
        userId: req.userId,
        subject: req.params.subject,
        topicIndex: 0,
        completedVideos: [safeVideoIndex],
        lastViewed: safeVideoIndex,
      });
      await progress.save();
    } else {
      if (!progress.completedVideos.includes(safeVideoIndex)) {
        progress.completedVideos.push(safeVideoIndex);
      }
      progress.lastViewed = safeVideoIndex;
      progress.lastViewedTime = new Date();
      await progress.save();
    }

    res.json({ success: true, progress });
  } catch (err) {
    console.error('Mark video error:', err);
    res.status(500).json({ success: false, error: 'Failed to mark video' });
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
    res.status(500).json({ success: false, error: 'Failed to advance topic' });
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
    res.status(500).json({ success: false, error: 'Failed to go to previous topic' });
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
    res.status(500).json({ success: false, error: 'Failed to reset progress' });
  }
});

// Delete progress
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const progress = await Progress.findById(req.params.id);
    if (!progress) return res.status(404).json({ success: false, error: 'Progress not found' });
    
    if (progress.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, error: 'Can only delete your own progress' });
    }

    await Progress.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Progress deleted' });
  } catch (err) {
    console.error('Delete progress error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete progress' });
  }
});

module.exports = router;
