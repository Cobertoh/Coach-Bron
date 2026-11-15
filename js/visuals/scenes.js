// Court scenes (top-down half court, basket at the top). Coordinates in feet: x 0-50, y 0-47, basket (25, 5.25).
const TOP = [25, 30], WL = [6, 22], WR = [44, 22], CL = [3, 4], CR = [47, 4], EL = [19, 19], ER = [31, 19], BL = [18, 8], BR = [32, 8], SL = [15, 28], SR = [35, 28];
const d = p => { const vx = 25 - p[0], vy = 5.25 - p[1], L = Math.hypot(vx, vy) || 1, o = Math.max(4.4, L * 0.18); return [p[0] + vx / L * o, p[1] + vy / L * o]; }; // defender between player and rim
const S = {};
const L = (t, at, x = {}) => ({ t, at, ...x });

// ---- awareness / reading ----
S.scan = { players: { O1: TOP, O2: WR, O3: CL, X1: d(TOP), X2: d(WR), X3: [16, 12] }, ball: 'O1', steps: [
  { pass: ['O1', 'O2'], eye: [['O2', 'X2'], ['O2', 'X3']], hl: ['X3'], label: [L('Scan: your defender + the helper', [25, 41])] },
  { mv: { O2: [36, 12, 'dribble'], X2: [35, 15], X3: [30, 11] }, label: [L('Catch → quick read', [25, 41])] },
  { pass: ['O2', 'O3'], mv: { O1: [42, 28, 'cut'] }, label: [L('Pass, scan again, move', [25, 41])] }] };
S.ballWatch = { players: { O1: TOP, O2: WR, O3: CL, X1: d(TOP), X2: d(WR), X3: [8, 8] }, ball: 'O1', steps: [
  { pass: ['O1', 'O2'], eye: [['O3', 'O2']], hl: ['O3'], bad: true, label: [L('Staring at the ball', [25, 41], { bad: true })] },
  { mv: { X3: [14, 16] }, eye: [['O3', 'O2']], bad: true, label: [L('Misses the open lane', [25, 41], { bad: true })] }] };
S.ownOnly = { players: { O1: WR, X1: d(WR), X2: [24, 12], O2: CL }, ball: 'O1', steps: [{ mv: { O1: [30, 10, 'dribble'], X2: [29, 12] }, eye: [['O1', 'X1']], bad: true, label: [L('Only sees own defender: help arrives', [25, 41], { bad: true })] }] };
const four = { O1: TOP, O2: WR, O3: CR, O4: CL, X1: d(TOP), X2: d(WR), X3: d(CR, 0.9), X4: d(CL, 0.9) };
S.spot = { players: four, ball: 'O1', zones: ['corner-l', 'corner-r', 'wing-r', 'top'], steps: [{ label: [L('Spots away from the driving lanes', [25, 41])], zone: ['lane'] }] };
S.spaceDrive = { players: { ...four, O2: WL, X2: d(WL) }, ball: 'O1', steps: [
  { mv: { O1: [25, 12, 'dribble'], X1: [25, 15], X4: [22, 9] }, zone: ['lane'], label: [L('Drive', [25, 41])] },
  { mv: { O4: [6, 12, 'run'], O2: [8, 30, 'run'] }, hl: ['O4'], label: [L('Shift to an open spot', [25, 41])] },
  { pass: ['O1', 'O4'], shot: 'O4', label: [L('Kick → open shot', [25, 41])] }] };
S.spaceSwing = { players: four, ball: 'O1', steps: [
  { pass: ['O1', 'O2'], label: [L('Ball swings', [25, 41])] },
  { mv: { O1: [12, 30, 'run'], O4: [3, 10, 'run'], X1: [17, 25], X4: [8, 9] }, label: [L('Rebalance the floor', [25, 41])] }] };
S.cluster = { players: { O1: TOP, O2: [31, 28], O3: [20, 26], O4: [28, 22], X1: d(TOP), X2: [30, 24], X3: [21, 22], X4: [27, 18] }, ball: 'O1', zones: ['top'], steps: [{ bad: true, label: [L('Everyone near the ball: no room', [25, 41], { bad: true })], hl: ['O2', 'O3', 'O4'] }] };
S.oneSide = { players: { O1: WR, O2: CR, O3: [38, 30], O4: [40, 12], X1: d(WR), X2: d(CR, 0.9), X3: [36, 25], X4: [37, 11] }, ball: 'O1', zones: ['half-r'], steps: [{ bad: true, label: [L('Clustered on one side', [25, 41], { bad: true })], zone: ['half-l'] }] };
S.readClose = { players: { O1: WR, X1: [41, 20] }, ball: 'O1', steps: [{ hl: ['X1'], label: [L('Defender close → drive', [25, 41])] }, { mv: { O1: [30, 8, 'dribble'], X1: [38, 14] } }] };
S.readFar = { players: { O1: WR, X1: [36, 14] }, ball: 'O1', steps: [{ hl: ['X1'], label: [L('Defender far → shoot', [25, 41])] }, { shot: 'O1' }] };
S.readHelp = { players: { O1: TOP, O2: CR, X1: d(TOP), X2: d(CR, 0.9), X3: [24, 9] }, ball: 'O1', steps: [
  { mv: { O1: [25, 14, 'dribble'], X1: [25, 16] }, hl: ['X3'], label: [L('Help is in the paint?', [25, 41])] },
  { mv: { X3: [25, 11], X2: [36, 8] }, pass: ['O1', 'O2'], label: [L('Yes → pass out', [25, 41])] }, { shot: 'O2' }] };
