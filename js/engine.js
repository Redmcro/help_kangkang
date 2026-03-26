// ===== GameEngine =====
// v2: Month-based workplace survival loop + state machine
// Integrates: EventManager, AchievementManager, AudioManager

import { PropertyManager } from './property.js';
import { EventManager } from './events.js';
import { AchievementManager } from './achievement.js';
import { AudioManager } from './audio.js';
import { loadLegacy, saveLegacy, addToLegacySet } from './save.js';

// AI Model definitions
const AI_MODELS = {
    doubao:      { name: '🐳 豆包',       unlockMonth: 1, cost: [5,15,30,80],    quality: 45, bugRate: 0.40 },
    gpt54:       { name: '🤖 GPT-5.4',    unlockMonth: 2, cost: [20,50,150,400],  quality: 80, bugRate: 0.12 },
    opus46:      { name: '🎯 Opus 4.6',   unlockMonth: 3, cost: [35,80,250,600],  quality: 92, bugRate: 0.05 },
    deepseek_v4: { name: '🔮 DeepSeek V4',unlockMonth: 4, cost: [8,25,60,150],    quality: 72, bugRate: 0.18 },
    cheapgpt:    { name: '💀 CheapGPT',    unlockMonth: 3, cost: [3,10,20,50],     quality: 30, bugRate: 0.60 },
    fakeopus:    { name: '🎪 FakeOpus',    unlockMonth: 5, cost: [5,15,35,90],     quality: 35, bugRate: 0.55 }
};

// Task complexity pools by month (star rating 1-4)
const TASK_COMPLEXITY = {
    1:  [1,1,1,1,1,1,2,2,2,2],
    2:  [1,1,1,2,2,2,2,2,3,3], 3:  [1,1,1,2,2,2,2,2,3,3],
    4:  [2,2,2,3,3,3,3,3,4,4], 5:  [2,2,2,3,3,3,3,3,4,4], 6:  [2,2,2,3,3,3,3,3,4,4],
    7:  [2,2,3,3,3,3,4,4,4,4], 8:  [2,2,3,3,3,3,4,4,4,4], 9:  [2,2,3,3,3,3,4,4,4,4],
    10: [3,3,3,3,4,4,4,4,4,4], 11: [3,3,3,3,4,4,4,4,4,4], 12: [3,3,3,3,4,4,4,4,4,4]
};

export class GameEngine {
    constructor() {
        this.property = new PropertyManager();
        this.eventMgr = new EventManager();
        this.achieveMgr = new AchievementManager();
        this.audioMgr = new AudioManager();
        this.legacy = loadLegacy();
        this.stages = [];
        this.buffs = [];
        this.endings = [];
        this.selectedBuffs = new Set();
        this.speed = 800;
        this.autoTimer = null;
        this.paused = false;
        this.timeline = [];
        this.workDaysThisMonth = 0;
        this.totalWorkDays = 0;
        this.monthQualities = [];

        // Callbacks — set by app.js
        this.onEvent = null;         // (month, day, text, type) => void
        this.onUpdateUI = null;      // (state, stageName) => void
        this.onShowChoice = null;    // (ev, state) => void
        this.onHideChoice = null;    // () => void
        this.onMonthSummary = null;  // (summary) => void
        this.onGameEnd = null;       // (endData) => void
        this.onAchievement = null;   // (achievement) => void
        this.onError = null;         // (msg) => void
    }

    async init() {
        try {
            const [stagesResp, buffsResp, endingsResp] = await Promise.all([
                fetch('./data/stages.json'),
                fetch('./data/buffs.json'),
                fetch('./data/endings.json'),
                this.eventMgr.load(),
                this.achieveMgr.load()
            ]);
            if (!stagesResp.ok) throw new Error('Failed to load stages.json');
            if (!buffsResp.ok) throw new Error('Failed to load buffs.json');
            if (!endingsResp.ok) throw new Error('Failed to load endings.json');
            this.stages = await stagesResp.json();
            this.buffs = await buffsResp.json();
            this.endings = await endingsResp.json();

            // Bind achievement manager to legacy
            this.achieveMgr.bind(this.legacy);
            this.achieveMgr.onUnlock((ach) => {
                this.audioMgr.play('achievement');
                if (this.onAchievement) this.onAchievement(ach);
                saveLegacy(this.legacy);
            });
        } catch (e) {
            console.error('Game init failed:', e);
            if (this.onError) this.onError('游戏数据加载失败，请刷新重试');
        }
    }

