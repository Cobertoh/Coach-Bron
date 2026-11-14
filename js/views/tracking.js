import { h, toast, fmtDate, fmtDur, fmtPct, pct, weekStart, uid, confirmSheet, sheet, ICONS } from '../util.js';
import { sessions, templates, active, tests } from '../store.js';
import { lineChart, barChart, stackedChart } from '../charts.js';
import { back, empty, chipSelect, ctx } from '../ui.js';
import { onLeave } from '../ctx.js';

export const CATS = [
  { id: 'three', label: 'Three-point' }, { id: 'midrange', label: 'Midrange' }, { id: 'ft', label: 'Free throws' },
  { id: 'catch', label: 'Catch-and-shoot' }, { id: 'pullup', label: 'Pull-up jumpers' },
];
export const catLabel = id => CATS.find(c => c.id === id)?.label || id.replace(/^c:/, '');
const MODE_LABEL = { make: 'Make goal', attempt: 'Attempt goal', streak: 'Consecutive makes' };
export function describe(t) {
  const c = catLabel(t.category).toLowerCase();
  return t.mode === 'make' ? `Make ${t.target} ${c} shots` : t.mode === 'attempt' ? `Take ${t.target} ${c} shots` : `Make ${t.target} ${c} shots in a row`;
}
const maxStreak = shots => { let b = 0, c = 0; for (const s of shots) { c = s.r ? c + 1 : 0; b = Math.max(b, c); } return b; };

function applyFilter(list, f) {
  const now = Date.now();
  return list.filter(s => (f.range === 'week' ? now - s.ended < 7 * 864e5 : f.range === 'month' ? now - s.ended < 30 * 864e5 : true) && (!f.cat || s.category === f.cat) && (!f.workout || (s.templateId || s.name) === f.workout));
}

