/* Presentation-only navigation. Canonical frames and campaign records stay unchanged. */
(()=>{
 const U=window.UI,L=U.L;
 const canonical=v=>v==='cressidium:orbit'?'cressidium':v;
 function initial(hash){if(!hash||hash==='#map')return 'cressidium:orbit';let id;try{id=decodeURIComponent(hash.replace(/^#map\//,''))}catch{return U.frameId()||'cressidium:orbit'}return L[id]?(L[id].frame||'SYSTEM'):(U.frameId()||'cressidium:orbit')}
 function parent(v){if(v==='cressidium')return 'cressidium:orbit';if(v==='cressidium:orbit')return 'SYSTEM';return v==='SYSTEM'?null:(L[v].frame||'SYSTEM')}
 function direction(from,to){if(from===to)return 'none';let at=to;while(at){at=parent(at);if(at===from)return 'in'}return 'out'}
 function action(v,id){if(v==='cressidium:orbit'&&id==='cressidium')return {view:'cressidium'};if(id!==v&&U.members(id).length>1)return {view:id==='cressidium'?'cressidium:orbit':id};return {info:id}}
 // Decorative blocks are diagram symbols, not surveyed buildings or new campaign geography.
 function cityGeometry(s){
  const industrial=s.frame==='industry',buildings=[],streets=[],parks=[],R=s.radius*1.05;
  let seed=industrial?931:271;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const approach=s.bodies.find(b=>b.id==='industry').pos;
  const target=industrial?null:{label:'JAMMER SITE / CURRENT TARGET',pos:[approach[0]+.58,0,approach[2]-.42]};
  const coast=x=>R*.67+.16*Math.sin(x*2.1)+.09*Math.cos(x*4);
  for(let i=0;i<3;i++){const a=.7+i*2.1;parks.push({pos:[Math.cos(a)*R*.56,.005,Math.sin(a)*R*.42],size:[.24+i*.045,.02,.18+i*.03],yaw:a});}
  // Three bent boulevards define neighborhoods; parcels follow their local tangents.
  for(let lane=0;lane<3;lane++){
   let previous=null;
   for(let i=0;i<=26;i++){
    const x=-R+i*2*R/26,z=(lane-1)*R*.49+.2*Math.sin(x*1.6+lane);
    if(previous){const dx=x-previous[0],dz=z-previous[1];streets.push({pos:[(x+previous[0])/2,-.005,(z+previous[1])/2],size:[Math.hypot(dx,dz)+.015,.015,.055],yaw:-Math.atan2(dz,dx)});}
    previous=[x,z];if(i%2)continue;
    const yaw=-Math.atan(.32*Math.cos(x*1.6+lane));
    for(const side of [-1,1]){
     const px=x+(random()-.5)*.07,pz=z+side*(.19+random()*.06);
     if(Math.hypot(px,pz)>R||pz>coast(px)-.15||s.bodies.some(b=>Math.hypot(px-b.pos[0],pz-b.pos[2])<.3)||parks.some(p=>Math.hypot(px-p.pos[0],pz-p.pos[2])<.32))continue;
     const commercial=target&&Math.hypot(px-target.pos[0],pz-target.pos[2])<.55;
     const near=s.bodies.reduce((a,b)=>Math.hypot(px-b.pos[0],pz-b.pos[2])<Math.hypot(px-a.pos[0],pz-a.pos[2])?b:a);
     const factory=industrial||near.id==='industry',civic=near.id==='district';
     const h=commercial?.45+random()*.3:civic?.28+random()*.45:factory?.1+random()*.2:.12+random()*.35;
     buildings.push({pos:[px,h/2,pz],size:[.12+random()*(factory?.25:.14),h,.1+random()*.16],yaw,form:['block','L','U','stepped'][Math.floor(random()*4)],shade:random(),kind:commercial?'commercial':factory?'factory':civic?'civic':near.id==='vsaf'?'outskirts':'housing'});
    }
   }
  }
  // Diagonal cross-streets join boulevards rather than repeating a square lattice.
  for(const x of [-R*.55,R*.35])streets.push({pos:[x,-.006,-.12],size:[.065,.014,R*1.55],yaw:.24});
  const points=Array.from({length:33},(_,i)=>{const x=-R+2*R*i/32;return [x,coast(x)]});
  return {buildings,streets,parks,...(target?{target}:{}),water:{points,pos:[0,-.045,R*.85],size:[R*2,.02,R*.5]},quay:{points},notice:'SCHEMATIC CITY · buildings, streets and shoreline illustrative; POI anchors retained'};
 }
 function scene(v,opts){const s=U.scene3d(canonical(v),opts);s.presentation=v;s.ascend=parent(v);
  if(v==='cressidium:orbit'){
   s.bodies=s.bodies.filter(b=>b.id!=='elysia');const rio=U.scene3d('elysia',opts).bodies.find(b=>b.id==='rio');rio.pos=[-1.35,.35,-1.3];rio.r=.3;rio.orbit={parent:'cressidium',radius:Math.hypot(rio.pos[0],rio.pos[2]),phase:Math.atan2(rio.pos[2],rio.pos[0]),period:260};s.bodies.push(rio);s.sub='CRESSIDIUM · ORBIT';s.aria='Cressidium orbit. Cressidium, Pell, Kessen Relay and UNS Rio Grande. Select Cressidium to view its surface. Hardware positions schematic.';
  }else if(v==='cressidium'){
   s.mode='surface';s.bodies=s.bodies.filter(b=>b.id==='cressidium'||b.id==='elysia');const g=s.bodies[0],pin=s.bodies[1];// Presentation-only shoreline anchor in the prepared 1024×512 map, measured from top left.
   // SphereGeometry uses x=-cos(phi), z=sin(phi); texture upload flips image Y.
   const u=316/1024,v=235/512,phi=2*Math.PI*u,theta=Math.PI*v;
   pin.pos=[-g.r*Math.cos(phi)*Math.sin(theta),g.r*Math.cos(theta),g.r*Math.sin(phi)*Math.sin(theta)];pin.surface='cressidium';pin.r=.07;delete pin.orbit;s.sub='CRESSIDIUM · SURFACE';s.aria='Cressidium surface globe. Select Nov Elysia to enter the city. Pin position schematic, not surveyed.';
  }
  if(s.mode==='ground'){
   s.bodies=s.bodies.filter(b=>b.id!=='rio');s.bodies.forEach(b=>{delete b.h;b.r=.1});
   s.zones=s.zones.filter(z=>z.on!=='rio');s.city=cityGeometry(s);s.aria+=' '+s.city.notice;
   s.reach=s.bodies.map(b=>({p:[b.pos[0],.85,b.pos[2]],r:.18})).concat(s.city.buildings.map(b=>({p:b.pos,r:Math.max(...b.size)/2})));
   const w=s.city.water;for(const dx of [-1,1])for(const dz of [-1,1])s.reach.push({p:[w.pos[0]+dx*w.size[0]/2,0,w.pos[2]+dz*w.size[2]/2],r:.1});
  }
  // Requested visual ratio only; labels retain their independent accessible hit targets.
  const planet=s.bodies.find(b=>b.id==='cressidium'),moon=s.bodies.find(b=>b.id==='pell');
  if(planet&&moon)moon.r=planet.r/6;
  s.bodies.forEach(b=>b.descend=!!action(v,b.id).view);
  s.orbits=s.bodies.filter(b=>b.orbit&&!b.orbit.surface).map(b=>({parent:b.orbit.parent,child:b.id,radius:b.orbit.radius,y:b.pos[1]}));
  if(v==='cressidium'){s.reach=s.bodies.map(b=>({p:b.pos,r:b.r}));s.camera.target=[0,0,0];s.camera.maxPolar=2.9;}
  return s;
 }
 // Rio GLB nose is local +Z. Increasing orbit phase has tangent (-sin(a),0,cos(a)).
 U.holoView={canonical,initial,parent,direction,action,scene,rioHeading:phase=>-phase,clickAllowed:(distance,multi,button)=>distance<5&&!multi&&button===0};
})();
