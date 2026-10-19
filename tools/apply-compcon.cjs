#!/usr/bin/env node
/* Fold COMPCON pilot exports into the tracked state in campaign.js.
   Usage: node tools/apply-compcon.cjs <export.json|dir> [--write] [--snapshot]
          node tools/apply-compcon.cjs --log "<pilot> dealt=14 taken=9" [--op 001] [--date YYYY-MM-DD] [--write]
          node tools/apply-compcon.cjs --selftest
   Writes current_hp/current_structure/current_stress and statuses+conditions.
   Session state is pinned by tools/roster-snapshot.json, so a write leaves check-all
   reporting snapshot drift until it is refreshed: review the values, then re-run with
   --snapshot (which runs check-all --update-snapshot), or run that yourself.
   heat/repair map to heatNow/repairsNow because the site's heat/repair fields hold the
   chassis caps (Everest: Max Heat 6, Repair Capacity 5) and nothing else carries them;
   the renderer shows current/max. Statuses resolve to the canonical book names
   (lancer-data 3.1.7 lib/statuses.json) plus AI CASCADE from a cascading NHP entry. */
const fs = require("fs"), path = require("path"), vm = require("vm"), { spawnSync } = require("node:child_process");
const ROOT = path.join(__dirname, "..");
const CAMP = path.join(ROOT, "campaign.js");

const FIELDS = [
  ["current_hp", "hpNow"],
  ["current_structure", "structure"],
  ["current_stress", "stress"],
  ["current_heat", "heatNow"],
  ["current_repairs", "repairsNow"],
];
const norm = s => String(s || "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const clean = v => (v === undefined || v === null || v === "" || Number.isNaN(Number(v)) ? null : Math.max(0, Math.trunc(Number(v))));
const label = s => String(s).toUpperCase().replace(/\s+/g, " ").trim();
const validLabel = s => /^[A-Z0-9][A-Z0-9 ·+-]{0,23}$/.test(s);
/* Canonical statuses from lancer-data 3.1.7 lib/statuses.json, plus the AI CASCADE state
   (an installed NHP / COMP-CON whose entry is flagged cascading). COMPCON emits squashed
   ids like "lockon", so labels resolve through canLabel() before anything is written. */
const STATUSES = ["Danger Zone", "Down and Out", "Engaged", "Exposed", "Hidden", "Invisible", "Prone", "Shut Down", "Immobilized", "Impaired", "Jammed", "Lock On", "Shredded", "Slowed", "Stunned", "Cascade"];
const squash = s => String(s).toUpperCase().replace(/[^A-Z0-9]/g, "");
const CANON = new Map(STATUSES.map(n => [squash(n), n.toUpperCase()]));
const canLabel = s => CANON.get(squash(s)) || label(s);
/* Any equipment entry flagged cascading anywhere in the mech means an NHP is unshackled. */
const cascading = (o, seen = new Set()) => {
  if (!o || typeof o !== "object" || seen.has(o)) return false;
  seen.add(o);
  if (o.cascading === true) return true;
  return Object.values(o).some(v => cascading(v, seen));
};

function loadCampaign() {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(CAMP, "utf8"), sandbox, { filename: "campaign.js" });
  return sandbox.window.CAMPAIGN;
}

function pilotsFrom(data) {
  if (Array.isArray(data)) return data.flatMap(pilotsFrom);
  if (!data || typeof data !== "object") return [];
  if (Array.isArray(data.mechs)) return [data];
  return Object.values(data).flatMap(v => (v && typeof v === "object" ? pilotsFrom(v) : []));
}

/* Map one COMPCON mech onto the site's tracked fields. Pure, so --selftest can assert it. */
function mapMechState(cm) {
  const set = {}, rejected = [], unknown = [];
  for (const [from, to] of FIELDS) {
    const v = clean(cm[from]);
    if (v !== null) set[to] = v;
  }
  const raw = [...(Array.isArray(cm.statuses) ? cm.statuses : []), ...(Array.isArray(cm.conditions) ? cm.conditions : [])];
  const conds = [...new Set([...raw.map(canLabel), ...(cascading(cm) ? ["CASCADE"] : [])].filter(Boolean))].sort();
  set.conditions = conds.filter(c => {
    if (!validLabel(c)) {
      rejected.push(c);
      return false;
    }
    if (!CANON.has(squash(c))) unknown.push(c);
    return true;
  });
  return { set, rejected, unknown };
}

