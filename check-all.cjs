/* Checks campaign.js: every id reference resolves, and obvious contradictions
   are caught. Run after editing: node check-all.cjs
   Exits non-zero with a list of problems. */
const fs = require("fs");
const vm = require("vm");

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

if (C.pilots.length !== 6 || C.mechs.length !== 6 || C.ops.length !== 1 || C.events.length || C.threads.length) problems.push('campaign should have six pilots/mechs, one Solstice Rain operation, and no historical events/threads');
if (!C.pilots.some(p => p.name === "RURIK “DAEMON” VARGSKEL" && p.img === "assets/rurik_vargskel.png") || !fs.existsSync(__dirname + "/assets/rurik_vargskel.png") || !C.pilots.some(p => p.id === "sten" && p.name === "STEN “HAMMER” VARGSKEL" && p.mech === "skaldr" && p.img === "assets/sten.png") || !fs.existsSync(__dirname + "/assets/sten.png") || !C.pilots.some(p => p.name === "HANSEN “DUSTY” MCGRAW") || !C.pilots.some(p => p.id === "spook" && p.name === "NICOLOSO “SPOOK” BENIKO" && p.mech === "alba")) problems.push('roster must keep Rurik, Sten with Skaldr, Dusty, Guillaume, Danila, and Spook with Alba');
if (!C.mechs.some(m => m.name === "SWEET CHEEKS") || !C.mechs.some(m => m.name === "TOMBSTONE") || !C.mechs.some(m => m.pilot === "sten" && m.id === "skaldr") || !C.mechs.some(m => m.id === "alba" && m.pilot === "spook" && m.name === "ALBA")) problems.push('roster must keep Sweet Cheeks, Tombstone, Wayward, Scooteroo, Skaldr, and Alba');
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
const navPages = ["index.html", "intel.html", "pilots.html", "mechbay.html", "mech.html", "pilot.html", "solstice-rain.html"];
navPages.forEach(p => {
  const src = fs.readFileSync(__dirname + "/" + p, "utf8");
  if (!/href="intel\.html">INTEL</.test(src)) problems.push(`${p}: nav INTEL must link to intel.html, not an index anchor`);
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
let snap = JSON.parse(fs.readFileSync(snapPath, "utf8"));
if (process.argv.includes("--update-snapshot")) {
  snap = Object.fromEntries(Object.entries(snap).map(([key, recs]) => [key, Object.fromEntries(Object.entries(recs).map(([id, r]) => [id, pick(C[key].find(x => x.id === id), Object.keys(r))]))]));
  fs.writeFileSync(snapPath, JSON.stringify(snap, null, 1) + "\n");
}
Object.entries(snap).forEach(([key, recs]) => Object.entries(recs).forEach(([id, want]) => {
  const got = C[key].find(x => x.id === id);
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
/* The index holomap is built by an inline script that mount() cannot run, so its key and the
   current-op marker are asserted in source until the page gets a render-level check. */
/* Two-level holomap. The builder is pure (UI.holomap), so both frames are asserted as markup
   rather than as source substrings — which is all the inline script in index.html allowed. */
{
  const vm = require("node:vm");
  const box = { document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [], addEventListener: () => {} }, matchMedia: () => ({ matches: false, addEventListener: () => {} }), CSS: { escape: s => String(s) }, location: { hash: "" }, console };
  box.window = box;
  vm.createContext(box);
  let booted = true;
  try { vm.runInContext(fs.readFileSync(__dirname + "/campaign.js", "utf8"), box); vm.runInContext(fs.readFileSync(__dirname + "/archive.js", "utf8"), box); }
  catch (e) { booted = false; problems.push(`archive.js will not load under a stub DOM, so no frame can be checked: ${e.message}`); }
  const HOLO = booted && (box.UI || (box.window && box.window.UI)), D = booted && box.CAMPAIGN;
  if (booted && (!HOLO || typeof HOLO.holomap !== "function")) problems.push("archive.js: UI.holomap(level) missing, so the holomap cannot be checked per level");
  else if (booted && D) {
    const idsOn = lvl => D.locations.filter(l => l.level === lvl).map(l => l.id);
    const drawn = lvl => { let out; try { out = HOLO.holomap(lvl); } catch (e) { problems.push(`UI.holomap("${lvl}") threw: ${e.message}`); return { ids: [], key: "", world: "", grid: "", aria: "" } }
      if (!out || typeof out.world !== "string" || typeof out.key !== "string") { problems.push(`UI.holomap("${lvl}") must return {world,key} strings`); return { ids: [], key: "", world: "", grid: "", aria: "" } }
      return { ids: [...out.world.matchAll(/data-loc="([^"]+)"/g)].map(m => m[1]), key: out.key, world: out.world, grid: String(out.grid || ""), aria: String(out.aria || "") }; };
    const fames = { SYSTEM: drawn("SYSTEM"), THEATER: drawn("THEATER") };
    Object.keys(fames).forEach(lvl => { const { ids } = fames[lvl], want = idsOn(lvl);
      if (!want.length) problems.push(`campaign.js: no ${lvl} locations, so that frame cannot be checked`);
      want.forEach(id => { if (!ids.includes(id)) problems.push(`UI.holomap("${lvl}") omits ${lvl} location ${id}`); });
      ids.forEach(id => { if (!want.includes(id)) problems.push(`UI.holomap("${lvl}") draws ${id}, which campaign.js does not mark ${lvl}`); }); });
    if (!fames.THEATER.key.includes("SYSTEM VIEW")) problems.push('UI.holomap("THEATER") key has no SYSTEM VIEW chip');
    if (fames.SYSTEM.key.includes("SYSTEM VIEW")) problems.push('UI.holomap("SYSTEM") key offers SYSTEM VIEW, which is where it already is');
    /* The missing principals are identified by portrait on the map pane, not only by name. */
    const missingPane = HOLO.unitFile ? HOLO.unitFile("elysia") : "";
    if (!HOLO.unitFile) problems.push("archive.js: UI.unitFile(id) missing, so the map pane cannot be checked");
    else D.personnel.filter(p => p.status === "MISSING").forEach(p => {
      if (!missingPane.includes(p.img)) problems.push(`unitFile("elysia") omits ${p.id}'s portrait (${p.img}), so a missing principal reads there as a name only`);
    });
    if (!/class="p-face"/.test(missingPane)) problems.push('unitFile must pair personnel portraits with their chips (class="p-face")');
    /* Each frame has to say which frame it is — to sighted readers in the corner and to screen readers. */
    if (!/THEATER GRID/.test(fames.THEATER.grid) || !/SECTOR GRID/.test(fames.SYSTEM.grid)) problems.push("each frame's corner grid label must name that frame");
    if (!/Theater holomap/.test(fames.THEATER.aria) || !/Sector holomap/.test(fames.SYSTEM.aria)) problems.push("each frame must announce itself: holomap(level).aria must name that frame");
    if (fames.THEATER.aria === fames.SYSTEM.aria) problems.push("the two frames must not share one aria-label");
    if (!fames.SYSTEM.key.includes('class="k-orbit"')) problems.push('UI.holomap("SYSTEM") key must list ORBIT: the sector frame draws orbit rings');
    /* Pinch is the one map gesture a stub cannot perform, so its decision function is kept pure. */
    if (typeof HOLO.pinchIntent !== "function") problems.push("archive.js: UI.pinchIntent(ratio) missing, so the pinch gesture cannot be checked");
    else [[2, "in"], [1.4, "in"], [1.34, ""], [1, ""], [.8, ""], [.74, "out"], [.5, "out"]].forEach(([r, want]) => {
      const got = HOLO.pinchIntent(r);
      if (got !== want) problems.push(`UI.pinchIntent(${r}) = "${got}", want "${want}": pinch thresholds must stay hysteretic`);
    });
    if (fames.THEATER.key.includes('class="k-orbit"')) problems.push('UI.holomap("THEATER") must not offer an ORBIT chip: a district does not orbit its city');
    /* A site framed onto a body must hang under that body, not float as a sector node of its own. */
    D.locations.filter(l => l.frame).forEach(k => {
      const host = D.locations.find(x => x.id === k.frame);
      if (!host) return;
      if (host.level === "SYSTEM") {
        if (!fames.SYSTEM.world.includes(k.name + " SITE")) problems.push(`UI.holomap("SYSTEM") must show ${k.name} as a chip under ${k.frame}, not leave the site unmentioned`);
        if (fames.SYSTEM.ids.includes(k.id)) problems.push(`UI.holomap("SYSTEM") must not draw ${k.name} as a node of its own in the sector frame`);
      }
      if (fames.THEATER.ids.includes(host.id)) problems.push(`UI.holomap("THEATER") must not draw ${host.id}: it is a body of the sector frame`);
    });
    const pane = typeof HOLO.unitFile === "function" ? String(HOLO.unitFile("cressidium")) : "";
    if (!pane.includes("ENTER THEATER")) problems.push('UI.unitFile("cressidium") has no ENTER THEATER chip, so the theater is pointer-only');
    const by = Object.fromEntries(D.locations.map(l => [l.id, l])), KINDS = ["PLANET", "MOON", "STATION", "WRECK FIELD", "CITY", "DISTRICT", "FOB", "ZONE", "ORBITAL"];
    D.locations.forEach(l => { if (l.level !== "SYSTEM" && l.level !== "THEATER") problems.push(`location ${l.id}: level must be SYSTEM or THEATER, got ${JSON.stringify(l.level)}`);
      if (!KINDS.includes(l.kind)) problems.push(`location ${l.id}: kind ${JSON.stringify(l.kind)} is outside the closed set`);
      if (l.parent && by[l.parent] && by[l.parent].level !== l.level) problems.push(`location ${l.id}: parent ${l.parent} is on another level`);
      if (l.frame && (!by[l.frame] || by[l.frame].level !== "SYSTEM")) problems.push(`location ${l.id}: frame ${l.frame} must name a SYSTEM location`); });
    if (by.cressidium?.kind !== "PLANET") problems.push("cressidium must be a PLANET: the prose calls Nov Elysia a city on it");
    if (by.elysia?.kind !== "CITY") problems.push("elysia must be a CITY, not a planet");
    if (by.pell?.parent !== "cressidium") problems.push("pell must orbit cressidium, not the city");
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
       visited: a route from a visited origin to a planned site has no travelled leg on it. */
    const keyOf = () => HOLO.holomap("THEATER").key;
    if (!keyOf().includes("PLANNED LEG")) problems.push("theater key must list PLANNED LEG while the operation's site is unvisited");
    if (keyOf().includes("TRAVELLED")) problems.push("theater key claims TRAVELLED although no drawn leg ends at a visited site");
    const ely = D.locations.find(l => l.id === "elysia");
    if (ely) { ely.visited = true;
      if (!keyOf().includes("TRAVELLED")) problems.push("theater key must list TRAVELLED once a drawn leg ends at a visited site");
      ely.visited = false; }
    /* A site inside a district is not in orbit; only moons, stations and orbitals orbit. */
    if (!HOLO.unitFile("dock").includes("WITHIN")) problems.push("FOB Saber's pane row must read WITHIN: its parent is a district");
    if (HOLO.unitFile("dock").includes("IN ORBIT")) problems.push("FOB Saber's pane must not claim IN ORBIT: its parent is a district");
    if (!HOLO.unitFile("pell").includes("IN ORBIT")) problems.push("pell is a moon, so its pane row must read IN ORBIT");
    const bad = extra => { D.locations.push(Object.assign({ id: "zz", name: "ZZ", kind: "PLANET", x: 50, y: 50, level: "SYSTEM" }, extra)); let threw = false; try { HOLO.holomap("SYSTEM"); } catch (e) { threw = true } D.locations.pop(); return threw; };
    if (!bad({ kind: "NOPE" })) problems.push("UI.holomap must throw on an unknown kind instead of drawing a wreck field");
    /* A record with no level belongs to neither frame; that is a data fault, which the level check above reports. */
    const threw = lvl => { try { HOLO.holomap(lvl); return false } catch { return true } };
    if (!threw("SURFACE")) problems.push('UI.holomap must throw on an unknown level argument, not draw an empty frame');
    if (!threw(undefined)) problems.push("UI.holomap must throw when asked for no level at all");
  }
}

/* Rendered, not source: assertions read the markup tools/render.cjs produces by running each page's
   scripts against a stub DOM. A stray literal left inside a card template (e.g. a mis-counted paren)
   reaches the page as text between tags, which a source regex cannot see; minified source also made
   template-text matches report false positives. */
const { mount } = require("./tools/render.cjs");
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
/* Ledger panel: ledgerPanel is pure, so fixtures pin the per-pilot sums, the record holders,
   the tie-break and the omitted stats without depending on what the real ledger holds. */
const bay = mount("mechbay.html");
const shortName = p => { const nw = p.name.replace(/\u201c([^\u201d]*)\u201d/, "$1").replace(/\s+/g, " ").trim().split(" "); return nw.length > 1 ? nw[0].charAt(0) + ". " + nw[nw.length - 1] : nw[0]; };
if (!/^\d+ ENTRIES · \d+ PILOTS$/.test(bay.nodes["ledger-count"]?.textContent || "")) problems.push("mechbay.html: ledger count did not render");
if (!(bay.nodes["ledger-body"] || {}).innerHTML) problems.push("mechbay.html: ledger panel did not render");
const [leadPilot, chasePilot] = C.pilots, ledgerOp = C.ops[0].id;
const panel = bay.window.UI.ledgerPanel([
  { op: ledgerOp, date: "2026-01-01", pilot: leadPilot.id, dealt: 7, repairs: 1 },
  { op: ledgerOp, date: "2026-01-02", pilot: chasePilot.id, dealt: 2, taken: 9, hacks: 2 },
  { op: ledgerOp, date: "2026-01-03", pilot: leadPilot.id, taken: 9, hacks: 5 },
]);
const record = (label, pilot, total) => `<th scope="row">MOST ${label}</th><td>${bay.window.UI.esc(shortName(pilot))} · ${total}</td>`;
if (panel.count !== "3 ENTRIES · 2 PILOTS") problems.push(`ledger panel: 3 rows over 2 pilots should read "3 ENTRIES · 2 PILOTS", got "${panel.count}"`);
if (!panel.html.includes(record("DAMAGE DEALT", leadPilot, 7))) problems.push("ledger panel: damage dealt must sum a pilot's rows");
if (!panel.html.includes(record("DAMAGE TAKEN", leadPilot, 9))) problems.push("ledger panel: a tied record must fall back to the dealt ordering");
if (!panel.html.includes(record("HACKS", leadPilot, 5))) problems.push("ledger panel: every stat present in a row needs a record");
["CORE USES", "KILLS", "MOVES"].forEach(l => { if (panel.html.includes("MOST " + l)) problems.push(`ledger panel: ${l} appears in no row, so it must not get a record`); });
if (!panel.html.includes(`<td>${bay.window.UI.esc(shortName(leadPilot))}</td><td>2</td>`)) problems.push("ledger panel: career table must count each pilot's sessions");
const blank = bay.window.UI.ledgerPanel([]);
if (blank.count !== "0 ENTRIES · 0 PILOTS" || !blank.html.includes("No sessions logged yet")) problems.push("ledger panel: an empty ledger needs a zeroed count and the prompt to log a session");
if (!bay.window.UI.ledgerPanel(C.ledger).count.startsWith(`${C.ledger.length} ENTRIES`)) problems.push(`ledger panel: count must match the real ${C.ledger.length} ledger row(s)`);
/* INTEL console: the map page becomes a tab shell, and every collectable part is a pure function
   because intel.html's inline map glue cannot run under the render stub (see
docs/plans/2026-10-18-intel-console-tabs-design.md). Source text covers the shell; UI.* covers the markup. */
const intel = bay.window.UI, op0 = C.ops[0] || {}, sites = op0.sites || {}, area = C.locations.find(x => x.id === op0.loc) || {};
if (!/role="tablist"/.test(intelPage)) problems.push('intel.html: the page needs a role="tablist" for the MAP | RELATIONS | PERSONNEL tabs');
["map", "relations", "personnel"].forEach(t => { if (!new RegExp(`id="tab-${t}"`).test(intelPage)) problems.push(`intel.html: missing tabpanel id="tab-${t}"`); });
if (!/class="pagebar"/.test(intelPage)) problems.push("intel.html: needs the sticky .pagebar that carries the h1 and the tabs");
if (/class="hero"/.test(intelPage)) problems.push("intel.html: the hero must be gone now that the pagebar carries the page identity");
["SYSTEM", "THEATER"].forEach(l => { if (!new RegExp(`data-level="${l}"`).test(intelPage)) problems.push(`intel.html: the map head strip needs a data-level="${l}" button`); });
/* #record-detail lives in the map panel, so a record opened from another tab has to reveal that panel;
   and switching tabs must not re-fit, which would wipe the frame and the camera the user set. */
const archText = fs.readFileSync(__dirname + "/archive.js", "utf8");
const consoleCss = fs.readFileSync(__dirname + "/style.css", "utf8");
/* The frame buttons sit in the map head strip, outside #holomap: a delegate bound to the map host
   never sees them, and a measured click left the frame unchanged. */
if (/box\.addEventListener\("click"/.test(intelPage)) problems.push("intel.html: the [data-level] delegate must not be scoped to #holomap — the frame buttons sit outside it and never fire");
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

if (problems.length) {
  console.error("campaign.js/index.html: " + problems.length + " problem(s)\n - " + problems.join("\n - "));
  process.exit(1);
}
console.log(`campaign.js/index.html ok: ${C.locations.length} locations, ${C.pilots.length} pilots, ${C.mechs.length} mechs, ${C.ops.length} ops, ${C.threads.length} threads, ${C.events.length} events, ${C.factions.length} factions`);