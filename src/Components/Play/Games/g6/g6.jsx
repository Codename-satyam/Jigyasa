import { useState, useEffect, useRef } from "react";
import "./g6.css";
import knight from "../../../../Assets/g6/knight.png";
import knightdamage from "../../../../Assets/g6/knight-damage.png";
import slash from "../../../../Assets/g6/attack.mp3";
import damage from "../../../../Assets/g6/damage.mp3";
import knightattack from "../../../../Assets/g6/knight-attack.png";
import victory from "../../../../Assets/g6/victory.mp3";
import gameend from "../../../../Assets/g6/game-end.png";
import { riddles } from "./riddles";
import { enemyPool } from "./enemyPool";




function RiddleRPG() {

    /* ================= AUDIO REFS ================= */
    const attackSoundRef = useRef(new Audio(slash));
    const damageSoundRef = useRef(new Audio(damage));
    const victorySoundRef = useRef(new Audio(victory));

    /* ================= PLAYER ================= */

    const [player, setPlayer] = useState({
        level: 1,
        xp: 0,
        xpToLevel: 50,
        maxHp: 100,
        hp: 100,
        maxMana: 50,
        mana: 50
    });

    /* ================= ENEMY ================= */

    const getEnemy = (level, playerMaxHp = 100) => {
        // Force ADMIN at levels 4 and 8
        if (level === 4 || level === 8) {
            const adminData = enemyPool.find(e => e.name === "ADMIN");
            if (adminData) {
                const maxHp = adminData.baseHp + adminData.hpPerLevel * (level - 1);
                return {
                    ...adminData,
                    level,
                    maxHp,
                    hp: maxHp,
                    damage: adminData.baseDamage + (adminData.damagePerLevel || 0) * (level - 1)
                };
            }
        }

        // Regular enemy spawning for other levels
        const pool = enemyPool.filter(
            e => e.name !== "ADMIN" && e.baseHp + e.hpPerLevel * (level - 1) <= playerMaxHp * 1.5
        );

        const enemyData =
            pool.length > 0
                ? pool[Math.floor(Math.random() * pool.length)]
                : enemyPool[0];

        const maxHp =
            enemyData.baseHp + enemyData.hpPerLevel * (level - 1);

        return {
            ...enemyData,
            level,
            maxHp,
            hp: maxHp,
            damage:
                enemyData.baseDamage +
                (enemyData.damagePerLevel || 0) * (level - 1)
        };
    };

    const [enemy, setEnemy] = useState(() => getEnemy(1, 100));

    /* ================= UI STATE ================= */

    const [current, setCurrent] = useState(0);
    const [input, setInput] = useState("");
    const [message, setMessage] = useState("");
    const [shake, setShake] = useState(false);
    const [damagePopup, setDamagePopup] = useState(null);
    const [victoryScreen, setVictoryScreen] = useState(false);
    const [playerDamaged, setPlayerDamaged] = useState(false);
    const [playerAttacking, setPlayerAttacking] = useState(false);
    const [adminPopup, setAdminPopup] = useState(false);
    const [gameCompleted, setGameCompleted] = useState(false);

    const playerDamageTimerRef = useRef(null);
    const playerAttackTimerRef = useRef(null);
    const xpAwardedRef = useRef(false);

    const isVictory = enemy.hp <= 0;
    const isDefeat = player.hp <= 0;

    const nextRiddle = () =>
        setCurrent(prev => (prev + 1) % riddles.length);

    /* ================= ENEMY ATTACK ================= */

    const enemyAttack = () => {
        setShake(true);

        // Play damage sound when enemy attacks
        damageSoundRef.current.currentTime = 0;
        damageSoundRef.current.play().catch(e => console.log("Audio play failed:", e));

        const finalDamage = enemy.damage;

        setDamagePopup({ value: `-${finalDamage}`, type: "player" });

        setPlayerDamaged(true);
        clearTimeout(playerDamageTimerRef.current);
        playerDamageTimerRef.current = setTimeout(
            () => setPlayerDamaged(false),
            400
        );

        setPlayer(prev => ({
            ...prev,
            hp: Math.max(0, prev.hp - finalDamage)
        }));

        setTimeout(() => setShake(false), 300);
        setTimeout(() => setDamagePopup(null), 800);
    };

    /* ================= XP SYSTEM ================= */

    const gainXP = amount => {
        setPlayer(prev => {
            let xp = prev.xp + amount;
            let level = prev.level;
            let xpToLevel = prev.xpToLevel;
            let maxHp = prev.maxHp;
            let maxMana = prev.maxMana;

            if (xp >= xpToLevel) {
                xp -= xpToLevel;
                level += 1;
                xpToLevel += 40;
                maxHp += 25;
                maxMana += 20;
            }

            return {
                ...prev,
                level,
                xp,
                xpToLevel,
                maxHp,
                hp: maxHp,
                maxMana,
                mana: maxMana
            };
        });
    };

    /* ================= ATTACK ================= */

    const attack = (power = false) => {
        if (isDefeat || victoryScreen) return;

        if (power && player.mana < 20) {
            setMessage("Not enough mana!");
            return;
        }

        const correct =
            input.trim().toLowerCase() ===
            riddles[current].answer.toLowerCase();

        if (!correct) {
            setMessage("Wrong answer! Enemy attacks!");
            enemyAttack();
            nextRiddle();
            setInput("");
            return;
        }

        // Play attack sound on successful hit
        attackSoundRef.current.currentTime = 0;
        attackSoundRef.current.play().catch(e => console.log("Audio play failed:", e));

        setPlayerAttacking(true);
        clearTimeout(playerAttackTimerRef.current);
        playerAttackTimerRef.current = setTimeout(
            () => setPlayerAttacking(false),
            200
        );

        const baseDamage = power ? 40 : 20;
        const damage =
            Math.random() < 0.2 ? baseDamage * 2 : baseDamage;

        if (damage > baseDamage) {
            setMessage("🔥 Critical Hit!");
        }

        setShake(true);
        setDamagePopup({ value: `-${damage}`, type: "enemy" });

        setEnemy(prev => ({
            ...prev,
            hp: Math.max(0, prev.hp - damage)
        }));

        if (power) {
            setPlayer(prev => ({
                ...prev,
                mana: prev.mana - 20
            }));
        }

        setTimeout(() => setShake(false), 300);
        setTimeout(() => setDamagePopup(null), 800);

        nextRiddle();
        setInput("");
    };

    /* ================= EFFECTS ================= */

    useEffect(() => {
        if (isVictory && !xpAwardedRef.current) {
            gainXP(40);
            
            // Check if defeated enemy was ADMIN
            if (enemy.name === "ADMIN") {
                setGameCompleted(true);
            } else {
                setVictoryScreen(true);
            }
            
            // Play victory sound when player wins
            victorySoundRef.current.currentTime = 0;
            victorySoundRef.current.play().catch(e => console.log("Audio play failed:", e));
            
            xpAwardedRef.current = true;
        }
    }, [isVictory, enemy.name]);

    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(""), 2000);
        return () => clearTimeout(timer);
    }, [message]);

    useEffect(() => {
        if (!adminPopup) return;
        const timer = setTimeout(() => setAdminPopup(false), 3000);
        return () => clearTimeout(timer);
    }, [adminPopup]);

    useEffect(() => {
        return () => {
            clearTimeout(playerDamageTimerRef.current);
            clearTimeout(playerAttackTimerRef.current);
        };
    }, []);

    /* ================= CONTINUE / RESTART ================= */

    const continueGame = () => {
        setVictoryScreen(false);
        const newEnemy = getEnemy(player.level, player.maxHp);
        setEnemy(newEnemy);
        
        // Show ADMIN popup if it's ADMIN
        if (newEnemy.name === "ADMIN") {
            setAdminPopup(true);
        }
        
        xpAwardedRef.current = false;
    };

    const restartGame = () => {
        setPlayer({
            level: 1,
            xp: 0,
            xpToLevel: 50,
            maxHp: 100,
            hp: 100,
            maxMana: 50,
            mana: 50
        });
        setEnemy(getEnemy(1, 100));
        setVictoryScreen(false);
        setGameCompleted(false);
        xpAwardedRef.current = false;
    };

    /* ================= PERCENTAGES ================= */

    const hpPercent = (player.hp / player.maxHp) * 100;
    const enemyPercent = (enemy.hp / enemy.maxHp) * 100;
    const xpPercent = (player.xp / player.xpToLevel) * 100;
    const manaPercent = (player.mana / player.maxMana) * 100;

    /* ================= RENDER ================= */

    return (
        <div className="g6-body">
            <div className={`riddle-container ${shake ? "shake" : ""}`}>
                <h1>Riddle RPG ⚔️</h1>
                <p className="g6-subtitle">ANSWER THE RIDDLE · DEFEAT YOUR FOE · CLAIM GLORY</p>

                <div className="battle-area">
                    <div className="character player-card1">
                        <div className="character-header">
                            <span className="hero-tag">HERO</span>
                            <h3 className="level-badge">
                                LV {player.level}
                            </h3>
                        </div>

                        <img
                            src={playerAttacking ? knightattack : (playerDamaged ? knightdamage : knight)}
                            alt="Player"
                            className="character-portrait"
                        />

                        <div className="stats-container">
                            <div className="stat-row">
                                <span className="g6-stat-label">HP</span>
                                <div className="healthbar-track">
                                    <div
                                        className={`player-fill ${
                                            player.hp <
                                            player.maxHp * 0.3
                                                ? "low-hp"
                                                : ""
                                        }`}
                                        style={{ width: `${hpPercent}%` }}
                                    />
                                    <span className="hp-text">
                                        {player.hp}/{player.maxHp}
                                    </span>
                                </div>
                            </div>

                            <div className="stat-row">
                                <span className="g6-stat-label">MP</span>
                                <div className="healthbar-track">
                                    <div
                                        className="mana-fill"
                                        style={{ width: `${manaPercent}%` }}
                                    />
                                    <span className="hp-text">
                                        {player.mana}/{player.maxMana}
                                    </span>
                                </div>
                            </div>

                            <div className="stat-row">
                                <span className="g6-stat-label">EXP</span>
                                <div className="healthbar-track">
                                    <div
                                        className="xp-fill"
                                        style={{ width: `${xpPercent}%` }}
                                    />
                                    <span className="hp-text">
                                        {player.xp}/{player.xpToLevel}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="vs-divider">
                        <span>VS</span>
                        <div className="vs-sparks">✦</div>
                    </div>

                    <div className="character enemy-card">
                        <div className="character-header">
                            <h3 className="enemy-name">
                                {enemy.name}
                            </h3>
                            <span className="enemy-level">
                                Lv {enemy.level}
                            </span>
                        </div>

                        <img
                            src={enemy.Image || knight}
                            alt="Enemy"
                            className="character-portrait enemy-portrait"
                        />

                        <div className="stats-container">
                            <div className="stat-row">
                                <span className="g6-stat-label">HP</span>
                                <div className="healthbar-track">
                                    <div
                                        className={`enemy-fill ${
                                            enemy.hp <
                                            enemy.maxHp * 0.3
                                                ? "low-hp"
                                                : ""
                                        }`}
                                        style={{ width: `${enemyPercent}%` }}
                                    />
                                    <span className="hp-text">
                                        {enemy.hp}/{enemy.maxHp}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {damagePopup && (
                    <div className={`damage-popup ${damagePopup.type}`}>
                        {damagePopup.value}
                    </div>
                )}

                {!isDefeat && !victoryScreen && (
                    <>
                        <div className="riddle-box">
                            <span className="riddle-label">◈ RIDDLE ◈</span>
                            <p className="riddle-text">{riddles[current].question}</p>
                        </div>

                        <input
                            className="g6-input"
                            value={input}
                            onChange={(e) =>
                                setInput(e.target.value)
                            }
                            onKeyDown={(e) => {
                                if (e.key === "Enter")
                                    attack(false);
                            }}
                            placeholder="► Type your answer here..."
                        />

                        <div className="g6-action-row">
                            <button
                                className="g6-button g6-btn-attack"
                                onClick={() => attack(false)}
                            >
                                ⚔ ATTACK
                            </button>

                            <button
                                className="g6-button g6-btn-power"
                                onClick={() => attack(true)}
                                disabled={player.mana < 20}
                            >
                                💥 POWER STRIKE
                                <span className="btn-cost">20 MP</span>
                            </button>
                        </div>
                    </>
                )}

                {message && (
                    <div className="message">{message}</div>
                )}

                {isDefeat && (
                    <div className="defeat-screen">
                        <div className="defeat-content">
                            <img
                                src={gameend}
                                alt="Game over"
                                className="gamend"
                            />
                            <h2>YOU WERE DEFEATED</h2>
                            <button
                                className="g6-button"
                                onClick={restartGame}
                            >
                                Restart
                            </button>
                        </div>
                    </div>
                )}

                {victoryScreen && (
                    <div className="victory-screen">
                        <div className="victory-content">
                            <h1>🏆 VICTORY</h1>
                            <p>You defeated the enemy!</p>
                            <button
                                className="g6-button"
                                onClick={continueGame}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                )}

                {gameCompleted && (
                    <div className="victory-screen game-completed">
                        <div className="victory-content">
                            <h1 className="game-completed-title">🎮 GAME COMPLETED 🎮</h1>
                            <p className="admin-defeated-text">You defeated ADMIN!</p>
                            <p>Final Level: {player.level}</p>
                            <button
                                className="g6-button"
                                onClick={restartGame}
                            >
                                Play Again
                            </button>
                        </div>
                    </div>
                )}

                {adminPopup && (
                    <div className="admin-popup-overlay">
                        <div className="admin-popup-content">
                            <h1 className="admin-popup-text">ADMIN HAS ARRIVED</h1>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default RiddleRPG;