// Figure clips: short animated demonstrations. Side view faces right (r = near side / shooting hand).
// Front view: r limbs on screen-left. Feet are [dx from hip, height]; hands are [dx, dy] from the shoulder.
import { pose, RIM } from '../figure.js';

const K = (p, t = 450, x = {}) => ({ p, t, ...x });
const at = (p, x) => pose(p, { x });

// ---------- side-view poses ----------
export const PS = {
  stand: pose({}),
  ready: pose({ hy: 40, lean: 18, ra: [7, 2], la: [-7, 2], rw: [14, -12], lw: [13, -10] }),
  shBase: pose({ hy: 45, lean: 8, ra: [5, 2], la: [-4, 2], rw: [13, -12], lw: [12, -9] }),
  shSet: pose({ hy: 45, lean: 6, ra: [5, 2], la: [-4, 2], rw: [12, 10], rh: 195, lw: [13, 8], lh: 175 }),
  shDip: pose({ hy: 36, lean: 15, ra: [5, 2], la: [-4, 2], rw: [12, 3], rh: 195, lw: [13, 1], lh: 175 }),
  shRise: pose({ hy: 50, lean: 3, ra: [4, 3.5], la: [-3, 3.5], rt: 62, lt: 62, rw: [11, 15], rh: 190, lw: [12, 12], lh: 175 }),
  shRel: pose({ hy: 57, lean: 2, ra: [3, 9], la: [-3, 9], rt: 40, lt: 40, rw: [12, 27], rh: 70, lw: [10, 16], lh: 160 }),
  shFollow: pose({ hy: 47, lean: 4, ra: [4, 2], la: [-3, 2], rw: [12, 27], rh: 55, lw: [9, 15], lh: 160 }),
  shAirLate: pose({ hy: 51, lean: 2, ra: [3, 5], la: [-3, 5], rt: 50, lt: 50, rw: [13, 20], rh: 80, lw: [10, 12] }),
  dribLowUp: pose({ hy: 37, lean: 30, ra: [9, 2], la: [-9, 2], rw: [17, -15], rh: 120, lw: [13, -8], lh: 100 }),
  dribLowDn: pose({ hy: 36, lean: 31, ra: [9, 2], la: [-9, 2], rw: [17, -20], rh: 100, lw: [13, -8], lh: 100 }),
  dribHighUp: pose({ hy: 47, lean: 4, ra: [5, 2], la: [-5, 2], rw: [13, -5], rh: 110, lw: [4, -26] }),
  dribHighDn: pose({ hy: 47, lean: 4, ra: [5, 2], la: [-5, 2], rw: [14, -11], rh: 100, lw: [4, -26] }),
  triple: pose({ hy: 39, lean: 24, ra: [9, 2], la: [-9, 2], rw: [9, -19], lw: [13, -15] }),
  runA: pose({ hy: 46, lean: 15, ra: [13, 8], la: [-13, 3], rt: 75, lt: 130, rw: [-6, -20], lw: [13, -11] }),
  runB: pose({ hy: 46, lean: 15, ra: [-13, 3], la: [13, 8], rt: 130, lt: 75, rw: [13, -11], lw: [-6, -20] }),
  chop: pose({ hy: 39, lean: 12, ra: [6, 3], la: [-6, 2], rw: [12, -10], lw: [10, -12] }),
  jumpAir: pose({ hy: 66, lean: 4, ra: [3, 18], la: [-3, 18], rt: 40, lt: 40, rw: [8, 22], lw: [4, 24] }),
  landSoft: pose({ hy: 37, lean: 16, ra: [6, 2], la: [-6, 2], rw: [16, -8], lw: [14, -10] }),
  landStiff: pose({ hy: 48, lean: -2, ra: [3, 2], la: [-3, 2], rw: [6, -26], lw: [-4, -27] }),
  squat: pose({ hy: 31, lean: 32, ra: [6, 2], la: [-6, 2], rw: [26, -2], lw: [25, -1] }),
  lunge: pose({ hy: 32, lean: 2, ra: [19, 2], la: [-20, 7], lt: 170, rw: [4, -26], lw: [-2, -27] }),
  hamstring: pose({ hy: 47, lean: 62, ra: [8, 2], la: [-6, 2], rt: 125, rw: [6, -29], lw: [4, -29] }),
  slump: pose({ hy: 47, lean: 16, hd: 30, rw: [2, -29], lw: [-3, -29] }),
  tall: pose({ hy: 48, lean: 0, hd: -4, rw: [2, -29], lw: [-2, -29] }),
  point: pose({ hy: 46, lean: 6, rw: [27, 6], rh: 80, lw: [-2, -28] }),
  chestHold: pose({ hy: 44, lean: 8, ra: [6, 2], la: [-6, 2], rw: [11, -9], lw: [11, -7] }),
  passStep: pose({ hy: 42, lean: 14, ra: [17, 2], la: [-9, 2], rw: [17, -6], lw: [17, -4] }),
  passExt: pose({ hy: 43, lean: 14, ra: [17, 2], la: [-9, 2], rw: [28, -5], rh: 125, lw: [28, -3], lh: 125 }),
  target: pose({ hy: 42, lean: 10, ra: [6, 2], la: [-6, 2], rw: [17, 4], rh: 160, lw: [17, 6], lh: 160 }),
  boxSeal: pose({ hy: 38, lean: -4, ra: [10, 2], la: [-10, 2], rw: [10, 2], rh: 120, lw: [-8, 2], lh: 240 }),
  reachUp: pose({ hy: 60, lean: 0, ra: [3, 12], la: [-3, 12], rt: 45, lt: 45, rw: [6, 28], lw: [-2, 29] }),
  defSide: pose({ hy: 37, lean: 16, ra: [9, 2], la: [-9, 2], rw: [14, 8], lw: [15, -8] }),
  defUp: pose({ hy: 46, lean: 4, ra: [5, 2], la: [-5, 2], rw: [8, 26], lw: [12, -6] }),
  postUp: pose({ hy: 37, lean: 10, ra: [12, 2], la: [-12, 2], rw: [6, 22], rh: 175, lw: [4, 22], lh: 175 }),
};

// ---------- front-view poses (screen x) ----------
export const PF = {
  stand: pose({ hy: 48, lean: 0, ra: [-6, 2], la: [6, 2], rw: [-3, -29], lw: [3, -29] }),
  shStance: pose({ hy: 44, lean: 0, ra: [-9, 2], la: [9, 2], rw: [8, -12], lw: [-8, -12] }),
  shSet: pose({ hy: 45, lean: 0, ra: [-9, 2], la: [9, 2], rw: [5, 14], lw: [-9, 14] }),
  shRel: pose({ hy: 55, lean: 0, ra: [-8, 9], la: [8, 9], rw: [5, 28], lw: [-8, 18] }),
  shPush: pose({ hy: 55, lean: 0, ra: [-8, 9], la: [8, 9], rw: [6, 27], lw: [-15, 24] }),
  bhR: pose({ hy: 37, lean: 0, ra: [-13, 2], la: [13, 2], rw: [-6, -19], lw: [7, -17] }),
  bhRdn: pose({ hy: 36, lean: 0, ra: [-13, 2], la: [13, 2], rw: [-6, -24], lw: [7, -17] }),
  bhL: pose({ hy: 37, lean: 0, ra: [-13, 2], la: [13, 2], rw: [-7, -17], lw: [6, -19] }),
  sellR: pose({ hy: 36, lean: -12, hd: -4, ra: [-15, 2], la: [11, 2], rw: [-5, -20], lw: [8, -16] }),
  driveL: pose({ hy: 37, lean: 16, ra: [-10, 2], la: [19, 2], rw: [-4, -12], lw: [8, -22] }),
  defStance: pose({ hy: 35, lean: 0, ra: [-17, 2], la: [17, 2], rw: [-7, 20], rh: 180, lw: [11, -13] }),
  defUpright: pose({ hy: 47, lean: 0, ra: [-6, 2], la: [6, 2], rw: [-3, -28], lw: [3, -28] }),
  contest: pose({ hy: 40, lean: 0, ra: [-14, 2], la: [14, 2], rw: [-1, 29], rh: 180, lw: [12, -12] }),
  reach: pose({ hy: 42, lean: -18, ra: [-10, 2], la: [10, 2], rw: [-28, -4], lw: [10, -20] }),
  armsWide: pose({ hy: 38, lean: 0, ra: [-15, 2], la: [15, 2], rw: [-14, 18], rh: 200, lw: [14, 18], lh: 160 }),
  breatheIn: pose({ hy: 48.6, lean: 0, hd: -3, ra: [-6, 2], la: [6, 2], rw: [-5, -28], lw: [5, -28] }),
  breatheOut: pose({ hy: 47.6, lean: 0, hd: 3, ra: [-6, 2], la: [6, 2], rw: [-3, -29], lw: [3, -29] }),
  legSwing: pose({ hy: 48, lean: 0, ra: [-24, 14], la: [5, 2], rw: [-22, 6], lw: [18, 2] }),
  slump: pose({ hy: 47, lean: 0, hd: 22, ra: [-6, 2], la: [6, 2], rw: [-2, -28], lw: [2, -28] }),
};

