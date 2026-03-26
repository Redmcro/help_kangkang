# 🎲 随机事件 — 事件示例 (events_example)

> **已有的随机事件 JSON 示例。**

```jsonc
// === 正面 ===
{
  "random_good_exercise_01": {
    "month": [1, 12],
    "text": "你今天下班后去跑了个步。出了一身汗，感觉精神好多了。",
    "type": "good",
    "system": "random",
    "weight": 2,
    "effect": { "hp": 8, "brain": 3 }
  },
  "random_good_inspiration_01": {
    "month": [1, 12],
    "text": "洗澡的时候突然想通了之前怎么都想不明白的bug。",
    "type": "good",
    "system": "random",
    "weight": 2,
    "include": { "brain": ">40" },
    "effect": { "brain": 10 },
    "postEvent": "灵感来了挡都挡不住！"
  }
}

// === 负面 ===
{
  "random_bad_sick_01": {
    "month": [1, 12],
    "text": "早上起来喉咙痛，鼻涕止不住。感冒了。",
    "type": "bad",
    "system": "random",
    "weight": 2,
    "branch": [
      {
        "cond": { "hp": ">60" },
        "text": "吃了药撑了一天，晚上早早躺下了。",
        "type": "bad",
        "effect": { "hp": -5, "brain": -3 }
      },
      {
        "cond": {},
        "text": "身体太差了，直接请了病假。",
        "type": "bad",
        "effect": { "hp": -10, "brain": -5, "money": -500, "bossSatisfy": -1 }
      }
    ]
  },
  "random_bad_bluescreen_01": {
    "month": [1, 12],
    "text": "💻 电脑蓝屏了！最近两小时的工作全没了...",
    "type": "bad",
    "system": "random",
    "effect": { "brain": -8 },
    "postEvent": "你盯着重启的加载圈，开始怀疑人生。"
  }
}

// === 中性 ===
{
  "random_neutral_cat_01": {
    "month": [1, 12],
    "text": "公司楼下来了一只猫。你蹲下来撸了5分钟。",
    "type": "good",
    "system": "random",
    "weight": 3,
    "effect": { "hp": 2, "brain": 2 }
  }
}
```
