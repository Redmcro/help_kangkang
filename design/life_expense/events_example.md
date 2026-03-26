# 💸 生活开销系统 — 事件示例 (events_example)

> **已有的生活开销事件 JSON 示例。AI 生成新事件时参考这些格式和数值范围。**

---

## 突发支出事件

```jsonc
{
  "life_expense_emergency_hospital_01": {
    "month": [1, 12],
    "text": "半夜突然牙疼！疼得在床上打滚。第二天一早直奔口腔医院，挂号费+检查+治疗，出来的时候钱包瘦了一大圈。",
    "type": "bad",
    "system": "economy",
    "weight": 0.8,
    "effect": {"money": -2000, "hp": -5},
    "postEvent": "医生说：'你这是智齿发炎，早该拔了。' 康康瑟瑟发抖地预约了下次拔牙。"
  }
}
```

---

## 分支事件（luck/hp 判定）

```jsonc
{
  "life_expense_friend_borrow_01": {
    "month": [3, 12],
    "text": "大学室友发来消息：'兄弟，手头紧，能借1000块吗？下个月一定还。' 康康犹豫了10秒钟。",
    "type": "neutral",
    "system": "economy",
    "weight": 0.6,
    "once": true,
    "effect": {"money": -1000, "charm": 3},
    "branch": [
      {
        "cond": {"luck": ">50"},
        "text": "室友下个月真的还了，还多转了100块说请你喝奶茶。世界上还是好人多。",
        "type": "good",
        "effect": {"money": 1100, "charm": 2}
      },
      {
        "cond": {},
        "text": "到了下个月，室友说：'再宽限几天行吗？' 然后就没有然后了。康康把这笔钱记在了人生经验的账本上。",
        "type": "bad",
        "effect": {"charm": -2}
      }
    ]
  }
}
```

---

## 填充事件（filler）

```jsonc
{
  "life_expense_milk_tea_addiction_01": {
    "month": [1, 12],
    "text": "康康算了算这个月的奶茶消费：一杯15块，一周五杯，一个月下来……他决定假装没看到这个数字。",
    "type": "bad",
    "system": "economy",
    "weight": 1.2,
    "filler": true,
    "effect": {"money": -300, "hp": -1},
    "postEvent": "第二天路过奶茶店，康康告诉自己'这是最后一杯'——跟昨天说的一样。"
  }
}
```
