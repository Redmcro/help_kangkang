# 🐷 康康逆天改命 — 游戏基础设定

> **本文件是游戏设计的唯一真相源（Single Source of Truth）。**
> 所有数值、机制、规则以本文件为准。AI 生成事件时必读。
> 最后更新：2026-03-27

---

## 一、核心概念

> 康康是一名 Unity 程序员，开局只有一个豆包 AI。在 12 个月内，他要学会驾驭各种 AI 模型写代码、管理金钱和脑力、应对老板考核和同事关系、经营女朋友感情，最终保住饭碗——否则就去送外卖。

**游戏类型**：12 个月职场生存模拟 + Roguelike Meta 进度

**核心体验循环**：

```
选Buff(最多3个) → 进入1月 → 每月循环 → 12月年终审判 → 结局
                                ↓
每月流程：
  月初（2~12月发工资与扣生活费 / 按恢复率恢复 / 模型解锁）
  → 工作日（5~7天，选模型写代码→扣费→判定Bug→低质量触发加班）
  → 穿插随机事件/选择事件/同事事件/女朋友事件/生活开销事件
  → 月末结算（平均质量→老板满意度，money≤0累计破产月）
```

### 1.1 v3 Authoring/Runtime 合约（策划落版口径）

- 当事件节点存在 `actions[]` 时，运行时只执行 `actions[]` 路径，`actions[]` 是唯一权威语义。
- `effect` / `setFlag` / `flags` / `tokenCost` 属于过渡兼容字段，仅用于兼容旧事件，不作为 v3 新内容主写法。
- 事件（策划内容）只表达意图（intent）；运行时（engine）负责结算（settlement）与定价（pricing）。
- 模型切换、模型解锁、扣费统一写 action 意图，不在事件里硬编码价格、折扣和余额判定公式。

#### v3 示例（只写意图，不写结算公式）

```jsonc
"actions": [
  { "type": "switch_model", "modelId": "gpt54" },
  { "type": "charge_tokens", "amount": 1500, "reason": "model_usage" },
  { "type": "stat_delta", "delta": { "brain": -4, "bossSatisfy": 1 } },
  { "type": "set_flag", "flag": "switched_to_gpt54", "value": true }
]
```

---

## 二、属性系统

### 2.1 核心属性（UI 可见）

| 属性 | 键名 | 图标 | 初始值 | 范围 | 说明 |
|:---|:---|:---|:---|:---|:---|
| 生命 | `hp` | ❤️ | 80 | 0–100 | 健康/体力，归零=猝死结局 |
| 金钱 | `money` | 💰 | 3000 | 0–∞ | 单位：元，使用AI模型直接扣钱 |
| 脑力 | `brain` | 🧠 | 60 | 0–100 | 理解/改Bug能力，归零=精神崩溃结局 |
| 老板满意度 | `bossSatisfy` | 👔 | 40 | 0–100 | 决定结局的核心指标 |

### 2.2 同事关系属性（UI 可见）

| 属性 | 键名 | 初始值 | 范围 | 说明 |
|:---|:---|:---|:---|:---|
| 少爷好感 | `shaoye_rel` | 50 | 0–100 | QA测试同事 |
| 亿民好感 | `yimin_rel` | 50 | 0–100 | 资深程序员同事 |

### 2.2b 女朋友关系属性

| 属性 | 键名 | 初始值 | 范围 | 说明 |
|:---|:---|:---|:---|:---|
| 女友好感 | `gf_rel` | 50 | 0–100 | 女朋友关系值 |
| 有女朋友 | `has_girlfriend` | true | bool | 是否有女朋友 |
| 已婚 | `married` | false | bool | 是否已结婚 |

### 2.3 隐藏属性（UI 不显示，影响事件触发和结果）

> 玩家看不到这两个数值，但它们在幕后持续影响游戏走向。

