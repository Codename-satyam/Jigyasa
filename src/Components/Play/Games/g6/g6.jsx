import React, { useState, useEffect, useRef, useCallback } from "react";
import "./g6.css";
import {riddles} from "./riddles";
import {enemyPool} from "./enemyPool";

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const BOSS_LEVEL      = 7;
const BASE_XP_NEEDED  = 100;
const XP_SCALE        = 1.45;
const PLAYER_BASE_HP  = 100;
const PLAYER_BASE_DMG = 22;
const HP_PER_LEVEL    = 22;
const DMG_PER_LEVEL   = 5;
const RUNE_CHARS      = 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟᚫᚣᛡᛠ◆◇⬡⬢✦✧';
const BOSS_LETTERS    = ['A','D','M','I','N'];

const SCREENS = {
  TITLE:      'TITLE',
  BATTLE:     'BATTLE',
  BOSS_INTRO: 'BOSS_INTRO',
  LEVEL_UP:   'LEVEL_UP',
  GAME_OVER:  'GAME_OVER',
  VICTORY:    'VICTORY',
};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
function xpNeededForLevel(lvl) {
  return Math.floor(BASE_XP_NEEDED * Math.pow(XP_SCALE, lvl - 1));
}

function buildEnemy(template, playerLevel) {
  const maxHp = template.baseHp + template.hpPerLevel * (playerLevel - 1);
  return {
    ...template,
    currentHp: maxHp,
    maxHp,
    playerDamage: PLAYER_BASE_DMG + DMG_PER_LEVEL * (playerLevel - 1),
  };
}

function pickEnemyTemplate(playerLevel, bossTriggered) {
  if (playerLevel >= BOSS_LEVEL && !bossTriggered) return null;
  let pool;
  if      (playerLevel <= 2) pool = enemyPool.filter(e => e.tier === 1);
  else if (playerLevel <= 4) pool = enemyPool.filter(e => e.tier <= 2);
  else                       pool = enemyPool.filter(e => e.tier === 3 && !e.isBoss);
  if (!pool || pool.length === 0) pool = enemyPool.filter(e => !e.isBoss);
  return pool[Math.floor(Math.random() * pool.length)];
}

function pickRiddle(usedSet, totalCount) {
  if (usedSet.size >= totalCount) usedSet.clear();
  let idx;
  do { idx = Math.floor(Math.random() * totalCount); } while (usedSet.has(idx));
  usedSet.add(idx);
  return riddles[idx];
}

function freshPlayerState() {
  return {
    hp:       PLAYER_BASE_HP,
    maxHp:    PLAYER_BASE_HP,
    level:    1,
    xp:       0,
    xpNeeded: xpNeededForLevel(1),
    damage:   PLAYER_BASE_DMG,
  };
}

function normalise(s) {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g,'').replace(/\b(a|an|the)\b/g,'').trim();
}

function checkAnswer(input, correct) {
  const u = normalise(input);
  const c = normalise(correct);
  if (!u) return false;
  return u === c || c.includes(u) || u.includes(c);
}

