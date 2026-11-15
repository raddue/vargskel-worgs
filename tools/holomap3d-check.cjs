/* 3D holomap (#29, #31): the pure half. UI.scene3d(fid) is a description of one frame for the
   three.js renderer, built from UI.holomap(fid), so the 3D map is a second renderer over the same
   model and not a second model. The harness has no WebGL and no layout, so nothing here claims a
   pixel: what is drawn is a chromium probe, reported as a probe.
   Expected values are recomputed from campaign.js, never read back from the builder under test.
   Run: node tools/holomap3d-check.cjs (check-all.cjs runs it). */
const fs = require("node:fs"), vm = require("node:vm"), path = require("node:path");
const root = path.join(__dirname, "..");
const problems = [];
const bad = m => problems.push(m);

const box = { document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {} },
  matchMedia: () => ({ matches: false, addEventListener() {} }), CSS: { escape: s => String(s) }, location: { hash: "" }, console };
box.window = box;
vm.createContext(box);
for (const f of ["campaign.js", "archive.js"]) vm.runInContext(fs.readFileSync(path.join(root, f), "utf8"), box, { filename: f });
const UI = box.UI, D = box.CAMPAIGN;
if (typeof UI.scene3d !== "function") { console.error("holomap3d: UI.scene3d(frameId) is missing, so the 3D map has no scene to draw"); process.exit(1); }

const by = Object.fromEntries(D.locations.map(l => [l.id, l]));
const membersOf = F => F === "SYSTEM" ? D.locations.filter(l => !l.frame).map(l => l.id)
  : [F, ...D.locations.filter(l => l.frame === F).map(l => l.id), ...D.locations.filter(l => !l.frame && l.parent === F).map(l => l.id)];
/* Every frame a visitor can stand on: the root and each body whose frame holds more than itself. */
const FRAMES = ["SYSTEM", ...D.locations.map(l => l.id).filter(id => membersOf(id).length > 1)];
const near = (a, b, tol = 1e-3) => Math.abs(a - b) <= tol;
const exists = p => fs.existsSync(path.join(root, p));
/* A lossy webp carries its size in the VP8 frame header; a sphere map has to be 2:1. */
const webpSize = p => { const b = fs.readFileSync(path.join(root, p));
  if (b.toString("ascii", 0, 4) !== "RIFF" || b.toString("ascii", 12, 16) !== "VP8 ") return null;
  return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff]; };
const scenes = {};
for (const F of FRAMES) { try { scenes[F] = UI.scene3d(F); } catch (e) { bad(`UI.scene3d("${F}") threw: ${e.message}`); } }

