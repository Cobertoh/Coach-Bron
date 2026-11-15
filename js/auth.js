// Accounts. With the cloud API (Cloudflare D1) available, accounts live on the server and work on any device;
// the user's data is cached in IndexedDB and synced (js/sync.js). Without it, the original device-only accounts are used.
// Passwords are never stored: PBKDF2-SHA256 with a per-user salt. Recovery uses a one-time code (stored hashed).
import { get, put, del, deleteUserData, countStore } from './db.js';
import * as cloud from './cloud.js';
import * as sync from './sync.js';

const ITER = 210000;
const TOKEN_KEY = 'cb_token';
const FAIL_KEY = 'cb_fail';
const SESSION_DAYS = 30;
const enc = new TextEncoder();
const hex = b => [...b].map(x => x.toString(16).padStart(2, '0')).join('');
const unhex = s => new Uint8Array(s.match(/../g).map(x => parseInt(x, 16)));

function needCrypto() {
  if (!globalThis.crypto?.subtle) throw new Error('Secure storage needs https (or localhost). Open Coach Bron from a secure address.');
}
async function derive(secret, salt, iter = ITER) {
  needCrypto();
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, k, 256));
}
function eq(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i]; return d === 0; }
const rand = n => crypto.getRandomValues(new Uint8Array(n));

function recoveryCode() {
  const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; const r = rand(16);
  const c = [...r].map(x => A[x % A.length]).join('');
  return c.match(/.{4}/g).join('-');
}
const normCode = c => c.toUpperCase().replace(/[^A-Z0-9]/g, '');

export function validateUsername(u) {
  if (!/^[a-zA-Z0-9_.]{3,20}$/.test(u)) return 'Username must be 3–20 characters: letters, numbers, _ or .';
  return null;
}
export function validatePassword(p) {
  if (p.length < 8) return 'Password must be at least 8 characters.';
  return null;
}

async function startSession(username) {
  try { navigator.storage?.persist?.(); } catch { } // ask the browser not to evict account data
  const token = hex(rand(32));
  await put('sessions', { token, uid: username, exp: Date.now() + SESSION_DAYS * 864e5 });
  localStorage.setItem(TOKEN_KEY, token);
}

function checkLock() {
  try {
    const f = JSON.parse(localStorage.getItem(FAIL_KEY) || '{}');
    if (f.until && f.until > Date.now()) throw new Error(`Too many attempts. Try again in ${Math.ceil((f.until - Date.now()) / 1000)}s.`);
  } catch (e) { if (e.message.startsWith('Too many')) throw e; }
}
function noteFail() {
  const f = JSON.parse(localStorage.getItem(FAIL_KEY) || '{"n":0}'); f.n = (f.n || 0) + 1;
  if (f.n >= 5) { f.until = Date.now() + 30000; f.n = 0; }
  localStorage.setItem(FAIL_KEY, JSON.stringify(f));
}
const clearFail = () => localStorage.removeItem(FAIL_KEY);

async function local_register(username, password) {
  let e = validateUsername(username) || validatePassword(password); if (e) throw new Error(e);
  const key = username.toLowerCase();
  if (await get('users', key)) throw new Error('That username is taken on this device.');
  const salt = rand(16), rsalt = rand(16), code = recoveryCode();
  const hash = await derive(password, salt);
  const rhash = await derive(normCode(code), rsalt);
  await put('users', { username: key, display: username, salt: hex(salt), hash: hex(hash), iter: ITER, rsalt: hex(rsalt), rhash: hex(rhash), created: Date.now() });
  await startSession(key);
  return { username: key, recoveryCode: code };
}

export async function accountCount() { return countStore('users'); }

async function local_login(username, password) {
  checkLock();
  const u = await get('users', username.toLowerCase());
  // Always run a derivation so timing doesn't reveal whether the username exists.
  const hash = await derive(password, u ? unhex(u.salt) : rand(16), u?.iter || ITER);
  // Accounts live only in this browser's storage, so saying "no such account here" leaks nothing new and explains the most common problem.
  if (!u) { noteFail(); throw new Error(`There is no account named "${username}" saved in this browser. Accounts are stored on the device, and Safari and the Home Screen app keep separate storage.`); }
  if (!eq(hash, unhex(u.hash))) { noteFail(); throw new Error('Wrong password for this account.'); }
  clearFail(); await startSession(u.username);
  return { username: u.username };
}

async function local_resetWithRecovery(username, code, newPassword) {
  checkLock();
  const e = validatePassword(newPassword); if (e) throw new Error(e);
  const u = await get('users', username.toLowerCase());
  const ok = u && eq(await derive(normCode(code), unhex(u.rsalt), u.iter || ITER), unhex(u.rhash));
  if (!ok) { noteFail(); throw new Error('Username or recovery code is not correct.'); }
  clearFail();
  const salt = rand(16), rsalt = rand(16), newCode = recoveryCode();
  u.salt = hex(salt); u.hash = hex(await derive(newPassword, salt));
  u.rsalt = hex(rsalt); u.rhash = hex(await derive(normCode(newCode), rsalt)); u.iter = ITER;
  await put('users', u); await startSession(u.username);
  return { username: u.username, recoveryCode: newCode };
}

