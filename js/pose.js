// Movement analysis rules on top of pose landmarks. Pure functions: no DOM, no network, fully testable.
// Input: frames [{t:seconds, lm:[{x,y,v}] x 33}] with x,y normalised 0..1 (MediaPipe Pose layout), plus the video aspect ratio.
// Nothing here invents data: anything that cannot be seen reliably is returned under `notEvaluated`.

const I = { NOSE: 0, LSH: 11, RSH: 12, LEL: 13, REL: 14, LWR: 15, RWR: 16, LHIP: 23, RHIP: 24, LKN: 25, RKN: 26, LAN: 27, RAN: 28 };
const VIS = 0.5;
const nan = NaN;
const ok = v => Number.isFinite(v);
const avg = a => { const b = a.filter(ok); return b.length ? b.reduce((x, y) => x + y, 0) / b.length : nan; };
const sd = a => { const b = a.filter(ok); if (b.length < 2) return nan; const m = avg(b); return Math.sqrt(avg(b.map(x => (x - m) ** 2))); };
const med = a => { const b = a.filter(ok).sort((x, y) => x - y); return b.length ? b[Math.floor(b.length / 2)] : nan; };
const maxF = a => { const b = a.filter(ok); return b.length ? Math.max(...b) : nan; };
const minF = a => { const b = a.filter(ok); return b.length ? Math.min(...b) : nan; };
const pctile = (a, p) => { const b = a.filter(ok).sort((x, y) => x - y); return b.length ? b[Math.min(b.length - 1, Math.floor(p * b.length))] : nan; };
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const mid = (a, b) => (a && b ? [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] : a || b || null);
function angle(a, b, c) {
  if (!a || !b || !c) return nan;
  const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]];
  const d = Math.hypot(...v1) * Math.hypot(...v2); if (!d) return nan;
  return (Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / d))) * 180) / Math.PI;
}
function smooth(a, w = 2) { return a.map((_, i) => avg(a.slice(Math.max(0, i - w), i + w + 1))); }

export function frameFeatures(fr, aspect = 1) {
  const P = i => { const l = fr.lm?.[i]; return l && (l.v ?? 1) >= VIS ? [l.x * aspect, l.y] : null; };
  const [nose, lsh, rsh, leb, reb, lwr, rwr, lhp, rhp, lkn, rkn, lan, ran] = [I.NOSE, I.LSH, I.RSH, I.LEL, I.REL, I.LWR, I.RWR, I.LHIP, I.RHIP, I.LKN, I.RKN, I.LAN, I.RAN].map(P);
  const sh = mid(lsh, rsh), hip = mid(lhp, rhp), ank = mid(lan, ran);
  const torso = sh && hip ? dist(sh, hip) : nan;
  const f = { t: fr.t, torso };
  f.detected = !!(sh || hip);
  f.full = !!(lsh && rsh && lhp && rhp && lkn && rkn && lan && ran);
  f.inFrame = !!(ank && ank[1] < 0.985 && (!nose || nose[1] > 0.01));
  f.heightFrac = nose && ank ? ank[1] - nose[1] : nan;
  f.kneeL = angle(lhp, lkn, lan); f.kneeR = angle(rhp, rkn, ran); f.knee = avg([f.kneeL, f.kneeR]);
  f.elbowL = angle(lsh, leb, lwr); f.elbowR = angle(rsh, reb, rwr);
  f.lean = sh && hip ? (Math.abs(Math.atan2(sh[0] - hip[0], hip[1] - sh[1])) * 180) / Math.PI : nan;
  const shW = lsh && rsh ? Math.abs(lsh[0] - rsh[0]) : nan;
  f.shW = shW; f.frontal = ok(shW) && ok(torso) ? shW / torso : nan;
  f.stance = ok(shW) && lan && ran && shW > 0 ? Math.abs(lan[0] - ran[0]) / shW : nan;
  f.crouch = ank && hip && ok(torso) ? (ank[1] - hip[1]) / torso : nan;
  f.hipX = hip ? hip[0] : nan; f.hipY = hip ? hip[1] : nan; f.ankY = ank ? ank[1] : nan;
  f.ankDX = lan && ran ? lan[0] - ran[0] : nan;
  const rel = w => (sh && w && ok(torso) ? (sh[1] - w[1]) / torso : nan);       // wrist above shoulder, in torso lengths
  f.wL = rel(lwr); f.wR = rel(rwr);
  const head = w => (nose && w && ok(torso) ? (nose[1] - w[1]) / torso : nan);  // wrist above nose
  f.hL = head(lwr); f.hR = head(rwr);
  f.wristL = lwr; f.wristR = rwr; f.shoulderL = lsh; f.shoulderR = rsh;
  f.armExtL = lsh && leb && lwr ? dist(lsh, lwr) / (dist(lsh, leb) + dist(leb, lwr) || 1) : nan;
  f.armExtR = rsh && reb && rwr ? dist(rsh, rwr) / (dist(rsh, reb) + dist(reb, rwr) || 1) : nan;
  f.hipBelowWristL = lwr && hip ? lwr[1] > hip[1] : null; f.hipBelowWristR = rwr && hip ? rwr[1] > hip[1] : null;
  return f;
}

