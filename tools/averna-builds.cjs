/* Independent AVERNA progressions. Each row is a complete print at that LL, not a shared plan. */
const base = ['Personalizations 1', 'Turret Drones 2', 'Rapid Burst Jump Jet System 2', 'Type-3 Projected Shield 2', 'Custom Paint Job 1'];
const relay = ['Personalizations 1', 'Turret Drones 2', 'Rapid Burst Jump Jet System 2', 'H0R_OS System Upgrade I 2', 'Autopod 1'];
const chomoLL3 = ['Personalizations 1','Rapid Burst Jump Jet System 2','H0R_OS System Upgrade I 2','H0R_OS System Upgrade II 2','Autopod 1','OSIRIS-Class NHP 3'];
const chomoLL4 = ['Personalizations 1','Rapid Burst Jump Jet System 2','H0R_OS System Upgrade I 2','Lotus Projector 2','Autopod 1','OSIRIS-Class NHP 3','Custom Paint Job 1'];
const chomoLL5 = ['Personalizations 1','Rapid Burst Jump Jet System 2','H0R_OS System Upgrade I 2','H0R_OS System Upgrade II 2','Lotus Projector 2','Autopod 1','OSIRIS-Class NHP 3'];
const chomoLL6 = ['Rapid Burst Jump Jet System 2','H0R_OS System Upgrade I 2','Lotus Projector 2','Autopod 1','OSIRIS-Class NHP 3','ATHENA-Class NHP 3','Enlightenment-Class NHP 0'];
const chomoLL7 = ['Rapid Burst Jump Jet System 2','H0R_OS System Upgrade I 2','Lotus Projector 2',"Dominion's Breadth 2",'OSIRIS-Class NHP 3','ATHENA-Class NHP 3','Enlightenment-Class NHP 0','Unstable NHP 0'];
const chomoLL9 = [...chomoLL7,'Blackspot Targeting Laser 1'];
const chomoLL10 = chomoLL9.map(item => item === 'Lotus Projector 2' ? 'Unhinge Chronology 2' : item);
const systems = {
  chomolungma: [
    [...base,'Servant-Class NHP 0'], [...relay,'Custom Paint Job 1','Servant-Class NHP 0'],
    [...relay,'H0R_OS System Upgrade II 2','Servant-Class NHP 0'], chomoLL3,
    chomoLL4, chomoLL5, chomoLL6, chomoLL7, chomoLL7,
    chomoLL9, chomoLL10, [...chomoLL10,'Stasis Bolt 1'], [...chomoLL10,'Stasis Bolt 1'],
  ],
  goblin: [
    base, relay, [...relay, 'H0R_OS System Upgrade II 2'], [...relay, 'H0R_OS System Upgrade II 2'],
    [...relay, 'H0R_OS System Upgrade II 2','Wandering Nightmare 1'],
    [...relay, 'H0R_OS System Upgrade II 2','Wandering Nightmare 1','Unhinge Chronology 2'],
    ['Personalizations 1','Turret Drones 2','H0R_OS System Upgrade I 2','H0R_OS System Upgrade II 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Autopod 1'],
  ],
  swallowtail: [
    base, relay, [...relay, 'Lotus Projector 2'],
    ['Personalizations 1','Turret Drones 2','Rapid Burst Jump Jet System 2','Lotus Projector 2','Autopod 1'],
    ['Turret Drones 2','Rapid Burst Jump Jet System 2','Lotus Projector 2','ATHENA-Class NHP 3','Autopod 1'],
    ['Turret Drones 2','Lotus Projector 2','ATHENA-Class NHP 3',"Dominion's Breadth 2",'Autopod 1'],
    ['Lotus Projector 2','ATHENA-Class NHP 3',"Dominion's Breadth 2",'Shahnameh 3','Autopod 1'],
  ],
};
systems.goblin.push(
  systems.goblin[6],
  ['Personalizations 1','Turret Drones 2','H0R_OS System Upgrade I 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Shahnameh 3','Autopod 1'],
  ['Personalizations 1','H0R_OS System Upgrade I 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','Autopod 1'],
  ['H0R_OS System Upgrade I 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','OSIRIS-Class NHP 3','Autopod 1'],
  ['H0R_OS System Upgrade I 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','OSIRIS-Class NHP 3','Autopod 1'],
  ['H0R_OS System Upgrade I 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','OSIRIS-Class NHP 3','Autopod 1'],
  ['H0R_OS System Upgrade I 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','OSIRIS-Class NHP 3','Omnibus Plate 1','Autopod 1']);
