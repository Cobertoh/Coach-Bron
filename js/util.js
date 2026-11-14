export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

export function h(tag, attrs, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (v === true) el.setAttribute(k, '');
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

const NS = 'http://www.w3.org/2000/svg';
export function s(tag, attrs, ...kids) {
  const el = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.setAttribute('class', v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2).toLowerCase(), v);
    else el.setAttribute(k, v);
  }
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
export const pct = (m, a) => (a ? Math.round((m / a) * 1000) / 10 : 0);
export const fmtPct = (m, a) => (a ? `${pct(m, a)}%` : '—');
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const mean = a => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : NaN);
export const std = a => { if (a.length < 2) return NaN; const m = mean(a); return Math.sqrt(mean(a.map(x => (x - m) ** 2))); };

export function fmtDate(ts, opts) {
  return new Date(ts).toLocaleDateString(undefined, opts || { month: 'short', day: 'numeric' });
}
export function fmtDur(sec) {
  sec = Math.max(0, Math.round(sec));
  const m = Math.floor(sec / 60), r = sec % 60;
  return `${m}:${String(r).padStart(2, '0')}`;
}
export function weekStart(ts) {
  const d = new Date(ts); d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); // Monday
  return d.getTime();
}
export function debounce(fn, ms = 200) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

export function toast(msg, ms = 2200) {
  const t = h('div', { class: 'toast', role: 'status' }, msg);
  document.body.append(t);
  setTimeout(() => t.remove(), ms);
}

export function sheet(content) {
  const bg = h('div', { class: 'sheet-bg', onclick: e => { if (e.target === bg) close(); } });
  const box = h('div', { class: 'sheet', role: 'dialog' }, content);
  bg.append(box); document.body.append(bg);
  function close() { bg.remove(); }
  return { close, box };
}

export function confirmSheet(title, body, okLabel, danger = false) {
  return new Promise(res => {
    const sh = sheet([
      h('h2', {}, title), h('p', { class: 'muted', style: { marginTop: '8px' } }, body),
      h('div', { class: 'row', style: { marginTop: '16px' } },
        h('button', { class: 'btn block', onclick: () => { sh.close(); res(false); } }, 'Cancel'),
        h('button', { class: 'btn block ' + (danger ? 'danger' : 'pri'), onclick: () => { sh.close(); res(true); } }, okLabel)),
    ]);
  });
}

export const ICONS = {
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/></svg>',
  learn: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V18c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5z"/><path d="M12 6v12.5"/></svg>',
  playbook: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="3.5" width="17" height="17" rx="3"/><circle cx="8.5" cy="15.5" r="1.6"/><path d="M8.5 13.5c0-4 3-5.5 7-5.5"/><path d="m13.5 6.2 2.4 1.8-2.4 2"/></svg>',
  analyze: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2"/><path d="M12 7.5v6M12 9.5 7.5 12M12 9.5l4.5 2.5M12 13.5 8.5 20M12 13.5l3.5 6.5"/><path d="M3.5 8V4.5H7M20.5 8V4.5H17M3.5 16v3.5H7M20.5 16v3.5H17"/></svg>',
  tracking: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5V10M10 19.5V5M16 19.5v-7M21 19.5H3"/><path d="m13 6.5 3-2.5 4 3.5"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-4 3.6-6 7.5-6s6.7 2 7.5 6"/></svg>',
  play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="6.5" y="5" width="4" height="14" rx="1"/><rect x="13.5" y="5" width="4" height="14" rx="1"/></svg>',
  next: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5.5v13l9-6.5z"/><rect x="16.5" y="5.5" width="2.5" height="13" rx="1"/></svg>',
  prev: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18 5.5v13L9 12z"/><rect x="5" y="5.5" width="2.5" height="13" rx="1"/></svg>',
  replay: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12a8 8 0 1 0 3-6.2"/><path d="M4 4v4.5h4.5"/></svg>',
  reset: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5.5v13l9-6.5z" transform="matrix(-1 0 0 1 24 0)"/><rect x="5" y="5.5" width="2.5" height="13" rx="1"/></svg>',
  star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8z"/></svg>',
  starOn: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.6-5.1-2.7-5.1 2.7 1-5.6-4.1-4 5.7-.8z"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M6.5 4h11v16.5L12 16.5 6.5 20.5z"/></svg>',
  bookmarkOn: '<svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M6.5 4h11v16.5L12 16.5 6.5 20.5z"/></svg>',
  back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="18" height="18"><path d="m15 5-7 7 7 7"/></svg>',
  camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round"><path d="M4 8h3l1.5-2.5h7L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>',
  ball: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17M12 3.5v17M6 6.5c3 2.5 3 8.5 0 11M18 6.5c-3 2.5-3 8.5 0 11"/></svg>',
};
export const icon = (name, cls = '') => h('span', { class: cls, html: ICONS[name], style: { display: 'inline-flex' } });
