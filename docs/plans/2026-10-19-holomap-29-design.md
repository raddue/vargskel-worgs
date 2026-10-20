---
ticket: "#29"
title: "Holomap: real bodies, and a descent from system to ground"
date: "2026-10-19"
revision: 4
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
  split out (`archive.js:156`, `:175`, `:184`) and exported (`archive.js:445`).
- `LEVELS` (`archive.js:108`) holds exactly two frames, `SYSTEM` and `THEATER`.
- Orbit rings already exist and are already honest: only `MOON`, `STATION` and `ORBITAL` with
  a parent drawn on the same frame get one (`archive.js:129`).
- The current-op ring is already guarded: op 001 is `type: "PLANNED"` / `status: "UNBRIEFED"`,
  so `cur` is empty and nothing claims live tracking (`archive.js:118`). This guard is correct
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
whose `frame` is absent is drawn on `"SYSTEM"`. `level` is retired: "which frame draws me" is
`frame`'s job, and "do I orbit something" is `parent`'s job, so a third field asserting the
same thing can only drift out of step with them.

Satellites are the one place a body is drawn on two frames, deliberately: a moon is a small
attached body on its planet's ring at the system frame, and a full body on its planet's own
frame. That is what makes "see the planets and the moons and the stations" true at the top,
and what gives the descent somewhere to go.

### Membership and placement

`members(F)` is the exact set of ids a frame draws. It has three parts and no fourth:

- **the subject**: `F` itself, drawn at the frame's centre. Every frame draws its own subject,
  `elysia` included, so a ring centred on the subject always has a centre.
- **framed children**: every record with `frame === F`.
- **satellites**: every record with no `frame` whose `parent === F`.

`SYSTEM` is the root and has no subject: it draws every record with no `frame`, so
`cressidium`, `tarn` and `cairn` sit as principals and `pell`, `kessen` and `harrow` ride
their parents' rings.

A record's `x,y` is a SYSTEM-frame coordinate and it is the only coordinate a record has.
Placement is one rule, not four:

- On `SYSTEM`, a record is placed at its own `x,y`; a satellite sits on its parent's ring at
  the angle of its own offset from that parent.
- On a descended frame `F`, the subject sits at the centre and every other member sits at its
  own offset from the subject, unchanged. Nothing is scaled and nothing is re-projected,
  because every coordinate is already in the frame's units.
- A ring is drawn around the parent at the radius of the child riding it, whether the parent is
  the frame's subject (`rio` over `elysia`) or a satellite (`pell` over `cressidium`).
- A **pin** is a framed child at its own offset from the subject. `elysia` sits at its offset
  from `cressidium`, which is where a disc's rim puts it, and the disc is sized so that offset
  is on it.

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

Three fields move, one is retired. Every change is a re-value or an addition; no id changes.

