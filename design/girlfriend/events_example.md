# 💕 女朋友系统 — 事件示例 (events_example)

> **已有的女朋友事件 JSON 示例。AI 生成新事件时参考这些格式和数值范围。**

---

## 约会选择事件

```jsonc
{
  "gf_date_casual_01": {
    "month": [1, 12],
    "text": "女朋友发消息：'周末出来逛逛？好久没一起出门了。'",
    "type": "choice",
    "system": "girlfriend",
    "weight": 3,
    "tags": ["恋爱", "约会"],
    "include": { "gf_rel": ">30" },
    "title": "💕 周末约会",
    "desc": "女朋友想出去逛街。你的钱包和时间都有点紧……",
    "choices": [
      {
        "text": "🛍️ '走！想去哪都行'",
        "hint": "痛快答应，花钱哄她开心",
        "result": "你们逛了一下午商场，她拉着你试了无数件衣服。你的脚酸了但她很开心。",
        "effect": { "money": -800, "hp": -3, "gf_rel": 8 }
      },
      {
        "text": "🌳 '去公园走走吧，不用花钱也挺好'",
        "hint": "省钱方案，她可能喜欢也可能嫌弃",
        "chanceBased": true,
        "branches": [
          { "chance": 55, "result": "你们在公园散步聊天看日落，她靠在你肩上说：'其实这样挺好的。'", "type": "good", "effect": { "hp": 3, "gf_rel": 5 } },
          { "chance": 45, "result": "她嘴上说好，但逛了半小时就没精神了。回家路上一直刷闺蜜的朋友圈。", "type": "bad", "effect": { "gf_rel": -3 } }
        ]
      },
      {
        "text": "😓 '这周末要加班，下次吧'",
        "hint": "拒绝约会，她可能不高兴",
        "result": "她沉默了一会儿，回了个'好吧'。你隐约感觉到一丝冷淡。",
        "effect": { "gf_rel": -5 }
      }
    ]
  }
}
```

---

## 好感度分支事件

```jsonc
{
  "gf_complain_overtime_01": {
    "month": [2, 12],
    "text": "女朋友打来电话：'你又加班？这个月你已经加了好几天了！你到底有没有在乎过我的感受？'",
    "type": "bad",
    "system": "girlfriend",
    "weight": 2,
    "tags": ["恋爱", "冲突"],
    "include": { "is_overtime": true, "gf_rel": ">20" },
    "branch": [
      {
        "cond": { "charm": ">60" },
        "text": "你温柔地解释了工作情况，承诺这周末好好陪她。她叹了口气：'好吧，注意身体。'",
        "type": "neutral",
        "effect": { "gf_rel": -2 }
      },
      {
        "cond": {},
        "text": "你说'没办法，工作就是这样'。她直接挂了电话。",
        "type": "bad",
        "effect": { "gf_rel": -8, "brain": -3 }
      }
    ]
  }
}
```

---

## 求婚事件

```jsonc
{
  "gf_propose_01": {
    "month": [9, 12],
    "text": "你看着存款和她的笑脸，心里萌生了一个念头：也许……是时候了？",
    "type": "choice",
    "system": "girlfriend",
    "once": true,
    "weight": 4,
    "tags": ["恋爱", "求婚"],
    "include": { "gf_rel": ">90", "money": ">30000" },
    "exclude": { "gf_broke_up": true },
    "title": "💍 求婚",
    "desc": "你攒够了钱，她也一直在你身边。要不要……求婚？",
    "choices": [
      {
        "text": "💎 正式求婚！",
        "hint": "人生大事，准备好了就上吧",
        "result": "你选了一个她最爱的餐厅，单膝跪地掏出戒指。她捂着嘴，泪流满面：'我愿意！'全场鼓掌。",
        "effect": { "money": -10000, "gf_rel": 15, "hp": 10, "brain": 10, "charm": 5 },
        "setFlag": "gf_engaged"
      },
      {
        "text": "🤔 '再等等，还不是时候'",
        "hint": "谨慎一点也没错",
        "result": "你按下了这个念头。也许等年终稳定了再说吧。",
        "effect": {}
      }
    ]
  }
}
```
