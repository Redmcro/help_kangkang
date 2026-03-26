# 🔧 TODO — 并发任务分配表

> **最后审计：2026-03-26 12:43**
> 规则：每个 AI 只修改自己模块列出的文件。完成后 @主管检查。

---

## 当前状态总览

| 文件 | 状态 | 说明 |
|:---|:---|:---|
| `property.js` | ✅ 正常 | v2 属性完整（含 charm/luck），Flag 系统正常 |
| `engine.js` | ⚠️ 功能不全 | 月份循环正常，但缺 achievement/audio 集成、luck 修正、charm/luck 结局 |
| `events.js` | ⚠️ 缺 luck 修正 | month 筛选正确，但 chanceBased 不受 luck 影响 |
| `save.js` | ⚠️ 被回退 | 丢失 `events_seen`/`achievements_unlocked`/`addToLegacySet`/音频偏好 |
| `app.js` | ⚠️ 功能不全 | IDE UI 正常，但缺 overlay 面板 JS 逻辑、无 audio 控制 |
| `index.html` | ✅ 结构完整 | 三个 overlay 面板 HTML 已有，音频按钮已有 |
| `css/style.css` | ✅ 正常 | Dracula 配色 + IDE 风格（19KB） |
| `stages.json` | ✅ 正常 | 12 个月 5 个阶段 |
| `buffs.json` | ⚠️ 自定义键无效 | `doubao_bonus`/`luck_bonus`/`death_threshold` 无法被 applyEffect 处理 |
| `achievements.json` | ✅ 数据正常 | 16 个成就定义（但前端无法读取，缺 achievement.js） |
| `general.json` | ⚠️ 内容不足 | 7KB/25 个事件（原 40KB 被覆盖） |
| `colleagues.json` | ✅ 正常 | 14KB 同事事件 |
| `_manifest.json` | ⚠️ 未更新 | 只有 `general` + `colleagues`，缺其他系统 |
| `achievement.js` | ❌ 被删除 | 之前存在（3.8KB），被另一个 AI 覆盖时丢失 |
| `audio.js` | ❌ 被删除 | 之前存在（9.5KB），被另一个 AI 覆盖时丢失 |

---

## ✅ 模块 A：save.js 恢复（阻断性 — 其他模块依赖）

**负责文件**：`js/save.js`
**不要碰**：其他所有文件

恢复以下丢失内容：
- [x] `DEFAULT_LEGACY` 补回字段：`events_seen: []`、`achievements_unlocked: []`、`total_tokens_spent: 0`、`total_bugs_fixed: 0`、`total_money_earned: 0`
- [x] `loadLegacy()` 补回数组安全检查（`events_seen`/`achievements_unlocked`）
- [x] 恢复 `export function addToLegacySet(legacy, field, value)` — engine.js 需要用
- [x] 恢复音频偏好：`loadAudioPrefs()` / `saveAudioPrefs()`（用独立 key `kk2_audio`）

**验收**：`import { addToLegacySet, loadAudioPrefs, saveAudioPrefs } from './save.js'` 不报错。 ✅ 已通过

---

## 🟡 模块 B：events.js 加 luck 修正

**负责文件**：`js/events.js`
**不要碰**：其他所有文件

- [ ] `executeChoice()` 中 `chanceBased` 分支添加 luck 修正：
  ```js
  // state.luck 影响概率（GAME_DESIGN 二.2.3）
  const luckMod = ((state.luck || 50) - 50) / 100;
  branches[0].adjustedChance *= (1 + luckMod);
  for (let i = 1; i < branches.length; i++) {
    branches[i].adjustedChance *= (1 - luckMod * 0.5);
  }
  ```

**验收**：luck=70 时第一个分支概率明显偏高。

---

## 🟢 模块 C：engine.js 补全 ✅ 已通过

**负责文件**：`js/engine.js`
**只读参考**：`GAME_DESIGN.md`
**不要碰**：`property.js`、`events.js`、`app.js`

- [ ] `calcQuality()` 加 luck 微调：`+ (luck - 50) * 0.05`
- [ ] `determineEnding()` 加 charm/luck 隐藏结局：
  - `charm >= 85 && bossSatisfy >= 70` → 🌟人间清醒 `ending_awakened`（coins: 110）
  - `luck >= 90` → 🍀欧皇降临 `ending_lucky`（coins: 120）
- [ ] 重新 import `addToLegacySet` from `save.js`（模块 A 完成后）
- [ ] `endGame()` 中 `addToLegacySet(this.legacy, 'endings_unlocked', ending.id)` 替代手动 push
- [ ] `processWorkDay()` / `processDayEvent()` 中追踪 `events_seen`

**验收**：charm/luck 结局可触发，events_seen 累计。

---

## ✅ 模块 D：buffs.json 修复

**负责文件**：`data/buffs.json`
**不要碰**：其他所有文件

