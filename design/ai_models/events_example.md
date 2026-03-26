# 🤖 AI 模型系统 — 事件示例 (events_example)

> **已有的模型解锁事件 JSON 示例。**

```jsonc
{
  "model_unlock_doubao": {
    "month": [1, 1],
    "text": "你注册了豆包AI账号。免费的，能用就行。",
    "type": "good",
    "system": "model",
    "once": true,
    "effect": { "money": 500 },
    "setFlag": "model_doubao_unlocked"
  },
  "model_unlock_gpt54": {
    "month": [2, 2],
    "text": "GPT-5.4 正式发布！朋友圈被刷屏了。'代码能力提升300%'",
    "type": "special",
    "system": "model",
    "once": true,
    "effect": {},
    "setFlag": "model_gpt54_unlocked",
    "postEvent": "但订阅费也翻了一倍..."
  },
  "monthly_m3_opus_release": {
    "month": [3, 3],
    "text": "Anthropic 发布 Opus 4.6。代码圈炸了。'这才是真正的AI编程。'",
    "type": "special",
    "system": "model",
    "once": true,
    "effect": {},
    "setFlag": "model_opus46_unlocked",
    "postEvent": "API价格让你倒吸一口冷气。"
  }
}
```
