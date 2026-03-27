# Event Runtime Architecture v3

Status: Approved-for-implementation draft  
Scope: Runtime architecture, data contract, migration plan  
Out of scope: UI visual redesign

## 1. Problem Summary

Current event behavior is mostly `effect + setFlag`.  
It is good for narrative variation, but weak for domain correctness:

- Event text can imply a business action ("switch model"), while state may not change accordingly.
- Money changes are sometimes encoded as flat deltas, bypassing model pricing rules.
- Flags are heavily used for story gating, but not as formal domain transitions.

Result: event intent and core mechanics can drift apart.

## 2. Design Goals

1. Make event outcomes domain-correct and traceable.
2. Keep all existing content runnable (backward compatibility).
3. Separate responsibilities: event intent, rules, state mutation, projection.
4. Allow gradual migration without stopping content production.

## 3. Layered Architecture

### 3.1 State Layer (Single Source of Truth)

Runtime state is one object, logically grouped by domain:

- `resources`: hp, brain, money
- `career`: bossSatisfy, salary, living_cost, avg_quality, months_bankrupt
- `model_runtime`: current_model, unlocked_models, pricing_modifiers
- `relations`: shaoye_rel, yimin_rel, gf_rel, has_girlfriend, married
- `work_state`: is_overtime, consecutive_overtime, total_bugs
- `traits`: charm, luck
- `flags`: narrative/progression booleans
- `modifiers`: timed effects and policies

Note: storage may remain flat in code for compatibility; logical grouping is the contract.

### 3.2 Event Intent Layer

Events define:

- trigger constraints (`month/include/exclude`)
- branch resolution (`cond`)
- semantic actions (`actions[]`)
- narrative output (`text`, `postEvent`)

Events should express intent, not duplicate system settlement logic.

### 3.3 Rule Layer

Rules own global mechanics:

- model pricing and token charging
- overtime and bankruptcy progression
- monthly recovery/income settlement
- derived impact (for example charm/luck adjustments)

Events call rules via semantic actions; rules never depend on event prose.

### 3.4 Execution Layer

A single executor applies ordered actions and returns:

- state patch (applied changes)
- normalized deltas
- action logs (success/no-op/rejected)

### 3.5 Projection Layer

UI/logging reads execution output and state snapshots only.
No business mutation in projection code.

## 4. Event Contract v3

`actions` becomes first-class payload for event and choice outcomes.

Example:

```json
{
  "token_shortage_v3": {
    "month": [3, 12],
    "type": "choice",
    "title": "Budget Crisis",
    "choices": [
      {
        "text": "Switch to Doubao",
        "actions": [
          { "type": "switch_model", "model": "doubao" },
          { "type": "set_flag", "key": "switched_to_doubao", "value": true }
        ],
        "result": "Switched to Doubao for cost control."
      }
    ]
  }
}
```

Minimum action set:

- `stat_delta`
- `set_state`
- `set_flag`
- `switch_model`
- `unlock_model`
- `charge_tokens`
- `apply_modifier`
- `remove_modifier`

## 5. Action Semantics

### 5.1 `switch_model`

- Validates target model is unlocked.
- Mutates `model_runtime.current_model`.
- Produces explicit log entry for audit/UI.

### 5.2 `unlock_model`

- Adds model to unlocked set/flags.
- Optional `equip: true` can immediately switch model.

### 5.3 `charge_tokens`

- Uses current model price (plus modifiers) from rule layer.
- Rejects raw flat-money bypass for model charging paths.

### 5.4 `stat_delta` and `set_state`

- `stat_delta` for additive change (supports ranges).
- `set_state` for exact assignment.
- Both are validated against schema/invariants.

## 6. Runtime Flow (Authoritative)

For each day/event resolution:

