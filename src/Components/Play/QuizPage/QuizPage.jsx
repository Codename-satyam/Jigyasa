import React, { useState, useEffect } from "react";
import "./QuizPage.css";
import { fetchQuiz, fetchCategories } from "../../../api/quizApi";
import auth from "../../../api/auth";
import { addScore } from "../../../api/scores";
import QuizBackground3D from "./QuizBackground3D";
import { useSearchParams } from "react-router-dom";

const LoadingPage = ({ text = "LOADING QUEST DATA..." }) => {
  return (
    <div className="retro-loading-screen text-center">
      <div className="loader-text blink-slow gold-text">{text}</div>
      <div className="pixel-loading-bar">
        <div className="pixel-progress"></div>
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
    const quizTitle = `Category: ${categoryName} | Difficulty: ${difficulty} | Amount: ${amount}`;
    try {
      addScore({
        name: user?.name || 'Guest',
        email: user?.email || '',
        quizTitle: quizTitle,
        quiz: quizTitle,
        score: score,
        total: questions.length,
        totalQuestions: questions.length,
        correctAnswers: score,
        percentage: Math.round((score / questions.length) * 100),
        timeSpent: 0,
        date: new Date().toISOString(),
      });
      setSaved(true);
    } catch (e) {
      console.error('Failed to save score:', e);
    }
  }, [showScore, saved, categories, categoryId, difficulty, amount, score, questions.length]);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    setShowScore(false);
    setCurrentQuestion(0);
    setScore(0);
    setSaved(false);
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
    startQuiz();
  };

  // Calculate progress for the HUD
  const progressPercent = questions.length > 0 
    ? Math.round((currentQuestion / questions.length) * 100) 
    : 0;

  return (
    <div className="quiz-page-wrapper">
      
      {/* Render 3D background behind the UI */}
      <div className="bg-3d-layer">
        <QuizBackground3D />
      </div>
      
      <div className="quiz-container">
        <div className="retro-panel arcade-monitor">
          
          {/* TOP HUD / CONTROLS */}
          <div className="mission-config-bar">
            <div className="config-group">
              <label className="blue-text">STAGES:</label>
              <input 
                type="number" 
                min={1} 
                max={20} 
                value={amount} 
                onChange={(e) => setAmount(Number(e.target.value))}
                className="pixel-input-small"
              />
            </div>

            <div className="config-group">
              <label className="blue-text">THREAT:</label>
              <select 
                value={difficulty} 
                onChange={(e) => setDifficulty(e.target.value)}
                className="pixel-select-small"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="config-group">
              <label className="blue-text">SECTOR:</label>
              <select 
                value={categoryId || ""} 
                onChange={(e) => setCategoryId(e.target.value || null)} 
                className="pixel-select-small"
              >
                <option value="">Any</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={startQuiz} className="pixel-btn-small btn-green pulse-btn">
              [ INITIALIZE ]
            </button>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="quiz-content-area mt-4">
            {loading ? (
              <LoadingPage />
            ) : error ? (
              <div className="rpg-dialogue-box error-box text-center">
                <h3 className="red-text blink">SYSTEM ERROR</h3>
                <p>{error}</p>
              </div>
            ) : questions.length === 0 ? (
              <div className="welcome-screen text-center">
                <h1 className="pixel-title gold-text mb-2">READY PLAYER 1</h1>
                <p className="pixel-subtitle">Configure your mission parameters above and press INITIALIZE to begin.</p>
              </div>
            ) : !showScore ? (
              <div className="active-quest-screen">
                
                <div className="hud-head">
                  <span className="blue-text">STAGE: {currentQuestion + 1}/{questions.length}</span>
                  <span className="green-text">EXP: {score}</span>
                </div>
                
                <div className="progress-wrap mb-4">
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${progressPercent}%`, backgroundColor: 'var(--retro-green)' }}></div>
                  </div>
                </div>

                <div className="rpg-dialogue-box question-box mb-4">
                  <h2 className="pixel-title-small text-center" dangerouslySetInnerHTML={{ __html: questions[currentQuestion].question }}></h2>
                </div>

                {/* UPGRADED RPG BATTLE MENU FOR OPTIONS */}
                <div className="rpg-options-menu">
                  {questions[currentQuestion].options.map((option, index) => (
                    <button 
                      key={index} 
                      className="rpg-option-box" 
                      onClick={() => handleAnswer(option)}
                    >
                      <span className="cursor-arrow">▶</span>
                      <span className="option-letter">{String.fromCharCode(65 + index)}.</span>
                      <span className="option-text" dangerouslySetInnerHTML={{ __html: option }} />
                    </button>
                  ))}
                </div>

              </div>
            ) : (
              <div className="score-screen text-center">
                <h2 className="pixel-title gold-text blink mb-2">QUEST CLEARED</h2>
                
                <div className="score-display-box mx-auto mt-4 mb-4">
                  <span className="blue-text">FINAL EXP SECURED</span>
                  <h1 className="huge-score green-text">{score} / {questions.length}</h1>
                  <span className="pixel-text-small mt-2">Accuracy: {Math.round((score / questions.length) * 100)}%</span>
                </div>

                <button className="pixel-btn btn-purple pulse-btn mx-auto" onClick={handleRestart}>
                  [ PLAY AGAIN ]
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default QuizPage;