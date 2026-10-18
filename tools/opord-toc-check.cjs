#!/usr/bin/env node
/* OPORD contents jump-nav: renders archive.js opordDoc() against a stub DOM and asserts
   one TOC chip per paragraph + annex, each href resolving to an id in the rendered order.
   Run: node tools/opord-toc-check.cjs */
const fs = require("fs"), path = require("path"), vm = require("vm"), assert = require("assert");
const ROOT = path.join(__dirname, "..");
const sb = { window: {} };
vm.createContext(sb);
vm.runInContext(fs.readFileSync(path.join(ROOT, "campaign.js"), "utf8"), sb);
const ui = fs.readFileSync(path.join(ROOT, "archive.js"), "utf8");
let n = 0;
for (const o of sb.window.CAMPAIGN.ops.filter(o => o.opord)) {
  const host = { dataset: { op: String(o.id) }, innerHTML: "" };
  sb.document = { getElementById: id => (id === "opord" ? host : null), querySelectorAll: () => [], addEventListener: () => {} };
  sb.matchMedia = () => ({ matches: true });
  vm.runInContext(ui, sb);
  const html = host.innerHTML;
  const toc = (html.match(/<div class="card opord-toc"><div class="card-pad"><div class="tag">CONTENTS<\/div><nav aria-label="Operation order contents">([\s\S]*?)<\/nav>/) || [])[1];
  assert(toc, `op ${o.id}: CONTENTS nav missing`);
  assert(html.indexOf("opord-toc") < html.indexOf('class="opord-para"'), `op ${o.id}: TOC must precede paragraphs`);
  const hrefs = [...toc.matchAll(/<a class="chip" href="#([^"]+)">/g)].map(m => m[1]);
  const want = o.opord.paras.length + 1 + o.opord.annexes.length;
  assert.strictEqual(hrefs.length, want, `op ${o.id}: expected ${want} chips, got ${hrefs.length}`);
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
  hrefs.forEach(h => assert(ids.has(h), `op ${o.id}: #${h} resolves to nothing`));
  assert(toc.includes("1. SITUATION") && toc.includes("A \u00b7 TASK ORG"), `op ${o.id}: chip labels wrong`);
  n++;
}
assert(n > 0, "no ops with opord");
const css = fs.readFileSync(path.join(ROOT, "style.css"), "utf8");
assert(/\.opord-toc\{position:sticky;top:8px;z-index:2\}/.test(css), "style.css: sticky .opord-toc rule missing");
assert(/@media\(max-width:620px\)\{\.opord-toc\{position:static\}\}/.test(css), "style.css: mobile static rule missing");
console.log(`opord-toc: OK (${n} op)`);
