// Animated player figure. A pose sets hip height, torso lean, feet and hand targets; knees and elbows are solved
// with 2-link IK, so every keyframe stays physically plausible and interpolates smoothly. Coordinates: world units,
// y up, ground at y = 0 (about 1.25 units per inch, so the figure is ~6'3").
import { s } from './util.js';

const LEN = { thigh: 24, shin: 23, ua: 16, fa: 14.5, torso: 30, neck: 9.6, head: 6.6, foot: 7.5, hand: 4 };
export const BALL_R = 5.2;
export const RIM = { x: 118, y: 150 };
const rad = d => d * Math.PI / 180;
const lerp = (a, b, t) => a + (b - a) * t;
const dist = (a, b) => Math.hypot(b[0] - a[0], b[1] - a[1]);

export const DEF = { x: 0, hy: 48, lean: 3, hd: 0, ra: [3, 2], la: [-3, 2], rw: [3, -29], lw: [-2, -29], rt: 100, lt: 100, rh: null, lh: null, face: 1 };
export const pose = (...parts) => Object.assign({}, DEF, ...parts);

const PAL = {
  me: { near: { skin: '#c4855a', jersey: '#A6F36A', shorts: '#5aa52c', shoe: '#F4F5F7' }, far: { skin: '#8b5a3c', jersey: '#7fc94c', shorts: '#3f7a1d', shoe: '#9aa1ad' }, hair: '#0d0f13', band: '#A6F36A' },
  mate: { near: { skin: '#a8714c', jersey: '#d8f7b8', shorts: '#7fbf55', shoe: '#F4F5F7' }, far: { skin: '#7a4d33', jersey: '#b4e590', shorts: '#5a9a35', shoe: '#9aa1ad' }, hair: '#0d0f13', band: '#F4F5F7' },
  opp: { near: { skin: '#9a7058', jersey: '#6a7b98', shorts: '#46536b', shoe: '#c9ced8' }, far: { skin: '#6e4e3c', jersey: '#4f5d76', shorts: '#343e52', shoe: '#7d8594' }, hair: '#0d0f13', band: '#6a7b98' },
};

function ik(P, T, a, b, dir) {
  const dx = T[0] - P[0], dy = T[1] - P[1], d = Math.hypot(dx, dy) || 0.001;
  const dc = Math.min(d, a + b - 0.01), ux = dx / d, uy = dy / d;
  const along = (a * a - b * b + dc * dc) / (2 * dc), ht = Math.sqrt(Math.max(0, a * a - along * along));
  return [[P[0] + ux * along - uy * ht * dir, P[1] + uy * along + ux * ht * dir], [P[0] + ux * dc, P[1] + uy * dc]];
}
// Front view: limbs bending toward the camera are foreshortened, so the joint just bows slightly outward.
function fk(P, T, a, b, dir, k = 0.45) {
  const d = dist(P, T), dc = Math.min(d, a + b - 0.01), u = [(T[0] - P[0]) / (d || 1), (T[1] - P[1]) / (d || 1)];
  const E = [P[0] + u[0] * dc, P[1] + u[1] * dc], bend = Math.min(7, (a + b - dc) * k);
  return [[(P[0] + E[0]) / 2 + dir * bend, (P[1] + E[1]) / 2], E];
}

