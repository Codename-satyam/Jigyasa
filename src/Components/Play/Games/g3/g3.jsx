// g3.jsx — Neon Path Game
// ML integration: skillScore silently sets the starting level.
// No badge, no hint — player just experiences appropriate challenge from level 1+.

import React, { useState, useEffect, useCallback, useRef } from "react";
import "./g3.css";
import gamesTracker from "../../../../api/gamesTracker";
import auth from "../../../../api/auth";
import { useDifficulty } from "../../../../api/useDifficulty";

// ── Grid helpers ──────────────────────────────────────────────────────────────
const cloneGrid = (grid) => grid.map(row => [...row]);
const DIRECTIONS = [[1,0],[-1,0],[0,1],[0,-1]];

const keyOf = (r, c) => `${r},${c}`;

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
                nr < 0 ||
                nc < 0 ||
                nr >= size ||
                nc >= size ||
                visited.has(key) ||
                grid[nr][nc] === "X"
            ) {
                continue;
            }
            visited.add(key);
            queue.push([nr, nc, dist + 1]);
        }
    }

    return Infinity;
}

function getTargetPositions(grid) {
    const points = [];
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid.length; c++) {
            if (grid[r][c] === "T") points.push({ r, c });
        }
    }
    return points;
}

function getMinimumMovesToWin(grid) {
    const size = grid.length;
    const start = { r: 0, c: 0 };
    const exit = { r: size - 1, c: size - 1 };
    const targets = getTargetPositions(grid);

    if (targets.length === 0) {
        const direct = shortestPathLength(grid, start, exit);
        return Number.isFinite(direct) ? direct : null;
    }

    const n = targets.length;
    const startToTarget = new Array(n).fill(Infinity);
    const targetToExit = new Array(n).fill(Infinity);
    const dist = Array(n)
        .fill(null)
        .map(() => Array(n).fill(Infinity));

    for (let i = 0; i < n; i++) {
        startToTarget[i] = shortestPathLength(grid, start, targets[i]);
        targetToExit[i] = shortestPathLength(grid, targets[i], exit);
        for (let j = i + 1; j < n; j++) {
            const d = shortestPathLength(grid, targets[i], targets[j]);
            dist[i][j] = d;
            dist[j][i] = d;
        }
    }

    if (startToTarget.some((d) => !Number.isFinite(d)) || targetToExit.some((d) => !Number.isFinite(d))) {
        return null;
    }

    for (let i = 0; i < n; i++) {
        for (let j = 0; j < n; j++) {
            if (i !== j && !Number.isFinite(dist[i][j])) return null;
        }
    }

    const allMask = (1 << n) - 1;
    const dp = Array(1 << n)
        .fill(null)
        .map(() => Array(n).fill(Infinity));

    for (let i = 0; i < n; i++) {
        dp[1 << i][i] = startToTarget[i];
    }

    for (let mask = 1; mask <= allMask; mask++) {
        for (let last = 0; last < n; last++) {
            const base = dp[mask][last];
            if (!Number.isFinite(base)) continue;

            for (let next = 0; next < n; next++) {
                if (mask & (1 << next)) continue;
                const cand = base + dist[last][next];
                const nextMask = mask | (1 << next);
                if (cand < dp[nextMask][next]) dp[nextMask][next] = cand;
            }
        }
    }

    let best = Infinity;
    for (let last = 0; last < n; last++) {
        const cand = dp[allMask][last] + targetToExit[last];
        if (cand < best) best = cand;
    }

    return Number.isFinite(best) ? best : null;
}

function collectReachableCells(grid) {
    const size = grid.length;
    const queue = [[0, 0]];
    const visited = new Set(["0,0"]);
    while (queue.length > 0) {
        const [row, col] = queue.shift();
        for (const [dr, dc] of DIRECTIONS) {
            const nr = row + dr, nc = col + dc;
            const key = `${nr},${nc}`;
            if (nr < 0 || nc < 0 || nr >= size || nc >= size || visited.has(key) || grid[nr][nc] === "X") continue;
            visited.add(key);
            queue.push([nr, nc]);
        }
    }
    return visited;
}

function isPlayableGrid(grid, targetsExpected) {
    const size = grid.length;
    const reachable = collectReachableCells(grid);
    if (!reachable.has(`${size-1},${size-1}`)) return false;
    let count = 0;
    for (let r = 0; r < size; r++)
        for (let c = 0; c < size; c++)
            if (grid[r][c] === "T" && reachable.has(`${r},${c}`)) count++;
    return count === targetsExpected;
}

