const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
const print = css.slice(css.lastIndexOf('@media print'));
assert.ok(print.startsWith('@media print'), 'print stylesheet missing');
for (const variable of ['bg', 'panel', 'panel2', 'text', 'text-soft', 'muted', 'line', 'cyan', 'lime', 'rust', 'rust-light', 'report-text',
  'hero-start', 'hero-glow', 'hero-mid', 'silhouette', 'avatar-bg', 'thumb-bg', 'thumb-muted', 'photo-start', 'photo-muted', 'chip-hover', 'holo-bg', 'holo-button-bg', 'rust-wash']) {
  assert.match(print, new RegExp(`--${variable}:`), `print theme lacks --${variable}`);
}
for (const selector of ['.topline', '.nav', '.status', '.hero-art', '.chip', '.holo-chips', '.lightbox', '.footer span:last-child', '#holomap',
  '.sweep', '.route-pulse', '.card', 'article', '.vip', '.opord-para', '.shell', 'a[href^="http"]::after']) {
  assert.ok(print.includes(selector), `print selector missing: ${selector}`);
}
assert.match(print, /@page\s*\{\s*margin:\s*16mm/);
assert.match(print, /break-inside:\s*avoid/);
assert.match(print, /animation:\s*none\s*!important/);

const js = fs.readFileSync(path.join(root, 'archive.js'), 'utf8');
const opener = js.match(/(?:if \(typeof addEventListener === ["']function["']\) )?addEventListener\(["']beforeprint["'],\s*\(\)\s*=>\s*document\.querySelectorAll\(["']details["']\)\.forEach\(d\s*=>\s*d\.open\s*=\s*true\)\);?/);
assert.ok(opener, 'beforeprint details opener missing');
const details = [{ open: false }, { open: false }];
let beforeprint;
vm.runInNewContext(opener[0], { addEventListener: (event, handler) => { assert.equal(event, 'beforeprint'); beforeprint = handler; }, document: { querySelectorAll: selector => { assert.equal(selector, 'details'); return details; } } });
beforeprint();
assert.ok(details.every(detail => detail.open), 'beforeprint must open every details');

const which = binary => { try { return execFileSync('which', [binary], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
if (which('pdftoppm')) {
  const chromium = which('chromium') || which('chromium-browser');
  assert.ok(chromium, 'Chromium required for PDF smoke when pdftoppm exists');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'vw-print-'));
  try {
    for (const page of ['index', 'pilots', 'pilot', 'mechbay', 'mech', 'solstice-rain']) {
      const pdf = path.join(temp, `${page}.pdf`);
      const png = path.join(temp, page);
      execFileSync(chromium, ['--headless', '--no-sandbox', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, `file://${path.join(root, `${page}.html`)}`], { stdio: 'pipe', timeout: 30000 });
      assert.ok(fs.statSync(pdf).size > 1000, `${page}: PDF empty`);
      execFileSync('pdftoppm', ['-f', '1', '-l', '1', '-singlefile', '-scale-to', '700', '-png', pdf, png], { stdio: 'pipe', timeout: 30000 });
      assert.ok(fs.statSync(`${png}.png`).size > 1000, `${page}: rendered page empty`);
      console.log(`${page}: PDF rendered`);
    }
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
}
console.log('print check passed');
