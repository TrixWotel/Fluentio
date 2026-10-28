// Motion in a Straight Line: 12 topics, 20 variants each (240), all with constant acceleration: falling and throwing
// things up or down, speeding up and braking, trips in stages, and reading v–t graphs where the area and the slope say
// what happened. Every topic is asked several ways.
import { bank, combo, num, round, graph, span } from '../kit/bank.js';

const G = 9.8;
const numAns = (value, unit, tol = 0.02) => ({ kind: 'number', value: round(value, 4), unit, tol });
// (no answer within 3% of a number the question gives, so copying one out of the question isn't marked right)
const apart = (answer, ...given) => given.every((x) => Math.abs(Math.abs(answer) - Math.abs(x)) > 0.03 * Math.abs(answer));
// a topic's question types take turns (variant k is type k % types), each walking through its own number combinations
const turn = (ctx, types, lists, ok) => combo({ ...ctx, k: Math.floor(ctx.k / types), salt: `${ctx.salt}-${ctx.k % types}` }, lists, ok);
// a velocity–time graph through these points (the axes chosen so the marked points land on grid lines)
const vt = (pts, extra = {}) => {
  const all = [...pts, ...(extra.points || [])];
  return graph({ x: span(all.map((p) => p[0]), 6), y: span(all.map((p) => p[1]), 6), xLabel: 'time t (s)', yLabel: 'velocity v (m/s)', lines: [pts], ...extra });
};
const WHO = ['cyclist', 'skateboarder', 'car', 'scooter', 'runner', 'train', 'go-kart'];
const VEHICLES = ['car', 'motorbike', 'van', 'go-kart', 'sports car'];          // (for speeds and accelerations a runner, a bus or a train couldn't reach)
// a v–t graph drawn to its shape but without numbers on the axes (the question says what they are), for when a scale
// would give the answer away: the line, dashed guides from the marked corners to the axes, and their labels
function sketch(pts, marks) {
  const w = 520, h = 250, L = 46, R = 24, Tp = 18, B = 34, iw = w - L - R, ih = h - Tp - B;
  const tmax = Math.max(...pts.map((p) => p[0])), vmax = Math.max(...pts.map((p) => p[1])) * 1.12;
  const X = (t) => round(L + (t / tmax) * iw, 2), Y = (v) => round(Tp + ih - (v / vmax) * ih, 2);
  const out = [`<svg class="graph" viewBox="0 0 ${w} ${h}" role="img" aria-label="velocity against time, drawn to shape">`];
  for (const { at: [t, v], x, y } of marks) {
    out.push(`<line class="gr" x1="${X(t)}" y1="${Y(v)}" x2="${X(t)}" y2="${Y(0)}" stroke-dasharray="4 4"/><line class="gr" x1="${X(0)}" y1="${Y(v)}" x2="${X(t)}" y2="${Y(v)}" stroke-dasharray="4 4"/>`);
    if (x) out.push(`<text class="tk" x="${X(t)}" y="${Y(0) + 16}" text-anchor="middle">${x}</text>`);
    if (y) out.push(`<text class="tk" x="${L - 7}" y="${Y(v) + 4}" text-anchor="end">${y}</text>`);
  }
  out.push(`<line class="ax" x1="${L}" y1="${Y(0)}" x2="${L + iw}" y2="${Y(0)}"/><line class="ax" x1="${L}" y1="${Tp}" x2="${L}" y2="${Y(0)}"/>`);
  out.push(`<text class="tk" x="${L - 7}" y="${Y(0) + 4}" text-anchor="end">0</text><text class="al" x="${L + iw / 2}" y="${h - 6}" text-anchor="middle">time t (s)</text><text class="al" x="${L + 6}" y="${Tp + 4}">v (m/s)</text>`);
  out.push(`<polyline class="ln ln0" pathLength="1" points="${pts.map(([t, v]) => `${X(t)},${Y(v)}`).join(' ')}"/></svg>`);
  return out.join('');
}

const T = {
  graph: 'Distance and displacement from a v–t graph', down: 'Thrown down from a height', rest: 'Speeding up from rest',
  checkpoints: 'Between two checkpoints', caught: 'Thrown up and caught', sections: 'Equal times, three points',
  top: 'Up to the highest point', above: 'Thrown up from above the ground', stages: 'A trip in three stages',
  puzzle: 'Reading a four-part v–t graph', average: 'Using the average speed', bounce: 'Bouncing back up',
};

