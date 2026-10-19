/* Render a page against a stub DOM so checks read the markup visitors get, not archive.js source.
   mount("pilots.html") -> { nodes: {id: stub}, html: id => innerHTML }. Selftest: node tools/render.cjs --selftest */
const fs = require("fs"), vm = require("vm"), path = require("path");
const root = path.join(__dirname, "..");

function stub(id, attrs = "") {
  const dataset = {}, cls = new Set();
  for (const [, k, v] of attrs.matchAll(/data-([\w-]+)="([^"]*)"/g)) dataset[k.replace(/-(\w)/g, (_, c) => c.toUpperCase())] = v;
  const classList = { add: (...c) => c.forEach(x => cls.add(x)), remove: (...c) => c.forEach(x => cls.delete(x)), contains: c => cls.has(c), toggle: (c, on = !cls.has(c)) => (on ? cls.add(c) : cls.delete(c), on) };
  /* listeners records what a page wired; fire lets a check drive it the way a visitor would */
  return {
    id, innerHTML: "", textContent: "", value: "", checked: false, hidden: false, dataset, classList,
    listeners: {},
    addEventListener(type, fn) { (this.listeners[type] ||= []).push(fn); },
    fire(type, ev = {}) { for (const fn of this.listeners[type] || []) fn({ type, target: this, preventDefault() {}, ...ev }); },
    append() {}, focus() {}, querySelector: () => null, querySelectorAll: () => []
  };
}

function mount(page, hash = "", globals = {}) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  const nodes = {};
  for (const [, pre, id, post] of html.matchAll(/<\w+([^>]*?)\bid="([^"]+)"([^>]*)>/g)) nodes[id] ??= stub(id, pre + post);
  const doc = { getElementById: id => nodes[id] || null, querySelector: () => null, querySelectorAll: () => [], addEventListener() {}, body: stub("body"), title: "" };
  /* index.html's inline glue calls addEventListener bare (no window. prefix), so the page's
   document-level listeners need a no-op here for the page to mount at all. */
const box = { document: doc, location: { hash, replace() {} }, matchMedia: () => ({ matches: false }), CSS: { escape: s => s }, console, addEventListener() {}, removeEventListener() {} };
  box.window = box;
  Object.assign(box, globals); /* the page tests hand a fixture build in this way */
  vm.createContext(box);
  /* Scripts in page order: campaign.js, detail.js, archive.js, then any inline glue (dossier pages). */
  for (const [, src, body] of html.matchAll(/<script(?: src="([^"]+)")?>([\s\S]*?)<\/script>/g))
    vm.runInContext(src ? fs.readFileSync(path.join(root, src), "utf8") : body, box, { filename: src || page + " inline" });
  return { nodes, doc, window: box, html: id => (nodes[id] ? nodes[id].innerHTML : "") };
}
module.exports = { mount };

if (process.argv.includes("--selftest")) {
  const assert = require("assert");
  const crew = mount("pilots.html").html("crew-list");
  const cards = crew.split("</article>").filter(c => c.includes("<article"));
  assert.strictEqual(cards.length, 6, "crew-list should render 6 articles");
  cards.forEach((c, i) => assert.ok(c.includes(">TRIGGERS<"), `crew card ${i} missing TRIGGERS row`));
  assert.ok(mount("pilot.html", "#sten").html("dossier").includes("STEN"), "pilot dossier glue should render from location.hash");
  /* the page tests feed a fixture build through a global, so the third argument has to arrive */
  /* a page wires its controls with addEventListener; a test has to be able to fire one */
  const wired = mount("loadout.html").nodes["lo-range"];
  if (!wired) { console.error("FAIL: no frame-pick stub"); process.exit(1); }
  let fired = 0;
  wired.addEventListener("change", () => { fired++; });
  wired.fire("change");
  assert(fired === 1, "mount must let a test fire the handler a page registered");
if (mount("index.html", "", { __PROBE: 7 }).window.__PROBE !== 7) throw new Error("mount must pass globals into the sandbox");
console.log("render selftest ok: 6 crew articles with TRIGGERS");
}
