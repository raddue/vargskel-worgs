---
ticket: "#26"
title: "Mechbay: interactive loadout sandbox with a range finder"
date: "2026-10-19"
source: "design"
revision: 10
---

# Mechbay: interactive loadout sandbox with a range finder

Revision 10, after nine adversarial review rounds (round 1: 5 Critical / 6 Significant / 5 Minor; rounds
2-9: 1/8/6, 1/4/5, 0/4/4, 0/4/3, 0/1/7, 0/1/3, 0/1/5, 0/7/10). Criticals have been zero since round 4; every
unapplied finding is resolved below.

## Problem

`mechbay.html` is a read-only CHASSIS REGISTER: roster plus campaign ledger. Nothing there lets a
player try a build, and nothing there can say what a build means at the table.

The record cannot answer that today because a loadout is prose. `campaign.js` stores
`loadout: "Main/Aux: Nexus (Hunter-Killer) / Nexus (Light) · Flex: Missile Rack / Missile Rack"`,
a display string no code can validate, gate, or measure. `tools/build-detail.cjs` already parses it
back (`loadoutItems()`), which is the tell: the format is read as data while it is written as copy.

## Decisions

From issue #26: sandbox only, nothing a player does writes `campaign.js`; the bay hands the GM an
export to land through `tools/apply-compcon.cjs`. Saved named builds per pilot are a later phase:
design for them, do not build them. Out of scope for v1: core bonuses, mods, talents on the mech
side, recomputed frame-derived stats, printing, persistence, write-back.

Settled this session: a new page `loadout.html` (`mechbay.html` stays the read-only register);
structured mounts in `campaign.js`; the range finder reports range bands plus the mech's attack
bonus, with no pilot-talent accuracy.

## What the rules data actually holds

Verified against `@massif/lancer-data` 3.1.7.

- **GMS frames in the data: `Everest` only**, plus a placeholder record `ERR: DATA NOT FOUND`
  (`license_id: missing_frame`). `GMS CHOMOLUNGMA` and `GMS SAGARMATHA`, the frames `campaign.js`
  fields on Averna and Wayward, are absent. "Slots come from the frame's mount list" is therefore
  false for two records; mounts are authored on the mech.
- Frames carry `license_id` and `source`, not `license`; SP is `stats.sp`.
- `lib/rules.json` `mount_fittings` is the authoritative fitting table (quoted below).
- Weapon `mount` (size) values: `Main`, `Auxiliary`, `Heavy`, `Superheavy`, `Ship-class`.
- Five weapons (Assault Cannon, Leviathan, Siege Cannon, Apocalypse Rail, ZF4) have no top-level
  `range`; their bands live in `profiles`. Four have no `license_level`.
- Seven weapons carry `sp` (Gandiva, Oracle LMG-I, Autopod, Autogun, Shatterhead 1 each; Nanobot
  Whip, Smartgun 2 each); SP is not a systems-only cost.
- Area/pattern tags: `Blast N` is placed at a `Range` distance; **`Cone N`, `Burst N` and `Line N`
  start at the attacker and are distance gates of their own**; `Threat N` is a gate; `Thrown N` is a
  gate. Four weapons have only Cone or Burst (Bristlecrown, Daisy Cutter, Krakatoa, Annihilation
  Nexus).

## Data model

`campaign.js` stays the only file the GM edits, and `check-all.cjs` keeps proving it consistent.

- **Pilot:** add `ll` (integer) and `licences`, a list of `{ name, rank }`, because a LANCER licence
  is a *ranked* book (`Blackbeard II`) and a flat name list would over-grant the moment any pilot
  passes LL0. At LL0 the list is empty: the licence rule grants GMS gear and frames, not a book, so
  `licences: ["GMS"]` would be a fiction. `check-all` asserts `ll` agrees with the `LL<n>` token in
  `background`.
- **Mech mounts:** replace the `loadout` string with
  `mounts: [{ slot: "Main/Aux", weapons: ["Nexus (Hunter-Killer)", "Nexus (Light)"] }, …]`, in the
  frame's printed slot order. This list is the record's slot layout. A mount may carry
  `locked: true`: a Superheavy weapon consumes its Heavy mount **and** locks one further mount, which
  is a field on the record because the lock is part of the build, not a page detail. The migration
  commit that introduces this field mints it with `JSON.stringify`, which is **not** the writer's
  style: `lit()` writes unquoted keys and one space after each comma (see the write path). That is
  fine, because the no-op check compares the *value* of the field's span, not its text, so the first
  `--loadout` run is still a no-op and the hand-written region is left exactly as it stands.
