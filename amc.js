// AMC 10–style practice: 12 topics, 20 variants each (240). These are original problems in the style of the AMC 10
// (real past AMC problems are the MAA's copyright). Five choices, (A)–(E), in increasing order, the wrong ones mostly
// the slips people actually make.
import { bank, combo, num, frac, gcd, lcm, choose } from '../kit/bank.js';

const ord = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
const range = (a, b, step = 1) => { const out = []; for (let v = a; v <= b; v += step) out.push(v); return out; };
// five choices: the answer, then wrong ones (skipping repeats), topped up with near misses; sorted like the AMC.
// values are numbers, or fractions as [p, q]
function choices(d, correct, wrongs, show = (v) => num(v, 4)) {
  const val = (v) => (Array.isArray(v) ? v[0] / v[1] : v), same = (a, b) => Math.abs(val(a) - val(b)) < 1e-9;
  const list = [correct];
  for (const w of wrongs) if (list.length < 5 && Number.isFinite(val(w)) && !list.some((v) => same(v, w)) && (val(correct) < 0 || val(w) >= 0)) list.push(w);
  const unit = Array.isArray(correct) ? null : Math.max(1, Math.round(Math.abs(correct) / 10));
  for (let k = 1; list.length < 5; k++) {
    for (const s of d.shuffle([1, -1])) {
      const cand = Array.isArray(correct) ? [correct[0] + s * k, correct[1]] : correct + s * k * unit;
      if (list.length < 5 && val(cand) >= 0 && !list.some((v) => same(v, cand))) list.push(cand);
    }
  }
  list.sort((a, b) => val(a) - val(b));
  return { kind: 'choice', choices: list.map(show), correct: list.findIndex((v) => same(v, correct)) };
}
const showFrac = (v) => (Array.isArray(v) ? frac(v[0], v[1]) : num(v, 4));

