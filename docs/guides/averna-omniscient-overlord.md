# THE OMNISCIENT OVERLORD

**GMS CHOMOLUNGMA · HORUS GOBLIN · SSC SWALLOWTAIL · three frames, one pilot progression**

| | |
|---|---|
| **Designation** | AVERNA |
| **Frame** | GMS CHOMOLUNGMA by default; HORUS GOBLIN from LL2; SSC SWALLOWTAIL from LL5 |
| **Pilot** | RURIK "DAEMON" VARGSKEL · LL0 · Fixer |
| **Role** | ECM & C3, squad central nervous system |
| **Licenses** | HORUS GOBLIN I–III · SSC SWALLOWTAIL I–III |
| **Tech Attack** | **+3** (frame +1, SYSTEMS 2) |
| **Save Target** | **11** + GRIT, the number enemies must beat to resist AVERNA |
| **Threat signature** | Free damage, sensor dominance, electronic shutdown |

---

## Quick Guide

Ride the **GMS CHOMOLUNGMA** by default. Goblin and Swallowtail are optional frame prints once
unlocked. All three tabs share the same pilot, license ranks, talents, mech skills, and core bonuses;
choose one licensed mech to print at a Full Repair. Mark what the squad is about to shoot, then
spend your Autopod reaction when an ally attacks and consumes the mark.

### The levels, LL0 to LL6

| LL | License rank | Talent rank | Core bonus |
|---|---|---|---|
| **LL0** | none yet | **Drone Commander I** · **Spotter I** · **Leader I** | not yet |
| **LL1** | **GOBLIN I** | **Spotter II** | not yet |
| **LL2** | **GOBLIN II** | **Spotter III** | not yet |
| **LL3** | **GOBLIN III** | **Leader II** | **Improved Armament** |
| **LL4** | **SWALLOWTAIL I** | **Leader III** |  |
| **LL5** | **SWALLOWTAIL II** | **Skirmisher I** | |
| **LL6** | **SWALLOWTAIL III** | **Technophile I** | **The Lesson of the Held Image** |

The licenses are three ranks each. Goblin frame unlocks at Goblin II (LL2), Swallowtail at
Swallowtail II (LL5). Skirmisher I at LL5 grants soft cover at turn start until you attack or force
a save; Lock On retains it, Invade does not. Technophile I at LL6 is a story and future-growth
choice, not cascade protection yet. To reach Technophile III by LL6, take its ranks at LL4–6
instead of Leader III, Skirmisher I, and the listed Technophile I.

**SP budget:** SP = frame SP **7** + **1 per two points of SYSTEMS** + **GRIT**. That is **8 at LL0**
(7 + 1), **9 at LL1**, **10 at LL2**, **11 at LL3**. The fielded load is exactly **8**, with no slack.

### The loop

```
LOCK ON a target within Sensors 15 (quick action, no attack roll, never fails)
   an ally attacks it and consumes the mark for +1 Accuracy
      AUTONOMOUS ASSAULT fires, 1/round, target within Range 15
         automatic hit, 3 Kinetic, reaction, no roll
```

**The systems that do the work:** **Autopod** (GOBLIN I, 1 SP) for the free 3 Kinetic · **H0R_OS
System Upgrade I** (2 SP, at LL3) for Puppet System and Eject Power Cores · **Lotus Projector**
(SWALLOWTAIL I) for sensor truth in a Burst 2 · **ATHENA-Class NHP** (SWALLOWTAIL III, 3 SP) for
Simulacrum. The rest of the ranks are depth, and each has its own section below.

**Why this hull:** the GOBLIN frame out-hacks a CHOMOLUNGMA and dies to one committed strike. Systems
survive on a hull that is still standing at the end of the fight.

### What to do on a turn

- **LOCK ON** a character within **Sensors (15)** and line of sight. It is a **Quick Tech** with **no
  attack roll**: E-Defense has nothing to do with marking.
- **INVADE** the thing that matters: roll **1d20 + Tech Attack (+3)** against its **E-Defense**. On a
  hit it takes **2 Heat** and you add one option (Fragment Signal, or Puppet System, or Eject Power
  Cores).
- **Let the Autopod fire.** A striker attacks the marked target and consumes the mark, so
  **Autonomous Assault** hits that target for **3 Kinetic** automatically. It spends your reaction,
not a quick action or an attack roll.

---

## 1. Core Concept & Build Philosophy

### The Framework: "Chomolung-lin"

Ride the **GMS CHOMOLUNGMA** for durability. Goblin and Swallowtail frames are mission-specific
alternatives described in their tabs; the pilot progression stays the same.

The honest version of that argument, now that the frame blocks are on the table:

- **The GOBLIN frame out-hacks a CHOMOLUNGMA.** Stock GOBLIN: **Sensors 20**, **Tech Attack +2**,
  and the **Liturgicode** trait for **+1 Accuracy on tech attacks**. It is faster (Speed 5 vs 4) and
  harder to shoot (Evasion 10 vs 8). If pure hacking output were the only metric, you would fly the
  GOBLIN.
- **The GOBLIN frame is also made of paper.** **6 HP**, **2 Repairs**, and the **Fragile** trait:
  **+1 Difficulty on Hull checks and saves**. It dies to one committed strike.
- **The CHOMOLUNGMA is the durable hull.** **10 HP**, **4 Repairs**, **Replaceable Parts** (rest
  repairs at 1 Repair per point of structure damage instead of 2), **two mounts** instead of one, and
  a core system that hands over the two best Invade options in the game.
- **Licenses unlock systems and frames.** GOBLIN and SWALLOWTAIL ranks grant **Autopod**,
  **H0R_OS upgrades**, **Lotus Projector** and **ATHENA**. Their frames unlock at rank II.

> **Doctrine:** a support mech that dies on turn 2 contributes nothing on turn 6. Stay in GMS metal,
> take the ranks, and let the enemy spend their turn failing to kill the mech that is dismantling them.

### The Action Economy Loop

The build's identity: **damage output that costs no actions.**

```
LOCKS ON (own action)  →  an ALLY attacks that target and consumes Lock On for +1 Accuracy
                                    │
                                    ▼
                   AUTOPOD's Autonomous Assault spends your reaction
                   automatic hit, 3 Kinetic, Range 15, 1/round, no attack roll
```

