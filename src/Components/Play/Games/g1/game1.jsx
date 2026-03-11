import { useCallback, useEffect, useState } from "react";
import Card from "./Card";
import "./game1.css";
import gamesTracker from "../../../../api/gamesTracker";
import auth from "../../../../api/auth";


const sounds = {
    match: new Audio(require('./sounds/match.mp3')),
    noMatch: new Audio(require('./sounds/not-match.mp3')),
    select: new Audio(require('./sounds/select.mp3')),
}

const levelConfig = {
    easy: {
        pairs: 4,
        cols: 4,
        colors: ["#ff6b6b", "#ffd166", "#4ecdc4", "#5e60ce"],
    },
    medium: {
        pairs: 6,
        cols: 4,
        colors: ["#ff6b6b", "#ffd166", "#4ecdc4", "#5e60ce", "#f15bb5", "#00bbf9"],
    },
    hard: {
        pairs: 10,
        cols: 5,
        colors: [
            "#ff6b6b",
            "#ffd166",
            "#4ecdc4",
            "#5e60ce",
            "#f15bb5",
            "#00bbf9",
            "#ff9f1c",
            "#2ec4b6",
            "#9b5de5",
            "#ff8fab",
        ],
    },
};

function MemoryGame() {
    const [difficulty, setDifficulty] = useState("medium");
    const [cards, setCards] = useState([]);
    const [firstChoice, setFirstChoice] = useState(null);
    const [secondChoice, setSecondChoice] = useState(null);
    const [disabled, setDisabled] = useState(false);
    const [score, setScore] = useState(0);
    const [turns, setTurns] = useState(0);
    const [resultText, setResultText] = useState("");
    const [showResult, setShowResult] = useState(false);

    const maxPairs = levelConfig[difficulty].pairs;
    const progressPercent = Math.round((score / maxPairs) * 100);

    const shuffleCards = useCallback((level = difficulty) => {
        const selectedColors = levelConfig[level].colors.slice(
            0,
            levelConfig[level].pairs
        );

        const shuffled = [...selectedColors, ...selectedColors]
            .sort(() => Math.random() - 0.5)
            .map(color => ({
                color,
                matched: false,
                id: Math.random(),
            }));

        setCards(shuffled);
        setFirstChoice(null);
        setSecondChoice(null);
        setScore(0);
        setTurns(0);
        setResultText("");
        setShowResult(false);
    }, [difficulty]);

    const handleChoice = (card) => {
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
                    prev.map(card =>
                        card.color === firstChoice.color
                            ? { ...card, matched: true }
                            : card
                    )
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

    useEffect(() => {
        shuffleCards(difficulty);
    }, [difficulty, shuffleCards]);

    useEffect(() => {
        if (turns === 0) return;

        if (turns <= 6) setResultText("GENIUS MODE");
        else if (turns <= 10) setResultText("NOT BAD");
        else if (turns <= 14) setResultText("KEEP PRACTICING");
        else setResultText("TRY AGAIN");
    }, [turns]);

    useEffect(() => {
        if (score === levelConfig[difficulty].pairs && turns > 0) {
            setShowResult(true);
            
            // Record game play
            const current = auth.getCurrentUser();
            if (current) {
                gamesTracker.recordGamePlay({
                    email: current.email,
                    gameType: 'memory',
                    gameName: 'Memory Card Game',
                    difficulty: difficulty,
                    score: turns,
                    date: new Date().toISOString()
                });
            }
        }
    }, [score, turns, difficulty]);

    return (
        <div className="game1-page">
            <div className="atmosphere-layer" aria-hidden="true"></div>
            <div className="gameboy-shell">
                <div className="hud-head">
                    <div>
                        <p className="hud-subtitle">Neural Match System</p>
                        <h2 className="game-title">MEMORY CORE</h2>
                    </div>
                    <span className={`difficulty-pill level-${difficulty}`}>{difficulty.toUpperCase()}</span>
                </div>

                <div className="difficulty-bar">
                    {Object.keys(levelConfig).map(level => (
                        <button
                            key={level}
                            className={difficulty === level ? "active" : ""}
                            onClick={() => setDifficulty(level)}
                        >
                            {level.toUpperCase()}
                        </button>
                    ))}
                </div>

                <div className="stats">
                    <span>SCORE: {score}</span>
                    <span>TURNS: {turns}</span>
                </div>

                <div className="progress-wrap" aria-label="Match progress">
                    <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                    </div>
                    <span>{score}/{maxPairs} MATCHES</span>
                </div>

                <div
                    className="card-grid"
                    style={{
                        gridTemplateColumns: `repeat(${levelConfig[difficulty].cols}, 1fr)`,
                    }}
                >
                    {cards.map(card => (
                        <Card
                            key={card.id}
                            card={card}
                            handleChoice={handleChoice}
                            flipped={
                                card === firstChoice ||
                                card === secondChoice ||
                                card.matched
                            }
                        />
                    ))}
                </div>

                {showResult && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h3>SYSTEM CLEAR</h3>
                            <p>TURNS: {turns}</p>
                            <p>{resultText}</p>
                            <button className="res-but" onClick={() => shuffleCards(difficulty)}>RESTART</button>
                        </div>
                    </div>
                )}
                {/* D-Pad */}
                <div className="b1">
                    <div>↖</div>
                    <div>↑</div>
                    <div>↗</div>
                    <div>←</div>
                    <div></div>
                    <div>→</div>
                    <div>↙</div>
                    <div>↓</div>
                    <div>↘</div>
                </div>

                {/* Action Buttons */}
                <div className="b2">
                    <button>Y</button>
                    <button>X</button>
                    <button>B</button>
                    <button>A</button>
                </div>
            </div>
        </div>
    );
}

export default MemoryGame;
