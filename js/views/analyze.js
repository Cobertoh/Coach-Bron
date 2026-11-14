import { h, s, icon, ICONS, fmtDate, toast, confirmSheet } from '../util.js';
import { analyses } from '../store.js';
import { TECHNIQUES, L } from '../content/index.js';
import { analyze } from '../pose.js';
import { loadPose, extractFrames, pickMime } from '../poseRuntime.js';
import { back, empty, ctx } from '../ui.js';
import { onLeave } from '../ctx.js';

const SETUP = {
  shooting: { angle: 'From the side (or a slight front angle), so your shooting arm and knees are clearly visible.', dist: 'About 8–12 feet away, with the phone at chest height.', tip: 'Take at least 5 shots from the same spot. Face the side of the frame, not the camera.' },
  dribbling: { angle: 'From the front or a 45° front angle.', dist: 'About 10–12 feet away at chest height, with room to move.', tip: 'Do the same drill for 10–15 seconds, such as crossovers or in-and-out moves.' },
  finishing: { angle: 'From the side, so the takeoff and reach are visible.', dist: '12–15 feet away so there is room for the approach and jump.', tip: 'Do 3 or more layups from the same side, and walk back between reps.' },
  footwork: { angle: 'From the front or 45° front.', dist: 'About 10 feet away at chest height.', tip: 'Repeat pivots or jab steps for 10–15 seconds.' },
  defense: { angle: 'Facing the lane you will slide along, so you move left and right across the frame.', dist: '12–15 feet away, with the full slide path in view.', tip: 'Slide back and forth 3 or more times without stopping.' },
  passing: { angle: 'From the side or 45°, so both arms are visible.', dist: 'About 10 feet away at chest height.', tip: 'Make 5 or more passes to a wall or partner from the same spot.' },
};
const COMMON = [['Lighting', 'Face the light. Avoid windows or bright lights behind you.'], ['Full body', 'Keep your head and both feet in frame the whole time.'], ['Basketball', 'Keep the ball visible. It is recorded, but this version does not track it.'], ['Stability', 'Rest the phone on something or use a tripod. Do not hold it.']];

export async function home() {
  const list = await analyses.list();
  const el = h('div', { class: 'page' }, h('h1', { style: { margin: '8px 0 4px' } }, 'Analyze'),
    h('div', { class: 'muted small' }, 'Real pose tracking on your phone. Pick a technique, record a few reps, and get measurements with an honest confidence rating.'));
  el.append(h('h2', { style: { margin: '18px 0 8px' } }, 'Choose a technique'), ...TECHNIQUES.map(t => h('a', { class: 'card link', href: `#/analyze/${t.id}` }, h('div', { class: 'row sb' }, h('h3', {}, t.title), h('span', { html: ICONS.camera, style: { width: '22px', color: 'var(--lime)' } })), h('div', { class: 'small muted' }, t.hint))));
  el.append(h('div', { class: 'callout warn' }, 'The first analysis downloads a small pose model (about 6 MB) and needs internet once. After that it works offline. Video is processed on your phone and never uploaded.'));
  if (list.length) el.append(h('h2', { style: { margin: '18px 0 8px' } }, 'Past analyses'), ...list.slice(0, 10).map(a => h('a', { class: 'card link', href: `#/analyze/result/${a.id}` }, h('div', { class: 'row sb' }, h('h3', {}, a.techniqueTitle), h('span', { class: 'tag' }, a.confidence.label)), h('div', { class: 'small muted' }, `${fmtDate(a.at)} · ${a.reps} rep${a.reps === 1 ? '' : 's'} found`))));
  return el;
}

