const express = require('express');
const router = express.Router();
const Game = require('../models/Game');
const { verifyToken } = require('../middleware/auth');
const { isValidString, isValidPositiveInt, sanitizeString, safeMax } = require('../middleware/validate');

// Save game score (with input validation)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { gameId, gameName, score, level, timePlayed } = req.body;

    if (!isValidString(gameName, 100)) {
      return res.status(400).json({ success: false, error: 'Invalid game name' });
    }
    if (!isValidPositiveInt(Number(score), 1000000)) {
      return res.status(400).json({ success: false, error: 'Invalid score' });
    }
    
    const game = new Game({
      userId: req.userId,
      gameId: sanitizeString(gameId || '', 100),
      gameName: sanitizeString(gameName, 100),
      score: Number(score) || 0,
      level: isValidPositiveInt(Number(level), 10000) ? Number(level) : 0,
      timePlayed: isValidPositiveInt(Number(timePlayed), 86400) ? Number(timePlayed) : 0,
    });

    await game.save();
    res.json({ success: true, message: 'Game score saved', game });
  } catch (err) {
    console.error('Save game error:', err);
    res.status(500).json({ success: false, error: 'Failed to save game' });
  }
});

// Get all game scores for user
router.get('/', verifyToken, async (req, res) => {
  try {
    const games = await Game.find({ userId: req.userId }).sort({ timestamp: -1 });
    res.json({ success: true, games });
  } catch (err) {
    console.error('Get games error:', err);
    res.status(500).json({ success: false, error: 'Failed to get games' });
  }
});

// Get game by ID
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id).populate('userId', 'name avatarId');
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    
    if (game.userId._id.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, error: 'Can only view your own games' });
    }

    res.json({ success: true, game });
  } catch (err) {
    console.error('Get game error:', err);
    res.status(500).json({ success: false, error: 'Failed to get game' });
  }
});

// Get games by game name / ID
router.get('/name/:gameName', verifyToken, async (req, res) => {
  try {
    const games = await Game.find({ userId: req.userId, gameName: req.params.gameName }).sort({ timestamp: -1 });
    res.json({ success: true, games });
  } catch (err) {
    console.error('Get games by name error:', err);
    res.status(500).json({ success: false, error: 'Failed to get games' });
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
    res.status(500).json({ success: false, error: 'Failed to get leaderboard' });
  }
});

// Get user game statistics
router.get('/stats/:gameName', verifyToken, async (req, res) => {
  try {
    const games = await Game.find({ userId: req.userId, gameName: req.params.gameName });
    
    const stats = {
      totalPlayed: games.length,
      highestScore: safeMax(games.map(g => g.score)),
      highestLevel: safeMax(games.map(g => g.level)),
      averageScore: games.length > 0 ? (games.reduce((a, b) => a + b.score, 0) / games.length).toFixed(2) : 0,
      totalTimePlayed: games.reduce((a, b) => a + (b.timePlayed || 0), 0),
    };

    res.json({ success: true, stats });
  } catch (err) {
    console.error('Get stats error:', err);
    res.status(500).json({ success: false, error: 'Failed to get stats' });
  }
});

// Update game score
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    
    if (game.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, error: 'Can only update your own games' });
    }

    // Only allow updating score, level, timePlayed
    const allowed = {};
    if (req.body.score !== undefined && isValidPositiveInt(Number(req.body.score), 1000000)) allowed.score = Number(req.body.score);
    if (req.body.level !== undefined && isValidPositiveInt(Number(req.body.level), 10000)) allowed.level = Number(req.body.level);
    if (req.body.timePlayed !== undefined && isValidPositiveInt(Number(req.body.timePlayed), 86400)) allowed.timePlayed = Number(req.body.timePlayed);

    const updatedGame = await Game.findByIdAndUpdate(req.params.id, allowed, { new: true });
    res.json({ success: true, game: updatedGame });
  } catch (err) {
    console.error('Update game error:', err);
    res.status(500).json({ success: false, error: 'Failed to update game' });
  }
});

// Delete game
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    
    if (game.userId.toString() !== req.userId.toString()) {
      return res.status(403).json({ success: false, error: 'Can only delete your own games' });
    }

    await Game.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Game deleted' });
  } catch (err) {
    console.error('Delete game error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete game' });
  }
});

module.exports = router;
