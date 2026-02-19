import { useState, useEffect, useRef } from "react";
import "./g6.css";
// import goblin from "../../../../Assets/g6/goblin.png";
import knight from "../../../../Assets/g6/knight.png";
import beast from "../../../../Assets/g6/Beast.png";
import knightdamage from "../../../../Assets/g6/knight-damage.png";
import beastdamage from "../../../../Assets/g6/Beast-damage.png";
import gameend from "../../../../Assets/g6/game-end.png";

const riddles = [
    {
        question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?",
        answer: "An echo"
    },
    {
        question: "I'm not alive, but I grow. I don't have lungs, but I need air. I don't have a mouth, but water kills me. What am I?",
        answer: "Fire"
    },
    {
        question: "The more you take away, the bigger I become. What am I?",
        answer: "A hole"
    },
    {
        question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?",
        answer: "A map"
    },
    {
        question: "What has to be broken before you can use it?",
        answer: "An egg"
    },
    {
        question: "I’m tall when I’m young, and short when I’m old. What am I?",
        answer: "A candle"
    },
    {
        question: "What month of the year has 28 days?",
        answer: "All of them"
    },
    {
        question: "What is always in front of you but can’t be seen?",
        answer: "The future"
    },
    {
        question: "There’s a one-story house in which everything is yellow. What color are the stairs?",
        answer: "There are no stairs"
    },
    {
        question: "What can you catch, but not throw?",
        answer: "A cold"
    },
    {
        question: "What has hands, but can’t clap?",
        answer: "A clock"
    },
    {
        question: "What has one eye, but can’t see?",
        answer: "A needle"
    },
    {
        question: "What gets wetter the more it dries?",
        answer: "A towel"
    },
    {
        question: "What goes up but never comes down?",
        answer: "Your age"
    },
    {
        question: "I shave every day, but my beard stays the same. What am I?",
        answer: "A barber"
    },
    {
        question: "You see a boat filled with people, yet there isn’t a single person on board. How is that possible?",
        answer: "All the people are married"
    },
    {
        question: "What has many keys but can’t open a single lock?",
        answer: "A piano"
    },
    {
        question: "What runs all around a backyard, yet never moves?",
        answer: "A fence"
    },
    {
        question: "What has a head and a tail but no body?",
        answer: "A coin"
    },
    {
        question: "What begins with T, ends with T, and has T in it?",
        answer: "A teapot"
    },
    {
        question: "The more you have of me, the less you see. What am I?",
        answer: "Darkness"
    },
    {
        question: "What can travel around the world while staying in a corner?",
        answer: "A stamp"
    },
    {
        question: "What has an endless supply of letters but starts empty?",
        answer: "A mailbox"
    },
    {
        question: "If two’s company and three’s a crowd, what are four and five?",
        answer: "Nine"
    },
    {
        question: "What is so fragile that saying its name breaks it?",
        answer: "Silence"
    }
];


const getEnemy = (level) => ({
    name: "Logic Beast",
    level,
    maxHp: 80 + level * 20,
    hp: 80 + level * 20,
    damage: 10 + level * 4
});