| 属性 | 键名 | 图标 | 初始值 | 范围 | 说明 |
|:---|:---|:---|:---|:---|:---|
| 魅力 | `charm` | ✨ | 50 | 0–100 | 社交能力，影响同事关系增益、老板印象、谈判结果 |
| 运气 | `luck` | 🍀 | 50 | 0–100 | 影响概率选择、Bug率修正、随机事件倾向 |

#### 魅力 (`charm`) 影响机制

```
同事关系变化修正：
  实际关系变化 = 基础变化 × (1 + (charm - 50) / 100)
  charm 70 → 关系+10 实际变为 +12
  charm 30 → 关系+10 实际变为 +8

老板满意度（社交类）修正：
  "主动加班" "学AI新技能" 等行为的 bossSatisfy 变化 × (1 + (charm - 50) / 200)
  charm 高 → 老板更赏识你，同等努力获得更多认可

接私活谈判：
  私活收入 = 基础收入 × (1 + (charm - 50) / 100)
  charm 70 → 私活5000变为6000

社交事件触发：
  charm > 70 → 解锁特殊社交事件（团建邀请、同事求助等）
  charm < 30 → 触发尬聊/被忽视事件
```

#### 运气 (`luck`) 影响机制

```
chanceBased 选择修正（同 v1 机制）：
  luckMod = (luck - 50) / 100
  第一个分支权重 × (1 + luckMod)
  其他分支权重 × (1 - luckMod × 0.5)
  luck 70 → 好结果概率 +20%

Bug 率修正：
  实际BugRate = 模型BugRate × (1 - (luck - 50) / 200)
  luck 70 → Bug率降低10%
  luck 30 → Bug率提高10%

随机事件倾向：
  luck > 60 → 正面随机事件权重 +30%
  luck < 40 → 负面随机事件权重 +30%

特殊触发：
  luck > 80 → 可能触发"天降横财"等极小概率事件
  luck < 20 → 可能触发"连环霉运"事件链
```

#### 隐藏属性变化来源

| 事件类型 | charm 变化 | luck 变化 |
|:---|:---|:---|
| 主动社交（请奶茶/团建） | +3~5 | — |
| 帮助同事 | +2~5 | +1~3 |
| 被夸/好评 | +2~3 | — |
| 社交尴尬/冲突 | -3~5 | — |
| 概率事件成功 | — | +2~3 |
| 概率事件失败 | — | -2~3 |
| 选择"安全"选项 | — | +1（稳） |
| 选择"冒险"选项 | — | ±随机 |
| 运动/锻炼 | +1~2 | — |
| 熬夜/加班 | -1~2 | -1 |

> **设计意图**：隐藏属性让玩家感受到"运气"和"人缘"在幕后的影响，但无法精确控制，增加 Roguelike 的不确定感。

### 2.5 属性变化因果律

> 所有事件效果必须遵循以下因果映射。

| 属性 | 代表 | 扣的原因 | 回的原因 |
|:---|:---|:---|:---|
| ❤️ HP | 身体/作息 | 熬夜、加班、玩太晚、生病 | 休息、运动、好好吃饭 |
| 🧠 Brain | 精神/脑力 | 修Bug、烧脑任务、开会 | 偷懒、摸鱼、社交聊天 |
| 👔 Boss | 工作表现 | 代码差、延期、摸鱼被发现 | 代码好、准时交付、学AI |
| 💰 Money | 经济 | 生活开销、AI费用 | 薪资、奖金、私活 |

### 2.4 状态属性（内部追踪）