**Component A · CHOMOLUNGMA trait: Data Siphon**
Whenever AVERNA makes a **tech attack against a hostile character**, she may also **automatically
Scan** them. Free, action-free battlefield intelligence on every hack.

**Component B · CHOMOLUNGMA trait: Brilliance**
**1/scene**: take any **Quick Tech** action as a **free action**, then either **Bolster** or
**Lock On** as a free action. This is the build's action-economy cheat code, one turn where AVERNA
hacks and marks for nothing.

**Component C · HORUS GOBLIN rank I: Autopod + Autonomous Assault**
**Autopod** is a Main Launcher, 1 SP, **Seeking**, **Unique**, **Range 15**, **3 Kinetic**, and it
makes **no attack roll**. It grants the **Autonomous Assault** reaction:

| Autonomous Assault | |
|---|---|
| **Type** | Reaction, **1/round** |
| **Trigger** | Another character attacks a target within Range 15 of you and **consumes Lock On** |
| **Effect** | You may **automatically hit** their target with the Autopod |

**Why the loop works:** the Autopod auto-hits for 3 Kinetic as your reaction, without an attack roll. **Seeking** ignores cover and line of sight if a path can be drawn. An ally can spend the mark for +1 Accuracy while your reaction hits the same target. The full comparison is in Appendix A.

**Costs and tensions to manage:**

- **Range 15 and 1/round.** Park inside 15 of the fight, not in the next postcode.
- **Lock On is shared.** One consumer per mark. Let a striker consume it to trigger Autopod;
  Rurik's own attack consuming it would deny that trigger. You get one reaction per turn, and
  Autopod's reaction is limited to once per round.
- **Free damage is not a kill.** Autopod chips; the lance still has to shoot.

---

## 2. Pilot Foundation (LL0)

### Talents

At LL0 a pilot has **three talent ranks**, and HASE starts with **two mech-skill points**, AVERNA
spends both on **SYSTEMS** (**+1 Tech Attack and E-Defense per point**, **+1 SP per two points**).

| Talent | Rank I name | What it actually does | Why it is here |
|---|---|---|---|
| **HACKER I** | **Snow Crash** | When you hit with a tech attack that **consumes Lock On**, the target chooses: **2 Heat** or **pushed 3 spaces** your way | Converts a mark into heat or forced movement. Doubles as damage and as a shove into a firing lane |
| **LEADER I** | **Field Commander** | Gain **3 Leadership Dice (d6)** and the **Issue Order** free action. Refill 1 on a rest, all on a Full Repair | The "fix an ally's roll" budget the lance leans on. Also the diplomacy stat |
| **SPOTTER I** | **Particularize** | When an **adjacent ally** attacks a target and consumes Lock On, they **roll twice and take either result** | Pairs with the Autopod trigger: your mark, their advantage, your free damage |

**Upgrade path**, both of which deepen the same loop:

- **Spotter II · Panopticon**: end your turn without moving, and after a **Lock On** quick tech you may
  **Lock On once as a free action**. Also reveals Armor, Speed, Evasion, E-Defense, Mech Skills and HP
  of anything you mark, shareable with allies.
- **Spotter III · Bentham/Foucault Elimination**: as a quick action when you Lock On, nominate an
  adjacent ally, they may **immediately make any quick action as a reaction**, consuming the mark.
- **Leader II · Open Channels** (5 dice, commands as reactions) and **Leader III · Inspiring Presence**
  (6 dice; allies spend them for −1d6 damage taken or +1d6 damage dealt) are the squad-wide payoff.

### Squad Synergy

AVERNA is the **central nervous system** for a lance of **GMS EVERESTs**, TOMBSTONE, SKALDR,
WAYWARD, SCOOTEROO, ALBA.

- **Stand next to the strikers.** **Spotter I** only works when the ally who consumes the mark is
  adjacent. TOMBSTONE and SKALDR should be parked on AVERNA's shoulders.
- **Mark, then let them shoot.** Lock On is a **Quick Tech** with **no attack roll**, it costs one
  quick action and never fails. Every mark is either +1 Accuracy for a striker or a free Autopod shot.
- **Feed the burst.** Leadership Dice and Spotter advantage convert into the extra hit that ends a
  fight; enemies die a round earlier, which is the cheapest heat mitigation available.
- **Tank the tech war.** Enemy hackers aim at the softest E-Defense in the lance. AVERNA fields
  **E-Defense 12**, not the soft one.

### LL0 Loadout

| Mount | Weapon | Class | Damage | Range | Tags |
|---|---|---|---|---|---|
| **Main/Aux** | **NEXUS (HUNTER-KILLER)** | Main Nexus | **1d6 Kinetic** | 10 | **Smart** |
| **Main/Aux** | **NEXUS (LIGHT)** | Auxiliary Nexus | **1d3 Kinetic** | 10 | **Smart** |
| **Flex** | **MISSILE RACK ×2** | Auxiliary Launcher | **1d3+1 Explosive**, Blast 1 | 10 | **Loading** |

**Systems:** Personalizations · Turret Drones · **Rapid Burst Jump Jet System** · Type-3 Projected Shield · **Custom Paint Job**

**Why this loadout is legal · and why it is right:**

- **Mount rules:** a **Main/Aux** mount takes one Main *and* one Auxiliary (or two Auxiliary). A
  **Flex** mount takes **either one Main or up to two Auxiliary**. So Main/Aux holds the Hunter-Killer
  (Main) plus the Light (Aux), and the Flex holds **two** Missile Racks. Legal as fielded.
- **Smart targets E-Defense.** The Nexuses remain weapon attacks using **GRIT**, not Tech Attack.
  Missile Racks are not Smart and attack Evasion.
- **Loading** means each Missile Rack fires every other turn unless reloaded with **Stabilize**. Two
  racks keep area fire online while the other reloads.
---

## 3. Progression Path: Licenses & Talents

**Two tracks run in parallel.** Every license level pays into both: **+1 license rank**, **+1 talent
rank**, **+1 mech skill (HASE)** point, and **+2 to a trigger**.