function RiddleRPG() {
    const [player, setPlayer] = useState({
        level: 1,
        xp: 0,
        xpToLevel: 50,
        maxHp: 100,
        hp: 100,
        mana: 50
    });

    const [enemy, setEnemy] = useState(getEnemy(1));
    const [current, setCurrent] = useState(0);
    const [input, setInput] = useState("");
    const [message, setMessage] = useState("");
    const [shake, setShake] = useState(false);
    const [damagePopup, setDamagePopup] = useState(null);
    const [victoryScreen, setVictoryScreen] = useState(false);
    const [playerDamaged, setPlayerDamaged] = useState(false);
    const [enemyDamaged, setEnemyDamaged] = useState(false);

    const playerDamageTimerRef = useRef(null);
    const enemyDamageTimerRef = useRef(null);

    const isVictory = enemy.hp <= 0;
    const isDefeat = player.hp <= 0;

    const nextRiddle = () =>
        setCurrent((prev) => (prev + 1) % riddles.length);

    const enemyAttack = () => {
        setShake(true);
        setDamagePopup({ value: `-${enemy.damage}`, type: "player" });

        setPlayerDamaged(true);
        if (playerDamageTimerRef.current) {
            clearTimeout(playerDamageTimerRef.current);
        }
        playerDamageTimerRef.current = setTimeout(() => setPlayerDamaged(false), 400);

        setPlayer((prev) => ({
            ...prev,
            hp: Math.max(0, prev.hp - enemy.damage)
        }));

        setTimeout(() => setShake(false), 300);
        setTimeout(() => setDamagePopup(null), 800);
    };

    const gainXP = (amount) => {
        setPlayer((prev) => {
            let xp = prev.xp + amount;
            let level = prev.level;
            let xpToLevel = prev.xpToLevel;
            let maxHp = prev.maxHp;
            let mana = prev.mana;

            if (xp >= xpToLevel) {
                xp -= xpToLevel;
                level += 1;
                xpToLevel += 40;
                maxHp += 25;
                mana += 20;
            }

            return {
                ...prev,
                level,
                xp,
                xpToLevel,
                maxHp,
                hp: maxHp,
                mana
            };
        });
    };

    const attack = (power = false) => {
        if (isDefeat) return;

        if (power && player.mana < 20) {
            setMessage("Not enough mana!");
            return;
        }

        const correct =
            input.trim().toLowerCase() === riddles[current].answer.toLowerCase();
        if (!correct) {
            setMessage("Wrong answer! Enemy attacks!");
            enemyAttack();
            nextRiddle();
            setInput("");
            return;
        }

        const damage = power ? 40 : 20;

        setShake(true);
        setDamagePopup({ value: `-${damage}`, type: "enemy" });

        setEnemyDamaged(true);
        if (enemyDamageTimerRef.current) {
            clearTimeout(enemyDamageTimerRef.current);
        }
        enemyDamageTimerRef.current = setTimeout(() => setEnemyDamaged(false), 400);

        setEnemy((prev) => ({
            ...prev,
            hp: Math.max(0, prev.hp - damage)
        }));

        if (power) {
            setPlayer((prev) => ({ ...prev, mana: prev.mana - 20 }));
        }

        setTimeout(() => setShake(false), 300);
        setTimeout(() => setDamagePopup(null), 800);

        nextRiddle();
        setInput("");
    };

    useEffect(() => {
        if (isVictory) {
            gainXP(40);
            setVictoryScreen(true);
        }
    }, [isVictory]);

    useEffect(() => {
        return () => {
            if (playerDamageTimerRef.current) {
                clearTimeout(playerDamageTimerRef.current);
            }
            if (enemyDamageTimerRef.current) {
                clearTimeout(enemyDamageTimerRef.current);
            }
        };
    }, []);

    const continueGame = () => {
        setVictoryScreen(false);
        setEnemy(getEnemy(player.level));
    };

    const restartGame = () => {
        setPlayer({
            level: 1,
            xp: 0,
            xpToLevel: 50,
            maxHp: 100,
            hp: 100,
            mana: 50
        });
        setEnemy(getEnemy(1));
        setVictoryScreen(false);
    };

    const hpPercent = (player.hp / player.maxHp) * 100;
    const enemyPercent = (enemy.hp / enemy.maxHp) * 100;
    const xpPercent = (player.xp / player.xpToLevel) * 100;

    return (
    <div className="g6-body">
        <div className={`riddle-container ${shake ? "shake" : ""}`}>
            <h1>Riddle RPG ⚔️</h1>

            <div className="battle-area">
                <div className="character player-card1">
                    <div className="character-header">
                        <h3 className="level-badge">LEVEL {player.level}</h3>
                    </div>
                    <img
                        src={playerDamaged ? knightdamage : knight}
                        alt="Player"
                        className="character-portrait"
                    />
                    <div className="stats-container">
                        <div className="stat-row">
                            <span className="stat-label">HP</span>
                            <div className="healthbar-track">
                                <div
                                    className={`player-fill ${player.hp < player.maxHp * 0.3 ? "low-hp" : ""}`}
                                    style={{ width: `${hpPercent}%` }}
                                />
                                <span className="hp-text">{player.hp}/{player.maxHp}</span>
                            </div>
                            {/* <span className="stat-value">{player.hp}/{player.maxHp}</span> */}
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">MANA</span>
                            <div className="healthbar-track">
                                <div
                                    className="mana-fill"
                                    style={{ width: `${(player.mana / 50) * 100}%` }}
                                />
                            </div>
                            {/* <span className="stat-value">{player.mana}/50</span> */}
                        </div>
                        <div className="stat-row">
                            <span className="stat-label">EXP</span>
                            <div className="healthbar-track">
                                <div
                                    className="xp-fill"
                                    style={{ width: `${xpPercent}%` }}
                                />
                            </div>
                            {/* <span className="stat-value">{player.xp}/{player.xpToLevel}</span> */}
                        </div>
                    </div>
                </div>

                <div className="vs-divider">VS</div>

                <div className="character enemy-card">
                    <div className="character-header">
                        <h3 className="enemy-name">{enemy.name}</h3>
                        <span className="enemy-level">Lv {enemy.level}</span>
                    </div>
                    <img
                        src={enemyDamaged ? beastdamage : beast}
                        alt="Enemy"
                        className="character-portrait enemy-portrait"
                    />
                    <div className="stats-container">
                        <div className="stat-row">
                            <span className="stat-label">HP</span>
                            <div className="healthbar-track">
                                <div
                                    className={`enemy-fill ${enemy.hp < enemy.maxHp * 0.3 ? "low-hp" : ""}`}
                                    style={{ width: `${enemyPercent}%` }}
                                />
                                <span className="hp-text">{enemy.hp}/{enemy.maxHp}</span>
                            </div>
                            {/* <span className="stat-value">{enemy.hp}/{enemy.maxHp}</span> */}
                        </div>
                    </div>
                </div>
            </div>

            {damagePopup && (
                <div className={`damage-popup ${damagePopup.type}`}>
                    {damagePopup.value}
                </div>
            )}

            {!isDefeat && (
                <>
                    <div className="riddle-box">
                        {riddles[current].question}
                    </div>

                    <input
                        className="g6-input"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Answer the riddle..."
                    />

                    <div>
                        <button className="g6-button" onClick={() => attack(false)}>Attack</button>
                        <button className="g6-button" onClick={() => attack(true)}>
                            Power Attack (20 Mana)
                        </button>
                    </div>
                </>
            )}

            {message && <div className="message">{message}</div>}

            {isDefeat && (
                <div className="defeat-screen">
                    <div className="defeat-content">
                        <img src={gameend} alt="Game over" className="gamend" />
                        <h2>YOU WERE DEFEATED</h2>
                        <button className="g6-button" onClick={restartGame}>Restart</button>
                    </div>
                </div>
            )}

            {victoryScreen && (
                <div className="victory-screen">
                    <div className="victory-content">
                        <h1>🏆 VICTORY</h1>
                        <p>You defeated the enemy!</p>
                        <button className="g6-button" onClick={continueGame}>Continue</button>
                    </div>
                </div>
            )}
        </div>
        </div>
    );
}

export default RiddleRPG;
