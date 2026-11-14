// Per-user data API on top of IndexedDB. All data is stored on this device.
import { put, get, del, listRecords, allRecords } from './db.js';
import { uid as mkid } from './util.js';

let U = null;
export const setUser = u => { U = u; };
export const user = () => U;

const single = type => `${U}:${type}`;
async function getSingle(type, dflt) { const r = await get('records', single(type)); return r ? r.data : dflt; }
async function putSingle(type, data) { await put('records', { id: single(type), uid: U, type, data, updated: Date.now() }); return data; }

export const prefs = {
  get: () => getSingle('pref', {}),
  async set(patch) { const p = { ...(await prefs.get()), ...patch }; return putSingle('pref', p); },
};

async function toggleSet(type, key) {
  const id = `${U}:${type}:${key}`;
  const ex = await get('records', id);
  if (ex) { await del('records', id); return false; }
  await put('records', { id, uid: U, type, data: { key }, updated: Date.now() }); return true;
}
const keysOf = async type => (await listRecords(U, type)).map(r => r.data.key);

export const saved = {
  lessons: () => keysOf('saved-lesson'), toggleLesson: k => toggleSet('saved-lesson', k),
  plays: () => keysOf('fav-play'), togglePlay: k => toggleSet('fav-play', k),
};

// lesson progress: { [lessonId]: {viewed:ts, done:bool, level:'beginner'} }
export const progress = {
  get: () => getSingle('progress', {}),
  async touch(id, patch = {}) {
    const p = await progress.get(); p[id] = { ...(p[id] || {}), viewed: Date.now(), ...patch };
    return putSingle('progress', p);
  },
};

export const templates = {
  list: async () => (await listRecords(U, 'template')).map(r => r.data).sort((a, b) => b.created - a.created),
  async save(t) { t.id ||= mkid(); t.created ||= Date.now(); await put('records', { id: `${U}:template:${t.id}`, uid: U, type: 'template', data: t, updated: Date.now() }); return t; },
  remove: id => del('records', `${U}:template:${id}`),
};

export const sessions = {
  list: async () => (await listRecords(U, 'shoot')).map(r => r.data).sort((a, b) => b.ended - a.ended),
  get: async id => (await get('records', `${U}:shoot:${id}`))?.data,
  async save(s) { await put('records', { id: `${U}:shoot:${s.id}`, uid: U, type: 'shoot', data: s, updated: Date.now() }); return s; },
  remove: id => del('records', `${U}:shoot:${id}`),
};

// in-progress shooting session (autosaved after every tap)
export const active = {
  get: () => getSingle('active', null),
  set: s => putSingle('active', s),
  clear: () => del('records', single('active')),
};

export const tests = {
  list: async () => (await listRecords(U, 'test')).map(r => r.data).sort((a, b) => b.at - a.at),
  async add(t) { t.id ||= mkid(); await put('records', { id: `${U}:test:${t.id}`, uid: U, type: 'test', data: t, updated: Date.now() }); return t; },
  remove: id => del('records', `${U}:test:${id}`),
};

export const analyses = {
  list: async () => (await listRecords(U, 'analysis')).map(r => r.data).sort((a, b) => b.at - a.at),
  async add(a) { a.id ||= mkid(); await put('records', { id: `${U}:analysis:${a.id}`, uid: U, type: 'analysis', data: a, updated: Date.now() }); return a; },
  remove: id => del('records', `${U}:analysis:${id}`),
};

export const playPlan = {
  get: () => getSingle('plan', { format: '3v3', weaknesses: ['unknown'], custom: '', roles: {}, style: '' }),
  set: p => putSingle('plan', p),
};

// backup / restore (the only way to move data between devices)
export async function exportAll() { return { app: 'coach-bron', v: 1, user: U, at: Date.now(), records: await allRecords(U) }; }
export async function importAll(obj) {
  if (obj?.app !== 'coach-bron' || !Array.isArray(obj.records)) throw new Error('This is not a Coach Bron backup file.');
  let n = 0;
  for (const r of obj.records) {
    const id = r.id.replace(/^[^:]+:/, `${U}:`);
    await put('records', { ...r, id, uid: U }); n++;
  }
  return n;
}