// local maxima of series with min separation (seconds)
function peaks(series, times, { min, sep }) {
  const out = [];
  for (let i = 1; i < series.length - 1; i++) {
    if (!ok(series[i]) || series[i] < min) continue;
    let isMax = true; for (let j = Math.max(0, i - 3); j <= Math.min(series.length - 1, i + 3); j++) if (ok(series[j]) && series[j] > series[i]) { isMax = false; break; }
    if (!isMax) continue;
    if (out.length && times[i] - times[out[out.length - 1]] < sep) { if (series[i] > series[out[out.length - 1]]) out[out.length - 1] = i; continue; }
    out.push(i);
  }
  return out;
}
function turns(x, torso, thresh = 0.35) {   // direction changes with hysteresis
  let dir = 0, ext = x.find(ok), n = 0;
  for (const v of x) {
    if (!ok(v)) continue;
    if (dir >= 0 && v - ext > 0) { ext = v; if (dir === 0 && v - x.find(ok) > thresh * torso) dir = 1; }
    if (dir === 1) { if (v > ext) ext = v; else if (ext - v > thresh * torso) { dir = -1; n++; ext = v; } }
    else if (dir === -1) { if (v < ext) ext = v; else if (v - ext > thresh * torso) { dir = 1; n++; ext = v; } }
  }
  return n;
}

const item = (id, label, value, raw, status, text) => ({ id, label, value, raw, status, text });
const fmt = (v, d = 0) => ok(v) ? v.toFixed(d) : '—';

function movementCore(F, T) {
  const torso = med(F.map(f => f.torso));
  const hipX = smooth(F.map(f => f.hipX), 3);
  const vel = hipX.map((x, i) => i && ok(x) && ok(hipX[i - 1]) ? Math.abs(x - hipX[i - 1]) / ((T[i] - T[i - 1]) || 1) / torso : nan);
  return {
    torso, knee: avg(F.map(f => f.knee)), lean: avg(F.map(f => f.lean)), leanSd: sd(F.map(f => f.lean)),
    crouchAvg: avg(F.map(f => f.crouch)), crouchSd: sd(smooth(F.map(f => f.crouch), 2)),
    stance: avg(F.map(f => f.stance)), frontal: med(F.map(f => f.frontal)),
    speed: avg(vel), peakSpeed: pctile(vel, 0.9), changes: turns(hipX, torso), hipX,
  };
}

function bandText(id, v) { return v; }

