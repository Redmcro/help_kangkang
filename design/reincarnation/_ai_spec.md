# 🔄 转世系统 — AI 规范 (_ai_spec)

> **本文件供 AI 阅读，定义转世系统（Roguelike 元素）的规则。**
> 必须同时阅读：`_global/attributes.md` + `endings/_ai_spec.md`

---

## 一、传世金币计算

```
base         = 存活月份 × 10
qualityBonus = floor(avg_quality / 10)
satisfyBonus = floor(bossSatisfy / 5)
endingBonus  = 结局奖励（见 endings/）

totalCoins   = base + qualityBonus + satisfyBonus + endingBonus
```

## 二、传世数据

```json
{
  "coins": 0,
  "best_month": 0,
  "runs": 0,
  "wins": 0,
  "endings_unlocked": [],
  "total_money_on_ai": 0,
  "total_bugs_fixed": 0
}
```

## 三、Buff 商店

> 每局只能携带 **最多 3 个** Buff。

| Buff | ID | 效果 | 花费 | 解锁条件 |
|:---|:---|:---|:---|:---|
| 🎓 学过Python | `buff_python` | brain +10 | 30 | 完成 1 局 |
| 💳 小有积蓄 | `buff_savings` | money +3000 | 50 | 累计赚 ≥ 50000 |
| 🏋️ 健身习惯 | `buff_fitness` | hp +15, 熬夜hp -30% | 40 | 某局 hp 未 < 50 |
| 🧠 过目不忘 | `buff_memory` | brain 衰减减半 | 60 | 某局 brain 未 < 60 |
| 💰 启动资金 | `buff_token` | money +1500 | 50 | 获得任一胜利结局 |
| 🐳 豆包皮肤 | `buff_doubao` | 豆包质量 +15 | 80 | "豆包之神"结局 |
| 🤝 人脉王 | `buff_social` | 初始关系 70 | 40 | "铁三角"结局 |
| ⚡ 内部推荐 | `buff_recommend` | bossSatisfy 初始 60 | 70 | "AI大师"结局 |
| 🍀 欧皇体质 | `buff_lucky` | 正面概率 +15% | 60 | 完成 5 局 |
| 🛡️ 工伤保险 | `buff_insurance` | 猝死阈值 hp≤-20 | 50 | "过劳猝死"结局 |

## 四、事件生成约束

1. 新 Buff 花费在 30~100 之间
2. 效果有趣但不过于强大
3. 解锁条件应与某个结局或游戏风格挂钩
