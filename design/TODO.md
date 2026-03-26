# 🔧 TODO — 并发任务分配表

> **最后审计：2026-03-26 13:56**
> 全局规则见 `.agents/AGENTS.md`（铁律自动生效）
> 大内总管工作流：`.agents/workflows/chief-steward.md`

---

> [!CAUTION]
> **⛔ 只改自己模块的文件 · 不开端口 · 不开浏览器 · 不运行游戏 · 做完向大内总管汇报**
> 详见 `.agents/AGENTS.md`

---

## 当前状态总览

| 文件 | 状态 | 说明 |
|:---|:---|:---|
| `property.js` | ✅ 正常 | v2 属性完整（含 charm/luck），Flag 系统正常 |
| `engine.js` | ✅ 正常 | 模型特效+隐藏结局+charm机制+熬夜+doubao_bonus 已完成 |
| `events.js` | ✅ 正常 | month 筛选 + luck 修正已完成 |
| `save.js` | ✅ 正常 | events_seen/achievements_unlocked 已恢复 |
| `app.js` | ⚠️ 功能不全 | 模块5部分完成，模块4(overlay逻辑)完全缺失 |
| `index.html` | ⚠️ 不完整 | overlay 面板已有，缺 Token购买/换模型/接私活 UI |
| `css/style.css` | ✅ 正常 | Dracula 配色 + IDE 风格（19KB） |
| `stages.json` | ✅ 正常 | 12 个月 5 个阶段 |
| `buffs.json` | ⚠️ 有遗留 | `doubao_quality_bonus` 键需引擎支持 |
| `achievements.json` | ✅ 正常 | 16个成就（13公开+3隐藏），户部已完成 |
| `endings.json` | ✅ 正常 | 13个结局，ID与engine.js一致，户部已完成 |
| `general.json` | ✅ | 通用事件 |
| `colleagues.json` | ✅ | 同事事件 |
| `monthly.json` | ✅ | 月份事件 |
| `random.json` | ✅ | 随机事件 |
| `choice.json` | ✅ | 选择事件 |
| `daily.json` | ✅ | 每日任务 |
| `models.json` | ✅ | 模型事件 |
| `_manifest.json` | ✅ | 7 系统已注册 |
| `achievement.js` | ✅ 正常 | AchievementManager 6方法+5条件类型，礼部已完成 |


---

## ✅ 已完成模块

| 原编号 | 内容 | 完成时间 |
|:---|:---|:---|
| 模块 A | save.js 恢复（addToLegacySet + events_seen） | ✅ |
| 模块 B | events.js luck 修正（chanceBased 概率 + luckMod） | ✅ |
| 模块 D | buffs.json 修复（键名规范化 + buff_charm 新增） | ✅ |
| 模块 E | 事件内容补充（118 事件 / 7 系统） | ✅ |
| — | engine.js 基础功能（luck微调/charm+luck结局/addToLegacySet/events_seen） | ✅ |

---

## ✅ 模块 1：数据文件创建（户部）— 已完成

> **⚠️ 阻断性** — 礼部和门下省依赖这些文件

**负责文件**：
- `data/achievements.json`（新建）
- `data/endings.json`（新建）

**不要碰**：其他所有文件

### 任务清单

- [ ] 创建 `data/achievements.json`，按 GAME_DESIGN §十一 定义所有成就（13个公开 + 3个隐藏）：
  ```jsonc
  // 格式参考
  {
    "ach_first_run": {
      "icon": "👶", "name": "初来乍到", "desc": "完成1次人生",
      "condition": { "type": "stat_gte", "stat": "runs", "value": 1 },
      "reward": 10, "hidden": false
    }
  }
  ```
  条件类型：`stat_gte` / `ending_unlocked` / `endings_all` / `events_count_gte` / `flag`

