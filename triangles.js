// Triangle angles: 11 kinds of question, 20 variants each (220), every one with its triangle drawn to scale.
// Each kind walks through its own combinations, so no two variants are the same.
import { bank, combo, triangle } from '../kit/bank.js';

const range = (a, b, step = 1) => { const out = []; for (let v = a; v <= b; v += step) out.push(v); return out; };
const deg = (v) => `${v}°`;
const ans = (value) => ({ kind: 'number', value, unit: '°', tol: { abs: 0.5 } });

const templates = [
  // 1. two angles given: the third
  (d, ctx) => {
    const [A, B] = combo(ctx, [range(25, 110), range(20, 120)], (a, b) => 180 - a - b >= 15), C = 180 - A - B;
    return {
      topic: 'Angle sum of a triangle',
      text: `In triangle ABC, ∠A = ${A}° and ∠B = ${B}°. Find x, the size of ∠C.`,
      figure: triangle({ angles: { A, B, C }, labels: { A: deg(A), B: deg(B), C: 'x' } }),
      answer: ans(C),
      solution: `The angles of a triangle add up to 180°: x = 180° − ${A}° − ${B}° = <b>${C}°</b>.`,
    };
  },
  // 2. isosceles: base angles from the top angle
  (d, ctx) => {
    const [V] = combo(ctx, [range(20, 140, 2)]), b = (180 - V) / 2;
    return {
      topic: 'Isosceles: base angles',
      text: `Triangle ABC is isosceles with AB = AC, and ∠A = ${V}°. Find x, the size of ∠B.`,
      figure: triangle({ angles: { A: V, B: b, C: b }, labels: { A: deg(V), B: 'x' }, ticks: ['AB', 'AC'] }),
      answer: ans(b),
      solution: `AB = AC, so the base angles ∠B and ∠C are equal. 2x + ${V}° = 180°, so x = (180° − ${V}°)/2 = <b>${b}°</b>.`,
    };
  },
  // 3. isosceles: top angle from a base angle
  (d, ctx) => {
    const [b] = combo(ctx, [range(25, 80)]), V = 180 - 2 * b;
    return {
      topic: 'Isosceles: the top angle',
      text: `Triangle ABC is isosceles with AB = AC, and ∠B = ${b}°. Find x, the size of ∠A.`,
      figure: triangle({ angles: { A: V, B: b, C: b }, labels: { A: 'x', B: deg(b) }, ticks: ['AB', 'AC'] }),
      answer: ans(V),
      solution: `Base angles are equal, so ∠C = ∠B = ${b}°. Then x = 180° − 2 × ${b}° = <b>${V}°</b>.`,
    };
  },
  // 4. right triangle: the other acute angle
  (d, ctx) => {
    const [A] = combo(ctx, [range(15, 75)]), B = 90 - A;
    return {
      topic: 'Right triangle',
      text: `Triangle ABC has a right angle at C, and ∠A = ${A}°. Find x, the size of ∠B.`,
      figure: triangle({ angles: { A, B, C: 90 }, labels: { A: deg(A), B: 'x' }, right: 'C' }),
      answer: ans(B),
      solution: `The two acute angles of a right triangle add up to 90°: x = 90° − ${A}° = <b>${B}°</b>.`,
    };
  },
  // 5. exterior angle: a missing interior angle
  (d, ctx) => {
    const [A, B] = combo(ctx, [range(25, 80), range(25, 80)], (a, b) => 180 - a - b >= 20), E = A + B;
    return {
      topic: 'Exterior angle: an interior angle',
      text: `Side BC of triangle ABC is extended past C, making an exterior angle of ${E}°. If ∠A = ${A}°, find x, the size of ∠B.`,
      figure: triangle({ angles: { A, B, C: 180 - A - B }, labels: { A: deg(A), B: 'x' }, ext: deg(E) }),
      answer: ans(B),
      solution: `An exterior angle equals the sum of the two opposite interior angles: ${E}° = ${A}° + x, so x = <b>${B}°</b>.`,
    };
  },
  // 6. exterior angle from the two opposite interior angles
  (d, ctx) => {
    const [A, B] = combo(ctx, [range(20, 85), range(20, 85)], (a, b) => 180 - a - b >= 20 && a !== b), E = A + B;
    return {
      topic: 'Exterior angle',
      text: `In triangle ABC, ∠A = ${A}° and ∠B = ${B}°. Side BC is extended past C. Find x, the exterior angle at C.`,
      figure: triangle({ angles: { A, B, C: 180 - A - B }, labels: { A: deg(A), B: deg(B) }, ext: 'x' }),
      answer: ans(E),
      solution: `The exterior angle equals the sum of the two opposite interior angles: x = ${A}° + ${B}° = <b>${E}°</b>. (Or: ∠C = 180° − ${A}° − ${B}° = ${180 - E}°, and x = 180° − ${180 - E}° = ${E}°.)`,
    };
  },
  // 7. angles in a ratio
  (d, ctx) => {
    const RATIOS = [[1, 2, 3], [2, 3, 4], [1, 1, 2], [3, 4, 5], [1, 3, 5], [2, 3, 5], [1, 4, 5], [4, 5, 6], [2, 5, 8], [1, 2, 6], [5, 6, 7], [3, 5, 7], [1, 5, 6], [2, 2, 5], [3, 3, 4], [1, 3, 8], [2, 7, 9], [4, 5, 9], [1, 2, 2], [3, 4, 8]];
    const [ratio, ask] = combo(ctx, [RATIOS, ['largest', 'smallest']]), sum = ratio.reduce((a, b) => a + b), unit = 180 / sum, [p, q, r] = ratio;
    const part = ask === 'largest' ? Math.max(...ratio) : Math.min(...ratio), value = part * unit, lab = (k) => (k === 1 ? 'x' : `${k}x`);
    return {
      topic: 'Angles in a ratio',
      text: `The angles of a triangle are in the ratio ${p} : ${q} : ${r}. What is the ${ask} angle?`,
      figure: triangle({ angles: { A: p * unit, B: q * unit, C: r * unit }, labels: { A: lab(p), B: lab(q), C: lab(r) } }),
      answer: ans(value),
      solution: `Call the angles ${lab(p)}, ${lab(q)} and ${lab(r)}. They add to 180°, so ${sum}x = 180° and x = ${unit}°. ${part === 1 ? `The ${ask} angle is x = <b>${value}°</b>.` : `The ${ask} angle is ${part}x = ${part} × ${unit}° = <b>${value}°</b>.`}`,
    };
  },
  // 8. angles as expressions in x
  (d, ctx) => {
    const [x, p, q, askX] = combo(ctx, [range(10, 30, 2), [-10, -5, 5, 10, 15, 20, 25, 30], [-20, -10, -5, 5, 10, 20], [true, false]],
      (x, p, q) => { const A = x + p, B = 2 * x + q, C = 180 - A - B; return A >= 15 && B >= 15 && C - 3 * x >= -40 && C >= 15; });
    const A = x + p, B = 2 * x + q, C = 180 - A - B, r = C - 3 * x;
    const ex = (k, c) => `(${k === 1 ? '' : k}x ${c < 0 ? '−' : '+'} ${Math.abs(c)})°`;
    const term = (k, c) => (c === 0 ? `${k}x` : `(${k === 1 ? '' : k}x ${c < 0 ? '−' : '+'} ${Math.abs(c)})`);   // (3x, not 3x + 0)
    return {
      topic: 'Angles in terms of x',
      text: `The angles of triangle ABC are ∠A = ${ex(1, p)}, ∠B = ${ex(2, q)} and ∠C = ${r === 0 ? '3x°' : ex(3, r)}. ${askX ? 'Find x.' : 'Find the size of ∠B.'}`,
      figure: triangle({ angles: { A, B, C }, labels: { A: ex(1, p), B: ex(2, q), C: r === 0 ? '3x°' : ex(3, r) } }),
      answer: askX ? { kind: 'number', value: x, unit: '', tol: { abs: 0.01 } } : ans(B),
      solution: `Add them: ${term(1, p)} + ${term(2, q)} + ${term(3, r)} = 180. Collecting the terms, ${p + q + r === 0 ? '6x = 180, so' : `6x + ${p + q + r} = 180, so 6x = ${180 - p - q - r} and`} x = ${askX ? `<b>${x}</b>` : x}.` + (askX ? '' : ` Then ∠B = 2 × ${x} ${q < 0 ? '−' : '+'} ${Math.abs(q)} = <b>${B}°</b>.`),
    };
  },
  // 9. isosceles with an exterior angle
  (d, ctx) => {
    const [b] = combo(ctx, [range(30, 80)]), E = 180 - b, V = 180 - 2 * b;
    return {
      topic: 'Isosceles with an exterior angle',
      text: `Triangle ABC is isosceles with AB = AC. Side BC is extended past C, making an exterior angle of ${E}°. Find x, the size of ∠A.`,
      figure: triangle({ angles: { A: V, B: b, C: b }, labels: { A: 'x' }, ticks: ['AB', 'AC'], ext: deg(E) }),
      answer: ans(V),
      solution: `∠C = 180° − ${E}° = ${b}° (angles on a straight line). The base angles are equal, so ∠B = ${b}° too. Then x = 180° − 2 × ${b}° = <b>${V}°</b>.`,
    };
  },
  // 10. an angle bisector
  (d, ctx) => {
    const [B, C] = combo(ctx, [range(30, 80), range(30, 80)], (b, c) => (180 - b - c) % 2 === 0 && 180 - b - c >= 30), A = 180 - B - C, X = 180 - B - A / 2;
    return {
      topic: 'Angle bisector',
      text: `In triangle ABC, ∠B = ${B}° and ∠C = ${C}°. AD bisects ∠A, meeting BC at D. Find x, the size of ∠ADB.`,
      figure: triangle({ angles: { A, B, C }, labels: { B: deg(B), C: deg(C) }, seg: { kind: 'bisector', at: 'D', label: 'x' } }),
      answer: ans(X),
      solution: `∠A = 180° − ${B}° − ${C}° = ${A}°, so ∠BAD = ${A / 2}°. In triangle ABD: x = 180° − ${B}° − ${A / 2}° = <b>${X}°</b>.`,
    };
  },
  // 11. an altitude
  (d, ctx) => {
    const [B, C] = combo(ctx, [range(30, 75), range(35, 75, 5)], (b, c) => 180 - b - c >= 35), A = 180 - B - C;
    return {
      topic: 'Altitude',
      text: `In triangle ABC, ∠B = ${B}° and ∠C = ${C}°. AD is perpendicular to BC. Find x, the size of ∠BAD.`,
      figure: triangle({ angles: { A, B, C }, labels: { B: deg(B), C: deg(C) }, seg: { kind: 'altitude', at: 'A', label: 'x' } }),
      answer: ans(90 - B),
      solution: `AD ⟂ BC, so ∠ADB = 90°. In triangle ABD: x = 180° − 90° − ${B}° = <b>${90 - B}°</b>.`,
    };
  },
];

export const triangles = bank('triangles', templates, 220);
