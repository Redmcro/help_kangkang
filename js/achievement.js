// ===== AchievementManager =====
// Checks and tracks achievements across reincarnations.
// Pure logic — no DOM access.

export class AchievementManager {
    #definitions = [];   // loaded from achievements.json
    #unlocked = [];      // reference to legacy.achievements_unlocked
    #legacy = null;      // reference to the full legacy object
    #callbacks = [];     // onUnlock listeners

    /**
     * Load achievement definitions from JSON.
     */
    async load() {
        try {
            const resp = await fetch('./data/achievements.json');
            if (!resp.ok) throw new Error('Failed to load achievements.json');
            this.#definitions = await resp.json();
            console.log(`Loaded ${this.#definitions.length} achievements`);
        } catch (e) {
            console.error('Achievement loading failed:', e);
            this.#definitions = [];
        }
    }

    /**
     * Bind to legacy save data (call after loading save).
     */
    bind(legacy) {
        this.#legacy = legacy;
        this.#unlocked = legacy.achievements_unlocked || [];
    }

    /**
     * Register a callback for when an achievement unlocks.
     * callback(achievement) — receives the full achievement object.
     */
    onUnlock(callback) {
        this.#callbacks.push(callback);
    }

    /**
     * Check all achievements against current legacy state.
     * Call this at key moments (game end, month end, etc.).
     * Returns array of newly unlocked achievements.
     */
    check() {
        if (!this.#legacy) return [];

        const newlyUnlocked = [];

        for (const ach of this.#definitions) {
            // Skip already unlocked
            if (this.#unlocked.includes(ach.id)) continue;

            if (this.#evaluate(ach.condition)) {
                this.#unlocked.push(ach.id);
                newlyUnlocked.push(ach);

                // Apply reward
                if (ach.reward?.coins) {
                    this.#legacy.coins += ach.reward.coins;
                }

                // Notify listeners
                for (const cb of this.#callbacks) {
                    try { cb(ach); } catch (e) { console.error('Achievement callback error:', e); }
                }
            }
        }

        // Sync back to legacy
        if (newlyUnlocked.length > 0) {
            this.#legacy.achievements_unlocked = this.#unlocked;
        }

        return newlyUnlocked;
    }

    /**
     * Get all achievement definitions (for gallery display).
     */
    getAll() {
        return this.#definitions;
    }

    /**
     * Get set of unlocked achievement IDs.
     */
    getUnlockedIds() {
        return new Set(this.#unlocked);
    }

    /**
     * Get counts for UI display.
     */
    getProgress() {
        return {
            total: this.#definitions.length,
            unlocked: this.#unlocked.length
        };
    }

    // ===== Private: condition evaluation =====

    #evaluate(cond) {
        if (!cond || !cond.type) return false;
        const leg = this.#legacy;

        switch (cond.type) {
            case 'stat_gte':
                return (leg[cond.target] || 0) >= cond.value;

            case 'ending_unlocked':
                return (leg.endings_unlocked || []).includes(cond.target);

            case 'endings_all':
                return (cond.targets || []).every(t =>
                    (leg.endings_unlocked || []).includes(t)
                );

            case 'events_count_gte':
                return (leg.events_seen || []).length >= cond.value;

            case 'flag':
                return !!leg[cond.target];

            default:
                console.warn('Unknown achievement condition type:', cond.type);
                return false;
        }
    }
}
