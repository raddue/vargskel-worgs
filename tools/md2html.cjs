/* Render the AVERNA build guide markdown into the site shell as a deployable page.
   Usage: node tools/md2html.cjs            rebuild docs/guides/averna-omniscient-overlord.html
          node tools/md2html.cjs --check    exit non-zero if the page is stale vs the markdown
   Handles only the subset the guide uses: h1-h3, hr, tables, blockquote, ul (wrapped), fenced code.
   check-all.cjs runs --check, so a committed page that drifts from its markdown fails CI. */
const fs = require("fs"), path = require("path"), chrome = require("./chrome.cjs");
const root = path.join(__dirname, "..");
const SRC = path.join(root, "docs/guides/averna-omniscient-overlord.md");
const OUT = path.join(root, "docs/guides/averna-omniscient-overlord.html");

const esc = s => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inl = s => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>")
  .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\*([^*\n]+)\*/g, "<em>$1</em>");

function table(rows) {
  const cells = rows.map(r => r.split("|").slice(1, -1).map(c => c.trim()));
  const head = cells[0], body = cells.slice(2);           // row 1 is the |---| separator
  const kv = head.every(c => !c);                          // empty header -> key/value plate
  const cls = kv ? "operation-table" : "threads-table";
  let h = `<div class="tbl"><table class="${cls}">`;
  if (!kv) h += "<thead><tr>" + head.map(c => `<th>${inl(c)}</th>`).join("") + "</tr></thead>";
  h += "<tbody>" + body.map(r =>
    "<tr>" + r.map((c, i) => (kv && i === 0 ? `<th>${inl(c)}</th>` : `<td>${inl(c)}</td>`)).join("") + "</tr>"
  ).join("") + "</tbody></table></div>";
  return h;
}

/* Section anchors: lowercase, punctuation dropped, spaces to dashes, deduped. */
const seenIds = new Set();
const slug = s => {
  let id = s.replace(/[*`]/g, "").toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  while (seenIds.has(id)) id += "-x";
  seenIds.add(id);
  return id;
};

function blocks(lines, firstOpen = true) {
  const H = [], toc = [];
  let sec = false, afterH1 = false, title = "";
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i];
    if (/^```/.test(L)) {                                  // fenced block
      const buf = [];
      while (i + 1 < lines.length && !/^```/.test(lines[++i])) buf.push(lines[i]);
      H.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
      continue;
    }
    if (/^\|.*\|$/.test(L.trim())) {                       // table run
      const buf = [];
      while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) buf.push(lines[i++].trim());
      i--;
      H.push(table(buf));
      continue;
    }
    if (/^>/.test(L)) {                                    // blockquote (may wrap)
      const buf = [];
      while (i < lines.length && (/^>/.test(lines[i]) || (buf.length && /^\s{2,}\S/.test(lines[i]))))
        buf.push(lines[i++].replace(/^>\s?/, ""));
      i--;
      H.push(`<blockquote class="report">${buf.map(b => (b.trim() ? inl(b) : "<br>")).join(" ")
        .replace(/(<br>)+/g, "<br>")}</blockquote>`);
      continue;
    }
    if (/^\s*- /.test(L)) {                                // bullet list, one nesting level, wrapped continuations
      const items = [];
      while (i < lines.length) {
        if (/^\s*- /.test(lines[i])) items.push({ n: /^\s{2,}/.test(lines[i]) ? 1 : 0, t: lines[i++].replace(/^\s*-\s*/, "") });
        else if (items.length && /^\s{2,}\S/.test(lines[i])) items[items.length - 1].t += " " + lines[i++].trim();
        else break;
      }
      i--;
      let h = "<ul>", open = false, nested = false;
      for (const it of items) {
        if (it.n) { if (!nested) { h += "<ul>"; nested = true; } h += `<li>${inl(it.t)}</li>`; }
        else { if (open) { h += nested ? "</ul></li>" : "</li>"; nested = false; } h += `<li>${inl(it.t)}`; open = true; }
      }
      H.push(h + (open ? (nested ? "</ul></li>" : "</li>") : "") + "</ul>");
      continue;
    }
    const h = L.match(/^(#{1,3}) (.+)$/);
    if (h) {
      const t = inl(h[2]);
      if (h[1].length === 2) {                             // h2 opens a native collapsible section
        if (sec) H.push("</details>");
        const id = slug(h[2]);
        H.push(`<details class="gsec" id="${id}"${sec || !firstOpen ? "" : " open"}><summary><h2>${t}</h2><span class="gcaret"></span></summary>`);
        toc.push([id, t, 0]);
        sec = true;
      } else if (h[1].length === 3) {
        const id = slug(h[2]);
        H.push(`<h3 id="${id}">${t}</h3>`);
        toc.push([id, t, 1]);
      } else {
        title = t;                                        // the deck paragraph turns this into the hero
      }
      afterH1 = h[1].length === 1;
      continue;
    }
    if (/^---+$/.test(L.trim())) { H.push("<hr>"); continue; }
    if (!L.trim()) continue;
    const buf = [L];                                       // paragraph, wrapped
    while (i + 1 < lines.length && lines[i + 1].trim() && !/^([-#>|`]|\s{2,})/.test(lines[i + 1]))
      buf.push(lines[++i]);
    H.push(afterH1
      ? chrome.hero({ eyebrow: "TACTICAL DOCTRINE / AVERNA", title, deck: inl(buf.join(" ")),
          prefix: "../../", art: "assets/averna.png", alt: "AVERNA, GMS Chomolungma" })
      : `<p>${inl(buf.join(" "))}</p>`);
    afterH1 = false;
  }
  if (sec) H.push("</details>");
  return { H, toc };
}

/* Keyword hover tooltips: native browser titles, no JS. Definitions are the terse
   status text and tag/glossary text from @massif/lancer-data 3.1.7. */
