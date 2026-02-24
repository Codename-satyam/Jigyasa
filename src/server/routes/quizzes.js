const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
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

// Create new quiz
router.post('/', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role === 'student') {
      return res.status(403).json({ success: false, error: 'Only teachers and admins can create quizzes' });
    }

    const { title, description, topic, difficulty, type, questions } = req.body;
    
    const quiz = new Quiz({
      title: title || `${topic} Quiz`,
      description: description || `Generated ${difficulty} ${topic} quiz`,
      topic,
      difficulty,
      type,
      questions,
      createdBy: req.userId,
      createdByName: user.name,
      ispublished: false,
    });

    await quiz.save();
    res.json({ success: true, message: 'Quiz created', quiz });
  } catch (err) {
    console.error('Create quiz error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all quizzes (admin/teacher with token) - MUST BE BEFORE /:id
router.get('/all', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (user.role === 'student') {
      return res.status(403).json({ success: false, error: 'Only teachers and admins can view all quizzes' });
    }

    const quizzes = await Quiz.find().populate('createdBy', 'name email');
    res.json({ success: true, quizzes });
  } catch (err) {
    console.error('Get all quizzes error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all published quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ ispublished: true }).select('-questions').populate('createdBy', 'name email');
    res.json({ success: true, quizzes });
  } catch (err) {
    console.error('Get quizzes error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get single quiz by ID
router.get('/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'name email');
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });
    res.json({ success: true, quiz });
  } catch (err) {
    console.error('Get quiz error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update quiz
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });

    if (quiz.createdBy.toString() !== req.userId) {
      const user = await User.findById(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Can only update your own quizzes' });
      }
    }

    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: 'Quiz updated', quiz: updatedQuiz });
  } catch (err) {
    console.error('Update quiz error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Publish quiz
router.post('/:id/publish', verifyToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });

    if (quiz.createdBy.toString() !== req.userId) {
      const user = await User.findById(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Can only publish your own quizzes' });
      }
    }

    quiz.ispublished = true;
    await quiz.save();
    res.json({ success: true, message: 'Quiz published', quiz });
  } catch (err) {
    console.error('Publish quiz error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Unpublish quiz
router.post('/:id/unpublish', verifyToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });

    if (quiz.createdBy.toString() !== req.userId) {
      const user = await User.findById(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Can only unpublish your own quizzes' });
      }
    }

    quiz.ispublished = false;
    await quiz.save();
    res.json({ success: true, message: 'Quiz unpublished', quiz });
  } catch (err) {
    console.error('Unpublish quiz error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete quiz
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ success: false, error: 'Quiz not found' });

    if (quiz.createdBy.toString() !== req.userId) {
      const user = await User.findById(req.userId);
      if (user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Can only delete your own quizzes' });
      }
    }

    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Quiz deleted' });
  } catch (err) {
    console.error('Delete quiz error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get quizzes by topic
router.get('/topic/:topic', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ topic: req.params.topic, ispublished: true }).select('-questions');
    res.json({ success: true, quizzes });
  } catch (err) {
    console.error('Get quizzes by topic error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
