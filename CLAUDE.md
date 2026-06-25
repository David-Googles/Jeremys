# CLAUDE.md — Jeremys Dashboard

> This file is loaded by Claude Code at the start of every session in this
> repo. It's also plain markdown that any LLM (Claude, Ollama, Llama, etc.)
> can read on disk, so it serves as a portable project brain that survives
> model swaps, computer changes, or fresh installs.

---

## 1. Project at a glance

- **Repo:** https://github.com/David-Googles/Jeremys
- **Owner:** David-Googles (`Ukownloser@gmail.com`)
- **Stack:** Static HTML/CSS/JS, no build step. Hosted on Vercel (auto-deploys on push to `main`).
- **Local path:** `C:\Users\lenovo\Documents\ZZZDashboard\Jeremys`

### Files
| File | Role |
|---|---|
| `index.html` | Bento grid hub (landing page with links to other trackers). |
| `health.html` | Daily Stack (supplements checklist) + embeds `po-water.html` in an iframe. |
| `gym.html` | Gym/workout tracker with photo log. Has its own bottom tab bar. |
| `main.html` | Main "Goals" dashboard (daily checkboxes, ticker, calendar/history/stats). Title: "majds dashboard". |
| `finance.html` | Net worth, subs, wishlist, incoming orders. Has its own internal 4-tab nav. |
| `po-water.html` | Water tracker. Standalone or embedded in `health.html` iframe. |
| `topbar.js` | Self-injects compact topbar (water + 📊 finance) and Instagram-style bottombar (Main/Health/Fitness). Skips chrome on `finance.html` and inside iframes. |
| `sync.js` | Shared cloud-sync helper. Pages call `initCloudSync({appKey, syncedKeys, syncedPrefixes, onApplied})`. |
| `README.md`, `BUILD_DASHBOARD.md` | Project docs. |

---

## 2. Critical configuration (do not lose)

### Supabase (cloud sync)
- **Project URL:** `https://pivfxbngfjahzmjtbieg.supabase.co`
- **Publishable key:** `sb_publishable_oQeFe89LT5P1ccRj-E2SCg_jFSzPega`
- **Table:** `public.app_state` (rows keyed by `key` string, `data` jsonb, `updated_at` timestamptz)
- **RLS:** anon select/insert/update enabled
- **Used in:** `sync.js` (lines ~11-12), `topbar.js` (lines ~17-18), `gym.html` (lines ~3281-3282)
- **App keys per page:** `goals` (main.html), `health` (health.html + po-water), `finance`, `gym` (gym.html has its own sync code)

### Git identity (set locally on this repo, not globally)
```bash
git config user.name "David-Googles"
git config user.email "Ukownloser@gmail.com"
```

### iOS safe-area
- `viewport-fit=cover` is in all 5 HTML files
- `topbar.js` uses `padding: max(10px, env(safe-area-inset-top))` on `.topbar`
- `.bottombar` has `padding: 6px 0 calc(6px + env(safe-area-inset-bottom))`
- `body.has-bottombar` adds `padding-bottom: calc(72px + env(safe-area-inset-bottom))`
- `health.html` line ~74 already has its own `padding-top: max(56px, env(safe-area-inset-top, 56px))`

---

## 3. Recent commit history (most recent first)

```
6cdf72f Wire real Supabase URL and publishable key into sync.js and topbar.js
63c26fd Restructure nav: compact topbar (water + finance) and Instagram-style bottom tabs
4e014c6 Fix iOS safe-area: don't let Dynamic Island cover top bar
ef0e9b9 Add shared cloud-sync helper and wire it into goals/stack/water/finance
78d841a Wire up Supabase project URL and publishable key (gym + topbar)
a464510 Rename dashboard title to 'majds dashboard'
1bee3ce Wire shared topbar nav into all pages with links to Gym and Finance
4711ce3 Add Deploy with Vercel button for one-click deployment
66b45b7 Initial commit: dashboard + 4 trackers + shared topbar
```

---

## 4. Architectural decisions to preserve

