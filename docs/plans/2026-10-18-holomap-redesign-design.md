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
city, and Cressidium — the planet named in the OPORD hero (`THEATER: Nov Elysia ·
Cressidium`) — has no record at all.

Reference counts, corrected: **Tarn, Harrow's Gate, Kessen Relay and Cairn Drift appear in
zero prose.** The two hits each in `campaign.js` are their own `id` and `name` fields, and
"Pell has 3" counted `id`, `name`, and "Rocket-Pro**pell**ed". The four are dictionary
entries drawn with the same weight as places in play. The only names prose actually uses
are Nov Elysia (the city), Pell (its moon), FOB Saber and the central district — and
**FOB Saber has no record**: the standing record is `dock` (`DOCK / FOB`).

## Decision

**Two levels, click-through.** A Cressidium system frame shows bodies and installations
with true-parent orbits; the theatre frame shows the fighting. Selecting the planet
descends a level; `SYSTEM VIEW` climbs back out.

Two structural commitments fall out of the review, and both come first:

1. **The map builder moves out of `index.html` into `archive.js` as a pure function**,
   `UI.holomap(level)`, returning markup exactly like `ledgerPanel` does.
   Today the builder lives in the inline IIFE at `index.html:58-83` (`X/Y`, `rings`,
   `shape`, `nodes`, `zoomTo`), and `mount("index.html")` cannot run under the harness —
   the stub's `querySelector` returns `null`, so it throws at `index.html:72`.
   That is why `check-all.cjs:185-188` asserts on source substrings instead of rendered
   markup. Until the builder is pure, none of this design is testable.
2. **Theatre records carry an owner**, `frame: "cressidium"`, and the descent reads it.
   `parent` stays orbit-only and same-level only, so it cannot express "this theatre
   belongs to that planet" and the descent is not hardcoded to an id.

## Level 1 — Cressidium system (viewBox 1000×480)

| Site | kind | parent |
|---|---|---|
| Cressidium | `PLANET` | — |
| Pell | `MOON` | `cressidium` |
| Tarn | `PLANET` | — |
| Harrow's Gate | `STATION` | `tarn` |
| Kessen Relay | `STATION` | `cressidium` |
| Cairn Drift | `WRECK FIELD` | — (debris belt) |

Markup: `#holo-world` holds `.orbit-ring` per parented site and `.body` per planet, no
`#holo-grid`. Selecting Cressidium opens its pane. Tarn descending to a frame of its own
is deferred — nothing is placed there in prose.

## Level 2 — Nov Elysia theatre (viewBox 1000×480)

**Provisional: grounded only.** Every site is named in prose. Adding invented geography
later is additive work on a data table.

| Site | id | kind | grounded in (exact substring of `campaign.js`) |
|---|---|---|---|
| Nov Elysia | `elysia` | `CITY` | `frontier city under Vestan control` |
| Central District | `district` | `DISTRICT` | `central district` |
| FOB Saber | `dock` | `FOB` | `FOB SABER RENDEZVOUS` |
| Drop Zone Kingfisher | `dropzone` | `ZONE` | `Dropship Kingfisher 2-2` |
| UNS Rio Grande | `rio` | `ORBITAL` | `HIGH ORBIT OVER NOV ELYSIA` |
| Leandric Edge | `coast` | `ZONE` | `Leandric States Alliance holding coast` |
| VSAF Advance | `vsaf` | `ZONE` | `VSAF moving on the city` |

`elysia` keeps its id — `check-all.cjs:98` asserts `op.loc === "elysia"`, and the city
reading is what makes that assertion true. `dock` keeps its id because
`index.html:61` hardcodes `routes=["dock",…]`; the route dock→elysia then reads as the
insertion leg. Renaming the record's `name` to `FOB SABER` is safe; changing its `id`
is not. Every `grounded in` value must be a literal substring of `campaign.js`, which is
itself an assertion.

Markup: same frame, `.plot-grid` present, `.orbit-band` across the top holding the
orbital, the advance line drawn dashed and hostile. The detail pane stays the leaf.

## Data model

Added to each `C.locations` record:

- `level: "SYSTEM" | "THEATER"` — uppercase, matching `kind` casing. Absent is invalid.
- `parent: string | null` — an id on the **same level**, orbit ring only, else `null`.
- `frame: string` — **theatre records only**: the system-level id owning this theatre.
  `frame` replaces the rejected idea of pointing `parent` across levels.

`kind` stays a closed, uppercase set extended with `CITY`, `DISTRICT`, `FOB`, `ZONE`,
`ORBITAL`. `shape()` currently ends in a diamond default, so an unknown or lowercased
kind renders silently as a wreck field; unknown kinds must instead throw in the builder,
and every kind must have a shape and a key chip for its level.

`x`/`y` are percentages of the viewBox, scaled by `X = x*10` and `Y = y*4.8`. One record
is one marker on one level; a site on both levels would be two records.

Levels of the other drawn layers, decided:

