const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { isValidPositiveInt, isValidString, sanitizeString, safeMax } = require('../middleware/validate');

// Save score (with server-side validation)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { quizId, quizTitle, score, totalQuestions, correctAnswers, timeSpent, total, quiz } = req.body;

    // Validate numeric fields server-side to prevent score manipulation
    const validTotal = Number(totalQuestions || total);
    const validScore = Number(score);
    const validCorrect = Number(correctAnswers || score);

    if (!isValidPositiveInt(validTotal, 1000) || validTotal < 1) {
      return res.status(400).json({ success: false, error: 'Invalid totalQuestions value' });
    }
    if (!isValidPositiveInt(validScore, 1000) || validScore > validTotal) {
      return res.status(400).json({ success: false, error: 'Invalid score (must be 0 to totalQuestions)' });
    }
    if (!isValidPositiveInt(validCorrect, 1000) || validCorrect > validTotal) {
      return res.status(400).json({ success: false, error: 'Invalid correctAnswers value' });
    }

    // Server-side percentage calculation (don't trust client)
    const validPercentage = Math.round((validScore / validTotal) * 100);

    // Get user info server-side (don't trust client-sent name/email)
    const user = await User.findById(req.userId).select('name email');
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const scoreRecord = new Score({
      userId: req.userId,
      quizId: quizId || null,
      quizTitle: sanitizeString(quizTitle || quiz || 'Untitled', 200),
      name: user.name,
      email: user.email,
      score: validScore,
      percentage: validPercentage,
      totalQuestions: validTotal,
      correctAnswers: validCorrect,
      timeSpent: isValidPositiveInt(Number(timeSpent), 86400) ? Number(timeSpent) : 0,
    });

    await scoreRecord.save();
    res.json({ success: true, message: 'Score saved', score: scoreRecord });
  } catch (err) {
    console.error('Save score error:', err);
    res.status(500).json({ success: false, error: 'Failed to save score' });
  }
});

// Get all scores (admin only) or user's scores
router.get('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    // Admin gets all scores
    if (user.role === 'admin') {
      const scores = await Score.find()
        .populate('userId', 'name email')
        .populate('quizId', 'title topic difficulty')
        .sort({ timestamp: -1 });
      return res.json({ success: true, scores });
    }
    
    // Regular users get only their scores
    const scores = await Score.find({ userId: req.userId })
      .populate('quizId', 'title topic difficulty')
      .sort({ timestamp: -1 });
    res.json({ success: true, scores });
  } catch (err) {
    console.error('Get scores error:', err);
    res.status(500).json({ success: false, error: 'Failed to get scores' });
  }
});

// Get score by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const score = await Score.findById(req.params.id).populate('quizId').populate('userId', 'name email');
    if (!score) return res.status(404).json({ success: false, error: 'Score not found' });
    
    if (score.userId._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, error: 'Can only view your own scores' });
    }

    res.json({ success: true, score });
  } catch (err) {
    console.error('Get score error:', err);
    res.status(500).json({ success: false, error: 'Failed to get score' });
  }
});

// Get scores for a specific quiz
router.get('/quiz/:quizId', verifyToken, async (req, res) => {
  try {
    const scores = await Score.find({ quizId: req.params.quizId, userId: req.userId });
    res.json({ success: true, scores });
  } catch (err) {
    console.error('Get quiz scores error:', err);
    res.status(500).json({ success: false, error: 'Failed to get quiz scores' });
  }
});

// Get global leaderboard (public - all users, all quizzes, sorted by score)
router.get('/leaderboard/public/all', async (req, res) => {
  try {
    const leaderboard = await Score.find()
      .populate('userId', 'name avatarId')
      .sort({ percentage: -1, score: -1, timeSpent: 1 })
      .limit(100);
    res.json({ success: true, leaderboard });
  } catch (err) {
    console.error('Get global leaderboard error:', err);
    res.status(500).json({ success: false, error: 'Failed to get leaderboard' });
  }
});

// Get leaderboard for a specific quiz (public)
router.get('/leaderboard/:quizId', async (req, res) => {
  try {
    const leaderboard = await Score.find({ quizId: req.params.quizId })
      .populate('userId', 'name avatarId')
      .sort({ score: -1, timeSpent: 1 })
      .limit(10);
    res.json({ success: true, leaderboard });
  } catch (err) {
    console.error('Get leaderboard error:', err);
    res.status(500).json({ success: false, error: 'Failed to get leaderboard' });
  }
});

// Get user statistics
router.get('/stats/personal', verifyToken, async (req, res) => {
  try {
    const scores = await Score.find({ userId: req.userId });
    
    const stats = {
      totalQuizzes: scores.length,
      averageScore: scores.length > 0 ? (scores.reduce((a, b) => a + b.score, 0) / scores.length).toFixed(2) : 0,
      averagePercentage: scores.length > 0 ? (scores.reduce((a, b) => a + b.percentage, 0) / scores.length).toFixed(2) : 0,
      highestScore: safeMax(scores.map(s => s.score)),
      totalCorrect: scores.reduce((a, b) => a + b.correctAnswers, 0),
      totalQuestions: scores.reduce((a, b) => a + b.totalQuestions, 0),
    };

    res.json({ success: true, stats });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

// Delete score
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const score = await Score.findById(req.params.id);
    if (!score) return res.status(404).json({ success: false, error: 'Score not found' });
    
    if (score.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, error: 'Can only delete your own scores' });
    }

    await Score.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Score deleted' });
  } catch (err) {
    console.error('Delete score error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete score' });
  }
});

module.exports = router;