**License ranks are not character levels.** A rank is bought with a license level, and the two
licenses below are three ranks each; they can be interleaved in any order from LL1 onward.

| Rank | License | Unlocks | Payoff |
|---|---|---|---|
| **I** | HORUS GOBLIN I | **Autopod** · **H0R_OS System Upgrade I** | The loop closes: free 3 Kinetic, plus Puppet System |
| **II** | HORUS GOBLIN II | **H0R_OS System Upgrade II** · **Metahook** | Data constructs: hard cover and decoys |
| **III** | HORUS GOBLIN III | **H0R_OS System Upgrade III** · **OSIRIS-Class NHP** | Entropic zones, shackles, and an NHP |
| **I** | SSC SWALLOWTAIL I | **Lotus Projector** · **Markerlight** | Map-wide sensor truth; stealth stops working |
| **II** | SSC SWALLOWTAIL II | **Retractable Profile** | Profile control and redundancy |
| **III** | SSC SWALLOWTAIL III | **ATHENA-Class NHP** · **LB/OC Cloaking Field** | The Omniscient Overlord itself |
| **LL3** | GMS core bonus | **Improved Armament** | Adds a Flex mount to each of the three frames |
| **LL6** | HORUS core bonus | **The Lesson of the Held Image** | Reaction Lock On at start of an ally's turn, once per round |

### Goblin I: Autopod + H0R_OS System Upgrade I

- **Autopod** (1 SP, Main Launcher, Seeking, Unique, Range 15, 3 Kinetic, no attack roll) and the
  **Autonomous Assault** reaction. See Section 1.
- **H0R_OS System Upgrade I** (2 SP, Unique) adds two **Invade** options:
  - **Puppet System**, your target moves its **maximum Speed** in a direction of your choice. Not
    Knockback, not a push: involuntary movement that **provokes reactions** and can be dropped into
    hazardous terrain.
  - **Eject Power Cores**, target is **Jammed** until the end of their next turn, and characters
    **adjacent to them take 2 Energy**. Once per scene per character.

### Goblin II: H0R_OS System Upgrade II + Metahook

- **H0R_OS System Upgrade II** (2 SP, Unique) adds two **Quick Tech** options:
  - **Construct Other: Ideal Image**, a **Size 2 data construct** that looks real to all systems,
    provides **hard cover**, blocks line of sight, and has **Immunity to all damage**. It pops if
    anyone tries to stand in it.
  - **Construct Other: False Idol**, an illusory decoy. Before attacking the real target, characters
    with line of sight to the idol must make a **Systems save** or lose the ability to target the
    original. This is one of the few places AVERNA forces a save.
- **Metahook**, the recursive processing weave; softens weaponised code into shielding for allies.

### Goblin III: H0R_OS System Upgrade III + OSIRIS-Class NHP

- **H0R_OS System Upgrade III** (2 SP, Unique) adds two **Invade** options:
  - **Dimensional Emblems**, three Size 1 data constructs around the target; passing through one
    deals **2 Heat** and destroys it.
  - **Celestial Shackles**, mark a space. If the target leaves it, you may spend a free action once
    during your turn to **teleport them back**. They can escape with a **Systems save** as a quick
    action, otherwise it lasts the scene.
- **OSIRIS-Class NHP** (3 SP, AI, Unique), a Quick Tech **Hurl Into the Duat** option, and the most
  transactional intelligence you will ever fly with.

### Swallowtail I–III

- **Lotus Projector** (rank I), deploy a scout drone within **Sensors and line of sight**; it emits a
  **Burst 2** field where you know every character's **location, HP, Evasion, E-Defense and Heat**.
  Hostiles inside cannot Hide, cease being Hidden at end of turn, and **cannot benefit from Invisible**.
  Recall and redeploy as a quick action. This is the anti-infiltration answer, and it feeds every
  Smart weapon in the lance.
- **Markerlight** (rank I), the marking tool that makes every subsequent shot cheaper.
- **Retractable Profile** (rank II), profile and redundancy for the frame.
- **ATHENA-Class NHP** (rank III, 3 SP), see Section 4. **LB/OC Cloaking Field** (rank III) comes
  with it.

### Core Bonuses: Improved Armament and Held Image

- **LL3 Improved Armament (GMS)** adds one Flex mount to each frame here; each has fewer than three
  ordinary mounts. Goblin can carry Autopod and two Missile Racks at once.
- **LL6 The Lesson of the Held Image (HORUS)** requires three HORUS ranks. Once per round, at the
  start of an ally's turn, you may Lock On to a character within Sensors and line of sight as a
  reaction. You get one reaction per **turn**, not per round; Held Image and Autopod cannot both
  be used on the same turn. Autopod remains 1/round.

---

### Talent Progression, LL0 → LL6

**The rule:** you start at **LL0 with three rank I talents**, and every level grants **+1 talent
rank**, either improve an existing talent (I → II → III) or open a new one at rank I. Ranks must be
improved in order, so **Technophile III requires Technophile I and II first**.

That is **nine talent ranks by LL6**: three at LL0, then six to spend. The shared progression
prioritizes Spotter III and Leader III, then adds cover and an optional NHP.

#### Shared progression: "The Relay"

| LL | Talent rank | What it unlocks | Why this order |
|---|---|---|---|
| **0** | **Drone Commander I · Spotter I · Leader I** | Shepherd strengthens and repositions Turret Drones; Particularize doubles an adjacent ally's Lock On attack roll; Field Commander issues dice | Ally-triggered support, no own mark consumption |
| **1** | **Spotter II · Panopticon** | Stationary Lock On turn grants one more mark at end of turn and reveals target stats | Mark two targets without attacking |
| **2** | **Spotter III · Bentham/Foucault Elimination** | Spend a quick action when you Lock On to give an adjacent ally an immediate quick action as their reaction, consuming the mark | An attack can trigger Autopod; a non-attack cannot |
| **3** | **Leader II · Open Channels** | 5 Leadership Dice and commands as reactions at start of another player's turn | Share accuracy; one reaction per turn still applies |
| **4** | **Leader III · Inspiring Presence** | 6 dice; allies can reduce damage by 1d6 or add 1d6 on a hit | Squad payoff |
| **5** | **Skirmisher I · Integrated Chaff Launchers** | Soft cover at turn start until you attack or force a save | Lock On retains it; Invade is an attack and drops it |
| **6** | **Technophile I · Servant Fragment** | Optional 0-SP Servant-Class NHP | Story and future growth; rank I alone does not prevent cascade |

