---
ticket: "#28"
title: "Session log: a stepper form that emits the existing block grammar"
date: "2026-10-19"
source: "design"
---

#27 shipped a form of sixty spinners (ten ledger stats times six pilots, all visible
always) and `1f9dad1` took it back out. This design settles the five questions the
issue left open, three of them answered by the operator on 2026-10-19:

- **Who logs:** one pilot at a time, a stepper. The wall of boxes was the failure.
- **Which stats at the table:** four up front (`dealt taken structure repairs`), the
  other six behind a per-pilot "more" toggle.
- **Skip and zero:** a deployed toggle per pilot, default off. An empty field is not
  logged and emits nothing; a typed `0` emits `stat=0`. Undeployed pilots emit no line.
- **Paste or direct:** auto-resolved. The site is static; the browser cannot write
  `campaign.js`. The form builds the block, the operator copies it, and
  `tools/apply-compcon.cjs --log-block` applies it, exactly the path #27's grammar
  already owns. The issue's Keep section says the same.
- **Pure seam:** auto-resolved by house pattern. Every derivable part is a pure
  function in `archive.js`; the glue is the only DOM code, and the render stub grown
  at `7bd18b4` (`value`, `checked`, `fire()`, recorded listeners) makes it testable
  under `mount()` the way `loadout.html` already is.

## Page

`campaign.html#session-form` returns, between the SESSION LOG head and the ledger
body. The shell carries an op pick (defaulting to the newest op), a
`<input type="date">` (the native control constrains the format; the CLI remains the
authority that validates), and the stepper host. The stepper walks `CAMPAIGN.pilots`
in record order: one card per pilot with the deployed toggle, the four core stat
fields, the "more" toggle revealing the remaining six, and Back / Next. After the last
pilot comes a review step showing the emitted block in a read-only `<pre>` plus a
copy button. Nobody deployed means no block: the review step says so instead of
emitting a header-only block, which `parseBlock` would refuse anyway.

Glue stays `getElementById` plus `innerHTML`, because the stub's `querySelectorAll`
is still `[]`. Control ids are deterministic: `sl-op`, `sl-date`,
`sl-deploy-<pilot>`, `sl-<pilot>-<stat>`, `sl-more-<pilot>`, `sl-back`, `sl-next`,
`sl-block`, `sl-copy`. Step state (typed values, position) lives in one plain object
in the glue, so Back never loses a number.

Pure surface added to `archive.js`'s `UI`:

- `UI.sessionStep(pilot, values)` — one pilot's card markup, core four plus the six
  behind `sl-more-<pilot>`, values reflected so a re-render keeps what was typed.
- `UI.sessionBlock(entries, op, date)` — the grammar: header
  `session op=<id> date=<YYYY-MM-DD>`, then one line per deployed pilot with only the
  stats that were typed, `stat=0` included when zero was typed. Entries are plain
  data (`{pilot, deployed, stats}`), so checks drive it without any DOM.
- `UI.sessionReview(entries, op, date)` — the review step's markup, which is the
  block in a `<pre>` or the nobody-deployed notice.

The copy button uses `navigator.clipboard` when present and otherwise selects the
`<pre>`; under the stub it must not throw.

## Tests

Suite stays `node check-all.cjs && node tools/render.cjs --selftest`.

1. `UI.sessionBlock` emits the grammar exactly: header first, one line per deployed
   pilot, typed zeros present as `stat=0`, empty stats absent, undeployed pilots
   absent, and stat order follows `STATS` so two runs of the same entries agree
   byte-for-byte.
2. Round trip without spawning: `check-all` requires `tools/apply-compcon.cjs` and
   feeds `UI.sessionBlock` output for a fixture entry set (a zero, an omission, an
   undeployed pilot) through `parseBlock`, asserting the parsed rows equal the
   entries. The tool's own `--selftest` pins that `parseBlock` keeps a `stat=0` row's
   zero rather than dropping it.
3. The stepper under `mount()` and `fire()`: firing `change` on `sl-deploy-daemon`
   then `click` on `sl-next` lands on the second pilot; `sl-back` returns with the
   typed value still in the field; an undeployed pilot's card still shows but
   contributes no line at review.
4. The "more" toggle: firing `change` on `sl-more-daemon` re-renders the card with the
   six extra fields, and a value typed into `sl-daemon-hacks` reaches the review
   block.
5. Zero versus empty in the ledger render: a ledger row carrying `dealt: 0` renders
   `0` in the SESSION LOG cards, not a blank cell, so a logged zero survives to the
   page that reads it.
6. Nobody deployed: with every toggle off the review step carries the notice and no
   `<pre>` block, and `sl-copy` is absent.

## Risks

- **Stub timing.** The `fire()`/`value` stub lands with the peer's controls slice, not
  in main yet. Implementation rebases onto that merge; until then tests 3, 4 and 6
  cannot run, so the slice starts after the merge, not before.
- **Two date authorities.** The native date input constrains format in the browser;
  `parseBlock` remains the validator at write time. A hand-edited block with a bad
  date is refused by the CLI with its line named, which is the existing behaviour.
- **Clipboard.** Headless probes have no clipboard permission; the select-fallback
  path is what tests exercise, and the copy success path stays a probe, never a test.

No dimension here meets the ADR bar: every choice is a reversible single-site UI
decision. Repo precedent keeps contracts out of `docs/plans/`, so none is emitted.