const pnrBase = { O1: [25, 31], O5: [32, 24], O2: CL, X1: [25, 27], X5: [31, 20], X2: d(CL, 0.9) };
S.cvDrop = { players: pnrBase, ball: 'O1', steps: [{ mv: { O5: [27.5, 28.5, 'screen'] }, label: [L('Screen', [25, 41])] }, { mv: { O1: [32, 22, 'dribble'], X5: [26, 13], X1: [30, 27] }, zone: ['paint'], label: [L('Big stays back: DROP', [25, 41])] }, { shot: 'O1', label: [L('Pull up if open', [25, 41])] }] };
S.cvHedge = { players: pnrBase, ball: 'O1', steps: [{ mv: { O5: [27.5, 28.5, 'screen'] } }, { mv: { X5: [31, 27], O1: [33, 30, 'dribble'] }, label: [L('Big steps out: HEDGE', [25, 41])] }, { mv: { O5: [26, 12, 'cut'] }, pass: ['O1', 'O5'], label: [L('Attack the space behind', [25, 41])] }] };
S.cvSwitch = { players: { ...pnrBase, O5: [32, 24], X5: [31, 20] }, ball: 'O1', steps: [{ mv: { O5: [27.5, 28.5, 'screen'] } }, { mv: { X5: [30, 29], X1: [27, 24] }, hl: ['X5'], label: [L('Defenders trade: SWITCH', [25, 41])] }, { mv: { O1: [34, 10, 'dribble'] }, label: [L('Attack the slower big', [25, 41])] }] };
S.cvTrap = { players: pnrBase, ball: 'O1', steps: [{ mv: { O5: [27.5, 28.5, 'screen'] } }, { mv: { X5: [30, 30], X1: [28, 32], O1: [30, 33, 'dribble'] }, hl: ['X1', 'X5'], label: [L('Two on the ball: TRAP', [25, 41])] }, { mv: { O5: [26, 15, 'cut'] }, pass: ['O1', 'O5'], label: [L('Pass out quickly', [25, 41])] }] };
S.dropBad = { players: { ...pnrBase, X5: [25, 12] }, ball: 'O1', steps: [{ mv: { O1: [25, 12, 'dribble'] }, bad: true, hl: ['X5'], label: [L('Driving into the waiting big', [25, 41], { bad: true })] }] };
S.bigNotice = { players: { O1: [25, 30], X5: [26, 27], O2: CR, X2: d(CR, 0.9) }, ball: 'O1', steps: [{ hl: ['X5'], bad: true, label: [L('Missed the switch: big on you', [25, 41], { bad: true })] }] };

// ---- decisions ----
S.selOpen = { players: { O1: WR, X1: [36, 14] }, ball: 'O1', steps: [{ hl: ['O1'], label: [L('Open + balanced?', [25, 41])] }, { shot: 'O1' }] };
S.selRange = { players: { O1: [38, 26] }, ball: 'O1', zones: ['mid'], steps: [{ label: [L('Your range: shoot where you make it', [25, 41])], zone: ['mid'] }] };
S.selBetter = { players: { O1: WR, O2: CL, X1: [42, 19], X2: [10, 9] }, ball: 'O1', steps: [{ eye: [['O1', 'O2']], hl: ['O2'], label: [L('Teammate wide open?', [25, 41])] }, { pass: ['O1', 'O2'] }, { shot: 'O2' }] };
S.forced = { players: { O1: WR, X1: [42, 21], X2: [40, 18] }, ball: 'O1', steps: [{ shot: 'O1', bad: true, label: [L('Contested shot', [25, 41], { bad: true })] }] };
S.catchGo = { players: { O1: TOP, O2: WR, X1: d(TOP), X2: [34, 13] }, ball: 'O1', steps: [{ pass: ['O1', 'O2'], label: [L('First open option', [25, 41])] }, { shot: 'O2', label: [L('Catch and go', [25, 41])] }] };
S.reset = { players: { O1: WR, O2: TOP, O3: WL, X1: [42, 20], X2: [25, 27], X3: [8, 20] }, ball: 'O1', steps: [{ label: [L('Nothing open', [25, 41])] }, { pass: ['O1', 'O2'] }, { pass: ['O2', 'O3'], label: [L('Keep it moving', [25, 41])] }] };
S.holding = { players: { O1: WR, O2: CL, X1: [42, 20], X2: d(CL, 0.9) }, ball: 'O1', steps: [{ hl: ['O1'], bad: true, label: [L('Holding... defense recovers', [25, 41], { bad: true })] }, { mv: { X1: [43, 21] } }] };
S.sameMove = { players: { O1: WR, X1: [40, 19] }, ball: 'O1', steps: [{ mv: { O1: [32, 10, 'dribble'], X1: [34, 12] }, bad: true, label: [L('Same move every time: they wait for it', [25, 41], { bad: true })] }] };