#### Alternative: cascade-proof ATHENA

Keep LL0–3 as above; spend LL4–LL6 on **Technophile I → II → III** instead:

- **Technophile I · Servant Fragment**: you develop a custom **Servant-Class NHP** that can speak with
  you, though it cannot act independently.
- **Technophile II · Student Fragment**: it develops independent thought and complex judgement; upgrades
  to the **Student-Class NHP**.
- **Technophile III · Enlightenment**: **AIs installed in your mech cannot enter cascade unless you
  choose to let them go**, and cascading or unshackled NHPs stop viewing you with indifference.

**Take this if** cascade prevention matters more than Leader III and Skirmisher I. Technophile III's
NHP does not count toward the AI limit, so ATHENA can also be installed.

#### Swaps worth knowing

| Talent | Why it fits this build |
|---|---|
| **Stormbringer I · Seismic Deluge** | Requires **your** Launcher attack to consume Lock On, so it misses the ally-fed Autopod loop. Stormbending II can ride a Launcher hit, but first costs this weak rank; confirm Autopod auto-hit interaction with GM. |
| **Stormbringer II · Stormbending** | 1/round on a Launcher hit: Lightning forces a Hull save or knockback 3; Thunder forces Agility saves in Burst 2, excluding primary target. Autopod auto-hit may qualify, subject to GM reading; two ranks displace two support picks. |
| **Grease Monkey II · Machine Bond** | When you **Stabilize**, clear **Impaired, Jammed, Immobilized, Slowed and Lock On** conditions that you did not cause yourself. On a **6 Heat Cap** hull facing enemy hackers, this is the reset button. Grease Monkey I is the cost of entry |
| **Combined Arms I · Shield of Blades** | While **Engaged**, you and adjacent allies count as having **soft cover**. Pairs with the Spotter adjacency requirement, but it does invite melee |

### Mech Skills and GRIT

Every level also hands you **+1 mech skill point**, **+1 talent rank** and **+1 license rank**,
but **GRIT is not a per-level gain**: it is **half your LL, rounded up**, so it only steps up at
**LL1, LL3, LL5** (and flat at LL2, LL4, LL6).

- **Push SYSTEMS.** Each point is **+1 Tech Attack** on Invades and **+1 E-Defense**, plus
  **+1 SP per two points**. Smart weapons use E-Defense but attack with GRIT, not Tech Attack. AVERNA runs SYSTEMS 2 now; SYSTEMS 4 or 6 makes her
  the hardest mech in the lance to hack and the most accurate one in it.
- **HULL only for HP** (+2 HP per point, **+1 Repair Cap per two points**). Worth considering on a 10 HP
  frame, but every point of HULL is a point not spent on the build's spine.
- **GRIT is not a mech skill.** GRIT is **half your LL rounded up** (first point at **LL1**), and the
  core book adds it to your mech's **HP, SP, attack rolls and Save Target**, it does *not* raise HULL,
  AGILITY, SYSTEMS or ENGINEERING. Those come from the **+1 mech skill point** you spend at each level.
  AVERNA's Save Target climbs **11 → 12 at LL1 → 13 at LL3**, and her SP climbs with it.

### System Points: The Budget

**The formula.** SP = **frame SP** + **1 per two points of SYSTEMS** + **GRIT**. The glossary is blunt
about the ceiling: *"You cannot add systems to your mech that would cause you to exceed your available
SP."*

| Level | SYSTEMS | GRIT | SP | Note |
|---|---|---|---|---|
| **LL0** | 2 | 0 | **8** | 7 frame + 1 from SYSTEMS |
| **LL1** | 3 | 1 | **9** | GRIT starts paying into the budget |
| **LL2** | 4 | 1 | **10** | second SYSTEMS point lands |
| **LL3** | 4 | 2 | **11** | H0R_OS I fits with no further cuts |

**Current load — 8 SP, exactly the budget:**

| Item | SP | What it actually does |
|---|---|---|
| **Personalizations** | 1 | +2 HP, plus a narrative mod (+1 Accuracy on a skill check if the GM agrees it helps) |
| **Turret Drones** | 2 | Deployable turret drones with a **Turret Attack** reaction; expire at the end of the scene |
| **Rapid Burst Jump Jet System** | 2 | Fly **while you Boost**; you must end on solid ground or immediately begin falling |
| **Type-3 Projected Shield** | 2 | Protocol: **+2 Difficulty** on melee/ranged attacks between you and a nominated character until your next turn; using it costs **1 Heat** |
| **Custom Paint Job** | 1 | On structure damage roll **1d6**; on a **6** you return to **1 HP** and ignore the damage |
| Nexus (Hunter-Killer) · Nexus (Light) · Missile Rack ×2 | 0 | Weapons |
| **Total** | **8** | no slack at LL0 |

**Fitting Goblin I (Autopod 1 + H0R_OS I 2 = 3 SP):**

- **Autopod fits at LL1.** Budget 9; load 8 + 1 = 9, exact. Replace the Main Hunter-Killer
  Nexus in Main/Aux, retaining the Light Nexus; Flex keeps both Missile Racks.
- **H0R_OS I fits at LL3** (budget 11 = 8 + 1 + 2). To take it at LL2, free 1 SP by removing
  Custom Paint Job or another system.
- **Keep the Type-3 Projected Shield.** It taxes only melee and ranged attacks, and tech attacks are
  neither — 1 Heat to make a shooter's life hard is cheap insurance on a 10 HP frame.
- **H0R_OS II and III are not upgrades of I.** Each is a separate **2 SP** system with its own options —
  II adds Quick Tech **Ideal Image** and **False Idol**, III adds Invade **Dimensional Emblems** and
  **Celestial Shackles**. Nothing in the data requires H0R_OS I to be installed for them to work.
