import { useEffect, useState } from "react";
import "./g5.css";
import gamesTracker from "../../../../api/gamesTracker";
import auth from "../../../../api/auth";

const SIZE = 4;

const createEmptyBoard = () =>
    Array(SIZE)
        .fill(0)
        .map(() => Array(SIZE).fill(0));

const getRandomCell = (board) => {
    const empty = [];
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 0) empty.push({ r, c });
        }
    }
    if (empty.length === 0) return board;
    const { r, c } = empty[Math.floor(Math.random() * empty.length)];
    board[r][c] = Math.random() > 0.5 ? 2 : 4;
    return board;
};

const slide = (row) => {
    let arr = row.filter((val) => val);
    let scoreGain = 0;
    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            scoreGain += arr[i];
            arr[i + 1] = 0;
        }
    }
    arr = arr.filter((val) => val);
    while (arr.length < SIZE) arr.push(0);
    return { arr, scoreGain };
};

const canMove = (board) => {
    // Check if any empty cell exists
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 0) return true;
        }
    }
    
    // Check if any moves are possible
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            const current = board[r][c];
            if (c < SIZE - 1 && current === board[r][c + 1]) return true;
            if (r < SIZE - 1 && current === board[r + 1][c]) return true;
        }
    }
    return false;
};

function Game2048() {
    const [board, setBoard] = useState(createEmptyBoard());
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [highestTile, setHighestTile] = useState(0);

    const initGame = () => {
        let newBoard = createEmptyBoard();
        newBoard = getRandomCell(newBoard);
        newBoard = getRandomCell(newBoard);
        setBoard(newBoard);
        setScore(0);
        setGameOver(false);
        setHighestTile(4);
    };

    useEffect(() => {
        initGame();
    }, []);

    const handleMove = (direction) => {
        if (gameOver) return;

        let newBoard = JSON.parse(JSON.stringify(board));
        let totalScoreGain = 0;
        let boardChanged = false;

        if (direction === "left") {
            for (let r = 0; r < SIZE; r++) {
                const result = slide(newBoard[r]);
                if (JSON.stringify(result.arr) !== JSON.stringify(newBoard[r])) {
                    boardChanged = true;
                }
                newBoard[r] = result.arr;
                totalScoreGain += result.scoreGain;
            }
        }

        if (direction === "right") {
            for (let r = 0; r < SIZE; r++) {
                const reversedRow = [...newBoard[r]].reverse();
                const result = slide(reversedRow);
                const newRow = result.arr.reverse();
                if (JSON.stringify(newRow) !== JSON.stringify(newBoard[r])) {
                    boardChanged = true;
                }
                newBoard[r] = newRow;
                totalScoreGain += result.scoreGain;
            }
        }

        if (direction === "up") {
            for (let c = 0; c < SIZE; c++) {
                let col = [];
                for (let r = 0; r < SIZE; r++) col.push(newBoard[r][c]);
                const result = slide(col);
                if (JSON.stringify(result.arr) !== JSON.stringify(col)) {
                    boardChanged = true;
                }
                for (let r = 0; r < SIZE; r++) newBoard[r][c] = result.arr[r];
                totalScoreGain += result.scoreGain;
            }
        }

        if (direction === "down") {
            for (let c = 0; c < SIZE; c++) {
                let col = [];
                for (let r = 0; r < SIZE; r++) col.push(newBoard[r][c]);
                const reversedCol = [...col].reverse();
                const result = slide(reversedCol);
                const newCol = result.arr.reverse();
                if (JSON.stringify(newCol) !== JSON.stringify(col)) {
                    boardChanged = true;
                }
                for (let r = 0; r < SIZE; r++) newBoard[r][c] = newCol[r];
                totalScoreGain += result.scoreGain;
            }
        }

        if (boardChanged) {
            newBoard = getRandomCell(newBoard);
            setBoard(newBoard);
            setScore(score + totalScoreGain);
            
            // Update highest tile
            const maxTile = Math.max(...newBoard.flat());
            setHighestTile(maxTile);
            
            // Check if game is over
            if (!canMove(newBoard)) {
                setGameOver(true);
            }
        }
    };

    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                handleMove("left");
            }
            if (e.key === "ArrowRight") {
                e.preventDefault();
                handleMove("right");
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                handleMove("up");
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                handleMove("down");
            }
        };
        
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [board, gameOver]);

    // Record game when it's over
    useEffect(() => {
        if (gameOver) {
            const user = auth.getCurrentUser();
            if (user) {
                gamesTracker.recordGamePlay({
                    email: user.email,
                    gameType: '2048',
                    gameName: '2048 Game',
                    score: score,
                    date: new Date().toISOString()
                });
            }
        }
    }, [gameOver, score]);

    const getScorePercentage = () => {
        const maxPossible = 131072; // 2^17
        return Math.min((score / maxPossible) * 100, 100);
    };

    return (
        <div className="game-container">
            <div className="game-main-wrapper">
                {/* Left side - Game Board */}
                <div className="game-left-section">
                    <div className="board">
                        {board.map((row, r) =>
                            row.map((cell, c) => (
                                <div key={`${r}-${c}`} className={`cell value-${cell}`}>
                                    <span className="cell-content">{cell !== 0 ? cell : ""}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Right side - Content */}
                <div className="game-right-section">
                    <div className="content-wrapper">
                        <h1 className="game-title">2048 Game</h1>
                        
                        <button 
                            className="restart-btn" 
                            onClick={initGame}
                        >
                            {gameOver ? "New Game" : "Restart"}
                        </button>

                        <div className="stat-box large">
                            <div className="stat-label">Current Score</div>
                            <div className="stat-value-large">{score}</div>
                        </div>

                        <div className="stat-box">
                            <div className="stat-label">Highest Tile</div>
                            <div className="stat-value">{highestTile}</div>
                        </div>

                        <div className="score-meter-container">
                            <div className="meter-label">Progress</div>
                            <div className="score-meter">
                                <div 
                                    className="score-meter-fill"
                                    style={{ width: `${getScorePercentage()}%` }}
                                ></div>
                            </div>
                            <div className="meter-info">{Math.round(getScorePercentage())}%</div>
                        </div>

                        <div className="controls-info">
                            <p>⬆️ ⬇️ ⬅️ ➡️</p>
                            <p>Use arrow keys</p>
                        </div>
                    </div>
                </div>
            </div>

            {gameOver && (
                <div className="game-over-modal">
                    <div className="modal-content">
                        <h2>Game Over!</h2>
                        <div className="final-stats">
                            <div className="final-stat">
                                <span className="label">Final Score:</span>
                                <span className="value">{score}</span>
                            </div>
                            <div className="final-stat">
                                <span className="label">Highest Tile:</span>
                                <span className="value">{highestTile}</span>
                            </div>
                        </div>
                        <button 
                            className="modal-btn" 
                            onClick={initGame}
                        >
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Game2048;
