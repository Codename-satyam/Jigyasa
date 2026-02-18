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
  const [allScores, setAllScores] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('scores');

  useEffect(() => {
    const user = auth.getCurrentUser();
    setCurrent(user);

    if (!user || user.role !== 'teacher') {
      navigate('/home');
    }
  }, [navigate]);

  useEffect(() => {
    setAllScores(scores.getScores());
    if (current) {
      setMyQuizzes(quizManager.getQuizzesByTeacher(current.id));
    }
  }, [current]);

  const summary = useMemo(() => {
    const studentSummary = scores.getAllStudentsScoresSummary();
    return {
      totalStudents: studentSummary.length,
      totalQuizzes: myQuizzes.length,
      publishedQuizzes: myQuizzes.filter((q) => q.isPublished).length,
      averageStudentScore: studentSummary.length > 0
        ? Math.round(studentSummary.reduce((sum, s) => sum + s.averageScore, 0) / studentSummary.length)
        : 0
    };
  }, [myQuizzes]);

  const studentScoresSummary = useMemo(() => {
    return scores.getAllStudentsScoresSummary();
  }, [allScores]);

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
        className="teacher-panel-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="teacher-panel-header-content">
          <div className="teacher-panel-user">
            <span className="teacher-panel-avatar">👨‍🏫</span>
            <div>
              <h1>Teacher Dashboard</h1>
              <p>Welcome, {current?.name}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="teacher-panel-logout">
            Logout
          </button>
        </div>
      </motion.div>

      <motion.div
        className="teacher-panel-stats"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div className="teacher-panel-stat-card" whileHover={{ scale: 1.05 }}>
          <div className="teacher-panel-stat-icon">👥</div>
          <div>
            <div className="teacher-panel-stat-value">{summary.totalStudents}</div>
            <div className="teacher-panel-stat-label">Total Students</div>
          </div>
        </motion.div>

        <motion.div className="teacher-panel-stat-card" whileHover={{ scale: 1.05 }}>
          <div className="teacher-panel-stat-icon">📝</div>
          <div>
            <div className="teacher-panel-stat-value">{summary.totalQuizzes}</div>
            <div className="teacher-panel-stat-label">Total Quizzes Created</div>
          </div>
        </motion.div>

        <motion.div className="teacher-panel-stat-card" whileHover={{ scale: 1.05 }}>
          <div className="teacher-panel-stat-icon">✅</div>
          <div>
            <div className="teacher-panel-stat-value">{summary.publishedQuizzes}</div>
            <div className="teacher-panel-stat-label">Published Quizzes</div>
          </div>
        </motion.div>

        <motion.div className="teacher-panel-stat-card" whileHover={{ scale: 1.05 }}>
          <div className="teacher-panel-stat-icon">📊</div>
          <div>
            <div className="teacher-panel-stat-value">{summary.averageStudentScore}%</div>
            <div className="teacher-panel-stat-label">Avg Student Score</div>
          </div>
        </motion.div>
      </motion.div>

      <div className="teacher-panel-tabs">
        <button
          className={`teacher-panel-tab ${activeTab === 'scores' ? 'active' : ''}`}
          onClick={() => setActiveTab('scores')}
        >
          📊 Student Scores
        </button>

        <button
          className={`teacher-panel-tab ${activeTab === 'quizzes' ? 'active' : ''}`}
          onClick={() => setActiveTab('quizzes')}
        >
          📋 My Quizzes
        </button>

        <button
          className={`teacher-panel-tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Create Quiz
        </button>
      </div>

      <motion.div
        className="teacher-panel-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >

        {activeTab === 'scores' && (
          <div className="teacher-panel-scores">
            <h2>Student Performance Overview</h2>

            {studentScoresSummary.length === 0 ? (
              <p>No student data yet</p>
            ) : (
              <div className="teacher-panel-table-wrapper">
                <table className="teacher-panel-table">
                  <thead>
                    <tr>
                      <th>Student Name</th>
                      <th>Email</th>
                      <th>Quizzes Taken</th>
                      <th>Average Score</th>
                      <th>Highest Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentScoresSummary.map((student) => (
                      <tr key={student.email}>
                        <td>{student.name}</td>
                        <td>{student.email}</td>
                        <td>{student.totalQuizzes}</td>
                        <td>{student.averageScore}%</td>
                        <td>{student.highestScore}%</td>
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
            <h2>Your Created Quizzes</h2>

            {myQuizzes.length === 0 ? (
              <p>You haven't created any quizzes yet</p>
            ) : (
              <div className="teacher-panel-quiz-grid">
                {myQuizzes.map((quiz) => (
                  <div key={quiz.id} className="teacher-panel-quiz-card">
                    <h3>{quiz.title}</h3>
                    <p>{quiz.description}</p>
                    <div>
                      <span>{quiz.questions?.length || 0} Questions</span>
                      <span> {quiz.difficulty}</span>
                    </div>
                    <div>
                      <Link to={`/edit-quiz/${quiz.id}`}>Edit</Link>
                      <Link to={`/quiz-responses/${quiz.id}`}>Responses</Link>
                      <button onClick={() => quizManager.deleteQuiz(quiz.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="teacher-panel-create">
            <h2>Create New Quiz</h2>
            <button
              onClick={handleCreateQuiz}
              className="teacher-panel-create-btn"
            >
              ➕ Start Creating Quiz
            </button>
          </div>
        )}

      </motion.div>
    </div>
  );
}

export default TeacherDashboard;