export function analyze(technique, frames, { aspect = 1, duration = 0 } = {}) {
  const T = frames.map(f => f.t);
  const F = smoothFeatures(frames.map(fr => frameFeatures(fr, aspect)));
  const n = F.length;
  const det = F.filter(f => f.detected).length;
  const fullFrac = n ? F.filter(f => f.full && f.inFrame).length / n : 0;
  const detFrac = n ? det / n : 0;
  const hf = med(F.map(f => f.heightFrac));
  const issues = [];
  const out = { technique, frameCount: n, measured: [], estimated: [], notEvaluated: [], issues };
  const ne = (label, reason) => out.notEvaluated.push({ label, reason });
  ne('Basketball position, trajectory and arc', 'Ball tracking is not part of this version of the analyzer, so nothing about the ball is measured.');

  if (n < 8 || detFrac < 0.3) {
    issues.push('A person was not detected in enough of the video. Make sure your whole body is in frame with good light.');
    out.confidence = { score: 0.1, label: 'Low', issues, factors: { bodyVisible: fullFrac, detected: detFrac } };
    out.reps = 0; out.summary = ['The analysis could not run reliably on this clip.']; return out;
  }
  if (fullFrac < 0.6) issues.push(`Your full body (head to feet) was visible in only ${Math.round(fullFrac * 100)}% of the video. Step back or lower the phone so your feet are in frame.`);
  if (ok(hf) && hf < 0.35) issues.push('You look small in the frame. Move the phone closer so you fill about two thirds of the height.');
  if (ok(hf) && hf > 0.97) issues.push('Your body fills the entire frame. Move the camera back.');
  if (duration && duration < 3) issues.push('The clip is very short. Record several repetitions.');

  const core = movementCore(F, T);
  const frontal = core.frontal;
  const side = ok(frontal) ? (frontal < 0.5 ? 'side' : frontal < 0.8 ? 'angled' : 'front') : 'unknown';
  out.view = side;

  let reps = [];
  const R = {
    shooting: () => shooting(F, T, core, out, ne), dribbling: () => dribbling(F, T, core, out, ne, side), defense: () => defense(F, T, core, out, ne, side),
    footwork: () => footwork(F, T, core, out, ne, side), finishing: () => finishing(F, T, core, out, ne), passing: () => passing(F, T, core, out, ne),
  }[technique];
  reps = R ? R() : [];
  out.reps = reps.length;
  const repNeeded = ['shooting', 'finishing', 'passing'].includes(technique);
  const repsFactor = !repNeeded ? 1 : reps.length >= 3 ? 1 : reps.length === 2 ? 0.7 : reps.length === 1 ? 0.45 : 0.15;
  if (repNeeded && reps.length < 3) issues.push(reps.length ? `Only ${reps.length} repetition${reps.length > 1 ? 's' : ''} found. Record at least 3 for consistency measurements.` : 'No clear repetitions were found, so per-repetition measurements are missing.');
  const sizeFactor = !ok(hf) ? 0.5 : hf >= 0.45 && hf <= 0.95 ? 1 : hf >= 0.35 ? 0.6 : 0.3;
  let score = 0.4 * fullFrac + 0.2 * detFrac + 0.2 * repsFactor + 0.2 * sizeFactor;
  if (repNeeded && reps.length === 0) score = Math.min(score, 0.4); else if (repNeeded && reps.length === 1) score = Math.min(score, 0.6);
  if (fullFrac < 0.5) score = Math.min(score, 0.45);
  score = Math.round(score * 100) / 100;
  out.confidence = { score, label: score >= 0.75 ? 'High' : score >= 0.5 ? 'Medium' : 'Low', issues, factors: { bodyVisible: fullFrac, detected: detFrac, size: sizeFactor, reps: repsFactor } };
  out.summary = [...out.measured, ...out.estimated].filter(x => x.status !== 'good' && x.status !== 'info').slice(0, 3).map(x => x.text);
  if (!out.summary.length) out.summary = ['Nothing in the measured points stood out as a problem. Repeat the clip from other angles to confirm.'];
  return out;
}

function smoothFeatures(F) {
  const keys = ['knee', 'kneeL', 'kneeR', 'elbowL', 'elbowR', 'lean', 'crouch', 'wL', 'wR', 'hL', 'hR', 'ankY', 'hipY', 'armExtL', 'armExtR'];
  const res = F.map(f => ({ ...f }));
  for (const k of keys) { const s = smooth(F.map(f => f[k]), 1); res.forEach((f, i) => { f[k] = s[i]; }); }
  return res;
}

