// g4.jsx — Math Game
// ML integration: difficulty_score (0–1) from ML silently tunes four parameters:
//   maxNumber    — upper bound on operand values
//   operandCount — 2 or 3 numbers per equation
//   operators    — subset of [+, -, *]
//   timeLimit    — seconds per question
// No label, badge, or hint is shown to the player.

import { useEffect, useState, useCallback, useRef } from "react";
import ThreeDBackground from "../ThreeDBackground";
import "./g4.css";
import correctSound from "./sounds/correct.mp3";
import wrongSound   from "./sounds/wrong.mp3";
import timeoutSound from "./sounds/timeout.mp3";
import gamesTracker from "../../../../api/gamesTracker";
import auth from "../../../../api/auth";
import { useDifficulty } from "../../../../api/useDifficulty";

const CORRECT_SOUND = new Audio(correctSound);
const WRONG_SOUND   = new Audio(wrongSound);
const TIMEOUT_SOUND = new Audio(timeoutSound);

const MAX_QUESTIONS = 10;

/**
 * Convert a continuous ML difficulty_score (0–1) into game parameters.
 * This gives a smooth, invisible ramp rather than 3 hard-coded buckets.
 *
 *  score 0.00 → small values, 2 operands, +/-, generous timer
 *  score 0.50 → medium values, 3 operands, +,-,*
 *  score 1.00 → larger values, up to 4 operands, +,-,*,/ and tight timer
 */
function scoreToParams(score) {
    const s = Math.max(0, Math.min(1, score ?? 0.5));

    // Linear interpolation helpers
    const lerp = (a, b, t) => Math.round(a + (b - a) * t);

    const maxNumber = lerp(8, 40, s);
    const timeLimit = lerp(20, 6, s); // inverted: harder = less time

    const operators = ["+", "-"];
    if (s >= 0.25) operators.push("*");
    if (s >= 0.7) operators.push("/");

    let operandCount = 2;
    if (s >= 0.35) operandCount = 3;
    if (s >= 0.8) operandCount = 4;

    return {
        maxNumber,
        timeLimit,
        operators,
        operandCount,
        modelLevel: 1 + Math.floor(s * 9),
    };
}

// ── Math evaluation (unchanged) ───────────────────────────────────────────────
function evaluateExpression(numbers, operators) {
    const nums = [numbers[0]];
    const ops  = [];
    operators.forEach((op, i) => {
        if (op === "*" || op === "/") {
            const rhs = numbers[i + 1] === 0 ? 1 : numbers[i + 1];
            if (op === "*") nums[nums.length - 1] *= rhs;
            else nums[nums.length - 1] = Math.trunc(nums[nums.length - 1] / rhs);
            return;
        }
        ops.push(op); nums.push(numbers[i+1]);
    });
    return ops.reduce((total, op, i) => op==="+" ? total+nums[i+1] : total-nums[i+1], nums[0]);
}

function createAdaptiveEquation(maxNumber, operators, operandCount) {
    const nums = Array.from({ length: operandCount }, () => Math.floor(Math.random() * maxNumber) + 1);
    const ops = [];

    for (let i = 0; i < operandCount - 1; i++) {
        let op = operators[Math.floor(Math.random() * operators.length)];

        // Keep division integer-friendly by constructing divisible operands.
        if (op === "/") {
            const divisor = Math.floor(Math.random() * Math.min(10, maxNumber)) + 1;
            const quotient = Math.floor(Math.random() * Math.min(12, maxNumber)) + 1;
            nums[i] = divisor * quotient;
            nums[i + 1] = divisor;
        }

        ops.push(op);
    }

    const eq = nums.map((n, i) => (i < ops.length ? `${n} ${ops[i]}` : `${n}`)).join(" ");
    return { equation: eq, answer: evaluateExpression(nums, ops) };
}