- **`level` retires** everywhere. `check-all.cjs:53`'s key list drops it and gains `frame`.
- **`frame` is set or re-valued** so the frame that draws each site is explicit:
  - `district`, `industry`, `dropzone` → `frame: "elysia"` (ground in the city's frame)
  - `dock` → `frame: "industry"` (FOB inside the industrial district; its `parent` already says `industry`)
  - `vsaf` → `frame: "elysia"` (was `cressidium`; the advance is on the city's ground, not the planet's)
  - `rio` → `frame: "elysia"` (was `cressidium`; the operator asked for the hull *above Nov Elysia*)
  - `elysia` keeps `frame: "cressidium"`, now read as the frame id it always was
  - `cressidium`, `tarn`, `cairn`, `pell`, `kessen`, `harrow` keep no `frame` (root frame)
- **`rio.parent` → `"elysia"`** so the orbit ring draws. Today `rio.parent` is absent, so the
  `ORBITAL` never gets the ring `archive.js:129` would give it; the hull is drawn floating.
  With this, `rio` is the one body that is both a `parent` child and on a descended frame.
- `pell`, `kessen`, `harrow` keep `parent` and keep no `frame`: they are satellites at the top
  and full bodies when their planet is opened.

### Body rendering by kind

`KINDS` keeps its glyphs only for things that are legitimately ground symbols. Worlds become
art, hardware becomes art on its own silhouette, and the glyph vocabulary stays for plan-view
markers.

| kind | rendered as | note |
|---|---|---|
| `PLANET` | art disc: `assets/<id>-thumb.webp` clipped to a circle, with a rim and a shadow terminator (`nov-elysia.png` is the Cressidium candidate for orbit art) | the operator's primary ask; a disc with art reads as a world |
| `MOON` | art disc at satellite radius; the same art at full size on its planet's frame | one asset, two scales |
| `STATION` | art plate inside a hex silhouette | a station is not a ball |
| `WRECK FIELD` | art plate inside a jagged silhouette with its existing dashed field | stays a wreck field |
| `ORBITAL` | art plate in a hull silhouette, on its orbit ring | the Rio Grande reads as a hull, not a world |
| `CITY`, `DISTRICT`, `FOB`, `ZONE` | the existing `KINDS` glyphs, unchanged | these are ground symbols on a plan view; the glyph is right for them |

The builder must throw on a kind with no renderer, exactly as it throws on a kind with no
marker today (`archive.js:118`). Silence is the failure mode being removed.

### Heads, grids and aria per frame

The frame's head, sub-head, grid label and `aria` derive from the subject's kind rather than
from a level band (`archive.js:108` today). A `PLANET` frame reads `ORBIT GRID`; a `CITY`
frame reads `THEATER GRID · 10 U` and keeps the city's existing theatre scale, because its
children's coordinates are that scale; `SYSTEM` keeps `SECTOR HOLOMAP`. No new field: the kind
is the field.

### Rendering the art without shipping a raster mask

The art is clipped by an SVG `clipPath` per body, so nothing is masked at build time and no
new asset format enters the repo. The `<image>` references `assets/<id>-thumb.webp` and sits
inside the clip, the rim and terminator are two more SVG shapes over it, and the whole body is
one `<g>` so it keeps the `data-loc` and `class` attributes the camera, the pane and the
keyboard path already use. clipPath ids are unique across the world and the locator within a
mounted frame, and that is asserted, because duplicate ids silently cross-wire two clips. A body that
has any child location carries `class="body"` plus an `ENTER <NAME>` chip in its pane, so the
descent is keyboard-reachable and assertable.

### The primary star, drawn and declared invented

The operator's call at review: the system frame draws a star. It is the one drawn thing here
that no record supports, so it is declared rather than smuggled in.

- It is **drawn procedurally in SVG**, not from art, because no asset exists and none is
  wanted yet. Its position is fixed at `x: 8, y: 50` (the frame's upper left, clear of
  `cressidium` at 30,52 and `tarn` at 86,24) — a `ponytail:` comment in the builder names it as
  an invented constant, upgradeable to a record if the star ever needs a file.
- It is **not a location**: no `data-loc`, not selectable, no file, no key chip pretending
  otherwise. Its `aria` names it as the primary, drawn for orientation, and its node carries
  `role="img"` because an `aria-label` on a bare `<g>` is ignored by several screen readers.
- The key carries `STAR · NO FILE` so a reader is told outright, and the frame's legend keeps
  saying the satellites' sizes are legibility, not distance. `check-all.cjs:303`'s kind list
  must exclude `STAR`, or its own "no node carries this kind" check at `:306` trips on it.
- Invariant: every drawn body either names a location or is the star; no third case, and no
  drawn body without a file may carry `data-loc`.

Adding a real record for it later is additive: the same node gains a `data-loc` and a file.

## Interaction

- **Frames swap.** Descending renders the target frame in place of the current one, the same
  way `SYSTEM`/`THEATER` swap today: `fitLevel(frameId)` stays the single switch point
  (`archive.js:156`), and #25's rule stands — the camera transition is disabled, the transform
  reset, the body swapped, the transition restored on the next frame.
- **The frame stack is the state.** `UI` holds the descent path, `[..., "cressidium", "elysia"]`,
  so climbing is exact and a link to a deeper body can set the whole path at once.
- **The breadcrumb is the way out**, replacing the two `SYSTEM|THEATER` buttons in
  `intel.html:40` and their delegate at `intel.html:103`: `CRESSIDIUM SYSTEM › CRESSIDIUM ›
  NOV ELYSIA`, one real `<button>` per ancestor, keyboard-reachable. The `SYSTEM VIEW` key
  chip in the theater frame (`archive.js:139`, asserted at `check-all.cjs:288`) becomes
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
- **Cross-frame selection still works**: `showUnit` already descends when the selected site is
  not on the current frame (`archive.js:184`). With frames keyed by subject, "is not on this
  frame" becomes "is not in this frame's stack", and the rule sets the whole path rather than
  one level, so `personnel.lastKnown` and in-orbit links land correctly.
- **`startLevel()` opens the frame the campaign is on** (`archive.js:155`): currently the
  theater because op 001 lands on `elysia`. Under frames that is `cressidium`. Honest caveat:
  the arrival stops there, because `intel.html:127-128` auto-selects `op.sites.insertion`
  (`dropzone`) and `showUnit` descends to the frame that draws it, so a visitor lands on the
  city frame, not on the planet. Slice 1 keeps that behaviour and the design claims no arrival
  view it does not produce. Auto-selecting `op.loc` instead is the alternative, deferred.

## Invariants

- Every record has one **home** frame: its `frame` value if set, `"SYSTEM"` otherwise. A
  satellite is additionally drawn on its parent's frame, so `members(F)` as defined above is the
  whole set a frame may draw. "One drawing frame" is a rule with a stated exception, not an
  approximation.
- Every frame id names a location that exists, and `members(F)` always contains its subject, so
  a frame always has something to draw. A frame whose membership is only its subject renders
  that body alone, and only then has no `ENTER` chip.
- `frame` never names the location itself, and the frame graph is acyclic: the frame stack is
  finite and climbing always terminates at `SYSTEM`.
- `parent`, when set, names a location drawn on the same frame *or* a principal body of the
  frame above it (the satellite case).
- A kind with no renderer throws, and a kind with no key chip throws.
- No `CURRENT OP` marker anywhere while `ops[0]` is `PLANNED`/`UNBRIEFED`, ancestors included.
- `holomap(frameId)` stays pure: given `C`, returns `{world, key, grid, aria}` and touches no DOM.
- Every non-`SYSTEM` frame carries the locator, and its body set is exactly the `SYSTEM`
  frame's principal bodies plus the star — principal only, so a moon that stops being a
  principal stops appearing there while keeping its place in `members` on its planet's frame.
- The locator marks exactly one active body: the ancestor of the current frame, found by
  walking the `frame` chain. Standing on `elysia` marks `cressidium`; standing on `cressidium`
  marks `cressidium`.
- Activating a locator body opens that body's frame, so the locator is a route, not decoration,
  and its nodes carry `data-frame` and never `data-loc`.
- A planet's body markup references `assets/<id>-thumb.webp`; a station's does not use the disc
  clip.

Requires tests, all through the pure builder:

- Membership is the contract: for each of the five frames, the frame's `data-loc` set equals
  `members(F)` exactly, and the locator's set is separate. This generalises the
  `check-all.cjs:283-287` no-leak pair from two frames to every frame, and it finally has a
  membership to test against.
- `holomap("cressidium")` draws `cressidium` at centre, `pell` and `kessen` as full bodies and
  `elysia` as a pin; `holomap("SYSTEM")` draws `pell` and `kessen` on `cressidium`'s ring.
- `holomap("elysia")` draws `elysia` at centre with `rio` on a ring centred on `elysia`;
  `holomap("tarn")` draws `harrow`.
- An `ENTER <NAME>` chip appears iff `members(F)` holds more than the subject, so `tarn` has
  one and `pell` does not.
- An unknown frame id throws, and a two-node frame cycle throws, so climbing always terminates.
- A planet's markup references `assets/<id>-thumb.webp` and a station's does not use the disc
  clip.
- clipPath ids are unique across the world and the locator in one mounted frame.
- The breadcrumb renders one button per ancestor frame walking the `frame` chain, and
  terminates at `SYSTEM`.
- Every non-`SYSTEM` frame carries the locator listing the principal bodies with exactly one
  marked active, and no locator node carries `data-loc`.
- No frame contains `CURRENT OP` while op 001 is unbriefed, locator included.
- Op 001's leg (`dock` → `elysia`) is drawn on exactly one frame, and zones are drawn on
  `elysia`.
- The grid label follows the subject's kind: a `PLANET` frame reads `ORBIT GRID`, a `CITY`
  frame reads `THEATER GRID · 10 U`.

## Slices

1. **The builder, and every frame it can produce** (the operator's stated first slice): frames
   keyed by subject, `members` and placement, the journey `SYSTEM` → `cressidium`, planets as
   art discs, satellites on rings, the breadcrumb, the locator, `level` retired, `check-all`'s
   map assertions rewritten per frame. **Slice 1 ships the records-driven builder for *every*
   frame, `elysia` and `industry` included, with their existing glyphs.** It has to: the
   migration re-frames five sites onto `elysia` and one onto `industry`, op 001's sites are
   `{insertion: dropzone, rendezvous: dock, extraction: rio}` (`campaign.js:146`), and
   `intel.html:127-128` auto-selects `dropzone` on load. A slice that builds only two frames
   throws or blanks the map on the page's own default selection.
2. **The city and the hull**: the `elysia` frame's treatment — `rio`'s ring and hull silhouette,
   and a file that lists personnel. Crew comes from `C.meta.station === "UNS RIO GRANDE"`
   (`campaign.js:19`), the record that already places them, labelled `RECORDED MUSTER` as that
   badge already is. Not `stationed()`, which searches *mechs* in `filed` and returns null for
   every PLANNED op, and not "aboard", which nothing asserts.
3. **The ground**: `dock` as a POI on the `industry` frame, so the FOB is reachable by descent
   rather than only as a badge.

## Files touched

- `archive.js`: `KINDS` gains renderers per kind, `LEVELS` becomes per-frame metadata derived
  from the subject's kind (head/sub/grid/aria), `holomap(frameId)` computes `members(F)` and the
  placement and returns `{world, key, grid, aria, crumbs, locator}`, `fitLevel` and the frame
  stack, `startLevel`, `hostsOf` reads `frame`, the breadcrumb and locator markup.
- `intel.html`: the `SYSTEM|THEATER` buttons and their delegate become the breadcrumb mount;
  the rest of the frame markup (`#holo-world`, `#holo-key`, the camera, pinch, hash sync) stays.
- `campaign.js`: the data migration above; `level` removed from all thirteen records.
- `style.css`: disc clip and rim, satellite scale, hardware silhouettes, breadcrumb buttons.
- `check-all.cjs`: the key list at `:53`, and the map block spanning `:266-404` replaced by
  per-frame membership, no-leak, satellite, art, cycle and locator assertions.

## What this breaks, listed so it is not discovered late

- `check-all.cjs:53` requires `level`, which is retired.
- The map block runs `:266-404`, not `:266-288`, and all of it is affected: `:283-287` the
  no-leak pair, `:288` `SYSTEM VIEW`, `:303-306` the kind/label pair, `:318-320` the
  `Theater`/`Sector holomap` aria and grid names, `:330-337` the `host.level==="SYSTEM"` site
  chips, `:339-340` `ENTER THEATER` (renamed `ENTER <NAME>`), `:342-345` the same-level
  `level`/`parent`/`frame` checks, `:392-397` `PLANNED LEG` and `TRAVELLED` through
  `holomap("THEATER")`.
- `check-all.cjs:676` is the dangerous one: `if (area.level && ...)` goes silently false once
  `level` is retired, so the sites-same-frame check stops running and reports nothing. It is
  replaced by a frame-chain check that reports a missing frame rather than skipping one.
- `archive.js:113` throws for anything but `SYSTEM`/`THEATER`.
- `archive.js:120-121` draws a leg only where both ends are on the frame, and `:124` gates zones
  on `level==="THEATER"`. After the migration `dock` is on `industry` and `elysia` is on
  `cressidium`, so no frame holds both ends and op 001's leg disappears. Zones move to `elysia`,
  where their theatre coordinates belong, and a leg is drawn per frame between the frame-local
  ancestor of each endpoint.
- `archive.js:155` `startLevel()` reads `level`.
- `intel.html:40` renders the two level buttons; `intel.html:103` binds their delegate;
  `intel.html:127-128` auto-selects the insertion site and therefore descends past the start
  frame on load.
- The heads `SECTOR HOLOMAP` / `THEATER HOLOMAP` (`archive.js:108`) are keyed by level band and
  become per-frame names.
- **Coordination:** the map assertions live in `check-all.cjs`, which the parallel #26 session
  declares as its gate file. The map block is self-contained, but the change has to be flagged
  before it is pushed.

## Risks

- **Satellite scale is not a scale.** A moon drawn small on the system frame is a legibility
  convention, not a distance. The frame's `aria` and grid legend must say so, or the map trades
  one lie (equal weights) for another.
- **The art is painted at dossier resolution**, not as top-down body plates. A clipped disc of
  `cressidium.png` may read as a cropped illustration rather than a world. This is the one
  place where the operator's own answer applies: art first, and image generation later for the
  bodies the art does not carry.
- **Frames multiply assertions.** Four frames of membership plus rings is a bigger gate surface
  than two, and the honest-parent rules from #25 have to keep holding per frame.
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