import { useCallback, useEffect, useState, useRef } from "react";
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
    for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
            if (board[r][c] === 0) return true;
        }
    }
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

    // Refs for Swipe Logic
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);

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

    const handleMove = useCallback((direction) => {
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
            setScore((prevScore) => prevScore + totalScoreGain);
            
            const maxTile = Math.max(...newBoard.flat());
            setHighestTile(maxTile);
            
            if (!canMove(newBoard)) {
                setGameOver(true);
            }
        }
    }, [board, gameOver]);

    // Keyboard Listeners
    useEffect(() => {
        const handleKey = (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
                e.preventDefault();
            }
            if (e.key === "ArrowLeft") handleMove("left");
            if (e.key === "ArrowRight") handleMove("right");
            if (e.key === "ArrowUp") handleMove("up");
            if (e.key === "ArrowDown") handleMove("down");
        };
        
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [handleMove]);

    // Track game over for backend
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

    // --- NEW ROBUST SWIPE HANDLERS ---
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchStartY.current = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
        if (gameOver) return;

        const touchEndX = e.changedTouches[0].clientX;
        const touchEndY = e.changedTouches[0].clientY;

        const deltaX = touchEndX - touchStartX.current;
        const deltaY = touchEndY - touchStartY.current;
        const minSwipeDistance = 30;

        if (Math.abs(deltaX) > Math.abs(deltaY)) {
            // Horizontal Swipe
            if (Math.abs(deltaX) > minSwipeDistance) {
                if (deltaX > 0) handleMove("right");
                else handleMove("left");
            }
        } else {
            // Vertical Swipe
            if (Math.abs(deltaY) > minSwipeDistance) {
                if (deltaY > 0) handleMove("down");
                else handleMove("up");
            }
        }
    };

    return (
        <div className="game-2048-page crt-screen">
            <div className="arcade-cabinet-2048 retro-panel">
                
                <div className="cabinet-header">
                    <div className="header-titles">
                        <h2 className="pixel-subtitle blue-text">DATA MERGE PROTOCOL</h2>
                        <h1 className="pixel-title gold-text">SYSTEM 2048</h1>
                    </div>
                    
                    <div className="header-stats">
                        <div className="stat-block border-green">
                            <span className="stat-label">EXP SCORE</span>
                            <span className="stat-value">{score}</span>
                        </div>
                        <div className="stat-block border-purple">
                            <span className="stat-label">MAX TILE</span>
                            <span className="stat-value">{highestTile}</span>
                        </div>
                    </div>
                </div>

                <div className="game-play-area">
                    
                    {/* SWIPE EVENTS ATTACHED DIRECTLY TO THE BOARD */}
                    <div 
                        className="cyber-grid-board"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
                        {board.map((row, r) =>
                            row.map((cell, c) => (
                                <div key={`${r}-${c}`} className={`grid-cell tile-${cell}`}>
                                    <span className="cell-number">{cell !== 0 ? cell : ""}</span>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="cabinet-sidebar">
                        <div className="rpg-dialogue-box instructions-box">
                            <h3 className="green-text mb-2">CONTROLS</h3>
                            <p>▶ Use ARROW KEYS or SWIPE to move tiles.</p>
                            <p>▶ Merge identical data blocks to upgrade them.</p>
                            <p>▶ Reach tile 2048 to master the system.</p>
                        </div>
                        
                        <button 
                            className="pixel-btn btn-blue pulse-btn w-100 mt-4" 
                            onClick={initGame}
                        >
                            [ {gameOver ? "REBOOT SYSTEM" : "FORCE RESTART"} ]
                        </button>
                    </div>

                </div>

            </div>

            {gameOver && (
                <div className="modal-overlay">
                    <div className="in-screen-modal-content border-red text-center">
                        <h2 className="pixel-title red-text blink mb-2">SYSTEM HALTED</h2>
                        <p className="pixel-subtitle mb-4">No Valid Moves Remain</p>
                        
                        <div className="final-stats-box mb-4">
                            <div className="stat-row">
                                <span className="blue-text">FINAL EXP:</span>
                                <span className="gold-text huge-text">{score}</span>
                            </div>
                            <div className="stat-row mt-2">
                                <span className="blue-text">PEAK DATA:</span>
                                <span className="green-text huge-text">{highestTile}</span>
                            </div>
                        </div>
                        
                        <button className="pixel-btn btn-green mx-auto pulse-btn" onClick={initGame}>
                            [ INITIALIZE NEW RUN ]
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Game2048;