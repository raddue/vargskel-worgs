/* #1 selectable colour themes. The visitor's choice lives in their own storage and is applied to
   <html> before the body paints (this file sits in <head>, ahead of compact.js which check #20 pins
   as last), so a reload never flashes the default palette. The control is chrome.themeToggle() in
   tools/chrome.cjs, and the colours are the html[data-theme="ice"] group in theme.css. Only tokens
   change: the ice tint is the unit logo's navy, blue and cyan, and no layout or content differs.
   shortcut: loadout.html carries neither this file nor the control, because it is the peer's file
   under the one-writer rule; it renders the default palette until that residual is picked up there. */
(function () {
  var KEY = "vw.theme";
  var ICE = "ice";
  var store = typeof localStorage !== "undefined" ? localStorage : null;
  var root = document.documentElement;

  /* storage can throw (private mode) without the page losing its palette for this load */
  function read() {
    try { return store && store.getItem(KEY) === ICE ? ICE : ""; } catch (e) { return ""; }
  }
  function write(theme) {
    try { if (theme) store.setItem(KEY, theme); else store.removeItem(KEY); } catch (e) {}
  }
  function paint(theme) {
    root.dataset.theme = theme;
    var b = document.getElementById("theme-toggle");
    if (b && b.setAttribute) b.setAttribute("aria-pressed", theme === ICE ? "true" : "false");
  }

  paint(read());

  function wire() {
    var b = document.getElementById("theme-toggle");
    if (!b) return;
    /* the head pass runs before the control is parsed, so the stored state reaches it here: without
       this a screen reader reads "not pressed" while the ice palette is the one on screen */
    paint(read());
    b.addEventListener("click", function () {
      var theme = read() === ICE ? "" : ICE;
      paint(theme);
      write(theme);
    });
  }

  /* <head> runs before the control is parsed, so wiring waits for the document; a document that has
     already parsed (a late load, or a check mounting the page) wires straight away. */
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", wire);
  else wire();
})();
