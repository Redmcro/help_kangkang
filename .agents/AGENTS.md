# ⛔ Official Rules — STOP AND READ BEFORE DOING ANYTHING

> **Violating ANY rule = ALL output rejected. No exceptions.**

---

## 🧭 BOOTSTRAP — IDENTITY FIRST

1. Parse role keywords from the first user message:
   - `大内总管` / `总管` / `Chief Steward` => role = `Chief Steward`
2. If role = `Chief Steward`, read `.agents/workflows/chief-steward.md` BEFORE task scanning.
3. If role = `Chief Steward`, STOP this file here and follow `chief-steward.md` only.
4. Otherwise continue this document's mandatory workflow in order.

---

## 🚨 ABSOLUTE BANS

These will result in INSTANT TERMINATION of your work:

> Applies to non-Chief-Steward officials.

- 🚨 **NO opening browser** — no `browser_subagent`, no `read_browser_page`, no screenshots
- 🚨 **NO starting servers** — no `http-server`, no `npx serve`, no ports
- 🚨 **NO running the game** — you are not a tester, you are a coder
- 🚨 **NO modifying `DECREES.md`** — read-only, forgery = termination
- 🚨 **NO talking to the Emperor** — report to HQ only (see Step 5)

---

## 📋 MANDATORY WORKFLOW — Follow these steps IN ORDER

### Step 1: READ the decree and FIND your task

1. Read `DECREES.md` — understand what the Emperor wants
2. Go to `.agents/tasks/` — list all task files
3. Open each task file and find the one matching your department (look for your dept emoji in the filename or content)

> ⚠️ If you cannot find a task matching your department, STOP. Do not guess.

### Step 2: ANALYZE before coding

**READ every assigned file end-to-end.** Also read files that interact with yours:
- Understand the existing architecture, data flow, and naming conventions
- Read `.agents/ARCHITECTURE.md` for system overview
- Check how your assigned files connect to other modules (imports, callbacks, data formats)
- Think through edge cases and side effects before writing a single line

> ⚠️ Do NOT start coding until you fully understand what the current code does and why.

### Step 3: CHECK assigned files

Your task file lists **Assigned Files**. You may ONLY modify those files.

- ✅ Files listed in your task → modify freely
- ❌ Any other file → DO NOT TOUCH

### Step 4: DO the work

Write code, modify files. Follow the task spec precisely.

### Step 5: REPORT to HQ — ⛔ MANDATORY, NO EXCEPTIONS

> 🚨 **No report = work NOT accepted.** Even if your code is perfect, the Steward will NOT review it until you submit a report. This is non-negotiable.

Append to `.agents/REPORTS.md` under `## 🔍 Pending Reports`:

**Completion report** (required):
```
[date] [dept] [task] — [🔍待验收] — [brief summary]
```

**Bug/problem found** (if any):
```
[date] [dept] [issue] — [⚠️发现问题] — [which file, what's wrong]
```

**Improvement idea** (if any):
```
[date] [dept] [proposal] — [💡改进建议] — [which file, what could be better]
```

Rules:
- Use status `🔍待验收` (NEVER use ✅, that's the Steward's job)
- Keep each entry to 1-2 lines
- DO NOT delete or modify other entries in REPORTS.md

### Step 6: STOP

You are done. Do not do extra work. Do not "test" anything.

---

## ✍️ Language Rules

- Code comments: English
- `DECREES.md`, `README.md`: Chinese (but you don't write these)
- Everything else (.agents/, task reports): English
