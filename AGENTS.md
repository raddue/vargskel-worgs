# vargskel-worgs — repo memory
## Subagent models
When launching subagents, pass `model: "9router/cx/gpt-6-luna[1m]"` explicitly. The unsuffixed `9router/cx/gpt-6-luna` configured on some agents is not in the Pi registry and fails at launch.

## TDD, always

Use the `/test-driven-development` skill (`~/.claude/skills/test-driven-development/SKILL.md`) on
every change in this repo — failing test first, watch it fail for the right reason, then implement.
That skill is the authority; don't restate its rules here.

Two repo facts it can't know:

- Tests run as `node check-all.cjs && node tools/render.cjs --selftest`, and CI
  (`.github/workflows/check.yml`) runs exactly that.
- That harness mounts pages against a stub DOM with no layout engine, so pixel and layout claims
  need a chromium probe and get reported as a probe, never as a test.

## The players' COMP/CON export is the source of truth

When `campaign.js` and an export disagree, the export wins: the players update their builds there.
Import through `tools/apply-compcon.cjs`, so the catalogue gate checks the write. `--loadout <mech>
<block.json> --write` writes one build; a bare `<export.json>` maps tracked mech state and is a dry
run without `--write`. Campaign narrative fields (ops, statuses, session ledger) stay the site's.

What the exports carry, learned the hard way:

- A Pilot Group export keeps its payload as a JSON string under `data`, where an archive keeps
  collections under `data.data`.
- Talent-granted systems sit in `loadout.integratedSystems`, not `loadout.systems`, and the site's
  flat `systems` list carries both.
- Mounts are `mounts[].mount_type`, weapon names at `mounts[].slots[].weapon.data.name`, and the
  live build is `loadouts[active_loadout_index]`, not `loadouts[0]`.
- No export carries live mech state (`current_hp`, structure, stress, heat, repairs), so those come
  from session play, never from an import.

All of those shapes live in `tools/compcon.cjs`: `readExport(text)` returns the roster in one normal
form, `readBuild(mech)` returns a mech's live build (systems, talent-granted systems, mounts), and
`node tools/compcon.cjs <export.json> [--mech <name>]` dumps what it sees. Read through it rather
than hand-walking a fresh script, and `tools/apply-compcon.cjs` already imports it.