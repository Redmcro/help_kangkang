// ===== SaveManager =====
// Handles localStorage persistence for legacy data

const SAVE_KEY = 'kk2';

export function loadLegacy() {
    const d = localStorage.getItem(SAVE_KEY);
    return d ? JSON.parse(d) : { coins: 0, best: 0, runs: 0, wins: 0 };
}

export function saveLegacy(data) {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}
