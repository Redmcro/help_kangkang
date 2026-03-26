# T2 📚 Hanlin — Event Data Fixes & Expansion

## Assigned Files
- `data/events/general.json`
- `data/events/monthly.json`
- `data/events/girlfriend.json`
- `data/events/life_expense.json`
- `data/events/daily.json`
- `data/events/colleagues.json`
- `data/events/choice.json`
- `data/events/random.json`

## Task 1: Fix Doubao Cost Bug (Issue #1)

### Problem
Doubao (豆包) is free (tokenPrice: 0), but several choice events where the player uses Doubao/AI have `"money": -30` in their effect. This is wrong — using Doubao should not cost money.

### Fix
Remove or change `"money": -30` from ALL choices where the player uses Doubao/AI for non-commercial purposes in these events:

In `monthly.json`:
- `monthly_m1_ai_pledge_v1` → choice "用豆包帮你写" branches: remove `"money": -30` from both branches
- `monthly_m1_ai_pledge_v2` → choice "让豆包帮你写" branches: remove `"money": -30` from both branches
- `monthly_m1_ai_pledge_v3` → choice "写个脚本自动生成日志" branches: remove `"money": -30` from both branches
- `monthly_m1_ai_pledge_v4` → choice "用AI把模板自动填了" branches: remove `"money": -30` from both branches

**Note**: The text mentions 豆包 specifically, and 豆包 is free. The `-30` makes no sense here.

In `monthly.json` also check:
- `monthly_m5_tech_share` → choice "让AI帮忙写" branches have `"money": -60` — this is ok because by month 5 the player might be using paid models, and the event says "AI" not specifically 豆包

## Task 2: Expand Month 1 Opening Events (Issue #5)

### Problem
Too few events trigger in month 1. Current month 1 events in general.json are mostly `once: true` and spread across days 1-3. Need more variety.

### Add to `general.json` — at least 6 new month-1 events:

**Requirements:**
- `"month": [1, 1]` or `[1, 2]` for early month
- Mix of `once: true` and repeatable fillers
- Include postEvent when possible for humor
- Maintain existing JSON key naming: `general_new_xxx_01`

**Suggested events (implement at least 6):**

1. First standup meeting — branch on brain
2. Company lunch — first time eating at company cafeteria, discovering it's terrible
3. First 1-on-1 with manager — awkward conversation about "growth plan"
4. Meeting the tea lady — she knows everything about everyone
5. First time using the company's internal tool — it's from 2015
6. Fire drill —康康 doesn't know the exit routes
7. Getting lost in the building — the office is a maze
8. First group lunch with the team — ordering food politics
9. IT setup issues — something always goes wrong on day 1
10. Finding the best bathroom — crucial office knowledge

Each event should have:
- Engaging text (2-3 sentences, Chinese, humorous tone)
- Appropriate effects (small, balanced)
- PostEvent humor where fitting
- Some with branches based on stats (brain, charm, etc.)

## Task 3: Ensure 3-5 Choice Events Per Month (Issue #6)

### Problem
Some months lack enough choice (button) events. Every month should have at least 3-5 available choice events.

### Analysis of current choice coverage by month:
- Month 1: 4 AI pledge variants (only 1 fires due to once) + weekend choice + coffee choice → OK but tight
- Month 2: valentine, training budget, coffee, AI course, standup → OK
- Month 3: model anxiety, token shortage, freelance, tech debate → OK
- Month 4: survival choice (conditional on low boss), remote work, option plan → NEEDS MORE (survival is conditional)
- Month 5: tech share, open source, AI conference, fakeopus → OK
- Month 6: deadline push, 618 token sale, savings talk, raise negotiation → OK
- Month 7: blackout, temp file mystery → NEEDS MORE
- Month 8: deep night awakening, anniversary, age crisis → OK
- Month 9: gamejam, CNCF invite → NEEDS MORE (gamejam is the main one)
- Month 10: national day, AI replacement → NEEDS MORE choice events
- Month 11: last chance sprint, bonus rumor → NEEDS MORE
- Month 12: farewell events only → NEEDS MORE

### Add new choice events (at least 10 total across weak months):

Target files: `general.json`, `monthly.json`, `choice.json` (any event file is fine as long as it has proper month ranges)

**Month 4 additions (2 events):**
- Overtime culture confrontation (everybody staying late, do you join or leave?)
- Company outing/retreat — go or skip?

**Month 7 additions (2 events):**
- Summer intern challenges you to a coding contest
- Air conditioning thermostat war escalates — HR mediates

**Month 9 additions (2 events):**
- Company anniversary — participate in talent show or hide?
- Tech blog post — write one or AI it?

**Month 10-11 additions (2 events):**
- Double 11 shopping — resist or splurge on work gear?
- Year-end review prep — how to present your AI achievements?

**Month 12 additions (2 events):**
- Secret Santa gift exchange
- New Year's resolution — what to focus on next year?

**Requirements for each new choice event:**
- `"type": "choice"` with 2-3 choices each
- Include `"title"` and `"desc"` fields
- Use `"once": true` for story events
- Include meaningful effects with trade-offs
- Chinese text, humorous but relatable
- Some choices should use `chanceBased` with branches
- Some should use `require` for skill checks
- Proper month ranges that don't overlap too much with existing events

## Acceptance Criteria
1. No more `money: -30` on Doubao-specific choices
2. At least 6 new month-1 events added
3. Every month (1-12) has at least 3 available choice-type events in the pool
4. All JSON is valid (no syntax errors)
5. All events follow existing naming conventions and data structure
6. Effects are balanced (no single event gives more than ±15 to any stat)
