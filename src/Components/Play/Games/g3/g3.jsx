// g3.jsx — Neon Path Game
// Maze logic:
//   • Pure recursive-backtracker DFS → perfect maze (spanning tree).
//     This guarantees EXACTLY ONE path from S to E — no loops, no shortcuts.
//   • Dead-end diversions are carved off the true path after generation.
//     They go nowhere; entering one burns a move the player cannot afford.
//   • maxMoves = exact BFS path length through all frags to the exit.
//     No margin is added — every move must be on the correct route.
// ML integration: useDifficulty() silently sets the starting level.

import React, { useState, useEffect, useCallback, useRef } from "react";
import "./g3.css";
import gamesTracker from "../../../../api/gamesTracker";
import auth from "../../../../api/auth";
import { useDifficulty } from "../../../../api/useDifficulty";

// ── Constants ─────────────────────────────────────────────────────────────────
const DIRECTIONS = [[1, 0], [-1, 0], [0, 1], [0, -1]];
const keyOf = (r, c) => `${r},${c}`;

// ── Utility ───────────────────────────────────────────────────────────────────
const cloneGrid = (grid) => grid.map((row) => [...row]);

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ── BFS helpers ───────────────────────────────────────────────────────────────

/** Returns the length (number of steps) of the shortest path, or Infinity if unreachable. */
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

