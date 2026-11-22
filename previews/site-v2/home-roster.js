/* Homepage cards follow explicit pilot -> mech IDs, never array order. */
(function(){
 const host=document.getElementById('pilot-front-grid'),C=window.CAMPAIGN;
 if(!host||!C)return;
 const tagline=document.getElementById('hero-tagline');
 if(tagline)tagline.textContent='Contracts, crew records, and deployments.';
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 host.innerHTML=C.pilots.map(p=>{
  const m=C.mechs.find(m=>m.id===p.mech),thumb=p.img?.replace(/\.png$/,'-thumb.webp');
  return `<article class="pilot-front-card"><div class="pilot-front-portrait"><a href="previews/hangar-v2/?v=2&amp;pilot=${esc(p.id)}" aria-label="Open ${esc(p.name)} pilot dossier"><img src="${esc(thumb||'assets/unit-patch.webp')}" alt="" width="480" height="480" loading="lazy"></a>${m?`<a class="pilot-front-mech" href="previews/hangar-v2/?v=2&amp;mech=${esc(m.id)}"><small>CURRENT MECH</small>${esc(m.name)}</a>`:'<span class="pilot-front-mech">No mech assigned</span>'}</div><div class="pilot-front-copy"><h3><a href="previews/hangar-v2/?v=2&amp;pilot=${esc(p.id)}">${esc(p.name)}</a></h3><p>${esc(p.background||'Pilot')}</p></div></article>`;
 }).join('');
})();
