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
    `<a href="${home}#missions">MISSIONS</a>` +
    `<a href="${prefix}intel.html">INTEL</a>` +
    `<a href="${prefix}campaign.html">CAMPAIGN</a>` +
    `<a href="${prefix}pilots.html">PILOTS</a>` +
    `<a href="${prefix}mechbay.html">MECHS</a>` +
    `<a href="${prefix}loadout.html">LOADOUT</a></nav>`;
};

const status = value => `<div class="status">${STATUS_LABEL}: ${value}</div>`;
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

module.exports = { STATUS_LABEL, statusRe, nav, status, topline, brand, hero, heroArt, PATCH };

if (process.argv.includes("--selftest")) {
  const assert = require("assert");
  assert.strictEqual(nav().match(/href="/g).length, 7, "nav carries seven links");
  assert.ok(nav().includes('<a href="loadout.html">LOADOUT</a>'), "the loadout sandbox is reachable");
  assert.ok(nav().startsWith('<nav class="nav"><a href="index.html#overview">'), "root pages link to index.html");
  assert.ok(nav("", true).includes('<a href="#overview">'), "index.html keeps its same-page anchors");
  assert.ok(nav("../../").startsWith('<nav class="nav"><a href="../../index.html#overview">'), "the guide gets a relative prefix");
  assert.strictEqual(status("UNBRIEFED"), '<div class="status">● DEPLOYMENT STATUS: UNBRIEFED</div>', "the chip carries the shared label with a page value");
  assert.ok(!statusRe.test("● CREW STATUS: ACTIVE"), "the label may not vary");
  // a hero without a photo still fills its right side
  assert.ok(hero({ eyebrow: "E", title: "T", deck: "D" }).includes('src="assets/vargskel_worgs_patch_transparent.png"'), "hero should fall back to the unit patch");
  assert.ok(hero({ eyebrow: "E", title: "T", prefix: "../../", art: "assets/averna.png" }).includes('src="../../assets/averna.png"'), "hero should take a relative prefix and a page photo");
  assert.ok(!hero({ eyebrow: "E", title: "T" }).includes("<p>"), "hero should omit an empty deck");
  console.log("chrome selftest ok: nav and status label are shared, values are not");
}