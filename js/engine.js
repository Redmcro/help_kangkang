// ===== GameEngine =====
// v2: Month-based workplace survival loop

import { PropertyManager } from './property.js';
import { EventManager } from './events.js';
import { loadLegacy, saveLegacy, addToLegacySet } from './save.js';

const AI_MODELS = {
    doubao: { name: '🐳 豆包', unlockMonth: 1, cost: [5, 15, 30, 80], quality: 45, bugRate: 0.40 },
    gpt54: { name: '🤖 GPT-5.4', unlockMonth: 2, cost: [20, 50, 150, 400], quality: 80, bugRate: 0.12 },
    opus46: { name: '🎯 Opus 4.6', unlockMonth: 3, cost: [35, 80, 250, 600], quality: 92, bugRate: 0.05 },
    deepseek_v4: { name: '🔮 DeepSeek V4', unlockMonth: 4, cost: [8, 25, 60, 150], quality: 72, bugRate: 0.18 },
    cheapgpt: { name: '💀 CheapGPT', unlockMonth: 3, cost: [3, 10, 20, 50], quality: 30, bugRate: 0.60 },
    fakeopus: { name: '🎪 FakeOpus', unlockMonth: 5, cost: [5, 15, 35, 90], quality: 35, bugRate: 0.55 }
};

const TASK_COMPLEXITY = {
    1: [1, 1, 1, 1, 1, 1, 2, 2, 2, 2],
    2: [1, 1, 1, 2, 2, 2, 2, 2, 3, 3], 3: [1, 1, 1, 2, 2, 2, 2, 2, 3, 3],
    4: [2, 2, 2, 3, 3, 3, 3, 3, 4, 4], 5: [2, 2, 2, 3, 3, 3, 3, 3, 4, 4], 6: [2, 2, 2, 3, 3, 3, 3, 3, 4, 4],
    7: [2, 2, 3, 3, 3, 3, 4, 4, 4, 4], 8: [2, 2, 3, 3, 3, 3, 4, 4, 4, 4], 9: [2, 2, 3, 3, 3, 3, 4, 4, 4, 4],
    10: [3, 3, 3, 3, 4, 4, 4, 4, 4, 4], 11: [3, 3, 3, 3, 4, 4, 4, 4, 4, 4], 12: [3, 3, 3, 3, 4, 4, 4, 4, 4, 4]
};

