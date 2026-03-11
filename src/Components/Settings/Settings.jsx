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
        setSaveMessage('Preferences saved locally');

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
            setSaveMessage('Avatar updated');
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
        setSaveMessage('Local learning cache cleared');
    };

    const handleLogout = () => {
        auth.logout();
        navigate('/login');
    };

    if (!user) {
        return null;
    }

    return (
        <div className="settings-page">
            <div className="settings-shell">
                <div className="settings-topbar">
                    <BackButton />
                    <button type="button" className="settings-ghost" onClick={() => navigate('/dashboard')}>
                        Dashboard
                    </button>
                </div>

                <div className="settings-hero">
                    <div>
                        <p className="settings-kicker">Student preferences</p>
                        <h1>Settings</h1>
                        <p className="settings-subtitle">
                            Tune your quiz experience, update your avatar, and manage what stays on this device.
                        </p>
                    </div>
                    <div className="settings-profile-card">
                        <span className="settings-avatar-preview">{selectedAvatar.emoji}</span>
                        <div>
                            <h2>{user.name}</h2>
                            <p>{user.email}</p>
                            <span className="settings-role">{user.role}</span>
                        </div>
                    </div>
                </div>

                {saveMessage && <div className="settings-banner">{saveMessage}</div>}

                <div className="settings-grid">
                    <section className="settings-card">
                        <div className="settings-card-header">
                            <h3>Profile</h3>
                            <p>Pick the avatar that appears in your learning space.</p>
                        </div>
                        <div className="settings-avatar-grid">
                            {auth.AVATAR_OPTIONS.map((avatar) => (
                                <button
                                    key={avatar.id}
                                    type="button"
                                    className={`settings-avatar-option ${user.avatarId === avatar.id ? 'active' : ''}`}
                                    onClick={() => selectAvatar(avatar.id)}
                                >
                                    <span className="settings-avatar-emoji">{avatar.emoji}</span>
                                    <span>{avatar.name}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="settings-card">
                        <div className="settings-card-header">
                            <h3>Learning preferences</h3>
                            <p>Set defaults that make quizzes feel right for you.</p>
                        </div>

                        <label className="settings-field">
                            <span>Preferred difficulty</span>
                            <select
                                value={settings.preferredDifficulty}
                                onChange={(event) => updatePreference('preferredDifficulty', event.target.value)}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </label>

                        <label className="settings-field">
                            <span>Default quiz length</span>
                            <select
                                value={settings.quizLength}
                                onChange={(event) => updatePreference('quizLength', Number(event.target.value))}
                            >
                                <option value={5}>5 questions</option>
                                <option value={10}>10 questions</option>
                                <option value={15}>15 questions</option>
                                <option value={20}>20 questions</option>
                            </select>
                        </label>

                        <label className="settings-field">
                            <span>Daily learning goal</span>
                            <select
                                value={settings.dailyGoal}
                                onChange={(event) => updatePreference('dailyGoal', Number(event.target.value))}
                            >
                                <option value={10}>10 minutes</option>
                                <option value={20}>20 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={45}>45 minutes</option>
                            </select>
                        </label>
                    </section>

                    <section className="settings-card">
                        <div className="settings-card-header">
                            <h3>Experience</h3>
                            <p>Control how lively the app feels on this device.</p>
                        </div>

                        <label className="settings-toggle-row">
                            <div>
                                <strong>Sound effects</strong>
                                <p>Keep game and quiz feedback sounds enabled.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.soundEffects}
                                onChange={(event) => updatePreference('soundEffects', event.target.checked)}
                            />
                        </label>

                        <label className="settings-toggle-row">
                            <div>
                                <strong>Reduced motion</strong>
                                <p>Use fewer animations for a calmer interface.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.reducedMotion}
                                onChange={(event) => updatePreference('reducedMotion', event.target.checked)}
                            />
                        </label>

                        <label className="settings-toggle-row">
                            <div>
                                <strong>Show hints</strong>
                                <p>Keep helper cues visible in learning flows.</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settings.showHints}
                                onChange={(event) => updatePreference('showHints', event.target.checked)}
                            />
                        </label>
                    </section>

                    <section className="settings-card settings-card-accent">
                        <div className="settings-card-header">
                            <h3>Account actions</h3>
                            <p>Use these carefully. They affect only this browser.</p>
                        </div>

                        <div className="settings-action-stack">
                            <button type="button" className="settings-secondary" onClick={clearLearningData}>
                                Clear local progress cache
                            </button>
                            <button type="button" className="settings-primary" onClick={() => navigate('/play/quiz-select')}>
                                Start a quiz
                            </button>
                            <button type="button" className="settings-danger" onClick={handleLogout}>
                                Log out
                            </button>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default Settings;