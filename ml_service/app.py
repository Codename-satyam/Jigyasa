"""
ml_service/app.py
-----------------
Supervised-regression ML microservice for adaptive game difficulty.

Algorithm : GradientBoostingRegressor (sklearn)
Target    : difficulty_score in [0, 1]
              0.00-0.33 → easy
              0.34-0.66 → medium
              0.67-1.00 → hard

Per-user model files are stored in ./models/<userId>.joblib so every player
gets their own personalised predictor.  On first call (< MIN_SAMPLES games)
the service falls back to a rule-based heuristic so the API always responds.

Endpoints
---------
POST /predict   { "userId": str, "games": [ {...}, ... ] }
                → { "difficulty_score": float, "recommended": str,
                    "confidence": float, "model_type": str }

POST /train     { "userId": str, "games": [ {...}, ... ] }
                → { "success": bool, "samples": int, "model_type": str }

GET  /health    → { "status": "ok" }
"""

import os
import math
import logging
import traceback
from pathlib import Path

import joblib
import numpy as np
from flask import Flask, request, jsonify
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import cross_val_score

# ── Config ────────────────────────────────────────────────────────────────────
MODEL_DIR   = Path(os.environ.get("MODEL_DIR", "./models"))
MODEL_DIR.mkdir(parents=True, exist_ok=True)

MIN_SAMPLES = 5          # minimum games before we trust the trained model
LOOKBACK    = 30         # how many recent games to use for training/prediction
LOG_LEVEL   = os.environ.get("LOG_LEVEL", "INFO").upper()

logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger(__name__)

app = Flask(__name__)

# ── Per-game normalisation ceilings ──────────────────────────────────────────
SCORE_CEIL = {"memory": 10, "neon-path": 500, "math": 10, "guess": 12, "default": 100}
LEVEL_CEIL = {"memory":  1, "neon-path":  20, "math":  1, "guess":  1, "default":  10}
TIME_CEIL  = {"memory":  0, "neon-path": 300, "math": 150, "guess": 180, "default": 120}

def _ceil(mapping, game_id):
    return mapping.get(game_id.lower(), mapping["default"])


# ── Feature engineering ───────────────────────────────────────────────────────
def extract_features(games: list[dict]) -> np.ndarray:
    """
    Turn a list of game records into a 1-D feature vector.

    Features (all in [0, 1] unless noted):
      0  avg_score_norm      — normalised average score
      1  avg_level_norm      — normalised average level reached
      2  avg_time_eff        — time efficiency (lower time → higher value)
      3  win_rate            — fraction of games where score >= 60 % of ceiling
      4  games_played_norm   — log-scaled game count (saturates at LOOKBACK)
      5  score_trend         — linear slope of last min(5, n) normalised scores
      6  level_trend         — linear slope of last min(5, n) normalised levels
      7  consistency         — 1 - std(norm_scores)  (higher = more consistent)
    """
    if not games:
        return np.zeros(8, dtype=np.float32)

    recent = games[-LOOKBACK:]
    n      = len(recent)

    norm_scores = []
    norm_levels = []
    norm_times  = []
    wins        = []

    for g in recent:
        gid        = str(g.get("gameId") or g.get("gameType") or "default").lower()
        sc         = float(g.get("score",      0))
        lv         = float(g.get("level",      0))
        tp         = float(g.get("timePlayed", 0))

        sc_ceil = _ceil(SCORE_CEIL, gid)
        lv_ceil = _ceil(LEVEL_CEIL, gid)
        tm_ceil = _ceil(TIME_CEIL,  gid)

        ns = min(sc / sc_ceil, 1.0) if sc_ceil > 0 else 0.0
        nl = min(lv / lv_ceil, 1.0) if lv_ceil > 0 else 0.0
        nt = (1.0 - min(tp / tm_ceil, 1.0)) if tm_ceil > 0 else 0.0

        norm_scores.append(ns)
        norm_levels.append(nl)
        norm_times.append(nt)
        wins.append(1.0 if ns >= 0.6 else 0.0)

    def slope(arr):
        """Least-squares slope over the last 5 entries, scaled to [-1, 1]."""
        tail = arr[-5:]
        if len(tail) < 2:
            return 0.0
        x = np.arange(len(tail), dtype=np.float32)
        x -= x.mean()
        denom = float(np.dot(x, x)) or 1.0
        return float(np.dot(x, tail)) / denom

    avg_score  = float(np.mean(norm_scores))
    avg_level  = float(np.mean(norm_levels))
    avg_time   = float(np.mean(norm_times))
    win_rate   = float(np.mean(wins))
    gp_norm    = math.log1p(n) / math.log1p(LOOKBACK)
    sc_trend   = slope(norm_scores)
    lv_trend   = slope(norm_levels)
    consistency = max(0.0, 1.0 - float(np.std(norm_scores)))

    return np.array([
        avg_score, avg_level, avg_time,
        win_rate, gp_norm,
        sc_trend, lv_trend,
        consistency,
    ], dtype=np.float32)


def compute_target(games: list[dict]) -> float:
    """
    Rule-based difficulty score (ground truth for supervised training).
    Combines normalised score, level, time into a single [0, 1] value.
    Weights: score 50 %, level 30 %, time 20 %.
    """
    feats = extract_features(games)
    # feats[0]=avg_score, feats[1]=avg_level, feats[2]=avg_time
    raw = 0.50 * feats[0] + 0.30 * feats[1] + 0.20 * feats[2]
    return float(np.clip(raw, 0.0, 1.0))


def score_to_difficulty(score: float) -> str:
    if score >= 0.67:
        return "hard"
    if score >= 0.34:
        return "medium"
    return "easy"


