// Vectors: 12 topics, 20 variants each (240). Every topic is asked several ways (a different situation, or a different
// thing to find), and most variants draw their vectors to scale on a grid.
import { bank, combo, num, round } from '../kit/bank.js';
import { plot, comps, heading, deg } from './draw.js';

const numAns = (value, unit, tol = 0.02) => ({ kind: 'number', value: round(value, 4), unit, tol });
// a topic's question types take turns (variant k is type k % types), each walking through its own number combinations
const turn = (ctx, types, lists, ok) => combo({ ...ctx, k: Math.floor(ctx.k / types), salt: `${ctx.salt}-${ctx.k % types}` }, lists, ok);
// the right answer among wrong ones, in an order that's shuffled but the same every time for that variant
const oneOf = (d, right, wrongs) => { const list = d.shuffle([right, ...wrongs]); return { kind: 'choice', choices: list, correct: list.indexOf(right) }; };
const hyp = (a, b) => Math.sqrt(a * a + b * b);
// (no answer within 3% of a number the question gives, so copying one out of the question isn't marked right)
const apart = (answer, ...given) => given.every((x) => Math.abs(Math.abs(answer) - Math.abs(x)) > 0.03 * Math.abs(answer));
const atan = (y, x) => deg(Math.atan(y / x));
const sin = (a) => Math.sin((a * Math.PI) / 180), cos = (a) => Math.cos((a * Math.PI) / 180);
const cap = (s) => s[0].toUpperCase() + s.slice(1);
const and = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);   // a, b and c
const signed = (v, unit = '') => `${num(v)}${unit}`;   // (num writes a proper minus sign)
// numbers in working that read right when they're negative: (−7)², 4 − 1 rather than 4 + −1, 2 × (−1)
const sq = (v) => (v < 0 ? `(${num(v)})²` : `${num(v)}²`);
const paren = (v) => (v < 0 ? `(${num(v)})` : num(v));
const plus = (a, b) => `${num(a)} ${b < 0 ? '−' : '+'} ${num(Math.abs(b))}`;
const minus = (a, b) => `${num(a)} ${b < 0 ? '+' : '−'} ${num(Math.abs(b))}`;
const coef = (v) => (Math.abs(v) === 1 ? '' : num(Math.abs(v)));
const ij = (a, b, unit = '') => `(${a < 0 ? '−' : ''}${coef(a)}<b>i</b> ${b < 0 ? '−' : '+'} ${coef(b)}<b>j</b>)${unit ? ' ' + unit : ''}`;

// vectors drawn to scale: arrows on a grid where a step is as long across as up, with room for their labels
function vectors(arrows, { unit = 'm', axes = ['x', 'y'] } = {}) {
  const xs = arrows.flatMap((a) => [a.from[0], a.to[0]]), ys = arrows.flatMap((a) => [a.from[1], a.to[1]]);
  const lo = (v) => Math.min(0, ...v), hi = (v) => Math.max(0, ...v), big = Math.max(hi(xs) - lo(xs), hi(ys) - lo(ys));
  const step = [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200].find((s) => big / s <= 8) ?? 500, pad = step * 0.6;
  const range = (v) => [lo(v) < 0 ? Math.floor((lo(v) - pad) / step) * step : 0, Math.ceil((hi(v) + pad) / step) * step, step];
  return plot({ x: range(xs), y: range(ys), equal: true, xLabel: `${axes[0]} (${unit})`, yLabel: `${axes[1]} (${unit})`, arrows });
}
// one vector from the origin, with its components dashed along the axes
const withParts = (x, y, label, partLabels = []) => [
  { from: [0, 0], to: [x, 0], label: partLabels[0], dash: true, tone: 1 },
  { from: [x, 0], to: [x, y], label: partLabels[1], dash: true, tone: 1 },
  { from: [0, 0], to: [x, y], label },
];

const T = {
  kinds: 'Scalars and vectors', parts: 'Components of a vector', size: 'Magnitude from components',
  angle: 'Direction from components', square: 'Adding vectors at right angles', add: 'Adding vectors by components',
  ij: 'Vectors in i and j', change: 'Subtracting vectors: change in velocity', river: 'Crossing a river',
  wind: 'Flying in a crosswind', balance: 'The vector that balances', path: 'Distance and displacement on a path',
};

