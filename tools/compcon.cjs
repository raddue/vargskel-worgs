#!/usr/bin/env node
/* Read a COMP/CON export into one normal form so callers stop hand-walking its shapes.
   Two shapes are in play:
     - a Pilot Group export keeps its payload as a JSON string under `data`, holding `pilotData`
     - an archive keeps collections under `data.data`
   A build's talent-granted systems live in `loadout.integratedSystems`, not `loadout.systems`, and
   the live build is `loadouts[active_loadout_index]`, not `loadouts[0]`.
   Usage: node tools/compcon.cjs <export.json> [--mech <name>]   (dump what the reader sees)
          node tools/compcon.cjs --selftest */
const fs = require("fs");
const path = require("path");

/* A Pilot Group payload only lives under a string `data`, so unwrap that shape and nothing else.
   The raw mech rides along: COMPCON's own field names (current_hp and friends) are its business. */
function readExport(text) {
  let data = text;
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch (e) { return { type: "?", pilots: [] }; }
  }
  if (!data || typeof data !== "object") return { type: "?", pilots: [] };
  if (typeof data.data === "string") {
    try { data = Object.assign({}, data, { data: JSON.parse(data.data) }); } catch (e) { /* keep the string */ }
  }
  return { type: data.EXPORT_TYPE || "?", pilots: walk(data).map(normalisePilot) };
}

/* Anything holding a `mechs` list is a pilot record, and the walk skips strings, so a nested blob is
   not mistaken for a payload. */
function walk(data) {
  if (Array.isArray(data)) return data.flatMap(walk);
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data.mechs)) return [data];
  return Object.values(data).flatMap(v => (v && typeof v === "object" ? walk(v) : []));
}

function normalisePilot(p) {
  return {
    callsign: p.callsign || p.name || "",
    name: p.name || "",
    level: p.level,
    talents: (p.talents || []).map(t => ({ name: (t.data && t.data.name) || t.id, rank: t.rank != null ? t.rank : t.curr_rank })),
    mechs: (p.mechs || []).map(m => ({
      name: m.name || "",
      frame: (m.frameData && m.frameData.name) || m.frame || "",
      raw: m,
      build: readBuild(m),
    })),
  };
}

/* The build the player has selected, with names pulled out of COMPCON's wrappers. */
function readBuild(mech) {
  const m = mech || {};
  const list = m.loadouts || [];
  const idx = m.active_loadout_index != null && list[m.active_loadout_index] ? m.active_loadout_index : 0;
  const lo = list[idx] || {};
  const names = arr => (arr || []).map(s => (s && s.data ? s.data.name : s)).filter(Boolean);
  const systems = names(lo.systems);
  const integratedSystems = names(lo.integratedSystems);
  const mounts = (lo.mounts || []).map(mo => ({
    slot: mo.mount_type || mo.slot || "",
    weapons: (mo.slots || []).map(s => (s.weapon && (s.weapon.data ? s.weapon.data.name : s.weapon.name)) || "").filter(Boolean),
  }));
  return { systems, integratedSystems, allSystems: systems.concat(integratedSystems), mounts };
}