// ── Shooting ──
function shooting(F, T, core, out, ne) {
  const best = F.map(f => Math.max(ok(f.hL) ? f.hL : -9, ok(f.hR) ? f.hR : -9));
  const bs = best.map(v => (v === -9 ? nan : v));
  const pk = peaks(bs, T, { min: 0.12, sep: 1.0 });
  const leftWins = pk.filter(i => (F[i].hL ?? -9) > (F[i].hR ?? -9)).length;
  const arm = leftWins > pk.length / 2 ? 'L' : 'R'; const other = arm === 'L' ? 'R' : 'L';
  out.shootingArm = arm === 'L' ? 'left' : 'right';
  const reps = pk.map(i => {
    const t = T[i], w = F.filter(f => f.t >= t - 1.4 && f.t <= t + 0.4), pre = F.filter(f => f.t >= t - 1.4 && f.t <= t);
    const near = F.filter(f => Math.abs(f.t - t) <= 0.15);
    const elbow = maxF(near.map(f => f['elbow' + arm]));
    const kneeMin = minF(pre.map(f => f.knee));
    const dipT = (pre.filter(f => ok(f.knee)).sort((a, b) => a.knee - b.knee)[0] || {}).t;
    const hx = w.map(f => f.hipX).filter(ok);
    const wr = F[i]['wrist' + arm], wo = F[i]['wrist' + other];
    return {
      t, elbow, kneeMin, release: F[i]['h' + arm], lean: F[i].lean,
      sway: hx.length > 2 && ok(core.torso) ? (Math.max(...hx) - Math.min(...hx)) / core.torso : nan, rhythm: ok(dipT) ? t - dipT : nan,
      guide: wr && wo && ok(core.torso) ? (F[i]['h' + other] > -0.05 && dist(wr, wo) / core.torso < 0.7) : null,
    };
  });
  if (!reps.length) { ne('Shooting repetitions', 'No clear shot (wrists rising above head height) was found in the video.'); return reps; }
  const v = k => reps.map(r => r[k]);
  const kneeMin = avg(v('kneeMin')), elbow = avg(v('elbow')), rel = avg(v('release')), lean = avg(v('lean')), sway = avg(v('sway')), rhythm = avg(v('rhythm'));
  const cap = ' Measured from one 2D view, so treat it as approximate.';
  out.measured.push(
    item('knee', 'Knee bend before the shot (smallest knee angle)', `${fmt(kneeMin)}°`, kneeMin, !ok(kneeMin) ? 'info' : kneeMin > 160 ? 'note' : 'good',
      !ok(kneeMin) ? '' : kneeMin > 160 ? 'Your knees barely bend before the shot, so your legs are adding little power. A small dip lets the legs, not the arm, drive longer shots.' : 'You load your legs before the shot. Depth varies between good shooters. Aim for the same dip each time.'),
    item('elbow', `Shooting elbow angle at release (${out.shootingArm} arm)`, `${fmt(elbow)}°`, elbow, !ok(elbow) ? 'info' : elbow < 140 ? 'note' : 'good',
      !ok(elbow) ? '' : elbow < 140 ? 'The elbow is still quite bent at release, which can shorten the follow-through. Check that you extend toward the rim.' : 'Your arm reaches a mostly extended position at release.' + cap),
    item('release', 'Release height (wrist above nose, in torso lengths)', fmt(rel, 2), rel, !ok(rel) ? 'info' : rel < 0.12 ? 'note' : 'good',
      !ok(rel) ? '' : rel < 0.12 ? 'Your release point is close to head height. A higher release is harder to contest, though some good shooters release lower.' : 'Your release is clearly above your head.'),
    item('lean', 'Body lean at release', `${fmt(lean)}°`, lean, !ok(lean) ? 'info' : lean > 12 ? 'note' : 'good',
      !ok(lean) ? '' : lean > 12 ? 'Your torso is leaning noticeably at release. A steadier, more vertical body usually helps repeatability.' : 'Your torso is fairly upright at release.'),
    item('sway', 'Body drift during the shot (hip movement, torso lengths)', fmt(sway, 2), sway, !ok(sway) ? 'info' : sway > 0.4 ? 'note' : 'good',
      !ok(sway) ? '' : sway > 0.4 ? 'Your hips move quite a lot during the shot. Landing near where you took off keeps distance and timing consistent.' : 'Your body stays fairly settled through the shot.'),
    item('rhythm', 'Dip to release time', ok(rhythm) ? `${fmt(rhythm, 2)} s` : '—', rhythm, 'info', 'The time from the lowest dip to release. Compare it across reps to see rhythm consistency.'));
  if (reps.length >= 3) {
    const e = sd(v('elbow')), k = sd(v('kneeMin')), r = sd(v('rhythm'));
    out.measured.push(
      item('rep-elbow', 'Consistency: elbow angle at release (spread across reps)', `±${fmt(e, 1)}°`, e, !ok(e) ? 'info' : e > 12 ? 'note' : 'good', !ok(e) ? '' : e > 12 ? 'Your release angle changes a lot from rep to rep. Focus on repeating the same arm path.' : 'Your release arm position is repeatable.'),
      item('rep-knee', 'Consistency: knee bend (spread across reps)', `±${fmt(k, 1)}°`, k, !ok(k) ? 'info' : k > 15 ? 'note' : 'good', !ok(k) ? '' : k > 15 ? 'The depth of your dip varies from shot to shot, which changes the power you need from your arm.' : 'Your dip is similar from shot to shot.'),
      item('rep-rhythm', 'Consistency: timing (spread across reps)', ok(r) ? `±${fmt(r, 2)} s` : '—', r, !ok(r) ? 'info' : r > 0.18 ? 'note' : 'good', !ok(r) ? '' : r > 0.18 ? 'Your shot rhythm changes between reps. A steady rhythm usually improves accuracy.' : 'Your shot timing is steady.'));
  }
  const guideCount = reps.filter(r => r.guide).length;
  if (reps.some(r => r.guide !== null)) out.estimated.push(item('guide', 'Guide hand', `${guideCount}/${reps.length} reps`, guideCount, guideCount >= Math.ceil(reps.length / 2) ? 'note' : 'good',
    guideCount >= Math.ceil(reps.length / 2) ? 'On several reps your off hand is still high and close to the shooting hand at release. The camera cannot confirm contact, but check that your guide hand lets go.' : 'Your off hand mostly stays away from the shooting hand at release. The camera cannot confirm contact on the ball.'));
  else ne('Guide-hand interference', 'Your off-hand wrist was not visible enough at release.');
  ne('Wrist snap and finger position', 'Hand and finger detail is too small for this pose model, so wrist snap is not measured. Elbow extension is used instead.');
  ne('Shot arc and trajectory', 'This requires reliable ball tracking, which is not available yet.');
  return reps;
}

