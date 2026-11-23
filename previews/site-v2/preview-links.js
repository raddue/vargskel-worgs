/* Shared renderers resolve assets against <base>. Keep archive navigation in the preview. */
(() => {
  const here = new URL(location.href);
  const checkout = new URL(document.baseURI);
  const routes = new Set(['index', 'campaign', 'intel', 'pilot', 'pilots', 'mech', 'mechbay', 'loadout', 'solstice-rain', 'vargskel-brothers'].map(page => `${page}.html`));

  function rewrite(link) {
    const raw = link.getAttribute('href');
    if (!raw) return;
    if (raw.startsWith('#')) {
      link.href = new URL(raw, here).href;
      return;
    }
    const url = new URL(link.href);
    const route = url.pathname.slice(checkout.pathname.length);
    if (url.origin === checkout.origin && url.pathname.startsWith(checkout.pathname) && routes.has(route)) {
      link.href = new URL(`previews/site-v2/${route}${url.search}${url.hash}`, checkout).href;
    }
  }

  function enhance(root) {
    if (root.matches('a[href]')) rewrite(root);
    root.querySelectorAll('a[href]').forEach(rewrite);
  }
  enhance(document.body);
  new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) if (node.nodeType === Node.ELEMENT_NODE) enhance(node);
    }
  }).observe(document.body, { childList: true, subtree: true });

  // The shared palette's Enter handler uses the unprefixed search index rather than the row URL.
  document.addEventListener('keydown', event => {
    if (event.key !== 'Enter' || event.target.id !== 'palette-input') return;
    const row = document.querySelector('#palette .palette-row.active');
    if (!row) return;
    event.preventDefault();
    event.stopPropagation();
    row.click();
  }, true);
})();
