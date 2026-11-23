const assert=require("node:assert/strict"),fs=require("node:fs");
const s=fs.readFileSync("previews/hangar-v2/select-records.js","utf8");
assert.match(s,/UI\.pilotDossier/,"pilot full record must reuse canonical renderer");
assert.match(s,/UI\.mechDossier/,"mech full record must reuse canonical renderer");
assert.doesNotMatch(s,/Deployment and detailed history remain available/,"history must not be deferred to production");
assert.match(s,/canonicalAssets/,"canonical artwork resolves from project root");
for (const id of ["overview", "missions", "readiness"]) assert.ok(fs.readFileSync("previews/site-v2/index.html","utf8").includes(`id="${id}"`));
assert.match(fs.readFileSync("previews/site-v2/preview-cache.js","utf8"),/hangar-preview-cache-v1/,"preview offline shell registered");
assert.match(fs.readFileSync("previews/sw-preview.js","utf8"),/ignoreSearch: true/,"preview deep links work offline");
assert.doesNotMatch(fs.readFileSync("previews/hangar-v2/index.html","utf8"),/Long names|id="stress"/,"test-only long-name control must not appear");
assert.doesNotMatch(fs.readFileSync("previews/hangar-v2/index.html","utf8"),/proto-picker/,"chosen Hangar has no variant picker");
for (const p of fs.readdirSync("previews/site-v2").filter(n=>n.endsWith(".html"))) assert.doesNotMatch(fs.readFileSync(`previews/site-v2/${p}`,"utf8"),/id="(?:compact|palette|theme)-toggle"|src="(?:compact|palette|theme)\.js"/,`${p}: removed header tools`);
assert.match(fs.readFileSync("previews/site-v2/hangar-site.css","utf8"),/hero-actions\s*\{\s*display\s*:\s*none/,"preview mech action bar hidden");
assert.match(fs.readFileSync("previews/site-v2/index.html","utf8"),/src="assets\/unit-patch\.webp"[^>]*alt="Vargskel Worgs unit patch"/,"overview displays unit logo");
assert.match(fs.readFileSync("previews/site-v2/hangar-site.css","utf8"),/pilot-card-outline/,"clipped pilot cards have complete outline");
for(const p of fs.readdirSync("previews/site-v2").filter(n=>n.endsWith(".html"))){const s=fs.readFileSync(`previews/site-v2/${p}`,"utf8"); assert.doesNotMatch(s,/href="(?:previews\/site-v2\/index\.html)?#overview"/,`${p}: overview must start at page top`)}
for(const p of fs.readdirSync("previews/site-v2").filter(n=>n.endsWith(".html"))){const s=fs.readFileSync(`previews/site-v2/${p}`,"utf8");if(s.includes("class=\"nav\"")){assert.match(s,/href="previews\/hangar-v2\/\?pilot=/,`${p}: pilot nav enters hangar`);assert.match(s,/href="previews\/hangar-v2\/\?mech=/,`${p}: mech nav enters hangar`)}}
assert.match(fs.readFileSync("previews/site-v2/hangar-site.css","utf8"),/\.hero\s*\{\s*border-top:\s*0/,"hero top rule removed consistently");
assert.match(fs.readFileSync("previews/site-v2/hangar-site.css","utf8"),/pilot-front-card:hover[^\n]*pilot-card-outline/,"profile card hover highlight");
assert.match(fs.readFileSync("previews/hangar-v2/index.html","utf8"),/aria-label="Site navigation"/,"Hangar navigation exists");
assert.match(fs.readFileSync("previews/hangar-v2/index.html","utf8"),/class="brandrow"/,"Hangar uses shared site header");
assert.match(fs.readFileSync("previews/hangar-v2/index.html","utf8"),/DEPLOYMENT STATUS/,"Hangar retains shared status");
assert.match(fs.readFileSync("previews/hangar-v2/select-records.js","utf8"),/horus--subtle/,"Horus markup preserved safely");
assert.match(fs.readFileSync("previews/hangar-v2/select-records.js","utf8"),/canonicalHorus/,"full dossier safely restores HORUS markup");
console.log("complete records checks passed");
