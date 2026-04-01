// game1.jsx — Memory Card Game
// ML integration: uses continuous difficulty_score to auto-scale board and move budget.

import { useCallback, useEffect, useState } from "react";
import Card from "./Card";
import "./game1.css";
import gamesTracker from "../../../../api/gamesTracker";
import auth from "../../../../api/auth";
import { useDifficulty } from "../../../../api/useDifficulty";

const sounds = {
    match:   new Audio(require('./sounds/match.mp3')),
    noMatch: new Audio(require('./sounds/not-match.mp3')),
    select:  new Audio(require('./sounds/select.mp3')),
};

const CARD_PALETTE = [
    "#ff6b6b", "#ffd166", "#4ecdc4", "#5e60ce", "#f15bb5", "#00bbf9",
    "#ff9f1c", "#2ec4b6", "#9b5de5", "#ff8fab", "#80ed99", "#48cae4",
    "#f94144", "#f3722c", "#90be6d", "#577590", "#ffb703", "#06d6a0",
    "#ef476f", "#ffd166", "#06d6a0", "#118ab2", "#073b4c", "#ff006e",
];

function buildAdaptiveConfig(score) {
    const safeScore = Math.max(0, Math.min(1, Number(score ?? 0.5)));

    // More score => more tiles (pairs from 4 to 12).
    const pairs = 4 + Math.floor(safeScore * 8);
    const cols = pairs <= 6 ? 4 : pairs <= 10 ? 5 : 6;

    // Minimum turns to win is exactly `pairs` (perfect play).
    // Margin shrinks with higher difficulty, but never below +2.
    const margin = Math.max(2, 6 - Math.floor(safeScore * 5));
    const maxTurns = pairs + margin;

    return {
        pairs,
        cols,
        colors: CARD_PALETTE.slice(0, pairs),
        maxTurns,
        level: 1 + Math.floor(safeScore * 9),
    };
}

