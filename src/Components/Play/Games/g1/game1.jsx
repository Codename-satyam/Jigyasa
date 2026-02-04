import { useEffect, useState } from "react";
import Card from "./Card";
import "./game1.css";


const sounds = {
    match: new Audio(require('./sounds/match.mp3')),
    noMatch: new Audio(require('./sounds/not-match.mp3')),
    select: new Audio(require('./sounds/select.mp3')),
}

const levelConfig = {
    easy: {
        pairs: 4,
        cols: 4,
        colors: ["#9bbc0f", "#8bac0f", "#306230", "#0f380f"],
    },
    medium: {
        pairs: 6,
        cols: 4,
        colors: ["#9bbc0f", "#8bac0f", "#306230", "#0f380f", "#7aa021", "#4f772d"],
    },
    hard: {
        pairs: 10,
        cols: 5,
        colors: [
            "#9bbc0f",
            "#8bac0f",
            "#306230",
            "#0f380f",
            "#7aa021",
            "#4f772d",
            "#3a5a40",
            "#588157",
            "#a0d070",
            "#6baa39",
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

    const shuffleCards = (level = difficulty) => {
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
    };

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
    }, [difficulty]);

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
        }
    }, [score, turns, difficulty]);

    return (
        <div className="game1-page">
            <div className="gameboy-shell">
                <h2 className="game-title">MEMORY GAME</h2>

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
                            <h3>STAGE CLEAR</h3>
                            <p>TURNS: {turns}</p>
                            <p>{resultText}</p>
                            <button className="res-but" onClick={() => shuffleCards(difficulty)}>RESTART</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default MemoryGame;