// ── Ball handling ──
function dribbling(F, T, core, out, ne, side) {
  const kneeM = core.knee, lean = core.lean, bob = ok(core.crouchSd) && ok(core.crouchAvg) && core.crouchAvg ? core.crouchSd / Math.abs(core.crouchAvg) : nan;
  const low = [F.map(f => f.hipBelowWristL), F.map(f => f.hipBelowWristR)].map(a => { const b = a.filter(x => x !== null); return b.length ? b.filter(Boolean).length / b.length : nan; });
  out.measured.push(
    item('knee', 'Average knee bend (knee angle)', `${fmt(kneeM)}°`, kneeM, !ok(kneeM) ? 'info' : kneeM > 165 ? 'note' : 'good', !ok(kneeM) ? '' : kneeM > 165 ? 'You are dribbling with nearly straight legs. A lower stance gives better balance and quicker changes of direction.' : 'You keep a bent-knee stance, which helps balance and quickness.'),
    item('lean', 'Average torso lean', `${fmt(lean)}°`, lean, !ok(lean) ? 'info' : lean > 30 ? 'note' : 'good', !ok(lean) ? '' : lean > 30 ? 'You lean a lot. Some lean is good, but too much can pull you off balance.' : 'Your torso lean is in a balanced range.'),
    item('bob', 'Body level changes (height variation)', ok(bob) ? `${fmt(bob * 100, 1)}%` : '—', bob, !ok(bob) ? 'info' : bob > 0.1 ? 'note' : 'good', !ok(bob) ? '' : bob > 0.1 ? 'Your body level rises and falls a lot. Staying low through moves keeps you ready to explode.' : 'You keep a consistent body level.'),
    item('upper', 'Upper-body steadiness (variation in lean)', `±${fmt(core.leanSd, 1)}°`, core.leanSd, !ok(core.leanSd) ? 'info' : core.leanSd > 8 ? 'note' : 'good', !ok(core.leanSd) ? '' : core.leanSd > 8 ? 'Your upper body swings while your legs move. A steadier torso makes the ball easier to control.' : 'Your upper body stays steady while your legs work.'),
    item('speed', 'Movement speed (hip speed, torso lengths per second)', fmt(core.speed, 2), core.speed, 'info', 'Average hip speed across the clip. Compare later clips of the same drill, since it depends on what you do.'),
    item('changes', 'Direction changes detected', `${core.changes}`, core.changes, 'info', 'Number of clear left-right changes of direction.'));
  const hand = Math.max(...low.filter(ok), nan);
  if (Number.isFinite(hand)) out.estimated.push(item('hand', 'Dribbling hand height', `${Math.round(hand * 100)}% of time below the waist`, hand, hand < 0.5 ? 'note' : 'good', hand < 0.5 ? 'The ball hand is often above waist level. Lower dribbles are harder to steal.' : 'Your dribbling hand mostly stays below the waist.'));
  else ne('Hand positioning', 'Your hands were not visible enough.');
  if (side === 'front' || side === 'angled') {
    const st = core.stance;
    out.measured.push(item('stance', 'Foot width (ankle gap vs shoulder width)', ok(st) ? `${fmt(st, 1)}×` : '—', st, !ok(st) ? 'info' : st < 0.9 ? 'note' : 'good', !ok(st) ? '' : st < 0.9 ? 'Your feet are narrower than your shoulders, which makes balance harder.' : 'Your feet are at least shoulder width apart.'));
  } else ne('Foot width', 'Your feet width needs a front or angled camera view, and this clip was filmed from the side.');
  ne('Ball control and dribble quality', 'This requires reliable ball tracking, which is not available yet.');
  return [];
}