const SHAPE = { PLANET: "globe", MOON: "globe", STATION: "hull", ORBITAL: "hull", "WRECK FIELD": "debris", CITY: "pin", DISTRICT: "pin", FOB: "pin", ZONE: "pin" };
const GROUND = ["CITY", "DISTRICT", "FOB", "ZONE"];
for (const F of FRAMES) {
  const s = scenes[F]; if (!s) continue;
  const flat = UI.holomap(F), want = membersOf(F), got = s.bodies.map(b => b.id);
  /* Frame coverage: the bodies are members(F) exactly, once each. */
  want.forEach(id => { if (!got.includes(id)) bad(`scene3d("${F}") omits member ${id}`); });
  got.forEach((id, i) => { if (!want.includes(id)) bad(`scene3d("${F}") draws ${id}, which is not a member of that frame`);
    if (got.indexOf(id) !== i) bad(`scene3d("${F}") draws ${id} twice`); });
  if (s.frame !== F) bad(`scene3d("${F}").frame must name the frame it describes`);
  if (s.aria !== flat.aria) bad(`scene3d("${F}").aria must be holomap("${F}").aria, the text the SVG already carries`);
  const wantMode = F !== "SYSTEM" && GROUND.includes(by[F].kind) ? "ground" : "space";
  if (s.mode !== wantMode) bad(`scene3d("${F}").mode must be "${wantMode}" (the subject is ${F === "SYSTEM" ? "the system" : "a " + by[F].kind})`);
  if (s.ascend !== (F === "SYSTEM" ? null : by[F].frame || "SYSTEM")) bad(`scene3d("${F}").ascend must name the frame above it`);

  /* Placement is the SVG's: 100 px of the 1000x480 frame is one world unit, x across and y toward
     the viewer, read here from the markup the flat map draws and not from the model. */
  const placed = new Map([...flat.world.matchAll(/data-loc="([^"]+)" data-x="(-?[\d.]+)" data-y="(-?[\d.]+)"/g)].map(m => [m[1], [(m[2] - 500) / 100, (m[3] - 240) / 100]]));
  for (const b of s.bodies) {
    const l = by[b.id], p = placed.get(b.id);
    if (!p || !near(b.pos[0], p[0], .002) || !near(b.pos[2], p[1], .002)) bad(`scene3d("${F}"): ${b.id} must stand where the flat map placed it (${p}), got ${b.pos}`);
    if (b.kind !== l.kind || b.name !== l.name) bad(`scene3d("${F}"): ${b.id} must carry its record's kind and name`);
    if (b.shape !== SHAPE[l.kind]) bad(`scene3d("${F}"): a ${l.kind} must read as a ${SHAPE[l.kind]}, ${b.id} is a ${b.shape}`);
    if (!(b.r > 0)) bad(`scene3d("${F}"): ${b.id} needs a drawn radius`);
    /* Thumbs, never the 2-3 MB source plates; and a square thumb is never a sphere texture. */
    for (const k of ["map", "thumb", "model"]) if (b[k] != null) {
      if (/\.png$/i.test(b[k])) bad(`scene3d("${F}"): ${b.id}.${k} is ${b[k]}; the full PNG plates are megabytes and are not precached`);
      if (!exists(b[k])) bad(`scene3d("${F}"): ${b.id}.${k} names ${b[k]}, which does not exist`);
    }
    if (b.thumb !== String(l.img).replace(/\.\w+$/, "-thumb.webp")) bad(`scene3d("${F}"): ${b.id}.thumb must be its record's thumb`);
    if (b.shape === "globe") {
      if (b.map !== `assets/maps/${b.id}.webp`) bad(`scene3d("${F}"): globe ${b.id} must be textured by assets/maps/${b.id}.webp, got ${b.map}`);
      else { const sz = webpSize(b.map); if (!sz || sz[0] !== 2 * sz[1]) bad(`${b.map} must be a 2:1 equirectangular map, got ${sz}`); }
    } else if (b.map != null) bad(`scene3d("${F}"): only a globe carries a sphere map, ${b.id} is a ${b.shape}`);
    if (b.shape === "hull") {
      if (b.model !== `assets/models/${b.id}.glb`) bad(`scene3d("${F}"): hull ${b.id} must load assets/models/${b.id}.glb, got ${b.model}`);
      if (![b.yaw, b.pitch, b.roll].every(Number.isFinite)) bad(`scene3d("${F}"): hull ${b.id} needs its yaw, pitch and roll in the scene, not in the file`);
    }
    /* A ground site is raised off its table; a pin on a globe is not. */
    if (b.shape === "pin" && (wantMode === "ground") !== (b.h > 0)) bad(`scene3d("${F}"): pin ${b.id} ${wantMode === "ground" ? "must be raised off the table" : "sits on its globe and carries no height"}`);
    if (b.shape === "debris" && !(b.count > 50)) bad(`scene3d("${F}"): the debris field ${b.id} needs an instance count`);
    if (b.visited !== !!l.visited) bad(`scene3d("${F}"): ${b.id}.visited must be its record's`);
    /* Descent is by frame: offered exactly where the flat map's ENTER chip is. */
    if (b.descend !== (b.id !== F && membersOf(b.id).length > 1)) bad(`scene3d("${F}"): ${b.id}.descend must be ${b.id !== F && membersOf(b.id).length > 1}`);
    if (typeof b.aria !== "string" || !b.aria.includes(l.name)) bad(`scene3d("${F}"): ${b.id} needs the label the SVG node carries`);
    if (b.role !== (b.id === F ? "subject" : "member")) bad(`scene3d("${F}"): ${b.id}.role is wrong`);
  }
  /* Orbits: a moon, a station or an orbital rides a ring round a parent this frame draws, and at
     phase zero it sits exactly where its record puts it, which is what reduced motion shows. */
  for (const b of s.bodies) {
    const l = by[b.id], orbits = ["MOON", "STATION", "ORBITAL"].includes(l.kind) && l.parent && want.includes(l.parent) && l.parent !== l.id;
    /* A cross-scale pin stands on its globe, so it rides the globe's spin: same mechanism, the
       radius is the globe's own and the period is the globe's day. */
    if (F !== "SYSTEM" && b.id !== F && l.level !== by[F].level) {
      const g = s.bodies.find(x => x.id === F), o = b.orbit;
      if (!o || o.parent !== F || !o.surface || !near(o.radius, g.r, .002) || !near(o.period, 2 * Math.PI / g.spin, .01)) bad(`scene3d("${F}"): pin ${b.id} must ride ${F}'s surface at ${F}'s own spin`);
      continue;
    }
    if (!orbits) { if (b.orbit) bad(`scene3d("${F}"): ${b.id} does not orbit anything this frame draws`); continue; }
    if (!b.orbit || b.orbit.parent !== l.parent) { bad(`scene3d("${F}"): ${b.id} must orbit ${l.parent}`); continue; }
    const p = s.bodies.find(x => x.id === l.parent), o = b.orbit;
    if (!near(o.radius, Math.hypot(b.pos[0] - p.pos[0], b.pos[2] - p.pos[2]))) bad(`scene3d("${F}"): ${b.id}'s orbit radius must be its distance from ${l.parent}`);
    if (!near(p.pos[0] + o.radius * Math.cos(o.phase), b.pos[0]) || !near(p.pos[2] + o.radius * Math.sin(o.phase), b.pos[2])) bad(`scene3d("${F}"): ${b.id}'s orbit phase must start it at its recorded position`);
    if (!(o.period > 0)) bad(`scene3d("${F}"): ${b.id}'s orbit needs a period`);
    if (l.kind === "MOON" && !(b.r < p.r)) bad(`scene3d("${F}"): moon ${b.id} must be smaller than ${l.parent}`);
    if (!s.orbits.some(r => r.child === b.id && r.parent === l.parent && near(r.radius, o.radius))) bad(`scene3d("${F}"): ${b.id}'s ring is not drawn`);
  }
  /* A globe turns under a light that holds still, and a moon keeps its parent's day, so it stays
     over the ground it is recorded over (Pell, tide-locked over the city) while the frame drifts. */
  s.bodies.filter(b => b.shape === "globe").forEach(b => { if (!(b.spin > 0)) bad(`scene3d("${F}"): globe ${b.id} needs a spin rate`); });
  s.bodies.filter(b => b.kind === "MOON" && b.orbit).forEach(b => { const p = s.bodies.find(x => x.id === b.orbit.parent);
    if (!near(b.orbit.period, 2 * Math.PI / p.spin, .01)) bad(`scene3d("${F}"): moon ${b.id} must keep ${p.id}'s day`); });
  { const d = s.sun && s.sun.dir; if (!d || !near(Math.hypot(d[0], d[1], d[2]), 1, .01)) bad(`scene3d("${F}"): sun.dir must be a unit vector toward the star`); }
  /* Zones are the surface claims the flat map draws on this frame, in the same place. */
  const fz = D.factions.filter(f => f.zone && f.zone.frame === F);
  if (s.zones.length !== fz.length) bad(`scene3d("${F}") must draw ${fz.length} faction zone(s), got ${s.zones.length}`);
  const ell = [...flat.world.matchAll(/<ellipse class="zone" cx="(-?[\d.]+)" cy="(-?[\d.]+)" rx="([\d.]+)" ry="([\d.]+)"/g)];
  fz.forEach((f, i) => { const z = s.zones[i], e = ell[i]; if (!z || !e) return;
    if (z.id !== f.id || z.c !== f.zone.c) bad(`scene3d("${F}"): zone ${i} must be ${f.id} in --${f.zone.c}`);
    if (!near(z.center[0], (e[1] - 500) / 100, .002) || !near(z.center[1], (e[2] - 240) / 100, .002) || !near(z.rx, e[3] / 100, .002) || !near(z.rz, e[4] / 100, .002)) bad(`scene3d("${F}"): zone ${f.id} must be the ellipse the flat map draws`); });
  /* A zone is named on the map exactly where the flat map names it: not when it sits on a site. */
  { const named = [...flat.world.matchAll(/<text class="zl"[^>]*>([^<]+)<\/text>/g)].map(m => m[1].replace(/&amp;/g, "&")).sort(), got3 = s.zones.map(z => z.label).filter(Boolean).sort();
    if (named.join("|") !== got3.join("|")) bad(`scene3d("${F}"): zone labels must be the flat map's (${named.join(", ") || "none"}), got ${got3.join(", ") || "none"}`); }
  const legs = [...flat.world.matchAll(/data-leg="([^"]+)"/g)].length;
  if (s.legs.length !== legs) bad(`scene3d("${F}") must draw the ${legs} route leg(s) the flat map draws, got ${s.legs.length}`);
  s.legs.forEach(g => { if (!got.includes(g.from) || !got.includes(g.to)) bad(`scene3d("${F}"): a leg must join two drawn bodies`); });
  if (!!s.star !== (F === "SYSTEM")) bad(`scene3d("${F}"): the declared star is drawn on the root and nowhere else`);
  if (s.bodies.some(b => b.id === "star")) bad("the star has no file, so it is never a selectable body");

  /* Camera: at the fit distance every body is inside the view at both table viewports, the user
     cannot zoom inside a body or lose the scene, and the fit is not wastefully loose. */
  const c = s.camera;
  if (!(c.minPolar > 0 && c.minPolar < c.polar && c.polar < c.maxPolar && c.maxPolar < Math.PI)) bad(`scene3d("${F}"): the polar angle must be clamped round its default`);
  if (s.mode === "ground" && !(c.maxPolar < Math.PI / 2)) bad(`scene3d("${F}"): a ground frame's camera must not sink below its table`);
  if (!(c.minDistance > Math.max(...s.bodies.map(b => b.r)))) bad(`scene3d("${F}"): minDistance must keep the camera outside the largest body`);
  for (const [w, h] of [[1440, 620], [390, 420]]) {
    const aspect = w / h, d = UI.fitDistance(s, aspect);
    if (!(d > c.minDistance)) { bad(`scene3d("${F}"): the fit distance at ${w}x${h} must sit outside minDistance`); continue; }
    const tv = Math.tan(c.fov * Math.PI / 360), th = tv * aspect;
    const dir = [Math.sin(c.polar) * Math.sin(c.azimuth), Math.cos(c.polar), Math.sin(c.polar) * Math.cos(c.azimuth)];
    const right = [Math.cos(c.azimuth), 0, -Math.sin(c.azimuth)], up = [dir[1] * right[2] - dir[2] * right[1], dir[2] * right[0] - dir[0] * right[2], dir[0] * right[1] - dir[1] * right[0]];
    const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const ndc = dist => Math.max(...s.bodies.map(b => { const depth = dist - dot(b.pos, dir); return Math.max((Math.abs(dot(b.pos, right)) + b.r) / (depth * th), (Math.abs(dot(b.pos, up)) + b.r) / (depth * tv)); }));
    if (ndc(d) > 1) bad(`scene3d("${F}"): at ${w}x${h} the fit view cuts a body off (ndc ${ndc(d).toFixed(2)})`);
    if (ndc(d * .55) <= 1) bad(`scene3d("${F}"): at ${w}x${h} the fit view is loose: the frame still fits at 0.55x the distance`);
    if (!(c.maxZoomOut > 1 && c.maxZoomOut <= 3)) bad(`scene3d("${F}"): maxZoomOut must bound how far out the camera goes`);
  }
}
/* Every frame is reachable by descent from the root. */
{ const seen = new Set(["SYSTEM"]), todo = ["SYSTEM"];
  while (todo.length) { const s = scenes[todo.pop()]; if (!s) continue;
    s.bodies.filter(b => b.descend && !seen.has(b.id)).forEach(b => { seen.add(b.id); todo.push(b.id); }); }
  FRAMES.forEach(F => { if (!seen.has(F)) bad(`frame ${F} cannot be reached by descent from SYSTEM`); }); }
/* A leaf opens its file and offers no descent: FOB Saber is the deepest site, inside industry. */
if (scenes.industry && scenes.industry.bodies.find(b => b.id === "dock").descend) bad("dock holds no frame of its own, so it must not offer a descent");
/* Every surface map and hull model in the repo is one the scene uses, so none is shipped unused. */
{ const used = new Set(Object.values(scenes).flatMap(s => s.bodies.flatMap(b => [b.map, b.model].filter(Boolean))));
  for (const dir of ["assets/maps", "assets/models"]) fs.readdirSync(path.join(root, dir)).forEach(f => { if (!used.has(`${dir}/${f}`)) bad(`${dir}/${f} is in the repo but no frame draws it`); }); }

/* Motion: bodies drift unless the visitor asked for reduced motion, where nothing moves on its own
   and a descent is a cut. */
{ const on = UI.scene3d("SYSTEM").motion, off = UI.scene3d("SYSTEM", { reducedMotion: true }).motion;
  if (on.drift !== true || on.flyMs !== 800 || on.resumeMs !== 4000) bad(`scene3d motion must drift, fly for 800 ms and resume 4000 ms after input, got ${JSON.stringify(on)}`);
  if (off.drift !== false || off.flyMs !== 0) bad(`scene3d under reduced motion must not drift and must cut, got ${JSON.stringify(off)}`); }

/* Fallback: the flat SVG map is what shows unless WebGL is known to be up. */
if (typeof UI.holoRenderer !== "function") bad("UI.holoRenderer(env) is missing: nothing decides between the 3D map and the SVG fallback");
else {
  const cases = [[undefined, "svg"], [{}, "svg"], [{ webgl: false }, "svg"], [{ webgl: true }, "3d"], [{ webgl: true, lost: true }, "svg"], [{ webgl: true, failed: true }, "svg"]];
  for (const [env, want] of cases) if (UI.holoRenderer(env) !== want) bad(`holoRenderer(${JSON.stringify(env)}) must be "${want}"`);
}

/* The op-001 guard: a planned op claims no live tracking in 3D either, and once it is flown the
   ring rides the ground and every frame ancestor of it. */
{ const curIds = () => FRAMES.flatMap(F => UI.scene3d(F).bodies.filter(b => b.cur).map(b => `${F}:${b.id}`));
  if (curIds().length) bad(`op 001 is planned: no 3D body may carry the current-op ring, got ${curIds().join(", ")}`);
  const o = D.ops[0], t0 = o.type, s0 = o.status;
  o.type = "SECURE"; o.status = "ACTIVE";
  const chain = [o.loc]; let f = by[o.loc].frame; while (f) { chain.push(f); f = by[f].frame; }
  for (const F of FRAMES) for (const b of UI.scene3d(F).bodies) if (b.cur !== chain.includes(b.id)) bad(`flown op 001: ${b.id} on ${F} ${chain.includes(b.id) ? "must" : "must not"} carry the current-op ring in 3D`);
  o.type = t0; o.status = s0;
  if (curIds().length) bad("the 3D current-op ring must go again once the op is planned"); }

/* The renderer hears the page: fitLevel reports the frame it drew and mark reports the selection. */
{ const seen = []; UI.onFrame = (fid, m) => seen.push([fid, m && m.aria]); UI.fitLevel("cressidium");
  if (!seen.length || seen[0][0] !== "cressidium" || seen[0][1] !== UI.holomap("cressidium").aria) bad("fitLevel must call UI.onFrame(frame, holomap(frame)) so the 3D map follows the page");
  if (UI.frameId() !== "cressidium") bad("UI.frameId() must report the frame the page is on");
  const marks = []; UI.onMark = (k, v) => marks.push(k + ":" + v); UI.mark("loc", "pell");
  if (marks.join() !== "loc:pell") bad("mark must call UI.onMark(kind, id) so the 3D map shows the selection");
  UI.onFrame = UI.onMark = null; UI.fitLevel("SYSTEM"); UI.mark("loc", ""); }

if (problems.length) { console.error("holomap3d: " + problems.length + " problem(s)\n- " + [...new Set(problems)].slice(0, 40).join("\n- ")); process.exit(1); }
console.log(`holomap3d ok: ${FRAMES.length} frames (${FRAMES.join(", ")}) described for the 3D renderer`);
