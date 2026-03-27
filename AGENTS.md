# Repository Bootstrap Rules (Read First)

1. Parse role keywords from the first user message:
   - `大内总管` / `总管` / `Chief Steward` => role = `Chief Steward`
2. If role = `Chief Steward`, read `.agents/workflows/chief-steward.md` before any other workflow or task document.
3. Then read `.agents/AGENTS.md` and follow it strictly.

