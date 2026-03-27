# 💰 经济系统 — 实装同步设定

> 本文件用于同步“当前代码已实现”的经济循环，作为事件与数值调优基线。

---

## 一、目标难度

```
目标通关率（isWin）≈ 40%
可接受区间：35% ~ 45%
评估口径：平均水平玩家，多局统计
```

---

## 二、闭环规则（必须保持）

```
模型档位（质量/价格/bug率）
  → 每日任务质量与花费
  → Bug概率与brain消耗
  → 低质量触发概率加班并掉hp（严重档会额外掉brain）
  → 月末按 质量/稳定性/加班比/Bug比 结算bossSatisfy
  → 季度月（3/6/9/12）按综合得分评薪
  → bossSatisfy + months_bankrupt 决定生存
  → 恢复事件补回hp/brain进入下一轮
```

---

## 三、字段名对齐

| 设计概念 | 运行时字段/结构 | 备注 |
|:---|:---|:---|
| 当前模型 | `current_model` | 对应 `AI_MODELS[current_model]` |
| 任务复杂度星级 | `stars` | 取值 1~4 |
| 当日是否加班 | `is_overtime` | 命中加班判定时 true（硬阈值≤34，软阈值48内概率触发） |
| 连续加班计数 | `consecutive_overtime` | 控制疲劳惩罚与强制补觉重置 |
| 月平均质量 | `avg_quality` | 月末计算并写入 |
| 累计Bug | `total_bugs` | 每次触发Bug后 +1 |
| 破产计数 | `months_bankrupt` | 月末 money<=0 时 +1，否则清零 |
| 经济骨干预留 | `bug_backlog/new_bugs_month/fixed_bugs_month/overtime_hours_month` | 已注册，待接入月结算 |

---

## 四、关键公式（实现口径）

### 4.1 每日模型花费

```
model = AI_MODELS[current_model]
tokensCost = model.cost[stars - 1]
pressuredTokens = round(tokensCost × tokenMultiplier[model])
debtBuffer = max(600, floor((salary + living_cost) × 0.18))

if money + debtBuffer >= pressuredTokens × tokenPrice:
  允许按当前档位扣费（可能透支）
else if model in {gpt54, opus46, deepseek_v4}
     and money + debtBuffer >= round(pressuredTokens × 0.72) × tokenPrice:
  触发降载（tokens × 0.72）后扣费
else:
  当天切纯人肉
  brain -= [6,12]
```

备注：
1. `doubao` 单价为 `¥0/M`，始终是低成本保底模型。
2. `charge_tokens` 动作由运行时按“当前模型单价”折算并扣 `money`。

### 4.2 Bug 与脑力损耗

```
实际bug率 = baseBugRate × (1 - (luck - 50) / 200)
cheapgpt: baseBugRate 每日随机 10%~80%
fakeopus: baseBugRate 每日随机 15%~75%

若触发Bug：
  brainLoss = floor(stars × (1 - model.quality/100) × 3)
            + random(2, min(5, 2 + stars))
  total_bugs += 1
```

### 4.3 加班与生命损耗

```
硬触发：quality <= 34（严重档）：
  is_overtime = true
  hpLoss = random(4,8) + fatigueLoss(上限3)
  brain -= 2
  consecutive_overtime += 1

软触发：quality > 34：
  chance = max(0, (48 - quality) * 0.035)
  若 hasBug，chance += 0.12
  chance 上限 0.85
  命中则：
    is_overtime = true
    hpLoss = random(2,5) + fatigueLoss(上限3)
    consecutive_overtime += 1

未触发时：
  is_overtime = false
  consecutive_overtime = max(0, consecutive_overtime - 1)

若 consecutive_overtime >= 6：
  强制补觉恢复 hp +[2,4], brain +[1,2]
  consecutive_overtime = 2
```

### 4.4 月末老板与破产结算

```
qualityScore(avg_quality):
  >=88:+4, >=76:+3, >=64:+2, >=54:+1, >=40:0, >=30:-2, <30:-4

stability = round((hp + brain) / 2)
stabilityScore:
  >=80:+2, >=64:+1, >=42:0, >=28:-1, <28:-2

overtimePenalty(overtimeDays/totalDays):
  >=0.65:-4, >=0.50:-3, >=0.34:-2, >=0.20:-1

bugPenalty(bugDays/totalDays):
  >=0.75:-2, >=0.50:-1

baseDelta = qualityScore + stabilityScore + overtimePenalty + bugPenalty
satisfyDelta = clamp(round(baseDelta × (1 + (charm - 50) / 240)), -7, +6)
bossSatisfy += satisfyDelta

if monthEnd money <= 0:
  months_bankrupt += 1
else:
  months_bankrupt = 0
```

### 4.5 季度评薪（固定月）

```
触发：3/6/9/12 月月末

score 由以下项累加：
  avg_quality: >=85:+3, >=72:+2, >=58:+1, <42:-2, 其余:-1
  stability: >=78:+2, >=62:+1, <35:-2, <48:-1
  bossSatisfy: >=72:+2, >=56:+1, <32:-2, <45:-1
  overtimeRatio: <=0.18:+1, >=0.50:-2, >=0.35:-1
  当月满意度: settle.delta >=3:+1, <=-3:-1

salaryDelta:
  >=7:+700, >=5:+450, >=3:+250, >=1:+100,
  <=-5:-450, <=-3:-250, <=-1:-100, 其余0

salaryAfter = clamp(salaryBefore + salaryDelta, 1800, 12000)
```

### 4.6 月报与月结算时序（可视反馈口径）

```
工作日：
  日任务与事件全部结算后，触发 onDaySummary

月末最后一天：
  先触发当日 onDaySummary
  再执行 nextMonth 月结算并触发 onMonthSummary

UI显示：
  仅当 monthFinance.summary.month == 当前 month 时标记“本月结算”
  进入下月后恢复“本月进行中”
```

---

## 五、收支基线（当前版本）

| 项目 | 当前值 | 节奏 |
|:---|:---|:---|
| 开局现金 | 3000 | 开局一次 |
| 月薪 `salary` | 初始 3200（护栏 600~20000） | 2~12月月初；3/6/9/12 月末可评薪调整 |
| 生活费 `living_cost` | 初始 1400（护栏 200~16000） | 2~12月月初 |
| 失败阈值1 | `bossSatisfy < 15` | 立即失败 |
| 失败阈值2 | `months_bankrupt >= 3` | 破产失败 |

---

## 六、字段接入状态

1. 已接入主循环：`money/brain/hp/bossSatisfy/is_overtime/consecutive_overtime/avg_quality/total_bugs/months_bankrupt`。
2. 已注册待接入：`bug_backlog/new_bugs_month/fixed_bugs_month/overtime_hours_month`。
3. 月结算回调对外字段固定：`salaryBefore/salaryDelta/salaryAfter/livingCost/monthIncome/monthModelCost`。
4. 文档与代码字段名必须保持一致，不再使用未定义别名（如 `taskTokens`、`taskComplexity`、`modelQuality`）。

---

## 七、事件调优约束

1. 高价模型事件可以给更高质量回报，但不能用单次大额扣钱直接判死。
2. 低价模型事件应体现“省钱但波动大”，重点放在 `brain/hp/bossSatisfy` 的连锁压力。
3. 恢复型事件要稳定提供 `hp/brain` 小幅回补，确保玩家有翻盘窗口。
4. 经济事件调优后，整体胜率仍要回到 40% 附近，不追求极端高难或极端保送。
