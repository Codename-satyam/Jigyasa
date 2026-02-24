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
        const pool = enemyPool.filter(
            e => e.baseHp + e.hpPerLevel * (level - 1) <= playerMaxHp * 1.5
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

    const playerDamageTimerRef = useRef(null);
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
            setVictoryScreen(true);
            
            // Play victory sound when player wins
            victorySoundRef.current.currentTime = 0;
            victorySoundRef.current.play().catch(e => console.log("Audio play failed:", e));
            
            xpAwardedRef.current = true;
        }
    }, [isVictory]);

    useEffect(() => {
        if (!message) return;
        const timer = setTimeout(() => setMessage(""), 2000);
        return () => clearTimeout(timer);
    }, [message]);

    useEffect(() => {
        return () => {
            clearTimeout(playerDamageTimerRef.current);
        };
    }, []);

    /* ================= CONTINUE / RESTART ================= */

    const continueGame = () => {
        setVictoryScreen(false);
        setEnemy(getEnemy(player.level, player.maxHp));
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

                <div className="battle-area">
                    <div className="character player-card1">
                        <div className="character-header">
                            <h3 className="level-badge">
                                LEVEL {player.level}
                            </h3>
                        </div>

                        <img
                            src={playerDamaged ? knightdamage : knight}
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
                                <span className="g6-stat-label">MANA</span>
                                <div className="healthbar-track">
                                    <div
                                        className="mana-fill"
                                        style={{ width: `${manaPercent}%` }}
                                    />
                                </div>
                            </div>

                            <div className="stat-row">
                                <span className="g6-stat-label">EXP</span>
                                <div className="healthbar-track">
                                    <div
                                        className="xp-fill"
                                        style={{ width: `${xpPercent}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="vs-divider">VS</div>

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
                            {riddles[current].question}
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
                            placeholder="Answer the riddle..."
                        />

                        <div>
                            <button
                                className="g6-button"
                                onClick={() => attack(false)}
                            >
                                Attack
                            </button>

                            <button
                                className="g6-button"
                                onClick={() => attack(true)}
                            >
                                Power Attack (20 Mana)
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
            </div>
        </div>
    );
}

export default RiddleRPG;