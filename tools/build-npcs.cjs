#!/usr/bin/env node
/* Generate npcs.js (window.NPCS) for the GM board: every NPC class with its role, its tiered stats and
   its features, so the board can show a card per NPC the GM has fielded.
   Rules data (c) Massif Press, LANCER. Derived from lancer-npc-data.lcp, the COMP/CON NPC data pack.
   Tiered stats arrive as three-value arrays (hp:[10,12,14] is tier 1, 2, 3); scalars are fixed.
   Run: node tools/build-npcs.cjs [npcc dir] */
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const SRC = process.env.NPC_DATA || (!process.argv[2]?.startsWith("--") ? process.argv[2] : "") || "/tmp/lcp";
const OUT = path.join(ROOT, "npcs.js");

/* A feature's own text lives in effect, or in its first action's detail for an active system. */
const featureText = f => {
  const parts = [f.effect];
  for (const a of f.actions || []) if (a.detail) parts.push(`${a.name ? a.name + ": " : ""}${a.detail}`);
  const dmgLine = (f.damage || []).map(d => [d.val, d.type].filter(Boolean).join(" ")).join(" ");
  const rngLine = (f.range || []).map(r => [r.type, r.val].filter(Boolean).join(" ")).join(" ");
  const line = [dmgLine, rngLine].filter(Boolean).join(" · ");
  if (line) parts.push(line);
  return parts.filter(Boolean).join(" ").trim();
};

/* One class entry: everything the board needs, nothing COMP/CON-only. A class file lists its own
   features as siblings of the class entry, so they arrive here as a list. */
function normaliseClass(raw, siblingFeatures) {
  if (!raw || typeof raw !== "object" || !raw.name) return null;
  const stats = raw.stats || {};
  const tiered = k => Array.isArray(stats[k]) && stats[k].length >= 3;
  return {
    id: raw.id || "",
    name: raw.name,
    role: String(raw.role || "").toLowerCase(),
    info: raw.info || "",
    stats,
    /* what the board needs to know to render a tier without guessing: which fields vary */
    tiered: Object.keys(stats).filter(tiered),
    features: (siblingFeatures || raw.features || []).map(f => (typeof f === "string" ? { name: f, type: "", text: "" } : { name: f.name || f.id, type: f.type || "", text: featureText(f) })),
  };
}

function selftest() {
  const errs = [];
  const raw = { id: "npcc_ace", name: "Ace", role: "striker", info: "A pilot's pilot.", stats: { armor: 0, hp: [10, 12, 14], evade: [12, 15, 18], size: 1 }, features: [{ name: "Missile Launcher", type: "Weapon", damage: [{ val: "3d6", type: "Explosive" }], range: [{ type: "Line", val: 10 }] }, "Rapid Response"] };
  const c = normaliseClass(raw);
  if (c.name !== "Ace" || c.role !== "striker") errs.push(`a class must keep its name and role, got ${JSON.stringify({ n: c.name, r: c.role })}`);
  if (JSON.stringify(c.stats.hp) !== JSON.stringify([10, 12, 14])) errs.push("tiered stats must ride through untouched, since the board indexes them by tier");
  if (JSON.stringify(c.tiered) !== JSON.stringify(["hp", "evade"])) errs.push(`the tiered field list must name what varies, got ${JSON.stringify(c.tiered)}`);
  if (c.features.length !== 2) errs.push(`features must normalise to objects, got ${c.features.length}`);
  if (!/3d6/.test(c.features[0].text) || !/Line 10/.test(c.features[0].text)) errs.push(`a weapon's damage and range belong in its text, got ${JSON.stringify(c.features[0].text)}`);
  if (c.features[1].name !== "Rapid Response" || c.features[1].type !== "") errs.push("a bare feature name must survive as an object with an empty type");
  /* a class file lists its features beside the class entry, not inside it */
  const withSiblings = normaliseClass({ id: "npcc_ace", name: "Ace", stats: {} }, [{ name: "Barrel Roll", type: "System", effect: "Move 2 spaces." }]);
  if (withSiblings.features.length !== 1 || !/Move 2 spaces/.test(withSiblings.features[0].text)) errs.push(`a class must take the features listed beside it, got ${JSON.stringify(withSiblings.features)}`);
  if (normaliseClass({ id: "x", name: "Y", stats: {} }).features.length !== 0) errs.push("a class with no features listed must carry none");
  if (normaliseClass(null) !== null || normaliseClass({}) !== null) errs.push("an entry with no name must be dropped");
  if (errs.length) {
    console.error("build-npcs selftest FAILED:\n - " + errs.join("\n - "));
    process.exit(1);
  }
  console.log("build-npcs selftest ok");
}

function readClasses(dir) {
  if (process.argv.includes("--check") && !fs.existsSync(dir)) { console.log(`npcs.js check skipped: NPC data absent at ${dir}`); process.exit(0); }
  if (!fs.existsSync(dir)) {
    console.error(`npcs.js: no NPC data at ${dir}\n  Point NPC_DATA at the extracted npcc_*.json dir`);
    process.exit(1);
  }
  const classes = [];
  for (const f of fs.readdirSync(dir).filter(f => /^npcc_.*\.json$/.test(f)).sort()) {
    const arr = JSON.parse(fs.readFileSync(path.join(dir, f), "utf8"));
    const list = Array.isArray(arr) ? arr : [arr];
    const cls = list[0];
    /* the rest of the file is this class's own features, so filter by base when the pack names one */
    const own = list.slice(1).filter(f => f && (!f.base || f.base === cls.id));
    const c = normaliseClass(cls, own);
    if (c) classes.push(c);
  }
  classes.sort((a, b) => a.name.localeCompare(b.name));
  return classes;
}

module.exports = { normaliseClass, featureText };

if (require.main === module) {
  if (process.argv.includes("--selftest")) selftest();
  else {
    const classes = readClasses(SRC);
    const roles = [...new Set(classes.map(c => c.role))].filter(Boolean).sort();
    const header = `/* Rules data (c) Massif Press, LANCER. Derived from lancer-npc-data.lcp (COMP/CON NPC data).
   ${classes.length} NPC class(es); tiered stats are three-value arrays, tier 1 to 3. */`;
    const out = header + "\nwindow.NPCS = " + JSON.stringify({ classes }, null, 1) + ";\n";
    const cur = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
    if (process.argv.includes("--check")) {
      if (cur !== out) { console.error("npcs.js stale; regen: node tools/build-npcs.cjs"); process.exit(1); }
      console.log("npcs.js check ok");
      process.exit(0);
    }
    fs.writeFileSync(OUT, out);
    console.log(`npcs.js written: ${classes.length} class(es) -> ${OUT}`);
    console.log(`roles: ${roles.join(", ")}`);
  }
}