---
ticket: "#29"
title: "Holomap: real bodies, and a descent from system to ground"
date: "2026-10-19"
revision: 10
source: "design"
---

# Holomap: real bodies, and a descent from system to ground

## Problem

The map cannot be looked *into*, and its bodies are interchangeable symbols.

Every location is drawn by a glyph from `archive.js`'s `KINDS` table: a planet, a moon, a
station and a wreck field are all polygons and circles on the same flat grid. Nothing about
the drawing says which is a world and which is hardware, and "see the planets in the system"
is not something the frame supports — there is one frame per band, and a body has no inside
to open.

Two specific asks from the operator, verbatim:

1. "I want the planets to look like planets and not just circles or triangles. I want them to
   be able to see a system and see the planets in it and the moons and the stations."
2. "They can click Nov Elysia and they can see the Rio Grande in orbit above it and click on
   that to see info about the ship and the personnel. They can then click on the planet and
   see the city, and clicking into that will show POI like the FOB and the DZ for mission one."

## What already exists

The structural work #25 asked for has landed. This is a real starting point, not a rewrite.

- `archive.js:112` `holomap(level)` is already pure, already returns `{world, key, grid, aria}`,
  already throws on an unknown level, and already has `fitLevel`, `unitFile` and `showUnit`
  split out (`archive.js:156`, `:175`, `:184`) and exported (`archive.js:451`). Under frames it
  returns `{world, key, grid, aria, crumbs, locator}` — that shape is stated once, here, and the
  sections below refer to it rather than repeating it.
- `LEVELS` (`archive.js:107`) holds exactly two frames, `SYSTEM` and `THEATER`.
- Orbit rings already exist and are already honest: only `MOON`, `STATION` and `ORBITAL` with
  a parent drawn on the same frame get one (`archive.js:129`).
- The current-op ring is already guarded: op 001 is `type: "PLANNED"` / `status: "UNBRIEFED"`,
  so `cur` is empty and nothing claims live tracking (`archive.js:117`). This guard is correct
  and must survive, including on ancestor markers.
- `frame` already exists as a field and already means "draw me on that body's frame":
  `elysia`, `rio` and `vsaf` carry `frame: "cressidium"` today, and `hostsOf()` already reads
  it (`archive.js:132`).
- Every location already carries art, at `assets/<id>.png`, and the ids match the filenames
  exactly: `cressidium.png`, `pell.png`, `kessen.png`, `tarn.png`, `harrow.png`, `cairn.png`,
  `elysia.png`, `district.png`, `industry.png`, `dock.png`, `dropzone.png`, `rio.png`,
  `vsaf.png`. **No new art is required for the first slice.**
- Every one of those also has an `assets/<id>-thumb.webp` at 480², 46-75 KB, while the full
  PNGs are 1254² and 2.4-3.3 MB each. A six-body SYSTEM frame drawing full PNGs would carry
  about 17 MB, and the locator repeats them on every descended frame, so **the map draws
  `-thumb.webp`** and the full plate stays for the dossier.
- `assets/nov-elysia.png` is already real planet-from-orbit art with a terminator, in use as
  "NOV ELYSIA // CRESSIDIUM" (`solstice-rain.html:35`). It is the Cressidium disc candidate,
  which answers the cropped-illustration risk before slicing.
- The location key list check-all enforces today is `["name", "kind", "x", "y", "level"]`
  (`check-all.cjs:53`), and the two-level frame assertions are `check-all.cjs:266-404`.

Current data, verbatim, because the migration below is defined against it:

| id | kind | level | frame | parent | x | y |
|---|---|---|---|---|---|---|
| cressidium | PLANET | SYSTEM | — | — | 30 | 52 |
| pell | MOON | SYSTEM | — | cressidium | 39 | 39 |
| kessen | STATION | SYSTEM | — | cressidium | 46 | 62 |
| cairn | WRECK FIELD | SYSTEM | — | — | 66 | 76 |
| tarn | PLANET | SYSTEM | — | — | 86 | 24 |
| harrow | STATION | SYSTEM | — | tarn | 78 | 38 |
| elysia | CITY | THEATER | cressidium | — | 38 | 44 |
| district | DISTRICT | THEATER | — | elysia | 45 | 33 |
| industry | DISTRICT | THEATER | — | elysia | 26 | 36 |
| dock | FOB | THEATER | — | industry | 20 | 49 |
| dropzone | ZONE | THEATER | — | — | 25 | 63 |
| rio | ORBITAL | THEATER | cressidium | — | 50 | 8 |
| vsaf | ZONE | THEATER | cressidium | — | 64 | 40 |

## Decision

**Retire the level bands. A frame is a subject, and the descent is a stack of frames.**

`holomap(frameId)` takes a frame id: `"SYSTEM"` for the root, or a location id for a body you
have descended into. A location is drawn on the frame named by its `frame` field; a location
whose `frame` is absent is drawn on `"SYSTEM"`. `level` stops being a wiring key: "which frame draws
me" is `frame`'s job and "do I orbit something" is `parent`'s job, so filtering a frame by `level`
drifted out of step with both. It **stays on the records as the scale of the coordinates on
them**, which nothing else can supply.