// ---- off-ball / creating / screens ----
S.backcut = { players: { O1: TOP, O2: WR, X1: d(TOP), X2: [40, 23] }, ball: 'O1', steps: [{ hl: ['X2'], label: [L('Defender overplays', [25, 41])] }, { mv: { O2: [28, 6, 'cut'] }, label: [L('Back cut', [25, 41])] }, { pass: ['O1', 'O2'], shot: 'O2' }] };
S.flash = { players: { O1: WR, O2: BL, X1: d(WR), X2: [16, 6] }, ball: 'O1', steps: [{ hl: ['X2'], label: [L('Defender sags off', [25, 41])] }, { mv: { O2: [27, 19, 'cut'] }, label: [L('Flash to the ball', [25, 41])] }, { pass: ['O1', 'O2'] }] };
S.vcut = { players: { O1: TOP, O2: [40, 12], X2: [38, 14] }, ball: 'O1', steps: [{ mv: { O2: [34, 8, 'cut'] }, label: [L('V-cut: go in…', [25, 41])] }, { mv: { O2: [44, 22, 'cut'], X2: [38, 16] }, label: [L('…then pop out', [25, 41])] }, { pass: ['O1', 'O2'] }] };
S.passCut = { players: { O1: TOP, O2: WR, X1: d(TOP), X2: d(WR) }, ball: 'O1', steps: [{ pass: ['O1', 'O2'] }, { mv: { O1: [27, 8, 'cut'] }, label: [L('Pass, then cut', [25, 41])] }, { mv: { O1: [10, 22, 'run'] }, label: [L('or relocate', [25, 41])] }] };
S.standStill = { players: { O1: TOP, O2: WR, O3: WL, X1: d(TOP), X2: d(WR), X3: d(WL) }, ball: 'O1', steps: [{ hl: ['O2', 'O3'], bad: true, label: [L('Standing still: easy to guard', [25, 41], { bad: true })] }] };
S.cutIntoDrive = { players: { O1: TOP, O2: WR, X1: d(TOP), X2: d(WR) }, ball: 'O1', steps: [{ mv: { O1: [27, 12, 'dribble'], O2: [28, 14, 'cut'] }, bad: true, zone: ['lane'], label: [L('Cut into the driver\'s lane', [25, 41], { bad: true })] }] };
S.driveGap = { players: { O1: TOP, O2: WR, O3: WL, X1: d(TOP), X2: d(WR), X3: d(WL) }, ball: 'O1', zones: ['gap-r'], steps: [{ mv: { O1: [32, 18, 'dribble'], X1: [29, 20] }, label: [L('Drive the gap', [25, 41])] }, { mv: { X2: [33, 15] }, hl: ['O2'], label: [L('Who did the helper leave?', [25, 41])] }, { pass: ['O1', 'O2'], shot: 'O2', label: [L('Pass to the open player', [25, 41])] }] };
S.noPass = { players: { O1: TOP, O2: WR, X1: d(TOP), X2: d(WR) }, ball: 'O1', steps: [{ mv: { O1: [29, 10, 'dribble'], X2: [30, 9] }, hl: ['O2'], bad: true, label: [L('Help came, no pass', [25, 41], { bad: true })] }, { shot: 'O1' }] };
const pin = { O1: TOP, O2: BR, O5: [34, 13], X2: [31, 9], X1: d(TOP), X5: [32, 11] };
S.scrSetup = { players: pin, ball: 'O1', steps: [{ mv: { O2: [28, 6, 'cut'], X2: [27, 7] }, label: [L('Set up your defender', [25, 41])] }, { mv: { O2: [40, 20, 'cut'], O5: [36, 15, 'screen'] }, label: [L('Run them into the screen', [25, 41])] }] };
S.scrCurl = { players: { ...pin, O2: [36, 12], X2: [34, 10] }, ball: 'O1', steps: [{ mv: { O5: [36, 15, 'screen'] } }, { mv: { O2: [27, 13, 'cut'], X2: [37, 16] }, label: [L('Defender trails → curl', [25, 41])] }, { pass: ['O1', 'O2'], shot: 'O2' }] };
S.scrUnder = { players: { ...pin, O2: [36, 12], X2: [34, 10] }, ball: 'O1', steps: [{ mv: { O5: [36, 15, 'screen'] } }, { mv: { O2: [42, 22, 'cut'], X2: [33, 14] }, label: [L('Defender goes under → shoot', [25, 41])] }, { pass: ['O1', 'O2'], shot: 'O2' }] };
S.scrSwitch = { players: { ...pin, O2: [36, 12], X2: [34, 10] }, ball: 'O1', steps: [{ mv: { O5: [36, 15, 'screen'] } }, { mv: { O2: [42, 22, 'cut'], X5: [40, 20], X2: [35, 13] }, hl: ['X5'], label: [L('Switch → attack the mismatch', [25, 41])] }, { mv: { O2: [32, 9, 'dribble'] } }] };
S.scrEarly = { players: pin, ball: 'O1', steps: [{ mv: { O2: [42, 22, 'cut'] }, bad: true, label: [L('Left before the screen was set', [25, 41], { bad: true })] }, { mv: { O5: [36, 15, 'screen'], X2: [41, 20] } }] };
const pnr = { O1: [25, 31], O5: [33, 22], O2: CL, O3: CR, X1: [25, 27], X5: [31, 18], X2: d(CL, 0.9), X3: d(CR, 0.9) };
S.pnrSet = { players: pnr, ball: 'O1', steps: [{ mv: { O5: [27.5, 28.5, 'screen'] }, label: [L('Solid screen at the top', [25, 41])] }] };
S.pnrUse = { players: { ...pnr, O5: [27.5, 28.5] }, ball: 'O1', steps: [{ label: [L('Wait for the screen…', [25, 41])] }, { mv: { O1: [34, 24, 'dribble'], X1: [30, 28] }, label: [L('…attack the side given', [25, 41])] }] };
S.pnrRoll = { players: { ...pnr, O5: [27.5, 28.5], O1: [34, 24], X1: [30, 28] }, ball: 'O1', steps: [{ mv: { O5: [26, 9, 'cut'] }, label: [L('Roll to the rim, hands ready', [25, 41])] }, { pass: ['O1', 'O5'], shot: 'O5' }] };
S.pnrWeak = { players: { ...pnr, O5: [27.5, 28.5] }, ball: 'O1', zones: ['corner-l', 'corner-r'], steps: [{ hl: ['O2', 'O3'], label: [L('Weak side stays spaced', [25, 41])] }] };
S.pnrRead = { players: { ...pnr, O5: [27.5, 28.5] }, ball: 'O1', steps: [{ mv: { O1: [33, 22, 'dribble'], O5: [26, 10, 'cut'], X3: [30, 9] }, label: [L('Read: drive · pocket · kick · pull-up', [25, 41])] }, { pass: ['O1', 'O3'], shot: 'O3', label: [L('Helper came → kick', [25, 41])] }] };
S.pnrEarly = { players: pnr, ball: 'O1', steps: [{ mv: { O1: [33, 26, 'dribble'], O5: [29, 26, 'screen'] }, bad: true, label: [L('Went before the screen', [25, 41], { bad: true })] }] };
S.pnrLane = { players: { ...pnr, O5: [27.5, 28.5], O1: [33, 22], O3: [30, 12] }, ball: 'O1', zones: ['lane'], steps: [{ hl: ['O3'], bad: true, label: [L('Weak side clogs the lane', [25, 41], { bad: true })] }] };
S.rollEarly = { players: pnr, ball: 'O1', steps: [{ mv: { O5: [26, 10, 'cut'] }, bad: true, label: [L('Rolled before screening', [25, 41], { bad: true })] }] };

