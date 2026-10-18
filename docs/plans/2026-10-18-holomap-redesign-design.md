---
ticket: "#25"
title: "Holomap redesign: two levels, honest bodies"
date: "2026-10-18"
source: "design"
---

# Holomap redesign: two levels, honest bodies

## Problem

The map draws one frame for two scales and mislabels what it draws.

`campaign.js` treats Nov Elysia as a city — "frontier city under Vestan control and only
real foothold Union has on planet" — and lists `ops[0].loc` as `elysia`. The map disagrees:
Nov Elysia carries `kind: "PLANET"`, Pell carries `parent: "elysia"` so a moon orbits a
city, and Cressidium — the planet named on the OPORD page — has no record at all.

Reference counts, corrected by review: **Tarn, Harrow's Gate, Kessen Relay and Cairn Drift
appear in zero prose.** The two hits each in `campaign.js` are their own `id` and `name`
fields. Pell's three hits are its `id`, its `name`, and the substring inside
"Rocket-Pro**pell**ed" — so Pell is a data name too. The names prose actually uses are
Nov Elysia (the city), FOB Saber, the central district, the Leandric coast and the high
orbit the Rio Grande holds. **FOB Saber has no record**: the standing record is `dock`
(`DOCK / FOB`). Four of the six system markers are dictionary entries drawn with the same
weight as the places in play.

## Decision

**Two levels, click-through.** A Cressidium system frame shows bodies and installations
with true-parent orbits; the theater frame shows the fighting. Selecting the planet
descends a level; `SYSTEM VIEW` climbs back out.

Spelling follows the live OPORD page, which already reads `THEATER`: the level is
`THEATER`, the chip is `ENTER THEATER`.

Four structural commitments come out of review, and all four come first:

1. **The map builder moves out of `index.html` into `archive.js` as a pure function**,
   `UI.holomap(level)`, returning `{world, key}` markup strings — the shape `ledgerPanel`
   already uses with `{count, html}`. Today the builder lives in the inline IIFE at
   `index.html:57-83` (`X/Y`, `shape`, `nodes`, `rings`, `zones`, `lines`, `zoomTo`), and
   `mount("index.html")` cannot run under the harness: the stub's `querySelector` returns
   `null`, so it throws at `index.html:72`. That is why `check-all.cjs:185-188` asserts
   source substrings instead of rendered markup. **`zones` and `lines` move too** — if they
   stay in `index.html`, the invariant about levels cannot be tested through `UI.holomap`.
2. **The pane renderer gains a pure sibling.** `showUnit` currently writes into
   `#record-detail`. Split it into `UI.unitFile(id)` returning markup plus a `showUnit`
   that inserts it, so the `ENTER THEATER` chip — which belongs in Cressidium's pane — is
   assertable without a DOM.
3. **Theater records carry an owner**, `frame: "cressidium"`, and the descent reads it.
   `parent` stays orbit-only and same-level only, so it cannot express "this theater
   belongs to that planet", and the descent is not hardcoded to an id.
4. **Level state lives in `UI`,** not in `index.html`. `archive.js`'s pane chips need it
   (see Cross-frame selection), and one switch point keeps the map, the key and the pane
   consistent.

## Level 1 — Cressidium system (viewBox 1000×480)

| Site | kind | parent |
|---|---|---|
| Cressidium | `PLANET` | — |
| Pell | `MOON` | `cressidium` |
| Tarn | `PLANET` | — |
| Harrow's Gate | `STATION` | `tarn` |
| Kessen Relay | `STATION` | `cressidium` |
| Cairn Drift | `WRECK FIELD` | — (debris belt) |

Markup: `#holo-world` holds `.orbit-ring` per parented site and `.body` per planet; no
`.plot-grid`. Selecting Cressidium opens its pane. Tarn descending to a frame of its own is
deferred — nothing is placed there in prose.

## Level 2 — Nov Elysia theater (viewBox 1000×480)

**Provisional: grounded only.** Every site is named in prose. Invented geography later is
additive work on one data table.

