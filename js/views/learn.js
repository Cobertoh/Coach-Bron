import { h, icon, ICONS, toast } from '../util.js';
import { prefs as P, progress as PR, saved } from '../store.js';
import { CATEGORIES, lessons, lessonsByCat, L, D, G, PY, glossary, drills, catTitle, relatedFor, TECHNIQUES } from '../content/index.js';
import { back, secHead, lessonRow, empty, ctx } from '../ui.js';
import { createCourtPlayer } from '../court.js';
import { onLeave } from '../ctx.js';
import { visual, mistakeVisual, watchPlayer, isDiagram } from '../visual.js';
import { V, DV, GV } from '../visuals/map.js';
import { VIDEOS } from '../content/videos.js';
import { videoSection } from '../video.js';

export async function home() {
  const [prog, savedIds] = await Promise.all([PR.get(), saved.lessons()]);
  const el = h('div', { class: 'page' }, h('h1', { style: { margin: '8px 0 4px' } }, 'Learn'), h('div', { class: 'muted small' }, `${lessons.length} lessons, ${drills.length} drills, ${glossary.length} terms. Everything is open to everyone. Levels only change how deep an explanation goes.`));
  el.append(h('a', { class: 'searchbar', href: '#/search', style: { marginTop: '14px' } }, h('span', { html: ICONS.search }), 'Search the whole library…'));
  el.append(h('div', { class: 'tiles', style: { marginTop: '14px' } }, ...CATEGORIES.map(c => {
    const n = c.id === 'players' ? 15 : lessonsByCat(c.id).length;
    return h('a', { class: 'tile', href: c.id === 'players' ? '#/players' : `#/learn/${c.id}` }, h('div', { class: 'ic', html: ICONS[c.icon] }), h('h3', {}, c.title), h('div', { class: 'tiny muted' }, c.blurb), h('div', { class: 'tiny lime' }, `${n} ${c.id === 'players' ? 'profiles' : 'lessons'}`));
  })));
  el.append(h('a', { class: 'card link', style: { marginTop: '12px' }, href: '#/learn/iq/pickup' }, h('span', { class: 'tag lime' }, 'Pickup basketball'), h('h3', { style: { marginTop: '6px' } }, 'Playing well in pickup games'), h('div', { class: 'small muted' }, 'Mismatches, communication without play calls, 3v3 spacing.')));
  el.append(h('a', { class: 'card link', href: '#/glossary' }, h('h3', {}, 'Basketball terminology'), h('div', { class: 'small muted' }, 'Court, offense, defense and general terms.')));
  const sv = savedIds.map(id => L[id]).filter(Boolean);
  if (sv.length) el.append(secHead('Saved lessons'), ...sv.map(l => lessonRow(l, prog)));
  return el;
}

export async function category(cat, onlySub) {
  if (cat === 'players') { ctx.go('#/players'); return h('div'); }
  const c = CATEGORIES.find(x => x.id === cat); if (!c) return notFound();
  const prog = await PR.get();
  let list = lessonsByCat(cat);
  const el = h('div', { class: 'page' }, back('Learn', '#/learn'), h('h1', {}, c.title), h('div', { class: 'muted small', style: { marginBottom: '8px' } }, c.blurb));
  if (onlySub === 'pickup') list = list.filter(l => l.sub === 'Pickup Basketball');
  const groups = {}; list.forEach(l => (groups[l.sub || 'General'] ||= []).push(l));
  for (const [sub, ls] of Object.entries(groups)) el.append(h('h4', { style: { margin: '18px 0 8px' } }, sub), ...ls.map(l => lessonRow(l, prog)));
  if (cat === 'training') {
    el.append(secHead('Drills'));
    for (const t of ['individual', 'partner', 'team', 'conditioning']) {
      const ds = drills.filter(d => d.type === t); if (!ds.length) continue;
      el.append(h('h4', { style: { margin: '14px 0 8px' } }, t[0].toUpperCase() + t.slice(1)), ...ds.map(d => h('a', { class: 'card link', href: `#/drill/${d.id}` }, h('h3', {}, d.name), h('div', { class: 'small muted' }, d.purpose))));
    }
  }
  if (cat === 'knowledge') el.append(h('a', { class: 'card link', style: { marginTop: '12px' }, href: '#/glossary' }, h('h3', {}, 'Terminology'), h('div', { class: 'small muted' }, `${glossary.length} terms with links to related lessons.`)));
  if (cat === 'iq' && onlySub !== 'pickup') { /* pickup is already a subsection above */ }
  return el;
}

