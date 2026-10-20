// Kinematics with motion graphs: 12 kinds of question, 20 variants each (240). Every variant draws its own graph,
// built so the numbers you need sit exactly on grid lines.
import { bank, combo, graph, span, num, round } from '../kit/bank.js';

const G = 9.8;
// a graph through these points, with axes chosen so the corners and the marked points land on grid lines
const along = (pts, extra) => [...pts, ...(extra.points || [])];
const vt = (pts, extra = {}) => graph({ x: span(along(pts, extra).map((p) => p[0]), 6), y: span(along(pts, extra).map((p) => p[1]), 6), xLabel: 'time t (s)', yLabel: 'velocity v (m/s)', lines: [pts], ...extra });
const xt = (pts, extra = {}) => graph({ x: span(along(pts, extra).map((p) => p[0]), 6), y: span(along(pts, extra).map((p) => p[1]), 6), xLabel: 'time t (s)', yLabel: 'position x (m)', lines: [pts], ...extra });
const numAns = (value, unit, tol = 0.02) => ({ kind: 'number', value: round(value, 4), unit, tol });
const CART = ['cart', 'toy car', 'runner', 'cyclist', 'robot', 'skateboarder', 'train', 'drone'];

const templates = [
  // 1. velocity is the slope of a position–time graph
  (d) => {
    const T = d.pick([2, 4, 6, 8, 10]), v = d.pick([1, 1.5, 2, 2.5, 3, 4, 5, -1, -1.5, -2, -2.5, -3]), x0 = v < 0 ? d.pick([20, 24, 30, 36, 40]) : d.pick([0, 2, 4, 5, 10]);
    const x1 = x0 + v * T, who = d.pick(CART);
    return {
      topic: 'Velocity from a position–time graph',
      text: `The graph shows the position of a ${who} moving along a straight line. What is its velocity?`,
      figure: xt([[0, x0], [T, x1]], { points: [[0, x0, true], [T, x1, true]] }),
      answer: numAns(v, 'm/s'),
      solution: `Velocity is the slope of a position–time graph: v = Δx/Δt = (${num(x1)} m − ${num(x0)} m) / (${T} s − 0 s) = <b>${num(v)} m/s</b>.${v < 0 ? ' It is negative because the position is decreasing: it moves backward.' : ''}`,
    };
  },
  // 2. acceleration is the slope of a velocity–time graph
  (d) => {
    const T = d.pick([2, 4, 6, 8, 10]), a = d.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, -0.5, -1, -1.5, -2, -2.5]), v0 = a < 0 ? d.pick([10, 12, 16, 20, 24, 30]) : d.pick([0, 2, 4, 5, 6, 10]);
    const v1 = v0 + a * T;
    return {
      topic: 'Acceleration from a velocity–time graph',
      text: `The graph shows the velocity of a ${d.pick(CART)} moving in a straight line. What is its acceleration?`,
      figure: vt([[0, v0], [T, v1]], { points: [[0, v0, true], [T, v1, true]] }),
      answer: numAns(a, 'm/s²'),
      solution: `Acceleration is the slope of a velocity–time graph: a = Δv/Δt = (${num(v1)} − ${num(v0)}) m/s / (${T} − 0) s = <b>${num(a)} m/s²</b>.${a < 0 ? ' Negative: it is slowing down.' : ''}`,
    };
  },
  // 3. displacement is the area under a velocity–time graph
  (d) => {
    const T = d.pick([6, 8, 10]), a = d.pick([0.5, 1, 1.5, 2]), v0 = d.pick([0, 2, 3, 4, 6]);
    const t1 = d.int(0, T / 2 - 1), t2 = d.int(t1 + 2, T);
    const v = (t) => v0 + a * t, area = ((v(t1) + v(t2)) / 2) * (t2 - t1);
    return {
      topic: 'Displacement from the area under a v–t graph',
      text: `The graph shows the velocity of a ${d.pick(CART)}. How far does it travel between t = ${t1} s and t = ${t2} s?`,
      figure: vt([[0, v0], [T, v(T)]], { points: [[t1, v(t1), true], [t2, v(t2), true]] }),
      answer: numAns(area, 'm'),
      solution: `Distance is the area under the v–t graph between the two times. That area is a trapezoid: (${num(v(t1))} + ${num(v(t2))}) / 2 × (${t2} − ${t1}) = <b>${num(area)} m</b>.`,
    };
  },
  // 4. a trip in three parts: speeding up, cruising, braking
  (d) => {
    const V = d.pick([4, 6, 8, 10, 12, 15, 20]), t1 = d.pick([2, 3, 4, 5]), t2 = t1 + d.pick([2, 3, 4, 5, 6, 8]), t3 = t2 + d.pick([2, 3, 4, 5, 6]);
    const dist = 0.5 * V * t1 + V * (t2 - t1) + 0.5 * V * (t3 - t2), avg = d.chance(0.5);
    return {
      topic: avg ? 'Average velocity from a v–t graph' : 'Total distance from a v–t graph',
      text: `A ${d.pick(['bus', 'car', 'tram', 'scooter', 'cyclist'])} speeds up from rest, travels at a steady speed, then brakes to a stop, as the graph shows. ${avg ? 'What is its average velocity for the whole trip?' : 'How far does it travel altogether?'}`,
      figure: vt([[0, 0], [t1, V], [t2, V], [t3, 0]], { points: [[t1, V, true], [t2, V, true], [t3, 0, true]] }),
      answer: avg ? numAns(dist / t3, 'm/s') : numAns(dist, 'm'),
      solution: `Total distance = area under the graph = ½·${t1}·${V} + ${t2 - t1}·${V} + ½·${t3 - t2}·${V} = ${num(dist)} m.` + (avg ? ` Average velocity = total displacement / total time = ${num(dist)} m / ${t3} s = <b>${num(dist / t3)} m/s</b>.` : ` So it travels <b>${num(dist)} m</b>.`),
    };
  },
  // 5. a walk out, a stop, and part of the way back
  (d) => {
    const D = d.pick([10, 12, 15, 16, 20, 24, 30]), t1 = d.pick([3, 4, 5, 6]), t2 = t1 + d.pick([2, 3, 4]), t3 = t2 + d.pick([3, 4, 5, 6]);
    const back = d.pick([D, D / 2, D / 4 * 3 === Math.round(D / 4 * 3) ? D / 4 * 3 : D / 2]), end = D - back;
    const ask = d.pick(['distance', 'displacement', 'speed back']);
    const value = ask === 'distance' ? D + back : ask === 'displacement' ? end : back / (t3 - t2);
    return {
      topic: ask === 'speed back' ? 'Velocity on one part of an x–t graph' : `Distance or displacement from an x–t graph`,
      text: `A ${d.pick(['student', 'dog', 'robot', 'runner'])} walks away from a wall, stops, then walks back toward it. The graph shows the position. ${ask === 'distance' ? 'What total distance is walked?' : ask === 'displacement' ? 'What is the displacement for the whole trip?' : 'At what speed does it walk back?'}`,
      figure: xt([[0, 0], [t1, D], [t2, D], [t3, end]], { points: [[t1, D, true], [t2, D, true], [t3, end, true]] }),
      answer: numAns(value, ask === 'speed back' ? 'm/s' : 'm'),
      solution: ask === 'distance' ? `Out: ${D} m. Back: ${D} − ${num(end)} = ${num(back)} m. Distance adds both: <b>${num(D + back)} m</b>.`
        : ask === 'displacement' ? `Displacement is final position − starting position = ${num(end)} m − 0 m = <b>${num(end)} m</b> (it doesn't care about the path).`
        : `Walking back, it covers ${num(back)} m in ${t3 - t2} s: speed = ${num(back)} / ${t3 - t2} = <b>${num(value)} m/s</b>. (The velocity is −${num(value)} m/s, since x is decreasing.)`,
    };
  },
  // 6. change in velocity is the area under an acceleration–time graph
  (d) => {
    const T = d.pick([2, 3, 4, 5, 6, 8]), a = d.pick([1, 1.5, 2, 2.5, 3, 4, -1, -1.5, -2]), v0 = a < 0 ? d.pick([15, 20, 24, 30]) : d.pick([0, 2, 4, 5, 10]);
    return {
      topic: 'Velocity from an acceleration–time graph',
      text: `A ${d.pick(CART)} is moving at ${v0} m/s at t = 0. The graph shows its acceleration. What is its velocity at t = ${T} s?`,
      figure: graph({ x: span([0, T + 1], 6), y: span([0, a * 1.4], 5), xLabel: 'time t (s)', yLabel: 'acceleration a (m/s²)', lines: [[[0, a], [T, a]]], points: [[T, a]] }),
      answer: numAns(v0 + a * T, 'm/s'),
      solution: `The area under an a–t graph is the change in velocity: Δv = ${num(a)} m/s² × ${T} s = ${num(a * T)} m/s. So v = ${v0} + (${num(a * T)}) = <b>${num(v0 + a * T)} m/s</b>.`,
    };
  },
  // 7. braking distance (graph + equation)
  (d, ctx) => {
    const [v0, a] = combo(ctx, [[10, 12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 32, 35], [2, 2.5, 3, 3.5, 4, 5, 6, 7, 8]], (v, x) => (v / x) % 0.5 === 0 && v / x >= 2);
    const ts = v0 / a, dist = (v0 * v0) / (2 * a);
    return {
      topic: 'Braking distance',
      text: `A car moving at ${v0} m/s brakes with a steady deceleration of ${num(a)} m/s² until it stops (graph below). How far does it travel while braking?`,
      figure: vt([[0, v0], [ts, 0]], { points: [[0, v0], [ts, 0]] }),
      answer: numAns(dist, 'm'),
      solution: `Use v² = v₀² + 2aΔx with v = 0: Δx = v₀² / (2a) = ${v0}² / (2·${num(a)}) = <b>${num(dist)} m</b>. (Same as the triangle's area: ½ · ${num(ts)} s · ${v0} m/s.)`,
    };
  },
  // 8. free fall from rest
  (d, ctx) => {
    const [t, speed] = combo(ctx, [[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6], [true, false]]);
    const fig = speed ? graph({ x: span([0, t + 0.5], 5), y: span([0, G * (t + 0.5)], 6), xLabel: 'time t (s)', yLabel: 'speed (m/s)', lines: [[[0, 0], [t + 0.5, G * (t + 0.5)]]], points: [[t, G * t]] })
      : graph({ x: span([0, t + 0.5], 5), y: span([0, 0.5 * G * (t + 0.5) ** 2], 6), xLabel: 'time t (s)', yLabel: 'distance fallen (m)', curves: [{ f: (s) => 0.5 * G * s * s, from: 0, to: t + 0.5 }], points: [[t, 0.5 * G * t * t]] });
    return {
      topic: 'Free fall',
      text: `A ${d.pick(['stone', 'ball', 'key', 'coin', 'water balloon'])} is dropped from rest (use g = 9.8 m/s², no air resistance). ${speed ? `How fast is it falling after ${num(t)} s?` : `How far has it fallen after ${num(t)} s?`}`,
      figure: fig,
      answer: speed ? numAns(G * t, 'm/s') : numAns(0.5 * G * t * t, 'm'),
      solution: speed ? `From rest, v = g·t = 9.8 × ${num(t)} = <b>${num(G * t)} m/s</b>.` : `From rest, d = ½·g·t² = ½ × 9.8 × ${num(t)}² = <b>${num(0.5 * G * t * t)} m</b>.`,
    };
  },
  // 9. thrown straight up
  (d, ctx) => {
    const [top, height] = combo(ctx, [[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6], [true, false]]), v0 = round(G * top, 2);
    return {
      topic: 'Thrown straight up',
      text: `A ball is thrown straight up at ${num(v0)} m/s (g = 9.8 m/s²). The graph shows its velocity (up is positive). ${height ? 'How high does it rise above where it was thrown?' : 'When does it reach its highest point?'}`,
      figure: vt([[0, v0], [2 * top, -v0]], { points: [[top, 0]] }),
      answer: height ? numAns((v0 * v0) / (2 * G), 'm') : numAns(top, 's'),
      solution: height ? `At the top v = 0. The height is the area of the triangle above the axis: ½ × ${num(top)} s × ${num(v0)} m/s = <b>${num((v0 * v0) / (2 * G))} m</b> (or v₀²/2g).`
        : `At the top the velocity is zero, where the line crosses the time axis: t = v₀/g = ${num(v0)} / 9.8 = <b>${num(top)} s</b>.`,
    };
  },
  // 10. acceleration from a curved position–time graph (starting from rest)
  (d, ctx) => {
    const [a, T] = combo(ctx, [[0.5, 1, 1.5, 2, 2.5, 3, 4, 5], [2, 3, 4, 5, 6]]), xT = 0.5 * a * T * T;
    return {
      topic: 'Acceleration from a curved x–t graph',
      text: `A ${d.pick(CART)} starts from rest and speeds up steadily. Its position is graphed below. Using the marked point, what is its acceleration?`,
      figure: graph({ x: span([0, T + 1], 6), y: span([0, 0.5 * a * (T + 1) ** 2], 6), xLabel: 'time t (s)', yLabel: 'position x (m)', curves: [{ f: (t) => 0.5 * a * t * t, from: 0, to: T + 1 }], points: [[T, xT, `(${T} s, ${num(xT)} m)`]] }),
      answer: numAns(a, 'm/s²'),
      solution: `From rest, x = ½·a·t². So a = 2x/t² = 2 × ${num(xT)} / ${T}² = <b>${num(a)} m/s²</b>.`,
    };
  },
  // 11. two cars: when are their speeds equal, and how far apart then
  (d, ctx) => {
    const [vA, aB, gap] = combo(ctx, [[6, 8, 10, 12, 15, 20], [1, 2, 2.5, 3, 4, 5], [true, false]], (v, x) => (v / x) % 0.5 === 0 && v / x >= 1.5), ts = vA / aB;
    const T = Math.ceil(ts * 1.6);
    return {
      topic: 'Two objects on one v–t graph',
      text: `Car A drives past at a steady ${vA} m/s just as car B starts from rest beside it, accelerating at ${num(aB)} m/s². The graph shows both velocities. ${gap ? 'How far ahead of B is A when their speeds are equal?' : 'At what time do they have the same speed?'}`,
      figure: graph({ x: span([0, T, ts], 6), y: span([0, vA, Math.max(vA, aB * T)], 6), xLabel: 'time t (s)', yLabel: 'velocity v (m/s)', lines: [[[0, vA], [T, vA]], [[0, 0], [T, aB * T]]], points: [[ts, vA, true]] }),
      answer: gap ? numAns(vA * ts - 0.5 * aB * ts * ts, 'm') : numAns(ts, 's'),
      solution: gap ? `Speeds match when ${num(aB)}·t = ${vA}, so t = ${num(ts)} s. By then A has gone ${vA}·${num(ts)} = ${num(vA * ts)} m and B ½·${num(aB)}·${num(ts)}² = ${num(0.5 * aB * ts * ts)} m, so A is <b>${num(vA * ts - 0.5 * aB * ts * ts)} m</b> ahead (the area between the lines).`
        : `They have the same speed where the lines cross: ${num(aB)}·t = ${vA}, so t = <b>${num(ts)} s</b>.`,
    };
  },
  // 12. average velocity between two times on a position–time graph
  (d) => {
    const pts = [[0, d.pick([0, 2, 4])]];
    let t = 0;
    for (let i = 0; i < 3; i++) { t += d.pick([2, 3, 4]); pts.push([t, Math.max(0, pts[pts.length - 1][1] + d.pick([-6, -4, 4, 6, 8, 10, 0]))]); }
    const [i, j] = d.pick([[0, 2], [1, 3], [0, 3], [0, 1], [2, 3]]), [ta, xa] = pts[i], [tb, xb] = pts[j];
    return {
      topic: 'Average velocity from an x–t graph',
      text: `The graph shows the position of a ${d.pick(CART)}. What is its average velocity from t = ${ta} s to t = ${tb} s?`,
      figure: xt(pts, { points: pts.slice(1).map(([a, b]) => [a, b, true]) }),
      answer: numAns((xb - xa) / (tb - ta), 'm/s'),
      solution: `Average velocity = displacement / time = (${num(xb)} − ${num(xa)}) m / (${tb} − ${ta}) s = <b>${num((xb - xa) / (tb - ta))} m/s</b>.`,
    };
  },
];

export const kinematics = bank('kinematics', templates, 240);