async function local_changePassword(username, oldPw, newPw) {
  const e = validatePassword(newPw); if (e) throw new Error(e);
  const u = await get('users', username);
  if (!eq(await derive(oldPw, unhex(u.salt), u.iter || ITER), unhex(u.hash))) throw new Error('Current password is wrong.');
  const salt = rand(16); u.salt = hex(salt); u.hash = hex(await derive(newPw, salt)); u.iter = ITER;
  await put('users', u);
}

async function local_currentUser() {
  const token = localStorage.getItem(TOKEN_KEY); if (!token) return null;
  const s = await get('sessions', token);
  if (!s || s.exp < Date.now()) { localStorage.removeItem(TOKEN_KEY); if (s) await del('sessions', token); return null; }
  const u = await get('users', s.uid); if (!u) return null;
  return { username: u.username, display: u.display };
}
async function local_logout() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) await del('sessions', token);
  localStorage.removeItem(TOKEN_KEY);
}
async function local_deleteAccount(username, password) {
  const u = await get('users', username);
  if (!eq(await derive(password, unhex(u.salt), u.iter || ITER), unhex(u.hash))) throw new Error('Password is wrong.');
  await deleteUserData(username); localStorage.removeItem(TOKEN_KEY);
}

// ---------- public API: cloud when available, device-only otherwise ----------
export const mode = () => cloud.detect();
const startSync = async (u, { all = false } = {}) => { sync.start(u); if (all) await sync.markAllDirty(); await Promise.race([sync.syncNow(), new Promise(r => setTimeout(r, 4000))]); };

export async function register(username, password) {
  if (await cloud.detect() !== 'cloud') return local_register(username, password);
  const e = validateUsername(username) || validatePassword(password); if (e) throw new Error(e);
  const r = await cloud.api('register', { method: 'POST', body: { username, password }, auth: false });
  cloud.saveSession(r); await startSync(r.username);
  return { username: r.username, recoveryCode: r.recoveryCode };
}

export async function login(username, password) {
  if (await cloud.detect() !== 'cloud') return local_login(username, password);
  try {
    const r = await cloud.api('login', { method: 'POST', body: { username, password }, auth: false });
    cloud.saveSession(r); await startSync(r.username);
    return { username: r.username };
  } catch (e) {
    // An account that was made on this device before cloud accounts existed: move it to the cloud with its data.
    if (e.code !== 'no_account') throw e;
    const lu = await get('users', username.toLowerCase());
    if (!lu || !eq(await derive(password, unhex(lu.salt), lu.iter || ITER), unhex(lu.hash))) throw new Error('Wrong username or password.');
    let r;
    try { r = await cloud.api('register', { method: 'POST', body: { username: lu.display || lu.username, password }, auth: false }); }
    catch (x) { if (x.status === 409) throw new Error('That username is already used by another cloud account. Sign in with a new username, then restore a backup.'); throw x; }
    cloud.saveSession(r); await startSync(r.username, { all: true });
    await del('users', lu.username).catch(() => {});
    return { username: r.username, recoveryCode: r.recoveryCode, migrated: true };
  }
}

export async function resetWithRecovery(username, code, newPassword) {
  if (await cloud.detect() !== 'cloud') return local_resetWithRecovery(username, code, newPassword);
  const e = validatePassword(newPassword); if (e) throw new Error(e);
  const r = await cloud.api('recover', { method: 'POST', body: { username, code, newPassword }, auth: false });
  cloud.saveSession(r); await startSync(r.username);
  return { username: r.username, recoveryCode: r.recoveryCode };
}

export async function changePassword(username, oldPw, newPw) {
  if (cloud.currentMode() !== 'cloud' || !cloud.token()) return local_changePassword(username, oldPw, newPw);
  const e = validatePassword(newPw); if (e) throw new Error(e);
  await cloud.api('password', { method: 'POST', body: { oldPassword: oldPw, newPassword: newPw } });
}

// Works offline: the session is trusted locally and checked with the server in the background.
export async function currentUser() {
  const m = await cloud.detect();
  if (cloud.token()) {
    const u = cloud.cachedUser(); if (!u) { cloud.clearSession(); return null; }
    sync.start(u.username);
    if (m === 'cloud') cloud.api('me').catch(e => { if (e.status === 401) window.dispatchEvent(new Event('cb-signed-out')); });
    return u;
  }
  if (m === 'cloud') return null; // old device-only session: signing in moves that account to the cloud
  return local_currentUser();
}
export const initialSync = () => Promise.race([sync.syncNow(), new Promise(r => setTimeout(r, 3000))]);

export async function logout() {
  if (!cloud.token()) return local_logout();
  const u = cloud.cachedUser();
  let flushed = false;
  try { await sync.push(); flushed = true; } catch { }
  try { await cloud.api('logout', { method: 'POST' }); } catch { }
  sync.stop(); cloud.clearSession();
  // The cloud has the data now, so don't leave it on a possibly shared device. Unsent changes stay until next sign-in.
  if (u && flushed) { await deleteUserData(u.username); sync.forget(u.username); }
}

export async function deleteAccount(username, password) {
  if (!cloud.token()) return local_deleteAccount(username, password);
  await cloud.api('delete', { method: 'POST', body: { password } });
  sync.stop(); await deleteUserData(username); sync.forget(username); cloud.clearSession();
}
