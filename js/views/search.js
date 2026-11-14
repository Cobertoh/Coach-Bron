import { h, ICONS, debounce } from '../util.js';
import { search } from '../search.js';
import { back } from '../ui.js';

export function render(query) {
  const q0 = new URLSearchParams(query || '').get('q') || '';
  const input = h('input', { type: 'search', value: q0, placeholder: 'Try "pick and roll", "three", "layup"…', autocomplete: 'off', autocapitalize: 'none', enterkeyhint: 'search', 'aria-label': 'Search' });
  const out = h('div', { 'aria-live': 'polite' });
  const run = () => {
    const q = input.value.trim(); out.replaceChildren();
    history.replaceState(null, '', q ? `#/search?q=${encodeURIComponent(q)}` : '#/search');
    if (!q) { out.append(h('div', { class: 'muted small', style: { padding: '14px 4px' } }, 'Search lessons, techniques, drills, players, plays, defensive strategies, terms and rules.'), h('div', { class: 'chips' }, ...['pick and roll', 'free throw', 'closeout', 'pickup', 'step back', 'box out'].map(t => h('button', { class: 'chip', onclick: () => { input.value = t; run(); } }, t)))); return; }
    const groups = search(q);
    if (!groups.length) { out.append(h('div', { class: 'empty' }, h('h3', { style: { color: 'var(--tx)' } }, 'No results'), h('p', { class: 'small' }, `Nothing matched "${q}". Try a simpler word like "shot" or "defense".`))); return; }
    for (const g of groups) out.append(h('h4', { style: { margin: '18px 0 8px' } }, g.cat), ...g.items.map(i => h('a', { class: 'card link', href: i.href }, h('h3', {}, i.title), h('div', { class: 'small muted' }, i.sub.length > 110 ? i.sub.slice(0, 108) + '…' : i.sub))));
  };
  input.addEventListener('input', debounce(run, 120));
  const el = h('div', { class: 'page' }, back('Back', ''), h('div', { class: 'searchbar' }, h('span', { html: ICONS.search }), input), out);
  run(); setTimeout(() => input.focus(), 60); return el;
}
