#!/usr/bin/env node
const fs = require('node:fs');
const {catalog, validate, scaffold, page} = require('./pilot-build-rules.cjs');
try {
  const [command, ...args] = process.argv.slice(2);
  const value = flag => args[args.indexOf(flag) + 1];
  const data = value('--data'), supplement = args.includes('--supplement') ? value('--supplement') : null;
  if (!data || !['check','scaffold','page'].includes(command)) throw Error('Usage: pilot-build.cjs check|page build.json --data LIB [--supplement DIR] | scaffold --pilot NAME --frame FRAME_ID --data LIB [--supplement DIR]');
  const cat = catalog(data, supplement);
  if (command === 'scaffold') console.log(JSON.stringify(scaffold(value('--pilot'), value('--frame'), cat), null, 2));
  else {
    const file = args[0];
    const build = JSON.parse(fs.readFileSync(file, 'utf8'));
    if (command === 'page') process.stdout.write(page(build, cat));
    else {
      const errors = validate(build, cat);
      if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
      else console.log('LL0–LL12 build checks pass (catalog mechanics only)');
    }
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
