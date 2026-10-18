/* Inquisitor cross-component checks for the personnel feature (campaign.js personnel -> archive.js
   showPerson / ledger chips / NOTABLE PERSONNEL / [data-person] click / OPORD VIPs -> check-all.cjs).
   Run: node tools/personnel-adversarial-check.cjs  (prints one PASS/FAIL line per vector, exits 1 on any FAIL) */
const assert = require("node:assert/strict");
const fs = require("node:fs"), os = require("node:os"), path = require("node:path"), vm = require("node:vm");
const { execSync, spawnSync } = require("node:child_process");
const root = path.join(__dirname, "..");
const BASE = "f6ac4c5"; /* commit before the personnel feature */

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
const snapshot = rev => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "inq-")); execSync(`git archive ${rev} | tar -x -C ${d}`, { cwd: root }); return d; };
const worktree = () => { const d = fs.mkdtempSync(path.join(os.tmpdir(), "inq-")); fs.cpSync(root, d, { recursive: true, filter: f => !f.includes(`${path.sep}.git`) }); return d; };
const checkAll = dir => spawnSync(process.execPath, [path.join(dir, "check-all.cjs")], { encoding: "utf8" });

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
  h.UI.show("loc", "elysia");
  h.click({ person: "farris" }, "#record-detail");
  assert.ok(h.panel().includes("CAPTAIN FARRIS") && h.panel().includes("PERSONNEL RECORD"));
  assert.equal(h.calls.appended, 0, "in-panel navigation must not reparent the panel");
  assert.deepEqual(h.calls.scrolled, [], "in-panel navigation must not scroll");
  h.click({ loc: "elysia" }, "#record-detail");
  assert.ok(h.panel().includes("UNIT STATUS") && h.panel().includes('data-person="bannerjee"'), "LAST KNOWN chip should return to the unit");
});

/* ---- Integration ---- */
vector("Integration", "I1 KNOWN OPS link points at the op the person lists, with that op's title", () => {
  const h = load();
  for (const p of h.C.personnel) {
    h.UI.show("person", p.id);
    for (const id of p.ops) { const o = h.C.ops.find(x => x.id === id); assert.ok(h.panel().includes(`index.html#op-${id}`) && h.panel().includes(o.title), `${p.id}: op ${id} link`); }
  }
});
vector("Integration", "I2 check-all rejects a VIP/personnel reference the renderer would silently drop", () => {
  const d = worktree();
  const src = fs.readFileSync(path.join(d, "campaign.js"), "utf8");
  fs.writeFileSync(path.join(d, "campaign.js"), src.replace('vips: [{ id: "farris" }', 'vips: [{ id: "faris" }').replace('lastKnown: "elysia", ops: ["001"], img: "assets/ambassador', 'lastKnown: "nowhere", ops: ["999"], img: "assets/ambassador'));
  const r = checkAll(d);
  assert.notEqual(r.status, 0, "check-all should fail");
  for (const m of ['unknown personnel id "faris"', 'unknown locations id "nowhere"', 'unknown ops id "999"']) assert.ok(r.stdout.includes(m) || r.stderr.includes(m), `missing: ${m}`);
  fs.rmSync(d, { recursive: true });
});

/* ---- Edge cases ---- */
/* Each field is stripped on its own so one guard cannot mask the other's removal. */
for (const [field, re, msg] of [
  ["notes", /,\n\s*notes: "[^"]*" \}/, "personnel farris: missing notes"],
  ["img", / img: "assets\/captain-farris-thumb\.webp",/, "personnel farris: OPORD principal needs an img that exists"]]) {
  vector("Edge", `E1 check-all catches a personnel record whose ${field} the page renders as "undefined"`, () => {
    const d = worktree();
    const src = fs.readFileSync(path.join(d, "campaign.js"), "utf8");
    const out = src.replace(re, field === "notes" ? " }" : "");
    fs.writeFileSync(path.join(d, "campaign.js"), out);
    const r = checkAll(d);
    fs.rmSync(d, { recursive: true });
    assert.notEqual(out, src, `setup: mutation should strip farris ${field}`);
    assert.notEqual(r.status, 0, `check-all passes with farris ${field} missing`);
    assert.ok(r.stdout.includes(msg) || r.stderr.includes(msg), `missing: ${msg}`);
  });
}
vector("Edge", "E2 hostile personnel strings are escaped in chip, panel and OPORD", () => {
  const bad = '<img src=x onerror=alert(1)>"&';
  const h = load({ mutate: C => Object.assign(C.personnel[0], { name: bad, role: bad, notes: bad, status: bad }) });
  h.UI.show("person", "farris");
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
  h2.UI.show("loc", "elysia");
  assert.ok(!h2.nodes["faction-list"].innerHTML.includes("data-person") && h2.panel().includes("None recorded"));
});

