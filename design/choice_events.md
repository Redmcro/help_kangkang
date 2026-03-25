# 🎭 选择事件 (choice_events)

> **需要玩家做决策的事件。这是游戏最核心的趣味来源。**
> 依赖：`_schema.md`（格式）| `attributes.md`（属性）| `ai_models.md`（模型）
> 可选依赖：`colleagues.md`（涉及同事）

---

## 一、设计原则

1. **每个选项都有代价**：没有"最优解"，让玩家纠结
2. **选项通常3个**：安全/冒险/第三条路
3. **后果延迟**：有些选择的后果在几个月后才显现（通过 setFlag）
4. **性格表达**：选项反映不同的性格（勤奋/躺平/社交）

---

## 二、选择事件库

### Token 相关

```jsonc
{
  "choice_token_sale_01": {
    "month": [3, 10],
    "text": "某平台搞活动：Token充值翻倍！限时24小时！",
    "type": "choice",
    "system": "choice",
    "once": true,
    "title": "🎉 Token 翻倍活动！",
    "desc": "手头有点紧，但这个优惠确实诱人...",
    "choices": [
      {
        "text": "💰 冲它！充 3000 块",
        "hint": "获得 2B Token（平时只有1B）",
        "result": "Token 库存一下子充裕了！接下来可以放心用强模型了。",
        "effect": { "money": -3000, "token": 2000 }
      },
      {
        "text": "🤏 小充一笔 500 块",
        "hint": "获得 400M Token（平时200M）",
        "result": "聊胜于无，省着点用。",
        "effect": { "money": -500, "token": 400 }
      },
      {
        "text": "😤 不充，告诫自己省着用",
        "hint": "brain +3（自律力）",
        "result": "你关掉了广告页面。钱还是留着交房租吧。",
        "effect": { "brain": 3 }
      }
    ]
  },

  "choice_token_empty_01": {
    "month": [1, 12],
    "text": "Token 用完了！下一个工作日就要到了...",
    "type": "choice",
    "system": "choice",
    "title": "🪙 Token 告急！",
    "desc": "没有 Token，只能纯人肉写代码。或者花钱买？",
    "include": { "token": "<10" },
    "choices": [
      {
        "text": "💳 充 2000 块买标准包",
        "hint": "获得 1B Token",
        "require": { "money": 2000 },
        "success": "Token 补充完毕，可以继续用AI了。",
        "successEffect": { "money": -2000, "token": 1000 },
        "fail": "你看了看余额...买不起。",
        "failEffect": {}
      },
      {
        "text": "🧠 硬撸！不信我不行",
        "hint": "纯人肉模式，brain 消耗翻倍",
        "result": "你关掉了AI助手，打开了Unity文档。从头开始。",
        "effect": { "brain": -5 }
      },
      {
        "text": "🐳 切到豆包省着用",
        "hint": "豆包消耗最少",
        "result": "你重新打开豆包。'老朋友，我又回来了。'",
        "effect": {},
        "setFlag": "switched_to_doubao"
      }
    ]
  }
}
```

### 工作/职场

