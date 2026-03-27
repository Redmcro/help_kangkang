# ⚔️ Task D: Monthly & General Events — Rebalance

**Department:** 兵部
**Priority:** HIGH
**Parallel:** ⚡ Can run simultaneously with A/B/C/E

## Assigned Files

- `data/events/monthly.json`
- `data/events/general.json`

## Context — Attribute Philosophy

| Attribute | Drains from | Recovers from |
|:---|:---|:---|
| ❤️ HP | Late nights, overtime, sickness | Rest, exercise, food |
| 🧠 Brain | Bugs, hard tasks, meetings, mental stress | Slacking, socializing, breaks |
| 👔 Boss | Bad code, delays | Good code, effort |

**Salary is 3000/month.** All money values rescaled accordingly.

## Changes Required

### monthly.json — Money Rescaling

| Event ID | Field | Old Value | New Value |
|:---|:---|:---|:---|
| `monthly_m2_new_year_bonus` | money | 3000 | **1500** |
| `monthly_m4_deepseek_release` | money | 150 | **80** |
| `monthly_m6_deadline_push` "通宵干完" | (no money change) | — | — |
| `monthly_m9_gamejam` 一等奖branch | money | 10000 | **5000** |
| `monthly_m10_model_crash` | money | 300 | **150** |
| `monthly_m10_national_day` "主动值班" | money | 2000 | **1000** |
| `monthly_m3_model_anxiety` "每个都试" | money | -90 | **-50** |
| `monthly_m3_model_anxiety` "挑最贵的" | money | -150 | **-80** |
| `monthly_m6_618_token_sale` "充3000" | money | -2400 | **-1000** |
| `monthly_m6_618_token_sale` "充500" | money | -350 | **-200** |
| `monthly_m7_blackout` "星巴克" | money | -50 | **-30** |
| `monthly_m8_review` good branch | money | 2000 | **800** |
| `monthly_m12_final_verdict` S级 | money | 20000 | **6000** |
| `monthly_m12_final_verdict` B级 | money | 10000 | **3000** |
| `monthly_m12_final_verdict` C级 | money | 3000 | **1000** |

### monthly.json — HP/Brain Philosophy Fixes

| Event ID | Current | Fix | Reason |
|:---|:---|:---|:---|
| `monthly_m7_heatwave_crisis` | hp:-3, brain:-3 | hp:-5, brain:0 | Heat = physical discomfort |
| `monthly_m6_deadline` | hp:-4, brain:-3, boss:-3 | hp:-5, brain:-5, boss:-3 | Deadline crunch = both physical (overtime) and mental |
| `monthly_m6_deadline_push` "通宵" | hp:-8, brain:-3 | hp:-8, brain:-5 | All-nighter = extreme hp drain + heavy brain |
| `monthly_m7_summer_intern` | boss:-2, brain:-3 | boss:-2, brain:-3 | ✅ Pressure from competition is mental |
| `monthly_m11_yearend_sprint` | hp:-2, brain:-2 | hp:-3, brain:0 | Sprint pressure = physical stress from pace |
| `monthly_m8_awakening` "拼命学" | brain:5, hp:-3, boss:3 | brain:5, hp:-5, boss:3 | Late night study = more hp drain |

### general.json — Money Rescaling

| Event ID | Field | Old | New |
|:---|:---|:---|:---|
| `freelance_opportunity` success | money | 3000 | **1500** |
| `general_keyboard_upgrade_01` | money | -800 | **-300** |
| `general_good_snack_hero_01` | money | -150 | **-80** |
| `monthly_m4_survival_choice` "拿赔偿" | money | 15000 | **5000** |
| `general_new_team_lunch_01` both branches | money | -120 | **-80** |
| `general_printer_battle_01` | money | -20 | **-10** |

### general.json — HP/Brain Philosophy Fixes

| Event ID | Current | Fix | Reason |
|:---|:---|:---|:---|
| `general_good_meeting_nap_01` | hp:5, brain:3 | hp:3, brain:3 | Napping in meeting = mild hp/brain recovery ✅ |
| `general_good_friday_01` | hp:5, brain:3, charm:1 | hp:0, brain:5, charm:1 | Friday slacking = brain recovery only |
| `general_good_standup_skip_01` | hp:3, brain:2 | hp:0, brain:3 | Skipped meeting = brain relief |
| `general_bad_deploy_friday_01` bad branch | hp:-10, brain:-8 | hp:-8, brain:-5 | Hotfix at 3am = mainly body damage |
| `general_bad_meeting_bomb_01` bad branch | brain:-5, boss:-3, charm:-2 | brain:-5, hp:0, boss:-3, charm:-2 | Being put on spot = mental stress |
| `overtime_event` | hp:-5, brain:-3 | hp:-5, brain:0 | Overtime = body tired, not brain |
| `coffee_break` | hp:3, brain:2 | hp:0, brain:3 | Coffee = mental boost |
| `general_new_internal_tool_01` | brain:-3, hp:-2 | brain:-3, hp:0 | Bad tools = frustrating, not physical |

## Acceptance Criteria

- [ ] All money values rescaled to 3000 baseline
- [ ] HP only drains from physical/sleep causes
- [ ] Brain only drains from mental causes
- [ ] Valid JSON (no syntax errors)
