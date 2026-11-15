// Coach Bron cloud API (Cloudflare Pages Function + D1). Bind a D1 database to the Pages project as `DB`.
// Accounts: username + password only. Passwords are hashed with PBKDF2-SHA256 (100k iterations, the Workers maximum)
// and a per-user salt. Session tokens are random and stored only as SHA-256 hashes. Tables are created automatically.
const ITER = 100000;
const SESSION_DAYS = 30;
const MAX_BODY = 2_000_000, MAX_RECORD = 200_000;
const enc = new TextEncoder();
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const unhex = s => new Uint8Array(s.match(/../g).map(x => parseInt(x, 16)));
const rand = n => crypto.getRandomValues(new Uint8Array(n));

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, display TEXT NOT NULL, salt TEXT NOT NULL, hash TEXT NOT NULL, iter INTEGER NOT NULL, rsalt TEXT NOT NULL, rhash TEXT NOT NULL, created INTEGER NOT NULL)`,
  `CREATE TABLE IF NOT EXISTS sessions (token_hash TEXT PRIMARY KEY, username TEXT NOT NULL, exp INTEGER NOT NULL)`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(username)`,
  `CREATE TABLE IF NOT EXISTS records (username TEXT NOT NULL, id TEXT NOT NULL, type TEXT, data TEXT, updated INTEGER NOT NULL, deleted INTEGER NOT NULL DEFAULT 0, srv INTEGER NOT NULL, PRIMARY KEY (username, id))`,
  `CREATE INDEX IF NOT EXISTS records_srv ON records(username, srv)`,
  `CREATE TABLE IF NOT EXISTS fails (k TEXT PRIMARY KEY, n INTEGER NOT NULL, win INTEGER NOT NULL, lock INTEGER NOT NULL)`,
];
let ready = null;
const init = db => (ready ||= db.batch(SCHEMA.map(q => db.prepare(q))).catch(e => { ready = null; throw e; }));