const F_SOLO = [10, -7, 150], F_TALL = [12, -7, 150, 0.85], F_RIM = [46, -9, 186, 1.02], F_WIDE = [30, -8, 210], F_FRONT = [0, -7, 140, 0.85], F_DUO = [18, -7, 188];
const B2 = ['b', 3, 2];
const SETB = ['r', 1.5, 6.2];
const FSETB = ['r', 1, 6.2];

// Full jump shot with ball flight.
function shotKeys({ dip = true, x0 = 0, drift = 0, lean = 0, arc = 46, miss = null, late = false, hy = 0, cueDip, cueRel, cueFollow } = {}) {
  const o = (p, extra = {}) => pose(p, { x: x0 }, extra);
  const keys = [K(o(PS.shBase), 0, { ball: B2, hold: 300 }), K(o(PS.shSet), 380, { ball: SETB, hold: 120 })];
  if (dip) keys.push(K(o(PS.shDip), 340, { ball: SETB, hold: 80, cue: cueDip, hl: cueDip ? 'legs' : null }));
  if (late) {
    keys.push(K(o(PS.jumpAir, { rw: [11, 15], rh: 190, lw: [12, 12] }), 300, { ball: SETB, e: 'out' }));
    keys.push(K(o(PS.shAirLate, { x: x0 + drift }), 260, { ball: ['r', 2, 5], cue: cueRel }));
  } else {
    keys.push(K(o(PS.shRise, { x: x0 + drift * 0.3 }), 230, { ball: SETB, e: 'out', hl: dip ? ['legs', 'core'] : null }));
    keys.push(K(o(PS.shRel, { x: x0 + drift * 0.7, lean: 2 + lean, hy: PS.shRel.hy + hy }), 170, { ball: ['r', 2, 5], cue: cueRel, hl: 'arm' }));
  }
  const land = o(PS.shFollow, { x: x0 + drift, lean: 4 + lean });
  if (miss) {
    keys.push(K(land, 600, { ball: ['w', ...miss[0]], arc, cue: cueFollow }));
    keys.push(K(land, 420, { ball: ['w', ...miss[1]], arc: 10, hold: 200, cue: cueFollow }));
  } else {
    keys.push(K(land, 620, { ball: 'rim', arc, cue: cueFollow }));
    keys.push(K(land, 220, { ball: 'net', cue: cueFollow }));
    keys.push(K(land, 330, { ball: ['w', RIM.x - 4, 5.2], cue: cueFollow, hold: 150 }));
  }
  return keys;
}

const rim = { rim: true };
const C = {};
const def = (id, c) => { C[id] = { id, ...c }; };

// ===== Shooting =====
def('shot', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ cueDip: [{ ang: 'rk' }], cueRel: [{ ring: 'rw', label: 'Wrist snap' }], cueFollow: [{ ring: 'rf', label: 'Hold it' }] }) });
def('shStance', { view: 'front', frame: F_FRONT, keys: [K(PF.stand, 0, { ball: ['b', 0, 4], hold: 300 }), K(PF.shStance, 500, { ball: ['b', 0, 4], hold: 1400, cue: [{ width: ['ra', 'la'], label: 'Shoulder width' }, { ring: 'rk', label: 'Ready to bend', side: -1 }, { ring: 'lk', side: 1 }] })] });
def('shStagger', { frame: F_SOLO, keys: [K(at(PS.stand, 0), 0, { ball: B2 }), K(at(PS.shBase, 0), 500, { ball: B2, hold: 1400, cue: [{ ring: 'rt', label: 'Shooting foot slightly ahead' }] })] });
def('shPocket', { frame: F_TALL, keys: [K(PS.shBase, 0, { ball: B2, hold: 250 }), K(PS.shSet, 520, { ball: SETB, hold: 1600, cue: [{ ring: 'rw', label: 'Fingertips, not palm', dy: 10 }, { ring: 're', label: 'Elbow under ball', dy: -9 }, { arrow: ['re', 'ball'], dash: '1.5 1.5', col: '#F4F5F7' }] })] });
def('shDipRise', { frame: F_TALL, keys: [K(PS.shSet, 0, { ball: SETB, hold: 300 }), K(PS.shDip, 420, { ball: SETB, hold: 500, hl: 'legs', cue: [{ ang: 'rk' }, { text: 'Dip', at: [-26, 60] }] }), K(PS.shRise, 320, { ball: SETB, e: 'out', hold: 700, hl: ['legs', 'core', 'arm'], cue: [{ arrow: [[-20, 30], [-20, 95]], label: 'Legs → arm', lx: -2, ly: 0 }, { plumb: true, label: 'Straight up', top: 112 }] })] });
def('shRelease', { frame: F_RIM, props: rim, trail: true, keys: [K(PS.shRise, 0, { ball: SETB, hold: 300 }), K(PS.shRel, 220, { ball: ['r', 2, 5], hold: 120, hl: 'wrist', cue: [{ ring: 'rw', label: 'Snap the wrist' }] }), K(PS.shFollow, 650, { ball: 'rim', arc: 46, cue: [{ text: 'High arc', at: [70, 196] }] }), K(PS.shFollow, 220, { ball: 'net' }), K(PS.shFollow, 300, { ball: ['w', RIM.x - 4, 5.2], hold: 200 })] });
def('shFollow', { frame: F_RIM, props: rim, trail: true, keys: [K(PS.shRel, 0, { ball: ['r', 2, 5] }), K(PS.shFollow, 650, { ball: 'rim', arc: 46, hl: 'wrist', cue: [{ ring: 'rf', label: 'Fingers point at rim' }] }), K(PS.shFollow, 240, { ball: 'net', hold: 900, cue: [{ ring: 'rf', label: 'Hold until it lands' }] }), K(PS.shFollow, 300, { ball: ['w', RIM.x - 4, 5.2] })] });
def('shArmsOnly', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ dip: false, hy: -9, arc: 34, miss: [[95, 135], [86, 5.2]], cueRel: [{ ring: 'rk', label: 'No leg bend', bad: true }], cueFollow: [{ text: 'Short', at: [92, 120], col: '#FF6B6B' }] }) });
def('shDrift', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ drift: 22, arc: 40, cueFollow: [{ mark: 0, label: 'Took off', bad: true }, { mark: 22, label: 'Landed', bad: true }] }) });
def('shStraight', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ cueDip: [{ mark: 0, label: 'Take off' }], cueFollow: [{ mark: 0, label: 'Land same spot' }, { plumb: 0, top: 112 }] }) });
def('shFlat', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ arc: 8, miss: [[RIM.x - 9, RIM.y + 1], [88, 5.2]], cueFollow: [{ text: 'Flat arc: front rim', at: [70, 168], col: '#FF6B6B' }] }) });
def('shHighArc', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ arc: 52, cueFollow: [{ text: 'High, soft arc', at: [62, 195] }] }) });
def('shLate', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ late: true, arc: 26, miss: [[RIM.x - 8, RIM.y + 2], [92, 5.2]], cueRel: [{ text: 'Released coming down', at: [10, 132], col: '#FF6B6B' }] }) });
def('shTop', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ cueRel: [{ text: 'Release at the top', at: [10, 136] }] }) });
def('shLeanBack', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ lean: -14, drift: -12, arc: 30, miss: [[RIM.x - 10, RIM.y], [90, 5.2]], cueFollow: [{ text: 'Leaning back', at: [-20, 118], col: '#FF6B6B' }, { ang: 'rk', col: '#FF6B6B' }] }) });
def('shTooHigh', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ hy: 16, arc: 36, miss: [[RIM.x + 9, RIM.y + 1], [130, 5.2]], cueRel: [{ text: 'Too much jump', at: [10, 148], col: '#FF6B6B' }] }) });
def('shRush', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ dip: false, hy: -6, arc: 22, miss: [[RIM.x - 9, RIM.y], [92, 5.2]], cueRel: [{ text: 'No dip, rushed', at: [10, 130], col: '#FF6B6B' }] }) });
def('shGuidePush', { view: 'front', frame: [0, -7, 150, 1], trail: true, keys: [K(PF.shSet, 0, { ball: FSETB, hold: 300 }), K(PF.shPush, 260, { ball: FSETB, hl: 'guide', cue: [{ ring: 'lw', label: 'Guide hand pushes', bad: true, side: 1 }] }), K(PF.shPush, 600, { ball: ['w', -40, 112], arc: 6, cue: [{ text: 'Ball goes off line', at: [-26, 104], col: '#FF6B6B' }, { plumb: 0, top: 112, col: '#A5AAB5' }] }), K(PF.shStance, 400, { ball: ['w', -40, 112] })] });
def('shGuideOK', { view: 'front', frame: [0, -7, 150, 1], trail: true, keys: [K(PF.shSet, 0, { ball: FSETB, hold: 300 }), K(PF.shRel, 260, { ball: FSETB, cue: [{ ring: 'lw', label: 'Guide hand only supports', side: 1 }] }), K(PF.shRel, 600, { ball: ['w', 0, 112], arc: 4, cue: [{ plumb: 0, top: 112, label: 'Straight line' }] }), K(PF.shStance, 400, { ball: ['w', 0, 112] })] });
def('shGatherLow', { frame: F_RIM, props: rim, trail: true, keys: [K(at(PS.target, -40), 0, { ball: ['w', -95, 70], cue: [{ ring: 'rw', label: 'Hands ready' }] }), K(at(PS.shDip, -10), 500, { ball: SETB, arc: 4, cue: [{ ang: 'rk' }, { text: 'Catch low = already dipped', at: [10, 120] }] }), K(at(PS.shRise, -10), 220, { ball: SETB, e: 'out' }), K(at(PS.shRel, -10), 170, { ball: ['r', 2, 5] }), K(at(PS.shFollow, -10), 620, { ball: 'rim', arc: 48 }), K(at(PS.shFollow, -10), 230, { ball: 'net' })] });
def('shCatchStraight', { frame: F_RIM, props: rim, trail: true, keys: [K(at(PS.stand, -10), 0, { ball: ['w', -95, 70], cue: [{ ring: 'rk', label: 'Straight legs', bad: true }] }), K(at(PS.chestHold, -10), 500, { ball: B2, arc: 4 }), K(at(PS.shDip, -10), 450, { ball: SETB, cue: [{ text: 'Has to dip again: slow', at: [10, 120], col: '#FF6B6B' }] }), K(at(PS.shRise, -10), 230, { ball: SETB }), K(at(PS.shRel, -10), 170, { ball: ['r', 2, 5] }), K(at(PS.shFollow, -10), 620, { ball: 'rim', arc: 44 })] });
def('shHop', { frame: F_RIM, props: rim, keys: [K(at(PS.ready, -40), 0, { ball: ['w', -100, 70], cue: [{ ring: 'rw', label: 'Show hands' }] }), K(at(PS.jumpAir, -28, { hy: 54, ra: [4, 8], la: [-4, 8] }), 400, { ball: ['b', 4, 3], arc: 5, cue: [{ text: 'Meet the ball', at: [-20, 118] }] }), K(at(PS.shDip, -18), 280, { ball: SETB, cue: [{ mark: -18, label: 'Feet face rim' }] }), K(at(PS.shRise, -18), 220, { ball: SETB }), K(at(PS.shRel, -18), 170, { ball: ['r', 2, 5] }), K(at(PS.shFollow, -18), 620, { ball: 'rim', arc: 48 }), K(at(PS.shFollow, -18), 230, { ball: 'net' })] });
def('shWaiting', { frame: F_RIM, props: rim, keys: [K(at(PS.stand, -10), 0, { hold: 600, cue: [{ ring: 'rw', label: 'Hands down', bad: true }, { ring: 'rk', label: 'Flat-footed', bad: true }] }), K(at(PS.stand, -10, { hd: -4 }), 900, { ball: ['w', -95, 60], hold: 300, cue: [{ text: 'Not ready for the pass', at: [10, 120], col: '#FF6B6B' }] })] });
def('shReady', { frame: F_RIM, props: rim, keys: [K(at(PS.stand, -10), 0, { hold: 200 }), K(at(PS.target, -10), 450, { hold: 900, cue: [{ ring: 'rw', label: 'Hands up' }, { ring: 'rk', label: 'Knees bent', dy: -8 }] })] });
def('shFade', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ drift: -18, lean: -12, arc: 30, miss: [[RIM.x - 10, RIM.y], [88, 5.2]], cueFollow: [{ arrow: [[10, 30], [-24, 30]], label: 'Fading away', bad: true }] }) });
def('shOverFoot', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ drift: 4, cueDip: [{ ring: 'rt', label: 'Shoot over front foot' }] }) });
def('eyesRim', { frame: F_RIM, props: { rim: true, board: [-44, 136] }, trail: true, keys: shotKeys({ cueDip: [{ eye: 'rim', label: 'Eyes on target' }], cueRel: [{ eye: 'rim' }] }) });
def('eyesCrowd', { frame: F_RIM, props: { rim: true, board: [-44, 136] }, keys: [K(pose(PS.shBase, { hd: -22 }), 0, { ball: B2, hold: 1500, cue: [{ eye: [-43, 150], label: 'Looking at scoreboard', bad: true }] }), K(pose(PS.shBase, { hd: -10 }), 600, { ball: B2, hold: 500 })] });
def('pullup', { frame: F_RIM, props: rim, trail: true, keys: [
  K(at(PS.dribLowUp, -70), 0, { ball: ['r', 1, -6] }), K(at(PS.dribLowDn, -58), 170, { ball: ['f', 20] }), K(at(PS.dribLowUp, -46), 170, { ball: ['r', 1, -6], cue: [{ speed: 'fast' }] }),
  K(at(PS.dribLowDn, -34), 170, { ball: ['f', 20] }), K(at(PS.shDip, -20), 260, { ball: SETB, cue: [{ ang: 'rk' }, { text: 'Plant and absorb', at: [-10, 118] }] }),
  K(at(PS.shRise, -20), 230, { ball: SETB, e: 'out', cue: [{ plumb: -20, label: 'Rise straight up', top: 112 }] }), K(at(PS.shRel, -20), 170, { ball: ['r', 2, 5] }), K(at(PS.shFollow, -20), 620, { ball: 'rim', arc: 46 }), K(at(PS.shFollow, -20), 230, { ball: 'net' })] });
