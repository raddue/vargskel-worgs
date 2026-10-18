/* Inquisitor cross-component checks for the personnel feature (campaign.js personnel -> archive.js
   showPerson / ledger chips / NOTABLE PERSONNEL / [data-person] click / OPORD VIPs -> check-all.cjs).
   Run: node tools/personnel-adversarial-check.cjs  (prints one PASS/FAIL line per vector, exits 1 on any FAIL) */
const assert = require("node:assert/strict");
const fs = require("node:fs"), os = require("node:os"), path = require("node:path"), vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const root = path.join(__dirname, "..");

/* Stub DOM harness: captures the delegated click listener, scroll calls and map-node selection. */
function load({ mutate, dir = root } = {}) {
  const calls = { scrolled: [], appended: 0 };
  const node = id => ({ id, innerHTML: "", classList: { add() {}, remove() {}, contains: () => false }, append() { calls.appended++; }, focus() {},
    scrollIntoView() { calls.scrolled.push(id); } });
  const nodes = Object.fromEntries(["record-detail", "faction-list", "holo-detail", "holomap"].map(id => [id, node(id)]));
  const sel = new Set();
  const mapNodes = [], clicks = [];
  const doc = { body: node("body"), getElementById: id => nodes[id] || null, querySelector: () => null,
    querySelectorAll: q => (q === ".holo-svg .node" ? mapNodes : []), addEventListener(t, fn) { if (t === "click") clicks.push(fn); } };
  const box = { document: doc, location: { hash: "", replace() {} }, matchMedia: () => ({ matches: true }), CSS: { escape: s => s }, console };
  box.window = box;
  vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(dir, "campaign.js"), "utf8"), box);
  if (mutate) mutate(box.CAMPAIGN);
  vm.runInContext(fs.readFileSync(path.join(dir, "archive.js"), "utf8"), box);
  for (const l of box.CAMPAIGN.locations) mapNodes.push({ dataset: { loc: l.id }, classList: { toggle: (c, on) => (on ? sel.add(l.id) : sel.delete(l.id)) } });
  /* Fake event: target sits inside `inside` ("#record-detail", ".holo-svg", "a" or none). */
  const click = (attrs, inside = null) => {
    const t = { dataset: attrs, matches: () => false, closest: s => (s === inside ? {} : null) };
    clicks[0]({ target: { closest: s => (s.includes("[data-") ? t : s === inside ? {} : null) } });
  };
  return { C: box.CAMPAIGN, UI: box.UI, nodes, calls, sel, click, panel: () => nodes["record-detail"].innerHTML };
}
const worktree = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "inq-")); fs.cpSync(root, d, { recursive: true, filter: f => !f.includes(`${path.sep}.git`) }); return d; };
const checkAll = dir => spawnSync(process.execPath, [path.join(dir, "check-all.cjs")], { encoding: "utf8" });
const fixture = load().C, [first, second] = fixture.personnel, operation = fixture.ops[0];
const mutateCampaign = (dir, code) => fs.appendFileSync(path.join(dir, "campaign.js"), `\n${code}\n`);

const results = [];
const vector = (dim, name, fn) => { try { fn(); results.push(["PASS", dim, name]); } catch (e) { results.push(["FAIL", dim, name, e.message.split("\n")[0]]); } };

