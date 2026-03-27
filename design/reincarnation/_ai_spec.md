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
  "events_seen": [],
  "achievements_unlocked": []
}
```

## 三、Buff 商店

> 每局只能携带 **最多 3 个** Buff。

| Buff | ID | 效果 | 花费 | 解锁条件 |
|:---|:---|:---|:---|:---|
| ☕ 咖啡成瘾 | `buff_coffee` | brain +15, hp -10 | 20 | 完成1局 |
| 💎 家里有矿 | `buff_trust_fund` | money +8000 | 40 | 获得任一胜利结局 |
| 🏕️ 极简生活 | `buff_minimalist` | living_cost -800（每月结算时生效） | 35 | "破产回家"结局 |
| 🧘 身体调理 | `buff_hp_regen` | hp_regen_rate +6（上月有连续加班则减半） | 35 | 完成1局 |
| 🦋 社交蝴蝶 | `buff_social_butterfly` | shaoye_rel +20, yimin_rel +20, gf_rel +10, charm +15 | 55 | "铁三角"结局 |
| 🐳 豆包大师 | `buff_doubao_master` | doubao_quality_bonus +20（仅作用于豆包质量） | 80 | "豆包之神"结局 |

## 四、字段与设计约束

1. Buff 数量固定为 6；每个 Buff 的 `cost` 必须 `> 0`。
2. `buff_doubao_master` 必须保留，且效果键固定为 `doubao_quality_bonus`。
3. `effect` 仅允许使用运行时已接入字段：`hp/money/brain/bossSatisfy/shaoye_rel/yimin_rel/gf_rel/charm/luck/hp_regen_rate/brain_regen_rate/living_cost/doubao_quality_bonus`。
4. 解锁条件文案必须与现有结局或完成局数挂钩，不允许引入未定义成就名。
