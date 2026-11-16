/* Presentation-only navigation. Canonical frames and campaign records stay unchanged. */
(()=>{
 const U=window.UI,L=U.L;
 const canonical=v=>v==='cressidium:orbit'?'cressidium':v;
 function initial(hash){if(!hash||hash==='#map')return 'cressidium:orbit';let id;try{id=decodeURIComponent(hash.replace(/^#map\//,''))}catch{return U.frameId()||'cressidium:orbit'}return L[id]?(L[id].frame||'SYSTEM'):(U.frameId()||'cressidium:orbit')}
 function parent(v){if(v==='cressidium')return 'cressidium:orbit';if(v==='cressidium:orbit')return 'SYSTEM';return v==='SYSTEM'?null:(L[v].frame||'SYSTEM')}
 function action(v,id){if(v==='cressidium:orbit'&&id==='cressidium')return {view:'cressidium'};if(id!==v&&U.members(id).length>1)return {view:id==='cressidium'?'cressidium:orbit':id};return {info:id}}
 function scene(v,opts){const s=U.scene3d(canonical(v),opts);s.presentation=v;s.ascend=parent(v);
  if(v==='cressidium:orbit'){
   s.bodies=s.bodies.filter(b=>b.id!=='elysia');const rio=U.scene3d('elysia',opts).bodies.find(b=>b.id==='rio');rio.pos=[-1.35,.35,-1.3];rio.r=.3;rio.orbit={parent:'cressidium',radius:Math.hypot(rio.pos[0],rio.pos[2]),phase:Math.atan2(rio.pos[2],rio.pos[0]),period:260};s.bodies.push(rio);s.sub='CRESSIDIUM · ORBIT';s.aria='Cressidium orbit. Cressidium, Pell, Kessen Relay and UNS Rio Grande. Select Cressidium to view its surface. Hardware positions schematic.';
  }else if(v==='cressidium'){
   s.mode='surface';s.bodies=s.bodies.filter(b=>b.id==='cressidium'||b.id==='elysia');const g=s.bodies[0],pin=s.bodies[1];pin.pos=[g.r*.55,g.r*.25,g.r*Math.sqrt(1-.55**2-.25**2)];pin.surface='cressidium';pin.r=.07;delete pin.orbit;s.sub='CRESSIDIUM · SURFACE';s.aria='Cressidium surface globe. Select Nov Elysia to enter the city. Pin position schematic, not surveyed.';
  }
  s.bodies.forEach(b=>b.descend=!!action(v,b.id).view);
  s.orbits=s.bodies.filter(b=>b.orbit&&!b.orbit.surface).map(b=>({parent:b.orbit.parent,child:b.id,radius:b.orbit.radius,y:b.pos[1]}));
  if(v==='cressidium'){s.reach=s.bodies.map(b=>({p:b.pos,r:b.r}));s.camera.target=[0,0,0];s.camera.maxPolar=2.9;}
  return s;
 }
 U.holoView={canonical,initial,parent,action,scene,clickAllowed:(distance,multi,button)=>distance<5&&!multi&&button===0};
})();