/** Returns the actual shortest path as an array of {r,c} objects, or [] if unreachable. */
function shortestPath(grid, start, end) {
    const size = grid.length;
    const queue = [[start.r, start.c]];
    const visited = new Map();
    visited.set(keyOf(start.r, start.c), null);

    while (queue.length > 0) {
        const [row, col] = queue.shift();
        if (row === end.r && col === end.c) {
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
            const nr = row + dr;
            const nc = col + dc;
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

// ── Perfect Maze Generator (Recursive Backtracker / DFS) ─────────────────────
//
// We work in a (2*logicalSize - 1) × (2*logicalSize - 1) expanded grid where:
//   • even-row, even-col positions → logical cells  (open by default)
//   • positions where exactly one index is odd     → passage walls (carved by DFS)
//   • positions where both indices are odd         → corner walls  (always solid)
//
// The DFS visits every logical cell exactly once, carving the passage wall
// between the current cell and its chosen unvisited neighbour.  Because every
// cell is visited exactly once, the result is a spanning tree — a PERFECT MAZE
// with exactly one path between any two cells.
//
// After generation we carve dead-end diversions: short branches off the true
// path that terminate in a dead cell.  They look like valid corridors but lead
// nowhere, punishing the player for exploring them.

function generatePerfectMaze(logicalSize) {
    const G = 2 * logicalSize - 1;

    // Start with everything walled
    const raw = Array.from({ length: G }, () => Array(G).fill("X"));

    // Open all logical cell positions
    for (let r = 0; r < logicalSize; r++) {
        for (let c = 0; c < logicalSize; c++) {
            raw[r * 2][c * 2] = "";
        }
    }

    // DFS spanning tree — guarantees ONE path between any two cells
    const vis = Array.from({ length: logicalSize }, () => Array(logicalSize).fill(false));
    const stack = [{ r: 0, c: 0 }];
    vis[0][0] = true;

    while (stack.length > 0) {
        const { r, c } = stack[stack.length - 1];
        const neighbours = shuffle(
            DIRECTIONS
                .map(([dr, dc]) => ({ nr: r + dr, nc: c + dc, dr, dc }))
                .filter(({ nr, nc }) =>
                    nr >= 0 && nc >= 0 && nr < logicalSize && nc < logicalSize && !vis[nr][nc]
                )
        );

        if (neighbours.length === 0) {
            stack.pop();
        } else {
            const { nr, nc, dr, dc } = neighbours[0];
            // Carve the wall separating (r,c) from (nr,nc)
            raw[r * 2 + dr][c * 2 + dc] = "";
            vis[nr][nc] = true;
            stack.push({ r: nr, c: nc });
        }
    }

    return { raw, G };
}

// ── Dead-end Diversion Carver ─────────────────────────────────────────────────
//
// Takes the finalised raw grid (with S/E/T already placed) and the set of cells
// on the true path.  For each source on the path it tries to break one wall
// into an adjacent wall cell that is NOT on the path, creating a short corridor
// that dead-ends.  The player cannot tell from a glance whether a corridor leads
// somewhere or not — they must plan their route carefully.

function carveDiversions(raw, G, truePath, logicalSize, count) {
    const pathSet = new Set(truePath.map((p) => keyOf(p.r, p.c)));
    // Shuffle so diversions are spread across the maze, not just at the start
    const sources = shuffle([...truePath.slice(1, -2)]);
    let added = 0;

    for (const { r, c } of sources) {
        if (added >= count) break;
        for (const [dr, dc] of shuffle([...DIRECTIONS])) {
            // The wall cell between (r,c) and the candidate logical cell
            const wr = r + dr;
            const wc = c + dc;
            // The candidate logical cell (two steps in the same direction)
            const cr = r + 2 * dr;
            const cc = c + 2 * dc;

            if (wr < 0 || wc < 0 || wr >= G || wc >= G) continue;
            if (cr < 0 || cc < 0 || cr >= G || cc >= G) continue;
            if (raw[wr][wc] !== "X") continue; // Wall must be intact
            if (raw[cr][cc] !== "X") continue; // Destination must be walled (dead cell)
            if (pathSet.has(keyOf(cr, cc))) continue; // Don't expose path cells

            // Carve: open the wall and the dead-end cell
            raw[wr][wc] = "";
            raw[cr][cc] = "";
            added++;
            break;
        }
    }
}

// ── Place Targets on the True Path ───────────────────────────────────────────
//
// Distributes T (data frag) cells evenly along the true path, skipping start
// and end.  All frags are guaranteed to lie on the correct route, so the player
// must traverse the entire path length to collect them.

function placeTargetsOnPath(grid, truePath, numTargets) {
    const inner = truePath.slice(1, -1);
    const step = Math.max(1, Math.floor(inner.length / (numTargets + 1)));
    let placed = 0;

    for (let i = step; i < inner.length && placed < numTargets; i += step) {
        const { r, c } = inner[i];
        if (grid[r][c] === "") {
            grid[r][c] = "T";
            placed++;
        }
    }

    // Fallback: fill remaining slots from anywhere reachable on the path
    if (placed < numTargets) {
        for (const { r, c } of inner) {
            if (placed >= numTargets) break;
            if (grid[r][c] === "") {
                grid[r][c] = "T";
                placed++;
            }
        }
    }

    return placed;
}

// ── Minimum Moves Calculator (TSP via bitmask DP) ────────────────────────────
//
// Solves the Held–Karp style problem: starting from S, visit all T cells in
// the optimal order, then reach E.  Because frags lie on the true path and the
// maze is a spanning tree, the optimal order is simply left-to-right along the
// path — but we run the full DP to be safe for any future configuration.

function getTargetPositions(grid) {
    const pts = [];
    for (let r = 0; r < grid.length; r++)
        for (let c = 0; c < grid[0].length; c++)
            if (grid[r][c] === "T") pts.push({ r, c });
    return pts;
}

function getMinimumMovesToWin(grid) {
    const size = grid.length;
    const start = { r: 0, c: 0 };
    const exit = { r: size - 1, c: size - 1 };
    const targets = getTargetPositions(grid);

    if (targets.length === 0) {
        const d = shortestPathLength(grid, start, exit);
        return Number.isFinite(d) ? d : null;
    }

    const n = targets.length;
    const s2t = targets.map((t) => shortestPathLength(grid, start, t));
    const t2e = targets.map((t) => shortestPathLength(grid, t, exit));
    const t2t = targets.map((a, i) =>
        targets.map((b, j) => (i === j ? 0 : shortestPathLength(grid, a, b)))
    );

    if (s2t.some((d) => !Number.isFinite(d)) || t2e.some((d) => !Number.isFinite(d)))
        return null;
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

// ── Difficulty Parameters ─────────────────────────────────────────────────────
function getDifficultyParams(level) {
    const logicalSize = Math.min(4 + Math.floor((level - 1) / 2), 9); // 4 → 9
    const numTargets  = Math.min(1 + Math.floor((level - 1) / 2), 5); // 1 → 5
    // Number of dead-end diversions: ramp up with level so navigation gets harder
    const numDiversions = Math.min(4 + level * 2, 18);
    return { logicalSize, numTargets, numDiversions };
}

// ── Main Maze Factory ─────────────────────────────────────────────────────────
//
// Builds a maze and returns it together with the EXACT minimum move count.
// maxMoves is set to this exact value — no margin.  The player must follow the
// correct path without a single wasted step.
//
// We retry up to maxAttempts times to ensure the true path is long enough to
// be interesting (minSteps heuristic scales with level).

function buildMaze(level, maxAttempts = 40) {
    const { logicalSize, numTargets, numDiversions } = getDifficultyParams(level);
    const minSteps = 6 + level * 4; // Minimum acceptable path length

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // 1. Generate a perfect (loop-free) maze
        const { raw, G } = generatePerfectMaze(logicalSize);

        // 2. Mark start and exit before path analysis
        raw[0][0] = "S";
        raw[G - 1][G - 1] = "E";

        // 3. Find the one and only true path
        const truePath = shortestPath(raw, { r: 0, c: 0 }, { r: G - 1, c: G - 1 });
        if (truePath.length < minSteps + 1) continue; // Path too short — retry

        // 4. Place frags along the true path
        placeTargetsOnPath(raw, truePath, numTargets);

        // 5. Carve dead-end diversions off path nodes
        carveDiversions(raw, G, truePath, logicalSize, numDiversions);

        // 6. Compute the exact minimum moves needed (S → all T → E)
        const minMoves = getMinimumMovesToWin(raw);
        if (minMoves === null || minMoves < minSteps) continue;

        const placedTargets = getTargetPositions(raw).length;
        return {
            grid: raw,
            gameSize: G,
            minMoves,           // Exact move budget — no margin
            numTargets: placedTargets,
        };
    }

    // Fallback: accept whatever was last generated, even if shorter than ideal
    const { raw, G } = generatePerfectMaze(logicalSize);
    raw[0][0] = "S";
    raw[G - 1][G - 1] = "E";
    const truePath = shortestPath(raw, { r: 0, c: 0 }, { r: G - 1, c: G - 1 });
    placeTargetsOnPath(raw, truePath, numTargets);
    carveDiversions(raw, G, truePath, logicalSize, numDiversions);
    const minMoves = getMinimumMovesToWin(raw) ?? minSteps;
    const placedTargets = getTargetPositions(raw).length;
    return { grid: raw, gameSize: G, minMoves, numTargets: placedTargets };
}

// ── ML score → starting level ─────────────────────────────────────────────────
function scoreToStartLevel(difficultyScore) {
    const s = Math.max(0, Math.min(1, Number(difficultyScore ?? 0)));
    return 1 + Math.floor(s * 8);
}

// ── Component ─────────────────────────────────────────────────────────────────
function PathGame() {
    const {
        difficulty_score: mlScore,
        loading: mlLoading,
    } = useDifficulty("neon-path");

    const [startLevelApplied, setStartLevelApplied] = useState(false);

    // ── Game state ────────────────────────────────────────────────────────────
    const [level,         setLevel]         = useState(1);
    const [size,          setSize]          = useState(7);
    const [grid,          setGrid]          = useState([]);
    const [player,        setPlayer]        = useState({ r: 0, c: 0 });
    const [moves,         setMoves]         = useState(0);
    const [targets,       setTargets]       = useState(1);
    const [maxMoves,      setMaxMoves]      = useState(20);
    const [statusMessage, setStatusMessage] = useState("Extract all data frags, then reach the portal.");
    const [gameStarted,   setGameStarted]   = useState(false);
    const [gameOver,      setGameOver]      = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [saveStatus,    setSaveStatus]    = useState("");

    // Refs keep stale-closure callbacks in sync with latest state
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

    // ── Apply ML starting level once, before the first game begins ────────────
    useEffect(() => {
        if (!mlLoading && !startLevelApplied && !gameStarted) {
            const startLevel = scoreToStartLevel(mlScore);
            setLevel(startLevel);
            setStartLevelApplied(true);
        }
    }, [mlLoading, mlScore, startLevelApplied, gameStarted]);

    // ── Build a new maze for the current level ────────────────────────────────
    const scaleDifficulty = useCallback((lvl) => {
        const { grid: newGrid, gameSize, minMoves, numTargets } = buildMaze(lvl);

        // maxMoves = exact minimum — zero margin.
        // Every move off the true path will cause failure.
        setSize(gameSize);
        setTargets(numTargets);
        setMaxMoves(minMoves);
        setGrid(newGrid);
        setPlayer({ r: 0, c: 0 });
        setMoves(0);
        setStatusMessage("Extract all data frags, then reach the portal.");
        setIsTransitioning(false);
    }, []);

    useEffect(() => { scaleDifficulty(level); }, [level, scaleDifficulty]);

    // ── Start timer when game begins ──────────────────────────────────────────
    useEffect(() => {
        if (!gameStarted || startTimeRef.current) return;
        startTimeRef.current = Date.now();
    }, [gameStarted]);

    // ── Save run to backend when game ends ────────────────────────────────────
    useEffect(() => {
        if (!gameOver || savedRef.current) return;
        const user = auth.getCurrentUser();
        if (!user) {
            setSaveStatus("Log in to sync this run.");
            savedRef.current = true;
            return;
        }
        savedRef.current = true;
        setSaveStatus("Syncing...");

        const levelReached  = Math.max(1, levelRef.current);
        const remaining     = Math.max(0, maxMovesRef.current - movesRef.current);
        const computedScore = Math.max(0, (levelReached - 1) * 100 + remaining);
        const elapsed       = startTimeRef.current
            ? Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000))
            : 0;

        gamesTracker
            .recordGamePlay({
                email:     user.email,
                gameType:  "neon-path",
                gameName:  "Neon Path",
                score:     computedScore,
                level:     levelReached,
                timePlayed: elapsed,
                date:      new Date().toISOString(),
            })
            .then(() => setSaveStatus("Run synced."))
            .catch(() => setSaveStatus("Sync failed."));
    }, [gameOver]);

    // ── Restart ───────────────────────────────────────────────────────────────
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

    // ── Movement handler ──────────────────────────────────────────────────────
    const move = useCallback(
        (dr, dc) => {
            if (!gameStarted || gameOver || isTransitioning) return;

            const ag  = gridRef.current;
            const as_ = sizeRef.current;
            const nr  = player.r + dr;
            const nc  = player.c + dc;

            // Block out-of-bounds and wall cells
            if (nr < 0 || nc < 0 || nr >= as_ || nc >= as_ || ag[nr][nc] === "X") return;

            const dest   = ag[nr][nc];
            const picked = dest === "T";
            const nm     = movesRef.current + 1;
            const nt     = picked ? targetsRef.current - 1 : targetsRef.current;

            setMoves(nm);
            setTargets(nt);
            setPlayer({ r: nr, c: nc });

            // Collect a data frag
            if (picked) {
                setGrid((prev) => {
                    const g = cloneGrid(prev);
                    g[nr][nc] = "";
                    return g;
                });
                setStatusMessage("Data frag extracted!");
            }

            // Reach the exit with all frags → advance level
            if (dest === "E" && nt === 0) {
                setStatusMessage("Portal unlocked! Sequence complete.");
                setIsTransitioning(true);
                setTimeout(() => setLevel((l) => l + 1), 300);
                return;
            }

            // Reach exit without all frags
            if (dest === "E" && nt > 0) {
                setStatusMessage(`Collect ${nt} more frag${nt > 1 ? "s" : ""} before extraction.`);
            }

            // Move budget exhausted without winning → game over
            if (nm >= maxMovesRef.current && !(dest === "E" && nt === 0)) {
                setStatusMessage("System cycles depleted! Trace detected.");
                setGameOver(true);
            }
        },
        [player, isTransitioning, gameStarted, gameOver]
    );

    // ── Keyboard controls ─────────────────────────────────────────────────────
    useEffect(() => {
        const h = (e) => {
            if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key))
                e.preventDefault();
            if (e.key === "ArrowUp")    move(-1,  0);
            if (e.key === "ArrowDown")  move( 1,  0);
            if (e.key === "ArrowLeft")  move( 0, -1);
            if (e.key === "ArrowRight") move( 0,  1);
        };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [move]);

    if (grid.length === 0)
        return <div className="loading-screen text-center gold-text blink">LOADING GRID...</div>;

    return (
        <div className="cyber-path-page">
            <div className="arcade-cabinet retro-panel border-cyan">

                {/* ── HUD ── */}
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
                        <p className="status-line">&gt; {statusMessage}</p>
                    </div>
                </div>

                {/* ── Maze Grid ── */}
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

                {/* ── Mobile D-Pad ── */}
                <div className="dpad-container mt-4">
                    <div className="dpad-row">
                        <button className="dpad-btn" onClick={() => move(-1, 0)}>▲</button>
                    </div>
                    <div className="dpad-row">
                        <button className="dpad-btn" onClick={() => move(0, -1)}>◄</button>
                        <div className="dpad-center" />
                        <button className="dpad-btn" onClick={() => move(0, 1)}>►</button>
                    </div>
                    <div className="dpad-row">
                        <button className="dpad-btn" onClick={() => move(1, 0)}>▼</button>
                    </div>
                </div>

                {/* ── Start Modal ── */}
                {!gameStarted && (
                    <div className="modal-overlay">
                        <div className="in-screen-modal-content border-cyan text-center">
                            <h2 className="pixel-title cyan-text glitch-effect mb-4">NEON PATH</h2>
                            <div className="rpg-dialogue-box bg-dark mb-4">
                                <p className="green-text mb-2">INFILTRATE THE MAINFRAME.</p>
                                <p className="gold-text mb-2">EXTRACT THE DATA FRAGS.</p>
                                <p className="red-text mb-2">ONE TRUE PATH EXISTS.</p>
                                <p className="red-text">WRONG MOVE = SYSTEM FAIL.</p>
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

                {/* ── Game Over Modal ── */}
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
                                    <div className="stat-row mt-2">
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