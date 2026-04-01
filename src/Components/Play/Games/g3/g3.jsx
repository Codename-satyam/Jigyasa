import React, { useState, useEffect, useCallback, useRef } from "react";
import "./g3.css";

// Helper to deeply clone the 2D grid
const cloneGrid = (grid) => grid.map(row => [...row]);

const DIRECTIONS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

function collectReachableCells(grid) {
  const size = grid.length;
  const queue = [[0, 0]];
  const visited = new Set(["0,0"]);

  while (queue.length > 0) {
    const [row, col] = queue.shift();

    for (const [dr, dc] of DIRECTIONS) {
      const nextRow = row + dr;
      const nextCol = col + dc;
      const key = `${nextRow},${nextCol}`;

      if (
        nextRow < 0 ||
        nextCol < 0 ||
        nextRow >= size ||
        nextCol >= size ||
        visited.has(key) ||
        grid[nextRow][nextCol] === "X"
      ) {
        continue;
      }

      visited.add(key);
      queue.push([nextRow, nextCol]);
    }
  }

  return visited;
}

function isPlayableGrid(grid, targetsExpected) {
  const size = grid.length;
  const reachable = collectReachableCells(grid);

  if (!reachable.has(`${size - 1},${size - 1}`)) {
    return false;
  }

  let reachableTargets = 0;
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (grid[row][col] === "T" && reachable.has(`${row},${col}`)) {
        reachableTargets += 1;
      }
    }
  }

  return reachableTargets === targetsExpected;
}

const generateGrid = (size, blocks, targets) => {
  const totalCells = size * size;
  const reservedCells = 2;
  const maxTargets = Math.max(1, Math.min(targets, totalCells - reservedCells - 1));
  const maxBlocks = Math.max(1, Math.min(blocks, totalCells - reservedCells - maxTargets));

  for (let attempt = 0; attempt < 80; attempt++) {
    const grid = Array(size)
      .fill()
      .map(() => Array(size).fill(""));

    grid[0][0] = "S";
    grid[size - 1][size - 1] = "E";

    let placedBlocks = 0;
    while (placedBlocks < maxBlocks) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);

      if (grid[row][col] === "") {
        grid[row][col] = "X";
        placedBlocks++;
      }
    }

    let placedTargets = 0;
    while (placedTargets < maxTargets) {
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);

      if (grid[row][col] === "") {
        grid[row][col] = "T";
        placedTargets++;
      }
    }

    if (isPlayableGrid(grid, maxTargets)) {
      return grid;
    }
  }

  const fallbackGrid = Array(size)
    .fill()
    .map(() => Array(size).fill(""));

  fallbackGrid[0][0] = "S";
  fallbackGrid[size - 1][size - 1] = "E";

  let targetsPlaced = 0;
  for (let i = 1; i < size - 1 && targetsPlaced < maxTargets; i++) {
    fallbackGrid[i][Math.min(i, size - 2)] = "T";
    targetsPlaced++;
  }

  return fallbackGrid;
};