A body can be drawn on two frames in two roles, and both are stated rather than smuggled. A
**satellite** is a small attached body riding its parent's ring at the system frame and a full
body on its planet's own frame: that is what makes "see the planets and the moons and the
stations" true at the top, and what gives the descent somewhere to go. A **subject** is a member
of its home frame and also the whole of the frame carrying its own id: `cressidium` is a body on
`SYSTEM` and the whole of `cressidium`, and `elysia` is a pin on `cressidium` and the whole of
`elysia`. Nothing else appears twice, and every frame knows which of the two it is drawing.

### Membership and placement

`members(F)` is the exact set of ids a frame draws. The root is its own case; every other frame
has three parts:

- **the subject**: `F` itself, drawn at the frame's centre. Every descended frame draws its own subject,
  `elysia` included, so a ring centred on the subject always has a centre.
- **framed children**: every record with `frame === F`.
- **satellites**: every record with no `frame` whose `parent === F`.

Those three are alternatives and never overlap. A record that has a `frame` is a framed child
and can never also be a satellite, which is the clause that keeps `rio` drawn exactly once on
`elysia` once the migration gives it both a `frame` and a `parent` of `elysia`. Reading the
three as a sum instead of a set draws two Rio Grandes, and the second one looks like a leak to
any pin counting `data-loc` nodes.

`SYSTEM` is the root: it has no subject and draws **every frameless record**, which is the same
set read as the root's children. So `cressidium`, `tarn` and `cairn` sit as principals and
`pell`, `kessen` and `harrow` ride their parents' rings. The root carries `kind: "SYSTEM"` as
frame metadata because no record supplies one, and its scale is `SYSTEM`, the `level` every
frameless record already carries.

A record's `x,y` is expressed in the scale of the frame it is **drawn on** — except a record
that is itself a frame's subject, whose `x,y` is in **its own frame's** scale, because its
members are laid out around it in those units. `campaign.js:23` says so outright: "Coordinates are per level, so the two frames are
not drawn to one scale", and the grids are labelled `SECTOR GRID · 50 U` and
`THEATER GRID · 10 U` (`archive.js:108-109`). `level` therefore **stays on the records as the
scale of the coordinates on them**, and what retires is its wiring role: the `l.level===level`
filter and the two `SYSTEM|THEATER` buttons. A frame's scale is its subject's `level` (the root's
is `SYSTEM`). The claim that makes an offset mean anything is written as a set equality rather
than a sentence, because a sentence about equality that every record satisfies tests nothing:
**for every frame `F` and every member `m` of `F` other than `F`'s subject, collect the `m`
where `m.level !== scale(F)`. That set equals the set of records carrying a `pinBearing`, pair
by pair, and is never a hard-coded list.** Every frameless record is `level: "SYSTEM"`. Two
scales are equal for 12 of the 13 records, so the set equality is the only version that fails
when a mistyped `level` moves a record, or when a `pinBearing` appears with no cross-scale
member to carry it.
`elysia` is the one record whose two scales differ, and that is exactly why it is a pin.
Placement is one rule, not four:

- On `SYSTEM`, a record is placed at its own `x,y`; a satellite sits on its parent's ring at
  the angle of its own offset from that parent.
- On a descended frame `F`, the subject sits at the centre and every member whose `level`
  matches that frame's scale sits at its own offset from the subject, unchanged. Nothing is
  scaled and nothing is re-projected, because those coordinates are already in the frame's
  units.
