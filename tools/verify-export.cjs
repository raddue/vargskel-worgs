#!/usr/bin/env node
/* Answer "is the site current?" for one COMP/CON export, field by field, so a verification pass is a
   command rather than a fresh script.
   What it compares is what the export carries: pilot level and talents, and each mech's frame,
   systems and mounts. It does NOT compare live mech state, because no export carries it (see
   AGENTS.md), and it reads the record's flat systems list against the export's systems plus
   talent-granted systems, since that is how the record spells them.
   Usage: node tools/verify-export.cjs <export.json> [--mech <name>]
          node tools/verify-export.cjs --selftest */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const compcon = require("./compcon.cjs");

const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const sorted = a => (a || []).map(x => String(x)).slice().sort();
const sameList = (a, b) => JSON.stringify(sorted(a)) === JSON.stringify(sorted(b));

/* "Spaceborn 1, Leader 1" and [{name:"Spaceborn",rank:1}, ...] are the same field said two ways. */
function talentNames(field) {
  if (Array.isArray(field)) return field.map(t => `${t.name} ${t.rank}`.trim());
  return String(field || "").split(",").map(s => s.trim()).filter(Boolean);
}

/* The site record's mounts and the export's are both [{slot, weapons}], so compare slot by slot. */
function mountPairs(mounts) {
  return (mounts || []).map(m => `${m.slot}: ${sorted(m.weapons).join(" + ")}`).sort();
}

function diffPilot(site, ex) {
  const out = [];
  if ((site.ll ?? null) !== (ex.level ?? null)) out.push({ field: "ll", site: site.ll, export: ex.level });
  const a = talentNames(site.talents), b = talentNames(ex.talents);
  if (!sameList(a, b)) out.push({ field: "talents", site: a.join(", "), export: b.join(", ") });
  return out;
}

/* The record spells a frame "GMS SAGARMATHA" while an export carries the bare name, so compare the
   trailing name rather than the whole string. */
function sameFrame(site, ex) {
  const a = norm(site), b = norm(ex);
  return a === b || (b !== "" && a.endsWith(" " + b));
}

function diffMech(site, ex) {
  const out = [];
  if (!sameFrame(site.frame, ex.frame)) out.push({ field: "frame", site: site.frame, export: ex.frame });
  if (!sameList(site.systems, ex.build.allSystems)) out.push({ field: "systems", site: JSON.stringify(site.systems || []), export: JSON.stringify(ex.build.allSystems) });
  if (!sameList(mountPairs(site.mounts), mountPairs(ex.build.mounts))) out.push({ field: "mounts", site: JSON.stringify(mountPairs(site.mounts)), export: JSON.stringify(mountPairs(ex.build.mounts)) });
  return out;
}

function selftest() {
  const errs = [];
  const sitePilot = { ll: 0, talents: "Spaceborn 1, Field Analyst 1, Infiltrator 1" };
  const exPilot = { level: 0, talents: [{ name: "Spaceborn", rank: 1 }, { name: "Field Analyst", rank: 1 }, { name: "Infiltrator", rank: 1 }] };
  if (diffPilot(sitePilot, exPilot).length !== 0) errs.push(`the same pilot must not read as drift, got ${JSON.stringify(diffPilot(sitePilot, exPilot))}`);
  const otherTalents = { level: 0, talents: [{ name: "Spaceborn", rank: 2 }] };
  if (diffPilot(sitePilot, otherTalents).length !== 1) errs.push("a different rank must read as drift");
  const otherLevel = { level: 1, talents: exPilot.talents };
  if (diffPilot(sitePilot, otherLevel)[0].field !== "ll") errs.push("a different level must read as drift on ll");

  /* the record keeps talent-granted systems in its flat list, so an export holding them in
     integratedSystems is the same build and must not read as drift */
  const siteMech = { id: "xxxg-01h", name: "WAYWARD", frame: "GMS SAGARMATHA", systems: ["Spaceborn EVA", "Stable Structure"], mounts: [{ slot: "Main", weapons: ["Shotgun"] }] };
  const exMech = { name: "Wayward", frame: "Sagarmatha", build: { systems: ["Stable Structure"], integratedSystems: ["Spaceborn EVA"], allSystems: ["Stable Structure", "Spaceborn EVA"], mounts: [{ slot: "Main", weapons: ["Shotgun"] }] } };
  if (diffMech(siteMech, exMech).length !== 0) errs.push(`a talent-granted system must not read as drift, got ${JSON.stringify(diffMech(siteMech, exMech))}`);
  const moved = { name: "Wayward", frame: "Sagarmatha", build: { allSystems: ["Stable Structure"], mounts: exMech.build.mounts } };
  if (diffMech(siteMech, moved).length !== 1) errs.push("a system the export does not carry must read as drift");
  const swapped = { name: "Wayward", frame: "Sagarmatha", build: { allSystems: exMech.build.allSystems, mounts: [{ slot: "Main", weapons: ["Heavy Melee Weapon"] }] } };
  if (diffMech(siteMech, swapped)[0].field !== "mounts") errs.push("different weapons must read as drift on mounts");
  const reframed = { name: "Wayward", frame: "Chomolungma", build: exMech.build };
  if (diffMech(siteMech, reframed)[0].field !== "frame") errs.push("a different frame must read as drift on frame");
  /* order is not drift: the record's own order is a rendering choice */
  const reordered = { name: "Wayward", frame: "Sagarmatha", build: { allSystems: ["Spaceborn EVA", "Stable Structure"], mounts: exMech.build.mounts } };
  if (diffMech(siteMech, reordered).length !== 0) errs.push("the same systems in another order must not read as drift");

  if (errs.length) {
    console.error("verify-export selftest FAILED:\n - " + errs.join("\n - "));
    process.exit(1);
  }
  console.log("verify-export selftest ok");
}

