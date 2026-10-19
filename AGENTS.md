# vargskel-worgs — repo memory

## TDD, always

Use the `/test-driven-development` skill (`~/.claude/skills/test-driven-development/SKILL.md`) on
every change in this repo — failing test first, watch it fail for the right reason, then implement.
That skill is the authority; don't restate its rules here.

Two repo facts it can't know:

- Tests run as `node check-all.cjs && node tools/render.cjs --selftest`, and CI
  (`.github/workflows/check.yml`) runs exactly that.
- That harness mounts pages against a stub DOM with no layout engine, so pixel and layout claims
  need a chromium probe and get reported as a probe, never as a test.