const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'worgs-supp-'));
try {
  const archive = path.join(dir, 'archive.json');
  fs.writeFileSync(archive, JSON.stringify({ data: { data: [{ collection: 'content', items: [{ manifest: { name: 'fixture' }, data: { weapons: [{ name: 'Shotgun' }], systems: [{ name: 'Personalizations' }] } }] }] } }));
  const result = spawnSync(process.execPath, [path.join(__dirname, 'extract-supplement.cjs'), archive, dir], { encoding: 'utf8' });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'weapons.json')))[0].name, 'Shotgun');
  assert.equal(JSON.parse(fs.readFileSync(path.join(dir, 'systems.json')))[0].name, 'Personalizations');
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
