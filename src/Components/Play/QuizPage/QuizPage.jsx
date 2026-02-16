import React, { useState, useEffect } from "react";
import "./QuizPage.css";
import { fetchQuiz, fetchCategories } from "../../../api/quizApi";
import auth from "../../../api/auth";
import { addScore } from "../../../api/scores";
import QuizBackground3D from "./QuizBackground3D";
import { useSearchParams} from "react-router-dom";


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
  const [searchParams] = useSearchParams();
  
  // Get parameters from URL query string
  const urlCategory = searchParams.get("category") || null;
  const urlAmount = searchParams.get("amount") ? Number(searchParams.get("amount")) : 5;
  const urlDifficulty = searchParams.get("difficulty") || "easy";
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);

  const [amount, setAmount] = useState(urlAmount);
  const [difficulty, setDifficulty] = useState(urlDifficulty);
  const [categoryId, setCategoryId] = useState(urlCategory);

  useEffect(() => {
    // Load categories once
    let mounted = true;
    fetchCategories().then((cats) => {
      if (!mounted) return;
      setCategories(cats);
    });
    return () => (mounted = false);
  }, []);

  // when quiz finishes, persist the score once
  useEffect(() => {
    if (!showScore || saved) return;
    const user = auth.getCurrentUser();
    const categoryObj = categories.find((c) => String(c.id) === String(categoryId));
    const categoryName = categoryObj ? categoryObj.name : (categoryId ? String(categoryId) : 'Any');
    try {
      addScore({
        name: user?.name || 'Guest',
        email: user?.email || '',
        quiz: `Category: ${categoryName} | Difficulty: ${difficulty} | Amount: ${amount}`,
        score: score,
        total: questions.length,
        date: new Date().toISOString(),
      });
      setSaved(true);
    } catch (e) {
      // ignore
    }
  }, [showScore, saved, categories, categoryId, difficulty, amount, score, questions.length]);

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
      <QuizBackground3D/>
      <div className="quiz-box pixelify-sans-font">
        <div className="quiz-controls">
          <label>
            Amount:
            <input type="number" min={1} max={20} value={amount} onChange={(e) => setAmount(Number(e.target.value))}
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
            <select value={categoryId || ""} onChange={(e) => setCategoryId(e.target.value || null)} className="category-select">
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
            <div className="quiz-options">
              {questions[currentQuestion].options.map((option, index) => (
                <button key={index} className="quiz-option-btn" onClick={() => handleAnswer(option)}>
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