const templates = [
  // 1. scalars and vectors: a vector has a direction as well as a size
  (d, ctx) => {
    const type = ctx.k % 3;
    const VEC = ['displacement', 'velocity', 'acceleration', 'force', 'weight', 'momentum'];
    const SCA = ['distance', 'speed', 'time', 'mass', 'temperature', 'energy', 'volume', 'density'];
    const WHY = {
      displacement: 'it says how far and which way you are from the start', velocity: 'it is a speed in a direction',
      acceleration: 'it says how fast the velocity changes, and which way', force: 'it is a push or a pull in a direction',
      weight: 'it is a force, pulling down', momentum: 'it is mass times velocity, so it points the way the object moves',
    };
    if (type < 2) {
      const [i, ask] = turn(ctx, 3, [type === 0 ? [0, 1, 2, 3, 4, 5] : [0, 1, 2, 3, 4, 5, 6, 7], [0, 1]]);
      const right = type === 0 ? VEC[i] : SCA[i], wrongs = d.shuffle(type === 0 ? SCA : VEC).slice(0, 3);
      const stem = type === 0 ? ['Which of these is a vector quantity?', 'Which of these needs a direction to describe it completely?'][ask]
        : ['Which of these is a scalar quantity?', 'Which of these has a size but no direction?'][ask];
      return {
        topic: T.kinds, text: stem, answer: oneOf(d, cap(right), wrongs.map(cap)),
        solution: type === 0
          ? `A vector has a size and a direction. <b>${cap(right)}</b> is a vector, since ${WHY[right]}. ${cap(and(wrongs))} only have a size, so they are scalars.`
          : `A scalar has a size only. <b>${cap(right)}</b> is a scalar, since it never points anywhere. ${cap(and(wrongs))} are vectors, since each has a direction.`,
        meta: { type: type === 0 ? 'pick-vector' : 'pick-scalar' },
      };
    }
    const LABEL = { velocity: 'A velocity (a vector)', speed: 'A speed (a scalar)', displacement: 'A displacement (a vector)', distance: 'A distance (a scalar)', force: 'A force (a vector)', acceleration: 'An acceleration (a vector)' };
    const PAIR = { velocity: 'speed', speed: 'velocity', displacement: 'distance', distance: 'displacement', force: 'acceleration', acceleration: 'velocity' };
    const SAY = [
      ['velocity', (n) => `The wind blows at ${n} km/h from the west.`, 'It gives a size and a direction (from the west)', [20, 25, 30, 40]],
      ['speed', (n) => `A car’s speedometer reads ${n} km/h.`, 'A speedometer only tells you how fast, not which way', [40, 50, 60, 80]],
      ['displacement', (n) => `A runner finishes ${n} m east of the starting line.`, 'It says how far and which way from the start', [50, 100, 200, 400]],
      ['distance', (n) => `A hiking app says someone has walked ${n} km today.`, 'It counts every step without any direction', [5, 8, 12, 15]],
      ['force', (n) => `A sled is pulled with ${n} N toward the north.`, 'It is a pull with a size and a direction', [40, 60, 80, 120]],
      ['acceleration', (n) => `A sprinter’s speed goes up by ${n} m/s every second, along the track toward the finish.`, 'It is how fast the velocity changes, with a direction', [2, 3, 4, 5]],
    ];
    const [which, i] = turn(ctx, 3, [[0, 1, 2, 3, 4, 5], [0, 1, 2, 3]]);
    const [kind, say, why, ns] = SAY[which], right = LABEL[kind];
    const others = d.shuffle(Object.keys(LABEL).filter((k) => k !== kind && k !== PAIR[kind])).slice(0, 2);
    return {
      topic: T.kinds, text: `${say(ns[i])} What kind of quantity is this?`,
      answer: oneOf(d, right, [LABEL[PAIR[kind]], ...others.map((k) => LABEL[k])]),
      solution: `${why}, so it is <b>${right[0].toLowerCase() + right.slice(1)}</b>.`,
      meta: { type: 'classify' },
    };
  },

  // 2. components: the part along each axis, with the angle's side in mind (cos beside it, sin across from it)
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type === 0) {
      const [F, a] = turn(ctx, 4, [[20, 40, 50, 60, 80, 100, 120, 150], [20, 30, 35, 40, 50, 60, 70]]);
      const [x, y] = comps(F, a);
      return {
        topic: T.parts, text: `A rope pulls a crate with a force of ${F} N at ${a}° above the horizontal. What is the horizontal component of the force?`,
        figure: vectors(withParts(x, y, `${F} N`, ['?', '']), { unit: 'N' }),
        answer: numAns(x, 'N'),
        solution: `The angle is measured from the horizontal, so the horizontal part is the side next to it: F<sub>x</sub> = F cos θ = ${F} × cos ${a}° = <b>${num(x)} N</b>.`,
        meta: { type: 'force-x', in: { F, a } },
      };
    }
    if (type === 1) {
      const [v, a] = turn(ctx, 4, [[10, 12, 15, 18, 20, 24, 25, 30], [15, 25, 30, 35, 40, 45, 55, 60]]);
      const [x, y] = comps(v, a);
      return {
        topic: T.parts, text: `A ball is kicked at ${v} m/s, ${a}° above the ground. What is the vertical component of its velocity?`,
        figure: vectors(withParts(x, y, `${v} m/s`, ['', '?']), { unit: 'm/s', axes: ['horizontal', 'vertical'] }),
        answer: numAns(y, 'm/s'),
        solution: `The vertical part is the side across from the ${a}° angle: v<sub>y</sub> = v sin θ = ${v} × sin ${a}° = <b>${num(y)} m/s</b>.`,
        meta: { type: 'vel-y', in: { v, a } },
      };
    }
    if (type === 2) {
      const [Tn, a] = turn(ctx, 4, [[30, 40, 50, 60, 80, 100, 120], [10, 15, 20, 25, 30, 35, 40]]);
      const x = Tn * sin(a), y = Tn * cos(a);
      return {
        topic: T.parts, text: `A lamp is pulled sideways by a cable at ${a}° from the vertical, with a tension of ${Tn} N. What is the horizontal component of the tension?`,
        figure: vectors(withParts(x, y, `${Tn} N`, ['?', '']), { unit: 'N' }),
        answer: numAns(x, 'N'),
        solution: `Here the angle is measured from the vertical, so the horizontal part is the side across from it: T<sub>x</sub> = T sin θ = ${Tn} × sin ${a}° = <b>${num(x)} N</b>. (T cos θ = ${num(y)} N is the vertical part.)`,
        meta: { type: 'from-vertical', in: { T: Tn, a } },
      };
    }
    const [dist, a, north] = turn(ctx, 4, [[2, 3, 4, 5, 6, 8, 10, 12], [20, 30, 35, 40, 50, 60, 70], [false, true]]);
    const east = dist * sin(a), up = dist * cos(a);
    return {
      topic: T.parts, text: `A hiker walks ${dist} km on a bearing ${a}° east of north. How far ${north ? 'north' : 'east'} of the start are they?`,
      figure: vectors(withParts(east, up, `${dist} km`, north ? ['', '?'] : ['?', '']), { unit: 'km', axes: ['east', 'north'] }),
      answer: numAns(north ? up : east, 'km'),
      solution: north
        ? `"${a}° east of north" is measured from north, so the northward part is the side next to the angle: ${dist} × cos ${a}° = <b>${num(up)} km</b>.`
        : `"${a}° east of north" is measured from north, so the eastward part is the side across from the angle: ${dist} × sin ${a}° = <b>${num(east)} km</b>.`,
      meta: { type: north ? 'bearing-north' : 'bearing-east', in: { dist, a } },
    };
  },

  // 3. the size of a vector from its components: Pythagoras
  (d, ctx) => {
    const type = ctx.k % 3;
    const PAIRS = [[3, 4], [5, 12], [6, 8], [8, 15], [7, 24], [2, 5], [4, 7], [9, 12], [1.5, 2], [10, 24]];
    const [[a, b], s] = turn(ctx, 3, [PAIRS, [[1, 1], [-1, 1], [1, -1], [-1, -1]]]);
    const x = a * s[0], y = b * s[1], m = hyp(x, y);
    if (type === 0) {
      return {
        topic: T.size, text: `A velocity has components v<sub>x</sub> = ${signed(x, ' m/s')} and v<sub>y</sub> = ${signed(y, ' m/s')}. What is its magnitude (the speed)?`,
        figure: vectors(withParts(x, y, 'v'), { unit: 'm/s' }),
        answer: numAns(m, 'm/s'),
        solution: `The components are at right angles, so the size is the hypotenuse: |v| = √(${sq(x)} + ${sq(y)}) = √${num(x * x + y * y)} = <b>${num(m)} m/s</b>. The signs only say which way each part points, and squared they’re positive anyway.`,
        meta: { type: 'velocity-size', in: { x, y } },
      };
    }
    if (type === 1) {
      return {
        topic: T.size, text: `You walk ${num(a)} km ${s[0] > 0 ? 'east' : 'west'} and then ${num(b)} km ${s[1] > 0 ? 'north' : 'south'}. How far are you from where you started, in a straight line?`,
        figure: vectors([{ from: [0, 0], to: [x, 0], label: `${num(a)} km` }, { from: [x, 0], to: [x, y], label: `${num(b)} km`, tone: 1 }, { from: [0, 0], to: [x, y], label: '?', tone: 2, dash: false }], { unit: 'km', axes: ['east', 'north'] }),
        answer: numAns(m, 'km'),
        solution: `The two legs are at right angles, so the straight line back is the hypotenuse: √(${num(a)}² + ${num(b)}²) = <b>${num(m)} km</b>.`,
        meta: { type: 'walk-size', in: { x, y } },
      };
    }
    return {
      topic: T.size, text: `A force is F = ${ij(x, y, 'N')}. What is the size of F?`,
      figure: vectors(withParts(x, y, 'F'), { unit: 'N' }),
      answer: numAns(m, 'N'),
      solution: `|F| = √(${sq(x)} + ${sq(y)}) = √${num(x * x + y * y)} = <b>${num(m)} N</b>.`,
      meta: { type: 'ij-size', in: { x, y } },
    };
  },

  // 4. direction from components: tan⁻¹ of across over beside, then which quadrant it's in
  (d, ctx) => {
    const type = ctx.k % 5;
    const [a, b] = turn(ctx, 5, [[2, 3, 4, 5, 6, 8, 10, 12], [2, 3, 4, 5, 6, 7, 9]], (p, q) => p !== q);
    if (type === 0) {
      const t = atan(b, a);
      return {
        topic: T.angle, text: `A displacement has components x = ${a} m and y = ${b} m. What angle does it make above the +x axis?`,
        figure: vectors(withParts(a, b, '?'), { unit: 'm' }),
        answer: numAns(t, '°'),
        solution: `tan θ = across ÷ beside = y ÷ x = ${b} ÷ ${a}, so θ = tan⁻¹(${b}/${a}) = <b>${num(t)}°</b>.`,
        meta: { type: 'first-quadrant', in: { x: a, y: b } },
      };
    }
    if (type === 1) {
      const t = 180 - atan(b, a);
      return {
        topic: T.angle, text: `A vector has components x = −${a} and y = ${b}. What is its direction, measured counterclockwise from the +x axis?`,
        figure: vectors(withParts(-a, b, '?'), { unit: 'units' }),
        answer: numAns(t, '°'),
        solution: `It points up and to the left (second quadrant). Its angle above the −x axis is tan⁻¹(${b}/${a}) = ${num(atan(b, a))}°, so from +x it is 180° − ${num(atan(b, a))}° = <b>${num(t)}°</b>.`,
        meta: { type: 'second-quadrant', in: { x: -a, y: b } },
      };
    }
    if (type === 2 || type === 3) {
      const fromEast = type === 2, t = fromEast ? atan(b, a) : atan(a, b);
      return {
        topic: T.angle, text: `A drone flies ${a} km east and ${b} km north. In what direction is it from where it started, as an angle ${fromEast ? 'north of east' : 'east of north'}?`,
        figure: vectors(withParts(a, b, '?'), { unit: 'km', axes: ['east', 'north'] }),
        answer: numAns(t, '°'),
        solution: fromEast
          ? `“North of east” is measured from east, so tan θ = north ÷ east = ${b} ÷ ${a}. Then θ = tan⁻¹(${b}/${a}) = <b>${num(t)}°</b> north of east.`
          : `“East of north” is measured from north, so tan θ = east ÷ north = ${a} ÷ ${b}. Then θ = tan⁻¹(${a}/${b}) = <b>${num(t)}°</b> east of north.`,
        meta: { type: fromEast ? 'north-of-east' : 'east-of-north', in: { x: a, y: b } },
      };
    }
    const t = atan(b, a);
    return {
      topic: T.angle, text: `A falling ball moves ${a} m/s horizontally and ${b} m/s downward. At what angle below the horizontal is it moving?`,
      figure: vectors(withParts(a, -b, '?'), { unit: 'm/s', axes: ['horizontal', 'vertical'] }),
      answer: numAns(t, '°'),
      solution: `tan θ = down ÷ across = ${b} ÷ ${a}, so θ = tan⁻¹(${b}/${a}) = <b>${num(t)}°</b> below the horizontal.`,
      meta: { type: 'below-horizontal', in: { x: a, y: b } },
    };
  },

  // 5. two vectors at right angles: the resultant is the hypotenuse
  (d, ctx) => {
    const type = ctx.k % 4;
    // (a resultant clearly bigger than the bigger of the two, so leaving the smaller one out isn't marked right)
    const [p, q] = turn(ctx, 4, type === 2 ? [[150, 180, 200, 240, 300, 360], [50, 60, 80, 90, 100, 120]] : [[30, 40, 50, 60, 80, 90, 120], [20, 25, 40, 45, 50, 70, 100]],
      (a, b) => a !== b && (type === 1 || type === 3 || hyp(a, b) > 1.05 * Math.max(a, b)));
    if (type === 0 || type === 1) {
      const R = hyp(p, q), t = atan(q, p);
      return {
        topic: T.square, text: `Two people pull a cart: one with ${p} N due east, the other with ${q} N due north. ${type === 0 ? 'What is the size of the resultant force?' : 'What angle north of east does the resultant force point?'}`,
        figure: vectors([{ from: [0, 0], to: [p, 0], label: `${p} N` }, { from: [p, 0], to: [p, q], label: `${q} N`, tone: 1 }, { from: [0, 0], to: [p, q], label: 'R', tone: 2 }], { unit: 'N', axes: ['east', 'north'] }),
        answer: numAns(type === 0 ? R : t, type === 0 ? 'N' : '°'),
        solution: type === 0
          ? `Put them tip to tail and they make a right angle, so R = √(${p}² + ${q}²) = <b>${num(R)} N</b>.`
          : `tan θ = north ÷ east = ${q} ÷ ${p}, so θ = tan⁻¹(${q}/${p}) = <b>${num(t)}°</b> north of east.`,
        meta: { type: type === 0 ? 'pull-size' : 'pull-angle', in: { p, q } },
      };
    }
    if (type === 2) {
      const va = p, vw = q, g = hyp(va, vw);
      return {
        topic: T.square, text: `A plane points due north and flies at ${va} km/h through the air, while a wind blows it due east at ${vw} km/h. What is its speed over the ground?`,
        figure: vectors([{ from: [0, 0], to: [0, va], label: `${va} km/h` }, { from: [0, va], to: [vw, va], label: `${vw}`, tone: 1 }, { from: [0, 0], to: [vw, va], label: '?', tone: 2 }], { unit: 'km/h', axes: ['east', 'north'] }),
        answer: numAns(g, 'km/h'),
        solution: `The plane’s own velocity and the wind are at right angles: ground speed = √(${va}² + ${vw}²) = <b>${num(g)} km/h</b>.`,
        meta: { type: 'plane-ground-speed', in: { p: va, q: vw } },
      };
    }
    const big = Math.max(p, q) + Math.min(p, q), A = Math.min(p, q), R = hyp(big, A), B = Math.sqrt(R * R - A * A);
    return {
      topic: T.square, text: `Vector A points east with size ${A}, and vector B points north. Their sum has size ${num(R)}. What is the size of B?`,
      figure: vectors([{ from: [0, 0], to: [A, 0], label: 'A' }, { from: [A, 0], to: [A, B], label: 'B = ?', tone: 1 }, { from: [0, 0], to: [A, B], label: num(R), tone: 2 }], { unit: 'units', axes: ['east', 'north'] }),
      answer: numAns(B, ''),
      solution: `A and B are at right angles, so R² = A² + B²: B = √(${num(R)}² − ${A}²) = <b>${num(B)}</b>.`,
      meta: { type: 'missing-side', in: { R, A } },
    };
  },

  // 6. adding vectors at any angle: add the x parts, add the y parts, then put them back together
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type === 0) {
      const [d1, d2, a] = turn(ctx, 4, [[3, 4, 5, 6, 8], [2, 3, 4, 5], [30, 45, 60, 120]]);
      const rx = d1 + d2 * cos(a), ry = d2 * sin(a), R = hyp(rx, ry);
      return {
        topic: T.add, text: `A boat sails ${d1} km due east, then ${d2} km at ${a > 90 ? `${180 - a}° north of west` : `${a}° north of east`}. How far is it from where it started?`,
        figure: vectors([{ from: [0, 0], to: [d1, 0], label: `${d1} km` }, { from: [d1, 0], to: [rx, ry], label: `${d2} km`, tone: 1 }, { from: [0, 0], to: [rx, ry], label: '?', tone: 2 }], { unit: 'km', axes: ['east', 'north'] }),
        answer: numAns(R, 'km'),
        solution: `${a > 90 ? `${180 - a}° north of west is ${a}° around from east, so the` : 'The'} second leg’s east part is ${d2} cos ${a}° = ${num(d2 * cos(a))} km and its north part ${d2} sin ${a}° = ${num(ry)} km. Altogether: ${plus(d1, d2 * cos(a))} = ${num(rx)} km east and ${num(ry)} km north, so the distance is √(${sq(rx)} + ${sq(ry)}) = <b>${num(R)} km</b>.`,
        meta: { type: 'two-legs', in: { d1, d2, a } },
      };
    }
    const [F1, a1, F2, a2] = turn(ctx, 4, [[20, 30, 40, 50], [0, 20, 30], [20, 30, 40, 60], [60, 90, 120, 150]]);
    const [x1, y1] = comps(F1, a1), [x2, y2] = comps(F2, a2), rx = x1 + x2, ry = y1 + y2, R = hyp(rx, ry), t = heading(rx, ry);
    const ask = ['What is the x-component of the resultant?', 'What is the size of the resultant?', 'What is the direction of the resultant, counterclockwise from the +x axis?'][type - 1];
    return {
      topic: T.add, text: `Two forces act on a ring: ${F1} N at ${a1}° and ${F2} N at ${a2}° (both measured counterclockwise from the +x axis). ${ask}`,
      figure: vectors([{ from: [0, 0], to: [x1, y1], label: `${F1} N` }, { from: [x1, y1], to: [rx, ry], label: `${F2} N`, tone: 1 }, { from: [0, 0], to: [rx, ry], label: 'R', tone: 2 }], { unit: 'N' }),
      answer: type === 1 ? numAns(rx, 'N') : type === 2 ? numAns(R, 'N') : numAns(t, '°'),
      solution: type === 1 ? `R<sub>x</sub> is the sum of the x parts: ${F1} cos ${a1}° + ${F2} cos ${a2}° = ${plus(x1, x2)} = <b>${num(rx)} N</b>.`
        : `The x parts add to ${F1} cos ${a1}° + ${F2} cos ${a2}° = ${plus(x1, x2)} = ${num(rx)} N. The y parts add to ${F1} sin ${a1}° + ${F2} sin ${a2}° = ${plus(y1, y2)} = ${num(ry)} N. `
          + (type === 2 ? `Size = √(${sq(rx)} + ${sq(ry)}) = <b>${num(R)} N</b>.`
            : Math.abs(rx) < 1e-9 ? `R<sub>x</sub> is 0 and R<sub>y</sub> is positive, so it points straight up the +y axis: <b>${num(t)}°</b>.`
              : rx > 0 ? `So the direction is tan⁻¹(${num(ry)}/${num(rx)}) = <b>${num(t)}°</b>.`
                : `Then tan⁻¹(${num(ry)}/${num(rx)}) gives ${num(deg(Math.atan(ry / rx)))}°, but R<sub>x</sub> is negative, so it points left: add 180°. So the direction is ${num(deg(Math.atan(ry / rx)))}° + 180° = <b>${num(t)}°</b>.`),
      meta: { type: ['', 'forces-x', 'forces-size', 'forces-angle'][type], in: { F1, a1, F2, a2 } },
    };
  },

  // 7. vectors in i and j: add and scale each part on its own
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type === 0) {
      const [[a, b, c, e], [p, q], part] = turn(ctx, 4, [[[2, 3, 4, -1], [3, -2, 1, 5], [-4, 1, 2, 3], [5, 2, -3, 4], [1, -5, 6, 2]], [[2, 1], [1, 3], [2, -1], [3, -2], [1, -1]], ['i', 'j']]);
      const value = part === 'i' ? p * a + q * c : p * b + q * e;
      const sum = `${p === 1 ? '' : p}A ${q < 0 ? '−' : '+'} ${Math.abs(q) === 1 ? '' : Math.abs(q)}B`;
      return {
        topic: T.ij, text: `A = ${ij(a, b)} and B = ${ij(c, e)}. What is the <b>${part}</b>-component of ${sum}?`,
        answer: numAns(value, ''),
        solution: `Work on the ${part} parts only, so ${p === 1 ? '' : `${p} × `}${paren(part === 'i' ? a : b)} ${q < 0 ? '−' : '+'} ${Math.abs(q) === 1 ? '' : `${Math.abs(q)} × `}${paren(part === 'i' ? c : e)} = <b>${num(value)}</b>.`,
        meta: { type: 'combine', in: { a, b, c, e, p, q, part } },
      };
    }
    if (type === 1) {
      const [[a, b], [c, e]] = turn(ctx, 4, [[[2, 3], [4, -1], [-3, 5], [6, 2], [1, 4]], [[1, 1], [2, 1], [-1, 3], [4, -3], [3, 0]]]);
      const sx = a + c, sy = b + e, m = hyp(sx, sy);
      return {
        topic: T.ij, text: `A = ${ij(a, b, 'm')} and B = ${ij(c, e, 'm')}. What is the size of A + B?`,
        figure: vectors([{ from: [0, 0], to: [a, b], label: 'A' }, { from: [a, b], to: [sx, sy], label: 'B', tone: 1 }, { from: [0, 0], to: [sx, sy], label: 'A + B', tone: 2 }], { unit: 'm' }),
        answer: numAns(m, 'm'),
        solution: `A + B = (${plus(a, c)})<b>i</b> + (${plus(b, e)})<b>j</b> = ${ij(sx, sy)}. Its size is √(${sq(sx)} + ${sq(sy)}) = <b>${num(m)} m</b>.`,
        meta: { type: 'sum-size', in: { a, b, c, e } },
      };
    }
    if (type === 2) {
      const [v, a, part] = turn(ctx, 4, [[10, 12, 20, 25, 30], [30, 40, 53, 60, 70], ['i', 'j']]);
      const [x, y] = comps(v, a);
      return {
        topic: T.ij, text: `A velocity of ${v} m/s at ${a}° above the +x axis is written as (p<b>i</b> + q<b>j</b>) m/s. What is ${part === 'i' ? 'p' : 'q'}?`,
        figure: vectors(withParts(x, y, `${v} m/s`, part === 'i' ? ['p = ?', 'q'] : ['p', 'q = ?']), { unit: 'm/s' }),
        answer: numAns(part === 'i' ? x : y, 'm/s'),
        solution: part === 'i' ? `p is the x part, so p = ${v} cos ${a}° = <b>${num(x)} m/s</b>.` : `q is the y part, so q = ${v} sin ${a}° = <b>${num(y)} m/s</b>.`,
        tip: 'With the angle measured from the +x axis, the i part is v cos θ and the j part is v sin θ.',
        meta: { type: part === 'i' ? 'polar-i' : 'polar-j', in: { v, a } },
      };
    }
    const [[a, b]] = turn(ctx, 4, [[[3, 4], [6, 8], [5, 12], [-8, 15], [2, -3], [1, 2], [-4, -3]]]);
    const m = hyp(a, b);
    return {
      topic: T.ij, text: `What is the <b>i</b>-component of the unit vector pointing the same way as ${ij(a, b)}?`,
      answer: numAns(a / m, ''),
      solution: `A unit vector has size 1, so divide by the size, √(${sq(a)} + ${sq(b)}) = ${num(m)}. Its <b>i</b>-component is ${num(a)} ÷ ${num(m)} = <b>${num(a / m)}</b>.`,
      tip: 'A unit vector is the vector divided by its own size, so find the size first.',
      meta: { type: 'unit-i', in: { a, b } },
    };
  },

  // 8. subtracting vectors: the change in velocity is the new one minus the old one
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type === 0 || type === 3) {
      const [v1, v2, ms] = turn(ctx, 4, [[4, 5, 6, 8, 10, 12], [2, 3, 4, 5, 6], [20, 25, 40, 50]], (a, b) => b <= a);
      const dv = v1 + v2, acc = dv / (ms / 1000);
      return {
        topic: T.change, text: `A ball hits a wall at ${v1} m/s and bounces straight back at ${v2} m/s${type === 3 ? `, touching the wall for ${ms} ms` : ''}. ${type === 0 ? 'What is the size of its change in velocity?' : 'What is the size of its average acceleration while it touches the wall?'}`,
        answer: type === 0 ? numAns(dv, 'm/s') : numAns(acc, 'm/s²'),
        solution: `Take toward the wall as positive, so the velocity is +${v1} m/s before and −${v2} m/s after. Then Δv = −${v2} − ${v1} = −${dv} m/s, a size of ${type === 0 ? `<b>${dv} m/s</b>` : `${dv} m/s`} (not ${v1} − ${v2}, because the direction flipped).`
          + (type === 0 ? '' : ` It touches the wall for ${ms} ms = ${num(ms / 1000, 3)} s, so the average acceleration = Δv ÷ Δt = ${dv} m/s ÷ ${num(ms / 1000, 3)} s = <b>${num(acc)} m/s²</b>.`),
        meta: { type: type === 0 ? 'bounce' : 'bounce-acceleration', in: { v1, v2, ms } },
      };
    }
    if (type === 1) {
      const [v1, v2] = turn(ctx, 4, [[6, 8, 10, 12, 15, 20], [6, 8, 10, 12, 15, 20]]);
      const dv = hyp(v1, v2);
      return {
        topic: T.change, text: `A car drives east at ${v1} m/s, then turns a corner and drives north at ${v2} m/s. What is the size of its change in velocity?`,
        figure: vectors([{ from: [0, 0], to: [0, v2], label: 'after', tone: 1 }, { from: [0, v2], to: [-v1, v2], label: '−before', tone: 0 }, { from: [0, 0], to: [-v1, v2], label: 'Δv', tone: 2 }], { unit: 'm/s', axes: ['east', 'north'] }),
        answer: numAns(dv, 'm/s'),
        solution: `Δv = after − before = (${v2} m/s north) + (${v1} m/s west). Those are at right angles, so |Δv| = √(${v1}² + ${v2}²) = <b>${num(dv)} m/s</b>, even though the speed ${v1 === v2 ? "didn’t change" : 'changed by only ' + Math.abs(v2 - v1) + ' m/s'}.`,
        meta: { type: 'corner', in: { v1, v2 } },
      };
    }
    const [[a, b], [c, e]] = turn(ctx, 4, [[[5, 2], [4, 6], [3, -1], [7, 3], [-2, 5]], [[1, 4], [-2, 2], [3, 3], [6, -2], [-4, -1]]]);
    const x = a - c, y = b - e, m = hyp(x, y);
    return {
      topic: T.change, text: `A = ${ij(a, b)} and B = ${ij(c, e)}. What is the size of A − B?`,
      figure: vectors([{ from: [0, 0], to: [a, b], label: 'A' }, { from: [0, 0], to: [c, e], label: 'B', tone: 1 }, { from: [c, e], to: [a, b], label: 'A − B', tone: 2 }], { unit: 'units' }),
      answer: numAns(m, ''),
      solution: `A − B = (${minus(a, c)})<b>i</b> + (${minus(b, e)})<b>j</b> = ${ij(x, y)}. Size: √(${sq(x)} + ${sq(y)}) = <b>${num(m)}</b>.`,
      tip: 'Subtract part by part, the i parts and then the j parts, then use Pythagoras for the size.',
      meta: { type: 'difference-size', in: { a, b, c, e } },
    };
  },

  // 9. crossing a river: the boat's own velocity plus the current's
  (d, ctx) => {
    const type = ctx.k % 5;
    const [vb, vc, w] = turn(ctx, 5, [[2, 2.5, 3, 4, 5, 6], [0.5, 1, 1.5, 2, 2.5, 3], [30, 40, 50, 60, 80, 100, 120]], (b, c) => c < b && (type !== 0 || hyp(b, c) > 1.05 * b));
    const boat = `A boat that moves at ${vb} m/s through still water crosses a river ${w} m wide, where the current flows at ${vc} m/s.`;
    const across = [{ from: [0, 0], to: [0, vb], label: `${vb} m/s` }, { from: [0, vb], to: [vc, vb], label: `${vc}`, tone: 1 }, { from: [0, 0], to: [vc, vb], label: '?', tone: 2 }];
    if (type === 0) {
      const v = hyp(vb, vc);
      return { topic: T.river, text: `${boat} It points straight across. How fast does it move relative to the riverbank?`, figure: vectors(across, { unit: 'm/s', axes: ['downstream', 'across'] }), answer: numAns(v, 'm/s'), solution: `Its own velocity (across) and the current (downstream) are at right angles: √(${vb}² + ${vc}²) = <b>${num(v)} m/s</b>.`, meta: { type: 'boat-speed', in: { vb, vc, w } } };
    }
    if (type === 1) {
      const t = w / vb;
      return { topic: T.river, text: `${boat} It points straight across. How long does it take to cross?`, figure: vectors(across, { unit: 'm/s', axes: ['downstream', 'across'] }), answer: numAns(t, 's'), solution: `Only the part of the velocity across the river gets it to the other side, and the current doesn’t change that, so t = ${w} ÷ ${vb} = <b>${num(t)} s</b>.`, meta: { type: 'cross-time', in: { vb, vc, w } } };
    }
    if (type === 2) {
      const x = (vc * w) / vb;
      return { topic: T.river, text: `${boat} It points straight across. How far downstream does it land?`, figure: vectors(across, { unit: 'm/s', axes: ['downstream', 'across'] }), answer: numAns(x, 'm'), solution: `It takes ${w} ÷ ${vb} = ${num(w / vb)} s to cross, and all that time the current carries it downstream at ${vc} m/s, so it lands ${vc} × ${num(w / vb)} = <b>${num(x)} m</b>.`, meta: { type: 'drift', in: { vb, vc, w } } };
    }
    const a = deg(Math.asin(vc / vb)), straight = Math.sqrt(vb * vb - vc * vc);
    const upstream = [{ from: [0, 0], to: [-vc, straight], label: `${vb} m/s` }, { from: [-vc, straight], to: [0, straight], label: `${vc}`, tone: 1 }, { from: [0, 0], to: [0, straight], label: 'straight across', tone: 2 }];
    if (type === 3) {
      return { topic: T.river, text: `${boat} At what angle upstream from straight across must it point to land directly opposite where it started?`, figure: vectors(upstream, { unit: 'm/s', axes: ['downstream', 'across'] }), answer: numAns(a, '°'), solution: `Its upstream part must cancel the current: ${vb} sin θ = ${vc}, so θ = sin⁻¹(${vc}/${vb}) = <b>${num(a)}°</b>.`, tip: 'To land straight across, the upstream part of the boat’s velocity has to cancel the current.', meta: { type: 'heading', in: { vb, vc, w } } };
    }
    return { topic: T.river, text: `${boat} It points upstream just enough to land directly opposite. How long does the crossing take?`, figure: vectors(upstream, { unit: 'm/s', axes: ['downstream', 'across'] }), answer: numAns(w / straight, 's'), solution: `Some of its speed goes into fighting the current, leaving √(${vb}² − ${vc}²) = ${num(straight, 3)} m/s across. So t = ${w} ÷ ${num(straight, 3)} = <b>${num(w / straight)} s</b>.`, tip: 'Pointing upstream, only part of its speed is left for crossing: find that part first, then time = width ÷ speed across.', meta: { type: 'straight-time', in: { vb, vc, w } } };
  },

  // 10. flying in a wind: the plane's air velocity plus the wind's
  (d, ctx) => {
    const type = ctx.k % 4;
    // (only the headwind question has a distance to fly, so only it walks through distances too)
    const [va, vw, D] = turn(ctx, 4, [[150, 180, 200, 240, 250, 300], [20, 30, 40, 50, 60, 80], type === 3 ? [300, 360, 450, 600] : [0]], (a, w) => type !== 0 || hyp(a, w) > 1.05 * a);
    const flight = `A plane flies at ${va} km/h through the air, and the wind blows toward the east at ${vw} km/h.`;
    if (type === 0 || type === 1) {
      const g = hyp(va, vw), a = atan(vw, va);
      return {
        topic: T.wind, text: `${flight} The plane points due north. ${type === 0 ? 'What is its speed over the ground?' : 'In what direction does it actually travel, as an angle east of north?'}`,
        figure: vectors([{ from: [0, 0], to: [0, va], label: `${va}` }, { from: [0, va], to: [vw, va], label: `${vw}`, tone: 1 }, { from: [0, 0], to: [vw, va], label: '?', tone: 2 }], { unit: 'km/h', axes: ['east', 'north'] }),
        answer: type === 0 ? numAns(g, 'km/h') : numAns(a, '°'),
        solution: type === 0 ? `North ${va} and east ${vw} are at right angles: √(${va}² + ${vw}²) = <b>${num(g)} km/h</b>.` : `tan θ = east ÷ north = ${vw} ÷ ${va}, so θ = <b>${num(a)}°</b> east of north.`,
        meta: { type: type === 0 ? 'ground-speed' : 'drift-angle', in: { va, vw } },
      };
    }
    if (type === 2) {
      const a = deg(Math.asin(vw / va)), north = Math.sqrt(va * va - vw * vw);
      return {
        topic: T.wind, text: `${flight} The pilot wants to travel due north. At what angle west of north must the plane point?`,
        figure: vectors([{ from: [0, 0], to: [-vw, north], label: `${va}` }, { from: [-vw, north], to: [0, north], label: `${vw}`, tone: 1 }, { from: [0, 0], to: [0, north], label: 'due north', tone: 2 }], { unit: 'km/h', axes: ['east', 'north'] }),
        answer: numAns(a, '°'),
        solution: `The plane’s westward part must cancel the wind: ${va} sin θ = ${vw}, so θ = sin⁻¹(${vw}/${va}) = <b>${num(a)}°</b> west of north.`,
        meta: { type: 'crab-angle', in: { va, vw } },
      };
    }
    const t = D / (va - vw);
    return {
      topic: T.wind, text: `A plane flies at ${va} km/h through the air, due east into a headwind of ${vw} km/h blowing toward the west. How long does it take to fly ${D} km?`,
      answer: numAns(t, 'h'),
      solution: `Along one line the velocities just add with signs, so the speed over the ground is ${va} − ${vw} = ${va - vw} km/h. Then t = ${D} ÷ ${va - vw} = <b>${num(t)} h</b>.`,
      meta: { type: 'headwind', in: { va, vw, D } },
    };
  },

  // 11. the vector that balances: the same size as the resultant, pointing the opposite way
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type < 2) {
      const [F1, F2] = turn(ctx, 4, [[20, 30, 40, 50, 60, 80], [15, 25, 35, 45, 60, 75]], (a, b) => a !== b);
      const R = hyp(F1, F2), a = atan(F2, F1);
      return {
        topic: T.balance, text: `A knot is pulled by ${F1} N toward the east and ${F2} N toward the north. A third force keeps it still. ${type === 0 ? 'What is the size of the third force?' : 'In what direction does the third force point, as an angle south of west?'}`,
        figure: vectors([{ from: [0, 0], to: [F1, 0], label: `${F1} N` }, { from: [0, 0], to: [0, F2], label: `${F2} N`, tone: 1 }, { from: [0, 0], to: [-F1, -F2], label: '?', tone: 2 }], { unit: 'N', axes: ['east', 'north'] }),
        answer: type === 0 ? numAns(R, 'N') : numAns(a, '°'),
        solution: type === 0
          ? `The first two add to √(${F1}² + ${F2}²) = ${num(R)} N pointing north of east. To balance them, the third force has the same size the other way: <b>${num(R)} N</b>.`
          : `The first two add to a force ${num(a)}° north of east (tan⁻¹(${F2}/${F1})). The balancing force points the opposite way, <b>${num(a)}°</b> south of west.`,
        meta: { type: type === 0 ? 'balance-size' : 'balance-angle', in: { F1, F2 } },
      };
    }
    if (type === 2) {
      const [[a, b], [c, e], part] = turn(ctx, 4, [[[3, 4], [5, -2], [-6, 1], [2, 7]], [[1, -6], [-4, 3], [2, 2], [-5, -4]], ['i', 'j']]);
      const v = part === 'i' ? -(a + c) : -(b + e);
      return {
        topic: T.balance, text: `Two forces F<sub>1</sub> = ${ij(a, b, 'N')} and F<sub>2</sub> = ${ij(c, e, 'N')} act on a ring, and a third force F<sub>3</sub> keeps it still. What is the <b>${part}</b>-component of F<sub>3</sub>?`,
        answer: numAns(v, 'N'),
        solution: `Still means all three add to zero, so F<sub>3</sub> = −(F<sub>1</sub> + F<sub>2</sub>). Its ${part}-component is −(${plus(part === 'i' ? a : b, part === 'i' ? c : e)}) = <b>${num(v)} N</b>.`,
        meta: { type: 'balance-part', in: { a, b, c, e, part } },
      };
    }
    const [F1, F2, a] = turn(ctx, 4, [[20, 30, 40, 50], [20, 30, 40, 60], [45, 60, 120, 135]], (A, B, C) => apart(hyp(A + B * cos(C), B * sin(C)), A, B, C));
    const rx = F1 + F2 * cos(a), ry = F2 * sin(a), R = hyp(rx, ry);
    return {
      topic: T.balance, text: `Two ropes pull a post: ${F1} N along the +x axis and ${F2} N at ${a}° from the +x axis. What size of force would balance the two of them?`,
      figure: vectors([{ from: [0, 0], to: [F1, 0], label: `${F1} N` }, { from: [0, 0], to: comps(F2, a), label: `${F2} N`, tone: 1 }, { from: [0, 0], to: [-rx, -ry], label: '?', tone: 2 }], { unit: 'N' }),
      answer: numAns(R, 'N'),
      solution: `Their sum: x = ${F1} + ${F2} cos ${a}° = ${num(rx)} N, y = ${F2} sin ${a}° = ${num(ry)} N, a size of √(${sq(rx)} + ${sq(ry)}) = ${num(R)} N. The balancing force is that size, pointing the other way: <b>${num(R)} N</b>.`,
      meta: { type: 'balance-angled', in: { F1, F2, a } },
    };
  },

  // 12. distance counts every step; displacement only says where you ended up
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type < 2) {
      const [a, b, c] = turn(ctx, 4, [[300, 400, 500, 600, 800], [200, 300, 400, 600], [100, 200, 300, 900]], (x, y, z) => x !== z && [x, y, z].every((leg) => Math.abs(hyp(x - z, y) - leg) > 0.05 * leg));
      const total = a + b + c, disp = hyp(a - c, b);
      return {
        topic: T.path, text: `A student walks ${a} m east, then ${b} m north, then ${c} m west. ${type === 0 ? 'What total distance do they walk?' : 'What is the size of their displacement?'}`,
        figure: vectors([{ from: [0, 0], to: [a, 0], label: `${a} m` }, { from: [a, 0], to: [a, b], label: `${b} m`, tone: 1 }, { from: [a, b], to: [a - c, b], label: `${c} m` }, ...(type === 1 ? [{ from: [0, 0], to: [a - c, b], label: '?', tone: 2 }] : [])], { unit: 'm', axes: ['east', 'north'] }),
        answer: numAns(type === 0 ? total : disp, 'm'),
        solution: type === 0
          ? `Distance adds up every leg, whatever its direction: ${a} + ${b} + ${c} = <b>${total} m</b>.`
          : `Only where they end up counts, and that is ${Math.abs(a - c)} m ${a >= c ? `east (${a} − ${c})` : `west (${c} − ${a})`} and ${b} m north of the start. So the displacement is √(${Math.abs(a - c)}² + ${b}²) = <b>${num(disp)} m</b>.`,
        ...(type === 0 ? { tip: 'Distance adds up the length of every leg, whatever its direction.' } : {}),
        meta: { type: type === 0 ? 'path-distance' : 'path-displacement', in: { a, b, c } },
      };
    }
    if (type === 2) {
      const [r, lap] = turn(ctx, 4, [[20, 25, 30, 40, 50, 60, 80], ['half', 'quarter']]);
      const disp = lap === 'half' ? 2 * r : Math.SQRT2 * r;
      return {
        topic: T.path, text: `A runner goes ${lap === 'half' ? 'halfway' : 'a quarter of the way'} around a circular track of radius ${r} m. What is the size of the runner’s displacement?`,
        answer: numAns(disp, 'm'),
        solution: lap === 'half'
          ? `Halfway around puts the runner straight across the circle, so the displacement is the diameter: 2 × ${r} = <b>${num(disp)} m</b> (the distance run is π × ${r} = ${num(Math.PI * r)} m).`
          : `A quarter of the way around, the start and finish are both ${r} m from the center, at right angles to each other. So the straight line between them is √(${r}² + ${r}²) = <b>${num(disp)} m</b> (the distance run is ${num((Math.PI * r) / 2)} m).`,
        meta: { type: `track-${lap}`, in: { r } },
      };
    }
    const [a, c, t] = turn(ctx, 4, [[400, 500, 600, 800, 900], [100, 200, 300, 500], [200, 250, 400, 500]], (x, z) => x > z);
    const v = (a - c) / t;
    return {
      topic: T.path, text: `A dog runs ${a} m east along a beach, then ${c} m back west, taking ${t} s for the whole run. What is the size of its average velocity?`,
      answer: numAns(v, 'm/s'),
      solution: `Average velocity is displacement ÷ time. It ends ${a} − ${c} = ${a - c} m east of the start, so ${a - c} ÷ ${t} = <b>${num(v)} m/s</b>. (Its average speed is larger, ${a + c} ÷ ${t} = ${num((a + c) / t)} m/s.)`,
      meta: { type: 'average-velocity', in: { a, c, t } },
    };
  },
];

export const vectorBank = bank('vectors', templates, 240);
