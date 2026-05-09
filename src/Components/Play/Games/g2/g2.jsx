import { useCallback, useEffect, useRef, useState } from "react";
import quizData from "./data/data";
import "./g2.css";
import correctSound from "./data/sounds/correct.mp3";
import wrongSound from "./data/sounds/wrong.mp3";
import timeoutSound from "./data/sounds/timeout.mp3";
import gamesTracker from "../../../../api/gamesTracker";
import auth from "../../../../api/auth";
import { useDifficulty } from "../../../../api/useDifficulty";

const CORRECT_SOUND = new Audio(correctSound);
const WRONG_SOUND = new Audio(wrongSound);
const TIMEOUT_SOUND = new Audio(timeoutSound);

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const getRandomQuestions = (count) => {
  const safeCount = Math.max(5, Math.min(count, quizData.length));
  return shuffleArray(quizData).slice(0, safeCount);
};

function scoreToG2Config(score) {
  const safeScore = Math.max(0, Math.min(1, score ?? 0.5));
  if (safeScore >= 0.67) return { questionCount: 12, secondsPerQuestion: 7 };
  if (safeScore >= 0.34) return { questionCount: 10, secondsPerQuestion: 10 };
  return { questionCount: 8, secondsPerQuestion: 14 };
}

function QuizGame() {
  const {
    difficulty_score: mlScore,
    loading: mlLoading,
  } = useDifficulty("guess");

  const [showSplash, setShowSplash] = useState(true);
  const [difficultyApplied, setDifficultyApplied] = useState(false);
  const [questionCount, setQuestionCount] = useState(10);
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(10);
  const [randomizedQuestions, setRandomizedQuestions] = useState(() => getRandomQuestions(10));
  const sessionStartRef = useRef(Date.now());
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0); // Added streak state
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [reveal, setReveal] = useState(false);

  const question = randomizedQuestions[current];
  const progressPercent = Math.round(((current + 1) / randomizedQuestions.length) * 100);

  // Initial Loading Splash Screen Effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500); // 2.5 second retro loading screen
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (mlLoading || difficultyApplied) return;

    const config = scoreToG2Config(mlScore);
    const safeQuestionCount = Math.min(config.questionCount, quizData.length);

    setQuestionCount(safeQuestionCount);
    setSecondsPerQuestion(config.secondsPerQuestion);
    setTimeLeft(config.secondsPerQuestion);
    setRandomizedQuestions(getRandomQuestions(safeQuestionCount));
    setDifficultyApplied(true);
  }, [mlLoading, mlScore, difficultyApplied]);

  const moveNext = useCallback((finalScore = score) => {
    if (current + 1 < randomizedQuestions.length) {
      setCurrent(prev => prev + 1);
      setSelected(null);
      setReveal(false);
      setTimeLeft(secondsPerQuestion);
      return;
    }

    setShowResult(true);

    const user = auth.getCurrentUser();
    if (user) {
      const elapsedSeconds = Math.max(0, Math.floor((Date.now() - sessionStartRef.current) / 1000));
      gamesTracker.recordGamePlay({
        email: user.email,
        gameType: 'guess',
        gameName: 'GUESS EVERYTHING',
        score: finalScore,
        level: 1,
        timePlayed: elapsedSeconds,
        date: new Date().toISOString()
      });
    }
  }, [current, randomizedQuestions.length, score, secondsPerQuestion]);

  useEffect(() => {
    if (timeLeft === 0 && !selected) {
      TIMEOUT_SOUND.play().catch(() => { });
      setStreak(0); // Break streak on timeout
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
      CORRECT_SOUND.play().catch(() => { });
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1); // Increase streak
    } else {
      WRONG_SOUND.play().catch(() => { });
      setStreak(0); // Break streak on wrong answer
    }

    setTimeout(() => moveNext(nextScore), 1500);
  };

  const restartGame = () => {
    sessionStartRef.current = Date.now();
    setRandomizedQuestions(getRandomQuestions(questionCount));
    setCurrent(0);
    setScore(0);
    setStreak(0); // Reset streak on restart
    setSelected(null);
    setReveal(false);
    setShowResult(false);
    setTimeLeft(secondsPerQuestion);
  };

  // 1. SPLASH SCREEN
  if (showSplash || mlLoading) {
    return (
      <div className="g2-game-page">
        <div className="g2-container g2-splash-container">
          <div className="g2-splash-content">
            <h1 className="g2-splash-title">ARE YOU<br />SURE <br/> ABOUT THAT ?</h1>
            <p className="g2-loading-text">LOADING...</p>
          </div>
        </div>
      </div>
    );
  }

  // 2. RESULTS SCREEN
  if (showResult) {
    return (
      <div className="g2-game-page">
        <div className="g2-container g2-result-container">
          <h2>🎉 LEVEL CLEARED!</h2>
          <p className="g2-result-label">Final Score</p>
          <h1 className="g2-final-score">{score} / {randomizedQuestions.length}</h1>
          <button className="g2-restart-btn" onClick={restartGame}>INSERT COIN (Play Again)</button>
        </div>
      </div>
    );
  }

  // 3. MAIN GAMEPLAY
  return (
    <div className="g2-game-page">
      <div className="g2-container g2-wide-container">
        {/* Top Info Bar */}
        <div className="g2-top">
          <span>Q {current + 1}/{randomizedQuestions.length}</span>

          {/* The key={streak} forces the animation to replay on every increase! */}
          <div className="g2-streak-container">
            {streak > 0 && (
              <span
                key={streak}
                className={`g2-streak 
          ${streak >= 12 ? "arcade-crazy" :
                    streak >= 7 ? "superheat-shake" :
                      streak >= 3 ? "fire-shake" : "base-shake"}`}
              >
                STREAK x{streak}
              </span>
            )}
          </div>

          <span className={`g2-timer ${timeLeft <= 3 ? "danger" : ""}`}>
            ⏱ {timeLeft}s
          </span>
        </div>
        {/* Progress Bar */}
        <div className="g2-progress-wrap" aria-label="quiz progress">
          <div className="g2-progress-track">
            <div className="g2-progress-fill" style={{ width: `${progressPercent}%` }}></div>
          </div>
          <span>{progressPercent}%</span>
        </div>

        {/* Split Layout Container */}
        <div className="g2-split-layout">

          {/* Left Side - Image */}
          <div className="g2-left-pane">
            <div className="g2-image-frame">
              <img
                src={question.image}
                alt="quiz"
                className={`g2-image ${reveal ? "reveal" : ""}`}
                loading="eager"
              />
            </div>
          </div>

          {/* Right Side - Question & Options */}
          <div className="g2-right-pane">
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

            <p className="g2-score">SCORE: {score}</p>
          </div>

        </div>
      </div>
    </div>
  );
}

export default QuizGame;