function selftest() {
  const errs = [];
  const group = JSON.stringify({
    EXPORT_TYPE: "Pilot Group",
    data: JSON.stringify({
      groupData: { name: "No Group" },
      pilotData: [
        {
          callsign: "Tizona", name: "Guillaume Aragoneau", level: 0,
          talents: [{ id: "t_spaceborn", data: { name: "Spaceborn" }, rank: 1 }],
          mechs: [{
            name: "Wayward", frame: "Sagarmatha", active_loadout_index: 1,
            current_hp: 7, statuses: ["STUNNED"],
            loadouts: [
              { systems: [{ data: { name: "Not The Active Build" } }], mounts: [] },
              {
                systems: [{ data: { name: "Stable Structure" } }],
                integratedSystems: [{ data: { name: "Spaceborn EVA" } }],
                mounts: [{ mount_type: "Main", slots: [{ size: "Main", weapon: { data: { name: "Shotgun" } } }] }],
              },
            ],
          }],
        },
        { callsign: "Frisky", name: "Rurik Vergskal", level: 0, talents: [], mechs: [{ name: "Averna", frame: "Chomolungma", loadouts: [] }] },
      ],
    }),
  });
  const ex = readExport(group);
  if (ex.type !== "Pilot Group") errs.push(`a Pilot Group export must report its type, got ${ex.type}`);
  if (ex.pilots.length !== 2) errs.push(`a Pilot Group payload must yield its pilots, got ${ex.pilots.length}`);
  const tizona = ex.pilots[0] || {};
  if (tizona.callsign !== "Tizona" || tizona.level !== 0) errs.push(`a pilot must keep callsign and level, got ${JSON.stringify({ c: tizona.callsign, l: tizona.level })}`);
  if (JSON.stringify(tizona.talents || []) !== JSON.stringify([{ name: "Spaceborn", rank: 1 }])) errs.push(`talents must normalise to name and rank, got ${JSON.stringify(tizona.talents)}`);
  const mech = (tizona.mechs || [])[0] || {};
  if (mech.name !== "Wayward" || mech.frame !== "Sagarmatha") errs.push(`a mech must keep name and frame, got ${JSON.stringify({ n: mech.name, f: mech.frame })}`);
  if (!mech.raw || mech.raw.current_hp !== 7) errs.push("the raw mech must ride along for callers reading COMPCON's own fields");
  const build = mech.build || {};
  if (JSON.stringify(build.systems) !== JSON.stringify(["Stable Structure"])) errs.push(`the active loadout decides the systems, got ${JSON.stringify(build.systems)}`);
  if (JSON.stringify(build.integratedSystems) !== JSON.stringify(["Spaceborn EVA"])) errs.push(`talent-granted systems must be read, got ${JSON.stringify(build.integratedSystems)}`);
  if (JSON.stringify(build.allSystems) !== JSON.stringify(["Stable Structure", "Spaceborn EVA"])) errs.push(`the flat list must carry both, got ${JSON.stringify(build.allSystems)}`);
  if (JSON.stringify(build.mounts) !== JSON.stringify([{ slot: "Main", weapons: ["Shotgun"] }])) errs.push(`mounts must normalise to slot and weapon names, got ${JSON.stringify(build.mounts)}`);

  const archive = JSON.stringify({ EXPORT_TYPE: "Save COMP/CON Archive", data: { data: [{ collection: "pilots", items: { p: { callsign: "A", mechs: [] } } }] } });
  const arc = readExport(archive);
  if (arc.pilots.length !== 1) errs.push(`an archive-shaped export must still yield its pilots, got ${arc.pilots.length}`);
  if (!readBuild({ loadouts: [] })) errs.push("a mech with no loadout must still return a build");
  if (readBuild({ loadouts: [] }).mounts.length !== 0) errs.push("a mech with no loadout must return no mounts");

  if (errs.length) {
    console.error("compcon selftest FAILED:\n - " + errs.join("\n - "));
    process.exit(1);
  }
  console.log("compcon selftest ok");
}

module.exports = { readExport, readBuild };

if (require.main === module) {
  const args = process.argv.slice(2);
  if (args.includes("--selftest")) selftest();
  else {
    const file = args.find(a => !a.startsWith("--"));
    const want = args.includes("--mech") ? args[args.indexOf("--mech") + 1] : "";
    if (!file) {
      console.error("usage: node tools/compcon.cjs <export.json> [--mech <name>] | --selftest");
      process.exit(2);
    }
    const resolved = path.resolve(file);
    if (!fs.existsSync(resolved) || !fs.statSync(resolved).isFile()) {
      console.error(`compcon: no export file at ${resolved}`);
      process.exit(2);
    }
    const ex = readExport(fs.readFileSync(resolved, "utf8"));
    console.log(`${path.basename(file)}: ${ex.type}, ${ex.pilots.length} pilot(s)`);
    for (const p of ex.pilots) {
      if (want && !p.mechs.some(m => m.name.toLowerCase().includes(want.toLowerCase()))) continue;
      console.log(`  ${p.callsign || "?"} (${p.name || "?"}) ll${p.level} | ${p.talents.map(t => t.name + " " + t.rank).join(", ")}`);
      for (const m of p.mechs) {
        if (want && !m.name.toLowerCase().includes(want.toLowerCase())) continue;
        console.log(`    ${m.name} [${m.frame}]`);
        console.log(`      systems: ${JSON.stringify(m.build.systems)}`);
        console.log(`      integrated: ${JSON.stringify(m.build.integratedSystems)}`);
        console.log(`      mounts: ${JSON.stringify(m.build.mounts)}`);
      }
    }
  }
}