function PathGame() {
  const [level, setLevel] = useState(1);
  const [size, setSize] = useState(5);
  const [blocks, setBlocks] = useState(5);
  const [targetsTotal, setTargetsTotal] = useState(2);

  const [grid, setGrid] = useState([]);
  const [player, setPlayer] = useState({ r: 0, c: 0 });
  const [moves, setMoves] = useState(0);
  const [targets, setTargets] = useState(targetsTotal);
  const [maxMoves, setMaxMoves] = useState(12);
  const [statusMessage, setStatusMessage] = useState("Extract all data frags, then reach the portal.");
  
  // New Game State Trackers
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const movesRef = useRef(moves);
  const targetsRef = useRef(targets);
  const levelRef = useRef(level);
  const maxMovesRef = useRef(maxMoves);
  const gridRef = useRef(grid);
  const sizeRef = useRef(size);

  useEffect(() => { movesRef.current = moves; }, [moves]);
  useEffect(() => { targetsRef.current = targets; }, [targets]);
  useEffect(() => { levelRef.current = level; }, [level]);
  useEffect(() => { maxMovesRef.current = maxMoves; }, [maxMoves]);
  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { sizeRef.current = size; }, [size]);

  const scaleDifficulty = useCallback((lvl) => {
    let newSize = Math.min(5 + Math.floor(lvl / 2), 10);
    let newBlocks = 5 + lvl * 2;
    let newTargets = Math.min(2 + Math.floor(lvl / 2), 6);
    let newMoves = newSize * 2 + lvl * 2;

    const totalCells = newSize * newSize;
    const maxSafeBlocks = Math.max(1, totalCells - 2 - newTargets);
    newBlocks = Math.min(newBlocks, maxSafeBlocks);

    setSize(newSize);
    setBlocks(newBlocks);
    setTargetsTotal(newTargets);
    setMaxMoves(newMoves);
    setTargets(newTargets);
    setStatusMessage("Extract all data frags, then reach the portal.");
    setIsTransitioning(false);

    let g = generateGrid(newSize, newBlocks, newTargets);
    setGrid(g);
    setPlayer({ r: 0, c: 0 });
    setMoves(0);
  }, []);

  // Initialize first level
  useEffect(() => {
    scaleDifficulty(level);
  }, [level, scaleDifficulty]);

  const handleRestart = () => {
    setGameOver(false);
    setLevel(1);
    scaleDifficulty(1);
  };

  const move = useCallback((dr, dc) => {
    // Prevent movement if game hasn't started, is over, or is transitioning
    if (!gameStarted || gameOver || isTransitioning) return;

    const activeGrid = gridRef.current;
    const activeSize = sizeRef.current;
    const nextRow = player.r + dr;
    const nextCol = player.c + dc;

    if (
      nextRow < 0 ||
      nextCol < 0 ||
      nextRow >= activeSize ||
      nextCol >= activeSize ||
      activeGrid[nextRow][nextCol] === "X"
    ) {
      return;
    }

    const destination = activeGrid[nextRow][nextCol];
    const pickedTarget = destination === "T";

    const nextMoves = movesRef.current + 1;
    const nextTargets = pickedTarget ? targetsRef.current - 1 : targetsRef.current;

    setMoves(nextMoves);
    setTargets(nextTargets);
    setPlayer({ r: nextRow, c: nextCol });

    if (pickedTarget) {
      setGrid((prevGrid) => {
        const newGrid = cloneGrid(prevGrid);
        newGrid[nextRow][nextCol] = "";
        return newGrid;
      });
      setStatusMessage("Data frag extracted!");
    }

    if (destination === "E" && nextTargets === 0) {
      setStatusMessage("Portal unlocked! Sequence complete.");
      setIsTransitioning(true);
      setTimeout(() => {
        setLevel((currentLevel) => currentLevel + 1);
      }, 300);
      return;
    }

    if (destination === "E" && nextTargets > 0) {
      setStatusMessage("Collect all frags before extraction.");
    }

    if (nextMoves >= maxMovesRef.current && !(destination === "E" && nextTargets === 0)) {
      setStatusMessage("System cycles depleted! Trace detected.");
      setGameOver(true);
    }
  }, [player, isTransitioning, gameStarted, gameOver, scaleDifficulty]);

  // Keyboard controls
  useEffect(() => {
    const handleKey = (e) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
      }
      if (e.key === "ArrowUp") move(-1, 0);
      if (e.key === "ArrowDown") move(1, 0);
      if (e.key === "ArrowLeft") move(0, -1);
      if (e.key === "ArrowRight") move(0, 1);
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [move]);

  if (grid.length === 0) return <div className="loading-screen text-center gold-text blink">LOADING GRID...</div>;

  return (
    <div className="cyber-path-page">
      <div className="arcade-cabinet retro-panel border-cyan">
        
        {/* HUD / TOP CONSOLE */}
        <div className="cabinet-header">
          <h1 className="pixel-title cyan-text glitch-effect text-center mb-4">NEON PATH</h1>
          
          <div className="header-stats">
            <div className="stat-block border-blue">
              <span className="stat-label">SYS_LEVEL</span>
              <span className="stat-value">{level}</span>
            </div>
            <div className="stat-block border-red">
              <span className="stat-label">CYCLES LEFT</span>
              <span className={`stat-value ${maxMoves - moves <= 3 ? 'red-text blink' : ''}`}>
                {maxMoves - moves}
              </span>
            </div>
            <div className="stat-block border-gold">
              <span className="stat-label">DATA FRAGS</span>
              <span className="stat-value gold-text">{targets}</span>
            </div>
          </div>

          <div className="rpg-dialogue-box mt-4">
            <p className="status-line typing-text">&gt; {statusMessage}</p>
          </div>
        </div>

        {/* MAIN GAME GRID */}
        <div className="cyber-grid-container mt-4">
          <div 
            className="cyber-grid" 
            style={{ 
              gridTemplateColumns: `repeat(${size}, 1fr)`,
              gridTemplateRows: `repeat(${size}, 1fr)` 
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isPlayer = player.r === r && player.c === c;
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`cell 
                      ${cell === "X" ? "block firewall" : ""} 
                      ${cell === "S" ? "start-zone" : ""} 
                      ${cell === "E" ? "end-portal" : ""} 
                      ${cell === "T" ? "target-frag" : ""}
                    `}
                  >
                    {cell === "T" && <span className="star-icon blink-fast">✦</span>}
                    {isPlayer && <div className="player-avatar"></div>}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ================= OVERLAY MODALS ================= */}
        
        {/* START GAME MODAL */}
        {!gameStarted && (
          <div className="modal-overlay">
            <div className="in-screen-modal-content border-cyan text-center">
              <h2 className="pixel-title cyan-text glitch-effect mb-4">NEON PATH</h2>
              <div className="rpg-dialogue-box bg-dark mb-4">
                <p className="green-text mb-2">INFILTRATE THE MAINFRAME.</p>
                <p className="gold-text mb-2">EXTRACT THE DATA FRAGS.</p>
                <p className="red-text">ESCAPE BEFORE CYCLES DEPLETE.</p>
              </div>
              <button className="pixel-btn btn-green pulse-btn mx-auto mt-2" onClick={() => setGameStarted(true)}>
                [ INITIATE HACK ]
              </button>
            </div>
          </div>
        )}

        {/* GAME OVER MODAL */}
        {gameOver && (
          <div className="modal-overlay">
            <div className="in-screen-modal-content border-red text-center">
              <h2 className="pixel-title red-text blink mb-2">SYSTEM FAILURE</h2>
              <p className="gold-text mb-4">CYCLES DEPLETED. TRACE DETECTED.</p>
              
              <div className="final-stats-box mb-4">
                <div className="stat-row">
                  <span className="blue-text">MAINFRAME LEVEL REACHED:</span>
                  <span className="cyan-text huge-text">{level}</span>
                </div>
              </div>
              
              <button className="pixel-btn btn-red pulse-btn mx-auto" onClick={handleRestart}>
                [ REBOOT SYSTEM ]
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default PathGame;