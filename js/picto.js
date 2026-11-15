// Pictograms and infographic visuals for ideas that are not a body movement or a court position.
import { s } from './util.js';

// 48x48 line icons
const IC = {
  brain: 'M18 10a6 6 0 0 0-6 6 6 6 0 0 0-4 10 6 6 0 0 0 4 9 6 6 0 0 0 10 3V12a5 5 0 0 0-4-2ZM30 10a6 6 0 0 1 6 6 6 6 0 0 1 4 10 6 6 0 0 1-4 9 6 6 0 0 1-10 3V12a5 5 0 0 1 4-2Z',
  eye: 'M4 24s7-12 20-12 20 12 20 12-7 12-20 12S4 24 4 24ZM24 30a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z',
  clock: 'M24 42a18 18 0 1 0 0-36 18 18 0 0 0 0 36ZM24 14v10l7 5',
  board: 'M6 10h36v24H6ZM16 40h16M24 34v6M12 18h8M12 24h8M28 18h8M28 24h8',
  chat: 'M8 10h32v22H22l-8 7v-7H8Z',
  repeat: 'M10 20a14 14 0 0 1 24-8l4 4M38 8v8h-8M38 28a14 14 0 0 1-24 8l-4-4M10 40v-8h8',
  moon: 'M34 32A16 16 0 0 1 18 8a16 16 0 1 0 16 24Z',
  water: 'M24 6s-12 14-12 22a12 12 0 0 0 24 0c0-8-12-22-12-22Z',
  food: 'M14 6v14a4 4 0 0 0 8 0V6M18 6v36M32 6c-4 4-5 12-1 16v20',
  heart: 'M24 40S6 29 6 17a9 9 0 0 1 18-3 9 9 0 0 1 18 3c0 12-18 23-18 23Z',
  alert: 'M24 6 44 40H4ZM24 18v10M24 33v1',
  stop: 'M16 22V10a3 3 0 0 1 6 0v10M22 20V8a3 3 0 0 1 6 0v12M28 20V10a3 3 0 0 1 6 0v14c0 10-6 16-13 16-6 0-9-4-12-9l-3-6a3 3 0 0 1 5-3l3 4V14a3 3 0 0 1 6 0',
  calendar: 'M8 12h32v28H8ZM8 20h32M16 6v8M32 6v8M15 27h4M23 27h4M31 27h4M15 33h4M23 33h4',
  target: 'M24 42a18 18 0 1 0 0-36 18 18 0 0 0 0 36ZM24 34a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM24 26a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
  users: 'M17 22a7 7 0 1 0 0-14 7 7 0 0 0 0 14ZM4 40c0-8 6-13 13-13s13 5 13 13M33 22a6 6 0 1 0-2-12M36 27c5 1 8 6 8 13',
  whistle: 'M8 22h22a10 10 0 1 1-10 10H8ZM30 22l6-8M14 22v-6h8',
  book: 'M24 12c-5-4-12-4-18-2v28c6-2 13-2 18 2 5-4 12-4 18-2V10c-6-2-13-2-18 2ZM24 12v28',
  trend: 'M6 36l12-12 8 8 16-16M32 16h10v10',
  camera: 'M6 14h8l4-5h12l4 5h8v24H6ZM24 33a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z',
  fire: 'M24 42c-8 0-13-6-13-13 0-9 9-12 9-21 6 4 9 9 8 15 2-1 4-4 4-7 4 4 6 8 6 13 0 7-6 13-14 13Z',
  battery: 'M6 16h32v16H6ZM38 21h4v6M11 21h8v6h-8Z',
  ball: 'M24 42a18 18 0 1 0 0-36 18 18 0 0 0 0 36ZM6 24h36M24 6v36M11 11c8 8 8 18 0 26M37 11c-8 8-8 18 0 26',
  shield: 'M24 6l16 6v12c0 9-7 15-16 18-9-3-16-9-16-18V12Z',
  bolt: 'M27 4 10 27h12l-3 17 19-25H26Z',
  check: 'M10 25l9 9 19-20',
  pain: 'M24 42a18 18 0 1 0 0-36 18 18 0 0 0 0 36ZM16 20l4 2M32 20l-4 2M16 32c4-4 12-4 16 0',
  doctor: 'M20 6h8v10h10v8H28v10h-8V24H10v-8h10Z',
  map: 'M6 10l12-4 12 4 12-4v32l-12 4-12-4-12 4ZM18 6v32M30 10v32',
  thumbs: 'M14 22v18H6V22ZM14 22l8-14c3 0 5 2 4 6l-2 7h12c3 0 5 3 4 6l-3 10c-1 2-3 3-5 3H14',
  scale: 'M24 6v36M14 42h20M8 14h32M8 14l-5 12h10ZM40 14l-5 12h10Z',
  chart: 'M8 40h32M12 34V24M20 34V16M28 34V20M36 34V10',
  run: 'M30 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM18 44l6-12 6 4v8M14 22l8-8 8 4 6 6M22 14l-4 12 10 6',
};
export const PICTO_KEYS = Object.keys(IC);

