# 📊 属性系统 (attributes)

> **定义游戏中所有数值属性的范围、初始值、联动规则。**
> 依赖：无（本文件是基础定义）
> 被依赖：所有事件系统

---

## 一、核心属性

| 属性 | 键名 | 初始值 | 范围 | 图标 | 说明 |
|:---|:---|:---|:---|:---|:---|
| 生命 | `hp` | 100 | 0–100 | ❤️ | 健康/体力，归零=猝死 |
| 金钱 | `money` | 5000 | 0–∞ | 💰 | 单位：元 |
| 脑力 | `brain` | 80 | 0–100 | 🧠 | 理解/改Bug能力 |
| Token | `token` | 50 | 0–∞ | 🪙 | 单位：M（1B=1000M） |
| 老板满意度 | `bossSatisfy` | 50 | 0–100 | 👔 | 决定结局的核心 |

---

## 二、同事关系属性

| 属性 | 键名 | 初始值 | 范围 | 说明 |
|:---|:---|:---|:---|:---|
| 少爷好感 | `shaoye_rel` | 50 | 0–100 | 测试同事 |
| 亿民好感 | `yimin_rel` | 50 | 0–100 | 程序员同事 |

---

## 三、隐藏属性（UI 不显示）

> 玩家看不到这些数值，但它们在幕后影响事件触发和结果。
> 完整机制说明见 `GAME_DESIGN.md` 二.2.3。

| 属性 | 键名 | 初始值 | 范围 | 说明 |
|:---|:---|:---|:---|:---|
| 魅力 | `charm` | 50 | 0–100 | 影响同事关系增益、老板社交印象、谈判收入 |
| 运气 | `luck` | 50 | 0–100 | 影响概率选择、Bug率、随机事件正负倾向 |

---

## 四、自然恢复与衰减

每月初自动执行：

```
brain += 10（休息恢复，上限100）
hp    += 5 （自然恢复，上限100）

如果上个月有连续加班：
  brain 恢复量减半
  hp 恢复量减半
```

---

## 五、属性联动

```
  hp ≤ 0     → 猝死结局
  brain ≤ 0  → 精神崩溃结局
  money < 0 连续3月 → 破产结局
  bossSatisfy < 20 → 被裁→外卖骑手

  brain < 30 → 「脑雾状态」所有代码质量 -20
  brain < 15 → 无法正常工作
  brain < 5  → 强制休息

  token = 0  → 只能纯人肉写代码（脑力消耗翻倍）
  money ≤ 0  → 无法买Token + "吃泡面"事件
```

---

## 六、老板满意度详细规则

### 来源

| 行为 | 变化 |
|:---|:---|
| 代码质量 ≥ 90 | +2 |
| 代码质量 70–89 | +1 |
| 代码质量 50–69 | 0 |
| 代码质量 30–49 | -2 |
| 代码质量 < 30 | -5 |
| 按时交付 Deadline | +5 |
| 延期 | -8 |
| 学AI新技能 | +3 |
| 接私活被发现 | -5 |
| 主动加班 | +1 (hp -3) |

### 阈值

| 满意度 | 状态 |
|:---|:---|
| ≥ 80 | 🌟 晋升/大幅加薪 |
| 60–79 | ✅ 安全区 |
| 40–59 | ⚠️ 危险，可能被约谈 |
| 20–39 | 🔴 裁员名单 |
| < 20 | 💀 立即被裁 |

---

## 七、Flag 注册表

> **所有 `setFlag` 设置的 Flag 都必须在此登记，以便 AI 和人类追踪。**

### 模型解锁 Flag

| Flag | 类型 | 来源系统 | 设置时机 | 影响 |
|:---|:---|:---|:---|:---|
| `model_doubao_unlocked` | bool | ai_models | 1月开局 | 可选豆包模型 |
| `model_gpt54_unlocked` | bool | ai_models | 2月解锁 | 可选GPT-5.4 |
| `model_opus46_unlocked` | bool | ai_models | 3月解锁 | 可选Opus 4.6 |
| `model_cheapgpt_unlocked` | bool | ai_models | 3月选择 | 可选CheapGPT |
| `model_deepseek_v4_unlocked` | bool | ai_models | 4月解锁 | 可选DeepSeek V4 |
| `model_fakeopus_unlocked` | bool | ai_models | 5月选择 | 可选FakeOpus |

### 同事关系 Flag

| Flag | 类型 | 来源系统 | 设置时机 | 影响 |
|:---|:---|:---|:---|:---|
| `yimin_ai_convert` | bool | colleagues | 亿民开始学AI事件 | 解锁亿民后续AI事件 |
| `yimin_token_discount` | bool | colleagues | 亿民分享渠道 | Token购买打8折 |

### 学习/技能 Flag

| Flag | 类型 | 来源系统 | 设置时机 | 影响 |
|:---|:---|:---|:---|:---|
| `learned_ai_course` | bool | choice | 购买AI课程 | brain判定加成 |
| `switched_to_doubao` | bool | choice | Token告急切豆包 | 豆包相关事件权重提升 |

### 人生/抉择 Flag

| Flag | 类型 | 来源系统 | 设置时机 | 影响 |
|:---|:---|:---|:---|:---|
| `considered_delivery` | bool | choice | 考虑过送外卖 | 解锁骑手相关后续事件 |
| `gamejam_won` | bool | monthly | GameJam获奖 | 解锁独立开发者结局 |
| `sharedToy` | bool | choice | 分享玩具选择 | 后续社交事件 |

> [!TIP]
> **添加新 Flag 时**：在事件中使用 `setFlag`，然后在此表中登记 Flag 名称、类型、来源和影响。
