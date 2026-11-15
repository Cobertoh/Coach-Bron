// Which visual illustrates each piece of content. Refs: 'c:clip' (animated player), 's:scene' (court),
// 'p:icon+icon|Title|Sub' (pictogram, '>' between icons draws a flow), 'x:special'.
// Lessons: s = one visual per step, m = [wrong, right] per common mistake, hero = the "Watch it" headline visual.
const EV = [{ y: '1891', t: 'Invented' }, { y: '1946', t: 'BAA starts' }, { y: '1949', t: 'NBA formed' }, { y: '1954', t: 'Shot clock' }, { y: '1979', t: 'NBA 3-pt line' }];
export const XS = {
  history: { kind: 'timeline', events: EV },
  h0: { kind: 'timeline', hl: 0, events: EV }, h1: { kind: 'timeline', hl: 2, events: EV }, h3: { kind: 'timeline', hl: 4, events: EV },
  shotclock: { kind: 'shotclock', from: 24, title: 'Shot clock: length varies by league' },
  clock24: { kind: 'shotclock', from: 24, title: '1954: the 24-second shot clock' },
  scoreclock: { kind: 'scoreclock' },
  pace: { kind: 'speedbar', title: 'Change speeds', seq: [[0.25, 'Slow: read'], [0.95, 'Burst!'], [0.3, 'Slow again']] },
  pacePoss: { kind: 'speedbar', title: 'Fast or slow possession?', seq: [[0.9, 'Ahead early? Push'], [0.2, 'Ahead late? Slow down']] },
  paceOne: { kind: 'speedbar', title: 'One speed = easy to guard', seq: [[0.5, 'Same speed'], [0.5, 'Same speed']] },
};

