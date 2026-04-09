const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, verifyToken, requireTeacherOrAdmin } = require('../middleware/auth');
const { isValidString, sanitizeString } = require('../middleware/validate');

function getRequestUser(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.split(' ')[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

function normalizePublicQuiz(quiz) {
  return {
    ...quiz,
    questions: Array.isArray(quiz.questions)
      ? quiz.questions.map((question) => ({
          id: question.id,
          question: question.question,
          options: Array.isArray(question.options) ? question.options : [],
        }))
      : [],
  };
}

function validateQuestions(questions) {
  for (const question of questions) {
    if (!question.question || typeof question.question !== 'string') {
      return 'Each question must have a question text';
    }

    if (!Array.isArray(question.options) || question.options.length < 2 || question.options.length > 6) {
      return 'Each question must have 2-6 options';
    }

    if (!question.correct || !question.options.includes(question.correct)) {
      return 'Correct answer must be one of the options';
    }
  }

  return null;
}

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

    const questionValidationError = validateQuestions(questions);
    if (questionValidationError) {
      return res.status(400).json({ success: false, error: questionValidationError });
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

// Get all quizzes (admin/teacher with token)
router.get('/all', verifyToken, requireTeacherOrAdmin, async (req, res) => {
  try {
    const quizzes = await Quiz.find().populate('createdBy', 'name email');
    res.json({ success: true, quizzes });
  } catch (err) {
    console.error('Get all quizzes error:', err);
    res.status(500).json({ success: false, error: 'Failed to get quizzes' });
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

    const requester = getRequestUser(req);
    const requesterUserId = requester ? String(requester.userId) : null;
    const creatorId = String(quiz.createdBy?._id || quiz.createdBy || '');
    const isOwner = requesterUserId && requesterUserId === creatorId;

    let isAdmin = false;
    if (requesterUserId && !isOwner) {
      const user = await User.findById(requesterUserId).select('role');
      isAdmin = !!user && user.role === 'admin';
    }

    if (!quiz.ispublished && !isOwner && !isAdmin) {
      return res.status(404).json({ success: false, error: 'Quiz not found' });
    }

    if (isOwner || isAdmin) {
      return res.json({ success: true, quiz });
    }

    return res.json({ success: true, quiz: normalizePublicQuiz(quiz.toObject()) });
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

    if (quiz.createdBy.toString() !== req.userId.toString()) {
      const user = await User.findById(req.userId);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ success: false, error: 'Can only update your own quizzes' });
      }
    }

    const allowedFields = ['title', 'description', 'topic', 'difficulty', 'type', 'questions', 'ispublished'];
    for (const field of allowedFields) {
      if (req.body[field] === undefined) {
        continue;
      }

      if (field === 'questions') {
        if (!Array.isArray(req.body.questions) || req.body.questions.length === 0 || req.body.questions.length > 200) {
          return res.status(400).json({ success: false, error: 'Questions must be an array with 1-200 items' });
        }

        const questionValidationError = validateQuestions(req.body.questions);
        if (questionValidationError) {
          return res.status(400).json({ success: false, error: questionValidationError });
        }

        quiz.questions = req.body.questions;
        continue;
      }

      if (field === 'ispublished') {
        quiz.ispublished = Boolean(req.body.ispublished);
        continue;
      }

      quiz[field] = sanitizeString(req.body[field], field === 'description' ? 500 : 200);
    }

    await quiz.save();
    const updatedQuiz = await Quiz.findById(quiz._id).populate('createdBy', 'name email');
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

    if (quiz.createdBy.toString() !== req.userId.toString()) {
      const user = await User.findById(req.userId);
      if (!user || user.role !== 'admin') {
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

    if (quiz.createdBy.toString() !== req.userId.toString()) {
      const user = await User.findById(req.userId);
      if (!user || user.role !== 'admin') {
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

    if (quiz.createdBy.toString() !== req.userId.toString()) {
      const user = await User.findById(req.userId);
      if (!user || user.role !== 'admin') {
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

module.exports = router;
