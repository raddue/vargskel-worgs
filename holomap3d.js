/* Holographic renderer over UI.scene3d. three.js r187, local imports only.
   SVG remains mounted; a failed import never reaches this module and leaves it visible. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const N=UI.holoView;
const host=document.getElementById('holo3d'), view=host?.parentElement;
if(host&&window.holoLoading?.state!=='failed')boot();
function boot(){
 let renderer,controls,scene,description,objects=new Map(),resources=new Set(),generation=0,pendingAssets=0;
 const loading=window.holoLoading;
 let raf=0,wakeTimer=0,last=0,phase=0,idleUntil=0,held=false,visible=true,lost=false,failed=false,paused=false,flight=null;
 let selected=document.querySelector('.holo-svg .node.sel')?.dataset.loc||'',hover='',frame='',fit=1;
 const rm=matchMedia('(prefers-reduced-motion: reduce)'), panel=document.getElementById('tab-map');
 const camera=new THREE.PerspectiveCamera(38,1,.01,200);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),projected=new THREE.Vector3();
 const labels=document.createElement('div');labels.className='holo3d-labels';
 const toolbar=document.createElement('div');toolbar.className='holo3d-tools';
 toolbar.innerHTML='<button type="button" data-action="in" aria-label="Zoom in">+</button><button type="button" data-action="out" aria-label="Zoom out">−</button><button type="button" data-action="left" aria-label="Rotate left">↶</button><button type="button" data-action="right" aria-label="Rotate right">↷</button><button type="button" data-action="up" aria-label="Pan up">↑</button><button type="button" data-action="down" aria-label="Pan down">↓</button><button type="button" data-action="pause" aria-pressed="false">PAUSE MOTION</button><button type="button" data-action="info" disabled>INFO</button><button type="button" data-action="back">UP</button><button type="button" data-action="overview">SYSTEM</button><button type="button" data-action="descend" disabled>DESCEND</button>';
 const hint=document.createElement('p');hint.className='holo3d-help';hint.id='holo3d-help';
 hint.textContent='Drag to rotate · scroll / pinch to zoom · right-drag to pan. Arrows: targets · Enter: enter / file · Shift+Enter / ]: descend · [ / Escape: up. + / −: zoom · WASD: pan · Q / E: rotate. Positions schematic.';
 host.append(labels,toolbar,hint);
 const own=o=>(resources.add(o),o);
 const colors=()=>{const c=getComputedStyle(document.documentElement);return Object.fromEntries(['cyan','lime','rust','muted','line','holo-bg'].map(k=>[k,c.getPropertyValue('--'+k).trim()]));};
 let palette=colors();
 function mode(){const active=loading?.state!=='failed'&&UI.holoRenderer({webgl:!!renderer,lost,failed})==='3d';host.hidden=!active;view.classList.toggle('is-3d',active);if(UI.syncBack)UI.syncBack();return active;}
 function stop(){cancelAnimationFrame(raf);clearTimeout(wakeTimer);raf=0;last=0;}
 function awake(){if(!raf&&!lost&&!failed&&!document.hidden&&!panel.hidden&&visible)raf=requestAnimationFrame(draw);}
 function interact(){idleUntil=performance.now()+4000;awake();}
 host.addEventListener('focusin',interact);
 document.addEventListener('pointerdown',interact,{passive:true});
 document.addEventListener('keydown',interact);
 function dispose(){generation++;resources.forEach(r=>r.dispose());resources.clear();scene?.clear();objects.clear();labels.replaceChildren();}
 function fallback(error){failed=true;loading?.fail();stop();mode();console.warn('3D holomap unavailable; SVG retained.',error);}
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-describedby',hint.id);
  renderer.domElement.setAttribute('role','group');host.prepend(renderer.domElement);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.12;
  controls.addEventListener('change',awake);controls.addEventListener('start',()=>{held=true;interact()});controls.addEventListener('end',()=>{held=false;interact()});
 }catch(e){fallback(e);return}
 function material(color,opacity=1){return own(new THREE.MeshBasicMaterial({color,transparent:opacity<1,opacity,side:THREE.DoubleSide,depthWrite:opacity===1}));}
 function mesh(geometry,mat,parent=scene){const m=new THREE.Mesh(own(geometry),mat);parent.add(m);return m;}
 function ring(radius,color,parent=scene,y=0){const points=Array.from({length:97},(_,i)=>new THREE.Vector3(Math.cos(i*Math.PI/48)*radius,y,Math.sin(i*Math.PI/48)*radius));const l=new THREE.Line(own(new THREE.BufferGeometry().setFromPoints(points)),own(new THREE.LineBasicMaterial({color,transparent:true,opacity:.5})));parent.add(l);return l;}
 function holo(map){return own(new THREE.ShaderMaterial({uniforms:{surface:{value:map},tint:{value:new THREE.Color(palette.cyan)},sun:{value:new THREE.Vector3(...description.sun.dir)}},vertexShader:'varying vec2 uv0; varying vec3 normal0; varying vec3 eye; void main(){uv0=uv; normal0=normalize(normalMatrix*normal); vec4 p=modelViewMatrix*vec4(position,1.);eye=normalize(-p.xyz);gl_Position=projectionMatrix*p;}',fragmentShader:'uniform sampler2D surface; uniform vec3 tint; uniform vec3 sun; varying vec2 uv0; varying vec3 normal0; varying vec3 eye; void main(){vec3 n=normalize(normal0);float rim=pow(1.-max(dot(n,normalize(eye)),0.),2.5);float lit=.32+.68*max(dot(n,normalize(sun)),0.);vec3 art=texture2D(surface,uv0).rgb;float scan=.94+.06*sin(gl_FragCoord.y*1.7);gl_FragColor=vec4((mix(art,art*tint,.3)*lit+rim*tint*.65)*scan,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}'}));}
 function texture(path,done){const g=generation;pendingAssets++;const t=own(new THREE.TextureLoader().load(path,()=>{if(g!==generation){t.dispose();return}pendingAssets--;done?.(t);awake()},undefined,e=>{if(g===generation)fallback(e)}));t.colorSpace=THREE.SRGBColorSpace;return t;}
 function build(fid){
  dispose();pendingAssets=0;frame=fid;description=N.scene(fid,{reducedMotion:rm.matches});phase=0;
  hint.textContent='Drag to rotate · scroll / pinch to zoom · arrows: targets · Enter: enter / file · INFO: dossier · [ / Escape: up. Positions schematic.';
  scene=new THREE.Scene();scene.add(new THREE.AmbientLight(palette.cyan,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-3,5,3);scene.add(light);
  renderer.domElement.setAttribute('aria-label',description.aria);host.setAttribute('aria-label',description.aria);
  const grid=new THREE.GridHelper(description.radius*2.5,24,palette.line,palette.line);own(grid.geometry);own(grid.material);grid.material.transparent=true;grid.material.opacity=.35;grid.position.y=-.22;scene.add(grid);
  if(description.mode==='ground'){
   const table=mesh(new THREE.CircleGeometry(description.radius*1.2,64),material(palette.line,.15));table.rotation.x=-Math.PI/2;table.position.y=-.12;
   ring(description.radius*1.2,palette.cyan,scene,-.1);
  }
  if(description.city){
   const city=description.city,box=own(new THREE.BoxGeometry(1,1,1)),dummy=new THREE.Object3D();
   function instances(parts,mat){const inst=own(new THREE.InstancedMesh(box,mat,parts.length));parts.forEach((p,i)=>{dummy.position.fromArray(p.pos);dummy.scale.fromArray(p.size);dummy.rotation.set(0,p.yaw||0,0);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);if(p.shade!==undefined)inst.setColorAt(i,new THREE.Color(0xffffff).multiplyScalar(.62+p.shade*.38))});scene.add(inst);return inst;}
   for(const kind of ['housing','civic','commercial','factory','outskirts']){const parcels=city.buildings.filter(b=>b.kind===kind),parts=[];
    for(const b of parcels){const add=(dx,dz,sx,sz,h)=>{const c=Math.cos(b.yaw),s=Math.sin(b.yaw);parts.push({pos:[b.pos[0]+dx*c+dz*s,h/2,b.pos[2]-dx*s+dz*c],size:[sx,h,sz],yaw:b.yaw,shade:b.shade})};const [w,h,d]=b.size;
     if(b.form==='L'||b.form==='U'){add(-w*.3,0,w*.4,d,h);add(0,d*.3,w,d*.4,h*.8);if(b.form==='U')add(w*.3,0,w*.4,d,h*.9)}else{add(0,0,w,d,h);if(b.form==='stepped')parts.push({pos:[b.pos[0],h*1.15,b.pos[2]],size:[w*.65,h*.3,d*.65],yaw:b.yaw,shade:b.shade});}
    }if(!parts.length)continue;
    const color=kind==='outskirts'?palette.rust:kind==='factory'?palette.lime:palette.cyan;
    instances(parts,own(new THREE.MeshPhongMaterial({color,emissive:palette.line,transparent:true,opacity:.65,shininess:50})));
    // Solid low-poly roofs avoid the diagonal triangulation of wireframe boxes.
   }
   instances(city.streets,material(palette.cyan,.25));
   const outline=city.water.points,shape=new THREE.Shape();shape.moveTo(outline[0][0],-outline[0][1]);outline.slice(1).forEach(p=>shape.lineTo(p[0],-p[1]));shape.lineTo(outline.at(-1)[0],-description.radius*1.15);shape.lineTo(outline[0][0],-description.radius*1.15);shape.closePath();
   const water=mesh(new THREE.ShapeGeometry(shape),material(palette.cyan,.23));water.rotation.x=-Math.PI/2;water.position.y=-.04;
   const shore=new THREE.Line(own(new THREE.BufferGeometry().setFromPoints(outline.map(p=>new THREE.Vector3(p[0],.015,p[1])))),own(new THREE.LineBasicMaterial({color:palette.muted})));scene.add(shore);
   for(const p of city.parks){const park=mesh(new THREE.CircleGeometry(1,7),material(palette.lime,.24));park.rotation.set(-Math.PI/2,0,p.yaw);park.scale.set(p.size[0],p.size[2],1);park.position.fromArray(p.pos);}
   const industry=description.bodies.find(b=>b.id==='industry');if(industry){const stacks=[-.17,.17].map(dx=>({pos:[industry.pos[0]+dx,.22,industry.pos[2]-.32],size:[.055,.44,.055]}));instances(stacks,material(palette.lime));}
   for(const b of description.bodies.filter(b=>b.id==='dropzone'||b.id==='dock')){const pad=mesh(new THREE.CylinderGeometry(.22,.22,.025,8),material(palette.lime,.55));pad.position.set(b.pos[0],.015,b.pos[2]);ring(.24,palette.lime,pad,.02);}
   if(city.target){const target=document.createElement('span');target.className='holo3d-target';target.textContent=city.target.label;labels.append(target);city.target.element=target;const p=city.target.pos;ring(.32,palette.lime,scene,.025).position.set(p[0],0,p[2]);}
   hint.textContent='Drag to rotate · scroll / pinch to zoom · arrows: targets · Enter: enter / file · INFO: dossier · [ / Escape: up. '+city.notice;
  }
  for(const b of description.bodies){
   const group=new THREE.Group();group.position.fromArray(b.pos);scene.add(group);
   const tag=document.createElement('button');tag.type='button';tag.className='holo3d-tag';tag.dataset.body=b.id;tag.addEventListener('click',()=>select(b.id));tag.setAttribute('aria-label',b.aria);tag.textContent=b.name+(b.descend?' ›':'');tag.title=[...b.badges,...b.sites].join(' · ');labels.append(tag);
   const item={b,group,tag,spin:null};objects.set(b.id,item);
   if(b.shape==='globe'){const globe=mesh(new THREE.SphereGeometry(b.r,40,24),holo(texture(b.map)),group);globe.rotation.z=b.tilt;item.spin=globe;}
   else if(b.shape==='hull'){
    const g=generation;pendingAssets++;new GLTFLoader().load(b.model,gltf=>{
     if(g!==generation){gltf.scene.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose()});return}
     const hull=gltf.scene;hull.traverse(o=>{if(o.isMesh){own(o.geometry);o.geometry.computeVertexNormals();o.material?.dispose();o.material=own(new THREE.MeshPhongMaterial({color:palette.muted,emissive:palette.line,shininess:60,flatShading:true}));}});
     hull.scale.setScalar(b.r*2);hull.rotation.set(b.pitch,b.yaw,b.roll);group.add(hull);if(b.id==='rio'){item.hull=hull;hull.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),N.rioHeading(b.orbit.phase+phase*2*Math.PI/b.orbit.period))}pendingAssets--;awake();
    },undefined,e=>{if(g===generation)fallback(e)});
   }else if(b.shape==='debris'){
    const metal=own(new THREE.MeshPhongMaterial({color:0x435866,emissive:0x07151c,shininess:45,flatShading:true,side:THREE.DoubleSide}));
    const edge=own(new THREE.LineBasicMaterial({color:palette.cyan,transparent:true,opacity:.38}));
    const fragments=b.debris.filter(p=>p.kind==='fragment'),dummy=new THREE.Object3D();
    const inst=own(new THREE.InstancedMesh(own(new THREE.TetrahedronGeometry(1)),metal,fragments.length));
    fragments.forEach((p,i)=>{dummy.position.fromArray(p.pos);dummy.rotation.set(...p.rotation);dummy.scale.fromArray(p.size);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix)});group.add(inst);
    const hullGeometry=own(new THREE.CylinderGeometry(.3,.5,1,5,1,true)),plateGeometry=own(new THREE.BoxGeometry(1,.08,1)),engineGeometry=own(new THREE.CylinderGeometry(.4,.5,1,8,1,true)),ribGeometry=own(new THREE.TorusGeometry(.45,.035,4,7,Math.PI*1.6));
    for(const p of b.debris.filter(p=>p.kind!=='fragment')){const section=new THREE.Group();section.position.fromArray(p.pos);section.rotation.set(...p.rotation);section.scale.fromArray(p.size);group.add(section);
     const geometry=p.kind==='hull'?hullGeometry:p.kind==='engine'?engineGeometry:p.kind==='rib'?ribGeometry:plateGeometry;
     section.add(new THREE.Mesh(geometry,metal));section.add(new THREE.LineSegments(own(new THREE.EdgesGeometry(geometry,25)),edge));
     if(p.kind==='hull'){for(const y of [-.35,0,.35]){const rib=new THREE.Mesh(ribGeometry,metal);rib.rotation.x=Math.PI/2;rib.position.y=y;section.add(rib)}}
    }
   }else{
    const marker=mesh(new THREE.OctahedronGeometry(b.r*.65),material(b.id==='vsaf'?palette.rust:b.cur?palette.lime:palette.cyan),group);
    if(description.city){marker.position.y=.72;const stem=mesh(new THREE.CylinderGeometry(.009,.009,.72,5),material(palette.cyan),group);stem.position.y=.36;}
    if(b.h){const stem=mesh(new THREE.CylinderGeometry(.012,.012,b.h,6),material(palette.cyan),group);stem.position.y=b.h/2;
     const art=mesh(new THREE.PlaneGeometry(.48,.48),own(new THREE.MeshBasicMaterial({map:texture(b.thumb),color:0xaadfff,side:THREE.DoubleSide})),group);art.position.y=b.h;item.card=art;
    }
   }
   const halo=ring(b.r*1.22,b.cur?palette.lime:palette.cyan,group,-.04);halo.visible=b.cur;item.halo=halo;
  }
  for(const o of description.orbits){const parent=objects.get(o.parent).group;const l=ring(o.radius,palette.line,parent,o.y);l.userData.orbit=true;}
  for(const z of description.zones){const zone=mesh(new THREE.CircleGeometry(1,64),material(palette[z.c]||palette.cyan,.12));zone.rotation.x=-Math.PI/2;zone.scale.set(z.rx,z.rz,1);zone.position.set(z.center[0],-.06,z.center[1]);if(z.on){objects.get(z.on).group.add(zone);zone.position.set(0,-.03,0)}}
  for(const l of description.legs){const a=objects.get(l.from).group.position.clone(),b=objects.get(l.to).group.position.clone();a.y=b.y=.03;const line=new THREE.Line(own(new THREE.BufferGeometry().setFromPoints([a,b])),own(new THREE.LineDashedMaterial({color:l.plan?palette.muted:palette.lime,dashSize:.08,gapSize:.06})));line.computeLineDistances();scene.add(line)}
  for(const z of description.zones.filter(z=>z.label)){const tag=document.createElement('span');tag.className='holo3d-zone-label';tag.textContent=z.label;labels.append(tag);z.tag=tag;}
  if(description.star){const star=mesh(new THREE.SphereGeometry(.12,16,12),material(palette.cyan));star.position.fromArray(description.star.pos);ring(.3,palette.cyan,star);}
  document.querySelector('.holo-key').classList.toggle('city-key',!!description.city);
  if(description.city){const key=document.querySelector('.holo-key');key.innerHTML='<li>SCHEMATIC BUILDINGS / STREETS</li><li>CIVIC · CYAN</li><li>INDUSTRY · LIME</li><li>OUTSKIRTS · RUST</li><li>SELECT A POI FOR ITS RECORD</li>';}
  reset();mark('loc',selected);crumbs();mode();awake();
 }
 function reset(){if(!description)return;const c=description.camera;camera.fov=c.fov;controls.target.fromArray(c.target);controls.cursor.copy(controls.target);controls.maxTargetRadius=description.radius*.65;controls.minDistance=c.minDistance;controls.minPolarAngle=c.minPolar;controls.maxPolarAngle=c.maxPolar;resize();fit=UI.fitDistance(description,camera.aspect);controls.maxDistance=fit*c.maxZoomOut;camera.position.set(Math.sin(c.polar)*Math.sin(c.azimuth),Math.cos(c.polar),Math.sin(c.polar)*Math.cos(c.azimuth)).multiplyScalar(fit).add(controls.target);controls.update();controls.saveState();interact();}
 function resize(){const w=host.clientWidth,h=Math.max(280,host.clientHeight-toolbar.offsetHeight-hint.offsetHeight);if(!w)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 function mark(k,id){selected=k==='loc'?id:'';for(const [key,o]of objects){o.tag.classList.toggle('selected',key===selected);o.halo.visible=o.b.cur||key===selected||key===hover}toolbar.querySelector('[data-action="descend"]').disabled=!objects.get(selected)?.b.descend;toolbar.querySelector('[data-action="info"]').disabled=!objects.has(selected);awake();}
 function info(id){if(!id)return;document.getElementById('record-detail').innerHTML=UI.unitFile(id);mark('loc',id);history.replaceState(null,'','#map/'+encodeURIComponent(id));}
 function select(id){if(!objects.has(id)||flight)return;mark('loc',id);const next=N.action(frame,id);if(next.view)moveFrame(next.view);else info(next.info);}
 let requested=null;
 function navigate(fid){requested=fid;UI.fitLevel(N.canonical(fid));requested=null;}
 function crumbs(){const chain=[];let f=frame;while(f){chain.unshift(f);f=N.parent(f)}document.getElementById('holo-crumbs').innerHTML=chain.map((v,i)=>i===chain.length-1?'<span aria-current="page">'+UI.esc(v==='cressidium:orbit'?'CRESSIDIUM ORBIT':v==='cressidium'?'CRESSIDIUM SURFACE':v==='SYSTEM'?'SYSTEM':UI.L[v].name)+'</span>':'<button type="button" class="crumb" data-view="'+v+'">'+UI.esc(v==='cressidium:orbit'?'CRESSIDIUM ORBIT':v==='cressidium'?'CRESSIDIUM SURFACE':v==='SYSTEM'?'SYSTEM':UI.L[v].name)+'</button>').join(' › ');document.getElementById('holo-sub').textContent=description.sub;}

 function moveFrame(fid,record=true){if(!fid||fid===frame||flight)return;if(record){history.replaceState({holoView:frame},'',location.href);history.pushState({holoView:fid},'','#map')}interact();if(rm.matches){navigate(fid);return}
  const direction=N.direction(frame,fid),inward=direction==='in';
  const target=inward?(objects.get(N.canonical(fid))?.group.position.clone()||controls.target.clone()):controls.target.clone();
  flight={start:performance.now(),from:camera.position.clone(),to:target.clone().add(camera.position.clone().sub(controls.target).multiplyScalar(inward?.35:2)),fid,direction};awake();}
 function draw(now){raf=0;if(!mode()||document.hidden||panel.hidden||!visible)return;
  const dt=last?Math.min(.05,(now-last)/1000):0;last=now;const moving=!rm.matches&&!paused&&!held&&now>idleUntil;
  if(moving)phase+=dt;
  for(const o of objects.values()){const b=o.b;if(b.orbit){const p=objects.get(b.orbit.parent).group.position,a=b.orbit.phase+phase*2*Math.PI/b.orbit.period;o.group.position.set(p.x+Math.cos(a)*b.orbit.radius,b.pos[1],p.z+Math.sin(a)*b.orbit.radius)}if(o.hull&&b.id==='rio')o.hull.quaternion.setFromAxisAngle(new THREE.Vector3(0,1,0),N.rioHeading(b.orbit.phase+phase*2*Math.PI/b.orbit.period));if(o.spin)o.spin.rotation.y=phase*(b.spin||.015);if(b.surface){const globe=objects.get(b.surface);o.group.position.fromArray(b.pos).applyQuaternion(globe.spin.quaternion).add(globe.group.position);}if(o.card)o.card.quaternion.copy(camera.quaternion);}
  if(flight){controls.enabled=false;const t=Math.min(1,(now-flight.start)/800),e=t*t*(3-2*t);camera.position.lerpVectors(flight.from,flight.to,e);host.style.opacity=String(1-.75*Math.sin(t*Math.PI));if(t===1){const fid=flight.fid;flight=null;controls.enabled=true;host.style.opacity='';navigate(fid)}}
  const changing=flight?false:controls.update();renderer.render(scene,camera);
  if(pendingAssets===0)loading?.ready();
  const placed=[];
  for(const o of objects.values()){projected.copy(o.group.position);projected.y+=(description.city?.72:(o.b.h||o.b.r))+.12;projected.project(camera);const w=o.tag.offsetWidth,h=o.tag.offsetHeight,cw=renderer.domElement.clientWidth;let x=Math.max(w/2+4,Math.min(cw-w/2-4,(projected.x*.5+.5)*cw)),y=Math.max(h+8,(-projected.y*.5+.5)*renderer.domElement.clientHeight);
   for(let i=0;i<objects.size;i++){if(!placed.some(p=>Math.abs(p.x-x)<(p.w+w)/2+3&&Math.abs(p.y-y)<h+3))break;y+=h+4}
   placed.push({x,y,w});o.tag.style.transform=`translate(-50%,-100%) translate(${x}px,${y}px)`;o.tag.style.visibility=projected.z>1||projected.z< -1?'hidden':'';}
  const target=description.city?.target;if(target){projected.set(target.pos[0],1.05,target.pos[2]).project(camera);target.element.style.transform=`translate(-50%,-100%) translate(${Math.max(105,Math.min(renderer.domElement.clientWidth-105,(projected.x*.5+.5)*renderer.domElement.clientWidth))}px,${Math.max(30,(-projected.y*.5+.5)*renderer.domElement.clientHeight)}px)`;}
  for(const z of description.zones.filter(z=>z.tag)){projected.set(z.center[0],.02,z.center[1]+z.rz).project(camera);z.tag.style.transform=`translate(-50%,0) translate(${(projected.x*.5+.5)*renderer.domElement.clientWidth}px,${(-projected.y*.5+.5)*renderer.domElement.clientHeight}px)`;}
  if(moving||changing||flight)awake();
  else if(!rm.matches&&!paused&&!held&&now<idleUntil){clearTimeout(wakeTimer);wakeTimer=setTimeout(awake,idleUntil-now+1);}
 }
 function hit(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects([...objects.values()].map(o=>o.group),true);for(const h of hits){let obj=h.object;while(obj){const o=[...objects.values()].find(o=>o.group===obj);if(o)return o.b.id;obj=obj.parent}}return '';}
 let down=null,maxDrag=0,multi=false;const pointers=new Set();
 renderer.domElement.addEventListener('pointerdown',e=>{pointers.add(e.pointerId);multi=multi||pointers.size>1;if(pointers.size===1){multi=false;down=[e.clientX,e.clientY];maxDrag=0}interact()});
 renderer.domElement.addEventListener('pointerup',e=>pointers.delete(e.pointerId));
 renderer.domElement.addEventListener('pointercancel',()=>{down=null;pointers.clear();multi=true});
 renderer.domElement.addEventListener('click',e=>{if(down&&N.clickAllowed(Math.max(maxDrag,Math.hypot(e.clientX-down[0],e.clientY-down[1])),multi,e.button))select(hit(e));down=null;});
 renderer.domElement.addEventListener('pointermove',e=>{if(down)maxDrag=Math.max(maxDrag,Math.hypot(e.clientX-down[0],e.clientY-down[1]));hover=hit(e);mark('loc',selected);interact()});
 host.addEventListener('pointerdown',interact);host.addEventListener('keydown',e=>{
  interact();if(e.ctrlKey||e.metaKey||e.altKey)return;
  const ids=[...objects.keys()],at=ids.indexOf(e.target.dataset.body||selected);
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const id=ids[(at+(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)+ids.length)%ids.length];objects.get(id).tag.focus();mark('loc',id)}
  else if(e.key==='['||e.key==='Escape'){e.preventDefault();moveFrame(description.ascend)}
  else if(e.key===']'||(e.key==='Enter'&&e.shiftKey)){e.preventDefault();if(objects.get(selected)?.b.descend)select(selected)}
  else if(e.key==='Enter'&&e.target===renderer.domElement){e.preventDefault();select(selected||ids[0])}
  else if(e.target===renderer.domElement||e.target.classList.contains('holo3d-tag')){const keys={'+':'in','=':'in','-':'out',q:'left',e:'right',w:'up',s:'down',a:'panleft',d:'panright'};if(keys[e.key]){e.preventDefault();action(keys[e.key])}}
 });
 function action(a){interact();if(a==='in')controls.dollyIn(1.2);if(a==='out')controls.dollyOut(1.2);if(a==='left')controls.rotateLeft(.2);if(a==='right')controls.rotateLeft(-.2);if(a==='up')controls.pan(0,35);if(a==='down')controls.pan(0,-35);if(a==='panleft')controls.pan(35,0);if(a==='panright')controls.pan(-35,0);if(a==='descend'&&objects.get(selected)?.b.descend)select(selected);if(a==='info')info(selected);if(a==='back')moveFrame(description.ascend);if(a==='overview')moveFrame('SYSTEM');if(a==='pause'){paused=!paused;const b=toolbar.querySelector('[data-action="pause"]');b.setAttribute('aria-pressed',String(paused));b.textContent=paused?'RESUME MOTION':'PAUSE MOTION'}awake();}
 toolbar.addEventListener('click',e=>{if(e.target.dataset.action)action(e.target.dataset.action)});
 panel.addEventListener('click',e=>{if(host.hidden)return;const pv=e.target.closest('[data-view]');if(pv){e.stopImmediatePropagation();moveFrame(pv.dataset.view);return}const fr=e.target.closest('[data-frame]');if(fr){e.stopImmediatePropagation();moveFrame(fr.dataset.frame==='cressidium'?'cressidium:orbit':fr.dataset.frame)}if(e.target.closest('#holo-back')){e.stopImmediatePropagation();reset()}},true);
 UI.onFrame=(fid)=>{if(lost||failed)return;try{build(requested||fid)}catch(e){fallback(e)}};UI.onMark=mark;UI.holo3d={reset,active:()=>!host.hidden,view:()=>frame,cameraState:()=>({distance:camera.position.distanceTo(controls.target),direction:flight?.direction||null})};
 renderer.domElement.addEventListener("webglcontextlost",e=>{e.preventDefault();lost=true;flight=null;controls.enabled=true;stop();mode();UI.fitLevel(N.canonical(frame))});
 renderer.domElement.addEventListener("webglcontextrestored",()=>{lost=false;failed=false;try{build(frame)}catch(e){fallback(e)}});
 document.addEventListener('visibilitychange',()=>document.hidden?stop():awake());
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)awake();else stop()},{rootMargin:'120px'}).observe(view);
 new MutationObserver(()=>{if(panel.hidden)stop();else{resize();awake()}}).observe(panel,{attributes:true,attributeFilter:['hidden']});
 new ResizeObserver(()=>{resize();awake()}).observe(host);
 new MutationObserver(()=>{palette=colors();if(!lost&&!failed)build(frame)}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 rm.addEventListener('change',()=>{phase=0;const destination=flight?.fid;flight=null;controls.enabled=true;host.style.opacity='';if(destination)navigate(destination);awake()});
 window.addEventListener('pagehide',stop);window.addEventListener('pageshow',awake);
 window.addEventListener('hashchange',()=>{if(location.hash.startsWith('#map/'))moveFrame(N.initial(location.hash),false);else if(history.state?.holoView)moveFrame(history.state.holoView,false);});
 window.addEventListener('popstate',()=>{if(history.state?.holoView)moveFrame(history.state.holoView,false);});
 try{host.hidden=false;navigate(N.initial(window.holoEntryHash));if(!window.holoEntryHash||window.holoEntryHash==='#map'){history.replaceState(null,'','#map');document.getElementById('record-detail').innerHTML='<div class="tag">CRESSIDIUM ORBIT</div><p>Select a world to enter. Select hardware to read its file. INFO opens the selected parent’s dossier.</p>';selected='';mark('loc','')}}catch(e){fallback(e)}
}