def('stepback', { frame: F_RIM, props: rim, trail: true, keys: [
  K(at(PS.dribLowUp, -10), 0, { ball: ['r', 1, -6], p2: at(PS.defSide, 40, { face: -1 }) }), K(at(PS.dribLowDn, 5), 220, { ball: ['f', 20], p2: at(PS.defSide, 34, { face: -1 }), cue: [{ text: 'Attack: defender steps in', at: [20, 112] }] }),
  K(at(pose(PS.dribLowUp, { ra: [18, 2], la: [-6, 2] }), 8), 200, { ball: ['r', 1, -6], p2: at(PS.defSide, 30, { face: -1 }), cue: [{ ring: 'ra', label: 'Plant & push back' }] }),
  K(at(PS.shDip, -16), 260, { ball: SETB, p2: at(PS.defSide, 30, { face: -1 }), cue: [{ arrow: [[6, 10], [-18, 10]], label: 'Space' }] }),
  K(at(PS.shRise, -16), 220, { ball: SETB, p2: at(PS.defUp, 22, { face: -1 }) }), K(at(PS.shRel, -16), 170, { ball: ['r', 2, 5], p2: at(PS.defUp, 22, { face: -1 }) }), K(at(PS.shFollow, -16), 620, { ball: 'rim', arc: 48, p2: at(PS.defUp, 22, { face: -1 }) }), K(at(PS.shFollow, -16), 230, { ball: 'net', p2: at(PS.defSide, 22, { face: -1 }) })] });
def('stepbackFar', { frame: F_RIM, props: rim, trail: true, keys: [K(at(PS.dribLowUp, 30), 0, { ball: ['r', 1, -6] }), K(at(PS.shDip, -20), 380, { ball: SETB, cue: [{ arrow: [[28, 10], [-20, 10]], label: 'Too far', bad: true }] }), K(at(pose(PS.shRise, { lean: -8 }), -22), 230, { ball: SETB }), K(at(pose(PS.shRel, { lean: -10 }), -24), 170, { ball: ['r', 2, 5] }), K(at(pose(PS.shFollow, { lean: -6 }), -26), 620, { ball: ['w', RIM.x - 10, RIM.y], arc: 30 }), K(at(PS.shFollow, -26), 380, { ball: ['w', 92, 5.2], arc: 8 })] });
def('shotFake', { frame: F_RIM, props: rim, keys: [K(at(PS.triple, 0), 0, { ball: B2, p2: at(PS.defSide, 34, { face: -1 }) }), K(at(PS.shSet, 0), 260, { ball: SETB, p2: at(PS.reachUp, 34, { face: -1 }), cue: [{ text: 'Shot fake', at: [0, 122] }] }), K(at(PS.dribLowDn, 30), 360, { ball: ['f', 20], p2: at(PS.reachUp, 34, { face: -1 }), cue: [{ speed: 'fast' }, { text: 'Defender jumps: go by', at: [40, 122] }] }), K(at(PS.dribLowUp, 62), 260, { ball: ['r', 1, -6], p2: at(PS.landSoft, 34, { face: -1 }) })] });
def('routine', { frame: F_RIM, props: { rim: true, lines: [{ x: -2, label: 'Same spot' }] }, keys: [
  K(at(PS.dribHighUp, 0), 0, { ball: ['r', 1, -6], cue: [{ text: 'Dribble 1', at: [0, 118] }] }), K(at(PS.dribHighDn, 0), 260, { ball: ['f', 14] }), K(at(PS.dribHighUp, 0), 260, { ball: ['r', 1, -6], cue: [{ text: 'Dribble 2', at: [0, 118] }] }), K(at(PS.dribHighDn, 0), 260, { ball: ['f', 14] }), K(at(PS.dribHighUp, 0), 260, { ball: ['r', 1, -6] }),
  K(at(PS.shBase, 0), 300, { ball: B2, hold: 500, cue: [{ text: 'Breathe', at: [0, 118] }, { eye: 'rim' }] }), ...shotKeys({ cueDip: [{ eye: 'rim', label: 'Eyes on target' }] }).slice(1)] });