- **Mech systems:** replace the `systems` string with a list of names.
- **Derived display:** `UI.loadoutString(mech)` and `UI.systemString(mech)` in `archive.js` render
  exactly the copy the dossiers print today, slots joined by `" · "`, weapons inside a slot by
  `" / "`, `"<slot>: <weapons>"`; systems joined by `", "`.

### Every reader, and what each one does

| Reader | Reads | Change |
|---|---|---|
| `archive.js:52-62` (`detailMech`, `ditems(m.loadout)` / `dnames(m.systems)`) | both | take the structured fields |
| `archive.js:185, 263, 285, 294` | both | call the formatters |
| `tools/build-detail.cjs:61, 70` (`loadoutItems`, `list`) | both | take the structured fields |
| `check-all.cjs:580-586` | `m.loadout` | `find(m => m.loadout …)` picks `C.mechs[0]` and then calls `.includes()` on `undefined`, killing the suite; use the formatter |
| `check-all.cjs` (new, beside the existing snapshot compare at `:103-116`) (snapshot compare **and** `pick()` under `--update-snapshot`) | raw record fields | **pins derived strings under new keys** `loadoutString` / `systemString`, written and compared through one `snapshotView(rec)` helper. The helper calls `UI.loadoutString` / `UI.systemString`, so the `document`/`matchMedia` stub and the `archive.js` vm load currently sitting at `check-all.cjs:210-218` **move above the snapshot compare** (contract: one hoisted `UI` instance serves both the snapshot compare and the later markup checks). `archive.js:362-363` touches `matchMedia` and `document.querySelectorAll` at load, so it cannot run in the bare `{ window: {} }` sandbox that loads `campaign.js`; the stub must exist first, and **`catalogue.js` is loaded into that same hoisted box** |
| `tools/apply-compcon.cjs` `finish()` | runs `check-all --update-snapshot` | inherits the helper above; no separate change |
| `tools/roster-snapshot.json` | the two pinned strings | **renaming the pinned keys (`loadout`/`systems` → `loadoutString`/`systemString`) is a stated one-time manual edit** in the same commit, because `pick()` copies only keys the snapshot already has; otherwise `--update-snapshot` writes `loadout: undefined` (`JSON.stringify` drops it) and an array for `systems`, silently losing the pin. `check-all` reports a snapshot still carrying the old keys as a problem naming the fix, so a missed rename fails loudly instead of losing coverage. The same edit **adds Averna's two keys**, copied from today's `campaign.js:103`: the snapshot pins only five mechs today and Averna is the one `Main/Aux` record, i.e. the hardest formatter case, so leaving it unpinned would leave test 3 blind where it matters most |
| `check-all.cjs:192` (existing) | spawns `build-detail --check` | unchanged |
| `check-all.cjs` (new, next to `:333`) | **spawns `apply-compcon --selftest`** and fails on a non-zero exit | tests 6 and 7 have no other route into CI (`.github/workflows/check.yml:15` runs only the two commands) |
| `check-all.cjs` (new) | **spawns `build-catalogue --check`** so a stale `catalogue.js` fails the suite locally | mirrors the `detail.js` gate |
| `check-all.cjs` after `require("./tools/render.cjs")` at `:333` | **test 8**, mount `loadout.html` with the `__LOADOUT_FIXTURE` global and assert the rendered refusal | the only place a page can be mounted with globals |

