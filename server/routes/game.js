const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
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

// Save game score
router.post('/', verifyToken, async (req, res) => {
  try {
    const { gameId, gameName, score, level, timePlayed } = req.body;
    
    const game = new Game({
      userId: req.userId,
      gameId,
      gameName,
      score,
      level,
      timePlayed,
    });

    await game.save();
    res.json({ success: true, message: 'Game score saved', game });
  } catch (err) {
    console.error('Save game error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get all game scores for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const games = await Game.find({ userId: req.userId }).sort({ timestamp: -1 });
    res.json({ success: true, games });
  } catch (err) {
    console.error('Get games error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get game by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate('userId', 'name avatarId');
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    
    if (game.userId._id.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Can only view your own games' });
    }

    res.json({ success: true, game });
  } catch (err) {
    console.error('Get game error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get games by game name / ID
router.get('/name/:gameName', verifyToken, async (req, res) => {
  try {
    const games = await Game.find({ userId: req.userId, gameName: req.params.gameName }).sort({ timestamp: -1 });
    res.json({ success: true, games });
  } catch (err) {
    console.error('Get games by name error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get game leaderboard (public)
router.get('/leaderboard/:gameName', async (req, res) => {
  try {
    const leaderboard = await Game.find({ gameName: req.params.gameName })
      .populate('userId', 'name avatarId')
      .sort({ score: -1, level: -1, timePlayed: 1 })
      .limit(10);
    res.json({ success: true, leaderboard });
  } catch (err) {
    console.error('Get leaderboard error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get user game statistics
router.get('/stats/:gameName', verifyToken, async (req, res) => {
  try {
    const games = await Game.find({ userId: req.userId, gameName: req.params.gameName });
    
    const stats = {
      totalPlayed: games.length,
      highestScore: games.length > 0 ? Math.max(...games.map(g => g.score)) : 0,
      highestLevel: games.length > 0 ? Math.max(...games.map(g => g.level)) : 0,
      averageScore: games.length > 0 ? (games.reduce((a, b) => a + b.score, 0) / games.length).toFixed(2) : 0,
      totalTimePlayed: games.reduce((a, b) => a + (b.timePlayed || 0), 0),
    };

    res.json({ success: true, stats });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update game score
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    
    if (game.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Can only update your own games' });
    }

    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, game: updatedGame });
  } catch (err) {
    console.error('Update game error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete game
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    
    if (game.userId.toString() !== req.userId) {
      return res.status(403).json({ success: false, error: 'Can only delete your own games' });
    }

    await Game.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Game deleted' });
  } catch (err) {
    console.error('Delete game error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