/* ---- State & lifecycle ---- */
vector("State", "S1 opening a person clears the previous map selection (like mech/pilot/loc do)", () => {
  const h = load();
  const other = h.C.locations.find(l => l.id !== "elysia").id;
  h.UI.show("loc", other);
  assert.ok(h.sel.has(other), "setup: location should be selected");
  h.click({ person: "farris" });
  assert.ok(h.panel().includes("CAPTAIN FARRIS"));
  assert.ok(!h.sel.has(other), `map still highlights ${other} while the panel shows Captain Farris`);
});
vector("State", "S2 repeated ledger clicks replace (not accumulate) panel content and re-reveal it each time", () => {
  const h = load();
  h.click({ person: "farris" }); const first = h.panel();
  h.click({ person: "bannerjee" }); h.click({ person: "farris" });
  assert.equal(h.panel(), first, "panel content should be identical on revisit");
  assert.equal((h.panel().match(/PERSONNEL RECORD/g) || []).length, 1);
  assert.deepEqual(h.calls.scrolled, ["record-detail", "record-detail", "record-detail"]);
});

/* ---- Regression ---- */
vector("Regression", "R1 OPORD principals markup is byte-identical to the pre-personnel render", () => {
  const d = snapshot(BASE);
  const vipRow = dirRoot => { delete require.cache[require.resolve(path.join(dirRoot, "tools/render.cjs"))];
    const html = require(path.join(dirRoot, "tools/render.cjs")).mount("solstice-rain.html").html("opord");
    return html.slice(html.indexOf("EXTRACTION PRINCIPALS"), html.indexOf('<div class="opord-para"')); };
  const before = vipRow(d), after = vipRow(root);
  fs.rmSync(d, { recursive: true });
  assert.ok(before.includes("vip-row"), "setup: base render should include principals");
  assert.equal(after, before);
});
vector("Regression", "R2 faction ledger text (names, op counts, standing) unchanged apart from chips", () => {
  const d = snapshot(BASE);
  const text = html => html.replace(/<button[^>]*data-person[^>]*>[^<]*<\/button>/g, "").replace(/<[^>]+>/g, "|").replace(/\s+\|/g, "|");
  const before = load({ dir: d }).nodes["faction-list"].innerHTML, after = load().nodes["faction-list"].innerHTML;
  fs.rmSync(d, { recursive: true });
  assert.equal(text(after), text(before));
});
vector("Regression", "R3 pre-existing click paths unchanged (map node scrolls holomap; roster chip outside panel ignored)", () => {
  const h = load();
  h.click({ loc: "elysia" }, ".holo-svg");
  assert.deepEqual(h.calls.scrolled, ["holomap"], "map node should scroll the holomap, not the panel");
  h.UI.show("loc", "elysia"); const before = h.panel();
  h.click({ mech: h.C.mechs[0].id });
  assert.equal(h.panel(), before, "mech chip outside the panel must stay a no-op");
  h.click({ person: "farris" }, "a");
  assert.equal(h.panel(), before, "clicks inside links must be left to the browser");
});

for (const [r, dim, name, why] of results) console.log(`${r}  [${dim}] ${name}${why ? "  -- " + why : ""}`);
const failed = results.filter(r => r[0] === "FAIL").length;
console.log(`${results.length - failed}/${results.length} PASS`);
process.exit(failed ? 1 : 0);