    /** Initialize audio (call on first user interaction). */
    initAudio() {
        this.audioMgr.init();
    }

    getStageName(month) {
        const stage = this.stages.find(s => s.month === month);
        return stage ? stage.name : '🏢 工作中';
    }

    getAvailableModels() {
        const month = this.property.get('month');
        return Object.entries(AI_MODELS)
            .filter(([, m]) => m.unlockMonth <= month)
            .map(([id, m]) => ({ id, ...m }));
    }

    // ===== Buff Selection =====
    toggleBuff(buffId) {
        if (this.selectedBuffs.has(buffId)) {
            this.selectedBuffs.delete(buffId);
        } else if (this.selectedBuffs.size < 3) {
            this.selectedBuffs.add(buffId);
        }
    }

    isBuffSelected(buffId) { return this.selectedBuffs.has(buffId); }

    isBuffLocked(buff) {
        return buff.cost > this.legacy.coins && !this.selectedBuffs.has(buff.id);
    }

    getBuffCost() {
        let cost = 0;
        this.selectedBuffs.forEach(id => {
            const b = this.buffs.find(x => x.id === id);
            if (b) cost += b.cost;
        });
        return cost;
    }

    // ===== Start Game =====
    start() {
        const cost = this.getBuffCost();
        if (cost > this.legacy.coins && cost > 0) {
            if (this.onError) this.onError('传世金币不足！');
            return false;
        }
        if (cost > 0) {
            this.legacy.coins -= cost;
            saveLegacy(this.legacy);
        }

        clearTimeout(this.autoTimer);
        this.property.reset();
        this.eventMgr.reset();
        this.timeline = [];
        this.paused = false;
        this.workDaysThisMonth = 0;
        this.totalWorkDays = 0;
        this.monthQualities = [];

        // Apply selected buffs
        this.selectedBuffs.forEach(id => {
            const b = this.buffs.find(x => x.id === id);
            if (b) this.property.applyBuff(b.effect);
        });

        // Unlock initial model
        this.property.setFlag('model_doubao_unlocked', true);

        this.audioMgr.startBGM();
        this.emitEvent('康康正式入职了！新的一年，新的挑战...', 'special');
        this.emitUI();
        this.scheduleNext(() => this.processMonth());
        return true;
    }

    setSpeed(s) { this.speed = s; }

    // ===== Scheduling =====
    scheduleNext(fn) {
        if (this.paused) return;
        this.autoTimer = setTimeout(() => fn(), this.speed);
    }

    // ===== Month Start =====
    processMonth() {
        const month = this.property.get('month');
        if (month > 12) {
            this.endGame();
            return;
        }

        // Monthly salary & expenses (skip month 1 — just started)
        if (month > 1) {
            this.property.monthlyExpense();
            this.emitEvent(`月初结算：工资 +¥${this.property.get('salary') || 15000}，生活费 -¥5000`, 'money');
        }

        // Monthly recovery
        this.property.monthlyRecovery();

        // Check model unlocks
        this.checkModelUnlocks(month);

        // Reset work day counter
        this.workDaysThisMonth = 0;
        const totalDays = rng(3, 5);

        this.emitEvent(`—— ${month}月开始 · ${this.getStageName(month)} ——`, 'special');
        this.emitUI();

        // Check game over
        const gameOver = this.property.isGameOver();
        if (gameOver) {
            this.endGame(gameOver);
            return;
        }

        // Start work days
        this.scheduleNext(() => this.processWorkDay(month, 1, totalDays));
    }

