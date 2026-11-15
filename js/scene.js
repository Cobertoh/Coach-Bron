// Court scenes: small top-down half-court animations for reads, spacing, systems and terms.
// Same data shape as plays (players, ball, steps with mv/pass/shot) plus zones, labels and sight lines.
import { s } from './util.js';
import { courtBase, token, arrowEl, computeFrames, BASKET } from './court.js';

const ZONES = {
  paint: () => s('rect', { x: 19, y: 0, width: 12, height: 19 }),
  'corner-l': () => s('rect', { x: 0, y: 0, width: 3, height: 14 }), 'corner-r': () => s('rect', { x: 47, y: 0, width: 3, height: 14 }),
  'wing-l': () => s('circle', { cx: 7, cy: 23, r: 4.5 }), 'wing-r': () => s('circle', { cx: 43, cy: 23, r: 4.5 }), top: () => s('circle', { cx: 25, cy: 32, r: 4.5 }),
  'elbow-l': () => s('circle', { cx: 19, cy: 19, r: 3 }), 'elbow-r': () => s('circle', { cx: 31, cy: 19, r: 3 }),
  'block-l': () => s('circle', { cx: 19, cy: 7, r: 2.6 }), 'block-r': () => s('circle', { cx: 31, cy: 7, r: 2.6 }),
  'half-l': () => s('rect', { x: 0, y: 0, width: 25, height: 38 }), 'half-r': () => s('rect', { x: 25, y: 0, width: 25, height: 38 }),
  three: () => s('path', { d: 'M0 0H3V14.2A23.75 23.75 0 0 0 47 14.2V0H50V38H0Z' }),
  mid: () => s('path', { d: 'M3 0V14.2A23.75 23.75 0 0 0 47 14.2V0ZM19 0V19H31V0Z', 'fill-rule': 'evenodd' }),
  rim: () => s('circle', { cx: 25, cy: 5.25, r: 4 }),
  lane: () => s('path', { d: 'M22 34L28 34L27.5 6L22.5 6Z' }),
  ft: () => s('rect', { x: 19, y: 18.4, width: 12, height: 1.2 }),
  gap: () => s('circle', { cx: 17, cy: 24, r: 3.2 }),
  'gap-r': () => s('circle', { cx: 33, cy: 24, r: 3.2 }),
  oob: () => s('path', { d: 'M-2.5 -3H52.5V40H-2.5ZM0 0V40H50V0Z', 'fill-rule': 'evenodd' }),
};

export function sceneDur(spec) { return 1000 + (spec.steps?.length || 0) * (spec.stepMs || 1750) + 1700; }

