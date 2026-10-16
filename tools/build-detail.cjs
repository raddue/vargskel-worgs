#!/usr/bin/env node
/* Generate detail.js (window.DETAIL) for the public dossiers.
   Source of rules text: @massif/lancer-data 3.1.7 (GPL-3.0-or-later, (c) Massif Press).
   Only items referenced by campaign.js are emitted. Run: node tools/build-detail.cjs [lancer-data lib dir] */
const fs = require("fs"), path = require("path"), vm = require("vm");
const ROOT = path.join(__dirname, "..");
const LIB = process.env.LANCER_DATA || process.argv[2] || "/tmp/ld/lancer-data-3.1.7/lib";
const load = f => JSON.parse(fs.readFileSync(path.join(LIB, f), "utf8"));
const W = load("weapons.json"), S = load("systems.json"), T = load("talents.json"),
  G = load("pilot_gear.json"), F = load("frames.json"), SK = load("skills.json"), TG = load("tags.json");
const tagName = id => (TG.find(t => t.id === id) || {}).name || id.replace(/^tg_/, "");

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(ROOT, "campaign.js"), "utf8"), sandbox, { filename: "campaign.js" });
const C = sandbox.window.CAMPAIGN;

const norm = s => String(s).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
function index(arr, extra) {
  const m = new Map();
  for (const x of arr) {
    m.set(norm(x.name), x);
    if (extra) for (const k of extra(x)) if (k && !m.has(norm(k))) m.set(norm(k), x);
  }
  return m;
}
const iW = index(W), iS = index(S), iT = index(T), iG = index(G), iSK = index(SK);
const iF = index(F, f => [`${f.source} ${f.name}`]);

const fmtList = (a, f) => (a || []).map(f).filter(Boolean).join(", ");
const dmg = w => fmtList(w.damage, d => `${d.val} ${d.type}`);
const rng = w => fmtList(w.range, r => `${r.type} ${r.val}`);
const tags = x => fmtList(x.tags, t => tagName(t.id) + (t.val ? ` ${t.val}` : ""));
const lic = x => `${x.license || x.source || ""}${x.license_level != null ? " LL" + x.license_level : ""}`.trim();
const weaponEffect = w => [w.effect, w.on_attack && `On attack: ${w.on_attack}`, w.on_hit && `On hit: ${w.on_hit}`,
  w.on_crit && `On crit: ${w.on_crit}`].filter(Boolean).join(" ");
const bonuses = g => fmtList(g.bonuses, b => `${b.val > 0 && !b.replace ? "+" : ""}${b.val} ${b.id.replace(/^pilot_/, "").toUpperCase()}${b.replace ? " (sets)" : ""}`);

const DETAIL = { weapons: {}, systems: {}, talents: {}, gear: {}, frames: {}, skills: {} };
const missing = [], frameless = [], talentless = [];
const list = s => String(s || "").split(",").map(x => x.trim()).filter(Boolean);
const loadoutItems = s => {
  const out = [];
  for (const seg of String(s || "").split("·").map(x => x.trim()).filter(Boolean)) {
    const m = seg.match(/^[A-Za-z/ ]+:\s*(.+)$/);
    for (const it of (m ? m[1] : seg).split("/").map(x => x.trim()).filter(Boolean)) out.push(it);
  }
  return out;
};

for (const m of C.mechs) {
  for (const name of loadoutItems(m.loadout)) {
    const w = iW.get(norm(name));
    if (!w) { missing.push(`weapon: ${name}`); continue; }
    DETAIL.weapons[name] = { mount: w.mount, type: w.type, damage: dmg(w), range: rng(w),
      tags: tags(w), license: lic(w), effect: weaponEffect(w) };
  }
  for (const name of list(m.systems)) {
    const s = iS.get(norm(name));
    if (!s) { missing.push(`system: ${name}`); continue; }
    DETAIL.systems[name] = { sp: s.sp, tags: tags(s), license: lic(s), effect: s.effect || "" };
  }
  const f = iF.get(norm(m.frame));
  if (!f) frameless.push(m.frame);
  else DETAIL.frames[m.frame] = { source: f.source, mechtype: (f.mechtype || []).join("/"),
    mounts: (f.mounts || []).join(" / "), traits: (f.traits || []).map(t => ({ name: t.name, description: t.description })),
    core: f.core_system ? { name: f.core_system.name, description: f.core_system.description } : null };
}
for (const p of C.pilots) {
  for (const t of list(p.talents)) {
    const held = parseInt((t.match(/(\d+)$/) || [])[1] || "1", 10);
    const e = iT.get(norm(t.replace(/\s*\d+$/, "")));
    if (!e) { talentless.push(t.replace(/\s*\d+$/, "")); continue; }
    DETAIL.talents[t.replace(/\s*\d+$/, "")] = { terse: e.terse || "",
      ranks: (e.ranks || []).slice(0, held).map((r, i) => ({ rank: i + 1, name: r.name, description: r.description })) };
  }
  for (const g of list(p.gear)) {
    const e = iG.get(norm(g));
    if (!e) { missing.push(`gear: ${g}`); continue; }
    DETAIL.gear[g] = { type: e.type, bonuses: bonuses(e), tags: tags(e), effect: e.description || "" };
  }
  for (const s of list(p.triggers)) {
    const name = s.replace(/\s*\(\+\d+\)$/, "").trim();
    const e = iSK.get(norm(name));
    if (!e) { missing.push(`skill: ${name}`); continue; }
    DETAIL.skills[name] = { description: e.description || "" };
  }
}
// talent-granted, not a purchasable system: keep out of the sheet instead of failing
const ALIAS_SKIP = ["Spaceborn EVA"];
const realMissing = missing.filter(m => !ALIAS_SKIP.some(a => m.endsWith(a)));

const header = `/* Rules data (c) Massif Press, LANCER. Derived from @massif/lancer-data 3.1.7,
   GPL-3.0-or-later (github.com/massif-press/lancer-data). Subset: only items fielded by
   this campaign; reformatted for display. Campaign content itself is not lancer-data derived. */`;
fs.writeFileSync(path.join(ROOT, "detail.js"),
  header + "\nwindow.DETAIL = " + JSON.stringify(DETAIL, null, 1) + ";\n");
const n = k => Object.keys(DETAIL[k]).length;
console.log(`detail.js: weapons ${n("weapons")}, systems ${n("systems")}, talents ${n("talents")}, gear ${n("gear")}, frames ${n("frames")}, skills ${n("skills")}`);
console.log("frames without lancer-data detail (render falls back):", frameless.join(", ") || "none");
console.log("talents without lancer-data detail (render falls back):", talentless.join(", ") || "none");
if (realMissing.length) { console.log("UNRESOLVED:\n" + realMissing.join("\n")); process.exit(1); }
console.log("self-check ok");
