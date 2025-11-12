import React, { useState, useEffect } from "react";
import "./QuizPage.css";
import { fetchQuiz, fetchCategories } from "../../api/quizApi";

// 🌀 Simple loading component
const LoadingPage = ({ text = "Loading Quiz..." }) => {
  return (
    <div className="loading-screen pixelify-sans-font">
      <div className="loader-text">{text}</div>
      <div className="loading-bar">
        <div className="progress"></div>
      </div>
    </div>
  );
};

function QuizPage() {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [error, setError] = useState(null);

  const [amount, setAmount] = useState(5);
  const [difficulty, setDifficulty] = useState("easy");
  const [categoryId, setCategoryId] = useState(null);

  useEffect(() => {
    // Load categories once
    let mounted = true;
    fetchCategories().then((cats) => {
      if (!mounted) return;
      setCategories(cats);
    });
    return () => (mounted = false);
  }, []);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    setShowScore(false);
    setCurrentQuestion(0);
    setScore(0);
    try {
      const qs = await fetchQuiz({ amount, category: categoryId, difficulty });
      setQuestions(qs);
    } catch (e) {
      setError("Failed to load questions. Using local questions.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnswer = (option) => {
    if (!questions[currentQuestion]) return;
    if (option === questions[currentQuestion].correct_answer) {
      setScore((s) => s + 1);
    }
    const next = currentQuestion + 1;
    if (next < questions.length) {
      setCurrentQuestion(next);
    } else {
      setShowScore(true);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setScore(0);
    setShowScore(false);
  };

  return (
    <div className="quiz-page">
      <div className="quiz-box pixelify-sans-font">
        <div className="quiz-controls">
          <label>
            Amount:
            <input
              type="number"
              min={1}
              max={20}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </label>

          <label>
            Difficulty:
            <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>

          <label>
            Category:
            <select value={categoryId || ""} onChange={(e) => setCategoryId(e.target.value || null)}>
              <option value="">Any</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

          <button onClick={startQuiz} className="start-btn">
            Start Quiz
          </button>
        </div>

        {loading ? (
          <LoadingPage />
        ) : error ? (
          <div className="error">{error}</div>
        ) : questions.length === 0 ? (
          <div className="welcome">
            <h2>Welcome to Quizy!</h2>
            <p>Choose options above and press Start Quiz to fetch kid-friendly questions.</p>
          </div>
        ) : !showScore ? (
          <>
            <h2 className="question">{questions[currentQuestion].question}</h2>
            <div className="options">
              {questions[currentQuestion].options.map((option, index) => (
                <button key={index} className="option-btn" onClick={() => handleAnswer(option)}>
                  {option}
                </button>
              ))}
            </div>
            <p className="progress">
              Question {currentQuestion + 1} of {questions.length}
            </p>
          </>
        ) : (
          <div className="score-section">
            <h2>
              Your Score: {score}/{questions.length}
            </h2>
            <button className="restart-btn" onClick={handleRestart}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuizPage;
