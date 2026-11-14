import { h, icon, fmtDate, fmtPct, ICONS } from '../util.js';
import { prefs as P, progress as PR, sessions, analyses } from '../store.js';
import { lessons, L, PY, PL } from '../content/index.js';
import { recommendLessons, recommendPlays, recommendPlayers } from '../recommend.js';
import { mascot, secHead, lessonRow, empty, ctx } from '../ui.js';

export async function render() {
  const [prefs, prog, sess, ana] = await Promise.all([P.get(), PR.get(), sessions.list(), analyses.list()]);
  const name = ctx.user.display || ctx.user.username;
  const hr = new Date().getHours();
  const greet = hr < 5 ? 'Late night session' : hr < 12 ? 'Good morning' : hr < 18 ? 'Good afternoon' : 'Good evening';
  const viewed = Object.entries(prog).filter(([, p]) => p.viewed).length;
  const done = Object.values(prog).filter(p => p.done).length;
  let msg;
  if (sess.length) { const l = sess[0]; msg = `Your last ${l.category} session was ${l.makes}/${l.attempts} (${fmtPct(l.makes, l.attempts)}). Want to beat it?`; }
  else if (viewed) msg = `You have opened ${viewed} lesson${viewed > 1 ? 's' : ''}. Keep the momentum going.`;
  else if (!prefs.onboardingDone && !prefs.onboardingSkipped) msg = 'Tell me what you want to work on and I will point you to the right lessons first.';
  else msg = 'Pick a topic below, or track a shooting session to start measuring real progress.';

  const el = h('div', { class: 'page' });
  el.append(
    h('div', { class: 'hero' }, mascot({ size: 84, mood: 'wink' }), h('div', { class: 'bubble' }, h('b', {}, `${greet}, ${name}.`), h('div', { class: 'muted small', style: { marginTop: '3px' } }, msg))),
    h('a', { class: 'searchbar', href: '#/search', style: { marginTop: '10px' } }, h('span', { html: ICONS.search }), 'Search lessons, plays, players…'),
  );

  // Quick actions
  const tile = (ic, t, sub, href) => h('a', { class: 'tile', href }, h('div', { class: 'ic', html: ICONS[ic] }), h('h3', {}, t), h('div', { class: 'tiny muted' }, sub));
  el.append(secHead('Quick actions'), h('div', { class: 'tiles' },
    tile('learn', 'Learn something new', 'Lessons & drills', '#/learn'),
    tile('analyze', 'Analyze my technique', 'Camera pose analysis', '#/analyze'),
    tile('playbook', 'Open my playbook', 'Animated plays', '#/playbook'),
    tile('tracking', 'Track my shooting', 'Real stats & charts', '#/tracking')));

  // Continue learning
  const inProg = Object.entries(prog).filter(([id, p]) => p.viewed && !p.done && L[id]).sort((a, b) => b[1].viewed - a[1].viewed).slice(0, 3).map(([id]) => L[id]);
  const recs = recommendLessons(prefs, prog, 4);
  el.append(secHead('Continue learning', 'All lessons', '#/learn'));
  if (inProg.length) el.append(...inProg.map(l => lessonRow(l, prog)));
  else el.append(empty('Nothing in progress yet', 'Open any lesson and it will show up here so you can pick up where you left off.', { action: { label: 'Browse lessons', href: '#/learn' } }));
  if (recs.length) { el.append(h('h4', { style: { margin: '14px 0 8px' } }, 'Suggested next topics'), ...recs.slice(0, 3).map(l => lessonRow(l, prog))); }

  // Development
  el.append(secHead('Your basketball development', 'Tracking', '#/tracking'));
  if (!sess.length && !ana.length) {
    el.append(empty('No stats yet', 'Nothing here is made up. Record a shooting session or analyze a clip and your real progress appears here.', { action: { label: 'Start a shooting session', href: '#/tracking' } }));
  } else {
    if (sess.length) {
      const week = sess.filter(s => Date.now() - s.ended < 7 * 864e5);
      const m = week.reduce((a, s) => a + s.makes, 0), a = week.reduce((x, s) => x + s.attempts, 0);
      el.append(h('div', { class: 'stats' },
        h('div', { class: 'stat' }, h('b', { class: 'lime' }, fmtPct(sess[0].makes, sess[0].attempts)), h('span', {}, 'Last session')),
        h('div', { class: 'stat' }, h('b', {}, `${m}/${a}`), h('span', {}, 'Makes this week')),
        h('div', { class: 'stat' }, h('b', {}, sess.length), h('span', {}, 'Sessions saved'))));
      el.append(h('a', { class: 'card link', style: { marginTop: '10px' }, href: `#/track/session/${sess[0].id}` }, h('h3', {}, sess[0].name), h('div', { class: 'small muted' }, `${sess[0].category} · ${fmtDate(sess[0].ended)} · ${sess[0].makes}/${sess[0].attempts}`)));
    }
    if (ana.length) el.append(h('a', { class: 'card link', href: `#/analyze/result/${ana[0].id}` }, h('h3', {}, 'Latest analysis: ' + ana[0].techniqueTitle), h('div', { class: 'small muted' }, `${fmtDate(ana[0].at)} · confidence ${ana[0].confidence.label}`)));
  }
  if (done) el.append(h('p', { class: 'small muted', style: { marginTop: '6px' } }, `${done} lesson${done > 1 ? 's' : ''} completed.`));

  // Recommended
  const rp = recommendPlays(prefs, 2), rpl = recommendPlayers(prefs, 2);
  el.append(secHead('Recommended for you'));
  el.append(h('div', { class: 'hlist' },
    ...rp.map(p => h('a', { class: 'card link mini', href: `#/play/${p.id}` }, h('span', { class: 'tag lime' }, 'Play'), h('h3', { style: { marginTop: '6px' } }, p.name), h('div', { class: 'tiny muted' }, p.summary))),
    ...rpl.map(p => h('a', { class: 'card link mini', href: `#/player/${p.id}` }, h('span', { class: 'tag' }, 'Player study'), h('h3', { style: { marginTop: '6px' } }, p.name), h('div', { class: 'tiny muted' }, p.style))),
    ...recs.slice(0, 2).map(l => h('a', { class: 'card link mini', href: `#/lesson/${l.id}` }, h('span', { class: 'tag' }, 'Technique'), h('h3', { style: { marginTop: '6px' } }, l.title), h('div', { class: 'tiny muted' }, l.what.slice(0, 80) + '…')))));
  return el;
}
