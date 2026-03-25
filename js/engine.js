// ===== GameEngine =====
// Core game loop: processes ages, selects events, handles auto-play

import { PropertyManager } from './property.js';
import { EventManager } from './events.js';
import { loadLegacy, saveLegacy } from './save.js';

export class GameEngine {
    constructor() {
        this.property = new PropertyManager();
        this.eventMgr = new EventManager();
        this.legacy = loadLegacy();
        this.stages = [];
        this.buffs = [];
        this.selectedBuffs = new Set(['school']);
        this.speed = 800;
        this.autoTimer = null;
        this.paused = false;
        this.timeline = [];

        // Callbacks — set by app.js
        this.onEvent = null;        // (text, type) => void
        this.onUpdateUI = null;     // (state) => void
        this.onShowChoice = null;   // (ev, state) => void
        this.onHideChoice = null;   // () => void
        this.onGameEnd = null;      // (endData) => void
        this.onAchievement = null;  // (text) => void
        this.onError = null;        // (msg) => void
    }

    async init() {
        const [stagesResp, buffsResp] = await Promise.all([
            fetch('./data/stages.json'),
            fetch('./data/buffs.json'),
            this.eventMgr.load()
        ]);
        this.stages = await stagesResp.json();
        this.buffs = await buffsResp.json();
    }

    getStage(age) {
        const stage = this.stages.find(s => age <= s.max);
        return stage ? stage.name : this.stages[this.stages.length - 1].name;
    }

    // Toggle buff selection
    toggleBuff(buffId) {
        if (this.selectedBuffs.has(buffId)) {
            this.selectedBuffs.delete(buffId);
        } else {
            this.selectedBuffs.add(buffId);
        }
    }

    isBuffSelected(buffId) {
        return this.selectedBuffs.has(buffId);
    }

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

    // Start a new game
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

        this.property.reset();
        this.eventMgr.reset();
        this.timeline = [];
        this.paused = false;

        // Apply selected buffs
        this.selectedBuffs.forEach(id => {
            const b = this.buffs.find(x => x.id === id);
            if (b) this.property.applyBuff(b.effect);
        });

        this.emitEvent('康康的人生开始了...', 'special');
        this.emitUI();
        this.scheduleNext();
        return true;
    }

    setSpeed(s) {
        this.speed = s;
    }

    // Auto-play loop
    scheduleNext() {
        if (!this.property.get('alive')) return;
        this.autoTimer = setTimeout(() => this.processAge(), this.speed);
    }

    processAge() {
        if (!this.property.get('alive')) return;
        const state = this.property.toJSON();
        const age = state.age;

        // Age decay
        this.property.ageDecay();

        // Passive income
        this.property.earnPassiveIncome();

        // Death check
        if (this.property.isDead()) {
            this.endGame(pick(['体力不支', '在睡梦中安详离去', '心脏骤停']));
            return;
        }
        if (this.property.isMaxAge()) {
            this.endGame(null, true);
            return;
        }

        // Get event pool
        const pool = this.eventMgr.getPool(age, this.property.toJSON());
        if (!pool.length) {
            this.emitEvent('平平淡淡的一年。', 'neutral');
            this.emitUI();
            this.property.set('age', age + 1);
            this.scheduleNext();
            return;
        }

        // Pick event (prioritized)
        const picked = this.eventMgr.pickPrioritized(pool);
        if (!picked) {
            this.property.set('age', age + 1);
            this.scheduleNext();
            return;
        }

        const { id, ev } = picked;

        // Choice event = pause for user input
        if (ev.type === 'choice' && ev.choices) {
            const result = this.eventMgr.execute(id, ev, this.property.toJSON());
            this.emitEvent(result.text, 'special');
            this.emitUI();
            this.showChoice(ev);
            return;
        }

        // Normal event = execute and continue
        const result = this.eventMgr.execute(id, ev, this.property.toJSON());
        this.property.applyEffect(result.effect);

        this.emitEvent(result.text, result.type || 'neutral');
        if (result.postEvent) {
            this.emitEvent(result.postEvent, 'neutral');
        }

        // Timeline tracking
        if (['special', 'good'].includes(result.type)) {
            this.timeline.push({ age, text: result.text, type: result.type });
        }

        this.emitUI();

        // Post-effect death check
        if (this.property.isDead()) {
            this.endGame('身体扛不住了');
            return;
        }

        this.property.set('age', age + 1);
        this.scheduleNext();
    }

    // Show choice panel
    showChoice(ev) {
        this.paused = true;
        clearTimeout(this.autoTimer);
        if (this.onShowChoice) {
            this.onShowChoice(ev, this.property.toJSON());
        }
    }

    // User made a choice
    makeChoice(choice) {
        const state = this.property.toJSON();
        const result = this.eventMgr.executeChoice(choice, state);

        // Apply effect
        this.property.applyEffect(result.effect);

        // Apply flags (like aiSurvived, job changes)
        if (result.flags) {
            for (const [key, val] of Object.entries(result.flags)) {
                this.property.set(key, val);
            }
        }

        if (this.onHideChoice) this.onHideChoice();
        if (result.text) {
            this.emitEvent('→ ' + result.text, 'choice-made');
        }

        // Timeline
        this.timeline.push({
            age: this.property.get('age'),
            text: result.text,
            type: 'choice-made'
        });

        this.emitUI();
        this.paused = false;

        // Post-choice death check
        if (this.property.isDead()) {
            this.endGame('身体扛不住了');
            return;
        }

        this.property.set('age', this.property.get('age') + 1);
        this.scheduleNext();
    }

    // End the game
    endGame(cause, isWin = false) {
        this.property.set('alive', false);
        clearTimeout(this.autoTimer);

        const state = this.property.toJSON();
        const isRider = state.job === '外卖骑手';
        const earned = Math.floor(state.earned / (isWin ? 80 : 100));

        // Update legacy
        this.legacy.coins += earned;
        this.legacy.runs++;
        if (state.age > this.legacy.best) this.legacy.best = state.age;
        if (isWin) this.legacy.wins++;
        saveLegacy(this.legacy);

        if (this.onGameEnd) {
            this.onGameEnd({
                isWin, isRider, cause, earned,
                age: state.age, job: state.job,
                totalEarned: Math.floor(state.earned),
                aiSurvived: state.aiSurvived,
                timeline: this.timeline.slice(-8)
            });
        }
    }

    // Helpers
    emitEvent(text, type) {
        if (this.onEvent) this.onEvent(this.property.get('age'), text, type);
    }

    emitUI() {
        if (this.onUpdateUI) this.onUpdateUI(this.property.toJSON(), this.getStage(this.property.get('age')));
    }

    backToStart() {
        this.legacy = loadLegacy();
    }
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
