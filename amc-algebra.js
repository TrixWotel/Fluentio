// AMC 10–style algebra: twelve topics, each with several kinds of question on the same idea (a different unknown, a
// different setup, working backward), modelled on ideas from past contests with new numbers and wording (the real
// problems are the MAA's copyright). A topic takes turns through its kinds, so its variants are different questions.
import { combo, num, frac, gcd } from '../kit/bank.js';
import { choices, labelled, fracSurd, showFrac, range } from './amc-kit.js';

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
// a fraction in lowest terms with a positive bottom, as [p, q]
const ratio = (p, q) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return [p / g, q / g]; };
const tri = (n) => (n * (n + 1)) / 2;
const less = (v, x) => `${v} ${x < 0 ? '+' : '−'} ${num(Math.abs(x))}`;     // v − x, written without a double minus
const paren = (x) => (x < 0 ? `(${num(x)})` : num(x));
const divisorsOf = (x) => range(1, x).filter((k) => x % k === 0);
// a coefficient in front of x² (nothing for 1), and the same number standing alone
const kText = (kp, kq) => (kq === 1 ? (kp === 1 ? '' : String(kp)) : frac(kp, kq));
const kNum = (kp, kq) => showFrac(ratio(kp, kq));
// one cycle of the Fibonacci remainders mod m (after it, 0, 1 comes back)
function pisano(m) {
  const c = [0, 1];
  while (!(c.length > 2 && c.at(-2) === 0 && c.at(-1) === 1)) c.push((c.at(-1) + c.at(-2)) % m);
  c.length -= 2;
  return c;
}
const fibIntro = (m, cyc) => { const G = (i) => sub('G', i); return `A sequence starts ${G(0)} = 0 and ${G(1)} = 1, and from then on each term ${G('n')} is the remainder when ${G('n−1')} + ${G('n−2')} is divided by ${m}. It begins ${range(0, 9).map((i) => cyc[i % cyc.length]).join(', ')}, ….`; };

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

const SETTINGS = [['summer camp', 'campers', 'swimming'], ['cooking club', 'members', 'spicy food'], ['film club', 'members', 'horror movies'], ['school', 'students', 'chess']];
// out of 10,000 people: how many like it, say they like it, and so on
function survey(L, Y, N) {
  let likeSayYes = 0, likeSayNo = 0, notSayYes = 0, notSayNo = 0;
  for (let i = 0; i < 10000; i++) {
    const likes = i < 100 * L, j = likes ? i : i - 100 * L;
    if (likes) { if (j < L * Y) likeSayYes++; else likeSayNo++; } else if (j < (100 - L) * N) notSayNo++; else notSayYes++;
  }
  return { likeSayYes, likeSayNo, notSayYes, notSayNo };
}

