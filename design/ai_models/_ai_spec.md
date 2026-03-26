# 🤖 AI 模型系统 — AI 规范 (_ai_spec)

> **本文件供 AI 阅读，定义 AI 模型系统的规则和数据。**
> 必须同时阅读：`_global/_schema.md` + `_global/attributes.md`
> 人类设定见：`settings.md`

---

## 一、系统概述

管理游戏中可用的 AI 编程模型。每个模型有不同的调用消耗、代码质量、Bug 率和特殊效果。开局只有豆包，其他模型按月份解锁。

---

## 二、模型详细参数

| 模型 | 键名 | 解锁月 | 消耗/简单 | 消耗/中等 | 消耗/复杂 | 消耗/架构 | 质量基础 | Bug率 |
|:---|:---|:---|:---|:---|:---|:---|:---|:---|
| 🐳 豆包 | `doubao` | 1月 | 5M | 15M | 30M | 80M | 45 | 40% |
| 🤖 GPT-5.4 | `gpt54` | 2月 | 20M | 50M | 150M | 400M | 80 | 12% |
| 🎯 Opus 4.6 | `opus46` | 3月 | 35M | 80M | 250M | 600M | 92 | 5% |
| 🔮 DeepSeek V4 | `deepseek_v4` | 4月 | 8M | 25M | 60M | 150M | 72 | 18% |
| 💀 CheapGPT | `cheapgpt` | 3月 | 3M | 10M | 20M | 50M | 30 | 60% |
| 🎪 FakeOpus | `fakeopus` | 5月 | 5M | 15M | 35M | 90M | 35 | 55% |
| 🧠 纯人肉 | — | — | 0 | 0 | 0 | 0 | brain×0.5 | — |

---

## 三、模型特殊效果

| 模型 | 特殊效果 |
|:---|:---|
| 🐳 豆包 | 中文注释满分；简单UI任务质量 +10；10%概率超常发挥（质量 +20） |
| 🤖 GPT-5.4 | 非常稳定，波动范围仅 ±3 |
| 🎯 Opus 4.6 | 8%概率拒绝生成（"这段代码可能不太合适…"），此时不消耗费用 |
| 🔮 DeepSeek V4 | 12%概率输出超长无用代码，浪费额外 30% 费用 |
| 💀 CheapGPT | 20%概率输出完全无关内容（直接质量=0） |
| 🎪 FakeOpus | 输出看起来很唬人但实际逻辑全错，Quality 偷偷 -15 |

---

## 四、Bug 修复机制

```
if random() < bugRate:
    bugSeverity = taskComplexity × (1 - modelQuality / 100)
    brainCost   = floor(bugSeverity × 0.5)
    brain -= brainCost

    强模型 Bug → 通常是小问题（brainCost 低）
    弱模型 Bug → 逻辑全乱（brainCost 高）

    if brain < 30 after fix:
        代码质量额外 -20（脑雾状态）
```

---

## 五、模型切换规则

- **每月初**：免费切换当前默认模型
- **月内余额不足时**：弹出面板，可充值或切换模型
- **每个工作日**：可选择用当前模型或其他已解锁模型

---

## 六、模型解锁事件 ID

| 月 | 事件 ID | Flag |
|:---|:---|:---|
| 1月 | `model_unlock_doubao` | `model_doubao_unlocked` |
| 2月 | `model_unlock_gpt54` | `model_gpt54_unlocked` |
| 3月 | `model_unlock_opus46` | `model_opus46_unlocked` |
| 3月 | `model_unlock_cheapgpt` | `model_cheapgpt_unlocked` |
| 4月 | `model_unlock_deepseek_v4` | `model_deepseek_v4_unlocked` |
| 5月 | `model_unlock_fakeopus` | `model_fakeopus_unlocked` |

---

## 七、事件生成约束

1. **事件ID格式**：`model_{desc}_{seq}`
2. **system 字段**：`"model"`
3. **解锁事件必须 `once: true`**
4. **解锁事件需 `setFlag`** 设置对应的 `model_xxx_unlocked`
5. **模型相关事件**应体现该模型的特色和风格
