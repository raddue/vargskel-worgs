# 3D holomap browser evidence

## Loading and orbital heading followup

`loading.png` captures a deliberately stalled renderer-module request: themed
LOADING status visible, SVG hidden, aria-busy true, viewport height reserved.
Releasing the request produces state ready and aria-busy false only after assets
load and the first scene render. Failing the request returns SVG and clears busy.
A 12-second watchdog also restores SVG if bootstrap stalls. Controller tests cover
success, failure, timeout, late completion and untouched markup before bootstrap.
With JavaScript fully disabled this existing data-driven page still shows its
noscript notice; it never enters loading or conceals anything additionally.

`rio-heading.png` shows the hull aligned to its orbital tangent. Inspection of the
GLB establishes +Z as its nose axis. Cardinal-phase regression tests check this
axis against (-sin(phase), 0, cos(phase)); the quaternion is assigned afresh at
model load and each tick, using the same phase as position. Pausing or reduced
motion freezes both. No campaign or other-model orientation changed.


## Navigation direction correction

Navigation now derives inward/outward movement from the presentation hierarchy,
including separate Cressidium orbit and surface views. Ancestor and cross-branch
moves pull away; descendant moves approach. UP, ancestor breadcrumbs, keyboard
`[`/Escape and browser Back use the same flight path. Reduced motion still cuts.

Chromium camera-distance probe (world units, sampled about 350 ms into flight):
- Orbit to surface: 5.891 → 4.202, inward.
- Surface UP to orbit: 2.753 → 3.937, outward.
- Browser Back: 3.810 mid-flight, outward.
- Keyboard UP: 3.848 mid-flight, outward.

OrbitControls damping/clamps no longer overwrite the scripted camera during
flight; the destination rebuild restores its normal fit and control limits.

## Procedural city iteration

City and industrial views now use bounded deterministic parcels along three bent
boulevards and diagonal connecting streets. Rectangular warehouses, L/U compounds
and stepped towers share box geometry; roofs are solid, with restrained per-instance
shade variation. Irregular parks reserve open space, and an unnamed curved shoreline
borders the expanded table coverage. Raised POI pins retain canonical anchors. Art
thumbnails remain in dossiers. Rio Grande is absent from city geometry but stays
selectable in planetary orbit; its existing deep link still opens its dossier.

`JAMMER SITE / CURRENT TARGET` is noninteractive text above a distinct tall
commercial cluster near the industrial approach. It has no canonical ID, dossier
or deep link. This is the approved current-encounter visibility boundary. No
future encounter metadata or private source text was added. All invented street,
building and shoreline bearings are explicitly schematic; campaign.js is unchanged.

Fresh browser evidence: `corrected-{desktop,phone}-city.png` and
`city-{desktop,phone}-industry.png`. Desktop/phone orbit, globe surface, city,
industrial descent and leaf dossiers passed with reduced motion, no uncaught
exceptions and no horizontal overflow. Context loss showed SVG; restoration
returned to 3D. Offline reload followed by city navigation rendered procedural buildings
without Rio. Layout tests enforce footprint/form/rotation diversity, broad extents,
reserved parks and deterministic output rather than claiming visual realism. Forced no-WebGL load showed SVG. Device GPU performance, physical
touch input and screen-reader speech remain untested.

## Corrected orbit-first interaction

Fresh screenshots: `corrected-{desktop,phone}-{orbit,surface,city}.png`.
Fresh entry opens Cressidium orbit with Cressidium, Pell, Kessen and Rio Grande.
Rio is projected into this presentation only; campaign.js remains unchanged.
A single click on Cressidium enters a rotatable surface globe. Nov Elysia’s pin
turns with the globe mesh; selecting it enters the city schematic. Parent
records have a separate INFO action. Leaves open their existing dossier.

Fresh Chromium probes at 1440×900 and 390×844 confirmed all three views, no
horizontal overflow and no uncaught exceptions. Industry then FOB Saber opened
the leaf dossier; UP returned to Elysia. Cold deep links to dock, rio and
cressidium retained their dossiers and canonical home frames. A 100-pixel drag
that returned to its starting point did not descend. Browser Back returned from
surface to orbit. Keyboard target cycling moved focus to Pell.

The presentation adapter and regression checks are `holomap-view.js` and
`tools/holomap-navigation.test.cjs`. Offline cache version v4 includes the adapter;
75 files total about 4.75 MB raw, under 5 MiB. Hardware touch and screen-reader
validation remain unperformed. Earlier screenshots below describe the first pass.


Chromium headless, SwiftShader WebGL2. These are browser probes, not layout tests.
Screenshots cover SYSTEM, Cressidium orbit, Nov Elysia and industry containing
FOB Saber at 1440×900 and 390×844. Reduced motion freezes the views for capture.
`no-webgl.png` shows the original SVG after forced context-creation failure.

Observed:
- All four frames render; no browser console errors during capture.
- No horizontal document overflow at either viewport.
- Selecting Cressidium opens its existing dossier and writes `#map/cressidium`.
- DESCEND reaches Cressidium; keyboard `[` returns to SYSTEM.
- Forced context loss exposes SVG; restoration rebuilds 3D successfully.
- Service worker caches 74 entries. Offline reload renders 3D.
- Forced no-WebGL load leaves the SVG visible and 3D host hidden.

Ground treatment uses a schematic holo-table, existing positions, raised pins and
square thumbnail cards. It does not reinterpret perspective artwork as terrain.
Rio Grande is lifted above the ground on its orbital ring. Globe textures use
only the prepared 2:1 maps.

Canonical differences retained: op 001 is PLANNED/DEPLOYED, not UNBRIEFED.
No current-operation ring is shown. Industry is the deepest navigable frame;
FOB Saber is its leaf site. No campaign data changed.

Payload measured with gzip level 9, not a claim about the production server's
Content-Encoding: about 4.75 MB raw precache, below the approved 5 MiB ceiling.
New renderer/assets/vendor total about 889 KB gzip; excluding three.js and its
addons, about 651 KB gzip. Vendor alone is 238,486 bytes gzip.

Known gaps and limits:
- Hardware touch/pinch, screen-reader output and mobile GPU performance need
  device testing; SwiftShader screenshots do not establish phone frame rate.
- Label collision avoidance uses bounded vertical displacement. Dense views
  remain schematic, and displaced labels have no leader lines.
- Descent uses a camera approach with a fade through the SVG-independent host;
  it swaps scenes at the end rather than compositing two live scenes.
- Hull orientation uses default poses; generated geometry is recognizable but
  has not been matched to source art from every angle.
- Extended memory soak, print output and command-palette browser focus-trap
  retesting remain unperformed. Existing palette code and WebP hero are unchanged.