export function solve(p, view = 'side') {
  const side = view !== 'front', lr = rad(p.lean);
  const H = [p.x, p.hy];
  const S = [H[0] + Math.sin(lr) * LEN.torso, H[1] + Math.cos(lr) * LEN.torso];
  const hr = rad(p.lean + p.hd), HD = [S[0] + Math.sin(hr) * LEN.neck, S[1] + Math.cos(hr) * LEN.neck];
  const J = { H, S, HD, view, lean: p.lean, hd: p.hd, x: p.x, face: p.face };
  for (const sd of ['r', 'l']) {
    const sg = sd === 'r' ? -1 : 1; // front view: r = screen left
    const hip = side ? [H[0] + (sd === 'r' ? 0.6 : -0.6), H[1]] : [H[0] + sg * 5.5, H[1]];
    const sh = side ? [S[0] + (sd === 'r' ? 0.6 : -0.6), S[1]] : [S[0] + sg * Math.cos(lr) * 9.5, S[1] - sg * Math.sin(lr) * 9.5];
    const A = [p.x + p[sd + 'a'][0], p[sd + 'a'][1]];
    const [knee, ank] = side ? ik(hip, A, LEN.thigh, LEN.shin, 1) : fk(hip, A, LEN.thigh, LEN.shin, sg, 0.35);
    const W = [sh[0] + p[sd + 'w'][0], sh[1] + p[sd + 'w'][1]];
    const [elb, wr] = side ? ik(sh, W, LEN.ua, LEN.fa, -1) : fk(sh, W, LEN.ua, LEN.fa, sg, 0.55);
    const ta = rad(p[sd + 't']);
    const toe = side ? [ank[0] + Math.sin(ta) * LEN.foot, ank[1] - Math.cos(ta) * LEN.foot] : [ank[0] + sg * 3.6, ank[1] - 1.2];
    let hd;
    if (p[sd + 'h'] != null) { const a = rad(p[sd + 'h']); hd = [Math.sin(a), -Math.cos(a)]; } else { const L = dist(elb, wr) || 1; hd = [(wr[0] - elb[0]) / L, (wr[1] - elb[1]) / L]; }
    const tip = [wr[0] + hd[0] * LEN.hand, wr[1] + hd[1] * LEN.hand];
    J[sd] = { hip, sh, knee, ank, toe, elb, wr, tip };
  }
  if (p.face === -1) { // mirror around hip x
    const m = pt => { pt[0] = 2 * p.x - pt[0]; };
    [J.S, J.HD].forEach(m); for (const sd of ['r', 'l']) Object.values(J[sd]).forEach(m);
  }
  return J;
}

export function lerpPose(a, b, t) {
  const o = {};
  for (const k of Object.keys(b)) {
    const A = a[k] ?? b[k], B = b[k];
    if (Array.isArray(B)) o[k] = B.map((v, i) => lerp(A[i] ?? v, v, t));
    else if (k === 'face') o[k] = t < 0.5 ? A : B;
    else if (typeof B === 'number' && typeof A === 'number') o[k] = lerp(A, B, t);
    else o[k] = t < 0.5 ? A : B;
  }
  return o;
}

const JN = { H: J => J.H, S: J => J.S, hd: J => J.HD };
export function joint(J, name) {
  if (JN[name]) return JN[name](J);
  const sd = name[0], k = { k: 'knee', a: 'ank', t: 'toe', e: 'elb', w: 'wr', h: 'hip', s: 'sh', f: 'tip' }[name[1]];
  return J[sd]?.[k];
}

export function ballPos(spec, J) {
  if (!spec) return null;
  if (spec === 'rim') return [RIM.x, RIM.y + 2];
  if (spec === 'net') return [RIM.x, RIM.y - 13];
  const [t, a = 0, b = 0] = spec;
  const f = J.face || 1;
  if (t === 'r' || t === 'l') { const w = J[t].wr; return [w[0] + a * f, w[1] + b]; }
  if (t === 'b') { const w1 = J.r.wr, w2 = J.l.wr; return [(w1[0] + w2[0]) / 2 + a * f, (w1[1] + w2[1]) / 2 + b]; }
  if (t === 'f') return [J.x + a * f, BALL_R + b];
  if (t === 'w') return [a, b];
  return null;
}

const EASE = { io: t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2, lin: t => t, out: t => 1 - Math.pow(1 - t, 3), in: t => t * t * t };

// ---------- clip timeline ----------
// clip: { view, frame:[cx, yBottom, width], props, keys:[{ p, p2, ball, t, hold, e, arc, cue, bz }], figs }
export function compile(clip) {
  const keys = clip.keys.map(k => ({ t: 500, hold: 0, ...k }));
  let T = 0; const at = [];
  keys.forEach((k, i) => { if (i) T += k.t; at.push(T); T += k.hold; });
  const loopT = clip.noLoop ? 0 : (clip.loopT ?? 450);
  const end = T + (clip.endHold ?? 700);
  return { ...clip, keys, at, dur: end + loopT, end };
}

export function sample(C, time) {
  const { keys, at } = C;
  let tt = time % C.dur;
  // Loop transition: last key back to first.
  if (tt >= C.end) {
    const u = EASE.io((tt - C.end) / (C.dur - C.end || 1));
    return frameBetween(C, keys[keys.length - 1], keys[0], u, keys.length - 1, true);
  }
  let i = 0; while (i < keys.length - 1 && tt >= at[i + 1]) i++;
  if (i >= keys.length - 1 || tt <= at[i] + keys[i].hold) return frameBetween(C, keys[i], keys[i], 0, i);
  const start = at[i] + keys[i].hold, k = keys[i + 1];
  const u = (EASE[k.e] || EASE.io)(Math.min(1, (tt - start) / (k.t || 1)));
  return frameBetween(C, keys[i], k, u, u > 0.999 ? i + 1 : i);
}