| 属性 | 键名 | 类型 | 说明 |
|:---|:---|:---|:---|
| 当前模型 | `current_model` | string | 当前使用的AI模型键名 |
| 当前月份 | `month` | number | 1–12 |
| 当前工作日 | `day` | number | 当月工作日序号（1~7） |
| 是否加班 | `is_overtime` | bool | 当日 `quality < 40` 时为 true，否则为 false |
| 连续加班天数 | `consecutive_overtime` | number | ≥3进入高压警告，≥5触发额外HP损失后清零 |
| 平均代码质量 | `avg_quality` | number | 月度/全局统计 |
| 累计Bug数 | `total_bugs` | number | 统计数据 |
| Bug积压数 | `bug_backlog` | number | 经济骨干预留字段（已注册，待接入主结算） |
| 本月新增Bug | `new_bugs_month` | number | 经济骨干预留字段（已注册，待接入主结算） |
| 本月修复Bug | `fixed_bugs_month` | number | 经济骨干预留字段（已注册，待接入主结算） |
| 本月加班时长 | `overtime_hours_month` | number | 经济骨干预留字段（已注册，待接入主结算） |
| 月薪 | `salary` | number | 初始3000，可加薪 |
| 生活费 | `living_cost` | number | 月初扣除，初始1500 |
| 连续破产月 | `months_bankrupt` | number | 连续3月触发破产结局 |

### 2.4 Flag 注册表

> 所有 `set_flag`（Legacy: `setFlag`）设置的 Flag 都必须在此登记。

#### 模型解锁 Flag

| Flag | 来源 | 设置时机 |
|:---|:---|:---|
| `model_doubao_unlocked` | ai_models | 1月开局 |
| `model_gpt54_unlocked` | ai_models | 2月解锁 |
| `model_opus46_unlocked` | ai_models | 3月解锁 |
| `model_cheapgpt_unlocked` | ai_models | 3月选择 |
| `model_deepseek_v4_unlocked` | ai_models | 4月解锁 |
| `model_fakeopus_unlocked` | ai_models | 5月选择 |

#### 同事/剧情 Flag

| Flag | 来源 | 说明 |
|:---|:---|:---|
| `yimin_ai_convert` | colleagues | 亿民开始学AI |
| `yimin_cost_discount` | colleagues | AI使用费打8折 |
| `learned_ai_course` | choice | 购买AI课程，brain判定加成 |
| `switched_to_doubao` | choice | 余额不足切豆包 |
| `considered_delivery` | choice | 考虑过送外卖 |
| `gamejam_won` | monthly | GameJam获奖，解锁独立开发者结局 |

---

## 三、数值机制

### 3.0 经济-压力闭环（实现口径）

```
模型档位选择（质量/价格/bug率）
  → 任务质量与花费
  → Bug触发与脑力消耗（`total_bugs` 累计）
  → 低质量触发加班与HP流失
  → 月末 avg_quality 结算 bossSatisfy
  → bossSatisfy 与 money 决定是否能活到年底
  → 通过恢复行为（午休、摸鱼、吃饭、健身等事件）补回 hp/brain 继续循环
```

注：`bug_backlog/new_bugs_month/fixed_bugs_month/overtime_hours_month` 已作为经济字段注册，当前版本先用于字段对齐，后续版本再接入月结算。

### 3.1 每月恢复与工资结算（月初自动执行）

```
if month > 1:
  money += salary - living_cost

brainRecoverBase = brain_regen_rate（默认 0）
hpRecoverBase    = hp_regen_rate（默认 0）

if consecutive_overtime > 0:
  brainRecover = floor(brainRecoverBase / 2)
  hpRecover    = floor(hpRecoverBase / 2)
else:
  brainRecover = brainRecoverBase
  hpRecover    = hpRecoverBase

brain += brainRecover（上限100）
hp    += hpRecover（上限100）
```

### 3.2 属性联动 & 阈值

```
hp ≤ 0        → 猝死结局
brain ≤ 0     → 精神崩溃结局
bossSatisfy < 15  → 被裁 → 外卖骑手结局
months_bankrupt ≥ 3 → 破产结局

brain < 30    → 质量基础值额外 -20（脑雾）

money 不足当前模型费用
  → 当天自动切纯人肉
  → 追加 brain -[8,15]

月末结算时：
  if money <= 0: months_bankrupt += 1
  else: months_bankrupt = 0
```

