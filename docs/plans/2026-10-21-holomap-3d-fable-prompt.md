# Build prompt: 3D holomap (for Fable 5.2)

## Goal

Replace the flat SVG holomap on the intel page's map tab (`intel.html`, `#holomap`) with an
interactive 3D holographic map of the Cressidium system. Users must be able to rotate, zoom and
pan it, and descend through every frame from the system down to ground sites. It should impress
players at the table. Read this whole brief before you write code.

Repo: `~/vargskel-worgs` (GitHub `raddue/vargskel-worgs`, served as static GitHub Pages; no build
step, no `package.json`). Tracking issues: #29 (real bodies, drill-down from system to ground) and
#31 (viewport zoom). Reference them in the PR.

## Read first

1. `AGENTS.md`. TDD is mandatory: write a failing check first, watch it fail for the right
   reason, then implement. Tests run as
   `node check-all.cjs && node tools/render.cjs --selftest`. CI runs exactly that.
2. `docs/plans/2026-10-19-holomap-29-design.md` (rev 14). This is the frame model you must keep.
3. `archive.js`, around lines 130–420: `holomap(fid)`, frame resolution, `KINDS`/`ART_KINDS`,
   crumbs, locator, `showUnit`/`unitFile`, and the click/keyboard wiring.
4. `campaign.js` `locations` and `factions` (from about line 35). This is the only data source.
5. `intel.html` (map tab markup and inline script) and `sw.js` (precache lists).

## Data model (do not change its meaning)

- A **frame** is a subject. `holomap("SYSTEM")` is the root. `holomap(locId)` is the frame for a
  body the user descended into. A location is drawn on the frame named by its `frame` field, or
  on `SYSTEM` if it has none. `parent` means "orbits or belongs to". `x`/`y` (0–100) are the
  positions within the frame. `pinBearing`, `ly`, `visited`, `faction` and `img` keep their
  current meanings.
- SYSTEM bodies are `cressidium` (planet), `pell` (moon, parent `cressidium`), `kessen` (station,
  parent `cressidium`), `cairn` (wreck field), `tarn` (planet) and `harrow` (station, parent
  `tarn`). The star is implied and has no record.
- Deeper frames: `cressidium` holds `elysia` (city); `elysia` holds `district`, `industry`,
  `dropzone`, `rio` (UNS Rio Grande, ORBITAL, high orbit) and `vsaf`; `industry` holds `dock`
  (FOB Saber).
- Faction `zone`s (ellipses with `frame`, `x`, `y`, `rx`, `ry`, `c`) are surface claims drawn on
  their frame.
- Art: each location has `assets/<id>-thumb.webp` at 480². **Use thumbs for plates and labels,
  never the full PNGs** (2.4–3.3 MB each, not precached).
- **Globe textures:** `assets/maps/cressidium.webp`, `pell.webp` and `tarn.webp` are 1024×512
  equirectangular surface maps. Their edges already wrap, and their poles are faded. Use them as
  sphere `map`s, and add them to `sw.js` `THUMBS`. There is no cloud layer, by operator choice.
  Provenance is in `assets/PROVENANCE.md`. Any other body without a map uses its thumb on a plate.
- **Hull models:** `assets/models/kessen.glb`, `harrow.glb` and `rio.glb` (about 210 KB each,
  about 12k faces, no texture). Each is centred with its longest side scaled to 1, and is meant
  to be holo-tinted by your material. Load them with `GLTFLoader` (vendor it too) and precache
  them. Orientation is as generated, so fix yaw and pitch per model in the scene description,
  not in the file. Provenance is in `assets/PROVENANCE.md`.
- Current-op guard: op 001 is `PLANNED`/`UNBRIEFED`, so nothing may claim live tracking. Keep
  that guard, including on ancestor markers.

Reuse `holomap(fid)` output and the frame helpers as the scene's source of truth. The 3D layer
is a renderer over the same model, not a second model. Do not edit `campaign.js` data except to
add optional, documented 3D hints if you need them (for example an orbit radius or tilt), and
give every hint a default so existing records still render.

## Required behaviour

**Rendering**
- Use three.js, **vendored** into `vendor/three/` (the ES module build plus `OrbitControls`, and
  only the addons you actually use, all pinned to one version with the version noted in a
  header comment). Load it through `<script type="module">` or an import map. Add every
  vendored file to `sw.js` precache (`CODE` list) so the map works offline at the table. No CDN.
- Look: **holographic tactical**, matching the site's existing palette in `theme.css` and
  `style.css` (`--cyan`, `--lime`, `--rust`, `--muted`, `--line`, ice tint). Use CSS variables at
  runtime so the theme control still affects the map. Bodies are textured spheres with a holo
  tint, fresnel rim and slight scanline. Orbits are thin glowing rings. Draw a faint grid plane.
  Labels are HTML HUD tags (CSS2DRenderer or positioned DOM) so they stay crisp and selectable.
  Faction zones are translucent coloured surface regions on their frame.