- [ ] 创建 `data/endings.json`，包含所有 13 个结局的展示数据：
  ```jsonc
  // 格式参考
  {
    "ai_master": {
      "icon": "🏆", "title": "AI 大师",
      "desc": "康康成为了公司的AI编程专家！", 
      "category": "victory", "coins": 150
    }
  }
  ```
  结局 ID 必须与 `engine.js determineEnding()` 中的 ID 完全一致：
  `ai_shape`, `death`, `breakdown`, `rider`, `bankrupt`, `ending_awakened`, `ending_lucky`, `ai_master`, `indie_dev`, `survived`
  另有 3 个待实现的 ID（模块 2 会加）：`ending_zen`, `ending_doubao_god`, `ending_triangle`

### 必读上下文
- `GAME_DESIGN.md` §八（结局系统）、§十一（成就系统）
- `ARCHITECTURE.md` §3.5（AchievementManager 条件类型）
- `js/engine.js` → `determineEnding()` 方法（看现有结局 ID）

### 验收标准
- [ ] 两个 JSON 格式合法
- [ ] achievements.json 有 16 个成就
- [ ] endings.json 中的结局 ID ⊃ engine.js 中所有实际使用的 ID
- [ ] 条件类型只用这 5 种：`stat_gte` / `ending_unlocked` / `endings_all` / `events_count_gte` / `flag`

---

## ✅ 模块 2：引擎补全（工部）— 已验收

**负责文件**：`js/engine.js`
**只读参考**：`GAME_DESIGN.md`、`js/property.js`（接口）
**不要碰**：`property.js`、`events.js`、`app.js`、`save.js`、任何 JSON 数据文件

### 任务清单

#### 2a. 模型特殊效果（GAME_DESIGN §四.2）
- [ ] 在 `calcQuality()` 或 `processWorkDay()` 中实现 6 个模型的特殊效果：
  - 🐳 豆包：简单任务(⭐)质量+10；10%概率超常发挥(+20)
  - 🤖 GPT-5.4：波动缩小至 ±3（替换 rng(-8,8)）
  - 🎯 Opus 4.6：8%概率拒绝生成（不消耗Token，本次无产出）
  - 🔮 DeepSeek V4：12%概率输出超长代码，额外消耗30% Token
  - 💀 CheapGPT：20%概率输出完全无关内容（质量=0）
  - 🎪 FakeOpus：质量偷偷 -15

#### 2b. 补全隐藏结局（GAME_DESIGN §八）
- [ ] 在 `determineEnding()` 中增加 3 个隐藏结局（放在 charm/luck 结局之后、胜利结局之前）：
  - 🧘 禅意程序员：`brain >= 90` 且全程不用AI（需追踪 `used_ai` flag）
  - 🐳 豆包之神：全程只用豆包 + `avg_quality >= 75`（需追踪 `only_doubao` flag）
  - 🤝 铁三角：`shaoye_rel >= 90 && yimin_rel >= 90`
- [ ] 在 `start()` 中初始化追踪 flag：`used_ai = false`、`only_doubao = true`
- [ ] 在 `processWorkDay()` 中更新追踪 flag（用了非豆包模型时设置）

#### 2c. charm 影响机制（GAME_DESIGN §二.2.3）
- [ ] 在 `processDayEvent()` 中，关系类 effect 应用前加 charm 修正：
  ```js
  // 关系变化修正
  const charmMod = (state.charm - 50) / 100;
  if (result.effect.shaoye_rel) result.effect.shaoye_rel = Math.round(result.effect.shaoye_rel * (1 + charmMod));
  if (result.effect.yimin_rel) result.effect.yimin_rel = Math.round(result.effect.yimin_rel * (1 + charmMod));
  ```
- [ ] 在 `nextMonth()` 中，bossSatisfy 变化加 charm 微调：
  ```js
  sd = Math.round(sd * (1 + (state.charm - 50) / 200));
  ```

#### 2d. 熬夜机制（GAME_DESIGN §三.5）
- [ ] 在 `processWorkDay()` 中，代码质量 < 50 时触发熬夜：
  ```js
  if (quality < 50) {
    const hpLoss = rng(5, 15);
    const brainLoss = rng(3, 8);
    this.property.applyEffect({ hp: -hpLoss, brain: -brainLoss });
    this.property.set('consecutive_overtime', this.property.get('consecutive_overtime') + 1);
    this.emitEvent(`熬夜加班修代码！HP-${hpLoss} 脑力-${brainLoss}`, 'bad');
  } else {
    this.property.set('consecutive_overtime', 0);
  }
  ```