const gobBase = ['Personalizations 1','Rapid Burst Jump Jet System 2','H0R_OS System Upgrade I 2'];
const gobAI = [...gobBase,'ATHENA-Class NHP 3','LB/OC Cloaking Field 4','Enlightenment-Class NHP 0'];
systems.goblin = [
  [...base,'Servant-Class NHP 0'],
  ['Personalizations 1','Turret Drones 2','Rapid Burst Jump Jet System 2','Type-3 Projected Shield 2','H0R_OS System Upgrade I 2','Student-Class NHP 0'],
  [...base,'H0R_OS System Upgrade I 2','Autopod 1','Student-Class NHP 0'],
  [...gobBase,'Type-3 Projected Shield 2','Custom Paint Job 1','Autopod 1','OSIRIS-Class NHP 3','Enlightenment-Class NHP 0'],
  [...gobBase,'Type-3 Projected Shield 2','Lotus Projector 2','Autopod 1','OSIRIS-Class NHP 3','Enlightenment-Class NHP 0'],
  [...gobBase,'Lotus Projector 2','H0R_OS System Upgrade II 2','Retractable Profile 1','Autopod 1','OSIRIS-Class NHP 3','Enlightenment-Class NHP 0'],
  [...gobAI,'Retractable Profile 1','Autopod 1'],
  ...[7,8].map(() => [...gobAI,'Retractable Profile 1','Smartgun 2']),
  ...[9,10].map(n => [...gobAI,'Viral Logic Suite 2','Smartgun 2',...(n === 10 ? ['Ammo Case 0'] : [])]),
  ...[11,12].map(() => [...gobAI,'Viral Logic Suite 2','Law of Blades 2','Custom Paint Job 1','Ammo Case 0'])
];
systems.swallowtail.push(
  ['Lotus Projector 2','ATHENA-Class NHP 3',"Dominion's Breadth 2",'Shahnameh 3','H0R_OS System Upgrade I 2','Autopod 1'],
  ['Lotus Projector 2','ATHENA-Class NHP 3','Shahnameh 3','H0R_OS System Upgrade I 2','H0R_OS System Upgrade II 2','Autopod 1'],
  ['Lotus Projector 2','ATHENA-Class NHP 3','Shahnameh 3','H0R_OS System Upgrade I 2','PEBCAC 2','Autopod 1'],
  ['Lotus Projector 2','ATHENA-Class NHP 3','Shahnameh 3','H0R_OS System Upgrade I 2','PEBCAC 2','Omnibus Plate 1','Autopod 1'],
  ['Lotus Projector 2','ATHENA-Class NHP 3','Shahnameh 3','H0R_OS System Upgrade I 2','Omnibus Plate 1','Wandering Nightmare 1','Unhinge Chronology 2','Autopod 1'],
  ['Lotus Projector 2','ATHENA-Class NHP 3','Shahnameh 3','H0R_OS System Upgrade I 2','Omnibus Plate 1','Wandering Nightmare 1','Unhinge Chronology 2','Autopod 1']);

