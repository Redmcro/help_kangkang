# 🔧 AI 内容生成工作流 (WORKFLOW)

> **本文档定义了如何利用 AI 生成游戏事件内容的标准工作流。**
> **核心理念**：你在任何系统的 `settings.md` 中写下设定 → AI 读取 `_global/` + 该系统文件夹 → 输出合规的 JSON 事件。

---

## 一、系统架构

```
┌─────────────────────────────────────────────┐
│              你（人类设计师）                  │
│  在系统文件夹的 settings.md 中写设定          │
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
  └──────────────────────────────────────────┘
```

---

## 二、标准工作流

### Step 1：修改设定

打开目标系统文件夹的 `settings.md`，写你的设定。

### Step 2：调用 AI

AI 自动读取以下文件：

```
═══════════════════════════════════════
📌 必读（每个系统都要）：
═══════════════════════════════════════

  design/_global/_schema.md       ← 事件 JSON 格式
  design/_global/attributes.md    ← 属性定义 + Flag 注册表

═══════════════════════════════════════
📌 目标系统文件夹（3个文件全读）：
═══════════════════════════════════════

  design/{system}/_ai_spec.md     ← 系统规则
  design/{system}/settings.md     ← 你的设定
  design/{system}/events_example.md ← 已有事件参考
```

### Step 3：验证 & 合并

```
✅ 检查清单：
  □ 所有事件有 month 和 text
  □ effect 中的键名在 attributes.md 中
  □ 条件格式正确（">60" 不是 "60"）
  □ type 合法（good/bad/special/choice/neutral/money）
  □ 选择事件有 title + desc + choices
  □ 事件ID唯一且符合命名规范
  □ 数值合理（单次 ±20 以内）
```

合并到 `data/events.json`。

---

## 三、并发任务分配表

| AI 会话 | 读取文件夹 | Prompt 任务 |
|:---|:---|:---|
| AI-1 | _global/ + colleagues/ | "为少爷生成10个互动事件" |
| AI-2 | _global/ + random_events/ | "生成15个随机事件" |
| AI-3 | _global/ + choice_events/ | "生成8个选择事件" |
| AI-4 | _global/ + monthly/ | "丰富7月的事件内容" |
| AI-5 | _global/ + endings/ | "设计3个新隐藏结局" |
| AI-6 | _global/ + reincarnation/ | "设计3个新Buff" |

---

## 四、快速操作速查

| 你想做什么 | 写什么/在哪里写 |
|:---|:---|
| 给少爷加个爱好 | `colleagues/settings.md` → 少爷部分写一句 |
| 加个新同事 | `colleagues/settings.md` → "新同事想法"部分 |
| 加个新AI模型 | `ai_models/settings.md` → "新模型想法"部分 |
| 给某月加事件 | `monthly/settings.md` → 对应月份补充 |
| 加个新结局 | `endings/settings.md` → "新结局想法"部分 |
| 加个新Buff | `reincarnation/settings.md` 写想法 |
| 加个随机事件 | `random_events/settings.md` 写主题 |
| 加个选择场景 | `choice_events/settings.md` 写场景灵感 |

写完后运行 `/generate-events` 工作流即可。