// ===== Ball handling =====
const dribbleLoop = (x = 0, n = 2, o = {}) => { const out = []; for (let i = 0; i < n; i++) { out.push(K(at(PS.dribLowDn, x), 190, { ball: ['f', 21 + (o.fx || 0)], ...o.k })); out.push(K(at(PS.dribLowUp, x), 190, { ball: ['r', 1, -6], ...o.k })); } return out; };
def('bhStance', { frame: F_SOLO, keys: [K(PS.dribLowUp, 0, { ball: ['r', 1, -6], cue: [{ ang: 'rk' }, { arrow: ['H', 'S'], col: '#F4F5F7', label: 'Back straight', lx: -14, ly: -2 }] }), ...dribbleLoop(0, 3, { k: { cue: [{ ang: 'rk' }, { arrow: ['H', 'S'], col: '#F4F5F7', label: 'Back straight', lx: -14, ly: -2 }] } })] });
def('bhPound', { frame: F_SOLO, keys: [K(PS.dribLowUp, 0, { ball: ['r', 1, -6] }), ...dribbleLoop(0, 4, { k: { hl: 'wrist', cue: [{ ring: 'rw', label: 'Fingertips + wrist' }, { text: 'Hard and low', at: [56, 18] }] } })] });
def('bhHigh', { frame: F_SOLO, keys: [K(PS.dribHighUp, 0, { ball: ['r', 1, -6] }), ...[0, 1, 2].flatMap(() => [K(PS.dribHighDn, 260, { ball: ['f', 15], cue: [{ text: 'Ball at chest: easy steal', at: [30, 100], col: '#FF6B6B' }] }), K(PS.dribHighUp, 260, { ball: ['r', 1, -6], cue: [{ text: 'Ball at chest: easy steal', at: [30, 100], col: '#FF6B6B' }] })])] });
def('bhLow', { frame: F_SOLO, keys: [K(PS.dribLowUp, 0, { ball: ['r', 1, -6] }), ...dribbleLoop(0, 3, { k: { cue: [{ text: 'Below the waist', at: [52, 62] }] } })] });
def('bhUpright', { frame: F_SOLO, keys: [K(PS.dribHighUp, 0, { ball: ['r', 1, -6] }), ...[0, 1, 2].flatMap(() => [K(PS.dribHighDn, 260, { ball: ['f', 15], cue: [{ ring: 'rk', label: 'Standing tall', bad: true }] }), K(PS.dribHighUp, 260, { ball: ['r', 1, -6], cue: [{ ring: 'rk', label: 'Standing tall', bad: true }] })])] });
def('bhHeadUp', { frame: F_WIDE, keys: [K(pose(PS.dribLowUp, { hd: -30 }), 0, { ball: ['r', 1, -6] }), ...[0, 1, 2].flatMap(() => [K(pose(PS.dribLowDn, { hd: -30 }), 190, { ball: ['f', 21], cue: [{ eye: [120, 82], label: 'Eyes up: see the floor' }] }), K(pose(PS.dribLowUp, { hd: -30 }), 190, { ball: ['r', 1, -6], cue: [{ eye: [120, 82], label: 'Eyes up: see the floor' }] })])] });
def('bhHeadDown', { frame: F_SOLO, keys: [K(pose(PS.dribLowUp, { hd: 40 }), 0, { ball: ['r', 1, -6] }), ...[0, 1, 2].flatMap(() => [K(pose(PS.dribLowDn, { hd: 40 }), 190, { ball: ['f', 21], cue: [{ eye: 'ball', label: 'Staring at the ball', bad: true }] }), K(pose(PS.dribLowUp, { hd: 40 }), 190, { ball: ['r', 1, -6], cue: [{ eye: 'ball', label: 'Staring at the ball', bad: true }] })])] });
def('bhProtect', { view: 'front', frame: [6, -7, 150], keys: [K(PF.bhR, 0, { ball: ['r', 0, -6], p2: pose(PF.defStance, { x: 46, rw: [-9, 4], lw: [9, -10] }) }), ...[0, 1, 2].flatMap(() => [K(PF.bhRdn, 200, { ball: ['f', -19], p2: pose(PF.defStance, { x: 46, rw: [-9, 4], lw: [9, -10] }), cue: [{ ring: 'lw', label: 'Off arm shields', side: 1, dy: 12 }, { text: 'Body between ball and defender', at: [6, 100] }] }), K(PF.bhR, 200, { ball: ['r', 0, -6], p2: pose(PF.defStance, { x: 46, rw: [-9, 4], lw: [9, -10] }), cue: [{ ring: 'lw', label: 'Off arm shields', side: 1, dy: 12 }, { text: 'Body between ball and defender', at: [6, 100] }] })])] });
def('bhChange', { frame: F_WIDE, keys: [K(at(PS.dribLowUp, -60), 0, { ball: ['r', 1, -6] }), K(at(PS.dribLowDn, -50), 260, { ball: ['f', 21], cue: [{ speed: 'slow' }] }), K(at(PS.dribLowUp, -40), 260, { ball: ['r', 1, -6], cue: [{ speed: 'slow' }] }), K(at(PS.dribLowDn, -10), 180, { ball: ['f', 21], cue: [{ speed: 'fast' }] }), K(at(PS.dribLowUp, 25), 180, { ball: ['r', 1, -6], cue: [{ speed: 'fast' }] }), K(at(pose(PS.dribLowDn, { lean: 36 }), 60), 180, { ball: ['f', 21], cue: [{ speed: 'fast' }] }), K(at(PS.dribLowUp, 90), 180, { ball: ['r', 1, -6] })] });
def('bhOneSpeed', { frame: F_WIDE, keys: [K(at(PS.dribHighUp, -60), 0, { ball: ['r', 1, -6] }), ...[-45, -30, -15, 0, 15, 30, 45, 60].map((x, i) => K(at(i % 2 ? PS.dribHighUp : PS.dribHighDn, x), 260, { ball: i % 2 ? ['r', 1, -6] : ['f', 15], cue: [{ text: 'Same speed the whole time', at: [30, 112], col: '#FF6B6B' }] }))] });