function frameSvg(vb = '0 0 160 100') { return s('svg', { viewBox: vb, class: 'pictosvg', role: 'img' }); }

export function createPicto(spec, { mode } = {}) {
  // spec: { icon, title, sub, anim, icons:[...] }
  const svg = frameSvg();
  const col = mode === 'bad' ? '#FF6B6B' : '#A6F36A';
  svg.append(s('rect', { x: 0, y: 0, width: 160, height: 100, rx: 6, fill: '#10141C' }));
  const icons = spec.icons || [spec.icon];
  const n = icons.length, gap = n > 3 ? 12 : 16, size = Math.min(40, (148 - (n - 1) * gap) / n), total = n * size + (n - 1) * gap, x0 = 80 - total / 2;
  icons.forEach((ic, i) => {
    const g = s('g', { transform: `translate(${x0 + i * (size + gap)} ${spec.title ? 14 : 28}) scale(${size / 48})` });
    const inner = s('g', { class: 'picto-' + (spec.anim || 'pulse'), style: `animation-delay:${i * 0.25}s;transform-origin:24px 24px` });
    inner.append(s('path', { d: IC[ic] || IC.ball, fill: 'none', stroke: col, 'stroke-width': 3, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    g.append(inner); svg.append(g);
    if (i < n - 1 && spec.flow) svg.append(s('path', { d: `M${x0 + i * (size + gap) + size + 3} ${(spec.title ? 14 : 28) + size / 2} h${gap - 6}`, stroke: '#A5AAB5', 'stroke-width': 1.6, 'marker-end': '', fill: 'none' }), s('path', { d: `M${x0 + i * (size + gap) + size + gap - 4} ${(spec.title ? 14 : 28) + size / 2 - 3} l3 3 -3 3`, stroke: '#A5AAB5', 'stroke-width': 1.6, fill: 'none' }));
  });
  if (spec.title) svg.append(s('text', { x: 80, y: 74, 'text-anchor': 'middle', 'font-size': 10, 'font-weight': 800, fill: '#F4F5F7', style: 'font-family:system-ui,sans-serif' }, spec.title));
  if (spec.sub) svg.append(s('text', { x: 80, y: 88, 'text-anchor': 'middle', 'font-size': 7, fill: '#A5AAB5', style: 'font-family:system-ui,sans-serif' }, spec.sub));
  if (mode === 'bad' || mode === 'good') svg.append(s('circle', { cx: 148, cy: 12, r: 7, fill: col }), s('path', { d: mode === 'bad' ? 'M145 9l6 6M151 9l-6 6' : 'M144.5 12l2.5 2.6 4.6-5', stroke: '#090B10', 'stroke-width': 2, fill: 'none', 'stroke-linecap': 'round' }));
  return { svg, render() {} };
}

// ---------- special infographics (time-driven) ----------
const T = (x, y, t, o = {}) => s('text', { x, y, 'text-anchor': o.a || 'middle', 'font-size': o.size || 7, 'font-weight': o.w || 800, fill: o.fill || '#F4F5F7', style: 'font-family:system-ui,sans-serif' }, t);

const SPECIAL = {
  timeline(spec) {
    const ev = spec.events; const svg = frameSvg();
    svg.append(s('rect', { x: 0, y: 0, width: 160, height: 100, rx: 6, fill: '#10141C' }), s('line', { x1: 12, y1: 52, x2: 148, y2: 52, stroke: '#3a4558', 'stroke-width': 2 }));
    const prog = s('line', { x1: 12, y1: 52, x2: 12, y2: 52, stroke: '#A6F36A', 'stroke-width': 2.4 }); svg.append(prog);
    const dots = ev.map((e, i) => { const x = 18 + i * (124 / Math.max(1, ev.length - 1)); const g = s('g', {}, s('circle', { cx: x, cy: 52, r: 4.5, fill: '#151922', stroke: '#A6F36A', 'stroke-width': 1.6 }), T(x, i % 2 ? 72 : 40, e.y, { size: 8 }), T(i === 0 ? x - 6 : i === ev.length - 1 ? x + 6 : x, i % 2 ? 82 : 30, e.t, { size: 5.4, w: 600, fill: '#A5AAB5', a: i === 0 ? 'start' : i === ev.length - 1 ? 'end' : 'middle' })); svg.append(g); return { g, x }; });
    const hl = spec.hl ?? null, per = 900, dur = ev.length * per + 1500;
    return { svg, dur, render(time) { const t = time % dur, k = Math.min(ev.length - 1, Math.floor(t / per)); prog.setAttribute('x2', dots[k].x); dots.forEach((d, i) => { d.g.style.opacity = i <= k ? 1 : 0.3; d.g.querySelector('circle').setAttribute('fill', (hl == null ? i === k : i === hl) ? '#A6F36A' : '#151922'); }); } };
  },
  shotclock(spec) {
    const svg = frameSvg(); const n = spec.from || 24;
    svg.append(s('rect', { x: 0, y: 0, width: 160, height: 100, rx: 6, fill: '#10141C' }), s('rect', { x: 50, y: 18, width: 60, height: 44, rx: 6, fill: '#0b0e14', stroke: '#3a4558' }));
    const num = T(80, 52, String(n), { size: 28, fill: '#F2994A' }); svg.append(num, T(80, 80, spec.title || 'Shot clock (length varies by league)', { size: 6.4, w: 600, fill: '#A5AAB5' }));
    const dur = (n + 2) * 140;
    return { svg, dur, render(time) { const v = Math.max(0, n - Math.floor((time % dur) / 140)); num.textContent = String(v); num.setAttribute('fill', v <= 5 ? '#FF6B6B' : '#F2994A'); } };
  },
  scoreclock(spec) {
    const svg = frameSvg();
    svg.append(s('rect', { x: 0, y: 0, width: 160, height: 100, rx: 6, fill: '#10141C' }), s('rect', { x: 24, y: 14, width: 112, height: 52, rx: 6, fill: '#0b0e14', stroke: '#3a4558' }),
      T(52, 30, 'HOME', { size: 6, fill: '#A5AAB5' }), T(108, 30, 'AWAY', { size: 6, fill: '#A5AAB5' }), T(52, 50, spec.home || '78', { size: 16 }), T(108, 50, spec.away || '76', { size: 16 }));
    const clk = T(80, 50, '', { size: 9, fill: '#F2994A' }); svg.append(clk, T(80, 60, spec.extra || 'TIMEOUTS 1 · FOULS 4', { size: 4.6, fill: '#A5AAB5' }), T(80, 84, spec.title || 'Check score, clock, timeouts', { size: 7 }));
    const dur = 6000;
    return { svg, dur, render(time) { const sLeft = Math.max(0, 40 - Math.floor((time % dur) / 150)); clk.textContent = `0:${String(sLeft).padStart(2, '0')}`; } };
  },
  speedbar(spec) {
    const svg = frameSvg();
    svg.append(s('rect', { x: 0, y: 0, width: 160, height: 100, rx: 6, fill: '#10141C' }), s('rect', { x: 20, y: 42, width: 120, height: 10, rx: 5, fill: '#252C38' }));
    const bar = s('rect', { x: 20, y: 42, width: 20, height: 10, rx: 5, fill: '#A6F36A' }), lab = T(80, 32, '', { size: 9 });
    svg.append(bar, lab, T(20, 66, 'slow', { a: 'start', size: 6, fill: '#A5AAB5' }), T(140, 66, 'fast', { a: 'end', size: 6, fill: '#A5AAB5' }), T(80, 86, spec.title || 'Change speeds', { size: 7 }));
    const seq = spec.seq || [[0.2, 'Slow: read'], [0.95, 'Burst!'], [0.3, 'Slow again']], per = 1300, dur = seq.length * per;
    return { svg, dur, render(time) { const k = Math.floor((time % dur) / per); bar.setAttribute('width', 120 * seq[k][0]); lab.textContent = seq[k][1]; } };
  },
};

export function createSpecial(spec, opts) { const f = SPECIAL[spec.kind]; return f ? f(spec, opts) : createPicto({ icon: 'ball', title: spec.title }, opts); }