const levelFromPrefs = p => /advanced|competitive/i.test(p.experience || '') ? 'advanced' : /intermediate/i.test(p.experience || '') ? 'intermediate' : 'beginner';

export async function lesson(id) {
  const l = L[id]; if (!l) return notFound();
  const [prefs, prog, savedIds] = await Promise.all([P.get(), PR.get(), saved.lessons()]);
  await PR.touch(id);
  let level = prog[id]?.level || levelFromPrefs(prefs);
  let isSaved = savedIds.includes(id), isDone = !!prog[id]?.done;
  const rel = relatedFor(l);
  const el = h('div', { class: 'page lesson' });
  const saveBtn = h('button', { class: 'icon-btn', 'aria-label': 'Save lesson', onclick: async () => { isSaved = await saved.toggleLesson(id); draw(); toast(isSaved ? 'Saved' : 'Removed from saved'); } });
  const doneBtn = h('button', { class: 'btn block', onclick: async () => { isDone = !isDone; await PR.touch(id, { done: isDone }); draw(); toast(isDone ? 'Marked complete' : 'Marked in progress'); } });
  const lvlBox = h('div', {});
  const draw = () => {
    saveBtn.innerHTML = isSaved ? ICONS.bookmarkOn : ICONS.bookmark; saveBtn.style.color = isSaved ? 'var(--lime)' : '';
    doneBtn.textContent = isDone ? '✓ Completed (tap to undo)' : 'Mark as complete'; doneBtn.className = 'btn block' + (isDone ? '' : ' pri');
    lvlBox.replaceChildren(
      h('div', { class: 'seg', role: 'tablist' }, ...['beginner', 'intermediate', 'advanced'].map(k => h('button', { class: level === k ? 'on' : '', role: 'tab', 'aria-selected': level === k, onclick: async () => { level = k; await PR.touch(id, { level: k }); draw(); } }, k[0].toUpperCase() + k.slice(1)))),
      h('div', { class: 'callout' }, h('b', {}, 'At this level: '), l.levels[level]));
  };
  el.append(back(catTitle(l.cat), l.cat === 'iq' && l.sub === 'Pickup Basketball' ? '#/learn/iq/pickup' : `#/learn/${l.cat}`),
    h('div', { class: 'row sb' }, h('div', {}, h('h1', {}, l.title), h('div', { class: 'small muted', style: { marginTop: '4px' } }, `${catTitle(l.cat)} · ${l.sub}`)), saveBtn),
    lvlBox);
  if (l.analyze) el.append(h('a', { class: 'btn pri block', href: `#/analyze/${l.analyze}?from=${id}`, style: { margin: '6px 0 4px' } }, icon('camera'), 'Analyze My Technique'));
  if (l.court && PY[l.court]) {
    const cp = createCourtPlayer(PY[l.court], { compact: true }); onLeave(cp.destroy);
    el.append(h('h2', {}, 'See it'), cp.el, h('a', { class: 'small', href: `#/play/${l.court}` }, 'Open the full play with options and adjustments →'));
  }
  const sec = (t, body) => [h('h2', {}, t), body];
  const vm = V[id] || {};
  // Only real diagrams (court scenes, timelines) are drawn. Body technique is taught with coaching video.
  const stepRefs = l.steps.map((x, i) => isDiagram(vm.s?.[i]) ? vm.s[i] : null);
  const diagSteps = stepRefs.map((r, i) => r && i).filter(i => i !== null && i !== false);
  el.append(videoSection(VIDEOS[id]) || h('div'));
  if (diagSteps.length >= 2) el.append(watchPlayer(diagSteps.map(i => stepRefs[i]), diagSteps.map(i => l.steps[i]), { title: `Watch it on the court: ${l.title}` }));
  const hero = isDiagram(vm.hero) ? visual(vm.hero, { label: l.title }) : null;
  el.append(...sec('What it is', h('div', { class: 'whatbox' }, h('p', {}, l.what), hero)),
    ...sec('Why it matters', h('p', {}, l.why)), ...sec('How it works', h('p', {}, l.how)),
    ...sec('Step by step', h('div', { class: 'stepcards' }, ...l.steps.map((x, i) => h('div', { class: 'stepcard' + (stepRefs[i] ? '' : ' text') }, h('div', { class: 'sthead' }, h('span', { class: 'stnum' }, i + 1), h('span', {}, x)), stepRefs[i] ? visual(stepRefs[i], { label: x }) : null)))));
  if (l.mistakes?.length) el.append(...sec('Common mistakes', h('div', {}, ...l.mistakes.map((x, i) => { const pr = vm.m?.[i]; return pr && isDiagram(pr[0]) && isDiagram(pr[1]) ? mistakeVisual(x, pr) : h('div', { class: 'mcard' }, h('div', { class: 'mtext', style: { marginBottom: 0 } }, h('span', { class: 'xmark' }, '✗'), x)); }))));
  if (l.practice?.length) el.append(...sec('How to practice it', h('ul', {}, ...l.practice.map(x => h('li', {}, x)))));
  if (rel.drills.length) el.append(h('h2', {}, 'Relevant drills'), ...rel.drills.map(d => h('a', { class: 'card link', href: `#/drill/${d.id}` }, h('h3', {}, d.name), h('div', { class: 'small muted' }, d.purpose))));
  if (l.examples?.length) el.append(...sec('Practical game examples', h('ul', {}, ...l.examples.map(x => h('li', {}, x)))));
  const relBits = [];
  if (rel.lessons.length) relBits.push(h('h4', { style: { margin: '10px 0 8px' } }, 'Lessons'), ...rel.lessons.map(x => lessonRow(x, prog)));
  if (rel.plays.length) relBits.push(h('h4', { style: { margin: '10px 0 8px' } }, 'Playbook'), ...rel.plays.map(p => h('a', { class: 'card link', href: `#/play/${p.id}` }, h('h3', {}, p.name), h('div', { class: 'small muted' }, p.summary))));
  if (rel.players.length) relBits.push(h('h4', { style: { margin: '10px 0 8px' } }, 'Players who show it'), h('div', { class: 'chips' }, ...rel.players.map(p => h('a', { class: 'chip', href: `#/player/${p.id}` }, p.name))));
  if (rel.terms.length) relBits.push(h('h4', { style: { margin: '14px 0 8px' } }, 'Terms'), h('div', { class: 'chips' }, ...rel.terms.map(t => h('a', { class: 'chip', href: `#/term/${t.id}` }, t.term))));
  if (relBits.length) el.append(h('h2', {}, 'Related'), ...relBits);
  el.append(h('div', { style: { height: '14px' } }), doneBtn);
  draw(); return el;
}

