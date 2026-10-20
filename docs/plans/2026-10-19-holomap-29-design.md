---
ticket: "#29"
title: "Holomap: real bodies, and a descent from system to ground"
date: "2026-10-19"
revision: 3
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
  it (`archive.js:133`).
- Every location already carries art, at `assets/<id>.png`, and the ids match the filenames
  exactly: `cressidium.png`, `pell.png`, `kessen.png`, `tarn.png`, `harrow.png`, `cairn.png`,
  `elysia.png`, `district.png`, `industry.png`, `dock.png`, `dropzone.png`, `rio.png`,
  `vsaf.png`. **No new art is required for the first slice.**
- The location key list check-all enforces today is `["name", "kind", "x", "y", "level"]`
  (`check-all.cjs:53`), and the two-level frame assertions are `check-all.cjs:266-288`.

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

### Frames after migration

| frame | draws | why |
|---|---|---|
| `SYSTEM` | cressidium, tarn, cairn as principal bodies, plus pell, kessen, harrow as satellites on their parent's ring | the star system, with its worlds and their hardware |
| `cressidium` | cressidium as the frame's own body, pell and kessen as full bodies, elysia as a city pinned to the planet | the planet, its moon, its station, and the city on its surface |
| `elysia` | district, industry, dropzone, vsaf as ground markers; rio as an orbital on a ring above the city | the city, its districts, and the hull in orbit over it |
| `industry` | dock | the industrial district and the FOB inside it |

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
| `PLANET` | art disc: `assets/<id>.png` clipped to a circle, with a rim and a shadow terminator | the operator's primary ask; a disc with art reads as a world |
| `MOON` | art disc at satellite radius; the same art at full size on its planet's frame | one asset, two scales |
| `STATION` | art plate inside a hex silhouette | a station is not a ball |
| `WRECK FIELD` | art plate inside a jagged silhouette with its existing dashed field | stays a wreck field |
| `ORBITAL` | art plate in a hull silhouette, on its orbit ring | the Rio Grande reads as a hull, not a world |
| `CITY`, `DISTRICT`, `FOB`, `ZONE` | the existing `KINDS` glyphs, unchanged | these are ground symbols on a plan view; the glyph is right for them |

The builder must throw on a kind with no renderer, exactly as it throws on a kind with no
marker today (`archive.js:118`). Silence is the failure mode being removed.

### Rendering the art without shipping a raster mask

The art is clipped by an SVG `clipPath` per body, so nothing is masked at build time and no
new asset format enters the repo. The `<image>` sits inside the clip, the rim and terminator
are two more SVG shapes over it, and the whole body is one `<g>` so it keeps the `data-loc`
and `class` attributes the camera, the pane and the keyboard path already use. A body that
has any child location carries `class="body"` plus an `ENTER <NAME>` chip in its pane, so the
descent is keyboard-reachable and assertable.

### The primary star, drawn and declared invented

The operator's call at review: the system frame draws a star. It is the one drawn thing here
that no record supports, so it is declared rather than smuggled in.

- It is **drawn procedurally in SVG**, not from art, because no asset exists and none is
  wanted yet.
- It is **not a location**: no `data-loc`, not selectable, no file, no key chip pretending
  otherwise. Its `aria` names it as the primary, drawn for orientation.
- The key carries `STAR · NO FILE` so a reader is told outright, and the frame's legend keeps
  saying the satellites' sizes are legibility, not distance.
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
  `UP ONE LEVEL` and lives in the breadcrumb instead of the key.
- **The system stays visible.** Every non-`SYSTEM` frame carries a small **system locator**: the
  system's principal bodies and the declared star, drawn compact, with the ancestor of the frame
  you are standing on marked active. Descent otherwise removes the system from view, and a
  breadcrumb names a path without showing where Cressidium sits among Tarn, Cairn Drift and their
  hardware. Each body in the locator is a real `<button>`; activating one sets the frame stack to
  that frame. It is generated by the pure builder from the same records, so it adds no data.
- **Cross-frame selection still works**: `showUnit` already descends when the selected site is
  not on the current frame (`archive.js:184`). With frames keyed by subject, "is not on this
  frame" becomes "is not in this frame's stack", and the rule sets the whole path rather than
  one level, so `personnel.lastKnown` and in-orbit links land correctly.
- **`startLevel()` opens the frame the campaign is on** (`archive.js:153`): currently the
  theater because op 001 lands on `elysia`. Under frames that is the `cressidium` frame, since
  `elysia` now hangs off the planet — the operator asked to arrive looking at the planet.

## Invariants