- [x] `buff_lucky`：`"luck_bonus": 15` → `"luck": 20`
- [x] `buff_social`：补 `"charm": 10`
- [x] `buff_doubao`：`"doubao_bonus": 15` → `"doubao_quality_bonus": 15`（需引擎配合）
- [x] `buff_insurance`：`"death_threshold": -20` → `"hp": 20`（简化为直接加 HP）
- [x] 新增 `buff_charm`：`{"id":"buff_charm","icon":"✨","name":"天生丽质","desc":"魅力+15","cost":50,"effect":{"charm":15},"unlock":"人间清醒结局"}`

**验收**：所有 `effect` 键名在 `property.js` 可处理（`doubao_quality_bonus` 需引擎侧支持）。

---

## 🟢 模块 E：事件内容补充 ✅ 已通过（118 事件/7 系统）

**负责文件**：`data/events/` 下**新建**文件 + `data/events/_manifest.json`
**⚠️ 不要修改**：`general.json`、`colleagues.json`
**只读参考**：`design/` 下各系统的 `_ai_spec.md` + `settings.md`

- [ ] 新建 `data/events/monthly.json` — 12 个月主线事件（月份大事件 × 12 + 子事件若干）
- [ ] 新建 `data/events/random.json` — 15+ 随机事件（正:负:中性 ≈ 4:4:2）
- [ ] 新建 `data/events/choice.json` — 8+ 选择事件（3 选项：安全/冒险/第三路）
- [ ] 新建 `data/events/daily.json` — 10+ 每日任务填充事件（`filler: true`）
- [ ] 新建 `data/events/models.json` — 模型解锁/相关事件
- [ ] 更新 `_manifest.json` → `["general","colleagues","monthly","random","choice","daily","models"]`

**验收**：事件总数 ≥ 80，每月可触发 ≥ 5 个。

---

## ⚪ 模块 F：achievement.js + audio.js 重建

**负责文件**：`js/achievement.js`（新建）、`js/audio.js`（新建）
**只读参考**：`data/achievements.json`、`ARCHITECTURE.md` 3.5/3.6
**不要碰**：其他现有 JS 文件

- [ ] 重建 `achievement.js`（参考之前被删版本的接口）：
  - `load()` / `bind(legacy)` / `check()` / `getAll()` / `getUnlockedIds()` / `onUnlock(cb)`
  - 5 种条件：`stat_gte` / `ending_unlocked` / `endings_all` / `events_count_gte` / `flag`
- [ ] 重建 `audio.js`（Web Audio API 合成，零外部文件）：
  - `init()` / `play(soundId)` / `startBGM()` / `stopBGM()` / `toggleMute()`
  - 音效：click, good, bad, special, choice, achievement, month_end, win, lose

**验收**：`import { AchievementManager } from './achievement.js'` 不报错。

---

## ⚪ 模块 G：Overlay UI 逻辑（依赖模块 A + F）

**负责文件**：`js/app.js`（追加逻辑）
**只读参考**：`index.html`（overlay HTML 已就位）
**不要碰**：`engine.js`、`property.js`、`events.js`

前提：模块 A（save.js）+ 模块 F（achievement.js）完成后才能开始。

- [ ] 图鉴面板 `#galleryOverlay` — 读 `legacy.events_seen`，按系统分 Tab
- [ ] 结局面板 `#endingsOverlay` — 读 `legacy.endings_unlocked`，含剪影/解锁态
- [ ] 成就面板 `#achieveOverlay` — 读 `achieveMgr.getAll()` + `getUnlockedIds()`
- [ ] 三个按钮绑定事件（`#galleryBtn` / `#endingsBtn` / `#achieveBtn`）
- [ ] overlay 关闭按钮 `.overlay-close` 绑定
- [ ] 音频按钮 `#audioToggle` / `#bgmToggle` 绑定

**验收**：三个 overlay 可正常打开/关闭，显示正确数据。

---

## 👔 主管检查清单

### 依赖顺序
```
A (save.js) → C (engine.js) + F (achievement/audio)
B (events.js luck) → 独立
D (buffs.json) → 独立
E (事件内容) → 独立
F → G (overlay UI)
```

### 通用检查
- [ ] 游戏能正常启动（`http-server` 无控制台报错）
- [ ] 所有 JSON 格式合法
- [ ] 没有修改不属于自己模块的文件
- [ ] 所有 import/export 链完整（无 `undefined is not a function`）

### 数据一致性检查
- [ ] `achievements.json` 中的结局 ID 与 `engine.js determineEnding()` 的 ID 一致
- [ ] `buffs.json` effect 键名 ⊂ `property.js` 可处理的键名集
- [ ] 事件中 `include`/`exclude` 使用的键名都在 `property.js` 的 data 或 flags 中
- [ ] `_manifest.json` 列出的文件都存在于 `data/events/`
