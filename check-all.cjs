/* Checks campaign.js: every id reference resolves, and obvious contradictions
   are caught. Run after editing: node check-all.cjs
   Exits non-zero with a list of problems. */
const fs = require("fs");
const vm = require("vm");
const chrome = require("./tools/chrome.cjs");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(__dirname + "/campaign.js", "utf8"), sandbox, { filename: "campaign.js" });
const C = sandbox.window.CAMPAIGN;

const problems = [];
const ids = key => new Set(C[key].map(x => x.id));
const have = (set, key, id, where) => {
  if (!set.has(id)) problems.push(`${where}: unknown ${key} id "${id}"`);
  return set.has(id);
};
const dupes = key => {
  const seen = new Set();
  C[key].forEach(x => (seen.has(x.id) ? problems.push(`${key}: duplicate id "${x.id}"`) : seen.add(x.id)));
};

["locations", "factions", "personnel", "pilots", "mechs", "ops", "threads", "events"].forEach(dupes);

/* Ledger rows are append-only session logs: a bad row silently skews career totals. */
const LEDGER_STATS = ["dealt", "taken", "structure", "repairs", "hacks", "kills", "heat", "overcharge", "core", "moves"];
const pilotIds = ids("pilots"), opIds = ids("ops");
if (!Array.isArray(C.ledger)) problems.push("ledger: must be an array of session rows");
else {
  const seenRow = new Set();
  C.ledger.forEach((e, i) => {
    if (!e || typeof e !== "object") return problems.push(`ledger[${i}]: must be an object`);
    if (!pilotIds.has(e.pilot)) problems.push(`ledger[${i}]: unknown pilot "${e.pilot}"`);
    if (!opIds.has(e.op)) problems.push(`ledger[${i}]: unknown op "${e.op}"`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date || "")) problems.push(`ledger[${i}]: date must be YYYY-MM-DD`);
    const stats = Object.keys(e).filter(k => !["op", "date", "pilot"].includes(k));
    if (!stats.length) problems.push(`ledger[${i}]: no stats`);
    stats.forEach(k => {
      if (!LEDGER_STATS.includes(k)) problems.push(`ledger[${i}]: unknown stat "${k}"`);
      else if (typeof e[k] !== "number" || !Number.isFinite(e[k]) || e[k] < 0) problems.push(`ledger[${i}].${k}: must be a non-negative number`);
    });
    const key = `${e.op}|${e.date}|${e.pilot}`;
    if (seenRow.has(key)) problems.push(`ledger[${i}]: duplicate row for ${e.pilot} on ${e.date} in OP ${e.op}`);
    seenRow.add(key);
  });
}

/* Ids become markup and sort keys, and the fields the page reads without a guard
   must exist: a numeric id or a missing array used to blank the whole archive
   while this checker still printed "ok". */
const required = {
  locations: ["name", "kind", "x", "y", "level"],
  factions: ["name", "standing"],
  personnel: ["name", "role", "status", "notes", "img"],
  pilots: ["name", "background", "status"],
  mechs: ["name", "frame", "role", "state", "glyph"],
  ops: ["title", "type", "status", "loc", "outcome", "date"],
  threads: ["op", "text", "status"],
  events: ["date", "title", "note"],
};
Object.entries(required).forEach(([key, fields]) => {
  C[key].forEach(x => {
    if (typeof x.id !== "string" || !x.id) problems.push(`${key}: id must be a non-empty string, got ${JSON.stringify(x.id)}`);
    fields.forEach(f => { if (x[f] == null || x[f] === "") problems.push(`${key} ${x.id}: missing ${f}`); });
    if (key === "ops") ["crew", "mechs"].forEach(a => { if (!Array.isArray(x[a])) problems.push(`op ${x.id}: ${a} must be an array`); });
  });
});
/* frame and pinBearing are optional keys with their own shape check: frame is absent on the six
   root records, so listing it as required would report six false absences, and pinBearing rides
   only the pin. Both still get typed, or a typo would ride into the builder as NaN. */
C.locations.forEach(l => {
  if ("frame" in l && typeof l.frame !== "string") problems.push(`location ${l.id}: frame must be a string or absent, got ${JSON.stringify(l.frame)}`);
  if ("pinBearing" in l && (typeof l.pinBearing !== "number" || !(l.pinBearing >= 0 && l.pinBearing < 360))) problems.push(`location ${l.id}: pinBearing must be a number in [0, 360) or absent, got ${JSON.stringify(l.pinBearing)}`);
});

if (C.pilots.length !== 6 || C.mechs.length !== 6 || C.ops.length !== 1 || C.events.length || C.threads.length) problems.push('campaign should have six pilots/mechs, one Solstice Rain operation, and no historical events/threads');
if (!C.pilots.some(p => p.name === "RURIK “DAEMON” VARGSKEL" && p.img === "assets/rurik_vargskel.png") || !fs.existsSync(__dirname + "/assets/rurik_vargskel.png") || !C.pilots.some(p => p.id === "sten" && p.name === "STEN “HAMMER” VARGSKEL" && p.mech === "skaldr" && p.img === "assets/sten.png") || !fs.existsSync(__dirname + "/assets/sten.png") || !C.pilots.some(p => p.name === "HANSEN “DUSTY” MCGRAW") || !C.pilots.some(p => p.id === "spook" && p.name === "NICOLOSO “SPOOK” BENIKO" && p.mech === "alba")) problems.push('roster must keep Rurik, Sten with Skaldr, Dusty, Guillaume, Danila, and Spook with Alba');
if (!C.mechs.some(m => m.name === "AVERNA") || !C.mechs.some(m => m.name === "TOMBSTONE") || !C.mechs.some(m => m.pilot === "sten" && m.id === "skaldr") || !C.mechs.some(m => m.id === "alba" && m.pilot === "spook" && m.name === "ALBA")) problems.push('roster must keep Averna, Tombstone, Wayward, Scooteroo, Skaldr, and Alba');
if (!fs.existsSync(__dirname + "/assets/spook.png")) problems.push('Spook portrait missing from assets');
if (!fs.existsSync(__dirname + "/assets/skaldr.png")) problems.push('Skaldr artwork missing from assets');
if (!fs.existsSync(__dirname + "/assets/tizona.png")) problems.push('Tizona portrait missing from assets');
/* Every roster and location image needs its webp thumb (cards render <picture> webp-first). */
[...C.pilots, ...C.mechs, ...C.locations].forEach(x => {
  if (!x.img) return;
  const thumb = x.img.replace(/\.\w+$/, "-thumb.webp");
  if (!fs.existsSync(__dirname + "/" + thumb)) problems.push(`${x.id}: missing ${thumb} for ${x.img}; regen: magick ${x.img} -resize 480x ${thumb}`);
});
if (!fs.existsSync(__dirname + "/assets/scooter.png")) problems.push('Scooter portrait missing from assets');
if (!fs.existsSync(__dirname + "/assets/scooteroo.png")) problems.push('Scooteroo artwork missing from assets');
/* INTEL is a page of its own: the map and the faction ledger live on intel.html, and every
   page's nav must reach it, so a link cannot quietly rot back into an index anchor. */
const navPages = ["index.html", "intel.html", "pilots.html", "mechbay.html", "mech.html", "pilot.html", "solstice-rain.html", "campaign.html", "loadout.html", "docs/guides/averna-omniscient-overlord.html"];
navPages.forEach(p => {
  const src = fs.existsSync(__dirname + "/" + p) ? fs.readFileSync(__dirname + "/" + p, "utf8") : "";
  if (!/href="(?:\.\.\/){0,2}intel\.html">INTEL</.test(src)) problems.push(`${p}: nav INTEL must link to intel.html, not an index anchor`);
});
/* The campaign page is the session log's home (#27): every page must reach it, the ledger section
   must be gone from mechbay.html, and the panel assertions below mount campaign.html instead. */
navPages.forEach(p => {
  const src = fs.existsSync(__dirname + "/" + p) ? fs.readFileSync(__dirname + "/" + p, "utf8") : "";
  if (!/href="(?:\.\.\/){0,2}campaign\.html">CAMPAIGN</.test(src)) problems.push(`${p}: nav must link to campaign.html as CAMPAIGN`);
  /* One status label on every page: two different ones changed the box width and dragged the nav. */
  if (!/● DEPLOYMENT STATUS: [A-Z]+</.test(src)) problems.push(`${p}: the status chip must read CLASS "DEPLOYMENT STATUS", not a per-page label`);
});
/* The nav and the status chip come from tools/chrome.cjs. A page carrying a different copy
   fails here by name instead of drifting silently; node tools/chrome.cjs --selftest covers
   the component itself. */
navPages.forEach(p => {
  const src = fs.existsSync(__dirname + "/" + p) ? fs.readFileSync(__dirname + "/" + p, "utf8") : "";
  const prefix = p.includes("/") ? "../../" : "";
  const got = (src.match(/<nav class="nav">[\s\S]*?<\/nav>/) || [])[0];
  if (got !== chrome.nav(prefix, p === "index.html"))
    problems.push(`${p}: nav differs from tools/chrome.cjs; copy chrome.nav("${prefix}") into the page`);
  /* Two pages carry a chrome hero; both are pinned to the component's exact output. */
  const wantHero = {
    "mechbay.html": chrome.hero({ eyebrow: "UNIT DOSSIER / VW-01", title: "CHASSIS REGISTER",
      deck: "Mech records for the active lance. Select a chassis to open its file." }),
    "intel.html": chrome.hero({ eyebrow: "UNIT DOSSIER / VW-01", title: "INTELLIGENCE",
      deck: "Holomap, faction ledger, and personnel files for the Cressidium contract." }),
  }[p];
  if (wantHero) {
    const gotHero = (src.match(/<section class="hero"[\s\S]*?<\/section>/) || [])[0];
    if (gotHero !== wantHero) problems.push(`${p}: hero differs from tools/chrome.cjs; copy chrome.hero({...}) into the page`);
  }
  if (p === "docs/guides/averna-omniscient-overlord.html" && !/hero-art[\s\S]{0,140}averna\.png/.test(src))
    problems.push(`${p}: the hero must carry the AVERNA plate`);
  const statusVal = (src.match(/<div class="status">([^<]*)</) || [])[1];
  if (!chrome.statusRe.test(statusVal || ""))
    problems.push(`${p}: status chip must be chrome.status("<UPPERCASE STATE>"), label included`);
});
const intelPage = fs.readFileSync(__dirname + "/intel.html", "utf8");
if (!/id="holomap"/.test(intelPage)) problems.push("intel.html must carry the holomap section the map builds into");
if (!/id="faction-list"/.test(intelPage)) problems.push("intel.html must carry the faction ledger");
const indexPath = fs.readFileSync(__dirname + "/index.html", "utf8");
if (/id="holomap"|id="faction-list"/.test(indexPath)) problems.push("index.html must not keep its own holomap or faction ledger now that intel.html owns them");
/* Golden roster records live in tools/roster-snapshot.json; after a deliberate data change run
   node check-all.cjs --update-snapshot and review the JSON diff. Every field present in the snapshot must match. */
const snapPath = __dirname + "/tools/roster-snapshot.json";
const pick = (rec, keys) => Object.fromEntries(keys.map(k => [k, rec ? rec[k] : undefined]));
/* Derived pin fields: campaign.js holds the data, the snapshot holds the printed strings the
   dossier and mechbay show. One definition, used by both the comparison and --update-snapshot. */
const mountStr = mounts => !(mounts && mounts.length) ? "" : mounts.map(m => `${m.slot}: ${m.weapons.join(" / ")}`).join(" · ");
const sysStr = names => !(names && names.length) ? "" : names.join(", ");
const view = (key, rec) => rec && key === "mechs"
  ? { ...rec, loadoutString: mountStr(rec.mounts), systemString: sysStr(rec.systems) } : rec;
/* The snapshot's own key list drives --update-snapshot, so a derived key would be dropped the
   moment the record stops carrying it. Name the derived keys here as well. */
const derivedKeys = { mechs: ["loadoutString", "systemString"] };
let snap = JSON.parse(fs.readFileSync(snapPath, "utf8"));
if (process.argv.includes("--update-snapshot")) {
  snap = Object.fromEntries(Object.entries(snap).map(([key, recs]) => [key, Object.fromEntries(Object.entries(recs).map(([id, r]) => [id, pick(view(key, C[key].find(x => x.id === id)), [...Object.keys(r), ...(derivedKeys[key] || [])])]))]));
  /* pick() copies undefined for a key the record no longer carries and JSON.stringify drops it,
     which is how a superseded key used to vanish from the golden file without a word. Name it
     instead: the drop still happens, but the run fails once so it cannot pass unnoticed. */
  const obsolete = [];
  Object.entries(snap).forEach(([key, recs]) => Object.entries(recs).forEach(([id, r]) => {
    const rec = C[key].find(x => x.id === id);
    Object.keys(r).forEach(k => {
      if (rec && !(k in rec) && !(derivedKeys[key] || []).includes(k)) obsolete.push(`${key} ${id}.${k}`);
    });
  }));
  if (obsolete.length) problems.push(`--update-snapshot dropped keys the records no longer carry, review then re-run without the flag: ${obsolete.join(", ")}`);
  fs.writeFileSync(snapPath, JSON.stringify(snap, null, 1) + "\n");
}

/* The loadout and systems pins are DERIVED strings now: campaign.js holds mounts and a list of
   system names, the snapshot holds the printed text. pick() only copies keys the snapshot
   already has, so a derived key that stops being emitted drops the pin silently; naming the
   keys in derivedKeys and asserting each one here turns that into a failure that names the mech. */