/* Replace or insert fields inside one mech object's text region. A value match stops at
   the next comma or closing brace, so the object's punctuation and spacing survive. */
/* One canonical writer for the migration and for every later write: object keys unquoted, strings
   through JSON.stringify, one space after each comma. The no-op check compares JSON.stringify of the
   two values rather than deep-equalling them, because a span evaluated in a vm sandbox carries
   different prototypes across that boundary. */
const lit = (v) => Array.isArray(v)
  ? `[${v.map(lit).join(", ")}]`
  : (v && typeof v === "object")
    ? `{ ${Object.entries(v).map(([k, x]) => `${k}: ${lit(x)}`).join(", ")} }`
    : typeof v === "string" ? JSON.stringify(v) : String(v);

/* The field's whole value span, bracket-aware: a list or an object runs to its matching closer, so
   a comma inside it cannot cut the match short. Quoted strings are skipped over. */
function spanOf(region, field) {
  const m = new RegExp(`(^|[\\s,{])${field}:\\s*`).exec(region);
  if (!m) return null;
  const at = m.index + m[0].length;
  let depth = 0, quote = null, end = at;
  for (let i = at; i < region.length; i++) {
    const c = region[i];
    if (quote) { if (c === "\\") i++; else if (c === quote) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; continue; }
    if (c === "[" || c === "{") { depth++; continue; }
    if (c === "]" || c === "}") {
      if (!depth) { end = i; break; }
      if (!--depth) { end = i + 1; break; }
      continue;
    }
    if (!depth && (c === "," || c === "\n")) { end = i; break; }
  }
  return { at, end };
}

