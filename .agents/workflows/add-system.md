---
description: Add a new game system (events, attributes, design docs) to the project
---

# Add New System

## Steps

1. **Choose system key** (e.g. `romance`)

2. **Create design folder** `design/{key}/`
   // turbo
   - `_ai_spec.md` — rules & constraints
   - `settings.md` — ideas & config
   - `events_example.md` — JSON examples

3. **Register attributes/Flags** (if new ones needed)
   // turbo
   - `design/_global/attributes.md` — add entries + Flag registry
   - `design/_global/_schema.md` — add to section 五

4. **Create event file**
   // turbo
   `data/events/{key}.json` (start with `{}`)

5. **Update manifest**
   // turbo
   Add `"{key}"` to `data/events/_manifest.json`

6. **Update README**
   // turbo
   Add to `design/README.md` table

7. **Generate events** via `/generate-events`

## Checklist

- [ ] `design/{key}/` has 3 files
- [ ] Attributes/Flags registered
- [ ] `data/events/{key}.json` exists
- [ ] `_manifest.json` updated
- [ ] Game loads without errors
