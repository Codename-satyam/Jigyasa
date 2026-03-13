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

        const pool = enemyPool.filter(
            e => e.name !== "ADMIN" && e.baseHp + e.hpPerLevel * (level - 1) <= playerMaxHp * 1.5
        );

        const enemyData = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : enemyPool[0];
        const maxHp = enemyData.baseHp + enemyData.hpPerLevel * (level - 1);

        return {
            ...enemyData,
            level,
            maxHp,
            hp: maxHp,
            damage: enemyData.baseDamage + (enemyData.damagePerLevel || 0) * (level - 1)
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

    const nextRiddle = () => setCurrent(prev => (prev + 1) % riddles.length);

    /* ================= ENEMY ATTACK ================= */
    const enemyAttack = () => {
        setShake(true);
        damageSoundRef.current.currentTime = 0;
        damageSoundRef.current.play().catch(e => console.log("Audio play failed:", e));

        const finalDamage = enemy.damage;
        setDamagePopup({ value: `-${finalDamage}`, type: "player" });
        setPlayerDamaged(true);
        
        clearTimeout(playerDamageTimerRef.current);
        playerDamageTimerRef.current = setTimeout(() => setPlayerDamaged(false), 400);

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
                ...prev, level, xp, xpToLevel, maxHp, hp: maxHp, maxMana, mana: maxMana
            };
        });
    };

    /* ================= ATTACK ================= */
    const attack = (power = false) => {
        if (isDefeat || victoryScreen) return;
        if (power && player.mana < 20) {
            setMessage("SYSTEM: Insufficient Mana!");
            return;
        }

        const correct = input.trim().toLowerCase() === riddles[current].answer.toLowerCase();

        if (!correct) {
            setMessage("INCORRECT! Enemy strikes back!");
            enemyAttack();
            nextRiddle();
            setInput("");
            return;
        }

        attackSoundRef.current.currentTime = 0;
        attackSoundRef.current.play().catch(e => console.log("Audio play failed:", e));

        setPlayerAttacking(true);
        clearTimeout(playerAttackTimerRef.current);
        playerAttackTimerRef.current = setTimeout(() => setPlayerAttacking(false), 200);

        const baseDamage = power ? 40 : 20;
        const damage = Math.random() < 0.2 ? baseDamage * 2 : baseDamage;

        if (damage > baseDamage) {
            setMessage("CRITICAL HIT!");
        } else {
            setMessage("TARGET STRUCK!");
        }

        setShake(true);
        setDamagePopup({ value: `-${damage}`, type: "enemy" });

        setEnemy(prev => ({ ...prev, hp: Math.max(0, prev.hp - damage) }));

        if (power) {
            setPlayer(prev => ({ ...prev, mana: prev.mana - 20 }));
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
            if (enemy.name === "ADMIN") {
                setGameCompleted(true);
            } else {
                setVictoryScreen(true);
            }
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
        if (newEnemy.name === "ADMIN") setAdminPopup(true);
        xpAwardedRef.current = false;
    };

    const restartGame = () => {
        setPlayer({ level: 1, xp: 0, xpToLevel: 50, maxHp: 100, hp: 100, maxMana: 50, mana: 50 });
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
            <div className={`rpg-container retro-panel ${shake ? "shake" : ""}`}>
                
                {/* JRPG BATTLE STAGE */}
                <div className="rpg-battle-stage">
                    
                    {/* PLAYER SIDE */}
                    <div className="battle-character player-side">
                        <div className="character-stats-panel border-blue">
                            <div className="char-head">
                                <span className="blue-text">HERO</span>
                                <span className="gold-text">LV {player.level}</span>
                            </div>
                            
                            <div className="rpg-stat-row">
                                <span className="stat-label">HP</span>
                                <div className="rpg-bar-bg">
                                    <div className={`rpg-bar-fill ${player.hp < player.maxHp * 0.3 ? "bg-red blink" : "bg-green"}`} style={{ width: `${hpPercent}%` }} />
                                </div>
                                <span className="stat-num">{player.hp}/{player.maxHp}</span>
                            </div>

                            <div className="rpg-stat-row">
                                <span className="stat-label">MP</span>
                                <div className="rpg-bar-bg">
                                    <div className="rpg-bar-fill bg-blue" style={{ width: `${manaPercent}%` }} />
                                </div>
                                <span className="stat-num">{player.mana}/{player.maxMana}</span>
                            </div>

                            <div className="rpg-stat-row">
                                <span className="stat-label">XP</span>
                                <div className="rpg-bar-bg">
                                    <div className="rpg-bar-fill bg-gold" style={{ width: `${xpPercent}%` }} />
                                </div>
                                <span className="stat-num">{player.xp}/{player.xpToLevel}</span>
                            </div>
                        </div>

                        <div className="character-sprite-box">
                            <img
                                src={playerAttacking ? knightattack : (playerDamaged ? knightdamage : knight)}
                                alt="Player"
                                className="sprite-img"
                            />
                            {damagePopup?.type === "player" && (
                                <div className="damage-text player-damage">{damagePopup.value}</div>
                            )}
                        </div>
                    </div>

                    <div className="vs-badge blink-slow text-center">
                        <span className="red-text">V</span><span className="blue-text">S</span>
                    </div>

                    {/* ENEMY SIDE */}
                    <div className="battle-character enemy-side">
                        <div className="character-stats-panel border-red">
                            <div className="char-head">
                                <span className="red-text">{enemy.name}</span>
                                <span className="gold-text">LV {enemy.level}</span>
                            </div>
                            
                            <div className="rpg-stat-row">
                                <span className="stat-label">HP</span>
                                <div className="rpg-bar-bg">
                                    <div className="rpg-bar-fill bg-red" style={{ width: `${enemyPercent}%` }} />
                                </div>
                                <span className="stat-num">{enemy.hp}/{enemy.maxHp}</span>
                            </div>
                        </div>

                        <div className="character-sprite-box">
                            <img
                                src={enemy.Image || knight}
                                alt="Enemy"
                                className="sprite-img enemy-img"
                            />
                            {damagePopup?.type === "enemy" && (
                                <div className="damage-text enemy-damage">{damagePopup.value}</div>
                            )}
                        </div>
                    </div>

                </div>

                {/* BOTTOM RPG PANELS */}
                <div className="rpg-bottom-hud">
                    
                    {/* RIDDLE DIALOGUE BOX */}
                    <div className="rpg-dialogue-box">
                        <h3 className="dialogue-name gold-text">▶ THE ENIGMA:</h3>
                        {!isDefeat && !victoryScreen ? (
                            <p className="dialogue-text typing-effect">{riddles[current].question}</p>
                        ) : (
                            <p className="dialogue-text">...</p>
                        )}
                        {message && <span className="system-message blink">{message}</span>}
                    </div>

                    {/* COMMAND MENU */}
                    <div className="rpg-command-menu">
                        <div className="command-header bg-blue text-black">COMMANDS</div>
                        <div className="command-body">
                            <input
                                className="pixel-input mb-2"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") attack(false); }}
                                placeholder="&gt; INPUT ANSWER..."
                                disabled={isDefeat || victoryScreen}
                            />
                            <div className="command-actions">
                                <button className="pixel-btn btn-dark w-100 mb-2 text-left" onClick={() => attack(false)} disabled={isDefeat || victoryScreen}>
                                    <span className="gold-text">▶</span> ATTACK
                                </button>
                                <button className="pixel-btn btn-dark w-100 text-left" onClick={() => attack(true)} disabled={player.mana < 20 || isDefeat || victoryScreen}>
                                    <span className="purple-text">▶</span> POWER STRIKE <span className="blue-text" style={{fontSize: '8px'}}>[20 MP]</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* OVERLAY SCREENS */}
                {isDefeat && (
                    <div className="modal-overlay">
                        <div className="in-screen-modal-content border-red text-center">
                            <img src={gameend} alt="Game over" className="game-over-img mb-4" />
                            <h2 className="pixel-title red-text blink mb-4">YOU PERISHED</h2>
                            <button className="pixel-btn btn-red pulse-btn mx-auto" onClick={restartGame}>
                                [ RESTART JOURNEY ]
                            </button>
                        </div>
                    </div>
                )}

                {victoryScreen && (
                    <div className="modal-overlay">
                        <div className="in-screen-modal-content border-gold text-center">
                            <h1 className="pixel-title gold-text mb-2">VICTORY!</h1>
                            <p className="pixel-subtitle green-text mb-4">+40 EXP ACQUIRED</p>
                            <button className="pixel-btn btn-green pulse-btn mx-auto" onClick={continueGame}>
                                [ PROCEED TO NEXT FLOOR ]
                            </button>
                        </div>
                    </div>
                )}

                {gameCompleted && (
                    <div className="modal-overlay">
                        <div className="in-screen-modal-content border-purple text-center">
                            <h1 className="pixel-title purple-text blink mb-2">SYSTEM CONQUERED</h1>
                            <p className="green-text mb-2">ADMIN HAS BEEN DEFEATED.</p>
                            <p className="blue-text mb-4">Final Level Reached: {player.level}</p>
                            <button className="pixel-btn btn-purple pulse-btn mx-auto" onClick={restartGame}>
                                [ START NEW GAME+ ]
                            </button>
                        </div>
                    </div>
                )}

                {adminPopup && (
                    <div className="modal-overlay admin-flash">
                        <div className="admin-warning-box text-center">
                            <h1 className="huge-text red-text blink-fast">WARNING!</h1>
                            <h2 className="pixel-title mt-2">ADMIN HAS ARRIVED</h2>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default RiddleRPG;