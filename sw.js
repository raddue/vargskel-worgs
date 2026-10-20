/* #21 offline shell: the pages, their scripts and stylesheets, the self-hosted faces, the two icons
   a launcher installs from, and every portrait thumbnail, so a cold load of mechbay.html or a dossier
   works with no signal at the table. Install precaches that list once; every later same-origin GET is
   network-first, so an online visit always gets the current file and the cache only answers when the
   network does not.

   What is deliberately not precached: the full-size source plates and the hero art (patch, Averna,
   Nov Elysia at ~2MB each) and the social share card. A page renders its images <picture> webp-first,
   so a browser that supports webp never asks for the plate; anything not in the list is cached on
   first view like any other miss. Pre-caching ~60MB of source art would make the install far too
   heavy over cell data, which is where a phone takes it.

   check-all pins this list: every entry has to exist on disk (addAll is all-or-nothing, so one dead
   entry installs no shell at all), the pages, scripts, stylesheets, fonts and thumbnails all have to
   be present, and the total has to stay inside the install budget. */
const CACHE = "vw-offline-v1";

const PAGES = [
  "index.html",
  "intel.html",
  "campaign.html",
  "pilots.html",
  "mechbay.html",
  "mech.html",
  "pilot.html",
  "solstice-rain.html",
  "loadout.html",
  "docs/guides/averna-omniscient-overlord.html",
];

const CODE = [
  "campaign.js",
  "detail.js",
  "archive.js",
  "catalogue.js",
  "loadout.js",
  "compact.js",
  "offline.js",
  "palette.js",
  "style.css",
  "theme.css",
  "manifest.webmanifest",
];

const MARKS = [
  "assets/favicon.png",
  "assets/apple-touch-icon.png",
  "assets/icon-192.png",
  "assets/icon-512.png",
];

const FONTS = [
  "assets/fonts/chakra-petch-400-latin.woff2",
  "assets/fonts/chakra-petch-400-latin-ext.woff2",
  "assets/fonts/chakra-petch-500-latin.woff2",
  "assets/fonts/chakra-petch-500-latin-ext.woff2",
  "assets/fonts/chakra-petch-600-latin.woff2",
  "assets/fonts/chakra-petch-600-latin-ext.woff2",
  "assets/fonts/chakra-petch-700-latin.woff2",
  "assets/fonts/chakra-petch-700-latin-ext.woff2",
];

const THUMBS = [
  "assets/alba-thumb.webp",
  "assets/ambassador-bannerjee-thumb.webp",
  "assets/averna-thumb.webp",
  "assets/cairn-thumb.webp",
  "assets/captain-farris-thumb.webp",
  "assets/cressidium-thumb.webp",
  "assets/district-thumb.webp",
  "assets/dock-thumb.webp",
  "assets/dropzone-thumb.webp",
  "assets/dusty-thumb.webp",
  "assets/elysia-thumb.webp",
  "assets/harrow-thumb.webp",
  "assets/industry-thumb.webp",
  "assets/kessen-thumb.webp",
  "assets/pell-thumb.webp",
  "assets/rio-thumb.webp",
  "assets/rurik_vargskel-thumb.webp",
  "assets/scooteroo-thumb.webp",
  "assets/scooter-thumb.webp",
  "assets/skaldr-thumb.webp",
  "assets/spook-thumb.webp",
  "assets/sten-thumb.webp",
  "assets/tarn-thumb.webp",
  "assets/tizona-thumb.webp",
  "assets/tombstone-thumb.webp",
  "assets/vsaf-thumb.webp",
  "assets/xxxg-01h-thumb.webp",
];

const FILES = [].concat(PAGES, CODE, MARKS, FONTS, THUMBS);

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  if (new URL(req.url).origin !== self.location.origin) return;
  /* respondWith is called before anything is awaited: the browser only accepts it during dispatch,
     and a handler that awaits first leaves the request unanswered. */
  e.respondWith(
    fetch(req).then(res => {
      /* Only a real same-origin response is worth keeping: a 404 or an opaque cross-origin reply
         would pin itself in the cache and outlive the mistake. */
      if (res && res.ok && res.type === "basic") {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
      }
      return res;
    }).catch(() => caches.match(req))
  );
});