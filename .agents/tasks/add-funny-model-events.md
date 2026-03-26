# 📚 补AI模型搞笑事件 (Add Funny AI Model Events)

## Rules
See `.agents/AGENTS.md`

## Assigned Files
`data/events/models.json`

## Required Reading
1. `design/_global/_schema.md` — event format + hint rules
2. `design/_global/attributes.md` — attribute keys
3. `design/ai_models/settings.md` — model personalities
4. `design/ai_models/_ai_spec.md` — model system rules

## Task
Add **15–20 funny events** about AI model quirks and chaos.

**Humor directions (go wild):**
- 豆包 always saying "我不太确定" but code is perfect
- GPT-5.4 randomly switching to English mid-code
- Opus4.6 writing overly philosophical code comments
- DeepSeek generating code that works but nobody can read
- CheapGPT saving tokens by writing one-letter variable names
- FakeOpus pretending to be Opus but getting caught
- Model API billing surprises (token bill shock)
- AI arguing with itself in code comments
- Model switching mid-task and code style changes drastically
- AI writing passive-aggressive TODO comments

**Rules:**
- Use `system: "model"` for all events
- Mix types: good/bad/neutral + some with `branch` conditions
- Use `include` conditions where it makes sense (e.g. only if using specific model)
- Descriptive hints only, no numbers
- Be FUNNY — this is the comedy goldmine of the game

## Acceptance Criteria
- [ ] 15–20 new events
- [ ] Valid JSON, unique IDs (prefix: `model_`)
- [ ] No numeric hints
- [ ] Events are genuinely funny

## When Done
Report new event IDs. Wait for review.