// ───────── Tracking home ─────────
export async function home(initialTab) {
  const [all, tpls, act, tst] = await Promise.all([sessions.list(), templates.list(), active.get(), tests.list()]);
  let tab = initialTab || 'progress';
  const f = { range: 'all', cat: null, workout: null };
  const el = h('div', { class: 'page' }, h('h1', { style: { margin: '8px 0 4px' } }, 'Tracking'), h('div', { class: 'muted small' }, 'Only measurable results: shooting percentage, speed, jumping. Real data from you, never fake numbers.'));
  if (act) el.append(h('a', { class: 'card link', style: { marginTop: '12px', borderLeft: '3px solid var(--lime)' }, href: '#/track/live' }, h('h3', {}, 'Resume your session'), h('div', { class: 'small muted' }, `${describe(act)} · ${act.makes}/${act.attempts} so far`)));
  const seg = h('div', { class: 'seg' }); const body = h('div', {});
  const drawSeg = () => seg.replaceChildren(...[['progress', 'Progress'], ['workouts', 'Workouts'], ['history', 'History'], ['tests', 'Tests']].map(([k, t]) => h('button', { class: tab === k ? 'on' : '', onclick: () => { tab = k; drawSeg(); drawBody(); } }, t)));
  const drawBody = () => body.replaceChildren(tab === 'progress' ? progressView() : tab === 'workouts' ? workoutsView() : tab === 'history' ? historyView() : testsView());

  function filters(withCat) {
    const counts = {}; all.forEach(s => { counts[s.category] = (counts[s.category] || 0) + 1; });
    if (withCat && !f.cat && Object.keys(counts).length) f.cat = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    const wk = {}; all.filter(s => !f.cat || s.category === f.cat).forEach(s => { wk[s.templateId || s.name] = s.name; });
    const sel = (opts, val, set) => h('select', { onchange: e => { set(e.target.value || null); drawBody(); }, style: { marginBottom: '8px' } }, ...opts.map(([v, t]) => h('option', { value: v, selected: v === (val ?? '') }, t)));
    return h('div', {},
      h('div', { class: 'seg' }, ...[['week', 'Week'], ['month', 'Month'], ['all', 'All time']].map(([k, t]) => h('button', { class: f.range === k ? 'on' : '', onclick: () => { f.range = k; drawBody(); } }, t))),
      sel([...(withCat ? [] : [['', 'All shot types']]), ...Object.keys(counts).map(c => [c, catLabel(c)])], f.cat, v => { f.cat = v; f.workout = null; }),
      sel([['', 'All workouts'], ...Object.entries(wk)], f.workout, v => { f.workout = v; }));
  }

  function progressView() {
    if (!all.length) return empty('No sessions yet', 'Record a shooting workout and your improvement shows up here as real charts.', { action: { label: 'Start a workout', href: '#/tracking/new' } });
    const box = h('div', {});
    box.append(filters(true));
    const fs = applyFilter(all, f).sort((a, b) => a.ended - b.ended);
    const label = catLabel(f.cat);
    if (!fs.length) { box.append(empty('Nothing in this filter', 'Try All time or another workout.')); return box; }
    const M = fs.reduce((a, s) => a + s.makes, 0), A = fs.reduce((a, s) => a + s.attempts, 0);
    box.append(h('div', { class: 'stats', style: { marginBottom: '10px' } },
      h('div', { class: 'stat' }, h('b', { class: 'lime' }, fmtPct(M, A)), h('span', {}, 'Shooting %')),
      h('div', { class: 'stat' }, h('b', {}, `${M}/${A}`), h('span', {}, 'Makes / attempts')),
      h('div', { class: 'stat' }, h('b', {}, fs.length), h('span', {}, 'Sessions'))));
    if (fs.length >= 2) {
      const a = fs[0], b = fs[fs.length - 1], d = Math.round((pct(b.makes, b.attempts) - pct(a.makes, a.attempts)) * 10) / 10;
      box.append(h('div', { class: 'callout' }, `${label}: first session ${a.makes}/${a.attempts} (${fmtPct(a.makes, a.attempts)}), latest ${b.makes}/${b.attempts} (${fmtPct(b.makes, b.attempts)}). `, h('b', { class: d >= 0 ? 'lime' : 'warn' }, `${d >= 0 ? '+' : ''}${d} points.`)));
    }
    box.append(lineChart({ title: `${label} shooting % by session`, right: 'Same shot type only', points: fs.map(s => ({ label: fmtDate(s.ended), y: pct(s.makes, s.attempts) })), note: 'Each point is one session of the selected shot type, so the comparison is fair.' }));
    const wk = {}; fs.forEach(s => { const k = weekStart(s.ended); (wk[k] ||= { m: 0, a: 0 }); wk[k].m += s.makes; wk[k].a += s.attempts; });
    box.append(barChart({ title: `${label}: week by week`, unit: '%', yMax: 100, bars: Object.entries(wk).sort((x, y) => x[0] - y[0]).slice(-8).map(([k, v]) => ({ label: fmtDate(+k), value: pct(v.m, v.a) })) }));
    const byCat = {}; applyFilter(all, { ...f, cat: null, workout: null }).forEach(s => { (byCat[s.category] ||= { makes: 0, misses: 0 }); byCat[s.category].makes += s.makes; byCat[s.category].misses += s.misses; });
    box.append(stackedChart({ title: 'Makes and misses by shot type', rows: Object.entries(byCat).map(([k, v]) => ({ label: catLabel(k).split('-')[0].slice(0, 9), ...v })), note: 'Shown by type. Different shot types are never merged into one percentage.' }));
    // Personal records
    const q = fs.filter(s => s.attempts >= 10);
    const best = q.length ? q.reduce((x, y) => pct(y.makes, y.attempts) > pct(x.makes, x.attempts) ? y : x) : null;
    const mostMakes = fs.reduce((x, y) => y.makes > x.makes ? y : x);
    const streak = Math.max(...fs.map(s => maxStreak(s.shots || [])));
    const fast = fs.filter(s => s.mode === 'make' && s.durationSec).sort((x, y) => (x.durationSec / x.target) - (y.durationSec / y.target))[0];
    box.append(h('h2', { style: { margin: '18px 0 8px' } }, 'Personal records'), h('div', { class: 'card' },
      prRow('Best session %', best ? `${fmtPct(best.makes, best.attempts)} (${best.makes}/${best.attempts})` : 'Needs a session with 10+ attempts'),
      prRow('Most makes in a session', `${mostMakes.makes}`), prRow('Longest make streak', `${streak}`),
      fast ? prRow('Fastest make-goal', `${fast.target} makes in ${fmtDur(fast.durationSec)}`) : null));
    return box;
  }
  const prRow = (a, b) => h('div', { class: 'row sb', style: { padding: '7px 0', borderBottom: '1px solid var(--line)' } }, h('span', { class: 'muted' }, a), h('b', { class: 'lime' }, b));

  function workoutsView() {
    const box = h('div', {});
    box.append(h('a', { class: 'btn pri block', href: '#/tracking/new' }, '+ New shooting workout'));
    box.append(h('h2', { style: { margin: '18px 0 8px' } }, 'Quick start'));
    const presets = [{ n: 'Make 10 pull-up jumpers', category: 'pullup', mode: 'make', target: 10 }, { n: '25 three-pointers', category: 'three', mode: 'attempt', target: 25 }, { n: '50 free throws', category: 'ft', mode: 'attempt', target: 50 }, { n: '5 straight midrange', category: 'midrange', mode: 'streak', target: 5 }];
    box.append(...presets.map(p => h('a', { class: 'card link', href: `#/tracking/new/${p.category}?mode=${p.mode}&target=${p.target}` }, h('h3', {}, p.n), h('div', { class: 'small muted' }, `${MODE_LABEL[p.mode]} · tap to customize and start`))));
    box.append(h('h2', { style: { margin: '18px 0 8px' } }, 'My saved workouts'));
    if (!tpls.length) box.append(h('div', { class: 'small muted' }, 'Workouts you create are saved here to repeat.'));
    for (const t of tpls) {
      const n = all.filter(s => s.templateId === t.id).length;
      box.append(h('div', { class: 'card' }, h('h3', {}, t.name), h('div', { class: 'small muted' }, `${describe(t)} · ${t.tracker === 'buddy' ? 'Buddy' : 'Solo'} · ${n} session${n === 1 ? '' : 's'}`),
        h('div', { class: 'row', style: { marginTop: '10px' } }, h('button', { class: 'btn pri', style: { flex: 1 }, onclick: () => startSession(t) }, 'Start'),
          h('button', { class: 'btn danger', onclick: async () => { if (await confirmSheet('Delete workout?', 'Past sessions stay in your history.', 'Delete', true)) { await templates.remove(t.id); ctx.rerender(); } } }, 'Delete'))));
    }
    return box;
  }

  function historyView() {
    const box = h('div', {}); if (!all.length) return empty('No history yet', 'Finished sessions are saved here automatically.', { action: { label: 'Start a workout', href: '#/tracking/new' } });
    box.append(filters(false));
    const fs = applyFilter(all, f);
    if (!fs.length) box.append(empty('Nothing here', 'No sessions match these filters.'));
    box.append(...fs.map(s => h('a', { class: 'card link', href: `#/track/session/${s.id}` }, h('div', { class: 'row sb' }, h('h3', {}, s.name), h('b', { class: 'lime' }, fmtPct(s.makes, s.attempts))), h('div', { class: 'small muted' }, `${catLabel(s.category)} · ${fmtDate(s.ended, { month: 'short', day: 'numeric', year: 'numeric' })} · ${s.makes}/${s.attempts}${s.tracker === 'buddy' ? ' · buddy' : ''}`))));
    return box;
  }

  function testsView() { return testsPanel(tst, () => ctx.rerender()); }
  drawSeg(); drawBody(); el.append(seg, body); return el;
}