export const algebra = {
  'Percent of what is left': [
    // two prices, each a percent of what the budget leaves after the other: the share spent on both
    (d, ctx) => {
      const pct = (P, Q) => (100 * (100 * (P + Q) - 2 * P * Q)) / (10000 - P * Q);
      const [P, Q] = combo(ctx, [[10, 15, 20, 25, 30, 40], [5, 10, 15, 20]], (P, Q) => P > Q && !(P === 20 && Q === 5) && Math.abs((pct(P, Q) % 1) - 0.5) > 0.12);
      const [big, small] = d.pick([['concert ticket', 'snack'], ['paperback', 'coffee'], ['bus pass', 'lunch'], ['video game', 'drink'], ['museum pass', 'sandwich']]), who = d.pick(NAMES), p = P / 100, q = Q / 100, share = pct(P, Q), ans = Math.round(share);
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
    // one percent after another: the second is a percent of what the first left
    (d, ctx) => {
      const [P, Q] = combo(ctx, [[10, 20, 25, 30, 40, 50, 60], [10, 20, 25, 40, 50]]);
      const [first, second, whole] = d.pick([['a book', 'lunch', 'gift card'], ['a jacket', 'a gift', 'paycheck'], ['rent', 'groceries', 'paycheck'], ['a bike', 'a helmet', 'prize']]), who = d.pick(NAMES), left = ((100 - P) * (100 - Q)) / 100;
      return {
        topic: 'Percent of what is left', rank: 5,
        text: `${who} spends ${P}% of a ${whole} on ${first}, and then ${Q}% of what is left on ${second}. What percent of the ${whole} is left?`,
        answer: choices(d, left, [100 - P - Q, 100 - left, ((100 - P) * Q) / 100, 100 - P, (P * Q) / 100], (v) => `${num(v, 2)}%`),
        check: () => { let x = 10000; x -= (x * P) / 100; x -= (x * Q) / 100; return Math.abs(x / 100 - left) < 1e-9 ? '' : `${x / 100}% is left`; },
        solution: `After ${first.replace(/^a /, 'the ')}, ${100 - P}% of the ${whole} is left. The second purchase takes ${Q}% of that, so ${100 - Q}% of it stays: ${100 - P}% × ${num((100 - Q) / 100, 2)} = <b>${num(left, 2)}%</b>.${P + Q < 100 ? ` (Not ${100 - P - Q}%: the ${Q}% is of what was left, not of the whole ${whole}.)` : ''}`,
      };
    },
    // the same, backward: how much there was at the start
    (d, ctx) => {
      const keepOf = (P, Q) => (100 - P) * (100 - Q), baseOf = (P, Q) => 10000 / gcd(keepOf(P, Q), 10000);
      const [P, Q, mult] = combo(ctx, [[10, 20, 25, 40, 50, 60], [10, 20, 25, 40, 50, 75], [1, 2, 3, 4, 5, 6]], (P, Q, mult) => P !== Q && baseOf(P, Q) * mult <= 3200);
      const keep = keepOf(P, Q), S = baseOf(P, Q) * mult, R = (S * keep) / 10000, who = d.pick(NAMES);
      const [first, second] = d.pick([['a phone', 'a case'], ['concert tickets', 'dinner'], ['a laptop', 'software'], ['flights', 'a hotel']]);
      return {
        topic: 'Percent of what is left', rank: 8,
        text: `${who} spent ${P}% of some savings on ${first}, and then ${Q}% of what was left on ${second}, leaving $${num(R)}. How many dollars were in the savings at the start?`,
        answer: choices(d, S, [Math.round((R * 100) / (100 - P - Q)), Math.round((R * (100 + P) * (100 + Q)) / 10000), Math.round((R * 100) / (100 - P)), R + Math.round((R * (P + Q)) / 100)]),
        check: () => (S * keep === R * 10000 ? '' : `$${S} leaves $${(S * keep) / 10000}`),
        solution: `The first purchase keeps ${100 - P}% of the money and the second keeps ${100 - Q}% of the rest, so $${num(R)} is ${num(keep / 100, 2)}% of the savings (${100 - P}% × ${num((100 - Q) / 100, 2)}). So the savings were $${num(R)} ÷ ${num(keep / 10000, 4)} = <b>${num(S)}</b> dollars.`,
      };
    },
    // each price a percent of what the other leaves, with real dollars: the allowance
    (d, ctx) => {
      const stepOf = (P, Q) => { const D = 10000 - P * Q; return D / gcd(gcd(P * (100 - Q), Q * (100 - P)), D); };
      const [P, Q] = combo(ctx, [[10, 20, 25, 30, 40, 50], [5, 10, 20, 25]], (P, Q) => P > Q && !(P === 20 && Q === 5) && stepOf(P, Q) <= 100);
      const D = 10000 - P * Q, tn = P * (100 - Q), sn = Q * (100 - P), step = stepOf(P, Q);
      const A = step * d.int(Math.max(1, Math.ceil(20 / step)), Math.max(1, Math.floor(300 / step))), t = (tn * A) / D, s = (sn * A) / D;
      const [big, small] = d.pick([['concert ticket', 'snack'], ['paperback', 'coffee'], ['bus pass', 'lunch'], ['video game', 'drink']]), who = d.pick(NAMES);
      return {
        topic: 'Percent of what is left', rank: 15,
        text: `${who} buys a ${big} and a ${small} out of an allowance. The ${big} costs ${P}% of what would be left of the allowance after buying only the ${small}, and the ${small} costs ${Q}% of what would be left after buying only the ${big}. Together they cost $${num(t + s)}. How many dollars is the allowance?`,
        answer: choices(d, A, [Math.round(((t + s) * 100) / (P + Q)), A + step, A - step, Math.round((t * 100) / P), 2 * (t + s)]),
        check: () => (100 * t === P * (A - s) && 100 * s === Q * (A - t) ? '' : `the prices ${t} and ${s} don't fit an allowance of ${A}`),
        solution: `Call the allowance A and the prices t and s. Then t = ${num(P / 100)}(A − s) and s = ${num(Q / 100)}(A − t). Solving these together gives t = ${frac(tn, D)}A and s = ${frac(sn, D)}A, so the two cost ${frac(tn + sn, D)} of A. That is $${num(t + s)}, so A = ${num(t + s)} ÷ ${frac(tn + sn, D)} = <b>${num(A)}</b>. (Check: the ${big} is $${num(t)} and the ${small} $${num(s)}.)`,
      };
    },
  ],

  'Saying and meaning': [
    // what people say against what is true: the fraction of one answer that is really the other
    (d, ctx) => {
      const parts = (L, Y, N) => { const top = L * (100 - Y); return [top, top + (100 - L) * N]; };
      const [L, Y, N] = combo(ctx, [[30, 40, 50, 70, 75, 80], [60, 70, 75, 80, 90], [60, 70, 75, 80, 90]], (L, Y, N) => { const [top, den] = parts(L, Y, N); return den / gcd(top, den) <= 60; });
      const [place, who, thing] = d.pick(SETTINGS);
      const [top, den] = parts(L, Y, N), other = (100 - L) * (100 - N);
      return {
        topic: 'Saying and meaning', rank: 11,
        text: `At a ${place}, ${L}% of the ${who} truly like ${thing} and the rest do not. When asked, ${Y}% of those who like ${thing} say so, and the others claim they don't; ${N}% of those who don't like it say so, and the others claim they do. What fraction of the ${who} who say they don't like ${thing} actually like it?`,
        answer: choices(d, [top, den], [[top, 10000], [100 - Y, 100], [other, other + L * Y], [den - top, den], [L, 100]], showFrac),
        check: () => { const s = survey(L, Y, N); return s.likeSayNo * den === top * (s.likeSayNo + s.notSayNo) ? '' : `counted ${s.likeSayNo}/${s.likeSayNo + s.notSayNo}`; },
        solution: `Picture 10,000 ${who}. ${num(100 * L)} like ${thing}, and ${num(top)} of them say they don't. ${num(100 * (100 - L))} don't like it, and ${num((100 - L) * N)} of them say so. So ${num(den)} say they don't like ${thing}, and ${num(top)} of those really do: ${num(top)}/${num(den)} = <b>${frac(top, den)}</b>.`,
      };
    },
    // the other way round: of those who say yes, how many mean it
    (d, ctx) => {
      const [L, Y, N] = combo(ctx, [[30, 40, 50, 60, 70, 80], [60, 70, 75, 80, 90], [60, 70, 75, 80, 90]], (L, Y, N) => { const top = L * Y, den = top + (100 - L) * (100 - N); return den / gcd(top, den) <= 60; });
      const [place, who, thing] = d.pick(SETTINGS);
      const top = L * Y, liars = (100 - L) * (100 - N), den = top + liars;
      return {
        topic: 'Saying and meaning', rank: 10,
        text: `At a ${place}, ${L}% of the ${who} truly like ${thing} and the rest do not. ${Y}% of those who like ${thing} say so when asked, and the others claim they don't; ${N}% of those who don't like it say so, and the others claim they do. What fraction of the ${who} who say they like ${thing} really do?`,
        answer: choices(d, [top, den], [[Y, 100], [L, 100], [top, 10000], [liars, den], [top, top + (100 - L) * N]], showFrac),
        check: () => { const s = survey(L, Y, N); return s.likeSayYes * den === top * (s.likeSayYes + s.notSayYes) ? '' : `counted ${s.likeSayYes}/${s.likeSayYes + s.notSayYes}`; },
        solution: `Picture 10,000 ${who}. ${num(100 * L)} like ${thing}, and ${num(top)} of them say so. ${num(100 * (100 - L))} don't, and ${num(liars)} of those claim they do. So ${num(den)} say they like ${thing}, and ${num(top)} of them really do: ${num(top)}/${num(den)} = <b>${frac(top, den)}</b>.`,
      };
    },
    // how many say yes, true or not
    (d, ctx) => {
      const [L, Y, N] = combo(ctx, [[20, 30, 40, 60, 70, 80], [70, 80, 90], [60, 70, 80, 90]]);
      const [place, who, thing] = d.pick(SETTINGS);
      const yes = (L * Y) / 100, fake = ((100 - L) * (100 - N)) / 100, say = yes + fake;
      return {
        topic: 'Saying and meaning', rank: 6,
        text: `At a ${place}, ${L}% of the ${who} like ${thing}. Of those, ${Y}% say so when asked. Of the ${who} who don't like ${thing}, ${N}% say so and the rest claim they do. What percent of all the ${who} say they like ${thing}?`,
        answer: choices(d, say, [L, yes, (L * Y + (100 - L) * N) / 100, 100 - say, Y], (v) => `${num(v, 2)}%`),
        check: () => { const s = survey(L, Y, N); return Math.abs((s.likeSayYes + s.notSayYes) / 100 - say) < 1e-9 ? '' : `counted ${(s.likeSayYes + s.notSayYes) / 100}%`; },
        solution: `Out of 100 ${who}, ${L} like ${thing} and ${num(yes, 2)} of them say so. The other ${100 - L} don't, and ${100 - N}% of those, ${num(fake, 2)}, claim they do. In all ${num(yes, 2)} + ${num(fake, 2)} = <b>${num(say, 2)}%</b> say they like it.`,
      };
    },
    // backward: from how many say yes to how many really like it
    (d, ctx) => {
      const [L, Y, N] = combo(ctx, [[20, 30, 40, 50, 60, 70], [70, 80, 90], [70, 80, 90]], (L, Y, N) => Y + N > 100);
      const [place, who, thing] = d.pick(SETTINGS);
      const say = (L * Y + (100 - L) * (100 - N)) / 100;
      return {
        topic: 'Saying and meaning', rank: 13,
        text: `At a ${place}, ${Y}% of the ${who} who like ${thing} say so when asked, and ${N}% of those who don't like it say so too (the others claim they do). In all, ${num(say, 2)}% of the ${who} say they like ${thing}. What percent of the ${who} really like ${thing}?`,
        answer: choices(d, L, [say, Math.round((say * 100) / Y), 100 - L, Math.round(say - (100 - N)), Y], (v) => `${num(v, 2)}%`),
        check: () => { const fits = range(0, 100).filter((l) => Math.abs((l * Y + (100 - l) * (100 - N)) / 100 - say) < 1e-9); return fits.length === 1 && fits[0] === L ? '' : `fits: ${fits}`; },
        solution: `Say L% really like ${thing}. Then ${Y}% of that L% say so, and ${100 - N}% of the other (100 − L)% claim to: ${num(Y / 100, 2)}L + ${num((100 - N) / 100, 2)}(100 − L) = ${num(say, 2)}. That is ${num((Y + N - 100) / 100, 2)}L + ${100 - N} = ${num(say, 2)}, so L = <b>${L}%</b>.`,
      };
    },
  ],

  'Triangular numbers': [
    // objects in a triangle, one more in each row: how many rows
    (d, ctx) => {
      const [N] = combo(ctx, [range(31, 99).filter((n) => n !== 63)]), things = d.pick(['cans', 'marbles', 'tiles', 'cups']), T = tri(N);
      return {
        topic: 'Triangular numbers', rank: 9,
        text: `${num(T)} ${things} are arranged in a triangle: 1 in the first row, 2 in the second row, 3 in the third, and so on, each row holding one more than the row before. How many rows are there?`,
        answer: choices(d, N, [N - 1, N + 1, N + 2, N - 2, Math.floor(Math.sqrt(T))]),
        check: () => { let rows = 0, used = 0; while (used < T) used += ++rows; return used === T && rows === N ? '' : `${rows} rows hold ${used}`; },
        solution: `With N rows there are 1 + 2 + ⋯ + N = N(N + 1)/2 ${things}, so N(N + 1) = ${num(2 * T)}. That is a little more than N<sup>2</sup>, so N is just under √${num(2 * T)} ≈ ${num(Math.sqrt(2 * T), 1)}; and indeed ${N} · ${N + 1} = ${num(2 * T)}. There are <b>${N}</b> rows.`,
      };
    },
    // forward: the total for a number of rows
    (d, ctx) => {
      const [N] = combo(ctx, [range(12, 60)]), things = d.pick(['cans', 'oranges', 'bricks', 'pins']), T = tri(N);
      return {
        topic: 'Triangular numbers', rank: 3,
        text: `A display of ${things} has 1 in the top row, 2 in the next row, 3 in the next, and so on, with ${N} rows in all. How many ${things} are in the display?`,
        answer: choices(d, T, [N * N, tri(N - 1), N * (N + 1), tri(N + 1), Math.round((N * N) / 2)]),
        check: () => (range(1, N).reduce((s, r) => s + r, 0) === T ? '' : 'the rows add up differently'),
        solution: `Add 1 + 2 + ⋯ + ${N} by pairing the first row with the last, the second with the second-to-last, and so on: each pair holds ${N + 1}, and there are ${N} rows, so the total is ${N} · ${N + 1}/2 = <b>${num(T)}</b>.`,
      };
    },
    // a band of rows in the middle of the stack
    (d, ctx) => {
      const [a, len] = combo(ctx, [range(5, 30), [5, 8, 10, 12, 15, 20]]), things = d.pick(['cans', 'cups', 'tiles', 'blocks']), b = a + len - 1, ans = tri(b) - tri(a - 1);
      return {
        topic: 'Triangular numbers', rank: 7,
        text: `${things[0].toUpperCase() + things.slice(1)} are stacked in a triangle: 1 in the first row, 2 in the second row, 3 in the third, and so on. How many ${things} are in rows ${a} through ${b}, counting both of those rows?`,
        answer: choices(d, ans, [tri(b) - tri(a), tri(b), len * b, tri(b + 1) - tri(a), len * a]),
        check: () => (range(a, b).reduce((s, r) => s + r, 0) === ans ? '' : 'the rows add up differently'),
        solution: `Rows ${a} through ${b} hold ${a} + ${a + 1} + ⋯ + ${b}, which is (1 + ⋯ + ${b}) − (1 + ⋯ + ${a - 1}) = ${num(tri(b))} − ${num(tri(a - 1))} = <b>${num(ans)}</b>. (Or: ${len} rows that average ${num((a + b) / 2, 1)} each.)`,
      };
    },
    // not a triangular number: what is left after the complete rows
    (d, ctx) => {
      const [N] = combo(ctx, [range(20, 70)]), things = d.pick(['marbles', 'coins', 'stones', 'beads']);
      const left = d.int(1, N), T = tri(N) + left;      // fewer than N + 1 left, so row N + 1 can't be finished
      return {
        topic: 'Triangular numbers', rank: 10,
        text: `${num(T)} ${things} are laid out in rows: 1 in the first row, 2 in the second, 3 in the third, and so on, finishing as many complete rows as possible. How many ${things} are left over?`,
        answer: choices(d, left, [tri(N + 1) - T, left + N + 1, T - N * N, T - tri(N - 1)]),
        check: () => { let rows = 0, used = 0; while (used + rows + 1 <= T) used += ++rows; return T - used === left ? '' : `${T - used} left`; },
        solution: `N complete rows use N(N + 1)/2. ${N} rows use ${num(tri(N))}, and ${N + 1} rows would need ${num(tri(N + 1))}, more than ${num(T)}. So ${N} rows are finished, and ${num(T)} − ${num(tri(N))} = <b>${left}</b> are left over.`,
      };
    },
  ],

  'Geometric series': [
    // an infinite geometric series with one term fixed: the least possible sum
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
    // from the first term and the sum back to the ratio, and on to the second term
    (d, ctx) => {
      const [[rp, rq]] = combo(ctx, [[[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5]]]), m = d.int(1, 5);
      const a = (rq - rp) * m, S = m * rq, ans = ratio(a * rp, rq);
      return {
        topic: 'Geometric series', rank: 9,
        text: `An infinite geometric series has first term ${a} and its terms add up to ${S}. What is its second term?`,
        answer: choices(d, ans, [[rp, rq], [S - a, 1], ratio(a * (rq - rp), rq), ratio(a * rp * rp, rq * rq), ratio(a, 2)], showFrac),
        check: () => { const r = 1 - a / S; return Math.abs(a * r - ans[0] / ans[1]) < 1e-9 && Math.abs(a / (1 - r) - S) < 1e-9 ? '' : `the second term is ${a * r}`; },
        solution: `The sum is a/(1 − r), so ${S} = ${a}/(1 − r). That gives 1 − r = ${frac(a, S)}, so r = ${frac(rp, rq)}. The second term is ${a} · ${frac(rp, rq)} = <b>${showFrac(ans)}</b>.`,
      };
    },
    // the odd-position terms against all of them: the ratio
    (d, ctx) => {
      const [[rp, rq]] = combo(ctx, [[[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [1, 5]]]), m = d.int(1, 3);
      const S = (rq + rp) * rq * m, odd = rq * rq * m;          // first term (rq² − rp²)m
      return {
        topic: 'Geometric series', rank: 14,
        text: `The terms of an infinite geometric series add up to ${S}, and the terms in the odd positions (the 1st, 3rd, 5th, …) add up to ${odd}. What is the common ratio of the series?`,
        answer: choices(d, [rp, rq], [ratio(odd, S), ratio(S - odd, S), ratio(rp * rp, rq * rq), ratio(rq - rp, rq), ratio(rp, rq + rp)], showFrac),
        check: () => {
          const a = (rq * rq - rp * rp) * m, r = rp / rq;
          let all = 0, odds = 0, term = a;
          for (let i = 1; i < 400; i++) { all += term; if (i % 2) odds += term; term *= r; }
          return Math.abs(all - S) < 1e-6 && Math.abs(odds - odd) < 1e-6 ? '' : `the sums come to ${all} and ${odds}`;
        },
        solution: `Each term in an even position is the term before it times r, so the even-position terms add up to r · ${odd}. All the terms together: ${S} = ${odd} + ${odd}r, so r = (${S} − ${odd})/${odd} = <b>${frac(rp, rq)}</b>.`,
      };
    },
    // a bouncing ball: down once, then up and down again for every bounce
    (d, ctx) => {
      const [[rp, rq]] = combo(ctx, [[[1, 2], [1, 3], [2, 3], [3, 4], [3, 5], [2, 5], [4, 5]]]), H = d.pick([2, 3, 4, 5, 6, 8, 9, 10, 12, 15, 20].filter((h) => h % (rq - rp) === 0));
      const falls = (H * rq) / (rq - rp), total = 2 * falls - H;
      return {
        topic: 'Geometric series', rank: 10,
        text: `A ball is dropped from a height of ${H} meters. Every time it lands, it bounces back up to ${frac(rp, rq)} of the height it just fell. If it keeps bouncing forever, how many meters does it travel in all, up and down?`,
        answer: choices(d, total, [falls, 2 * falls, (H * (rq + rp)) / rq, total - H, total + H]),
        check: () => { let h = H, dist = H; for (let i = 0; i < 2000; i++) { h *= rp / rq; dist += 2 * h; } return Math.abs(dist - total) < 1e-6 ? '' : `it travels ${dist}`; },
        solution: `The falls are ${H}, ${H}·${frac(rp, rq)}, ${H}·(${frac(rp, rq)})<sup>2</sup>, …, which add to ${H}/(1 − ${frac(rp, rq)}) = ${num(falls)}. Every rise matches the fall after it, so the rises add to the same minus the first drop: ${num(falls)} − ${H} = ${num(falls - H)}. In all ${num(falls)} + ${num(falls - H)} = <b>${num(total)}</b> meters.`,
      };
    },
  ],

  'Fibonacci remainders': [
    // a block one cycle long: one full cycle's sum
    (d, ctx) => {
      const [m] = combo(ctx, [[2, 4, 5, 6, 7]]);
      const cyc = pisano(m), P = cyc.length, total = cyc.reduce((x, y) => x + y, 0), s = d.int(1950, 2100), G = (i) => sub('G', i);
      return {
        topic: 'Fibonacci remainders', rank: 13,
        text: `${fibIntro(m, cyc)} What is ${P > 3 ? `${G(s)} + ${G(s + 1)} + ⋯ + ${G(s + P - 1)}` : range(s, s + P - 1).map(G).join(' + ')}?`,
        answer: choices(d, total, [total + 1, total - 1, total + m, Math.round((P * (m - 1)) / 2), total - m, 2 * total]),
        check: () => {
          let [x, y] = [0, 1], sum = 0;
          for (let i = 0; i < s + P; i++) { if (i >= s) sum += x; [x, y] = [y, (x + y) % m]; }
          return sum === total ? '' : `the terms add to ${sum}`;
        },
        solution: `Each term depends only on the two before it, and there are only ${m * m} possible pairs of remainders, so the sequence must repeat. Listing it: ${cyc.join(', ')}, then 0, 1 again: a cycle of ${P} terms. Any ${P} terms in a row make up one full cycle, just started at a different place, so the sum is ${cyc.join(' + ')} = <b>${total}</b>.`,
      };
    },
    // one far term: where it falls in the cycle
    (d, ctx) => {
      const [m] = combo(ctx, [[5, 6, 7, 8, 9]]);
      const cyc = pisano(m), P = cyc.length, N = d.int(1000, 3000), ans = cyc[N % P], G = (i) => sub('G', i);
      return {
        topic: 'Fibonacci remainders', rank: 11,
        text: `${fibIntro(m, cyc)} What is ${G(N)}?`,
        answer: choices(d, ans, [cyc[(N + 1) % P], cyc[(N - 1) % P], cyc[(N + 2) % P], (ans + 1) % m, N % m]),
        check: () => { let [x, y] = [0, 1]; for (let i = 0; i < N; i++) [x, y] = [y, (x + y) % m]; return x === ans ? '' : `${G(N)} is ${x}`; },
        solution: `The pair 0, 1 comes back after ${P} terms, so the sequence repeats every ${P} terms: ${cyc.join(', ')}. ${N} = ${P} · ${Math.floor(N / P)} + ${N % P}, so ${G(N)} = ${G(N % P)} = <b>${ans}</b>.`,
      };
    },
    // how often a 0 comes up: at every multiple of the first place it appears
    (d, ctx) => {
      const [m] = combo(ctx, [[2, 3, 4, 5, 6, 8]]);
      const cyc = pisano(m), P = cyc.length, N = d.int(100, 400), G = (i) => sub('G', i);
      const first = cyc.indexOf(0, 1) > 0 ? cyc.indexOf(0, 1) : P, zeros = Math.floor(N / first);   // 0s come every `first` terms
      return {
        topic: 'Fibonacci remainders', rank: 12,
        text: `${fibIntro(m, cyc)} How many of ${G(1)}, ${G(2)}, …, ${G(N)} are equal to 0?`,
        answer: choices(d, zeros, [Math.floor(N / P), zeros + 1, zeros - 1, Math.floor(N / m), Math.round(N / P) * (P / first) + 1]),
        check: () => { let [x, y] = [0, 1], count = 0; for (let i = 1; i <= N; i++) { [x, y] = [y, (x + y) % m]; if (x === 0) count++; } return count === zeros ? '' : `counted ${count}`; },
        solution: `The sequence repeats every ${P} terms: ${cyc.join(', ')}. In that cycle the 0s sit at ${G(0)}${P / first > 1 ? `, ${range(1, P / first - 1).map((i) => G(i * first)).join(', ')}` : ''}: every ${first} terms. So among ${G(1)} to ${G(N)} the 0s are ${G(first)}, ${G(2 * first)}, …, and there are ⌊${N}/${first}⌋ = <b>${zeros}</b> of them.`,
      };
    },
    // a long sum from the start: full cycles, then part of one
    (d, ctx) => {
      const [m] = combo(ctx, [[2, 3, 4, 7, 8]]);
      const cyc = pisano(m), P = cyc.length, total = cyc.reduce((x, y) => x + y, 0), N = d.int(100, 500), G = (i) => sub('G', i);
      const full = Math.floor((N + 1) / P), rest = cyc.slice(0, (N + 1) % P), ans = full * total + rest.reduce((x, y) => x + y, 0);
      return {
        topic: 'Fibonacci remainders', rank: 14,
        text: `${fibIntro(m, cyc)} What is ${G(0)} + ${G(1)} + ⋯ + ${G(N)}?`,
        answer: choices(d, ans, [full * total, ans + cyc[(N + 1) % P] + 1, Math.round(((N + 1) * total) / P) + 1, ans - 1, ans + 1]),
        check: () => { let [x, y] = [0, 1], sum = 0; for (let i = 0; i <= N; i++) { sum += x; [x, y] = [y, (x + y) % m]; } return sum === ans ? '' : `the sum is ${sum}`; },
        solution: `The cycle ${cyc.join(', ')} has ${P} terms that add to ${total}. ${G(0)} to ${G(N)} is ${N + 1} terms: ${full} full cycles${rest.length ? ` and then ${rest.join(', ')}` : ''}. So the sum is ${full} · ${total}${rest.length ? ` + ${rest.reduce((x, y) => x + y, 0)}` : ''} = <b>${num(ans)}</b>.`,
      };
    },
  ],

  'Recursive functions': [
    // f(n) = f(n − 1) − f(n − 2) + cn: take away c(n + 1) and what is left repeats every 6 terms
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
    // a(n) = a(n − 1) − a(n − 2) on its own: it repeats every 6 terms
    (d, ctx) => {
      const [x, y] = combo(ctx, [range(-5, 7), range(-5, 7)], (x, y) => new Set([x, y, y - x, -x, -y, x - y]).size === 6);
      const N = d.int(500, 3000), vals = [x, y, y - x, -x, -y, x - y], ans = vals[(N - 1) % 6], a = (i) => sub('a', i);
      return {
        topic: 'Recursive functions', rank: 12,
        text: `A sequence has ${a(1)} = ${num(x)}, ${a(2)} = ${num(y)}, and ${a('n')} = ${a('n−1')} − ${a('n−2')} for every n ≥ 3. What is ${a(N)}?`,
        answer: choices(d, ans, [...vals.filter((v) => v !== ans), ans + 1]),
        check: () => { let [p, q] = [x, y]; for (let n = 3; n <= N; n++) [p, q] = [q, q - p]; return (N === 1 ? x : N === 2 ? y : q) === ans ? '' : `${a(N)} is ${q}`; },
        solution: `Write out the first terms: ${vals.map(num).join(', ')}, and then ${num(x)}, ${num(y)} again, since each term depends only on the two before it. So the sequence repeats every 6 terms. ${N} = 6 · ${Math.floor((N - 1) / 6)} + ${((N - 1) % 6) + 1}, so ${a(N)} = ${a(((N - 1) % 6) + 1)} = <b>${num(ans)}</b>.`,
      };
    },
    // b(n + 1) = 1/(1 − b(n)): it comes back after 3 steps
    (d, ctx) => {
      const [a] = combo(ctx, [[2, 3, 4, 5, -1, -2, -3, -4]]);
      const vals = [ratio(a, 1), ratio(1, 1 - a), ratio(a - 1, a)], N = d.int(100, 2500), ans = vals[(N - 1) % 3], b = (i) => sub('b', i);
      return {
        topic: 'Recursive functions', rank: 14,
        text: `A sequence has ${b(1)} = ${num(a)} and ${b('n+1')} = <span class="fr"><span>1</span><span>1 − ${b('n')}</span></span> for every n ≥ 1. What is ${b(N)}?`,
        answer: choices(d, ans, [...vals.filter((v) => v !== ans), ratio(1, a), ratio(1 - a, 1), ratio(-1, a)], showFrac),
        check: () => {
          let [p, q] = [BigInt(a), 1n];
          for (let n = 1; n < N; n++) [p, q] = [q, q - p];          // 1/(1 − p/q) = q/(q − p)
          if (q < 0n) [p, q] = [-p, -q];
          const G = (x, y) => (y ? G(y, x % y) : x < 0n ? -x : x), g = G(p, q);
          return Number(p / g) === ans[0] && Number(q / g) === ans[1] ? '' : `${b(N)} is ${p}/${q}`;
        },
        solution: `${b(2)} = 1/(1 − ${a < 0 ? `(${num(a)})` : num(a)}) = ${showFrac(vals[1])}, ${b(3)} = 1/(1 − ${showFrac(vals[1])}) = ${showFrac(vals[2])}, and ${b(4)} = 1/(1 − ${showFrac(vals[2])}) = ${num(a)} again. So the terms repeat every 3. ${N} = 3 · ${Math.floor((N - 1) / 3)} + ${((N - 1) % 3) + 1}, so ${b(N)} = ${b(((N - 1) % 3) + 1)} = <b>${showFrac(ans)}</b>.`,
      };
    },
    // f(n) = f(n − 1) + an + b: the steps add up (telescoping)
    (d, ctx) => {
      const [f1, A, B] = combo(ctx, [[1, 2, 3, 5, 7], [1, 2, 3, 4], [-3, -2, -1, 0, 1, 2]]);
      const N = d.int(40, 150), ans = f1 + A * (tri(N) - 1) + B * (N - 1), step = expr([A, 'n'], [B, '']);
      return {
        topic: 'Recursive functions', rank: 9,
        text: `A function has f(1) = ${f1} and f(n) = f(n − 1) + ${step} for every n ≥ 2. What is f(${N})?`,
        answer: choices(d, ans, [ans - f1, f1 + A * tri(N) + B * N, f1 + A * (tri(N - 1) - 1) + B * (N - 2), ans + A * N + B, A * N * N + B * N]),
        check: () => { let f = f1; for (let n = 2; n <= N; n++) f += A * n + B; return f === ans ? '' : `f(${N}) is ${f}`; },
        solution: `Each step adds ${step}, so f(${N}) is f(1) plus the sum of ${step} for n = 2 to ${N}. The numbers 2 to ${N} add to ${num(tri(N))} − 1 = ${num(tri(N) - 1)}, and there are ${N - 1} of them, so f(${N}) = ${f1} + ${A === 1 ? '' : `${A} · `}${num(tri(N) - 1)}${B ? ` ${B < 0 ? '−' : '+'} ${Math.abs(B) === 1 ? '' : `${Math.abs(B)} · `}${N - 1}` : ''} = <b>${num(ans)}</b>.`,
      };
    },
  ],

  'Reciprocal sequences': [
    // a sequence whose reciprocals are arithmetic: a far term in lowest terms
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
    // two terms of a sequence with arithmetic reciprocals: a third one
    (d, ctx) => {
      const [x, step, i, gap] = combo(ctx, [[2, 3, 4, 5, 6], [2, 3, 4, 5, 7], [1, 2, 3], [3, 4, 5]]);
      const j = i + gap, y = x + gap * step, N = d.int(20, 80), m = x + (N - i) * step, a = (k) => sub('a', k);
      return {
        topic: 'Reciprocal sequences', rank: 10,
        text: `The reciprocals 1/${a(1)}, 1/${a(2)}, 1/${a(3)}, … of a sequence go up by the same amount each time. If ${a(i)} = ${frac(1, x)} and ${a(j)} = ${frac(1, y)}, then ${a(N)} = 1/m. What is m?`,
        answer: choices(d, m, [x + (N - 1) * step, m + step, m - step, x + N * step, Math.round(x + ((N - i) * (y - x)) / (j - i + 1))]),
        check: () => { const diff = (y - x) / (j - i); return Math.abs(x + (N - i) * diff - m) < 1e-9 && Number.isInteger(diff) ? '' : `the reciprocal is ${x + (N - i) * diff}`; },
        solution: `The reciprocals are ${x} at term ${i} and ${y} at term ${j}, so they go up by (${y} − ${x})/(${j} − ${i}) = ${step} each term. At term ${N}: ${x} + (${N} − ${i}) · ${step} = ${m}, so ${a(N)} = 1/${m} and m = <b>${m}</b>.`,
      };
    },
    // a(n + 1) = a(n)/(1 + k·a(n)): the reciprocals go up by k
    (d, ctx) => {
      const [u, k] = combo(ctx, [[1, 2, 3, 4, 5], [1, 2, 3, 4]]);
      const N = d.int(30, 200), m = u + (N - 1) * k, a = (i) => sub('a', i), K = k === 1 ? '' : k;
      return {
        topic: 'Reciprocal sequences', rank: 13,
        text: `A sequence has ${a(1)} = ${frac(1, u)} and ${a('n+1')} = <span class="fr"><span>${a('n')}</span><span>1 + ${K}${a('n')}</span></span> for every n ≥ 1. Then ${a(N)} = 1/m. What is m?`,
        answer: choices(d, m, [u + N * k, u + (N - 2) * k, u * N * k, u + N - 1, k * N]),
        check: () => { let [p, q] = [1n, BigInt(u)]; for (let n = 1; n < N; n++) [p, q] = [p, q + BigInt(k) * p]; return p === 1n && Number(q) === m ? '' : `${a(N)} is ${p}/${q}`; },
        solution: `Flip both sides: 1/${a('n+1')} = (1 + ${K}${a('n')})/${a('n')} = 1/${a('n')} + ${k}. So the reciprocals go up by ${k} each term, starting at ${u}: 1/${a(N)} = ${u} + ${N - 1} · ${k} = ${m}, and m = <b>${m}</b>.`,
      };
    },
    // a(n + 1) = a(n)/(1 + c·n·a(n)): the reciprocals go up by c, 2c, 3c, …
    (d, ctx) => {
      const [u, c] = combo(ctx, [[1, 2, 3, 4], [1, 2, 3]]);
      const N = d.int(20, 60), m = u + c * tri(N - 1), a = (i) => sub('a', i), C = c === 1 ? '' : c;
      return {
        topic: 'Reciprocal sequences', rank: 17,
        text: `A sequence has ${a(1)} = ${frac(1, u)} and ${a('n+1')} = <span class="fr"><span>${a('n')}</span><span>1 + ${C}n${a('n')}</span></span> for every n ≥ 1. Then ${a(N)} = 1/m. What is m?`,
        answer: choices(d, m, [u + c * tri(N), u + c * (N - 1), c * tri(N - 1), u + c * tri(N - 2), m + 1]),
        check: () => { let [p, q] = [1n, BigInt(u)]; for (let n = 1; n < N; n++) q += BigInt(c * n) * p; return p === 1n && Number(q) === m ? '' : `${a(N)} is ${p}/${q}`; },
        solution: `Flip both sides: 1/${a('n+1')} = 1/${a('n')} + ${C}n. So 1/${a(N)} = ${u} + ${C ? `${c} · ` : ''}(1 + 2 + ⋯ + ${N - 1}) = ${u} + ${C ? `${c} · ` : ''}${num(tri(N - 1))} = ${num(m)}, and m = <b>${num(m)}</b>.`,
      };
    },
  ],

  'Perpendicular lines': [
    // two perpendicular lines through a given point: solve for their coefficients
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
    // the perpendicular through a point: where it crosses the y-axis
    (d, ctx) => {
      const [p, q, x1, y1] = combo(ctx, [[1, 2, 3, 4, 5, -2, -3], [1, 2, 3, 4, -1, -2, -3, -5], [-4, -3, -2, -1, 1, 2, 3, 4, 5], range(-5, 5)],
        (p, q) => gcd(p, q) === 1 && Math.abs(p) !== Math.abs(q));
      const r = d.int(1, 12), ans = ratio(p * y1 - q * x1, p);
      return {
        topic: 'Perpendicular lines', rank: 7,
        text: `Line ℓ passes through (${num(x1)}, ${num(y1)}) and is perpendicular to the line ${expr([p, 'x'], [q, 'y'])} = ${r}. At what value of y does ℓ cross the y-axis?`,
        answer: choices(d, ans, [ratio(q * y1 + p * x1, q), ratio(p * y1 + q * x1, p), ratio(q * x1 - p * y1, q), [-ans[0], ans[1]], [y1, 1]], showFrac),
        check: () => {
          // walk from the point along the line's normal (p, q), which is ℓ's direction, until x = 0
          const t = -x1 / p, y = y1 + t * q, slope = q / p;
          return Math.abs(y - ans[0] / ans[1]) < 1e-9 && Math.abs(slope * (-p / q) + 1) < 1e-9 ? '' : `ℓ crosses at ${y}`;
        },
        solution: `The line ${expr([p, 'x'], [q, 'y'])} = ${r} has slope ${frac(-p, q)}, so a line perpendicular to it has slope ${frac(q, p)} (the slopes multiply to −1). Through (${num(x1)}, ${num(y1)}), ℓ is ${less('y', y1)} = ${frac(q, p)}(${less('x', x1)}). At x = 0, y = ${num(y1)} − (${frac(q, p)})(${num(x1)}) = <b>${showFrac(ans)}</b>.`,
      };
    },
    // the coefficient that makes two lines perpendicular
    (d, ctx) => {
      const [which, a1, b1, a2, b2] = combo(ctx, [['x', 'y'], [2, 3, 4, 5, 6], [-4, -3, -2, 2, 3, 5], [1, 2, 3, 4, 5], [-5, -3, -2, 2, 3, 4]],
        (w, a1, b1, a2, b2) => Math.abs(a2) !== Math.abs(b2));
      const k = which === 'x' ? ratio(-b1 * b2, a2) : ratio(-a1 * a2, b2);
      const parallel = which === 'x' ? ratio(a2 * b1, b2) : ratio(a1 * b2, a2);
      const c1 = d.int(1, 9), c2 = d.int(1, 9);
      const line1 = which === 'x' ? expr([1, 'kx'], [b1, 'y']) : expr([a1, 'x'], [1, 'ky']);
      return {
        topic: 'Perpendicular lines', rank: 8,
        text: `For what value of k are the lines ${line1} = ${c1} and ${expr([a2, 'x'], [b2, 'y'])} = ${c2} perpendicular?`,
        answer: choices(d, k, [parallel, [-k[0], k[1]], ratio(k[1], k[0]), [-parallel[0], parallel[1]]], showFrac),
        check: () => {
          // the slopes, worked out from k, must multiply to −1
          const kv = k[0] / k[1], s1 = which === 'x' ? -kv / b1 : -a1 / kv, s2 = -a2 / b2;
          return Math.abs(s1 * s2 + 1) < 1e-9 ? '' : `the slopes multiply to ${s1 * s2}`;
        },
        solution: `Lines px + qy = r and p′x + q′y = r′ are perpendicular exactly when pp′ + qq′ = 0. Here that is ${which === 'x' ? `k · ${a2} + (${num(b1)})(${num(b2)}) = 0` : `(${num(a1)})(${num(a2)}) + k · ${paren(b2)} = 0`}, so k = ${showFrac(k)}. Answer: <b>${showFrac(k)}</b>. (The value that makes them parallel instead is ${showFrac(parallel)}.)`,
      };
    },
    // the closest point of a line: where the perpendicular from the point meets it
    (d, ctx) => {
      const [m, b, f, s] = combo(ctx, [[-3, -2, -1, 1, 2, 3], range(-4, 4), range(-3, 4), [-3, -2, -1, 1, 2, 3]]);
      const F = [f, m * f + b], P = [f + s * m, m * f + b - s], ans = F[0] + F[1];
      return {
        topic: 'Perpendicular lines', rank: 12,
        text: `What is the sum of the coordinates of the point on the line y = ${expr([m, 'x'], [b, ''])} that is closest to (${num(P[0])}, ${num(P[1])})?`,
        answer: choices(d, ans, [P[0] + P[1], P[0] + m * P[0] + b, f + m * f, ans + 1, ans - 1]),
        check: () => {
          // minimize the squared distance over the line directly
          const x = (P[0] + m * (P[1] - b)) / (1 + m * m), y = m * x + b;
          let best = Infinity, bx = 0;
          for (let t = -20; t <= 20; t += 0.001) { const dd = (t - P[0]) ** 2 + (m * t + b - P[1]) ** 2; if (dd < best) { best = dd; bx = t; } }
          return Math.abs(x + y - ans) < 1e-9 && Math.abs(bx - x) < 0.01 ? '' : `the closest point is (${x}, ${y})`;
        },
        solution: `The closest point is where the perpendicular from (${num(P[0])}, ${num(P[1])}) meets the line. The line has slope ${num(m)}, so the perpendicular has slope ${frac(-1, m)}: ${less('y', P[1])} = ${frac(-1, m)}(${less('x', P[0])}). Setting ${expr([m, 'x'], [b, ''])} equal to that gives x = ${num(f)}, and then y = ${num(F[1])}. The sum is ${num(f)} + ${paren(F[1])} = <b>${num(ans)}</b>.`,
      };
    },
  ],

  'Parabolas and triangles': [
    // a triangle with its corners on a parabola, one at the vertex: the length of its level side
    (d, ctx) => {
      const [[kp, kq], t] = combo(ctx, [[[1, 1], [2, 1], [3, 1], [1, 2], [1, 3]], [2, 3, 5, 6]], ([kp, kq], t) => (kp * t ** 3) % kq === 0);
      const k = kp / kq, area = (kp * t ** 3) / kq, K = kText(kp, kq);
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
    // forward: the area from the level side
    (d, ctx) => {
      const [[kp, kq], t] = combo(ctx, [[[1, 1], [2, 1], [3, 1], [1, 2], [1, 3], [3, 2]], [2, 3, 4, 5, 6]]);
      const k = kp / kq, K = kText(kp, kq), h = ratio(kp * t * t, kq), area = ratio(kp * t ** 3, kq);
      return {
        topic: 'Parabolas and triangles', rank: 7,
        text: `Triangle PQR has all three corners on the parabola y = ${K}x<sup>2</sup>, with P at the origin and side QR parallel to the x-axis. If QR = ${2 * t}, what is the area of the triangle?`,
        figure: parabolaFigure(k, t),
        answer: choices(d, area, [h, ratio(2 * kp * t ** 3, kq), ratio(kp * t ** 3, 2 * kq), ratio(4 * kp * t ** 3, kq), ratio(kp * t * t, 2 * kq)], showFrac),
        check: () => { const Q = [-t, k * t * t], R = [t, k * t * t], A = Math.abs(Q[0] * R[1] - R[0] * Q[1]) / 2; return Math.abs(A - area[0] / area[1]) < 1e-9 ? '' : `the shoelace area is ${A}`; },
        solution: `QR is level, so Q and R are mirror images: Q = (−${t}, h) and R = (${t}, h), where h = ${K ? `${K} · ` : ''}${t}<sup>2</sup> = ${showFrac(h)}. The base QR is ${2 * t} and the height from P up to it is h, so the area is ½ · ${2 * t} · ${showFrac(h)} = <b>${showFrac(area)}</b>.`,
      };
    },
    // an equilateral triangle with a corner at the vertex
    (d, ctx) => {
      const [[kp, kq]] = combo(ctx, [[[1, 1], [2, 1], [3, 1], [1, 2], [1, 3], [1, 4], [4, 1]]]);
      const k = kp / kq, K = kText(kp, kq), side = fracSurd(2 * kq, kp, 3), half = fracSurd(kq, kp, 3);
      return {
        topic: 'Parabolas and triangles', rank: 13,
        text: `An equilateral triangle has one corner at the origin and its other two corners on the parabola y = ${K}x<sup>2</sup>. How long is each side of the triangle?`,
        figure: parabolaFigure(k, Math.sqrt(3) / k),
        answer: labelled(side, [fracSurd(2 * kq, kp), half, fracSurd(4 * kq, kp, 3), fracSurd(2 * kq, 3 * kp, 3), fracSurd(6 * kq, kp)]),
        check: () => {
          // find the half-width where the slanted side is as long as the level one
          let lo = 0.0001, hi = 100;
          for (let i = 0; i < 200; i++) { const t = (lo + hi) / 2; if (Math.hypot(t, k * t * t) < 2 * t) lo = t; else hi = t; }
          return Math.abs(2 * lo - side[0]) < 1e-6 ? '' : `the side is ${2 * lo}`;
        },
        solution: `The other two corners are the same distance from the origin, and points of the parabola at the same distance from the origin are mirror images, so they are (−t, ${K}t<sup>2</sup>) and (t, ${K}t<sup>2</sup>). The level side is 2t, and the height from the origin to it is ${K}t<sup>2</sup>. An equilateral triangle with side 2t has height √3 · t, so ${K}t<sup>2</sup> = √3 t, t = ${half[1]}, and each side is 2t = <b>${side[1]}</b>.`,
      };
    },
    // a right angle at the vertex
    (d, ctx) => {
      const [[kp, kq], ask] = combo(ctx, [[[1, 1], [2, 1], [3, 1], [1, 2], [1, 3], [4, 1]], ['area', 'side']]);
      const K = kText(kp, kq), t = ratio(kq, kp), QR = ratio(2 * kq, kp), area = ratio(kq * kq, kp * kp);
      return {
        topic: 'Parabolas and triangles', rank: 12,
        text: `Triangle PQR has all three corners on the parabola y = ${K}x<sup>2</sup>, with P at the origin, side QR parallel to the x-axis, and a right angle at P. What is ${ask === 'area' ? 'the area of the triangle' : 'the length of QR'}?`,
        figure: parabolaFigure(kp / kq, kq / kp),
        answer: ask === 'area'
          ? choices(d, area, [QR, t, ratio(2 * kq * kq, kp * kp), ratio(kq * kq, 2 * kp * kp), ratio(4 * kq * kq, kp * kp), ratio(kq * kq, 4 * kp * kp), ratio(3 * kq * kq, kp * kp)], showFrac)
          : choices(d, QR, [t, area, ratio(4 * kq, kp), ratio(kq, 2 * kp), ratio(2 * kq * kq, kp * kp), ratio(3 * kq, kp), ratio(kq, 4 * kp)], showFrac),
        check: () => {
          const tv = t[0] / t[1], k = kp / kq, Q = [-tv, k * tv * tv], R = [tv, k * tv * tv];
          const dot = Q[0] * R[0] + Q[1] * R[1], want = ask === 'area' ? (2 * tv * k * tv * tv) / 2 : 2 * tv, got = ask === 'area' ? area : QR;
          return Math.abs(dot) < 1e-9 && Math.abs(want - got[0] / got[1]) < 1e-9 ? '' : `dot ${dot}, value ${want}`;
        },
        solution: `QR is level, so Q = (−t, ${K}t<sup>2</sup>) and R = (t, ${K}t<sup>2</sup>). The angle at P is right when PQ and PR are perpendicular: (−t)(t) + (${K}t<sup>2</sup>)(${K}t<sup>2</sup>) = 0, so ${kp === kq ? '' : kq === 1 ? `${kp}<sup>2</sup>` : `(${kNum(kp, kq)})<sup>2</sup>`}t<sup>2</sup> = 1 and t = ${showFrac(t)}. `
          + (ask === 'area'
            ? `Then QR = 2t = ${showFrac(QR)} and the height from P is ${K}t<sup>2</sup> = ${showFrac(t)}, so the area is ½ · ${showFrac(QR)} · ${showFrac(t)} = <b>${showFrac(area)}</b>.`
            : `So QR = 2t = <b>${showFrac(QR)}</b>.`),
      };
    },
  ],

  'Least value of a product': [
    // the least value of four evenly spaced linear factors multiplied, plus a constant
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
        solution: `Multiply the outer pair and the inner pair. ${factor(s)}${factor(s + 3 * g)} = ${expr([1, 'x<sup>2</sup>'], [p, 'x'], [q1, ''])}; call it u. Then ${factor(s + g)}${factor(s + 2 * g)} = ${expr([1, 'x<sup>2</sup>'], [p, 'x'], [q2, ''])} = u + ${2 * g * g}. So the expression is u(u + ${2 * g * g}) + ${K} = (u + ${g * g})<sup>2</sup> − ${g ** 4} + ${K}. That is least when u = −${g * g}, which some real x gives (u goes as low as −${num((9 * g * g) / 4)}). The least value is ${K} − ${g ** 4} = <b>${num(ans)}</b>.`,
      };
    },
    // two factors: a parabola's lowest point is halfway between its roots
    (d, ctx) => {
      const [a, gap] = combo(ctx, [range(-7, 7), [2, 4, 6, 8, 10]]);
      const b = a + gap, K = d.int(10, 99), half = gap / 2, ans = K - half * half;
      return {
        topic: 'Least value of a product', rank: 5,
        text: `As x ranges over all real numbers, what is the smallest value of ${factor(-a)}${factor(-b)} + ${K}?`,
        answer: choices(d, ans, [K, K - gap * gap, K - a * b, K + half * half, K - half]),
        check: () => { let low = Infinity; for (let x = a - 2; x <= b + 2; x += 1e-3) low = Math.min(low, (x - a) * (x - b) + K); return Math.abs(low - ans) < 1e-4 ? '' : `a scan finds ${low}`; },
        solution: `${factor(-a)}${factor(-b)} is a parabola that opens upward with roots ${num(a)} and ${num(b)}, so it is lowest halfway between them, at x = ${num((a + b) / 2)}. There the two factors are ${half} and −${half}, whose product is −${half * half}. The least value is ${K} − ${half * half} = <b>${num(ans)}</b>.`,
      };
    },
    // a sum of squares: least at the average
    (d, ctx) => {
      const [a, i, j] = combo(ctx, [range(-6, 3), range(1, 6), range(1, 6)], (a, i, j) => (2 * i + j) % 3 === 0);
      const b = a + i, c = b + j, mean = (a + b + c) / 3, ans = (a - mean) ** 2 + (b - mean) ** 2 + (c - mean) ** 2, sq = (v) => `(x ${v < 0 ? '+' : '−'} ${Math.abs(v)})<sup>2</sup>`;
      const at = (x) => (x - a) ** 2 + (x - b) ** 2 + (x - c) ** 2;
      return {
        topic: 'Least value of a product', rank: 9,
        text: `As x ranges over all real numbers, what is the smallest value of ${[a, b, c].map((v) => (v === 0 ? 'x<sup>2</sup>' : sq(v))).join(' + ')}?`,
        answer: choices(d, ans, [at(b), a * a + b * b + c * c, ((c - a) ** 2) / 2, at(0), ans + 3]),
        check: () => { let low = Infinity; for (let x = a - 2; x <= c + 2; x += 1e-3) low = Math.min(low, at(x)); return Math.abs(low - ans) < 1e-4 ? '' : `a scan finds ${low}`; },
        solution: `Expanded, this is ${expr([3, 'x<sup>2</sup>'], [-2 * (a + b + c), 'x'], [a * a + b * b + c * c, ''])}, a parabola that is lowest at x = ${num(2 * (a + b + c))}/6 = ${num(mean)}, the average of ${num(a)}, ${num(b)} and ${num(c)}. There the squares are ${num((a - mean) ** 2)}, ${num((b - mean) ** 2)} and ${num((c - mean) ** 2)}, so the least value is <b>${num(ans)}</b>.`,
      };
    },
    // four factors in two pairs with the same sum, but not evenly spaced
    (d, ctx) => {
      const [a, u, v] = combo(ctx, [range(-6, 3), [1, 2, 3, 4], [1, 2, 3, 4, 5, 6]], (a, u, v) => u !== v && (u * (u + v)) % 2 === 0);
      const b = a + u, c = b + v, e = c + u, D = b * c - a * e, K = d.int(100, 600), ans = K - (D * D) / 4;
      const product = [a, b, c, e].map(factor).join('');
      return {
        topic: 'Least value of a product', rank: 20,
        text: `As x ranges over all real numbers, what is the smallest value of ${product} + ${K}?`,
        answer: choices(d, ans, [K, K - D, K - (D * D) / 2, K + (D * D) / 4, K - D * D]),
        check: () => { let low = Infinity; for (let x = -e - 1; x <= -a + 1; x += 1e-4) low = Math.min(low, (x + a) * (x + b) * (x + c) * (x + e) + K); return Math.abs(low - ans) < 1e-3 ? '' : `a scan finds ${low}`; },
        solution: `Pair the factors so each pair has the same x-term: ${factor(a)}${factor(e)} = ${expr([1, 'x<sup>2</sup>'], [a + e, 'x'], [a * e, ''])}, call it u, and ${factor(b)}${factor(c)} = ${expr([1, 'x<sup>2</sup>'], [b + c, 'x'], [b * c, ''])} = u + ${D}. So the expression is u(u + ${D}) + ${K} = (u + ${D / 2})<sup>2</sup> − ${(D * D) / 4} + ${K}. That is least when u = −${D / 2}, which some real x gives (u goes as low as −${num(((e - a) ** 2) / 4)}). The least value is ${K} − ${(D * D) / 4} = <b>${num(ans)}</b>.`,
      };
    },
  ],

  'Ratios of big powers': [
    // the floor of a ratio of sums of big powers: just below a power of the bigger base
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
    // the same with minus signs: now it lands just above the power
    (d, ctx) => {
      const [[a, b], e, N] = combo(ctx, [[[3, 2], [4, 3], [5, 3], [5, 2], [6, 5], [7, 4], [8, 5], [9, 8]], [2, 3], [40, 50, 60, 80, 100]],
        ([a, b], e, N) => a ** e <= 3000 && a ** e * (b / a) ** (N - e) < 0.4);
      const A = a ** e, B = b ** e, m = N - e;
      return {
        topic: 'Ratios of big powers', rank: 15,
        text: `Let Q = <span class="fr"><span>${pow(a, N)} − ${pow(b, N)}</span><span>${pow(a, m)} − ${pow(b, m)}</span></span>. What is the greatest integer that does not exceed Q?`,
        answer: choices(d, A, [A - 1, A + 1, A - B, A + B, (a - b) ** e]),
        check: () => { const big = (x, y) => BigInt(x) ** BigInt(y), f = (big(a, N) - big(b, N)) / (big(a, m) - big(b, m)); return f === BigInt(A) ? '' : `the floor is ${f}`; },
        solution: `Take ${pow(a, e)} = ${num(A)} out of the top: ${pow(a, N)} − ${pow(b, N)} = ${pow(a, e)}(${pow(a, m)} − ${pow(b, m)}) + ${pow(b, m)}(${pow(a, e)} − ${pow(b, e)}). So Q = ${num(A)} + <span class="fr"><span>${num(A - B)} · ${pow(b, m)}</span><span>${pow(a, m)} − ${pow(b, m)}</span></span>. This time the extra part is added, and it is positive but far below 1, since ${pow(b, m)} is tiny next to ${pow(a, m)}. So Q is just over ${num(A)}, and the answer is <b>${num(A)}</b>.`,
      };
    },
    // an exact ratio: take out the smallest power
    (d, ctx) => {
      const [b, p, q] = combo(ctx, [[2, 3, 5], [1, 2, 3], [1, 2]]);
      const n = d.int(2000, 2030), ans = ratio(b ** p + 1, b ** q - 1);
      return {
        topic: 'Ratios of big powers', rank: 8,
        text: `What is <span class="fr"><span>${pow(b, n + p)} + ${pow(b, n)}</span><span>${pow(b, n + q)} − ${pow(b, n)}</span></span>?`,
        answer: choices(d, ans, [ratio(b ** p, b ** q), ratio(b ** p + 1, b ** q + 1), ratio(b ** p - 1, b ** q - 1), ratio(b ** p + 1, b ** q), ratio(b ** (p + 1), b ** q - 1)], showFrac),
        check: () => {
          const B = BigInt(b), top = B ** BigInt(n + p) + B ** BigInt(n), bottom = B ** BigInt(n + q) - B ** BigInt(n);
          const G = (x, y) => (y ? G(y, x % y) : x), g = G(top, bottom);
          return Number(top / g) === ans[0] && Number(bottom / g) === ans[1] ? '' : `it is ${top / g}/${bottom / g}`;
        },
        solution: `Take ${pow(b, n)} out of the top and the bottom: the top is ${pow(b, n)}(${p === 1 ? b : pow(b, p)} + 1) and the bottom is ${pow(b, n)}(${q === 1 ? b : pow(b, q)} − 1). The ${pow(b, n)} cancels, leaving ${b ** p + 1}/${b ** q - 1} = <b>${showFrac(ans)}</b>.`,
      };
    },
    // which power is largest (or smallest): give them all the same exponent
    (d, ctx) => {
      const SETS = [[[2, 7], [3, 4], [5, 3], [11, 2], [7, 2]], [[2, 8], [3, 5], [6, 3], [15, 2], [10, 2]], [[2, 5], [3, 3], [4, 2], [6, 2], [5, 2]], [[2, 9], [3, 6], [7, 3], [10, 3], [20, 2]]];
      const [set, which] = combo(ctx, [[0, 1, 2, 3], ['largest', 'smallest']]), g = d.pick([100, 200, 300, 500]);
      const items = SETS[set], size = ([b, k]) => k * Math.log(b), pick = items.reduce((x, y) => ((which === 'largest' ? size(y) > size(x) : size(y) < size(x)) ? y : x));
      const opt = ([b, k]) => [b + k / 1000, pow(b, k * g)];       // listed by base, not by size
      const right = opt(pick);
      return {
        topic: 'Ratios of big powers', rank: 10,
        text: `Which of the numbers ${items.map(([b, k]) => pow(b, k * g)).join(', ')} is the ${which}?`,
        answer: labelled(right, items.filter((x) => x !== pick).map(opt)),
        check: () => { const bases = items.map(([b, k]) => b ** k), best = which === 'largest' ? Math.max(...bases) : Math.min(...bases); return bases.filter((v) => v === best).length === 1 && pick[0] ** pick[1] === best ? '' : 'the pick is wrong or tied'; },   // same exponent g, so compare b^k exactly
        solution: `Every exponent is a multiple of ${g}, so write each number as a ${g}th power: ${items.map(([b, k]) => `${pow(b, k * g)} = (${pow(b, k)})<sup>${g}</sup> = ${pow(b ** k, g)}`).join(', ')}. Now just compare ${items.map(([b, k]) => b ** k).join(', ')}: the ${which} is ${pick[0] ** pick[1]}, so the answer is <b>${pow(pick[0], pick[1] * g)}</b>.`,
      };
    },
  ],

  'Age multiples': [
    // ages that are multiples of a child's age: that happens exactly when the child's age divides the age gap
    (d, ctx) => {
      const [[lo, D]] = combo(ctx, [[[20, 8], [20, 3], [30, 8], [30, 6], [40, 10]]]), gap = d.int(2, 6);
      const g = range(lo - 1, lo + 8).find((x) => divisorsOf(x).length === D), z = range(2, g + gap).find((k) => (g + gap) % k === 0), ans = g + gap + z;
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
    // how many times it happens: the number of divisors of the gap
    (d, ctx) => {
      const [G] = combo(ctx, [range(18, 60).filter((g) => g !== 36)]);
      const [kid, A] = d.shuffle(NAMES).slice(0, 2), divs = divisorsOf(G), D = divs.length;
      return {
        topic: 'Age multiples', rank: 9,
        text: `${A} is exactly ${G} years older than ${kid}, and they share a birthday. Counting from ${kid}'s 1st birthday on, on how many of ${kid}'s birthdays will ${A}'s age be a whole-number multiple of ${kid}'s age?`,
        answer: choices(d, D, [D - 1, D + 1, D - 2, Math.floor(G / 2), 2 * D]),
        check: () => { const count = range(1, 500).filter((y) => (G + y) % y === 0).length; return count === D ? '' : `counted ${count}`; },
        solution: `When ${kid} is z, ${A} is z + ${G}, and z + ${G} is a multiple of z exactly when z divides ${G}. The divisors of ${G} are ${divs.join(', ')}, so it happens on <b>${D}</b> birthdays (the last one when ${kid} turns ${G}).`,
      };
    },
    // backward: the parent's age from the number of times
    (d, ctx) => {
      const OK = [];
      for (const lo of [15, 20, 25, 30, 35, 40, 45]) for (const D of [3, 4, 5, 6, 8, 10, 12]) {
        const gs = range(lo - 1, lo + 8).filter((g) => divisorsOf(g).length === D);
        if (gs.length === 1 && gs[0] !== 36) OK.push([lo, D]);
      }
      const [[lo, D]] = combo(ctx, [OK]);
      const g = range(lo - 1, lo + 8).find((x) => divisorsOf(x).length === D), [kid, A] = d.shuffle(NAMES).slice(0, 2);
      const near = range(lo, lo + 9).filter((a) => a !== g + 1);
      return {
        topic: 'Age multiples', rank: 12,
        text: `Today ${kid} turns 1, and it is also ${A}'s birthday. ${A} is between ${lo} and ${lo + 9} years old. Today is the first of exactly ${D} birthdays on which ${A}'s age is a whole-number multiple of ${kid}'s age. How old is ${A} today?`,
        answer: choices(d, g + 1, [g, g + 2, ...d.shuffle(near)]),
        check: () => { const fits = range(lo, lo + 9).filter((a) => range(1, 300).filter((y) => (a - 1 + y) % y === 0).length === D); return fits.length === 1 && fits[0] === g + 1 ? '' : `fits: ${fits}`; },
        solution: `The gap between their ages is ${A}'s age minus 1. ${A}'s age is a multiple of ${kid}'s exactly when ${kid}'s age divides that gap, so the gap has exactly ${D} divisors. The gap is between ${lo - 1} and ${lo + 8}, and the only number there with ${D} divisors is ${g} (${divisorsOf(g).join(', ')}). So ${A} is <b>${g + 1}</b>.`,
      };
    },
    // when one age will be a set multiple of the other
    (d, ctx) => {
      const [C, y, m] = combo(ctx, [range(3, 14), range(2, 15), [2, 3, 4]], (C, y, m) => { const P = m * (C + y) - y; return P >= 25 && P <= 60; });
      const P = m * (C + y) - y, [kid, A] = d.shuffle(NAMES).slice(0, 2), times = { 2: 'twice', 3: 'three times', 4: 'four times' }[m];
      return {
        topic: 'Age multiples', rank: 6,
        text: `${A} is ${P} years old and ${kid} is ${C}. In how many years will ${A} be exactly ${times} as old as ${kid}?`,
        answer: choices(d, y, [P - m * C, Math.round(P / m - C), y + 1, y - 1, Math.round((P - C) / m)]),
        check: () => { const yy = range(1, 100).find((t) => P + t === m * (C + t)); return yy === y ? '' : `it happens in ${yy} years`; },
        solution: `In y years ${A} is ${P} + y and ${kid} is ${C} + y. We need ${P} + y = ${m}(${C} + y), so ${P} − ${m * C} = ${m - 1}y and y = <b>${y}</b>. (Then ${A} is ${P + y} and ${kid} is ${C + y}.)`,
      };
    },
  ],
};
