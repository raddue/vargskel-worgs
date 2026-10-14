const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = f => fs.readFileSync(path.join(__dirname, f), 'utf8');

/* --- Main sheet: OPFOR reference deck stays whole after the combat split --- */
const main = read('solstice-rain-m1.html');
const section = main.match(/id="opfor"[\s\S]*?(?=<div class="section-head" id="rules")/)?.[0] || '';
for (const name of ['ASSAULT', 'BASTION', 'HIVE', 'SUPPORT', 'BOMBARD', 'PRIEST', 'PYRO', 'RONIN', 'ARCHER', 'BARRICADE', 'ENGINEER', 'SEEDER', 'SENTINEL', 'CATAPHRACT', 'SPECTER', 'RAINMAKER']) {
  assert.match(section, new RegExp(`<h3[^>]*>${name}<`, 'i'), `${name} Tier 1 card missing from main OPFOR`);
}
for (const name of ['GRUNT', 'VETERAN', 'ELITE', 'COMMANDER']) {
  assert.match(section, new RegExp(`<h3[^>]*>${name}<`, 'i'), `${name} template missing from main OPFOR`);
}
assert.match(section, /TIER 1/);
assert.match(section, /HP.*ARM.*EVA.*E-DEF.*SPD.*SIZE.*HEAT.*SAVE.*SENS/i);
assert.match(section, /HULL.*AGI.*SYS.*ENG/i);
assert.match(section, /Hades Missiles/);
assert.match(section, /Punisher Ammunition/);

/* Main sheet must link out to the three combat pages. */
for (const page of ['solstice-rain-c1.html', 'solstice-rain-c2.html', 'solstice-rain-c3.html']) {
  assert.ok(main.includes(page), `main sheet missing link to ${page}`);
}

/* --- Combat pages: one per combat, with persistent NPC trackers --- */
const pages = {
  'solstice-rain-c1.html': { deployed: { ASSAULT: 2, BASTION: 1, HIVE: 1, BOMBARD: 1, PRIEST: 1 }, optional: ['SUPPORT', 'PYRO', 'RONIN', 'GRUNT'] },
  'solstice-rain-c2.html': { deployed: { ARCHER: 1, BARRICADE: 1, ENGINEER: 1, SEEDER: 1, SENTINEL: 2, CATAPHRACT: 2 }, optional: ['PRIEST', 'ASSAULT', 'GRUNT', 'BUS'] },
  'solstice-rain-c3.html': { deployed: { HIVE: 1, RAINMAKER: 1, SENTINEL: 1 }, optional: ['ARCHER', 'RONIN', 'SPECTER'] },
};

// Deployed cards are `<article class="npc">`; optional pool cards add `book`, the bus adds `obj`.
const anyIn = (html, cls) => (html.match(new RegExp(`data-npc-class="${cls}"`, 'g')) || []).length;
const deployedIn = (html, cls) => (html.match(new RegExp(`class="npc" data-npc-class="${cls}"`, 'g')) || []).length;

for (const [file, spec] of Object.entries(pages)) {
  const html = read(file);
  assert.ok(html.includes('combat-tracker.js'), `${file} missing combat-tracker.js include`);
  assert.ok(html.includes('data-store='), `${file} missing data-store key`);

  for (const [cls, n] of Object.entries(spec.deployed)) {
    assert.strictEqual(deployedIn(html, cls), n, `${file}: expected ${n} deployed ${cls} tracker(s)`);
  }
  for (const cls of spec.optional) {
    assert.ok(anyIn(html, cls) > 0, `${file}: optional ${cls} tracker missing`);
  }

  // Every tracker must carry HP + heat inputs and structure/stress tracking so it can persist.
  const trackers = html.match(/data-npc-class="[A-Z ]+"/g) || [];
  for (const t of trackers) {
    const cls = t.match(/"([A-Z ]+)"/)[1];
    assert.ok(cls, `${file}: blank tracker class`);
  }
  assert.match(html, /data-npc="[^"]*-hp"/, `${file}: HP input (data-npc="*-hp") missing`);
  assert.match(html, /data-npc="[^"]*-heat"/, `${file}: heat input missing`);
  assert.match(html, /data-npc="[^"]*-struct"/, `${file}: structure checkbox missing`);
  assert.match(html, /data-npc="[^"]*-stress"/, `${file}: stress checkbox missing`);
}

console.log('OPFOR: main keeps 16 classes + 4 templates; three combat pages carry tuned trackers with HP/heat/structure/stress');