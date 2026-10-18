/* Art framing contract. Run: node tools/plate-check.cjs */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.join(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const hosts = Object.fromEntries(['crew-list', 'crew-count', 'mech-list', 'mech-count'].map(id => [id, { innerHTML: '', textContent: '' }]));
const sandbox = {
  window: {},
  document: { getElementById: id => hosts[id] || null, querySelectorAll: () => [], addEventListener: () => {} },
  matchMedia: () => ({ matches: true }),
};
vm.createContext(sandbox);
vm.runInContext(read('campaign.js'), sandbox);
vm.runInContext(read('archive.js'), sandbox);
const { CAMPAIGN: C } = sandbox.window;
const { UI } = sandbox.window;
const plate = html => /<div class="plate(?: [^"]*)?">(?:<picture>.*?<\/picture>|<img\b[^>]*>|<span class="mech-silhouette">.*?<\/span>)/s.test(html);
for (const p of C.pilots.filter(p => p.img)) {
  assert.match(hosts['crew-list'].innerHTML, new RegExp(`class="plate"[^]*?src="${p.img}"`), `${p.id} roster plate`);
  assert.ok(plate(UI.pilotDossier(p.id)), `${p.id} dossier art plate`);
}
for (const m of C.mechs) {
  assert.match(hosts['mech-list'].innerHTML, new RegExp(`data-mech="${m.id}"[^]*?class="plate"`), `${m.id} roster plate`);
  assert.ok(plate(UI.mechDossier(m.id)), `${m.id} dossier art plate`);
  if (!m.img) assert.match(hosts['mech-list'].innerHTML, new RegExp(`data-mech="${m.id}"[^]*?class="plate"><span class="mech-silhouette">`), `${m.id} centered glyph plate`);
}
for (const page of ['index.html', 'solstice-rain.html']) {
  assert.match(read(page), /<div class="hero-art"><div class="plate plate-raw"><img\b/, `${page} raw hero plate`);
}
const css = read('style.css');
for (const rule of ['.plate{', '.plate img{', '.plate::before{', '.plate::after{', '.plate-raw', '.plate-raw img{object-fit:contain}', '.hero-art .plate{position:absolute;inset:0}', '.plate-raw .hero-planet{mix-blend-mode:screen}']) assert.ok(css.includes(rule), `${rule} missing`);
assert.match(read('solstice-rain.html'), /class="hero-mech-img hero-planet"/, 'planet blend hook missing');
assert.doesNotMatch(css, /\[data-mech="scooteroo"\].*?img\s*\{|\.mech-thumb img\s*\{[^}]*object-fit:contain/, 'old art exceptions remain');
console.log('plate check PASS');