// ---- game situations ----
S.lanes = { vb: '-2.5 -3 55 53', players: { O1: [25, 44], O2: [6, 44], O3: [44, 44], X1: [25, 18], X2: [22, 10] }, ball: 'O1', steps: [
  { mv: { O1: [25, 30, 'dribble'], O2: [5, 22, 'run'], O3: [45, 22, 'run'] }, label: [L('Push it. Fill left · middle · right', [25, 46])] },
  { mv: { X1: [25, 25] }, pass: ['O1', 'O3'], label: [L('Attack or find the shooter', [25, 46])] }, { shot: 'O3' }] };
S.pushPace = { vb: '-2.5 -3 55 53', players: { O1: [25, 44] }, ball: 'O1', steps: [{ mv: { O1: [25, 26, 'dribble'] }, label: [L('Get it up the floor fast', [25, 46])] }] };
S.slowDown = { players: { O1: TOP, O2: WR, O3: WL, X1: d(TOP), X2: d(WR), X3: d(WL), X4: [25, 10] }, ball: 'O1', steps: [{ label: [L('Defense set? Slow down, run offense', [25, 41])] }, { pass: ['O1', 'O2'] }] };
S.noLanes = { vb: '-2.5 -3 55 53', players: { O1: [25, 30], O2: [22, 36], O3: [28, 38], X1: [25, 22], X2: [24, 14] }, ball: 'O1', steps: [{ bad: true, label: [L('Lanes not filled: no options', [25, 46], { bad: true })] }] };
S.bestOption = { players: { O1: TOP, O2: WR, O3: CL, X1: d(TOP), X2: d(WR), X3: d(CL, 0.9) }, ball: 'O1', steps: [{ hl: ['O2'], label: [L('Ball to your best option', [25, 41])] }, { pass: ['O1', 'O2'] }] };

