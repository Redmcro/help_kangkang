# 🤝 同事系统 (colleagues)

> **定义康康的同事角色、性格、互动机制。可独立添加新同事和新事件。**
> 依赖：`_schema.md`（事件格式）| `attributes.md`（关系值属性）
> 被依赖：`random_events.md` / `choice_events.md` 中部分事件

---

## 一、同事总览

| 同事 | 键名前缀 | 关系键名 | 身份 | 性格标签 |
|:---|:---|:---|:---|:---|
| 少爷 | `shaoye_` | `shaoye_rel` | QA 测试工程师 | 认真、毒舌、外冷内热 |
| 亿民 | `yimin_` | `yimin_rel` | 资深 Unity 程序员 | 技术宅、AI怀疑论者、暗中很强 |

---

## 二、少爷 — QA 测试工程师

### 人设

- **全名**：少爷（花名，真名不详）
- **年龄**：26
- **性格**：
  - 测试极其认真，找 Bug 毫不留情，"Bug 杀手"
  - 表面毒舌（"你这代码是用脚写的？"），实际很照顾人
  - 对 AI 持开放态度，后期可能自学编程
  - 爱喝奶茶，请人喝奶茶 = 建立友谊的方式
- **口头禅**：
  - "这也能过测试？"
  - "Bug 数量又破纪录了"
  - "我请你喝奶茶，你把这个 Bug 修一下"

### 关系等级效果

| 关系值 | 等级 | 效果 |
|:---|:---|:---|
| 0–20 | 😒 陌生 | 少爷的Bug报告特别严格，质量判定 -5 |
| 21–50 | 🤝 普通同事 | 正常互动 |
| 51–70 | 😊 好朋友 | 少爷偶尔帮忙改测试报告 |
| 71–90 | 🤗 铁哥们 | 少爷会提前透露老板评价 |
| 91–100 | 💪 生死之交 | 少爷帮你挡过一次裁员 |

### 少爷相关事件

```jsonc
// === 正面事件 ===
{
  "colleague_shaoye_notea_01": {
    "month": [1, 12],
    "text": "少爷端着两杯奶茶走过来：'喝不喝？'",
    "type": "good",
    "system": "colleague",
    "once": false,
    "weight": 2,
    "include": { "shaoye_rel": ">40" },
    "effect": { "hp": 3, "brain": 2, "shaoye_rel": 5 }
  },

  "colleague_shaoye_nobugs_01": {
    "month": [2, 12],
    "text": "少爷测完你的代码，罕见地竖起大拇指：'这版没Bug。'",
    "type": "good",
    "system": "colleague",
    "include": { "avg_quality": ">80" },
    "effect": { "bossSatisfy": 3, "brain": 3, "shaoye_rel": 5 }
  },

  "colleague_shaoye_cover_01": {
    "month": [4, 12],
    "text": "少爷偷偷把你那版的几个小Bug标成了'建议优化'而非'必须修复'。",
    "type": "special",
    "system": "colleague",
    "once": true,
    "include": { "shaoye_rel": ">80" },
    "effect": { "bossSatisfy": 2, "shaoye_rel": -10 },
    "postEvent": "少爷小声说：'下不为例啊。'"
  }
}

// === 负面事件 ===
{
  "colleague_shaoye_20bugs_01": {
    "month": [2, 12],
    "text": "少爷面无表情地走过来：'你这版有20个Bug。'",
    "type": "bad",
    "system": "colleague",
    "include": { "avg_quality": "<60" },
    "branch": [
      {
        "cond": { "brain": ">60" },
        "text": "你和少爷一起排查，花了一下午全部修好了。",
        "type": "good",
        "effect": { "brain": -8, "bossSatisfy": 1, "shaoye_rel": 3 }
      },
      {
        "cond": {},
        "text": "你对着Bug列表欲哭无泪，少爷叹了口气帮你改了几个。",
        "type": "bad",
        "effect": { "brain": -12, "hp": -5, "shaoye_rel": -3 }
      }
    ]
  },

  "colleague_shaoye_harsh_01": {
    "month": [1, 12],
    "text": "少爷在Bug报告里写道：'这段逻辑是AI写的吧？建议作者自己先看一遍。'",
    "type": "bad",
    "system": "colleague",
    "include": { "shaoye_rel": "<30" },
    "effect": { "brain": -3, "shaoye_rel": -2 }
  }
}

// === 选择事件 ===
{
  "colleague_shaoye_leaving_01": {
    "month": [7, 10],
    "text": "少爷今天异常安静，午饭时跟你说：'我收到一个测试主管的offer...'",
    "type": "choice",
    "system": "colleague",
    "once": true,
    "title": "🚪 少爷要走了？",
    "desc": "少爷在纠结要不要跳槽，你怎么说？",
    "choices": [
      {
        "text": "💪 挽留：'留下来啊，咱们一起扛过这年！'",
        "hint": "关系+15，但他可能留下也可能走",
        "chanceBased": true,
        "branches": [
          { "chance": 60, "result": "少爷想了想，笑着说：'行吧，看在奶茶的份上。'", "type": "good", "effect": { "shaoye_rel": 15, "brain": 3 } },
          { "chance": 40, "result": "少爷摇摇头：'对不起，我还是想试试。' 一周后少爷离职了。", "type": "bad", "effect": { "shaoye_rel": -20, "brain": -5 } }
        ]
      },
      {
        "text": "🍺 请他喝一杯：'不管怎样，祝你好运。'",
        "hint": "money -300, 关系+10",
        "result": "你们喝到很晚，聊了很多。少爷说：'你是个好人。'",
        "effect": { "money": -300, "hp": -2, "shaoye_rel": 10 }
      },
      {
        "text": "😤 '走吧走吧，反正AI也能测试了。'",
        "hint": "关系-20",
        "result": "少爷愣了一下，没说话。第二天他递了辞职信。",
        "effect": { "shaoye_rel": -20, "brain": -3 }
      }
    ]
  },

  "colleague_shaoye_learns_code_01": {
    "month": [8, 11],
    "text": "你发现少爷的电脑上装了 VS Code。他正在用 Opus 学写 C#...",
    "type": "choice",
    "system": "colleague",
    "once": true,
    "include": { "shaoye_rel": ">40" },
    "title": "🤖 少爷开始学编程了",
    "desc": "测试同事开始用AI写代码，你是什么心情？",
    "choices": [
      {
        "text": "📚 教他几手：'来，我教你Unity基础。'",
        "hint": "brain -5 (花时间教), 关系+15",
        "result": "少爷学得很快，还用AI写了个小工具自动化测试。你突然有点慌...",
        "effect": { "brain": -5, "shaoye_rel": 15 },
        "postEvent": "但转念一想，教会别人也没什么不好。"
      },
      {
        "text": "😰 假装没看到（内心慌了）",
        "hint": "brain -8 (焦虑)",
        "result": "你回到工位，打开了Opus的界面，手有点抖。",
        "effect": { "brain": -8 }
      }
    ]
  }
}
```