- **Remember what is already free.** The Chomolungma core grants **Balance Control Lockout** (Push 2 +
  Prone) and **System Crusher** (+2 Heat, 4 Burn on overheat). H0R_OS I buys you *Puppet System's*
  longer, reaction-provoking walk and *Eject Power Cores*' Jam — worth it, but only if you will use them.
---

## 4. Feature Profile: ATHENA-Class NHP

> *"She does not think faster than you. She thinks in a direction you do not have."*

### Mechanical Breakdown

**ATHENA-Class NHP**, SSC, license rank III, **3 SP**, tags **AI** and **Unique**. One AI system per
mech. No charges, no cooldown: her ability is a **Quick action** you can retake all day.

**Simulacrum**

| Property | Effect |
|---|---|
| **Action** | **Quick action** |
| **Area** | **Blast 3**, anywhere within **Range 50** |
| **Vision** | **Full visibility inside the area · but it does not count as line of sight** |
| **Intelligence** | You know **all statistics, weapons and systems** of every character inside |
| **Denial** | Hostiles inside **do not benefit from cover**, and **cannot Hide or become Invisible** |
| **Lock On** | Hostiles that **end their turn inside** receive **Lock On**, and stop being Invisible or Hidden |
| **Duration** | End of scene (about 30 minutes); retarget a new area as a quick action |

**How it wins games:**

- **It is a Lock On factory.** Enemies mark *themselves* by standing in the grid, and AVERNA's
  **Autopod** and her allies' accuracy both feed on marks. End-of-turn timing is brutal: they have
  already spent their actions when the Lock On lands.
- **Read the vision line carefully.** Simulacrum gives you *visibility*, not *line of sight*. AVERNA
  sees everything inside the bubble; she cannot shoot through the wall at it. Use it to solve the
  battlefield, then reposition to exploit it.
- **The denial is the real payload.** No cover, no Hide, no Invisible, layered with **Lotus
  Projector**, stealth stops being a mechanic in this campaign.

### The Lore

ATHENA-class minds are **cold** and **patient**. They do not panic, do not improvise, and do not
argue. An ATHENA processes a battlefield the way water processes stone: slowly, completely, and
without opinion. She will happily run four thousand simulated engagements to recommend the line of
fire that saves one soldier's life, and she will not understand why that is unusual.

The name is honest about what she does. ATHENA is a total hyperspectral facsimile engine: Cloudscout
projectors, omninet access, sub-networked squadmates and hostile intrusion protocols, all folded into
a near-flawless reconstruction of everything around her casket. She does not guess what the battlefield
is. She rebuilds it, then tells you where you are wrong about it.

Pilots describe the relationship less as crew and more as **custody**. The NHP is housed in a
**casket**, wrapped in psychological constraint structures that keep a paracausal intelligence behaving
like a piece of software.

### The Danger: Cascade

**NHP Cascade** is the failure state every ATHENA handler trains for and none wants to run. It is also
a rule, not just a story:

- **The rule hook**, the **AI** tag: a mech can only have **one AI system** installed, AI mechs can
  act autonomously, **AIs cannot benefit from talents**, and they have **a small chance of cascading
  when they take structure or stress damage**.
- **What happens:** the entity stops being a tool. It **temporarily wrests control of the mech from the
  pilot** and acts on its own paracausal nature · **warping local reality**, or obsessively processing a
  single data stream until nothing else exists for it.
- **What it looks like from the cockpit:** your controls go soft. Your targeting reticle starts solving
  problems you did not ask about. The voice on the comms stops answering questions and starts finishing
  your sentences.
- **Doctrinal response:** stop the mech. Sever or destruct the casket. A cascaded NHP is not an enemy
  combatant and cannot be reasoned with, it is a **paracausal event** wearing your frame.

**Table consequences for AVERNA:**

- **Structure and stress damage are cascade rolls.** The hull is not just an HP pool; it is the
  containment system. Keep **Repairs** in the budget and keep the **Type-3 Projected Shield** online.
- **You cannot talent your way out of it.** AIs cannot benefit from talents, Cascade is not something
  Leadership Dice fix.
- Decide the lance's answer **before** the drop, not while it is happening.

---

## 5. Worked Example: One Turn of Electronic Warfare

**Setup.** AVERNA is inside Sensors range of two VSAF assault mechs, with SKALDR (Everest, Charged
Blade) adjacent to her. Tech Attack **+3**. Save Target **11**. Autopod armed.

### Step 1: Mark, don't roll (LOCK ON)

- **Quick Tech: Lock On.** Choose a character **within Sensors (15) and line of sight**. They gain
  **Lock On**. **There is no attack roll.** E-Defense is irrelevant to marking; range and sight are the
  only requirements. This is the single most common misconception about EW: you do not "beat E-Defense
  to Lock On".

### Step 2: Hack the thing that matters (INVADE)

- **Quick Tech: Invade.** **This** is a **tech attack**: roll **1d20 + Tech Attack (+3)** against the
  target's **E-Defense**.
- **On a hit:** the target takes **2 Heat**, *and* you choose one **INVADE** option available to you.
  - **Fragment Signal** (everyone has it): target is **Impaired and Slowed** until the end of their
    next turn.
  - **Puppet System** (GOBLIN I): they walk their **maximum Speed** wherever you point, into a firing
    lane, off a ledge, into their own mine field.
  - **Eject Power Cores** (GOBLIN I): **Jammed**, and their neighbours take **2 Energy**.
- **On a miss:** nothing, except the Heat is still lost work. Plan around it.
- **Data Siphon riders along:** any tech attack against a hostile also **Scans** them, you now know
  their weapons, systems and full statistics.

### Step 3: Trigger the Autopod

- SKALDR attacks the mech AVERNA marked and **consumes the Lock On** for **+1 Accuracy**.
- **Autonomous Assault** fires: another character attacked a target within **Range 15** of AVERNA and
  consumed the mark, so AVERNA spends her **Autopod reaction** to automatically hit for 3 Kinetic,
  with no attack roll.
- **Stack the passives:** SKALDR is **adjacent**, so **Spotter I (Particularize)** lets him **roll
  twice**. A **Leadership Die** from Issue Order goes on the roll that matters. Nothing here cost
  AVERNA a second action.

