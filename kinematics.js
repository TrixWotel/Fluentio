// Kinematics with motion graphs: 14 kinds of question, 20 variants each (280). Every variant draws its own graph,
// built so the numbers you need sit exactly on grid lines (or are marked).
import { bank, combo, graph, span, num, round } from '../kit/bank.js';

const G = 9.8;
// a graph through these points, with axes chosen so the corners and the marked points land on grid lines
const along = (pts, extra) => [...pts, ...(extra.points || [])];
const vt = (pts, extra = {}) => graph({ x: span(along(pts, extra).map((p) => p[0]), 6), y: span(along(pts, extra).map((p) => p[1]), 6), xLabel: 'time t (s)', yLabel: 'velocity v (m/s)', lines: [pts], ...extra });
const xt = (pts, extra = {}) => graph({ x: span(along(pts, extra).map((p) => p[0]), 6), y: span(along(pts, extra).map((p) => p[1]), 6), xLabel: 'time t (s)', yLabel: 'position x (m)', lines: [pts], ...extra });
const numAns = (value, unit, tol = 0.02) => ({ kind: 'number', value: round(value, 4), unit, tol });
const CART = ['cart', 'toy car', 'runner', 'cyclist', 'robot', 'skateboarder', 'train', 'drone'];
// a kind with several types of question takes turns through them; each type walks through its own combinations
// the area under a speed-up, steady, brake graph, a piece at a time
const pieces = (t1, b, c, V) => `Speeding up: ½ × ${t1} × ${V} = ${num(0.5 * V * t1)} m. At the steady speed: ${b} × ${V} = ${V * b} m. Braking: ½ × ${c} × ${V} = ${num(0.5 * V * c)} m.`;
const turn = (ctx, types, lists, ok) => combo({ ...ctx, k: Math.floor(ctx.k / types), salt: `${ctx.salt}-${ctx.k % types}` }, lists, ok);

