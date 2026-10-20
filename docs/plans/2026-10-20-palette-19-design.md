# #19 Ctrl-K command palette, design rev 1 (2026-10-20)

Status: decisions taken, implementation follows TDD. No rev 2 yet.

## What it is

One overlay reachable from any page that carries campaign data: Ctrl-K (Cmd-K on macOS) opens it,
typing filters the site's records, Enter opens the record the selected row names.

## Corpus

Two sources, both already in the repo.

`campaign.js` is loaded by every page: 13 locations, 6 pilots, 6 mechs, 2 personnel, 1 op, so 28
entries. `detail.js` holds the rules catalogue: 13 weapons, 13 systems, 3 frames, 15 talents, 13
skills, 26 gear, so 83 entries. Together, 111.

Every catalogued name is fielded by a mech or a pilot. That was verified by scanning `campaign.js`
with the same name normalisation `archive.js` uses (`talentName` strips a trailing rank,
`triggerName` strips ` (+N)`), so each catalogue entry has a real destination.

`detail.js` loads only on `pilot.html` and `mech.html` today. #19 adds its script tag to the other
six campaign pages. The file is already in the service worker's precache list, so the offline
install does not grow; the six pages pay 39KB of parsed data each.

`catalogue.js` (the loadout sandbox catalogue) is deliberately not a source. The sandbox is not a
nav destination and that file belongs to the mechbay session.

## Where it lives

A new `palette.js`, loaded in `<head>` after `offline.js` on the eight campaign pages, exactly the
way `compact.js` is loaded. Each of those pages carries an empty host, `<div id="palette" hidden>`,
next to its other panel hosts. Markup, filtering and selection all live in `palette.js`.

Nothing touches `tools/chrome.cjs`. That file is a shared surface with the mechbay session, and the
ticket asks for a key binding rather than a control in the header. A chrome button is a one-line
follow-up once the two sessions are editing that file together.

## Destinations

| Entry | Opens |
| --- | --- |
| location | `intel.html#map/<id>` (the hash shape `intel.html` already reads) |
| pilot | `pilot.html#<id>` |
| mech | `mech.html#<id>` |
| op | `index.html#op-<id>` |
| personnel | `intel.html#personnel`, the tab listing their card. A person has no record page, and their file renders in the map pane's aside, so the tab is the honest destination. |
| catalogue name | `<owner>.html#<recordId>/<entryId>`: the record, then the entry inside it |

The last row reuses the ids #17 rendered (`pilot-<id>-talent-<slug>`, `mech-<id>-weapon-<slug>`, and
so on). `archive.js` gains `entryOwner(group, name)`, returning `{href, id}` or `""`, so the palette
and the dossiers cannot drift apart. A catalogue name nobody fields would be dropped from the index;
today that set is empty.

The href carries two things because one hash slot has to hold both: a dossier page selects its record
from the first half and its entry from the second, the way `intel.html` reads `#map/<loc>`. A probe
run caught the first cut of this, which pointed at the entry id alone and therefore landed on a page
that could not resolve its own record.

## Filter and order

Query tokens are whitespace separated and case folded, and every token must appear as a substring of
`label + group`. Groups render in a fixed order: OPS, PILOTS, MECHS, LOCATIONS, PERSONNEL, then
weapons, systems, frames, talents, skills, gear. Inside a group, label-prefix matches sort first and
the rest keep source order. The order is a pure function of the query and the data, so the same
query always shows the same list.

## Keys and pointer

Ctrl-K or Cmd-K toggles the overlay. Escape closes it. ArrowUp and ArrowDown move the active row,
wrapping at both ends. Enter opens the active row by assigning `location.href`; a click on a row
does the same. A click on the backdrop closes it.

## Accessibility

The overlay is `role="dialog"` with `aria-modal="true"` and a label. Each row is a real `<a href>`,
so a click, a middle click, Enter, and a copied address are the same act, and a screen reader can tab
through the results as links. The search input carries an accessible name and points at the match
count, which is a live region, so the filter announces itself as it narrows. Focus moves into the
input when the overlay opens and returns to the previously focused element when it closes. The arrow
keys move a row marked with a class, not an ARIA selection state, because links are not listbox
options. No animation runs, so nothing needs a reduced-motion branch.

## Tests

`check-all.cjs` gains a #19 block. Source clauses: the eight pages carry the script tag, the host div
and `detail.js`; `sw.js` precaches `palette.js`; `palette.js` binds Ctrl-K and Cmd-K on the document
and assigns `location.href` on Enter.

Stub-driven clauses, through `tools/render.cjs`'s `mount`: `PALETTE.open()` renders the overlay, the
empty query lists all 111 records, typing `nexus` narrows it to the two Nexus weapons with the first
row active, ArrowDown and ArrowUp move the active row, Enter assigns that row's href, Escape closes
and the host hides again. Every row's href is then mounted as the destination page would read it: the
page has to exist, and a row naming an entry has to land on a page that renders both halves.

The real gesture is a chromium probe, and it is reported as a probe, never as a test: Ctrl-K on
`intel.html` opened the overlay at 111 records with focus in the input, `nexus` narrowed it to two,
ArrowDown and Enter landed on `mech.html#averna/mech-averna-weapon-nexus-light` with that entry
scrolled into view, Escape closed it, and a click on a row followed its link. Twenty-one mutations
were run against the new clauses, each one named by the check that caught it.

## Out of scope

`loadout.html` and `catalogue.js` (the mechbay session's files), the guide page (it loads no campaign
data, so a palette there would search nothing), and a header control.

## Risks

The six new `detail.js` loads raise each page's parsed data by 39KB. The offline shell already
carries the file, and network payload is unchanged from `pilot.html`'s today, so the cost is parse
time on pages that do not render catalogue rules.