    // ===== Work Day =====
    processWorkDay(month, day, totalDays) {
        if (day > totalDays) {
            this.nextMonth(month);
            return;
        }

        this.property.set('day', day);
        this.workDaysThisMonth++;
        this.totalWorkDays++;

        // Pick task complexity
        const complexityPool = TASK_COMPLEXITY[month] || TASK_COMPLEXITY[12];
        const taskStars = complexityPool[rng(0, complexityPool.length - 1)];

        // Code with current model
        const modelId = this.property.get('current_model');
        const model = AI_MODELS[modelId];
        const quality = this.calculateQuality(model, taskStars);

        // Token cost
        if (model) {
            const tokenCost = model.cost[taskStars - 1] || model.cost[0];
            const currentToken = this.property.get('token');
            if (currentToken >= tokenCost) {
                this.property.set('token', currentToken - tokenCost);
            } else {
                this.emitEvent(`Token不足！只能纯人肉写代码...脑力消耗翻倍`, 'bad');
                this.property.applyEffect({ brain: -rng(5, 10) });
            }
        }

        // Bug check
        const bugRate = model ? model.bugRate : 0.3;
        const hasBug = Math.random() < bugRate;
        if (hasBug) {
            const bugSeverity = taskStars * (1 - (model ? model.quality : 40) / 100);
            const brainCost = Math.floor(bugSeverity * 3);
            this.property.applyEffect({ brain: -brainCost });
            this.property.set('total_bugs', this.property.get('total_bugs') + 1);
            this.emitEvent(`${month}月${day}日 · ${'⭐'.repeat(taskStars)} · 出Bug了！修复中... 脑力-${brainCost}`, 'bad');
        } else {
            this.emitEvent(`${month}月${day}日 · ${'⭐'.repeat(taskStars)} · 代码质量 ${quality}`, quality >= 70 ? 'good' : 'neutral');
        }

        this.monthQualities.push(quality);
        this.emitUI();

        // Check game over
        const gameOver = this.property.isGameOver();
        if (gameOver) {
            this.endGame(gameOver);
            return;
        }

        // Try to trigger a random event for this day
        this.scheduleNext(() => this.processDayEvent(month, day, totalDays));
    }

    // ===== Day Event =====
    processDayEvent(month, day, totalDays) {
        const state = this.property.toJSON();
        const pool = this.eventMgr.getPool(month, state);

        if (pool.length > 0 && Math.random() < 0.6) {
            const picked = this.eventMgr.pickPrioritized(pool);
            if (picked) {
                const { id, ev } = picked;

                // Choice event = pause
                if (ev.type === 'choice' && ev.choices) {
                    const result = this.eventMgr.execute(id, ev, state, this.legacy);
                    this.audioMgr.play('choice');
                    this.emitEvent(result.text, 'special');
                    this.emitUI();
                    this.showChoice(ev, month, day, totalDays);
                    return;
                }

                // Normal event
                const result = this.eventMgr.execute(id, ev, state, this.legacy);
                this.property.applyEffect(result.effect);
                if (result.setFlag) this.property.setFlag(result.setFlag);

                // Play sound for event type
                if (result.type === 'good' || result.type === 'special') this.audioMgr.play(result.type);
                else if (result.type === 'bad') this.audioMgr.play('bad');

                this.emitEvent(result.text, result.type || 'neutral');
                if (result.postEvent) this.emitEvent(result.postEvent, 'neutral');

                if (['special', 'good'].includes(result.type)) {
                    this.timeline.push({ month, day, text: result.text, type: result.type });
                }

                this.emitUI();

                const gameOver = this.property.isGameOver();
                if (gameOver) {
                    this.endGame(gameOver);
                    return;
                }
            }
        }

        // Next work day
        this.scheduleNext(() => this.processWorkDay(month, day + 1, totalDays));
    }

