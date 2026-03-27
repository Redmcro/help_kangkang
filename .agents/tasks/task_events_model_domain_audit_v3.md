# 📚 Event Office A Task — Model Domain Full Audit v3

Task ID: `events_model_domain_audit_v3`  
Priority: P0  
Dependency: none

## Objective

Audit model/economy related events end-to-end and fix intent-action mismatches.

## Assigned Files

- `data/events/models.json`
- `data/events/general.json`
- `data/events/monthly.json`
- `data/events/daily.json`

Only these files may be modified.

## Mandatory Self-Audit (do first)

Scan all assigned files with two methods:

1. Keyword scan for intent text:
   - Chinese: `切换`, `换成`, `改用`, `继续用`, `解锁`, `预算`, `省钱`, `余额`, `Token`
   - English/model ids: `switch`, `unlock`, `current_model`, `doubao`, `gpt54`, `opus46`, `deepseek`, `cheapgpt`, `fakeopus`
2. Structure scan:
   - entries mentioning model strategy but missing `actions[]`
   - entries using money delta to emulate switch behavior
   - action payload fields inconsistent with runtime contract

## Required Deliverables

1. For model switch intent, ensure semantic action exists (`switch_model`).
2. For unlock intent, ensure semantic action exists (`unlock_model`).
3. For token-cost intent, use semantic action (`charge_tokens`) instead of fake flat-money where applicable.
4. Keep dual-write compatibility during transition where needed.
5. Preserve narrative and branch logic unless correction is necessary for semantic consistency.

## Acceptance Criteria

1. No obvious model-intent mismatch remains in assigned files.
2. JSON stays valid.
3. No file edits outside assigned files.

## Mandatory Report

Append one line under `## 🔍 Pending Reports` in `.agents/REPORTS.md`:

`[date] [📚事件司甲] [events_model_domain_audit_v3] — [🔍待验收] — [scanned X events, fixed Y mismatches, risks Z]`