// ── Defensive / lateral movement ──
function defense(F, T, core, out, ne, side) {
  const bob = ok(core.crouchSd) && ok(core.crouchAvg) && core.crouchAvg ? core.crouchSd / Math.abs(core.crouchAvg) : nan;
  out.measured.push(
    item('knee', 'Average knee bend (knee angle)', `${fmt(core.knee)}°`, core.knee, !ok(core.knee) ? 'info' : core.knee > 150 ? 'note' : 'good', !ok(core.knee) ? '' : core.knee > 150 ? 'Your stance is fairly tall. A deeper knee bend helps you slide and react.' : 'You hold a low, bent-knee stance.'),
    item('lean', 'Torso lean', `${fmt(core.lean)}°`, core.lean, !ok(core.lean) ? 'info' : core.lean > 25 ? 'note' : 'good', !ok(core.lean) ? '' : core.lean > 25 ? 'You lean forward a lot. A mostly upright chest keeps you balanced when you change direction.' : 'Your chest stays in a balanced position.'),
    item('bob', 'Body level changes while moving', ok(bob) ? `${fmt(bob * 100, 1)}%` : '—', bob, !ok(bob) ? 'info' : bob > 0.1 ? 'note' : 'good', !ok(bob) ? '' : bob > 0.1 ? 'Your hips rise and fall as you move (bobbing). Staying level makes you quicker.' : 'You stay level as you move.'),
    item('speed', 'Lateral speed (torso lengths per second)', fmt(core.speed, 2), core.speed, 'info', 'Average sideways speed. Compare the same drill over time.'),
    item('changes', 'Direction changes detected', `${core.changes}`, core.changes, 'info', 'Number of clear left-right changes.'));
  if (side === 'front' || side === 'angled') {
    const st = core.stance;
    out.measured.push(item('stance', 'Foot width (ankle gap vs shoulder width)', ok(st) ? `${fmt(st, 1)}×` : '—', st, !ok(st) ? 'info' : st < 1.1 ? 'note' : 'good', !ok(st) ? '' : st < 1.1 ? 'Your feet are close together. A base wider than your shoulders improves balance.' : 'You keep a wide base.'));
    const sign = F.map(f => ok(f.ankDX) ? Math.sign(f.ankDX) : 0).filter(Boolean); let flips = 0; for (let i = 1; i < sign.length; i++) if (sign[i] !== sign[i - 1]) flips++;
    out.estimated.push(item('cross', 'Possible foot crossing', `${flips} left-right foot swaps`, flips, flips > 2 ? 'note' : 'good', flips > 2 ? 'Your ankles swapped sides several times, which can mean crossing feet while sliding. Check it on video.' : 'No clear foot crossing was detected.'));
  } else ne('Foot width and foot crossing', 'These need a front or angled camera view, and this clip was filmed from the side.');
  return [];
}