    // ===== Month End =====
    nextMonth(month) {
        const avgQ = this.monthQualities.length > 0
            ? Math.round(this.monthQualities.reduce((a, b) => a + b, 0) / this.monthQualities.length)
            : 50;

        // Boss satisfaction change based on quality
        let satisfyDelta = 0;
        if (avgQ >= 90) satisfyDelta = 2;
        else if (avgQ >= 70) satisfyDelta = 1;
        else if (avgQ >= 50) satisfyDelta = 0;
        else if (avgQ >= 30) satisfyDelta = -2;
        else satisfyDelta = -5;

        this.property.applyEffect({ bossSatisfy: satisfyDelta });
        this.property.set('avg_quality', avgQ);

        // Bankrupt tracking
        if (this.property.get('money') <= 0) {
            this.property.set('months_bankrupt', this.property.get('months_bankrupt') + 1);
        } else {
            this.property.set('months_bankrupt', 0);
        }

        this.emitEvent(`—— ${month}月结算：平均质量 ${avgQ} · 满意度${satisfyDelta >= 0 ? '+' : ''}${satisfyDelta} ——`, 'neutral');

        if (this.onMonthSummary) {
            this.onMonthSummary({
                month, avgQuality: avgQ, satisfyDelta,
                bossSatisfy: this.property.get('bossSatisfy'),
                money: this.property.get('money'),
                token: this.property.get('token')
            });
        }

        this.monthQualities = [];
        this.emitUI();

        // Check game over
        const gameOver = this.property.isGameOver();
        if (gameOver) {
            this.endGame(gameOver);
            return;
        }

        // Achievement check at month end
        this.achieveMgr.check();
        saveLegacy(this.legacy);

        this.audioMgr.play('month_end');

        // Advance
        this.property.set('month', month + 1);
        this.property.set('consecutive_overtime', 0);
        this.scheduleNext(() => this.processMonth());
    }

    // ===== Choice Events =====
    showChoice(ev, month, day, totalDays) {
        this.paused = true;
        clearTimeout(this.autoTimer);
        this._pendingChoiceContext = { month, day, totalDays };
        if (this.onShowChoice) {
            this.onShowChoice(ev, this.property.toJSON());
        }
    }

    makeChoice(choice) {
        const state = this.property.toJSON();
        const result = this.eventMgr.executeChoice(choice, state);

        this.property.applyEffect(result.effect);
        if (result.flags) {
            for (const [key, val] of Object.entries(result.flags)) {
                this.property.setFlag(key, val);
            }
        }

        if (this.onHideChoice) this.onHideChoice();
        if (result.text) {
            this.emitEvent('→ ' + result.text, 'choice-made');
        }

        const month = this.property.get('month');
        this.timeline.push({ month, text: result.text, type: 'choice-made' });
        this.emitUI();
        this.paused = false;

        const gameOver = this.property.isGameOver();
        if (gameOver) {
            this.endGame(gameOver);
            return;
        }

        const ctx = this._pendingChoiceContext || { month, day: 1, totalDays: 3 };
        this.scheduleNext(() => this.processWorkDay(ctx.month, ctx.day + 1, ctx.totalDays));
    }

    // ===== Model Unlocks =====
    checkModelUnlocks(month) {
        for (const [id, model] of Object.entries(AI_MODELS)) {
            const flagKey = `model_${id}_unlocked`;
            if (model.unlockMonth <= month && !this.property.getFlag(flagKey)) {
                this.property.setFlag(flagKey, true);
                this.emitEvent(`🔓 新模型解锁：${model.name}！`, 'special');
            }
        }
    }

    // ===== Code Quality Calculation =====
    calculateQuality(model, taskStars) {
        const brain = this.property.get('brain');
        let baseQuality = model ? model.quality : brain * 0.5;
        const brainBonus = (brain - 50) * 0.3;
        const taskPenalty = [0, 0, -5, -10, -20][taskStars] || 0;
        const randomRoll = rng(-8, 8);

        if (brain < 30) baseQuality -= 20;

        return Math.round(Math.max(0, Math.min(100, baseQuality + brainBonus + taskPenalty + randomRoll)));
    }