const paths = {
  chomolungma: {
    name: 'Durable command', frameAt: 0, baseSP: 7,
    licenses: ['None','Goblin I','Goblin II','Goblin III','Swallowtail I','Swallowtail II','Swallowtail III','Emperor I','Kidd I','Lich I','Lich II','Napoleon I','Monarch I'],
    talents: ['Spotter I / Leader I / Technophile I','Spotter II','Spotter III','Leader II','Leader III','Technophile II','Technophile III','Iconoclast I','Iconoclast II','Iconoclast III','Skirmisher I','Skirmisher II','Skirmisher III'],
    cores: {3:'Improved Armament',6:'The Lesson of Shaping',9:'Integrated Weapon',12:'Full Subjectivity Sync'},
    hase: n => [Math.min(6,2+n), n >= 8 ? 2 : n >= 7 ? 1 : 0, 0, n < 5 ? 0 : n < 7 ? n-4 : n < 9 ? 2 : n-6], // S,H,E,A
    triggers: [
      'Act Unseen or Unheard +2; Get a Hold of Something +2; Hack or Fix +2; Lead or Inspire +2',
      'Read a Situation +2','Get a Hold of Something +4','Hack or Fix +4',
      'Read a Situation +4','Take Someone Out +2','Act Unseen or Unheard +4',
      'Take Someone Out +4','Get a Hold of Something +6','Lead or Inspire +4',
      'Read a Situation +6','Act Unseen or Unheard +6','Lead or Inspire +6'
    ],
    plays: [
      'Fixer background and four +2 triggers. Servant-Class NHP is installed at 0 SP; the Nexus pair and Missile Racks are the fielded weapons.',
      'Broker Bond begins with Cosmocephalos (2/session). Autopod takes the Flex instead of the Missile Racks; the Nexus pair stays on Main/Aux.',
      'H0R_OS II adds constructs. Drop Paint Job to fit it; the Servant NHP remains installed.',
      'Replace Turret Drones with OSIRIS and replace Servant. Improved Armament adds a Flex to restore both Missile Racks.',
      'Swap H0R_OS II for Lotus Projector; Paint Job fills the spare SP. Keep Jump Jets and both weapon groups.',
      'Drop Paint Job and reinstall H0R_OS II. Retractable Profile remains unlocked but uninstalled.',
      'Drop H0R_OS II and Personalizations for ATHENA. Lesson of Shaping lets it coexist with OSIRIS; Technophile III replaces Student with the 0-SP Enlightenment NHP, which does not count against the AI limit.',
      'Iconoclast I installs the 0-SP Unstable NHP: four NHPs aboard. Memetic Spark costs a quick action, 1/round, for 5 AP Energy damage within Range 3. Replace Autopod with Dominion’s Breadth; Assault Rifle takes its Flex.',
      'Iconoclast II adds Transmuting Spark: after an OSIRIS or ATHENA action, project a Line 3 for 2 AP Energy as a free action. Each NHP can trigger it once per round. Kidd I unlocks Blackspot, but it waits for LL9 SP.',
      'Iconoclast III charges Transcension with Transmuting Sparks. In the transcendent state, Memetic Spark deals 9 AP Energy at Range 8; it still costs a quick action and is 1/round. Blackspot replaces Assault Rifle; Integrated Weapon adds a Light Nexus.',
      'Skirmisher I grants soft cover at the start of your turn until you attack or force a save. Swap Lotus for Unhinge Chronology; Haste grants an ally a free Boost until damaged.',
      'Skirmisher II moves you 2 spaces before or after Skirmish without provoking reactions. Stasis Bolt fills the new SP for ranged-attack defense.',
      'Skirmisher III makes the first reaction attack against you each round miss. Monarch I unlocks Sharanga as an alternate; keep the Missile Racks. Full Subjectivity Sync adds 2 Evasion.'
    ]
  },
  goblin: {
    name: 'Tech control', frameAt: 2, baseSP: 8,
    licenses: ['None','Goblin I','Goblin II','Goblin III','Swallowtail I','Swallowtail II','Swallowtail III','Pegasus I','Minotaur I','Minotaur II','Minotaur III','Lich I','Lich II'],
    talents: ['Spotter I / Leader I / Technophile I','Technophile II','Leader II','Technophile III','Leader III','Spotter II','Spotter III','Black Thumb I','Black Thumb II','Black Thumb III','Walking Armory I','Walking Armory II','Walking Armory III'],
    cores: {3:'The Lesson of the Held Image',6:'Full Subjectivity Sync',9:'The Lesson of the Open Door',12:'The Lesson of Disbelief'},
    hase: n => [Math.min(6,2+n), n < 5 ? 0 : n < 6 ? 1 : n < 9 ? 2 : n < 10 ? 3 : 4, n < 7 ? 0 : n < 8 ? 1 : 2, n < 11 ? 0 : n-10],
    triggers: ['Act Unseen or Unheard +2; Get a Hold of Something +2; Hack or Fix +2; Lead or Inspire +2','Read a Situation +2','Take Someone Out +2','Get a Hold of Something +4','Read a Situation +4','Act Unseen or Unheard +4','Get a Hold of Something +6','Read a Situation +6','Take Someone Out +4','Act Unseen or Unheard +6','Lead or Inspire +4','Hack or Fix +4','Lead or Inspire +6'],
    plays: [
      'Planned respec replaces Hacker I with Technophile I. Keep the fielded Chomolungma loadout as history.',
      'Install H0R_OS I and Student. Eject Power Cores jams on a successful Invade.',
      'Print Goblin and mount Autopod. Restore Custom Paint Job.',
      'Install OSIRIS and Enlightenment. Held Image supplies Lock On at an ally turn start.',
      'Replace Paint Job with Lotus Projector.',
      'Replace Projected Shield with H0R_OS II and Retractable Profile.',
      'Replace OSIRIS, Lotus and H0R_OS II with ATHENA and the Cloaking Field. The field costs 2 Heat.',
      'Swap Autopod for Smartgun. Black Thumb I protects the dismounted pilot.',
      'Minotaur I unlocks Viral Logic Suite. Keep the existing loadout.',
      'Replace Retractable Profile with Viral Logic Suite. Banish punishes voluntary movement.',
      'Law of Blades is unlocked. Walking Armory adds a 0-SP Ammo Case.',
      'Swap Smartgun for Unraveler, install Law of Blades and restore Custom Paint Job. Smartgun is an alternate loadout.',
      'Lich II unlocks Unhinge Chronology for an alternate loadout. The Lesson of Disbelief improves Systems checks and saves.'
    ]
  },
  swallowtail: {
    name: 'Lock On scout', frameAt: 3, baseSP: 6,
    licenses: ['None','Goblin I','Swallowtail I','Swallowtail II','Swallowtail III','Emperor I','Emperor II','Goblin II','Goblin III','Kidd I','Kidd II','Lich I','Lich II'],
    talents: ['Spotter I / Leader I / Drone Commander I','Spotter II','Spotter III','Leader II','Leader III','House Guard I','House Guard II','Technophile I','Technophile II','Technophile III','Field Analyst I','Field Analyst II','Sysop I'],
    cores: {3:'Improved Armament',6:'Full Subjectivity Sync',9:'The Lesson of the Held Image',12:'The Lesson of the Open Door'},
    hase: n => [Math.min(6,2+n),Math.min(4,Math.max(0,n-8)),0,Math.min(4,Math.max(0,n-4))], // S,H,E,A
    plays: [
      'Start on fielded Chomolungma. Lock On and let the adjacent striker spend it.',
      'Autopod closes the ally-fed loop; Goblin I gives its weapon but not its frame.',
      'Lotus reveals hiding enemies. Spotter III lets an adjacent ally react to a new mark.',
      'Print Swallowtail. A mark you inflict also Shreds its target 1/round. Flex holds Autopod; bonus Flex restores Hunter-Killer.',
      'ATHENA creates a long-range information zone. Its automatic Lock On may not count as inflicted by you for Prophetic Scanners.',
      'Dominion’s Breadth adds ally Overshield. Staying still gives Invisible until movement, reaction, or next turn.',
      'Shahnameh replaces Turret Drones; Lotus remains a scout drone. Full Subjectivity Sync adds 2 Evasion. Mark a high-Armor enemy.',
      'H0R_OS I adds Puppet System. Its Quick Tech and Lock On compete for actions, so use Brilliance only on the earlier Chomolungma.',
      'H0R_OS II adds cover and decoys, but is not needed for every fight. ATHENA remains the only installed AI.',
      'Held Image marks at an ally turn start and should trigger Prophetic Scanners when you inflict it; using it spends the reaction needed for Autopod that turn.',
      'Omnibus Plate protects a drone or deployable, not the pilot. PEBCAC can clear hostile tech with an unpredictable side effect.',
      'Install Wandering Nightmare and Unhinge Chronology; drop PEBCAC. Keep allies’ reaction attacks outside Nightmare’s zone.',
      'Unhinge Chronology grants movement support; Open Door sharpens your save effects. Keep the Lock On/Shredded target inside Autopod 15.'
    ]
  }
};