const TERMS = {
  "Involuntary Movement": "Forced movement in a straight line. It does not provoke reactions or Engagement unless specified otherwise, but is still blocked by obstructions.",
  "Save Target": "When you force a save, the target must match or beat your mech's Save Target or take the consequences. GRIT is added to it.",
  "Tech Attack": "Added to tech attacks instead of GRIT. A tech attack is rolled against the target's E-Defense.",
  Impaired: "Receives +1 Difficulty on all attacks, saves, and skill checks.",
  Slowed: "Cannot Boost, or make any special move granted by talents, systems, or weapons.",
  Jammed: "Cannot use comms, make attacks other than Improvised Attack, Grapple or Ram, or take reactions.",
  Immobilized: "Cannot make any voluntary movement.",
  Prone: "Attacks against it gain +1 Accuracy. It is Slowed and counts as moving in difficult terrain.",
  "Lock On": "A hostile character can consume it for +1 Accuracy on their next attack against this character.",
  Shredded: "Does not benefit from Armor or Resistance.",
  Invisible: "Attacks against it have a 50 percent chance to miss before the attack roll is made.",
  Hidden: "Cannot be targeted by hostile attacks or actions, and does not cause Engagement.",
  Engaged: "Ranged attacks made by this character gain +1 Difficulty, and all additional movement is lost.",
  Exposed: "All Kinetic, Explosive, or Energy damage taken by this character is doubled.",
  "Shut Down": "While Shut Down, mechs are Stunned indefinitely.",
  Smart: "Attacks with this weapon use the target's E-Defense instead of Evasion (no E-Defense counts as 8).",
  Seeking: "Ignores cover and does not require line of sight, so long as a path to the target can be drawn.",
  Loading: "Must be reloaded after each use. Mechs reload with the Stabilize action.",
  Blast: "Affects characters within its radius of a point within Range and line of sight.",
  Unique: "Cannot be duplicated: a character can only have one copy installed at a time.",
  AI: "One AI system per mech. AIs cannot benefit from talents, and have a small chance of cascading when they take structure or stress damage.",
  GRIT: "Half your LL, rounded up. Added to your mech's HP, SP, attack rolls and Save Target.",
  "E-Defense": "How hard this mech is to hit with electronic and guided weapons and systems.",
  Evasion: "How hard this mech is to hit with ranged and melee attacks.",
  "Wide-Area Code Pulse": "The Chomolungma core's 1/mission Full action: an Invade tech attack against any number of hostiles within Sensors, ignoring Invisible and line of sight. A miss leaves them Impaired until the end of their next turn.",
  "Balance Control Lockout": "Chomolungma core Invade option: push the target 2 spaces and knock them Prone. If they are already Prone, they are Immobilized until the end of their next turn. 1/scene per character.",
  "System Crusher": "Chomolungma core Invade option: your target takes an additional 2 Heat, for 4 total, and if that exceeds their Heat Cap they take 4 Burn as well. 1/scene per character.",
  "Data Siphon": "Chomolungma trait: a tech attack against a hostile character also Scans them, for free.",
  Brilliance: "Chomolungma trait, 1/scene: take any Quick Tech action as a free action, then either Bolster or Lock On as a free action.",
  "Replaceable Parts": "Chomolungma trait: while resting, repair at 1 Repair per point of structure damage instead of 2.",
  Sensors: "Your mech's sensor range: the reach of tech actions, Lock On and most systems.",
  Autopod: "GOBLIN I weapon (1 SP, Main Launcher, Seeking, Unique, Range 15, 3 Kinetic). It makes no attack roll; it grants the Autonomous Assault reaction.",
  "Autonomous Assault": "The Autopod's reaction, 1/round: another character attacks a target within Range 15 of you and consumes Lock On, and you automatically hit that target.",
  "Puppet System": "GOBLIN I Invade option: the target moves its maximum Speed in a direction of your choice. Involuntary, but it provokes reactions and Engagement.",
  "Eject Power Cores": "GOBLIN I Invade option: the target is Jammed until the end of their next turn, and characters adjacent to them take 2 Energy. 1/scene per character.",
  "H0R_OS System Upgrade I": "GOBLIN I system (2 SP, Unique) that adds the Invade options Puppet System and Eject Power Cores.",
  "H0R_OS System Upgrade II": "GOBLIN II system (2 SP, Unique) that adds the Quick Tech options Construct Other: Ideal Image and False Idol.",
  "H0R_OS System Upgrade III": "GOBLIN III system (2 SP, Unique) that adds the Invade options Dimensional Emblems and Celestial Shackles.",
  "Construct Other": "H0R_OS II Quick Tech: manifest an Other. Ideal Image is a Size 2 data construct that provides hard cover and blocks line of sight; False Idol is a decoy that forces a Systems save on anyone attacking the real target.",
  "Dimensional Emblems": "H0R_OS III Invade option: three Size 1 data constructs around the target. Passing through one deals 2 Heat and destroys it.",
  "Celestial Shackles": "H0R_OS III Invade option: mark the target's space. If they leave it, you may teleport them back once during your turn as a free action; a Systems save as a quick action breaks the effect.",
  Metahook: "GOBLIN II system (2 SP, Unique). The Goblin's recursive processing weave, sharpening weaponised code into an attack or softening it into shielding for allies.",
  "OSIRIS-Class NHP": "GOBLIN III system (3 SP, AI, Unique) that adds the Hurl Into the Duat Quick Tech option.",
  "ATHENA-Class NHP": "SWALLOWTAIL III system (3 SP, AI, Unique) that grants the AI tag and Simulacrum.",
  Simulacrum: "ATHENA's Quick action: a Blast 3 area within Range 50 where you have full visibility, hostiles lose cover and cannot Hide or turn Invisible, and anyone ending their turn inside gains Lock On. Lasts the scene.",
  "Lotus Projector": "SWALLOWTAIL I system (2 SP): a scout drone within Sensors and line of sight that emits a Burst 2 field telling you the location, HP, Evasion, E-Defense and Heat of everyone inside, and where hostiles cannot Hide or turn Invisible.",
  Markerlight: "SWALLOWTAIL I system (2 SP): the marking tool that makes every subsequent shot against the target cheaper.",
  "Retractable Profile": "SWALLOWTAIL II system (1 SP, Unique): strips extraneous profile, tunes broadcast software and masks heat signatures.",
  "Integrated Weapon": "GMS core bonus: an integrated mount for one Auxiliary weapon, fired 1/round as a free action when you fire any other weapon. It cannot be modified."
};
const TERM_RX = new RegExp("\\b(" + Object.keys(TERMS).join("|") + ")\\b", "g");

