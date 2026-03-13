import './Settings.css';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '../../api/auth';
import BackButton from '../BackButton';

const SETTINGS_KEY = 'jq_settings';

const DEFAULT_SETTINGS = {
    soundEffects: true,
    reducedMotion: false,
    showHints: true,
    preferredDifficulty: 'medium',
    quizLength: 10,
    dailyGoal: 20,
};

function readStoredSettings() {
    try {
        const raw = localStorage.getItem(SETTINGS_KEY);
        if (!raw) return DEFAULT_SETTINGS;
        return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch (error) {
        return DEFAULT_SETTINGS;
    }
}

function Settings() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [settings, setSettings] = useState(DEFAULT_SETTINGS);
    const [saveMessage, setSaveMessage] = useState('');

    useEffect(() => {
        const currentUser = auth.getCurrentUser();
        if (!currentUser) {
            navigate('/login');
            return;
        }

        setUser(currentUser);
        setSettings(readStoredSettings());
    }, [navigate]);

    useEffect(() => {
        if (!user) return;

        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        setSaveMessage('SYS.MSG: PREFERENCES SAVED LOCALLY');

        const timeoutId = window.setTimeout(() => {
            setSaveMessage('');
        }, 1600);

        return () => window.clearTimeout(timeoutId);
    }, [settings, user]);

    const selectedAvatar = useMemo(() => {
        return auth.AVATAR_OPTIONS.find((avatar) => avatar.id === user?.avatarId) || auth.AVATAR_OPTIONS[0];
    }, [user]);

    const updatePreference = (key, value) => {
        setSettings((current) => ({ ...current, [key]: value }));
    };

    const selectAvatar = (avatarId) => {
        const nextUser = auth.updateCurrentUser({ avatarId });
        if (nextUser) {
            setUser(nextUser);
            setSaveMessage('SYS.MSG: AVATAR OVERRIDE SUCCESSFUL');
        }
    };

    const clearLearningData = () => {
        const keysToRemove = [
            'jq_progress',
            'jq_games',
            'jq_scores',
            'jq_lastVisitedTopics',
            'jq_videoProgress',
            'jq_completedVideos'
        ];

        keysToRemove.forEach((key) => localStorage.removeItem(key));
        setSaveMessage('SYS.MSG: LOCAL CACHE PURGED');
    };

    const handleLogout = () => {
        auth.logout();
        navigate('/login');
    };

    if (!user) {
        return null;
    }

    return (
        <div className="cyber-settings-page">
            <div className="cyber-settings-shell">
                
                {/* TOP BAR */}
                <div className="cyber-topbar">
                    <BackButton />
                    <button type="button" className="cyber-ghost-btn" onClick={() => navigate('/dashboard')}>
                        [ RETURN TO DASHBOARD ]
                    </button>
                </div>

                {/* HERO / HEADER */}
                <div className="cyber-hero">
                    <div className="hero-text-block">
                        <p className="cyber-kicker gold-text">USER PREFERENCES</p>
                        <h1 className="pixel-title text-shadow-blue">SYSTEM CONFIG</h1>
                        <p className="cyber-subtitle blue-text">
                            &gt; Calibrate your parameters, select your digital avatar, and manage system memory.
                        </p>
                    </div>
                    <div className="cyber-profile-card">
                        <div className="cyber-avatar-preview border-cyan">{selectedAvatar.emoji}</div>
                        <div className="profile-details">
                            <h2 className="cyan-text">{user.name}</h2>
                            <p className="gray-text">{user.email}</p>
                            <span className="cyber-role-badge bg-magenta">{user.role}</span>
                        </div>
                    </div>
                </div>

                {/* SAVE NOTIFICATION BANNER */}
                {saveMessage && (
                    <div className="cyber-banner blink">
                        {saveMessage}
                    </div>
                )}

                {/* GRID PANELS */}
                <div className="cyber-settings-grid">
                    
                    {/* AVATAR SECTION */}
                    <section className="cyber-card border-magenta">
                        <div className="cyber-card-header bg-magenta">
                            <h3>OPERATIVE ID</h3>
                            <p>Select your visual representation for the grid.</p>
                        </div>
                        <div className="cyber-avatar-grid">
                            {auth.AVATAR_OPTIONS.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    type="button"
                                    className={`cyber-avatar-option ${user.avatarId === avatar.id ? 'active-avatar' : ''}`}
                                    onClick={() => selectAvatar(avatar.id)}
                                >
                                    <span className="cyber-avatar-emoji">{avatar.emoji}</span>
                                    <span className="avatar-name">{avatar.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* LEARNING PREFS SECTION */}
                    <section className="cyber-card border-cyan">
                        <div className="cyber-card-header bg-cyan">
                            <h3>SIMULATION PARAMETERS</h3>
                            <p>Set base difficulties and targets for your sessions.</p>
                        </div>
                        <div className="cyber-card-body">
                            <label className="cyber-field">
                                <span className="field-label">THREAT LEVEL (DIFFICULTY)</span>
                                <select
                                    className="cyber-select"
                                    value={settings.preferredDifficulty}
                                    onChange={(event) => updatePreference('preferredDifficulty', event.target.value)}
                                >
                                    <option value="easy">EASY (NOVICE)</option>
                                    <option value="medium">MEDIUM (STANDARD)</option>
                                    <option value="hard">HARD (VETERAN)</option>
                                </select>
                            </label>

                            <label className="cyber-field">
                                <span className="field-label">STAGES PER RUN (QUIZ LENGTH)</span>
                                <select
                                    className="cyber-select"
                                    value={settings.quizLength}
                                    onChange={(event) => updatePreference('quizLength', Number(event.target.value))}
                                >
                                    <option value={5}>5 STAGES</option>
                                    <option value={10}>10 STAGES</option>
                                    <option value={15}>15 STAGES</option>
                                    <option value={20}>20 STAGES</option>
                                </select>
                            </label>

                            <label className="cyber-field">
                                <span className="field-label">DAILY UPTIME GOAL</span>
                                <select
                                    className="cyber-select"
                                    value={settings.dailyGoal}
                                    onChange={(event) => updatePreference('dailyGoal', Number(event.target.value))}
                                >
                                    <option value={10}>10 MINUTES</option>
                                    <option value={20}>20 MINUTES</option>
                                    <option value={30}>30 MINUTES</option>
                                    <option value={45}>45 MINUTES</option>
                                </select>
                            </label>
                        </div>
                    </section>

                    {/* SENSORY SETTINGS SECTION */}
                    <section className="cyber-card border-gold">
                        <div className="cyber-card-header bg-gold">
                            <h3>SENSORY FEEDBACK</h3>
                            <p>Adjust visual and auditory system responses.</p>
                        </div>
                        <div className="cyber-card-body">
                            <label className="cyber-toggle-row">
                                <div className="toggle-info">
                                    <strong className="gold-text">AUDIO CUES</strong>
                                    <p>Enable game and menu sound effects.</p>
                                </div>
                                <input
                                    className="cyber-checkbox border-gold"
                                    type="checkbox"
                                    checked={settings.soundEffects}
                                    onChange={(event) => updatePreference('soundEffects', event.target.checked)}
                                />
                            </label>

                            <label className="cyber-toggle-row">
                                <div className="toggle-info">
                                    <strong className="gold-text">STATIC RENDER (REDUCED MOTION)</strong>
                                    <p>Minimize UI animations for performance.</p>
                                </div>
                                <input
                                    className="cyber-checkbox border-gold"
                                    type="checkbox"
                                    checked={settings.reducedMotion}
                                    onChange={(event) => updatePreference('reducedMotion', event.target.checked)}
                                />
                            </label>

                            <label className="cyber-toggle-row">
                                <div className="toggle-info">
                                    <strong className="gold-text">GUIDANCE MODULE (HINTS)</strong>
                                    <p>Display helper text during simulations.</p>
                                </div>
                                <input
                                    className="cyber-checkbox border-gold"
                                    type="checkbox"
                                    checked={settings.showHints}
                                    onChange={(event) => updatePreference('showHints', event.target.checked)}
                                />
                            </label>
                        </div>
                    </section>

                    {/* SYSTEM COMMANDS SECTION */}
                    <section className="cyber-card border-red">
                        <div className="cyber-card-header bg-red">
                            <h3>SYSTEM OVERRIDES</h3>
                            <p>Critical commands. Actions cannot be undone.</p>
                        </div>
                        <div className="cyber-card-body">
                            <div className="cyber-action-stack">
                                <button type="button" className="cyber-btn btn-hollow-red" onClick={clearLearningData}>
                                    [ PURGE CACHE ]
                                </button>
                                <button type="button" className="cyber-btn btn-solid-green pulse-btn" onClick={() => navigate('/play/quiz-select')}>
                                    [ INITIATE MISSION ]
                                </button>
                                <button type="button" className="cyber-btn btn-solid-red" onClick={handleLogout}>
                                    [ TERMINATE SESSION ]
                                </button>
                            </div>
                        </div>
                    </section>

                </div>
            </div>
        </div>
    );
}

export default Settings;