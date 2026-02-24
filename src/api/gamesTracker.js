import { apiCall } from './client.js';

const GAMES_KEY = 'jq_games_played';

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

// Save game data to MongoDB
async function syncGameToMongoDB(record) {
  try {
    const response = await apiCall('/api/games', 'POST', {
      gameId: record.gameType || record.gameId,
      gameName: record.gameType || record.gameName,
      score: record.score || 0,
      level: record.level || 1,
      timePlayed: record.timePlayed || 0
    });
    console.log('✅ Game score synced to MongoDB:', response);
    return response;
  } catch (error) {
    console.error('❌ Failed to sync game to MongoDB:', error);
    // Still save to localStorage as fallback
  }
}

export async function recordGamePlay(record) {
  const list = loadGames();
  const gameRecord = { 
    id: Date.now(), 
    timestamp: new Date().toISOString(),
    ...record 
  };
  list.push(gameRecord);
  saveGames(list);
  
  // Sync to MongoDB (for persistence)
  await syncGameToMongoDB(gameRecord);
}

// Load games from MongoDB
export async function loadGamesFromMongoDB() {
  try {
    const response = await apiCall('/api/games', 'GET');
    if (response.success && response.games) {
      console.log('✅ Loaded games from MongoDB:', response.games);
      
      // Merge with localStorage (keep unique entries)
      const localGames = loadGames();
      const mergedGames = [...localGames];
      
      response.games.forEach(mongoGame => {
        // Check if game already exists in local storage
        const exists = localGames.some(local => 
          local.timestamp === mongoGame.timestamp && local.score === mongoGame.score
        );
        
        if (!exists) {
          mergedGames.push({
            id: Date.now() + Math.random(),
            timestamp: mongoGame.timestamp,
            gameType: mongoGame.gameName || mongoGame.gameId,
            score: mongoGame.score,
            level: mongoGame.level,
            timePlayed: mongoGame.timePlayed
          });
        }
      });
      
      saveGames(mergedGames);
      return response.games;
    }
  } catch (error) {
    console.error('Failed to load games from MongoDB:', error);
  }
  return [];
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