const D2 = (x, extra = {}) => pose(PF.defStance, { x, rw: [-9, 6], lw: [9, -8] }, extra);
def('crossSell', { view: 'front', frame: F_FRONT, keys: [K(PF.bhR, 0, { ball: ['r', 0, -6] }), K(PF.bhRdn, 200, { ball: ['f', -19] }), K(PF.sellR, 320, { ball: ['r', 0, -6], hold: 700, cue: [{ arrow: [[-6, 96], [-34, 96]], label: 'Eyes + shoulders sell right' }] }), K(PF.bhRdn, 220, { ball: ['f', -19] })] });
def('crossLow', { view: 'front', frame: F_FRONT, trail: true, keys: [K(PF.sellR, 0, { ball: ['r', 0, -6], hold: 250 }), K(PF.bhRdn, 160, { ball: ['f', -2], cue: [{ text: 'Low + quick, below the knee', at: [0, 62] }] }), K(PF.bhL, 180, { ball: ['l', 0, -6], hold: 600 }), K(PF.bhR, 400, { ball: ['r', 0, -6] })] });
def('crossHigh', { view: 'front', frame: F_FRONT, trail: true, keys: [K(pose(PF.bhR, { hy: 46 }), 0, { ball: ['r', 0, -2], hold: 250 }), K(pose(PF.bhR, { hy: 46 }), 300, { ball: ['w', 0, 40], arc: 16, cue: [{ text: 'Crossing high: steal', at: [0, 104], col: '#FF6B6B' }] }), K(pose(PF.bhL, { hy: 46 }), 300, { ball: ['l', 0, -2], hold: 500 })] });
def('crossPlant', { view: 'front', frame: [10, -7, 150], keys: [K(PF.bhL, 0, { ball: ['l', 0, -6] }), K(PF.driveL, 380, { ball: ['l', 0, -6], hold: 900, cue: [{ ring: 'ra', label: 'Push off outside foot', side: -1 }, { arrow: [[20, 96], [52, 96]], label: 'Explode' }] })] });
def('crossProtect', { view: 'front', frame: [16, -7, 160], keys: [K(pose(PF.driveL, { x: 0 }), 0, { ball: ['l', 0, -6], p2: D2(-22) }), K(pose(PF.driveL, { x: 14 }), 300, { ball: ['f', 24], p2: D2(-14) }), K(pose(PF.driveL, { x: 28 }), 300, { ball: ['l', 0, -6], p2: D2(-8), cue: [{ text: 'Body between defender and ball', at: [16, 104] }] }), K(pose(PF.driveL, { x: 42 }), 300, { ball: ['f', 24], p2: D2(-4) })] });
def('crossSlow', { view: 'front', frame: [10, -7, 150], keys: [K(PF.bhL, 0, { ball: ['l', 0, -6], p2: D2(-30) }), K(pose(PF.bhL, { hy: 44 }), 600, { ball: ['l', 0, -6], p2: D2(-6), hold: 500, cue: [{ text: 'Slowed down: defender recovers', at: [10, 104], col: '#FF6B6B' }] })] });
def('btlStep', { view: 'front', frame: F_FRONT, keys: [K(PF.bhR, 0, { ball: ['r', 0, -6] }), K(pose(PF.bhR, { ra: [-16, 2], la: [15, 2], hy: 34 }), 400, { ball: ['r', 0, -6], hold: 900, cue: [{ ring: 'la', label: 'Lead foot steps forward', side: 1 }, { width: ['ra', 'la'], label: 'Wide gap for the ball' }] })] });
def('btl', { view: 'front', frame: F_FRONT, trail: true, keys: [K(pose(PF.bhR, { ra: [-16, 2], la: [15, 2], hy: 34 }), 0, { ball: ['r', 0, -6], hold: 200 }), K(pose(PF.bhRdn, { ra: [-16, 2], la: [15, 2], hy: 34 }), 160, { ball: ['f', 0], bz: -1, cue: [{ text: 'Through the legs, low', at: [0, 60] }] }), K(pose(PF.bhL, { ra: [-16, 2], la: [15, 2], hy: 34 }), 180, { ball: ['l', 0, -6], hold: 500, cue: [{ ring: 'lw', label: 'Catch with other hand', side: 1 }] }), K(PF.driveL, 350, { ball: ['l', 0, -6], hold: 300, cue: [{ arrow: [[22, 96], [52, 96]], label: 'Move away' }] })] });
def('btlHitLeg', { view: 'front', frame: F_FRONT, keys: [K(pose(PF.bhR, { ra: [-7, 2], la: [7, 2] }), 0, { ball: ['r', 0, -6], hold: 200 }), K(pose(PF.bhRdn, { ra: [-7, 2], la: [7, 2] }), 180, { ball: ['w', -2, 22], cue: [{ text: 'Wrong foot: ball hits leg', at: [0, 100], col: '#FF6B6B' }] }), K(pose(PF.bhR, { ra: [-7, 2], la: [7, 2] }), 300, { ball: ['w', -40, 5.2], arc: 10, hold: 500 })] });
def('btbWrap', { view: 'front', frame: F_FRONT, trail: true, keys: [K(PF.bhR, 0, { ball: ['r', 0, -6], hold: 200 }), K(pose(PF.bhR, { rw: [4, -24] }), 220, { ball: ['w', 0, 46], bz: -1, cue: [{ text: 'Wrap behind with the wrist', at: [0, 104] }] }), K(PF.bhRdn, 180, { ball: ['f', 20] }), K(PF.bhL, 180, { ball: ['l', 0, -6], hold: 400 }), K(PF.driveL, 340, { ball: ['l', 0, -6], cue: [{ arrow: [[22, 96], [52, 96]], label: 'Keep moving forward' }] })] });
def('btbFar', { view: 'front', frame: F_FRONT, keys: [K(PF.bhR, 0, { ball: ['r', 0, -6], hold: 200 }), K(pose(PF.bhR, { rw: [10, -18] }), 240, { ball: ['w', 30, 30], bz: -1, cue: [{ text: 'Wrapped too far back', at: [0, 104], col: '#FF6B6B' }] }), K(PF.bhL, 300, { ball: ['w', 60, 5.2], arc: 8, hold: 500 })] });
def('hesi', { frame: F_WIDE, keys: [
  K(at(PS.dribLowUp, -70), 0, { ball: ['r', 1, -6], p2: at(PS.defSide, 40, { face: -1 }) }), K(at(PS.dribLowDn, -55), 230, { ball: ['f', 21], p2: at(PS.defSide, 40, { face: -1 }) }), K(at(PS.dribLowUp, -40), 230, { ball: ['r', 1, -6], p2: at(PS.defSide, 40, { face: -1 }) }),
  K(at(pose(PS.dribHighUp, { lean: 12, hy: 44, hd: -6 }), -34), 300, { ball: ['r', 1, -6], hold: 380, p2: at(PS.defUp, 40, { face: -1, hy: 47 }), cue: [{ text: 'Hesitate: one beat', at: [-34, 108] }, { eye: [40, 2], label: 'Watch their feet' }] }),
  K(at(pose(PS.dribLowDn, { lean: 38 }), -10), 160, { ball: ['f', 22], p2: at(PS.defUp, 40, { face: -1, hy: 47 }), cue: [{ speed: 'fast' }, { text: 'Their weight came up: explode', at: [20, 108] }] }), K(at(pose(PS.dribLowUp, { lean: 36 }), 25), 160, { ball: ['r', 1, -6], p2: at(PS.defSide, 38, { face: -1 }) }), K(at(pose(PS.dribLowDn, { lean: 36 }), 60), 160, { ball: ['f', 22], p2: at(PS.defSide, 38, { face: -1 }) }), K(at(PS.dribLowUp, 90), 200, { ball: ['r', 1, -6], p2: at(PS.defSide, 38, { face: -1 }) })] });
def('hesiStop', { frame: F_WIDE, keys: [K(at(PS.dribLowUp, -50), 0, { ball: ['r', 1, -6], p2: at(PS.defSide, 30, { face: -1 }) }), K(at(PS.chestHold, -40), 400, { ball: B2, hold: 1200, p2: at(PS.defSide, 14, { face: -1 }), cue: [{ text: 'Paused too long: stopped dribble', at: [-10, 108], col: '#FF6B6B' }] })] });

// ===== Finishing =====
const lay = { ra: [10, 30], la: [-4, 14], rt: 70, lt: 40 };
def('layup', { frame: F_RIM, props: rim, trail: true, keys: [
  K(at(PS.dribLowUp, -36), 0, { ball: ['r', 1, -6] }), K(at(PS.dribLowDn, -18), 220, { ball: ['f', 22] }),
  K(at(pose(PS.runA, { rw: [12, -8], lw: [12, -6] }), 14), 300, { ball: B2, cue: [{ mark: 24, label: '1' }, { text: 'Gather', at: [-10, 112] }] }),
  K(at(pose(PS.runB, { rw: [12, -4], lw: [12, -2], hy: 43 }), 46), 300, { ball: B2, cue: [{ mark: 24, label: '1' }, { mark: 54, label: '2: jump off inside foot' }] }),
  K(at(pose(PS.jumpAir, lay, { hy: 70, rw: [16, 25], lw: [10, 14], lean: 0 }), 82), 360, { ball: ['r', 2, 5], e: 'out', cue: [{ ring: 'rk', label: 'Knee up' }, { ring: 'rw', label: 'Extend', side: -1 }] }),
  K(at(pose(PS.jumpAir, lay, { hy: 66, rw: [16, 25], rh: 60, lw: [10, 14], lean: 0 }), 90), 380, { ball: ['w', 125, 168], arc: 6, cue: [{ text: 'Soft off the glass', at: [80, 188] }] }),
  K(at(PS.landSoft, 98), 300, { ball: 'rim', arc: 0 }), K(at(PS.landSoft, 98), 230, { ball: 'net', hold: 300 })] });
def('layupGather', { frame: F_WIDE, keys: [K(at(PS.dribLowUp, -60), 0, { ball: ['r', 1, -6] }), K(at(PS.dribLowDn, -40), 220, { ball: ['f', 22] }), K(at(pose(PS.runA, { rw: [12, -8], lw: [12, -6] }), -10), 320, { ball: B2, hold: 900, cue: [{ ring: 'ball', label: 'Two hands, step before the last', r: 8 }] })] });
def('layupWrongFoot', { frame: F_RIM, props: rim, trail: true, keys: [K(at(pose(PS.runA, { rw: [12, -8], lw: [12, -6] }), -10), 0, { ball: B2 }), K(at(pose(PS.runA, { rw: [12, -4], lw: [12, -2], hy: 43 }), 22), 300, { ball: B2, cue: [{ text: 'Same-side foot: off rhythm', at: [10, 112], col: '#FF6B6B' }] }), K(at(pose(PS.jumpAir, { hy: 60, ra: [3, 12], la: [8, 26], rw: [14, 24] }), 50), 360, { ball: ['r', 2, 5] }), K(at(PS.landSoft, 60), 380, { ball: ['w', RIM.x - 10, RIM.y + 2], arc: 14 }), K(at(PS.landSoft, 60), 300, { ball: ['w', 90, 5.2] })] });
def('layupHard', { frame: F_RIM, props: rim, trail: true, keys: [K(at(pose(PS.jumpAir, lay, { hy: 70, rw: [16, 25], lw: [10, 14] }), 58), 0, { ball: ['r', 2, 5], hold: 200 }), K(at(PS.landSoft, 66), 260, { ball: ['w', 128, 172], arc: 2, cue: [{ text: 'Too hard', at: [80, 190], col: '#FF6B6B' }] }), K(at(PS.landSoft, 66), 300, { ball: ['w', 70, 60], arc: 20 })] });
def('reverse', { frame: [84, -9, 186, 1.02], props: rim, trail: true, keys: [
  K(at(PS.dribLowUp, 20), 0, { ball: ['r', 1, -6] }), K(at(PS.dribLowDn, 50), 220, { ball: ['f', 22], cue: [{ text: 'Attack at an angle', at: [40, 112] }] }),
  K(at(pose(PS.runA, { rw: [12, -8], lw: [12, -6] }), 92), 300, { ball: B2 }), K(at(pose(PS.runB, { rw: [12, -4], lw: [12, -2], hy: 43 }), 128), 320, { ball: B2, cue: [{ mark: 128, label: 'Past the rim' }] }),
  K(at(pose(PS.jumpAir, { hy: 66, rw: [-6, 26], lw: [-8, 22], lean: -4 }), 136), 340, { ball: ['l', -2, 5], e: 'out', cue: [{ ring: 'lw', label: 'Far hand', side: -1 }] }),
  K(at(pose(PS.jumpAir, { hy: 62, rw: [-6, 26], lw: [-8, 24], lean: -4 }), 138), 340, { ball: ['w', 124, 166], arc: 8, cue: [{ text: 'Use the backboard', at: [100, 190] }] }),
  K(at(PS.landSoft, 140), 280, { ball: 'rim' }), K(at(PS.landSoft, 140), 230, { ball: 'net', hold: 300 })] });