| Site | id | kind | grounded in (exact substring of `campaign.js`) |
|---|---|---|---|
| Nov Elysia | `elysia` | `CITY` | `frontier city under Vestan control` |
| Central District | `district` | `DISTRICT` | `central district` |
| FOB Saber | `dock` | `FOB` | `FOB SABER RENDEZVOUS` |
| Drop Zone Kingfisher | `dropzone` | `ZONE` | `Dropship Kingfisher 2-2` |
| UNS Rio Grande | `rio` | `ORBITAL` | `HIGH ORBIT OVER NOV ELYSIA` |
| Leandric Edge | `coast` | `ZONE` | `Leandric States Alliance holding` |
| VSAF Advance | `vsaf` | `ZONE` | `VSAF moving on` |

`elysia` keeps its id — `check-all.cjs:98` asserts `op.loc === "elysia"`, and the city
reading is what makes that assertion true. `dock` keeps its id because `index.html:61`
hardcodes `routes=["dock",…]`; the route then reads as the insertion leg. Renaming the
record's `name` to `FOB SABER` is safe; changing its `id` is not. Every `grounded in`
value is asserted as a literal substring of `campaign.js`.

Markup: same frame, `.plot-grid` present, `.orbit-band` across the top holding the orbital,
the advance line drawn dashed and hostile. The detail pane stays the leaf.

## Data model

Added to each `C.locations` record:

- `level: "SYSTEM" | "THEATER"` — uppercase, matching `kind`. Absent is invalid.
- `parent: string | null` — an id on the **same level**, orbit ring only, else `null`.
- `frame: string` — **theater records only**: the system-level id owning this theater.

`kind` stays a closed, uppercase set extended with `CITY`, `DISTRICT`, `FOB`, `ZONE`,
`ORBITAL`. `shape()` ends in a diamond default, so an unknown or lowercased kind renders
silently as a wreck field; the builder must throw instead, and every kind must have a shape
and a key chip on each level it appears.

`x`/`y` are percentages of the viewBox, scaled by `X = x*10` and `Y = y*4.8`. One record is
one marker on one level.

Levels of the other drawn layers:

- **Zones:** `factions[].zone` gains `level`, and the zone centre moves with it. All three
  zones are `THEATER`. Two of them currently sit on system sites — `campaign.js:34` centres
  Leandric on `kessen` (60,68) and `campaign.js:35` centres Union on Cairn Drift (86,64) — so
  both move to theater coordinates. Vestan's centre (38,44) already coincides with the city
  and stays. A zone centred on a system site is exactly the scale-mixing this redesign
  removes.
- **Routes:** routes have no record of their own (`routes` is built from `"dock"` plus
  `ops[].loc`), so a route's level is **derived from its endpoints**. Both endpoints here
  are theater, so the system frame draws no routes; a future cross-level route is a data
  error the builder throws on.
- **CURRENT OP ring:** drawn only on the level owning `C.ops[0].loc`.

## Interaction

Level state lives in `UI` beside the map. `UI.fitLevel(level)` is the single switch point and
the only mutator: it sets the level, resets the camera, and writes `{world, key}` into
`#holo-world` and the key element itself — the pane path in `archive.js` calls it and has
nothing to insert a return value with. `UI.holomap(level)` stays the pure part, and it is what
the tests call. `#record-detail` lives inside `#holomap`'s innerHTML, so `#holomap` is never
rebuilt wholesale.

Descending or climbing **disables the camera transition, resets the transform to identity,
swaps the frame body, then restores the transition on the next frame**. Awaiting
`transitionend` is not used: the camera is a single `.55s` transform, and resetting it
while the content swaps would start the new frame at 2.6× and shrink it, which is not a
descent. Within-frame zoom is unchanged from #24.

Descent trigger: the **`ENTER THEATER` chip in Cressidium's pane**, rendered by
`UI.unitFile("cressidium")`, keyboard-reachable and assertable, with a click on the body as
a shortcut. A bare click would fire both the `archive.js` handler (opening the Cressidium
pane) and the svg camera handler, leaving the pane showing a body the theater frame does
not draw.

Cross-frame selection: the pane's chips can open a site on the other level
(`personnel.lastKnown`, in-orbit links). The pane is rendered by `archive.js`, and level
state now lives in `UI` too, so the rule runs **inside the pane's select path in
`archive.js`**: when a selected site's `level` differs from the current level, call
`UI.fitLevel(site.level)` before `mark()`. Without that, `zoomTo` pans to coordinates that
are not drawn and `mark()` finds no node.