- **A cross-scale member is placed by declaration, not by arithmetic.** An offset means something
  only inside one frame's scale: `elysia`'s `x,y` is a THEATER point and `cressidium`'s is a
  SYSTEM point, so subtracting one from the other mixes two origins and yields neither a distance
  nor a bearing. A member whose `level` differs from the frame's scale therefore sits on the
  subject's rim at a **declared bearing carried by the pinned record itself** (`elysia:
  pinBearing: 100`), the same honest move as the star below. Compass degrees, clockwise from
  north, drawn `x = cx + r·sin(b)`, `y = cy − r·cos(b)` where `r` is `discRim` scaled by the fit,
  because SVG's y axis points down; the frame's `aria` says `POSITION ON DISC DECLARED` rather
  than implying a measured spot. 100° is the night face: the star is at `starBearing: 270`, so the
  anti-star axis is 90°, and **the pin must fall within 90° of that axis, asserted**, which is what
  keeps it off the day side rather than a remark in prose. The bearing is not aimed at `pell`
  (`pell` is at 55.3°): at 100° the pin lands 77.3 px from `pell`, clear of their radii. **The pin
  has a radius of its own, 12 px** — the city glyph plus its halo — and the assertion is that it
  clears every same-frame member by the sum of their two radii. Today
  exactly one member is in this case: `elysia` on `cressidium`. A cross-scale member
  with no `pinBearing` of its own throws rather than inventing an angle, so a second one cannot
  silently land on the same rim point. `ponytail:` the declared
  bearing is what a one-scale page can honestly draw; upgrade to a real projection when a second
  scale must be *measured* across, not merely positioned.
- A ring is drawn around the parent at the radius of the child riding it, for a `MOON`, `STATION`
  or `ORBITAL` child only (the gate at `archive.js:128-129`) — `dock`, `district` and `industry`
  are ground members and get no ring, which `check-all.cjs:322` already asserts. The parent may
  be the frame's subject (`rio` over `elysia`) or a principal on the root (`pell` over
  `cressidium`).
- A **pin** is a member whose `level` differs from the frame's scale, drawn on the subject's rim
  at its own declared bearing, for the reason in the `ponytail:` note above. The definition is
  the narrow one on purpose: `dock`, `district`, `industry` and `rio` each end up with a `frame`
  equal to their `parent` after the migration, but all four share their frame's scale, so they sit
  at their own offsets and none of them is a pin. `elysia` is the only pin in the records.
- **A drawn radius is a pixel constant multiplied by the fit scale**, like a position, and never
  a viewBox unit. One radius per kind, at 1×: a planet member 54, a moon 30, a station hex 26, a
  wreck field 9, an orbital hull 46 (the `KINDS` hull widened to hold an art plate; 11 today),
  and a ground kind keeps its own glyph extent (`CITY` 9, `DISTRICT` 8, `FOB` 9, `ZONE` 9),
  because those glyphs stay unchanged. The **subject's** radius — `discRim` on an art-disc kind —
  is 72, and for a ground subject it is the glyph's own extent. `ponytail:` upgrade to per-body
  radii if the art needs them. Scaling positions but not radii is what let a planet's disc swallow
  its own moon's ring on the mockup, so the two are one rule. 72 and not 88 because `pell` rides
  `cressidium` at 109.5 px, and 72 + 30 clears it while 88 + 30 would not: **no same-scale member
  may sit inside the subject's disc or glyph**, asserted as `offset ≥ subjectRadius +
  memberRadius` — 109.5 ≥ 72 + 30 on `cressidium`, and 87.7 ≥ 9 + 8 on `elysia`.
- **`rio` must not set `elysia`'s fit.** Its hull at 46 px and 210.4 px out gives 256.4, under
  `vsaf` at 260.7 plus its 9 px glyph, which is what the test below asserts.
- The frame's **view radius** is `max(discRim, max(offset + memberRadius))` over the members that
  share the frame's scale — floored at the 72 px disc so a frame holding only its subject (`pell`,
  `kessen`, `harrow`, `cairn`, `dock`, `district`, `dropzone`, `rio`, `vsaf`) is not drawn at
  about 40× — computed from the records and never hard-coded. The camera scale is
  `min(viewW, viewH) / (2 × radius)` with **one margin of 24 px**, applied once. A member's own
  radius is in there because a mostly-vertical body would otherwise overhang the edge while its
  centre passed the test. On `cressidium` the radius is 193 px, set by `kessen` at 167 plus its
  26 px hex; on `elysia` it is 269.7 px, set by `vsaf` at 260.7 plus its 9 px glyph, not by `rio`
  at 256.4. An orbit ring takes its own child's radius, and the pin's 12 px is in the fit too, so
  a pin on the rim cannot overhang. The view is **fitted, not clipped**, so a frame whose radius
  (269.7 px on `elysia`) exceeds the viewBox half-height of 240 is drawn smaller rather than cut
  off.
- **Labels are drawn after the bodies and are not part of the fit.** At a small scale a label can
  touch its neighbour: on the mockup `DISTRICT` overlapped the city glyph at 0.59× and `INDUSTRY`
  overlapped `FOB SABER`. `ponytail:` acceptable for now; upgrade to a collision pass when a
  frame carries more than six labelled members.

So the rule is: **every record has one home frame — its `frame` if set, `SYSTEM` otherwise —
and a satellite is also drawn on its parent's frame.** That gives the no-leak test a real
membership to test: `members(F)` is the only set of ids a frame may draw.

### Frames after migration

| frame | draws (`members`) | why |
|---|---|---|
| `SYSTEM` | every frameless record: cressidium, tarn, cairn as principals; pell, kessen, harrow on their parents' rings; plus the drawn star, which is not a record | the star system, with its worlds and their hardware |
| `cressidium` | cressidium at centre; pell and kessen as full bodies; elysia as a pin on the disc | the planet, its moon, its station, and the city on its surface |
| `tarn` | tarn at centre; harrow as a full body | the second world, and the station that orbits it |
| `elysia` | elysia at centre; district, industry, dropzone and vsaf as ground markers; rio on a ring centred on elysia | the city, its districts, and the hull in orbit over it |
| `industry` | industry at centre; dock as the FOB inside it | the industrial district and the FOB inside it |

### Data migration

One field is re-valued and three are added: `frame` is newly set on four records (`district`,
`industry`, `dropzone`, `dock`), re-valued on two (`vsaf`, `rio`), `rio.parent` is added rather
than changed (it is absent today), `factions[].zone.frame` and `elysia.pinBearing` are new fields,
and `level` keeps its value while losing its wiring role.
None is retired, and no id changes.

- **`level` stays, as the coordinate scale**, and stops being a wiring key. `check-all.cjs:53`'s
  key list keeps `level` alone, because `:65` reports every listed key as missing when it is
  `null` and `frame` is absent on six records after the migration. Two optional keys get their
  own type check
  instead: `frame` is a string or absent, and `pinBearing` is a number in `[0, 360)` or absent.
- **`frame` is set or re-valued** so the frame that draws each site is explicit:
  - `district`, `industry`, `dropzone` → `frame: "elysia"` (ground in the city's frame)
  - `dock` → `frame: "industry"` (FOB inside the industrial district; its `parent` already says `industry`)
  - `vsaf` → `frame: "elysia"` (was `cressidium`; the advance is on the city's ground, not the planet's)
  - `rio` → `frame: "elysia"` (was `cressidium`; the operator asked for the hull *above Nov Elysia*)
  - `elysia` keeps `frame: "cressidium"`, now read as the frame id it always was
  - `cressidium`, `tarn`, `cairn`, `pell`, `kessen`, `harrow` keep no `frame` (root frame)
- **`rio.parent` → `"elysia"`** so the orbit ring draws. Today `rio.parent` is absent, so the
  `ORBITAL` never gets the ring `archive.js:129` would give it; the hull is drawn floating.
- **`elysia.pinBearing: 100` is added** — the compass bearing of the city on `cressidium`'s disc, 10° off the anti-star axis so the pin sits on the night face and clear of `pell`.
  It rides the pinned record, not the frame's metadata, so a second cross-scale member cannot
  reuse one value silently, and a record carrying a bearing without being a pin is an error.
- **`factions[].zone` gains `frame: "elysia"`** (`campaign.js:59-62`), so a zone is drawn where
  its own record says rather than by an id hand-coded in the renderer. `archive.js:125-126`
  **will** draw a zone where `zone.frame === F` (today it gates on `level === "THEATER"`), and a
  zone's coordinates are translated **and multiplied by the fit scale**, `rx`/`ry` included, like
  any other member's.
- `pell`, `kessen`, `harrow` keep `parent` and keep no `frame`: they are satellites at the top
  and full bodies when their planet is opened.

### Body rendering by kind

`KINDS` keeps its glyphs only for things that are legitimately ground symbols. Worlds become
art, hardware becomes art on its own silhouette, and the glyph vocabulary stays for plan-view
markers.

| kind | rendered as | note |
|---|---|---|
| `PLANET` | art disc: `assets/<id>-thumb.webp` clipped to a circle, with a rim and a shadow terminator (`nov-elysia.png` is the Cressidium candidate for orbit art) | the operator's primary ask; a disc with art reads as a world |
| `MOON` | art disc at the satellite radius (30 px at 1×) on every frame but its own, where it takes the 72 px subject disc | one asset, two radii |
| `STATION` | art plate inside a hex silhouette | a station is not a ball |
| `WRECK FIELD` | art plate inside a jagged silhouette with its existing dashed field | stays a wreck field |
| `ORBITAL` | art plate in a hull silhouette, on its orbit ring | the Rio Grande reads as a hull, not a world |
| `CITY`, `DISTRICT`, `FOB`, `ZONE` | the existing `KINDS` glyphs, unchanged | these are ground symbols on a plan view; the glyph is right for them |

The builder must throw on a kind with no renderer, exactly as it throws on a kind with no
marker today (`archive.js:118`). Silence is the failure mode being removed.

### Heads, grids and aria per frame

The frame's head, sub-head, grid label and `aria` derive from the subject's kind rather than
from a level band (`archive.js:108` today), and from one table rather than two: a `PLANET`,
`MOON`, `STATION`, `WRECK FIELD` or `ORBITAL` frame reads `ORBIT GRID`; a `DISTRICT`, `FOB` or
`ZONE` frame reads `GROUND GRID`; a `CITY` frame reads `THEATER GRID`; the root reads `SECTOR HOLOMAP` over
`SECTOR GRID · 50 U`. **Only the root's label carries units**, because only the root draws at
scale 1: the grid pattern is a fixed 50 px texture (`intel.html:54`), so `50 U` is a
measurement on the root and false anywhere else (`cressidium` draws at about 1.24×, before the
reason the legend says `NOT DISTANCE`. `ponytail:` the pattern is not scaled to the fit;
upgrade if a frame ever needs measurable ground.

- The root is the one frame that is **not fitted**: it has no subject, so its bodies sit at the
  records' own `x*10, y*4.8` in viewBox coordinates, its fit scale is 1, and its rim centre is
  the viewBox centre. Its row is keyed by the root's own `kind: "SYSTEM"`, the field it already
  carries. No new field: the kind is the field.
- `cx, cy` in the bearing formula is the viewBox centre, `500, 240`, on every frame: a descended
  frame puts its subject there, and the root measures its rim from there.

### Rendering the art without shipping a raster mask

The art is clipped by an SVG `clipPath` per body, so nothing is masked at build time and no
new asset format enters the repo. The `<image>` references `assets/<id>-thumb.webp` and sits
inside the clip, the rim and terminator are two more SVG shapes over it, and the whole body is
one `<g>` so it keeps the `data-loc` and `class` attributes the camera, the pane and the
keyboard path already use. clipPath ids are unique across the world and the locator within a
mounted frame, and that is asserted, because duplicate ids silently cross-wire two clips. A body whose `members()` exceeds itself carries `class="node body"` (the `node` class first, because the cur/unv regex at `check-all.cjs:296` expects `class="node`) plus an `ENTER <NAME>` chip in
its pane, and the chip carries `data-frame`, so the descent is keyboard-reachable and assertable.