/* ---- Wiring ---- */
vector("Wiring", "W1 every rendered data-person chip resolves to a PERSONNEL RECORD", () => {
  const h = load();
  const sources = [h.nodes["faction-list"].innerHTML];
  for (const l of h.C.locations) { h.UI.show("loc", l.id); sources.push(h.panel()); }
  const ids = new Set(sources.join("").match(/data-person="[^"]+"/g).map(s => s.slice(13, -1)));
  assert.deepEqual([...ids].sort(), [...h.C.personnel.map(p => p.id)].sort(), "every personnel record should be reachable from a chip");
  for (const id of ids) { h.UI.show("person", id); assert.ok(h.panel().includes("PERSONNEL RECORD"), `${id}: chip does not open a record`); }
});
vector("Wiring", "W2 chip inside detail panel navigates in place (person <-> location), no map reparent/scroll", () => {
  const h = load();
  h.UI.show("loc", first.lastKnown);
  h.click({ person: first.id }, "#record-detail");
  assert.ok(h.panel().includes(first.name) && h.panel().includes("PERSONNEL RECORD"));
  assert.equal(h.calls.appended, 0, "in-panel navigation must not reparent the panel");
  assert.deepEqual(h.calls.scrolled, [], "in-panel navigation must not scroll");
  h.click({ loc: first.lastKnown }, "#record-detail");
  assert.ok(h.panel().includes("UNIT STATUS") && h.panel().includes(`data-person="${second.id}"`), "LAST KNOWN chip should return to the unit");
});

/* ---- Integration ---- */
vector("Integration", "I1 KNOWN OPS link points at the op the person lists, with that op's title", () => {
  const h = load();
  for (const p of h.C.personnel) {
    h.UI.show("person", p.id);
    for (const id of p.ops) { const o = h.C.ops.find(x => x.id === id); assert.ok(h.panel().includes(`index.html#op-${id}`) && h.panel().includes(o.title), `${p.id}: op ${id} link`); }
  }
});
vector("Integration", "I2c check-all diagnoses missing personnel.ops and duplicate VIP ids", () => {
  const d = worktree();
  mutateCampaign(d, `delete window.CAMPAIGN.personnel[0].ops;`);
  const missing = checkAll(d);
  assert.notEqual(missing.status, 0);
  assert.ok((missing.stdout + missing.stderr).includes(`personnel ${first.id}.ops must be an array`));
  assert.ok(!(missing.stdout + missing.stderr).includes("TypeError"), "missing ops must not throw");
  fs.copyFileSync(path.join(root, "campaign.js"), path.join(d, "campaign.js"));
  mutateCampaign(d, `window.CAMPAIGN.ops[0].opord.vips.push({...window.CAMPAIGN.ops[0].opord.vips[0]});`);
  const duplicate = checkAll(d);
  fs.rmSync(d, { recursive: true });
  assert.notEqual(duplicate.status, 0);
  assert.ok((duplicate.stdout + duplicate.stderr).includes(`op ${operation.id}.opord.vips: duplicate personnel id "${first.id}"`));
});
vector("Integration", "I2b check-all rejects a VIP omitted from personnel.ops", () => {
  const d = worktree();
  mutateCampaign(d, `window.CAMPAIGN.personnel[0].ops=[];`);
  const r = checkAll(d);
  fs.rmSync(d, { recursive: true });
  assert.notEqual(r.status, 0, `check-all should fail when ${first.id} omits VIP op ${operation.id}`);
  assert.ok((r.stdout + r.stderr).includes(`personnel ${first.id}: OPORD principal of op ${operation.id} missing from personnel.ops`));
});
vector("Integration", "I2 check-all rejects a VIP/personnel reference the renderer would silently drop", () => {
  const d = worktree();
  mutateCampaign(d, `window.CAMPAIGN.ops[0].opord.vips[0].id="unknown-person"; window.CAMPAIGN.personnel[1].lastKnown="nowhere"; window.CAMPAIGN.personnel[1].ops=["999"];`);
  const r = checkAll(d);
  assert.notEqual(r.status, 0, "check-all should fail");
  for (const m of ['unknown personnel id "unknown-person"', 'unknown locations id "nowhere"', 'unknown ops id "999"']) assert.ok(r.stdout.includes(m) || r.stderr.includes(m), `missing: ${m}`);
  fs.rmSync(d, { recursive: true });
});

/* ---- Edge cases ---- */
/* Each field is stripped on its own so one guard cannot mask the other's removal. */
for (const field of ["notes", "img"]) {
  vector("Edge", `E1 check-all catches a personnel record whose ${field} the page renders as "undefined"`, () => {
    const d = worktree();
    mutateCampaign(d, `delete window.CAMPAIGN.personnel[0].${field};`);
    const r = checkAll(d);
    fs.rmSync(d, { recursive: true });
    assert.notEqual(r.status, 0, `check-all passes with ${first.id} ${field} missing`);
    assert.ok((r.stdout + r.stderr).includes(`personnel ${first.id}: missing ${field}`), `missing: ${first.id} ${field}`);
  });
}
vector("Edge", "E2 hostile personnel strings are escaped in chip, panel and OPORD", () => {
  const bad = '<img src=x onerror=alert(1)>"&';
  const h = load({ mutate: C => Object.assign(C.personnel[0], { name: bad, role: bad, notes: bad, status: bad }) });
  h.UI.show("person", first.id);
  const out = h.nodes["faction-list"].innerHTML + h.panel();
  assert.ok(!out.includes("<img src=x"), "raw markup leaked");
  assert.ok(out.includes("&lt;img src=x onerror=alert(1)&gt;&quot;&amp;"));
});
vector("Edge", "E3 location/faction with no personnel render cleanly (no undefined, no empty chips)", () => {
  const h = load();
  const empty = h.C.locations.find(l => !h.C.personnel.some(p => p.lastKnown === l.id));
  h.UI.show("loc", empty.id);
  assert.ok(/NOTABLE PERSONNEL<\/th><td[^>]*>None recorded</.test(h.panel()), "empty location should read None recorded");
  assert.ok(!h.panel().includes("undefined") && !h.nodes["faction-list"].innerHTML.includes("undefined"));
  const h2 = load({ mutate: C => { C.personnel.length = 0; } });
  h2.UI.show("loc", first.lastKnown);
  assert.ok(!h2.nodes["faction-list"].innerHTML.includes("data-person") && h2.panel().includes("None recorded"));
});

/* ---- State & lifecycle ---- */
vector("State", "S1 opening a person clears the previous map selection (like mech/pilot/loc do)", () => {
  const h = load();
  const other = h.C.locations.find(l => l.id !== first.lastKnown).id;
  h.UI.show("loc", other);
  assert.ok(h.sel.has(other), "setup: location should be selected");
  h.click({ person: first.id });
  assert.ok(h.panel().includes(first.name));
  assert.ok(!h.sel.has(other), `map still highlights ${other} while the panel shows ${first.name}`);
});
vector("State", "S2 repeated ledger clicks replace (not accumulate) panel content and re-reveal it each time", () => {
  const h = load();
  h.click({ person: first.id }); const initial = h.panel();
  h.click({ person: second.id }); h.click({ person: first.id });
  assert.equal(h.panel(), initial, "panel content should be identical on revisit");
  assert.equal((h.panel().match(/PERSONNEL RECORD/g) || []).length, 1);
  assert.deepEqual(h.calls.scrolled, ["record-detail", "record-detail", "record-detail"]);
});

/* ---- Regression ---- */
vector("Regression", "R1 OPORD principals render issued fields, not live personnel", () => {
  const h = load({ mutate: C => C.personnel.forEach(p => Object.assign(p, { name: "changed", role: "changed", img: "changed", notes: "changed" })) });
  const host = { dataset: { op: h.C.ops[0].id }, innerHTML: "" };
  const box = { CAMPAIGN: h.C, document: { getElementById: id => id === "opord" ? host : null, querySelectorAll: () => [], addEventListener() {} }, matchMedia: () => ({ matches: true }), console };
  box.window = box; vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(root, "archive.js"), "utf8"), box);
  for (const v of h.C.ops[0].opord.vips) for (const field of ["name", "role", "img", "blurb"])
    assert.ok(host.innerHTML.includes(box.UI.esc(v[field])), `${v.id}: issued ${field} missing`);
  assert.ok(!host.innerHTML.includes("changed"), "OPORD reads mutable personnel");
});
vector("Regression", "R2 faction ledger keeps each faction and its personnel chips", () => {
  const h = load(); const html = h.nodes["faction-list"].innerHTML;
  for (const f of h.C.factions) {
    assert.ok(html.includes(h.UI.esc(f.name)) && html.includes(h.UI.esc(f.standing)), `${f.id}: faction text missing`);
    for (const p of h.C.personnel.filter(p => p.faction === f.id)) assert.ok(html.includes(`data-person="${p.id}"`), `${p.id}: faction chip missing`);
  }
});
vector("Regression", "R2b synthetic third person renders in faction, location, panel and issued OPORD", () => {
  const h = load({ mutate: C => {
    const p = { ...C.personnel[0], id: "synthetic-contact", name: "SYNTHETIC CONTACT" };
    C.personnel.push(p);
    C.ops[0].opord.vips.push({ id: p.id, name: p.name, role: p.role, img: p.img, blurb: "Test-only brief" });
  } });
  assert.ok(h.nodes["faction-list"].innerHTML.includes('data-person="synthetic-contact"'));
  h.UI.show("loc", h.C.personnel.at(-1).lastKnown);
  assert.ok(h.panel().includes('data-person="synthetic-contact"'));
  h.UI.show("person", "synthetic-contact");
  assert.ok(h.panel().includes("SYNTHETIC CONTACT"));
  const host = { dataset: { op: h.C.ops[0].id }, innerHTML: "" };
  const box = { CAMPAIGN: h.C, document: { getElementById: id => id === "opord" ? host : null, querySelectorAll: () => [], addEventListener() {} }, matchMedia: () => ({ matches: true }), console };
  box.window = box; vm.createContext(box);
  vm.runInContext(fs.readFileSync(path.join(root, "archive.js"), "utf8"), box);
  assert.ok(host.innerHTML.includes("SYNTHETIC CONTACT") && host.innerHTML.includes("Test-only brief"));
});
vector("Regression", "R3 pre-existing click paths unchanged (map node scrolls holomap; roster chip outside panel ignored)", () => {
  const h = load();
  h.click({ loc: first.lastKnown }, ".holo-svg");
  assert.deepEqual(h.calls.scrolled, ["holomap"], "map node should scroll the holomap, not the panel");
  h.UI.show("loc", first.lastKnown); const before = h.panel();
  h.click({ mech: h.C.mechs[0].id });
  assert.equal(h.panel(), before, "mech chip outside the panel must stay a no-op");
  h.click({ person: first.id }, "a");
  assert.equal(h.panel(), before, "clicks inside links must be left to the browser");
});

for (const [r, dim, name, why] of results) console.log(`${r}  [${dim}] ${name}${why ? "  -- " + why : ""}`);
const failed = results.filter(r => r[0] === "FAIL").length;
console.log(`${results.length - failed}/${results.length} PASS`);
process.exit(failed ? 1 : 0);