Reachability, stated honestly: theater sites are reachable by keyboard — Tab to a system
site, open its pane, activate `ENTER THEATER`, then Tab through the theater markers — which
is one extra activation, not a pointer-only path. `NEARBY SITES` lists same-`level` sites
rather than only `parent` children, so moving Pell to `cressidium` does not strand it.

Under `prefers-reduced-motion` the frame swap is instant; there is no glide to skip.

## Invariants

Checkable by inspection:

- Every location has a `level` in the closed set; `parent`, when set, names a location on
  the same level; `frame`, when set, names a `SYSTEM` location.
- Every kind is uppercase and in the closed set; the builder throws on an unknown kind.
- Every kind has a shape and a key chip on each level it appears.
- No zone, route or `CURRENT OP` ring renders on a level it does not declare; a route whose
  endpoints disagree on level throws.
- `Cressidium.kind === "PLANET"`, `Nov Elysia.kind === "CITY"`,
  `Pell.parent === "cressidium"`, `dock.id === "dock"`, `elysia.id === "elysia"`.
- `UI.holomap(level)` is pure: given `C`, it returns `{world, key}` and touches no DOM.

Requires tests (assertions over `UI.holomap("SYSTEM")` and `UI.holomap("THEATER")`, only
possible after the builder move):

- Each frame renders exactly its own site list, and neither leaks the other's ids.
- Each frame's key holds that level's chips; `ENTER THEATER` is asserted through
  `UI.unitFile("cressidium")` — it is a pane chip, not a key chip — and `SYSTEM VIEW`
  through `UI.holomap("THEATER")`.
- Every `grounded in` string is a substring of `campaign.js`.
- The builder throws on an unknown kind, on a missing `level`, and on a cross-level route.

Existing assertions the rewrite touches, listed so they are not discovered late:

- `check-all.cjs:187` — all seven substrings break once the template moves: `holo-key`,
  `k-cur`, `CURRENT OP`, `PLANNED LEG`, `TRAVELLED`, `holo-world`, `holo-reset`.
- `check-all.cjs:188` — both `'l.id===cur?" cur":""'` and `", current operation"`, since the
  current-op marker is built in the template that moves.
- `check-all.cjs:181` — `page.includes('id="record-detail"')`, kept true by never
  rebuilding `#holomap`.
- `check-all.cjs:98` — `sr.loc !== "elysia"` stays **unchanged**, since the id is kept.
- Untested strings the rename touches: the `SECTOR VIEW` button and its `aria-label`, and
  the `SECTOR HOLOMAP` / `RIM SECTOR` heads.
- `tools/` needs no update: no script there counts locations or names labels.
  `tools/personnel-adversarial-check.cjs` builds map nodes from every location and carries a
  "no map reparent/scroll" vector, so it is re-run once the cross-frame select path exists.

## Files touched

- `archive.js` — pure `holomap(level)` builder (`X/Y`, `shape`, `nodes`, `rings`, `zones`,
  `lines` all move), pure `unitFile(id)` split out of `showUnit`, `fitLevel`, level state,
  the cross-frame select rule, `UI` export.
- `index.html` — thin wiring only: call `fitLevel`, camera listeners, the key's static shell.
- `campaign.js` — location records: reclassify, add `level`/`parent`/`frame`, add the
  theater sites, add `level` to faction zones, rename `dock` to FOB Saber.
- `style.css` — `.orbit-ring`, `.body`, `.plot-grid`, `.orbit-band`, per-level key chips.
- `check-all.cjs` — builder and pane assertions replacing the string assertions it can drop.

## Acceptance

- `UI.holomap("SYSTEM")` returns Cressidium, Pell, Tarn, Harrow's Gate, Kessen Relay,
  Cairn Drift; `UI.holomap("THEATER")` returns the seven theater sites; neither leaks.
- `ENTER THEATER` descends and `SYSTEM VIEW` climbs, both keyboard-reachable, both with the
  camera transition off across the swap.
- The semantic bug is gone: planets are Cressidium and Tarn, Nov Elysia is a city, Pell
  orbits Cressidium, and the map no longer blanks (the `dock` id survives).
- `node check-all.cjs` passes with the new assertions, and the seven `grounded in` strings
  pass as substrings.
- Deployed to Pages; the live page carries both frames.

## Open questions

- Theater content (grounded only vs. invented landmarks): presented, unanswered; grounded
  only is provisional and additive to change.
- Tarn descending to its own frame: deferred, nothing placed there in prose.