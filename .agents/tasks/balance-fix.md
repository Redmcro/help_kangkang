# ⚖️ 数值平衡修复 (Balance Fix)

## Rules
See `.agents/AGENTS.md`

> ⚠️ **汇报规则**：完成后在当前对话中报告变更摘要，等待大内总管验收。**严禁直接向皇上汇报。**

## Assigned Files
- `data/events/general.json`
- `data/events/random.json`
- `data/events/choice.json`
- `data/events/daily.json`
- `data/events/colleagues.json`
- `data/events/monthly.json`
- `data/events/models.json`

## Required Reading
1. `design/_global/attributes.md` — 属性范围与初始值
2. `design/_global/_schema.md` — 事件格式规范

## Context: Current Balance Issues

### 当前数值（总管审计结果）
| 属性 | 正面总和 | 负面总和 | 净值 | 目标 |
|:---|:---|:---|:---|:---|
| brain | +669 | -1209 | **-540** | -200 ~ -100 |
| hp | +324 | -694 | **-370** | -200 ~ -100 |
| bossSatisfy | +477 | -378 | +99 | 保持 |

### 初始值参考
| 属性 | 初始 | 范围 | 月恢复 |
|:---|:---|:---|:---|
| brain | 80 | 0–100 | +10（加班后+5）|
| hp | 100 | 0–100 | +5（加班后+3）|

### 游戏循环
- 12 个月，每月 3–5 工作日
- 事件触发率 60%/日
- 质量 < 50 触发熬夜（hp -5~15, brain -3~8）

## Task

### Part 1: 修复 system 字段（20 个旧事件）

将 `general.json` 中以下旧值改为标准值：

| 旧值 | 应改为 |
|:---|:---|
| `daily_tasks` | `general` |
| `ai_models` | `general` |
| `random_events` | `general` |
| `economy` | `general` |
| `choice_events` | `general` |
| `monthly` → 如果 ID 不含 `month`前缀 | `general` |

> 注: ID 含 `month` 前缀的旧事件可保留 `monthly` system，其余改为 `general`

### Part 2: Brain 平衡修复（目标: 净值 → -200 ~ -100）

需要减少约 340~440 点 brain 负面总量。**策略**：

1. **重灾区 `daily.json`**（贡献 -304）：
   - `brain: -10` 以上的降到 `-8`
   - `brain: -8` 的降到 `-5` 或 `-6`
   - 好结果(good branch)加 `brain: +2~3` 恢复
   
2. **`models.json`**（贡献 -95）：
   - 减轻模型相关的 brain 惩罚

3. **`random.json` / `choice.json`**：
   - 部分 neutral/good 事件加 `brain: +1~3`

### Part 3: HP 平衡修复（目标: 净值 → -200 ~ -100）

需要减少约 170~270 点 hp 负面总量。**策略**：

1. **`monthly.json`**（贡献 -125）：降低大事件 hp 惩罚
2. **`choice.json`**（贡献 -115）：降低选择代价
3. 部分 good 事件加 `hp: +2~3` 回血

### 约束

- ❌ **不改叙事文本**（text, postEvent, result 等）
- ❌ **不加不删事件**
- ❌ **不改 branch/choice 结构**
- ✅ **只改 effect 中的数值**
- ✅ **可以给没有 effect 的字段加 effect**

## Acceptance Criteria
- [ ] 所有 `general.json` 中 system 字段统一为标准值
- [ ] brain 净值改善到 -200 以内
- [ ] hp 净值改善到 -200 以内
- [ ] bossSatisfy 净值保持正（不要大幅改动）
- [ ] JSON 合法
- [ ] **不改叙事文本，不加不删事件**

## When Done
输出变更摘要 + 修复后统计数据。**在当前对话中等待大内总管验收，严禁越级。**
