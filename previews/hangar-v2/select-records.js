/* Record cards use the same Lancer rules data as the existing dossiers. */
window.hangarRecords=(()=>{
 const D=window.DETAIL||{};
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const plain=s=>String(s||'').replace(/<br\s*\/?>/gi,'\n').replace(/<li>/gi,'• ').replace(/<\/li>/gi,'\n').replace(/<[^>]*>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').trim();
 const split=s=>String(s||'').split(',').map(x=>x.trim()).filter(Boolean);
 const desc=(kind,record)=>{
  if(kind==='talents')return [record.terse,...(record.ranks||[]).map(r=>`Rank ${r.rank} · ${r.name}\n${plain(r.description)}`)].filter(Boolean).join('\n\n');
  if(kind==='skills')return plain(record.description);
  if(kind==='gear')return [[record.type,record.bonuses,record.tags].filter(Boolean).join(' · '),plain(record.effect)].filter(Boolean).join('\n\n');
  if(kind==='systems')return [`SP ${record.sp??'—'}`,record.tags,record.license,plain(record.effect)].filter(Boolean).join('\n\n');
  if(kind==='weapons')return [[record.mount,record.type,record.damage,record.range,record.tags].filter(Boolean).join(' · '),plain(record.effect),...(record.profiles||[]).map(p=>[p.name,p.damage,p.range,p.tags,plain(p.effect)].filter(Boolean).join(' · '))].filter(Boolean).join('\n\n');
  return '';
 };
 const key=(kind,n)=>kind==='talents'?n.replace(/\s+\d+$/,''):kind==='skills'?n.replace(/\s*\([+-]\d+\)$/,''):n;
 const token=(kind,n)=>{const record=D[kind]?.[key(kind,n)],text=record&&desc(kind,record);if(!text)return `<span class="record-plain">${esc(n)}</span>`;
  return `<details class="rule-card"><summary>${esc(n)} <span aria-hidden="true">↗</span></summary><div class="rule-preview" role="tooltip">${esc(text)}</div><div class="rule-expanded">${esc(text)}</div></details>`};
 const section=(title,items)=>`<section class="record-section"><h3>${esc(title)}</h3><div class="record-items">${items.length?items.join(''):'<p>Not recorded.</p>'}</div></section>`;
 const val=(label,value)=>`<div><dt>${esc(label)}</dt><dd>${esc(value??'Not recorded')}</dd></div>`;
 function render(p,m,mode){let content;
  if(mode==='pilot')content=`${section('Talents',split(p.talents).map(n=>token('talents',n)))}${section('Triggers',split(p.triggers).map(n=>token('skills',n)))}${section('Gear',split(p.gear).map(n=>token('gear',n)))}<section class="record-section"><h3>Bond</h3><p><strong>${esc(p.bond||'Not recorded')}</strong>${p.bondPower?' · '+esc(p.bondPower):''}</p><p>${esc(p.bondDescription||'')}</p></section>`;
  else content=`<section class="record-section"><h3>Chassis</h3><dl class="record-stat-grid">${[['Frame',m.frame],['Role',m.role],['Size',m.size],['Hull',m.hull],['Agility',m.agi],['Systems',m.sys],['Engineering',m.eng],['HP',`${m.hpNow??m.hp} / ${m.hp}`],['Armor',m.armor],['Structure',m.structure],['Stress',m.stress],['Heat capacity',m.heat],['Repairs',`${m.repairsNow??m.repair} / ${m.repair}`],['Evasion',m.eva],['E-defense',m.edef],['Speed',m.spd],['Sensors',m.sens],['Save target',m.save],['Attack',m.attackBonus],['Tech attack',m.tech],['Limited bonus',m.limitedBonus]].map(([k,v])=>val(k,v)).join('')}</dl></section>${section('Weapons',(m.mounts||[]).map(x=>`<div class="mount-card"><strong>${esc(x.slot)}</strong><div class="record-items">${(x.weapons||[]).map(n=>token('weapons',n)).join('')}</div></div>`))}${section('Systems',(m.systems||[]).map(n=>token('systems',n)))}`;
  const url=`../../${mode==='pilot'?'pilot':'mech'}.html#${encodeURIComponent(mode==='pilot'?p.id:m.id)}`;
  return `<section class="full-record" aria-label="${mode==='pilot'?'Pilot':'Mech'} record"><div class="record-header"><div><span class="eyebrow">FIELD ARCHIVE</span><h2>${mode==='pilot'?'Pilot record':'Mech record'}</h2></div><a href="${url}">Complete original dossier ↗</a></div><p class="record-help">Hover or focus a highlighted entry for a preview. Select it for the full description.</p>${content}<section class="record-section"><h3>Operation history</h3><p>Deployment and detailed history remain available in the <a href="${url}">complete dossier ↗</a>.</p></section><p class="record-credit">Rules data © Massif Press, LANCER. Lancer data and supplement subsets are GPL-3.0-or-later.</p></section>`;
 }
 return {render};
})();