1. **No build step** — pure HTML/CSS/JS. Don't introduce bundlers, npm, or framework compile steps without asking.
2. **`sync.js` is the single source of truth for cloud sync** — new pages should call `initCloudSync()`, not write their own Supabase code. (Exception: `gym.html` predates the helper and has its own inline sync; leave it alone unless asked.)
3. **Water sync is shared** — `appKey: 'health'` is used by both `health.html` (via the `po_water_v1` key in its `syncedKeys`) and standalone `po-water.html` (via the same key in its `syncedKeys`). The `health.html` iframe-embedded case uses an `isEmbedded()` guard in `sync.js`'s consumer to avoid double-init.
4. **Topbar/bottombar skip rules** — topbar.js hides chrome on `finance.html` and inside iframes. If you add a new page that shouldn't get the bottombar, add it to `shouldShowChrome()`.
5. **iOS notch is handled per-element** — each page's own sticky/fixed top is responsible for its own safe-area padding. Don't add a global `body { padding-top: ... }` blanket.
6. **Finance page is intentionally chrome-free** — no topbar, no bottombar. It has its own 4-tab nav and back button.
7. **Placeholders vs real values** — `PASTE-YOUR-...` placeholders in `sync.js` and `topbar.js` are the early-return sentinel for "sync disabled." Replacing them with the real Supabase URL/key is what enables sync. If sync ever silently stops working, check these first.

---

## 5. User preferences & communication style

- Direct, short messages, lowercase ("heyy", "push", "btw"). Reply in kind — concise, friendly, no preamble.
- Prefers "make the change AND push" as one atomic ask, not two steps.
- Will often ask follow-up questions in a different style ("btw" interrupt, "continue where you left off", etc.) — treat them as continuations of the same task.
- Doesn't want long explanations unless something is genuinely surprising or risky (security, data loss, layout breakage).

---

## 6. Common gotchas

- **Cache busting:** Vercel redeploys on push, but browsers cache `topbar.js`/`sync.js` aggressively. Always tell the user to hard-refresh (Cmd/Ctrl+Shift+R) after a sync-related change.
- **Sync placeholders:** If `PASTE-YOUR-SUPABASE-...` is still in `sync.js` or `topbar.js`, cloud sync is silently a no-op. The helper bails at the prefix check.
- **`<script>` order in HTML:** All sync-wired pages load Supabase CDN → `sync.js` → `topbar.js` → page-specific script, all in that order in `<head>`. The `initCloudSync` call must be inside `DOMContentLoaded` (after `sync.js` is parsed).
- **`sync.js` only syncs keys listed in `syncedKeys` or matching `syncedPrefixes`.** If a new localStorage key is added to a page and it doesn't sync, check the `initCloudSync` call for that page.
- **`isEmbedded()` in topbar.js** uses `window.self !== window.top` with a try/catch (cross-origin frames throw). Don't simplify it.
- **Gym page is the odd one out** — it has its own inline Supabase sync block at lines ~3267-3434. Don't refactor it into `sync.js` without asking.
- **`po-water.html` is loaded both standalone and in an iframe.** Anything that's heavy (CDN libs, large assets) will load twice on health.html — use `loading="lazy"` on the iframe (already done) and avoid top-level side effects that can't be re-run safely.

---

## 7. Backup & recovery

If the Claude Code memory system gets wiped (model swap, fresh install, etc.), restore state by reading:

1. **`CLAUDE.md`** (this file) — full project context
2. **`MEMORY.md`** in the project memory dir — index of one-fact-per-file memory entries
3. **The individual memory files** referenced from `MEMORY.md`

The Claude Code memory dir for this project is:
```
C:\Users\lenovo\.claude\projects\C--Users-lenovo-Documents-ZZZDashboard-Jeremys\memory\
```

A JSON dump of the full memory dir is committed at `memory-backup.json` in the repo root for portability.

---

## 8. Quick command reference

```bash
# Status
git status
git log --oneline -10

# Push workflow
git add <files>
git commit -m "Short message"
git push origin main
# (Vercel auto-deploys)

# Check sync is wired (should NOT match anything)
grep -r "PASTE-YOUR-SUPABASE" .

# See what sync.js actually loaded
# Open browser DevTools → Network → reload → click sync.js
```
Tiles (in order):
  ·01 🏠 Main      — "Goals & daily plan"        → main.html      (big,  accent #6BE3A4)
  ·02 💪 Fitness   — "Workouts, splits, sessions"→ gym.html       (wide, accent #7DD3FC)
  ·03 💊 Health    — "Supplements & vitals"      → health.html    (small,accent #A7F3D0)
  ·04 💧 Water     — "Hydration"                 → po-water.html  (small,accent #60A5FA)
  ·05 📊 Finance   — "Net worth & spending"      → finance.html   (wide, accent #F2C063)

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
