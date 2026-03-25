# 🔧 AI 内容生成工作流 (WORKFLOW)

> **本文档定义了如何利用 AI 并发生成游戏事件内容的标准工作流。**
> **核心理念**：你在任何组件 MD 中写下设定 → AI 读取 schema + 该 MD → 输出合规的 JSON 事件。

---

## 一、系统架构

```
┌─────────────────────────────────────────────┐
│              你（人类设计师）                  │
│  在组件 MD 中写人设、规则、数值约束            │
└──────┬──────────────┬───────────────┬────────┘
       │              │               │
       ▼              ▼               ▼
  ┌─────────┐   ┌──────────┐   ┌──────────┐
  │ AI-1    │   │ AI-2     │   │ AI-3     │    ← 并发投喂
  │ 同事事件 │   │ 随机事件  │   │ 选择事件  │
  └────┬────┘   └────┬─────┘   └────┬─────┘
       │              │               │
       ▼              ▼               ▼
  ┌──────────────────────────────────────────┐
  │        events.json（汇总合并）             │
  │  所有 AI 输出的事件合并到一个 JSON 文件     │
  └──────────────────────────────────────────┘
```

---

## 二、标准工作流

### Step 1：修改设定

在对应的组件 MD 中修改/添加你的设定。例如：

- 想加新同事 → 编辑 `colleagues.md`，写人设
- 想改模型数据 → 编辑 `ai_models.md`，改参数
- 想加新结局 → 编辑 `endings.md`，写条件

### Step 2：构造 Prompt

向 AI 发送以下内容（按需组合）：

```
═══════════════════════════════════════
📌 必读上下文（每次都要发）：
═══════════════════════════════════════

1. design/_schema.md      ← AI 必须知道事件格式
2. design/attributes.md   ← AI 必须知道有哪些属性

═══════════════════════════════════════
📌 按任务发的组件 MD：
═══════════════════════════════════════

生成同事事件 → + colleagues.md
生成随机事件 → + random_events.md
生成选择事件 → + choice_events.md
生成月份事件 → + monthly_events.md + ai_models.md
生成新结局   → + endings.md
生成新Buff   → + reincarnation.md + endings.md

═══════════════════════════════════════
📌 Prompt 模板：
═══════════════════════════════════════

请阅读附件中的设计文档。

你的任务是为游戏"帮助康康不被AI淘汰"生成 [N] 个 [事件类型] 事件。

主题/方向：[描述]

要求：
1. 严格遵循 _schema.md 中定义的 JSON 格式
2. effect 中只使用 attributes.md 中列出的属性键名
3. 事件ID格式：{system}_{desc}_{seq}
4. system 字段统一为 "[系统名]"
5. 数值参考现有事件的范围，不要过大过小
6. 有趣、有细节、有代入感
7. 输出纯 JSON，可以直接合并到 events.json

输出格式：
{
  "event_id_1": { ... },
  "event_id_2": { ... }
}
```

### Step 3：验证 & 合并

AI 输出的 JSON 需要检查：

```
✅ 检查清单：
  □ 所有事件有 month 和 text
  □ effect 中的键名都在 attributes.md 中
  □ 条件表达式格式正确（">60" 不是 "60"）
  □ type 是合法值（good/bad/special/choice/neutral/money）
  □ 选择事件有 title + desc + choices
  □ branch 中空 cond 的 fallback 在最后
  □ 数值合理（不会一个事件直接 hp +50）
  □ 事件ID唯一
```

合并方式：将 JSON 对象直接 merge 到 `data/events.json`。

---

## 三、并发任务分配表

你可以同时让多个 AI 生成不同系统的内容：

| AI 会话 | 发送文件 | Prompt 任务 |
|:---|:---|:---|
| AI-1 | schema + attributes + colleagues | "为少爷生成10个互动事件" |
| AI-2 | schema + attributes + random_events | "生成15个正面/负面随机事件" |
| AI-3 | schema + attributes + choice_events + ai_models | "生成8个Token管理的选择事件" |
| AI-4 | schema + attributes + monthly_events | "丰富7月的事件内容" |
| AI-5 | schema + attributes + endings | "设计3个新隐藏结局" |

> **不会冲突**：因为每个 AI 生成独立的事件，ID有命名规范，直接合并不冲突。

---

## 四、常用 Prompt 速查

### 🤝 生成同事事件

```
请阅读 _schema.md, attributes.md, colleagues.md。
为 [少爷/亿民] 生成 [N] 个互动事件。
要求：混合正面/负面/选择事件，体现角色性格。
输出纯 JSON。
```

### 🎲 生成随机事件

```
请阅读 _schema.md, attributes.md, random_events.md。
生成 [N] 个随机事件，正面:负面:中性 = 4:4:2。
主题：Unity程序员在AI时代的日常。
输出纯 JSON。
```

### 🎭 生成选择事件

```
请阅读 _schema.md, attributes.md, choice_events.md。
生成 [N] 个选择事件，主题是 [主题]。
每个事件 3 个选项，没有白给的最优解。
输出纯 JSON。
```

### 📅 丰富月份事件

```
请阅读 _schema.md, attributes.md, monthly_events.md, ai_models.md。
为 [N月] 补充 3~5 个子事件。
需要考虑该月的特殊机制和新模型。
输出纯 JSON。
```

### 🤝 添加新同事

```
请阅读 _schema.md, attributes.md, colleagues.md。

新同事信息：
- 名字：[名字]
- 职位：[职位]
- 性格：[描述]
- 对AI态度：[态度]
- 口头禅：[2~3句]

请为这个角色：
1. 写出完整人设描述（Markdown格式）
2. 补充 colleagues.md 中该新同事的关系等级效果表
3. 生成 8~10 个互动事件（JSON格式）
4. 事件ID格式：colleague_{name}_{desc}_{seq}
```

### 🏆 设计新结局

```
请阅读 _schema.md, attributes.md, endings.md。
设计 [N] 个新结局（隐藏/胜利/失败）。
每个结局需要：条件(JSON)、标题、3~5段文学性描述、金币奖励。
```

---

## 五、进阶：批量生成 & 质量控制

### 批量生成

如果需要大量事件，按月份拆分任务：

```
12个会话，每个负责一个月：
  AI-M1: "生成1月的5个事件（教学月、任务简单）"
  AI-M2: "生成2月的8个事件（春节、GPT-5.4上线）"
  ...
  AI-M12: "生成12月的5个事件（年终审判）"
```

### 质量控制 Prompt 后缀

在 Prompt 末尾加上质量约束：

```
质量要求：
- 事件文本不超过30字（简洁有力）
- postEvent 作为补充描述，不超过20字
- effect 中最多改变 3 个属性
- 选择事件的每个选项 hint 不超过15字
- 分支事件的 cond 使用简单条件（单属性判断）
- 不要出现过于极端的数值变化（单次 ±20 以内）
```

---

## 六、目录结构总览

```
design/
├── README.md            📌 索引 & 依赖关系图
├── WORKFLOW.md          📌 本文件：AI工作流指南
├── _schema.md           📐 JSON格式规范（必读）
├── attributes.md        📊 属性系统（必读）
├── ai_models.md         🤖 AI模型系统
├── colleagues.md        🤝 同事系统
├── monthly_events.md    📅 月份事件
├── daily_tasks.md       💻 每日任务
├── random_events.md     🎲 随机事件
├── choice_events.md     🎭 选择事件
├── endings.md           🏆 结局系统
├── economy.md           💰 经济系统
├── reincarnation.md     🔄 转世系统
└── ui_style.md          🎨 UI风格
```
