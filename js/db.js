// IndexedDB persistence. Everything lives on this device (local-first). No cloud sync exists.
const DB_NAME = 'coachbron', VER = 1;
let dbp;

function open() {
  if (dbp) return dbp;
  dbp = new Promise((res, rej) => {
    if (!('indexedDB' in globalThis)) return rej(new Error('IndexedDB is not available in this browser.'));
    const r = indexedDB.open(DB_NAME, VER);
    r.onupgradeneeded = () => {
      const d = r.result;
      d.createObjectStore('users', { keyPath: 'username' });
      d.createObjectStore('sessions', { keyPath: 'token' });
      const rec = d.createObjectStore('records', { keyPath: 'id' });
      rec.createIndex('uid_type', ['uid', 'type']);
      rec.createIndex('uid', 'uid');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
    r.onblocked = () => rej(new Error('Database is blocked by another tab.'));
  });
  return dbp;
}
const done = t => new Promise((res, rej) => {
  t.oncomplete = () => res(); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error || new Error('aborted'));
});
const rq = r => new Promise((res, rej) => { r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });

export async function put(store, val) { const db = await open(); const t = db.transaction(store, 'readwrite'); t.objectStore(store).put(val); await done(t); return val; }
export async function get(store, key) { const db = await open(); return rq(db.transaction(store).objectStore(store).get(key)); }
export async function del(store, key) { const db = await open(); const t = db.transaction(store, 'readwrite'); t.objectStore(store).delete(key); await done(t); }
export async function listRecords(uid, type) {
  const db = await open();
  return rq(db.transaction('records').objectStore('records').index('uid_type').getAll(IDBKeyRange.only([uid, type])));
}
export async function allRecords(uid) {
  const db = await open();
  return rq(db.transaction('records').objectStore('records').index('uid').getAll(IDBKeyRange.only(uid)));
}
export async function deleteUserData(uid) {
  const db = await open();
  const t = db.transaction(['records', 'sessions', 'users'], 'readwrite');
  const idx = t.objectStore('records').index('uid');
  idx.openCursor(IDBKeyRange.only(uid)).onsuccess = e => {
    const c = e.target.result; if (c) { c.delete(); c.continue(); }
  };
  const ss = t.objectStore('sessions');
  ss.openCursor().onsuccess = e => {
    const c = e.target.result; if (c) { if (c.value.uid === uid) c.delete(); c.continue(); }
  };
  t.objectStore('users').delete(uid);
  await done(t);
}
export async function countStore(store) { const db = await open(); return rq(db.transaction(store).objectStore(store).count()); }
export async function dbReady() { await open(); return true; }
