// Talks to the Coach Bron cloud API (Cloudflare Pages Function at /api). Falls back to device-only accounts
// when the site has no API/database configured, so the app still works anywhere.
const TOKEN = 'cb_ctoken', USER = 'cb_cuser', MODE = 'cb_mode';
let mode = null;

export const token = () => localStorage.getItem(TOKEN);
export const cachedUser = () => { try { return JSON.parse(localStorage.getItem(USER) || 'null'); } catch { return null; } };
export function saveSession(r) { localStorage.setItem(TOKEN, r.token); localStorage.setItem(USER, JSON.stringify({ username: r.username, display: r.display || r.username })); }
export function clearSession() { localStorage.removeItem(TOKEN); localStorage.removeItem(USER); }

// 'cloud' when /api/health answers with a database, otherwise 'local'. Offline: reuse the last known answer.
export async function detect() {
  if (mode) return mode;
  try {
    const ctl = new AbortController(); const tm = setTimeout(() => ctl.abort(), 4000);
    const r = await fetch('api/health', { cache: 'no-store', signal: ctl.signal }); clearTimeout(tm);
    const j = (r.headers.get('content-type') || '').includes('json') ? await r.json() : null;
    mode = j?.ok && j.db ? 'cloud' : 'local';
    localStorage.setItem(MODE, mode);
  } catch { mode = localStorage.getItem(MODE) || (token() ? 'cloud' : 'local'); }
  return mode;
}
export const currentMode = () => mode || localStorage.getItem(MODE) || 'local';

export class ApiError extends Error { constructor(msg, status, code) { super(msg); this.status = status; this.code = code; } }
export async function api(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'content-type': 'application/json' };
  if (auth && token()) headers.authorization = 'Bearer ' + token();
  let r;
  try { r = await fetch('api/' + path, { method, headers, body: body ? JSON.stringify(body) : undefined, cache: 'no-store' }); }
  catch { throw new ApiError('No internet connection. Connect and try again.', 0, 'offline'); }
  let j = null; try { j = await r.json(); } catch { }
  if (!r.ok) throw new ApiError(j?.error || `Server error (${r.status})`, r.status, j?.code);
  return j;
}