---

## 三、亿民 — 资深 Unity 程序员

### 人设

- **全名**：亿民（花名）
- **年龄**：32
- **性格**：
  - 技术过硬，是组里的"定海神针"
  - 对 AI 编程持怀疑态度（"我写了8年代码，不信AI能替代"），但后期态度会变化
  - 不善社交，但对认可的人非常真诚
  - 抽烟下棋，压力大的时候会拉人去天台抽烟聊天
- **口头禅**：
  - "Shader 这东西，AI写不了的"
  - "年轻人别太依赖工具"
  - "来一根？"（递烟）

### 关系等级效果

| 关系值 | 等级 | 效果 |
|:---|:---|:---|
| 0–20 | 😐 无视 | 亿民不愿意帮你 |
| 21–50 | 🤝 普通同事 | 正常互动 |
| 51–70 | 🤓 技术朋友 | 亿民偶尔分享技巧，任务质量 +5 |
| 71–90 | 🤝 好兄弟 | 亿民帮你 Code Review，质量 +10 |
| 91–100 | 🫂 过命的交情 | 亿民紧急时刻替你写代码 |

### 亿民相关事件

```jsonc
// === 正面事件 ===
{
  "colleague_yimin_shader_01": {
    "month": [2, 12],
    "text": "亿民叫你过来看他的Shader效果：'看，这光影变化，AI写得出来吗？'",
    "type": "good",
    "system": "colleague",
    "include": { "yimin_rel": ">50" },
    "effect": { "brain": 8, "yimin_rel": 5 },
    "postEvent": "你不得不承认，确实很牛。"
  },

  "colleague_yimin_token_channel_01": {
    "month": [3, 10],
    "text": "亿民悄悄跟你说：'我发现一个渠道买Token能便宜20%，别跟别人说。'",
    "type": "good",
    "system": "colleague",
    "once": true,
    "include": { "yimin_rel": ">70" },
    "effect": { "yimin_rel": 5 },
    "setFlag": "yimin_token_discount",
    "postEvent": "下次购买Token打8折。"
  },

  "colleague_yimin_rooftop_01": {
    "month": [1, 12],
    "text": "亿民拍了拍你的肩：'走，上天台坐坐。'",
    "type": "good",
    "system": "colleague",
    "weight": 2,
    "include": { "yimin_rel": ">40", "brain": "<50" },
    "effect": { "brain": 8, "hp": 2, "yimin_rel": 5 },
    "postEvent": "天台的风吹散了一些疲惫。亿民说：'别把自己逼太紧。'"
  }
}

// === 负面事件 ===
{
  "colleague_yimin_dissai_01": {
    "month": [1, 6],
    "text": "亿民看了眼你屏幕上AI生成的代码，皱眉：'这写的什么垃圾？'",
    "type": "neutral",
    "system": "colleague",
    "effect": { "brain": 3, "yimin_rel": -2 },
    "postEvent": "虽然刺耳，但好像也没说错..."
  },

  "colleague_yimin_fired_01": {
    "month": [8, 11],
    "text": "今天亿民的工位空了。HR说他被'优化'了。整层楼都安静了。",
    "type": "special",
    "system": "colleague",
    "once": true,
    "include": { "month": ">7" },
    "effect": { "brain": -12, "hp": -5, "yimin_rel": -99 },
    "postEvent": "你打开手机，去年一起加班的照片还在。你发了条消息：'民哥，保重。'"
  }
}

// === 转折事件 ===
{
  "colleague_yimin_ai_convert_01": {
    "month": [7, 10],
    "text": "亿民今天居然主动问你：'那个...DeepSeek怎么用？'",
    "type": "special",
    "system": "colleague",
    "once": true,
    "include": { "yimin_rel": ">60" },
    "title": "🤖 亿民的AI觉醒",
    "desc": "一直抵触AI的亿民终于开始松动了...",
    "type": "choice",
    "choices": [
      {
        "text": "📚 认真教他：花一下午带他入门",
        "hint": "brain -8, 关系+20, 但当日工作受影响",
        "result": "亿民学得很认真，晚上发消息说：'谢谢，这东西确实有点东西。'",
        "effect": { "brain": -8, "yimin_rel": 20, "bossSatisfy": -1 }
      },
      {
        "text": "📎 发个教程链接：'自己看看就行'",
        "hint": "关系+5",
        "result": "亿民点点头，没再说什么。",
        "effect": { "yimin_rel": 5 }
      },
      {
        "text": "😏 '怎么，大佬也用AI了？'",
        "hint": "关系-10",
        "result": "亿民脸一沉：'算了。' 转身走了。",
        "effect": { "yimin_rel": -10 }
      }
    ]
  },

  "colleague_yimin_godcode_01": {
    "month": [9, 12],
    "text": "亿民今天提交了一版代码，用AI重构了整个渲染管线。所有人都惊了。",
    "type": "special",
    "system": "colleague",
    "once": true,
    "include": { "yimin_ai_convert": true },
    "effect": { "brain": -5, "yimin_rel": 3 },
    "postEvent": "亿民说：'工具就是工具。关键是脑子。' 你若有所悟。",
    "branch": [
      {
        "cond": { "brain": ">70" },
        "text": "看到亿民的代码，你深受启发，也重构了自己的代码。",
        "type": "good",
        "effect": { "brain": 10, "bossSatisfy": 3 }
      },
      {
        "cond": {},
        "text": "你对着亿民的代码看了半天，似懂非懂。差距有点大...",
        "type": "neutral",
        "effect": { "brain": -5 }
      }
    ]
  }
}
```

