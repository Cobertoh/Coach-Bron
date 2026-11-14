import { h, ICONS, toast, debounce } from '../util.js';
import { saved, playPlan } from '../store.js';
import { plays, PY, L, WEAKNESSES, DIFF, phraseFor } from '../content/index.js';
import { back, chipSelect, empty } from '../ui.js';
import { createCourtPlayer } from '../court.js';
import { onLeave } from '../ctx.js';
import { notFound } from './learn.js';

const STYLES = ['Fast pace', 'Half-court', 'Shooting-heavy', 'Drive-heavy', 'Inside-out'];
const DEF_STR = ['Perimeter defense', 'Interior defense', 'Rebounding', 'Communication', 'Speed'];
const NEEDS_SCREENER = ['pnr-high', 'pin-down', 'dho', 'pick-and-pop'];
const SHOOTER_PLAYS = ['pin-down', 'drive-kick', 'pick-and-pop', 'pnr-high', 'backdoor'];
const DRIVER_PLAYS = ['drive-kick', 'pnr-high', 'dho'];
const ADJ_LABEL = { switch: 'Switching', double: 'Defensive doubling', under: 'Going under screens', over: 'Going over screens', help: 'Help defense', trap: 'Trapping', deny: 'Denying passes' };

const tagsFor = (p, matched = []) => h('div', { style: { marginBottom: '4px' } },
  h('span', { class: 'tag' }, p.formats.join(' / ')), h('span', { class: 'tag' }, DIFF[p.diff]),
  matched.length ? h('span', { class: 'tag warn' }, 'Targets: ' + matched.join(', ')) : p.purpose === 'defense' ? h('span', { class: 'tag lime' }, 'Defense') : p.general ? h('span', { class: 'tag lime' }, 'General') : h('span', { class: 'tag' }, 'Situational'));

const playCard = (p, favs, matched) => h('a', { class: 'card link', href: `#/play/${p.id}` },
  h('div', { class: 'row sb' }, h('h3', {}, p.name), favs.includes(p.id) ? h('span', { class: 'lime', html: ICONS.starOn, style: { width: '18px' } }) : null), tagsFor(p, matched), h('div', { class: 'small muted' }, p.summary));

export function recommend(plan, favsUnused) {
  const fmt = plan.format === '5v5' ? '5v5' : '3v3';
  const sel = new Set((plan.weaknesses || []).filter(w => w !== 'unknown'));
  const custom = (plan.custom || '').toLowerCase();
  const offense = plays.filter(p => p.purpose === 'offense' && p.formats.includes(fmt));
  const exploit = [], general = [];
  for (const p of offense) {
    const matchedIds = p.exploits.filter(e => sel.has(e));
    const kw = custom ? p.keywords.filter(k => custom.includes(k) || k.split(' ').some(t => t.length > 3 && custom.includes(t))) : [];
    let fit = 0;
    if (plan.roles?.screener && NEEDS_SCREENER.includes(p.id)) fit += 2;
    if (plan.roles?.shooters?.length && SHOOTER_PLAYS.includes(p.id)) fit += 2;
    if ((plan.roles?.handler || plan.roles?.finisher) && DRIVER_PLAYS.includes(p.id)) fit += 1;
    if (plan.style === 'Inside-out' && p.id === 'post-seal') fit += 3;
    if (plan.style === 'Shooting-heavy' && SHOOTER_PLAYS.includes(p.id)) fit += 1;
    if (plan.style === 'Drive-heavy' && DRIVER_PLAYS.includes(p.id)) fit += 1;
    if (plan.style === 'Fast pace' && p.id === 'drive-kick') fit += 1;
    if (matchedIds.length || kw.length) exploit.push({ p, matched: [...matchedIds.map(id => WEAKNESSES.find(w => w.id === id).label.toLowerCase()), ...(kw.length ? ['your custom note'] : [])], score: matchedIds.length * 10 + kw.length * 8 + fit });
    if (p.general) general.push({ p, score: fit });
  }
  exploit.sort((a, b) => b.score - a.score); general.sort((a, b) => b.score - a.score);
  return { exploit, general, fmt, customUnmatched: !!custom && !exploit.some(e => e.matched.includes('your custom note')) };
}