function loadCampaign() {
  const box = { window: {} };
  box.window = box;
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(ROOT, "campaign.js"), "utf8"), box, { filename: "campaign.js" });
  return box.window.CAMPAIGN;
}

/* Same resolution rule apply-compcon uses: the mech's name first, then the pilot's own mech, because
   a player's second build has no record of its own. */
function sitePilotFor(C, ex) {
  return C.pilots.find(p => (norm(ex.callsign) && norm(p.name).includes(norm(ex.callsign))) || (norm(ex.name) && norm(p.name) === norm(ex.name))) || null;
}
function siteMechFor(C, exMech, sitePilot) {
  return C.mechs.find(m => norm(m.name) === norm(exMech.name)) || (sitePilot ? C.mechs.find(m => m.pilot === sitePilot.id) : null) || null;
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--selftest")) return selftest();
  const file = args.find(a => !a.startsWith("--"));
  const want = args.includes("--mech") ? args[args.indexOf("--mech") + 1] : "";
  if (!file) {
    console.error("usage: node tools/verify-export.cjs <export.json> [--mech <name>] | --selftest");
    process.exit(2);
  }
  const resolved = path.resolve(file);
  if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
    console.error(`verify-export: no export file at ${resolved}`);
    process.exit(2);
  }
  const C = loadCampaign();
  const ex = compcon.readExport(fs.readFileSync(resolved, "utf8"));
  console.log(`${path.basename(resolved)} (${ex.type}) vs campaign.js`);

  let drifted = 0, mechs = 0, extra = 0;
  for (const p of ex.pilots) {
    const mine = p.mechs.filter(m => !want || norm(m.name).includes(norm(want)));
    const resolved = mine.map(m => ({ m, site: siteMechFor(C, m, sitePilotFor(C, p)) }));
    /* a COMP/CON callsign drifts from the name the site keeps, so a pilot can also be identified
       through the mech it flies */
    const sitePilot = sitePilotFor(C, p) || C.pilots.find(x => resolved.some(r => r.site && r.site.pilot === x.id)) || null;
    if (!sitePilot) console.log(`  ${p.callsign || p.name}: no record on the site`);
    else for (const line of diffPilot(sitePilot, p)) {
      console.log(`  ${sitePilot.id} ${line.field}: record ${JSON.stringify(line.site)} vs export ${JSON.stringify(line.export)}`);
      drifted++;
    }
    for (const { m, site } of resolved) {
      /* a pilot's second build has no record of its own: the lookup falls back to the pilot's mech, so
         report it as a build the site does not hold rather than as drift on someone else's record */
      const ownBuild = site && norm(m.name) === norm(site.name) && sameFrame(site.frame, m.frame);
      if (!ownBuild) {
        console.log(`  not on the site: ${m.name} [${m.frame}]${site ? ` (its pilot's record holds ${site.id})` : ""}`);
        extra++;
        continue;
      }
      mechs++;
      for (const line of diffMech(site, m)) {
        console.log(`  ${site.id} ${line.field}: record ${line.site} vs export ${line.export}`);
        drifted++;
      }
    }
  }
  const covered = new Set(ex.pilots.flatMap(p => (p.mechs || []).map(m => (siteMechFor(C, m, sitePilotFor(C, p)) || {}).id)).filter(Boolean));
  const uncovered = C.mechs.filter(m => !covered.has(m.id) && !want).map(m => m.id);
  if (uncovered.length) console.log(`  no export covers: ${uncovered.join(", ")}`);
  console.log(`${ex.pilots.length} pilot(s), ${mechs} tracked build(s) compared: ${drifted ? drifted + " difference(s)" : "current"}` +
    (extra ? `, ${extra} export build(s) the site does not hold` : ""));
  process.exit(drifted ? 1 : 0);
}

module.exports = { diffPilot, diffMech, talentNames, mountPairs };

if (require.main === module) main();