export function drill(id) {
  const d = D[id]; if (!d) return notFound();
  const dv = DV[id] || {};
  const refs = d.how.map((x, i) => isDiagram(dv.s?.[i]) ? dv.s[i] : null);
  const vids = (d.skills || []).flatMap(s => VIDEOS[s] || []).filter((v, i, a) => a.findIndex(w => w.id === v.id) === i).slice(0, 2);
  const el = h('div', { class: 'page lesson' }, back('Training', '#/learn/training'), h('h1', {}, d.name), h('div', { class: 'small muted', style: { margin: '4px 0 10px' } }, d.type[0].toUpperCase() + d.type.slice(1) + ' drill'),
    h('div', { class: 'callout' }, h('b', {}, 'Purpose: '), d.purpose),
    h('h2', {}, 'Setup'), h('div', { class: 'whatbox' }, h('p', {}, d.setup), isDiagram(dv.setup) ? visual(dv.setup, { label: 'Drill setup' }) : null),
    h('h2', {}, 'How to do it'), h('div', { class: 'stepcards' }, ...d.how.map((x, i) => h('div', { class: 'stepcard' + (refs[i] ? '' : ' text') }, h('div', { class: 'sthead' }, h('span', { class: 'stnum' }, i + 1), h('span', {}, x)), refs[i] ? visual(refs[i], { label: x }) : null))),
    h('h2', {}, 'How much'), doseRow(d.dose), h('h2', {}, 'Make it harder'), h('p', {}, d.progress),
    videoSection(vids, 'Technique videos for this drill'),
    h('h2', {}, 'Builds these lessons'), ...d.skills.map(s => L[s] && h('a', { class: 'card link', href: `#/lesson/${s}` }, h('h3', {}, L[s].title))));
  if (d.track) el.append(h('h2', {}, 'Measure it'), h('p', { class: 'small muted' }, 'Shooting results are repeatable and comparable, so this drill can be tracked.'), h('a', { class: 'btn pri block', href: `#/tracking/new/${d.track}` }, 'Start a tracked shooting workout'));
  else el.append(h('p', { class: 'small muted', style: { marginTop: '14px' } }, 'This drill has no tracked score on purpose: counting reps of it would not show real improvement.'));
  return el;
}