const json = (obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
const fail = (status, error, extra = {}) => json({ error, ...extra }, status);

async function derive(secret, salt, iter = ITER) {
  const k = await crypto.subtle.importKey('raw', enc.encode(secret), 'PBKDF2', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: iter }, k, 256));
}
const sha = async s => hex(await crypto.subtle.digest('SHA-256', enc.encode(s)));
function eq(a, b) { if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a[i] ^ b[i]; return d === 0; }
function recoveryCode() { const A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; return [...rand(16)].map(x => A[x % A.length]).join('').match(/.{4}/g).join('-'); }
const normCode = c => String(c || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
const validUser = u => /^[a-zA-Z0-9_.]{3,20}$/.test(u || '');
const validPw = p => typeof p === 'string' && p.length >= 8 && p.length <= 200;

// Brute-force protection: 5 failures per username lock it for 5 minutes; 30 per IP per 5 minutes.
async function checkLock(db, keys) {
  const now = Date.now();
  for (const k of keys) { const r = await db.prepare('SELECT lock FROM fails WHERE k = ?').bind(k).first(); if (r && r.lock > now) return Math.ceil((r.lock - now) / 1000); }
  return 0;
}
async function noteFail(db, k, limit) {
  const now = Date.now(), W = 300000, r = await db.prepare('SELECT n, win FROM fails WHERE k = ?').bind(k).first();
  const n = r && r.win > now ? r.n + 1 : 1, win = r && r.win > now ? r.win : now + W;
  const lock = n >= limit ? now + W : 0;
  await db.prepare('INSERT INTO fails (k, n, win, lock) VALUES (?, ?, ?, ?) ON CONFLICT(k) DO UPDATE SET n = excluded.n, win = excluded.win, lock = excluded.lock').bind(k, lock ? 0 : n, lock ? now : win, lock).run();
}
const clearFail = (db, k) => db.prepare('DELETE FROM fails WHERE k = ?').bind(k).run();

async function newSession(db, username) {
  const token = hex(rand(32));
  await db.prepare('INSERT INTO sessions (token_hash, username, exp) VALUES (?, ?, ?)').bind(await sha(token), username, Date.now() + SESSION_DAYS * 864e5).run();
  return token;
}
async function auth(db, req) {
  const m = (req.headers.get('authorization') || '').match(/^Bearer ([a-f0-9]{64})$/); if (!m) return null;
  const th = await sha(m[1]);
  const s = await db.prepare('SELECT username, exp FROM sessions WHERE token_hash = ?').bind(th).first();
  if (!s || s.exp < Date.now()) { if (s) await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(th).run(); return null; }
  if (s.exp - Date.now() < 15 * 864e5) await db.prepare('UPDATE sessions SET exp = ? WHERE token_hash = ?').bind(Date.now() + SESSION_DAYS * 864e5, th).run();
  const u = await db.prepare('SELECT username, display FROM users WHERE username = ?').bind(s.username).first();
  return u ? { ...u, th } : null;
}
async function body(req) {
  const len = +req.headers.get('content-length') || 0; if (len > MAX_BODY) throw Object.assign(new Error('too_large'), { status: 413 });
  const t = await req.text(); if (t.length > MAX_BODY) throw Object.assign(new Error('too_large'), { status: 413 });
  try { return JSON.parse(t || '{}'); } catch { throw Object.assign(new Error('bad_json'), { status: 400 }); }
}

const routes = {
  'GET health': async (db) => json({ ok: true, db: !!db }),

  'POST register': async (db, req) => {
    const { username, password } = await body(req);
    if (!validUser(username)) return fail(400, 'Username must be 3–20 characters: letters, numbers, _ or .');
    if (!validPw(password)) return fail(400, 'Password must be at least 8 characters.');
    const key = username.toLowerCase();
    if (await db.prepare('SELECT 1 FROM users WHERE username = ?').bind(key).first()) return fail(409, 'That username is already taken.');
    const salt = rand(16), rsalt = rand(16), code = recoveryCode();
    await db.prepare('INSERT INTO users (username, display, salt, hash, iter, rsalt, rhash, created) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(key, username, hex(salt), hex(await derive(password, salt)), ITER, hex(rsalt), hex(await derive(normCode(code), rsalt)), Date.now()).run();
    return json({ token: await newSession(db, key), username: key, display: username, recoveryCode: code });
  },

  'POST login': async (db, req, ip) => {
    const { username, password } = await body(req);
    const key = String(username || '').toLowerCase();
    const wait = await checkLock(db, ['u:' + key, 'ip:' + ip]); if (wait) return fail(429, `Too many attempts. Try again in ${wait}s.`);
    const u = await db.prepare('SELECT * FROM users WHERE username = ?').bind(key).first();
    const hash = await derive(String(password || ''), u ? unhex(u.salt) : rand(16), u?.iter || ITER); // same work either way
    if (!u || !eq(hash, unhex(u.hash))) { await noteFail(db, 'u:' + key, 5); await noteFail(db, 'ip:' + ip, 30); return fail(401, 'Wrong username or password.', { code: u ? 'bad_password' : 'no_account' }); }
    await clearFail(db, 'u:' + key);
    return json({ token: await newSession(db, key), username: key, display: u.display });
  },

  'POST recover': async (db, req, ip) => {
    const { username, code, newPassword } = await body(req);
    const key = String(username || '').toLowerCase();
    if (!validPw(newPassword)) return fail(400, 'Password must be at least 8 characters.');
    const wait = await checkLock(db, ['r:' + key, 'ip:' + ip]); if (wait) return fail(429, `Too many attempts. Try again in ${wait}s.`);
    const u = await db.prepare('SELECT * FROM users WHERE username = ?').bind(key).first();
    const ok = u && eq(await derive(normCode(code), unhex(u.rsalt), u.iter), unhex(u.rhash));
    if (!ok) { await noteFail(db, 'r:' + key, 5); await noteFail(db, 'ip:' + ip, 30); return fail(401, 'Username or recovery code is not correct.'); }
    await clearFail(db, 'r:' + key);
    const salt = rand(16), rsalt = rand(16), newCode = recoveryCode();
    await db.batch([
      db.prepare('UPDATE users SET salt = ?, hash = ?, iter = ?, rsalt = ?, rhash = ? WHERE username = ?').bind(hex(salt), hex(await derive(newPassword, salt)), ITER, hex(rsalt), hex(await derive(normCode(newCode), rsalt)), key),
      db.prepare('DELETE FROM sessions WHERE username = ?').bind(key), // sign out every other device
    ]);
    return json({ token: await newSession(db, key), username: key, display: u.display, recoveryCode: newCode });
  },

  'GET me': async (db, req) => { const u = await auth(db, req); return u ? json({ username: u.username, display: u.display }) : fail(401, 'Signed out'); },

  'POST logout': async (db, req) => { const u = await auth(db, req); if (u) await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(u.th).run(); return json({ ok: true }); },

  'POST password': async (db, req) => {
    const u = await auth(db, req); if (!u) return fail(401, 'Signed out');
    const { oldPassword, newPassword } = await body(req);
    if (!validPw(newPassword)) return fail(400, 'Password must be at least 8 characters.');
    const r = await db.prepare('SELECT salt, hash, iter FROM users WHERE username = ?').bind(u.username).first();
    if (!eq(await derive(String(oldPassword || ''), unhex(r.salt), r.iter), unhex(r.hash))) return fail(401, 'Current password is wrong.');
    const salt = rand(16);
    await db.batch([
      db.prepare('UPDATE users SET salt = ?, hash = ?, iter = ? WHERE username = ?').bind(hex(salt), hex(await derive(newPassword, salt)), ITER, u.username),
      db.prepare('DELETE FROM sessions WHERE username = ? AND token_hash != ?').bind(u.username, u.th),
    ]);
    return json({ ok: true });
  },

  'POST delete': async (db, req) => {
    const u = await auth(db, req); if (!u) return fail(401, 'Signed out');
    const { password } = await body(req);
    const r = await db.prepare('SELECT salt, hash, iter FROM users WHERE username = ?').bind(u.username).first();
    if (!eq(await derive(String(password || ''), unhex(r.salt), r.iter), unhex(r.hash))) return fail(401, 'Password is wrong.');
    await db.batch(['records', 'sessions', 'users'].map(t => db.prepare(`DELETE FROM ${t} WHERE username = ?`).bind(u.username)));
    return json({ ok: true });
  },

  // Sync: per-record last-write-wins using the client's `updated` time; `srv` (server time) drives incremental pulls.
  'GET sync': async (db, req) => {
    const u = await auth(db, req); if (!u) return fail(401, 'Signed out');
    const since = Math.max(0, +new URL(req.url).searchParams.get('since') || 0);
    const now = Date.now();
    const { results } = await db.prepare('SELECT id, type, data, updated, deleted, srv FROM records WHERE username = ? AND srv > ? ORDER BY srv LIMIT 2000').bind(u.username, since).all();
    const more = results.length === 2000;
    return json({ now: more ? results[results.length - 1].srv : now, more, records: results.map(r => ({ id: r.id, type: r.type, data: r.deleted ? null : JSON.parse(r.data), updated: r.updated, deleted: !!r.deleted })) });
  },
  'POST sync': async (db, req) => {
    const u = await auth(db, req); if (!u) return fail(401, 'Signed out');
    const { records = [], deletes = [] } = await body(req);
    const now = Date.now(), prefix = u.username + ':', stmts = [];
    const up = db.prepare(`INSERT INTO records (username, id, type, data, updated, deleted, srv) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(username, id) DO UPDATE SET type = excluded.type, data = excluded.data, updated = excluded.updated, deleted = excluded.deleted, srv = excluded.srv
      WHERE excluded.updated >= records.updated`);
    for (const r of records.slice(0, 1000)) {
      if (typeof r?.id !== 'string' || !r.id.startsWith(prefix) || r.id.length > 200) continue;
      const data = JSON.stringify(r.data ?? null); if (data.length > MAX_RECORD) continue;
      stmts.push(up.bind(u.username, r.id, String(r.type || '').slice(0, 40), data, Math.min(+r.updated || now, now + 60000), 0, now));
    }
    for (const d of deletes.slice(0, 1000)) {
      if (typeof d?.id !== 'string' || !d.id.startsWith(prefix)) continue;
      stmts.push(up.bind(u.username, d.id, null, null, Math.min(+d.at || now, now + 60000), 1, now));
    }
    if (stmts.length) await db.batch(stmts);
    return json({ ok: true, now, accepted: stmts.length });
  },
};

export async function onRequest({ request, env, params }) {
  const path = [].concat(params.route || []).join('/');
  const key = `${request.method} ${path}`;
  const h = routes[key];
  if (!h) return fail(404, 'Not found');
  if (!env.DB) return key === 'GET health' ? json({ ok: true, db: false }) : fail(503, 'Cloud accounts are not set up yet (no D1 database bound as DB).');
  try {
    await init(env.DB);
    return await h(env.DB, request, request.headers.get('cf-connecting-ip') || 'unknown');
  } catch (e) {
    return fail(e.status || 500, e.status ? e.message : 'Server error. Please try again.');
  }
}
