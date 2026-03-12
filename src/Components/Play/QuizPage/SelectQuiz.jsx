import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SelectQuiz.css";
import { fetchCategories } from "../../../api/quizApi";
import auth from "../../../api/auth";
import QuizBackground3D from "./QuizBackground3D";

const LoadingPage = ({ text = "LOADING DATABASE..." }) => {
  return (
    <div className="retro-loading-screen">
      <div className="loader-text blink-slow">{text}</div>
      <div className="pixel-loading-bar">
        <div className="pixel-progress"></div>
      </div>
    </div>
  );
};

function SelectQuiz() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [amount, setAmount] = useState(5);
  const [amountInput, setAmountInput] = useState("5");
  const [difficulty, setDifficulty] = useState("easy");

  useEffect(() => {
    const currentUser = auth.getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
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
      alert("ERROR: Please select a target sector (Category) first.");
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
      <div className="select-quiz-page crt-screen">
        
        {/* Render 3D background behind the UI */}
        <div className="bg-3d-layer">
          <QuizBackground3D />
        </div>

        <div className="select-quiz-container">
          <div className="retro-panel mission-select-box">
            
            <div className="mission-header text-center">
              <h1 className="pixel-title gold-text">MISSION SELECT</h1>
              <p className="pixel-subtitle blue-text mt-2">Configure Your Quest Parameters</p>
            </div>
            
            {loading ? (
              <LoadingPage />
            ) : (
              <>
                <h2 className="pixel-title-small green-text mb-4 mt-4 text-center">
                  1. SELECT TARGET SECTOR
                </h2>
                
                <div className="categories-grid">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className={`category-card ${selectedCategory === category.id ? "selected-card" : ""}`}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <div className="category-icon">📂</div>
                      <h3 className="category-name">{category.name}</h3>
                      <p className="category-id blue-text">ID: {category.id}</p>
                    </div>
                  ))}
                </div>

                <div className="mission-settings-panel mt-4">
                  <h2 className="pixel-title-small purple-text mb-4">
                    2. MISSION SETTINGS
                  </h2>
                  
                  <div className="quiz-settings-grid">
                    <div className="pixel-form-group">
                      <label className="gold-text">Number of Stages (1-20):</label>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={amountInput}
                        className="pixel-input text-center"
                        onChange={(e) => {
                          setAmountInput(e.target.value);
                          if (e.target.value !== "") {
                            const num = Math.max(1, Math.min(20, Number(e.target.value)));
                            setAmount(num);
                          }
                        }}
                        onBlur={() => {
                          if (amountInput === "" || Number(amountInput) < 1) {
                            setAmountInput(String(amount));
                          }
                        }}
                      />
                    </div>

                    <div className="pixel-form-group">
                      <label className="gold-text">Threat Level:</label>
                      <select 
                        value={difficulty} 
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="pixel-select"
                      >
                        <option value="easy">Lvl 1: Easy</option>
                        <option value="medium">Lvl 2: Medium</option>
                        <option value="hard">Lvl 3: Hard</option>
                      </select>
                    </div>
                  </div>
                </div>

                {selectedCategory && (
                  <div className="rpg-dialogue-box mt-4 text-center">
                    <p>
                      TARGET LOCKED: <span className="green-text">
                        {categories.find((c) => c.id === selectedCategory)?.name}
                      </span>
                    </p>
                  </div>
                )}

                <div className="action-buttons mt-4">
                  <button
                    className="pixel-btn btn-green pulse-btn"
                    onClick={handleStartQuiz}
                    disabled={!selectedCategory}
                  >
                    [ LAUNCH QUEST ]
                  </button>
                  
                  <button
                    className="pixel-btn btn-purple"
                    onClick={handleContinueWithoutCategory}
                  >
                    [ RANDOM ENCOUNTER ]
                  </button>
                </div>
                
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SelectQuiz;