function applyToText(text, siteId, set) {
  const start = text.indexOf(`{ id: "${siteId}",`);
  if (start < 0) return null;
  const next = text.indexOf('\n    { id: "', start + 1);
  const end = next < 0 ? text.length : next;
  let region = text.slice(start, end);
  const notes = [], add = [];
  for (const [field, value] of Object.entries(set)) {
    const span = spanOf(region, field);
    if (!span) {
      if (!(Array.isArray(value) && !value.length)) add.push(`${field}: ${lit(value)}`);
      continue;
    }
    const raw = region.slice(span.at, span.end);
    const trailing = raw.match(/\s*$/)[0];
    const current = raw.trim();
    let same = false;
    try { same = JSON.stringify(vm.runInNewContext("(" + current + ")")) === JSON.stringify(value); } catch (e) { same = false; }
    if (same) continue;
    region = region.slice(0, span.at) + lit(value) + trailing + region.slice(span.end);
    notes.push(`${field} ${current} -> ${lit(value)}`);
  }
  if (add.length) {
    const anchored = region.replace(/(state: "[^"]*",)/, (token) => `${token} ${add.join(", ")},`);
    region = anchored !== region ? anchored : region.replace(/(\{ id: "[^"]*",)/, (token) => `${token} ${add.join(", ")},`);
    add.forEach(x => notes.push(`${x.split(":")[0]} (added) -> ${x.slice(x.indexOf(": ") + 2)}`));
  }
  if (!notes.length) return { text, notes: [] };
  return { text: text.slice(0, start) + region + text.slice(end), notes };
}

/* The block crosses a trust boundary, so this is JSON.parse and a shape check, never eval. */
function parseLoadoutBlock(text) {
  const bad = (m) => ({ error: m });
  const lines = String(text).split("\n").map(l => l.trim()).filter(Boolean);
  const json = lines.filter(l => l.startsWith("{")).pop();
  if (!json) return bad("no JSON object in the block");
  let o;
  try { o = JSON.parse(json); } catch (e) { return bad("the block is not JSON: " + e.message); }
  const keys = ["mech", "frame", "pilot", "mounts", "systems"];
  for (const k of Object.keys(o)) if (!keys.includes(k)) return bad(`unknown key ${k}`);
  for (const k of keys) if (!(k in o)) return bad(`missing ${k}`);
  for (const k of ["mech", "frame", "pilot"]) if (typeof o[k] !== "string" || !o[k]) return bad(`${k} must be a name`);
  if (!Array.isArray(o.mounts)) return bad("mounts must be a list");
  for (const m of o.mounts) {
    if (!m || typeof m !== "object") return bad("each mount must be an object");
    if (typeof m.slot !== "string" || !m.slot) return bad("each mount needs a slot");
    if (!Array.isArray(m.weapons)) return bad("each mount needs a weapons list");
    if (m.weapons.some(w => w !== null && typeof w !== "string")) return bad("weapon names must be strings");
    if (m.locked !== undefined && m.locked !== true) return bad("locked may only be true");
  }
  if (!Array.isArray(o.systems) || o.systems.some(s => typeof s !== "string")) return bad("systems must be a list of names");
  return { mech: o.mech, frame: o.frame, pilot: o.pilot,
    mounts: o.mounts.map(m => m.locked ? { slot: m.slot, weapons: m.weapons.slice(), locked: true } : { slot: m.slot, weapons: m.weapons.slice() }),
    systems: o.systems.slice() };
}

function selftest() {
  const errs = [];
  const mapped = mapMechState({ current_hp: 8, current_structure: 2, current_stress: 3, current_heat: 4, current_repairs: 5, statuses: ["STUNNED", "lockon"], conditions: ["Shredded"] });
  if (mapped.set.hpNow !== 8 || mapped.set.structure !== 2 || mapped.set.stress !== 3) errs.push("numeric fields did not map");
  if (mapped.set.heatNow !== 4 || mapped.set.repairsNow !== 5) errs.push("current heat/repairs must map to heatNow/repairsNow");
  if (mapped.set.heat !== undefined || mapped.set.repair !== undefined) errs.push("the cap fields must never be overwritten");
  if (JSON.stringify(mapped.set.conditions) !== JSON.stringify(["LOCK ON", "SHREDDED", "STUNNED"])) errs.push("statuses must fold, resolve to canonical names, and sort");
  if (JSON.stringify(mapMechState({ current_hp: 5, loadouts: [{ systems: [{ id: "ms_nhp", cascading: true }] }] }).set.conditions) !== JSON.stringify(["CASCADE"])) errs.push("a cascading AI entry must add CASCADE");
  if (mapMechState({ current_hp: 5, loadouts: [{ systems: [{ id: "ms_nhp", cascading: false }] }] }).set.conditions.length !== 0) errs.push("an intact NHP must not add CASCADE");
  const bad = mapMechState({ current_hp: 9, statuses: ["OK", "<script>alert(1)</script>", "a".repeat(40)] });
  if (JSON.stringify(bad.set.conditions) !== JSON.stringify(["OK"])) errs.push("an invalid label must be dropped and the valid ones kept");
  if (bad.rejected.length !== 2) errs.push("rejected labels were not reported");
  if (JSON.stringify(bad.unknown) !== JSON.stringify(["OK"])) errs.push("unrecognized labels must be reported, not silently kept");
  if (clean("nonsense") !== null || clean(-3) !== 0) errs.push("clean() must reject junk and clamp negatives");

  const sample = '  mechs: [\n    { id: "tombstone", name: "TOMBSTONE", state: "OPERATIONAL", hp: 10, hpNow: 10 },\n    { id: "skaldr", state: "OPERATIONAL", hp: 12 },\n  ],';
  const noop = applyToText(sample, "tombstone", { hpNow: 10 });
  if (noop.notes.length !== 0 || noop.text !== sample) errs.push("a no-op must be byte-identical");
  const a = applyToText(sample, "tombstone", { hpNow: 3 });
  if (!/hpNow: 3 \}/.test(a.text)) errs.push("replace must keep the object's closing brace");
  if (!/hp: 10,/.test(a.text)) errs.push("replace must not disturb sibling fields");
  const b = applyToText(sample, "skaldr", { structure: 2, conditions: ["STUNNED"] });
  if (!/skaldr[^}]*state: "OPERATIONAL", structure: 2, conditions: \["STUNNED"\],/.test(b.text)) errs.push("absent fields must be inserted after state, in field order");
  if (/tombstone[^}]*structure/.test(b.text)) errs.push("a different mech region was touched");
  const c = applyToText(sample, "skaldr", { conditions: [] });
  if (c.notes.length !== 0 || c.text !== sample) errs.push("an empty condition set must not add a field");
  const clear = applyToText('{ id: "skaldr", state: "OPERATIONAL", conditions: ["STUNNED"] },', "skaldr", { conditions: [] });
  if (!/conditions: \[\]/.test(clear.text)) errs.push("an existing condition list must be clearable");
  const know = { pilots: new Set(["dusty", "spook"]) };
  const parsed = parseLog("dusty dealt=14 taken=9 repairs=3", know);
  if (parsed.error || parsed.pilot !== "dusty" || parsed.stats.dealt !== 14 || parsed.stats.repairs !== 3) errs.push("--log must parse a pilot and stat=number pairs");
  if (!parseLog("nobody dealt=1", know).error) errs.push("an unknown pilot must be refused");
  if (!parseLog("dusty bogus=2", know).error) errs.push("an unknown stat must be refused");
  if (!parseLog("dusty dealt=-3", know).error) errs.push("a negative stat must be refused");
  if (!parseLog("dusty dealt=abc", know).error) errs.push("a non-numeric stat must be refused");
  if (!parseLog("dusty", know).error) errs.push("an entry with no stats must be refused");
  const row = ledgerRow("001", "2026-10-18", "dusty", { dealt: 14, taken: 9 });
  const emptied = appendLedgerRow('  ledger: [],\n  meta: {},', row);
  if (!/ledger: \[\n    \{ op: "001", date: "2026-10-18", pilot: "dusty", dealt: 14, taken: 9 \},\n  \],/.test(emptied)) errs.push("a row must append cleanly into an empty ledger array");
  const filled = appendLedgerRow('  ledger: [\n    { op: "001", date: "2026-10-17", pilot: "spook", taken: 2 },\n  ],\n  meta: {},', row);
  if (!/taken: 2 \},\n    \{ op: "001", date: "2026-10-18"/.test(filled)) errs.push("a row must append after existing ledger rows");
  if (appendLedgerRow("window.CAMPAIGN = { meta: {} };", row) !== null) errs.push("a missing ledger array must be reported, not guessed");
  /* --- the loadout export round trip (design test 6), on fixture text only --- */
  const LO = require("../loadout.js");
  const want = { mech: "tombstone", frame: "GMS EVEREST", pilot: "tombstone",
    mounts: [{ slot: "Main/Aux", weapons: ["Nexus (Hunter-Killer)", "Nexus (Light)"] }, { slot: "Flex", weapons: ["Missile Rack"] }],
    systems: ["Personalizations", "Custom Paint Job", "Deployable Cover, Mk II"] };
  if (typeof LO.exportLoadout !== "function") errs.push("loadout.js must export exportLoadout");
  else if (typeof parseLoadoutBlock !== "function") errs.push("apply-compcon must export parseLoadoutBlock");
  else {
    const back = parseLoadoutBlock(LO.exportLoadout(Object.assign({ sys: 0 }, want)));
    if (back.error) errs.push("an exported block must parse: " + back.error);
    else if (JSON.stringify(back) !== JSON.stringify(want)) errs.push("the export round trip must return the build unchanged, got " + JSON.stringify(back));
    if (!parseLoadoutBlock("nonsense").error) errs.push("a block with no JSON object must be refused");
    if (!parseLoadoutBlock('{"mech":"x","extra":1}').error) errs.push("an unknown key must be refused");
    if (!parseLoadoutBlock('{"mech":"x","frame":"f","pilot":"p","systems":[],"mounts":"Main"}').error) errs.push("mounts must be a list");
    if (!parseLoadoutBlock('{"mech":"x","frame":"f","pilot":"p","systems":[],"mounts":[{"slot":"Main"}]}').error) errs.push("a mount needs a weapons list");
    if (!parseLoadoutBlock('{"mech":"x","frame":"f","pilot":"p","systems":[1],"mounts":[]}').error) errs.push("system names must be strings");
    /* an empty seat keeps its index, so a build with the Aux seat filled is not read as the Main one */
    const holed = { mech: "x", frame: "f", pilot: "p", mounts: [{ slot: "Main/Aux", weapons: [null, "Nexus (Light)"] }], systems: [] };
    const backHoled = parseLoadoutBlock(LO.exportLoadout(holed));
    if (JSON.stringify(backHoled) !== JSON.stringify(holed)) errs.push("an empty seat must survive the round trip, got " + JSON.stringify(backHoled.mounts));
  }
  /* a list with a comma inside it must be replaced whole, and an identical value must be a no-op */
  const conds = '{ id: "skaldr", state: "OPERATIONAL", conditions: ["A", "B"] },';
  const fixed = applyToText(conds, "skaldr", { conditions: ["C"] });
  if (!fixed || fixed.text.includes('], "B"]')) errs.push("a comma inside a list must not survive the replacement");
  if (!/conditions: \["C"\] \},/.test(fixed.text || "")) errs.push("a list must be replaced whole and keep the closing brace");
  const spaced = '    { id: "tombstone",\n      mounts: [\n        { slot: "Main/Aux", weapons: ["Nexus (Hunter-Killer)"] },\n      ],\n      systems: ["Personalizations"],\n    },';
  const same = applyToText(spaced, "tombstone", { mounts: [{ slot: "Main/Aux", weapons: ["Nexus (Hunter-Killer)"] }], systems: ["Personalizations"] });
  if (!same || same.notes.length !== 0 || same.text !== spaced) errs.push("an identical multi-line value must be a no-op, not a reformat");
  const multi = applyToText(spaced, "tombstone", { systems: ["Personalizations", "Custom Paint Job", "A, B"] });
  if (!multi || !/systems: \["Personalizations", "Custom Paint Job", "A, B"\]/.test(multi.text)) errs.push("a multi-item list must replace the whole span");
  if (!multi || !multi.text.includes('{ slot: "Main/Aux", weapons: ["Nexus (Hunter-Killer)"] }')) errs.push("replacing one list must not disturb another field's span");
  const outd = applyToText(spaced, "tombstone", { mounts: [{ slot: "Heavy", weapons: ["Howitzer"] }] });
  if (!outd || !outd.text.includes('mounts: [{ slot: "Heavy", weapons: ["Howitzer"] }]')) errs.push("a replaced object list must be written through one canonical serialiser");
  if (errs.length) {
    console.error("apply-compcon selftest FAILED:\n - " + errs.join("\n - "));
    process.exit(1);
  }
  console.log("apply-compcon selftest ok");
}

