---
description: Generate game events using design MDs as context for AI content creation
---

# Generate Events Workflow

## Steps

1. **Read global context**
   // turbo
   Read `design/_global/_schema.md` + `design/_global/attributes.md`

2. **Read target system folder**
   | System | Design Folder |
   |:---|:---|
   | Colleagues | `design/colleagues/` |
   | Random | `design/random_events/` |
   | Choice | `design/choice_events/` |
   | Monthly | `design/monthly/` + `design/ai_models/_ai_spec.md` |
   | Daily | `design/daily_tasks/` |
   | Model | `design/ai_models/` |
   | Endings | `design/endings/` |
   | Buffs | `design/reincarnation/` |
   | Girlfriend | `design/girlfriend/` |
   | Life Expense | `design/life_expense/` |

   Each folder contains: `_ai_spec.md` (rules) · `settings.md` (ideas) · `events_example.md` (reference)

3. **Generate events**
   - ID format: `{system}_{desc}_{seq}`
   - Required fields: `month` [min, max], `text`, `type`, `system`
   - `system` must be: `general` / `colleague` / `monthly` / `random` / `choice` / `daily` / `model` / `girlfriend` / `life_expense`
   - Effect keys only from `attributes.md`
   - Single effect ±20 max
   - **Hints must be descriptive, NOT numeric**
   - Branch fallback (`cond: {}`) must be last
   - Choice events need `title` + `desc` + `choices`

4. **Validate**
   - [ ] `month`, `text`, `type`, `system` present
   - [ ] Effect keys valid · conditions formatted correctly (`">60"`)
   - [ ] IDs unique · no single effect exceeds ±20
   - [ ] New Flags registered in `attributes.md`

5. **Merge into target event file (strict mapping)**
   - `general` → `data/events/general.json`
   - `colleague` → `data/events/colleagues.json`
   - `monthly` → `data/events/monthly.json`
   - `random` → `data/events/random.json`
   - `choice` → `data/events/choice.json`
   - `daily` → `data/events/daily.json`
   - `model` → `data/events/models.json`
   - `girlfriend` → `data/events/girlfriend.json`
   - `life_expense` → `data/events/life_expense.json`
   - New system file → also add to `_manifest.json`
   - New Flags → update `attributes.md` registry

## ID Convention

```
colleague_shaoye_*  · colleague_yimin_*  · monthly_m{N}_*
random_good_*  · random_bad_*  · random_neutral_*
choice_*  · daily_*  · model_*  · general_*
```
