# 🤖 AI 模型系统 (ai_models)

> **定义所有可用 AI 模型的数据、解锁条件、Bug机制。**
> 依赖：`attributes.md`（token/brain 消耗） | `_schema.md`（事件格式）
> 被依赖：`daily_tasks.md`（任务消耗计算）

---

## 一、模型列表

> 开局只有豆包。6月前全部解锁。

| 模型 | 键名 | 解锁月 | 阵营 | 一句话 |
|:---|:---|:---|:---|:---|
| 🐳 豆包 | `doubao` | 1月 | 国产 | "不要小瞧豆包哦！" |
| 🤖 GPT-5.4 | `gpt54` | 2月 | OpenAI | 老牌选手，贵但稳 |
| 💀 CheapGPT | `cheapgpt` | 3月 | 盗版 | 便宜到可疑的"GPT" |
| 🎯 Opus 4.6 | `opus46` | 3月 | Anthropic | 最强代码，最贵 |
| 🔮 DeepSeek V4 | `deepseek_v4` | 4月 | 国产开源 | 性价比之王 |
| 🎪 FakeOpus | `fakeopus` | 5月 | 盗版 | "Opus 平替"，实际拉胯 |

---

## 二、模型详细参数

| 模型 | Token/简单 | Token/中等 | Token/复杂 | Token/架构 | 质量基础 | Bug率 |
|:---|:---|:---|:---|:---|:---|:---|
| 🐳 豆包 | 5M | 15M | 30M | 80M | 45 | 40% |
| 🤖 GPT-5.4 | 20M | 50M | 150M | 400M | 80 | 12% |
| 🎯 Opus 4.6 | 35M | 80M | 250M | 600M | 92 | 5% |
| 🔮 DeepSeek V4 | 8M | 25M | 60M | 150M | 72 | 18% |
| 💀 CheapGPT | 3M | 10M | 20M | 50M | 30 | 60% |
| 🎪 FakeOpus | 5M | 15M | 35M | 90M | 35 | 55% |
| 🧠 纯人肉 | 0 | 0 | 0 | 0 | brain×0.5 | — |

### 纯人肉脑力消耗

| 任务复杂度 | 脑力消耗 |
|:---|:---|
| ⭐ 简单 | -10 |
| ⭐⭐ 中等 | -18 |
| ⭐⭐⭐ 复杂 | -30 |
| ⭐⭐⭐⭐ 架构 | -45 |

---

## 三、模型特殊效果

| 模型 | 特殊效果 |
|:---|:---|
| 🐳 豆包 | 中文注释满分；简单UI任务质量 +10；10%概率超常发挥（质量 +20） |
| 🤖 GPT-5.4 | 非常稳定，波动范围仅 ±3 |
| 🎯 Opus 4.6 | 8%概率拒绝生成（"这段代码可能不太合适…"），此时不消耗Token |
| 🔮 DeepSeek V4 | 12%概率输出超长无用代码，浪费额外 30% Token |
| 💀 CheapGPT | 20%概率输出完全无关内容（直接质量=0） |
| 🎪 FakeOpus | 输出看起来很唬人但实际逻辑全错，Quality 偷偷 -15 |

---

## 四、Bug 修复机制

AI 出 Bug 后，康康必须用脑力去改：

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
- **月内 Token 耗尽时**：弹出面板，可购买 Token 或切换模型
- **每个工作日**：可选择用当前模型或临时用其他模型（按对应 Token 消耗）

---

## 六、模型解锁事件

> 以下事件在 `monthly_events.md` 中定义，此处列出 ID 供交叉引用。

| 月 | 事件 ID | 描述 |
|:---|:---|:---|
| 1月 | `model_unlock_doubao` | 开局自带豆包 |
| 2月 | `model_unlock_gpt54` | GPT-5.4 上线，朋友圈刷屏 |
| 3月 | `model_unlock_opus46` | Opus 4.6 发布，代码圈炸了 |
| 3月 | `model_unlock_cheapgpt` | "兄弟，这个GPT便宜又好用！" |
| 4月 | `model_unlock_deepseek_v4` | DeepSeek V4 开源，GitHub趋势第一 |
| 5月 | `model_unlock_fakeopus` | 某群里传播的"Opus平替" |

---

## 添加新模型指南

在本文件的**模型列表**和**详细参数**表中添加一行，并确保：
1. 有唯一的 `键名`
2. 指定解锁月份（≤ 6月）
3. 在 `monthly_events.md` 中添加对应的解锁事件
4. Token 消耗和质量基础需要平衡（参考现有模型）

```jsonc
// 新模型模板
{
  "model_unlock_xxx": {
    "month": [N, N],
    "text": "新模型描述...",
    "type": "special",
    "system": "model",
    "once": true,
    "effect": {},
    "setFlag": "model_xxx_unlocked"
  }
}
```