/* Session-ledger stats. Logged with --log, never derived from an export: COMPCON's
   combat_history and state.stats are hard-coded zeros with no increment site. */
const STATS = ["dealt", "taken", "structure", "repairs", "hacks", "kills", "heat", "overcharge", "core", "moves"];
const flag = (args, name) => { const i = args.indexOf(name); return i < 0 ? "" : args[i + 1] || ""; };
const ledgerRow = (op, date, pilot, stats) => `    { op: "${op}", date: "${date}", pilot: "${pilot}", ${Object.entries(stats).map(([k, v]) => `${k}: ${v}`).join(", ")} },`;

/* Parse one --log spec: "<pilot> dealt=14 taken=9". Pure, so --selftest can assert it. */
function parseLog(spec, know) {
  const parts = String(spec).trim().split(/\s+/);
  const pilot = parts.shift();
  if (!pilot) return { error: "empty entry" };
  if (!know.pilots.has(pilot)) return { error: `unknown pilot "${pilot}"` };
  const stats = {};
  for (const p of parts) {
    const m = /^([a-z]+)=(\d+(?:\.\d+)?)$/.exec(p);
    if (!m) return { error: `expected stat=number, got "${p}"` };
    if (!STATS.includes(m[1])) return { error: `unknown stat "${m[1]}" (${STATS.join(", ")})` };
    const v = Number(m[2]);
    if (!Number.isFinite(v) || v < 0) return { error: `${m[1]} must be a non-negative number` };
    stats[m[1]] = (stats[m[1]] || 0) + v;
  }
  if (!Object.keys(stats).length) return { error: "no stats given" };
  return { pilot, stats };
}


