#!/usr/bin/env node
/* #26 loadout checks. Kept in this file rather than in check-all.cjs, because check-all is the
   shared gate and this is one ticket's assertions; check-all spawns it as a single line.
   Run: node tools/loadout-check.cjs */
const fs = require("fs"), path = require("path"), vm = require("vm"), { spawnSync } = require("child_process");
const ROOT = path.join(__dirname, "..");
const errs = [];

/* catalogue.js is generated from lancer-data, so a stale or missing copy has to fail here. */
const catPath = path.join(ROOT, "catalogue.js");
if (!fs.existsSync(catPath)) errs.push("catalogue.js is missing (run: node tools/build-catalogue.cjs)");
else {
  const box = { window: {}, console, matchMedia: () => ({ matches: true }) };
  vm.runInNewContext(fs.readFileSync(catPath, "utf8"), box, { filename: "catalogue.js" });
  const CAT = box.window.CATALOGUE;
  if (!CAT || !CAT.weapons || !CAT.systems || !CAT.frames)
    errs.push("catalogue.js must define window.CATALOGUE with weapons, systems and frames");
  else {
    const w = CAT.weapons["Nexus (Hunter-Killer)"];
    if (!w) errs.push("catalogue: GMS Nexus (Hunter-Killer) must resolve by name");
    else {
      if (w.mount !== "Main") errs.push(`catalogue: Nexus (Hunter-Killer) mount must be Main, got ${JSON.stringify(w.mount)}`);
      if (!Array.isArray(w.bands) || !w.bands.length) errs.push("catalogue: Nexus (Hunter-Killer) must carry bands");
    }
    const s = CAT.systems["Personalizations"];
    if (!s || s.sp !== 1 || !s.tg_unique) errs.push("catalogue: Personalizations must carry sp 1 and tg_unique");
    const f = CAT.frames["GMS Everest"];
    if (!f || !Array.isArray(f.mounts) || f.mounts.join(",") !== "Main,Flex,Heavy")
      errs.push(`catalogue: GMS Everest must carry mounts Main,Flex,Heavy, got ${JSON.stringify(f && f.mounts)}`);
  }
}
const gen = path.join(__dirname, "build-catalogue.cjs");
if (!fs.existsSync(gen)) errs.push("tools/build-catalogue.cjs is missing");
else if (spawnSync(process.execPath, [gen, "--check"], { encoding: "utf8" }).status !== 0)
  errs.push("catalogue.js stale; regen: node tools/build-catalogue.cjs");


/* --- gating (design test 4) ----------------------------------------------------------------
   On a fixture so the cap is pinned by arithmetic instead of by today's data: a frame with
   sys 3, a mech with sys 3 and an LL6 pilot give 3 + floor(3/2) + ceil(6/2) = 7. */