// ── Component ─────────────────────────────────────────────────────────────────
function MathGame() {
    // ── ML difficulty (silent) ────────────────────────────────────────────────
    const {
        difficulty_score: mlScore,
        loading: mlLoading,
    } = useDifficulty('math');

    // Derive params from ML score; default to mid-range while loading
    const [params, setParams]         = useState(scoreToParams(0.5));
    const [paramsApplied, setParamsApplied] = useState(false);
    const paramsRef = useRef(params);
    useEffect(() => { paramsRef.current = params; }, [params]);

    useEffect(() => {
        if (!mlLoading && !paramsApplied) {
            setParams(scoreToParams(mlScore));
            setParamsApplied(true);
        }
    }, [mlLoading, mlScore, paramsApplied]);

    // ── Game state ────────────────────────────────────────────────────────────
    const [targetNumber, setTargetNumber]     = useState(0);
    const [options, setOptions]               = useState([]);
    const [correctEquation, setCorrectEquation] = useState("");
    const [result, setResult]                 = useState("");
    const [selectedValue, setSelectedValue]   = useState(null);
    const [feedback, setFeedback]             = useState(null);
    const [timer, setTimer]                   = useState(params.timeLimit);
    const [questionCount, setQuestionCount]   = useState(0);
    const [score, setScore]                   = useState(0);
    const [gameOver, setGameOver]             = useState(false);

    // ── Equation generator ────────────────────────────────────────────────────
    const generateEquation = useCallback((currentQ) => {
        if (currentQ >= MAX_QUESTIONS) { setGameOver(true); return; }

        const { maxNumber, timeLimit, operators, operandCount } = paramsRef.current;

        const correct     = createAdaptiveEquation(maxNumber, operators, operandCount);
        const wrong       = [];
        const usedAnswers = new Set([correct.answer]);
        while (wrong.length < 3) {
            const w = createAdaptiveEquation(maxNumber, operators, operandCount);
            if (!usedAnswers.has(w.answer)) { wrong.push(w.equation); usedAnswers.add(w.answer); }
        }

        const shuffled = [...wrong, correct.equation].sort(() => Math.random()-0.5);
        setTargetNumber(correct.answer);
        setCorrectEquation(correct.equation);
        setOptions(shuffled);
        setResult(""); setSelectedValue(null); setFeedback(null);
        setTimer(timeLimit);
        setQuestionCount(currentQ+1);
    }, []);

    // Start first question after ML params are ready
    useEffect(() => {
        if (!mlLoading) generateEquation(0);
    }, [mlLoading]); // eslint-disable-line react-hooks/exhaustive-deps

    // Timer
    useEffect(() => {
        if (feedback || gameOver) return;
        if (timer <= 0) {
            setFeedback("wrong"); setResult("SYSTEM TIMEOUT!");
            TIMEOUT_SOUND.play();
            setTimeout(() => generateEquation(questionCount), 1200);
            return;
        }
        const id = setInterval(() => setTimer(p => p-1), 1000);
        return () => clearInterval(id);
    }, [timer, feedback, gameOver, generateEquation, questionCount]);

    // Record game
    useEffect(() => {
        if (gameOver && questionCount === MAX_QUESTIONS) {
            const user = auth.getCurrentUser();
            if (user) {
                gamesTracker.recordGamePlay({
                    email: user.email, gameType: 'math', gameName: 'Math Game',
                    score, level: 1, timePlayed: 0,
                    date: new Date().toISOString(),
                });
            }
        }
    }, [gameOver, questionCount, score]);

    const handleClick = (equation) => {
        if (feedback) return;
        const isCorrect = equation === correctEquation;
        setSelectedValue(equation);
        setFeedback(isCorrect ? "correct" : "wrong");
        if (isCorrect) { setResult("MATCH CONFIRMED"); setScore(p => p+1); CORRECT_SOUND.play(); }
        else           { setResult("ERROR: INVALID"); WRONG_SOUND.play(); }
        setTimeout(() => generateEquation(questionCount), 1200);
    };

    const restartGame = () => {
        setParamsApplied(false);   // re-fetch ML params on restart
        setQuestionCount(0); setScore(0); setGameOver(false);
        setTimer(params.timeLimit);
        generateEquation(0);
    };

    if (mlLoading) {
        return (
            <div className="math-game-page crt-screen" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
                <p className="gold-text blink">INITIALIZING...</p>
            </div>
        );
    }

    return (
        <div className="math-game-page crt-screen">
            <div className="bg-3d-layer"><ThreeDBackground /></div>
            <div className="game-container retro-panel">
                <div className="game-header">
                    <h2 className="pixel-title-small blue-text">CRACK THE CODE</h2>
                    <div className="game-stats">
                        <span className="question-counter green-text">LVL {questionCount}/{MAX_QUESTIONS}</span>
                        <span className="question-counter blue-text">ADAPT {params.modelLevel}</span>
                        <span className={`timer ${timer<=5?'timer-warning':'gold-text'}`}>T-{timer}s</span>
                    </div>
                </div>
                <div className="target-display">
                    <span className="target-label">TARGET VALUE:</span>
                    <h1 className="target-number">{targetNumber}</h1>
                </div>
                <div className="options-grid">
                    {options.map((opt, i) => {
                        const isSelected = selectedValue===opt;
                        const cls = isSelected && feedback ? feedback : "";
                        return (
                            <button key={i} className={`pixel-btn option-btn ${cls}`.trim()}
                                onClick={() => handleClick(opt)} type="button" disabled={feedback!==null}>
                                {opt}
                            </button>
                        );
                    })}
                </div>
                <div className="result-container">
                    <p className={`result-text ${feedback==='correct'?'green-text':feedback==='wrong'?'red-text blink':''}`}>
                        {result || "AWAITING INPUT..."}
                    </p>
                </div>
            </div>

            {gameOver && (
                <div className="modal-overlay">
                    <div className="modal-content retro-panel">
                        <h2 className="pixel-title gold-text blink mb-2">MISSION ACCOMPLISHED</h2>
                        <div className="score-display">
                            <p className="score-label blue-text">FINAL SCORE</p>
                            <p className="final-score green-text">{score} / {MAX_QUESTIONS}</p>
                        </div>
                        <div className="score-message mb-4">
                            {score===MAX_QUESTIONS && <p className="gold-text">S-RANK: PERFECT RUN!</p>}
                            {score>=7&&score<MAX_QUESTIONS && <p className="green-text">A-RANK: EXCELLENT WORK!</p>}
                            {score>=5&&score<7 && <p className="blue-text">B-RANK: OPERATION SUCCESS.</p>}
                            {score<5 && <p className="red-text">C-RANK: TRAINING REQUIRED.</p>}
                        </div>
                        <button className="pixel-btn restart-btn" onClick={restartGame}>[ INITIALIZE RETRY ]</button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MathGame;
