/* Independent AVERNA progressions. Each row is a complete print at that LL, not a shared plan. */
const base = ['Personalizations 1', 'Turret Drones 2', 'Rapid Burst Jump Jet System 2', 'Type-3 Projected Shield 2', 'Custom Paint Job 1'];
const relay = ['Personalizations 1', 'Turret Drones 2', 'Rapid Burst Jump Jet System 2', 'H0R_OS System Upgrade I 2', 'Autopod 1'];
const systems = {
  chomolungma: [
    base, relay, [...relay, 'H0R_OS System Upgrade II 2'], [...relay, 'H0R_OS System Upgrade II 2'],
    ['Personalizations 1','Turret Drones 2','H0R_OS System Upgrade I 2','H0R_OS System Upgrade II 2',"Dominion's Breadth 2",'Autopod 1'],
    ['Personalizations 1','Turret Drones 2','H0R_OS System Upgrade I 2','H0R_OS System Upgrade II 2',"Dominion's Breadth 2",'Shahnameh 3','Autopod 1'],
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
systems.chomolungma.push(
  systems.chomolungma[5], systems.chomolungma[5],
  ['H0R_OS System Upgrade I 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','ATHENA-Class NHP 3','Autopod 1'],
  ['H0R_OS System Upgrade I 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','ATHENA-Class NHP 3','Autopod 1'],
  ['H0R_OS System Upgrade I 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','ATHENA-Class NHP 3','PEBCAC 2','Autopod 1'],
  ['H0R_OS System Upgrade I 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','ATHENA-Class NHP 3','PEBCAC 2','Autopod 1'],
  ['H0R_OS System Upgrade I 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','ATHENA-Class NHP 3','PEBCAC 2','Wandering Nightmare 1','Autopod 1'],
  ['H0R_OS System Upgrade I 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','ATHENA-Class NHP 3','Wandering Nightmare 1','Unhinge Chronology 2','Autopod 1']);
systems.goblin.push(
  systems.goblin[6],
  ['Personalizations 1','Turret Drones 2','H0R_OS System Upgrade I 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Shahnameh 3','Autopod 1'],
  ['Personalizations 1','H0R_OS System Upgrade I 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','Autopod 1'],
  ['H0R_OS System Upgrade I 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','OSIRIS-Class NHP 3','Autopod 1'],
  ['H0R_OS System Upgrade I 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','OSIRIS-Class NHP 3','Autopod 1'],
  ['H0R_OS System Upgrade I 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','OSIRIS-Class NHP 3','Autopod 1'],
  ['H0R_OS System Upgrade I 2','Wandering Nightmare 1','Unhinge Chronology 2',"Dominion's Breadth 2",'Shahnameh 3','Lotus Projector 2','OSIRIS-Class NHP 3','Omnibus Plate 1','Autopod 1']);
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
    licenses: ['None','Goblin I','Goblin II','Goblin III','Emperor I','Emperor II','Swallowtail I','Swallowtail II','Swallowtail III','Kidd I','Kidd II','Lich I','Lich II'],
    talents: ['Spotter I / Leader I / Drone Commander I','Spotter II','Spotter III','Leader II','Leader III','House Guard I','Technophile I','Technophile II','Technophile III','Field Analyst I','Field Analyst II','Sysop I','Sysop II'],
    cores: {3:'Improved Armament',6:'The Lesson of the Held Image',9:'Universal Compatibility',12:'The Lesson of the Open Door'},
    hase: n => [Math.min(6,2+n),0,Math.min(4,Math.max(0,n-4)),Math.min(4,Math.max(0,n-8))], // S,H,E,A reordered below
    plays: [
      'Fielded kit: mark for the adjacent striker; turret follows allied hits. Hacker is not required.',
      'Autopod replaces Hunter-Killer. Mark within 15; another character spends the mark for an automatic 3 Kinetic reaction.',
      'Spotter III gives an adjacent ally an immediate quick action when you mark. Your Autopod needs their attack and your reaction.',
      'Third mount returns Hunter-Killer. Leader commands and Autopod compete only if used on the same turn.',
      'Give Overshield 1 with Dominion’s Breadth, or mark and trigger Autopod. Hold close for House Guard next level.',
      'Shahnameh gives an ally Overshield 4 + GRIT and heat protection. House Guard I extends adjacency-based ally effects to Range 2.',
      'Held Image can mark at an ally turn start; on that turn you cannot also spend a reaction on Autopod. Choose an existing mark instead.',
      'Student-Class NHP is optional, not installed; ATHENA will occupy the AI slot. Keep protecting the striker.',
      'ATHENA replaces H0R_OS II, Turret Drones and Personalizations. Technophile III keeps ATHENA from cascading unless you allow it.',
      'Kidd I unlocks PEBCAC. Keep Lotus and ATHENA instead of spending an extra 2 SP yet.',
      'Install PEBCAC. Field Analyst II builds its die only on turns without actions affecting a hostile character other than Scan; marking prevents charge.',
      'Install Wandering Nightmare. It suppresses reactions inside its zone, including allies relying on reaction attacks.',
      'Swap PEBCAC for Unhinge Chronology. Haste gives a teammate free Boost each round until damaged; Open Door boosts your Save Target.'
    ]
  },
  goblin: {
    name: 'Tech control', frameAt: 2, baseSP: 8,
    licenses: ['None','Goblin I','Goblin II','Goblin III','Lich I','Lich II','Emperor I','Emperor II','Swallowtail I','Swallowtail II','Swallowtail III','Kidd I','Kidd II'],
    talents: ['Spotter I / Leader I / Drone Commander I','Spotter II','Spotter III','Leader II','Technophile I','Technophile II','Technophile III','Leader III','House Guard I','Field Analyst I','Field Analyst II','Sysop I','Sysop II'],
    cores: {3:'Improved Armament',6:'The Lesson of the Held Image',9:'The Lesson of the Open Door',12:'Universal Compatibility'},
    hase: n => [Math.min(6,2+n),Math.min(4,Math.max(0,n-4)),Math.min(4,Math.max(0,n-8)),0], // S,H,E,A
    plays: [
      'Fielded Chomolungma kit remains the LL0 starting point. Mark for adjacent allies.',
      'Goblin I unlocks Autopod, not the frame. Mark within 15 for the ally-triggered reaction.',
      'Print Goblin: Sensors 20 and +2 tech attack, but HP 6 and only one Flex. Keep Autopod; stow the racks.',
      'Improved Armament gives a second Flex for the two racks. Hack or mark from cover; avoid direct fire.',
      'Wandering Nightmare denies reactions in its zone. Keep allied reaction attackers outside it; Autopod can still fire from outside.',
      'Unhinge Chronology grants Haste or Slow. Student-Class NHP gives a mech-skill reroll only if installed; this print leaves its AI slot empty.',
      'Held Image and Autopod both require your reaction. Technophile III prevents cascade if you later install an AI; its optional Enlightenment NHP is not installed.',
      'Shahnameh supplies Overshield and heat resistance; keep the low-HP Goblin behind the line.',
      'Lotus Projector reveals hiding targets. You can mark at Sensors 20, while Autopod still reaches only 15.',
      'OSIRIS supplies aggressive quick tech; Open Door improves its save pressure. Only OSIRIS occupies the AI slot.',
      'Swallowtail III unlocks ATHENA as a swap, never a second installed NHP. Field Analyst I helps a missed ally attack.',
      'Kidd I unlocks PEBCAC but it is not installed. House Guard extends adjacency effects to Range 2.',
      'Omnibus Plate protects one drone or deployable and extends some of its effects. Goblin remains fragile: base HP 6 and Repairs 2.'
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
  if (n === 0) return 'Main/Aux: Hunter-Killer Nexus + Light Nexus; Flex: two Missile Racks';
  if (n < 3 || (id === 'goblin' && n === 2)) return id === 'goblin' && n === 2 ? 'Flex: Autopod (only mount)' : 'Main/Aux: Autopod + Light Nexus; Flex: two Missile Racks';
  if (id === 'goblin') return 'Flex: Autopod; bonus Flex: two Missile Racks';
  if (id === 'swallowtail') return 'Flex: Autopod; Aux/Aux: two Missile Racks; bonus Flex: Hunter-Killer Nexus';
  return 'Main/Aux: Autopod + Light Nexus; Flex: two Missile Racks; bonus Flex: Hunter-Killer Nexus';
};
const grip = (id,n) => id === 'goblin' && n >= 2 ? 8 : id === 'swallowtail' && n >= 3 ? 6 : 7;
const rows = Object.fromEntries(Object.entries(paths).map(([id,p]) => [id,p.licenses.map((license,n) => {
  const [s,h,e,a] = p.hase(n);
  const sp = grip(id,n) + Math.floor(s/2) + Math.ceil(n/2);
  const installed = systems[id][n];
  const used = installed.reduce((sum,item) => sum + Number(item.match(/ (\d+)$/)[1]),0);
  return { license, talent:p.talents[n], core:p.cores[n] || 'No new bonus', hase:`H${h} / A${a} / S${s} / E${e}`,
    sp, used, installed, weapon:weapon(id,n), play:p.plays[n], frame:n >= p.frameAt ? id === 'chomolungma' ? 'GMS Chomolungma' : id === 'goblin' ? 'HORUS Goblin' : 'SSC Swallowtail' : 'GMS Chomolungma' };
})]));
module.exports = rows;