/* A whole session block from the campaign page (#27): a header line "session op=<id> date=<date>",
   then one "<pilot> stat=n ..." line per pilot. Pure and total: every error is collected and any
   error means the caller writes nothing, unlike --log which skips a bad line and logs the rest. */
function parseBlock(text, known) {
  const errors = [], rows = [];
  const ops = (known.ops || []).map(String), pilots = known.pilots || [], stats = known.stats || [], ledger = known.ledger || [];
  const lines = String(text).split("\n").map(l => l.trim()).filter(Boolean);
  if (!lines.length) return { rows, errors: ["the block is empty"] };
  const head = /^session(?:\s+(.*))?$/.exec(lines[0]);
  if (!head) return { rows, errors: [`the first line must be a session header (session op=<id> date=YYYY-MM-DD), got "${lines[0]}"`] };
  const opts = {};
  for (const part of (head[1] || "").split(/\s+/).filter(Boolean)) {
    const m = /^([\w.-]+)=(\S+)$/.exec(part);
    if (!m) { errors.push(`header: cannot read "${part}" (expected key=value)`); continue; }
    if (m[1] !== "op" && m[1] !== "date") { errors.push(`header: unknown key "${m[1]}"`); continue; }
    opts[m[1]] = m[2];
  }
  if (!opts.op) errors.push("header: op is required");
  else if (ops.length && !ops.includes(opts.op)) errors.push(`header: unknown op "${opts.op}" (${ops.join(", ")})`);
  if (!opts.date) errors.push("header: date is required");
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(opts.date)) errors.push(`header: date must be YYYY-MM-DD, got "${opts.date}"`);
  for (const line of lines.slice(1)) {
    const parts = line.split(/\s+/);
    const pilot = parts.shift();
    if (!pilots.includes(pilot)) { errors.push(`line "${line}": unknown pilot "${pilot}"`); continue; }
    if (rows.some(r => r.pilot === pilot)) { errors.push(`line "${line}": ${pilot} appears twice in this block`); continue; }
    if (ledger.some(e => String(e.op) === opts.op && e.date === opts.date && e.pilot === pilot)) {
      errors.push(`line "${line}": OP ${opts.op} already has a ${opts.date} row for ${pilot}; edit that row instead of double-logging it`);
      continue;
    }
    const row = { op: opts.op, date: opts.date, pilot, stats: {} };
    const before = errors.length;
    for (const p of parts) {
      const m = /^([a-z]+)=(\d+(?:\.\d+)?)$/.exec(p);
      if (!m) { errors.push(`line "${line}": expected stat=number, got "${p}"`); continue; }
      if (!stats.includes(m[1])) { errors.push(`line "${line}": unknown stat "${m[1]}"`); continue; }
      row.stats[m[1]] = (row.stats[m[1]] || 0) + Number(m[2]);
    }
    if (!Object.keys(row.stats).length && errors.length === before) { errors.push(`line "${line}": no stats given`); continue; }
    rows.push(row);
  }
  if (!rows.length && !errors.length) errors.push("the block has no pilot lines");
  return { rows: errors.length ? [] : rows, errors };
}

