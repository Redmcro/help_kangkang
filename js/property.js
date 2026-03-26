// ===== PropertyManager =====
// v3: Manages game state with observer pattern for UI updates.
// Core attributes: hp, money, brain, bossSatisfy
// Relations: shaoye_rel, yimin_rel, gf_rel
// Hidden: charm, luck
// Flags: dynamic boolean state (model unlocks, story flags)

export class PropertyManager {
    #data = {};
    #flags = {};
    #listeners = [];

    reset(overrides = {}) {
        this.#data = {
            // Core attributes (UI visible)
            hp: 80,
            money: 3000,
            brain: 60,
            bossSatisfy: 40,

            // Colleague relations (UI visible)
            shaoye_rel: 50,
            yimin_rel: 50,

            // Girlfriend relation
            gf_rel: 50,
            has_girlfriend: true,
            married: false,

            // Hidden attributes
            charm: 50,
            luck: 50,

            // State tracking
            month: 1,
            day: 1,
            alive: true,
            current_model: 'doubao',
            is_overtime: false,
            consecutive_overtime: 0,
            avg_quality: 50,
            total_bugs: 0,
            salary: 3000,
            months_bankrupt: 0,
            living_cost: 2500,

            // Story flags
            gamejam_won: false,

            ...overrides
        };
        this.#flags = {};
        this.#notifyAll();
    }

    get(key) { return this.#data[key]; }

    set(key, value) {
        const old = this.#data[key];
        this.#data[key] = value;
        if (old !== value) this.#notify(key, old, value);
    }

    // ===== Flag System =====
    // Flags are separate boolean states (model unlocks, story events)

    setFlag(key, value = true) {
        this.#flags[key] = value;
    }

    getFlag(key) {
        return !!this.#flags[key];
    }

    // ===== Effects =====

    /**
     * Apply an effect object like { hp: -5, brain: 3, money: 200 }
     * Numeric values are added; non-numeric values are set directly.
     * Bounded stats (hp, brain, bossSatisfy, charm, luck, relations) are clamped 0-100.
     */
    applyEffect(effect) {
        if (!effect) return;
        const clampedKeys = ['hp', 'brain', 'bossSatisfy', 'charm', 'luck', 'shaoye_rel', 'yimin_rel', 'gf_rel'];
        for (const [key, delta] of Object.entries(effect)) {
            if (typeof delta === 'number') {
                let newVal = (this.#data[key] || 0) + delta;
                if (clampedKeys.includes(key)) newVal = clamp(newVal, 0, 100);
                this.set(key, newVal);
            } else {
                this.set(key, delta);
            }
        }
    }

    applyBuff(effect) {
        this.applyEffect(effect);
    }

    // ===== Observer =====

    onChange(fn) { this.#listeners.push(fn); }

    #notify(key, oldVal, newVal) {
        for (const fn of this.#listeners) fn(key, oldVal, newVal);
    }

    #notifyAll() {
        for (const key of Object.keys(this.#data)) {
            this.#notify(key, undefined, this.#data[key]);
        }
    }

    // ===== Monthly Cycle =====

    /**
     * Monthly recovery (called at start of each month).
     * brain +10, hp +5 (halved if overtime last month).
     */
    monthlyRecovery() {
        const wasOvertime = this.#data.consecutive_overtime > 0;
        const brainRecover = wasOvertime ? 3 : 5;
        const hpRecover = wasOvertime ? 2 : 3;
        this.set('brain', clamp(this.#data.brain + brainRecover, 0, 100));
        this.set('hp', clamp(this.#data.hp + hpRecover, 0, 100));
    }

    /**
     * Monthly expense & income.
     * salary (default 15000), living cost -5000.
     */
    monthlyExpense() {
        const salary = this.#data.salary || 3000;
        const cost = this.#data.living_cost || 2500;
        this.set('money', this.#data.money + salary - cost);
    }

    // ===== Game Over Checks =====

    /**
     * Check all game-over conditions. Returns a cause string or null.
     */
    isGameOver() {
        if (this.#data.hp <= 0) return 'death';
        if (this.#data.brain <= 0) return 'breakdown';
        if (this.#data.bossSatisfy < 15) return 'fired';
        if ((this.#data.months_bankrupt || 0) >= 3) return 'bankrupt';
        return null;
    }

    isDead() {
        return this.#data.hp <= 0 || this.#data.brain <= 0;
    }

    isBankrupt() {
        return (this.#data.months_bankrupt || 0) >= 3;
    }

    // ===== Serialization =====

    toJSON() {
        return {
            ...this.#data,
            ...this.#flags  // Include flags in snapshot for event condition checks
        };
    }
}

// Utility
function clamp(v, min = 0, max = 100) {
    return Math.max(min, Math.min(max, v));
}
