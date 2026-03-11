import { useCallback, useEffect, useState } from "react";
import quizData from "./data/data";
import "./g2.css";
import correctSound from "./data/sounds/correct.mp3";
import wrongSound from "./data/sounds/wrong.mp3";
import timeoutSound from "./data/sounds/timeout.mp3";
import gamesTracker from "../../../../api/gamesTracker";
import auth from "../../../../api/auth";

const CORRECT_SOUND = new Audio(correctSound);
const WRONG_SOUND = new Audio(wrongSound);
const TIMEOUT_SOUND = new Audio(timeoutSound);

const shuffleArray = (array) => {
  const shuffled =[...array];
  for(let i= shuffled.length -1;i>0;i--){
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getRandomQuestions = () => {
  return shuffleArray(quizData).slice(0, 10);
}


function QuizGame() {
  const [randomizedQuestions, setRandomizedQuestions] = useState(() => getRandomQuestions());
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [reveal, setReveal] = useState(false);

  const question = randomizedQuestions[current];
  const progressPercent = Math.round(((current + 1) / randomizedQuestions.length) * 100);

  const moveNext = useCallback((finalScore = score) => {
    if (current + 1 < randomizedQuestions.length) {
      setCurrent(prev => prev + 1);
      setSelected(null);
      setReveal(false);
      setTimeLeft(10);
      return;
    }

    setShowResult(true);

    const user = auth.getCurrentUser();
    if (user) {
      gamesTracker.recordGamePlay({
        email: user.email,
        gameType: 'guess',
        gameName: 'Guess the Guy',
        score: finalScore,
        date: new Date().toISOString()
      });
    }
  }, [current, randomizedQuestions.length, score]);

  useEffect(() => {
    if (timeLeft === 0 && !selected) {
      TIMEOUT_SOUND.play().catch(() => {});
      moveNext(score);
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
  }, [moveNext, score, selected, timeLeft]);

  const handleOptionClick = (option) => {
    if (selected) return;

    setSelected(option);
    setReveal(true);

    const isCorrect = option === question.answer;
    const nextScore = isCorrect ? score + 1 : score;

    if (isCorrect) {
      CORRECT_SOUND.play().catch(() => {});
      setScore(prev => prev + 1);
    } else {
      WRONG_SOUND.play().catch(() => {});
    }

    setTimeout(() => moveNext(nextScore), 1500);
  };

  const restartGame = () => {
    setRandomizedQuestions(getRandomQuestions());
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
          <h1 className="g2-final-score">{score} / {randomizedQuestions.length}</h1>
          <button className="g2-restart-btn" onClick={restartGame}>Play Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="g2-game-page">
      <div className="g2-container">
        <div className="g2-top">
          <span>Q {current + 1}/{randomizedQuestions.length}</span>
          <span className={`g2-timer ${timeLeft <= 3 ? "danger" : ""}`}>
            ⏱ {timeLeft}s
          </span>
        </div>

        <div className="g2-progress-wrap" aria-label="quiz progress">
          <div className="g2-progress-track">
            <div className="g2-progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span>{progressPercent}%</span>
        </div>

        <div className="g2-image-frame">
          <img
            src={question.image}
            alt="quiz"
            className={`g2-image ${reveal ? "reveal" : ""}`}
            loading="eager"
          />
        </div>

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
