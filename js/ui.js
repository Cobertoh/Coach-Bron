import { h, icon } from './util.js';
import { mascotSVG } from './brand.js';
import { ctx } from './ctx.js';
import { catTitle } from './content/index.js';

export const mascot = (o = {}) => h('span', { class: 'mascot-wrap', html: mascotSVG(o), style: { display: 'inline-block', lineHeight: 0 } });

export const back = (label, href) => h('a', { class: 'crumb', href, onclick: e => { if (!href) { e.preventDefault(); history.back(); } } }, icon('back'), label);

export const secHead = (title, linkText, href) => h('div', { class: 'sec' }, h('h2', {}, title), linkText ? h('a', { href }, linkText) : null);

export function empty(title, msg, { mood = 'think', action } = {}) {
  return h('div', { class: 'empty card' }, mascot({ size: 72, mood }), h('h3', { style: { color: 'var(--tx)' } }, title), h('p', { class: 'small', style: { margin: '4px 0 12px' } }, msg),
    action ? h('a', { class: 'btn pri', href: action.href }, action.label) : null);
}

export function lessonRow(l, prog) {
  const p = prog?.[l.id];
  return h('a', { class: 'card link', href: `#/lesson/${l.id}` },
    h('div', { class: 'row sb' }, h('h3', {}, l.title), p?.done ? h('span', { class: 'tag lime' }, 'Done') : p?.viewed ? h('span', { class: 'tag' }, 'In progress') : null),
    h('div', { class: 'small muted' }, catTitle(l.cat) + (l.sub ? ' · ' + l.sub : '')));
}

export function chipSelect({ options, value, multi = false, exclusive = null, onChange }) {
  const sel = new Set(multi ? value || [] : value ? [value] : []);
  const box = h('div', { class: 'chips' });
  const draw = () => {
    box.replaceChildren(...options.map(o => {
      const id = o.id ?? o, label = o.label ?? o;
      return h('button', { type: 'button', class: 'chip' + (sel.has(id) ? ' on' : ''), 'aria-pressed': sel.has(id), onclick: () => {
        if (multi) {
          if (sel.has(id)) sel.delete(id);
          else { if (exclusive != null) { if (id === exclusive) sel.clear(); else sel.delete(exclusive); } sel.add(id); }
        } else { sel.clear(); sel.add(id); }
        draw(); onChange(multi ? [...sel] : [...sel][0]);
      } }, label);
    }));
  };
  draw(); return box;
}

export const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced', 'Competitive'];
export const ENVIRONMENT = ['Pickup basketball', 'Recreational', 'School basketball', 'Competitive basketball', 'Multiple environments'];
export const FORMATS = ['1v1', '3v3', '5v5', 'All formats'];
export const INTERESTS = [
  { id: 'shooting', label: 'Shooting' }, { id: 'handling', label: 'Ball handling' }, { id: 'finishing', label: 'Finishing' }, { id: 'passing', label: 'Passing' },
  { id: 'defense', label: 'Defense' }, { id: 'iq', label: 'Basketball IQ' }, { id: 'overall', label: 'Overall improvement' },
];
export const POSITIONS = ['Point guard', 'Shooting guard', 'Small forward', 'Power forward', 'Center', 'Not sure'];

// Used by onboarding and by Profile > Preferences, so editing later shows the same fields.
export function prefsForm(p, onChange) {
  const st = { ...p };
  const f = (label, node) => h('div', { class: 'field' }, h('label', {}, label), node);
  const up = k => v => { st[k] = v; onChange(st); };
  return h('div', {},
    f('Experience level', chipSelect({ options: EXPERIENCE, value: st.experience, onChange: up('experience') })),
    f('Where do you play?', chipSelect({ options: ENVIRONMENT, value: st.environment, onChange: up('environment') })),
    f('Preferred format', chipSelect({ options: FORMATS, value: st.format, onChange: up('format') })),
    f('What do you want to work on?', chipSelect({ options: INTERESTS, value: st.interests, multi: true, onChange: up('interests') })),
    h('h4', { style: { margin: '20px 0 10px' } }, 'Optional'),
    f('Preferred position', chipSelect({ options: POSITIONS, value: st.position, onChange: up('position') })),
    f('Dominant hand', chipSelect({ options: ['Right', 'Left', 'Both'], value: st.hand, onChange: up('hand') })),
    f('Strengths (free text)', h('input', { type: 'text', value: st.strengths || '', maxlength: 120, placeholder: 'For example: spot-up shooting', oninput: e => up('strengths')(e.target.value) })),
    f('Want to improve (free text)', h('input', { type: 'text', value: st.improve || '', maxlength: 120, placeholder: 'For example: left hand', oninput: e => up('improve')(e.target.value) })));
}
export { ctx };
