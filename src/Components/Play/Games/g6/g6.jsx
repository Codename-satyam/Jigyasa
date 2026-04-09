import { useState, useEffect, useRef, useCallback } from "react";
import "./g6.css";
import knight from "../../../../Assets/g6/knight.png";
import knightdamage from "../../../../Assets/g6/knight-damage.png";
import knightattack from "../../../../Assets/g6/knight-attack.png";
import slash from "../../../../Assets/g6/attack.mp3";
import damage from "../../../../Assets/g6/damage.mp3";
import victory from "../../../../Assets/g6/victory.mp3";
import gameend from "../../../../Assets/g6/game-end.png";
import { riddles } from "./riddles";
import { enemyPool } from "./enemyPool";

// ─── Shuffle riddles so each game feels fresh ─────────────────────────────────
function shuffleArray(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ─── Fuzzy answer checker: strips punctuation + articles, trims whitespace ────
function normalize(str) {
    return str
        .toLowerCase()
        .replace(/^(a|an|the)\s+/i, "")
        .replace(/[^a-z0-9\s]/g, "")
        .trim();
}
function isCorrectAnswer(input, answer) {
    const ni = normalize(input);
    const na = normalize(answer);
    if (ni === na) return true;
    // allow partial match if input contains the core answer
    if (na.split(" ").every(word => ni.includes(word))) return true;
    return false;
}

// ─── Hint: reveal answer progressively, hiding middle chars ──────────────────
function buildHint(answer, reveal) {
    const words = answer.split(" ");
    return words.map(word => {
        const chars = word.split("");
        return chars
            .map((ch, i) => (i < reveal || i === chars.length - 1 ? ch : "_"))
            .join("");
    }).join(" ");
}

// ─── Enemy factory ────────────────────────────────────────────────────────────
const getEnemy = (level, playerMaxHp = 100) => {
    if (level === 4 || level === 8) {
        const adminData = enemyPool.find(e => e.name === "ADMIN");
        if (adminData) {
            const maxHp = adminData.baseHp + adminData.hpPerLevel * (level - 1);
            return { ...adminData, level, maxHp, hp: maxHp, damage: adminData.baseDamage + 5 * (level - 1) };
        }
    }
    const pool = enemyPool.filter(e => e.name !== "ADMIN" && e.baseHp + e.hpPerLevel * (level - 1) <= playerMaxHp * 1.5);
    const enemyData = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : enemyPool[0];
    const maxHp = enemyData.baseHp + enemyData.hpPerLevel * (level - 1);
    return { ...enemyData, level, maxHp, hp: maxHp, damage: enemyData.baseDamage + 3 * (level - 1) };
};

// ─── Constants ────────────────────────────────────────────────────────────────
const BASE_ATTACK_DAMAGE  = 22;
const POWER_DAMAGE        = 45;
const POWER_MANA_COST     = 20;
const MANA_REGEN_PER_TURN = 5;      // mana restored on correct answer
const XP_PER_KILL         = 40;
const COMBO_CAP           = 5;      // max combo multiplier tier
const HINT_COST_MANA      = 15;

function RiddleRPG() {
    /* ── Audio ──────────────────────────────────────────────────────────── */
    const attackSoundRef  = useRef(new Audio(slash));
    const damageSoundRef  = useRef(new Audio(damage));
    const victorySoundRef = useRef(new Audio(victory));

    /* ── Riddle deck (shuffled once per game) ───────────────────────────── */
    const [deck, setDeck]         = useState(() => shuffleArray(riddles));
    const [deckIdx, setDeckIdx]   = useState(0);

    const currentRiddle = deck[deckIdx % deck.length];

    const advanceRiddle = useCallback(() => {
        setDeckIdx(i => i + 1);
        setHintLevel(0);
        setInput("");
    }, []);

    /* ── Player state ───────────────────────────────────────────────────── */
    const [player, setPlayer] = useState({
        level: 1, xp: 0, xpToLevel: 50,
        maxHp: 120, hp: 120, maxMana: 60, mana: 60,
    });

    /* ── Enemy state ────────────────────────────────────────────────────── */
    const [enemy, setEnemy] = useState(() => getEnemy(1, 120));

    /* ── Combat UI state ────────────────────────────────────────────────── */
    const [input,           setInput]           = useState("");
    const [message,         setMessage]         = useState({ text: "", type: "info" });
    const [shake,           setShake]           = useState(false);
    const [damagePopup,     setDamagePopup]     = useState(null);
    const [victoryScreen,   setVictoryScreen]   = useState(false);
    const [playerDamaged,   setPlayerDamaged]   = useState(false);
    const [playerAttacking, setPlayerAttacking] = useState(false);
    const [adminPopup,      setAdminPopup]      = useState(false);
    const [gameCompleted,   setGameCompleted]   = useState(false);
    const [combo,           setCombo]           = useState(0);       // correct streak
    const [hintLevel,       setHintLevel]       = useState(0);       // chars revealed
    const [floatingTexts,   setFloatingTexts]   = useState([]);      // floating combat labels
    const [screenFlash,     setScreenFlash]     = useState("");      // "" | "hit" | "crit" | "defeat"
    const [wrongAnim,       setWrongAnim]       = useState(false);   // input shake on wrong

    const playerDamageTimerRef = useRef(null);
    const playerAttackTimerRef = useRef(null);
    const xpAwardedRef         = useRef(false);
    const floatIdRef           = useRef(0);

    const isVictory = enemy.hp <= 0;
    const isDefeat  = player.hp <= 0;
    const isLocked  = isDefeat || victoryScreen || gameCompleted;

    /* ── Floating text helper ────────────────────────────────────────────── */
    const spawnFloat = (text, color) => {
        const id = floatIdRef.current++;
        setFloatingTexts(prev => [...prev, { id, text, color }]);
        setTimeout(() => setFloatingTexts(prev => prev.filter(f => f.id !== id)), 1000);
    };

    /* ── Screen flash helper ─────────────────────────────────────────────── */
    const flash = (type, ms = 300) => {
        setScreenFlash(type);
        setTimeout(() => setScreenFlash(""), ms);
    };

    /* ── Enemy attack ────────────────────────────────────────────────────── */
    const enemyAttack = useCallback((dmg) => {
        setShake(true);
        damageSoundRef.current.currentTime = 0;
        damageSoundRef.current.play().catch(() => {});
        setDamagePopup({ value: `-${dmg}`, type: "player" });
        setPlayerDamaged(true);
        flash("hit", 400);
        clearTimeout(playerDamageTimerRef.current);
        playerDamageTimerRef.current = setTimeout(() => setPlayerDamaged(false), 500);
        setPlayer(prev => ({ ...prev, hp: Math.max(0, prev.hp - dmg) }));
        setTimeout(() => setShake(false), 350);
        setTimeout(() => setDamagePopup(null), 900);
    }, []);

    /* ── XP / level up ───────────────────────────────────────────────────── */
    const gainXP = useCallback((amount) => {
        setPlayer(prev => {
            let { xp, level, xpToLevel, maxHp, maxMana } = prev;
            xp += amount;
            let didLevel = false;
            while (xp >= xpToLevel) {
                xp -= xpToLevel;
                level++;
                xpToLevel += 50;
                maxHp   += 25;
                maxMana += 15;
                didLevel = true;
            }
            spawnFloat(didLevel ? `LEVEL UP! LV ${level}` : `+${amount} XP`, didLevel ? "#ffd700" : "#a0ffa0");
            return { ...prev, level, xp, xpToLevel, maxHp, maxMana, hp: didLevel ? maxHp : prev.hp, mana: didLevel ? maxMana : prev.mana };
        });
    }, []);

    /* ── Hint system ─────────────────────────────────────────────────────── */
    const requestHint = () => {
        if (player.mana < HINT_COST_MANA) {
            setMessage({ text: "Not enough mana for a hint!", type: "warn" });
            return;
        }
        setPlayer(prev => ({ ...prev, mana: Math.max(0, prev.mana - HINT_COST_MANA) }));
        setHintLevel(prev => prev + 1);
        spawnFloat(`HINT (-${HINT_COST_MANA} MP)`, "#00f0ff");
    };

    /* ── Main attack handler ─────────────────────────────────────────────── */
    const attack = useCallback((usePower = false) => {
        if (isLocked) return;
        if (usePower && player.mana < POWER_MANA_COST) {
            setMessage({ text: "Insufficient mana for Power Strike!", type: "warn" });
            return;
        }

        const correct = isCorrectAnswer(input, currentRiddle.answer);

        if (!correct) {
            // Wrong answer → enemy strikes, combo resets
            setWrongAnim(true);
            setTimeout(() => setWrongAnim(false), 400);
            setCombo(0);
            const dmg = enemy.damage;
            setMessage({ text: `WRONG! The answer was: "${currentRiddle.answer}"`, type: "error" });
            enemyAttack(dmg);
            advanceRiddle();
            return;
        }

        /* ── Correct answer ── */
        attackSoundRef.current.currentTime = 0;
        attackSoundRef.current.play().catch(() => {});
        setPlayerAttacking(true);
        clearTimeout(playerAttackTimerRef.current);
        playerAttackTimerRef.current = setTimeout(() => setPlayerAttacking(false), 250);

        // Combo tier bonus (1x, 1.1x … up to 1.5x at combo 5+)
        const newCombo = Math.min(combo + 1, COMBO_CAP);
        setCombo(newCombo);
        const comboMult  = 1 + (newCombo - 1) * 0.1;
        const base       = usePower ? POWER_DAMAGE : BASE_ATTACK_DAMAGE;
        const isCrit     = Math.random() < 0.15 + newCombo * 0.02;
        const finalDmg   = Math.round(base * comboMult * (isCrit ? 2 : 1));

        if (isCrit) {
            setMessage({ text: `CRITICAL HIT! ×${comboMult.toFixed(1)} COMBO`, type: "crit" });
            flash("crit", 400);
            spawnFloat("CRITICAL!", "#ff6600");
        } else if (newCombo >= 3) {
            setMessage({ text: `COMBO ×${newCombo}! +${Math.round((comboMult - 1) * 100)}% DMG`, type: "combo" });
        } else {
            setMessage({ text: "TARGET STRUCK!", type: "success" });
        }

        setShake(true);
        setDamagePopup({ value: `-${finalDmg}`, type: "enemy" });
        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - finalDmg) }));

        // Mana regen on correct answer
        setPlayer(prev => ({
            ...prev,
            mana: Math.min(prev.maxMana, prev.mana + MANA_REGEN_PER_TURN - (usePower ? POWER_MANA_COST : 0)),
        }));

        setTimeout(() => setShake(false), 350);
        setTimeout(() => setDamagePopup(null), 900);
        advanceRiddle();
    }, [input, currentRiddle, enemy, player, combo, isLocked, enemyAttack, advanceRiddle]);

    /* ── Enter key ───────────────────────────────────────────────────────── */
    useEffect(() => {
        const h = (e) => { if (e.key === "Enter" && !isLocked) attack(false); };
        window.addEventListener("keydown", h);
        return () => window.removeEventListener("keydown", h);
    }, [attack, isLocked]);

    /* ── Victory detection ───────────────────────────────────────────────── */
    useEffect(() => {
        if (isVictory && !xpAwardedRef.current) {
            gainXP(XP_PER_KILL + combo * 5);
            victorySoundRef.current.currentTime = 0;
            victorySoundRef.current.play().catch(() => {});
            if (enemy.name === "ADMIN") setGameCompleted(true);
            else setVictoryScreen(true);
            xpAwardedRef.current = true;
        }
    }, [isVictory, enemy.name, combo, gainXP]);

    /* ── Message auto-clear ──────────────────────────────────────────────── */
    useEffect(() => {
        if (!message.text) return;
        const t = setTimeout(() => setMessage({ text: "", type: "info" }), 2500);
        return () => clearTimeout(t);
    }, [message]);

    /* ── Admin popup auto-dismiss ────────────────────────────────────────── */
    useEffect(() => {
        if (!adminPopup) return;
        const t = setTimeout(() => setAdminPopup(false), 3000);
        return () => clearTimeout(t);
    }, [adminPopup]);

    /* ── Cleanup ─────────────────────────────────────────────────────────── */
    useEffect(() => () => {
        clearTimeout(playerDamageTimerRef.current);
        clearTimeout(playerAttackTimerRef.current);
    }, []);

    /* ── Continue / Restart ──────────────────────────────────────────────── */
    const continueGame = () => {
        setVictoryScreen(false);
        setCombo(0);
        const newEnemy = getEnemy(player.level, player.maxHp);
        setEnemy(newEnemy);
        if (newEnemy.name === "ADMIN") setAdminPopup(true);
        xpAwardedRef.current = false;
    };

    const restartGame = () => {
        setPlayer({ level: 1, xp: 0, xpToLevel: 50, maxHp: 120, hp: 120, maxMana: 60, mana: 60 });
        setEnemy(getEnemy(1, 120));
        setVictoryScreen(false);
        setGameCompleted(false);
        setCombo(0);
        setDeck(shuffleArray(riddles));
        setDeckIdx(0);
        xpAwardedRef.current = false;
    };

    /* ── Bar percentages ─────────────────────────────────────────────────── */
    const hpPct    = (player.hp   / player.maxHp)    * 100;
    const mpPct    = (player.mana / player.maxMana)  * 100;
    const xpPct    = (player.xp   / player.xpToLevel) * 100;
    const enmyPct  = (enemy.hp    / enemy.maxHp)     * 100;

    const hintText = hintLevel > 0
        ? buildHint(currentRiddle.answer, hintLevel)
        : null;

    const msgClass = { info:"msg-info", success:"msg-success", error:"msg-error", warn:"msg-warn", crit:"msg-crit", combo:"msg-combo" }[message.type] ?? "";

    /* ── Render ──────────────────────────────────────────────────────────── */
    return (
        <div className={`g6-body ${screenFlash ? `flash-${screenFlash}` : ""}`}>
            <div className={`rpg-container ${shake ? "shake" : ""}`}>

                {/* Scanline overlay */}
                <div className="scanlines" aria-hidden="true" />

                {/* Floating combat text */}
                <div className="float-layer" aria-hidden="true">
                    {floatingTexts.map(f => (
                        <span key={f.id} className="float-text" style={{ color: f.color }}>{f.text}</span>
                    ))}
                </div>

                {/* ── BATTLE STAGE ─────────────────────────────────────────── */}
                <div className="rpg-battle-stage">
                    <div className="stage-bg" aria-hidden="true">
                        <div className="stage-ground" />
                        <div className="stage-torches">
                            <span className="torch left-torch">🔥</span>
                            <span className="torch right-torch">🔥</span>
                        </div>
                    </div>

                    {/* PLAYER */}
                    <div className="battle-character player-side">
                        <div className="character-stats-panel player-panel">
                            <div className="char-head">
                                <span className="char-name hero-name">◈ HERO</span>
                                <span className="char-level">LV <em>{player.level}</em></span>
                            </div>
                            <StatBar label="HP" pct={hpPct} val={player.hp} max={player.maxHp}
                                fillClass={hpPct < 30 ? "bar-hp-low" : "bar-hp"} />
                            <StatBar label="MP" pct={mpPct} val={player.mana} max={player.maxMana} fillClass="bar-mp" />
                            <StatBar label="XP" pct={xpPct} val={player.xp} max={player.xpToLevel} fillClass="bar-xp" />
                            {combo > 0 && (
                                <div className="combo-badge">
                                    <span>COMBO</span><strong>×{combo}</strong>
                                </div>
                            )}
                        </div>
                        <div className="character-sprite-box">
                            <img
                                src={playerAttacking ? knightattack : playerDamaged ? knightdamage : knight}
                                alt="Hero"
                                className={`sprite-img ${playerAttacking ? "sprite-attack" : ""} ${playerDamaged ? "sprite-hurt" : ""}`}
                            />
                            {damagePopup?.type === "player" && (
                                <div className="damage-text player-damage">{damagePopup.value}</div>
                            )}
                        </div>
                    </div>

                    <div className="vs-badge" aria-hidden="true">
                        <span>VS</span>
                    </div>

                    {/* ENEMY */}
                    <div className="battle-character enemy-side">
                        <div className="character-stats-panel enemy-panel">
                            <div className="char-head">
                                <span className="char-name enemy-name">{enemy.name}</span>
                                <span className="char-level">LV <em>{enemy.level}</em></span>
                            </div>
                            <StatBar label="HP" pct={enmyPct} val={enemy.hp} max={enemy.maxHp}
                                fillClass={enmyPct < 30 ? "bar-hp-low" : "bar-enemy"} />
                        </div>
                        <div className="character-sprite-box">
                            <img
                                src={enemy.Image || knight}
                                alt={enemy.name}
                                className={`sprite-img enemy-img ${shake ? "sprite-hurt" : ""}`}
                            />
                            {damagePopup?.type === "enemy" && (
                                <div className="damage-text enemy-damage">{damagePopup.value}</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── BOTTOM HUD ────────────────────────────────────────────── */}
                <div className="rpg-bottom-hud">

                    {/* DIALOGUE / RIDDLE BOX */}
                    <div className="rpg-dialogue-box">
                        <div className="dialogue-header">
                            <span className="dialogue-speaker">▶ THE ENIGMA</span>
                            {message.text && (
                                <span className={`dialogue-message ${msgClass}`}>{message.text}</span>
                            )}
                        </div>
                        <p className="dialogue-text">
                            {!isDefeat && !victoryScreen && !gameCompleted
                                ? currentRiddle.question
                                : "…"}
                        </p>
                        {hintText && (
                            <div className="hint-row">
                                <span className="hint-label">HINT:</span>
                                <span className="hint-text">{hintText}</span>
                            </div>
                        )}
                    </div>

                    {/* COMMAND MENU */}
                    <div className="rpg-command-menu">
                        <div className="command-header">
                            <span>⚔ COMMANDS</span>
                        </div>
                        <div className="command-body">
                            <div className={`input-wrapper ${wrongAnim ? "input-shake" : ""}`}>
                                <span className="input-cursor">›</span>
                                <input
                                    className="pixel-input"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Type your answer…"
                                    disabled={isLocked}
                                    autoComplete="off"
                                    spellCheck={false}
                                />
                            </div>
                            <button
                                className="pixel-btn btn-attack"
                                onClick={() => attack(false)}
                                disabled={isLocked || !input.trim()}
                            >
                                <span className="btn-icon">⚔</span>
                                <span>ATTACK</span>
                            </button>
                            <button
                                className="pixel-btn btn-power"
                                onClick={() => attack(true)}
                                disabled={isLocked || player.mana < POWER_MANA_COST || !input.trim()}
                            >
                                <span className="btn-icon">✦</span>
                                <span>POWER STRIKE</span>
                                <span className="btn-cost">{POWER_MANA_COST} MP</span>
                            </button>
                            <button
                                className="pixel-btn btn-hint"
                                onClick={requestHint}
                                disabled={isLocked || player.mana < HINT_COST_MANA}
                            >
                                <span className="btn-icon">💡</span>
                                <span>REVEAL HINT</span>
                                <span className="btn-cost">{HINT_COST_MANA} MP</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── OVERLAYS ─────────────────────────────────────────────── */}
                {isDefeat && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-defeat">
                            <img src={gameend} alt="Game over" className="defeat-img" />
                            <h2 className="modal-title defeat-title">YOU HAVE FALLEN</h2>
                            <p className="modal-sub">Your journey ends here, brave soul.</p>
                            <button className="pixel-btn btn-attack pulse-btn" onClick={restartGame}>
                                ↺ RISE AGAIN
                            </button>
                        </div>
                    </div>
                )}

                {victoryScreen && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-victory">
                            <div className="victory-stars">★ ★ ★</div>
                            <h1 className="modal-title victory-title">VICTORY!</h1>
                            <p className="modal-sub">+{XP_PER_KILL + combo * 5} EXP EARNED</p>
                            {combo > 0 && <p className="modal-combo">COMBO BONUS: ×{combo}</p>}
                            <button className="pixel-btn btn-power pulse-btn" onClick={continueGame}>
                                ▶ NEXT FLOOR
                            </button>
                        </div>
                    </div>
                )}

                {gameCompleted && (
                    <div className="modal-overlay">
                        <div className="modal-content modal-complete">
                            <div className="complete-crown">👑</div>
                            <h1 className="modal-title complete-title">SYSTEM CONQUERED</h1>
                            <p className="modal-sub">The ADMIN has been defeated.</p>
                            <p className="modal-sub">Final Level: <strong>{player.level}</strong></p>
                            <button className="pixel-btn btn-hint pulse-btn" onClick={restartGame}>
                                ✦ NEW GAME+
                            </button>
                        </div>
                    </div>
                )}

                {adminPopup && (
                    <div className="modal-overlay admin-flash">
                        <div className="admin-warning-box">
                            <p className="admin-warning-label">⚠ INTRUDER DETECTED ⚠</p>
                            <h1 className="admin-title">ADMIN</h1>
                            <p className="admin-sub">PREPARE FOR TERMINATION</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ── Reusable stat bar ───────────────────────────────────────────────────────── */
function StatBar({ label, pct, val, max, fillClass }) {
    return (
        <div className="rpg-stat-row">
            <span className="stat-label">{label}</span>
            <div className="rpg-bar-bg">
                <div className={`rpg-bar-fill ${fillClass}`} style={{ width: `${Math.max(0, pct)}%` }} />
            </div>
            <span className="stat-num">{val}<span className="stat-sep">/</span>{max}</span>
        </div>
    );
}

export default RiddleRPG;
