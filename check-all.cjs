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
if (!tombstone || Object.entries({ hp: 10, structure: 4, stress: 4, armor: 0, repair: 5, heat: 6, hull: 0, agi: 2, sys: 0, eng: 0, size: 1, spd: 5, eva: 10, edef: 8, sens: 10, save: 10, attackBonus: 0, tech: "+0", limitedBonus: 0, loadout: "Main: Pistol · Flex: Charged Blade · Heavy: Thermal Lance", systems: "Pattern-A Jericho Deployable Cover, COMP/CON-Class Assistant Unit, EVA Module, Expanded Compartment" }).some(([k,v]) => tombstone[k] !== v)) problems.push('Tombstone stats do not match supplied stat block');
const dusty = C.pilots.find(p => p.id === "dusty");
if (!dusty || Object.entries({ name: "HANSEN “DUSTY” MCGRAW", background: "PILOT · LL0 · OUTLAW", triggers: "Charm (+2), Spot (+2), Survive (+2), Take Someone Out (+2)", talents: "Gunslinger 1, Vanguard 1, Skirmisher 1", gear: "Mobility Hardsuit, Heavy Signature, Medium Signature, Wilderness Survival Kit, Antiphoton Visor, Smart Scope" }).some(([k,v]) => dusty[k] !== v)) problems.push('Dusty pilot record does not match supplied profile');
if (C.pilots.length !== 6 || C.mechs.length !== 6 || C.ops.length !== 1 || C.events.length || C.threads.length) problems.push('campaign should have six pilots/mechs, one Solstice Rain operation, and no historical events/threads');
if (!C.pilots.some(p => p.name === "RURIK VARGSKEL" && p.img === "assets/rurik_vargskel.png") || !fs.existsSync(__dirname + "/assets/rurik_vargskel.png") || !C.pilots.some(p => p.id === "sten" && p.name === "STEN “HAMMER” VARGSKEL" && p.mech === "skaldr" && p.img === "assets/sten.png") || !fs.existsSync(__dirname + "/assets/sten.png") || !C.pilots.some(p => p.name === "HANSEN “DUSTY” MCGRAW") || !C.pilots.some(p => p.id === "spook" && p.name === "NICOLOSO BENIKO “SPOOK”" && p.mech === "alba")) problems.push('roster must keep Rurik, Sten with Skaldr, Dusty, Guillaume, Danila, and Spook with Alba');
if (!C.mechs.some(m => m.name === "SWEET CHEEKS") || !C.mechs.some(m => m.name === "TOMBSTONE") || !C.mechs.some(m => m.pilot === "sten" && m.id === "skaldr") || !C.mechs.some(m => m.id === "alba" && m.pilot === "spook" && m.name === "ALBA")) problems.push('roster must keep Sweet Cheeks, Tombstone, Wayward, Scooteroo, Skaldr, and Alba');
const spook = C.pilots.find(p => p.id === "spook"), alba = C.mechs.find(m => m.id === "alba");
if (!spook || Object.entries({ name: "NICOLOSO BENIKO “SPOOK”", background: "PILOT · LL0 · SABOTEUR", mech: "alba", triggers: "Act Unseen or Unheard (+2), Blow Something Up (+2), Stay Cool (+2), Take Someone Out (+2)", talents: "Crack Shot 1, Infiltrator 1, Skirmisher 1", gear: "Stealth Hardsuit, Heavy Signature, Archaic Melee, Camo Cloth, SSC Sylph Undersuit, Thermite Charge" }).some(([k,v]) => spook[k] !== v)) problems.push('Spook pilot record does not match supplied profile');
if (!alba || Object.entries({ name: "ALBA", frame: "GMS EVEREST", pilot: "spook", size: 1, hull: 0, agi: 2, sys: 0, eng: 0, structure: 4, hp: 12, armor: 0, stress: 4, heat: 6, repair: 5, attackBonus: 0, tech: "+0", limitedBonus: 0, spd: 5, eva: 10, edef: 8, sens: 10, save: 10, loadout: "Main: Missile Rack · Flex: Pistol / Tactical Knife · Heavy: Anti-Materiel Rifle", systems: "Personalizations, Rapid Burst Jump Jet System, EVA Module, Pattern-A Jericho Deployable Cover" }).some(([k,v]) => alba[k] !== v)) problems.push('Alba mech record does not match supplied stat block');
const sten = C.pilots.find(p => p.id === "sten"), skaldr = C.mechs.find(m => m.id === "skaldr");
if (!sten || Object.entries({ name: "STEN “HAMMER” VARGSKEL", background: "PILOT · LL0 · MECHANIC", mech: "skaldr", triggers: "Assault (+2), Hack or Fix (+2), Survive (+2), Threaten (+2)", talents: "Bonded 1, Grease Monkey 1, Executioner 1", gear: "Heavy Hardsuit, Heavy A/C, Light Signature, Tertiary Arm, Corrective, Dataplating" }).some(([k,v]) => sten[k] !== v)) problems.push('Sten pilot record does not match export');
if (!skaldr || Object.entries({ name: "SKALDR", frame: "GMS EVEREST", pilot: "sten", size: 1, hull: 2, agi: 0, sys: 0, eng: 0, hp: 16, structure: 4, stress: 4, armor: 0, heat: 6, repair: 6, attackBonus: 0, tech: "+0", limitedBonus: 0, spd: 4, eva: 8, edef: 8, sens: 10, save: 10, loadout: "Main: Shotgun · Flex: Nexus (Hunter-Killer) · Heavy: Heavy Charged Blade", systems: "Stable Structure, Type-3 Projected Shield, Personalizations, Custom Paint Job" }).some(([k,v]) => skaldr[k] !== v)) problems.push('Skaldr mech record does not match export');
const guillaume = C.pilots.find(p => p.id === "guillaume"), sagarmatha = C.mechs.find(m => m.id === "xxxg-01h");
if (!guillaume || Object.entries({ name: "GUILLAUME “TIZONA” ARAGONEAU", background: "PILOT · LL0 · COLONIST", mech: "xxxg-01h", img: "assets/tizona.png", triggers: "Act Unseen or Unheard (+2), Survive (+2), Take Someone Out (+2), Word on the Street (+2)", gear: "Light Hardsuit, Light Signature, Light A/C, Extra Rations, Sleeping Bag, Wilderness Survival Kit", talents: "Heavy Gunner 1, Spaceborn 1, House Guard 1" }).some(([k,v]) => guillaume[k] !== v)) problems.push('Guillaume pilot record does not match supplied profile');
if (!sagarmatha || Object.entries({ name: "WAYWARD", frame: "GMS SAGARMATHA", pilot: "guillaume", size: 2, hull: 2, agi: 0, sys: 0, eng: 0, structure: 4, hp: 14, armor: 1, stress: 4, heat: 6, repair: 5, attackBonus: 0, tech: "+0", limitedBonus: 0, spd: 4, eva: 8, edef: 8, sens: 10, save: 10, loadout: "Main: Charged Blade · Flex: Missile Rack / Missile Rack · Heavy: Heavy Machine Gun", systems: "Spaceborn EVA, Custom Paint Job, Pattern-A Smoke Charges, Stable Structure, Personalizations" }).some(([k,v]) => sagarmatha[k] !== v)) problems.push('Wayward mech record does not match supplied profile');
if (!fs.existsSync(__dirname + "/assets/tizona.png")) problems.push('Tizona portrait missing from assets');
const danila = C.pilots.find(p => p.id === "danila"), scooteroo = C.mechs.find(m => m.id === "scooteroo");
if (!danila || Object.entries({ name: "DANILA “SCOOTER” HOWTER-BOWDEN", background: "PILOT · LL0 · WORKER", mech: "scooteroo", img: "assets/scooter.png", triggers: "Blow Something Up (+2), Invent or Create (+2), Spot (+2), Stay Cool (+2)", gear: "Heavy Hardsuit, Heavy A/C, Light Signature, Sound System, Tertiary Arm, Extra Rations", talents: "Siege Specialist 1, Grease Monkey 1, Walking Armory 1" }).some(([k,v]) => danila[k] !== v)) problems.push('Danila pilot record does not match supplied profile');
if (!fs.existsSync(__dirname + "/assets/scooter.png")) problems.push('Scooter portrait missing from assets');
if (!scooteroo || Object.entries({ name: "SCOOTEROO", frame: "GMS EVEREST", pilot: "danila", img: "assets/scooteroo.png", size: 1, hull: 2, agi: 0, sys: 0, eng: 0, structure: 4, hp: 14, armor: 0, stress: 4, heat: 6, repair: 6, attackBonus: 0, tech: "+0", limitedBonus: 0, spd: 4, eva: 8, edef: 8, sens: 10, save: 10, loadout: "Main: Shotgun · Flex: Rocket-Propelled Grenade · Heavy: Howitzer", systems: "Ammo Case I, Type-3 Projected Shield, Manipulators, Stable Structure, EVA Module" }).some(([k,v]) => scooteroo[k] !== v)) problems.push('Scooteroo mech record does not match supplied profile');
if (!fs.existsSync(__dirname + "/assets/scooteroo.png")) problems.push('Scooteroo artwork missing from assets');
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
const ui = fs.readFileSync(__dirname + "/archive.js", "utf8");
const pilotsPage = fs.readFileSync(__dirname + "/pilots.html", "utf8");
const mechPage = fs.readFileSync(__dirname + "/mechbay.html", "utf8");
if (!page.includes('id="record-detail"')) problems.push('index.html: in-place record detail pane missing');
if (!ui.includes('data-detail-host="pilot"') || !ui.includes('data-detail-host="mech"')) problems.push('archive.js: roster detail hosts missing');
const crewCard = ui.match(/el\("crew-list"\)\.innerHTML=C\.pilots\.map\(p=>`([\s\S]*?)`\)\.join\(""\)/)?.[1] || "";
if (!crewCard || crewCard.includes('p.img&&p.triggers') || crewCard.includes('!p.img&&') || !crewCard.includes('p.triggers?')) problems.push('archive.js: all pilot cards must show triggers beside portrait or initial once');
if (C.pilots.find(p => p.id === "dusty")?.img !== "assets/dusty.png" || !fs.existsSync(__dirname + "/assets/dusty.png")) problems.push('Dusty portrait missing from campaign roster/assets');
if (C.mechs.find(m => m.id === "tombstone")?.img !== "assets/tombstone.png") problems.push('Tombstone image path missing from campaign record');
if (!ui.includes('showAtRecord') || !ui.includes('toggleRecord')) problems.push('archive.js: in-place, toggleable roster selection handler missing');
if (!ui.includes('CURRENT MISSION')) problems.push('archive.js: operation card does not render the current-mission link');
if (!ui.includes('showUnit')) problems.push('archive.js: unit-level location details missing');
if (/\.holo-chips|data-mech-class/.test(page)) problems.push('index.html: map still exposes chassis selection controls');
if (!pilotsPage.includes('id="crew-list"') || !pilotsPage.includes('archive.js')) problems.push('pilots.html: crew roster list or shared archive script missing');
if (!mechPage.includes('id="mech-list"') || !mechPage.includes('archive.js')) problems.push('mechbay.html: chassis register list or shared archive script missing');
const pilotDossierPage = fs.readFileSync(__dirname + "/pilot.html", "utf8");
const mechDossierPage = fs.readFileSync(__dirname + "/mech.html", "utf8");
if (!ui.includes('pilotDossier') || !ui.includes('mechDossier')) problems.push('archive.js: per-pilot / per-mech dossier renderers missing');
if (!pilotDossierPage.includes('id="dossier"') || !pilotDossierPage.includes('archive.js')) problems.push('pilot.html: dossier host or shared archive script missing');
if (!mechDossierPage.includes('id="dossier"') || !mechDossierPage.includes('archive.js')) problems.push('mech.html: dossier host or shared archive script missing');

if (problems.length) {
  console.error("campaign.js/index.html: " + problems.length + " problem(s)\n - " + problems.join("\n - "));
  process.exit(1);
}
console.log(`campaign.js/index.html ok: ${C.locations.length} locations, ${C.pilots.length} pilots, ${C.mechs.length} mechs, ${C.ops.length} ops, ${C.threads.length} threads, ${C.events.length} events, ${C.factions.length} factions`);