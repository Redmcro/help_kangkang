# 🔄 转世系统 (reincarnation)

> **Roguelike 元素：传世金币 + Buff 商店。**
> 依赖：`attributes.md`（初始属性修改）| `endings.md`（金币奖励）

---

## 一、传世金币计算

每局结束后获得金币：

```
base        = 存活月份 × 10                    // 活得越久越多
qualityBonus = floor(avg_quality / 10)          // 代码写得好加分
satisfyBonus = floor(bossSatisfy / 5)           // 老板满意加分
endingBonus  = 结局奖励（见 endings.md）         // 结局决定大头

totalCoins   = base + qualityBonus + satisfyBonus + endingBonus
```

### 结局金币一览

| 结局 | 金币 |
|:---|:---|
| 🏆 AI 大师 | 150 |
| 🐳 豆包之神 | 130 |
| 🎮 独立开发者 | 120 |
| 🧘 禅意程序员 | 100 |
| 🤝 铁三角 | 100 |
| ✅ 安稳过关 | 80 |
| 🤖 成为AI的形状 | 50 |
| 🛵 外卖骑手 | 30 |
| 💀 过劳猝死 | 20 |
| 😵 精神崩溃 | 20 |
| 💸 破产回家 | 10 |

---

## 二、传世数据

```json
{
  "coins": 0,
  "best_month": 0,
  "runs": 0,
  "wins": 0,
  "endings_unlocked": [],
  "total_tokens_spent": 0,
  "total_bugs_fixed": 0
}
```

---

## 三、Buff 商店

> 开局前用传世金币购买 Buff，每局只能携带 **最多 3 个**。

| Buff | ID | 效果 | 花费 | 解锁条件 |
|:---|:---|:---|:---|:---|
| 🎓 学过Python | `buff_python` | brain +10 | 30 | 完成 1 局 |
| 💳 小有积蓄 | `buff_savings` | money +3000 | 50 | 累计赚 ≥ 50000 |
| 🏋️ 健身习惯 | `buff_fitness` | hp +15, 熬夜hp消耗 -30% | 40 | 某局 hp 从未 < 50 |
| 🧠 过目不忘 | `buff_memory` | brain 衰减减半 | 60 | 某局 brain 从未 < 60 |
| 💰 Token 礼包 | `buff_token` | token +500M | 50 | 获得任一胜利结局 |
| 🐳 豆包皮肤 | `buff_doubao` | 豆包质量基础 +15 | 80 | 触发"豆包之神"结局 |
| 🤝 人脉王 | `buff_social` | 少爷/亿民初始关系 70 | 40 | 触发"铁三角"结局 |
| ⚡ 内部推荐 | `buff_recommend` | bossSatisfy 初始 60 | 70 | 触发"AI大师"结局 |
| 🍀 欧皇体质 | `buff_lucky` | 所有概率事件正面 +15% | 60 | 完成 5 局 |
| 🛡️ 工伤保险 | `buff_insurance` | 猝死阈值从 hp≤0 变为 hp≤-20 | 50 | 触发"过劳猝死"结局 |

---

## 四、添加新 Buff

```jsonc
{
  "id": "buff_xxx",
  "icon": "🔮",
  "name": "名称",
  "desc": "效果描述",
  "cost": 50,
  "effect": { "brain": 10 },
  "unlock": "解锁条件描述"
}
```

### 给 AI 的 Prompt

```
请阅读 `reincarnation.md` 和 `endings.md`。

请设计 3 个新的转世Buff：
- 每个需要特定解锁条件（跟某个结局或某种游戏风格挂钩）
- 效果要有趣但不能过于强大（参考现有Buff数值）
- 花费在 30~100 之间
```