```jsonc
{
  "choice_overtime_voluntary_01": {
    "month": [1, 12],
    "text": "下班时间到了，但项目还差一点。老板看了你一眼。",
    "type": "choice",
    "system": "choice",
    "title": "🕐 要不要主动加班？",
    "desc": "留下加班还是按时走？",
    "choices": [
      {
        "text": "💪 留下加班",
        "hint": "满意度+2, hp -5",
        "result": "又在公司待到10点。走出大楼时，路上已经没什么人了。",
        "effect": { "bossSatisfy": 2, "hp": -5, "brain": -3 }
      },
      {
        "text": "🚶 按时下班",
        "hint": "hp +2（休息好）",
        "result": "你合上电脑，背起书包。明天的事明天再说。",
        "effect": { "hp": 2, "brain": 2 }
      },
      {
        "text": "☕ 摸鱼到8点再走",
        "hint": "看起来加班了，实际摸鱼",
        "chanceBased": true,
        "branches": [
          { "chance": 70, "result": "老板走的时候看到你还在，点了点头。完美。", "type": "good", "effect": { "bossSatisfy": 1 } },
          { "chance": 30, "result": "老板路过看到你在刷B站...", "type": "bad", "effect": { "bossSatisfy": -3 } }
        ]
      }
    ]
  },

  "choice_learn_ai_course_01": {
    "month": [2, 8],
    "text": "看到一个'AI辅助Unity开发'的付费课程，评价很好。",
    "type": "choice",
    "system": "choice",
    "once": true,
    "title": "📚 要不要学习？",
    "desc": "学习需要时间和金钱，但可能提升能力。",
    "choices": [
      {
        "text": "📖 买！边学边用",
        "hint": "money -3000, brain +15",
        "result": "花了两周学完，感觉AI工具用起来顺手多了。",
        "effect": { "money": -3000, "brain": 15, "bossSatisfy": 3 },
        "setFlag": "learned_ai_course"
      },
      {
        "text": "📺 找免费资源自学",
        "hint": "brain +8（但慢一些）",
        "result": "B站和YouTube上翻了不少教程，零零碎碎也学到了一些。",
        "effect": { "brain": 8 }
      },
      {
        "text": "🤷 算了，用着学就行",
        "hint": "省钱，无特殊效果",
        "result": "实践出真知嘛...大概。",
        "effect": {}
      }
    ]
  }
}
```

### 生活/人生

```jsonc
{
  "choice_friend_delivery_01": {
    "month": [4, 10],
    "text": "前同事发来消息：'我现在送外卖了，自由多了，要不你也来？'",
    "type": "choice",
    "system": "choice",
    "once": true,
    "title": "🛵 外卖骑手的邀请",
    "desc": "前同事似乎过得还不错？",
    "choices": [
      {
        "text": "😰 '你还好吗？需要帮忙吗？'",
        "hint": "关心朋友",
        "result": "他说：'挺好的，就是下雨天比较惨。你保重啊。'",
        "effect": { "brain": -2 }
      },
      {
        "text": "💪 '我要坚持下去，不到最后不放弃！'",
        "hint": "brain +5",
        "result": "你挂掉电话，打开了Opus，狠狠敲了一波代码。",
        "effect": { "brain": 5, "hp": -2 }
      },
      {
        "text": "🤔 '...认真的吗？多少钱一个月？'",
        "hint": "开始动摇？",
        "result": "'平均七八千吧，单多的话能过万。' 你记下了这个数字。",
        "effect": { "brain": -5 },
        "setFlag": "considered_delivery"
      }
    ]
  },

  "choice_weekend_plan_01": {
    "month": [1, 12],
    "text": "周末到了。你难得有两天自由时间。",
    "type": "choice",
    "system": "choice",
    "title": "🌅 周末安排",
    "desc": "怎么度过这个周末？",
    "choices": [
      {
        "text": "📚 在家学AI/看技术书",
        "hint": "brain +8, hp -2",
        "result": "又是宅在家学习的周末。手机弹出消息：'你已连续7天未运动。'",
        "effect": { "brain": 8, "hp": -2 }
      },
      {
        "text": "🏃 出去运动/社交",
        "hint": "hp +8, brain +3",
        "result": "出了一身汗，和朋友聊了聊天。感觉世界还没那么糟。",
        "effect": { "hp": 8, "brain": 3 }
      },
      {
        "text": "🎮 打一整天游戏",
        "hint": "hp +3（放松），brain -2",
        "result": "玩了一天游戏，很爽。但周一想到工作又焦虑了。",
        "effect": { "hp": 3, "brain": -2 }
      }
    ]
  }
}
```

---

## 三、添加选择事件

事件ID格式：`choice_{主题}_{描述}_{序号}`

### 给 AI 的 Prompt

```
请阅读 `_schema.md` 和 `choice_events.md`。

请生成 5 个选择事件，主题是 [主题]。

要求：
- type 必须为 "choice"
- system 字段为 "choice"
- 每个事件 3 个选项
- 每个选项都有代价，没有"白给"的最优解
- 选项风格：安全/冒险/第三条路
- 数值参考现有事件范围
- 有趣、有戏剧性、有代入感
- 输出纯 JSON 格式
```
