# 🎨 UI 风格指南 (ui_style)

> **夜间 IDE 主题风格。让游戏界面看起来像一个深色编辑器。**

---

## 一、设计理念

> "你正在帮康康在IDE前度过这一年——所以游戏本身就应该长得像一个IDE。"

- **深色主题**：模拟 VS Code / JetBrains 的暗色风格
- **等宽字体**：关键数值用等宽字体（Fira Code / JetBrains Mono）
- **语法高亮色彩**：用编辑器的高亮配色做UI色彩系统
- **像素网格感**：微妙的网格背景

---

## 二、配色方案

> 基于 One Dark Pro / Dracula 主题

| 用途 | 颜色 | Hex | 说明 |
|:---|:---|:---|:---|
| 背景主色 | 深蓝黑 | `#1e1e2e` | 编辑器背景 |
| 背景次色 | 深灰 | `#282a36` | 面板/卡片 |
| 前景文字 | 浅白 | `#cdd6f4` | 主要文字 |
| 注释灰 | 中灰 | `#6c7086` | 次要文字 |
| 关键字紫 | 紫色 | `#cba6f7` | 标题、重要文字 |
| 字符串绿 | 绿色 | `#a6e3a1` | 正面效果 |
| 错误红 | 红色 | `#f38ba8` | 负面效果、危险 |
| 数字橙 | 橙色 | `#fab387` | 数值、金钱 |
| 函数蓝 | 蓝色 | `#89b4fa` | 链接、可交互 |
| 常量黄 | 黄色 | `#f9e2af` | 警告、特殊 |
| 经济青 | 青色 | `#94e2d5` | 金钱/费用相关 |

---

## 三、布局结构

```
┌──────────────────────────────────────────────────────┐
│ 📌 Tab Bar（月份指示）                                │
│  [1月] [2月✓] [3月✓] [4月●] [5月] ... [12月]        │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌─ EXPLORER (属性面板) ──┐  ┌─ EDITOR (主内容) ──┐ │
│  │ ❤️ HP     ████░░ 78   │  │                      │ │
│  │ 🧠 Brain  ███░░░ 62   │  │  事件流 / 选择面板   │ │
│  │ 💰 Money  ¥12,500     │  │                      │ │
│  │                       │  │  每个事件像一行       │ │
│  │ 👔 Boss   ██████ 68   │  │  终端输出，带时间戳   │ │
│  │                       │  │                      │ │
│  │ ── COLLEAGUES ──      │  │  // 3月15日           │ │
│  │ 🤝 少爷   ████░ 55    │  │  > 少爷递来奶茶      │ │
│  │ 🤝 亿民   ███░░ 48    │  │  > hp +3, brain +2   │ │
│  │                       │  │                      │ │
│  │ ── AI MODEL ──        │  │  // 3月16日           │ │
│  │ 🐳 当前：豆包          │  │  > 📋 今日任务：...   │ │
│  │ 📊 本月质量：68       │  │                      │ │
│  └───────────────────────┘  └──────────────────────┘ │
│                                                      │
├──────────────────────────────────────────────────────┤
│ 🔽 TERMINAL（操作栏）                                 │
│  [⏩ 速度] [🛒 充值] [🔄 换模型] [💼 接私活]           │
└──────────────────────────────────────────────────────┘
```

---

## 四、事件流样式

事件像终端输出，模拟 `console.log`：

```css
/* 正面事件 */
.event-good {
  border-left: 3px solid #a6e3a1;
  color: #a6e3a1;
}
/* console.log 风格 */
.event-good::before { content: "✅ "; }

/* 负面事件 */
.event-bad {
  border-left: 3px solid #f38ba8;
  color: #f38ba8;
}
.event-bad::before { content: "❌ "; }

/* 特殊事件 — 金色高亮 */
.event-special {
  border-left: 3px solid #f9e2af;
  background: linear-gradient(90deg, rgba(249,226,175,0.08), transparent);
  font-weight: bold;
}
.event-special::before { content: "⭐ "; }

/* 选择事件 — 紫色 */
.event-choice {
  border-left: 3px solid #cba6f7;
  background: linear-gradient(90deg, rgba(203,166,247,0.08), transparent);
}

/* 时间戳 */
.event-timestamp {
  color: #6c7086;
  font-family: 'Fira Code', monospace;
  font-size: 0.8em;
}
/* 格式：// 3月·第3天 */
```

---

## 五、选择面板样式

```css
/* 选择面板 — 像 VS Code 的 Command Palette */
.choice-panel {
  background: #282a36;
  border: 1px solid #45475a;
  border-radius: 8px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.5);
}

.choice-option {
  padding: 12px 16px;
  border-bottom: 1px solid #313244;
  cursor: pointer;
  transition: background 0.2s;
}

.choice-option:hover {
  background: #313244;
}

.choice-option .hint {
  color: #6c7086;
  font-size: 0.85em;
}

.choice-option.locked {
  opacity: 0.4;
  cursor: not-allowed;
}
```

---

## 六、月度结算面板

```css
/* 结算面板 — 像 Git 的 diff 统计 */
.summary-panel {
  background: #1e1e2e;
  border: 1px solid #45475a;
  font-family: 'Fira Code', monospace;
}

.summary-stat-up {
  color: #a6e3a1;  /* 绿色 = 正面变化 */
}
.summary-stat-up::before { content: "+"; }

.summary-stat-down {
  color: #f38ba8;  /* 红色 = 负面变化 */
}
/* 金钱用橙色 */
.summary-money { color: #fab387; }
```

---

## 七、字体

```css
/* 主字体：标题、描述 */
font-family: 'Inter', 'Noto Sans SC', sans-serif;

/* 等宽字体：数值、代码相关 */
font-family: 'Fira Code', 'JetBrains Mono', 'Cascadia Code', monospace;
```

> Google Fonts 链接：
> - Inter: `https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700`
> - Fira Code: `https://fonts.googleapis.com/css2?family=Fira+Code:wght@400;600`
> - Noto Sans SC: `https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;600`

---

## 八、动画

| 场景 | 动画 | 时长 |
|:---|:---|:---|
| 事件出现 | 从左滑入 + 淡入 | 300ms |
| 属性变化 | 数字闪烁（绿/红） | 500ms |
| 选择面板弹出 | 从上方滑下 | 250ms |
| 月度结算 | 渐变展开 | 400ms |
| 属性危险闪烁 | 红色脉冲 | 持续 |

---

## 九、背景元素

```
替换原有星空背景，使用：
- 深色背景 + 极淡的代码字符雨（类似 Matrix，但很微弱）
- 或者淡灰色的代码行数字在背景中缓慢滚动
- 保持极低的不透明度（< 5%），不干扰阅读
```