export async function session(tech, query) {
  const T = TECHNIQUES.find(t => t.id === tech); if (!T) return home();
  const from = new URLSearchParams(query || '').get('from');
  const sup = SETUP[tech];
  const el = h('div', { class: 'page' });
  let stream = null, rec = null, chunks = [], timer = null, cancel = false, facing = 'environment';
  const stopStream = () => { stream?.getTracks().forEach(t => t.stop()); stream = null; clearInterval(timer); };
  onLeave(() => { cancel = true; stopStream(); });
  const draw = node => el.replaceChildren(node);

  function intro() {
    stopStream();
    draw(h('div', {}, back(from && L[from] ? L[from].title : 'Analyze', from && L[from] ? `#/lesson/${from}` : '#/analyze'),
      h('h1', {}, `Analyze: ${T.title}`), h('div', { class: 'muted small', style: { margin: '4px 0 12px' } }, 'Step 1 of 3: set up your phone'),
      h('div', { class: 'card' }, h('h4', {}, 'Camera angle'), h('p', { style: { margin: '4px 0 10px' } }, sup.angle), h('h4', {}, 'Distance'), h('p', { style: { margin: '4px 0 10px' } }, sup.dist), h('h4', {}, 'What to record'), h('p', { style: { margin: '4px 0 0' } }, sup.tip)),
      h('div', { class: 'card' }, ...COMMON.flatMap(([a, b]) => [h('h4', {}, a), h('p', { class: 'small', style: { margin: '2px 0 10px' } }, b)])),
      h('button', { class: 'btn pri block', onclick: openCam }, icon('camera'), 'Open camera'),
      h('label', { class: 'btn block', style: { marginTop: '8px' } }, 'Choose or record a video file', h('input', { type: 'file', accept: 'video/*', style: { display: 'none' }, onchange: e => e.target.files[0] && process(e.target.files[0]) })),
      h('p', { class: 'tiny muted', style: { marginTop: '10px' } }, 'Use the file option if the in-app camera is not allowed. Your phone\'s own camera app also works for recording.')));
  }

  async function openCam() {
    if (!navigator.mediaDevices?.getUserMedia || !globalThis.MediaRecorder) return toast('This browser cannot record in the app. Use "Choose or record a video file" instead.', 4000);
    const video = h('video', { class: 'cam', playsinline: true, muted: true, autoplay: true });
    const status = h('div', { class: 'small muted', style: { textAlign: 'center', margin: '8px 0' } }, 'Frame your whole body, then tap Record.');
    const rb = h('button', { class: 'btn pri block', style: { minHeight: '60px', fontSize: '18px' } }, 'Record');
    draw(h('div', {}, back('Cancel', '#'), h('h1', {}, T.title), video, status, rb,
      h('button', { class: 'btn ghost block', style: { marginTop: '6px' }, onclick: () => { facing = facing === 'environment' ? 'user' : 'environment'; start(); } }, 'Switch camera')));
    el.querySelector('.crumb').onclick = e => { e.preventDefault(); stopStream(); intro(); };
    async function start() {
      stopStream();
      try { stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false }); video.srcObject = stream; await video.play().catch(() => {}); }
      catch (e) { status.textContent = e.name === 'NotAllowedError' ? 'Camera permission was denied. Allow camera access in your browser settings, or use a video file instead.' : 'Could not open the camera: ' + e.message; status.className = 'small bad'; }
    }
    await start();
    rb.onclick = () => {
      if (rec && rec.state === 'recording') { rec.stop(); return; }
      if (!stream) return start();
      chunks = []; const mime = pickMime(); rec = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      rec.ondataavailable = e => e.data.size && chunks.push(e.data);
      rec.onstop = () => { const blob = new Blob(chunks, { type: rec.mimeType || 'video/mp4' }); stopStream(); process(blob); };
      rec.start(1000); let sec = 0; rb.textContent = 'Stop (0:00)'; rb.className = 'btn block danger'; status.textContent = 'Recording… do several reps, then tap Stop.';
      timer = setInterval(() => { sec++; rb.textContent = `Stop (${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')})`; if (sec >= 60) rec.stop(); }, 1000);
    };
  }

  async function process(blob) {
    stopStream(); cancel = false;
    const bar = h('i', {}), status = h('div', { class: 'muted', style: { textAlign: 'center', margin: '10px 0' } }, 'Preparing…');
    draw(h('div', {}, h('h1', {}, 'Analyzing…'), h('div', { class: 'muted small', style: { margin: '4px 0 18px' } }, 'Step 2 of 3: reading your movement on this phone'),
      h('div', { class: 'bar' }, bar), status, h('div', { class: 'skel' }), h('div', { class: 'skel' }),
      h('button', { class: 'btn block', onclick: () => { cancel = true; intro(); } }, 'Cancel')));
    const video = h('video', { muted: true, playsinline: true, preload: 'auto', style: { position: 'fixed', left: '-9999px', width: '2px' } });
    const url = URL.createObjectURL(blob); video.src = url; document.body.append(video);
    try {
      status.textContent = 'Loading the pose model…';
      await loadPose(m => { status.textContent = m; });
      status.textContent = 'Tracking your body in each frame…';
      const { frames, aspect, duration } = await extractFrames(video, { fps: 10, onProgress: p => { bar.style.width = (p * 100) + '%'; }, shouldCancel: () => cancel });
      status.textContent = 'Calculating measurements…';
      const res = analyze(tech, frames, { aspect, duration });
      const rec = { techniqueId: tech, techniqueTitle: T.title, at: Date.now(), reps: res.reps, confidence: res.confidence, measured: res.measured, estimated: res.estimated, notEvaluated: res.notEvaluated, summary: res.summary, view: res.view, duration, shootingArm: res.shootingArm };
      await analyses.add(rec);
      showResult(rec, frames, aspect);
    } catch (e) {
      if (e.message === 'cancelled') return;
      draw(h('div', {}, back('Back', '#'), h('div', { class: 'card' }, h('h3', { class: 'bad' }, 'Analysis could not finish'), h('p', { class: 'small', style: { marginTop: '6px' } }, e.message || String(e))), h('button', { class: 'btn pri block', onclick: intro }, 'Try again')));
      el.querySelector('.crumb').onclick = ev => { ev.preventDefault(); intro(); };
    } finally { URL.revokeObjectURL(url); video.remove(); }
  }

  function showResult(rec, frames, aspect) {
    draw(resultNode(rec, frames, aspect, { again: intro }));
  }
  intro();
  return el;
}

