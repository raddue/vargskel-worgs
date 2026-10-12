/* Campaign record for Granite Security Solutions.
   This is the only file the GM edits. Loaded by index.html with a plain
   <script src>, so the archive also opens straight from disk (file://).
   Records reference each other by id: ops.crew -> pilots, ops.mechs -> mechs,
   ops.loc -> locations, ops.client -> factions, threads.op -> ops.
   Run `node check-all.cjs` after editing: it fails on any id that does not resolve.
   SAMPLE DATA: every name, date and number below is a placeholder. */
window.CAMPAIGN = {
  meta: {
    unit: "GSS-01",
    name: "GRANITE SECURITY SOLUTIONS",
    tagline: "Operational record of contracts, deployments, and assigned personnel.",
    updated: "5016U · D071"
  },

  locations: [
    { id: "dock",   name: "DOCK / FOB",  kind: "STATION",     x: 12, y: 62, visited: true },
    { id: "elysia", name: "NOV ELYSIA",  kind: "PLANET",      x: 38, y: 44, visited: true, faction: "vestan" },
    { id: "pell",   name: "PELL",        kind: "MOON", parent: "elysia", x: 45, y: 34, visited: true },
    { id: "kessen", name: "KESSEN RELAY", kind: "STATION",    x: 60, y: 68, visited: true, faction: "leandric" },
    { id: "harrow", name: "HARROW'S GATE", kind: "STATION",   x: 74, y: 36, visited: true },
    { id: "cairn",  name: "CAIRN DRIFT", kind: "WRECK FIELD", x: 86, y: 64, visited: true, faction: "union" },
    { id: "tarn",   name: "TARN",        kind: "PLANET",      x: 92, y: 22, visited: false }
  ],

  factions: [
    { id: "vestan",   name: "Vestan Civic Council",     standing: "NEUTRAL", zone: { x: 38, y: 44, rx: 170, ry: 115, c: "cyan" } },
    { id: "leandric", name: "Leandric States Alliance", standing: "UNKNOWN", zone: { x: 60, y: 68, rx: 120, ry: 80,  c: "lime" } },
    { id: "union",    name: "Union Delegation",         standing: "UNKNOWN", zone: { x: 86, y: 64, rx: 100, ry: 90,  c: "rust" } }
  ],

  pilots: [
    { id: "frisky", name: "HUGH “FRISKY” JANUS", role: "PILOT · LL0 · HACKER", status: "ACTIVE", mech: "sweet-cheeks",
      triggers: "Act Unseen or Unheard, Get a Hold of Something, Hack or Fix, Lead or Inspire",
      talents: "Hacker 1, Leader 1, Spotter 1",
      gear: "Assault Hardsuit, Medium Signature, Light Signature, Dataplating, Omnihook, Personal Drone" },
    { id: "patch",  name: "MARA “PATCH” VENN",   role: "PILOT · LL0 · FIELD MECHANIC", status: "ACTIVE", mech: "patch-kit" },
    { id: "dusty",  name: "HANSEN “DUSTY” MCGRAW", role: "PILOT · LL0 · OUTLAW", status: "ACTIVE", mech: "tombstone",
      triggers: "Charm, Spot, Survive, Take Someone Out",
      talents: "Bonded I, Gunslinger I, Vanguard I",
      gear: "Mobility Hardsuit, heavy and medium signature weapons, Wilderness Survival Kit, Antiphoton Visor, Smart Scope" },
    { id: "latch",  name: "IDO “LATCH” KESTREL", role: "PILOT · LL0 · RECON / SCOUT", status: "ACTIVE", mech: "latchkey" },
    { id: "wren",   name: "SERA “WREN” QUILL",   role: "PILOT · LL0 · SIGNALS / COMMS", status: "ACTIVE" },
    { id: "bulwark", name: "DEV “BULWARK” ARROYO", role: "PILOT · LL0 · SECURITY / HEAVY SUPPORT", status: "ACTIVE", mech: "doorstop" }
  ],

  mechs: [
    { id: "sweet-cheeks", name: "SWEET CHEEKS", frame: "GMS CHOMOLUNGMA", pilot: "frisky", glyph: "◢▰◣",
      state: "OPERATIONAL", hp: 12, eva: 8, spd: 4, tech: "+3", edef: 12,
      loadout: "Main/Aux: Nexus (Hunter-Killer) / Nexus (Light) · Flex: Missile Rack / Missile Rack",
      systems: "Personalizations, Turret Drones, Type-I Flight System, Type-3 Projected Shield" },
    { id: "patch-kit", name: "PATCH KIT", frame: "GMS EVEREST", pilot: "patch", glyph: "▰◢",
      state: "STRUCTURE 1 · REPAIR PENDING", missing: "REPAIR PLATFORM" },
    { id: "tombstone", name: "TOMBSTONE", frame: "GMS EVEREST", pilot: "dusty", glyph: "▰▱",
      state: "OPERATIONAL", hp: 6, eva: 10, spd: 5, tech: "+0", edef: 8,
      loadout: "Main: Pistol · Flex: Shotgun · Heavy: Thermal Lance",
      systems: "Jericho Deployable Cover, Comp/Con-Class Assistant Unit, EVA Module, Expanded Compartment" },
    { id: "latchkey", name: "LATCHKEY", frame: "SSC BLACK WITCH", pilot: "latch", glyph: "◈▰",
      state: "OPERATIONAL", missing: "FIELD CONTROL" },
    { id: "doorstop", name: "DOORSTOP", frame: "GMS DRAKE", pilot: "bulwark", glyph: "▰▱",
      state: "OPERATIONAL", missing: "DEFENDER" }
  ],

  ops: [
    { id: "006", title: "NO BRIEF", type: "PLANNED", loc: "tarn", client: null, status: "UNBRIEFED",
      date: "5016U · D---", crew: [], mechs: [], rounds: null,
      outcome: "Awaiting contract. Last known heading: Tarn, unvisited." },
    { id: "005", title: "DEAD RECKONING", type: "MECH BATTLE", loc: "cairn", client: "union", status: "PARTIAL",
      date: "5016U · D071", crew: ["frisky", "latch", "patch"], mechs: ["sweet-cheeks", "latchkey", "patch-kit"], rounds: 6,
      outcome: "Salvage half recovered; withdrew under fire. Patch Kit took 1 Structure." },
    { id: "004", title: "LOW RING, LAST CALL", type: "STREET SHOOTOUT", loc: "harrow", client: null, status: "EXFIL, WOUNDED",
      date: "5016U · D058", crew: ["frisky", "dusty", "latch"], mechs: [], rounds: 3,
      outcome: "On foot in hardsuits. Informant killed; crew extracted through market. Dusty wounded." },
    { id: "003", title: "COLD START AT PELL", type: "MECH BATTLE", loc: "pell", client: "vestan", status: "COMPLETED",
      date: "5016U · D044", crew: ["frisky", "dusty", "latch", "bulwark"],
      mechs: ["sweet-cheeks", "tombstone", "latchkey", "doorstop"], rounds: 5,
      outcome: "Relay garrison cleared. Tombstone took 1 Structure; repaired on station." },
    { id: "002", title: "TERMS OF PASSAGE", type: "NEGOTIATION", loc: "kessen", client: "leandric", status: "COMPLETED",
      date: "5016U · D019", crew: ["frisky", "wren", "bulwark"], mechs: [], rounds: null,
      outcome: "Passage rights secured. Granite owes the Alliance one favor." },
    { id: "001", title: "THE QUIET EXCHANGE", type: "CONTRACT", loc: "elysia", client: "vestan", status: "COMPLETED",
      date: "5016U · SAMPLE DATE", crew: ["frisky"], mechs: ["sweet-cheeks"], rounds: null,
      outcome: "Courier and wafer recovered; depot workers evacuated. Transfer logs retained." }
  ],

  threads: [
    { id: "t1", text: "Who wanted the data wafer?", op: "001", status: "OPEN" },
    { id: "t2", text: "Transfer logs retained", op: "001", status: "OPEN" },
    { id: "t3", text: "Depot security sealed the exits — noticed Granite?", op: "001", status: "ESCALATING" },
    { id: "t4", text: "Who else was stripping the wreck?", op: "005", status: "OPEN" },
    { id: "t5", text: "Informant's last message unread", op: "004", status: "OPEN" },
    { id: "t6", text: "Elite pilot KILNWARDEN escaped", op: "003", status: "OPEN" },
    { id: "t7", text: "Favor owed to the Alliance, terms unspecified", op: "002", status: "OPEN" }
  ],

  events: [
    { id: "e5", date: "5016U · D071", title: "Salvage run at Cairn Drift", op: "005", note: "Withdrew under fire · partial recovery" },
    { id: "e4", date: "5016U · D058", title: "Shootout at Harrow's Gate", op: "004", note: "Informant killed · Dusty wounded" },
    { id: "e3", date: "5016U · D044", title: "Pell relay garrison cleared", op: "003", note: "Base secured · elite pilot escaped" },
    { id: "e2", date: "5016U · D019", title: "Passage rights secured at Kessen Relay", op: "002", note: "Negotiated with the Leandric States Alliance" },
    { id: "e1", date: "5016U · SAMPLE DATE", title: "Courier recovered at Nov Elysia", op: "001", note: "First filed operation · objective complete" }
  ]
};