// ---- pickup ----
S.watchFirst = { players: { O1: TOP, O2: WR, O3: WL, X1: d(TOP), X2: d(WR), X3: d(WL) }, ball: 'O1', steps: [{ hl: ['O1'], label: [L('Who shoots?', [25, 41])] }, { hl: ['O2'], label: [L('Who passes?', [25, 41])] }, { hl: ['X3'], label: [L('Who defends?', [25, 41])] }] };
S.guardBest = { players: { O1: TOP, O2: WR, O3: CL, X1: d(TOP) }, ball: 'O1', steps: [{ hl: ['O1'], label: [L('Take the best scorer', [25, 41])] }] };
S.openShare = { players: { O1: WR, O2: CL, X1: [40, 18], X2: [10, 10] }, ball: 'O1', steps: [{ eye: [['O1', 'O2']], label: [L('Open? shoot. Teammate open? pass.', [25, 41])] }, { pass: ['O1', 'O2'] }, { shot: 'O2' }] };
S.hog = { players: { O1: TOP, O2: WR, O3: CL, X1: [25, 26], X2: [38, 18] }, ball: 'O1', steps: [{ mv: { O1: [30, 14, 'dribble'], X2: [30, 12] }, hl: ['O3'], bad: true, label: [L('Ball hog: teammate wide open', [25, 41], { bad: true })] }] };
S.mismatch = { players: { O4: WR, X1: [41, 19] }, ball: 'O4', steps: [{ hl: ['O4', 'X1'], label: [L('Big vs small? Small vs slow?', [25, 41])] }, { mv: { O4: [33, 9, 'dribble'], X1: [35, 11] }, label: [L('Attack it next trip', [25, 41])] }, { shot: 'O4' }] };
S.c3v3 = { players: { O1: TOP, O2: CL, O3: CR, X1: d(TOP), X2: d(CL, 0.9), X3: d(CR, 0.9) }, ball: 'O1', zones: ['corner-l', 'corner-r'], steps: [{ label: [L('One player in each corner or wing', [25, 41])] }, { mv: { O1: [25, 14, 'dribble'], X1: [25, 16], X2: [20, 10] }, label: [L('Attack the middle', [25, 41])] }, { mv: { O2: [20, 4, 'cut'] }, pass: ['O1', 'O2'], label: [L('Defense collapses → cut', [25, 41])] }] };
S.noCut = { players: { O1: [25, 14], O2: CL, O3: CR, X1: [25, 11], X2: [21, 9], X3: [29, 9] }, ball: 'O1', steps: [{ hl: ['O2', 'O3'], bad: true, label: [L('Defense collapses, no one cuts', [25, 41], { bad: true })] }] };

// ---- team defense ----
S.helpSee = { players: { O1: WR, O2: WL, X1: d(WR), X2: [16, 15] }, ball: 'O1', steps: [{ eye: [['X2', 'O1'], ['X2', 'O2']], hl: ['X2'], label: [L('See ball + your player', [25, 41])] }] };
S.helpGap = { players: { O1: WR, O2: WL, X1: d(WR), X2: d(WL) }, ball: 'O1', steps: [{ mv: { X2: [18, 15] }, zone: ['gap'], label: [L('Ball on the other side → sink into the gap', [25, 41])] }] };
S.helpStop = { players: { O1: WR, O2: WL, X1: d(WR), X2: [18, 15] }, ball: 'O1', steps: [{ mv: { O1: [28, 14, 'dribble'], X2: [25, 13] }, label: [L('Stop the driver…', [25, 41])] }, { pass: ['O1', 'O2'], mv: { X2: [10, 19] }, label: [L('…recover to your player', [25, 41])] }] };
S.rotate = { players: { O1: WR, O2: CR, O3: CL, X1: d(WR), X2: d(CR, 0.9), X3: [18, 10] }, ball: 'O1', steps: [{ mv: { O1: [32, 10, 'dribble'], X2: [32, 8] }, label: [L('Help stops the drive', [25, 41])] }, { mv: { X3: [40, 6] }, hl: ['X3'], label: [L('Next defender rotates to the open man', [25, 41])] }] };
S.ballWatchD = { players: { O1: WR, O2: WL, X1: d(WR), X2: [20, 15] }, ball: 'O1', steps: [{ eye: [['X2', 'O1']], mv: { O2: [22, 4, 'cut'] }, bad: true, label: [L('Ball-watching: back cut', [25, 41], { bad: true })] }] };
S.scrOver = { players: { O1: [25, 31], O5: [27.5, 28.5], X1: [25, 27.5], X5: [30, 23] }, ball: 'O1', steps: [{ label: [L('"Screen left!"', [25, 41])] }, { mv: { O1: [33, 26, 'dribble'], X1: [31, 27] }, label: [L('Over: squeeze between screener and ball', [25, 41])] }] };
S.scrUnderD = { players: { O1: [25, 31], O5: [27.5, 28.5], X1: [25, 27.5], X5: [30, 23] }, ball: 'O1', steps: [{ mv: { O1: [33, 27, 'dribble'], X1: [29, 24] }, label: [L('Under: go behind the screener', [25, 41])] }] };
S.caught = { players: { O1: [25, 31], O5: [27.5, 28.5], X1: [26.5, 28.5], X5: [30, 23] }, ball: 'O1', steps: [{ mv: { O1: [34, 18, 'dribble'] }, hl: ['X1'], bad: true, label: [L('Caught on the screen', [25, 41], { bad: true })] }] };
S.switchD = { players: { O1: [25, 31], O5: [27.5, 28.5], X1: [25, 27.5], X5: [30, 25] }, ball: 'O1', steps: [{ label: [L('"Switch!"', [25, 41])] }, { mv: { O1: [32, 27, 'dribble'], X5: [31, 25], X1: [27, 24] }, hl: ['X1', 'X5'], label: [L('Trade matchups', [25, 41])] }, { mv: { O5: [26, 10, 'cut'], X1: [26, 12] }, label: [L('Be ready to help or recover', [25, 41])] }] };
S.lateSwitch = { players: { O1: [25, 31], O5: [27.5, 28.5], X1: [25, 27.5], X5: [30, 23] }, ball: 'O1', steps: [{ mv: { O1: [32, 20, 'dribble'], O5: [26, 10, 'cut'], X1: [28, 26], X5: [29, 24] }, bad: true, label: [L('Late / silent switch: both open', [25, 41], { bad: true })] }] };
S.transD = { vb: '-2.5 -3 55 53', players: { O1: [25, 44], O2: [8, 40], O3: [42, 40], X1: [25, 38], X2: [20, 32], X3: [30, 32] }, ball: 'O1', steps: [
  { mv: { X1: [25, 14], X2: [18, 10], X3: [32, 10], O1: [25, 30, 'dribble'] }, label: [L('Sprint back', [25, 46])] },
  { mv: { X1: [25, 26] }, hl: ['X1'], label: [L('Stop the ball first', [25, 46])] },
  { mv: { X2: [10, 22], X3: [40, 22], O2: [8, 22, 'run'], O3: [42, 22, 'run'] }, label: [L('Pick up the open players, talk', [25, 46])] }] };
