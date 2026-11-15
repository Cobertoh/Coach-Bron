// Visual factory + one shared animation loop. Only visuals on screen animate (battery friendly);
// tap any visual to pause/resume. Reduced-motion users get a still frame until they tap.
import { h, s } from './util.js';
import { createFigureView } from './figure.js';
import { createSceneView, sceneDur } from './scene.js';
import { createPicto, createSpecial } from './picto.js';
import { CLIPS } from './visuals/clips.js';
import { SCENES } from './visuals/scenes.js';
import { XS } from './visuals/map.js';

const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const items = new Set();
let raf = 0, last = 0;
function loop(now) {
  const dt = last ? Math.min(80, now - last) : 16; last = now;
  let any = false;
  for (const it of items) {
    if (!it.el.isConnected) { items.delete(it); it.io?.disconnect(); continue; }
    if (it.visible && !it.paused) { it.time += dt * (it.speed || 1); it.render(it.time); any = true; }
  }
  raf = items.size ? requestAnimationFrame(loop) : 0; if (!any && !items.size) last = 0;
}
function register(it) {
  items.add(it);
  if ('IntersectionObserver' in window) { it.io = new IntersectionObserver(es => { it.visible = es.some(e => e.isIntersecting); }, { rootMargin: '60px' }); it.io.observe(it.el); }
  else it.visible = true;
  if (!raf) { last = 0; raf = requestAnimationFrame(loop); }
}

// Build the raw visual for a ref string.
export function buildVisual(ref, opts = {}) {
  const [kind, rest] = [ref.slice(0, 1), ref.slice(2)];
  if (kind === 'c' && CLIPS[rest]) { const v = createFigureView(CLIPS[rest], opts); return { svg: v.svg, render: v.render, dur: v.C.dur, ar: 'fig' }; }
  if (kind === 's' && SCENES[rest]) { const v = createSceneView(SCENES[rest], opts); return { svg: v.svg, render: v.render, dur: sceneDur(SCENES[rest]), ar: 'scene' }; }
  if (kind === 'x' && XS[rest]) { const v = createSpecial(XS[rest], opts); return { svg: v.svg, render: v.render, dur: v.dur || 4000, ar: 'picto' }; }
  if (kind === 'p') {
    const [ic, title, sub] = rest.split('|');
    const flow = ic.includes('>');
    const v = createPicto({ icons: ic.split(/[>+]/), title, sub, flow }, opts);
    return { svg: v.svg, render: () => {}, dur: 2600, ar: 'picto', still: true };
  }
  const v = createPicto({ icon: 'ball', title: 'Visual coming soon' }, opts);
  return { svg: v.svg, render: () => {}, dur: 2000, ar: 'picto', still: true };
}

// A self-animating visual element.
export function visual(ref, { mode, label, cls = '' } = {}) {
  const v = buildVisual(ref, { mode });
  const el = h('div', { class: `vis ${v.ar} ${cls} ${mode || ''}`, role: 'img', 'aria-label': label || 'Animated illustration', tabindex: 0 });
  el.append(v.svg);
  const it = { el, render: v.render, time: 0, paused: reduced, visible: false };
  if (!v.still) {
    const badge = h('span', { class: 'vis-pp', 'aria-hidden': 'true' });
    const sync = () => { el.classList.toggle('paused', it.paused); badge.textContent = it.paused ? '▶' : ''; };
    const toggle = () => { it.paused = !it.paused; sync(); };
    el.addEventListener('click', toggle); el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
    el.append(badge); sync();
    if (reduced) v.render(v.dur * 0.55);
    register(it);
  }
  return el;
}

// Wrong vs right, side by side.
export function mistakeVisual(text, pair) {
  const [bad, good] = pair || [];
  return h('div', { class: 'mcard' },
    h('div', { class: 'mtext' }, h('span', { class: 'xmark' }, '✗'), text),
    h('div', { class: 'mpair' },
      h('div', {}, bad ? visual(bad, { mode: 'bad', label: 'Wrong: ' + text }) : null, h('div', { class: 'mlab bad' }, 'Wrong')),
      h('div', {}, good ? visual(good, { mode: 'good', label: 'Right way' }) : null, h('div', { class: 'mlab good' }, 'Right'))));
}

// "Watch it": plays every step's visual in order with captions, like a short video.
export function watchPlayer(refs, captions, { title = 'Watch it' } = {}) {
  let i = 0, playing = !reduced, t = 0, speed = 1;
  const stage = h('div', { class: 'wstage' });
  const cap = h('div', { class: 'wcap', 'aria-live': 'polite' });
  const bar = h('div', { class: 'wbar' }, h('i', {}));
  const segs = h('div', { class: 'wsegs' }, ...refs.map((_, k) => h('button', { class: 'wseg', 'aria-label': `Step ${k + 1}`, onclick: () => go(k) }, h('i', {}))));
  const ppBtn = h('button', { class: 'icon-btn', 'aria-label': 'Pause', onclick: () => { playing = !playing; syncBtn(); } });
  const spBtn = h('button', { class: 'chip', onclick: () => { speed = speed === 1 ? 0.5 : 1; spBtn.textContent = speed === 1 ? '1×' : '½×'; cur.speed = speed; } }, '1×');
  const prev = h('button', { class: 'icon-btn', 'aria-label': 'Previous step', onclick: () => go(Math.max(0, i - 1)), html: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M15 6l-6 6 6 6"/></svg>' });
  const next = h('button', { class: 'icon-btn', 'aria-label': 'Next step', onclick: () => go((i + 1) % refs.length), html: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>' });
  const el = h('div', { class: 'watch' }, h('div', { class: 'whead' }, h('span', { class: 'wdot' }), title), stage, bar, cap, h('div', { class: 'wctrl' }, prev, ppBtn, next, segs, spBtn));
  let cur = null, curDur = 3000;
  function syncBtn() { ppBtn.innerHTML = playing ? '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>' : '<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'; ppBtn.setAttribute('aria-label', playing ? 'Pause' : 'Play'); if (cur) cur.paused = !playing; }
  function go(k) {
    i = k; t = 0;
    const v = buildVisual(refs[i]);
    curDur = Math.max(2600, Math.min(9000, v.still ? 3000 : (v.dur || 3000) * 1.0));
    const box = h('div', { class: `vis ${v.ar}` }, v.svg);
    stage.replaceChildren(box);
    cap.replaceChildren(h('b', {}, `Step ${i + 1}/${refs.length}  `), captions[i] || '');
    [...segs.children].forEach((b, j) => b.classList.toggle('on', j === i));
    if (cur) { items.delete(cur); cur.io?.disconnect(); }
    cur = { el: box, render: tt => { v.render(tt); t = tt; if (tt >= curDur && playing) { go((i + 1) % refs.length); } bar.firstChild.style.width = Math.min(100, tt / curDur * 100) + '%'; }, time: 0, paused: !playing, visible: false, speed };
    if (v.still) cur.render = tt => { t = tt; if (tt >= curDur && playing) go((i + 1) % refs.length); bar.firstChild.style.width = Math.min(100, tt / curDur * 100) + '%'; };
    if (reduced) v.render((v.dur || 3000) * 0.55);
    register(cur);
  }
  syncBtn(); go(0);
  return el;
}

export function resolveRefs(list, n, fallback) { const out = []; for (let k = 0; k < n; k++) out.push(list?.[k] || fallback(k)); return out; }
export { s };