const templates = [
  // 1. distance adds up all the area under a v–t graph; displacement counts area below the axis as negative
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type < 2) {
      const [t1, e] = turn(ctx, 4, [[0.5, 0.6, 0.8, 1, 1.2], [0.5, 0.6, 0.75, 0.8]], (a, b) => apart(0.5 * G * a * a * (type === 0 ? 1 + b * b : 1 - b * b), a + a * b, a, G * a, G * a * b));   // (nor any number on the graph)
      const v1 = G * t1, v2 = e * v1, t2 = e * t1, down = 0.5 * t1 * v1, up = 0.5 * t2 * v2;
      const pts = [[0, 0], [t1, v1], [t1, -v2], [round(t1 + t2, 4), 0]];
      const ball = ['tennis ball', 'rubber ball', 'basketball', 'golf ball', 'bouncy ball'][ctx.k % 5];
      return {
        topic: T.graph, text: `A ${ball} is dropped and bounces. The graph shows its velocity, with downward as positive, from the moment it is let go until it reaches the top of its bounce, ${num(t1 + t2)} s later. ${type === 0 ? 'What total distance does it travel?' : 'At the top of the bounce, how far below the point it was dropped from is it?'}`,
        figure: vt(pts, { points: [[t1, v1, `(${num(t1)} s, ${num(v1)} m/s)`], [t1, -v2, `(${num(t1)} s, −${num(v2)} m/s)`], [round(t1 + t2, 4), 0, '']] }),
        answer: numAns(type === 0 ? down + up : down - up, 'm'),
        solution: `Falling: the triangle above the axis has area ½ × ${num(t1)} × ${num(v1)} = ${num(down)} m. Rising: it takes ${num(t1 + t2)} − ${num(t1)} = ${num(t2)} s, so the triangle below has area ½ × ${num(t2)} × ${num(v2)} = ${num(up)} m.`
          + (type === 0 ? ` Distance counts both, so it is ${num(down)} + ${num(up)} = <b>${num(down + up)} m</b>.` : ` Displacement subtracts the part below the axis (it moved back up), so it is ${num(down)} − ${num(up)} = <b>${num(down - up)} m</b> below where it started.`),
        meta: { type: type === 0 ? 'bounce-distance' : 'bounce-displacement', in: { t1, e } },
      };
    }
    const [V, U, a, b] = turn(ctx, 4, [[4, 6, 8, 10], [2, 3, 4, 5], [2, 3, 4], [4, 5, 6]], (x, y) => y < x);
    const t1 = a, t2 = t1 + b, t3 = t2 + 2, t4 = t3 + 2, t5 = t4 + 2;
    const fwd = 0.5 * t1 * V + b * V + 0.5 * 2 * V, back = 0.5 * 2 * U + 2 * U, who = WHO[ctx.k % WHO.length];
    const pts = [[0, 0], [t1, V], [t2, V], [t3, 0], [t4, -U], [t5, -U]];
    return {
      topic: T.graph, text: `The graph shows the velocity of a ${who} on a straight path: forward, then slowing, stopping and coming back. ${type === 2 ? `What total distance does the ${who} cover in the ${t5} s?` : `How far from the starting point is the ${who} after ${t5} s?`}`,
      figure: vt(pts, { points: [[t1, V, true], [t2, V, true], [t3, 0, true], [t4, -U, true], [t5, -U, true]] }),
      answer: numAns(type === 2 ? fwd + back : fwd - back, 'm'),
      solution: `The area above the axis (going forward) is ½ × ${t1} × ${V} + ${b} × ${V} + ½ × 2 × ${V} = ${num(fwd)} m. The area below (coming back) is ½ × 2 × ${U} + 2 × ${U} = ${num(back)} m.`
        + (type === 2 ? ` Distance adds them: ${num(fwd)} + ${num(back)} = <b>${num(fwd + back)} m</b>.` : ` Displacement subtracts the way back: ${num(fwd)} − ${num(back)} = <b>${num(fwd - back)} m</b> from the start.`),
      meta: { type: type === 2 ? 'reverse-distance' : 'reverse-displacement', in: { V, U, a, b } },
    };
  },

  // 2. thrown down: it starts with a speed, and g adds to it
  (d, ctx) => {
    const type = ctx.k % 4;
    const [u, h] = turn(ctx, 4, [[3, 4, 5, 6, 8, 8.4, 10], [5, 8, 10, 12, 15, 20]], (U, H) => {
      const v = Math.sqrt(U * U + 2 * G * H), t = (v - U) / G, vv = round(v, 1);
      return [apart(v, U, H), apart(t, U, H), apart((vv * vv - U * U) / (2 * G), U, vv), apart(Math.sqrt((2 * H) / G) - t, U, H)][type];
    });
    const v = Math.sqrt(u * u + 2 * G * h), t = (v - u) / G;
    if (type === 0) {
      return {
        topic: T.down, text: `A ball is thrown straight down at ${num(u)} m/s from a point ${h} m above the ground. How fast is it moving when it hits the ground?`,
        answer: numAns(v, 'm/s'),
        solution: `Taking down as positive, v² = u² + 2gh = ${num(u)}² + 2 × 9.8 × ${h} = ${num(v * v)}. So v = √${num(v * v)} = <b>${num(v)} m/s</b>.`,
        meta: { type: 'down-speed', in: { u, h } },
      };
    }
    if (type === 1) {
      return {
        topic: T.down, text: `A ball is thrown straight down at ${num(u)} m/s from a point ${h} m above the ground. How long does it take to reach the ground?`,
        answer: numAns(t, 's'),
        solution: `First find the landing speed, v = √(${num(u)}² + 2 × 9.8 × ${h}) = ${num(v)} m/s. Then v = u + gt gives t = (${num(v)} − ${num(u)}) ÷ 9.8 = <b>${num(t)} s</b>.`,
        meta: { type: 'down-time', in: { u, h } },
      };
    }
    if (type === 2) {
      const vv = round(v, 1), hh = (vv * vv - u * u) / (2 * G);
      return {
        topic: T.down, text: `A stone thrown straight down from a bridge at ${num(u)} m/s hits the water at ${num(vv)} m/s. How high is the bridge above the water?`,
        answer: numAns(hh, 'm'),
        solution: `v² = u² + 2gh, so h = (v² − u²) ÷ (2g) = (${num(vv)}² − ${num(u)}²) ÷ 19.6 = <b>${num(hh)} m</b>.`,
        meta: { type: 'down-height', in: { u, v: vv } },
      };
    }
    const td = Math.sqrt((2 * h) / G);
    return {
      topic: T.down, text: `From ${h} m up, one ball is dropped and another is thrown straight down at ${num(u)} m/s at the same moment. How much sooner does the thrown ball land?`,
      answer: numAns(td - t, 's'),
      solution: `Dropped: t = √(2 × ${h} / 9.8) = ${num(td)} s. Thrown: it lands at √(${num(u)}² + 2 × 9.8 × ${h}) = ${num(v)} m/s, after (${num(v)} − ${num(u)}) ÷ 9.8 = ${num(t)} s. Difference: ${num(td)} − ${num(t)} = <b>${num(td - t)} s</b>.`,
      meta: { type: 'down-sooner', in: { u, h } },
    };
  },

  // 3. speeding up steadily from rest: s = ½at² gives the acceleration, then v = at or v² = 2as (down a slope, so no
  // faster than 3 m/s², and never past 18 m/s)
  (d, ctx) => {
    const type = ctx.k % 4, who = ['skier', 'sled', 'cyclist', 'toboggan', 'snowboarder'][ctx.k % 5];
    const accel = (S, Tt) => (2 * S) / (Tt * Tt), slope = (S, Tt) => accel(S, Tt) <= 3;
    const [s, t, X] = turn(ctx, 4, [[6, 8, 9, 10, 12, 16, 18], [2, 3, 4, 5], type === 1 ? [4, 5, 6, 8, 10] : type === 3 ? [0] : [8, 10, 12, 15, 18]],
      (S, Tt, x) => slope(S, Tt) && (type === 1 ? accel(S, Tt) * x <= 18 : type === 3 || x / accel(S, Tt) <= 30)
        && apart([x / accel(S, Tt), accel(S, Tt) * x, (x * x) / (2 * accel(S, Tt)), accel(S, Tt)][type], S, Tt, ...(type === 3 ? [] : [x])));
    const a = accel(s, t);
    if (type === 0) {
      const V = X, TT = V / a;
      return {
        topic: T.rest, text: `A ${who} starts from rest and goes ${s} m down a slope in the first ${t} s, speeding up steadily. How long after starting does the ${who} reach ${V} m/s?`,
        answer: numAns(TT, 's'),
        solution: `From rest, s = ½at², so a = 2s/t² = 2 × ${s} / ${t}² = ${num(a, 3)} m/s². Then v = at gives t = ${V} ÷ ${num(a, 3)} = <b>${num(TT)} s</b>.`,
        meta: { type: 'time-to-speed', in: { s, t, V } },
      };
    }
    if (type === 1) {
      const TT = X, v = a * TT;
      return {
        topic: T.rest, text: `A ${who} starts from rest and covers ${s} m in the first ${t} s, speeding up steadily. How fast is the ${who} going ${TT} s after starting?`,
        answer: numAns(v, 'm/s'),
        solution: `From rest, s = ½at², so a = 2s/t² = 2 × ${s} / ${t}² = ${num(a, 3)} m/s². After ${TT} s, v = at = ${num(a, 3)} × ${TT} = <b>${num(v)} m/s</b>.`,
        meta: { type: 'speed-after', in: { s, t, TT } },
      };
    }
    if (type === 2) {
      const V = X, x = (V * V) / (2 * a);
      return {
        topic: T.rest, text: `A ${who} starts from rest and covers ${s} m in the first ${t} s, speeding up steadily. How far does the ${who} go before reaching ${V} m/s?`,
        answer: numAns(x, 'm'),
        solution: `From rest, s = ½at², so a = 2s/t² = 2 × ${s} / ${t}² = ${num(a, 3)} m/s². Then v² = 2as gives s = ${V}² ÷ (2 × ${num(a, 3)}) = <b>${num(x)} m</b>.`,
        meta: { type: 'distance-to-speed', in: { s, t, V } },
      };
    }
    return {
      topic: T.rest, text: `A ${who} starts from rest and speeds up steadily, covering ${s} m in ${t} s. What is the ${who}’s acceleration?`,
      answer: numAns(a, 'm/s²'),
      solution: `From rest, s = ½at², so a = 2s/t² = 2 × ${s} ÷ ${t}² = <b>${num(a)} m/s²</b>.`,
      meta: { type: 'accel-from-rest', in: { s, t } },
    };
  },

  // 4. between two checkpoints: s = ut + ½at², and s = ½(u + v)t (a speed at the second checkpoint that's a whole or a
  // half, and no more than 3 m/s²)
  (d, ctx) => {
    const type = ctx.k % 4;
    const [s, t, u] = turn(ctx, 4, [[30, 40, 50, 60, 80, 100], [3, 4, 5, 6], [2, 4, 5, 6, 8]], (S, Tt, U) => {
      const V = (2 * S) / Tt - U;
      return V >= U + 1 && Number.isInteger(round(2 * V, 9)) && (V - U) / Tt <= 3
        && [apart((V - U) / Tt, S, Tt, U), apart(V, S, Tt, U), apart(U, S, Tt, V), apart(Tt, S, U, V)][type];
    });
    const v = (2 * s) / t - u, a = (v - u) / t, who = VEHICLES[ctx.k % VEHICLES.length];
    const setup = `A ${who} speeding up steadily passes two checkpoints ${s} m apart`;
    if (type === 0) {
      return {
        topic: T.checkpoints, text: `${setup}, ${t} s apart. Its speed at the first checkpoint is ${u} m/s. What is its acceleration?`,
        answer: numAns(a, 'm/s²'),
        solution: `Use s = ut + ½at² with u = ${u} m/s and t = ${t} s, so ${s} = ${u} × ${t} + ½ × a × ${t}² = ${u * t} + ${num((t * t) / 2)}a. So a = (${s} − ${u * t}) ÷ ${num((t * t) / 2)} = <b>${num(a)} m/s²</b>.`,
        meta: { type: 'checkpoint-accel', in: { s, t, u } },
      };
    }
    if (type === 1) {
      return {
        topic: T.checkpoints, text: `${setup}, ${t} s apart. Its speed at the first checkpoint is ${u} m/s. How fast is it going at the second?`,
        answer: numAns(v, 'm/s'),
        solution: `With steady acceleration, distance = average speed × time: ${s} = ½(${u} + v) × ${t}, so v = 2 × ${s} ÷ ${t} − ${u} = <b>${num(v)} m/s</b>.`,
        meta: { type: 'checkpoint-v', in: { s, t, u } },
      };
    }
    if (type === 2) {
      return {
        topic: T.checkpoints, text: `${setup}, ${t} s apart. It passes the second checkpoint at ${num(v)} m/s. How fast was it going at the first?`,
        answer: numAns(u, 'm/s'),
        solution: `With steady acceleration, distance = average speed × time: ${s} = ½(u + ${num(v)}) × ${t}, so u = 2 × ${s} ÷ ${t} − ${num(v)} = <b>${num(u)} m/s</b>.`,
        meta: { type: 'checkpoint-u', in: { s, t, v } },
      };
    }
    return {
      topic: T.checkpoints, text: `${setup}: at ${u} m/s at the first and ${num(v)} m/s at the second. How long does it take to go from one to the other?`,
      answer: numAns(t, 's'),
      solution: `Average speed = ½(${u} + ${num(v)}) = ${num((u + v) / 2)} m/s, so t = ${s} ÷ ${num((u + v) / 2)} = <b>${num(t)} s</b>.`,
      meta: { type: 'checkpoint-time', in: { s, u, v } },
    };
  },

  // 5. thrown up and caught: v² = u² − 2gh for the speed, the quadratic for the time (two answers: up and down)
  (d, ctx) => {
    const type = ctx.k % 4;
    const [u, h] = turn(ctx, 4, [[12, 15, 18, 20, 25], [2, 3, 5, 8, 10]], (U, H) => U * U > 2 * G * H + 20);
    const vAt = Math.sqrt(u * u - 2 * G * h), down = (u + vAt) / G, up = (u - vAt) / G;
    if (type === 0) {
      return {
        topic: T.caught, text: `A stone is thrown straight up at ${u} m/s and caught on its way down at a point ${h} m above where it was thrown. How fast is it moving when it is caught?`,
        answer: numAns(vAt, 'm/s'),
        solution: `Taking up as positive, v² = u² − 2gh = ${u}² − 2 × 9.8 × ${h} = ${num(vAt * vAt)} at that height. So the speed is √${num(vAt * vAt)} = <b>${num(vAt)} m/s</b> (moving down).`,
        tip: 'Use v² = u² − 2gh: at a given height the speed is the same on the way up and on the way down.',
        meta: { type: 'caught-speed', in: { u, h } },
      };
    }
    if (type === 1) {
      return {
        topic: T.caught, text: `A stone is thrown straight up at ${u} m/s and caught on its way down at a point ${h} m above where it was thrown. How long was it in the air?`,
        answer: numAns(down, 's'),
        solution: `Using h = ut − ½gt², ${h} = ${u}t − 4.9t². It is at ${h} m twice, on the way up and on the way down. Caught on the way down is the later root: t = (${u} + √(${u}² − 2 × 9.8 × ${h})) ÷ 9.8 = <b>${num(down)} s</b>.`,
        meta: { type: 'caught-time', in: { u, h } },
      };
    }
    if (type === 2) {
      return {
        topic: T.caught, text: `A ball is thrown straight up at ${u} m/s. How long after it is thrown does it first pass a window ${h} m above the thrower’s hand?`,
        answer: numAns(up, 's'),
        solution: `${h} = ${u}t − 4.9t² has two roots; the first, on the way up, is t = (${u} − √(${u}² − 2 × 9.8 × ${h})) ÷ 9.8 = <b>${num(up)} s</b>. (It passes again on the way down at ${num(down)} s.)`,
        meta: { type: 'first-pass', in: { u, h } },
      };
    }
    const vb = Math.sqrt(u * u + 2 * G * h);
    return {
      topic: T.caught, text: `From a balcony, a ball is thrown straight up at ${u} m/s. On the way down it falls past the balcony and is caught ${h} m below it. How fast is it moving when caught?`,
      answer: numAns(vb, 'm/s'),
      solution: `It comes back past the balcony at ${u} m/s (the way down mirrors the way up), then falls ${h} m more: v² = ${u}² + 2 × 9.8 × ${h} = ${num(vb * vb)}, so v = √${num(vb * vb)} = <b>${num(vb)} m/s</b>.`,
      tip: 'On the way down it passes the balcony at the speed it was thrown, then speeds up over the extra drop.',
      meta: { type: 'caught-below', in: { u, h } },
    };
  },

  // 6. equal times on a straight road: the distances in equal times differ by a·t²
  (d, ctx) => {
    const type = ctx.k % 4, who = VEHICLES[ctx.k % VEHICLES.length];
    if (type === 0) {
      const [[p, q], vB, t] = turn(ctx, 4, [[[4, 5], [3, 4], [2, 3], [5, 7], [7, 9]], [3, 4, 4.5, 5, 6], [2, 3, 4]]);
      const r = p / q, a = (2 * vB * (1 - r)) / (t * (1 + r));
      return {
        topic: T.sections, text: `A ${who} with constant acceleration passes points A, B and C on a straight road, taking ${t} s for each of AB and BC. It passes B at ${num(vB)} m/s, and AB is ${p}/${q} of BC. What is its acceleration?`,
        answer: numAns(a, 'm/s²'),
        solution: `Measuring from B, AB = ${num(vB)} × ${t} − ½a × ${t}² (it was slower before B) and BC = ${num(vB)} × ${t} + ½a × ${t}². AB is ${p}/${q} of BC, so ${q} × AB = ${p} × BC, which gives ${q}(${num(vB * t)} − ${num((t * t) / 2)}a) = ${p}(${num(vB * t)} + ${num((t * t) / 2)}a). Multiplying out, ${num(q * vB * t)} − ${num((q * t * t) / 2)}a = ${num(p * vB * t)} + ${num((p * t * t) / 2)}a. Gathering the a terms, ${num((q - p) * vB * t)} = ${num(((p + q) * t * t) / 2)}a, so a = ${num((q - p) * vB * t)} ÷ ${num(((p + q) * t * t) / 2)} = <b>${num(a)} m/s²</b>.`,
        meta: { type: 'ratio-accel', in: { p, q, vB, t } },
      };
    }
    const [s1, gap, t] = turn(ctx, 4, [[12, 16, 18, 20, 24, 30], [2, 4, 6, 8], [2, 3, 4]], (S1, Gp) => 3 * S1 > S1 + Gp + 1);
    const s2 = s1 + gap, a = gap / (t * t), vB = (s1 + s2) / (2 * t), vA = vB - a * t;
    const ask = ['', 'What is its acceleration?', 'How fast is it going at B?', 'How fast is it going at A?'][type];
    return {
      topic: T.sections, text: `A ${who} with constant acceleration passes points A, B and C on a straight road. It takes ${t} s to cover AB = ${s1} m and another ${t} s to cover BC = ${s2} m. ${ask}`,
      answer: type === 1 ? numAns(a, 'm/s²') : type === 2 ? numAns(vB, 'm/s') : numAns(vA, 'm/s'),
      solution: type === 1 ? `In equal times, the distances differ by at²: ${s2} − ${s1} = a × ${t}², so a = ${gap} ÷ ${t * t} = <b>${num(a)} m/s²</b>.`
        : type === 2 ? `B is the middle moment of the ${2 * t} s, and with steady acceleration the speed then is the average speed over it: (${s1} + ${s2}) ÷ ${2 * t} = <b>${num(vB)} m/s</b>.`
          : `The speed at B is (${s1} + ${s2}) ÷ ${2 * t} = ${num(vB)} m/s and a = (${s2} − ${s1}) ÷ ${t}² = ${num(a)} m/s². A was ${t} s earlier, so its speed there was ${num(vB)} − ${num(a)} × ${t} = <b>${num(vA)} m/s</b>.`,
      meta: { type: ['', 'sections-accel', 'sections-vB', 'sections-vA'][type], in: { s1, s2, t } },
    };
  },

  // 7. up to the highest point: gravity takes away 9.8 m/s every second until the velocity is zero
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type < 2) {
      const [t] = turn(ctx, 4, [[0.5, 1, 1.5, 2, 2.5, 3, 3.5]], (x) => apart(type === 0 ? G * x : 0.5 * G * x * x, x)), u = G * t, H = 0.5 * G * t * t;
      return {
        topic: T.top, text: `A particle is projected straight up from the ground and reaches its greatest height after ${num(t)} s. ${type === 0 ? 'How fast was it projected?' : 'What is its greatest height?'}`,
        answer: type === 0 ? numAns(u, 'm/s') : numAns(H, 'm'),
        solution: type === 0 ? `At the top v = 0, so 0 = u − gt: u = 9.8 × ${num(t)} = <b>${num(u)} m/s</b>.`
          : `It was projected at 9.8 × ${num(t)} = ${num(u)} m/s, and its average speed on the way up is half that: H = ½ × ${num(u)} × ${num(t)} = <b>${num(H)} m</b> (or ½gt²).`,
        meta: { type: type === 0 ? 'speed-from-top-time' : 'height-from-top-time', in: { t } },
      };
    }
    const [H] = turn(ctx, 4, [[5, 8, 10, 12.8, 15, 20, 45]], (x) => apart(type === 2 ? Math.sqrt(2 * G * x) : Math.sqrt((2 * x) / G), x)), u = Math.sqrt(2 * G * H), t = Math.sqrt((2 * H) / G);
    return {
      topic: T.top, text: `A ball thrown straight up reaches ${num(H)} m above the point where it was released. ${type === 2 ? 'How fast was it thrown?' : 'How long did it take to get that high?'}`,
      answer: type === 2 ? numAns(u, 'm/s') : numAns(t, 's'),
      solution: type === 2 ? `At the top v = 0, so 0 = u² − 2gH and u = √(2 × 9.8 × ${num(H)}) = <b>${num(u)} m/s</b>.` : `The way up takes as long as falling back down from rest: H = ½gt², so t = √(2 × ${num(H)} / 9.8) = <b>${num(t)} s</b>.`,
      meta: { type: type === 2 ? 'speed-from-height' : 'time-from-height', in: { H } },
    };
  },

  // 8. thrown up from above the ground: measure heights from the ground and keep the starting height in
  (d, ctx) => {
    const type = ctx.k % 4;
    const [u, h0] = turn(ctx, 4, [[4, 5, 6, 8, 10], [1.5, 2, 2.8, 3.5, 5]]), top = h0 + (u * u) / (2 * G);
    if (type === 0) {
      return {
        topic: T.above, text: `A particle is projected straight up at ${u} m/s from a point ${num(h0)} m above the ground. What is the greatest height above the ground that it reaches?`,
        answer: numAns(top, 'm'),
        solution: `It rises u² ÷ (2g) = ${u}² ÷ 19.6 = ${num((u * u) / (2 * G))} m above its starting point. So its greatest height is ${num(h0)} + ${num((u * u) / (2 * G))} = <b>${num(top)} m</b> above the ground.`,
        meta: { type: 'top-above-ground', in: { u, h0 } },
      };
    }
    if (type === 1) {
      const H = round(h0 + ((u * u) / (2 * G)) * [0.35, 0.5, 0.64, 0.75][ctx.k % 4], 1), dt = (2 * Math.sqrt(u * u - 2 * G * (H - h0))) / G;
      return {
        topic: T.above, text: `A particle is projected straight up at ${u} m/s from a point ${num(h0)} m above the ground. For how long is it more than ${num(H)} m above the ground?`,
        answer: numAns(dt, 's'),
        solution: `${num(H)} m above the ground is ${num(H)} − ${num(h0)} = ${num(H - h0)} m above the start. It is there when ${num(H - h0)} = ${u}t − 4.9t², at two times; between them it is higher. The quadratic formula gives t = (${u} ± √(${u}² − 2 × 9.8 × ${num(H - h0)})) ÷ 9.8, so the two times differ by 2√(${u * u} − ${num(2 * G * (H - h0))}) ÷ 9.8 = <b>${num(dt)} s</b>.`,
        meta: { type: 'time-above', in: { u, h0, H } },
      };
    }
    const vg = Math.sqrt(u * u + 2 * G * h0), t = (u + vg) / G;
    return {
      topic: T.above, text: `A particle is projected straight up at ${u} m/s from a point ${num(h0)} m above the ground. ${type === 2 ? 'How long is it until it hits the ground?' : 'How fast is it moving when it hits the ground?'}`,
      answer: type === 2 ? numAns(t, 's') : numAns(vg, 'm/s'),
      solution: type === 2 ? `Taking up as positive, the ground is ${num(h0)} m below, so −${num(h0)} = ${u}t − 4.9t². The positive root is t = (${u} + √(${u}² + 2 × 9.8 × ${num(h0)})) ÷ 9.8 = <b>${num(t)} s</b>.`
        : `It ends ${num(h0)} m below where it started, so v² = u² + 2g × ${num(h0)} = ${u}² + ${num(2 * G * h0)} = ${num(u * u + 2 * G * h0)}. So v = √${num(u * u + 2 * G * h0)} = <b>${num(vg)} m/s</b>.`,
      meta: { type: type === 2 ? 'time-to-ground' : 'speed-at-ground', in: { u, h0 } },
    };
  },

  // 9. a trip in three stages: speed up, cruise, brake; the cruise gives the top speed (speeding up at no more than
  // 2.5 m/s², braking at no more than 6)
  (d, ctx) => {
    const type = ctx.k % 4;
    const [s1, s2, t2, k] = turn(ctx, 4, [[40, 50, 60, 80, 100], [300, 400, 500, 600], [20, 25, 30, 40], [2, 3]], (A, B, C, K) => {
      const V = B / C, a = (V * V) / (2 * A);
      return V % 0.5 === 0 && a <= 2.5 && K * a <= 6 && apart([a, V / a + C + V / (K * a), A + B + A / K, V / (K * a)][type], A, B, C, K);
    });
    const V = s2 / t2, a = (V * V) / (2 * s1), tA = V / a, tC = V / (k * a), who = VEHICLES[ctx.k % VEHICLES.length];
    const setup = `A ${who} starts from rest and speeds up at a steady a m/s² for ${s1} m, then travels ${s2} m at a constant speed, which takes ${t2} s, then brakes to rest at a steady ${k}a m/s².`;
    const find = `The cruise gives the top speed, V = ${s2} ÷ ${t2} = ${num(V)} m/s. Speeding up from rest over ${s1} m, V² = 2a × ${s1}, so a = ${num(V)}² ÷ ${2 * s1} = ${num(a, 3)} m/s².`;
    if (type === 0) return { topic: T.stages, text: `${setup} Find a.`, answer: numAns(a, 'm/s²'), solution: find.replace(`${num(a, 3)} m/s².`, `<b>${num(a, 3)} m/s²</b>.`), meta: { type: 'stages-a', in: { s1, s2, t2, k } } };
    if (type === 1) {
      return {
        topic: T.stages, text: `${setup} For how long is it moving altogether?`, answer: numAns(tA + t2 + tC, 's'),
        solution: `${find} Speeding up takes V ÷ a = ${num(V)} ÷ ${num(a, 3)} = ${num(tA)} s, and braking at ${k}a takes 1/${k} as long, ${num(tA)} ÷ ${k} = ${num(tC)} s. Total: ${num(tA)} + ${t2} + ${num(tC)} = <b>${num(tA + t2 + tC)} s</b>.`,
        meta: { type: 'stages-time', in: { s1, s2, t2, k } },
      };
    }
    if (type === 2) {
      return {
        topic: T.stages, text: `${setup} How far does it travel altogether?`, answer: numAns(s1 + s2 + s1 / k, 'm'),
        solution: `${find} Braking at ${k}a from V takes V² ÷ (2 × ${k}a) = ${num(V)}² ÷ (2 × ${num(k * a, 3)}) = ${num(s1 / k)} m (1/${k} of the ${s1} m it took to speed up). Total: ${s1} + ${s2} + ${num(s1 / k)} = <b>${num(s1 + s2 + s1 / k)} m</b>.`,
        meta: { type: 'stages-distance', in: { s1, s2, t2, k } },
      };
    }
    return {
      topic: T.stages, text: `${setup} How long does the braking take?`, answer: numAns(tC, 's'),
      solution: `${find} Braking at ${k} × ${num(a, 3)} = ${num(k * a, 3)} m/s² from ${num(V)} m/s takes ${num(V)} ÷ ${num(k * a, 3)} = <b>${num(tC)} s</b>.`,
      meta: { type: 'stages-brake-time', in: { s1, s2, t2, k } },
    };
  },

  // 10. a four-part v–t graph: slopes are accelerations, areas are distances, and a condition on the areas finds V
  (d, ctx) => {
    const type = ctx.k % 4;
    const [V1, acc, t2, V, t4] = turn(ctx, 4, [[16, 20, 24, 30], [1, 2, 2.5, 4], [4, 5, 6], [8, 10, 12, 15], [4, 5, 6, 8]], (P, A, Q, W, R) => {
      const t3 = (P * (P / A) + (P + W) * Q) / W - R / 2;
      const total = 0.5 * P * (P / A) + 0.5 * (P + W) * Q + W * t3 + 0.5 * W * R;
      return W < P && Number.isInteger(P / A) && P / A <= 20 && t3 > 0 && t3 <= 60 && Math.abs(t3 * 2 - Math.round(t3 * 2)) < 1e-9
        && apart([P / A, W, total, (P - W) / Q][type], A, P, Q, t3, R, ...(type === 1 ? [] : [W]));
    });
    const TT = V1 / acc, t3 = (V1 * TT + (V1 + V) * t2) / V - t4 / 2, first = 0.5 * V1 * TT + 0.5 * (V1 + V) * t2, total = first + V * t3 + 0.5 * V * t4;
    const ends = [TT, TT + t2, TT + t2 + t3, TT + t2 + t3 + t4];
    const describe = `The graph models a car: from rest it speeds up at ${num(acc)} m/s² to ${V1} m/s, taking T s; it slows steadily for ${t2} s to ${type === 1 ? 'V' : V} m/s; travels at that speed for ${num(t3)} s; then slows steadily to rest in ${t4} s.`;
    const fig = sketch([[0, 0], [ends[0], V1], [ends[1], V], [ends[2], V], [ends[3], 0]], [
      { at: [ends[0], V1], x: type === 0 ? 'T' : num(ends[0]), y: num(V1) }, { at: [ends[1], V], x: type === 0 ? '' : num(ends[1]), y: type === 1 ? 'V' : num(V) },
      { at: [ends[2], V], x: type < 2 ? '' : num(ends[2]) }, { at: [ends[3], 0], x: type < 2 ? '' : num(ends[3]) },
    ]);
    if (type === 0) {
      return { topic: T.puzzle, text: `${describe} Find T.`, figure: fig, answer: numAns(TT, 's'), solution: `The first part’s slope is the acceleration: ${V1} ÷ T = ${num(acc)}, so T = <b>${num(TT)} s</b>.`, meta: { type: 'puzzle-T', in: { V1, acc } } };
    }
    if (type === 1) {
      return {
        topic: T.puzzle, text: `${describe} The distance it covers before it starts moving at a constant speed is one third of its total distance. Find V.`, figure: fig,
        answer: numAns(V, 'm/s'),
        solution: `T = ${V1} ÷ ${num(acc)} = ${num(TT)} s. The distance before the constant speed is ½ × ${num(TT)} × ${V1} + ½(${V1} + V) × ${t2}. The distance after it is ${num(t3)}V + ½ × ${t4} × V. One third of the total means the part after is twice the part before: ${num(t3)}V + ${num(t4 / 2)}V = 2(${num(0.5 * V1 * TT)} + ${num(t2 / 2)}(${V1} + V)). Multiplying out, ${num(t3 + t4 / 2)}V = ${num(V1 * TT + V1 * t2)} + ${t2}V, so ${num(t3 + t4 / 2 - t2)}V = ${num(V1 * TT + V1 * t2)} and V = <b>${num(V)} m/s</b>.`,
        meta: { type: 'puzzle-V', in: { V1, acc, t2, t3, t4 } },
      };
    }
    if (type === 2) {
      return {
        topic: T.puzzle, text: `${describe} How far does the car travel altogether?`, figure: fig, answer: numAns(total, 'm'),
        solution: `Add the areas: ½ × ${num(TT)} × ${V1} + ½(${V1} + ${V}) × ${t2} + ${V} × ${num(t3)} + ½ × ${t4} × ${V} = ${num(0.5 * V1 * TT)} + ${num(0.5 * (V1 + V) * t2)} + ${num(V * t3)} + ${num(0.5 * V * t4)} = <b>${num(total)} m</b>.`,
        meta: { type: 'puzzle-total', in: { V1, acc, t2, V, t3, t4 } },
      };
    }
    return {
      topic: T.puzzle, text: `${describe} What is the size of its deceleration in the second part?`, figure: fig, answer: numAns((V1 - V) / t2, 'm/s²'),
      solution: `It drops from ${V1} to ${V} m/s in ${t2} s: (${V1} − ${V}) ÷ ${t2} = <b>${num((V1 - V) / t2)} m/s²</b>.`,
      meta: { type: 'puzzle-decel', in: { V1, V, t2 } },
    };
  },

  // 11. with steady acceleration the average speed is halfway between the start and the end: s = ½(u + v)t (speeding up
  // at no more than 3 m/s², braking at 2 to 7)
  (d, ctx) => {
    const type = ctx.k % 4, who = VEHICLES[ctx.k % VEHICLES.length];
    if (type === 3) {
      const [v, t] = turn(ctx, 4, [[12, 15, 16, 20, 24, 25, 30], [3, 4, 5, 6, 8]], (V, Tt) => V / Tt >= 2 && V / Tt <= 7 && apart(Tt, V, 0.5 * V * Tt)), s = 0.5 * v * t;
      return { topic: T.average, text: `A ${who} moving at ${v} m/s brakes steadily and stops in ${num(s)} m. How long does it take to stop?`, answer: numAns(t, 's'), solution: `Its average speed while braking is ½(${v} + 0) = ${num(v / 2)} m/s, so t = ${num(s)} ÷ ${num(v / 2)} = <b>${num(t)} s</b>.`, meta: { type: 'average-stop', in: { v, s } } };
    }
    const [u, v, t] = turn(ctx, 4, [[0, 2, 4, 5, 8, 10], [12, 15, 16, 20, 24, 30], [3, 4, 5, 6, 8]], (U, V, Tt) => {
      const S = 0.5 * (U + V) * Tt;
      return (V - U) / Tt <= 3 && [apart(S, U, V, Tt), apart(Tt, U, V, S), apart(V, U, S, Tt)][type];
    }), s = 0.5 * (u + v) * t;
    const from = u === 0 ? 'from rest' : `from ${u} m/s`;
    if (type === 0) return { topic: T.average, text: `A ${who} speeds up steadily ${from} to ${v} m/s in ${t} s. How far does it travel in that time?`, answer: numAns(s, 'm'), solution: `Average speed = ½(${u} + ${v}) = ${num((u + v) / 2)} m/s, so s = ${num((u + v) / 2)} × ${t} = <b>${num(s)} m</b>.`, meta: { type: 'average-distance', in: { u, v, t } } };
    if (type === 1) return { topic: T.average, text: `A ${who} speeds up steadily ${from} to ${v} m/s while covering ${num(s)} m. How long does that take?`, answer: numAns(t, 's'), solution: `Average speed = ½(${u} + ${v}) = ${num((u + v) / 2)} m/s. So t = s ÷ average speed = ${num(s)} ÷ ${num((u + v) / 2)} = <b>${num(t)} s</b>.`, meta: { type: 'average-time', in: { u, v, s } } };
    return { topic: T.average, text: u === 0 ? `A ${who} starts from rest, speeds up steadily and covers ${num(s)} m in ${t} s. How fast is it going at the end?` : `A ${who} moving at ${u} m/s speeds up steadily and covers ${num(s)} m in the next ${t} s. How fast is it going at the end?`, answer: numAns(v, 'm/s'), solution: `s = ½(u + v)t, so v = 2s ÷ t − u = 2 × ${num(s)} ÷ ${t} − ${u} = <b>${num(v)} m/s</b>.`, meta: { type: 'average-final', in: { u, s, t } } };
  },

  // 12. bouncing: up from the ground at the rebound speed, and a big change in velocity in a short time
  (d, ctx) => {
    const type = ctx.k % 4;
    if (type === 1) {
      const [h, v2, ms] = turn(ctx, 4, [[1, 1.5, 2, 3, 5], [2, 3, 4, 4.2, 5], [10, 15, 20, 25]], (H, V) => V * V < 2 * G * H);
      const v1 = Math.sqrt(2 * G * h), acc = (v1 + v2) / (ms / 1000);
      return {
        topic: T.bounce, text: `A ball is dropped from ${num(h)} m. It is in contact with the floor for ${ms} ms and leaves it at ${num(v2)} m/s upward. What is the size of its average acceleration while in contact?`,
        answer: numAns(acc, 'm/s²'),
        solution: `It hits the floor at √(2 × 9.8 × ${num(h)}) = ${num(v1)} m/s downward. Its velocity goes from ${num(v1)} m/s down to ${num(v2)} m/s up, a change of ${num(v1)} + ${num(v2)} = ${num(v1 + v2)} m/s. That takes ${ms} ms = ${num(ms / 1000, 3)} s, so a = ${num(v1 + v2)} ÷ ${num(ms / 1000, 3)} = <b>${num(acc, 0)} m/s²</b>.`,
        meta: { type: 'contact-accel', in: { h, v2, ms } },
      };
    }
    const [v2] = turn(ctx, 4, [[2.5, 3, 3.5, 4, 4.2, 5, 6]]), H = (v2 * v2) / (2 * G);
    if (type === 0) return { topic: T.bounce, text: `A ball leaves the ground at ${num(v2)} m/s straight up after a bounce. How high does it rise?`, answer: numAns(H, 'm'), solution: `At the top v = 0, so 0 = ${num(v2)}² − 2gH. So H = ${num(v2)}² ÷ 19.6 = <b>${num(H)} m</b>.`, tip: 'At the top of the bounce v = 0, so v² = u² − 2gH gives the height.', meta: { type: 'rebound-height', in: { v2 } } };
    if (type === 2) {
      const Hh = round(H, 2), v = Math.sqrt(2 * G * Hh);
      return { topic: T.bounce, text: `After a bounce, a ball rises ${num(Hh)} m above the ground. How fast did it leave the ground?`, answer: numAns(v, 'm/s'), solution: `At the top v = 0, so 0 = v² − 2g × ${num(Hh)} and v = √(2 × 9.8 × ${num(Hh)}) = <b>${num(v)} m/s</b>.`, tip: 'At the top of the bounce v = 0, so v² = u² − 2gH, read backwards, gives the speed it left with.', meta: { type: 'rebound-speed', in: { H: Hh } } };
    }
    return { topic: T.bounce, text: `A ball leaves the ground at ${num(v2)} m/s straight up after a bounce. How long does it take to reach the top of the bounce?`, answer: numAns(v2 / G, 's'), solution: `Gravity takes away 9.8 m/s every second until it stops at the top, so that takes ${num(v2)} ÷ 9.8 = <b>${num(v2 / G)} s</b>.`, tip: 'Gravity takes 9.8 m/s off the upward speed every second until it is zero at the top.', meta: { type: 'rebound-time', in: { v2 } } };
  },
];

export const motionBank = bank('motion', templates, 240);
