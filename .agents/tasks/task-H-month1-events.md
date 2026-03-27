# 📝 Task H: Month 1 New Choice Events

**Department:** 礼部
**Priority:** HIGH
**Parallel:** ⚡ Can run with G

## Assigned Files

- `data/events/choice.json`

## Context

Month 1 currently has only **5 choice events** eligible (4 ONCE pledge events + 1 reusable `choice_weekend_plan_01`). The game has 5-7 days per month with 100% event trigger rate, meaning players see the same "周末计划" choice repeatedly. We need MORE variety.

### Attribute Philosophy (MUST follow)

| Attribute | Drains from | Recovers from |
|:---|:---|:---|
| ❤️ HP | Late nights, overtime, sickness | Rest, exercise, food |
| 🧠 Brain | Bugs, hard tasks, meetings | Slacking, socializing, breaks |
| 👔 Boss | Bad code, delays | Good code, effort |

### Economic Baseline

- Monthly salary: ¥3000
- Small expenses: ¥50~¥200
- Medium expenses: ¥200~¥500

## Requirements

Add **8~10 new choice events** to `choice.json` that are eligible for month 1 (`"month": [1, 12]` or `"month": [1, 6]`).

### Theme Ideas (pick 8-10, be creative!)

Each event should have 2-3 choices with meaningful tradeoffs:

1. **午饭选择** — 食堂(省钱,普通) vs 外卖(花钱,+brain或+hp) vs 自带便当(+hp,-brain因为早起做)
2. **同事请帮忙** — 帮忙(+boss,+同事关系,-brain) vs 婉拒(少许-同事关系但保brain) vs 敷衍帮(随机结果)
3. **通勤方式** — 挤地铁(省钱,-hp) vs 打车(花钱,保hp) vs 骑车(+hp,-brain因为累)
4. **加班请求** — 主动加班(+boss,-hp) vs 准时走人(-boss,+hp) vs 假装忙但摸鱼(随机被发现)
5. **老板找你聊天** — 认真汇报(+boss,-brain) vs 胡说八道(随机boss±) vs 装忙说稍后(无效果)
6. **发现代码Bug** — 立刻修(+boss,-brain) vs 先记下明天修(-brain小) vs 假装没看到(随机后果)
7. **工位装饰** — 买电脑支架(花钱,+hp长期因为姿势好) vs 买绿植(花钱,+brain) vs 不花钱
8. **下班后学习** — 看技术视频(+brain长期,-hp) vs 刷手机(+brain短期恢复) vs 早睡(+hp)
9. **午休选择** — 趴桌睡(+hp少许) vs 和同事聊天(+brain,+关系) vs 继续写代码(+boss,-hp)
10. **第一周请同事喝奶茶** — 请全组(-money大,+关系大,+charm) vs 只请旁边的人(-money小,+关系小) vs 不请(无效果)
11. **被拉进奇怪的群** — 退群(无事) vs 潜水看热闹(+brain) vs 积极发言(随机+charm或被嘲)

### Format Requirements

Each event must follow this JSON structure:
```json
{
  "month": [1, 12],
  "text": "事件描述文字",
  "title": "选择标题",
  "desc": "选择场景简短描述",
  "type": "choice",
  "system": "choice",
  "weight": 5,
  "choices": [
    {
      "text": "选项A文字",
      "hint": "选项提示(可选)",
      "result": "结果描述",
      "effect": { "brain": 3, "hp": -2, "money": -100 }
    },
    {
      "text": "选项B文字",
      "result": "结果描述",
      "effect": { "hp": 3 }
    }
  ]
}
```

### ID Naming Convention

Use prefix `choice_m1_` for month-1-specific events, e.g.:
- `choice_m1_lunch_01`
- `choice_m1_overtime_request_01`
- `choice_m1_commute_01`

For events that span all months, use `choice_daily_` prefix.

### Weight Guidelines

- New events: weight **3~5** (moderate, not overwhelming)
- Don't set weight too high or they'll dominate the pool
- Mix of `once: false` (repeatable daily choices) and `once: true` (one-time story moments)

### Quality Bar

- Text should be **生动有趣**, matching the existing humorous tone of the game
- Each choice should have a **clear tradeoff** — no obviously-best option
- Money costs should be proportional to ¥3000 salary (small=50-150, medium=200-500)
- At least 3 events should have `chanceBased` branches for unpredictable outcomes

## Acceptance Criteria

- [ ] 8+ new choice events added to `choice.json`
- [ ] All events eligible for month 1
- [ ] Each event has 2-3 choices with meaningful tradeoffs
- [ ] HP/Brain effects follow attribute philosophy
- [ ] Money values match ¥3000 salary baseline
- [ ] At least 3 events use `chanceBased` for randomness
- [ ] Text is humorous and matches game tone
- [ ] Valid JSON (no syntax errors)
- [ ] IDs follow naming convention
