/* Compact field reference for the chosen Chomolungma print. Every entry names its timing and limit. */
const universal = {
  'Quick actions': [
    ['Boost', 'Move up to Speed again as a quick action.'],
    ['Hide / Search', 'Hide when eligible; Search for a hidden target.'],
    ['Skirmish', 'Fire one weapon, plus one other Aux on the same mount. Weapon attacks add GRIT, not Systems.'],
    ['Quick Tech', 'Lock On, Bolster, Scan, or Invade. Invade: tech attack vs E-Defense; on hit, 2 Heat and one available invasion option.'],
    ['Ram / Grapple', 'Knock back or Prone a target; or hold one in a grapple.'],
    ['Prepare / Shut Down / Activate', 'Prepare a quick action for a trigger; Shut Down to clear Heat and system effects; Activate installed quick-action gear.'],
    ['Eject', 'Emergency quick action: launch 6 spaces; once per Full Repair.'],
    ['Self-Destruct', 'Start a reactor meltdown. Explosion at end of your next turn or a chosen turn in the following two rounds; destroys the mech and pilot.']
  ],
  'Full actions': [
    ['Barrage', 'Fire two weapons, plus an eligible Aux on each fired mount. A pair of Aux weapons on the same mount can fire together; Loading weapons reload after use.'],
    ['Full Tech', 'Take two Quick Tech options, including the same option twice, or one Full Tech system action.'],
    ['Stabilize', 'Choose: clear all Heat/Exposed, or spend 1 Repair to restore all HP. Then reload all Loading weapons and choose one of: clear Burn, clear your eligible condition, or clear an adjacent ally’s eligible condition.'],
    ['Disengage / Improvised Attack / Skill Check', 'Move without provoking reactions; strike without a weapon; or attempt a task with uncertain outcome.'],
    ['Boot Up / Mount / Dismount', 'Restart after Shut Down; entering or leaving a mech takes a full action.']
  ],
  'Reactions': [
    ['Overwatch', '1/round: Skirmish when a hostile starts movement within your weapon’s Threat (normally 1).'],
    ['Brace', 'Reduce an incoming hit; limits your next turn’s actions.']
  ],
  'Protocols / free actions': [
    ['Standard move', 'Move up to Speed each turn without spending a quick or full action.'],
    ['Overcharge', 'Once per turn, take an extra quick action as a free action. Heat cost escalates 1, 1d3, 1d6, then 1d6+4 until Full Repair.'],
    ['AI handoff', 'Protocol: hand control to an installed AI or take it back. While it controls the mech, you cannot take actions with that mech.']
  ],
  'On foot': [
    ['Pilot movement and actions', 'Speed 4. Share the mech’s action pool; Boost, Hide, Search, Activate, Skill Check, Disengage, Prepare, Mount and Overwatch remain available.'],
    ['Fight / Jockey / Reload', 'Fight: full action with one pilot weapon. Jockey: full action against an adjacent mech. Reload one Loading pilot weapon as a quick action.'],
    ['Pilot weapons', 'Medium Signature: Range 5, 2 damage. Light Signature: Range 3, 1 damage, Sidearm. Choose damage type on acquisition; pilot Fight uses GRIT.'],
    ['Other gear', 'Assault Hardsuit, Dataplating, Sylph Undersuit, Personal Drone. No mech-scale attack bonuses.'],
    ['Broker Bond', 'From LL1: Cosmocephalos, 2/session, grants another character +1 Accuracy on a skill check through your preparation. Narrative only.'],
    ['Pilot triggers', 'Narrative skill checks use one applicable trigger, not mech attack rolls. Current trigger ranks appear above this panel.']
  ]
};
const systems = {
  'Turret Drones': ['Quick / reaction', 'Limited 3: deploy within Sensors and line of sight. 1/round per turret, an ally within Range 10 of it hits; turret deals 3 Kinetic to that target if it has line of sight.'],
  'Servant-Class NHP': ['Passive', '0 SP; installed AI can take control when you hand over the mech as a protocol.'],
  'Enlightenment-Class NHP': ['Reroll', '0 SP; does not count toward the AI limit. 1/round reroll a mech skill check or save, keeping the new result. Technophile III blocks cascade unless you allow it.'],
  'Type-3 Projected Shield': ['Protocol', 'Take 1 Heat (Self); choose a visible character. Ranged/melee attacks between you gain +2 Difficulty until your next turn.'],
  'Rapid Burst Jump Jet System': ['Boost', 'Fly during a Boost; end on a solid surface or fall.'],
  'Custom Paint Job': ['Passive', 'On structure damage, roll 1d6; on 6, return to 1 HP and ignore that damage. Once per Full Repair.'],
  'Personalizations': ['Passive', '+2 HP and a GM-approved minor modification; possible +1 Accuracy to a relevant skill check.'],
  'H0R_OS System Upgrade I': ['Invade', 'Puppet System moves a target up to its Speed and explicitly provokes reactions; Eject Power Cores Jams a target and deals 2 Energy to adjacent characters (1/scene per target).'],
  'H0R_OS System Upgrade II': ['Quick Tech', 'Ideal Image creates hard-cover/line-of-sight-blocking terrain; False Idol decoys hostile targeting until a Systems save.'],
  'Autopod': ['Reaction', '1/round: when another character attacks and consumes Lock On within Range 15, automatically hit for 3 Kinetic. Uses your reaction.'],
  'OSIRIS-Class NHP': ['Quick Tech', 'Hurl Into the Duat, 1/round: tech attack within Sensors, 2 Heat on hit. Successful hits cycle: control next standard move; Slow/Impair; Stun; temporary allied NPC. The fourth effect ends if your side attacks, damages, heats or forces a save against the target. Resets after fourth hit or rest.'],
  'Lotus Projector': ['Quick action', 'Deploy an invisible scout drone within Sensors and line of sight. Its Burst 2 reveals stats and suppresses enemy Hidden/Invisible benefits; recall and redeploy as a quick action.'],
  'ATHENA-Class NHP': ['Quick action', 'Simulacrum: place or move one Blast 3 area within Range 50. Reveal occupant stats; hostiles lose cover and cannot Hide/become Invisible; those ending their turn inside gain Lock On. Visibility is not line of sight.'],
  'Unstable NHP': ['Quick action', 'Memetic Spark, 1/round: 5 AP Energy within Range 3 while all four NHPs survive. Does not use a regular AI slot; can cascade.'],
  "Dominion's Breadth": ['Quick Tech', 'Give a mech within Sensors and line of sight Overshield 1. When lost, a Burst 2 deals 2 AP Energy to hostiles and forces an Engineering save against Impaired.'],
  'Blackspot Targeting Laser': ['Weapon hit', 'Range 15, Main, 1d3+1 Energy. Hit: Drone, Seeking and Nexus attacks gain +1 Accuracy against that target until end of its next turn; crit adds Lock On.'],
  'Unhinge Chronology': ['Quick Tech', 'Haste: target within Sensors/line of sight gets a free Boost each round until damaged. Slow: Systems save or 2 Heat, Slowed and no reactions until damaged or saved out.'],
  'Stasis Bolt': ['Quick / reaction', 'Charge as a quick action. 1/round, contest a ranged attack targeting you or an ally within Range 5; if you win, the attack misses and the charge is spent.']
};
const talents = {
  Spotter: [
    ['Passive', 'Adjacent ally consuming your target’s Lock On rolls twice and chooses.'],
    ['Quick Tech', 'If you did not move and used the Lock On quick tech action, add one free Lock On at turn end; Lock On also reveals target stats.'],
    ['Quick Tech', 'When you Lock On, spend a quick action to let an adjacent ally take an immediate quick action as a reaction, consuming that Lock On.']
  ],
  Leader: [
    ['Free action', 'Issue an order and give an ally a Leadership Die for +1 Accuracy on the directed action.'],
    ['Reaction', 'Issue a command at the start of another player’s turn; Leadership Dice pool rises to five.'],
    ['Passive', 'Six dice; allies can spend one to reduce damage by 1d6 or add 1d6 bonus damage.']
  ],
  Technophile: [
    ['AI', 'Servant-Class NHP may pilot independently when given control.'],
    ['Reroll', 'Student-Class NHP allows 1/round mech skill check or save reroll only while installed.'],
    ['Passive', 'Enlightenment does not count against AI limit; all installed AIs avoid cascade unless you allow it.']
  ],
  Iconoclast: [
    ['Quick action', 'Unstable NHP grants Memetic Spark, 5 AP Energy within Range 3 with four NHPs aboard.'],
    ['Free action', 'After an NHP-granted action, Transmuting Spark deals 2 AP Energy to chosen characters in Line 3; each NHP triggers once/round.'],
    ['Passive', 'Repeated sparks trigger Transcension: through next turn, Memetic Spark deals 9 AP Energy at Range 8, plus Hover 1 and immunity to involuntary movement.']
  ],
  Skirmisher: [
    ['Passive', 'Soft cover at turn start, lost if you attack or force a save.'],
    ['Skirmish', 'Move 2 spaces before or after Skirmish without provoking reactions or Engagement. Not Barrage.'],
    ['Passive', 'First reaction attack against you each round automatically misses.']
  ]
};
const cores = {
  'Improved Armament': ['Passive', 'Adds the bonus Flex mount shown above.'],
  'The Lesson of Shaping': ['Passive', 'One additional regular AI slot: OSIRIS and ATHENA may coexist.'],
  'Integrated Weapon': ['Free attack', 'Integrated Light Nexus fires 1/round when you fire another weapon.'],
  'Full Subjectivity Sync': ['Passive', '+2 Evasion.']
};
const roman = {I:1, II:2, III:3};
function abilityGroups(row, ll, ranks) {
  const groups = Object.fromEntries(Object.entries(universal).map(([k,v]) => [k,v.filter(([name]) => ll || name !== 'Broker Bond')]));
  groups['On foot'][0] = ['Pilot movement and actions', `HP ${9 + Math.ceil(ll / 2)}, Armor 1, Evasion 8, E-Defense 8, Speed 4 (Assault Hardsuit). Share the mech’s action pool; Boost, Hide, Search, Activate, Skill Check, Disengage, Prepare, Mount and Overwatch remain available.`];
  const [h,a,s,e] = [...row.hase.matchAll(/[HASE](\d+)/g)].map(m => +m[1]);
  const grit = Math.ceil(ll/2);
  const speed = 4 + Math.floor(a/2);
  const tech = 1+s;
  const setCard = (group, title, text) => { const card = groups[group].find(c => c[0] === title); if (!card) throw new Error('missing card ' + title); card[1] = text; };
  setCard('Quick actions', 'Boost', `Move ${speed} spaces as a quick action. Your standard move also covers ${speed}; both together cover ${2*speed}.`);
  setCard('Quick actions', 'Quick Tech', `Lock On, Bolster, Scan, or Invade within Sensors 15. Lock On and Invade need line of sight; Invade: +${tech} vs E-Defense, 2 Heat on hit plus an available invasion option.`);
  setCard('Quick actions', 'Skirmish', `Fire one weapon at +${grit} vs the target's defense, plus one other Aux on the same mount. Weapon attacks add GRIT, not Systems.`);
  setCard('Quick actions', 'Ram / Grapple', `Knock back or Prone a target, or hold one in a grapple. Mech attacks add +${grit} GRIT; saves use Save Target ${11+grit}.`);
  setCard('Protocols / free actions', 'Standard move', `Move ${speed} spaces without spending a quick or full action.`);
  setCard('Full actions', 'Barrage', `Fire two weapons at +${grit}, plus an eligible Aux on each fired mount. A pair of Aux weapons on the same mount can fire together; reload Loading weapons after use.`);
  setCard('Reactions', 'Overwatch', `1/round: Skirmish at +${grit} when a hostile starts movement within a weapon’s Threat (normally 1).`);
  groups['Passives'] = [
    ['Mech profile', `HP ${10 + 2*h + grit + (row.installed.includes('Personalizations 1') ? 2 : 0)}, Evasion ${8+a+(ll>=12?2:0)}, E-Defense ${10+s}, Speed ${speed}, Heat Cap ${6+e}, Repair Cap ${4+Math.floor(h/2)}, Sensors 15, SP ${row.sp}.`],
    ['Attack and save bonuses', `Weapon attacks +${grit}; tech attacks +${1+s}; Save Target ${11+grit}. Smart weapons attack E-Defense, but use weapon bonus, not tech attack.`],
    ['Brilliance / Data Siphon', '1/scene: free Quick Tech then free Bolster or Lock On. Tech attacks against hostiles also Scan them for free.'],
    ['Replaceable Parts', 'While resting, repair structure at 1 Repair per damage instead of 2.']
  ];
  groups['Quick actions'].push(['Chomolungma Invade', 'Balance Control Lockout: push 2 and Prone (Immobilize if already Prone, 1/scene per target); System Crusher: 4 total Heat and 4 Burn if it overheats (1/scene per target).']);
  groups['Full actions'].push(['Wide-Area Code Pulse', 'Spend 1 Core Power to Invade any number of hostiles within Sensors, ignoring line of sight and Invisible; misses become Impaired.']);
  groups['Weapons'] = row.weapon.split('; ').map(m => [m.split(': ')[0], m.split(': ')[1]]);
  groups['Weapons'].push(['Nexus stats', `Hunter-Killer: +${grit} vs E-Defense · Range 10 · 1d6 Kinetic, Smart. Light Nexus: +${grit} vs E-Defense · Range 10 · 1d3 Kinetic, Smart.`]);
  if (row.weapon.includes('Missile Racks')) groups['Weapons'].push(['Missile Racks', `Each: +${grit} vs Evasion · Range 10, Blast 1 · 1d3+1 Explosive, Loading. Two Aux on one Flex can fire together.`]);
  if (row.weapon.includes('Assault Rifle')) groups['Weapons'].push(['Assault Rifle', `+${grit} vs Evasion · Range 10 · 1d6 Kinetic, Reliable 2.`]);
  if (row.weapon.includes('Blackspot')) groups['Weapons'].push(['Blackspot Targeting Laser', `+${grit} vs Evasion · ${systems['Blackspot Targeting Laser'][1]}`]);
  if (row.weapon.includes('integrated: Light Nexus')) groups['Weapons'].push(['Integrated Weapon', `1/round, fire the second Light Nexus as a free attack at +${grit} vs E-Defense · Range 10 · 1d3 Kinetic when you fire another weapon.`]);
  for (const item of row.installed) {
    const name = item.replace(/ \d+$/, '');
    if (!systems[name] || name === 'Blackspot Targeting Laser') continue;
    const card = [name, `${systems[name][0]}: ${systems[name][1]}`];
    if (name === 'OSIRIS-Class NHP') card[1] = `Quick Tech: +${tech} vs E-Defense within Sensors 15. ${systems[name][1]}`;
    if (name === 'H0R_OS System Upgrade I') card[1] = `Invade: +${tech} vs E-Defense within Sensors 15. ${systems[name][1]}`;
    if (name === 'Stasis Bolt') card[1] = `${systems[name][0]}: contested ranged attack at +${grit}. ${systems[name][1]}`;
    const section = /Reaction/.test(systems[name][0]) ? 'Reactions' : /Protocol/i.test(systems[name][0]) ? 'Protocols / free actions' : /Passive|Boost|reroll/i.test(systems[name][0]) ? 'Passives' : 'Quick actions';
    groups[section].push(card);
  }
  for (const [name,rank] of ranks) {
    const entries = talents[name] || [];
    for (let i = 0; i < Math.min(roman[rank], entries.length); i++) {
      if (name === 'Technophile' && i < 2 && !row.installed.some(item => item.startsWith(i ? 'Student-Class NHP' : 'Servant-Class NHP'))) continue;
      const [timing,detail] = entries[i];
      const section = /Reaction/.test(timing) ? 'Reactions' : /Free action/.test(timing) ? 'Protocols / free actions' : /Passive|AI|Reroll/.test(timing) ? 'Passives' : 'Quick actions';
      groups[section].push([`${name} ${['I','II','III'][i]}`, `${timing}: ${detail}`]);
    }
  }
  for (const [name,card] of Object.entries(cores)) if (ll >= ({'Improved Armament':3,'The Lesson of Shaping':6,'Integrated Weapon':9,'Full Subjectivity Sync':12})[name]) groups['Passives'].push([name,card[1]]);
  return groups;
}
module.exports = abilityGroups;
