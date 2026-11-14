// Browser-side pose estimation using MediaPipe Pose Landmarker (on-device, WebAssembly).
// The runtime and model are downloaded once from public CDNs and then cached by the service worker.
// Video never leaves the phone. Nothing here calls any AI service.
const VER = '0.10.14';
const BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VER}`;
const MODEL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';
let landmarker = null, tsBase = 0;

export async function loadPose(onStatus) {
  if (landmarker) return landmarker;
  onStatus?.('Loading the pose model (first time only, about 6 MB)…');
  let vision;
  try { vision = await import(/* @vite-ignore */ `${BASE}/vision_bundle.mjs`); }
  catch (e) { throw new Error('Could not download the pose model. Connect to the internet once so it can be saved on your phone, then try again.'); }
  const fileset = await vision.FilesetResolver.forVisionTasks(`${BASE}/wasm`);
  const make = delegate => vision.PoseLandmarker.createFromOptions(fileset, { baseOptions: { modelAssetPath: MODEL, delegate }, runningMode: 'VIDEO', numPoses: 1, minPoseDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });
  try { landmarker = await make('GPU'); } catch { landmarker = await make('CPU'); }
  return landmarker;
}

const seek = (v, t) => new Promise((res, rej) => {
  const done = () => { v.removeEventListener('seeked', done); res(); };
  v.addEventListener('seeked', done); v.currentTime = t;
  setTimeout(() => { v.removeEventListener('seeked', done); res(); }, 2500);
});

export async function videoDuration(v) {
  if (Number.isFinite(v.duration) && v.duration > 0) return v.duration;
  // MediaRecorder WebM files report Infinity until the end is seeked to.
  await seek(v, 1e7); const d = v.duration; await seek(v, 0); return Number.isFinite(d) ? d : 0;
}

export async function extractFrames(video, { fps = 10, maxSec = 45, onProgress, shouldCancel }) {
  if (video.readyState < 1) await new Promise((res, rej) => { video.onloadedmetadata = res; video.onerror = () => rej(new Error('This video could not be read by your browser.')); });
  const dur = Math.min(await videoDuration(video), maxSec);
  if (!dur) throw new Error('This video has no readable length.');
  const lm = await loadPose();
  const aspect = video.videoWidth / video.videoHeight;
  const frames = []; const step = 1 / fps; const base = tsBase;
  for (let t = 0, i = 0; t < dur; t += step, i++) {
    if (shouldCancel?.()) throw new Error('cancelled');
    await seek(video, t);
    const res = lm.detectForVideo(video, base + Math.round(t * 1000) + 1);
    const pts = res.landmarks?.[0];
    frames.push({ t, lm: pts ? pts.map(p => ({ x: p.x, y: p.y, v: p.visibility ?? 1 })) : null });
    if (i % 3 === 0) { onProgress?.(t / dur); await new Promise(r => setTimeout(r)); }
  }
  tsBase = base + Math.round(dur * 1000) + 2000;
  onProgress?.(1);
  return { frames: frames.map(f => ({ t: f.t, lm: f.lm || Array.from({ length: 33 }, () => ({ x: 0, y: 0, v: 0 })) })), aspect, duration: dur };
}

export function pickMime() {
  const c = ['video/mp4', 'video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm'];
  return c.find(m => globalThis.MediaRecorder?.isTypeSupported?.(m)) || '';
}