export async function home() {
  const [plan, favs] = await Promise.all([playPlan.get(), saved.plays()]);
  const el = h('div', { class: 'page' }, h('h1', { style: { margin: '8px 0 4px' } }, 'Playbook'), h('div', { class: 'muted small' }, 'Tell Coach Bron about your team and your opponent. Plays are explained, animated and honest about when they fail.'));
  let tab = 'plan';
  const body = h('div', {});
  const seg = h('div', { class: 'seg' });
  const drawSeg = () => seg.replaceChildren(...[['plan', 'My plan'], ['browse', 'Browse all'], ['saved', 'Saved']].map(([k, t]) => h('button', { class: tab === k ? 'on' : '', onclick: () => { tab = k; drawSeg(); drawBody(); } }, t)));

  function planView() {
    const out = h('div', {});
    const box = h('div', {});
    const n = plan.format === '5v5' ? 5 : 3;
    plan.roles ||= {}; plan.names ||= [];
    const names = Array.from({ length: n }, (_, i) => plan.names[i] || (i === 0 ? 'Me' : `Player ${i + 1}`));
    const roleSel = (label, key, multi) => h('div', { class: 'field' }, h('label', {}, label), chipSelect({ options: names, value: multi ? plan.roles[key] : plan.roles[key], multi, onChange: v => { plan.roles[key] = v; save(); } }));
    const save = debounce(() => playPlan.set(plan), 250);
    box.append(
      h('div', { class: 'card' },
        h('h3', { style: { marginBottom: '10px' } }, 'Your team'),
        h('div', { class: 'field' }, h('label', {}, 'Format'), chipSelect({ options: ['3v3', '5v5', 'Other'], value: plan.format, onChange: v => { plan.format = v; playPlan.set(plan).then(drawBody); } })),
        plan.format === 'Other' ? h('p', { class: 'tiny muted' }, 'Plays are built for 3v3 and 5v5. In other small formats, 3v3 plays usually still work with fewer spacers.') : null,
        h('div', { class: 'field' }, h('label', {}, 'Player names (optional)'), h('div', { class: 'grid2' }, ...names.map((nm, i) => h('input', { type: 'text', value: plan.names[i] || '', placeholder: nm, maxlength: 20, oninput: e => { plan.names[i] = e.target.value; save(); } })))),
        h('p', { class: 'tiny muted' }, 'Names stay on this device. Rename, then tap Update to refresh the role options.'),
        roleSel('Strongest shooters', 'shooters', true), roleSel('Best ball handler', 'handler', false), roleSel('Best finisher', 'finisher', false), roleSel('Best screener', 'screener', false),
        h('div', { class: 'field' }, h('label', {}, 'Defensive strengths'), chipSelect({ options: DEF_STR, value: plan.defStrengths, multi: true, onChange: v => { plan.defStrengths = v; save(); } })),
        h('div', { class: 'field' }, h('label', {}, 'Team playing style'), chipSelect({ options: STYLES, value: plan.style, onChange: v => { plan.style = v; save(); } }))),
      h('div', { class: 'card' },
        h('h3', { style: { marginBottom: '4px' } }, 'Opponent scouting'),
        h('div', { class: 'small muted', style: { marginBottom: '10px' } }, 'Pick any weaknesses you know about. Not sure? Choose Don\'t know and you still get plays that work against anyone.'),
        chipSelect({ options: [...WEAKNESSES.map(w => ({ id: w.id, label: w.label })), { id: 'unknown', label: 'Don\'t know' }], value: plan.weaknesses, multi: true, exclusive: 'unknown', onChange: v => { plan.weaknesses = v; save(); } }),
        h('div', { class: 'field', style: { marginTop: '12px' } }, h('label', {}, 'Other / custom weakness'), h('input', { type: 'text', value: plan.custom || '', maxlength: 80, placeholder: 'For example: they overplay the passing lanes', oninput: e => { plan.custom = e.target.value; save(); } }))),
      h('button', { class: 'btn pri block', onclick: async () => { await playPlan.set(plan); drawResults(); } }, 'Update recommendations'));
    const results = h('div', {});
    function drawResults() {
      const r = recommend(plan, favs);
      results.replaceChildren();
      results.append(h('div', { class: 'sec' }, h('h2', {}, `Recommended for ${r.fmt}`)));
      if (r.exploit.length) {
        results.append(h('h4', { style: { margin: '4px 0 8px' } }, 'Built to exploit what you told me'), ...r.exploit.map(x => playCard(x.p, favs, x.matched)));
      } else if ((plan.weaknesses || []).some(w => w !== 'unknown') || plan.custom) {
        results.append(h('div', { class: 'callout warn' }, 'No play in the library is specifically built for that weakness yet, so here are general plays.'));
      }
      if (r.customUnmatched && r.exploit.length) results.append(h('p', { class: 'tiny muted' }, 'Your custom note did not match any play keyword, so it only affected nothing above.'));
      results.append(h('h4', { style: { margin: '16px 0 4px' } }, 'General-purpose plays'), h('div', { class: 'tiny muted', style: { marginBottom: '8px' } }, 'These work against any defense. They are not aimed at a specific weakness.'), ...r.general.map(x => playCard(x.p, favs, [])));
      results.append(h('h4', { style: { margin: '16px 0 8px' } }, 'Defensive plays'), ...plays.filter(p => p.purpose === 'defense' && p.formats.includes(r.fmt)).map(p => playCard(p, favs, [])));
    }
    drawResults();
    out.append(box, results); return out;
  }

  function browseView(onlySaved) {
    const f = { q: '', fmt: null, diff: null, purpose: null };
    const listBox = h('div', {});
    const draw = () => {
      const q = f.q.toLowerCase();
      const ls = plays.filter(p => (!onlySaved || favs.includes(p.id)) && (!f.fmt || p.formats.includes(f.fmt)) && (!f.diff || DIFF[p.diff] === f.diff) && (!f.purpose || p.purpose === f.purpose) &&
        (!q || (p.name + ' ' + p.keywords.join(' ') + ' ' + p.summary).toLowerCase().includes(q)));
      listBox.replaceChildren(...(ls.length ? ls.map(p => playCard(p, favs, [])) : [empty(onlySaved && !favs.length ? 'No saved plays yet' : 'No plays match', onlySaved && !favs.length ? 'Tap the star on any play to save it here.' : 'Try clearing a filter.')]));
    };
    const wrapTog = (key, opts) => { const box = h('div', { class: 'chips' }); const dr = () => box.replaceChildren(...opts.map(o => h('button', { class: 'chip' + (f[key] === (o.v ?? o) ? ' on' : ''), onclick: () => { f[key] = f[key] === (o.v ?? o) ? null : (o.v ?? o); dr(); draw(); } }, o.t ?? o))); dr(); return box; };
    draw();
    return h('div', {}, onlySaved ? null : h('div', {}, h('input', { type: 'search', placeholder: 'Search plays…', oninput: debounce(e => { f.q = e.target.value; draw(); }, 150), style: { marginBottom: '10px' } }),
      wrapTog('fmt', ['3v3', '5v5']), h('div', { style: { height: '8px' } }), wrapTog('diff', ['Beginner', 'Intermediate', 'Advanced']), h('div', { style: { height: '8px' } }), wrapTog('purpose', [{ t: 'Offense', v: 'offense' }, { t: 'Defense', v: 'defense' }]), h('div', { style: { height: '12px' } })), listBox);
  }
  function drawBody() { body.replaceChildren(tab === 'plan' ? planView() : browseView(tab === 'saved')); }
  drawSeg(); drawBody();
  el.append(seg, body);
  return el;
}

