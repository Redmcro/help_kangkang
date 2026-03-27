# 🎋 Task B: Life Expense Events — Rebalance

**Department:** 礼部
**Priority:** HIGH
**Parallel:** ⚡ Can run simultaneously with A/C/D/E

## Assigned Files

- `data/events/life_expense.json`

## Context — Attribute Philosophy

| Attribute | Drains from | Recovers from |
|:---|:---|:---|
| ❤️ HP | Late nights, sickness, physical strain | Rest, exercise, food |
| 🧠 Brain | Bugs, hard thinking, decisions | Slacking, socializing |
| 👔 Boss | Bad code, delays | Good code, effort |

**Salary is 3000/month.** All money values must be rescaled accordingly.

## Changes Required

### Money Rescaling (target: ~25-30% of original values)

| Event ID | Field | Old Value | New Value |
|:---|:---|:---|:---|
| `life_expense_emergency_hospital_01` | money | [-1500,-2500] | **[-500,-1000]** |
| `life_expense_phone_broken_01` | money | [-1000,-2000] | **[-400,-800]** |
| `life_expense_double_eleven_01` | money | [-2000,-4000] | **[-600,-1500]** |
| `life_expense_air_conditioner_01` | money | [-500,-1000] | **[-200,-400]** |
| `life_expense_taxi_overtime_01` | money | [-150,-300] | **[-80,-150]** |
| `life_expense_water_heater_01` | money | -800 | **-300** |
| `life_expense_social_wedding_01` | money | -1000 | **-500** |
| `life_expense_social_wedding_02` | money | -2000 | **-800** |
| `life_expense_glasses_01` | money | -1200 | **-500** |
| `life_expense_laptop_repair_01` | money | -2500 | **-1000** |
| `life_expense_pet_cat_01` | money | -1500 | **-600** |
| `life_expense_pet_cat_monthly_01` | money | -500 | **-200** |
| `life_expense_gym_membership_01` | money | -2000 | **-800** |
| `life_expense_parents_birthday_01` | money | -2000 | **-800** |
| `life_expense_food_delivery_01` | money | -300 | **-150** |
| `life_expense_milk_tea_addiction_01` | money | -300 | **-150** |
| `life_expense_haircut_01` | money | -200 | **-100** |
| `life_expense_emergency_lockout_01` | money | -300 | **-150** |
| `life_expense_friend_borrow_01` | money | -1000 | **-500** |
| (friend returns) branch | money | 1100 | **550** |
| `life_expense_winter_clothes_01` | money | -800 | **-400** |
| `life_expense_subway_card_01` | money | -150 | **-80** |
| `life_expense_utility_bill_shock_01` | money | -300 | **-150** |
| `life_expense_fridge_empty_01` | money | -400 | **-200** |
| `life_raise_bonus_01` | money | 2000 | **800** |
| `life_expense_lucky_refund_01` | money | 300 | **150** |
| `life_expense_cashback_01` | money | 200 | **100** |
| `life_expense_annual_physical_01` bad branch | money | -300 | **-150** |

### Salary Review Events

| Event ID | Branch | Old salary delta | New salary delta |
|:---|:---|:---|:---|
| `life_salary_review_q1` | good | +2000 | **+500** |
| `life_salary_review_q1` | bad | -500 | **-300** |
| `life_salary_review_q2` | good | +2000 | **+500** |
| `life_salary_review_q2` | bad | -500 | **-300** |
| `life_salary_review_q3` | good | +2000 | **+500** |
| `life_salary_review_q3` | bad | -500 | **-300** |

### Living Cost Events

| Event ID | Old living_cost delta | New |
|:---|:---|:---|
| `life_rent_increase_01` | +500 | **+300** |
| `life_cost_inflation_01` | +300 | **+200** |
| `life_roommate_move_01` → 独租 | +1500 | **+800** |
| `life_roommate_move_01` → 搬郊区 | -500 | **-300** |

### HP/Brain Corrections (Attribute Philosophy)

| Event ID | Current Effect | Fix | Reason |
|:---|:---|:---|:---|
| `life_expense_double_eleven_01` | hp:[2,5], brain:[2,5] | hp:0, brain:[3,5] | Shopping doesn't heal body, it relieves stress (brain) |
| `life_expense_cook_save_01` | hp:5, money:200 | hp:5, money:100 | Cooking = good food = hp recovery ✅ |
| `life_expense_gym_membership_01` good branch | hp:8, charm:3 | hp:8, brain:0, charm:3 | Exercise recovers body not brain |
| `life_expense_instant_noodles_01` | hp:-5, brain:-3 | hp:-5, brain:0 | Bad food hurts body, not brain |
| `life_expense_glasses_01` | hp:2, brain:2 | hp:0, brain:3 | Glasses help see code better = brain boost |

## Acceptance Criteria

- [ ] All money values rescaled to 3000 salary baseline
- [ ] Salary review raises changed to +500/-300
- [ ] Living cost deltas reduced
- [ ] HP/Brain effects follow attribute philosophy
- [ ] Valid JSON (no syntax errors)
