// ===== PropertyManager =====
// v3: Manages game state with observer pattern for UI updates.
// Core attributes: hp, money, brain, bossSatisfy
// Relations: shaoye_rel, yimin_rel, gf_rel
// Hidden: charm, luck
// Flags: dynamic boolean state (model unlocks, story flags)

const ECONOMY_RAILS = Object.freeze({
    salary: { defaultValue: 3200, min: 600, max: 20000 },
    living_cost: { defaultValue: 1400, min: 200, max: 16000 }
});
const MONEY_RAIL = Object.freeze({ min: -9999999, max: 9999999 });

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
            bug_backlog: 0,
            new_bugs_month: 0,
            fixed_bugs_month: 0,
            overtime_hours_month: 0,
            salary: ECONOMY_RAILS.salary.defaultValue,
            months_bankrupt: 0,
            living_cost: ECONOMY_RAILS.living_cost.defaultValue,

            // Recovery rates (from buffs)
            hp_regen_rate: 0,
            brain_regen_rate: 0,

            // Story flags
            gamejam_won: false,

            ...overrides
        };
        this.#normalizeRuntimeRails();
        this.#flags = {};
        this.#notifyAll();
    }

    get(key) { return this.#data[key]; }

    set(key, value) {
        const normalized = this.#normalizeValue(key, value);
        const old = this.#data[key];
        this.#data[key] = normalized;
        if (old !== normalized) this.#notify(key, old, normalized);
    }

    // ===== Flag System =====
    // Flags are separate boolean states (model unlocks, story events)

    setFlag(key, value = true) {
        this.#flags[key] = value;
    }

    getFlag(key) {
        return !!this.#flags[key];
    }

    // ===== Model Bridge =====

    getCurrentModel() {
        const modelId = this.#data.current_model;
        if (typeof modelId === 'string' && modelId.trim()) return modelId;
        this.set('current_model', 'doubao');
        return 'doubao';
    }

    setCurrentModel(modelId) {
        if (typeof modelId !== 'string') return this.getCurrentModel();
        const next = modelId.trim();
        if (!next) return this.getCurrentModel();
        this.set('current_model', next);
        return next;
    }

    isModelUnlocked(modelId) {
        const flagKey = this.#toModelUnlockFlagKey(modelId);
        if (!flagKey) return false;
        return this.getFlag(flagKey) || !!this.#data[flagKey];
    }

    unlockModel(modelId) {
        const flagKey = this.#toModelUnlockFlagKey(modelId);
        if (!flagKey) return false;
        this.setFlag(flagKey, true);

        // Keep legacy compatibility when unlock flags were stored in main data.
        if (Object.prototype.hasOwnProperty.call(this.#data, flagKey) && this.#data[flagKey] !== true) {
            this.set(flagKey, true);
        }
        return true;
    }

    #toModelUnlockFlagKey(modelId) {
        if (typeof modelId !== 'string') return '';
        const normalized = modelId.trim();
        if (!normalized) return '';
        if (normalized.startsWith('model_') && normalized.endsWith('_unlocked')) return normalized;
        return `model_${normalized}_unlocked`;
    }

    #normalizeRuntimeRails() {
        this.#data.salary = this.#normalizeEconomyValue('salary', this.#data.salary);
        this.#data.living_cost = this.#normalizeEconomyValue('living_cost', this.#data.living_cost);
        this.#data.money = this.#normalizeValue('money', this.#data.money);
        this.#data.months_bankrupt = this.#normalizeValue('months_bankrupt', this.#data.months_bankrupt);
    }

    #normalizeEconomyValue(key, value) {
        const rails = ECONOMY_RAILS[key];
        if (!rails) return value;
        return toSafeInt(value, rails.defaultValue, rails.min, rails.max);
    }

    #normalizeValue(key, value) {
        if (key === 'salary' || key === 'living_cost') {
            return this.#normalizeEconomyValue(key, value);
        }
        if (key === 'money') {
            const safeMoney = Math.round(toFiniteNumber(value, 0));
            return clamp(safeMoney, MONEY_RAIL.min, MONEY_RAIL.max);
        }
        if (key === 'months_bankrupt') {
            return toSafeInt(value, 0, 0, 120);
        }
        return value;
    }

    // ===== Effects =====

    /**
     * Apply an effect object like { hp: -5, brain: 3, money: 200 }
     * Supports [min, max] range values: { hp: [-3, -7] } resolves to a random int in that range.
     * Numeric values are added; non-numeric values are set directly.
     * Bounded stats (hp, brain, bossSatisfy, charm, luck, relations) are clamped 0-100.
     * Returns the resolved effect with all ranges replaced by actual values.
     */
    applyEffect(effect) {
        if (!effect) return null;
        const resolved = {};
        const clampedKeys = ['hp', 'brain', 'bossSatisfy', 'charm', 'luck', 'shaoye_rel', 'yimin_rel', 'gf_rel'];
        for (const [key, delta] of Object.entries(effect)) {
            let val = delta;
            if (
                Array.isArray(delta)
                && delta.length === 2
                && delta.every(n => typeof n === 'number' && Number.isFinite(n))
            ) {
                const lo = Math.min(delta[0], delta[1]);
                const hi = Math.max(delta[0], delta[1]);
                val = lo + Math.floor(Math.random() * (hi - lo + 1));
            }
            if (typeof val === 'number' && Number.isFinite(val)) {
                const base = toFiniteNumber(this.#data[key], 0);
                let newVal = base + val;
                if (clampedKeys.includes(key)) newVal = clamp(newVal, 0, 100);
                this.set(key, newVal);
            } else {
                this.set(key, val);
            }
            resolved[key] = val;
        }
        return resolved;
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
     * Recovery based on purchased buff rates (halved if overtime).
     */
    monthlyRecovery() {
        const wasOvertime = this.#data.consecutive_overtime > 0;
        const brainRate = this.#data.brain_regen_rate || 0;
        const hpRate = this.#data.hp_regen_rate || 0;
        const brainRecover = wasOvertime ? Math.floor(brainRate / 2) : brainRate;
        const hpRecover = wasOvertime ? Math.floor(hpRate / 2) : hpRate;
        if (brainRecover > 0) this.set('brain', clamp(this.#data.brain + brainRecover, 0, 100));
        if (hpRecover > 0) this.set('hp', clamp(this.#data.hp + hpRecover, 0, 100));
        return { brainRecover, hpRecover };
    }

    /**
     * Monthly expense & income.
     * Deterministic settlement for runtime:
     * money += salary - living_cost.
     */
    monthlyExpense() {
        const salary = this.#normalizeEconomyValue('salary', this.#data.salary);
        const livingCost = this.#normalizeEconomyValue('living_cost', this.#data.living_cost);
        const moneyBefore = this.#normalizeValue('money', this.#data.money);

        this.set('salary', salary);
        this.set('living_cost', livingCost);
        this.set('money', moneyBefore);

        const monthIncome = salary - livingCost;
        const moneyAfter = this.#normalizeValue('money', moneyBefore + monthIncome);
        this.set('money', moneyAfter);

        return {
            salary,
            livingCost,
            monthIncome,
            moneyBefore,
            moneyAfter
        };
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

function toFiniteNumber(raw, fallback = 0) {
    const num = typeof raw === 'string' ? Number(raw) : raw;
    return (typeof num === 'number' && Number.isFinite(num)) ? num : fallback;
}

function toSafeInt(raw, fallback = 0, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
    const num = Math.round(toFiniteNumber(raw, fallback));
    return clamp(num, min, max);
}
