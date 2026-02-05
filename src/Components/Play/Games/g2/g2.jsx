import { useEffect, useState } from "react";
import quizData from "./data/data";
import "./g2.css";
import correctSound from "./data/sounds/correct.mp3";
import wrongSound from "./data/sounds/wrong.mp3";
import timeoutSound from "./data/sounds/timeout.mp3";

const CORRECT_SOUND = new Audio(correctSound);
const WRONG_SOUND = new Audio(wrongSound);
const TIMEOUT_SOUND = new Audio(timeoutSound);

function QuizGame() {
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [reveal, setReveal] = useState(false);

  const question = quizData[current];

  useEffect(() => {
    if (timeLeft === 0 && !selected) {
      TIMEOUT_SOUND.play().catch(() => {});
      moveNext();
      return;
    }

    if (timeLeft <= 0 || selected) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, selected]);

  const handleOptionClick = (option) => {
    if (selected) return;

    setSelected(option);
    setReveal(true);

    if (option === question.answer) {
      CORRECT_SOUND.play().catch(() => {});
      setScore(prev => prev + 1);
    } else {
      WRONG_SOUND.play().catch(() => {});
    }

    setTimeout(moveNext, 1500);
  };

  const moveNext = () => {
    if (current + 1 < quizData.length) {
      setCurrent(prev => prev + 1);
      setSelected(null);
      setReveal(false);
      setTimeLeft(10);
    } else {
      setShowResult(true);
    }
  };

  const restartGame = () => {
    setCurrent(0);
    setScore(0);
    setSelected(null);
    setReveal(false);
    setShowResult(false);
    setTimeLeft(10);
  };

  if (showResult) {
    return (
      <div className="g2-game-page">
        <div className="g2-container g2-result-container">
          <h2>🎉 Quiz Completed!</h2>
          <p className="g2-result-label">Final Score</p>
          <h1 className="g2-final-score">{score} / {quizData.length}</h1>
          <button className="g2-restart-btn" onClick={restartGame}>Play Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="g2-game-page">
      <div className="g2-container">
        <div className="g2-top">
          <span>Q {current + 1}/{quizData.length}</span>
          <span className={`g2-timer ${timeLeft <= 3 ? "danger" : ""}`}>
            ⏱ {timeLeft}s
          </span>
        </div>

        <img
          src={question.image}
          alt="quiz"
          className={`g2-image ${reveal ? "reveal" : ""}`}
        />

        <h3 className="g2-question">{question.question}</h3>

        <div className="g2-options">
          {question.options.map(option => (
            <button
              key={option}
              className={`g2-option-btn
                ${selected &&
                  (option === question.answer
                    ? "correct"
                    : option === selected
                    ? "wrong"
                    : "")}`}
              onClick={() => handleOptionClick(option)}
              disabled={selected !== null}
            >
              {option}
            </button>
          ))}
        </div>

        <p className="g2-score">Score: {score}</p>
      </div>
    </div>
  );
}

export default QuizGame;
