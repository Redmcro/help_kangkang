// ===== App.js =====
// UI Controller — handles DOM rendering, event listeners, visual effects
// This is the ONLY file that touches the DOM

import { GameEngine } from './engine.js';

// ===== Init =====
const game = new GameEngine();

// ===== DOM References =====
const $ = id => document.getElementById(id);

// ===== Stars Background =====
function createStars() {
    const c = $('stars');
    for (let i = 0; i < 60; i++) {
        const s = document.createElement('div');
        s.className = 'star';
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 100 + '%';
        s.style.setProperty('--d', (2 + Math.random() * 4) + 's');
        c.appendChild(s);
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
        ? `已转世${game.legacy.runs}次 · 最长${game.legacy.best}岁 · 改命成功${game.legacy.wins}次`
        : '第一次投胎？帮康康改变被AI取代的命运！';
}

// ===== Game UI Update =====
function updateUI(state, stageName) {
    $('gAge').textContent = state.age;
    $('gStage').textContent = stageName;
    $('gMoney').textContent = '¥' + Math.floor(state.money);

    // Animate stat changes
    updateStat('vHp', 'bHp', state.hp);
    updateStat('vInt', 'bInt', state.int);
    updateStat('vHap', 'bHap', state.hap);
    updateStat('vChr', 'bChr', state.chr);
}

function updateStat(valId, barId, newVal) {
    const el = $(valId);
    const oldVal = parseInt(el.textContent) || 0;
    const rounded = Math.round(newVal);
    el.textContent = rounded;
    $(barId).style.width = rounded + '%';

    // Add change animation
    if (rounded > oldVal) {
        el.classList.remove('stat-change-down');
        el.classList.add('stat-change-up');
        setTimeout(() => el.classList.remove('stat-change-up'), 600);
    } else if (rounded < oldVal) {
        el.classList.remove('stat-change-up');
        el.classList.add('stat-change-down');
        setTimeout(() => el.classList.remove('stat-change-down'), 600);
    }
}

// ===== Event Stream =====
function addEventLine(age, text, type = 'neutral') {
    const s = $('eventStream');
    const d = document.createElement('div');
    d.className = 'ev-line ' + type;
    d.innerHTML = `<span class="ev-age">[${age}岁]</span>${text}`;
    s.appendChild(d);
    // Limit DOM nodes to prevent unbounded growth
    while (s.children.length > 100) s.removeChild(s.firstChild);
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
    const { isWin, isRider, cause, earned, age, job, totalEarned, aiSurvived, timeline } = data;

    $('endIcon').textContent = isWin ? '🎉' : isRider ? '🛵' : '💀';
    const t = $('endTitle');
    if (isWin) { t.textContent = '康康的传奇人生！'; t.className = 'win'; }
    else if (isRider) { t.textContent = '康康沦为了骑手...'; t.className = 'lose'; }
    else { t.textContent = '康康的人生结束了'; t.className = 'lose'; }

    $('endDesc').innerHTML = isWin
        ? `活到了${age}岁！${aiSurvived ? '成功抵抗了AI浪潮！' : ''}总收入¥${totalEarned}`
        : isRider
        ? `康康最终还是被AI取代，成为了外卖骑手...<br>再试一次，帮他逆天改命吧！`
        : `享年${age}岁 — ${cause}<br>最终职业：${job}`;

    $('endGrid').innerHTML = `
        <div class="eg-item"><div class="eg-l">享年</div><div class="eg-v">${age}岁</div></div>
        <div class="eg-item"><div class="eg-l">职业</div><div class="eg-v">${job}</div></div>
        <div class="eg-item"><div class="eg-l">总收入</div><div class="eg-v" style="color:var(--green)">¥${totalEarned}</div></div>
        <div class="eg-item"><div class="eg-l">改命</div><div class="eg-v">${aiSurvived ? '✅成功' : '❌失败'}</div></div>
    `;

    // Timeline
    const tl = $('endTimeline');
    if (timeline && timeline.length > 0) {
        tl.innerHTML = '<div class="tl-title">📜 人生关键节点</div>' +
            timeline.map(e => `
                <div class="tl-item">
                    <span class="tl-age">[${e.age}岁]</span> ${e.text}
                </div>
            `).join('');
        tl.style.display = 'block';
    } else {
        tl.style.display = 'none';
    }

    $('endLegacy').textContent = `获得传世金币: +${earned} 🪙`;
    showScreen('endScreen');
}

// ===== Speed Control =====
function setSpeed(s) {
    game.setSpeed(s);
    document.querySelectorAll('.speed-ctrl button').forEach(b => b.classList.remove('active'));
    const btn = document.querySelector(`.speed-ctrl button[data-speed="${s}"]`);
    if (btn) btn.classList.add('active');
}

// ===== Achievement Toast =====
function showAchievement(text) {
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
game.onAchievement = showAchievement;
game.onError = (msg) => showAchievement('⚠️ ' + msg);

// ===== Event Listeners (no more onclick!) =====
document.addEventListener('DOMContentLoaded', async () => {
    createStars();
    await game.init();
    initStart();

    // Start button
    $('startBtn').addEventListener('click', () => {
        if (game.start()) {
            $('eventStream').innerHTML = '';
            showScreen('gameScreen');
        }
    });

    // Restart button
    $('restartBtn').addEventListener('click', () => {
        game.backToStart();
        showScreen('startScreen');
        initStart();
    });

    // Speed control — event delegation
    document.querySelector('.speed-ctrl').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn || !btn.dataset.speed) return;
        setSpeed(Number(btn.dataset.speed));
    });
});
