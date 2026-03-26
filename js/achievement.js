// ===== AchievementManager =====
// Module 3 (礼部): Cross-reincarnation achievement detection & tracking
// Loads achievements.json, checks conditions against legacy save data

import { addToLegacySet } from './save.js';

export class AchievementManager {
    constructor() {
        /** @type {Object<string, Object>} achievement definitions keyed by ID */
        this._defs = {};
        /** @type {Object|null} bound legacy save object */
        this._legacy = null;
        /** @type {Array<Function>} unlock callbacks */
        this._onUnlockCallbacks = [];
    }

    /**
     * Load achievement definitions from data/achievements.json
     */
    async load() {
        const resp = await fetch('data/achievements.json');
        if (!resp.ok) throw new Error(`Failed to load achievements.json: ${resp.status}`);
        this._defs = await resp.json();
    }

    /**
     * Bind a legacy save object — achievement checks read/write to this object
     * @param {Object} legacy - The legacy save object from SaveManager
     */
    bind(legacy) {
        this._legacy = legacy;
    }

    /**
     * Check all achievements against current legacy data.
     * Newly unlocked achievements are added to legacy.achievements_unlocked
     * and callbacks are fired.
     * @returns {Array<Object>} List of newly unlocked achievements (with id + definition)
     */
    check() {
        if (!this._legacy) return [];

        const newlyUnlocked = [];
        const alreadyUnlocked = this._legacy.achievements_unlocked || [];

        for (const [id, def] of Object.entries(this._defs)) {
            // Skip if already unlocked
            if (alreadyUnlocked.includes(id)) continue;

            // Evaluate condition
            if (this._evaluate(def.condition)) {
                // Mark as unlocked in legacy data
                addToLegacySet(this._legacy, 'achievements_unlocked', id);

                // Award coins
                if (def.reward) {
                    this._legacy.coins = (this._legacy.coins || 0) + def.reward;
                }

                const entry = { id, ...def };
                newlyUnlocked.push(entry);

                // Fire callbacks
                for (const cb of this._onUnlockCallbacks) {
                    try { cb(entry); } catch (e) { console.error('Achievement callback error:', e); }
                }
            }
        }

        return newlyUnlocked;
    }

    /**
     * Return all achievement definitions
     * @returns {Object<string, Object>}
     */
    getAll() {
        return this._defs;
    }

    /**
     * Return the set of unlocked achievement IDs
     * @returns {Array<string>}
     */
    getUnlockedIds() {
        if (!this._legacy) return [];
        return this._legacy.achievements_unlocked || [];
    }

    /**
     * Register a callback for when an achievement is unlocked
     * @param {Function} callback - receives { id, icon, name, desc, reward, ... }
     */
    onUnlock(callback) {
        if (typeof callback === 'function') {
            this._onUnlockCallbacks.push(callback);
        }
    }

    // ── Private: condition evaluators ──────────────────────────

    /**
     * Evaluate a single achievement condition against legacy data
     * @param {Object} cond - condition object from achievements.json
     * @returns {boolean}
     */
    _evaluate(cond) {
        if (!cond || !cond.type) return false;

        switch (cond.type) {
            case 'stat_gte':
                return this._evalStatGte(cond);
            case 'ending_unlocked':
                return this._evalEndingUnlocked(cond);
            case 'endings_all':
                return this._evalEndingsAll(cond);
            case 'events_count_gte':
                return this._evalEventsCountGte(cond);
            case 'flag':
                return this._evalFlag(cond);
            default:
                console.warn(`Unknown achievement condition type: ${cond.type}`);
                return false;
        }
    }

    /** stat_gte: legacy[stat] >= value */
    _evalStatGte(cond) {
        const val = this._legacy[cond.stat];
        return typeof val === 'number' && val >= cond.value;
    }

    /** ending_unlocked: endingId in legacy.endings_unlocked */
    _evalEndingUnlocked(cond) {
        const endings = this._legacy.endings_unlocked;
        return Array.isArray(endings) && endings.includes(cond.endingId);
    }

    /** endings_all: every endingId in legacy.endings_unlocked */
    _evalEndingsAll(cond) {
        const endings = this._legacy.endings_unlocked;
        if (!Array.isArray(endings) || !Array.isArray(cond.endingIds)) return false;
        return cond.endingIds.every(id => endings.includes(id));
    }

    /** events_count_gte: legacy.events_seen.length >= value */
    _evalEventsCountGte(cond) {
        const seen = this._legacy.events_seen;
        return Array.isArray(seen) && seen.length >= cond.value;
    }

    /** flag: legacy[flagName] === true */
    _evalFlag(cond) {
        return this._legacy[cond.flagName] === true;
    }
}