// ───────── Performance tests (sprint, vertical, agility) ─────────
const TEST_KINDS = [
  { id: 'sprint', title: 'Sprint', unit: 's', lower: true, ph: '20 yard sprint', timed: true },
  { id: 'agility', title: 'Agility', unit: 's', lower: true, ph: '5-10-5 shuttle', timed: true },
  { id: 'vertical', title: 'Vertical jump', unit: 'in', lower: false, ph: 'Standing vertical', timed: false },
];
function testsPanel(list, refresh) {
  const box = h('div', {});
  box.append(h('div', { class: 'callout' }, 'Log a test the same way every time (same distance, surface, footwear) and Coach Bron compares only matching tests.'));
  let kind = TEST_KINDS[0], name = '', value = '';
  const kindBox = chipSelect({ options: TEST_KINDS.map(k => ({ id: k.id, label: k.title })), value: kind.id, onChange: id => { kind = TEST_KINDS.find(k => k.id === id); nameIn.placeholder = kind.ph; sw.style.display = kind.timed ? 'block' : 'none'; valIn.placeholder = kind.unit === 's' ? 'Time in seconds' : 'Height in inches'; } });
  const nameIn = h('input', { type: 'text', placeholder: kind.ph, maxlength: 40, oninput: e => { name = e.target.value; } });
  const valIn = h('input', { type: 'number', step: '0.01', inputmode: 'decimal', placeholder: 'Time in seconds', oninput: e => { value = e.target.value; } });
  // stopwatch
  let t0 = 0, raf = 0; const disp = h('div', { style: { fontSize: '40px', fontWeight: 800, textAlign: 'center', margin: '6px 0' } }, '0.00');
  const swBtn = h('button', { class: 'btn block', onclick: () => {
    if (!t0) { t0 = performance.now(); const tick = () => { disp.textContent = ((performance.now() - t0) / 1000).toFixed(2); raf = requestAnimationFrame(tick); }; tick(); swBtn.textContent = 'Stop'; swBtn.className = 'btn block pri'; }
    else { cancelAnimationFrame(raf); const sec = ((performance.now() - t0) / 1000); valIn.value = value = sec.toFixed(2); disp.textContent = sec.toFixed(2); t0 = 0; swBtn.textContent = 'Start stopwatch'; swBtn.className = 'btn block'; }
  } }, 'Start stopwatch');
  onLeave(() => cancelAnimationFrame(raf));
  const sw = h('div', { class: 'card', style: { display: 'block' } }, h('div', { class: 'small muted' }, 'Stopwatch (tap Start when you go, Stop when you finish)'), disp, swBtn);
  box.append(h('div', { class: 'card' }, h('h3', { style: { marginBottom: '10px' } }, 'Log a test'), kindBox, h('div', { class: 'field', style: { marginTop: '12px' } }, h('label', {}, 'Test name (keep it the same each time)'), nameIn), sw, h('div', { class: 'field' }, h('label', {}, 'Result'), valIn),
    h('button', { class: 'btn pri block', onclick: async () => {
      const v = parseFloat(value); if (!(v > 0)) return toast('Enter a result first');
      await tests.add({ kind: kind.id, label: (name || kind.ph).trim(), value: v, unit: kind.unit, lower: kind.lower, at: Date.now() }); toast('Saved'); refresh();
    } }, 'Save result')));
  const groups = {}; list.forEach(t => { (groups[t.label.toLowerCase()] ||= []).push(t); });
  if (!list.length) box.append(empty('No tests logged', 'Your results and personal records will appear here.'));
  for (const g of Object.values(groups)) {
    const ord = [...g].sort((a, b) => a.at - b.at), l = ord[0].lower, best = ord.reduce((x, y) => (l ? y.value < x.value : y.value > x.value) ? y : x);
    box.append(h('h2', { style: { margin: '18px 0 6px' } }, ord[0].label), h('div', { class: 'small muted', style: { marginBottom: '6px' } }, `${l ? 'Lower is better' : 'Higher is better'} · personal record ${best.value}${best.unit}`),
      lineChart({ title: `${ord[0].label} (${ord[0].unit})`, unit: ord[0].unit, yMax: Math.ceil(Math.max(...ord.map(x => x.value)) * 1.2), points: ord.map(x => ({ label: fmtDate(x.at), y: x.value })), emptyMsg: '' }),
      h('div', { class: 'tiny muted' }, ord.length === 1 ? 'Log it again to see a trend.' : ''));
  }
  return box;
}