- [ ] 连续加班 ≥3 天触发猝死警告，≥5 天强制休息

#### 2e. doubao_quality_bonus 支持
- [ ] 在 `calcQuality()` 中，如果当前模型是 doubao，检查 `state.doubao_quality_bonus` 并加成

### 必读上下文
- `GAME_DESIGN.md` §二.2.3、§三.3、§三.5、§四.2、§八
- `js/engine.js`（当前文件）
- `js/property.js`（看 applyEffect / setFlag / getFlag 接口，**只读**）

### 验收标准
- [ ] 6 个模型特效都有实现
- [ ] 3 个新隐藏结局可通过 `determineEnding()` 触发
- [ ] charm 影响关系变化和 bossSatisfy
- [ ] 代码质量 < 50 会触发熬夜
- [ ] `buff_doubao` 的 `doubao_quality_bonus` 在用豆包时生效

---

## ✅ 模块 3：成就系统（礼部）— 已验收

> **前置依赖**：模块 1（achievements.json）完成后开工

**负责文件**：`js/achievement.js`（新建）
**不要碰**：其他所有现有 JS 文件、HTML、CSS

### 任务清单

- [ ] 导出 `AchievementManager` 类，接口：
  - `async load()` — 加载 `data/achievements.json`
  - `bind(legacy)` — 绑定传世存档对象
  - `check(state)` — 检测所有成就条件，返回本次新解锁的列表
  - `getAll()` — 返回全部成就定义
  - `getUnlockedIds()` — 返回已解锁 ID 集合
  - `onUnlock(callback)` — 注册解锁回调
- [ ] 5 种条件类型实现：
  - `stat_gte`：`legacy[stat] >= value`
  - `ending_unlocked`：`legacy.endings_unlocked.includes(endingId)`
  - `endings_all`：`endingIds.every(id => legacy.endings_unlocked.includes(id))`
  - `events_count_gte`：`legacy.events_seen.length >= value`
  - `flag`：`legacy[flagName] === true`

### 必读上下文
- `ARCHITECTURE.md` §3.5（AchievementManager 接口定义）
- `GAME_DESIGN.md` §十一（成就设计）
- `data/achievements.json`（模块 1 的产出）

### 验收标准
- [ ] `import { AchievementManager } from './achievement.js'` 不报错
- [ ] AchievementManager 能加载 achievements.json 并检测条件

---

## ❌ 模块 4：Overlay UI + 交互功能（门下省）— 验收未通过，需重做

> **前置依赖**：模块 1（数据文件）+ 模块 3（achievement.js）完成后开工

**负责文件**：`js/app.js`（追加逻辑）
**只读参考**：`index.html`（看 HTML 结构）、`js/achievement.js`、`js/save.js`
**不要碰**：`engine.js`、`property.js`、`events.js`、`index.html`、`style.css`

### 任务清单

#### 4a. Overlay 面板逻辑
- [ ] 图鉴面板 `#galleryOverlay` — 读 `legacy.events_seen`，按系统分 Tab
- [ ] 结局面板 `#endingsOverlay` — 读 `legacy.endings_unlocked` + `data/endings.json`，含剪影/解锁态
- [ ] 成就面板 `#achieveOverlay` — 读 `achieveMgr.getAll()` + `getUnlockedIds()`
- [ ] 三个按钮绑定事件（`#galleryBtn` / `#endingsBtn` / `#achieveBtn`）
- [ ] overlay 关闭按钮 `.overlay-close[data-close]` 绑定

#### 4b. 游戏内集成 achievement 检测
- [ ] 在 `game.onGameEnd` 回调中调用 `achieveMgr.check()` + 显示解锁 toast
- [ ] 在 `game.onMonthSummary` 回调中也检测一次

### 必读上下文
- `index.html`（看 overlay 和按钮的 HTML 结构）
- `js/app.js`（当前文件）
- `js/achievement.js`（模块 3 的产出，看接口）
- `js/save.js`（看 legacy 数据结构）
- `css/style.css`（overlay 样式已有）

