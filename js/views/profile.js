import { h, toast, fmtDate, confirmSheet, sheet } from '../util.js';
import { prefs as P, saved, sessions, analyses, progress, exportAll, importAll, user } from '../store.js';
import * as auth from '../auth.js';
import { L, PY } from '../content/index.js';
import { back, prefsForm, lessonRow, ctx } from '../ui.js';
import { welcome } from './auth.js';
import * as cloud from '../cloud.js';
import * as sync from '../sync.js';

export async function render() {
  const [prefs, sl, fp, ss, an, prog] = await Promise.all([P.get(), saved.lessons(), saved.plays(), sessions.list(), analyses.list(), progress.get()]);
  const el = h('div', { class: 'page' }, back('Back', ''), h('h1', {}, ctx.user.display || ctx.user.username),
    h('div', { class: 'muted small', style: { margin: '2px 0 14px' } }, [prefs.experience, prefs.format, prefs.hand ? prefs.hand + '-handed' : null].filter(Boolean).join(' · ') || 'No preferences set'));
  el.append(h('div', { class: 'stats' }, h('div', { class: 'stat' }, h('b', {}, ss.length), h('span', {}, 'Workouts')), h('div', { class: 'stat' }, h('b', {}, an.length), h('span', {}, 'Analyses')), h('div', { class: 'stat' }, h('b', {}, Object.values(prog).filter(p => p.done).length), h('span', {}, 'Lessons done'))));
  const sec = t => h('h2', { style: { margin: '24px 0 8px' } }, t);

  el.append(sec('Basketball preferences'), h('p', { class: 'small muted' }, 'These only change what is recommended first. Every lesson stays open.'));
  let st = { ...prefs };
  el.append(h('div', { class: 'card' }, prefsForm(prefs, s => { st = s; }), h('button', { class: 'btn pri block', onclick: async () => { await P.set({ ...st, onboardingDone: true }); toast('Preferences saved'); } }, 'Save preferences')));

  el.append(sec('Saved lessons'), ...(sl.length ? sl.map(id => L[id] && lessonRow(L[id], prog)) : [h('div', { class: 'small muted' }, 'Tap the bookmark on a lesson to save it.')]));
  el.append(sec('Favorite plays'), ...(fp.length ? fp.map(id => PY[id] && h('a', { class: 'card link', href: `#/play/${id}` }, h('h3', {}, PY[id].name), h('div', { class: 'small muted' }, PY[id].summary))) : [h('div', { class: 'small muted' }, 'Tap the star on a play to save it.')]));
  el.append(sec('Workout history'), ...(ss.length ? ss.slice(0, 5).map(s => h('a', { class: 'card link', href: `#/track/session/${s.id}` }, h('h3', {}, s.name), h('div', { class: 'small muted' }, `${fmtDate(s.ended)} · ${s.makes}/${s.attempts}`))) : [h('div', { class: 'small muted' }, 'No workouts yet.')]), ss.length > 5 ? h('a', { href: '#/tracking' }, 'See all history →') : null);
  el.append(sec('Analysis history'), ...(an.length ? an.slice(0, 5).map(a => h('a', { class: 'card link', href: `#/analyze/result/${a.id}` }, h('h3', {}, a.techniqueTitle), h('div', { class: 'small muted' }, `${fmtDate(a.at)} · confidence ${a.confidence.label}`))) : [h('div', { class: 'small muted' }, 'No analyses yet.')]));

  // Account & privacy
  const isCloud = !!cloud.token();
  const syncLine = h('p', { class: 'small muted', style: { margin: '6px 0 10px' } });
  const showSync = () => { const s = sync.status; syncLine.textContent = s.error ? `Not synced: ${s.error} Changes are kept on this device and will upload automatically.` : s.lastOk ? `Synced ${new Date(s.lastOk).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}${s.pending ? ` · ${s.pending} change${s.pending > 1 ? 's' : ''} waiting` : ''}` : 'Syncing…'; };
  if (isCloud) { showSync(); const off = sync.onStatus(showSync); setTimeout(() => { if (!syncLine.isConnected) off(); }, 600000); }
  el.append(sec('Privacy and data'), h('div', { class: 'card' }, h('p', { class: 'small' }, isCloud
      ? 'Your account and data (preferences, progress, saved items, workouts, tests and analysis results) are stored on Coach Bron\'s server so you can sign in on any device. Passwords are stored only as salted hashes. Videos are processed on the phone and never uploaded. No tracking or ads.'
      : 'Everything is stored on this device only, because cloud accounts are not set up on this site. Your video is processed on the phone and not saved or uploaded. Use backup to move your data to another device.'),
    isCloud ? syncLine : null,
    isCloud ? h('button', { class: 'btn block', style: { marginBottom: '8px' }, onclick: async () => { syncLine.textContent = 'Syncing…'; await sync.syncNow(); showSync(); toast(sync.status.error ? 'Sync failed' : 'Synced'); } }, 'Sync now') : null,
    h('button', { class: 'btn block', onclick: async () => {
      const blob = new Blob([JSON.stringify(await exportAll())], { type: 'application/json' }); const a = h('a', { href: URL.createObjectURL(blob), download: `coach-bron-${ctx.user.username}.json` }); document.body.append(a); a.click(); a.remove(); toast('Backup downloaded');
    } }, 'Download a backup'),
    h('label', { class: 'btn block', style: { marginTop: '8px' } }, 'Restore from a backup', h('input', { type: 'file', accept: 'application/json,.json', style: { display: 'none' }, onchange: async e => {
      try { const n = await importAll(JSON.parse(await e.target.files[0].text())); toast(`Restored ${n} items`); ctx.rerender(); } catch (x) { toast(x.message || 'Could not read that file', 3500); }
    } }))));

  el.append(sec('Account'), h('div', { class: 'card' },
    h('button', { class: 'btn block', onclick: changePw }, 'Change password'),
    h('button', { class: 'btn block', style: { marginTop: '8px' }, onclick: async () => { await auth.logout(); ctx.user = null; ctx.hideNav = true; welcome(); } }, 'Sign out'),
    h('button', { class: 'btn danger block', style: { marginTop: '8px' }, onclick: del }, 'Delete account and all data')));
  return el;
}