The helper calls `UI.loadoutString` / `UI.systemString`, so the `document`/`matchMedia` stub and the
`archive.js` vm load currently sitting at `check-all.cjs:210-218` **move above the snapshot compare**: one hoisted
`UI` instance serves both the snapshot compare and the later markup checks. `archive.js:362-363`
touches `matchMedia` and `document.querySelectorAll` at load, so it cannot run in the bare
`{ window: {} }` sandbox that loads `campaign.js`; the stub must exist first.
**`catalogue.js` is loaded into that same hoisted box**: tests 2, 4 and 5 need `CATALOGUE`, and
loading it costs no lancer-data at run time. If that hoisted `archive.js` load fails
(`check-all.cjs:217`'s path), `snapshotView` must **report the problem**, **skip the snapshot
checks**, and **skip the `--update-snapshot` write as well**, rather than call `UI.loadoutString` on
an undefined `UI` and kill the run with a TypeError. Skipping the write matters as much as skipping
the compare: `pick()` copies only the keys the snapshot already has, so writing through an undefined
`UI` would store `loadoutString: undefined`, which `JSON.stringify` drops, silently losing those pins
while the old-key detector sees nothing wrong. The helper and the pick/write logic live in
`tools/snapshot.cjs`, taking `(C, UI, snap)`, which is also what lets the throwing-stub test run
in-process.

`tools/print-check.cjs`, `tools/plate-check.cjs` and `tools/personnel-*.cjs` do not read either field.

## Mount legality, from `rules.json`

`mount_fittings` (verbatim): `Auxiliary → [Auxiliary]`; `Main → [Main, Auxiliary]`;
`Flex → [Main, Auxiliary]`; `Heavy → [Superheavy, Heavy, Main, Auxiliary]`.

The frame slot vocabulary is `Main`, `Flex`, `Heavy`, `Main/Aux`, `Aux/Aux`; **`Superheavy` is a
weapon size, not a slot**, and a mech record carrying a `"Superheavy"` slot is a `check-all` problem.
Composite slots are two seats: `Main/Aux` = one Main seat + one Auxiliary seat; `Aux/Aux` = two
Auxiliary seats. Flex additionally takes the book's two-Auxiliary fit:

| Slot | Accepts |
|---|---|
| `Main` | 1 of {Main, Auxiliary} |
| `Flex` | 1 of {Main, Auxiliary}, or 2 Auxiliary |
| `Heavy` | 1 of {Heavy, Main, Auxiliary}, or 1 Superheavy **plus one locked mount** |
| `Main/Aux` | up to 2 Auxiliary, or 1 Main + 1 Auxiliary (a Main seat holds an Auxiliary, so both seats may be Auxiliary) |
| `Aux/Aux` | up to 2 Auxiliary |

Every current record passes, checked slot by slot: Averna `Main/Aux[Main,Aux]` + `Flex[2 Aux]`;
Tombstone `Main[Aux]` + `Flex[Main]` + `Heavy[Heavy]`; Wayward `Main[Main]` + `Flex[2 Aux]` +
`Heavy[Heavy]`; Scooteroo `Main[Main]` + `Flex[RPG, which is a Main]` + `Heavy[Howitzer]`; Skaldr
`Main[Main]` + `Flex[Main]` + `Heavy[Heavy]`; Alba `Main[Aux]` + `Flex[2 Aux]` + `Heavy[Heavy]`.
The Cyclone Pulse Rifle (Superheavy) is legal in a Heavy slot, so it is offerable at LL0 rather than
unplaceable. `check-all` asserts this list, so "the six records validate" is a test.

**Superheavy takes two mounts.** `mount_fittings` says a Heavy mount fits a Superheavy size; LANCER
adds that the weapon requires a Heavy mount *and one more mount of any type, which is then locked*.
So a Superheavy is placed by **one** `UI.place` call carrying `{ lockSlot }`: the weapon goes into the
Heavy mount and `lockSlot` is locked in the same call, because LANCER's "one additional mount" is one
decision, not two. Choosing which mount to give up is the page's job; the record stores the outcome.
Nothing about a Superheavy is placed on its own, and the `NEEDS SECOND MOUNT` refusal means "no
`lockSlot` was given". No current record mounts a Superheavy,
so no record changes and the lock stays an unexercised-in-data path proved by test.

**The lock is on a whole mount, not a seat.** A locked mount is empty (`weapons: []`) and cannot
receive a weapon (`SLOT LOCKED`). A bad `lockSlot` is refused on its own terms: the Superheavy's own
mount (`SLOT FULL`), a mount that already holds weapons (`SLOT FULL`), or one already locked
(`SLOT LOCKED`). **Removing the Superheavy clears the lock**, since the lock has no meaning without
it, and an export that left it behind would fail test 2. Locking a composite mount (`Main/Aux`, `Aux/Aux` or a two-Auxiliary
`Flex`) gives up that whole mount, so the lock is never a per-seat flag. `locked: true`
rides on the mount object, `UI.loadoutString` prints such a mount as `Flex: LOCKED`, and the rules are
enforced by `check-all` on every record: **exactly one locked mount if and only if a Superheavy is
mounted**, that mount's `weapons` is empty, and it is **not** the mount carrying the Superheavy.
Without those three assertions a stray flag would permanently block a mount that nothing explains.

The core exposes these on `window.LOADOUT`, not `window.UI`: `archive.js` already owns that name for the derived display helpers, so the two cannot share it.

`UI.canMount(pilot, build, slotIndex, seat, weapon, catalogue, opts)` → `{ok, reason}` is a **pure
question**: it says whether the placement would be legal, with `opts.lockSlot` naming the mount a
Superheavy would lock, and it never returns or mutates a build. The mutation is separate, because a
decision that also writes cannot be asked without being obeyed. `seat` is the index inside a mount's
`weapons`, because a composite mount holds two.

- `UI.place(pilot, build, slotIndex, seat, weapon, catalogue, opts)` → `{ok, reason, build}` runs
  `canMount(build.pilot, …)` first and **returns its refusal unchanged**, so `UNLICENSED` and
  `OVER SP CAP` read the same whether they are asked or attempted; on `ok` it returns the new build, and an already-occupied seat is refused `SLOT FULL`
  rather than silently replaced.
- `UI.unplace(build, slotIndex, seat, catalogue)` → `build` removes that seat's weapon and **clears the lock**
  when the weapon removed is the Superheavy, since the lock has no meaning without it and an export
  that left it behind would fail test 2.
- `UI.setFrame(build, frame, catalogue, pilot)` → `{ok, reason, build}` refuses `UNLICENSED` or
  `UNKNOWN FRAME LICENCE` and **resets `mounts` to the new frame's slot list**, because mounts
  carried over from another frame are the silent mismatch the export check exists to catch;
  `UI.setSystems(build, systems, catalogue, pilot)` → `{ok, reason, build}` checks the SP cap, duplicates
  and the AI limit. Every builder is pure and returns a new build, so nothing mutates one
  in place.
- `UI.exportLoadout(build)` takes the edited build rather than the record, and
  `{ mech, frame, pilot, sys, mounts, systems }` is the whole shape: `mech` is the record id that
  `--loadout <mech>` needs, `pilot` is the record id whose object the caller resolves, and `sys` is
  the record's system-point allowance, the cap's other input. The builders take that resolved pilot
  record as their first argument because `licences` and `ll` are what they read from it.

Reasons: `UNLICENSED`, `WRONG MOUNT TYPE`, `SLOT FULL`, `SLOT LOCKED`, `NEEDS SECOND MOUNT`, `OVER SP CAP`, `UNKNOWN WEAPON`, `UNKNOWN FRAME LICENCE`, `DUPLICATE UNIQUE ITEM`, `AI LIMIT`.
Uniqueness is a real gate, not a nicety: 104 systems and 3 weapons carry `tg_unique`
(`Personalizations`, `Custom Paint Job`, `Type-3 Projected Shield`, `EVA Module` among them), and 13
systems carry `tg_ai` with a one-AI-per-mech limit. `UI.spCheck(build, frame, catalogue, pilot)` is
separate, since the cap depends on the whole build.

### Where the code lives

`loadout.js` holds the pure core (`canMount`, `place`, `unplace`, `setFrame`, `setSystems`, `spCheck`,
`rangeReadout`, `exportLoadout`, `loadoutString`, `systemString`). It loads in the browser like
`campaign.js` and exports through `module.exports` when required, so `apply-compcon` takes `UI` and
`CATALOGUE` from `require("./render.cjs").mount("loadout.html").window`, the same hoisted stub the
suite uses. Nothing in this ticket edits `archive.js`, `campaign.js` or `detail.js`: `archive.js`
keeps the dossier strings, which are a later ticket.

Frame licences read `license_level` on the frame record (`Blackbeard` and `Drake` are LL2) and match
the pilot's `{name, rank}` list by `frame.name`, with GMS frames granted at LL0. A frame the data
does not hold cannot be licence-checked, so it is refused `UNKNOWN FRAME LICENCE` rather than
assumed legal.

## Catalogue

`tools/build-catalogue.cjs` derives `catalogue.js` (`window.CATALOGUE`) from lancer-data 3.1.7, with
its own header (not `detail.js`'s "subset: only items fielded by this campaign", which would be
false) and the same `--check` staleness gate. Mechanical fields only; prose is `detail.js`'s job:

- `weapons`: name, `mount`, `bands` **per profile** (each profile's `range` plus its own valued tags;
  `tg_thrown` is folded into the bands, because `Tactical Knife` has `Threat 1` as its only range
  entry and its reach of 3 lives only in the tag's value), `damage`, tags as `{id, val}` so no value
  is dropped, `sp` (default 0), `license`, `license_level` (missing → 0)
- `systems`: name, `sp`, `license`, `license_level`
- `frames`: name, `source`, `mounts`, `sp`, `license_id`, `license_level`

**Not offered** by the bay, though still resolvable for display: placeholder records (`ERR: DATA NOT
FOUND`, ids `missing_*`), `Ship-class` weapons, `id` ending `_integrated` (Latch Drone, M35 Mjolnir,
ZF4 SOLIDCORE, Apocalypse Rail; these are frame-integrated and carry no licence), and `talent_item: true` (Fuel Rod
Gun, Prototype Weapon I-III, Ammo Case I-III, the NHP classes). Scooteroo's `Ammo Case I` is one of those: it stays
resolvable so the dossier still prints it, and the bay shows it as talent-granted rather than
purchasable.

## System points

Cap = `frame.stats.sp + floor(mech.sys / 2) + ceil(pilot.ll / 2)`, the LANCER formula, and both
inputs already sit on the records (the mech's `sys`, and `ll` added above). Grit is half LL rounded
**up**, so `floor` would cap every odd-LL pilot one point short; all six pilots are LL0 today, which
is exactly why this needs test 4 to pin the term rather than the current data. Everest cap for the
four LL0 Everest records (all `sys: 0`) is 6, which is exactly what Tombstone, Scooteroo, Skaldr and
Alba spend, so the tested cap path is real. **Unknown cap** when the frame does not resolve in the
data (Averna, Wayward): the page says so instead of refusing, and the mech's `sys` is still used,
so a resolved frame swap shows the right cap for an Averna-y `sys: 2` build. `canMount` never
returns `OVER SP CAP` on a build whose frame does not resolve, so the unknown-cap path cannot
refuse on that reason.

The total counts systems **and weapons with an `sp` cost**, so the seven SP-costing weapons are not
free. Names the catalogue does not know (`Spaceborn EVA`, talent-granted) are excluded from the total
and shown `UNKNOWN`, never counted as 0-and-clean.

## Range finder

`UI.rangeReadout(build, distance, catalogue)` → per mounted weapon, per profile: can it fire at
`distance`, the band label(s), and the shot's accuracy. It takes the **build**, with `attackBonus`
copied in from the record, so the readout describes the edited build and not the filed one.

A weapon can fire when **any** of its own gates reaches the distance: `Range N`, `Line N`, `Cone N`,
`Burst N`, `Threat N`, `Thrown N` when `N >= distance`. So Bristlecrown (Burst 1), Daisy Cutter
(Cone 7), Krakatoa (Cone 5) and Annihilation Nexus (Burst 2) can fire; Tactical Knife's
`Thrown 3`, a tag, not a range entry, extends its 1 to 3; Pistol's `Range 5` / `Threat 3` are both
gates. Bands are reported per profile, so an Assault Cannon's alternate fire modes are not blended
into one list. Cone and Line weapons are flagged "pattern, not proven": a scalar distance cannot
prove the pattern, and the readout says so rather than implying it.

Three states, not two, because `Blast N` reaches past its band: the centre must sit inside the band,
but the blast still covers up to `N` further. A target beyond the band but within `Range + N` reads
"out of band, in blast"; the readout would otherwise call Missile Rack at 11, RPG at 11-12 and
Howitzer at 21-22 out of range when the blast lands there. Non-numeric band values are shown as-is
and never gate: Apocalypse Rail's `Charge Rail: 4` profile carries `val: "N/A"`, which no `N >=
distance` rule can read.

Accuracy is reported as **two fields, never summed**: `mech.attackBonus` (the flat Grit-derived
number on the roll) and the weapon's own dice from `Accurate` / `Inaccurate` tags: LANCER adds or
removes a d6, and it does not change the flat bonus. Of the fielded weapons the Howitzer and the HMG are
`Inaccurate`; the Anti-Materiel Rifle is `Accurate` (`tg_accurate`), so test 5 must expect **+1** for
it. The readout derives the flag from the tag rather than from a hand-kept list; `Mortar` and
`Deck-Sweeper Automatic Shotgun` are `Inaccurate` too, and a list would go stale as the fielded set
grows. Frames have no attack-bonus field, and pilot talents stay out of v1.

The slider is a display: a stub DOM has no layout engine, so geometry is a chromium probe reported as
a probe, never as a passing test.

## Export, and the write path

One path: `UI.exportLoadout(build)` emits the mech id, **its frame**, mounts and systems, and
`tools/apply-compcon.cjs --loadout <mech> <file|->` writes them into `campaign.js`. Eight defects
must be fixed first, all reproduced:

The frame belongs in the export because the page offers a frame pick: a build made for another
frame's slot layout would otherwise land silently on the unchanged record and then be validated
against that record's own mounts. v1 has no write-back of frame stats, so `--loadout` **refuses when
the exported frame differs from the record's frame** and says so. Comparison reuses
`build-detail.cjs:19`'s `norm()`: the export matches the record when the normalised strings agree
with either the record's `frame` or the catalogue's `${source} ${name}`; records read
`"GMS EVEREST"` while the catalogue reads `GMS` + `Everest`. A frame the data does not hold (Averna,
Wayward) is exported and compared as the record's own string, unchanged, because there is no
catalogue name to normalise against.

1. **The value matcher cannot round-trip these values.** `applyToText` matches
   `(^|[\s,{])field:\s*([^,}\n]*)`, stopping at the first comma: replacing `conditions: ["A", "B"]`
   with `["C"]` yields `conditions: ["C"], "B"] },`, which is corrupt text. Bracket-aware matching or region
   re-serialisation, plus a test. This also fixes the existing `conditions` path.
2. **Nothing is testable.** argv handling runs at top level (`apply-compcon.cjs:350`), but the `if (require.main === module)`
   guard and the `parseBlock`/`parseLog` exports already exist (`:407`, `:409`). What is missing is
   the parser's return shape: `parseLoadoutBlock(text) -> { mech, frame, pilot, mounts, systems }`,
   settled by the first red test.
3. Its selftest covers only a one-item list; extend it to a multi-item list and a value containing a
   comma.
4. **An empty list still gets written.** `applyToText` (`apply-compcon.cjs:92`) skips a field *absent* from the region, which is what the
   migration must avoid: it mints `systems: []` on every record so the field is always present and a
   cleared list still lands. An existing field holding an empty array clears fine, which the tool's
   own selftest covers.
5. **Missing rules data stops the run.** `--loadout` regenerates `detail.js` first, and
   `build-detail.cjs:8` only tolerates missing lancer-data under `--check`; without the guard it
   throws. `--loadout` therefore checks for the data directory *before* touching `campaign.js`, resolved the
   way `build-detail.cjs:7` does (`LANCER_DATA` first, then the default) so the guard and the regen
   agree on which directory they mean, and stops with the regen command and the reason, so a partial
   write cannot happen.
6. **The no-op test must compare values, not text.** `applyToText`'s unchanged check
   (`apply-compcon.cjs:95-96`) is `current === literal` on the raw text, and the hand-migrated
   `mounts`/`systems` regions are multi-line and hand-spaced, so they can never byte-match what a
   writer emits: the first `--loadout` run would reformat every region. The matcher must take the
   field's **whole bracket-aware span**, evaluate that span in a bare `vm` sandbox (`campaign.js`
   text only, never the pasted block, see below) and **skip the write when its serialised form equals the new
   value's**. Output goes through one canonical `lit()` (`{ slot: "Main", weapons: ["X"] }`, keys
   unquoted, strings via `JSON.stringify`), and the no-op check compares `JSON.stringify` of both
   values rather than deep-equalling them: a span evaluated in a `vm` sandbox has different
   prototypes from a local literal, so `util.isDeepStrictEqual` returns false across that boundary
   and the no-op would never fire. Same `lit()`, same key order, compared as strings. The migration
   commit mints its fields with that same `lit()`, so the first real run is a no-op (test 6).
7. **It writes before it validates.** `finish()` (`apply-compcon.cjs:265-287`) writes `campaign.js`,
   then runs check-all and exits 1, leaving an illegal or typo'd block in the file, and `detail.js`
   already regenerated. The block crosses a trust boundary, so **`parseLoadoutBlock` uses
   `JSON.parse` only, never `eval`**, and this set runs **before any write**: the mech id and the frame match, the exported slot list
   equal to the record's own slots, catalogue resolution for weapons, `canMount` per mounted weapon
   with licences taken from the **record's** pilot (an export naming another pilot is refused
   outright), and `UI.setSystems` with `UI.spCheck` for the systems side, so an unlicensed weapon or
   an over-cap systems list cannot reach `campaign.js` through `--loadout`. Only *weapons* must resolve in the catalogue: an unknown
   **system** passes and is reported as a warning, because Wayward's `Spaceborn EVA` (`campaign.js:114`)
   is talent-granted and absent from `systems.json`, so requiring systems to resolve would make that
   record permanently unwritable. The order is fixed: **data-dir guard → validate →
   back up → write `campaign.js` → `build-detail` → check-all → restore on failure**; the regen has
   to follow the write, because `build-detail.cjs:14-16` reads `campaign.js` from disk and a regen
   before it would emit `detail.js` from the old record and fail `build-detail --check`. The
   `--loadout` run **always passes `--update-snapshot`**, because pinning `loadoutString` /
   `systemString` means any real loadout change is snapshot drift by design; rollback therefore fires
   only on problems *other than* that drift. Three files are backed up and restored together:
   `campaign.js`, `detail.js` and `tools/roster-snapshot.json`.
8. **argv collides with the existing export path.** `main()` reads the first non-flag argument as the
   export file (`apply-compcon.cjs:279`), so `<mech>` would be taken as a path, and a multi-line
   block cannot be passed in argv at all. `--loadout` branches **above the argv read in `main()`** and reads the block
   from a file or from stdin (`-`).
The compare also reads names out of a comma-separated string, the field's shape before the migration; that branch is dead on the live path now, and it stays because the tests still cover the string form, so removing it would be unverifiable rather than proven unnecessary.

**`--loadout` writes `campaign.js`, regenerates `detail.js` (`node tools/build-detail.cjs`) then runs check-all**, because any new weapon or system makes `detail.js` stale and `check-all.cjs:192` runs
`build-detail --check`. That gate, and the catalogue's, is **local-only**: `build-detail.cjs:8`
skips the check when lancer-data is absent, which is the case in CI
(`.github/workflows/check.yml` never fetches it). CI therefore cannot catch a stale `detail.js`; the
regen step in `--loadout` is what protects the write path.

The mode never touches session-state fields (`hpNow`, `structure`, `stress`, `heatNow`, `repairsNow`,
`conditions`), so the snapshot's pinning of *those* is undisturbed; the derived loadout strings do
move with the build, which is exactly why the run passes `--update-snapshot` rather than treating
their drift as an error.

## Page

`loadout.html` loads `campaign.js`, `detail.js`, `catalogue.js`, `archive.js` plus inline glue, and
wears the same shell and nav as the other pages. Nav: add `loadout.html` to the `navPages` list
(`check-all.cjs:85`) **and** a separate assertion that every page's shell links to it; `navPages`
only asserts a page links to INTEL, not the reverse.

**`tools/render.cjs` grows a third argument first.** Its `mount(page, hash)` builds the sandbox and
runs the page's scripts inside the same call (`render.cjs:13-23`), so there is no moment at which
check-all can set a page global before the scripts run. It becomes
`mount(page, hash, globals = {})`, doing `Object.assign(box, globals)` before the script loop, with
one `--selftest` line proving a global arrives, the change test 8 depends on.

Glue stays `getElementById` host nodes plus `innerHTML`, because the `render.cjs` stub nodes have no
`createElement`, no `value`, no `checked`, and a no-op `addEventListener`; building controls via the
DOM API would throw inside `mount()` and kill check-all. The refusal path is proved through the stub
by feeding the page a **fixture build through a `window.__LOADOUT_FIXTURE` global**, passed as
`render.cjs`'s new `globals` argument (`mount("loadout.html", "", { __LOADOUT_FIXTURE: … })`),
deterministic, no hash or click simulation needed, since the stub DOM has neither. If real controls
are wanted later, `render.cjs`'s stub and its selftest grow first.

Controls: pilot pick, frame pick gated by that pilot's licences, one control per mount slot,
systems pick with the SP counter, distance slider with the readout, export button.

## Tests

Repo rule stands (`AGENTS.md`): failing test first, watch it fail, then implement. Suite:
`node check-all.cjs && node tools/render.cjs --selftest`, what CI runs. **Tests 6 and 7 live in
`apply-compcon`'s own `--selftest` and `check-all` spawns it**, because CI calls neither
`apply-compcon` nor anything else directly (`.github/workflows/check.yml:15` runs exactly the two
commands above), so a round trip tested anywhere else would never execute in CI.

1. `ll` matches the `LL<n>` token in every pilot's `background`; `licences` is a list of
   `{name, rank}`, empty at LL0.
2. Every mech's `mounts` are legal under the slot table, the exported slot list equals the
   record's own slots (and, where the frame resolves, that frame's `mounts`), every weapon name
   resolves in the catalogue, no record carries a `"Superheavy"` slot, no duplicate `tg_unique`
   item, at most one `tg_ai` system, spend at or under cap where the frame resolves, and the lock
   rules hold on every record:
   **exactly one locked mount if and only if a Superheavy is mounted**, that mount's `weapons` is
   empty, and it is not the mount carrying the Superheavy; today's six records validate.
3. `UI.loadoutString` reproduces each mech's current dossier string exactly and `UI.systemString` its
   systems line; the roster snapshot's pinned strings are unchanged.
4. Gating refuses each case with its reason: unlicensed item, wrong mount type, slot full, over cap
   (on a **fixture** Everest with `sys: 3`, cap 7, every real Everest record has `sys: 0`; so the
   fixture is what pins the term), a weapon placed into a locked mount (`SLOT LOCKED`), a Superheavy
   with no `lockSlot` given (`NEEDS SECOND MOUNT`), a bad `lockSlot` (the Superheavy's own mount, a
   mount holding weapons, or an already-locked mount), and an odd-`ll` pilot pinning `ceil`; unknown
   weapon, duplicate `tg_unique` item, second `tg_ai` system, **and 2 Auxiliary in a `Main` are
   refused as `SLOT FULL` while 2 Auxiliary in a `Main/Aux` are accepted**. A Superheavy is **accepted in one `UI.place` call**
   with `{ lockSlot }`, and that call leaves exactly the lock the record assertions in test 2 expect,
   while `UI.unplace` clears it. `locked: true` on a record with no Superheavy mounted is a
   record rule, asserted in test 2 rather than here.
5. `UI.rangeReadout` at fixed distances, on the catalogue's own records wherever they cover the
   case: a Threat-only weapon out of range at 5, Pistol's `Range 5` in band at 5, Tactical Knife's
   `Thrown 3` in band at 3 and out at 4, Missile Rack's `Range 10` with `Blast 1` reading "in band"
   at 10, "out of band, in blast" at 11 and "out of range" at 12, Anti-Materiel Rifle's
   `tg_accurate` as dice +1 and Heavy Machine Gun's `tg_inaccurate` as dice -1, each beside
   `attackBonus` rather than summed into one number. Two cases need **synthetic entries**, because
   no record the site can field carries a Cone, a Line or a band that is not a number: a Cone-only
   weapon (Daisy Cutter's `Cone 7`) in band at 5 and flagged `pattern`, and `Charge Rail: 4`'s
   `"N/A"` band shown as it stands and never gating.
6. `apply-compcon --loadout` round trip through the exported `parseLoadoutBlock`, in that tool's
   `--selftest`: parse the export, apply it to `campaign.js` text, re-load the result, including a
   multi-item systems list, a value containing a comma, an **empty** systems list, and a **no-op
   re-apply** proved on *values*: re-applying an identical loadout leaves the text unchanged even
   when the region was hand-spaced, because the compare is `JSON.stringify` of the parsed field, not of
   the region's text.
  The same `--selftest` covers an unknown **system** (`Spaceborn EVA`) that warns and still lands.
  The throwing-stub path is **not** covered by spawning: `snapshotView` and the pick/write logic
  live in `tools/snapshot.cjs`, taking `(C, UI, snap)`, so `check-all` passes a `loadoutString` that
  throws and asserts `tools/roster-snapshot.json` is byte-identical, with neither process spawning
  the other.
7. The `--loadout` mode leaves `hpNow`, `structure`, `stress`, `heatNow`, `repairsNow` and
   `conditions` untouched (also in `apply-compcon --selftest`).
8. `loadout.html` mounts in the stub DOM with a `window.__LOADOUT_FIXTURE` build and renders a
   refusal beside the control that caused it.

## Risks

- **Catalogue licence and size.** Derived rules data is GPL-3.0-or-later; `detail.js` already ships a
  derived subset under that header, so `catalogue.js` follows the same precedent. Mechanical fields
  only keep it small.
- **String regeneration.** `archive.js`, `build-detail.cjs --check`, the roster snapshot's new keys
  and `check-all.cjs:580` all read these fields; test 3 pins the copy, and a missed call site shows
  as a suite failure rather than a silently changed dossier.
- **`apply-compcon`.** Its comma bug means the round-trip test must land before the bay relies on it;
  the fix touches the live `conditions` path.
- **Local-only gates.** CI cannot catch staleness in `detail.js` or `catalogue.js` until it fetches
  lancer-data. Recorded here as a known gap, not fixed in this ticket.

- **Supplement frames.** `GMS CHOMOLUNGMA` and `GMS SAGARMATHA` are Solstice Rain supplement frames,
  absent from lancer-data 3.1.7 (`frames.json` carries Everest and a `missing_frame` placeholder), so
  no gate has their stats and the SP cap check skips them as unknown. That is a data-dir gap, not a
  missing-rules problem: the real block lives in the supplement on the owner's machine
  (`~/Downloads/osr-data.lcp`), where CHOMOLUNGMA is `sp 7` with mounts `Main/Aux` and `Flex`. With
  it, AVERNA's cap at LL 0 is 7 + floor(2/2) + 0 = 8 against her 8 SP, so her loadout is legal and
  this question is closed rather than deferred.
