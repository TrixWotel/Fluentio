// Harder AMC 10 probability: 5 topics with ranks from 9 to 22, modelled on ideas from recent contests (a random walk
// that stops at either end, two people side by side at a round table, the expected largest count, people getting their
// own things back, and the AMC’s own scoring), with new numbers, wording and settings. Each topic asks its idea three or
// four ways, and check() gets every answer a second way: the state equations solved exactly with BigInt fractions, or
// every seating, order, roll or guess tried one by one.
import { combo, num, frac, gcd, choose } from '../kit/bank.js';
import { choices, showFrac, range } from './amc-kit.js';

const cut = (p, q) => { const g = gcd(p, q) || 1; return [p / g, q / g]; };
const fr = ([p, q]) => frac(p, q);
const under1 = ([p, q]) => p > 0 && p < q;
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
// small fractions [p, q] in lowest terms, for the answers and the wrong answers
const plus = ([a, b], [c, e]) => cut(a * e + c * b, b * e);
const minus = ([a, b], [c, e]) => cut(a * e - c * b, b * e);
const times = ([a, b], [c, e]) => cut(a * c, b * e);
const over = ([a, b], [c, e]) => cut(a * e, b * c);
const ONE = [1, 1];
// "p/q = " before a fraction that reduces, nothing when p/q is already in lowest terms
const ratio = (p, q) => (gcd(p, q) === 1 ? '' : `${num(p)}/${num(q)} = `);
// a fraction as written, not reduced (for working that goes on to reduce it)
const raw = (p, q) => `<span class="fr"><span>${p}</span><span>${q}</span></span>`;
// a sum of whole numbers as people write it: 6 + 4 + 2 − 2
const sumText = (list) => list.map((v, i) => (i === 0 ? num(v) : v < 0 ? ` − ${num(-v)}` : ` + ${num(v)}`)).join('');
// combo, with a name of its own for each kind of question, so no two kinds share a list of combinations
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
const Cap = (s) => s[0].toUpperCase() + s.slice(1);
const PAIRS = [['Asha', 'Bruno'], ['Celia', 'Dmitri'], ['Elif', 'Femi'], ['Greta', 'Hiro'], ['Ines', 'Jamal'], ['Kofi', 'Lena'], ['Mira', 'Nils'], ['Oona', 'Pablo']];
const TRIOS = [['Ravi', 'Sana', 'Theo'], ['Uma', 'Victor', 'Wen'], ['Yusuf', 'Zoe', 'Aiko'], ['Bram', 'Chloe', 'Dara'], ['Emil', 'Fatima', 'Goran']];
const SOLO = ['Priya', 'Mateo', 'Hannah', 'Kenji', 'Amara', 'Lucas', 'Noor', 'Tobias', 'Selma', 'Rafael'];
// derangements: orders of n things with nothing in its own place
const DER = [1, 0, 1, 2, 9, 44, 265, 1854, 14833];

// ---------- exact fractions for the checks: [top, bottom] as BigInts ----------
const bgcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const norm = ([p, q]) => { if (q < 0n) { p = -p; q = -q; } const g = bgcd(p, q) || 1n; return [p / g, q / g]; };
const big = (p, q = 1) => norm([BigInt(p), BigInt(q)]);
const add = (x, y) => norm([x[0] * y[1] + y[0] * x[1], x[1] * y[1]]);
const sub = (x, y) => norm([x[0] * y[1] - y[0] * x[1], x[1] * y[1]]);
const mul = (x, y) => norm([x[0] * y[0], x[1] * y[1]]);
const div = (x, y) => norm([x[0] * y[1], x[1] * y[0]]);
const equal = (x, [p, q]) => x[0] * BigInt(q) === x[1] * BigInt(p);
const show = (x) => `${x[0]}/${x[1]}`;
// A·x = b, solved exactly (Gaussian elimination)
function solve(A, b) {
  const n = b.length, M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    const r = M.findIndex((row, i) => i >= c && row[c][0] !== 0n);
    [M[c], M[r]] = [M[r], M[c]];
    for (let i = 0; i < n; i++) if (i !== c && M[i][c][0] !== 0n) { const f = div(M[i][c], M[c][c]); M[i] = M[i].map((v, j) => sub(v, mul(f, M[c][j]))); }
  }
  return M.map((row, i) => div(row[n], row[i]));
}
// the state equations, solved exactly: value(s) = step + Σ chance·value(next) for each open state s, where a finished
// state has the value given in ends. moves: { state: [[chance as [p, q], next state], …] }. step 1 gives the expected
// number of steps; step 0 with ends worth 1 or 0 gives the chance of finishing at the ends worth 1
function states(moves, ends, step) {
  const names = Object.keys(moves), at = new Map(names.map((s, i) => [s, i]));
  const A = names.map((s, i) => names.map((t, j) => big(i === j ? 1 : 0))), b = names.map(() => big(step));
  names.forEach((s, i) => {
    for (const [[p, q], t] of moves[s]) {
      if (at.has(t)) A[i][at.get(t)] = sub(A[i][at.get(t)], big(p, q));
      else b[i] = add(b[i], mul(big(p, q), big(...ends[t])));
    }
  });
  const x = solve(A, b);
  return Object.fromEntries(names.map((s, i) => [s, x[i]]));
}
// the states for a coin flipped until one of some patterns shows: the longest end of the flips so far that begins a
// pattern ('' for none). A finished pattern w is the state '=w'. Heads has chance [a, b]
function patternMoves(pats, [a, b]) {
  const begins = new Set(['']);
  for (const w of pats) for (let i = 1; i < w.length; i++) begins.add(w.slice(0, i));
  const moves = {};
  for (const s of begins) {
    moves[s] = [['H', [a, b]], ['T', [b - a, b]]].map(([c, chance]) => {
      const t = s + c, done = pats.find((w) => t.endsWith(w));
      if (done) return [chance, `=${done}`];
      const i = range(0, t.length).find((j) => begins.has(t.slice(j)));
      return [chance, t.slice(i)];
    });
  }
  return moves;
}
// every order of 0 … n − 1 (one array, changed in place: Heap’s method), for checks
function eachPerm(n, f) {
  const a = range(0, n - 1), c = Array(n).fill(0);
  f(a);
  for (let i = 0; i < n;) {
    if (c[i] < i) { const j = i % 2 ? c[i] : 0; [a[j], a[i]] = [a[i], a[j]]; f(a); c[i]++; i = 0; } else { c[i] = 0; i++; }
  }
}
// every choice of k of the numbers 0 … n − 1, as bit masks
const subsets = (n, k) => range(0, 2 ** n - 1).filter((m) => { let c = 0; for (let x = m; x; x &= x - 1) c++; return c === k; });

// ---------- drawing: an svg with the page’s figure styles ----------
const r2 = (v) => Math.round(v * 100) / 100;
const svg = (w, h, name, parts) => `<svg class="tri" viewBox="0 0 ${w} ${h}" role="img" aria-label="${name}">${parts.join('')}</svg>`;
const seg = ([x1, y1], [x2, y2], cls = 'side') => `<line class="${cls}" x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}"/>`;
const ring = ([x, y], r, cls = 'side') => `<circle class="${cls}" cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}"/>`;
const box = ([x, y], w, h, cls = 'side') => `<rect class="${cls}" x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}"/>`;
const label = ([x, y], text, cls = 'vx', anchor = 'middle') => `<text class="${cls}" x="${r2(x)}" y="${r2(y + 5)}" text-anchor="${anchor}">${text}</text>`;
// a row of n + 1 places numbered 0 to n: squares on a strip, or lily pads between two banks (or a wall and a bank),
// with the start ringed and a word over each end
function row(n, start, { pads = false, left = '', right = '', name }) {
  const w = 400, h = 150, gap = Math.min(56, 340 / (n + 1)), x0 = (w - gap * n) / 2, y = 66, size = Math.min(40, gap - 6);
  const parts = [], ends = pads ? [x0 - size / 2 - 9, x0 + n * gap + size / 2 + 9] : [x0, x0 + n * gap];
  if (pads) for (const x of ends) parts.push(seg([x, y - 26], [x, y + 26]));
  else parts.push(box([x0 - size / 2, y - size / 2], gap * n + size, size));
  for (let i = 0; i <= n; i++) {
    const x = x0 + i * gap;
    if (pads) parts.push(ring([x, y], size / 2));
    else if (i) parts.push(seg([x - gap / 2, y - size / 2], [x - gap / 2, y + size / 2]));
    parts.push(label([x, y + size / 2 + 15], i, 'ang'));
  }
  parts.push(`<circle class="seg" fill="none" cx="${r2(x0 + start * gap)}" cy="${y}" r="${r2(size / 3.2)}"/>`);
  parts.push(label([Math.max(ends[0], 30), y - 42], left), label([Math.min(ends[1], w - 30), y - 42], right));
  return svg(w, h, name, parts);
}

