const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
for (const page of ['index.html', 'intel.html', 'mechbay.html']) {
  assert.match(read(page), /src="assets\/unit-patch.webp" fetchpriority="high"/, `${page}: optimized hero`);
}
assert.ok(fs.statSync(path.join(root, 'assets/unit-patch.webp')).size < 100000);
assert.match(read('sw.js'), /assets\/unit-patch.webp/, 'offline hero');
assert.match(read('intel.html'), /class="holo-key" tabindex="0"/, 'map key keyboard scroll');
assert.match(read('palette.js'), /e.key === "Tab"/, 'palette traps Tab');
console.log('mobile regressions OK');