# ── Model persistence ─────────────────────────────────────────────────────────
def model_path(user_id: str) -> Path:
    safe = "".join(c for c in user_id if c.isalnum() or c in "-_")[:64]
    return MODEL_DIR / f"{safe}.joblib"


def load_model(user_id: str):
    p = model_path(user_id)
    if p.exists():
        try:
            return joblib.load(p)
        except Exception as e:
            log.warning("Failed to load model for %s: %s", user_id, e)
    return None


def save_model(user_id: str, pipeline):
    try:
        joblib.dump(pipeline, model_path(user_id))
    except Exception as e:
        log.warning("Failed to save model for %s: %s", user_id, e)


def build_pipeline() -> Pipeline:
    return Pipeline([
        ("scaler", StandardScaler()),
        ("gbr", GradientBoostingRegressor(
            n_estimators=100,
            learning_rate=0.1,
            max_depth=3,
            subsample=0.8,
            min_samples_leaf=2,
            random_state=42,
        )),
    ])


# ── Training ──────────────────────────────────────────────────────────────────
def train_model(user_id: str, games: list[dict]):
    """
    Build training data using a sliding-window approach:
      X[i] = features of games[0..i]
      y[i] = rule-based target score at that snapshot
    This lets us train even from a single player with N games.
    """
    n = len(games)
    if n < MIN_SAMPLES:
        log.info("User %s has only %d games — skipping training", user_id, n)
        return None, n

    X, y = [], []
    for i in range(MIN_SAMPLES, n + 1):
        window = games[:i]
        X.append(extract_features(window))
        y.append(compute_target(window))

    X = np.array(X, dtype=np.float32)
    y = np.array(y, dtype=np.float32)

    pipeline = load_model(user_id) or build_pipeline()

    # Refit on all available data
    pipeline.fit(X, y)

    # Cross-val score (only if we have enough samples for 3 folds)
    if len(X) >= 3:
        try:
            cv_scores = cross_val_score(
                pipeline, X, y,
                cv=min(3, len(X)),
                scoring="neg_mean_squared_error",
            )
            log.info(
                "User %s — trained on %d samples, CV MSE: %.4f ± %.4f",
                user_id, len(X), -cv_scores.mean(), cv_scores.std(),
            )
        except Exception:
            pass

    save_model(user_id, pipeline)
    log.info("Model saved for user %s", user_id)
    return pipeline, n


# ── Prediction ────────────────────────────────────────────────────────────────
def predict_difficulty(user_id: str, games: list[dict]) -> dict:
    """
    Returns prediction dict.  Falls back to rule-based heuristic when:
      - fewer than MIN_SAMPLES games exist
      - no trained model found on disk
    """
    n       = len(games)
    feats   = extract_features(games).reshape(1, -1)
    pipeline = load_model(user_id)

    if pipeline is not None and n >= MIN_SAMPLES:
        try:
            raw_score  = float(np.clip(pipeline.predict(feats)[0], 0.0, 1.0))
            recommended = score_to_difficulty(raw_score)

            # Confidence: how far from the nearest threshold
            dist_easy   = abs(raw_score - 0.335)
            dist_medium = abs(raw_score - 0.665)
            confidence  = float(np.clip(min(dist_easy, dist_medium) / 0.33, 0.0, 1.0))

            log.info(
                "User %s — ML predict: %.3f → %s (conf %.2f)",
                user_id, raw_score, recommended, confidence,
            )
            return {
                "difficulty_score": raw_score,
                "recommended":      recommended,
                "confidence":       confidence,
                "model_type":       "gradient_boosting",
                "games_analyzed":   n,
            }
        except Exception as e:
            log.warning("Predict failed for %s, falling back: %s", user_id, e)

    # ── Heuristic fallback ──────────────────────────────────────────────────
    rule_score  = compute_target(games)
    recommended = score_to_difficulty(rule_score)
    log.info(
        "User %s — heuristic fallback: %.3f → %s (%d games)",
        user_id, rule_score, recommended, n,
    )
    return {
        "difficulty_score": rule_score,
        "recommended":      recommended,
        "confidence":       0.5,
        "model_type":       "heuristic_fallback",
        "games_analyzed":   n,
    }


# ── Routes ────────────────────────────────────────────────────────────────────
@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model_dir": str(MODEL_DIR)})


@app.route("/predict", methods=["POST"])
def predict():
    try:
        body    = request.get_json(force=True)
        user_id = str(body.get("userId", "anonymous"))
        games   = list(body.get("games", []))

        result = predict_difficulty(user_id, games)
        return jsonify({"success": True, **result})

    except Exception:
        log.error("Error in /predict:\n%s", traceback.format_exc())
        return jsonify({
            "success":        False,
            "error":          "prediction_failed",
            "recommended":    "medium",
            "difficulty_score": 0.5,
            "confidence":     0.0,
            "model_type":     "error_fallback",
        }), 500


@app.route("/train", methods=["POST"])
def train():
    try:
        body    = request.get_json(force=True)
        user_id = str(body.get("userId", "anonymous"))
        games   = list(body.get("games", []))

        pipeline, n = train_model(user_id, games)
        model_type  = "gradient_boosting" if pipeline is not None else "heuristic_fallback"

        return jsonify({
            "success":    True,
            "samples":    n,
            "model_type": model_type,
            "trained":    pipeline is not None,
        })

    except Exception:
        log.error("Error in /train:\n%s", traceback.format_exc())
        return jsonify({"success": False, "error": "training_failed"}), 500


# ── Entry point ───────────────────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("ML_PORT", 5001))
    log.info("ML microservice starting on port %d", port)
    app.run(host="0.0.0.0", port=port, debug=False)
