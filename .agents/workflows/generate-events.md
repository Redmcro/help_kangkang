---
description: Generate game events using design MDs as context for AI content creation
---

# Generate Events Workflow

This workflow generates game events for "帮助康康不被AI淘汰" by using the modular design system.

## Prerequisites
- The `design/` directory must contain all component MDs

## Steps

1. **Read the schema and attributes (mandatory context)**
   // turbo
   Read `design/_schema.md` and `design/attributes.md` to understand event format and available attributes.

2. **Identify the target system**
   Determine which system the events belong to. Read the corresponding MD:
   - Colleague events → read `design/colleagues.md`
   - Random events → read `design/random_events.md`
   - Choice events → read `design/choice_events.md`
   - Monthly events → read `design/monthly_events.md` + `design/ai_models.md`
   - New endings → read `design/endings.md`
   - New buffs → read `design/reincarnation.md`

3. **Generate events following the schema**
   Create events in valid JSON format that:
   - Have unique IDs following the naming convention: `{system}_{desc}_{seq}`
   - Include all required fields: `month`, `text`
   - Use only valid attribute keys from `attributes.md`
   - Have a `system` field matching the target system
   - Have reasonable effect values (single change ±20 max)
   - Choice events must have `title`, `desc`, and `choices`
   - Branch fallback (`cond: {}`) must be the last branch

4. **Validate the output**
   Check the generated JSON against this checklist:
   - [ ] All events have `month` (array of [min, max]) and `text`
   - [ ] All `effect` keys exist in `attributes.md`
   - [ ] Condition format is correct (`">60"` not `"60"`)
   - [ ] `type` is one of: good, bad, special, choice, neutral, money
   - [ ] Choice events have `title` + `desc` + `choices`
   - [ ] Branch fallback with empty `cond` is last
   - [ ] Event IDs are unique and follow naming convention
   - [ ] Values are balanced (no ±50 single effects)

5. **Merge into events.json**
   Merge the validated events into `data/events.json`.
   Ensure no ID conflicts with existing events.

## Event ID Naming Convention

```
{system}_{description}_{sequence_number}

Systems:
  colleague_shaoye_*    — 少爷相关
  colleague_yimin_*     — 亿民相关
  monthly_m{N}_*        — N月事件
  random_good_*         — 正面随机
  random_bad_*          — 负面随机
  random_neutral_*      — 中性随机
  choice_*              — 选择事件
  daily_*               — 每日任务
  model_*               — 模型相关
```
