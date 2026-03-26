# 🎨🖼️ Military + Chancery: Combined UI Overhaul

## Task
4 UI changes in one task (files are interdependent):
1. Remove Event Gallery (Decree 2)
2. Remove Token UI + show model costs (Decree 3)
3. Add Girlfriend relationship UI (Decree 4)
4. Mobile optimization (Decree 1)

## Assigned Files
- `index.html`
- `css/style.css`
- `js/app.js`

## Required Reading
- `.agents/AGENTS.md`
- `js/engine.js` (check new `AI_MODELS` with `tokenPrice`, and `export { AI_MODELS }`)
- `js/property.js` (check new `gf_rel`, `has_girlfriend`, `married`, `living_cost`)

---

## 1. Remove Event Gallery

### index.html
- Delete `<button class="start-sub-btn" id="galleryBtn">📖 事件图鉴</button>`
- Delete entire `<div class="overlay" id="galleryOverlay">...</div>`

### app.js
- Delete `let allEventsData = {};`
- Delete `SYSTEM_NAMES` constant
- Delete `renderGallery()` function
- Delete `$('galleryBtn').addEventListener(...)` binding
- Delete DOMContentLoaded `_manifest.json` loading and event data merging logic

### style.css
- Delete `.cc-system`, `.cc-month`, `.cc-effect` styles

---

## 2. Remove Token UI + Add Model Cost Display

### index.html
- Delete Token stat row (id="valToken")
- Delete `<button id="buyTokenBtn">🪙 买Token</button>`
- Delete entire `<div class="overlay" id="tokenShopOverlay">...</div>`

### app.js
- Delete `TOKEN_PACKAGES` constant
- Delete `renderTokenShop()` function
- Delete `$('buyTokenBtn').addEventListener(...)` binding
- Delete `$('valToken').textContent = ...` from `updateUI()`
- Import `AI_MODELS` from engine.js, show `¥${tokenPrice}/M` and cost range
- `renderModelSwitch()`: each model shows `¥X/M · ⭐¥Y ~ ⭐⭐⭐⭐¥Z`

### style.css
- Delete `.stat-val-token`
- Delete `.shop-balance`, `.token-grid`, `.token-card`, `.tc-*` token shop styles

---

## 3. Add Girlfriend Relationship UI

### index.html
In COLLEAGUES section, add:
```html
<div class="stat-row" id="gfRelRow">
  <span class="stat-icon">💕</span>
  <span class="stat-name">女友</span>
  <div class="stat-bar-wrap"><div class="stat-bar stat-bar-rel" id="barGf"></div></div>
  <span class="stat-val" id="valGf">60</span>
</div>
```

### app.js
- In `updateUI()`: `updateBar('valGf', 'barGf', state.gf_rel, 100);`
- When `state.has_girlfriend === false`: `$('gfRelRow').style.display = 'none';`

---

## 4. Mobile Optimization

### index.html
Add toggle button before Explorer:
```html
<button class="explorer-toggle" id="toggleExplorer">📊</button>
```

### style.css
```css
.explorer-toggle { display: none; }

@media(max-width:600px) {
  .explorer-toggle {
    display: flex; align-items: center; justify-content: center;
    position: fixed; top: calc(var(--tab-height) + 8px); left: 8px;
    z-index: 50; width: 40px; height: 40px;
    border: 1px solid var(--border); border-radius: var(--radius-lg);
    background: var(--bg-sidebar); color: var(--text);
    font-size: 16px; cursor: pointer;
  }
  .explorer { position: fixed; top: 0; left: -100%; width: 85vw; height: 100vh;
    z-index: 100; overflow-y: auto; transition: left .3s ease; }
  .explorer.open { left: 0; }
  .terminal-bar .game-actions {
    position: fixed; bottom: 70px; right: 12px;
    flex-direction: column; gap: 8px; z-index: 50; }
  .action-btn { width: 48px; height: 48px; border-radius: 50%;
    font-size: 16px; padding: 0; box-shadow: 0 4px 12px rgba(0,0,0,.4); }
  .action-btn span { display: none; }
  .choice-panel { position: fixed; bottom: 0; left: 0; right: 0;
    z-index: 90; max-height: 70vh; border-radius: 16px 16px 0 0; }
  .cp-btn { min-height: 48px; }
  .speed-ctrl button { min-height: 44px; min-width: 44px; }
}
```

### app.js
```javascript
$('toggleExplorer').addEventListener('click', () => {
  $('explorer').classList.toggle('open');
});
document.addEventListener('click', (e) => {
  const exp = $('explorer');
  if (exp.classList.contains('open') && !exp.contains(e.target) && e.target !== $('toggleExplorer')) {
    exp.classList.remove('open');
  }
});
```

---

## Acceptance
- Gallery button + overlay fully removed
- Token display, buy button, shop fully removed
- Model panel shows ¥/M rate
- Girlfriend bar visible, hidden after breakup
- Mobile: Explorer collapses, FAB buttons, Bottom Sheet choices
- Desktop: no regression
- No JS errors
- 🚨 **Do NOT open any ports or browsers**