- Kinds must read as what they are: planets look like planets, moons are smaller and orbit
  their parent, stations and the Rio Grande are hardware (use the hull models above), and Cairn Drift is an instanced debris field. You choose how the ground and
  city frames look (`elysia`, `district`, `industry`, `dock`, `dropzone`, `vsaf`): for example a
  tilted holo-table terrain plate textured with the art plus raised site pins, or something
  better. Keep it grounded in existing art and positions. Do not invent geography that
  contradicts `notes`.

**Interaction**
- OrbitControls: drag to rotate, wheel or pinch to zoom, right-drag or two-finger drag to pan.
  Clamp zoom and polar angle so the user cannot fly inside a body or lose the scene. Damping on.
- Keep the existing **RESET VIEW** button (`#holo-back`), which recentres the current frame.
- Hover a body to highlight it and its label. Click or tap it to call the existing
  `showUnit(id)`, so the dossier in `#holo-detail` fills exactly as it does today.
- Descent: selecting a body that has child frames offers a descend action (double-click, or a
  "DESCEND" control in the readout). The camera flies toward the body over about 0.8 s with
  easing, the scene cross-fades to the child frame, and the camera settles at that frame's fit
  view. The breadcrumb (`#holo-crumbs`) and locator (`#holo-locator`) keep working; clicking a
  crumb flies back out. Browser back is optional; use it only if the current page already wires
  history.
- Motion: bodies drift slowly on their orbits. Pause on any pointer or keyboard interaction and
  resume after about 4 s idle. Under `prefers-reduced-motion: reduce`, nothing animates on its
  own and descent becomes an instant cut.
- Keyboard: the canvas is focusable. Tab or arrow keys cycle bodies in the current frame, Enter
  selects, Shift+Enter or `]` descends, Escape or `[` ascends. Update the SVG's existing
  `aria-label` text (`holomap(fid).aria`) on the canvas wrapper, and announce the selection
  through the existing `aria-live` region.

**Fallback (required)**
- If WebGL is unavailable, context creation fails, or the module fails to load, show the
  **existing SVG holomap unchanged**. It stays in the DOM, is hidden when 3D is active, and is
  shown on failure. Do not delete SVG drawing code. All existing holomap assertions in
  `check-all.cjs` must stay green.
- Handle `webglcontextlost`/`restored`. Dispose geometries, materials and textures on frame
  swap so repeated descents do not leak.

**Performance**
- Phones at the table are a target. Set `devicePixelRatio` capped at 2, render on demand when
  idle, and pause the loop when the tab is hidden or the map tab is not active. Keep initial map
  payload growth under about 700 KB gzip, excluding three.js itself, and state the measured
  number in the PR.

## Testing and evidence

- TDD per `AGENTS.md`. The harness uses a stub DOM with no WebGL and no layout, so unit-test the
  **pure** parts: a scene-description function (for example `scene3d(fid)` built from
  `holomap(fid)`) that returns bodies, kinds, parents, orbit radii, texture paths, zone
  ellipses and camera fit, with no three.js import. Test frame coverage for every frame, that
  the thumb rather than the PNG texture is used, the reduced-motion flag, fallback selection
  when WebGL is absent, and that the op-001 guard holds.
- Add every new file to the right `sw.js` list, and add a check that every vendored file is
  precached.
- Pixel or visual claims need a **chromium probe**, not a test: headless chromium screenshots
  of SYSTEM, Cressidium orbit, Nov Elysia and FOB Saber frames, desktop 1440×900 and phone
  390×844, plus one forced no-WebGL run showing the SVG fallback. Attach them to the PR.

## Delivery

- Branch `feat/holomap-3d` off `main`. Use small commits in the repo's existing message style
  (`holomap(#29): …`).
- Open a PR referencing #29 and #31 with what was built, frame screenshots, payload size, known
  gaps, and what you chose for ground frames and why.
- Out of scope: generating further art, new location data, and changes to other pages.

## Done when

- [ ] 3D map is the default on `intel.html` map tab and every frame is reachable by descent.
- [ ] Rotate, zoom and pan work by mouse, touch and keyboard, and RESET VIEW works.
- [ ] Clicking any body opens its existing dossier.
- [ ] Orbits animate and pause; reduced motion is respected.
- [ ] The no-WebGL fallback shows the untouched SVG holomap.
- [ ] `node check-all.cjs && node tools/render.cjs --selftest` passes, and new pure checks were
      written failing-first.
- [ ] Works offline after first visit, with the vendored three.js precached.
- [ ] The PR has chromium probe screenshots for both viewports.