/* --log-block path: parse the whole block first, and refuse all of it if any line is bad. */
function runLogBlock(text, args, write) {
  const C = loadCampaign();
  /* The block carries op and date, so accepting them as flags too would silently pick one. */
  for (const f of ["--op", "--date"]) if (args.includes(f)) {
    console.error(`${f} cannot be combined with --log-block: the block's header carries the op and the date`);
    process.exit(2);
  }
  const known = { ops: C.ops.map(o => String(o.id)), pilots: C.pilots.map(p => p.id), stats: STATS, ledger: C.ledger || [] };
  const { rows, errors } = parseBlock(text, known);
  if (errors.length) {
    console.error("block refused, nothing written:\n - " + errors.join("\n - "));
    process.exit(2);
  }
  const specs = rows.map(r => [r.pilot, ...Object.entries(r.stats).map(([k, v]) => `${k}=${v}`)].join(" "));
  return runLogs(specs, args, write, { op: rows[0].op, date: rows[0].date });
}

/* Append one row before the closing bracket of the ledger array, scanned rather than
   pattern-matched so it works whether the array is empty or already populated. */
function appendLedgerRow(text, row) {
  const at = text.indexOf("ledger: [");
  if (at < 0) return null;
  let depth = 0;
  for (let i = text.indexOf("[", at); i < text.length; i++) {
    if (text[i] === "[") depth++;
    else if (text[i] === "]" && --depth === 0) {
      const before = text.slice(0, i).replace(/[ \t]+$/, "");
      return before + (/\n$/.test(before) ? "" : "\n") + row + "\n  " + text.slice(i);
    }
  }
  return null;
}

