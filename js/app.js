// ===== App.js =====
// v2: IDE-themed UI Controller. Only file that touches the DOM.
// Module 5: Token Shop, Model Switch, Side Gig interaction panels.

import { GameEngine } from './engine.js';

const game = new GameEngine();
const $ = id => document.getElementById(id);

// ===== Module 5: Constants =====
const TOKEN_PACKAGES = [
    { icon: '🟢', name: '入门包', price: 500, amount: 200 },
    { icon: '🔵', name: '标准包', price: 2000, amount: 1000 },
    { icon: '🟣', name: '豪华包', price: 5000, amount: 3000 },
    { icon: '🔴', name: '至尊包', price: 10000, amount: 8000 },
];

// Mirror of AI_MODELS from engine.js (read-only, for UI display only)
const AI_MODELS_UI = {
    doubao:      { name: '🐳 豆包',       cost: '5~80M',   quality: 45, bugRate: '40%' },
    gpt54:       { name: '🤖 GPT-5.4',    cost: '20~400M', quality: 80, bugRate: '12%' },
    opus46:      { name: '🎯 Opus 4.6',   cost: '35~600M', quality: 92, bugRate: '5%'  },
    deepseek_v4: { name: '🔮 DeepSeek V4',cost: '8~150M',  quality: 72, bugRate: '18%' },
    cheapgpt:    { name: '💀 CheapGPT',   cost: '3~50M',   quality: 30, bugRate: '60%' },
    fakeopus:    { name: '🎪 FakeOpus',   cost: '5~90M',   quality: 35, bugRate: '55%' },
};

let gigUsedThisMonth = false;
let currentGigMonth = 0;

// ===== Code Rain =====

function createCodeRain() {
    const c = $('codeRain');
    if (!c) return;
    const chars = '01 {} () => const let var function return if else for while class import export async await'.split(' ');
    for (let i = 0; i < 25; i++) {
        const col = document.createElement('div');
        col.className = 'rain-col';
        col.style.left = (i / 25 * 100) + '%';
        col.style.setProperty('--dur', (8 + Math.random() * 12) + 's');
        col.style.setProperty('--op', (0.3 + Math.random() * 0.7).toString());
        col.style.animationDelay = (-Math.random() * 15) + 's';
        let text = '';
        for (let j = 0; j < 25; j++) text += chars[Math.floor(Math.random() * chars.length)] + '\n';
        col.textContent = text;
        c.appendChild(col);
    }
}

// ===== Screen Management =====

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
}

// ===== Start Screen =====

function renderBuffs() {
    const g = $('buffGrid');
    g.innerHTML = '';
    game.buffs.forEach(b => {
        const locked = game.isBuffLocked(b);
        const active = game.isBuffSelected(b.id);
        const d = document.createElement('div');
        d.className = 'buff-card' + (locked ? ' locked' : '') + (active ? ' active' : '');
        d.innerHTML = `<div class="bf-icon">${b.icon}</div><div class="bf-name">${b.name}</div><div class="bf-desc">${b.desc}</div>${b.cost > 0 ? `<div class="bf-cost">🪙${b.cost}</div>` : `<div class="bf-cost" style="color:var(--green)">免费</div>`}`;
        if (!locked) d.addEventListener('click', () => { game.toggleBuff(b.id); renderBuffs(); });
        g.appendChild(d);
    });
}

function initStart() {
    $('legacyCoins').textContent = game.legacy.coins;
    renderBuffs();
    $('bestRecord').textContent = game.legacy.runs > 0
        ? `已转世${game.legacy.runs}次 · 最远${game.legacy.best_month}月 · 改命成功${game.legacy.wins}次`
        : '第一次入职？帮康康撑过这12个月！';
}

// ===== Game UI =====