### 3.3 代码质量计算

```
baseQuality   = 模型基础质量值（纯人肉 = brain × 0.5）
if brain < 30:
  baseQuality -= 20

brainBonus    = (brain - 50) × 0.3
taskPenalty   = ⭐:0, ⭐⭐:-5, ⭐⭐⭐:-10, ⭐⭐⭐⭐:-20
randomRoll    = random(-8, +8)（GPT-5.4改为 random(-3, +3)）
luckBonus     = (luck - 50) × 0.05         ← 🍀 运气微调代码质量（±2.5）
modelSpecial  = 模型特殊效果修正

finalQuality  = clamp(baseQuality + brainBonus + taskPenalty + randomRoll + luckBonus + modelSpecial, 0, 100)
```

### 3.4 老板满意度规则

```
月末基础变动（按 avg_quality）：
  avg_quality ≥ 90  → +2
  avg_quality ≥ 70  → +1
  avg_quality ≥ 50  → 0
  avg_quality ≥ 30  → -2
  avg_quality < 30  → -5

魅力修正：
  satisfyDelta = round(baseDelta × (1 + (charm - 50) / 200))
```

| 满意度 | 状态 |
|:---|:---|
| ≥ 80 | 🌟 晋升/大幅加薪 |
| 60–79 | ✅ 安全区 |
| 40–59 | ⚠️ 危险，可能被约谈 |
| 15–39 | 🔴 高危区 |
| < 15 | 💀 立即被裁 |

### 3.5 熬夜机制

```
当代码质量 < 40 时触发加班：
    is_overtime = true
    hp -= random(3, 8) + random(2, min(5, 2 + consecutive_overtime))
    consecutive_overtime += 1

当代码质量 ≥ 40：
    is_overtime = false
    consecutive_overtime = 0

连续加班计数器：
    ≥ 3：触发高压加班提示（风险警告）
    ≥ 5：额外 hp -random(3, 6) 后清零计数器
```

---

## 四、AI 模型系统

### 4.1 模型参数

| 模型 | 键名 | 解锁月 | 任务消耗(⭐~⭐⭐⭐⭐) | 单价(¥/M) | 质量基础 | Bug率 |
|:---|:---|:---|:---|:---|:---|:---|
| 🐳 豆包 | `doubao` | 1月 | 10/30/80/200M | ¥0 | 45 | 40% |
| 🤖 GPT-5.4 | `gpt54` | 2月 | 40/100/300/800M | ¥15 | 80 | 12% |
| 🎯 Opus 4.6 | `opus46` | 3月 | 60/150/400/1000M | ¥25 | 92 | 5% |
| 🔮 DeepSeek V4 | `deepseek_v4` | 4月 | 15/50/120/300M | ¥8 | 72 | 18% |
| 💀 CheapGPT | `cheapgpt` | 3月 | 5/20/50/120M | ¥3 | 30 | 10%~80%（日波动） |
| 🎪 FakeOpus | `fakeopus` | 5月 | 8/30/70/180M | ¥5 | 35 | 15%~75%（日波动） |
| 🧠 纯人肉 | — | — | — | — | brain×0.5 | — |

> **费用计算**：每次任务实际花费 = 任务消耗(M) × 单价(¥/M)。
> 例：用 GPT-5.4 做⭐⭐任务 = 100M × ¥15 = ¥1500，直接从 `money` 扣除。
> 余额不足时自动降级为纯人肉写代码，并额外 `brain -[8,15]`。

### 4.2 模型特殊效果

| 模型 | 特殊效果 |
|:---|:---|
| 🐳 豆包 | 中文注释满分；简单UI任务质量+10；10%概率超常发挥(+20) |
| 🤖 GPT-5.4 | 非常稳定，波动仅±3 |
| 🎯 Opus 4.6 | 8%概率拒绝生成（不消耗费用） |
| 🔮 DeepSeek V4 | 12%概率输出超长无用代码，额外消耗30%费用 |
| 💀 CheapGPT | 20%概率输出完全无关内容（质量=0） |
| 🎪 FakeOpus | 输出看起来很唬但逻辑全错，质量偷偷-15 |