export function createSceneView(spec, { mode } = {}) {
  const play = { players: spec.players || {}, ball: spec.ball || null, steps: spec.steps || [], start: '' };
  const frames = computeFrames({ ...play, players: Object.fromEntries(Object.entries(play.players).map(([k, v]) => [k, v])) }, play.steps);
  const svg = s('svg', { viewBox: spec.vb || '-2.5 -3 55 47', class: 'scenesvg', role: 'img' });
  svg.append(courtBase());
  const zoneL = s('g', { class: 'zones' }), arrowL = s('g', {}), eyeL = s('g', {}), tokL = s('g', {}), lblL = s('g', {});
  svg.append(zoneL, arrowL, eyeL, tokL, lblL);
  const toks = {};
  for (const id of Object.keys(play.players)) { toks[id] = token(id, id[0] === 'X'); tokL.append(toks[id]); }
  const ball = s('g', { class: 'ball' }, s('circle', { r: 1.15, fill: '#F2994A', stroke: '#7a3f10', 'stroke-width': 0.2 }));
  if (play.ball) svg.append(ball);
  const ringL = s('g', {}); svg.insertBefore(ringL, tokL);
  const arrowsByStep = frames.map(f => f.arrows.map(a => { const g = arrowEl(a); g.style.opacity = 0; arrowL.append(g); return g; }));
  const bad = mode === 'bad';
  if (mode === 'bad' || mode === 'good') svg.append(s('circle', { cx: 48.5, cy: 1.2, r: 2.6, fill: bad ? '#FF6B6B' : '#A6F36A' }), s('path', { d: bad ? 'M47.3 0L49.7 2.4M49.7 0L47.3 2.4' : 'M47.2 1.3L48.2 2.4L50 0.2', stroke: '#090B10', 'stroke-width': 0.7, fill: 'none', 'stroke-linecap': 'round' }));

  const zoneEl = (z, cls) => { const f = ZONES[z]; if (!f) return null; const e = f(); e.setAttribute('class', 'zone ' + (cls || '')); return e; };
  const lbl = (t, x, y, col) => s('text', { x, y, 'text-anchor': 'middle', 'font-size': 2.3, 'font-weight': 800, fill: col || '#F4F5F7', stroke: '#090B10', 'stroke-width': 0.7, 'paint-order': 'stroke', style: 'font-family:system-ui,sans-serif' }, t);
  (spec.zones || []).forEach(z => { const e = zoneEl(z, 'static' + (bad ? ' bad' : '')); e && zoneL.append(e); });
  const stepMs = spec.stepMs || 1750, dur = sceneDur(spec);
  let cur = -1;
  function show(i) {
    const f = frames[i], st = i > 0 ? play.steps[i - 1] : (spec.first || {});
    for (const [id, t] of Object.entries(toks)) { const p = f.pos[id]; t.style.transform = `translate(${p[0]}px,${p[1]}px)`; }
    if (play.ball) { const bp = f.holder === 'rim' ? [BASKET[0], BASKET[1] + 0.3] : f.pos[f.holder] ? [f.pos[f.holder][0] + 1.8, f.pos[f.holder][1] + 1.6] : [25, 30]; ball.style.transform = `translate(${bp[0]}px,${bp[1]}px)`; }
    arrowsByStep.forEach((gs, si) => gs.forEach(g => { g.style.opacity = si === i ? 1 : si < i ? 0.2 : 0; }));
    [...zoneL.querySelectorAll('.zone.dyn')].forEach(e => e.remove());
    (st.zone || []).forEach(z => { const e = zoneEl(z, 'dyn pulse' + (st.bad || bad ? ' bad' : '')); e && zoneL.append(e); });
    eyeL.replaceChildren(...(st.eye || []).map(([a, b]) => { const A = f.pos[a], B = f.pos[b] || b; return s('line', { x1: A[0], y1: A[1], x2: B[0], y2: B[1], stroke: '#F4F5F7', 'stroke-width': 0.3, 'stroke-dasharray': '0.8 0.6', opacity: 0.85 }); }));
    ringL.replaceChildren(...(st.hl || []).map(id => { const p = f.pos[id]; return s('circle', { cx: p[0], cy: p[1], r: 3.1, fill: 'none', stroke: st.bad || bad ? '#FF6B6B' : '#A6F36A', 'stroke-width': 0.45, class: 'cue-pulse' }); }));
    lblL.replaceChildren(...[...(spec.labels || []), ...(st.label || [])].map(l => lbl(l.t, l.at[0], l.at[1], l.col || (l.bad || st.bad ? '#FF6B6B' : null))));
  }
  function render(time) {
    const t = time % dur;
    let i = t < 1000 ? 0 : Math.min(frames.length - 1, 1 + Math.floor((t - 1000) / stepMs));
    if (i !== cur) {
      if (i === 0 && cur > 0) { Object.values(toks).forEach(tk => tk.classList.add('fast')); ball.style.transitionDuration = '0s'; show(0); requestAnimationFrame(() => requestAnimationFrame(() => { Object.values(toks).forEach(tk => tk.classList.remove('fast')); ball.style.transitionDuration = ''; })); }
      else show(i);
      cur = i;
    }
  }
  Object.values(toks).forEach(tk => tk.classList.add('fast'));
  render(0);
  requestAnimationFrame(() => requestAnimationFrame(() => Object.values(toks).forEach(tk => tk.classList.remove('fast'))));
  return { svg, render, dur };
}
