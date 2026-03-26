# 📐 事件数据格式规范 (_schema)

> **本文件定义了所有游戏事件的 JSON 格式。任何人/AI 生成的事件都必须符合此规范。**

---

## 一、事件 ID 命名规则

```
{系统}_{描述}_{序号}

示例：
  colleague_shaoye_lunch_01     → 同事系统 - 少爷请吃午饭 - 第1个
  monthly_m3_opus_release       → 月份事件 - 3月Opus发布
  random_good_exercise_01       → 随机事件 - 正面 - 锻炼
  choice_ai_budget_01           → 选择事件 - AI预算管理
  daily_bug_emergency_01        → 每日任务 - 紧急修Bug
```

---

## 二、基础事件格式

```jsonc
{
  "event_id": {
    // ========== 必填 ==========
    "month": [min, max],        // 触发月份范围，1~12
    "text": "事件描述文本",       // 显示给玩家的文字

    // ========== 可选：分类 ==========
    "type": "good",             // 类型：special / good / bad / choice / neutral / money
    "weight": 1,                // 权重（默认1，越大越容易被选中）
    "once": true,               // 是否只触发一次（默认 false）
    "filler": true,             // 填充事件标记（优先级最低）
    "system": "colleague",      // 所属系统标记（colleague/model/economy/daily/random/choice/monthly/girlfriend/life_expense）
    "tags": ["职场", "社交"],    // 主题标签，方便按主题筛选和平衡

    // ========== 可选：效果 ==========
    "effect": {                 // 对属性的直接修改
      "hp": -5,
      "money": -1000,
      "brain": 3,
      "bossSatisfy": 2,
      "shaoye_rel": 5,          // 同事关系值
      "yimin_rel": -3,
      "gf_rel": 5               // 女朋友关系值
    },
    "postEvent": "补充文本",     // 事件后追加显示

    // ========== 可选：前置条件 ==========
    "include": {                // 满足才会进入事件池
      "brain": ">60",
      "month": ">3",
      "shaoye_rel": ">50"
    },
    "exclude": {                // 满足则排除
      "bossSatisfy": "<20"
    },

    // ========== 可选：分支（条件结果）==========
    "branch": [
      {
        "cond": { "brain": ">70" },
        "text": "脑力够，成功修复！",
        "type": "good",
        "effect": { "bossSatisfy": 3 }
      },
      {
        "cond": {},              // 空 cond = fallback，必须放最后
        "text": "脑力不够，修了一晚上...",
        "type": "bad",
        "effect": { "hp": -8, "brain": -5 }
      }
    ],

    // ========== 可选：选择事件 ==========
    "type": "choice",
    "title": "🎯 事件标题",
    "desc": "选择面板描述文字",
    "choices": [/* 见下方"选择项格式" */]
  }
}
```

---

## 三、选择项格式

### 模式A：简单选择

```jsonc
{
  "text": "💪 选项文字",
  "hint": "描述性提示，不要写数值",
  "result": "选择后的结果文字",
  "effect": { "brain": 5, "hp": -3 },
  "setFlag": "flag_name"         // 可选：设置逻辑标记
}
```

> [!CAUTION]
> **hint 规则（必须遵守）：**
> - ❌ 禁止写属性数值：`"hint": "brain+10, hp-5"` 
> - ✅ 用描述性/暗示性文字：`"hint": "系统学习，打好基础"`
> - ✅ 让玩家靠直觉判断：`"hint": "老板会记住你的付出"`
> - ⚠️ 锁定条件（require）的提示保留（如"需要charm 60+"），因为这是UI锁定机制

### 模式B：概率选择

```jsonc
{
  "text": "🎲 碰碰运气",
  "hint": "看运气",
  "chanceBased": true,
  "branches": [
    { "chance": 60, "result": "成功了！", "type": "good", "effect": { "money": 5000 } },
    { "chance": 40, "result": "失败了...", "type": "bad", "effect": { "money": -1000 } }
  ]
}
```

### 模式C：条件判定

```jsonc
{
  "text": "📚 尝试学习",
  "hint": "需要脑力60+",
  "require": { "brain": 60 },
  "success": "学会了！",
  "successEffect": { "brain": 10, "bossSatisfy": 3 },
  "fail": "学不会...",
  "failEffect": { "brain": -3 },
  "setFlag": "learned_skill"     // 成功时设置
}
```

---

## 四、条件表达式

所有 `include` / `exclude` / `cond` / `require` 中的条件格式：

| 写法 | 含义 | 示例 |
|:---|:---|:---|
| `">N"` | 大于 N | `"brain": ">60"` |
| `"<N"` | 小于 N | `"hp": "<30"` |
| `"=value"` | 等于 | `"current_model": "=doubao"` |
| `"!value"` | 不等于 | `"current_model": "!doubao"` |
| `N` (数字) | 至少为 N | `"brain": 60` |
| `true/false` | 布尔 | `"has_met_shaoye": true` |

---

## 五、可用的属性键名

> **生成事件时，effect 和条件中只能使用以下键名：**
> **完整属性定义见 `_global/attributes.md`**

### 核心属性
| 键名 | 说明 | 范围 |
|:---|:---|:---|
| `hp` | 生命值 | 0–100 |
| `money` | 金钱（元） | 0–∞ |
| `brain` | 脑力 | 0–100 |
| `bossSatisfy` | 老板满意度 | 0–100 |

### 关系属性
| 键名 | 说明 | 范围 |
|:---|:---|:---|
| `shaoye_rel` | 少爷关系 | 0–100 |
| `yimin_rel` | 亿民关系 | 0–100 |
| `gf_rel` | 女朋友好感 | 0–100 |
| `has_girlfriend` | 是否有女朋友 | bool |
| `married` | 是否已婚 | bool |

### 隐藏属性（UI 不显示，影响事件结果）
| 键名 | 说明 | 范围 |
|:---|:---|:---|
| `charm` | 魅力，影响社交/关系增益/谈判 | 0–100 |
| `luck` | 运气，影响概率选择/Bug率/随机事件 | 0–100 |

### 状态 Flag（布尔/字符串）
| 键名 | 类型 | 说明 |
|:---|:---|:---|
| `current_model` | string | 当前使用的AI模型键名 |
| `month` | number | 当前月份 1–12 |
| `is_overtime` | bool | 是否在加班状态 |
| `consecutive_overtime` | number | 连续加班天数 |
| `avg_quality` | number | 平均代码质量 |
| `total_bugs` | number | 累计Bug数 |

> [!TIP]
> 需要新增 Flag 时，在事件中使用 `setFlag` 设置，然后在其他事件的条件中引用即可。
> **务必在 `_global/attributes.md` 的 Flag 注册表中登记新 Flag。**

---

## 六、完整事件示例

```json
{
  "colleague_shaoye_20bugs_01": {
    "month": [2, 12],
    "text": "少爷面无表情地走过来：'你这版有 20 个 Bug。'",
    "type": "bad",
    "system": "colleague",
    "tags": ["职场", "社交"],
    "once": false,
    "include": { "shaoye_rel": ">30" },
    "branch": [
      {
        "cond": { "brain": ">60" },
        "text": "你和少爷一起排查，全部修好了。少爷露出了满意的微笑。",
        "type": "good",
        "effect": { "brain": -8, "bossSatisfy": 2, "shaoye_rel": 5 }
      },
      {
        "cond": {},
        "text": "你对着Bug列表欲哭无泪，少爷叹了口气帮你改了几个。",
        "type": "bad",
        "effect": { "brain": -15, "hp": -5, "shaoye_rel": -3 }
      }
    ]
  }
}
```