### 4.3 Bug 修复机制

```
if random() < bugRate:
    bugSeverity = taskComplexity × (1 - modelQuality / 100)
    brainCost   = floor(bugSeverity × 3) + random(2, min(5, 2 + taskComplexity))
    brain -= brainCost
```

---

## 五、月份阶段 & 主线

| 阶段 | 月份 | 名称 | 主线 |
|:---|:---|:---|:---|
| 🌱 | 1月 | 新手上路 | 教学月，只有豆包，任务简单 |
| 📖 | 2–3月 | 摸索期 | GPT/Opus/CheapGPT涌现 |
| ⚔️ | 4–6月 | 生存战 | 裁员开始+DeepSeek+大项目Deadline |
| 🔥 | 7–9月 | 冲刺期 | 高温加班+半年考核+GameJam |
| 🏆 | 10–12月 | 审判日 | 模型大战+年底冲刺+年终审判→结局 |

### 每月流程

```
月初：2~12月执行工资结算(money += salary - living_cost) → 按恢复率恢复 → 模型解锁 → 月份大事件
工作日(5~7天)：选模型写代码并扣费 → 可能出Bug(掉brain) → 低质量触发加班(掉hp) → 穿插随机/选择/同事事件
月末：代码质量统计(avg_quality) → 老板满意度变化 → money≤0累计破产月 → 下月预告
```

---

## 六、同事系统

### 少爷（QA测试，26岁）
- 测试极其认真，"Bug杀手"；表面毒舌，实则照顾人
- 关系 0–20: Bug报告特别严格，质量-5
- 关系 51–70: 偶尔帮改测试报告
- 关系 71–90: 提前透露老板评价
- 关系 91–100: 帮你挡过一次裁员

### 亿民（资深Unity程序员，32岁）
- 技术过硬，"定海神针"；不善社交但对认可的人真诚
- 关系 51–70: 偶尔分享技巧，质量+5
- 关系 71–90: 帮你Code Review，质量+10
- 关系 91–100: 紧急时刻替你写代码

---

## 七、经济系统

### 收入来源

| 来源 | 金额 | 频率 |
|:---|:---|:---|
| 开局现金 | 3000 | 开局一次 |
| 月薪 | 3000（`salary`） | 2~12月月初 |
| 季度考核调薪 | 常见 +500 / -300（改 `salary`） | 3/6/9月事件 |
| 接私活 | 300~1500 | 主动选择（有风险） |
| GameJam获奖 | 10000 | 一次性 |

### 支出

| 支出项 | 金额 | 频率 | 说明 |
|:---|:---|:---|:---|
| 生活费 | 1500（`living_cost`） | 2~12月月初 | 月初自动扣除 |
| AI模型费用 | 任务消耗×单价 | 每个工作日 | 按任务直接从money扣 |
| 生活开销事件 | 不定 | 随机 | 聚餐、医疗、购物等 |
| 女友约会 | 不定 | 随机 | 女朋友相关事件消费 |

> **注意**：不再有 Token 属性和 Token 商店。所有 AI 使用费用直接从 `money` 扣除。
> v3 事件作者侧统一使用 `charge_tokens` 表达扣费意图，由运行时按模型规则结算到 `money`。

### 破产机制

```
money 不足当前模型费用：当天自动切纯人肉 + 追加 brain 消耗
月末 money ≤ 0：months_bankrupt +1
月末 money > 0：months_bankrupt 清零
months_bankrupt ≥ 3：破产结局
```

---

## 八、结局系统

12月底年终审判触发结局判定（优先级：隐藏→失败→胜利→兜底）。

### 胜利结局

