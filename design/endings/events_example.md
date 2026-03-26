# 🏆 结局系统 — 事件示例 (events_example)

> **已有的结局文本 JSON 示例。**

```jsonc
{
  "ending_ai_master": {
    "title": "🏆 AI 大师",
    "condition": { "bossSatisfy": ">80", "avg_quality": ">80" },
    "text": "年终大会上，老板念到了你的名字：'本年度最佳AI转型员工——康康！'\n\n你接过奖杯，想起年初那个只有豆包的自己。台下少爷鼓掌最响。\n\n年终奖拿了双份。明年，你将带领AI编程小组。",
    "coins": 150
  },
  "ending_rider": {
    "title": "🛵 外卖骑手",
    "text": "HR笑着递来一份协议：'感谢你的付出。这是N+1的赔偿。'\n\n你签了字，收拾了工位。三天后，你注册了美团骑手。第一单送的是你前公司点的下午茶。\n\n'您好，您的外卖到了。'",
    "coins": 30
  },
  "ending_doubao_god": {
    "title": "🐳 豆包之神",
    "condition": { "current_model": "=doubao", "avg_quality": ">75" },
    "text": "'你用的什么模型？' 同事不解地看着你的代码。\n\n'豆包。' 你平静地说。\n\n你的豆包使用技巧被写成了内部文档，流传在各个技术群里。人称'豆包之神'。",
    "coins": 130
  }
}
```