export async function playPage(id) {
  const p = PY[id]; if (!p) return notFound();
  let favs = await saved.plays(); let fav = favs.includes(id);
  const star = h('button', { class: 'icon-btn', 'aria-label': 'Save play', onclick: async () => { fav = await saved.togglePlay(id); drawStar(); toast(fav ? 'Saved to your playbook' : 'Removed'); } });
  const drawStar = () => { star.innerHTML = fav ? ICONS.starOn : ICONS.star; star.style.color = fav ? 'var(--lime)' : ''; };
  drawStar();
  const cp = createCourtPlayer(p); onLeave(cp.destroy);
  const sec = (t, body) => body ? [h('h2', { style: { margin: '22px 0 6px' } }, t), body] : [];
  const ul = a => h('ul', { style: { margin: 0, paddingLeft: '20px' } }, ...a.map(x => h('li', { style: { marginBottom: '4px' } }, x)));
  const adj = Object.entries(ADJ_LABEL).filter(([k]) => p.adjust?.[k]).map(([k, label]) => h('div', { class: 'card' }, h('h3', {}, label), h('div', { class: 'small', style: { color: 'var(--tx2)', marginTop: '2px' } }, p.adjust[k])));
  const matched = p.exploits.map(e => WEAKNESSES.find(w => w.id === e)?.label).filter(Boolean);
  return h('div', { class: 'page lesson' }, back('Playbook', '#/playbook'),
    h('div', { class: 'row sb' }, h('div', {}, h('h1', {}, p.name), h('div', { style: { marginTop: '6px' } }, tagsFor(p))), star),
    p.general && p.purpose === 'offense' ? h('p', { class: 'small muted' }, 'General play: works against any defense.' + (matched.length ? ' Especially strong against ' + phraseFor(p.exploits) + '.' : '')) : p.purpose === 'offense' ? h('p', { class: 'small muted' }, 'Situational play' + (matched.length ? ': designed to exploit ' + phraseFor(p.exploits) + '.' : ': use when the defense gives you this look.')) : null,
    cp.el,
    ...sec('Purpose', h('p', {}, p.goal)),
    ...sec('Ideal player roles', ul(Object.entries(p.roles).map(([k, v]) => `${k}: ${v}`))),
    ...sec('Starting positions', h('p', {}, p.start)),
    ...sec('Step-by-step movements', h('ol', { class: 'steps' }, ...p.steps.map(s => h('li', {}, s.t)), ...(p.reads || []).map(r => h('li', {}, h('b', {}, r.label + ' (' + r.when + '): '), r.steps.map(s => s.t).join(' '))))),
    ...sec('Why the play works', h('p', {}, p.why)),
    ...sec('Defensive reactions to expect', ul(p.expect)),
    ...sec('Adjustments', h('div', {}, ...adj)),
    ...sec('Alternative scoring options', ul(p.alt)),
    ...sec('When it is effective', h('p', {}, p.effective)),
    ...sec('When it might fail', h('p', {}, p.fails)),
    ...sec('Difficulty', h('p', {}, DIFF[p.diff])),
    ...sec('Related lessons', h('div', {}, ...p.lessons.map(l => L[l] && h('a', { class: 'card link', href: `#/lesson/${l}` }, h('h3', {}, L[l].title))))));
}
