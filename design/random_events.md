# 🎲 随机事件 (random_events)

> **正面/负面随机事件库。这是最容易扩充的系统——随时可以添加新事件。**
> 依赖：`_schema.md`（格式）| `attributes.md`（属性）
> 可选依赖：`colleagues.md`（涉及同事的事件标 `system: "colleague"`）

---

## 一、设计原则

1. **频率**：每月 0~2 个随机事件穿插在工作日之间
2. **权重**：weight 越高越容易被选中，默认为 1
3. **可重复**：大部分随机事件无 `once`，可多次触发
4. **平衡**：正面:负面:中性 ≈ 4:4:2

---

## 二、正面事件

```jsonc
{
  "random_good_exercise_01": {
    "month": [1, 12],
    "text": "你今天下班后去跑了个步。出了一身汗，感觉精神好多了。",
    "type": "good",
    "system": "random",
    "weight": 2,
    "effect": { "hp": 8, "brain": 3 }
  },

  "random_good_opensource_01": {
    "month": [3, 12],
    "text": "你之前在GitHub上的一个Unity工具包突然收到了50个Star！",
    "type": "good",
    "system": "random",
    "once": true,
    "include": { "avg_quality": ">70" },
    "effect": { "brain": 5, "bossSatisfy": 3 },
    "postEvent": "有个大V转了你的项目，评论区一片赞扬。"
  },

  "random_good_inspiration_01": {
    "month": [1, 12],
    "text": "洗澡的时候突然想通了之前怎么都想不明白的bug。",
    "type": "good",
    "system": "random",
    "weight": 2,
    "include": { "brain": ">40" },
    "effect": { "brain": 10 },
    "postEvent": "灵感来了挡都挡不住！"
  },

  "random_good_book_01": {
    "month": [1, 12],
    "text": "在地铁上读完了《重构：改善既有代码的设计》，受益匪浅。",
    "type": "good",
    "system": "random",
    "effect": { "brain": 8 }
  },

  "random_good_nap_01": {
    "month": [1, 12],
    "text": "中午在工位上小睡了20分钟，下午精力充沛。",
    "type": "good",
    "system": "random",
    "weight": 3,
    "effect": { "hp": 3, "brain": 5 }
  },

  "random_good_raise_01": {
    "month": [4, 12],
    "text": "老板把你叫到办公室：'鉴于你最近的表现，给你调薪。'",
    "type": "money",
    "system": "random",
    "once": true,
    "include": { "bossSatisfy": ">70" },
    "effect": { "money": 3000 },
    "postEvent": "月薪 +3000！"
  },

  "random_good_colleague_lunch_01": {
    "month": [1, 12],
    "text": "同事请你吃了个大餐：'最近太累了，犒劳一下自己。'",
    "type": "good",
    "system": "random",
    "weight": 2,
    "effect": { "hp": 3, "money": -50, "brain": 2 }
  }
}
```

---

## 三、负面事件

```jsonc
{
  "random_bad_sick_01": {
    "month": [1, 12],
    "text": "早上起来喉咙痛，鼻涕止不住。感冒了。",
    "type": "bad",
    "system": "random",
    "weight": 2,
    "branch": [
      {
        "cond": { "hp": ">60" },
        "text": "吃了药撑了一天，晚上早早躺下了。",
        "type": "bad",
        "effect": { "hp": -5, "brain": -3 }
      },
      {
        "cond": {},
        "text": "身体太差了，直接请了病假。",
        "type": "bad",
        "effect": { "hp": -10, "brain": -5, "money": -500, "bossSatisfy": -1 }
      }
    ]
  },

  "random_bad_bluescreen_01": {
    "month": [1, 12],
    "text": "💻 电脑蓝屏了！最近两小时的工作全没了...",
    "type": "bad",
    "system": "random",
    "effect": { "brain": -8 },
    "postEvent": "你盯着重启的加载圈，开始怀疑人生。"
  },

  "random_bad_online_bug_01": {
    "month": [3, 12],
    "text": "🔥 线上玩家反馈游戏闪退！老板在群里@了你。",
    "type": "bad",
    "system": "random",
    "include": { "avg_quality": "<60" },
    "effect": { "hp": -5, "brain": -5, "bossSatisfy": -3 },
    "postEvent": "紧急修复到凌晨2点..."
  },

  "random_bad_argument_01": {
    "month": [1, 12],
    "text": "Code Review的时候和同事吵起来了。对方说你的命名风格'像小学生'。",
    "type": "bad",
    "system": "random",
    "effect": { "brain": -5, "bossSatisfy": -2 }
  },

  "random_bad_phone_stolen_01": {
    "month": [1, 12],
    "text": "地铁上手机被偷了！又得花钱买新的...",
    "type": "bad",
    "system": "random",
    "once": true,
    "effect": { "money": -3000, "brain": -3 }
  },

  "random_bad_rain_late_01": {
    "month": [1, 12],
    "text": "暴雨堵路，迟到了40分钟。老板看了你一眼。",
    "type": "bad",
    "system": "random",
    "effect": { "bossSatisfy": -2 }
  },

  "random_bad_ai_security_01": {
    "month": [2, 12],
    "text": "⚠️ 安全团队发现你用AI生成的代码有注入漏洞！",
    "type": "bad",
    "system": "random",
    "include": { "current_model": "!human" },
    "effect": { "bossSatisfy": -5, "brain": -5 },
    "postEvent": "老板在群里发了一条'AI代码必须人工Review'。"
  },

  "random_bad_insomnia_01": {
    "month": [1, 12],
    "text": "昨晚失眠了，脑子里全是代码。今天状态很差。",
    "type": "bad",
    "system": "random",
    "weight": 2,
    "include": { "brain": "<40" },
    "effect": { "hp": -3, "brain": -8 }
  }
}
```

---

## 四、中性事件

```jsonc
{
  "random_neutral_news_ai_01": {
    "month": [1, 12],
    "text": "刷到新闻：'某大厂用AI替代了50%的初级程序员'。你看了看自己的工位。",
    "type": "neutral",
    "system": "random",
    "weight": 3,
    "effect": { "brain": -2 }
  },

  "random_neutral_delivery_01": {
    "month": [1, 12],
    "text": "点外卖的时候，骑手小哥说他以前是程序员。'AI来了，我就转行了。'",
    "type": "neutral",
    "system": "random",
    "effect": { "brain": -3, "hp": -1 },
    "postEvent": "你接过外卖，沉默了好久。"
  },

  "random_neutral_cat_01": {
    "month": [1, 12],
    "text": "公司楼下来了一只猫。你蹲下来撸了5分钟。",
    "type": "good",
    "system": "random",
    "weight": 3,
    "effect": { "hp": 2, "brain": 2 }
  }
}
```

---

## 五、添加随机事件

事件ID格式：`random_{good|bad|neutral}_{desc}_{seq}`

### 给 AI 的 Prompt

```
请阅读 `_schema.md` 和 `random_events.md`。

请为游戏生成 10 个随机事件：
- 5 个正面事件（type: "good"）
- 4 个负面事件（type: "bad"）
- 1 个中性事件（type: "neutral"）

要求：
- system 字段为 "random"
- 事件ID格式：random_{类型}_{描述}_{序号}
- 效果合理（参考现有事件的数值范围）
- 有趣、有细节、有代入感
- 符合"Unity程序员在AI时代求生"的主题
- 输出纯 JSON 格式
```
