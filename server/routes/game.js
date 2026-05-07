// server/routes/game.js
// Identical to the original, with one addition:
//   after POST / saves a game → fires mlClient.trainAsync() with the user's
//   full game history so the ML model retrains immediately (non-blocking).

const express = require('express');
const router  = express.Router();
const Game    = require('../models/Game');
const { verifyToken }                                  = require('../middleware/auth');
const { isValidString, isValidPositiveInt,
        sanitizeString, safeMax, isValidObjectId }     = require('../middleware/validate');
const { trainAsync }                                   = require('./ml/mlClient');   // ← NEW

// ── POST / — save a new game score ───────────────────────────────────────────
router.post('/', verifyToken, async (req, res) => {
  try {
    const { gameId, gameName, score, level, timePlayed } = req.body;

    if (!isValidString(gameName, 100))
      return res.status(400).json({ success: false, error: 'Invalid game name' });
    if (!isValidPositiveInt(Number(score), 1_000_000))
      return res.status(400).json({ success: false, error: 'Invalid score' });

    const game = new Game({
      userId:     req.userId,
      gameId:     sanitizeString(gameId || '', 100),
      gameName:   sanitizeString(gameName, 100),
      score:      Number(score) || 0,
      level:      isValidPositiveInt(Number(level),      10_000) ? Number(level)      : 0,
      timePlayed: isValidPositiveInt(Number(timePlayed), 86_400) ? Number(timePlayed) : 0,
    });

    await game.save();

    // ── Trigger ML retraining (non-blocking) ─────────────────────────────────
    // We fire-and-forget so the HTTP response is not delayed.
    // Fetch the full user history and hand it to the Python microservice.
    setImmediate(async () => {
      try {
        const allGames = await Game
          .find({ userId: req.userId })
          .sort({ timestamp: 1 })    // chronological order matters for trend features
          .lean();
        trainAsync(String(req.userId), allGames);  // non-blocking inside too
      } catch (e) {
        console.warn('[game.js] Failed to fetch history for ML retraining:', e.message);
      }
    });
    // ─────────────────────────────────────────────────────────────────────────

    res.json({ success: true, message: 'Game score saved', game });
  } catch (err) {
    console.error('Save game error:', err);
    res.status(500).json({ success: false, error: 'Failed to save game' });
  }
});

// ── GET / — all scores for this user ─────────────────────────────────────────
router.get('/', verifyToken, async (req, res) => {
  try {
    const games = await Game.find({ userId: req.userId }).sort({ timestamp: -1 });
    res.json({ success: true, games });
  } catch (err) {
    console.error('Get games error:', err);
    res.status(500).json({ success: false, error: 'Failed to get games' });
  }
});

router.get('/name/:gameName', verifyToken, async (req, res, next) => {
  try {
    const games = await Game
      .find({ userId: req.userId, gameName: req.params.gameName })
      .sort({ timestamp: -1 });
    res.json({ success: true, games });
  } catch (err) {
    next(err);
  }
});

// Get global games leaderboard (public - all users, all games, sorted by score)
router.get('/leaderboard/public/all', async (req, res) => {
  try {
    // Get best score per user across all games
    const leaderboard = await Game.aggregate([
      {
        $group: {
          _id: '$userId',
          highestScore: { $max: '$score' },
          highestLevel: { $max: '$level' },
          gamesPlayed: { $sum: 1 },
          gameName: { $first: '$gameName' },
          timestamp: { $max: '$timestamp' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails'
        }
      },
      {
        $unwind: {
          path: '$userDetails',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: { highestScore: -1, highestLevel: -1 }
      },
      {
        $limit: 100
      },
      {
        $project: {
          _id: 1,
          userId: '$_id',
          name: '$userDetails.name',
          highestScore: 1,
          highestLevel: 1,
          gamesPlayed: 1,
          gameName: 1,
          timestamp: 1
        }
      }
    ]);

    // Ensure all entries have a name
    const leaderboardWithNames = leaderboard.map(entry => ({
      ...entry,
      displayName: entry.name || 'Gamer'
    }));

    res.json({ success: true, leaderboard: leaderboardWithNames });
  } catch (err) {
    console.error('Get global games leaderboard error:', err);
    res.status(500).json({ success: false, error: 'Failed to get games leaderboard' });
  }
});

router.get('/leaderboard/:gameName', async (req, res, next) => {
  try {
    const leaderboard = await Game
      .find({ gameName: req.params.gameName })
      .populate('userId', 'name avatarId')
      .sort({ score: -1, level: -1, timePlayed: 1 })
      .limit(10);
    res.json({ success: true, leaderboard });
  } catch (err) {
    next(err);
  }
});

router.get('/stats/:gameName', verifyToken, async (req, res, next) => {
  try {
    const games = await Game.find({ userId: req.userId, gameName: req.params.gameName });
    const stats = {
      totalPlayed: games.length,
      highestScore: safeMax(games.map(g => g.score)),
      highestLevel: safeMax(games.map(g => g.level)),
      averageScore: games.length > 0
        ? (games.reduce((a, b) => a + b.score, 0) / games.length).toFixed(2) : 0,
      totalTimePlayed: games.reduce((a, b) => a + (b.timePlayed || 0), 0),
    };
    res.json({ success: true, stats });
  } catch (err) {
    next(err);
  }
});

// ── GET /:id ──────────────────────────────────────────────────────────────────
router.get('/:id', verifyToken, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid game ID' });
    }

    const game = await Game.findById(req.params.id).populate('userId', 'name avatarId');
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    if (game.userId._id.toString() !== req.userId.toString())
      return res.status(403).json({ success: false, error: 'Can only view your own games' });
    res.json({ success: true, game });
  } catch (err) {
    console.error('Get game error:', err);
    res.status(500).json({ success: false, error: 'Failed to get game' });
  }
});

// ── PUT /:id ──────────────────────────────────────────────────────────────────
router.put('/:id', verifyToken, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid game ID' });
    }

    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    if (game.userId.toString() !== req.userId.toString())
      return res.status(403).json({ success: false, error: 'Can only update your own games' });

    const allowed = {};
    if (req.body.score      !== undefined && isValidPositiveInt(Number(req.body.score),      1_000_000)) allowed.score      = Number(req.body.score);
    if (req.body.level      !== undefined && isValidPositiveInt(Number(req.body.level),      10_000))    allowed.level      = Number(req.body.level);
    if (req.body.timePlayed !== undefined && isValidPositiveInt(Number(req.body.timePlayed), 86_400))    allowed.timePlayed = Number(req.body.timePlayed);

    const updatedGame = await Game.findByIdAndUpdate(req.params.id, allowed, { new: true });
    res.json({ success: true, game: updatedGame });
  } catch (err) {
    console.error('Update game error:', err);
    res.status(500).json({ success: false, error: 'Failed to update game' });
  }
});

// ── DELETE /:id ───────────────────────────────────────────────────────────────
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid game ID' });
    }

    const game = await Game.findById(req.params.id);
    if (!game) return res.status(404).json({ success: false, error: 'Game not found' });
    if (game.userId.toString() !== req.userId.toString())
      return res.status(403).json({ success: false, error: 'Can only delete your own games' });
    await Game.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Game deleted' });
  } catch (err) {
    console.error('Delete game error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete game' });
  }
});

module.exports = router;
