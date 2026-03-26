// ===== EventManager =====
// v2: Data-driven event system with month-based filtering

export class EventManager {
    #events = {};
    #usedEvents = new Set();

    async load() {
        try {
            const manifestResp = await fetch('./data/events/_manifest.json');
            if (!manifestResp.ok) throw new Error('Failed to load _manifest.json');
            const manifest = await manifestResp.json();

            const results = await Promise.all(
                manifest.map(sys =>
                    fetch(`./data/events/${sys}.json`)
                        .then(r => r.ok ? r.json() : {})
                        .catch(() => ({}))
                )
            );

            this.#events = Object.assign({}, ...results);
            console.log(`Loaded ${Object.keys(this.#events).length} events from ${manifest.length} systems`);
        } catch (e) {
            console.error('Event loading failed:', e);
            this.#events = {};
        }
    }

    reset() {
        this.#usedEvents.clear();
    }

    // Get all events that can fire at the given month with current state
    getPool(month, state) {
        return Object.entries(this.#events).filter(([id, ev]) => {
            if (ev.once && this.#usedEvents.has(id)) return false;
            const [min, max] = ev.month;
            if (month < min || month > max) return false;
            if (ev.include && Object.keys(ev.include).length > 0
                && !this.#checkCondition(ev.include, state)) return false;
            if (ev.exclude && Object.keys(ev.exclude).length > 0
                && this.#checkCondition(ev.exclude, state)) return false;
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
        const choice = pool.find(([, ev]) => ev.type === 'choice');
        if (choice) return { id: choice[0], ev: choice[1] };
        const special = pool.find(([, ev]) => ev.type === 'special');
        if (special) return { id: special[0], ev: special[1] };
        const nonFiller = pool.filter(([, ev]) => !ev.filler);
        if (nonFiller.length) return this.pick(nonFiller);
        return this.pick(pool);
    }

    // Execute an event: apply branches if any, return result
    execute(id, ev, state) {
        this.#usedEvents.add(id);

        if (ev.branch && ev.type !== 'choice') {
            for (const b of ev.branch) {
                if (b.cond && Object.keys(b.cond).length > 0
                    && this.#checkCondition(b.cond, state)) {
                    return {
                        text: b.text,
                        effect: b.effect || ev.effect,
                        type: b.type || ev.type || 'neutral',
                        postEvent: b.postEvent || ev.postEvent,
                        setFlag: b.setFlag || ev.setFlag
                    };
                }
            }
        }

        return {
            text: ev.text,
            effect: ev.effect,
            type: ev.type || 'neutral',
            postEvent: ev.postEvent,
            setFlag: ev.setFlag
        };
    }

    // Execute a choice option
    executeChoice(choice, state) {
        // Chance-based choices
        if (choice.chanceBased && choice.branches) {
            const branches = choice.branches.map(b => {
                return { ...b, adjustedChance: Math.max(0.1, b.chance || 1) };
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

    // Check if a choice is locked
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
        const names = {
            money: '¥', brain: '脑力', hp: '生命',
            token: 'Token', bossSatisfy: '满意度',
            shaoye_rel: '少爷好感', yimin_rel: '亿民好感'
        };
        for (const [key, val] of Object.entries(choice.require)) {
            if (typeof val === 'number') {
                parts.push(`${names[key] || key}${val}`);
            }
        }
        return `🔒 需要${parts.join(' ')}`;
    }

    // Condition checker
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