const templates = [
  // 1. velocity is the slope of a position–time graph
  (d) => {
    const T = d.pick([2, 4, 6, 8, 10]), v = d.pick([1, 1.5, 2, 2.5, 3, 4, 5, -1, -1.5, -2, -2.5, -3]), x0 = v < 0 ? d.pick([20, 24, 30, 36, 40]) : d.pick([0, 2, 4, 5, 10]);
    const x1 = x0 + v * T, who = d.pick(CART);
    return {
      topic: 'Velocity from a position–time graph',
      text: `The graph shows the position of a ${who} moving along a straight line. What is the ${who}’s velocity?`,
      figure: xt([[0, x0], [T, x1]], { points: [[0, x0, true], [T, x1, true]] }),
      answer: numAns(v, 'm/s'),
      solution: `Velocity is the slope of a position–time graph: v = Δx/Δt = (${num(x1)} m − ${num(x0)} m) / (${T} s − 0 s) = <b>${num(v)} m/s</b>.${v < 0 ? ' It is negative because the position is decreasing: it moves backward.' : ''}`,
    };
  },
  // 2. acceleration is the slope of a velocity–time graph
  (d) => {
    const T = d.pick([2, 4, 6, 8, 10]), a = d.pick([0.5, 1, 1.5, 2, 2.5, 3, 4, -0.5, -1, -1.5, -2, -2.5]), v0 = a < 0 ? d.pick([10, 12, 16, 20, 24, 30]) : d.pick([0, 2, 4, 5, 6, 10]);
    const v1 = v0 + a * T, who = d.pick(CART);
    return {
      topic: 'Acceleration from a velocity–time graph',
      text: `The graph shows the velocity of a ${who} moving in a straight line. What is the ${who}’s acceleration?`,
      figure: vt([[0, v0], [T, v1]], { points: [[0, v0, true], [T, v1, true]] }),
      answer: numAns(a, 'm/s²'),
      solution: `Acceleration is the slope of a velocity–time graph: a = Δv/Δt = (${num(v1)} − ${num(v0)}) m/s / (${T} − 0) s = <b>${num(a)} m/s²</b>.${a < 0 ? ' Negative: it is slowing down.' : ''}`,
    };
  },
  // 3. displacement is the area under a velocity–time graph
  (d) => {
    const T = d.pick([6, 8, 10]), a = d.pick([0.5, 1, 1.5, 2]), v0 = d.pick([0, 2, 3, 4, 6]);
    const t1 = d.int(0, T / 2 - 1), t2 = d.int(t1 + 2, T);
    const v = (t) => v0 + a * t, area = ((v(t1) + v(t2)) / 2) * (t2 - t1), who = d.pick(CART);
    return {
      topic: 'Displacement from the area under a v–t graph',
      text: `The graph shows the velocity of a ${who}. How far does the ${who} travel between t = ${t1} s and t = ${t2} s?`,
      figure: vt([[0, v0], [T, v(T)]], { points: [[t1, v(t1), true], [t2, v(t2), true]] }),
      answer: numAns(area, 'm'),
      solution: `Distance is the area under the v–t graph between the two times. ${v(t1) === 0 ? `That area is a triangle, so it is ½ × ${num(v(t2))} × (${t2} − ${t1})` : `That area is a trapezoid, so it is (${num(v(t1))} + ${num(v(t2))}) / 2 × (${t2} − ${t1})`} = <b>${num(area)} m</b>.`,
      ...(v(t1) === 0 ? { tip: 'Find the area under the v–t line between the two times: here it starts at 0, so it is a triangle.' } : {}),
    };
  },
  // 4. total distance: the area under a v–t graph (a whole trip, one part of it, or a trip that starts moving)
  (d, ctx) => {
    const type = ['trip', 'part', 'start'][ctx.k % 3], vehicle = d.pick(['bus', 'car', 'tram', 'scooter', 'cyclist']);
    const [V, a, b, c] = turn(ctx, 3, [[4, 6, 8, 10, 12, 15, 20], [2, 3, 4, 5], [2, 3, 4, 5, 6, 8], [2, 3, 4, 5, 6]]);
    if (type === 'start') {
      const u = V / 2, t1 = a, t2 = t1 + b, dist = ((u + V) / 2) * t1 + V * b;
      return {
        topic: 'Total distance from a v–t graph',
        text: `A ${vehicle} already moving at ${num(u)} m/s speeds up steadily to ${V} m/s, then keeps that speed, as the graph shows. How far does the ${vehicle} travel in the first ${t2} s?`,
        figure: vt([[0, u], [t1, V], [t2, V]], { points: [[0, u, true], [t1, V, true], [t2, V, true]] }),
        answer: numAns(dist, 'm'),
        solution: `The distance is the area under the graph. While speeding up it is a trapezoid, (${num(u)} + ${V}) / 2 × ${t1} = ${num(((u + V) / 2) * t1)} m. At the steady speed it is a rectangle, ${V} × ${b} = ${V * b} m. Altogether ${num(((u + V) / 2) * t1)} + ${V * b} = <b>${num(dist)} m</b>.`,
        tip: 'Split the area under the v–t graph into a trapezoid while it speeds up and a rectangle at the steady speed.',
      };
    }
    const t1 = a, t2 = t1 + b, t3 = t2 + c, parts = [['speeding up', 0.5 * V * t1, `½ × ${t1} × ${V}`], ['at the steady speed', V * b, `${b} × ${V}`], ['braking', 0.5 * V * c, `½ × ${c} × ${V}`]];
    const total = parts.reduce((s, p) => s + p[1], 0), [phase, part, how] = parts[ctx.k % 3 === 1 ? Math.floor(ctx.k / 3) % 3 : 0];
    return {
      topic: 'Total distance from a v–t graph',
      text: `A ${vehicle} speeds up from rest, travels at a steady speed, then brakes to a stop, as the graph shows. ${type === 'trip' ? `How far does the ${vehicle} travel altogether?` : `How far does the ${vehicle} travel while ${phase}?`}`,
      figure: vt([[0, 0], [t1, V], [t2, V], [t3, 0]], { points: [[t1, V, true], [t2, V, true], [t3, 0, true]] }),
      answer: numAns(type === 'trip' ? total : part, 'm'),
      solution: type === 'trip'
        ? `The total distance is the area under the graph, made of two triangles and a rectangle. ${pieces(t1, b, c, V)} Altogether ${num(0.5 * V * t1)} + ${V * b} + ${num(0.5 * V * c)} = <b>${num(total)} m</b>.`
        : `Only the part of the graph while ${phase} counts: its area is ${how} = <b>${num(part)} m</b>.`,
      ...(type === 'part' ? { tip: 'Only the piece of the graph for that part of the trip counts: find the area under that piece alone.' } : {}),
    };
  },
  // 5. average velocity from a v–t graph: total distance (the area) over total time
  (d, ctx) => {
    const type = ['trip', 'steps', 'speedup'][ctx.k % 3], vehicle = d.pick(['bus', 'car', 'tram', 'scooter', 'cyclist']);
    const [V, a, b, c] = turn(ctx, 3, [[4, 6, 8, 10, 12, 15, 20], [2, 3, 4, 5], [2, 3, 4, 5, 6, 8], [2, 3, 4, 5, 6]]);
    if (type === 'steps') {
      const u = [2, 3, 4, 5, 6][Math.floor(ctx.k / 3) % 5], w = V === u ? V + 4 : V, dist = u * a + w * b, time = a + b;
      return {
        topic: 'Average velocity from a v–t graph',
        text: `A ${vehicle} goes at a steady ${u} m/s for ${a} s, then at a steady ${w} m/s for ${b} s (graph below). What is the ${vehicle}’s average velocity over the ${time} s?`,
        figure: vt([[0, u], [a, u], [a, w], [time, w]], { points: [[a, u, true], [a, w, true], [time, w, true]] }),
        answer: numAns(dist / time, 'm/s'),
        solution: `Average velocity = total distance / total time, not the average of the two speeds. Distance = ${u} × ${a} + ${w} × ${b} = ${num(dist)} m, so the average is ${num(dist)} / ${time} = <b>${num(dist / time)} m/s</b>.`,
      };
    }
    if (type === 'speedup') {
      const dist = 0.5 * V * a;
      return {
        topic: 'Average velocity from a v–t graph',
        text: `A ${vehicle} speeds up steadily from rest to ${V} m/s in ${a} s, then keeps that speed (graph below). What is the ${vehicle}’s average velocity during the ${a} s of speeding up?`,
        figure: vt([[0, 0], [a, V], [a + b, V]], { points: [[a, V, true], [a + b, V, true]] }),
        answer: numAns(dist / a, 'm/s'),
        solution: `While speeding up, the ${vehicle} covers the triangle’s area, ½ × ${a} × ${V} = ${num(dist)} m, in ${a} s: average velocity = ${num(dist)} / ${a} = <b>${num(dist / a)} m/s</b> (halfway between 0 and ${V}, since the speed rises steadily).`,
        tip: 'Average velocity = the area under that part of the v–t graph divided by the time it takes.',
      };
    }
    const t1 = a, t2 = t1 + b, t3 = t2 + c, dist = 0.5 * V * t1 + V * b + 0.5 * V * c;
    return {
      topic: 'Average velocity from a v–t graph',
      text: `A ${vehicle} speeds up from rest, travels at a steady speed, then brakes to a stop, as the graph shows. What is the ${vehicle}’s average velocity for the whole trip?`,
      figure: vt([[0, 0], [t1, V], [t2, V], [t3, 0]], { points: [[t1, V, true], [t2, V, true], [t3, 0, true]] }),
      answer: numAns(dist / t3, 'm/s'),
      solution: `The total distance is the area under the graph. ${pieces(t1, b, c, V)} Altogether ${num(0.5 * V * t1)} + ${V * b} + ${num(0.5 * V * c)} = ${num(dist)} m. Average velocity = total distance / total time = ${num(dist)} m / ${t3} s = <b>${num(dist / t3)} m/s</b>.`,
    };
  },
  // 6. a walk out, a stop, and part of the way back: distance or displacement
  (d, ctx) => {
    const type = ['distance', 'displacement', 'end', 'back'][ctx.k % 4];
    const [D, t1, stop, tb, share] = turn(ctx, 4, [[10, 12, 15, 16, 20, 24, 30], [3, 4, 5, 6], [2, 3, 4], [3, 4, 5, 6], [1, 0.5, 0.75]], (D, t1, s, tb, f) => Number.isInteger(D * f));
    const t2 = t1 + stop, t3 = t2 + tb, back = D * share, end = D - back, who = d.pick(['student', 'dog', 'robot', 'runner']);
    const value = { distance: D + back, displacement: end, end, back: -back }[type];
    return {
      topic: 'Distance or displacement from an x–t graph',
      text: `A ${who} walks away from a wall, stops, then walks back toward it. The graph shows the ${who}’s distance from the wall. ${{
        distance: `What total distance does the ${who} walk?`, displacement: `What is the ${who}’s displacement for the whole trip?`,
        end: `How far from the wall is the ${who} at the end?`, back: `What is the ${who}’s displacement from t = ${t2} s to t = ${t3} s?` }[type]}`,
      figure: xt([[0, 0], [t1, D], [t2, D], [t3, end]], { points: [[t1, D, true], [t2, D, true], [t3, end, true]] }),
      answer: numAns(value, 'm'),
      solution: {
        distance: `Out: ${D} m. Back: ${D} − ${num(end)} = ${num(back)} m. Distance adds every leg: ${D} + ${num(back)} = <b>${num(D + back)} m</b>.`,
        displacement: `Displacement only compares the end with the start, so the path in between doesn’t matter. Final position − starting position = ${num(end)} m − 0 m = <b>${num(end)} m</b>.`,
        end: `Read the graph at the end, t = ${t3} s: the line ends at x = ${num(end)} m, so the ${who} is <b>${num(end)} m</b> from the wall.`,
        back: `From t = ${t2} s to t = ${t3} s, x goes from ${D} m to ${num(end)} m: displacement = ${num(end)} − ${D} = <b>${num(-back)} m</b>. It is negative because the ${who} moves back toward the wall.`,
      }[type],
    };
  },
  // 7. the velocity on one part of an x–t graph: that part's slope
  (d, ctx) => {
    const type = ['speed back', 'speed out', 'velocity back'][ctx.k % 3];
    const [D, t1, stop, tb, share] = turn(ctx, 3, [[10, 12, 15, 16, 20, 24, 30], [2, 3, 4, 5, 6], [2, 3, 4], [2, 3, 4, 5, 6], [1, 0.5, 0.75]], (D, t1, s, tb, f) => Number.isInteger(D * f));
    const t2 = t1 + stop, t3 = t2 + tb, back = D * share, end = D - back, who = d.pick(['student', 'dog', 'robot', 'runner']);
    const value = { 'speed back': back / tb, 'speed out': D / t1, 'velocity back': -back / tb }[type];
    return {
      topic: 'Velocity on one part of an x–t graph',
      text: `A ${who} walks away from a wall, stops, then walks back toward it. The graph shows the ${who}’s distance from the wall. ${{
        'speed back': `At what speed does the ${who} walk back?`, 'speed out': `At what speed does the ${who} walk away from the wall?`,
        'velocity back': `What is the ${who}’s velocity while walking back? (Away from the wall is positive.)` }[type]}`,
      figure: xt([[0, 0], [t1, D], [t2, D], [t3, end]], { points: [[t1, D, true], [t2, D, true], [t3, end, true]] }),
      answer: numAns(value, 'm/s'),
      solution: type === 'speed out'
        ? `Walking away, x goes from 0 to ${D} m in ${t1} s: speed = ${D} / ${t1} = <b>${num(value)} m/s</b>. Only that first piece of the graph counts.`
        : `Walking back, x goes from ${D} m to ${num(end)} m in ${tb} s (from t = ${t2} s to t = ${t3} s): the slope is (${num(end)} − ${D}) / ${tb} = ${num(-back / tb)} m/s. ${type === 'speed back' ? `The speed is its size: <b>${num(value)} m/s</b>.` : `So the velocity is <b>${num(value)} m/s</b>; negative because x is decreasing.`}`,
    };
  },
  // 8. change in velocity is the area under an acceleration–time graph
  (d) => {
    const a = d.pick([1, 1.5, 2, 2.5, 3, 4, -1, -1.5, -2]), v0 = a < 0 ? d.pick([15, 20, 24, 30]) : d.pick([0, 2, 4, 5, 10]);
    const T = d.pick([2, 3, 4, 5, 6, 8].filter((t) => v0 + a * t >= 0)), who = d.pick(CART);   // (slowing down, it stops at worst: it doesn't reverse)
    return {
      topic: 'Velocity from an acceleration–time graph',
      text: `A ${who} is moving at ${v0} m/s at t = 0. The graph shows the ${who}’s acceleration. What is the ${who}’s velocity at t = ${T} s?`,
      figure: graph({ x: span([0, T + 1], 6), y: span([0, a * 1.4], 5), xLabel: 'time t (s)', yLabel: 'acceleration a (m/s²)', lines: [[[0, a], [T, a]]], points: [[T, a]] }),
      answer: numAns(v0 + a * T, 'm/s'),
      solution: `The area under an a–t graph is the change in velocity: Δv = ${num(a)} m/s² × ${T} s = ${num(a * T)} m/s. So v = ${v0} ${a < 0 ? '−' : '+'} ${num(Math.abs(a * T))} = <b>${num(v0 + a * T)} m/s</b>.`,
    };
  },
  // 9. braking distance (graph + equation)
  (d, ctx) => {
    const [v0, a] = combo(ctx, [[10, 12, 14, 15, 16, 18, 20, 21, 24, 25, 27, 28, 30, 32, 35], [2, 2.5, 3, 3.5, 4, 5, 6, 7, 8]], (v, x) => (v / x) % 0.5 === 0 && v / x >= 2);
    const ts = v0 / a, dist = (v0 * v0) / (2 * a);
    return {
      topic: 'Braking distance',
      text: `A car moving at ${v0} m/s brakes with a steady deceleration of ${num(a)} m/s² until it stops (graph below). How far does it travel while braking?`,
      figure: vt([[0, v0], [ts, 0]], { points: [[0, v0, true], [ts, 0, true]] }),
      answer: numAns(dist, 'm'),
      solution: `It slows down, so a = −${num(a)} m/s², and it ends at v = 0. Then v² = v₀² + 2aΔx gives 0 = ${v0}² − 2 × ${num(a)} × Δx, so Δx = ${v0}² ÷ (2 × ${num(a)}) = <b>${num(dist)} m</b>. (That is the area of the triangle under the graph, ½ × ${num(ts)} s × ${v0} m/s.)`,
    };
  },
  // 10. free fall from rest
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
  // 11. thrown straight up
  (d, ctx) => {
    const [top, height] = combo(ctx, [[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5, 6], [true, false]]), v0 = round(G * top, 2);
    return {
      topic: 'Thrown straight up',
      text: `A ball is thrown straight up at ${num(v0)} m/s (g = 9.8 m/s²). The graph shows its velocity (up is positive). ${height ? 'How high does it rise above where it was thrown?' : 'When does it reach its highest point?'}`,
      figure: vt([[0, v0], [2 * top, -v0]], { points: [[top, 0]] }),
      answer: height ? numAns((v0 * v0) / (2 * G), 'm') : numAns(top, 's'),
      solution: height ? `At the top v = 0, which is where the line crosses the time axis, at t = v₀/g = ${num(v0)} / 9.8 = ${num(top)} s. The height is the area of the triangle above the axis: ½ × ${num(top)} s × ${num(v0)} m/s = <b>${num((v0 * v0) / (2 * G))} m</b> (or v₀²/(2g)).`
        : `At the top the velocity is zero, where the line crosses the time axis: t = v₀/g = ${num(v0)} / 9.8 = <b>${num(top)} s</b>.`,
    };
  },
  // 12. acceleration from a curved position–time graph (starting from rest)
  (d, ctx) => {
    const [a, T] = combo(ctx, [[0.5, 1, 1.5, 2, 2.5, 3, 4, 5], [2, 3, 4, 5, 6]]), xT = 0.5 * a * T * T, who = d.pick(CART);
    return {
      topic: 'Acceleration from a curved x–t graph',
      text: `A ${who} starts from rest and speeds up steadily. The ${who}’s position is graphed below. Using the marked point, what is its acceleration?`,
      figure: graph({ x: span([0, T + 1], 6), y: span([0, 0.5 * a * (T + 1) ** 2], 6), xLabel: 'time t (s)', yLabel: 'position x (m)', curves: [{ f: (t) => 0.5 * a * t * t, from: 0, to: T + 1 }], points: [[T, xT, `(${T} s, ${num(xT)} m)`]] }),
      answer: numAns(a, 'm/s²'),
      solution: `From rest, x = ½·a·t². So a = 2x/t² = 2 × ${num(xT)} / ${T}² = <b>${num(a)} m/s²</b>.`,
    };
  },
  // 13. two cars: when are their speeds equal, and how far apart then
  (d, ctx) => {
    const [vA, aB, gap] = combo(ctx, [[6, 8, 10, 12, 15, 20], [1, 2, 2.5, 3, 4, 5], [true, false]], (v, x) => (v / x) % 0.5 === 0 && v / x >= 1.5), ts = vA / aB;
    const T = Math.ceil(ts * 1.6);
    return {
      topic: 'Two objects on one v–t graph',
      text: `Car A drives past at a steady ${vA} m/s just as car B starts from rest beside it, accelerating at ${num(aB)} m/s². The graph shows both velocities. ${gap ? 'How far ahead of B is A when their speeds are equal?' : 'At what time do they have the same speed?'}`,
      figure: graph({ x: span([0, T, ts], 6), y: span([0, vA, Math.max(vA, aB * T)], 6), xLabel: 'time t (s)', yLabel: 'velocity v (m/s)', lines: [[[0, vA], [T, vA]], [[0, 0], [T, aB * T]]], points: [[ts, vA, true]] }),
      answer: gap ? numAns(vA * ts - 0.5 * aB * ts * ts, 'm') : numAns(ts, 's'),
      solution: gap ? `Speeds match when ${num(aB)} × t = ${vA}, so t = ${vA} ÷ ${num(aB)} = ${num(ts)} s. By then A has gone ${vA} × ${num(ts)} = ${num(vA * ts)} m and B has gone ½ × ${num(aB)} × ${num(ts)}² = ${num(0.5 * aB * ts * ts)} m, so A is <b>${num(vA * ts - 0.5 * aB * ts * ts)} m</b> ahead (the area between the lines).`
        : `They have the same speed where the lines cross: ${num(aB)} × t = ${vA}, so t = ${vA} ÷ ${num(aB)} = <b>${num(ts)} s</b>.`,
    };
  },
  // 14. average velocity between two times on a position–time graph
  (d) => {
    const pts = [[0, d.pick([0, 2, 4])]];
    let t = 0;
    for (let i = 0; i < 3; i++) { t += d.pick([2, 3, 4]); pts.push([t, Math.max(0, pts[pts.length - 1][1] + d.pick([-6, -4, 4, 6, 8, 10, 0]))]); }
    const [i, j] = d.pick([[0, 2], [1, 3], [0, 3], [0, 1], [2, 3]]), [ta, xa] = pts[i], [tb, xb] = pts[j], who = d.pick(CART);
    return {
      topic: 'Average velocity from an x–t graph',
      text: `The graph shows the position of a ${who}. What is the ${who}’s average velocity from t = ${ta} s to t = ${tb} s?`,
      figure: xt(pts, { points: pts.slice(1).map(([a, b]) => [a, b, true]) }),
      answer: numAns((xb - xa) / (tb - ta), 'm/s'),
      solution: `Average velocity = displacement / time = (${num(xb)} − ${num(xa)}) m / (${tb} − ${ta}) s = <b>${num((xb - xa) / (tb - ta))} m/s</b>.`,
    };
  },
];

export const kinematics = bank('kinematics', templates, 280);
