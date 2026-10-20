/* #19 command palette. One filter over every record a page can reach: campaign.js is on every
   page, detail.js carries the rules catalogue, and archive.js's entryOwner names the dossier entry
   a catalogue name belongs to. Ctrl-K (Cmd-K on a Mac) opens it, typing narrows it, Enter opens the
   active row.

   This file loads in <head>, before campaign.js, so nothing here reads the corpora at load time;
   the index is built when the palette first opens.

   The pages carry an empty <div id="palette" hidden>; everything inside it is rendered here. */
(function () {
  /* Groups are ordered, and the order is what a visitor sees for an unfiltered list. */
  var GROUPS = [["weapons", "WEAPON"], ["systems", "SYSTEM"], ["frames", "FRAME"], ["talents", "TALENT"], ["skills", "SKILL"], ["gear", "GEAR"]];
  var rows = [], active = 0, isOpen = false, wired = false, restore = null;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; });
  }

  /* Every record the page can reach, in the order the groups are listed. A catalogue name whose
     record cannot be found is dropped: there would be nothing to open. */
  function corpus() {
    var C = window.CAMPAIGN || {}, D = window.DETAIL || {}, out = [], UI = window.UI;
    function add(group, label, href) { if (href) out.push({ group: group, label: String(label), href: href }); }
    (C.ops || []).forEach(function (o) { add("OP", "OP " + o.id + " · " + o.title, "index.html#op-" + o.id); });
    (C.pilots || []).forEach(function (p) { add("PILOT", p.name, "pilot.html#" + p.id); });
    (C.mechs || []).forEach(function (m) { add("MECH", m.name, "mech.html#" + m.id); });
    (C.locations || []).forEach(function (l) { add("SITE", l.name, "intel.html#map/" + l.id); });
    (C.personnel || []).forEach(function (p) { add("PERSONNEL", p.name, "intel.html#personnel"); });
    GROUPS.forEach(function (g) {
      Object.keys(D[g[0]] || {}).forEach(function (name) {
        var owner = UI && UI.entryOwner ? UI.entryOwner(g[0], name) : "";
        if (owner) add(g[1], name, owner.href);
      });
    });
    return out;
  }

  /* Every token has to appear in the label or the group. A label starting with the whole query
     sorts first; sort is stable, so the rest keep the corpus order the visitor saw before. */
  function hits(query) {
    var q = String(query || "").trim().toLowerCase(), toks = q.split(/\s+/).filter(Boolean);
    var found = toks.length
      ? rows.filter(function (e) { var hay = (e.label + " " + e.group).toLowerCase(); return toks.every(function (t) { return hay.indexOf(t) !== -1; }); })
      : rows.slice();
    if (!q) return found;
    return found.sort(function (a, b) { return (a.label.toLowerCase().indexOf(q) === 0 ? 0 : 1) - (b.label.toLowerCase().indexOf(q) === 0 ? 0 : 1); });
  }

  function paint(query) {
    var found = hits(query), list = document.getElementById("palette-list"), count = document.getElementById("palette-count");
    if (active >= found.length) active = 0;
    if (list) list.innerHTML = found.map(function (e, i) {
      return '<li><a class="palette-row' + (i === active ? " active" : "") + '" id="palette-row-' + i + '" href="' + esc(e.href) + '">' +
        '<span class="palette-label">' + esc(e.label) + "</span><span class=\"palette-group\">" + esc(e.group) + "</span></a></li>";
    }).join("");
    if (count) count.textContent = found.length + (found.length === 1 ? " RECORD" : " RECORDS");
    var row = document.getElementById("palette-row-" + active);
    if (row && row.scrollIntoView) row.scrollIntoView({ block: "nearest" });
  }

  function onKey(e) {
    var input = document.getElementById("palette-input"), q = input ? input.value : "";
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      var found = hits(q);
      if (!found.length) return;
      if (e.preventDefault) e.preventDefault();
      active = (active + (e.key === "ArrowDown" ? 1 : found.length - 1)) % found.length;
      paint(q);
      return;
    }
    if (e.key === "Enter") {
      var pick = hits(q)[active];
      if (!pick) return;
      if (e.preventDefault) e.preventDefault();
      window.location.href = pick.href;   /* the row is a link too, so a click and Enter agree */
      return;
    }
    if (e.key === "Escape") close();
  }

  function open() {
    var host = document.getElementById("palette");
    if (!host) return;
    if (!rows.length) rows = corpus();
    if (!isOpen) restore = document.activeElement;
    isOpen = true;
    host.hidden = false;
    host.innerHTML = '<div class="palette-panel" role="dialog" aria-modal="true" aria-label="Command palette">' +
      '<input class="palette-input" id="palette-input" type="text" aria-label="Search records" aria-describedby="palette-count" placeholder="SEARCH RECORDS" autocomplete="off" spellcheck="false">' +
      '<p class="palette-count" id="palette-count" aria-live="polite"></p>' +
      '<ul class="palette-list" id="palette-list" aria-label="Records"></ul></div>';
    var input = document.getElementById("palette-input");
    if (input) {
      input.addEventListener("input", function () { active = 0; paint(input.value); });
      input.addEventListener("keydown", onKey);
      if (input.focus) input.focus();
    }
    /* The overlay itself is the backdrop: a click on it, rather than on the panel, closes. */
    if (!wired) {
      wired = true;
      host.addEventListener("click", function (e) { if (e.target === host) close(); });
    }
    active = 0;
    paint("");
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    var host = document.getElementById("palette");
    if (host) { host.hidden = true; host.innerHTML = ""; }
    if (restore && restore.focus) restore.focus();
  }

  window.PALETTE = { open: open, close: close };

  document.addEventListener("keydown", function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === "k" || e.key === "K")) {
      if (e.preventDefault) e.preventDefault();
      if (isOpen) close(); else open();
      return;
    }
    if (e.key === "Escape") close();
  });
})();