S.dPnr = { players: { O1: [25, 31], O5: [33, 22], X1: [25, 27], X5: [31, 18] }, ball: 'O1', steps: [
  { mv: { O5: [27.5, 28.5, 'screen'] }, hl: ['X5'], label: [L('Big calls the coverage', [25, 41])] },
  { mv: { O1: [33, 25, 'dribble'], X1: [31, 27], X5: [27, 15] }, label: [L('Guard fights over, big drops', [25, 41])] },
  { mv: { O5: [26, 12, 'cut'], X5: [26, 10], X1: [32, 23] }, label: [L('Both recover', [25, 41])] }] };
S.twoOnBall = { players: { O1: [25, 31], O5: [27.5, 28.5], X1: [26, 29], X5: [29, 29] }, ball: 'O1', steps: [{ mv: { O5: [26, 10, 'cut'] }, bad: true, hl: ['X1', 'X5'], label: [L('Both on the ball: roller open', [25, 41], { bad: true })] }] };
S.shade = { players: { O1: WR, X1: d(WR) }, ball: 'O1', steps: [{ hl: ['O1'], label: [L('Righty? Likes to drive?', [25, 41])] }, { mv: { X1: [39, 20] }, label: [L('Shade to take away the favourite', [25, 41])] }] };

// ---- knowledge ----
S.points = { players: {}, zones: [], steps: [
  { zone: ['ft'], label: [L('Free throw = 1', [25, 22])] }, { zone: ['mid'], label: [L('Inside the arc = 2', [25, 12])] }, { zone: ['three'], label: [L('Behind the arc = 3', [25, 37])] }] };
S.positions = { players: { O1: TOP, O2: WR, O3: WL, O4: [33, 9], O5: [18, 8] }, steps: [
  { hl: ['O1'], label: [L('1 Point guard: runs offense', [25, 41])] }, { hl: ['O2'], label: [L('2 Shooting guard: scorer', [25, 41])] }, { hl: ['O3'], label: [L('3 Small forward: versatile wing', [25, 41])] },
  { hl: ['O4'], label: [L('4 Power forward: inside + out', [25, 41])] }, { hl: ['O5'], label: [L('5 Center: rim, boards, screens', [25, 41])] }] };
S.motion = { players: { O1: TOP, O2: WR, O3: WL, O4: CR, O5: CL }, ball: 'O1', steps: [{ pass: ['O1', 'O2'], mv: { O1: [27, 8, 'cut'] }, label: [L('Motion: pass, cut, refill', [25, 41])] }, { mv: { O1: [3, 4, 'run'], O5: [8, 26, 'run'], O3: [25, 30, 'run'] } }] };
S.fiveOut = { players: { O1: TOP, O2: WR, O3: WL, O4: CR, O5: CL, X1: d(TOP), X2: d(WR), X3: d(WL), X4: d(CR, 0.9), X5: d(CL, 0.9) }, ball: 'O1', zones: ['paint'], steps: [{ label: [L('Five out: empty paint for drives', [25, 41])] }, { mv: { O1: [25, 10, 'dribble'] } }] };
S.setPlay = { players: { O1: TOP, O2: BR, O5: [34, 13] }, ball: 'O1', steps: [{ mv: { O5: [36, 15, 'screen'] }, label: [L('Set play: planned action', [25, 41])] }, { mv: { O2: [42, 22, 'cut'] } }, { pass: ['O1', 'O2'], shot: 'O2', label: [L('…for a specific shot', [25, 41])] }] };
S.man = { players: { O1: TOP, O2: WR, O3: WL, X1: d(TOP), X2: d(WR), X3: d(WL) }, ball: 'O1', steps: [{ eye: [['X1', 'O1'], ['X2', 'O2'], ['X3', 'O3']], label: [L('Man-to-man: each guards a player', [25, 41])] }, { mv: { O2: [36, 8, 'cut'], X2: [35, 10] } }] };
S.zone23 = { players: { O1: TOP, O2: WR, X1: [19, 21], X2: [31, 21], X3: [10, 9], X4: [25, 7], X5: [40, 9] }, ball: 'O1', steps: [{ label: [L('Zone (2-3): guard an area', [25, 41])] }, { pass: ['O1', 'O2'], mv: { X2: [38, 20], X5: [43, 12], X1: [27, 22] }, label: [L('Shift with the ball', [25, 41])] }] };
S.press = { vb: '-2.5 -3 55 53', players: { O1: [8, 44], X1: [12, 42], X2: [5, 38], O2: [30, 30], X3: [28, 26] }, ball: 'O1', steps: [{ mv: { X1: [10, 40], X2: [7, 41] }, hl: ['X1', 'X2'], label: [L('Press: pressure + trap early', [25, 46])] }] };
S.zoneSilent = { players: { O1: TOP, O2: WR, X1: [19, 21], X2: [31, 21], X3: [10, 9], X5: [40, 9] }, ball: 'O1', steps: [{ pass: ['O1', 'O2'], bad: true, hl: ['O2'], label: [L('No talk: nobody takes the shooter', [25, 41], { bad: true })] }] };