export const hardProbability = {
  'Random walks and states': [
    // a walk with a bias that stops at either end: the chance of ending at a given end
    (d, ctx) => {
      const MOVERS = [
        [2, 1, 'a fair die is rolled: on a 1, 2, 3 or 4 the token moves one square right, and on a 5 or 6 one square left'],
        [1, 2, 'a fair die is rolled: on a 1 or 2 the token moves one square right, and on a 3, 4, 5 or 6 one square left'],
        [3, 1, 'a spinner with four equal parts, three marked R and one marked L, is spun, and the token moves one square right on R and one square left on L'],
        [1, 3, 'a spinner with four equal parts, one marked R and three marked L, is spun, and the token moves one square right on R and one square left on L'],
        [3, 2, 'a marble is drawn from a bag of 3 red and 2 blue marbles and put back: on red the token moves one square right, and on blue one square left'],
        [2, 3, 'a marble is drawn from a bag of 2 red and 3 blue marbles and put back: on red the token moves one square right, and on blue one square left'],
      ];
      const [[a, b, how], n, k, far] = pick(ctx, 'ends', [MOVERS, [4, 5, 6], [1, 2, 3, 4], [true, false]], ([a, b], n, k) => k < n && (a + b < 5 || n < 6));
      const p = [a, a + b], q = [b, a + b], gaps = range(0, n - 1).map((j) => a ** (n - 1 - j) * b ** j), S = gaps.reduce((s, g) => s + g, 0);
      const first = gaps.slice(0, k), top = first.reduce((s, g) => s + g, 0), right = cut(top, S), ans = far ? right : cut(S - top, S);
      const flipped = cut(gaps.slice(n - k).reduce((s, g) => s + g, 0), S);
      const wrongs = far ? [cut(k, n), cut(S - top, S), flipped, cut(a ** (n - k), (a + b) ** (n - k)), p, cut(a * k, a * k + b * (n - k))]
        : [cut(n - k, n), right, minus(ONE, flipped), cut(b ** k, (a + b) ** k), q, cut(b * (n - k), a * k + b * (n - k))];
      return {
        topic: 'Random walks and states', rank: 20,
        text: `A token starts on square ${k} of a strip of squares numbered 0 to ${n}, as shown. Each turn, ${how}. The game ends as soon as the token reaches square 0 or square ${n}. What is the probability that the game ends on square ${far ? n : 0}?`,
        figure: row(n, k, { left: 'stop', right: 'stop', name: `A strip of squares numbered 0 to ${n} with the token on square ${k}` }),
        answer: choices(d, ans, wrongs.filter(under1), showFrac),
        check: () => {
          const moves = {};
          for (let j = 1; j < n; j++) moves[j] = [[p, String(j + 1)], [q, String(j - 1)]];
          const v = states(moves, { 0: far ? [0, 1] : [1, 1], [n]: far ? [1, 1] : [0, 1] }, 0)[k];
          return equal(v, ans) ? '' : `the state equations give ${show(v)}, said ${ans.join('/')}`;
        },
        solution: `Let P(j) be the chance that the game ends on square ${n} when the token is on square j, so P(0) = 0 and P(${n}) = 1. From square j the token moves right with chance ${fr(p)} and left with chance ${fr(q)}, so P(j) = ${fr(p)}·P(j + 1) + ${fr(q)}·P(j − 1). Writing the left side as ${fr(p)}·P(j) + ${fr(q)}·P(j), this says ${fr(p)}·(P(j + 1) − P(j)) = ${fr(q)}·(P(j) − P(j − 1)), so each gap between neighboring squares’ chances is ${fr(cut(b, a))} times the gap before it. The ${n} gaps from P(0) = 0 up to P(${n}) = 1 are therefore in the ratio ${gaps.join(' : ')}, which adds up to ${S}. P(${k}) is ${k === 1 ? 'just the first gap' : `the sum of the first ${k} gaps, (${first.join(' + ')})/${S}`} = ${far ? `<b>${fr(ans)}</b>.` : `${fr(right)}. So the game ends on square 0 with probability 1 − ${fr(right)} = <b>${fr(ans)}</b>.`}`,
      };
    },
    // a coin flipped until one of two patterns shows: which one comes first
    (d, ctx) => {
      const RACES = [
        { X: 'HH', Y: 'TH', kind: 'start', run: 'HH', why: 'Suppose the first HH does not start at flip 1. Then the flip just before it is a T (if it were an H, HH would have shown one flip earlier), and that T with the next H makes TH, which is complete before the HH is. So HH comes first only when the first two flips are both heads' },
        { X: 'TT', Y: 'HT', kind: 'start', run: 'TT', why: 'Suppose the first TT does not start at flip 1. Then the flip just before it is an H (if it were a T, TT would have shown one flip earlier), and that H with the next T makes HT, which is complete before the TT is. So TT comes first only when the first two flips are both tails' },
        { X: 'HHH', Y: 'THH', kind: 'start', run: 'HHH', why: 'Suppose the first HHH does not start at flip 1. Then the flip just before it is a T (if it were an H, HHH would have shown one flip earlier), and that T with the next two H’s makes THH, which is complete before the HHH is. So HHH comes first only when the first three flips are all heads' },
        { X: 'HHT', Y: 'THH', kind: 'start', run: 'HH', why: 'If the first two flips are heads, the heads go on until the first T, which completes HHT, and THH cannot show before that T. Otherwise the first HH has a T just before it (if it were an H, HH would have shown one flip earlier), so THH is complete as soon as that HH is, before HHT, which needs one more flip. So HHT comes first exactly when the first two flips are both heads' },
        { X: 'HH', Y: 'HT', kind: 'next' }, { X: 'TT', Y: 'TH', kind: 'next' }, { X: 'HT', Y: 'TH', kind: 'first' },
        { X: 'HHT', Y: 'HTH', kind: 'states' }, { X: 'TTH', Y: 'THT', kind: 'states' },
      ];
      const [race, p, ask] = pick(ctx, 'race', [RACES, [[1, 2], [2, 3], [1, 3], [3, 4], [1, 4], [3, 5], [2, 5]], [0, 1]],
        (r, [a, b]) => (r.kind === 'next' || r.kind === 'first' ? a * 2 !== b : r.kind === 'start' || b < 5));
      const { X, Y, kind } = race, q = minus(ONE, p), c = (s) => s.split('').reduce((t, x) => times(t, x === 'H' ? p : q), ONE);
      const H = X[0] === 'H';                                  // the patterns with T and H swapped read the same way
      const [pp, qq, h, t] = H ? [p, q, 'H', 'T'] : [q, p, 'T', 'H'];
      const PX = kind === 'start' ? c(race.run) : kind === 'next' || kind === 'first' ? pp : over(ONE, plus(ONE, qq));
      const ans = ask ? minus(ONE, PX) : PX, [A, B] = ask ? [Y, X] : [X, Y], fair = p[0] * 2 === p[1];
      const art = (x) => (x === 'H' ? 'an' : 'a'), tail = ask ? `${fr(PX)}. So ${Y} comes first with probability 1 − ${fr(PX)} = <b>${fr(ans)}</b>.` : `<b>${fr(ans)}</b>.`;
      const why = {
        start: () => `${race.why}, which has probability (${fr(pp)})<sup>${race.run.length}</sup> = ${tail}`,
        next: () => `Both patterns start with ${h}, so nothing before the first ${h} matters. Once ${art(h)} ${h} has come, the very next flip settles it: another ${h} completes ${X}, and ${art(t)} ${t} completes ${Y}. So ${X} comes first exactly when that flip is ${h === 'H' ? 'heads' : 'tails'}, which has probability ${tail}`,
        first: () => `Look at the first flip. If it is an H, the flips stay H until the first T, and that T completes HT, while TH cannot have shown yet, since it needs a T before an H. If it is a T, the first H to come completes TH in the same way. So HT comes first exactly when the first flip is heads, which has probability ${tail}`,
        states: () => `Use states, keeping track only of how the latest flips could begin a pattern. Once ${h}${h} has shown, ${X} is sure to win, because the first ${t} after it completes ${X}. Let x be ${X}’s chance from a lone ${h} (one not right after another ${h}). The next flip gives ${h}${h} (chance ${fr(pp)}, a sure win) or ${h}${t} (chance ${fr(qq)}), and from ${h}${t} ${art(h)} ${h} completes ${Y}, while ${art(t)} ${t} wipes out all progress, so the race is then just a wait for the next ${h}, and ${X}’s chance is x again. So x = ${fr(pp)} + ${fr(qq)}·${fr(qq)}·x, which gives x = ${fr(pp)}/(1 − ${fr(times(qq, qq))}) = ${fr(PX)}. The race begins with no progress, which is also just a wait for ${art(h)} ${h}, so ${X} comes first with probability ${tail}`,
      }[kind]();
      const ratio = over(c(X), plus(c(X), c(Y)));
      const tip = {
        start: `Ask what the flip just before the first ${race.run} must be, unless that ${race.run} starts at flip 1.`,
        next: `Nothing before the first ${h} matters, so ask what the flip right after it does.`,
        first: 'Ask what happens after the very first flip, whichever way it lands.',
      }[kind];
      return {
        topic: 'Random walks and states', rank: { start: 19, next: 18, first: 18, states: 20 }[kind],
        ...(tip ? { tip } : {}),
        text: `${fair ? 'A fair coin' : `A coin that lands heads with probability ${fr(p)}`} is flipped again and again, and the results are written in a row, H for heads and T for tails. The flipping stops as soon as ${X} or ${Y} appears as consecutive letters. What is the probability that ${A} appears before ${B}?`,
        answer: choices(d, ans, [[1, 2], minus(ONE, ans), ask ? minus(ONE, ratio) : ratio, c(A), ask ? minus(ONE, pp) : pp, kind === 'states' ? over(ONE, plus(ONE, pp)) : times(pp, pp), [2, 3], [1, 4]].filter(under1), showFrac),
        check: () => {
          const v = states(patternMoves([X, Y], p), { [`=${X}`]: [1, 1], [`=${Y}`]: [0, 1] }, 0)[''], w = ask ? sub(big(1), v) : v;
          return equal(w, ans) ? '' : `the state equations give ${show(w)}, said ${ans.join('/')}`;
        },
        solution: why,
      };
    },
    // the expected number of flips (or rolls) until a run or a pattern shows
    (d, ctx) => {
      const [[kind, p]] = pick(ctx, 'wait', [[['HH', [1, 3]], ['HH', [2, 3]], ['HH', [1, 4]], ['HH', [3, 4]], ['HH', [2, 5]], ['HH', [3, 5]], ['HH', [1, 6]], ['HHH', [1, 2]], ['HHH', [2, 3]],
        ['HHH', [1, 3]], ['HT', [1, 3]], ['HT', [1, 4]], ['HT', [2, 5]], ['HT', [1, 6]], ['same', [1, 3]], ['same', [1, 4]], ['same', [2, 5]]]]);
      const q = minus(ONE, p), die = p[1] === 6, fair = p[0] * 2 === p[1], unit = die ? 'roll' : 'flip';
      const [hit, miss] = die ? ['a six', 'anything else'] : ['heads', 'tails'];
      const p2 = times(p, p), p3 = times(p2, p), pq = times(p, q), hp = plus(ONE, p);
      let E, wrongs, sol;
      if (kind === 'HH') {
        E = over(hp, p2);
        wrongs = [over(ONE, p2), over([2, 1], p2), over([2, 1], p), minus(E, ONE), plus(over(ONE, p2), over([2, 1], p))];
        sol = `Use states that record how much of the run the last ${unit}s already have. Let a be the expected number of ${unit}s still to come with no progress (at the start, or just after ${miss}), and b the number still to come right after ${hit}. Each ${unit} counts 1, and ${hit} comes with chance ${fr(p)}: a = 1 + ${fr(p)}·b + ${fr(q)}·a, and b = 1 + ${fr(q)}·a, since right after ${hit}, ${hit} again finishes and ${miss} starts over. Putting b into the first equation, a = 1 + ${fr(p)} + ${fr(plus(pq, q))}·a, so ${fr(p2)}·a = ${fr(hp)}, and a = <b>${fr(E)}</b>.`;
      } else if (kind === 'HHH') {
        const s = plus(hp, p2);
        E = over(s, p3);
        wrongs = [over(ONE, p3), over([3, 1], p), plus(over(ONE, p2), over(ONE, p3)), minus(E, ONE), plus(E, ONE), over([2, 1], p3)];
        sol = `Use states that record how many heads in a row the last flips end with (none, one or two). Let a, b and c be the expected numbers of flips still to come from those states. Each flip counts 1, heads moves one state up (or finishes, from two), and tails sends it back to none: a = 1 + ${fr(p)}·b + ${fr(q)}·a, b = 1 + ${fr(p)}·c + ${fr(q)}·a and c = 1 + ${fr(q)}·a. Putting c into b gives b = ${fr(hp)} + ${fr(times(q, hp))}·a, and putting that into a gives a = ${fr(s)} + ${fr(times(q, s))}·a. Since 1 − ${fr(times(q, s))} = ${fr(p3)}, this means ${fr(p3)}·a = ${fr(s)}, so a = <b>${fr(E)}</b>.`;
      } else if (kind === 'HT') {
        E = plus(over(ONE, p), over(ONE, q));
        wrongs = [over(ONE, p2), over(ONE, times(q, q)), over(hp, p2), minus(E, ONE), [4, 1], over([2, 1], p)];
        sol = `Split the wait into two waits, one after the other. First wait for ${hit}, and since something with chance r takes 1/r tries on average, this takes ${fr(over(ONE, p))} ${unit}s on average. Once ${hit} has come, it stays useful (another ${die ? 'six' : 'head'} just takes its place), so now wait for ${miss}, which completes the pattern, ${fr(over(ONE, q))} more on average. In all, ${fr(over(ONE, p))} + ${fr(over(ONE, q))} = <b>${fr(E)}</b>.`;
      } else {
        const hh = over(plus(ONE, q), minus(ONE, pq)), tt = plus(ONE, times(p, hh)), m = plus(p2, times(q, q));
        E = plus(ONE, plus(times(p, hh), times(q, tt)));
        wrongs = [[3, 1], over(ONE, m), plus(ONE, over(ONE, m)), minus(E, ONE), plus(ONE, over(ONE, minus(ONE, pq)))];
        sol = `After the first flip, all that matters is which way the last flip landed. Let h be the expected number of flips still to come after heads, and t after tails. The next flip either repeats, which finishes, or switches: h = 1 + ${fr(q)}·t and t = 1 + ${fr(p)}·h. Putting t into the first, h = 1 + ${fr(q)} + ${fr(pq)}·h, so ${fr(minus(ONE, pq))}·h = ${fr(plus(ONE, q))} and h = ${fr(hh)}. Then t = 1 + ${fr(p)}·${fr(hh)} = ${fr(tt)}. Counting the first flip, the expected number is 1 + ${fr(p)}·${fr(hh)} + ${fr(q)}·${fr(tt)} = <b>${fr(E)}</b>.`;
      }
      const what = { HH: die ? 'two sixes come up in a row' : 'it lands heads twice in a row', HHH: 'it lands heads three times in a row', HT: die ? 'a six is followed right away by a roll that is not a six' : 'a head is followed right away by a tail', same: 'it lands the same way twice in a row' }[kind];
      return {
        topic: 'Random walks and states', rank: { HH: 19, HHH: fair ? 19 : 21, HT: 18, same: 21 }[kind],
        text: `${die ? 'A fair die is rolled' : fair ? 'A fair coin is flipped' : `A coin that lands heads with probability ${fr(p)} is flipped`} until ${what}. What is the expected number of ${unit}s?`,
        answer: choices(d, E, wrongs, showFrac),
        check: () => {
          const pats = kind === 'same' ? ['HH', 'TT'] : [kind], v = states(patternMoves(pats, p), Object.fromEntries(pats.map((w) => [`=${w}`, [0, 1]])), 1)[''];
          return equal(v, E) ? '' : `the state equations give ${show(v)}, said ${E.join('/')}`;
        },
        solution: sol,
      };
    },
    // a frog on lily pads: the expected number of jumps, with a wall at one end or a bank at each
    (d, ctx) => {
      const [kind, n, k] = pick(ctx, 'frog', [['wall', 'banks'], [4, 5, 6, 7, 8], [0, 1, 2, 3, 4]], (kind, n, k) => (kind === 'wall' ? k <= 3 && k < n - 1 : k >= 1 && k < n));
      const wall = kind === 'wall', E = wall ? n * n - k * k : k * (n - k), half = frac(1, 2);
      const odds = range(k, n - 1).map((j) => 2 * j + 1), drops = range(0, k - 1).map((j) => n - 1 - 2 * j);
      return {
        topic: 'Random walks and states', rank: wall ? 22 : 20,
        text: wall
          ? `Lily pads numbered 0 to ${n} lie in a straight row across a pond, as shown: pad 0 is against a rock wall, and pad ${n} is at the far bank. A frog starts on pad ${k}. Each jump takes it to a neighboring pad: from pad 0 it always jumps to pad 1, and from any other pad it jumps one pad left or one pad right with equal chance. It stops as soon as it reaches pad ${n}. What is the expected number of jumps it makes?`
          : `Lily pads numbered 0 to ${n} lie in a straight row across a pond, as shown, with pad 0 at one bank and pad ${n} at the other. A frog starts on pad ${k}. Each jump takes it one pad left or one pad right, with equal chance, and it stops as soon as it reaches pad 0 or pad ${n}. What is the expected number of jumps it makes?`,
        figure: row(n, k, { pads: true, left: wall ? 'wall' : 'bank', right: 'bank', name: `Lily pads numbered 0 to ${n} with the frog on pad ${k}` }),
        answer: choices(d, E, wall ? [(n - k) ** 2, n * n, E - (n - k), E + (n - k), 2 * (n - k)] : [n, Math.min(k, n - k) ** 2, 2 * E, k * k + (n - k) ** 2, E / 2].filter(Number.isInteger)),
        check: () => {
          const moves = {}, half2 = [1, 2];
          if (wall) moves[0] = [[[1, 1], '1']];
          for (let j = 1; j < n; j++) moves[j] = [[half2, String(j - 1)], [half2, String(j + 1)]];
          const v = states(moves, wall ? { [n]: [0, 1] } : { 0: [0, 1], [n]: [0, 1] }, 1)[k];
          return equal(v, [E, 1]) ? '' : `the state equations give ${show(v)}, said ${E}`;
        },
        solution: wall
          ? `Let E(j) be the expected number of jumps still to come from pad j, so E(${n}) = 0. From pad 0 the next jump surely goes to pad 1, so E(0) = 1 + E(1), and from the pads in between E(j) = 1 + ${half}·(E(j − 1) + E(j + 1)). Look at the drops d(j) = E(j) − E(j + 1). The wall gives d(0) = 1, and the middle equation rearranges to d(j) = d(j − 1) + 2, so the drops are the odd numbers 1, 3, 5, …, that is d(j) = 2j + 1. From pad ${k} the frog has to make up every drop from pad ${k} to pad ${n}, and since E(${n}) = 0, E(${k}) is their sum, ${odds.length <= 5 ? odds.join(' + ') : `${odds[0]} + ${odds[1]} + ⋯ + ${odds.at(-1)}`}. The first m odd numbers add up to m<sup>2</sup>, so that is ${n}<sup>2</sup>${k ? ` − ${k}<sup>2</sup>` : ''} = <b>${E}</b>.`
          : `Let E(j) be the expected number of jumps still to come from pad j, so E(0) = E(${n}) = 0, and E(j) = 1 + ${half}·(E(j − 1) + E(j + 1)) for the pads in between. Rearranged, the drops d(j) = E(j) − E(j + 1) satisfy d(j) = d(j − 1) + 2, so each drop is 2 more than the one before. The ${n} drops from pad 0 to pad ${n} add up to E(0) − E(${n}) = 0, so they run from −${n - 1} up to ${n - 1} in steps of 2, that is d(j) = 2j − ${n - 1}. Then E(${k}) = E(0) − ${range(0, k - 1).map((j) => `d(${j})`).join(' − ')} = ${k > 1 ? `${sumText(drops)} = ` : ''}${E}, which is ${k}·(${n} − ${k}); in general E(k) = k(${n} − k), the product of the frog’s distances to the two banks. So the answer is <b>${E}</b>.`,
      };
    },
  ],

  'Round table chances': [
    // two given people: side by side, across or close, with empty chairs; or one person next to either of two others
    (d, ctx) => {
      const [kind, n, m] = pick(ctx, 'two', [['next', 'across', 'near', 'either', 'neither'], range(6, 12), [4, 5, 6, 7]],
        (kind, n, m) => (kind === 'either' || kind === 'neither' ? m === 4 : n >= 8 && m < n - 2 && (kind !== 'across' || n % 2 === 0)));
      const [A, B, C] = d.pick(TRIOS);
      if (kind === 'either' || kind === 'neither') {
        const all = choose(n - 1, 2), none = choose(n - 3, 2), neither = cut(none, all), ans = kind === 'neither' ? neither : minus(ONE, neither);
        const wrongs = kind === 'neither' ? [cut(n - 3, n - 1), times(cut(n - 3, n - 1), cut(n - 3, n - 1)), minus(ONE, neither), minus(ONE, cut(4, n - 1)), cut(n - 4, n - 1)]
          : [cut(4, n - 1), cut(2, n - 1), neither, minus(ONE, times(cut(n - 3, n - 1), cut(n - 3, n - 1))), cut(3, n - 1)];
        return {
          topic: 'Round table chances', rank: 16,
          text: `${Cap(WORDS[n])} people, among them ${A}, ${B} and ${C}, sit in random order around a round table with ${n} seats. What is the probability that ${kind === 'neither' ? `neither ${B} nor ${C} sits next to ${A}` : `${A} sits next to at least one of ${B} and ${C}`}?`,
          answer: choices(d, ans, wrongs.filter(under1), showFrac),
          check: () => {
            let good = 0, all3 = 0;
            const near = (x, y) => (x - y + n) % n === 1 || (y - x + n) % n === 1;
            for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) {
              if (a === b || a === c || b === c) continue;
              all3++;
              if ((near(a, b) || near(a, c)) === (kind === 'either')) good++;
            }
            return good * ans[1] === all3 * ans[0] ? '' : `counted ${good}/${all3}, said ${ans.join('/')}`;
          },
          solution: `Look only at ${A}’s two neighbors. Whatever seat ${A} takes, the two seats beside ${A} are filled by 2 of the other ${n - 1} people, and each of the C(${n - 1}, 2) = ${all} pairs is equally likely. Neither neighbor is ${B} or ${C} when both come from the other ${n - 3} people, which happens for C(${n - 3}, 2) = ${none} pairs. So neither of them sits next to ${A} with probability ${ratio(none, all)}${kind === 'neither' ? `<b>${fr(ans)}</b>.` : `${fr(neither)}. At least one of them does with probability 1 − ${fr(neither)} = <b>${fr(ans)}</b>.`}`,
        };
      }
      const good = { next: 2, across: 1, near: 4 }[kind], ans = cut(good, n - 1);
      const where = { next: 'in neighboring chairs', across: 'in chairs directly across the table from each other', near: 'with at most one chair between them (in neighboring chairs, or with exactly one chair between)' }[kind];
      const which = { next: 'the 2 chairs beside', across: 'the 1 chair directly across from', near: 'the 4 chairs within two places of' }[kind];
      return {
        topic: 'Round table chances', rank: 15,
        text: `${Cap(WORDS[m])} friends, ${A} and ${B} among them, choose ${m} of the ${n} chairs around a round table at random and sit down, one to a chair; the other chairs stay empty. What is the probability that ${A} and ${B} sit ${where}?`,
        answer: choices(d, ans, [cut(good, m - 1), cut(good, n), cut(good === 1 ? 2 : good / 2, n - 1), cut(good, n - 2), cut(good, m)].filter(under1), showFrac),
        check: () => {
          // every way the two of them can take two different chairs (the others don’t change which pairs are equally likely)
          let hit = 0;
          for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) {
            if (a === b) continue;
            const gap = Math.min((a - b + n) % n, (b - a + n) % n);
            if (kind === 'next' ? gap === 1 : kind === 'across' ? gap === n / 2 : gap <= 2) hit++;
          }
          return hit * ans[1] === n * (n - 1) * ans[0] ? '' : `counted ${hit}/${n * (n - 1)}, said ${ans.join('/')}`;
        },
        solution: `Only the chairs of ${A} and ${B} matter; the other ${m - 2} friends and the empty chairs make no difference to them. Whichever chair ${A} takes, ${B} is equally likely to be in any of the other ${n - 1} chairs, however many people come. The good ones are ${which} ${A}. So the probability is ${ratio(good, n - 1)}<b>${fr(ans)}</b>.`,
      };
    },
    // three friends: no two side by side, at least two side by side, or exactly two
    (d, ctx) => {
      const [kind, n] = pick(ctx, 'three', [['apart', 'touch', 'pair'], range(7, 12)]);
      const [A, B, C] = d.pick(TRIOS), all = choose(n - 1, 2), mid = choose(n - 3, 2), sep = mid - (n - 4), apart = cut(sep, all);
      const pair = cut(6 * (n - 4), (n - 1) * (n - 2)), row3 = cut(6, (n - 1) * (n - 2)), ans = { apart, touch: minus(ONE, apart), pair }[kind];
      const wrongs = {
        apart: [times(cut(n - 3, n - 1), cut(n - 5, n - 2)), times(cut(n - 3, n - 1), cut(n - 3, n - 1)), minus(ONE, row3), cut(choose(n - 2, 3), choose(n, 3)), minus(ONE, apart)],
        touch: [apart, row3, cut(6, n - 1), pair, minus(ONE, times(cut(n - 3, n - 1), cut(n - 5, n - 2)))],
        pair: [cut(2 * (n - 4), (n - 1) * (n - 2)), minus(ONE, apart), row3, cut(4 * (n - 4), (n - 1) * (n - 2)), cut(3 * (n - 4), (n - 1) * (n - 2)), times(cut(6, n - 1), cut(n - 3, n - 2))],
      }[kind];
      const sepText = `Fix ${A}’s seat. ${B} and ${C} take 2 of the other ${n - 1} seats, and all C(${n - 1}, 2) = ${all} pairs of seats are equally likely. Those ${n - 1} seats form a row from the seat on ${A}’s left around to the seat on ${A}’s right; ${B} and ${C} must avoid both ends of that row (they are next to ${A}), so they use the middle ${n - 3} seats, and they must not take two neighbors there. Of the C(${n - 3}, 2) = ${mid} pairs of middle seats, ${n - 4} are neighbors, which leaves ${sep}. So no two friends sit together with probability ${ratio(sep, all)}`;
      return {
        topic: 'Round table chances', rank: kind === 'pair' ? 18 : 17,
        text: `${Cap(WORDS[n])} people, among them three friends ${A}, ${B} and ${C}, sit in random order around a round table with ${n} seats. What is the probability that ${{ apart: 'no two of the three friends sit next to each other', touch: 'at least two of the three friends sit next to each other', pair: 'exactly two of the three friends sit next to each other, with the third friend next to neither of them' }[kind]}?`,
        answer: choices(d, ans, wrongs.filter(under1), showFrac),
        check: () => {
          let hit = 0, all3 = 0;
          const near = (x, y) => (x - y + n) % n === 1 || (y - x + n) % n === 1;
          for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) for (let c = 0; c < n; c++) {
            if (a === b || a === c || b === c) continue;
            all3++;
            const pairs = near(a, b) + near(a, c) + near(b, c);
            if (kind === 'apart' ? pairs === 0 : kind === 'touch' ? pairs >= 1 : pairs === 1) hit++;
          }
          return hit * ans[1] === all3 * ans[0] ? '' : `counted ${hit}/${all3}, said ${ans.join('/')}`;
        },
        solution: kind === 'pair'
          ? `There are 3 choices for which two friends form the pair, and these cases can’t overlap, since two pairs at once would put all three friends in a row. Say the pair is ${A} and ${B}. Whatever seat ${A} takes, ${B} is equally likely to be in any of the other ${n - 1} seats, and 2 of them are next to ${A}, so the chance is ${ratio(2, n - 1)}${frac(2, n - 1)}. Then ${C} is in one of the other ${n - 2} seats and must avoid the 2 seats at the two ends of the pair, a chance of ${ratio(n - 4, n - 2)}${frac(n - 4, n - 2)}. So the answer is 3·${frac(2, n - 1)}·${frac(n - 4, n - 2)} = <b>${fr(ans)}</b>.`
          : kind === 'apart' ? `${sepText}<b>${fr(ans)}</b>.` : `Count the opposite, no two friends side by side. ${sepText}${fr(apart)}. That means at least two of them sit together with probability 1 − ${fr(apart)} = <b>${fr(ans)}</b>.`,
      };
    },
    // couples: all together, none together, at least one together, or one couple together and another apart
    (d, ctx) => {
      const [kind, m] = pick(ctx, 'couples', [['all', 'none', 'some', 'given'], [3, 4]]);
      const N = 2 * m, total = fact(N - 1), S = range(0, m).map((j) => choose(m, j) * 2 ** j * fact(N - j - 1));
      const noneCount = S.reduce((s, v, j) => s + (j % 2 ? -v : v), 0), none = cut(noneCount, total), allTog = cut(2 ** m * fact(m - 1), total);
      const given = times(cut(2, N - 1), cut(N - 4, N - 2));
      const ans = { all: allTog, none, some: minus(ONE, none), given }[kind];
      const [[A, B], [C, D]] = d.shuffle(PAIRS);
      const indep = cut((N - 3) ** m, (N - 1) ** m);
      const wrongs = {
        all: [cut(fact(m - 1), total), cut(2 ** m * fact(m), total), cut(2 ** m, (N - 1) ** m), cut(2 ** (m - 1) * fact(m - 1), total), cut(2 ** m * fact(m - 1), fact(N))],
        none: [indep, minus(ONE, none), cut(S[0] - S[1] + S[2], total), cut(N - 3, N - 1), cut(noneCount - 2 * (m % 2 ? -1 : 1) * S[m], total)],
        some: [minus(ONE, indep), none, cut(S[1] - S[2], total), cut(2, N - 1), cut(m, N - 1)],
        given: [cut(2, N - 1), times(cut(2, N - 1), cut(N - 3, N - 1)), times(cut(2, N - 1), cut(2, N - 2)), cut(1, N - 1), times(cut(2, N - 1), cut(N - 3, N - 2))],
      }[kind];
      const terms = range(0, m).map((j) => (j ? `${j % 2 ? '−' : '+'} C(${m}, ${j})·${2 ** j}·${N - j - 1}!` : `${N - 1}!`)).join(' ');
      const incl = `Counting seatings up to turning the table, there are (${N} − 1)! = ${num(total)} in all. If j particular couples sit together, glue each of them into a block that can face 2 ways, and then the ${N} − j units around the table give (${N} − j − 1)!·2<sup>j</sup> seatings. By inclusion–exclusion, the seatings with no couple together number ${terms} = ${S.map((v, j) => (j ? `${j % 2 ? '−' : '+'} ${num(v)}` : num(v))).join(' ')} = ${num(noneCount)}, so no couple sits together with probability ${num(noneCount)}/${num(total)} = `;
      return {
        topic: 'Round table chances', rank: { all: 17, none: 19, some: 19, given: 16 }[kind],
        tip: {
          all: 'Glue each couple into a block, then count the ways to seat the blocks around the table and to turn each block.',
          none: 'Glue the couples that sit together into blocks, and count the seatings with no couple together by inclusion–exclusion.',
          some: 'Count the opposite, no couple together, by inclusion–exclusion, gluing the couples that sit together into blocks.',
          given: 'Find the chance that the first couple sits together, then treat them as one block for the second couple.',
        }[kind],
        text: kind === 'given'
          ? `${Cap(WORDS[m])} couples sit in random order around a round table with ${N} seats; two of the couples are ${A} and ${B}, and ${C} and ${D}. What is the probability that ${A} and ${B} sit next to each other but ${C} and ${D} do not?`
          : `${Cap(WORDS[m])} couples (${N} people) sit in random order around a round table with ${N} seats. What is the probability that ${{ all: 'every couple sits side by side', none: 'no couple sits side by side', some: 'at least one couple sits side by side' }[kind]}?`,
        answer: choices(d, ans, wrongs.filter(under1), showFrac),
        check: () => {
          // person 2i and 2i + 1 are a couple; person 0 stays in seat 0, the others go round in every order
          let hit = 0, all = 0;
          eachPerm(N - 1, (a) => {
            const seat = [0, ...a.map((x) => x + 1)], together = range(0, m - 1).map(() => false);
            for (let i = 0; i < N; i++) { const x = seat[i], y = seat[(i + 1) % N]; if (x >> 1 === y >> 1) together[x >> 1] = true; }
            const c = together.filter(Boolean).length;
            all++;
            if (kind === 'all' ? c === m : kind === 'none' ? c === 0 : kind === 'some' ? c > 0 : together[0] && !together[1]) hit++;
          });
          return hit * ans[1] === all * ans[0] ? '' : `counted ${hit}/${all}, said ${ans.join('/')}`;
        },
        solution: {
          all: `Glue each couple into a block. Around the table the ${m} blocks can go in (${m} − 1)! = ${fact(m - 1)} orders, once turns of the table count as the same, and each block can face either way, which gives 2<sup>${m}</sup> = ${2 ** m} more choices. So ${2 ** m * fact(m - 1)} of the (${N} − 1)! = ${num(total)} equally likely seatings have every couple together, and the probability is ${2 ** m * fact(m - 1)}/${num(total)} = <b>${fr(ans)}</b>.`,
          none: `${incl}<b>${fr(ans)}</b>.`,
          some: `Count the opposite, the seatings where no couple sits together. ${incl}${fr(none)}. So at least one couple sits together with probability 1 − ${fr(none)} = <b>${fr(ans)}</b>.`,
          given: `Start with ${A} and ${B}. Whatever seat ${A} takes, ${B} is equally likely to be in any of the other ${N - 1}, and 2 of them are next to ${A}, so they sit together with probability ${frac(2, N - 1)}. Given that, treat ${A} and ${B} as one block, so ${N - 1} units sit around the table. Of the ${N - 2} units other than ${C}, ${D} is equally likely to be any one, and 2 of them are beside ${C}, so ${C} and ${D} are apart with probability 1 − ${raw(2, N - 2)} = ${frac(N - 4, N - 2)}. The answer is ${frac(2, N - 1)}·${frac(N - 4, N - 2)} = <b>${fr(ans)}</b>.`,
        }[kind],
      };
    },
    // two groups: alternating around the table, or the smaller group with no two side by side
    (d, ctx) => {
      const [[b, g], [X, Y]] = pick(ctx, 'groups', [[[3, 3], [4, 4], [5, 5], [6, 6], [4, 5], [4, 6], [4, 7], [4, 8], [5, 6], [5, 7]], [['boys', 'girls'], ['teachers', 'students'], ['juniors', 'seniors']]]);
      const N = b + g, alt = b === g, all = choose(N - 1, b - (alt ? 1 : 0)), good = alt ? 1 : choose(g, b), ans = cut(good, all);
      const wrongs = alt ? [cut(2, choose(N, b)), cut(1, choose(N, b)), cut(1, 2 ** (N - 1)), cut(b, all), cut(2, all)]
        : [cut(choose(g, b), choose(N, b)), cut(choose(g + 1, b), choose(N, b)), cut(choose(g - 1, b), all), cut(choose(g, b), choose(N - 1, b - 1)), cut(g, N)];
      return {
        topic: 'Round table chances', rank: alt ? 16 : 17,
        text: `${Cap(WORDS[b])} ${X} and ${WORDS[g]} ${Y} sit in random order around a round table with ${N} seats. What is the probability that ${alt ? `${X} and ${Y} alternate all the way around the table` : `no two ${X} sit next to each other`}?`,
        answer: choices(d, ans, wrongs.filter(under1), showFrac),
        check: () => {
          // every set of seats the first group could fill, all equally likely: count those with no two of them side by side
          let hit = 0;
          const sets = subsets(N, b);
          for (const s of sets) if (!((s & ((s << 1) | (s >> (N - 1)))) & (2 ** N - 1))) hit++;
          return hit * ans[1] === sets.length * ans[0] ? '' : `counted ${hit}/${sets.length}, said ${ans.join('/')}`;
        },
        solution: alt
          ? `Fix the seat of one of the ${X}; after that, all that matters is which seats the other ${X} take. The other ${b - 1} ${X} take ${b - 1} of the other ${N - 1} seats, and all C(${N - 1}, ${b - 1}) = ${all} choices of seats are equally likely. The groups alternate for just one of those choices, every second seat counting from the fixed one. So the probability is <b>${fr(ans)}</b>.`
          : `Fix the seat of one of the ${Y}. The other ${N - 1} seats then form a row from the seat on that person’s left around to the seat on the right (the two ends of the row are both beside the fixed seat, not beside each other), and the ${b} ${X} take ${b} of those seats, all C(${N - 1}, ${b}) = ${all} choices equally likely. Along the row, the other ${g - 1} ${Y} leave ${g} gaps (between two of them, or at either end), and no two ${X} are neighbors exactly when the ${X} go into ${b} different gaps, one in each, which can be done in C(${g}, ${b}) = ${good} ways. So the probability is ${ratio(good, all)}<b>${fr(ans)}</b>.`,
      };
    },
  ],

  'Expected maximum': [
    // the largest or smallest of a few dice, or the gap between two: add up P(X ≥ k)
    (d, ctx) => {
      const [kind, s] = pick(ctx, 'dice', [['max2', 'min2', 'max3', 'min3', 'gap'], [4, 6, 8, 10, 12, 20]], (kind, s) => (kind.endsWith('3') ? s <= 10 : true));
      const n = kind.endsWith('3') ? 3 : 2, big2 = kind.startsWith('max'), S = s ** n;
      const low = range(1, s - 1).reduce((t, j) => t + j ** n, 0);   // 1^n + 2^n + ⋯ + (s − 1)^n
      const maxE = cut(s * S - low, S), minE = cut(low + S, S), E = kind === 'gap' ? minus(maxE, minE) : big2 ? maxE : minE;
      const pw = (j) => `${j}<sup>${n}</sup>`, powers = (a, b) => (b - a < 4 ? range(a, b).map(pw).join(' + ') : `${pw(a)} + ${pw(a + 1)} + ⋯ + ${pw(b)}`);
      const dice = s === 6 ? `${Cap(WORDS[n])} ordinary dice are` : `${Cap(WORDS[n])} fair ${s}-sided dice, each numbered 1 to ${s}, are`;
      const which = { max2: 'the larger of the two numbers', min2: 'the smaller of the two numbers', max3: 'the largest of the three numbers', min3: 'the smallest of the three numbers', gap: 'the larger number minus the smaller one' }[kind];
      const mean = [s + 1, 2], cards = kind === 'gap' ? [s + 1, 3] : cut(big2 ? n * (s + 1) : s + 1, n + 1);
      const wrongs = {
        max2: [mean, cards, cut((s + 1) * (2 * s + 1), 3 * s), minus(E, ONE), cut(2 * s, 3)],
        min2: [mean, cards, cut((s + 1) * (s + 2), 3 * s), plus(E, ONE), cut(s, 3)],
        max3: [mean, cards, cut(s * s * s - range(1, s - 1).reduce((t, j) => t + j * j, 0), s * s), minus(E, ONE), cut(3 * s, 4)],
        min3: [mean, cards, cut(range(1, s).reduce((t, j) => t + j * j, 0), s * s), plus(E, ONE), cut(s, 4)],
        gap: [cards, cut(s, 3), cut(s - 1, 2), cut(s - 1, 3), cut(s * s - 1, 6 * s)],
      }[kind];
      // the sum of the first m squares (or cubes), by its formula
      const sq = n === 2 ? 'squares' : 'cubes', formula = (m) => (n === 2 ? `${m}·${m + 1}·${2 * m + 1}/6` : `(${m}·${m + 1}/2)<sup>2</sup>`);
      const tail = `Use the tail-sum trick, which says that a whole number X from 1 to ${s} has E(X) = P(X ≥ 1) + P(X ≥ 2) + ⋯ + P(X ≥ ${s}), since X counts how many of k = 1, 2, …, ${s} satisfy X ≥ k`;
      let sol;
      if (kind === 'gap') {
        sol = `By linearity, the expected gap is E(larger) − E(smaller). ${tail}. The larger is at least k unless both dice show less than k, so P(larger ≥ k) = 1 − ((k − 1)/${s})<sup>2</sup>, and adding these gives E(larger) = ${s} − (${powers(1, s - 1)})/${S} = ${s} − ${num(low)}/${num(S)} = ${fr(maxE)}. The smaller is at least k when both dice are, so P(smaller ≥ k) = ((${s} − k + 1)/${s})<sup>2</sup>, and E(smaller) = (${powers(1, s)})/${S} = ${fr(minE)}. So the expected gap is ${fr(maxE)} − ${fr(minE)} = <b>${fr(E)}</b>.`;
      } else if (big2) {
        sol = `${tail}. Here X is the ${n === 2 ? 'larger' : 'largest'} number, which is less than k only when ${n === 2 ? 'both dice show' : 'all three dice show'} at most k − 1. So P(X ≥ k) = 1 − ((k − 1)/${s})<sup>${n}</sup>. Adding these for k = 1 to ${s} gives E(X) = ${s} − (${powers(1, s - 1)})/${S}${s - 1 <= 4 ? '' : `. The first ${s - 1} ${sq} add up to ${formula(s - 1)} = ${num(low)}, so E(X)`} = ${s} − ${num(low)}/${num(S)} = <b>${fr(E)}</b>.`;
      } else {
        sol = `${tail}. Here X is the ${n === 2 ? 'smaller' : 'smallest'} number, which is at least k exactly when ${n === 2 ? 'both dice show' : 'all three dice show'} k or more. So P(X ≥ k) = ((${s} − k + 1)/${s})<sup>${n}</sup>. Adding these for k = 1 to ${s} gives E(X) = (${powers(1, s)})/${S}${s <= 4 ? '' : `. The first ${s} ${sq} add up to ${formula(s)} = ${num(low + S)}, so E(X)`} = ${ratio(low + S, S)}<b>${fr(E)}</b>.`;
      }
      return {
        topic: 'Expected maximum', rank: n === 3 || kind === 'gap' ? 20 : 19,
        text: `${dice} rolled. What is the expected value of ${which}?${kind === 'max2' || kind === 'min2' ? ' (If the two numbers are equal, that number counts.)' : ''}`,
        answer: choices(d, E, wrongs.filter((w) => Array.isArray(w) && w[0] > 0), showFrac),
        check: () => {
          let total = 0;
          for (let x = 0; x < S; x++) {
            const r = range(0, n - 1).map((i) => (Math.floor(x / s ** i) % s) + 1), hi = Math.max(...r), lo = Math.min(...r);
            total += kind === 'gap' ? hi - lo : big2 ? hi : lo;
          }
          return total * E[1] === S * E[0] ? '' : `counted ${total}/${S}, said ${E.join('/')}`;
        },
        solution: sol,
      };
    },
    // k numbers drawn from 1 to n: the expected smallest, largest, second smallest, or largest minus smallest
    (d, ctx) => {
      const [kind, n, k, place] = pick(ctx, 'cards', [['min', 'max', 'second', 'range'], [9, 10, 11, 13, 14, 15, 17, 19, 20, 23], [2, 3, 4], [0, 1, 2]],
        (kind, n, k) => (kind === 'second' || kind === 'range' ? k >= 3 : true) && (n + 1) % (k + 1) !== 0);
      const who = d.pick(SOLO), g = cut(n - k, k + 1), E = { min: cut(n + 1, k + 1), max: cut(k * (n + 1), k + 1), second: cut(2 * (n + 1), k + 1), range: cut((k - 1) * (n + 1), k + 1) }[kind];
      const [setup, thing, verb] = [
        [`A hat holds ${n} tickets numbered 1 to ${n}. ${who} draws ${k} of them at random, all at once.`, 'number drawn', 'drawn'],
        [`${who} chooses ${k} different whole numbers from 1 to ${n} at random, every set of ${k} being equally likely.`, 'number chosen', 'chosen'],
        [`A deck has ${n} cards numbered 1 to ${n}. ${who} is dealt ${k} of them at random.`, 'card dealt', 'dealt'],
      ][place];
      const ask = { min: `the smallest ${thing}`, max: `the largest ${thing}`, second: `the second smallest ${thing}`, range: `the largest ${thing} minus the smallest` }[kind];
      const wrongs = {
        min: [cut(n, k + 1), cut(n + 1, k), cut(n, k), cut(n + 1, 2), g],
        max: [cut(k * n, k + 1), cut(n * k - 1, k + 1), cut(k * (n + 1), k + 2), cut(n + 1, 2), [n - 1, 1]],
        second: [cut(2 * n, k + 1), plus(cut(n + 1, k + 1), ONE), cut(2 * (n + 1), k), cut(n + 1, 2), cut(n + 1, k + 1)],
        range: [cut((k - 1) * n, k + 1), cut((k - 1) * (n + 1), k), [n - 1, 1], cut(n + 1, 2), minus(cut(k * (n + 1), k + 1), ONE)],
      }[kind];
      const last = {
        min: `The smallest ${thing} is 1 more than the size of the first gap, so its expected value is 1 + ${fr(g)} = <b>${fr(E)}</b>.`,
        max: `The largest ${thing} is ${n} minus the size of the last gap, so its expected value is ${n} − ${fr(g)} = <b>${fr(E)}</b>.`,
        second: `The second smallest ${thing} is 2 more than the first two gaps together, so its expected value is 2 + 2·${fr(g)} = <b>${fr(E)}</b>.`,
        range: `Going from the smallest ${thing} up to the largest, you pass the other ${k - 1} ${verb} numbers and the ${k - 1} gaps between them, so the difference is ${k - 1} plus those gaps, ${k - 1} + ${k - 1}·${fr(g)} = <b>${fr(E)}</b>.`,
      }[kind];
      return {
        topic: 'Expected maximum', rank: kind === 'min' || kind === 'max' ? 20 : 21,
        tip: 'The numbers drawn split the others into gaps, and by symmetry every gap has the same expected size.',
        text: `${setup} What is the expected value of ${ask}?`,
        answer: choices(d, E, wrongs.filter((w) => w[0] > 0), showFrac),
        check: () => {
          let total = 0, count = 0;
          const walk = (from, chosen) => {
            if (chosen.length === k) { count++; total += kind === 'min' ? chosen[0] : kind === 'max' ? chosen[k - 1] : kind === 'second' ? chosen[1] : chosen[k - 1] - chosen[0]; return; }
            for (let x = from; x <= n; x++) walk(x + 1, [...chosen, x]);
          };
          walk(1, []);
          return total * E[1] === count * E[0] ? '' : `counted ${total}/${count}, said ${E.join('/')}`;
        },
        solution: `Line up the numbers 1 to ${n}. The ${k} that are ${verb} split the other ${n - k} into ${k + 1} gaps (before the smallest ${verb} number, between ${verb} neighbors, and after the largest). Every draw matches one list of ${k + 1} gap sizes adding up to ${n - k}, and every such list is equally likely, so by symmetry every gap has the same expected size, ${gcd(n - k, k + 1) === 1 ? fr(g) : `${n - k}/${k + 1} = ${fr(g)}`}. ${last}`,
      };
    },
    // balls dropped into boxes: the expected number of empty boxes, of boxes with one ball, or the fullest box’s load
    (d, ctx) => {
      const [kind, [b, n], place] = pick(ctx, 'boxes', [['empty', 'single', 'largest'], [[3, 3], [3, 4], [4, 2], [4, 3], [4, 4], [5, 2], [5, 3], [6, 2], [4, 5], [5, 4]], [0, 1, 2]],
        (kind, [b, n]) => (kind === 'largest' ? n <= 4 && b + n <= 9 && !(b === 5 && n === 4) : n >= 3));
      const [setup, boxes, box, items, item] = [
        [`${Cap(WORDS[b])} marbles are dropped, one at a time, into ${n} cups. Each marble lands in one of the cups at random, every cup equally likely, independently of the other marbles.`, 'cups', 'cup', 'marbles', 'marble'],
        [`Each of ${b} letters is put into one of ${n} mailboxes, chosen at random, every mailbox equally likely, independently of the other letters.`, 'mailboxes', 'mailbox', 'letters', 'letter'],
        [`Each of ${b} new students joins one of ${n} clubs, chosen at random, every club equally likely, independently of the other students.`, 'clubs', 'club', 'students', 'student'],
      ][place];
      const N = n ** b;
      // every pattern of loads (largest first), with how many of the n^b outcomes give it
      const parts = [];
      const split = (left, most, list) => {
        if (!left) { if (list.length <= n) parts.push(list); return; }
        for (let x = Math.min(left, most); x >= 1; x--) split(left - x, x, [...list, x]);
      };
      split(b, b, []);
      const ways = (list) => {
        const full = [...list, ...Array(n - list.length).fill(0)], same = {};
        for (const x of full) same[x] = (same[x] || 0) + 1;
        return (fact(n) / Object.values(same).reduce((t, c) => t * fact(c), 1)) * (fact(b) / list.reduce((t, x) => t * fact(x), 1));
      };
      let E, wrongs, sol, rank;
      if (kind === 'empty') {
        E = cut((n - 1) ** b, n ** (b - 1));
        wrongs = [cut((n - 1) ** b, n ** b), minus([n, 1], E), cut((n - 1) ** (b - 1), n ** (b - 2)), [Math.max(n - b, 0), 1], cut(n, b + 1)];
        sol = `Use linearity of expectation, adding up, ${box} by ${box}, the chance that it ends up empty. A given ${box} is missed by one ${item} with probability ${frac(n - 1, n)}, and by all ${b} of them with probability (${frac(n - 1, n)})<sup>${b}</sup> = ${frac((n - 1) ** b, N)}. There are ${n} ${boxes}, so the expected number of empty ones is ${n}·${frac((n - 1) ** b, N)} = <b>${fr(E)}</b>.`;
        rank = 19;
      } else if (kind === 'single') {
        E = cut(b * (n - 1) ** (b - 1), n ** (b - 1));
        wrongs = [cut(b * (n - 1) ** (b - 1), N), cut((n - 1) ** (b - 1), n ** (b - 1)), cut(b, n), cut((n - 1) ** b, n ** (b - 1)), cut(b * (n - 1) ** (b - 1), n ** (b - 2))];
        sol = `Use linearity of expectation, adding up, ${box} by ${box}, the chance that it gets exactly one ${item}. For a given ${box}, that ${item} can be any of the ${b} (each lands there with probability ${frac(1, n)}), and the other ${b - 1} must all miss it, so the chance is ${b}·${frac(1, n)}·(${frac(n - 1, n)})<sup>${b - 1}</sup> = ${frac(b * (n - 1) ** (b - 1), N)}. Over all ${n} ${boxes} that gives ${n}·${frac(b * (n - 1) ** (b - 1), N)} = <b>${fr(E)}</b>.`;
        rank = 20;
      } else {
        const byMax = {};
        for (const list of parts) byMax[list[0]] = (byMax[list[0]] || 0) + ways(list);
        const tops = Object.keys(byMax).map(Number).sort((x, y) => y - x), top = tops.reduce((t, m) => t + m * byMax[m], 0);
        E = cut(top, N);
        wrongs = [cut(b, n), [Math.ceil(b / n), 1], cut(parts.reduce((t, l) => t + l[0], 0), parts.length), minus(E, ONE), plus(cut(b, n), ONE)];
        const full = (l) => [...l, ...Array(n - l.length).fill(0)].join(' + '), ex = parts[1], exBoxes = ways(ex) / (fact(b) / ex.reduce((t, x) => t * fact(x), 1));
        sol = `Sort the ${n}<sup>${b}</sup> = ${N} equally likely outcomes by how the ${items} are shared out, ignoring which ${box} is which: ${parts.map((l, i) => `${i === parts.length - 1 ? 'and ' : ''}${full(l)} in ${ways(l)}`).join(', ')}. For example, ${full(ex)} happens in ${exBoxes}·${ways(ex) / exBoxes} = ${ways(ex)} ways, with ${exBoxes} ways to decide which ${box} gets how many and ${ways(ex) / exBoxes} ways to decide which ${items} go where. So the fullest ${box} has ${tops.map((m, i) => `${i && i === tops.length - 1 ? 'and ' : ''}${m} in ${byMax[m]}`).join(', ')} of the outcomes, and the expected number is (${tops.map((m) => `${m}·${byMax[m]}`).join(' + ')})/${N} = ${top}/${N} = <b>${fr(E)}</b>.`;
        rank = b >= 5 || n === 4 ? 22 : 21;
      }
      const ask = { empty: `What is the expected number of ${boxes} that end up empty?`, single: `What is the expected number of ${boxes} that end up with exactly one ${item}?`, largest: `What is the expected number of ${items} in the ${box} that gets the most? (If several tie for the most, that number counts.)` }[kind];
      return {
        topic: 'Expected maximum', rank,
        ...(kind === 'largest' ? { tip: `Sort the equally likely outcomes by how many ${items} land in each ${box}, and weigh each largest load by how many outcomes give it.` } : {}),
        text: `${setup} ${ask}`,
        answer: choices(d, E, wrongs.filter((w) => w[0] > 0), showFrac),
        check: () => {
          let total = 0;
          for (let x = 0; x < N; x++) {
            const load = Array(n).fill(0);
            for (let i = 0, y = x; i < b; i++, y = Math.floor(y / n)) load[y % n]++;
            total += kind === 'empty' ? load.filter((v) => v === 0).length : kind === 'single' ? load.filter((v) => v === 1).length : Math.max(...load);
          }
          return total * E[1] === N * E[0] ? '' : `counted ${total}/${N}, said ${E.join('/')}`;
        },
        solution: sol,
      };
    },
    // records in a random order: the k-th is a record with chance 1/k; and peaks in a row
    (d, ctx) => {
      const [kind, n] = pick(ctx, 'records', [['record', 'see', 'changes', 'peaks'], [4, 5, 6, 7, 8]]);
      const H = range(1, n).reduce((t, j) => plus(t, [1, j]), [0, 1]), E = { record: H, see: H, changes: minus(H, ONE), peaks: cut(n + 1, 3) }[kind];
      const harmonic = (from) => range(from, n).map((j) => (j === 1 ? '1' : frac(1, j))).join(' + ');
      // the same sum over a common denominator, then "p/q = " if it reduces
      const together = (from) => {
        const L = range(1, n).reduce((a, j) => (a * j) / gcd(a, j), 1), parts = range(from, n).map((j) => L / j), top = parts.reduce((a, b) => a + b, 0);
        return `(${parts.join(' + ')})/${L} = ${ratio(top, L)}`;
      };
      const text = {
        record: `The cards numbered 1 to ${n} are shuffled and turned over one at a time. A card is a record if it is higher than every card turned over before it, so the first card is always a record. What is the expected number of records?`,
        see: `${Cap(WORDS[n])} students, all of different heights, stand in a single line in random order, facing a stage at the front. A student can see the stage only if he or she is taller than everyone in front, so the student at the front always can. What is the expected number of students who can see the stage?`,
        changes: `${Cap(WORDS[n])} players, whose scores will all be different, take turns at a game in random order. A screen shows the highest score so far: the first player’s score goes up on it, and after that the screen changes only when a player beats the score showing. What is the expected number of times the screen changes after the first score goes up?`,
        peaks: `${Cap(WORDS[n])} children, all of different heights, stand in a row in random order. A child is a peak if he or she is taller than every child standing right next to him or her (one neighbor for each child at an end, two for the others). What is the expected number of peaks?`,
      }[kind];
      const wrongs = {
        record: [cut(n, 2), minus(H, ONE), cut(n + 1, 3), cut(n + 1, 2), [2, 1]],
        see: [cut(n, 2), minus(H, ONE), cut(n + 1, 3), cut(n + 1, 2), [2, 1]],
        changes: [H, cut(n - 1, 2), cut(n, 2), minus(H, cut(1, n)), ONE],
        peaks: [cut(n, 3), cut(n - 2, 3), cut(n, 2), cut(n + 2, 3), cut(n + 1, 2)],
      }[kind];
      const k = { record: 'card', see: 'student from the front', changes: 'player', peaks: '' }[kind];
      return {
        topic: 'Expected maximum', rank: { record: 21, see: 21, changes: 22, peaks: 20 }[kind],
        text,
        answer: choices(d, E, wrongs, showFrac),
        check: () => {
          let total = 0;
          eachPerm(n, (a) => {
            if (kind === 'peaks') { for (let i = 0; i < n; i++) if ((i === 0 || a[i] > a[i - 1]) && (i === n - 1 || a[i] > a[i + 1])) total++; return; }
            let best = -1;
            for (let i = 0; i < n; i++) if (a[i] > best) { best = a[i]; total++; }
            if (kind === 'changes') total--;
          });
          return total * E[1] === fact(n) * E[0] ? '' : `counted ${total}/${fact(n)}, said ${E.join('/')}`;
        },
        solution: kind === 'peaks'
          ? `Use linearity of expectation, adding up, child by child, the chance of being a peak. A child at an end is a peak when taller than the one neighbor, which happens with probability ${frac(1, 2)}, like a fair coin flip. A child in the middle is a peak when the tallest of the three (the child and both neighbors), and each of the three is equally likely to be tallest, so that happens with probability ${frac(1, 3)}. So the expected number is 2·${frac(1, 2)} + ${n - 2}·${frac(1, 3)} = <b>${fr(E)}</b>.`
          : `Use linearity of expectation, adding up, one by one, the chance that the j-th ${k} ${{ record: 'is a record', see: 'can see the stage', changes: 'changes the screen' }[kind]}. That happens exactly when ${{ record: 'it is the highest of the first j cards', see: 'he or she is the tallest of the first j students', changes: 'that player’s score is the highest of the first j' }[kind]}, and each of the first j is equally likely to be the ${kind === 'see' ? 'tallest' : 'highest'}, so the chance is 1/j. ${kind === 'changes' ? `The first player’s score doesn’t count as a change, so the expected number of changes is ${harmonic(2)} = ${together(2)}<b>${fr(E)}</b>.` : `So the expected number is ${harmonic(1)} = ${together(1)}<b>${fr(E)}</b>.`}`,
      };
    },
  ],

  'Derangements and matching': [
    // how many ways nobody gets their own: plain, with one person’s item given, or with no two swapping
    (d, ctx) => {
      const [kind, n, place] = pick(ctx, 'count', [['none', 'given', 'loops'], [4, 5, 6, 7], [0, 1, 2]]);
      const [A, B] = d.pick(PAIRS), D = DER[n];
      const [setup, own, item, items, people] = [
        [`${Cap(WORDS[n])} friends, ${A} and ${B} among them, each hang a coat on a rack at a party. At the end of the party the ${n} coats are handed back, one to each friend.`, 'his or her own coat', 'coat', 'coats', 'friends'],
        [`${Cap(WORDS[n])} students, ${A} and ${B} among them, each take a quiz. The teacher hands the ${n} quizzes back out for grading, one to each student.`, 'his or her own quiz', 'quiz', 'quizzes', 'students'],
        [`${Cap(WORDS[n])} friends, ${A} and ${B} among them, each bring a book to a book swap. The ${n} books are handed out again, one to each friend.`, 'the book he or she brought', 'book', 'books', 'friends'],
      ][place];
      const ask = { none: `nobody get ${own}`, given: `nobody get ${own}, with ${A} getting ${B}’s ${item}`, loops: `nobody get ${own}, with no two ${people} getting each other’s ${items}` }[kind];
      const loops = { 4: [[[4], 6]], 5: [[[5], 24]], 6: [[[6], 120], [[3, 3], 40]], 7: [[[7], 720], [[3, 4], 420]] }[n];
      const ans = { none: D, given: D / (n - 1), loops: loops.reduce((t, [, c]) => t + c, 0) }[kind];
      const ie = range(0, n).map((j) => (j ? `${j % 2 ? '−' : '+'} ${num(fact(n) / fact(j))}` : num(fact(n)))).join(' ');
      const count = `Count all ${n}! = ${num(fact(n))} ways and use inclusion–exclusion on the ${people} who get their own ${item}. If j particular ${people} all get their own ${item}, the rest can be handed out in (${n} − j)! ways, and those j can be chosen in C(${n}, j) ways, which makes C(${n}, j)·(${n} − j)! = ${n}!/j!. So nobody gets their own ${item} in ${n}! − ${n}!/1! + ${n}!/2! − ⋯ = ${ie} = `;
      const wrongs = {
        none: [fact(n) / 2, fact(n - 1), fact(n) - D, (n - 1) * DER[n - 1], D - 2 * (n % 2 ? -1 : 1)],
        given: [D, DER[n - 1], DER[n - 2], fact(n - 2), D / n, fact(n - 1) / (n - 1)],
        loops: [D, fact(n - 1), D - choose(n, 2) * DER[n - 2], n === 6 ? 200 : ans + fact(n - 2), ans - fact(n - 2)],
      }[kind];
      return {
        topic: 'Derangements and matching', rank: { none: 17, given: 19, loops: n >= 6 ? 21 : 20 }[kind],
        text: `${setup} In how many of the ${n}! ways of handing them out does ${ask}?`,
        answer: choices(d, ans, wrongs.filter((w) => Number.isInteger(w) && w > 0)),
        check: () => {
          let c = 0;
          eachPerm(n, (a) => {
            // a[i] = whose item person i gets; person 0 is the first named, person 1 the second
            if (a.some((x, i) => x === i)) return;
            if (kind === 'given' && a[0] !== 1) return;
            if (kind === 'loops' && a.some((x, i) => a[x] === i)) return;
            c++;
          });
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        solution: {
          none: `${count}<b>${num(ans)}</b> ways.`,
          given: `${count}${num(D)} ways. Now use symmetry, since swapping the names of two of the other ${people} swaps which of their ${items} ${A} gets and changes nothing else, so ${A} gets each of the other ${n - 1} ${people}’ ${items} equally often. So ${A} gets ${B}’s ${item} in ${num(D)}/${n - 1} = <b>${num(ans)}</b> of them.`,
          loops: `Follow the ${items}. ${A} has someone’s ${item}, that person has someone else’s, and so on until it comes back to ${A}, so the ${people} split into loops. Nobody having their own ${item} means no loop of 1, and no two having each other’s means no loop of 2, so every loop has at least 3 ${people}. The ${people} in a loop of k can go round it in (k − 1)! ways (start from any one of them). ${n === 6 ? `For 6 ${people}, that means one loop of 6, in 5! = 120 ways, or two loops of 3, with C(6, 3)/2 = 10 ways to split them up (halved, since the two loops are alike) times 2·2 for going round each, 40 ways. In all, 120 + 40 = ` : n === 7 ? `For 7 ${people}, that means one loop of 7, in 6! = 720 ways, or a loop of 3 and a loop of 4, with C(7, 3) = 35 ways to choose the 3 times 2!·3! = 12 for going round, 420 ways. In all, 720 + 420 = ` : `For ${n} ${people} that leaves only one loop of all ${n}, which can be done in (${n} − 1)! = `}<b>${num(ans)}</b> ways.`,
        }[kind],
      };
    },
    // the chance that exactly k get their own back: choose them, then nobody else does
    (d, ctx) => {
      const [[n, k], place] = pick(ctx, 'exactly', [[[4, 1], [5, 1], [5, 3], [6, 1], [6, 2], [6, 3], [7, 1], [7, 2], [7, 3], [6, 4]], [0, 1, 2]]);
      const who = d.pick(SOLO), m = n - k, top = choose(n, k) * DER[m], ans = cut(top, fact(n));
      const [setup, things, one, many] = [
        [`At a graduation, ${n} students throw their caps into the air, and each picks up one of the ${n} caps at random.`, 'students', 'picks up his or her own cap', 'pick up their own caps'],
        [`${who} writes ${n} letters and addresses ${n} envelopes, one for each letter, then puts the letters into the envelopes at random, one per envelope.`, 'letters', 'goes into its own envelope', 'go into their own envelopes'],
        [`A coat check mixes up its tickets and returns the ${n} coats to their ${n} owners at random, one coat each.`, 'owners', 'gets his or her own coat', 'get their own coats'],
      ][place];
      const derText = m === 2 ? 'just 1 way (they swap)' : m === 3 ? '2 ways (passing along a loop of three, one way round or the other)'
        : `${m}! − ${m}!/1! + ${m}!/2! − ⋯ = ${range(0, m).map((j) => (j ? `${j % 2 ? '−' : '+'} ${num(fact(m) / fact(j))}` : num(fact(m)))).join(' ')} = ${DER[m]} ways, by inclusion–exclusion`;
      return {
        topic: 'Derangements and matching', rank: k === 1 ? 18 : 19,
        text: `${setup} What is the probability that exactly ${WORDS[k]} of the ${things} ${k === 1 ? one : many}?`,
        answer: choices(d, ans, [cut(choose(n, k), fact(n)), cut(1, fact(k)), cut(choose(n, k) * (n - 1) ** m, n ** n), cut(DER[m], fact(n)), cut(DER[m], fact(m))].filter(under1), showFrac),
        check: () => {
          let hit = 0;
          eachPerm(n, (a) => { if (a.filter((x, i) => x === i).length === k) hit++; });
          return hit * ans[1] === fact(n) * ans[0] ? '' : `counted ${hit}/${fact(n)}, said ${ans.join('/')}`;
        },
        solution: `First choose which ${k === 1 ? 'one gets' : `${WORDS[k]} get`} it right, in C(${n}, ${k}) = ${choose(n, k)} ways. The other ${m} must all be wrong, which can happen in ${derText}. So ${choose(n, k)}·${DER[m]} = ${top} of the ${n}! = ${fact(n)} equally likely ways work, and the probability is ${top}/${fact(n)} = <b>${fr(ans)}</b>.`,
      };
    },
    // a gift swap: nobody draws their own name; or, redrawn until that’s so, two who drew each other, or one loop through all
    (d, ctx) => {
      const [kind, n] = pick(ctx, 'swap', [['nobody', 'pair', 'loop'], [4, 5, 6, 7]]);
      const [A, B] = d.pick(PAIRS), D = DER[n], F = fact(n);
      const ans = { nobody: cut(D, F), pair: cut(DER[n - 2], D), loop: cut(fact(n - 1), D) }[kind];
      const ie = `${range(0, n).map((j) => (j ? `${j % 2 ? '−' : '+'} ${num(F / fact(j))}` : num(F))).join(' ')} = ${num(D)}`;
      const base = `${Cap(WORDS[n])} friends, ${A} and ${B} among them, put their names in a hat for a gift swap, and each draws one name at random, to give that person a gift.`;
      const redraw = 'If anyone draws his or her own name, all the names go back in and everyone draws again, until nobody has drawn his or her own name.';
      const text = {
        nobody: `${base} What is the probability that nobody draws his or her own name?`,
        pair: `${base} ${redraw} In the final draw, what is the probability that ${A} and ${B} drew each other’s names?`,
        loop: `${base} ${redraw} The gifts are then given in a chain: ${A} gives first, then whoever ${A} drew gives, and so on. What is the probability that every friend gives a gift before the chain comes back to ${A}?`,
      }[kind];
      const count = `By inclusion–exclusion (if j particular friends draw their own names, the others can draw in (${n} − j)! ways, and the j can be chosen in C(${n}, j) ways), the draws where nobody has their own name number ${n}! − ${n}!/1! + ${n}!/2! − ⋯ = ${ie}`;
      const wrongs = {
        nobody: [minus(ONE, ans), cut((n - 1) ** n, n ** n), cut(n - 1, n), [1, 2], cut(D + 1, F), cut(fact(n - 1), F)],
        pair: [cut(1, (n - 1) ** 2), cut(1, choose(n, 2)), cut(DER[n - 2], F), cut(1, n - 1), cut(fact(n - 2), D)],
        loop: [cut(1, n), cut(1, n - 1), cut(fact(n - 1), F), cut(fact(n - 2), D), cut(D - fact(n - 1), D)],
      }[kind];
      return {
        topic: 'Derangements and matching', rank: kind === 'nobody' ? 18 : 20,
        text,
        answer: choices(d, ans, wrongs.filter(under1), showFrac),
        check: () => {
          let good = 0, all = 0;
          eachPerm(n, (a) => {
            // a[i] = whose name friend i drew (friends 0 and 1 are the two named)
            const clean = a.every((x, i) => x !== i);
            if (kind === 'nobody') { all++; if (clean) good++; return; }
            if (!clean) return;
            all++;
            if (kind === 'pair' && a[0] === 1 && a[1] === 0) good++;
            if (kind === 'loop') { let len = 1; for (let x = a[0]; x !== 0 && len <= n; x = a[x]) len++; if (len === n) good++; }
          });
          return good * ans[1] === all * ans[0] ? '' : `counted ${good}/${all}, said ${ans.join('/')}`;
        },
        solution: {
          nobody: `There are ${n}! = ${num(F)} equally likely draws. ${count}. So the probability is ${num(D)}/${num(F)} = <b>${fr(ans)}</b>.`,
          pair: `Drawing again until nobody has their own name makes each of the draws where nobody does equally likely, so only those count. ${count}. If ${A} and ${B} drew each other, the other ${n - 2} must also have drawn among themselves with nobody drawing their own name, which can happen in ${DER[n - 2]} way${DER[n - 2] === 1 ? '' : 's'}. So the probability is ${ratio(DER[n - 2], D)}<b>${fr(ans)}</b>.`,
          loop: `Drawing again until nobody has their own name makes each of the draws where nobody does equally likely, so only those count. ${count}. The chain reaches everyone when the draws make one loop through all ${n} friends, and after ${A} the other ${n - 1} can follow in any order, (${n} − 1)! = ${fact(n - 1)} ways, and in each of these nobody has drawn their own name. So the probability is ${ratio(fact(n - 1), D)}<b>${fr(ans)}</b>.`,
        }[kind],
      };
    },
    // at least one or at least two back where they belong, and the expected number, given at least one
    (d, ctx) => {
      const [kind, n, place] = pick(ctx, 'least', [['one', 'two', 'expect'], [4, 5, 6, 7], [0, 1]]);
      const who = d.pick(SOLO), D = DER[n], F = fact(n), D1 = n * DER[n - 1];
      const ans = { one: cut(F - D, F), two: cut(F - D - D1, F), expect: cut(F, F - D) }[kind];
      const [setup, things, inOwn] = [
        [`${who} puts ${n} letters into ${n} addressed envelopes at random, one letter in each.`, 'letters', 'in its own envelope'],
        [`The ${n} keys of ${n} lockers get mixed up, and the caretaker puts them back at random, one key in each locker.`, 'keys', 'in its own locker'],
      ][place];
      const [plural, own] = [things, inOwn.replace('its own', 'their own').replace('envelope', 'envelopes').replace('locker', 'lockers')];
      const ie = `${range(0, n).map((j) => (j ? `${j % 2 ? '−' : '+'} ${num(F / fact(j))}` : num(F))).join(' ')} = ${num(D)}`;
      const none = `By inclusion–exclusion (with j particular ${things} ${own} in (${n} − j)! ways, and C(${n}, j) ways to choose them), the ways with no ${things.slice(0, -1)} ${inOwn} number ${n}! − ${n}!/1! + ${n}!/2! − ⋯ = ${ie}`;
      const text = {
        one: `What is the probability that at least one ${things.slice(0, -1)} ends up ${inOwn}?`,
        two: `What is the probability that at least two ${plural} end up ${own}?`,
        expect: `Given that at least one ${things.slice(0, -1)} ends up ${inOwn}, what is the expected number of ${plural} that end up ${own}?`,
      }[kind];
      const wrongs = {
        one: [cut(D, F), cut(n ** n - (n - 1) ** n, n ** n), [1, 2], cut(n - 1, n), cut(F - D - D1, F)],
        two: [cut(F - D, F), cut(F - D - DER[n - 1], F), [1, 2], cut(D1, F), cut(F - D1, F)],
        expect: [ONE, [2, 1], plus(ONE, cut(D, F)), cut(F - D, F), cut(n, n - 1)],
      }[kind];
      return {
        topic: 'Derangements and matching', rank: { one: 17, two: 19, expect: 21 }[kind],
        text: `${setup} ${text}`,
        answer: choices(d, ans, wrongs.filter(kind === 'expect' ? (w) => w[0] > 0 : under1), showFrac),
        check: () => {
          let good = 0, all = 0, matches = 0;
          eachPerm(n, (a) => {
            const fixed = a.filter((x, i) => x === i).length;
            if (kind === 'expect') { if (fixed) { all++; matches += fixed; } return; }
            all++;
            if (fixed >= (kind === 'one' ? 1 : 2)) good++;
          });
          if (kind === 'expect') good = matches;
          return good * ans[1] === all * ans[0] ? '' : `counted ${good}/${all}, said ${ans.join('/')}`;
        },
        solution: {
          one: `Count the opposite, the ways with no ${things.slice(0, -1)} ${inOwn}. ${none}. So at least one is ${inOwn} with probability 1 − ${num(D)}/${num(F)} = <b>${fr(ans)}</b>.`,
          two: `Count the opposite, the ways with none ${own} or exactly one. ${none}. For exactly one, choose it (${n} ways), and then the other ${n - 1} must all be wrong, in ${DER[n - 1]} ways, so ${n}·${DER[n - 1]} = ${num(D1)} ways. So at least two are ${own} with probability 1 − (${num(D)} + ${num(D1)})/${num(F)} = <b>${fr(ans)}</b>.`,
          expect: `Use linearity of expectation over all ${n}! = ${num(F)} equally likely ways: each ${things.slice(0, -1)} is ${inOwn} with probability ${frac(1, n)}, so the expected number is ${n}·${frac(1, n)} = 1, and the matches added up over all the ways come to ${num(F)}·1 = ${num(F)}. The ways with no match add nothing to that total. ${none}, so ${num(F)} − ${num(D)} = ${num(F - D)} ways have at least one match, and between them they have all ${num(F)} matches. So the expected number, given at least one, is ${num(F)}/${num(F - D)} = <b>${fr(ans)}</b>.`,
        }[kind],
      };
    },
  ],

  'Guess or leave blank': [
    // the AMC’s scoring: what guessing is worth after ruling choices out, for one plan or the best one
    (d, ctx) => {
      // the three kinds take turns, each walking through its own combinations
      const kind = ['gain', 'plan', 'best'][ctx.k % 3], sub = { ...ctx, k: Math.floor(ctx.k / 3) };
      let s = 0, x0 = 0, x1 = 0, x2 = 0, x3 = 0, e = 0, g = 0;
      if (kind === 'gain') [x1, x2, x3] = pick(sub, 'gain', [[2, 3, 4, 5], [2, 3, 4, 5, 6], [1, 2, 3, 4]]);
      else if (kind === 'plan') [s, e, g] = pick(sub, 'plan', [[8, 10, 12, 14, 16], [0, 1, 2, 3], [3, 4, 5, 6, 8]]);
      else {
        [s, x0, x1, x2] = pick(sub, 'best', [[10, 12, 14], [2, 3, 4, 5, 6], [1, 2, 3, 4], [2, 3, 4, 5]], (s, a, b, c) => 25 - s - a - b - c >= 1 && 25 - s - a - b - c <= 5);
        x3 = 25 - s - x0 - x1 - x2;
      }
      const who = d.pick(SOLO), rest = 25 - s, score = (e) => 6 / (5 - e);   // expected points for a guess with e choices ruled out
      const amc = 'On the AMC 10, each question has five choices; a right answer earns 6 points, a question left blank earns 1.5, and a wrong answer earns 0.';
      let ans, wrongs, text, sol, rank;
      if (kind === 'gain') {
        ans = 0.5 * x2 + 1.5 * x3;
        wrongs = [1.5 * x1 + 2 * x2 + 3 * x3, 0.3 * x1 + 0.8 * x2 + 1.8 * x3, 0.5 * (x2 + x3), 1.5 * (x2 + x3), ans + 0.5 * x1];
        text = `${amc} ${who} has ${x1 + x2 + x3} questions left. On ${x1} of them ${who} can rule out exactly one choice as wrong, on ${x2} exactly two, and on ${x3} exactly three. If ${who} guesses at random among the choices not ruled out on all ${x1 + x2 + x3} of these questions, instead of leaving them blank, how many more points can ${who} expect to score?`;
        sol = `Compare each kind of question with the 1.5 points of a blank. With e choices ruled out, 5 − e are left, so a guess is right with probability 1/(5 − e) and is worth 6/(5 − e) points on average. Ruling out one leaves 4 choices, worth 6/4 = 1.5, exactly a blank, so those ${x1} questions gain nothing. Ruling out two is worth 6/3 = 2, a gain of 0.5 each, and ruling out three is worth 6/2 = 3, a gain of 1.5 each. In all, ${x2}·0.5 + ${x3}·1.5 = <b>${num(ans)}</b>.`;
        rank = 9;
      } else if (kind === 'plan') {
        const blank = rest - g;
        ans = 6 * s + g * score(e) + 1.5 * blank;
        wrongs = [6 * s + g * score(e), 6 * s + g * 1.2 + 1.5 * blank, 6 * s + 1.5 * rest, 6 * s + (6 * g * (e + 1)) / 5 + 1.5 * blank, 6 * (s + g) + 1.5 * blank];
        text = `${amc} ${who} answers ${s} questions and is sure of them, and they are all right. On ${g} other questions ${who} ${e ? `can rule out ${WORDS[e]} of the five choices as wrong, and guesses at random among the other ${WORDS[5 - e]}` : 'has no idea at all, and guesses at random among all five choices'}. ${who} leaves the remaining ${blank} questions blank. What is ${who}’s expected score?`;
        sol = `Add up the expected points question by question, since expectation adds. The ${s} sure answers give 6·${s} = ${6 * s}. A guess among ${5 - e} choices is right with probability 1/${5 - e}, so it is worth 6/${5 - e} = ${num(score(e))} points on average, and the ${g} guesses give ${g}·${num(score(e))} = ${num(g * score(e))}. The ${blank} blanks give 1.5·${blank} = ${num(1.5 * blank)}. In all, ${6 * s} + ${num(g * score(e))} + ${num(1.5 * blank)} = <b>${num(ans)}</b>.`;
        rank = 10;
      } else {
        ans = 6 * s + 1.5 * x0 + 1.5 * x1 + 2 * x2 + 3 * x3;
        wrongs = [6 * s + 1.2 * x0 + 1.5 * x1 + 2 * x2 + 3 * x3, 6 * s + 1.5 * (rest), 6 * s + 1.5 * (x0 + x1 + x2) + 3 * x3, 6 * s + 2 * x2 + 3 * x3, 6 * s + 1.5 * x0 + 1.2 * x1 + 2 * x2 + 3 * x3];
        text = `${amc} ${who} answers ${s} questions and is sure of them, and they are all right. Of the other ${rest}, ${who} has no idea on ${x0}, can rule out exactly one choice as wrong on ${x1}, exactly two on ${x2}, and exactly three on ${x3}. On each of these ${rest}, ${who} either guesses at random among the choices not ruled out or leaves it blank. What is the largest expected score ${who} can get?`;
        sol = `Decide question by question, since expected points add up. A guess with e choices ruled out is right with probability 1/(5 − e), so it is worth 6/(5 − e) points on average, against 1.5 for a blank. That gives 6/5 = 1.2 with nothing ruled out (worse than a blank), 6/4 = 1.5 with one ruled out (a tie), 2 with two and 3 with three (both better). So leave blank the ${x0} with nothing ruled out, take 1.5 either way on the ${x1} with one ruled out, and guess on the other ${x2 + x3}. The best expected score is 6·${s} + 1.5·${x0 + x1} + 2·${x2} + 3·${x3} = <b>${num(ans)}</b>.`;
        rank = 11;
      }
      return {
        topic: 'Guess or leave blank', rank,
        text,
        answer: choices(d, ans, wrongs),
        check: () => {
          // the whole spread of how many guesses come out right, built one question at a time, then the expected score
          const expect = (list) => {
            let dist = [1];
            for (const e of list) {
              const next = Array(dist.length + 1).fill(0);
              dist.forEach((p, r) => { next[r + 1] += p / (5 - e); next[r] += (p * (4 - e)) / (5 - e); });
              dist = next;
            }
            return dist.reduce((t, p, r) => t + 6 * r * p, 0);
          };
          const many = (x, e) => Array(x).fill(e);
          let got = -Infinity;
          if (kind === 'gain') got = expect([...many(x1, 1), ...many(x2, 2), ...many(x3, 3)]) - 1.5 * (x1 + x2 + x3);
          else if (kind === 'plan') got = 6 * s + expect(many(g, e)) + 1.5 * (rest - g);
          else {
            // try guessing or not on each kind of question: all 16 plans
            for (let plan = 0; plan < 16; plan++) {
              const xs = [x0, x1, x2, x3], guessed = xs.flatMap((x, k) => ((plan >> k) & 1 ? many(x, k) : []));
              got = Math.max(got, 6 * s + expect(guessed) + 1.5 * xs.reduce((t, x, k) => t + ((plan >> k) & 1 ? 0 : x), 0));
            }
          }
          return Math.abs(got - ans) < 1e-9 ? '' : `worked out ${got}, said ${ans}`;
        },
        solution: sol,
      };
    },
    // a different scoring rule: how many choices must be ruled out before a guess beats a blank
    (d, ctx) => {
      const [[R, B, W], who] = pick(ctx, 'rule', [[[6, 2, 0], [5, 2, 0], [4, 1, 0], [7, 2, 0], [5, 1.5, 0], [6, 1, 0], [5, 0, -1], [4, 0, -1], [3, 0, -1], [5, 1, -1], [6, 2, -1], [8, 2, -2], [10, 3, -2], [6, 1.5, -1], [8, 1, -1], [9, 3, -1]], SOLO.slice(0, 3)]);
      // twice the expected points of a guess with e of the 5 choices ruled out, as a fraction [top, bottom]
      const guess = (e) => cut(2 * R + 2 * W * (4 - e), 2 * (5 - e)), beats = (e) => 2 * R + 2 * W * (4 - e) > 2 * B * (5 - e);
      const ans = [0, 1, 2, 3, 4].find(beats), val = (v) => ([1, 2, 4, 5].includes(v[1]) ? num(v[0] / v[1], 2) : fr(v));
      const wrongText = W ? `loses ${-W} point${W === -1 ? '' : 's'}` : 'earns 0';
      const lines = range(0, ans).map((e) => `with ${e} ruled out, ${e === 4 ? 'the answer is certain' : `a guess is right with probability ${frac(1, 5 - e)}`} and is worth ${!W && gcd(R, 5 - e) === 1 && 5 - e === 3 ? fr(guess(e)) : `${W ? `(${R} − ${-W}·${4 - e})` : R}/${5 - e} = ${val(guess(e))}`} on average, ${beats(e) ? 'more than' : 2 * R + 2 * W * (4 - e) === 2 * B * (5 - e) ? 'only equal to' : 'less than'} ${num(B)}`);
      return {
        topic: 'Guess or leave blank', rank: W ? 11 : 10,
        text: `In a math contest, each question has five choices, exactly one of them right. A right answer earns ${R} points, a question left blank earns ${num(B)}, and a wrong answer ${wrongText}. ${who} will guess at random among the choices not ruled out as wrong. What is the smallest number of wrong choices ${who} must rule out for a guess to have a higher expected score than leaving the question blank?`,
        answer: choices(d, ans, [0, 1, 2, 3, 4]),
        check: () => {
          // every way the guess can go, for each number ruled out: the first that beats a blank
          const first = [0, 1, 2, 3, 4].find((e) => { let t = 0; for (let c = 0; c < 5 - e; c++) t += c === 0 ? R : W; return t > B * (5 - e) + 1e-9; });
          return first === ans ? '' : `found ${first}, said ${ans}`;
        },
        solution: `If ${who} rules out e choices, 5 − e are left, so a guess is right with probability 1/(5 − e) and wrong otherwise. Its expected score is ${W ? `(${R} − ${-W}·(4 − e))` : R}/(5 − e), to be compared with ${num(B)} for a blank, so try e = 0, 1, 2, … in turn. ${lines.map(Cap).join('. ')}. So the smallest number is <b>${ans}</b>.`,
      };
    },
    // the scores behind a total: how many ways, the fewest right, the most wrong
    (d, ctx) => {
      const [kind, S] = pick(ctx, 'score', [['count', 'fewest', 'wrong'], [63, 72, 78, 84, 90, 93, 100.5, 105, 108, 112.5, 117, 120]]);
      const who = d.pick(SOLO), T = Math.round((2 * S) / 3), lo = Math.max(0, Math.ceil((T - 25) / 3)), hi = Math.floor(T / 4);
      const rows = range(lo, hi).map((r) => [r, T - 4 * r, 25 - r - (T - 4 * r)]);
      const ans = { count: rows.length, fewest: lo, wrong: rows.at(-1)[2] }[kind];
      const wrongs = {
        count: [hi + 1, rows.length - 1, rows.length + 1, rows.length + 2, 2 * rows.length],
        fewest: [lo - 1, lo + 1, Math.ceil(S / 6), hi, lo + 2],
        wrong: [rows[0][2], 25 - Math.ceil(S / 6), ans - 3, ans + 1, ans - 1],
      }[kind].filter((v) => Number.isInteger(v) && v >= 0 && v <= 25);
      return {
        topic: 'Guess or leave blank', rank: kind === 'wrong' ? 13 : 12,
        tip: 'Write the score as 6r + 1.5b, with r right and b blank and r + b at most 25, and list the whole numbers that fit.',
        text: `The AMC 10 has 25 questions; each right answer earns 6 points, each question left blank 1.5, and each wrong answer 0. ${who} scored ${num(S)}. ${{ count: `How many different possibilities are there for the numbers of questions ${who} got right, left blank and got wrong?`, fewest: `What is the fewest questions ${who} could have answered correctly?`, wrong: `What is the largest number of questions ${who} could have answered wrong?` }[kind]}`,
        answer: choices(d, ans, wrongs),
        check: () => {
          // every split of the 25 questions into right, blank and wrong (in half points)
          const found = [];
          for (let r = 0; r <= 25; r++) for (let b = 0; r + b <= 25; b++) if (12 * r + 3 * b === 2 * S) found.push([r, b, 25 - r - b]);
          const got = kind === 'count' ? found.length : kind === 'fewest' ? Math.min(...found.map((f) => f[0])) : Math.max(...found.map((f) => f[2]));
          return got === ans ? '' : `found ${got}, said ${ans}`;
        },
        solution: `Let r be the number right and b the number blank. Then 6r + 1.5b = ${num(S)}, and dividing by 1.5 gives 4r + b = ${T}, so b = ${T} − 4r. The blanks can’t be negative, so 4r ≤ ${T} and r ≤ ${hi}; and r + b = ${T} − 3r can’t be more than 25, so 3r ≥ ${T - 25} and r ≥ ${lo}. That leaves ${rows.map(([r, b, w]) => `${r} right, ${b} blank and ${w} wrong`).join('; ')}. ${{ count: `That is <b>${ans}</b> possibilities.`, fewest: `The fewest right is <b>${ans}</b>.`, wrong: `Each extra right answer takes away 4 blanks and adds 3 wrong answers, so the most wrong answers come with the most right ones, ${rows.at(-1)[0]} right, ${rows.at(-1)[1]} blank and <b>${ans}</b> wrong.` }[kind]}`,
      };
    },
    // the chance that guessing on several questions beats leaving them all blank
    (d, ctx) => {
      const [n, c, strict] = pick(ctx, 'beat', [[3, 4, 5, 6], [2, 3, 4, 5], [true, false]], (n, c, strict) => (strict || n === 4) && (c < 5 || n <= 4));
      const who = d.pick(SOLO), blank = 1.5 * n, t = range(0, n).find((r) => (strict ? 12 * r > 3 * n : 12 * r >= 3 * n));
      const all = c ** n, P = (r) => choose(n, r) * (c - 1) ** (n - r), atLeast = (k) => cut(range(k, n).reduce((s, r) => s + P(r), 0), all);
      const ans = atLeast(t), below = range(0, t - 1);
      return {
        topic: 'Guess or leave blank', rank: t >= 2 ? 14 : 13,
        tip: 'Find how many right answers it takes to beat the blank score, then count the opposite, too few right.',
        text: `On the AMC 10, a right answer earns 6 points, a question left blank 1.5, and a wrong answer 0. ${who} has ${n} questions left and, on each of them, ${c === 5 ? 'has no idea, so all five choices are left' : `can rule out exactly ${WORDS[5 - c]} of the five choices, leaving ${WORDS[c]}`}. Leaving all ${n} blank would earn ${num(blank)} points. If ${who} instead guesses at random among the choices left on all ${n}, what is the probability of earning ${strict ? 'more than' : 'at least'} ${num(blank)} points on them?`,
        answer: choices(d, ans, [t > 1 ? atLeast(t - 1) : atLeast(t + 1), atLeast(t + 1), cut(P(t), all), [1, 2], minus(ONE, ans), atLeast(1)].filter(under1), showFrac),
        check: () => {
          // every way the n guesses can land (choice 0 is the right one)
          let good = 0;
          for (let x = 0; x < all; x++) { let right = 0; for (let i = 0, y = x; i < n; i++, y = Math.floor(y / c)) if (y % c === 0) right++; if (strict ? 12 * right > 3 * n : 12 * right >= 3 * n) good++; }
          return good * ans[1] === all * ans[0] ? '' : `counted ${good}/${all}, said ${ans.join('/')}`;
        },
        solution: `Guessing on all ${n} earns 6 points for each one right, so ${who} needs 6·(number right) ${strict ? '>' : '≥'} ${num(blank)}, which means at least ${t} right. Each guess is right with probability ${frac(1, c)}, independently. ${t === 1 ? `Count the opposite, no right answers at all, which has probability (${frac(c - 1, c)})<sup>${n}</sup> = ${raw(P(0), all)}` : `Count the opposite, fewer than ${t} right, where ${below.map((r) => `${r} right has probability ${r ? `${choose(n, r) > 1 ? `${choose(n, r)}·` : ''}${frac(1, c)}${r > 1 ? `<sup>${r}</sup>` : ''}·` : ''}(${frac(c - 1, c)})<sup>${n - r}</sup> = ${raw(P(r), all)}`).join(', and ')}`}. So the probability is 1 − ${below.map((r) => raw(P(r), all)).join(' − ')} = ${gcd(ans[0] * all / ans[1], all) > 1 ? `${raw(ans[0] * all / ans[1], all)} = ` : ''}<b>${fr(ans)}</b>.`,
      };
    },
  ],
};
