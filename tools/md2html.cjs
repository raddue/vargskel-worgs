/* Render the AVERNA build guide markdown into the site shell as a deployable page.
   Usage: node tools/md2html.cjs            rebuild docs/guides/averna-omniscient-overlord.html
          node tools/md2html.cjs --check    exit non-zero if the page is stale vs the markdown
   Handles only the subset the guide uses: h1-h3, hr, tables, blockquote, ul (wrapped), fenced code.
   check-all.cjs runs --check, so a committed page that drifts from its markdown fails CI. */
const fs = require("fs"), path = require("path");
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

function blocks(lines) {
  const H = [];
  let afterH1 = false;
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
      H.push(h[1].length === 1 ? `<h1>${t}</h1>`
        : h[1].length === 2 ? `<div class="section-head"><h2>${t}</h2></div>`
        : `<h3>${t}</h3>`);
      afterH1 = h[1].length === 1;
      continue;
    }
    if (/^---+$/.test(L.trim())) { H.push("<hr>"); continue; }
    if (!L.trim()) continue;
    const buf = [L];                                       // paragraph, wrapped
    while (i + 1 < lines.length && lines[i + 1].trim() && !/^([-#>|`]|\s{2,})/.test(lines[i + 1]))
      buf.push(lines[++i]);
    H.push(`<p${afterH1 ? ' class="lede"' : ""}>${inl(buf.join(" "))}</p>`);
    afterH1 = false;
  }
  return H;
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
  Evasion: "How hard this mech is to hit with ranged and melee attacks."
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

function render() {
  const H = blocks(fs.readFileSync(SRC, "utf8").split("\n"));
  const p = x => "../../" + x;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Vargskel Worgs | The Omniscient Overlord</title>
<link rel="icon" href="${p("assets/favicon.png")}" type="image/png">
<link rel="apple-touch-icon" href="${p("assets/apple-touch-icon.png")}">
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
.guide{max-width:900px}
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
.guide abbr[title]{text-decoration:underline dotted;text-underline-offset:3px;cursor:help;border:0}
</style>
</head>
<body>
<div class="shell">
<div class="topline"><span>VW // TACTICAL DOCTRINE</span><span>BUILD GUIDE · AVERNA</span></div>
<header class="brandrow">
<div class="brand"><div class="mark"><span>W</span></div><div><div class="brand-name">VARGSKEL WORGS</div><div class="brand-sub">TACTICAL WIKI · BUILD GUIDE</div></div></div>
<nav class="nav"><a href="${p("index.html")}#overview">OVERVIEW</a><a href="${p("index.html")}#missions">MISSIONS</a><a href="${p("intel.html")}">INTEL</a><a href="${p("pilots.html")}">PILOTS</a><a href="${p("mechbay.html")}">MECHS</a></nav>
<div class="status">● CREW STATUS: ACTIVE</div>
</header>
<main class="guide">${tooltips(H.join("\n"))}</main>
<footer class="footer"><span>VARGSKEL WORGS / TACTICAL DOCTRINE</span><span>GENERATED FROM averna-omniscient-overlord.md · REBUILD: node tools/md2html.cjs</span></footer>
</div>
</body>
</html>
`;
}

if (process.argv.includes("--check")) {
  const assert = require("assert");
  const nested = blocks(["- parent", "  - child", "- second"]).join("");
  assert.ok(nested.includes("<li>parent<ul><li>child</li></ul></li>"), "nested bullets should render as a nested list, got: " + nested);
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
