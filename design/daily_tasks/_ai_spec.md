# 💻 每日任务 — AI 规范 (_ai_spec)

> **本文件供 AI 阅读，定义每日任务系统的规则。**
> 必须同时阅读：`_global/_schema.md` + `_global/attributes.md`

---

## 一、任务类型

| 类型 | 复杂度 | 图标 | 消耗级别 | 举例 |
|:---|:---|:---|:---|:---|
| 简单 UI | ⭐ | 🎨 | M级 | 改按钮颜色、调文字排版 |
| 功能模块 | ⭐⭐ | 🔧 | M级 | 背包排序、音量设置 |
| 系统开发 | ⭐⭐⭐ | ⚙️ | 大M级 | 对话系统、任务系统 |
| 复杂架构 | ⭐⭐⭐⭐ | 🏗️ | B级 | ECS框架、网络同步 |
| 紧急修Bug | ⭐⭐ | 🐛 | M级 | 线上崩溃，必须今天修 |

## 二、任务池按月份变化

| 月份 | 任务池权重 |
|:---|:---|
| 1月 | ⭐占60%, ⭐⭐占40% |
| 2–3月 | ⭐占30%, ⭐⭐占50%, ⭐⭐⭐占20% |
| 4–6月 | ⭐⭐占30%, ⭐⭐⭐占50%, ⭐⭐⭐⭐占20% |
| 7–9月 | ⭐⭐占20%, ⭐⭐⭐占40%, ⭐⭐⭐⭐占40% |
| 10–12月 | ⭐⭐⭐占40%, ⭐⭐⭐⭐占60% |

## 三、代码质量计算

```
baseQuality   = 模型基础质量值（纯人肉 = brain × 0.5）
brainBonus    = (brain - 50) × 0.3
bugPenalty    = hasBug ? -(bugDifficulty × 0.3) : 0
randomRoll    = random(-8, +8)
taskPenalty   = ⭐:0, ⭐⭐:-5, ⭐⭐⭐:-10, ⭐⭐⭐⭐:-20
modelSpecial  = 模型特殊效果修正

finalQuality  = clamp(baseQuality + brainBonus + bugPenalty + randomRoll + taskPenalty + modelSpecial, 0, 100)
```

## 四、熬夜机制

```
当代码质量 < 50 时触发熬夜：
    hp    -= random(5, 15)
    brain -= random(3, 8)

连续加班计数器 (consecutive_overtime)：
    consecutive_overtime ≥ 3：触发"猝死警告"
    consecutive_overtime ≥ 5：强制休息3天
```

## 五、事件生成约束

1. **事件ID格式**：`daily_{desc}_{seq}`
2. **system 字段**：`"daily"`
3. **任务事件通常 `filler: true`**
4. **接私活事件必须有选择和风险**
