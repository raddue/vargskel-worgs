/* Loadout core for the mechbay (issue #26): pure questions about a build, plus the two builders.
   A build is { mech, frame, pilot, sys, mounts, systems }: `mech` is the record id, `pilot` is the
   record id whose object the caller resolves (licences and LL live there), `sys` is the record's
   system-point allowance, `mounts` is [{ slot, weapons: [], locked? }] in the frame's printed slot
   order, and `systems` is a list of names. Nothing here reads the DOM, so it loads in the browser
   like campaign.js and is require()-able for tests. */
(function (global) {
  /* Composite printed slots, seat by seat. Each seat's allowed sizes come from rules.json's
     mount_fittings, so the table stays the single source: Flex's seats are Main-sized (which
     includes Auxiliary), Main/Aux is one Main-sized seat plus an Auxiliary one, Aux/Aux is two. */
  const SEAT_RULES = { "Main/Aux": ["Main", "Auxiliary"], "Aux/Aux": ["Auxiliary", "Auxiliary"], Flex: ["Main", "Main"] };
  const clone = b => JSON.parse(JSON.stringify(b));
  const seats = (slot, fittings) => {
    const f = fittings || {};
    if (SEAT_RULES[slot]) return SEAT_RULES[slot].map(k => f[k] || []);
    return [f[slot] || []];
  };
  /* GMS is granted by rule rather than by a licence book, so it is always allowed. */
  const licenceOk = (pilot, w) => {
    if (!w.license || w.license === "GMS") return true;
    const lv = w.license_level == null ? 0 : w.license_level;
    return ((pilot && pilot.licences) || []).some(l => l.name === w.license && (l.rank || 0) >= lv);
  };
  const held = build => {
    const names = [];
    for (const m of build.mounts || []) for (const n of m.weapons || []) if (n) names.push(n);
    return names.concat(build.systems || []);
  };

  /* Cap = frame.stats.sp + floor(mech.sys / 2) + ceil(pilot.ll / 2). Spend counts systems and the
     weapons that carry an sp cost. A frame the data does not hold has no cap at all, so nothing
     can be refused for going over one. */
  function spCheck(build, frame, catalogue, pilot) {
    const unknown = []; let spend = 0;
    for (const n of build.systems || []) {
      const s = catalogue.systems[n];
      if (!s) { unknown.push(n); continue; }
      spend += s.sp || 0;
    }
    for (const m of build.mounts || []) for (const n of m.weapons || []) {
      if (!n) continue;
      const w = catalogue.weapons[n];
      if (!w) { unknown.push(n); continue; }
      spend += w.sp || 0;
    }
    if (!frame || typeof frame.sys !== "number") return { ok: true, reason: null, cap: null, spend, unknown };
    const cap = frame.sys + Math.floor((build.sys || 0) / 2) + Math.ceil(((pilot && pilot.ll) || 0) / 2);
    return { ok: spend <= cap, reason: spend <= cap ? null : "OVER SP CAP", cap, spend, unknown };
  }

  /* The pure question: would this placement be legal? It never mutates the build, so a decision can
     be asked about without being obeyed. */
  function canMount(pilot, build, slotIndex, seat, weapon, catalogue, opts) {
    const o = opts || {};
    const w = catalogue.weapons[weapon];
    if (!w) return { ok: false, reason: "UNKNOWN WEAPON" };
    if (!licenceOk(pilot, w)) return { ok: false, reason: "UNLICENSED" };
    const mount = (build.mounts || [])[slotIndex];
    if (!mount) return { ok: false, reason: "SLOT FULL" };
    if (mount.locked) return { ok: false, reason: "SLOT LOCKED" };
    if (w.mount === "Superheavy") {
      if (mount.slot !== "Heavy") return { ok: false, reason: "WRONG MOUNT TYPE" };
      if (o.lockSlot == null) return { ok: false, reason: "NEEDS SECOND MOUNT" };
      if (o.lockSlot === slotIndex) return { ok: false, reason: "SLOT FULL" };
      const other = build.mounts[o.lockSlot];
      if (!other) return { ok: false, reason: "SLOT FULL" };
      if (other.locked) return { ok: false, reason: "SLOT LOCKED" };
      if ((other.weapons || []).length) return { ok: false, reason: "SLOT FULL" };
    } else if (!seats(mount.slot, catalogue.fittings)[seat].includes(w.mount)) {
      return { ok: false, reason: "WRONG MOUNT TYPE" };
    }
    if ((mount.weapons || [])[seat]) return { ok: false, reason: "SLOT FULL" };
    const had = held(build);
    const unique = n => { const x = catalogue.weapons[n] || catalogue.systems[n] || {}; return x.mount !== undefined
      ? (catalogue.weapons[n].tags || []).some(t => t.id === "tg_unique")
      : (catalogue.systems[n] || {}).tg_unique; };
    const isAI = n => (catalogue.weapons[n] && (catalogue.weapons[n].tags || []).some(t => t.id === "tg_ai")) || (catalogue.systems[n] || {}).tg_ai;
    if (unique(weapon) && had.some(n => n === weapon || unique(n))) return { ok: false, reason: "DUPLICATE UNIQUE ITEM" };
    if (isAI(weapon) && had.some(isAI)) return { ok: false, reason: "AI LIMIT" };
    const over = spCheck(build, frameOf(build, catalogue), catalogue, pilot);
    if (!over.ok) return { ok: false, reason: "OVER SP CAP" };
    const withIt = clone(build);
    withIt.mounts[slotIndex].weapons[seat] = weapon;
    const after = spCheck(withIt, frameOf(withIt, catalogue), catalogue, pilot);
    if (!after.ok) return { ok: false, reason: "OVER SP CAP" };
    return { ok: true, reason: null };
  }

  function place(pilot, build, slotIndex, seat, weapon, catalogue, opts) {
    const o = opts || {};
    const v = canMount(pilot, build, slotIndex, seat, weapon, catalogue, o);
    if (!v.ok) return v;
    const next = clone(build);
    next.mounts[slotIndex].weapons[seat] = weapon;
    if (catalogue.weapons[weapon].mount === "Superheavy" && o.lockSlot != null) {
      next.mounts[o.lockSlot].locked = true;
      next.mounts[o.lockSlot].weapons = [];
    }
    return { ok: true, reason: null, build: next };
  }

  /* Removing the Superheavy clears the lock it took, since the lock means nothing without it.
     It answers like place, because a decision that cannot say why it refused cannot be asked
     without being obeyed: a mount that does not exist, a seat with nothing at it and a locked
     mount are refusals, not throws and not a silent no-op. */
  function unplace(build, slotIndex, seat, catalogue) {
    const mount = (build.mounts || [])[slotIndex];
    if (!mount) return { ok: false, reason: "EMPTY SEAT" };
    if (mount.locked) return { ok: false, reason: "SLOT LOCKED" };
    const removed = (mount.weapons || [])[seat];
    if (!removed) return { ok: false, reason: "EMPTY SEAT" };
    const next = clone(build);
    next.mounts[slotIndex].weapons = (mount.weapons || []).filter((_, i) => i !== seat);
    const w = catalogue && catalogue.weapons[removed];
    if (w && w.mount === "Superheavy") for (const m of next.mounts) if (m.locked) { m.locked = false; break; }
    return { ok: true, reason: null, build: next };
  }

  /* mounts come from the frame, so a frame change resets them rather than keeping another frame's. */
  function setFrame(build, frame, catalogue, pilot) {
    const f = catalogue.frames[frame];
    if (!f) return { ok: false, reason: "UNKNOWN FRAME LICENCE" };
    const lv = f.license_level == null ? 0 : f.license_level;
    if (f.license && f.license !== "GMS" && !((pilot && pilot.licences) || []).some(l => l.name === f.license && (l.rank || 0) >= lv))
      return { ok: false, reason: "UNLICENSED" };
    const next = clone(build);
    next.frame = frame;
    next.mounts = (f.mounts || []).map(slot => ({ slot, weapons: [] }));
    return { ok: true, reason: null, build: next };
  }

  function setSystems(build, systems, catalogue, pilot) {
    const next = clone(build);
    next.systems = systems.slice();
    const names = systems;
    const uniq = names.find((n, i) => (catalogue.systems[n] || {}).tg_unique && names.indexOf(n) !== i);
    if (uniq) return { ok: false, reason: "DUPLICATE UNIQUE ITEM" };
    if (names.filter(n => (catalogue.systems[n] || {}).tg_ai).length > 1) return { ok: false, reason: "AI LIMIT" };
    const chk = spCheck(next, frameOf(next, catalogue), catalogue, pilot);
    if (!chk.ok) return { ok: false, reason: "OVER SP CAP" };
    return { ok: true, reason: null, build: next };
  }


  /* A record spells its frame its own way ("GMS EVEREST") while the catalogue holds the data's own
     ("GMS" + "Everest"), so both the cap and the slot list must resolve by normalised name. Reading
     catalogue.frames[build.frame] directly would silently drop the cap for every real record. */
  const normName = x => String(x || "").toLowerCase().replace(/[^a-z0-9]/g, "");
  function frameOf(build, catalogue) {
    const want = String((build && build.frame) || "");
    const frames = (catalogue && catalogue.frames) || {};
    if (frames[want]) return frames[want];
    return Object.values(frames).find(f => f && (normName(f.name) === normName(want) || normName(`${f.source || ""} ${f.name}`) === normName(want))) || null;
  }

  /* Accuracy stays two fields: the flat number the record carries, and the weapon's own d6 from its
     tags. LANCER adds or removes a d6, so summing them would report a roll that cannot happen. */
  function accuracyOf(build, w) {
    const ids = (w.tags || []).map(t => t.id);
    const dice = ids.includes("tg_accurate") ? 1 : ids.includes("tg_inaccurate") ? -1 : 0;
    return { attackBonus: (build && build.attackBonus) || 0, dice,
      tags: ids.filter(id => id === "tg_accurate" || id === "tg_inaccurate") };
  }

  /* One profile, read at one distance. A gate is any numeric band that is not Blast, because Blast
     reaches past its band instead of being a band of its own: the centre must sit inside the band,
     and the blast covers up to N further, which is the third state. A band value that is not a
     number (`Charge Rail: 4` carries "N/A") is shown as it stands and never gates. */
  function readProfile(p, distance) {
    const bands = p.bands || [];
    const odd = bands.filter(b => typeof b.value !== "number");
    const numeric = bands.filter(b => typeof b.value === "number");
    const gate = numeric.filter(b => b.kind !== "Blast");
    const blast = numeric.filter(b => b.kind === "Blast");
    const reaches = gate.filter(b => b.value >= distance);
    const widest = blast.length ? Math.max.apply(null, blast.map(b => b.value)) : 0;
    const inBlast = !reaches.length && !!blast.length && gate.some(b => b.value + widest >= distance);
    const pattern = gate.some(b => b.kind === "Cone" || b.kind === "Line");
    return { name: p.name || null, bands,
      canFire: !!reaches.length || inBlast,
      state: reaches.length ? "in band" : inBlast ? "out of band, in blast" : "out of range",
      pattern,
      note: odd.length ? "band shown as-is: " + odd.map(b => b.kind + " " + b.value).join(", ") : null };
  }

  /* Per mounted weapon, per profile, so alternate fire modes are not blended into one band list. */
  function rangeReadout(build, distance, catalogue) {
    const out = [];
    for (const m of build.mounts || []) for (const n of m.weapons || []) {
      if (!n) continue;
      const w = catalogue.weapons[n];
      if (!w) { out.push({ weapon: n, slot: m.slot, accuracy: null, profiles: [], unknown: true }); continue; }
      const own = (w.profiles && w.profiles.length) ? w.profiles : [{ name: null, bands: w.bands || [], tags: w.tags || [] }];
      out.push({ weapon: n, slot: m.slot, accuracy: accuracyOf(build, w), profiles: own.map(p => readProfile(p, distance)) });
    }
    return out;
  }


  /* The exported build as a pasteable block: a heading that names the mech, then one line of JSON.
     JSON and not the site's writer style, because the other end parses it with JSON.parse and never
     with eval. `sys` stays out: it is the record's allowance, not the build the page edits. Empty
     seats are kept as null so a seat index survives the trip, and trailing ones are dropped. */
  function exportLoadout(build) {
    const mounts = (build.mounts || []).map(m => {
      const weapons = (m.weapons || []).map(w => w || null);
      while (weapons.length && weapons[weapons.length - 1] === null) weapons.pop();
      const out = { slot: m.slot, weapons };
      if (m.locked) out.locked = true;
      return out;
    });
    const out = { mech: build.mech, frame: build.frame, pilot: build.pilot, mounts, systems: (build.systems || []).slice() };
    return "LOADOUT " + out.mech + "\n" + JSON.stringify(out) + "\n";
  }

  const api = { spCheck, canMount, place, unplace, setFrame, setSystems, rangeReadout, exportLoadout, seats, licenceOk, frameOf };
  global.LOADOUT = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