function updateTabs(currentMonth) {
    document.querySelectorAll('.tab-item').forEach(tab => {
        const m = parseInt(tab.dataset.month);
        tab.classList.remove('active', 'completed');
        if (m === currentMonth) tab.classList.add('active');
        else if (m < currentMonth) tab.classList.add('completed');
    });
    const at = document.querySelector('.tab-item.active');
    if (at) at.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

function updateUI(state, stageName) {
    updateBar('valHp', 'barHp', state.hp, 100);
    updateBar('valBrain', 'barBrain', state.brain, 100);
    updateBar('valBoss', 'barBoss', state.bossSatisfy, 100);
    updateBar('valShaoye', 'barShaoye', state.shaoye_rel, 100);
    updateBar('valYimin', 'barYimin', state.yimin_rel, 100);
    $('valMoney').textContent = '¥' + Math.floor(state.money).toLocaleString('zh-CN');
    $('valToken').textContent = state.token + 'M';
    const mn = { doubao: '🐳 豆包', gpt54: '🤖 GPT-5.4', opus46: '🎯 Opus 4.6', deepseek_v4: '🔮 DeepSeek V4', cheapgpt: '💀 CheapGPT', fakeopus: '🎪 FakeOpus' };
    $('currentModelDisplay').textContent = mn[state.current_model] || '🐳 豆包';
    $('stageDisplay').textContent = stageName;
    updateTabs(state.month);

    // Module 5: Reset gig cooldown when month changes
    if (state.month !== currentGigMonth) {
        currentGigMonth = state.month;
        gigUsedThisMonth = false;
    }
}

function updateBar(valId, barId, value, max) {
    const el = $(valId);
    const old = parseInt(el.textContent) || 0;
    const v = Math.round(value);
    el.textContent = v;
    $(barId).style.width = Math.max(0, Math.min(100, (value / max) * 100)) + '%';
    if (v > old) { el.classList.remove('stat-change-down'); el.classList.add('stat-change-up'); setTimeout(() => el.classList.remove('stat-change-up'), 500); }
    else if (v < old) { el.classList.remove('stat-change-up'); el.classList.add('stat-change-down'); setTimeout(() => el.classList.remove('stat-change-down'), 500); }
}

// ===== Event Stream =====

let lineNum = 1;
function addEventLine(month, day, text, type) {
    const s = $('eventStream');
    const d = document.createElement('div');
    d.className = 'ev-line ' + (type || 'neutral');
    d.innerHTML = `<span class="ev-prefix">${lineNum++}</span><span>${text}</span>`;
    s.appendChild(d);
    while (s.children.length > 150) s.removeChild(s.firstChild);
    s.scrollTop = s.scrollHeight;
}

// ===== Choice Panel =====

function showChoicePanel(ev, state) {
    const p = $('choicePanel');
    p.classList.add('show');
    $('cpTitle').textContent = ev.title || '做出选择';
    $('cpDesc').textContent = ev.desc || '';
    const btns = $('cpBtns');
    btns.innerHTML = '';
    ev.choices.forEach(ch => {
        const locked = game.eventMgr.isChoiceLocked(ch, state);
        const lr = game.eventMgr.getLockReason(ch);
        const b = document.createElement('button');
        b.className = 'cp-btn' + (locked ? ' locked' : '');
        b.innerHTML = `<div>${ch.text}</div>${ch.hint ? `<div class="cpb-hint">${ch.hint}</div>` : ''}${locked ? `<div class="cpb-lock">${lr}</div>` : ''}`;
        if (!locked) b.addEventListener('click', () => game.makeChoice(ch));
        btns.appendChild(b);
    });
    p.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideChoicePanel() { $('choicePanel').classList.remove('show'); }

// ===== End Screen =====

function showEndScreen(data) {
    const { ending, month, avgQuality, bossSatisfy, money, totalCoins, timeline } = data;
    $('endIcon').textContent = ending.icon;
    const t = $('endTitle');
    t.textContent = ending.title;
    t.className = ending.isWin ? 'win' : 'lose';
    $('endDesc').innerHTML = ending.desc;
    $('endGrid').innerHTML = `
        <div class="eg-item"><div class="eg-l">存活月份</div><div class="eg-v">${month}/12</div></div>
        <div class="eg-item"><div class="eg-l">代码质量</div><div class="eg-v">${avgQuality}</div></div>
        <div class="eg-item"><div class="eg-l">老板满意度</div><div class="eg-v">${bossSatisfy}</div></div>
        <div class="eg-item"><div class="eg-l">最终存款</div><div class="eg-v" style="color:var(--green)">¥${Math.floor(money).toLocaleString('zh-CN')}</div></div>`;
    const tl = $('endTimeline');
    if (timeline && timeline.length > 0) {
        tl.innerHTML = '<div class="tl-title">📜 关键事件</div>' + timeline.map(e => `<div class="tl-item"><span class="tl-month">[${e.month}月]</span> ${e.text}</div>`).join('');
        tl.style.display = 'block';
    } else tl.style.display = 'none';
    $('endLegacy').textContent = `获得传世金币: +${totalCoins} 🪙`;
    $('gameActions').style.display = 'none';
    showScreen('endScreen');
}

// ===== Speed & Toast =====

function setSpeed(s) {
    game.setSpeed(s);
    document.querySelectorAll('.speed-ctrl button').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.speed-ctrl button[data-speed="${s}"]`);
    if (btn) btn.classList.add('active');
}

function showToast(text) {
    const toast = $('achieveToast');
    $('achieveName').textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== Module 5: Overlay Helpers =====

let wasGamePaused = false;

function openOverlay(overlayId) {
    wasGamePaused = game.paused;
    game.paused = true;
    clearTimeout(game.autoTimer);
    $(overlayId).classList.add('show');
}

function closeOverlay(overlayId) {
    $(overlayId).classList.remove('show');
    if (!wasGamePaused) {
        game.paused = false;
        game.emitUI();
    }
}

// ===== Module 5: Token Shop =====

function renderTokenShop() {
    const state = game.property.toJSON();
    const money = state.money;
    const token = state.token;

    $('shopBalance').innerHTML = `
        💰 余额: <span class="sb-money">¥${Math.floor(money).toLocaleString('zh-CN')}</span>
        · 🪙 Token: <span class="sb-token">${token}M</span>`;

    const grid = $('tokenGrid');
    grid.innerHTML = '';
    TOKEN_PACKAGES.forEach(pkg => {
        const canBuy = money >= pkg.price;
        const card = document.createElement('div');
        card.className = 'token-card';
        card.innerHTML = `
            <div class="tc-icon">${pkg.icon}</div>
            <div class="tc-name">${pkg.name}</div>
            <div class="tc-amount">${pkg.amount >= 1000 ? (pkg.amount / 1000) + 'B' : pkg.amount + 'M'}</div>
            <div class="tc-price">¥${pkg.price.toLocaleString('zh-CN')}</div>
            <button class="tc-buy" ${canBuy ? '' : 'disabled'}>${canBuy ? '购买' : '余额不足'}</button>`;
        if (canBuy) {
            card.querySelector('.tc-buy').addEventListener('click', () => {
                game.property.applyEffect({ money: -pkg.price });
                game.property.set('token', game.property.get('token') + pkg.amount);
                game.emitUI();
                addEventLine(state.month, state.day || 1, `🪙 购买了${pkg.name}！Token +${pkg.amount}M，花费 ¥${pkg.price.toLocaleString('zh-CN')}`, 'money');
                showToast(`🪙 ${pkg.name} 到账！+${pkg.amount}M`);
                renderTokenShop(); // Refresh balance & button states
            });
        }
        grid.appendChild(card);
    });
}

// ===== Module 5: Model Switch =====

function renderModelSwitch() {
    const state = game.property.toJSON();
    const currentModel = state.current_model;
    const list = $('modelList');
    list.innerHTML = '';

    for (const [id, m] of Object.entries(AI_MODELS_UI)) {
        const flagKey = `model_${id}_unlocked`;
        const unlocked = !!state[flagKey];
        const isCurrent = currentModel === id;

        const item = document.createElement('div');
        item.className = 'model-item' + (isCurrent ? ' active' : '') + (!unlocked ? ' locked' : '');
        item.innerHTML = `
            <div class="mi-icon">${m.name.split(' ')[0]}</div>
            <div class="mi-info">
                <div class="mi-name">${m.name}</div>
                <div class="mi-stats">质量:${m.quality} · Bug:${m.bugRate} · Token:${m.cost}</div>
            </div>
            ${isCurrent ? '<span class="mi-badge current">当前</span>' : ''}
            ${!unlocked ? '<span class="mi-badge" style="color:var(--text3);border:1px solid var(--border)">🔒 未解锁</span>' : ''}`;

        if (unlocked && !isCurrent) {
            item.addEventListener('click', () => {
                game.property.set('current_model', id);
                game.emitUI();
                addEventLine(state.month, state.day || 1, `🤖 切换模型：${m.name}`, 'special');
                showToast(`已切换到 ${m.name}`);
                renderModelSwitch(); // Refresh active state
            });
        }
        list.appendChild(item);
    }
}

// ===== Module 5: Side Gig =====

function rng(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }

function renderSideGig() {
    const state = game.property.toJSON();
    const charm = state.charm || 50;
    const baseIncome = rng(1000, 5000);
    const charmMod = 1 + (charm - 50) / 100;
    const income = Math.round(baseIncome * charmMod);
    const discoverChance = 30;

    const panel = $('gigPanel');

    if (gigUsedThisMonth) {
        panel.innerHTML = `
            <div class="gig-desc">🚫 本月已经接过私活了，下个月再来吧。</div>
            <div class="gig-cooldown">每月只能接一次私活</div>
            <div class="gig-actions" style="margin-top:12px">
                <button class="gig-btn cancel" id="gigCancelBtn">关闭</button>
            </div>`;
        $('gigCancelBtn').addEventListener('click', () => closeOverlay('sideGigOverlay'));
        return;
    }

    panel.innerHTML = `
        <div class="gig-desc">
            有个朋友介绍了一个外包项目，加班偷偷做可以赚点外快。<br>
            但如果被老板发现就麻烦了……
        </div>
        <div class="gig-stats">
            <span class="gs-good">💰 预计收入: ¥${income.toLocaleString('zh-CN')}</span>
            <span class="gs-bad">⚠️ 发现概率: ${discoverChance}%</span>
        </div>
        <div class="gig-actions">
            <button class="gig-btn confirm" id="gigConfirmBtn">接活！</button>
            <button class="gig-btn cancel" id="gigCancelBtn">算了</button>
        </div>`;

    $('gigConfirmBtn').addEventListener('click', () => {
        gigUsedThisMonth = true;
        const discovered = Math.random() < (discoverChance / 100);

        game.property.applyEffect({ money: income });

        if (discovered) {
            game.property.applyEffect({ bossSatisfy: -5 });
            addEventLine(state.month, state.day || 1, `💼 接私活赚了 ¥${income.toLocaleString('zh-CN')}，但被老板发现了！满意度 -5`, 'bad');
            showToast('⚠️ 接私活被老板发现了！');
        } else {
            addEventLine(state.month, state.day || 1, `💼 偷偷接了个私活，赚了 ¥${income.toLocaleString('zh-CN')}！`, 'good');
            showToast(`💰 私活到账！+¥${income.toLocaleString('zh-CN')}`);
        }

        game.emitUI();
        closeOverlay('sideGigOverlay');
    });

    $('gigCancelBtn').addEventListener('click', () => closeOverlay('sideGigOverlay'));
}

// ===== Callbacks =====

game.onEvent = addEventLine;
game.onUpdateUI = updateUI;
game.onShowChoice = showChoicePanel;
game.onHideChoice = hideChoicePanel;
game.onGameEnd = showEndScreen;
game.onMonthSummary = () => {};
game.onError = (msg) => showToast('⚠️ ' + msg);

// ===== Init =====

document.addEventListener('DOMContentLoaded', async () => {
    createCodeRain();
    await game.init();
    initStart();

    // Game start
    $('startBtn').addEventListener('click', () => {
        if (game.start()) {
            $('eventStream').innerHTML = '';
            lineNum = 1;
            gigUsedThisMonth = false;
            currentGigMonth = 0;
            $('gameActions').style.display = 'flex';
            showScreen('gameScreen');
        }
    });

    // Restart → back to start screen
    $('restartBtn').addEventListener('click', () => {
        game.backToStart();
        $('gameActions').style.display = 'none';
        showScreen('startScreen');
        initStart();
    });

    // Speed controls
    $('speedCtrl').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn && btn.dataset.speed) setSpeed(Number(btn.dataset.speed));
    });

    // ===== Module 5: Button bindings =====
    $('buyTokenBtn').addEventListener('click', () => {
        renderTokenShop();
        openOverlay('tokenShopOverlay');
    });

    $('switchModelBtn').addEventListener('click', () => {
        renderModelSwitch();
        openOverlay('modelSwitchOverlay');
    });

    $('sideGigBtn').addEventListener('click', () => {
        renderSideGig();
        openOverlay('sideGigOverlay');
    });

    // ===== Overlay close handlers (all overlays including Module 5) =====
    document.querySelectorAll('.overlay-close[data-close]').forEach(btn => {
        btn.addEventListener('click', () => closeOverlay(btn.dataset.close));
    });

    // Close overlay on background click
    document.querySelectorAll('.overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeOverlay(overlay.id);
        });
    });
});
