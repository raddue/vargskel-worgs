/* Campaign record for Vargskel Worgs.
   This is the only file the GM edits. Loaded by index.html with a plain
   <script src>, so the archive also opens straight from disk (file://).
   Records reference each other by id: ops.crew -> pilots, ops.mechs -> mechs,
   ops.loc -> locations, ops.client -> factions, threads.op -> ops.
   Run `node check-all.cjs` after editing: it fails on any id that does not resolve. */
window.CAMPAIGN = {
  meta: {
    unit: "VW-01",
    name: "VARGSKEL WORGS",
    tagline: "Operational record of contracts, deployments, and assigned personnel.",
    updated: "5016U · D071"
  },

  locations: [
    { id: "dock",   name: "DOCK / FOB",  kind: "STATION",     x: 12, y: 62, visited: true },
    { id: "elysia", name: "NOV ELYSIA",  kind: "PLANET",      x: 38, y: 44, visited: false, faction: "vestan" },
    { id: "pell",   name: "PELL",        kind: "MOON", parent: "elysia", x: 45, y: 34, visited: false },
    { id: "kessen", name: "KESSEN RELAY", kind: "STATION",    x: 60, y: 68, visited: false, faction: "leandric" },
    { id: "harrow", name: "HARROW'S GATE", kind: "STATION",   x: 74, y: 36, visited: false },
    { id: "cairn",  name: "CAIRN DRIFT", kind: "WRECK FIELD", x: 86, y: 64, visited: false, faction: "union" },
    { id: "tarn",   name: "TARN",        kind: "PLANET",      x: 92, y: 22, visited: false }
  ],

  factions: [
    { id: "vestan",   name: "Vestan Civic Council",     standing: "NEUTRAL", zone: { x: 38, y: 44, rx: 170, ry: 115, c: "cyan" } },
    { id: "leandric", name: "Leandric States Alliance", standing: "UNKNOWN", zone: { x: 60, y: 68, rx: 120, ry: 80,  c: "lime" } },
    { id: "union",    name: "Union Delegation",         standing: "UNKNOWN", zone: { x: 86, y: 64, rx: 100, ry: 90,  c: "rust" } }
  ],

  pilots: [
    { id: "frisky", name: "RURIK VARGSKEL", background: "PILOT · LL0 · FIXER", status: "ACTIVE", mech: "sweet-cheeks", img: "assets/rurik_vargskel.png",
      triggers: "Act Unseen or Unheard, Get a Hold of Something, Hack or Fix, Lead or Inspire",
      talents: "Hacker 1, Leader 1, Spotter 1",
      gear: "Assault Hardsuit, Medium Signature, Light Signature, Dataplating, Omnihook, Personal Drone" },
    { id: "dusty",  name: "HANSEN “DUSTY” MCGRAW", background: "PILOT · LL0 · OUTLAW", status: "ACTIVE", mech: "tombstone", img: "assets/dusty.png",
      triggers: "Charm, Spot, Survive, Take Someone Out",
      talents: "Bonded I, Gunslinger I, Vanguard I",
      gear: "Mobility Hardsuit, heavy and medium signature weapons, Wilderness Survival Kit, Antiphoton Visor, Smart Scope" },
    { id: "sten", name: "STEN VARGSKEL", background: "PILOT · MECHANIC", status: "ACTIVE" },
    { id: "tbh-2", name: "TBH", background: "PILOT · TO BE HIRED", status: "OPEN SLOT", mech: "tbh-2-mech" },
    { id: "tbh-3", name: "TBH", background: "PILOT · TO BE HIRED", status: "OPEN SLOT", mech: "tbh-3-mech" },
    { id: "tbh-4", name: "TBH", background: "PILOT · TO BE HIRED", status: "OPEN SLOT", mech: "tbh-4-mech" },
  ],

  mechs: [
    { id: "sweet-cheeks", name: "SWEET CHEEKS", frame: "GMS CHOMOLUNGMA", pilot: "frisky", role: "ECM & C3", glyph: "◢▰◣", img: "assets/sweet-cheeks.png",
      state: "OPERATIONAL", hp: 12, eva: 8, spd: 4, tech: "+3", edef: 12,
      loadout: "Main/Aux: Nexus (Hunter-Killer) / Nexus (Light) · Flex: Missile Rack / Missile Rack",
      systems: "Personalizations, Turret Drones, Type-I Flight System, Type-3 Projected Shield" },
    { id: "tombstone", name: "TOMBSTONE", frame: "GMS EVEREST", pilot: "dusty", role: "FIRE SUPPORT & BOARDING", glyph: "▰▱", img: "assets/tombstone.png",
      state: "OPERATIONAL", hp: 10, structure: 4, stress: 4, armor: 0, repair: 5, heat: 6,
      hull: 0, agi: 2, sys: 0, eng: 0, eva: 10, spd: 5, tech: "+0", edef: 8, sens: 10, save: 10, attackBonus: 0, limitedBonus: 0,
      loadout: "Main: Pistol · Flex: Shotgun · Heavy: Thermal Lance",
      systems: "Pattern-A Jericho Deployable Cover, Comp/Con-Class Assistant Unit, EVA Module, Expanded Compartment" },
    { id: "tbh-2-mech", name: "TBH", frame: "UNASSIGNED", pilot: "tbh-2", role: "TBD", glyph: "?", state: "NOT ASSIGNED" },
    { id: "tbh-3-mech", name: "TBH", frame: "UNASSIGNED", pilot: "tbh-3", role: "TBD", glyph: "?", state: "NOT ASSIGNED" },
    { id: "tbh-4-mech", name: "TBH", frame: "UNASSIGNED", pilot: "tbh-4", role: "TBD", glyph: "?", state: "NOT ASSIGNED" }
  ],

  ops: [
    { id: "001", title: "SOLSTICE RAIN", type: "PLANNED", loc: "elysia", client: null, status: "UNBRIEFED",
      date: "5016U · D---", crew: [], mechs: [], rounds: null,
      summary: "Union-backed peace talks on Cressidium collapsed into open war. The Worgs deploy with the UNS Rio Grande to Nov Elysia, a city under Vestan siege.",
      mission: { title: "M1 · THE DROP", href: "solstice-rain.html" },
      outcome: "Campaign starting. First drop: Nov Elysia." }
  ],

  threads: [],

  events: []
};