const assert = require('node:assert/strict');
const { readExport } = require('./compcon.cjs');
const pilot = { callsign: 'A', mechs: [{ name: 'M', loadouts: [{ mounts: [{ mount_type: 'Flex', slots: [{ weapon: { data: { name: 'Pistol' } } }], extra: [{ weapon: { data: { name: 'Knife' } } }] }] }] }] };
const parsed = readExport(JSON.stringify({ data: JSON.stringify({ pilotData: [pilot] }) }));
assert.deepEqual(parsed.pilots[0].mechs[0].build.mounts[0].weapons, ['Pistol', 'Knife']);