/* One left-to-right pass per text node, so inserted markup is never rescanned. Fenced
   code keeps its text; tag segments are left alone so attributes are never touched. */
function tooltips(html) {
  return html.split(/(<pre>[\s\S]*?<\/pre>)/).map(part =>
    /^<pre>/.test(part) ? part : part.split(/(<[^>]+>)/)
      .map(seg => /^</.test(seg) ? seg : seg.replace(TERM_RX, m => `<abbr title="${TERMS[m]}">${m}</abbr>`))
      .join("")).join("");
}

/* The visible glossary is built from TERMS, so the hover text and the table cannot disagree.
   Generated after tooltips() so a term never hovers its own definition. */
function glossary(toc) {
  const id = slug("Glossary");
  toc.push([id, "Glossary", 0]);
  return `<details class="gsec" id="${id}"><summary><h2>Glossary</h2><span class="gcaret"></span></summary>` +
    `<div class="tbl"><table class="operation-table"><tbody>` +
    Object.entries(TERMS).map(([t, d]) => `<tr><th>${esc(t)}</th><td>${esc(d)}</td></tr>`).join("") +
    `</tbody></table></div></details>`;
}

const LEVELS = require("./averna-builds.cjs");
const abilityGroups = require("./averna-abilities.cjs");
const STAT_DEFS = [["speed", "Speed", ""], ["tech", "Tech attack", "+"], ["weapon", "Weapon attack", "+"], ["sensors", "Sensors", ""],
  ["evasion", "Evasion", ""], ["edef", "E-Defense", ""], ["hp", "HP", ""], ["heat", "Heat cap", ""]];
