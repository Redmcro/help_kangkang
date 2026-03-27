# 📚 Task F: Design Document Sync

**Department:** 翰林院
**Priority:** MEDIUM
**Parallel:** ⏩ 前置：Task A must be complete first

## Assigned Files

- `design/GAME_DESIGN.md`

## Context

The game code has been rebalanced with a new attribute philosophy and economic system. The design document must be updated to reflect ALL changes as the single source of truth.

## Changes Required

### Section 二 属性系统

Update `salary` initial value: 12000 → **3000**
Update `living_cost` initial value: 6000 → **1500**

### Section 三 数值机制

#### 3.1 每月自然恢复

```
brain += 8（休息恢复，上限100）   ← was 5
hp    += 5（自然恢复，上限100）   ← was 3

如果上月有连续加班：
  brain 恢复量减半（+4）          ← was 3
  hp 恢复量减半（+3）             ← was 2

每月固定扣除：
  money -= living_cost（生活费，初始1500）  ← was 6000
  money += salary（月薪，初始3000）        ← was 12000
```

#### 3.4 老板满意度规则

Add new satisfaction delta table:
```
Monthly average quality → bossSatisfy change:
  avgQ ≥ 90 → +2
  avgQ ≥ 70 → +1
  avgQ ≥ 50 →  0    ← was -1
  avgQ ≥ 30 → -2    ← was -4
  avgQ < 30 → -5    ← was -8
```

#### 3.5 加班机制

Update:
```
当代码质量 < 40 时触发加班：    ← was 50
    hp    -= random(3, 8)      ← was (5, 15)
    brain 不受加班影响（仅Bug消耗brain）  ← NEW
```

### NEW Section: 属性哲学（Add after 2.3）

Add a new section documenting the attribute philosophy:

```markdown
### 2.5 属性变化因果律

> 所有事件效果必须遵循以下因果映射。

| 属性 | 代表 | 扣的原因 | 回的原因 |
|:---|:---|:---|:---|
| ❤️ HP | 身体/作息 | 熬夜、加班、玩太晚、生病 | 休息、运动、好好吃饭 |
| 🧠 Brain | 精神/脑力 | 修Bug、烧脑任务、开会 | 偷懒、摸鱼、社交聊天 |
| 👔 Boss | 工作表现 | 代码差、延期、摸鱼被发现 | 代码好、准时交付、学AI |
| 💰 Money | 经济 | 生活开销、AI费用 | 薪资、奖金、私活 |
```

### Section 七 经济系统

Update all income/expense reference values:
- 月薪: 12000 → **3000**
- 生活费: 6000 → **1500**
- 加薪: +2000~5000 → **+500~1500**
- 其他相应调整

### Section 十 数值平衡参考

Update single event effect ranges to match new scale:
- Random events: ±3~15 → keep but note money is per 3000 baseline
- Add note: "金额参考基于月薪3000"

## Acceptance Criteria

- [ ] All numerical values match the implemented code
- [ ] Attribute philosophy section added
- [ ] Salary/living_cost updated throughout
- [ ] Monthly recovery values updated
- [ ] Overtime mechanism description updated
- [ ] Boss satisfaction delta table updated