const templates = [
  // 1. arithmetic sequences
  (d, ctx) => {
    const [i, gap, dd] = combo(ctx, [[2, 3, 4, 5], [3, 4, 5, 6, 7, 8], [-7, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 9]]);
    const a1 = d.int(-15, 30), j = i + gap, n = d.int(j + 8, 40), t = (k) => a1 + (k - 1) * dd;
    return {
      topic: 'Arithmetic sequences',
      text: `In an arithmetic sequence, the ${ord(i)} term is ${num(t(i))} and the ${ord(j)} term is ${num(t(j))}. What is the ${ord(n)} term?`,
      answer: choices(d, t(n), [t(n) + dd, t(n) - dd, a1 + n * dd, t(i) + (n - i + 1) * dd, t(n) + 2 * dd]),
      check: () => ((t(j) - t(i)) / (j - i) === dd && t(i) + (n - i) * dd === t(n) ? '' : 'sequence wrong'),
      solution: `The common difference is (${num(t(j))} − ${num(t(i))}) / (${j} − ${i}) = ${num(dd)}. Then the ${ord(n)} term is the ${ord(i)} term plus ${n - i} steps: ${num(t(i))} + ${n - i}·(${num(dd)}) = <b>${num(t(n))}</b>.`,
    };
  },
  // 2. remainders of powers
  (d, ctx) => {
    const [b, m] = combo(ctx, [[2, 3, 5, 6, 7], [5, 7, 9, 11, 13]], (b, m) => gcd(b, m) === 1 && b % m !== 1), k = d.int(20, 150);
    const cyc = []; let v = 1; do { v = (v * b) % m; cyc.push(v); } while (v !== 1);
    const r = cyc[(k - 1) % cyc.length];
    return {
      topic: 'Remainders of powers',
      text: `What is the remainder when ${b}<sup>${k}</sup> is divided by ${m}?`,
      answer: choices(d, r, d.shuffle(range(0, m - 1)).filter((x) => x !== r)),
      check: () => (Number(BigInt(b) ** BigInt(k) % BigInt(m)) === r ? '' : 'remainder wrong'),
      solution: `Powers of ${b} mod ${m} repeat: ${cyc.join(', ')}, then start over (a cycle of ${cyc.length}). ${k} = ${cyc.length}·${Math.floor((k - 1) / cyc.length)} + ${((k - 1) % cyc.length) + 1}, so ${b}<sup>${k}</sup> leaves the same remainder as ${b}<sup>${((k - 1) % cyc.length) + 1}</sup>: <b>${r}</b>.`,
    };
  },
  // 3. counting divisors
  (d, ctx) => {
    const [[p, q, r], a, b, c] = combo(ctx, [[[2, 3, 5], [2, 3, 7], [2, 5, 7], [3, 5, 7], [2, 3, 11]], [1, 2, 3, 4, 5], [1, 2, 3], [0, 1, 2]], (pr, a, b, c) => pr[0] ** a * pr[1] ** b * pr[2] ** c <= 2000000 && (c > 0 || !(pr[0] === 2 && pr[1] === 3 && pr[2] !== 5)));
    const N = p ** a * q ** b * r ** c, count = (a + 1) * (b + 1) * (c + 1);
    const fac = [[p, a], [q, b], [r, c]].filter(([, e]) => e).map(([x, e]) => (e > 1 ? `${x}<sup>${e}</sup>` : x)).join(' · ');
    return {
      topic: 'Counting divisors',
      text: `How many positive divisors does ${num(N, 0)} have?`,
      answer: choices(d, count, [a * b * Math.max(c, 1), (a + 1) * (b + 1) * (c + 1) - 2, a + b + c + 1, (a + 1) * (b + 1), count + (a + 1)]),
      solution: `${num(N, 0)} = ${fac}. A divisor picks each prime's power from 0 up to its exponent, so there are ${[a, b, c].filter((e) => e).map((e) => `(${e} + 1)`).join(' · ')} = <b>${count}</b> divisors.`,
      check: () => { let k = 0; for (let i = 1; i * i <= N; i++) if (N % i === 0) k += i * i === N ? 1 : 2; return k === count ? '' : `divisors: counted ${k}, said ${count}`; },
    };
  },
  // 4. dice probability
  (d, ctx) => {
    const [kind, s] = combo(ctx, [['equal', 'atleast', 'multiple'], range(2, 12)], (k, s) => (k === 'equal' ? true : k === 'atleast' ? s >= 3 : [3, 4, 5, 6].includes(s)));
    let count = 0;
    for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (kind === 'equal' ? x + y === s : kind === 'atleast' ? x + y >= s : (x + y) % s === 0) count++;
    const phrase = kind === 'equal' ? `the sum is ${s}` : kind === 'atleast' ? `the sum is at least ${s}` : `the sum is a multiple of ${s}`;
    return {
      topic: 'Probability with dice',
      text: `Two fair six-sided dice are rolled. What is the probability that ${phrase}?`,
      answer: choices(d, [count, 36], [[count + 1, 36], [Math.max(count - 1, 1), 36], [count, 21], [36 - count, 36], [count, 30]], showFrac),
      solution: `There are 36 equally likely outcomes, and ${count} of them have ${phrase}. Probability = ${count}/36 = <b>${frac(count, 36)}</b>.`,
    };
  },
  // 5. committees with a restriction
  (d, ctx) => {
    const [n, k] = combo(ctx, [range(7, 14), [3, 4, 5]]), total = choose(n, k), both = choose(n - 2, k - 2), good = total - both;
    const [P1, P2] = d.pick([['Alex', 'Blake'], ['Casey', 'Drew'], ['Emery', 'Finn'], ['Gray', 'Harper'], ['Jordan', 'Kai']]);
    return {
      topic: 'Counting committees',
      text: `A club has ${n} members. A committee of ${k} is chosen, but ${P1} and ${P2} refuse to serve together. How many different committees are possible?`,
      answer: choices(d, good, [total, choose(n - 2, k), total - choose(n - 2, k - 1), choose(n - 1, k), good - both]),
      check: () => { let c = 0; for (let mask = 0; mask < 1 << n; mask++) { let bits = 0; for (let i = 0; i < n; i++) if (mask & (1 << i)) bits++; if (bits === k && (mask & 3) !== 3) c++; } return c === good ? '' : `committees: counted ${c}, said ${good}`; },
      solution: `All committees: C(${n}, ${k}) = ${total}. Committees with both ${P1} and ${P2}: choose the other ${k - 2} from ${n - 2}, C(${n - 2}, ${k - 2}) = ${both}. Allowed: ${total} − ${both} = <b>${good}</b>.`,
    };
  },
  // 6. the altitude to the hypotenuse
  (d, ctx) => {
    const [[a0, b0, c0], s] = combo(ctx, [[[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37]], [1, 2, 3]]);
    const a = a0 * s, b = b0 * s, c = c0 * s;
    return {
      topic: 'Right triangles',
      text: `A right triangle has legs of length ${a} and ${b}. What is the length of the altitude to the hypotenuse?`,
      answer: choices(d, [a * b, c], [[a * b, a + b], [c, 2], [a * b, 2 * c], [a + b, 2], [a * b, c + 1]], showFrac),
      solution: `The hypotenuse is √(${a}² + ${b}²) = ${c}. The area is ½·${a}·${b} = ${num((a * b) / 2)}, and also ½·${c}·h. So h = ${a}·${b}/${c} = <b>${frac(a * b, c)}</b>.`,
    };
  },
  // 7. inclusion–exclusion
  (d, ctx) => {
    const [N, [a, b], neither] = combo(ctx, [[100, 120, 150, 200, 250, 300, 360, 400, 500, 600, 1000], [[2, 3], [2, 5], [3, 4], [3, 5], [4, 6], [4, 10], [5, 6], [6, 9], [6, 10], [7, 11], [8, 12]], [false, true]]);
    const L = lcm(a, b), both = Math.floor(N / L), either = Math.floor(N / a) + Math.floor(N / b) - both, value = neither ? N - either : either;
    return {
      topic: 'Inclusion and exclusion',
      text: `How many integers from 1 to ${N} are divisible by ${neither ? `neither ${a} nor ${b}` : `${a} or ${b}`}?`,
      answer: choices(d, value, neither ? [N - Math.floor(N / a) - Math.floor(N / b), N - either + both, either, N - Math.floor(N / (a * b))] : [Math.floor(N / a) + Math.floor(N / b), Math.floor(N / a) + Math.floor(N / b) - Math.floor(N / (a * b)), both, either + both]),
      check: () => { let c = 0; for (let i = 1; i <= N; i++) { const hit = i % a === 0 || i % b === 0; if (neither ? !hit : hit) c++; } return c === value ? '' : `counted ${c}, said ${value}`; },
      solution: `Divisible by ${a}: ${Math.floor(N / a)}. By ${b}: ${Math.floor(N / b)}. By both (by lcm ${L}): ${both}. By ${a} or ${b}: ${Math.floor(N / a)} + ${Math.floor(N / b)} − ${both} = ${either}.` + (neither ? ` Neither: ${N} − ${either} = <b>${value}</b>.` : ` So the answer is <b>${value}</b>.`),
    };
  },
  // 8. symmetric sums
  (d, ctx) => {
    const [s, p, ask] = combo(ctx, [range(2, 12), [-6, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10, 12, 15], ['squares', 'cubes']]);
    const value = ask === 'squares' ? s * s - 2 * p : s ** 3 - 3 * s * p;
    return {
      topic: 'Symmetric sums',
      text: `Real or not, x and y satisfy x + y = ${s} and xy = ${num(p)}. What is ${ask === 'squares' ? 'x<sup>2</sup> + y<sup>2</sup>' : 'x<sup>3</sup> + y<sup>3</sup>'}?`,
      answer: choices(d, value, ask === 'squares' ? [s * s - p, s * s + 2 * p, s * s, 2 * s - p] : [s ** 3 - s * p, s ** 3 + 3 * s * p, s ** 3, s ** 3 - 3 * p]),
      solution: ask === 'squares' ? `x² + y² = (x + y)² − 2xy = ${s}² − 2·(${num(p)}) = <b>${num(value)}</b>.` : `x³ + y³ = (x + y)³ − 3xy(x + y) = ${s}³ − 3·(${num(p)})·${s} = <b>${num(value)}</b>.`,
    };
  },
  // 9. percent change, twice
  (d, ctx) => {
    const [up, down] = combo(ctx, [[10, 20, 25, 30, 40, 50, 60], [10, 20, 25, 30, 40, 50, 60]], (u, w) => u !== w || u === 50);
    const net = Math.round(((1 + up / 100) * (1 - down / 100) - 1) * 10000) / 100;
    const show = (v) => (v > 0 ? `${num(v, 2)}% increase` : v < 0 ? `${num(-v, 2)}% decrease` : 'no change');
    return {
      topic: 'Percent change',
      text: `The price of a game rises by ${up}%. Later, the new price falls by ${down}%. Overall, how did the price change?`,
      answer: choices(d, net, [up - down, -(up * down) / 100, up - down - (up * down) / 100 + 10, down - up], show),
      solution: `Multiply the factors: ${num(1 + up / 100, 2)} × ${num(1 - down / 100, 2)} = ${num((1 + up / 100) * (1 - down / 100), 4)}. That is a <b>${show(net)}</b>, not simply ${up}% − ${down}%.`,
    };
  },
  // 10. working together
  (d, ctx) => {
    const [a, b] = combo(ctx, [range(2, 12), range(3, 18)], (a, b) => b > a && (a * b) % (a + b) !== 0);
    const show = (v) => { const [p, q] = v, g = gcd(p, q); const P = p / g, Q = q / g; return Q === 1 ? `${P} hours` : P > Q ? `${Math.floor(P / Q)} ${frac(P % Q, Q)} hours` : `${frac(P, Q)} hour`; };
    return {
      topic: 'Working together',
      text: `Alone, one pump fills a tank in ${a} hours and a second pump fills it in ${b} hours. How long do they take working together?`,
      answer: choices(d, [a * b, a + b], [[a + b, 2], [a, 2], [a * b, a + b + 1], [a * b - 1, a + b], [b - a, 1]], show),
      solution: `Rates add: 1/${a} + 1/${b} = ${a + b}/${a * b} of the tank per hour. Time = ${a * b}/${a + b} = <b>${show([a * b, a + b])}</b>.`,
    };
  },
  // 11. averages
  (d, ctx) => {
    const [n, change] = combo(ctx, [range(4, 12), [-4, -3, -2, -1, 1, 2, 3, 4, 5]]), m = d.int(60, 85), m2 = m + change, x = (n + 1) * m2 - n * m;
    return {
      topic: 'Averages',
      text: `The average of ${n} test scores is ${m}. After one more test, the average of all ${n + 1} scores is ${m2}. What was the score on the new test?`,
      answer: choices(d, x, [m2 + change, n * m2 - (n - 1) * m, m2, x + n, x - change]),
      check: () => (Math.abs((n * m + x) / (n + 1) - m2) < 1e-9 ? '' : 'average wrong'),
      solution: `The ${n} scores add to ${n}·${m} = ${n * m}. All ${n + 1} add to ${n + 1}·${m2} = ${(n + 1) * m2}. The new score is ${(n + 1) * m2} − ${n * m} = <b>${x}</b>.`,
    };
  },
  // 12. area of a triangle from coordinates
  (d) => {
    let P, area;
    do {
      P = [[d.int(-6, 2), d.int(-5, 3)], [d.int(1, 8), d.int(-6, 2)], [d.int(-3, 6), d.int(2, 9)]];
      area = Math.abs((P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1])) / 2;
    } while (area < 6);
    const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]), boxA = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
    const pt = ([x, y]) => `(${num(x)}, ${num(y)})`;
    return {
      topic: 'Coordinate geometry',
      text: `What is the area of the triangle with vertices ${pt(P[0])}, ${pt(P[1])} and ${pt(P[2])}?`,
      answer: choices(d, area, [2 * area, area + 1, boxA, area - 1, boxA / 2]),
      solution: `Shoelace formula: ½·|(x₂ − x₁)(y₃ − y₁) − (x₃ − x₁)(y₂ − y₁)| = ½·|(${P[1][0] - P[0][0]})(${P[2][1] - P[0][1]}) − (${P[2][0] - P[0][0]})(${P[1][1] - P[0][1]})| = <b>${num(area)}</b>.`,
    };
  },
];

export const amc = bank('amc10', templates, 240);
