# 🤝 同事系统 — 事件示例 (events_example)

> **已有的同事事件 JSON 示例。AI 生成新事件时参考这些格式和数值范围。**

---

## 少爷事件示例

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
  }
}
```

---

## 亿民事件示例

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

// === 选择事件 ===
{
  "colleague_yimin_ai_convert_01": {
    "month": [7, 10],
    "text": "亿民今天居然主动问你：'那个...DeepSeek怎么用？'",
    "type": "choice",
    "system": "colleague",
    "once": true,
    "include": { "yimin_rel": ">60" },
    "title": "🤖 亿民的AI觉醒",
    "desc": "一直抵触AI的亿民终于开始松动了...",
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
  }
}
```
