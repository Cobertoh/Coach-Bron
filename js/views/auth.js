import { h, toast } from '../util.js';
import * as auth from '../auth.js';
import { prefs, setUser } from '../store.js';
import { mascot, prefsForm } from '../ui.js';
import { ctx } from '../ctx.js';

const root = () => document.getElementById('app');
function show(node) { root().replaceChildren(node); }

export function welcome() {
  ctx.hideNav = true;
  show(h('div', { class: 'full welcome page' },
    mascot({ size: 150, mood: 'wink' }),
    h('h1', {}, 'Coach Bron'),
    h('p', { class: 'muted', style: { maxWidth: '300px' } }, 'Your personal basketball coach in your pocket. Learn, study plays, analyze your technique and track real improvement.'),
    h('div', { style: { height: '10px' } }),
    h('button', { class: 'btn pri block', onclick: () => signup() }, 'Create account'),
    h('button', { class: 'btn block', onclick: () => signin() }, 'Sign in'),
    h('p', { class: 'tiny muted', style: { marginTop: '18px', maxWidth: '300px' } }, 'Only a username and password. No email, no personal information. Your data is stored on this device. Original mascot, not affiliated with any player or league.')));
}

function shell(title, sub, ...kids) {
  return h('div', { class: 'full page' },
    h('a', { class: 'crumb', href: '#', onclick: e => { e.preventDefault(); welcome(); } }, '‹ Back'),
    h('div', { class: 'row' }, mascot({ size: 56, float: false, mood: 'smile' }), h('div', {}, h('h1', {}, title), h('div', { class: 'muted small' }, sub))),
    h('div', { style: { height: '14px' } }), ...kids);
}
function err(box, e) { box.textContent = e.message || String(e); box.style.display = 'block'; }
const errBox = () => h('div', { class: 'bad small', style: { display: 'none', margin: '0 0 12px' }, role: 'alert' });

async function enter(username) {
  setUser(username); ctx.user = await auth.currentUser(); ctx.hideNav = false;
}

export function signin() {
  ctx.hideNav = true;
  const storageNote = h('p', { class: 'tiny muted', style: { marginTop: '14px' } });
  const u = h('input', { type: 'text', autocomplete: 'username', autocapitalize: 'none', autocorrect: 'off', placeholder: 'Username' });
  const p = h('input', { type: 'password', autocomplete: 'current-password', placeholder: 'Password' });
  const e = errBox(); const btn = h('button', { class: 'btn pri block', type: 'submit' }, 'Sign in');
  show(shell('Welcome back', 'Sign in to continue',
    h('form', { onsubmit: async ev => {
      ev.preventDefault(); e.style.display = 'none'; btn.disabled = true;
      try { const r = await auth.login(u.value.trim(), p.value); await enter(r.username); const go = () => { location.hash = '#/home'; ctx.rerender(); }; if (r.recoveryCode) { toast('Your account now works on every device', 3500); showRecovery(r.recoveryCode, go); } else go(); }
      catch (x) { err(e, x); } finally { btn.disabled = false; }
    } },
    h('div', { class: 'field' }, h('label', {}, 'Username'), u), h('div', { class: 'field' }, h('label', {}, 'Password'), p), e, btn),
    h('button', { class: 'btn ghost block', style: { marginTop: '10px' }, onclick: () => recover() }, 'Forgot password? Use my recovery code'),
    h('button', { class: 'btn ghost block', onclick: () => signup() }, 'Create an account'), storageNote));
  auth.mode().then(async m => {
    if (m === 'cloud') { storageNote.textContent = 'Your account works on any device: sign in with the same username and password. Accounts made earlier on this device move to the cloud when you sign in here.'; return; }
    const n = await auth.accountCount();
    storageNote.textContent = (n ? `${n} account${n > 1 ? 's' : ''} saved in this browser. ` : 'No accounts are saved in this browser yet. ') + 'Cloud accounts are not set up on this site, so accounts only work in the browser where they were made.';
  }).catch(() => {});
}

