// g3.jsx — Neon Path Game
// ML integration: skillScore silently sets the starting level.
// Maze generation: Recursive Backtracker (DFS) guarantees a fully connected,
// winding maze. Targets are placed on the critical path. Minimum path length
// is enforced per difficulty level so the maze is never trivially short.

import React, { useState, useEffect, useCallback, useRef } from "react";
import "./g3.css";
import gamesTracker from "../../../../api/gamesTracker";
import auth from "../../../../api/auth";
import { useDifficulty } from "../../../../api/useDifficulty";

// ── Constants ──────────────────────────────────────────────────────────────────
const DIRECTIONS = [[1,0],[-1,0],[0,1],[0,-1]];
const keyOf = (r, c) => `${r},${c}`;

// ── Grid helpers ───────────────────────────────────────────────────────────────
const cloneGrid = (grid) => grid.map(row => [...row]);

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ── BFS shortest path ──────────────────────────────────────────────────────────
function shortestPathLength(grid, start, end) {
    const size = grid.length;
    const queue = [[start.r, start.c, 0]];
    const visited = new Set([keyOf(start.r, start.c)]);

    while (queue.length > 0) {
        const [row, col, dist] = queue.shift();
        if (row === end.r && col === end.c) return dist;

        for (const [dr, dc] of DIRECTIONS) {
            const nr = row + dr;
            const nc = col + dc;
            const key = keyOf(nr, nc);
            if (
                nr < 0 || nc < 0 || nr >= size || nc >= size ||
                visited.has(key) || grid[nr][nc] === "X"
            ) continue;
            visited.add(key);
            queue.push([nr, nc, dist + 1]);
        }
    }
    return Infinity;
}

// BFS to reconstruct the actual shortest path (list of {r,c})
function shortestPath(grid, start, end) {
    const size = grid.length;
    const queue = [[start.r, start.c]];
    const visited = new Map();
    visited.set(keyOf(start.r, start.c), null);

    while (queue.length > 0) {
        const [row, col] = queue.shift();
        if (row === end.r && col === end.c) {
            // Reconstruct
            const path = [];
            let cur = keyOf(row, col);
            while (cur !== null) {
                const [r, c] = cur.split(",").map(Number);
                path.unshift({ r, c });
                cur = visited.get(cur);
            }
            return path;
        }
        for (const [dr, dc] of DIRECTIONS) {
            const nr = row + dr, nc = col + dc;
            const key = keyOf(nr, nc);
            if (
                nr < 0 || nc < 0 || nr >= size || nc >= size ||
                visited.has(key) || grid[nr][nc] === "X"
            ) continue;
            visited.set(key, keyOf(row, col));
            queue.push([nr, nc]);
        }
    }
    return [];
}

// ── Recursive Backtracker Maze Generator ────────────────────────────────────────
// Works on a "cell grid" of size×size where walls between cells are represented
// by blocking the grid cells in-between in a (2*size-1)×(2*size-1) expanded grid,
// then we collapse it back to a size×size logical grid by carving passages.
//
// Strategy:
//   1. Start with all walls (every cell is "X").
//   2. DFS from (0,0), carving passages — ensures every cell is reachable.
//   3. Optionally add extra connections (loops) to give the player route choices.
//   4. Place T (target) fragments along or near the critical path.
//   5. Verify the critical path length meets minSteps before accepting.