- Every location has exactly one drawing frame: its `frame` value if set, `"SYSTEM"` otherwise.
- Every non-`SYSTEM` frame id names a location that exists.
- `frame` never names the location itself, and the frame graph is acyclic: the frame stack is
  finite and climbing always terminates at `SYSTEM`.
- `parent`, when set, names a location drawn on the same frame *or* a principal body of the
  frame above it (the satellite case).
- A kind with no renderer throws, and a kind with no key chip throws.
- No `CURRENT OP` marker anywhere while `ops[0]` is `PLANNED`/`UNBRIEFED`, ancestors included.
- `holomap(frameId)` stays pure: given `C`, returns `{world, key, grid, aria}` and touches no DOM.
- Every non-`SYSTEM` frame carries the locator, and the locator's body set is exactly the
  `SYSTEM` frame's principal bodies plus the declared star. A body that stops being a principal
  body stops appearing in it.
- The locator marks exactly one active body: the ancestor of the current frame. Standing on
  `elysia` marks `cressidium`; standing on `cressidium` marks `cressidium`.
- Activating a locator body sets the frame stack to that body's frame, so the locator is a route,
  not decoration.
- A planet's body markup contains an `assets/<id>.png` reference; a station's does not use the
  disc clip.

Requires tests, all through the pure builder:

- Each frame draws exactly its own locations and leaks no other frame's ids — the existing
  `check-all.cjs:283-287` no-leak pair, per frame, over four frames instead of two.
- `holomap("cressidium")` draws `pell` and `kessen` as full bodies and `elysia` as a city.
- `holomap("SYSTEM")` draws `pell` and `kessen` as satellites on `cressidium`'s ring.
- `holomap("elysia")` draws `rio` with an orbit ring whose centre is `elysia`.
- `holomap("SYSTEM")` planet markup references `assets/cressidium.png` and does not use the
  disc clip for `kessen`.
- An unknown frame id throws; a frame id naming a non-location throws; a two-node frame cycle
  throws.
- The breadcrumb renders one button per ancestor frame and terminates at `SYSTEM`.
- No frame contains `CURRENT OP` while op 001 is unbriefed.
- Every non-`SYSTEM` frame's markup carries the locator listing the principal bodies, and marks
  exactly the ancestor of that frame as active.
- The locator carries no `CURRENT OP` claim while op 001 is unbriefed.

## Slices

1. **System and planets** (the operator's stated first slice): frames keyed by subject, the
   journey `SYSTEM` → `cressidium`, planets as art discs, satellites on rings, breadcrumb, the
   system locator on the descended frame, `level` retired, `check-all`'s map assertions
   rewritten per frame.
2. **The city and the hull**: the `elysia` frame — districts, `dropzone`, `vsaf`, and `rio` on
   its ring with a file that lists the personnel aboard. Crew comes from the records that
   already say where they are (`stationed()`), not from a new field.
3. **The ground**: the `industry` frame and `dock` as a POI, so the FOB is reachable by
   descent rather than only as a badge.

## Files touched

- `archive.js`: `KINDS` gains renderers per kind, `LEVELS` becomes per-frame metadata derived
  from the subject (head/sub/grid/aria), `holomap(frameId)` resolves a frame's membership,
  `fitLevel` and the frame stack, `startLevel`, `hostsOf` reads `frame`, the breadcrumb markup.
- `intel.html`: the `SYSTEM|THEATER` buttons and their delegate become the breadcrumb mount;
  the rest of the frame markup (`#holo-world`, `#holo-key`, the camera, pinch, hash sync) stays.
- `campaign.js`: the data migration above; `level` removed from all thirteen records.
- `style.css`: disc clip and rim, satellite scale, hardware silhouettes, breadcrumb buttons.
- `check-all.cjs`: the key list at `:53`, and `:266-288`'s two-level assertions replaced by
  per-frame membership, no-leak, satellite, art and cycle assertions.

## What this breaks, listed so it is not discovered late

- `check-all.cjs:53` requires `level`, which is retired.
- `check-all.cjs:266-288` asserts exactly two frames, their membership, and `SYSTEM VIEW`.
- `archive.js:113` throws for anything but `SYSTEM`/`THEATER`.
- `archive.js:153` `startLevel()` reads `level`.
- `intel.html:40` renders the two level buttons; `intel.html:103` binds their delegate.
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
- **The plausible-but-ungrounded frame**: nothing in prose places a moon around Tarn beyond
  `harrow`, so frames must be generated from the records, never hand-listed per frame, or the
  next location arrives undrawn.

## Open questions

- **How far does the ground go below `dock`?** Deferred; `dock` has no children today.
- **Resolved at review, no longer open:** the star is drawn and declared invented (above);
  the city pin stays, so `elysia` is both a marker on `cressidium` and a frame of its own.