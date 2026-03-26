# 🎨 Military: HTML/CSS Cleanup (Parallel Task A)

> ⚡ This task runs IN PARALLEL with the Chancery JS task. Zero file overlap.

## Task
Delete side gig and audio elements from HTML and CSS.

## Assigned Files
- `index.html`
- `css/style.css`

## Required Reading
- `.agents/AGENTS.md`

---

## 1. Delete Side Gig button (index.html ~line 145)

Delete:
```html
<button class="action-btn" id="sideGigBtn" title="接私活">💼 <span class="action-text">接私活</span></button>
```

## 2. Delete Side Gig overlay (index.html ~lines 218-229)

Delete entire block:
```html
<!-- Side Gig -->
<div class="overlay" id="sideGigOverlay">...</div>
```

## 3. Delete Audio buttons (index.html ~lines 153-156)

Delete entire block:
```html
<div class="audio-ctrl">
  <button class="audio-btn" id="audioToggle" title="音效开关">🔊</button>
  <button class="audio-btn" id="bgmToggle" title="BGM开关">🎵</button>
</div>
```

## 4. Delete Audio CSS (css/style.css ~lines 487-495)

Delete:
```css
/* ===== AUDIO CONTROLS ===== */
.audio-ctrl{...}
.audio-btn{...}
.audio-btn:hover{...}
.audio-btn.muted{...}
```

## 5. Delete Side Gig CSS (if any .gig-* styles exist)

Search for `.gig-panel`, `.gig-` in style.css and delete.

---

## Acceptance
- `grep -i "sideGig" index.html` → 0 hits
- `grep -i "audio" index.html` → 0 hits
- `grep -i "audio-ctrl\|audio-btn\|gig-panel" css/style.css` → 0 hits
- File report in `.agents/REPORTS.md`, mark `🔍待验收`
- 🚨 **Do NOT modify `js/` files** — that's the other task
- 🚨 **Do NOT open any ports or browsers**
- 🚨 **Do NOT modify `DECREES.md`**
