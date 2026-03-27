# 🐷 康康逆天改命 — 系统架构设计

> **本文件专注于代码架构和模块接口。**
> 游戏设计（属性、数值、机制、结局等）请见 [GAME_DESIGN.md](../design/GAME_DESIGN.md)。
> 最后更新：2026-03-26

---

## 一、项目结构

```
help_kangkang/
├── index.html              ← 纯HTML结构（无内联JS）+ Overlay面板
├── css/
│   └── style.css           ← IDE主题风格样式 + 动画 + Overlay
├── js/
│   ├── app.js              ← 入口：UI渲染 + 事件绑定 + 图鉴/结局/成就UI
│   ├── engine.js           ← 游戏引擎：月份循环 + 状态机 + 成就/音效集成
│   ├── events.js           ← 事件管理器：加载、筛选、执行 + 图鉴记录
│   ├── achievement.js      ← 成就管理器：条件检测 + 跨转世追踪
│   ├── property.js         ← 属性管理器：数值系统 + 观察者
│   └── save.js             ← 存档管理器：localStorage 持久化
├── data/
│   ├── events/             ← 模块化事件数据库
│   │   ├── _manifest.json  ← 系统注册清单
│   │   ├── general.json    ← 通用事件
│   │   ├── colleagues.json ← 同事系统事件
│   │   ├── monthly.json    ← 月份主线事件
│   │   ├── random.json     ← 随机事件
│   │   ├── choice.json     ← 选择事件
│   │   ├── daily.json      ← 每日任务事件
│   │   ├── models.json     ← AI模型相关事件
│   │   ├── girlfriend.json  ← 女朋友系统事件
│   │   └── life_expense.json ← 生活开销事件
│   ├── achievements.json   ← ✅ 成就定义（16条）
│   ├── endings.json        ← ✅ 结局定义（13条）
│   ├── stages.json         ← 月份阶段配置
│   └── buffs.json          ← 转世Buff配置
├── design/                 ← 游戏内容设计系统（AI工作流用）
│   ├── _global/            ← 全局规范（schema/attributes/ui_style）
│   ├── colleagues/         ← 同事系统设计
│   ├── ai_models/          ← AI模型系统设计
│   ├── monthly/            ← 月份事件设计
│   ├── daily_tasks/        ← 每日任务设计
│   ├── random_events/      ← 随机事件设计
│   ├── choice_events/      ← 选择事件设计
│   ├── endings/            ← 结局系统设计
│   ├── economy/            ← 经济系统设计
│   ├── reincarnation/      ← 转世系统设计
│   ├── girlfriend/         ← 女朋友系统设计
│   └── life_expense/       ← 生活开销系统设计
├── .agents/workflows/      ← 工作流定义
├── DECREES.md              ← 皇上旨意（进度总览）
└── README.md               ← 项目导航

注：本文件位于 `.agents/`，`GAME_DESIGN.md` 位于 `design/`。
```

## 二、分层架构

```
┌─────────────────────────────────────────────┐
│               视图层 (View)                  │
│   index.html + style.css + app.js           │
│   唯一接触 DOM 的层，IDE主题风格              │
├─────────────────────────────────────────────┤
│              引擎层 (Engine)                  │
│   engine.js — 月份循环 + 状态机               │
│   协调 EventManager / PropertyManager       │
├──────────────┬──────────────┬───────────────┤
│  事件管理器   │  属性管理器   │  存档管理器    │
│  events.js   │  property.js │  save.js      │
├──────────────┼──────────────┼───────────────┤
│  成就管理器   │               │
│  achievement │               │
├──────────────┴──────────────┴───────────────┤
│              数据层 (Data)                    │
│   events/*.json  stages.json  buffs.json    │
│   纯 JSON，不含任何逻辑代码                   │
└─────────────────────────────────────────────┘
```

---

## 三、核心模块

### 3.1 GameEngine (`js/engine.js`)

**角色**：月份循环状态机 + 协调者

```
┌─────────┐  start()  ┌──────────┐  processMonth()  ┌──────────┐
│  START   │─────────▶│  月初     │────────────────▶│ 工作日    │
│  SCREEN  │          │  结算     │                 │ 循环     │
└─────────┘          └──────────┘                 └──────────┘
                          ▲                            │
                          │     nextMonth()            │
                          └────────────────────────────┘
                                                       │
                     choice event                death/bankrupt
                          │                            │
                          ▼                            ▼
                    ┌──────────┐               ┌──────────┐
                    │  PAUSED   │               │   END    │
                    │ (choice)  │               │  SCREEN  │
                    └──────────┘               └──────────┘
```

**核心方法**：

| 方法 | 功能 |
|:---|:---|
| `init()` | 异步加载所有数据 |
| `start()` | 扣金币、应用Buff、进入1月 |
| `processMonth()` | 月初结算（工资/恢复/解锁） |
| `processWorkDay()` | 单个工作日（选模型/写代码/修Bug） |
| `nextMonth()` | 月末结算 + 月份推进 |
| `showChoice(ev)` | 暂停循环，显示选择面板 |
| `makeChoice(choice)` | 处理选择，应用效果 |
| `endGame(endingId)` | 触发结局 |

**回调接口**（引擎不直接操作 DOM）：

| 回调 | 签名 | 触发时机 |
|:---|:---|:---|
| `onEvent` | `(month, day, text, type)` | 事件触发 |
| `onUpdateUI` | `(state, monthName)` | 状态变化 |
| `onShowChoice` | `(ev, state)` | 选择事件 |
| `onHideChoice` | `()` | 选择完成 |
| `onMonthSummary` | `(summary)` | 月末结算 |
| `onGameEnd` | `(endingData)` | 游戏结束 |
| `onError` | `(msg)` | 错误 |