function changePw() {
  const o = h('input', { type: 'password', placeholder: 'Current password', autocomplete: 'current-password' }), n = h('input', { type: 'password', placeholder: 'New password (8+ characters)', autocomplete: 'new-password' });
  const err = h('div', { class: 'bad small', style: { margin: '8px 0' } });
  const sh = sheet([h('h2', {}, 'Change password'), h('div', { class: 'field', style: { marginTop: '12px' } }, o), h('div', { class: 'field' }, n), err,
    h('button', { class: 'btn pri block', onclick: async () => { try { await auth.changePassword(user(), o.value, n.value); sh.close(); toast('Password changed'); } catch (e) { err.textContent = e.message; } } }, 'Save')]);
}
function del() {
  const p = h('input', { type: 'password', placeholder: 'Enter your password to confirm' }); const err = h('div', { class: 'bad small', style: { margin: '8px 0' } });
  const sh = sheet([h('h2', {}, 'Delete account?'), h('p', { class: 'muted small', style: { margin: '8px 0 12px' } }, (cloud.token() ? 'This permanently deletes your account and all its data from the server and this device.' : 'This permanently deletes your account, workouts, analyses and saved items from this device.') + ' It cannot be undone.'), p, err,
    h('button', { class: 'btn danger block', onclick: async () => { try { await auth.deleteAccount(user(), p.value); sh.close(); ctx.user = null; ctx.hideNav = true; welcome(); } catch (e) { err.textContent = e.message; } } }, 'Delete everything')]);
}