let core, cat;
if (!fs.existsSync(path.join(ROOT, "loadout.js"))) errs.push("loadout.js is missing");
else {
  core = require(path.join(ROOT, "loadout.js"));
  const CAT = (() => {
    const box = { window: {}, console, matchMedia: () => ({ matches: true }) };
    vm.runInNewContext(fs.readFileSync(catPath, "utf8"), box, { filename: "catalogue.js" });
    return box.window.CATALOGUE;
  })();
  if (!CAT.fittings) errs.push("catalogue must carry the mount fitting table from rules.json");
  else {
    const FIX_FRAME = { name: "FIXTURE EVEREST", mounts: ["Main", "Flex", "Heavy"], sys: 3 };
    cat = { weapons: CAT.weapons, systems: CAT.systems, frames: Object.assign({}, CAT.frames, { "FIXTURE EVEREST": FIX_FRAME }), fittings: CAT.fittings };
    const heavy = Object.keys(cat.weapons).find(n => cat.weapons[n].mount === "Heavy");
    const gms = "Nexus (Hunter-Killer)";
    const fixturePilot = { id: "fix", ll: 6, licences: [{ name: "GMS", rank: 1 }] };
    const build = { mech: "fix", frame: "FIXTURE EVEREST", pilot: "fix", sys: 3,
      mounts: [{ slot: "Main", weapons: [] }, { slot: "Flex", weapons: [] }, { slot: "Heavy", weapons: [] }], systems: [] };
    const copy = () => JSON.parse(JSON.stringify(build));
    const say = (label, got, want) => { if (!got || got.reason !== want) errs.push(`canMount: ${label} must be ${want}, got ${JSON.stringify(got)}`); };

    const cap = core.spCheck(copy(), FIX_FRAME, cat, fixturePilot);
    if (cap.cap !== 7) errs.push(`spCheck: fixture cap must be 7, got ${JSON.stringify(cap.cap)}`);
    if (!core.canMount(fixturePilot, copy(), 0, 0, gms, cat).ok) errs.push("canMount: a GMS Main weapon must fit a Main seat");
    if (!heavy) errs.push("loadout-check: no Heavy weapon in the catalogue to test with");
    else say("a Heavy weapon in a Main seat", core.canMount(fixturePilot, copy(), 0, 0, heavy, cat), "WRONG MOUNT TYPE");
    /* Every weapon the subset carries is GMS, since all six pilots are LL0, so the licence gate is
       tested on a synthetic catalogue entry rather than on today's data. */
    const licensed = { weapons: Object.assign({ "GATED RIFLE": { mount: "Main", license: "IPS-N", license_level: 1, tags: [] } }, cat.weapons),
      systems: cat.systems, frames: cat.frames, fittings: cat.fittings };
    say("a weapon whose licence the pilot lacks", core.canMount({ id: "p", ll: 0, licences: [] }, copy(), 0, 0, "GATED RIFLE", licensed), "UNLICENSED");
    say("a weapon whose licence rank the pilot has not reached", core.canMount({ id: "p", ll: 1, licences: [{ name: "IPS-N", rank: 0 }] }, copy(), 0, 0, "GATED RIFLE", licensed), "UNLICENSED");
    if (!core.canMount({ id: "p", ll: 1, licences: [{ name: "IPS-N", rank: 1 }] }, copy(), 0, 0, "GATED RIFLE", licensed).ok)
      errs.push("canMount: a weapon at or under the held licence rank must be allowed");
    const two = copy(); two.mounts[0].weapons = [gms];
    say("a second weapon in one seat", core.canMount(fixturePilot, two, 0, 0, gms, cat), "SLOT FULL");

    /* unplace answers like place, because a decision that cannot report why it refused cannot be
       asked without being obeyed. A seat with nothing at it and a locked mount are both refusals. */
    const put = core.place(fixturePilot, copy(), 0, 0, gms, cat);
    const off = core.unplace(put.build, 0, 0, cat);
    if (!off || off.ok !== true || off.reason !== null)
      errs.push(`unplace: taking a weapon out must answer {ok, reason, build}, got ${JSON.stringify(off)}`);
    else if ((off.build.mounts[0].weapons || []).length)
      errs.push("unplace: the removed weapon must be gone from the seat");
    say("a seat with nothing in it", core.unplace(copy(), 0, 0, cat), "EMPTY SEAT");
    say("a mount that does not exist", core.unplace(copy(), 9, 0, cat), "EMPTY SEAT");
    const locked = copy(); locked.mounts[1].locked = true;
    say("a locked mount", core.unplace(locked, 1, 0, cat), "SLOT LOCKED");
    const plastic = copy(); plastic.mounts[1].weapons = [gms];
    const freed = core.unplace(core.place(fixturePilot, copy(), 2, 0, "Cyclone Pulse Rifle", cat, { lockSlot: 1 }).build, 2, 0, cat);
    if (!freed || freed.ok !== true) errs.push(`unplace: taking the Superheavy out must succeed, got ${JSON.stringify(freed)}`);
    else if (freed.build.mounts.some(m => m.locked)) errs.push("unplace: taking the Superheavy out must clear the lock it took");
    if (!plastic.mounts[1].weapons.length) errs.push("loadout-check: the lock fixture must keep its own weapon");
    say("an unknown weapon", core.canMount(fixturePilot, copy(), 0, 0, "Nonexistent Rifle", cat), "UNKNOWN WEAPON");
    /* over cap, on a second fixture with a cap of exactly 0 (frame sys 0, mech sys 0, LL0), so one
       SP-costing system is already over it. The subset holds no seven-SP build to spend against 7. */
    const tightFrame = { name: "TIGHT FIXTURE", mounts: ["Main", "Flex", "Heavy"], sys: 0 };
    const tight = { weapons: cat.weapons, systems: cat.systems, fittings: cat.fittings,
      frames: Object.assign({}, cat.frames, { "TIGHT FIXTURE": tightFrame }) };
    const spendy = Object.keys(cat.systems).find(n => cat.systems[n].sp > 0 && !cat.systems[n].tg_unique && !cat.systems[n].tg_ai);
    if (!spendy) errs.push("loadout-check: no SP-costing system in the catalogue to test the cap with");
    else {
      const over = copy(); over.frame = "TIGHT FIXTURE"; over.sys = 0; over.systems = [spendy];
      const zeroPilot = { id: "z", ll: 0, licences: [{ name: "GMS", rank: 1 }] };
      const chk = core.spCheck(over, tightFrame, tight, zeroPilot);
      if (chk.cap !== 0) errs.push(`spCheck: the tight fixture cap must be 0, got ${JSON.stringify(chk.cap)}`);
      if (chk.ok) errs.push("spCheck: one SP-costing system must exceed a cap of 0");
      say("an over-cap build", core.canMount(zeroPilot, over, 1, 0, gms, tight), "OVER SP CAP");
    }
  }
}

