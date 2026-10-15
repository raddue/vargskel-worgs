# Continuation handoff — Vargskel Worgs roster

**Mode A: continuation.** Local roster changes are verified but uncommitted, and the latest Scooteroo visual adjustment awaits user approval. Do not treat this as a request to publish.

## Goal and next action

Resume the roster arc without losing the local work. First read `git status --short` and inspect the current diff in `campaign.js`, `check-all.cjs`, and `style.css`. If the user confirms Scooteroo's size/position, ask whether to publish; otherwise adjust only the Scooteroo-specific CSS from a fresh screenshot. Do not reopen Zen or push without a new request.

## State snapshot — 2026-10-15

- Repo: `/mnt/coding/Coding/vargskel-worgs`, branch `main`, HEAD `df290b7` (`feat: add pilots and update roster`). Remote: `https://github.com/raddue/vargskel-worgs.git`; published Pages: `https://raddue.github.io/vargskel-worgs/`. The public site is at the last pushed commit; following local changes are **not live**.
- Dirty tracked files: `campaign.js`, `check-all.cjs`, `style.css`. Untracked: `assets/scooteroo.png` (user-supplied art), `.pi/` (machine-local; exclude from staging).
- `campaign.js`: Sten “Hammer” Vargskel now has the LL0 details from `/home/rickr/Downloads/NOGROUP(1).json` and is linked to his GMS Everest **Skaldr**. Last `TBH` pilot/mech pair restored at bottom; roster has six pilots and six mechs. Scooteroo has `img: "assets/scooteroo.png"`.
- `check-all.cjs` validates Sten/Skaldr, final `TBH` pair, and Scooteroo art path. `style.css` scales only Scooteroo mech art to `.8` and raises it 6px with `transform:translateY(-6px) scale(.8)`; backdrop and other mechs unchanged. Latest screenshot prompted the raise; no screenshot after that edit yet.
- Verification at handoff: `node check-all.cjs`, `node check-opfor.cjs`, and `git diff --check` passed. Image is RGBA 1122×1402. No browser visual validation of the final 6px raise.

## Suggested approach

1. Wait for user visual feedback on Scooteroo art; the existing Zen tab can be refreshed with Ctrl+R. Do not launch a new Zen tab/window: earlier Wayland tooling could not target the existing tab reliably.
2. If asked to ship, stage only intended site files (`campaign.js`, `check-all.cjs`, `style.css`, `assets/scooteroo.png`), review staged diff, rerun checks, commit/push `main`, then verify the matching Pages build and live image. Never stage `.pi/`.
3. If Guillaume's mech art arrives, add it to the existing `XXXG-01H` record, not a new mech. Its art remains pending; no image has been invented.

## Standing directives and open decisions

- Rurik and Dusty's pilot card appearance is the accepted template. The crew's mech-image backdrop intentionally sits behind the art. Pilot portrait spacing `.crew .mech-thumb{margin-bottom:18px}` was accepted; do not change it incidentally.
- No decision on Rurik's callsign. “Chisel” and “Whisper” were suggestions only; do not edit name without user choice.
- Ice-blue UI accent swap was chosen as a future direction but not implemented. Keep it separate from roster changes unless requested.
- GM sheets are deliberately public but unlinked from crew briefing, via `gm.html`; `gm.html` is a navigation hub, not access control.
- User did not ask to copy the large Sten source JSON into the public repo. Keep it in Downloads unless instructed otherwise.

## Recovery pointers

- Roster data: `campaign.js`; structural/content assertions: `check-all.cjs`; card rendering: `index.html` around `crew-list` and `mech-list`; shared and Scooteroo-only styling: `style.css`.
- Prior completed handoff: `docs/handoffs/2026-10-13-solstice-rain-combat-pages.md` (historical, not current).
- Rurik/Sten backstory remains in another Herdr worker worktree: `/home/rickr/.herdr/worktrees/granite-campaign-site/worktree-silver-stone-5877/docs/rurik-history.md`. Do not prompt or modify that pane without asking.