// ───────── New workout form ─────────
export async function newWorkout(presetCat, query) {
  const q = new URLSearchParams(query || '');
  const st = { name: '', category: presetCat && CATS.some(c => c.id === presetCat) ? presetCat : 'three', mode: q.get('mode') || 'attempt', target: +q.get('target') || 25, tracker: 'solo', shooter: '', save: true, custom: '' };
  const el = h('div', { class: 'page' }, back('Tracking', '#/tracking'), h('h1', {}, 'New shooting workout'));
  const f = (l, n) => h('div', { class: 'field' }, h('label', {}, l), n);
  const preview = h('div', { class: 'callout' });
  const upd = () => { preview.textContent = describe({ ...st, category: st.custom ? 'c:' + st.custom.trim() : st.category }); };
  const tgt = h('input', { type: 'number', inputmode: 'numeric', min: 1, max: 500, value: st.target, oninput: e => { st.target = Math.max(1, Math.min(500, +e.target.value || 1)); upd(); } });
  el.append(
    f('Shot type', chipSelect({ options: CATS.map(c => ({ id: c.id, label: c.label })), value: st.category, onChange: v => { st.category = v; st.custom = ''; customIn.value = ''; upd(); } })),
    f('Or a custom shot type', h('input', { type: 'text', maxlength: 24, placeholder: 'For example: Floaters', id: 'customIn', oninput: e => { st.custom = e.target.value; upd(); } })),
    f('Goal type', chipSelect({ options: [{ id: 'make', label: 'Make goal' }, { id: 'attempt', label: 'Attempt goal' }, { id: 'streak', label: 'Consecutive makes' }], value: st.mode, onChange: v => { st.mode = v; upd(); } })),
    h('p', { class: 'tiny muted', style: { marginTop: '-6px' } }, 'Make goal: continues until you reach the number of makes. Attempt goal: ends after the number of attempts. Consecutive: ends when you hit the streak.'),
    f('Target', tgt), preview,
    f('Who records?', chipSelect({ options: [{ id: 'solo', label: 'Solo (I record)' }, { id: 'buddy', label: 'Buddy (a friend records)' }], value: st.tracker, onChange: v => { st.tracker = v; } })),
    f('Workout name (optional)', h('input', { type: 'text', maxlength: 40, placeholder: 'Auto-named if empty', oninput: e => { st.name = e.target.value; } })),
    h('label', { class: 'row', style: { margin: '6px 0 16px' } }, h('input', { type: 'checkbox', checked: true, onchange: e => { st.save = e.target.checked; }, style: { width: '22px', height: '22px' } }), h('span', {}, 'Save as a reusable workout')),
    h('button', { class: 'btn pri block', onclick: async () => {
      const cat = st.custom.trim() ? 'c:' + st.custom.trim() : st.category;
      const t = { category: cat, mode: st.mode, target: st.target, tracker: st.tracker };
      t.name = st.name.trim() || describe(t);
      if (st.save) await templates.save(t);
      await startSession(t, st.shooter);
    } }, 'Start workout'));
  const customIn = el.querySelector('#customIn'); upd(); return el;
}

