const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { execFileSync } = require('node:child_process');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const css = fs.readFileSync(path.join(root, 'style.css'), 'utf8');
/* every @media print block, brace-matched, so rules after a block (or outside print) can't satisfy the checks */
const printBlocks = [];
for (let at = css.indexOf('@media print'); at !== -1; at = css.indexOf('@media print', at + 1)) {
  let i = css.indexOf('{', at), depth = 0;
  for (; i < css.length; i++) { if (css[i] === '{') depth++; else if (css[i] === '}' && --depth === 0) break; }
  assert.ok(depth === 0, 'unbalanced @media print block');
  printBlocks.push(css.slice(at, i + 1));
}
const print = printBlocks.join('\n');
assert.ok(print, 'print stylesheet missing');
for (const variable of ['bg', 'panel', 'panel2', 'text', 'text-soft', 'muted', 'line', 'cyan', 'lime', 'rust', 'rust-light', 'report-text',
  'hero-start', 'hero-glow', 'hero-mid', 'silhouette', 'avatar-bg', 'thumb-bg', 'thumb-muted', 'photo-start', 'photo-muted', 'chip-hover', 'holo-bg', 'holo-button-bg', 'rust-wash']) {
  assert.match(print, new RegExp(`--${variable}:`), `print theme lacks --${variable}`);
}
for (const selector of ['.topline', '.nav', '.status', '.hero-art', '.holo-chips', '.lightbox', '.footer span:last-child', '#holomap',
  '.sweep', '.route-pulse', '.card', 'article', '.vip', '.opord-para', '.shell', 'a[href^="http"]::after']) {
  assert.ok(print.includes(selector), `print selector missing: ${selector}`);
}
assert.match(print, /\.chip\{display:inline!important/, 'chips carry record values and must print');
assert.match(print, /@page\s*\{\s*margin:\s*16mm/);
assert.match(print, /break-inside:\s*avoid/);
assert.match(print, /animation:\s*none\s*!important/);

const js = fs.readFileSync(path.join(root, 'archive.js'), 'utf8');
const opener = js.match(/^(?:if \(typeof addEventListener === ["']function["']\) )?addEventListener\(["']beforeprint["'],\s*\(\)\s*=>\s*document\.querySelectorAll\(["']details["']\)\.forEach\(d\s*=>\s*d\.open\s*=\s*true\)\);?/m);
assert.ok(opener, 'beforeprint details opener missing');
const details = [{ open: false }, { open: false }];
let beforeprint;
vm.runInNewContext(opener[0], { addEventListener: (event, handler) => { assert.equal(event, 'beforeprint'); beforeprint = handler; }, document: { querySelectorAll: selector => { assert.equal(selector, 'details'); return details; } } });
beforeprint();
assert.ok(details.every(detail => detail.open), 'beforeprint must open every details');

/* expected print content comes from the campaign data the pages render */
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'campaign.js'), 'utf8'), sandbox);
const C = sandbox.window.CAMPAIGN;
const pilot = C.pilots.find(p => p.mech && C.mechs.some(m => m.id === p.mech));
const mech = C.mechs.find(m => m.id === pilot.mech);
const plain = name => name.replace(/“([^”]*)”/g, '$1').replace(/\s+/g, ' ').trim();
const crewName = name => name.replace(/“[^”]*”/g, '').replace(/\s+/g, ' ').trim();
const pilotById = Object.fromEntries(C.pilots.map(p => [p.id, p]));
const mechById = Object.fromEntries(C.mechs.map(m => [m.id, m]));
const op = C.ops.find(o => (o.crew || []).length && o.mission);
const words = s => s.split(' ').map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
const pages = [
  { name: 'index', file: 'index.html', expect: [/OUTCOME/, new RegExp(words(crewName(C.pilots.find(p => p.id === op.crew[0]).name))), new RegExp(`MECHS\\s+${words(C.mechs.find(m => m.id === op.mechs[0]).name)}`), new RegExp(words(op.mission.title))] },
  { name: 'pilots', file: 'pilots.html', expect: [/PILOT ROSTER/, ...C.pilots.filter(p => p.mech && mechById[p.mech]).map(p => new RegExp(`CHASSIS\\s+${words(mechById[p.mech].name)}`))] },
  { name: 'pilot', file: 'pilot.html', hash: pilot.id, expect: [/PILOT DOSSIER/, new RegExp(`CHASSIS\\s+${words(mech.name)}`)] },
  { name: 'mechbay', file: 'mechbay.html', expect: [/CHASSIS REGISTER/, ...C.mechs.filter(m => m.pilot && pilotById[m.pilot]).map(m => new RegExp(`PILOT\\s+${words(plain(pilotById[m.pilot].name))}`))] },
  { name: 'mech', file: 'mech.html', hash: mech.id, expect: [/CHASSIS DOSSIER/, new RegExp(`PILOT\\s+${words(plain(pilot.name))}`)] },
  { name: 'solstice-rain', file: 'solstice-rain.html', expect: [new RegExp(`${words(pilot.name.match(/\u201c([^\u201d]*)\u201d/)[1])}\\s+${words(pilot.name)}`)] },
];

const which = binary => { try { return execFileSync('which', [binary], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { return null; } };
if (which('pdftoppm')) {
  const chromium = which('chromium') || which('chromium-browser');
  assert.ok(chromium, 'Chromium required for PDF smoke when pdftoppm exists');
  assert.ok(which('pdftotext'), 'pdftotext required for PDF smoke when pdftoppm exists');
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'vw-print-'));
  try {
    for (const page of pages) {
      const pdf = path.join(temp, `${page.name}.pdf`);
      const png = path.join(temp, page.name);
      const url = pathToFileURL(path.join(root, page.file)).href + (page.hash ? `#${page.hash}` : '');
      execFileSync(chromium, ['--headless', '--no-sandbox', '--disable-gpu', '--no-pdf-header-footer', `--print-to-pdf=${pdf}`, url], { stdio: 'pipe', timeout: 30000 });
      assert.ok(fs.statSync(pdf).size > 1000, `${page.name}: PDF empty`);
      execFileSync('pdftoppm', ['-f', '1', '-l', '1', '-singlefile', '-scale-to', '700', '-png', pdf, png], { stdio: 'pipe', timeout: 30000 });
      assert.ok(fs.statSync(`${png}.png`).size > 1000, `${page.name}: rendered page empty`);
      const gray = execFileSync('pdftoppm', ['-f', '1', '-l', '1', '-singlefile', '-scale-to', '200', '-gray', pdf], { timeout: 30000 });
      const [header] = gray.toString('latin1', 0, 64).match(/^P5\s+\d+\s+\d+\s+255\s/);
      const pixels = gray.subarray(header.length);
      const mean = pixels.reduce((sum, v) => sum + v, 0) / pixels.length;
      assert.ok(mean > 200, `${page.name}: page 1 too dark for print (mean luminance ${mean.toFixed(1)})`);
      const text = execFileSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8', timeout: 30000 });
      if (page.hash) assert.ok(!/NOT FOUND/.test(text), `${page.name}#${page.hash}: dossier not rendered`);
      for (const pattern of page.expect) assert.match(text, pattern, `${page.name}: printed text lacks ${pattern}`);
      console.log(`${page.name}: PDF rendered`);
    }
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
} else {
  console.log('PDF smoke SKIPPED: pdftoppm not found');
}
console.log('print check passed');
