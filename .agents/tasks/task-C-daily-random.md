# 🏦 Task C: Daily & Random Events — Rebalance

**Department:** 户部
**Priority:** HIGH
**Parallel:** ⚡ Can run simultaneously with A/B/D/E

## Assigned Files

- `data/events/daily.json`
- `data/events/random.json`

## Context — Attribute Philosophy

| Attribute | Drains from | Recovers from |
|:---|:---|:---|
| ❤️ HP | Late nights, overtime, sickness | Rest, exercise, food |
| 🧠 Brain | Bugs, hard tasks, meetings, mental stress | Slacking, socializing, breaks |
| 👔 Boss | Bad code, delays | Good code, effort |

**Salary is 3000/month.** All money values rescaled accordingly.

## Changes Required

### daily.json — Money Rescaling

| Event ID / Pattern | Old money | New money |
|:---|:---|:---|
| `daily_system_dialog_01` | [-60,-120] | **[-30,-60]** |
| `daily_system_quest_01` | [-50,-100] | **[-25,-50]** |
| `daily_arch_ecs_01` | [-180,-300] | **[-80,-150]** |
| `daily_arch_network_01` | [-200,-400] | **[-90,-180]** |
| `daily_ar_demo_01` base | -60 | **-30** |
| `daily_ar_demo_01` good branch | -90 | **-45** |
| `daily_ai_chatbot_01` "硬着头皮做" | -120 | **-60** |
| `daily_perf_optimize_01` | -60 | **-30** |
| `daily_anticheat_01` | -75 | **-40** |
| `daily_anticheat_01` good branch | +500 | **+300** |
| `daily_crossplatform_01` | -150 | **-80** |
| `daily_localization_01` | -45 | **-25** |
| `daily_procgen_01` | -105 | **-50** |
| `daily_ai_art_review_01` script branch | -30 | **-15** |

### daily.json — HP/Brain Philosophy Fixes

| Event ID | Current | Fix | Reason |
|:---|:---|:---|:---|
| `daily_ui_button_01` | hp:2, brain:1 | hp:0, brain:0 | Simple work doesn't heal/drain |
| `daily_ui_layout_01` | hp:2, brain:1 | hp:0, brain:0 | Same |
| `daily_bug_crash_01` bad branch | boss:-3, brain:-5, hp:-5 | boss:-3, brain:-5, hp:-3 | Debugging is brain drain mainly, hp only from stress |
| `daily_bug_memory_01` bad branch | brain:-3, hp:-3 | brain:-5, hp:0 | Memory leak debug = pure brain work |
| `daily_ceo_demo_01` base effect | hp:-5 | hp:-3 | Stress/nervousness, not physical |
| `daily_ceo_demo_01` bad branch | boss:-8, hp:-8, brain:-3 | boss:-8, hp:-3, brain:-8 | Demo failure = mental devastation, mild physical stress |
| `daily_liveops_rush_01` base | brain:-3, hp:-3 | brain:-3, hp:0 | Rush = mental pressure, not physical |
| `daily_liveops_rush_01` good | boss:3, brain:-3, hp:-3 | boss:3, brain:-3, hp:-5 | Stayed up all night = hp drain |
| `daily_first_try_01` | boss:3, brain:2 | boss:3, brain:3 | Code working first try = brain boost (satisfaction) |
| `daily_coffee_debug_01` | brain:3, hp:2 | brain:3, hp:0 | Coffee break helps brain, not body |
| `daily_coffee_debug_01` good branch | brain:4, hp:3 | brain:5, hp:0 | Same |

### random.json — Money Rescaling

| Event ID | Old money | New money |
|:---|:---|:---|
| `random_good_bonus_01` | [300,800] | **[200,500]** |
| `random_good_raise_01` | 1500 | **600** |
| `random_good_side_income_01` | 500 | **300** |
| `random_bad_first_prompt_disaster_01` | -60 | **-30** |
| `random_good_ai_tool_clients_01` | 5000 | **2000** |
| `random_good_ai_conf_referral_01` | 2000 | **1000** |
| `random_good_ai_conf_insider_01` | 150 | **80** |
| `random_good_vending_code_01` | 100 | **50** |
| `random_bad_api_down_01` | -30 | **-15** |

### random.json — HP/Brain Philosophy Fixes

| Event ID | Current | Fix | Reason |
|:---|:---|:---|:---|
| `random_good_gym_01` | hp:[3,7], brain:[2,4] | hp:[5,8], brain:0 | Exercise = body recovery, not brain |
| `random_good_cat_01` | hp:[2,5], brain:[2,4] | hp:0, brain:[3,6] | Petting cat = mental relaxation |
| `random_bad_meeting_01` | brain:[-3,-7], hp:[-1,-3] | brain:[-3,-5], hp:0 | Meetings drain brain, not body |
| `random_good_inspiration_01` | brain:[5,10], hp:[-3,-1] | brain:[5,10], hp:[-3,-1] | ✅ Late night insight = brain up, hp down |
| `random_bad_insomnia_01` | brain:[-5,-10], hp:[-3,-7] | hp:[-5,-8], brain:[-2,-3] | Insomnia = mainly body, mild brain fog |
| `random_bad_data_loss_01` | brain:-10, hp:-3 | brain:-10, hp:0 | Code loss = pure mental anguish |
| `random_bad_data_loss_01` bad branch | brain:-10, hp:-5 | brain:-12, hp:0 | Same |
| `random_bad_timeloop_debug_01` | brain:-10, hp:-5 | brain:-10, hp:-3 | Debug loop = mainly brain, mild hp from sitting |
| `random_bad_coffee_sentient_01` | brain:-5, hp:-3 | brain:-5, hp:0 | No coffee = brain sluggish, not physical |
| `random_bad_so_down_01` | brain:-8, hp:-3 | brain:-8, hp:0 | Can't look up answers = brain problem |
| `random_bad_wifi_war_01` | brain:-5, hp:-2 | brain:-5, hp:0 | WiFi down = work blocked = brain frustration |
| `random_bad_comparison_01` | brain:-3, hp:-2 | brain:-5, hp:0 | Envy = mental damage |
| `random_good_first_slack_01` | hp:3, brain:3 | hp:0, brain:5 | Slacking = brain recovery, not hp |
| `random_good_code_zen_01` | brain:[3,8], boss:[2,5], hp:[-3,-1] | brain:[-2,0], boss:[2,5], hp:[-3,-1] | Flow state: great output but tiring, brain slightly drained |
| `random_bad_parallel_merge_01` | brain:-8, hp:-3 | brain:-8, hp:0 | Merge conflicts = pure mental pain |
| `random_bad_ai_rebellion_01` | brain:-5, hp:-3 | brain:-5, hp:0 | Unsettling AI = mental, not physical |
| `random_bad_req_change_01` | brain:-8, hp:-3, boss:-2 | brain:-8, hp:0, boss:-2 | Requirements change = pure brain overload |
| `random_bad_compiler_01` | brain:-5, hp:-2 | brain:-5, hp:0 | Compiler errors = brain frustration |

## Acceptance Criteria

- [ ] All money values rescaled to 3000 baseline
- [ ] HP only drains from physical/sleep causes
- [ ] Brain only drains from mental causes
- [ ] Slacking/socializing events recover Brain, not HP
- [ ] Exercise recovers HP, not Brain
- [ ] Valid JSON (no syntax errors)
