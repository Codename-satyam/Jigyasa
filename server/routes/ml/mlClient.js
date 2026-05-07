// server/ml/mlClient.js
// Thin async wrapper around the Python ML microservice.
// All calls are fire-and-forget safe — every method catches its own errors
// so a microservice outage never crashes the Node server.

const ML_BASE = process.env.ML_SERVICE_URL || 'http://localhost:5001';
const TIMEOUT_MS = 5000; // 5 s max wait

/**
 * Generic POST helper with timeout.
 */
async function mlPost(path, body) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(`${ML_BASE}${path}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
      signal:  controller.signal,
    });
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Ask the ML service for a difficulty recommendation.
 *
 * @param {string} userId   — local user id string
 * @param {Array}  games    — raw Game records from local storage
 * @returns {{ recommended: string, difficulty_score: number,
 *             confidence: number, model_type: string }}
 */
async function predict(userId, games) {
  try {
    const data = await mlPost('/predict', { userId, games });
    if (!data?.success) throw new Error(data?.error || 'ml predict failed');
    return data;
  } catch (err) {
    console.warn('[mlClient] predict error — using medium fallback:', err.message);
    return {
      recommended:      'medium',
      difficulty_score:  0.5,
      confidence:        0.0,
      model_type:        'error_fallback',
      games_analyzed:    games.length,
    };
  }
}

/**
 * Trigger model retraining after a new game is saved.
 * Always non-blocking — caller does NOT await this.
 *
 * @param {string} userId
 * @param {Array}  games   — all historical Game docs for this user
 */
async function trainAsync(userId, games) {
  try {
    const data = await mlPost('/train', { userId, games });
    if (data?.trained) {
      console.log(`[mlClient] model retrained for user ${userId} on ${data.samples} samples`);
    }
  } catch (err) {
    // Silent — training failure must never surface to the player
    console.warn('[mlClient] train error (non-fatal):', err.message);
  }
}

module.exports = { predict, trainAsync };
