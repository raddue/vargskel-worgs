# Continuation handoff — Solstice Rain combat pages

**Mode: continuation.** Three combat pages and persistent NPC trackers were requested and the layout was decided, but implementation has not begun. This creates the repo's `docs/handoffs/` convention.

## Goal and next action

Split the three Mission 1 combat scenarios from `solstice-rain-m1.html` into one focused page per combat. Put the relevant Tier 1 NPC cards inside each page, with editable current HP and heat, Structure/Stress checkboxes, duplicate-unit labels, and browser-persistent tracking. Keep the main page's briefing, narrative beats, downtime, filing, and links to the combat pages.

First inspect `solstice-rain-m1.html` and `check-opfor.cjs`, then map each scenario's tuned deployment and reinforcements to NPC instances before moving content. Preserve the existing encounter instructions and the current browser-saved notes/ticks rather than silently dropping them.

## State snapshot

- Repo: `/mnt/coding/Coding/granite-campaign-site`, branch `main`, HEAD `7ce23c4` (2026-10-12). Working tree dirty: modified `campaign.js`, `index.html`, `style.css`; untracked `.pi/`, `assets/`, `check-opfor.cjs`, `solstice-rain-m1.html`. None committed here. Do not reset or overwrite these changes.
- `solstice-rain-m1.html` already contains complete M1 GM sheet, three combats, OPFOR Tier 1 cards for 16 classes and four template summaries, and localStorage-backed ticks/notes under key `gss-solstice-rain-m1-v1`.
- `check-opfor.cjs` currently asserts that all 16 class cards and four template headings live on the main page. It must be updated for the split, not left broken.
- Existing verification: `node check-opfor.cjs`, `node check-all.cjs`, `git diff --check`, and HTML ID uniqueness passed before the new request. No browser layout check yet.
- PDF source: `/home/rickr/Downloads/Lancer-Core-Book-chapters/Lancer - Core Book.pdf`; extracted NPCs `/home/rickr/Downloads/Lancer-Core-Book-chapters/07-npcs.md` (printed pp.280–325); templates `08-npc-templates.md` (pp.326–333). PDF icons for damage type, heat, blast, accuracy are missing from the MD extraction: use PDF page renders for any uncertain rule.

## Decisions made with user

- **Pages:** one page per combat; main sheet keeps briefing, beats, downtime, and links. Do not keep all three combats embedded on main page.
- **Tracking:** each deployed NPC card tracks editable current HP and heat, Structure and Stress checkboxes, duplicate labels, and notes; persist like existing notes. User chose this over manual HP tally or full activation/condition dashboard. A Destroyed checkbox was in the preview for the selected option; include it if useful.
- Previous preference: soften the adventure directly, with no separate soften section. Combat 1 tuned for five PCs to four rounds, 3-PC starting force and one reinforcement per round from round 2 (Bombard/Priest only); Combat 2 remains untuned; Combat 3 uses Hive, Rainmaker, Sentinel, +Archer at four PCs, +Ronin at five, with Veteran/Elite/Commander/Specter removed. Keep the book's optional reference distinctly marked, not accidentally deployed.

## Suggested approach

1. Map `#c1`, `#c2`, `#c3` and OPFOR content, including deployment variants and NPC duplicates; move each complete encounter into a page, keep mission flow links on main. Decide whether nondeployed reference cards belong on main or within the relevant scenario; do not remove their information.
2. Use page-local HTML/CSS matching `style.css`. Reuse existing card styling and localStorage pattern; use new page-specific keys/IDs to avoid overwriting prior main-sheet notes. Numeric inputs for HP/heat should start at full HP/zero heat and allow current values to persist. Standard NPCs have 1 Structure and 1 Stress; templates change totals (Veteran, Elite, Commander each +1; Grunt fixed 1 HP, 1/1). Track actual deployed instances, with duplicate names A/B etc. and reinforcement labels.
3. Write a failing focused check first, then implementation. Update `check-opfor.cjs` to assert page coverage and tuned enemy trackers. Run `node check-opfor.cjs`, `node check-all.cjs`, `git diff --check`, script syntax/HTML ID checks, and browser/mobile layout check if available.

## Risks and deferred questions

- Existing localStorage data from main sheet must remain accessible after split; choose migration or leave existing notes on main and provide separate page keys. Do not silently erase recorded session data.
- Multiple encounter variants and reinforcements exist. User selected one page per combat but did not specify whether tracker instances should cover tuned only, full book roster, or both. The sensible default is tuned deployment and a clearly separate optional pool, but clarify if implementation would otherwise be ambiguous.
- The OPFOR summaries are abbreviated GM references; the PDF is authoritative for precise system effects. Existing card text may have transcription errors; avoid claiming verbatim rules.
- No requests yet to commit or build Mission 2. Leave `quest-cheatsheet.html` unchanged.

## Recovery pointers

- `solstice-rain-m1.html`: styles/navigation near top; Combat 1 around line 145, Combat 2 around 235, Combat 3 around 325, OPFOR after downtime around line 460 (offsets may shift).
- `check-opfor.cjs` holds the current 16-class/four-template inventory check.
- `style.css` supplies shared theme; `campaign.js` is separate campaign data.
- Current task #4 in todo was clarifying layout/tracking; user answered both. Next session should mark clarification done and start implementation.
