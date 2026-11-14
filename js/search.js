// Universal search over every content type. Fully local: tokens, tags, and synonyms. No AI service.
import { lessons, drills, glossary, players, plays, catTitle } from './content/index.js';

const SYN = [
  ['pick and roll', 'pick-and-roll', 'pnr', 'ball screen', 'screen and roll'],
  ['three', '3pt', 'three-point', '3-point', 'threes', 'three pointer', 'triple'],
  ['layup', 'lay-up', 'finishing', 'finish'],
  ['dribble', 'dribbling', 'handles', 'ball handling', 'handle'],
  ['shot', 'shooting', 'jumper', 'jump shot', 'shoot'],
  ['defense', 'defence', 'defending', 'defender', 'guard'],
  ['rebound', 'rebounding', 'boards', 'box out', 'boxing out', 'block out'],
  ['free throw', 'foul shot', 'free-throw', 'freethrow'],
  ['pickup', 'pick up', 'streetball', 'rec'],
  ['handoff', 'dho', 'dribble handoff', 'hand off'],
  ['stepback', 'step back', 'step-back'],
  ['fast break', 'transition', 'break'],
];
const norm = s => s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

function expand(q) {
  const n = norm(q); const out = new Set([n]);
  for (const grp of SYN) for (const t of grp) if (n.includes(norm(t)) || norm(t).includes(n) && n.length > 2) grp.forEach(x => out.add(norm(x)));
  return [...out].filter(Boolean);
}

function score(fields, terms, tokens) {
  // fields: [{text, w}]
  let best = 0;
  for (const f of fields) {
    const t = norm(f.text || '');
    if (!t) continue;
    for (const term of terms) {
      if (t === term) best = Math.max(best, f.w * 3);
      else if (t.startsWith(term)) best = Math.max(best, f.w * 2);
      else if (t.includes(term)) best = Math.max(best, f.w * 1.4);
    }
  }
  // all tokens present somewhere
  if (!best && tokens.length > 1) {
    const all = norm(fields.map(f => f.text).join(' '));
    if (tokens.every(tk => all.includes(tk))) best = 1;
  }
  return best;
}

export function search(q) {
  const terms = expand(q); if (!terms.length || !terms[0]) return [];
  const tokens = terms[0].split(' ').filter(x => x.length > 1);
  const res = { Lessons: [], Techniques: [], Drills: [], Players: [], Plays: [], Defense: [], Terms: [], Rules: [] };
  for (const l of lessons) {
    const sc = score([{ text: l.title, w: 10 }, { text: (l.tags || []).join(' '), w: 6 }, { text: l.what, w: 2 }, { text: l.sub, w: 3 }], terms, tokens);
    if (!sc) continue;
    const item = { score: sc, title: l.title, sub: catTitle(l.cat) + (l.sub ? ' · ' + l.sub : ''), href: `#/lesson/${l.id}` };
    if (l.cat === 'skills') res.Techniques.push(item);
    else if (l.cat === 'defense') res.Defense.push(item);
    else if (l.id === 'rules-basics') res.Rules.push(item);
    else res.Lessons.push(item);
  }
  for (const d of drills) {
    const sc = score([{ text: d.name, w: 10 }, { text: d.purpose, w: 3 }, { text: d.skills.join(' '), w: 2 }], terms, tokens);
    if (sc) res.Drills.push({ score: sc, title: d.name, sub: d.purpose, href: `#/drill/${d.id}` });
  }
  for (const p of players) {
    const sc = score([{ text: p.name, w: 10 }, { text: p.signature.join(' ') + ' ' + p.techniques.join(' '), w: 4 }, { text: p.style, w: 3 }], terms, tokens);
    if (sc) res.Players.push({ score: sc, title: p.name, sub: p.pos + ' · ' + p.style, href: `#/player/${p.id}` });
  }
  for (const p of plays) {
    const sc = score([{ text: p.name, w: 10 }, { text: p.keywords.join(' '), w: 6 }, { text: p.summary, w: 2 }], terms, tokens);
    if (!sc) continue;
    const item = { score: sc, title: p.name, sub: p.summary, href: `#/play/${p.id}` };
    (p.purpose === 'defense' ? res.Defense : res.Plays).push(item);
  }
  for (const g of glossary) {
    const sc = score([{ text: g.term, w: 10 }, { text: g.alias.join(' '), w: 8 }, { text: g.def, w: 2 }], terms, tokens);
    if (sc) res.Terms.push({ score: sc, title: g.term, sub: g.def, href: `#/term/${g.id}` });
  }
  const out = [];
  for (const [cat, items] of Object.entries(res)) {
    if (!items.length) continue;
    items.sort((a, b) => b.score - a.score);
    out.push({ cat, items: items.slice(0, 8), top: items[0].score });
  }
  return out.sort((a, b) => b.top - a.top);
}