function doseRow(dose) {
  const m = String(dose).match(/(\d+)\D+(\d+)?/); const sets = /set|round|trip|game/i.test(dose) && m ? +m[1] : 0;
  return h('div', { class: 'dose' }, sets && sets <= 12 ? h('div', { class: 'dosedots' }, ...Array.from({ length: sets }, (_, i) => h('i', { style: { animationDelay: i * 0.15 + 's' } }))) : null, h('div', { class: 'dosetxt' }, dose));
}

export function glossaryPage() {
  const el = h('div', { class: 'page' }, back('Learn', '#/learn'), h('h1', {}, 'Terminology'));
  for (const [cat, t] of [['court', 'Court'], ['offense', 'Offense'], ['defense', 'Defense'], ['general', 'General']]) {
    el.append(h('h4', { style: { margin: '18px 0 8px' } }, t), ...glossary.filter(g => g.cat === cat).map(g => h('a', { class: 'card link', href: `#/term/${g.id}` }, h('h3', {}, g.term), h('div', { class: 'small muted' }, g.def.slice(0, 90) + (g.def.length > 90 ? '…' : '')))));
  }
  return el;
}
export function term(id) {
  const g = G[id]; if (!g) return notFound();
  return h('div', { class: 'page lesson' }, back('Terminology', '#/glossary'), h('h1', {}, g.term), h('div', { class: 'small muted', style: { margin: '4px 0 12px' } }, g.cat[0].toUpperCase() + g.cat.slice(1)),
    h('div', { class: 'callout' }, g.def), (isDiagram(GV[id]) ? visual(GV[id], { label: g.term }) : null), g.alias.length ? h('p', { class: 'small muted' }, 'Also called: ' + g.alias.join(', ')) : null,
    g.related.length ? [h('h2', {}, 'Learn more'), ...g.related.map(r => L[r] && h('a', { class: 'card link', href: `#/lesson/${r}` }, h('h3', {}, L[r].title)))] : null);
}

function notFound() { return h('div', { class: 'page' }, empty('Not found', 'That page does not exist.', { action: { label: 'Back to Learn', href: '#/learn' } })); }
export { notFound };
