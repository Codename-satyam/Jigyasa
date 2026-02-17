const GAMES_KEY = 'qq_games_played';

function loadGames() {
  try {
    const raw = localStorage.getItem(GAMES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveGames(list) {
  localStorage.setItem(GAMES_KEY, JSON.stringify(list));
}

export function recordGamePlay(record) {
  const list = loadGames();
  list.push({ 
    id: Date.now(), 
    timestamp: new Date().toISOString(),
    ...record 
  });
  saveGames(list);
}

export function getGamePlays() {
  return loadGames();
}

export function getGamePlaysByType(gameType) {
  const games = loadGames();
  return games.filter(g => g.gameType === gameType);
}

export function getGamePlaysByEmail(email) {
  const games = loadGames();
  return games.filter(g => g.email === email);
}

export function clearGamesData() {
  saveGames([]);
}

const gamesTracker = { 
  recordGamePlay, 
  getGamePlays, 
  getGamePlaysByType, 
  getGamePlaysByEmail,
  clearGamesData 
};
export default gamesTracker;
