const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const { mount } = require("./render.cjs");

const C = mount("lance.html");
const cards = C.html("lance-board").match(/<details class="card patrol"/g) || [];
assert.equal(cards.length, 6, "six chassis cards");
assert.match(C.html("lance-board"), /SWEET CHEEKS/);
assert.match(C.html("lance-board"), /MOUNTED WEAPONS/);
assert.match(C.html("lance-board"), /TRIGGER SKILLS/);
assert.match(C.html("lance-board"), /hp-pips/);
assert.match(C.html("lance-board"), /data-hp="sweet-cheeks"/);
assert.match(C.html("lance-board"), /data-k="sweet-cheeks\.hp"/);
assert.match(C.html("lance-board"), /data-k="sweet-cheeks\.limited\.Turret Drones\.1"/);
assert.match(C.html("mission-checks"), /MISSION CHECK/);
assert.match(C.nodes["lance-op"].textContent, /SOLSTICE RAIN/);
assert.match(C.nodes["lance-meta"].textContent, /SESSION STATE - THIS DEVICE/);
assert.match(fs.readFileSync(__dirname + "/../index.html", "utf8"), /href="lance.html"/);
assert.match(fs.readFileSync(__dirname + "/../solstice-rain.html", "utf8"), /href="lance.html"/);

function control(k, value, type = "number", checked = false) {
  const handlers = {};
  return { dataset: { k }, type, value, defaultValue: value, max: "12", checked, defaultChecked: checked,
    addEventListener: (event, fn) => { handlers[event] = fn; }, fire: event => handlers[event]() };
}
function run(storage, hpNow = 12, updated = "5016U D071") {
  const hp = control("sweet-cheeks.hp", String(hpNow)), note = control("sweet-cheeks.note", "", "text"), tick = control("sweet-cheeks.structure.1", "on", "checkbox", true);
  const items = [hp, note, tick];
  const nodes = { "save-state": { textContent: "" }, "lance-export": { textContent: "" },
    reset: { addEventListener(_, fn) { this.click = fn; } }, pip: { textContent: "" } };
  const document = { querySelectorAll: () => items, querySelector: selector => selector.includes("sweet-cheeks") ? nodes.pip : null, getElementById: id => nodes[id] };
  const box = { document, localStorage: storage, confirm: () => true,
    CAMPAIGN: { meta: { updated }, mechs: [{ id: "sweet-cheeks", hp: 12, hpNow }, { id: "alba", hp: 10 }] } };
  vm.runInNewContext(fs.readFileSync(__dirname + "/../lance-state.js", "utf8"), box);
  return { hp, note, tick, nodes };
}
const saved = new Map();
const storage = { setItem: (k, v) => saved.set(k, v), getItem: k => saved.get(k), removeItem: k => saved.delete(k) };
let a = run(storage);
a.hp.value = ""; a.hp.fire("input");
assert.equal(a.hp.value, "", "typing a replacement HP must not restore baseline mid-edit");
a.hp.value = "7"; a.hp.fire("change"); a.note.value = "watch flank"; a.note.fire("input"); a.tick.checked = false; a.tick.fire("change");
assert.match(a.nodes["lance-export"].textContent, /sweet-cheeks -> 7/);
assert.match(a.nodes.pip.textContent, /7\/12 HP/);
assert.match(a.nodes["lance-export"].textContent, /alba -> 10/);
a.hp.value = "99"; a.hp.fire("change");
assert.equal(a.hp.value, "12", "HP cannot exceed campaign maximum");
assert.match(a.nodes["lance-export"].textContent, /sweet-cheeks -> 12/);
a.hp.value = "-2"; a.hp.fire("change");
assert.equal(a.hp.value, "0", "HP cannot go below zero");
a.hp.value = "7"; a.hp.fire("change");
let b = run(storage);
assert.equal(b.hp.value, "7"); assert.equal(b.note.value, "watch flank"); assert.equal(b.tick.checked, false);
b.nodes.reset.click();
assert.equal(b.hp.value, "12"); assert.equal(b.note.value, ""); assert.equal(b.tick.checked, true);
assert.match(b.nodes.pip.textContent, /12\/12 HP/);
assert.equal(saved.has("vw-lance-v1"), false);
let old = run(storage);
old.note.value = "watch flank"; old.note.fire("input");
let fresh = run(storage, 7, "5016U D072");
assert.equal(fresh.hp.value, "7", "new campaign baseline must supersede saved HP");
assert.equal(fresh.note.value, "", "old session notes must not bleed into updated campaign");
assert.match(fresh.nodes["lance-export"].textContent, /sweet-cheeks -> 7/);
assert.match(fresh.nodes["save-state"].textContent, /CAMPAIGN UPDATED/);
fresh.note.value = "new note"; fresh.note.fire("input");
let unbumped = run(storage, 9, "5016U D072");
assert.equal(unbumped.hp.value, "9", "baseline HP change without updated bump must discard stale HP");
assert.equal(unbumped.note.value, "", "changed baseline clears old session state");
assert.match(unbumped.nodes["lance-export"].textContent, /sweet-cheeks -> 9/);
const blocked = run({ setItem() { throw Error("blocked"); }, removeItem() {}, getItem() { return null; } });
assert.match(blocked.nodes["save-state"].textContent, /WILL NOT PERSIST/);
console.log("lance board and local state ok");
