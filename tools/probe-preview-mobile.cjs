// Browser probe, separate from the DOM-only check-all suite. Serve the repo locally first.
// Set NODE_PATH for Playwright, CHROMIUM_PATH for a standalone Chromium, and PREVIEW_URL for the server.
const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const base = new URL('previews/', process.env.PREVIEW_URL || 'http://127.0.0.1:18746/');
const failures = [];
async function check(label, run) {
  try { await run(); } catch (e) { failures.push(`${label}: ${e.message}`); }
}
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
  try {
    for (const width of [320, 390, 768, 1440]) {
      const page = await browser.newPage({ viewport: { width, height: 844 }, isMobile: width < 600, hasTouch: width < 600, reducedMotion: 'reduce', serviceWorkers: 'block' });
      page.setDefaultTimeout(3000);
      const visit = route => page.goto(new URL(route, base).href, { waitUntil: 'domcontentloaded' });
      for (const route of ['site-v2/', 'site-v2/campaign.html', 'site-v2/solstice-rain.html', 'site-v2/intel.html#map', 'site-v2/pilots.html', 'site-v2/mechbay.html', 'site-v2/loadout.html', 'site-v2/pilot.html#daemon', 'site-v2/mech.html#averna', 'site-v2/vargskel-brothers.html']) {
        await visit(route);
        await check(`${width} ${route} viewport`, async () => {
          const actual = await page.evaluate(() => document.documentElement.scrollWidth);
          assert.equal(actual, width);
        });
      }
      await visit('site-v2/');
      if (width < 600) await check(`${width} compact masthead and touch navigation`, async () => {
        const [hero, nav] = await Promise.all([page.locator('#overview').boundingBox(), page.locator('.nav a').first().boundingBox()]);
        assert.ok(hero.height < 240, `hero height ${hero.height} with patch`);
        assert.ok(nav.height >= 44, `navigation target ${nav.height}px tall`);
      });
      await check(`${width} overview stays in preview`, async () => {
        await page.locator('.nav a').first().click();
        assert.match(page.url(), /\/previews\/site-v2\/(?:index\.html)?#overview$/);
      });
      await visit('site-v2/campaign.html');
      await check(`${width} operation order anchor stays in preview`, async () => {
        await page.locator('.opord-toc a').first().click();
        assert.match(page.url(), /\/previews\/site-v2\/campaign\.html#opord-001-/);
      });
      if (width < 600) await check(`${width} session ledger can scroll via keyboard`, async () => {
        const scroll = page.locator('#ledger-body > div:has(> .threads-table)').first();
        assert.equal(await scroll.getAttribute('tabindex'), '0');
        await scroll.focus();
        await page.keyboard.press('ArrowRight');
        await page.waitForFunction(() => document.activeElement.scrollLeft > 0);
      });
      await visit('site-v2/intel.html#map');
      await check(`${width} intelligence tabs and Back preserve page`, async () => {
        await page.locator('#tl-relations').click();
        assert.match(page.url(), /\/previews\/site-v2\/intel\.html#relations$/);
        await page.goBack();
        assert.match(page.url(), /\/previews\/site-v2\/intel\.html#map/);
        assert.equal(await page.locator('#tl-map').getAttribute('aria-selected'), 'true');
      });
      await visit('site-v2/');
      await check(`${width} command-palette keyboard navigation stays in preview`, async () => {
        await page.locator('#palette-toggle').click();
        await page.locator('#palette-input').fill('Daemon');
        await page.locator('#palette-input').press('Enter');
        await page.waitForURL('**/previews/site-v2/pilot.html#daemon');
      });
      await visit('hangar-v2/?v=2&pilot=daemon');
      await check(`${width} Hangar paired record`, async () => {
        assert.match(await page.locator('.counterpart').evaluate(a => a.pathname + a.search), /\/previews\/hangar-v2\/\?mech=averna$/);
        if (width < 600) {
          assert.ok(await page.locator('.hangar .details').evaluate(e => e.scrollHeight <= e.clientHeight));
        }
      });
      await check(`${width} Hangar roster history and artwork dialog`, async () => {
        await page.locator('.tile').nth(1).click();
        assert.match(page.url(), /pilot=dusty/);
        await page.locator('#mech-mode').click();
        assert.match(page.url(), /mech=tombstone/);
        await page.goBack();
        assert.match(page.url(), /pilot=dusty/);
        await page.locator('.art-open').click({ position: { x: 70, y: 30 } });
        assert.equal(await page.locator('dialog').evaluate(e => e.open), true);
        await page.keyboard.press('Escape');
        assert.equal(await page.locator('dialog').evaluate(e => e.open), false);
      });
      await page.close();
    }
  } finally { await browser.close(); }
  assert.equal(failures.length, 0, `Browser probe failures:\n${failures.join('\n')}`);
  console.log('Preview mobile browser probe passed at 320, 390, 768 and 1440px');
})().catch(e => { console.error(e.message); process.exitCode = 1; });
