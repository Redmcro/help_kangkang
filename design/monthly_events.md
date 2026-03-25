# 📅 月份事件 (monthly_events)

> **定义12个月的主线事件、阶段机制、月初/月末流程。**
> 依赖：`_schema.md` | `attributes.md` | `ai_models.md`（模型解锁）
> 被依赖：`daily_tasks.md`（任务难度受月份影响）

---

## 一、月份阶段

| 阶段 | 月份 | 名称 | 特点 |
|:---|:---|:---|:---|
| 🌱 | 1月 | 新手上路 | 只有豆包，任务简单，教学月 |
| 📖 | 2–3月 | 摸索期 | 群雄并起，模型涌现 |
| ⚔️ | 4–6月 | 生存战 | 裁员开始，Deadline压力 |
| 🔥 | 7–9月 | 冲刺期 | 半年考核，最后机会 |
| 🏆 | 10–12月 | 审判日 | 最终结局揭晓 |

---

## 二、每月流程

```
月初：
  1. 发工资 (+salary)
  2. 扣生活费 (-5000)
  3. 自然恢复（brain +10, hp +5）
  4. 模型解锁事件（如果有）
  5. 月份大事件

工作日（3~5天）：
  每天选模型写代码 → 可能出Bug → 可能熬夜
  可能穿插随机事件 / 选择事件

月末结算：
  1. 本月代码质量统计
  2. 老板满意度变化
  3. 同事关系变化
  4. 可选：购买Token / 切换模型
  5. 下月预告
```

---

## 三、12月大事件

### 1月 — 🎬 AI 元年开幕

```jsonc
{
  "monthly_m1_ai_era": {
    "month": [1, 1],
    "text": "老板在全员大会上宣布：'公司将全面引入AI编程工具。一年后，无法适应的同事将被...优化。'",
    "type": "special",
    "system": "monthly",
    "once": true,
    "effect": { "brain": -5 },
    "postEvent": "会后，你打开了免费的豆包。'不要小瞧豆包哦...' 你对自己说。"
  },
  "model_unlock_doubao": {
    "month": [1, 1],
    "text": "你注册了豆包AI账号。免费的，能用就行。",
    "type": "good",
    "system": "model",
    "once": true,
    "effect": { "token": 50 },
    "setFlag": "model_doubao_unlocked"
  }
}
```

### 2月 — 🧧 春节 + GPT-5.4

```jsonc
{
  "monthly_m2_spring_festival": {
    "month": [2, 2],
    "text": "春节回家，亲戚们围在饭桌前。七大姑问：'听说程序员要被AI替代了？你还行吗？'",
    "type": "choice",
    "system": "monthly",
    "once": true,
    "title": "🧧 春节饭桌",
    "desc": "亲戚的灵魂拷问",
    "choices": [
      {
        "text": "😤 '我正在学AI，以后更值钱！'",
        "hint": "brain +5（自我激励）",
        "result": "亲戚们将信将疑，但你自己信了。",
        "effect": { "brain": 5 }
      },
      {
        "text": "😢 '确实挺难的...'",
        "hint": "hp -3（心情低落）",
        "result": "妈妈偷偷塞了你3000块钱。",
        "effect": { "hp": -3, "money": 3000 }
      },
      {
        "text": "🙃 '要不我去送外卖？风里来雨里去的。'",
        "hint": "全家沉默",
        "result": "爸爸放下了筷子。气氛凝固了。",
        "effect": { "hp": -5, "brain": -3 }
      }
    ]
  },
  "model_unlock_gpt54": {
    "month": [2, 2],
    "text": "GPT-5.4 正式发布！朋友圈被刷屏了。'代码能力提升300%'",
    "type": "special",
    "system": "model",
    "once": true,
    "effect": {},
    "setFlag": "model_gpt54_unlocked",
    "postEvent": "但订阅费也翻了一倍..."
  }
}
```

### 3月 — 🎯 Opus 4.6 + CheapGPT

