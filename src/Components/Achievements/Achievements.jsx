import React, { useState, useMemo } from 'react';
import './Achievements.css';
import scoresApi from '../../api/scores.js';
import gamesTracker from '../../api/gamesTracker.js';
import auth from '../../api/auth.js';

function Achievements() {
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const user = auth.getCurrentUser();

  const [scores, setScores] = React.useState([]);
  const [games, setGames] = React.useState([]);
  const [unlockedDates, setUnlockedDates] = React.useState({});

  React.useEffect(() => {
    const loadData = async () => {
      try {
        const scoresData = await scoresApi.getScores();
        const gamesData = gamesTracker.getGamePlays();
        setScores(scoresData || []);
        setGames(gamesData || []);

        const storedDates = JSON.parse(localStorage.getItem('achievementUnlockDates') || '{}');
        setUnlockedDates(storedDates);
      } catch (error) {
        console.error('Error loading achievements data:', error);
      }
    };
    loadData();
  }, []);

  const allAchievements = useMemo(() => {
    if (!user) return [];

    const myScores = scores.filter((s) => s.email === user.email);
    const userGames = games.filter((g) => g.email === user.email);
    const gamesByType = {};
    userGames.forEach((g) => {
      if (!gamesByType[g.gameType]) gamesByType[g.gameType] = [];
      gamesByType[g.gameType].push(g);
    });

    const bestScore = myScores.reduce((best, s) => {
      const total = Number(s.totalQuestions || s.total) || 0;
      const score = Number(s.correctAnswers || s.score) || 0;
      return Math.max(best, total > 0 ? Math.round((score / total) * 100) : 0);
    }, 0);

    const bestGameScore = userGames.reduce((best, g) => Math.max(best, Number(g.score) || 0), 0);

    const perfectScoreCount = myScores.filter(s => {
      const total = Number(s.totalQuestions || s.total) || 0;
      const score = Number(s.correctAnswers || s.score) || 0;
      return total > 0 && Math.round((score / total) * 100) === 100;
    }).length;

    const highScoreQuizCount = myScores.filter(s => {
      const total = Number(s.totalQuestions || s.total) || 0;
      const score = Number(s.correctAnswers || s.score) || 0;
      return total > 0 && Math.round((score / total) * 100) >= 90;
    }).length;

    const totalGameScore = userGames.reduce((sum, g) => sum + (Number(g.score) || 0), 0);
    const gameTypesPlayed = Object.keys(gamesByType).length;

    return [
      { id: 'quiz-starter', title: 'QUIZ STARTER', description: 'Complete your first quiz.', category: 'quiz', icon: '🧠', rarity: 'common', progress: myScores.length, requirement: 1, unlocked: myScores.length >= 1, unlockedDate: unlockedDates['quiz-starter'], difficulty: '⭐', reward: '+10 XP' },
      { id: 'quiz-ace', title: 'QUIZ ACE', description: 'Score 80% or more on a quiz.', category: 'quiz', icon: '⭐', rarity: 'rare', progress: bestScore, requirement: 80, unlocked: bestScore >= 80, unlockedDate: unlockedDates['quiz-ace'], difficulty: '⭐⭐', reward: '+25 XP' },
      { id: 'quiz-master', title: 'QUIZ MASTER', description: 'Score 100% on a quiz.', category: 'quiz', icon: '🎓', rarity: 'epic', progress: bestScore, requirement: 100, unlocked: bestScore === 100, unlockedDate: unlockedDates['quiz-master'], difficulty: '⭐⭐⭐', reward: '+50 XP' },
      { id: 'quiz-streak-5', title: 'QUIZ STREAK', description: 'Complete 5 quizzes.', category: 'quiz', icon: '🔥', rarity: 'rare', progress: myScores.length, requirement: 5, unlocked: myScores.length >= 5, unlockedDate: unlockedDates['quiz-streak-5'], difficulty: '⭐⭐', reward: '+30 XP' },
      { id: 'quiz-marathoner', title: 'MARATHONER', description: 'Complete 10 quizzes.', category: 'quiz', icon: '💪', rarity: 'epic', progress: myScores.length, requirement: 10, unlocked: myScores.length >= 10, unlockedDate: unlockedDates['quiz-marathoner'], difficulty: '⭐⭐⭐', reward: '+50 XP' },
      { id: 'game-first', title: 'GAME MASTER', description: 'Play your first game.', category: 'games', icon: '🎮', rarity: 'common', progress: userGames.length, requirement: 1, unlocked: userGames.length >= 1, unlockedDate: unlockedDates['game-first'], difficulty: '⭐', reward: '+10 XP' },
      { id: 'game-5-plays', title: 'GAME FAN', description: 'Play 5 games.', category: 'games', icon: '🎯', rarity: 'rare', progress: userGames.length, requirement: 5, unlocked: userGames.length >= 5, unlockedDate: unlockedDates['game-5-plays'], difficulty: '⭐⭐', reward: '+25 XP' },
      { id: 'game-10-plays', title: 'GAME LEGEND', description: 'Play 10 games.', category: 'games', icon: '👑', rarity: 'epic', progress: userGames.length, requirement: 10, unlocked: userGames.length >= 10, unlockedDate: unlockedDates['game-10-plays'], difficulty: '⭐⭐⭐', reward: '+50 XP' },
      { id: 'game-high-scorer', title: 'HIGH SCORER', description: 'Score 100+ in any game.', category: 'games', icon: '🏆', rarity: 'epic', progress: bestGameScore, requirement: 100, unlocked: bestGameScore >= 100, unlockedDate: unlockedDates['game-high-scorer'], difficulty: '⭐⭐⭐', reward: '+50 XP' },
      { id: 'memory-master', title: 'MEMORY PRO', description: 'Play Memory Card Game.', category: 'memory', icon: '🧠', rarity: 'common', progress: (gamesByType['memory'] || []).length, requirement: 1, unlocked: (gamesByType['memory'] || []).length >= 1, unlockedDate: unlockedDates['memory-master'], difficulty: '⭐', reward: '+10 XP' },
      { id: 'guess-expert', title: 'GUESS EXPERT', description: 'Play Guess the Guy game.', category: 'guess', icon: '🤔', rarity: 'common', progress: (gamesByType['guess'] || []).length, requirement: 1, unlocked: (gamesByType['guess'] || []).length >= 1, unlockedDate: unlockedDates['guess-expert'], difficulty: '⭐', reward: '+10 XP' },
      { id: 'monument-traveler', title: 'TRAVELER', description: 'Play Monument game.', category: 'monument', icon: '🗼', rarity: 'common', progress: (gamesByType['monument'] || []).length, requirement: 1, unlocked: (gamesByType['monument'] || []).length >= 1, unlockedDate: unlockedDates['monument-traveler'], difficulty: '⭐', reward: '+10 XP' },
      { id: 'math-solver', title: 'MATH SOLVER', description: 'Play Math game.', category: 'math', icon: '🔢', rarity: 'common', progress: (gamesByType['math'] || []).length, requirement: 1, unlocked: (gamesByType['math'] || []).length >= 1, unlockedDate: unlockedDates['math-solver'], difficulty: '⭐', reward: '+10 XP' },
      { id: 'game-2048-player', title: '2048 PLAYER', description: 'Play 2048 game.', category: '2048', icon: '🎲', rarity: 'common', progress: (gamesByType['2048'] || []).length, requirement: 1, unlocked: (gamesByType['2048'] || []).length >= 1, unlockedDate: unlockedDates['game-2048-player'], difficulty: '⭐', reward: '+10 XP' },
      { id: 'game-6-player', title: 'EXPLORER', description: 'Play Game 6.', category: 'game6', icon: '🚀', rarity: 'common', progress: (gamesByType['game6'] || []).length, requirement: 1, unlocked: (gamesByType['game6'] || []).length >= 1, unlockedDate: unlockedDates['game-6-player'], difficulty: '⭐', reward: '+10 XP' },
      { id: 'all-star-gamer', title: 'ALL-STAR', description: 'Play all 6 different games.', category: 'games', icon: '🌟', rarity: 'rare', progress: gameTypesPlayed, requirement: 6, unlocked: gameTypesPlayed >= 6, unlockedDate: unlockedDates['all-star-gamer'], difficulty: '⭐⭐', reward: '+40 XP' },
      { id: 'perfect-score-collector', title: 'PERFECTION', description: 'Get 100% on 3 quizzes.', category: 'quiz', icon: '💯', rarity: 'rare', progress: perfectScoreCount, requirement: 3, unlocked: perfectScoreCount >= 3, unlockedDate: unlockedDates['perfect-score-collector'], difficulty: '⭐⭐', reward: '+35 XP' },
      { id: 'knowledge-seeker', title: 'SCHOLAR', description: 'Score 90%+ on 5 quizzes.', category: 'quiz', icon: '📚', rarity: 'rare', progress: highScoreQuizCount, requirement: 5, unlocked: highScoreQuizCount >= 5, unlockedDate: unlockedDates['knowledge-seeker'], difficulty: '⭐⭐', reward: '+35 XP' },
      { id: 'point-master', title: 'COIN MASTER', description: 'Get 500 total game points.', category: 'games', icon: '🪙', rarity: 'rare', progress: totalGameScore, requirement: 500, unlocked: totalGameScore >= 500, unlockedDate: unlockedDates['point-master'], difficulty: '⭐⭐', reward: '+40 XP' },
      { id: 'champion-gamer', title: 'CHAMPION', description: 'Score 200+ in a single game.', category: 'games', icon: '🥇', rarity: 'epic', progress: bestGameScore, requirement: 200, unlocked: bestGameScore >= 200, unlockedDate: unlockedDates['champion-gamer'], difficulty: '⭐⭐⭐', reward: '+60 XP' }
    ];
  }, [scores, games, user, unlockedDates]);

  const filteredAchievements = useMemo(() => {
    let filtered = allAchievements;
    if (filterType === 'unlocked') {
      filtered = filtered.filter((a) => a.unlocked);
    } else if (filterType === 'locked') {
      filtered = filtered.filter((a) => !a.unlocked);
    }

    if (sortBy === 'name') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortBy === 'unlock-date') {
      filtered.sort((a, b) => {
        const dateA = a.unlockedDate ? new Date(a.unlockedDate) : new Date(0);
        const dateB = b.unlockedDate ? new Date(b.unlockedDate) : new Date(0);
        return dateB - dateA;
      });
    } else if (sortBy === 'type') {
      filtered.sort((a, b) => a.category.localeCompare(b.category));
    }
    return filtered;
  }, [allAchievements, filterType, sortBy]);

  const stats = useMemo(() => {
    return {
      total: allAchievements.length,
      unlocked: allAchievements.filter((a) => a.unlocked).length,
      locked: allAchievements.filter((a) => !a.unlocked).length,
      completion: Math.round((allAchievements.filter((a) => a.unlocked).length / allAchievements.length) * 100),
      totalXP: allAchievements.filter((a) => a.unlocked).reduce((sum, a) => {
        const xpMatch = a.reward.match(/\+(\d+)/);
        return sum + (xpMatch ? parseInt(xpMatch[1]) : 0);
      }, 0)
    };
  }, [allAchievements]);

  return (
    <div className="achievements-container">
      <div className="achievements-shell">
        
        {/* HEADER */}
        <div className="achievements-header pixel-box">
          <h1 className="achievements-title blocky-text">TROPHY ROOM</h1>
          <p className="achievements-subtitle">LEVEL UP YOUR STATS!</p>
        </div>

        {/* STATS SECTION */}
        <div className="achievement-stats-grid">
          <div className="stat-card pixel-box blue-theme">
            <div className="stat-label">TOTAL</div>
            <div className="stat-number">{stats.total}</div>
          </div>
          <div className="stat-card pixel-box green-theme">
            <div className="stat-label">UNLOCKED</div>
            <div className="stat-number">{stats.unlocked}</div>
          </div>
          <div className="stat-card pixel-box red-theme">
            <div className="stat-label">LOCKED</div>
            <div className="stat-number">{stats.locked}</div>
          </div>
          <div className="stat-card pixel-box gold-theme">
            <div className="stat-label">XP EARNED</div>
            <div className="stat-number">{stats.totalXP}</div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="achievement-progress-section pixel-box">
          <div className="progress-label">
            <span className="progress-text">COMPLETION: {stats.completion}%</span>
            <span className="progress-counter">{stats.unlocked}/{stats.total}</span>
          </div>
          <div className="progress-bar-container pixel-border">
            <div className="progress-bar-fill" style={{ width: `${stats.completion}%` }}></div>
          </div>
        </div>

        {/* FILTERS & SORT */}
        <div className="achievements-controls pixel-box">
          <div className="filter-group">
            <span className="filter-label">FILTER:</span>
            <div className="filter-buttons">
              <button className={`filter-btn pixel-btn ${filterType === 'all' ? 'active' : ''}`} onClick={() => setFilterType('all')}>ALL</button>
              <button className={`filter-btn pixel-btn ${filterType === 'unlocked' ? 'active' : ''}`} onClick={() => setFilterType('unlocked')}>UNLOCKED</button>
              <button className={`filter-btn pixel-btn ${filterType === 'locked' ? 'active' : ''}`} onClick={() => setFilterType('locked')}>LOCKED</button>
            </div>
          </div>

          <div className="sort-group">
            <span className="sort-label">SORT:</span>
            <select className="sort-select pixel-btn" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">A-Z</option>
              <option value="unlock-date">NEWEST</option>
              <option value="type">CATEGORY</option>
            </select>
          </div>
        </div>

        {/* ACHIEVEMENTS GRID */}
        <div className="achievements-grid">
          {filteredAchievements.length > 0 ? (
            filteredAchievements.map((achievement) => (
              <div key={achievement.id} className={`achievement-card pixel-box ${achievement.unlocked ? 'unlocked' : 'locked'} rarity-${achievement.rarity}`}>
                
                {/* ICON/BADGE */}
                <div className="achievement-badge pixel-border">
                  <div className="badge-icon">{achievement.icon}</div>
                  {achievement.unlocked && <div className="badge-unlock-indicator">✓</div>}
                </div>

                {/* CONTENT */}
                <div className="achievement-content">
                  <h3 className="achievement-title blocky-text-small">{achievement.title}</h3>
                  <p className="achievement-description">{achievement.description}</p>

                  {/* PROGRESS BAR FOR LOCKED ACHIEVEMENTS */}
                  {!achievement.unlocked && achievement.requirement > 1 && (
                    <div className="achievement-progress">
                      <div className="progress-small pixel-border">
                        <div
                          className="progress-fill"
                          style={{ width: `${Math.min(100, (achievement.progress / achievement.requirement) * 100)}%` }}
                        />
                      </div>
                      <span className="progress-text">
                        {achievement.progress} / {achievement.requirement}
                      </span>
                    </div>
                  )}

                  {/* UNLOCK DATE OR REQUIREMENT */}
                  <div className="achievement-meta">
                    {achievement.unlocked ? (
                      <span className="unlock-date">GOT: {new Date(achievement.unlockedDate).toLocaleDateString()}</span>
                    ) : (
                      <span className="lock-status">LOCKED</span>
                    )}
                  </div>
                </div>

                {/* FOOTER */}
                <div className="achievement-footer">
                  <span className="achievement-difficulty">{achievement.difficulty}</span>
                  <span className="achievement-reward">{achievement.reward}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-achievements pixel-box">
              <p>NO DATA FOUND.</p>
            </div>
          )}
        </div>

        {/* LEGEND */}
        <div className="achievements-legend pixel-box">
          <h3 className="blocky-text-small">RARITY MAP</h3>
          <div className="rarity-guide">
            <div className="rarity-item common pixel-border">
              <span className="rarity-dot"></span>
              <span>COMMON</span>
            </div>
            <div className="rarity-item rare pixel-border">
              <span className="rarity-dot"></span>
              <span>RARE</span>
            </div>
            <div className="rarity-item epic pixel-border">
              <span className="rarity-dot"></span>
              <span>EPIC</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Achievements;