function levelStats(row, ll) {
  const n = k => +row.hase.match(new RegExp(k + "(\\d+)"))[1];
  const h = n("H"), a = n("A"), s = n("S"), e = n("E"), grit = Math.ceil(ll / 2);
  return { speed: 4 + Math.floor(a / 2), tech: 1 + s, weapon: grit, sensors: 15, evasion: 8 + a + (ll >= 12 ? 2 : 0),
    edef: 10 + s, hp: 10 + 2 * h + grit + (row.installed.includes("Personalizations 1") ? 2 : 0), heat: 6 + e };
}
function gearNames(row) {
  const names = new Set(row.installed.map(i => i.replace(/ \d+$/, "")));
  for (const m of row.weapon.split("; ")) {
    const [slot, items] = m.split(": ");
    if (slot === "integrated") continue;
    for (const it of items.split(" + ")) names.add(it);
  }
  return names;
}
function changeLog(row, prev, ll) {
  if (!prev) return { items: [["START", "new", "Starting kit"]], news: new Set() };
  const cur = gearNames(row), old = gearNames(prev), items = [], news = new Set();
  const add = (tag, cls, text, key) => { items.push([tag, cls, text]); if (key) news.add(key); };
  add("NEW", "new", "License \u00b7 " + row.license);
  add("NEW", "new", "Talent \u00b7 " + row.talent, row.talent);
  if (row.core !== "No new bonus") add("NEW", "new", "Core bonus \u00b7 " + row.core, row.core);
  for (const g of cur) if (!old.has(g)) add("NEW", "new", g, g);
  for (const g of old) if (!cur.has(g)) add("REMOVED", "rm", g + " (swapped out)");
  return { items, news };
}
function abilityRow(title, detail, ctx, isNew) {
  const facts = (abilityGroups.facts(title, ctx) || []).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("");
  let cue = detail.replace(/^[^:]{1,30}: /, "").split(/[.;]/)[0];
  if (cue.length > 70) cue = cue.slice(0, 70).replace(/\s+\S*$/, "") + "\u2026";
  return `<details class="ab-row" data-ability="${esc(title)}"><summary><span class="nm">${esc(title)}${isNew ? ' <span class="tag new">NEW</span>' : ""}` +
    `<span class="cue">${esc(cue)}</span></span></summary><div class="body">${facts ? `<dl class="f">${facts}</dl>` : ""}<p>${esc(detail)}</p></div></details>`;
}
function abilityPanel(row, prev, ll, talents) {
  const ranks = [...talents].map(([name, value]) => [name, value.slice(name.length + 1)]);
  const groups = abilityGroups(row, ll, ranks);
  const st = levelStats(row, ll), pst = prev ? levelStats(prev, ll - 1) : null;
  const ctx = { speed: st.speed, tech: st.tech, grit: st.weapon };
  const log = changeLog(row, prev, ll);
  const sign = (k, v) => (STAT_DEFS.find(d => d[0] === k)[2]) + v;
  const board = STAT_DEFS.map(([k, label, pre]) => `<div class="ab-stat" data-stat="${k}"><span class="k">${label}</span><span class="v">${pre}${st[k]}</span>` +
    `<small>${pst && pst[k] !== st[k] ? `${st[k] > pst[k] ? "\u2191" : "\u2193"} from ${sign(k, pst[k])}` : ""}</small></div>`).join("");
  const skip = new Set(["Mech profile", "Attack and save bonuses"]);
  const body = Object.entries(groups).map(([name, cards]) => {
    const rowsHtml = cards.filter(([t]) => !skip.has(t)).map(([t, d]) => abilityRow(t, d, ctx, log.news.has(t))).join("");
    return rowsHtml ? `<h5 class="g">${esc(name)}</h5>${rowsHtml}` : "";
  }).join("");
  return `<details class="level-abilities"><summary>Abilities <span aria-hidden="true">\u25b8</span></summary>` +
    `<div class="ab-stats">${board}</div>` +
    `<section class="ab-log"><h4>${prev ? "SINCE LL" + (ll - 1) : "STARTING KIT"}</h4><ul>${log.items.map(([t, c, x]) => `<li><span class="tag ${c}">${t}</span><span>${esc(x)}</span></li>`).join("")}</ul></section>` +
    `<div class="ab-body">${body}</div></details>`;
}
function levelJourney(id, rows) {
  const talents = new Map();
  const timeline = `<div class="hud-journey" data-journey="${id}">` +
    `<div class="hud-heading"><span>LEVEL VECTOR</span><output class="hud-position" aria-label="Selected license level">LL0 / LL12</output></div>` +
    `<p class="hud-help" hidden>SWIPE TO PREVIEW · OPEN BUILD BELOW</p>` +
    `<div class="hud-shell"><nav class="level-timeline" aria-label="${id} level timeline">` +
    rows.map((r, n) => `<a href="#${id}-ll${n}" data-level="${n}" title="${esc(r.license + ": " + r.talent)}"${r.core !== 'No new bonus' ? ' class="core-stop"' : ''}><b>LL${n}</b><span>${esc(r.license)}</span><small>${r.core !== 'No new bonus' ? 'CORE BONUS' : 'LICENSE'}</small></a>`).join("") +
    `</nav><span class="hud-cursor" aria-hidden="true"></span></div>` +
    `<div class="hud-preview" id="${id}-level-preview" hidden></div>` +
    rows.map((r, n) => `<template id="${id}-preview-${n}"><div class="hud-preview-top"><h3>LL${n} · ${esc(r.license)}</h3>${r.core !== 'No new bonus' ? '<span class="hud-core">CORE UNLOCK</span>' : ''}</div>` +
      `<dl><dt>TALENT GAINED</dt><dd>${esc(r.talent)}</dd>${r.core !== 'No new bonus' ? `<dt>CORE BONUS</dt><dd>${esc(r.core)}</dd>` : ''}` +
      `<dt>CHASSIS</dt><dd>${esc(r.frame)}</dd><dt>HASE</dt><dd>${esc(r.hase)}</dd><dt>SYSTEM POINTS</dt><dd>${r.used} / ${r.sp} SP</dd></dl>` +
      `<a class="hud-open" href="#${id}-ll${n}">Open full LL${n} build <span aria-hidden="true">↗</span></a></template>`).join('') + `</div>`;
  const levels = rows.map((r, n) => {
    const gained = n ? [r.talent] : r.talent.split(' / ');
    for (const talent of gained) talents.set(talent.replace(/ (?:I|II|III)$/, ''), talent);
    return `<section class="level-entry" id="${id}-ll${n}" aria-labelledby="${id}-ll${n}-title">` +
    `<h3 id="${id}-ll${n}-title">LL${n} · ${esc(r.frame)}</h3>` +
    `<div class="level-synopsis"><span>LICENSE / CORE</span><p>${esc(r.license)} · ${esc(r.core)}</p>` +
    `<span>TALENTS</span><ul class="level-talents">${[...talents.values()].map(t => `<li class="level-talent">${esc(t)}${gained.includes(t) ? ' <span class="talent-gain">+1</span>' : ''}</li>`).join('')}</ul></div>` +
    `<div class="level-detail"><h4>HASE</h4><p class="hase-line">${esc(r.hase)}</p>` +
    (r.trigger ? `<h4>Pilot triggers</h4><p>${esc(r.trigger)}</p>` : '') +
    `<h4>Installed systems and weapon SP (${r.used}/${r.sp})</h4><ul>${r.installed.map(item => `<li>${esc(item)}</li>`).join("")}</ul>` +
    `<h4>Mounts</h4><ul>${r.weapon.split("; ").map(m => `<li>${esc(m)}</li>`).join("")}</ul></div>` +
    `<div class="level-play"><span>PLAY PATTERN / LL${n}</span><p>${esc(r.play)}</p></div>` +
    (id === 'chomolungma' ? abilityPanel(r, rows[n - 1], n, talents) : '') + `</section>`;
  }).join("\n");
  return `<div class="level-journey"><h2>LL0–LL12: ${id.toUpperCase()}</h2>${timeline}${levels}</div>`;
}