/* Write campaign.js, then check it. Shared by the export and --log paths. */
function finish(text, args) {
  fs.writeFileSync(CAMP, text);
  console.log("campaign.js written");
  const check = flags => spawnSync(process.execPath, [path.join(ROOT, "check-all.cjs"), ...flags], { encoding: "utf8" });
  if (args.includes("--snapshot")) {
    const up = check(["--update-snapshot"]);
    console.log(up.status === 0 ? "snapshot refreshed; check-all ok" : "snapshot refreshed but check-all still failing");
    if (up.status !== 0) console.log((up.stdout || "").split("\n").filter(l => l.includes("problem") || l.includes("!!")).slice(0, 8).join("\n"));
    console.log("review: git diff tools/roster-snapshot.json");
    process.exit(up.status === 0 ? 0 : 1);
  }
  const res = check([]);
  if (res.status === 0) {
    console.log("check-all ok");
    process.exit(0);
  }
  const lines = (res.stdout || "").split("\n").filter(Boolean);
  const drift = lines.filter(l => l.includes("!= snapshot"));
  console.log("check-all failed:");
  console.log((drift.length ? drift : lines.slice(-6)).slice(0, 10).join("\n"));
  if (drift.length) console.log("\nsnapshot drift is expected for the fields just written. Review the values above, then either re-run with --snapshot or run:\n  node check-all.cjs --update-snapshot\n  git diff tools/roster-snapshot.json");
  process.exit(1);
}