function frameBetween(C, A, B, u, cueIdx, looping) {
  const view = C.view || 'side';
  const p = lerpPose(A.p, B.p, u);
  const J = solve(p, view);
  let J2 = null;
  if (A.p2 || B.p2) J2 = solve(lerpPose(A.p2 || B.p2, B.p2 || A.p2, u), C.view2 || view);
  let ball = null;
  const sa = A.ball, sb = B.ball;
  if (sa || sb) {
    const same = sa && sb && Array.isArray(sa) && Array.isArray(sb) && sa[0] === sb[0] && 'rlb'.includes(sa[0]);
    if (same) ball = ballPos([sa[0], lerp(sa[1] || 0, sb[1] || 0, u), lerp(sa[2] || 0, sb[2] || 0, u)], J);
    else {
      const pa = ballPos(sa || sb, solve(A.p, view)), pb = ballPos(sb || sa, solve(B.p, view));
      if (pa && pb) {
        const uu = looping ? 1 : u;
        ball = [lerp(pa[0], pb[0], uu), lerp(pa[1], pb[1], uu) + (looping ? 0 : (B.arc || 0) * 4 * uu * (1 - uu))];
      } else ball = pa || pb;
    }
  }
  const bz = (u < 0.5 ? A.bz : B.bz) || 0;
  return { J, J2, ball, bz, cue: C.keys[cueIdx]?.cue || [], hl: C.keys[cueIdx]?.hl, idx: cueIdx };
}

// ---------- rendering ----------
const LIMB = { thigh: 7.6, shin: 6.6, ua: 6.2, fa: 5.4, hand: 3.8, foot: 4.6 };

function figureEls(pal) {
  const L = (c, w) => s('line', { stroke: c, 'stroke-width': w, 'stroke-linecap': 'round' });
  const mk = side => ({
    thigh: L(pal[side].skin, LIMB.thigh), shin: L(pal[side].skin, LIMB.shin), foot: L(pal[side].shoe, LIMB.foot), shorts: L(pal[side].shorts, 10.5),
    ua: L(pal[side].skin, LIMB.ua), fa: L(pal[side].skin, LIMB.fa), hand: L(pal[side].skin, LIMB.hand), sleeve: L(pal[side].jersey, 7.4),
  });
  const g = s('g', {}), far = mk('far'), near = mk('near');
  const torso = s('path', { fill: pal.near.jersey, stroke: pal.near.jersey, 'stroke-width': 4, 'stroke-linejoin': 'round' });
  const neck = L(pal.near.skin, 5);
  const head = s('circle', { r: LEN.head, fill: pal.near.skin });
  const hair = s('path', { fill: pal.hair });
  const band = s('path', { stroke: pal.band, 'stroke-width': 2.6, fill: 'none', 'stroke-linecap': 'round' });
  const eye1 = s('circle', { r: 0.95, fill: '#0d0f13' }), eye2 = s('circle', { r: 0.95, fill: '#0d0f13' });
  const beard = s('path', { fill: pal.hair, opacity: 0.85 });
  const num = s('text', { 'font-size': 6, 'font-weight': 900, 'text-anchor': 'middle', fill: '#0b0f08', opacity: 0.55, style: 'font-family:system-ui,sans-serif' }, '');
  g.append(far.ua, far.fa, far.hand, far.thigh, far.shin, far.foot, far.shorts, torso, num, neck, head, hair, band, eye1, eye2, beard, near.thigh, near.shin, near.foot, near.shorts, near.sleeve, near.ua, near.fa, near.hand);
  g.insertBefore(far.sleeve, far.ua.nextSibling);
  return { g, far, near, torso, neck, head, hair, band, eye1, eye2, beard, num };
}

const setL = (el, a, b) => { el.setAttribute('x1', a[0].toFixed(2)); el.setAttribute('y1', (-a[1]).toFixed(2)); el.setAttribute('x2', b[0].toFixed(2)); el.setAttribute('y2', (-b[1]).toFixed(2)); };
const along = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

