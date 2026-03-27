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
  → 低质量触发加班并掉hp
  → 月末avg_quality结算bossSatisfy
  → bossSatisfy + months_bankrupt 决定生存
  → 恢复事件补回hp/brain进入下一轮
```

---

## 三、字段名对齐

| 设计概念 | 运行时字段/结构 | 备注 |
|:---|:---|:---|
| 当前模型 | `current_model` | 对应 `AI_MODELS[current_model]` |
| 任务复杂度星级 | `stars` | 取值 1~4 |
| 当日是否加班 | `is_overtime` | `quality < 40` 时 true |
| 连续加班计数 | `consecutive_overtime` | 控制额外HP惩罚与清零 |
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
moneyCost = tokensCost × model.tokenPrice
if money < moneyCost:
  当天切纯人肉
  brain -= [8,15]
```

备注：`doubao` 当前单价为 `¥0/M`，是低成本保底模型。

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
当日 quality < 40：
  is_overtime = true
  hpLoss = random(3,8) + random(2, min(5, 2 + consecutive_overtime))
  consecutive_overtime += 1

当日 quality >= 40：
  is_overtime = false
  consecutive_overtime = 0

若 consecutive_overtime >= 5：
  额外 hp -= random(3,6)
  consecutive_overtime = 0
```

### 4.4 月末老板与破产结算

```
avg_quality -> baseDelta
  >=90:+2, >=70:+1, >=50:0, >=30:-2, <30:-5

satisfyDelta = round(baseDelta × (1 + (charm - 50) / 200))
bossSatisfy += satisfyDelta

if monthEnd money <= 0:
  months_bankrupt += 1
else:
  months_bankrupt = 0
```

---

## 五、收支基线（当前版本）

| 项目 | 当前值 | 节奏 |
|:---|:---|:---|
| 开局现金 | 3000 | 开局一次 |
| 月薪 `salary` | 3000（可被事件改） | 2~12月月初 |
| 生活费 `living_cost` | 1500（可被事件改） | 2~12月月初 |
| 失败阈值1 | `bossSatisfy < 15` | 立即失败 |
| 失败阈值2 | `months_bankrupt >= 3` | 破产失败 |

---

## 六、字段接入状态

1. 已接入主循环：`money/brain/hp/bossSatisfy/is_overtime/consecutive_overtime/avg_quality/total_bugs/months_bankrupt`。
2. 已注册待接入：`bug_backlog/new_bugs_month/fixed_bugs_month/overtime_hours_month`。
3. 文档与代码字段名必须保持一致，不再使用未定义别名（如 `taskTokens`、`taskComplexity`、`modelQuality`）。

---

## 七、事件调优约束

1. 高价模型事件可以给更高质量回报，但不能用单次大额扣钱直接判死。
2. 低价模型事件应体现“省钱但波动大”，重点放在 `brain/hp/bossSatisfy` 的连锁压力。
3. 恢复型事件要稳定提供 `hp/brain` 小幅回补，确保玩家有翻盘窗口。
4. 经济事件调优后，整体胜率仍要回到 40% 附近，不追求极端高难或极端保送。