- `factions[].zone` gains `level`. Vestan and Leandric zones are `THEATER`; a zone drawn
  in both frames today is a bug, not a feature.
- Route lines gain `level`; the dock→elysia leg is `THEATER`, so the system frame draws
  no routes.
- The `CURRENT OP` ring is drawn only on the level owning `C.ops[0].loc`.

## Interaction

Level state lives beside the camera. Descending and climbing **reset the camera to
identity**, then swap the frame — the camera is one CSS transform with a `.55s`
transition, so resetting it while content swaps would start the new frame at 2.6× and
shrink it, which is not a descent. Within-frame zoom is unchanged from #24.

Descending rebuilds `#holo-world` and the map key only. `#record-detail` lives inside
`#holomap`'s innerHTML, so rebuilding `#holomap` wholesale destroys the pane.

Descent trigger: an explicit **`ENTER THEATRE` chip in Cressidium's pane**, which is
keyboard-reachable and assertable, with a click on the body as a shortcut. A click alone
would fire both the `archive.js` handler (opening the Cressidium pane) and the svg camera
handler, and leave the pane showing a body the theatre frame does not draw.

Cross-frame selection has a rule: the detail pane's chips can open a site from the other
level (`personnel.lastKnown`, in-orbit links). Selecting such a site switches level first,
then selects, so `zoomTo` never pans to coordinates that are not drawn and `mark()`
always finds a node.

Reachability: the pane's `NEARBY SITES` lists same-`level` sites rather than only
`parent` children, so moving Pell to `cressidium` does not strand it, and the theatre is
reachable by keyboard through the `ENTER THEATRE` chip rather than only by descending.
No file is reachable only by descending.

Under `prefers-reduced-motion` the frame swap is instant; there is no glide to skip.

## Invariants

Checkable by inspection:

- Every location has a `level` in the closed set; `parent`, when set, names a location on
  the same level; `frame`, when set, names a `SYSTEM` location.
- Every kind is uppercase and in the closed set; the builder throws on an unknown kind.
- Every kind has a shape and a key chip on each level it appears on.
- No zone, route or `CURRENT OP` ring renders on a level it does not declare.
- `Cressidium.kind === "PLANET"`, `Nov Elysia.kind === "CITY"`,
  `Pell.parent === "cressidium"`, `dock.id === "dock"`, `elysia.id === "elysia"`.
- `UI.holomap(level)` is pure: given `C`, it returns a string and touches no DOM.

Requires tests (assertions over `UI.holomap("SYSTEM")` and `UI.holomap("THEATER")`,
which is only possible after the builder move):

- Each frame renders exactly its own site list, and neither leaks the other's ids.
- Each frame's key holds that level's chips, and `ENTER THEATRE` appears in the system
  frame while `SYSTEM VIEW` appears in the theatre frame.
- Every `grounded in` string is a substring of `campaign.js`.
- The builder throws on an unknown kind and on a missing `level`.

Existing assertions the rewrite will touch, listed so they are not discovered late:
`check-all.cjs:187-188` exact substrings `holo-reset`, `TRAVELLED`, `PLANNED LEG`, and
`'l.id===cur?" cur":""'`; `check-all.cjs:98` `op.loc !== "elysia"`; and the
`required.locations` check, which gains `level`. Untested strings the rename touches:
the `SECTOR VIEW` button and its `aria-label`, and the `SECTOR HOLOMAP` / `RIM SECTOR`
heads. No script under `tools/` counts locations or names labels, so the earlier claim
that they would need updating was wrong.

## Files touched

- `archive.js` — new pure `holomap(level)` builder (moves `X/Y`, `shape`, `nodes`,
  `rings` out of `index.html`), plus `UI` export.
- `index.html` — thin wiring only: level state, camera, listeners; builder call.
- `campaign.js` — location records: reclassify, add `level`/`parent`/`frame`, add the
  theatre sites, add `level` to faction zones, rename `dock` to FOB Saber.
- `style.css` — `.orbit-ring`, `.body`, `.plot-grid`, `.orbit-band`, per-level key chips.
- `check-all.cjs` — builder assertions replacing the string assertions it can drop.

## Acceptance

- `UI.holomap("SYSTEM")` returns Cressidium, Pell, Tarn, Harrow's Gate, Kessen Relay,
  Cairn Drift; `UI.holomap("THEATER")` returns the seven theatre sites; neither leaks.
- The `ENTER THEATRE` chip descends and `SYSTEM VIEW` climbs, both keyboard-reachable,
  both with the camera reset.
- The semantic bug is gone: planets are Cressidium and Tarn, Nov Elysia is a city, Pell
  orbits Cressidium, and the map no longer blanks (the `dock` id survives).
- `node check-all.cjs` passes with the new assertions.
- Deployed to Pages; the live page carries both frames.

## Open questions

- Theatre content (grounded only vs. invented landmarks): presented, unanswered;
  grounded only is provisional and additive to change.
- Tarn descending to its own frame: deferred, nothing placed there in prose.