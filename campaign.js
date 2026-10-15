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
      triggers: "Charm (+2), Spot (+2), Survive (+2), Take Someone Out (+2)",
      talents: "Gunslinger 1, Vanguard 1, Skirmisher 1",
      gear: "Mobility Hardsuit, Heavy Signature, Medium Signature, Wilderness Survival Kit, Antiphoton Visor, Smart Scope" },
    { id: "sten", name: "STEN “HAMMER” VARGSKEL", background: "PILOT · LL0 · MECHANIC", status: "ACTIVE", mech: "skaldr",
      triggers: "Assault (+2), Hack or Fix (+2), Survive (+2), Threaten (+2)",
      talents: "Bonded 1, Grease Monkey 1, Ace 1",
      gear: "Heavy Hardsuit, Heavy A/C, Light Signature, Tertiary Arm, Corrective, Dataplating" },
    { id: "guillaume", name: "GUILLAUME “TIZONA” ARAGONEAU", background: "PILOT · LL0 · COLONIST", status: "ACTIVE", mech: "xxxg-01h",
      triggers: "Act Unseen or Unheard (+2), Survive (+2), Take Someone Out (+2), Word on the Street (+2)",
      gear: "Light Hardsuit, Light Signature, Light A/C, Extra Rations, Sleeping Bag, Wilderness Survival Kit",
      talents: "Heavy Gunner 1, Spaceborn 1, House Guard 1" },
    { id: "danila", name: "DANILA “SCOOTER” HOWTER-BOWDEN", background: "PILOT · LL0 · WORKER", status: "ACTIVE", mech: "scooteroo", img: "assets/scooter.png",
      triggers: "Blow Something Up (+2), Invent or Create (+2), Spot (+2), Stay Cool (+2)",
      gear: "Heavy Hardsuit, Heavy A/C, Light Signature, Sound System, Tertiary Arm, Extra Rations",
      talents: "Siege Specialist 1, Grease Monkey 1, Walking Armory 1" },
    { id: "tbh-4", name: "TBH", background: "PILOT · TO BE HIRED", status: "OPEN SLOT", mech: "tbh-4-mech" },
  ],

  mechs: [
    { id: "sweet-cheeks", name: "SWEET CHEEKS", frame: "GMS CHOMOLUNGMA", pilot: "frisky", role: "ECM & C3", glyph: "◢▰◣", img: "assets/sweet-cheeks.png",
      state: "OPERATIONAL", hp: 12, eva: 8, spd: 4, tech: "+3", edef: 12,
      loadout: "Main/Aux: Nexus (Hunter-Killer) / Nexus (Light) · Flex: Missile Rack / Missile Rack",
      systems: "Personalizations, Turret Drones, Type-I Flight System, Type-3 Projected Shield" },
    { id: "tombstone", name: "TOMBSTONE", frame: "GMS EVEREST", pilot: "dusty", role: "FIRE SUPPORT & BOARDING", glyph: "▰▱", img: "assets/tombstone.png",
      state: "OPERATIONAL", size: 1, hp: 10, structure: 4, stress: 4, armor: 0, repair: 5, heat: 6,
      hull: 0, agi: 2, sys: 0, eng: 0, eva: 10, spd: 5, tech: "+0", edef: 8, sens: 10, save: 10, attackBonus: 0, limitedBonus: 0,
      loadout: "Main: Pistol · Flex: Charged Blade · Heavy: Thermal Lance",
      systems: "Pattern-A Jericho Deployable Cover, COMP/CON-Class Assistant Unit, EVA Module, Expanded Compartment" },
    { id: "xxxg-01h", name: "XXXG-01H", frame: "GMS SAGARMATHA", pilot: "guillaume", role: "UNASSIGNED", glyph: "▰", state: "OPERATIONAL", size: 2,
      hull: 2, agi: 0, sys: 0, eng: 0, structure: 4, hp: 14, armor: 1, stress: 4, heat: 6, repair: 5,
      attackBonus: 0, tech: "+0", limitedBonus: 0, spd: 4, eva: 8, edef: 8, sens: 10, save: 10,
      loadout: "Main: Charged Blade · Flex: Missile Rack / Missile Rack · Heavy: Heavy Machine Gun",
      systems: "Spaceborn EVA, Custom Paint Job, Pattern-A Smoke Charges, Stable Structure, Personalizations" },
    { id: "scooteroo", name: "SCOOTEROO", frame: "GMS EVEREST", pilot: "danila", role: "UNASSIGNED", glyph: "▰", img: "assets/scooteroo.png", state: "OPERATIONAL", size: 1,
      hull: 2, agi: 0, sys: 0, eng: 0, structure: 4, hp: 14, armor: 0, stress: 4, heat: 6, repair: 6,
      attackBonus: 0, tech: "+0", limitedBonus: 0, spd: 4, eva: 8, edef: 8, sens: 10, save: 10,
      loadout: "Main: Shotgun · Flex: Rocket-Propelled Grenade · Heavy: Howitzer",
      systems: "Ammo Case I, Type-3 Projected Shield, Manipulators, Stable Structure, EVA Module" },
    { id: "skaldr", name: "SKALDR", frame: "GMS EVEREST", pilot: "sten", role: "UNASSIGNED", glyph: "▰", state: "OPERATIONAL", size: 1,
      hull: 2, agi: 0, sys: 0, eng: 0, hp: 16, structure: 4, stress: 4, armor: 0, heat: 6, repair: 6,
      attackBonus: 0, tech: "+0", limitedBonus: 0, spd: 4, eva: 8, edef: 8, sens: 10, save: 10,
      loadout: "Main: Tactical Melee Weapon · Flex: Nexus (Hunter-Killer) · Heavy: Heavy Machine Gun",
      systems: "Stable Structure, Type-3 Projected Shield, Expanded Compartment, Personalizations" },
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