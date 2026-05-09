import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import quizAttempts from "../../../api/quizAttempts";
import "./QuizHistory.css";

function QuizHistory() {
  const [attempts, setAttempts] = useState([]);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    loadAttempts();
  }, []);

  const loadAttempts = async () => {
    try {
      setLoading(true);
      console.log('📚 [QuizHistory] Fetching quiz attempts...');
      const data = await quizAttempts.getQuizAttempts(20, 0);
      console.log('📚 [QuizHistory] Attempts loaded:', data);
      setAttempts(data || []);
    } catch (error) {
      console.error("❌ [QuizHistory] Error loading attempts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (attempt) => {
    try {
      const fullAttempt = await quizAttempts.getQuizAttemptDetails(attempt._id || attempt.id);
      setSelectedAttempt(fullAttempt);
    } catch (error) {
      console.error("Error fetching attempt details:", error);
    }
  };

  const toggleQuestion = (index) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="quiz-history-page">
        <div className="retro-panel">
          <div className="loading-text">📚 LOADING QUIZ HISTORY...</div>
        </div>
      </div>
    );
  }

  if (selectedAttempt) {
    return (
      <div className="quiz-history-page">
        <motion.div
          className="retro-panel attempt-detail-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="attempt-header">
            <button
              className="back-btn"
              onClick={() => setSelectedAttempt(null)}
            >
              ← BACK
            </button>
            <h2 className="attempt-title">{selectedAttempt.quizTitle}</h2>
          </div>

          <div className="attempt-stats">
            <div className="stat-box">
              <div className="stat-label">SCORE</div>
              <div className="stat-value">{selectedAttempt.score}/{selectedAttempt.totalQuestions}</div>
            </div>
            <div className="stat-box">
              <div className="stat-label">PERCENTAGE</div>
              <div className={`stat-value ${selectedAttempt.percentage >= 70 ? 'good' : 'bad'}`}>
                {selectedAttempt.percentage}%
              </div>
            </div>
            <div className="stat-box">
              <div className="stat-label">DATE</div>
              <div className="stat-value">{formatDate(selectedAttempt.attemptedAt)}</div>
            </div>
          </div>

          <div className="questions-review">
            {selectedAttempt.questions && selectedAttempt.questions.length > 0 ? (
              selectedAttempt.questions.map((q, idx) => (
                <motion.div
                  key={idx}
                  className={`question-review ${q.isCorrect ? 'correct' : 'incorrect'}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <div
                    className="question-header"
                    onClick={() => toggleQuestion(idx)}
                  >
                    <span className="q-number">Q{idx + 1}</span>
                    <span className={`q-indicator ${q.isCorrect ? 'correct' : 'incorrect'}`}>
                      {q.isCorrect ? '✓' : '✗'}
                    </span>
                    <span className="q-text">{q.question}</span>
                    <span className="expand-icon">
                      {expandedQuestions[idx] ? '▼' : '▶'}
                    </span>
                  </div>

                  {expandedQuestions[idx] && (
                    <motion.div
                      className="question-details"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <div className="options-list">
                        {q.options && q.options.length > 0 ? (
                          q.options.map((option, optIdx) => (
                            <div
                              key={optIdx}
                              className={`option ${
                                option === q.correctAnswer ? 'correct-option' :
                                option === q.userAnswer && option !== q.correctAnswer ? 'wrong-option' :
                                ''
                              }`}
                            >
                              <span className="option-letter">
                                {String.fromCharCode(65 + optIdx)})
                              </span>
                              <span className="option-text">{option}</span>
                              {option === q.correctAnswer && (
                                <span className="option-badge correct">✓ CORRECT</span>
                              )}
                              {option === q.userAnswer && option !== q.correctAnswer && (
                                <span className="option-badge wrong">✗ YOUR ANSWER</span>
                              )}
                            </div>
                          ))
                        ) : (
                          <div className="options-text">
                            <p><strong>Your Answer:</strong> {q.userAnswer}</p>
                            <p><strong>Correct Answer:</strong> {q.correctAnswer}</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))
            ) : (
              <p className="no-questions">No questions data available</p>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="quiz-history-page">
      <motion.div
        className="retro-panel quiz-history-panel"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="history-title">📚 QUIZ HISTORY</h1>
        <p className="history-subtitle">Review your past attempts and mistakes</p>

        {attempts.length === 0 ? (
          <div className="empty-state">
            <p>No quiz attempts yet. Start taking quizzes to build your history!</p>
          </div>
        ) : (
          <div className="attempts-grid">
            {attempts.map((attempt, idx) => (
              <motion.div
                key={attempt._id || attempt.id || idx}
                className="attempt-card"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => handleViewDetails(attempt)}
              >
                <div className="card-header">
                  <span className="card-date">{formatDate(attempt.attemptedAt)}</span>
                  <span className={`card-score ${attempt.percentage >= 70 ? 'good' : 'average'}`}>
                    {attempt.percentage}%
                  </span>
                </div>
                <h3 className="card-title">{attempt.quizTitle}</h3>
                <div className="card-stats">
                  <span>Score: {attempt.score}/{attempt.totalQuestions}</span>
                  <span>{attempt.category}</span>
                </div>
                <button className="view-btn">VIEW DETAILS →</button>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default QuizHistory;