function generateMaze(logicalSize, numTargets, minSteps, extraLoopFraction = 0.15) {
    // We work in a (2*logicalSize - 1) × (2*logicalSize - 1) grid where
    // even-indexed rows/cols are cells, odd-indexed are potential walls.
    const G = 2 * logicalSize - 1;

    // Initialise everything as wall
    const raw = Array.from({ length: G }, () => Array(G).fill("X"));

    // Mark all logical cell positions as open (cells at even,even coords)
    for (let r = 0; r < logicalSize; r++) {
        for (let c = 0; c < logicalSize; c++) {
            raw[r * 2][c * 2] = "";
        }
    }

    // DFS recursive backtracker
    const visited = Array.from({ length: logicalSize }, () => Array(logicalSize).fill(false));
    const stack = [{ r: 0, c: 0 }];
    visited[0][0] = true;

    while (stack.length > 0) {
        const { r, c } = stack[stack.length - 1];
        const neighbors = shuffle(
            DIRECTIONS
                .map(([dr, dc]) => ({ nr: r + dr, nc: c + dc, dr, dc }))
                .filter(({ nr, nc }) =>
                    nr >= 0 && nc >= 0 && nr < logicalSize && nc < logicalSize && !visited[nr][nc]
                )
        );

        if (neighbors.length === 0) {
            stack.pop();
        } else {
            const { nr, nc, dr, dc } = neighbors[0];
            // Carve the wall between (r,c) and (nr,nc)
            raw[r * 2 + dr][c * 2 + dc] = "";
            visited[nr][nc] = true;
            stack.push({ r: nr, c: nc });
        }
    }

    // Add extra loops: randomly open some remaining walls to create shortcuts
    const wallCells = [];
    for (let r = 0; r < G; r++) {
        for (let c = 0; c < G; c++) {
            // Walls between cells are at positions where exactly one of r,c is odd
            if ((r % 2 === 1) !== (c % 2 === 1) && raw[r][c] === "X") {
                wallCells.push([r, c]);
            }
        }
    }
    shuffle(wallCells);
    const loopsToAdd = Math.floor(wallCells.length * extraLoopFraction);
    for (let i = 0; i < loopsToAdd; i++) {
        const [r, c] = wallCells[i];
        raw[r][c] = "";
    }

    // Collapse the raw (2*size-1)² grid into a logical size×size grid
    // Logical cell (r,c) maps to raw[r*2][c*2]
    // The passage between logical (r,c)→(r+1,c) is raw[r*2+1][c*2]
    // We represent walls in the logical grid differently:
    //   In our game grid (size×size), an "X" cell is just a blocked cell.
    //   We simulate walls by treating the raw grid as our actual game grid
    //   (so the game runs on a (2*logicalSize-1)² board, not logicalSize²).
    //   This gives natural corridors and walls that look like a real maze.

    // Actually: let's use the raw grid directly as the game grid.
    // Start = raw[0][0], End = raw[G-1][G-1]
    raw[0][0] = "S";
    raw[G - 1][G - 1] = "E";

    return { grid: raw, gameSize: G };
}

// ── Place targets along critical path ─────────────────────────────────────────
function placeTargetsOnPath(grid, numTargets) {
    const size = grid.length;
    const start = { r: 0, c: 0 };
    const end   = { r: size - 1, c: size - 1 };

    const path = shortestPath(grid, start, end);
    if (path.length < 3) return; // Not enough room

    // Distribute targets evenly along path (skip start and end)
    const inner = path.slice(1, -1);
    const step = Math.max(1, Math.floor(inner.length / (numTargets + 1)));
    let placed = 0;

    for (let i = step; i < inner.length && placed < numTargets; i += step) {
        const { r, c } = inner[i];
        if (grid[r][c] === "") {
            grid[r][c] = "T";
            placed++;
        }
    }

    // If we still need more, place them anywhere reachable
    if (placed < numTargets) {
        for (let r = 0; r < size && placed < numTargets; r++) {
            for (let c = 0; c < size && placed < numTargets; c++) {
                if (grid[r][c] === "") {
                    grid[r][c] = "T";
                    placed++;
                }
            }
        }
    }
}

// ── Minimum moves calculation (TSP over targets via BFS) ──────────────────────
function getTargetPositions(grid) {
    const points = [];
    for (let r = 0; r < grid.length; r++)
        for (let c = 0; c < grid[0].length; c++)
            if (grid[r][c] === "T") points.push({ r, c });
    return points;
}