const generateGrid = (size, blocks, targets) => {
    const total = size * size;
    const maxT  = Math.max(1, Math.min(targets, total - 3));
    const maxB  = Math.max(1, Math.min(blocks,  total - 2 - maxT));
    for (let attempt = 0; attempt < 80; attempt++) {
        const grid = Array(size).fill().map(() => Array(size).fill(""));
        grid[0][0] = "S"; grid[size-1][size-1] = "E";
        let pb = 0; while (pb < maxB) { const r = Math.floor(Math.random()*size), c = Math.floor(Math.random()*size); if (grid[r][c]==="") { grid[r][c]="X"; pb++; } }
        let pt = 0; while (pt < maxT) { const r = Math.floor(Math.random()*size), c = Math.floor(Math.random()*size); if (grid[r][c]==="") { grid[r][c]="T"; pt++; } }
        if (isPlayableGrid(grid, maxT)) return grid;
    }
    const fb = Array(size).fill().map(() => Array(size).fill(""));
    fb[0][0] = "S"; fb[size-1][size-1] = "E";
    let tp = 0;
    for (let i = 1; i < size-1 && tp < maxT; i++) { fb[i][Math.min(i,size-2)] = "T"; tp++; }
    return fb;
};

/**
 * Map ML difficulty_score (0–1) → starting level.
 * Uses continuous score for finer-grained placement.
 *   0.00–0.33 → level 1   (easy)
 *   0.34–0.50 → level 2
 *   0.51–0.66 → level 4
 *   0.67–0.80 → level 6
 *   0.81–1.00 → level 9
 */
function scoreToStartLevel(difficultyScore) {
    const safeScore = Math.max(0, Math.min(1, Number(difficultyScore ?? 0)));
    return 1 + Math.floor(safeScore * 8);
}

