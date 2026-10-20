/* Rules data (c) Massif Press, LANCER. Derived from lancer-npc-data.lcp (COMP/CON NPC data).
   33 NPC class(es); tiered stats are three-value arrays, tier 1 to 3. */
window.NPCS = {
 "classes": [
  {
   "id": "npcc_ace",
   "name": "Ace",
   "role": "striker",
   "info": {
    "flavor": "The first person to embody the “Ace” archetype was Aisling Jensen, an auxiliary pilot active during the liberation of Verdana. Knights of the chassis and sky, Aces like Aisling throw their mechs into battle with high-speed strafing runs, agile maneuvers, and reckless feats of daring. Cocky and self-assured, Aces relish a good duel.",
    "tactics": "Aces are very fast and reactive strikers that can use Evasive Maneuvers to mitigate dangerous or high-damage attacks. Barrel Roll is most effective against heavy weapons. Their Seeking weapons ignore cover and don’t require line of sight, allowing them to deal consistent damage. Relatively low HP makes Aces vulnerable to sustained damage, and they are relatively weak against tech attacks.",
    "terse": "Fast and evasive striker that can deal consistent damage."
   },
   "stats": {
    "armor": 0,
    "hp": [
     10,
     12,
     14
    ],
    "evade": [
     12,
     15,
     18
    ],
    "edef": [
     8,
     8,
     10
    ],
    "heatcap": 8,
    "speed": [
     5,
     6,
     7
    ],
    "sensor": 10,
    "save": [
     10,
     12,
     14
    ],
    "hull": -2,
    "agility": [
     3,
     4,
     6
    ],
    "systems": [
     1,
     2,
     3
    ],
    "engineering": [
     0,
     1,
     1
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "edef",
    "speed",
    "save",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_aegis",
   "name": "Aegis",
   "role": "support",
   "info": {
    "flavor": "Aegis-archetype mechs are built to hold ground, support their allies, and suppress enemies. First used to great effect during the Comorrand Action by a Karrakin pilot, Lady Gloria of House MacLennan, Aegis’s are known for their powerful defensive measures. Their pilots can expertly make a bulwark out of the smallest barricade with anything from conventional tools to cutting-edge technologies.",
    "tactics": "Aegises are tough and defensive support units. They are most effective when positioned so that their Defense Net can cover as many allies as possible since they can be difficult to redeploy. Regenerative Shielding also protects the Aegis from mobility-reducing effects.",
    "terse": "Tough and defensive support unit adept at holding ground."
   },
   "stats": {
    "armor": [
     2,
     2,
     3
    ],
    "hp": [
     14,
     18,
     18
    ],
    "evade": [
     7,
     8,
     8
    ],
    "edef": [
     10,
     12,
     14
    ],
    "heatcap": 10,
    "speed": 3,
    "sensor": [
     8,
     10,
     10
    ],
    "save": [
     10,
     11,
     12
    ],
    "hull": 0,
    "agility": [
     -2,
     -1,
     -1
    ],
    "systems": [
     2,
     3,
     4
    ],
    "engineering": [
     2,
     3,
     5
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "armor",
    "hp",
    "evade",
    "edef",
    "sensor",
    "save",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_archer",
   "name": "Archer",
   "role": "controller",
   "info": {
    "flavor": "The basis of the Archer archetype, Ursa Major’s Gatekeeper Key-II, was popularized by Ichabod Carden’s heroic actions in the Battle of Terramoto. Archer-archetype mechs sacrifice armor for powerful targeting and superpositional maneuvering systems, making them especially popular with pilots who prefer to have control over the precise destination of each shot.",
    "tactics": "Archers excel at inflicting “choice punishment” on their enemies – they make characters choose between taking certain actions or letting the Archer attack them. Use Archers to lock down mobile or hard-hitting PCs or to cover for more vulnerable allies. Keep in mind that Archers are most effective when they can get fairly close to their targets, but they aren’t especially durable.",
    "terse": "Mobile controller that can lock down enemies."
   },
   "stats": {
    "armor": [
     0,
     0,
     1
    ],
    "hp": [
     16,
     20,
     20
    ],
    "evade": [
     8,
     10,
     12
    ],
    "edef": [
     8,
     10,
     12
    ],
    "heatcap": 8,
    "speed": [
     5,
     5,
     6
    ],
    "sensor": 15,
    "save": [
     11,
     13,
     16
    ],
    "hull": -1,
    "agility": [
     2,
     3,
     4
    ],
    "systems": [
     2,
     3,
     4
    ],
    "engineering": -1,
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "armor",
    "hp",
    "evade",
    "edef",
    "speed",
    "save",
    "agility",
    "systems"
   ],
   "features": []
  },
  {
   "id": "npcc_assassin",
   "name": "Assassin",
   "role": "striker",
   "info": {
    "flavor": "Assassins tend towards agility, damage, and speed. These pilots sacrifice comfort for efficiency, stripping out everything from life-support to comms systems and replacing them with increased processing power and stealth capabilities. Assassins work alone or in small groups, piloting their small, sleek mechs through near-impenetrable terrain to catch their targets off-guard.",
    "tactics": "Assassins are true experts at punishing single characters. Use Assassin’s Mark to choose a target, and then make the most of the Assassin’s high speed and Leap to close the distance. For a nasty combination, pair an Assassin with NPCs that inflict mobility-reducing conditions like Stunned or Prone. Without optional systems like the “Devil’s Cough” Shotgun, Assassins only have access to melee attacks and are fairly vulnerable to sustained damage.",
    "terse": "Fast and deadly striker that can quickly close distance to punish single targets."
   },
   "stats": {
    "armor": [
     0,
     1,
     1
    ],
    "hp": 15,
    "evade": [
     12,
     15,
     17
    ],
    "edef": 8,
    "heatcap": 7,
    "speed": [
     6,
     6,
     8
    ],
    "sensor": 10,
    "save": [
     10,
     12,
     14
    ],
    "hull": [
     0,
     1,
     1
    ],
    "agility": [
     2,
     3,
     4
    ],
    "systems": [
     1,
     1,
     2
    ],
    "engineering": [
     -1,
     0,
     0
    ],
    "size": [
     [
      0.5,
      1
     ],
     [
      0.5,
      1
     ],
     [
      0.5,
      1
     ]
    ],
    "activations": 1
   },
   "tiered": [
    "armor",
    "evade",
    "speed",
    "save",
    "hull",
    "agility",
    "systems",
    "engineering",
    "size"
   ],
   "features": []
  },
  {
   "id": "npcc_assault",
   "name": "Assault",
   "role": "striker",
   "info": {
    "flavor": "Assault mechs are the most common primary battle frames found throughout the galaxy. Fitted with a heavy rifle, a sidearm, and a suite of systems that enhance movement, targeting, and defensibility, they are straightforward, reliable, and hardy combatants. The pilots of Assault mechs are also the cheapest to train and outfit, but that doesn’t make them any less dangerous.",
    "tactics": "Assaults are straightforward, damage-dealing strikers. Put them somewhere their toughness and decent range can be used effectively, and Hunker Down against damage to maximize their survivability.",
    "terse": "Straightforward striker that can deal consistent damage."
   },
   "stats": {
    "armor": 1,
    "hp": [
     15,
     18,
     21
    ],
    "evade": [
     8,
     10,
     12
    ],
    "edef": [
     8,
     9,
     10
    ],
    "heatcap": 8,
    "speed": 4,
    "sensor": 8,
    "save": [
     10,
     12,
     14
    ],
    "hull": [
     1,
     2,
     3
    ],
    "agility": [
     1,
     2,
     3
    ],
    "systems": [
     1,
     2,
     3
    ],
    "engineering": [
     1,
     2,
     3
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "edef",
    "save",
    "hull",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_barricade",
   "name": "Barricade",
   "role": "controller",
   "info": {
    "flavor": "Veld Systems’ Keeper Pattern 5 is a common guard mech made famous after the platform’s performance during the Battle of Sing Rama Sing. During the battle, Audrey Reimaus of the Seraphs’ Company used a Keeper P5 to singlehandedly secure Rama City’s main uplift tower, thus guaranteeing an evacuation corridor for the city’s civilian population.",
    "tactics": "Barricades are at their best when locking down fast-moving targets. They can use their Mobile Printer to create hard cover for allies or to prevent melee mechs from moving through an area.",
    "terse": "Mobile controller that can lock down fast enemies and create hard cover."
   },
   "stats": {
    "armor": 1,
    "hp": [
     12,
     16,
     20
    ],
    "evade": [
     6,
     7,
     8
    ],
    "edef": [
     9,
     11,
     13
    ],
    "heatcap": [
     10,
     11,
     12
    ],
    "speed": [
     3,
     3,
     4
    ],
    "sensor": 15,
    "save": [
     12,
     15,
     18
    ],
    "hull": [
     0,
     1,
     2
    ],
    "agility": -2,
    "systems": [
     1,
     1,
     2
    ],
    "engineering": [
     3,
     5,
     6
    ],
    "size": 2,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "edef",
    "heatcap",
    "speed",
    "save",
    "hull",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_bastion",
   "name": "Bastion",
   "role": "defender",
   "info": {
    "flavor": "Bastions trade the pure defensive edge of Aegis-archetype mechs for greater mobility. They blend area-denial offensive capabilities with hardened defense systems and advanced communication suites. These mechs are favorites of many strong squadron commanders. The efficacy of the pairing was best displayed by the actions of Zander Reeves, a field-promoted auxiliary officer, during engagements with the “Space Between” interstellar pirate guild in the Dromeda system.",
    "tactics": "Bastions are hardy defenders that use their bulk and size to protect themselves and nearby. Use Friendly Interdiction to defend against distant enemies, like artillery and snipers. Bastions (and their wards) are vulnerable to Knockback and forced movement, as these effects break many of their abilities.",
    "terse": "Hardy defender that can protect its allies, but is vulnerable to forced movement."
   },
   "stats": {
    "armor": [
     3,
     3,
     4
    ],
    "hp": 10,
    "evade": [
     8,
     10,
     10
    ],
    "edef": 8,
    "heatcap": [
     8,
     10,
     12
    ],
    "speed": 4,
    "sensor": 5,
    "save": [
     8,
     10,
     12
    ],
    "hull": [
     2,
     4,
     6
    ],
    "agility": [
     -3,
     -3,
     -2
    ],
    "systems": 0,
    "engineering": [
     2,
     3,
     4
    ],
    "size": 2,
    "activations": 1
   },
   "tiered": [
    "armor",
    "evade",
    "heatcap",
    "save",
    "hull",
    "agility",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_berserker",
   "name": "Berserker",
   "role": "striker",
   "info": {
    "flavor": "Berserker mechs are built to take advantage of advanced heat-cycling systems that allow them to shunt heat - as it is generated - into pure offensive force, increasing their weapon output by orders of magnitude. The archetype, best-known for its use by Gen’Dal Merlos’s Knights of Imminent Destruction, is preferred by pure combat-focus organizations, PMCs, and deniable-asset corps in established states.",
    "tactics": "Berserkers are excellent melee duelists that are very scary up close. Their potential is greatest when they are as close to enemy forces as possible. Due to their terrible Heat Cap and E-Defense, Berserkers are vulnerable to tech attacks. Savvy opponents will use Aggression to their own advantage, turning Berserkers against their allies, so it’s best to keep them away from friendly forces.",
    "terse": "Powerful melee striker that can deal high damage to grouped enemies, but is vulnerable to tech attacks."
   },
   "stats": {
    "armor": 1,
    "hp": [
     12,
     16,
     20
    ],
    "evade": [
     8,
     9,
     10
    ],
    "edef": 6,
    "heatcap": 6,
    "speed": 5,
    "sensor": 5,
    "save": [
     10,
     12,
     14
    ],
    "hull": [
     3,
     4,
     6
    ],
    "agility": [
     2,
     4,
     4
    ],
    "systems": -2,
    "engineering": [
     -1,
     -1,
     0
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "save",
    "hull",
    "agility",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_bombard",
   "name": "Bombard",
   "role": "artillery",
   "info": {
    "flavor": "Alta All-Theater Ballistics’ archetypal Bombard chassis and their licensed facsimiles are a common sight in flashpoints across the galaxy. Built for staying power across long-uptime deployments, Bombard-type mechs are an accessible solution for armed forces looking to quickly deploy artillery to a theater. Chassis configured to the parameters of this class are usually positioned in fortified positions miles behind the line; one especially asymmetrical deployment strategy involves placing Bombard batteries above the theater of operations – typically on a local moon, locked-orbit natural satellite, or on a purpose-built orbital platform. From their vantage point, the battery can then rain shells down upon the world below, far removed from the dangers of combat.",
    "tactics": "Bombards are very long-range artillery mechs designed to punish characters that stay close together to take advantage of adjacency bonuses. They are relatively fragile up close, but resilient at a distance, so place them far back to maximize their effectiveness. Bombards’ Earthshaker Shells are great for preventing enemy movement and providing cover, but can harm allies as well.",
    "terse": "Long-range artillery that can punish enemies that stay close together."
   },
   "stats": {
    "armor": 0,
    "hp": [
     10,
     13,
     16
    ],
    "evade": [
     7,
     8,
     8
    ],
    "edef": [
     12,
     14,
     16
    ],
    "heatcap": 8,
    "speed": [
     2,
     2,
     3
    ],
    "sensor": 15,
    "save": [
     11,
     13,
     16
    ],
    "hull": [
     0,
     1,
     1
    ],
    "agility": -1,
    "systems": [
     1,
     2,
     3
    ],
    "engineering": [
     2,
     3,
     5
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "edef",
    "speed",
    "save",
    "hull",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_breacher",
   "name": "Breacher",
   "role": "striker",
   "info": {
    "flavor": "Notoriously effective in boarding operations, the Campbell Orbital Dynamics C-O MkIII is often seen in the arsenals of suborbital planetary defense forces and their pirate counterparts. Officially, the CO designation is an abbreviation of “CombatOrbital”, but unofficially, the CO3 goes by a different name: the “Can Opener”, inspired by the callsign of Valeria Rojas-Sarnik, one of the most storied CO3 pilots.",
    "tactics": "Breachers can deal out significant Burst damage, but they aren’t especially accurate. To boost their capabilities, use Lock On or pair them with support NPCs. The Breach Ram makes short work of cover; however, it lacks speed and range, and risks provoking reactions.",
    "terse": "Short-range burst striker that can deal high damage, but is slow and inaccurate."
   },
   "stats": {
    "armor": 1,
    "hp": [
     18,
     20,
     22
    ],
    "evade": [
     9,
     11,
     13
    ],
    "edef": 7,
    "heatcap": [
     7,
     7,
     8
    ],
    "speed": [
     3,
     4,
     5
    ],
    "sensor": 5,
    "save": [
     10,
     12,
     14
    ],
    "hull": [
     2,
     3,
     4
    ],
    "agility": [
     0,
     1,
     2
    ],
    "systems": -1,
    "engineering": [
     1,
     2,
     3
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "heatcap",
    "speed",
    "save",
    "hull",
    "agility",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_cataphract",
   "name": "Cataphract",
   "role": "striker",
   "info": {
    "flavor": "Cataphract squadrons are made up of rapid-strike mechs that emphasize mobility, shock, and tenacity; it follows, then, that Cataphract archetypes are feared across the galaxy for their ability to overwhelm defenses in moments. There are few things more terrifying (or inspiring) than a squadron of Cataphracts punching through a static battle line, heavy cannons and point-defense weapons wiping out previously immovable defenders. The flagship Cataphract-class chassis is the Sine Die Systems END-44, an angular beast of a mech outfitted with SDS’s fearsome Ram Cannon. The enduring popularity of the chassis can be attributed to the success of Catherine “C-80” Need, who made their name piloting an END-44 to victory in the defense of Carina-Proximal.",
    "tactics": "Cataphracts are mobile strikers. Trample allows them to move through enemies and get them to the rear lines, where they can use Impale to force vulnerable targets into disadvantageous positions. Position Cataphracts so that they are closer to individual hostile characters, as Point-Defense Shield doesn’t work if several enemies are an equal distance away. Note that Cataphracts still provoke reactions when they move, so use their abilities carefully.",
    "terse": "Mobile striker that can move through enemies and force them into disadvantageous positions."
   },
   "stats": {
    "armor": 0,
    "hp": [
     15,
     17,
     20
    ],
    "evade": [
     10,
     11,
     12
    ],
    "edef": 8,
    "heatcap": [
     6,
     7,
     8
    ],
    "speed": 8,
    "sensor": 5,
    "save": [
     12,
     14,
     16
    ],
    "hull": [
     1,
     2,
     4
    ],
    "agility": [
     1,
     3,
     4
    ],
    "systems": 0,
    "engineering": 0,
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "heatcap",
    "save",
    "hull",
    "agility"
   ],
   "features": []
  },
  {
   "id": "npcc_demolisher",
   "name": "Demolisher",
   "role": "defender",
   "info": {
    "flavor": "The lengthy siege of Jadigmora City saw the development of the first true Demolisher frames. Based on antique Berserker mechs, Demolishers swapped dramatic heat flows for more sustainable systems, improved hydraulic strength, and stabilizers for supermassive melee weapons. Demolisher pilots soon discovered a range of new applications for their concussion-wave ordnance. A lancer named Hayes Rothford and their NHP, Clarke, were the first pilot/co-pilot team to truly show the power of the platform, singlehandedly bringing down a siege frigate in low orbit.",
    "tactics": "Demolishers are slow, resilient defenders that dish out plenty of damage and stuns when they get close to the enemy. Use their size and power in melee combat to force enemy characters to move away instead of fighting them, and Dig In to shrug off heavy hits.",
    "terse": "Slow and resilient defender that can deal high damage and stuns."
   },
   "stats": {
    "armor": 2,
    "hp": [
     15,
     20,
     25
    ],
    "evade": 6,
    "edef": 7,
    "heatcap": 8,
    "speed": [
     2,
     2,
     3
    ],
    "sensor": 10,
    "save": [
     10,
     13,
     15
    ],
    "hull": [
     3,
     4,
     6
    ],
    "agility": -2,
    "systems": -1,
    "engineering": [
     2,
     3,
     4
    ],
    "size": 2,
    "activations": 1
   },
   "tiered": [
    "hp",
    "speed",
    "save",
    "hull",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_engineer",
   "name": "Engineer",
   "role": "striker",
   "info": {
    "flavor": "Various types of localized Engineer-class mechs are common throughout the galaxy, unique to the worlds or theaters in which they operate. The Engineer has long existed as an archetype, but it remained largely undefined until a full design doctrine was laid out by Corrida Isolde-Nollet, an Armory civil service director on Ras Shamra. In all cases, the mission of Engineers is the same: defend, maintain, secure. Engineers operate best in the middle or rear of the battle line, coordinating the defense of important positions and overseeing comprehensive deployment of all operational assets. Remember: if you can’t get to the enemy, you lose.",
    "tactics": "Engineers’ Deployable Turrets make them potent force multipliers, as they can deploy one every turn. If enemies don’t deal with an Engineer's turrets quickly, their potential damage quickly skyrockets – even more when they target characters with Engineer’s Mark. Without Engineer’s Mark, turrets attack the nearest target, which players can use to control who takes damage.",
    "terse": "Force multiplier striker that can deploy turrets to deal damage."
   },
   "stats": {
    "armor": 0,
    "hp": 20,
    "evade": [
     7,
     9,
     11
    ],
    "edef": [
     10,
     10,
     12
    ],
    "heatcap": [
     10,
     12,
     14
    ],
    "speed": 3,
    "sensor": 15,
    "save": [
     10,
     12,
     14
    ],
    "hull": -1,
    "agility": -1,
    "systems": [
     1,
     2,
     3
    ],
    "engineering": [
     3,
     4,
     6
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "evade",
    "edef",
    "heatcap",
    "save",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_goliath",
   "name": "Goliath",
   "role": "defender",
   "info": {
    "flavor": "Along the Sierra Madre Line – the eighth ring of territory out from Cradle – the Dangun frame is a familiar sight. Manufactured by Park Armored Systems and popularized by the Dagger Squadron mercenary company, the Dangun is popular for its toughness, kinetic damage-trade ability, and reliable all-theater performance. The Dangun is a mech to build strike forces around – a Goliath-class frame capable of mounting powerful magtech, with a design that’s tough to counter in kinetic damage combat.<br>With a number of small fleet contracts in its portfolio, Park Armored Systems is a manufacturer worth keeping an eye on; indeed, Harrison Armory has taken particular notice, and omninet rumors suggest a possible partnership in the near future.",
    "tactics": "Goliaths are relatively mobile defenders that can bring enemies to them. With Crush Targeting, Goliaths force dangerous enemies to focus attacks on them; all it needs is line of sight, allowing Goliaths to target even fast or hard-to-hit characters. The prodigious size of Goliaths also lets them provide cover for their allies.",
    "terse": "Mobile defender that can draw enemies to them."
   },
   "stats": {
    "armor": 0,
    "hp": [
     25,
     30,
     35
    ],
    "evade": 6,
    "edef": 6,
    "heatcap": [
     8,
     10,
     12
    ],
    "speed": 3,
    "sensor": [
     10,
     10,
     15
    ],
    "save": [
     11,
     13,
     15
    ],
    "hull": [
     4,
     6,
     6
    ],
    "agility": -2,
    "systems": 1,
    "engineering": [
     0,
     0,
     2
    ],
    "size": [
     [
      3
     ],
     [
      3
     ],
     [
      3
     ]
    ],
    "activations": 1
   },
   "tiered": [
    "hp",
    "heatcap",
    "sensor",
    "save",
    "hull",
    "engineering",
    "size"
   ],
   "features": []
  },
  {
   "id": "npcc_hive",
   "name": "Hive",
   "role": "controller",
   "info": {
    "flavor": "In theory, drones and drone swarms developed after the Deimos Event are not too different from their older cousins: they establish a local omninetwork; fabricate and deploy a century or half-century of drones; and then coordinate them to achieve their objectives. Still, the complex handler–trainer relationships that allow pilots to segue between direct control and autonomous operation cause psychological trauma after a month of continuous drone operation. It is recommended that they cycle their paired hive nexus every two weeks.",
    "tactics": "Hives use Razor Swarm to control the battlefield, granting soft cover to their allies and denying areas to their enemies. Deploy swarms and use Drone Barrage to lock down enemies, or move them into the range of swarms and allies.",
    "terse": "Drone-focused controller that can lock down enemies and provide soft cover."
   },
   "stats": {
    "armor": [
     0,
     1,
     1
    ],
    "hp": 20,
    "evade": [
     8,
     8,
     10
    ],
    "edef": [
     10,
     13,
     16
    ],
    "heatcap": 8,
    "speed": 5,
    "sensor": 10,
    "save": [
     12,
     14,
     17
    ],
    "hull": [
     -1,
     -1,
     1
    ],
    "agility": 0,
    "systems": [
     2,
     4,
     5
    ],
    "engineering": 1,
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "armor",
    "evade",
    "edef",
    "save",
    "hull",
    "systems"
   ],
   "features": []
  },
  {
   "id": "npcc_hornet",
   "name": "Hornet",
   "role": "controller",
   "info": {
    "flavor": "SatriaBarong’s Espada range of half-frame mechs has long been a popular choice in the chassis racing circuit; notably, Espadas are the mechs of choice for the vaunted SatriaBarong–ShimanoLUX chassis racing team. Recently, SatriaBarong – with the blessing of SSC – has moved to create a mil-spec, de-licensed variant of the Espada without the ShimanoLUX branding, giving rise to the Hornet archetype, a platform open for other companies to adapt and improve. The most notable of these competitors is Chandrasekhar & Herschel, the primary sponsor of the new Blueshift Grand Prix racing circuit.",
    "tactics": "Hornets are small, fast controllers that are extremely hard to hit and incredibly annoying. They deal limited damage, but their ability to inflict mobility-reducing conditions is great for locking down enemy strikers. Fortunately for their enemies, Hornets have a low E-Defense that makes them vulnerable to smart weaponry and tech attacks.",
    "terse": "Fast, evasive controller that can lock down enemies."
   },
   "stats": {
    "armor": 0,
    "hp": 8,
    "evade": [
     16,
     18,
     20
    ],
    "edef": [
     6,
     7,
     8
    ],
    "heatcap": [
     5,
     6,
     7
    ],
    "speed": [
     6,
     8,
     10
    ],
    "sensor": [
     5,
     5,
     10
    ],
    "save": [
     12,
     14,
     16
    ],
    "hull": -2,
    "agility": [
     2,
     4,
     6
    ],
    "systems": [
     2,
     3,
     4
    ],
    "engineering": 0,
    "size": 0.5,
    "activations": 1
   },
   "tiered": [
    "evade",
    "edef",
    "heatcap",
    "speed",
    "sensor",
    "save",
    "agility",
    "systems"
   ],
   "features": []
  },
  {
   "id": "npcc_human",
   "name": "Human",
   "role": "biological",
   "info": {
    "flavor": "All kinds of people end up on the battlefield, including pilots, VIPs, and bystanders.<br>You will mostly use Human NPCs when someone climbs out of their mech mid-battle; if you want a proper group of infantry, use the Squad class instead. Humans can never take other templates, and cannot gain structure.",
    "tactics": "",
    "terse": "Unmounted pilots, VIPs, and bystanders."
   },
   "stats": {
    "armor": 0,
    "hp": 6,
    "evade": 10,
    "edef": 10,
    "heatcap": 0,
    "speed": 4,
    "sensor": 5,
    "save": 10,
    "hull": [
     1,
     2,
     3
    ],
    "agility": [
     1,
     2,
     3
    ],
    "systems": [
     1,
     2,
     3
    ],
    "engineering": [
     1,
     2,
     3
    ],
    "size": 0.5,
    "activations": 1
   },
   "tiered": [
    "hull",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_mirage",
   "name": "Mirage",
   "role": "support",
   "info": {
    "flavor": "Mirage-class mechs are often found in the employ of HORIZON-aligned militant groups. With no originating manufacturer, they are one of the few open-source non-HORUS pattern groups available to cells that know where to look. Mirages deploy advanced liturgicode to wrap themselves and their allies in veils of illusion and misdirection. While it’s clear that the warping effects that surround these mechs are caused by sensor distortion, they are powerful enough to affect even organic systems – exercise caution when engaging.",
    "tactics": "Mirages are potent support mechs, able to teleport their allies around at will and shut down ranged attackers with Warp Sensors. They can make allied characters Invisible, but become vulnerable while doing so. These strengths come at a price: weapons and systems that ignore cover – such as Seeking weapons – can get around Warp Sensors, and Mirages don’t deal any damage on their own.",
    "terse": "Support mech that can teleport allies and shut down ranged attackers."
   },
   "stats": {
    "armor": 0,
    "hp": [
     10,
     12,
     14
    ],
    "evade": [
     10,
     12,
     14
    ],
    "edef": [
     12,
     15,
     18
    ],
    "heatcap": 6,
    "speed": [
     5,
     6,
     7
    ],
    "sensor": [
     15,
     15,
     20
    ],
    "save": [
     11,
     14,
     17
    ],
    "hull": -2,
    "agility": [
     1,
     2,
     3
    ],
    "systems": [
     2,
     3,
     4
    ],
    "engineering": [
     1,
     2,
     3
    ],
    "size": 0.5,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "edef",
    "speed",
    "sensor",
    "save",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_monstrosity",
   "name": "Monstrosity",
   "role": "biological",
   "info": {
    "flavor": "Monstrosities are especially large or horrifying natural predators. Although they are usually wild, some monstrosities can be domesticated and trained for combat: such creatures are in high demand along the furthest reaches of the galaxy.",
    "tactics": "",
    "terse": "Monstrosities are especially large or horrifying natural predators"
   },
   "stats": {
    "armor": 1,
    "hp": [
     14,
     16,
     18
    ],
    "evade": [
     10,
     12,
     15
    ],
    "edef": 10,
    "heatcap": 0,
    "speed": [
     6,
     7,
     8
    ],
    "sensor": 10,
    "save": [
     10,
     12,
     15
    ],
    "hull": [
     3,
     4,
     6
    ],
    "agility": [
     2,
     3,
     4
    ],
    "systems": -2,
    "engineering": -2,
    "size": [
     [
      1,
      2
     ],
     [
      1,
      2
     ],
     [
      1,
      2,
      3
     ]
    ],
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "speed",
    "save",
    "hull",
    "agility",
    "size"
   ],
   "features": []
  },
  {
   "id": "npcc_operator",
   "name": "Operator",
   "role": "artillery",
   "info": {
    "flavor": "Operators are known-unknowns, rarely encountered on the front lines, but this should not be mistaken for fragility. Operators are dangerous and deadly in every way. Like their mechs, Operators’ bodies are loaded with the most advanced tech available. When they die in combat, it’s not unknown for their bodies – and their mechs — to self-immolate, rendering any technology and data into ash.",
    "tactics": "Operators are elite and extremely mobile artillery mechs. They aren’t particularly hardy, but can use Trace Drive to teleport around the battlefield and put themselves in advantageous positions: on top of obstructions or terrain, or in cover – anywhere they can snipe at enemies with their highly accurate Raptor Plasma Rifles.",
    "terse": "Accurate and highly mobile artillery mech that can teleport around the battlefield."
   },
   "stats": {
    "armor": 0,
    "hp": [
     10,
     12,
     15
    ],
    "evade": [
     10,
     12,
     14
    ],
    "edef": [
     10,
     12,
     14
    ],
    "heatcap": 8,
    "speed": 5,
    "sensor": 10,
    "save": [
     10,
     12,
     14
    ],
    "hull": [
     2,
     3,
     4
    ],
    "agility": [
     2,
     3,
     4
    ],
    "systems": [
     2,
     3,
     4
    ],
    "engineering": [
     2,
     3,
     4
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "edef",
    "save",
    "hull",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_priest",
   "name": "Priest",
   "role": "support",
   "info": {
    "flavor": "Priest-archetype mechs are found among the ranks of technozealot cults, transhumanist movements, and states or corporations that prioritize technological supremacy. These frames are configured to network their sensitive core systems with sympathetic mechs, creating digital super-constructs in order to establish and maintain total theater control. The use of Priest-archetype chassis and strategies were pioneered by a small, esoteric group known as the Messengers of MAIA. Ostensibly a courier group, the Messengers push all systems – synthetic and organic – to their theoretical limits. They even go so far as to share sensory input between linked pilots – an experience known to produce hyper-perception fugues and other ascendant mental states.",
    "tactics": "Priests are powerful support mechs that function best when partnered with another character they can empower with Investiture. Use their Dispersal Shield to protect vulnerable targets and Investiture to empower an allied striker or defender. Enemies can disarm Investiture by separating Priests from their partners, at which point both become vulnerable to conditions.",
    "terse": "Powerful support mech that can empower allies."
   },
   "stats": {
    "armor": 0,
    "hp": [
     10,
     13,
     16
    ],
    "evade": 10,
    "edef": [
     12,
     15,
     18
    ],
    "heatcap": 10,
    "speed": [
     5,
     5,
     6
    ],
    "sensor": 10,
    "save": [
     11,
     13,
     15
    ],
    "hull": -1,
    "agility": -1,
    "systems": [
     2,
     4,
     6
    ],
    "engineering": [
     2,
     3,
     4
    ],
    "size": 0.5,
    "activations": 1
   },
   "tiered": [
    "hp",
    "edef",
    "speed",
    "save",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_pyro",
   "name": "Pyro",
   "role": "defender",
   "info": {
    "flavor": "First popularized in the wake of the Hercynian Crisis by the lancer Flama and their aptly named Devil Corps, Pyro frames are reviled across the galaxy as the embodiment of the pure destructive power held by militarized states and corpro-states. Their use is common within organizations for which the ends justify the means. Pyros are well-armored, and better insulated than most chassis of similar gross weight, designed to manage incredible internal heat while projecting volatile mixes of chemicals and flame toward their enemies. Pyros are often used in urban and jungle warfare, where they can be used to root out entrenched defenders.",
    "tactics": "Pyros are slow, resilient mechs that are especially potent against characters already suffering from Burn. If players don’t keep their distance, Pyros can use Explosive Vent to dump an enormous amount of heat on right on them. Position Pyros so they can protect allies against incoming fire with Firebreak Shield. Note, however, that players can move around shields to reduce their effectiveness to zero, or they can deactivate them by hitting Pyros with Stunned or Knockback weapons.",
    "terse": "Slow and resilient defender that can deal high damage to enemies via Burn."
   },
   "stats": {
    "armor": [
     3,
     3,
     4
    ],
    "hp": [
     10,
     13,
     15
    ],
    "evade": 8,
    "edef": 8,
    "heatcap": [
     12,
     12,
     16
    ],
    "speed": 2,
    "sensor": 8,
    "save": [
     10,
     12,
     14
    ],
    "hull": [
     1,
     2,
     3
    ],
    "agility": [
     -1,
     0,
     0
    ],
    "systems": [
     -1,
     -1,
     0
    ],
    "engineering": [
     3,
     4,
     5
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "armor",
    "hp",
    "heatcap",
    "save",
    "hull",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_rainmaker",
   "name": "Rainmaker",
   "role": "artillery",
   "info": {
    "flavor": "The tongue-in-cheek “Rainmaker” nickname describes mechs and pilots that specialize in the use of rockets and missiles. Favored by flexible combat units, Rainmakers are mobile platforms loaded with ordnance and capable of handling engagements at any range, against any target.",
    "tactics": "Rainmakers are one part artillery and one part controller. Their Javelin Rockets force characters to avoid certain areas or take guaranteed damage. They can also dish out delayed damage through optional systems like Hound Missiles and Atlas Missiles. Like other artillery mechs, Rainmakers are relatively vulnerable on their own.",
    "terse": "Artillery mech that can force enemies to avoid certain areas."
   },
   "stats": {
    "armor": 1,
    "hp": [
     10,
     12,
     14
    ],
    "evade": [
     8,
     10,
     12
    ],
    "edef": [
     8,
     10,
     12
    ],
    "heatcap": 8,
    "speed": 3,
    "sensor": 15,
    "save": [
     10,
     12,
     14
    ],
    "hull": 0,
    "agility": [
     0,
     1,
     1
    ],
    "systems": [
     2,
     3,
     3
    ],
    "engineering": [
     0,
     0,
     1
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "edef",
    "save",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_ronin",
   "name": "Ronin",
   "role": "striker",
   "info": {
    "flavor": "Ronin frames differ from those favored by Berserkers and Demolishers in that they aren’t retrofitted or improvised for creative tactical applications – they are purpose-built to excel in melee combat by boutique fabricators. Although they are seen as somewhat antique by many commentators, the rise of stasis- and mag-based defensive technologies has made Ronins more viable in modern combat.<br>Ronin are common among both martial cultures and performance-combat firms, where their superb melee abilities elevate them above the competition. They see less use in cultures that have a preference for ranged combat, but there is a certain prestige accorded to pilots who adopt ancient weapons and survive to do it again. The mythic lancer Susanoo elevated this archetype to legendary status when she endorsed the GRAMtech Strike-1 chassis, which she piloted alongside numerous Albatross wings during the Neo-Celestine Disappointment.",
    "tactics": "Ronins are no-nonsense, high-damage melee strikers. Rebound makes it dangerous for enemies to attack Ronins with ranged weapons, but they tend to suffer against armored enemies and are heavily reliant on Accuracy.",
    "terse": "Accuracy-dependent melee striker that can deal high damage."
   },
   "stats": {
    "armor": 0,
    "hp": [
     18,
     20,
     22
    ],
    "evade": [
     10,
     13,
     16
    ],
    "edef": 7,
    "heatcap": 7,
    "speed": [
     5,
     5,
     6
    ],
    "sensor": 10,
    "save": [
     10,
     13,
     15
    ],
    "hull": [
     1,
     2,
     4
    ],
    "agility": [
     2,
     4,
     5
    ],
    "systems": -1,
    "engineering": -1,
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "speed",
    "save",
    "hull",
    "agility"
   ],
   "features": []
  },
  {
   "id": "npcc_scourer",
   "name": "Scourer",
   "role": "striker",
   "info": {
    "flavor": "Scourer-class mechs are distinctive for carrying deadly Energy damage weapons powered by massive-output recursive power plants. These mechs are found across the galaxy in specialist roles, supporting conventional ground troops with powerful beam attacks that stop electronic threats as easily as they stop enemy soldiers.",
    "tactics": "Scourers deal a great deal of damage when they focus on single targets, attacking them multiple times. They can be used to crack tough or slow moving opponents very easily. However, they are much less effective when forced to switch targets, and need to stay still to make the most of their weapons.",
    "terse": "Striker that can deal high damage to single targets."
   },
   "stats": {
    "armor": 2,
    "hp": [
     10,
     13,
     15
    ],
    "evade": [
     8,
     9,
     10
    ],
    "edef": 8,
    "heatcap": [
     8,
     8,
     12
    ],
    "speed": 4,
    "sensor": 10,
    "save": [
     10,
     12,
     14
    ],
    "hull": [
     1,
     2,
     3
    ],
    "agility": [
     0,
     1,
     1
    ],
    "systems": [
     0,
     0,
     1
    ],
    "engineering": [
     1,
     2,
     4
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "heatcap",
    "save",
    "hull",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_scout",
   "name": "Scout",
   "role": "support",
   "info": {
    "flavor": "The most devastating mechanized-warfare strategies call for the active, close, and aggressive application of orbital, atmospheric, and terrestrial fire-support. Enter Scout-class mechs and their pilots. Using advanced targeting systems, Scouts are equal parts tactical coordinator and artillery commander, working with allies to map the battlescape and accurately place direct-targeted and autonomous fire.",
    "tactics": "Scouts are support mechs designed to increase the damage dealt by their allies. They deal no damage themselves, but Marker Rifle and Cloaking Field allow them to both keep allied characters alive and prevent enemies from hiding. They are especially adept at revealing Invisible characters but need to get close to their targets to take full advantage of this ability. Like most support mechs, Scouts aren’t especially resilient on their own.",
    "terse": "Support mech that can increase the damage dealt by allies and reveal Invisible characters."
   },
   "stats": {
    "armor": 0,
    "hp": 8,
    "evade": [
     12,
     15,
     18
    ],
    "edef": [
     10,
     13,
     16
    ],
    "heatcap": 6,
    "speed": [
     6,
     7,
     8
    ],
    "sensor": 20,
    "save": [
     11,
     13,
     15
    ],
    "hull": -2,
    "agility": [
     2,
     4,
     5
    ],
    "systems": [
     3,
     4,
     5
    ],
    "engineering": [
     -1,
     -1,
     0
    ],
    "size": [
     [
      0.5,
      1
     ],
     [
      0.5,
      1
     ],
     [
      0.5,
      1
     ]
    ],
    "activations": 1
   },
   "tiered": [
    "evade",
    "edef",
    "speed",
    "save",
    "agility",
    "systems",
    "engineering",
    "size"
   ],
   "features": []
  },
  {
   "id": "npcc_seeder",
   "name": "Seeder",
   "role": "controller",
   "info": {
    "flavor": "Seeder-archetype mechs are sappers, adept at deploying defensive nets of mines and traps. Laden with ordnance and bristling with sensor suites, Seeders operate in small teams: together, they blanket battlefields in traps and pitfalls, planting mines and other area-denial systems to guide the enemy into kill-boxes.",
    "tactics": "Seeders specialize in area denial, controlling enemy movement with their mines. Since Seeders can place a mine each turn, they can quickly turn part of the battlefield into a mess when left to their own devices. Allied characters don’t trigger Seeders’ mines, but are affected by them if they’re caught in the explosion. Seeders can take optional systems that force characters to spread out or take additional damage.",
    "terse": "Controller that can deny large areas to enemies."
   },
   "stats": {
    "armor": 2,
    "hp": [
     12,
     14,
     16
    ],
    "evade": [
     7,
     8,
     9
    ],
    "edef": [
     10,
     10,
     11
    ],
    "heatcap": 10,
    "speed": 4,
    "sensor": 15,
    "save": [
     12,
     15,
     18
    ],
    "hull": [
     0,
     1,
     2
    ],
    "agility": 0,
    "systems": [
     2,
     3,
     4
    ],
    "engineering": 0,
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "edef",
    "save",
    "hull",
    "systems"
   ],
   "features": []
  },
  {
   "id": "npcc_sentinel",
   "name": "Sentinel",
   "role": "defender",
   "info": {
    "flavor": "Sentinel archetypes are typically employed as guards and escorts, often in the retinues of commanders or posted in defense of artillery. These mechs and their pilots employ advanced suites of technology to ensure their wards stay alive and operational, even if that costs their own chassis – or lives. Unlike the heavier Bastion archetypes, Sentinels are quick and light: they practice active defense, preemptively striking with suites of advanced technical, systemic, and direct weaponry to protect their charges.",
    "tactics": "Sentinels are fast defenders that focus on protecting their allies with Overwatch. They are fairly short-range attackers, relying on positioning to get the most from their kit, and aren’t as resilient as other defenders.",
    "terse": "Fast, short-range defender that can protect allies with Overwatch."
   },
   "stats": {
    "armor": 1,
    "hp": [
     16,
     20,
     24
    ],
    "evade": [
     8,
     11,
     13
    ],
    "edef": [
     8,
     11,
     13
    ],
    "heatcap": 8,
    "speed": [
     5,
     5,
     6
    ],
    "sensor": 10,
    "save": [
     10,
     12,
     14
    ],
    "hull": [
     2,
     3,
     4
    ],
    "agility": [
     1,
     2,
     3
    ],
    "systems": [
     1,
     2,
     3
    ],
    "engineering": [
     1,
     2,
     3
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "edef",
    "speed",
    "save",
    "hull",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_sniper",
   "name": "Sniper",
   "role": "artillery",
   "info": {
    "flavor": "The reason some pilots haven’t seen a Sniper on the battlefield is that those pilots are dead. These mechs are built for stability, targeting, and extremely long-range  kinetic damage weapons at the cost of mobility, and they tend to operate in small, self-sufficient teams far removed from direct combat. Sniper pilots are a proud breed, emphasizing economy and elegance over destructive power.",
    "tactics": "Rightly feared, Snipers are devastating when it comes to dealing focused damage. Using Sniper’s Mark, they can deal direct structure damage, making short work of almost any character. Opponents can avoid this with clever use of cover, or by dropping Prone. Snipers’ main downside is that they need to be fairly stationary to do their best work, as their rifle requires a full action to fire.",
    "terse": "Long-range artillery mech that can deal direct structure damage."
   },
   "stats": {
    "armor": 0,
    "hp": [
     10,
     12,
     14
    ],
    "evade": [
     10,
     13,
     16
    ],
    "edef": [
     8,
     9,
     10
    ],
    "heatcap": 6,
    "speed": 4,
    "sensor": 15,
    "save": [
     11,
     13,
     15
    ],
    "hull": -2,
    "agility": [
     1,
     2,
     3
    ],
    "systems": [
     1,
     3,
     4
    ],
    "engineering": [
     1,
     1,
     2
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "edef",
    "save",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_specter",
   "name": "Specter",
   "role": "striker",
   "info": {
    "flavor": "The principle behind the development of Specter-archetype mechs is a simple one: not being hit is better than the strongest armor. Specters employ cutting-edge optical-electronic camouflage to vanish from the battlefield and enemy scans. They flicker in and out of vision, confusing the eye and the radar. That’s what makes them so deadly, though their weapons certainly help.",
    "tactics": "Specters are mobile strikers that shine against foes that make the mistake of being caught alone. Use Prowl along with their high Threat and Speed to get them across the front lines so they can find vulnerable solo targets, like snipers and artillery. Specters are permanently Invisible, which is key to their survivability; they aren’t very resilient, but they can Hide any time.",
    "terse": "Mobile striker that can deal high damage to solo targets."
   },
   "stats": {
    "armor": 0,
    "hp": 10,
    "evade": [
     10,
     14,
     18
    ],
    "edef": [
     8,
     10,
     12
    ],
    "heatcap": 7,
    "speed": [
     4,
     5,
     7
    ],
    "sensor": 5,
    "save": [
     10,
     12,
     14
    ],
    "hull": -2,
    "agility": [
     3,
     5,
     6
    ],
    "systems": [
     1,
     2,
     3
    ],
    "engineering": [
     0,
     1,
     1
    ],
    "size": 1,
    "activations": 1
   },
   "tiered": [
    "evade",
    "edef",
    "speed",
    "save",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_squad",
   "name": "Squad",
   "role": "biological",
   "info": {
    "flavor": "Although individual pilots and other non-mechanized soldiers might not present much of a threat to most mechs, a squad of infantry with the right gear and training can be dangerous in their own right.<br>Squads are exactly what they sound like: small groups of five to ten armed and armored soldiers represented as one character on the battlefield.",
    "tactics": "",
    "terse": "Small groups of five to ten armed and armored soldiers, represented as one character on the battlefield."
   },
   "stats": {
    "armor": 0,
    "hp": [
     10,
     15,
     20
    ],
    "evade": 8,
    "edef": 8,
    "heatcap": 0,
    "speed": 4,
    "sensor": 5,
    "save": [
     10,
     12,
     14
    ],
    "hull": [
     2,
     4,
     6
    ],
    "agility": [
     2,
     4,
     6
    ],
    "systems": [
     2,
     4,
     6
    ],
    "engineering": [
     2,
     4,
     6
    ],
    "size": 4,
    "activations": 1
   },
   "tiered": [
    "hp",
    "save",
    "hull",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_support",
   "name": "Support",
   "role": "support",
   "info": {
    "flavor": "Support-archetype mechs keep their allies alive and operational with a broad library of immediate triage systems, from basic flash-weld plating through to shallow–medium structural reinforcement packs and whitewash nanite slurry. From the famed Laughter of a Solemn God, working the front lines of Boundary Garden’s battlefields, to the precision actions undertaken by the rogue-world hunters of ExtraSolar Acquisitions, Inc., the efficacy of Support-archetype mechs is unparalleled when mech teams need to stay alive longer than deployment.",
    "tactics": "Supports are bulky mechs that can’t deal any damage but have access to powerful healing and condition-clearing effects. Despite their resilience, they have no way to defend themselves and need to get close to their allies in order to be effective. Savvy players will shoot and destroy their Restock Drones before they are activated, denying an opportunity for healing.",
    "terse": "Resilient support mech that can heal allies and clear conditions."
   },
   "stats": {
    "armor": 1,
    "hp": [
     15,
     18,
     22
    ],
    "evade": [
     8,
     10,
     12
    ],
    "edef": [
     8,
     10,
     12
    ],
    "heatcap": 8,
    "speed": 4,
    "sensor": 10,
    "save": [
     10,
     12,
     14
    ],
    "hull": 1,
    "agility": [
     -2,
     -1,
     -1
    ],
    "systems": [
     0,
     1,
     2
    ],
    "engineering": [
     2,
     4,
     6
    ],
    "size": 2,
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "edef",
    "save",
    "agility",
    "systems",
    "engineering"
   ],
   "features": []
  },
  {
   "id": "npcc_witch",
   "name": "Witch",
   "role": "controller",
   "info": {
    "flavor": "Witch-archetype chassis can always be found in the eye of a systemic storm, where they are adept at generating realspace and legionspace terrors to blanket battlefields. At any given time, they are likely to be operating in both the physical battlefield and the tempest of the omninet. To handle the chaotic swirl of inputs and outputs that results from this split perception, Witches often pair with personality-clone NHPs, splitting tasks along parallel tracks to increase combat efficacy.",
    "tactics": "Witches are no-nonsense controllers that use Tear Down to inflict heat and Blind to shut down ranged attackers. Predatory Logic gives them a tool to use against characters with heavy weapons, which can also aid their allies. Targets generally have an opportunity to mitigate their heat somewhat, since Witches deal most of their heat on their next turn.",
    "terse": "Controller that can inflict heat and Blind to shut down ranged attackers."
   },
   "stats": {
    "armor": 0,
    "hp": [
     12,
     14,
     14
    ],
    "evade": [
     10,
     12,
     14
    ],
    "edef": [
     13,
     16,
     20
    ],
    "heatcap": 8,
    "speed": 6,
    "sensor": [
     15,
     15,
     20
    ],
    "save": [
     12,
     15,
     18
    ],
    "hull": [
     -2,
     -1,
     -2
    ],
    "agility": [
     1,
     2,
     3
    ],
    "systems": [
     3,
     5,
     6
    ],
    "engineering": 0,
    "size": [
     [
      0.5,
      1
     ],
     [
      0.5,
      1
     ],
     [
      0.5,
      1
     ]
    ],
    "activations": 1
   },
   "tiered": [
    "hp",
    "evade",
    "edef",
    "sensor",
    "save",
    "hull",
    "agility",
    "systems",
    "size"
   ],
   "features": []
  }
 ]
};