| 结局 | 条件 | 金币 |
|:---|:---|:---|
| 🏆 AI 大师 | bossSatisfy ≥ 80, avg_quality ≥ 80 | 150 |
| ✅ 安稳过关 | bossSatisfy ≥ 50 | 80 |
| 🎮 独立开发者 | gamejam_won = true | 120 |

### 失败结局

| 结局 | 条件 | 金币 |
|:---|:---|:---|
| 🛵 外卖骑手 | bossSatisfy < 15 / 年终不达标 | 30 |
| 💀 过劳猝死 | hp ≤ 0 | 20 |
| 😵 精神崩溃 | brain ≤ 0 | 20 |
| 💸 破产回家 | months_bankrupt ≥ 3 | 10 |

### 隐藏结局

| 结局 | 条件 | 金币 |
|:---|:---|:---|
| 🤖 成为AI的形状 | brain < 10 | 50 |
| 🧘 禅意程序员 | brain ≥ 90, 全程不用AI | 100 |
| 🐳 豆包之神 | 全程只用豆包, avg_quality ≥ 75 | 130 |
| 🤝 铁三角 | shaoye_rel ≥ 90, yimin_rel ≥ 90 | 100 |
| 🌟 人间清醒 | charm ≥ 85, bossSatisfy ≥ 70 | 110 |
| 🍀 欧皇降临 | luck ≥ 90（极难达到） | 120 |

---

## 九、转世 Meta 系统

### 传世金币计算

```
base         = 存活月份 × 10
qualityBonus = floor(avg_quality / 10)
satisfyBonus = floor(bossSatisfy / 5)
endingBonus  = 结局奖励

totalCoins   = base + qualityBonus + satisfyBonus + endingBonus
```

### 传世存档

```json
{ "coins": 0, "best_month": 0, "runs": 0, "wins": 0,
  "endings_unlocked": [], "events_seen": [], "achievements_unlocked": [] }
```

### Buff 商店（每局最多携带 3 个）

| Buff | ID | 效果 | 花费 | 解锁条件 |
|:---|:---|:---|:---|:---|
| ☕ 咖啡成瘾 | `buff_coffee` | brain +15, hp -10 | 20 | 完成1局 |
| 💎 家里有矿 | `buff_trust_fund` | money +8000 | 40 | 获得任一胜利结局 |
| 🏕️ 极简生活 | `buff_minimalist` | living_cost -800（每月结算时生效） | 35 | "破产回家"结局 |
| 🧘 身体调理 | `buff_hp_regen` | hp_regen_rate +6（上月有连续加班则减半） | 35 | 完成1局 |
| 🦋 社交蝴蝶 | `buff_social_butterfly` | shaoye_rel +20, yimin_rel +20, gf_rel +10, charm +15 | 55 | "铁三角"结局 |
| 🐳 豆包大师 | `buff_doubao_master` | doubao_quality_bonus +20（仅作用于豆包质量） | 80 | "豆包之神"结局 |

---

## 十、数值平衡参考

### 10.0 难度目标（本轮调优基线）

```
目标通关率（isWin）≈ 40%
可接受区间：35% ~ 45%
样本口径：平均水平玩家、多局游玩后统计
```

### 10.1 当前设计缺口与改进方向（对齐目标通关率 ~40%）