const ok = (a, b) => [a, b];
export const V = {
  // ===== Shooting =====
  'shooting-mechanics': { hero: 'c:shot', s: ['c:shStance', 'c:shPocket', 'c:shDipRise', 'c:shRelease', 'c:shFollow'], m: [ok('c:shArmsOnly', 'c:shot'), ok('c:shDrift', 'c:shStraight'), ok('c:shGuidePush', 'c:shGuideOK'), ok('c:shFlat', 'c:shHighArc')] },
  'jump-shooting': { hero: 'c:shTop', s: ['c:shGatherLow', 'c:shDipRise', 'c:shTop', 'c:shStraight'], m: [ok('c:shLate', 'c:shTop'), ok('c:shLeanBack', 'c:shStraight'), ok('c:shTooHigh', 'c:shot')] },
  'three-point-shooting': { hero: 'c:shHighArc', s: ['c:shReady', 'c:shGatherLow', 'c:shHighArc', 'c:shStagger'], m: [ok('c:shFlat', 'c:shHighArc'), ok('c:shRush', 'c:shot'), ok('c:shWaiting', 'c:shReady')] },
  'midrange-shooting': { hero: 'c:pullup', s: ['c:shGatherLow', 'c:shOverFoot', 'c:shRelease', 'c:shotFake'], m: [ok('c:shFade', 'c:shStraight'), ok('s:forced', 's:selBetter')] },
  'free-throws': { hero: 'c:routine', s: ['c:routine', 'c:breathe', 'c:eyesRim', 'c:shot'], m: [ok('p:repeat|Routine changes|when nervous', 'c:routine'), ok('c:shRush', 'c:shot'), ok('c:eyesCrowd', 'c:eyesRim')] },
  'catch-and-shoot': { hero: 'c:shHop', s: ['c:shReady', 'c:shHop', 'c:shHop', 'c:shGatherLow'], m: [ok('c:shCatchStraight', 'c:shGatherLow'), ok('c:shWaiting', 'c:shReady'), ok('p:target|Feet face away from rim', 'c:shHop')] },
  'pull-up-shooting': { hero: 'c:pullup', s: ['c:bhChange', 'c:pullup', 'c:shStraight', 'c:shFollow'], m: [ok('c:shLeanBack', 'c:shStraight'), ok('c:bhOneSpeed', 'c:pullup')] },
  'step-back-shooting': { hero: 'c:stepback', s: ['c:stepback', 'c:stepback', 'c:shStraight', 'c:shot'], m: [ok('c:stepbackFar', 'c:stepback'), ok('c:shLeanBack', 'c:shStraight'), ok('p:repeat|Same move every time|defenders sit on it', 'c:shotFake')] },
  // ===== Ball handling =====
  'ball-handling-fundamentals': { hero: 'c:bhLow', s: ['c:bhStance', 'c:bhPound', 'c:bhHeadUp', 'c:bhProtect', 'c:bhChange'], m: [ok('c:bhHeadDown', 'c:bhHeadUp'), ok('c:bhHigh', 'c:bhLow'), ok('c:bhUpright', 'c:bhStance')] },
  crossover: { hero: 'c:crossLow', s: ['c:crossSell', 'c:crossLow', 'c:crossPlant', 'c:crossProtect'], m: [ok('c:crossHigh', 'c:crossLow'), ok('c:bhOneSpeed', 'c:crossSell'), ok('c:crossSlow', 'c:crossProtect')] },
  'between-the-legs': { hero: 'c:btl', s: ['c:btlStep', 'c:btl', 'c:btl'], m: [ok('c:btlHitLeg', 'c:btl'), ok('c:crossSlow', 'c:crossProtect')] },
  'behind-the-back': { hero: 'c:btbWrap', s: ['c:bhChange', 'c:btbWrap', 'c:crossProtect'], m: [ok('c:btbFar', 'c:btbWrap'), ok('p:alert|Fancy move when a simple one works', 'c:crossLow')] },
  'hesitation-moves': { hero: 'c:hesi', s: ['c:bhChange', 'c:hesi', 'c:hesi'], m: [ok('c:hesiStop', 'c:hesi'), ok('c:bhOneSpeed', 'c:hesi')] },
  'change-of-pace': { hero: 'c:bhChange', s: ['x:pace', 'c:bhChange', 'x:pace'], m: [ok('c:bhOneSpeed', 'c:bhChange'), ok('p:eye|Speeding up without a read', 'c:hesi')] },
  // ===== Finishing =====
  layups: { hero: 'c:layup', s: ['c:layupGather', 'c:layup', 'c:layup', 'c:layup'], m: [ok('p:clock|Rushed steps', 'c:layup'), ok('c:layupWrongFoot', 'c:layup'), ok('c:layupHard', 'c:layup')] },
  'reverse-layup': { hero: 'c:reverse', s: ['c:reverse', 'c:reverse', 'c:reverse'], m: [ok('c:layupHard', 'c:reverse'), ok('p:clock|Released too quickly', 'c:reverse')] },
  floaters: { hero: 'c:floater', s: ['c:floater', 'c:floater', 'c:floater'], m: [ok('c:layupHard', 'c:floater'), ok('p:alert|Floater when the layup is open', 'c:layup')] },
  'finishing-through-contact': { hero: 'c:contact', s: ['c:contact', 'c:contact', 'c:contact'], m: [ok('p:alert|Avoids contact, bad shot', 'c:contact'), ok('c:contactLow', 'c:contact')] },
  // ===== Passing / footwork =====
  'passing-techniques': { hero: 'c:pass', s: ['c:passFake', 'c:passStep', 'c:pass', 'c:pass'], m: [ok('c:passTele', 'c:passFake'), ok('c:passSoft', 'c:pass'), ok('c:passSoft', 'c:pass')] },
  'footwork-pivoting': { hero: 'c:pivot', s: ['c:triple', 'c:pivot', 'c:jab', 'c:jab'], m: [ok('c:travel', 'c:pivot'), ok('c:bhUpright', 'c:triple'), ok('p:repeat|Pivoting with no purpose', 'c:jab')] },
  'post-moves': { hero: 'c:dropStep', s: ['c:postSeal', 'c:postHigh', 'c:dropStep', 's:readHelp'], m: [ok('c:postLow', 'c:postHigh'), ok('s:noPass', 's:readHelp')] },
  // ===== IQ =====
  'court-awareness': { hero: 's:scan', s: ['s:scan', 's:readClose', 's:passCut'], m: [ok('s:ballWatch', 's:scan'), ok('s:ownOnly', 's:readHelp')] },
  spacing: { hero: 's:spaceDrive', s: ['s:spot', 's:spaceDrive', 's:spaceSwing'], m: [ok('s:cluster', 's:spot'), ok('s:oneSide', 's:spaceSwing')] },
  'reading-defenses': { hero: 's:readFar', s: ['s:readFar', 's:readHelp', 's:cvSwitch'], m: [ok('p:brain|Decided before looking', 's:scan'), ok('s:forced', 's:readHelp')] },
  'defensive-coverages': { hero: 's:cvDrop', s: ['s:cvDrop', 's:cvHedge', 's:cvSwitch', 's:cvTrap'], m: [ok('s:dropBad', 's:cvDrop'), ok('s:bigNotice', 's:cvSwitch')] },
  'shot-selection': { hero: 's:selBetter', s: ['s:selOpen', 's:selRange', 's:selBetter', 'x:shotclock'], m: [ok('s:forced', 's:selOpen'), ok('p:alert|Passing up open shots', 's:selOpen')] },
  'decision-making': { hero: 's:catchGo', s: ['s:scan', 's:catchGo', 's:reset'], m: [ok('s:holding', 's:catchGo'), ok('s:sameMove', 's:readClose')] },
  'off-ball-movement': { hero: 's:backcut', s: ['s:backcut', 's:vcut', 's:passCut'], m: [ok('s:standStill', 's:flash'), ok('s:cutIntoDrive', 's:spaceDrive')] },
  'creating-for-teammates': { hero: 's:driveGap', s: ['s:driveGap', 's:driveGap', 's:driveGap'], m: [ok('s:noPass', 's:driveGap'), ok('p:clock|Pass comes too late', 's:driveGap')] },
  'reading-screens': { hero: 's:scrCurl', s: ['s:scrSetup', 's:scrCurl', 's:scrUnder', 's:scrSwitch'], m: [ok('p:alert|Loose use of the screen', 's:scrCurl'), ok('s:scrEarly', 's:scrSetup')] },
  'pick-and-roll': { hero: 's:pnrRead', s: ['s:pnrSet', 's:pnrUse', 's:pnrRoll', 's:pnrWeak', 's:pnrRead'], m: [ok('s:pnrEarly', 's:pnrUse'), ok('s:rollEarly', 's:pnrRoll'), ok('s:pnrLane', 's:pnrWeak')] },
  'transition-offense': { hero: 's:lanes', s: ['s:pushPace', 's:lanes', 's:lanes', 's:slowDown'], m: [ok('s:forced', 's:slowDown'), ok('s:noLanes', 's:lanes')] },
  'managing-possession': { hero: 'x:scoreclock', s: ['x:scoreclock', 'x:pacePoss', 'x:shotclock'], m: [ok('p:board|Doesn\'t know the score', 'x:scoreclock'), ok('p:clock|Quick shot when ahead late', 'x:pacePoss')] },
  'late-game': { hero: 'x:scoreclock', s: ['x:scoreclock', 'x:pacePoss', 's:bestOption'], m: [ok('p:alert|Panic', 'c:breathe'), ok('p:whistle|Forgot the foul count', 'x:scoreclock')] },
  'mental-composure': { hero: 'c:breathe', s: ['c:breathe', 'p:target|One job on the next play', 'c:tall'], m: [ok('c:slump', 'c:tall'), ok('p:alert|Changing your game under pressure', 'p:repeat|Stick to what works')] },
  'pickup-fundamentals': { hero: 's:watchFirst', s: ['s:watchFirst', 's:guardBest', 's:openShare', 'c:pointCall'], m: [ok('s:hog', 's:openShare'), ok('p:shield|Not defending', 's:guardBest')] },
  'pickup-mismatches': { hero: 's:mismatch', s: ['s:mismatch', 's:mismatch', 'c:pointCall'], m: [ok('p:eye|Ignored the mismatch', 's:mismatch'), ok('p:repeat|Same play every time', 's:readHelp')] },
  'pickup-3v3-spacing': { hero: 's:c3v3', s: ['s:c3v3', 's:c3v3', 's:c3v3'], m: [ok('s:cluster', 's:c3v3'), ok('s:noCut', 's:c3v3')] },
  'pickup-communication': { hero: 'c:pointCall', s: ['p:chat>clock|Talk early', 'c:pointCall', 'p:chat|"Ball!" "Screen!" "Switch!"'], m: [ok('p:chat|Silence', 'c:pointCall'), ok('p:whistle|Arguing calls', 'p:thumbs|Move on to the next play')] },
  // ===== Defense =====
  'on-ball-defense': { hero: 'c:slide', s: ['c:defStance', 'c:handsActive', 'c:slide', 'c:contest'], m: [ok('c:defUpright', 'c:defStance'), ok('c:reach', 'c:slide'), ok('c:crossFeet', 'c:slide')] },
  'lateral-movement': { hero: 'c:slide', s: ['c:defStance', 'c:pushOff', 'c:pushOff'], m: [ok('c:hop', 'c:slide'), ok('c:crossFeet', 'c:slide')] },
  closeouts: { hero: 'c:closeout', s: ['c:closeout', 'c:closeout', 'c:closeout', 'c:slide'], m: [ok('c:closeFly', 'c:closeout'), ok('c:closeLeap', 'c:closeout')] },
  'help-and-rotations': { hero: 's:rotate', s: ['s:helpSee', 's:helpGap', 's:helpStop', 's:rotate'], m: [ok('s:ballWatchD', 's:helpSee'), ok('p:alert|Never recovers', 's:helpStop')] },
  'screen-defense': { hero: 's:scrOver', s: ['c:pointCall', 'c:defStance', 's:scrOver', 's:switchD'], m: [ok('s:caught', 's:scrOver'), ok('p:chat|No screen call', 'c:pointCall')] },
  switching: { hero: 's:switchD', s: ['c:pointCall', 's:switchD', 's:switchD'], m: [ok('s:lateSwitch', 's:switchD'), ok('s:lateSwitch', 's:switchD')] },
  'boxing-out': { hero: 'c:boxout', s: ['c:boxout', 'c:boxout', 'c:boxout', 'c:boxout'], m: [ok('c:boxWatch', 'c:boxout'), ok('p:alert|Left early to chase the ball', 'c:boxout')] },
  'transition-defense': { hero: 's:transD', s: ['c:sprintBack', 's:transD', 's:transD', 'c:pointCall'], m: [ok('c:jogBack', 'c:sprintBack'), ok('s:ballWatchD', 's:transD')] },
  'defending-pick-and-roll': { hero: 's:dPnr', s: ['s:dPnr', 's:scrOver', 's:dPnr', 's:dPnr'], m: [ok('s:lateSwitch', 's:dPnr'), ok('s:twoOnBall', 's:dPnr')] },
  'reading-offensive-players': { hero: 's:shade', s: ['s:shade', 's:readFar', 's:shade'], m: [ok('p:repeat|Never adjusts', 's:shade'), ok('c:closeLeap', 'c:closeout')] },
  // ===== Training =====
  'conditioning-basics': { hero: 'c:intervals', s: ['c:jog', 'c:intervals', 'c:run', 'c:hamstring'], m: [ok('c:jog', 'c:intervals'), ok('p:battery|Overtraining', 'p:calendar|Plan rest days')] },
  'athletic-development': { hero: 'c:jumpLand', s: ['c:squat', 'c:jumpLand', 'c:cut'], m: [ok('p:fire|Skipped warm-up', 'c:legSwing'), ok('c:landStiff', 'c:jumpLand')] },
  recovery: { hero: 'p:moon>food>water>calendar|Sleep · eat · drink · rest', s: ['p:moon|Consistent sleep', 'p:food|Protein + carbs around training', 'p:water|Hydrate all day', 'p:calendar|Rest days'], m: [ok('p:moon|Skipping sleep', 'p:moon|Consistent sleep'), ok('p:food|Not eating enough', 'p:food|Fuel around training')] },
  'injury-prevention': { hero: 'c:jumpLand', s: ['c:legSwing', 'c:squat', 'c:jumpLand', 'p:stop>doctor|Pain? Stop, get it checked'], m: [ok('p:pain|Playing through sharp pain', 'p:doctor|Stop and see a professional'), ok('p:fire|Skipped warm-up', 'c:legSwing')] },
  'warmup-routine': { hero: 'c:jog', s: ['c:jog', 'c:lunge', 'c:jumpLand', 'c:easyShot'], m: [ok('c:run', 'c:jog'), ok('c:hamstring', 'c:legSwing')] },
  // ===== Knowledge =====
  'rules-basics': { hero: 's:points', s: ['s:points', 'c:travel', 'p:ball>stop>ball|Dribble, stop, no second dribble', 'c:contact', 'x:shotclock'], m: [ok('p:book|"Every league is the same"', 'p:book|Check your league\'s rules')] },
  positions: { hero: 's:positions', s: ['s:positions', 's:positions', 's:positions', 's:positions', 's:positions'], m: [ok('p:alert|Positions limit you', 's:positions')] },
  'offensive-systems': { hero: 's:motion', s: ['s:motion', 's:fiveOut', 's:setPlay'], m: [ok('p:book|Memorized, not understood', 's:motion')] },
  'defensive-systems': { hero: 's:man', s: ['s:man', 's:zone23', 's:press'], m: [ok('s:zoneSilent', 's:zone23'), ok('p:alert|Press without rotations', 's:rotate')] },
  'history-overview': { hero: 'x:history', s: ['x:h0', 'x:h1', 'x:clock24', 'x:h3'], m: [] },
};