    // ===== End Game =====
    endGame(cause) {
        clearTimeout(this.autoTimer);
        this.paused = true;
        this.audioMgr.stopBGM();

        const state = this.property.toJSON();
        const month = state.month > 12 ? 12 : state.month;
        const avgQ = state.avg_quality || 0;
        const bossSat = state.bossSatisfy || 0;

        const ending = this.determineEnding(state, cause);

        // Calculate legacy coins
        const base = month * 10;
        const qualityBonus = Math.floor(avgQ / 10);
        const satisfyBonus = Math.floor(bossSat / 5);
        const endingBonus = ending.coins || 0;
        const totalCoins = base + qualityBonus + satisfyBonus + endingBonus;

        // Update legacy
        this.legacy.coins += totalCoins;
        this.legacy.runs++;
        if (month > this.legacy.best_month) this.legacy.best_month = month;
        if (ending.isWin) this.legacy.wins++;
        addToLegacySet(this.legacy, 'endings_unlocked', ending.id);
        this.legacy.total_money_earned = (this.legacy.total_money_earned || 0) + Math.max(0, Math.floor(state.money || 0));
        this.legacy.total_bugs_fixed = (this.legacy.total_bugs_fixed || 0) + (state.total_bugs || 0);
        saveLegacy(this.legacy);

        // Play end sound
        this.audioMgr.play(ending.isWin ? 'win' : 'lose');

        // Achievement check
        this.achieveMgr.check();
        saveLegacy(this.legacy);

        if (this.onGameEnd) {
            this.onGameEnd({
                ending, month, avgQuality: avgQ, bossSatisfy: bossSat,
                money: state.money, totalCoins,
                timeline: this.timeline.slice(-10)
            });
        }
    }

    determineEnding(state, cause) {
        const avgQ = state.avg_quality || 0;
        const bossSat = state.bossSatisfy || 0;

        // Hidden endings
        if (state.brain < 10 && cause !== 'breakdown') {
            return { id: 'ai_shape', icon: '🤖', title: '成为AI的形状', desc: '脑力几乎为零，康康已经和AI融为一体了...', isWin: false, coins: 50 };
        }

        // Failure endings
        if (cause === 'death') {
            return { id: 'death', icon: '💀', title: '过劳猝死', desc: '康康再也没有醒来...', isWin: false, coins: 20 };
        }
        if (cause === 'breakdown') {
            return { id: 'breakdown', icon: '😵', title: '精神崩溃', desc: '康康的大脑已经无法正常运转了...', isWin: false, coins: 20 };
        }
        if (cause === 'fired') {
            return { id: 'rider', icon: '🛵', title: '外卖骑手', desc: '老板满意度过低，康康被裁了...从此开始了外卖生涯', isWin: false, coins: 30 };
        }
        if (cause === 'bankrupt') {
            return { id: 'bankrupt', icon: '💸', title: '破产回家', desc: '连续三个月入不敷出，康康只能回老家了...', isWin: false, coins: 10 };
        }

        // Victory endings
        if (bossSat >= 80 && avgQ >= 80) {
            return { id: 'ai_master', icon: '🏆', title: 'AI 大师', desc: '康康成为了公司的AI编程专家！大幅加薪！', isWin: true, coins: 150 };
        }
        if (state.gamejam_won) {
            return { id: 'indie_dev', icon: '🎮', title: '独立开发者', desc: 'GameJam获奖让康康走上了独立开发之路！', isWin: true, coins: 120 };
        }
        if (bossSat >= 50) {
            return { id: 'survived', icon: '✅', title: '安稳过关', desc: '平平安安度过了一年，饭碗保住了！', isWin: true, coins: 80 };
        }

        return { id: 'rider', icon: '🛵', title: '外卖骑手', desc: '年终考核不达标，康康被优化了...', isWin: false, coins: 30 };
    }

    // ===== Helpers =====
    emitEvent(text, type) {
        const month = this.property.get('month');
        const day = this.property.get('day') || 1;
        if (this.onEvent) this.onEvent(month, day, text, type);
    }

    emitUI() {
        const state = this.property.toJSON();
        const month = state.month || 1;
        if (this.onUpdateUI) this.onUpdateUI(state, this.getStageName(month));
    }

    backToStart() {
        this.legacy = loadLegacy();
        this.achieveMgr.bind(this.legacy);
    }

    // ===== Collection Getters (for UI) =====

    getEndingsData() {
        return {
            definitions: this.endings,
            unlocked: new Set(this.legacy.endings_unlocked || [])
        };
    }

    getEventsData() {
        return {
            all: this.eventMgr.getAllEvents(),
            seen: new Set(this.legacy.events_seen || [])
        };
    }

    getAchievementsData() {
        return {
            all: this.achieveMgr.getAll(),
            unlocked: this.achieveMgr.getUnlockedIds(),
            progress: this.achieveMgr.getProgress()
        };
    }
}

function rng(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}