### 验收标准
- [ ] 三个 overlay 可正常打开/关闭
- [ ] 图鉴显示已遇到的事件
- [ ] 结局面板显示已解锁/未解锁的结局
- [ ] 成就面板显示进度

---

## 🟡 模块 5：游戏内交互 UI（兵部 + 门下省协作）

> **独立任务** — 可与模块 2 并行，但建议在模块 2 之后

**负责文件**：
- 兵部：`index.html`（在 terminal-bar 区域增加按钮）
- 门下省：`js/app.js`（追加交互逻辑）

**不要碰**：`engine.js`、`property.js`、`events.js`

### 任务清单
- [ ] 在 `index.html` terminal-bar 中添加：买Token按钮、换模型按钮、接私活按钮
- [ ] 在 `app.js` 中实现：
  - 买Token面板（弹出Token价格表，点击购买扣钱加Token）
  - 换模型面板（显示已解锁模型列表，点击切换）
  - 接私活逻辑（随机收入，有被老板发现的风险）

*注：此模块可后续再排，优先级低于模块 1-4*

---

## 👑 大内总管（中书省）

**角色**：项目总协调，TODO 维护 + 任务分派 + 最终验收
**工作流**：`.agents/workflows/chief-steward.md`（详细分工体系）

### 🏛️ 御史台（调试与验收）— 大内总管独占

> **核心规则**：只有大内总管有权启动服务器、打开浏览器、运行游戏测试。
> 小官员（各部门 AI）只负责写代码/数据，交活即止。

验收流程：
1. 各部门 AI 交活 → 大内总管代码审查
2. 大内总管启动 `http-server` 在 **9090 端口**（唯一调试端口）
3. 大内总管在浏览器检查功能
4. 通过 → 标记 ✅；不通过 → 打回修改

### 三省六部速查

| 部门 | 管辖 | 当前模块 |
|:---|:---|:---|
| 中书省 + 御史台（大内总管） | TODO / 架构 / 调试验收 | 协调 |
| ⚙️ 工部 | engine.js | 模块 2 |
| 🎵 礼部 | achievement.js（新建） | 模块 3 |
| 🖼️ 门下省 | app.js（追加逻辑） | 模块 4、5 |
| 💾 户部 | achievements.json / endings.json（新建） | 模块 1 |
| 🎨 兵部 | index.html / style.css | 模块 5 |
| 📚 翰林院 | data/events/*.json | 按需 |

### 开工顺序

```
第一批（可并行）：
  模块 1（户部）→ achievements.json + endings.json
  模块 2（工部）→ engine.js 补全

第二批（等模块 1 完成）：
  模块 3（礼部）→ achievement.js  ← 依赖模块 1 的 achievements.json

第三批（等模块 3 完成）：
  模块 4（门下省）→ Overlay UI  ← 依赖模块 3

独立/可后排：
  模块 5（兵部+门下省）→ 买Token/换模型/接私活 UI
```

---

## 👔 集成验收清单（全部模块完成后）

### 通用检查
- [ ] 游戏能正常启动（`http-server :9090` 无控制台报错）
- [ ] 所有 JSON 格式合法
- [ ] 没有修改不属于自己模块的文件
- [ ] 所有 import/export 链完整（无 `undefined is not a function`）

### 数据一致性检查
- [ ] `achievements.json` 中的结局 ID 与 `engine.js determineEnding()` 的 ID 一致
- [ ] `endings.json` 中的结局 ID 与 `engine.js determineEnding()` 的 ID 一致
- [ ] `buffs.json` effect 键名 ⊂ `property.js` 可处理的键名集
- [ ] 事件中 `include`/`exclude` 使用的键名都在 `property.js` 的 data 或 flags 中
- [ ] `_manifest.json` 列出的文件都存在于 `data/events/`

### 功能验收
- [ ] 6 个模型特殊效果均有体现
- [ ] 所有 6 个隐藏结局可触发
- [ ] charm 影响关系变化
- [ ] 熬夜机制正常工作
- [ ] 三个 overlay 面板可打开/关闭/显示正确数据

- [ ] 传世存档正常读写
