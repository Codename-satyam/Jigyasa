const SETTINGS_KEY = 'jq_settings';
const DAILY_MINUTES_KEY = 'jq_daily_minutes';

export const DEFAULT_SETTINGS = {
  soundEffects: true,
  reducedMotion: false,
  showHints: true,
  preferredDifficulty: 'medium',
  quizLength: 10,
  dailyGoal: 20,
};

const SETTINGS_EVENT = 'jq:settings-changed';

function safeReadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export function getUserSettings() {
  const stored = safeReadJson(SETTINGS_KEY, {});
  return { ...DEFAULT_SETTINGS, ...stored };
}

export function saveUserSettings(nextSettings) {
  const merged = { ...DEFAULT_SETTINGS, ...nextSettings };
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent(SETTINGS_EVENT, { detail: merged }));
  return merged;
}

export function subscribeSettingsChanges(listener) {
  const handleCustom = (event) => {
    listener(event?.detail || getUserSettings());
  };

  const handleStorage = (event) => {
    if (event.key === SETTINGS_KEY) {
      listener(getUserSettings());
    }
  };

  window.addEventListener(SETTINGS_EVENT, handleCustom);
  window.addEventListener('storage', handleStorage);

  return () => {
    window.removeEventListener(SETTINGS_EVENT, handleCustom);
    window.removeEventListener('storage', handleStorage);
  };
}

export function applySettingsToDocument(settings = getUserSettings()) {
  const reduced = Boolean(settings.reducedMotion);
  document.documentElement.classList.toggle('reduced-motion', reduced);
  document.body.classList.toggle('reduced-motion', reduced);
}

let audioGuardInstalled = false;

export function installSoundEffectsGuard() {
  if (audioGuardInstalled || typeof HTMLMediaElement === 'undefined') return;

  const originalPlay = HTMLMediaElement.prototype.play;
  HTMLMediaElement.prototype.play = function guardedPlay(...args) {
    if (this instanceof HTMLAudioElement) {
      const { soundEffects } = getUserSettings();
      if (!soundEffects) {
        this.pause();
        this.currentTime = 0;
        return Promise.resolve();
      }
    }

    return originalPlay.apply(this, args);
  };

  audioGuardInstalled = true;
}

function getTodayKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDailyMinutesProgress() {
  const stored = safeReadJson(DAILY_MINUTES_KEY, null);
  const today = getTodayKey();

  if (!stored || stored.date !== today) {
    return { date: today, minutes: 0 };
  }

  return {
    date: stored.date,
    minutes: Number(stored.minutes) || 0,
  };
}

export function addDailyLearningMinutes(minutesToAdd) {
  const safeMinutes = Math.max(0, Number(minutesToAdd) || 0);
  if (!safeMinutes) return getDailyMinutesProgress();

  const current = getDailyMinutesProgress();
  const next = {
    date: current.date,
    minutes: current.minutes + safeMinutes,
  };

  localStorage.setItem(DAILY_MINUTES_KEY, JSON.stringify(next));
  return next;
}

export function clearDailyMinutesProgress() {
  localStorage.removeItem(DAILY_MINUTES_KEY);
}
