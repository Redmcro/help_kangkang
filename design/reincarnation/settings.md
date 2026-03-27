# 🔄 转世系统 — 实装同步设定

> 本文件用于同步当前转世 Buff 池的固定口径，供后续事件与数值调优直接引用。

---

## 一、Buff 池（固定 6 项）

> 每局最多携带 3 个 Buff；所有 Buff 花费必须大于 0。

| Buff | ID | 花费 | 效果 | 解锁条件 |
|:---|:---|:---|:---|:---|
| ☕ 咖啡成瘾 | `buff_coffee` | 20 | `brain +15`, `hp -10` | 完成1局 |
| 💎 家里有矿 | `buff_trust_fund` | 40 | `money +8000` | 获得任一胜利结局 |
| 🏕️ 极简生活 | `buff_minimalist` | 35 | `living_cost -800` | 破产回家结局 |
| 🧘 身体调理 | `buff_hp_regen` | 35 | `hp_regen_rate +6` | 完成1局 |
| 🦋 社交蝴蝶 | `buff_social_butterfly` | 55 | `shaoye_rel +20`, `yimin_rel +20`, `gf_rel +10`, `charm +15` | 铁三角结局 |
| 🐳 豆包大师 | `buff_doubao_master` | 80 | `doubao_quality_bonus +20` | 豆包之神结局 |

---

## 二、字段约束（必须遵守）

1. Buff `effect` 只能使用运行时已实现字段，禁止新增未接线键名。
2. `buff_doubao_master` 必须保留，且效果键只能是 `doubao_quality_bonus`。
3. 设计文档中的 Buff 信息必须与 `data/buffs.json` 保持一一对应：ID/名称/花费/效果/解锁条件不可漂移。

---

## 三、调优优先级（围绕 40% 通关率）

1. 优先保证前 3 月可存活性，避免“首局连续破产”直接劝退。
2. 恢复型 Buff 与恢复事件应形成互补，不允许出现“买了恢复 Buff 仍无恢复窗口”的断档。
3. 社交向 Buff 必须有明确中期收益反馈，避免只在结局前才体现价值。
4. 豆包专精路线要有可预测的成长路径，不能只靠随机高光支撑。
