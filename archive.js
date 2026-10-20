/* Shared field-archive UI + patrol animation. Renders campaign.js into whatever
   sections a page declares; every render call is guarded by an element-presence
   check, so a page renders only the sections it includes. */
window.UI=(()=>{
const C=window.CAMPAIGN;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
/* Null-prototype: an id can arrive from the URL, and on an ordinary object an inherited key like
   "constructor" or "toString" resolves as a record - #map/constructor drew a bogus unit file. */
const byId=a=>Object.assign(Object.create(null),Object.fromEntries(a.map(x=>[x.id,x])));
const L=byId(C.locations),P=byId(C.pilots),M=byId(C.mechs),F=byId(C.factions),N=byId(C.personnel);
const legacyPilotId={frisky:"daemon"}; /* pilots renamed after their callsign landed; keep old bookmarks working */
const ops=[...C.ops].sort((a,b)=>String(b.id).localeCompare(String(a.id),undefined,{numeric:true}));
const filed=ops.filter(o=>o.type!=="PLANNED");
const threadsOf=id=>C.threads.filter(t=>t.op===id);
const mechOps=id=>ops.filter(o=>o.mechs.includes(id));
const pilotOps=id=>ops.filter(o=>o.crew.includes(id));
const stationed=id=>{const o=filed.filter(x=>x.mechs.includes(id))[0];return o?o.loc:null};
const el=id=>document.getElementById(id);
const panelHome=()=>el("holo-detail")||document.body;
const th=(k,v)=>v==null||v===""?"":`<tr><th scope="row">${k}</th><td>${v}</td></tr>`;
const table=r=>`<table class="threads-table operation-table"><tbody>${r}</tbody></table>`;
const chip=(attr,id,label)=>`<button type="button" class="chip" data-${attr}="${esc(id)}">${esc(label)}</button>`;
const link=(href,label)=>`<a class="chip" href="${esc(href)}">${esc(label)}</a>`;
/* A dossier's names are its own links: each one points at the FIELD DETAIL entry that explains
   it, so the reader never leaves the record to find out what a name means. */
const slug=s=>String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");
const talentName=n=>String(n).replace(/\s*\d+$/,"").trim();
const triggerName=s=>String(s).replace(/\s*\(\+\d+\)$/,"").trim();
const refLink=(href,label,ok)=>ok&&href?link(href,label):esc(label);
const pilotEntryId=(p,kind,key)=>`pilot-${slug(p.id)}-${kind}-${slug(key)}`;
const mechEntryId=(m,kind,key)=>`mech-${slug(m.id)}-${kind}-${slug(key)}`;
/* Two of the same weapon on one chassis render one cell each, so only the first takes the id. */
const onceId=(seen,id)=>seen.has(id)?null:(seen.add(id),id);
const notFound=(kind,id)=>`<div class="card"><div class="card-pad"><div class="tag">NOT FOUND</div><div class="muted">No ${kind} record for "${esc(id)}".</div></div></div>`;
const initial=name=>name.replace(/\u201c([^\u201d]*)\u201d/g,"$1").trim()[0]||"\u00b7";
const opLink=o=>`<a href="index.html#op-${esc(o.id)}">OP ${esc(o.id)} · ${esc(o.title)}</a>`; /* dossiers have no op cards of their own; land on the archive entry */
const mechBtn=id=>M[id]?chip("mech",id,M[id].name):"";
const locBtn=id=>L[id]?chip("loc",id,L[id].name):"";
const pilotBtn=id=>P[id]?chip("pilot",id,P[id].name.replace(/\u201c[^\u201d]*\u201d/g,"").replace(/\s+/g," ").trim()):"";
const personBtn=id=>N[id]?chip("person",id,N[id].name):"";
/* Missing principals are recognisable by face as much as by name, so the map pane pairs the two.
   Their img values are already webp thumbs, so these render directly rather than through pic(). */
const personCard=id=>{const p=N[id];return p?`<span class="p-card">${p.img?`<span class="p-face"><img src="${esc(p.img)}" alt="${esc(p.name)}"></span>`:""}${personBtn(id)}</span>`:""};
const pill=(t,c)=>`<span class="pill" style="border-color:var(--${c});color:var(--${c})">${esc(t)}</span>`;
const mechPill=m=>pill(m.state,/^OPERATIONAL/.test(m.state)?"lime":"rust")+(m.conditions||[]).map(c=>pill(c,"rust")).join("");
const hpNow=m=>m.hpNow==null?m.hp:m.hpNow,heatNow=m=>m.heatNow==null?m.heat:m.heatNow,repairsNow=m=>m.repairsNow==null?m.repair:m.repairsNow;
const msize=m=>m.size==null?1:m.size;
const D=()=>window.DETAIL||{};
const thumb=s=>String(s).replace(/\.png$/,"-thumb.webp");
/* every plate crops from the top, which on a portrait art file is its rifle, so a mech record's
   imgFocus aims its own thumb the same way the hero uses it. Pilots have no such field. */
const pic=(s,alt,focus)=>`<div class="plate"><picture><source srcset="${esc(thumb(s))}" type="image/webp"><img src="${esc(s)}" alt="${esc(alt)}"${focus?` style="object-position:${esc(focus)}"`:""}></picture></div>`;
function lightbox(){document.addEventListener("click",e=>{const img=e.target.closest(".hero-art img");if(!img)return;const o=document.createElement("div");o.className="lightbox";o.setAttribute("role","dialog");o.setAttribute("aria-label","Portrait full size, tap to close");o.innerHTML=`<img src="${esc(img.getAttribute("src"))}" alt="${esc(img.alt)}">`;o.addEventListener("click",()=>o.remove());document.body.append(o);});}
const dnote=t=>t?`<div class="detail" style="margin-top:5px;font:15px/1.6 var(--sans)">${esc(t).replace(/&lt;br\s*\/?&gt;/gi,"<br>")}</div>`:"";
const dhead=(n,id)=>`<div class="tag" style="margin-top:10px"${id?` id="${esc(id)}"`:""}>${esc(n)}</div>`;
const dsect=(title,inner)=>inner?`<section><div class="section-head"><h2>${title}</h2><span>FIELD DETAIL</span></div><div class="card"><div class="card-pad">${inner}</div></div></section>`:"";
const dnames=s=>String(s||"").split(",").map(x=>x.trim()).filter(Boolean);
/* weapons/systems live in campaign.js as data; the printed string the dossier and mechbay
   show is derived here, and the golden snapshot pins its exact text. */
const mstr=m=>!(m&&m.mounts&&m.mounts.length)?"":m.mounts.map(x=>`${x.slot}: ${x.weapons.join(" / ")}`).join(" · ");
/* System names are data in campaign.js; the printed text the dossier and mechbay show is
   derived here, and the golden snapshot pins its exact wording. */
const systemString=m=>!(m&&m.systems&&m.systems.length)?"":m.systems.join(", ");
/* #19 palette: which record carries a catalogue name, and the anchor of its FIELD DETAIL entry.
   Owner and id come from the rules the dossiers render with, so a jump lands on the entry it names
   rather than a lookalike. The href carries both, record then entry, the way intel.html's
   #map/<loc> carries two things; the dossier pages split it. Returns "" when nobody fields it. */
const entryOwner=(group,name)=>{
 const kind={weapons:"weapon",systems:"system",frames:"frame",talents:"talent",skills:"trigger",gear:"gear"}[group];
 if(!kind)return "";
 if(kind==="frame"){const m=Object.values(M).find(x=>x.frame===name);const id=m&&mechEntryId(m,"frame",name);return id?{href:"mech.html#"+m.id+"/"+id,id:id}:""}
 if(kind==="weapon"||kind==="system"){
  const m=Object.values(M).find(x=>kind==="weapon"?(x.mounts||[]).some(y=>(y.weapons||[]).indexOf(name)!==-1):dnames(systemString(x)).indexOf(name)!==-1);
  const id=m&&mechEntryId(m,kind,name);return id?{href:"mech.html#"+m.id+"/"+id,id:id}:""}
 const key=kind==="talent"?talentName(name):kind==="trigger"?triggerName(name):name;
 const p=Object.values(P).find(x=>{const raw=kind==="talent"?x.talents:kind==="trigger"?x.triggers:x.gear;
  return dnames(raw).some(n=>(kind==="talent"?talentName(n):kind==="trigger"?triggerName(n):n)===key)});
 const id=p&&pilotEntryId(p,kind,key);return id?{href:"pilot.html#"+p.id+"/"+id,id:id}:"";
};
/* The printed strings above stay the pinned text; these wrap each name in a link to its own FIELD
   DETAIL entry with the same separators, so a row's words do not move when it grows a chip. */
const mstrMarkup=(m,pfx)=>{const d=D(),seen=new Set();return !(m&&m.mounts&&m.mounts.length)?"":m.mounts.map(x=>`${esc(x.slot)}: ${x.weapons.map(w=>{const id=onceId(seen,mechEntryId(m,"weapon",w));return refLink(id&&pfx+id,w,(d.weapons||{})[w])}).join(" / ")}`).join(" · ");};
const systemMarkup=(m,pfx)=>{const d=D(),seen=new Set();return !(m&&m.systems&&m.systems.length)?"":m.systems.map(n=>{const id=onceId(seen,mechEntryId(m,"system",n));return refLink(id&&pfx+id,n,(d.systems||{})[n])}).join(", ");};
const ditems=s=>{const out=[];for(const seg of String(s||"").split("·").map(x=>x.trim()).filter(Boolean)){const mm=seg.match(/^[A-Za-z/ ]+:\s*(.+)$/);for(const it of (mm?mm[1]:seg).split("/").map(x=>x.trim()).filter(Boolean))out.push(it);}return out;};
/* Both dossier pages print the same three name lists, and every name links to the entry that
   explains it: the pilot page's own FIELD DETAIL when the list sits on it, the pilot's when the
   mech page shows the row. */
const pilotRows=(p,pfx)=>{const d=D();
 const row=(kind,entry,raw,map)=>{const names=dnames(raw);return th(kind,names.length?names.map(n=>{const key=entry==="trigger"?triggerName(n):entry==="talent"?talentName(n):n;return refLink(pfx+pilotEntryId(p,entry,key),n,map[key])}).join(", "):"NOT FILED")};
 return [row("TRIGGERS","trigger",p.triggers,d.skills||{}),row("TALENTS","talent",p.talents,d.talents||{}),row("GEAR","gear",p.gear,d.gear||{})];};
function detailPilot(p){const d=D();if(!d.talents&&!d.gear&&!d.skills)return "";
 /* A talent and a trigger carry their rank or bonus in the record ("Hacker 1", "Hack or Fix
    (+2)"); detail.js keys them without it, so the lookup strips it and the head prints the name. */
 const tal=dnames(p.talents).map(n=>{const key=talentName(n),t=(d.talents||{})[key];if(!t)return "";return dhead(key,pilotEntryId(p,"talent",key))+dnote(t.terse)+(t.ranks||[]).map(r=>dnote("R"+r.rank+" "+r.name+": "+r.description)).join("");}).join("");
 const sk=dnames(p.triggers).map(s=>{const n=triggerName(s),e=(d.skills||{})[n];return e?dhead(n,pilotEntryId(p,"trigger",n))+dnote(e.description):"";}).join("");
 const gear=dnames(p.gear).map(n=>{const g=(d.gear||{})[n];if(!g)return "";return dhead(n,pilotEntryId(p,"gear",n))+dnote([g.type,g.bonuses,g.tags].filter(Boolean).join(" · "))+dnote(g.effect);}).join("");
 return dsect("TALENTS",tal)+dsect("TRIGGER SKILLS",sk)+dsect("GEAR",gear)+`<div class="muted" style="margin-top:10px;font:11px var(--mono)">RULES DATA © MASSIF PRESS (LANCER) · @MASSIF/LANCER-DATA 3.1.7 · GPL-3.0-OR-LATER</div>`;}
function detailMech(m){const d=D();if(!d.weapons&&!d.systems)return "";
 const items=ditems(mstr(m)).map(n=>[n,(d.weapons||{})[n]]).filter(x=>x[1]);
 const entrySeen=new Set();
 const seen={};items.forEach(x=>{if(x[1].desc)seen[x[1].desc]=(seen[x[1].desc]||0)+1});
 const kw=(k,v)=>th(k,esc(v||"—"));
 const stat=w=>table(kw("MOUNT",w.mount)+kw("TYPE",w.type)+kw("DAMAGE",w.damage)+kw("RANGE",w.range)+kw("TAGS",w.tags)+kw("LICENSE",w.license));
 /* One blurb covers every weapon of a manufacturer, so it prints once above the list rather than per weapon. */
 const blurb=[...new Set(items.map(x=>x[1].desc).filter(t=>t&&seen[t]>1))].map(t=>dnote(t)).join("");
 /* Each weapon is one grid cell, so a wide monitor reads two or three across instead of one
    full-width stack each. The blurb stays outside the grid: it covers the whole section. */
 const wep=`<div class="wep-grid">`+items.map(([n,w])=>`<div class="weapon">`+(dhead(n,onceId(entrySeen,mechEntryId(m,"weapon",n)))+stat(w)+(w.desc&&seen[w.desc]===1?dnote(w.desc):"")+dnote(w.effect)
  +(w.profiles||[]).map(p=>dhead(p.name)+table(kw("DAMAGE",p.damage)+kw("RANGE",p.range)+kw("TAGS",p.tags))+dnote(p.effect)
    +(p.actions||[]).map(a=>dnote((a.name||"")+(a.activation?` (${a.activation})`:"")+": "+a.detail)).join("")).join(""))+`</div>`).join("")+`</div>`;
 const sys=dnames(systemString(m)).map(n=>{const s=(d.systems||{})[n];if(!s)return "";return dhead(n,onceId(entrySeen,mechEntryId(m,"system",n)))+dnote("SP "+s.sp+(s.tags?" · "+s.tags:"")+(s.license?" · "+s.license:""))+dnote(s.effect);}).join("");
 const f=(d.frames||{})[m.frame];
 const fr=f?dhead(m.frame,mechEntryId(m,"frame",m.frame))+dnote([f.source,f.mechtype,"MOUNTS: "+f.mounts].filter(Boolean).join(" · "))+(f.traits||[]).map(t=>dnote(t.name+": "+t.description)).join("")+(f.core?dnote("CORE "+f.core.name+": "+f.core.description):""):"";
 return dsect("MOUNTED WEAPONS",blurb+wep)+dsect("SYSTEMS",sys)+dsect("FRAME",fr);}
const opPill=o=>pill(o.status,/COMPLETED/.test(o.status)?"lime":"rust");
const threadPill=t=>pill(t.status,t.status==="ESCALATING"?"rust":"lime");
const mark=(k,v)=>document.querySelectorAll(".holo-svg .node").forEach(e=>e.classList.toggle("sel",e.dataset[k]===v));
const panel=()=>el("record-detail");
const animatePane=()=>{const p=panel();p.classList.remove("pane-in");void p.offsetWidth;p.classList.add("pane-in")};
const showAtRecord=(host,id)=>{
 const card=document.querySelector(`#${host==="pilot"?"crew-list":"mech-list"} [data-${host}="${CSS.escape(id)}"]`),slot=card&&card.querySelector(`[data-detail-host="${host}"]`);
 if(!slot)return false;
 slot.append(panel());show(host,id);animatePane();panel().focus({preventScroll:true});return true;
};
const toggleRecord=(host,id)=>{
 if(!panel())return false; /* pages without #record-detail (campaign.html) have no detail pane to toggle */
 const card=document.querySelector(`#${host==="pilot"?"crew-list":"mech-list"} [data-${host}="${CSS.escape(id)}"]`);
 if(card&&panel().parentElement===card.querySelector(`[data-detail-host="${host}"]`)){panel().classList.add("pane-out");setTimeout(()=>{if(!panel().classList.contains("pane-out"))return;panelHome().append(panel());panel().classList.remove("pane-out","pane-in")},120);return true}
 return showAtRecord(host,id);
};
/* #record-detail only exists in the map panel, so a chip on the relations or personnel tab has to bring the map forward or its record renders where nobody can see it. */
const showAtMap=(kind,id)=>{if(UI.pickTab)UI.pickTab("map");panelHome().append(panel());show(kind,id);animatePane()};
/* Frames draw the map: SYSTEM is the star's bodies and their orbits, and every other frame is one
   location opened — the planet, the city, the district inside the city. A record's home frame is
   its `frame` value if set, SYSTEM otherwise; a record with no frame and a `parent` also rides its
   parent's ring as a satellite. `level` stays on the record as the scale of the coordinates on it.
   The closed set below is why an unknown kind throws. */
const thumbOf=l=>String(l.img||"").replace(/\.\w+$/,"-thumb.webp");
/* Art bodies are clipped by an SVG clipPath per body, so nothing is masked at build time and no
   new asset format enters the repo; the rim and the terminator are shapes over the clip. */
const artDisc=(l,r,fid)=>{const cid=`clip-${fid}-${l.id}`;
 return `<defs><clipPath id="${cid}"><circle r="${r}"/></clipPath></defs>`+
 `<image href="${esc(thumbOf(l))}" x="${-r}" y="${-r}" width="${r*2}" height="${r*2}" clip-path="url(#${cid})" preserveAspectRatio="xMidYMid slice"/>`+
 `<circle class="rim" r="${r}" fill="none"/>`+
 `<path class="term" d="M0,${-r} A${r},${r} 0 0,0 0,${r} A${Math.max(2,Math.round(r*.55))},${r} 0 0,1 0,${-r}Z"/>`};
const polyPts=(n,r,rot,jag)=>Array.from({length:n},(_,i)=>{const a=rot+2*Math.PI*i/n+(jag&&i%2?Math.PI/n:0),rr=jag&&i%2?r*.72:r;
 return `${(rr*Math.cos(a)).toFixed(1)},${(rr*Math.sin(a)).toFixed(1)}`}).join(" ");
/* The hull outline is the boss's mockup ship at 1x, bow first; the bow is the kind's 46 px drawn
   radius, so the silhouette stays the extent the fit already accounts for. A symmetric hex lens
   is the shape the design's table gives a STATION, not a hull. */
const HULL_PTS=[[-42,6],[10,-14],[46,-2],[30,14],[-24,18]];
const SIL={
 hex:r=>({pts:polyPts(6,r,-Math.PI/6,0),ex:r}),
 jag:r=>({pts:polyPts(8,r,Math.PI/8,1),ex:r}),
 hull:e=>({pts:HULL_PTS.map(([x,y])=>`${(x*e/46).toFixed(1)},${(y*e/46).toFixed(1)}`).join(" "),ex:e})};
const artPlate=(l,r,fid,shape)=>{const cid=`clip-${fid}-${l.id}`,s=SIL[shape](r);
 return `<defs><clipPath id="${cid}"><polygon points="${s.pts}"/></clipPath></defs>`+
 `<image href="${esc(thumbOf(l))}" x="${-s.ex}" y="${-s.ex}" width="${s.ex*2}" height="${s.ex*2}" clip-path="url(#${cid})" preserveAspectRatio="xMidYMid slice"/>`+
 `<polygon class="rim" points="${s.pts}" fill="none"/>`};
/* Ground symbols keep their glyphs: CITY, DISTRICT, FOB and ZONE are plan-view markers and the
   glyph is the right read for them. Worlds become art discs, hardware becomes art on its own
   silhouette. A kind with no renderer throws, exactly as a kind with no marker used to. */
const KINDS={
 PLANET:{k:"k-planet",draw:(l,r,fid)=>artDisc(l,r,fid)},
 MOON:{k:"k-moon",draw:(l,r,fid)=>artDisc(l,r,fid)},
 STATION:{k:"k-station",draw:(l,r,fid)=>artPlate(l,r,fid,"hex")},
 "WRECK FIELD":{k:"k-wreck",draw:(l,r,fid)=>artPlate(l,r,fid,"jag")+`<circle class="shape" r="${r+6}" fill="none" stroke-dasharray="2 3"/>`},
 ORBITAL:{k:"k-orbital",draw:(l,r,fid)=>artPlate(l,r,fid,"hull")},
 CITY:{k:"k-city",draw:()=>`<polygon class="shape" points="0,-9 9,-3 9,6 -9,6 -9,-3"/>`},
 DISTRICT:{k:"k-district",draw:()=>`<polygon class="shape" points="-8,-6 8,-6 8,6 -8,6"/>`},
 FOB:{k:"k-fob",draw:()=>`<polygon class="shape" points="0,-9 9,7 -9,7"/>`},
 ZONE:{k:"k-zone",draw:()=>`<circle class="shape" r="9" fill="none" stroke-dasharray="2 3"/>`}
};
/* Drawn radii are pixel constants at 1x multiplied by the frame's fit scale, like positions:
   one radius per kind, the subject's disc rim at 72, the pin's own 12. Scaling positions but
   not radii is what let a planet's disc swallow its own moon's ring on the mockup, so the two
   are one rule. ponytail: upgrade to per-body radii if the art needs them. */
const RADII={PLANET:54,MOON:30,STATION:26,"WRECK FIELD":9,ORBITAL:46,CITY:9,DISTRICT:8,FOB:9,ZONE:9};
const DISC_RIM=72,PIN_R=12;
/* One 24 px margin on the fit, applied once: labels are excluded from the fit, so this is their
   breathing room (design rev 10, placement). */
const FIT_MARGIN=24;
const ART_KINDS=["PLANET","MOON","STATION","WRECK FIELD","ORBITAL"];
/* The star has no record, so its bearing is declared here and named as invented.
   ponytail: upgrade to a record if the star ever needs a file. */
const STAR_BEARING=270;
const bodyR=(l,role)=>role==="subject"?(ART_KINDS.includes(l.kind)?DISC_RIM:RADII[l.kind]):RADII[l.kind];
const homeOf=l=>(l&&l.frame)||"SYSTEM";
const isSysFrame=fid=>fid==="SYSTEM"||!!(L[fid]&&L[fid].level==="SYSTEM");
/* The frame chain from a frame up to SYSTEM, deepest first. A cycle in the records throws here,
   so the descent stack is always finite and climbing always terminates. */
function chainOf(fid){
 if(fid==null)throw new Error("holomap: no frame asked for");
 if(fid!=="SYSTEM"&&!L[fid])throw new Error(`holomap: ${fid} is not a frame`);
 const out=[],seen=new Set();let f=fid;
 while(f!=="SYSTEM"){
  if(seen.has(f))throw new Error(`holomap: frame cycle at ${f}`);
  seen.add(f);out.push(f);f=L[f].frame||"SYSTEM";
 }
 out.push("SYSTEM");
 return out;
}
/* members(F): the exact set of records a frame draws — its subject, its framed children and its
   frameless satellites, three alternatives that never overlap. That is the clause which keeps
   rio drawn exactly once on elysia now that rio carries both a frame and a parent of elysia.
   SYSTEM is the root and has no subject: it draws every frameless record. */
function members(fid){
 if(fid==="SYSTEM")return C.locations.filter(l=>!l.frame);
 if(!L[fid])throw new Error(`holomap: ${fid} is not a frame`);
 const s=L[fid];
 return [s,...C.locations.filter(l=>l.frame===fid),...C.locations.filter(l=>!l.frame&&l.parent===fid)];
}
/* The system's principal bodies: frameless and parentless, so a moon that stops being a
   principal stops appearing in the locator while keeping its place in members on its planet. */
const principals=()=>C.locations.filter(l=>!l.frame&&!l.parent).map(l=>l.id);
/* Frame meta derives from the subject's kind, not from a level band: a PLANET frame reads ORBIT
   GRID, a CITY frame reads THEATER GRID · 10 U, SYSTEM keeps SECTOR HOLOMAP. No new field: the
   kind is the field. */
const FRAME_META=(subj,isSys)=>{
 if(isSys)return{head:"SECTOR HOLOMAP",sub:"CRESSIDIUM SYSTEM",grid:"SECTOR GRID · 50 U",aria:"Sector holomap: the star's bodies and their orbits. Select a body to read its file."};
 const orbit=ART_KINDS.includes(subj.kind),ground=!orbit&&subj.kind!=="CITY";
 return{head:orbit?"ORBIT HOLOMAP":ground?"GROUND HOLOMAP":"THEATER HOLOMAP",sub:subj.name,
  grid:orbit?"ORBIT GRID":ground?"GROUND GRID":"THEATER GRID",
  /* The lead word tracks the same kind the head and the grid label do, so a DISTRICT frame reads
     GROUND HOLOMAP and Ground holomap, not the theater sentence (design rev 12). */
  aria:orbit?`Orbit holomap of ${subj.name}: the body, what orbits it, and what stands on it. Select a site to read its file.`
   :ground?`Ground holomap of ${subj.name}: the ground, its sites and approaches. Select a site to read its file.`
   :`Theater holomap of ${subj.name}: the ground, its sites and approaches. Select a site to read its file.`}};
let frame=null;
const stack=[];   /* the descent path, deepest last: climbing is exact and a deep link sets it all */
/* Pure: returns the data for one frame — {world,key,grid,aria,head,sub,crumbs,locator,viewR} —
   and touches no DOM. Ops legs are drawn only on the deepest frame holding both ends. */
function holomap(fid){
 const chain=chainOf(fid);
 const isSys=fid==="SYSTEM",subj=isSys?null:L[fid],M=FRAME_META(subj,isSys);
 const mem=members(fid),ids=new Set(mem.map(l=>l.id));
 const CX=500,CY=240,pos=new Map();
 /* The root is exempt from the fit: its nodes are already absolute px in this same 1000x480
    space, so it draws at scale 1 and nothing moves. A descended frame fits its radius (the
    subject's disc rim, or the farthest same-scale member's offset plus that member's radius,
    floored at the disc so a subject-only frame is not drawn at forty times) into the viewBox
    with a single 24 px margin, and positions and drawn radii both carry that scale. The radius
    is computed from the records, never typed per frame (design rev 12). */
 const offsets=new Map();
 mem.forEach(l=>{if(!isSys&&l.id!==fid)offsets.set(l.id,Math.hypot((l.x-subj.x)*10,(l.y-subj.y)*4.8))});
 const frameScale=isSys?"SYSTEM":subj.level;
 const sameScale=mem.filter(l=>l.id!==fid&&l.level===frameScale);
 const pinM=mem.find(l=>l.id!==fid&&l.level!==frameScale);
 const radius=isSys?Math.max(0,...mem.map(l=>Math.hypot(l.x*10-CX,l.y*4.8-CY)))
  :Math.max(DISC_RIM+(pinM?PIN_R:0),...sameScale.map(l=>offsets.get(l.id)+RADII[l.kind]));
 const scale=isSys?1:Math.min(1000,480)/(2*(radius+FIT_MARGIN));
 const viewR=isSys?radius:radius+FIT_MARGIN;
 mem.forEach(l=>{
  if(isSys){pos.set(l.id,{x:l.x*10,y:l.y*4.8});return}
  if(l.id===fid){pos.set(l.id,{x:CX,y:CY});return}
  if(l.level===subj.level){pos.set(l.id,{x:CX+(l.x-subj.x)*10*scale,y:CY+(l.y-subj.y)*4.8*scale});return}
  /* A cross-scale member is placed by declaration, not by arithmetic: an offset means something
     only inside one frame's scale, so a member whose level differs from the frame's scale rides
     the subject's rim at the compass bearing its own record declares. One with no pinBearing of
     its own throws rather than inventing an angle, so a second pin cannot silently land on the
     same rim point. ponytail: the declared bearing is what a one-scale page can honestly draw;
     upgrade to a real projection when a second scale must be measured across, not merely
     positioned. */
  if(typeof l.pinBearing!=="number")throw new Error(`holomap: ${l.id} is cross-scale on ${fid} and carries no pinBearing`);
  const b=l.pinBearing*Math.PI/180,r=DISC_RIM*scale;
  pos.set(l.id,{x:CX+r*Math.sin(b),y:CY-r*Math.cos(b)});
 });
 /* A frame that draws a pin says so in its aria, rather than implying a measured spot. */
 const pinDrawn=!!pinM;
 const ariaOut=pinDrawn?M.aria+" POSITION ON DISC DECLARED.":M.aria;
 /* Only an operation that has actually been flown is "current". Op 001 is planned and unbriefed,
    so a green ring would claim live tracking the record cannot support. When flown, the ground's
    frame ancestors carry the ring too: the op's area sits inside them. */
 const cur=(o=>o&&o.type!=="PLANNED"&&o.status!=="UNBRIEFED"?o.loc:"")(C.ops[0]);
 const curSet=new Set();
 if(cur&&L[cur]){curSet.add(cur);const seen=new Set([cur]);let f=L[cur].frame;
  while(f&&L[f]&&!seen.has(f)){seen.add(f);curSet.add(f);f=L[f].frame}}
 /* Rings are orbits, so only things that orbit get one: a district does not orbit its city. An
    orbit ring takes its own child's radius, whether the parent is the frame's subject (rio over
    elysia) or a satellite (pell over cressidium). */
 const orbitKinds=["MOON","STATION","ORBITAL"];
 const rings=mem.filter(l=>l.parent&&l.parent!==l.id&&orbitKinds.includes(l.kind)&&ids.has(l.parent)).map(l=>{
  const p=pos.get(l.parent),c=pos.get(l.id);
  return `<circle class="ring" data-ring="${esc(l.parent)}" cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${Math.hypot(c.x-p.x,c.y-p.y).toFixed(1)}" fill="none" stroke="var(--line)" stroke-dasharray="3 5"/>`}).join("");
 /* A zone is drawn where its own record says: zone.frame names the frame, and the zone's
    coordinates translate by the frame's subject offset like any other member's. A zone centred
    on a site adds no label: that site's own file already states who holds it. */
 const zones=C.factions.filter(f=>f.zone&&f.zone.frame===fid).map(f=>{const z=f.zone;
  const cx=isSys?z.x*10:CX+(z.x-subj.x)*10*scale,cy=isSys?z.y*4.8:CY+(z.y-subj.y)*4.8*scale;
  const rx=z.rx*scale,ry=z.ry*scale;
  const nearZ=mem.some(l=>Math.hypot(l.x-z.x,l.y-z.y)<5);
  return `<ellipse class="zone" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" rx="${rx.toFixed(1)}" ry="${ry.toFixed(1)}" fill="var(--${esc(z.c)})" fill-opacity=".05" stroke="var(--${esc(z.c)})" stroke-opacity=".35" stroke-dasharray="2 5"/>`+(nearZ?"":`<text class="zl" x="${Math.min(910,Math.max(90,cx)).toFixed(1)}" y="${(cy+ry+14).toFixed(1)}" text-anchor="middle">${esc(f.name.toUpperCase())}</text>`)}).join("");
 /* Ops legs: the route is one list of sites, and a leg is drawn on exactly one frame — the
    deepest whose subject holds both ends — so it never appears twice. An end that is not drawn
    there is represented by the ancestor of it that is (dock stands in as industry on elysia). */
 const legs=["dock",...[...C.ops].sort((a,b)=>String(a.id).localeCompare(String(b.id),undefined,{numeric:true})).map(o=>o.loc)];
 const framesOf=id=>{const out=[id],seen=new Set([id]);let f=L[id]&&L[id].frame;
  while(f&&L[f]&&!seen.has(f)){seen.add(f);out.push(f);f=L[f].frame}
  out.push("SYSTEM");return out};
 const drawnLegs=[];
 const lines=legs.slice(1).map((b,i)=>{const a=legs[i];
  if(!L[a]||!L[b])return "";
  const fb=new Set(framesOf(b)),common=framesOf(a).filter(F=>fb.has(F));
  if(common[0]!==fid)return "";
  const rep=x=>ids.has(x)?x:(framesOf(x).find(F=>F!==fid&&ids.has(F))||null);
  const ra=rep(a),rb=rep(b);if(!ra||!rb||ra===rb)return "";
  drawnLegs.push(b);
  const pa=pos.get(ra),pb=pos.get(rb),plan=!L[b].visited;
  return `<line class="leg" data-leg="${esc(a)}-${esc(b)}" x1="${pa.x.toFixed(1)}" y1="${pa.y.toFixed(1)}" x2="${pb.x.toFixed(1)}" y2="${pb.y.toFixed(1)}" stroke="var(${plan?"--muted":"--lime"})" stroke-width="1.5" stroke-dasharray="${plan?"4 6":"6 6"}" opacity=".7"/>`}).join("");
 /* The star: the one drawn thing here no record supports, so it is declared rather than
    smuggled in. It is not a location: no data-loc, not selectable, no file, and the key says
    so outright. role="img" because an aria-label on a bare <g> is ignored by several readers.
    starRadius is the greatest body-centre distance from the viewBox centre, and the root draws
    at scale 1, so the star cannot slide off the canvas and needs no margin (design rev 12).
    ponytail: an invented constant — no asset exists and none is wanted; upgrade to a record if
    the star ever needs a file. */
 const sbrad=STAR_BEARING*Math.PI/180,sx=CX+radius*Math.sin(sbrad),sy=CY-radius*Math.cos(sbrad);
 const star=isSys?`<g class="star" role="img" data-x="${sx.toFixed(1)}" data-y="${sy.toFixed(1)}" aria-label="Cressidium, the system's primary star, drawn for orientation. It has no file." transform="translate(${sx.toFixed(1)} ${sy.toFixed(1)})">`+
  `<circle r="30" fill="var(--cyan)" opacity=".10"/><circle r="18" fill="var(--cyan)" opacity=".25"/><circle r="8" fill="var(--cyan)"/>`+
  [0,45,90,135,180,225,270,315].map(a=>{const c=Math.cos(a*Math.PI/180),s=Math.sin(a*Math.PI/180);
   return `<line x1="${(11*c).toFixed(1)}" y1="${(11*s).toFixed(1)}" x2="${(22*c).toFixed(1)}" y2="${(22*s).toFixed(1)}" stroke="var(--cyan)" stroke-width="1.5" opacity=".55"/>`}).join("")+`</g>`:"";
 /* The far grid texture is the fixed 50 px pattern from the page skeleton, drawn in the root's
    own coordinate units where the root draws at 1 (design rev 12), so it is not part of the
    world's scaled group. */
 const farGrid="";
 /* The console's plan badges: insertion, rendezvous and extraction ground off the op, plus the
    hostile areas and the muster hull. situation() owns the roles, the map only draws them. One
    ground can hold two roles — the Rio Grande is both the extraction destination and the
    recorded muster hull — so a location maps to a list of badges, not whichever was pushed last. */
 const marks=new Map();
 situation().badges.forEach(b=>{const a=marks.get(b.loc)||[];a.push(b);marks.set(b.loc,a)});
 /* Labels are drawn after the bodies and are not part of the fit, so two of them land on each
    other as soon as bodies sit close: the site label hanging under a member printed straight
    across the subject's name. A label is nudged clear of what this frame has already drawn, down
    when it hangs under a body and up when it stacks above one, and stops after four rows rather
    than walk out of the frame (design rev 12: the collision pass the label deferral named, and
    it fired because the crowded frames carry more than six labelled members). */
 const placed=[],ADV=8.4; /* 12px badge labels plus .1em tracking is the widest class, so it sets the
                          estimate for every label; over-estimating only buys space. */
 const clear=(x,y,txt,dir)=>{
  for(let k=0;k<4;k++){
   if(!placed.some(q=>Math.abs(q.y-y)<16&&Math.abs(q.x-x)<(q.txt.length+txt.length)*ADV/2)){placed.push({x,y,txt});return y}
   y+=dir*16;
  }
  placed.push({x,y,txt});return y;
 };
 const nodes=mem.map(l=>{
  const K=KINDS[l.kind];
  if(!K)throw new Error(`holomap: ${l.id} is a ${l.kind}, which has no renderer`);
  /* A framed site hangs under the body it sits on, and only while it is not drawn here itself. */
  const hosts=C.locations.filter(x=>x.frame===l.id&&!ids.has(x.id)),bs=marks.get(l.id)||[],p=pos.get(l.id);
  /* A drawn radius is a pixel constant times the fit scale, like a position: art bodies scale,
     ground glyphs keep their own size because their points are the extent (design rev 12). */
  const role=l.id===fid?"subject":"member",gm=bodyR(l,role),r=ART_KINDS.includes(l.kind)?gm*scale:gm;
  const labY=(l.ly!=null?l.ly:Math.max(r+14,l.kind==="PLANET"?36:30));
  const nameY=clear(p.x,p.y+labY,l.name,1)-p.y;
  return `<g class="node${members(l.id).length>1?" body":""}${l.visited?"":" unv"}${curSet.has(l.id)?" cur":""}${bs.map(b=>" badge-"+b.role).join("")}" data-loc="${esc(l.id)}" data-x="${p.x.toFixed(1)}" data-y="${p.y.toFixed(1)}" transform="translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})" role="button" tabindex="0" aria-label="${esc(l.kind)} ${esc(l.name)}${l.visited?"":", unvisited"}${curSet.has(l.id)?", current operation":""}${bs.length?", "+esc(bs.map(b=>b.label).join(", ")):""}${hosts.length?`, ${hosts.length} local site${hosts.length>1?"s":""}`:""}">`+
  `<circle r="${Math.max(28,r)}" fill="transparent"/>`+K.draw(l,r,fid)+
  `<text y="${nameY}" text-anchor="middle">${esc(l.name)}</text>`+
  hosts.map((h,i)=>{const y=clear(p.x,p.y+labY+12+i*12,h.name+" SITE",1)-p.y;return `<text class="site" y="${y}" text-anchor="middle">${esc(h.name)} SITE</text>`}).join("")+
  bs.map((b,i)=>{const y=clear(p.x,p.y-(Math.max(r,13)+17)-i*12,b.label,-1)-p.y;return `<text class="badge-label" y="${y}" text-anchor="middle">${esc(b.label)}</text>`}).join("")+`</g>`}).join("");
 const kinds=mem.map(l=>l.kind).filter((k,i,a)=>a.indexOf(k)===i);
 const key=kinds.map(k=>`<li><span class="k-shape ${KINDS[k].k}"></span>${esc(k)}</li>`).join("")
  +(isSys?`<li><span class="k-shape k-star"></span>STAR · NO FILE</li>`:"")
  +(mem.some(l=>!l.visited)?`<li><span class="k-shape k-unv"></span>UNVISITED</li>`:"")
  +(mem.some(l=>curSet.has(l.id))?`<li><span class="k-shape k-cur"></span>CURRENT OP</li>`:"")
  +(drawnLegs.some(id=>L[id].visited)?`<li><span class="k-line"></span>TRAVELLED</li>`:"")
  +(drawnLegs.some(id=>!L[id].visited)?`<li><span class="k-line k-planned"></span>PLANNED LEG</li>`:"")
  +(rings?`<li><span class="k-orbit"></span>ORBIT</li>`:"");
 /* The breadcrumb is the way out: one real button per ancestor walking the frame chain,
    terminating at SYSTEM, plus UP ONE LEVEL where the SYSTEM VIEW key chip used to be. It is an
    HTML strip outside #holo-world, so the camera and the pinch never reach it. */
 const anc=chain.slice(1),SEP='<span class="crumb-sep" aria-hidden="true"> › </span>';
 const crumbs=(isSys?"":`<button class="crumb-up" type="button" data-frame="${esc(anc[0])}">UP ONE LEVEL</button>`)+
  anc.map(f=>`<button class="crumb" type="button" data-frame="${esc(f)}">${f==="SYSTEM"?"CRESSIDIUM SYSTEM":esc(L[f].name)}</button>`).join(SEP)+
  (anc.length?SEP:"")+`<span class="crumb-now" aria-current="page">${isSys?"CRESSIDIUM SYSTEM":esc(subj.name)}</span>`;
 /* The system locator keeps the system in view: the principal bodies plus the declared star,
    with the ancestor of the frame you stand on marked active — found by walking the frame
    chain, not parent, because elysia has no parent and a parent walk from industry would stop
    one frame short. Real buttons in an HTML strip: an SVG <g role="button"> is not a button,
    and data-frame keeps these out of the pane delegate and the membership counts. Activating
    one opens that body's frame, which is unambiguous: every principal's home frame is SYSTEM. */
 const prins=principals(),act=chain.find(f=>prins.includes(f));
 const locator=isSys?"":`<div class="sys-locator" role="group" aria-label="System locator: open a principal body's frame">`+
  prins.map(id=>`<button type="button" class="loc-body${id===act?" active":""}${id===act&&curSet.has(id)?" cur":""}" data-frame="${esc(id)}"${id===act?' aria-current="true"':""}>${esc(L[id].name)}</button>`).join("")+
  `<span class="loc-star" title="The primary star is drawn for orientation and has no file">STAR</span></div>`;
 return {world:farGrid+zones+rings+lines+star+nodes,key,grid:M.grid,aria:ariaOut,head:M.head,sub:M.sub,crumbs,locator,viewR,scale};
}
/* Pinch ratios are hysteretic: a gesture has to travel 1.35x or 0.74x before it counts as a zoom,
   so a sloppy two-finger tap, or a drift part-way through a gesture, fires nothing. */
const pinchIntent=ratio=>ratio>=1.35?"in":ratio<=.74?"out":"";
/* The frame the campaign is actually on: op 001's ground is elysia, whose home frame is
   cressidium, so the arrival opens the planet. Honest caveat: intel.html auto-selects the
   insertion site and showUnit descends from there, so a visitor lands on the city frame — the
   design claims no arrival view it does not produce. */
const startLevel=()=>{const l=L[C.ops[0]&&C.ops[0].loc];return l?homeOf(l):"SYSTEM"};
function fitLevel(fid){
 const at=fid==null?startLevel():fid;
 const m=holomap(at),world=el("holo-world");   /* an unknown or cyclic frame throws before anything is touched */
 frame=at;
 stack.length=0;stack.push(...chainOf(at).slice().reverse());   /* [SYSTEM, ..., at] */
 if(!world)return m;          /* pages without a map still get the pane chips */
 /* The frame swap is a cut, not a camera move: the world's transition rides with the zoom only. */
 world.style.transition="none";
 world.innerHTML=m.world;world.style.transform="";
 if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>{world.style.transition=""});
 const key=document.querySelector(".holo-key");if(key)key.innerHTML=m.key;
 const head=el("route-heading");if(head)head.textContent=m.head;
 const sub=el("holo-sub");if(sub)sub.textContent=m.sub;
 const grid=el("holo-grid");if(grid)grid.textContent=m.grid;
 const svg=document.querySelector("#holomap svg");if(svg)svg.setAttribute("aria-label",m.aria);
 /* The breadcrumb and the locator mount as HTML strips outside the world, so their buttons stay
    real buttons and the camera never drags them. */
 const crumbHost=el("holo-crumbs");if(crumbHost)crumbHost.innerHTML=m.crumbs;
 const locHost=el("holo-locator");if(locHost)locHost.innerHTML=m.locator;
 const card=document.querySelector(".holo");if(card){const sys=isSysFrame(at);card.classList.toggle("theater",!sys);card.classList.toggle("system",sys)}
 /* The frame can also change from a chip in the reading pane, so the back control is synced here
    rather than only in the map's own click handlers. */
 if(UI.syncBack)UI.syncBack();
 return m;
}
function unitFile(id){const l=L[id];if(!l)return "";
 const here=filed.filter(o=>o.loc===id),sats=C.locations.filter(x=>x.parent===id);
 /* Descent is by frame now: the ENTER chip appears exactly when the body's frame holds more
    than the body itself, and it carries data-frame, so the descent is keyboard-reachable and
    assertable. */
 const enter=members(id).length>1;
 return `<div class="tag">UNIT STATUS · ${esc(l.kind)}</div><h3 class="mission-title">${esc(l.name)}</h3>`
  +(l.img?`<div class="mech-thumb">${pic(l.img,l.name)}</div>`:"")
  +(l.notes?`<div class="muted">${esc(l.notes)}</div>`:"")+table(
  th("LOCATION STATUS",l.visited?"VISITED":"UNVISITED")+th("FACTION / CONTROL",F[l.faction]?esc(F[l.faction].name):"Unclaimed / not recorded")+th(l.parent?(["MOON","STATION","ORBITAL"].includes(l.kind)?"IN ORBIT":"WITHIN"):"IN ORBIT",l.parent?locBtn(l.parent):"None")+
  th("NEARBY SITES",sats.map(x=>locBtn(x.id)).join(" · ")||"None recorded")+th("NOTABLE PERSONNEL",C.personnel.filter(p=>p.lastKnown===id).map(p=>personCard(p.id)).join("")||"None recorded")+th("OPERATIONS HERE",here.map(opLink).join("<br>")||"None filed")+
  th("UNIT RECORD",here.map(o=>esc(o.outcome)).join("<br>")||"No deeds recorded at this location"))
  +(enter?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px"><button class="chip" type="button" data-frame="${esc(id)}">ENTER ${esc(l.name)}</button></div>`:"")}
function showUnit(id){const l=L[id];if(!l||!panel())return;
 /* Cross-frame selection by a rule the records can test: descend when the selected site is not
    in members(current), and the target is that site's home frame — so personnel.lastKnown and
    in-orbit links land correctly instead of stranding a site no frame draws. */
 if(frame==null||!members(frame).some(m=>m.id===id))fitLevel(homeOf(l));
 mark("loc",id);
 panel().innerHTML=unitFile(id)}
function showMech(id){const m=M[id];if(!m||!panel())return;const mine=mechOps(id).reverse(),last=filed.filter(o=>o.mechs.includes(id)).pop(),at=stationed(id),nf="NOT FILED";
 mark("mech",id);
 panel().innerHTML=`<div class="tag">${esc(m.frame)} · SIZE ${esc(msize(m))}</div><h3 class="mission-title">${esc(m.name)}</h3>`+table(
  th("PILOT",pilotBtn(m.pilot))+th("STATE",esc(m.state))+th("STATIONED",at?locBtn(at):C.meta.station?esc(C.meta.station):"")+
  th("HP · ARMOR",m.hp!=null&&m.hp!==""?`${esc(hpNow(m))}/${esc(m.hp)} · ${esc(m.armor??"—")}`:nf)+th("STRUCTURE · STRESS",`${esc(m.structure??"—")} · ${esc(m.stress??"—")}`)+
  th("HEAT · REPAIR",`${esc(heatNow(m)??"—")}/${esc(m.heat??"—")} · ${esc(repairsNow(m)??"—")}/${esc(m.repair??"—")}`)+th("HULL · AGI · SYS · ENG",`${esc(m.hull??"—")} · ${esc(m.agi??"—")} · ${esc(m.sys??"—")} · ${esc(m.eng??"—")}`)+th("REPAIR",m.repair??"—")+th("EVA · SPD · E-DEF · SENS · SAVE",`${esc(m.eva)} · ${esc(m.spd)} · ${esc(m.edef)} · ${esc(m.sens??"—")} · ${esc(m.save??"—")}`)+th("ATK · TECH · LTD",`${esc(m.attackBonus??"—")} · ${esc(m.tech)} · ${esc(m.limitedBonus??"—")}`)+
  th("LOADOUT",esc(mstr(m)))+th("SYSTEMS",esc(systemString(m)||""))+
  th("DEPLOYED",mine.map(opLink).join("<br>")||"Never")+th("LAST OUTCOME",last?esc(last.outcome):""))}
function showPilot(id){const p=P[id];if(!p||!panel())return;const mine=pilotOps(id).reverse();
 mark("pilot",id);
 panel().innerHTML=`<div class="tag">${esc(p.background||"")}</div><h3 class="mission-title">${esc(p.name)}</h3>`+table(
  th("STATUS",pill(p.status,"lime"))+th("CHASSIS",p.mech?mechBtn(p.mech):"None assigned")+
  th("TRIGGERS",esc(p.triggers||""))+th("TALENTS",esc(p.talents||""))+th("GEAR",esc(p.gear||""))+
  th("DEPLOYED",mine.map(opLink).join("<br>")||"Never"))}
function showPerson(id){if(!N[id]||!panel())return;
 mark("person",id);
 panel().innerHTML=personFile(id)}
function show(kind,id){kind==="mech"?showMech(id):kind==="pilot"?showPilot(id):kind==="person"?showPerson(id):showUnit(id)}
document.addEventListener("click",e=>{const t=e.target.closest("[data-mech],[data-loc],[data-pilot],[data-person]");if(!t)return;
 if(e.target.closest("a"))return;
 const k=t.dataset.mech?"mech":t.dataset.pilot?"pilot":t.dataset.person?"person":"loc",v=t.dataset.mech||t.dataset.pilot||t.dataset.person||t.dataset.loc;
 if(t.closest("#record-detail")){show(k,v);return}
 if(t.matches("article[data-pilot],article[data-mech]")){toggleRecord(t.dataset.pilot?"pilot":"mech",v);return}
 if(k==="mech"||k==="pilot")return;
 showAtMap(k,v);
 if(k==="person")panel().scrollIntoView({block:"nearest",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"});
 else if(t.closest(".holo-svg"))el("holomap").scrollIntoView({block:"nearest",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})});
const latest=filed[0];
if(el("hero-tagline")&&C.meta&&C.meta.tagline)el("hero-tagline").textContent=C.meta.tagline;
const upcoming=ops.filter(o=>o.type==="PLANNED").pop();
if(el("hero-meta")&&(latest||upcoming))el("hero-meta").innerHTML=(latest?`<div>CURRENT AREA<strong>${esc(L[latest.loc].name)}</strong></div><div>OPEN CONTRACTS<strong>${String(filed.length-filed.filter(o=>/COMPLETED/.test(o.status)).length).padStart(2,"0")}</strong></div><div>LAST DEPLOYMENT<strong>OPERATION ${esc(latest.id)}</strong></div>`:`<div>HEADING<strong>${esc(L[upcoming.loc].name)}</strong></div><div>NEXT DEPLOYMENT<strong>OP ${esc(upcoming.id)} · ${esc(upcoming.title)}</strong></div>`)+(C.meta&&C.meta.updated?`<div>LAST UPDATE<strong>${esc(C.meta.updated)}</strong></div>`:"");
if(el("stats"))el("stats").innerHTML=[["MISSIONS",filed.length],["COMPLETED",filed.filter(o=>/COMPLETED/.test(o.status)).length],["ACTIVE PILOTS",C.pilots.filter(p=>p.status==="ACTIVE").length],["KNOWN FACTIONS",C.factions.length],["KILLS",(C.ledger||[]).reduce((n,e)=>n+(Number(e.kills)||0),0)]].map(([k,v])=>`<div class="stat"><label>${k}</label><strong>${String(v).padStart(2,"0")}</strong></div>`).join("");
if(el("readiness")){const open=C.threads.filter(t=>t.status!=="CLOSED").length;
 el("ready-count").textContent=`${C.mechs.length} CHASSIS · ${open} OPEN THREADS`;
 el("readiness").innerHTML=`<table class="threads-table"><thead><tr><th>CHASSIS</th><th>PILOT</th><th>ROLE</th><th>HULL</th><th>STATUS</th></tr></thead><tbody>`+C.mechs.map(m=>{const p=P[m.pilot],nw=p?p.name.replace(/\u201c([^\u201d]*)\u201d/,"$1").replace(/\s+/g," ").trim().split(" "):[];return `<tr><td>${esc(m.name)}</td><td>${p?esc(nw.length>1?nw[0].charAt(0)+". "+nw[nw.length-1]:nw[0]):"UNASSIGNED"}</td><td class="muted">${esc(m.role||"")}</td><td>${m.hp!=null&&m.hp!==""?`<span class="hp-pips">${"\u25b0".repeat(Math.max(0,Math.round(hpNow(m)/2)))}${"\u25b1".repeat(Math.max(0,Math.round(m.hp/2)-Math.round(hpNow(m)/2)))} ${hpNow(m)}/${m.hp}</span>`:'<span class="muted">\u2014</span>'}</td><td>${mechPill(m)}</td></tr>`}).join("")+"</tbody></table>"+
  (()=>{const next=C.ops.filter(o=>o.type==="PLANNED").sort((a,b)=>String(a.id).localeCompare(String(b.id),undefined,{numeric:true}))[0];return next?`<div class="tag" style="display:block;margin-top:14px">NEXT OP</div><div style="font:15px var(--mono);margin-top:5px">OP ${esc(next.id)} · ${esc(next.title)}</div><div class="muted" style="font:13px var(--mono);margin-top:4px">${esc(L[next.loc].name)} · ${L[next.loc].visited?"VISITED":"UNVISITED"} · ${esc(next.outcome)}</div>`:`<div class="tag" style="display:block;margin-top:14px">NEXT OP</div><div class="muted" style="font:13px var(--mono);margin-top:5px">NO BRIEF FILED</div>`})()}
if(el("ops")){el("ops-count").textContent=`MISSION ARCHIVE / ${String(C.ops.length).padStart(3,"0")} RECORDS`;
 el("ops").innerHTML=ops.map(o=>{const l=L[o.loc],par=l.parent?L[l.parent]:null,open=threadsOf(o.id);
 return `<details class="card patrol" id="op-${esc(o.id)}"><summary class="card-pad"><div class="mission-row"><div><div class="tag"><span class="op-caret" aria-hidden="true"></span>OPERATION ${esc(o.id)} · ${esc(o.type)}</div><h3 class="mission-title">${esc(o.title)}</h3><div class="muted">CLIENT: ${o.client?esc(F[o.client].name.toUpperCase()):"NONE"} · AREA: ${esc(l.name)}${par?" ("+esc(par.name)+")":""}</div></div>${opPill(o)}</div></summary><div class="card-pad op-body">`+table(
  th("LOCATION",esc(l.name+" · "+l.kind))+th("OVERVIEW",esc(o.summary||""))+th("CURRENT MISSION",o.mission?`<a class="chip" href="${esc(o.mission.href)}">${esc(o.mission.title)} →</a>`:"")+th("CREW",(o.crew||[]).map(pilotBtn).join("")||"None")+th("MECHS",(o.mechs||[]).map(mechBtn).join("")||(o.type==="PLANNED"?"":"None deployed"))+
  th("ROUNDS",o.rounds==null?"":esc(o.rounds))+th("OUTCOME",esc(o.outcome))+th("LEFT HANGING",open.map(t=>esc(t.text)+(t.status!=="OPEN"?" ("+esc(t.status)+")":"")).join("<br>")||"Nothing open")+th("FILED",esc(o.date)))+`</div></details>`}).join("")}
/* Crew-facing OPORD: rendered from the op record so any mission page reuses one shape.
   Annexes are op.opord data, lettered A, B, C in order of appearance. */
const opLine=t=>`<li>${esc(t)}</li>`;
const opSub=s=>`<li>${s[0]?`<b>${esc(s[0])}.</b> `:""}${Array.isArray(s[1])?`<ol class="opord-lines">${s[1].map(opLine).join("")}</ol>`:esc(s[1])}</li>`;
const opBody=b=>Array.isArray(b)?`<ol class="opord-sub">${b.map(opSub).join("")}</ol>`:`<p class="opord-body">${esc(b)}</p>`;
const opAnnex=(letter,title,inner,id)=>`<div class="card opord-annex" id="${esc(id)}"><div class="card-pad"><div class="tag">ANNEX ${esc(letter)} \u00b7 ${esc(title)}</div>${inner}</div></div>`;
function opordDoc(o){const d=o.opord,br=a=>(a||[]).map(esc).join("<br>"),letter=i=>"ABCDEFGH"[i]||String(i+1),pid=`opord-${o.id}`,chip=(h,t)=>`<a class="chip" href="#${esc(h)}">${esc(t)}</a>`;
 return `<div class="opord-class">${esc(d.class)}</div>`+
 `<div class="card"><div class="card-pad"><div class="tag">OPERATION ORDER \u00b7 OP ${esc(o.id)} \u00b7 ${esc(o.title)}</div><h3 class="mission-title">${esc(d.no)}</h3>`+table(
 th("ISSUING HQ",esc(d.hq))+th("CLIENT",o.client&&F[o.client]?esc(F[o.client].name.toUpperCase()):"NONE")+th("DTG OF ORDER",esc(d.dtg))+th("H-HOUR",esc(d.hhour))+th("REFERENCES",br(d.refs))+
 th("DISTRIBUTION",br(d.distribution))+th("STATUS",opPill(o)))+`</div></div>`+
 `<div class="card opord-toc"><div class="card-pad"><div class="tag">CONTENTS</div><nav aria-label="Operation order contents">`+
 d.paras.map((p,i)=>chip(`${pid}-p${i+1}`,`${i+1}. ${p[0]}`)).join("")+
 d.annexes.map((a,i)=>chip(`${pid}-a${i+1}`,`${letter(i)} \u00b7 ${a[0]}`)).join("")+`</nav></div></div>`+
 (d.vips?`<div class="card"><div class="card-pad"><div class="tag">EXTRACTION PRINCIPALS \u00b7 VISUAL ID</div><div class="vip-row">`+d.vips.map(v=>`<figure class="vip"><img src="${esc(v.img)}" alt="${esc(v.name)}"><figcaption><b>${esc(v.name)}</b><span>${esc(v.role)}</span><p>${esc(v.blurb)}</p></figcaption></figure>`).join("")+`</div></div></div>`:"")+
 `<div class="card"><div class="card-pad">`+d.paras.map((p,i)=>`<div class="opord-para" id="${esc(pid)}-p${i+1}"><h4>${i+1}. ${esc(p[0])}</h4>${opBody(p[1])}</div>`).join("")+`</div></div>`+
 d.annexes.map((a,i)=>opAnnex(letter(i),a[0],`<ol class="opord-lines">${a[1].map(opLine).join("")}</ol>`,`${pid}-a${i+1}`)).join("")+
 `<div class="opord-class">${esc(d.class)}</div>`;}
/* Mission-page conflict history: the op record carries the copy, the page carries the head. */
const histHost=el("conflict-history");
if(histHost){const o=C.ops.find(x=>String(x.id)===histHost.dataset.op);
 histHost.innerHTML=o&&o.history&&o.history.length?`<div class="card"><div class="card-pad">`+o.history.map(p=>`<p>${esc(p)}</p>`).join("")+`</div></div>`:"";}
/* Campaign ledger: append-only session rows, one per pilot per session. Rows come from the block
   campaign.html builds, applied by tools/apply-compcon.cjs. Career totals and record holders are
   derived here so the rows stay the only source of truth. */
const LEDGER_STATS=[["dealt","DAMAGE DEALT"],["taken","DAMAGE TAKEN"],["structure","STRUCTURE DMG"],["repairs","REPAIRS"],["hacks","HACKS"],["kills","KILLS"],["heat","HEAT DMG"],["overcharge","OVERCHARGE"],["core","CORE USES"],["moves","MOVES"]];
const shortName=id=>{const p=P[id];if(!p)return String(id);const nw=p.name.replace(/\u201c([^\u201d]*)\u201d/,"$1").replace(/\s+/g," ").trim().split(" ");return nw.length>1?nw[0].charAt(0)+". "+nw[nw.length-1]:nw[0]};
/* Pure over the rows it is given: returns the count text and the markup, so checks can
   assert exact records with fixture rows instead of whatever the real ledger holds. */
const ledgerPanel=log=>{const byPilot=new Map();log.forEach(e=>{const r=byPilot.get(e.pilot)||{n:0};r.n++;LEDGER_STATS.forEach(([k])=>{const v=Number(e[k]);if(e[k]!=null&&Number.isFinite(v))r[k]=(r[k]||0)+v});byPilot.set(e.pilot,r)});
 const list=[...byPilot].map(([pilot,r])=>({pilot,...r})).sort((a,b)=>(b.dealt||0)-(a.dealt||0)||(b.taken||0)-(a.taken||0));
 const cols=LEDGER_STATS.filter(([k])=>list.some(r=>r[k]!=null));
 return {count:`${log.length} ENTRIES · ${list.length} PILOTS`,html:list.length?table(cols.map(([k,l])=>{const top=list.slice().sort((a,b)=>(b[k]||0)-(a[k]||0))[0];return th("MOST "+esc(l),`${esc(shortName(top.pilot))} · ${top[k]}`)}).join("")||th("LEDGER","No stats logged yet"))+
  `<div style="overflow-x:auto"><table class="threads-table"><thead><tr><th>PILOT</th><th>SESSIONS</th>${cols.map(([,l])=>`<th>${esc(l)}</th>`).join("")}</tr></thead><tbody>${list.map(r=>`<tr><td>${esc(shortName(r.pilot))}</td><td>${r.n}</td>${cols.map(([k])=>`<td>${r[k]??0}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
 :`<p class="muted">No sessions logged yet.</p>`};
};
if(el("ledger-body")){const panel=ledgerPanel(C.ledger||[]);const lc=el("ledger-count");if(lc)lc.textContent=panel.count;el("ledger-body").innerHTML=panel.html;}
/* #28 session-log stepper. Emission is pure: the page glue only reads and writes control
   values, and the block grammar stays the single one tools/apply-compcon.cjs parses. A pilot
   with nothing typed emits no line, so a deployed-but-quiet session stays out of the ledger
   rather than landing a row the CLI would refuse. */
const SL_KEYS=LEDGER_STATS.map(([k])=>k);
const SL_CORE=["dealt","taken","structure","repairs"];
const sessionBlock=(entries,op,date)=>{
  const lines=(entries||[]).filter(e=>e&&e.deployed&&Object.keys(e.stats||{}).length)
    .map(e=>`${e.pilot} ${SL_KEYS.filter(k=>e.stats[k]!=null).map(k=>`${k}=${e.stats[k]}`).join(" ")}`);
  return lines.length?`session op=${op} date=${date}\n${lines.join("\n")}`:"";
};
const slField=(pilot,k,st)=>`<label>${esc(k.toUpperCase())}<input type="number" id="sl-${pilot.id}-${k}" value="${st.stats[k]!=null?esc(String(st.stats[k])):""}"${st.deployed?"":" disabled"}></label>`;
const sessionStep=(pilot,st)=>`<div class="card sl-card"><div class="card-pad">
<div class="sl-head"><label><input type="checkbox" id="sl-deploy-${pilot.id}"${st.deployed?" checked":""}> DEPLOYED · ${esc(pilot.name)} (${esc(pilot.background)})</label>
<label><input type="checkbox" id="sl-more-${pilot.id}"${st.more?" checked":""}> MORE STATS</label></div>
<div class="sl-fields">${SL_CORE.map(k=>slField(pilot,k,st)).join("")}${st.more?SL_KEYS.filter(k=>!SL_CORE.includes(k)).map(k=>slField(pilot,k,st)).join(""):""}</div>
</div></div>`;
const sessionReview=(entries,op,date)=>{
  if(!/^\d{4}-\d{2}-\d{2}$/.test(date||""))return `<p class="muted">SET A DATE: the header needs YYYY-MM-DD or the CLI refuses it.</p>`;
  if(!sessionBlock(entries,op,date))return `<p class="muted">NOBODY DEPLOYED: tick who flew and the block appears here.</p>`;
  return `<pre id="sl-block" class="sl-block"></pre><button class="level" type="button" id="sl-copy">COPY BLOCK</button>
<p class="muted">Paste it into <code>tools/apply-compcon.cjs --log-block</code>; that writes campaign.js and regenerates detail.js in one guarded step.</p>`;
};
/* The stepper glue, campaign.html only. Values live in one plain object so Back never loses a
   number; fields are read at each step change, never per keystroke. The stub records listeners,
   so checks drive this with fire() the way a GM clicks. */
if (el("sl-step")) {
  const pilots = C.pilots, st = { pos: 0, per: {} };
  pilots.forEach(p => st.per[p.id] = { deployed: false, more: false, stats: {} });
  const opSel = el("sl-op");
  if (opSel) { opSel.innerHTML = C.ops.map(o => `<option value="${esc(String(o.id))}">${esc(String(o.id))} · ${esc(o.title)}</option>`).join(""); opSel.value = String((C.ops[C.ops.length - 1] || {}).id || ""); }
  const save = p => { const s = st.per[p.id]; SL_KEYS.forEach(k => { const f = el(`sl-${p.id}-${k}`); if (!f) return; if (f.value === "") delete s.stats[k]; else s.stats[k] = Number(f.value); }); };
  const renderStep = () => { const p = pilots[st.pos]; el("sl-step").innerHTML = sessionStep(p, st.per[p.id]); el("sl-review").innerHTML = "";
    const d = el("sl-deploy-" + p.id), m = el("sl-more-" + p.id);
    if (d) d.addEventListener("change", () => { save(p); st.per[p.id].deployed = d.checked; renderStep(); });
    if (m) m.addEventListener("change", () => { save(p); st.per[p.id].more = m.checked;
      if (!m.checked) SL_KEYS.filter(k => !SL_CORE.includes(k)).forEach(k => delete st.per[p.id].stats[k]);
      renderStep(); });
    const b = el("sl-back"), nx = el("sl-next"); if (b) b.hidden = st.pos === 0; if (nx) nx.hidden = false; };
  const review = () => { el("sl-step").innerHTML = ""; const op = (el("sl-op") || {}).value, dt = (el("sl-date") || {}).value;
    const entries = pilots.map(p => ({ pilot: p.id, deployed: st.per[p.id].deployed, stats: st.per[p.id].stats }));
    el("sl-review").innerHTML = sessionReview(entries, op, dt);
    const pre = el("sl-block"); if (pre) pre.textContent = sessionBlock(entries, op, dt);
    const cp = el("sl-copy"); if (cp) cp.addEventListener("click", () => { const txt = pre.textContent;
      if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt); return; }
      if (typeof getSelection === "function" && document.createRange) { const r = document.createRange(); r.selectNodeContents(pre);
        const sel = getSelection(); if (sel.removeAllRanges) sel.removeAllRanges(); if (sel.addRange) sel.addRange(r); } });
    const nx = el("sl-next"); if (nx) nx.hidden = true; const b = el("sl-back"); if (b) b.hidden = false; };
  const nx = el("sl-next"), bk = el("sl-back");
  if (nx) nx.addEventListener("click", () => { if (st.pos >= pilots.length) return; save(pilots[st.pos]); st.pos++; st.pos < pilots.length ? renderStep() : review(); });
  if (bk) bk.addEventListener("click", () => { if (st.pos >= pilots.length) { st.pos = pilots.length - 1; renderStep(); return; } if (st.pos === 0) return; save(pilots[st.pos]); st.pos--; renderStep(); });
  renderStep();
}
/* Campaign page (#27): the op header. The session-log form that lived here was 60 spinners
   (10 stats x 6 pilots) with no way to skip a pilot who did not deploy, so it is removed
   pending #28; a session is logged by hand until that design lands. */
const opOf=id=>C.ops.find(o=>String(o.id)===String(id));
const campaignHead=o=>{const loc=C.locations.find(x=>x.id===(o&&o.loc))||{};
 return table(th("OPERATION",esc(o?o.id+" · "+o.title:"UNKNOWN"))+th("THEATER",esc(loc.name||C.meta.station||""))+th("MISSION",o&&o.mission&&o.mission.href?link(o.mission.href,"OPEN BRIEFING →"):"NOT FILED"));};
if(el("campaign-head")){const host=el("campaign-head");host.innerHTML=campaignHead(opOf(host.dataset.op));}
if(el("opord")){const host=el("opord"),o=C.ops.find(x=>String(x.id)===(host.dataset.op||""));
 host.innerHTML=o&&o.opord?opordDoc(o):notFound("operation order",host.dataset.op||"");}
if(el("threads-body"))el("threads-body").innerHTML=C.threads.slice().sort((a,b)=>a.op.localeCompare(b.op)).map(t=>`<tr><td>${esc(t.text)}</td><td>OP ${esc(t.op)}</td><td>${threadPill(t)}</td></tr>`).join("")||`<tr><td colspan="3" class="muted">Nothing seeded yet.</td></tr>`;
/* #14 session cards: ledger rows grouped by op and date, one card per logged session, so the
   index shows what actually happened without GM-side content. Pure over the rows given, like
   ledgerPanel; zeros kept, absent stats omitted. */
/* #16 attendance strip: six cells, one per pilot, sessions attended derived from the ledger
   alone, plus the newest session's date and op. Degrades to the no-sessions state. */
const attendanceStrip=log=>{
  const rows=log||[];
  const last=rows.slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))||String(b.op).localeCompare(String(a.op)))[0];
  const cells=C.pilots.map(p=>{const n=rows.filter(r=>r.pilot===p.id).length;
    return `<span class="att-cell" data-pilot="${esc(p.id)}">${esc(shortName(p.id))} <b>${n}</b></span>`;}).join("");
  const lastLine=last?`<span class="att-last">LAST SESSION · ${esc(last.date)} · ${esc((C.ops.find(o=>String(o.id)===String(last.op))||{}).title||("OP "+last.op))}</span>`:"";
  return {html:rows.length?`<div class="att-strip">${cells}${lastLine}</div>`:`<div class="att-strip"><span class="muted">No sessions logged yet.</span></div>`};
};
const sessionCards=log=>{
  const groups=new Map();
  (log||[]).forEach(e=>{const k=`${e.op}|${e.date}`;const g=groups.get(k)||{date:e.date,op:e.op,rows:[]};g.rows.push(e);groups.set(k,g);});
  const list=[...groups.values()].sort((a,b)=>String(a.date).localeCompare(String(b.date))||String(a.op).localeCompare(String(b.op)));
  return {count:list.length,html:list.length?list.map(g=>{
    const o=C.ops.find(x=>String(x.id)===String(g.op));
    const per=g.rows.map(r=>{const nums=LEDGER_STATS.filter(([k])=>r[k]!=null).map(([k])=>`${k} ${r[k]}`);
      return `<div class="sc-row"><span>${esc(shortName(r.pilot))}</span><span>${nums.join(" · ")||"no stats"}</span></div>`;}).join("");
    return `<li><div class="time">${esc(g.date)}</div><div class="activity-title">${o?esc(o.title):"OP "+esc(g.op)}</div><div class="sc-rows">${per}</div></li>`;
  }).join(""):`<li><div class="muted">No sessions logged yet.</div></li>`};
};
if(el("timeline"))el("timeline").innerHTML=C.events.map(ev=>`<li><div class="time">${esc(ev.date)}</div><div class="activity-title">${esc(ev.title)}</div><div class="muted" style="font:13px var(--mono)">${ev.op?`<a href="index.html#op-${esc(ev.op)}">OP ${esc(ev.op)}</a> · `:""}${esc(ev.note)}</div></li>`).join("")||`<li><div class="muted">No deeds filed yet.</div></li>`;
if(el("session-cards"))el("session-cards").innerHTML=sessionCards(C.ledger||[]).html;
if(el("attendance-strip"))el("attendance-strip").innerHTML=attendanceStrip(C.ledger||[]).html;
if(el("crew-list")){el("crew-count").textContent=`${String(C.pilots.length).padStart(2,"0")} ACTIVE RECORDS`;
 el("crew-list").innerHTML=C.pilots.map(p=>{const mine=pilotOps(p.id).reverse();
 return `<article class="card patrol" data-pilot="${esc(p.id)}"><div class="card-pad mech-card">${p.img?`<div class="mech-thumb">${pic(p.img,p.name)}</div>`:`<div class="avatar">${esc(p.name.replace(/\u201c([^\u201d]*)\u201d/,"$1").trim()[0])}</div>`}<div class="mech-id"><a class="crew-name" href="pilot.html#${esc(p.id)}">${esc(p.name)}</a><div class="crew-role">${esc(p.background||"")}</div>${table(th("STATUS",pill(p.status,"lime"))+th("CHASSIS",p.mech&&M[p.mech]?`<a href="mech.html#${esc(p.mech)}">${esc(M[p.mech].name)}</a>`:"None assigned"))}<div style="margin-top:8px">${link("pilot.html#"+p.id,"VIEW DOSSIER →")}</div></div><div class="mech-matrix">${table(th("TRIGGERS",esc(p.triggers||""))+th("TALENTS",esc(p.talents||""))+th("GEAR",esc(p.gear||""))+th("DEPLOYED",mine.map(opLink).join("<br>")||"Never"))}</div></div></article>`}).join("")}
if(el("mech-list")){el("mech-count").textContent=`${String(C.mechs.length).padStart(2,"0")} MECH RECORDS`;
 el("mech-list").innerHTML=C.mechs.map(m=>{const mine=mechOps(m.id).reverse(),last=filed.filter(o=>o.mechs.includes(m.id)).pop(),at=stationed(m.id),nf="NOT FILED";
 return `<article class="card patrol" data-mech="${esc(m.id)}"><div class="card-pad mech-card"><div class="mech-thumb">${m.img?pic(m.img,m.name,m.imgFocus):`<div class="plate"><span class="mech-silhouette">${esc(m.glyph)}</span></div>`}</div><div class="mech-id"><div class="tag">${esc(m.frame)} · SIZE ${esc(msize(m))}</div><a class="mech-title" href="mech.html#${esc(m.id)}">${esc(m.name)}</a>${table(th("PILOT",esc(P[m.pilot]?P[m.pilot].name.replace(/\u201c([^\u201d]*)\u201d/,"$1"):"UNASSIGNED"))+th("ROLE",esc(m.role||""))+th("STATE",`${esc(m.state??"")}${m.missing?` \u00b7 ${esc(m.missing)}`:""}`)+th("LOADOUT",esc(mstr(m)))+th("SYSTEMS",esc(systemString(m)||"")))}<div style="margin-top:8px">${link("mech.html#"+m.id,"OPEN FILE →")}</div></div><div class="mech-matrix">${table(th("STATIONED",at?esc(L[at].name):C.meta.station?esc(C.meta.station):"")+(m.conditions?.length?th("CONDITIONS",m.conditions.map(c=>pill(c,"rust")).join("")):"")+th("HP · ARMOR",m.hp!=null&&m.hp!==""?`${esc(hpNow(m))}/${esc(m.hp)} · ${esc(m.armor??"—")}`:nf)+th("STRUCTURE · STRESS",`${esc(m.structure??"—")} · ${esc(m.stress??"—")}`)+th("HEAT · REPAIR",`${esc(heatNow(m)??"—")}/${esc(m.heat??"—")} · ${esc(repairsNow(m)??"—")}/${esc(m.repair??"—")}`)+th("HULL · AGI · SYS · ENG",`${esc(m.hull??"—")} · ${esc(m.agi??"—")} · ${esc(m.sys??"—")} · ${esc(m.eng??"—")}`)+th("EVA · SPD · E-DEF · SENS · SAVE",`${esc(m.eva)} · ${esc(m.spd)} · ${esc(m.edef)} · ${esc(m.sens??"—")} · ${esc(m.save??"—")}`)+th("ATK · TECH · LTD",`${esc(m.attackBonus??"—")} · ${esc(m.tech)} · ${esc(m.limitedBonus??"—")}`)+th("DEPLOYED",mine.map(opLink).join("<br>")||"Never")+(last?th("LAST OUTCOME",esc(last.outcome)):""))}</div></div></article>`}).join("")}
if(el("faction-list"))el("faction-list").innerHTML=factionTable()
/* #15 dossier actions: the pages are hash-driven, so the visitor's own URL is the share link.
   Wire runs from the page glue after the dossier lands in #dossier (UI.wireDossierActions). */
const dossierActions=()=>`<div class="hero-actions"><button class="level" type="button" id="dossier-back">BACK</button><button class="level" type="button" id="dossier-copy">COPY LINK</button><button class="level" type="button" id="dossier-print">PRINT</button></div>`;
function wireDossierActions(){const cp=el("dossier-copy"),pr=el("dossier-print"),bk=el("dossier-back");
 /* The record history is the browser's own, so a chip jump and a shared link both return the
    reader where they came from. Pinned stub pages mount without a history global. */
 if(bk)bk.addEventListener("click",()=>{if(typeof history!=="undefined"&&history.back)history.back();});
 if(cp)cp.addEventListener("click",()=>{if(typeof navigator!=="undefined"&&navigator.clipboard&&navigator.clipboard.writeText)navigator.clipboard.writeText(location.href);
  /* the toast fades itself out, so a second copy drops the class and re-adds it to restart that
     animation rather than leaving the confirmation invisible */
  const t=el("toast");if(t){t.classList.remove("on");t.innerHTML="LINK COPIED";void t.offsetWidth;t.classList.add("on");}});
 if(pr)pr.addEventListener("click",()=>{if(typeof print==="function")print();});}
function pilotDossier(id){if(!P[id]&&legacyPilotId[id])id=legacyPilotId[id];const p=P[id];if(!p)return notFound("pilot",id);
 const m=p.mech?M[p.mech]:null,mine=pilotOps(id).reverse(),[trig,tal,gear]=pilotRows(p,"#");
 return `<section class="hero"><div class="hero-copy"><div class="eyebrow">${esc(p.background||"")}</div><h1>${esc(p.name)}</h1><div class="hero-meta"><span>${pill(p.status,"lime")}</span></div>${dossierActions()}</div>`+
  (p.img?`<div class="hero-art"><div class="plate"><img class="hero-mech-img" src="${esc(p.img)}" alt="${esc(p.name)}"></div></div>`:"")+`</section>`+
  `<div class="columns"><div class="primary fill"><section><div class="section-head"><h2>PILOT FILE</h2><span>PERSONNEL</span></div><div class="card"><div class="card-pad">`+table(
  th("STATUS",pill(p.status,"lime"))+th("CHASSIS",m?link("mech.html#"+m.id,m.name):"None assigned")+
  trig+tal+(p.doctrine?th("DOCTRINE",link(p.doctrine,(p.doctrineTitle||"BUILD GUIDE")+" →")):"")+gear+
  th("DEPLOYED",mine.map(opLink).join("<br>")||"Never"))+
  `</div></div></section></div><aside class="aside fill"><section><div class="section-head"><h2>CHASSIS</h2><span>${m?esc(m.role||""):"NONE"}</span></div><div class="card"><div class="card-pad">`+
  (m?`<div class="mech-card"><div class="mech-thumb">${m.img?pic(m.img,m.name,m.imgFocus):`<div class="plate"><span class="mech-silhouette">${esc(m.glyph||"?")}</span></div>`}</div><div><div class="tag">${esc(m.frame)} · SIZE ${esc(msize(m))}</div><div class="mech-title">${esc(m.name)}</div><div class="muted" style="margin-top:6px;font:13px var(--mono)">${link("mech.html#"+m.id,"OPEN FILE →")}</div></div></div>`
    :`<div class="muted">No chassis assigned.</div>`)+
  `</div></div></section>`+(m?chassisFile(m,true):"")+`</aside></div>`+detailPilot(p);
}
/* The mech dossier's aside runs short against the chassis file; the pilot's own rows fill it. */
const pilotFile=p=>p?`<section><div class="section-head"><h2>PILOT FILE</h2><span>PERSONNEL</span></div><div class="card"><div class="card-pad">`+table(
 th("STATUS",pill(p.status,"lime"))+pilotRows(p,"pilot.html#").join("")+
 th("DEPLOYED",pilotOps(p.id).reverse().map(opLink).join("<br>")||"Never"))+`</div></div></section>`:"";
/* Mirror of pilotFile: the mech dossier's own rows, reused as the pilot dossier's aside so both
   columns end level. A pilot's page carries the summary; the mech's own page carries the full file. */
const chassisRows=(m,summary)=>{const p=m.pilot?P[m.pilot]:null,mine=mechOps(m.id).reverse(),last=filed.filter(o=>o.mechs.includes(m.id)).pop(),at=stationed(m.id),pfx=summary?"mech.html#":"#";
 /* The pilot dossier carries the mech's summary rows, so those names link across to the mech page. */
 const atLoc=at&&L[at]?at:(C.locations.find(l=>l.name===C.meta.station)||{}).id,atName=at&&L[at]?L[at].name:C.meta.station||"—";
 return summary?th("LOADOUT",mstrMarkup(m,pfx)||"—")+th("SYSTEMS",systemMarkup(m,pfx)||"—")+th("DEPLOYED",mine.map(opLink).join("<br>")||"Never"):(
  th("PILOT",p?link("pilot.html#"+p.id,p.name.replace(/\u201c([^\u201d]*)\u201d/g,"$1")):"UNASSIGNED")+th("STATE",esc(m.state))+(m.conditions?.length?th("CONDITIONS",m.conditions.map(c=>pill(c,"rust")).join("")):"")+
  th("STATIONED",atLoc?link("intel.html#map/"+atLoc,atName):"—")+
  th("HP · ARMOR",m.hp!=null&&m.hp!==""?`${esc(hpNow(m))}/${esc(m.hp)} · ${esc(m.armor??"—")}`:"NOT FILED")+
  th("STRUCTURE · STRESS",`${esc(m.structure??"—")} · ${esc(m.stress??"—")}`)+
  th("HEAT · REPAIR",`${esc(heatNow(m)??"—")}/${esc(m.heat??"—")} · ${esc(repairsNow(m)??"—")}/${esc(m.repair??"—")}`)+
  th("HULL · AGI · SYS · ENG",`${esc(m.hull??"—")} · ${esc(m.agi??"—")} · ${esc(m.sys??"—")} · ${esc(m.eng??"—")}`)+
  th("EVA · SPD · E-DEF · SENS · SAVE",`${esc(m.eva??"—")} · ${esc(m.spd??"—")} · ${esc(m.edef??"—")} · ${esc(m.sens??"—")} · ${esc(m.save??"—")}`)+
  th("ATK · TECH · LTD",`${esc(m.attackBonus??"—")} · ${esc(m.tech??"—")} · ${esc(m.limitedBonus??"—")}`)+
  th("LOADOUT",mstrMarkup(m,pfx)||"—")+th("SYSTEMS",systemMarkup(m,pfx)||"—")+
  th("DEPLOYED",mine.map(opLink).join("<br>")||"Never")+th("LAST OUTCOME",last&&last.outcome?esc(last.outcome):"NOT FILED"));
};
const chassisFile=(m,summary)=>`<section><div class="section-head"><h2>CHASSIS FILE</h2><span>${esc(m.state)}</span></div><div class="card"><div class="card-pad">`+table(chassisRows(m,summary))+`</div></div></section>`;
function mechDossier(id){const m=M[id];if(!m)return notFound("mech",id);
 const p=m.pilot?P[m.pilot]:null;
 return `<section class="hero"><div class="hero-copy"><div class="eyebrow">${esc(m.frame)} · SIZE ${esc(msize(m))}</div><h1>${esc(m.name)}</h1><div class="hero-meta"><span>${esc(m.role||"")}</span>${mechPill(m)}</div>${dossierActions()}</div>`+
  (m.img?`<div class="hero-art"><div class="plate"><img class="hero-mech-img" src="${esc(m.img)}" alt="${esc(m.name)}"${m.imgFocus?` style="object-position:${esc(m.imgFocus)}"`:""}></div></div>`:(m.glyph?`<div class="hero-art"><div class="plate"><span class="mech-silhouette">${esc(m.glyph)}</span></div></div>`:""))+`</section>`+
  `<div class="columns"><div class="primary fill">`+chassisFile(m)+`</div><aside class="aside fill"><section><div class="section-head"><h2>PILOT</h2><span>ASSIGNMENT</span></div><div class="card"><div class="card-pad">`+
  (p?`<div class="crew">${p.img?`<div class="mech-thumb">${pic(p.img,p.name)}</div>`:`<div class="avatar">${esc(initial(p.name))}</div>`}<div><div class="crew-name">${esc(p.name)}</div><div class="crew-role">${esc(p.background||"")}</div><div class="muted" style="margin-top:6px;font:13px var(--mono)">${link("pilot.html#"+p.id,"OPEN FILE →")}</div></div></div>`
    :`<div class="muted">No pilot assigned.</div>`)+`</div></div></section>`+pilotFile(p)+`</aside></div>`+detailMech(m);
}
/* Intel console (docs/plans/2026-10-18-intel-console-tabs-design.md). These are pure functions so
   check-all can assert the markup without the map glue, and so the tab shell and the map pane
   render one record rather than two. */
function personFile(id){const p=N[id];if(!p)return "";
 return `<div class="tag">PERSONNEL RECORD</div><h3 class="mission-title">${esc(p.name)}</h3>`
  +(p.img?`<div class="mech-thumb">${pic(p.img,p.name)}</div>`:"")
  +table(th("ROLE",esc(p.role))+th("FACTION",F[p.faction]?esc(F[p.faction].name):"")+th("STATUS",pill(p.status,p.status==="MISSING"?"rust":"lime"))+
   th("LAST KNOWN",locBtn(p.lastKnown))+
   th("KNOWN OPS",(p.ops||[]).map(id=>ops.find(o=>o.id===id)).filter(Boolean).map(opLink).join("<br>")||"None recorded")+
   th("NOTES",esc(p.notes)))}
function personnelList(){
 return C.personnel.map(p=>`<article class="card patrol" data-person="${esc(p.id)}"><div class="card-pad">${personCard(p.id)}<div class="tag">${esc(p.role)}</div><div class="muted">${esc(p.notes)}</div></div></article>`).join("")
  +`<article class="card"><div class="card-pad"><div class="tag">FULL CREW</div><div class="muted">Notable personnel are recorded here; the six pilots of this lance keep files of their own.</div><div style="margin-top:8px">${link("pilots.html","OPEN CREW FILES →")}</div></div></article>`}
function factionTable(){
 return table(C.factions.map(x=>{const held=C.locations.filter(l=>l.faction===x.id),n=filed.filter(o=>o.client===x.id).length;
  return `<tr><th scope="row">${esc(x.name)}</th>`+
   `<td>${held.map(l=>locBtn(l.id)).join(" ")||"No site recorded"}</td>`+
   `<td>${C.personnel.filter(p=>p.faction===x.id).map(p=>personBtn(p.id)).join(" ")||"—"}</td>`+
   `<td class="muted">${n} OPERATION${n===1?"":"S"}</td><td>${pill(x.standing,(x.zone||{}).c||"muted")}</td></tr>`}).join(""))}
/* The readout is the preflight picture: what the plan names, who is unaccounted for at the op area,
   and which ground is hostile. No row of it is observation, and the wording says so. */
function situation(){
 const o=filed[0]||ops[0]||{},s=o.sites||{},missing=C.personnel.filter(p=>p.status==="MISSING"&&p.lastKnown===o.loc);
 const badges=[];
 [["PLANNED INSERTION","insertion"],["FRIENDLY RENDEZVOUS","rendezvous"],["EXTRACTION DESTINATION","extraction"]].forEach(([label,k])=>{
  if(!s[k])return;const at=L[s[k]];
  badges.push({loc:s[k],role:k,label:label+(k==="rendezvous"&&at&&!at.visited?" · NOT VISITED":"")})});
 C.locations.filter(l=>l.faction&&(F[l.faction]||{}).standing==="HOSTILE").forEach(l=>badges.push({loc:l.id,role:"hostile",label:"HOSTILE"}));
 C.locations.filter(l=>l.name===C.meta.station).forEach(l=>badges.push({loc:l.id,role:"muster",label:"RECORDED MUSTER"}));
 if(o.loc&&missing.length)badges.push({loc:o.loc,role:"area",label:`OP AREA · ${missing.length} MISSING`});
 /* One strip of four cells, the ~44px the design budgets: the plan's grounds are the map's own
    badges now, so the readout stops repeating them as a second table and the map keeps the fold. */
 return {html:`<div class="readout"><div class="tag">PREFLIGHT READOUT</div><div class="readout-strip">`+
   `<div><span class="ro-k">OPERATION</span><span class="ro-v">OP ${esc(o.id||"—")} · ${esc(o.title||"None filed")}</span></div>`+
   `<div><span class="ro-k">MISSION STATE</span><span class="ro-v">${esc(o.type||"—")} · ${esc(o.status||"—")}</span></div>`+
   `<div><span class="ro-k">AREA</span><span class="ro-v">${o.loc&&L[o.loc]?locBtn(o.loc):"—"}</span></div>`+
   `<div><span class="ro-k">OUTCOME</span><span class="ro-v">${esc(o.outcome||"—")}</span></div></div>`+
  `<div class="muted ro-note">Read as the plan of record and last known reports, not as observation: every row comes from the operation order or the site's own file.</div></div>`,
  badges,op:{id:o.id,title:o.title,type:o.type,status:o.status},area:o.loc||"",missing:missing.map(p=>p.id)};
}
lightbox();
return {esc,byId,ops,filed,threadsOf,mechOps,pilotOps,stationed,entryOwner,el,th,table,chip,opLink,mechBtn,locBtn,pilotBtn,pill,mark,show,showAtMap,pilotDossier,mechDossier,detailPilot,detailMech,hpNow,ledgerPanel,campaignHead,pinchIntent,holomap,fitLevel,unitFile,personFile,personnelList,factionTable,situation,sessionBlock,sessionStep,sessionReview,sessionCards,attendanceStrip,wireDossierActions,L,P,M,F};
})();

const patrolCooldown = new WeakMap();
const patrolMotion = matchMedia("(prefers-reduced-motion: reduce)");
document.querySelectorAll(".patrol,.card,.stat,.photo").forEach(card => {
  card.addEventListener("animationend", e => { if (e.target === card) card.classList.remove("patrol-active"); });
  card.addEventListener("pointerenter", () => {
  const now = Date.now();
  if (patrolMotion.matches || now - (patrolCooldown.get(card) || 0) < 8000) return;
  patrolCooldown.set(card, now);
  card.classList.remove("patrol-active");
  void card.offsetWidth;
  card.classList.add("patrol-active");
  });
});

if ("IntersectionObserver" in window) {
  const cards = [...document.querySelectorAll(".patrol")];
  const visible = new Map();
  let focused = null;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.isIntersecting) visible.set(entry.target, entry.intersectionRatio);
      else visible.delete(entry.target);
    }
    let next = null, highest = 0;
    for (const [card, ratio] of visible) if (ratio > highest) [next, highest] = [card, ratio];
    if (next === focused) return;
    focused?.classList.remove("patrol-active");
    focused = next;
    focused?.classList.add("patrol-active");
  }, { threshold: [0, .25, .5, .75, 1] });
  cards.forEach(card => observer.observe(card));
}

if (typeof addEventListener === "function") addEventListener("beforeprint",()=>document.querySelectorAll("details").forEach(d=>d.open=true));