function rng(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

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
        this.paused = false;
        this.timeline = [];
        this.monthQualities = [];
        // Callbacks set by app.js
        this.onEvent = null;
        this.onUpdateUI = null;
        this.onShowChoice = null;
        this.onHideChoice = null;
        this.onMonthSummary = null;
        this.onGameEnd = null;
        this.onError = null;
    }

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
    isBuffLocked(buff) { return buff.cost > this.legacy.coins && !this.selectedBuffs.has(buff.id); }
    getBuffCost() {
        let cost = 0;
        this.selectedBuffs.forEach(id => { const b = this.buffs.find(x => x.id === id); if (b) cost += b.cost; });
        return cost;
    }

    start() {
        const cost = this.getBuffCost();
        if (cost > this.legacy.coins && cost > 0) { if (this.onError) this.onError('传世金币不足！'); return false; }
        if (cost > 0) { this.legacy.coins -= cost; saveLegacy(this.legacy); }

        clearTimeout(this.autoTimer);
        this.property.reset();
        this.eventMgr.reset();
        this.timeline = [];
        this.paused = false;
        this.monthQualities = [];

        this.selectedBuffs.forEach(id => {
            const b = this.buffs.find(x => x.id === id);
            if (b) this.property.applyBuff(b.effect);
        });

        this.property.setFlag('model_doubao_unlocked', true);
        this.emitEvent('康康正式入职了！新的一年，新的挑战...', 'special');
        this.emitUI();
        this.scheduleNext(() => this.processMonth());
        return true;
    }

    setSpeed(s) { this.speed = s; }

    scheduleNext(fn) {
        if (this.paused) return;
        this.autoTimer = setTimeout(() => fn(), this.speed);
    }

    processMonth() {
        const month = this.property.get('month');
        if (month > 12) { this.endGame(); return; }

        if (month > 1) {
            this.property.monthlyExpense();
            this.emitEvent(`月初结算：工资 +¥${this.property.get('salary') || 15000}，生活费 -¥5000`, 'money');
        }
        this.property.monthlyRecovery();

        for (const [id, model] of Object.entries(AI_MODELS)) {
            const fk = `model_${id}_unlocked`;
            if (model.unlockMonth <= month && !this.property.getFlag(fk)) {
                this.property.setFlag(fk, true);
                this.emitEvent(`🔓 新模型解锁：${model.name}！`, 'special');
            }
        }

        const totalDays = rng(3, 5);
        this.emitEvent(`—— ${month}月开始 · ${this.getStageName(month)} ——`, 'special');
        this.emitUI();

        const go = this.property.isGameOver();
        if (go) { this.endGame(go); return; }

        this.scheduleNext(() => this.processWorkDay(month, 1, totalDays));
    }

    processWorkDay(month, day, totalDays) {
        if (day > totalDays) { this.nextMonth(month); return; }

        this.property.set('day', day);
        const pool = TASK_COMPLEXITY[month] || TASK_COMPLEXITY[12];
        const stars = pool[rng(0, pool.length - 1)];
        const modelId = this.property.get('current_model');
        const model = AI_MODELS[modelId];
        const quality = this.calcQuality(model, stars);

        if (model) {
            const tc = model.cost[stars - 1] || model.cost[0];
            const ct = this.property.get('token');
            if (ct >= tc) this.property.set('token', ct - tc);
            else { this.emitEvent('Token不足！纯人肉写代码...脑力消耗翻倍', 'bad'); this.property.applyEffect({ brain: -rng(5, 10) }); }
        }

        // 🍀 luck 修正 Bug 率（GAME_DESIGN §2.3）
        const luck = this.property.get('luck') || 50;
        const baseBugRate = model ? model.bugRate : 0.3;
        const hasBug = Math.random() < baseBugRate * (1 - (luck - 50) / 200);
        if (hasBug) {
            const bc = Math.floor(stars * (1 - (model ? model.quality : 40) / 100) * 3);
            this.property.applyEffect({ brain: -bc });
            this.property.set('total_bugs', this.property.get('total_bugs') + 1);
            this.emitEvent(`${month}月${day}日 · ${'⭐'.repeat(stars)} · 出Bug了！脑力-${bc}`, 'bad');
        } else {
            this.emitEvent(`${month}月${day}日 · ${'⭐'.repeat(stars)} · 代码质量 ${quality}`, quality >= 70 ? 'good' : 'neutral');
        }

        this.monthQualities.push(quality);
        this.emitUI();

        const go = this.property.isGameOver();
        if (go) { this.endGame(go); return; }

        this.scheduleNext(() => this.processDayEvent(month, day, totalDays));
    }

    processDayEvent(month, day, totalDays) {
        const state = this.property.toJSON();
        const pool = this.eventMgr.getPool(month, state);

        if (pool.length > 0 && Math.random() < 0.6) {
            const picked = this.eventMgr.pickPrioritized(pool);
            if (picked) {
                const { id, ev } = picked;
                if (ev.type === 'choice' && ev.choices) {
                    const result = this.eventMgr.execute(id, ev, state);
                    addToLegacySet(this.legacy, 'events_seen', id);
                    this.emitEvent(result.text, 'special');
                    this.emitUI();
                    this.showChoice(ev, month, day, totalDays);
                    return;
                }
                const result = this.eventMgr.execute(id, ev, state);
                addToLegacySet(this.legacy, 'events_seen', id);
                this.property.applyEffect(result.effect);
                if (result.setFlag) this.property.setFlag(result.setFlag);
                this.emitEvent(result.text, result.type || 'neutral');
                if (result.postEvent) this.emitEvent(result.postEvent, 'neutral');
                if (['special', 'good'].includes(result.type)) this.timeline.push({ month, day, text: result.text, type: result.type });
                this.emitUI();
                const go = this.property.isGameOver();
                if (go) { this.endGame(go); return; }
            }
        }

        this.scheduleNext(() => this.processWorkDay(month, day + 1, totalDays));
    }

    nextMonth(month) {
        const avgQ = this.monthQualities.length > 0
            ? Math.round(this.monthQualities.reduce((a, b) => a + b, 0) / this.monthQualities.length) : 50;

        let sd = 0;
        if (avgQ >= 90) sd = 2; else if (avgQ >= 70) sd = 1; else if (avgQ >= 50) sd = 0;
        else if (avgQ >= 30) sd = -2; else sd = -5;

        this.property.applyEffect({ bossSatisfy: sd });
        this.property.set('avg_quality', avgQ);

        if (this.property.get('money') <= 0) this.property.set('months_bankrupt', this.property.get('months_bankrupt') + 1);
        else this.property.set('months_bankrupt', 0);

        this.emitEvent(`—— ${month}月结算：平均质量 ${avgQ} · 满意度${sd >= 0 ? '+' : ''}${sd} ——`, 'neutral');
        if (this.onMonthSummary) this.onMonthSummary({ month, avgQuality: avgQ, satisfyDelta: sd, bossSatisfy: this.property.get('bossSatisfy'), money: this.property.get('money'), token: this.property.get('token') });

        this.monthQualities = [];
        this.emitUI();

        const go = this.property.isGameOver();
        if (go) { this.endGame(go); return; }

        this.property.set('month', month + 1);
        this.scheduleNext(() => this.processMonth());
    }

    showChoice(ev, month, day, totalDays) {
        this.paused = true;
        clearTimeout(this.autoTimer);
        this._pcc = { month, day, totalDays };
        if (this.onShowChoice) this.onShowChoice(ev, this.property.toJSON());
    }

    makeChoice(choice) {
        const state = this.property.toJSON();
        const result = this.eventMgr.executeChoice(choice, state);
        this.property.applyEffect(result.effect);
        if (result.flags) for (const [k, v] of Object.entries(result.flags)) this.property.setFlag(k, v);
        if (this.onHideChoice) this.onHideChoice();
        if (result.text) this.emitEvent('→ ' + result.text, 'choice-made');
        const month = this.property.get('month');
        this.timeline.push({ month, text: result.text, type: 'choice-made' });
        this.emitUI();
        this.paused = false;
        const go = this.property.isGameOver();
        if (go) { this.endGame(go); return; }
        const ctx = this._pcc || { month, day: 1, totalDays: 3 };
        this.scheduleNext(() => this.processWorkDay(ctx.month, ctx.day + 1, ctx.totalDays));
    }

    calcQuality(model, stars) {
        const brain = this.property.get('brain');
        const luck = this.property.get('luck') || 50;
        let bq = model ? model.quality : brain * 0.5;
        const bb = (brain - 50) * 0.3;
        const tp = [0, 0, -5, -10, -20][stars] || 0;
        const rr = rng(-8, 8);
        const luckBonus = (luck - 50) * 0.05; // 🍀 luck 微调代码质量（±2.5）
        if (brain < 30) bq -= 20;
        return Math.round(Math.max(0, Math.min(100, bq + bb + tp + rr + luckBonus)));
    }

    endGame(cause) {
        clearTimeout(this.autoTimer);
        this.paused = true;
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

        // === 胜利结局 ===
        if (bossSat >= 80 && avgQ >= 80) return { id: 'ai_master', icon: '🏆', title: 'AI 大师', desc: '康康成为了公司的AI编程专家！大幅加薪！', isWin: true, coins: 150 };
        if (state.gamejam_won) return { id: 'indie_dev', icon: '🎮', title: '独立开发者', desc: 'GameJam获奖让康康走上了独立开发之路！', isWin: true, coins: 120 };
        if (bossSat >= 50) return { id: 'survived', icon: '✅', title: '安稳过关', desc: '平平安安度过了一年，饭碗保住了！', isWin: true, coins: 80 };

        // === 兜底 ===
        return { id: 'rider', icon: '🛵', title: '外卖骑手', desc: '年终考核不达标，康康被优化了...', isWin: false, coins: 30 };
    }

    emitEvent(text, type) {
        if (this.onEvent) this.onEvent(this.property.get('month'), this.property.get('day') || 1, text, type);
    }
    emitUI() {
        const state = this.property.toJSON();
        if (this.onUpdateUI) this.onUpdateUI(state, this.getStageName(state.month || 1));
    }
    backToStart() { this.legacy = loadLegacy(); }
}
