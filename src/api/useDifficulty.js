// src/api/useDifficulty.js
// Calls GET /api/difficulty/recommend on mount.
// Returns the full ML payload including the raw difficulty_score (0-1)
// so each game can do its own continuous interpolation if needed.

import { useEffect, useState } from 'react';
import { apiCall } from './client.js';

/**
 * @param {string} [gameId]   - game key such as 'memory' or 'neon-path'
 * @param {string} [fallback] - difficulty label if request fails
 */
export function useDifficulty(gameId, fallback = 'medium') {
  const [state, setState] = useState({
    difficulty: fallback,
    difficulty_score: 0.5,
    confidence: 0,
    model_type: null,
    games_analyzed: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchRecommendation() {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        const params = gameId ? `?gameId=${encodeURIComponent(gameId)}` : '';
        const data = await apiCall(`/api/difficulty/recommend${params}`, 'GET');
        if (cancelled) return;

        if (data?.success) {
          setState({
            difficulty: data.recommended ?? fallback,
            difficulty_score: data.difficulty_score ?? 0.5,
            confidence: data.confidence ?? 0,
            model_type: data.model_type ?? null,
            games_analyzed: data.games_analyzed ?? 0,
            loading: false,
            error: null,
          });
        } else {
          setState((s) => ({ ...s, loading: false, error: data?.error ?? 'API error' }));
        }
      } catch (err) {
        if (cancelled) return;
        setState((s) => ({ ...s, loading: false, error: err.message }));
      }
    }

    fetchRecommendation();
    return () => {
      cancelled = true;
    };
  }, [gameId, fallback]);

  return state;
}

export default useDifficulty;
