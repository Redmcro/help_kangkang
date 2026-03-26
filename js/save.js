// ===== SaveManager =====
// v2: Handles localStorage persistence for legacy/meta-progression data

const SAVE_KEY = 'kk2';
const SAVE_VERSION = 2;

const DEFAULT_LEGACY = {
    version: SAVE_VERSION,
    coins: 0,
    best_month: 0,
    runs: 0,
    wins: 0,
    endings_unlocked: [],
    total_tokens_spent: 0,
    total_bugs_fixed: 0
};

export function loadLegacy() {
    try {
        const d = localStorage.getItem(SAVE_KEY);
        if (!d) return { ...DEFAULT_LEGACY, endings_unlocked: [] };
        const parsed = JSON.parse(d);
        // Version migration: reset if old format
        if (!parsed.version || parsed.version < SAVE_VERSION) {
            console.warn('Old save format detected, resetting');
            return { ...DEFAULT_LEGACY, endings_unlocked: [] };
        }
        return parsed;
    } catch {
        console.warn('Save data corrupted, resetting');
        return { ...DEFAULT_LEGACY, endings_unlocked: [] };
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