### The primary star, drawn and declared invented

The operator's call at review: the system frame draws a star. It is the one drawn thing here
that no record supports, so it is declared rather than smuggled in.

- It is **drawn procedurally in SVG**, not from art, because no asset exists and none is
  wanted yet. Its position is declared as a bearing from the viewBox centre (`starBearing: 270`,
  due west) at `starRadius`, the greatest body-centre distance from the viewBox centre, on a frame
  that is never scaled, so it cannot slide off
  the canvas: on the root the greatest body distance from `500, 240` is 381 px (`tarn`), which
  puts the star at about `119, 240` — the left edge at mid height, clear of `cressidium` and
  `tarn`. `ponytail:` a `starBearing` constant in the builder names it as an invented value,
  upgradeable to a record if the star ever needs a file. A test asserts that the star's `data-x`
  and `data-y` land inside the 1000×480 viewBox with a margin, its own radius too, the same shape
  of check the member positions get at `:428`.
- It is **not a location**: no `data-loc`, not selectable, no file, no key chip pretending
  otherwise. It carries no `data-frame` either, because `holomap("star")` does not exist and a
  `data-frame` on it would throw; it is not a button. Its `aria` names it as the primary, drawn
  for orientation, and its node carries `role="img"` because an `aria-label` on a bare `<g>` is
  ignored by several screen readers.
