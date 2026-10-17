/* Shared field-archive UI + patrol animation. Renders campaign.js into whatever
   sections a page declares; every render call is guarded by an element-presence
   check, so a page renders only the sections it includes. */
window.UI=(()=>{
const C=window.CAMPAIGN;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const byId=a=>Object.fromEntries(a.map(x=>[x.id,x]));
const L=byId(C.locations),P=byId(C.pilots),M=byId(C.mechs),F=byId(C.factions);
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
const pill=(t,c)=>`<span class="pill" style="border-color:var(--${c});color:var(--${c})">${esc(t)}</span>`;
const mechPill=m=>pill(m.state,/^OPERATIONAL/.test(m.state)?"lime":"rust");
const hpNow=m=>m.hpNow==null?m.hp:m.hpNow;
const msize=m=>m.size==null?1:m.size;
const D=()=>window.DETAIL||{};
const thumb=s=>String(s).replace(/\.png$/,"-thumb.webp");
const pic=(s,alt)=>`<picture><source srcset="${esc(thumb(s))}" type="image/webp"><img src="${esc(s)}" alt="${esc(alt)}"></picture>`;
function lightbox(){document.addEventListener("click",e=>{const img=e.target.closest(".hero-art img");if(!img)return;const o=document.createElement("div");o.className="lightbox";o.setAttribute("role","dialog");o.setAttribute("aria-label","Portrait full size, tap to close");o.innerHTML=`<img src="${esc(img.getAttribute("src"))}" alt="${esc(img.alt)}">`;o.addEventListener("click",()=>o.remove());document.body.append(o);});}
const dnote=t=>t?`<div class="muted" style="margin-top:4px;font:10px/1.6 var(--mono)">${esc(t)}</div>`:"";
const dhead=n=>`<div class="tag" style="margin-top:10px">${esc(n)}</div>`;
const dsect=(title,inner)=>inner?`<section><div class="section-head"><h2>${title}</h2><span>FIELD DETAIL</span></div><div class="card"><div class="card-pad">${inner}</div></div></section>`:"";
const dnames=s=>String(s||"").split(",").map(x=>x.trim()).filter(Boolean);
const ditems=s=>{const out=[];for(const seg of String(s||"").split("·").map(x=>x.trim()).filter(Boolean)){const mm=seg.match(/^[A-Za-z/ ]+:\s*(.+)$/);for(const it of (mm?mm[1]:seg).split("/").map(x=>x.trim()).filter(Boolean))out.push(it);}return out;};
function detailPilot(p){const d=D();if(!d.talents&&!d.gear&&!d.skills)return "";
 const tal=dnames(p.talents).map(n=>{const t=(d.talents||{})[n];if(!t)return "";return dhead(n)+dnote(t.terse)+(t.ranks||[]).map(r=>dnote("R"+r.rank+" "+r.name+": "+r.description)).join("");}).join("");
 const sk=dnames(p.triggers).map(s=>{const n=s.replace(/\s*\(\+\d+\)$/,"").trim();const e=(d.skills||{})[n];return e?dhead(n)+dnote(e.description):"";}).join("");
 const gear=dnames(p.gear).map(n=>{const g=(d.gear||{})[n];if(!g)return "";return dhead(n)+dnote([g.type,g.bonuses,g.tags].filter(Boolean).join(" · "))+dnote(g.effect);}).join("");
 return dsect("TALENTS",tal)+dsect("TRIGGER SKILLS",sk)+dsect("GEAR",gear)+`<div class="muted" style="margin-top:10px;font:9px var(--mono)">RULES DATA © MASSIF PRESS (LANCER) · @MASSIF/LANCER-DATA 3.1.7 · GPL-3.0-OR-LATER</div>`;}
function detailMech(m){const d=D();if(!d.weapons&&!d.systems)return "";
 const wep=ditems(m.loadout).map(n=>{const w=(d.weapons||{})[n];if(!w)return "";return dhead(n)+dnote([w.mount,w.type,w.damage,w.range,w.tags,w.license].filter(Boolean).join(" · "))+dnote(w.effect);}).join("");
 const sys=dnames(m.systems).map(n=>{const s=(d.systems||{})[n];if(!s)return "";return dhead(n)+dnote("SP "+s.sp+(s.tags?" · "+s.tags:"")+(s.license?" · "+s.license:""))+dnote(s.effect);}).join("");
 const f=(d.frames||{})[m.frame];
 const fr=f?dhead(m.frame)+dnote([f.source,f.mechtype,"MOUNTS: "+f.mounts].filter(Boolean).join(" · "))+(f.traits||[]).map(t=>dnote(t.name+": "+t.description)).join("")+(f.core?dnote("CORE "+f.core.name+": "+f.core.description):""):"";
 return dsect("MOUNTED WEAPONS",wep)+dsect("SYSTEMS",sys)+dsect("FRAME",fr);}
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
 const card=document.querySelector(`#${host==="pilot"?"crew-list":"mech-list"} [data-${host}="${CSS.escape(id)}"]`);
 if(card&&panel().parentElement===card.querySelector(`[data-detail-host="${host}"]`)){panel().classList.add("pane-out");setTimeout(()=>{if(!panel().classList.contains("pane-out"))return;panelHome().append(panel());panel().classList.remove("pane-out","pane-in")},120);return true}
 return showAtRecord(host,id);
};
const showAtMap=(kind,id)=>{panelHome().append(panel());show(kind,id);animatePane()};
function showUnit(id){const l=L[id];if(!l||!panel())return;const here=filed.filter(o=>o.loc===id),sats=C.locations.filter(x=>x.parent===id);
 mark("loc",id);
 panel().innerHTML=`<div class="tag">UNIT STATUS · ${esc(l.kind)}</div><h3 class="mission-title">${esc(l.name)}</h3>`+table(
  th("LOCATION STATUS",l.visited?"VISITED":"UNVISITED")+th("FACTION / CONTROL",F[l.faction]?esc(F[l.faction].name):"Unclaimed / not recorded")+th("IN ORBIT",l.parent?locBtn(l.parent):"None")+
  th("NEARBY SITES",sats.map(x=>locBtn(x.id)).join(" · ")||"None recorded")+th("OPERATIONS HERE",here.map(opLink).join("<br>")||"None filed")+
  th("UNIT RECORD",here.map(o=>esc(o.outcome)).join("<br>")||"No deeds recorded at this location"))}
function showMech(id){const m=M[id];if(!m||!panel())return;const mine=mechOps(id).reverse(),last=filed.filter(o=>o.mechs.includes(id)).pop(),at=stationed(id),nf="NOT FILED";
 mark("mech",id);
 panel().innerHTML=`<div class="tag">${esc(m.frame)} · SIZE ${esc(msize(m))}</div><h3 class="mission-title">${esc(m.name)}</h3>`+table(
  th("PILOT",pilotBtn(m.pilot))+th("STATE",esc(m.state))+th("STATIONED",at?locBtn(at):C.meta.station?esc(C.meta.station):"")+
  th("HP · ARMOR",m.hp!=null&&m.hp!==""?`${esc(hpNow(m))}/${esc(m.hp)} · ${esc(m.armor??"—")}`:nf)+th("STRUCTURE · STRESS",`${esc(m.structure??"—")} · ${esc(m.stress??"—")}`)+
  th("HEAT · REPAIR",`${esc(m.heat??"—")} · ${esc(m.repair??"—")}`)+th("HULL · AGI · SYS · ENG",`${esc(m.hull??"—")} · ${esc(m.agi??"—")} · ${esc(m.sys??"—")} · ${esc(m.eng??"—")}`)+th("REPAIR",m.repair??"—")+th("EVA · SPD · E-DEF · SENS · SAVE",`${esc(m.eva)} · ${esc(m.spd)} · ${esc(m.edef)} · ${esc(m.sens??"—")} · ${esc(m.save??"—")}`)+th("ATK · TECH · LTD",`${esc(m.attackBonus??"—")} · ${esc(m.tech)} · ${esc(m.limitedBonus??"—")}`)+
  th("LOADOUT",esc(m.loadout||""))+th("SYSTEMS",esc(m.systems||""))+
  th("DEPLOYED",mine.map(opLink).join("<br>")||"Never")+th("LAST OUTCOME",last?esc(last.outcome):""))}
function showPilot(id){const p=P[id];if(!p||!panel())return;const mine=pilotOps(id).reverse();
 mark("pilot",id);
 panel().innerHTML=`<div class="tag">${esc(p.background||"")}</div><h3 class="mission-title">${esc(p.name)}</h3>`+table(
  th("STATUS",pill(p.status,"lime"))+th("CHASSIS",p.mech?mechBtn(p.mech):"None assigned")+
  th("TRIGGERS",esc(p.triggers||""))+th("TALENTS",esc(p.talents||""))+th("GEAR",esc(p.gear||""))+
  th("DEPLOYED",mine.map(opLink).join("<br>")||"Never"))}
function show(kind,id){kind==="mech"?showMech(id):kind==="pilot"?showPilot(id):showUnit(id)}
document.addEventListener("click",e=>{const t=e.target.closest("[data-mech],[data-loc],[data-pilot]");if(!t)return;
 if(e.target.closest("a"))return;
 const k=t.dataset.mech?"mech":t.dataset.pilot?"pilot":"loc",v=t.dataset.mech||t.dataset.pilot||t.dataset.loc;
 if(t.closest("#record-detail")){show(k,v);return}
 if(t.matches("article[data-pilot],article[data-mech]")){toggleRecord(t.dataset.pilot?"pilot":"mech",v);return}
 if(k==="mech"||k==="pilot")return;
 showAtMap(k,v);
 if(t.closest(".holo-svg"))el("holomap").scrollIntoView({block:"nearest",behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"})});
const latest=filed[0];
if(el("hero-tagline")&&C.meta&&C.meta.tagline)el("hero-tagline").textContent=C.meta.tagline;
const upcoming=ops.filter(o=>o.type==="PLANNED").pop();
if(el("hero-meta")&&(latest||upcoming))el("hero-meta").innerHTML=(latest?`<div>CURRENT AREA<strong>${esc(L[latest.loc].name)}</strong></div><div>OPEN CONTRACTS<strong>${String(filed.length-filed.filter(o=>/COMPLETED/.test(o.status)).length).padStart(2,"0")}</strong></div><div>LAST DEPLOYMENT<strong>OPERATION ${esc(latest.id)}</strong></div>`:`<div>HEADING<strong>${esc(L[upcoming.loc].name)}</strong></div><div>NEXT DEPLOYMENT<strong>OP ${esc(upcoming.id)} · ${esc(upcoming.title)}</strong></div>`)+(C.meta&&C.meta.updated?`<div>LAST UPDATE<strong>${esc(C.meta.updated)}</strong></div>`:"");
if(el("stats"))el("stats").innerHTML=[["MISSIONS",filed.length],["COMPLETED",filed.filter(o=>/COMPLETED/.test(o.status)).length],["ACTIVE PILOTS",C.pilots.filter(p=>p.status==="ACTIVE").length],["KNOWN FACTIONS",C.factions.length]].map(([k,v])=>`<div class="stat"><label>${k}</label><strong>${String(v).padStart(2,"0")}</strong></div>`).join("");
if(el("readiness")){const open=C.threads.filter(t=>t.status!=="CLOSED").length;
 el("ready-count").textContent=`${C.mechs.length} CHASSIS · ${open} OPEN THREADS`;
 el("readiness").innerHTML=`<table class="threads-table"><thead><tr><th>CHASSIS</th><th>PILOT</th><th>ROLE</th><th>HULL</th><th>STATUS</th></tr></thead><tbody>`+C.mechs.map(m=>{const p=P[m.pilot],nw=p?p.name.replace(/\u201c([^\u201d]*)\u201d/,"$1").replace(/\s+/g," ").trim().split(" "):[];return `<tr><td>${esc(m.name)}</td><td>${p?esc(nw.length>1?nw[0].charAt(0)+". "+nw[nw.length-1]:nw[0]):"UNASSIGNED"}</td><td class="muted">${esc(m.role||"")}</td><td>${m.hp!=null&&m.hp!==""?`<span class="hp-pips">${"\u25b0".repeat(Math.max(0,Math.round(hpNow(m)/2)))}${"\u25b1".repeat(Math.max(0,Math.round(m.hp/2)-Math.round(hpNow(m)/2)))} ${hpNow(m)}/${m.hp}</span>`:'<span class="muted">\u2014</span>'}</td><td>${mechPill(m)}</td></tr>`}).join("")+"</tbody></table>"+
  (()=>{const next=C.ops.filter(o=>o.type==="PLANNED").sort((a,b)=>String(a.id).localeCompare(String(b.id),undefined,{numeric:true}))[0];return next?`<div class="tag" style="display:block;margin-top:14px">NEXT OP</div><div style="font:13px var(--mono);margin-top:5px">OP ${esc(next.id)} · ${esc(next.title)}</div><div class="muted" style="font:10px var(--mono);margin-top:4px">${esc(L[next.loc].name)} · ${L[next.loc].visited?"VISITED":"UNVISITED"} · ${esc(next.outcome)}</div>`:`<div class="tag" style="display:block;margin-top:14px">NEXT OP</div><div class="muted" style="font:10px var(--mono);margin-top:5px">NO BRIEF FILED</div>`})()}
if(el("ops")){el("ops-count").textContent=`MISSION ARCHIVE / ${String(C.ops.length).padStart(3,"0")} RECORDS`;
 el("ops").innerHTML=ops.map(o=>{const l=L[o.loc],par=l.parent?L[l.parent]:null,open=threadsOf(o.id);
 return `<details class="card patrol" id="op-${esc(o.id)}"><summary class="card-pad"><div class="mission-row"><div><div class="tag"><span class="op-caret" aria-hidden="true"></span>OPERATION ${esc(o.id)} · ${esc(o.type)}</div><h3 class="mission-title">${esc(o.title)}</h3><div class="muted">CLIENT: ${o.client?esc(F[o.client].name.toUpperCase()):"NONE"} · AREA: ${esc(l.name)}${par?" ("+esc(par.name)+")":""}</div></div>${opPill(o)}</div></summary><div class="card-pad op-body">`+table(
  th("LOCATION",esc(l.name+" · "+l.kind))+th("OVERVIEW",esc(o.summary||""))+th("CURRENT MISSION",o.mission?`<a class="chip" href="${esc(o.mission.href)}">${esc(o.mission.title)} →</a>`:"")+th("CREW",(o.crew||[]).map(pilotBtn).join("")||"None")+th("MECHS",(o.mechs||[]).map(mechBtn).join("")||(o.type==="PLANNED"?"":"None deployed"))+
  th("ROUNDS",o.rounds==null?"":esc(o.rounds))+th("OUTCOME",esc(o.outcome))+th("LEFT HANGING",open.map(t=>esc(t.text)+(t.status!=="OPEN"?" ("+esc(t.status)+")":"")).join("<br>")||"Nothing open")+th("FILED",esc(o.date)))+`</div></details>`}).join("")}
/* Crew-facing OPORD: rendered from the op record so any mission page reuses one shape.
   Annex A (task org + callsigns) is generated from the roster; the rest is op.opord data. */
const callsign=n=>(String(n).match(/\u201c([^\u201d]*)\u201d/)||[,""])[1]||"\u2014";
const opLine=t=>`<li>${esc(t)}</li>`;
const opSub=s=>`<li>${s[0]?`<b>${esc(s[0])}.</b> `:""}${Array.isArray(s[1])?`<ol class="opord-lines">${s[1].map(opLine).join("")}</ol>`:esc(s[1])}</li>`;
const opBody=b=>Array.isArray(b)?`<ol class="opord-sub">${b.map(opSub).join("")}</ol>`:`<p class="opord-body">${esc(b)}</p>`;
const opAnnex=(letter,title,inner)=>`<div class="card opord-annex"><div class="card-pad"><div class="tag">ANNEX ${esc(letter)} \u00b7 ${esc(title)}</div>${inner}</div></div>`;
const opTaskOrg=o=>`<table class="threads-table"><thead><tr><th>CALLSIGN</th><th>PILOT</th><th>CHASSIS</th><th>FRAME \u00b7 SIZE</th><th>ROLE</th></tr></thead><tbody>`+
 (o.crew||[]).map(id=>{const p=P[id];if(!p)return "";const m=p.mech?M[p.mech]:null;
 return `<tr><td>${esc(callsign(p.name))}</td><td>${link("pilot.html#"+p.id,p.name)}</td><td>${m?link("mech.html#"+m.id,m.name):"\u2014"}</td><td>${m?esc(m.frame+" \u00b7 SIZE "+msize(m)):"\u2014"}</td><td>${esc(m&&m.role||"")}</td></tr>`}).join("")+"</tbody></table>";
function opordDoc(o){const d=o.opord,br=a=>(a||[]).map(esc).join("<br>"),letter=i=>"ABCDEFGH"[i]||String(i+1);
 return `<div class="opord-class">${esc(d.class)}</div>`+
 `<div class="card"><div class="card-pad"><div class="tag">OPERATION ORDER \u00b7 OP ${esc(o.id)} \u00b7 ${esc(o.title)}</div><h3 class="mission-title">${esc(d.no)}</h3>`+table(
 th("ISSUING HQ",esc(d.hq))+th("CLIENT",o.client&&F[o.client]?esc(F[o.client].name.toUpperCase()):"NONE")+th("DTG OF ORDER",esc(d.dtg))+th("H-HOUR",esc(d.hhour))+th("REFERENCES",br(d.refs))+
 th("DISTRIBUTION",br(d.distribution))+th("STATUS",opPill(o)))+`</div></div>`+
 `<div class="card"><div class="card-pad">`+d.paras.map((p,i)=>`<div class="opord-para"><h4>${i+1}. ${esc(p[0])}</h4>${opBody(p[1])}</div>`).join("")+`</div></div>`+
 opAnnex(letter(0),"TASK ORGANIZATION AND CALLSIGNS",opTaskOrg(o))+
 d.annexes.map((a,i)=>opAnnex(letter(i+1),a[0],`<ol class="opord-lines">${a[1].map(opLine).join("")}</ol>`)).join("")+
 `<div class="opord-class">${esc(d.class)}</div>`;}
if(el("opord")){const host=el("opord"),o=C.ops.find(x=>String(x.id)===(host.dataset.op||""));
 host.innerHTML=o&&o.opord?opordDoc(o):notFound("operation order",host.dataset.op||"");}
if(el("threads-body"))el("threads-body").innerHTML=C.threads.slice().sort((a,b)=>a.op.localeCompare(b.op)).map(t=>`<tr><td>${esc(t.text)}</td><td>OP ${esc(t.op)}</td><td>${threadPill(t)}</td></tr>`).join("")||`<tr><td colspan="3" class="muted">Nothing seeded yet.</td></tr>`;
if(el("timeline"))el("timeline").innerHTML=C.events.map(ev=>`<li><div class="time">${esc(ev.date)}</div><div class="activity-title">${esc(ev.title)}</div><div class="muted" style="font:10px var(--mono)">${ev.op?`<a href="#op-${esc(ev.op)}">OP ${esc(ev.op)}</a> · `:""}${esc(ev.note)}</div></li>`).join("")||`<li><div class="muted">No deeds filed yet.</div></li>`;
if(el("crew-list")){el("crew-count").textContent=`${String(C.pilots.length).padStart(2,"0")} ACTIVE RECORDS`;
 el("crew-list").innerHTML=C.pilots.map(p=>`<article class="card patrol" data-pilot="${esc(p.id)}"><div class="card-pad"><div class="crew">${p.img?`<div class="mech-thumb">${pic(p.img,p.name)}</div>`:`<div class="avatar">${esc(p.name.replace(/\u201c([^\u201d]*)\u201d/,"$1").trim()[0])}</div>`}<div><a class="crew-name" href="pilot.html#${esc(p.id)}">${esc(p.name)}</a><div class="crew-role">${esc(p.background||"")}</div>${p.mech&&M[p.mech]?`<div class="crew-role">CHASSIS: ${esc(M[p.mech].name)}</div>`:""}${p.triggers?`<div class="crew-role">TRIGGERS: ${esc(p.triggers)}</div>`:""}${p.talents?`<div class="crew-role">TALENTS: ${esc(p.talents)}</div>`:""}<div style="margin-top:8px">${link("pilot.html#"+p.id,"VIEW DOSSIER →")}</div></div><span class="pill" style="margin-left:auto">${esc(p.status)}</span></div><div data-detail-host="pilot"></div></div></article>`).join("")}
if(el("mech-list")){el("mech-count").textContent=`${String(C.mechs.length).padStart(2,"0")} MECH RECORDS`;
 el("mech-list").innerHTML=C.mechs.map(m=>`<article class="card patrol" data-mech="${esc(m.id)}"><div class="card-pad mech-card"><div class="mech-thumb">${m.img?`${pic(m.img,m.name)}`:esc(m.glyph)}</div><div><div class="tag">${esc(m.frame)} · SIZE ${esc(msize(m))}</div><a class="mech-title" href="mech.html#${esc(m.id)}">${esc(m.name)}</a><div class="mech-stats"><span>PILOT: ${esc(P[m.pilot]?P[m.pilot].name.replace(/\u201c([^\u201d]*)\u201d/,"$1"):"UNASSIGNED")}</span>${m.hp!=null&&m.hp!==""?`<span>HP ${esc(hpNow(m))}/${esc(m.hp)} · ARM ${esc(m.armor??"—")} · STRUCT ${esc(m.structure??"—")} · STRESS ${esc(m.stress??"—")} · HEAT ${esc(m.heat??"—")}</span><span>EVA ${esc(m.eva)} · SPD ${esc(m.spd)} · TECH ATK ${esc(m.tech)} · E-DEF ${esc(m.edef)}</span>`:`<span>${esc(m.missing||"")}</span><span>${esc(m.state)}</span>`}</div>${m.loadout?`<div class="muted" style="margin-top:8px;font:10px var(--mono)">${esc(m.loadout)}${m.systems?"<br>Systems: "+esc(m.systems):""}</div>`:""}</div></div><div data-detail-host="mech"></div></article>`).join("")}
if(el("faction-list"))el("faction-list").innerHTML=C.factions.map(x=>{const n=filed.filter(o=>o.client===x.id).length;
 return `<div class="faction"><span>${esc(x.name)}</span><span class="muted" style="margin-left:auto;font:10px var(--mono);padding-right:10px">${n} OPERATION${n===1?"":"S"}</span><span class="standing">${esc(x.standing)}</span></div>`}).join("")
function pilotDossier(id){if(!P[id]&&legacyPilotId[id])id=legacyPilotId[id];const p=P[id];if(!p)return notFound("pilot",id);
 const m=p.mech?M[p.mech]:null,mine=pilotOps(id).reverse();
 return `<section class="hero"><div class="hero-copy"><div class="eyebrow">${esc(p.background||"")}</div><h1>${esc(p.name)}</h1><div class="hero-meta"><span>${pill(p.status,"lime")}</span></div></div>`+
  (p.img?`<div class="hero-art"><img class="hero-mech-img" src="${esc(p.img)}" alt="${esc(p.name)}"></div>`:"")+`</section>`+
  `<div class="columns"><div class="primary"><section><div class="section-head"><h2>PILOT FILE</h2><span>PERSONNEL</span></div><div class="card"><div class="card-pad">`+table(
  th("STATUS",pill(p.status,"lime"))+th("CHASSIS",m?link("mech.html#"+m.id,m.name):"None assigned")+
  th("TRIGGERS",esc(p.triggers||"NOT FILED"))+th("TALENTS",esc(p.talents||"NOT FILED"))+th("GEAR",esc(p.gear||"NOT FILED"))+
  th("DEPLOYED",mine.map(opLink).join("<br>")||"Never"))+
  `</div></div></section></div><aside class="aside"><section><div class="section-head"><h2>CHASSIS</h2><span>${m?esc(m.role||""):"NONE"}</span></div><div class="card"><div class="card-pad">`+
  (m?`<div class="mech-card"><div class="mech-thumb">${m.img?`${pic(m.img,m.name)}`:esc(m.glyph||"?")}</div><div><div class="tag">${esc(m.frame)} · SIZE ${esc(msize(m))}</div><div class="mech-title">${esc(m.name)}</div><div class="muted" style="margin-top:6px;font:10px var(--mono)">${link("mech.html#"+m.id,"OPEN FILE →")}</div></div></div>`
    :`<div class="muted">No chassis assigned.</div>`)+
  `</div></div></section></aside></div>`+detailPilot(p);
}
/* The mech dossier's aside runs short against the chassis file; the pilot's own rows fill it. */
const pilotFile=p=>p?`<section><div class="section-head"><h2>PILOT FILE</h2><span>PERSONNEL</span></div><div class="card"><div class="card-pad">`+table(
 th("STATUS",pill(p.status,"lime"))+th("TRIGGERS",esc(p.triggers||"NOT FILED"))+th("TALENTS",esc(p.talents||"NOT FILED"))+th("GEAR",esc(p.gear||"NOT FILED"))+
 th("DEPLOYED",pilotOps(p.id).reverse().map(opLink).join("<br>")||"Never"))+`</div></div></section>`:"";
function mechDossier(id){const m=M[id];if(!m)return notFound("mech",id);
 const p=m.pilot?P[m.pilot]:null,mine=mechOps(id).reverse(),last=filed.filter(o=>o.mechs.includes(id)).pop(),at=stationed(id);
 return `<section class="hero"><div class="hero-copy"><div class="eyebrow">${esc(m.frame)} · SIZE ${esc(msize(m))}</div><h1>${esc(m.name)}</h1><div class="hero-meta"><span>${esc(m.role||"")}</span>${mechPill(m)}</div></div>`+
  (m.img?`<div class="hero-art"><img class="hero-mech-img" src="${esc(m.img)}" alt="${esc(m.name)}"></div>`:(m.glyph?`<div class="hero-art"><span class="mech-silhouette">${esc(m.glyph)}</span></div>`:""))+`</section>`+
  `<div class="columns"><div class="primary"><section><div class="section-head"><h2>CHASSIS FILE</h2><span>${esc(m.state)}</span></div><div class="card"><div class="card-pad">`+table(
  th("PILOT",p?link("pilot.html#"+p.id,p.name.replace(/\u201c([^\u201d]*)\u201d/g,"$1")):"UNASSIGNED")+th("STATE",esc(m.state))+
  th("STATIONED",at&&L[at]?esc(L[at].name):C.meta.station?esc(C.meta.station):"—")+
  th("HP · ARMOR",m.hp!=null&&m.hp!==""?`${esc(hpNow(m))}/${esc(m.hp)} · ${esc(m.armor??"—")}`:"NOT FILED")+
  th("STRUCTURE · STRESS",`${esc(m.structure??"—")} · ${esc(m.stress??"—")}`)+
  th("HEAT · REPAIR",`${esc(m.heat??"—")} · ${esc(m.repair??"—")}`)+
  th("HULL · AGI · SYS · ENG",`${esc(m.hull??"—")} · ${esc(m.agi??"—")} · ${esc(m.sys??"—")} · ${esc(m.eng??"—")}`)+
  th("EVA · SPD · E-DEF · SENS · SAVE",`${esc(m.eva??"—")} · ${esc(m.spd??"—")} · ${esc(m.edef??"—")} · ${esc(m.sens??"—")} · ${esc(m.save??"—")}`)+
  th("ATK · TECH · LTD",`${esc(m.attackBonus??"—")} · ${esc(m.tech??"—")} · ${esc(m.limitedBonus??"—")}`)+
  th("LOADOUT",esc(m.loadout||"—"))+th("SYSTEMS",esc(m.systems||"—"))+
  th("DEPLOYED",mine.map(opLink).join("<br>")||"Never")+th("LAST OUTCOME",last&&last.outcome?esc(last.outcome):"NOT FILED"))+
  `</div></div></section></div><aside class="aside"><section><div class="section-head"><h2>PILOT</h2><span>ASSIGNMENT</span></div><div class="card"><div class="card-pad">`+
  (p?`<div class="crew">${p.img?`<div class="mech-thumb">${pic(p.img,p.name)}</div>`:`<div class="avatar">${esc(initial(p.name))}</div>`}<div><div class="crew-name">${esc(p.name)}</div><div class="crew-role">${esc(p.background||"")}</div><div class="muted" style="margin-top:6px;font:10px var(--mono)">${link("pilot.html#"+p.id,"OPEN FILE →")}</div></div></div>`
    :`<div class="muted">No pilot assigned.</div>`)+`</div></div></section>`+pilotFile(p)+`</aside></div>`+detailMech(m);
}
lightbox();
return {esc,byId,ops,filed,threadsOf,mechOps,pilotOps,stationed,el,th,table,chip,opLink,mechBtn,locBtn,pilotBtn,pill,mark,show,showAtMap,pilotDossier,mechDossier,L,P,M,F};
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