def('floater', { frame: F_RIM, props: rim, trail: true, keys: [
  K(at(PS.dribLowUp, -50), 0, { ball: ['r', 1, -6], p2: at(PS.defSide, 100, { face: -1 }) }), K(at(PS.dribLowDn, -28), 220, { ball: ['f', 22], p2: at(PS.defSide, 98, { face: -1 }) }),
  K(at(pose(PS.runB, { rw: [12, -4], lw: [12, -2], hy: 43 }), 2), 300, { ball: B2, p2: at(PS.defSide, 96, { face: -1 }), cue: [{ mark: 2, label: 'Take off early' }] }),
  K(at(pose(PS.jumpAir, { hy: 62, rw: [12, 26], rh: 190, lw: [9, 20] }), 18), 300, { ball: ['r', 2, 6], e: 'out', p2: at(PS.reachUp, 96, { face: -1 }) }),
  K(at(pose(PS.jumpAir, { hy: 60, rw: [13, 27], rh: 70, lw: [9, 18] }), 22), 820, { ball: 'rim', arc: 60, p2: at(PS.reachUp, 96, { face: -1 }), cue: [{ text: 'High + soft over the shot-blocker', at: [60, 205] }] }),
  K(at(PS.landSoft, 26), 230, { ball: 'net', p2: at(PS.defSide, 96, { face: -1 }), hold: 300 })] });
def('contact', { frame: F_RIM, props: rim, trail: true, keys: [
  K(at(pose(PS.runB, { rw: [12, -4], lw: [12, -2], hy: 43 }), 20), 0, { ball: B2, p2: at(PS.defSide, 78, { face: -1 }) }),
  K(at(pose(PS.jumpAir, { hy: 64, lean: -6, rw: [4, 4], lw: [6, 28] }), 52), 340, { ball: ['l', 1, 6], p2: at(pose(PS.reachUp, { lean: -12 }), 70, { face: -1 }), cue: [{ ring: 'S', label: 'Absorb with shoulder', r: 9 }, { ring: 'lw', label: 'Ball high, far hand', side: -1 }] }),
  K(at(pose(PS.jumpAir, { hy: 62, lean: -4, rw: [4, 4], lw: [8, 28] }), 56), 380, { ball: ['w', 125, 166], arc: 6, p2: at(pose(PS.reachUp, { lean: -10 }), 70, { face: -1 }) }),
  K(at(PS.landSoft, 58), 280, { ball: 'rim', p2: at(PS.defSide, 72, { face: -1 }) }), K(at(PS.landSoft, 58), 220, { ball: 'net', hold: 300, p2: at(PS.defSide, 72, { face: -1 }) })] });
def('contactLow', { frame: F_RIM, props: rim, keys: [K(at(pose(PS.runB, { rw: [12, -14], lw: [12, -12], hy: 43 }), 30), 0, { ball: ['b', 3, -2], p2: at(PS.defSide, 74, { face: -1 }), cue: [{ ring: 'ball', label: 'Ball low', bad: true, r: 8 }] }), K(at(PS.landSoft, 44), 360, { ball: ['w', 76, 60], p2: at(pose(PS.defSide, { rw: [24, -8] }), 66, { face: -1 }), hold: 800, cue: [{ text: 'Stripped', at: [60, 112], col: '#FF6B6B' }] })] });

// ===== Passing =====
const RECV = x => at(PS.target, x, { face: -1 });
def('passFake', { frame: F_DUO, p2pal: 'mate', keys: [K(at(PS.chestHold, -40), 0, { ball: B2, p2: RECV(70), hold: 300 }), K(at(pose(PS.chestHold, { hd: -2, lean: 4 }), -40), 300, { ball: B2, p2: RECV(70), hold: 700, cue: [{ eye: [70, 82], label: 'Eye contact' }] }), K(at(pose(PS.passStep, { rw: [16, 2], lw: [16, 3] }), -40), 300, { ball: B2, p2: RECV(70), hold: 500, cue: [{ text: 'Pass fake', at: [-20, 112] }] }), K(at(PS.chestHold, -40), 300, { ball: B2, p2: RECV(70) })] });
def('passStep', { frame: F_DUO, p2pal: 'mate', keys: [K(at(PS.chestHold, -40), 0, { ball: B2, p2: RECV(70), hold: 400 }), K(at(PS.passStep, -40), 380, { ball: B2, p2: RECV(70), hold: 900, cue: [{ ring: 'ra', label: 'Step toward the target' }] })] });
def('pass', { frame: F_DUO, p2pal: 'mate', trail: true, keys: [K(at(PS.chestHold, -40), 0, { ball: B2, p2: RECV(70), hold: 300 }), K(at(PS.passStep, -40), 300, { ball: B2, p2: RECV(70) }), K(at(PS.passExt, -40), 180, { ball: ['b', 3, 1], p2: RECV(70), hl: 'arm', cue: [{ ring: 'rw', label: 'Snap wrists, thumbs down' }] }), K(at(PS.passExt, -40), 420, { ball: ['b', -3, 4], p2: RECV(70), arc: 3, ballOn2: true, cue: [{ text: 'Chest-high target', at: [60, 108] }] })] });
C.pass.keys[3].ball = ['w', 56, 72];
def('passSoft', { frame: F_DUO, trail: true, keys: [K(at(PS.chestHold, -40), 0, { ball: B2, p2: RECV(70), hold: 300 }), K(at(pose(PS.passExt, { ra: [6, 2], la: [-6, 2] }), -40), 300, { ball: ['b', 3, 1], p2: RECV(70) }), K(at(PS.chestHold, -40), 700, { ball: ['w', 22, 5.2], arc: 20, p2: at(PS.defSide, 18, { face: -1 }), cue: [{ text: 'Soft pass: defender jumps it', at: [20, 108], col: '#FF6B6B' }] })] });
def('passTele', { frame: F_DUO, keys: [K(at(pose(PS.chestHold, { hd: -2 }), -40), 0, { ball: B2, p2: at(PS.defSide, 20, { face: -1 }), hold: 1200, cue: [{ eye: [70, 82], label: 'Staring at the target', bad: true }, { text: 'Defender reads it', at: [20, 108], col: '#FF6B6B' }] }), K(at(PS.chestHold, -40), 400, { ball: B2, p2: at(PS.defSide, 28, { face: -1 }) })] });