- The key carries `STAR · NO FILE` so a reader is told outright, and the frame's legend keeps
  saying the satellites' sizes are legibility, not distance. The kind-label check compares whole
  strings (`check-all.cjs:304`), so the replacement must exclude **`STAR · NO FILE`**, not
  `"STAR"`; that block is replaced wholesale (`:516`), so this is a note on the replacement, and
  `:303` is the label filter rather than that list.
- In the locator the star is a `role="img"` span with an `aria` label, **not a `<button>`**, and
  it carries no `data-frame` unlike the principal bodies beside it. The locator test lists it
  alongside them, so its presence is asserted rather than assumed, and the locator is not
  `class="node"`, so no ring assertion reaches it.
- Invariant: every drawn body either names a location or is the star; no third case, and no
  drawn body without a file may carry `data-loc`.

Adding a real record for it later is additive: the same node gains a `data-loc` and a file.

## Interaction

- **Frames swap.** Descending renders the target frame in place of the current one, the same
  way `SYSTEM`/`THEATER` swap today: `fitLevel(frameId)` stays the single switch point
  (`archive.js:156`), and #25's rule stands — the camera transition is disabled, the transform
  reset, the body swapped, the transition restored on the next frame.
- **The frame stack is derived, not stored.** The descent path is the `frame` chain from the
  current frame, `[..., "cressidium", "elysia"]`, so climbing is exact and a link to a deeper
  body sets the current frame in one step; `frame` stays the single source, and a second stored
  stack would only drift.
- **The breadcrumb is the way out**, replacing the two `SYSTEM|THEATER` buttons in
  `intel.html:40` and their delegate at `intel.html:103`: `CRESSIDIUM SYSTEM › CRESSIDIUM ›
  NOV ELYSIA`, one real `<button>` per ancestor, keyboard-reachable. The `SYSTEM VIEW` key
  chip in the theater frame (`archive.js:148`, asserted at `check-all.cjs:288`) becomes
  `UP ONE LEVEL` and lives in the breadcrumb instead of the key. The breadcrumb and the locator
  are HTML strips outside `#holo-world`, so the camera and the pinch never reach them, and the
  builder returns both as `crumbs` and `locator` alongside `world`, `key`, `grid` and `aria`,
  so tests assert on data instead of on page markup.
- **The system stays visible.** Every non-`SYSTEM` frame carries a small **system locator**: the
  system's principal bodies (`cressidium`, `tarn`, `cairn`) plus the declared star, with the
  ancestor of the frame you are standing on marked active. Descent otherwise removes the system
  from view, and a breadcrumb names a path without showing where Cressidium sits among Tarn and
  Cairn Drift. It is one HTML strip of real `<button>`s outside `#holo-world`, which is what
  makes a button legal — an SVG `<g role="button">` is not a button — and keeps the camera from
  dragging it. Locator nodes carry `data-frame`, never `data-loc` and never `class="node"`:
  `data-loc` would count them against the frame's membership in `check-all.cjs:282`, open a pane
  through the document delegate (`archive.js:205-213`), pan the camera to SYSTEM coordinates on
  the wrong frame (`intel.html:106`), and make them pinch targets. Activating one opens
  `holomap(bodyId)`, which is unambiguous because every principal body's home frame is
  `SYSTEM`. The active ancestor is found by walking the `frame` chain, not `parent`: `elysia`
  has no `parent` (`campaign.js:40`), so a `parent` walk from `industry` stops one frame short.
- **Cross-frame selection still works**, by a rule the records can test: `showUnit` descends when
  the selected site is **not in `members(current)`** (`archive.js:184`), and the target is that
  site's **home frame** (`frame` if set, `SYSTEM` otherwise). The earlier wording, "is not on
  this frame" read as "not in this frame's stack", was wrong in a case the data produces:
  standing on `elysia` and clicking `kessen` from a relations chip, `kessen`'s home frame
  `SYSTEM` *is* in the stack, so the frame would not change and `kessen` would not be drawn
  anywhere on it. Setting the path to the home frame fixes both, so `personnel.lastKnown` and
  in-orbit links land correctly.