// Visual for each step of each drill, plus a setup diagram.
export const DV = {
  'form-shooting': { setup: 'c:shPocket', s: ['c:shPocket', 'c:shDipRise', 'c:shFollow', 'c:shot'] },
  'spot-shooting': { setup: 's:dFiveSpot', s: ['s:dFiveSpot', 's:dFiveSpot', 'p:chart|Record makes + attempts'] },
  'free-throw-routine': { setup: 'c:routine', s: ['c:routine', 'c:intervals', 'p:target|25 attempts'] },
  'catch-and-shoot-relocate': { setup: 's:dRelocate', s: ['s:dRelocate', 's:dRelocate', 'c:shHop'] },
  'pullup-series': { setup: 'c:pullup', s: ['c:bhChange', 'c:pullup', 'c:shStraight'] },
  'stepback-series': { setup: 'c:stepback', s: ['c:bhChange', 'c:stepback', 'c:shStraight'] },
  'pound-dribbles': { setup: 'c:bhPound', s: ['c:bhPound', 'c:bhHeadUp', 'p:repeat|Switch hands every 10 s'] },
  'cone-weave': { setup: 's:dCones', s: ['c:crossLow', 'c:btl', 'c:layup'] },
  'change-of-pace-cones': { setup: 's:dCones', s: ['c:bhChange', 'c:hesi', 'x:pace'] },
  'layup-series': { setup: 'c:layup', s: ['c:layup', 'c:layupGather', 'c:reverse'] },
  mikan: { setup: 's:dMikan', s: ['c:layup', 's:dMikan', 's:dMikan'] },
  'floater-series': { setup: 'c:floater', s: ['c:bhChange', 'c:floater', 'c:floater'] },
  'contact-finishing': { setup: 'c:contact', s: ['c:layup', 'c:contact', 'c:contact'] },
  'wall-passing': { setup: 'c:pass', s: ['c:pass', 'c:passStep', 'p:target|Hit the mark'] },
  'partner-passing': { setup: 's:dPartnerPass', s: ['s:dPartnerPass', 'c:pass', 'c:layup'] },
  'pivot-footwork': { setup: 'c:pivot', s: ['c:triple', 'c:pivot', 'c:pivot'] },
  'jab-series': { setup: 'c:jab', s: ['c:triple', 'c:jab', 'c:shotFake'] },
  'post-footwork': { setup: 'c:postSeal', s: ['c:postSeal', 'c:dropStep', 'c:dropStep'] },
  '3v3-live': { setup: 's:d3v3', s: ['s:d3v3', 'p:target|One focus per game', 'c:pointCall'] },
  'two-man-game': { setup: 's:d2man', s: ['s:pnrSet', 's:cvDrop', 's:pnrRead'] },
  'transition-3on2': { setup: 's:d3on2', s: ['s:d3on2', 's:d3on2', 'c:sprintBack'] },
  'defensive-slides': { setup: 's:dZigzag', s: ['c:slide', 's:dZigzag', 'c:handsActive'] },
  'closeout-drill': { setup: 's:dCloseout', s: ['s:dCloseout', 'c:closeout', 'c:contest'] },
  'shell-drill': { setup: 's:dShell', s: ['s:dShell', 's:dShell', 's:rotate'] },
  'box-out-partner': { setup: 'c:boxout', s: ['c:boxout', 'c:boxout', 'c:boxout'] },
  'line-sprints': { setup: 's:dSprints', s: ['s:dSprints', 's:dSprints', 'p:clock|Rest between sets'] },
  seventeens: { setup: 's:dSeventeens', s: ['s:dSeventeens', 'p:clock|Rest when time is up', 'p:target|Hit the target time'] },
  'lateral-bound': { setup: 'c:pushOff', s: ['c:pushOff', 'c:jumpLand', 'c:pushOff'] },
  'bodyweight-strength': { setup: 'c:squat', s: ['c:squat', 'p:shield|Planks: hold a straight line', 'c:lunge'] },
};

