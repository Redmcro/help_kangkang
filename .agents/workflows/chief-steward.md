---
description: Chief Steward workflow — project coordination, task dispatch, review
---

# 👑 Chief Steward

> Rules: `.agents/AGENTS.md` · Log: `design/VERIFICATION_LOG.md`

## Chain of Command

```
官员 → 大内总管 → 皇上    （严禁越级）
```

## Flow

```
皇上: "做[task]"
  → 总管 creates .agents/tasks/[task].md
  → 官员 reads AGENTS.md + task → executes → reports to 总管
  → 总管 reviews → deletes task → reports to 皇上
```

## Departments

| Dept | Files |
|:---|:---|
| 👑 总管 | `DECREES.md` · `.agents/` · `VERIFICATION_LOG.md` |
| ⚙️ 工部 | `js/engine.js` |
| 🎵 礼部 | `js/achievement.js` |
| 🖼️ 门下省 | `js/app.js` |
| 💾 户部 | `data/achievements.json` · `data/endings.json` |
| 🎨 兵部 | `index.html` · `css/style.css` |
| 📚 翰林院 | `data/events/*.json` |

## Standard `system` Values

| 值 | 文件 |
|:---|:---|
| `general` | `general.json` |
| `colleague` | `colleagues.json` |
| `monthly` | `monthly.json` |
| `random` | `random.json` |
| `choice` | `choice.json` |
| `daily` | `daily.json` |
| `model` | `models.json` |

## Review Checklist

- Only assigned files modified
- Valid JSON · system 标准值
- Acceptance criteria met
- 未越级

## Browser Test (总管 only)

```
npx -y http-server -p 9090 -c-1
```
