// ===== App.js =====
// v2: IDE-themed UI Controller — handles DOM rendering, event listeners
// This is the ONLY file that touches the DOM

import { GameEngine } from './engine.js';

// ===== Init =====
const game = new GameEngine();

// ===== DOM References =====
const $ = id => document.getElementById(id);

// ===== Code Rain Background =====
function createCodeRain() {
    const c = $('codeRain');
    if (!c) return;
    const chars = '01{}();=>const let var function return if else for while class import export async await yield'.split('');
    for (let i = 0; i < 30; i++) {
        const col = document.createElement('div');
        col.className = 'rain-col';
        col.style.left = (i / 30 * 100) + '%';
        col.style.setProperty('--dur', (8 + Math.random() * 12) + 's');
        col.style.setProperty('--op', (0.3 + Math.random() * 0.7).toString());
        col.style.animationDelay = (-Math.random() * 15) + 's';
        let text = '';
        for (let j = 0; j < 30; j++) {
            text += chars[Math.floor(Math.random() * chars.length)] + ' ';
        }
        col.textContent = text;
        c.appendChild(col);
    }
}

// ===== Screen Management =====
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    $(id).classList.add('active');
}

// ===== Buff Rendering =====
function renderBuffs() {
    const g = $('buffGrid');
    g.innerHTML = '';
    game.buffs.forEach(b => {
        const locked = game.isBuffLocked(b);
        const active = game.isBuffSelected(b.id);
        const d = document.createElement('div');
        d.className = 'buff-card' + (locked ? ' locked' : '') + (active ? ' active' : '');
        d.innerHTML = `
            <div class="bf-icon">${b.icon}</div>
            <div class="bf-name">${b.name}</div>
            <div class="bf-desc">${b.desc}</div>
            ${b.cost > 0
                ? `<div class="bf-cost">🪙${b.cost}</div>`
                : `<div class="bf-cost" style="color:var(--green)">免费</div>`}
        `;
        if (!locked) {
            d.addEventListener('click', () => {
                game.toggleBuff(b.id);
                renderBuffs();
            });
        }
        g.appendChild(d);
    });
}

// ===== Start Screen =====
function initStart() {
    $('legacyCoins').textContent = game.legacy.coins;
    renderBuffs();
    const br = $('bestRecord');
    br.textContent = game.legacy.runs > 0
        ? `已转世${game.legacy.runs}次 · 最远${game.legacy.best_month}月 · 改命成功${game.legacy.wins}次`
        : '第一次入职？帮康康撑过这12个月！';
}

