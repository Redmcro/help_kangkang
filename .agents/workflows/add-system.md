---
description: Add a new game system (events, attributes, design docs) to the project
---

# Add New System Workflow

This workflow adds a completely new game system to "帮助康康不被AI淘汰". No JS code changes needed.

## Steps

1. **Determine system name and key**
   Choose a system name (e.g., "romance") and key (used for folder and file names).

2. **Create design folder**
   Create `design/{system_key}/` with 3 files:

   // turbo
   - `_ai_spec.md` — System rules, mechanics, event constraints
   - `settings.md` — Human-writable settings (pre-filled with user's input)
   - `events_example.md` — Empty or with initial event examples

   Follow the format of existing systems (e.g., `design/colleagues/`).

3. **Register new attributes and Flags**
   If the new system introduces new attributes or Flags:
   // turbo
   - Add attribute entries to `design/_global/attributes.md` (section 一/二)
   - Add Flag entries to `design/_global/attributes.md` (section 六 Flag registry)
   - Add attribute keys to `design/_global/_schema.md` (section 五)

4. **Create event data file**
   // turbo
   Create `data/events/{system_key}.json` with initial events (or empty `{}`).

5. **Update manifest**
   // turbo
   Add `"{system_key}"` to `data/events/_manifest.json` array.

6. **Update README index**
   // turbo
   Add the new system to the table in `design/README.md`.

7. **Generate initial events**
   Use the `/generate-events` workflow to create events for the new system,
   reading from the design folder that was just created.

## Checklist

After completion, verify:
- [ ] `design/{system_key}/` exists with 3 files
- [ ] New attributes/Flags are registered in `_global/attributes.md`
- [ ] `data/events/{system_key}.json` exists
- [ ] `_manifest.json` includes the new system
- [ ] `README.md` index is updated
- [ ] Game loads without errors