```jsonc
{
  "monthly_m3_opus_release": {
    "month": [3, 3],
    "text": "Anthropic 发布 Opus 4.6。代码圈炸了。'这才是真正的AI编程。'",
    "type": "special",
    "system": "model",
    "once": true,
    "effect": {},
    "setFlag": "model_opus46_unlocked",
    "postEvent": "API价格让你倒吸一口冷气。"
  },
  "monthly_m3_cheapgpt": {
    "month": [3, 3],
    "text": "同事群里传了个链接：'兄弟们！这个GPT接口便宜到离谱！'",
    "type": "choice",
    "system": "model",
    "once": true,
    "title": "💀 便宜GPT？",
    "desc": "价格只有正版的1/5，来源不明...",
    "choices": [
      {
        "text": "🤑 试试看，便宜就行",
        "hint": "解锁CheapGPT",
        "result": "申请了账号，确实便宜。但用了几次发现...好像不太对劲。",
        "effect": {},
        "setFlag": "model_cheapgpt_unlocked"
      },
      {
        "text": "🚫 算了，便宜没好货",
        "hint": "brain +3（理性判断）",
        "result": "果然三天后群里开始吐槽：'这什么破模型！'",
        "effect": { "brain": 3 }
      }
    ]
  }
}
```

### 4月 — 🔮 DeepSeek V4 + 第一轮裁员

```jsonc
{
  "monthly_m4_deepseek": {
    "month": [4, 4],
    "text": "DeepSeek V4 开源！GitHub 趋势榜第一。国产之光！",
    "type": "special",
    "system": "model",
    "once": true,
    "effect": {},
    "setFlag": "model_deepseek_v4_unlocked",
    "postEvent": "更关键的是——Token消耗只有Opus的零头。"
  },
  "monthly_m4_layoff_round1": {
    "month": [4, 4],
    "text": "HR逐个找人谈话。前端组的小刘、后端组的老王...一天走了三个人。",
    "type": "special",
    "system": "monthly",
    "once": true,
    "effect": { "brain": -8, "hp": -3 },
    "postEvent": "你的工位周围突然空了好多。午饭时大家都不怎么说话。"
  }
}
```

### 5月 — 🎪 FakeOpus + 技术分享

```jsonc
{
  "monthly_m5_fakeopus": {
    "month": [5, 5],
    "text": "某技术群里有人分享：'Opus平替！只要1/10的价格！亲测好用！'",
    "type": "choice",
    "system": "model",
    "once": true,
    "title": "🎪 Opus 平替？",
    "desc": "号称和Opus同等水平，价格感人。评论区很多人说好用...",
    "choices": [
      {
        "text": "🧐 试用一下",
        "hint": "解锁FakeOpus",
        "result": "输出看起来很像Opus的风格，但实际跑起来一堆Bug。原来是微调的小模型套壳...",
        "effect": {},
        "setFlag": "model_fakeopus_unlocked"
      },
      {
        "text": "🤔 看看评论再说",
        "hint": "brain +2",
        "result": "你仔细翻了翻差评区，果然有人吐槽质量。省下了踩坑的时间。",
        "effect": { "brain": 2 }
      }
    ]
  },
  "monthly_m5_techshare": {
    "month": [5, 5],
    "text": "组长让大家分享各自使用AI编程的心得。轮到你了。",
    "type": "choice",
    "system": "monthly",
    "once": true,
    "title": "📢 技术分享会",
    "desc": "你要分享什么？",
    "choices": [
      {
        "text": "📊 认真准备PPT，分享如何用AI提效",
        "hint": "brain -8（准备花时间），满意度+5",
        "result": "老板听完竖起了大拇指：'这就是我们要的！'",
        "effect": { "brain": -8, "bossSatisfy": 5 }
      },
      {
        "text": "🙃 随便讲讲，混过去",
        "hint": "无影响",
        "result": "大家礼貌鼓掌，但老板面无表情。",
        "effect": { "bossSatisfy": -1 }
      },
      {
        "text": "🐳 分享豆包的隐藏用法",
        "hint": "如果一直用豆包，质量+特殊加成",
        "require": { "current_model": "=doubao" },
        "success": "大家惊了：'豆包还能这么用？！' 连亿民都来问你了。",
        "successEffect": { "brain": 5, "bossSatisfy": 5, "yimin_rel": 10 },
        "fail": "你也没怎么用过豆包，讲得磕磕绊绊...",
        "failEffect": { "bossSatisfy": -2 }
      }
    ]
  }
}
```

### 6月 — 💻 大项目 Deadline

```jsonc
{
  "monthly_m6_deadline": {
    "month": [6, 6],
    "text": "大项目交付周。连续5天高难度任务。老板说：'这版如果延期，整个组要重新评估。'",
    "type": "special",
    "system": "monthly",
    "once": true,
    "effect": { "brain": -5 },
    "postEvent": "本月所有工作任务难度提升一级。这是第一个生死关。"
  }
}
```

### 7月 — 🌡️ 高温加班季

