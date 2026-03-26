# 🎭 选择事件 — 事件示例 (events_example)

> **已有的选择事件 JSON 示例。**

```jsonc
{
  "choice_overtime_voluntary_01": {
    "month": [1, 12],
    "text": "下班时间到了，但项目还差一点。老板看了你一眼。",
    "type": "choice",
    "system": "choice",
    "title": "🕐 要不要主动加班？",
    "desc": "留下加班还是按时走？",
    "choices": [
      {
        "text": "💪 留下加班",
        "hint": "满意度+2, hp -5",
        "result": "又在公司待到10点。走出大楼时，路上已经没什么人了。",
        "effect": { "bossSatisfy": 2, "hp": -5, "brain": -3 }
      },
      {
        "text": "🚶 按时下班",
        "hint": "hp +2（休息好）",
        "result": "你合上电脑，背起书包。明天的事明天再说。",
        "effect": { "hp": 2, "brain": 2 }
      },
      {
        "text": "☕ 摸鱼到8点再走",
        "hint": "看起来加班了，实际摸鱼",
        "chanceBased": true,
        "branches": [
          { "chance": 70, "result": "老板走的时候看到你还在，点了点头。完美。", "type": "good", "effect": { "bossSatisfy": 1 } },
          { "chance": 30, "result": "老板路过看到你在刷B站...", "type": "bad", "effect": { "bossSatisfy": -3 } }
        ]
      }
    ]
  },
  "choice_ai_budget_01": {
    "month": [3, 10],
    "text": "某AI平台搞活动：年费会员五折优惠！限时24小时！",
    "type": "choice",
    "system": "choice",
    "once": true,
    "title": "🎉 AI 会员促销！",
    "desc": "手头有点紧，但这个优惠确实诱人...",
    "choices": [
      {
        "text": "💰 冲它！买年费会员",
        "hint": "长期省钱，短期肉疼",
        "result": "以后每月AI费用省不少！",
        "effect": { "money": -3000, "brain": 5 }
      },
      {
        "text": "🤏 买个季度会员试试",
        "hint": "小投入，试试水",
        "result": "聊胜于无，先用着。",
        "effect": { "money": -800, "brain": 2 }
      },
      {
        "text": "😤 不买，告诫自己省着用",
        "hint": "省钱，但得精打细算",
        "result": "你关掉了广告页面。钱还是留着交房租吧。",
        "effect": { "brain": 3 }
      }
    ]
  }
}
```
