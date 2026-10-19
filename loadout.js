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
    const over = spCheck(build, catalogue.frames[build.frame], catalogue, pilot);
    if (!over.ok) return { ok: false, reason: "OVER SP CAP" };
    const withIt = clone(build);
    withIt.mounts[slotIndex].weapons[seat] = weapon;
    const after = spCheck(withIt, catalogue.frames[build.frame], catalogue, pilot);
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

  /* Removing the Superheavy clears the lock it took, since the lock means nothing without it. */
  function unplace(build, slotIndex, seat, catalogue) {
    const next = clone(build);
    const removed = (next.mounts[slotIndex].weapons || [])[seat];
    next.mounts[slotIndex].weapons = (next.mounts[slotIndex].weapons || []).filter((_, i) => i !== seat);
    const w = removed && catalogue && catalogue.weapons[removed];
    if (w && w.mount === "Superheavy") for (const m of next.mounts) if (m.locked) { m.locked = false; break; }
    return next;
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
    const chk = spCheck(next, catalogue.frames[next.frame], catalogue, pilot);
    if (!chk.ok) return { ok: false, reason: "OVER SP CAP" };
    return { ok: true, reason: null, build: next };
  }

  const api = { spCheck, canMount, place, unplace, setFrame, setSystems, seats, licenceOk };
  global.LOADOUT = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
