const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { mount } = require("./render.cjs");

const nodes = Object.fromEntries(["record-detail", "faction-list"].map(id => [id, { innerHTML: "" }]));
nodes["holo-detail"] = { append() {} };
nodes["record-detail"].classList = { add() {}, remove() {} };
const clicks = []; let scrolled = false;
nodes["record-detail"].scrollIntoView = () => { scrolled = true; };
const box = { document: { getElementById: id => nodes[id] || null, querySelectorAll: () => [], addEventListener(type, fn) { if (type === "click") clicks.push(fn); } }, matchMedia: () => ({ matches: true }), console };
box.window = box;
vm.createContext(box);
for (const file of ["campaign.js", "archive.js"]) vm.runInContext(fs.readFileSync(__dirname + "/../" + file, "utf8"), box, { filename: file });
const { CAMPAIGN: C, UI } = box;
assert.ok(C.personnel.length >= 2, "expected named personnel records");
for (const p of C.personnel) {
  const id = p.id;
  assert.ok(p.name && p.role && p.faction && p.status && p.lastKnown && Array.isArray(p.ops) && p.img && p.notes, `${id}: incomplete record`);
  assert.ok(C.factions.some(f => f.id === p.faction) && C.locations.some(l => l.id === p.lastKnown), `${id}: unresolved reference`);
  assert.ok(fs.existsSync(__dirname + "/../" + p.img), `${id}: missing portrait`);
  UI.show("person", id);
  const panel = nodes["record-detail"].innerHTML;
  for (const label of ["ROLE", "FACTION", "STATUS", "LAST KNOWN", "KNOWN OPS", "NOTES"])
    assert.ok(panel.includes(`>${label}</th>`), `${id}: missing ${label}`);
  assert.ok(panel.includes(p.notes) && panel.includes(`data-loc="${p.lastKnown}"`), `${id}: missing linked details`);
  for (const opId of p.ops) assert.ok(panel.includes(`index.html#op-${opId}`), `${id}: missing op ${opId}`);
  assert.ok(nodes["faction-list"].innerHTML.includes(`data-person="${id}"`), `${id}: missing faction chip`);
  assert.ok(panel.includes(p.name), `${id}: missing name`);
}
const first = C.personnel[0];
UI.show("loc", first.lastKnown);
assert.ok(nodes["record-detail"].innerHTML.includes("NOTABLE PERSONNEL") && nodes["record-detail"].innerHTML.includes(`data-person="${first.id}"`), "location lacks personnel");
const personChip = { dataset: { person: first.id }, closest: () => null, matches: () => false };
clicks[0]({ target: { closest: selector => selector.includes("[data-person]") ? personChip : null } });
assert.ok(scrolled, "faction-ledger personnel chip must reveal off-screen detail panel");
const opPage = mount("solstice-rain.html");
const op = opPage.html("opord");
for (const ref of C.ops[0].opord.vips) {
  assert.ok(ref.name && ref.role && ref.img && ref.blurb, `${ref.id}: incomplete issued brief`);
  for (const field of ["name", "role", "img", "blurb"]) assert.ok(op.includes(ref[field]), `${ref.id}: OPORD missing ${field}`);
}
const orderHost = { dataset: { op: C.ops[0].id }, innerHTML: "" };
const revised = { document: { getElementById: id => id === "opord" ? orderHost : null, querySelectorAll: () => [], addEventListener() {} }, matchMedia: () => ({ matches: true }), console };
revised.window = revised;
vm.createContext(revised);
vm.runInContext(fs.readFileSync(__dirname + "/../campaign.js", "utf8"), revised);
Object.assign(revised.CAMPAIGN.personnel[0], { name: "Changed name", role: "Changed role", img: "changed.webp", notes: "Changed notes" });
vm.runInContext(fs.readFileSync(__dirname + "/../archive.js", "utf8"), revised);
assert.equal(orderHost.innerHTML, op, "issued OPORD must not follow live personnel fields");
const extraHost = { dataset: { op: C.ops[0].id }, innerHTML: "" };
const third = { document: { getElementById: id => id === "opord" ? extraHost : null, querySelectorAll: () => [], addEventListener() {} }, matchMedia: () => ({ matches: true }), console };
third.window = third;
vm.createContext(third);
vm.runInContext(fs.readFileSync(__dirname + "/../campaign.js", "utf8"), third);
const extra = { ...third.CAMPAIGN.personnel[0], id: "synthetic-contact", name: "SYNTHETIC CONTACT", ops: [C.ops[0].id] };
third.CAMPAIGN.personnel.push(extra);
third.CAMPAIGN.ops[0].opord.vips.push({ id: extra.id, name: extra.name, role: extra.role, img: extra.img, blurb: "Test-only brief" });
vm.runInContext(fs.readFileSync(__dirname + "/../archive.js", "utf8"), third);
assert.ok(extraHost.innerHTML.includes(extra.name) && extraHost.innerHTML.includes("Test-only brief"), "third person VIP missing");
console.log("personnel render ok");
