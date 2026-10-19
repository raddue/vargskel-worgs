---
ticket: "#26"
title: "Mechbay: interactive loadout sandbox with a range finder"
date: "2026-10-19"
source: "design"
revision: 5
---

# Mechbay: interactive loadout sandbox with a range finder

Revision 5, after four adversarial review rounds (round 1: 5 Critical / 6 Significant / 5 Minor;
round 2: 1 / 8 / 6; round 3: 1 / 4 / 5; round 4: 0 / 4 / 4). Every finding from all four rounds is
resolved below; where a rule was in doubt the answer comes from `lancer-data` and `COMP/CON`, not
from memory.

## Problem

`mechbay.html` is a read-only CHASSIS REGISTER: roster plus campaign ledger. Nothing there lets a
player try a build, and nothing there can say what a build means at the table.

The record cannot answer that today because a loadout is prose. `campaign.js` stores
`loadout: "Main/Aux: Nexus (Hunter-Killer) / Nexus (Light) · Flex: Missile Rack / Missile Rack"` —
a display string no code can validate, gate, or measure. `tools/build-detail.cjs` already parses it
back (`loadoutItems()`), which is the tell: the format is read as data while it is written as copy.

## Decisions

From issue #26: sandbox only — nothing a player does writes `campaign.js`; the bay hands the GM an
export to land through `tools/apply-compcon.cjs`. Saved named builds per pilot are a later phase:
design for them, do not build them. Out of scope for v1: core bonuses, mods, talents on the mech
side, recomputed frame-derived stats, printing, persistence, write-back.

Settled this session: a new page `loadout.html` (`mechbay.html` stays the read-only register);
structured mounts in `campaign.js`; the range finder reports range bands plus the mech's attack
bonus, with no pilot-talent accuracy.

## What the rules data actually holds

Verified against `@massif/lancer-data` 3.1.7.

- **GMS frames in the data: `Everest` only**, plus a placeholder record `ERR: DATA NOT FOUND`
  (`license_id: missing_frame`). `GMS CHOMOLUNGMA` and `GMS SAGARMATHA` — the frames `campaign.js`
  fields on Averna and Wayward — are absent. "Slots come from the frame's mount list" is therefore
  false for two records; mounts are authored on the mech.
- Frames carry `license_id` and `source`, not `license`; SP is `stats.sp`.
- `lib/rules.json` `mount_fittings` is the authoritative fitting table (quoted below).
- Weapon `mount` (size) values: `Main`, `Auxiliary`, `Heavy`, `Superheavy`, `Ship-class`.
- Five weapons (Assault Cannon, Leviathan, Siege Cannon, Apocalypse Rail, ZF4) have no top-level
  `range`; their bands live in `profiles`. Four have no `license_level`.
- Seven weapons carry `sp` (Gandiva, Oracle LMG-I, Autopod, Autogun, Shatterhead 1 each; Nanobot
  Whip, Smartgun 2 each) — SP is not a systems-only cost.
- Area/pattern tags: `Blast N` is placed at a `Range` distance; **`Cone N`, `Burst N` and `Line N`
  start at the attacker and are distance gates of their own**; `Threat N` is a gate; `Thrown N` is a
  gate. Four weapons have only Cone or Burst (Bristlecrown, Daisy Cutter, Krakatoa, Annihilation
  Nexus).

## Data model

`campaign.js` stays the only file the GM edits, and `check-all.cjs` keeps proving it consistent.

- **Pilot:** add `ll` (integer) and `licences` — a list of `{ name, rank }`, because a LANCER licence
  is a *ranked* book (`Blackbeard II`) and a flat name list would over-grant the moment any pilot
  passes LL0. At LL0 the list is empty: the licence rule grants GMS gear and frames, not a book, so
  `licences: ["GMS"]` would be a fiction. `check-all` asserts `ll` agrees with the `LL<n>` token in
  `background`.
