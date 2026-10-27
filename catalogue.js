/* Rules data (c) Massif Press, LANCER. Derived from @massif/lancer-data 3.1.7,
   GPL-3.0-or-later (github.com/massif-press/lancer-data).
   Supplement subset from Lancer Long Rim Data v2.0.3, Lancer Wallflower Data v3.0.5, LANCER: Dustgrave v2.0.3, Operation Solstice Rain Data v2.0.2 (GPL-3.0-or-later, (c) Massif Press). Mechanical fields only; campaign
   content itself is not lancer-data derived. */
window.CATALOGUE = {
 "weapons": {
  "ERR: DATA NOT FOUND": {
   "mount": "Main",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [],
   "bands": [],
   "tags": [],
   "profiles": []
  },
  "Anti-Materiel Rifle": {
   "mount": "Heavy",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "2d6",
     "type": "Kinetic"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 20
    }
   ],
   "tags": [
    {
     "id": "tg_accurate",
     "val": null
    },
    {
     "id": "tg_ap",
     "val": null
    },
    {
     "id": "tg_loading",
     "val": null
    },
    {
     "id": "tg_ordnance",
     "val": null
    }
   ],
   "profiles": []
  },
  "Assault Rifle": {
   "mount": "Main",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d6",
     "type": "Kinetic"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 10
    }
   ],
   "tags": [
    {
     "id": "tg_reliable",
     "val": 2
    }
   ],
   "profiles": []
  },
  "Charged Blade": {
   "mount": "Main",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d3+3",
     "type": "Energy"
    }
   ],
   "bands": [
    {
     "kind": "Threat",
     "value": 1
    }
   ],
   "tags": [
    {
     "id": "tg_ap",
     "val": null
    }
   ],
   "profiles": []
  },
  "Cyclone Pulse Rifle": {
   "mount": "Superheavy",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "3d6+3",
     "type": "Kinetic"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 15
    }
   ],
   "tags": [
    {
     "id": "tg_accurate",
     "val": null
    },
    {
     "id": "tg_loading",
     "val": null
    },
    {
     "id": "tg_reliable",
     "val": 5
    }
   ],
   "profiles": []
  },
  "Heavy Charged Blade": {
   "mount": "Heavy",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d6+3",
     "type": "Energy"
    }
   ],
   "bands": [
    {
     "kind": "Threat",
     "value": 1
    }
   ],
   "tags": [
    {
     "id": "tg_ap",
     "val": null
    }
   ],
   "profiles": []
  },
  "Heavy Machine Gun": {
   "mount": "Heavy",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "2d6+4",
     "type": "Kinetic"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 8
    }
   ],
   "tags": [
    {
     "id": "tg_inaccurate",
     "val": null
    }
   ],
   "profiles": []
  },
  "Heavy Melee Weapon": {
   "mount": "Heavy",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "2d6+1",
     "type": "Kinetic"
    }
   ],
   "bands": [
    {
     "kind": "Threat",
     "value": 1
    }
   ],
   "tags": [],
   "profiles": []
  },
  "Howitzer": {
   "mount": "Heavy",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "2d6",
     "type": "Explosive"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 20
    },
    {
     "kind": "Blast",
     "value": 2
    }
   ],
   "tags": [
    {
     "id": "tg_arcing",
     "val": null
    },
    {
     "id": "tg_inaccurate",
     "val": null
    },
    {
     "id": "tg_loading",
     "val": null
    },
    {
     "id": "tg_ordnance",
     "val": null
    }
   ],
   "profiles": []
  },
  "Missile Rack": {
   "mount": "Auxiliary",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d3+1",
     "type": "Explosive"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 10
    },
    {
     "kind": "Blast",
     "value": 1
    }
   ],
   "tags": [
    {
     "id": "tg_loading",
     "val": null
    }
   ],
   "profiles": []
  },
  "Mortar": {
   "mount": "Main",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d6+1",
     "type": "Explosive"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 15
    },
    {
     "kind": "Blast",
     "value": 1
    }
   ],
   "tags": [
    {
     "id": "tg_arcing",
     "val": null
    },
    {
     "id": "tg_inaccurate",
     "val": null
    }
   ],
   "profiles": []
  },
  "Nexus (Hunter-Killer)": {
   "mount": "Main",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d6",
     "type": "Kinetic"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 10
    }
   ],
   "tags": [
    {
     "id": "tg_smart",
     "val": null
    }
   ],
   "profiles": []
  },
  "Nexus (Light)": {
   "mount": "Auxiliary",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d3",
     "type": "Kinetic"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 10
    }
   ],
   "tags": [
    {
     "id": "tg_smart",
     "val": null
    }
   ],
   "profiles": []
  },
  "Pistol": {
   "mount": "Auxiliary",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d3",
     "type": "Kinetic"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 5
    },
    {
     "kind": "Threat",
     "value": 3
    }
   ],
   "tags": [
    {
     "id": "tg_reliable",
     "val": 1
    }
   ],
   "profiles": []
  },
  "Segment Knife": {
   "mount": "Auxiliary",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d3+1",
     "type": "Energy"
    }
   ],
   "bands": [
    {
     "kind": "Threat",
     "value": 1
    }
   ],
   "tags": [
    {
     "id": "tg_overkill",
     "val": null
    }
   ],
   "profiles": []
  },
  "Rocket-Propelled Grenade": {
   "mount": "Main",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d6+1",
     "type": "Explosive"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 10
    },
    {
     "kind": "Blast",
     "value": 2
    }
   ],
   "tags": [
    {
     "id": "tg_loading",
     "val": null
    },
    {
     "id": "tg_ordnance",
     "val": null
    }
   ],
   "profiles": []
  },
  "Shotgun": {
   "mount": "Main",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d6",
     "type": "Kinetic"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 5
    },
    {
     "kind": "Threat",
     "value": 3
    }
   ],
   "tags": [],
   "profiles": []
  },
  "Tactical Knife": {
   "mount": "Auxiliary",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d3+1",
     "type": "Kinetic"
    }
   ],
   "bands": [
    {
     "kind": "Threat",
     "value": 1
    },
    {
     "kind": "Thrown",
     "value": 3
    }
   ],
   "tags": [
    {
     "id": "tg_thrown",
     "val": 3
    }
   ],
   "profiles": []
  },
  "Tactical Melee Weapon": {
   "mount": "Main",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d6+2",
     "type": "Kinetic"
    }
   ],
   "bands": [
    {
     "kind": "Threat",
     "value": 1
    }
   ],
   "tags": [],
   "profiles": []
  },
  "Thermal Lance": {
   "mount": "Heavy",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d6+3",
     "type": "Energy"
    }
   ],
   "bands": [
    {
     "kind": "Line",
     "value": 10
    }
   ],
   "tags": [
    {
     "id": "tg_heat_self",
     "val": 2
    }
   ],
   "profiles": []
  },
  "Thermal Pistol": {
   "mount": "Auxiliary",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": 2,
     "type": "Energy"
    }
   ],
   "bands": [
    {
     "kind": "Line",
     "value": 5
    }
   ],
   "tags": [],
   "profiles": []
  },
  "Thermal Rifle": {
   "mount": "Main",
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "damage": [
    {
     "val": "1d3+2",
     "type": "Energy"
    }
   ],
   "bands": [
    {
     "kind": "Range",
     "value": 5
    }
   ],
   "tags": [
    {
     "id": "tg_ap",
     "val": null
    }
   ],
   "profiles": []
  }
 },
 "systems": {
  "ERR: DATA NOT FOUND": {
   "sp": 1,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": false,
   "tg_ai": false
  },
  "COMP/CON-Class Assistant Unit": {
   "sp": 2,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": true
  },
  "Custom Paint Job": {
   "sp": 1,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "Expanded Compartment": {
   "sp": 1,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "Manipulators": {
   "sp": 1,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "Pattern-A Smoke Charges": {
   "sp": 2,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "Pattern-A Jericho Deployable Cover": {
   "sp": 2,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "Pattern-B HEX Charges": {
   "sp": 2,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "Personalizations": {
   "sp": 1,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "Stable Structure": {
   "sp": 2,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "Turret Drones": {
   "sp": 2,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "Type-3 Projected Shield": {
   "sp": 2,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "EVA Module": {
   "sp": 1,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "Rapid Burst Jump Jet System": {
   "sp": 2,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "Type-I Flight System": {
   "sp": 3,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": false
  },
  "Ammo Case I": {
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": false,
   "tg_ai": false
  },
  "Servant-Class NHP": {
   "sp": 0,
   "license": "GMS",
   "license_level": 0,
   "tg_unique": true,
   "tg_ai": true
  }
 },
 "frames": {
  "GMS ERR: DATA NOT FOUND": {
   "mounts": [],
   "sys": 6,
   "license": "GMS",
   "license_level": 0,
   "mechtype": "Balanced",
   "name": "GMS ERR: DATA NOT FOUND"
  },
  "GMS Everest": {
   "mounts": [
    "Main",
    "Flex",
    "Heavy"
   ],
   "sys": 6,
   "license": "GMS",
   "license_level": 0,
   "mechtype": "Balanced",
   "name": "GMS Everest"
  },
  "GMS Chomolungma": {
   "mounts": [
    "Main/Aux",
    "Flex"
   ],
   "sys": 7,
   "license": "GMS",
   "license_level": 0,
   "mechtype": "Controller/Support",
   "name": "GMS Chomolungma"
  },
  "GMS Sagarmatha": {
   "mounts": [
    "Main",
    "Flex",
    "Heavy"
   ],
   "sys": 6,
   "license": "GMS",
   "license_level": 0,
   "mechtype": "Defender",
   "name": "GMS Sagarmatha"
  }
 },
 "fittings": {
  "Auxiliary": [
   "Auxiliary"
  ],
  "Main": [
   "Main",
   "Auxiliary"
  ],
  "Flex": [
   "Main",
   "Auxiliary"
  ],
  "Heavy": [
   "Superheavy",
   "Heavy",
   "Main",
   "Auxiliary"
  ]
 }
};