| 设计缺口 | 当前风险 | 改进动作（可落地） | 验收指标 |
|:---|:---|:---|:---|
| 前 3 月资金波动过大 | 新手容易在 2~4 月连续破产，提前出局 | 增加“现金流缓冲”事件池：当 `money < 2500` 时，2~4 月至少触发 1 次轻量救济（+800~1500 或临时降生活费） | 新手样本的 4 月前失败占比下降到 ≤35% |
| 低质量→加班→掉血链条过陡 | 一旦连踩低质量，`hp/brain` 会快速失控 | 加入“危机兜底恢复”规则：当 `hp < 35` 或 `brain < 30`，当月至少出现 1 次恢复型选择事件（强收益+明确代价） | 连续 3 天加班后的当月存活率提升到 ≥60% |
| 社交线收益滞后 | 玩家难感知 `shaoye_rel/yimin_rel` 的短期价值 | 在关系阈值 70/90 加入月度稳定收益（如 bug 率修正、bossSatisfy 小幅保底）并固定提示来源 | 关系系 Buff/事件的选择率提升 ≥20% |
| 豆包专精路线反馈不稳定 | `buff_doubao_master` 有爽点，但中盘成长节奏不稳定 | 在 4~8 月新增“豆包专精任务”节点：限制模型但提高稳定收益，形成明确 build 路线 | 仅豆包路线的 12 月到达率提升到 30%~40% |
| 随机事件方差偏高 | 连续负面随机会把局面直接打穿，胜率抖动大 | 随 `hp/brain/money` 动态调权：状态越差，负面事件权重越低、恢复/中性权重越高 | 1000 局模拟胜率稳定在 35%~45%，标准差收敛 |
| Buff 选购缺少前置信息 | 玩家首局常出现“买了但不知道何时生效” | 在 Buff UI 增加“生效时机+收益类别”标签（开局增益/月初恢复/概率修正/模型专精） | 首局购买后 3 月内弃局率下降 ≥15% |

### 单次事件效果推荐范围

| 类型 | 推荐范围 | 说明 |
|:---|:---|:---|
| 随机事件 | ±3~15 | 正面:负面:中性 ≈ 4:4:2 |
| 选择事件 | ±3~15 | 极端不超过±20 |
| 同事事件 | ±3~20 | 关系变化范围 |
| 月份大事件 | ±10~20 | 每月1个 |

> **金额参考基于月薪3000。** 所有金额事件效果按此基准设计。

### 任务复杂度（按月递增）

| 月份 | 任务池分布 |
|:---|:---|
| 1月 | ⭐60% + ⭐⭐40% |
| 2–3月 | ⭐30% + ⭐⭐50% + ⭐⭐⭐20% |
| 4–6月 | ⭐⭐30% + ⭐⭐⭐50% + ⭐⭐⭐⭐20% |
| 7–9月 | ⭐⭐20% + ⭐⭐⭐40% + ⭐⭐⭐⭐40% |
| 10–12月 | ⭐⭐⭐40% + ⭐⭐⭐⭐60% |

---

## 十一、成就系统

> 成就为跨转世里程碑，解锁后奖励传世金币。

### 公开成就

| 成就 | 条件 | 奖励 |
|:---|:---|:---|
| 👶 初来乍到 | 完成1次人生 | 🪙10 |
| 🔄 轮回老手 | 完成5次转世 | 🪙30 |
| 🌟 逆天改命 | 第一次胜利结局 | 🪙20 |
| 🩸 第一滴血 | 被裁员成为骑手 | 🪙15 |
| 🏆 大师之路 | AI大师结局 | 🪙30 |
| 👑 全胜通关 | 解锁所有胜利结局 | 🪙50 |
| 🐛 Bug猎人 | 累计修复100个Bug | 🪙30 |
| 🐋 AI烧钱王 | 累计消耗¥100万AI费用 | 🪙25 |
| 💎 打工皇帝 | 累计赚50万元 | 🪙40 |
| ⚔️ 12月勇士 | 存活到12月 | 🪙20 |
| 📖 图鉴收集者 | 收集25个事件 | 🪙20 |
| 📚 百科全书 | 收集50个事件 | 🪙40 |
| 🔥 燃烧殆尽 | 过劳猝死 | 🪙15 |

### 隐藏成就

| 成就 | 条件 | 奖励 |
|:---|:---|:---|
| 🕵️ 隐藏猎人 | 解锁所有隐藏结局 | 🪙100 |
| 🐳 豆包之神 | 达成豆包之神结局 | 🪙50 |
| 🤝 铁三角 | 达成铁三角结局 | 🪙40 |

