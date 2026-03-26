---
description: Generate game events using design MDs as context for AI content creation
---

# Generate Events Workflow

This workflow generates game events for "帮助康康不被AI淘汰" by using the modular design system.

## Prerequisites
- The `design/` directory must contain all system subdirectories

## Steps

1. **Read the global context (mandatory)**
   // turbo
   Read `design/_global/_schema.md` and `design/_global/attributes.md` to understand event format, available attributes, and the Flag registry.

2. **Identify the target system**
   Determine which system the events belong to. Read ALL files in the target system folder:
   - Colleague events → read all files in `design/colleagues/`
   - Random events → read all files in `design/random_events/`
   - Choice events → read all files in `design/choice_events/`
   - Monthly events → read all files in `design/monthly/` + `design/ai_models/_ai_spec.md`
   - New endings → read all files in `design/endings/`
   - New buffs → read all files in `design/reincarnation/`
   - Daily tasks → read all files in `design/daily_tasks/`
   - Model events → read all files in `design/ai_models/`

   In each system folder, read:
   - `_ai_spec.md` — System rules and constraints
   - `settings.md` — Human-written settings and ideas (THIS IS THE KEY INPUT)
   - `events_example.md` — Existing event JSON examples for reference

3. **Generate events following the schema**
   Create events in valid JSON format that:
   - Have unique IDs following the naming convention: `{system}_{desc}_{seq}`
   - Include all required fields: `month`, `text`
   - Use only valid attribute keys from `_global/attributes.md`
   - Have a `system` field matching the target system
   - Have reasonable effect values (single change ±20 max)
   - Choice events must have `title`, `desc`, and `choices`
   - Branch fallback (`cond: {}`) must be the last branch
   - **IMPORTANT**: Incorporate the settings from `settings.md` into the generated events

4. **Validate the output**
   Check the generated JSON against this checklist:
   - [ ] All events have `month` (array of [min, max]) and `text`
   - [ ] All `effect` keys exist in `_global/attributes.md`
   - [ ] Condition format is correct (`">60"` not `"60"`)
   - [ ] `type` is one of: good, bad, special, choice, neutral, money
   - [ ] Choice events have `title` + `desc` + `choices`
   - [ ] Branch fallback with empty `cond` is last
   - [ ] Event IDs are unique and follow naming convention
   - [ ] Values are balanced (no ±50 single effects)
   - [ ] New Flags are registered in `_global/attributes.md` Flag registry

5. **Merge into the system's event file**
   Write or merge the validated events into `data/events/{system_key}.json`.
   - If the file already exists, merge the new events into it (no duplicate IDs).
   - If the file is new, also add `"{system_key}"` to `data/events/_manifest.json`.
   - If any new Flags were created via `setFlag`, update `_global/attributes.md` Flag registry.

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
