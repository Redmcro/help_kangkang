// ===== SaveManager =====
// Handles localStorage persistence for legacy data

const SAVE_KEY = 'kk2';
const DEFAULT_LEGACY = { coins: 0, best: 0, runs: 0, wins: 0 };

export function loadLegacy() {
    try {
        const d = localStorage.getItem(SAVE_KEY);
        return d ? JSON.parse(d) : { ...DEFAULT_LEGACY };
    } catch {
        console.warn('Save data corrupted, resetting');
        return { ...DEFAULT_LEGACY };
    }
}

export function saveLegacy(data) {
    try {
        localStorage.setItem(SAVE_KEY, JSON.stringify(data));
    } catch {
        console.warn('Failed to save data');
    }
}
