# 💻 每日任务 — 事件示例 (events_example)

> **已有的每日任务事件 JSON 示例。**

```jsonc
{
  "daily_task_simple_ui_01": {
    "month": [1, 12],
    "text": "📋 今日任务：调整游戏主菜单的按钮布局",
    "type": "neutral",
    "system": "daily",
    "filler": true,
    "effect": {}
  },
  "daily_moonlight_01": {
    "month": [2, 12],
    "text": "朋友介绍了个小项目：帮独立开发者做个UI界面。",
    "type": "choice",
    "system": "daily",
    "title": "💼 接私活？",
    "desc": "赚点外快，但分散精力。",
    "choices": [
      {
        "text": "💰 接！给钱就干",
        "hint": "money +2000, 但可能被发现",
        "chanceBased": true,
        "branches": [
          { "chance": 70, "result": "顺利完成，私活钱到手！", "type": "good", "effect": { "money": 2000 } },
          { "chance": 30, "result": "被组长看到了...", "type": "bad", "effect": { "money": 2000, "bossSatisfy": -5 } }
        ]
      },
      {
        "text": "🚫 不接，专注本职",
        "hint": "brain +2",
        "result": "你关掉了聊天窗口，回到了Unity编辑器。",
        "effect": { "brain": 2 }
      }
    ]
  }
}
```