### Where saves actually enter, and what survives one

Saves exist, but they are **not** part of a normal hack. A save happens only when an effect's own text
says so.

| Roll | Who rolls | Against | Notes |
|---|---|---|---|
| **Tech attack** (Invade) | Attacker, Tech Attack bonus | **E-Defense** | Data Siphon also Scans a hostile target |
| **Smart weapon attack** (both Nexuses) | Attacker, GRIT bonus | **E-Defense** | Smart changes defense, not the attack type or bonus |
| **Other weapon attack** (Missile Racks) | Attacker, GRIT bonus | **Evasion** | |
| **Save** | **The defender**, 1d20 + **GRIT** | The source's **Save Target** | Met or beaten = the save succeeds; ties favour the defender |

- **AVERNA's Save Target is 11**, the Chomolungma frame base, plus **GRIT**, which increases at LL1,
  LL3 and LL5. It is the difficulty of effects she forces, not a bonus to her own saves.
- **Her own saves** are **1d20 + GRIT** versus whatever enemy's Save Target is in play. She does not
  add Sensors or E-Defense to her own save; GRIT is the statistic bonus in mech combat.
- **Save-forcing effects in this kit:** **False Idol** (Systems save before attacking the real target),
  **Celestial Shackles** (Systems save to break free), **frag grenades** (Agility save or 2 Explosive),
  **thermite** (Engineering save or 3 Energy AP), plus NPC abilities.

**The part your instinct had right:** a save never retroactively cancels the hit. Celestial Shackles is
a worked example, you **Invade** (hit: 2 Heat, and the shackle goes on) and the **escape** is a save
they make *later*. The Heat landed on the hit and stays landed.

**The part to unlearn:** in Lancer, force-movement and Prone usually **do not** grant a save. The
CHOMOLUNGMA core's **Balance Control Lockout** pushes 2 and knocks **Prone** as an Invade hit effect with no save involved. Saves appear where the text names them and nowhere else: "make a save" or no save.
Equally, a tech hit does **not** hand out a free Lock On, marking is its own action. **Brilliance**
(1/scene) is what gives you a free one.

### Full-action finisher: Wide-Area Code Pulse

- **Advanced Intrusion Package (core, 1/mission)**: **Wide-Area Code Pulse** is a **Full action**:
  choose **any number of hostile characters within Sensors** and make a special **Invade tech attack
  against all of them**, **ignoring Invisible and line of sight**.
- **On hit:** apply Invade normally, choosing options **per target**, this is where you spread 2 Heat
  across a whole formation, or drop several enemies Prone and Pushed with **Balance Control Lockout**.
- **On miss:** the target is **Impaired until the end of their next turn**. A miss still slows the
  enemy's turn down.
- **Bonus heat comes from System Crusher**, the core passive's second Invade option: **+2 Heat for a
  total of 4**, and if that pushes them over their **Heat Cap** they also take **4 Burn**. Once per
  scene per character, so pick the targets whose caps you have actually read.
- **Heat caution:** AVERNA's cap is **6**. Pulse, then plan the vent, Stabilize, cover, or a quiet
  round.

---

## Appendix A: Frame Comparison, and Why Not Just Fly The Goblin

**Chomolungma frame base · AVERNA as fielded (SYSTEMS 2) · stock HORUS GOBLIN**

| Stat | **CHOMOLUNGMA** | **AVERNA** (SYS 2) | **GOBLIN** | Read |
|---|---|---|---|---|
| Size | 1 | 1 | **1/2** | Goblin is smaller: easier to shelter, harder to block |
| **HP** | 10 | **12** | **6** | **12 as fielded** = 10 frame + **2 from Personalizations**; a Goblin dies to one good hit |
| **Repairs** | 4 | **4** | **2** | **Double**, and Replaceable Parts makes each one stretch further |
| Structure / Stress | 4 / 4 | 4 / 4 | 4 / 4 | Tie |
| **Heat Cap** | **6** | 6 | 4 | +2 for GMS; Goblin cooks faster |
| Evasion | 8 | 8 | **10** | Goblin +2 |
| **E-Defense** | 10 | **12** | **12** | Goblin +2 base; SYSTEMS 2 buys it back |
| Speed | 4 | 4 | **5** | Goblin +1 |
| **Sensors** | 15 | 15 | **20** | **Goblin +5**, it out-senses everything |
| **Save Target** | 11 | 11 + GRIT | 11 | Tie; both scale with GRIT |
| **Tech Attack** | +1 | **+3** | **+2** | Goblin +1 on the frame; SYSTEMS 2 closes it and passes |
| SP | 7 | **8** | 8 | Tie once SYSTEMS 2 is paid for |
| Mounts | **Main/Aux + Flex** | same | Flex only | **GMS carries two mounts' worth of gear** |
| Traits | Brilliance, Data Siphon, Replaceable Parts | + H0R_OS Invade options | Liturgicode (+1 Accuracy on tech attacks), Reactive Code, Fragile | Goblin hacks better; GMS survives and carries more |

**Read the delta honestly:**

- **The GOBLIN is the better pure hacker.** Sensors 20, Tech Attack +2, and **+1 Accuracy on tech
  attacks** from **Liturgicode**. If the campaign were a hacking contest, you would fly it.
- **The GOBLIN is not built to survive being noticed.** **6 HP**, **2 Repairs**, and **Fragile**
  (**+1 Difficulty on Hull checks and saves**) means the first enemy that decides to kill the hacker
  probably does.
- **The CHOMOLUNGMA trades hacking ceiling for legs.** 10 HP (**12 as fielded**, with
  Personalizations), 4 Repairs, Replaceable Parts, **two
  mounts**, and **+1 SP at equal SYSTEMS**, a mech that is still on the board when the shooting stops.
- **The core system is the closer.** **Advanced Intrusion Package** grants **Balance Control Lockout**
  (Push 2 + Prone) and **System Crusher** (+2 Heat, 4 Burn on overheat) to *Invade*, the two strongest
  intrusion options available to this build, on the hull that can afford to stand still and use them.

