# 🔧 Task A: Engine & Property — Attribute Philosophy Rebalance

**Department:** 工部
**Priority:** HIGH
**Parallel:** ⚡ Can run simultaneously with B/C/D/E

## Assigned Files

- `js/property.js`
- `js/engine.js`

## Context — Attribute Philosophy

Read this carefully. ALL changes must follow this logic:

| Attribute | Meaning | Drains from | Recovers from |
|:---|:---|:---|:---|
| ❤️ HP | Body/sleep | Late nights, overtime, sickness | Rest, exercise, good food |
| 🧠 Brain | Mental load | Bugs, hard tasks, meetings | Slacking, socializing, breaks |
| 👔 Boss | Work quality | Bad code, delays | Good code, on-time delivery |

**Key rule:** Overtime = no sleep = only drains HP. Bugs = mental work = drains Brain. They are separate causes.

## Changes Required

### property.js

1. Change `living_cost` initial value: `2500` → `1500`
2. Change `monthlyRecovery()`:
   - `brainRecover`: normal `5` → `8`, overtime `3` → `4`
   - `hpRecover`: normal `3` → `5`, overtime `2` → `3`

### engine.js

#### 1. Overtime mechanism (`processWorkDay`, around line 306-328)

- Change threshold: `quality < 50` → `quality < 40`
- **Overtime only drains HP, NOT brain:**
  - `hpLoss = rng(3, 8)` (was 8, 20)
  - Remove `brainLoss` from overtime — brain is ONLY drained by bugs (see below)
  - Consecutive 5-day extra: `rng(3, 6)` (was 5, 10)

#### 2. Bug brain cost (around line 291-302)

- Change multiplier: `stars * (1 - quality/100) * 5` → `* 3`
- Bug still drains brain — this is the ONLY source of daily brain drain from engine

#### 3. Merge Bug + Overtime into single daily report entry

Current code pushes bug narrative and overtime narrative as **separate** entries in `dayReport.events`. Merge them:

- Replace `OVERTIME_NARRATIVES` array with a **template function**:
```javascript
function buildOvertimeMsg(quality, hasBug, hpLoss, brainLoss) {
    const bugPart = hasBug ? `修了个Bug 🧠-${brainLoss}，` : '';
    const msgs = [
        `⚠️ 代码质量${quality}分，${bugPart}加班返工到深夜`,
        `⚠️ 今天写的代码只有${quality}分，${bugPart}不得不留下来重写`,
        `⚠️ 代码没过质检(${quality}分)，${bugPart}康康叹了口气开始加班`,
        `⚠️ ${quality}分的代码交不了差，${bugPart}又是一个加班夜`,
    ];
    return msgs[Math.floor(Math.random() * msgs.length)] + ` ❤️-${hpLoss}`;
}
```

- When `quality < 40` (overtime triggered):
  - If `hasBug` is also true: push ONE combined message (bug+overtime), do NOT push bug separately
  - If no bug: push overtime-only message
- When `quality >= 40` but `hasBug`: push bug-only message (no overtime)

- Keep special narratives for consecutive overtime ≥3 and ≥5, but also include quality/bug info

#### 4. Month-end satisfaction (`nextMonth`, around line 399-401)

Change the satisfaction deltas:
```
avgQ >= 90 → sd = 2  (unchanged)
avgQ >= 70 → sd = 1  (unchanged)
avgQ >= 50 → sd = 0  (was -1)
avgQ >= 30 → sd = -2 (was -4)
avgQ < 30  → sd = -5 (was -8)
```

## Acceptance Criteria

- [ ] `living_cost` starts at 1500
- [ ] Monthly recovery is brain+8/hp+5 (halved if overtime)
- [ ] Overtime threshold is quality < 40
- [ ] Overtime only drains HP (3-8), not Brain
- [ ] Bugs still drain Brain (with ×3 multiplier)
- [ ] Bug and overtime messages merged into single daily report entry
- [ ] Overtime message includes quality score and bug reason
- [ ] Month-end satisfaction uses new deltas (0 for 50-69 range)
- [ ] All code compiles without errors