async function startSession(t, shooter) {
  const a = await active.get();
  if (a && !(await confirmSheet('Replace current session?', 'You have an unfinished session. Starting a new one discards it.', 'Discard and start', true))) { ctx.go('#/track/live'); return; }
  await active.set({ id: uid(), templateId: t.id, name: t.name, category: t.category, mode: t.mode, target: t.target, tracker: t.tracker || 'solo', shooter: shooter || '', makes: 0, misses: 0, attempts: 0, shots: [], started: Date.now(), pausedMs: 0, pausedAt: null, paused: false });
  ctx.go('#/track/live');
}

// ───────── Live tracking screen ─────────
export async function live() {
  let s = await active.get();
  if (!s) { return h('div', { class: 'page' }, empty('No session in progress', 'Start a workout from Tracking.', { action: { label: 'Open Tracking', href: '#/tracking' } })); }
  ctx.hideNav = true;
  const buddy = s.tracker === 'buddy';
  let lastTap = 0, saveChain = Promise.resolve(), timer, finished = false, wake = null;
  const persist = () => { saveChain = saveChain.then(() => finished ? null : active.set(s)); return saveChain; };
  try { navigator.wakeLock?.request('screen').then(w => { wake = w; }).catch(() => {}); } catch {}
  onLeave(() => { clearInterval(timer); wake?.release?.(); ctx.hideNav = false; });

  const el = h('div', { class: 'live' });
  const goalTxt = h('div', { class: 'goal' }), timeTxt = h('div', { class: 'goal' }), bar = h('i', {}); const prog = h('div', { class: 'bar prog' }, bar);
  const nums = Object.fromEntries(['makes', 'misses', 'attempts', 'pct'].map(k => [k, h('b', {}, '0')]));
  const dots = h('div', { class: 'shotdots', 'aria-hidden': 'true' });
  const makeB = h('button', { class: 'make', 'aria-label': 'Make' }, 'MAKE'), missB = h('button', { class: 'miss', 'aria-label': 'Miss' }, 'MISS');
  const undoB = h('button', { class: 'btn' }, 'UNDO'), pauseB = h('button', { class: 'btn' }, 'PAUSE'), finB = h('button', { class: 'btn pri' }, 'FINISH');
  const overlay = h('div', { style: { position: 'absolute', inset: 0, background: 'rgba(9,11,16,.88)', display: 'none', alignItems: 'center', justifyContent: 'center', borderRadius: '24px', fontSize: '28px', fontWeight: 800, zIndex: 2 } }, 'Paused');
  const streakNow = () => { let c = 0; for (let i = s.shots.length - 1; i >= 0 && s.shots[i].r; i--) c++; return c; };
  const progressVal = () => s.mode === 'make' ? s.makes : s.mode === 'attempt' ? s.attempts : Math.max(streakNow(), 0);
  const elapsed = () => Math.floor((Date.now() - s.started - s.pausedMs - (s.paused ? Date.now() - s.pausedAt : 0)) / 1000);

  function draw() {
    goalTxt.textContent = describe(s) + (buddy ? ` · Buddy${s.shooter ? ': ' + s.shooter : ''}` : '');
    const p = Math.min(1, progressVal() / s.target); bar.style.width = (p * 100) + '%';
    nums.makes.textContent = s.makes; nums.misses.textContent = s.misses; nums.attempts.textContent = s.attempts; nums.pct.textContent = s.attempts ? pct(s.makes, s.attempts) + '%' : '—';
    dots.replaceChildren(...s.shots.slice(-60).map(x => h('i', { class: x.r ? 'm' : 'x' })));
    timeTxt.textContent = fmtDur(elapsed());
    overlay.style.display = s.paused ? 'flex' : 'none';
    pauseB.textContent = s.paused ? 'RESUME' : 'PAUSE'; undoB.disabled = !s.shots.length;
    makeB.disabled = missB.disabled = s.paused;
  }
  function reached() { return progressVal() >= s.target; }
  function tap(r, btn) {
    const now = Date.now(); if (s.paused || now - lastTap < 350) return; lastTap = now;   // guards against double taps
    s.shots.push({ r, t: now }); s[r ? 'makes' : 'misses']++; s.attempts++;
    btn.classList.remove('flash'); void btn.offsetWidth; btn.classList.add('flash'); navigator.vibrate?.(r ? 20 : 8);
    persist(); draw();
    if (reached()) goalSheet();
  }
  function undo() {
    const now = Date.now(); if (now - lastTap < 250 || !s.shots.length) return; lastTap = now;
    const x = s.shots.pop(); s[x.r ? 'makes' : 'misses']--; s.attempts--; persist(); draw();
  }
  function goalSheet() {
    const sh = sheet([h('h2', {}, 'Goal reached'), h('p', { class: 'muted', style: { margin: '8px 0 16px' } }, `${s.makes}/${s.attempts} (${fmtPct(s.makes, s.attempts)}) in ${fmtDur(elapsed())}.`),
      h('button', { class: 'btn pri block', onclick: () => { sh.close(); finish(); } }, 'Finish and save'),
      h('button', { class: 'btn block', style: { marginTop: '8px' }, onclick: () => { sh.close(); undo(); } }, 'Undo last shot (mis-tap)')]);
  }
  async function finish() {
    finished = true; await saveChain.catch(() => {});
    if (!s.attempts) { await active.clear(); toast('Nothing recorded, session discarded'); return ctx.go('#/tracking'); }
    const ended = Date.now();
    const rec = { id: s.id, templateId: s.templateId, name: s.name, category: s.category, categoryLabel: catLabel(s.category), mode: s.mode, target: s.target, makes: s.makes, misses: s.misses, attempts: s.attempts, shots: s.shots.map(x => ({ r: x.r })), started: s.started, ended, durationSec: elapsed(), tracker: s.tracker, shooter: s.shooter };
    await sessions.save(rec); await active.clear(); ctx.go(`#/track/session/${rec.id}?done=1`);
  }
  makeB.onclick = () => tap(1, makeB); missB.onclick = () => tap(0, missB); undoB.onclick = undo;
  pauseB.onclick = async () => {
    if (buddy && !s.paused && !(await confirmSheet('Pause?', 'Timing stops until you resume.', 'Pause'))) return;
    if (s.paused) { s.pausedMs += Date.now() - s.pausedAt; s.paused = false; s.pausedAt = null; } else { s.paused = true; s.pausedAt = Date.now(); }
    persist(); draw();
  };
  finB.onclick = async () => { if (await confirmSheet('Finish session?', `${s.makes}/${s.attempts} will be saved to your history.`, 'Finish')) finish(); };
  const exit = h('button', { class: 'icon-btn', 'aria-label': 'Leave (session is saved)', onclick: () => ctx.go('#/tracking'), style: { display: buddy ? 'none' : '' } }, h('span', { html: ICONS.back }));
  el.append(h('div', { class: 'top' }, exit, h('div', { style: { textAlign: 'center', flex: 1 } }, goalTxt, timeTxt), h('div', { style: { width: '44px' } })), prog,
    h('div', { class: 'big', style: { marginTop: '10px' } }, ...[['makes', 'Makes'], ['misses', 'Misses'], ['attempts', 'Attempts'], ['pct', 'Shooting %']].map(([k, t]) => h('div', {}, nums[k], h('span', {}, t)))), dots,
    h('div', { class: 'mm', style: { position: 'relative' } }, makeB, missB, overlay), h('div', { class: 'bot' }, undoB, pauseB, finB),
    h('div', { class: 'tiny muted', style: { textAlign: 'center', marginTop: '8px' } }, 'Progress saves automatically after every tap.'));
  timer = setInterval(() => { if (!s.paused) timeTxt.textContent = fmtDur(elapsed()); }, 1000);
  draw();
  const wrap = h('div', {}, el); return wrap;
}