- **Mech mounts:** replace the `loadout` string with
  `mounts: [{ slot: "Main/Aux", weapons: ["Nexus (Hunter-Killer)", "Nexus (Light)"] }, …]`, in the
  frame's printed slot order. This list is the record's slot layout. A seat may carry
  `locked: true`: a Superheavy weapon (see below) consumes its Heavy seat **and** locks one more
  seat, which is a field on the record because the lock is part of the build, not a page detail.
- **Mech systems:** replace the `systems` string with a list of names.
- **Derived display:** `UI.loadoutString(mech)` and `UI.systemString(mech)` in `archive.js` render
  exactly the copy the dossiers print today — slots joined by `" · "`, weapons inside a slot by
  `" / "`, `"<slot>: <weapons>"`; systems joined by `", "`.

### Every reader, and what each one does

| Reader | Reads | Change |
|---|---|---|
| `archive.js:52-62` (`detailMech`, `ditems(m.loadout)` / `dnames(m.systems)`) | both | take the structured fields |
| `archive.js:182, 263, 285, 294` | both | call the formatters |
| `tools/build-detail.cjs:61, 70` (`loadoutItems`, `list`) | both | take the structured fields |
| `check-all.cjs:521-527` | `m.loadout` | `find(m => m.loadout …)` picks `C.mechs[0]` and then calls `.includes()` on `undefined`, killing the suite — use the formatter |
| `check-all.cjs:98-107` (snapshot compare **and** `pick()` under `--update-snapshot`) | raw record fields | **pins derived strings under new keys** `loadoutString` / `systemString`, written and compared through one `snapshotView(rec)` helper. The helper calls `UI.loadoutString` / `UI.systemString` — so the `document`/`matchMedia` stub and the `archive.js` vm load currently sitting at `check-all.cjs:201-208` **move above line 98** (contract: one hoisted `UI` instance serves both the snapshot compare and the later markup checks). `archive.js:351-353` touches `matchMedia` and `document.querySelectorAll` at load, so it cannot run in the bare `{ window: {} }` sandbox that loads `campaign.js`; the stub must exist first. If that hoisted `archive.js` load fails (`check-all.cjs:208`'s path), `snapshotView` must **report the problem and skip the snapshot checks** rather than call `UI.loadoutString` on an undefined `UI` and kill the run with a TypeError |
| `tools/apply-compcon.cjs` `finish()` | runs `check-all --update-snapshot` | inherits the helper above; no separate change |
| `tools/roster-snapshot.json` | the two pinned strings | **renaming the pinned keys (`loadout`/`systems` → `loadoutString`/`systemString`) is a stated one-time manual edit** in the same commit, because `pick()` copies only keys the snapshot already has — otherwise `--update-snapshot` writes `loadout: undefined` (`JSON.stringify` drops it) and an array for `systems`, silently losing the pin. `check-all` reports a snapshot still carrying the old keys as a problem naming the fix, so a missed rename fails loudly instead of losing coverage. The same edit **adds Averna's two keys**, copied from today's `campaign.js:102`: the snapshot pins only five mechs today and Averna is the one `Main/Aux` record, i.e. the hardest formatter case, so leaving it unpinned would leave test 3 blind where it matters most |

`tools/print-check.cjs`, `tools/plate-check.cjs` and `tools/personnel-*.cjs` do not read either field.

## Mount legality, from `rules.json`

`mount_fittings` (verbatim): `Auxiliary → [Auxiliary]`; `Main → [Main, Auxiliary]`;
`Flex → [Main, Auxiliary]`; `Heavy → [Superheavy, Heavy, Main, Auxiliary]`.

The frame slot vocabulary is `Main`, `Flex`, `Heavy`, `Main/Aux`, `Aux/Aux` — **`Superheavy` is a
weapon size, not a slot**, and a mech record carrying a `"Superheavy"` slot is a `check-all` problem.
Composite slots are two seats: `Main/Aux` = one Main seat + one Auxiliary seat; `Aux/Aux` = two
Auxiliary seats. Flex additionally takes the book's two-Auxiliary fit:

| Slot | Accepts |
|---|---|
| `Main` | 1 of {Main, Auxiliary} |
| `Flex` | 1 of {Main, Auxiliary}, or 2 Auxiliary |
| `Heavy` | 1 of {Heavy, Main, Auxiliary}, or 1 Superheavy **plus one locked seat** |
| `Main/Aux` | up to 2 Auxiliary, or 1 Main + 1 Auxiliary (a Main seat holds an Auxiliary, so both seats may be Auxiliary) |
| `Aux/Aux` | up to 2 Auxiliary |

Every current record passes, checked slot by slot: Averna `Main/Aux[Main,Aux]` + `Flex[2 Aux]`;
Tombstone `Main[Aux]` + `Flex[Main]` + `Heavy[Heavy]`; Wayward `Main[Main]` + `Flex[2 Aux]` +
`Heavy[Heavy]`; Scooteroo `Main[Main]` + `Flex[RPG, which is a Main]` + `Heavy[Howitzer]`; Skaldr
`Main[Main]` + `Flex[Main]` + `Heavy[Heavy]`; Alba `Main[Aux]` + `Flex[2 Aux]` + `Heavy[Heavy]`.
The Cyclone Pulse Rifle (Superheavy) is legal in a Heavy slot, so it is offerable at LL0 rather than
unplaceable. `check-all` asserts this list, so "the six records validate" is a test.

**Superheavy takes two seats.** `mount_fittings` says a Heavy seat fits a Superheavy size; LANCER
adds that the weapon requires a Heavy mount *and one more mount of any type, which is then locked*.
So placing a Superheavy in a Heavy seat is refused with `NEEDS SECOND MOUNT` until another seat is
marked `locked` — otherwise an Everest could field a Cyclone Pulse Rifle plus a full Main and Flex.
No current record mounts a Superheavy, so no record changes and the lock stays an unexercised-in-
data path proved by test.

The lock is a rule, not a flag: a locked seat **must be empty**, may exist **only while a Superheavy
is mounted on that mech**, and there is **at most one** per Superheavy. `canMount` therefore refuses
any weapon placed into a locked seat (`SLOT LOCKED`), and `check-all` rejects a record carrying
`locked: true` with nothing mounted on a Heavy seat — otherwise a stray flag would permanently block
a slot that nothing explains.

`UI.canMount(pilot, build, slotIndex, weapon, catalogue)` → `{ok, reason}`, taking the whole build so
it can actually decide: reasons `UNLICENSED`, `WRONG MOUNT TYPE`, `SLOT FULL`, `SLOT LOCKED`, `NEEDS SECOND MOUNT`,
`OVER SP CAP`, `UNKNOWN WEAPON`, `UNKNOWN FRAME LICENCE`, `DUPLICATE UNIQUE ITEM`, `AI LIMIT`.
Uniqueness is a real gate, not a nicety: 104 systems and 3 weapons carry `tg_unique`
(`Personalizations`, `Custom Paint Job`, `Type-3 Projected Shield`, `EVA Module` among them), and 13
systems carry `tg_ai` with a one-AI-per-mech limit. `UI.spCheck(build, frame, catalogue)` is
separate, since the cap depends on the whole build.

## Catalogue

`tools/build-catalogue.cjs` derives `catalogue.js` (`window.CATALOGUE`) from lancer-data 3.1.7, with
its own header (not `detail.js`'s "subset: only items fielded by this campaign", which would be
false) and the same `--check` staleness gate. Mechanical fields only; prose is `detail.js`'s job:

- `weapons`: name, `mount`, `bands` **per profile** (each profile's `range` plus its own area tags),
  `damage`, tag names, `sp` (default 0), `license`, `license_level` (missing → 0)
- `systems`: name, `sp`, `license`, `license_level`
- `frames`: name, `source`, `mounts`, `sp`, `license_id`, `license_level`

**Not offered** by the bay, though still resolvable for display: placeholder records (`ERR: DATA NOT
FOUND`, ids `missing_*`), `Ship-class` weapons, `id` ending `_integrated` (Latch Drone, M35 Mjolnir,
ZF4 SOLIDCORE, Apocalypse Rail — frame-integrated, no licence), and `talent_item: true` (Fuel Rod
Gun, Prototype Weapon I-III, Ammo Case I-III, the NHP classes). Scooteroo's `Ammo Case I` is one of those: it stays
resolvable so the dossier still prints it, and the bay shows it as talent-granted rather than
purchasable.

## System points

Cap = `frame.stats.sp + floor(mech.sys / 2) + ceil(pilot.ll / 2)` — the LANCER formula, and both
inputs already sit on the records (the mech's `sys`, and `ll` added above). Grit is half LL rounded
**up**, so `floor` would cap every odd-LL pilot one point short; all six pilots are LL0 today, which
is exactly why this needs test 4 to pin the term rather than the current data. Everest cap for the
four LL0 Everest records (all `sys: 0`) is 6, which is exactly what Tombstone, Scooteroo, Skaldr and
Alba spend, so the tested cap path is real. **Unknown cap** when the frame does not resolve in the
data (Averna, Wayward): the page says so instead of refusing, and the mech's `sys` is still used,
so a resolved frame swap shows the right cap for an Averna-y `sys: 2` build.

The total counts systems **and weapons with an `sp` cost**, so the seven SP-costing weapons are not
free. Names the catalogue does not know (`Spaceborn EVA`, talent-granted) are excluded from the total
and shown `UNKNOWN`, never counted as 0-and-clean.

## Range finder

`UI.rangeReadout(mech, distance, catalogue)` → per mounted weapon, per profile: can it fire at
`distance`, the band label(s), and the shot's accuracy.

A weapon can fire when **any** of its own gates reaches the distance: `Range N`, `Line N`, `Cone N`,
`Burst N`, `Threat N`, `Thrown N` when `N >= distance`. So Bristlecrown (Burst 1), Daisy Cutter
(Cone 7), Krakatoa (Cone 5) and Annihilation Nexus (Burst 2) can fire; Tactical Knife's
`Thrown 3` — a tag, not a range entry — extends its 1 to 3; Pistol's `Range 5` / `Threat 3` are both
gates. Bands are reported per profile, so an Assault Cannon's alternate fire modes are not blended
into one list. Cone and Line weapons are flagged "pattern, not proven": a scalar distance cannot
prove the pattern, and the readout says so rather than implying it.

Three states, not two, because `Blast N` reaches past its band: the centre must sit inside the band,
but the blast still covers up to `N` further. A target beyond the band but within `Range + N` reads
"out of band, in blast" — the readout would otherwise call Missile Rack at 11, RPG at 11-12 and
Howitzer at 21-22 out of range when the blast lands there. Non-numeric band values are shown as-is
and never gate: Apocalypse Rail's `Charge Rail: 4` profile carries `val: "N/A"`, which no `N >=
distance` rule can read.

Accuracy is reported as **two fields, never summed**: `mech.attackBonus` (the flat Grit-derived
number on the roll) and the weapon's own dice from `Accurate` / `Inaccurate` tags — LANCER adds or
removes a d6, it does not change the flat bonus. Only the Howitzer and the HMG are `Inaccurate`; the
Anti-Materiel Rifle is `Accurate` (`tg_accurate`), so test 5 must expect **+1** for it. Frames have no
attack-bonus field, and pilot talents stay out of v1.

The slider is a display: a stub DOM has no layout engine, so geometry is a chromium probe reported as
a probe, never as a passing test.

## Export, and the write path

One path: `UI.exportLoadout(mech)` emits the mech id, mounts and systems, and
`tools/apply-compcon.cjs --loadout <mech> <block>` writes them into `campaign.js`. Six defects must
be fixed first, all reproduced:

1. **The value matcher cannot round-trip these values.** `applyToText` matches
   `(^|[\s,{])field:\s*([^,}\n]*)`, stopping at the first comma: replacing `conditions: ["A", "B"]`
   with `["C"]` yields `conditions: ["C"], "B"] },` — corrupt text. Bracket-aware matching or region
   re-serialisation, plus a test. This also fixes the existing `conditions` path.
2. **Nothing is testable.** argv handling runs at top level (`apply-compcon.cjs:336`); add an
   `if (require.main === module)` guard and export `parseLoadoutBlock(text) -> { mech, mounts,
   systems }`.
3. Its selftest covers only a one-item list; extend it to a multi-item list and a value containing a
   comma.
4. **An empty list still gets written.** `applyToText` (`apply-compcon.cjs:91`) skips a field whose
   value is an empty array, so an export with `systems: []` would silently never land — the write
   path must treat "empty list" as a value, and test 6 covers it.
5. **Missing rules data stops the run.** `--loadout` regenerates `detail.js` first, and
   `build-detail.cjs:8` only tolerates missing lancer-data under `--check`; without the guard it
   throws. `--loadout` therefore checks for the data directory *before* touching `campaign.js` and
   stops with the regen command and the reason, so a partial write cannot happen.
6. **Written objects must keep the file's own style.** The array writer (`apply-compcon.cjs:88`)
   serialises with `JSON.stringify`, so `mounts` would land as `{"slot":"Main","weapons":[…]}`.
   Hand-written `{ slot: "Main", … }` then never matches, the unchanged-write check at `:97` misses
   every time, and each run rewrites the region in a different style. The writer must emit the
   record's existing object style, and re-applying an identical loadout must be a **no-op** (test 6).

**`--loadout` regenerates `detail.js` first** (`node tools/build-detail.cjs`) and then runs
`check-all`, because any new weapon or system makes `detail.js` stale and `check-all.cjs:184` runs
`build-detail --check`. That gate — and the catalogue's — is **local-only**: `build-detail.cjs:8`
skips the check when lancer-data is absent, which is the case in CI
(`.github/workflows/check.yml` never fetches it). CI therefore cannot catch a stale `detail.js`; the
regen step in `--loadout` is what protects the write path.

The mode never touches session-state fields (`hpNow`, `structure`, `stress`, `heatNow`, `repairsNow`,
`conditions`), so the snapshot's pinning of those is undisturbed.

## Page

`loadout.html` loads `campaign.js`, `detail.js`, `catalogue.js`, `archive.js` plus inline glue, and
wears the same shell and nav as the other pages. Nav: add `loadout.html` to the `navPages` list
(`check-all.cjs:85`) **and** a separate assertion that every page's shell links to it — `navPages`
only asserts a page links to INTEL, not the reverse.

**`tools/render.cjs` grows a third argument first.** Its `mount(page, hash)` builds the sandbox and
runs the page's scripts inside the same call (`render.cjs:13-23`), so there is no moment at which
check-all can set a page global before the scripts run. It becomes
`mount(page, hash, globals = {})`, doing `Object.assign(box, globals)` before the script loop, with
one `--selftest` line proving a global arrives — the change test 8 depends on.

Glue stays `getElementById` host nodes plus `innerHTML`, because the `render.cjs` stub nodes have no
`createElement`, no `value`, no `checked`, and a no-op `addEventListener`; building controls via the
DOM API would throw inside `mount()` and kill check-all. The refusal path is proved through the stub
by feeding the page a **fixture build through a `window.__LOADOUT_FIXTURE` global**, passed as
`render.cjs`'s new `globals` argument (`mount("loadout.html", "", { __LOADOUT_FIXTURE: … })`) —
deterministic, no hash or click simulation needed, since the stub DOM has neither. If real controls
are wanted later, `render.cjs`'s stub and its selftest grow first.

Controls: pilot pick (gated by that pilot's licences), frame pick, one control per mount slot,
systems pick with the SP counter, distance slider with the readout, export button.

## Tests

Repo rule stands (`AGENTS.md`): failing test first, watch it fail, then implement. Suite:
`node check-all.cjs && node tools/render.cjs --selftest` — what CI runs. **Tests 6 and 7 live in
`apply-compcon`'s own `--selftest` and `check-all` spawns it**, because CI calls neither
`apply-compcon` nor anything else directly (`.github/workflows/check.yml:15` runs exactly the two
commands above), so a round trip tested anywhere else would never execute in CI.

1. `ll` matches the `LL<n>` token in every pilot's `background`; `licences` is a list of
   `{name, rank}`, empty at LL0.
2. Every mech's `mounts` are legal under the slot table, every weapon name resolves in the
   catalogue, no record carries a `"Superheavy"` slot, and **no record carries `locked: true`
   without a Superheavy mounted** — today's six records validate.
3. `UI.loadoutString` reproduces each mech's current dossier string exactly and `UI.systemString` its
   systems line; the roster snapshot's pinned strings are unchanged.
4. Gating refuses each case with its reason: unlicensed item, wrong mount type, slot full, over cap
   (on a **fixture** Everest with `sys: 3`, cap 7 — every real Everest record has `sys: 0`, so the
   fixture is what pins the term), a weapon placed into a locked seat, `locked: true` with nothing
   mounted on a Heavy seat, and an odd-`ll` pilot pinning `ceil`; unknown weapon, duplicate
   `tg_unique` item, second `tg_ai` system — **and 2 Auxiliary in a `Main`
   are refused while 2 Auxiliary in a `Main/Aux` are accepted**. A Superheavy weapon in a Heavy is
   refused `NEEDS SECOND MOUNT` on its own and **accepted once another seat is locked**.
5. `UI.rangeReadout` at fixed distances: a Threat-only weapon out of range at 5, a Range weapon in
   range at 5, a **Cone-only weapon (Daisy Cutter) in range at 5**, `Thrown 3` in range at 3, a
   `Blast` band reading "out of band, in blast" just past its band, a non-numeric band (Apocalypse
   Rail) that never gates, and accuracy reported as `attackBonus` and the dice separately rather
   than one summed number.
6. `apply-compcon --loadout` round trip through the exported `parseLoadoutBlock`, in that tool's
   `--selftest`: parse the export, apply it to `campaign.js` text, re-load the result — including a
   multi-item systems list, a value containing a comma, an **empty** systems list, and a **no-op
   re-apply** (byte-identical text, objects in the file's own style).
7. The `--loadout` mode leaves `hpNow`, `structure`, `stress`, `heatNow`, `repairsNow` and
   `conditions` untouched (also in `apply-compcon --selftest`).
8. `loadout.html` mounts in the stub DOM with a `window.__LOADOUT_FIXTURE` build and renders a
   refusal beside the control that caused it.

## Risks

- **Catalogue licence and size.** Derived rules data is GPL-3.0-or-later; `detail.js` already ships a
  derived subset under that header, so `catalogue.js` follows the same precedent. Mechanical fields
  only keep it small.
- **String regeneration.** `archive.js`, `build-detail.cjs --check`, the roster snapshot's new keys
  and `check-all.cjs:521` all read these fields; test 3 pins the copy, and a missed call site shows
  as a suite failure rather than a silently changed dossier.
- **`apply-compcon`.** Its comma bug means the round-trip test must land before the bay relies on it;
  the fix touches the live `conditions` path.
- **Local-only gates.** CI cannot catch staleness in `detail.js` or `catalogue.js` until it fetches
  lancer-data. Recorded here as a known gap, not fixed in this ticket.