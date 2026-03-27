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
                    return this.#buildEventResult(b, ev);
                }
            }
        }
        return this.#buildEventResult(ev);
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
            for (const b of branches) {
                r -= b.adjustedChance;
                if (r <= 0) {
                    return this.#buildChoiceResult({
                        text: b.result || b.text || choice.result,
                        effect: b.effect !== undefined ? b.effect : choice.effect || {},
                        type: b.type || choice.type
                    }, b, choice);
                }
            }
            const last = branches[branches.length - 1];
            return this.#buildChoiceResult({
                text: last.result || last.text || choice.result,
                effect: last.effect !== undefined ? last.effect : choice.effect || {},
                type: last.type || choice.type
            }, last, choice);
        }
        if (choice.require) {
            const met = this.#checkCondition(choice.require, state);
            if (met) {
                const payload = {
                    text: choice.success || choice.result,
                    effect: choice.successEffect || choice.effect || {},
                    type: 'good'
                };
                if (Object.prototype.hasOwnProperty.call(choice, 'setFlag')) payload.setFlag = choice.setFlag;
                if (Object.prototype.hasOwnProperty.call(choice, 'successFlags')) payload.flags = choice.successFlags;
                else if (Object.prototype.hasOwnProperty.call(choice, 'flags')) payload.flags = choice.flags;
                if (Object.prototype.hasOwnProperty.call(choice, 'successTokenCost')) payload.tokenCost = choice.successTokenCost;
                else if (Object.prototype.hasOwnProperty.call(choice, 'tokenCost')) payload.tokenCost = choice.tokenCost;
                if (Object.prototype.hasOwnProperty.call(choice, 'successActions')) payload.actions = choice.successActions;
                return this.#buildChoiceResult(payload, choice);
            } else {
                const payload = {
                    text: choice.fail || choice.result,
                    effect: choice.failEffect || {},
                    type: 'bad'
                };
                if (Object.prototype.hasOwnProperty.call(choice, 'failFlags')) payload.flags = choice.failFlags;
                if (Object.prototype.hasOwnProperty.call(choice, 'failTokenCost')) payload.tokenCost = choice.failTokenCost;
                if (Object.prototype.hasOwnProperty.call(choice, 'failActions')) payload.actions = choice.failActions;
                return this.#buildChoiceResult(payload, choice);
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
                    const payload = {
                        text: b.result || b.text,
                        effect: b.effect || choice.effect || {},
                        type: b.type || choice.type
                    };
                    if (Object.prototype.hasOwnProperty.call(b, 'setFlag')) payload.setFlag = b.setFlag;
                    else if (Object.prototype.hasOwnProperty.call(choice, 'setFlag')) payload.setFlag = choice.setFlag;
                    if (Object.prototype.hasOwnProperty.call(b, 'flags')) payload.flags = b.flags;
                    else if (Object.prototype.hasOwnProperty.call(choice, 'flags')) payload.flags = choice.flags;
                    if (Object.prototype.hasOwnProperty.call(b, 'tokenCost')) payload.tokenCost = b.tokenCost;
                    else if (Object.prototype.hasOwnProperty.call(choice, 'tokenCost')) payload.tokenCost = choice.tokenCost;
                    if (Object.prototype.hasOwnProperty.call(b, 'actions')) payload.actions = b.actions;
                    return this.#buildChoiceResult(payload, b, choice);
                }
            }
        }
        const payload = {
            text: choice.result,
            effect: choice.effect || {},
            type: choice.type
        };
        if (Object.prototype.hasOwnProperty.call(choice, 'setFlag')) payload.setFlag = choice.setFlag;
        if (Object.prototype.hasOwnProperty.call(choice, 'flags')) payload.flags = choice.flags;
        if (Object.prototype.hasOwnProperty.call(choice, 'tokenCost')) payload.tokenCost = choice.tokenCost;
        if (Object.prototype.hasOwnProperty.call(choice, 'actions')) payload.actions = choice.actions;
        return this.#buildChoiceResult(payload, choice);
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

    #buildEventResult(source, fallback = null) {
        const effect = this.#resolveLegacyField(source, fallback, 'effect');
        const setFlag = this.#resolveLegacyField(source, fallback, 'setFlag');
        const flags = this.#resolveLegacyField(source, fallback, 'flags');
        const tokenCost = this.#resolveLegacyField(source, fallback, 'tokenCost');
        return {
            text: this.#resolveText(source, fallback),
            effect,
            type: this.#resolveType(source, fallback, 'neutral'),
            postEvent: this.#resolveLegacyField(source, fallback, 'postEvent'),
            setFlag,
            flags,
            tokenCost,
            actions: this.#resolveActions(source, fallback, { effect, setFlag, flags, tokenCost })
        };
    }

    #buildChoiceResult(payload, primary = null, fallback = null) {
        const effect = Object.prototype.hasOwnProperty.call(payload, 'effect')
            ? payload.effect
            : this.#resolveLegacyField(primary, fallback, 'effect') || {};
        const setFlag = Object.prototype.hasOwnProperty.call(payload, 'setFlag')
            ? payload.setFlag
            : this.#resolveLegacyField(primary, fallback, 'setFlag');
        const flags = Object.prototype.hasOwnProperty.call(payload, 'flags')
            ? payload.flags
            : this.#resolveLegacyField(primary, fallback, 'flags');
        const tokenCost = Object.prototype.hasOwnProperty.call(payload, 'tokenCost')
            ? payload.tokenCost
            : this.#resolveLegacyField(primary, fallback, 'tokenCost');
        return {
            text: payload.text,
            effect,
            flags,
            setFlag,
            tokenCost,
            type: payload.type,
            actions: this.#resolveActions(payload, primary, { effect, setFlag, flags, tokenCost }, fallback)
        };
    }

    #resolveActions(source, primary, legacyFields, secondary = null) {
        const native = this.#pickNativeActions(source, primary, secondary);
        if (native !== null) return native;
        return this.#legacyToActions(legacyFields);
    }

    #pickNativeActions(...objects) {
        for (const obj of objects) {
            if (!obj || !Object.prototype.hasOwnProperty.call(obj, 'actions')) continue;
            if (Array.isArray(obj.actions)) return obj.actions.map(a => (a && typeof a === 'object') ? { ...a } : a);
            return [];
        }
        return null;
    }

    #legacyToActions({ effect, setFlag, flags, tokenCost }) {
        const actions = [];
        if (effect && typeof effect === 'object' && !Array.isArray(effect)) {
            const delta = {};
            const setState = {};
            for (const [key, value] of Object.entries(effect)) {
                const isRange = Array.isArray(value) && value.length === 2
                    && value.every(n => typeof n === 'number' && Number.isFinite(n));
                if (typeof value === 'number' || isRange) delta[key] = value;
                else setState[key] = value;
            }
            if (Object.keys(delta).length > 0) actions.push({ type: 'stat_delta', delta });
            if (Object.keys(setState).length > 0) actions.push({ type: 'set_state', state: setState });
        }

        if (typeof setFlag === 'string' && setFlag) actions.push({ type: 'set_flag', key: setFlag, value: true });
        if (flags && typeof flags === 'object' && !Array.isArray(flags)) {
            for (const [key, value] of Object.entries(flags)) {
                actions.push({ type: 'set_flag', key, value: !!value });
            }
        }

        if (typeof tokenCost === 'number' && Number.isFinite(tokenCost)) {
            actions.push({ type: 'charge_tokens', amount: tokenCost });
        }
        return actions;
    }

    #resolveLegacyField(primary, fallback, key) {
        if (primary && Object.prototype.hasOwnProperty.call(primary, key)) return primary[key];
        if (fallback && Object.prototype.hasOwnProperty.call(fallback, key)) return fallback[key];
        return undefined;
    }

    #resolveText(primary, fallback) {
        if (primary && Object.prototype.hasOwnProperty.call(primary, 'text')) return primary.text;
        if (fallback && Object.prototype.hasOwnProperty.call(fallback, 'text')) return fallback.text;
        return '';
    }

    #resolveType(primary, fallback, fallbackType = 'neutral') {
        if (primary && Object.prototype.hasOwnProperty.call(primary, 'type') && primary.type) return primary.type;
        if (fallback && Object.prototype.hasOwnProperty.call(fallback, 'type') && fallback.type) return fallback.type;
        return fallbackType;
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