function MemoryGame() {
    const {
        difficulty_score: mlScore,
        loading: mlLoading,
    } = useDifficulty("memory");

    const [adaptiveConfig, setAdaptiveConfig] = useState(buildAdaptiveConfig(0.5));
    const [adaptiveApplied, setAdaptiveApplied] = useState(false);

    // ── Game state ────────────────────────────────────────────────────────────
    const [cards, setCards]               = useState([]);
    const [firstChoice, setFirstChoice]   = useState(null);
    const [secondChoice, setSecondChoice] = useState(null);
    const [disabled, setDisabled]         = useState(false);
    const [score, setScore]               = useState(0);
    const [turns, setTurns]               = useState(0);
    const [resultText, setResultText]     = useState("");
    const [showResult, setShowResult]     = useState(false);
    const [showFail, setShowFail]         = useState(false);

    const maxPairs       = adaptiveConfig.pairs;
    const maxTurns       = adaptiveConfig.maxTurns;
    const progressPercent = Math.round((score / maxPairs) * 100);

    useEffect(() => {
        if (mlLoading || adaptiveApplied) return;
        setAdaptiveConfig(buildAdaptiveConfig(mlScore));
        setAdaptiveApplied(true);
    }, [mlLoading, mlScore, adaptiveApplied]);

    const shuffleCards = useCallback((config = adaptiveConfig) => {
        const colors   = config.colors;
        const shuffled = [...colors, ...colors]
            .sort(() => Math.random() - 0.5)
            .map(color => ({ color, matched: false, id: Math.random() }));
        setCards(shuffled);
        setFirstChoice(null);
        setSecondChoice(null);
        setScore(0);
        setTurns(0);
        setResultText("");
        setShowResult(false);
        setShowFail(false);
    }, [adaptiveConfig]);

    const handleChoice = (card) => {
        if (showResult || showFail) return;
        if (!disabled && !card.matched && card !== firstChoice) {
            firstChoice ? setSecondChoice(card) : setFirstChoice(card);
            sounds.select.play();
        }
    };

    useEffect(() => {
        if (firstChoice && secondChoice) {
            setDisabled(true);
            if (firstChoice.color === secondChoice.color) {
                setCards(prev =>
                    prev.map(c => c.color === firstChoice.color ? { ...c, matched: true } : c)
                );
                setScore(prev => prev + 1);
                sounds.match.play();
                resetTurn();
            } else {
                sounds.noMatch.play();
                setTimeout(resetTurn, 700);
            }
        }
    }, [firstChoice, secondChoice]);

    const resetTurn = () => {
        setFirstChoice(null);
        setSecondChoice(null);
        setDisabled(false);
        setTurns(prev => prev + 1);
    };

    useEffect(() => { shuffleCards(adaptiveConfig); }, [adaptiveConfig, shuffleCards]);

    useEffect(() => {
        if (turns === 0 || showFail) return;
        const efficiency = turns / maxPairs;
        if      (efficiency <= 1.2) setResultText("GENIUS MODE");
        else if (efficiency <= 1.5) setResultText("NOT BAD");
        else if (efficiency <= 1.8) setResultText("KEEP PRACTICING");
        else                        setResultText("TRY AGAIN");
    }, [turns, maxPairs, showFail]);

    useEffect(() => {
        if (showResult || showFail) return;
        if (turns >= maxTurns && score < maxPairs) {
            setShowFail(true);
            setResultText("OUT OF MOVES");
        }
    }, [turns, maxTurns, score, maxPairs, showResult, showFail]);

    useEffect(() => {
        if (score === maxPairs && turns > 0) {
            setShowResult(true);
            const current = auth.getCurrentUser();
            if (current) {
                gamesTracker.recordGamePlay({
                    email:      current.email,
                    gameType:   'memory',
                    gameName:   'Memory Card Game',
                    score:      turns,        // turns used = inverse of skill
                    level:      adaptiveConfig.level,
                    timePlayed: 0,            // memory doesn't track time
                    date:       new Date().toISOString(),
                });
            }
        }
    }, [score, turns, maxPairs, adaptiveConfig.level]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="game1-page">
            <div className="atmosphere-layer" aria-hidden="true"></div>
            <div className="gameboy-shell">

                <div className="hud-head">
                    <div>
                        <p className="hud-subtitle">Neural Match System</p>
                        <h2 className="game-title">MEMORY CORE</h2>
                    </div>
                    <span className="difficulty-pill level-medium">
                        ADAPTIVE L{adaptiveConfig.level}
                    </span>
                </div>

                <div className="stats">
                    <span>SCORE: {score}</span>
                    <span>TURNS: {turns}/{maxTurns}</span>
                </div>

                <div className="progress-wrap" aria-label="Match progress">
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <span>{score}/{maxPairs} MATCHES</span>
                </div>

                <div
                    className="card-grid"
                    style={{ gridTemplateColumns: `repeat(${adaptiveConfig.cols}, 1fr)` }}
                >
                    {cards.map(card => (
                        <Card
                            key={card.id}
                            card={card}
                            handleChoice={handleChoice}
                            flipped={card === firstChoice || card === secondChoice || card.matched}
                        />
                    ))}
                </div>

                {showResult && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>SYSTEM CLEAR</h3>
                            <p>TURNS: {turns}</p>
                            <p>{resultText}</p>
                            <button className="res-but" onClick={() => shuffleCards(adaptiveConfig)}>
                                RESTART
                            </button>
                        </div>
                    </div>
                )}

                {showFail && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>SYSTEM LOCKED</h3>
                            <p>MOVE BUDGET EXCEEDED</p>
                            <p>{turns}/{maxTurns} TURNS USED</p>
                            <button className="res-but" onClick={() => shuffleCards(adaptiveConfig)}>
                                RETRY
                            </button>
                        </div>
                    </div>
                )}

                <div className="b1">
                    <div>↖</div><div>↑</div><div>↗</div>
                    <div>←</div><div></div><div>→</div>
                    <div>↙</div><div>↓</div><div>↘</div>
                </div>
                <div className="b2">
                    <button>Y</button><button>X</button>
                    <button>B</button><button>A</button>
                </div>

            </div>
        </div>
    );
}

export default MemoryGame;