// ---- court terms ----
const Z = (z, t, at) => ({ players: {}, zones: [z], labels: [L(t, at)], steps: [{ zone: [z] }] });
S.tPaint = Z('paint', 'Paint / lane', [25, 23]); S.tThree = Z('three', 'Three-point line', [25, 37]); S.tElbow = { players: {}, steps: [{ zone: ['elbow-l', 'elbow-r'], label: [L('Elbows', [25, 24])] }] };
S.tBlock = { players: {}, steps: [{ zone: ['block-l', 'block-r'], label: [L('Blocks', [25, 13])] }] };
S.tWing = { players: {}, steps: [{ zone: ['wing-l', 'wing-r'], label: [L('Wings', [25, 26])] }] };
S.tCorner = { players: {}, steps: [{ zone: ['corner-l', 'corner-r'], label: [L('Corners', [25, 16])] }] };
S.tSides = { players: { O1: WR, O2: WL }, ball: 'O1', steps: [{ zone: ['half-r'], label: [L('Strong side (ball side)', [37, 37])] }, { zone: ['half-l'], label: [L('Weak / help side', [12, 37])] }] };
S.tBallScreen = S.pnrSet; S.tPnr = { players: pnr, ball: 'O1', steps: [{ mv: { O5: [27.5, 28.5, 'screen'] } }, { mv: { O1: [34, 22, 'dribble'], O5: [26, 10, 'cut'] } }, { pass: ['O1', 'O5'], shot: 'O5' }] };
S.tPop = { players: pnr, ball: 'O1', steps: [{ mv: { O5: [27.5, 28.5, 'screen'] } }, { mv: { O1: [32, 20, 'dribble'], O5: [20, 30, 'run'] }, label: [L('Screener pops out', [25, 41])] }, { pass: ['O1', 'O5'], shot: 'O5' }] };
S.tGiveGo = { players: { O1: TOP, O2: WR, X1: d(TOP), X2: d(WR) }, ball: 'O1', steps: [{ pass: ['O1', 'O2'], label: [L('Give…', [25, 41])] }, { mv: { O1: [27, 8, 'cut'] }, label: [L('…and go', [25, 41])] }, { pass: ['O2', 'O1'], shot: 'O1' }] };
S.tDho = { players: { O1: TOP, O5: [36, 26], X1: d(TOP) }, ball: 'O5', steps: [{ mv: { O1: [35, 28, 'run'] }, label: [L('Hand-off', [25, 41])] }, { pass: ['O5', 'O1'], mv: { O1: [32, 14, 'dribble'] } }] };
S.tScreen = { players: { O1: TOP, O2: WR, O3: ER, X2: d(WR) }, ball: 'O1', steps: [{ mv: { O3: [40, 18, 'screen'] }, label: [L('Screen: block a defender\'s path', [25, 41])] }, { mv: { O2: [30, 12, 'cut'] } }] };
S.tFast = S.lanes; S.tAssist = { players: { O1: WR, O2: CL }, ball: 'O1', steps: [{ pass: ['O1', 'O2'], label: [L('Pass…', [25, 41])] }, { shot: 'O2', label: [L('…that leads to a make = assist', [25, 41])] }] };
S.tTurnover = { players: { O1: WR, O2: CL, X3: [24, 10] }, ball: 'O1', steps: [{ pass: ['O1', 'O2'], mv: { X3: [16, 7] }, label: [L('Lost possession = turnover', [25, 41])] }] };
S.tTurnover.steps[0].pass = null; S.tTurnover.steps.push({ ball: 'X3', label: [L('Lost possession = turnover', [25, 41])] });
S.tHedge = S.cvHedge; S.tDrop = S.cvDrop; S.tTrap = S.cvTrap; S.tSwitch = S.switchD; S.tHelp = S.helpStop; S.tMan = S.man; S.tZone = S.zone23;
S.tDeny = { players: { O1: TOP, O2: WR, X2: [39, 23] }, ball: 'O1', steps: [{ hl: ['X2'], label: [L('Deny: hand in the passing lane', [25, 41])] }] };
S.tBackdoor = S.backcut; S.tDriveKick = S.spaceDrive; S.tSpacing = S.spot;
S.tPinDown = S.scrSetup;
S.tBoxOut = { players: { O5: [30, 14], X5: [29, 10] }, ball: null, steps: [{ mv: { X5: [29, 11] }, label: [L('Shot: find, hit, hold', [25, 41])] }] };

