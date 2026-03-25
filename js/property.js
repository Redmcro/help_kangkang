// ===== PropertyManager =====
// Manages game state with observer pattern for UI updates

export class PropertyManager {
    #data = {};
    #listeners = [];

    reset(overrides = {}) {
        this.#data = {
            age: 0, hp: 55, int: 50, hap: 60, chr: 45,
            luck: 50, money: 0, earned: 0, alive: true,
            job: 'none', salary: 0, college: '', highSchool: '',
            married: false, indieSuccess: false, aiSurvived: false,
            ...overrides
        };
        this.#notifyAll();
    }

    get(key) { return this.#data[key]; }

    set(key, value) {
        const old = this.#data[key];
        this.#data[key] = value;
        if (old !== value) this.#notify(key, old, value);
    }

    // Apply an effect object like { hp: -5, int: 3, money: 200 }
    applyEffect(effect) {
        if (!effect) return;
        const statKeys = ['hp', 'int', 'hap', 'chr'];
        for (const [key, delta] of Object.entries(effect)) {
            if (typeof delta === 'number') {
                const newVal = (this.#data[key] || 0) + delta;
                this.set(key, statKeys.includes(key) ? clamp(newVal) : newVal);
            } else {
                this.set(key, delta);
            }
        }
    }

    // Apply buff effects from buffs.json format { hp: 15, int: 10 }
    applyBuff(effect) {
        this.applyEffect(effect);
    }

    onChange(fn) { this.#listeners.push(fn); }

    #notify(key, oldVal, newVal) {
        for (const fn of this.#listeners) fn(key, oldVal, newVal);
    }

    #notifyAll() {
        for (const key of Object.keys(this.#data)) {
            this.#notify(key, undefined, this.#data[key]);
        }
    }

    // Passive income based on age and salary
    earnPassiveIncome() {
        if (this.#data.age >= 23 && this.#data.salary > 0 && this.#data.job !== '失业') {
            const base = this.#data.salary * 0.2;
            let mult = 1;
            if (this.#data.age >= 16) mult = 1.5;
            if (this.#data.age >= 23) mult = 3;
            if (this.#data.age >= 30) mult = 5;
            if (this.#data.age >= 40) mult = 6;
            if (this.#data.age >= 50) mult = 4;
            const amt = Math.floor(base * mult * (1 + this.#data.int / 200));
            this.set('money', this.#data.money + amt);
            this.set('earned', this.#data.earned + amt);
        }
    }

    // Age-related health decay
    ageDecay() {
        const age = this.#data.age;
        if (age >= 45) this.set('hp', clamp(this.#data.hp - rng(1, 3)));
        if (age >= 60) this.set('hp', clamp(this.#data.hp - rng(2, 4)));
        if (age >= 80) this.set('hp', clamp(this.#data.hp - rng(3, 6)));
    }

    isDead() { return this.#data.hp <= 0; }
    isMaxAge() { return this.#data.age > 100; }

    toJSON() { return { ...this.#data }; }
}

// Utility functions
function clamp(v, min = 0, max = 100) {
    return Math.max(min, Math.min(max, v));
}

function rng(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}
