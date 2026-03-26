// ===== SaveManager =====
// v2: Handles localStorage persistence for legacy/meta-progression data

const SAVE_KEY = 'kk2';
const AUDIO_KEY = 'kk2_audio';
const SAVE_VERSION = 2;

const DEFAULT_LEGACY = {
    version: SAVE_VERSION,
    coins: 0,
    best_month: 0,
    runs: 0,
    wins: 0,
    endings_unlocked: [],
    events_seen: [],
    achievements_unlocked: [],
    total_tokens_spent: 0,
    total_bugs_fixed: 0,
    total_money_earned: 0
};

export function loadLegacy() {
    try {
        const d = localStorage.getItem(SAVE_KEY);
        if (!d) return { ...DEFAULT_LEGACY, endings_unlocked: [], events_seen: [], achievements_unlocked: [] };
        const parsed = JSON.parse(d);
        if (!parsed.version || parsed.version < SAVE_VERSION) {
            console.warn('Old save format detected, resetting');
            return { ...DEFAULT_LEGACY, endings_unlocked: [], events_seen: [], achievements_unlocked: [] };
        }
        const merged = { ...DEFAULT_LEGACY, ...parsed };
        // Array safety checks — ensure arrays are always arrays
        if (!Array.isArray(merged.endings_unlocked)) merged.endings_unlocked = [];
        if (!Array.isArray(merged.events_seen)) merged.events_seen = [];
        if (!Array.isArray(merged.achievements_unlocked)) merged.achievements_unlocked = [];
        return merged;
    } catch {
        console.warn('Save data corrupted, resetting');
        return { ...DEFAULT_LEGACY, endings_unlocked: [], events_seen: [], achievements_unlocked: [] };
    }
}

export function saveLegacy(data) {
    try {
        data.version = SAVE_VERSION;
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
        console.warn('Failed to save data');
    }
}

/**
 * Add a value to an array field in legacy data (deduplicated).
 * Used by engine.js to track endings, events_seen, achievements, etc.
 * @param {Object} legacy - The legacy save object
 * @param {string} field - Array field name (e.g. 'events_seen', 'endings_unlocked', 'achievements_unlocked')
 * @param {*} value - The value to add
 */
export function addToLegacySet(legacy, field, value) {
    if (!Array.isArray(legacy[field])) {
        legacy[field] = [];
    }
    if (!legacy[field].includes(value)) {
        legacy[field].push(value);
    }
}

// ===== Audio Preferences =====

const DEFAULT_AUDIO_PREFS = {
    sfxVolume: 0.7,
    bgmVolume: 0.4,
    muted: false
};

export function loadAudioPrefs() {
    try {
        const d = localStorage.getItem(AUDIO_KEY);
        if (!d) return { ...DEFAULT_AUDIO_PREFS };
        return { ...DEFAULT_AUDIO_PREFS, ...JSON.parse(d) };
    } catch {
        return { ...DEFAULT_AUDIO_PREFS };
    }
}

export function saveAudioPrefs(prefs) {
    try {
        localStorage.setItem(AUDIO_KEY, JSON.stringify(prefs));
    } catch {
        console.warn('Failed to save audio preferences');
    }
}
