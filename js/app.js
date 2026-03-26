// ===== App.js =====
// v2: IDE-themed UI Controller. Only file that touches the DOM.
// Module 4: Overlay panels (Endings, Achievements) + achievement integration
// Module 5: Model Switch interaction panel.

import { GameEngine, AI_MODELS } from './engine.js';
import { AchievementManager } from './achievement.js';
import { saveLegacy } from './save.js';
// NOTE: audio imports removed per decree

const game = new GameEngine();
const achieveMgr = new AchievementManager();
const $ = id => document.getElementById(id);

// Module 4: Data loaded at init
let endingsData = {};   // from data/endings.json



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
    updateBar('valGf', 'barGf', state.gf_rel || 0, 100);
    const gfRow = $('gfRelRow');
    if (gfRow) gfRow.style.display = state.has_girlfriend === false ? 'none' : '';
    const moneyEl = $('valMoney');
    moneyEl.textContent = '¥' + Math.floor(state.money).toLocaleString('zh-CN');
    moneyEl.classList.toggle('money-negative', state.money < 0);
    const mn = { doubao: '🐳 豆包', gpt54: '🤖 GPT-5.4', opus46: '🎯 Opus 4.6', deepseek_v4: '🔮 DeepSeek V4', cheapgpt: '💀 CheapGPT', fakeopus: '🎪 FakeOpus' };
    $('currentModelDisplay').textContent = mn[state.current_model] || '🐳 豆包';
    $('stageDisplay').textContent = stageName;
    updateTabs(state.month);

    // Fix 5: Show current model name in editor tab
    const modelName = AI_MODELS[state.current_model]?.name || '🧠 纯人肉';
    $('editorTabName').textContent = `kangkang_life.log — ${modelName}`;
}

function updateBar(valId, barId, value, max) {
    const el = $(valId);
    const bar = $(barId);
    const old = parseInt(el.textContent) || 0;
    const v = Math.round(value);
    el.textContent = v;
    bar.style.width = Math.max(0, Math.min(100, (value / max) * 100)) + '%';
    // Danger state: pulse when ≤ 25%
    const isDanger = value <= max * 0.25;
    bar.classList.toggle('stat-danger', isDanger);
    el.classList.toggle('stat-danger', isDanger);
    if (v > old) { el.classList.remove('stat-change-down'); el.classList.add('stat-change-up'); setTimeout(() => el.classList.remove('stat-change-up'), 500); }
    else if (v < old) { el.classList.remove('stat-change-up'); el.classList.add('stat-change-down'); setTimeout(() => el.classList.remove('stat-change-down'), 500); }
}

// ===== Event Stream =====

let lineNum = 1;
function addEventLine(month, day, text, type) {
    const s = $('eventStream');
    const d = document.createElement('div');
    let cls = 'ev-line ' + (type || 'neutral');
    // Add divider for month start lines
    if (text.includes('月开始')) cls += ' ev-divider';
    d.className = cls;
    d.innerHTML = `<span class="ev-prefix">${lineNum++}</span><span>${text}</span>`;
    s.appendChild(d);
    while (s.children.length > 150) s.removeChild(s.firstChild);
    s.scrollTop = s.scrollHeight;
}

function addEventLineHTML(month, day, html, type) {
    const s = $('eventStream');
    const d = document.createElement('div');
    d.className = 'ev-line ' + (type || 'neutral');
    d.innerHTML = `<span class="ev-prefix">${lineNum++}</span><span>${html}</span>`;
    s.appendChild(d);
    while (s.children.length > 150) s.removeChild(s.firstChild);
    s.scrollTop = s.scrollHeight;
}

