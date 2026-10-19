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

if (errs.length) { console.error("loadout: " + errs.length + " problem(s)\n - " + errs.join("\n - ")); process.exit(1); }
console.log("loadout ok: catalogue resolves and its gate is current");
