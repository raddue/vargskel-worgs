---
ticket: "#27"
title: "Solstice Rain campaign page: session log, OPORD, factions, roster"
date: "2026-10-19"
source: "design"
revision: 2
---

# Solstice Rain campaign page

## Problem

The campaign is the one thing the site does not present as a record. Its parts are scattered:

- the session ledger and the event timeline render **only** inside `mechbay.html`'s CAMPAIGN LEDGER
  section (`mechbay.html:34`, `archive.js:251`), so the chassis register carries the campaign's
  history;
- the operation order renders on the **M1 mission briefing** (`solstice-rain.html`), not on a
  campaign page;
- the faction ledger is a tab in `intel.html`, and the roster is `mechbay.html`'s chassis register;
- logging a session was a terminal command advertised in the ledger's empty state — a string that
  was just deleted, because a player-facing page should not be telling people to run a script.

## Decisions

Settled by the operator, 2026-10-19: this page goes **before** the mechbay (#26) work; it carries the
session log, OPORD and mission briefings, the faction ledger, and roster/deployment state; and
session logging is **an in-page form that emits a pasteable block**, because the site is static with
no server and a browser cannot write `campaign.js`.

Out of scope: browser write-back, editing the OPORD in the page, a multi-operation picker (the page
reads the op named by its own `data-op`, exactly as the mission page does), themes, and print styles.

## Shape

A new page `campaign.html`, driven from `campaign.js` the way `solstice-rain.html` already is.
**Nothing is copied into HTML** — `campaign.js` stays the single source, so a section cannot drift
from the record.

Every section host is named here, because the ids are the interface:

| Host id | Filled by |
|---|---|
| `#campaign-head` | a new op header renderer in `archive.js`, resolving the op from the host's `data-op` (no `C.ops[0]` indexing, so a second op needs no rewrite) |
| `#ledger-count`, `#ledger-body` | `UI.ledgerPanel(C.ledger)` — both ids are required, because `archive.js:253` writes `ledger-count` without checking it exists, so a page with only `ledger-body` throws during mount |
| `#timeline` | `C.events`; its links switch to `opLink` / `index.html#op-…`, since `#op-NNN` anchors exist only on `index.html` and would be dead here |
| `#opord`, `#conflict-history` | `data-op` lookup, exactly as on `solstice-rain.html` |
| `#faction-list` | `UI.factionTable()` (it takes no arguments) |
| `#crew-list`, `#mech-list` | the existing roster hosts and helpers (`archive.js:258-263`) |
| `#session-form`, `#session-block` | the logging form and the block the GM copies |

**The ledger leaves `mechbay.html`** (operator's call, 2026-10-19): that page keeps its chassis
register and loses the CAMPAIGN LEDGER section, so the session log has one home instead of two.
`check-all.cjs`'s existing ledger panel assertions (`:341-362`) move from the `mechbay.html` mount to
the `campaign.html` mount, and a new assertion pins that `mechbay.html` no longer carries
`id="ledger-body"`. Nothing else touches the ledger — `print-check`, `plate-check`, `personnel-*`
and the render selftest never do.

Nav: a new `CAMPAIGN` entry in every page's shell nav, added to `navPages` (`check-all.cjs:85`) with
its own assertion, mirroring the rule that already keeps every page's `INTEL` link honest.

## Session logging

One pure function, one rendered form, one tool mode.

- `UI.sessionBlock(entry)` → the block text for one session. The block reuses the grammar
  `tools/apply-compcon.cjs --log` already accepts — `<pilot> stat=n`, split on whitespace
  (`apply-compcon.cjs:166-182`) — with a header line the tool's flags carried until now, since op and
  date came from `--op`/`--date` (`:233-234`):

  ```
  session op=001 date=2026-10-20
  dusty dealt=14 taken=9 kills=2
  ```

  **No session title.** There is nowhere to put one: ledger rows accept only `op`, `date`, `pilot`
  and the ten stats (`check-all.cjs:36-39`), and the only appender is `appendLedgerRow`. A title
  would have to be a new `C.events` appender, which is a separate ticket. `op` and `date` are
  **required**; a block missing either is refused. Both keys are whitespace-delimited, so no quoting
  or escaping rules exist to get wrong.
- **The form is rendered by `archive.js`, not hand-written in HTML.** Behind an `el("session-form")`
  guard it fills the host with `innerHTML` built from `C.pilots` and `LEDGER_STATS` (six pilots × ten
  stats is sixty inputs, which would otherwise be hand-copied HTML that goes stale), and wires it
  with `el()` plus `addEventListener` — the stub DOM supports both, while
  `querySelector(...).addEventListener` throws during mount. `sessionBlock` is exported in the `UI`
  return object (`archive.js:347`).
  The wiring is still the untestable part (the stub has no `value` or `checked`), so **the pure
  function is what the suite tests** and the click path is at most a chromium probe, reported as a
  probe and never as a passing test.
- `tools/apply-compcon.cjs --log-block <file|->` parses the block. **Validate first is new behaviour,
  not existing behaviour**: `runLogs` today skips a bad line (`exitCode = 2; continue`, `:247-256`)
  and still calls `finish()` for the lines that parsed (`:268-270`), which would write a partly-bad
  block. So the mode adds a pure `parseBlock(text, known) → { rows, errors }` and **aborts before the
  first `appendLedgerRow` if `errors` is non-empty**, naming the offending pilot or stat. The
  `--log-block` branch sits **before `:279`**, or the file path is taken as the export input.
  The block comes from a browser text box: parsed, never evaluated.

## Tests

Written RED first, per `AGENTS.md`; suite is `node check-all.cjs && node tools/render.cjs --selftest`.

1. `campaign.html` exists, mounts under the stub DOM, and carries its section hosts — including
   `id="ledger-body"` — while `mechbay.html` no longer carries `id="ledger-body"`.
2. Every page's nav reaches `campaign.html`, and `campaign.html` is in `navPages`.
3. The ledger panel assertions that live on `mechbay.html` today (`check-all.cjs:341-362`) pass
   unchanged against the `campaign.html` mount, including the empty-ledger copy — which now reads
   `No sessions logged yet.` with no command in it.
4. `UI.sessionBlock` round trips through `parseBlock`: the text the page emits is read back into the
   same rows, and the header's `op` and `date` survive.
5. `parseBlock` refuses a block naming an unknown stat and one naming an unknown pilot, each with the
   offending name in `errors`, and refuses a block whose header omits `op` or `date`. The write path
   aborts on non-empty `errors` **by construction** — the parser is pure and the mode checks it before
   the first `appendLedgerRow` — so the suite asserts the parser, not the file.
6. `solstice-rain.html` keeps its own expectations: the OPORD copy and `COMMS UNDER JAMMING`
   (`tools/print-check.cjs:61`), and the `hero-planet` blend hook (`tools/plate-check.cjs:29-34`).
7. Deployment state on the page matches the record: the stations and deployment links assert against
   the **live roster**, the way `check-all.cjs:335-337` does. `mechOps`, `pilotOps` and `stationed`
   read closures built from `C` (`archive.js:12-17`) rather than their arguments, so they cannot be
   driven by fixture rows.
8. `archive.js` grows `module.exports`-free exports as today — `sessionBlock` appears in the `UI`
   return object — and the page still mounts when `#session-form` is absent, so no other page breaks.

## Risks

- **Section duplication.** Factions and the roster now render on two pages each (`intel.html`,
  `mechbay.html`, `campaign.html`). Mitigated by calling the same `UI` functions and copying no
  markup: one `campaign.js` edit moves both.
- **The block is untrusted input.** It arrives from a browser text box, so `parseBlock` validates the
  header, pilot ids and stat names, and the mode refuses the whole block rather than skipping lines.
- **Moving the ledger off `mechbay.html` is a deletion on a live page.** The assertion in test 1 plus
  the moved panel test make the move explicit rather than a silent disappearance.