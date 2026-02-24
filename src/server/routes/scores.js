const express = require('express');
const router = express.Router();
const Score = require('../models/Score');
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

// Save score
router.post('/', verifyToken, async (req, res) => {
  try {
    const { quizId, quizTitle, name, email, score, percentage, totalQuestions, correctAnswers, timeSpent, total, quiz } = req.body;
    
    const scoreRecord = new Score({
      userId: req.userId,
      quizId: quizId || null,
      quizTitle: quizTitle || quiz,
      name: name,
      email: email,
      score: score,
      percentage: percentage || (totalQuestions ? Math.round((score / totalQuestions) * 100) : Math.round((score / (total || 1)) * 100)),
      totalQuestions: totalQuestions || total,
      correctAnswers: correctAnswers || score,
      timeSpent: timeSpent || 0,
    });

    await scoreRecord.save();
    res.json({ success: true, message: 'Score saved', score: scoreRecord });
  } catch (err) {
    console.error('Save score error:', err);
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get score by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const score = await Score.findById(req.params.id).populate('quizId').populate('userId', 'name email');
    if (!score) return res.status(404).json({ success: false, error: 'Score not found' });
    
    if (score.userId._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Can only view your own scores' });
    }

    res.json({ success: true, score });
  } catch (err) {
    console.error('Get score error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get scores for a specific quiz
router.get('/quiz/:quizId', verifyToken, async (req, res) => {
  try {
    const scores = await Score.find({ quizId: req.params.quizId, userId: req.userId });
    res.json({ success: true, scores });
  } catch (err) {
    console.error('Get quiz scores error:', err);
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
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
    res.status(500).json({ success: false, error: err.message });
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
      highestScore: scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0,
      totalCorrect: scores.reduce((a, b) => a + b.correctAnswers, 0),
      totalQuestions: scores.reduce((a, b) => a + b.totalQuestions, 0),
    };

    res.json({ success: true, stats });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete score
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const score = await Score.findById(req.params.id);
    if (!score) return res.status(404).json({ success: false, error: 'Score not found' });
    
    if (score.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Can only delete your own scores' });
    }

    await Score.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Score deleted' });
  } catch (err) {
    console.error('Delete score error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
