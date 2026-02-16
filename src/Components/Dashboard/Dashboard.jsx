import React, { useEffect, useMemo, useState } from 'react';
import './Dashboard.css';
import scoresApi from '../../api/scores';
import auth from '../../api/auth';
import data from '../Play/Videos/data.js';
import { getSubjectProgress } from '../../api/progressTracker.js';
import { Link } from 'react-router-dom';

function Dashboard() {
  const [link, setLink] = useState('/leaderboard');
  const [scores, setScores] = useState([]);

  useEffect(() => {
    setScores(scoresApi.getScores());
  }, []);

  const current = auth.getCurrentUser();

  const myScores = useMemo(() => {
    if (!current) return [];
    return scores
      .filter((s) => s.email && s.email === current.email)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [scores, current]);

  const subjects = useMemo(() => Object.keys(data), []);
  const subjectSummaries = useMemo(() => {
    return subjects.map((subject) => {
      const topics = data[subject] || [];
      const progress = getSubjectProgress(subject, topics.length, topics);
      return { subject, ...progress };
    });
  }, [subjects]);

  const totals = useMemo(() => {
    const totalLessons = subjectSummaries.reduce((sum, item) => sum + item.total, 0);
    const completedLessons = subjectSummaries.reduce((sum, item) => sum + item.completed, 0);
    const completionRate = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    return { totalLessons, completedLessons, completionRate };
  }, [subjectSummaries]);

  const achievements = useMemo(() => {
    const bestScore = myScores.reduce((best, s) => {
      const total = Number(s.total) || 0;
      const score = Number(s.score) || 0;
      if (total <= 0) return best;
      return Math.max(best, Math.round((score / total) * 100));
    }, 0);

    return [
      {
        id: 'first-lesson',
        title: 'First Lesson',
        detail: 'Watch one video lesson.',
        unlocked: totals.completedLessons >= 1
      },
      {
        id: 'five-lessons',
        title: 'Mini Streak',
        detail: 'Finish 5 lessons.',
        unlocked: totals.completedLessons >= 5
      },
      {
        id: 'ten-lessons',
        title: 'Lesson Explorer',
        detail: 'Finish 10 lessons.',
        unlocked: totals.completedLessons >= 10
      },
      {
        id: 'quiz-starter',
        title: 'Quiz Starter',
        detail: 'Complete your first quiz.',
        unlocked: myScores.length >= 1
      },
      {
        id: 'quiz-ace',
        title: 'Quiz Ace',
        detail: 'Score 80% or more on a quiz.',
        unlocked: bestScore >= 80
      }
    ];
  }, [totals.completedLessons, myScores]);
  return (
    <div className="dashboard-root">
      <div className="dashboard-shell">
        <header className="dashboard-hero">
          <div>
            <p className="hero-kicker">Your learning space</p>
            <h1>{current ? `Welcome back, ${current.name}` : 'Welcome back'}</h1>
            <Link to={link}>
              <button className='ViewLeaderBoard'>View Leaderboard</button>
            </Link>
            <p className="hero-subtitle">Track your progress, celebrate wins, and jump back in.</p>
          </div>
          <div className="hero-chip">
            {current ? current.email : 'Guest mode'}
          </div>
        </header>

        {!current && (
          <div className="dashboard-alert">
            Please log in to see your personal progress and quiz history.
          </div>
        )}

        <section className="dashboard-grid">
          <div className="dash-card stats">
            <h2>Learning stats</h2>
            <div className="stat-grid">
              <div>
                <span className="stat-label">Lessons completed</span>
                <span className="stat-value">{totals.completedLessons}</span>
              </div>
              <div>
                <span className="stat-label">Total lessons</span>
                <span className="stat-value">{totals.totalLessons}</span>
              </div>
              <div>
                <span className="stat-label">Completion rate</span>
                <span className="stat-value">{totals.completionRate}%</span>
              </div>
              <div>
                <span className="stat-label">Quizzes taken</span>
                <span className="stat-value">{myScores.length}</span>
              </div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${totals.completionRate}%` }} />
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
                  <div>
                    <span className="achievement-title">{badge.title}</span>
                    <span className="achievement-detail">{badge.detail}</span>
                  </div>
                  <span className="achievement-tag">{badge.unlocked ? 'Unlocked' : 'Locked'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="dash-card progress">
            <h2>Subject progress</h2>
            <div className="subject-list">
              {subjectSummaries.map((item) => (
                <div key={item.subject} className="subject-row">
                  <div>
                    <span className="subject-name">{item.subject}</span>
                    <span className="subject-count">{item.completed}/{item.total} lessons</span>
                  </div>
                  <div className="subject-bar">
                    <div className="subject-fill" style={{ width: `${item.percentage}%` }} />
                  </div>
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
                {myScores.slice(0, 5).map((score) => (
                  <div key={score.id} className="score-item">
                    <div>
                      <span className="score-title">{score.quiz}</span>
                      <span className="score-meta">{new Date(score.date).toLocaleDateString()}</span>
                    </div>
                    <span className="score-value">{score.score}/{score.total}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
