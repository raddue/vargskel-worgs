/* Shared field-archive UI + patrol animation. Renders campaign.js into whatever
   sections a page declares; every render call is guarded by an element-presence
   check, so a page renders only the sections it includes. */
window.UI=(()=>{
const C=window.CAMPAIGN;
const esc=t=>String(t).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const byId=a=>Object.fromEntries(a.map(x=>[x.id,x]));
const L=byId(C.locations),P=byId(C.pilots),M=byId(C.mechs),F=byId(C.factions);
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
const opLink=o=>`<a href="#op-${esc(o.id)}">OP ${esc(o.id)} · ${esc(o.title)}</a>`;
const mechBtn=id=>M[id]?chip("mech",id,M[id].name):"";
const locBtn=id=>L[id]?chip("loc",id,L[id].name):"";
const pilotBtn=id=>P[id]?chip("pilot",id,P[id].name.replace(/\u201c[^\u201d]*\u201d/g,"").replace(/\s+/g," ").trim()):"";
const pill=(t,c)=>`<span class="pill" style="border-color:var(--${c});color:var(--${c})">${esc(t)}</span>`;
const mechPill=m=>pill(m.state,/^OPERATIONAL/.test(m.state)?"lime":"rust");
const hpNow=m=>m.hpNow==null?m.hp:m.hpNow;
const msize=m=>m.size==null?1:m.size;
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
  th("PILOT",pilotBtn(m.pilot))+th("STATE",esc(m.state))+th("STATIONED",at?locBtn(at):"")+
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
if(el("threads-body"))el("threads-body").innerHTML=C.threads.slice().sort((a,b)=>a.op.localeCompare(b.op)).map(t=>`<tr><td>${esc(t.text)}</td><td>OP ${esc(t.op)}</td><td>${threadPill(t)}</td></tr>`).join("")||`<tr><td colspan="3" class="muted">Nothing seeded yet.</td></tr>`;
if(el("timeline"))el("timeline").innerHTML=C.events.map(ev=>`<li><div class="time">${esc(ev.date)}</div><div class="activity-title">${esc(ev.title)}</div><div class="muted" style="font:10px var(--mono)">${ev.op?`<a href="#op-${esc(ev.op)}">OP ${esc(ev.op)}</a> · `:""}${esc(ev.note)}</div></li>`).join("")||`<li><div class="muted">No deeds filed yet.</div></li>`;
if(el("crew-list")){el("crew-count").textContent=`${String(C.pilots.length).padStart(2,"0")} ACTIVE RECORDS`;
 el("crew-list").innerHTML=C.pilots.map(p=>`<article class="card patrol" data-pilot="${esc(p.id)}"><div class="card-pad"><div class="crew">${p.img?`<div class="mech-thumb"><img src="${esc(p.img)}" alt="${esc(p.name)}"></div>`:`<div class="avatar">${esc(p.name.replace(/\u201c([^\u201d]*)\u201d/,"$1").trim()[0])}</div>`}<div><div class="crew-name">${esc(p.name)}</div><div class="crew-role">${esc(p.background||"")}</div>${p.mech&&M[p.mech]?`<div class="crew-role">CHASSIS: ${esc(M[p.mech].name)}</div>`:""}${p.triggers?`<div class="crew-role">TRIGGERS: ${esc(p.triggers)}</div>`:""}${p.talents?`<div class="crew-role">TALENTS: ${esc(p.talents)}</div>`:""}</div><span class="pill" style="margin-left:auto">${esc(p.status)}</span></div><div data-detail-host="pilot"></div></div></article>`).join("")}
if(el("mech-list")){el("mech-count").textContent=`${String(C.mechs.length).padStart(2,"0")} MECH RECORDS`;
 el("mech-list").innerHTML=C.mechs.map(m=>`<article class="card patrol" data-mech="${esc(m.id)}"><div class="card-pad mech-card"><div class="mech-thumb">${m.img?`<img src="${esc(m.img)}" alt="${esc(m.name)}">`:esc(m.glyph)}</div><div><div class="tag">${esc(m.frame)} · SIZE ${esc(msize(m))}</div><div class="mech-title">${esc(m.name)}</div><div class="mech-stats"><span>PILOT: ${esc(P[m.pilot]?P[m.pilot].name.replace(/\u201c([^\u201d]*)\u201d/,"$1"):"UNASSIGNED")}</span>${m.hp!=null&&m.hp!==""?`<span>HP ${esc(hpNow(m))}/${esc(m.hp)} · ARM ${esc(m.armor??"—")} · STRUCT ${esc(m.structure??"—")} · STRESS ${esc(m.stress??"—")} · HEAT ${esc(m.heat??"—")}</span><span>EVA ${esc(m.eva)} · SPD ${esc(m.spd)} · TECH ATK ${esc(m.tech)} · E-DEF ${esc(m.edef)}</span>`:`<span>${esc(m.missing||"")}</span><span>${esc(m.state)}</span>`}</div>${m.loadout?`<div class="muted" style="margin-top:8px;font:10px var(--mono)">${esc(m.loadout)}${m.systems?"<br>Systems: "+esc(m.systems):""}</div>`:""}</div></div><div data-detail-host="mech"></div></article>`).join("")}
if(el("faction-list"))el("faction-list").innerHTML=C.factions.map(x=>{const n=filed.filter(o=>o.client===x.id).length;
 return `<div class="faction"><span>${esc(x.name)}</span><span class="muted" style="margin-left:auto;font:10px var(--mono);padding-right:10px">${n} OPERATION${n===1?"":"S"}</span><span class="standing">${esc(x.standing)}</span></div>`}).join("")
return {esc,byId,ops,filed,threadsOf,mechOps,pilotOps,stationed,el,th,table,chip,opLink,mechBtn,locBtn,pilotBtn,pill,mark,show,showAtMap,L,P,M,F};
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
