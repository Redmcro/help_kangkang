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

`actions` is the first-class payload for both event outcomes and choice outcomes.

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
          { "type": "switch_model", "modelId": "doubao" },
          { "type": "set_flag", "flag": "switched_to_doubao", "value": true }
        ],
        "result": "Switched to Doubao for cost control."
      }
    ]
  }
}
```

Current runtime-supported action set:

- `stat_delta`
- `set_state`
- `set_flag`
- `switch_model`
- `unlock_model`
- `charge_tokens`

### 4.1 Canonical Fields (and Runtime Alias Compatibility)

| Action | Canonical fields (new authoring) | Runtime-compatible aliases |
|:---|:---|:---|
| `stat_delta` | `delta` | `effect` / `values` / `stats` / `key+value` |
| `set_state` | `state` | `set` / `patch` / `values` / `key+value` |
| `set_flag` | `flag`, `value` | `key`, `value` / `flags` / `map` |
| `switch_model` | `modelId` | `model` / `id` / `target` |
| `unlock_model` | `modelId` | `model` / `id` / `target` |
| `charge_tokens` | `amount`, `reason` | `tokens` / `tokenCost` |

### 4.2 Precedence and Fallback Rules (Authoritative)

1. If a node has an `actions` property (including `[]`), runtime executes native actions only.
2. If a node has no `actions` property, runtime compiles legacy fields (`effect/setFlag/flags/tokenCost`) into actions.
3. Non-choice `branch`: matched branch can fall back to parent native `actions` when branch has no own `actions`.
4. `choice` branch/result: parent native `actions` are not inherited automatically; each branch/result must declare its own native actions.
5. Legacy field lookup is source-first, then fallback-node.

### 4.3 Audit Anti-Patterns (Must Be Rejected)

- Text implies model switching, but action payload has no `switch_model`.
- Model-cost intent is encoded as raw `effect.money` delta instead of `charge_tokens`.

### 4.4 Author Checklist (Before JSON Submission)

1. Model switch/unlock intents map to `switch_model` / `unlock_model`.
2. Model charging intent maps to `charge_tokens` (not raw money delta).
3. If `actions` exists, verify ignoring legacy fields is intentional.
4. For `choice` branches, verify each branch/result has explicit native action payload when needed.
5. New flags are registered in global attribute docs.

## 5. Action Semantics

### 5.1 `switch_model`

- Canonical field: `modelId` (aliases: `model/id/target`).
- Validates model exists and is unlocked before mutation.
- Mutates `current_model` immediately in the same tick.
- Unknown/locked targets are rejected as safe no-op (no crash).

### 5.2 `unlock_model`

- Canonical field: `modelId` (aliases: `model/id/target`).
- Validates model id exists before unlock.
- Unlock only; current runtime does not support `equip` auto-switch semantics.
- Unknown ids are rejected as safe no-op.

### 5.3 `charge_tokens`

- Canonical field: `amount` (must be positive number). `reason` is optional metadata.
- Aliases: `tokens` / `tokenCost`.
- Settlement formula: `moneyCost = round(amount * currentModel.tokenPrice)`.
- Uses active model at execution time; no active model means safe no-op.

### 5.4 `stat_delta` and `set_state`

- `stat_delta` for additive change (supports ranges).
- `set_state` for exact assignment (`state` canonical object payload).
- For `current_model` assignment via `set_state`, unknown/locked models are rejected.
- Invalid payload shapes are safe no-op and logged.

### 5.5 `set_flag`

- Canonical fields: `flag`, `value`.
- Aliases: `key`, `value` and map mode (`flags` / `map`).
- Missing `value` defaults to `true`.

## 6. Runtime Flow (Authoritative)

For each event/choice resolution:

1. Snapshot current state.
2. Build candidate pool with month/include/exclude filters.
3. Pick event by priority policy (`choice` chance gate -> `special` chance gate -> non-filler -> weighted fallback).
4. Resolve branch/choice outcome.
5. Build action plan from precedence rules (native first, otherwise legacy compile).
6. Execute actions in order with no-throw/no-crash handling for invalid payloads.
7. Apply runtime derived adjustments (for example charm-based relation adjustment for `shaoye_rel/yimin_rel` deltas).
8. Append normalized deltas/token usage into day report and UI logs.
9. Persist updated state and continue monthly/day loop.

## 7. Invariants

Must hold after every execution:

- executor never crashes on invalid action payload; invalid actions are safe no-op.
- supported action types are fixed to current runtime list (see section 4).
- `current_model` transition is allowed only to known and unlocked models.
- `charge_tokens` always settles by active model price path (no semantic bypass via raw money delta).
- legacy-compiled actions preserve behavior when native `actions` is absent.
- `choice` branch outcomes do not inherit parent native actions implicitly.

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
2. If `switch_model` and `charge_tokens` are in one action plan, charging uses the switched model price in the same tick.
3. Unknown/locked model in `switch_model` or `set_state.current_model` is rejected with no crash and no state mutation.
4. `actions: []` suppresses legacy fallback intentionally (no implicit `effect/setFlag/tokenCost` execution).
5. Non-choice branch can use parent native actions fallback; `choice` branch cannot.
6. Legacy events without `actions` still run via adapter with unchanged intent outcome.

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
    { "type": "switch_model", "modelId": "doubao" },
    { "type": "set_flag", "flag": "switched_to_doubao", "value": true }
  ],
  "meta": { "source": "event_id", "mode": "native|legacy_compiled" }
}
```

### 12.3 Precedence Rules

1. If a node has `actions` property (including empty array), execute native `actions` only.
2. If a node has no `actions` property, compile legacy fields into actions.
3. For non-choice `branch`, native action lookup can fallback to parent event node.
4. For `choice` branch/result, parent native actions are not fallback source.
5. During migration, dual-write is allowed in JSON, but runtime source of truth stays with the above precedence.

### 12.4 Legacy Mapping Table

- `effect` numeric -> `stat_delta`
- `effect` non-numeric -> `set_state(state={...})`
- `setFlag: "x"` -> `set_flag(key="x", value=true)` (runtime-compatible alias)
- `flags: {k:v}` -> multiple `set_flag(key=k, value=!!v)`
- `tokenCost: N` -> `charge_tokens(amount=N)`

### 12.5 Rejection / No-op Rules

- invalid model in `switch_model` -> rejected with reason, no crash
- locked model switch -> rejected with reason, no state mutation
- invalid payload shape/type in any action -> safe no-op with runtime warning log
- non-positive `charge_tokens.amount` or no active model -> safe no-op
- all rejections/no-ops are appended to action logs for review

## 13. Parallel Delivery Strategy

To maximize parallel work and reduce merge blocking:

1. Engine and property bridge are split by file ownership.
2. Spec updates are split by file ownership.
3. Event migration is split by event file ownership (`models/general/monthly`).
4. Data migration uses dual-write during transition:
   - add `actions[]`
   - keep legacy `effect/setFlag/tokenCost` until bridge runtime is accepted
   - cleanup pass can remove redundant legacy fields later