function drawFigure(F, J) {
  const side = J.view !== 'front';
  // In side view the figure's right side (r) faces the camera; in front view both sides are equally visible.
  const parts = side ? [['far', 'l'], ['near', 'r']] : [['far', 'l'], ['near', 'r']];
  for (const [nm, sd] of parts) {
    const P = F[nm], j = J[sd];
    setL(P.thigh, j.hip, j.knee); setL(P.shin, j.knee, j.ank); setL(P.foot, j.ank, j.toe);
    setL(P.shorts, along(j.hip, j.knee, -0.05), along(j.hip, j.knee, 0.5));
    setL(P.ua, j.sh, j.elb); setL(P.fa, j.elb, j.wr); setL(P.hand, j.wr, j.tip); setL(P.sleeve, j.sh, along(j.sh, j.elb, 0.3));
  }
  if (!side) for (const k of ['thigh', 'shin', 'foot', 'shorts', 'ua', 'fa', 'hand', 'sleeve']) F.far[k].setAttribute('stroke', F.near[k].getAttribute('stroke'));
  const lr = rad(J.lean) * (J.face || 1), n = [Math.cos(lr), -Math.sin(lr)];
  const ws = side ? 6.6 : 10.5, wh = side ? 5.6 : 7.2;
  const S = J.S, H = J.H, pts = [[S[0] + n[0] * ws, S[1] + n[1] * ws], [S[0] - n[0] * ws, S[1] - n[1] * ws], [H[0] - n[0] * wh, H[1] - n[1] * wh], [H[0] + n[0] * wh, H[1] + n[1] * wh]];
  F.torso.setAttribute('d', 'M' + pts.map(p => `${p[0].toFixed(2)} ${(-p[1]).toFixed(2)}`).join(' L') + 'Z');
  const mid = along(H, S, 0.55); F.num.setAttribute('x', mid[0].toFixed(2)); F.num.setAttribute('y', (-mid[1] + 2).toFixed(2)); F.num.textContent = side ? '' : '6';
  const nb = along(S, J.HD, 0.15);
  setL(F.neck, S, along(S, J.HD, 0.5));
  const hc = J.HD; F.head.setAttribute('cx', hc[0].toFixed(2)); F.head.setAttribute('cy', (-hc[1]).toFixed(2));
  const ha = rad(J.lean + J.hd) * (J.face || 1), up = [Math.sin(ha), Math.cos(ha)], rt = [Math.cos(ha), -Math.sin(ha)];
  const P2 = (u, r) => [hc[0] + up[0] * u + rt[0] * r, hc[1] + up[1] * u + rt[1] * r];
  const ps = pp => `${pp[0].toFixed(2)} ${(-pp[1]).toFixed(2)}`;
  // hair cap
  const R = LEN.head + 0.3;
  F.hair.setAttribute('d', `M${ps(P2(1.2, -R))} A${R} ${R} 0 0 1 ${ps(P2(1.2, R))} Z`);
  F.band.setAttribute('d', `M${ps(P2(2.2, -R + 0.3))} L${ps(P2(2.2, R - 0.3))}`);
  const f = J.face || 1;
  if (side) {
    const e = P2(0.6, 3.4 * f); F.eye1.setAttribute('cx', e[0].toFixed(2)); F.eye1.setAttribute('cy', (-e[1]).toFixed(2)); F.eye2.setAttribute('r', 0);
    F.beard.setAttribute('d', `M${ps(P2(-1.5, 4.2 * f))} Q${ps(P2(-7.4, 3 * f))} ${ps(P2(-5, -1.5 * f))} L${ps(P2(-2.5, -1 * f))} Z`);
  } else {
    const e1 = P2(0.6, -2.3), e2 = P2(0.6, 2.3);
    F.eye1.setAttribute('cx', e1[0].toFixed(2)); F.eye1.setAttribute('cy', (-e1[1]).toFixed(2)); F.eye2.setAttribute('r', 0.95);
    F.eye2.setAttribute('cx', e2[0].toFixed(2)); F.eye2.setAttribute('cy', (-e2[1]).toFixed(2));
    F.beard.setAttribute('d', `M${ps(P2(-1.6, -5.4))} Q${ps(P2(-8.6, 0))} ${ps(P2(-1.6, 5.4))} Q${ps(P2(-4.8, 0))} ${ps(P2(-1.6, -5.4))} Z`);
  }
  void nb;
}

