#!/usr/bin/env node
/* Extract the supplement subset detail.js and catalogue.js need from a COMP/CON archive.
   lancer-data 3.1.7 carries neither CHOMOLUNGMA, SAGARMATHA, Spaceborn nor House Guard, so the
   generators have nothing to index for items the campaign fields. A COMP/CON archive embeds the
   LCP packs that do carry them.
   Subset rule matches the generators: only items campaign.js fields, and only the two tables with a
   gap. A supplement weapon or system would show up as UNRESOLVED from build-detail.cjs instead.
   Run: node tools/extract-supplement.cjs [archive] [out dir] */

const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const ARCH = process.env.COMPCON_ARCHIVE || process.argv[2] || "/home/rickr/Downloads/CC_2026-10-16.compcon";
const OUT = process.env.SUPPLEMENT_DATA || process.argv[3] || "/tmp/sup";

if (!fs.existsSync(ARCH)) {
  console.error(`supplement: no COMP/CON archive at ${ARCH}\n` +
    `  Export one from COMP/CON (or point COMPCON_ARCHIVE at it), then re-run this script.`);
  process.exit(1);
}

const sandbox = { window: {} };
sandbox.window = sandbox; /* campaign.js is browser code and needs window to exist */
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, "campaign.js"), "utf8"), sandbox, { filename: "campaign.js" });
const C = sandbox.window.CAMPAIGN;

const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const wantedFrames = new Set((C.mechs || []).map(m => norm(m.frame)));
const wantedTalents = new Set();
for (const p of C.pilots || [])
  for (const t of String(p.talents || "").split(",").map(x => x.trim()).filter(Boolean))
    wantedTalents.add(norm(t.replace(/\s*\d+$/, "")));

const archive = JSON.parse(fs.readFileSync(ARCH, "utf8"));
const packs = (archive.data && archive.data.data ? archive.data.data : [])
  .filter(c => c.collection === "content")
  .flatMap(c => (Array.isArray(c.items) ? c.items : Object.values(c.items || {})));

const frames = [], talents = [], used = [];
const seenFrame = new Set(), seenTalent = new Set();
for (const pack of packs) {
  const data = pack.data || {};
  const hitFrames = (data.frames || []).filter(f => wantedFrames.has(norm(`${f.source} ${f.name}`)));
  const hitTalents = (data.talents || []).filter(t => wantedTalents.has(norm(t.name)));
  if (!hitFrames.length && !hitTalents.length) continue;
  for (const f of hitFrames) if (!seenFrame.has(norm(f.name))) { seenFrame.add(norm(f.name)); frames.push(f); }
  for (const t of hitTalents) if (!seenTalent.has(norm(t.name))) { seenTalent.add(norm(t.name)); talents.push(t); }
  const m = pack.manifest || {};
  used.push({ name: m.name || pack.id, version: m.version || "" });
}

fs.mkdirSync(OUT, { recursive: true });
const write = (f, v) => fs.writeFileSync(path.join(OUT, f), JSON.stringify(v, null, 1) + "\n");
write("frames.json", frames);
write("talents.json", talents);
write("packs.json", used.sort((a, b) => a.name.localeCompare(b.name)));

console.log(`supplement: ${frames.length} frame(s) [${frames.map(f => f.name).join(", ") || "none"}], ` +
  `${talents.length} talent(s) [${talents.map(t => t.name).join(", ") || "none"}] -> ${OUT}`);
console.log("packs:", used.map(p => `${p.name} v${p.version}`).join(", ") || "none");