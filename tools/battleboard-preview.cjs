/* Read-only LL9 design preview. Reuses the generated guide's stats and ability records. */
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '..');
const output = path.join(root, 'docs/guides/mockups/battleboard.html');
const levels = require('./averna-builds.cjs').chomolungma;
const abilities = require('./averna-abilities.cjs');
const ll = 9, row = levels[ll];
const escape = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const guide = fs.readFileSync(path.join(root, 'docs/guides/averna-omniscient-overlord.html'), 'utf8');
const start = guide.indexOf('id="chomolungma-ll9"');
const level = guide.slice(start, guide.indexOf('id="chomolungma-ll10"', start));
const stats = [...level.matchAll(/data-stat="([^"]+)"><span class="k">([^<]+)<\/span><span class="v">([^<]+)<\/span>/g)];
assert.equal(stats.length, 8, 'LL9 guide needs eight stat values');
const values = Object.fromEntries(stats.map(m => [m[1], m[3]]));
const ranks = new Map();
for (const r of levels.slice(0, ll + 1)) for (const gain of r.talent.split(' / ')) {
  const [, name, rank] = gain.match(/^(.*) (I|II|III)$/);
  ranks.set(name, rank);
}
const groups = abilities(row, ll, ranks);
const profile = groups.Passives.find(([name]) => name === 'Mech profile')[1];
const bonuses = groups.Passives.find(([name]) => name === 'Attack and save bonuses')[1];
const repairCap = profile.match(/Repair Cap (\d+)/)[1];
const saveTarget = bonuses.match(/Save Target (\d+)/)[1];
const context = {speed: Number(values.speed), tech: Number(values.tech), grit: Number(values.weapon)};
const order = ['Protocols / free actions', 'Quick actions', 'Full actions', 'Reactions', 'Weapons', 'Passives', 'On foot'];
const ids = ['start', 'quick', 'full', 'reactions', 'weapons', 'passives', 'pilot'];
const labels = ['Start / free', 'Quick', 'Full', 'React', 'Weapons', 'Passives', 'Pilot'];
const shown = new Set();
const sections = order.map((name, i) => {
  const cards = groups[name].filter(([title]) => !['Mech profile', 'Attack and save bonuses'].includes(title));
  return `<section class="action-section" id="${ids[i]}" aria-labelledby="heading-${ids[i]}"><h2 id="heading-${ids[i]}"><span>${String(i + 1).padStart(2,'0')}</span>${escape(name)}</h2><div class="cards">` + cards.map(([title, detail]) => {
    shown.add(title);
    const facts = abilities.facts(title, context) || [];
    return `<article class="action-card"><h3>${escape(title)}</h3>${facts.length ? `<dl class="facts">${facts.map(([label, value]) => `<div><dt>${escape(label)}</dt><dd>${escape(value)}</dd></div>`).join('')}</dl>` : ''}<p>${escape(detail)}</p></article>`;
  }).join('') + '</div></section>';
}).join('');
for (const group of Object.values(groups)) for (const [title] of group) {
  if (!['Mech profile','Attack and save bonuses'].includes(title)) assert.ok(shown.has(title), `Missing ability: ${title}`);
}
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>Averna LL9 · Read-only battleboard preview</title><link rel="stylesheet" href="../../../theme.css">
<style>
*{box-sizing:border-box}html{scroll-padding-top:150px}body{margin:0;background:var(--bg,#020d18);color:var(--text,#e8eef2);font:16px/1.55 system-ui,sans-serif}a{color:var(--cyan,#00c0f0);text-decoration:none}a:focus-visible{outline:2px solid var(--lime,#c2d57a);outline-offset:3px}
.shell{max-width:1240px;margin:auto;padding:0 16px 60px}.top{position:sticky;top:0;z-index:5;background:var(--bg,#020d18);border-bottom:1px solid var(--line,#16455e)}.top-inner{max-width:1240px;margin:auto;padding:12px 16px 8px}.identity{display:flex;align-items:center;justify-content:space-between;gap:12px}.identity strong{display:block;font:700 22px/1.1 monospace;letter-spacing:.05em}.identity small{color:var(--text-soft,#a9c6d6);font:11px/1.4 monospace}.level{border:1px solid var(--cyan,#00c0f0);padding:7px 10px;color:var(--lime,#c2d57a);font:700 20px monospace}.back{display:inline-flex;align-items:center;min-height:44px;font:12px monospace}
.jump{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0 0}.jump a{display:grid;place-items:center;min-height:44px;padding:6px 9px;border:1px solid var(--line,#16455e);font:12px monospace;color:var(--text,#e8eef2)}.jump a:hover,.jump a:focus-visible{border-color:var(--cyan,#00c0f0);background:var(--panel,#061622)}
.notice{margin:16px 0;font:12px/1.5 monospace;color:var(--muted,#7fa3b8)}.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.stat{background:var(--panel,#061622);border:1px solid var(--line,#16455e);padding:12px;min-width:0}.stat dt{font:11px/1.4 monospace;letter-spacing:.06em;color:var(--text-soft,#a9c6d6)}.stat dd{margin:7px 0 0;font:700 30px/1 monospace;color:var(--lime,#c2d57a)}.stat:first-child{border-left:3px solid var(--cyan,#00c0f0)}
.budget{border:1px solid var(--line,#16455e);border-left:3px solid var(--rust-light,#e7b49d);padding:14px 16px;margin:16px 0 10px;background:var(--panel,#061622)}.eyebrow{color:var(--rust-light,#e7b49d);font:12px monospace;letter-spacing:.1em}.budget p{margin:6px 0}.budget b{color:var(--text,#e8eef2)}.meta{color:var(--text-soft,#a9c6d6);font:13px/1.8 monospace}.tactics{margin:12px 0 24px}.tactics summary{min-height:44px;padding:10px 0;cursor:pointer;color:var(--cyan,#00c0f0);font:13px monospace}.tactics p{margin:4px 0;font-size:14px;color:var(--text-soft,#a9c6d6)}
h2{display:flex;align-items:center;gap:12px;font:600 17px/1.3 monospace;margin:28px 0 12px;color:var(--cyan,#00c0f0)}h2 span{font-size:12px;color:var(--muted,#7fa3b8)}h2:after{content:"";height:1px;background:var(--line,#16455e);flex:1}.cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.action-card{padding:16px;background:var(--panel,#061622);border:1px solid var(--line,#16455e);border-top:2px solid var(--cyan,#00c0f0);min-width:0}.action-card h3{font:600 16px/1.4 monospace;margin:0 0 10px;overflow-wrap:anywhere}.action-card p{font-size:15px;line-height:1.65;color:var(--report-text,#c3d3dd);margin:12px 0 0}.facts{display:grid;gap:8px;margin:0}.facts div{display:grid;grid-template-columns:88px minmax(0,1fr);gap:12px}.facts dt{color:var(--muted,#7fa3b8);font:11px/1.5 monospace}.facts dd{color:var(--lime,#c2d57a);font:600 17px/1.3 monospace;margin:0;overflow-wrap:anywhere}#reactions .action-card{border-top-color:var(--rust-light,#e7b49d)}footer{margin-top:32px;padding-top:14px;border-top:1px solid var(--line,#16455e);font-size:13px;color:var(--muted,#7fa3b8)}
@media(max-width:600px){.stats{grid-template-columns:repeat(2,minmax(0,1fr))}.cards{grid-template-columns:1fr}.shell{padding-inline:12px}.top-inner{padding-inline:12px}html{scroll-padding-top:190px}.stat{padding:12px}.stat dd{font-size:30px}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}
</style></head><body>
<header class="top"><div class="top-inner"><div class="identity"><div><strong>AVERNA / FIELD BOARD</strong><small>GMS CHOMOLUNGMA · RURIK “DAEMON” VARGSKEL</small></div><span class="level">LL9</span></div><nav class="jump" aria-label="Battleboard sections">${labels.map((label,i)=>`<a href="#${ids[i]}">${label}</a>`).join('')}</nav></div></header>
<main class="shell"><a class="back" href="../averna-omniscient-overlord.html#chomolungma-ll9">← Return to LL9 guide</a><p class="notice">READ-ONLY DESIGN PREVIEW · Full-build values, not current combat state. No counters or saved changes.</p>
<dl class="stats">${stats.map(m=>`<div class="stat"><dt>${escape(m[2])}</dt><dd>${escape(m[3])}</dd></div>`).join('')}</dl>
<div class="budget"><span class="eyebrow">YOUR TURN</span><p><b>2 quick actions</b> or <b>1 full action</b></p><p>Standard move: <b>${values.speed} spaces</b></p><p class="meta">${escape(row.hase)}<br>SP ${row.used}/${row.sp} · Repair Cap ${repairCap}<br>Save Target ${saveTarget}</p><p>Reactions: at most one per character’s turn, subject to each ability’s own limits.</p></div>
<details class="tactics"><summary>Build tactics · LL9</summary><p>${escape(row.play)}</p><p>Current triggers: ${escape(row.trigger)}</p></details>
${sections}
<footer>Preview generated from the existing Chomolungma LL9 build and ability reference. Layout experiment, not a new rules audit. Other levels and the live pilot record are unchanged.</footer></main></body></html>\n`;
if (process.argv.includes('--check')) {
  assert.equal(fs.readFileSync(output,'utf8'), html, 'Battleboard preview stale');
  assert.ok(!html.includes('<script'), 'Read-only preview needs no JavaScript');
  assert.ok(html.includes('5 spaces') && html.includes('+7 vs E-Defense') && html.includes('Read a Situation +4'));
  console.log('Battleboard preview: LL9 stats, all ability groups, no JS, generated output match');
} else { fs.writeFileSync(output,html); console.log('Wrote docs/guides/mockups/battleboard.html'); }