// ── Footwork ──
function footwork(F, T, core, out, ne, side) {
  const rot = (() => { const w = F.map(f => f.shW).filter(ok); return w.length && ok(core.torso) ? (Math.max(...w) - Math.min(...w)) / core.torso : nan; })();
  out.measured.push(
    item('knee', 'Average knee bend (knee angle)', `${fmt(core.knee)}°`, core.knee, !ok(core.knee) ? 'info' : core.knee > 160 ? 'note' : 'good', !ok(core.knee) ? '' : core.knee > 160 ? 'You are standing quite tall. Bent knees make pivots and jab steps more balanced.' : 'You keep your knees bent.'),
    item('lean', 'Torso lean', `${fmt(core.lean)}°`, core.lean, !ok(core.lean) ? 'info' : core.lean > 25 ? 'note' : 'good', !ok(core.lean) ? '' : core.lean > 25 ? 'You lean a lot, which can pull you off balance mid-pivot.' : 'Your torso stays balanced.'),
    item('rotation', 'Body rotation range (change in apparent shoulder width)', fmt(rot, 2), rot, 'info', 'A larger number means more turning of your shoulders toward and away from the camera, for example during pivots.'),
    item('changes', 'Direction changes detected', `${core.changes}`, core.changes, 'info', 'Number of clear left-right changes.'),
    item('speed', 'Movement speed (torso lengths per second)', fmt(core.speed, 2), core.speed, 'info', 'Average hip speed. Compare the same drill later.'));
  ne('Pivot-foot travel (traveling)', 'The pose model cannot tell reliably whether your pivot foot slid, so traveling is not judged.');
  return [];
}

// ── Finishing ──
function finishing(F, T, core, out, ne) {
  const ank = F.map(f => f.ankY), base = pctile(ank, 0.85);
  const rise = ank.map(a => ok(a) && ok(base) && ok(core.torso) ? (base - a) / core.torso : nan);
  const pk = peaks(rise, T, { min: 0.2, sep: 1.0 });
  const reps = pk.map(i => {
    const t = T[i], win = F.filter(f => Math.abs(f.t - t) <= 0.25), pre = F.filter(f => f.t >= t - 1 && f.t <= t);
    const reach = maxF(win.map(f => maxF([f.wL, f.wR])));
    const arm = (F[i].wL ?? -9) > (F[i].wR ?? -9) ? 'L' : 'R';
    return { t, rise: rise[i], reach, elbow: maxF(win.map(f => f['elbow' + arm])), lean: F[i].lean, kneeMin: minF(pre.map(f => f.knee)) };
  });
  if (!reps.length) { ne('Finishing repetitions', 'No clear jump (both feet leaving the floor) was found in the video.'); return reps; }
  const v = k => reps.map(r => r[k]).filter(ok);
  const rise2 = avg(v('rise')), reach = avg(v('reach')), elbow = avg(v('elbow')), lean = avg(v('lean')), km = avg(v('kneeMin'));
  out.measured.push(
    item('rise', 'Jump height proxy (feet lift, torso lengths)', fmt(rise2, 2), rise2, 'info', 'How far your feet leave the floor relative to your body size. It is not in inches, but it is comparable between clips from the same camera distance.'),
    item('reach', 'Reach at the top (wrist above shoulder, torso lengths)', fmt(reach, 2), reach, !ok(reach) ? 'info' : reach < 0.7 ? 'note' : 'good', !ok(reach) ? '' : reach < 0.7 ? 'Your finishing hand stays low at the top. Extend fully toward the rim.' : 'You extend well above your shoulders at the top.'),
    item('elbow', 'Elbow angle at the top', `${fmt(elbow)}°`, elbow, !ok(elbow) ? 'info' : elbow < 130 ? 'note' : 'good', !ok(elbow) ? '' : elbow < 130 ? 'Your arm is still bent at the top. Full extension helps you finish over defenders.' : 'Your arm extends well at the top.'),
    item('knee', 'Knee load before takeoff (smallest knee angle)', `${fmt(km)}°`, km, 'info', 'A deeper bend before takeoff stores power. Compare reps.'),
    item('lean', 'Torso lean at the top', `${fmt(lean)}°`, lean, !ok(lean) ? 'info' : lean > 20 ? 'note' : 'good', !ok(lean) ? '' : lean > 20 ? 'You are leaning noticeably at the top of the jump.' : 'You are fairly upright at the top.'));
  ne('Footwork steps before takeoff (two-step rhythm)', 'Counting steps needs a reliable foot-contact signal that is not available yet.');
  return reps;
}

