# 📋 HQ Reports

> Officials report here after completing tasks. Chief Steward reviews.
> **Format: `[date] [dept] [task] — [status] — [what changed]`**
> Report issues here too. Never go directly to the emperor.

---

## Reports

[2026-03-26] 📚 Hanlin · Token→Money migration — ✅ Done — 7 files, 50 `"token"` effect/include → `"money"` (×3). grep verified 0 residual. JSON valid.

[2026-03-26] 📚 Hanlin · Update GAME_DESIGN.md — ✅ Done — Purged all stale Token references: §4.1 header→"任务消耗", §4.2 Opus/DeepSeek descriptions, Flag registry (`yimin_token_discount`→`yimin_cost_discount`), §5 monthly flow, §7 expense table, §11 achievement "Token巨鲸"→"AI烧钱王". grep verified 0 token references remain. §2.2b girlfriend attrs + §2.4 `living_cost` already present.

[2026-03-26] 📚 Hanlin · Design Token Cleanup — ✅ Done (rework) — Fix 1: `attributes.md` salary 10000→15000, living_cost 3000→5000 synced w/ `property.js`. Fix 2: `buff_token` confirmed as code ID in `buffs.json` — no change needed. Fix 3: this report.

[2026-03-26] 🎨 Military+Chancery · UI Overhaul — ✅ Done — 4 items: (1) Gallery removed, (2) Token UI removed + model costs shown, (3) GF UI fixed: added `gfRelRow` ID, renamed `barGfRel`→`barGf`/`valGfRel`→`valGf`, added `has_girlfriend` visibility toggle, (4) Mobile optimization complete. Stale Gallery comment cleaned.

[2026-03-26] 🎨 Military+Chancery · UI Rework (2 items) — ✅ Verified by Chief Steward — Both items confirmed in source: (1) GF UI: `gfRelRow` index.html:106, `gf_rel`+`has_girlfriend` toggle app.js:93-95, `stat-bar-gf` style.css:191. (2) Model cost: `AI_MODELS` imported app.js:6, `tokenPrice`/cost range in `renderModelSwitch()` app.js:376-386. All 5 acceptance checks pass (Select-String).

[2026-03-26] 🎨 Military · HTML/CSS Cleanup (Side Gig + Audio) — 🔍待验收 — Deleted: (1) `sideGigBtn` button line 145, (2) `sideGigOverlay` overlay lines 218-229, (3) `audio-ctrl` div lines 153-156 from `index.html`. (4) AUDIO CONTROLS CSS block (`.audio-ctrl`, `.audio-btn`, `.audio-btn:hover`, `.audio-btn.muted`) lines 487-495, (5) SIDE GIG CSS block (`.overlay-content-sm`, `.gig-panel`, `.gig-desc`, `.gig-stats`, `.gig-actions`, `.gig-btn`, `.gig-cooldown`) lines 621-645 from `css/style.css`. Verification: `sideGig` in index.html → 0 hits, `audio` in index.html → 0 hits, `audio-ctrl|audio-btn|gig-panel` in style.css → 0 hits.

[2026-03-26] 🖼️ Chancery · JS Logic Fixes (5 items) — 🔍待验收 — (1) Model switch resumes game: closes overlay + `scheduleNext(processWorkDay)`. (2) Side gig JS deleted: `renderSideGig`, `rng`, `gigPanel`, `sideGigBtn`, `gigUsedThisMonth`, `currentGigMonth`. (3) Audio JS deleted: `AUDIO_KEY`, `DEFAULT_AUDIO_PREFS`, `loadAudioPrefs`, `saveAudioPrefs` from `save.js`. (4) Token cost removed from model cards: `minCost`/`maxCost`/`tokenPrice` display gone, kept quality+bug%. (5) Editor tab shows model name via `editorTabName`. Grep verification: 3/3 all 0 hits.

---

## 📜 Completed Decrees

- ~~📚 token换money~~ ✅
- ~~📚 token事件返工~~ ✅
- ~~📚 写女朋友事件~~ ✅
- ~~📚 生活开销事件+system返工~~ ✅
- ~~📚 更新设计文档~~ ✅
- ~~📚 Token大扫除返工（3处）~~ ✅
- ~~🎨 兵部+门下省 · UI大改~~ ✅
- ~~🎨 兵部+门下省 · UI返工（女友UI+模型费用显示）~~ ✅
