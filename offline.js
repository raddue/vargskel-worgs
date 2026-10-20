/* #21 offline shell. Registering waits for the load event so the worker never competes with the
   first paint over the connection the reader is waiting on. The worker lives at sw.js in the site
   root, and the manifest link every page already carries is that page's own root anchor: reading
   the worker's URL from it means the guide in docs/guides/ registers the same root-scoped worker as
   index.html, and the scope covers the whole site. Where service workers are absent (file://, an old
   browser) the page simply behaves as it did before. */
(function () {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
  function register() {
    var link = document.querySelector('link[rel="manifest"]');
    if (!link) return;
    var worker = new URL("sw.js", new URL(".", link.href));
    /* The pathname keeps the registration inside the page's own origin and scope; GitHub Pages
       serves the site from a subdirectory, so an absolute "/sw.js" would point at nothing. */
    navigator.serviceWorker.register(worker.pathname);
  }
  if (document.readyState === "complete") register();
  else window.addEventListener("load", register);
})();