# 🏆 结局系统 — AI 规范 (_ai_spec)

> **本文件供 AI 阅读，定义结局系统的规则。**
> 必须同时阅读：`_global/_schema.md` + `_global/attributes.md`

---

## 一、结局判定时机

```
12月底触发 monthly_m12_judgment 事件后进入结局判定：

优先级（从高到低）：
  1. 隐藏结局（条件苛刻，最先检查）
  2. 失败结局（已在游戏中途触发过的）
  3. 胜利结局（按满意度和质量排序）
  4. 兜底：外卖骑手
```

---

## 二、已有结局

### 胜利结局
| ID | 名称 | 条件 | 金币 |
|:---|:---|:---|:---|
| `ending_ai_master` | 🏆 AI 大师 | bossSatisfy ≥ 80, avg_quality ≥ 80 | 150 |
| `ending_survive` | ✅ 安稳过关 | bossSatisfy ≥ 50 | 80 |
| `ending_indie_dev` | 🎮 独立开发者 | gamejam_won = true | 120 |

### 失败结局
| ID | 名称 | 条件 | 金币 |
|:---|:---|:---|:---|
| `ending_rider` | 🛵 外卖骑手 | bossSatisfy < 20 / 年终不达标 | 30 |
| `ending_death` | 💀 过劳猝死 | hp ≤ 0 | 20 |
| `ending_breakdown` | 😵 精神崩溃 | brain ≤ 0 | 20 |
| `ending_bankrupt` | 💸 破产回家 | money < 0 连续3月 | 10 |

### 隐藏结局
| ID | 名称 | 条件 | 金币 |
|:---|:---|:---|:---|
| `ending_become_ai` | 🤖 成为AI的形状 | brain < 10 | 50 |
| `ending_zen_coder` | 🧘 禅意程序员 | brain ≥ 90, 全程不用AI | 100 |
| `ending_doubao_god` | 🐳 豆包之神 | 全程只用豆包, avg_quality ≥ 75 | 130 |
| `ending_trio` | 🤝 铁三角 | shaoye_rel ≥ 90, yimin_rel ≥ 90 | 100 |

---

## 三、事件生成约束

1. 每个结局需要：条件(JSON)、标题、3~5段文学性描述、金币奖励
2. 隐藏结局条件应苛刻且覆盖不同游戏风格
3. 金币范围：失败 10~30，胜利 80~150，隐藏 50~130
