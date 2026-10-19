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
const pic=(s,alt)=>`<div class="plate"><picture><source srcset="${esc(thumb(s))}" type="image/webp"><img src="${esc(s)}" alt="${esc(alt)}"></picture></div>`;
function lightbox(){document.addEventListener("click",e=>{const img=e.target.closest(".hero-art img");if(!img)return;const o=document.createElement("div");o.className="lightbox";o.setAttribute("role","dialog");o.setAttribute("aria-label","Portrait full size, tap to close");o.innerHTML=`<img src="${esc(img.getAttribute("src"))}" alt="${esc(img.alt)}">`;o.addEventListener("click",()=>o.remove());document.body.append(o);});}
const dnote=t=>t?`<div class="detail" style="margin-top:5px;font:15px/1.6 var(--sans)">${esc(t).replace(/&lt;br\s*\/?&gt;/gi,"<br>")}</div>`:"";
const dhead=n=>`<div class="tag" style="margin-top:10px">${esc(n)}</div>`;
const dsect=(title,inner)=>inner?`<section><div class="section-head"><h2>${title}</h2><span>FIELD DETAIL</span></div><div class="card"><div class="card-pad">${inner}</div></div></section>`:"";
const dnames=s=>String(s||"").split(",").map(x=>x.trim()).filter(Boolean);
/* weapons/systems live in campaign.js as data; the printed string the dossier and mechbay
   show is derived here, and the golden snapshot pins its exact text. */
const mstr=m=>!(m&&m.mounts&&m.mounts.length)?"":m.mounts.map(x=>`${x.slot}: ${x.weapons.join(" / ")}`).join(" · ");
/* System names are data in campaign.js; the printed text the dossier and mechbay show is
   derived here, and the golden snapshot pins its exact wording. */
const systemString=m=>!(m&&m.systems&&m.systems.length)?"":m.systems.join(", ");
const ditems=s=>{const out=[];for(const seg of String(s||"").split("·").map(x=>x.trim()).filter(Boolean)){const mm=seg.match(/^[A-Za-z/ ]+:\s*(.+)$/);for(const it of (mm?mm[1]:seg).split("/").map(x=>x.trim()).filter(Boolean))out.push(it);}return out;};
function detailPilot(p){const d=D();if(!d.talents&&!d.gear&&!d.skills)return "";
 const tal=dnames(p.talents).map(n=>{const t=(d.talents||{})[n];if(!t)return "";return dhead(n)+dnote(t.terse)+(t.ranks||[]).map(r=>dnote("R"+r.rank+" "+r.name+": "+r.description)).join("");}).join("");
 const sk=dnames(p.triggers).map(s=>{const n=s.replace(/\s*\(\+\d+\)$/,"").trim();const e=(d.skills||{})[n];return e?dhead(n)+dnote(e.description):"";}).join("");
 const gear=dnames(p.gear).map(n=>{const g=(d.gear||{})[n];if(!g)return "";return dhead(n)+dnote([g.type,g.bonuses,g.tags].filter(Boolean).join(" · "))+dnote(g.effect);}).join("");
 return dsect("TALENTS",tal)+dsect("TRIGGER SKILLS",sk)+dsect("GEAR",gear)+`<div class="muted" style="margin-top:10px;font:11px var(--mono)">RULES DATA © MASSIF PRESS (LANCER) · @MASSIF/LANCER-DATA 3.1.7 · GPL-3.0-OR-LATER</div>`;}
