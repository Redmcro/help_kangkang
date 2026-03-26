# 📚 补新手事件 (Add Early-Game Events)

## Rules
See `.agents/AGENTS.md`

## Assigned Files
- `data/events/random.json`
- `data/events/general.json`

## Required Reading
1. `design/_global/_schema.md` — event format + hint rules
2. `design/_global/attributes.md` — attribute keys + Flag registry
3. `.agents/workflows/generate-events.md` — generation workflow
4. `design/*/settings.md` — creative inspiration

## Task
Add **15–20 events** with `month: [1, 3]` (early game).

**Themes (be creative):**
- First week: meeting colleagues, PC setup, getting badge
- First AI tool use — excitement or disaster
- Icebreakers, cafeteria, first-time slacking
- First requirement change mid-sprint

**Rules:**
- Month range must include month 1
- Descriptive hints only, no numbers
- No duplicate IDs
- Follow `_schema.md` strictly

## Acceptance Criteria
- [ ] 15–20 new events
- [ ] Month range includes 1
- [ ] Valid JSON, unique IDs
- [ ] No numeric hints

## When Done
Report new event IDs. Wait for review.