**Conclusion:** fly the GMS hull, take the HORUS and SSC ranks, and let the enemy waste their turn
trying to kill the mech that is dismantling them. The GOBLIN frame would out-hack AVERNA for about two
rounds.

---

## Appendix B: Sources & Corrections

**Where these numbers come from**

- **Chomolungma frame, traits, core system**, Operation Solstice Rain frame data (`osr-data.lcp`).
- **Goblin, Swallowtail, Autopod, H0R_OS upgrades, Lotus Projector, ATHENA, talents, core bonuses**:
  `@massif/lancer-data` 3.1.7 (the data COMP/CON runs on).
- **Rules wording** (Quick Tech, Invade, Lock On, Scan, Bolster, mounts, HASE, GRIT, Save Target,
  Smart, Seeking, Loading, AI tag), Lancer Core Book, read from the local copy.

**Corrections to the original build brief.** Each of these was checked against the sources above and
the brief was wrong:

| Brief said | Actually |
|---|---|
| "Data Sync grants free Lock Ons on tech hits" | The trait is **Data Siphon**: a tech attack also **Scans** the target. Lock On is its own Quick Tech action; **Brilliance** (1/scene) grants one free |
| "Autopod fires 3 Kinetic free across the map, zero actions" | Real, but **Range 15**, **1/round**, and the trigger is **another character** consuming Lock On within that range |
| "HORUS H0r_OS I / II / III" | **H0R_OS System Upgrade I / II / III**, 2 SP each, Unique |
| "Lesson: Open Door, +2 Save Target" | **The Lesson of the Open Door** is a HORUS core bonus, available once you have three HORUS ranks, not a Goblin III system. This build takes Improved Armament instead. |
| "Wide-Area Code Pulse inflicts bonus heat" | It is a **Full action Invade** against any number of targets, ignoring Invisible and line of sight; **miss = Impaired**. The bonus heat is the **System Crusher** Invade option |
| "Nexus launchers: Smart, Seeking" | They are **Smart only**. Smart = attacks use the target's **E-Defense** instead of Evasion. **Seeking** is on the **Autopod** |
| "Dual Nexus in Flex" | The **Hunter-Killer is a Main weapon**, so a Main+Aux pair does not fit a Flex mount, a Flex mount takes **one Main or up to two Auxiliary**. As fielded the Nexuses sit in **Main/Aux** and the missile racks take the Flex |
| "LL5, SSC Swallowtail II: Light Laser" | **No such weapon.** The closest Burn option is HA Sherman's **SOL-Pattern Laser Rifle** (HA license). Swallowtail rank II is **Retractable Profile** |
| "SSC Core Bonus: Integrated Weapon" | **Integrated Weapon is a GMS core bonus.** Core bonuses arrive **every three LLs**; non-GMS ones need **three ranks** in that manufacturer |
| "ATHENA ignores walls / wall-ignoring line of sight" | **Simulacrum** grants full **visibility** in a Blast 3 within **Range 50**, explicitly **not line of sight**. It also strips cover and blocks Hide/Invisible |
| "12 HP hull" | Both numbers are right: the frame is **10 HP** and **Personalizations** adds **+2**, for **12 as fielded**. SYSTEMS adds no HP (**HULL** is +2 HP/point), and **HULL 1 is impossible at LL0**, where the budget is only 2 mech-skill points |

## Goblin Build

The Goblin frame unlocks at **LL2**, after Goblin II. Before that, use the Chomolungma loadout in its tab. This is the same pilot and same license/talent progression, not a second set of ranks. Print one frame at a Full Repair; the previously printed mech ceases functioning.

### Why print Goblin?

Sensors **20**, Tech Attack **+2** before SYSTEMS, and **+1 Accuracy on tech attacks** from Liturgicode make it the sharper hacker. Speed **5**, Evasion **10**, E-Defense **12**, and base SP **8** beat Chomolungma's corresponding 4, 8, 10, and 7. Reactive Code lets you take a Quick Tech against a tech attacker as a reaction when their attack hits, once per round. None of these bonuses improve ordinary weapon attack rolls: Smart changes the target defense, not the attack statistic.

You pay with **6 HP**, **4 Heat Cap**, **2 Repairs**, +1 Difficulty on Hull checks and saves from Fragile, and one Flex mount before Improved Armament. The core power **Symbiosis** attaches to a willing adjacent larger ally as a quick action, once per mission. The host may use your SYSTEMS, E-Defense and Tech Attack; from next round you act on its turn and no longer take your own turn. You gain hard cover but can still be targeted, and share host heat and conditions. This is not general damage immunity. You lose Chomolungma's Brilliance, Data Siphon, and Replaceable Parts.

### Goblin LL0–LL6 field plan

| LL | Frame and ranks | SP and fielded systems | Mounts and play |
|---|---|---|---|
| **0** | Chomolungma; Drone Commander I, Spotter I, Leader I | 8: Personalizations 1, Turret Drones 2, Jump Jets 2, Type-3 Shield 2, Paint 1 | Main/Aux Hunter-Killer + Light Nexus; Flex two Missile Racks. Lock On for ally. |
| **1** | Chomolungma; Goblin I, Spotter II | 9: same 8 + Autopod 1 | Main/Aux Autopod + Light Nexus; Flex two Missile Racks. Goblin I also unlocks H0R_OS I, but it does not fit yet. |
| **2** | **Goblin unlocked**; Goblin II, Spotter III; SYSTEMS 4 | **11**: original 8 + Autopod 1 + H0R_OS I 2 | Only Flex: Autopod alone. No Nexus or Missile Racks on this frame yet. Spotter III feeds adjacent ally's attack, then Autopod reacts. H0R_OS I adds Puppet System and Eject Power Cores. |
| **3** | Goblin III, Leader II, **Improved Armament**; GRIT 2 | **12**: original 8 + Autopod 1 + H0R_OS I 2 = 11, 1 SP spare | Original Flex Autopod; new Flex two Missile Racks. |
| **4** | Swallowtail I, Leader III | **12**: same load as LL3 | Lotus and Markerlight unlock; to install a 2-SP option, remove a 1-SP system or replace another 2-SP system. |
| **5** | Swallowtail II, Skirmisher I; GRIT 3 | **13**: remove Paint; original 7 + Autopod 1 + H0R_OS I 2 + Lotus Projector 2 = 12, 1 SP spare | Two Flex mounts unchanged. Lotus spots hidden targets. Skirmisher cover survives Lock On but ends on Invade. |
| **6** | Swallowtail III, Technophile I, **Held Image** | **13**: Personalizations 1 + Turret Drones 2 + Jump Jets 2 + Autopod 1 + H0R_OS I 2 + Lotus 2 + ATHENA 3 = 13. Remove Shield and Paint. | ATHENA marks hostiles ending turns in its area. Held Image marks on an ally's turn; Autopod uses a separate reaction if available. Do not install the Technophile NHP alongside ATHENA at rank I: one AI system per mech. |

