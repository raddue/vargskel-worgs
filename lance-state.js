/* Crew-side session controls: browser-local only. Export HP is the sole GM handoff. */
(()=>{
const KEY="vw-lance-v1";
const items=[...document.querySelectorAll("[data-k]")];
const status=document.getElementById("save-state");
const exportEl=document.getElementById("lance-export");
const baseline=JSON.stringify(items.map(e=>[e.dataset.k,e.type==="checkbox"?e.defaultChecked:e.defaultValue]));
let ok=true;
try{localStorage.setItem("__probe","1");localStorage.removeItem("__probe")}catch{ok=false;status.textContent="TRACKING WILL NOT PERSIST · LOCAL STORAGE UNAVAILABLE"}
const read=e=>e.type==="checkbox"?e.checked:e.value;
const write=(e,v)=>{if(e.type==="checkbox")e.checked=!!v;else e.value=v};
const exportHp=()=>{const hp=Object.fromEntries(items.filter(e=>e.dataset.k.endsWith(".hp")).map(e=>[e.dataset.k.slice(0,-3),e.value]));
 CAMPAIGN.mechs.forEach(m=>{const pip=document.querySelector(`[data-hp="${m.id}"]`);if(!pip)return;const n=Number(hp[m.id]??(m.hpNow??m.hp));
 pip.textContent=`${"▰".repeat(Math.max(0,Math.round(n/2)))}${"▱".repeat(Math.max(0,Math.round(m.hp/2)-Math.round(n/2)))} ${n}/${m.hp} HP · ${m.armor} ARMOR`});
 exportEl.textContent=CAMPAIGN.mechs.map(m=>`${m.id} -> ${hp[m.id]??(m.hpNow??m.hp)}`).join("\n")};
const clamp=e=>{const n=Number(e.value);e.value=e.value!==""&&Number.isFinite(n)?String(Math.max(0,Math.min(Number(e.max),Math.trunc(n)))):e.defaultValue};
const save=()=>{exportHp();if(!ok)return;
 try{localStorage.setItem(KEY,JSON.stringify({baseline,data:Object.fromEntries(items.map(e=>[e.dataset.k,read(e)]))}))}
 catch{ok=false;status.textContent="TRACKING WILL NOT PERSIST · LOCAL STORAGE UNAVAILABLE"}};
if(ok){try{const saved=JSON.parse(localStorage.getItem(KEY)||"null");if(saved?.baseline===baseline&&saved.data&&typeof saved.data==="object")items.forEach(e=>{if(Object.hasOwn(saved.data,e.dataset.k))write(e,saved.data[e.dataset.k])});else if(saved)status.textContent="CAMPAIGN UPDATED · TRACKING RESET TO NEW BASELINE"}catch{}}
items.filter(e=>e.type==="number").forEach(clamp);
items.forEach(e=>{e.addEventListener("input",()=>{if(e.type!=="number")save()});e.addEventListener("change",()=>{if(e.type==="number")clamp(e);save()})});
document.getElementById("reset").addEventListener("click",()=>{
 if(!confirm("Reset all lance controls and notes to the campaign baseline on this device?"))return;
 if(ok)try{localStorage.removeItem(KEY)}catch{ok=false;status.textContent="TRACKING WILL NOT PERSIST · LOCAL STORAGE UNAVAILABLE"}
 items.forEach(e=>write(e,e.type==="checkbox"?e.defaultChecked:e.defaultValue));exportHp();
});
exportHp();
})();
