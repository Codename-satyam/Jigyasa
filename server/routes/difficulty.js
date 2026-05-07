// server/routes/difficulty.js
// GET /api/difficulty/recommend
//
// Fetches the authenticated user's game history from local JSON storage, sends it to
// the Python ML microservice, and returns the predicted difficulty.
// Falls back gracefully if the microservice is unreachable.

const express = require('express');
const router  = express.Router();
const Game    = require('../models/Game');
const { verifyToken } = require('../middleware/auth');
const { predict }     = require('./ml/mlClient');       // ← ML microservice

const LOOKBACK = 30;   // how many recent games to send to the model

router.get('/recommend', verifyToken, async (req, res) => {
  try {
    // Optional per-game filter (e.g. ?gameId=math)
    const { gameId } = req.query;
    const filter     = { userId: req.userId };
    if (gameId) filter.gameId = gameId;

    // Fetch in chronological order — the model uses trend features
    const recentGames = await Game
      .find(filter)
      .sort({ timestamp: 1 })
      .limit(LOOKBACK)
      .lean();

    // Call the Python ML microservice
    const prediction = await predict(String(req.userId), recentGames);

    return res.json({
      success:          true,
      recommended:      prediction.recommended,      // 'easy' | 'medium' | 'hard'
      difficulty_score: prediction.difficulty_score, // 0-1 continuous
      confidence:       prediction.confidence,       // 0-1
      model_type:       prediction.model_type,       // 'gradient_boosting' | 'heuristic_fallback' | ...
      games_analyzed:   prediction.games_analyzed,
    });

  } catch (err) {
    console.error('Difficulty recommend error:', err);
    // Always return a safe default so games never break
    return res.json({
      success:          true,
      recommended:      'medium',
      difficulty_score:  0.5,
      confidence:        0.0,
      model_type:        'server_fallback',
      games_analyzed:    0,
    });
  }
});

module.exports = router;