function render() {
  seenIds.clear(); /* ids are per-render, so the selftest can render twice and compare */
  const source = fs.readFileSync(SRC, "utf8");
  const [chomolungma, goblin, swallowtail] = source.split(/(?=^## (?:Goblin|Swallowtail) Build$)/m);
  if (!chomolungma || !goblin || !swallowtail) throw new Error("three frame sections required");
  const chomo = blocks(chomolungma.split("\n"));
  const gob = blocks(goblin.split("\n"), false);
  const swallow = blocks(swallowtail.split("\n"), false);
  const hero = chomo.H.shift();
  const panels = [
    ["chomolungma", "CHOMOLUNGMA", chomo], ["goblin", "GOBLIN", gob],
    ["swallowtail", "SWALLOWTAIL", swallow]
  ];
  const p = x => "../../" + x;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vargskel Worgs | The Omniscient Overlord</title>
<link rel="icon" href="${p("assets/favicon.png")}" type="image/png">
<link rel="apple-touch-icon" href="${p("assets/apple-touch-icon.png")}">
<link rel="manifest" href="${p("manifest.webmanifest")}">
<meta name="theme-color" content="#020d18">
<meta property="og:type" content="website">
<meta property="og:title" content="Vargskel Worgs | The Omniscient Overlord">
<meta property="og:description" content="Build guide: GMS Chomolungma into HORUS Goblin and SSC Swallowtail, LL0-LL12, three independent frame paths.">
<meta property="og:url" content="https://raddue.github.io/vargskel-worgs/docs/guides/averna-omniscient-overlord.html">
<meta property="og:image" content="https://raddue.github.io/vargskel-worgs/assets/share-card.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="stylesheet" href="${p("theme.css")}">
<link rel="stylesheet" href="${p("style.css")}">
<style>
/* prose layer: the site ships component classes only, so a doc page brings its own type scale */
.guide{max-width:1180px}
.guide .columns>.primary{min-width:0}
.guide h1{font:500 clamp(30px,4.4vw,52px)/1.05 var(--mono);letter-spacing:-.04em;margin:16px 0 8px}
.guide .lede{font:13px var(--mono);letter-spacing:.14em;color:var(--cyan);margin:0 0 22px}
.guide h3{font:15px var(--mono);letter-spacing:.12em;color:var(--cyan);margin:24px 0 9px}
.guide p,.guide li{font:15px/1.65 var(--sans);color:var(--report-text)}
.guide ul{margin:0 0 15px;padding-left:22px}
.guide li{margin-bottom:6px}
.guide strong{color:var(--text);font-weight:600}
.guide em{color:var(--rust-light)}
.guide code{font:13px var(--mono);color:var(--lime);background:var(--holo-bg);border:1px solid var(--line);padding:1px 4px}
.guide pre{background:var(--holo-bg);border:1px solid var(--line);padding:14px;overflow-x:auto;margin:0 0 16px}
.guide pre code{border:0;background:none;padding:0;color:var(--text-soft);font-size:13px;line-height:1.6}
.guide .tbl{overflow-x:auto;margin:0 0 18px;background:var(--panel);border:1px solid var(--line);padding:15px}
.guide blockquote.report{margin:0 0 18px;font:14px/1.65 var(--sans)}
.guide hr{border:0;border-top:1px solid var(--line);margin:28px 0}
.guide details.gsec{border-top:1px solid var(--line);padding:0}
.guide details.gsec>summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 4px}
.guide details.gsec>summary::-webkit-details-marker{display:none}
.guide details.gsec>summary::marker{content:""}
.guide details.gsec>summary h2{font:16px var(--mono);letter-spacing:.1em;margin:0}
.guide details.gsec>summary:hover h2,.guide details.gsec>summary:focus-visible h2{color:var(--cyan)}
.guide details.gsec>summary:focus-visible{outline:1px solid var(--cyan);outline-offset:-1px}
.guide .gcaret{color:var(--muted);font-size:11px}
.guide .gcaret::before{content:"\\25B8"}
.guide details.gsec[open] .gcaret::before{content:"\\25BE"}
.guide abbr[title]{text-decoration:underline dotted;text-underline-offset:3px;cursor:help;border:0}
.guide .build-tabs{display:flex;flex-wrap:wrap;gap:7px;margin:16px 0;border-bottom:1px solid var(--line);padding-bottom:9px}
.guide .build-tabs button{font:13px var(--mono);letter-spacing:.08em;padding:9px 12px;color:var(--text);background:var(--panel);border:1px solid var(--line);cursor:pointer}
.guide .build-tabs button[aria-selected="true"]{color:var(--cyan);border-color:var(--cyan)}
.guide .build-tabs button:focus-visible,.guide .level-timeline a:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
.guide .level-journey{margin:18px 0 28px}.guide .level-journey>h2{font:17px var(--mono);letter-spacing:.1em;color:var(--cyan)}
.guide .level-timeline{display:grid;grid-template-columns:repeat(auto-fill,minmax(95px,1fr));gap:6px;padding:12px 2px 18px;margin-bottom:8px}
.guide .level-timeline a{min-height:70px;padding:10px;border:1px solid var(--line);background:var(--panel);text-decoration:none;color:var(--text)}
.guide .level-timeline a:hover{border-color:var(--cyan);background:var(--holo-bg)}
.guide .level-timeline b{display:block;color:var(--cyan);font:600 16px var(--mono)}
.guide .level-timeline span{display:block;color:var(--text-soft);font:11px/1.35 var(--mono);margin-top:6px}
.guide .hud-journey{margin:12px 0 24px;border:1px solid var(--line);background:var(--holo-bg);padding:14px;min-width:0}
.guide .hud-heading{display:flex;justify-content:space-between;gap:8px;font:12px var(--mono);letter-spacing:.12em;color:var(--cyan)}
.guide .hud-position{color:var(--lime)}.guide .hud-help{font:11px/1.5 var(--mono);color:var(--muted);margin:8px 0}
.guide .hud-shell{position:relative;min-width:0}.guide .hud-cursor{display:none}
.guide .level-timeline small{display:block;margin-top:6px;color:var(--muted);font:9px var(--mono);letter-spacing:.08em}
.guide .level-timeline .core-stop small{color:var(--lime)}
.guide .hud-enhanced .level-timeline{display:flex;gap:0;position:relative;overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x mandatory;scroll-padding-inline:calc(50% - 48px);padding:28px calc(50% - 48px) 10px;margin:0;scrollbar-width:thin;scrollbar-color:var(--line) transparent}
.guide .hud-enhanced .level-timeline a{flex:0 0 96px;min-width:0;text-align:center;scroll-snap-align:center;padding:20px 5px 10px;min-height:116px;border:0;border-top:2px solid var(--line);background:repeating-linear-gradient(90deg,var(--line) 0 1px,transparent 1px 12px) top/100% 8px no-repeat}
.guide .hud-enhanced .level-timeline a[aria-current="step"]{border-top-color:var(--cyan);background-color:var(--panel);box-shadow:inset 0 -2px var(--cyan)}
.guide .hud-enhanced .level-timeline a[aria-current="step"] b{color:var(--lime)}
.guide .hud-enhanced .hud-cursor{display:block;pointer-events:none;position:absolute;top:8px;left:50%;width:2px;height:26px;background:var(--cyan);box-shadow:0 0 10px var(--cyan)}
.guide .hud-cursor::before{content:"";position:absolute;top:-1px;left:-5px;border:6px solid transparent;border-top-color:var(--cyan)}
.guide .hud-preview{position:relative;margin-top:15px;padding:14px;border:1px solid var(--cyan);background:var(--panel);box-shadow:0 0 16px color-mix(in srgb,var(--cyan) 10%,transparent)}
.guide .hud-preview::before{content:"";position:absolute;top:-16px;left:50%;height:15px;width:1px;background:var(--cyan)}
.guide .hud-preview::after{content:"";pointer-events:none;position:absolute;inset:-2px;border:2px solid var(--cyan);clip-path:polygon(0 0,18px 0,18px 2px,2px 2px,2px 18px,0 18px,0 0,100% 100%,calc(100% - 18px) 100%,calc(100% - 18px) calc(100% - 2px),calc(100% - 2px) calc(100% - 2px),calc(100% - 2px) calc(100% - 18px),100% calc(100% - 18px),100% 100%)}
.guide .hud-preview-top{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-bottom:12px}
.guide .hud-preview-top h3{margin:0;font:600 17px var(--mono);letter-spacing:0;color:var(--text)}
.guide .hud-core{font:10px var(--mono);color:var(--lime);border:1px solid var(--lime);padding:3px 6px}
.guide .hud-preview dl{margin:0;display:grid;grid-template-columns:minmax(0,105px) minmax(0,1fr);gap:8px 12px}
.guide .hud-preview dt{font:11px/1.4 var(--mono);color:var(--muted)}.guide .hud-preview dd{margin:0;font:14px/1.4 var(--mono);color:var(--text);overflow-wrap:anywhere}
.guide .hud-open{display:flex;align-items:center;justify-content:space-between;min-height:44px;margin-top:12px;padding:8px 0;border-top:1px solid var(--line);font:13px var(--mono);color:var(--cyan);text-decoration:none}
.guide .hud-open:focus-visible{outline:2px solid var(--lime);outline-offset:2px}
@media(prefers-reduced-motion:reduce){.guide .hud-journey *{scroll-behavior:auto!important;animation:none!important;transition:none!important}}
.guide .level-entry{scroll-margin-top:15px;border-top:1px solid var(--line);padding:16px 0 22px}
.guide .level-entry h3{margin:0 0 12px}
.guide .level-synopsis,.guide .level-play{padding:15px 18px;border:1px solid var(--cyan);background:var(--holo-bg)}
.guide .level-synopsis{border-left:5px solid var(--cyan)}
.guide .level-play{border-color:var(--rust-light);border-left:5px solid var(--rust-light);background:var(--panel)}
.guide .level-synopsis span,.guide .level-play span{font:11px var(--mono);letter-spacing:.16em;color:var(--cyan)}
.guide .level-play span{color:var(--rust-light)}
.guide .level-synopsis p,.guide .level-play p{margin:7px 0 0}
.guide .level-talents{list-style:none;margin:7px 0 0;padding:0}.guide .level-talent{margin:3px 0}
.guide .level-synopsis .talent-gain{color:var(--lime);font:12px var(--mono);margin-left:7px}
.guide .level-detail{padding:12px 18px}.guide .level-detail h4{margin:5px 0;font:13px var(--mono);color:var(--text)}
.guide .level-detail h4 small{font-weight:400;color:var(--cyan)}
.guide .level-detail .hase-line{font:13px var(--mono);color:var(--lime);margin:7px 0 15px}
.guide .level-detail ul{margin:7px 0 12px;padding-left:20px}.guide .level-detail li{margin-bottom:5px}
.guide .level-abilities{margin-top:12px;border:1px solid var(--line);background:var(--panel)}
.guide .level-abilities>summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;padding:12px 16px;color:var(--cyan);font:13px var(--mono);letter-spacing:.12em}
.guide .level-abilities>summary::-webkit-details-marker{display:none}.guide .level-abilities>summary::marker{content:""}
.guide .level-abilities>summary:focus-visible{outline:2px solid var(--cyan);outline-offset:2px}
.guide .level-abilities[open]>summary span{transform:rotate(90deg)}
.guide .ab-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:10px 14px 4px}
.guide .ab-stat{background:var(--holo-bg);border:1px solid var(--line);border-left:4px solid var(--cyan);padding:10px 12px}
.guide .ab-stat .k{display:block;font:11px var(--mono);letter-spacing:.14em;color:var(--muted);text-transform:uppercase}
.guide .ab-stat .v{display:block;margin-top:6px;font:600 28px/1 var(--mono);color:var(--lime)}
.guide .ab-stat small{display:block;margin-top:6px;min-height:14px;font:11px var(--mono);color:var(--cyan)}
.guide .ab-log{margin:10px 14px;background:var(--holo-bg);border:1px solid var(--line);border-left:4px solid var(--lime);padding:12px}
.guide .ab-log h4{margin:0 0 8px;font:600 12px var(--mono);letter-spacing:.14em;color:var(--lime)}
.guide .ab-log ul{list-style:none;margin:0;padding:0}.guide .ab-log li{display:flex;gap:10px;align-items:baseline;padding:7px 0;border-top:1px solid var(--line)}.guide .ab-log li:first-child{border:0}
.guide .tag{font:11px var(--mono);letter-spacing:.1em;padding:2px 7px;border:1px solid currentColor;display:inline-block;min-width:74px;text-align:center}
.guide .tag.new{color:var(--lime)}.guide .tag.rm{color:var(--rust-light)}
.guide .ab-body{padding:0 14px 14px}.guide h5.g{margin:16px 0 6px;font:600 12px var(--mono);letter-spacing:.14em;color:var(--cyan)}
.guide .ab-row{border:1px solid var(--line);background:var(--panel);margin-bottom:6px}
.guide .ab-row>summary{display:flex;align-items:center;gap:10px;min-height:44px;padding:8px 12px;cursor:pointer;list-style:none}
.guide .ab-row>summary::-webkit-details-marker{display:none}.guide .ab-row>summary::after{content:"\\25B8";color:var(--muted)}.guide .ab-row[open]>summary::after{content:"\\25BE"}
.guide .ab-row .nm{flex:1;font:600 14px var(--mono)}.guide .ab-row .cue{display:block;font:400 12px var(--sans);color:var(--muted)}
.guide .ab-row .tag{min-width:0;margin-left:6px}
.guide .ab-row .body{padding:0 12px 12px;border-top:1px solid var(--line)}
.guide .ab-row .f{display:grid;grid-template-columns:78px 1fr;gap:3px 10px;margin:10px 0}.guide .ab-row .f dt{font:11px var(--mono);letter-spacing:.12em;color:var(--muted)}.guide .ab-row .f dd{margin:0;font:600 15px var(--mono);color:var(--lime)}
.guide .ab-row .body p{margin:0;font:13px/1.5 var(--sans)}
[hidden]{display:none!important}
</style>
<script src="${p("offline.js")}"></script>
<script src="${p("theme.js")}"></script>
<script src="${p("compact.js")}"></script>
</head>
<body>
<div class="shell">
${chrome.topline("VW // TACTICAL DOCTRINE", "BUILD GUIDE · AVERNA")}
<header class="brandrow">
${chrome.brand("TACTICAL WIKI · BUILD GUIDE")}
${chrome.nav("../../")}
${chrome.status("ACTIVE")}
${chrome.compactToggle()}
</header>
<main class="guide"><div class="columns"><div class="primary fill">${hero}
<div class="build-tabs" role="tablist" aria-label="AVERNA frame builds">${panels.map(([id, label], i) => `<button type="button" role="tab" id="tab-${id}" aria-controls="panel-${id}" aria-selected="${!i}" tabindex="${i ? -1 : 0}" data-build="${id}">${label}</button>`).join("")}</div>
${panels.map(([id, , section], i) => `<section role="tabpanel" id="panel-${id}" aria-labelledby="tab-${id}"${i ? " hidden" : ""}>${levelJourney(id, LEVELS[id])}${tooltips(section.H.join("\n"))}${i ? "" : glossary(section.toc)}</section>`).join("\n")}</div>
</div></main>
<footer class="footer"><span>VARGSKEL WORGS / TACTICAL DOCTRINE</span><span>GENERATED FROM averna-omniscient-overlord.md · REBUILD: node tools/md2html.cjs</span></footer>
</div>
<script>
const journeys = new Map();
document.querySelectorAll('[data-journey]').forEach(root => {
  const id = root.dataset.journey, rail = root.querySelector('.level-timeline');
  const stops = [...rail.querySelectorAll('a[data-level]')], preview = root.querySelector('.hud-preview');
  let selected = 0, frame = 0;
  function select(n) {
    selected = n;
    stops.forEach((link, i) => { if (i === n) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current'); });
    preview.replaceChildren(document.getElementById(id + '-preview-' + n).content.cloneNode(true));
    root.querySelector('.hud-position').textContent = 'LL' + n + ' / LL12';
  }
  function center(n, smooth = false) {
    if (!rail.clientWidth) return;
    const link = stops[n];
    rail.scrollTo({left: link.offsetLeft + link.offsetWidth / 2 - rail.clientWidth / 2,
      behavior: smooth && !matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant'});
  }
  root.classList.add('hud-enhanced');
  root.querySelector('.hud-help').hidden = false;
  preview.hidden = false;
  select(0);
  rail.addEventListener('scroll', () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      const midpoint = rail.scrollLeft + rail.clientWidth / 2;
      let closest = 0, distance = Infinity;
      stops.forEach((link, i) => { const d = Math.abs(link.offsetLeft + link.offsetWidth / 2 - midpoint); if (d < distance) { closest = i; distance = d; } });
      if (selected !== closest) select(closest);
    });
  }, {passive:true});
  stops.forEach((link, n) => {
    link.addEventListener('click', e => { if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return; e.preventDefault(); select(n); center(n, true); });
    link.addEventListener('keydown', e => {
      if (!['ArrowLeft','ArrowRight','Home','End'].includes(e.key)) return;
      e.preventDefault();
      const next = e.key === 'Home' ? 0 : e.key === 'End' ? stops.length - 1 : Math.max(0, Math.min(stops.length - 1, n + (e.key === 'ArrowRight' ? 1 : -1)));
      stops[next].focus({preventScroll:true}); select(next); center(next);
    });
  });
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => center(selected)).observe(rail);
  journeys.set(id, {activate(n) { if (Number.isInteger(n) && stops[n]) select(n); center(selected); }});
});
const tabs = [...document.querySelectorAll('[role="tab"]')];
function showBuild(id, focus = false) {
  tabs.forEach(tab => {
    const active = tab.dataset.build === id;
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById("panel-" + tab.dataset.build).hidden = !active;
    if (active && focus) tab.focus();
  });
  journeys.get(id)?.activate();
}
tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => showBuild(tab.dataset.build));
  tab.addEventListener("keydown", e => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
    e.preventDefault();
    const next = e.key === "Home" ? 0 : e.key === "End" ? tabs.length - 1 :
      (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    showBuild(tabs[next].dataset.build, true);
  });
});
function openAnchor() {
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target) return;
  const panel = target.closest('[role="tabpanel"]');
  if (panel) {
    const id = panel.id.slice(6);
    showBuild(id);
    const level = target.id.match(/-ll(\\d+)$/);
    if (level) journeys.get(id)?.activate(Number(level[1]));
  }
  const details = target.closest("details");
  if (details) details.open = true;
}
window.addEventListener("hashchange", openAnchor);
openAnchor();
</script>
</body>
</html>
`;
}

if (process.argv.includes("--check")) {
  const assert = require("assert");
  const nested = blocks(["- parent", "  - child", "- second"]).H.join("");
  assert.ok(nested.includes("<li>parent<ul><li>child</li></ul></li>"), "nested bullets should render as a nested list, got: " + nested);
  const coll = blocks(["## A Section", "body text", "### A Sub", "more"]).H.join("");
  assert.ok(coll.startsWith('<details class="gsec" id="a-section" open><summary>'), "h2 should open a collapsible section, got: " + coll.slice(0, 90));
  assert.ok(coll.includes('<h3 id="a-sub">') && coll.endsWith("</details>"), "h3 should get an anchor and the section should close, got: " + coll.slice(-40));
  const two = blocks(["## One", "a", "## Two", "b"]).H.join("");
  assert.ok(two.includes('id="one" open>') && two.includes('id="two">') && !two.includes('id="two" open>'),
    "only the first section should default open, got: " + two.replace(/></g, ">\n<"));
  const page = render();
  assert.ok(/<script>[\s\S]*closest\("details"\)/.test(page),
    "a rail link must open the collapsed section it points into");
  for (const id of ["chomolungma", "goblin", "swallowtail"]) {
    assert.ok(page.includes(`id="panel-${id}"`) && page.includes(`id="tab-${id}"`), `missing ${id} tab`);
    assert.equal(LEVELS[id].length, 13, `${id} needs LL0–LL12`);
    assert.ok(page.includes(`id="${id}-level-preview"`), `${id} needs a swipe-rail preview`);
    assert.equal((page.match(new RegExp(`id="${id}-preview-\\d+"`, 'g')) || []).length, 13, `${id} needs 13 preview templates`);
    assert.ok(!page.includes('<meter') && !page.includes('class="meter"'), 'SP must be text, not a bar');
    for (let ll = 0; ll <= 12; ll++) {
      assert.ok(page.includes(`href="#${id}-ll${ll}"`) && page.includes(`id="${id}-ll${ll}"`), `${id} LL${ll} timeline link`);
      const preview = page.match(new RegExp(`<template id="${id}-preview-${ll}">([\\s\\S]*?)</template>`))?.[1];
      const row = LEVELS[id][ll];
      assert.ok(preview && preview.includes(esc(row.talent)) && preview.includes(`${row.used} / ${row.sp} SP`), `${id} LL${ll} preview must match build row`);
      const section = page.slice(page.indexOf(`id="${id}-ll${ll}"`), page.indexOf(`</section>`, page.indexOf(`id="${id}-ll${ll}"`)));
      assert.ok(section.includes(`PLAY PATTERN / LL${ll}`) && section.includes(LEVELS[id][ll].hase), `${id} LL${ll} content`);
    }
  }
  for (let ll = 0; ll <= 12; ll++) {
    const start = page.indexOf(`id="chomolungma-ll${ll}"`);
    const section = page.slice(start, page.indexOf('</details></section>', start) + '</details>'.length);
    assert.match(section, /<details class="level-abilities"><summary>Abilities <span aria-hidden="true">▸<\/span><\/summary>/, `LL${ll} must have a collapsed abilities panel`);
    for (const label of ['Quick actions', 'Full actions', 'Reactions', 'On foot', 'Weapons', 'Passives'])
      assert.ok(section.includes(label), `LL${ll} missing ${label}`);
    assert.ok(!/<details class="level-abilities" open/.test(section), `LL${ll} abilities must start closed`);
    const stat = k => +((section.match(new RegExp('data-stat="' + k + '"><span class="k">[^<]*</span><span class="v">\\+?(\\d+)')) || [])[1]);
    assert.ok(stat("speed") && stat("tech") >= 0 && stat("sensors") === 15, `LL${ll} stat board missing values`);
    assert.equal((section.match(/data-stat=/g) || []).length, 8, `LL${ll} stat board needs 8 tiles`);
    assert.ok(ll ? section.includes(`SINCE LL${ll - 1}`) : section.includes("STARTING KIT"), `LL${ll} change log heading`);
    const rowOf = t => (section.match(new RegExp('<details class="ab-row" data-ability="' + t.replace(/[/()]/g, '\\$&') + '"[\\s\\S]*?</details>')) || [''])[0];
    assert.ok(rowOf('Boost').includes(`<dd>${stat("speed")} spaces</dd>`), `LL${ll} Boost must show actual movement`);
    assert.ok(rowOf('Quick Tech').includes(`+${stat("tech")} vs E-Defense`), `LL${ll} Quick Tech must show the tech bonus`);
    assert.ok(rowOf('Nexus stats').includes(`+${stat("weapon")} vs E-Defense`), `LL${ll} Nexus must show the weapon bonus`);
    assert.ok(/Fire one weapon/.test(rowOf('Skirmish')) && !/Invade/.test(rowOf('Skirmish')), `LL${ll} Skirmish card has the wrong text`);
    assert.ok(/Invade/.test(rowOf('Quick Tech')) && !/Knock back/.test(rowOf('Quick Tech')), `LL${ll} Quick Tech card has the wrong text`);
    assert.ok(/Knock back/.test(rowOf('Ram / Grapple')), `LL${ll} Ram / Grapple card has the wrong text`);
  }
  assert.ok(page.includes('<details class="gsec" id="glossary">'), "the page must carry the generated glossary section");
  const unglossed = Object.keys(TERMS).filter(t => !page.includes(`<th>${esc(t)}</th>`));
  assert.ok(!unglossed.length, "every hovered term must appear in the glossary, missing: " + unglossed.join(", "));
  const unhoverable = Object.keys(TERMS).filter(t => (t.match(TERM_RX) || [])[0] !== t);
  assert.ok(!unhoverable.length, "every term must be matchable by TERM_RX as a whole word, these are not: " + unhoverable.join(", "));
  const have = fs.existsSync(OUT) ? fs.readFileSync(OUT, "utf8") : "";
  if (have !== render()) {
    console.error("guide page stale vs markdown; run: node tools/md2html.cjs");
    process.exit(1);
  }
  console.log("md2html check ok: page matches markdown");
} else {
  fs.writeFileSync(OUT, render());
  console.log("wrote docs/guides/averna-omniscient-overlord.html");
}
