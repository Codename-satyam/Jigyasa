import { useEffect, useState, useCallback } from "react";
import ThreeDBackground from "../ThreeDBackground";
import "./g4.css";
import correctSound from "./sounds/correct.mp3";
import wrongSound from "./sounds/wrong.mp3";
import timeoutSound from "./sounds/timeout.mp3";
import gamesTracker from "../../../../api/gamesTracker";
import auth from "../../../../api/auth";

const CORRECT_SOUND = new Audio(correctSound);
const WRONG_SOUND = new Audio(wrongSound);
const TIMEOUT_SOUND = new Audio(timeoutSound);

const OPERATORS = ["+", "-", "*"];
const MAX_QUESTIONS = 10;
const TIME_LIMIT = 15;

function evaluateExpression(numbers, operators) {
  const collapsedNumbers = [numbers[0]];
  const collapsedOperators = [];

  operators.forEach((operator, index) => {
    const nextNumber = numbers[index + 1];

    if (operator === "*") {
      collapsedNumbers[collapsedNumbers.length - 1] *= nextNumber;
      return;
    }

    collapsedOperators.push(operator);
    collapsedNumbers.push(nextNumber);
  });

  return collapsedOperators.reduce((total, operator, index) => {
    const nextNumber = collapsedNumbers[index + 1];
    return operator === "+" ? total + nextNumber : total - nextNumber;
  }, collapsedNumbers[0]);
}

function MathGame() {
  const [targetNumber, setTargetNumber] = useState(0);
  const [options, setOptions] = useState([]);
  const [correctEquation, setCorrectEquation] = useState("");
  const [result, setResult] = useState("");
  const [selectedValue, setSelectedValue] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [timer, setTimer] = useState(15);
  const [questionCount, setQuestionCount] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const generateEquation = useCallback((currentQuestionCount) => {
    // Check if game is over
    if (currentQuestionCount >= MAX_QUESTIONS) {
      setGameOver(true);
      return;
    }

    const createEquation = () => {
      const count = Math.floor(Math.random() * 2) + 2; // 2–3 numbers
      const numbers = [];
      const operators = [];

      for (let i = 0; i < count; i++) {
        const num = Math.floor(Math.random() * 10) + 1;
        numbers.push(num);

        if (i < count - 1) {
          const op = OPERATORS[Math.floor(Math.random() * OPERATORS.length)];
          operators.push(op);
        }
      }

      const equation = numbers
        .map((num, index) => index < operators.length ? `${num} ${operators[index]}` : `${num}`)
        .join(" ");

      return { equation, answer: evaluateExpression(numbers, operators) };
    };

    // Create the correct equation
    const correct = createEquation();
    
    // Create wrong equations with different results
    const wrongEquations = [];
    const usedResults = new Set([correct.answer]);
    
    while (wrongEquations.length < 3) {
      const wrong = createEquation();
      if (!usedResults.has(wrong.answer)) {
        wrongEquations.push(wrong.equation);
        usedResults.add(wrong.answer);
      }
    }

    const shuffledOptions = [...wrongEquations, correct.equation].sort(
      () => Math.random() - 0.5
    );

    setTargetNumber(correct.answer);
    setCorrectEquation(correct.equation);
    setOptions(shuffledOptions);
    setResult("");
    setSelectedValue(null);
    setFeedback(null);
    setTimer(TIME_LIMIT);
    setQuestionCount(currentQuestionCount + 1);
  }, []);

  useEffect(() => {
    generateEquation(0);
  }, [generateEquation]);

  // Timer countdown
  useEffect(() => {
    if (feedback || gameOver) return;

    if (timer <= 0) {
      setFeedback("wrong");
      setResult("⏰ Time's up!");
      TIMEOUT_SOUND.play();
      setTimeout(() => generateEquation(questionCount), 1200);
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, feedback, gameOver, generateEquation, questionCount]);

  // Record game when it's over
  useEffect(() => {
    if (gameOver && questionCount === MAX_QUESTIONS) {
      const user = auth.getCurrentUser();
      if (user) {
        gamesTracker.recordGamePlay({
          email: user.email,
          gameType: 'math',
          gameName: 'Math Game',
          score: score,
          date: new Date().toISOString()
        });
      }
    }
  }, [gameOver, questionCount, score]);

  const handleClick = (equation) => {
    if (feedback) {
      return;
    }

    const isCorrect = equation === correctEquation;

    setSelectedValue(equation);
    setFeedback(isCorrect ? "correct" : "wrong");
    if (isCorrect) {
      setResult("✅ Correct!");
      setScore(prev => prev + 1);
      CORRECT_SOUND.play();
    } else {
      setResult("❌ Wrong!");
      WRONG_SOUND.play();
    }

    setTimeout(() => generateEquation(questionCount), 1200);
  };

  const restartGame = () => {
    setQuestionCount(0);
    setScore(0);
    setGameOver(false);
    setTimer(TIME_LIMIT);
    generateEquation(0);
  };

  return (
    <div className="math-game-page">
      <ThreeDBackground />
      <div className="game-container">
        <div className="game-header">
          <h2>Find the Equation!</h2>
          <div className="game-stats">
            <span className="question-counter">Question {questionCount}/{MAX_QUESTIONS}</span>
            <span className={`timer ${timer <= 5 ? 'timer-warning' : ''}`}>⏱️ {timer}s</span>
          </div>
        </div>
        <h1>{targetNumber}</h1>

        <div className="options">
          {options.map((opt, i) => {
            const isSelected = selectedValue === opt;
            const stateClass = isSelected && feedback ? feedback : "";

            return (
              <button
                key={i}
                className={`option-btn ${stateClass}`.trim()}
                onClick={() => handleClick(opt)}
                type="button"
              >
                {opt}
              </button>
            );
          })}
        </div>

        <p className="result">{result}</p>
      </div>

      {gameOver && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>🎉 Game Over!</h2>
            <div className="score-display">
              <p className="final-score">{score}/{MAX_QUESTIONS}</p>
              <p className="score-label">Correct Answers</p>
            </div>
            <div className="score-message">
              {score === MAX_QUESTIONS && <p>🌟 Perfect Score! Amazing!</p>}
              {score >= 7 && score < MAX_QUESTIONS && <p>🎯 Great Job!</p>}
              {score >= 5 && score < 7 && <p>👍 Good Effort!</p>}
              {score < 5 && <p>💪 Keep Practicing!</p>}
            </div>
            <button className="restart-btn" onClick={restartGame}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MathGame;
