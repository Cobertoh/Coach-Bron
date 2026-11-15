// Half-court diagram + step animator. Frames are computed from the play's written steps (same data as the text).
import { h, s, icon } from './util.js';

export const BASKET = [25, 5.25];
const R = 1.85;

export function buildLines(play) {
  if (!play.reads?.length) return [{ label: 'Main', when: '', steps: play.steps, shared: 0 }];
  return play.reads.map(r => ({ label: r.label, when: r.when, steps: [...play.steps, ...r.steps], shared: play.steps.length }));
}

export function computeFrames(play, steps) {
  const clone = o => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, [...v]]));
  let pos = clone(play.players), holder = play.ball;
  const frames = [{ pos: clone(pos), holder, arrows: [], text: play.start }];
  for (const st of steps) {
    const prev = clone(pos), arrows = [];
    for (const [id, [x, y, type]] of Object.entries(st.mv || {})) {
      pos[id] = [x, y];
      arrows.push({ kind: type || 'run', from: prev[id], to: [x, y], def: id[0] === 'X' });
    }
    if (st.pass) { arrows.push({ kind: 'pass', from: pos[st.pass[0]], to: pos[st.pass[1]] }); holder = st.pass[1]; }
    if (st.shot) { arrows.push({ kind: 'shot', from: pos[st.shot], to: BASKET }); holder = 'rim'; }
    if (st.ball) holder = st.ball;
    frames.push({ pos: clone(pos), holder, arrows, text: st.t });
  }
  return frames;
}

const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const ptStr = pts => pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(2) + ' ' + p[1].toFixed(2)).join(' ');

function head(to, ang, cls) {
  const L = 1.5, W = 0.9;
  const p1 = [to[0] - L * Math.cos(ang) + W * Math.sin(ang), to[1] - L * Math.sin(ang) - W * Math.cos(ang)];
  const p2 = [to[0] - L * Math.cos(ang) - W * Math.sin(ang), to[1] - L * Math.sin(ang) + W * Math.cos(ang)];
  return s('path', { d: `M${to[0]} ${to[1]} L${p1[0]} ${p1[1]} L${p2[0]} ${p2[1]} Z`, class: cls, fill: 'currentColor', stroke: 'none' });
}

export function arrowEl(a) {
  const g = s('g', { class: 'arr', style: 'opacity:0' });
  const d = dist(a.from, a.to); if (d < 0.6 && a.kind !== 'shot') return g;
  const ang = Math.atan2(a.to[1] - a.from[1], a.to[0] - a.from[0]);
  const cut = a.kind === 'shot' ? 1.2 : (d > 5 ? R + 0.5 : 0.5);
  const start = [a.from[0] + Math.cos(ang) * (a.kind === 'pass' || a.kind === 'shot' ? R : 0), a.from[1] + Math.sin(ang) * (a.kind === 'pass' || a.kind === 'shot' ? R : 0)];
  const end = [a.to[0] - Math.cos(ang) * cut, a.to[1] - Math.sin(ang) * cut];
  const col = a.kind === 'pass' ? '#F4F5F7' : a.kind === 'screen' ? '#F4F5F7' : a.kind === 'shot' ? '#F2994A' : a.def ? '#7D8594' : '#A6F36A';
  g.setAttribute('style', `opacity:0;color:${col}`);
  const sw = 0.5;
  if (a.kind === 'dribble') {
    const n = Math.max(8, Math.round(dist(start, end) * 2)), pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n, off = Math.sin(t * Math.PI * Math.max(3, dist(start, end) / 2.2)) * 0.55;
      pts.push([start[0] + (end[0] - start[0]) * t - Math.sin(ang) * off, start[1] + (end[1] - start[1]) * t + Math.cos(ang) * off]);
    }
    g.append(s('path', { d: ptStr(pts), fill: 'none', stroke: col, 'stroke-width': sw, 'stroke-linecap': 'round' }), head(end, ang));
  } else if (a.kind === 'shot') {
    const mx = (start[0] + end[0]) / 2, my = (start[1] + end[1]) / 2 - Math.min(6, dist(start, end) * 0.25);
    g.append(s('path', { d: `M${start[0]} ${start[1]} Q${mx} ${my} ${end[0]} ${end[1]}`, fill: 'none', stroke: col, 'stroke-width': sw, 'stroke-dasharray': '1.2 .9', 'stroke-linecap': 'round' }), head(end, Math.atan2(end[1] - my, end[0] - mx)));
  } else if (a.kind === 'screen') {
    g.append(s('path', { d: `M${start[0]} ${start[1]} L${end[0]} ${end[1]}`, stroke: col, 'stroke-width': sw + 0.1, fill: 'none', 'stroke-linecap': 'round' }),
      s('path', { d: `M${end[0] - Math.sin(ang) * 1.6} ${end[1] + Math.cos(ang) * 1.6} L${end[0] + Math.sin(ang) * 1.6} ${end[1] - Math.cos(ang) * 1.6}`, stroke: col, 'stroke-width': 0.8, 'stroke-linecap': 'round' }));
  } else {
    const dash = (a.kind === 'pass') ? '1.3 1' : (a.kind === 'run' ? '0.9 0.8' : null);
    g.append(s('path', { d: `M${start[0]} ${start[1]} L${end[0]} ${end[1]}`, stroke: col, 'stroke-width': sw, fill: 'none', 'stroke-dasharray': dash, 'stroke-linecap': 'round' }), head(end, ang));
  }
  return g;
}

