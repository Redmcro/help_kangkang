# 👤 Task E: Choice, Colleagues, Girlfriend & Models Events — Rebalance

**Department:** 吏部
**Priority:** HIGH
**Parallel:** ⚡ Can run simultaneously with A/B/C/D

## Assigned Files

- `data/events/choice.json`
- `data/events/colleagues.json`
- `data/events/girlfriend.json`
- `data/events/models.json`

## Context — Attribute Philosophy

| Attribute | Drains from | Recovers from |
|:---|:---|:---|
| ❤️ HP | Late nights, overtime, sickness | Rest, exercise, food |
| 🧠 Brain | Bugs, hard tasks, meetings, mental stress | Slacking, socializing, breaks |
| 👔 Boss | Bad code, delays | Good code, effort |

**Salary is 3000/month.** All money values rescaled to ~25-30% of original.

## Changes Required

### General Rules for All Files

1. **Money**: Scale ALL money effects to ~25-30% of current values
2. **HP/Brain philosophy**:
   - Socializing with colleagues/girlfriend late → **hp:-small** (stayed up late) + **brain:+** (relaxation)
   - Colleague teaching tech skills → **brain:+** (learning), hp:0
   - Arguments/conflicts → **brain:-** (mental stress), hp:0
   - Dates that run late → **hp:-small** (late night), **brain:+** (happy)
   - Physical activities (sports, outings) → **hp:+** if daytime, **hp:-** if late night

### choice.json

Read through ALL events and apply:
1. Scale all `money` effects to ~25-30% of current
2. Fix HP/Brain per philosophy — check every event

### colleagues.json

Key fixes:
- Social events with 少爷/亿民 that currently give `hp:+` → change to `brain:+` (socializing = mental relaxation)
- Late night hangouts → `hp:-small` (up late) + `brain:+` (fun)
- Colleague teaching moments → `brain:+`, hp:0
- Conflicts/arguments → `brain:-`, hp:0
- Scale any money effects to 25-30%

### girlfriend.json

Key fixes:
- Dates → `hp:-small` (stayed out late) + `brain:+` (happy/relaxed), money scaled down
- Breakup/arguments → `brain:-large` (emotional devastation), `hp:-small`
- Gifts → money scaled down
- Weekend together → `hp:+` (rest) if daytime, `hp:-` if staying up late

### models.json

- Scale any money effects to 25-30%
- Model-related stress/excitement → brain effects only
- Late night model testing → hp:- (stayed up late)

## Acceptance Criteria

- [ ] All money values in all 4 files rescaled to 3000 baseline
- [ ] Socializing events follow pattern: late night=hp-, relaxation=brain+
- [ ] Conflicts/stress = brain drain, not hp
- [ ] Physical rest = hp recovery
- [ ] Valid JSON in all 4 files (no syntax errors)