- **`startLevel()` opens the frame the campaign is on** (`archive.js:155`): currently the
  theater because op 001 lands on `elysia`. Under frames that is `cressidium`. Honest caveat:
  the arrival stops there, because `intel.html:128-129` auto-selects `op.sites.insertion`
  (`dropzone`) and `showUnit` descends to the frame that draws it, so a visitor lands on the
  city frame, not on the planet. Slice 1 keeps that behaviour and the design claims no arrival
  view it does not produce. Auto-selecting `op.loc` instead is the alternative, deferred.

## Invariants

- Every record has one **home** frame: its `frame` value if set, `"SYSTEM"` otherwise. A
  satellite is additionally drawn on its parent's frame, so `members(F)` as defined above is the
  whole set a frame may draw. "One drawing frame" is a rule with a stated exception, not an
  approximation.
- Every frame id names a location that exists — except the root, `SYSTEM`, which no record names
  and which supplies its own `kind` and scale — and `members(F)` contains its subject for every
  descended frame, so a frame always has something to draw. A frame whose membership is only its
  subject renders that body alone, and only then has no `ENTER` chip.
- `frame` never names the location itself, and the frame graph is acyclic: the frame stack is
  finite and climbing always terminates at `SYSTEM`.
- `parent`, when set, names a location drawn on the same frame *or* a principal body of the
  frame above it (the satellite case). A **frameless** satellite whose parent sits on a different
  scale would be cross-scale on two frames while carrying a single `pinBearing`, which is a
  contradiction, so it throws: today `pell`, `kessen` and `harrow` all share their parent's
  scale, as do `dock`, `district` and `industry`.
- A kind with no renderer throws, and a kind with no key chip throws.
- No `CURRENT OP` marker anywhere while `ops[0]` is `PLANNED`/`UNBRIEFED`, ancestors included.
- `holomap(frameId)` stays pure: given `C`, returns the shape stated above and touches no DOM.
- Every non-`SYSTEM` frame carries the locator, and its body set is exactly the `SYSTEM`
  frame's principal bodies plus the star — principal only, so a moon that stops being a
  principal stops appearing there while keeping its place in `members` on its planet's frame.
- The locator marks the ancestor of the current frame active, found by walking the `frame` chain:
  exactly one when that chain contains a principal body, and none when it does not, because
  `pell`, `kessen` and `harrow` are accepted frame ids whose chains end at a non-principal. Never
  more than one. Standing on `elysia` marks `cressidium`; standing on `cressidium` marks
  `cressidium`.
- Activating a locator body opens that body's frame, so the locator is a route, not decoration,
  and its nodes carry `data-frame` and never `data-loc`.
- A planet's body markup references `assets/<id>-thumb.webp`; a station's does not use the disc
  clip.

Requires tests, all through the pure builder:

- Membership is the contract: for `SYSTEM` and every location id — 14 frames today, not the five
  the old map drew — the frame's `data-loc` set equals `members(F)` exactly, and the locator's
  set is separate. This generalises the `check-all.cjs:283-287` no-leak pair from two frames to
  every frame, and it finally has a membership to test against.
- `holomap("cressidium")` draws `cressidium` at centre, `pell` and `kessen` as full bodies and
  `elysia` as a pin; `holomap("SYSTEM")` draws `pell` and `kessen` each on its own ring about
  `cressidium` (radii 109.5 px and 167 px).
- `holomap("elysia")` draws `elysia` at centre with `rio` on a ring centred on `elysia`;
  `holomap("tarn")` draws `harrow`.
- An `ENTER <NAME>` chip appears iff `members(F)` holds more than the subject, so `tarn` has
  one and `pell` does not.
- An unknown frame id throws, and a two-node frame cycle throws, so climbing always terminates.
- A planet's markup references `assets/<id>-thumb.webp` and a station's does not use the disc
  clip.
- clipPath ids are unique across the world and the locator in one mounted frame.
- Every member id appears exactly once on its frame. A second node carrying the same `data-loc`
  is a leak rather than a satellite, which is what pins `rio` to one draw on `elysia` now that
  it carries both `frame: "elysia"` and `parent: "elysia"`.
- Every member's **placed** position — the `data-x`/`data-y` the builder emits, not its raw
  offset, which for a pin is the meaningless cross-frame subtraction above — lands inside the
  1000×480 viewBox with a margin, **centre and drawn radius both**, so a mostly-vertical body
  cannot overhang the edge while its centre passes the check. The radius is derived from the
  records rather than typed in, which a test can show by moving one record's coordinate and
  watching the radius change. On `elysia` that radius is set by `vsaf`, not by `rio` or the
  districts.
- The breadcrumb renders one button per ancestor frame walking the `frame` chain, and
  terminates at `SYSTEM`.
- Each frame's expected membership is recomputed in the test from the records, the way `idsOn`
  does at `check-all.cjs:279`, rather than by calling the builder's own `members()`, which would
  test the builder against itself.
- Every non-`SYSTEM` frame carries the locator listing the principal bodies with at most one
  marked active and exactly one whenever the frame's chain contains a principal body, and no
  locator node carries `data-loc`.