// ===== Month Tab Bar =====
function updateTabs(currentMonth) {
    document.querySelectorAll('.tab-item').forEach(tab => {
        const m = parseInt(tab.dataset.month);
        tab.classList.remove('active', 'completed');
        if (m === currentMonth) tab.classList.add('active');
        else if (m < currentMonth) tab.classList.add('completed');
    });
    const activeTab = document.querySelector('.tab-item.active');
    if (activeTab) activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

// ===== Game UI Update =====
function updateUI(state, stageName) {
    updateStatBar('valHp', 'barHp', state.hp, 100);
    updateStatBar('valBrain', 'barBrain', state.brain, 100);
    updateStatBar('valBoss', 'barBoss', state.bossSatisfy, 100);
    updateStatBar('valShaoye', 'barShaoye', state.shaoye_rel, 100);
    updateStatBar('valYimin', 'barYimin', state.yimin_rel, 100);

    $('valMoney').textContent = '¥' + formatNumber(state.money);
    $('valToken').textContent = state.token + 'M';

    const modelNames = {
        doubao: '🐳 豆包', gpt54: '🤖 GPT-5.4', opus46: '🎯 Opus 4.6',
        deepseek_v4: '🔮 DeepSeek V4', cheapgpt: '💀 CheapGPT', fakeopus: '🎪 FakeOpus'
    };
    $('currentModelDisplay').textContent = modelNames[state.current_model] || '🐳 豆包';
    $('stageDisplay').textContent = stageName;

    updateTabs(state.month);
}

function updateStatBar(valId, barId, value, max) {
    const el = $(valId);
    const oldVal = parseInt(el.textContent) || 0;
    const rounded = Math.round(value);
    el.textContent = rounded;
    $(barId).style.width = Math.max(0, Math.min(100, (value / max) * 100)) + '%';

    if (rounded > oldVal) {
        el.classList.remove('stat-change-down');
        el.classList.add('stat-change-up');
        setTimeout(() => el.classList.remove('stat-change-up'), 500);
    } else if (rounded < oldVal) {
        el.classList.remove('stat-change-up');
        el.classList.add('stat-change-down');
        setTimeout(() => el.classList.remove('stat-change-down'), 500);
    }
}

function formatNumber(n) {
    return Math.floor(n).toLocaleString('zh-CN');
}

// ===== Event Stream =====
let lineNumber = 1;

function addEventLine(month, day, text, type = 'neutral') {
    const s = $('eventStream');
    const d = document.createElement('div');
    d.className = 'ev-line ' + type;
    d.innerHTML = `<span class="ev-prefix">${lineNumber++}</span><span>${text}</span>`;
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
        const lockReason = game.eventMgr.getLockReason(ch);
        const b = document.createElement('button');
        b.className = 'cp-btn' + (locked ? ' locked' : '');
        b.innerHTML = `
            <div>${ch.text}</div>
            ${ch.hint ? `<div class="cpb-hint">${ch.hint}</div>` : ''}
            ${locked ? `<div class="cpb-lock">${lockReason}</div>` : ''}
        `;
        if (!locked) {
            b.addEventListener('click', () => game.makeChoice(ch));
        }
        btns.appendChild(b);
    });

    p.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function hideChoicePanel() {
    $('choicePanel').classList.remove('show');
}

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
        <div class="eg-item"><div class="eg-l">最终存款</div><div class="eg-v" style="color:var(--green)">¥${formatNumber(money)}</div></div>
    `;

    const tl = $('endTimeline');
    if (timeline && timeline.length > 0) {
        tl.innerHTML = '<div class="tl-title">📜 关键事件</div>' +
            timeline.map(e => `
                <div class="tl-item">
                    <span class="tl-month">[${e.month}月]</span> ${e.text}
                </div>
            `).join('');
        tl.style.display = 'block';
    } else {
        tl.style.display = 'none';
    }

    $('endLegacy').textContent = `获得传世金币: +${totalCoins} 🪙`;
    showScreen('endScreen');
}

// ===== Speed Control =====
function setSpeed(s) {
    game.setSpeed(s);
    document.querySelectorAll('.speed-ctrl button').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.speed-ctrl button[data-speed="${s}"]`);
    if (btn) btn.classList.add('active');
}

// ===== Toast =====
function showToast(text) {
    const toast = $('achieveToast');
    $('achieveName').textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

// ===== Wire Up Engine Callbacks =====
game.onEvent = addEventLine;
game.onUpdateUI = updateUI;
game.onShowChoice = showChoicePanel;
game.onHideChoice = hideChoicePanel;
game.onGameEnd = showEndScreen;
game.onMonthSummary = () => {};
game.onError = (msg) => showToast('⚠️ ' + msg);

// ===== Event Listeners =====
document.addEventListener('DOMContentLoaded', async () => {
    createCodeRain();
    await game.init();
    initStart();

    $('startBtn').addEventListener('click', () => {
        if (game.start()) {
            $('eventStream').innerHTML = '';
            lineNumber = 1;
            showScreen('gameScreen');
        }
    });

    $('restartBtn').addEventListener('click', () => {
        game.backToStart();
        showScreen('startScreen');
        initStart();
    });

    $('speedCtrl').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn || !btn.dataset.speed) return;
        setSpeed(Number(btn.dataset.speed));
    });
});