// ===== Footwork / post =====
def('triple', { frame: F_SOLO, keys: [K(PS.stand, 0, { ball: B2, hold: 200 }), K(PS.triple, 400, { ball: ['b', 2, 3], hold: 1500, cue: [{ ring: 'ball', label: 'Ball at the hip', r: 8 }, { ang: 'rk' }, { text: 'Shoot · pass · drive', at: [10, 104] }] })] });
def('pivot', { frame: F_SOLO, keys: [K(PS.triple, 0, { ball: ['b', 2, 3], cue: [{ ring: 'la', label: 'Pivot foot stays down', side: -1 }] }), K(pose(PS.triple, { ra: [-16, 3], lean: 18 }), 420, { ball: ['b', 2, 3], hold: 300, cue: [{ ring: 'la', label: 'Pivot foot stays down', side: -1 }] }), K(PS.triple, 420, { ball: ['b', 2, 3], hold: 300, cue: [{ ring: 'la', label: 'Pivot foot stays down', side: -1 }] })] });
def('travel', { frame: F_SOLO, keys: [K(PS.triple, 0, { ball: ['b', 2, 3], cue: [{ mark: -9, label: 'Start', bad: true }] }), K(pose(PS.triple, { x: 10, la: [-14, 3] }), 420, { ball: ['b', 2, 3], cue: [{ mark: -9, label: 'Start', bad: true }, { text: 'Pivot foot moved: travel', at: [10, 104], col: '#FF6B6B' }] }), K(pose(PS.triple, { x: 18 }), 420, { ball: ['b', 2, 3], hold: 600, cue: [{ mark: -9, label: 'Start', bad: true }] })] });
def('jab', { frame: F_DUO, keys: [K(PS.triple, 0, { ball: ['b', 2, 3], p2: at(PS.defSide, 46, { face: -1 }) }), K(pose(PS.triple, { ra: [22, 2], lean: 28 }), 180, { ball: ['b', 2, 3], p2: at(pose(PS.defSide, { ra: [4, 2], la: [-14, 2] }), 52, { face: -1 }), hold: 400, cue: [{ ring: 'ra', label: 'Jab' }, { text: 'Defender backs off: shoot', at: [30, 108] }] }), K(PS.triple, 260, { ball: ['b', 2, 3], p2: at(PS.defSide, 50, { face: -1 }) }), K(PS.shSet, 280, { ball: SETB, p2: at(PS.defSide, 50, { face: -1 }), hold: 500 })] });
const PU = x => at(PS.postUp, x, { face: -1 });
def('postSeal', { frame: F_RIM, props: rim, keys: [K(at(PS.stand, 40, { face: -1 }), 0, { p2: at(PS.defSide, 60, { face: -1 }) }), K(at(pose(PS.postUp, { rw: [10, 4], lw: [-10, 4] }), 40, { face: -1 }), 450, { p2: at(PS.defSide, 58, { face: -1 }), hold: 1300, cue: [{ width: ['ra', 'la'], label: 'Wide base' }, { text: 'Seal: defender on your back', at: [40, 110] }] })] });
def('postHigh', { frame: F_RIM, props: rim, keys: [K(at(pose(PS.postUp, { rw: [10, 4], lw: [-10, 4] }), 40, { face: -1 }), 0, { p2: at(PS.defSide, 58, { face: -1 }), ball: ['w', -60, 80] }), K(PU(40), 450, { ball: ['b', 0, 6], arc: 6, p2: at(PS.defSide, 58, { face: -1 }), hold: 1200, cue: [{ ring: 'ball', label: 'Keep it high', r: 8, side: -1 }] })] });
def('dropStep', { frame: F_RIM, props: rim, trail: true, keys: [K(PU(40), 0, { ball: ['b', 0, 6], p2: at(PS.defSide, 58, { face: -1 }) }), K(at(pose(PS.postUp, { ra: [26, 2] }), 50, { face: 1 }), 360, { ball: ['b', 2, 4], p2: at(PS.defSide, 58, { face: -1 }), cue: [{ ring: 'ra', label: 'Drop step' }] }), K(at(pose(PS.jumpAir, { hy: 66, rw: [14, 26] }), 86), 360, { ball: ['r', 2, 5], p2: at(PS.reachUp, 64, { face: -1 }) }), K(at(PS.landSoft, 90), 420, { ball: 'rim', arc: 12, p2: at(PS.defSide, 64, { face: -1 }) }), K(at(PS.landSoft, 90), 220, { ball: 'net' })] });
def('postLow', { frame: F_RIM, props: rim, keys: [K(at(pose(PS.postUp, { rw: [12, -14], lw: [8, -14] }), 40, { face: -1 }), 0, { ball: ['b', 0, -2], p2: at(PS.defSide, 58, { face: -1 }), cue: [{ ring: 'ball', label: 'Ball low', bad: true, r: 8, side: -1 }] }), K(at(pose(PS.postUp, { rw: [12, -14], lw: [8, -14] }), 40, { face: -1 }), 500, { ball: ['w', 20, 30], p2: at(pose(PS.defSide, { rw: [24, -10] }), 52, { face: -1 }), hold: 900, cue: [{ text: 'Reached in: stripped', at: [40, 112], col: '#FF6B6B' }] })] });

// ===== Defense =====
def('defStance', { view: 'front', frame: F_FRONT, keys: [K(PF.defUpright, 0, { hold: 300 }), K(PF.defStance, 500, { hold: 1600, cue: [{ width: ['ra', 'la'], label: 'Wider than shoulders' }, { ring: 'lk', label: 'Knees bent', side: 1 }, { ring: 'rw', label: 'One hand high', side: -1 }, { ring: 'lw', label: 'One hand low', side: 1, dy: -8 }] })] });
def('defUpright', { view: 'front', frame: F_FRONT, keys: [K(PF.defUpright, 0, { hold: 1500, cue: [{ ring: 'lk', label: 'Standing tall', bad: true, side: 1 }, { ring: 'H', label: 'Slow to react', bad: true, side: -1 }] }), K(pose(PF.defUpright, { hy: 46 }), 500)] });
function slideKeys(dir = 1, steps = 3, cue) {
  const keys = []; let x = -dir * 30, r = x - 16, l = x + 16;
  keys.push(K(pose(PF.defStance, { x, ra: [r - x, 2], la: [l - x, 2] }), 0, { cue }));
  for (let i = 0; i < steps; i++) {
    if (dir > 0) { l += 16; x += 8; keys.push(K(pose(PF.defStance, { x, ra: [r - x, 2], la: [l - x, 6] }), 200, { cue })); keys.push(K(pose(PF.defStance, { x, ra: [r - x, 2], la: [l - x, 2] }), 90, { cue })); r += 16; x += 8; keys.push(K(pose(PF.defStance, { x, ra: [r - x, 2], la: [l - x, 2] }), 200, { cue })); }
  }
  return keys;
}
def('slide', { view: 'front', frame: [0, -7, 170], keys: slideKeys(1, 3, [{ text: 'Lead foot, then trail foot. Never cross.', at: [0, 104] }, { arrow: [[-20, 92], [24, 92]], label: '' }]) });
def('crossFeet', { view: 'front', frame: [0, -7, 170], keys: [K(pose(PF.defStance, { x: -20, hy: 40 }), 0), K(pose(PF.defStance, { x: -8, hy: 42, ra: [20, 4], la: [6, 2] }), 300, { cue: [{ text: 'Feet crossed: easy to beat', at: [0, 104], col: '#FF6B6B' }, { ring: 'ra', bad: true }] }), K(pose(PF.defStance, { x: 6, hy: 40 }), 300, { hold: 500 })] });
def('hop', { view: 'front', frame: [0, -7, 170], keys: [K(pose(PF.defStance, { x: -20 }), 0), K(pose(PF.defStance, { x: -8, hy: 46, ra: [-17, 10], la: [17, 10] }), 220, { cue: [{ text: 'Both feet off the floor', at: [0, 108], col: '#FF6B6B' }] }), K(pose(PF.defStance, { x: 4 }), 220), K(pose(PF.defStance, { x: 16, hy: 46, ra: [-17, 10], la: [17, 10] }), 220), K(pose(PF.defStance, { x: 28 }), 220, { hold: 400 })] });
def('pushOff', { view: 'front', frame: [0, -7, 170], keys: [K(pose(PF.defStance, { x: -16 }), 0, { cue: [{ ring: 'ra', label: 'Push off back foot', side: -1 }] }), K(pose(PF.defStance, { x: -8, la: [26, 6] }), 260, { cue: [{ ring: 'ra', label: 'Push off back foot', side: -1 }, { arrow: [[0, 30], [26, 30]] }] }), K(pose(PF.defStance, { x: -8, la: [26, 2] }), 120, { hold: 400, cue: [{ ring: 'la', label: 'Lead foot steps', side: 1 }] }), K(pose(PF.defStance, { x: 4, ra: [-14, 2], la: [14, 2] }), 260, { hold: 600, cue: [{ width: ['ra', 'la'], label: 'Back to a wide base' }] })] });
def('handsActive', { view: 'front', frame: F_FRONT, keys: [K(PF.defStance, 0), K(pose(PF.defStance, { rw: [11, -13], rh: null, lw: [7, 20], lh: 180 }), 350, { cue: [{ text: 'Mirror the ball: high and low', at: [0, 106] }] }), K(PF.defStance, 350)] });
def('contest', { view: 'front', frame: F_FRONT, keys: [K(PF.defStance, 0, { hold: 300 }), K(PF.contest, 300, { hold: 1300, cue: [{ ring: 'rw', label: 'Hand high', side: -1 }, { ring: 'la', label: 'Feet stay down', side: 1 }] })] });
def('reach', { view: 'front', frame: [-6, -7, 150], keys: [K(PF.defStance, 0), K(PF.reach, 260, { hold: 1300, cue: [{ ring: 'rw', label: 'Reaching', bad: true, side: -1 }, { text: 'Feet stopped moving', at: [0, 104], col: '#FF6B6B' }] })] });
function runKeys(x0, x1, n, base = {}, extra = {}) { const keys = []; for (let i = 0; i <= n; i++) keys.push(K(at(pose(i % 2 ? PS.runB : PS.runA, base), x0 + (x1 - x0) * i / n), i ? 170 : 0, extra)); return keys; }
const SHOOTER = x => at(PS.shSet, x, { face: -1 });
def('closeout', { frame: [24, -8, 226], keys: [
  ...runKeys(-70, -10, 4, {}, { p2: SHOOTER(70), ball: null, cue: [{ text: 'Sprint', at: [-30, 108] }] }),
  K(at(PS.chop, 4), 150, { p2: SHOOTER(70), cue: [{ text: 'Chop: short, quick steps', at: [10, 108] }] }), K(at(pose(PS.chop, { ra: [4, 2], la: [-8, 3] }), 12), 120, { p2: SHOOTER(70) }), K(at(PS.chop, 20), 120, { p2: SHOOTER(70) }), K(at(pose(PS.chop, { ra: [4, 2], la: [-8, 3] }), 26), 120, { p2: SHOOTER(70) }),
  K(at(PS.defUp, 32), 220, { p2: SHOOTER(70), hold: 900, cue: [{ ring: 'rw', label: 'Hand up', side: -1 }, { ring: 'H', label: 'Balanced, in front', dy: -12 }] })] });
