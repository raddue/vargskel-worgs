const fs = require('node:fs');
const path = require('node:path');

function catalog(data, supplement) {
  const read = (dir, file) => JSON.parse(fs.readFileSync(path.join(dir, file + '.json'), 'utf8'));
  const result = {};
  for (const kind of ['frames', 'weapons', 'systems', 'talents']) {
    const extra = supplement && fs.existsSync(path.join(supplement, kind + '.json')) ? read(supplement, kind) : [];
    const rows = [...read(data, kind), ...extra];
    const ids = new Set();
    for (const row of rows) {
      if (!row.id || ids.has(row.id)) throw Error(`Missing or duplicate ${kind} ID: ${row.id}`);
      ids.add(row.id);
    }
    result[kind] = new Map(rows.map(row => [row.id, row]));
  }
  result.fittings = read(data, 'rules').mount_fittings;
  return result;
}

const seats = slot => slot.split('/').map(part => ({Aux:'Auxiliary',Main:'Main',Heavy:'Heavy'}[part] || part));
const licenseKey = item => item.license || item.source;
function unlocked(item, licenses) {
  const level = item.license_level || 0;
  return level === 0 && item.source === 'GMS' || (licenses[licenseKey(item)] || 0) >= level && level > 0;
}
function validate(build, cat) {
  const errors = [];
  const fail = (n, message) => errors.push(`LL${n}: ${message}`);
  const levels = build.levels;
  if (!Array.isArray(levels) || levels.length !== 13) return ['Build needs 13 levels, LL0 through LL12'];
  const ranks = {}, licenses = {};
  for (let n = 0; n < 13; n++) {
    const row = levels[n];
    if (row.ll !== n) { fail(n, `expected ll ${n}`); continue; }
    if (!row.frame) { fail(n, 'frame required'); continue; }
    if (n && !levels[n-1].frame) fail(n, 'gap in progression');
    if (n && (!row.license || typeof row.license !== 'string')) fail(n, 'one new license rank required');
    if (n && row.license) {
      const [source, rank] = row.license.match(/^(.*) (I|II|III)$/)?.slice(1) || [];
      const value = {I:1,II:2,III:3}[rank];
      if (!source || value !== (licenses[source] || 0) + 1) fail(n, `invalid license progression: ${row.license}`);
      else licenses[source] = value;
    }
    const frame = cat.frames.get(row.frame);
    if (!frame) { fail(n, `unknown frame ${row.frame}`); continue; }
    if (!unlocked(frame, licenses)) fail(n, `frame ${frame.name} license not unlocked`);
    if (!Number.isInteger(row.systemsScore) || row.systemsScore < 0 || row.systemsScore > 6) fail(n, 'systemsScore must be 0..6');
    const cap = frame.stats.sp + Math.floor(row.systemsScore / 2) + Math.ceil(n / 2);
    let used = 0;
    for (const id of row.systems || []) {
      const item = cat.systems.get(id);
      if (!item) { fail(n, `unknown system ${id}`); continue; }
      if (!unlocked(item, licenses)) fail(n, `${item.name} license not unlocked`);
      used += item.sp || 0;
    }
    const slots = frame.mounts.concat(row.coreBonus === 'Improved Armament' ? ['Flex'] : []);
    if (!Array.isArray(row.mounts) || row.mounts.length !== slots.length) fail(n, 'mount count differs from frame');
    for (let i = 0; i < (row.mounts || []).length; i++) {
      const mount = row.mounts[i];
      if (mount.slot !== slots[i]) { fail(n, `mount ${i} must be ${slots[i]}`); continue; }
      const sizes = seats(mount.slot);
      if (!Array.isArray(mount.weapons) || mount.weapons.length > sizes.length) { fail(n, `mount ${i} overfilled`); continue; }
      for (let j = 0; j < mount.weapons.length; j++) {
        const item = cat.weapons.get(mount.weapons[j]);
        if (!item) { fail(n, `unknown weapon ${mount.weapons[j]}`); continue; }
        if (!unlocked(item, licenses)) fail(n, `${item.name} license not unlocked`);
        if (!(cat.fittings[sizes[j]] || []).includes(item.mount)) fail(n, `${item.name} does not fit mount ${mount.slot}`);
        used += item.sp || 0;
      }
    }
    if (used > cap) fail(n, `SP ${used}/${cap} exceeded`);
    const talentRanks = {};
    for (const id of row.talents || []) talentRanks[id] = (talentRanks[id] || 0) + 1;
    if (Object.values(talentRanks).reduce((sum, v) => sum + v, 0) !== n + 3) fail(n, `talent ranks must total ${n + 3}`);
    for (const [id, rank] of Object.entries(talentRanks)) {
      if (!cat.talents.has(id) || rank > cat.talents.get(id).ranks.length) fail(n, `unknown or excess talent ${id}`);
      if (n && rank > (ranks[id] || 0) + 1) fail(n, `talent ${id} gained multiple ranks`);
    }
    Object.assign(ranks, talentRanks);
  }
  return errors;
}
function scaffold(pilot, frameId, cat) {
  const frame = cat.frames.get(frameId);
  if (!frame) throw Error(`Unknown frame ${frameId}`);
  if (frame.source !== 'GMS' || frame.license_level !== 0) throw Error('LL0 frame must be GMS');
  return {pilot, source:'massif-press/lancer-data plus optional supplement', levels:Array.from({length:13}, (_, ll) => ({
    ll, license:null, frame:ll ? null : frameId, systemsScore:0, talents:[], coreBonus:null,
    systems:[], mounts:ll ? [] : frame.mounts.map(slot => ({slot,weapons:[]})),
    notes:''
  }))};
}
function page(build, cat) {
  const lines = [`# ${build.pilot}: pilot build`, '', `Catalog: ${build.source}`, '', '## Role and constraints', '', '<!-- Write playstyle, team, allowed sources and GM rulings. -->', ''];
  for (const row of build.levels) {
    const frame = cat.frames.get(row.frame);
    if (!frame) {
      lines.push(`## LL${row.ll}: frame TBD`, '', '<!-- Choose frame, license, talents, systems and mounts. -->', '');
      continue;
    }
    const systems = row.systems.map(id => {
      const item = cat.systems.get(id);
      if (!item) throw Error(`LL${row.ll}: unknown system ${id}`);
      return `${item.name} (${item.sp || 0} SP)`;
    });
    const used = row.systems.reduce((sum,id) => sum + (cat.systems.get(id)?.sp || 0), 0) + row.mounts.flatMap(m => m.weapons).reduce((sum,id) => sum + (cat.weapons.get(id)?.sp || 0),0);
    const cap = frame.stats.sp + Math.floor(row.systemsScore / 2) + Math.ceil(row.ll / 2);
    lines.push(`## LL${row.ll}: ${frame.name}`, '', `- License: ${row.license || 'None'}`, `- Talents: ${row.talents.map(id => cat.talents.get(id)?.name || id).join(', ') || 'TBD'}`, `- Core bonus: ${row.coreBonus || 'None'}`, `- SP: ${used}/${cap}`, `- Systems: ${systems.join(', ') || 'None'}`, `- Mounts: ${row.mounts.map(m => `${m.slot}: ${m.weapons.map(id => cat.weapons.get(id)?.name || id).join(' + ') || 'Empty'}`).join('; ')}`, '', '<!-- Write action economy, ally triggers, tradeoffs and catalog citations here. -->', '');
  }
  lines.push('## Sources and rulings', '', '<!-- Cite rank/equipment text and separate GM interpretations from printed rules. -->', '');
  return lines.join('\n');
}
module.exports = {catalog, validate, scaffold, page};