function getMinimumMovesToWin(grid) {
    const size = grid.length;
    const start = { r: 0, c: 0 };
    const exit  = { r: size - 1, c: size - 1 };
    const targets = getTargetPositions(grid);

    if (targets.length === 0) {
        const d = shortestPathLength(grid, start, exit);
        return Number.isFinite(d) ? d : null;
    }

    const n = targets.length;
    const s2t = targets.map(t => shortestPathLength(grid, start, t));
    const t2e = targets.map(t => shortestPathLength(grid, t, exit));
    const t2t = targets.map((a, i) => targets.map((b, j) =>
        i === j ? 0 : shortestPathLength(grid, a, b)
    ));

    if (s2t.some(d => !Number.isFinite(d)) || t2e.some(d => !Number.isFinite(d))) return null;
    for (let i = 0; i < n; i++)
        for (let j = 0; j < n; j++)
            if (i !== j && !Number.isFinite(t2t[i][j])) return null;

    const allMask = (1 << n) - 1;
    const dp = Array.from({ length: 1 << n }, () => Array(n).fill(Infinity));
    for (let i = 0; i < n; i++) dp[1 << i][i] = s2t[i];

    for (let mask = 1; mask <= allMask; mask++) {
        for (let last = 0; last < n; last++) {
            const base = dp[mask][last];
            if (!Number.isFinite(base)) continue;
            for (let next = 0; next < n; next++) {
                if (mask & (1 << next)) continue;
                const cand = base + t2t[last][next];
                const nm = mask | (1 << next);
                if (cand < dp[nm][next]) dp[nm][next] = cand;
            }
        }
    }

    let best = Infinity;
    for (let last = 0; last < n; last++) {
        const cand = dp[allMask][last] + t2e[last];
        if (cand < best) best = cand;
    }
    return Number.isFinite(best) ? best : null;
}

// ── Difficulty → maze params ───────────────────────────────────────────────────
// Returns { logicalSize, numTargets, minSteps, extraLoops }
// logicalSize: the logical NxN cell grid (game grid will be (2N-1)×(2N-1))
// minSteps:    the guaranteed minimum BFS path steps before accepting the maze
function getDifficultyParams(level) {
    // Level 1–3: small, easy maze
    // Level 4–6: medium maze, more winding
    // Level 7+:  large, complex maze
    const logicalSize = Math.min(4 + Math.floor((level - 1) / 2), 9); // 4→9
    const numTargets  = Math.min(1 + Math.floor((level - 1) / 2), 5); // 1→5
    const minSteps    = 6 + level * 4;   // L1=10, L5=26, L9=42, etc.
    // Lower extra loops → fewer shortcuts → harder navigation
    const extraLoops  = Math.max(0.05, 0.25 - level * 0.02);
    return { logicalSize, numTargets, minSteps, extraLoops };
}

// ── Main grid factory ─────────────────────────────────────────────────────────
// Attempts to build a maze that satisfies minSteps. Retries up to maxAttempts.
function buildMaze(level, maxAttempts = 40) {
    const { logicalSize, numTargets, minSteps, extraLoops } = getDifficultyParams(level);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        const { grid, gameSize } = generateMaze(logicalSize, numTargets, minSteps, extraLoops);
        placeTargetsOnPath(grid, numTargets);

        const minMoves = getMinimumMovesToWin(grid);
        if (minMoves !== null && minMoves >= minSteps) {
            return { grid, gameSize, minMoves, numTargets };
        }
    }

    // Fallback: accept the last generated maze even if shorter than ideal
    const { grid, gameSize } = generateMaze(logicalSize, numTargets, minSteps, extraLoops);
    placeTargetsOnPath(grid, numTargets);
    const minMoves = getMinimumMovesToWin(grid) ?? minSteps;
    return { grid, gameSize, minMoves, numTargets };
}

// ── ML score → starting level ──────────────────────────────────────────────────
function scoreToStartLevel(difficultyScore) {
    const s = Math.max(0, Math.min(1, Number(difficultyScore ?? 0)));
    return 1 + Math.floor(s * 8);
}

