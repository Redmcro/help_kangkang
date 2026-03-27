# ⚙️ Engine Office Task — Architecture Audit v3

Task ID: `engine_architecture_audit_v3`  
Priority: P0  
Dependency: none

## Objective

Audit and fix runtime architecture mismatches between event intent and actual state mutation.

## Assigned Files

- `js/engine.js`
- `js/events.js`
- `js/property.js`

Only these files may be modified.

## Mandatory Self-Audit (do first)

1. Trace full flow for normal event and choice event:
   - pool -> pick -> execute -> action plan -> state mutation -> day report
2. Verify precedence and compatibility:
   - native `actions[]` path
   - legacy `effect/setFlag/flags/tokenCost` adapter path
3. Check model-specific invariants:
   - model switch updates `current_model` immediately
   - token charge uses active model pricing after switch
   - unlock/switch validation blocks invalid model transitions
4. Record any mismatch found during audit in your report summary.

## Required Deliverables

1. Fix architecture issues discovered in self-audit.
2. Keep backward compatibility for legacy events.
3. Ensure branch/choice results cannot accidentally apply wrong parent semantics.
4. Keep runtime stable on invalid action payloads (no crash; safe rejection/no-op).

## Acceptance Criteria

1. Model-intent action and final state are consistent in same tick.
2. No regression to legacy event behavior.
3. No file edits outside assigned files.

## Mandatory Report

Append one line under `## 🔍 Pending Reports` in `.agents/REPORTS.md`:

`[date] [⚙️引擎司] [engine_architecture_audit_v3] — [🔍待验收] — [scanned X paths, fixed Y mismatches, risks Z]`

