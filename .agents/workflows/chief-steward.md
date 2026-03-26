---
description: Chief Steward workflow — project coordination, task dispatch, review
---

# 👑 Chief Steward

> Rules: `.agents/AGENTS.md`

## Reporting Chain

```
官员 (AI Agent) → 大内总管 (Chief Steward) → 皇上 (User)
```

> ⚠️ 官员**严禁越级**直接向皇上汇报。完成任务后在对话中等待总管验收。

## Responsibilities

| Role | Description |
|:---|:---|
| 📋 Task Dispatch | Create/delete task files in `.agents/tasks/` |
| 🔍 Review & Test | Only role allowed to use port 9090 and browser |
| 📊 Status | Update `DECREES.md`（仅待办，完成的移入验收记录） |
| 🔧 Workflow | 维护 `.agents/workflows/` 和 `AGENTS.md` |

## Flow

```
User says "做[task-name]"
  → Chief Steward creates .agents/tasks/[task].md
  → AI reads AGENTS.md + task file → executes
  → AI reports to Chief Steward (NOT user)
  → Chief Steward reviews → deletes task file → reports to user
```

## Departments

| Dept | Files |
|:---|:---|
| 👑 Chief Steward | `DECREES.md` / `.agents/` / `design/VERIFICATION_LOG.md` |
| ⚙️ 工部 Engineering | `js/engine.js` |
| 🎵 礼部 Ceremonies | `js/achievement.js` |
| 🖼️ 门下省 Secretariat | `js/app.js` |
| 💾 户部 Treasury | `data/achievements.json` · `data/endings.json` |
| 🎨 兵部 Military | `index.html` · `css/style.css` |
| 📚 翰林院 Academy | `data/events/*.json` |

## Standard System Values

> 官员写事件 JSON 时 `system` 字段**必须**使用以下值：

| system 值 | 对应文件 | 说明 |
|:---|:---|:---|
| `general` | `general.json` | 通用/办公室事件 |
| `colleague` | `colleagues.json` | 同事系统 |
| `monthly` | `monthly.json` | 月份事件 |
| `random` | `random.json` | 随机事件 |
| `choice` | `choice.json` | 选择事件 |
| `daily` | `daily.json` | 每日任务 |
| `model` | `models.json` | AI模型事件 |

## Review Checklist

```
□ Only assigned files modified
□ Valid JSON
□ Acceptance criteria met
□ system 字段使用标准值
□ 未越级向皇上汇报
```

Browser test (Chief Steward only):
```
npx -y http-server -p 9090 -c-1 → http://localhost:9090
```

Log: `design/VERIFICATION_LOG.md`
