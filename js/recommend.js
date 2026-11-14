// Rule-based recommendations from your preferences, content relationships and activity. No AI service.
import { lessons, plays, players, L } from './content/index.js';

const INTEREST_MAP = {
  shooting: l => l.sub === 'Shooting',
  handling: l => l.sub === 'Ball Handling',
  finishing: l => l.sub === 'Finishing',
  passing: l => l.sub === 'Passing' || l.id === 'creating-for-teammates',
  defense: l => l.cat === 'defense',
  iq: l => l.cat === 'iq',
  overall: l => ['shooting-mechanics', 'ball-handling-fundamentals', 'on-ball-defense', 'spacing', 'court-awareness'].includes(l.id),
};
const BEGINNER_FIRST = ['shooting-mechanics', 'ball-handling-fundamentals', 'on-ball-defense', 'court-awareness', 'spacing', 'rules-basics', 'layups', 'passing-techniques'];

export function recommendLessons(prefs, progress, n = 4) {
  const interests = prefs.interests || [];
  const viewed = Object.entries(progress).filter(([, p]) => p.viewed).map(([id]) => id);
  const relatedToViewed = new Set(viewed.flatMap(id => L[id]?.related || []));
  const pickup = /pickup|recreational|multiple/i.test(prefs.environment || '');
  const small = ['1v1', '3v3'].includes(prefs.format);
  const scored = lessons.map(l => {
    let sc = 0;
    for (const i of interests) if (INTEREST_MAP[i]?.(l)) sc += 3;
    if (!progress[l.id]?.viewed) sc += 2;
    if (progress[l.id]?.done) sc -= 6;
    if (relatedToViewed.has(l.id)) sc += 2;
    if (l.sub === 'Pickup Basketball' && (pickup || small)) sc += 2;
    if (/^beginner/i.test(prefs.experience || '') && BEGINNER_FIRST.includes(l.id)) sc += 2;
    if (!prefs.experience && !interests.length && BEGINNER_FIRST.includes(l.id)) sc += 2;
    if (/^(advanced|competitive)/i.test(prefs.experience || '') && l.cat === 'iq') sc += 1;
    return { l, sc };
  });
  return scored.filter(x => x.sc > 0).sort((a, b) => b.sc - a.sc).slice(0, n).map(x => x.l);
}

export function recommendPlays(prefs, n = 2) {
  const want = prefs.format === '5v5' ? '5v5' : prefs.format === '3v3' || /pickup/i.test(prefs.environment || '') ? '3v3' : null;
  return plays.filter(p => p.purpose === 'offense' && p.general && (!want || p.formats.includes(want))).slice(0, n);
}

export function recommendPlayers(prefs, n = 2) {
  const interests = prefs.interests || [];
  const tag = { shooting: ['shooting'], handling: ['ball-handling-fundamentals', 'crossover'], finishing: ['layups', 'finishing-through-contact'], passing: ['passing-techniques'], defense: ['on-ball-defense'], iq: ['court-awareness', 'decision-making'] };
  const wanted = new Set(interests.flatMap(i => tag[i] || []));
  const sc = players.map(p => ({ p, s: p.lessons.filter(l => wanted.has(l) || [...wanted].some(w => l.includes(w))).length }));
  const best = sc.filter(x => x.s > 0).sort((a, b) => b.s - a.s).slice(0, n).map(x => x.p);
  return best.length ? best : players.slice(0, n);
}
