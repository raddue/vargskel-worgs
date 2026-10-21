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

/* Contents rail: the site's own sidebar pattern (section-head + card) so it sits on the
   right the way every other page's aside does. */
const tocNav = toc => !toc.length ? "" :
  `<div class="section-head"><h2>SECTIONS</h2><span>BUILD GUIDE</span></div>` +
  `<div class="card"><div class="card-pad gtoc"><ol>` +
  toc.map(([id, t, lvl]) => `<li${lvl ? ' class="sub"' : ""}><a href="#${id}">${t}</a></li>`).join("") +
  `</ol></div></div>`;

function blocks(lines) {
  const H = [], toc = [];
  let sec = false, afterH1 = false, title = "";
  seenIds.clear();
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
        H.push(`<details class="gsec" id="${id}"${sec ? "" : " open"}><summary><h2>${t}</h2><span class="gcaret"></span></summary>`);
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

function render() {
  seenIds.clear(); /* ids are per-render, so the selftest can render twice and compare */
  const { H, toc } = blocks(fs.readFileSync(SRC, "utf8").split("\n"));
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
<meta property="og:description" content="Build guide: GMS Chomolungma into HORUS Goblin and SSC Swallowtail, LL0-LL6.">
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
.guide .columns>.aside{position:sticky;top:18px;align-self:flex-start}
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
.guide .gtoc ol{margin:0;padding:0;list-style:none}
.guide .gtoc li{font:13px var(--mono);margin:0 0 6px;color:var(--text)}
.guide .gtoc li.sub{padding-left:15px;color:var(--muted)}
.guide .gtoc a:hover,.guide .gtoc a:focus-visible{color:var(--cyan)}
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
<main class="guide"><div class="columns"><div class="primary fill">${tooltips(H.join("\n"))}\n${glossary(toc)}</div>
<aside class="aside fill">${tocNav(toc)}</aside></div></main>
<footer class="footer"><span>VARGSKEL WORGS / TACTICAL DOCTRINE</span><span>GENERATED FROM averna-omniscient-overlord.md · REBUILD: node tools/md2html.cjs</span></footer>
</div>
<script>/* sections below the first start collapsed; a rail link must open the one it points into */
document.querySelectorAll(".aside a[href^='#']").forEach(a => a.addEventListener("click", () => {
  const t = document.getElementById(a.hash.slice(1));
  if (t) { const d = t.closest("details"); if (d) d.open = true; }
}));</script>
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
