# 📚 Hanlin: Token Cleanup Rework (3 items)

## Task
Fix 3 issues missed in the first Token cleanup pass.

## Assigned Files
- `design/_global/attributes.md`
- `design/reincarnation/_ai_spec.md`
- `.agents/REPORTS.md`

## Required Reading
- `.agents/AGENTS.md`
- `js/property.js` (ground truth: salary=15000, living_cost=5000)

---

## Fix 1: `attributes.md` salary/living_cost values

Line 17-18 currently:
```
| 月薪 | `salary` | 10000 | 0–∞ | 💰 | 每月固定收入 |
| 生活开销 | `living_cost` | 3000 | 0–∞ | 💸 | 每月固定支出 |
```

Must be:
```
| 月薪 | `salary` | 15000 | 0–∞ | 💰 | 每月固定收入 |
| 生活开销 | `living_cost` | 5000 | 0–∞ | 💸 | 每月固定支出 |
```

## Fix 2: `reincarnation/_ai_spec.md` buff_token

Line 43: `buff_token` ID still contains "token". This is a code ID from `data/buffs.json` — check if the actual JSON uses this ID. If it does, leave the ID as-is (code reference) but change the display text:
```
| 💰 启动资金 | `buff_token` | money +1500 | 50 | 获得任一胜利结局 |
```
This is acceptable — `buff_token` is a code ID, not a Token reference. **No change needed if ID matches buffs.json.**

## Fix 3: File report in REPORTS.md

Add a report entry in `.agents/REPORTS.md` under `## Reports`:
```
[2026-03-26] 📚 Hanlin · Design Token Cleanup — ✅ Done (rework) — [summary of what was changed]
```

## Acceptance
- `attributes.md`: salary=15000, living_cost=5000
- Report filed in REPORTS.md
- 🚨 **Do NOT open any ports or browsers**
