const assert = require('node:assert/strict');
const loadout = require('../loadout.js');
assert.equal(loadout.licenceOk({ licences: [] }, { license: 'EXOTIC', license_level: 0 }), true);
assert.equal(loadout.licenceOk({ licences: [] }, { license: 'Goblin', license_level: 1 }), false);
