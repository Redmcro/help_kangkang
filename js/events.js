// ===== EventManager =====
// Data-driven event system: loads events from JSON, handles filtering, branching, weighted random

export class EventManager {
    #events = {};
    #usedEvents = new Set();

    async load() {
        try {
            const resp = await fetch('./data/events.json');
            if (!resp.ok) throw new Error('Failed to load events.json');
            this.#events = await resp.json();
        } catch (e) {
            console.error('Event loading failed:', e);
            this.#events = {};
        }
    }

    reset() {
        this.#usedEvents.clear();
    }

    // Get all events that can fire at the given age with current state
    getPool(age, state) {
        return Object.entries(this.#events).filter(([id, ev]) => {
            // Once-only events
            if (ev.once && this.#usedEvents.has(id)) return false;
            // Age range check
            const [min, max] = ev.age;
            if (age < min || age > max) return false;
            // Include conditions
            if (ev.include && !this.#checkCondition(ev.include, state)) return false;
            // Exclude conditions
            if (ev.exclude && this.#checkCondition(ev.exclude, state)) return false;
            return true;
        });
    }

    // Weighted random pick from pool
    pick(pool) {
        if (!pool.length) return null;
        const weighted = pool.map(([id, ev]) => ({ id, ev, w: ev.weight || 1 }));
        const total = weighted.reduce((s, item) => s + item.w, 0);
        let r = Math.random() * total;
        for (const item of weighted) {
            r -= item.w;
            if (r <= 0) return item;
        }
        return weighted[weighted.length - 1];
    }

    // Prioritized pick: prefer choice > special > named > filler
    pickPrioritized(pool) {
        // Find a choice event first
        const choice = pool.find(([, ev]) => ev.type === 'choice');
        if (choice) return { id: choice[0], ev: choice[1] };
        // Then special events
        const special = pool.find(([, ev]) => ev.type === 'special');
        if (special) return { id: special[0], ev: special[1] };
        // Then non-filler events
        const nonFiller = pool.filter(([, ev]) => !ev.filler);
        if (nonFiller.length) return this.pick(nonFiller);
        // Finally filler events
        return this.pick(pool);
    }

    // Execute an event: apply branches if any, return result
    execute(id, ev, state) {
        this.#usedEvents.add(id);

        // Check branches
        if (ev.branch && ev.type !== 'choice') {
            for (const b of ev.branch) {
                if (b.cond && Object.keys(b.cond).length > 0 && this.#checkCondition(b.cond, state)) {
                    return {
                        text: b.text,
                        effect: b.effect || ev.effect,
                        type: b.type || ev.type || 'neutral',
                        postEvent: b.postEvent || ev.postEvent
                    };
                }
            }
        }

        return {
            text: ev.text,
            effect: ev.effect,
            type: ev.type || 'neutral',
            postEvent: ev.postEvent
        };
    }

    // Execute a choice option
    executeChoice(choice, state) {
        // Chance-based choices (random outcome, affected by luck)
        if (choice.chanceBased && choice.branches) {
            // Luck modifier: luck 50 = neutral, >50 favors first branch, <50 favors last
            const luckMod = ((state.luck || 50) - 50) / 100; // -0.5 to +0.5
            const branches = choice.branches.map((b, i) => {
                const baseChance = b.chance || 1;
                // Positive luck boosts earlier (better) branches
                const modifier = 1 + luckMod * (i === 0 ? 1 : -0.5);
                return { ...b, adjustedChance: Math.max(0.1, baseChance * modifier) };
            });
            const total = branches.reduce((s, b) => s + b.adjustedChance, 0);
            let r = Math.random() * total;
            for (const b of branches) {
                r -= b.adjustedChance;
                if (r <= 0) {
                    return { text: b.result, effect: b.effect || {}, type: b.type };
                }
            }
            const last = branches[branches.length - 1];
            return { text: last.result, effect: last.effect || {}, type: last.type };
        }

        // Require-based choices (stat check)
        if (choice.require) {
            const met = this.#checkCondition(choice.require, state);
            if (met) {
                const flags = {};
                if (choice.setFlag) flags[choice.setFlag] = true;
                return {
                    text: choice.success || choice.result,
                    effect: choice.successEffect || choice.effect || {},
                    flags,
                    type: 'good'
                };
            } else {
                return {
                    text: choice.fail || choice.result,
                    effect: choice.failEffect || {},
                    type: 'bad'
                };
            }
        }

        // Simple choices (direct result)
        const flags = {};
        if (choice.setFlag) flags[choice.setFlag] = true;
        return {
            text: choice.result,
            effect: choice.effect || {},
            flags,
            type: choice.type
        };
    }

    // Check if a choice is locked (requirements not met)
    isChoiceLocked(choice, state) {
        if (!choice.require) return false;
        for (const [key, val] of Object.entries(choice.require)) {
            if (typeof val === 'number' && (state[key] || 0) < val) return true;
        }
        return false;
    }

    // Get lock reason text
    getLockReason(choice) {
        if (!choice.require) return '';
        const parts = [];
        for (const [key, val] of Object.entries(choice.require)) {
            const names = { money: '¥', int: '智力', hp: '健康', hap: '快乐', chr: '魅力' };
            if (typeof val === 'number') {
                parts.push(`${names[key] || key}${val}`);
            }
        }
        return `🔒 需要${parts.join(' ')}`;
    }

    // Simple condition checker (JSON object format)
    #checkCondition(cond, state) {
        for (const [key, val] of Object.entries(cond)) {
            const stateVal = state[key];
            if (typeof val === 'string') {
                if (val.startsWith('>')) {
                    if (!((stateVal || 0) > Number(val.slice(1)))) return false;
                } else if (val.startsWith('<')) {
                    if (!((stateVal || 0) < Number(val.slice(1)))) return false;
                } else if (val.startsWith('=')) {
                    if (stateVal !== val.slice(1)) return false;
                } else if (val.startsWith('!')) {
                    if (stateVal === val.slice(1)) return false;
                }
            } else if (typeof val === 'number') {
                if ((stateVal || 0) < val) return false;
            } else if (typeof val === 'boolean') {
                if (!!stateVal !== val) return false;
            }
        }
        return true;
    }
}
