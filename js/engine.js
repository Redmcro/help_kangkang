// ===== GameEngine =====
// v2: Month-based workplace survival loop

import { PropertyManager } from './property.js';
import { EventManager } from './events.js';
import { loadLegacy, saveLegacy, addToLegacySet } from './save.js';

const AI_MODELS = {
    doubao: { name: '🐳 豆包', unlockMonth: 1, cost: [10, 30, 80, 200], quality: 45, bugRate: 0.40, tokenPrice: 0 },
    gpt54: { name: '🤖 GPT-5.4', unlockMonth: 2, cost: [40, 100, 300, 800], quality: 80, bugRate: 0.12, tokenPrice: 15 },
    opus46: { name: '🎯 Opus 4.6', unlockMonth: 3, cost: [60, 150, 400, 1000], quality: 92, bugRate: 0.05, tokenPrice: 25 },
    deepseek_v4: { name: '🔮 DeepSeek V4', unlockMonth: 4, cost: [15, 50, 120, 300], quality: 72, bugRate: 0.18, tokenPrice: 8 },
    cheapgpt: { name: '💀 CheapGPT', unlockMonth: 3, cost: [5, 20, 50, 120], quality: 30, bugRate: 0.60, tokenPrice: 3 },
    fakeopus: { name: '🎪 FakeOpus', unlockMonth: 5, cost: [8, 30, 70, 180], quality: 35, bugRate: 0.55, tokenPrice: 5 }
};

export { AI_MODELS };

