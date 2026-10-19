#!/usr/bin/env node
/* #26 loadout checks. Kept in this file rather than in check-all.cjs, because check-all is the
   shared gate and this is one ticket's assertions; check-all spawns it as a single line.
   Run: node tools/loadout-check.cjs */
const fs = require("fs"), path = require("path"), vm = require("vm"), { spawnSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const errs = [];

/* catalogue.js is generated from lancer-data, so a stale or missing copy has to fail here. */
const catPath = path.join(ROOT, "catalogue.js");
if (!fs.existsSync(catPath)) errs.push("catalogue.js is missing (run: node tools/build-catalogue.cjs)");
else {
  const box = { window: {}, console, matchMedia: () => ({ matches: true }) };
  vm.runInNewContext(fs.readFileSync(catPath, "utf8"), box, { filename: "catalogue.js" });
  const CAT = box.window.CATALOGUE;
  if (!CAT || !CAT.weapons || !CAT.systems || !CAT.frames)
    errs.push("catalogue.js must define window.CATALOGUE with weapons, systems and frames");
  else {
    const w = CAT.weapons["Nexus (Hunter-Killer)"];
    if (!w) errs.push("catalogue: GMS Nexus (Hunter-Killer) must resolve by name");
    else {
      if (w.mount !== "Main") errs.push(`catalogue: Nexus (Hunter-Killer) mount must be Main, got ${JSON.stringify(w.mount)}`);
      if (!Array.isArray(w.bands) || !w.bands.length) errs.push("catalogue: Nexus (Hunter-Killer) must carry bands");
    }
    const s = CAT.systems["Personalizations"];
    if (!s || s.sp !== 1 || !s.tg_unique) errs.push("catalogue: Personalizations must carry sp 1 and tg_unique");
    const f = CAT.frames["GMS Everest"];
    if (!f || !Array.isArray(f.mounts) || f.mounts.join(",") !== "Main,Flex,Heavy")
      errs.push(`catalogue: GMS Everest must carry mounts Main,Flex,Heavy, got ${JSON.stringify(f && f.mounts)}`);
  }
}
const gen = path.join(__dirname, "build-catalogue.cjs");
if (!fs.existsSync(gen)) errs.push("tools/build-catalogue.cjs is missing");
else if (spawnSync(process.execPath, [gen, "--check"], { encoding: "utf8" }).status !== 0)
  errs.push("catalogue.js stale; regen: node tools/build-catalogue.cjs");


/* --- gating (design test 4) ----------------------------------------------------------------
   On a fixture so the cap is pinned by arithmetic instead of by today's data: a frame with
   sys 3, a mech with sys 3 and an LL6 pilot give 3 + floor(3/2) + ceil(6/2) = 7. */
if (!fs.existsSync(path.join(ROOT, "loadout.js"))) errs.push("loadout.js is missing");
else {
  const core = require(path.join(ROOT, "loadout.js"));
  const CAT = (() => {
    const box = { window: {}, console, matchMedia: () => ({ matches: true }) };
    vm.runInNewContext(fs.readFileSync(catPath, "utf8"), box, { filename: "catalogue.js" });
    return box.window.CATALOGUE;
  })();
  if (!CAT.fittings) errs.push("catalogue must carry the mount fitting table from rules.json");
  else {
    const FIX_FRAME = { name: "FIXTURE EVEREST", mounts: ["Main", "Flex", "Heavy"], sys: 3 };
    const cat = { weapons: CAT.weapons, systems: CAT.systems, frames: Object.assign({}, CAT.frames, { "FIXTURE EVEREST": FIX_FRAME }), fittings: CAT.fittings };
    const heavy = Object.keys(cat.weapons).find(n => cat.weapons[n].mount === "Heavy");
    const gms = "Nexus (Hunter-Killer)";
    const fixturePilot = { id: "fix", ll: 6, licences: [{ name: "GMS", rank: 1 }] };
    const build = { mech: "fix", frame: "FIXTURE EVEREST", pilot: "fix", sys: 3,
      mounts: [{ slot: "Main", weapons: [] }, { slot: "Flex", weapons: [] }, { slot: "Heavy", weapons: [] }], systems: [] };
    const copy = () => JSON.parse(JSON.stringify(build));
    const say = (label, got, want) => { if (!got || got.reason !== want) errs.push(`canMount: ${label} must be ${want}, got ${JSON.stringify(got)}`); };

    const cap = core.spCheck(copy(), FIX_FRAME, cat, fixturePilot);
    if (cap.cap !== 7) errs.push(`spCheck: fixture cap must be 7, got ${JSON.stringify(cap.cap)}`);
    if (!core.canMount(fixturePilot, copy(), 0, 0, gms, cat).ok) errs.push("canMount: a GMS Main weapon must fit a Main seat");
    if (!heavy) errs.push("loadout-check: no Heavy weapon in the catalogue to test with");
    else say("a Heavy weapon in a Main seat", core.canMount(fixturePilot, copy(), 0, 0, heavy, cat), "WRONG MOUNT TYPE");
    /* Every weapon the subset carries is GMS, since all six pilots are LL0, so the licence gate is
       tested on a synthetic catalogue entry rather than on today's data. */
    const licensed = { weapons: Object.assign({ "GATED RIFLE": { mount: "Main", license: "IPS-N", license_level: 1, tags: [] } }, cat.weapons),
      systems: cat.systems, frames: cat.frames, fittings: cat.fittings };
    say("a weapon whose licence the pilot lacks", core.canMount({ id: "p", ll: 0, licences: [] }, copy(), 0, 0, "GATED RIFLE", licensed), "UNLICENSED");
    say("a weapon whose licence rank the pilot has not reached", core.canMount({ id: "p", ll: 1, licences: [{ name: "IPS-N", rank: 0 }] }, copy(), 0, 0, "GATED RIFLE", licensed), "UNLICENSED");
    if (!core.canMount({ id: "p", ll: 1, licences: [{ name: "IPS-N", rank: 1 }] }, copy(), 0, 0, "GATED RIFLE", licensed).ok)
      errs.push("canMount: a weapon at or under the held licence rank must be allowed");
    const two = copy(); two.mounts[0].weapons = [gms];
    say("a second weapon in one seat", core.canMount(fixturePilot, two, 0, 0, gms, cat), "SLOT FULL");
    say("an unknown weapon", core.canMount(fixturePilot, copy(), 0, 0, "Nonexistent Rifle", cat), "UNKNOWN WEAPON");
    /* over cap, on a second fixture with a cap of exactly 0 (frame sys 0, mech sys 0, LL0), so one
       SP-costing system is already over it. The subset holds no seven-SP build to spend against 7. */
    const tightFrame = { name: "TIGHT FIXTURE", mounts: ["Main", "Flex", "Heavy"], sys: 0 };
    const tight = { weapons: cat.weapons, systems: cat.systems, fittings: cat.fittings,
      frames: Object.assign({}, cat.frames, { "TIGHT FIXTURE": tightFrame }) };
    const spendy = Object.keys(cat.systems).find(n => cat.systems[n].sp > 0 && !cat.systems[n].tg_unique && !cat.systems[n].tg_ai);
    if (!spendy) errs.push("loadout-check: no SP-costing system in the catalogue to test the cap with");
    else {
      const over = copy(); over.frame = "TIGHT FIXTURE"; over.sys = 0; over.systems = [spendy];
      const zeroPilot = { id: "z", ll: 0, licences: [{ name: "GMS", rank: 1 }] };
      const chk = core.spCheck(over, tightFrame, tight, zeroPilot);
      if (chk.cap !== 0) errs.push(`spCheck: the tight fixture cap must be 0, got ${JSON.stringify(chk.cap)}`);
      if (chk.ok) errs.push("spCheck: one SP-costing system must exceed a cap of 0");
      say("an over-cap build", core.canMount(zeroPilot, over, 1, 0, gms, tight), "OVER SP CAP");
    }
  }
}

if (errs.length) { console.error("loadout: " + errs.length + " problem(s)\n - " + errs.join("\n - ")); process.exit(1); }
console.log("loadout ok: catalogue resolves and its gate is current");
