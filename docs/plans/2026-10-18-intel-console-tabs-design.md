# INTEL console: tabbed map as the primary intelligence surface

Approved 2026-10-18. Supersedes the single-section layout the holomap had when it moved off
the hub onto `intel.html`. Inputs: `innovate` runs on Qwen 3.8 max (page/IA lens) and
gpt-6-sol high (what-the-map-shows lens), both re-read `intel.html`, `archive.js`,
`campaign.js`, `style.css`, `theme.css`, `check-all.cjs`.

## Why

At 1440x900 the map was 664px tall (svg is a fixed 2.08:1 viewBox) with 504px of chrome above
its first pixel, so the reading pane, the payoff for every tap, was never on screen with the
map. The hero alone cost more vertical than the theater frame's useful height on a laptop.

## Decided (each `1`, the recommended option)

- **D1 Ledger lives on RELATIONS only.** MAP is map, key and reading pane. This is what makes
  the fold budget work, and it gives RELATIONS a real job.
- **D2 Zone colour appears as coloured standing pills** on RELATIONS
  (`pill(x.standing, x.zone.c)`), no map change, no extra key row.
- **D3 No phone site index.** Pinch already works (20px targets unzoomed, 52px at the `Z=2.6`
  zoom). Revisit only if the crew reports mis-taps on a real phone.
- **D4 The pane auto-selects the op's site** on arrival, so the page opens as intelligence
  rather than as a prompt.
- **D5 Selection is in the URL** as `#map/<locId>` via `history.replaceState` inside
  `try/catch` (needed or local `file://` breaks).

## Layout

Tab shell, map default. Hero deleted from `intel.html`; its one useful sentence becomes the
right-aligned `.tab-hint` in the sticky pagebar. Chrome drops 504px to ~174px (topline 32 +
compact brandrow 64 + pagebar 44 + map head strip 34), plus ~44px for the situation readout.

| Viewport | Column | Map h | chrome+map+key |
|---|---|---|---|
| 1440x900 | 910 (split) | 437 | 651 |
| 1280x800 | 804 (split) | 386 | 596 |
| 1024x768 iPad land | 968 (stacked) | 465 | 675 |
| 390x844 phone | 358 (stacked) | 172 | 386 |

Reading pane moves **beside** the map (`.columns.holo-split`, primary 2fr / aside 400px) and
collapses to a single column under **1100px**, deliberately not 900px, so 1024x768 landscape
keeps a big map and 54px hit targets.

## Tabs

Hash is the state, matching the house convention (`index.html#op-NNN`, `pilot.html#<id>`):
`intel.html`, `#map`, `#relations`, `#personnel`, plus `#map/<locId>`.

1. Tabs are `<a href="#...">` in `role="tablist"`; glue maintains `aria-selected` and `hidden`.
2. Off panels are **hidden, never re-rendered**: level, camera transform, `.sel` marks, pane
   HTML and scroll survive a tab switch with zero state code. Re-entering MAP must not call
   `fitLevel` (that would reset the camera).
3. Site selection uses `history.replaceState` (no history spam, shareable); `hashchange`
   handles back/forward; `render()` stays idempotent.
4. Cross-tab chips (`[data-loc]`/`[data-person]`) go through a **capture-phase** listener that
   reveals MAP before `archive.js`'s bubble handler renders and scrolls the pane.
5. Load order: build map, `fitLevel()`, parse hash, `setTab`, then select if the hash has one,
   else `D4`'s op site. Unknown tab falls back to `map`; unknown id falls through to
   `SELECT A TARGET`, no crash path.
6. `.pagebar` is sticky, and `.tabpanel` gets `scroll-margin-top`.

## Situation overlay (the map's own content)

Readout strip above the map, derived from the op record, never from prose:

- `OP 001 · SOLSTICE RAIN` / `PLANNED · UNBRIEFED` / `AREA: NOV ELYSIA` / `UNBRIEFED` outcome
  line from `op.outcome`.
- Missing count comes from `personnel` rows with `status === "MISSING"` and
  `lastKnown === op.loc`.

Badges on existing markers, sparse and short, and **none under 620px** (phone keeps the
readout; prose stays in the reading pane):

