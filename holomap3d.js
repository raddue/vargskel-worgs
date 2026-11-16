/* Holographic renderer over UI.scene3d. three.js r187, local imports only.
   SVG remains mounted; a failed import never reaches this module and leaves it visible. */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const host=document.getElementById('holo3d'), view=host?.parentElement;
if(host)boot();
function boot(){
 let renderer,controls,scene,description,objects=new Map(),resources=new Set(),generation=0;
 let raf=0,wakeTimer=0,last=0,phase=0,idleUntil=0,held=false,visible=true,lost=false,failed=false,paused=false,flight=null;
 let selected=document.querySelector('.holo-svg .node.sel')?.dataset.loc||'',hover='',frame='',fit=1;
 const rm=matchMedia('(prefers-reduced-motion: reduce)'), panel=document.getElementById('tab-map');
 const camera=new THREE.PerspectiveCamera(38,1,.01,200);
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),projected=new THREE.Vector3();
 const labels=document.createElement('div');labels.className='holo3d-labels';
 const toolbar=document.createElement('div');toolbar.className='holo3d-tools';
 toolbar.innerHTML='<button type="button" data-action="in" aria-label="Zoom in">+</button><button type="button" data-action="out" aria-label="Zoom out">−</button><button type="button" data-action="left" aria-label="Rotate left">↶</button><button type="button" data-action="right" aria-label="Rotate right">↷</button><button type="button" data-action="up" aria-label="Pan up">↑</button><button type="button" data-action="down" aria-label="Pan down">↓</button><button type="button" data-action="pause" aria-pressed="false">PAUSE MOTION</button><button type="button" data-action="descend" disabled>DESCEND</button>';
 const hint=document.createElement('p');hint.className='holo3d-help';hint.id='holo3d-help';
 hint.textContent='Drag to rotate · scroll / pinch to zoom · right-drag to pan. Arrows: targets · Enter: file · Shift+Enter / ]: descend · [ / Escape: up. + / −: zoom · WASD: pan · Q / E: rotate. Positions schematic.';
 host.append(labels,toolbar,hint);
 const own=o=>(resources.add(o),o);
 const colors=()=>{const c=getComputedStyle(document.documentElement);return Object.fromEntries(['cyan','lime','rust','muted','line','holo-bg'].map(k=>[k,c.getPropertyValue('--'+k).trim()]));};
 let palette=colors();
 function mode(){const active=UI.holoRenderer({webgl:!!renderer,lost,failed})==='3d';host.hidden=!active;view.classList.toggle('is-3d',active);if(UI.syncBack)UI.syncBack();return active;}
 function stop(){cancelAnimationFrame(raf);clearTimeout(wakeTimer);raf=0;last=0;}
 function awake(){if(!raf&&!lost&&!failed&&!document.hidden&&!panel.hidden&&visible)raf=requestAnimationFrame(draw);}
 function interact(){idleUntil=performance.now()+4000;awake();}
 host.addEventListener('focusin',interact);
 document.addEventListener('pointerdown',interact,{passive:true});
 document.addEventListener('keydown',interact);
 function dispose(){generation++;resources.forEach(r=>r.dispose());resources.clear();scene?.clear();objects.clear();labels.replaceChildren();}
 function fallback(error){failed=true;stop();mode();console.warn('3D holomap unavailable; SVG retained.',error);}
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
 function texture(path,done){const g=generation;const t=own(new THREE.TextureLoader().load(path,()=>{if(g!==generation){t.dispose();return}done?.(t);awake()},undefined,e=>{if(g===generation)fallback(e)}));t.colorSpace=THREE.SRGBColorSpace;return t;}
 function build(fid){
  dispose();frame=fid;description=UI.scene3d(fid,{reducedMotion:rm.matches});phase=0;
  scene=new THREE.Scene();scene.add(new THREE.AmbientLight(palette.cyan,2));const light=new THREE.DirectionalLight(0xffffff,3);light.position.set(-3,5,3);scene.add(light);
  renderer.domElement.setAttribute('aria-label',description.aria);host.setAttribute('aria-label',description.aria);
  const grid=new THREE.GridHelper(description.radius*2.5,24,palette.line,palette.line);own(grid.geometry);own(grid.material);grid.material.transparent=true;grid.material.opacity=.35;grid.position.y=-.22;scene.add(grid);
  if(description.mode==='ground'){
   const table=mesh(new THREE.CircleGeometry(description.radius*1.2,64),material(palette.line,.15));table.rotation.x=-Math.PI/2;table.position.y=-.12;
   ring(description.radius*1.2,palette.cyan,scene,-.1);
  }
  for(const b of description.bodies){
   const group=new THREE.Group();group.position.fromArray(b.pos);scene.add(group);
   const tag=document.createElement('button');tag.type='button';tag.className='holo3d-tag';tag.dataset.loc=b.id;tag.setAttribute('aria-label',b.aria);tag.textContent=b.name+(b.descend?' ›':'');tag.title=[...b.badges,...b.sites].join(' · ');labels.append(tag);
   const item={b,group,tag,spin:null};objects.set(b.id,item);
   if(b.shape==='globe'){const globe=mesh(new THREE.SphereGeometry(b.r,40,24),holo(texture(b.map)),group);globe.rotation.z=b.tilt;item.spin=globe;}
   else if(b.shape==='hull'){
    const g=generation;new GLTFLoader().load(b.model,gltf=>{
     if(g!==generation){gltf.scene.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose()});return}
     const hull=gltf.scene;hull.traverse(o=>{if(o.isMesh){own(o.geometry);o.geometry.computeVertexNormals();o.material?.dispose();o.material=own(new THREE.MeshPhongMaterial({color:palette.muted,emissive:palette.line,shininess:60,flatShading:true}));}});
     hull.scale.setScalar(b.r*2);hull.rotation.set(b.pitch,b.yaw,b.roll);group.add(hull);awake();
    },undefined,e=>{if(g===generation)fallback(e)});
   }else if(b.shape==='debris'){
    const inst=new THREE.InstancedMesh(own(new THREE.BoxGeometry(.04,.03,.08)),material(palette.cyan),b.count);const dummy=new THREE.Object3D();
    for(let i=0;i<b.count;i++){const a=i*2.39996,r=b.r*Math.sqrt((i+.5)/b.count);dummy.position.set(Math.cos(a)*r,Math.sin(i*31)*.14,Math.sin(a)*r);dummy.rotation.set(i,i*2,i*3);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix)}group.add(inst);own(inst);item.spin=inst;
   }else{
    mesh(new THREE.OctahedronGeometry(b.r*.65),material(b.cur?palette.lime:palette.cyan),group);
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
  reset();mark('loc',selected);mode();awake();
 }
 function reset(){if(!description)return;const c=description.camera;camera.fov=c.fov;controls.target.fromArray(c.target);controls.cursor.copy(controls.target);controls.maxTargetRadius=description.radius*.65;controls.minDistance=c.minDistance;controls.minPolarAngle=c.minPolar;controls.maxPolarAngle=c.maxPolar;resize();fit=UI.fitDistance(description,camera.aspect);controls.maxDistance=fit*c.maxZoomOut;camera.position.set(Math.sin(c.polar)*Math.sin(c.azimuth),Math.cos(c.polar),Math.sin(c.polar)*Math.cos(c.azimuth)).multiplyScalar(fit).add(controls.target);controls.update();controls.saveState();interact();}
 function resize(){const w=host.clientWidth,h=Math.max(280,host.clientHeight-toolbar.offsetHeight-hint.offsetHeight);if(!w)return;renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();}
 function mark(k,id){selected=k==='loc'?id:'';for(const [key,o]of objects){o.tag.classList.toggle('selected',key===selected);o.halo.visible=o.b.cur||key===selected||key===hover}toolbar.querySelector('[data-action="descend"]').disabled=!objects.get(selected)?.b.descend;awake();}
 function select(id){const o=objects.get(id);if(o)o.tag.click();}
 function moveFrame(fid){if(!fid||fid===frame)return;interact();if(rm.matches){UI.fitLevel(fid);return}
  const target=objects.get(fid)?.group.position.clone()||controls.target.clone();flight={start:performance.now(),from:camera.position.clone(),to:target.clone().add(camera.position.clone().sub(controls.target).multiplyScalar(.35)),fid};awake();}
 function draw(now){raf=0;if(!mode()||document.hidden||panel.hidden||!visible)return;
  const dt=last?Math.min(.05,(now-last)/1000):0;last=now;const moving=!rm.matches&&!paused&&!held&&now>idleUntil;
  if(moving)phase+=dt;
  for(const o of objects.values()){const b=o.b;if(b.orbit){const p=objects.get(b.orbit.parent).group.position,a=b.orbit.phase+phase*2*Math.PI/b.orbit.period;o.group.position.set(p.x+Math.cos(a)*b.orbit.radius,b.pos[1],p.z+Math.sin(a)*b.orbit.radius)}if(o.spin)o.spin.rotation.y=phase*(b.spin||.015);if(o.card)o.card.quaternion.copy(camera.quaternion);}
  if(flight){controls.enabled=false;const t=Math.min(1,(now-flight.start)/800),e=t*t*(3-2*t);camera.position.lerpVectors(flight.from,flight.to,e);host.style.opacity=String(1-.75*Math.sin(t*Math.PI));if(t===1){const fid=flight.fid;flight=null;controls.enabled=true;host.style.opacity='';UI.fitLevel(fid)}}
  const changing=controls.update();renderer.render(scene,camera);
  const placed=[];
  for(const o of objects.values()){projected.copy(o.group.position);projected.y+=(o.b.h||o.b.r)+.12;projected.project(camera);const w=o.tag.offsetWidth,h=o.tag.offsetHeight,cw=renderer.domElement.clientWidth;let x=Math.max(w/2+4,Math.min(cw-w/2-4,(projected.x*.5+.5)*cw)),y=Math.max(h+8,(-projected.y*.5+.5)*renderer.domElement.clientHeight);
   for(let i=0;i<objects.size;i++){if(!placed.some(p=>Math.abs(p.x-x)<(p.w+w)/2+3&&Math.abs(p.y-y)<h+3))break;y+=h+4}
   placed.push({x,y,w});o.tag.style.transform=`translate(-50%,-100%) translate(${x}px,${y}px)`;o.tag.style.visibility=projected.z>1||projected.z< -1?'hidden':'';}
  for(const z of description.zones.filter(z=>z.tag)){projected.set(z.center[0],.02,z.center[1]+z.rz).project(camera);z.tag.style.transform=`translate(-50%,0) translate(${(projected.x*.5+.5)*renderer.domElement.clientWidth}px,${(-projected.y*.5+.5)*renderer.domElement.clientHeight}px)`;}
  if(moving||changing||flight)awake();
  else if(!rm.matches&&!paused&&!held&&now<idleUntil){clearTimeout(wakeTimer);wakeTimer=setTimeout(awake,idleUntil-now+1);}
 }
 function hit(e){const r=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects([...objects.values()].map(o=>o.group),true);for(const h of hits){let obj=h.object;while(obj){const o=[...objects.values()].find(o=>o.group===obj);if(o)return o.b.id;obj=obj.parent}}return '';}
 let down=null;
 renderer.domElement.addEventListener('pointerdown',e=>{down=[e.clientX,e.clientY];interact()});
 renderer.domElement.addEventListener('click',e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])<5)select(hit(e))});
 renderer.domElement.addEventListener('dblclick',e=>{const id=hit(e);if(objects.get(id)?.b.descend)moveFrame(id)});
 renderer.domElement.addEventListener('pointermove',e=>{hover=hit(e);mark('loc',selected);interact()});
 host.addEventListener('pointerdown',interact);host.addEventListener('keydown',e=>{
  interact();if(e.ctrlKey||e.metaKey||e.altKey)return;
  const ids=[...objects.keys()],at=ids.indexOf(e.target.dataset.loc||selected);
  if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const id=ids[(at+(e.key==='ArrowLeft'||e.key==='ArrowUp'?-1:1)+ids.length)%ids.length];objects.get(id).tag.focus();mark('loc',id)}
  else if(e.key==='['||e.key==='Escape'){e.preventDefault();moveFrame(description.ascend)}
  else if(e.key===']'||(e.key==='Enter'&&e.shiftKey)){e.preventDefault();if(objects.get(selected)?.b.descend)moveFrame(selected)}
  else if(e.key==='Enter'&&e.target===renderer.domElement){e.preventDefault();select(selected||ids[0])}
  else if(e.target===renderer.domElement||e.target.classList.contains('holo3d-tag')){const keys={'+':'in','=':'in','-':'out',q:'left',e:'right',w:'up',s:'down',a:'panleft',d:'panright'};if(keys[e.key]){e.preventDefault();action(keys[e.key])}}
 });
 function action(a){interact();if(a==='in')controls.dollyIn(1.2);if(a==='out')controls.dollyOut(1.2);if(a==='left')controls.rotateLeft(.2);if(a==='right')controls.rotateLeft(-.2);if(a==='up')controls.pan(0,35);if(a==='down')controls.pan(0,-35);if(a==='panleft')controls.pan(35,0);if(a==='panright')controls.pan(-35,0);if(a==='descend'&&objects.get(selected)?.b.descend)moveFrame(selected);if(a==='pause'){paused=!paused;const b=toolbar.querySelector('[data-action="pause"]');b.setAttribute('aria-pressed',String(paused));b.textContent=paused?'RESUME MOTION':'PAUSE MOTION'}awake();}
 toolbar.addEventListener('click',e=>{if(e.target.dataset.action)action(e.target.dataset.action)});
 panel.addEventListener('click',e=>{if(host.hidden)return;const fr=e.target.closest('[data-frame]');if(fr){e.stopImmediatePropagation();moveFrame(fr.dataset.frame)}if(e.target.closest('#holo-back')){e.stopImmediatePropagation();reset()}},true);
 UI.onFrame=(fid)=>{try{build(fid)}catch(e){fallback(e)}};UI.onMark=mark;UI.holo3d={reset,active:()=>!host.hidden};
 renderer.domElement.addEventListener("webglcontextlost",e=>{e.preventDefault();lost=true;flight=null;stop();mode()});
 renderer.domElement.addEventListener("webglcontextrestored",()=>{lost=false;failed=false;try{build(UI.frameId())}catch(e){fallback(e)}});
 document.addEventListener('visibilitychange',()=>document.hidden?stop():awake());
 new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)awake();else stop()},{rootMargin:'120px'}).observe(view);
 new MutationObserver(()=>{if(panel.hidden)stop();else{resize();awake()}}).observe(panel,{attributes:true,attributeFilter:['hidden']});
 new ResizeObserver(()=>{resize();awake()}).observe(host);
 new MutationObserver(()=>{palette=colors();if(!lost&&!failed)build(frame)}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
 rm.addEventListener('change',()=>{phase=0;flight=null;host.style.opacity='';awake()});
 window.addEventListener('pagehide',stop);window.addEventListener('pageshow',awake);
 try{host.hidden=false;build(UI.frameId()||'SYSTEM')}catch(e){fallback(e)}
}
