import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import auth from '../../../api/auth';
import { addScore } from '../../../api/scores';
import teacherQuizzes from '../../../api/teacherQuizzes';
import './QuizPage.css';

function TeacherQuizAttempt() {
  const navigate = useNavigate();
  const { quizId } = useParams();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }

    const loadQuiz = async () => {
      try {
        const quizData = await teacherQuizzes.getTeacherQuizById(quizId);

        const isPublished = Boolean(quizData.isPublished || quizData.ispublished);
        if (!isPublished && currentUser.role !== 'teacher' && currentUser.role !== 'admin') {
          setError('This teacher quiz is not published yet.');
          setLoading(false);
          return;
        }

        if (!Array.isArray(quizData.questions) || quizData.questions.length === 0) {
          setError('This quiz has no questions yet.');
          setLoading(false);
          return;
        }

        setQuiz(quizData);
      } catch (loadErr) {
        setError('Unable to load teacher quiz.');
      } finally {
        setLoading(false);
      }
    };

    loadQuiz();
  }, [navigate, quizId]);

  const progressPercent = useMemo(() => {
    if (!quiz?.questions?.length) return 0;
    return Math.round((currentQuestion / quiz.questions.length) * 100);
  }, [quiz, currentQuestion]);

  const handleAnswer = (selectedOption) => {
    if (!quiz || !quiz.questions[currentQuestion]) return;

    const current = quiz.questions[currentQuestion];
    if (selectedOption === current.correct) {
      setScore((value) => value + 1);
    }

    const next = currentQuestion + 1;
    if (next < quiz.questions.length) {
      setCurrentQuestion(next);
      return;
    }

    setShowScore(true);
  };

  useEffect(() => {
    if (!showScore || saved || !quiz) return;

    const currentUser = auth.getCurrentUser();
    const totalQuestions = quiz.questions.length;
    const percentage = Math.round((score / totalQuestions) * 100);

    addScore({
      quizId: quiz.id,
      quizTitle: quiz.title,
      quiz: quiz.title,
      score,
      totalQuestions,
      total: totalQuestions,
      correctAnswers: score,
      percentage,
      timeSpent: 0,
      name: currentUser?.name,
      email: currentUser?.email,
      date: new Date().toISOString(),
    })
      .then(() => setSaved(true))
      .catch(() => setSaved(true));
  }, [showScore, saved, quiz, score]);

  if (loading) {
    return (
      <div className="quiz-page-wrapper">
        <div className="quiz-container">
          <div className="retro-panel arcade-monitor text-center">
            <h2 className="pixel-title gold-text">LOADING TEACHER QUEST...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="quiz-page-wrapper">
        <div className="quiz-container">
          <div className="retro-panel arcade-monitor text-center">
            <h2 className="pixel-title red-text">MISSION ERROR</h2>
            <p>{error || 'Quiz not found.'}</p>
            <button className="pixel-btn btn-purple mt-4 mx-auto" onClick={() => navigate('/play/quiz-select')}>
              [ BACK TO QUIZ SELECT ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-page-wrapper">
      <div className="quiz-container">
        <div className="retro-panel arcade-monitor">
          <div className="quiz-content-area mt-4">
            {!showScore ? (
              <div className="active-quest-screen">
                <div className="hud-head">
                  <span className="blue-text">STAGE: {currentQuestion + 1}/{quiz.questions.length}</span>
                  <span className="green-text">EXP: {score}</span>
                </div>

                <div className="rpg-dialogue-box question-box mb-4">
                  <h2 className="pixel-title-small text-center">{quiz.questions[currentQuestion].question}</h2>
                </div>

                <div className="progress-wrap mb-4">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: 'var(--retro-green)' }}></div>
                  </div>
                </div>

                <div className="rpg-options-menu">
                  {quiz.questions[currentQuestion].options.map((option, index) => (
                    <button
                      key={`${quiz.questions[currentQuestion].id || currentQuestion}-${index}`}
                      className="rpg-option-box"
                      onClick={() => handleAnswer(option)}
                    >
                      <span className="cursor-arrow">▶</span>
                      <span className="option-letter">{String.fromCharCode(65 + index)}.</span>
                      <span className="option-text">{option}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="score-screen text-center">
                <h2 className="pixel-title gold-text blink mb-2">QUEST CLEARED</h2>
                <div className="score-display-box mx-auto mt-4 mb-4">
                  <span className="blue-text">FINAL EXP SECURED</span>
                  <h1 className="huge-score green-text">{score} / {quiz.questions.length}</h1>
                  <span className="pixel-text-small mt-2">Accuracy: {Math.round((score / quiz.questions.length) * 100)}%</span>
                </div>
                 <button className="pixel-btn btn-purple mx-auto" onClick={() => navigate('/play/quiz-select')}>
                   RETURN TO QUIZ SELECT 
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TeacherQuizAttempt;