1. Snapshot current state.
2. Build candidate event pool via trigger constraints.
3. Pick event by priority/weight.
4. Resolve branch/choice outcome.
5. Build action plan:
   - Use `actions` if provided.
   - Else compile legacy `effect/setFlag/tokenCost` into actions.
6. Execute actions in order (single executor).
7. Run post-rules (overtime, monthly counters, derived modifiers).
8. Emit normalized log payload.
9. Persist state and update projection/UI.

## 7. Invariants

Must hold after every execution:

- clamped stats remain in defined bounds
- `current_model` is either valid unlocked model or null-human mode
- no token-charge action bypasses model pricing rule
- flags and state keys are schema-valid
- event execution result is deterministic for fixed RNG seeds

## 8. Backward Compatibility

Legacy adapter compiles old payloads:

- `effect` -> `stat_delta` or `set_state`
- `setFlag` -> `set_flag`
- `tokenCost` -> `charge_tokens`

Mixed content mode is supported:

- old and new events coexist
- migration can be per-file/per-event

## 9. Migration Plan

### Phase A: Runtime Foundation

- add action executor and validation
- add legacy adapter
- keep old behavior parity for untouched events

### Phase B: High-Impact Event Migration

- migrate model unlock/switch/budget events first
- remove flat-money approximations for model charge behavior

### Phase C: Broader Content Migration

- migrate relationship/narrative events gradually
- introduce timed modifiers where repeated patterns exist

## 10. First Acceptance Scenarios

1. "Switch to Doubao" choice immediately updates `current_model`.
2. Same-day and later token charging follows Doubao price.
3. Unlock event with `equip` changes both unlock status and active model.
4. Legacy events without `actions` still run with unchanged outcomes.
5. Logs show both narrative text and executed semantic actions.

## 11. Task Split Recommendation

- Engine official: executor + adapter + invariants
- Data official: migrate model/economy critical events to `actions`
- Spec official: schema/attribute docs updated for v3 authoring rules

## 12. Bridge Adapter Contract (Legacy -> v3)

### 12.1 Bridge Input

Bridge reads resolved outcome and source event payload:

- resolved result from EventManager (`text`, `effect`, `setFlag`, `type`)
- raw event/choice node (`actions`, `tokenCost`, branch payload)
- current runtime snapshot (for validation and pricing)

### 12.2 Normalized Output

Bridge emits a normalized action plan:

```json
{
  "planId": "event_xxx@month-day",
  "actions": [
    { "type": "switch_model", "model": "doubao" },
    { "type": "set_flag", "key": "switched_to_doubao", "value": true }
  ],
  "meta": { "source": "event_id", "mode": "native|legacy_compiled" }
}
```

### 12.3 Precedence Rules

1. If `actions[]` exists and non-empty: execute `actions[]` only.
2. If no `actions[]`: compile legacy fields into actions.
3. During migration, dual-write is allowed in JSON, but runtime source of truth is still rule #1.

### 12.4 Legacy Mapping Table

- `effect` numeric -> `stat_delta`
- `effect` non-numeric -> `set_state`
- `setFlag: "x"` -> `set_flag(key="x", value=true)`
- `flags: {k:v}` (choice branch style) -> multiple `set_flag`
- `tokenCost: N` -> `charge_tokens(amount=N, model="current")`

### 12.5 Rejection / No-op Rules

- invalid model in `switch_model` -> rejected with reason, no crash
- locked model switch -> rejected with reason, no state mutation
- unknown path in `set_state`/`stat_delta` -> rejected with reason
- all rejections are appended to action logs for review

## 13. Parallel Delivery Strategy

To maximize parallel work and reduce merge blocking:

1. Engine and property bridge are split by file ownership.
2. Spec updates are split by file ownership.
3. Event migration is split by event file ownership (`models/general/monthly`).
4. Data migration uses dual-write during transition:
   - add `actions[]`
   - keep legacy `effect/setFlag/tokenCost` until bridge runtime is accepted
   - cleanup pass can remove redundant legacy fields later
