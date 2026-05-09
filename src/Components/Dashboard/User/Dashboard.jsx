import React, {useEffect, useMemo, useState } from 'react';
import './Dashboard.css';
import scoresApi from '../../../api/scores.js';
import gamesTracker from '../../../api/gamesTracker.js';
import auth from '../../../api/auth.js';
import { Link } from 'react-router-dom';
import { getDailyMinutesProgress, getUserSettings } from '../../../api/settings.js';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [link] = useState('/leaderboard');
  const [scores, setScores] = useState([]);
  const [games, setGames] = useState([]);
  const [settings, setSettings] = useState(() => getUserSettings());
  const [dailyProgress, setDailyProgress] = useState(() => getDailyMinutesProgress());
  const [teacher] = useState('/teacher-dashboard');

  useEffect(() => {
    const current = auth.getCurrentUser();
    setUser(current);
    setSettings(getUserSettings());
    setDailyProgress(getDailyMinutesProgress());
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const scoresData = await scoresApi.getScores();
        const gamesData = gamesTracker.getGamePlays();
        setScores(scoresData || []);
        setGames(gamesData || []);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setScores([]);
        setGames([]);
      }
    };
    loadData();
  }, []);

  const myScores = useMemo(() => {
    if (!user) return [];
    return scores
      .filter((s) => s.email && s.email === user.email)
      .sort((a, b) => {
        const dateB = new Date(b.timestamp || b.date).getTime();
        const dateA = new Date(a.timestamp || a.date).getTime();
        return dateB - dateA;
      });
  }, [scores, user]);



  const totals = useMemo(() => {
    return { totalLessons: 0, completedLessons: 0, completionRate: 0 };
  }, []);

  const achievements = useMemo(() => {
    const bestScore = myScores.reduce((best, s) => {
      const total = Number(s.totalQuestions || s.total) || 0;
      const score = Number(s.correctAnswers || s.score) || 0;
      if (total <= 0) return best;
      return Math.max(best, Math.round((score / total) * 100));
    }, 0);

    // Get games played by current user
    const userGames = user ? games.filter(g => g.email === user.email) : [];
    const gamesByType = {};
    userGames.forEach(g => {
      if (!gamesByType[g.gameType]) {
        gamesByType[g.gameType] = [];
      }
      gamesByType[g.gameType].push(g);
    });

    // Calculate best score in games
    const bestGameScore = userGames.reduce((best, g) => {
      const score = Number(g.score) || 0;
      return Math.max(best, score);
    }, 0);

    return [
      // Quiz Achievements
      {
        id: 'quiz-starter',
        title: 'Quiz Starter',
        detail: 'Complete your first quiz.',
        unlocked: myScores.length >= 1,
        icon: '🧠'
      },
      {
        id: 'quiz-ace',
        title: 'Quiz Ace',
        detail: 'Score 80% or more on a quiz.',
        unlocked: bestScore >= 80,
        icon: '⭐'
      },
      // Game Achievements
      {
        id: 'game-first',
        title: 'Game Master',
        detail: 'Play your first game.',
        unlocked: userGames.length >= 1,
        icon: '🎮'
      },
      {
        id: 'game-5-plays',
        title: 'Game Fan',
        detail: 'Play 5 games.',
        unlocked: userGames.length >= 5,
        icon: '🎯'
      },
      {
        id: 'game-10-plays',
        title: 'Game Legend',
        detail: 'Play 10 games.',
        unlocked: userGames.length >= 10,
        icon: '👑'
      },
      {
        id: 'memory-master',
        title: 'Memory Master',
        detail: 'Play Memory Card Game.',
        unlocked: (gamesByType['memory'] || []).length >= 1,
        icon: '🧠'
      },
      {
        id: 'guess-expert',
        title: 'Guess Expert',
        detail: 'Play Guess the Guy game.',
        unlocked: (gamesByType['guess'] || []).length >= 1,
        icon: '🤔'
      },
      {
        id: 'monument-traveler',
        title: 'Monument Traveler',
        detail: 'Play Monument game.',
        unlocked: (gamesByType['monument'] || []).length >= 1,
        icon: '🗼'
      },
      {
        id: 'math-solver',
        title: 'Math Solver',
        detail: 'Play Math game.',
        unlocked: (gamesByType['math'] || []).length >= 1,
        icon: '🔢'
      },
      {
        id: 'game-2048-player',
        title: '2048 Player',
        detail: 'Play 2048 game.',
        unlocked: (gamesByType['2048'] || []).length >= 1,
        icon: '🎲'
      },
      {
        id: 'game-6-player',
        title: 'Game 6 Explorer',
        detail: 'Play Game 6.',
        unlocked: (gamesByType['game6'] || []).length >= 1,
        icon: '🚀'
      },
      {
        id: 'game-high-scorer',
        title: 'High Scorer',
        detail: 'Score 100 or more in any game.',
        unlocked: bestGameScore >= 100,
        icon: '🏆'
      }
    ];
  }, [myScores, games, user]);
  
  return (
    <div className="dashboard-root">
      <div className="dashboard-shell">
        <header className="dashboard-hero">
          <div className="hero-content">
            <p className="hero-kicker">Your learning space</p>
            <h1>{user ? `Welcome back, ${user.name}` : 'Welcome back'}</h1>
            <div className="hero-buttons">
              <Link to={link}>
                <button className='ViewLeaderBoard'>View Leaderboard</button>
              </Link>
              <Link to="/leaderboard/games">
                <button className='ViewGamesLeaderboard'>🎮 Games</button>
              </Link>
              <Link to="/quiz-history">
                <button className='ViewQuizHistory'>📚 Quiz History</button>
              </Link>
              <Link to="/achievements">
                <button className='ViewAchievements'>View Achievements</button>
              </Link>
            </div>
            {user?.role === 'teacher' && (
              <Link to={teacher}>
                <button className='ViewTeacherDashboard'>View Teacher Dashboard</button>
              </Link>
            )}
            <p className="hero-subtitle">Track your progress, celebrate wins, and jump back in.</p>
          </div>
          <div className="hero-avatar-section">
            {user && (
              <div className="hero-avatar">
                <div className="avatar-emoji">{user.avatar || '🦁'}</div>
                <span className="avatar-name">{user.name}</span>
              </div>
            )}
            <div className="hero-chip">
              {user ? user.email : 'Guest mode'}
            </div>
          </div>
        </header>

        {!user && (
          <div className="dashboard-alert">
            Please log in to see your personal progress and quiz history.
          </div>
        )}

        {myScores.length > 0 && (
          <section className="last-attempt-section">
            <div className="last-attempt-card">
              <h2>⏱️ Last Attempt</h2>
              {(() => {
                const lastScore = myScores[0];
                const quizName = lastScore.quizTitle || lastScore.quiz || 'Quiz';
                const scoreValue = lastScore.correctAnswers || lastScore.score || 0;
                const totalValue = lastScore.totalQuestions || lastScore.total || 1;
                const percentage = Math.round((scoreValue / totalValue) * 100);
                const dateValue = lastScore.timestamp || lastScore.date;
                const displayDate = dateValue ? new Date(dateValue).toLocaleDateString() : 'N/A';
                const displayTime = dateValue ? new Date(dateValue).toLocaleTimeString() : '';

                return (
                  <div className="last-attempt-content">
                    <div className="attempt-header">
                      <h3>{quizName}</h3>
                      <span className="attempt-date">{displayDate} {displayTime}</span>
                    </div>

                    <div className="attempt-score-display">
                      <div className={`score-percentage ${percentage >= 70 ? 'passed' : percentage >= 50 ? 'partial' : 'failed'}`}>
                        <span className="percentage-number">{percentage}%</span>
                      </div>
                      <div className="score-breakdown">
                        <div className="breakdown-item">
                          <span className="breakdown-label">Correct Answers:</span>
                          <span className="breakdown-value">{scoreValue}/{totalValue}</span>
                        </div>
                        <div className="breakdown-item">
                          <span className="breakdown-label">Status:</span>
                          <span className={`breakdown-status ${percentage >= 70 ? 'passed' : percentage >= 50 ? 'partial' : 'failed'}`}>
                            {percentage >= 70 ? '✅ Passed' : percentage >= 50 ? '⚠️ Partial' : '❌ Need Review'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Link to="/play/quiz-select" className="attempt-action-link">
                      <button className="attempt-retry-btn">📝 Try Another Quiz</button>
                    </Link>
                  </div>
                );
              })()}
            </div>
          </section>
        )}

        <section className="dashboard-grid">
          <div className="dash-card dash-stats">
            <h2>Learning stats</h2>
            <div className="stat-grid">
              <div>
                <span className="dash-stat-label">Quizzes taken</span>
                <span className="stat-value">{myScores.length}</span>
              </div>
              <div>
                <span className="dash-stat-label">Games played</span>
                <span className="stat-value">{games.filter(g => g.email === user?.email).length}</span>
              </div>
              <div>
                <span className="dash-stat-label">Daily goal</span>
                <span className="stat-value">{dailyProgress.minutes}/{settings.dailyGoal} min</span>
              </div>
              <div>
                <span className="dash-stat-label">Best score</span>
                <span className="stat-value">{myScores.length > 0 ? Math.max(...myScores.map(s => Math.round((Number(s.correctAnswers || s.score || 0) / (Number(s.totalQuestions || s.total || 1))) * 100))) : 0}%</span>
              </div>
            </div>
            
            {/* UPDATED RPG PROGRESS BARS */}
            <div className="rpg-progress-container">
              <div className="rpg-progress-row">
                <span className="rpg-progress-label">TOTAL EXP</span>
                <div className="rpg-progress-track">
                  <div className="rpg-progress-fill exp-fill" style={{ width: `${totals.completionRate}%` }}></div>
                </div>
                <span className="rpg-progress-pct">{totals.completionRate}%</span>
              </div>

              <div className="rpg-progress-row">
                <span className="rpg-progress-label">DAILY QST</span>
                <div className="rpg-progress-track">
                  <div className="rpg-progress-fill daily-fill" style={{ width: `${Math.min(100, Math.round((dailyProgress.minutes / settings.dailyGoal) * 100))}%` }}></div>
                </div>
                <span className="rpg-progress-pct">{Math.min(100, Math.round((dailyProgress.minutes / settings.dailyGoal) * 100))}%</span>
              </div>
            </div>

          </div>

          <div className="dash-card achievements">
            <h2>Achievements</h2>
            <div className="achievement-list">
              {achievements.map((badge) => (
                <div
                  key={badge.id}
                  className={`achievement-item ${badge.unlocked ? 'unlocked' : ''}`}
                >
                  <div className="achievement-icon">{badge.icon}</div>
                  <div>
                    <span className="achievement-title">{badge.title}</span>
                    <span className="achievement-detail">{badge.detail}</span>
                  </div>
                  <span className="achievement-tag">{badge.unlocked ? 'Unlocked' : 'Locked'}</span>
                </div>
              ))}
            </div>
          </div>



          <div className="dash-card scores">
            <h2>Recent quizzes</h2>
            {myScores.length === 0 ? (
              <p className="empty-state">No quiz scores yet. Try your first quiz!</p>
            ) : (
              <div className="scores-list">
                {myScores.slice(0, 5).map((score, index) => {
                  const quizName = score.quizTitle || score.quiz || 'Quiz';
                  const dateValue = score.timestamp || score.date;
                  const displayDate = dateValue ? new Date(dateValue).toLocaleDateString() : 'N/A';
                  const scoreValue = score.correctAnswers || score.score || 0;
                  const totalValue = score.totalQuestions || score.total || 0;
                  
                  return (
                    <div key={score._id || score.id || index} className="score-item">
                      <div>
                        <span className="score-title">{quizName}</span>
                        <span className="score-meta">{displayDate}</span>
                      </div>
                      <span className="score-value">{scoreValue}/{totalValue}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;