| Badge | Grounded in |
|---|---|
| `OP AREA · 2 MISSING` | `op.loc` + the missing-personnel count |
| `PLANNED INSERTION` | `op.sites.insertion` |
| `FRIENDLY RENDEZVOUS · NOT VISITED` | `op.sites.rendezvous` + `loc.visited === false` |
| `EXTRACTION DESTINATION` | `op.sites.extraction` |
| `HOSTILE` | location's faction `standing === "HOSTILE"` |
| `RECORDED MUSTER` | `loc.name === meta.station` |

Wording must stay `planned` / `last known` / `recorded`; never imply live tracking. The
existing green "current op" marker on a planned, unbriefed operation needs the same treatment.

**One data addition:** `op.sites = {insertion, rendezvous, extraction}`, location ids. The two
round-trip facts (insertion at Kingfisher, rendezvous at FOB Saber) exist today only as OPORD
prose; regexing that prose would be brittle and would read as inventing precision. `check-all`
asserts each id resolves and sits in the same frame as `op.loc`.

## Files

- `intel.html`: delete hero; add pagebar (h1 + tablist + hint); three `role="tabpanel"`
  sections; map head strip with `SECTOR|THEATER` buttons (`[data-level]` is already delegated);
  `.columns.holo-split` around key + pane; `.holo-back` simplifies to camera-only; tab/hash
  glue, capture listener, load-order selection.
- `style.css`: pagebar/tabs/holo-head/holo-split/badge rules, phone single-row key, print
  rules (`.pagebar{display:none}`, `.tabpanel[hidden]{display:block!important}`). Append after
  the existing holo block so source order wins the equal-specificity `th` width override.
- `archive.js`: split `personFile(id)` out of `showPerson` (pure, like `unitFile`);
  `personnelList()`; `factionTable()` as a `threads-table` with zone-coloured standing pills;
  `situation()` returning readout + badge map; badge markup inside `holomap(level)`'s world
  string. Expose the new pure functions on `UI`.
- `campaign.js`: add `op.sites`.
- `check-all.cjs`: new assertions (below).

## Invariants that must stay green

- `id="holomap"` and `id="faction-list"` still in `intel.html`; `index.html` still without them.
- `href="intel.html">INTEL` literal in all seven navs; never add a tab hash to a nav link.
- `id="record-detail"` stays in `intel.html`'s inline template.
- `intel.html` source must not contain `.holo-chips` or `data-mech-class`.
- `UI.holomap(level)` keeps returning `{world,key}`; THEATER key keeps `SYSTEM VIEW`, SYSTEM
  key keeps `k-orbit`; the level buttons are not key chips.
- `UI.unitFile` keeps `ENTER THEATER`, `class="p-face"`, WITHIN vs IN ORBIT rows;
  `UI.pinchIntent` thresholds untouched.
- `mount("intel.html")` **already throws** under `tools/render.cjs` (the stub DOM has no
  `.style` and its `querySelector` returns null), so the console's inline glue stays out of the
  render harness and the checks assert source text plus the pure functions instead. Do not
  "fix" that with null guards.

## New assertions

`role="tablist"` plus `tab-map`/`tab-relations`/`tab-personnel` panels and a `.pagebar` in
`intel.html`; the hero is gone; `op.sites` ids resolve into `op.loc`'s frame; `UI.personFile`
returns a pure string carrying `PERSONNEL RECORD` and the portrait; `UI.personnelList()` names
both missing principals and links `pilots.html`; `UI.factionTable()` names each faction's held
sites; `UI.situation()` names the op, its missing count and each badge site, and uses only
planned/last-known/recorded wording.

## Risks

- Pixel budgets are hand-computed from CSS, not browser-measured: re-measure 1024x768 and
  390x844 first and correct the 1100px breakpoint if the render disagrees.
- The capture-phase chip listener fires on every chip click, including in-pane
  `[data-mech]`/`[data-pilot]` chips where forcing `tab=map` is a no-op today, it needs a
  `closest(".tabpanel")` guard if another tab ever grows its own pane.
- `.holo-split .operation-table th{width:120px}` depends on source order beating
  `.holo-detail .operation-table th{width:150px}` at equal specificity.
- `history.replaceState` throws on `file://`: must stay inside `try/catch`.