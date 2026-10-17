# Handoff: Vargskel Worgs public site — polish arc shipped, backlog next

**Mode B (backlog), chosen because the arc that was in flight is code-complete and deployed live, and the two remaining engineering-shaped items are gated on user-supplied inputs (art files, a roster decision) rather than on code.**

**Scope:** public-site presentation polish — icons/link unfurls, roster name + stat accuracy.

## What just shipped

All six commits below are on `main` at `raddue/vargskel-worgs`, tree clean, and verified live at https://raddue.github.io/vargskel-worgs/ (deploy run `39038223214`, success):

- `8f7d71a` fix: roster names — Rurik callsign **DAEMON**, Spook = **NICOLOSO "SPOOK" BENIKO** (callsign mid-name, matching Sten/Dusty/Guillaume/Danila).
- `17ca463` fix: rename pilot id `frisky` -> `daemon` so the dossier URL matches the callsign.
- `4763300` feat: unit-patch favicon + apple-touch icon + 1200x630 share card, with og/Twitter tags on all six pages (link unfurls previously rendered as bare URLs).
- `0a4605c` feat: complete Sweet Cheeks stat block from the COMPCON sheet + the `check-all.cjs` guard the other five chassis already had.
- `0234ed4` fix: legacy `#frisky` bookmarks resolve to the DAEMON dossier (`legacyPilotId` map in `archive.js`).
- `5bdf47f` fix: favicon uses the **whole** unit patch (a banner-cropped variant was tried first and reverted at Rick's request).

Verification done: `node check-all.cjs` green; live `favicon.png` md5 matches local; `campaign.js`, `archive.js`, `detail.js`, `style.css` all byte-identical to local; every page 200; `gm.html` still 404.

## Why this is a natural break

The site is green, deployed, and has no known defect. What's left is either waiting on Rick (art, one roster answer) or is a parked feature. Nothing here is urgent.

## Backlog candidates

**1. Art gaps — 4 of 12 dossier art slots fall back to placeholders.** Rick is generating art with ChatGPT; expect files to arrive in conversation.
- `spook` (NICOLOSO "SPOOK" BENIKO) has **no `img` key** — only pilot without art, so the roster card shows a letter avatar while the other five show portraits.
- `skaldr` (Sten, "HAMMER"), `alba` (Spook), `xxxg-01h` (Guillaume, displays as WAYWARD) have **no `img` key** — dossier and roster render the glyph instead.
- Art that exists: pilots `rurik_vargskel`, `sten`, `dusty`, `tizona`, `scooter`; mechs `sweet-cheeks`, `tombstone`, `scooteroo`.
- Drop-in recipe: source PNG **1254x1254** (existing convention — `magick identify assets/sweet-cheeks.png`), add `img: "assets/<name>.png"` to the record in `campaign.js`, then generate the thumb **`magick assets/<name>.png -resize 480x assets/<name>-thumb.webp`** (this exact regen command is emitted by `check-all.cjs` when a thumb is missing — roster cards render `<picture>` webp-first, so the thumb is mandatory).
- Optionally extend the per-mech `Object.entries({...})` assertions in `check-all.cjs` with the new `img` value (only `scooteroo` currently asserts `img`).
- Not a good fit if: art doesn't exist yet — don't stub placeholder images.

**2. OP 001 `crew` / `mechs` are empty** — `campaign.js` `ops[0]` has `crew: []`, `mechs: []`, so the index operation card reads "None" despite six pilots. **Open question, do not guess:** the op is `type: "PLANNED"` / `status: "UNBRIEFED"`, and `archive.js` already suppresses "None deployed" for PLANNED ops — so empty may be deliberate until M1 starts. Rick cancelled the question dialog when I asked, so **the answer is still unknown**. Cheapest fix once answered: two array literals. (unverified which pilots are actually dropping)

**3. Issue #1 (open): "Selectable color themes persistence"** — `gh issue list` shows exactly one open issue, filed 2026-10-16. `theme.css` exists (686B) but there is no theme switcher; persistence approach undecided. Self-contained engineering work, but needs an `ask_user` first on theme scope/naming before writing code. Not a good fit if Rick wants the site visually frozen while art lands.

**4. Parked by design: `threads` / `events` arrays are empty.** `campaign.js` `threads: []`, `events: []`; `archive.js` has the renderers (`threadsOf`, timeline) but no content, and `check-all.cjs` **asserts both stay zero** ("no historical events/threads") — seeding content means updating that assertion too. Content source is the separate GM repo.

## Recommended order

1. **OP 001 roster answer** — cheapest unlock, one question to Rick, two-line data edit, removes a visible "None" on the index.
2. **Art drop-ins as files arrive** — the user-gated item already in motion; each is mechanical (record `img` + thumb + check-all).
3. **Issue #1 themes** — only self-contained code work left; start with an `ask_user` on scope.

## Standing directives (do not violate)

- **Public-site rules text may only come from `lancer-data` 3.1.7 (`@massif/lancer-data`, GPL-3.0-or-later) with attribution** (generated into `detail.js` by `tools/build-detail.cjs`). **Never** reproduce the Solstice Rain book PDF ("do not reproduce without permission") or pack text.
- **GM pages stay off the public site.** They live in a separate repo/checkout (`/mnt/coding/Coding/vargskel-gm/`); `gm.html` must stay 404 publicly, and `check-all.cjs` asserts the mission page doesn't link to `gm.html` or `solstice-rain-m1.html`.
- **Repo is public** (`raddue/vargskel-worgs`): only this repo's own work, no secrets — `.envrc` is gitignored and must never be committed or exposed.
- **Before every commit:** `node check-all.cjs` and `git diff --check`. `check-all.cjs` exits non-zero on unresolved roster items; `tools/build-detail.cjs` also exits 1 on unresolved roster items.
- **Deploy = push to `main`**, which triggers the GitHub Actions Pages workflow. The environment hook **blocks inline `curl ... | grep`**; use `curl -s -o /tmp/file URL` then `grep /tmp/file`. Verify with `gh run watch <id> --exit-status` — and note `gh run list --limit 1` can still return the *previous* run immediately after a push, so match on `headSha` (this bit me once today).
- **Commit style:** single-topic, short imperative subjects with a `feat:` / `fix:` / `chore:` prefix (see `git log`). Keep diffs minimal — this session ran in a minimal-diff/SOLID-lazy mode where deletion beats addition.
- **Reporting style:** sectioned, readable reports with bold leads and blank lines; terse fragments only for inline chat.

## Recovery pointers

- Prior handoffs: `docs/handoffs/2026-10-15-vargskel-roster.md`, `docs/handoffs/2026-10-13-solstice-rain-combat-pages.md`.
- **Working directory gotcha:** the session cwd is `/mnt/coding/Coding/granite-campaign-site`, but the repo is `/mnt/coding/Coding/vargskel-worgs` — always `cd` first (`MODULE_NOT_FOUND` on `tools/build-detail.cjs` means you're in the wrong directory).
- GM-side data and COMPCON build tooling: `/mnt/coding/Coding/vargskel-gm/` (`tools/build-compcon.cjs`, `data/`, `compcon/`).
- Rick's COMPCON saves: `~/Downloads/CC_2026-10-16.compcon` (full save — note its mech `stats.max` are all zeros, it is a *stripped* archive and won't yield derived stat blocks; the values had to be read off the mech sheet screenshots) and `~/Downloads/solstice-rain-compcon-backup.compcon` (GM NPC/encounter bundle).
- `detail.js` is **generated** by `tools/build-detail.cjs` from `LIB` (`LANCER_DATA` env or `argv[2]`, default `/tmp/ld/lancer-data-3.1.7/lib`) — regenerate rather than hand-editing, or re-run it after changing roster records.

## Open questions / deferred decisions

1. **Who is on OP 001?** — all six pilots, part of the roster, or leave empty until M1 is briefed? (Rick cancelled the dialog; unanswered.)
2. **Sweet Cheeks**: now complete from the COMPCON sheet. Worth confirming the record reads correctly in the browser (I verified data and assets, not the rendered page).
3. **Issue #1 themes**: scope, theme names, and persistence mechanism — needs a decision before code.

## Environment note

Not a Crucible checkout — `scripts/grudge_guard_doctor.py` does not exist here, so the grudge-guard outcome-witness check is an ordinary skip, not a failure.