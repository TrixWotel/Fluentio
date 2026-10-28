// Projectile Motion: 13 topics, 20 variants each (260). Across and up are separate problems that share the time:
// across at a steady speed, up and down with g. Every topic is asked several ways, and most variants draw the scene to
// scale: the path, the ground, and the cliff, ledge, wall or tank.
import { bank, combo, num, round } from '../kit/bank.js';
import { plot, rad, deg } from './draw.js';

const G = 9.8;
const numAns = (value, unit, tol = 0.02) => ({ kind: 'number', value: round(value, 4), unit, tol });
// a topic's question types take turns (variant k is type k % types), each walking through its own number combinations
const turn = (ctx, types, lists, ok) => combo({ ...ctx, k: Math.floor(ctx.k / types), salt: `${ctx.salt}-${ctx.k % types}` }, lists, ok);
const oneOf = (d, right, wrongs) => { const list = d.shuffle([right, ...wrongs]); return { kind: 'choice', choices: list, correct: list.indexOf(right) }; };
const sin = (a) => Math.sin(rad(a)), cos = (a) => Math.cos(rad(a));
const fall = (h) => Math.sqrt((2 * h) / G);                       // the time to fall h from rest (vertically)
// (no answer within 3% of a number the question gives, so copying one out of the question isn't marked right)
const apart = (answer, ...given) => given.every((x) => Math.abs(Math.abs(answer) - Math.abs(x)) > 0.03 * Math.abs(answer));

// the path of something launched from (0, h0) at v, a° above the horizontal (negative: below), and where it lands
const pathOf = (v, a, h0 = 0) => (x) => h0 + Math.tan(rad(a)) * x - (G * x * x) / (2 * (v * cos(a)) ** 2);
const flight = (v, a, h0 = 0) => { const vy = v * sin(a); return (vy + Math.sqrt(vy * vy + 2 * G * h0)) / G; };
// the scene to scale: the path out to x = to, with a cliff, a ledge, a wall or a tank, the launch velocity, and lengths
function scene({ v, a = 0, h0 = 0, to, cliff = false, ledge = 0, wall = null, tank = null, arrow = true, label, dims = [], points = [], notes = [], unit = 'm', pathTo }) {
  const apex = a > 0 ? h0 + (v * sin(a)) ** 2 / (2 * G) : h0;
  const right = Math.max(to, wall ? wall.x + wall.t : 0, tank ? tank.x + tank.w : 0), top = Math.max(apex, wall ? wall.h : 0, tank ? tank.h : 0, 0.01);
  const big = Math.max(right, top), step = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200].find((s) => big / s <= 7) ?? 500;
  const x0 = cliff ? -2 * step : 0, solids = [];             // (a cliff two steps wide, so its height fits on it)
  if (cliff) solids.push({ pts: [[x0, 0], [0, 0], [0, h0], [x0, h0]] });
  if (ledge) solids.push({ pts: [[0, 0], [ledge, 0], [ledge, step * 0.15], [0, step * 0.15]] });
  if (wall) solids.push({ pts: [[wall.x, 0], [wall.x + wall.t, 0], [wall.x + wall.t, wall.h], [wall.x, wall.h]] });
  if (tank) {
    solids.push({ kind: 'water', pts: [[tank.x, 0], [tank.x + tank.w, 0], [tank.x + tank.w, tank.h * 0.55], [tank.x, tank.h * 0.55]] });
    const t = tank.w * 0.06;
    solids.push({ kind: 'tank', pts: [[tank.x - t, 0], [tank.x, 0], [tank.x, tank.h], [tank.x - t, tank.h]] }, { kind: 'tank', pts: [[tank.x + tank.w, 0], [tank.x + tank.w + t, 0], [tank.x + tank.w + t, tank.h], [tank.x + tank.w, tank.h]] });
  }
  const len = big * 0.2, arrows = arrow ? [{ from: [0, h0], to: [len * cos(a), h0 + len * sin(a)], label: label ?? `${num(v)} ${unit === 'm' ? 'm/s' : ''}`.trim(), side: a <= 0 ? -1 : undefined }] : [];
  return plot({
    x: [x0, Math.ceil((right * 1.06) / step - 1e-9) * step, step], y: [0, Math.ceil((top * 1.18) / step - 1e-9) * step, step], equal: true,
    xLabel: `distance (${unit})`, yLabel: `height (${unit})`, solids, curves: [{ f: pathOf(v, a, h0), from: 0, to: pathTo ?? to }], arrows, dims, points, notes,
  });
}
const heightDim = (h, label) => ({ from: [0, 0], to: [0, h], label, off: -14 });
const groundDim = (x, label, from = 0) => ({ from: [from, 0], to: [x, 0], label, off: -12 });

const T = {
  time: 'Launched sideways: time in the air', reach: 'Launched sideways: how far it lands', impact: 'Launched sideways: how it lands',
  speed: 'Launched sideways: the speed from where it lands', ledge: 'Clearing a ledge', parts: 'Launch speed in parts',
  flight: 'Time of flight on level ground', height: 'Maximum height', range: 'Range on level ground', partway: 'Where it is partway',
  vertical: 'Straight up, then down', tank: 'Into a tank, in terms of g and D', high: 'Launched from a height at an angle',
};

