// Mirrors the signed-in user's IndexedDB records to the cloud. Per-record last-write-wins.
// Local writes mark records dirty (saved in localStorage so nothing is lost on reload or offline);
// pushes are debounced, pulls run at start, when the app comes back to the foreground, and every minute.
import { hooks, get, rawPut, rawDel, allRecords } from './db.js';
import { api } from './cloud.js';

let U = null, st = null, timer = null, running = null, interval = null;
export const status = { lastOk: 0, error: '', pending: 0 };
const KEY = () => 'cb_sync_' + U;
const save = () => { localStorage.setItem(KEY(), JSON.stringify(st)); status.pending = Object.keys(st.dirty).length + Object.keys(st.del).length; };
const listeners = new Set();
export const onStatus = f => { listeners.add(f); return () => listeners.delete(f); };
const emit = () => listeners.forEach(f => { try { f(status); } catch { } });

export function start(username) {
  stop(); U = username;
  try { st = JSON.parse(localStorage.getItem(KEY()) || 'null'); } catch { st = null; }
  st ||= { since: 0, dirty: {}, del: {} }; save();
  hooks.onPut = id => { if (!id?.startsWith(U + ':')) return; st.dirty[id] = Date.now(); delete st.del[id]; save(); schedule(); };
  hooks.onDel = id => { if (!id?.startsWith(U + ':')) return; delete st.dirty[id]; st.del[id] = Date.now(); save(); schedule(); };
  document.addEventListener('visibilitychange', onVis); window.addEventListener('online', onOnline);
  interval = setInterval(() => { if (document.visibilityState === 'visible') syncNow(); }, 60000);
}
export function stop() {
  hooks.onPut = hooks.onDel = null; clearTimeout(timer); clearInterval(interval);
  document.removeEventListener('visibilitychange', onVis); window.removeEventListener('online', onOnline); U = null;
}
const onVis = () => { document.visibilityState === 'hidden' ? push().catch(() => {}) : syncNow(); };
const onOnline = () => syncNow();
function schedule() { clearTimeout(timer); timer = setTimeout(() => push().catch(() => {}), 1500); }

// Upload everything this device has (used when an on-device account moves to the cloud).
export async function markAllDirty() { for (const r of await allRecords(U)) st.dirty[r.id] = r.updated || Date.now(); save(); }

export async function push() {
  if (!U) return;
  const snap = { ...st.dirty }, dsnap = { ...st.del };
  const ids = Object.keys(snap), dels = Object.entries(dsnap);
  if (!ids.length && !dels.length) return;
  const recs = (await Promise.all(ids.map(id => get('records', id)))).filter(Boolean).map(r => ({ id: r.id, type: r.type, data: r.data, updated: r.updated || Date.now() }));
  for (let i = 0; i < Math.max(recs.length, dels.length); i += 500) {
    await api('sync', { method: 'POST', body: { records: recs.slice(i, i + 500), deletes: dels.slice(i, i + 500).map(([id, at]) => ({ id, at })) } });
  }
  for (const id of ids) if (st.dirty[id] === snap[id]) delete st.dirty[id]; // keep anything re-edited during the upload
  for (const [id, at] of dels) if (st.del[id] === at) delete st.del[id];
  save();
}

export async function pull() {
  if (!U) return 0;
  let changed = 0, more = true;
  while (more) {
    const r = await api('sync?since=' + st.since);
    for (const rec of r.records) {
      if (!rec.id.startsWith(U + ':') || st.dirty[rec.id] || st.del[rec.id]) continue; // local unsent change wins until it is pushed
      const local = await get('records', rec.id);
      if (local && (local.updated || 0) > rec.updated) continue;
      if (rec.deleted) { if (local) { await rawDel('records', rec.id); changed++; } }
      else { await rawPut('records', { id: rec.id, uid: U, type: rec.type, data: rec.data, updated: rec.updated }); changed++; }
    }
    st.since = r.now; more = r.more; save();
  }
  return changed;
}

export function syncNow() {
  if (!U) return Promise.resolve(0);
  return running ||= (async () => {
    try { await push(); const n = await pull(); status.lastOk = Date.now(); status.error = ''; return n; }
    catch (e) { status.error = e.message; if (e.status === 401) window.dispatchEvent(new Event('cb-signed-out')); return 0; }
    finally { running = null; emit(); }
  })();
}
export function forget(username) { localStorage.removeItem('cb_sync_' + username); }