const weapon = (id,n) => {
  if (id === 'chomolungma') {
    if (n === 0) return 'Main/Aux: Hunter-Killer Nexus + Light Nexus; Flex: two Missile Racks';
    if (n < 3) return 'Main/Aux: Hunter-Killer Nexus + Light Nexus; Flex: Autopod';
    if (n < 7) return 'Main/Aux: Hunter-Killer Nexus + Light Nexus; Flex: Autopod; bonus Flex: two Missile Racks';
    return `Main/Aux: Hunter-Killer Nexus + Light Nexus; Flex: ${n >= 9 ? 'Blackspot Targeting Laser' : 'Assault Rifle'}; bonus Flex: two Missile Racks${n >= 9 ? '; integrated: Light Nexus' : ''}`;
  }
  if (n === 0) return 'Main/Aux: Hunter-Killer Nexus + Light Nexus; Flex: two Missile Racks';
  if (id === 'goblin') {
    if (n === 1) return 'Main/Aux: Hunter-Killer Nexus + Light Nexus; Flex: two Missile Racks';
    if (n <= 6) return 'Flex: Autopod';
    if (n <= 10) return 'Flex: Smartgun';
    return 'Flex: Unraveler';
  }
  if (n < 3) return 'Main/Aux: Autopod + Light Nexus; Flex: two Missile Racks';
  if (id === 'goblin') return 'Flex: Autopod; bonus Flex: two Missile Racks';
  if (id === 'swallowtail') return 'Flex: Autopod; Aux/Aux: two Missile Racks; bonus Flex: Hunter-Killer Nexus';
  return 'Main/Aux: Autopod + Light Nexus; Flex: two Missile Racks; bonus Flex: Hunter-Killer Nexus';
};
const grip = (id,n) => id === 'goblin' && n >= 2 ? 8 : id === 'swallowtail' && n >= 3 ? 6 : 7;
const rows = Object.fromEntries(Object.entries(paths).map(([id,p]) => {
  const triggers = new Map();
  return [id,p.licenses.map((license,n) => {
    for (const gain of (p.triggers?.[n] || '').split('; ').filter(Boolean)) {
      const [, name, rank] = gain.match(/^(.*) \+(\d+)$/);
      triggers.set(name, rank);
    }
    const [s,h,e,a] = p.hase(n);
    const sp = grip(id,n) + Math.floor(s/2) + Math.ceil(n/2);
    const installed = systems[id][n];
    const used = installed.reduce((sum,item) => sum + Number(item.match(/ (\d+)$/)[1]),0);
    return { license, talent:p.talents[n], core:p.cores[n] || 'No new bonus', hase:`H${h} / A${a} / S${s} / E${e}`,
      trigger:triggers.size ? [...triggers].map(([name,rank]) => `${name} +${rank}`).join('; ') : undefined,
      sp, used, installed, weapon:weapon(id,n), play:p.plays[n], frame:n >= p.frameAt ? id === 'chomolungma' ? 'GMS Chomolungma' : id === 'goblin' ? 'HORUS Goblin' : 'SSC Swallowtail' : 'GMS Chomolungma' };
  })];
}));
module.exports = rows;
