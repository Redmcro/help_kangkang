# 📚 补每日任务好事件 (Add Funny Daily Events)

## Rules
See `.agents/AGENTS.md`

## Assigned Files
`data/events/daily.json`

## Required Reading
1. `design/_global/_schema.md` — event format + hint rules
2. `design/_global/attributes.md` — attribute keys
3. `design/daily_tasks/_ai_spec.md` — daily task rules
4. `design/daily_tasks/settings.md` — task ideas

## Task
Add **10–15 funny daily events**, focusing on GOOD and NEUTRAL types (currently 0 good events in daily).

**Humor directions:**
- Code accidentally works on first try —康康 doesn't trust it
- Copy-pasted Stack Overflow answer works perfectly
- Bug fix that reveals another bug that cancels out the first
- AI writes better commit messages than 康康
- PR gets approved without any comments (suspicious)
- Test coverage somehow at 100% — nobody knows how
- Code review finds that the "bug" is actually a feature
- Rubber duck debugging actually works (duck starts judging)
- Running tests: 99 pass, 1 fail — the fail is the test itself
- Accidentally push to main, but the code is actually better

**Rules:**
- Mix good/neutral/bad types — but lean towards **good and neutral** (fix the imbalance)
- Some should have `branch` conditions for humor
- Descriptive hints only
- Must be work-day related (coding, debugging, PRs, meetings)

## Acceptance Criteria
- [ ] 10–15 new events
- [ ] Valid JSON, unique IDs (prefix: `daily_`)
- [ ] Contains good-type events (fixing current 0 count)
- [ ] No numeric hints

## When Done
Report new event IDs. Wait for review.
