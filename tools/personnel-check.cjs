const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { mount } = require("./render.cjs");

const nodes = Object.fromEntries(["record-detail", "faction-list"].map(id => [id, { innerHTML: "" }]));
const box = { document: { getElementById: id => nodes[id] || null, querySelectorAll: () => [], addEventListener() {} }, matchMedia: () => ({ matches: true }), console };
box.window = box;
vm.createContext(box);
for (const file of ["campaign.js", "archive.js"]) vm.runInContext(fs.readFileSync(__dirname + "/../" + file, "utf8"), box, { filename: file });
const { CAMPAIGN: C, UI } = box;
const byId = Object.fromEntries((C.personnel || []).map(p => [p.id, p]));
assert.deepEqual(Object.keys(byId).sort(), ["bannerjee", "farris"]);
for (const id of ["farris", "bannerjee"]) {
  const p = byId[id];
  assert.ok(p.name && p.role && p.faction && p.status && p.lastKnown && p.ops.includes("001") && p.img && p.notes, `${id}: incomplete record`);
  assert.ok(C.factions.some(f => f.id === p.faction) && C.locations.some(l => l.id === p.lastKnown), `${id}: unresolved reference`);
  assert.ok(fs.existsSync(__dirname + "/../" + p.img), `${id}: missing portrait`);
  UI.show("person", id);
  const panel = nodes["record-detail"].innerHTML;
  for (const label of ["ROLE", "FACTION", "STATUS", "LAST KNOWN", "KNOWN OPS", "NOTES"])
    assert.ok(panel.includes(`>${label}</th>`), `${id}: missing ${label}`);
  assert.ok(panel.includes(p.notes) && panel.includes(`data-loc="${p.lastKnown}"`) && panel.includes("index.html#op-001"), `${id}: missing linked details`);
  assert.ok(nodes["faction-list"].innerHTML.includes(`data-person="${id}"`), `${id}: missing faction chip`);
  assert.ok(panel.includes(p.name), `${id}: missing name`);
}
UI.show("loc", "elysia");
assert.ok(nodes["record-detail"].innerHTML.includes("NOTABLE PERSONNEL") && nodes["record-detail"].innerHTML.includes('data-person="farris"'), "location lacks personnel");
const op = mount("solstice-rain.html").html("opord");
for (const id of ["farris", "bannerjee"]) {
  assert.ok(C.ops[0].opord.vips.some(v => v.id === id && Object.keys(v).length === 1), `${id}: VIP must reference personnel id`);
  assert.ok(op.includes(byId[id].name) && op.includes(byId[id].notes) && op.includes(byId[id].img), `${id}: OPORD principal missing`);
}
console.log("personnel render ok");