Object.entries(snap.mechs || {}).forEach(([id, r]) => {
  for (const k of derivedKeys.mechs)
    if (!(k in r)) problems.push(`mechs ${id}: snapshot must pin ${k} (derived; see derivedKeys)`);
});
Object.entries(snap).forEach(([key, recs]) => Object.entries(recs).forEach(([id, want]) => {
  const got = view(key, C[key].find(x => x.id === id));
  if (!got) return problems.push(`${key} ${id}: snapshot record missing from campaign.js`);
  Object.entries(want).forEach(([k, v]) => { if (got[k] !== v) problems.push(`${key} ${id}.${k}: ${JSON.stringify(got[k])} != snapshot ${JSON.stringify(v)}`); });
}));
const sr = C.ops[0];
if (!sr || sr.title !== "SOLSTICE RAIN" || sr.loc !== "elysia" || !sr.summary) problems.push('only operation should be SOLSTICE RAIN at Nov Elysia with an overview');
if (!sr || !sr.mission || !sr.mission.href || !fs.existsSync(__dirname + "/" + sr.mission.href)) problems.push('Solstice Rain must link to an existing current-mission page');
else if (/href="(?:gm|solstice-rain-m1)\.html"/.test(fs.readFileSync(__dirname + "/" + sr.mission.href, "utf8"))) problems.push(`${sr.mission.href}: crew briefing must not link to GM pages`);
for (const f of ["gm.html", "solstice-rain-m1.html", "solstice-rain-c1.html", "solstice-rain-c2.html", "solstice-rain-c3.html", "quest-cheatsheet.html", "combat-page.css", "combat-tracker.js", "check-opfor.cjs"])
  if (fs.existsSync(__dirname + "/" + f)) problems.push(`${f}: GM/combat file belongs in vargskel-gm, not the public site`);

C.mechs.forEach(m => {
  if (m.hpNow == null) return;
  if (typeof m.hp !== "number" || typeof m.hpNow !== "number" || m.hpNow < 0 || m.hpNow > m.hp)
    problems.push(`mech ${m.id}: hpNow ${JSON.stringify(m.hpNow)} needs hp as a number and 0 <= hpNow <= hp`);
});
const loc = ids("locations"), fac = ids("factions"), person = ids("personnel"), pilot = ids("pilots"), mech = ids("mechs"), op = ids("ops");
C.personnel.forEach(p => {
  have(fac, "factions", p.faction, `personnel ${p.id}.faction`);
  have(loc, "locations", p.lastKnown, `personnel ${p.id}.lastKnown`);
  if (!Array.isArray(p.ops)) problems.push(`personnel ${p.id}.ops must be an array`);
  else p.ops.forEach(id => have(op, "ops", id, `personnel ${p.id}.ops`));
});
C.ops.forEach(o => {
  const seen = new Set();
  (o.opord?.vips || []).forEach(v => {
    if (seen.has(v.id)) problems.push(`op ${o.id}.opord.vips: duplicate personnel id "${v.id}"`);
    seen.add(v.id);
    if (!have(person, "personnel", v.id, `op ${o.id}.opord.vips`)) return;
    const p = C.personnel.find(p => p.id === v.id);
    if (Array.isArray(p.ops) && !p.ops.includes(o.id)) problems.push(`personnel ${v.id}: OPORD principal of op ${o.id} missing from personnel.ops`);
    for (const field of ["name", "role", "img", "blurb"])
      if (typeof v[field] !== "string" || !v[field]) problems.push(`op ${o.id}.opord.vips ${v.id}: missing ${field}`);
    if (v.img && !fs.existsSync(__dirname + "/" + v.img)) problems.push(`personnel ${v.id}: OPORD principal needs an img that exists, got ${JSON.stringify(v.img)}`);
  });
});

C.locations.forEach(l => {
  if (l.parent) have(loc, "locations", l.parent, `location ${l.id}.parent`);
  if (l.faction) have(fac, "factions", l.faction, `location ${l.id}.faction`);
  if (typeof l.x !== "number" || typeof l.y !== "number") problems.push(`location ${l.id}: x/y must be numbers`);
});
C.mechs.forEach(m => {
  if (m.pilot) {
    have(pilot, "pilots", m.pilot, `mech ${m.id}.pilot`);
    const p = C.pilots.find(x => x.id === m.pilot);
    if (p && p.mech !== m.id) problems.push(`mech ${m.id} -> pilot ${m.pilot} but that pilot's mech is ${p.mech}`);
  }
});
C.pilots.forEach(p => {
  if (!p.mech) return;
  have(mech, "mechs", p.mech, `pilot ${p.id}.mech`);
  const m = C.mechs.find(x => x.id === p.mech);
  if (m && m.pilot !== p.id) problems.push(`pilot ${p.id} -> mech ${p.mech} but that mech's pilot is ${m.pilot}`);
});
C.ops.forEach(o => {
  if (o.checks !== undefined && (!Array.isArray(o.checks) || o.checks.some(c => typeof c !== "string" || !c.trim()))) problems.push(`op ${o.id}.checks must be an array of non-empty strings`);
  have(loc, "locations", o.loc, `op ${o.id}.loc`);
  if (o.client) have(fac, "factions", o.client, `op ${o.id}.client`);
  (o.crew || []).forEach(id => have(pilot, "pilots", id, `op ${o.id}.crew`));
  (o.mechs || []).forEach(id => have(mech, "mechs", id, `op ${o.id}.mechs`));
  if (o.type === "PLANNED" && o.status !== "UNBRIEFED") problems.push(`op ${o.id}: planned op should be UNBRIEFED`);
});
C.threads.forEach(t => have(op, "ops", t.op, `thread ${t.id}.op`));
C.events.forEach(e => { if (e.op) have(op, "ops", e.op, `event ${e.id}.op`); });
C.factions.forEach(f => {
  if (f.zone && (typeof f.zone.x !== "number" || typeof f.zone.y !== "number")) problems.push(`faction ${f.id}: zone needs numeric x/y`);
});

if (problems.length) {
}
/* Read once: intel.html carries the map/record-detail hosts, archive.js runs against the stub DOM later. */
const page = fs.readFileSync(__dirname + "/intel.html", "utf8");
const ui = fs.readFileSync(__dirname + "/archive.js", "utf8");
/* Per-mech session state mapped from COMPCON exports: keep it short, uppercase and safe to render. */
for (const m of C.mechs) {
  if (m.conditions == null) continue;
  if (!Array.isArray(m.conditions) || m.conditions.some(c => typeof c !== "string" || !/^[A-Z0-9][A-Z0-9 ·+-]{0,23}$/.test(c))) problems.push(`mech ${m.id}: conditions must be an array of short uppercase labels`);
}
if (require("node:child_process").spawnSync(process.execPath, [__dirname + "/tools/build-detail.cjs", "--check"], {stdio: "inherit"}).status !== 0) problems.push("detail.js stale vs campaign.js; regen: node tools/build-detail.cjs");
if (require("node:child_process").spawnSync(process.execPath, [__dirname + "/tools/md2html.cjs", "--check"], {stdio: "inherit"}).status !== 0) problems.push("guide page stale vs markdown; regen: node tools/md2html.cjs");
if (require("node:child_process").spawnSync(process.execPath, [__dirname + "/tools/chrome.cjs", "--selftest"], {stdio: "inherit"}).status !== 0) problems.push("tools/chrome.cjs selftest failed");
if (require("node:child_process").spawnSync(process.execPath, [__dirname + "/tools/loadout-check.cjs"], {stdio: "inherit"}).status !== 0) problems.push("loadout checks failed; run: node tools/loadout-check.cjs");
/* Design tests 6 and 7 live in this selftest and nothing else calls it, so CI never ran them. */
if (require("node:child_process").spawnSync(process.execPath, [__dirname + "/tools/apply-compcon.cjs", "--selftest"], {stdio: "inherit"}).status !== 0) problems.push("apply-compcon selftest failed; run: node tools/apply-compcon.cjs --selftest");
for (const [name, html] of [["solstice-rain.html", fs.readFileSync(__dirname + "/solstice-rain.html", "utf8")]])
  if (/href="(?:gm|solstice-rain-m1|solstice-rain-c[123])\.html"/.test(html)) problems.push(`${name}: crew page must not link to GM pages`);
/* Self-hosted faces: a missing woff2 degrades silently to the fallback stack. */
const theme = fs.readFileSync(__dirname + "/theme.css", "utf8");
const faces = [...theme.matchAll(/url\(([^)]+\.woff2)\)/g)].map(m => m[1]);
if (!faces.length) problems.push("theme.css: no self-hosted font faces declared");
faces.forEach(f => { if (!fs.existsSync(__dirname + "/" + f)) problems.push(`theme.css: missing font file ${f}`); });