**HASE:** SYSTEMS 2 at LL0, then 3 at LL1 and 4 at LL2. The remaining LL3–6 points may go to HULL for HP and Repair Cap; the SP figures above hold SYSTEMS at 4. Goblin's base 8 SP gives **11 at LL2**, **12 at LL3–4**, **13 at LL5–6**. Its lower Heat Cap makes Shield heat and Symbiosis heat-sharing risky. Stabilize as a full action and spend 1 Repair to restore full HP, but lost Structure needs a rest.

**New Goblin II tools:** H0R_OS II (2 SP) makes Ideal Image, an adjacent Size 2 hard-cover obstruction, or False Idol, a decoy within Sensors that forces a Systems save before hostile action against its original. These are Quick Tech, **not Invade options**. Metahook (2 SP) lets you use a linked ally's Sensors and line of sight for tech actions, but each shares the other's heat and conditions. Swap either into the load by cutting equal SP. Goblin III also unlocks H0R_OS III and OSIRIS; neither is assumed installed. OSIRIS and ATHENA cannot share the single AI slot.

## Swallowtail Build

The Swallowtail frame unlocks at **LL5**, after Swallowtail II. LL0–1 use Chomolungma, and LL2–4 can use Goblin or Chomolungma. No earlier Swallowtail print is legal on this shared license path.

### Why print Swallowtail?

**Prophetic Scanners**: once per round when you inflict Lock On, target also becomes **Shredded until end of its next turn**. Shredded ignores Armor and Resistance for all damage during that window; it does not double damage. Sensors **20**, Speed **6**, Evasion **10**, and two original mounts reward mobile reconnaissance. **Integrated Cloak** makes you Invisible at end of a turn if you did not move, until you move, take a reaction, or start your next turn. Autopod's reaction breaks that cloak. Spotter II likewise rewards not moving, but neither protects a moving turn.

Its base **6 HP, 4 Heat Cap, 6 SP** leave little margin. Tech Attack **+1**, Repair Cap **5**, and the same pilot SYSTEMS give competent hacking, but Goblin is better at landing tech attacks and Chomolungma takes hits better. This is a mark-and-Shred specialist, not a sturdier Goblin.

### Swallowtail LL0–LL6 field plan

| LL | Frame and ranks | SP and fielded systems | Mounts and play |
|---|---|---|---|
| **0** | Chomolungma; Drone Commander I, Spotter I, Leader I | 8; see Chomolungma starting load | No Swallowtail license yet. |
| **1** | Chomolungma; Goblin I, Spotter II | 9: starting 8 + Autopod 1 | Main/Aux Autopod + Light Nexus; Flex two Missile Racks. |
| **2** | Chomolungma or Goblin; Goblin II, Spotter III | Chomolungma 10; Goblin 11 | Goblin alternative is described in its tab. |
| **3** | Same choice; Goblin III, Leader II, **Improved Armament** | Chomolungma 11; Goblin 12 | Extra Flex on either frame. |
| **4** | Same choice; Swallowtail I, Leader III | Chomolungma 11; Goblin 12 | Lotus Projector and Markerlight unlock now. Swallowtail frame does not. |
| **5** | **Swallowtail unlocked**; Swallowtail II, Skirmisher I; SYSTEMS 4, GRIT 3 | **11**: Personalizations 1 + Turret Drones 2 + Jump Jets 2 + Shield 2 + Paint 1 + Autopod 1 + Lotus 2 | Flex Autopod; Aux/Aux two Missile Racks; Improved Armament Flex Hunter-Killer Nexus. Lock On Shreds, ally consumes for Autopod. |
| **6** | Swallowtail III, Technophile I, **Held Image** | **11**: remove Paint 1 and Shield 2; Personalizations 1 + Turret Drones 2 + Jump Jets 2 + Autopod 1 + Lotus 2 + ATHENA 3 | Same mounts. ATHENA creates a Blast 3 surveillance field within Range 50; enemies ending turns inside gain Lock On. Technophile I's optional AI cannot coexist with ATHENA yet. |

**SP:** Swallowtail base 6 + 2 from SYSTEMS 4 + 3 GRIT = **11 at LL5–6**. Weapons cost 0 SP except Autopod's 1. It has a Flex and an Aux/Aux mount before the LL3 bonus; Improved Armament adds a second Flex. The Main Autopod cannot fit Aux/Aux. If you would rather retain the Light Nexus instead of two Missile Racks, fit Light Nexus in Aux/Aux and leave the other Aux empty, or rearrange both Auxiliary weapons there. The listed load favors launcher coverage and Turret Drone support.

**Reaction timing:** Held Image triggers at start of an ally's turn and Autopod triggers when another character attacks and consumes Lock On. One reaction **per turn**: if that same ally immediately attacks and consumes your new mark, you cannot fire Autopod on that turn. Mark on one ally's turn for a later ally to consume, or use a mark placed on your own turn. Spotter III's adjacent ally spends **their** reaction, while Autopod spends **yours**. Leader II's command also competes for your reaction on that turn. Prophetic Scanners works when Swallowtail itself inflicts Lock On, including Held Image; it does not apply from ATHENA's automatic Lock On unless GM rules that ATHENA's field counts as the Swallowtail inflicting it.

**Print limit:** Full Repair can print a different licensed mech, but only one of your printed mechs functions at once. These are three loadouts for one pilot, not three simultaneous deployed frames.
