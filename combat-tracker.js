/* Shared persistence for combat pages. Each page sets data-store on <body> to its
   own localStorage key. Controls carry [data-k] (encounter ticks/notes, keyed by
   element id) or [data-npc] (NPC tracker fields, keyed by the data-npc value).
   HP/heat start at their HTML defaults (full HP / zero heat); saved values win.
   Mirrors the main sheet's tick/note persistence so behaviour stays identical. */
(function () {
  var KEY = (document.body && document.body.getAttribute('data-store')) || 'gss-combat';
  var items = [].slice.call(document.querySelectorAll('[data-k],[data-npc]'));
  var boxes = items.filter(function (el) { return el.type === 'checkbox'; });
  var ok = true;
  try { localStorage.setItem('__probe', '1'); localStorage.removeItem('__probe'); } catch (e) { ok = false; }

  function keyOf(el) { return el.getAttribute('data-npc') || el.id; }
  function readEl(el) { return el.type === 'checkbox' ? el.checked : el.value; }
  function writeEl(el, v) { if (el.type === 'checkbox') el.checked = !!v; else el.value = v; }

  function counts() {
    var n = boxes.filter(function (el) { return el.checked; }).length;
    var s = ('0' + n).slice(-2) + ' / ' + ('0' + boxes.length).slice(-2);
    var a = document.getElementById('tick-count'), b = document.getElementById('tick-count-2');
    if (a) a.textContent = s;
    if (b) b.textContent = s;
  }
  function save() {
    if (!ok) return;
    var d = {};
    items.forEach(function (el) {
      var k = keyOf(el);
      if (k) d[k] = readEl(el);
    });
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch (e) {}
  }
  function load() {
    if (!ok) return;
    var d = {};
    try { d = JSON.parse(localStorage.getItem(KEY) || '{}'); } catch (e) { d = {}; }
    items.forEach(function (el) {
      var k = keyOf(el), v = d[k];
      if (v === undefined) return;
      writeEl(el, v);
    });
  }

  items.forEach(function (el) {
    el.addEventListener('change', function () { save(); counts(); });
    el.addEventListener('input', save);
  });

  var r = document.getElementById('reset');
  if (r) r.addEventListener('click', function () {
    if (!confirm('Clear every tick, tracker and note on this sheet?')) return;
    try { localStorage.removeItem(KEY); } catch (e) {}
    // Restore each control's HTML default, not blank: struct/stress start checked
    // and HP starts full, so clearing the sheet must not read as "all lost".
    items.forEach(function (el) {
      if (el.type === 'checkbox') el.checked = el.defaultChecked; else el.value = el.defaultValue;
    });
    counts();
  });

  if (!ok) {
    var st = document.getElementById('save-state');
    if (st) st.textContent = 'TRACKING WILL NOT PERSIST · LOCAL STORAGE UNAVAILABLE';
  }
  load(); counts();
})();