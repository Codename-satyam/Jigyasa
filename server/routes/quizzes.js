const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { verifyToken, requireTeacherOrAdmin } = require('../middleware/auth');
const { isValidString, sanitizeString } = require('../middleware/validate');

// Create new quiz (teacher/admin only, with server-side role check)
router.post('/', verifyToken, requireTeacherOrAdmin, async (req, res) => {
  try {
    const { title, description, topic, difficulty, type, questions } = req.body;

    if (!isValidString(topic, 200)) {
      return res.status(400).json({ success: false, error: 'Invalid or missing topic' });
    }
    if (!Array.isArray(questions) || questions.length === 0 || questions.length > 200) {
      return res.status(400).json({ success: false, error: 'Questions must be an array with 1-200 items' });
    }
    // Validate each question structure
    for (const q of questions) {
      if (!q.question || typeof q.question !== 'string') {
        return res.status(400).json({ success: false, error: 'Each question must have a question text' });
      }
      if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) {
        return res.status(400).json({ success: false, error: 'Each question must have 2-6 options' });
      }
      if (!q.correct || !q.options.includes(q.correct)) {
        return res.status(400).json({ success: false, error: 'Correct answer must be one of the options' });
      }
    }

    const user = await User.findById(req.userId).select('name');
    
    const quiz = new Quiz({
      title: sanitizeString(title || `${topic} Quiz`, 200),
      description: sanitizeString(description || `Generated ${difficulty} ${topic} quiz`, 500),
      topic: sanitizeString(topic, 200),
      difficulty: sanitizeString(difficulty || 'easy', 50),
      type: sanitizeString(type || 'mcq', 50),
      questions,
      createdBy: req.userId,
      createdByName: user ? user.name : 'Unknown',
      ispublished: false,
    });

    await quiz.save();
    res.json({ success: true, message: 'Quiz created', quiz });
  } catch (err) {
    console.error('Create quiz error:', err);
    res.status(500).json({ success: false, error: 'Failed to create quiz' });
  }
});

// Get all quizzes (admin/teacher with token) - MUST BE BEFORE /:id
router.get('/all', verifyToken, requireTeacherOrAdmin, async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('createdBy', 'name email');
    res.json({ success: true, quizzes });
  } catch (err) {
    console.error('Get all quizzes error:', err);
    res.status(500).json({ success: false, error: 'Failed to get quizzes' });
  }
});

// Get all published quizzes
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ ispublished: true }).select('-questions').populate('createdBy', 'name email');
    res.json({ success: true, quizzes });
  } catch (err) {
    console.error('Get quizzes error:', err);
    res.status(500).json({ success: false, error: 'Failed to get quizzes' });
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
    res.status(500).json({ success: false, error: 'Failed to get quiz' });
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
    res.status(500).json({ success: false, error: 'Failed to update quiz' });
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
    res.status(500).json({ success: false, error: 'Failed to publish quiz' });
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
    res.status(500).json({ success: false, error: 'Failed to unpublish quiz' });
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
    res.status(500).json({ success: false, error: 'Failed to delete quiz' });
  }
});

// Get quizzes by topic
router.get('/topic/:topic', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ topic: req.params.topic, ispublished: true }).select('-questions');
    res.json({ success: true, quizzes });
  } catch (err) {
    console.error('Get quizzes by topic error:', err);
    res.status(500).json({ success: false, error: 'Failed to get quizzes by topic' });
  }
});

module.exports = router;