// ── Component ──────────────────────────────────────────────────────────────────
function PathGame() {
    const {
        difficulty_score: mlScore,
        loading: mlLoading,
    } = useDifficulty('neon-path');

    const [startLevelApplied, setStartLevelApplied] = useState(false);

    // ── Game state ─────────────────────────────────────────────────────────────
    const [level, setLevel]               = useState(1);
    const [size, setSize]                 = useState(7);       // actual game grid size
    const [targetsTotal, setTargetsTotal] = useState(1);
    const [grid, setGrid]                 = useState([]);
    const [player, setPlayer]             = useState({ r: 0, c: 0 });
    const [moves, setMoves]               = useState(0);
    const [targets, setTargets]           = useState(1);
    const [maxMoves, setMaxMoves]         = useState(20);
    const [statusMessage, setStatusMessage] = useState("Extract all data frags, then reach the portal.");
    const [gameStarted, setGameStarted]   = useState(false);
    const [gameOver, setGameOver]         = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [saveStatus, setSaveStatus]     = useState("");

    const movesRef     = useRef(moves);
    const targetsRef   = useRef(targets);
    const levelRef     = useRef(level);
    const maxMovesRef  = useRef(maxMoves);
    const gridRef      = useRef(grid);
    const sizeRef      = useRef(size);
    const startTimeRef = useRef(null);
    const savedRef     = useRef(false);

    useEffect(() => { movesRef.current    = moves;    }, [moves]);
    useEffect(() => { targetsRef.current  = targets;  }, [targets]);
    useEffect(() => { levelRef.current    = level;    }, [level]);
    useEffect(() => { maxMovesRef.current = maxMoves; }, [maxMoves]);
    useEffect(() => { gridRef.current     = grid;     }, [grid]);
    useEffect(() => { sizeRef.current     = size;     }, [size]);

    // Apply ML starting level once (before first game)
    useEffect(() => {
        if (!mlLoading && !startLevelApplied && !gameStarted) {
            const startLevel = scoreToStartLevel(mlScore);
            setLevel(startLevel);
            setStartLevelApplied(true);
        }
    }, [mlLoading, mlScore, startLevelApplied, gameStarted]);

    // ── Difficulty scaler ──────────────────────────────────────────────────────
    const scaleDifficulty = useCallback((lvl) => {
        const { grid: newGrid, gameSize, minMoves, numTargets } = buildMaze(lvl);

        // Give the player minMoves + a generous margin that shrinks with level
        const margin  = Math.max(3, 12 - Math.floor(lvl / 2));
        const allowed = minMoves + margin;

        setSize(gameSize);
        setTargetsTotal(numTargets);
        setTargets(numTargets);
        setMaxMoves(allowed);
        setGrid(newGrid);
        setPlayer({ r: 0, c: 0 });
        setMoves(0);
        setStatusMessage("Extract all data frags, then reach the portal.");
        setIsTransitioning(false);
    }, []);

    useEffect(() => { scaleDifficulty(level); }, [level, scaleDifficulty]);

    // ── Restart ────────────────────────────────────────────────────────────────
    const handleRestart = () => {
        setGameOver(false);
        setSaveStatus("");
        savedRef.current = false;
        startTimeRef.current = null;
        setStartLevelApplied(false);
        setGameStarted(false);
        setLevel(1);
        scaleDifficulty(1);
    };

    useEffect(() => {
        if (!gameStarted || startTimeRef.current) return;
        startTimeRef.current = Date.now();
    }, [gameStarted]);

    // ── Save on game over ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!gameOver || savedRef.current) return;
        const user = auth.getCurrentUser();
        if (!user) { setSaveStatus("Log in to sync this run."); savedRef.current = true; return; }
        savedRef.current = true;
        setSaveStatus("Syncing...");
        const levelReached  = Math.max(1, levelRef.current);
        const remaining     = Math.max(0, maxMovesRef.current - movesRef.current);
        const computedScore = Math.max(0, (levelReached - 1) * 100 + remaining);
        const elapsed       = startTimeRef.current
            ? Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000)) : 0;
        gamesTracker.recordGamePlay({
            email: user.email, gameType: "neon-path", gameName: "Neon Path",
            score: computedScore, level: levelReached, timePlayed: elapsed,
            date: new Date().toISOString(),
        })
        .then(()  => setSaveStatus("Run synced."))
        .catch(() => setSaveStatus("Sync failed."));
    }, [gameOver]);

    // ── Movement ───────────────────────────────────────────────────────────────
    const move = useCallback((dr, dc) => {
        if (!gameStarted || gameOver || isTransitioning) return;
        const ag  = gridRef.current;
        const as_ = sizeRef.current;
        const nr  = player.r + dr;
        const nc  = player.c + dc;
        if (nr < 0 || nc < 0 || nr >= as_ || nc >= as_ || ag[nr][nc] === "X") return;

        const dest   = ag[nr][nc];
        const picked = dest === "T";
        const nm     = movesRef.current + 1;
        const nt     = picked ? targetsRef.current - 1 : targetsRef.current;

        setMoves(nm);
        setTargets(nt);
        setPlayer({ r: nr, c: nc });

        if (picked) {
            setGrid(p => { const g = cloneGrid(p); g[nr][nc] = ""; return g; });
            setStatusMessage("Data frag extracted!");
        }

        if (dest === "E" && nt === 0) {
            setStatusMessage("Portal unlocked! Sequence complete.");
            setIsTransitioning(true);
            setTimeout(() => setLevel(l => l + 1), 300);
            return;
        }

        if (dest === "E" && nt > 0) {
            setStatusMessage(`Collect ${nt} more frag${nt > 1 ? "s" : ""} before extraction.`);
        }

        if (nm >= maxMovesRef.current && !(dest === "E" && nt === 0)) {
            setStatusMessage("System cycles depleted! Trace detected.");
            setGameOver(true);
        }
    }, [player, isTransitioning, gameStarted, gameOver]);

    useEffect(() => {
        const h = (e) => {
            if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
            if (e.key === "ArrowUp")    move(-1,  0);
            if (e.key === "ArrowDown")  move( 1,  0);
            if (e.key === "ArrowLeft")  move( 0, -1);
            if (e.key === "ArrowRight") move( 0,  1);
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [move]);

    if (grid.length === 0) return <div className="loading-screen text-center gold-text blink">LOADING GRID...</div>;

    return (
        <div className="cyber-path-page">
            <div className="arcade-cabinet retro-panel border-cyan">
                <div className="cabinet-header">
                    <h1 className="pixel-title cyan-text glitch-effect text-center mb-4">NEON PATH</h1>
                    <div className="header-stats">
                        <div className="stat-block border-blue">
                            <span className="stat-label">SYS_LEVEL</span>
                            <span className="stat-value">{level}</span>
                        </div>
                        <div className="stat-block border-red">
                            <span className="stat-label">CYCLES LEFT</span>
                            <span className={`stat-value ${maxMoves - moves <= 3 ? "red-text blink" : ""}`}>
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

                <div className="cyber-grid-container mt-4">
                    <div
                        className="cyber-grid"
                        style={{
                            gridTemplateColumns: `repeat(${size}, 1fr)`,
                            gridTemplateRows:    `repeat(${size}, 1fr)`,
                        }}
                    >
                        {grid.map((row, r) =>
                            row.map((cell, c) => {
                                const isP = player.r === r && player.c === c;
                                return (
                                    <div
                                        key={`${r}-${c}`}
                                        className={[
                                            "cell",
                                            cell === "X" ? "block firewall" : "",
                                            cell === "S" ? "start-zone"     : "",
                                            cell === "E" ? "end-portal"     : "",
                                            cell === "T" ? "target-frag"    : "",
                                        ].join(" ").trim()}
                                    >
                                        {cell === "T" && <span className="star-icon blink-fast">✦</span>}
                                        {isP && <div className="player-avatar" />}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {!gameStarted && (
                    <div className="modal-overlay">
                        <div className="in-screen-modal-content border-cyan text-center">
                            <h2 className="pixel-title cyan-text glitch-effect mb-4">NEON PATH</h2>
                            <div className="rpg-dialogue-box bg-dark mb-4">
                                <p className="green-text mb-2">INFILTRATE THE MAINFRAME.</p>
                                <p className="gold-text mb-2">EXTRACT THE DATA FRAGS.</p>
                                <p className="red-text">ESCAPE BEFORE CYCLES DEPLETE.</p>
                            </div>
                            <button
                                className="pixel-btn btn-green pulse-btn mx-auto mt-2"
                                onClick={() => setGameStarted(true)}
                            >
                                [ INITIATE HACK ]
                            </button>
                        </div>
                    </div>
                )}

                {gameOver && (
                    <div className="modal-overlay">
                        <div className="in-screen-modal-content border-red text-center">
                            <h2 className="pixel-title red-text blink mb-2">SYSTEM FAILURE</h2>
                            <p className="gold-text mb-4">CYCLES DEPLETED. TRACE DETECTED.</p>
                            <div className="final-stats-box mb-4">
                                <div className="stat-row">
                                    <span className="blue-text">LEVEL REACHED:</span>
                                    <span className="cyan-text huge-text">{level}</span>
                                </div>
                                {saveStatus && (
                                    <div className="stat-row">
                                        <span className="gold-text">{saveStatus}</span>
                                    </div>
                                )}
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
