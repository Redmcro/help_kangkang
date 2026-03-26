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

    reset() { this.#usedEvents.clear(); }

    getPool(month, state) {
        return Object.entries(this.#events).filter(([id, ev]) => {
            if (this.#usedEvents.has(id)) return false;
            const [min, max] = ev.month;
            if (month < min || month > max) return false;
            if (ev.include && Object.keys(ev.include).length > 0 && !this.#checkCondition(ev.include, state)) return false;
            if (ev.exclude && Object.keys(ev.exclude).length > 0 && this.#checkCondition(ev.exclude, state)) return false;
            return true;
        });
    }

    pick(pool) {
        if (!pool.length) return null;
        const weighted = pool.map(([id, ev]) => ({ id, ev, w: ev.weight || 1 }));
        const total = weighted.reduce((s, i) => s + i.w, 0);
        let r = Math.random() * total;
        for (const item of weighted) { r -= item.w; if (r <= 0) return item; }
        return weighted[weighted.length - 1];
    }

    pickPrioritized(pool) {
        const choices = pool.filter(([, ev]) => ev.type === 'choice');
        if (choices.length && Math.random() < 0.35) return this.pick(choices);
        const specials = pool.filter(([, ev]) => ev.type === 'special');
        if (specials.length && Math.random() < 0.5) return this.pick(specials);
        const nonFiller = pool.filter(([, ev]) => !ev.filler);
        if (nonFiller.length) return this.pick(nonFiller);
        return this.pick(pool);
    }

    execute(id, ev, state) {
        if (ev.once) this.#usedEvents.add(id);
        if (ev.branch && ev.type !== 'choice') {
            for (const b of ev.branch) {
                if (b.cond && Object.keys(b.cond).length > 0 && this.#checkCondition(b.cond, state)) {
                    return { text: b.text, effect: b.effect || ev.effect, type: b.type || ev.type || 'neutral', postEvent: b.postEvent || ev.postEvent, setFlag: b.setFlag || ev.setFlag };
                }
            }
        }
        return { text: ev.text, effect: ev.effect, type: ev.type || 'neutral', postEvent: ev.postEvent, setFlag: ev.setFlag };
    }

    executeChoice(choice, state) {
        if (choice.chanceBased && choice.branches) {
            const branches = choice.branches.map(b => ({ ...b, adjustedChance: Math.max(0.1, b.chance || 1) }));

            // 🍀 luck 修正 chanceBased 概率（GAME_DESIGN 二.2.3）
            const luckMod = ((state.luck || 50) - 50) / 100;
            branches[0].adjustedChance *= (1 + luckMod);
            for (let i = 1; i < branches.length; i++) {
                branches[i].adjustedChance *= (1 - luckMod * 0.5);
            }

            const total = branches.reduce((s, b) => s + b.adjustedChance, 0);
            let r = Math.random() * total;
            for (const b of branches) { r -= b.adjustedChance; if (r <= 0) return { text: b.result, effect: b.effect || {}, type: b.type }; }
            const last = branches[branches.length - 1];
            return { text: last.result, effect: last.effect || {}, type: last.type };
        }
        if (choice.require) {
            const met = this.#checkCondition(choice.require, state);
            if (met) {
                const flags = {}; if (choice.setFlag) flags[choice.setFlag] = true;
                return { text: choice.success || choice.result, effect: choice.successEffect || choice.effect || {}, flags, type: 'good' };
            } else {
                return { text: choice.fail || choice.result, effect: choice.failEffect || {}, type: 'bad' };
            }
        }
        // branch — condition-based outcomes (first matching cond wins)
        if (choice.branch && Array.isArray(choice.branch)) {
            for (const b of choice.branch) {
                const condMet = !b.cond || Object.keys(b.cond).length === 0 || this.#checkCondition(b.cond, state);
                if (condMet) {
                    // Nested chanceBased inside branch — resolve probabilistically
                    if (b.chanceBased && b.branches) {
                        return this.executeChoice(b, state);
                    }
                    const flags = {};
                    if (b.setFlag || choice.setFlag) flags[b.setFlag || choice.setFlag] = true;
                    return {
                        text: b.result || b.text,
                        effect: b.effect || choice.effect || {},
                        flags,
                        type: b.type || choice.type
                    };
                }
            }
        }
        const flags = {}; if (choice.setFlag) flags[choice.setFlag] = true;
        return { text: choice.result, effect: choice.effect || {}, flags, type: choice.type };
    }

    isChoiceLocked(choice, state) {
        if (!choice.require) return false;
        for (const [key, val] of Object.entries(choice.require)) {
            if (typeof val === 'number' && (state[key] || 0) < val) return true;
        }
        return false;
    }

    getLockReason(choice) {
        if (!choice.require) return '';
        const names = { money: '¥', brain: '脑力', hp: '生命', token: 'Token', bossSatisfy: '满意度', shaoye_rel: '少爷好感', yimin_rel: '亿民好感' };
        const parts = [];
        for (const [key, val] of Object.entries(choice.require)) {
            if (typeof val === 'number') parts.push(`${names[key] || key}${val}`);
        }
        return `🔒 需要${parts.join(' ')}`;
    }

    #checkCondition(cond, state) {
        for (const [key, val] of Object.entries(cond)) {
            const sv = state[key];
            if (typeof val === 'string') {
                if (val.startsWith('>') && !((sv || 0) > Number(val.slice(1)))) return false;
                else if (val.startsWith('<') && !((sv || 0) < Number(val.slice(1)))) return false;
                else if (val.startsWith('=') && sv !== val.slice(1)) return false;
                else if (val.startsWith('!') && sv === val.slice(1)) return false;
            } else if (typeof val === 'number') { if ((sv || 0) < val) return false; }
            else if (typeof val === 'boolean') { if (!!sv !== val) return false; }
        }
        return true;
    }
}
