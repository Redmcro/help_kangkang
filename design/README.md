# 🎮 帮助康康不被AI淘汰 — 模块化设计系统

> **本目录是游戏内容的设计中枢。** 每个 `.md` 文件描述一个独立系统，可以单独交给 AI 生成事件内容。

---

## 目录索引

| 文件 | 系统 | 描述 | 可独立生成内容 |
|:---|:---|:---|:---:|
| [`_schema.md`](./_schema.md) | 📐 数据格式规范 | 所有事件的 JSON 格式定义，**任何生成的事件都必须符合此格式** | — |
| [`attributes.md`](./attributes.md) | 📊 属性系统 | hp/money/brain/token/bossSatisfy 的定义、范围、联动 | — |
| [`ai_models.md`](./ai_models.md) | 🤖 AI 模型系统 | 各模型数据、Bug率、Token消耗、解锁时间 | ✅ 可添加新模型 |
| [`colleagues.md`](./colleagues.md) | 🤝 同事系统 | 少爷、亿民的人设 + 互动事件模板 | ✅ 可添加同事/事件 |
| [`monthly_events.md`](./monthly_events.md) | 📅 月份事件 | 12个月的大事件 + 阶段机制 | ✅ 可补充月份事件 |
| [`daily_tasks.md`](./daily_tasks.md) | 💻 每日任务 | 工作任务类型、代码质量公式、熬夜机制 | ✅ 可添加任务类型 |
| [`random_events.md`](./random_events.md) | 🎲 随机事件 | 正面/负面随机事件 | ✅ 可大量添加 |
| [`choice_events.md`](./choice_events.md) | 🎭 选择事件 | 需要玩家做决策的事件 | ✅ 可大量添加 |
| [`endings.md`](./endings.md) | 🏆 结局系统 | 胜利/失败/隐藏结局 | ✅ 可添加新结局 |
| [`economy.md`](./economy.md) | 💰 经济系统 | 工资、Token定价、开销 | — |
| [`reincarnation.md`](./reincarnation.md) | 🔄 转世系统 | 传世金币、Buff商店 | ✅ 可添加Buff |
| [`ui_style.md`](./ui_style.md) | 🎨 UI风格 | 夜间IDE风格指南 | — |

---

## 如何使用本系统

### 🤖 给 AI 生成内容时

将以下文件组合发给 AI：

```
必读：_schema.md + attributes.md（格式 + 属性约束）
按需：对应的系统 MD（如要生成同事事件就加 colleagues.md）
```

**示例 Prompt**：

> 请阅读 `_schema.md` 了解事件格式，阅读 `colleagues.md` 了解同事系统。
> 然后为"少爷"生成 5 个有趣的互动事件，输出符合 schema 的 JSON。

### 📝 人工维护时

1. 修改系统规则 → 编辑对应的 MD
2. 添加新事件 → 在对应 MD 的"事件列表"部分追加
3. 添加新系统 → 新建 MD + 更新本 README 索引

### ⚠️ 跨系统依赖

```
_schema.md ←── 所有事件文件都依赖此格式
attributes.md ←── 所有涉及 effect 的文件都依赖此属性表
ai_models.md ←── daily_tasks.md 中的任务消耗依赖模型数据
colleagues.md ←── 部分 random_events / choice_events 涉及同事
monthly_events.md ←── 定义了模型解锁时间，ai_models.md 需同步
```

---

## 游戏一句话概述

> 康康是一名 Unity 程序员，开局只有一个豆包 AI。在 12 个月内，他要学会驾驭各种 AI 模型写代码、管理 Token 和脑力、应对老板考核和同事关系，最终保住饭碗——否则就去送外卖。
