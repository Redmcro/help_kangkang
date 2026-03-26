# 📚 做Flag事件链 (Add Flag Event Chains)

> ⏳ **Blocked**: Wait for 改选项提示·选择卷 to complete.

## Rules
See `.agents/AGENTS.md`

## Assigned Files
- `data/events/choice.json`
- `data/events/random.json`

## Required Reading
1. `design/_global/_schema.md` — event format + hint rules
2. `design/_global/attributes.md` — Flag registry (section 六)
3. `.agents/workflows/generate-events.md` — generation workflow

## Task
Create **2–3 follow-up events** for each of these 6 Flags:

| Flag | Follow-up Direction |
|:---|:---|
| `training_ai` | Advanced course invite, skill showcase |
| `signed_compete_clause` | Can't take recruiter offers, stock news |
| `opensource_fame` | Big company HR, conference invite |
| `attended_ai_conf` | Industry connections, collab projects |
| `built_ai_tool` | Company adopts tool, clients arrive |
| `tried_transfer` | Transfer result, new team stories |

**Rules:**
- Trigger: `"include": { "flag_name": true }`
- Descriptive hints, no numbers
- Register new Flags in `attributes.md`
- Be creative and fun

## Acceptance Criteria
- [ ] 2–3 events per Flag
- [ ] Correct `include` conditions
- [ ] Valid JSON, no numeric hints

## When Done
Report new event IDs + linked Flags. Wait for review.
