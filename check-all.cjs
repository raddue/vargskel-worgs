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

/* Ids become markup and sort keys, and the fields the page reads without a guard
   must exist: a numeric id or a missing array used to blank the whole archive
   while this checker still printed "ok". */
const required = {
  locations: ["name", "kind", "x", "y"],
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
/* Every roster image needs its webp thumb (roster cards render <picture> webp-first). */
[...C.pilots, ...C.mechs].forEach(x => {
  if (!x.img) return;
  const thumb = x.img.replace(/\.\w+$/, "-thumb.webp");
  if (!fs.existsSync(__dirname + "/" + thumb)) problems.push(`${x.id}: missing ${thumb} for ${x.img}; regen: magick ${x.img} -resize 480x ${thumb}`);
});
if (!fs.existsSync(__dirname + "/assets/scooter.png")) problems.push('Scooter portrait missing from assets');
if (!fs.existsSync(__dirname + "/assets/scooteroo.png")) problems.push('Scooteroo artwork missing from assets');
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
const page = fs.readFileSync(__dirname + "/index.html", "utf8");
const lance = fs.readFileSync(__dirname + "/lance.html", "utf8");
const ui = fs.readFileSync(__dirname + "/archive.js", "utf8");
if (!page.includes('href="lance.html"') || !fs.readFileSync(__dirname + "/solstice-rain.html", "utf8").includes('href="lance.html"')) problems.push("lance.html: readiness and OPORD links missing");
if (!lance.includes('src="lance-state.js"')) problems.push("lance.html: local state script missing");
if (require("node:child_process").spawnSync(process.execPath, [__dirname + "/tools/lance-check.cjs"], {stdio: "inherit"}).status !== 0) problems.push("lance.html: rendered board/state check failed");
for (const [name, html] of [["lance.html", lance], ["solstice-rain.html", fs.readFileSync(__dirname + "/solstice-rain.html", "utf8")]])
  if (/href="(?:gm|solstice-rain-m1|solstice-rain-c[123])\.html"/.test(html)) problems.push(`${name}: crew page must not link to GM pages`);
/* Self-hosted faces: a missing woff2 degrades silently to the fallback stack. */
const theme = fs.readFileSync(__dirname + "/theme.css", "utf8");
const faces = [...theme.matchAll(/url\(([^)]+\.woff2)\)/g)].map(m => m[1]);
if (!faces.length) problems.push("theme.css: no self-hosted font faces declared");
faces.forEach(f => { if (!fs.existsSync(__dirname + "/" + f)) problems.push(`theme.css: missing font file ${f}`); });

if (!page.includes('id="record-detail"')) problems.push('index.html: in-place record detail pane missing');
if (C.pilots.find(p => p.id === "dusty")?.img !== "assets/dusty.png" || !fs.existsSync(__dirname + "/assets/dusty.png")) problems.push('Dusty portrait missing from campaign roster/assets');
if (C.mechs.find(m => m.id === "tombstone")?.img !== "assets/tombstone.png") problems.push('Tombstone image path missing from campaign record');
if (/\.holo-chips|data-mech-class/.test(page)) problems.push('index.html: map still exposes chassis selection controls');

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
  if (!html.includes("ANNEX A")) problems.push(`op ${o.id}: rendered OPORD missing the generated task-org annex`);
  o.crew.forEach(id => {
    const p = C.pilots.find(x => x.id === id);
    const cs = p && (p.name.match(/\u201c([^\u201d]*)\u201d/) || [])[1];
    if (cs && !html.includes(cs)) problems.push(`op ${o.id}: callsign ${cs} missing from the rendered task-org annex`);
  });
  if (html.split(o.opord.class).length !== 3) problems.push(`op ${o.id}: classification banner must sit above and below the order`);
  if (o.history && o.history.length && !hist.innerHTML.includes(o.history[0])) problems.push(`op ${o.id}: rendered conflict history is missing its opening paragraph`);
});

if (problems.length) {
  console.error("campaign.js/index.html: " + problems.length + " problem(s)\n - " + problems.join("\n - "));
  process.exit(1);
}
console.log(`campaign.js/index.html ok: ${C.locations.length} locations, ${C.pilots.length} pilots, ${C.mechs.length} mechs, ${C.ops.length} ops, ${C.threads.length} threads, ${C.events.length} events, ${C.factions.length} factions`);