// ── Component ─────────────────────────────────────────────────────────────────
function PathGame() {
    // ── ML difficulty (silent) ────────────────────────────────────────────────
    const {
        difficulty_score: mlScore,
        loading: mlLoading,
    } = useDifficulty('neon-path');

    const [startLevelApplied, setStartLevelApplied] = useState(false);

    // ── Game state ────────────────────────────────────────────────────────────
    const [level, setLevel]               = useState(1);
    const [size, setSize]                 = useState(5);
    const [targetsTotal, setTargetsTotal] = useState(2);
    const [grid, setGrid]                 = useState([]);
    const [player, setPlayer]             = useState({ r: 0, c: 0 });
    const [moves, setMoves]               = useState(0);
    const [targets, setTargets]           = useState(2);
    const [maxMoves, setMaxMoves]         = useState(12);
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

    useEffect(() => { movesRef.current   = moves;    }, [moves]);
    useEffect(() => { targetsRef.current = targets;  }, [targets]);
    useEffect(() => { levelRef.current   = level;    }, [level]);
    useEffect(() => { maxMovesRef.current = maxMoves; }, [maxMoves]);
    useEffect(() => { gridRef.current    = grid;     }, [grid]);
    useEffect(() => { sizeRef.current    = size;     }, [size]);

    // Apply ML starting level once (before first game starts)
    useEffect(() => {
        if (!mlLoading && !startLevelApplied && !gameStarted) {
            const startLevel = scoreToStartLevel(mlScore);
            setLevel(startLevel);
            setStartLevelApplied(true);
        }
    }, [mlLoading, mlScore, startLevelApplied, gameStarted]);

    // ── Difficulty scaler ─────────────────────────────────────────────────────
    const scaleDifficulty = useCallback((lvl) => {
        let newSize    = Math.min(5 + Math.floor((lvl + 1) / 2), 10);
        let newBlocks  = 4 + lvl * 2;
        let newTargets = Math.min(2 + Math.floor((lvl + 1) / 2), 6);
        const safe = Math.max(1, newSize * newSize - 2 - newTargets);
        newBlocks = Math.min(newBlocks, safe);

        let generatedGrid = null;
        let minMovesToWin = null;
        for (let attempt = 0; attempt < 25; attempt++) {
            const candidate = generateGrid(newSize, newBlocks, newTargets);
            const required = getMinimumMovesToWin(candidate);
            if (required !== null) {
                generatedGrid = candidate;
                minMovesToWin = required;
                break;
            }
        }

        if (!generatedGrid) {
            generatedGrid = generateGrid(newSize, newBlocks, newTargets);
            minMovesToWin = Math.max(8, newSize + newTargets + 2);
        }

        const margin = Math.max(1, Math.min(5, 5 - Math.floor(lvl / 3)));
        const newMoves = minMovesToWin + margin;

        setSize(newSize); setTargetsTotal(newTargets);
        setMaxMoves(newMoves); setTargets(newTargets);
        setStatusMessage("Extract all data frags, then reach the portal.");
        setIsTransitioning(false);
        setGrid(generatedGrid);
        setPlayer({ r: 0, c: 0 });
        setMoves(0);
    }, []);

    useEffect(() => { scaleDifficulty(level); }, [level, scaleDifficulty]);

    // ── Restart ───────────────────────────────────────────────────────────────
    const handleRestart = () => {
        setGameOver(false); setSaveStatus("");
        savedRef.current = false; startTimeRef.current = null;
        setStartLevelApplied(false);   // re-run ML check on next game
        setGameStarted(false);
        setLevel(1); scaleDifficulty(1);
    };

    useEffect(() => {
        if (!gameStarted || startTimeRef.current) return;
        startTimeRef.current = Date.now();
    }, [gameStarted]);

    // ── Save on game over ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!gameOver || savedRef.current) return;
        const user = auth.getCurrentUser();
        if (!user) { setSaveStatus("Log in to sync this run."); savedRef.current = true; return; }
        savedRef.current = true; setSaveStatus("Syncing...");
        const levelReached    = Math.max(1, levelRef.current);
        const remaining       = Math.max(0, maxMovesRef.current - movesRef.current);
        const computedScore   = Math.max(0, (levelReached-1)*100 + remaining);
        const elapsed         = startTimeRef.current
            ? Math.max(0, Math.floor((Date.now()-startTimeRef.current)/1000)) : 0;
        gamesTracker.recordGamePlay({
            email: user.email, gameType: "neon-path", gameName: "Neon Path",
            score: computedScore, level: levelReached, timePlayed: elapsed,
            date: new Date().toISOString(),
        })
        .then(()  => setSaveStatus("Run synced."))
        .catch(() => setSaveStatus("Sync failed."));
    }, [gameOver]);

    // ── Movement ──────────────────────────────────────────────────────────────
    const move = useCallback((dr, dc) => {
        if (!gameStarted || gameOver || isTransitioning) return;
        const ag = gridRef.current, as_ = sizeRef.current;
        const nr = player.r + dr, nc = player.c + dc;
        if (nr<0||nc<0||nr>=as_||nc>=as_||ag[nr][nc]==="X") return;
        const dest = ag[nr][nc];
        const picked = dest==="T";
        const nm = movesRef.current+1;
        const nt = picked ? targetsRef.current-1 : targetsRef.current;
        setMoves(nm); setTargets(nt); setPlayer({ r: nr, c: nc });
        if (picked) {
            setGrid(p => { const g=cloneGrid(p); g[nr][nc]=""; return g; });
            setStatusMessage("Data frag extracted!");
        }
        if (dest==="E" && nt===0) {
            setStatusMessage("Portal unlocked! Sequence complete.");
            setIsTransitioning(true);
            setTimeout(() => setLevel(l => l+1), 300);
            return;
        }
        if (dest==="E" && nt>0) setStatusMessage("Collect all frags before extraction.");
        if (nm>=maxMovesRef.current && !(dest==="E"&&nt===0)) {
            setStatusMessage("System cycles depleted! Trace detected.");
            setGameOver(true);
        }
    }, [player, isTransitioning, gameStarted, gameOver]);

    useEffect(() => {
        const h = (e) => {
            if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.key)) e.preventDefault();
            if (e.key==="ArrowUp")    move(-1, 0);
            if (e.key==="ArrowDown")  move(1,  0);
            if (e.key==="ArrowLeft")  move(0, -1);
            if (e.key==="ArrowRight") move(0,  1);
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [move]);

    if (grid.length===0) return <div className="loading-screen text-center gold-text blink">LOADING GRID...</div>;

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
                            <span className={`stat-value ${maxMoves-moves<=3?'red-text blink':''}`}>{maxMoves-moves}</span>
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
                    <div className="cyber-grid" style={{ gridTemplateColumns:`repeat(${size},1fr)`, gridTemplateRows:`repeat(${size},1fr)` }}>
                        {grid.map((row,r) => row.map((cell,c) => {
                            const isP = player.r===r && player.c===c;
                            return (
                                <div key={`${r}-${c}`} className={`cell ${cell==="X"?"block firewall":""} ${cell==="S"?"start-zone":""} ${cell==="E"?"end-portal":""} ${cell==="T"?"target-frag":""}`}>
                                    {cell==="T" && <span className="star-icon blink-fast">✦</span>}
                                    {isP && <div className="player-avatar"></div>}
                                </div>
                            );
                        }))}
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
                            <button className="pixel-btn btn-green pulse-btn mx-auto mt-2" onClick={() => setGameStarted(true)}>
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
                                {saveStatus && <div className="stat-row"><span className="gold-text">{saveStatus}</span></div>}
                            </div>
                            <button className="pixel-btn btn-red pulse-btn mx-auto" onClick={handleRestart}>[ REBOOT SYSTEM ]</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default PathGame;