C.closeout.keys.forEach(k => { k.ball = ['w', 72, 99]; });
def('closeFly', { frame: [24, -8, 226], keys: [...runKeys(-70, 20, 5, {}, { p2: SHOOTER(70) }), K(at(PS.reachUp, 62), 240, { p2: pose(PS.dribLowDn, { x: 70, face: -1 }), cue: [{ text: 'Flew by: shooter drives', at: [30, 112], col: '#FF6B6B' }] }), K(at(PS.landSoft, 100), 300, { p2: pose(PS.dribLowUp, { x: 40, face: -1 }), hold: 600 })] });
C.closeFly.keys.forEach((k, i) => { k.ball = i < 6 ? ['w', 72, 99] : ['w', 40, 30]; });
def('closeLeap', { frame: [24, -8, 226], keys: [...runKeys(-60, 10, 4, {}, { p2: SHOOTER(70) }), K(at(PS.reachUp, 30), 240, { p2: at(PS.triple, 70, { face: -1 }), cue: [{ text: 'Left feet early: shot fake beats you', at: [30, 120], col: '#FF6B6B' }] }), K(at(PS.landSoft, 40), 300, { p2: at(PS.dribLowUp, 50, { face: -1 }), hold: 600 })] });
C.closeLeap.keys.forEach((k, i) => { k.ball = i < 5 ? ['w', 72, 99] : ['w', 64, 46]; });
def('boxout', { frame: F_RIM, props: rim, keys: [
  K(at(PS.defSide, 52, { face: -1 }), 0, { p2: at(PS.ready, 30), ball: ['w', 40, 140], cue: [{ text: 'Shot goes up: find your player', at: [40, 128] }] }),
  K(at(PS.boxSeal, 44), 360, { p2: at(PS.ready, 32), ball: ['w', 90, 175], arc: 0, cue: [{ ring: 'H', label: 'Back + hips into them', side: -1, dy: -10 }] }),
  K(at(PS.boxSeal, 48), 400, { p2: at(pose(PS.ready, { lean: 26 }), 33), ball: 'rim', hold: 200, cue: [{ text: 'Arms wide, stay low', at: [60, 110] }] }),
  K(at(PS.reachUp, 58), 300, { p2: at(PS.ready, 36), ball: ['w', 92, 122], cue: [{ text: 'Two hands', at: [62, 136] }] }),
  K(at(PS.landSoft, 60), 300, { p2: at(PS.ready, 36), ball: ['b', 4, 6], hold: 700, cue: [{ text: 'Land strong, chin it', at: [62, 110] }] })] });
def('boxWatch', { frame: F_RIM, props: rim, keys: [K(at(pose(PS.defSide, { hd: -30 }), 52, { face: 1 }), 0, { p2: at(PS.ready, 20), ball: ['w', 90, 175], cue: [{ eye: 'ball', label: 'Watching the ball', bad: true }] }), K(at(pose(PS.defSide, { hd: -30 }), 52), 500, { p2: at(PS.reachUp, 74), ball: ['w', 84, 128], hold: 900, cue: [{ text: 'Opponent goes around you', at: [40, 112], col: '#FF6B6B' }] })] });
def('sprintBack', { frame: [30, -8, 220], keys: runKeys(-80, 100, 8, { lean: 20 }, { cue: [{ speed: 'fast' }, { text: 'Sprint back', at: [10, 112] }] }) });
def('jogBack', { frame: [30, -8, 220], keys: runKeys(-80, 0, 6, { lean: 4, hy: 47, ra: [8, 5], la: [-8, 3] }, { cue: [{ speed: 'slow' }, { text: 'Jogging back', at: [10, 112], col: '#FF6B6B' }] }).map(k => ({ ...k, t: k.t ? 260 : 0 })) });

// ===== Training / conditioning =====
def('run', { frame: [30, -8, 220], keys: runKeys(-80, 100, 8, {}, { cue: [{ speed: 'fast' }] }) });
def('jog', { frame: [30, -8, 220], keys: runKeys(-60, 60, 6, { lean: 6, hy: 47, ra: [9, 5], la: [-9, 3] }, { cue: [{ speed: 'slow' }, { text: 'Easy pace', at: [0, 112] }] }).map(k => ({ ...k, t: k.t ? 300 : 0 })) });
def('intervals', { frame: [30, -8, 220], props: { lines: [{ x: -66, label: 'Start' }, { x: 112, label: 'Turn' }] }, keys: [...runKeys(-80, 100, 8, { lean: 22 }, { cue: [{ text: 'Sprint', at: [10, 112] }] }), K(at(pose(PS.stand, { lean: 20, rw: [12, -16], lw: [10, -16] }), 100), 300, { hold: 900, cue: [{ text: 'Rest, then repeat', at: [60, 112] }] })] });
def('squat', { frame: F_SOLO, keys: [K(pose(PS.stand, { rw: [26, -2], lw: [25, -1] }), 0, { hold: 200 }), K(PS.squat, 700, { hold: 500, cue: [{ ang: 'rk' }, { text: 'Hips back, chest up', at: [10, 102] }] }), K(pose(PS.stand, { rw: [26, -2], lw: [25, -1] }), 700, { hold: 200 })] });
def('lunge', { frame: F_SOLO, keys: [K(PS.stand, 0, { hold: 200 }), K(PS.lunge, 650, { hold: 500, cue: [{ ang: 'rk' }, { text: 'Front knee over ankle', at: [14, 102] }] }), K(PS.stand, 650, { hold: 200 })] });
def('jumpLand', { frame: F_TALL, keys: [K(PS.landSoft, 0, { hold: 200 }), K(PS.jumpAir, 300, { e: 'out' }), K(PS.landSoft, 340, { e: 'in', hold: 900, cue: [{ ang: 'rk' }, { text: 'Land soft: knees bent', at: [12, 112] }] }), K(PS.stand, 400)] });
def('landStiff', { frame: F_TALL, keys: [K(PS.landSoft, 0, { hold: 200 }), K(PS.jumpAir, 300, { e: 'out' }), K(PS.landStiff, 300, { e: 'in', hold: 1100, cue: [{ ring: 'rk', label: 'Locked knees', bad: true }] })] });
def('cut', { frame: [30, -8, 220], props: { cones: [60] }, keys: [...runKeys(-70, 40, 4), K(at(pose(PS.chop, { lean: -10, ra: [16, 2] }), 54), 180, { cue: [{ text: 'Plant and change direction', at: [40, 112] }] }), ...runKeys(54, -40, 4, { face: -1 }).slice(1)] });
def('legSwing', { view: 'front', frame: F_FRONT, keys: [K(PF.stand, 0), K(PF.legSwing, 450, { cue: [{ text: 'Leg swings', at: [0, 104] }] }), K(pose(PF.legSwing, { ra: [8, 6], la: [5, 2] }), 450), K(PF.legSwing, 450)] });
def('hamstring', { frame: F_SOLO, keys: [K(PS.stand, 0, { hold: 300 }), K(PS.hamstring, 900, { hold: 1500, cue: [{ text: 'Gentle stretch, after play', at: [10, 102] }] }), K(PS.stand, 800)] });
def('breathe', { view: 'front', frame: F_FRONT, keys: [K(PF.breatheOut, 0, { hold: 300 }), K(PF.breatheIn, 1600, { hold: 600, cue: [{ ring: 'S', r: 16, label: 'Breathe in', side: 1 }] }), K(PF.breatheOut, 1800, { hold: 600, cue: [{ ring: 'S', r: 9, label: 'Breathe out', side: 1 }] })] });
def('tall', { frame: F_SOLO, keys: [K(PS.slump, 0, { hold: 300 }), K(PS.tall, 600, { hold: 1500, cue: [{ plumb: true, label: 'Head up, shoulders back', top: 108 }] })] });
def('slump', { frame: F_SOLO, keys: [K(PS.tall, 0, { hold: 300 }), K(PS.slump, 600, { hold: 1500, cue: [{ ring: 'hd', label: 'Head down', bad: true }] })] });
def('pointCall', { frame: F_SOLO, keys: [K(PS.stand, 0, { hold: 250 }), K(PS.point, 300, { hold: 1500, cue: [{ text: '"Screen left!"', at: [36, 104], size: 7 }, { ring: 'rf', label: 'Point', dy: -9 }] })] });
def('easyShot', { frame: F_RIM, props: rim, trail: true, keys: shotKeys({ hy: -4, arc: 50, cueDip: [{ text: 'Close and easy', at: [10, 120] }] }) });

export const CLIPS = C;