---

### 3.2 EventManager (`js/events.js`)

**角色**：事件数据的加载、筛选、执行

**加载机制**：读取 `_manifest.json` → 并行加载所有系统 JSON → 合并为统一事件池。

| 方法 | 功能 |
|:---|:---|
| `load()` | 异步加载所有事件文件 |
| `reset()` | 清空已触发集合 |
| `getPool(month, state)` | 筛选当前月份+状态可触发事件 |
| `pickPrioritized(pool)` | 优先级选取：choice > special > 普通 > filler |
| `execute(id, ev, state)` | 执行事件（处理分支） |
| `executeChoice(choice, state)` | 处理选择（三种模式） |

---

### 3.3 PropertyManager (`js/property.js`)

**角色**：游戏状态唯一数据源 + 观察者模式

| 方法 | 功能 |
|:---|:---|
| `reset(overrides)` | 重置到初始值 |
| `get(key)` / `set(key, val)` | 读写（触发观察者） |
| `applyEffect(effect)` | 应用效果 `{ hp: -5, brain: 3 }` |
| `onChange(fn)` | 注册观察者 |
| `monthlyRecovery()` | 月初自然恢复 |
| `monthlyExpense()` | 月初固定扣除（salary - living_cost） |
| `isGameOver()` | 检查游戏结束条件 |
| `isDead()` | hp/brain归零检查 |
| `isBankrupt()` | 连续破产3月检查 |
| `toJSON()` | 导出状态快照（含data+flags） |

---

### 3.4 SaveManager (`js/save.js`)

```json
// localStorage key: "kk2"
{ "coins": 0, "best_month": 0, "runs": 0, "wins": 0,
  "endings_unlocked": [], "events_seen": [], "achievements_unlocked": [] }
```

---

## 四、数据格式（快速参考）

> 完整格式定义见 `design/_global/_schema.md`

### 事件 (`data/events/*.json`)

```jsonc
{
  "event_id": {
    "month": [min, max],     // 触发月份范围 1~12
    "text": "事件描述",
    "type": "good",          // special/good/bad/choice/money/neutral
    "system": "colleague",   // 所属系统
    "weight": 1, "once": true, "filler": true,
    "effect": { "hp": -5, "brain": 3, "bossSatisfy": 2, "money": -500 },
    "include": {}, "exclude": {},
    "branch": [], "choices": []
  }
}
```

### 条件表达式

| 写法 | 含义 | 示例 |
|:---|:---|:---|
| `">N"` | 大于 N | `"brain": ">60"` |
| `"<N"` | 小于 N | `"hp": "<30"` |
| `"=val"` | 等于 | `"current_model": "=doubao"` |
| `"!val"` | 不等于 | `"current_model": "!doubao"` |
| `N` | 至少 N | `"brain": 60` |
| `true/false` | 布尔 | `"gamejam_won": true` |

---

## 五、UI 架构

> 完整视觉规范见 `design/_global/ui_style.md`

**设计理念**：夜间 IDE 主题（VS Code / Dracula 风格）

```
┌──────────────────────────────────────────────┐
│ Tab Bar（月份指示）                            │
│ [1月] [2月✓] [3月●] ... [12月]               │
├──────────────────────────────────────────────┤
│ EXPLORER(属性面板)  │  EDITOR(事件流/选择面板)  │
│ ❤️ HP   ████░░ 78  │  // 3月15日              │
│ 🧠 Brain ███░░ 62  │  > 少爷递来奶茶           │
│ 💰 Money ¥12,500   │  > hp +3, brain +2       │
│ 👔 Boss  █████ 68  │                          │
│ ── COLLEAGUES ──   │                          │
│ 🤝 少爷  ████░ 55  │                          │
│ 🤝 亿民  ███░░ 48  │                          │
│ 💕 女友  ████░ 65  │                          │
│ ── AI MODEL ──     │                          │
│ 🐳 当前：豆包      │                          │
├──────────────────────────────────────────────┤
│ TERMINAL（操作栏）                             │
│ [⏩速度] [🔄换模型] [💼接私活]                   │
└──────────────────────────────────────────────┘
```

---

### 3.5 AchievementManager (`js/achievement.js`)

**角色**：跨转世成就检测与追踪

| 方法 | 功能 |
|:---|:---|
| `load()` | 加载 achievements.json |
| `bind(legacy)` | 绑定存档数据 |
| `check()` | 检测所有成就条件，返回新解锁列表 |
| `getAll()` | 返回全部成就定义 |
| `getUnlockedIds()` | 返回已解锁ID集合 |
| `onUnlock(callback)` | 注册解锁回调 |

**条件类型**：`stat_gte`、`ending_unlocked`、`endings_all`、`events_count_gte`、`flag`

---



## 六、扩展指南

### 添加新事件
在 `data/events/{system}.json` 中添加，**无需改 JS**。

### 添加新事件系统
1. 创建 `data/events/{system}.json` + 在 `_manifest.json` 注册
2. 在 `design/` 下创建对应设计文件夹（`_ai_spec.md` / `settings.md` / `events_example.md`）

### 添加新同事
1. 在 `design/colleagues/settings.md` 写人设
2. 在 `design/_global/attributes.md` 添加 `{name}_rel` 属性
3. 用 `/generate-events` 工作流生成事件

### 添加新AI模型
1. 在 `design/ai_models/settings.md` 写模型设定
2. 在 `design/_global/attributes.md` 添加对应 Flag
3. 用 `/generate-events` 工作流生成解锁事件

