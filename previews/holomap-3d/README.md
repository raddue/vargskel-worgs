# 3D holomap browser evidence

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