const templates = [
  // 1. launched sideways: the time in the air is the time to fall the height, whatever the sideways speed
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type === 0) {
      const [h, v] = turn(ctx, 4, [[0.8, 1, 1.2, 1.25, 1.5], [1.5, 2, 2.5, 3, 4]]), t = fall(h);
      return {
        topic: T.time, text: `A marble rolls off a table ${num(h)} m high at ${num(v)} m/s. How long is it in the air?`,
        figure: scene({ v, h0: h, to: v * t, cliff: true, dims: [heightDim(h, `${num(h)} m`)] }),
        answer: numAns(t, 's'),
        solution: `It leaves horizontally, so it starts with no vertical speed and falls ${num(h)} m: h = ½gt², so t = √(2h/g) = √(2 × ${num(h)} / 9.8) = <b>${num(t)} s</b>. Its ${num(v)} m/s sideways doesn’t change how long it falls.`,
        meta: { type: 'table-time', in: { h, v } },
      };
    }
    if (type === 1) {
      const [h, v] = turn(ctx, 4, [[180, 245, 320, 405, 500], [60, 70, 80, 100]]), t = fall(h);
      return {
        topic: T.time, text: `A plane flying level at ${v} m/s, ${h} m above the ground, drops a supply box. Ignoring air resistance, how long does the box take to reach the ground?`,
        figure: scene({ v, h0: h, to: v * t, dims: [{ ...heightDim(h, `${h} m`), off: 14 }] }),
        answer: numAns(t, 's'),
        solution: `The box keeps the plane’s ${v} m/s forward, but it starts with no vertical speed, so it falls like a dropped object: t = √(2h/g) = √(2 × ${h} / 9.8) = <b>${num(t)} s</b>.`,
        meta: { type: 'plane-drop', in: { h, v } },
      };
    }
    if (type === 2) {
      const [h, v1, v2] = turn(ctx, 4, [[0.8, 1, 1.2], [1, 2, 3], [4, 5, 6]]);
      const right = 'They land at the same time';
      return {
        topic: T.time, text: `Two balls roll off the edge of a ${num(h)} m high table at the same moment: one at ${v1} m/s, the other at ${v2} m/s. Which lands first?`,
        answer: oneOf(d, right, ['The faster ball', 'The slower ball', 'Whichever one is heavier']),
        solution: `Both start with no vertical speed and fall the same ${num(h)} m, so both take √(2 × ${num(h)} / 9.8) = ${num(fall(h))} s. The faster one just lands farther away. <b>${right}</b>.`,
        meta: { type: 'same-time' },
      };
    }
    const [t] = turn(ctx, 4, [[1.2, 1.5, 1.8, 2, 2.2, 2.5, 3]]), h = 0.5 * G * t * t;
    return {
      topic: T.time, text: `A stone is thrown horizontally off a bridge and hits the water ${num(t)} s later. How high above the water is the bridge?`,
      answer: numAns(h, 'm'),
      solution: `Vertically it falls from rest for ${num(t)} s: h = ½gt² = ½ × 9.8 × ${num(t)}² = <b>${num(h)} m</b>. How hard it was thrown sideways doesn’t matter.`,
      meta: { type: 'bridge-height', in: { t } },
    };
  },

  // 2. launched sideways: how far = the sideways speed × the time to fall
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type === 0) {
      const [h, v] = turn(ctx, 4, [[20, 45, 60, 80, 100, 125], [8, 10, 12, 15, 20, 25, 30]]), t = fall(h), x = v * t;
      return {
        topic: T.reach, text: `A ball is thrown horizontally at ${v} m/s from the top of a cliff ${h} m high. How far from the foot of the cliff does it land?`,
        figure: scene({ v, h0: h, to: x, cliff: true, dims: [heightDim(h, `${h} m`), groundDim(x, '?')] }),
        answer: numAns(x, 'm'),
        solution: `Falling ${h} m takes t = √(2 × ${h} / 9.8) = ${num(t, 3)} s. Sideways it keeps ${v} m/s all that time, so x = ${v} × ${num(t, 3)} = <b>${num(x)} m</b>.`,
        meta: { type: 'cliff-range', in: { h, v } },
      };
    }
    if (type === 1) {
      const [v, t] = turn(ctx, 4, [[3, 4, 5, 6, 8, 12], [0.4, 0.5, 0.6, 0.8, 1.5, 2.5]]), x = v * t;
      return {
        topic: T.reach, text: `A ball leaves a ledge horizontally at ${v} m/s and lands ${num(t)} s later. How far from the foot of the ledge does it land?`,
        answer: numAns(x, 'm'),
        solution: `Nothing pushes it sideways, so its horizontal speed stays ${v} m/s: x = v × t = ${v} × ${num(t)} = <b>${num(x)} m</b>.`,
        meta: { type: 'speed-times-time', in: { v, t } },
      };
    }
    if (type === 2) {
      const [v, x, v2] = turn(ctx, 4, [[2, 3, 4], [1.2, 1.5, 1.8, 2.4], [5, 6, 1, 1.5]], (V, X, V2) => apart((X * V2) / V, V, X, V2)), x2 = (x * v2) / v;
      return {
        topic: T.reach, text: `A toy car rolls off a table at ${v} m/s and lands ${num(x)} m from the table. How far from the table would it land if it rolled off at ${num(v2)} m/s?`,
        answer: numAns(x2, 'm'),
        solution: `The table’s height sets the time in the air, so that stays the same. Distance = speed × time, so it changes in step with the speed: ${num(x)} × ${num(v2)}/${v} = <b>${num(x2)} m</b>.`,
        meta: { type: 'scale-speed', in: { v, x, v2 } },
      };
    }
    const [n] = turn(ctx, 4, [[4, 9, 16, 2, 3, 25, 1.44]]), f = Math.sqrt(n);
    return {
      topic: T.reach, text: `A ball thrown horizontally from a cliff lands some distance from its foot. If it were thrown at the same speed from a cliff ${num(n)} times as high, how many times as far would it land?`,
      answer: numAns(f, ''),
      solution: `The time to fall is √(2h/g), so ${num(n)} times the height gives √${num(n)} = ${num(f)} times the time. At the same sideways speed, that’s <b>${num(f)}</b> times as far.`,
      meta: { type: 'scale-height', in: { n } },
    };
  },

  // 3. launched sideways: how it lands, with the vertical speed g·t on top of the unchanged sideways speed
  (d, ctx) => {
    const type = ctx.k % 4;
    // (the horizontal velocity is meant to be the launch speed; the others shouldn't match anything given)
    const [h, v] = turn(ctx, 4, [[20, 30, 45, 60, 80], [10, 15, 20, 25, 30, 40]], (H, V) => type === 3 || apart([Math.hypot(V, Math.sqrt(2 * G * H)), Math.sqrt(2 * G * H), deg(Math.atan(Math.sqrt(2 * G * H) / V))][type], H, V)), t = fall(h), vy = Math.sqrt(2 * G * h), sp = Math.hypot(v, vy), ang = deg(Math.atan(vy / v));
    const fig = scene({ v, h0: h, to: v * t, cliff: true, dims: [heightDim(h, `${h} m`)] });
    const ask = ['How fast is it moving just before it lands?', 'What is the vertical component of its velocity just before it lands?', 'At what angle below the horizontal is it moving as it lands?', 'What is its horizontal velocity just before it lands?'][type];
    const answer = [numAns(sp, 'm/s'), numAns(vy, 'm/s'), numAns(ang, '°'), numAns(v, 'm/s')][type];
    const first = `Vertically it falls ${h} m from rest: v<sub>y</sub> = √(2gh) = √(2 × 9.8 × ${h}) = ${num(vy)} m/s downward.`;
    return {
      topic: T.impact, text: `A stone is launched horizontally at ${v} m/s off a cliff ${h} m high. ${ask}`, figure: fig, answer,
      solution: [`${first} Horizontally it still has ${v} m/s. Speed = √(${v}² + ${num(vy)}²) = <b>${num(sp)} m/s</b>.`, `Vertically it falls ${h} m from rest: v<sub>y</sub> = √(2gh) = √(2 × 9.8 × ${h}) = <b>${num(vy)} m/s</b> downward. (The sideways ${v} m/s doesn’t change it.)`,
        `${first} Then tan θ = vertical ÷ horizontal = ${num(vy)} ÷ ${v}, so θ = <b>${num(ang)}°</b> below the horizontal.`, `Only gravity acts, and it pulls straight down, so nothing changes the sideways motion. The horizontal velocity stays <b>${v} m/s</b> the whole way down.`][type],
      meta: { type: ['impact-speed', 'impact-vy', 'impact-angle', 'impact-vx'][type], in: { h, v } },
    };
  },

  // 4. launched sideways: work back from where it lands to how fast it left
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type === 0 || type === 3) {
      const [h, x] = turn(ctx, 4, [[40, 50, 60, 67, 75, 90], [100, 120, 150, 180, 200, 240]]), t = fall(h), v = x / t, sp = Math.hypot(v, G * t);
      return {
        topic: T.speed, text: `A cannon on a castle wall ${h} m above a river fires a ball horizontally. It hits a ship ${x} m away horizontally. ${type === 0 ? 'How fast did the ball leave the cannon?' : 'How fast is the ball moving when it hits the ship?'}`,
        figure: scene({ v, h0: h, to: x, cliff: true, arrow: false, dims: [heightDim(h, `${h} m`), groundDim(x, `${x} m`)] }),
        answer: numAns(type === 0 ? v : sp, 'm/s'),
        solution: `Falling ${h} m takes t = √(2 × ${h} / 9.8) = ${num(t, 3)} s. In that time it went ${x} m sideways, so v<sub>x</sub> = ${x} ÷ ${num(t, 3)} = ${num(v)} m/s.`
          + (type === 0 ? ` It was fired horizontally, so that is the launch speed: <b>${num(v)} m/s</b>.` : ` By then v<sub>y</sub> = gt = 9.8 × ${num(t, 3)} = ${num(G * t)} m/s, so the speed is √(${num(v)}² + ${num(G * t)}²) = <b>${num(sp)} m/s</b>.`),
        meta: { type: type === 0 ? 'cannon-speed' : 'cannon-impact', in: { h, x } },
      };
    }
    if (type === 1) {
      const [h, x] = turn(ctx, 4, [[0.8, 0.9, 1, 1.2], [0.6, 0.8, 1, 1.2, 1.5]]), t = fall(h), v = x / t;
      return {
        topic: T.speed, text: `A marble rolls off a table ${num(h)} m high and lands ${num(x)} m from the foot of the table. How fast was it rolling?`,
        figure: scene({ v, h0: h, to: x, cliff: true, arrow: false, dims: [heightDim(h, `${num(h)} m`), groundDim(x, `${num(x)} m`)] }),
        answer: numAns(v, 'm/s'),
        solution: `It falls ${num(h)} m in t = √(2 × ${num(h)} / 9.8) = ${num(t, 3)} s. In that time it covers ${num(x)} m sideways, so v = ${num(x)} ÷ ${num(t, 3)} = <b>${num(v)} m/s</b>.`,
        meta: { type: 'table-speed', in: { h, x } },
      };
    }
    const [x, cm] = turn(ctx, 4, [[2, 2.37, 2.5, 3], [4, 5, 8, 10, 12]]), t = fall(cm / 100), v = x / t;
    return {
      topic: T.speed, text: `A dart is thrown horizontally at the bullseye of a board ${num(x)} m away, and hits ${cm} cm below it. How fast was it thrown?`,
      answer: numAns(v, 'm/s'),
      solution: `It dropped ${cm} cm = ${num(cm / 100)} m on the way, which takes t = √(2 × ${num(cm / 100)} / 9.8) = ${num(t, 4)} s. In that time it flew ${num(x)} m, so v = ${num(x)} ÷ ${num(t, 4)} = <b>${num(v)} m/s</b>.`,
      meta: { type: 'dart-speed', in: { x, cm } },
    };
  },

  // 5. clearing a ledge: the sideways distance in the time it takes to fall past it
  (d, ctx) => {
    const type = ctx.k % 4;
    const [h, w] = turn(ctx, 4, [[6, 8, 9, 10, 12, 15], [1.2, 1.5, 1.75, 2, 2.5, 3]]), t = fall(h), vmin = w / t;
    if (type === 0) {
      return {
        topic: T.ledge, text: `A diver runs and leaps horizontally off a cliff. At the bottom, ${h} m below, a rocky ledge sticks out ${num(w)} m. What is the slowest speed the diver can leave with and still miss the ledge?`,
        figure: scene({ v: vmin, h0: h, to: w, cliff: true, ledge: w, arrow: false, dims: [heightDim(h, `${h} m`), groundDim(w, `${num(w)} m`)] }),
        answer: numAns(vmin, 'm/s'),
        solution: `Falling ${h} m takes t = √(2 × ${h} / 9.8) = ${num(t, 3)} s. To get past the ledge in that time, v = ${num(w)} ÷ ${num(t, 3)} = <b>${num(vmin)} m/s</b> at least.`,
        meta: { type: 'diver-min', in: { h, w } },
      };
    }
    if (type === 1) {
      const v = round(vmin * 1.6, 1), wmax = v * t;
      return {
        topic: T.ledge, text: `A diver leaves the top of a cliff ${h} m high horizontally at ${num(v)} m/s. What is the widest ledge at the bottom that they would clear?`,
        figure: scene({ v, h0: h, to: wmax, cliff: true, dims: [heightDim(h, `${h} m`)] }),
        answer: numAns(wmax, 'm'),
        solution: `They fall for t = √(2 × ${h} / 9.8) = ${num(t, 3)} s, traveling ${num(v)} × ${num(t, 3)} = <b>${num(wmax)} m</b> sideways. Any ledge narrower than that, they clear.`,
        meta: { type: 'diver-widest', in: { h, v } },
      };
    }
    if (type === 2) {
      const clears = ctx.k % 8 < 4, v = round(vmin * (clears ? 1.25 : 0.75), 1), weight = [500, 550, 600, 650, 700][ctx.k % 5];
      const right = clears ? 'Yes, they clear it' : 'No, they land on the ledge';
      return {
        topic: T.ledge, text: `A ${weight} N diver leaps horizontally at ${num(v)} m/s off a cliff ${h} m high. A ledge at the bottom sticks out ${num(w)} m. Does the diver clear the ledge?`,
        answer: oneOf(d, right, [clears ? 'No, they land on the ledge' : 'Yes, they clear it', 'It depends on how heavy the diver is', 'Only if they also jump upward']),
        solution: `Falling ${h} m takes t = √(2 × ${h} / 9.8) = ${num(t, 3)} s, whatever the diver weighs. In that time they travel ${num(v)} × ${num(t, 3)} = ${num(v * t)} m out, ${clears ? 'more' : 'less'} than the ${num(w)} m ledge. <b>${right}</b>.`,
        meta: { type: 'diver-check' },
      };
    }
    const gap = [4, 5, 6, 8, 10][ctx.k % 5], drop = [1.5, 2, 2.5, 3, 4][Math.floor(ctx.k / 5) % 5], tt = fall(drop), vv = gap / tt;
    return {
      topic: T.ledge, text: `A stunt rider jumps a gap ${gap} m wide, riding off the edge horizontally. The far side is ${num(drop)} m lower. What is the slowest speed that makes it across?`,
      answer: numAns(vv, 'm/s'),
      solution: `The ${num(drop)} m drop gives t = √(2 × ${num(drop)} / 9.8) = ${num(tt, 3)} s in the air. To cover ${gap} m in that time, v = ${gap} ÷ ${num(tt, 3)} = <b>${num(vv)} m/s</b>.`,
      meta: { type: 'gap-jump', in: { gap, drop } },
    };
  },

  // 6. launch speed in parts: v cos θ across, v sin θ up
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type < 2) {
      const [v, a] = turn(ctx, 4, [[12, 15, 18, 20, 25, 30], [25, 30, 35, 40, 50, 60]]), vx = v * cos(a), vy = v * sin(a);
      const R = (2 * vx * vy) / G;
      return {
        topic: T.parts, text: `A ball is kicked from level ground at ${v} m/s, ${a}° above the horizontal. What is the ${type === 0 ? 'horizontal' : 'vertical'} component of its launch velocity?`,
        figure: scene({ v, a, to: R }),
        answer: numAns(type === 0 ? vx : vy, 'm/s'),
        solution: type === 0 ? `The horizontal part is next to the ${a}° angle: v<sub>x</sub> = ${v} cos ${a}° = <b>${num(vx)} m/s</b>.` : `The vertical part is across from the ${a}° angle: v<sub>y</sub> = ${v} sin ${a}° = <b>${num(vy)} m/s</b>.`,
        meta: { type: type === 0 ? 'launch-x' : 'launch-y', in: { v, a } },
      };
    }
    const [vx, vy] = turn(ctx, 4, [[6, 8, 10, 12, 15, 20], [5, 8, 9, 12, 16, 20]], (x, y) => x !== y);
    const v = Math.hypot(vx, vy), a = deg(Math.atan(vy / vx));
    return {
      topic: T.parts, text: `A ball leaves the ground moving ${vx} m/s horizontally and ${vy} m/s upward. ${type === 2 ? 'What is its launch speed?' : 'At what angle above the horizontal was it launched?'}`,
      figure: scene({ v, a, to: (2 * vx * vy) / G, label: type === 2 ? '?' : 'v' }),
      answer: type === 2 ? numAns(v, 'm/s') : numAns(a, '°'),
      solution: type === 2 ? `The two parts are at right angles: v = √(${vx}² + ${vy}²) = <b>${num(v)} m/s</b>.` : `tan θ = up ÷ across = ${vy} ÷ ${vx}, so θ = tan⁻¹(${vy}/${vx}) = <b>${num(a)}°</b>.`,
      meta: { type: type === 2 ? 'parts-speed' : 'parts-angle', in: { vx, vy } },
    };
  },

  // 7. time of flight on level ground: up and back down again, 2·v sin θ / g
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type < 2) {
      const [v, a] = turn(ctx, 4, [[15, 20, 25, 30, 40], [30, 40, 50, 60, 70]]), vy = v * sin(a), top = vy / G;
      return {
        topic: T.flight, text: `A ball is launched from level ground at ${v} m/s, ${a}° above the horizontal. ${type === 0 ? 'How long is it in the air?' : 'How long does it take to reach its highest point?'}`,
        figure: scene({ v, a, to: (2 * v * v * sin(a) * cos(a)) / G }),
        answer: numAns(type === 0 ? 2 * top : top, 's'),
        solution: `Its vertical launch speed is ${v} sin ${a}° = ${num(vy)} m/s, which gravity takes away at 9.8 m/s each second.`
          + (type === 0 ? ` It takes ${num(vy)} ÷ 9.8 = ${num(top, 3)} s to reach the top. Coming down takes just as long, so the flight lasts 2 × ${num(top, 3)} = <b>${num(2 * top)} s</b>.` : ` So it reaches the top after ${num(vy)} ÷ 9.8 = <b>${num(top)} s</b>.`),
        meta: { type: type === 0 ? 'flight-time' : 'top-time', in: { v, a } },
      };
    }
    if (type === 2) {
      const [tf, a] = turn(ctx, 4, [[2, 2.5, 3, 4, 5], [30, 40, 45, 60]]), v = (G * tf) / (2 * sin(a));
      return {
        topic: T.flight, text: `A ball launched from level ground at ${a}° above the horizontal lands ${num(tf)} s later. How fast was it launched?`,
        answer: numAns(v, 'm/s'),
        solution: `Time of flight = 2v sin θ ÷ g. Turned around, v = g × t ÷ (2 sin θ) = 9.8 × ${num(tf)} ÷ (2 sin ${a}°) = <b>${num(v)} m/s</b>.`,
        meta: { type: 'speed-from-time', in: { tf, a } },
      };
    }
    const [vx, R] = turn(ctx, 4, [[8, 10, 12, 15, 20], [24, 30, 36, 45, 60]]), tf = R / vx;
    return {
      topic: T.flight, text: `A golf ball travels ${vx} m/s horizontally and lands ${R} m away on level ground. How long was it in the air?`,
      answer: numAns(tf, 's'),
      solution: `Across, it moves at a steady ${vx} m/s the whole time, so t = distance ÷ speed = ${R} ÷ ${vx} = <b>${num(tf)} s</b>.`,
      tip: 'Across, the speed never changes, so the time = distance across ÷ speed across.',
        meta: { type: 'time-from-range', in: { vx, R } },
    };
  },

  // 8. maximum height: where the vertical velocity reaches zero, (v sin θ)² / 2g
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type === 0 || type === 3) {
      const [v, a] = turn(ctx, 4, [[12, 15, 20, 25, 30], [30, 40, 45, 55, 60, 70]]), vy = v * sin(a), H = (vy * vy) / (2 * G), vx = v * cos(a);
      const R = (2 * vx * vy) / G;
      return {
        topic: T.height, text: `A ball is launched from level ground at ${v} m/s, ${a}° above the horizontal. ${type === 0 ? 'How high does it go?' : 'How fast is it moving at its highest point?'}`,
        figure: scene({ v, a, to: R, points: [[R / 2, H, type === 0 ? 'highest: ?' : 'top']] }),
        answer: numAns(type === 0 ? H : vx, type === 0 ? 'm' : 'm/s'),
        solution: type === 0
          ? `The vertical launch speed is v<sub>y</sub> = ${v} sin ${a}° = ${num(vy)} m/s, and at the top the vertical velocity is zero. Then v² = u² − 2gH gives H = ${num(vy)}² ÷ (2 × 9.8) = <b>${num(H)} m</b>.`
          : `At the top only the vertical part has gone to zero. The horizontal part never changes: v<sub>x</sub> = ${v} cos ${a}° = <b>${num(vx)} m/s</b>.`,
        meta: { type: type === 0 ? 'max-height' : 'top-speed', in: { v, a } },
      };
    }
    if (type === 1) {
      const [H] = turn(ctx, 4, [[5, 8, 10, 12, 15, 20, 30]], (x) => apart(Math.sqrt(2 * G * x), x)), vy = Math.sqrt(2 * G * H);
      return {
        topic: T.height, text: `A ball needs to rise ${H} m above the ground at its highest point. What vertical component of launch velocity does it need?`,
        answer: numAns(vy, 'm/s'),
        solution: `At the top the vertical velocity is zero, so 0 = v<sub>y</sub>² − 2gH and v<sub>y</sub> = √(2 × 9.8 × ${H}) = <b>${num(vy)} m/s</b>.`,
        meta: { type: 'vy-for-height', in: { H } },
      };
    }
    const [H, a] = turn(ctx, 4, [[5, 8, 10, 12, 15], [30, 40, 50, 60]]), v = Math.sqrt(2 * G * H) / sin(a);
    return {
      topic: T.height, text: `At ${a}° above the horizontal, how fast must a ball be launched from the ground to reach a highest point ${H} m up?`,
      answer: numAns(v, 'm/s'),
      solution: `It needs v<sub>y</sub> = √(2 × 9.8 × ${H}) = ${num(Math.sqrt(2 * G * H))} m/s to reach ${H} m. Since v<sub>y</sub> = v sin ${a}°, v = ${num(Math.sqrt(2 * G * H))} ÷ sin ${a}° = <b>${num(v)} m/s</b>.`,
      meta: { type: 'speed-for-height', in: { H, a } },
    };
  },

  // 9. range on level ground: v² sin 2θ / g, the same for θ and 90° − θ, farthest at 45°, landing as it left
  (d, ctx) => {
    const type = ctx.k % 5;
    if (type === 0 || type === 4) {
      const [v, a] = turn(ctx, 5, [[15, 20, 25, 30, 40], [20, 30, 35, 50, 60, 70]]), R = (v * v * sin(2 * a)) / G;
      return {
        topic: T.range, text: `A ball is launched from level ground at ${v} m/s, ${a}° above the horizontal. ${type === 0 ? 'How far away does it land?' : 'At what angle below the horizontal is it moving when it lands?'}`,
        figure: scene({ v, a, to: R, dims: type === 0 ? [groundDim(R, '?')] : [] }),
        answer: type === 0 ? numAns(R, 'm') : numAns(a, '°'),
        solution: type === 0
          ? `The time in the air is 2 × ${v} sin ${a}° ÷ 9.8 = ${num((2 * v * sin(a)) / G, 3)} s. Across, it moves at ${v} cos ${a}° = ${num(v * cos(a))} m/s, so R = ${num(v * cos(a))} × ${num((2 * v * sin(a)) / G, 3)} = <b>${num(R)} m</b> (the same as v² sin 2θ ÷ g).`
          : `On level ground the path is symmetric: it comes down at the same speed and the same angle it went up, so <b>${a}°</b> below the horizontal.`,
        ...(type === 4 ? { tip: 'On level ground the path is symmetric: it comes down the way it went up, mirrored.' } : {}),
        meta: { type: type === 0 ? 'range' : 'landing-angle', in: { v, a } },
      };
    }
    if (type === 1) {
      const [a, v] = turn(ctx, 5, [[15, 20, 25, 30, 35, 40, 50, 55, 60, 65, 70, 75], [20, 25]]);
      const tries = [2 * a <= 85 ? 2 * a : 180 - 2 * a, 180 - a, Math.round(a / 2), 45, 90 + a, a < 80 ? a + 10 : a - 10];
      const right = `${90 - a}°`, wrongs = [...new Set(tries.filter((x) => x !== 90 - a && x !== a))].slice(0, 3).map((x) => `${x}°`);
      return {
        topic: T.range, text: `Launched from level ground at ${v} m/s and ${a}° above the horizontal, a ball lands some distance away. At what other angle could it be launched at the same speed to land at the same place?`,
        figure: scene({ v, a, to: (v * v * sin(2 * a)) / G }),
        answer: oneOf(d, right, wrongs),
        solution: `Range = v² sin 2θ ÷ g, and sin 2θ is the same for θ and 90° − θ (they’re complementary). So 90° − ${a}° = <b>${right}</b> gives the same range: ${90 - a > a ? 'it goes higher and takes longer, but moves across more slowly' : 'it stays lower and lands sooner, but moves across faster'}.`,
        meta: { type: 'complementary' },
      };
    }
    if (type === 2) {
      const [v] = turn(ctx, 5, [[10, 12, 15, 18, 20, 25, 30]]), R = (v * v) / G;
      return {
        topic: T.range, text: `What is the farthest a ball launched from level ground at ${v} m/s can land, if you choose the best angle?`,
        figure: scene({ v, a: 45, to: R }),
        answer: numAns(R, 'm'),
        solution: `R = v² sin 2θ ÷ g is largest when sin 2θ = 1, at θ = 45°. Then R = ${v}² ÷ 9.8 = <b>${num(R)} m</b>.`,
        meta: { type: 'max-range', in: { v } },
      };
    }
    const [vx, vy] = turn(ctx, 5, [[8, 10, 12, 15, 20], [6, 8, 10, 12, 15]]), tf = (2 * vy) / G, R = vx * tf;
    return {
      topic: T.range, text: `A ball leaves level ground moving ${vx} m/s across and ${vy} m/s up. How far away does it land?`,
      figure: scene({ v: Math.hypot(vx, vy), a: deg(Math.atan(vy / vx)), to: R, label: 'v' }),
      answer: numAns(R, 'm'),
      solution: `Up and back down takes 2 × ${vy} ÷ 9.8 = ${num(tf, 3)} s. Across at a steady ${vx} m/s, it lands ${vx} × ${num(tf, 3)} = <b>${num(R)} m</b> away.`,
      meta: { type: 'range-from-parts', in: { vx, vy } },
    };
  },

  // 10. where it is partway: put the time into x = v cos θ · t and y = v sin θ · t − ½gt²
  (d, ctx) => {
    const type = ctx.k % 4;
    const [v, a] = turn(ctx, 4, [[12, 12.4, 15, 18, 20, 25], [30, 36, 40, 45, 55]]), vx = v * cos(a), vy = v * sin(a), tf = (2 * vy) / G;
    if (type < 2) {
      const t = round(tf * [0.15, 0.25, 0.35, 0.6][ctx.k % 4], 2), x = vx * t, y = vy * t - 0.5 * G * t * t;
      return {
        topic: T.partway, text: `A ball is thrown from level ground at ${num(v)} m/s, ${a}° above the horizontal. ${type === 0 ? `How far has it traveled horizontally after ${num(t)} s?` : `How high is it ${num(t)} s after it is thrown?`}`,
        figure: scene({ v, a, to: vx * tf, points: [[x, y, `${num(t)} s`]] }),
        answer: numAns(type === 0 ? x : y, 'm'),
        solution: type === 0
          ? `Across it moves at a steady ${num(v)} cos ${a}° = ${num(vx)} m/s: x = ${num(vx)} × ${num(t)} = <b>${num(x)} m</b>.`
          : `Up: y = v<sub>y</sub>t − ½gt² with v<sub>y</sub> = ${num(v)} sin ${a}° = ${num(vy)} m/s: y = ${num(vy)} × ${num(t)} − 4.9 × ${num(t)}² = <b>${num(y)} m</b>.`,
        meta: { type: type === 0 ? 'x-at-time' : 'y-at-time', in: { v, a, t } },
      };
    }
    if (type === 2) {
      const X = round(vx * tf * [0.2, 0.3, 0.7, 0.8][ctx.k % 4], 1), t = X / vx, y = vy * t - 0.5 * G * t * t;
      return {
        topic: T.partway, text: `A ball is thrown from level ground at ${num(v)} m/s, ${a}° above the horizontal, toward a wall ${num(X)} m away. At what height does it reach the wall?`,
        figure: scene({ v, a, to: vx * tf, pathTo: X, wall: { x: X, t: X * 0.03, h: y }, dims: [groundDim(X, `${num(X)} m`)] }),
        answer: numAns(y, 'm'),
        solution: `Across it moves at v<sub>x</sub> = ${num(v)} cos ${a}° = ${num(vx)} m/s, so it reaches the wall when ${num(vx)} × t = ${num(X)}, at t = ${num(t, 3)} s. Upward it starts at v<sub>y</sub> = ${num(v)} sin ${a}° = ${num(vy)} m/s, so then y = ${num(vy)} × ${num(t, 3)} − 4.9 × ${num(t, 3)}² = <b>${num(y)} m</b>.`,
        meta: { type: 'height-at-wall', in: { v, a, X } },
      };
    }
    const t = round(tf * [0.2, 0.35, 0.65, 0.8][ctx.k % 4], 2), vyt = vy - G * t;
    return {
      topic: T.partway, text: `A ball is thrown from level ground at ${num(v)} m/s, ${a}° above the horizontal. What is its vertical velocity ${num(t)} s after it is thrown? (Take up as positive.)`,
      answer: numAns(vyt, 'm/s'),
      solution: `v<sub>y</sub> = ${num(v)} sin ${a}° − 9.8 × ${num(t)} = ${num(vy)} − ${num(G * t)} = <b>${num(vyt)} m/s</b>. ${vyt < 0 ? 'It is negative, so the ball is already on the way down.' : 'It is positive, so the ball is still rising.'}`,
      tip: 'The vertical velocity starts at v sin θ and loses 9.8 m/s every second.',
        meta: { type: 'vy-at-time', in: { v, a, t } },
    };
  },

  // 11. straight up, then down: the way down from the top mirrors the way up
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type < 2) {
      const [t] = turn(ctx, 4, [[0.8, 1, 1.2, 1.4, 1.6, 1.8, 2.2]]), H = 0.5 * G * t * t, u = G * t;
      return {
        topic: T.vertical, text: `A ball is thrown straight up from the ground and lands ${num(t)} s after reaching its highest point. ${type === 0 ? 'How high did it go?' : 'How fast was it thrown?'}`,
        answer: type === 0 ? numAns(H, 'm') : numAns(u, 'm/s'),
        solution: type === 0
          ? `From the top it falls from rest for ${num(t)} s: H = ½gt² = 4.9 × ${num(t)}² = <b>${num(H)} m</b>.`
          : `The trip down from the top takes as long as the trip up, so gravity took ${num(t)} s to stop it: u = gt = 9.8 × ${num(t)} = <b>${num(u)} m/s</b>.`,
        meta: { type: type === 0 ? 'height-from-fall' : 'speed-from-fall', in: { t } },
      };
    }
    if (type === 2) {
      const [u] = turn(ctx, 4, [[8, 10, 12, 15, 18, 20, 25]]), tf = (2 * u) / G;
      return {
        topic: T.vertical, text: `A ball is thrown straight up at ${u} m/s and caught at the same height. How long is it in the air?`,
        answer: numAns(tf, 's'),
        solution: `It takes ${u} ÷ 9.8 = ${num(u / G, 3)} s to stop at the top. Coming back down takes the same again, so it is in the air 2 × ${num(u / G, 3)} = <b>${num(tf)} s</b>.`,
        meta: { type: 'up-down-time', in: { u } },
      };
    }
    const [tf] = turn(ctx, 4, [[1.5, 2, 2.5, 3, 3.6, 4, 5]]), u = (G * tf) / 2;
    return {
      topic: T.vertical, text: `A ball thrown straight up comes back to the thrower’s hand ${num(tf)} s later. How fast was it thrown?`,
      answer: numAns(u, 'm/s'),
      solution: `Half of the ${num(tf)} s, ${num(tf / 2)} s, is spent going up. Gravity stops it in that time, so u = 9.8 × ${num(tf / 2)} = <b>${num(u)} m/s</b>.`,
      meta: { type: 'speed-from-total', in: { tf } },
    };
  },

  // 12. into a tank, in terms of g and D: at 45° the path is y = x − gx²/v², and it has to clear the near rim and drop in
  // before the far one
  (d, ctx) => {
    const type = ctx.k % 3;
    const [k, m] = turn(ctx, 3, [[4, 5, 6, 7, 8], [1, 2, 3]], (a, b) => a - b >= 2);
    const lo = Math.sqrt((k * k) / (k - m)), hi = Math.sqrt(((k + 1) ** 2) / (k + 1 - m));
    const r = (c) => (Math.abs(c - Math.round(c)) < 0.005 ? num(Math.round(c)) : num(c, 2)), mD = m === 1 ? 'D' : `${m}D`;
    const say = (c) => `${r(c)}√(gD)`, both = (a, b) => `${say(a)} to ${say(b)}`;
    const wrongLo = [Math.sqrt(k), Math.sqrt((k * k) / m), Math.sqrt((k * k) / (k + m)), hi, Math.sqrt(k + 1)];
    const wrongHi = [Math.sqrt(k + 1), Math.sqrt(((k + 1) ** 2) / m), lo, Math.sqrt(((k + 1) ** 2) / (k + 1 + m)), Math.sqrt(k)];
    const pick = (right, list) => [...new Set(list.map(say))].filter((s) => s !== say(right)).slice(0, 4);
    const text = `A hose at ground level shoots water at 45° above the horizontal toward an open tank, D wide and ${mD} tall, whose near side is ${k}D away. Ignoring air resistance, ${['what is the slowest launch speed that gets the water over the near side?', 'what is the fastest launch speed that still lands the water inside the tank?', 'for what range of launch speeds does the water go into the tank?'][type]}`;
    const path = `At 45° the path is y = x − gx²/v² (tan 45° = 1, and 2v²cos²45° = v²).`;
    const near = `Over the near side, at x = ${k}D, y ≥ ${mD}, so ${k}D − g(${k}D)²/v² ≥ ${mD}, which gives v² ≥ ${k * k}gD/${k - m}, so v ≥ ${say(lo)}.`;
    const far = `Before the far side, at x = ${k + 1}D, y ≤ ${mD}, so ${k + 1}D − g(${k + 1}D)²/v² ≤ ${mD}, which gives v² ≤ ${(k + 1) ** 2}gD/${k + 1 - m}, so v ≤ ${say(hi)}.`;
    const vm = Math.sqrt((lo * lo + hi * hi) / 2);
    return {
      topic: T.tank, text,
      figure: scene({ v: vm * Math.sqrt(G), a: 45, to: k + 1.05, tank: { x: k, w: 1, h: m }, arrow: false, unit: 'D', dims: [groundDim(k, `${k}D`)] }),
      answer: type === 0 ? oneOf(d, say(lo), pick(lo, wrongLo)) : type === 1 ? oneOf(d, say(hi), pick(hi, wrongHi)) : oneOf(d, both(lo, hi), [both(Math.sqrt((k * k) / (k + m)), Math.sqrt(((k + 1) ** 2) / (k + 1 + m))), both(Math.sqrt(k), Math.sqrt(k + 1)), both(Math.sqrt((k * k) / m), Math.sqrt(((k + 1) ** 2) / m))].filter((s) => s !== both(lo, hi))),
      solution: type === 0 ? `${path} ${near} So the slowest speed is <b>${say(lo)}</b>.` : type === 1 ? `${path} ${far.replace(`v ≤ ${say(hi)}.`, `v ≤ <b>${say(hi)}</b>.`)}` : `${path} ${near} ${far} So from <b>${both(lo, hi)}</b>.`,
      meta: { type: ['tank-low', 'tank-high', 'tank-range'][type], in: { k, m } },
    };
  },

  // 13. launched from a height at an angle: the time comes from the quadratic for the height
  (d, ctx) => {
    const type = ctx.k % 4;
    const [h, v, a] = turn(ctx, 4, [[10, 15, 20, 30, 40], [10, 12, 15, 20], [20, 30, 40, 45]]);
    if (type < 3) {
      const vx = v * cos(a), vy = v * sin(a), t = flight(v, a, h), x = vx * t, sp = Math.sqrt(v * v + 2 * G * h);
      const ask = ['How long is it in the air?', 'How far from the foot of the cliff does it land?', 'How fast is it moving when it lands?'][type];
      return {
        topic: T.high, text: `A stone is thrown from the top of a cliff ${h} m high at ${v} m/s, ${a}° above the horizontal. ${ask}`,
        figure: scene({ v, a, h0: h, to: x, cliff: true, dims: [heightDim(h, `${h} m`)] }),
        answer: [numAns(t, 's'), numAns(x, 'm'), numAns(sp, 'm/s')][type],
        solution: type < 2
          ? `The vertical launch speed is ${v} sin ${a}° = ${num(vy)} m/s. Taking up as positive, the ground is ${h} m below, so −${h} = ${num(vy)}t − 4.9t². The positive root is t = (${num(vy)} + √(${num(vy)}² + 2 × 9.8 × ${h})) ÷ 9.8 = ${type === 0 ? `<b>${num(t)} s</b>` : `${num(t, 3)} s`}.`
            + (type === 1 ? ` Across it moves at ${v} cos ${a}° = ${num(vx)} m/s, so x = ${num(vx)} × ${num(t, 3)} = <b>${num(x)} m</b>.` : '')
          : `Across it keeps ${v} cos ${a}° = ${num(vx)} m/s. Vertically, v<sub>y</sub>² = (${v} sin ${a}°)² + 2 × 9.8 × ${h}, so v<sub>y</sub> = ${num(Math.sqrt(vy * vy + 2 * G * h))} m/s down. Speed = √(${num(vx)}² + ${num(Math.sqrt(vy * vy + 2 * G * h))}²) = <b>${num(sp)} m/s</b> (the same as √(v² + 2gh)).`,
        ...(type === 2 ? { tip: 'The sideways speed never changes; the vertical speed comes from v_y² = (v sin θ)² + 2gh.' } : {}),
        meta: { type: ['high-time', 'high-range', 'high-speed'][type], in: { h, v, a } },
      };
    }
    const vy = v * sin(a), t = (-vy + Math.sqrt(vy * vy + 2 * G * h)) / G;
    return {
      topic: T.high, text: `A stone is thrown from the top of a cliff ${h} m high at ${v} m/s, ${a}° <b>below</b> the horizontal. How long does it take to land?`,
      figure: scene({ v, a: -a, h0: h, to: v * cos(a) * t, cliff: true, dims: [heightDim(h, `${h} m`)] }),
      answer: numAns(t, 's'),
      solution: `Now it starts moving down at ${v} sin ${a}° = ${num(vy)} m/s. Taking down as positive, ${h} = ${num(vy)}t + 4.9t², so t = (−${num(vy)} + √(${num(vy)}² + 2 × 9.8 × ${h})) ÷ 9.8 = <b>${num(t)} s</b>.`,
      meta: { type: 'high-down-time', in: { h, v, a } },
    };
  },
];

export const projectileBank = bank('projectiles', templates, 260);
