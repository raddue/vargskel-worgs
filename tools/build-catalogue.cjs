#!/usr/bin/env node
/* Generate catalogue.js (window.CATALOGUE): the mechanical rules subset the loadout bay reads.
   Source of rules data: @massif/lancer-data 3.1.7 (GPL-3.0-or-later, (c) Massif Press).
   Subset rule follows detail.js: GMS items (granted at LL0) plus every item campaign.js fields.
   Mechanical fields only, so the bay can gate and range without lancer-data at run time.
   Run: node tools/build-catalogue.cjs [lancer-data lib dir] */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const LIB = process.env.LANCER_DATA || (!process.argv[2]?.startsWith("--") ? process.argv[2] : "") || "/tmp/ld/lancer-data-3.1.7/lib";
if (process.argv.includes("--check") && !fs.existsSync(LIB)) { console.log(`catalogue.js check skipped: lancer-data absent at ${LIB}`); process.exit(0); }
const load = f => JSON.parse(fs.readFileSync(path.join(LIB, f), "utf8"));
const W = load("weapons.json"), S = load("systems.json"), F = load("frames.json"), R = load("rules.json");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, "campaign.js"), "utf8"), sandbox, { filename: "campaign.js" });
const C = sandbox.window.CAMPAIGN;

const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
/* Two weapons share a name across sources (Missile Rack); the first GMS copy is the usable one. */
const index = (arr, keyOf) => {
  const m = new Map();
  for (const x of arr) { const k = norm(keyOf(x)); if (!m.has(k) || x.source === "GMS") m.set(k, x); }
  return m;
};
const iW = index(W, w => w.name), iS = index(S, s => s.name), iF = index(F, f => `${f.source} ${f.name}`);
const list = s => String(s || "").split(",").map(x => x.trim()).filter(Boolean);
const loadoutItems = s => {
  const out = [];
  for (const seg of String(s || "").split("\u00b7").map(x => x.trim()).filter(Boolean)) {
    const m = seg.match(/^[A-Za-z/ ]+:\s*(.+)$/);
    for (const it of (m ? m[1] : seg).split("/").map(x => x.trim()).filter(Boolean)) out.push(it);
  }
  return out;
};
/* A weapon reaches a distance through its range entries and through its own valued tags: Tactical
   Knife carries `Threat 1` as a range and `Thrown 3` as a tag, and both are bands. */
const bands = x => [
  ...(x.range || []).map(r => ({ kind: r.type, value: r.val })),
  ...(x.tags || []).filter(t => t.id === "tg_thrown").map(t => ({ kind: "Thrown", value: t.val })),
];
const tags = x => (x.tags || []).map(t => ({ id: t.id, val: t.val == null ? null : t.val }));
const damage = x => (x.damage || []).map(d => ({ val: d.val, type: d.type }));
const weapon = w => ({ mount: w.mount, sp: w.sp ?? 0, license: w.license || w.source || "", license_level: w.license_level ?? null,
  damage: damage(w), bands: bands(w), tags: tags(w),
  profiles: (w.profiles || []).map(p => ({ name: p.name, damage: damage(p), bands: bands(p), tags: tags(p) })) });
const system = s => ({ sp: s.sp ?? 0, license: s.license || s.source || "", license_level: s.license_level ?? null,
  tg_unique: (s.tags || []).some(t => t.id === "tg_unique"), tg_ai: (s.tags || []).some(t => t.id === "tg_ai") });
const frame = f => ({ mounts: f.mounts || [], sys: (f.stats && f.stats.sp) ?? null, license: f.source || "",
  license_level: f.license_level ?? null, mechtype: (f.mechtype || []).join("/") });

/* mount_fittings is the authoritative table: which weapon sizes a mount of a given size takes. */
const CATALOGUE = { weapons: {}, systems: {}, frames: {}, fittings: R.mount_fittings };
const wanted = new Set(), wantedFrames = new Set();
for (const m of C.mechs) {
  for (const n of loadoutItems(m.loadout)) wanted.add(norm(n));
  for (const n of list(m.systems)) wanted.add(norm(n));
  wantedFrames.add(norm(m.frame));
}
const frameless = [];
for (const w of W) if (w.source === "GMS" || wanted.has(norm(w.name))) CATALOGUE.weapons[w.name] ||= weapon(w);
for (const s of S) if (s.source === "GMS" || wanted.has(norm(s.name))) CATALOGUE.systems[s.name] ||= system(s);
for (const f of F) if (f.source === "GMS" || wantedFrames.has(norm(`${f.source} ${f.name}`))) CATALOGUE.frames[`${f.source} ${f.name}`] ||= frame(f);
for (const k of wantedFrames) if (!iF.has(k)) frameless.push(k);
for (const k of wanted) if (!iW.has(k) && !iS.has(k)) console.log("note: campaign item absent from lancer-data:", k);

const header = `/* Rules data (c) Massif Press, LANCER. Derived from @massif/lancer-data 3.1.7,
   GPL-3.0-or-later (github.com/massif-press/lancer-data). Mechanical fields only; campaign content
   itself is not lancer-data derived. */`;
const out = header + "\nwindow.CATALOGUE = " + JSON.stringify(CATALOGUE, null, 1) + ";\n";
if (process.argv.includes("--check")) {
  const cur = fs.readFileSync(path.join(ROOT, "catalogue.js"), "utf8");
  if (cur !== out) { console.error("catalogue.js stale; regen: node tools/build-catalogue.cjs"); process.exit(1); }
  console.log("catalogue.js up to date");
} else {
  fs.writeFileSync(path.join(ROOT, "catalogue.js"), out);
}
const n = k => Object.keys(CATALOGUE[k]).length;
console.log(`catalogue.js: weapons ${n("weapons")}, systems ${n("systems")}, frames ${n("frames")}, ${(out.length / 1024).toFixed(0)} KB`);
console.log("frames without lancer-data detail (licence/cap unknown):", frameless.join(", ") || "none");
