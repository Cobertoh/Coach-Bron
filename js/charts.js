// Small animated SVG charts. They only ever draw real data passed in; with no data they show an empty state.
import { h, s } from './util.js';

const W = 320, H = 170, PL = 30, PR = 12, PT = 12, PB = 26;

function frame(title, right, svg, note) {
  return h('div', { class: 'chart' },
    h('div', { class: 'ttl' }, h('h3', {}, title), right ? h('span', { class: 'small muted' }, right) : null),
    svg, note ? h('div', { class: 'tiny muted', style: { margin: '4px 4px 2px' } }, note) : null);
}
function emptyChart(title, msg) { return h('div', { class: 'chart' }, h('h3', { style: { margin: '0 4px 6px' } }, title), h('div', { class: 'empty', style: { padding: '14px' } }, msg)); }

// points: [{label, y}]  y in 0..yMax
export function lineChart({ title, points, yMax = 100, unit = '%', right, note, emptyMsg = 'Not enough data yet.' }) {
  if (!points.length) return emptyChart(title, emptyMsg);
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `${title}: ${points.map(p => `${p.label} ${p.y}${unit}`).join(', ')}` });
  const iw = W - PL - PR, ih = H - PT - PB;
  const X = i => PL + (points.length === 1 ? iw / 2 : (i / (points.length - 1)) * iw);
  const Y = v => PT + ih - (v / yMax) * ih;
  for (let i = 0; i <= 4; i++) {
    const v = (yMax / 4) * i;
    svg.append(s('line', { x1: PL, x2: W - PR, y1: Y(v), y2: Y(v), class: 'ax' }), s('text', { x: PL - 6, y: Y(v) + 3, 'text-anchor': 'end', class: 'axt' }, Math.round(v) + (i === 4 ? unit : '')));
  }
  const step = Math.ceil(points.length / 6);
  points.forEach((p, i) => { if (i % step === 0 || i === points.length - 1) svg.append(s('text', { x: X(i), y: H - 8, 'text-anchor': i === points.length - 1 && points.length > 1 ? 'end' : 'middle', class: 'axt' }, p.label)); });
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)} ${Y(p.y).toFixed(1)}`).join(' ');
  if (points.length > 1) {
    let len = 0; for (let i = 1; i < points.length; i++) len += Math.hypot(X(i) - X(i - 1), Y(points[i].y) - Y(points[i - 1].y));
    svg.append(s('path', { d: `${d} L${X(points.length - 1)} ${Y(0)} L${X(0)} ${Y(0)} Z`, class: 'area-path' }),
      s('path', { d, class: 'line-path', style: `--len:${Math.ceil(len) + 4}` }));
  }
  points.forEach((p, i) => svg.append(s('circle', { cx: X(i), cy: Y(p.y), r: 3.6, class: 'dotp' }, s('title', {}, `${p.label}: ${p.y}${unit}`))));
  const last = points[points.length - 1];
  svg.append(s('text', { x: Math.min(X(points.length - 1), W - PR - 4), y: Y(last.y) - 9, 'text-anchor': 'end', fill: '#A6F36A', 'font-size': 11, 'font-weight': 700 }, `${last.y}${unit}`));
  return frame(title, right, svg, note);
}

// bars: [{label, value, sub}]
export function barChart({ title, bars, yMax, unit = '', right, note, emptyMsg = 'Not enough data yet.' }) {
  if (!bars.length) return emptyChart(title, emptyMsg);
  yMax = yMax || Math.max(1, ...bars.map(b => b.value)) * 1.15;
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': `${title}: ${bars.map(b => `${b.label} ${b.value}${unit}`).join(', ')}` });
  const iw = W - PL - PR, ih = H - PT - PB, bw = Math.min(34, iw / bars.length * 0.6);
  for (let i = 0; i <= 4; i++) {
    const v = (yMax / 4) * i, y = PT + ih - (v / yMax) * ih;
    svg.append(s('line', { x1: PL, x2: W - PR, y1: y, y2: y, class: 'ax' }), s('text', { x: PL - 6, y: y + 3, 'text-anchor': 'end', class: 'axt' }, Math.round(v)));
  }
  bars.forEach((b, i) => {
    const cx = PL + (i + 0.5) * (iw / bars.length), bh = (b.value / yMax) * ih;
    svg.append(s('rect', { x: cx - bw / 2, y: PT + ih - bh, width: bw, height: Math.max(0, bh), rx: 4, fill: '#A6F36A', class: 'barg', style: `animation-delay:${i * 60}ms` }, s('title', {}, `${b.label}: ${b.value}${unit}`)),
      s('text', { x: cx, y: PT + ih - bh - 4, 'text-anchor': 'middle', class: 'axt', fill: '#F4F5F7' }, b.value + unit),
      s('text', { x: cx, y: H - 8, 'text-anchor': 'middle', class: 'axt' }, b.label));
  });
  return frame(title, right, svg, note);
}

// stacked makes/misses per category: [{label, makes, misses}]
export function stackedChart({ title, rows, right, note, emptyMsg = 'Not enough data yet.' }) {
  if (!rows.length) return emptyChart(title, emptyMsg);
  const max = Math.max(1, ...rows.map(r => r.makes + r.misses)) * 1.1;
  const svg = s('svg', { viewBox: `0 0 ${W} ${H}`, role: 'img', 'aria-label': title });
  const iw = W - PL - PR, ih = H - PT - PB, bw = Math.min(40, iw / rows.length * 0.6);
  for (let i = 0; i <= 4; i++) {
    const v = (max / 4) * i, y = PT + ih - (v / max) * ih;
    svg.append(s('line', { x1: PL, x2: W - PR, y1: y, y2: y, class: 'ax' }), s('text', { x: PL - 6, y: y + 3, 'text-anchor': 'end', class: 'axt' }, Math.round(v)));
  }
  rows.forEach((r, i) => {
    const cx = PL + (i + 0.5) * (iw / rows.length), mh = (r.makes / max) * ih, xh = (r.misses / max) * ih;
    svg.append(s('rect', { x: cx - bw / 2, y: PT + ih - mh, width: bw, height: mh, fill: '#A6F36A', class: 'barg', rx: 3 }),
      s('rect', { x: cx - bw / 2, y: PT + ih - mh - xh, width: bw, height: xh, fill: '#4a3238', class: 'barg', rx: 3, style: 'animation-delay:120ms' }),
      s('text', { x: cx, y: H - 8, 'text-anchor': 'middle', class: 'axt' }, r.label));
  });
  const leg = h('div', { class: 'row tiny muted', style: { margin: '2px 4px' } },
    h('span', {}, h('span', { style: { display: 'inline-block', width: '9px', height: '9px', background: '#A6F36A', borderRadius: '3px', marginRight: '5px' } }), 'Makes'),
    h('span', {}, h('span', { style: { display: 'inline-block', width: '9px', height: '9px', background: '#4a3238', borderRadius: '3px', margin: '0 5px 0 10px' } }), 'Misses'));
  const c = frame(title, right, svg, note); c.insertBefore(leg, c.children[2]); return c;
}

// Count-up number animation
export function countUp(el, to, { dec = 0, suffix = '', ms = 700 } = {}) {
  const t0 = performance.now();
  const f = t => { const k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); el.textContent = (to * e).toFixed(dec) + suffix; if (k < 1) requestAnimationFrame(f); };
  requestAnimationFrame(f);
}