function colorDelta(label, delta, isMoney = false) {
    let color;
    if (isMoney && delta > 0) {
        color = '#ff4444'; // Red envelope color for positive money
    } else {
        color = delta > 0 ? 'var(--green)' : 'var(--red)';
    }
    const sign = delta > 0 ? '+' : '';
    const val = isMoney ? `¥${sign}${delta}` : `${sign}${delta}`;
    return `<span style="color:${color}">${label}${val}</span>`;
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
        const hintHtml = ch.hint && !locked ? `<div class="cpb-hint">${ch.hint}</div>` : '';
        b.innerHTML = `<div>${ch.text}</div>${hintHtml}${locked ? `<div class="cpb-lock">${lr}</div>` : ''}`;
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
    const moneyColor = money < 0 ? 'var(--red)' : 'var(--green)';
    $('endGrid').innerHTML = `
        <div class="eg-item"><div class="eg-l">存活月份</div><div class="eg-v">${month}/12</div></div>
        <div class="eg-item"><div class="eg-l">代码质量</div><div class="eg-v">${avgQuality}</div></div>
        <div class="eg-item"><div class="eg-l">老板满意度</div><div class="eg-v">${bossSatisfy}</div></div>
        <div class="eg-item"><div class="eg-l">最终存款</div><div class="eg-v" style="color:${moneyColor}">¥${Math.floor(money).toLocaleString('zh-CN')}</div></div>`;
    const tl = $('endTimeline');
    if (timeline && timeline.length > 0) {
        tl.innerHTML = '<div class="tl-title">📜 关键事件</div>' + timeline.map(e => `<div class="tl-item"><span class="tl-month">[${e.month}月]</span> ${e.text}</div>`).join('');
        tl.style.display = 'block';
    } else tl.style.display = 'none';
    $('endLegacy').textContent = `获得传世金币: +${totalCoins} 🪙`;
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



// ===== Module 4: Endings Panel =====

function renderEndings() {
    const unlocked = new Set(game.legacy.endings_unlocked || []);
    const entries = Object.entries(endingsData);
    const totalCount = entries.length;
    const unlockedCount = entries.filter(([id]) => unlocked.has(id)).length;
    const pct = totalCount > 0 ? Math.round(unlockedCount / totalCount * 100) : 0;

    $('endingsProgress').innerHTML = `
        <span>🏆 已解锁 ${unlockedCount}/${totalCount} (${pct}%)</span>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>`;

    const body = $('endingsBody');
    body.innerHTML = '';

    // Group by category
    const categories = { hidden: '🔮 隐藏结局', failure: '💀 失败结局', victory: '🏆 胜利结局' };
    const grouped = {};
    for (const [id, e] of entries) {
        const cat = e.category || 'victory';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push({ id, ...e });
    }

    for (const [cat, label] of Object.entries(categories)) {
        const items = grouped[cat];
        if (!items || items.length === 0) continue;

        const title = document.createElement('div');
        title.className = 'collection-section-title';
        title.textContent = `${label} (${items.filter(i => unlocked.has(i.id)).length}/${items.length})`;
        body.appendChild(title);

        for (const item of items) {
            const isUnlocked = unlocked.has(item.id);
            const card = document.createElement('div');
            card.className = 'collection-card' + (isUnlocked ? '' : ' locked');

            if (isUnlocked) {
                card.innerHTML = `
                    <div class="cc-header">
                        <span class="cc-icon">${item.icon}</span>
                        <span class="cc-name">${item.title}</span>
                        <span class="cc-badge unlocked">✓ 已解锁</span>
                    </div>
                    <div class="cc-desc">${item.desc}</div>
                    <div class="cc-reward">🪙 +${item.coins} 传世金币</div>`;
            } else {
                card.innerHTML = `
                    <div class="cc-header">
                        <span class="cc-icon" style="filter:brightness(0.3)">❓</span>
                        <span class="cc-name" style="color:var(--text3)">??? 未知结局</span>
                        <span class="cc-badge locked">未解锁</span>
                    </div>
                    <div class="cc-desc" style="color:var(--text3);font-style:italic">继续探索来解锁这个结局</div>`;
            }
            body.appendChild(card);
        }
    }
}

// ===== Module 4: Achievements Panel =====

function renderAchievements() {
    const allAch = achieveMgr.getAll();
    const unlockedIds = new Set(achieveMgr.getUnlockedIds());
    const entries = Object.entries(allAch);
    const totalCount = entries.length;
    const unlockedCount = entries.filter(([id]) => unlockedIds.has(id)).length;
    const pct = totalCount > 0 ? Math.round(unlockedCount / totalCount * 100) : 0;

    $('achieveProgress').innerHTML = `
        <span>⭐ 已解锁 ${unlockedCount}/${totalCount} (${pct}%)</span>
        <div class="progress-bar"><div class="progress-fill" style="width:${pct}%"></div></div>`;

    const body = $('achieveBody');
    body.innerHTML = '';

    // Show unlocked first, then locked
    const sorted = [...entries].sort(([aId, a], [bId, b]) => {
        const aU = unlockedIds.has(aId) ? 0 : 1;
        const bU = unlockedIds.has(bId) ? 0 : 1;
        return aU - bU;
    });

    for (const [id, ach] of sorted) {
        const isUnlocked = unlockedIds.has(id);
        const isHidden = ach.hidden && !isUnlocked;
        const card = document.createElement('div');
        card.className = 'collection-card' + (isUnlocked ? '' : ' locked');

        if (isUnlocked) {
            card.innerHTML = `
                <div class="cc-header">
                    <span class="cc-icon">${ach.icon}</span>
                    <span class="cc-name">${ach.name}</span>
                    <span class="cc-badge unlocked">✓ 已解锁</span>
                </div>
                <div class="cc-desc">${ach.desc}</div>
                <div class="cc-reward">🪙 +${ach.reward} 传世金币</div>`;
        } else if (isHidden) {
            card.innerHTML = `
                <div class="cc-header">
                    <span class="cc-icon">🔒</span>
                    <span class="cc-name" style="color:var(--text3)">??? 隐藏成就</span>
                    <span class="cc-badge locked">隐藏</span>
                </div>
                <div class="cc-desc" style="color:var(--text3);font-style:italic">达成特定条件解锁</div>`;
        } else {
            card.innerHTML = `
                <div class="cc-header">
                    <span class="cc-icon" style="opacity:.4">${ach.icon}</span>
                    <span class="cc-name" style="color:var(--text3)">${ach.name}</span>
                    <span class="cc-badge locked">未解锁</span>
                </div>
                <div class="cc-desc" style="color:var(--text3)">${ach.desc}</div>
                <div class="cc-reward" style="opacity:.5">🪙 +${ach.reward} 传世金币</div>`;
        }
        body.appendChild(card);
    }
}

// ===== Module 4: Achievement Check Helper =====

function checkAndShowAchievements() {
    const newlyUnlocked = achieveMgr.check();
    if (newlyUnlocked.length > 0) {
        saveLegacy(game.legacy);
        // Show toast for each new achievement with staggered delay
        newlyUnlocked.forEach((ach, i) => {
            setTimeout(() => {
                showToast(`🏆 ${ach.icon} ${ach.name} — +${ach.reward}🪙`);
            }, i * 3500);
        });
    }
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



// ===== Module 5: Model Switch =====

function renderModelSwitch() {
    const state = game.property.toJSON();
    const currentModel = state.current_model;
    const list = $('modelList');
    list.innerHTML = '';

    for (const [id, m] of Object.entries(AI_MODELS)) {
        const flagKey = `model_${id}_unlocked`;
        const unlocked = !!state[flagKey];
        const isCurrent = currentModel === id;
        const bugPct = Math.round(m.bugRate * 100);

        let bugDisplay = `${bugPct}%`;
        if (id === 'doubao') {
            const dqb = state.doubao_quality_bonus || 0;
            if (dqb > 0) {
                const correctedRate = Math.max(0, Math.round((m.bugRate - dqb / 100) * 100));
                bugDisplay = `${bugPct}% (${correctedRate}%)`;
            }
        }

        const priceLabel = m.tokenPrice === 0 ? '免费' : `¥${m.tokenPrice}/M`;
        const item = document.createElement('div');
        item.className = 'model-item' + (isCurrent ? ' active' : '') + (!unlocked ? ' locked' : '');
        item.innerHTML = `
            <div class="mi-icon">${m.name.split(' ')[0]}</div>
            <div class="mi-info">
                <div class="mi-name">${m.name}</div>
                <div class="mi-stats">质量:${m.quality} · Bug:${bugDisplay} · ${priceLabel}</div>
            </div>
            ${isCurrent ? '<span class="mi-badge current">当前</span>' : ''}
            ${!unlocked ? '<span class="mi-badge" style="color:var(--text3);border:1px solid var(--border)">🔒 未解锁</span>' : ''}`;

        if (unlocked && !isCurrent) {
            item.addEventListener('click', () => {
                game.property.set('current_model', id);
                addEventLine(state.month, state.day || 1, `🤖 切换模型：${m.name}`, 'special');
                showToast(`已切换到 ${m.name}`);
                renderModelSwitch();
                closeOverlay('modelSwitchOverlay');
            });
        }
        list.appendChild(item);
    }
}



// ===== Callbacks =====

game.onEvent = addEventLine;
game.onUpdateUI = updateUI;
game.onShowChoice = showChoicePanel;
game.onHideChoice = hideChoicePanel;
game.onGameEnd = (data) => {
    showEndScreen(data);
    // Module 4b: check achievements on game end
    checkAndShowAchievements();
};
game.onMonthSummary = () => {
    checkAndShowAchievements();
};
game.onDaySummary = (data) => {
    const parts = [`📅 ${data.month}月${data.day}日`];
    parts.push(data.modelName);
    if (data.tokensUsed > 0) parts.push(`消耗 ${data.tokensUsed}M`);

    let html = parts.join(' | ');

    if (data.events && data.events.length > 0) {
        data.events.forEach(ev => {
            let evColor = 'var(--text2)';
            if (/🐛|⚠️|Bug|加班/.test(ev)) evColor = 'var(--red)';
            else if (/🔓|🎯|🔮|解锁|成功|奖/.test(ev)) evColor = 'var(--purple)';
            else if (/💸|余额不足/.test(ev)) evColor = 'var(--orange)';
            html += `<br>　　<span style="color:${evColor}">→ ${ev}</span>`;
        });
    }

    addEventLineHTML(data.month, data.day, html, data.overtime ? 'bad' : 'neutral');
};
game.onChoiceResult = ({ text, deltas }) => {
    let deltaStr = '';
    if (deltas && Object.keys(deltas).length > 0) {
        const emojiMap = { hp:'❤️', brain:'🧠', money:'💰', bossSatisfy:'👔', shaoye_rel:'🤝少', yimin_rel:'🤝亿', gf_rel:'💕' };
        deltaStr = ' ' + Object.entries(deltas)
            .map(([k, v]) => colorDelta(emojiMap[k] || k, v, k === 'money'))
            .join(' ');
    }
    addEventLineHTML(game.property.get('month'), game.property.get('day'), '→ ' + text + deltaStr, 'choice-made');
};
game.onError = (msg) => showToast('⚠️ ' + msg);

// ===== Init =====

document.addEventListener('DOMContentLoaded', async () => {
    createCodeRain();
    await game.init();

    // Module 4: Load achievement manager + endings data + all events data
    try {
        await achieveMgr.load();
        achieveMgr.bind(game.legacy);
    } catch (e) { console.warn('Achievement init failed:', e); }

    try {
        const endResp = await fetch('data/endings.json');
        if (endResp.ok) endingsData = await endResp.json();
    } catch (e) { console.warn('Endings data load failed:', e); }



    initStart();

    // Game start
    $('startBtn').addEventListener('click', () => {
        if (game.start()) {
            $('eventStream').innerHTML = '';
            lineNum = 1;
            showScreen('gameScreen');
        }
    });

    // Restart → back to start screen
    $('restartBtn').addEventListener('click', () => {
        game.backToStart();
        achieveMgr.bind(game.legacy); // re-bind after legacy reload
        showScreen('startScreen');
        initStart();
    });

    // ===== Module 4: Overlay button bindings =====
    $('endingsBtn').addEventListener('click', () => {
        renderEndings();
        openOverlay('endingsOverlay');
    });
    $('achieveBtn').addEventListener('click', () => {
        renderAchievements();
        openOverlay('achieveOverlay');
    });

    // Speed controls
    $('speedCtrl').addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (btn && btn.dataset.speed) setSpeed(Number(btn.dataset.speed));
    });


    $('switchModelBtn').addEventListener('click', () => {
        renderModelSwitch();
        openOverlay('modelSwitchOverlay');
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

    // ===== Mobile: Explorer toggle =====
    $('toggleExplorer').addEventListener('click', () => {
        $('explorer').classList.toggle('open');
        $('explorerBackdrop').classList.toggle('show');
    });
    $('explorerBackdrop').addEventListener('click', () => {
        $('explorer').classList.remove('open');
        $('explorerBackdrop').classList.remove('show');
    });
});