// ═══════════════════════════════════════════════════════════════
// TITLE SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════
function TitleScreen({ onStart }) {
  const runeRef = useRef(null);

  useEffect(() => {
    const container = runeRef.current;
    if (!container) return;
    const runes = [];
    for (let i = 0; i < 22; i++) {
      const el = document.createElement('span');
      el.className = 'rune-particle';
      el.textContent = RUNE_CHARS[Math.floor(Math.random() * RUNE_CHARS.length)];
      el.style.left = Math.random() * 100 + '%';
      el.style.fontSize = (14 + Math.random() * 22) + 'px';
      el.style.animationDuration = (8 + Math.random() * 14) + 's';
      el.style.animationDelay = (-Math.random() * 14) + 's';
      el.style.opacity = (0.06 + Math.random() * 0.12);
      container.appendChild(el);
      runes.push(el);
    }
    return () => runes.forEach(r => r.remove());
  }, []);

  return (
    <div className="title-screen">
      <div className="rune-field" ref={runeRef} />
      <div className="torch-left" />
      <div className="torch-right" />
      <div className="title-content">
        <p className="title-eyebrow">A dungeon of riddles awaits</p>
        <h1 className="title-logo">
          <span className="title-logo-line1">ENIGMA</span>
          <span className="title-logo-line2">DUNGEON</span>
        </h1>
        <div className="title-ornament">
          <span className="orn-line" />
          <span className="orn-diamond">◆</span>
          <span className="orn-line" />
        </div>
        <p className="title-flavor">
          Words are your only weapon.<br />
          Wit is your only armor.<br />
          Answer wrong — and darkness wins.
        </p>
        <button className="btn title-btn" onClick={onStart}>
          ⚔&nbsp;&nbsp;Begin Quest
        </button>
        <p className="title-hint">Answer riddles · Defeat monsters · Face the ADMIN</p>
      </div>
      <div className="title-footer">
        <span>◆</span>
        <span className="footer-text">Riddle RPG</span>
        <span>◆</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HUD COMPONENT
// ═══════════════════════════════════════════════════════════════
function HUD({ player, enemy }) {
  const hpPct  = Math.max(0, (player.hp / player.maxHp) * 100);
  const xpPct  = Math.max(0, (player.xp / player.xpNeeded) * 100);
  const ehpPct = enemy ? Math.max(0, (enemy.currentHp / enemy.maxHp) * 100) : 0;

  return (
    <div className="hud">
      <div className="hud-player-block">
        <div className="hud-name">⚔ Hero</div>
        <div className="hud-bars">
          <div className="hud-bar-row">
            <span className="hud-bar-label">HP</span>
            <div className="hud-bar-track">
              <div className="hud-bar-fill hud-hp-fill" style={{ width: hpPct + '%' }} />
            </div>
            <span className="hud-bar-val">{Math.max(0, player.hp)}/{player.maxHp}</span>
          </div>
          <div className="hud-bar-row">
            <span className="hud-bar-label">XP</span>
            <div className="hud-bar-track">
              <div className="hud-bar-fill hud-xp-fill" style={{ width: xpPct + '%' }} />
            </div>
            <span className="hud-bar-val">{player.xp}/{player.xpNeeded}</span>
          </div>
        </div>
      </div>

      <div className="hud-level-badge">
        <span className="hud-level-num">{player.level}</span>
        <span className="hud-level-label">LVL</span>
      </div>

      {enemy && (
        <div className="hud-enemy-block">
          <div className={`hud-enemy-name ${enemy.isBoss ? 'hud-enemy-boss' : ''}`}>
            {enemy.name}
          </div>
          <div className="hud-bar-row hud-enemy-row">
            <span className="hud-bar-label">HP</span>
            <div className="hud-bar-track">
              <div
                className={`hud-bar-fill hud-enemy-fill ${enemy.isBoss ? 'hud-enemy-fill-boss' : ''}`}
                style={{ width: ehpPct + '%' }}
              />
            </div>
            <span className="hud-bar-val">{Math.max(0, enemy.currentHp)}/{enemy.maxHp}</span>
          </div>
          <div className="hud-enemy-dmg">⚔ {enemy.baseDamage} dmg/miss</div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BATTLE SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════
function BattleScreen({ enemy, riddle, onCorrect, onWrong, onHintUsed, screenShake }) {
  const [inputVal, setInputVal]     = useState('');
  const [inputState, setInputState] = useState('idle');
  const [hintShown, setHintShown]   = useState(false);
  const [feedback, setFeedback]     = useState(null);
  const [damages, setDamages]       = useState([]);
  const [logs, setLogs]             = useState([
    { text: 'The dungeon stirs. A challenger emerges…', cls: 'log-gold' }
  ]);
  const inputRef = useRef(null);
  const dmgIdRef = useRef(0);

  useEffect(() => {
    setInputVal('');
    setInputState('idle');
    setHintShown(false);
    setFeedback(null);
    if (inputRef.current) inputRef.current.focus();
  }, [riddle]);

  const addLog = useCallback((text, cls = '') => {
    setLogs(prev => [{ text, cls }, ...prev].slice(0, 5));
  }, []);

  const spawnDamage = useCallback((text, color) => {
    const id = ++dmgIdRef.current;
    const x = 15 + Math.random() * 50;
    const y = 20 + Math.random() * 30;
    setDamages(prev => [...prev, { id, text, color, x, y }]);
    setTimeout(() => setDamages(prev => prev.filter(d => d.id !== id)), 1100);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!inputVal.trim() || !riddle) return;
    if (checkAnswer(inputVal, riddle.answer)) {
      setInputState('correct');
      const dmg = enemy.playerDamage + Math.floor(Math.random() * 12);
      spawnDamage(`-${dmg}`, '#e74c3c');
      setFeedback({ text: `✓ Correct! The answer was "${riddle.answer}"`, type: 'correct' });
      addLog(`Correct! You strike the ${enemy.name} for ${dmg} damage!`, 'log-green');
      setTimeout(() => { setInputState('idle'); setFeedback(null); }, 1200);
      onCorrect(dmg, hintShown);
    } else {
      setInputState('wrong');
      const dmg = enemy.baseDamage + Math.floor(Math.random() * 10);
      setFeedback({ text: `✗ Wrong! You take ${dmg} damage!`, type: 'wrong' });
      addLog(`Wrong! The ${enemy.name} strikes you for ${dmg} damage.`, 'log-red');
      setTimeout(() => { setInputState('idle'); setFeedback(null); }, 1000);
      onWrong(dmg);
    }
  }, [inputVal, riddle, enemy, hintShown, onCorrect, onWrong, addLog, spawnDamage]);

  const handleKey = useCallback((e) => {
    if (e.key === 'Enter') handleSubmit();
  }, [handleSubmit]);

  const handleHint = () => {
    if (hintShown) return;
    setHintShown(true);
    onHintUsed();
  };

  const hintText = hintShown && riddle
    ? riddle.answer[0].toUpperCase() + '_ '.repeat(riddle.answer.length - 1).trim() + `  (${riddle.answer.length} letters)`
    : null;

  const bgStyle = enemy?.Image ? { backgroundImage: `url(${enemy.Image})` } : {};
  const glowColor = enemy?.glowColor || 'rgba(139,26,26,0.4)';

  return (
    <div className={`battle-screen ${screenShake ? 'screen-shake' : ''}`}>
      <div className="enemy-bg" style={bgStyle} data-hasbg={!!enemy?.Image}>
        {!enemy?.Image && (
          <div
            className={`enemy-emoji-display ${enemy?.isBoss ? 'enemy-emoji-boss' : ''}`}
            style={{ filter: `drop-shadow(0 0 40px ${glowColor})` }}
          >
            {enemy?.emoji || '👾'}
          </div>
        )}
        <div
          className="enemy-glow"
          style={{ background: `radial-gradient(ellipse at 50% 60%, ${glowColor} 0%, transparent 65%)` }}
        />
        <div className="battle-vignette" />
        {damages.map(d => (
          <div
            key={d.id}
            className="dmg-float"
            style={{ left: d.x + '%', top: d.y + '%', color: d.color }}
          >
            {d.text}
          </div>
        ))}
      </div>

      <div className="riddle-panel">
        <div className="riddle-panel-inner">
          <div className="panel-ornament">
            <span className="panel-orn-line" />
            <span className="panel-orn-text">◆ The Riddle ◆</span>
            <span className="panel-orn-line" />
          </div>

          <p className="riddle-text">{riddle?.question || '…'}</p>

          <div className="hint-row">
            {!hintShown ? (
              <button className="hint-btn" onClick={handleHint}>🔮 Reveal Hint</button>
            ) : (
              <span className="hint-revealed">{hintText}</span>
            )}
          </div>

          <div className="answer-row">
            <input
              ref={inputRef}
              className={`answer-input answer-${inputState}`}
              type="text"
              value={inputVal}
              onChange={e => setInputVal(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Speak your answer…"
              autoComplete="off"
              spellCheck="false"
            />
            <button className="btn btn-sm strike-btn" onClick={handleSubmit}>
              Strike
            </button>
          </div>

          {feedback && (
            <div className={`feedback feedback-${feedback.type}`}>
              {feedback.text}
            </div>
          )}

          <div className="combat-log">
            {logs.map((l, i) => (
              <p key={i} className={`log-line ${l.cls}`} style={{ opacity: 1 - i * 0.18 }}>
                {l.text}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// BOSS INTRO COMPONENT
// ═══════════════════════════════════════════════════════════════
function BossIntro({ onDismiss }) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400);
    const t2 = setTimeout(() => setPhase(2), 1200);
    const t3 = setTimeout(() => setPhase(3), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  return (
    <div className="boss-intro">
      <div className={`boss-fog ${phase >= 1 ? 'boss-fog-show' : ''}`} />

      {phase >= 1 && (
        <div className="boss-particles">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="boss-particle" style={{
              left: Math.random() * 100 + '%',
              animationDuration: (1.5 + Math.random() * 2) + 's',
              animationDelay: (Math.random() * 1.5) + 's',
              width: (2 + Math.random() * 4) + 'px',
              height: (2 + Math.random() * 4) + 'px',
            }} />
          ))}
        </div>
      )}

      <div className="boss-title-row">
        {BOSS_LETTERS.map((letter, i) => (
          <span
            key={i}
            className={`boss-letter ${phase >= 2 ? 'boss-letter-show' : ''}`}
            style={{ animationDelay: (i * 0.12) + 's' }}
          >
            {letter}
          </span>
        ))}
      </div>

      <div className={`boss-subtitle-block ${phase >= 3 ? 'boss-sub-show' : ''}`}>
        <p className="boss-subtitle">The Final Enigma Awakens</p>
        <p className="boss-warning">
          Answer wrong and face catastrophic punishment.<br/>
          Every riddle may be your last.
        </p>
        <button className="btn btn-blood boss-face-btn" onClick={onDismiss}>
          ☠ Face Your Doom
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LEVEL UP COMPONENT
// ═══════════════════════════════════════════════════════════════
function LevelUp({ level, hpGain, dmgGain, maxHp, damage, onContinue }) {
  return (
    <div className="levelup-overlay">
      <div className="levelup-box">
        <div className="levelup-sparks">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="spark" style={{
              '--angle': (i * 30) + 'deg',
              animationDelay: (i * 0.05) + 's',
            }} />
          ))}
        </div>
        <div className="levelup-eyebrow">✦ Level Up ✦</div>
        <div className="levelup-num">{level}</div>
        <div className="levelup-divider">
          <span className="ld-line" />
          <span className="ld-diamond">◆</span>
          <span className="ld-line" />
        </div>
        <p className="levelup-flavor">
          The dungeon recognises your growing power.<br />
          You grow stronger in the dark.
        </p>
        <div className="levelup-stats">
          <div className="lvl-stat">
            <span className="lvl-stat-icon">❤</span>
            <span className="lvl-stat-label">Max HP</span>
            <span className="lvl-stat-gain">+{hpGain}</span>
            <span className="lvl-stat-total">→ {maxHp}</span>
          </div>
          <div className="lvl-stat">
            <span className="lvl-stat-icon">⚔</span>
            <span className="lvl-stat-label">Attack</span>
            <span className="lvl-stat-gain">+{dmgGain}</span>
            <span className="lvl-stat-total">→ {damage}</span>
          </div>
        </div>
        <button className="btn levelup-btn" onClick={onContinue}>
          Descend Deeper
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// END SCREEN COMPONENT
// ═══════════════════════════════════════════════════════════════
function EndScreen({ won, stats, onRestart }) {
  return (
    <div className={`end-screen ${won ? 'end-victory' : 'end-defeat'}`}>
      <div className="end-bg" />
      <div className="end-vignette" />
      <div className="end-content">
        <div className="end-icon">{won ? '👑' : '⚰'}</div>
        <h1 className={`end-title ${won ? 'end-title-win' : 'end-title-lose'}`}>
          {won ? 'Triumphant' : 'Fallen'}
        </h1>
        <div className="end-ornament">
          <span className="end-orn-line" />
          <span className="end-orn-diamond">◆</span>
          <span className="end-orn-line" />
        </div>
        <p className="end-flavor">
          {won
            ? 'The ADMIN has been vanquished.\nThe dungeon\'s deepest riddle lies solved at your feet.\nYour legend echoes through these stone halls.'
            : 'The dungeon claimed another soul.\nYour riddles went unanswered, your torch extinguished.\nThe darkness remembers your name.'}
        </p>
        <div className="epitaph">
          <div className="epitaph-header">— Here Lies the Record —</div>
          <div className="score-grid">
            <div className="score-card">
              <div className="score-label">Level Reached</div>
              <div className="score-val">{stats.level}</div>
            </div>
            <div className="score-card">
              <div className="score-label">Enemies Slain</div>
              <div className="score-val">{stats.kills}</div>
            </div>
            <div className="score-card">
              <div className="score-label">Riddles Solved</div>
              <div className="score-val">{stats.correct}</div>
            </div>
            <div className="score-card">
              <div className="score-label">Wrong Answers</div>
              <div className="score-val">{stats.wrong}</div>
            </div>
          </div>
          <div className="score-accuracy">
            Accuracy: {stats.correct + stats.wrong > 0
              ? Math.round((stats.correct / (stats.correct + stats.wrong)) * 100)
              : 0}%
          </div>
        </div>
        <button className="btn end-btn" onClick={onRestart}>
          {won ? '⚔ Descend Again' : '⚔ Rise Again'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// GAME — ROOT COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function Game() {
  const [screen, setScreen]           = useState(SCREENS.TITLE);
  const [player, setPlayer]           = useState(freshPlayerState());
  const [enemy, setEnemy]             = useState(null);
  const [riddle, setRiddle]           = useState(null);
  const [levelUpData, setLevelUpData] = useState(null);
  const [shakeScreen, setShakeScreen] = useState(false);
  const [stats, setStats]             = useState({ level:1, kills:0, correct:0, wrong:0 });

  const usedRiddlesRef   = useRef(new Set());
  const bossTriggeredRef = useRef(false);
  const lockedRef        = useRef(false);

  // ── Start game ──
  const startGame = useCallback(() => {
    const p = freshPlayerState();
    usedRiddlesRef.current   = new Set();
    bossTriggeredRef.current = false;
    lockedRef.current        = false;

    const template = pickEnemyTemplate(p.level, false);
    const e = buildEnemy(template, p.level);
    const r = pickRiddle(usedRiddlesRef.current, riddles.length);

    setPlayer(p);
    setEnemy(e);
    setRiddle(r);
    setStats({ level:1, kills:0, correct:0, wrong:0 });
    setScreen(SCREENS.BATTLE);
  }, []);

  // ── Spawn next enemy ──
  const spawnNextEnemy = useCallback((currentPlayer) => {
    if (currentPlayer.level >= BOSS_LEVEL && !bossTriggeredRef.current) {
      bossTriggeredRef.current = true;
      setScreen(SCREENS.BOSS_INTRO);
      return;
    }
    const template = pickEnemyTemplate(currentPlayer.level, bossTriggeredRef.current);
    if (!template) {
      const fallback = enemyPool.find(e => e.tier === 1) || enemyPool[0];
      setEnemy(buildEnemy(fallback, currentPlayer.level));
    } else {
      setEnemy(buildEnemy(template, currentPlayer.level));
    }
    setRiddle(pickRiddle(usedRiddlesRef.current, riddles.length));
  }, []);

  // ── Spawn boss (ADMIN detected from enemyPool) ──
  const spawnBoss = useCallback((currentPlayer) => {
    const bossTemplate = enemyPool.find(e => e.isBoss || e.name === 'ADMIN');
    if (!bossTemplate) return;
    // Boss is dramatically amplified
    const amplifiedBoss = {
      ...bossTemplate,
      baseHp:      bossTemplate.baseHp      * 2,
      hpPerLevel:  bossTemplate.hpPerLevel  * 2,
      baseDamage:  bossTemplate.baseDamage  * 2,
      xpReward:    bossTemplate.xpReward    * 3,
    };
    const boss = buildEnemy(amplifiedBoss, currentPlayer.level);
    setEnemy(boss);
    setRiddle(pickRiddle(usedRiddlesRef.current, riddles.length));
    setScreen(SCREENS.BATTLE);
  }, []);

  // ── Handle correct answer ──
  const handleCorrect = useCallback((damage, hintUsed) => {
    if (lockedRef.current) return;
    lockedRef.current = true;

    setStats(s => ({ ...s, correct: s.correct + 1 }));

    setEnemy(prev => {
      const newHp  = prev.currentHp - damage;
      const isBoss = !!prev.isBoss;

      if (newHp <= 0) {
        setTimeout(() => {
          if (isBoss) {
            setStats(s => ({ ...s, kills: s.kills + 1 }));
            setTimeout(() => setScreen(SCREENS.VICTORY), 400);
            lockedRef.current = false;
            return;
          }

          const xpGain = prev.xpReward;
          setPlayer(p => {
            let newXp    = p.xp + xpGain;
            let newLevel = p.level;
            let newMaxHp = p.maxHp;
            let newDmg   = p.damage;
            let hpGain   = 0;
            let dmgGain  = 0;
            let levelled = false;
            let xpNeeded = p.xpNeeded;

            while (newXp >= xpNeeded) {
              newXp -= xpNeeded;
              newLevel++;
              hpGain   += HP_PER_LEVEL;
              dmgGain  += DMG_PER_LEVEL;
              newMaxHp += HP_PER_LEVEL;
              newDmg   += DMG_PER_LEVEL;
              xpNeeded  = xpNeededForLevel(newLevel);
              levelled  = true;
            }

            const newPlayerHp = Math.min(p.hp + Math.floor(hpGain * 0.4), newMaxHp);
            const updated = {
              ...p,
              xp: newXp, xpNeeded,
              level: newLevel,
              maxHp: newMaxHp,
              hp: levelled ? newPlayerHp : p.hp,
              damage: newDmg,
            };

            if (levelled) {
              setLevelUpData({ level: newLevel, hpGain, dmgGain, maxHp: newMaxHp, damage: newDmg });
              setScreen(SCREENS.LEVEL_UP);
              setStats(s => ({ ...s, level: newLevel, kills: s.kills + 1 }));
            } else {
              setStats(s => ({ ...s, kills: s.kills + 1 }));
              setTimeout(() => {
                spawnNextEnemy(updated);
                lockedRef.current = false;
              }, 300);
            }

            return updated;
          });
        }, 600);

        return { ...prev, currentHp: 0 };
      }

      // Enemy still alive – next riddle
      setTimeout(() => {
        setRiddle(pickRiddle(usedRiddlesRef.current, riddles.length));
        lockedRef.current = false;
      }, 700);

      return { ...prev, currentHp: newHp };
    });
  }, [spawnNextEnemy]);

  // ── Handle wrong answer ──
  const handleWrong = useCallback((damage) => {
    if (lockedRef.current) return;
    lockedRef.current = true;

    setStats(s => ({ ...s, wrong: s.wrong + 1 }));
    setShakeScreen(true);
    setTimeout(() => setShakeScreen(false), 500);

    setPlayer(prev => {
      const newHp = prev.hp - damage;
      if (newHp <= 0) {
        setTimeout(() => setScreen(SCREENS.GAME_OVER), 600);
        return { ...prev, hp: 0 };
      }
      setTimeout(() => {
        setRiddle(pickRiddle(usedRiddlesRef.current, riddles.length));
        lockedRef.current = false;
      }, 700);
      return { ...prev, hp: newHp };
    });
  }, []);

  // ── Level up continue ──
  const handleLevelUpContinue = useCallback(() => {
    setScreen(SCREENS.BATTLE);
    setLevelUpData(null);
    lockedRef.current = false;

    setPlayer(p => {
      if (p.level >= BOSS_LEVEL && !bossTriggeredRef.current) {
        bossTriggeredRef.current = true;
        setTimeout(() => setScreen(SCREENS.BOSS_INTRO), 50);
        return p;
      }
      setTimeout(() => spawnNextEnemy(p), 100);
      return p;
    });
  }, [spawnNextEnemy]);

  // ── Boss dismissed ──
  const handleBossDismiss = useCallback(() => {
    setPlayer(p => {
      spawnBoss(p);
      return p;
    });
  }, [spawnBoss]);

  const handleHintUsed = useCallback(() => {}, []);

  const handleRestart = useCallback(() => {
    setScreen(SCREENS.TITLE);
  }, []);

  useEffect(() => {
    setStats(s => ({ ...s, level: player.level }));
  }, [player.level]);

  return (
    <div style={{ width:'100%', height:'100vh', position:'relative', overflow:'hidden', background:'#080604' }}>
      {screen === SCREENS.TITLE && (
        <TitleScreen onStart={startGame} />
      )}

      {(screen === SCREENS.BATTLE || screen === SCREENS.LEVEL_UP) && (
        <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
          <HUD player={player} enemy={enemy} />
          <BattleScreen
            enemy={enemy}
            riddle={riddle}
            onCorrect={handleCorrect}
            onWrong={handleWrong}
            onHintUsed={handleHintUsed}
            screenShake={shakeScreen}
          />
        </div>
      )}

      {screen === SCREENS.LEVEL_UP && levelUpData && (
        <LevelUp
          level={levelUpData.level}
          hpGain={levelUpData.hpGain}
          dmgGain={levelUpData.dmgGain}
          maxHp={levelUpData.maxHp}
          damage={levelUpData.damage}
          onContinue={handleLevelUpContinue}
        />
      )}

      {screen === SCREENS.BOSS_INTRO && (
        <BossIntro onDismiss={handleBossDismiss} />
      )}

      {screen === SCREENS.GAME_OVER && (
        <EndScreen won={false} stats={stats} onRestart={handleRestart} />
      )}

      {screen === SCREENS.VICTORY && (
        <EndScreen won={true} stats={stats} onRestart={handleRestart} />
      )}
    </div>
  );
}
