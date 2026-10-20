/* #20 phone density. The visitor's choice lives in their own storage and is applied to <html>
   before the body paints (this file is the last thing in <head>), so a reload never flashes the
   roomier layout. The control is chrome.compactToggle() in tools/chrome.cjs, and the rules are
   the html[data-compact="1"] group at the end of style.css. Nothing is hidden: only type and
   table padding tighten. */
(function () {
  var KEY = "vw.compact";
  var store = typeof localStorage !== "undefined" ? localStorage : null;
  var root = document.documentElement;

  /* storage can throw (private mode) without the layout losing its state for this page load */
  function read() {
    try { return !!(store && store.getItem(KEY) === "1"); } catch (e) { return false; }
  }
  function write(on) {
    try { if (on) store.setItem(KEY, "1"); else store.removeItem(KEY); } catch (e) {}
  }
  function paint(on) {
    root.dataset.compact = on ? "1" : "";
    var b = document.getElementById("compact-toggle");
    if (b && b.setAttribute) b.setAttribute("aria-pressed", on ? "true" : "false");
  }

  paint(read());

  function wire() {
    var b = document.getElementById("compact-toggle");
    if (!b) return;
    /* the head pass runs before the control is parsed, so the stored state reaches it here: without
       this a screen reader reads "not pressed" while the compact layout is the one on screen */
    paint(read());
    b.addEventListener("click", function () {
      var on = !read();
      paint(on);
      write(on);
    });
  }

  /* <head> runs before the control is parsed, so wiring waits for the document; a document that
     has already parsed (a late load, or a check mounting the page) wires straight away. */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();