// Props drawn once per clip.
function propsLayer(clip, frame) {
  const g = s('g', {});
  const [cx, yb, w] = frame, x0 = cx - w / 2;
  g.append(s('rect', { x: x0, y: 0, width: w, height: -yb + 2, fill: '#141a24' }), s('line', { x1: x0, y1: 0, x2: x0 + w, y2: 0, stroke: '#2f3a4d', 'stroke-width': 0.8 }));
  const P = clip.props || {};
  if (P.rim) {
    const r = RIM;
    g.append(s('line', { x1: r.x + 11, y1: -(r.y - 8), x2: r.x + 11, y2: -(r.y + 28), stroke: '#c9ced8', 'stroke-width': 2.6, 'stroke-linecap': 'round' }),
      s('line', { x1: r.x + 11, y1: -r.y, x2: r.x + 8.5, y2: -r.y, stroke: '#F2994A', 'stroke-width': 1.6 }),
      s('path', { d: `M${r.x - 9} ${-r.y} L${r.x - 6} ${-(r.y - 13)} L${r.x + 6} ${-(r.y - 13)} L${r.x + 9} ${-r.y}`, fill: 'none', stroke: '#d6dae2', 'stroke-width': 0.7, opacity: 0.8 }),
      s('path', { d: `M${r.x - 4.5} ${-r.y} L${r.x - 2} ${-(r.y - 13)} M${r.x + 4.5} ${-r.y} L${r.x + 2} ${-(r.y - 13)} M${r.x - 7.5} ${-(r.y - 6)} L${r.x + 7.5} ${-(r.y - 6)}`, fill: 'none', stroke: '#d6dae2', 'stroke-width': 0.5, opacity: 0.6 }),
      s('line', { x1: r.x - 9, y1: -r.y, x2: r.x + 9, y2: -r.y, stroke: '#F2994A', 'stroke-width': 2, 'stroke-linecap': 'round' }));
  }
  for (const c of P.cones || []) g.append(s('path', { d: `M${c - 4} 0 L${c} -11 L${c + 4} 0 Z`, fill: '#F2994A', stroke: '#b86a25', 'stroke-width': 0.6 }), s('rect', { x: c - 5, y: -1, width: 10, height: 1.6, fill: '#b86a25' }));
  for (const L of P.lines || []) {
    g.append(s('rect', { x: L.x - 1.2, y: -0.4, width: 2.4, height: 3.2, fill: L.col || '#A6F36A', opacity: 0.85 }));
    if (L.label) g.append(lbl(L.label, L.x, 9, { anchor: 'middle', size: 5.4, fill: L.col || '#A6F36A' }));
  }
  if (P.wall != null) g.append(s('rect', { x: P.wall, y: -120, width: 6, height: 120, fill: '#2a3344' }), s('circle', { cx: P.wall, cy: -55, r: 4, fill: 'none', stroke: '#A6F36A', 'stroke-width': 1 }));
  if (P.board) g.append(s('rect', { x: P.board[0], y: -(P.board[1] + 30), width: 34, height: 26, rx: 2, fill: '#0b0e14', stroke: '#3a4558', 'stroke-width': 0.8 }), lbl('HOME 52  AWAY 50', P.board[0] + 17, -(P.board[1] + 19), { anchor: 'middle', size: 3.6, fill: '#F2994A' }), lbl('0:24', P.board[0] + 17, -(P.board[1] + 10), { anchor: 'middle', size: 6, fill: '#F2994A' }));
  if (P.text) for (const t of P.text) g.append(lbl(t.t, t.at[0], -t.at[1], { anchor: t.a || 'middle', size: t.size || 5.5, fill: t.col || '#A5AAB5' }));
  return g;
}

let BOUNDS = null; // [x0, yTopScreen, x1, yBottomScreen] of the view being drawn, used to keep labels on screen
function lbl(text, x, y, { anchor = 'start', size = 5.6, fill = '#F4F5F7', weight = 800 } = {}) {
  if (BOUNDS) {
    const w = String(text).length * size * 0.56, [x0, yt, x1, ybm] = BOUNDS;
    if (anchor === 'start') x = Math.max(x0 + 1, Math.min(x, x1 - w - 1));
    else if (anchor === 'end') x = Math.min(x1 - 1, Math.max(x, x0 + w + 1));
    else x = Math.max(x0 + w / 2 + 1, Math.min(x, x1 - w / 2 - 1));
    y = Math.max(yt + size + 1, Math.min(y, ybm - 1));
  }
  return s('text', { x, y, 'text-anchor': anchor, 'font-size': size, 'font-weight': weight, fill, stroke: '#090B10', 'stroke-width': size * 0.32, 'paint-order': 'stroke', 'stroke-linejoin': 'round', style: 'font-family:system-ui,-apple-system,sans-serif' }, text);
}

