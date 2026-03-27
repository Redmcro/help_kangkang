# 📘 Spec Office Task — Contract Backwrite v3

Task ID: `spec_contract_backwrite_v3`  
Priority: P0  
Dependency: `engine_architecture_audit_v3`, `events_model_domain_audit_v3`, `events_story_domain_audit_v3`

## Objective

Backwrite final contract docs based on audit outcomes from engine and both event offices.

## Assigned Files

- `design/_global/_schema.md`
- `design/_global/attributes.md`
- `design/GAME_DESIGN.md`
- `design/_global/event_runtime_architecture_v3.md`

Only these files may be modified.

## Required Deliverables

1. Consolidate actual runtime contract after audits:
   - action names
   - field names
   - precedence and fallback behavior
2. Add a concise anti-pattern section:
   - text implies switch but no `switch_model`
   - using raw money delta to fake token charging
3. Add one short checklist for event authors before submitting JSON.
4. Keep docs consistent across all assigned files.

## Acceptance Criteria

1. No naming contradiction across assigned docs.
2. Docs match audited runtime behavior.
3. No file edits outside assigned files.

## Mandatory Report

Append one line under `## 🔍 Pending Reports` in `.agents/REPORTS.md`:

`[date] [📘策划司] [spec_contract_backwrite_v3] — [🔍待验收] — [aligned docs with audit findings]`