/* --- the range finder (design test 5) -------------------------------------------------------
   Real data where the subset carries the weapon; synthetic entries where it does not, because the
   subset is the set the site can field and no fielded weapon has a Cone, a Line or an N/A band.
   Daisy Cutter (Cone 7) and Apocalypse Rail's `Charge Rail: 4` profile are both out of it. */
if (!core || !cat) { /* loadout.js or the catalogue is missing, and that is already reported */ }
else if (typeof core.rangeReadout !== "function") errs.push("rangeReadout is missing");
else {
  const cat2 = { weapons: Object.assign({
      "SYNTH THREAT": { mount: "Main", bands: [{ kind: "Threat", value: 3 }], tags: [], profiles: [] },
      "SYNTH CONE": { mount: "Main", bands: [{ kind: "Cone", value: 7 }], tags: [], profiles: [] },
      "SYNTH RAIL": { mount: "Heavy", bands: [], tags: [], profiles: [{ name: "Charge Rail: 4", bands: [{ kind: "Range", value: "N/A" }], tags: [], damage: [{ val: "N/A" }] }] }
    }, cat.weapons), systems: cat.systems, frames: cat.frames, fittings: cat.fittings };
  const withWeapon = name => ({ mech: "x", frame: "FIXTURE EVEREST", pilot: "p", sys: 0, attackBonus: 2,
    mounts: [{ slot: "Main", weapons: [name] }, { slot: "Flex", weapons: [] }, { slot: "Heavy", weapons: [] }], systems: [] });
  const fired = (name, distance) => {
    const rows = core.rangeReadout(withWeapon(name), distance, cat2);
    return rows && rows[0] && rows[0].profiles && rows[0].profiles[0];
  };
  const expect = (label, got, want) => {
    if (!got) { errs.push(`rangeReadout: ${label} produced no profile`); return; }
    for (const k of Object.keys(want)) if (got[k] !== want[k])
      errs.push(`rangeReadout: ${label} ${k} must be ${JSON.stringify(want[k])}, got ${JSON.stringify(got[k])}`);
  };
  expect("a Threat 3 band at distance 5", fired("SYNTH THREAT", 5), { canFire: false, state: "out of range" });
  expect("a Threat 3 band at distance 3", fired("SYNTH THREAT", 3), { canFire: true, state: "in band" });
  expect("Pistol Range 5 at distance 5", fired("Pistol", 5), { canFire: true, state: "in band" });
  expect("Pistol Range 5 at distance 9", fired("Pistol", 9), { canFire: false, state: "out of range" });
  expect("Cone 7 at distance 5", fired("SYNTH CONE", 5), { canFire: true, state: "in band", pattern: true });
  expect("Thrown 3 at distance 3", fired("Tactical Knife", 3), { canFire: true, state: "in band" });
  expect("Thrown 3 at distance 4", fired("Tactical Knife", 4), { canFire: false, state: "out of range" });
  expect("Missile Rack Range 10 Blast 1 at 10", fired("Missile Rack", 10), { canFire: true, state: "in band" });
  expect("Missile Rack Range 10 Blast 1 at 11", fired("Missile Rack", 11), { canFire: true, state: "out of band, in blast" });
  expect("Missile Rack Range 10 Blast 1 at 12", fired("Missile Rack", 12), { canFire: false, state: "out of range" });
  expect("an N/A band at distance 1", fired("SYNTH RAIL", 1), { canFire: false, state: "out of range", note: "band shown as-is: Range N/A" });
  /* accuracy is two fields, never one summed number */
  const amr = core.rangeReadout(withWeapon("Anti-Materiel Rifle"), 5, cat2)[0].accuracy;
  const hmg = core.rangeReadout(withWeapon("Heavy Machine Gun"), 5, cat2)[0].accuracy;
  if (!amr || amr.attackBonus !== 2 || amr.dice !== 1) errs.push(`rangeReadout: the Accurate tag must give dice +1 beside attackBonus 2, got ${JSON.stringify(amr)}`);
  if (!hmg || hmg.dice !== -1) errs.push(`rangeReadout: the Inaccurate tag must give dice -1, got ${JSON.stringify(hmg)}`);
}