---

## 四、添加新同事指南

### 步骤

1. **定义角色**：在本文件添加新的人设章节
2. **添加关系属性**：在 `attributes.md` 添加 `{name}_rel` 属性
3. **在 `_schema.md` 的可用键名**中登记新关系属性
4. **编写事件**：在本文件追加，或让 AI 根据人设生成

### 新同事模板

```markdown
## [新同事名] — [职位]

### 人设
- **全名**：
- **年龄**：
- **性格**：（3~5个标签）
- **对AI态度**：
- **口头禅**：（2~3句）

### 关系等级效果
| 关系值 | 等级 | 效果 |
|:---|:---|:---|
| 0–20  | 😐 | ... |
| 21–50 | 🤝 | ... |
| 51–70 | 😊 | ... |
| 71–90 | 🤗 | ... |
| 91–100| 💪 | ... |

### 事件（JSON格式，遵循 _schema.md）
```

### 给 AI 的 Prompt 模板

```
请阅读 `_schema.md` 和 `colleagues.md`。

我要添加一个新同事：
- 名字：[名字]
- 职位：[职位]
- 性格：[描述]
- 对AI态度：[描述]

请为这个角色：
1. 写出完整的人设描述
2. 生成 8~10 个互动事件（混合正面/负面/选择），JSON格式
3. 所有事件的 system 字段设为 "colleague"
4. 事件ID格式：colleague_{name}_{desc}_{seq}
```