export function courtBase() {
  const g = s('g', {});
  const L = (d, extra = {}) => g.append(s('path', { d, class: 'court-line', ...extra }));
  g.append(s('rect', { x: 0, y: 0, width: 50, height: 47, class: 'court-floor' }));
  L('M0 0H50V47H0Z');
  L('M19 0V19H31V0');
  g.append(s('circle', { cx: 25, cy: 19, r: 6, class: 'court-line' }));
  L('M3 0V14.2A23.75 23.75 0 0 0 47 14.2V0');
  L('M21 5.25A4 4 0 0 0 29 5.25');
  L('M22 4H28');
  g.append(s('circle', { cx: 25, cy: 5.25, r: 0.75, fill: 'none', stroke: '#F2994A', 'stroke-width': 0.35 }));
  L('M19 47A6 6 0 0 1 31 47');
  L('M17 0v1M17 5v1M17 8v1M17 11v1M33 0v1M33 5v1M33 8v1M33 11v1', { opacity: .6 });
  return g;
}

export function token(id, def) {
  const n = id.slice(1);
  const g = s('g', { class: 'ptok', style: 'transform:translate(0,0)' });
  g.append(
    s('circle', { r: R, fill: def ? '#151922' : '#A6F36A', stroke: def ? '#A5AAB5' : '#A6F36A', 'stroke-width': def ? 0.4 : 0.2 }),
    s('text', { 'text-anchor': 'middle', y: 0.85, 'font-size': 2.3, 'font-weight': 800, fill: def ? '#F4F5F7' : '#0b0f08', style: 'font-family:system-ui,sans-serif' }, def ? 'X' + n : n),
  );
  return g;
}

