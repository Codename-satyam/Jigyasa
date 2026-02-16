import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SelectQuiz.css";
import { fetchCategories } from "../../../api/quizApi";
import auth from "../../../api/auth";
import QuizBackground3D from "./QuizBackground3D";


const LoadingPage = ({ text = "Loading Categories..." }) => {
  return (
    <div className="loading-screen pixelify-sans-font">
      <div className="loader-text">{text}</div>
      <div className="loading-bar">
        <div className="progress"></div>
      </div>
    </div>
  );
};

function SelectQuiz() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState(5);
  const [difficulty, setDifficulty] = useState("easy");

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchCategories().then((cats) => {
      if (!mounted) return;
      setCategories(cats);
      setLoading(false);
    });
    return () => (mounted = false);
  }, []);

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  const handleStartQuiz = () => {
    if (!selectedCategory && categories.length > 0) {
      alert("Please select a category");
      return;
    }
    
    // Navigate to quiz with selected parameters
    const params = new URLSearchParams({
      category: selectedCategory || "",
      amount: amount,
      difficulty: difficulty,
    });
    navigate(`/play/quiz?${params.toString()}`);
  };

  const handleContinueWithoutCategory = () => {
    const params = new URLSearchParams({
      amount: amount,
      difficulty: difficulty,
    });
    navigate(`/play/quiz?${params.toString()}`);
  };

  return (
    <>
      <div className="select-quiz-page">
        <QuizBackground3D />
        <div className="select-quiz-container">
          <div className="select-quiz-box pixelify-sans-font">
            <h1 className="select-title">Choose Your Subject</h1>
            
            {loading ? (
              <LoadingPage />
            ) : (
              <>
                <div className="categories-grid">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`category-card ${selectedCategory === category.id ? "selected" : ""}`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <div className="category-icon">📚</div>
                      <h3 className="category-name">{category.name}</h3>
                      <p className="category-id">ID: {category.id}</p>
                    </div>
                  ))}
                </div>

                <div className="quiz-settings">
                  <div className="settings-row">
                    <label>
                      Number of Questions:
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={amount}
                        onChange={(e) => setAmount(Number(e.target.value))}
                      />
                    </label>
                  </div>

                  <div className="settings-row">
                    <label>
                      Difficulty Level:
                      <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                      </select>
                    </label>
                  </div>
                </div>

                <div className="action-buttons">
                  <button
                    className="start-btn primary"
                    onClick={handleStartQuiz}
                    disabled={!selectedCategory}
                  >
                    Start Quiz
                  </button>
                  <button
                    className="start-btn secondary"
                    onClick={handleContinueWithoutCategory}
                  >
                    Random Quiz
                  </button>
                </div>

                {selectedCategory && (
                  <div className="selected-info">
                    <p>
                      Selected Category: <strong>
                        {categories.find((c) => c.id === selectedCategory)?.name}
                      </strong>
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SelectQuiz;
