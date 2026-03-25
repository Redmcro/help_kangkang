# 🐷 康康逆天改命 — 游戏架构设计文档

> 参考项目：[lifeRestart (人生重开模拟器)](https://github.com/huige233/liftresartnon)
> 最后更新：2026-03-26

---

## 一、架构总览

### 1.1 项目结构

```
help_kangkang/
├── index.html              ← 纯HTML结构（无内联JS、无onclick）
├── css/
│   └── style.css           ← 全量样式 + 动画
├── js/
│   ├── app.js              ← 入口：UI渲染 + addEventListener 绑定
│   ├── engine.js           ← 游戏引擎：核心循环 + 状态机
│   ├── events.js           ← 事件管理器：加载、筛选、执行
│   ├── property.js         ← 属性管理器：数值系统 + 观察者模式
│   └── save.js             ← 存档管理器：localStorage 持久化
├── data/
│   ├── events.json         ← 事件数据库（纯数据驱动）
│   ├── stages.json         ← 人生阶段配置
│   └── buffs.json          ← 转世Buff配置
└── ARCHITECTURE.md         ← 本文件
```

### 1.2 分层架构

```
┌─────────────────────────────────────────────┐
│               视图层 (View)                  │
│   index.html + style.css + app.js           │
│   唯一接触 DOM 的层                          │
├─────────────────────────────────────────────┤
│              引擎层 (Engine)                  │
│   engine.js — 游戏核心循环 + 状态机           │
│   协调 EventManager / PropertyManager       │
├──────────────┬──────────────┬───────────────┤
│  事件管理器   │  属性管理器   │  存档管理器    │
│  events.js   │  property.js │  save.js      │
├──────────────┴──────────────┴───────────────┤
│              数据层 (Data)                    │
│   events.json  stages.json  buffs.json      │
│   纯 JSON，不含任何逻辑代码                   │
└─────────────────────────────────────────────┘
```

### 1.3 与 lifeRestart 的对应关系

| lifeRestart 模块 | 康康对应模块 | 说明 |
|:---:|:---:|:---|
| `life.js` | `engine.js` | 游戏核心循环 |
| `event.js` | `events.js` | 事件的加载、条件判定、分支处理 |
| `property.js` | `property.js` | 属性系统 (CHR/INT/STR/SPR → chr/int/hp/hap) |
| `talent.js` | `buffs.json` | lifeRestart 的天赋 ≈ 康康的转世Buff |
| `achievement.js` | *(待实现)* | 成就系统 |
| `age.json` | `stages.json` | 年龄阶段配置 |
| `events.json` | `events.json` | 事件数据库 |
| `app.js` (view) | `app.js` | UI控制 + DOM事件绑定 |
| `condition.js` | `events.js#checkCondition` | 条件表达式解析 |

---

## 二、核心模块详解

### 2.1 GameEngine (`js/engine.js`)

**角色**：游戏状态机 + 核心循环协调者

```
┌─────────┐    start()    ┌──────────┐   processAge()  ┌──────────┐
│  START   │─────────────▶│  PLAYING  │───────────────▶│ EVENT    │
│  SCREEN  │              │  (auto)   │◀───────────────│ PROCESS  │
└─────────┘              └──────────┘                └──────────┘
                               │                          │
                          death/maxAge              choice event
                               │                          │
                               ▼                          ▼
                         ┌──────────┐              ┌──────────┐
                         │   END    │              │  PAUSED   │
                         │  SCREEN  │              │ (choice)  │
                         └──────────┘              └──────────┘
                               ▲                          │
                               │      makeChoice()       │
                               └──────────────────────────┘
```

**核心循环 `processAge()`**：
1. 执行年龄衰减 (`property.ageDecay()`)
2. 计算被动收入 (`property.earnPassiveIncome()`)
3. 死亡检查 (hp ≤ 0 或 age > 100)
4. 获取当前年龄事件池 (`eventMgr.getPool()`)
5. 优先级选取事件 (`eventMgr.pickPrioritized()`)
6. 执行事件 → 应用效果 → 记录时间线
7. 年龄 +1，调度下一轮

**回调机制**（引擎不直接操作 DOM，通过回调通知 UI）：

| 回调 | 触发时机 | UI 响应 |
|:---|:---|:---|
| `onEvent(age, text, type)` | 每个事件触发 | 添加事件行到滚动区 |
| `onUpdateUI(state, stage)` | 状态变化时 | 更新属性条、年龄、存款 |
| `onShowChoice(ev, state)` | 选择事件出现 | 显示选择面板 |
| `onHideChoice()` | 选择完成 | 隐藏选择面板 |
| `onGameEnd(data)` | 游戏结束 | 显示结束画面 |
| `onAchievement(text)` | 成就解锁 | 弹出成就提示 |

---

### 2.2 EventManager (`js/events.js`)

**角色**：事件数据的加载、筛选、执行

#### 核心方法

| 方法 | 功能 |
|:---|:---|
| `load()` | 异步加载 `events.json` |
| `reset()` | 清空已触发事件集合 |
| `getPool(age, state)` | 获取当前年龄 + 状态下可触发的事件池 |
| `pick(pool)` | 加权随机选取一个事件 |
| `pickPrioritized(pool)` | 优先级选取：choice > special > 普通 > filler |
| `execute(id, ev, state)` | 执行事件，处理分支条件，返回结果 |
| `executeChoice(choice, state)` | 处理玩家选择，支持三种模式 |
| `isChoiceLocked(choice, state)` | 检查选项是否因属性不足被锁定 |

#### 条件检查系统

**lifeRestart 方式**（DSL 字符串）：
```
"STR>6&EVT?[10001]"    // 体质>6 且 触发过事件10001
"(CHR>8|INT>8)&AGE>18" // (颜值>8 或 智力>8) 且 年龄>18
```

**康康简化方式**（JSON 对象）：
```json
{ "int": ">60", "hp": "<25", "aiSurvived": true }
```

支持的操作符：

| 格式 | 含义 | 示例 |
|:---|:---|:---|
| `">N"` | 大于 N | `"int": ">60"` |
| `"<N"` | 小于 N | `"hp": "<25"` |
| `"=value"` | 等于 | `"job": "=外卖骑手"` |
| `"!value"` | 不等于 | `"job": "!失业"` |
| `N` (数字) | 至少为 N | `"int": 60` |
| `true/false` | 布尔判定 | `"aiSurvived": true` |

---

### 2.3 PropertyManager (`js/property.js`)

**角色**：游戏状态的唯一数据源 + 观察者模式通知

#### 属性定义

| 属性 | 键名 | 范围 | lifeRestart 对应 |
|:---|:---|:---|:---|
| 健康 | `hp` | 0-100 (clamp) | STR (体质) |
| 智力 | `int` | 0-100 (clamp) | INT |
| 快乐 | `hap` | 0-100 (clamp) | SPR (精神) |
| 魅力 | `chr` | 0-100 (clamp) | CHR |
| 运气 | `luck` | 无限制 | — |
| 存款 | `money` | 无限制 | MNY (家境) |
| 总收入 | `earned` | 累计 | — |
| 年龄 | `age` | 0-100+ | AGE |
| 存活 | `alive` | bool | LIF |
| 职业 | `job` | string | — |
| 月薪 | `salary` | number | — |

#### 特殊 Flag 系统

游戏通过 `property.set(key, val)` 设置逻辑标记：

| Flag | 含义 | 设置时机 |
|:---|:---|:---|
| `aiSurvived` | 是否成功抵抗AI浪潮 | `ai_choice` 选择成功 |
| `job` | 当前职业 | `first_job` / `ai_replace` / `rider_fate` |
| `college` | 大学类型 | 高考结果 |
| `married` | 婚姻状态 | 结婚事件 |
| `indieSuccess` | 独立游戏成功 | 独立游戏事件 |

#### 年龄衰减机制

```
age >= 45: hp 每年 -1~3
age >= 60: hp 额外 -2~4
age >= 80: hp 额外 -3~6
```

#### 被动收入公式

```
收入 = floor(salary × 0.2 × 年龄系数 × (1 + int/200))

年龄系数：16岁=1.5, 23岁=3, 30岁=5, 40岁=6, 50岁=4
```

---

### 2.4 SaveManager (`js/save.js`)

**角色**：通过 `localStorage` 持久化跨局数据

```json
// localStorage key: "kk2"
{
  "coins": 0,     // 传世金币（用于购买Buff）
  "best": 0,      // 历史最长寿命
  "runs": 0,      // 转世次数
  "wins": 0       // 改命成功次数
}
```

---

## 三、数据格式规范

### 3.1 事件 (`data/events.json`)

每个事件以唯一 ID 为键：

```jsonc
{
  "event_id": {
    // === 必填 ===
    "age": [min, max],       // 触发年龄范围
    "text": "事件描述文本",    // 显示给玩家的文字

    // === 可选：事件属性 ===
    "type": "special",       // 类型：special/good/bad/choice/money/neutral
    "weight": 1,             // 权重（默认1，越大越容易被选中）
    "once": true,            // 是否只触发一次
    "filler": true,          // 标记为填充事件（优先级最低）
    "effect": {},            // 属性效果 { "hp": -5, "int": 3 }
    "postEvent": "补充文本",  // 事件后追加显示的文字

    // === 可选：条件 ===
    "include": {},           // 触发前提条件（满足才会进入事件池）
    "exclude": {},           // 排除条件（满足则排除）

    // === 可选：分支 ===
    "branch": [              // 按条件选择不同结果
      {
        "cond": { "int": ">70" },
        "text": "分支描述", "type": "good",
        "effect": {}
      }
    ],

    // === 可选：选择事件 ===
    "type": "choice",
    "title": "🎮 事件标题",
    "desc": "选择面板描述",
    "choices": [/* 见3.2 */]
  }
}
```

### 3.2 选择项格式

支持三种选择模式：

#### 模式A：简单选择（直接结果）
```jsonc
{
  "text": "🤝 分享玩具",
  "hint": "魅力+10",
  "result": "小霸王哭了，你们成了好朋友",
  "effect": { "chr": 10 }
}
```

#### 模式B：概率选择（chanceBased）
```jsonc
{
  "text": "👊 打回去",
  "hint": "看运气",
  "chanceBased": true,
  "branches": [
    { "chance": 50, "result": "打输了", "effect": { "hp": -5 } },
    { "chance": 50, "result": "打赢了！", "effect": { "chr": 8 } }
  ]
}
```

#### 模式C：条件判定（require）
```jsonc
{
  "text": "📚 学习AI/ML",
  "hint": "需要智力60+",
  "require": { "int": 60 },
  "success": "转型成功！",   "successEffect": { "int": 20 },
  "fail": "学不会...",       "failEffect": { "hap": -5 },
  "setFlag": "aiSurvived"   // 成功时设置Flag
}
```

### 3.3 阶段 (`data/stages.json`)

```jsonc
[
  { "max": 3,   "name": "👶 婴幼儿" },
  { "max": 6,   "name": "🧒 幼儿园" },
  { "max": 12,  "name": "📚 小学" },
  { "max": 15,  "name": "📖 初中" },
  { "max": 18,  "name": "🎓 高中" },
  { "max": 22,  "name": "🎮 大学" },
  { "max": 30,  "name": "💻 程序员" },
  { "max": 40,  "name": "🏢 职场" },
  { "max": 55,  "name": "🔄 转型期" },
  { "max": 70,  "name": "🧓 中老年" },
  { "max": 100, "name": "👴 老年" }
]
```

### 3.4 Buff (`data/buffs.json`)

```jsonc
[
  {
    "id": "school",
    "icon": "🎓",
    "name": "重点小学",
    "desc": "智力+10",
    "cost": 0,              // 传世金币花费，0=免费
    "effect": { "int": 10 }  // 开局叠加效果
  }
]
```

---

## 四、UI 层设计 (`app.js` + `index.html`)

### 4.1 原则

- **`app.js` 是唯一接触 DOM 的文件**
- `index.html` 零内联事件，所有交互通过 `addEventListener`
- 使用回调模式与引擎通信，不依赖全局变量

### 4.2 画面状态机

```
startScreen ──(开始)──▶ gameScreen ──(死亡/通关)──▶ endScreen
     ▲                                                │
     └──────────────────(重新开始)──────────────────────┘
```

### 4.3 事件类型 → 视觉映射

| type | 左边框颜色 | 背景渐变 | 文字权重 |
|:---|:---|:---|:---|
| `special` | 金色 `#fbbf24` | 金色 8%→透明 | bold |
| `good` | 绿色 `#4ade80` | — | normal |
| `bad` | 红色 `#ef4444` | — | normal |
| `choice` | 紫色 `#c471ed` | 紫色 → 透明 | bold |
| `choice-made` | 青色 `#22d3ee` | — | italic |
| `neutral` | 灰色 `rgba(255,255,255,0.1)` | — | normal |

---

## 五、游戏机制设计

### 5.1 核心体验循环

```
选Buff → 开始人生 → 经历事件 → 做出选择 → 属性变化
                        ↓
              达到AI时代(30+岁) → 关键抉择
                   ↓              ↓
             成功转型         被AI取代
             (改命成功)       (沦为骑手)
                   ↓              ↓
               幸福退休        骑手生活
                   ↓              ↓
                结算 → 获得传世金币 → 再来一次
```

### 5.2 事件优先级系统

当多个事件同时可触发时的选取策略：

```
1. choice（选择事件）    ← 最高优先
2. special（特殊事件）
3. 非 filler 的普通事件  ← 加权随机
4. filler（填充事件）    ← 最低优先
```

### 5.3 胜负条件

| 结局 | 条件 | 图标 |
|:---|:---|:---|
| 🎉 胜利 | `age > 100` (活过100岁) | 🎉 |
| 🛵 骑手结局 | `job === '外卖骑手'` 且死亡 | 🛵 |
| 💀 普通死亡 | `hp <= 0` | 💀 |

### 5.4 传世系统

- 每局结束获得传世金币 = `earned / 100`（胜利为 `/80`）
- 金币可购买 Buff，下一局生效
- 记录历史最长寿命、转世次数、改命成功次数

---

## 六、从 lifeRestart 借鉴的设计模式

### 6.1 已采用

| 模式 | lifeRestart 实现 | 康康实现 |
|:---|:---|:---|
| **纯数据事件** | JSON 事件表，ID 为数字 | JSON 事件表，ID 为语义化字符串 |
| **分支系统** | `branch: "条件:目标事件ID"` | `branch: [{ cond, text, effect }]` 内联分支 |
| **include/exclude** | DSL 字符串 `"STR>6&EVT?[10001]"` | 简化 JSON `{ "int": ">60" }` |
| **加权随机** | `event_id*weight` 格式 | `weight` 字段 |
| **postEvent** | 事件后追加文本 | 同 |
| **once 标记** | ✅ | ✅ |
| **属性观察者** | 回调通知 UI | `onChange(fn)` |
| **localStorage 持久化** | `lsget/lsset` 方法 | `loadLegacy/saveLegacy` 函数 |

### 6.2 简化处理

| lifeRestart 特性 | 简化原因 |
|:---|:---|
| DSL 条件表达式解析器 | 游戏规模小，JSON 对象够用 |
| High/Low 极值追踪 | 未采用，目前不需要属性极值统计 |
| 天赋互斥/冲突系统 | Buff 系统更简单，暂不需要互斥 |

### 6.3 待实现（未来扩展）

| 功能 | 参考 lifeRestart | 优先级 |
|:---|:---|:---|
| **成就系统** | `achievement.js` — 基于时机(START/TRAJECTORY/SUMMARY/END)检查条件 | ⭐⭐⭐ |
| **天赋互斥** | `talent.js` — exclusive 字段 | ⭐ |
| **属性极值追踪** | `property.js` — HAGE/LAGE 等 | ⭐⭐ |
| **事件收集图鉴** | AEVT 字段跨局累计 | ⭐⭐ |
| **条件 DSL** | `condition.js` — 完整表达式解析 | ⭐ |

---

## 七、扩展指南

### 7.1 如何添加新事件

在 `data/events.json` 中添加新条目。**无需修改任何 JS 代码**：

```jsonc
"new_event_id": {
  "age": [10, 15],
  "text": "新事件描述",
  "type": "good",
  "effect": { "int": 5 },
  "once": true
}
```

### 7.2 如何添加选择事件

```jsonc
"new_choice_event": {
  "age": [20, 30],
  "text": "触发描述...",
  "type": "choice",
  "title": "🎯 标题",
  "desc": "面板描述",
  "choices": [
    { "text": "选项A", "hint": "提示", "result": "结果", "effect": {} },
    { "text": "选项B", "hint": "提示", "require": { "int": 60 },
      "success": "成功", "successEffect": {},
      "fail": "失败", "failEffect": {} }
  ]
}
```

### 7.3 如何添加新 Buff

在 `data/buffs.json` 数组末尾添加：

```jsonc
{ "id": "newbuff", "icon": "🔮", "name": "名称", "desc": "描述", "cost": 30, "effect": { "luck": 20 } }
```

### 7.4 如何添加新阶段

在 `data/stages.json` 中按 `max` 升序插入。

### 7.5 如何实现成就系统（参考 lifeRestart）

需要新增：
1. `data/achievements.json` — 成就定义
2. `js/achievement.js` — 成就检查器
3. 在 `engine.js` 的关键节点调用成就检查

```jsonc
// data/achievements.json 格式参考
{
  "hello_world": {
    "name": "Hello World",
    "desc": "第一次接触编程",
    "icon": "💻",
    "opportunity": "TRAJECTORY",  // 人生经历中检查
    "condition": { "event": "code1" }
  }
}
```

---

## 八、已知问题 & TODO

### 已修复 (2026-03-26)
- [x] 事件特效硬编码 → 已数据驱动化（删除 `handleSpecialEffects()`）
- [x] 事件重复触发 → 关键事件已加 `once: true`
- [x] `alert()` 耦合 UI → 已替换为 `onError` 回调
- [x] 被动收入绕过观察者 → 已改用 `this.set()`
- [x] filler 判断用 ID 前缀 → 已改用 `ev.filler` 字段
- [x] 事件流 DOM 无限增长 → 限制 100 条
- [x] 中考/高考结果显示内部标记文本 → 已替换为正常描述
- [x] `uni_start` 分支用 `_flag` 键名导致 985 分支失效 → 已改为 `gaokao_hard: true`
- [x] `exam1`/`hs_game`/`science` 叙事事件可重复触发 → 已加 `once: true`

### 待处理
- [ ] 分支事件的 fallback（空 `cond`）行为需验证边界情况

### 第三阶段：内容扩充
- [ ] 更多童年事件（丰富 0-12 岁体验）
- [ ] 更多职场事件（25-40 岁）
- [ ] 更多随机/彩蛋事件
- [ ] 事件权重平衡调整

### 第四阶段：UI 增强
- [ ] 属性变化数字飘动动画
- [ ] 事件分级视觉样式（legendary/epic 边框）
- [ ] 成就弹窗组件开发
- [ ] 人生时间线回顾优化（结束画面）

### 第五阶段：系统扩展
- [ ] 成就系统实现
- [ ] 事件收集图鉴
- [ ] 结局收集系统
- [ ] 音效/BGM 支持
