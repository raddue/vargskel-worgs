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

["locations", "factions", "pilots", "mechs", "ops", "threads", "events"].forEach(dupes);

/* Ids become markup and sort keys, and the fields the page reads without a guard
   must exist: a numeric id or a missing array used to blank the whole archive
   while this checker still printed "ok". */
const required = {
  locations: ["name", "kind", "x", "y"],
  factions: ["name", "standing"],
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

const tombstone = C.mechs.find(m => m.id === "tombstone");
if (!tombstone || Object.entries({ hp: 10, structure: 4, stress: 4, armor: 0, repair: 5, heat: 6, hull: 0, agi: 2, sys: 0, eng: 0, spd: 5, eva: 10, edef: 8, sens: 10, save: 10, attackBonus: 0, limitedBonus: 0 }).some(([k,v]) => tombstone[k] !== v)) problems.push('Tombstone stats do not match supplied stat block');
if (C.pilots.length !== 6 || C.mechs.length !== 5 || C.ops.length !== 1 || C.events.length || C.threads.length) problems.push('campaign starter should have six pilots, five mechs, one Solstice Rain operation, and no historical events/threads');
if (!C.pilots.some(p => p.name === "RURIK VARGSKEL" && p.img === "assets/rurik_vargskel.png") || !fs.existsSync(__dirname + "/assets/rurik_vargskel.png") || !C.pilots.some(p => p.id === "sten" && p.name === "STEN VARGSKEL" && !p.mech && !p.img && !p.triggers && !p.talents && !p.gear) || !C.pilots.some(p => p.name === "HANSEN “DUSTY” MCGRAW") || C.pilots.filter(p => p.name === "TBH").length !== 3) problems.push('starter roster must keep Rurik, Sten without assigned build/mech, Dusty, and three TBH pilots');
if (!C.mechs.some(m => m.name === "SWEET CHEEKS") || !C.mechs.some(m => m.name === "TOMBSTONE") || C.mechs.some(m => m.pilot === "sten") || C.mechs.filter(m => m.name === "TBH").length !== 3) problems.push('starter roster must keep Sweet Cheeks and Tombstone, three TBH mechs, and no Sten assignment');
const sr = C.ops[0];
if (!sr || sr.title !== "SOLSTICE RAIN" || sr.loc !== "elysia" || !sr.summary) problems.push('only operation should be SOLSTICE RAIN at Nov Elysia with an overview');
if (!sr || !sr.mission || !sr.mission.href || !fs.existsSync(__dirname + "/" + sr.mission.href)) problems.push('Solstice Rain must link to an existing current-mission page');
else if (/href="(?:gm|solstice-rain-m1)\.html"/.test(fs.readFileSync(__dirname + "/" + sr.mission.href, "utf8"))) problems.push(`${sr.mission.href}: crew briefing must not link to GM pages`);
const gm = fs.existsSync(__dirname + "/gm.html") ? fs.readFileSync(__dirname + "/gm.html", "utf8") : "";
for (const href of ["solstice-rain-m1.html", "solstice-rain-c1.html", "solstice-rain-c2.html", "solstice-rain-c3.html", "quest-cheatsheet.html"])
  if (!gm.includes(`href="${href}"`)) problems.push(`gm.html: missing ${href} link`);

C.mechs.forEach(m => {
  if (m.hpNow == null) return;
  if (typeof m.hp !== "number" || typeof m.hpNow !== "number" || m.hpNow < 0 || m.hpNow > m.hp)
    problems.push(`mech ${m.id}: hpNow ${JSON.stringify(m.hpNow)} needs hp as a number and 0 <= hpNow <= hp`);
});
const loc = ids("locations"), fac = ids("factions"), pilot = ids("pilots"), mech = ids("mechs"), op = ids("ops");

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
if (!page.includes('id="record-detail"')) problems.push('index.html: in-place record detail pane missing');
if (!page.includes('data-detail-host="pilot"') || !page.includes('data-detail-host="mech"')) problems.push('index.html: roster detail hosts missing');
if (C.pilots.find(p => p.id === "dusty")?.img !== "assets/dusty.png" || !fs.existsSync(__dirname + "/assets/dusty.png")) problems.push('Dusty portrait missing from campaign roster/assets');
if (C.mechs.find(m => m.id === "tombstone")?.img !== "assets/tombstone.png") problems.push('Tombstone image path missing from campaign record');
if (!page.includes('showAtRecord') || !page.includes('toggleRecord')) problems.push('index.html: in-place, toggleable roster selection handler missing');
if (!page.includes('CURRENT MISSION')) problems.push('index.html: operation card does not render the current-mission link');
if (!page.includes('showUnit')) problems.push('index.html: unit-level location details missing');
if (/\.holo-chips|data-mech-class/.test(page)) problems.push('index.html: map still exposes chassis selection controls');

if (problems.length) {
  console.error("campaign.js/index.html: " + problems.length + " problem(s)\n - " + problems.join("\n - "));
  process.exit(1);
}
console.log(`campaign.js/index.html ok: ${C.locations.length} locations, ${C.pilots.length} pilots, ${C.mechs.length} mechs, ${C.ops.length} ops, ${C.threads.length} threads, ${C.events.length} events, ${C.factions.length} factions`);