/* --- the records themselves (design test 2, record half) -------------------------------------
   Runs against the migrated campaign.js: mounts legal for their slots, every weapon resolvable, no
   Superheavy slot, no duplicate unique item, at most one AI, spend at or under the cap where the
   frame resolves, and the lock rules. Averna and Wayward carry frames the data does not hold, so
   their cap is unknown and the spend check skips them, which is the behaviour canMount has too. */
if (core && cat) {
  const box = { window: {}, console, matchMedia: () => ({ matches: true }) };
  vm.runInNewContext(fs.readFileSync(path.join(ROOT, "campaign.js"), "utf8"), box, { filename: "campaign.js" });
  const C = box.window.CAMPAIGN;
  const norm = x => String(x || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const frameOf = rec => Object.values(cat.frames).find(f => f && (norm(f.name) === norm(rec.frame) || norm(`${f.source || ""} ${f.name}`) === norm(rec.frame))) || null;
  const pilotOf = rec => (C.pilots || []).find(p => p.id === rec.pilot) || null;
  /* records carry systems as a list of names, so the page seeds them straight in */
  const systemsOf = rec => Array.isArray(rec.systems) ? rec.systems.slice() : String(rec.systems || "").split(",").map(x => x.trim()).filter(Boolean);
  const buildOf = rec => ({ mech: rec.id, frame: rec.frame, pilot: rec.pilot, sys: rec.sys, mounts: rec.mounts || [], systems: systemsOf(rec) });

  const recordProblems = rec => {
    const out = [];
    const frame = frameOf(rec);
    const pilot = pilotOf(rec);
    const slots = (rec.mounts || []).map(m => m && m.slot);
    if (!(rec.mounts || []).length) out.push("no mounts");
    for (const m of rec.mounts || []) {
      if (!m || typeof m.slot !== "string" || !Array.isArray(m.weapons)) { out.push("a mount must carry a slot and a weapons list"); continue; }
      if (m.slot === "Superheavy") out.push("a record must not carry a Superheavy slot");
      const allowed = core.seats(m.slot, cat.fittings);
      m.weapons.forEach((name, seat) => {
        if (name === null || name === undefined) return;
        const w = cat.weapons[name];
        if (!w) { out.push(`${name} does not resolve in the catalogue`); return; }
        if (w.mount === "Superheavy") {
          if (m.slot !== "Heavy") out.push(`${name} is a Superheavy, which only a Heavy slot takes`);
          return;
        }
        const list = allowed[seat];
        if (!list || !list.includes(w.mount)) out.push(`${name} is a ${w.mount} and does not fit a ${m.slot} seat`);
      });
    }
    if (frame && Array.isArray(frame.mounts) && JSON.stringify(slots) !== JSON.stringify(frame.mounts))
      out.push(`the record's slots ${JSON.stringify(slots)} are not ${frame.name}'s ${JSON.stringify(frame.mounts)}`);
    const carried = [];
    for (const m of rec.mounts || []) for (const n of (m && m.weapons) || []) if (n) carried.push(n);
    const held = carried.concat(systemsOf(rec));
    const uniq = n => { const w = cat.weapons[n]; if (w) return (w.tags || []).some(t => t.id === "tg_unique"); const s = cat.systems[n]; return !!(s && s.tg_unique); };
    const ai = n => { const w = cat.weapons[n]; if (w) return (w.tags || []).some(t => t.id === "tg_ai"); const s = cat.systems[n]; return !!(s && s.tg_ai); };
    const uniqNames = held.filter(uniq);
    if (new Set(uniqNames).size !== uniqNames.length) out.push(`duplicate unique item: ${uniqNames.join(", ")}`);
    if (held.filter(ai).length > 1) out.push("more than one AI item");
    const locks = (rec.mounts || []).filter(m => m && m.locked === true);
    const heavies = (rec.mounts || []).map((m, i) => [i, ((m && m.weapons) || []).find(n => { const w = cat.weapons[n]; return w && w.mount === "Superheavy"; })]).filter(x => x[1]);
    if (locks.length !== (heavies.length ? 1 : 0)) out.push(`${locks.length} locked mount(s) with ${heavies.length} Superheavy`);
    for (const m of locks) {
      if ((m.weapons || []).some(Boolean)) out.push("a locked mount carries weapons");
      const at = (rec.mounts || []).indexOf(m);
      if (heavies.some(x => x[0] === at)) out.push("the Superheavy's own mount is locked");
    }
    if (frame) {
      const chk = core.spCheck(buildOf(rec), frame, cat, pilot);
      if (!chk.ok) out.push(`spends ${chk.spend} against a cap of ${chk.cap}`);
    }
    return out;
  };

  for (const rec of C.mechs || []) for (const p of recordProblems(rec)) errs.push(`${rec.id}: ${p}`);
  /* The records spell frames in caps ("GMS EVEREST") while the catalogue is keyed by name. A
     resolution that misses drops the SP cap silently, so pin both halves of that contract. */
  {
    if (!core.frameOf) errs.push("the core must export frameOf so the page and the gate agree on resolution");
    else if (!core.frameOf({ frame: "GMS EVEREST" }, cat)) errs.push("frameOf must resolve a caps-spelled frame against the catalogue");
    let resolved = 0;
    for (const rec of C.mechs || []) {
      const frame = frameOf(rec);
      if (!frame) continue;
      resolved += 1;
      const chk = core.spCheck(buildOf(rec), frame, cat, pilotOf(rec));
      if (typeof chk.cap !== "number") errs.push(`${rec.id}: a resolved frame must produce a numeric SP cap`);
    }
    if (!resolved) errs.push("no real record's frame resolves, so the SP cap never applies to the roster");
    /* a frame the catalogue lacks must stay an explicit null cap, not a fabricated one */
    const missing = core.spCheck(buildOf({ frame: "GMS NOWHERE", sys: 0, mounts: [], systems: [] }), core.frameOf({ frame: "GMS NOWHERE" }, cat), cat, { ll: 0 });
    if (missing.cap !== null) errs.push("an unresolvable frame must report a null cap rather than a number");
  }
  /* negative control: the record check must fire on wrong data, not just pass on right data */
  const victim = JSON.parse(JSON.stringify((C.mechs || []).find(m => (m.mounts || []).length) || {}));
  const uniqName = Object.keys(cat.systems).find(n => cat.systems[n].tg_unique);
  if (!uniqName) errs.push("loadout-check: no unique system in the catalogue to build the negative control from");
  else {
    victim.systems = [uniqName, uniqName];
    if (!recordProblems(victim).some(f => /duplicate unique/i.test(f))) errs.push("the record check must catch a duplicate unique item");
    const bad = JSON.parse(JSON.stringify(victim));
    bad.mounts[0] = { slot: "Main", weapons: [Object.keys(cat.weapons).find(n => cat.weapons[n].mount === "Heavy")] };
    if (!recordProblems(bad).some(f => /does not fit a Main seat/.test(f))) errs.push("the record check must catch a Heavy weapon in a Main seat");
  }
}


/* --- the page itself (design test 8): a fixture build through render.cjs's globals argument --- */
const loPage = path.join(ROOT, "loadout.html");
if (!fs.existsSync(loPage)) errs.push("loadout.html is missing (the #26 sandbox page)");
else {
  const { mount } = require("./render.cjs");
  const fixture = {
    mech: "tombstone",
    frame: "GMS Everest", /* the record's own frame string is uppercase and does not resolve */
    distance: 5,
    /* a Heavy weapon into a Main seat: the core must refuse it, beside that slot */
    place: [{ slotIndex: 0, seat: 0, weapon: "Thermal Lance" }]
  };
  const page = mount("loadout.html", "", { __LOADOUT_FIXTURE: fixture });
  const slots = page.html("lo-slots");
  if (!/WRONG MOUNT TYPE/.test(slots)) errs.push(`loadout.html must render the refusal beside the slot that caused it, got: ${slots.slice(0, 120)}`);
  if (!/Main/.test(slots)) errs.push("loadout.html must render the record's own slots");
  const sp = page.html("lo-sp");
  if (!/SP \d+ \/ \d+/.test(sp)) errs.push(`loadout.html must render the SP counter, got: ${sp.slice(0, 80)}`);

  /* the distance slider drives the readout: at 15 the Range 20 rifle still fires, the rest do not */
  const rng = mount("loadout.html", "#alba");
  const slider = rng.nodes["lo-dist"];
  if (!slider) errs.push("loadout.html needs a distance slider (id lo-dist) beside the readout");
  else {
    slider.value = "15";
    slider.fire("input");
    const readout = rng.html("lo-range");
    if (!/out of range/i.test(readout)) errs.push("the readout must follow the slider: nothing reported out of range at 15");
    if (!/in band/i.test(readout)) errs.push("the readout must keep the Range 20 rifle in band at 15");
  }
  /* by hand the GM drops a weapon and picks one back into the seat it leaves */
  const edit = mount("loadout.html", "#alba");
  const dropBtn = edit.nodes["lo-drop-0-0"];
  if (!dropBtn) errs.push("a placed weapon needs a remove control (lo-drop-<slot>-<seat>)");
  else {
    dropBtn.fire("click");
    if (/lo-wep">Missile Rack/.test(edit.html("lo-slots"))) errs.push("removing a weapon must take it out of the slot");
    const picker = edit.nodes["lo-pick-0-0"];
    if (!picker) errs.push("an empty seat needs a weapon picker (lo-pick-<slot>-<seat>)");
    else {
      picker.value = "Missile Rack";
      picker.fire("change");
      if (!/lo-wep">Missile Rack/.test(edit.html("lo-slots"))) errs.push("picking a weapon must place it in the seat");
    }
  }

  /* the thumbs crop from the top too, so the same focus has to reach the card, and only for records that set it */
  const cards = mount("campaign.html", "").html("mech-list");
  const cardOf = id => cards.split('data-mech="').find(x => x.startsWith(id + '"')) || "";
  if (!/object-position:\s*center 41%/.test(cardOf("alba")))
    errs.push("Alba's mech card thumb must use the record's imgFocus");
  if (/object-position/.test(cardOf("averna")))
    errs.push("only a record with imgFocus may override the thumb crop");

  /* the pilot pick resolves the record the licence gate reads, so it reaches the export as well */
  const C = (() => {
    const b = { window: {}, console, matchMedia: () => ({ matches: true }) };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, "campaign.js"), "utf8"), b, { filename: "campaign.js" });
    return b.window.CAMPAIGN;
  })();
  const who = mount("loadout.html", "#alba");
  const pilotPick = who.nodes["lo-pilot"];
  if (!pilotPick) errs.push("loadout.html needs a pilot pick (id lo-pilot)");
  else {
    const shown = (who.html("lo-pilot").match(/<option/g) || []).length;
    if (shown !== (C.pilots || []).length)
      errs.push(`the pilot pick must list every pilot, got ${shown} of ${(C.pilots || []).length}`);
    const alba = (C.mechs || []).filter(m => m.id === "alba")[0] || {};
    const other = (C.pilots || []).map(x => x.id).find(id => id !== alba.pilot);
    if (/data-/.test("")) errs.push("unreachable");
    if (who.html("lo-export").indexOf(other) >= 0)
      errs.push("loadout-check: Alba's export must not already name another pilot");
    pilotPick.value = other;
    pilotPick.fire("change");
    if (who.html("lo-export").indexOf(other) < 0)
      errs.push("picking another pilot must reach the export block");
  }

  /* seats come from the fitting table, not from how many weapons a mount holds: a Main/Aux mount
     carrying one weapon still reports two seats, so the emptied one keeps a picker of its own */
  const half = mount("loadout.html", "#averna");
  if (!half.nodes["lo-drop-0-0"] || !half.nodes["lo-drop-0-1"])
    errs.push("a Main/Aux mount needs a control at both seats");
  else {
    /* the core packs the list, so removing seat 0 leaves the mount's other weapon at seat 0 and the
       empty second seat still exists, because a Main/Aux mount has two seats whatever it holds */
    half.nodes["lo-drop-0-0"].fire("click");
    const after = half.html("lo-slots");
    if (!/id="lo-pick-0-1"/.test(after)) errs.push("a Main/Aux mount holding one weapon still reports two seats");
    if (!/id="lo-drop-0-0"/.test(after)) errs.push("the weapon left in a composite mount needs a control");
  }

  /* the frame pick is two-step where a change would drop mounted weapons: the candidate and a
     confirm control appear first, and setFrame runs only on the second click (design rev 11). */
  const CAT2 = (() => {
    const b = { window: {}, console, matchMedia: () => ({ matches: true }) };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, "catalogue.js"), "utf8"), b, { filename: "catalogue.js" });
    return b.window.CATALOGUE;
  })();
  const candidate = Object.keys(CAT2.frames).find(n => n !== "GMS Everest");
  const fr = mount("loadout.html", "#alba");
  const framePick = fr.nodes["lo-frame"];
  if (!framePick) errs.push("loadout.html needs a frame pick (id lo-frame)");
  else {
    const listed = (fr.html("lo-frame").match(/<option/g) || []).length;
    if (listed !== Object.keys(CAT2.frames).length)
      errs.push(`the frame pick must list every frame, got ${listed} of ${Object.keys(CAT2.frames).length}`);
    const before = fr.html("lo-export");
    framePick.value = candidate;
    framePick.fire("change");
    if (!fr.nodes["lo-frame-confirm"]) errs.push("a frame change that would drop weapons must ask first (id lo-frame-confirm)");
    if (fr.html("lo-export") !== before) errs.push("a frame change must not land on the first click");
    if (fr.nodes["lo-frame-confirm"]) fr.nodes["lo-frame-confirm"].fire("click");
    if (fr.html("lo-export") === before) errs.push("confirming the frame change must land it");
  }

  /* the stub scans the page for ids, so it must not read the page's own script source: a control
     built by concatenation would otherwise register a phantom node and a check would drive nothing */
  const phantoms = Object.keys(mount("loadout.html", "#alba").nodes).filter(k => /[^\w-]/.test(k));
  if (phantoms.length) errs.push(`the stub registered a phantom node from script source: ${phantoms.join(", ")}`);

  /* with nothing mounted there is nothing to drop, so one click is enough */
  const bare = mount("loadout.html", "#averna");
  /* ids come from the current markup, because the stub's node map keeps every id it has ever seen,
     so a stale control would be driven and refuse against markup that no longer has it */
  const liveDrops = () => (bare.html("lo-slots").match(/id="lo-drop-\d+-\d+"/g) || []).map(x => x.slice(4, -1));
  for (let n = 0; n < 8 && liveDrops().length; n++) bare.nodes[liveDrops()[0]].fire("click");
  const bareBefore = bare.html("lo-export");
  if (bare.nodes["lo-frame"]) {
    bare.nodes["lo-frame"].value = candidate;
    bare.nodes["lo-frame"].fire("change");
    if (bare.nodes["lo-frame-confirm"]) errs.push("an empty mech must not be asked to confirm a frame change");
    if (bare.html("lo-export") === bareBefore) errs.push("with nothing mounted a frame change must land on one click");
  }

  /* a tall art file in a wide hero band shows a thin slice, so a record can aim it at the head */
  const hero = mount("mech.html", "#alba").html("dossier");
  if (!/object-position:\s*center 41%/.test(hero)) errs.push("Alba's hero must focus the head and chest, not the rifle");
  const plainHero = mount("mech.html", "#tombstone").html("dossier");
  if (/object-position/.test(plainHero)) errs.push("only a record with imgFocus may override the hero crop");

  /* the checklist seeds the record's printed systems as names, ticks one, and puts it back */
  const sysPage = mount("loadout.html", "#averna");
  const beforeSys = sysPage.html("lo-export");
  if (!/systems&quot;:\[/.test(beforeSys)) errs.push("the page must hand the core a systems list, not the record's printed string");
  const box = sysPage.nodes["lo-sys-0"];
  if (!box) errs.push("loadout.html needs a systems checklist (id lo-sys-<index>)");
  else {
    box.checked = true; box.fire("change");
    const ticked = sysPage.html("lo-export");
    if (ticked === beforeSys) errs.push("ticking a system must reach the build and the export");
    const boxAgain = sysPage.nodes["lo-sys-0"];
    if (!boxAgain) errs.push("the checklist must survive its own re-render");
    else {
      boxAgain.checked = false; boxAgain.fire("change");
      if (sysPage.html("lo-export") !== beforeSys) errs.push("unticking must put the build back");
    }
  }

  /* the export block is the one thing the GM pastes back, so it has to carry the record's own plan */
  const expo = mount("loadout.html", "#alba").html("lo-export");
  if (!/LOADOUT/.test(expo)) errs.push("loadout.html must render the pasteable LOADOUT block in lo-export");
  if (!/Missile Rack/.test(expo)) errs.push("the exported block must carry the record's own weapons");

  /* with a frame the catalogue does not hold, the cap must read unknown rather than 0 */
  const unknownFrame = mount("loadout.html", "", { __LOADOUT_FIXTURE: { mech: "tombstone", frame: "GMS NOPE", place: [] } }).html("lo-sp");
  if (!/SP \d+ \/ \?/.test(unknownFrame)) errs.push(`an unresolved frame must show an unknown cap, got: ${unknownFrame.slice(0, 80)}`);
  if (!/in band|out of range|out of band/.test(page.html("lo-range"))) errs.push("loadout.html must render the range readout");
  if (!/tombstone/.test(page.html("lo-export"))) errs.push("loadout.html must render the export block for the fixture's mech");
}
/* every page's shell has to link to it, since navPages asserts one direction only */
for (const f of fs.readdirSync(ROOT).filter(f => f.endsWith(".html"))) {
  const src = fs.readFileSync(path.join(ROOT, f), "utf8");
  if (!/href="loadout\.html"/.test(src)) errs.push(`${f}: the shell must link to loadout.html`);
}

if (errs.length) { console.error("loadout: " + errs.length + " problem(s)\n - " + errs.join("\n - ")); process.exit(1); }
console.log("loadout ok: catalogue resolves and its gate is current");
