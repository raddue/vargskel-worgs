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
    updated: "5016U · D071",
    /* Where the lance is mustered between deployments. Read by the dossier when no filed
    operation places a chassis; a filed op supersedes it. */
    station: "UNS RIO GRANDE"
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
    { id: "union",    name: "Union Delegation",         standing: "CONTRACTED", zone: { x: 86, y: 64, rx: 100, ry: 90,  c: "rust" } }
  ],

  personnel: [
    { id: "farris", name: "CAPTAIN FARRIS", role: "UNION DELEGATION · SHIP CAPTAIN", faction: "union", status: "MISSING", lastKnown: "elysia", ops: ["001"], img: "assets/captain-farris-thumb.webp",
      notes: "Captain of the Union delegation's ship, last photographed on her own command deck before the talks collapsed. Missing in the central district since; deck ops holds her chair until she is aboard. Extraction priority one." },
    { id: "bannerjee", name: "AMBASSADOR BANNERJEE", role: "UNION DELEGATION · LEAD NEGOTIATOR", faction: "union", status: "MISSING", lastKnown: "elysia", ops: ["001"], img: "assets/ambassador-bannerjee-thumb.webp",
      notes: "Lead negotiator of the Cressidium peace talks, photographed at the Nov Elysia spaceport before the collapse. The peace holds only as long as his signature does, which is why both sides want him. Missing in the central district since. Extraction priority one." }
  ],

  pilots: [
    { id: "daemon", name: "RURIK “DAEMON” VARGSKEL", background: "PILOT · LL0 · FIXER", status: "ACTIVE", mech: "sweet-cheeks", img: "assets/rurik_vargskel.png",
      triggers: "Act Unseen or Unheard (+2), Get a Hold of Something (+2), Hack or Fix (+2), Lead or Inspire (+2)",
      talents: "Hacker 1, Leader 1, Spotter 1",
      gear: "Assault Hardsuit, Medium Signature, Light Signature, Dataplating, SSC Sylph Undersuit, Personal Drone" },
    { id: "dusty",  name: "HANSEN “DUSTY” MCGRAW", background: "PILOT · LL0 · OUTLAW", status: "ACTIVE", mech: "tombstone", img: "assets/dusty.png",
      triggers: "Charm (+2), Spot (+2), Survive (+2), Take Someone Out (+2)",
      talents: "Gunslinger 1, Vanguard 1, Skirmisher 1",
      gear: "Mobility Hardsuit, Heavy Signature, Medium Signature, Wilderness Survival Kit, Antiphoton Visor, Smart Scope" },
    { id: "sten", name: "STEN “HAMMER” VARGSKEL", background: "PILOT · LL0 · MECHANIC", status: "ACTIVE", mech: "skaldr", img: "assets/sten.png",
      triggers: "Assault (+2), Hack or Fix (+2), Survive (+2), Threaten (+2)",
      talents: "Bonded 1, Grease Monkey 1, Executioner 1",
      gear: "Heavy Hardsuit, Heavy A/C, Light Signature, Tertiary Arm, Corrective, Dataplating" },
    { id: "guillaume", name: "GUILLAUME “TIZONA” ARAGONEAU", background: "PILOT · LL0 · COLONIST", status: "ACTIVE", mech: "xxxg-01h", img: "assets/tizona.png",
      triggers: "Act Unseen or Unheard (+2), Survive (+2), Take Someone Out (+2), Word on the Street (+2)",
      gear: "Light Hardsuit, Light Signature, Light A/C, Extra Rations, Sleeping Bag, Wilderness Survival Kit",
      talents: "Heavy Gunner 1, Spaceborn 1, House Guard 1" },
    { id: "danila", name: "DANILA “SCOOTER” HOWTER-BOWDEN", background: "PILOT · LL0 · WORKER", status: "ACTIVE", mech: "scooteroo", img: "assets/scooter.png",
      triggers: "Blow Something Up (+2), Invent or Create (+2), Spot (+2), Stay Cool (+2)",
      gear: "Heavy Hardsuit, Heavy A/C, Light Signature, Sound System, Tertiary Arm, Extra Rations",
      talents: "Siege Specialist 1, Grease Monkey 1, Walking Armory 1" },
    { id: "spook", name: "NICOLOSO “SPOOK” BENIKO", background: "PILOT · LL0 · SABOTEUR", status: "ACTIVE", mech: "alba", img: "assets/spook.png",
      triggers: "Act Unseen or Unheard (+2), Blow Something Up (+2), Stay Cool (+2), Take Someone Out (+2)",
      talents: "Crack Shot 1, Infiltrator 1, Skirmisher 1",
      gear: "Stealth Hardsuit, Heavy Signature, Archaic Melee, Camo Cloth, SSC Sylph Undersuit, Thermite Charge" },
  ],

  mechs: [
    { id: "sweet-cheeks", name: "SWEET CHEEKS", frame: "GMS CHOMOLUNGMA", pilot: "daemon", role: "ECM & C3", glyph: "◢▰◣", img: "assets/sweet-cheeks.png",
      state: "OPERATIONAL", size: 1, hp: 12, structure: 4, stress: 4, armor: 0, repair: 4, heat: 6, hull: 0, agi: 0, sys: 2, eng: 0, eva: 8, spd: 4, tech: "+3", edef: 12, sens: 15, save: 11, attackBonus: 0, limitedBonus: 0,
      loadout: "Main/Aux: Nexus (Hunter-Killer) / Nexus (Light) · Flex: Missile Rack / Missile Rack",
      systems: "Personalizations, Turret Drones, Type-I Flight System, Type-3 Projected Shield" },
    { id: "tombstone", name: "TOMBSTONE", frame: "GMS EVEREST", pilot: "dusty", role: "SKIRMISHER", glyph: "▰▱", img: "assets/tombstone.png",
      state: "OPERATIONAL", size: 1, hp: 10, structure: 4, stress: 4, armor: 0, repair: 5, heat: 6,
      hull: 0, agi: 2, sys: 0, eng: 0, eva: 10, spd: 5, tech: "+0", edef: 8, sens: 10, save: 10, attackBonus: 0, limitedBonus: 0,
      loadout: "Main: Pistol · Flex: Charged Blade · Heavy: Thermal Lance",
      systems: "Pattern-A Jericho Deployable Cover, COMP/CON-Class Assistant Unit, EVA Module, Expanded Compartment" },
    { id: "xxxg-01h", name: "WAYWARD", frame: "GMS SAGARMATHA", pilot: "guillaume", role: "TANK", glyph: "▰", state: "OPERATIONAL", size: 2,
      hull: 2, agi: 0, sys: 0, eng: 0, structure: 4, hp: 14, armor: 1, stress: 4, heat: 6, repair: 5,
      attackBonus: 0, tech: "+0", limitedBonus: 0, spd: 4, eva: 8, edef: 8, sens: 10, save: 10,
      loadout: "Main: Charged Blade · Flex: Missile Rack / Missile Rack · Heavy: Heavy Machine Gun",
      systems: "Spaceborn EVA, Custom Paint Job, Pattern-A Smoke Charges, Stable Structure, Personalizations" },
    { id: "scooteroo", name: "SCOOTEROO", frame: "GMS EVEREST", pilot: "danila", role: "FIRE SUPPORT", glyph: "▰", img: "assets/scooteroo.png", state: "OPERATIONAL", size: 1,
      hull: 2, agi: 0, sys: 0, eng: 0, structure: 4, hp: 14, armor: 0, stress: 4, heat: 6, repair: 6,
      attackBonus: 0, tech: "+0", limitedBonus: 0, spd: 4, eva: 8, edef: 8, sens: 10, save: 10,
      loadout: "Main: Shotgun · Flex: Rocket-Propelled Grenade · Heavy: Howitzer",
      systems: "Ammo Case I, Type-3 Projected Shield, Manipulators, Stable Structure, EVA Module" },
    { id: "skaldr", name: "SKALDR", frame: "GMS EVEREST", pilot: "sten", role: "SKIRMISHER", glyph: "▰", img: "assets/skaldr.png", state: "OPERATIONAL", size: 1,
      hull: 2, agi: 0, sys: 0, eng: 0, hp: 16, structure: 4, stress: 4, armor: 0, heat: 6, repair: 6,
      attackBonus: 0, tech: "+0", limitedBonus: 0, spd: 4, eva: 8, edef: 8, sens: 10, save: 10,
      loadout: "Main: Shotgun · Flex: Nexus (Hunter-Killer) · Heavy: Heavy Charged Blade",
      systems: "Stable Structure, Type-3 Projected Shield, Personalizations, Custom Paint Job" },
    { id: "alba", name: "ALBA", frame: "GMS EVEREST", pilot: "spook", role: "SABOTEUR", glyph: "▰", state: "OPERATIONAL", size: 1,
      hull: 0, agi: 2, sys: 0, eng: 0, structure: 4, hp: 12, armor: 0, stress: 4, heat: 6, repair: 5,
      attackBonus: 0, tech: "+0", limitedBonus: 0, spd: 5, eva: 10, edef: 8, sens: 10, save: 10,
      loadout: "Main: Missile Rack · Flex: Pistol / Tactical Knife · Heavy: Anti-Materiel Rifle",
      systems: "Personalizations, Rapid Burst Jump Jet System, EVA Module, Pattern-A Jericho Deployable Cover" }
  ],

  ops: [
    { id: "001", title: "SOLSTICE RAIN", type: "PLANNED", loc: "elysia", client: "union", status: "UNBRIEFED",
      date: "5016U · D---", crew: ["daemon", "dusty", "sten", "guillaume", "danila", "spook"], mechs: ["sweet-cheeks", "tombstone", "skaldr", "xxxg-01h", "scooteroo", "alba"], rounds: null,
      /* Mission-page conflict history, rendered above the OPORD. Original copy from facts the
      site already publishes: do not lift prose from the Solstice Rain adventure text. */
      history: ["Cressidium sits on the periphery — one inhabited world at the far edge of Union's reach, dark to the charts long enough that its recontact is still recent. What Union found on its return was a world already split: the Vestan Sovereignty holding the cities and the industrial districts, the Leandric States Alliance holding the coast and the trade lanes, and no patience left on either side. Nov Elysia is the seam between them, a frontier city under Vestan control and the only real foothold Union has on the planet.",
        "Union came back to talk rather than to fight. A delegation went down with the UNS Rio Grande in orbit behind it, to put both sides at a table and bring Cressidium into some settled relationship with the wider human sphere — and those talks were the only thing holding the peace. When they collapsed, they collapsed into open war: VSAF moving on the city, Leandric units holding inside it, and two Union principals missing in the central district before anyone could reach them. The Worgs are on contract because Union would rather pay a lance than commit a fleet to a periphery world."],

      summary: "Union-backed peace talks on Cressidium collapsed into open war. The Worgs deploy with the UNS Rio Grande to Nov Elysia, a city under Vestan siege.",
      mission: { title: "M1 · THE DROP", href: "solstice-rain.html" },
      outcome: "Campaign starting. First drop: Nov Elysia.",

      /* Crew-facing operation order. Player-eyes only: what command tells the lance before
      the drop, never what the GM knows happens to it. paras entries are [heading, body],
      body being a string or a list of [sub-heading, text-or-lines]; annexes are
      [heading, lines] and letter after the generated task-org annex.
      Rendered by opordDoc() in archive.js. */
      opord: {
        class: "RESTRICTED // VW-01 CONTRACT CREW EYES ONLY",
        no: "OPORD 001-5016",
        hq: "UNS RIO GRANDE · DECK OPS, HIGH ORBIT OVER NOV ELYSIA",
        dtg: "5016U · D071",
        hhour: "TBD · D--- — window and route issued with the H-hour message",
        refs: ["SITREP CRESSIDIUM 5016U · D069 — peace talks suspended, general hostilities declared",
          "VW-01 CONTRACT SOLSTICE RAIN — tasking, rules of engagement, payment terms",
          "FOB SABER RENDEZVOUS INSTRUCTIONS — Amanta Motors plant, industrial district"],
        distribution: ["VW-01 (six pilots)", "RIO GRANDE DECK OPS", "FOB SABER"],
        vips: [
          { id: "farris", blurb: "Captain of the Union delegation's ship, last photographed on her own command deck before the talks collapsed. Missing in the central district since; deck ops holds her chair until she is aboard. Extraction priority one." },
          { id: "bannerjee", blurb: "Lead negotiator of the Cressidium peace talks, photographed at the Nov Elysia spaceport before the collapse. The peace holds only as long as his signature does, which is why both sides want him. Missing in the central district since. Extraction priority one." }
        ],

        paras: [
          ["SITUATION", [
            ["Enemy forces", ["Vestan Sovereignty armed forces (VSAF) hold the approaches to Nov Elysia's central district and are conducting siege operations against the city.",
              "Disposition and strength inside the city are not confirmed. Jamming and the loss of local reporting mean the picture from orbit is stale: assume VSAF infantry and armour in both the industrial and central districts, and assume an armed chassis off a dropship is treated as hostile on sight.",
              "VSAF is the aggressor in this theatre. Do not count on a patrol challenging before it fires."]],
            ["Friendly forces", ["Leandric States Alliance units are holding inside Nov Elysia and are friendly — do not fire on them.",
              "FOB Saber, the Amanta Motors factory in the industrial district, is the friendly rendezvous point.",
              "Union assets: UNS Rio Grande in high orbit, lightly armed, strike wings exoatmospheric only. There is no orbital or air support once this lance is on the ground."]],
            ["Attachments and detachments", "None. VW-01 deploys as a single six-chassis lance: no attached Union or Leandric personnel, no organic artillery, no air tasking, no reserve."]]],

          ["MISSION", "VW-01 conducts insertion onto Nov Elysia aboard Dropship Kingfisher 2-2 no later than D---, links up with friendly forces at FOB Saber, locates and secures Captain Farris and Ambassador Bannerjee in the central district, and extracts both to UNS Rio Grande in order to preserve the Union's negotiating position on Cressidium."],

          ["EXECUTION", [
            ["Commander's intent", ["Two people come home. This lance is a retrieval asset, not a strike package: the contract pays on VIPs recovered, not contacts destroyed. Move fast, keep the signature low, and do not spend a chassis to win an argument.",
              "End state: Farris and Bannerjee aboard Rio Grande, VW-01 chassis recovered and refit, and no escalation of this theatre credited to this unit."]],
            ["Concept of operations", ["Phase 1 · Insertion. Single lift aboard Kingfisher 2-2 into the industrial district. Offload, form up, move to FOB Saber. Deck ops assesses the corridor as contested but flyable; the ship will not loiter.",
              "Phase 2 · Link-up. Check in at FOB Saber with the Amanta hold and any Leandric units present. Take the last confirmed bearings on both VIPs before moving on the central district.",
              "Phase 3 · Recovery. Locate Farris and Bannerjee, secure them, and account for both by name.",
              "Phase 4 · Extraction. Return both VIPs to Rio Grande on the recovery route and window issued with the H-hour message."]],
            ["Tasks", ["Nominate one chassis as VIP carrier and one as rearguard, and report both names to deck ops before H-hour.",
              "Internal task assignment is the crew's to make; deck ops needs the two nominations and a single lance lead.",
              "No single-chassis detachments outside the lance footprint without deck ops approval."]],
            ["Coordinating instructions", ["Rules of engagement: do not engage unless fired upon. Priority is getting people home.",
              "Positive identification on Leandric units before any shot. Leandric and VSAF equipment in the same district is expected.",
              "Abort: loss of the extraction route, or two chassis combat-ineffective, means fall back to FOB Saber and raise deck ops (Annex C).",
              "Expect city-wide jamming to blank local comms and sensors at intervals; fallback procedure is Annex D."]]]],

          ["SUSTAINMENT", [
            ["Logistics", "VW-01 deploys with what is aboard the chassis. Resupply at FOB Saber is limited to what Amanta holds and what Leandric units can spare — fuel, munitions and repair capacity are all local purchase. Rio Grande cannot push supplies inside the jamming envelope."],
            ["Personnel", "No replacements are allocated to this contract. Six pilots, six chassis: a downed pilot is recovered by the lance, not by a Union search-and-rescue asset."],
            ["Medical", "Field care is chassis-borne, with the FOB Saber aid station as the first fixed facility. Casualties move to Rio Grande on the extraction lift. 9-line format at Annex B."]]],

          ["COMMAND AND SIGNAL", [
            ["Command", "Deck ops, UNS Rio Grande, holds tasking authority for this contract. On the ground the lance commands itself: nominate a lance lead before H-hour and report the name. Succession runs lance lead, then crew seniority."],
            ["Signal", "Primary is chassis-to-chassis tightbeam, secondary is Rio Grande relay. Both are expected to black out under jamming — Annex D carries the fallback. Mandatory reports: link-up, VIP secure, extraction."]]]
        ],

        annexes: [
          ["CASEVAC 9-LINE", ["Line 1 · Pickup site: FOB Saber, Amanta Motors plant, industrial district. Grid issued at link-up; any other site is contested and must be held while the lift comes in.",
            "Line 2 · Radio: chassis tightbeam primary, Rio Grande relay secondary. Callsigns at Annex A.",
            "Line 3 · Patients by precedence: urgent, priority, routine.",
            "Line 4 · Special equipment: hoist-capable lift for chassis-mounted casualties.",
            "Line 5 · Patients by type: litter, ambulatory.",
            "Line 6 · Site security: friendly hold at FOB Saber, unknown elsewhere.",
            "Line 7 · Marking: IR strobe or panel. No pyrotechnics inside the jamming envelope without deck ops approval — VSAF and Leandric units read the same signals.",
            "Line 8 · Nationality and status: Union civilian principals, contract crew, Leandric allied.",
            "Line 9 · Terrain and contamination: dense urban industrial, active jamming, no contamination reported."]],
          ["TIMELINE AND ABORT", ["H-6 · Crew acknowledges this order to deck ops; lance lead, VIP carrier and rearguard nominated.",
            "H-2 · Chassis sealed and pre-flighted, loaded aboard Kingfisher 2-2.",
            "H-hour · Insertion lift departs Rio Grande on the window and route issued with the H-hour message.",
            "H+1 · On the ground, move to FOB Saber, link-up report.",
            "Recovery · Central district, VIP secure report once both names are accounted for.",
            "Extraction · Recovery route per the H-hour message, extraction report on wheels-up.",
            "Abort on any of: extraction route lost, two chassis combat-ineffective, either VIP confirmed unrecoverable, deck ops recall. On abort, fall back to FOB Saber, hold, and raise deck ops on any working channel."]],
          ["COMMS UNDER JAMMING", ["Assume windows, not a continuous net. Jamming is expected to blank tightbeam and relay at intervals and without warning.",
            "If comms are blacked out, attempt each mandatory report three times on the hour, then proceed to the next phase. Silence is not authority to stop.",
            "Scattered with no working channel: rally on FOB Saber. An IR strobe or panel on the lead chassis is the visual sign of a friendly stack.",
            "Kingfisher 2-2 does not hold on-station for a radio check."]]]
      }
    }
  ],

  threads: [],

  events: []
};