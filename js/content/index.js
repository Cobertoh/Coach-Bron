import { skills } from './lessons-skills.js';
import { iq } from './lessons-iq.js';
import { defense, training, knowledge } from './lessons-other.js';
import { drills } from './drills.js';
import { glossary } from './glossary.js';
import { players } from './players.js';
import { plays, WEAKNESSES, DIFF, phraseFor } from './plays.js';

export const lessons = [...skills, ...iq, ...defense, ...training, ...knowledge];
export { drills, glossary, players, plays, WEAKNESSES, DIFF, phraseFor };

export const CATEGORIES = [
  { id: 'skills', title: 'Skills & Techniques', blurb: 'Shooting, handling, finishing, passing, footwork', icon: 'ball' },
  { id: 'iq', title: 'Basketball IQ', blurb: 'Reads, spacing, decisions and pickup play', icon: 'analyze' },
  { id: 'defense', title: 'Defense', blurb: 'Stance, closeouts, help and rebounding', icon: 'playbook' },
  { id: 'training', title: 'Training & Drills', blurb: 'Drills, conditioning and recovery', icon: 'tracking' },
  { id: 'players', title: 'Player Study', blurb: 'Learn from NBA stars', icon: 'user' },
  { id: 'knowledge', title: 'Basketball Knowledge', blurb: 'Rules, positions, terms, history', icon: 'learn' },
];

export const TECHNIQUES = [
  { id: 'shooting', title: 'Shooting', hint: 'Jump shots, form, release, follow-through' },
  { id: 'dribbling', title: 'Ball handling', hint: 'Stance, balance, change of direction' },
  { id: 'finishing', title: 'Finishing', hint: 'Layups, takeoff and extension' },
  { id: 'footwork', title: 'Footwork', hint: 'Pivots, stance and balance' },
  { id: 'defense', title: 'Defensive movement', hint: 'Stance, slides and lateral speed' },
  { id: 'passing', title: 'Passing', hint: 'Extension and follow-through' },
];

const byId = arr => Object.fromEntries(arr.map(x => [x.id, x]));
export const L = byId(lessons), D = byId(drills), G = byId(glossary), PL = byId(players), PY = byId(plays);

export const lessonsByCat = cat => lessons.filter(l => l.cat === cat);
export const lessonsForTechnique = t => lessons.filter(l => l.analyze === t);
export const catTitle = id => CATEGORIES.find(c => c.id === id)?.title || id;

// Lessons, plays and terms connected to a lesson, for "Related" blocks.
export function relatedFor(lesson) {
  const lessonsR = (lesson.related || []).map(id => L[id]).filter(Boolean);
  const playsR = plays.filter(p => (p.lessons || []).includes(lesson.id));
  const playersR = players.filter(p => p.lessons.includes(lesson.id));
  const terms = glossary.filter(g => g.related.includes(lesson.id));
  const drillsR = (lesson.drills || []).map(id => D[id]).filter(Boolean);
  return { lessons: lessonsR, plays: playsR, players: playersR, terms, drills: drillsR };
}