const TASK_COMPLEXITY = {
    1: [1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
    2: [1, 1, 1, 2, 2, 2, 2, 2, 3, 3], 3: [1, 1, 1, 2, 2, 2, 2, 2, 3, 3],
    4: [2, 2, 2, 3, 3, 3, 3, 3, 4, 4], 5: [2, 2, 2, 3, 3, 3, 3, 3, 4, 4], 6: [2, 2, 2, 3, 3, 3, 3, 3, 4, 4],
    7: [2, 2, 3, 3, 3, 3, 4, 4, 4, 4], 8: [2, 2, 3, 3, 3, 3, 4, 4, 4, 4], 9: [2, 2, 3, 3, 3, 3, 4, 4, 4, 4],
    10: [3, 3, 3, 3, 4, 4, 4, 4, 4, 4], 11: [3, 3, 3, 3, 4, 4, 4, 4, 4, 4], 12: [3, 3, 3, 3, 4, 4, 4, 4, 4, 4]
};

function rng(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
function clampValue(v, min, max) { return Math.max(min, Math.min(max, v)); }

const QUARTERLY_REVIEW_MONTHS = new Set([3, 6, 9, 12]);
const QUARTERLY_REVIEW_EVENT_PREFIX = 'life_salary_review_q';
const MAINSTREAM_MODEL_IDS = new Set(['gpt54', 'opus46', 'deepseek_v4']);

const BALANCE_CONFIG = {
    settlement: {
        minDelta: -7,
        maxDelta: 6,
        charmDivider: 240
    },
    overtime: {
        hardThreshold: 34,
        softThreshold: 48,
        softChancePerPoint: 0.035,
        bugChanceBoost: 0.12,
        lightHpRange: [2, 5],
        hardHpRange: [4, 8],
        extraBrainLoss: 2,
        fatigueStep: 2,
        fatigueLossCap: 3,
        forcedRestAt: 6,
        forcedRestReset: 2
    },
    salaryReview: {
        minSalary: 1800,
        maxSalary: 12000
    },
    modelCost: {
        minDebtBuffer: 600,
        salaryDebtFactor: 0.18,
        mainstreamThrottleFactor: 0.72,
        tokenMultiplier: {
            gpt54: 1.08,
            opus46: 1.18,
            deepseek_v4: 1.05
        }
    }
};

const IDLE_DAY_PHRASES = [
    '平平无奇的一天。',
    '今天什么都没发生，康康摸了一天鱼。',
    '写了几行代码，删了几行代码，净产出为零。',
    '康康盯着屏幕发呆了一会儿，然后继续发呆。',
    '今天的咖啡比昨天好喝一点。仅此而已。',
    'IDE 开了八个小时，有效编码时间：47分钟。',
    '又是和 Bug 和平共处的一天。',
    '康康今天的代码提交记录：0 commits。但他很忙。',
    '今天的站会只开了两分钟，创下了新纪录。',
    '康康在工位上睡着了，醒来发现没人注意到。',
    '康康在Stack Overflow上看了一个问题，不知不觉看了两小时答案区的骂战。',
    '今天的AI生成了一段完美的代码。可惜需求已经变了。',
    '开了一天的会，唯一的产出是会议纪要里的一个typo。',
    '康康花了三小时给变量起名字，最后还是用了temp。',
    '有人在群里发了张猫的表情包，全组笑了十分钟。产出为零。',
    '中午点了一杯瑞幸，结果取错了别人的单。别说，还挺好喝。',
    '今天终于搞懂了一个Bug的原因。原因是：昨天自己手贱改的。',
    '写了个巨复杂的函数，运行完发现结果跟一行正则一样。',
    '同事拿了一盒费列罗来分享，康康多拿了一颗。这是今天最大的胜利。',
    '公司WiFi断了五分钟，全层程序员同时掏出手机开热点。场面壮观。',
    '康康对着一个warning看了半天，决定加一行 // eslint-disable 解决问题。',
    '今天代码写得特别顺，然后发现是在错误的分支上。'
];

const BUG_NARRATIVES = [
    '🐛 代码编译都没过！康康盯着报错信息陷入沉思',
    '🐛 测试跑出了个NaN，康康debug了一个小时才发现是类型转换问题',
    '🐛 一个空指针异常导致服务器重启，康康的手在发抖',
    '🐛 产品经理说"这个功能昨天还好好的"。git log显示最后一次修改是你做的',
    '🐛 Bug修好了！……等等，怎么又出了两个新Bug？',
    '🐛 代码Review被打回来了，reviewer评论："这段AI生成的吧？"',
    '🐛 一个off-by-one错误，让10000个用户收到了同一条推送通知',
];

function buildOvertimeMsg(quality, hasBug, hpLoss, brainLoss) {
    const bugPart = hasBug ? `修了个Bug 🧠-${brainLoss}，` : '';
    const msgs = [
        `⚠️ 代码质量${quality}分，${bugPart}加班返工到深夜`,
        `⚠️ 今天写的代码只有${quality}分，${bugPart}不得不留下来重写`,
        `⚠️ 代码没过质检(${quality}分)，${bugPart}康康叹了口气开始加班`,
        `⚠️ ${quality}分的代码交不了差，${bugPart}又是一个加班夜`,
    ];
    return msgs[Math.floor(Math.random() * msgs.length)] + ` ❤️-${hpLoss}`;
}

const STAT_EMOJI = {
    hp: '❤️', brain: '🧠', money: '💰', bossSatisfy: '👔',
    shaoye_rel: '🤝少', yimin_rel: '🤝亿', gf_rel: '💕'
};

function buildDeltaStr(effect) {
    if (!effect) return '';
    let parts = [];
    for (const [key, emoji] of Object.entries(STAT_EMOJI)) {
        if (effect[key]) parts.push(`${emoji}${effect[key] > 0 ? '+' : ''}${effect[key]}`);
    }
    return parts.length > 0 ? ' ' + parts.join(' ') : '';
}

export class GameEngine {
    constructor() {
        this.property = new PropertyManager();
        this.eventMgr = new EventManager();
        this.legacy = loadLegacy();
        this.stages = [];
        this.buffs = [];
        this.selectedBuffs = new Set();
        this.speed = 800;
        this.autoTimer = null;
        this.pauseDepth = 0;
        this.pendingStep = null;
        this.timeline = [];
        // Daily report tracking
        this.dayReport = { tokensUsed: 0, overtime: false, modelName: '', events: [] };
        this.monthQualities = [];
        this.monthRuntime = this.createMonthRuntimeState(1);
        // Callbacks set by app.js
        this.onEvent = null;
        this.onUpdateUI = null;
        this.onShowChoice = null;
        this.onHideChoice = null;
        this.onMonthSummary = null;
        this.onGameEnd = null;
        this.onError = null;
        this.onDaySummary = null;
        this.onChoiceResult = null;
    }

    clearAutoTimer() {
        if (this.autoTimer) {
            clearTimeout(this.autoTimer);
            this.autoTimer = null;
        }
    }

    flushPendingStep() {
        if (this.paused || this.autoTimer || typeof this.pendingStep !== 'function') return;
        const next = this.pendingStep;
        this.autoTimer = setTimeout(() => {
            this.autoTimer = null;
            if (this.paused) return;
            if (this.pendingStep !== next) return;
            this.pendingStep = null;
            next();
        }, this.speed);
    }

    pause() { this.pauseDepth++; this.clearAutoTimer(); }
    resume() {
        this.pauseDepth = Math.max(0, this.pauseDepth - 1);
        if (this.pauseDepth === 0) {
            this.flushPendingStep();
            this.emitUI();
        }
    }
    get paused() { return this.pauseDepth > 0; }
    set paused(val) { if (val) this.pause(); else this.resume(); }

    async init() {
        try {
            const [stagesResp, buffsResp] = await Promise.all([
                fetch('./data/stages.json'),
                fetch('./data/buffs.json'),
                this.eventMgr.load()
            ]);
            if (!stagesResp.ok) throw new Error('Failed to load stages.json');
            if (!buffsResp.ok) throw new Error('Failed to load buffs.json');
            this.stages = await stagesResp.json();
            this.buffs = await buffsResp.json();
        } catch (e) {
            console.error('Game init failed:', e);
            if (this.onError) this.onError('游戏数据加载失败，请刷新重试');
        }
    }

    getStageName(month) {
        const s = this.stages.find(s => s.month === month);
        return s ? s.name : '🏢 工作中';
    }

    toggleBuff(id) {
        if (this.selectedBuffs.has(id)) this.selectedBuffs.delete(id);
        else if (this.selectedBuffs.size < 3) this.selectedBuffs.add(id);
    }
    isBuffSelected(id) { return this.selectedBuffs.has(id); }
    isBuffLocked(buff) {
        if (this.selectedBuffs.has(buff.id)) return false;
        let committed = 0;
        this.selectedBuffs.forEach(id => { const b = this.buffs.find(x => x.id === id); if (b) committed += b.cost; });
        return buff.cost > (this.legacy.coins - committed);
    }
    getBuffCost() {
        let cost = 0;
        this.selectedBuffs.forEach(id => { const b = this.buffs.find(x => x.id === id); if (b) cost += b.cost; });
        return cost;
    }

    start() {
        const cost = this.getBuffCost();
        if (cost > this.legacy.coins && cost > 0) { if (this.onError) this.onError('传世金币不足！'); return false; }
        if (cost > 0) { this.legacy.coins -= cost; saveLegacy(this.legacy); }

        this.clearAutoTimer();
        this.pendingStep = null;
        this.property.reset();
        this.eventMgr.reset();
        this.timeline = [];
        this.pauseDepth = 0;
        this.monthQualities = [];
        this.monthRuntime = this.createMonthRuntimeState(1);

        this.selectedBuffs.forEach(id => {
            const b = this.buffs.find(x => x.id === id);
            if (b) this.property.applyBuff(b.effect);
        });

        this.unlockModel('doubao');

        // 2b: initialize hidden ending tracking flags
        this.property.setFlag('used_ai', false);
        this.property.setFlag('only_doubao', true);

        this.emitEvent('康康正式入职了！新的一年，新的挑战...', 'special');
        this.emitUI();
        this.scheduleNext(() => this.processMonth());
        return true;
    }

    setSpeed(s) { this.speed = s; }

    scheduleNext(fn) {
        if (typeof fn !== 'function') return;
        this.pendingStep = fn;
        this.clearAutoTimer();
        this.flushPendingStep();
    }

    getCurrentModelId() {
        if (typeof this.property.getCurrentModel === 'function') return this.property.getCurrentModel();
        return this.property.get('current_model');
    }

    setCurrentModelId(modelId) {
        if (!modelId) return false;
        if (typeof this.property.setCurrentModel === 'function') {
            this.property.setCurrentModel(modelId);
            return true;
        }
        this.property.set('current_model', modelId);
        return true;
    }

    isModelUnlocked(modelId) {
        if (!modelId) return false;
        if (typeof this.property.isModelUnlocked === 'function') return !!this.property.isModelUnlocked(modelId);
        return this.property.getFlag(`model_${modelId}_unlocked`);
    }

    unlockModel(modelId) {
        if (!modelId) return false;
        if (typeof this.property.unlockModel === 'function') {
            this.property.unlockModel(modelId);
            return true;
        }
        this.property.setFlag(`model_${modelId}_unlocked`, true);
        return true;
    }

    mergeNumericDelta(target, resolved) {
        if (!target || !resolved || typeof resolved !== 'object') return;
        for (const [key, value] of Object.entries(resolved)) {
            if (typeof value !== 'number' || !Number.isFinite(value)) continue;
            target[key] = (target[key] || 0) + value;
        }
    }

    logActionNoop(action, reason, contextLabel = 'runtime') {
        console.warn(`[ActionRuntime:${contextLabel}] ${reason}`, action);
    }

    extractActionObject(action, keys = []) {
        for (const key of keys) {
            if (!Object.prototype.hasOwnProperty.call(action, key)) continue;
            const value = action[key];
            if (value && typeof value === 'object' && !Array.isArray(value)) return value;
        }
        return null;
    }

    getActionModelId(action) {
        for (const key of ['model', 'modelId', 'id', 'target']) {
            if (!Object.prototype.hasOwnProperty.call(action, key)) continue;
            const value = action[key];
            if (typeof value === 'string' && value.trim()) return value.trim();
        }
        return '';
    }

    normalizeTokenAmount(raw) {
        const val = typeof raw === 'string' ? Number(raw) : raw;
        if (typeof val !== 'number' || !Number.isFinite(val) || val <= 0) return null;
        return val;
    }

    executeActionPlan(actions, contextLabel = 'runtime') {
        const summary = { statDelta: {}, tokensCharged: 0, modelCostSpent: 0 };
        if (!Array.isArray(actions) || actions.length === 0) return summary;

        for (const action of actions) {
            if (!action || typeof action !== 'object') {
                this.logActionNoop(action, 'invalid action payload (expected object)', contextLabel);
                continue;
            }
            const type = typeof action.type === 'string' ? action.type.trim() : '';
            switch (type) {
                case 'stat_delta':
                    this.handleStatDeltaAction(action, summary, contextLabel);
                    break;
                case 'set_state':
                    this.handleSetStateAction(action, contextLabel);
                    break;
                case 'set_flag':
                    this.handleSetFlagAction(action, contextLabel);
                    break;
                case 'switch_model':
                    this.handleSwitchModelAction(action, contextLabel);
                    break;
                case 'unlock_model':
                    this.handleUnlockModelAction(action, contextLabel);
                    break;
                case 'charge_tokens':
                    this.handleChargeTokensAction(action, summary, contextLabel);
                    break;
                default:
                    this.logActionNoop(action, `unknown action type "${type || 'undefined'}"`, contextLabel);
                    break;
            }
        }

        return summary;
    }

    handleStatDeltaAction(action, summary, contextLabel) {
        let delta = this.extractActionObject(action, ['delta', 'effect', 'values', 'stats']);
        if (!delta && typeof action.key === 'string' && Object.prototype.hasOwnProperty.call(action, 'value')) {
            delta = { [action.key]: action.value };
        }
        if (!delta || Object.keys(delta).length === 0) {
            this.logActionNoop(action, 'stat_delta missing delta object', contextLabel);
            return;
        }

        const safeDelta = {};
        for (const [key, value] of Object.entries(delta)) {
            const isNumber = typeof value === 'number' && Number.isFinite(value);
            const isRange = Array.isArray(value) && value.length === 2
                && value.every(n => typeof n === 'number' && Number.isFinite(n));
            if (isNumber || isRange) safeDelta[key] = value;
        }
        if (Object.keys(safeDelta).length === 0) {
            this.logActionNoop(action, 'stat_delta has no numeric payload', contextLabel);
            return;
        }

        const resolved = this.property.applyEffect(safeDelta);
        this.mergeNumericDelta(summary.statDelta, resolved);
    }

    handleSetStateAction(action, contextLabel) {
        let statePatch = this.extractActionObject(action, ['state', 'set', 'patch', 'values']);
        if (!statePatch && typeof action.key === 'string' && Object.prototype.hasOwnProperty.call(action, 'value')) {
            statePatch = { [action.key]: action.value };
        }
        if (!statePatch || Object.keys(statePatch).length === 0) {
            this.logActionNoop(action, 'set_state missing state payload', contextLabel);
            return;
        }

        for (const [key, value] of Object.entries(statePatch)) {
            if (key === 'current_model' && typeof value === 'string' && value.trim()) {
                const modelId = value.trim();
                if (!AI_MODELS[modelId]) {
                    this.logActionNoop(action, `set_state rejected unknown model "${modelId}"`, contextLabel);
                    continue;
                }
                if (!this.isModelUnlocked(modelId)) {
                    this.logActionNoop(action, `set_state rejected for locked model "${modelId}"`, contextLabel);
                    continue;
                }
                this.setCurrentModelId(modelId);
                continue;
            }
            this.property.set(key, value);
        }
    }

    handleSetFlagAction(action, contextLabel) {
        const flags = this.extractActionObject(action, ['flags', 'map']);
        if (flags) {
            for (const [key, value] of Object.entries(flags)) this.property.setFlag(key, !!value);
            return;
        }

        const key = typeof action.key === 'string' && action.key.trim()
            ? action.key.trim()
            : (typeof action.flag === 'string' && action.flag.trim() ? action.flag.trim() : '');
        if (!key) {
            this.logActionNoop(action, 'set_flag missing key/flags', contextLabel);
            return;
        }
        const value = Object.prototype.hasOwnProperty.call(action, 'value') ? !!action.value : true;
        this.property.setFlag(key, value);
    }

    handleSwitchModelAction(action, contextLabel) {
        const modelId = this.getActionModelId(action);
        if (!modelId) {
            this.logActionNoop(action, 'switch_model missing model id', contextLabel);
            return;
        }
        if (!AI_MODELS[modelId]) {
            this.logActionNoop(action, `switch_model unknown model "${modelId}"`, contextLabel);
            return;
        }
        if (!this.isModelUnlocked(modelId)) {
            this.logActionNoop(action, `switch_model rejected for locked model "${modelId}"`, contextLabel);
            return;
        }
        const current = this.getCurrentModelId();
        if (current === modelId) return;
        this.setCurrentModelId(modelId);
    }

    handleUnlockModelAction(action, contextLabel) {
        const modelId = this.getActionModelId(action);
        if (!modelId) {
            this.logActionNoop(action, 'unlock_model missing model id', contextLabel);
            return;
        }
        if (!AI_MODELS[modelId]) {
            this.logActionNoop(action, `unlock_model unknown model "${modelId}"`, contextLabel);
            return;
        }
        if (this.isModelUnlocked(modelId)) return;
        this.unlockModel(modelId);
    }

    handleChargeTokensAction(action, summary, contextLabel) {
        const raw = Object.prototype.hasOwnProperty.call(action, 'amount') ? action.amount
            : (Object.prototype.hasOwnProperty.call(action, 'tokens') ? action.tokens : action.tokenCost);
        const amount = this.normalizeTokenAmount(raw);
        if (amount === null) {
            this.logActionNoop(action, 'charge_tokens requires a positive amount', contextLabel);
            return;
        }

        const modelId = this.getCurrentModelId();
        if (!modelId) {
            this.logActionNoop(action, 'charge_tokens skipped without active model', contextLabel);
            return;
        }
        const model = AI_MODELS[modelId];
        if (!model || typeof model.tokenPrice !== 'number' || !Number.isFinite(model.tokenPrice)) {
            this.logActionNoop(action, `charge_tokens missing token price for model "${modelId}"`, contextLabel);
            return;
        }

        const moneyCost = Math.round(amount * model.tokenPrice);
        if (moneyCost !== 0) {
            const resolved = this.property.applyEffect({ money: -moneyCost });
            this.mergeNumericDelta(summary.statDelta, resolved);
            summary.modelCostSpent += moneyCost;
        }
        summary.tokensCharged += amount;
    }

    applyCharmRelationAdjustment(deltaMap, stateSnapshot) {
        if (!deltaMap || typeof deltaMap !== 'object') return;
        const charmMod = ((stateSnapshot.charm || 50) - 50) / 100;
        if (charmMod === 0) return;

        for (const rk of ['shaoye_rel', 'yimin_rel']) {
            const baseDelta = deltaMap[rk];
            if (typeof baseDelta !== 'number' || baseDelta === 0) continue;
            const adj = Math.round(baseDelta * charmMod);
            if (adj === 0) continue;
            const resolved = this.property.applyEffect({ [rk]: adj });
            this.mergeNumericDelta(deltaMap, resolved);
        }
    }

    createMonthRuntimeState(month = 1) {
        const salary = this.property.get('salary') || 3000;
        const livingCost = this.property.get('living_cost') || 1500;
        return {
            month,
            salaryBefore: salary,
            salaryDelta: 0,
            salaryAfter: salary,
            livingCost,
            monthIncome: 0,
            monthModelCost: 0,
            totalDays: 0,
            overtimeDays: 0,
            lowQualityDays: 0,
            bugDays: 0
        };
    }

    beginMonthRuntime(month) {
        const salary = this.property.get('salary') || 3000;
        const livingCost = this.property.get('living_cost') || 1500;
        this.monthRuntime = {
            month,
            salaryBefore: salary,
            salaryDelta: 0,
            salaryAfter: salary,
            livingCost,
            monthIncome: month > 1 ? salary - livingCost : 0,
            monthModelCost: 0,
            totalDays: 0,
            overtimeDays: 0,
            lowQualityDays: 0,
            bugDays: 0
        };
    }

    registerModelCostSpent(cost) {
        if (typeof cost !== 'number' || !Number.isFinite(cost) || cost <= 0) return;
        if (!this.monthRuntime) {
            this.monthRuntime = this.createMonthRuntimeState(this.property.get('month') || 1);
        }
        this.monthRuntime.monthModelCost += Math.round(cost);
    }

    isQuarterlyReviewEvent(eventId) {
        if (typeof eventId !== 'string' || !eventId) return false;
        return eventId.startsWith(QUARTERLY_REVIEW_EVENT_PREFIX);
    }

    sanitizeQuarterlyReviewActions(eventId, actions) {
        if (!this.isQuarterlyReviewEvent(eventId) || !Array.isArray(actions) || actions.length === 0) {
            return Array.isArray(actions) ? actions : [];
        }

        const sanitized = [];
        for (const action of actions) {
            const normalized = this.sanitizeQuarterlyReviewAction(action);
            if (normalized) sanitized.push(normalized);
        }
        return sanitized;
    }

    sanitizeQuarterlyReviewAction(action) {
        if (!action || typeof action !== 'object') return action;

        if (action.type === 'stat_delta') {
            const delta = this.extractActionObject(action, ['delta', 'effect', 'values', 'stats']);
            if (delta && typeof delta === 'object') {
                const nextDelta = { ...delta };
                if (Object.prototype.hasOwnProperty.call(nextDelta, 'salary')) delete nextDelta.salary;
                if (Object.keys(nextDelta).length === 0) return null;
                if (Object.prototype.hasOwnProperty.call(action, 'delta')) return { ...action, delta: nextDelta };
                if (Object.prototype.hasOwnProperty.call(action, 'effect')) return { ...action, effect: nextDelta };
                if (Object.prototype.hasOwnProperty.call(action, 'values')) return { ...action, values: nextDelta };
                if (Object.prototype.hasOwnProperty.call(action, 'stats')) return { ...action, stats: nextDelta };
                return { ...action, delta: nextDelta };
            }
            if (action.key === 'salary') return null;
        }

        if (action.type === 'set_state') {
            const statePatch = this.extractActionObject(action, ['state', 'set', 'patch', 'values']);
            if (statePatch && typeof statePatch === 'object') {
                const nextState = { ...statePatch };
                if (Object.prototype.hasOwnProperty.call(nextState, 'salary')) delete nextState.salary;
                if (Object.keys(nextState).length === 0) return null;
                if (Object.prototype.hasOwnProperty.call(action, 'state')) return { ...action, state: nextState };
                if (Object.prototype.hasOwnProperty.call(action, 'set')) return { ...action, set: nextState };
                if (Object.prototype.hasOwnProperty.call(action, 'patch')) return { ...action, patch: nextState };
                if (Object.prototype.hasOwnProperty.call(action, 'values')) return { ...action, values: nextState };
                return { ...action, state: nextState };
            }
            if (action.key === 'salary') return null;
        }

        return action;
    }

    buildModelCostPlan(modelId, baseTokens) {
        const model = AI_MODELS[modelId];
        if (!model) return { mode: 'fallback', tokens: 0, moneyCost: 0, debtBuffer: 0 };

        const normalizedTokens = Math.max(1, Math.round(baseTokens || 1));
        const mul = BALANCE_CONFIG.modelCost.tokenMultiplier[modelId] || 1;
        const pressuredTokens = Math.max(1, Math.round(normalizedTokens * mul));
        const salary = this.property.get('salary') || 3000;
        const livingCost = this.property.get('living_cost') || 1500;
        const debtBuffer = Math.max(
            BALANCE_CONFIG.modelCost.minDebtBuffer,
            Math.floor((salary + livingCost) * BALANCE_CONFIG.modelCost.salaryDebtFactor)
        );

        if (model.tokenPrice <= 0) {
            return { mode: 'free', tokens: pressuredTokens, moneyCost: 0, debtBuffer };
        }

        const currentMoney = this.property.get('money') || 0;
        const pressuredCost = pressuredTokens * model.tokenPrice;
        if (currentMoney + debtBuffer >= pressuredCost) {
            const mode = currentMoney >= pressuredCost ? 'full' : 'overdraft';
            return { mode, tokens: pressuredTokens, moneyCost: pressuredCost, debtBuffer };
        }

        if (MAINSTREAM_MODEL_IDS.has(modelId)) {
            const throttledTokens = Math.max(
                1,
                Math.round(pressuredTokens * BALANCE_CONFIG.modelCost.mainstreamThrottleFactor)
            );
            const throttledCost = throttledTokens * model.tokenPrice;
            if (currentMoney + debtBuffer >= throttledCost) {
                const mode = currentMoney >= throttledCost ? 'throttled' : 'throttled-overdraft';
                return { mode, tokens: throttledTokens, moneyCost: throttledCost, debtBuffer };
            }
        }

        return { mode: 'fallback', tokens: pressuredTokens, moneyCost: pressuredCost, debtBuffer };
    }

    evaluateOvertimePlan(quality, hasBug) {
        if (quality <= BALANCE_CONFIG.overtime.hardThreshold) return { trigger: true, severe: true };

        if (quality >= BALANCE_CONFIG.overtime.softThreshold && !hasBug) {
            return { trigger: false, severe: false };
        }

        let chance = Math.max(
            0,
            (BALANCE_CONFIG.overtime.softThreshold - quality) * BALANCE_CONFIG.overtime.softChancePerPoint
        );
        if (hasBug) chance += BALANCE_CONFIG.overtime.bugChanceBoost;
        chance = Math.min(0.85, chance);
        return { trigger: Math.random() < chance, severe: false };
    }

    resolveMonthlySatisfyDelta(avgQ) {
        const runtime = this.monthRuntime || this.createMonthRuntimeState(this.property.get('month') || 1);
        const hp = this.property.get('hp') || 0;
        const brain = this.property.get('brain') || 0;
        const totalDays = Math.max(1, runtime.totalDays || this.monthQualities.length || 1);
        const overtimeRatio = (runtime.overtimeDays || 0) / totalDays;
        const bugRatio = (runtime.bugDays || 0) / totalDays;
        const stability = Math.round((hp + brain) / 2);

        let qualityScore = 0;
        if (avgQ >= 88) qualityScore = 4;
        else if (avgQ >= 76) qualityScore = 3;
        else if (avgQ >= 64) qualityScore = 2;
        else if (avgQ >= 54) qualityScore = 1;
        else if (avgQ >= 40) qualityScore = 0;
        else if (avgQ >= 30) qualityScore = -2;
        else qualityScore = -4;

        let stabilityScore = 0;
        if (stability >= 80) stabilityScore = 2;
        else if (stability >= 64) stabilityScore = 1;
        else if (stability >= 42) stabilityScore = 0;
        else if (stability >= 28) stabilityScore = -1;
        else stabilityScore = -2;

        let overtimePenalty = 0;
        if (overtimeRatio >= 0.65) overtimePenalty = -4;
        else if (overtimeRatio >= 0.5) overtimePenalty = -3;
        else if (overtimeRatio >= 0.34) overtimePenalty = -2;
        else if (overtimeRatio >= 0.2) overtimePenalty = -1;

        let bugPenalty = 0;
        if (bugRatio >= 0.75) bugPenalty = -2;
        else if (bugRatio >= 0.5) bugPenalty = -1;

        const baseDelta = qualityScore + stabilityScore + overtimePenalty + bugPenalty;
        const charm = this.property.get('charm') || 50;
        const charmFactor = 1 + (charm - 50) / BALANCE_CONFIG.settlement.charmDivider;
        const delta = clampValue(
            Math.round(baseDelta * charmFactor),
            BALANCE_CONFIG.settlement.minDelta,
            BALANCE_CONFIG.settlement.maxDelta
        );

        return { delta, qualityScore, stabilityScore, overtimePenalty, bugPenalty, overtimeRatio, bugRatio, stability };
    }

    resolveQuarterlySalaryReview(month, avgQ, settle) {
        if (!QUARTERLY_REVIEW_MONTHS.has(month)) {
            return { triggered: false, delta: 0, score: 0, salaryBefore: this.property.get('salary') || 3000 };
        }

        const salaryBefore = this.property.get('salary') || 3000;
        const boss = this.property.get('bossSatisfy') || 0;
        const hp = this.property.get('hp') || 0;
        const brain = this.property.get('brain') || 0;
        const stability = (hp + brain) / 2;
        const overtimeRatio = settle?.overtimeRatio || 0;

        let score = 0;
        if (avgQ >= 85) score += 3;
        else if (avgQ >= 72) score += 2;
        else if (avgQ >= 58) score += 1;
        else if (avgQ < 42) score -= 2;
        else score -= 1;

        if (stability >= 78) score += 2;
        else if (stability >= 62) score += 1;
        else if (stability < 35) score -= 2;
        else if (stability < 48) score -= 1;

        if (boss >= 72) score += 2;
        else if (boss >= 56) score += 1;
        else if (boss < 32) score -= 2;
        else if (boss < 45) score -= 1;

        if (overtimeRatio <= 0.18) score += 1;
        else if (overtimeRatio >= 0.5) score -= 2;
        else if (overtimeRatio >= 0.35) score -= 1;

        if (settle?.delta >= 3) score += 1;
        else if (settle?.delta <= -3) score -= 1;

        let delta = 0;
        if (score >= 7) delta = 700;
        else if (score >= 5) delta = 450;
        else if (score >= 3) delta = 250;
        else if (score >= 1) delta = 100;
        else if (score <= -5) delta = -450;
        else if (score <= -3) delta = -250;
        else if (score <= -1) delta = -100;

        const salaryAfter = clampValue(
            salaryBefore + delta,
            BALANCE_CONFIG.salaryReview.minSalary,
            BALANCE_CONFIG.salaryReview.maxSalary
        );
        return {
            triggered: true,
            score,
            delta: salaryAfter - salaryBefore,
            salaryBefore,
            salaryAfter
        };
    }

    processMonth() {
        const month = this.property.get('month');
        if (month > 12) { this.endGame(); return; }
        this.beginMonthRuntime(month);

        if (month > 1) {
            this.property.monthlyExpense();
            const salary = this.monthRuntime.salaryBefore;
            const cost = this.monthRuntime.livingCost;
            const income = this.monthRuntime.monthIncome;
            const costDisplay = cost >= 0 ? `-¥${cost}` : `+¥${Math.abs(cost)}`;
            const incomeDisplay = income >= 0 ? `+¥${income}` : `-¥${Math.abs(income)}`;
            this.emitEvent(`月初结算：工资 +¥${salary}，生活费 ${costDisplay}，净结余 ${incomeDisplay}`, 'money');
        }
        const recovery = this.property.monthlyRecovery();
        if (recovery.brainRecover > 0 || recovery.hpRecover > 0) {
            const parts = [];
            if (recovery.hpRecover > 0) parts.push(`❤️+${recovery.hpRecover}`);
            if (recovery.brainRecover > 0) parts.push(`🧠+${recovery.brainRecover}`);
            this.emitEvent(`月初恢复：${parts.join(' ')}`, 'good');
        }

        for (const [id, model] of Object.entries(AI_MODELS)) {
            if (model.unlockMonth <= month && !this.isModelUnlocked(id)) {
                this.unlockModel(id);
                this.emitEvent(`🔓 新模型解锁：${model.name}！`, 'special');
            }
        }

        const totalDays = rng(5, 7);
        this.emitEvent(`—— ${month}月开始 · ${this.getStageName(month)} ——`, 'special');
        this.emitUI();

        const go = this.property.isGameOver();
        if (go) { this.endGame(go); return; }

        this.scheduleNext(() => this.processWorkDay(month, 1, totalDays));
    }

    processWorkDay(month, day, totalDays) {
        if (day > totalDays) {
            // Emit daily report before moving to next month
            this.emitDayReport(month, day - 1);
            this.nextMonth(month);
            return;
        }

        // Reset daily report at start of each day
        this.dayReport = { tokensUsed: 0, overtime: false, modelName: '', events: [] };

        this.property.set('day', day);
        const pool = TASK_COMPLEXITY[month] || TASK_COMPLEXITY[12];
        const stars = pool[rng(0, pool.length - 1)];
        let modelId = this.getCurrentModelId();
        let model = AI_MODELS[modelId];
        if (this.monthRuntime) this.monthRuntime.totalDays += 1;

        // Track model name for daily report
        this.dayReport.modelName = model ? model.name : '🧠 纯人肉';

        // 2b: update hidden ending tracking flags
        if (model) {
            this.property.setFlag('used_ai', true);
            if (modelId !== 'doubao') {
                this.property.setFlag('only_doubao', false);
            }
        }

        // 2a: Opus 4.6 - 8% chance to refuse (no cost, no output)
        if (modelId === 'opus46' && Math.random() < 0.08) {
            this.dayReport.events.push('🎯 Opus 拒绝生成！');
            this.monthQualities.push(0);
            this.property.set('is_overtime', true);
            const overtime = this.property.get('consecutive_overtime') || 0;
            this.property.set('consecutive_overtime', overtime + 1);
            if (this.monthRuntime) {
                this.monthRuntime.overtimeDays += 1;
                this.monthRuntime.lowQualityDays += 1;
            }
            this.emitUI();
            this.scheduleNext(() => this.processDayEvent(month, day, totalDays));
            return;
        }

        const quality = this.calcQuality(model, stars, modelId);

        if (model) {
            let baseTokens = model.cost[stars - 1] || model.cost[0];

            // 2a: DeepSeek V4 - 12% chance extra 30% token cost
            if (modelId === 'deepseek_v4' && Math.random() < 0.12) {
                const extraCost = Math.floor(baseTokens * 0.3);
                baseTokens += extraCost;
                this.dayReport.events.push(`🔮 DeepSeek超长 +${extraCost}M`);
            }

            const costPlan = this.buildModelCostPlan(modelId, baseTokens);
            if (costPlan.mode === 'fallback') {
                this.dayReport.events.push('💸 预算吃紧！本日改为纯人肉写代码');
                this.property.applyEffect({ brain: -rng(6, 12) });
                model = null;
                modelId = null;
            } else {
                if (costPlan.mode === 'throttled' || costPlan.mode === 'throttled-overdraft') {
                    this.dayReport.events.push(`💸 成本管控触发：${model.name}降载运行`);
                }
                if (costPlan.mode === 'overdraft' || costPlan.mode === 'throttled-overdraft') {
                    this.dayReport.events.push(`📉 本日模型开销透支 ¥${costPlan.moneyCost}`);
                }

                if (costPlan.moneyCost > 0) {
                    this.property.applyEffect({ money: -costPlan.moneyCost });
                    this.registerModelCostSpent(costPlan.moneyCost);
                }
                this.dayReport.tokensUsed += costPlan.tokens;
            }
        }

        // luck bug rate correction (GAME_DESIGN 2.3)
        const luck = this.property.get('luck') || 50;
        let baseBugRate = model ? model.bugRate : 0.3;

        // Pirate models: unstable bug rate (random each day)
        if (modelId === 'cheapgpt') {
            baseBugRate = 0.10 + Math.random() * 0.70;  // 10%~80%
        } else if (modelId === 'fakeopus') {
            baseBugRate = 0.15 + Math.random() * 0.60;  // 15%~75%
        }

        const hasBug = Math.random() < baseBugRate * (1 - (luck - 50) / 200);

        // Pirate model good/bad day report
        if (modelId === 'cheapgpt' || modelId === 'fakeopus') {
            if (baseBugRate < 0.20) {
                this.dayReport.events.push(`🎲 ${model.name} 今天状态爆表！Bug率极低`);
            } else if (baseBugRate > 0.65) {
                this.dayReport.events.push(`🎲 ${model.name} 今天拉胯了，Bug满天飞`);
            }
        }
        let brainLoss = 0;
        if (hasBug) {
            brainLoss = Math.floor(stars * (1 - (model ? model.quality : 40) / 100) * 3);
            // Extra brain drain: 2~5 scaled by task difficulty
            const extraBrainDrain = rng(2, Math.min(5, 2 + stars));
            brainLoss += extraBrainDrain;
            this.property.applyEffect({ brain: -brainLoss });
            this.property.set('total_bugs', this.property.get('total_bugs') + 1);
            if (this.monthRuntime) this.monthRuntime.bugDays += 1;
        }

        this.monthQualities.push(quality);
        if (this.monthRuntime && quality < BALANCE_CONFIG.overtime.softThreshold) {
            this.monthRuntime.lowQualityDays += 1;
        }

        // 2d: overtime mechanism - softer curve to prevent early snowball
        const overtimePlan = this.evaluateOvertimePlan(quality, hasBug);
        if (overtimePlan.trigger) {
            this.property.set('is_overtime', true);
            const overtime = this.property.get('consecutive_overtime') || 0;
            const hpRange = overtimePlan.severe ? BALANCE_CONFIG.overtime.hardHpRange : BALANCE_CONFIG.overtime.lightHpRange;
            let hpLoss = rng(hpRange[0], hpRange[1]);
            const fatigueLoss = Math.min(
                BALANCE_CONFIG.overtime.fatigueLossCap,
                Math.floor(overtime / BALANCE_CONFIG.overtime.fatigueStep)
            );
            hpLoss += fatigueLoss;
            const extraBrainLoss = overtimePlan.severe ? BALANCE_CONFIG.overtime.extraBrainLoss : 0;

            this.property.applyEffect({ hp: -hpLoss });
            if (extraBrainLoss > 0) this.property.applyEffect({ brain: -extraBrainLoss });
            this.property.set('consecutive_overtime', overtime + 1);
            this.dayReport.overtime = true;
            if (this.monthRuntime) this.monthRuntime.overtimeDays += 1;

            const overtimeAfter = overtime + 1;
            if (overtimeAfter >= BALANCE_CONFIG.overtime.forcedRestAt) {
                const recoverHp = rng(2, 4);
                const recoverBrain = rng(1, 2);
                this.property.applyEffect({ hp: recoverHp, brain: recoverBrain });
                this.property.set('consecutive_overtime', BALANCE_CONFIG.overtime.forcedRestReset);
                const bugPart = hasBug ? `，期间还修了个Bug 🧠-${brainLoss}` : '';
                const severePart = overtimePlan.severe ? `，低质量返工额外透支 🧠-${extraBrainLoss}` : '';
                this.dayReport.events.push(`⚠️ 连续加班${overtimeAfter}天，强制补觉恢复 ❤️+${recoverHp} 🧠+${recoverBrain}${bugPart}${severePart}`);
            } else if (overtimeAfter >= 4) {
                const bugPart = hasBug ? `，外加修Bug 🧠-${brainLoss}` : '';
                const severePart = overtimePlan.severe ? `，低质量返工 🧠-${extraBrainLoss}` : '';
                this.dayReport.events.push(`⚠️ 代码只有${quality}分，连续加班${overtimeAfter}天${bugPart}${severePart} ❤️-${hpLoss}`);
            } else {
                const severePart = overtimePlan.severe ? `，返工透支 🧠-${extraBrainLoss}` : '';
                this.dayReport.events.push(buildOvertimeMsg(quality, hasBug, hpLoss, brainLoss) + severePart);
            }
        } else {
            this.property.set('is_overtime', false);
            const currentOvertime = this.property.get('consecutive_overtime') || 0;
            this.property.set('consecutive_overtime', Math.max(0, currentOvertime - 1));
            if (hasBug) {
                const bugDelta = buildDeltaStr({ brain: -brainLoss });
                const bugMsg = BUG_NARRATIVES[Math.floor(Math.random() * BUG_NARRATIVES.length)];
                this.dayReport.events.push(bugMsg + bugDelta);
            }
        }

        this.emitUI();

        const go = this.property.isGameOver();
        if (go) { this.endGame(go); return; }

        // Proceed to day event — report emitted AFTER events
        this.scheduleNext(() => this.processDayEvent(month, day, totalDays));
    }

    processDayEvent(month, day, totalDays) {
        const state = this.property.toJSON();
        const pool = this.eventMgr.getPool(month, state);

        // Event trigger rate: higher in early months for better first impression
        const eventRate = month <= 2 ? 1.0 : month <= 4 ? 0.95 : 0.85;
        if (pool.length > 0 && Math.random() < eventRate) {
            const picked = this.eventMgr.pickPrioritized(pool);
            if (picked) {
                const { id, ev } = picked;
                if (ev.type === 'choice' && ev.choices) {
                    const result = this.eventMgr.execute(id, ev, state);
                    addToLegacySet(this.legacy, 'events_seen', id);
                    const normalizedActions = this.sanitizeQuarterlyReviewActions(id, result.actions);
                    const promptSummary = this.executeActionPlan(normalizedActions, `choice-entry:${id}`);
                    this.applyCharmRelationAdjustment(promptSummary.statDelta, state);
                    if (promptSummary.tokensCharged > 0) this.dayReport.tokensUsed += promptSummary.tokensCharged;
                    if (promptSummary.modelCostSpent > 0) this.registerModelCostSpent(promptSummary.modelCostSpent);
                    const promptDeltaStr = buildDeltaStr(promptSummary.statDelta);
                    this.emitEvent(result.text + promptDeltaStr, 'special');
                    if (result.postEvent) this.dayReport.events.push(result.postEvent);
                    this.emitUI();
                    const go = this.property.isGameOver();
                    if (go) { this.endGame(go); return; }
                    this.showChoice(ev, month, day, totalDays);
                    return;
                }
                const result = this.eventMgr.execute(id, ev, state);
                addToLegacySet(this.legacy, 'events_seen', id);
                const normalizedActions = this.sanitizeQuarterlyReviewActions(id, result.actions);
                const actionSummary = this.executeActionPlan(normalizedActions, `event:${id}`);
                this.applyCharmRelationAdjustment(actionSummary.statDelta, state);
                const deltaStr = buildDeltaStr(actionSummary.statDelta);
                // Push event text to dayReport only (displayed via emitDayReport)
                this.dayReport.events.push(result.text + deltaStr);
                if (result.postEvent) this.dayReport.events.push(result.postEvent);
                if (actionSummary.tokensCharged > 0) this.dayReport.tokensUsed += actionSummary.tokensCharged;
                if (actionSummary.modelCostSpent > 0) this.registerModelCostSpent(actionSummary.modelCostSpent);
                if (['special', 'good'].includes(result.type)) this.timeline.push({ month, day, text: result.text, type: result.type });
                this.emitUI();
                const go = this.property.isGameOver();
                if (go) { this.endGame(go); return; }
            }
        }

        // Emit daily report AFTER events, before next day
        this.emitDayReport(month, day);
        this.scheduleNext(() => this.processWorkDay(month, day + 1, totalDays));
    }

    nextMonth(month) {
        const avgQ = this.monthQualities.length > 0
            ? Math.round(this.monthQualities.reduce((a, b) => a + b, 0) / this.monthQualities.length) : 50;

        const settle = this.resolveMonthlySatisfyDelta(avgQ);
        this.property.applyEffect({ bossSatisfy: settle.delta });
        this.property.set('avg_quality', avgQ);

        const review = this.resolveQuarterlySalaryReview(month, avgQ, settle);
        if (review.triggered && review.delta !== 0) {
            this.property.applyEffect({ salary: review.delta });
        }

        if (!this.monthRuntime || this.monthRuntime.month !== month) {
            this.monthRuntime = this.createMonthRuntimeState(month);
        }
        const salaryBefore = review.salaryBefore || this.monthRuntime.salaryBefore || this.property.get('salary') || 3000;
        const salaryAfter = review.triggered ? (review.salaryAfter || (salaryBefore + review.delta)) : salaryBefore;
        this.monthRuntime.salaryBefore = salaryBefore;
        this.monthRuntime.salaryDelta = review.triggered ? review.delta : 0;
        this.monthRuntime.salaryAfter = salaryAfter;

        if (this.property.get('money') <= 0) this.property.set('months_bankrupt', this.property.get('months_bankrupt') + 1);
        else this.property.set('months_bankrupt', 0);

        const monthIncome = this.monthRuntime.monthIncome || 0;
        const monthModelCost = this.monthRuntime.monthModelCost || 0;
        const financePart = `净结余${monthIncome >= 0 ? '+' : '-'}¥${Math.abs(monthIncome)} · 模型支出-¥${monthModelCost}`;
        this.emitEvent(
            `—— ${month}月结算：平均质量 ${avgQ} · 满意度${settle.delta >= 0 ? '+' : ''}${settle.delta} · ${financePart} ——`,
            'neutral'
        );

        if (review.triggered) {
            if (review.delta === 0) {
                this.emitEvent(`📊 季度评薪：综合得分 ${review.score}，薪资维持 ¥${salaryAfter}`, 'money');
            } else {
                this.emitEvent(
                    `📊 季度评薪：综合得分 ${review.score}，月薪${review.delta >= 0 ? '+' : ''}${review.delta} → ¥${salaryAfter}`,
                    review.delta >= 0 ? 'good' : 'bad'
                );
            }
        }

        if (this.onMonthSummary) {
            this.onMonthSummary({
                month,
                avgQuality: avgQ,
                satisfyDelta: settle.delta,
                bossSatisfy: this.property.get('bossSatisfy'),
                money: this.property.get('money'),
                salaryBefore: this.monthRuntime.salaryBefore,
                salaryDelta: this.monthRuntime.salaryDelta,
                salaryAfter: this.monthRuntime.salaryAfter,
                livingCost: this.monthRuntime.livingCost,
                monthIncome: this.monthRuntime.monthIncome,
                monthModelCost: this.monthRuntime.monthModelCost
            });
        }

        this.monthQualities = [];
        this.emitUI();

        const go = this.property.isGameOver();
        if (go) { this.endGame(go); return; }

        this.property.set('month', month + 1);
        this.scheduleNext(() => this.processMonth());
    }

    showChoice(ev, month, day, totalDays) {
        this.pause();
        this._pcc = { month, day, totalDays };
        if (this.onShowChoice) this.onShowChoice(ev, this.property.toJSON());
    }

    makeChoice(choice) {
        const state = this.property.toJSON();
        const before = { ...this.property.toJSON() };
        const result = this.eventMgr.executeChoice(choice, state);
        const actionSummary = this.executeActionPlan(result.actions, 'choice');
        this.applyCharmRelationAdjustment(actionSummary.statDelta, state);
        if (actionSummary.tokensCharged > 0) this.dayReport.tokensUsed += actionSummary.tokensCharged;
        if (actionSummary.modelCostSpent > 0) this.registerModelCostSpent(actionSummary.modelCostSpent);
        const after = this.property.toJSON();
        const deltas = {};
        for (const key of ['hp','brain','money','bossSatisfy','shaoye_rel','yimin_rel','gf_rel']) {
            const d = (after[key] || 0) - (before[key] || 0);
            if (d !== 0) deltas[key] = d;
        }
        if (this.onChoiceResult) this.onChoiceResult({ text: result.text, deltas });
        if (this.onHideChoice) this.onHideChoice();
        const month = this.property.get('month');
        this.timeline.push({ month, text: result.text, type: 'choice-made' });
        this.emitUI();
        this.resume();
        const go = this.property.isGameOver();
        if (go) { this.endGame(go); return; }
        const ctx = this._pcc || { month, day: 1, totalDays: 3 };
        // Emit daily report after choice, before next day
        this.emitDayReport(ctx.month, ctx.day);
        this.scheduleNext(() => this.processWorkDay(ctx.month, ctx.day + 1, ctx.totalDays));
    }

    calcQuality(model, stars, modelId) {
        const brain = this.property.get('brain');
        const luck = this.property.get('luck') || 50;
        let bq = model ? model.quality : brain * 0.5;
        const bb = (brain - 50) * 0.3;
        const tp = [0, 0, -5, -10, -20][stars] || 0;
        let rr = rng(-8, 8);
        const luckBonus = (luck - 50) * 0.05; // 🍀 luck 微调代码质量（±2.5）
        if (brain < 30) bq -= 20;

        // 2a: 模型特殊效果（GAME_DESIGN §四.2）
        let modelSpecial = 0;
        switch (modelId) {
            case 'doubao':
                if (stars === 1) modelSpecial += 10;           // 简单任务(⭐)质量+10
                if (Math.random() < 0.10) modelSpecial += 20;  // 10%概率超常发挥
                // 2e: doubao_quality_bonus 支持（buff_doubao）
                const dqb = this.property.get('doubao_quality_bonus');
                if (dqb) modelSpecial += dqb;
                break;
            case 'gpt54':
                rr = rng(-3, 3);  // 波动缩小至 ±3
                break;
            case 'cheapgpt':
                if (Math.random() < 0.20) return 0;  // 20%概率输出完全无关内容
                break;
            case 'fakeopus':
                modelSpecial -= 15;  // 质量偷偷 -15
                break;
        }

        return Math.round(Math.max(0, Math.min(100, bq + bb + tp + rr + luckBonus + modelSpecial)));
    }

    endGame(cause) {
        this.pendingStep = null;
        this.pause();
        const state = this.property.toJSON();
        const month = state.month > 12 ? 12 : state.month;
        const avgQ = state.avg_quality || 0;
        const bossSat = state.bossSatisfy || 0;
        const ending = this.determineEnding(state, cause);
        const base = month * 10;
        const qb = Math.floor(avgQ / 10);
        const sb = Math.floor(bossSat / 5);
        const totalCoins = base + qb + sb + (ending.coins || 0);
        this.legacy.coins += totalCoins;
        this.legacy.runs++;
        if (month > this.legacy.best_month) this.legacy.best_month = month;
        if (ending.isWin) this.legacy.wins++;
        addToLegacySet(this.legacy, 'endings_unlocked', ending.id);
        saveLegacy(this.legacy);
        if (this.onGameEnd) this.onGameEnd({ ending, month, avgQuality: avgQ, bossSatisfy: bossSat, money: state.money, totalCoins, timeline: this.timeline.slice(-10) });
    }

    determineEnding(state, cause) {
        // === 隐藏结局（最高优先级） ===
        if (state.brain < 10 && cause !== 'breakdown') return { id: 'ai_shape', icon: '🤖', title: '成为AI的形状', desc: '脑力几乎为零，康康已经和AI融为一体了...', isWin: false, coins: 50 };

        // === 失败结局 ===
        if (cause === 'death') return { id: 'death', icon: '💀', title: '过劳猝死', desc: '康康再也没有醒来...', isWin: false, coins: 20 };
        if (cause === 'breakdown') return { id: 'breakdown', icon: '😵', title: '精神崩溃', desc: '康康的大脑已经无法正常运转了...', isWin: false, coins: 20 };
        if (cause === 'fired') return { id: 'rider', icon: '🛵', title: '外卖骑手', desc: '老板满意度过低，康康被裁了...', isWin: false, coins: 30 };
        if (cause === 'bankrupt') return { id: 'bankrupt', icon: '💸', title: '破产回家', desc: '连续三个月入不敷出，康康只能回老家了...', isWin: false, coins: 10 };

        const avgQ = state.avg_quality || 0;
        const bossSat = state.bossSatisfy || 0;

        // === charm/luck 隐藏结局（GAME_DESIGN §八） ===
        if ((state.charm || 50) >= 85 && bossSat >= 70)
            return { id: 'ending_awakened', icon: '🌟', title: '人间清醒', desc: '高情商的康康在职场如鱼得水，活成了所有人羡慕的样子！', isWin: true, coins: 110 };
        if ((state.luck || 50) >= 90)
            return { id: 'ending_lucky', icon: '🍀', title: '欧皇降临', desc: '运气逆天的康康，做什么都顺风顺水！', isWin: true, coins: 120 };

        // === 2b: 新增隐藏结局（GAME_DESIGN §八） ===
        // 🧘 禅意程序员：brain >= 90 且全程不用AI
        if (state.brain >= 90 && !state.used_ai)
            return { id: 'ending_zen', icon: '🧘', title: '禅意程序员', desc: '从不依赖AI，纯靠脑力写出了完美代码！真正的编程禅师！', isWin: true, coins: 100 };
        // 🐳 豆包之神：全程只用豆包 + avg_quality >= 75
        if (state.only_doubao && avgQ >= 75)
            return { id: 'ending_doubao_god', icon: '🐳', title: '豆包之神', desc: '只用豆包也能写出高质量代码，康康成为了传说中的豆包之王！', isWin: true, coins: 130 };
        // 🤝 铁三角：shaoye_rel >= 90 && yimin_rel >= 90
        if ((state.shaoye_rel || 0) >= 90 && (state.yimin_rel || 0) >= 90)
            return { id: 'ending_triangle', icon: '🤝', title: '铁三角', desc: '康康和少爷、亿民结成了牢不可破的铁三角，职场无敌！', isWin: true, coins: 100 };

        // === 胜利结局 ===
        if (bossSat >= 80 && avgQ >= 80) return { id: 'ai_master', icon: '🏆', title: 'AI 大师', desc: '康康成为了公司的AI编程专家！大幅加薪！', isWin: true, coins: 150 };
        if (state.gamejam_won) return { id: 'indie_dev', icon: '🎮', title: '独立开发者', desc: 'GameJam获奖让康康走上了独立开发之路！', isWin: true, coins: 120 };
        if (bossSat >= 50) return { id: 'survived', icon: '✅', title: '安稳过关', desc: '平平安安度过了一年，饭碗保住了！', isWin: true, coins: 80 };

        // === 兜底 ===
        return { id: 'rider', icon: '🛵', title: '外卖骑手', desc: '年终考核不达标，康康被优化了...', isWin: false, coins: 30 };
    }

    emitDayReport(month, day) {
        const r = this.dayReport;
        if (r.tokensUsed === 0 && r.events.length === 0) {
            r.events.push(IDLE_DAY_PHRASES[Math.floor(Math.random() * IDLE_DAY_PHRASES.length)]);
        }
        // Call onDaySummary with simplified data structure (R5)
        if (this.onDaySummary) {
            this.onDaySummary({
                month, day,
                modelName: r.modelName,
                tokensUsed: r.tokensUsed,
                events: r.events,
                overtime: r.overtime
            });
        } else {
            // Fallback: plain text if no onDaySummary wired
            const tokenStr = r.tokensUsed > 0 ? `消耗 ${r.tokensUsed}M` : '';
            const overtimeStr = r.overtime ? ' | ⚠️加班' : '';
            const evStr = r.events.length > 0 ? ' | ' + r.events.join(' | ') : '';
            this.emitEvent(`📊 [${month}月${day}日] ${r.modelName}${tokenStr ? ' | ' + tokenStr : ''}${evStr}${overtimeStr}`, 'neutral');
        }
        // Reset for next day
        this.dayReport = { tokensUsed: 0, overtime: false, modelName: '', events: [] };
    }

    emitEvent(text, type) {
        if (this.onEvent) this.onEvent(this.property.get('month'), this.property.get('day') || 1, text, type);
    }
    emitUI() {
        this.flushPendingStep();
        const state = this.property.toJSON();
        if (this.onUpdateUI) this.onUpdateUI(state, this.getStageName(state.month || 1));
    }
    backToStart() { this.legacy = loadLegacy(); }
}
