const express = require('express');
const router = express.Router();
const QuizAttempt = require('../models/QuizAttempt');
const User = require('../models/User');
const { verifyToken } = require('../middleware/auth');
const { isValidPositiveInt, sanitizeString } = require('../middleware/validate');

// Save detailed quiz attempt
router.post('/', verifyToken, async (req, res) => {
  try {
    const { quizTitle, quizId, category, difficulty, score, totalQuestions, percentage, timeSpent, questions } = req.body;

    // Validate numeric fields
    const validScore = Number(score);
    const validTotal = Number(totalQuestions);
    const validPercentage = Number(percentage);
    const validTimeSpent = Number(timeSpent) || 0;

    if (!isValidPositiveInt(validTotal, 1000) || validTotal < 1) {
      return res.status(400).json({ success: false, error: 'Invalid totalQuestions' });
    }
    if (!isValidPositiveInt(validScore, 1000) || validScore > validTotal) {
      return res.status(400).json({ success: false, error: 'Invalid score' });
    }

    // Get user info
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    // Create attempt with detailed questions data
    const attempt = new QuizAttempt({
      userId: req.userId,
      quizTitle: sanitizeString(quizTitle || 'Quiz', 200),
      quizId: quizId || null,
      category: sanitizeString(category || '', 100),
      difficulty: sanitizeString(difficulty || '', 50),
      score: validScore,
      totalQuestions: validTotal,
      percentage: validPercentage,
      timeSpent: validTimeSpent,
      questions: Array.isArray(questions) ? questions.map(q => ({
        questionId: q.questionId || q.id || null,
        question: sanitizeString(q.question || '', 500),
        options: Array.isArray(q.options) ? q.options.map(o => sanitizeString(o, 200)) : [],
        userAnswer: sanitizeString(q.userAnswer || '', 200),
        correctAnswer: sanitizeString(q.correctAnswer || '', 200),
        isCorrect: q.userAnswer === q.correctAnswer,
      })) : [],
    });

    await attempt.save();
    res.json({ success: true, message: 'Quiz attempt saved', attempt });
  } catch (err) {
    console.error('Save quiz attempt error:', err);
    res.status(500).json({ success: false, error: 'Failed to save quiz attempt' });
  }
});

// Get user's quiz attempts (with pagination)
router.get('/', verifyToken, async (req, res) => {
  try {
    const { limit = 10, offset = 0 } = req.query;
    const validLimit = Math.min(Number(limit) || 10, 100);
    const validOffset = Number(offset) || 0;

    const attempts = await QuizAttempt.find({ userId: req.userId })
      .sort({ attemptedAt: -1 })
      .skip(validOffset)
      .limit(validLimit);

    const total = await QuizAttempt.countDocuments({ userId: req.userId });

    res.json({ success: true, attempts, total, limit: validLimit, offset: validOffset });
  } catch (err) {
    console.error('Get quiz attempts error:', err);
    res.status(500).json({ success: false, error: 'Failed to get quiz attempts' });
  }
});

// Get user's recent attempts summary (last N attempts) - MUST come before /:attemptId
router.get('/summary/recent', verifyToken, async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const validLimit = Math.min(Number(limit) || 5, 50);

    const attempts = await QuizAttempt.find({ userId: req.userId })
      .sort({ attemptedAt: -1 })
      .limit(validLimit)
      .select('quizTitle category difficulty score totalQuestions percentage attemptedAt');

    res.json({ success: true, attempts });
  } catch (err) {
    console.error('Get recent attempts error:', err);
    res.status(500).json({ success: false, error: 'Failed to get recent attempts' });
  }
});

// Get stats for a specific quiz - MUST come before /:attemptId
router.get('/stats/:quizTitle', verifyToken, async (req, res) => {
  try {
    const quizTitle = decodeURIComponent(req.params.quizTitle);
    const attempts = await QuizAttempt.find({ userId: req.userId, quizTitle });

    if (attempts.length === 0) {
      return res.json({ success: true, stats: null });
    }

    const scores = attempts.map(a => a.percentage);
    const avgPercentage = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
    const maxPercentage = Math.max(...scores);
    const minPercentage = Math.min(...scores);

    res.json({ success: true, stats: {
      totalAttempts: attempts.length,
      avgPercentage,
      maxPercentage,
      minPercentage,
      lastAttempt: attempts[0],
    }});
  } catch (err) {
    console.error('Get quiz stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to get quiz stats' });
  }
});

// Get specific quiz attempt with detailed questions - generic route last
router.get('/:attemptId', verifyToken, async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.attemptId);
    
    if (!attempt) {
      return res.status(404).json({ success: false, error: 'Attempt not found' });
    }

    // Verify user owns this attempt
    if (String(attempt.userId) !== String(req.userId)) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this attempt' });
    }

    res.json({ success: true, attempt });
  } catch (err) {
    console.error('Get quiz attempt error:', err);
    res.status(500).json({ success: false, error: 'Failed to get quiz attempt' });
  }
});

module.exports = router;