// ───────── Session detail ─────────
export async function sessionPage(id, query) {
  const s = await sessions.get(id);
  if (!s) return h('div', { class: 'page' }, empty('Session not found', '', { action: { label: 'Tracking', href: '#/tracking' } }));
  const all = (await sessions.list()).filter(x => x.category === s.category && x.templateId === s.templateId && x.id !== s.id && x.ended < s.ended);
  const prev = all[0];
  const el = h('div', { class: 'page' }, back('Tracking', '#/tracking'), new URLSearchParams(query || '').get('done') ? h('div', { class: 'callout' }, 'Saved to your history.') : null,
    h('h1', {}, s.name), h('div', { class: 'small muted', style: { margin: '4px 0 12px' } }, `${catLabel(s.category)} · ${describe(s)} · ${fmtDate(s.ended, { month: 'long', day: 'numeric', year: 'numeric' })}`),
    h('div', { class: 'stats' }, h('div', { class: 'stat' }, h('b', { class: 'lime' }, fmtPct(s.makes, s.attempts)), h('span', {}, 'Shooting %')), h('div', { class: 'stat' }, h('b', {}, `${s.makes}/${s.attempts}`), h('span', {}, 'Makes / attempts')), h('div', { class: 'stat' }, h('b', {}, fmtDur(s.durationSec || 0)), h('span', {}, 'Time'))));
  if (prev) { const d = Math.round((pct(s.makes, s.attempts) - pct(prev.makes, prev.attempts)) * 10) / 10; el.append(h('div', { class: 'callout' }, `Compared with your previous matching session (${prev.makes}/${prev.attempts}, ${fmtPct(prev.makes, prev.attempts)}): `, h('b', { class: d >= 0 ? 'lime' : 'warn' }, `${d >= 0 ? '+' : ''}${d} points.`))); }
  if (s.shots?.length) {
    let m = 0; const pts = s.shots.map((x, i) => { m += x.r; return { label: String(i + 1), y: pct(m, i + 1) }; });
    el.append(h('div', { class: 'shotdots', style: { margin: '14px 0 4px' } }, ...s.shots.map(x => h('i', { class: x.r ? 'm' : 'x' }))), h('div', { class: 'tiny muted' }, `Longest streak: ${maxStreak(s.shots)}`),
      lineChart({ title: 'Running shooting % through the session', points: pts.length > 1 ? pts : [], note: 'Early shots swing a lot. Judge the end of the session.', emptyMsg: 'Needs 2+ shots.' }));
  }
  el.append(h('button', { class: 'btn pri block', onclick: () => startSession({ id: s.templateId, name: s.name, category: s.category, mode: s.mode, target: s.target, tracker: s.tracker }, s.shooter) }, 'Repeat this workout'),
    h('button', { class: 'btn danger block', style: { marginTop: '8px' }, onclick: async () => { if (await confirmSheet('Delete session?', 'This removes it from your stats.', 'Delete', true)) { await sessions.remove(s.id); ctx.go('#/tracking'); } } }, 'Delete session'));
  return el;
}