/* --log path: append session rows to the ledger in campaign.js. */
function runLogs(logs, args, write, meta = {}) {
  const C = loadCampaign();
  if (!Array.isArray(C.ledger)) {
    console.error("campaign.js: no ledger array found (add `ledger: []` under window.CAMPAIGN)");
    process.exit(2);
  }
  const know = { pilots: new Set(C.pilots.map(p => p.id)) };
  const op = meta.op || flag(args, "--op") || C.ops[0].id;
  const date = meta.date || flag(args, "--date") || new Date().toISOString().slice(0, 10);
  if (!C.ops.some(o => o.id === op)) {
    console.error(`unknown op "${op}" (${C.ops.map(o => o.id).join(", ")})`);
    process.exit(2);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    console.error(`--date must be YYYY-MM-DD, got "${date}"`);
    process.exit(2);
  }
  let text = fs.readFileSync(CAMP, "utf8");
  let added = 0;
  for (const spec of logs) {
    const parsed = parseLog(spec, know);
    if (parsed.error) {
      console.error(`--log "${spec}": ${parsed.error}`);
      process.exitCode = 2;
      continue;
    }
    if (C.ledger.some(e => e.op === op && e.date === date && e.pilot === parsed.pilot)) {
      console.error(`--log "${spec}": OP ${op} already has a ${date} row for ${parsed.pilot}; edit that row instead of double-logging it`);
      process.exitCode = 2;
      continue;
    }
    const next = appendLedgerRow(text, ledgerRow(op, date, parsed.pilot, parsed.stats));
    if (!next) {
      console.error("campaign.js: no ledger array found");
      process.exit(2);
    }
    text = next;
    added++;
    C.ledger.push({ op, date, pilot: parsed.pilot, ...parsed.stats });
    console.log(`${parsed.pilot.padEnd(10)} ${Object.entries(parsed.stats).map(([k, v]) => `${k}=${v}`).join(" ")}`);
  }
  console.log(`\n${added} row(s) for OP ${op} · ${date}`);
  if (!added) return console.log("ledger unchanged");
  /* A refused line means the run is not clean: write nothing rather than part of the file. */
  if (process.exitCode) return console.log("\nnothing written: fix the refused line(s) above, then re-run");
  if (!write) return console.log("dry run; re-run with --write to append");
  finish(text, args);
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes("--selftest")) return selftest();
  const write = args.includes("--write");
  const logs = args.flatMap((a, i) => (a === "--log" ? [args[i + 1]] : [])).filter(Boolean);
  if (logs.length) return runLogs(logs, args, write);
  const blockPath = flag(args, "--log-block");
  if (blockPath) {
    const text = blockPath === "-" ? fs.readFileSync(0, "utf8") : fs.readFileSync(blockPath, "utf8");
    return runLogBlock(text, args, write);
  }
  const input = args.find(a => !a.startsWith("--"));
  if (!input) {
    console.error("usage: node tools/apply-compcon.cjs <export.json|dir> [--write] [--snapshot] | --log \"<pilot> stat=n ...\" [--op <id>] [--date YYYY-MM-DD] [--write] | --selftest");
    process.exit(2);
  }
  const files = fs.statSync(input).isDirectory() ? fs.readdirSync(input).filter(f => f.endsWith(".json")).map(f => path.join(input, f)) : [input];
  if (!files.length) {
    console.error(`no .json exports found in ${input}`);
    process.exit(2);
  }
  const C = loadCampaign();
  let text = fs.readFileSync(CAMP, "utf8");
  let changed = 0, unmapped = 0;
  for (const file of files) {
    let data;
    try {
      data = JSON.parse(fs.readFileSync(file, "utf8"));
    } catch (e) {
      console.error(`${path.basename(file)}: not valid JSON (${e.message})`);
      unmapped++;
      continue;
    }
    const pilots = pilotsFrom(data);
    if (!pilots.length) {
      console.error(`${path.basename(file)}: no pilot records found`);
      unmapped++;
      continue;
    }
    for (const pilot of pilots) {
      const mine = C.pilots.find(p => (norm(pilot.callsign) && norm(p.name).includes(norm(pilot.callsign))) || (norm(pilot.name) && norm(p.name) === norm(pilot.name)));
      for (const cm of pilot.mechs || []) {
        const site = C.mechs.find(m => norm(m.name) === norm(cm.name)) || (mine ? C.mechs.find(m => m.pilot === mine.id) : null);
        if (!site) {
          console.error(`${pilot.callsign || pilot.name || "?"}: no site mech matches "${cm.name}"`);
          unmapped++;
          continue;
        }
        const { set, rejected, unknown } = mapMechState(cm);
        if (rejected.length) console.error(`${site.name}: refused condition label(s) ${JSON.stringify(rejected)}`);
        if (unknown.length) console.error(`${site.name}: condition label(s) outside the book list, kept as written: ${JSON.stringify(unknown)}`);
        const res = applyToText(text, site.id, set);
        if (!res) {
          console.error(`${site.name}: not found in campaign.js (id ${site.id})`);
          unmapped++;
          continue;
        }
        text = res.text;
        changed += res.notes.length ? 1 : 0;
        console.log(`${res.notes.length ? "UPDATE" : "same  "} ${site.name.padEnd(12)} ${res.notes.join(", ") || "no tracked change"}`);
      }
    }
  }
  console.log(`\n${files.length} export(s): ${changed} mech(s) changed, ${unmapped} unmapped`);
  if (!changed) return console.log("campaign.js unchanged");
  if (!write) return console.log("dry run; re-run with --write to apply");
  finish(text, args);
}
if (require.main === module) main();
/* check-all requires this file for the block round trip (#27), so the entry point must not run on load. */
module.exports = { parseBlock, parseLog, parseLoadoutBlock, applyToText, lit };