export function signup() {
  ctx.hideNav = true;
  const u = h('input', { type: 'text', autocomplete: 'username', autocapitalize: 'none', autocorrect: 'off', placeholder: 'Choose a username', maxlength: 20 });
  const p = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'At least 8 characters' });
  const e = errBox(); const btn = h('button', { class: 'btn pri block', type: 'submit' }, 'Create account');
  show(shell('Create account', 'Username and password only',
    h('form', { onsubmit: async ev => {
      ev.preventDefault(); e.style.display = 'none'; btn.disabled = true;
      try { const r = await auth.register(u.value.trim(), p.value); await enter(r.username); showRecovery(r.recoveryCode, () => onboarding(true)); }
      catch (x) { err(e, x); } finally { btn.disabled = false; }
    } },
    h('div', { class: 'field' }, h('label', {}, 'Username'), u), h('div', { class: 'field' }, h('label', {}, 'Password'), p), e, btn),
    h('p', { class: 'tiny muted', style: { marginTop: '14px' } }, 'Accounts live on this device. There is no email, so you will get a one-time recovery code on the next screen. Keep it somewhere safe.'),
    h('button', { class: 'btn ghost block', onclick: () => signin() }, 'I already have an account')));
}

export function showRecovery(code, next) {
  ctx.hideNav = true;
  show(h('div', { class: 'full page' },
    h('h1', {}, 'Save your recovery code'),
    h('p', { class: 'muted', style: { margin: '8px 0 16px' } }, 'This is the only way to reset your password, because Coach Bron does not collect an email. It is shown once and stored only as a hash.'),
    h('div', { class: 'card', style: { textAlign: 'center', fontSize: '24px', fontWeight: 800, letterSpacing: '.08em', color: 'var(--lime)', userSelect: 'all' } }, code),
    h('button', { class: 'btn block', onclick: async () => { try { await navigator.clipboard.writeText(code); toast('Copied'); } catch { toast('Select the code and copy it'); } } }, 'Copy code'),
    h('div', { style: { flex: 1 } }),
    h('button', { class: 'btn pri block', style: { marginTop: '16px' }, onclick: next }, 'I saved it')));
}

export function recover() {
  ctx.hideNav = true;
  const u = h('input', { type: 'text', autocapitalize: 'none', placeholder: 'Username' });
  const c = h('input', { type: 'text', autocapitalize: 'characters', placeholder: 'XXXX-XXXX-XXXX-XXXX' });
  const p = h('input', { type: 'password', autocomplete: 'new-password', placeholder: 'New password' });
  const e = errBox(); const btn = h('button', { class: 'btn pri block', type: 'submit' }, 'Reset password');
  show(shell('Reset password', 'Use the recovery code from sign-up',
    h('form', { onsubmit: async ev => {
      ev.preventDefault(); e.style.display = 'none'; btn.disabled = true;
      try { const r = await auth.resetWithRecovery(u.value.trim(), c.value, p.value); await enter(r.username); showRecovery(r.recoveryCode, () => { location.hash = '#/home'; ctx.rerender(); }); }
      catch (x) { err(e, x); } finally { btn.disabled = false; }
    } },
    h('div', { class: 'field' }, h('label', {}, 'Username'), u), h('div', { class: 'field' }, h('label', {}, 'Recovery code'), c), h('div', { class: 'field' }, h('label', {}, 'New password'), p), e, btn),
    h('p', { class: 'tiny muted', style: { marginTop: '12px' } }, 'If you lost the code there is no other way to recover the account, since no email is stored. You can create a new account instead.')));
}

export function onboarding(first) {
  ctx.hideNav = true;
  let state = {}; let step = 0;
  const finish = async (skipped) => {
    await prefs.set({ ...state, onboardingDone: !skipped, onboardingSkipped: !!skipped }); ctx.hideNav = false;
    location.hash = '#/home'; ctx.rerender();
  };
  const body = h('div', {});
  const draw = () => {
    body.replaceChildren(prefsForm(state, s => { state = s; }));
  };
  draw();
  show(h('div', { class: 'full page' },
    h('div', { class: 'row sb' }, h('h1', {}, 'Make it yours'), h('button', { class: 'btn ghost', style: { minHeight: '40px' }, onclick: () => finish(true) }, 'Skip')),
    h('p', { class: 'muted', style: { margin: '6px 0 16px' } }, 'Optional. This only changes what Coach Bron recommends first. Everything stays open to you, and you can edit this later in your profile.'),
    body,
    h('button', { class: 'btn pri block', style: { marginTop: '8px' }, onclick: () => finish(false) }, 'Save and start'),
    h('button', { class: 'btn ghost block', style: { marginTop: '6px' }, onclick: () => finish(true) }, 'Skip for now')));
}
