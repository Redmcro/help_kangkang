# 💻 每日任务系统 (daily_tasks)

> **定义工作日的任务类型、代码质量计算、熬夜机制、接私活。**
> 依赖：`ai_models.md`（模型数据）| `attributes.md`（属性消耗）
> 被依赖：月末结算（`monthly_events.md`）

---

## 一、任务类型

| 类型 | 复杂度 | 图标 | Token级别 | 举例 |
|:---|:---|:---|:---|:---|
| 简单 UI | ⭐ | 🎨 | M级 | 改按钮颜色、调文字排版 |
| 功能模块 | ⭐⭐ | 🔧 | M级 | 背包排序、音量设置 |
| 系统开发 | ⭐⭐⭐ | ⚙️ | 大M级 | 对话系统、任务系统 |
| 复杂架构 | ⭐⭐⭐⭐ | 🏗️ | B级 | ECS框架、网络同步 |
| 紧急修Bug | ⭐⭐ | 🐛 | M级 | 线上崩溃，必须今天修 |

### 任务池按月份变化

| 月份 | 任务池权重 |
|:---|:---|
| 1月 | ⭐占60%, ⭐⭐占40% （教学月） |
| 2–3月 | ⭐占30%, ⭐⭐占50%, ⭐⭐⭐占20% |
| 4–6月 | ⭐⭐占30%, ⭐⭐⭐占50%, ⭐⭐⭐⭐占20% |
| 7–9月 | ⭐⭐占20%, ⭐⭐⭐占40%, ⭐⭐⭐⭐占40% |
| 10–12月 | ⭐⭐⭐占40%, ⭐⭐⭐⭐占60% |

---

## 二、代码质量计算

```
baseQuality   = 模型基础质量值（纯人肉 = brain × 0.5）
brainBonus    = (brain - 50) × 0.3
bugPenalty    = hasBug ? -(bugDifficulty × 0.3) : 0
randomRoll    = random(-8, +8)
taskPenalty   = ⭐:0, ⭐⭐:-5, ⭐⭐⭐:-10, ⭐⭐⭐⭐:-20
modelSpecial  = 模型特殊效果修正

finalQuality  = clamp(baseQuality + brainBonus + bugPenalty + randomRoll + taskPenalty + modelSpecial, 0, 100)
```

---

## 三、代码质量后果

| 质量区间 | 反馈 | 属性效果 |
|:---|:---|:---|
| 90–100 | ✅ "这代码可以啊！" | bossSatisfy +2 |
| 70–89 | 👍 "不错，继续保持" | bossSatisfy +1 |
| 50–69 | ⚠️ "能用，但Bug有点多" | 加班修Bug, brain -5 |
| 30–49 | 🐛 "重写！" | 熬夜, hp -8, brain -5, bossSatisfy -2 |
| 0–29 | 💥 "你考虑转行吧" | hp -12, brain -8, bossSatisfy -5 |

---

## 四、熬夜机制

```
当代码质量 < 50 时触发熬夜：
    hp    -= random(5, 15)
    brain -= random(3, 8)
    次日 brain 恢复减半

连续加班计数器 (consecutive_overtime)：
    每次加班 +1，正常下班归零

    consecutive_overtime ≥ 3：
        触发"猝死警告"事件
        hp -= 20
        "康康感觉胸口一阵刺痛..."

    consecutive_overtime ≥ 5：
        强制休息3天
        brain = min(brain + 30, 100)
        hp    = min(hp + 10, 100)
        bossSatisfy -= 5
        "医生说你必须休息。"

脑力阈值：
    brain < 30 → 「脑雾状态」所有质量 -20
    brain < 15 → 无法正常工作，随机产出 0~30 质量
    brain < 5  → 强制休息一天，brain +20，满意度 -3
```

---

## 五、接私活

在工作日可以选择**接额外任务**赚外快：

```jsonc
{
  "daily_moonlight_01": {
    "month": [2, 12],
    "text": "朋友介绍了个小项目：帮独立开发者做个UI界面。",
    "type": "choice",
    "system": "daily",
    "title": "💼 接私活？",
    "desc": "赚点外快，但分散精力。",
    "choices": [
      {
        "text": "💰 接！给钱就干",
        "hint": "money +2000, 但今日主任务质量 -10, 被发现满意度 -5",
        "chanceBased": true,
        "branches": [
          { "chance": 70, "result": "顺利完成，对方很满意。私活钱到手！", "type": "good", "effect": { "money": 2000 } },
          { "chance": 30, "result": "被组长看到了私活代码...'上班时间做什么呢？'", "type": "bad", "effect": { "money": 2000, "bossSatisfy": -5 } }
        ]
      },
      {
        "text": "🚫 不接，专注本职",
        "hint": "brain +2（专注力）",
        "result": "你关掉了聊天窗口，回到了Unity编辑器。",
        "effect": { "brain": 2 }
      }
    ]
  }
}
```

---

## 六、任务事件示例

```jsonc
{
  "daily_task_simple_ui_01": {
    "month": [1, 12],
    "text": "📋 今日任务：调整游戏主菜单的按钮布局",
    "type": "neutral",
    "system": "daily",
    "filler": true,
    "effect": {}
  },
  "daily_task_complex_ecs_01": {
    "month": [6, 12],
    "text": "📋 今日任务：用ECS架构重写角色控制系统",
    "type": "neutral",
    "system": "daily",
    "include": { "month": ">5" },
    "effect": {}
  }
}
```