if (!page.includes('id="record-detail"')) problems.push('intel.html: in-place record detail pane missing');
if (C.pilots.find(p => p.id === "dusty")?.img !== "assets/dusty.png" || !fs.existsSync(__dirname + "/assets/dusty.png")) problems.push('Dusty portrait missing from campaign roster/assets');
if (C.mechs.find(m => m.id === "tombstone")?.img !== "assets/tombstone.png") problems.push('Tombstone image path missing from campaign record');
if (/\.holo-chips|data-mech-class/.test(page)) problems.push('intel.html: map still exposes chassis selection controls');
/* Holomap frames. The builder is pure (UI.holomap), so every frame is asserted as returned data
   rather than as source substrings. Each frame's expected membership is recomputed here from the
   campaign records, the way idsOn once did, never by asking the builder's own members() — that
   would test the builder against itself. */
{
  const vm = require("node:vm");
  const box = { document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {} }, matchMedia: () => ({ matches: false, addEventListener: () => {} }), CSS: { escape: s => String(s) }, location: { hash: "" }, console };
  box.window = box;
  vm.createContext(box);
  let booted = true;
  try { vm.runInContext(fs.readFileSync(__dirname + "/campaign.js", "utf8"), box); vm.runInContext(fs.readFileSync(__dirname + "/archive.js", "utf8"), box); }
  catch (e) { booted = false; problems.push(`archive.js will not load under a stub DOM, so no frame can be checked: ${e.message}`); }
  const HOLO = booted && (box.UI || (box.window && box.window.UI)), D = booted && box.CAMPAIGN;
  if (booted && (!HOLO || typeof HOLO.holomap !== "function")) problems.push("archive.js: UI.holomap(frameId) missing, so the holomap cannot be checked per frame");
  else if (booted && D) {
    const by = Object.fromEntries(D.locations.map(l => [l.id, l]));
    /* Every frame the records produce: the root, and each body that is opened — the planet, its
       neighbour, the city on it and the district inside the city. */
    const FRAMES = ["SYSTEM", "cressidium", "tarn", "elysia", "industry"];
    /* members(F) from the records: SYSTEM draws every frameless record; another frame draws its
       subject, its framed children and its frameless satellites. The three sets never overlap —
       the clause that keeps rio drawn exactly once on elysia now that it carries both a frame and
       a parent of elysia. */
    const membersOf = F => F === "SYSTEM"
      ? D.locations.filter(l => !l.frame).map(l => l.id)
      : [F, ...D.locations.filter(l => l.frame === F).map(l => l.id), ...D.locations.filter(l => !l.frame && l.parent === F).map(l => l.id)];
    const drawn = fid => { let out; try { out = HOLO.holomap(fid); } catch (e) { problems.push(`UI.holomap("${fid}") threw: ${e.message}`); return null }
      if (!out || typeof out.world !== "string" || typeof out.key !== "string") { problems.push(`UI.holomap("${fid}") must return {world,key} strings`); return null }
      return { ids: [...out.world.matchAll(/data-loc="([^"]+)"/g)].map(m => m[1]), world: out.world, key: out.key, grid: String(out.grid || ""), aria: String(out.aria || ""), crumbs: String(out.crumbs || ""), locator: String(out.locator || ""), viewR: out.viewR, scale: out.scale }; };
    const fames = {};
    FRAMES.forEach(F => { fames[F] = drawn(F); });
    const CX = 500, CY = 240;
    const nodeSeg = (world, id) => { const at = world.indexOf(`data-loc="${id}"`); if (at < 0) return "";
      const start = world.lastIndexOf("<g ", at); let end = world.indexOf('<g class="node', at); if (end < 0) end = world.length;
      return world.slice(start, end); };
    const nodeMap = world => new Map([...world.matchAll(/<g class="node([^"]*)" data-loc="([^"]+)" data-x="(-?[\d.]+)" data-y="(-?[\d.]+)"/g)].map(m => [m[2], { cls: m[1], x: Number(m[3]), y: Number(m[4]) }]));
    const chainFrames = F => { const out = [F]; let f = by[F] && by[F].frame; const seen = new Set(out);
      while (f && !seen.has(f)) { seen.add(f); out.push(f); f = by[f].frame } out.push("SYSTEM"); return out; };
    const principals = () => D.locations.filter(l => !l.frame && !l.parent).map(l => l.id);
    const near = (a, b, tol) => Math.abs(a - b) <= tol;
    /* Rev-10 radii, mirrored here so the test recomputes placement from the records instead of
       trusting the builder's own constants: one radius per kind at 1x, the subject's disc rim,
       the pin's own 12, and the star's declared bearing. */
    const RADII = { PLANET: 54, MOON: 30, STATION: 26, "WRECK FIELD": 9, ORBITAL: 46, CITY: 9, DISTRICT: 8, FOB: 9, ZONE: 9 };
    const DISC_RIM = 72, PIN_R = 12, STAR_BEARING = 270, FIT_MARGIN = 24;
    const ARTK = ["PLANET", "MOON", "STATION", "WRECK FIELD", "ORBITAL"];
    const frameGeom = F => { const s = by[F];
      const same = membersOf(F).filter(id => id !== F && by[id].level === s.level);
      const offs = same.map(id => Math.hypot((by[id].x - s.x) * 10, (by[id].y - s.y) * 4.8));
      const pins = membersOf(F).filter(id => id !== F && by[id].level !== s.level);
      const radius = Math.max(DISC_RIM + (pins.length ? PIN_R : 0), ...same.map((id, i) => offs[i] + RADII[by[id].kind]));
      return { same, offs, pins, radius, scale: Math.min(1000, 480) / (2 * (radius + FIT_MARGIN)) }; };

    FRAMES.forEach(F => { const f = fames[F]; if (!f) return;
      const want = membersOf(F);
      /* Membership is the contract: the frame's data-loc set equals members(F) exactly, and every
         member appears exactly once — a second node carrying one id is a leak, not a satellite. */
      if (!want.length) problems.push(`campaign.js: frame ${F} has no members, so it cannot be checked`);
      want.forEach(id => { if (!f.ids.includes(id)) problems.push(`UI.holomap("${F}") omits member ${id}`); });
      f.ids.forEach(id => { if (!want.includes(id)) problems.push(`UI.holomap("${F}") draws ${id}, which is not a member of that frame`); });
      const dupes = [...new Set(f.ids.filter((id, i) => f.ids.indexOf(id) !== i))];
      if (dupes.length) problems.push(`UI.holomap("${F}") draws ${dupes.join(", ")} more than once: a second data-loc for one id is a leak, not a satellite`);

      /* Placement: nodes carry data-x/data-y, the placed coordinates intel's camera reads. On
         SYSTEM a record sits at its own x,y at fit 1; on a descended frame the subject is centred,
         same-scale members keep their own offsets multiplied by the fit scale, and a cross-scale
         member rides the subject's rim at the bearing its own record declares. */
      const nodes = nodeMap(f.world);
      want.forEach(id => { const n = nodes.get(id); if (!n) { problems.push(`UI.holomap("${F}"): ${id} has no placed node carrying data-x/data-y`); return }
        if (!Number.isFinite(n.x) || !Number.isFinite(n.y)) problems.push(`UI.holomap("${F}"): ${id}'s data-x/data-y must be numbers`); });
      if (F === "SYSTEM") {
        want.forEach(id => { const l = by[id], n = nodes.get(id); if (!n) return;
          if (!near(n.x, l.x * 10, .6) || !near(n.y, l.y * 4.8, .6)) problems.push(`UI.holomap("SYSTEM"): ${id} must sit at its own coordinates (${l.x * 10},${l.y * 4.8}), got (${n.x},${n.y})`); });
      } else {
        const s = by[F], g = frameGeom(F);
        want.forEach(id => { const l = by[id], n = nodes.get(id); if (!n) return;
          const dx = (l.x - s.x) * 10, dy = (l.y - s.y) * 4.8;
          if (id === F) { if (!near(n.x, CX, .6) || !near(n.y, CY, .6)) problems.push(`UI.holomap("${F}"): the subject must sit at the frame centre ${CX},${CY}`); }
          else if (l.level === s.level) { if (!near(n.x, CX + dx * g.scale, .6) || !near(n.y, CY + dy * g.scale, .6)) problems.push(`UI.holomap("${F}"): ${id} must keep its own offset from the subject at the fit scale (${(CX + dx * g.scale).toFixed(1)},${(CY + dy * g.scale).toFixed(1)}), got (${n.x},${n.y})`); }
          else {
            if (typeof l.pinBearing !== "number") problems.push(`UI.holomap("${F}"): cross-scale member ${id} must carry its own pinBearing, not inherit an angle`);
            else { const b = l.pinBearing * Math.PI / 180, r = DISC_RIM * g.scale;
              if (!near(n.x, CX + r * Math.sin(b), .6) || !near(n.y, CY - r * Math.cos(b), .6)) problems.push(`UI.holomap("${F}"): pin ${id} must ride the subject's rim at its declared bearing ${l.pinBearing} ((${(CX + r * Math.sin(b)).toFixed(1)},${(CY - r * Math.cos(b)).toFixed(1)}), got (${n.x},${n.y})`); }
          } });
        /* No same-scale member may sit inside the subject's disc or glyph. */
        const subjR = ARTK.includes(s.kind) ? DISC_RIM : RADII[s.kind];
        g.same.forEach((id, i) => { if (g.offs[i] < subjR + RADII[by[id].kind]) problems.push(`UI.holomap("${F}"): ${id} at offset ${g.offs[i].toFixed(1)} sits inside the subject's drawn extent (${subjR}+${RADII[by[id].kind]})`); });
        /* The pin is on the night face: within 90 degrees of the anti-star axis, and clear of
           every same-scale member by the sum of their drawn radii. */
        g.pins.forEach(id => { const l = by[id]; if (typeof l.pinBearing !== "number") return;
          const anti = (STAR_BEARING + 180) % 360, db = Math.abs(((l.pinBearing - anti + 540) % 360) - 180);
          if (db > 90) problems.push(`UI.holomap("${F}"): pin ${id} at bearing ${l.pinBearing} is ${db.toFixed(0)} degrees off the anti-star axis ${anti}: the pin must fall on the night face`);
          const b = l.pinBearing * Math.PI / 180, px = CX + DISC_RIM * g.scale * Math.sin(b), py = CY - DISC_RIM * g.scale * Math.cos(b);
          g.same.forEach((mid, i) => { const mn = nodes.get(mid); if (!mn) return;
            const need = (PIN_R + RADII[by[mid].kind]) * g.scale, d = Math.hypot(mn.x - px, mn.y - py);
            if (d < need) problems.push(`UI.holomap("${F}"): pin ${id} lands ${d.toFixed(1)} from ${mid}, inside their summed radii ${need.toFixed(1)}`); }); });
        /* The view radius is derived from the records: the subject's disc (plus the pin's 12 when
           one rides the rim) or the farthest same-scale member's offset plus that member's radius.
           rio must not set elysia's fit; kessen sets cressidium's. */
        if (typeof f.viewR !== "number" || !Number.isFinite(f.viewR)) problems.push(`UI.holomap("${F}") must return a numeric viewR derived from the records`);
        else if (!near(f.viewR, g.radius, .6)) problems.push(`UI.holomap("${F}"): view radius ${f.viewR} must equal the derived radius ${g.radius.toFixed(1)} (disc ${DISC_RIM}${g.pins.length ? " + pin " + PIN_R : ""} or farthest same-scale offset plus member radius)`);
        if (typeof f.scale !== "number" || !near(f.scale, g.scale, .001)) problems.push(`UI.holomap("${F}"): fit scale ${f.scale} must be min(view)/(2*(radius+${FIT_MARGIN})) = ${g.scale.toFixed(4)}`);
        if (F === "cressidium" && !near(g.radius, Math.hypot(160, 48) + RADII.STATION, 1)) problems.push('UI.holomap("cressidium"): the radius must be set by kessen at 167 plus its hex, not by the pin elysia');
        if (F === "elysia") { const vsaf = Math.hypot(260, -19.2) + RADII.ZONE, rio = Math.hypot(120, -172.8) + RADII.ORBITAL;
          if (!near(g.radius, vsaf, 1)) problems.push('UI.holomap("elysia"): the radius must be set by vsaf, not by the districts');
          if (rio >= vsaf) problems.push(`UI.holomap("elysia"): rio at ${rio.toFixed(1)} must not out-reach vsaf at ${vsaf.toFixed(1)}, or the hull would set the fit`); }
        /* Every placed body, centre and drawn radius, lands inside the viewBox with a margin. */
        want.forEach(id => { const n = nodes.get(id); if (!n) return;
          const r = (id === F ? (ARTK.includes(by[id].kind) ? DISC_RIM : RADII[by[id].kind]) : RADII[by[id].kind]) * g.scale;
          if (n.x - r < 24 || n.x + r > 976 || n.y - r < 24 || n.y + r > 456) problems.push(`UI.holomap("${F}"): ${id} at (${n.x},${n.y}) with drawn radius ${r.toFixed(1)} overhangs the viewBox margin`); });
      }

      /* Rings: an orbit ring takes its own child's radius, whether the parent is the frame's
         subject (rio over elysia) or a satellite (pell over cressidium). Recomputed here. */
      const ORB = ["MOON", "STATION", "ORBITAL"];
      const wantRings = want.filter(id => { const l = by[id]; return l.parent && l.parent !== id && ORB.includes(l.kind) && want.includes(l.parent); }).sort();
      const gotRings = [...f.world.matchAll(/<circle class="ring" data-ring="([^"]+)"[^>]*r="(\d+)"/g)].map(m => `${m[1]}:${m[2]}`);
      const wantRingStrs = wantRings.map(id => { const l = by[id], p = nodes.get(l.parent), c = nodes.get(id);
        return `${l.parent}:${p && c ? Math.round(Math.hypot(c.x - p.x, c.y - p.y)) : "?"}`; }).sort();
      if (gotRings.slice().sort().join("|") !== wantRingStrs.join("|")) problems.push(`UI.holomap("${F}"): orbit rings ${gotRings.sort().join("|") || "none"} disagree with the records (${wantRingStrs.join("|") || "none"})`);
      if (wantRings.length && !f.key.includes('class="k-orbit"')) problems.push(`UI.holomap("${F}") key must list ORBIT: the frame draws orbit rings`);
      if (!wantRings.length && f.key.includes('class="k-orbit"')) problems.push(`UI.holomap("${F}") key must not offer ORBIT: nothing orbits on that frame`);

      /* Head, grid and aria derive from the subject's kind, not from a level band. Only the root's
         grid label carries units: a fitted frame draws the fixed 50 px texture at some other scale,
         where a units label would be false. */
      const wantGrid = F === "SYSTEM" ? "SECTOR GRID · 50 U" : ARTK.includes(by[F].kind) ? "ORBIT GRID" : by[F].kind === "CITY" ? "THEATER GRID" : "GROUND GRID";
      if (f.grid !== wantGrid) problems.push(`UI.holomap("${F}").grid must read "${wantGrid}", got "${f.grid}"`);
      if (F === "SYSTEM") { if (!/Sector holomap/.test(f.aria)) problems.push('UI.holomap("SYSTEM").aria must announce the sector frame'); }
      else {
        if (!f.aria.includes(by[F].name)) problems.push(`UI.holomap("${F}").aria must name the frame's subject ${by[F].name}`);
        const pinHere = want.some(id => id !== F && by[id].level !== by[F].level);
        if (pinHere !== f.aria.includes("POSITION ON DISC DECLARED")) problems.push(`UI.holomap("${F}").aria must say POSITION ON DISC DECLARED exactly when the frame draws a pin`);
      }
      /* The scale claim is a set equality that can fail: the cross-scale members of every frame,
         pair by pair, are exactly the records carrying a pinBearing; a bearing on a record that is
         not a cross-scale member of its home frame fails too. */
      FRAMES.forEach(G => { const s2 = by[G]; if (!s2) return;
        membersOf(G).forEach(id => { if (id === G) return; const l = by[id];
          if (l.level !== s2.level && typeof l.pinBearing !== "number") problems.push(`campaign.js: ${id} is cross-scale on ${G} and carries no pinBearing`);
          if (typeof l.pinBearing === "number" && l.level === s2.level) problems.push(`campaign.js: ${id} carries pinBearing but is not cross-scale on ${G}: a bearing with no pin to carry it`); }); });

      /* The key lists exactly the kinds the frame carries, plus the conditional chips. STAR is the
         declared invention: it is no record's kind, and the chip says so outright. */
      const CHIPVOCAB = ["UNVISITED", "CURRENT OP", "TRAVELLED", "PLANNED LEG", "ORBIT", "STAR · NO FILE"];
      const labels = [...f.key.matchAll(/<span class="k-shape [^"]*"><\/span>([^<]+)<\/li>/g)].map(m => m[1]);
      const kinds = [...new Set(want.map(id => by[id].kind))];
      const kindLabels = labels.filter(t => !CHIPVOCAB.includes(t));
      kinds.forEach(k => { if (!kindLabels.includes(k)) problems.push(`UI.holomap("${F}") key omits kind ${k}, which the frame carries`); });
      kindLabels.forEach(k => { if (!kinds.includes(k)) problems.push(`UI.holomap("${F}") key lists kind ${k}, which no node on the frame carries`); });
      if (labels.includes("UNVISITED") !== want.some(id => !by[id].visited)) problems.push(`UI.holomap("${F}") key's UNVISITED entry disagrees with the members' visited flags`);
      if (f.key.includes("SYSTEM VIEW")) problems.push(`UI.holomap("${F}") key must not offer SYSTEM VIEW: the way out is the breadcrumb`);
      if ((F === "SYSTEM") !== labels.includes("STAR · NO FILE")) problems.push(`UI.holomap("${F}"): the STAR · NO FILE chip belongs to the system frame alone`);

      /* The star is drawn, declared and no location: procedural SVG at the declared bearing from
         the viewBox centre, at the root's greatest body-centre distance, role=img, no data-loc,
         and no other frame carries one. */
      const starTag = (f.world.match(/<g class="star"[^>]*>/) || [""])[0];
      if (F === "SYSTEM") {
        if (!starTag) problems.push('UI.holomap("SYSTEM") must draw the primary star');
        else {
          if (!/role="img"/.test(starTag)) problems.push('the star node must carry role="img": an aria-label on a bare <g> is ignored by several screen readers');
          if (/data-loc/.test(starTag)) problems.push("the star is not a location: its node must carry no data-loc");
          if (/data-frame/.test(starTag)) problems.push("the star carries no data-frame: holomap(star) does not exist and a data-frame on it would throw");
          const starR = Math.max(...want.map(id => Math.hypot(by[id].x * 10 - CX, by[id].y * 4.8 - CY)));
          const sx = CX + starR * Math.sin(STAR_BEARING * Math.PI / 180), sy = CY - starR * Math.cos(STAR_BEARING * Math.PI / 180);
          if (!new RegExp(`translate\\(${sx.toFixed(1)} ${sy.toFixed(1)}\\)`).test(starTag)) problems.push(`the star sits at its declared bearing ${STAR_BEARING} and radius ${starR.toFixed(1)}: translate(${sx.toFixed(1)} ${sy.toFixed(1)}), not a typed pixel`);
          const sd = starTag.match(/data-x="([^"]+)" data-y="([^"]+)"/) || [];
          if (!near(+sd[1], sx, .6) || !near(+sd[2], sy, .6)) problems.push(`the star's data-x/data-y must be its placed position (${sx.toFixed(1)},${sy.toFixed(1)})`);
          if (sx < 24 || sx > 976 || sy < 24 || sy > 456) problems.push(`the star at (${sx.toFixed(1)},${sy.toFixed(1)}) must land inside the viewBox with a margin`);
        }
      } else if (starTag) problems.push(`UI.holomap("${F}") must not draw the star: it belongs to the system frame`);

      /* Art bodies: a planet's or moon's markup references assets/<id>-thumb.webp through an SVG
         clipPath; a station's plate never uses the disc clip; clipPath ids are unique within the
         mounted frame, because duplicate ids silently cross-wire two clips. */
      want.forEach(id => { const l = by[id], seg = nodeSeg(f.world, id);
        if ((l.kind === "PLANET" || l.kind === "MOON") && !seg.includes(`assets/${id}-thumb.webp`)) problems.push(`UI.holomap("${F}"): ${id} is a ${l.kind} and must draw as an art disc referencing assets/${id}-thumb.webp`);
        if (l.kind === "STATION") { const clip = (seg.match(/<clipPath id="[^"]+">([\s\S]*?)<\/clipPath>/) || [])[1];
          if (!clip || !/<polygon/.test(clip) || /<circle/.test(clip)) problems.push(`UI.holomap("${F}"): station ${id} must clip to a hex plate, not the disc clip — a station is not a ball`); } });
      const clipIds = [...f.world.matchAll(/<clipPath id="([^"]+)"/g)].map(m => m[1]);
      const clipDupes = [...new Set(clipIds.filter((x, i) => clipIds.indexOf(x) !== i))];
      if (clipDupes.length) problems.push(`UI.holomap("${F}"): duplicate clipPath ids ${clipDupes.join(", ")}`);

      /* The breadcrumb: one real button per ancestor walking the frame chain, terminating at
         SYSTEM, plus UP ONE LEVEL where the SYSTEM VIEW key chip used to be. Never a data-loc. */
      if (/data-loc=/.test(f.crumbs)) problems.push(`UI.holomap("${F}"): crumbs must carry data-frame, never data-loc`);
      if (F === "SYSTEM") {
        if (/<button/.test(f.crumbs)) problems.push('UI.holomap("SYSTEM"): the root frame has no ancestors, so its breadcrumb carries no buttons');
        if (!f.crumbs.includes("CRESSIDIUM SYSTEM")) problems.push('UI.holomap("SYSTEM"): the breadcrumb must name the system frame');
      } else {
        const anc = chainFrames(F).slice(1);
        const btns = [...f.crumbs.matchAll(/<button[^>]*data-frame="([^"]+)"/g)].map(m => m[1]);
        if (!f.crumbs.includes("UP ONE LEVEL")) problems.push(`UI.holomap("${F}"): the breadcrumb must carry UP ONE LEVEL, the SYSTEM VIEW chip's successor`);
        if (btns.length !== anc.length + 1) problems.push(`UI.holomap("${F}"): the breadcrumb needs one button per ancestor (${anc.length}) plus UP ONE LEVEL, got ${btns.length}`);
        if (btns[0] !== anc[0]) problems.push(`UI.holomap("${F}"): UP ONE LEVEL must target the parent frame ${anc[0]}`);
        if (btns.slice(1).join(",") !== anc.join(",")) problems.push(`UI.holomap("${F}"): crumb buttons must walk the frame chain ${anc.join(" › ")}, got ${btns.slice(1).join(" › ")}`);
        if (btns[btns.length - 1] !== "SYSTEM") problems.push(`UI.holomap("${F}"): the breadcrumb must terminate at SYSTEM`);
        if (!f.crumbs.includes(by[F].name)) problems.push(`UI.holomap("${F}"): the breadcrumb must name the current frame`);
      }

      /* The system locator: every non-SYSTEM frame carries the principal bodies plus the declared
         star as real buttons outside the world, with exactly one active — the ancestor found by
         walking the frame chain, not parent. data-frame only, never data-loc, never class node. */
      if (F === "SYSTEM") { if (f.locator !== "") problems.push('UI.holomap("SYSTEM") must carry no locator: the system is already in view'); }
      else {
        const prins = principals();
        const lbtns = [...f.locator.matchAll(/<button[^>]*class="loc-body([^"]*)"[^>]*data-frame="([^"]+)"/g)].map(m => ({ cls: m[1], id: m[2] }));
        if (lbtns.map(b => b.id).join(",") !== prins.join(",")) problems.push(`UI.holomap("${F}"): the locator must list exactly the principal bodies ${prins.join(", ")}, got ${lbtns.map(b => b.id).join(", ") || "none"}`);
        if (/data-loc=/.test(f.locator)) problems.push(`UI.holomap("${F}"): locator nodes must carry data-frame, never data-loc`);
        if (/class="node/.test(f.locator)) problems.push(`UI.holomap("${F}"): locator nodes must never carry class="node"`);
        const act = lbtns.filter(b => /\bactive\b/.test(b.cls));
        if (act.length !== 1) problems.push(`UI.holomap("${F}"): the locator must mark exactly one active body, got ${act.length}`);
        else { const wantAct = chainFrames(F).find(x => prins.includes(x));
          if (act[0].id !== wantAct) problems.push(`UI.holomap("${F}"): the locator's active body must be ${wantAct}, the ancestor of the frame, got ${act[0].id}`); }
        if (!/STAR/.test(f.locator)) problems.push(`UI.holomap("${F}"): the locator's body set is the principals plus the declared star`);
      }

      /* The ENTER chip lives in the pane and appears iff the frame holds more than its subject,
         so tarn has one and pell does not. It carries data-frame: descent, not the retired level. */
      const pane = String(HOLO.unitFile ? HOLO.unitFile(F === "SYSTEM" ? "cressidium" : F) : "");
      if (/ENTER THEATER/.test(pane)) problems.push(`unitFile still says ENTER THEATER: descent is by frame now, not by level`);
    });

    /* ENTER iff, over every record: members(id) beyond the subject is the whole condition. */
    if (typeof HOLO.unitFile !== "function") problems.push("archive.js: UI.unitFile(id) missing, so the map pane cannot be checked");
    else D.locations.forEach(l => { const pane = String(HOLO.unitFile(l.id));
      const want = membersOf(l.id).length > 1, has = pane.includes(`data-frame="${l.id}"`) && pane.includes(`ENTER ${l.name}`);
      if (want !== has) problems.push(`unitFile("${l.id}"): the ENTER ${l.name} chip ${want ? "is missing, though its frame holds more than its subject" : "must not appear: its frame holds only its subject"}`);
    });

    if (fames.SYSTEM && !nodeSeg(fames.SYSTEM.world, "cressidium").includes("NOV ELYSIA SITE")) problems.push('UI.holomap("SYSTEM") must show NOV ELYSIA as a site chip under cressidium: a framed site hangs under the body it sits on');

    /* The missing principals are identified by portrait on the map pane, not only by name. */
    const missingPane = HOLO.unitFile ? HOLO.unitFile("elysia") : "";
    if (!HOLO.unitFile) problems.push("archive.js: UI.unitFile(id) missing, so the map pane cannot be checked");
    else D.personnel.filter(p => p.status === "MISSING").forEach(p => {
      if (!missingPane.includes(p.img)) problems.push(`unitFile("elysia") omits ${p.id}'s portrait (${p.img}), so a missing principal reads there as a name only`);
    });
    if (!/class="p-face"/.test(missingPane)) problems.push('unitFile must pair personnel portraits with their chips (class="p-face")');

    /* Pinch is the one map gesture a stub cannot perform, so its decision function is kept pure. */
    if (typeof HOLO.pinchIntent !== "function") problems.push("archive.js: UI.pinchIntent(ratio) missing, so the pinch gesture cannot be checked");
    else [[2, "in"], [1.4, "in"], [1.34, ""], [1, ""], [.8, ""], [.74, "out"], [.5, "out"]].forEach(([r, want]) => {
      const got = HOLO.pinchIntent(r);
      if (got !== want) problems.push(`UI.pinchIntent(${r}) = "${got}", want "${want}": pinch thresholds must stay hysteretic`);
    });

    /* Record wiring: ids become markup and frames become routes. level stays on the record as the
       scale of its coordinates; frame must name a location that exists, never the record itself,
       and a parent must be drawn where the child rides. */
    const KINDS = ["PLANET", "MOON", "STATION", "WRECK FIELD", "CITY", "DISTRICT", "FOB", "ZONE", "ORBITAL"];
    D.locations.forEach(l => {
      if (l.level !== "SYSTEM" && l.level !== "THEATER") problems.push(`location ${l.id}: level must be SYSTEM or THEATER, got ${JSON.stringify(l.level)}`);
      if (!KINDS.includes(l.kind)) problems.push(`location ${l.id}: kind ${JSON.stringify(l.kind)} is outside the closed set`);
      if (l.frame != null) {
        if (typeof l.frame !== "string" || !by[l.frame]) problems.push(`location ${l.id}: frame ${JSON.stringify(l.frame)} must name a location that exists`);
        if (l.frame === l.id) problems.push(`location ${l.id}: frame must not name the location itself`);
      }
      if (l.parent) { const p = by[l.parent];
        if (!p) problems.push(`location ${l.id}: parent ${l.parent} does not exist`);
        else if (l.frame) { if (!membersOf(l.frame).includes(l.parent)) problems.push(`location ${l.id}: parent ${l.parent} is not drawn on frame ${l.frame}, so the child rides nothing`); }
        else if (p.frame) problems.push(`location ${l.id}: a frameless satellite's parent ${l.parent} must itself be frameless, a principal of SYSTEM`); }
    });
    /* The migration itself, pinned: these re-values are what make the five frames real. */
    if (by.cressidium?.kind !== "PLANET") problems.push("cressidium must be a PLANET: the prose calls Nov Elysia a city on it");
    if (by.elysia?.kind !== "CITY") problems.push("elysia must be a CITY, not a planet");
    if (by.elysia?.frame !== "cressidium") problems.push("elysia must keep frame cressidium: it is a pin on the planet and the whole of its own frame");
    if (by.pell?.parent !== "cressidium") problems.push("pell must orbit cressidium, not the city");
    if (by.rio?.frame !== "elysia" || by.rio?.parent !== "elysia") problems.push("rio must carry frame elysia and parent elysia: the hull orbits the city and is drawn exactly once there");
    ["district", "industry", "dropzone", "vsaf"].forEach(id => { if (by[id]?.frame !== "elysia") problems.push(`${id} must carry frame elysia: the advance is on the city's ground`); });
    if (by.dock?.frame !== "industry") problems.push("dock must carry frame industry: the FOB sits inside the industrial district");
    ["cressidium", "tarn", "cairn", "pell", "kessen", "harrow"].forEach(id => { if (by[id] && by[id].frame) problems.push(`${id} must keep no frame: it belongs to the root frame`); });
    D.factions.forEach(x => { if (x.zone && x.zone.frame !== "elysia") problems.push(`faction ${x.id}: its zone must carry frame elysia, so a zone is drawn where its own record says`); });
    if (!by.dock || !by.elysia) problems.push("dock and elysia ids must survive: index.html builds a route from dock and ops carry loc elysia");

    const src = fs.readFileSync(__dirname + "/campaign.js", "utf8");
    /* The order is the source of truth. Each note must carry a phrase the OPORD still contains, so
       changing either side of the pair breaks this. Reading the OPORD region and not the notes is
       what stops the check from grading its own prose. */
    const order = src.slice(src.indexOf("opord:"), src.indexOf("threads:"));
    const grounded = [["elysia", "conducting siege operations against the city"],
     ["district", "assume VSAF infantry and armour in both the industrial and central districts"],
     ["industry", "the Amanta Motors factory in the industrial district"],
     ["dock", "FOB SABER RENDEZVOUS"],
     ["dropzone", "Dropship Kingfisher 2-2"],
     ["rio", "UNS Rio Grande in high orbit, lightly armed"],
     ["vsaf", "hold the approaches to Nov Elysia's central district"]];
    grounded.forEach(([id, quote]) => {
      const l = D.locations.find(x => x.id === id);
      if (!l) { problems.push(`location ${id} is missing`); return; }
      if (!String(l.notes).includes(quote)) problems.push(`location ${id}: its note must quote the order ("${quote}")`);
      if (!order.includes(quote)) problems.push(`location ${id}: the order no longer says "${quote}", so that note is no longer grounded`);
    });
    /* The chart entries below the OPORD's notice name no operation, so there is no order phrase to
       quote them to. Anchoring a phrase of each note here stops one being rewritten silently; the
       anchor is duplicated prose on purpose, because nothing else records what these six say. */
    const chartOnly = [["cressidium", "mustered in orbit above it"],
     ["pell", "tide-locked over the city's night side"],
     ["kessen", "holding Cressidium's inner lane"],
     ["cairn", "cut apart under contract"],
     ["tarn", "the only other one charted"],
     ["harrow", "holds the Tarn approach"]];
    chartOnly.forEach(([id, anchor]) => {
      const l = D.locations.find(x => x.id === id);
      if (!l) { problems.push(`location ${id} is missing`); return; }
      if (!String(l.notes).includes(anchor)) problems.push(`location ${id}: its note no longer says "${anchor}" — update this anchor if the change was intended`);
    });
    const unguarded = D.locations.map(l => l.id)
      .filter(id => !grounded.some(([g]) => g === id) && !chartOnly.some(([c]) => c === id));
    if (unguarded.length) problems.push(`location notes with no assertion at all: ${unguarded.join(", ")}`);

    /* The leg legend must follow the lines actually drawn, not whether any site on the route was
       visited: a route from a visited origin to a planned site has no travelled leg on it. Op
       001's leg (dock → elysia) is drawn on exactly one frame — the deepest holding both ends. */
    const legFrames = FRAMES.filter(F => fames[F] && fames[F].world.includes('data-leg="dock-elysia"'));
    if (legFrames.length !== 1 || legFrames[0] !== "elysia") problems.push(`op 001's leg (dock → elysia) must be drawn on exactly one frame, elysia; got: ${legFrames.join(", ") || "none"}`);
    const zoneFrames = FRAMES.filter(F => fames[F] && /<ellipse/.test(fames[F].world));
    if (zoneFrames.length !== 1 || zoneFrames[0] !== "elysia") problems.push(`faction zones are drawn where zone.frame says — on elysia alone; got: ${zoneFrames.join(", ") || "none"}`);
    if (fames.elysia) {
      const n = (fames.elysia.world.match(/<ellipse/g) || []).length, want = D.factions.filter(x => x.zone && x.zone.frame === "elysia").length;
      if (n !== want) problems.push(`UI.holomap("elysia") must draw all ${want} faction zones, drew ${n}`);
      if (!fames.elysia.world.includes('cx="500.0" cy="240.0"')) problems.push('UI.holomap("elysia"): the Vestan zone is centred on elysia itself, so it must sit at the frame centre 500,240');
    }
    const keyOf = () => { try { return HOLO.holomap("elysia").key } catch { return "" } };
    if (!keyOf().includes("PLANNED LEG")) problems.push("elysia's key must list PLANNED LEG while the operation's site is unvisited");
    if (keyOf().includes("TRAVELLED")) problems.push("elysia's key claims TRAVELLED although no drawn leg ends at a visited site");
    const ely = D.locations.find(l => l.id === "elysia");
    if (ely) { ely.visited = true;
      if (!keyOf().includes("TRAVELLED")) problems.push("elysia's key must list TRAVELLED once a drawn leg ends at a visited site");
      ely.visited = false; }

    /* A site inside a district is not in orbit; only moons, stations and orbitals orbit. */
    if (!HOLO.unitFile("dock").includes("WITHIN")) problems.push("FOB Saber's pane row must read WITHIN: its parent is a district");
    if (HOLO.unitFile("dock").includes("IN ORBIT")) problems.push("FOB Saber's pane must not claim IN ORBIT: its parent is a district");
    if (!HOLO.unitFile("pell").includes("IN ORBIT")) problems.push("pell is a moon, so its pane row must read IN ORBIT");

    const bad = extra => { D.locations.push(Object.assign({ id: "zz", name: "ZZ", kind: "PLANET", x: 50, y: 50, level: "SYSTEM" }, extra)); let threw = false; try { HOLO.holomap("SYSTEM"); } catch (e) { threw = true } D.locations.pop(); return threw; };
    if (!bad({ kind: "NOPE" })) problems.push("UI.holomap must throw on an unknown kind instead of drawing a wreck field");
    /* A frame id that names nothing is a fault, and so is a cycle in the frame chain: the stack
       has to stay finite and climbing has to terminate at SYSTEM. */
    const threw = fid => { try { HOLO.holomap(fid); return false } catch { return true } };
    if (!threw("SURFACE")) problems.push("UI.holomap must throw on an unknown frame id, not draw an empty frame");
    if (!threw(undefined)) problems.push("UI.holomap must throw when asked for no frame at all");
    if (!threw("THEATER")) problems.push('UI.holomap must throw on the retired level name THEATER: frames are keyed by subject, not by level');
    D.locations.push({ id: "cy-a", name: "CY-A", kind: "STATION", level: "SYSTEM", x: 1, y: 1, frame: "cy-b" },
      { id: "cy-b", name: "CY-B", kind: "STATION", level: "SYSTEM", x: 2, y: 2, frame: "cy-a" });
    if (!threw("cy-a")) problems.push("UI.holomap must throw on a two-node frame cycle: climbing has to terminate");
    D.locations.pop(); D.locations.pop();

    /* CURRENT OP absence is only worth asserting because the test can make it fail: op 001 is
       PLANNED/UNBRIEFED, so cur is empty and "absent everywhere" is true by construction. Flip
       the op to flown for the duration, assert where the ring appears — ancestors and locator
       included — and restore it, the way the elysia.visited flip above works. */
    const curChain = id => { const out = [id]; let f = by[id] && by[id].frame; const seen = new Set(out);
      while (f && !seen.has(f)) { seen.add(f); out.push(f); f = by[f].frame } return out; };
    FRAMES.forEach(F => { const f = fames[F]; if (!f) return;
      if (/ cur[ "]/.test(f.world) || f.key.includes("CURRENT OP") || / cur[ "]/.test(f.locator)) problems.push(`UI.holomap("${F}"): no CURRENT OP marker may appear anywhere while ops[0] is PLANNED/UNBRIEFED, ancestors included`); });
    const o0 = D.ops[0], t0 = o0.type, s0 = o0.status;
    o0.type = "SECURE"; o0.status = "ACTIVE";
    const chain = curChain(o0.loc);
    FRAMES.forEach(F => { const f2 = drawn(F); if (!f2) return;
      const cls = nodeMap(f2.world);
      membersOf(F).forEach(id => { const c = (cls.get(id) || { cls: "" }).cls;
        if (c.includes(" cur") !== chain.includes(id)) problems.push(`flown op 001: ${id} on frame ${F} ${chain.includes(id) ? "must carry" : "must not carry"} the current-op ring`); });
      if (f2.key.includes("CURRENT OP") !== membersOf(F).some(id => chain.includes(id))) problems.push(`flown op 001: frame ${F}'s CURRENT OP chip disagrees with the drawn ring rule`);
      if (F !== "SYSTEM") { const act = [...f2.locator.matchAll(/<button[^>]*class="loc-body([^"]*)"[^>]*data-frame="([^"]+)"/g)].find(m => /\bactive\b/.test(m[1]));
        if (act && /\bcur\b/.test(act[1]) !== chain.includes(act[2])) problems.push(`flown op 001: the locator's active body ${act && act[2]} ${act && chain.includes(act[2]) ? "must carry" : "must not carry"} the current-op mark`); }
    });
    o0.type = t0; o0.status = s0;
    FRAMES.forEach(F => { const f3 = drawn(F); if (f3 && (/ cur[ "]/.test(f3.world) || f3.key.includes("CURRENT OP"))) problems.push(`UI.holomap("${F}"): the CURRENT OP marker must disappear again once ops[0] is restored to PLANNED/UNBRIEFED`); });
  }
}

/* Rendered, not source: assertions read the markup tools/render.cjs produces by running each page's
   scripts against a stub DOM. A stray literal left inside a card template (e.g. a mis-counted paren)
   reaches the page as text between tags, which a source regex cannot see; minified source also made
   template-text matches report false positives. */
const { mount } = require("./tools/render.cjs");

/* #28 session-log stepper: the emission is pure, the round trip goes through the CLI's own
   parser, and the stepper is driven under the stub the way a GM clicks it. */
{
  const STATS10 = ["dealt", "taken", "structure", "repairs", "hacks", "kills", "heat", "overcharge", "core", "moves"];
  const S = mount("campaign.html").window.UI;
  const entries = [
    { pilot: "daemon", deployed: true, stats: { dealt: 14, taken: 0, repairs: 3 } },
    { pilot: "spook", deployed: false, stats: { dealt: 9 } },
    { pilot: "dusty", deployed: true, stats: {} },
  ];
  const block = S.sessionBlock(entries, "001", "2026-10-19");
  if (block !== "session op=001 date=2026-10-19\ndaemon dealt=14 taken=0 repairs=3")
    problems.push(`UI.sessionBlock emitted the wrong grammar:\n${block}`);
  const { parseBlock } = require("./tools/apply-compcon.cjs");
  const parsed = parseBlock(block, { ops: C.ops.map(o => String(o.id)), pilots: C.pilots.map(p => p.id), stats: STATS10, ledger: [] });
  if (parsed.errors.length || parsed.rows.length !== 1 || parsed.rows[0].stats.taken !== 0)
    problems.push(`the emitted block must round-trip through parseBlock: ${parsed.errors.join("; ")}`);
  const zero = S.ledgerPanel([{ op: "001", date: "2026-10-19", pilot: "daemon", dealt: 0 }]);
  if (!zero.html.includes("DAMAGE DEALT") || !/>0</.test(zero.html)) problems.push("a logged zero must keep its column and render as 0, not vanish");
  const stepThrough = m => { for (let i = 0; i < C.pilots.length && m.nodes["sl-next"]; i++) m.nodes["sl-next"].fire("click"); };
  const walk = mount("campaign.html"), n = walk.nodes, second = C.pilots[1].id;
  if (!n["sl-deploy-daemon"] || !n["sl-step"]) problems.push("campaign.html: the session form must render the first pilot's card on mount");
  else {
  if (!/id="sl-daemon-dealt"[^>]*disabled/.test(n["sl-step"].innerHTML)) problems.push("an undeployed pilot's stat fields must start disabled");
  n["sl-date"].value = "2026-10-19";
  n["sl-deploy-daemon"].checked = true; n["sl-deploy-daemon"].fire("change");
  if (/id="sl-daemon-dealt"[^>]*disabled/.test(n["sl-step"].innerHTML)) problems.push("deploying a pilot must enable their stat fields");
  n["sl-daemon-dealt"].value = "14"; n["sl-daemon-taken"].value = "0";
  n["sl-more-daemon"].checked = true; n["sl-more-daemon"].fire("change");
  if (!n["sl-daemon-hacks"]) problems.push("the more toggle must reveal the six extra stats");
  n["sl-daemon-hacks"].value = "2";
  n["sl-next"].fire("click");
  if (!n["sl-deploy-" + second]) problems.push("next must step to the second pilot");
  n["sl-back"].fire("click");
  if (!n["sl-daemon-dealt"] || n["sl-daemon-dealt"].value !== "14") problems.push("back must restore what was typed");
  stepThrough(walk);
  const pre = n["sl-block"];
  if (!pre || !String(pre.textContent).includes("daemon dealt=14 taken=0 hacks=2"))
    problems.push("the review step must show the emitted block, got: " + (pre ? pre.textContent : "no sl-block"));
  if (!n["sl-copy"]) problems.push("the review step must offer copy when there is a block");
  }
  const bare = mount("campaign.html");
  if (bare.nodes["sl-date"]) {
  bare.nodes["sl-date"].value = "2026-10-19";
  stepThrough(bare);
  if (!bare.nodes["sl-review"] || !/NOBODY DEPLOYED/i.test(bare.nodes["sl-review"].innerHTML)) problems.push("with nobody deployed the review must say so");
  if (bare.nodes["sl-block"] || bare.nodes["sl-copy"]) problems.push("with nobody deployed there is no block and nothing to copy");
  }
  const nodate = mount("campaign.html");
  if (nodate.nodes["sl-deploy-daemon"]) {
  nodate.nodes["sl-deploy-daemon"].checked = true; nodate.nodes["sl-deploy-daemon"].fire("change");
  nodate.nodes["sl-daemon-dealt"].value = "3";
  stepThrough(nodate);
  if (!nodate.nodes["sl-review"] || !/SET A DATE/i.test(nodate.nodes["sl-review"].innerHTML)) problems.push("without a date the review must ask for one, not emit a block the CLI would refuse");
  }
}

/* #14 ledger session cards: grouped by op and date, one card per logged session, per-pilot
   numbers with zeros kept; asserted on fixture rows because the live ledger is empty by design. */
{
  const S2 = mount("index.html").window.UI;
  const fx = [
    { op: "001", date: "2026-10-19", pilot: "daemon", dealt: 14, taken: 0 },
    { op: "001", date: "2026-10-19", pilot: "dusty", hacks: 2 },
    { op: "001", date: "2026-10-12", pilot: "spook", dealt: 9 },
  ];
  const cards = S2.sessionCards(fx);
  if (cards.count !== 2) problems.push(`sessionCards must group by op and date, got ${cards.count} cards`);
  if ((cards.html.match(/<li>/g) || []).length !== 2) problems.push("each logged session must render exactly one card");
  if (!cards.html.includes("taken 0")) problems.push("a logged zero must reach the session card");
  if (!/R\. VARGSKEL[\s\S]{0,80}?dealt 14/.test(cards.html)) problems.push("a session card must carry its pilot's numbers beside the pilot's name");
  if (!(cards.html.indexOf("2026-10-12") < cards.html.indexOf("2026-10-19"))) problems.push("session cards must read oldest first");
  const empty = S2.sessionCards([]);
  if (empty.count || !/No sessions logged yet/.test(empty.html)) problems.push("an empty ledger must render no cards");
  const idx = mount("index.html");
  if (!idx.nodes["session-cards"] || !/No sessions logged yet/.test(idx.nodes["session-cards"].innerHTML)) problems.push("index DEEDS must say so while the ledger is empty");
}

/* #16 attendance strip: six cells derived from the ledger alone, plus the last-session line,
   degrading to the no-sessions state. Fixture rows again, live ledger empty by design. */
{
  const S3 = mount("index.html").window.UI;
  const fx = [
    { op: "001", date: "2026-10-19", pilot: "daemon", dealt: 14 },
    { op: "001", date: "2026-10-19", pilot: "dusty", hacks: 2 },
    { op: "001", date: "2026-10-12", pilot: "daemon", dealt: 9 },
  ];
  const strip = S3.attendanceStrip(fx);
  const cells = [...strip.html.matchAll(/data-pilot="([^"]+)"[^>]*>([\s\S]*?)<\/span>/g)].map(m => [m[1], m[2]]);
  if (cells.length !== C.pilots.length) problems.push(`the attendance row must carry all ${C.pilots.length} pilots, got ${cells.length}`);
  const countOf = id => { const c = cells.find(x => x[0] === id); return c ? (c[1].match(/<b>(\d+)<\/b>/) || [])[1] : undefined; };
  if (countOf("daemon") !== "2" || countOf("dusty") !== "1" || countOf("spook") !== "0")
    problems.push(`attendance counts wrong: daemon ${countOf("daemon")}, dusty ${countOf("dusty")}, spook ${countOf("spook")}`);
  if (!strip.html.includes("2026-10-19") || !/SOLSTICE RAIN/.test(strip.html)) problems.push("the last-session line must name the newest date and its op");
  if (/2026-10-12/.test(strip.html.replace(/data-pilot[\s\S]*$/, ""))) problems.push("the last-session line must not name an older session");
  const none = S3.attendanceStrip([]);
  if (!/No sessions logged yet/.test(none.html)) problems.push("an empty ledger must degrade the strip to the no-sessions state");
  const idx = mount("index.html");
  if (!idx.nodes["attendance-strip"] || !/No sessions logged yet/.test(idx.nodes["attendance-strip"].innerHTML)) problems.push("index must render the degraded strip while the ledger is empty");
}
const cardsOf = h => h.split("</article>").filter(c => c.includes("<article"));
const crewPage = mount("pilots.html"), crewCards = cardsOf(crewPage.html("crew-list"));
if (crewCards.length !== C.pilots.length) problems.push(`pilots.html: crew-list rendered ${crewCards.length} cards, want ${C.pilots.length}`);
C.pilots.forEach(p => {
  const card = crewCards.find(c => c.includes(`data-pilot="${p.id}"`)) || "";
  if (!card) return problems.push(`pilots.html: no rendered card for pilot ${p.id}`);
  ["TRIGGERS", "TALENTS", "GEAR"].forEach(r => { if (!card.includes(`>${r}</th>`)) problems.push(`pilots.html: ${p.id} card missing ${r} row`); });
  if (!card.includes(crewPage.window.UI.esc(p.name))) problems.push(`pilots.html: ${p.id} card missing pilot name`);
  if (!card.includes(`href="pilot.html#${p.id}"`)) problems.push(`pilots.html: ${p.id} card missing pilot.html#${p.id} link`);
});
const mechCards = cardsOf(mount("mechbay.html").html("mech-list"));
if (mechCards.length !== C.mechs.length) problems.push(`mechbay.html: mech-list rendered ${mechCards.length} cards, want ${C.mechs.length}`);
mechCards.forEach((card, i) => ["PILOT", "ROLE", "STATE", "LOADOUT", "SYSTEMS"].forEach(r => { if (!card.includes(`>${r}</th>`)) problems.push(`mechbay.html: mech card ${i} missing ${r} row`); }));
const cardHtml = mechCards[0] || "";
if (!cardHtml) problems.push("archive.js: mech roster rendered no card");
else if (/<\/(table|a|div|td|th)>[^<]/.test(cardHtml)) problems.push("archive.js: rendered mech card carries stray text between tags");
if (/id="ledger-body"/.test(fs.readFileSync(__dirname + "/mechbay.html", "utf8"))) problems.push('mechbay.html: the session ledger now lives on campaign.html, so this page must not carry id="ledger-body"');
/* Ledger panel: ledgerPanel is pure, so fixtures pin the per-pilot sums, the record holders,
   the tie-break and the omitted stats without depending on what the real ledger holds. */
const bay = mount("mechbay.html");
const camp = fs.existsSync(__dirname + "/campaign.html") ? mount("campaign.html")
  : { nodes: {}, html: () => "", window: { UI: { ledgerPanel: () => ({ count: "", html: "" }), esc: x => x } } };
const shortName = p => { const nw = p.name.replace(/\u201c([^\u201d]*)\u201d/, "$1").replace(/\s+/g, " ").trim().split(" "); return nw.length > 1 ? nw[0].charAt(0) + ". " + nw[nw.length - 1] : nw[0]; };
if (!/^\d+ ENTRIES · \d+ PILOTS$/.test(camp.nodes["ledger-count"]?.textContent || "")) problems.push("campaign.html: ledger count did not render");
if (!(camp.nodes["ledger-body"] || {}).innerHTML) problems.push("campaign.html: ledger panel did not render");
const [leadPilot, chasePilot] = C.pilots, ledgerOp = C.ops[0].id;
const panel = camp.window.UI.ledgerPanel([
  { op: ledgerOp, date: "2026-01-01", pilot: leadPilot.id, dealt: 7, repairs: 1 },
  { op: ledgerOp, date: "2026-01-02", pilot: chasePilot.id, dealt: 2, taken: 9, hacks: 2 },
  { op: ledgerOp, date: "2026-01-03", pilot: leadPilot.id, taken: 9, hacks: 5 },
]);
const record = (label, pilot, total) => `<th scope="row">MOST ${label}</th><td>${camp.window.UI.esc(shortName(pilot))} · ${total}</td>`;
if (panel.count !== "3 ENTRIES · 2 PILOTS") problems.push(`ledger panel: 3 rows over 2 pilots should read "3 ENTRIES · 2 PILOTS", got "${panel.count}"`);
if (!panel.html.includes(record("DAMAGE DEALT", leadPilot, 7))) problems.push("ledger panel: damage dealt must sum a pilot's rows");
if (!panel.html.includes(record("DAMAGE TAKEN", leadPilot, 9))) problems.push("ledger panel: a tied record must fall back to the dealt ordering");
if (!panel.html.includes(record("HACKS", leadPilot, 5))) problems.push("ledger panel: every stat present in a row needs a record");
["CORE USES", "KILLS", "MOVES"].forEach(l => { if (panel.html.includes("MOST " + l)) problems.push(`ledger panel: ${l} appears in no row, so it must not get a record`); });
if (!panel.html.includes(`<td>${camp.window.UI.esc(shortName(leadPilot))}</td><td>2</td>`)) problems.push("ledger panel: career table must count each pilot's sessions");
const blank = camp.window.UI.ledgerPanel([]);
if (blank.count !== "0 ENTRIES · 0 PILOTS" || !blank.html.includes("No sessions logged yet")) problems.push("ledger panel: an empty ledger needs a zeroed count and the prompt to log a session");
if (!camp.window.UI.ledgerPanel(C.ledger).count.startsWith(`${C.ledger.length} ENTRIES`)) problems.push(`ledger panel: count must match the real ${C.ledger.length} ledger row(s)`);
/* campaign.html (#27): the campaign page carries the session log, the OPORD, the faction ledger and
   the roster, all driven from campaign.js. Rendered markup, not source: the same rule as above. */
const campPath = __dirname + "/campaign.html";
if (!fs.existsSync(campPath)) problems.push("campaign.html: the campaign page is missing (issue #27)");
const campPage = fs.existsSync(campPath) ? mount("campaign.html") : null;
if (campPage) {
  ["campaign-head", "ledger-count", "ledger-body", "timeline", "opord", "conflict-history", "faction-list", "crew-list", "mech-list"]
    .forEach(id => { if (!campPage.nodes[id]) problems.push(`campaign.html: missing section host #${id}`); });
  if (cardsOf(campPage.html("crew-list")).length !== C.pilots.length) problems.push(`campaign.html: crew list rendered ${cardsOf(campPage.html("crew-list")).length} pilots, want ${C.pilots.length}`);
  if (cardsOf(campPage.html("mech-list")).length !== C.mechs.length) problems.push(`campaign.html: roster rendered ${cardsOf(campPage.html("mech-list")).length} mechs, want ${C.mechs.length}`);
  if (!campPage.html("faction-list")) problems.push("campaign.html: the faction ledger did not render");
  if (!/OPORD|OPERATION ORDER/.test(campPage.html("opord"))) problems.push("campaign.html: the operation order did not render from data-op");
  if (!campPage.html("campaign-head")) problems.push("campaign.html: the operation header did not render");
  if (!campPage.html("timeline")) problems.push("campaign.html: the timeline did not render");
  if (/href="#op-/.test(campPage.html("timeline"))) problems.push("campaign.html: timeline links must not use #op- anchors, which exist only on index.html");
  /* The logging form is gone until #28 designs a real one, so the block grammar is exercised
     from the literal block a hand-typed session has to satisfy. */
  const block = `session op=${C.ops[0].id} date=2099-12-31\n${C.pilots[0].id} dealt=14 taken=9`;
  {
    const toolSrc = fs.readFileSync(__dirname + "/tools/apply-compcon.cjs", "utf8");
    if (!/require\.main === module/.test(toolSrc)) problems.push("apply-compcon.cjs: main() must be guarded by require.main, or checks cannot require the parser");
    else {
      const tool = require("./tools/apply-compcon.cjs");
      if (typeof tool.parseBlock !== "function") problems.push("apply-compcon.cjs: parseBlock must be exported for the block round trip");
      else {
        const known = { ops: C.ops.map(o => String(o.id)), pilots: C.pilots.map(x => x.id), stats: LEDGER_STATS, ledger: C.ledger };
        const parsed = tool.parseBlock(String(block), known);
        if (parsed.errors.length) problems.push(`apply-compcon: a hand-typed block must parse clean, got ${JSON.stringify(parsed.errors[0])}`);
        else if (parsed.rows.length !== 1 || parsed.rows[0].pilot !== C.pilots[0].id || parsed.rows[0].stats.dealt !== 14 || parsed.rows[0].stats.taken !== 9 || parsed.rows[0].op !== String(C.ops[0].id) || parsed.rows[0].date !== "2099-12-31") problems.push(`apply-compcon: round trip lost a field — ${JSON.stringify(parsed.rows[0])}`);
        const badStat = tool.parseBlock("session op=" + C.ops[0].id + " date=2099-12-31\n" + C.pilots[0].id + " noodles=3", known);
        if (!badStat.errors.some(e => /noodles/.test(e))) problems.push("apply-compcon: an unknown stat must be refused by name");
        if (badStat.rows.length) problems.push("apply-compcon: a block with any error must yield no rows");
        const badPilot = tool.parseBlock("session op=" + C.ops[0].id + " date=2099-12-31\nnobody dealt=3", known);
        if (!badPilot.errors.some(e => /nobody/.test(e))) problems.push("apply-compcon: an unknown pilot must be refused by name");
        const noHeader = tool.parseBlock(C.pilots[0].id + " dealt=3", known);
        if (!noHeader.errors.some(e => /session/.test(e))) problems.push("apply-compcon: a block without its session header must be refused");
        const head = "session op=" + C.ops[0].id + " date=2099-12-31\n";
        const dup = tool.parseBlock(head + C.pilots[0].id + " dealt=1\n" + C.pilots[0].id + " dealt=2", { ...known, ledger: [] });
        if (!dup.errors.some(e => /twice/.test(e)) || dup.rows.length) problems.push("apply-compcon: the same pilot twice in one block must refuse the whole block");
        const clash = tool.parseBlock(head + C.pilots[0].id + " dealt=1", { ...known, ledger: [{ op: String(C.ops[0].id), date: "2099-12-31", pilot: C.pilots[0].id }] });
        if (!clash.errors.some(e => /already has/.test(e)) || clash.rows.length) problems.push("apply-compcon: a row that already exists for that op, date and pilot must refuse the whole block");
        const orphanHead = campPage.window.UI.campaignHead({ id: "999", title: "NO SUCH OP" });
        if (!orphanHead || !/NOT FILED/.test(orphanHead)) problems.push("archive.js: campaignHead must render an op with no mission instead of throwing");
      }
    }
  }
}
/* INTEL console: the map page becomes a tab shell, and every collectable part is a pure function
   because intel.html's inline map glue cannot run under the render stub (see
docs/plans/2026-10-18-intel-console-tabs-design.md). Source text covers the shell; UI.* covers the markup. */
const intel = bay.window.UI, op0 = C.ops[0] || {}, sites = op0.sites || {}, area = C.locations.find(x => x.id === op0.loc) || {};
if (!/role="tablist"/.test(intelPage)) problems.push('intel.html: the page needs a role="tablist" for the MAP | RELATIONS | PERSONNEL tabs');
["map", "relations", "personnel"].forEach(t => { if (!new RegExp(`id="tab-${t}"`).test(intelPage)) problems.push(`intel.html: missing tabpanel id="tab-${t}"`); });
if (!/class="pagebar"/.test(intelPage)) problems.push("intel.html: needs the sticky .pagebar that carries the tabs");
/* The hero owns the page identity, so the sticky bar keeps only the tab strip; a second h1 would
   put the title on screen twice and cost the map the vertical space the bar exists to save. */
if ((intelPage.match(/<h1>/g) || []).length !== 1) problems.push("intel.html: the hero owns the page's single h1; the pagebar carries the tabs only");
/* The frame controls are builder output mounted on two static hosts in the map head: the breadcrumb
   (frame chain, terminates at SYSTEM) and the system locator (the other principals and the star).
   The old SYSTEM|THEATER buttons are gone and must not come back as data-level anywhere. */
["holo-crumbs", "holo-locator"].forEach(id => { if (!new RegExp(`id="${id}"`).test(intelPage)) problems.push(`intel.html: the map head needs an id="${id}" host for the builder's frame strip`); });
if (/data-level/.test(intelPage)) problems.push("intel.html: the level strip is gone; frame controls carry data-frame, never data-level");
if (!/closest\("\[data-frame\]"\)/.test(intelPage)) problems.push("intel.html: the panel delegate must fire UI.fitLevel on any [data-frame] control (crumbs, locator, ENTER chip)");
/* The camera centres the node where the frame placed it: data-x/data-y are placed frame coordinates,
   not record coordinates rescaled by the dead per-level X/Y constants. */
if (!/world\.querySelector/.test(intelPage) || !/n\.dataset\.x/.test(intelPage)) problems.push("intel.html: zoomTo must centre the node's placed data-x/data-y, not rescale record coordinates");
/* #record-detail lives in the map panel, so a record opened from another tab has to reveal that panel;
   and switching tabs must not re-fit, which would wipe the frame and the camera the user set. */
const archText = fs.readFileSync(__dirname + "/archive.js", "utf8");
const consoleCss = fs.readFileSync(__dirname + "/style.css", "utf8");
/* The frame strips sit in the map head and the ENTER chip in the reading pane, outside #holomap: a
   delegate bound to the map host never sees them, and a measured click left the frame unchanged. */
if (/box\.addEventListener\("click"/.test(intelPage)) problems.push("intel.html: the [data-frame] delegate must not be scoped to #holomap — the frame strips sit outside it and never fire");
if (!/getElementById\("tab-map"\)\.addEventListener\("click"/.test(intelPage)) problems.push("intel.html: the frame buttons delegate must live on the #tab-map panel");
/* An unresolvable ground - an unknown id, or a %-escape that decodes to nothing - must fall
   through to the SELECT TARGET prompt; the arrival auto-select must not overrule it, or a cold
   load of #map/nope shows a real site and rewrites the URL to it. */
if (!/if\(raw\)\{selected=true/.test(intelPage)) problems.push("intel.html: an unresolved ground in the hash must land on SELECT A TARGET, not the op site");
/* locRaw keeps the escape text as typed, so a bad escape is a failed resolve rather than an
   absent id: absent left the previous record up and made a reload disagree with the URL. */
if (!/const locRaw=/.test(intelPage)) problems.push("intel.html: a malformed %-escape must resolve as a failed ground, not an absent one");
/* Design: the hash is shareable and hashchange handles back/forward. A tab click pushes a
   history entry; render() from a hashchange must not push another, or Back never leaves the tab. */
if (!/pickTab\(t\.dataset\.tab,true\)/.test(intelPage)) problems.push("intel.html: a tab click must push a history entry, or Back cannot leave the tab");
if (!/e\.preventDefault\(\);pickTab\(t\.dataset\.tab,true\)/.test(intelPage)) problems.push("intel.html: the tab anchor href would follow our own write and override it with a bare tab hash, so the click must stop the anchor action");
if (!/pickTab\(tabFromHash\(\),false\)/.test(intelPage)) problems.push("intel.html: render() must not push on hashchange, or Back loops");
/* The pane is never re-rendered on a tab switch, so the round trip must restore the ground it
   still shows; it used to land on a bare #map while NOV ELYSIA stayed up. */
if (!/setHash\("map",currentLoc/.test(intelPage)) problems.push("intel.html: returning to MAP must put the selected ground back in the URL");
/* Measured at 1024x768 before this rule: a stacked .primary shrink-wrapped to a 300x144 svg. */
if (!/\.holo-split>\.primary\{width:100%\}/.test(consoleCss)) problems.push("style.css: a collapsed .holo-split must give .primary width:100%, or the svg falls back to its 300px default");
if (!/\.pagebar\{display:none\}/.test(consoleCss)) problems.push("style.css: print must drop the pagebar");
if (!/\.tabpanel\[hidden\]\{display:block!important\}/.test(consoleCss)) problems.push("style.css: print must show an inactive panel rather than hiding it");
if (/#holomap\{display:none/.test(consoleCss)) problems.push("style.css: print must not hide the map host");
/* The back control is camera-only now, so its label cannot describe a stale frame; and the hash is a
   user-supplied string, so a malformed escape must fall back rather than throw. */
if (!/back\.hidden=!zoomed\(\)/.test(intelPage)) problems.push("intel.html: the back control is camera-only, so its label cannot go stale");
if (!/try\{return decodeURIComponent/.test(intelPage)) problems.push("intel.html: a malformed percent-encoded hash must fall back, not throw");
if (!/const was=tabFromHash\(\),unresolved=!!locRaw\(\)&&!L\[locFromHash\(\)\]/.test(intelPage)) problems.push("intel.html: a tab change must write the hash and restoring MAP must carry the selected ground back, or a reload hides the map");
if (!/if\(n==="map"\)\{if\(!unresolved\)setHash\("map",currentLoc/.test(intelPage)) problems.push("intel.html: a hash naming a ground that does not resolve must be left as typed, or a reload of it quietly selects the arrival site and drops the URL the reader shared");
if (!/currentLoc="";setHash\("map",""\)/.test(intelPage)) problems.push("intel.html: revealing a person or chassis record must drop the ground from the URL, or the address bar keeps naming a site the pane has left");
if (!/currentLoc=t\.dataset\.loc;setHash\("map",t\.dataset\.loc\)/.test(intelPage)) problems.push("intel.html: keyboard selection must move the remembered ground with the URL, or the next tab round trip restores the site it replaced");
if (!/if\(raw\)\{selected=true;UI\.mark\("loc",""\);resetPane\(\)/.test(intelPage)) problems.push("intel.html: unknown id in hash must fall back SELECT TARGET instead leaving stale record");
/* The ground id in the hash is user input and the console resolves it as L[id]: on an ordinary object
   an inherited key answers, so #map/constructor drew a bogus unit file instead of the prompt. */
if (Object.getPrototypeOf(bay.window.UI.L) !== null) problems.push("archive.js: byId must build a null-prototype map, or a URL id like #map/constructor resolves as a record");
["__proto__", "constructor", "toString", "hasOwnProperty"].forEach(k => {
  if (bay.window.UI.L[k] || bay.window.UI.P[k] || bay.window.UI.M[k]) problems.push(`archive.js: the inherited key "${k}" must not resolve as a location, pilot or chassis`);
});
/* hashchange owns back/forward, and Back lands on a hash render() has already drawn: re-selecting there
   re-zoomed the camera and re-fit the frame the user had set, against the design's tab round trip. */
if (!/let selected=false,shownLoc=""/.test(intelPage)) problems.push("intel.html: the ground already on screen must be remembered, or Back re-zooms the camera");
if (!/if\(loc!==shownLoc\)\{shownLoc=loc/.test(intelPage)) problems.push("intel.html: a hash naming the ground already on screen must not re-select, re-zoom or re-fit it, or Back resets the camera and frame");
if (!/UI\.pickTab=pickTab/.test(intelPage)) problems.push("intel.html: must expose UI.pickTab so a record opened from another tab can reveal the map panel");
const pickTabLine = (intelPage.match(/const pickTab=n=>\{.*$/m) || [""])[0];
if (/fitLevel/.test(pickTabLine)) problems.push("intel.html: switching tabs must not call fitLevel — it resets the frame and the user's zoom");
if (!/const showAtMap=\(kind,id\)=>\{if\(UI\.pickTab\)UI\.pickTab\("map"\)/.test(archText)) problems.push("archive.js: showAtMap must activate the map tab, since #record-detail only exists in that panel");
/* The hash is the state (design doc §Tabs): shareable selection, tabs as links, replaceState guarded,
   the pane beside the map rather than under it, and no green current-op ring on a planned op. */
["map", "relations", "personnel"].forEach(n => { if (!new RegExp(`class="tab"[^>]*href="#${n}"`).test(intelPage)) problems.push(`intel.html: the ${n} tab must be an anchor carrying href="#${n}"`); });
if (!/const setHash=\(n,id,push\)=>\{try\{/.test(intelPage)) problems.push("intel.html: hash writes must stay inside try/catch (file:// throws)");
if (!/push\?history\.pushState:history\.replaceState/.test(intelPage)) problems.push("intel.html: a tab click must push and a record reveal must replace, or Back loses the tab");
if (!/addEventListener\("hashchange"/.test(intelPage)) problems.push("intel.html: hashchange must drive back/forward");
if (!/class="columns holo-split"/.test(intelPage)) problems.push("intel.html: the map and the reading pane must share .columns.holo-split");
if (!/\.holo-split/.test(fs.readFileSync(__dirname + "/style.css", "utf8"))) problems.push("style.css: needs the .holo-split rules that put the pane beside the map");
if (!/UI\.syncBack=syncBack/.test(intelPage)) problems.push("intel.html: must expose UI.syncBack, so a frame change from the reading pane syncs the back control");
if (!/type!=="PLANNED"&&o\.status!=="UNBRIEFED"/.test(archText)) problems.push("archive.js: the current-op ring must not mark a planned, unbriefed operation");
["insertion", "rendezvous", "extraction"].forEach(k => {
  const l = C.locations.find(x => x.id === sites[k]);
  if (!l) return problems.push(`op ${op0.id}.sites.${k} must name an existing location`);
  if (area.level && l.level !== area.level) problems.push(`op ${op0.id}.sites.${k} (${l.id}) must sit in the same frame as the op area ${area.id}`);
});
const personFile = intel.personFile ? intel.personFile("farris") : "";
if (!personFile) problems.push("archive.js: UI.personFile must return a personnel record body as a pure string");
else ["PERSONNEL RECORD", "assets/captain-farris-thumb.webp", "LAST KNOWN"].forEach(s => { if (!personFile.includes(s)) problems.push(`UI.personFile("farris") must carry ${s}`); });
const people = intel.personnelList ? intel.personnelList() : "";
if (!people) problems.push("archive.js: UI.personnelList must return the notable-people markup");
else {
  C.personnel.forEach(p => { if (!people.includes(intel.esc(p.name))) problems.push(`personnel tab must name ${p.id}`); });
  if (!/pilots\.html/.test(people)) problems.push("personnel tab must link into the pilot pages for the full crew");
}
const facTable = intel.factionTable ? intel.factionTable() : "";
if (!facTable) problems.push("archive.js: UI.factionTable must return the relations table");
else {
  if (!/threads-table/.test(facTable)) problems.push("relations tab must render the ledger as a threads-table");
  C.factions.forEach(x => { if (!facTable.includes(intel.esc(x.name))) problems.push(`relations table must name faction ${x.id}`); });
  C.locations.filter(l => l.faction).forEach(l => { if (!facTable.includes(l.id)) problems.push(`relations table must carry a chip for the held site ${l.id}`); });
  C.personnel.forEach(p => { if (!facTable.includes(p.id)) problems.push(`relations table must carry a chip for ${p.id}`); });
  /* D2: zone colour appears as coloured standing pills, so each faction's standing must be a pill
     tinted with that faction's own zone colour — the single lime .standing class is what this replaces. */
  C.factions.forEach(x => {
    const want = new RegExp(`class="pill" style="border-color:var\\(--${x.zone.c}\\)[^>]*>${x.standing}<`);
    if (!want.test(facTable)) problems.push(`relations table must show ${x.id}'s standing ${x.standing} as a pill in its zone colour --${x.zone.c}`);
  });
}
const situation = intel.situation ? intel.situation() : null;
if (!situation) problems.push("archive.js: UI.situation must return the preflight readout and badge map");
else {
  const said = JSON.stringify(situation), missing = C.personnel.filter(p => p.status === "MISSING" && p.lastKnown === op0.loc).length;
  if (!said.includes(op0.title)) problems.push("situation readout must name the operation");
  if (!said.includes(op0.type) || !said.includes(op0.status)) problems.push(`situation readout must state type ${op0.type} and brief state ${op0.status}`);
  if (!missing) problems.push("situation readout: no personnel are missing at the op area, so the badge cannot be asserted");
  else if (!new RegExp(`${missing} MISSING`).test(said)) problems.push(`situation readout must count the ${missing} personnel missing at ${op0.loc}, not a hand-written total`);
  ["insertion", "rendezvous", "extraction"].forEach(k => { if (!said.includes(sites[k])) problems.push(`situation badges must mark the ${k} site ${sites[k]}`); });
  const hostile = C.locations.filter(l => l.faction && (C.factions.find(f => f.id === l.faction) || {}).standing === "HOSTILE");
  hostile.forEach(l => { if (!said.includes(l.id)) problems.push(`situation badges must mark hostile site ${l.id}`); });
  const muster = C.locations.filter(l => l.name === ((C.meta || {}).station || ""));
  muster.forEach(l => { if (!said.includes(l.id)) problems.push(`situation badges must mark the muster site ${l.id}`); });
  /* The readout is one strip of cells (~44px in the design), not a table of rows: the map's fold
     budget on a laptop and a phone both depend on it, and the plan's grounds are map badges now. */
  if (!/class="readout-strip"/.test(situation.html || "")) problems.push("situation readout must be one strip of cells, not a table of rows");
  if (!said.includes(`OP ${op0.id} · ${op0.title}`)) problems.push("situation readout must lead with the op id and title (OP 001 · SOLSTICE RAIN)");
  if (op0.outcome && !said.includes(intel.esc(op0.outcome))) problems.push("situation readout must carry the operation's own outcome line");
  const areaBadge = situation.badges.find(b => b.role === "area");
  if (!areaBadge) problems.push(`situation badges must mark the op area ${op0.loc} with its missing count`);
  else if (!areaBadge.label.includes(`OP AREA · ${missing} MISSING`)) problems.push(`the op-area badge must read OP AREA · ${missing} MISSING, not "${areaBadge.label}"`);
  /* One ground can hold two badge roles: the muster hull is also the extraction destination. A Map
     keyed by loc kept only the last push, which silently dropped a role. */
  const dual = muster[0];
  if (dual && sites.extraction === dual.id) {
    const roles = situation.badges.filter(b => b.loc === dual.id).map(b => b.role);
    ["muster", "extraction"].forEach(r => { if (!roles.includes(r)) problems.push(`${dual.id} is both the muster hull and the extraction destination: its badges must keep both roles (missing ${r})`); });
  }
  if (/LIVE|TRACK(ING|ED)|REAL-?TIME/i.test(said)) problems.push("situation wording must say planned, last known or recorded, never imply live tracking");
}
/* ponytail: dossier imgs checked for alt only; archive.js emits no width/height yet. Add width+height
   to this check once archive.js sets intrinsic dimensions (tracked follow-up). */
[["pilot.html", C.pilots], ["mech.html", C.mechs]].forEach(([pg, recs]) => recs.forEach(r => {
  const html = mount(pg, "#" + r.id).html("dossier");
  if (!html || html.includes("NOT FOUND")) return problems.push(`${pg}#${r.id}: dossier rendered empty`);
  (html.match(/<img\b[^>]*>/g) || []).forEach(img => { if (!/\salt="[^"]+"/.test(img)) problems.push(`${pg}#${r.id}: rendered img lacks alt: ${img}`); });
}));

/* Weapon cards and detail prose: the shapes a player reads at the table, asserted from rendered
   markup and the built rules table. Fixtures cover shapes this campaign has not unlocked yet. */
const detailBox = { window: {} };
vm.createContext(detailBox);
vm.runInContext(fs.readFileSync(__dirname + "/detail.js", "utf8"), detailBox, { filename: "detail.js" });
const RD = detailBox.window.DETAIL || {};
["weapons", "systems", "gear"].forEach(k => { if (!RD[k]) problems.push(`detail.js: ${k} table missing`); });
Object.entries(RD.weapons || {}).forEach(([n, w]) => {
  if (!("desc" in w)) problems.push(`weapons.${n}: built detail drops the source description, so a shared manufacturer blurb cannot print once`);
  if (!("profiles" in w)) problems.push(`weapons.${n}: built detail drops profiles, so alternate fire modes are lost`);
});
[...Object.entries(RD.weapons || {}), ...Object.entries(RD.systems || {}), ...Object.entries(RD.gear || {})].forEach(([n, x]) => {
  if (`${x.tags || ""} ${x.range || ""}`.includes("{VAL}")) problems.push(`${n}: unresolved {VAL} placeholder in "${x.tags || x.range}" - the tag's own value must be substituted`);
});
/* lancer-data ships no text at all for Pattern-A Smoke Charges; any other blank entry lost a field. */
const KNOWN_BLANK = ["Pattern-A Smoke Charges"];
const blankEntries = k => Object.entries(RD[k] || {}).filter(([, x]) => !String(x.effect || "").trim()).map(([n]) => n);
if (blankEntries("gear").length) problems.push(`gear with no rules text: ${blankEntries("gear").join(", ")}`);
const blankSys = blankEntries("systems").filter(n => !KNOWN_BLANK.includes(n));
if (blankSys.length) problems.push(`systems with no rules text: ${blankSys.join(", ")}`);

/* A mounted weapon is a name plus labelled stat rows, not one joined line. */
const tw = C.mechs.find(m => m.mounts && m.mounts.length && m.pilot) || C.mechs[0];
const twPage = mount("mech.html", "#" + tw.id);
const twHtml = twPage.html("dossier");
const wSect = twHtml.slice(twHtml.indexOf("MOUNTED WEAPONS"), twHtml.indexOf("SYSTEMS", twHtml.indexOf("MOUNTED WEAPONS")));
["MOUNT", "TYPE", "DAMAGE", "RANGE", "TAGS", "LICENSE"].forEach(k => { if (!wSect.includes(`<th scope="row">${k}</th>`)) problems.push(`mech.html#${tw.id}: weapon card is missing its ${k} row`); });
const mounted = Object.keys(RD.weapons || {}).filter(n => tw.mounts.flatMap(x => x.weapons || []).includes(n));
if (mounted.length < 2) problems.push(`mech.html#${tw.id}: expected at least two built weapons in the loadout, found ${mounted.length}`);
else {
  /* One blurb covers every weapon of a manufacturer: it prints once above the list, not per weapon. */
  const shared = String((RD.weapons[mounted[0]] || {}).desc || "shared manufacturer blurb");
  twPage.window.DETAIL.weapons[mounted[1]] = { ...twPage.window.DETAIL.weapons[mounted[1]], desc: shared };
  const once = twPage.window.UI.detailMech(tw).split(shared).length - 1;
  if (once !== 1) problems.push(`mech.html#${tw.id}: a description shared by two mounted weapons printed ${once} time(s), not once`);
  /* Profiles: alternate fire modes carry their own stats, effect, and actions. */
  const fixture = { name: "PROFILE FIXTURE", damage: "1d6 Kinetic", range: "Range 10", tags: "Smart", effect: "Profile effect text.", actions: [{ name: "Fixture Action", activation: "Quick", detail: "Fixture action detail." }] };
  twPage.window.DETAIL.weapons[mounted[0]] = { ...twPage.window.DETAIL.weapons[mounted[0]], profiles: [fixture] };
  const withProfile = twPage.window.UI.detailMech(tw);
  ["PROFILE FIXTURE", "Profile effect text.", "Fixture Action (Quick): Fixture action detail."].forEach(t => { if (!withProfile.includes(t)) problems.push(`mech.html#${tw.id}: profile render dropped "${t}"`); });
}
/* Wide monitors: the weapon stack grids 2 then 3 across. The wrapper is what makes it a
   grid, and phones keep one column because that is the default. */
if (!wSect.includes('class="wep-grid"')) problems.push(`mech.html#${tw.id}: mounted weapons must sit in a .wep-grid for the wide-screen columns`);
const cssText = fs.readFileSync(__dirname + "/style.css", "utf8");
if (!/\.wep-grid\{display:grid/.test(cssText)) problems.push("style.css: .wep-grid must be a grid");
if (!/@media\(min-width:1100px\)\{\.wep-grid\{grid-template-columns:1fr 1fr\}\}/.test(cssText)) problems.push("style.css: .wep-grid must take a second column from 1100px up");
if (!/@media\(min-width:1700px\)\{\.wep-grid\{grid-template-columns:repeat\(3,1fr\)\}\}/.test(cssText)) problems.push("style.css: .wep-grid must take a third column from 1700px up");
/* Gear prose: lancer-data marks paragraph breaks with <br>, which must render as a break, not as text. */
const pk = C.pilots.find(p => p.gear && p.mech) || C.pilots[0];
const pkPage = mount("pilot.html", "#" + pk.id);
const gearName = Object.keys(RD.gear || {}).find(n => pk.gear.includes(n));
if (!gearName) problems.push(`pilot.html#${pk.id}: no built gear detail matches the pilot's gear list`);
else {
  pkPage.window.DETAIL.gear[gearName] = { ...pkPage.window.DETAIL.gear[gearName], effect: "first paragraph<br>second paragraph" };
  const gearHtml = pkPage.window.UI.detailPilot(pk);
  if (gearHtml.includes("&lt;br&gt;")) problems.push(`pilot.html#${pk.id}: ${gearName}'s <br> paragraph marker renders as text`);
  if (!gearHtml.includes("first paragraph<br>second paragraph")) problems.push(`pilot.html#${pk.id}: ${gearName}'s <br> paragraph marker renders no break`);
  /* The chassis card already links out, so the file beside a pilot lists only what a pilot needs. */
  const pkHtml = pkPage.html("dossier");
  const pkAside = pkHtml.slice(pkHtml.indexOf("<aside"), pkHtml.indexOf("</aside>"));
  const asideRows = [...pkAside.matchAll(/<th scope="row">([^<]+)<\/th>/g)].map(m => m[1]).join(",");
  if (asideRows !== "LOADOUT,SYSTEMS,DEPLOYED") problems.push(`pilot.html#${pk.id}: the chassis file beside a pilot should list LOADOUT,SYSTEMS,DEPLOYED, got "${asideRows}"`);
}
/* Both dossier columns carry fill, so the shorter panel stretches to the same bottom edge. A mech's
   own page keeps the full chassis file: provenance for the summary a pilot's page carries. */[["pilot.html", pk.id], ["mech.html", tw.id]].forEach(([page, id]) => {
  const html = mount(page, "#" + id).html("dossier");
  if (!/<div class="primary fill">/.test(html) || !/<aside class="aside fill">/.test(html)) problems.push(`${page}#${id}: both dossier columns must carry fill so the shorter panel stretches to the same bottom edge`);
  if (page === "mech.html") ["STATE", "LAST OUTCOME"].forEach(k => { if (!html.slice(html.indexOf("<h2>CHASSIS FILE</h2>"), html.indexOf("<aside")).includes(`<th scope="row">${k}</th>`)) problems.push(`mech.html#${id}: the chassis file lost its ${k} row`); });
});
/* #15: both dossier pages offer copy-link and print actions, driven the way a visitor drives
   them (fire the button, read what the page did), and the print sheet must not carry them. */
[["pilot.html", pk.id], ["mech.html", tw.id]].forEach(([page, id]) => {
  const href = `https://raddue.github.io/vargskel-worgs/${page}#${id}`;
  let copied = null, printed = 0;
  const p = mount(page, "#" + id, { navigator: { clipboard: { writeText: t => { copied = t; } } }, print: () => { printed++; }, location: { hash: "#" + id, href, replace() {} } });
  ["dossier-copy", "dossier-print"].forEach(b => { if (!p.nodes[b]) problems.push(`${page}#${id}: the dossier must carry a ${b} action`); });
  if (p.nodes["dossier-copy"]) { p.nodes["dossier-copy"].fire("click"); if (copied !== href) problems.push(`${page}#${id}: copy-link must write the page URL to the clipboard, got ${JSON.stringify(copied)}`); }
  if (p.nodes["dossier-print"]) { p.nodes["dossier-print"].fire("click"); if (printed !== 1) problems.push(`${page}#${id}: the print action must call window.print once, got ${printed}`); }
});
if (!cssText.includes(".hero-actions{display:none!important}")) problems.push("style.css: the print sheet must hide .hero-actions");
/* The brand block takes the header's leftover width, so a long page subtitle cannot slide the nav
   tabs sideways between pages - index.html's subtitle is twice the length of a dossier's. */
const brandRule = (fs.readFileSync(__dirname + "/style.css", "utf8").match(/\.brand\{[^}]*\}/) || [""])[0];
if (!/flex:\s*1/.test(brandRule)) problems.push(`style.css: .brand must absorb the header's leftover width (flex:1) or the nav shifts when a page's subtitle is long - got "${brandRule}"`);

/* Crew-facing OPORD: every op with a mission page carries the five-paragraph order, and the
   page mounts the shared renderer. archive.js runs against a stub DOM here so the check reads
   rendered markup rather than trusting the data shape alone. */
const SMEAC = ["SITUATION", "MISSION", "EXECUTION", "SUSTAINMENT", "COMMAND AND SIGNAL"];
C.ops.forEach(o => {
  if (!o.mission) return;
  const page = fs.readFileSync(__dirname + "/" + o.mission.href, "utf8");
  const mount = page.match(/id="opord" data-op="([^"]+)"/);
  if (!mount) problems.push(`${o.mission.href}: OPORD host id="opord" data-op="${o.id}" missing`);
  if (!page.includes("archive.js")) problems.push(`${o.mission.href}: shared archive script missing`);
  [...new Set([...page.matchAll(/assets\/[\w.-]+/g)].map(m => m[0]))].forEach(a => {
    if (!fs.existsSync(__dirname + "/" + a)) problems.push(`${o.mission.href}: references missing ${a}`);
  });
  const titles = ((o.opord || {}).paras || []).map(p => p[0]);
  SMEAC.forEach(t => { if (!titles.includes(t)) problems.push(`op ${o.id}: opord missing paragraph "${t}"`); });
  if (!mount || !o.opord) return;
  const host = { dataset: { op: mount[1] }, innerHTML: "" }, hist = { dataset: { op: mount[1] }, innerHTML: "" };
  if (!page.includes('id="conflict-history"')) problems.push(`${o.mission.href}: conflict-history host missing`);
  if (!Array.isArray(o.history) || !o.history.length || o.history.some(h => typeof h !== "string" || !h.length)) problems.push(`op ${o.id}: conflict history must be a non-empty list of paragraphs`);
  sandbox.document = { getElementById: id => (id === "opord" ? host : id === "conflict-history" ? hist : null), querySelectorAll: () => [], addEventListener: () => {} };
  sandbox.matchMedia = () => ({ matches: true });
  vm.runInContext(ui, sandbox, { filename: "archive.js" });
  const html = host.innerHTML;
  SMEAC.forEach((t, i) => { if (!html.includes(`${i + 1}. ${t}`)) problems.push(`op ${o.id}: rendered OPORD missing heading "${i + 1}. ${t}"`); });
  if (!html.includes("ANNEX A")) problems.push(`op ${o.id}: rendered OPORD missing its first annex`);
  if (html.split(o.opord.class).length !== 3) problems.push(`op ${o.id}: classification banner must sit above and below the order`);
  if (o.history && o.history.length && !hist.innerHTML.includes(o.history[0])) problems.push(`op ${o.id}: rendered conflict history is missing its opening paragraph`);
});

/* COMPANY RECORD (index.html): the rolling summary must count the ledger's kills. */
if (mount) {
  const record = mount("index.html").html("stats");
  const kills = (C.ledger || []).reduce((n, e) => n + (Number(e.kills) || 0), 0);
  if (!record.includes("<label>KILLS</label>")) problems.push("index.html COMPANY RECORD must show KILLS");
  else if (!record.includes(`<strong>${String(kills).padStart(2, "0")}</strong>`)) problems.push(`index.html COMPANY RECORD: KILLS must show the ledger total ${kills}`);
}

if (problems.length) {
  console.error("campaign.js/index.html: " + problems.length + " problem(s)\n - " + problems.join("\n - "));
  process.exit(1);
}
console.log(`campaign.js/index.html ok: ${C.locations.length} locations, ${C.pilots.length} pilots, ${C.mechs.length} mechs, ${C.ops.length} ops, ${C.threads.length} threads, ${C.events.length} events, ${C.factions.length} factions`);