- The scale claim is a set equality, and it can fail: for `SYSTEM` and every location id, the
  members whose `level` differs from their frame's scale must be exactly the records carrying a
  `pinBearing`, pair by pair, with the expected set derived rather than typed; every frameless
  record is `level: "SYSTEM"`; and a `pinBearing` on a record that is not a cross-scale member of
  its frame fails too. A mistyped `level` that moved a record to the rim, or a second cross-scale
  member with no bearing of its own, fails here.
- `CURRENT OP` absence is only worth asserting if the test can make it fail. Op 001 is
  `PLANNED`/`UNBRIEFED`, so `curLoc` is empty and "absent everywhere" is true by construction
  (`check-all.cjs:293`). The test flips `D.ops[0].type` to a flown type **and** `D.ops[0].status` to
  `"ACTIVE"` for the duration, the way `check-all.cjs:387-393` flips `ely.visited`, because the
  ring's guard needs both (`archive.js:117`) and `type` alone leaves `status: "UNBRIEFED"` with
  `cur` still empty. The rule the assertion uses is **the deepest drawn node holding `cur`**, so
  ancestors are included but only that node carries the ring. It asserts the ring on `elysia`, on
  `cressidium` and on `SYSTEM` and nowhere else, then restores both fields. The locator is not
  `class="node"`, so the `check-all.cjs:296` regex cannot see it and it needs its own assertion
  that it carries no ring.
- Op 001's leg (`dock` → `elysia`) is drawn on exactly one frame, and zones are drawn on
  `elysia`.
- The grid label follows the frame's **kind**, from the one table above and not from `level`: a
  `PLANET` frame reads `ORBIT GRID`, a `CITY` frame reads `THEATER GRID`, a `DISTRICT` frame reads
  `GROUND GRID`, a `MOON` frame reads `ORBIT GRID`, and the root alone carries units,
  `SECTOR GRID · 50 U`, because a fitted frame draws a fixed 50 px texture at some other scale
  where a units label would be false.

## Slices

