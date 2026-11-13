const assert = require('node:assert/strict');
const loadout = require('../loadout.js');
const catalogue = { systems: { unstable: { sp: 0, tg_ai: true, ai_cap: 1 }, student: { sp: 0, tg_ai: true }, extra: { sp: 0, tg_ai: true } }, weapons: {}, frames: {} };
const build = { mounts: [], systems: [], sys: 0 };
assert.equal(loadout.setSystems(build, ['unstable', 'student'], catalogue, {}).ok, true);
assert.equal(loadout.setSystems(build, ['unstable', 'student', 'extra'], catalogue, {}).ok, false);