export async function resultPage(id) {
  const list = await analyses.list(); const rec = list.find(a => a.id === id);
  if (!rec) return h('div', { class: 'page' }, empty('Analysis not found', '', { action: { label: 'Analyze', href: '#/analyze' } }));
  const el = h('div', { class: 'page' }, resultNode(rec, null, 1, {
    again: () => ctx.go(`#/analyze/${rec.techniqueId}`),
    remove: async () => { if (await confirmSheet('Delete analysis?', 'This removes it from your history.', 'Delete', true)) { await analyses.remove(rec.id); ctx.go('#/analyze'); } },
  }));
  return el;
}

const dotColor = st => st === 'good' ? 'var(--lime)' : st === 'note' ? 'var(--warn)' : 'var(--tx2)';
function obsList(items) { return h('div', { class: 'card' }, ...items.map(m => h('div', { class: 'obs' }, h('span', { class: 'dot', style: { background: dotColor(m.status) } }), h('div', { style: { flex: 1 } }, h('div', { class: 'row sb' }, h('b', { style: { fontSize: '14px' } }, m.label), h('b', { class: 'lime', style: { whiteSpace: 'nowrap' } }, m.value)), m.text ? h('div', { class: 'small muted', style: { marginTop: '2px' } }, m.text) : null)))); }

