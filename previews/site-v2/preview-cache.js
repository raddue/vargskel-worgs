/* Preview-only cache: extends the site's existing service worker without replacing its scope. */
(() => {
  if (!('serviceWorker' in navigator) || !('caches' in window)) return;
  const root = new URL('../../', document.currentScript.src);
  const files = [
    'previews/site-v2/', 'previews/site-v2/index.html', 'previews/site-v2/intel.html',
    'previews/site-v2/campaign.html', 'previews/site-v2/pilots.html', 'previews/site-v2/mechbay.html',
    'previews/site-v2/pilot.html', 'previews/site-v2/mech.html', 'previews/site-v2/loadout.html',
    'previews/site-v2/solstice-rain.html', 'previews/site-v2/vargskel-brothers.html',
    'previews/site-v2/hangar-site.css', 'previews/site-v2/home-roster.js', 'previews/site-v2/preview-links.js',
    'previews/site-v2/preview-cache.js', 'previews/site-v2/planet.webp', 'previews/hangar-v2/',
    'previews/hangar-v2/index.html', 'previews/hangar-v2/select.js', 'previews/hangar-v2/select.css',
    'previews/hangar-v2/select-records.js'
  ];
  navigator.serviceWorker.register(new URL('previews/sw-preview.js', root), {scope:new URL('previews/', root).pathname}).then(() => navigator.serviceWorker.ready).then(() => caches.open('hangar-preview-cache-v1'))
    .then(cache => cache.addAll(files.map(f => new URL(f, root).href)))
    .catch(err => console.warn('Preview offline cache unavailable:', err));
})();