export function createCourtPlayer(play, { compact = false } = {}) {
  const lines = buildLines(play);
  let li = 0, idx = 0, timer = null, framesCache = [];
  const wrap = h('div', {});
  const svg = s('svg', { viewBox: '-2.5 -3 55 42.5', role: 'img', 'aria-label': `Court diagram: ${play.name}` });
  svg.append(courtBase());
  const arrowLayer = s('g', {}), tokLayer = s('g', {});
  const toks = {};
  for (const id of Object.keys(play.players)) { toks[id] = token(id, id[0] === 'X'); tokLayer.append(toks[id]); }
  const ball = s('g', { class: 'ball', style: 'transform:translate(25px,5px)' }, s('circle', { r: 1.15, fill: '#F2994A', stroke: '#7a3f10', 'stroke-width': 0.2 }), s('path', { d: 'M-1.1 0H1.1M0 -1.1V1.1', stroke: '#7a3f10', 'stroke-width': 0.18 }));
  svg.append(arrowLayer, tokLayer, ball);

  const note = h('div', { class: 'stepnote', 'aria-live': 'polite' });
  const dots = h('div', { class: 'dots' });
  const playBtn = h('button', { class: 'icon-btn', 'aria-label': 'Play', onclick: () => (timer ? pause() : start()) });
  const mk = (ic, label, fn) => h('button', { class: 'icon-btn', 'aria-label': label, onclick: fn, html: ic });
  const full = h('ol', { class: 'steps', style: { display: 'none', marginTop: '10px' } });
  const fullBtn = h('button', { class: 'btn ghost block', style: { marginTop: '8px', minHeight: '42px' }, onclick: () => { const on = full.style.display === 'none'; full.style.display = on ? 'block' : 'none'; fullBtn.textContent = on ? 'Hide full play description' : 'View full play description'; } }, 'View full play description');
  const chips = h('div', { class: 'chips', style: { margin: '10px 0 2px' } });
  const readNote = h('div', { class: 'tiny muted', style: { marginBottom: '4px' } });

  function setPlayIcon() { playBtn.innerHTML = timer ? icon('pause').innerHTML : icon('play').innerHTML; playBtn.setAttribute('aria-label', timer ? 'Pause' : 'Play'); }
  function render() {
    const f = framesCache[idx];
    for (const [id, t] of Object.entries(toks)) { const p = f.pos[id]; t.style.transform = `translate(${p[0]}px,${p[1]}px)`; }
    const bp = f.holder === 'rim' ? [BASKET[0], BASKET[1] + 0.3] : [f.pos[f.holder][0] + 1.8, f.pos[f.holder][1] + 1.6];
    ball.style.transform = `translate(${bp[0]}px,${bp[1]}px)`;
    [...arrowLayer.children].forEach(g => { const st = +g.dataset.step; g.style.opacity = st === idx ? 1 : st < idx ? 0.22 : 0; });
    note.textContent = idx === 0 ? 'Start: ' + framesCache[0].text : `${idx}/${framesCache.length - 1}  ${f.text}`;
    [...dots.children].forEach((d, i) => d.classList.toggle('on', i === idx));
    [...full.children].forEach((li2, i) => { li2.style.color = i + 1 === idx ? 'var(--lime)' : ''; });
  }
  function load(newLi, goto = 0) {
    li = newLi; const line = lines[li];
    framesCache = computeFrames(play, line.steps);
    arrowLayer.replaceChildren(...framesCache.slice(1).flatMap(f => f.arrows.map(arrowEl)));
    // arrows: one group per arrow; map them to step index
    const groups = [...arrowLayer.children]; let gi = 0; const map = [];
    framesCache.slice(1).forEach((f, si) => f.arrows.forEach(() => { map[gi++] = si + 1; }));
    groups.forEach((g, i) => { g.dataset.step = map[i]; });
    dots.replaceChildren(...framesCache.map(() => h('i', {})));
    full.replaceChildren(...line.steps.map(st => h('li', {}, st.t)));
    readNote.textContent = line.when ? `Read: ${line.label}. Use it when ${line.when}.` : '';
    chips.querySelectorAll('.chip').forEach((c, i) => c.classList.toggle('on', i === li));
    idx = Math.min(goto, framesCache.length - 1); render(); setPlayIcon();
  }
  function stop() { clearInterval(timer); timer = null; setPlayIcon(); }
  function pause() { stop(); }
  function start() {
    if (idx >= framesCache.length - 1) { idx = 0; render(); }
    timer = setInterval(() => { if (idx >= framesCache.length - 1) return stop(); idx++; render(); if (idx >= framesCache.length - 1) stop(); }, 2700);
    setPlayIcon(); if (idx === 0) { idx = 1; render(); }
  }
  function replay() { stop(); idx = 0; render(); setTimeout(start, 350); }
  function step(d) { stop(); idx = Math.max(0, Math.min(framesCache.length - 1, idx + d)); render(); }

  if (lines.length > 1) {
    lines.forEach((l, i) => chips.append(h('button', { class: 'chip' + (i === 0 ? ' on' : ''), onclick: () => { stop(); load(i, l.shared); } }, l.label)));
  }
  wrap.append(h('div', { class: 'courtbox' }, svg),
    lines.length > 1 ? h('div', {}, h('h4', {}, 'Choose the defensive read'), chips, readNote) : null,
    note,
    h('div', { class: 'ctrls' }, mk(ICON_RESET, 'Back to beginning', () => { stop(); idx = 0; render(); }), mk(ICON_PREV, 'Previous step', () => step(-1)), playBtn, mk(ICON_NEXT, 'Next step', () => step(1)), dots, mk(ICON_REPLAY, 'Replay', replay)),
    compact ? null : fullBtn, compact ? null : full);
  load(0, 0);
  // Initial frame has no transition so players start in place.
  Object.values(toks).forEach(t => t.classList.add('fast')); ball.style.transitionDuration = '0s';
  requestAnimationFrame(() => requestAnimationFrame(() => { Object.values(toks).forEach(t => t.classList.remove('fast')); ball.style.transitionDuration = ''; }));
  return { el: wrap, destroy: stop };
}

const ICON_RESET = icon('reset').innerHTML, ICON_PREV = icon('prev').innerHTML, ICON_NEXT = icon('next').innerHTML, ICON_REPLAY = icon('replay').innerHTML;
