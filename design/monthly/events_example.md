# 📅 月份事件 — 事件示例 (events_example)

> **已有的月份大事件 JSON 示例。**

```jsonc
{
  "monthly_m1_ai_era": {
    "month": [1, 1],
    "text": "老板在全员大会上宣布：'公司将全面引入AI编程工具。一年后，无法适应的同事将被...优化。'",
    "type": "special",
    "system": "monthly",
    "once": true,
    "effect": { "brain": -5 },
    "postEvent": "会后，你打开了免费的豆包。'不要小瞧豆包哦...' 你对自己说。"
  },
  "monthly_m2_spring_festival": {
    "month": [2, 2],
    "text": "春节回家，亲戚们围在饭桌前。七大姑问：'听说程序员要被AI替代了？你还行吗？'",
    "type": "choice",
    "system": "monthly",
    "once": true,
    "title": "🧧 春节饭桌",
    "desc": "亲戚的灵魂拷问",
    "choices": [
      {
        "text": "😤 '我正在学AI，以后更值钱！'",
        "hint": "brain +5（自我激励）",
        "result": "亲戚们将信将疑，但你自己信了。",
        "effect": { "brain": 5 }
      },
      {
        "text": "😢 '确实挺难的...'",
        "hint": "hp -3（心情低落）",
        "result": "妈妈偷偷塞了你3000块钱。",
        "effect": { "hp": -3, "money": 3000 }
      },
      {
        "text": "🙃 '要不我去送外卖？风里来雨里去的。'",
        "hint": "全家沉默",
        "result": "爸爸放下了筷子。气氛凝固了。",
        "effect": { "hp": -5, "brain": -3 }
      }
    ]
  },
  "monthly_m8_review": {
    "month": [8, 8],
    "text": "半年度绩效评估。老板逐个叫去办公室谈话...",
    "type": "special",
    "system": "monthly",
    "once": true,
    "branch": [
      {
        "cond": { "bossSatisfy": ">70" },
        "text": "老板说：'你是今年转型最成功的员工之一。继续保持。'",
        "type": "good",
        "effect": { "money": 5000, "brain": 5, "bossSatisfy": 5 }
      },
      {
        "cond": { "bossSatisfy": ">50" },
        "text": "老板说：'还行，但还有提升空间。下半年加油。'",
        "type": "neutral",
        "effect": { "brain": 2 }
      },
      {
        "cond": {},
        "text": "老板直接说：'如果年底还是这样，你可能需要考虑其他方向了。'",
        "type": "bad",
        "effect": { "brain": -15, "hp": -10 }
      }
    ]
  }
}
```
