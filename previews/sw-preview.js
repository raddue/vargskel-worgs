/* Scope limited to previews; shared root-shell assets remain in the site's existing caches. */
self.addEventListener('install',e=>e.waitUntil(self.skipWaiting()));
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
self.addEventListener('fetch',e=>{
 if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;
 e.respondWith(fetch(e.request).catch(async()=>{
  const exact=await caches.match(e.request);if(exact)return exact;
  if(e.request.mode==='navigate'&&new URL(e.request.url).pathname.includes('/previews/hangar-v2/'))return caches.match(e.request,{ignoreSearch: true});
  return Response.error();
 }));
});