// ── Passing ──
function passing(F, T, core, out, ne) {
  const ext = F.map(f => Math.max(ok(f.armExtL) ? f.armExtL : -9, ok(f.armExtR) ? f.armExtR : -9)).map(x => (x === -9 ? nan : x));
  const pk = peaks(ext, T, { min: 0.85, sep: 0.8 });
  const reps = pk.map(i => {
    const arm = (F[i].armExtL ?? -9) > (F[i].armExtR ?? -9) ? 'L' : 'R', t = T[i];
    const w = F.filter(f => f.t >= t - 0.6 && f.t <= t);
    const hx = w.map(f => f.hipX).filter(ok);
    return { t, elbow: F[i]['elbow' + arm], ext: ext[i], lean: F[i].lean, shift: hx.length > 2 && ok(core.torso) ? Math.abs(hx[hx.length - 1] - hx[0]) / core.torso : nan };
  });
  if (!reps.length) { ne('Passing repetitions', 'No clear arm extension (a pass) was found in the video.'); return reps; }
  const v = k => reps.map(r => r[k]);
  const el = avg(v('elbow')), ex = avg(v('ext')), lean = avg(v('lean')), shift = avg(v('shift')), es = sd(v('elbow'));
  out.measured.push(
    item('ext', 'Arm extension at release (1.0 = fully straight)', fmt(ex, 2), ex, !ok(ex) ? 'info' : ex < 0.92 ? 'note' : 'good', !ok(ex) ? '' : ex < 0.92 ? 'Your arms do not fully extend on the pass. Extend through the target for speed and accuracy.' : 'You extend your arms well through the pass.'),
    item('elbow', 'Elbow angle at release', `${fmt(el)}°`, el, 'info', 'Close to 180° means a straight arm.'),
    item('shift', 'Body movement into the pass (hip travel, torso lengths)', fmt(shift, 2), shift, !ok(shift) ? 'info' : shift < 0.1 ? 'note' : 'good', !ok(shift) ? '' : shift < 0.1 ? 'Little body movement goes into the pass. Stepping toward the target adds power.' : 'You move your body into the pass.'),
    item('lean', 'Torso lean at release', `${fmt(lean)}°`, lean, 'info', 'Some forward lean shows you are stepping into the pass.'));
  if (reps.length >= 3) out.measured.push(item('rep', 'Consistency: elbow angle (spread across reps)', `±${fmt(es, 1)}°`, es, !ok(es) ? 'info' : es > 14 ? 'note' : 'good', !ok(es) ? '' : es > 14 ? 'Your release varies from rep to rep.' : 'Your release is repeatable.'));
  ne('Pass accuracy and target', 'Whether the ball reached the target needs ball tracking, which is not available yet.');
  return reps;
}