function arrowPath(a, b, col, { curve = 0, w = 1.4, dash } = {}) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  const c = [mx - dy / L * curve, my + dx / L * curve];
  const ang = Math.atan2((b[1] - c[1]), (b[0] - c[0]));
  const hl = 3.4, hw = 2.1;
  const p1 = [b[0] - Math.cos(ang) * hl + Math.sin(ang) * hw, b[1] - Math.sin(ang) * hl - Math.cos(ang) * hw];
  const p2 = [b[0] - Math.cos(ang) * hl - Math.sin(ang) * hw, b[1] - Math.sin(ang) * hl + Math.cos(ang) * hw];
  const ps = p => `${p[0].toFixed(2)} ${(-p[1]).toFixed(2)}`;
  const g = s('g', {});
  g.append(s('path', { d: `M${ps(a)} Q${ps(c)} ${ps(b)}`, fill: 'none', stroke: col, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-dasharray': dash || null }),
    s('path', { d: `M${ps(b)} L${ps(p1)} L${ps(p2)} Z`, fill: col }));
  return g;
}

function resolvePt(J, ref, ball) {
  if (Array.isArray(ref)) return ref;
  if (ref === 'rim') return [RIM.x, RIM.y];
  if (ref === 'ball') return ball;
  if (typeof ref === 'string' && ref.endsWith('@g')) { const p = joint(J, ref.slice(0, -2)); return p && [p[0], 0]; }
  return joint(J, ref);
}

function drawCues(layer, F, cues, mode) {
  layer.replaceChildren();
  const accent = mode === 'bad' ? '#FF6B6B' : '#A6F36A';
  const { J, J2, ball } = F;
  for (const c of cues) {
    const col = c.col || (c.bad ? '#FF6B6B' : accent);
    const JJ = c.on2 ? J2 : J; if (!JJ) continue;
    if (c.ring) {
      const p = resolvePt(JJ, c.ring, ball); if (!p) continue;
      layer.append(s('circle', { cx: p[0], cy: -p[1], r: c.r || 6.5, fill: 'none', stroke: col, 'stroke-width': 1.3, class: 'cue-pulse' }));
      if (c.label) { const right = c.side ? c.side > 0 : p[0] >= JJ.H[0] - 2; const lx = p[0] + (right ? 10 : -10), ly = -(p[1] + (c.dy ?? 7)); layer.append(s('line', { x1: p[0] + (right ? 4.6 : -4.6), y1: -(p[1] + 4.6), x2: lx + (right ? -1 : 1), y2: ly + 2, stroke: col, 'stroke-width': 0.6 }), lbl(c.label, lx, ly, { anchor: right ? 'start' : 'end', fill: col })); }
    }
    if (c.ang) {
      const nm = c.ang, sd = nm[0], tp = nm[1];
      const j = JJ[sd]; if (!j) continue;
      const [A, B, C] = tp === 'k' ? [j.hip, j.knee, j.ank] : tp === 'e' ? [j.sh, j.elb, j.wr] : [JJ.S, j.hip, j.knee];
      const a1 = Math.atan2(A[1] - B[1], A[0] - B[0]), a2 = Math.atan2(C[1] - B[1], C[0] - B[0]);
      let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
      const deg = Math.round(Math.abs(d) * 180 / Math.PI), r = 7.5;
      const e1 = [B[0] + Math.cos(a1) * r, B[1] + Math.sin(a1) * r], e2 = [B[0] + Math.cos(a2) * r, B[1] + Math.sin(a2) * r];
      layer.append(s('path', { d: `M${B[0]} ${-B[1]} L${e1[0]} ${-e1[1]} A${r} ${r} 0 0 ${d > 0 ? 0 : 1} ${e2[0]} ${-e2[1]} Z`, fill: col, 'fill-opacity': 0.22, stroke: col, 'stroke-width': 0.7 }));
      const am = a1 + d / 2, tx = B[0] + Math.cos(am) * (r + 7), ty = B[1] + Math.sin(am) * (r + 7);
      layer.append(lbl(`${deg}°`, tx, -ty + 2, { anchor: 'middle', size: 5.4, fill: col }));
    }
    if (c.plumb) {
      const x = typeof c.plumb === 'number' ? c.plumb : JJ.H[0];
      layer.append(s('line', { x1: x, y1: 2, x2: x, y2: -(c.top || 112), stroke: col, 'stroke-width': 0.8, 'stroke-dasharray': '2.5 2', opacity: 0.85 }));
      if (c.label) layer.append(lbl(c.label, x + 3, -(c.top || 112) + 5, { fill: col, size: 5 }));
    }
    if (c.arrow) {
      const a = resolvePt(JJ, c.arrow[0], ball), b = resolvePt(JJ, c.arrow[1], ball); if (!a || !b) continue;
      layer.append(arrowPath(a, b, col, { curve: c.curve || 0, dash: c.dash }));
      if (c.label) layer.append(lbl(c.label, (a[0] + b[0]) / 2 + (c.lx || 0), -((a[1] + b[1]) / 2 + (c.ly ?? 5)), { anchor: 'middle', fill: col, size: 5.2 }));
    }
    if (c.eye) {
      const hd = JJ.HD, t = resolvePt(JJ, c.eye, ball); if (!t) continue;
      layer.append(s('line', { x1: hd[0], y1: -hd[1], x2: t[0], y2: -t[1], stroke: col, 'stroke-width': 0.9, 'stroke-dasharray': '1.6 1.6' }));
      if (c.label) layer.append(lbl(c.label, (hd[0] + t[0]) / 2, -((hd[1] + t[1]) / 2 + 4), { anchor: 'middle', fill: col, size: 5.2 }));
    }
    if (c.width) {
      const a = resolvePt(JJ, c.width[0]), b = resolvePt(JJ, c.width[1]); if (!a || !b) continue;
      const y = -(c.y ?? -4.5);
      layer.append(s('path', { d: `M${a[0]} ${y - 2} V${y} H${b[0]} V${y - 2}`, fill: 'none', stroke: col, 'stroke-width': 0.9 }), lbl(c.label || '', (a[0] + b[0]) / 2, y + 6.5, { anchor: 'middle', size: 5, fill: col }));
    }
    if (c.mark != null) {
      layer.append(s('ellipse', { cx: c.mark, cy: 0.6, rx: 4.6, ry: 1.4, fill: col, opacity: 0.55 }));
      if (c.label) layer.append(lbl(c.label, c.mark, 8, { anchor: 'middle', size: 4.8, fill: col }));
    }
    if (c.text) layer.append(lbl(c.text, c.at[0], -c.at[1], { anchor: c.a || 'middle', size: c.size || 5.6, fill: c.col || col }));
    if (c.speed) {
      const H = JJ.H, f = JJ.face || 1, n = c.speed === 'fast' ? 4 : 2;
      for (let i = 0; i < n; i++) { const y = H[1] + 18 - i * 9, x = H[0] - f * 10; layer.append(s('line', { x1: x, y1: -y, x2: x - f * (c.speed === 'fast' ? 16 : 7), y2: -y, stroke: col, 'stroke-width': 1, 'stroke-linecap': 'round', opacity: 0.7 })); }
      layer.append(lbl(c.speed === 'fast' ? 'FAST' : 'SLOW', H[0] - f * 18, -(H[1] + 30), { anchor: 'middle', size: 5, fill: col }));
    }
  }
}

function drawHL(layer, J, hl) {
  layer.replaceChildren();
  if (!hl) return;
  const L = (a, b, w) => { const e = s('line', { stroke: '#A6F36A', 'stroke-width': w, 'stroke-linecap': 'round', opacity: 0.38, class: 'hl-glow' }); setL(e, a, b); layer.append(e); };
  for (const part of [].concat(hl)) {
    if (part === 'legs') for (const sd of ['r', 'l']) { L(J[sd].hip, J[sd].knee, 11); L(J[sd].knee, J[sd].ank, 10); }
    if (part === 'core') L(J.H, J.S, 15);
    if (part === 'arm') { L(J.r.sh, J.r.elb, 10); L(J.r.elb, J.r.wr, 9); L(J.r.wr, J.r.tip, 7); }
    if (part === 'wrist') L(J.r.wr, J.r.tip, 8);
    if (part === 'feet') for (const sd of ['r', 'l']) L(J[sd].ank, J[sd].toe, 8);
    if (part === 'guide') { L(J.l.elb, J.l.wr, 9); L(J.l.wr, J.l.tip, 7); }
    if (part === 'eyes') { const e = s('circle', { cx: J.HD[0], cy: -J.HD[1], r: 9, fill: '#F4F5F7', opacity: 0.25, class: 'hl-glow' }); layer.append(e); }
  }
}

// A view = one SVG that renders a compiled clip at a given time.
export function createFigureView(clip, { mode } = {}) {
  const C = compile(clip);
  const frame = C.frame || [10, -6, 150];
  const [cx, yb, w] = frame, hgt = w * (frame[3] || 0.75);
  const svg = s('svg', { viewBox: `${cx - w / 2} ${-(yb + hgt)} ${w} ${hgt}`, class: 'figsvg', role: 'img' });
  svg.append(propsLayer(C, frame));
  const shadow = s('ellipse', { ry: 1.8, fill: '#000', opacity: 0.45 }), shadow2 = s('ellipse', { ry: 1.8, fill: '#000', opacity: 0.35 });
  const trail = s('g', {}), hlL = s('g', {});
  const F1 = figureEls(PAL.me), F2 = C.keys.some(k => k.p2) ? figureEls(PAL[C.p2pal || 'opp']) : null;
  const bounds = [cx - w / 2, -(yb + hgt), cx + w / 2, -yb];
  const ballG = () => s('g', { class: 'figball' }, s('circle', { r: BALL_R, fill: '#F2994A', stroke: '#7a3f10', 'stroke-width': 0.7 }), s('path', { d: `M${-BALL_R} 0H${BALL_R}M0 ${-BALL_R}V${BALL_R}M-3.6 -3.6Q0 0 -3.6 3.6M3.6 -3.6Q0 0 3.6 3.6`, stroke: '#7a3f10', 'stroke-width': 0.55, fill: 'none' }));
  const ballFront = ballG(), ballBack = ballG();
  const cueL = s('g', {});
  svg.append(shadow, shadow2, trail);
  if (F2) svg.append(F2.g);
  svg.append(ballBack, F1.g, hlL, ballFront, cueL);
  if (mode === 'bad' || mode === 'good') {
    const x = cx + w / 2 - 12, y = -(yb + hgt) + 12;
    svg.append(s('circle', { cx: x, cy: y, r: 8, fill: mode === 'bad' ? '#FF6B6B' : '#A6F36A' }),
      s('path', { d: mode === 'bad' ? `M${x - 3.5} ${y - 3.5}L${x + 3.5} ${y + 3.5}M${x + 3.5} ${y - 3.5}L${x - 3.5} ${y + 3.5}` : `M${x - 4} ${y}L${x - 1} ${y + 3.2}L${x + 4.2} ${y - 3.4}`, stroke: '#090B10', 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  }
  const trailPts = [];
  let lastCue = null, lastIdx = -1;
  function render(time) {
    const F = sample(C, time);
    drawFigure(F1, F.J);
    if (F2 && F.J2) drawFigure(F2, F.J2);
    const fy = Math.min(F.J.r.ank[1], F.J.l.ank[1]);
    const sw = 15 * Math.max(0.45, 1 - fy / 60);
    shadow.setAttribute('cx', F.J.H[0]); shadow.setAttribute('cy', 0.4); shadow.setAttribute('rx', sw);
    if (F.J2) { shadow2.setAttribute('cx', F.J2.H[0]); shadow2.setAttribute('cy', 0.4); shadow2.setAttribute('rx', 15); } else shadow2.setAttribute('rx', 0);
    for (const [b, on] of [[ballFront, F.ball && F.bz >= 0], [ballBack, F.ball && F.bz < 0]]) {
      b.style.display = on ? '' : 'none';
      if (on) b.setAttribute('transform', `translate(${F.ball[0].toFixed(2)} ${(-F.ball[1]).toFixed(2)}) rotate(${(time / 4) % 360})`);
    }
    if (C.trail && F.ball) {
      trailPts.push(F.ball); if (trailPts.length > 26) trailPts.shift();
      if (F.idx === 0 && trailPts.length > 2 && dist(trailPts[trailPts.length - 2], F.ball) > 40) trailPts.length = 0;
      trail.replaceChildren(...trailPts.filter((_, i) => i % 2 === 0).map((p, i, arr) => s('circle', { cx: p[0], cy: -p[1], r: 1.1, fill: mode === 'bad' ? '#FF6B6B' : '#F2994A', opacity: (i + 1) / arr.length * 0.6 })));
      if (F.idx === 0 && time % C.dur < 60) trailPts.length = 0;
    }
    const cues = [...(C.cues || []), ...F.cue];
    // cues follow joints, so redraw every frame when any cue is anchored to the body
    BOUNDS = bounds;
    if (cues.length || lastCue !== cues) drawCues(cueL, F, cues, mode);
    BOUNDS = null;
    lastCue = cues;
    drawHL(hlL, F.J, F.hl);
    if (F.idx !== lastIdx) lastIdx = F.idx;
  }
  render(0);
  return { svg, render, C };
}
