import React, { useState, useMemo } from 'react';
import './Achievements.css';
import scoresApi from '../../api/scores.js';
import gamesTracker from '../../api/gamesTracker.js';
import auth from '../../api/auth.js';

function Achievements() {
  const [filterType, setFilterType] = useState('all'); // all, unlocked, locked
  const [sortBy, setSortBy] = useState('name'); // name, unlock-date, type
  const user = auth.getCurrentUser();

  // Load user data
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

        // Extract unlock dates from localStorage
        const storedDates = JSON.parse(localStorage.getItem('achievementUnlockDates') || '{}');
        setUnlockedDates(storedDates);
      } catch (error) {
        console.error('Error loading achievements data:', error);
      }
    };
    loadData();
  }, []);

  // Calculate all achievements
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

    // Additional calculations for new achievements
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
      // QUIZ ACHIEVEMENTS
      {
        id: 'quiz-starter',
        title: 'Quiz Starter',
        description: 'Complete your first quiz.',
        category: 'quiz',
        icon: '🧠',
        rarity: 'common',
        progress: myScores.length,
        requirement: 1,
        unlocked: myScores.length >= 1,
        unlockedDate: unlockedDates['quiz-starter'],
        difficulty: '⭐',
        reward: '+10 XP'
      },
      {
        id: 'quiz-ace',
        title: 'Quiz Ace',
        description: 'Score 80% or more on a quiz.',
        category: 'quiz',
        icon: '⭐',
        rarity: 'rare',
        progress: bestScore,
        requirement: 80,
        unlocked: bestScore >= 80,
        unlockedDate: unlockedDates['quiz-ace'],
        difficulty: '⭐⭐',
        reward: '+25 XP'
      },
      {
        id: 'quiz-master',
        title: 'Quiz Master',
        description: 'Score 100% on a quiz.',
        category: 'quiz',
        icon: '🎓',
        rarity: 'epic',
        progress: bestScore,
        requirement: 100,
        unlocked: bestScore === 100,
        unlockedDate: unlockedDates['quiz-master'],
        difficulty: '⭐⭐⭐',
        reward: '+50 XP'
      },
      {
        id: 'quiz-streak-5',
        title: 'Quiz Streak',
        description: 'Complete 5 quizzes.',
        category: 'quiz',
        icon: '🔥',
        rarity: 'rare',
        progress: myScores.length,
        requirement: 5,
        unlocked: myScores.length >= 5,
        unlockedDate: unlockedDates['quiz-streak-5'],
        difficulty: '⭐⭐',
        reward: '+30 XP'
      },
      {
        id: 'quiz-marathoner',
        title: 'Quiz Marathoner',
        description: 'Complete 10 quizzes.',
        category: 'quiz',
        icon: '💪',
        rarity: 'epic',
        progress: myScores.length,
        requirement: 10,
        unlocked: myScores.length >= 10,
        unlockedDate: unlockedDates['quiz-marathoner'],
        difficulty: '⭐⭐⭐',
        reward: '+50 XP'
      },

      // GAME ACHIEVEMENTS
      {
        id: 'game-first',
        title: 'Game Master',
        description: 'Play your first game.',
        category: 'games',
        icon: '🎮',
        rarity: 'common',
        progress: userGames.length,
        requirement: 1,
        unlocked: userGames.length >= 1,
        unlockedDate: unlockedDates['game-first'],
        difficulty: '⭐',
        reward: '+10 XP'
      },
      {
        id: 'game-5-plays',
        title: 'Game Fan',
        description: 'Play 5 games.',
        category: 'games',
        icon: '🎯',
        rarity: 'rare',
        progress: userGames.length,
        requirement: 5,
        unlocked: userGames.length >= 5,
        unlockedDate: unlockedDates['game-5-plays'],
        difficulty: '⭐⭐',
        reward: '+25 XP'
      },
      {
        id: 'game-10-plays',
        title: 'Game Legend',
        description: 'Play 10 games.',
        category: 'games',
        icon: '👑',
        rarity: 'epic',
        progress: userGames.length,
        requirement: 10,
        unlocked: userGames.length >= 10,
        unlockedDate: unlockedDates['game-10-plays'],
        difficulty: '⭐⭐⭐',
        reward: '+50 XP'
      },
      {
        id: 'game-high-scorer',
        title: 'High Scorer',
        description: 'Score 100 or more in any game.',
        category: 'games',
        icon: '🏆',
        rarity: 'epic',
        progress: bestGameScore,
        requirement: 100,
        unlocked: bestGameScore >= 100,
        unlockedDate: unlockedDates['game-high-scorer'],
        difficulty: '⭐⭐⭐',
        reward: '+50 XP'
      },

      // SPECIFIC GAME ACHIEVEMENTS
      {
        id: 'memory-master',
        title: 'Memory Master',
        description: 'Play Memory Card Game.',
        category: 'memory',
        icon: '🧠',
        rarity: 'common',
        progress: (gamesByType['memory'] || []).length,
        requirement: 1,
        unlocked: (gamesByType['memory'] || []).length >= 1,
        unlockedDate: unlockedDates['memory-master'],
        difficulty: '⭐',
        reward: '+10 XP'
      },
      {
        id: 'guess-expert',
        title: 'Guess Expert',
        description: 'Play Guess the Guy game.',
        category: 'guess',
        icon: '🤔',
        rarity: 'common',
        progress: (gamesByType['guess'] || []).length,
        requirement: 1,
        unlocked: (gamesByType['guess'] || []).length >= 1,
        unlockedDate: unlockedDates['guess-expert'],
        difficulty: '⭐',
        reward: '+10 XP'
      },
      {
        id: 'monument-traveler',
        title: 'Monument Traveler',
        description: 'Play Monument game.',
        category: 'monument',
        icon: '🗼',
        rarity: 'common',
        progress: (gamesByType['monument'] || []).length,
        requirement: 1,
        unlocked: (gamesByType['monument'] || []).length >= 1,
        unlockedDate: unlockedDates['monument-traveler'],
        difficulty: '⭐',
        reward: '+10 XP'
      },
      {
        id: 'math-solver',
        title: 'Math Solver',
        description: 'Play Math game.',
        category: 'math',
        icon: '🔢',
        rarity: 'common',
        progress: (gamesByType['math'] || []).length,
        requirement: 1,
        unlocked: (gamesByType['math'] || []).length >= 1,
        unlockedDate: unlockedDates['math-solver'],
        difficulty: '⭐',
        reward: '+10 XP'
      },
      {
        id: 'game-2048-player',
        title: '2048 Player',
        description: 'Play 2048 game.',
        category: '2048',
        icon: '🎲',
        rarity: 'common',
        progress: (gamesByType['2048'] || []).length,
        requirement: 1,
        unlocked: (gamesByType['2048'] || []).length >= 1,
        unlockedDate: unlockedDates['game-2048-player'],
        difficulty: '⭐',
        reward: '+10 XP'
      },
      {
        id: 'game-6-player',
        title: 'Game 6 Explorer',
        description: 'Play Game 6.',
        category: 'game6',
        icon: '🚀',
        rarity: 'common',
        progress: (gamesByType['game6'] || []).length,
        requirement: 1,
        unlocked: (gamesByType['game6'] || []).length >= 1,
        unlockedDate: unlockedDates['game-6-player'],
        difficulty: '⭐',
        reward: '+10 XP'
      },

      // NEW TIER ACHIEVEMENTS
      {
        id: 'all-star-gamer',
        title: 'All-Star Gamer',
        description: 'Play all 6 different games.',
        category: 'games',
        icon: '🌟',
        rarity: 'rare',
        progress: gameTypesPlayed,
        requirement: 6,
        unlocked: gameTypesPlayed >= 6,
        unlockedDate: unlockedDates['all-star-gamer'],
        difficulty: '⭐⭐',
        reward: '+40 XP'
      },
      {
        id: 'perfect-score-collector',
        title: 'Perfect Score Collector',
        description: 'Get 100% on 3 different quizzes.',
        category: 'quiz',
        icon: '💯',
        rarity: 'rare',
        progress: perfectScoreCount,
        requirement: 3,
        unlocked: perfectScoreCount >= 3,
        unlockedDate: unlockedDates['perfect-score-collector'],
        difficulty: '⭐⭐',
        reward: '+35 XP'
      },
      {
        id: 'knowledge-seeker',
        title: 'Knowledge Seeker',
        description: 'Score 90% or higher on 5 quizzes.',
        category: 'quiz',
        icon: '📚',
        rarity: 'rare',
        progress: highScoreQuizCount,
        requirement: 5,
        unlocked: highScoreQuizCount >= 5,
        unlockedDate: unlockedDates['knowledge-seeker'],
        difficulty: '⭐⭐',
        reward: '+35 XP'
      },
      {
        id: 'point-master',
        title: 'Point Master',
        description: 'Accumulate 500 total points in games.',
        category: 'games',
        icon: '🔮',
        rarity: 'rare',
        progress: totalGameScore,
        requirement: 500,
        unlocked: totalGameScore >= 500,
        unlockedDate: unlockedDates['point-master'],
        difficulty: '⭐⭐',
        reward: '+40 XP'
      },
      {
        id: 'scholar',
        title: 'Scholar',
        description: 'Complete 20 quizzes.',
        category: 'quiz',
        icon: '🏅',
        rarity: 'epic',
        progress: myScores.length,
        requirement: 20,
        unlocked: myScores.length >= 20,
        unlockedDate: unlockedDates['scholar'],
        difficulty: '⭐⭐⭐',
        reward: '+60 XP'
      },
      {
        id: 'quiz-master-pro',
        title: 'Quiz Master Pro',
        description: 'Complete 50 quizzes.',
        category: 'quiz',
        icon: '👑',
        rarity: 'epic',
        progress: myScores.length,
        requirement: 50,
        unlocked: myScores.length >= 50,
        unlockedDate: unlockedDates['quiz-master-pro'],
        difficulty: '⭐⭐⭐',
        reward: '+100 XP'
      },
      {
        id: 'quiz-ace-plus',
        title: 'Quiz Ace Plus',
        description: 'Score 90% or higher on 10 quizzes.',
        category: 'quiz',
        icon: '🌠',
        rarity: 'epic',
        progress: highScoreQuizCount,
        requirement: 10,
        unlocked: highScoreQuizCount >= 10,
        unlockedDate: unlockedDates['quiz-ace-plus'],
        difficulty: '⭐⭐⭐',
        reward: '+75 XP'
      },
      {
        id: 'game-completionist',
        title: 'Game Completionist',
        description: 'Play and complete all 6 game types.',
        category: 'games',
        icon: '🎮',
        rarity: 'rare',
        progress: gameTypesPlayed,
        requirement: 6,
        unlocked: gameTypesPlayed >= 6,
        unlockedDate: unlockedDates['game-completionist'],
        difficulty: '⭐⭐',
        reward: '+45 XP'
      },
      {
        id: 'champion-gamer',
        title: 'Champion Gamer',
        description: 'Score 200 or more in a single game.',
        category: 'games',
        icon: '🥇',
        rarity: 'epic',
        progress: bestGameScore,
        requirement: 200,
        unlocked: bestGameScore >= 200,
        unlockedDate: unlockedDates['champion-gamer'],
        difficulty: '⭐⭐⭐',
        reward: '+60 XP'
      },
      {
        id: 'leaderboard-elite',
        title: 'Leaderboard Elite',
        description: 'Be in the top 10 of the leaderboard.',
        category: 'special',
        icon: '🏆',
        rarity: 'epic',
        progress: 0,
        requirement: 1,
        unlocked: false, // This would require leaderboard data
        unlockedDate: null,
        difficulty: '⭐⭐⭐',
        reward: '+80 XP'
      }
    ];
  }, [scores, games, user, unlockedDates]);

  // Filter and sort achievements
  const filteredAchievements = useMemo(() => {
    let filtered = allAchievements;

    // Apply filter
    if (filterType === 'unlocked') {
      filtered = filtered.filter((a) => a.unlocked);
    } else if (filterType === 'locked') {
      filtered = filtered.filter((a) => !a.unlocked);
    }

    // Apply sort
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

  // Calculate stats
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
        <div className="achievements-header">
          <h1 className="achievements-title">ACHIEVEMENT HALL</h1>
          <p className="achievements-subtitle">Unlock badges and prove your mastery</p>
        </div>

        {/* STATS SECTION */}
        <div className="achievement-stats-grid">
          <div className="stat-card total">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Achievements</div>
          </div>
          <div className="stat-card unlocked">
            <div className="stat-number">{stats.unlocked}</div>
            <div className="stat-label">Unlocked</div>
          </div>
          <div className="stat-card locked">
            <div className="stat-number">{stats.locked}</div>
            <div className="stat-label">Locked</div>
          </div>
          <div className="stat-card completion">
            <div className="stat-number">{stats.completion}%</div>
            <div className="stat-label">Completion</div>
          </div>
          <div className="stat-card xp">
            <div className="stat-number">{stats.totalXP}</div>
            <div className="stat-label">XP Earned</div>
          </div>
        </div>

        {/* PROGRESS BAR */}
        <div className="achievement-progress-section">
          <div className="progress-label">
            <span className="progress-text">Achievement Progress</span>
            <span className="progress-counter">{stats.unlocked}/{stats.total}</span>
          </div>
          <div className="progress-bar-container">
            <div className="progress-bar-fill" style={{ width: `${stats.completion}%` }}>
              <span className="progress-bar-text">{stats.completion}%</span>
            </div>
          </div>
        </div>

        {/* FILTERS & SORT */}
        <div className="achievements-controls">
          <div className="filter-group">
            <span className="filter-label">Filter:</span>
            <div className="filter-buttons">
              <button
                className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
                onClick={() => setFilterType('all')}
              >
                All
              </button>
              <button
                className={`filter-btn ${filterType === 'unlocked' ? 'active' : ''}`}
                onClick={() => setFilterType('unlocked')}
              >
                Unlocked
              </button>
              <button
                className={`filter-btn ${filterType === 'locked' ? 'active' : ''}`}
                onClick={() => setFilterType('locked')}
              >
                Locked
              </button>
            </div>
          </div>

          <div className="sort-group">
            <span className="sort-label">Sort:</span>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">By Name</option>
              <option value="unlock-date">By Unlock Date</option>
              <option value="type">By Category</option>
            </select>
          </div>
        </div>

        {/* ACHIEVEMENTS GRID */}
        <div className="achievements-grid">
          {filteredAchievements.length > 0 ? (
            filteredAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'} rarity-${achievement.rarity}`}
              >
                {/* ICON/BADGE */}
                <div className="achievement-badge">
                  <div className="badge-icon">{achievement.icon}</div>
                  {achievement.unlocked && <div className="badge-unlock-indicator">✓</div>}
                </div>

                {/* CONTENT */}
                <div className="achievement-content">
                  <h3 className="achievement-title">{achievement.title}</h3>
                  <p className="achievement-description">{achievement.description}</p>

                  {/* PROGRESS BAR FOR LOCKED ACHIEVEMENTS */}
                  {!achievement.unlocked && achievement.requirement > 1 && (
                    <div className="achievement-progress">
                      <div className="progress-small">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(100, (achievement.progress / achievement.requirement) * 100)}%`
                          }}
                        />
                      </div>
                      <span className="progress-text">
                        {achievement.progress}/{achievement.requirement}
                      </span>
                    </div>
                  )}

                  {/* UNLOCK DATE OR REQUIREMENT */}
                  <div className="achievement-meta">
                    {achievement.unlocked ? (
                      <span className="unlock-date">
                        🔓 {new Date(achievement.unlockedDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="lock-status">🔒 Locked</span>
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
            <div className="no-achievements">
              <p>No achievements found with current filters.</p>
            </div>
          )}
        </div>

        {/* LEGEND */}
        <div className="achievements-legend">
          <h3>Rarity Guide</h3>
          <div className="rarity-guide">
            <div className="rarity-item common">
              <span className="rarity-dot"></span>
              <span>Common - Easy to unlock</span>
            </div>
            <div className="rarity-item rare">
              <span className="rarity-dot"></span>
              <span>Rare - Medium difficulty</span>
            </div>
            <div className="rarity-item epic">
              <span className="rarity-dot"></span>
              <span>Epic - Hard to unlock</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Achievements;
