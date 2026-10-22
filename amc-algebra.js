// AMC 10–style algebra: twelve problems modelled on ideas from past contests, with new numbers and wording (the real
// problems are the MAA's copyright). The family takes turns through them, so the first eight come up twice, with
// different numbers the second time.
import { combo, num, frac, gcd } from '../kit/bank.js';
import { choices, showFrac, range } from './amc-kit.js';

const NAMES = ['Mina', 'Tariq', 'Lena', 'Jonah', 'Priya', 'Mateo', 'Ines', 'Kofi', 'Hana', 'Dario'];
const pow = (b, e) => `${b}<sup>${e}</sup>`;
const sub = (v, i) => `${v}<sub>${i}</sub>`;
// a sum like 3a − 2b + 5, from [coefficient, letter] pairs (letter '' for a plain number), leaving out zeros
function expr(...terms) {
  let out = '';
  for (const [c, v] of terms) {
    if (!c) continue;
    const size = Math.abs(c) === 1 && v ? '' : num(Math.abs(c), 4);
    out += (out ? (c < 0 ? ' − ' : ' + ') : c < 0 ? '−' : '') + size + v;
  }
  return out || '0';
}
// a linear factor: (x + 3), (x − 2), or x
const factor = (s) => (s === 0 ? 'x' : `(x ${s < 0 ? '−' : '+'} ${Math.abs(s)})`);

// the parabola y = kx², and the triangle with P at the origin and Q, R at height kt²
function parabolaFigure(k, t) {
  const W = 300, H = 220, X = t + 1, reach = t + 0.75, top = k * reach * reach;
  const px = (x) => +(W / 2 + (x / X) * (W / 2 - 20)).toFixed(1), py = (y) => +(H - 30 - (y / top) * (H - 50)).toFixed(1);
  const curve = range(0, 40).map((i) => { const x = -reach + (i / 40) * 2 * reach; return `${i ? 'L' : 'M'}${px(x)} ${py(k * x * x)}`; }).join(' ');
  const P = [px(0), py(0)], Q = [px(-t), py(k * t * t)], R = [px(t), py(k * t * t)];
  const axis = 'class="tick" style="stroke-width:1;opacity:.45"';
  return `<svg class="tri" viewBox="0 0 ${W} ${H}" role="img" aria-label="Triangle PQR with its corners on a parabola">`
    + `<polygon class="side" points="${P} ${Q} ${R}"/>`
    + `<line ${axis} x1="14" y1="${P[1]}" x2="${W - 14}" y2="${P[1]}"/><line ${axis} x1="${P[0]}" y1="${H - 12}" x2="${P[0]}" y2="10"/>`
    + `<path class="seg" style="fill:none" d="${curve}"/>`
    + `<text class="vx" x="${P[0] + 8}" y="${P[1] + 18}">P</text><text class="vx" x="${Q[0] - 10}" y="${Q[1] + 5}" text-anchor="end">Q</text>`
    + `<text class="vx" x="${R[0] + 10}" y="${R[1] + 5}">R</text></svg>`;
}

