# 📚 Event Office B Task — Story Domain Full Audit v3

Task ID: `events_story_domain_audit_v3`  
Priority: P0  
Dependency: none

## Objective

Audit non-core event files for hidden model/economy intent mismatches and action contract violations.

## Assigned Files

- `data/events/choice.json`
- `data/events/random.json`
- `data/events/colleagues.json`
- `data/events/girlfriend.json`
- `data/events/life_expense.json`

Only these files may be modified.

## Mandatory Self-Audit (do first)

1. Run keyword scan for model/cost intent leakage:
   - `模型`, `切换`, `解锁`, `Token`, `预算`, `余额`, `省钱`, `doubao`, `gpt`, `opus`, `deepseek`
2. Run structure scan for contract issues:
   - unsupported action type names
   - incorrect action payload shape
   - intent text contradicting current action behavior

## Required Deliverables

1. Fix any model/economy intent mismatch discovered in assigned files.
2. Align action payloads with runtime contract where actions exist.
3. Keep events story-first and avoid unnecessary narrative rewrites.
4. Keep compatibility for legacy payloads where action migration is not needed.

## Acceptance Criteria

1. No action-contract violations remain in assigned files.
2. JSON stays valid.
3. No file edits outside assigned files.

## Mandatory Report

Append one line under `## 🔍 Pending Reports` in `.agents/REPORTS.md`:

`[date] [📚事件司乙] [events_story_domain_audit_v3] — [🔍待验收] — [scanned X events, fixed Y mismatches, risks Z]`