export const GV = {
  paint: 's:tPaint', 'three-point-line': 's:tThree', elbow: 's:tElbow', block: 's:tBlock', wing: 's:tWing', corner: 's:tCorner', 'weak-side': 's:tSides', 'strong-side': 's:tSides',
  'ball-screen': 's:pnrSet', 'pick-and-roll': 's:tPnr', 'pick-and-pop': 's:tPop', 'give-and-go': 's:tGiveGo', backdoor: 's:backcut', 'pin-down': 's:scrSetup', dho: 's:tDho',
  'triple-threat': 'c:triple', spacing: 's:spot', 'drive-and-kick': 's:spaceDrive', screen: 's:tScreen', 'fast-break': 's:lanes', assist: 's:tAssist', turnover: 's:tTurnover',
  'and-one': 'c:contact', traveling: 'c:travel', 'double-dribble': 'p:ball>stop>ball|Dribble, stop, dribble again = violation', 'man-to-man': 's:man', zone: 's:zone23', switch: 's:switchD',
  hedge: 's:cvHedge', drop: 's:cvDrop', closeout: 'c:closeout', 'help-defense': 's:helpStop', 'box-out': 'c:boxout', trap: 's:cvTrap', deny: 's:tDeny',
};

// Keyword fallbacks for practice tips and game examples (first match wins).
export const KW = [
  [/film|record|video|camera/i, 'p:camera|Film from the side'], [/track|percentage|compare|measure|time it|count/i, 'p:chart|Track and compare'],
  [/tired|fatigue|sprint|after (running|conditioning)/i, 'c:intervals'], [/partner|teammate|friend|coach/i, 'p:users|With a partner'],
  [/routine/i, 'c:routine'], [/close to the rim|add distance|start close|step back/i, 'c:easyShot'], [/corner|wing|spacing|spaced/i, 's:spot'],
  [/pull-up|pull up/i, 'c:pullup'], [/drive|attack/i, 's:spaceDrive'], [/pick-and-roll|screen/i, 's:pnrRead'], [/catch/i, 'c:shHop'],
  [/three|3pt/i, 'c:shHighArc'], [/free throw/i, 'c:routine'], [/defen|guard|closeout/i, 'c:slide'], [/layup|rim|finish/i, 'c:layup'],
  [/pass/i, 'c:pass'], [/dribbl|handle|cone/i, 'c:bhLow'], [/shoot|shot/i, 'c:shot'], [/rebound|box/i, 'c:boxout'],
  [/sleep|rest/i, 'p:moon|Rest'], [/water|hydrat/i, 'p:water|Hydrate'], [/warm/i, 'c:jog'], [/jump|land/i, 'c:jumpLand'], [/breath|calm|pressure|nerv/i, 'c:breathe'],
  [/talk|call|communicat/i, 'c:pointCall'], [/clock|time|late/i, 'x:scoreclock'], [/watch|read|notice|see/i, 's:scan'], [/game|pickup|3v3/i, 's:c3v3'],
];
export const kwVisual = text => (KW.find(([re]) => re.test(text)) || [null, 'p:ball|Practice'])[1];
