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
   "features": [
    {
     "name": "Bombing Bay",
     "type": "System",
     "text": "If the Ace is flying when they move or Boost, they may use the \"Drop Bomb\" action as a Free Action once per round. Drop Bomb: Cause a Blast 1 explosion that must overlap with at least 1 space occupied by the target. Characters within the affected area must succeed on an Agility save or take {6/8/10} Explosive damage and be knocked Prone."
    },
    {
     "name": "Strafe",
     "type": "Trait",
     "text": "Strafe: Fly {speed} in any direction, automatically dealing {3/4/6} Kinetic damage to one character below or adjacent to the path taken."
    },
    {
     "name": "Missile Swarm",
     "type": "Weapon",
     "text": "This weapon deals double damage to characters with Lock On and doesn’t affect allied characters. 3,4,5 Explosive · Burst 5"
    },
    {
     "name": "Rapid Response",
     "type": "Reaction",
     "text": "Rapid Response: You may Boost."
    },
    {
     "name": "Chaff Launchers",
     "type": "Trait",
     "text": "After using Barrel Roll, the Ace counts as being in soft cover until the end of their next turn; additionally, Barrel Roll can be used against tech attacks."
    }
   ]
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
   "features": [
    {
     "name": "Adaptive Shielding",
     "type": "Trait",
     "text": "The first time each round an ally affected by Defense Net takes damage, all allies within the Net gain Resistance to the damage type taken. This lasts until the end of the Aegis’ next turn."
    },
    {
     "name": "Guardian",
     "type": "Trait",
     "text": "Allied characters can use the Aegis for hard cover."
    },
    {
     "name": "Ring Of Fire",
     "type": "Trait",
     "text": "Any hostile characters that start their turn inside the area affected by the Defense Net or that enter it for the first time in a round take 2 heat and become Shredded until they leave the area."
    },
    {
     "name": "Hardlight Cover System",
     "type": "System",
     "text": ""
    },
    {
     "name": "Ha Blackwall System",
     "type": "System",
     "text": "Generate Blackwall: Generate a pitch-black wall of blinkspace 5 spaces high covering a Line 10 area starting within Range 5. All spaces must be free. The wall blocks line of sight, effects or attacks and provides hard cover. Characters that start their turn in the wall or who enter it on their turn roll 1d6. <br>On a 4+ they are removed from play until the end of their next turn, when they reappear in a free space of their choice in Range 10 of the wall. If there are no free spaces, they return when a space becomes free. <br>The wall lasts until you end it as a quick action, or you are destroyed. <br>When it ends, characters remaining in blinkspace reappear. Dismiss Blackwall: End the Blackwall effect."
    }
   ]
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
   "features": [
    {
     "name": "Blinding Shells",
     "type": "Trait",
     "text": "Once per round, after the Archer makes a successful attack, they force their target to make an Engineering save. On a failure, the target only has line of sight to adjacent spaces until their next turn ends."
    },
    {
     "name": "Impending Threat",
     "type": "Reaction",
     "text": ""
    },
    {
     "name": "Covering Fire",
     "type": "Trait",
     "text": ""
    },
    {
     "name": "Rapid Response",
     "type": "Reaction",
     "text": ""
    },
    {
     "name": "Hail Of Fire",
     "type": "Trait",
     "text": ""
    },
    {
     "name": "Moving Target (DEPRECATED)",
     "type": "Trait",
     "text": "This ability is now collected in the Suppress trait. This feature can be safely removed from your NPCs."
    },
    {
     "name": "Got Your Back (DEPRECATED)",
     "type": "Trait",
     "text": "This ability is now collected in the Covering Fire trait. This feature can be safely removed from your NPCs."
    }
   ]
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
   "features": [
    {
     "name": "“Devil’s Cough” Shotgun",
     "type": "Weapon",
     "text": "10,15,20 Kinetic · Range 3 Threat 3"
    },
    {
     "name": "Sap",
     "type": "Tech",
     "text": "Sap: You choose a character next to them: they must succeed on an Engineering save or be Stunned until the end of their next turn."
    },
    {
     "name": "Spinning Kick",
     "type": "Trait",
     "text": "Spinning Kick: You choose a character next to you: they must pass a Hull save or be pushed 4 spaces away from you and are knocked Prone."
    },
    {
     "name": "Cloud Projector",
     "type": "System",
     "text": "Cloud Projector: Set off a charge, creating a Burst 3 area of smoke, haze, or some other kind of concealing shroud. You gain soft cover within the affected area, and characters other than you fully inside or outside the area cannot draw line of sight into or out of the area. Characters partially within the area are not affected. This effect lasts until the end of your next turn, or until you uses this system again."
    },
    {
     "name": "Explosive Knives",
     "type": "System",
     "text": "Throw Explosive Knife: Expend a charge to throw an Explosive damage knife at a character within range 3, making a ranged attack at +{2/4/6}. On a hit, the knife embeds itself in the target and explodes at the end of their next turn, dealing {6/8/10} Explosive damage in a Burst 1 area."
    }
   ]
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
   "features": [
    {
     "name": "Underslung Grenade Launcher",
     "type": "Weapon",
     "text": "4,6,8 Explosive · Range 8 Blast 2"
    },
    {
     "name": "Micro-Missile Barrage",
     "type": "Trait",
     "text": "Micro-Missile Barrage: Launch a Line 8 volley of micro-missiles. All characters within a Line 8 area must succeed on a Hull save or take {6/8/10} kinetic damage. On a successful save, they take half damage."
    },
    {
     "name": "High Impact Rounds",
     "type": "System",
     "text": "These high-caliber rounds can only be used with the Heavy Assault Rifle. When firing with these rounds, the Assault’s attacks become AP and deal +4 kinetic damage, but the Heavy Assault Rifle must be reloaded before it is used again (as though it was Loading)."
    },
    {
     "name": "Auto-Targeting",
     "type": "Trait",
     "text": "The Assault ignores cover when attacking, although they still require line of sight."
    },
    {
     "name": "Rank Discipline",
     "type": "Trait",
     "text": "The Assault gains +1 Accuracy on all attacks, checks, and saves while adjacent to at least one allied character with the Mech tag."
    }
   ]
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
   "features": [
    {
     "name": "Drag Down",
     "type": "Tech",
     "text": "Drag Down: Make a tech attack against a character within Sensors. On a success, they take 2 AP Energy damage per space that they voluntarily move until the end of their next turn."
    },
    {
     "name": "Seismic Repulsor",
     "type": "System",
     "text": "Seismic Repulsor: All non-flying characters within a Burst 3 area must pass a Hull save or be knocked 3 spaces back from the Barricade and knocked Prone. The affected area becomes difficult terrain for the rest of the scene."
    },
    {
     "name": "Extrudite",
     "type": "Trait",
     "text": "The Barricade can print two separate cubes at a time with Mobile Printer, instead of one."
    },
    {
     "name": "Hunger/Pursuit Limpets",
     "type": "System",
     "text": "Deploy Hunger/Pursuit Limpets: You rapidly print and deploy a field of tiny, mobile mines in a free Size 4 area adjacent to you. The affected area becomes difficult terrain; additionally, hostile characters that enter the area for the first time in a round or start their turn there must succeed on a Systems save or be Slowed until the end of their next turn."
    },
    {
     "name": "Titan-Snare Drone",
     "type": "System",
     "text": ""
    }
   ]
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
   "features": [
    {
     "name": "Near-Threat Denial System",
     "type": "System",
     "text": "When characters within range 3 attack the Bastion, they take {2/3/4} AP Explosive damage before rolling."
    },
    {
     "name": "Siege Guardian",
     "type": "Trait",
     "text": "Allied characters gain Resistance to damage from Blast, Burst, Line, and Cone attacks while they’re adjacent to the Bastion."
    },
    {
     "name": "“Pause” Engine",
     "type": "System",
     "text": "Activate Pause Engine: You and one adjacent allied character are temporarily shielded by a flickering pane of portable blinkspace, gaining Immunity to all damage and effects until the start of you’s next turn. The allied character loses Immunity if it breaks adjacency. At the start of your next turn, they become Stunned until the start of their following turn."
    },
    {
     "name": "Fearless Defender",
     "type": "Reaction",
     "text": "Fearless Defender: Move to an adjacent space and take the damage instead."
    },
    {
     "name": "Deathcounter",
     "type": "System",
     "text": "The first time the Bastion is successfully hit by a ranged or melee attack each round, all damage is reduced to 0."
    }
   ]
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
   "features": [
    {
     "name": "Juggernaut",
     "type": "Trait",
     "text": "When the Berserker uses Avalanche Charge, all characters adjacent to the path they follow or adjacent to their final position – hostile and allied – must succeed on a Hull save or be knocked Prone."
    },
    {
     "name": "Harpoon Cannon",
     "type": "Weapon",
     "text": "2,4,6 Kinetic · Range 5 Threat 3"
    },
    {
     "name": "Nail Gun",
     "type": "Weapon",
     "text": "5,7,9 Kinetic · Range 5 Threat 3"
    },
    {
     "name": "Retribution",
     "type": "Trait",
     "text": "Whenever the Berserker takes damage, their next attack deals +{2/3/4} bonus damage. This bonus stacks up to +8. Bonuses are lost when the Berserker attacks, or at the end of their next turn."
    },
    {
     "name": "Superhot",
     "type": "Reaction",
     "text": "Superhot: You gain Resistance to the attack’s damage and the attacker must succeed on an Engineering save or take {2/4/6} Burn."
    }
   ]
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
   "features": [
    {
     "name": "High-Impact Shells",
     "type": "Trait",
     "text": "On a hit, the Bombard Cannon knocks targets 3 spaces away from the Bombard."
    },
    {
     "name": "Bunker Buster",
     "type": "Trait",
     "text": "The Bombard Cannon deals {10/15/20} AP Explosive damage to objects and terrain in the affected area, no roll required."
    },
    {
     "name": "Flare Drone",
     "type": "System",
     "text": ""
    },
    {
     "name": "Repeater Cannon",
     "type": "Weapon",
     "text": "3,4,5 Explosive · Cone 5"
    },
    {
     "name": "Cluster-Seeker Bombs",
     "type": "Trait",
     "text": "When the Bombard attacks with the Bombard Cannon, three characters of their choice within range 3 of the targeted space take {2/3/4} Explosive damage, hit or miss."
    }
   ]
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
   "features": [
    {
     "name": "Painmaker",
     "type": "Trait",
     "text": "Painmaker: Choose a character within range 3. Their next turn is delayed until after their target’s. At the start of your turn, if the target is still within range 3, you may attack them four times with Dual Shotguns – instead of twice – as a free action."
    },
    {
     "name": "Superior Ram",
     "type": "Trait",
     "text": "When using Breach Ram the Breacher moves 4 more spaces, and targets have +1 Difficulty on the Agility save."
    },
    {
     "name": "Follower Count",
     "type": "Tech",
     "text": "Follower Count: Make a tech attack against a character within Sensors. On a success, you gain +{1/2/3} Accuracy on all attacks against your target, and may Boost once per turn as a free action so long as it moves you directly towards their target. This lasts until either character is destroyed and cannot be changed to a new target."
    },
    {
     "name": "Thermal Charge",
     "type": "System",
     "text": "Thermal Charge: Throw a grenade to a space within range 5. Characters in the ensuing Blast 2 explosion take {2/4/6} Burn if they fail an Agility save, half on a success. Objects, terrain, and Deployables take {10/20/30} AP kinetic damage."
    },
    {
     "name": "Flechette Shot",
     "type": "Weapon",
     "text": "Attacks with this weapon take the form of a Cone 3 shrapnel attack starting from the edge of the targeted space, attacking all characters within both the targeted space and the affected area. The Cone cannot change directions. 2,3,4 Kinetic · Range 3 Cone 3 Threat 3"
    }
   ]
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
   "features": [
    {
     "name": "Electrified Lasso",
     "type": "System",
     "text": "Lasso: A character in line of sight and range 5 must make a Hull save. On a failure, they are pulled as close as possible to you; if they become adjacent, you automatically grapple them."
    },
    {
     "name": "Lance Shot",
     "type": "System",
     "text": "Lance Shot: You fire an electrified lance in a Line 5 path. All characters within a Line 5 must succeed on an Engineering save or become Jammed until the end of their next turn."
    },
    {
     "name": "Electrified Bola",
     "type": "System",
     "text": "Electrified Bola: A flying character in Range 10 must make an Agility save. On a failure, they land immediately and become Immobilized until the end of their next turn. This counts as falling but without damage."
    },
    {
     "name": "Capacitor Discharge",
     "type": "Trait",
     "text": "As long as the Cataphract isn’t Slowed or Immobilized, they gain Resistance to Energy damage and heat. At the end of the Cataphract’s turn, all characters adjacent to them take {2/3/4} Heat."
    },
    {
     "name": "Charge",
     "type": "Trait",
     "text": "Charge: Move {SPEED} spaces in a straight line, ignoring reactions and engagement, then attack a target within Range with the Ram Cannon."
    }
   ]
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
   "features": [
    {
     "name": "Broad-Sweep Haft",
     "type": "System",
     "text": "Broad-Sweep: You swing the Demolition Hammer in a Burst 2 arc instead of attacking normally. Roll melee attacks against any characters of your choice within the affected area. On hit, targets take {4/6/8} Explosive damage and become Impaired until the end of their next turn."
    },
    {
     "name": "Kinetic Compensation",
     "type": "Trait",
     "text": "Each time the Demolisher misses with the Demolition Hammer, they gain +1 Accuracy on all subsequent attacks until their next hit. This Accuracy can be gained multiple times, and stacks."
    },
    {
     "name": "Concussion Missiles",
     "type": "System",
     "text": "Concussion Missiles: All characters of your choice in line of sight and range 5 must succeed on a Hull save or become Slowed and Impaired until the end of their next turn."
    },
    {
     "name": "Seismic Destroyer",
     "type": "System",
     "text": "Seismic Destroyer: Unless they can fly, all characters in a Cone 3 or Line 5 area must succeed on an Agility save or be Stunned until the end of their next turn."
    },
    {
     "name": "Sap",
     "type": "Tech",
     "text": "Sap: Choose an adjacent character: they must succeed on an Engineering save or be Stunned until the end of their next turn."
    }
   ]
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
   "features": [
    {
     "name": "Power Deployer",
     "type": "Trait",
     "text": "The Engineer can deploy two turrets at a time with Deployable Turrets. If they do so, the system counts as Recharge 4+ until it next recharges."
    },
    {
     "name": "Skyshield Protocol",
     "type": "Trait",
     "text": "Deployable Turrets gain +2 Accuracy against flying targets."
    },
    {
     "name": "Shepherd Field",
     "type": "Trait",
     "text": "Drones, objects, and pieces of cover gain Resistance to all damage while next to the Engineer."
    },
    {
     "name": "Mobile Turrets",
     "type": "Trait",
     "text": "At the start of the Engineer’s turn, they can move all deployable turrets up to 3 spaces in any direction."
    },
    {
     "name": "Arsenal",
     "type": "Trait",
     "text": "Deployable Turrets can be deployed as Inferno, Hellstorm, Hunter, or Primed Turrets."
    }
   ]
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
   "features": [
    {
     "name": "Power Knuckle",
     "type": "System",
     "text": "Power Knuckle: A character within range 2 must pass a Hull save or take {4/5/6} Kinetic damage, be pushed 5 spaces directly away from you, and are knocked Prone."
    },
    {
     "name": "Pin",
     "type": "Trait",
     "text": "Pin: A character within range 2 becomes Immobilized and Impaired until they either damage you, you are Stunned or destroyed, or you target another character with this effect. You are Immobilized for the duration of this effect."
    },
    {
     "name": "Crushing Embrace",
     "type": "Trait",
     "text": "Crushing Embrace: A character adjacent to you must succeed on an Agility save or automatically be grappled by you and become Jammed until they are no longer grappled. You can only grapple one character this way at a time."
    },
    {
     "name": "Watchful Guardian",
     "type": "Trait",
     "text": "Allied characters that benefit from the cover provided by the Goliath gain Resistance to all damage."
    },
    {
     "name": "Retribution",
     "type": "Trait",
     "text": "Whenever the Goliath takes damage, their next attack deals +{2/3/4} bonus damage. This bonus stacks up to +8. Bonuses are lost when the Goliath attacks, or at the end of their next turn."
    }
   ]
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
   "features": [
    {
     "name": "Electro-Nanite Cloud",
     "type": "System",
     "text": "At the start of their turn, hostile characters within range 3 take 2 Burn; additionally, until they move beyond range 3, they make all System checks and saves, and all tech attacks, at +{1/2/3} difficulty."
    },
    {
     "name": "Motile Swarm",
     "type": "Trait",
     "text": "At the start of the Hive’s turn, they may move all razor swarms up to 2 spaces in any direction, including into spaces occupied by other characters."
    },
    {
     "name": "Driving Swarm",
     "type": "Trait",
     "text": "Whenever characters take Burn from a razor swarm, they must succeed on a Systems save or immediately move 4 spaces in a direction chosen by the Hive after taking damage. This movement ignores engagement and does not provoke reactions."
    },
    {
     "name": "Grind Maniple",
     "type": "Tech",
     "text": "The Hive releases a swarm of tiny, hard to hit drones that make a tech attack against a hostile character within Sensors and line of sight. On hit, the drones clamp on, causing them to take 2 Burn each time they take any action or reaction until the end of their next turn. Grind Maniple: Make a tech attack against a hostile character within Sensors and line of sight. On hit, they take 2 Burn each time they take any action or reaction until the end of their next turn."
    },
    {
     "name": "Seeker Cloud",
     "type": "Weapon",
     "text": "Characters damaged by this weapon gain Lock On. 3,4,5 Kinetic · Cone 5"
    }
   ]
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
   "features": [
    {
     "name": "Adapt/Evade/Disengage",
     "type": "Trait",
     "text": "The Hornet gains Immunity to Grapple and always ignores engagement."
    },
    {
     "name": "Umbral Interdiction",
     "type": "Reaction",
     "text": "Umbral Interdiction: The target must pass a Systems check or their attack automatically misses."
    },
    {
     "name": "Supersonic",
     "type": "Trait",
     "text": "Supersonic: You fly to a space in line of sight and range 50 so impossibly fast that it counts as teleportation."
    },
    {
     "name": "Hex Missiles",
     "type": "Weapon",
     "text": "3,4,5 Heat · Range 10 Blast 1"
    },
    {
     "name": "Lock/Hold Javelins",
     "type": "System",
     "text": "Lock/Hold Javelins: Fire a javelin at a character within range 5 and line of sight. The target must succeed on a Hull save or be impaled, at which point the javelin tethers itself and its victim to the ground (or another surface), rendering them Immobilized and Shredded. They, or any adjacent character, can attempt to remove the javelin with a successful Hull save as a full action; otherwise, this effect lasts for the rest of the scene or until you take this action again."
    }
   ]
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
   "features": [
    {
     "name": "Ranged Weapon",
     "type": "Weapon",
     "text": "1,2,3 Kinetic · Range 5"
    },
    {
     "name": "Melee Weapon",
     "type": "Weapon",
     "text": "1,2,3 Kinetic · Threat 1"
    },
    {
     "name": "Anti-Armor Weapon",
     "type": "Weapon",
     "text": "3,4,5 variable · Range 8"
    },
    {
     "name": "Veteran",
     "type": "Trait",
     "text": "+{2/4/6} HP"
    },
    {
     "name": "Armored",
     "type": "Trait",
     "text": "+1 Armor"
    },
    {
     "name": "Armored (Enhanced)",
     "type": "Trait",
     "text": "+2 Armor"
    }
   ]
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
   "features": [
    {
     "name": "Illusory Subroutines",
     "type": "Tech",
     "text": "Illusory Subroutines: Make a tech attack against a target within Sensors. On a success, the target treats all characters allied to you as Invisible until the start of their next turn."
    },
    {
     "name": "Warp Targeting",
     "type": "Trait",
     "text": "All allied characters within range 50 benefit from soft cover. If the Mirage takes damage, this effect ends until the start of their next turn."
    },
    {
     "name": "Metafold Shove",
     "type": "Tech",
     "text": "Metafold Shove: Make a tech attack against a hostile character within range 5. On a success, the target swaps position with an allied character within your line of sight and chosen by you, both teleporting. Flying characters can’t be swapped with characters that aren’t flying, and vice versa."
    },
    {
     "name": "Manifest False Idols",
     "type": "Tech",
     "text": ""
    },
    {
     "name": "Multiplicity",
     "type": "Reaction",
     "text": "Multiplicity: The attacker must make a Systems save. On a failure, your ally gains Immunity to the attack’s damage and effects and may teleport up to 5 spaces in the direction of their choice."
    },
    {
     "name": "Blip (DEPRECATED)",
     "type": "Reaction",
     "text": "This ability is now collected in the Glitch Scanners trait. This feature can be safely removed from your NPCs."
    }
   ]
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
   "features": [
    {
     "name": "Acid Spittle",
     "type": "Weapon",
     "text": "3,4,5 Energy · Range 10"
    },
    {
     "name": "Adhesive Secretions",
     "type": "Trait",
     "text": "The first character damaged by the Monstrosity each turn must succeed on an Engineering save or become Slowed. This effect lasts until the target regains any HP, or for the rest of the scene."
    },
    {
     "name": "Burrower",
     "type": "Trait",
     "text": "Burrow: Burrow into the ground, as long as the surface is sufficiently malleable. While burrowed, the Monstrosity counts as Invisible, and can freely move through spaces occupied by characters and other obstructions; however, it can only move, Boost, or emerge into a free space (via the \"Emerge\" quick action).  Emerge: Cannot be used unless Burrowed. While Burrowed, emerge into a free space. All characters adjacent must succeed on a Hull save or be knocked Prone."
    },
    {
     "name": "Corrosive Bite",
     "type": "Trait",
     "text": "Corrosive Bite: A character adjacent to you must succeed on a Hull save or take {4/5/6} Burn. Succeed or fail, they become Shredded until they regain any HP."
    },
    {
     "name": "Grasping Claws",
     "type": "Trait",
     "text": "The Monstrosity gains +1 Accuracy to Grapple, +1 Accuracy when attacking targets Grappled by it, and gains the ability to Boost and take reactions while grappling."
    },
    {
     "name": "Natural Camouflage",
     "type": "Trait",
     "text": "The Monstrosity is Invisible while adjacent to any terrain or cover, and treats soft cover as hard cover."
    },
    {
     "name": "Rampage",
     "type": "Trait",
     "text": "Rampage: Move {SPEED} in a straight line, ignoring reactions and engagement and moving freely through spaces occupied by other characters. Characters passed through or adjacent to must succeed on an Agility save or take {4/6/8} kinetic damage."
    },
    {
     "name": "Regenerator",
     "type": "Trait",
     "text": "At the end of its turn, the Monstrosity regains 1/4 of its total HP. It doesn’t regain any HP if it has taken Energy damage during the same round."
    },
    {
     "name": "Spined",
     "type": "Trait",
     "text": "After the Monstrosity takes damage from a melee weapon, it automatically deals {1/2/3} AP kinetic damage to the attacker."
    },
    {
     "name": "Swift",
     "type": "Trait",
     "text": "Once per round, the Monstrosity can Boost during its turn as a free action. Swift: Boost during your turn as a free action."
    },
    {
     "name": "Tempered Hide",
     "type": "Trait",
     "text": "The Monstrosity gains Resistance to any two of the following damage types: kinetic damage, Energy damage, and Explosive damage. If it is reduced to half of its total HP or less, it loses this Resistance. If it has any Structure, it regains Resistance when its HP returns to full."
    },
    {
     "name": "Winged",
     "type": "Trait",
     "text": "The Monstrosity may fly whenever it moves, and doesn’t need to land at the end of movements."
    }
   ]
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
   "features": [
    {
     "name": "Fade Generator",
     "type": "System",
     "text": "At the end of the Operator’s turn, they become Invisible until the start of their next turn. This immediately ceases if they take damage or make a reaction."
    },
    {
     "name": "Telefrag",
     "type": "Trait",
     "text": "Telefrag: Teleport into a space occupied by another character within line of sight and range 15. The target must succeed on an Agility save or take {4/8/12} AP Energy damage and become Jammed until the end of their next turn. On a successful save, they take half damage and aren’t Jammed. Succeed or fail, you take 1d6 AP Energy damage and are placed into a free space next to the target."
    },
    {
     "name": "Fortress",
     "type": "Trait",
     "text": "The Operator gains +3 Accuracy on Systems saves, and tech attacks against them receive +3 difficulty."
    },
    {
     "name": "Skirmisher",
     "type": "Trait",
     "text": "Once per turn, at any point during the Operator’s turn, they may Boost as a free action. Skirmisher: Boost during your turn as a free action."
    },
    {
     "name": "Nova Missiles",
     "type": "Weapon",
     "text": "4,6,8 Energy · Range 15 Blast 1"
    }
   ]
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
   "features": [
    {
     "name": "Greater Investiture",
     "type": "Trait",
     "text": "Investiture gives its target Resistance to all damage, but the Priest becomes Immobilized while linked."
    },
    {
     "name": "Empowered Shield",
     "type": "Trait",
     "text": "Dispersal Shield also grants Overshield {5/6/8}."
    },
    {
     "name": "Sanctuary",
     "type": "Tech",
     "text": "Sanctuary: Choose an allied character within Sensors. Before attacking the target, characters must first pass a Systems save. On a failure, the target cannot be targeted again by the attacker until the start of that character’s next turn."
    },
    {
     "name": "Fortress",
     "type": "Trait",
     "text": "Hardened Target gives +3 Accuracy on Systems saves and deals +3 difficulty on tech attacks, instead of +1."
    },
    {
     "name": "Fractal Assault",
     "type": "Reaction",
     "text": "Fractal Assault: The attacker makes a System save. If it fails, they’re Stunned until the end of their next turn."
    }
   ]
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
   "features": [
    {
     "name": "Unshielded Reactor",
     "type": "Trait",
     "text": "Characters that start their turn adjacent to the Pyro or become adjacent to the Pyro for the first time on their turn take {2/3/4} Heat."
    },
    {
     "name": "Siege Armor",
     "type": "Trait",
     "text": "The Pyro has Resistance to all damage from attacks that originate beyond range 3."
    },
    {
     "name": "Napalm Bomb",
     "type": "Weapon",
     "text": "3,4,5 Burn 2,4,6 Heat · Range 5 Blast 1"
    },
    {
     "name": "Superhot",
     "type": "Reaction",
     "text": "Superhot: You gain Resistance to all damage from the attack. The attacker must pass an Engineering save or take {2/4/6} Burn."
    },
    {
     "name": "Explosive Jet",
     "type": "System",
     "text": "Superhot: Enemies within Burst 2 must succeed on a Hull save or be knocked outside of the area and knocked Prone. You then flie 5 spaces in any direction, but must land after completing that move."
    }
   ]
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
   "features": [
    {
     "name": "Hades Missiles",
     "type": "System",
     "text": "Hades Missiles: All characters in a Cone 3 area starting within range 20 of you take {4/6/8} Energy damage and 2 heat, half if they pass an Agility save. This system doesn’t need line of sight, just a possible route to the target."
    },
    {
     "name": "Hound Missiles",
     "type": "System",
     "text": ""
    },
    {
     "name": "Endless Rain",
     "type": "Trait",
     "text": "The Rainmaker picks 6 spaces for Javelin Rockets, not 3."
    },
    {
     "name": "Volley",
     "type": "System",
     "text": "Volley: Pick characters in range 20 and line of sight. They take {4/6/8} Explosive damage, half if they pass an Agility save."
    },
    {
     "name": "Atlas Missiles",
     "type": "System",
     "text": "Atlas Missiles: Choose a space of ground in line of sight and Range 30, obvious to all characters with line of sight to the space. You launche a missile that lands at the end of the next round making a Blast 2 explosion; affected characters take {16/20/24} Explosive damage, half if they pass an Agility save."
    }
   ]
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
   "features": [
    {
     "name": "Charged Slash",
     "type": "System",
     "text": "Charged Slash: All characters adjacent to the You take {6/9/12} kinetic damage, half if they pass an Agility save."
    },
    {
     "name": "Chaff Launchers",
     "type": "Trait",
     "text": "The Ronin gains soft cover until the start of their next turn whenever they Boost."
    },
    {
     "name": "Echo Edge",
     "type": "Trait",
     "text": "Characters damaged by the Ronin gain a Ronin’s Mark. At the start of the Ronin’s turn, the Ronin can clear all Ronin’s Marks as a free action, automatically dealing 1d6 AP Kinetic damage to all characters that have a Ronin’s Mark cleared in this way."
    },
    {
     "name": "Instinct Mode",
     "type": "System",
     "text": "Instinct Mode: Until the end of your next turn, the first time each turn that they are targeted by an attack, you may first use the Carbon Fiber Sword to attack a character within Range as a reaction."
    },
    {
     "name": "Extended Blade",
     "type": "System",
     "text": "The Ronin’s Carbon Fiber Sword becomes Threat 3. The first time each turn that the Ronin performs a critical hit with it, all characters within Threat take {2/3/4} kinetic damage – including the target. Threat 1"
    }
   ]
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
   "features": [
    {
     "name": "Supercharged",
     "type": "Trait",
     "text": "Characters affected by Focus Down are also Shredded and Slowed until the end of their next turn."
    },
    {
     "name": "Emergency Vent",
     "type": "Trait",
     "text": "When the Scourer exceeds their Heat Cap or becomes Stunned, they become Invisible until the start of their next turn."
    },
    {
     "name": "Pulse Laser",
     "type": "Weapon",
     "text": "4 Energy · Line 10"
    },
    {
     "name": "Flash Lens",
     "type": "System",
     "text": "Flash Lens: All characters in a Cone 5 area drawn from you must pass a Systems save or become Jammed until the start of your next turn."
    },
    {
     "name": "Melt",
     "type": "System",
     "text": "Melt: Make a ranged attack against an object, deployable or Drone within Range 10, dealing 20 AP Energy damage on a success."
    }
   ]
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
   "features": [
    {
     "name": "System Flayer",
     "type": "Trait",
     "text": "Characters that fail to save against Rebound Scan also receive Lock On and take {2/3/4} Heat. 2,3,4 Heat"
    },
    {
     "name": "Spotter",
     "type": "Trait",
     "text": "While adjacent to the Scout, allied characters gain +1 Accuracy on all attack rolls."
    },
    {
     "name": "Expose Weakness",
     "type": "Trait",
     "text": "Characters that are successfully attacked with the Marker Rifle take +{4/6/8} bonus damage the next time they are successfully hit with a ranged or melee attack. If it isn’t triggered, this effect lasts for the rest of the scene."
    },
    {
     "name": "Dataveil",
     "type": "System",
     "text": "By default, the Scout is Invisible and can transfer this status to another character within line of sight as a quick action. When they do so, the Scout ceases to be Invisible, and only regains the status when they transfer it back as a quick action or transfer it to another character; otherwise, this effect lasts until the Scout is destroyed. Transfer Dataveil: Transfer your Dataveil to another character within line of sight, or a transferred Dataveil back to you. While a character has the Dataveil they are Invisible. This effect lasts until you are destroyed."
    },
    {
     "name": "Orbital Strike",
     "type": "System",
     "text": "Orbital Strike: Choose a space on the ground, within line of sight and range 20; all characters know that it has been chosen. At the end of the next round, characters in a Burst 2 area must make Agility saves. On a fail, they take {12/16/20} Energy damage and are knocked Prone. On a pass, they take half damage and remain standing."
    }
   ]
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
   "features": [
    {
     "name": "Hopping Mines",
     "type": "Trait",
     "text": "Mines deployed with Lay Mines also activate when hostile characters fly or move up to 10 spaces above them, jumping up to 10 spaces high to detonate next to the first character they run into."
    },
    {
     "name": "Tripwires",
     "type": "Trait",
     "text": "Lay Mines gains Recharge 5+. Mines deployed with Lay Mines now occupy a Line 3 area and detonate from the closest space when hostile characters move into or across the affected area."
    },
    {
     "name": "Speed Deployer",
     "type": "Trait",
     "text": "Lay Mines deploys two mines at a time, not one."
    },
    {
     "name": "Grav Spike",
     "type": "System",
     "text": "Grav Spike: A character within line of sight and range 5 must succeed on a Systems save, or a grav spike attaches itself to them. You can detonate all grav spikes as a protocol, causing targets to automatically take {4/6/8} AP Explosive damage and be pulled 3 spaces in a direction chosen by you. A quick action and passed Systems save removes a grav spike. Detonate Grav Spikes: Detonates all grav spikes attached to characters, causing them to automatically take {4/6/8} AP Explosive damage and be pulled 3 spaces in a direction chosen by the Seeder."
    },
    {
     "name": "Det Spike",
     "type": "System",
     "text": "Det Spike: Up to three characters in line of sight and range 5 must succeed on an Systems save, or a det spike attaches itself to them. At the start of your next turn, all det spikes detonate, creating Burst 1 explosions that deals {3/5/7} Explosive damage to all affected characters. Characters can take damage from more than one spike if the affected areas overlap. Detonate Det Spikes: Detonates all det spikes attached to characters, creating Burst 1 explosions that deals {3/5/7} Explosive damage to all affected characters. Characters can take damage from more than one spike if the affected areas overlap."
    }
   ]
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
   "features": [
    {
     "name": "Punisher Ammunition",
     "type": "Trait",
     "text": "Characters damaged by the Sentinel’s Overwatch attacks also become Slowed until the end of their next turn."
    },
    {
     "name": "Wrath-Lock",
     "type": "System",
     "text": "The Sentinel arms this system. Once armed, the Sentinel attacks twice the next time they attack with their Combat Shotgun, instead of one. Arm Wrath-Lock: The next time an attack action is made with the Combat Shotgun, it attacks twice instead of once."
    },
    {
     "name": "Impaler",
     "type": "System",
     "text": "Once per round, when the Sentinel hits with Overwatch, their target must pass a Hull save or become Immobilized and Jammed until the end of their next turn."
    },
    {
     "name": "Rapid Response",
     "type": "Reaction",
     "text": "Rapid Response: After the movement you may Boost."
    },
    {
     "name": "Bodyguard",
     "type": "Reaction",
     "text": "Mark Ward: Choose an allied character within range 5 as their ward and gain the Reflexive Blow reaction. Reflexive Blow: You first attacks the inciting character with Overwatch."
    },
    {
     "name": "Reflexive Blow (DEPRECATED)",
     "type": "Reaction",
     "text": "This ability is now collected in the Bodyguard trait. This feature can be safely removed from your NPCs."
    }
   ]
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
   "features": [
    {
     "name": "Selective Loader",
     "type": "System",
     "text": "The Sniper can choose a special ammunition type before attacking with the Anti-Materiel Rifle. Attacks made with this ammunition function as usual, with an additional effect on a successful attack.<br>The Sniper may choose from the following:<ul><li>Electromagnetic: Targets must must pass an Systems save or become Jammed until the end of their next turn.</li><li>Flare: Targets lose Hide or Invisible and cannot gain those statuses until the end of their next turn.</li><li>Impact: Targets must pass an Hull save or be knocked Prone.</li><li>Molten: Targets must pass an Engineering save or become Shredded until the end of their next turn.</li></ul>"
    },
    {
     "name": "Defensive Grapple",
     "type": "System",
     "text": "Defensive Grapple: Pull yourself to any point within range 5 with a grappling hook as though you are flying. Relocation: You use Defensive Grapple."
    },
    {
     "name": "Relocation (DEPRECATED)",
     "type": "Reaction",
     "text": "This ability is now collected in the Defensive Grapple trait. This feature can be safely removed from your NPCs."
    },
    {
     "name": "Shroud Charge",
     "type": "System",
     "text": "Shroud Charge: Set off a charge, creating a Burst 3 area of smoke, haze, or some other kind of concealing shroud. You gains soft cover within the affected area, and characters other than you cannot draw line of sight into or out of the area. Characters partially within the area have line of sight to characters within and outside the area.<br>This effect lasts until the end of your next turn, or until you use this system again."
    },
    {
     "name": "Moving Target",
     "type": "Reaction",
     "text": "Moving Target: Interrupt the movement. The character must either give up the triggering action/movement, or be immediately attacked by you using the Anti-materiel Rifle. If the rifle isn’t loaded, you instead reload it."
    },
    {
     "name": "Deadmetal Rounds",
     "type": "System",
     "text": "If Deadmetal Rounds have been loaded, the next attack made with this weapon becomes Line 20. Load Deadmetal Round: Load the Anti-Materiel Rifle with a special, over-penetrating round: the next attack they make with it becomes line 20."
    }
   ]
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
   "features": [
    {
     "name": "Fortress",
     "type": "Trait",
     "text": "The Specter gains +3 Accuracy on Systems saves, and tech attacks against them receive +3 difficulty."
    },
    {
     "name": "Drain Systems",
     "type": "Tech",
     "text": "Drain Systems: Make a tech attack against an adjacent character. On a success, the target becomes Stunned. This effect lasts until a character other than you starts their turn adjacent to the target or moves adjacent to the target."
    },
    {
     "name": "Step",
     "type": "Trait",
     "text": "Step: Teleport to a free space within line of sight and range 50."
    },
    {
     "name": "Machine Pistol",
     "type": "Weapon",
     "text": "2 Kinetic · Range 5 Threat 3"
    },
    {
     "name": "Weakness Analyzer",
     "type": "System",
     "text": "When the Specter starts the turn Hidden, their next attack (while Hidden) gains +{1/2/3} Accuracy and deals +1d6 Kinetic damage on a critical hit."
    }
   ]
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
   "features": [
    {
     "name": "Armored",
     "type": "Trait",
     "text": "The Squad gains +1 Armor."
    },
    {
     "name": "Ambushers",
     "type": "Trait",
     "text": "The Squad gains +2 Accuracy on all attacks, saves, and checks during the first round of combat."
    },
    {
     "name": "Duck And Cover",
     "type": "Reaction",
     "text": "When the Squad is hit by an attack, they gain Resistance to the damage but becomes Immobilized until the end of their next turn. Duck And Cover: Gain Resistance to the damage but becomes Immobilized until the end of their next turn."
    },
    {
     "name": "Rapid Insertion",
     "type": "Trait",
     "text": "The Squad may fly whenever it moves or Boosts."
    },
    {
     "name": "Disciplined",
     "type": "Trait",
     "text": "Losing HP doesn’t affect the number of attacks the Squad can make each turn."
    }
   ]
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
   "features": [
    {
     "name": "Remote Reboot",
     "type": "Trait",
     "text": "Remote Reboot: Clear any two of the following conditions currently affecting an allied character in range 5: Impaired, Jammed, Stunned, and Slowed."
    },
    {
     "name": "Empowered Cloud",
     "type": "Trait",
     "text": "When they start their turn adjacent to the Support, allied characters may clear one condition."
    },
    {
     "name": "Remote Cloud",
     "type": "System",
     "text": "Remote Cloud: You release a Blast 2 nanite cloud within range 5. Allied characters that start their turn in the area or move into it for the first time on their turn regain {2/4/6} HP. The cloud disperses at the start of your next turn."
    },
    {
     "name": "Defensive Pulse",
     "type": "System",
     "text": "Defensive Pulse: All allied characters within range 3 clear Jammed and Lock On."
    },
    {
     "name": "Latch Drone",
     "type": "System",
     "text": ""
    }
   ]
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
   "features": [
    {
     "name": "Spread Suffering",
     "type": "Trait",
     "text": "Spread Suffering: After using a Quick Tech or Full Tech, repeat the option they chose as a free action targeting any character adjacent to the primary target."
    },
    {
     "name": "Dark Cloud",
     "type": "Trait",
     "text": "The additional heat dealt by Tear Down on the Witch’s next turn increases to 7 heat if the target is in the Danger Zone."
    },
    {
     "name": "Chain",
     "type": "Tech",
     "text": "Chain: Make a tech attack against a character within Sensors. On a hit, you chain their target’s systems to a space within range 3 of the target. If the target moves more than 3 spaces from that point (voluntarily or otherwise), they take {2/3/4} Heat and become Jammed until the end of their next turn, but the effect ends. Otherwise, they are chained until you are destroyed or Stunned, or for the rest of the scene."
    },
    {
     "name": "Petrify",
     "type": "Tech",
     "text": "Petrify: Make a tech attack against a character within Sensors. On a success, the target becomes Slowed. On their next turn, they also become Immobilized. On their following turn, they also become Stunned. All conditions end at the end of that turn."
    },
    {
     "name": "Pain Transference",
     "type": "Tech",
     "text": "Pain Transference: Make a tech attack against a character within Sensors. On a success, any time the target gains heat until the end of your next turn, all of their allied characters within range 5 also gain the same amount of heat."
    }
   ]
  }
 ]
};
