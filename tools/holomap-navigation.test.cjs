const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const b={document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[],addEventListener(){}},matchMedia:()=>({matches:false,addEventListener(){}}),CSS:{escape:String},location:{hash:''},console};b.window=b;vm.createContext(b);for(const f of ['campaign.js','archive.js'])vm.runInContext(fs.readFileSync(f,'utf8'),b);
assert.ok(fs.existsSync('holomap-view.js'),'presentation navigation module exists');vm.runInContext(fs.readFileSync('holomap-view.js','utf8'),b);
const N=b.UI.holoView,before=JSON.stringify(b.CAMPAIGN),orbit=N.scene('cressidium:orbit');
assert.deepEqual(Array.from(orbit.bodies,b=>b.id).sort(),['cressidium','kessen','pell','rio']);
assert.equal(new Set(orbit.bodies.map(b=>b.id)).size,4);
for(const phase of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const yaw=N.rioHeading(phase);assert.ok(Math.abs(Math.sin(yaw)+Math.sin(phase))<1e-10);assert.ok(Math.abs(Math.cos(yaw)-Math.cos(phase))<1e-10,'GLB +Z nose follows increasing-phase tangent');}
assert.equal(orbit.bodies.find(b=>b.id==='pell').r,orbit.bodies.find(b=>b.id==='cressidium').r/6,'Pell visible radius is exactly one sixth of Cressidium');
assert.equal(N.initial(''),'cressidium:orbit');assert.equal(N.initial('#map'),'cressidium:orbit');assert.equal(N.initial('#map/dock'),'industry');assert.equal(N.initial('#map/rio'),'elysia');
assert.equal(N.action('cressidium:orbit','cressidium').view,'cressidium');assert.equal(N.action('cressidium','elysia').view,'elysia');assert.equal(N.action('elysia','industry').view,'industry');assert.equal(N.action('industry','dock').info,'dock');
for(const [from,to,direction] of [['SYSTEM','cressidium:orbit','in'],['cressidium:orbit','cressidium','in'],['cressidium','elysia','in'],['elysia','industry','in'],['industry','elysia','out'],['elysia','cressidium','out'],['cressidium','cressidium:orbit','out'],['industry','SYSTEM','out'],['SYSTEM','SYSTEM','none'],['elysia','tarn','out']])assert.equal(N.direction(from,to),direction,from+' to '+to);
assert.equal(N.parent('cressidium'),'cressidium:orbit');assert.equal(N.parent('cressidium:orbit'),'SYSTEM');assert.equal(N.parent('elysia'),'cressidium');
const surface=N.scene('cressidium');assert.equal(surface.mode,'surface');assert.ok(surface.bodies.some(b=>b.shape==='globe'));const globe=surface.bodies.find(b=>b.id==='cressidium');for(const pin of surface.bodies.filter(b=>b.surface))assert.ok(Math.abs(Math.hypot(...pin.pos)-globe.r)<.001);
// Prepared 1024×512 map: (316,235) sits on the land side of the eastern tan shoreline.
const city=surface.bodies.find(b=>b.id==='elysia'),u=316/1024,v=235/512;
const expected=[-Math.cos(2*Math.PI*u)*Math.sin(Math.PI*v),Math.cos(Math.PI*v),Math.sin(2*Math.PI*u)*Math.sin(Math.PI*v)];
expected.forEach((x,i)=>assert.ok(Math.abs(city.pos[i]/globe.r-x)<1e-10,'shoreline pin uses SphereGeometry UV mapping'));
assert.equal(N.clickAllowed(0,false,0),true);assert.equal(N.clickAllowed(6,false,0),false);assert.equal(N.clickAllowed(0,true,0),false);assert.equal(N.clickAllowed(0,false,2),false);
const cityView=N.scene('elysia'),industrial=N.scene('industry');
assert.ok(!cityView.bodies.some(b=>b.id==='rio'),'Rio stays out of city presentation');
assert.ok(orbit.bodies.some(b=>b.id==='rio'),'Rio remains selectable in orbit');
assert.deepEqual(Array.from(cityView.bodies,b=>b.id).sort(),['district','dropzone','elysia','industry','vsaf']);
assert.deepEqual(Array.from(industrial.bodies,b=>b.id).sort(),['dock','industry']);
for(const view of [cityView,industrial]){
 assert.ok(view.city&&view.city.buildings.length>30&&view.city.buildings.length<=300,'bounded city buildings');
 assert.equal(JSON.stringify(view.city),JSON.stringify(N.scene(view.frame).city),'deterministic city geometry');
 assert.ok(view.city.streets.length>2&&view.city.water,'streets and shoreline described');
 assert.match(view.city.notice,/schematic/i);
 for(const block of view.city.buildings){assert.ok(block.size.every(n=>n>0&&Number.isFinite(n)));assert.ok(block.pos.every(Number.isFinite));for(const poi of view.bodies)assert.ok(Math.hypot(block.pos[0]-poi.pos[0],block.pos[2]-poi.pos[2])>.18,'POI clearing');}
 assert.ok(view.bodies.every(b=>!b.h),'no art billboards in city');
}
assert.equal(cityView.city.target.label,'JAMMER SITE / CURRENT TARGET');
assert.equal(cityView.city.target.id,undefined,'annotation has no canonical ID');
assert.equal(industrial.city.target,undefined,'current target is not inside factory');
assert.ok(cityView.city.buildings.some(x=>x.kind==='commercial'&&x.size[1]>.35),'distinct tall commercial cluster');
assert.ok(cityView.city.target.pos.every(Number.isFinite));
assert.deepEqual(Object.keys(cityView.city).sort(),['buildings','notice','parks','quay','streets','target','water'],'only approved geometry and current annotation delivered');
for(const view of [cityView,industrial]){const bs=view.city.buildings;
 assert.ok(new Set(bs.map(b=>b.form)).size>=4,'compound and stepped forms');
 assert.ok(new Set(bs.map(b=>b.yaw.toFixed(2))).size>=6,'corridor-aligned rotation diversity');
 assert.ok(new Set(bs.map(b=>b.size[0].toFixed(2)+":"+b.size[2].toFixed(2))).size>15,'footprint diversity');
 assert.ok(Math.max(...bs.map(b=>b.pos[0]))-Math.min(...bs.map(b=>b.pos[0]))>view.radius*1.4,'broad frame coverage');
 assert.ok(view.city.parks.length>=3,'planned open spaces');
 assert.ok(view.city.water.points.length>12,'organic shoreline');
}
const renderer=fs.readFileSync('holomap3d.js','utf8');
assert.match(renderer,/createElement\('span'\);target.className='holo3d-target'/,'target is noninteractive text');
assert.doesNotMatch(renderer.slice(renderer.indexOf("if(city.target){"),renderer.indexOf("hint.textContent='Drag",renderer.indexOf("if(city.target){"))),/target\.(?:dataset|tabIndex)|target\.addEventListener/,'annotation has no selection, focus or dossier route');
assert.deepEqual(Array.from(cityView.bodies,b=>b.name).sort(),Array.from(b.CAMPAIGN.locations.filter(l=>['elysia','district','industry','dropzone','vsaf'].includes(l.id)),l=>l.name).sort(),'city delivers only existing player-known POIs');
assert.deepEqual(Object.keys(cityView.city.target).sort(),['label','pos'],'current annotation carries no future encounter metadata');
const graveyard=N.scene('SYSTEM').bodies.find(b=>b.id==='cairn');
assert.ok(graveyard.debris,'Cairn has explicit debris description');
assert.equal(JSON.stringify(graveyard.debris),JSON.stringify(N.scene('SYSTEM').bodies.find(b=>b.id==='cairn').debris),'debris deterministic');
assert.ok(graveyard.debris.length>=20&&graveyard.debris.length<=45,'sparse bounded pieces');
assert.ok(new Set(graveyard.debris.map(p=>p.kind)).size>=4,'distinct hull/rib/plate/engine forms');
for(const p of graveyard.debris)assert.ok(Math.hypot(...p.pos)+Math.max(...p.size)/2<=graveyard.r*1.4,'debris bounded by field radius');
assert.equal(JSON.stringify(b.CAMPAIGN),before);console.log('holomap navigation regressions OK');