```jsonc
{
  "monthly_m7_heatwave": {
    "month": [7, 7],
    "text": "38度高温天。空调坏了三天。办公室像个蒸笼。",
    "type": "bad",
    "system": "monthly",
    "once": true,
    "effect": { "hp": -8, "brain": -5 },
    "postEvent": "本月每次加班额外消耗 hp -3。"
  }
}
```

### 8月 — 📊 半年考核

```jsonc
{
  "monthly_m8_review": {
    "month": [8, 8],
    "text": "半年度绩效评估。老板逐个叫去办公室谈话...",
    "type": "special",
    "system": "monthly",
    "once": true,
    "branch": [
      {
        "cond": { "bossSatisfy": ">70" },
        "text": "老板说：'你是今年转型最成功的员工之一。继续保持。'",
        "type": "good",
        "effect": { "money": 5000, "brain": 5, "bossSatisfy": 5 }
      },
      {
        "cond": { "bossSatisfy": ">50" },
        "text": "老板说：'还行，但还有提升空间。下半年加油。'",
        "type": "neutral",
        "effect": { "brain": 2 }
      },
      {
        "cond": { "bossSatisfy": ">30" },
        "text": "老板的语气很严肃：'你的表现不太理想。最后四个月，好好表现。'",
        "type": "bad",
        "effect": { "brain": -8, "hp": -5 }
      },
      {
        "cond": {},
        "text": "老板直接说：'如果年底还是这样，你可能需要考虑其他方向了。'",
        "type": "bad",
        "effect": { "brain": -15, "hp": -10 }
      }
    ]
  }
}
```

### 9月 — 🎮 游戏开发大赛

```jsonc
{
  "monthly_m9_gamejam": {
    "month": [9, 9],
    "text": "Unity 官方举办 AI Game Jam：用AI工具48小时做一款游戏！",
    "type": "choice",
    "system": "monthly",
    "once": true,
    "title": "🎮 AI Game Jam",
    "desc": "要不要参加？周末两天全搭进去。",
    "choices": [
      {
        "text": "🔥 参加！冲一把！",
        "hint": "hp -10, brain -10, 但可能获奖",
        "chanceBased": true,
        "branches": [
          { "chance": 40, "result": "你的游戏获得了'最佳AI应用奖'！！", "type": "good", "effect": { "hp": -10, "brain": -10, "money": 10000, "bossSatisfy": 10 } },
          { "chance": 40, "result": "没获奖，但做出来了。老板看到了你的作品，很欣赏。", "type": "good", "effect": { "hp": -10, "brain": -10, "bossSatisfy": 5 } },
          { "chance": 20, "result": "通宵两天，结果Bug太多没提交成功...", "type": "bad", "effect": { "hp": -15, "brain": -15 } }
        ]
      },
      {
        "text": "😴 算了，周末睡觉",
        "hint": "hp +5, brain +5",
        "result": "你躺在床上刷手机，看到朋友圈都在晒作品。有点后悔？",
        "effect": { "hp": 5, "brain": 5 }
      }
    ]
  }
}
```

### 10月 — ⚡ 模型大战

```jsonc
{
  "monthly_m10_model_war": {
    "month": [10, 10],
    "text": "AI大厂集体降价！GPT-5.4 Token降30%，DeepSeek 推出'学生优惠'。",
    "type": "good",
    "system": "monthly",
    "once": true,
    "effect": { "token": 200 },
    "postEvent": "本月所有Token包价格降20%。"
  }
}
```

### 11月 — 🏗️ 复杂项目冲刺

```jsonc
{
  "monthly_m11_crunch": {
    "month": [11, 11],
    "text": "年底最后一个大项目。Boss说：'这个搞不定，全组年终奖没了。'",
    "type": "special",
    "system": "monthly",
    "once": true,
    "effect": { "brain": -5 },
    "postEvent": "连续两周高压。本月所有任务默认⭐⭐⭐以上。"
  }
}
```

### 12月 — 🏆 年终审判

```jsonc
{
  "monthly_m12_judgment": {
    "month": [12, 12],
    "text": "年终总结大会。老板拿着一份名单走上台...",
    "type": "special",
    "system": "monthly",
    "once": true,
    "postEvent": "（触发最终结局判定——见 endings.md）"
  }
}
```

---

## 四、添加月份子事件

每个月除了大事件，还可以添加月份特有的小事件：

```jsonc
{
  "monthly_m2_redpacket_01": {
    "month": [2, 2],
    "text": "公司群里抢红包，你手速最快抢了88.88元！",
    "type": "money",
    "system": "monthly",
    "effect": { "money": 88 }
  }
}
```

事件ID格式：`monthly_m{月份}_{描述}_{序号}`
