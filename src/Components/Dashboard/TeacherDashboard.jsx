import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import auth from '../../api/auth';
import scores from '../../api/scores';
import quizManager from '../../api/quizManager';
import './TeacherDashboard.css';

function TeacherDashboard() {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(null);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('scores');
  const [studentScoresSummary, setStudentScoresSummary] = useState([]);

  useEffect(() => {
    const user = auth.getCurrentUser();
    setCurrent(user);

    if (!user || user.role !== 'teacher') {
      navigate('/home');
    }
  }, [navigate]);

  useEffect(() => {
    const loadData = async () => {
      const summaryData = await scores.getAllStudentsScoresSummary();
      setStudentScoresSummary(summaryData || []);

      if (current) {
        setMyQuizzes(quizManager.getQuizzesByTeacher(current.id));
      }
    };
    if (current) {
      loadData();
    }
  }, [current]);

  const summary = useMemo(() => {
    return {
      totalStudents: studentScoresSummary.length,
      totalQuizzes: myQuizzes.length,
      publishedQuizzes: myQuizzes.filter((q) => q.isPublished).length,
      averageStudentScore: studentScoresSummary.length > 0
        ? Math.round(studentScoresSummary.reduce((sum, s) => sum + s.averageScore, 0) / studentScoresSummary.length)
        : 0
    };
  }, [myQuizzes, studentScoresSummary]);

  const handleCreateQuiz = () => {
    navigate('/create-quiz');
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  return (
    <div className="teacher-panel-root">

      <motion.div
        className="retro-panel guild-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="teacher-panel-header-content">
          <div className="teacher-panel-user">
            <span className="teacher-panel-avatar">🧙‍♂️</span>
            <div>
              <h1 className="pixel-title gold-text">Guild Master HQ</h1>
              <p className="pixel-subtitle">Welcome back, Master {current?.name || 'Unknown'}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="pixel-btn btn-red">
            [ ESC ] Logout
          </button>
        </div>
      </motion.div>

      <motion.div
        className="teacher-panel-stats stats-grid"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div className="pixel-card stat-card" whileHover={{ scale: 1.05 }}>
          <div className="teacher-panel-stat-icon blue-text">👾</div>
          <div>
            <div className="stat-number">{summary.totalStudents}</div>
            <div className="pixel-text-small">Active Apprentices</div>
          </div>
        </motion.div>

        <motion.div className="pixel-card stat-card" whileHover={{ scale: 1.05 }}>
          <div className="teacher-panel-stat-icon purple-text">📜</div>
          <div>
            <div className="stat-number">{summary.totalQuizzes}</div>
            <div className="pixel-text-small">Scrolls Forged</div>
          </div>
        </motion.div>

        <motion.div className="pixel-card stat-card" whileHover={{ scale: 1.05 }}>
          <div className="teacher-panel-stat-icon green-text">✨</div>
          <div>
            <div className="stat-number">{summary.publishedQuizzes}</div>
            <div className="pixel-text-small">Active Quests</div>
          </div>
        </motion.div>

        <motion.div className="pixel-card stat-card" whileHover={{ scale: 1.05 }}>
          <div className="teacher-panel-stat-icon gold-text">📈</div>
          <div>
            <div className="stat-number">{summary.averageStudentScore}%</div>
            <div className="pixel-text-small">Avg Realm EXP</div>
          </div>
        </motion.div>
      </motion.div>

      <div className="teacher-panel-tabs mt-4">
        <button
          className={`pixel-nav-btn ${activeTab === 'scores' ? 'active btn-blue' : 'btn-dark'}`}
          onClick={() => setActiveTab('scores')}
        >
          📊 Apprentice Stats
        </button>

        <button
          className={`pixel-nav-btn ${activeTab === 'quizzes' ? 'active btn-green' : 'btn-dark'}`}
          onClick={() => setActiveTab('quizzes')}
        >
          📋 My Quests
        </button>

        <button
          className={`pixel-nav-btn ${activeTab === 'create' ? 'active btn-purple' : 'btn-dark'}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Forge Quest
        </button>
      </div>

      <motion.div
        className="teacher-panel-content mt-2 retro-panel"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >

        {activeTab === 'scores' && (
          <div className="teacher-panel-scores">
            <h2 className="pixel-title-small">Apprentice Performance Log</h2>

            {studentScoresSummary.length === 0 ? (
              <p className="pixel-text blink">Awaiting apprentice data...</p>
            ) : (
              <div className="pixel-table-wrapper">
                <table className="pixel-table">
                  <thead>
                    <tr>
                      <th>Apprentice Name</th>
                      <th>Comms Link</th>
                      <th>Quests Cleared</th>
                      <th>Avg EXP</th>
                      <th>Max EXP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentScoresSummary.map((student) => (
                      <tr key={student.email}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.totalQuizzes}</td>
                        <td className="gold-text">{student.averageScore}%</td>
                        <td className="green-text">{student.highestScore}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="teacher-panel-quizzes">
            <h2 className="pixel-title-small">Your Active Quest Board</h2>

            {myQuizzes.length === 0 ? (
              <p className="pixel-text blink">No quests forged yet. The realm is peaceful.</p>
            ) : (
              <div className="quizzes-grid">
                {myQuizzes.map((quiz) => (
                  <div key={quiz.id} className="pixel-card quest-card">
                    <h3>{quiz.title}</h3>
                    <p className="pixel-text-small mb-2">{quiz.description}</p>
                    <div className="quiz-meta mb-2">
                      <span className="badge-blue">Stages: {quiz.questions?.length || 0}</span>
                      <span className={`badge-${quiz.difficulty === 'Hard' ? 'red' : 'green'}`}>
                        Lvl: {quiz.difficulty || 'Normal'}
                      </span>
                    </div>
                    <div className="quiz-actions action-buttons">
                      <Link to={`/edit-quiz/${quiz.id}`} className="pixel-btn-small btn-blue">Edit</Link>
                      <Link to={`/quiz-responses/${quiz.id}`} className="pixel-btn-small btn-purple">Logs</Link>
                      <button 
                        onClick={() => quizManager.deleteQuiz(quiz.id)} 
                        className="pixel-btn-small btn-red"
                      >
                        Destroy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="teacher-panel-create text-center p-4">
            <h2 className="pixel-title-small mb-2">Forge a New Trial</h2>
            <p className="pixel-subtitle mb-4">Design a new challenge for your apprentices to conquer.</p>
            <button
              onClick={handleCreateQuiz}
              className="pixel-btn btn-massive bounce-hover"
            >
              <span className="btn-icon">🔨</span>
              <br/>
              ENTER FORGE
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}

export default TeacherDashboard;