// ---- drill setups ----
S.dFiveSpot = { players: { O1: CL }, ball: 'O1', zones: ['corner-l', 'wing-l', 'top', 'wing-r', 'corner-r'], steps: [{ shot: 'O1' }, { mv: { O1: [7, 23, 'run'] } }, { shot: 'O1' }, { mv: { O1: [25, 31, 'run'] } }, { shot: 'O1' }], stepMs: 1100 };
S.dRelocate = { players: { O1: WR, O2: TOP }, ball: 'O1', steps: [{ pass: ['O1', 'O2'], label: [L('Pass', [25, 41])] }, { mv: { O1: [47, 5, 'run'] }, label: [L('Relocate', [25, 41])] }, { pass: ['O2', 'O1'], shot: 'O1', label: [L('Catch + shoot', [25, 41])] }] };
S.dCones = { players: { O1: [25, 44] }, ball: 'O1', vb: '-2.5 -3 55 53', labels: [L('▲', [25, 34], { col: '#F2994A' }), L('▲', [25, 26], { col: '#F2994A' }), L('▲', [25, 18], { col: '#F2994A' })], steps: [{ mv: { O1: [21, 34, 'dribble'] } }, { mv: { O1: [29, 26, 'dribble'] } }, { mv: { O1: [21, 18, 'dribble'] } }, { mv: { O1: [25, 9, 'dribble'] } }, { shot: 'O1' }], stepMs: 1000 };
S.d3v3 = S.c3v3; S.d2man = S.pnrRead; S.d3on2 = { vb: '-2.5 -3 55 53', players: { O1: [25, 44], O2: [8, 42], O3: [42, 42], X1: [25, 18], X2: [24, 9] }, ball: 'O1', steps: [{ mv: { O1: [25, 26, 'dribble'], O2: [8, 18, 'run'], O3: [42, 18, 'run'] }, label: [L('3 attack 2', [25, 46])] }, { mv: { X1: [25, 23] }, pass: ['O1', 'O2'] }, { mv: { X2: [12, 12] }, pass: ['O2', 'O3'] }, { shot: 'O3' }] };
S.dShell = { players: { O1: [18, 30], O2: [32, 30], O3: WL, O4: WR, X1: [18, 25], X2: [29, 22], X3: [14, 16], X4: [36, 17] }, ball: 'O1', steps: [{ pass: ['O1', 'O2'], mv: { X1: [21, 21], X2: [32, 26], X3: [17, 14], X4: [40, 19] }, label: [L('Defense shifts on every pass', [25, 41])] }, { pass: ['O2', 'O4'], mv: { X2: [28, 21], X4: [42, 19], X1: [24, 17], X3: [20, 12] } }] };
S.dSprints = { vb: '-2.5 -3 55 53', players: { O1: [2, 44] }, labels: [L('|', [12, 44]), L('|', [25, 44]), L('|', [38, 44])], steps: [{ mv: { O1: [12, 44, 'run'] } }, { mv: { O1: [2, 44, 'run'] } }, { mv: { O1: [25, 44, 'run'] } }, { mv: { O1: [2, 44, 'run'] } }, { mv: { O1: [48, 44, 'run'] } }], stepMs: 900 };
S.dSeventeens = { vb: '-2.5 -3 55 53', players: { O1: [1, 40] }, steps: [{ mv: { O1: [49, 40, 'run'] }, label: [L('Sideline to sideline × 17', [25, 46])] }, { mv: { O1: [1, 40, 'run'] } }, { mv: { O1: [49, 40, 'run'] } }], stepMs: 1000 };
S.dZigzag = { vb: '-2.5 -3 55 53', players: { X1: [10, 44] }, labels: [L('▲', [20, 36], { col: '#F2994A' }), L('▲', [10, 28], { col: '#F2994A' }), L('▲', [20, 20], { col: '#F2994A' })], steps: [{ mv: { X1: [20, 36, 'run'] }, label: [L('Slide diagonally', [25, 46])] }, { mv: { X1: [10, 28, 'run'] } }, { mv: { X1: [20, 20, 'run'] } }], stepMs: 1100 };
S.dCloseout = { players: { X1: [25, 6], O1: WR }, ball: 'O1', steps: [{ mv: { X1: [38, 18, 'run'] }, label: [L('Sprint, then chop', [25, 41])] }, { mv: { X1: [41, 20] }, label: [L('Contest + slide', [25, 41])] }] };
S.dBoxPartner = S.tBoxOut;
S.dMikan = { players: { O1: [21, 6] }, ball: 'O1', steps: [{ shot: 'O1', label: [L('Right hand', [25, 41])] }, { mv: { O1: [29, 6, 'run'] }, ball: 'O1' }, { shot: 'O1', label: [L('Left hand', [25, 41])] }], stepMs: 1000 };
S.dPartnerPass = { vb: '-2.5 -3 55 53', players: { O1: [18, 44], O2: [32, 44] }, ball: 'O1', steps: [{ mv: { O1: [18, 34, 'run'], O2: [32, 34, 'run'] }, pass: ['O1', 'O2'] }, { mv: { O1: [18, 24, 'run'], O2: [32, 24, 'run'] }, pass: ['O2', 'O1'] }, { mv: { O1: [22, 8, 'dribble'] } }, { shot: 'O1' }] };

export const SCENES = S;
