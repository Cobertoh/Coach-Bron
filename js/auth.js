// Local account system. Passwords are never stored: PBKDF2-SHA256 (WebCrypto) with a per-user random salt.
// Accounts exist only on this device. Recovery uses a one-time recovery code shown at sign-up (stored hashed).
import { get, put, del, deleteUserData, countStore } from './db.js';

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

export async function register(username, password) {
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

export async function login(username, password) {
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

export async function resetWithRecovery(username, code, newPassword) {
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

export async function changePassword(username, oldPw, newPw) {
  const e = validatePassword(newPw); if (e) throw new Error(e);
  const u = await get('users', username);
  if (!eq(await derive(oldPw, unhex(u.salt), u.iter || ITER), unhex(u.hash))) throw new Error('Current password is wrong.');
  const salt = rand(16); u.salt = hex(salt); u.hash = hex(await derive(newPw, salt)); u.iter = ITER;
  await put('users', u);
}

export async function currentUser() {
  const token = localStorage.getItem(TOKEN_KEY); if (!token) return null;
  const s = await get('sessions', token);
  if (!s || s.exp < Date.now()) { localStorage.removeItem(TOKEN_KEY); if (s) await del('sessions', token); return null; }
  const u = await get('users', s.uid); if (!u) return null;
  return { username: u.username, display: u.display };
}
export async function logout() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) await del('sessions', token);
  localStorage.removeItem(TOKEN_KEY);
}
export async function deleteAccount(username, password) {
  const u = await get('users', username);
  if (!eq(await derive(password, unhex(u.salt), u.iter || ITER), unhex(u.hash))) throw new Error('Password is wrong.');
  await deleteUserData(username); localStorage.removeItem(TOKEN_KEY);
}
