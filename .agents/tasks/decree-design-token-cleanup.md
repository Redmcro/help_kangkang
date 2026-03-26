# 📚 Hanlin: Design Files Token Cleanup

## Task
Purge ALL remaining Token references from design docs + fix salary/living_cost mismatch.

## Assigned Files
- `design/_global/attributes.md`
- `design/_global/ui_style.md`
- `design/ai_models/_ai_spec.md`
- `design/ai_models/events_example.md`
- `design/economy/_ai_spec.md`
- `design/economy/settings.md`
- `design/choice_events/events_example.md`
- `design/choice_events/settings.md`
- `design/monthly/_ai_spec.md`
- `design/monthly/settings.md`
- `design/daily_tasks/_ai_spec.md`
- `design/reincarnation/_ai_spec.md`
- `design/README.md`

## Required Reading
- `.agents/AGENTS.md`
- `design/GAME_DESIGN.md` (reference for correct values)
- `js/property.js` (ground truth for initial values)

---

## Changes

### 1. Fix `attributes.md` salary/living_cost (P1)

Line 17-18 currently says:
```
| 月薪 | `salary` | 10000 | ...
| 生活开销 | `living_cost` | 3000 | ...
```

Must match `property.js` and `GAME_DESIGN.md`:
```
| 月薪 | `salary` | 15000 | ...
| 生活开销 | `living_cost` | 5000 | ...
```

### 2. Fix `attributes.md` stale Token flags

- `yimin_token_discount` → `yimin_cost_discount`, desc: "AI使用费打8折"
- `switched_to_doubao` desc: "Token告急切豆包" → "余额不足切豆包"

### 3. Purge Token from all other design files (P3)

For EACH file listed above, find and replace Token references:
- "Token消耗" → "任务消耗" or "费用"
- "Token" pricing/shop → model usage cost (¥/M)
- "不消耗Token" → "不消耗费用"
- `"token": N` in example JSON → `"money": -N` (calculate from tokenPrice)
- "Token青" color → "模型费" or remove
- "Token" UI layout → remove or replace
- "total_tokens_spent" → "total_ai_cost"
- `buff_token` desc: "token +500M" → "money +1500"
- "管理Token和脑力" → "管理金钱和脑力"

### 4. Remove commented-out Token lines

- `monthly/settings.md` line 31: `<!-- - 6月：618大促 Token打折 -->` → delete or rewrite
- `economy/settings.md` line 13: `<!-- - 想调整Token价格 -->` → delete

## Acceptance
- `grep -ri "token" design/` returns ONLY:
  - `GAME_DESIGN.md` line 351 (the "注意：不再有Token" notice) — this is OK
  - `ARCHITECTURE.md` (historical changelog) — this is OK
  - `VERIFICATION_LOG.md` (historical log) — this is OK
- All other hits = 0
- `attributes.md` salary=15000, living_cost=5000
- Valid markdown throughout
- 🚨 **Do NOT open any ports or browsers**
