import { h } from '../util.js';
import { players, PL, L, D } from '../content/index.js';
import { back, empty } from '../ui.js';

const initials = n => n.split(' ').map(x => x[0]).slice(0, 2).join('');

export function list() {
  const el = h('div', { class: 'page' }, back('Learn', '#/learn'), h('h1', {}, 'Player Study'),
    h('p', { class: 'muted small', style: { margin: '6px 0 12px' } }, 'Learn skills by studying how well-known players play. Profiles describe playing style only, with no statistics or quotes. The collection can be expanded by adding entries to the player data file.'));
  el.append(...players.map(p => h('a', { class: 'card link row', href: `#/player/${p.id}` }, h('div', { class: 'mono' }, initials(p.name)), h('div', {}, h('h3', {}, p.name), h('div', { class: 'small muted' }, p.pos + ' · ' + p.signature[0])))));
  return el;
}

const sec = (t, body) => [h('h2', { style: { margin: '22px 0 6px' } }, t), body];
export function profile(id) {
  const p = PL[id]; if (!p) return h('div', { class: 'page' }, empty('Player not found', '', { action: { label: 'All players', href: '#/players' } }));
  const bullets = a => h('ul', { style: { margin: 0, paddingLeft: '20px' } }, ...a.map(x => h('li', { style: { marginBottom: '4px' } }, x)));
  return h('div', { class: 'page lesson' }, back('Players', '#/players'),
    h('div', { class: 'row' }, h('div', { class: 'mono', style: { width: '64px', height: '64px', fontSize: '22px' } }, initials(p.name)), h('div', {}, h('h1', {}, p.name), h('div', { class: 'small muted' }, p.pos))),
    ...sec('Overview', h('p', {}, p.overview)),
    ...sec('Position and playing style', h('p', {}, `${p.pos}. ${p.style}`)),
    ...sec('Signature skills', h('div', { class: 'chips' }, ...p.signature.map(x => h('span', { class: 'tag lime' }, x)))),
    ...sec('Distinctive techniques', bullets(p.techniques)),
    ...sec('Basketball strengths', bullets(p.strengths)),
    ...sec('What you can learn from them', bullets(p.learn)),
    ...sec('Relevant lessons', h('div', {}, ...p.lessons.map(l => L[l] && h('a', { class: 'card link', href: `#/lesson/${l}` }, h('h3', {}, L[l].title))))),
    ...sec('Recommended drills', h('div', {}, ...p.drills.map(d => D[d] && h('a', { class: 'card link', href: `#/drill/${d}` }, h('h3', {}, D[d].name), h('div', { class: 'small muted' }, D[d].purpose))))),
    ...sec('Film breakdown', h('div', {}, h('p', { class: 'small muted' }, 'What to watch for when you study game film:'), bullets(p.watch),
      h('div', { class: 'callout warn', style: { marginTop: '10px' } }, 'No video is bundled. Coach Bron does not scrape or copy footage. Search the league\'s official channels or use licensed sources to find clips, then look for the points above.'))));
}
