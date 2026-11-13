const assert = require('node:assert/strict');
const { mount } = require('./render.cjs');
const expected = { daemon: ['The Broker', 'Perfect Little Universe'], dusty: ['The Pathfinder', 'Freesoul'], guillaume: ['The Harlequin', 'Exuent'], danila: ['The Fool', 'Joyluck Wind Thrower'], spook: ['The Wolf', 'Go for a Walk'] };
for (const [id, values] of Object.entries(expected)) {
  const html = mount('pilot.html', '#' + id).html('dossier');
  for (const value of values) assert.ok(html.includes(value), `${id}: missing ${value}`);
}
assert.ok(!mount('pilot.html', '#sten').html('dossier').includes('BOND POWER'));
