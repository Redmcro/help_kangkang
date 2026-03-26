# 🖼️ Chancery: JS Logic Fixes (Parallel Task B)

> ⚡ This task runs IN PARALLEL with the Military HTML/CSS task. Zero file overlap.

## Task
Fix 5 JS issues: model switch resume, delete side gig/audio JS, remove cost display, show model in tab.

## Assigned Files
- `js/app.js`
- `js/save.js`

## Required Reading
- `.agents/AGENTS.md`
- `js/engine.js` — `scheduleNext()`, `paused`, `processWorkDay()`

---

## 1. Fix model switch not resuming game (js/app.js)

**Bug**: After selecting a model in the model switch overlay, the game stays paused.

Find where model items are clicked (the model selection handler). After setting `current_model`:
1. Close the overlay
2. Resume the game: `engine.paused = false` then call `engine.scheduleNext(() => engine.processWorkDay(...))`

Reference: look at how `makeChoice()` resumes — the model switch should do the same pattern.

## 2. Delete side gig JS (js/app.js)

Delete ALL code related to side gig:
- Any `sideGigBtn` event listener
- Any `renderSideGig()` function
- Any `sideGigOverlay` references
- Any side gig rendering, charm calculation, cooldown logic

## 3. Delete audio JS (js/app.js + js/save.js)

### js/app.js
- Delete any `audioToggle` / `bgmToggle` event listeners
- Delete any audio-related imports from save.js

### js/save.js
- Delete `AUDIO_KEY` constant (line ~5)
- Delete `DEFAULT_AUDIO_PREFS` object (lines ~70-74)
- Delete `loadAudioPrefs()` function (lines ~76-83)
- Delete `saveAudioPrefs()` function (lines ~86-91)

## 4. Remove model cost display (js/app.js)

In `renderModelSwitch()`:
- Delete `minCost` / `maxCost` calculations
- Remove `¥${m.tokenPrice}/M · ⭐¥${minCost}~⭐⭐⭐⭐¥${maxCost}` from the model card HTML
- Keep only: model name, quality, bug rate

## 5. Show current model in editor tab (js/app.js)

In `updateUI(state)`, update the editor tab to show the current model:
```javascript
const modelName = AI_MODELS[state.current_model]?.name || '🧠 纯人肉';
$('editorTabName').textContent = `kangkang_life.log — ${modelName}`;
```

---

## Acceptance
- After model switch: game resumes, events keep flowing
- `grep -i "sideGig\|side_gig\|renderSideGig\|gigPanel" js/app.js` → 0 hits
- `grep -i "audioToggle\|bgmToggle\|loadAudioPrefs\|saveAudioPrefs" js/app.js js/save.js` → 0 hits
- `grep -i "tokenPrice\|minCost\|maxCost" js/app.js` → 0 hits
- Editor tab shows current model name
- File report in `.agents/REPORTS.md`, mark `🔍待验收`
- 🚨 **Do NOT modify `index.html` or `css/`** — that's the other task
- 🚨 **Do NOT open any ports or browsers**
- 🚨 **Do NOT modify `DECREES.md`**