function detailMech(m){const d=D();if(!d.weapons&&!d.systems)return "";
 const items=ditems(mstr(m)).map(n=>[n,(d.weapons||{})[n]]).filter(x=>x[1]);
 const seen={};items.forEach(x=>{if(x[1].desc)seen[x[1].desc]=(seen[x[1].desc]||0)+1});
 const kw=(k,v)=>th(k,esc(v||"—"));
 const stat=w=>table(kw("MOUNT",w.mount)+kw("TYPE",w.type)+kw("DAMAGE",w.damage)+kw("RANGE",w.range)+kw("TAGS",w.tags)+kw("LICENSE",w.license));
 /* One blurb covers every weapon of a manufacturer, so it prints once above the list rather than per weapon. */
 const blurb=[...new Set(items.map(x=>x[1].desc).filter(t=>t&&seen[t]>1))].map(t=>dnote(t)).join("");
 /* Each weapon is one grid cell, so a wide monitor reads two or three across instead of one
    full-width stack each. The blurb stays outside the grid: it covers the whole section. */
 const wep=`<div class="wep-grid">`+items.map(([n,w])=>`<div class="weapon">`+(dhead(n)+stat(w)+(w.desc&&seen[w.desc]===1?dnote(w.desc):"")+dnote(w.effect)
  +(w.profiles||[]).map(p=>dhead(p.name)+table(kw("DAMAGE",p.damage)+kw("RANGE",p.range)+kw("TAGS",p.tags))+dnote(p.effect)
    +(p.actions||[]).map(a=>dnote((a.name||"")+(a.activation?` (${a.activation})`:"")+": "+a.detail)).join("")).join(""))+`</div>`).join("")+`</div>`;
 const sys=dnames(systemString(m)).map(n=>{const s=(d.systems||{})[n];if(!s)return "";return dhead(n)+dnote("SP "+s.sp+(s.tags?" · "+s.tags:"")+(s.license?" · "+s.license:""))+dnote(s.effect);}).join("");
 const f=(d.frames||{})[m.frame];
 const fr=f?dhead(m.frame)+dnote([f.source,f.mechtype,"MOUNTS: "+f.mounts].filter(Boolean).join(" · "))+(f.traits||[]).map(t=>dnote(t.name+": "+t.description)).join("")+(f.core?dnote("CORE "+f.core.name+": "+f.core.description):""):"";
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
/* Two frames share one map. SYSTEM is the star's bodies and their orbit rings; THEATER is one body's
   surface and approaches, at its own scale. The closed set below is why an unknown kind throws. */
const KINDS={
 PLANET:{k:"k-planet",s:`<circle class="shape" r="13"/>`},
 MOON:{k:"k-moon",s:`<circle class="shape" r="7"/>`},
 STATION:{k:"k-station",s:`<rect class="shape" x="-7" y="-7" width="14" height="14"/>`},
 "WRECK FIELD":{k:"k-wreck",s:`<polygon class="shape" points="0,-9 9,0 0,9 -9,0"/>`},
 CITY:{k:"k-city",s:`<polygon class="shape" points="0,-9 9,-3 9,6 -9,6 -9,-3"/>`},
 DISTRICT:{k:"k-district",s:`<polygon class="shape" points="-8,-6 8,-6 8,6 -8,6"/>`},
 FOB:{k:"k-fob",s:`<polygon class="shape" points="0,-9 9,7 -9,7"/>`},
 ZONE:{k:"k-zone",s:`<circle class="shape" r="9" fill="none" stroke-dasharray="2 3"/>`},
 ORBITAL:{k:"k-orbital",s:`<polygon class="shape" points="0,-4 11,0 0,4 -11,0"/>`}
};
const LEVELS={
 SYSTEM:{head:"SECTOR HOLOMAP",sub:"CRESSIDIUM SYSTEM",grid:"SECTOR GRID · 50 U",aria:"Sector holomap: the star's bodies and their orbits. Select a body to read its file."},
 THEATER:{head:"THEATER HOLOMAP",sub:"NOV ELYSIA AND APPROACHES",grid:"THEATER GRID · 10 U",aria:"Theater holomap: Nov Elysia, its districts, and the ground approaches. Select a site to read its file."}};
let frame=null;
/* Pure: returns the markup for one frame. Ops legs are drawn only where both ends are on the frame. */
function holomap(level){
 if(level!=="SYSTEM"&&level!=="THEATER")throw new Error(`holomap: ${level} is not a level`);
 const here=C.locations.filter(l=>l.level===level),X=l=>l.x*10,Y=l=>l.y*4.8;
 /* Only an operation that has actually been flown is "current". Op 001 is planned and unbriefed, so a
    green current-op ring on its area would claim live tracking the record cannot support. */
 const cur=(o=>o&&o.type!=="PLANNED"&&o.status!=="UNBRIEFED"?o.loc:"")(C.ops[0]);
 here.forEach(l=>{if(!KINDS[l.kind])throw new Error(`holomap: ${l.id} is a ${l.kind}, which has no marker`)});
 const on=id=>{const l=L[id];return !!l&&l.level===level};
 const legs=level==="THEATER"?["dock",...[...C.ops].sort((a,b)=>String(a.id).localeCompare(String(b.id),undefined,{numeric:true})).map(o=>o.loc)]:[];
 const legsOn=legs.filter(on);
 const lines=legsOn.slice(1).map((id,i)=>{const a=L[legsOn[i]],b=L[id],plan=!b.visited;
  return `<line x1="${X(a)}" y1="${Y(a)}" x2="${X(b)}" y2="${Y(b)}" stroke="var(${plan?"--muted":"--lime"})" stroke-width="1.5" stroke-dasharray="${plan?"4 6":"6 6"}" opacity=".7"/>`}).join("");
 /* A zone centred on a site adds no label: that site's own file already states who holds it. */
 const zones=level==="THEATER"?C.factions.filter(f=>f.zone).map(f=>{const near=here.some(l=>Math.hypot(l.x-f.zone.x,l.y-f.zone.y)<5);
  return `<ellipse cx="${f.zone.x*10}" cy="${f.zone.y*4.8}" rx="${f.zone.rx}" ry="${f.zone.ry}" fill="var(--${esc(f.zone.c)})" fill-opacity=".05" stroke="var(--${esc(f.zone.c)})" stroke-opacity=".35" stroke-dasharray="2 5"/>`+(near?"":`<text class="zl" x="${Math.min(910,Math.max(90,f.zone.x*10))}" y="${f.zone.y*4.8+f.zone.ry+14}" text-anchor="middle">${esc(f.name.toUpperCase())}</text>`)}).join(""):"";
 /* Rings are orbits, so only things that orbit get one: a district does not orbit its city. */
 const orbitKinds=["MOON","STATION","ORBITAL"];
 const rings=here.filter(l=>l.parent&&on(l.parent)&&orbitKinds.includes(l.kind)).map(l=>{const p=L[l.parent];
  return `<circle cx="${X(p)}" cy="${Y(p)}" r="${Math.round(Math.hypot(X(l)-X(p),Y(l)-Y(p)))}" fill="none" stroke="var(--line)" stroke-dasharray="3 5"/>`}).join("");
 /* A framed site is not its own node in the frame above it: it hangs under the body it sits on. */
 const hostsOf=id=>C.locations.filter(x=>x.frame===id&&x.level!==level);
 /* The console's plan badges: insertion, rendezvous and extraction ground off the op, plus the
    hostile areas and the muster hull. situation() owns the roles, the map only draws them. */
 /* One ground can hold two roles: the Rio Grande is both the extraction destination and the
    recorded muster hull, so a location maps to a list of badges, not to whichever was pushed last. */
 const marks=new Map();
 situation().badges.forEach(b=>{const a=marks.get(b.loc)||[];a.push(b);marks.set(b.loc,a)});
 const nodes=here.map(l=>{const hosts=hostsOf(l.id),bs=marks.get(l.id)||[];
  return `<g class="node${l.visited?"":" unv"}${l.id===cur?" cur":""}${bs.map(b=>" badge-"+b.role).join("")}" data-loc="${esc(l.id)}" transform="translate(${X(l)} ${Y(l)})" role="button" tabindex="0" aria-label="${esc(l.kind)} ${esc(l.name)}${l.visited?"":", unvisited"}${l.id===cur?", current operation":""}${bs.length?", "+esc(bs.map(b=>b.label).join(", ")):""}${hosts.length?`, ${hosts.length} local site${hosts.length>1?"s":""}`:""}"><circle r="28" fill="transparent"/>${KINDS[l.kind].s}<text y="${l.ly!=null?l.ly:(l.kind==="PLANET"?36:30)}" text-anchor="middle">${esc(l.name)}</text>${hosts.map((h,i)=>`<text class="site" y="${(l.ly!=null?l.ly+12:(l.kind==="PLANET"?48:42))+i*12}" text-anchor="middle">${esc(h.name)} SITE</text>`).join("")}${bs.map((b,i)=>`<text class="badge-label" y="${-30-i*12}" text-anchor="middle">${esc(b.label)}</text>`).join("")}</g>`}).join("");
 const kinds=here.map(l=>l.kind).filter((k,i,a)=>a.indexOf(k)===i);
 const key=kinds.map(k=>`<li><span class="k-shape ${KINDS[k].k}"></span>${esc(k)}</li>`).join("")
  +(here.some(l=>!l.visited)?`<li><span class="k-shape k-unv"></span>UNVISITED</li>`:"")
  +(on(cur)?`<li><span class="k-shape k-cur"></span>CURRENT OP</li>`:"")
  +(legsOn.slice(1).some(id=>L[id].visited)?`<li><span class="k-line"></span>TRAVELLED</li>`:"")
  +(legsOn.slice(1).some(id=>!L[id].visited)?`<li><span class="k-line k-planned"></span>PLANNED LEG</li>`:"")
  +(rings?`<li><span class="k-orbit"></span>ORBIT</li>`:"")
  +(level==="THEATER"?`<li><button class="k-level" type="button" data-level="SYSTEM" aria-label="Back out to the sector view">SYSTEM VIEW</button></li>`:"");
 return {world:zones+rings+lines+nodes,key,grid:LEVELS[level].grid,aria:LEVELS[level].aria};
}
/* Pinch ratios are hysteretic: a gesture has to travel 1.35x or 0.74x before it counts as a zoom,
   so a sloppy two-finger tap, or a drift part-way through a gesture, fires nothing. */
const pinchIntent=ratio=>ratio>=1.35?"in":ratio<=.74?"out":"";
/* The frame the campaign is actually on: ops land on the theater, so that is what opens. */
const startLevel=()=>{const l=L[C.ops[0]&&C.ops[0].loc];return l&&l.level==="THEATER"?"THEATER":"SYSTEM"};
function fitLevel(level){
 const at=level||startLevel(),m=holomap(at),world=el("holo-world");
 frame=at;
 if(!world)return m;          /* pages without a map still get the pane chips */
 /* The frame swap is a cut, not a camera move: the world's transition rides with the zoom only. */
 world.style.transition="none";
 world.innerHTML=m.world;world.style.transform="";
 if(typeof requestAnimationFrame==="function")requestAnimationFrame(()=>{world.style.transition=""});
 const key=document.querySelector(".holo-key");if(key)key.innerHTML=m.key;
 const head=el("route-heading");if(head)head.textContent=LEVELS[at].head;
 const sub=el("holo-sub");if(sub)sub.textContent=LEVELS[at].sub;
 const grid=el("holo-grid");if(grid)grid.textContent=m.grid;
 const svg=document.querySelector("#holomap svg");if(svg)svg.setAttribute("aria-label",m.aria);
 const card=document.querySelector(".holo");if(card){card.classList.toggle("theater",at==="THEATER");card.classList.toggle("system",at==="SYSTEM")}
 /* The frame can also change from a chip in the reading pane, so the back control is synced here
    rather than only in the map's own click handlers. */
 if(UI.syncBack)UI.syncBack();
 return m;
}
function unitFile(id){const l=L[id];if(!l)return "";
 const here=filed.filter(o=>o.loc===id),sats=C.locations.filter(x=>x.parent===id),enter=C.locations.filter(x=>x.frame===id);
 return `<div class="tag">UNIT STATUS · ${esc(l.kind)}</div><h3 class="mission-title">${esc(l.name)}</h3>`
  +(l.img?`<div class="mech-thumb">${pic(l.img,l.name)}</div>`:"")
  +(l.notes?`<div class="muted">${esc(l.notes)}</div>`:"")+table(
  th("LOCATION STATUS",l.visited?"VISITED":"UNVISITED")+th("FACTION / CONTROL",F[l.faction]?esc(F[l.faction].name):"Unclaimed / not recorded")+th(l.parent?(["MOON","STATION","ORBITAL"].includes(l.kind)?"IN ORBIT":"WITHIN"):"IN ORBIT",l.parent?locBtn(l.parent):"None")+
  th("NEARBY SITES",sats.map(x=>locBtn(x.id)).join(" · ")||"None recorded")+th("NOTABLE PERSONNEL",C.personnel.filter(p=>p.lastKnown===id).map(p=>personCard(p.id)).join("")||"None recorded")+th("OPERATIONS HERE",here.map(opLink).join("<br>")||"None filed")+
  th("UNIT RECORD",here.map(o=>esc(o.outcome)).join("<br>")||"No deeds recorded at this location"))
  +(enter.length?`<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:10px">${enter.map(x=>`<button class="chip" type="button" data-loc="${esc(x.id)}">ENTER THEATER · ${esc(x.name)}</button>`).join("")}</div>`:"")}
function showUnit(id){const l=L[id];if(!l||!panel())return;if(l.level&&l.level!==frame)fitLevel(l.level);
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
if(el("timeline"))el("timeline").innerHTML=C.events.map(ev=>`<li><div class="time">${esc(ev.date)}</div><div class="activity-title">${esc(ev.title)}</div><div class="muted" style="font:13px var(--mono)">${ev.op?`<a href="index.html#op-${esc(ev.op)}">OP ${esc(ev.op)}</a> · `:""}${esc(ev.note)}</div></li>`).join("")||`<li><div class="muted">No deeds filed yet.</div></li>`;
if(el("crew-list")){el("crew-count").textContent=`${String(C.pilots.length).padStart(2,"0")} ACTIVE RECORDS`;
 el("crew-list").innerHTML=C.pilots.map(p=>{const mine=pilotOps(p.id).reverse();
 return `<article class="card patrol" data-pilot="${esc(p.id)}"><div class="card-pad mech-card">${p.img?`<div class="mech-thumb">${pic(p.img,p.name)}</div>`:`<div class="avatar">${esc(p.name.replace(/\u201c([^\u201d]*)\u201d/,"$1").trim()[0])}</div>`}<div class="mech-id"><a class="crew-name" href="pilot.html#${esc(p.id)}">${esc(p.name)}</a><div class="crew-role">${esc(p.background||"")}</div>${table(th("STATUS",pill(p.status,"lime"))+th("CHASSIS",p.mech&&M[p.mech]?`<a href="mech.html#${esc(p.mech)}">${esc(M[p.mech].name)}</a>`:"None assigned"))}<div style="margin-top:8px">${link("pilot.html#"+p.id,"VIEW DOSSIER →")}</div></div><div class="mech-matrix">${table(th("TRIGGERS",esc(p.triggers||""))+th("TALENTS",esc(p.talents||""))+th("GEAR",esc(p.gear||""))+th("DEPLOYED",mine.map(opLink).join("<br>")||"Never"))}</div></div></article>`}).join("")}
if(el("mech-list")){el("mech-count").textContent=`${String(C.mechs.length).padStart(2,"0")} MECH RECORDS`;
 el("mech-list").innerHTML=C.mechs.map(m=>{const mine=mechOps(m.id).reverse(),last=filed.filter(o=>o.mechs.includes(m.id)).pop(),at=stationed(m.id),nf="NOT FILED";
 return `<article class="card patrol" data-mech="${esc(m.id)}"><div class="card-pad mech-card"><div class="mech-thumb">${m.img?pic(m.img,m.name):`<div class="plate"><span class="mech-silhouette">${esc(m.glyph)}</span></div>`}</div><div class="mech-id"><div class="tag">${esc(m.frame)} · SIZE ${esc(msize(m))}</div><a class="mech-title" href="mech.html#${esc(m.id)}">${esc(m.name)}</a>${table(th("PILOT",esc(P[m.pilot]?P[m.pilot].name.replace(/\u201c([^\u201d]*)\u201d/,"$1"):"UNASSIGNED"))+th("ROLE",esc(m.role||""))+th("STATE",`${esc(m.state??"")}${m.missing?` \u00b7 ${esc(m.missing)}`:""}`)+th("LOADOUT",esc(mstr(m)))+th("SYSTEMS",esc(systemString(m)||"")))}<div style="margin-top:8px">${link("mech.html#"+m.id,"OPEN FILE →")}</div></div><div class="mech-matrix">${table(th("STATIONED",at?esc(L[at].name):C.meta.station?esc(C.meta.station):"")+(m.conditions?.length?th("CONDITIONS",m.conditions.map(c=>pill(c,"rust")).join("")):"")+th("HP · ARMOR",m.hp!=null&&m.hp!==""?`${esc(hpNow(m))}/${esc(m.hp)} · ${esc(m.armor??"—")}`:nf)+th("STRUCTURE · STRESS",`${esc(m.structure??"—")} · ${esc(m.stress??"—")}`)+th("HEAT · REPAIR",`${esc(heatNow(m)??"—")}/${esc(m.heat??"—")} · ${esc(repairsNow(m)??"—")}/${esc(m.repair??"—")}`)+th("HULL · AGI · SYS · ENG",`${esc(m.hull??"—")} · ${esc(m.agi??"—")} · ${esc(m.sys??"—")} · ${esc(m.eng??"—")}`)+th("EVA · SPD · E-DEF · SENS · SAVE",`${esc(m.eva)} · ${esc(m.spd)} · ${esc(m.edef)} · ${esc(m.sens??"—")} · ${esc(m.save??"—")}`)+th("ATK · TECH · LTD",`${esc(m.attackBonus??"—")} · ${esc(m.tech)} · ${esc(m.limitedBonus??"—")}`)+th("DEPLOYED",mine.map(opLink).join("<br>")||"Never")+(last?th("LAST OUTCOME",esc(last.outcome)):""))}</div></div></article>`}).join("")}
if(el("faction-list"))el("faction-list").innerHTML=factionTable()
function pilotDossier(id){if(!P[id]&&legacyPilotId[id])id=legacyPilotId[id];const p=P[id];if(!p)return notFound("pilot",id);
 const m=p.mech?M[p.mech]:null,mine=pilotOps(id).reverse();
 return `<section class="hero"><div class="hero-copy"><div class="eyebrow">${esc(p.background||"")}</div><h1>${esc(p.name)}</h1><div class="hero-meta"><span>${pill(p.status,"lime")}</span></div></div>`+
  (p.img?`<div class="hero-art"><div class="plate"><img class="hero-mech-img" src="${esc(p.img)}" alt="${esc(p.name)}"></div></div>`:"")+`</section>`+
  `<div class="columns"><div class="primary fill"><section><div class="section-head"><h2>PILOT FILE</h2><span>PERSONNEL</span></div><div class="card"><div class="card-pad">`+table(
  th("STATUS",pill(p.status,"lime"))+th("CHASSIS",m?link("mech.html#"+m.id,m.name):"None assigned")+
  th("TRIGGERS",esc(p.triggers||"NOT FILED"))+th("TALENTS",esc(p.talents||"NOT FILED"))+
  (p.doctrine?th("DOCTRINE",link(p.doctrine,(p.doctrineTitle||"BUILD GUIDE")+" →")):"")+th("GEAR",esc(p.gear||"NOT FILED"))+
  th("DEPLOYED",mine.map(opLink).join("<br>")||"Never"))+
  `</div></div></section></div><aside class="aside fill"><section><div class="section-head"><h2>CHASSIS</h2><span>${m?esc(m.role||""):"NONE"}</span></div><div class="card"><div class="card-pad">`+
  (m?`<div class="mech-card"><div class="mech-thumb">${m.img?pic(m.img,m.name):`<div class="plate"><span class="mech-silhouette">${esc(m.glyph||"?")}</span></div>`}</div><div><div class="tag">${esc(m.frame)} · SIZE ${esc(msize(m))}</div><div class="mech-title">${esc(m.name)}</div><div class="muted" style="margin-top:6px;font:13px var(--mono)">${link("mech.html#"+m.id,"OPEN FILE →")}</div></div></div>`
    :`<div class="muted">No chassis assigned.</div>`)+
  `</div></div></section>`+(m?chassisFile(m,true):"")+`</aside></div>`+detailPilot(p);
}
/* The mech dossier's aside runs short against the chassis file; the pilot's own rows fill it. */
const pilotFile=p=>p?`<section><div class="section-head"><h2>PILOT FILE</h2><span>PERSONNEL</span></div><div class="card"><div class="card-pad">`+table(
 th("STATUS",pill(p.status,"lime"))+th("TRIGGERS",esc(p.triggers||"NOT FILED"))+th("TALENTS",esc(p.talents||"NOT FILED"))+th("GEAR",esc(p.gear||"NOT FILED"))+
 th("DEPLOYED",pilotOps(p.id).reverse().map(opLink).join("<br>")||"Never"))+`</div></div></section>`:"";
/* Mirror of pilotFile: the mech dossier's own rows, reused as the pilot dossier's aside so both
   columns end level. A pilot's page carries the summary; the mech's own page carries the full file. */
const chassisRows=(m,summary)=>{const p=m.pilot?P[m.pilot]:null,mine=mechOps(m.id).reverse(),last=filed.filter(o=>o.mechs.includes(m.id)).pop(),at=stationed(m.id);
 return summary?th("LOADOUT",esc(mstr(m)||"—"))+th("SYSTEMS",esc(systemString(m)||"—"))+th("DEPLOYED",mine.map(opLink).join("<br>")||"Never"):(
  th("PILOT",p?link("pilot.html#"+p.id,p.name.replace(/\u201c([^\u201d]*)\u201d/g,"$1")):"UNASSIGNED")+th("STATE",esc(m.state))+(m.conditions?.length?th("CONDITIONS",m.conditions.map(c=>pill(c,"rust")).join("")):"")+
  th("STATIONED",at&&L[at]?esc(L[at].name):C.meta.station?esc(C.meta.station):"—")+
  th("HP · ARMOR",m.hp!=null&&m.hp!==""?`${esc(hpNow(m))}/${esc(m.hp)} · ${esc(m.armor??"—")}`:"NOT FILED")+
  th("STRUCTURE · STRESS",`${esc(m.structure??"—")} · ${esc(m.stress??"—")}`)+
  th("HEAT · REPAIR",`${esc(heatNow(m)??"—")}/${esc(m.heat??"—")} · ${esc(repairsNow(m)??"—")}/${esc(m.repair??"—")}`)+
  th("HULL · AGI · SYS · ENG",`${esc(m.hull??"—")} · ${esc(m.agi??"—")} · ${esc(m.sys??"—")} · ${esc(m.eng??"—")}`)+
  th("EVA · SPD · E-DEF · SENS · SAVE",`${esc(m.eva??"—")} · ${esc(m.spd??"—")} · ${esc(m.edef??"—")} · ${esc(m.sens??"—")} · ${esc(m.save??"—")}`)+
  th("ATK · TECH · LTD",`${esc(m.attackBonus??"—")} · ${esc(m.tech??"—")} · ${esc(m.limitedBonus??"—")}`)+
  th("LOADOUT",esc(mstr(m)||"—"))+th("SYSTEMS",esc(systemString(m)||"—"))+
  th("DEPLOYED",mine.map(opLink).join("<br>")||"Never")+th("LAST OUTCOME",last&&last.outcome?esc(last.outcome):"NOT FILED"));
};
const chassisFile=(m,summary)=>`<section><div class="section-head"><h2>CHASSIS FILE</h2><span>${esc(m.state)}</span></div><div class="card"><div class="card-pad">`+table(chassisRows(m,summary))+`</div></div></section>`;
function mechDossier(id){const m=M[id];if(!m)return notFound("mech",id);
 const p=m.pilot?P[m.pilot]:null;
 return `<section class="hero"><div class="hero-copy"><div class="eyebrow">${esc(m.frame)} · SIZE ${esc(msize(m))}</div><h1>${esc(m.name)}</h1><div class="hero-meta"><span>${esc(m.role||"")}</span>${mechPill(m)}</div></div>`+
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
return {esc,byId,ops,filed,threadsOf,mechOps,pilotOps,stationed,el,th,table,chip,opLink,mechBtn,locBtn,pilotBtn,pill,mark,show,showAtMap,pilotDossier,mechDossier,detailPilot,detailMech,hpNow,ledgerPanel,campaignHead,pinchIntent,holomap,fitLevel,unitFile,personFile,personnelList,factionTable,situation,sessionBlock,sessionStep,sessionReview,L,P,M,F};
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
