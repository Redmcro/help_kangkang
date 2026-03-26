# 🐷 康康逆天改命

> 康康是一名 Unity 程序员，开局只有一个豆包 AI。
> 在 12 个月内驾驭 AI 模型写代码、管理 Token 和脑力、应对考核和同事关系，保住饭碗——否则就去送外卖。

**游戏类型**：12 个月职场生存模拟 + Roguelike Meta 进度

---

## 📖 文档索引

| 文档 | 内容 | 谁来看 |
|:---|:---|:---|
| [GAME_DESIGN.md](./design/GAME_DESIGN.md) | 🎮 游戏基础设定（属性/数值/机制/结局） | 内容创作 AI + 设计师 |
| [ARCHITECTURE.md](./design/ARCHITECTURE.md) | 🏗️ 系统架构（代码模块/接口/数据格式） | 写代码的 AI + 开发者 |
| [TODO.md](./design/TODO.md) | 📋 任务分配表（模块/验收标准） | 大内总管 + 各部门 AI |
| [design/README.md](./design/README.md) | 🎨 设计系统使用指南 | 内容创作 AI |

---

## 🚀 快速开始

### 运行游戏

用任意 HTTP 服务器启动（ES Module 需要 HTTP）：

```bash
# 方案1：VS Code Live Server 插件
# 方案2：
npx serve .
# 方案3：
python -m http.server 8080
```

### 添加游戏内容

1. 在 `design/{系统}/settings.md` 写设定
2. 运行 `/generate-events` 工作流
3. AI 自动生成合规事件并合并到 `data/events/`

### 添加新系统

运行 `/add-system` 工作流，自动创建所有需要的文件。

---

## 📂 目录结构速查

```
help_kangkang/
├── index.html          ← 游戏入口
├── css/style.css       ← 样式（IDE 主题风格）
├── js/                 ← 代码模块
│   ├── app.js          ← UI 控制
│   ├── engine.js       ← 月份循环引擎
│   ├── events.js       ← 事件管理
│   ├── property.js     ← 属性系统
│   └── save.js         ← 存档
├── data/               ← 纯数据（JSON）
│   ├── events/         ← 模块化事件
│   ├── stages.json     ← 月份阶段
│   └── buffs.json      ← 转世 Buff
├── design/             ← 设计文档 + AI 工作流
│   ├── GAME_DESIGN.md  ← 游戏设定
│   ├── ARCHITECTURE.md ← 系统架构
│   ├── TODO.md         ← 任务分配表
│   ├── _global/        ← 全局规范
│   └── {system}/       ← 各系统设计文件
├── DECREES.md          ← 皇上旨意（进度总览）
└── README.md           ← 本文件
```

---

## 🤖 并发 AI 工作指南

不同 AI 可以同时在以下文件中工作，互不冲突：

| AI 会话 | 工作范围 | 读取 |
|:---|:---|:---|
| AI-1 | `design/colleagues/settings.md` + `data/events/colleagues.json` | `_global/` |
| AI-2 | `design/random_events/settings.md` + `data/events/random.json` | `_global/` |
| AI-3 | `design/monthly/settings.md` + `data/events/monthly.json` | `_global/` + `ai_models/` |
| AI-4 | `js/*.js` + `index.html` | `design/ARCHITECTURE.md` + `design/GAME_DESIGN.md` |

> **规则**：每个 AI 只修改自己负责的文件。`design/GAME_DESIGN.md` 和 `design/_global/` 是只读参考。
