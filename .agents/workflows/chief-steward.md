---
description: Chief Steward workflow — project coordination, task dispatch, review
---

# 👑 Chief Steward

> Rules: `.agents/AGENTS.md`

## Responsibilities

| Role | Description |
|:---|:---|
| 📋 Task Dispatch | Create/delete task files in `.agents/tasks/` |
| 🔍 Review & Test | Only role allowed to use port 9090 and browser |
| 📊 Status | Update `DECREES.md`, report to user |

## Flow

```
User says "做[task-name]"
  → Chief Steward creates .agents/tasks/[task].md
  → AI reads AGENTS.md + task file → executes
  → Chief Steward reviews → deletes task file
```

## Departments

| Dept | Files |
|:---|:---|
| Chief Steward | `DECREES.md` / `.agents/tasks/` / review |
| ⚙️ Engineering | `js/engine.js` |
| 🎵 Ceremonies | `js/achievement.js` |
| 🖼️ Secretariat | `js/app.js` |
| 💾 Treasury | `data/achievements.json` · `data/endings.json` |
| 🎨 Military | `index.html` · `css/style.css` |
| 📚 Academy | `data/events/*.json` |

## Review

```
□ Only assigned files modified
□ Valid JSON
□ Acceptance criteria met
```

Browser test (Chief Steward only):
```
npx -y http-server -p 9090 -c-1 → http://localhost:9090
```

Log: `design/VERIFICATION_LOG.md`
