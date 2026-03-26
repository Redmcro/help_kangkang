# 🎮 帮助康康不被AI淘汰 — 模块化设计系统

> **本目录是游戏内容的设计中枢。** 每个子文件夹描述一个独立系统。

---

## 目录结构

```
design/
├── _global/                  ← 🔒 全局基础（AI 必读）
│   ├── _schema.md            ← 📐 JSON 格式规范
│   ├── attributes.md         ← 📊 属性定义 + Flag 注册表
│   └── ui_style.md           ← 🎨 UI 风格指南
│
├── colleagues/               ← 🤝 同事系统
├── ai_models/                ← 🤖 AI 模型系统
├── monthly/                  ← 📅 月份事件
├── daily_tasks/              ← 💻 每日任务
├── random_events/            ← 🎲 随机事件
├── choice_events/            ← 🎭 选择事件
├── endings/                  ← 🏆 结局系统
├── economy/                  ← 💰 经济系统
└── reincarnation/            ← 🔄 转世系统
```

每个系统文件夹包含 3 个文件：

| 文件 | 谁写 | 内容 |
|:---|:---|:---|
| `_ai_spec.md` | AI / 初始化写好 | 🤖 系统规则、机制、事件约束 |
| `settings.md` | **你** | 📝 一句话设定、角色特点、灵感 |
| `events_example.md` | 示例 | 📋 已有事件 JSON 示例 |

---

## 如何使用

### 📝 添加新设定（最简单）

打开任意系统的 `settings.md`，写你的想法，例如：

```markdown
## 少爷
- 爱玩游戏，经常偷偷在工位上玩手游
- 周五下午会约人打羽毛球
```

### 🤖 让 AI 生成事件

使用 `/generate-events` 工作流，AI 会自动读取：
1. `_global/_schema.md` + `_global/attributes.md`（必读）
2. 目标系统的 `_ai_spec.md` + `settings.md` + `events_example.md`

### ➕ 添加新系统

1. 新建文件夹 `design/{system_name}/`
2. 创建 `_ai_spec.md`、`settings.md`、`events_example.md`
3. 在 `_global/attributes.md` 登记新属性和 Flag
4. 更新本 README 索引

---

## 系统索引

| 系统 | 文件夹 | 可生成内容 | 说明 |
|:---|:---|:---:|:---|
| 📐 格式规范 | `_global/` | — | 所有事件必须遵循的 JSON 格式 |
| 📊 属性系统 | `_global/` | — | 属性定义 + Flag 注册表 |
| 🤝 同事系统 | `colleagues/` | ✅ | 少爷、亿民的人设和互动事件 |
| 🤖 AI模型 | `ai_models/` | ✅ | 模型数据、解锁事件 |
| 📅 月份事件 | `monthly/` | ✅ | 12月主线事件 |
| 💻 每日任务 | `daily_tasks/` | ✅ | 工作任务、私活 |
| 🎲 随机事件 | `random_events/` | ✅ | 正面/负面随机事件 |
| 🎭 选择事件 | `choice_events/` | ✅ | 需要玩家决策的事件 |
| 🏆 结局系统 | `endings/` | ✅ | 胜利/失败/隐藏结局 |
| 💰 经济系统 | `economy/` | — | 收支规则 |
| 🔄 转世系统 | `reincarnation/` | ✅ | 传世金币、Buff 商店 |

---

## 游戏一句话概述

> 康康是一名 Unity 程序员，开局只有一个豆包 AI。在 12 个月内，他要学会驾驭各种 AI 模型写代码、管理 Token 和脑力、应对老板考核和同事关系，最终保住饭碗——否则就去送外卖。
