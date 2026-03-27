# 🔧 Task G: Pause Mechanism Fix + Pirate Model Instability

**Department:** 工部
**Priority:** CRITICAL (game-breaking freeze)
**Parallel:** ⚡ Can run with H

## Assigned Files

- `js/engine.js`
- `js/app.js`

## Bug 1: Game Freeze — pauseDepth Gets Stuck

### Root Cause

`scheduleNext()` (engine.js:191-193) silently returns if `this.paused` is true (i.e. `pauseDepth > 0`):

```javascript
scheduleNext(fn) {
    if (this.paused) return;  // <-- game dies silently here
    this.autoTimer = setTimeout(() => fn(), this.speed);
}
```

The freeze happens because `pauseDepth` gets incremented by multiple sources but not always fully decremented:

1. `showChoice()` calls `this.pause()` → `pauseDepth` becomes 1
2. User clicks "切换模型" → `openOverlay()` calls `game.paused = true` → `pauseDepth` becomes 2
3. User selects model → current fix calls `game.paused = false` → `pauseDepth` becomes 1 (NOT 0!)
4. `scheduleNext` sees `pauseDepth > 0` → does nothing → **game freezes**

Even without model switch, any overlay opened during a choice event will cause the same issue.

### Fix Required

In `app.js`, the model switch click handler currently does:
```javascript
game.paused = false;  // Only decrements by 1!
```

Change to **force-reset pauseDepth to 0**:
```javascript
game.pauseDepth = 0;  // Force unpause completely
```

But `pauseDepth` is currently incremented via `pause()` and decremented via `resume()`. The proper fix is:

**Option A (recommended):** In `app.js` model switch handler, replace `game.paused = false` with resetting pause properly:
```javascript
// After model switch, fully unpause since we're returning to game flow
while (game.paused) game.paused = false;
```

**Option B (safer):** Add a `forceResume()` method to `GameEngine`:
```javascript
// engine.js
forceResume() {
    this.pauseDepth = 0;
    this.emitUI();
}
```
Then call `game.forceResume()` from the model switch handler.

**Also fix:** ALL overlay close paths should handle nested pause correctly. The `closeOverlay` function uses a single `wasGamePaused` flag, which loses track if multiple overlays open sequentially.

Better approach: `openOverlay` should save the pauseDepth count before pausing, and `closeOverlay` should restore it:
```javascript
let savedPauseDepth = 0;
function openOverlay(overlayId) {
    savedPauseDepth = game.pauseDepth;
    game.pause();
    clearTimeout(game.autoTimer);
    $(overlayId).classList.add('show');
}
function closeOverlay(overlayId) {
    $(overlayId).classList.remove('show');
    // Restore to state before overlay opened
    game.pauseDepth = savedPauseDepth;
    if (game.pauseDepth === 0) game.emitUI();
}
```

## Bug 2: Model switch also needs to call `scheduleNext` after resume

After fixing the pause depth, the game is unpaused but no `scheduleNext` is queued. The game needs to re-queue its next step. The model switch should not try to do this — instead, `resume()` should check if there's a pending step to schedule.

Simplest fix: after unpausing in model switch handler, call `game.emitUI()` which will trigger a UI update. But the actual game loop advance happens via `scheduleNext`. 

The cleanest solution: when the model switch overlay is opened during a choice event, let the choice flow handle the resume. The model switch should ONLY affect the overlay, not the game loop:

```javascript
// Model switch click handler in app.js:
item.addEventListener('click', () => {
    game.property.set('current_model', id);
    game.dayReport.modelName = m.name;
    addEventLine(state.month, state.day || 1, `🤖 切换模型：${m.name}`, 'special');
    showToast(`已切换到 ${m.name}`);
    renderModelSwitch();
    // Just close the overlay, restore pause state — don't force unpause
    closeOverlay('modelSwitchOverlay');
    // Update UI to show new model name
    game.emitUI();
});
```

This way, if a choice was open, the choice panel is still showing and the game stays paused for the choice. The user makes their choice, `makeChoice()` calls `resume()`, and the game continues.

## Feature: Pirate Model Random Bug Rate

### Current State (engine.js:8-15)

CheapGPT and FakeOpus have fixed bug rates:
```javascript
cheapgpt: { bugRate: 0.60, quality: 30 ... }
fakeopus:  { bugRate: 0.55, quality: 35 ... }
```

### Change Required

Make `bugRate` for cheap models a **range** that's randomly resolved each day.

In `processWorkDay` (around line 293-296), the bug rate calculation is:
```javascript
const baseBugRate = model ? model.bugRate : 0.3;
const hasBug = Math.random() < baseBugRate * (1 - (luck - 50) / 200);
```

Change to:
```javascript
let baseBugRate = model ? model.bugRate : 0.3;

// Pirate models: unstable bug rate (random each day)
if (modelId === 'cheapgpt') {
    baseBugRate = 0.10 + Math.random() * 0.70;  // 10%~80% — wild swings
} else if (modelId === 'fakeopus') {
    baseBugRate = 0.15 + Math.random() * 0.60;  // 15%~75% — also unstable
}

const hasBug = Math.random() < baseBugRate * (1 - (luck - 50) / 200);
```

Also add a daily report message when pirate model has a particularly good or bad day:
```javascript
if (modelId === 'cheapgpt' || modelId === 'fakeopus') {
    if (baseBugRate < 0.20) {
        this.dayReport.events.push(`🎲 ${model.name} 今天状态爆表！Bug率极低`);
    } else if (baseBugRate > 0.65) {
        this.dayReport.events.push(`🎲 ${model.name} 今天拉胯了，Bug满天飞`);
    }
}
```

## Acceptance Criteria

- [ ] Game does NOT freeze when switching models during a choice event
- [ ] Game does NOT freeze when opening/closing any overlay during gameplay
- [ ] Overlay open/close properly preserves and restores pause state
- [ ] CheapGPT bug rate varies randomly each day (10%~80%)
- [ ] FakeOpus bug rate varies randomly each day (15%~75%)
- [ ] Daily report shows pirate model "good day"/"bad day" messages
- [ ] All code compiles without errors