1. **The builder, and every frame it can produce** (the operator's stated first slice): frames
   keyed by subject, `members` and placement, the journey `SYSTEM` → `cressidium`, planets as
   art discs, satellites on rings, the breadcrumb, the locator, `level`'s wiring role retired, `check-all`'s
   map assertions rewritten per frame. **Slice 1 ships the records-driven builder for *every*
   frame, `elysia` and `industry` included, with their existing glyphs.** It has to: the
   migration re-frames five sites onto `elysia` and one onto `industry`, op 001's sites are
   `{insertion: dropzone, rendezvous: dock, extraction: rio}` (`campaign.js:146`), and
   `intel.html:128-129` auto-selects `dropzone` on load. A slice that builds only two frames
   throws or blanks the map on the page's own default selection.
2. **The city and the hull**: the `elysia` frame's treatment, `rio`'s hull silhouette rather than
   only its ring, and a file that lists personnel. The list is `C.pilots` whose mech has
   `stationed(m) === null`, and only while `L["rio"].name === C.meta.station` (`campaign.js:19`),
   labelled `RECORDED MUSTER` as that badge already is. The condition is the point: `showMech`
   lets a filed operation override the muster string (`archive.js:189`), so once op 001 is filed
   the string stops matching and the list empties rather than keeping a crew aboard a hull they
   have left. Not `stationed()` alone, which searches *mechs* in `filed` and returns null for
   every PLANNED op, and not "aboard", which nothing asserts.

## Files touched

- `archive.js`: `KINDS` gains renderers per kind, `LEVELS` becomes per-frame metadata derived
  from the subject's kind (head/sub/grid/aria), `holomap(frameId)` computes `members(F)` and the
  placement and returns `{world, key, grid, aria, crumbs, locator}`, `fitLevel` and the frame
  stack, `startLevel`, `hostsOf` reads `frame`, the breadcrumb and locator markup.
- `intel.html`: the `SYSTEM|THEATER` buttons and their delegate become the breadcrumb mount;
  the rest of the frame markup (`#holo-world`, `#holo-key`, pinch, hash sync) stays. The camera
  does **not** stay as it is: re-centring the subject shifts every node on a descended frame and
  `zoomTo` pans to raw `l.x*10, l.y*4.8` (`intel.html:52`, `:72`), so the builder emits each
  node's placed coordinates as `data-x`/`data-y` and `zoomTo` reads those, with zones and legs
  translated by the same subject offset.
- `campaign.js`: the data migration above; `level` kept as the coordinate scale, its wiring role
  gone.
- `style.css`: disc clip and rim, satellite scale, hardware silhouettes, breadcrumb buttons.
- `check-all.cjs`: the key list at `:53`, and the map block spanning `:266-404` replaced by
  per-frame membership, no-leak, satellite, art, cycle and locator assertions.

## What this breaks, listed so it is not discovered late

- `check-all.cjs:611` requires `data-level="SYSTEM"`/`"THEATER"` buttons, so it fails loudly once
  the breadcrumb replaces them.
- `style.css:88-89` (`.level`, `.holo.theater`) and the `archive.js:169` class toggle go dead
  silently rather than loudly.
- `archive.js:184`'s `l.level&&` goes silently false, the same pattern as `:676`, and `showUnit`
  is easy to miss in Files touched because it also carries the selection path.
- The `#tab-map` delegate (`intel.html:103`) must learn `[data-frame]`, and `[data-level]` goes with
  the buttons that used it, or every breadcrumb, locator and `ENTER` chip is inert while the
  builder output still looks right. The new check has to run **before** the
  `if(!e.target.closest("svg"))return` at `intel.html:105`, because the breadcrumb and the locator
  are HTML strips outside the svg.
- The comments at `campaign.js:22-24` and `:56` describe levels as drawings and go stale.
- `assets/nov-elysia.png` has no `-thumb.webp`, so using it as the disc means shipping 2.2 MB or
  running the `check-all.cjs:80` regen line; the thumb path derives from `l.img`, as
  `check-all.cjs:79` does, not from the id.
- The UI frame stack has no state of its own: it is the `frame` chain from the current frame, so
  `frame` (`archive.js:110`) stays the single source and a second stack would only drift.

- `check-all.cjs:53` requires `level`, which **stays**, and `:65` reports any `null` key as missing — which is why `frame` and `pinBearing` cannot join that list, and why both get their own optional-type check instead.
- The map block runs `:266-404`, not `:266-288`, and all of it is affected: `:283-287` the
  no-leak pair, `:288` `SYSTEM VIEW`, `:303-306` the kind/label pair, `:318-320` the
  `Theater`/`Sector holomap` aria and grid names, `:330-337` the site chips, which re-key from
  `level==="SYSTEM"` to the root frame's members — so `NOV ELYSIA SITE` **leaves** `SYSTEM`,
  because `elysia` is a member of `cressidium` and is drawn there as a pin. `:339-340` `ENTER THEATER` (renamed `ENTER <NAME>`), `:342-345` the same-level
  `level`/`parent`/`frame` checks, `:387-393` `PLANNED LEG` and `TRAVELLED` through
  `holomap("THEATER")`.
- `check-all.cjs:676` is the dangerous one: `if (area.level && ...)` goes silently false once
  `level` stops wiring frames, so the sites-same-frame check stops running and reports nothing. It is
  replaced by a frame-chain check that reports a missing frame rather than skipping one.
- `archive.js:113` throws for anything but `SYSTEM`/`THEATER`.
- `archive.js:120-121` draws a leg only where both ends are on the frame, and `:125` gates zones
  on `zone.frame === F`. After the migration `dock` is on `industry` and `elysia` is on
  `cressidium`, so no frame holds both ends and op 001's leg disappears. Zones move to `elysia`,
  where their theatre coordinates belong, and a leg is drawn per frame between the frame-local
  ancestor of each endpoint — the hard-coded origin `"dock"` at `archive.js:120` becomes the
  endpoint's frame-local ancestor, and a leg whose ends collapse to the same ancestor is skipped
  rather than drawn at zero length, which is what happens on `SYSTEM` and `cressidium`.
- `archive.js:155` `startLevel()` reads `level`.
- `intel.html:40` renders the two level buttons; `intel.html:103` binds their delegate;
  `intel.html:128-129` auto-selects the insertion site and therefore descends past the start
  frame on load.
- The heads `SECTOR HOLOMAP` / `THEATER HOLOMAP` (`archive.js:108`) are keyed by level band and
  become per-frame names.
- **Coordination:** the map assertions live in `check-all.cjs`, which the parallel #26 session
  declares as its gate file. The map block is self-contained, but the change has to be flagged
  before it is pushed.

## Risks

- **Satellite scale is not a scale.** A moon drawn small on the system frame is a legibility
  convention, not a distance. The frame's `aria` and the grid legend both carry the phrase
  `NOT DISTANCE`, which the test asserts rather than the whole sentence, so the map does not trade
  one lie (equal weights) for another.
- **The art is painted at dossier resolution**, not as top-down body plates. A clipped disc of
  `cressidium.png` may read as a cropped illustration rather than a world. This is the one
  place where the operator's own answer applies: art first, and image generation later for the
  bodies the art does not carry.
- **Frames multiply assertions.** Every frame carries membership plus rings, a bigger gate
  surface than two frames, and the honest-parent rules from #25 have to keep holding per frame.
- **The locator can crowd a narrow screen.** Repeated art at small size in a strip is exactly
  what breaks at phone width, so the locator must collapse to markers-only below the small
  breakpoint. That needs a probe, not an assertion.
- **Three claims only a browser can settle.** The transition cut (`archive.js:162-164`) returns
  early under the stub because `el("holo-world")` is null (`check-all.cjs:270`); the clipPath's
  visual result and the pinch need layout the stub does not have. Each gets a probe and is
  reported as a probe, never as a passing test. The one mechanical thing that *is* asserted
  here is that clipPath ids are unique across the world and the locator.
- **The plausible-but-ungrounded frame**: nothing in prose places a moon around Tarn beyond
  `harrow`, so frames must be generated from the records, never hand-listed per frame, or the
  next location arrives undrawn.

## Open questions

- **How far does the ground go below `dock`?** Deferred; `dock` has no children today.
- **Resolved at review, no longer open:** the star is drawn and declared invented (above);
  the city pin stays, so `elysia` is both a marker on `cressidium` and a frame of its own.