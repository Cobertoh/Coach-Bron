import { h, icon, ICONS } from './util.js';
import { ctx } from './ctx.js';
import { dbReady } from './db.js';
import * as auth from './auth.js';
import { setUser } from './store.js';
import { mascotSVG } from './brand.js';
import * as authV from './views/auth.js';
import * as home from './views/home.js';
import * as learn from './views/learn.js';
import * as players from './views/players.js';
import * as playbook from './views/playbook.js';
import * as analyze from './views/analyze.js';
import * as tracking from './views/tracking.js';
import * as profile from './views/profile.js';
import * as searchV from './views/search.js';
import { empty } from './ui.js';

const TABS = [['home', 'Home'], ['learn', 'Learn'], ['playbook', 'Playbook'], ['analyze', 'Analyze'], ['tracking', 'Tracking']];
const TAB_OF = { home: 'home', learn: 'learn', lesson: 'learn', drill: 'learn', glossary: 'learn', term: 'learn', players: 'learn', player: 'learn', playbook: 'playbook', play: 'playbook', analyze: 'analyze', tracking: 'tracking', track: 'tracking' };

const ROUTES = [
  [/^home$/, () => home.render()],
  [/^learn$/, () => learn.home()],
  [/^learn\/([a-z]+)\/(pickup)$/, (m) => learn.category(m[1], m[2])],
  [/^learn\/([a-z]+)$/, (m) => learn.category(m[1])],
  [/^lesson\/([\w-]+)$/, (m) => learn.lesson(m[1])],
  [/^drill\/([\w-]+)$/, (m) => learn.drill(m[1])],
  [/^glossary$/, () => learn.glossaryPage()],
  [/^term\/([\w-]+)$/, (m) => learn.term(m[1])],
  [/^players$/, () => players.list()],
  [/^player\/([\w-]+)$/, (m) => players.profile(m[1])],
  [/^playbook$/, () => playbook.home()],
  [/^play\/([\w-]+)$/, (m) => playbook.playPage(m[1])],
  [/^analyze$/, () => analyze.home()],
  [/^analyze\/result\/([\w-]+)$/, (m) => analyze.resultPage(m[1])],
  [/^analyze\/([a-z]+)$/, (m, q) => analyze.session(m[1], q)],
  [/^tracking$/, () => tracking.home()],
  [/^tracking\/new$/, (m, q) => tracking.newWorkout(null, q)],
  [/^tracking\/new\/([\w:-]+)$/, (m, q) => tracking.newWorkout(m[1], q)],
  [/^track\/live$/, () => tracking.live()],
  [/^track\/session\/([\w-]+)$/, (m, q) => tracking.sessionPage(m[1], q)],
  [/^search$/, (m, q) => searchV.render(q)],
  [/^profile$/, () => profile.render()],
];

const app = document.getElementById('app');
let token = 0;

function ensureShell() {
  if (document.getElementById('view')) return;
  app.replaceChildren(
    h('header', { class: 'hdr', id: 'hdr' },
      h('div', { class: 'brand', onclick: () => ctx.go('#/home'), html: `<span style="display:inline-block;width:34px;height:34px;margin-top:-2px">${mascotSVG({ size: 34, float: false })}</span><span>Coach Bron</span>` }),
      h('div', { class: 'sp' }),
      h('button', { class: 'icon-btn', 'aria-label': 'Search', onclick: () => ctx.go('#/search'), html: ICONS.search }),
      h('button', { class: 'icon-btn', 'aria-label': 'Profile and settings', onclick: () => ctx.go('#/profile'), html: ICONS.user })),
    h('main', { id: 'view' }),
    h('nav', { class: 'tabs', id: 'tabs', 'aria-label': 'Main' }, ...TABS.map(([id, label]) => h('a', { href: `#/${id}`, 'data-tab': id, html: ICONS[id] + `<span>${label}</span>` }))));
}

async function route() {
  const my = ++token;
  ctx.cleanup.splice(0).forEach(fn => { try { fn(); } catch {} });
  if (!ctx.user) { return; }
  ctx.hideNav = false;
  ensureShell();
  const raw = (location.hash || '#/home').slice(1).replace(/^\//, '') || 'home';
  const [path, query] = raw.split('?');
  const view = document.getElementById('view');
  let node = null;
  for (const [re, fn] of ROUTES) {
    const m = path.match(re);
    if (m) {
      try { node = await fn(m, query); }
      catch (e) { console.error(e); node = h('div', { class: 'page' }, empty('Something went wrong', e.message || String(e), { mood: 'think', action: { label: 'Back to Home', href: '#/home' } })); }
      break;
    }
  }
  if (my !== token) return;
  if (!node) node = h('div', { class: 'page' }, empty('Page not found', 'That page does not exist.', { action: { label: 'Home', href: '#/home' } }));
  view.replaceChildren(node); view.scrollTop = 0;
  const tab = TAB_OF[path.split('/')[0]];
  document.querySelectorAll('#tabs a').forEach(a => { const on = a.dataset.tab === tab; a.classList.toggle('on', on); on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'); });
  const full = ctx.hideNav;
  document.getElementById('tabs').style.display = full ? 'none' : '';
  document.getElementById('hdr').style.display = full ? 'none' : '';
  view.classList.toggle('nonav', full);
}
ctx.route = route;

window.addEventListener('hashchange', route);

async function boot() {
  try { await dbReady(); }
  catch (e) { app.replaceChildren(h('div', { class: 'full welcome' }, h('h1', {}, 'Storage unavailable'), h('p', { class: 'muted' }, 'Coach Bron stores your data on this device and your browser is blocking it (private browsing can do this). ' + e.message))); return; }
  if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) navigator.serviceWorker.register('sw.js').catch(() => {});
  ctx.user = await auth.currentUser();
  if (!ctx.user) { authV.welcome(); return; }
  setUser(ctx.user.username);
  const { prefs } = await import('./store.js');
  const p = await prefs.get();
  if (!p.onboardingDone && !p.onboardingSkipped && !sessionStorage.getItem('cb_ob')) { sessionStorage.setItem('cb_ob', '1'); authV.onboarding(false); return; }
  if (!location.hash) location.hash = '#/home';
  route();
}
// After sign-in the auth views call ctx.rerender(), which fires hashchange -> route().
boot();
