/* The site chrome in one place: the nav and the status chip are the same on every page, so
   they live here. The seven hand-written pages keep their own copy of this markup and
   check-all.cjs compares theirs to these strings, which turns silent drift into a failing
   check that names the page. The guide page consumes them directly (tools/md2html.cjs).

   Page-specific text is deliberately NOT here: every page names itself in .topline and
   .brand-sub, and the status VALUE varies by state (ACTIVE on the roster pages, UNBRIEFED
   on solstice-rain.html). Only the label is fixed. */

const STATUS_LABEL = "● DEPLOYMENT STATUS";
const statusRe = /^● DEPLOYMENT STATUS: [A-Z]+$/;

/* prefix: "" at the site root, "../../" from docs/guides/.
   samePageHome: true only on index.html, whose OVERVIEW and MISSIONS are same-page anchors. */
const nav = (prefix = "", samePageHome = false) => {
  const home = samePageHome ? "" : prefix + "index.html";
  return `<nav class="nav">` +
    `<a href="${home}#overview">OVERVIEW</a>` +
    `<a href="${prefix}intel.html">INTEL</a>` +
    `<a href="${prefix}campaign.html">CAMPAIGN</a>` +
    `<a href="${prefix}pilots.html">PILOTS</a>` +
    `<a href="${prefix}mechbay.html">MECHS</a>` +
    `</nav>`;
};

const status = value => `<div class="status">${STATUS_LABEL}: ${value}</div>`;
/* #20 phone density: the one control that turns the tighter layout on, next to the status chip,
   so every page reaches it. compact.js is its only writer. */
const compactToggle = () => `<button class="compact-toggle" id="compact-toggle" type="button" aria-pressed="false" title="Denser type and tighter tables">COMPACT</button>`;
/* #19 palette: a visitor who does not know Ctrl-K can still find the search, in the same row as the
   density chip. palette.js is its only writer, and it ships only on the pages that load that file. */
const paletteToggle = () => `<button class="palette-toggle" id="palette-toggle" type="button" title="Search every record (Ctrl-K)">SEARCH</button>`;
/* #1 colour themes: the third control in the row, so a visitor can reach the ice tint without the
   console. theme.js is its only writer, and it ships only on the pages that load that file. */
const themeToggle = () => `<button class="theme-toggle" id="theme-toggle" type="button" aria-pressed="false" title="Ice-blue palette from the unit logo">ICE</button>`;
const topline = (left, right) => `<div class="topline"><span>${left}</span><span>${right}</span></div>`;
const brand = sub => `<div class="brand"><div class="mark"><span>W</span></div>` +
  `<div><div class="brand-name">VARGSKEL WORGS</div><div class="brand-sub">${sub}</div></div></div>`;

/* The page header block (eyebrow / title / deck). Pages with a photo pass art; pages without one
   fall back to the unit patch, so the right side of the hero is never empty. */
const PATCH = "assets/vargskel_worgs_patch_transparent.png";
const heroArt = (prefix = "", art = PATCH, alt = "Vargskel Worgs unit patch") =>
  `<div class="hero-art"><div class="plate plate-raw"><img class="hero-mech-img" src="${prefix}${art}" alt="${alt}"></div></div>`;
const hero = ({ eyebrow, title, deck, id, prefix = "", art, alt }) =>
  `<section class="hero"${id ? ` id="${id}"` : ""}><div class="hero-copy">` +
  `<div class="eyebrow">${eyebrow}</div><h1>${title}</h1>${deck ? `<p>${deck}</p>` : ""}</div>` +
  heroArt(prefix, art, alt) + `</section>`;

module.exports = { STATUS_LABEL, statusRe, nav, status, compactToggle, paletteToggle, themeToggle, topline, brand, hero, heroArt, PATCH };

if (process.argv.includes("--selftest")) {
  const assert = require("assert");
  assert.strictEqual(nav().match(/href="/g).length, 5, "nav carries five links");
  assert.ok(!nav().includes("loadout.html"), "the sandbox is not a nav destination");
  assert.ok(nav().startsWith('<nav class="nav"><a href="index.html#overview">'), "root pages link to index.html");
  assert.ok(nav("", true).includes('<a href="#overview">'), "index.html keeps its same-page anchors");
  assert.ok(nav("../../").startsWith('<nav class="nav"><a href="../../index.html#overview">'), "the guide gets a relative prefix");
  assert.strictEqual(status("UNBRIEFED"), '<div class="status">● DEPLOYMENT STATUS: UNBRIEFED</div>', "the chip carries the shared label with a page value");
  assert.ok(!statusRe.test("● CREW STATUS: ACTIVE"), "the label may not vary");
  assert.ok(compactToggle().startsWith('<button class="compact-toggle"'), "the density control is a button");
  assert.ok(compactToggle().includes('aria-pressed="false"'), "the density control starts unpressed, so a screen reader reads the stored state compact.js sets");
  assert.ok(!nav().includes("compact-toggle"), "the density control is not a nav destination");
  assert.ok(paletteToggle().startsWith('<button class="palette-toggle"'), "the palette control is a button");
  assert.ok(paletteToggle().includes('id="palette-toggle"'), "palette.js finds the control by that id");
  assert.ok(/Ctrl-K/.test(paletteToggle()), "the control names the shortcut, which is the only other way in");
  assert.ok(themeToggle().startsWith('<button class="theme-toggle"'), "the theme control is a button");
  assert.ok(themeToggle().includes('id="theme-toggle"'), "theme.js finds the control by that id");
  assert.ok(themeToggle().includes('aria-pressed="false"'), "the theme control starts unpressed, so a screen reader reads the stored state theme.js sets");
  assert.ok(!nav().includes("theme-toggle"), "the theme control is not a nav destination");
  // a hero without a photo still fills its right side
  assert.ok(hero({ eyebrow: "E", title: "T", deck: "D" }).includes('src="assets/vargskel_worgs_patch_transparent.png"'), "hero should fall back to the unit patch");
  assert.ok(hero({ eyebrow: "E", title: "T", prefix: "../../", art: "assets/averna.png" }).includes('src="../../assets/averna.png"'), "hero should take a relative prefix and a page photo");
  assert.ok(!hero({ eyebrow: "E", title: "T" }).includes("<p>"), "hero should omit an empty deck");
  console.log("chrome selftest ok: nav and status label are shared, values are not; one density control");
}