function resultNode(rec, frames, aspect, { again, remove }) {
  const c = rec.confidence, col = c.label === 'High' ? 'var(--lime)' : c.label === 'Medium' ? 'var(--warn)' : 'var(--bad)';
  const el = h('div', { class: 'page' }, remove ? back('Analyze', '#/analyze') : null,
    h('div', { class: 'muted small' }, remove ? fmtDate(rec.at, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Step 3 of 3: your results'),
    h('h1', { style: { margin: '2px 0 12px' } }, rec.techniqueTitle),
    h('div', { class: 'card' }, h('div', { class: 'row sb' }, h('h3', {}, 'Analysis confidence'), h('b', { style: { color: col } }, c.label)), h('div', { class: 'meter', style: { margin: '8px 0' } }, h('i', { style: { width: Math.round(c.score * 100) + '%', background: col, transition: 'width .9s' } })),
      h('div', { class: 'small muted' }, `${rec.reps ? rec.reps + ' repetition' + (rec.reps > 1 ? 's' : '') + ' found. ' : ''}Camera view detected: ${rec.view || 'unknown'}.`),
      ...(c.issues.length ? [h('div', { class: 'callout warn', style: { marginTop: '10px' } }, ...c.issues.map(x => h('div', { style: { marginBottom: '4px' } }, x)))] : [])));
  if (c.label === 'Low') el.append(h('div', { class: 'callout warn' }, 'Confidence is low, so treat these numbers with care and record again following the setup tips before changing your technique.'));
  el.append(h('h2', { style: { margin: '18px 0 8px' } }, 'What stood out'), h('div', { class: 'card' }, ...rec.summary.map(t => h('p', { style: { margin: '0 0 8px' } }, t))));
  if (frames) el.append(skeletonPlayer(frames, aspect));
  el.append(h('h2', { style: { margin: '18px 0 2px' } }, 'Measured'), h('div', { class: 'tiny muted', style: { marginBottom: '8px' } }, 'Calculated directly from your body landmarks in the video. A single 2D camera view limits accuracy, so values are approximate.'), obsList(rec.measured.length ? rec.measured : [{ label: 'No measurements', value: '', status: 'info', text: 'The video did not contain enough usable frames.' }]));
  if (rec.estimated.length) el.append(h('h2', { style: { margin: '18px 0 2px' } }, 'Estimates'), h('div', { class: 'tiny muted', style: { marginBottom: '8px' } }, 'Inferred from the measurements. Less certain, so check them on video.'), obsList(rec.estimated));
  el.append(h('h2', { style: { margin: '18px 0 2px' } }, 'Could not be evaluated'), h('div', { class: 'tiny muted', style: { marginBottom: '8px' } }, 'Coach Bron does not guess at these.'),
    h('div', { class: 'card' }, ...rec.notEvaluated.map(n => h('div', { class: 'obs' }, h('span', { class: 'dot', style: { background: 'var(--line)' } }), h('div', {}, h('b', { style: { fontSize: '14px' } }, n.label), h('div', { class: 'small muted' }, n.reason))))));
  el.append(h('div', { class: 'callout' }, 'Good shooters and ball handlers look different from each other. Use these numbers to spot what is steady or inconsistent for you, not to copy one perfect form.'),
    h('button', { class: 'btn pri block', onclick: again }, 'Record again'), remove ? h('button', { class: 'btn danger block', style: { marginTop: '8px' }, onclick: remove }, 'Delete this analysis') : null);
  return el;
}

// Stick-figure replay of the tracked landmarks so you can see what the model detected.
const BONES = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [24, 26], [26, 28]];
function skeletonPlayer(frames, aspect) {
  const svg = s('svg', { viewBox: `0 0 ${aspect} 1`, style: 'width:100%;max-height:300px;background:#10141C;border-radius:16px' });
  const g = s('g', {}); svg.append(g);
  let i = 0, tm = null;
  const range = h('input', { type: 'range', min: 0, max: frames.length - 1, value: 0, 'aria-label': 'Scrub replay', style: { width: '100%' }, oninput: e => { i = +e.target.value; draw(); } });
  const btn = h('button', { class: 'btn', style: { minHeight: '40px' }, onclick: () => { if (tm) { clearInterval(tm); tm = null; btn.textContent = 'Play'; } else { btn.textContent = 'Pause'; tm = setInterval(() => { i = (i + 1) % frames.length; range.value = i; draw(); }, 100); } } }, 'Play');
  onLeave(() => clearInterval(tm));
  function draw() {
    const lm = frames[i].lm; g.replaceChildren();
    const P = k => (lm[k].v >= 0.5 ? [lm[k].x * aspect, lm[k].y] : null);
    for (const [a, b] of BONES) { const p = P(a), q = P(b); if (p && q) g.append(s('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1], stroke: '#A6F36A', 'stroke-width': 0.012, 'stroke-linecap': 'round' })); }
    for (const k of [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28]) { const p = P(k); if (p) g.append(s('circle', { cx: p[0], cy: p[1], r: 0.013, fill: '#F4F5F7' })); }
  }
  draw();
  return h('div', {}, h('h2', { style: { margin: '18px 0 8px' } }, 'What the camera tracked'), svg, h('div', { class: 'row', style: { marginTop: '8px' } }, btn, range), h('div', { class: 'tiny muted' }, 'Gaps mean the body part was not visible enough, and it was left out of the numbers.'));
}
