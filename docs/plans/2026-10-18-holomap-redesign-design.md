---
ticket: "#25"
title: "Holomap redesign: two levels, honest bodies"
date: "2026-10-18"
source: "design"
---

# Holomap redesign: two levels, honest bodies

## Problem

The map draws one frame for two different scales, and mislabels what it draws.

`campaign.js` treats Nov Elysia as a city — "frontier city under Vestan control and only
real foothold Union has on planet", and the OPORD hero reads `THEATER: Nov Elysia ·
Cressidium`. The map disagrees: Nov Elysia carries `kind: PLANET`, Pell carries
`parent: elysia` so a moon orbits a city, and Cressidium — the planet the campaign is
actually fought on — is not on the map at all. Tarn, Harrow's Gate, Kessen Relay and
Cairn Drift each appear once in prose but are drawn with the same weight as the places in
play. Everything referenced by the operation (central district, FOB Saber, high orbit,
Leandric coast, Vestan industrial districts) has no marker.

Investigating reference counts confirmed the weight: Nov Elysia has 10 prose mentions and
is the operation's `loc`; Pell has 3; every other site has one.

## Decision

**Two levels, click-through.** A system frame shows celestial bodies and installations
with true-parent orbits; selecting the planet descends into a theatre frame of the
fighting itself. This reuses the camera built for #24 rather than adding a mechanism.

Selecting a body at system level either zooms to it in place (installations, the wreck)
or descends a level (the planet). A `SYSTEM VIEW` chip in the map key climbs back out.

## Level 1 — Cressidium system (frame 1000×480)

| Site | kind | parent |
|---|---|---|
| Cressidium | planet | — |
| Pell | moon | cressidium |
| Tarn | planet | — |
| Harrow's Gate | station | tarn |
| Kessen Relay | station | cressidium |
| Cairn Drift | wreck field | — (debris belt) |

Drawn as an orrery: no grid, orbit rings as true parent circles, a star, distance
read as relative position on the ring. Selecting Cressidium descends; a breadcrumb in the
section head reads `CRESSIDIUM SYSTEM`.

## Level 2 — Nov Elysia theatre (frame 1000×480)

**Provisional: grounded only.** Every site below is named in prose already; no invented
landmarks. Adding invented geography later is purely additive, so this choice stays
reversible.

| Site | kind | grounded in |
|---|---|---|
| Nov Elysia | city | "frontier city under Vestan control" |
| Central District | district | "missing in central district" |
| FOB Saber | fob | "FOB SABER RENDEZVOUS INSTRUCTIONS" |
| Drop Zone Kingfisher | zone | "insertion onto Nov Elysia aboard Dropship Kingfisher 2-2" |
| UNS Rio Grande | orbital | "high orbit over Nov Elysia" |
| Leandric Edge | zone | "Leandric States Alliance holding coast and trade lanes" |
| VSAF Advance | zone | "VSAF moving on city" |

Drawn as a tactical plot: grid, a surface/coast boundary, a shaded high-orbit band at
the top holding the Rio Grande, and the advance line as a dashed hostile route. Selecting
an orbital descends no further; the detail pane under the map remains the leaf.

## Data model

Two fields added to each `C.locations` record, nothing else:

- `level: "system" | "theater"` — which frame the site belongs to. Absent is invalid.
- `parent: string | null` — the id whose orbit ring the site hangs on, or `null`.

`kind` stays a closed set, extended with `city`, `district`, `fob`, `zone`, `orbital`.
`x`/`y` are per-level screen coordinates, so both frames share the 1000×480 space.

Grain test: one record is one marker on one level. A site appearing on both levels would
be two records, which is why nothing is duplicated today.

## Interaction

Level state (`system` | `theater`) plus the existing camera. Descending or climbing
re-renders the frame's sites and resets the camera; zooming within a level is unchanged
from #24. The map key swaps its chip set per level. Breadcrumb: `CRESSIDIUM SYSTEM` /
`NOV ELYSIA THEATRE`. Under `prefers-reduced-motion` both the descent and the camera jump
instead of gliding. The detail pane stays the keyboard and screen-reader route to a
site's file, so no file is reachable only by descending.

## Invariants

Checkable by inspection:

- Every location has a `level` in the closed set; `parent`, when set, names another
  location on the same level.
- No orbit ring is drawn without a parent in the same level.
- The `kind` vocabulary is closed; every kind has a shape and a key chip for its level.
- `Cressidium` is `kind: planet`; `Nov Elysia` is `kind: city`; `Pell.parent ===
  "cressidium"`.

Requires tests:

- Both frames render their full site list through the stub-DOM harness in `check-all.cjs`,
  which calls the level switch directly rather than through a click.
- Descending from the system frame and climbing back both restore a full site list.
- `tools/*-check.cjs` assertions that count locations or name labels still pass after the
  rename (`ROUTE TRAVELLED` and friends already moved once in #18).

## Files touched

- `campaign.js` — location records: rename the planet, reclassify, add `level`/`parent`,
  author the theatre sites.
- `archive.js` — map build and render: per-level site selection, orrery vs plot layers,
  per-level key, breadcrumb.
- `index.html` — level wiring alongside the camera; key markup per level.
- `style.css` — orrery and plot layer treatments; per-level key chips.
- `check-all.cjs` — assertions for both frames and the invariants above.

## Acceptance

- The system frame shows Cressidium, Pell, Tarn, and the installations with honest orbits.
- Selecting Cressidium descends to the theatre frame showing the seven grounded sites;
  `SYSTEM VIEW` climbs back out and restores the system frame.
- The semantic bug is gone: planets are Cressidium and Tarn, Nov Elysia is a city, Pell
  orbits Cressidium.
- `node check-all.cjs` passes with the new assertions.
- Deployed to Pages and verified live.

## Open questions

- The theatre content question (grounded only vs. invented landmarks) was presented and
  left unanswered; grounded only is provisional and reversible.
- Whether Tarn should also descend to a frame of its own — deferred, nothing is placed
  there in prose.