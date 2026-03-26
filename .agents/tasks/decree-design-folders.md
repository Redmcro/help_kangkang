# 📚 Hanlin: Create girlfriend + life_expense Design Folders

## Task
Create design folders for the `girlfriend` and `life_expense` systems so `/generate-events` can work with them.

## Assigned Files
- `design/girlfriend/_ai_spec.md` [NEW]
- `design/girlfriend/settings.md` [NEW]
- `design/girlfriend/events_example.md` [NEW]
- `design/life_expense/_ai_spec.md` [NEW]
- `design/life_expense/settings.md` [NEW]
- `design/life_expense/events_example.md` [NEW]
- `design/README.md` (add 2 rows to system index table)

## Required Reading
- `.agents/AGENTS.md`
- `design/_global/_schema.md` (format rules)
- `design/_global/attributes.md` (girlfriend flags §七, life_expense flags §七)
- `data/events/girlfriend.json` (extract 2-3 examples for events_example.md)
- `data/events/life_expense.json` (extract 2-3 examples for events_example.md)
- `design/colleagues/` (reference for folder structure)

---

## girlfriend/ folder

### _ai_spec.md
Write rules and constraints for the girlfriend event system:
- system value: `girlfriend`
- Attributes: `gf_rel` (0-100), `has_girlfriend` (bool), `married` (bool)
- Key mechanics: gf_rel ≤0 → breakup (irreversible), gf_rel ≥90 + money ≥30000 → can propose
- Event types: dates, arguments, gifts, meeting parents, proposal, wedding, breakup
- Registered flags from `attributes.md`: `met_gf_parents`, `gf_breakup_warning`, `gf_broke_up`, `gf_engaged`, `gf_married`, `has_dog`
- Balance: single effect ±20 max, gf_rel changes ±3~15

### settings.md
Write brief character/setting notes:
- Girlfriend personality and preferences (infer from existing events in girlfriend.json)
- Relationship milestones
- Leave room for user to add ideas

### events_example.md
Extract 2-3 representative events from `data/events/girlfriend.json`:
- One simple event (date/gift)
- One choice event (argument/breakup crisis)
- One branch event (conditional outcome)

---

## life_expense/ folder

### _ai_spec.md
Write rules and constraints for the life expense event system:
- system value: `life_expense`
- Core mechanic: random life costs that drain money (rent, food, medical, shopping, social)
- Attribute: mainly affects `money`, sometimes `hp`, `brain`, `charm`
- Registered flags from `attributes.md`: `has_pet_cat`
- Balance: expense range ¥500~¥5000, single effect ±20 max

### settings.md
Write brief setting notes:
- Categories: housing, food, health, social, shopping, pets, holidays
- Seasonal events (Double 11, Spring Festival, etc.)
- Leave room for user ideas

### events_example.md
Extract 2-3 representative events from `data/events/life_expense.json`:
- One simple expense event
- One choice event
- One branch event

---

## Update design/README.md

Add 2 rows to the system index table (after 🔄 转世系统):

```markdown
| 💕 女朋友 | `girlfriend/` | ✅ | 约会、吵架、求婚、结婚、分手事件 |
| 💸 生活开销 | `life_expense/` | ✅ | 房租、聚餐、医疗、购物等随机开销 |
```

## Acceptance
- 6 new files created (3 per system)
- Each `_ai_spec.md` covers: system value, attributes, flags, mechanics, balance
- Each `events_example.md` has 2-3 real examples from existing JSON
- `design/README.md` table updated with 2 new rows
- Valid markdown
- 🚨 **Do NOT open any ports or browsers**