export const algebra = [
  // 1. the floor of a ratio of sums of big powers: just below a power of the bigger base
  (d, ctx) => {
    const [[a, b], e, N] = combo(ctx, [[[4, 3], [5, 3], [5, 2], [5, 4], [6, 5], [7, 4], [7, 5], [9, 7]], [2, 3, 4], [40, 50, 60, 80, 100, 120]],
      ([a, b], e, N) => a ** e <= 3000 && a ** e * (b / a) ** (N - e) < 0.5);
    const A = a ** e, B = b ** e, m = N - e;
    return {
      topic: 'Ratios of big powers', rank: 14,
      text: `Let Q = <span class="fr"><span>${pow(a, N)} + ${pow(b, N)}</span><span>${pow(a, m)} + ${pow(b, m)}</span></span>. What is the greatest integer that does not exceed Q?`,
      answer: choices(d, A - 1, [A, A + B, A - B, A + B - 1, (a + b) ** e]),
      check: () => {
        const big = (x, y) => BigInt(x) ** BigInt(y), f = (big(a, N) + big(b, N)) / (big(a, m) + big(b, m));
        return f === BigInt(A - 1) ? '' : `the floor is ${f}`;
      },
      solution: `Take ${pow(a, e)} = ${num(A)} out of the top: ${pow(a, N)} + ${pow(b, N)} = ${pow(a, e)}(${pow(a, m)} + ${pow(b, m)}) − ${pow(b, m)}(${pow(a, e)} − ${pow(b, e)}). So Q = ${num(A)} − <span class="fr"><span>${num(A - B)} · ${pow(b, m)}</span><span>${pow(a, m)} + ${pow(b, m)}</span></span>. The part taken away is positive but less than ${num(A - B)} · (${b}/${a})<sup>${m}</sup>, which is far below 1. So Q is just under ${num(A)}, and the answer is <b>${num(A - 1)}</b>.`,
    };
  },
  // 2. two perpendicular lines through a given point: solve for their coefficients
  (d, ctx) => {
    const solve = (m, n, s, x0, y0) => {
      const den = s * m * x0 + n * y0;
      if (!den) return null;
      const a = (m * (n * x0 - s * m * y0)) / den, b = (-a * n) / m, c = a * x0 + m * y0;
      return Number.isInteger(a) && Number.isInteger(b) && a && b && c && Math.abs(c) <= 40 ? { a, b, c } : null;
    };
    const [m, n, s, x0, y0] = combo(ctx, [[-4, -3, -2, 2, 3, 4], [-3, -2, 2, 3, 4, 5], [-3, -2, -1, 2, 3], [-3, -2, -1, 1, 2, 3, 4], [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]],
      (m, n, s, x0, y0) => !!solve(m, n, s, x0, y0) && !(m === -2 && n === 2 && s === -1 && x0 === 1 && y0 === -5));
    const { a, b, c } = solve(m, n, s, x0, y0);
    return {
      topic: 'Perpendicular lines', rank: 10,
      text: `For some numbers a, b and c, the lines ${expr([1, 'ax'], [m, 'y'])} = c and ${expr([n, 'x'], [1, 'by'])} = ${expr([s, 'c'])} meet at a right angle at the point (${num(x0)}, ${num(y0)}). What is c?`,
      answer: choices(d, c, [-c, s * c, a, b, a * x0 - m * y0]),
      check: () => {
        // the three equations in a, b, c, solved again by Cramer's rule
        const M = [[x0, 0, -1, -m * y0], [0, y0, -s, -n * x0], [n, m, 0, 0]];
        const det = (r) => r[0][0] * (r[1][1] * r[2][2] - r[1][2] * r[2][1]) - r[0][1] * (r[1][0] * r[2][2] - r[1][2] * r[2][0]) + r[0][2] * (r[1][0] * r[2][1] - r[1][1] * r[2][0]);
        const D = det(M), Dc = det(M.map((row) => [row[0], row[1], row[3]]));
        return D && Math.abs(Dc / D - c) < 1e-9 ? '' : `Cramer's rule gives c = ${Dc / D}`;
      },
      solution: `Lines px + qy = r and p′x + q′y = r′ are perpendicular exactly when pp′ + qq′ = 0 (their slopes −p/q and −p′/q′ multiply to −1). Here that says ${expr([n, 'a'], [m, 'b'])} = 0. The point (${num(x0)}, ${num(y0)}) is on both lines: ${expr([x0, 'a'], [m * y0, ''])} = c and ${expr([n * x0, ''], [y0, 'b'])} = ${expr([s, 'c'])}. Solving these three equations gives a = ${num(a)}, b = ${num(b)} and c = <b>${num(c)}</b>.`,
    };
  },
  // 3. two prices, each a percent of what the budget leaves after the other: the share spent on both
  (d, ctx) => {
    const pct = (P, Q) => (100 * (100 * (P + Q) - 2 * P * Q)) / (10000 - P * Q);
    const [[big, small], P, Q] = combo(ctx, [[['concert ticket', 'snack'], ['paperback', 'coffee'], ['bus pass', 'lunch'], ['video game', 'drink'], ['museum pass', 'sandwich']], [10, 15, 20, 25, 30, 40], [5, 10, 15, 20]],
      (things, P, Q) => P > Q && !(P === 20 && Q === 5) && Math.abs((pct(P, Q) % 1) - 0.5) > 0.12);
    const who = d.pick(NAMES), p = P / 100, q = Q / 100, share = pct(P, Q), ans = Math.round(share);
    return {
      topic: 'Percent of what is left', rank: 14,
      text: `Each week ${who} buys a ${big} and a ${small} out of an allowance of A dollars. This week the ${big} cost ${P}% of whatever would be left of A after buying only the ${small}, while the ${small} cost ${Q}% of whatever would be left of A after buying only the ${big}. To the nearest whole percent, how much of A did the two cost altogether?`,
      answer: choices(d, ans, [P + Q, Math.round((100 * p * (1 - q)) / (1 - p * q)), Math.round(100 * (p + q - p * q)), Math.round((100 * (p + q)) / (1 + p * q))], (v) => `${num(v)}%`),
      check: () => {
        let t = 0, s = 0;
        for (let i = 0; i < 200; i++) { t = p * (100 - s); s = q * (100 - t); }
        return Math.round(t + s) === ans ? '' : `the prices settle at ${t + s}% of A`;
      },
      solution: `Call the two prices t and s. Then t = ${num(p)}(A − s) and s = ${num(q)}(A − t). Put the second into the first: t = ${num(p)}A − ${num(p * q, 4)}A + ${num(p * q, 4)}t, so t = ${frac(P * (100 - Q), 10000 - P * Q)} A. In the same way s = ${frac(Q * (100 - P), 10000 - P * Q)} A. Together they cost ${frac(100 * (P + Q) - 2 * P * Q, 10000 - P * Q)} A, which is about ${num(share, 2)}% of A: <b>${num(ans)}%</b> to the nearest percent.`,
    };
  },
  // 4. what people say against what is true: the fraction of one answer that is really the other
  (d, ctx) => {
    const SETTINGS = [['summer camp', 'campers', 'swimming'], ['cooking club', 'members', 'spicy food'], ['film club', 'members', 'horror movies'], ['school', 'students', 'chess']];
    const parts = (L, Y, N) => { const top = L * (100 - Y); return [top, top + (100 - L) * N]; };
    const [[place, who, thing], L, Y, N] = combo(ctx, [SETTINGS, [30, 40, 50, 70, 75, 80], [60, 70, 75, 80, 90], [60, 70, 75, 80, 90]],
      (s, L, Y, N) => { const [top, den] = parts(L, Y, N); return den / gcd(top, den) <= 60; });
    const [top, den] = parts(L, Y, N), other = (100 - L) * (100 - N);
    return {
      topic: 'Saying and meaning', rank: 11,
      text: `At a ${place}, ${L}% of the ${who} truly like ${thing} and the rest do not. When asked, ${Y}% of those who like ${thing} say so, and the others claim they don't; ${N}% of those who don't like it say so, and the others claim they do. What fraction of the ${who} who say they don't like ${thing} actually like it?`,
      answer: choices(d, [top, den], [[top, 10000], [100 - Y, 100], [other, other + L * Y], [den - top, den], [L, 100]], showFrac),
      check: () => {
        let sayNo = 0, sayNoButLike = 0;
        for (let i = 0; i < 10000; i++) {
          const likes = i < 100 * L, j = likes ? i : i - 100 * L;
          const saysNo = likes ? j >= L * Y : j < (100 - L) * N;
          if (saysNo) { sayNo++; if (likes) sayNoButLike++; }
        }
        return sayNoButLike * den === top * sayNo ? '' : `counted ${sayNoButLike}/${sayNo}`;
      },
      solution: `Picture 10,000 ${who}. ${num(100 * L)} like ${thing}, and ${num(top)} of them say they don't. ${num(100 * (100 - L))} don't like it, and ${num((100 - L) * N)} of them say so. So ${num(den)} say they don't like ${thing}, and ${num(top)} of those really do: ${num(top)}/${num(den)} = <b>${frac(top, den)}</b>.`,
    };
  },
  // 5. the least value of four evenly spaced linear factors multiplied, plus a constant
  (d, ctx) => {
    const [g, s] = combo(ctx, [[1, 2, 3], range(-6, 5)], (g, s) => !(g === 1 && s === 1));
    const K = d.int(60, 480), ans = K - g ** 4, p = 2 * s + 3 * g, q1 = s * (s + 3 * g), q2 = (s + g) * (s + 2 * g);
    const product = [0, 1, 2, 3].map((i) => factor(s + i * g)).join('');
    return {
      topic: 'Least value of a product', rank: 19,
      text: `As x ranges over all real numbers, what is the smallest value of ${product} + ${K}?`,
      answer: choices(d, ans, [K, K - g * g, K + g ** 4, K - 2 * g ** 4, K - 3 * g ** 4, K - 4 * g ** 4]),
      check: () => {
        let low = Infinity;
        for (let x = -s - 3 * g - 1; x <= -s + 1; x += 1e-4) low = Math.min(low, (x + s) * (x + s + g) * (x + s + 2 * g) * (x + s + 3 * g) + K);
        return Math.abs(low - ans) < 1e-3 ? '' : `a scan finds ${low}`;
      },
      solution: `Multiply the outer pair and the inner pair. ${factor(s)}${factor(s + 3 * g)} = ${expr([1, 'x<sup>2</sup>'], [p, 'x'], [q1, ''])}; call it u. Then ${factor(s + g)}${factor(s + 2 * g)} = ${expr([1, 'x<sup>2</sup>'], [p, 'x'], [q2, ''])} = u + ${2 * g * g}. So the expression is u(u + ${2 * g * g}) + ${K} = (u + ${g * g})<sup>2</sup> − ${g ** 4} + ${K}. That is least when u = −${g * g}, which some real x gives (u goes as low as −${num((9 * g * g) / 4)}). The least value is ${K} − ${g ** 4} = <b>${ans}</b>.`,
    };
  },
  // 6. objects in a triangle, one more in each row: how many rows
  (d, ctx) => {
    const [N, things] = combo(ctx, [range(31, 99).filter((n) => n !== 63), ['cans', 'marbles', 'tiles', 'cups']]), T = (N * (N + 1)) / 2;
    return {
      topic: 'Triangular numbers', rank: 9,
      text: `${num(T)} ${things} are arranged in a triangle: 1 in the first row, 2 in the second row, 3 in the third, and so on, each row holding one more than the row before. How many rows are there?`,
      answer: choices(d, N, [N - 1, N + 1, N + 2, N - 2, Math.floor(Math.sqrt(T))]),
      check: () => { let rows = 0, used = 0; while (used < T) used += ++rows; return used === T && rows === N ? '' : `${rows} rows hold ${used}`; },
      solution: `With N rows there are 1 + 2 + ⋯ + N = N(N + 1)/2 ${things}, so N(N + 1) = ${num(2 * T)}. That is a little more than N<sup>2</sup>, so N is just under √${num(2 * T)} ≈ ${num(Math.sqrt(2 * T), 1)}; and indeed ${N} · ${N + 1} = ${num(2 * T)}. There are <b>${N}</b> rows.`,
    };
  },
  // 7. f(n) = f(n − 1) − f(n − 2) + cn: take away c(n + 1) and what is left repeats every 6 terms
  (d, ctx) => {
    const [c, f1, f2] = combo(ctx, [[1, 2, 3], [-2, -1, 0, 1, 2, 3], [-2, -1, 0, 1, 2, 3]], (c, f1, f2) => !(c === 1 && f1 === 1 && f2 === 1));
    let N = d.int(1000, 2100);
    if (N === 2018) N++;
    const g = [null, f1 - 2 * c, f2 - 3 * c];
    g.push(g[2] - g[1], -g[1], -g[2], g[1] - g[2]);
    const r = ((N - 1) % 6) + 1, ans = c * (N + 1) + g[r], C = c === 1 ? '' : c, lin = c === 1 ? 'n + 1' : `${c}(n + 1)`;
    return {
      topic: 'Recursive functions', rank: 20,
      text: `A function f on the positive integers has f(1) = ${num(f1)}, f(2) = ${num(f2)}, and f(n) = f(n − 1) − f(n − 2) + ${C}n for every n ≥ 3. What is f(${N})?`,
      answer: choices(d, ans, [c * (N + 1), c * N, ans + 1, ans - 1, ans + c, ans - c]),
      check: () => { let [x, y] = [f1, f2]; for (let n = 3; n <= N; n++) [x, y] = [y, y - x + c * n]; return y === ans ? '' : `f(${N}) is ${y}`; },
      solution: `First, ${lin} itself obeys the rule: ${C}n − ${C}(n − 1) + ${C}n = ${lin}. So g(n) = f(n) − ${c === 1 ? '(n + 1)' : lin} follows g(n) = g(n − 1) − g(n − 2), which repeats every 6 terms: g(1) = ${num(g[1])}, g(2) = ${num(g[2])}, then ${[3, 4, 5, 6].map((i) => num(g[i])).join(', ')}, and back to ${num(g[1])}, ${num(g[2])}, …. Since ${N} = 6 · ${Math.floor((N - 1) / 6)} + ${r}, g(${N}) = g(${r}) = ${num(g[r])}, and f(${N}) = ${num(c * (N + 1))} ${g[r] < 0 ? '−' : '+'} ${num(Math.abs(g[r]))} = <b>${num(ans)}</b>.`,
    };
  },
  // 8. a sequence whose reciprocals are arithmetic: a far term in lowest terms
  (d, ctx) => {
    const [u, [v, w], N] = combo(ctx, [[1, 2], [[2, 5], [3, 5], [3, 8], [4, 9], [2, 7], [5, 12], [3, 10], [5, 9], [4, 11], [5, 13]], [100, 150, 200, 250, 300, 500, 1000, 2026]],
      (u, [v, w]) => w > u * v && gcd(v, w) === 1);
    const term = (n) => { const t = u * v + (n - 1) * (w - u * v), g = gcd(v, t); return [v / g, t / g]; };
    const [p, q] = term(N), sum = ([x, y]) => x + y, step = w - u * v;
    const an = (i) => `a<sub>${i}</sub>`;
    return {
      topic: 'Reciprocal sequences', rank: 15,
      text: `A sequence has ${an(1)} = ${u === 1 ? '1' : frac(1, u)}, ${an(2)} = ${frac(v, w)}, and each later term is ${an('n')} = <span class="fr"><span>${an('n−2')} · ${an('n−1')}</span><span>2${an('n−2')} − ${an('n−1')}</span></span>. Written in lowest terms, ${an(N)} = p/q. What is p + q?`,
      answer: choices(d, p + q, [sum(term(N - 1)), sum(term(N + 1)), q, q - p, v + u * v + (N - 1) * step]),
      check: () => {
        const G = (x, y) => (y ? G(y, x % y) : x < 0n ? -x : x);
        let a = [1n, BigInt(u)], b = [BigInt(v), BigInt(w)];
        // the rule itself, with exact fractions: a·b / (2a − b) = a₀b₀ / (2a₀b₁ − b₀a₁)
        for (let n = 3; n <= N; n++) {
          const next = [a[0] * b[0], 2n * a[0] * b[1] - b[0] * a[1]], g = G(next[0], next[1]);
          [a, b] = [b, [next[0] / g, next[1] / g]];
        }
        return Number(b[0]) === p && Number(b[1]) === q ? '' : `the term is ${b[0]}/${b[1]}`;
      },
      solution: `Turn the rule upside down: 1/${an('n')} = (2${an('n−2')} − ${an('n−1')})/(${an('n−2')}${an('n−1')}) = 2/${an('n−1')} − 1/${an('n−2')}. So the reciprocals go up by the same step each time: 1/${an(1)} = ${u}, 1/${an(2)} = ${frac(w, v)}, a step of ${frac(step, v)}. Then 1/${an(N)} = ${u} + ${N - 1} · ${frac(step, v)} = ${frac(u * v + (N - 1) * step, v)}, so ${an(N)} = ${frac(p, q)} and p + q = <b>${num(p + q)}</b>.`,
    };
  },
  // 9. a triangle with its corners on a parabola, one at the vertex: the length of its level side
  (d, ctx) => {
    const [[kp, kq], t] = combo(ctx, [[[1, 1], [2, 1], [3, 1], [1, 2], [1, 3]], [2, 3, 5, 6]], ([kp, kq], t) => (kp * t ** 3) % kq === 0);
    const k = kp / kq, area = (kp * t ** 3) / kq, K = kq === 1 ? (kp === 1 ? '' : kp) : frac(kp, kq);
    return {
      topic: 'Parabolas and triangles', rank: 9,
      text: `Triangle PQR has all three corners on the parabola y = ${K}x<sup>2</sup>: P is at the origin, and side QR is parallel to the x-axis. The area of the triangle is ${area}. How long is QR?`,
      figure: parabolaFigure(k, t),
      answer: choices(d, 2 * t, [t, 4 * t, t * t, 2 * t * t, Math.round(Math.sqrt(area))]),
      check: () => {
        // the area grows with the half-width, so step it up until the area is reached
        let h = 0;
        while (k * h ** 3 < area - 1e-9) h += 0.001;
        return Math.abs(2 * h - 2 * t) < 0.01 ? '' : `half-width ${h}`;
      },
      solution: `QR is level, so Q and R are mirror images in the y-axis: Q = (−t, ${K}t<sup>2</sup>) and R = (t, ${K}t<sup>2</sup>) for some t > 0. The base QR is 2t long and the height from P up to it is ${K}t<sup>2</sup>, so the area is ½ · 2t · ${K}t<sup>2</sup> = ${K}t<sup>3</sup> = ${area}. That gives t<sup>3</sup> = ${t ** 3}, so t = ${t} and QR = <b>${2 * t}</b>.`,
    };
  },
  // 10. an infinite geometric series with one term fixed: the least possible sum
  (d, ctx) => {
    const [which, t] = combo(ctx, [['second', 'third'], [2, 3, 5, 6, 8, 12]]);
    const second = which === 'second', ans = second ? [4 * t, 1] : [27 * t, 4];
    const S = (r) => (second ? t / (r * (1 - r)) : t / (r * r * (1 - r)));
    return {
      topic: 'Geometric series', rank: 16,
      text: second
        ? `The terms of an infinite geometric series add up to a positive number S, and the series' second term is ${t}. What is the smallest value S can have?`
        : `Every term of an infinite geometric series is positive, and its third term is ${t}. What is the smallest the sum of the whole series can be?`,
      answer: choices(d, ans, second ? [[2 * t, 1], [3 * t, 1], [8 * t, 1], [t, 1], [9 * t, 2]] : [[4 * t, 1], [8 * t, 1], [27 * t, 8], [9 * t, 2], [27 * t, 2]], showFrac),
      check: () => {
        let low = Infinity;
        for (let r = 1e-4; r < 1; r += 1e-5) low = Math.min(low, S(r));
        return Math.abs(low - ans[0] / ans[1]) < 1e-4 * low ? '' : `a scan finds ${low}`;
      },
      solution: second
        ? `Call the first term a and the ratio r (with −1 &lt; r &lt; 1). Then ar = ${t} and S = a/(1 − r) = ${t}/(r(1 − r)). For S to be positive, r must be between 0 and 1, where r(1 − r) is at most ${frac(1, 4)} (at r = ${frac(1, 2)}). So S is at least ${t} ÷ ${frac(1, 4)} = <b>${4 * t}</b>, reached when r = ${frac(1, 2)} and a = ${2 * t}.`
        : `Call the first term a and the ratio r; every term is positive, so 0 &lt; r &lt; 1. Then ar<sup>2</sup> = ${t} and the sum is a/(1 − r) = ${t}/(r<sup>2</sup>(1 − r)). By AM–GM on r/2, r/2 and 1 − r, which add to 1, their product is at most (${frac(1, 3)})<sup>3</sup>; so r<sup>2</sup>(1 − r) is at most ${frac(4, 27)}, at r = ${frac(2, 3)}. The least sum is ${t} · ${frac(27, 4)} = <b>${frac(27 * t, 4)}</b>.`,
    };
  },
  // 11. a Fibonacci-like sequence of remainders: it repeats, so a block of one cycle's length sums to one full cycle
  (d, ctx) => {
    const [m] = combo(ctx, [[2, 4, 5, 6, 7]]);
    const cyc = [0, 1];
    while (!(cyc.length > 2 && cyc.at(-2) === 0 && cyc.at(-1) === 1)) cyc.push((cyc.at(-1) + cyc.at(-2)) % m);
    cyc.length -= 2;
    const P = cyc.length, total = cyc.reduce((x, y) => x + y, 0), s = d.int(1950, 2100), G = (i) => sub('G', i);
    return {
      topic: 'Fibonacci remainders', rank: 13,
      text: `A sequence starts ${G(0)} = 0 and ${G(1)} = 1, and from then on each term ${G('n')} is the remainder when ${G('n−1')} + ${G('n−2')} is divided by ${m}. It begins ${range(0, 9).map((i) => cyc[i % P]).join(', ')}, …. What is ${P > 3 ? `${G(s)} + ${G(s + 1)} + ⋯ + ${G(s + P - 1)}` : range(s, s + P - 1).map(G).join(' + ')}?`,
      answer: choices(d, total, [total + 1, total - 1, total + m, Math.round((P * (m - 1)) / 2), total - m, 2 * total]),
      check: () => {
        let [x, y] = [0, 1], sum = 0;
        for (let i = 0; i < s + P; i++) { if (i >= s) sum += x; [x, y] = [y, (x + y) % m]; }
        return sum === total ? '' : `the terms add to ${sum}`;
      },
      solution: `Each term depends only on the two before it, and there are only ${m * m} possible pairs of remainders, so the sequence must repeat. Listing it: ${cyc.join(', ')}, then 0, 1 again: a cycle of ${P} terms. Any ${P} terms in a row make up one full cycle, just started at a different place, so the sum is ${cyc.join(' + ')} = <b>${total}</b>.`,
    };
  },
  // 12. ages that are multiples of a child's age: that happens exactly when the child's age divides the age gap
  (d, ctx) => {
    const divisors = (x) => range(1, x).filter((k) => x % k === 0).length;
    const [[lo, D], gap] = combo(ctx, [[[20, 8], [20, 3], [30, 8], [30, 6], [40, 10]], [2, 3, 4, 5, 6]]);
    const g = range(lo - 1, lo + 8).find((x) => divisors(x) === D), z = range(2, g + gap).find((k) => (g + gap) % k === 0), ans = g + gap + z;
    const [kid, A, B] = d.shuffle(NAMES).slice(0, 3);
    return {
      topic: 'Age multiples', rank: 19,
      text: `Today ${kid} turns 1, and it is also the birthday of both of ${kid}'s parents, ${A} and ${B}. ${A} is between ${lo} and ${lo + 9} years old, and ${B} is ${gap} years older than ${A}. Today is the first of exactly ${D} birthdays on which ${A}'s age is a whole-number multiple of ${kid}'s age. How old will ${B} be the next time ${B}'s age is a multiple of ${kid}'s age?`,
      answer: choices(d, ans, [2 * (g + gap), g + gap + 2, g + z, ans + 1, g + 1 + gap]),
      check: () => {
        const fits = range(lo, lo + 9).filter((a) => range(0, 300).filter((y) => (a + y) % (1 + y) === 0).length === D);
        if (fits.length !== 1) return `${A} could be ${fits.join(' or ') || 'no age'}`;
        const b = fits[0] + gap, y = range(1, 300).find((y) => (b + y) % (1 + y) === 0);
        return b + y === ans ? '' : `${B} is ${b + y} then`;
      },
      solution: `Let G be the gap between ${A}'s and ${kid}'s ages. When ${kid} is z, ${A} is z + G, which is a multiple of z exactly when z divides G. So the number of such birthdays is the number of divisors of G. ${A} is ${lo} to ${lo + 9}, so G is ${lo - 1} to ${lo + 8}, and the only number there with exactly ${D} divisors is ${g}. ${B}'s gap is ${g + gap}, and its smallest divisor above 1 is ${z}. So the next time is when ${kid} turns ${z}, and ${B} is then ${g + gap} + ${z} = <b>${ans}</b>.`,
    };
  },
];
