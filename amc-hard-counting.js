// Harder counting for the AMC 10 practice (ranks 2 to 14): six topics modelled on ideas from recent contests, with
// new numbers and wording: counting with a recursion, stars and bars, lattice points in a diamond, coloring a ring,
// the pigeonhole principle and binomial coefficients. Each topic asks its idea four ways (another unknown, the
// question turned around, another setting), and check() gets every answer again another way: by listing every string,
// tiling, tuple, point or painting one by one, by playing out the worst case, or with exact BigInt expansions.
import { combo, num, frac, gcd, choose } from '../kit/bank.js';
import { choices, surd, showFrac, range } from './amc-kit.js';

// ---------- small helpers ----------
// combo, with a name of its own for each kind of question, so no two kinds share a list of combinations
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
// a type with several kinds of question shows them in turn (starting from a kind that depends on where the topic sits
// in the bank), and walks each kind’s own combinations: pickKind(ctx, tag, kinds, lists, ok) gives [kind, …values]
function pickKind(ctx, tag, kinds, lists, ok = () => true) {
  let h = 0;
  for (const ch of ctx.salt) h = (h * 31 + ch.charCodeAt(0)) % 1000003;
  const kind = kinds[(ctx.k + h) % kinds.length], inner = { ...ctx, k: Math.floor(ctx.k / kinds.length) };
  return [kind, ...pick(inner, `${tag}-${kind}`, lists, (...v) => ok(kind, ...v))];
}
const NAMES = ['Mira', 'Tomas', 'Priya', 'Kofi', 'Lena', 'Mateo', 'Yuki', 'Sami', 'Iris', 'Bruno', 'Dalia', 'Felix', 'Nora', 'Oskar', 'Rhea', 'Zane'];
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen'];
const Cap = (s) => s[0].toUpperCase() + s.slice(1);
const listing = (xs) => (xs.length < 2 ? String(xs[0]) : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const shownList = (xs) => xs.map((v) => num(v)).join(', ');
const total = (xs) => xs.reduce((s, v) => s + v, 0);
// a sequence from its first values and a rule for the next one: a[0] … a[n]
const grow = (start, next, n) => { const a = start.slice(); for (let m = a.length; m <= n; m++) a.push(next(a, m)); return a; };
const fib = (n) => { let a = 0, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; };
// every string of length n over the letters 0 … k − 1, handed to f (one array, changed in place)
function eachString(k, n, f) {
  const s = Array(n).fill(0);
  for (;;) {
    f(s);
    let i = n - 1;
    while (i >= 0 && s[i] === k - 1) s[i--] = 0;
    if (i < 0) return;
    s[i]++;
  }
}

// how many tuples x with lo[i] ≤ x[i] ≤ hi[i] add up to sum, by going through every tuple in that box
function countTuples(lo, hi, sum) {
  let c = 0;
  const go = (i, left) => {
    if (i === lo.length) { if (left === 0) c++; return; }
    for (let v = lo[i]; v <= hi[i]; v++) go(i + 1, left - v);
  };
  go(0, sum);
  return c;
}
// stars and bars with upper limits caps[i]: out[j] adds up C(S − (the j chosen caps + 1 each) + k − 1, k − 1) over every
// choice of j variables, the ways with those j over their limits (inclusion and exclusion takes them away and adds back)
function overCaps(caps, S) {
  const k = caps.length, out = Array(k + 1).fill(0);
  for (let mask = 0; mask < 1 << k; mask++) {
    const over = range(0, k - 1).filter((i) => (mask >> i) & 1), left = S - total(over.map((i) => caps[i] + 1));
    if (left >= 0) out[over.length] += choose(left + k - 1, k - 1);
  }
  while (out.length > 1 && !out.at(-1)) out.pop();
  return out;
}
const alternate = (terms) => total(terms.map((t, j) => (j % 2 ? -t : t)));
// lattice points: |x| + |y| ≤ r (a flat diamond), |x| + |y| + |z| = j (a hollow one) and |x| + |y| + |z| ≤ r (a solid one)
const disk = (r) => 2 * r * r + 2 * r + 1;
const sphere = (j) => (j ? 4 * j * j + 2 : 1);
const ball = (r) => total(range(-r, r).map((t) => disk(r - Math.abs(t))));
// how many points of the box [−r, r]^dim pass a test, going through all of them
function lattice(dim, r, ok) {
  const p = Array(dim).fill(-r);
  let c = 0;
  for (;;) {
    if (ok(p)) c++;
    let i = 0;
    while (i < dim && p[i] === r) p[i++] = -r;
    if (i === dim) return c;
    p[i]++;
  }
}
// where a walker can be after exactly n unit moves along the axes, played out move by move
function walkEnds(dim, n) {
  let at = new Set([Array(dim).fill(0).join(',')]);
  for (let s = 0; s < n; s++) {
    const next = new Set();
    for (const key of at) {
      const p = key.split(',').map(Number);
      for (let i = 0; i < dim; i++) for (const e of [-1, 1]) { const q = p.slice(); q[i] += e; next.add(q.join(',')); }
    }
    at = next;
  }
  return at.size;
}
const pt = (...xs) => `(${xs.map((v) => num(v)).join(', ')})`;
const absShift = (v, c) => (c ? `|${v} ${c > 0 ? '−' : '+'} ${Math.abs(c)}|` : `|${v}|`);   // |x − 3|, |y + 2|
const CENTERS = [[3, 2], [-2, 5], [4, -1], [1, 3], [-3, -2], [5, 4]];
const ITEMS = ['marbles', 'stickers', 'apples', 'pencils', 'pebbles', 'cookies'];

// rings of regions: R(c, n) colorings of a ring of n with c colors, neighbors different, written out as a formula
const R = (c, n) => (c - 1) ** n + (n % 2 ? -1 : 1) * (c - 1);
const ringShown = (c, n) => `${c - 1}<sup>${n}</sup> ${n % 2 ? '−' : '+'} ${c - 1}`;
const ringEdges = (n, from = 0) => range(0, n - 1).map((i) => [from + i, from + ((i + 1) % n)]);
// every coloring of pieces 0 … m − 1 with k colors in which pieces joined by an edge differ, handed to f
function eachColoring(m, k, edges, f) {
  const before = range(0, m - 1).map(() => []);
  for (const [a, b] of edges) before[Math.max(a, b)].push(Math.min(a, b));
  const col = Array(m).fill(-1);
  const go = (i) => {
    if (i === m) { f(col); return; }
    for (let c = 0; c < k; c++) if (before[i].every((j) => col[j] !== c)) { col[i] = c; go(i + 1); }
    col[i] = -1;
  };
  go(0);
}

// pigeonholes: the largest safe set, found by trying things. mis() is the most of `vs` with no two clashing (take a
// piece with no clash, or try the first piece both in and out); mostApart() does that one connected group at a time
const mis = (vs, clash) => {
  if (!vs.length) return 0;
  const [v, ...rest] = vs, free = rest.filter((u) => !clash(v, u));
  return free.length === rest.length ? 1 + mis(rest, clash) : Math.max(mis(rest, clash), 1 + mis(free, clash));
};
function mostApart(items, clash) {
  const seen = new Set();
  let best = 0;
  for (const s of items) {
    if (seen.has(s)) continue;
    const group = [s];
    seen.add(s);
    for (let i = 0; i < group.length; i++) for (const t of items) if (!seen.has(t) && clash(group[i], t)) { seen.add(t); group.push(t); }
    best += mis(group, clash);
  }
  return best;
}
// every way to take x[i] ≤ have[i] things of each kind: the most things in a take that still misses the goal
function worstTake(have, goal) {
  let worst = 0;
  const x = [], go = (i) => {
    if (i === have.length) { if (!goal(x)) worst = Math.max(worst, total(x)); return; }
    for (let v = 0; v <= have[i]; v++) { x[i] = v; go(i + 1); }
  };
  go(0);
  return worst;
}
// the totals that people can reach in h boxes with at most cap in each box (box by box)
const reachable = (h, cap, upTo) => { let r = new Set([0]); for (let i = 0; i < h; i++) { const next = new Set(); for (const v of r) for (let j = 0; j <= cap && v + j <= upTo; j++) next.add(v + j); r = next; } return r; };
const COLORS = ['black', 'white', 'gray', 'blue', 'brown'];

// binomials, exactly: a power of a sum of terms [power of x, coefficient] multiplied out one factor at a time with
// BigInt (a Map from each power of x to its coefficient), and Pascal’s triangle built by additions alone
function expand(terms, n) {
  let poly = new Map([[0, 1n]]);
  for (let i = 0; i < n; i++) {
    const next = new Map();
    for (const [e, c] of poly) for (const [te, tc] of terms) next.set(e + te, (next.get(e + te) ?? 0n) + c * BigInt(tc));
    poly = next;
  }
  return poly;
}
const coefOf = (poly, e) => poly.get(e) ?? 0n;
const pascal = (rows) => { const t = [[1n]]; for (let m = 1; m <= rows; m++) t.push(range(0, m).map((j) => (t[m - 1][j - 1] ?? 0n) + (t[m - 1][j] ?? 0n))); return t; };
const sumBig = (xs) => xs.reduce((s, v) => s + v, 0n);
const xPow = (e) => (e === 1 ? 'x' : `x<sup>${e}</sup>`);
const term = (c, e) => `${c === 1 ? '' : c === -1 ? '−' : num(c)}${xPow(e)}`;                 // 3x², x, −x³
const plusMinus = (c, shown) => `${c < 0 ? '−' : '+'} ${shown}`;                             // + 2, − 3
const overX = (c, e) => `<span class="fr"><span>${Math.abs(c)}</span><span>${xPow(e)}</span></span>`;
const pow = (b, e) => { const base = b < 0 ? `(${num(b)})` : num(b); return e === 1 ? base : `${base}<sup>${e}</sup>`; };   // no power of 1
const nonzero = (xs) => xs.filter((v) => v !== 0);

// ---------- drawing: an svg with the figure styles (side, dash, seg, arc, vx and ang labels) ----------
const r2 = (v) => Math.round(v * 100) / 100;
const svg = (w, h, name, parts) => `<svg class="tri" viewBox="0 0 ${w} ${h}" role="img" aria-label="${name}">${parts.join('')}</svg>`;
const label = ([x, y], text, cls = 'vx', anchor = 'middle') => `<text class="${cls}" x="${r2(x)}" y="${r2(y + 5)}" text-anchor="${anchor}">${text}</text>`;
const rect = (x, y, w, h, cls = 'side') => `<rect class="${cls}" x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}"/>`;

// round things cut into n pieces, to scale: the pieces lie between radii r1 and r2 (r1 = 0 for wedges of a pie), with
// an outer rim out to r3 when asked, and the pieces numbered 1 to n when asked
const circ = ([x, y], r, cls = 'side') => `<circle class="${cls}" cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}"/>`;
const polar = ([x, y], r, t) => [x + r * Math.cos(t), y + r * Math.sin(t)];
function roundParts(n, c, r1, rr, { r3 = 0, numbers = false } = {}) {
  const parts = [circ(c, r3 || rr)];
  if (r3) parts.push(circ(c, rr));
  if (r1) parts.push(circ(c, r1));
  for (let i = 0; i < n; i++) {
    const t = (2 * Math.PI * i) / n - Math.PI / 2, [x1, y1] = polar(c, r1, t), [x2, y2] = polar(c, rr, t);
    parts.push(`<line class="side" x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}"/>`);
    if (numbers) parts.push(label(polar(c, r1 ? (r1 + rr) / 2 : rr * 0.62, t + Math.PI / n), i + 1));
  }
  return parts;
}
// a straight row of n tiles above a ring of n tiles, both numbered
function rowAndRing(n) {
  const sq = Math.min(36, 320 / n), x0 = 200 - (n * sq) / 2, parts = [rect(x0, 16, n * sq, sq)];
  for (let i = 1; i < n; i++) parts.push(`<line class="side" x1="${r2(x0 + i * sq)}" y1="16" x2="${r2(x0 + i * sq)}" y2="${r2(16 + sq)}"/>`);
  for (let i = 0; i < n; i++) parts.push(label([x0 + (i + 0.5) * sq, 16 + sq / 2 - 1], i + 1));
  return svg(400, 280, `A row of ${n} tiles and a ring of ${n} tiles`, [...parts, ...roundParts(n, [200, 170], 46, 98, { numbers: true })]);
}
// a 2 × n path paved with bricks (one across it fills a foot; two along it fill two feet) and 2 × 2 tiles, to scale
function paving(n) {
  const plan = ['V', 'S', 'V', 'H', 'V', 'V', 'S', 'H'], blocks = [];
  for (let i = 0, used = 0; used < n; i++) {
    const want = plan[i % plan.length], blk = used + (want === 'V' ? 1 : 2) <= n ? want : 'V';
    blocks.push([blk, used]);
    used += blk === 'V' ? 1 : 2;
  }
  const u = Math.min(36, 330 / n), W = n * u, x0 = (400 - W) / 2, y0 = 22, e = 3;
  const tile = (x, y, w, h, cls) => rect(x + e, y + e, w - 2 * e, h - 2 * e, cls);
  const parts = [rect(x0, y0, W, 2 * u)];
  for (const [blk, c] of blocks) {
    const x = x0 + c * u;
    if (blk === 'V') parts.push(tile(x, y0, u, 2 * u, 'side'));
    if (blk === 'H') parts.push(tile(x, y0, 2 * u, u, 'side'), tile(x, y0 + u, 2 * u, u, 'side'));
    if (blk === 'S') parts.push(tile(x, y0, 2 * u, 2 * u, 'arc'));
  }
  parts.push(label([x0 + W / 2, y0 + 2 * u + 20], `${n} feet`, 'ang'), label([x0 - 14, y0 + u - 4], '2', 'ang'));
  return svg(400, r2(2 * u + 60), `A 2 by ${n} path paved with bricks and square tiles`, parts);
}
// every tiling of a 2 × n board by dominoes (and 2 × 2 squares, if allowed): [all of them, those with a square]
function tilings2(n, squares) {
  const full = [Array(n).fill(false), Array(n).fill(false)];
  let all = 0, some = 0;
  const set = (cells, v) => cells.forEach(([i, j]) => { full[i][j] = v; });
  const go = (usedSquare) => {
    let r = -1, c = -1;
    for (let j = 0; j < n && r < 0; j++) for (let i = 0; i < 2 && r < 0; i++) if (!full[i][j]) { r = i; c = j; }
    if (r < 0) { all++; if (usedSquare) some++; return; }
    const tries = [];
    if (r === 0 && !full[1][c]) tries.push([[[0, c], [1, c]], usedSquare]);
    if (c + 1 < n && !full[r][c + 1]) tries.push([[[r, c], [r, c + 1]], usedSquare]);
    if (squares && r === 0 && c + 1 < n && !full[1][c] && !full[0][c + 1] && !full[1][c + 1]) tries.push([[[0, c], [1, c], [0, c + 1], [1, c + 1]], true]);
    for (const [cells, u] of tries) { set(cells, true); go(u); set(cells, false); }
  };
  go(false);
  return [all, some];
}

export const hardCounting = {
  'Counting with recursion': [
    // strings with no two (or no three) 1s in a row, along a line or around a circle
    (d, ctx) => {
      const [kind, n] = pickKind(ctx, 'runs', ['line2', 'line3', 'ring2'], [range(7, 13)], (kind, n) => (kind === 'line2' ? n >= 9 : kind === 'line3' ? n <= 11 : n >= 8));
      const a = grow([1, 2], (s, m) => s[m - 1] + s[m - 2], n + 1), t = grow([1, 2, 4], (s, m) => s[m - 1] + s[m - 2] + s[m - 3], n + 1);
      const ring = (m) => a[m - 1] + a[m - 3], name = d.pick(NAMES);
      const ans = kind === 'line2' ? a[n] : kind === 'line3' ? t[n] : ring(n);
      const S = d.pick({
        line2: [
          { text: `A hallway has a row of ${n} lamps. Each lamp is on or off, and no two lamps next to each other may both be on. In how many ways can the lamps be set? (All of them off counts.)`, what: 'setting of the lamps', one: 'a lamp that is on' },
          { text: `${name} has a row of ${n} garden plots and plants a rosebush in some of them, never in two plots next to each other. How many planting plans are there, counting the plan with no rosebushes at all?`, what: 'plan', one: 'a plot with a rosebush' },
          { text: `How many strings of ${n} digits, each 0 or 1, have no two 1s next to each other?`, what: '', one: '' },
        ],
        line3: [
          { text: `A coin is tossed ${n} times. In how many of the 2<sup>${n}</sup> possible sequences of heads and tails do three heads never come up in a row?`, what: 'sequence', one: 'heads' },
          { text: `Over the next ${n} days, ${name} will train on some days and rest on the others, but never train on three days in a row. How many training plans are possible? (Resting every day counts.)`, what: 'plan', one: 'a training day' },
        ],
        ring2: [
          { text: `${Cap(WORDS[n])} chairs, numbered 1 to ${n}, stand around a round table. Some guests sit down, but no two guests may sit in chairs next to each other. How many sets of occupied chairs are possible, counting the empty table?`, thing: 'chair', on: 'taken', off: 'empty' },
          { text: `A bracelet has ${n} beads in a circle, numbered 1 to ${n}. Some of the beads are painted gold so that no two gold beads are next to each other. In how many ways can this be done, counting no gold beads at all?`, thing: 'bead', on: 'gold', off: 'plain' },
        ],
      }[kind]);
      const write = S.what ? `Write each ${S.what} as a string of 0s and 1s, with 1 for ${S.one}. ` : '';
      return {
        topic: 'Counting with recursion', rank: { line2: 7, line3: 10, ring2: 12 }[kind],
        text: S.text,
        answer: choices(d, ans, { line2: [a[n - 1], a[n + 1], a[n] - 1, ring(n)], line3: [t[n - 1], t[n + 1], t[n - 1] + t[n - 2], a[n]], ring2: [a[n], a[n - 1], ring(n - 1), ring(n + 1)] }[kind]),
        check: () => {
          let c = 0;
          eachString(2, n, (s) => {
            const bad = kind === 'line3' ? s.some((b, i) => i >= 2 && b && s[i - 1] && s[i - 2]) : s.some((b, i) => b && (i ? s[i - 1] : kind === 'ring2' && s[n - 1]));
            if (!bad) c++;
          });
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        solution: {
          line2: `${write}Let a(m) count the good strings of length m. A good string ends in 0 after any good string of length m − 1, or in 01 after any good string of length m − 2, so a(m) = a(m − 1) + a(m − 2), starting from a(1) = 2 and a(2) = 3. The counts go ${shownList(a.slice(1, n + 1))}, so there are <b>${num(ans)}</b>.`,
          line3: `${write}Let t(m) count the good strings of length m. A good string ends in 0, 01 or 011 (never 111), after a good string of length m − 1, m − 2 or m − 3, so t(m) = t(m − 1) + t(m − 2) + t(m − 3), starting from t(1) = 2, t(2) = 4 and t(3) = 7. The counts go ${shownList(t.slice(1, n + 1))}, so there are <b>${num(ans)}</b>.`,
          ring2: `Split on ${S.thing} 1, which is the only thing that makes a circle harder than a row. If it is ${S.off}, ${S.thing}s 2 to ${n} form a row of ${n - 1} in which no two neighbors are both ${S.on}; if it is ${S.on}, ${S.thing}s 2 and ${n} must be ${S.off}, and ${S.thing}s 3 to ${n - 1} form a row of ${n - 3}. A row of m follows a(m) = a(m − 1) + a(m − 2) (its last ${S.thing} is ${S.off}, or ${S.on} with the one before it ${S.off}), and from a(1) = 2 and a(2) = 3 the rows of 1 to ${n - 1} give ${shownList(a.slice(1, n))}. So the circle has a(${n - 1}) + a(${n - 3}) = ${num(a[n - 1])} + ${num(a[n - 3])} = <b>${num(ans)}</b>.`,
        }[kind],
      };
    },
    // tilings of a strip, counted by what covers its end
    (d, ctx) => {
      const [kind, n] = pickKind(ctx, 'tiles', ['mixed', 'some', 'colors', 'rods'], [range(6, 20)], (kind, n) => (kind === 'rods' ? n >= 12 : n <= 10));
      const a = grow([1, 1], (s, m) => s[m - 1] + 2 * s[m - 2], n + 1), b = grow([1, 1], (s, m) => s[m - 1] + s[m - 2], n + 1);
      const p = grow([1, 2], (s, m) => 2 * s[m - 1] + s[m - 2], n + 1), r = grow([1, 0, 1], (s, m) => s[m - 2] + s[m - 3], n + 1);
      const threes = range(0, Math.floor(n / 3)).filter((j) => (n - 3 * j) % 2 === 0);   // how many 3-meter panels a fence can have
      const ans = { mixed: a[n], some: a[n] - b[n], colors: p[n], rods: r[n] }[kind], name = d.pick(NAMES);
      const slip3 = grow([1, 1], (s, m) => s[m - 1] + 3 * s[m - 2], n), slip2 = grow([1, 2], (s, m) => 2 * s[m - 1] + 2 * s[m - 2], n);
      const path = `A garden path 2 feet wide and ${n} feet long is paved with 1 × 2 bricks, which may lie along the path or across it, and 2 × 2 tiles, with no gaps or overlaps. One way is shown.`;
      return {
        topic: 'Counting with recursion', rank: { mixed: 9, some: 10, colors: 9, rods: 6 }[kind],
        text: {
          mixed: `${path} In how many ways can the path be paved?`,
          some: `${path} In how many of the ways is at least one 2 × 2 tile used?`,
          colors: `A 1 × ${n} strip is covered, with no gaps or overlaps, by red 1 × 1 squares, blue 1 × 1 squares and white 1 × 2 tiles. How many different coverings are there?`,
          rods: `${name} builds a fence ${n} meters long from panels 2 meters wide and panels 3 meters wide, set side by side in a row. Panels of the same width look alike. How many different fences can ${name} build?`,
        }[kind],
        figure: kind === 'mixed' || kind === 'some' ? paving(n) : undefined,
        answer: choices(d, ans, {
          mixed: [b[n], a[n - 1], a[n + 1], slip3[n]],
          some: [a[n], a[n] - b[n - 1], a[n] - b[n + 1], b[n]],
          colors: [p[n - 1], p[n + 1], 2 ** n, slip2[n]],
          rods: [r[n - 1], r[n + 1], threes.length, r[n - 1] + r[n - 2]],
        }[kind]),
        check: () => {
          const c = kind === 'mixed' ? tilings2(n, true)[0] : kind === 'some' ? tilings2(n, true)[1]
            : kind === 'colors' ? total(range(0, Math.floor(n / 2)).map((j) => choose(n - j, j) * 2 ** (n - 2 * j)))
              : total(threes.map((j) => choose((n - 3 * j) / 2 + j, j)));
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        solution: {
          mixed: `Let a(m) count the pavings of a 2 × m path, and look at how its first foot is covered. Either one brick lies across it, leaving a 2 × (m − 1) path, or the first two feet are covered by two bricks lying along the path or by one 2 × 2 tile, leaving a 2 × (m − 2) path. So a(m) = a(m − 1) + 2a(m − 2), starting from a(1) = 1 and a(2) = 3. The counts go ${shownList(a.slice(1, n + 1))}, so there are <b>${num(ans)}</b> pavings.`,
          some: `It is easier to count all the pavings and take away those with no 2 × 2 tile. The first foot is covered by a brick across it, by two bricks along it or by a 2 × 2 tile, so all the pavings follow a(m) = a(m − 1) + 2a(m − 2) from a(1) = 1 and a(2) = 3, which gives ${shownList(a.slice(1, n + 1))}. With bricks only there is no tile to choose, so b(m) = b(m − 1) + b(m − 2) from b(1) = 1 and b(2) = 2, which gives ${shownList(b.slice(1, n + 1))}. So ${num(a[n])} − ${num(b[n])} = <b>${num(ans)}</b> pavings use a 2 × 2 tile.`,
          colors: `Let p(m) count the coverings of a 1 × m strip, and look at the tile at its right end. It is a red or a blue square, leaving a 1 × (m − 1) strip, or a white tile, leaving a 1 × (m − 2) strip. So p(m) = 2p(m − 1) + p(m − 2), starting from p(1) = 2 and p(2) = 5 (four ways with two squares, one with a white tile). The counts go ${shownList(p.slice(1, n + 1))}, so there are <b>${num(ans)}</b> coverings.`,
          rods: `Let r(m) count the fences m meters long, and look at the last panel. It is 2 or 3 meters wide, and what comes before it is a shorter fence built the same way, so r(m) = r(m − 2) + r(m − 3). Start from r(0) = 1 (the empty fence), r(1) = 0 and r(2) = 1, and the values from r(0) to r(${n}) are ${shownList(r.slice(0, n + 1))}. So there are <b>${num(ans)}</b> fences.`,
        }[kind],
      };
    },
    // climbing stairs 1, 2 (or 3) steps at a time without landing on a broken step
    (d, ctx) => {
      const [kind, big, n, b1, second] = pickKind(ctx, 'stairs', ['one', 'two'], [[2, 3], range(8, 12), range(3, 7), range(5, 10)],
        (kind, big, n, b1, b2) => b1 <= n - 3 && (kind === 'one' ? b2 === 5 : b2 - b1 >= 2 && b2 <= n - 2));
      const b2 = kind === 'two' ? second : 0, broken = b2 ? [b1, b2] : [b1], name = d.pick(NAMES), frog = d.chance(0.5);
      const ways = (bad) => grow([1], (s, m) => (bad.includes(m) ? 0 : total(range(1, big).map((j) => (m - j >= 0 ? s[m - j] : 0)))), n + 1);
      const T = ways([]), w = ways(broken), ans = w[n], through = (b) => T[b] * T[n - b];
      const moves = big === 3 ? '1, 2 or 3' : '1 or 2', unit = frog ? 'pad' : 'step';
      const rec = (f) => range(1, big).map((j) => `${f}(m − ${j})`).join(' + ');
      return {
        topic: 'Counting with recursion', rank: 6 + (big === 3 ? 1 : 0) + (b2 ? 2 : 0),
        text: frog
          ? `A frog sits on the bank of a pond, facing a straight row of ${n} lily pads numbered 1 to ${n}. It hops forward ${moves} pads at a time until it lands on pad ${n}, and it never lands on pad ${b1}${b2 ? ` or pad ${b2}, which have` : ', which has'} sunk. In how many ways can the frog reach pad ${n}?`
          : `A staircase has ${n} steps. ${name} starts on the floor and climbs to the top step, going up ${moves} steps at a time. Step ${b1}${b2 ? ` and step ${b2} are` : ' is'} broken, and ${name} must never land on a broken step. In how many ways can ${name} reach the top?`,
        answer: choices(d, ans, b2 ? [T[n], T[n] - through(b1) - through(b2), ways([b1])[n], ways([b2])[n]] : [T[n], through(b1), T[n] - T[b1] - T[n - b1], T[n - 1]]),
        check: () => {
          // every sequence of moves, and whether it ever lands on a broken one
          let c = 0;
          const go = (at, hit) => { if (at === n) { if (!hit) c++; return; } for (let j = 1; j <= big && at + j <= n; j++) go(at + j, hit || broken.includes(at + j)); };
          go(0, false);
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        solution: b2
          ? `Count the ways to reach each ${unit}, from the bottom up. The last move onto ${unit} m is ${moves} ${unit}s long, so ways(m) = ${rec('ways')}, except that a ${frog ? 'sunk' : 'broken'} ${unit} gets 0, since nothing may land there. Starting from ways(0) = 1 for the ${frog ? 'bank' : 'floor'}, ${unit}s 1 to ${n} get ${shownList(w.slice(1, n + 1))}. So there are <b>${num(ans)}</b> ways.`
          : `Count all the ways with nothing ${frog ? 'sunk' : 'broken'}, then take away those that land on ${unit} ${b1}. Let T(m) be the number of ways to go m ${unit}s; the last move is ${moves} ${unit}s long, so T(m) = ${rec('T')}, and from T(0) = 1 the values are ${shownList(T.slice(0, n + 1))}. A way that lands on ${unit} ${b1} is a way to go ${b1} ${unit}s followed by a way to go the other ${n - b1}, so there are T(${b1})·T(${n - b1}) = ${T[b1]}·${T[n - b1]} = ${num(through(b1))} of them. So T(${n}) − ${num(through(b1))} = ${num(T[n])} − ${num(through(b1))} = <b>${num(ans)}</b>.`,
      };
    },
    // strings with a rule that needs a count for each way a string can end
    (d, ctx) => {
      const [kind, n] = pickKind(ctx, 'states', ['noAB', 'apart', 'clumpy', 'smooth4', 'smooth5'], [range(4, 9)],
        (kind, n) => ({ noAB: n >= 5, apart: n >= 5, clumpy: n >= 6, smooth4: n >= 5 && n <= 7, smooth5: n <= 6 })[kind]);
      const D = kind === 'smooth5' ? 5 : 4;
      const tAB = grow([1, 3], (s, m) => 3 * s[m - 1] - s[m - 2], n + 1);
      const WC = [[1, 0], [1, 2]];
      for (let m = 2; m <= n + 1; m++) { const [w, c] = WC[m - 1]; WC.push([w + c, 2 * w + c]); }
      const apart = WC.map(([w, c]) => w + c);
      const cl = grow([1, 0, 3, 3], (s, m) => s[m - 1] + 2 * s[m - 2], n + 1), over = grow([1, 0], (s, m) => total(range(2, m).map((q) => 3 * s[m - q])), n);
      // smooth numbers: how many end in each digit, one digit at a time
      const walk = (len, steps) => { let v = Array(D).fill(1); for (let m = 2; m <= len; m++) v = v.map((_, j) => total(steps.map((s) => v[j + s] ?? 0))); return v; };
      const smooth = (len) => total(walk(len, [-1, 0, 1]));
      const XYZ = [[1, 1, 1]];
      for (let m = 2; m <= n; m++) { const [x, y, z] = XYZ.at(-1); XYZ.push(D === 4 ? [x + y, x + 2 * y, 0] : [x + y, x + y + z, 2 * y + z]); }
      const ans = { noAB: tAB[n], apart: apart[n], clumpy: cl[n], smooth4: smooth(n), smooth5: smooth(n) }[kind];
      const [x, y, z] = XYZ[n - 1], [w, c] = WC[n];
      return {
        topic: 'Counting with recursion', rank: { noAB: 11, apart: 10, clumpy: 13, smooth4: 10, smooth5: 11 }[kind],
        text: {
          noAB: `How many strings of ${n} letters, each A, B or C, never have an A immediately followed by a B? (The pair AB may not appear anywhere: BBAC is fine, but CABC is not.)`,
          apart: `A signal is a row of ${n} flags, each red, white or blue, and a red flag may never be right next to a blue flag. How many signals are possible?`,
          clumpy: `${Cap(WORDS[n])} beads, each red, green or blue, are threaded in a row. The row is called clumpy if every bead has at least one neighbor of its own color. How many clumpy rows are there? (The beads are in places 1 to ${n}, so a row and its reverse count separately.)`,
          smooth4: `A number is called smooth if each of its digits is 1, 2, 3 or 4 and any two neighboring digits differ by at most 1. For example, 1223 and 4343 are smooth, but 1243 is not. How many smooth ${n}-digit numbers are there?`,
          smooth5: `A number is called smooth if each of its digits is 1, 2, 3, 4 or 5 and any two neighboring digits differ by at most 1. For example, 1223 and 5454 are smooth, but 1243 is not. How many smooth ${n}-digit numbers are there?`,
        }[kind],
        answer: choices(d, ans, {
          noAB: [3 ** n - (n - 1) * 3 ** (n - 2), tAB[n - 1], tAB[n + 1], apart[n]],
          apart: [tAB[n], apart[n - 1], apart[n + 1], 3 * 2 ** (n - 1)],
          clumpy: [cl[n - 1], cl[n + 1], 3 * fib(n - 1), over[n]],
          smooth4: [smooth(n - 1), smooth(n + 1), D * 3 ** (n - 1), total(walk(n, [-1, 1]))],
          smooth5: [smooth(n - 1), smooth(n + 1), D * 3 ** (n - 1), total(walk(n, [-1, 1]))],
        }[kind]),
        check: () => {
          // every string, tested against the rule itself (for the flags: 0 red, 1 white, 2 blue)
          let cnt = 0;
          eachString(kind.startsWith('smooth') ? D : 3, n, (s) => {
            const ok = kind === 'noAB' ? s.every((v, i) => !(i && s[i - 1] === 0 && v === 1))
              : kind === 'apart' ? s.every((v, i) => !(i && v !== s[i - 1] && v + s[i - 1] === 2))
                : kind === 'clumpy' ? s.every((v, i) => s[i - 1] === v || s[i + 1] === v)
                  : s.every((v, i) => !i || Math.abs(v - s[i - 1]) <= 1);
            if (ok) cnt++;
          });
          return cnt === ans ? '' : `counted ${cnt}, said ${ans}`;
        },
        solution: {
          noAB: `Keep track of how the strings end. Let t(m) count the good strings of length m and e(m) those that end in A. A good string can always be followed by A or C, but by B only if it does not end in A, so t(m) = 3t(m − 1) − e(m − 1). An A may follow anything, so e(m) = t(m − 1), and therefore t(m) = 3t(m − 1) − t(m − 2), starting from t(1) = 3 and t(2) = 8. The counts go ${shownList(tAB.slice(1, n + 1))}, so there are <b>${num(ans)}</b> strings.`,
          apart: `Keep two counts, w(m) for the good signals of m flags that end in white and c(m) for those that end in red or blue. A white flag can follow any flag, so w(m) = w(m − 1) + c(m − 1). A red flag can follow a white or a red one, and a blue flag a white or a blue one, so c(m) = 2w(m − 1) + c(m − 1). From w(1) = 1 and c(1) = 2 the pairs (w, c) go ${WC.slice(1, n + 1).map(([p, q]) => `(${num(p)}, ${num(q)})`).join(', ')}, so there are ${num(w)} + ${num(c)} = <b>${num(ans)}</b> signals.`,
          clumpy: `Every bead has a neighbor of its own color exactly when every block of beads of one color has at least 2 beads. Let c(m) count the clumpy rows of m beads, and look at the last block. If it has 3 or more beads, removing the last bead leaves a clumpy row of m − 1; if it has exactly 2, removing both leaves a clumpy row of m − 2, and the last block can be either of the 2 colors other than that row’s last color. So c(m) = c(m − 1) + 2c(m − 2), starting from c(2) = 3 and c(3) = 3. The counts go ${shownList(cl.slice(2, n + 1))}, so there are <b>${num(ans)}</b> clumpy rows.`,
          smooth4: `Count by the last digit, using the symmetry that swaps each digit d with 5 − d. Let x(m) count the smooth m-digit numbers ending in 1 (as many as end in 4) and y(m) those ending in 2 (as many as end in 3). A final 1 can follow 1 or 2, and a final 2 can follow 1, 2 or 3, so x(m) = x(m − 1) + y(m − 1) and y(m) = x(m − 1) + 2y(m − 1). From x(1) = y(1) = 1 the pairs (x, y) go ${XYZ.map(([p, q]) => `(${num(p)}, ${num(q)})`).join(', ')}, so there are 2·${num(x)} + 2·${num(y)} = <b>${num(ans)}</b> smooth numbers.`,
          smooth5: `Count by the last digit, using the symmetry that swaps each digit d with 6 − d. Let x(m), y(m) and z(m) count the smooth m-digit numbers ending in 1, 2 and 3 (as many end in 5 as in 1, and in 4 as in 2). A final 1 follows 1 or 2, a final 2 follows 1, 2 or 3, and a final 3 follows 2, 3 or 4, so x(m) = x(m − 1) + y(m − 1), y(m) = x(m − 1) + y(m − 1) + z(m − 1) and z(m) = 2y(m − 1) + z(m − 1). From x(1) = y(1) = z(1) = 1 the triples (x, y, z) go ${XYZ.map(([p, q, s]) => `(${num(p)}, ${num(q)}, ${num(s)})`).join(', ')}, so there are 2·${num(x)} + 2·${num(y)} + ${num(z)} = <b>${num(ans)}</b> smooth numbers.`,
        }[kind],
      };
    },
  ],

  'Stars and bars': [
    // a smallest amount for each share: hand those out first, then stars and bars
    (d, ctx) => {
      const [low, n] = pick(ctx, 'low', [[[2, 1, 3], [1, 3, 0], [3, 0, 2], [2, 2, 1], [0, 4, 1], [1, 2, 3, 0], [2, 0, 1, 3], [1, 1, 2, 2], [3, 1, 0, 2], [-1, 2, 0], [2, -2, 1, 0], [-1, -1, 3], [0, -2, 2, 1]], range(12, 19)],
        (low, n) => (low.length === 4 ? n <= 16 : n >= 13));
      const eq = low.some((v) => v < 0) || d.chance(0.3), k = low.length, lows = total(low), m = n - lows, ans = choose(m + k - 1, k - 1);
      const vars = k === 3 ? ['x', 'y', 'z'] : ['w', 'x', 'y', 'z'], names = d.shuffle(NAMES).slice(0, k), item = d.pick(ITEMS);
      const atLeast = names.map((p, i) => [p, low[i]]).filter(([, v]) => v > 0).map(([p, v], i) => (i ? `${p} at least ${v}` : `${p} gets at least ${v}`));
      const none = names.filter((_, i) => low[i] === 0);
      const shift = vars.map((v, i) => (low[i] ? `${v} = ${v}′ ${low[i] > 0 ? '+' : '−'} ${Math.abs(low[i])}` : `${v} = ${v}′`));
      return {
        topic: 'Stars and bars', rank: eq ? (low.some((v) => v < 0) ? 7 : 6) : 2 + k,
        text: eq
          ? `How many ordered ${k === 3 ? 'triples (x, y, z)' : 'quadruples (w, x, y, z)'} of integers satisfy ${vars.join(' + ')} = ${n}, with ${listing(vars.map((v, i) => `${v} ≥ ${num(low[i])}`))}?`
          : `A teacher shares ${n} identical ${item} among ${listing(names)} so that ${listing(atLeast)}${none.length ? `, while ${listing(none)} may get none` : ''}. In how many ways can this be done?`,
        answer: choices(d, ans, [choose(n + k - 1, k - 1), choose(m + k - 1, k), choose(m - 1, k - 1), choose(m + k, k - 1), choose(m + k - 2, k - 1)]),
        check: () => { const c = countTuples(low, low.map((v) => n - lows + v), n); return c === ans ? '' : `counted ${c}, said ${ans}`; },
        solution: eq
          ? `Shift each variable so that it starts at 0, putting ${listing(shift)}. The new variables are whole numbers with ${vars.map((v) => `${v}′`).join(' + ')} = ${n} ${lows < 0 ? '+' : '−'} ${Math.abs(lows)} = ${m}. A solution is a row of ${m} stars and ${k - 1} bars, where the bars cut the stars into the ${k} values, so there are C(${m + k - 1}, ${k - 1}) = <b>${num(ans)}</b> of them.`
          : `Hand out the smallest amounts first, which uses ${lows} of the ${item} and leaves ${m} to be shared with no rule at all. Sharing ${m} identical ${item} among ${k} people is the same as lining up ${m} stars and ${k - 1} bars, where the bars cut the row into the ${k} shares (some maybe empty). So there are C(${m + k - 1}, ${k - 1}) = <b>${num(ans)}</b> ways.`,
      };
    },
    // a largest amount too: stars and bars, then take away the shares over the limit (and add back the doubles)
    (d, ctx) => {
      const [what, k, cap, n] = pickKind(ctx, 'caps', ['share', 'digits'], [[3, 4], range(4, 7), range(6, 22)], (what, k, cap, n) => (what === 'digits'
        ? cap === 4 && (k === 3 ? n >= 11 && n <= 17 : n >= 12)
        : n >= cap + 2 && n < 3 * (cap + 1) && n <= k * cap - 2));
      const kind = what === 'digits' ? 'digits' : d.chance(0.5) ? 'share' : 'eq', digits = kind === 'digits', caps = digits ? [8, ...Array(k - 1).fill(9)] : Array(k).fill(cap), S = digits ? n - 1 : n;
      const terms = overCaps(caps, S), ans = alternate(terms), name = d.pick(NAMES), item = d.pick(ITEMS);
      const one = choose(S - cap - 1 + k - 1, k - 1), two = S >= 2 * cap + 2 ? choose(S - 2 * cap - 2 + k - 1, k - 1) : 0;
      const letters = ['a', 'b', 'c', 'd'].slice(0, k), who = kind === 'share' ? 'friend' : 'variable';
      // the digit sum: a′ = a − 1 is at most 8, the others at most 9
      const ta = choose(S - 9 + k - 1, k - 1), tb = choose(S - 10 + k - 1, k - 1), ua = S >= 19 ? choose(S - 19 + k - 1, k - 1) : 0, ub = S >= 20 ? choose(S - 20 + k - 1, k - 1) : 0;
      const back = [ua ? `${k - 1}·C(${S - 19 + k - 1}, ${k - 1}) = ${num((k - 1) * ua)} with a′ and another digit both over` : '', ub ? `${choose(k - 1, 2)}·C(${S - 20 + k - 1}, ${k - 1}) = ${num(choose(k - 1, 2) * ub)} with two of the others over` : ''].filter(Boolean);
      return {
        topic: 'Stars and bars', rank: digits ? 10 : k === 3 ? 8 : 9,
        text: {
          share: `${name} shares ${n} identical ${item} among ${WORDS[k]} friends, and no friend may get more than ${cap} (a friend may get none). In how many ways can this be done?`,
          eq: `How many ordered ${k === 3 ? 'triples (x, y, z)' : 'quadruples (w, x, y, z)'} of whole numbers satisfy ${(k === 3 ? ['x', 'y', 'z'] : ['w', 'x', 'y', 'z']).join(' + ')} = ${n}, with each of them at most ${cap}?`,
          digits: `How many ${k}-digit positive integers have digits that add up to ${n}?`,
        }[kind],
        answer: choices(d, ans, digits
          ? [alternate(overCaps(Array(k).fill(9), n)), choose(S + k - 1, k - 1), terms[0] - terms[1], alternate(overCaps(Array(k).fill(9), S))]
          : [terms[0], terms[0] - terms[1], alternate(overCaps(Array(k).fill(cap - 1), n)), choose(n - 1, k - 1)]),
        check: () => {
          let c = 0;
          if (digits) { for (let x = 10 ** (k - 1); x < 10 ** k; x++) if (total(String(x).split('').map(Number)) === n) c++; } else c = countTuples(Array(k).fill(0), caps, n);
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        solution: digits
          ? `Call the digits ${listing(letters)}, with a at least 1, and put a′ = a − 1, so that a′ + ${letters.slice(1).join(' + ')} = ${S} in whole numbers, with a′ at most 8 and the others at most 9. Without those limits, stars and bars gives C(${S + k - 1}, ${k - 1}) = ${num(terms[0])}. Take away the ways with a′ at 9 or more (give it 9 first), C(${S - 9 + k - 1}, ${k - 1}) = ${num(ta)}, and the ways with one of the other ${k - 1} digits at 10 or more, C(${S - 10 + k - 1}, ${k - 1}) = ${num(tb)} each. ${back.length ? `Two digits can be over at once, and those ways were taken away twice, so add back ${listing(back)}.` : `No two digits can be over at once, since that would need a′ + ${letters.slice(1).join(' + ')} to be at least 19.`} So the count is ${num(terms[0])} − ${num(ta)} − ${k - 1}·${num(tb)}${ua ? ` + ${num((k - 1) * ua)}` : ''}${ub ? ` + ${num(choose(k - 1, 2) * ub)}` : ''} = <b>${num(ans)}</b>.`
          : `Without the limit, sharing ${n} among ${k} by stars and bars gives C(${n} + ${k - 1}, ${k - 1}) = C(${n + k - 1}, ${k - 1}) = ${num(terms[0])}. Take away the ways where one chosen ${who} is over the limit, by giving that ${who} ${cap + 1} first and sharing the other ${n - cap - 1} freely, which can happen in C(${n - cap - 1 + k - 1}, ${k - 1}) = ${num(one)} ways for each of the ${k} ${who}s. ${two ? `Two ${who}s can be over the limit at once, in C(${n - 2 * cap - 2 + k - 1}, ${k - 1}) = ${num(two)} way${two === 1 ? '' : 's'} for each of the ${choose(k, 2)} pairs, and those were taken away twice, so add them back.` : `No two ${who}s can be over the limit at once, since 2·${cap + 1} is more than ${n}.`} So the count is ${num(terms[0])} − ${k}·${num(one)}${two ? ` + ${choose(k, 2)}·${num(two)}` : ''} = <b>${num(ans)}</b>.`,
      };
    },
    // identical things in different boxes, with boxes used or left empty
    (d, ctx) => {
      const [kind, k, n] = pickKind(ctx, 'boxes', ['oneEmpty', 'someEmpty', 'more'], [[3, 4, 5], range(8, 14)], (kind, k) => (kind === 'more' ? k <= 4 : true));
      const T = choose(n - 1, k - 1), names = d.shuffle(NAMES).slice(0, k), item = d.pick(ITEMS);
      const ts = range(1, Math.floor((n - k + 2) / 2)), eqWays = ts.map((t) => choose(n - 2 * t - 1, k - 3)), E = total(eqWays);
      const ans = { oneEmpty: k * choose(n - 1, k - 2), someEmpty: choose(n + k - 1, k - 1) - T, more: (T - E) / 2 }[kind];
      const [A, B] = names;
      return {
        topic: 'Stars and bars', rank: { oneEmpty: 7, someEmpty: 7, more: 9 }[kind],
        text: {
          oneEmpty: `${Cap(WORDS[n])} identical balls are dropped into ${WORDS[k]} boxes labelled ${listing(['A', 'B', 'C', 'D', 'E'].slice(0, k))}. In how many of the ways the balls can land is exactly one box left empty?`,
          someEmpty: `${Cap(WORDS[n])} identical ${item} are put into ${WORDS[k]} different jars. In how many ways can this be done so that at least one jar stays empty?`,
          more: `${Cap(WORDS[n])} identical gold coins are shared among ${WORDS[k]} pirates, ${listing(names)}, so that every pirate gets at least one coin and ${A} gets more coins than ${B}. In how many ways can the coins be shared?`,
        }[kind],
        answer: choices(d, ans, {
          oneEmpty: [choose(n - 1, k - 2), k * choose(n + k - 3, k - 2), choose(n + k - 1, k - 1) - T, k * choose(n - 1, k - 1)],
          someEmpty: [choose(n + k - 1, k - 1), T, k * choose(n - 1, k - 2), choose(n + k - 2, k - 1)],
          more: [(T + E) / 2, T - E, T, (choose(n + k - 1, k - 1) - total(range(0, Math.floor(n / 2)).map((t) => choose(n - 2 * t + k - 3, k - 3)))) / 2].filter(Number.isInteger),
        }[kind]),
        check: () => {
          let c = 0;
          const go = (i, left, x) => {
            if (i === k) {
              if (left) return;
              const empty = x.filter((v) => v === 0).length;
              if (kind === 'oneEmpty' ? empty === 1 : kind === 'someEmpty' ? empty >= 1 : empty === 0 && x[0] > x[1]) c++;
              return;
            }
            for (let v = 0; v <= left; v++) go(i + 1, left - v, [...x, v]);
          };
          go(0, n, []);
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        solution: {
          oneEmpty: `First choose the empty box, in ${k} ways. The ${n} balls then fill the other ${k - 1} boxes with none of them empty, so drop one ball into each of those first and share the other ${n - k + 1} freely. That is ${n - k + 1} stars and ${k - 2} bars, C(${n - 1}, ${k - 2}) = ${num(choose(n - 1, k - 2))} ways, so the count is ${k}·${num(choose(n - 1, k - 2))} = <b>${num(ans)}</b>.`,
          someEmpty: `Count the opposite and subtract. With no rule, ${n} stars and ${k - 1} bars give C(${n + k - 1}, ${k - 1}) = ${num(choose(n + k - 1, k - 1))} ways. With no jar empty, put one of the ${item} in each jar first and share the other ${n - k} freely, in C(${n - 1}, ${k - 1}) = ${num(T)} ways. So ${num(choose(n + k - 1, k - 1))} − ${num(T)} = <b>${num(ans)}</b> ways leave a jar empty.`,
          more: `Since every pirate gets a coin, give each one coin first and share the other ${n - k} freely, so all the sharings number C(${n - 1}, ${k - 1}) = ${num(T)}. In those where ${A} and ${B} get the same number t, ${k === 3 ? `the third pirate gets the other ${n} − 2t, at least 1, so t is 1 to ${ts.at(-1)}, which is ${E} ways` : `the other two share ${n} − 2t with at least 1 each, in ${n} − 2t − 1 ways, so for t = 1 to ${ts.at(-1)} there are ${eqWays.join(' + ')} = ${E} such sharings`}. Swapping what ${A} and ${B} get pairs every other sharing where ${A} gets more with one where ${B} gets more, so exactly half of the rest have ${A} ahead, (${num(T)} − ${E})/2 = <b>${num(ans)}</b>.`,
        }[kind],
      };
    },
    // terms of a big power, and other choices with repetition, are solutions of a sum in disguise
    (d, ctx) => {
      const [kind, k, n] = pickKind(ctx, 'terms', ['terms', 'terms1', 'ups', 'gaps'], [[3, 4, 5], range(4, 16)], (kind, k, n) => ({
        terms: n >= 5 && n <= 12, terms1: k <= 4 && n >= 5 && n <= 10, ups: n >= 5 && n <= 9 && n ** k <= 60000, gaps: n >= 12 && n <= 16 && k <= 4,
      })[kind]);
      const vars = ['a', 'b', 'c', 'd', 'e'].slice(0, k), xyz = ['x', 'y', 'z', 'w'].slice(0, k - 1), g = kind === 'gaps' ? (k === 3 ? 3 : 2) : 0, name = d.pick(NAMES);
      const ans = { terms: choose(n + k - 1, k - 1), terms1: choose(n + k - 1, k - 1), ups: choose(n + k - 1, k), gaps: choose(n - (k - 1) * (g - 1), k) }[kind];
      const left = n - k - (k - 1) * (g - 1), shop = d.chance(0.5);
      return {
        topic: 'Stars and bars', rank: { terms: 6, terms1: 7, ups: 7, gaps: 8 }[kind],
        text: {
          terms: `When (${vars.join(' + ')})<sup>${n}</sup> is multiplied out and like terms are combined, how many different terms are there?`,
          terms1: `When (1 + ${xyz.join(' + ')})<sup>${n}</sup> is multiplied out and like terms are combined, how many different terms are there? (The constant term counts.)`,
          ups: shop
            ? `An ice cream shop has ${n} flavors. A cup holds ${k} scoops, any flavors, repeats allowed, and the order of the scoops doesn’t matter. How many different cups can ${name} order?`
            : `How many functions f from {${range(1, k).join(', ')}} to {1, 2, …, ${n}} satisfy ${range(1, k).map((i) => `f(${i})`).join(' ≤ ')}?`,
          gaps: `In how many ways can ${WORDS[k]} numbers be chosen from 1, 2, 3, …, ${n} so that ${g === 2 ? 'no two of the chosen numbers are consecutive' : 'any two of the chosen numbers differ by at least 3'}?`,
        }[kind],
        answer: choices(d, ans, {
          terms: [choose(n + k - 1, k), choose(n + k, k - 1), choose(n + k - 2, k - 1), ...(k ** n <= 5000 ? [k ** n] : [(n + 1) ** (k - 1)])],
          terms1: [choose(n + k - 2, k - 2), ans - 1, (n + 1) ** (k - 1), choose(n + k, k - 1)],
          ups: [choose(n + k - 1, k - 1), choose(n, k), choose(n + k, k), choose(n + k - 2, k)],
          gaps: [choose(n, k), choose(n - k, k), choose(n - (k - 1) * (g - 1) + 1, k), choose(n - k + 1, k - 1)],
        }[kind]),
        check: () => {
          let c = 0;
          if (kind === 'terms' || kind === 'terms1') {
            // multiply out one factor at a time, keeping the different exponent lists
            const v = kind === 'terms' ? k : k - 1;
            let keys = new Set([Array(v).fill(0).join(',')]);
            for (let i = 0; i < n; i++) {
              const next = new Set();
              for (const key of keys) {
                const e = key.split(',').map(Number);
                if (kind === 'terms1') next.add(key);
                for (let j = 0; j < v; j++) next.add(e.map((x, t) => x + (t === j)).join(','));
              }
              keys = next;
            }
            c = keys.size;
          } else if (kind === 'ups') {
            eachString(n, k, (s) => { if (s.every((x, i) => !i || s[i - 1] <= x)) c++; });
          } else {
            for (let mask = 0; mask < 1 << n; mask++) {
              let bits = 0;
              for (let x = mask; x; x &= x - 1) bits++;
              if (bits !== k) continue;
              const chosen = range(0, n - 1).filter((i) => (mask >> i) & 1);
              if (chosen.every((x, i) => !i || x - chosen[i - 1] >= g)) c++;
            }
          }
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        solution: {
          terms: `After combining, each term is ${vars.map((v, i) => `${v}<sup>${'pqrst'[i]}</sup>`).join('')} with whole-number exponents adding up to ${n}, and each such list of exponents does appear. So count the solutions of ${vars.map((_, i) => 'pqrst'[i]).join(' + ')} = ${n} in whole numbers. That is ${n} stars and ${k - 1} bars, C(${n + k - 1}, ${k - 1}) = <b>${num(ans)}</b>.`,
          terms1: `A term is ${xyz.map((v, i) => `${v}<sup>${'pqr'[i]}</sup>`).join('')} with ${xyz.map((_, i) => 'pqr'[i]).join(' + ')} at most ${n}, because the factor 1 is picked from the other brackets. Call the number of 1s picked s, so that ${xyz.map((_, i) => 'pqr'[i]).join(' + ')} + s = ${n} exactly, and every whole-number solution gives a different term. By stars and bars there are C(${n + k - 1}, ${k - 1}) = <b>${num(ans)}</b> terms.`,
          ups: `${shop ? 'A cup' : 'Such an f'} is decided by how many ${shop ? 'scoops are of each flavor' : 'of the inputs go to each value'}, since ${shop ? 'order doesn’t matter' : 'the values must then be listed from smallest to largest'}. So count whole-number solutions of n<sub>1</sub> + n<sub>2</sub> + ⋯ + n<sub>${n}</sub> = ${k}, one count for each ${shop ? 'flavor' : 'value'}. That is ${k} stars and ${n - 1} bars, C(${n + k - 1}, ${n - 1}) = <b>${num(ans)}</b>.`,
          gaps: `Think of the ${n - k} numbers not chosen as stars and the ${k} chosen ones as bars, in order from 1 to ${n}. The stars fall into ${k + 1} gaps, before, between and after the chosen numbers, and each of the ${k - 1} gaps between them needs at least ${g - 1}. Put ${g - 1} star${g > 2 ? 's' : ''} into each inner gap first, which leaves ${left} to share freely among the ${k + 1} gaps, in C(${left + k}, ${k}) = <b>${num(ans)}</b> ways.`,
        }[kind],
      };
    },
  ],

  'Lattice points in a diamond': [
    // flat diamonds: a band between two of them, the inside off the axes, or one tilted and moved
    (d, ctx) => {
      const [kind, p, q] = pickKind(ctx, 'flat', ['ring', 'offaxes', 'square'], [range(2, 15), range(0, 14)], (kind, p, q) => ({
        ring: p <= 6 && q >= 6 && q - p >= 3, offaxes: p >= 6 && q === 0, square: p >= 4 && p <= 10 && q === 0,
      })[kind]);
      const ans = { ring: disk(q) - disk(p - 1), offaxes: 4 * choose(p - 1, 2), square: disk(p) }[kind];
      const [h, k] = d.pick(CENTERS), corners = [pt(h + p, k), pt(h, k + p), pt(h - p, k), pt(h, k - p)];
      const rows = range(-p, p).map((t) => 2 * (p - Math.abs(t)) + 1);
      return {
        topic: 'Lattice points in a diamond', rank: kind === 'offaxes' ? 7 : 6,
        text: {
          ring: `How many points (x, y) with integer coordinates satisfy ${p} ≤ |x| + |y| ≤ ${q}?`,
          offaxes: `How many points with integer coordinates lie strictly inside the square with vertices ${listing([pt(p, 0), pt(0, p), pt(-p, 0), pt(0, -p)])}, but on neither coordinate axis?`,
          square: `How many points with integer coordinates lie inside or on the square with vertices ${listing(corners)}?`,
        }[kind],
        answer: choices(d, ans, {
          ring: [disk(q) - disk(p), disk(q - 1) - disk(p - 1), (2 * q + 1) ** 2 - (2 * p - 1) ** 2, ans + 4 * (q - p + 1)],
          offaxes: [disk(p - 1), 4 * choose(p, 2), 4 * choose(p - 2, 2), ans + 1],
          square: [disk(p) - 4 * p, (2 * p + 1) ** 2, 2 * p * p, disk(p - 1)],
        }[kind]),
        check: () => {
          const c = kind === 'ring' ? lattice(2, q, ([x, y]) => Math.abs(x) + Math.abs(y) >= p && Math.abs(x) + Math.abs(y) <= q)
            : kind === 'offaxes' ? lattice(2, p, ([x, y]) => x && y && Math.abs(x) + Math.abs(y) < p)
              : lattice(2, p, ([x, y]) => {
                // inside or on the square: on the inner side of all four edges, tested with cross products
                const P = [x + h, y + k], V = [[h + p, k], [h, k + p], [h - p, k], [h, k - p]];
                return V.every((A, i) => { const B = V[(i + 1) % 4]; return (B[0] - A[0]) * (P[1] - A[1]) - (B[1] - A[1]) * (P[0] - A[0]) >= 0; });
              });
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        solution: {
          ring: `The points with |x| + |y| = j form a diamond with corners (j, 0), (0, j), (−j, 0) and (0, −j). Each of its four sides runs from one corner to the next through j + 1 points, and the corners are shared, so it holds 4j points. Adding them up for j = ${p} to ${q} gives 4·(${range(p, q).join(' + ')}) = 4·${total(range(p, q))} = <b>${num(ans)}</b>.`,
          offaxes: `By symmetry, count the points in one quarter and multiply by 4. In the quarter where x and y are both positive, a point is strictly inside when x + y &lt; ${p}, that is x + y ≤ ${p - 1}, and for each sum s from 2 to ${p - 1} there are s − 1 such points. That gives 1 + 2 + ⋯ + ${p - 2} = ${choose(p - 1, 2)} points, so there are 4·${choose(p - 1, 2)} = <b>${num(ans)}</b> in all.`,
          square: `The vertices are ${p} units from ${pt(h, k)} straight across and straight up or down, so the square is the diamond ${absShift('x', h)} + ${absShift('y', k)} ≤ ${p}, and moving its center to (0, 0) doesn’t change the count. Counting row by row, the row t units above or below the center (with t from 0 to ${p}) holds 2(${p} − t) + 1 points, from ${2 * p + 1} in the middle down to 1 at the top and the bottom. So the total is ${rows.slice(0, 3).join(' + ')} + ⋯ + ${rows.slice(-3).join(' + ')} = ${2 * p + 1} + 2·(1 + 3 + ⋯ + ${2 * p - 1}) = ${2 * p + 1} + 2·${p * p} = <b>${num(ans)}</b>.`,
        }[kind],
      };
    },
    // the solid diamond |x| + |y| + |z| ≤ n, one flat layer at a time
    (d, ctx) => {
      const [n] = pick(ctx, 'solid', [range(3, 10)]);
      const ans = ball(n), layers = range(0, n).map((t) => disk(n - t)), solid = d.chance(0.5);
      return {
        topic: 'Lattice points in a diamond', rank: 10,
        text: solid
          ? `How many points with integer coordinates lie inside or on the octahedron with vertices ${pt(n, 0, 0)}, ${pt(-n, 0, 0)}, ${pt(0, n, 0)}, ${pt(0, -n, 0)}, ${pt(0, 0, n)} and ${pt(0, 0, -n)}?`
          : `How many points (x, y, z) with integer coordinates satisfy |x| + |y| + |z| ≤ ${n}?`,
        answer: choices(d, ans, [(2 * n + 1) * disk(n), total(layers), sphere(n), (2 * n + 1) ** 3, ans - sphere(n)]),
        check: () => { const c = lattice(3, n, (p) => total(p.map(Math.abs)) <= n); return c === ans ? '' : `counted ${c}, said ${ans}`; },
        solution: `${solid ? `The octahedron is the solid |x| + |y| + |z| ≤ ${n}. Slice it` : `Slice the solid |x| + |y| + |z| ≤ ${n}`} into flat layers by the value of z. In the layer z = t the condition is |x| + |y| ≤ ${n} − |t|, a flat diamond, and a flat diamond |x| + |y| ≤ r holds 2r² + 2r + 1 points (rows of 1, 3, …, 2r + 1, …, 3, 1). The layers t = 0, ±1, ±2, …, ±${n} hold ${shownList(layers)} points, each one but the first twice (for t and −t). So the total is ${num(layers[0])} + 2·(${layers.slice(1).join(' + ')}) = <b>${num(ans)}</b>.`,
      };
    },
    // only the surface |x| + |y| + |z| = n, or only its points off the coordinate planes, or only those on them
    (d, ctx) => {
      const [kind, n] = pickKind(ctx, 'shell', ['surface', 'nonzero', 'planes'], [range(4, 15)], (kind, n) => (kind === 'nonzero' ? n >= 5 : true));
      const in8 = choose(n - 1, 2), ans = { surface: sphere(n), nonzero: 8 * in8, planes: 12 * (n - 1) + 6 }[kind];
      return {
        topic: 'Lattice points in a diamond', rank: { surface: 9, nonzero: 8, planes: 9 }[kind],
        text: {
          surface: `How many points (x, y, z) with integer coordinates satisfy |x| + |y| + |z| = ${n}?`,
          nonzero: `How many points (x, y, z) with integer coordinates satisfy |x| + |y| + |z| = ${n} with none of x, y and z equal to 0?`,
          planes: `How many points (x, y, z) with integer coordinates satisfy |x| + |y| + |z| = ${n} and have at least one of x, y and z equal to 0?`,
        }[kind],
        answer: choices(d, ans, {
          surface: [8 * choose(n + 2, 2), 4 * n * n, 4 * n * n - 4, 4 * n * n + 6],
          nonzero: [8 * choose(n + 2, 2), in8, 8 * choose(n, 2), sphere(n)],
          planes: [12 * n, 12 * (n - 1), 12 * n + 6, sphere(n)],
        }[kind]),
        check: () => {
          const c = lattice(3, n, (p) => total(p.map(Math.abs)) === n && (kind === 'surface' || (kind === 'nonzero') === p.every((v) => v !== 0)));
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        tip: 'Count the absolute values first, with stars and bars, then the choices of signs, sorting the points by how many coordinates are 0.',
        solution: {
          surface: `Sort the points by how many coordinates are 0, and count the absolute values first, then the signs. With no coordinate 0, |x|, |y| and |z| are positive whole numbers adding up to ${n}, which by stars and bars happens in C(${n - 1}, 2) = ${in8} ways, each with 8 sign choices. With exactly one coordinate 0 (3 places for it), the other two absolute values are positive and add up to ${n} in ${n - 1} ways, each with 4 sign choices, which gives 12·${n - 1}; with two coordinates 0, the third is ±${n}, which gives 6 points. In all, 8·${in8} + 12·${n - 1} + 6 = <b>${num(ans)}</b>.`,
          nonzero: `Count the absolute values first, then the signs. With a = |x|, b = |y| and c = |z|, we need positive whole numbers with a + b + c = ${n}, which is choosing 2 of the ${n - 1} gaps between ${n} stars, C(${n - 1}, 2) = ${in8} ways. Each of those gives 2·2·2 = 8 points, one for each choice of signs, so there are 8·${in8} = <b>${num(ans)}</b>.`,
          planes: `Sort the points by how many coordinates are 0. With exactly one coordinate 0 (3 places for it), the other two absolute values are positive whole numbers adding up to ${n}, in ${n - 1} ways, and each has 4 sign choices, which gives 3·4·${n - 1} = ${12 * (n - 1)}. With two coordinates 0, the third is ${n} or −${n}, in one of 3 places, which gives 6 points. So there are ${12 * (n - 1)} + 6 = <b>${num(ans)}</b>.`,
        }[kind],
      };
    },
    // a skewed diamond (one coordinate counts double), or the points a walker can end at after exactly n moves
    (d, ctx) => {
      const [kind, n] = pickKind(ctx, 'skew', ['skew2', 'skew3', 'walk2', 'walk3'], [range(3, 15)], (kind, n) => ({
        skew2: n >= 6, skew3: n >= 4 && n <= 9, walk2: n >= 6, walk3: n <= 8,
      })[kind]);
      const half = Math.floor(n / 2), same = range(0, n).filter((j) => (j - n) % 2 === 0);
      const rows = range(0, half).map((t) => 2 * (n - 2 * t) + 1), slabs = range(0, half).map((t) => disk(n - 2 * t));
      const ans = { skew2: n * n + n + 1, skew3: slabs[0] + 2 * total(slabs.slice(1)), walk2: (n + 1) ** 2, walk3: total(same.map(sphere)) }[kind];
      const who = d.pick(['A robot', 'A beetle', 'A game piece']);
      return {
        topic: 'Lattice points in a diamond', rank: { skew2: 8, skew3: 10, walk2: 8, walk3: 10 }[kind],
        text: {
          skew2: `How many points (x, y) with integer coordinates satisfy |x| + 2|y| ≤ ${n}?`,
          skew3: `How many points (x, y, z) with integer coordinates satisfy |x| + |y| + 2|z| ≤ ${n}?`,
          walk2: `${who} starts at the origin of a coordinate grid and makes exactly ${n} moves, each one unit up, down, left or right. At how many different points can it finish?`,
          walk3: `A drone starts at the origin and makes exactly ${n} moves, each one unit along the x-, y- or z-axis, in either direction. At how many different points can it finish?`,
        }[kind],
        answer: choices(d, ans, {
          skew2: [disk(n), n * n + n, (n + 1) ** 2, n * n + 1],
          skew3: [ball(n), total(slabs), range(-half, half).reduce((s, t) => s + disk(n - Math.abs(t)), 0), (2 * half + 1) * disk(n)],
          walk2: [disk(n), 4 * n, n * n],
          walk3: [ball(n), sphere(n), (n + 1) ** 3, ans - same.filter((j) => j > 0).length * 2],
        }[kind]),
        check: () => {
          const c = kind === 'skew2' ? lattice(2, n, ([x, y]) => Math.abs(x) + 2 * Math.abs(y) <= n)
            : kind === 'skew3' ? lattice(3, n, ([x, y, z]) => Math.abs(x) + Math.abs(y) + 2 * Math.abs(z) <= n)
              : walkEnds(kind === 'walk2' ? 2 : 3, n);
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        solution: {
          skew2: `In each row y = t the condition is |x| ≤ ${n} − 2|t|, which needs |t| ≤ ${half} and then allows 2(${n} − 2|t|) + 1 values of x. The rows t = 0, ±1, …, ±${half} hold ${rows.join(', ')} points, each one but the first twice (for t and −t). So the total is ${rows[0]} + 2·(${rows.slice(1).join(' + ')}) = <b>${num(ans)}</b>.`,
          skew3: `Slice into flat layers by the value of z. In the layer z = t the condition is |x| + |y| ≤ ${n} − 2|t|, a flat diamond, which needs |t| ≤ ${half}, and a flat diamond |x| + |y| ≤ r holds 2r² + 2r + 1 points. The layers t = 0, ±1, …, ±${half} hold ${slabs.join(', ')} points, each one but the first twice. So the total is ${slabs[0]} + 2·(${slabs.slice(1).join(' + ')}) = <b>${num(ans)}</b>.`,
          walk2: `Each move changes x + y by 1, so after ${n} moves x + y is ${n % 2 ? 'odd' : 'even'}, like ${n}, and the walker is at most ${n} moves from the start, so |x| + |y| ≤ ${n}. Every such point can be reached, by walking straight there in |x| + |y| moves and spending the spare moves going back and forth. The points with |x| + |y| = j number 4j (just 1 for j = 0), so adding them for j = ${listing(same)} gives ${same.map((j) => (j ? 4 * j : 1)).join(' + ')} = <b>${num(ans)}</b>.`,
          walk3: `Each move changes x + y + z by 1, so after ${n} moves |x| + |y| + |z| is ${n % 2 ? 'odd' : 'even'}, like ${n}, and at most ${n}; every such point can be reached by going straight there and spending the spare moves back and forth. The points with |x| + |y| + |z| = j number 4j² + 2 for j ≥ 1 (8·C(j − 1, 2) with no coordinate 0, 12(j − 1) with one, and 6 with two), and 1 for j = 0. Adding them for j = ${listing(same)} gives ${same.map(sphere).join(' + ')} = <b>${num(ans)}</b>.`,
        }[kind],
      };
    },
  ],

  'Coloring a ring': [
    // a row against a ring: the extra rows are exactly those whose two ends match
    (d, ctx) => {
      const [n, k] = pick(ctx, 'row', [range(5, 9), [3, 4, 5]], (n, k) => k * (k - 1) ** (n - 1) <= 30000);
      const P = k * (k - 1) ** (n - 1), ans = R(k, n - 1), name = d.pick(NAMES), beads = d.chance(0.5);
      return {
        topic: 'Coloring a ring', rank: k === 3 ? 10 : 11,
        text: beads
          ? `${name} threads ${n} beads, each one of ${k} colors, so that beads next to each other always differ in color. How many more ways are there to do this on an open string, with two loose ends, than on a closed loop, where the last bead also touches the first? (The beads sit in places 1 to ${n}, so turning the loop gives a different coloring.)`
          : `A potter glazes ${n} tiles laid in a straight row, giving each tile one of ${k} glazes so that tiles side by side never get the same glaze. Another ${n} tiles are laid in a ring, where each tile touches the two beside it, and are glazed by the same rule. Both are shown, with the tiles numbered. How many more ways are there to glaze the row than the ring?`,
        figure: beads ? undefined : rowAndRing(n),
        answer: choices(d, ans, [R(k, n), P, (k - 1) ** (n - 1), k * (k - 1) ** (n - 2)]),
        check: () => {
          let row = 0, ring = 0;
          eachColoring(n, k, ringEdges(n).slice(0, n - 1), (col) => { row++; if (col[0] !== col[n - 1]) ring++; });
          return row - ring === ans && ring === R(k, n) ? '' : `counted ${row} − ${ring}, said ${ans}`;
        },
        solution: `Color the row from one end, with ${k} choices for the first ${beads ? 'bead' : 'tile'} and ${k - 1} for each of the others, ${k}·${k - 1}<sup>${n - 1}</sup> = ${num(P)} ways. A good ring is just a good row whose two ends also differ, so the extra rows are exactly the good rows whose first and last ${beads ? 'beads' : 'tiles'} match. Glue those two matching ends into one, and what is left is a good ring of ${n - 1}; every good ring of ${n - 1} comes from exactly one such row. A ring of m with c colors, neighbors different, can be colored (c − 1)<sup>m</sup> + (−1)<sup>m</sup>(c − 1) ways, so the difference is ${ringShown(k, n - 1)} = <b>${num(ans)}</b>.`,
      };
    },
    // a color that may be used at most once (or exactly once)
    (d, ctx) => {
      const [n, k, exactly] = pick(ctx, 'once', [range(5, 8), [4, 5], [false, true]], (n, k) => k * (k - 1) ** (n - 1) <= 25000);
      const one = (k - 1) * (k - 2) ** (n - 2), ans = (exactly ? 0 : R(k - 1, n)) + n * one, flavor = d.pick(['chocolate', 'raspberry', 'pistachio']);
      return {
        topic: 'Coloring a ring', rank: 13,
        text: `A round cake is cut into ${n} wedges, as shown. Each wedge is iced with one of ${k} flavors, one of them ${flavor}, so that wedges that share a cut get different flavors. There is only enough ${flavor} icing for one wedge, so ${exactly ? 'exactly one wedge is' : 'at most one wedge may be'} ${flavor}. How many icings are possible? (Turning the cake gives a different icing.)`,
        figure: svg(320, 260, `A round cake cut into ${n} wedges`, roundParts(n, [160, 130], 0, 112)),
        answer: choices(d, ans, exactly
          ? [one, n * R(k - 1, n - 1), n * (k - 1) ** (n - 1), R(k, n) - R(k - 1, n)]
          : [R(k, n), R(k - 1, n), n * one, R(k - 1, n) + n * R(k - 1, n - 1)]),
        check: () => {
          let c = 0;
          eachColoring(n, k, ringEdges(n), (col) => { const used = col.filter((v) => v === 0).length; if (exactly ? used === 1 : used <= 1) c++; });
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        solution: exactly
          ? `First choose the ${flavor} wedge, in ${n} ways. The other ${n - 1} wedges form a row whose two end wedges both touch the ${flavor} one, but none of them may be ${flavor} anyway, so the only rule left is that neighbors in the row differ, using the other ${k - 1} flavors. Ice the row from one end, with ${k - 1} choices for the first wedge and then ${k - 2} for each of the next ${n - 2}, which gives ${k - 1}·${k - 2}<sup>${n - 2}</sup> = ${num(one)}. In all, ${n}·${num(one)} = <b>${num(ans)}</b>.`
          : `Split on whether ${flavor} is used. Without it, the ${n} wedges form a ring iced with the other ${k - 1} flavors, and a ring of m with c flavors, neighbors different, can be iced (c − 1)<sup>m</sup> + (−1)<sup>m</sup>(c − 1) ways, here ${ringShown(k - 1, n)} = ${num(R(k - 1, n))}. With ${flavor} on one wedge (${n} choices), the other ${n - 1} wedges form a row that may not use ${flavor}, so the row is iced in ${k - 1}·${k - 2}<sup>${n - 2}</sup> = ${num(one)} ways. In all, ${num(R(k - 1, n))} + ${n}·${num(one)} = <b>${num(ans)}</b>.`,
      };
    },
    // a window: a middle disk and an outer rim both touch every pane of the ring, but not each other
    (d, ctx) => {
      const [n, k] = pick(ctx, 'window', [range(4, 7), [4, 5, 6]], (n, k) => n <= 11 - k);
      const same = R(k - 1, n), diff = R(k - 2, n), ans = k * same + k * (k - 1) * diff;
      return {
        topic: 'Coloring a ring', rank: 14,
        text: `A round stained-glass window has a small disk in the middle, a ring of ${n} panes around it and an outer rim, as shown. Each pane touches the disk, the rim and the two panes beside it, but the disk and the rim do not touch each other. Each of the ${n + 2} pieces gets one of ${k} colors so that pieces that touch get different colors. How many colorings are possible?`,
        figure: svg(320, 270, `A round window: a middle disk, a ring of ${n} panes and an outer rim`, roundParts(n, [160, 135], 44, 92, { r3: 122 })),
        answer: choices(d, ans, [k * (k - 1) * diff, k * same, k * (k - 1) * (k - 2) ** (n - 1) + k * (k - 1) * (k - 2) * (k - 3) ** (n - 1), k * k * diff, k * (k - 1) * same]),
        check: () => {
          let c = 0;
          const edges = [...ringEdges(n, 2), ...range(2, n + 1).flatMap((i) => [[0, i], [1, i]])];   // 0 the disk, 1 the rim, 2 … n + 1 the panes
          eachColoring(n + 2, k, edges, () => { c++; });
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        solution: `The disk and the rim each touch every pane but not each other, so split on whether they get the same color. Either way the panes form a ring that must avoid the colors of the disk and the rim, and a ring of m with c colors, neighbors different, can be colored (c − 1)<sup>m</sup> + (−1)<sup>m</sup>(c − 1) ways. If the disk and the rim match (${k} ways), the panes use the other ${k - 1} colors, in ${ringShown(k - 1, n)} = ${num(same)} ways. If they differ (${k}·${k - 1} = ${k * (k - 1)} ways), the panes use the other ${k - 2} colors, in ${ringShown(k - 2, n)} = ${num(diff)} ways${diff ? '' : ` (${k - 2} colors can’t go around an odd ring)`}. In all, ${k}·${num(same)} + ${k * (k - 1)}·${num(diff)} = <b>${num(ans)}</b>.`,
      };
    },
    // no color more than n/2 − 1 times on an even ring: only every other piece can hold a color n/2 times
    (d, ctx) => {
      const [n, k] = pick(ctx, 'limit', [[6, 8, 10], [3, 4, 5, 6]], (n, k) => R(k, n) - 2 * k * (k - 1) ** (n / 2) + k * (k - 1) <= 20000);
      const h = n / 2, all = R(k, n), once = 2 * (k - 1) ** h, ans = all - k * once + k * (k - 1);
      return {
        topic: 'Coloring a ring', rank: 13,
        text: `A round tray is divided into ${n} wedges, as shown. Each wedge is filled with one of ${k} kinds of candy so that wedges that share a side hold different kinds, and no kind may fill more than ${WORDS[h - 1]} wedges. How many fillings are possible? (Turning the tray gives a different filling.)`,
        figure: svg(320, 260, `A round tray divided into ${n} wedges`, roundParts(n, [160, 130], 0, 112)),
        answer: choices(d, ans, [all, all - k * once, all - (k * once) / 2, all - k * once + (k * (k - 1)) / 2]),
        check: () => {
          let c = 0;
          eachColoring(n, k, ringEdges(n), (col) => { if (range(0, k - 1).every((v) => col.filter((x) => x === v).length < h)) c++; });
          return c === ans ? '' : `counted ${c}, said ${ans}`;
        },
        solution: `Count all the good fillings, then take away the ones that use a kind too often. A ring of m with c kinds, neighbors different, can be filled (c − 1)<sup>m</sup> + (−1)<sup>m</sup>(c − 1) ways, here ${ringShown(k, n)} = ${num(all)}. Since neighbors differ, a kind can fill at most every other wedge, so it fills ${h} wedges only by taking all the odd-numbered wedges or all the even-numbered ones. Then each of the other ${h} wedges touches only that kind and can hold any of the other ${k - 1}, which gives 2·${k - 1}<sup>${h}</sup> = ${num(once)} fillings for each of the ${k} kinds. A filling where two kinds both fill ${h} wedges, one on the odd wedges and one on the even, was taken away twice, and there are ${k}·${k - 1} = ${k * (k - 1)} of those, so add them back. That leaves ${num(all)} − ${k}·${num(once)} + ${k * (k - 1)} = <b>${num(ans)}</b>.`,
      };
    },
  ],

  'Pigeonhole': [
    // socks and gloves drawn in the dark: the worst luck, then one more
    (d, ctx) => {
      const [kind, c, k] = pickKind(ctx, 'socks', ['pairs', 'same', 'gloves'], [[3, 4, 5], [1, 2, 3, 4, 5, 6]], (kind, c, k) => ({
        pairs: k >= 2, same: c <= 4 && k >= 2 && k <= 3, gloves: c <= 4 && k <= 2,
      })[kind]);
      const name = d.pick(NAMES), colors = d.shuffle(COLORS).slice(0, c);
      const have = {
        pairs: [[12, 9, 7], [10, 8, 6, 5], [9, 8, 6, 5, 4]][c - 3],
        same: c === 3 ? [11, 2 * k - 2, 3] : [10, 2 * k, 2, 2 * k - 1],
        gloves: c === 3 ? (k === 1 ? [5, 3, 2] : [4, 4, 3]) : (k === 1 ? [4, 3, 2, 2] : [3, 3, 2, 1]),
      }[kind];
      const P = total(have), ans = { pairs: 2 * k + c - 1, same: total(have.map((a) => Math.min(a, 2 * k - 1))) + 1, gloves: P + 1 }[kind];
      const what = (a, col, thing) => `${WORDS[a]} ${col} ${thing}${a === 1 ? '' : 's'}`;
      return {
        topic: 'Pigeonhole', rank: { pairs: 5, same: 6, gloves: 7 }[kind],
        text: kind === 'gloves'
          ? `A box holds ${listing(have.map((a, i) => what(a, colors[i], 'pair')))} of gloves, each pair a left glove and a right glove. In the dark, ${name} takes gloves out one at a time. How many must ${name} take to be sure of having a left glove and a right glove of the same color?`
          : `A drawer holds ${listing(have.map((a, i) => what(a, colors[i], 'sock')))}. In the dark, ${name} takes socks out one at a time. How many must ${name} take to be sure of having ${kind === 'pairs' ? `${WORDS[k]} pairs (a pair is two socks of the same color, and different pairs may be different colors)` : `${WORDS[2 * k]} socks of the same color (${WORDS[k]} pairs of one color)`}?`,
        answer: choices(d, ans, {
          pairs: [2 * k + c - 2, 2 * k + c, k * (c + 1), 2 * k + 1],
          same: [c * (2 * k - 1) + 1, ans - 1, 2 * k + c - 1, total(have.map((a) => Math.min(a, 2 * k))) + 1],
          gloves: [P, c + 1, 2 * P, P + c],
        }[kind]),
        check: () => {
          const amounts = kind === 'gloves' ? have.flatMap((a) => [a, a]) : have;
          const goal = {
            pairs: (x) => total(x.map((v) => Math.floor(v / 2))) >= k,
            same: (x) => x.some((v) => v >= 2 * k),
            gloves: (x) => range(0, c - 1).some((i) => x[2 * i] && x[2 * i + 1]),
          }[kind];
          const worst = worstTake(amounts, goal);
          return worst + 1 === ans && ans <= total(amounts) ? '' : `the worst take is ${worst}, said ${ans}`;
        },
        solution: {
          pairs: `Look at the worst luck, the most socks ${name} can take while still having only ${k - 1} pair${k === 2 ? '' : 's'}. Each color can add at most one sock that isn’t in a pair, so such a handful has at most ${2 * (k - 1)} socks in pairs and ${c} odd socks, ${2 * (k - 1) + c} in all; and that can happen, with ${k - 1} pair${k === 2 ? '' : 's'} and one odd sock of each color. The next sock matches one of the odd socks, so any ${ans} socks hold ${k} pairs, and the answer is <b>${ans}</b>.`,
          same: `To have ${k} pairs of one color, ${name} needs ${2 * k} socks of that color. The worst luck takes ${2 * k - 1} socks of every color that has that many, and all the socks of any color that has fewer, which is ${have.map((a) => Math.min(a, 2 * k - 1)).join(' + ')} = ${ans - 1} socks with no color reaching ${2 * k}. Every sock left is of a color that already has ${2 * k - 1} out, so the next one completes it, and the answer is <b>${ans}</b>.`,
          gloves: `A matching pair needs a left and a right glove of one color, so the worst luck takes gloves of only one hand in each color, up to ${listing(have)} of the ${listing(colors)} ones, which is ${P} gloves with no match. That can happen, so ${P} gloves are not enough. With ${P + 1} gloves some color has more gloves out than it has left gloves (or right gloves), so it has both hands, and the answer is <b>${ans}</b>.`,
        }[kind],
      };
    },
    // whole numbers from 1 to N: two with a given sum, a given difference, or a sum divisible by m
    (d, ctx) => {
      const [kind, N, v] = pickKind(ctx, 'nums', ['sum', 'diff', 'mult'], [[20, 24, 30, 36, 40], range(3, 30)], (kind, N, v) => ({
        sum: v >= 5 && v <= Math.floor(N / 2), diff: v <= 7 && N / v <= 12, mult: v >= 5 && v <= 9,
      })[kind]);
      const S = N + v, p = Math.ceil(S / 2) - 1 - (S - N) + 1, alone = N - 2 * p;
      const chains = range(1, v).map((r) => Math.floor((N - r) / v) + 1), safeDiff = total(chains.map((L) => Math.ceil(L / 2)));
      const cnt = range(0, v - 1).map((r) => range(1, N).filter((x) => x % v === r).length);
      const sides = range(1, Math.floor((v - 1) / 2)).map((r) => Math.max(cnt[r], cnt[v - r]));
      const safeMult = total(sides) + (cnt[0] ? 1 : 0) + (v % 2 === 0 && cnt[v / 2] ? 1 : 0);
      const safe = { sum: N - p, diff: safeDiff, mult: safeMult }[kind], ans = safe + 1;
      return {
        topic: 'Pigeonhole', rank: kind === 'sum' ? 8 : 9,
        text: `What is the least number of different integers that must be chosen from 1, 2, 3, …, ${N} to be sure that two of the chosen numbers ${{ sum: `add up to ${S}`, diff: `differ by exactly ${v}`, mult: `have a sum divisible by ${v}` }[kind]}?`,
        answer: choices(d, ans, {
          sum: [p + 1, N / 2 + 1, N - p, N - p + 2],
          diff: [N / 2 + 1, v + 1, ans - 1, ans + 1],
          mult: [v + 1, ans - 1, ans + 1, N / 2 + 1, ans + cnt[0] - 1],
        }[kind]),
        check: () => {
          const clash = { sum: (a, b) => a !== b && a + b === S, diff: (a, b) => Math.abs(a - b) === v, mult: (a, b) => a !== b && (a + b) % v === 0 }[kind];
          const most = mostApart(range(1, N), clash);
          return most + 1 === ans ? '' : `the largest safe set has ${most}, said ${ans}`;
        },
        solution: {
          sum: `The numbers from 1 to ${N} that pair up to make ${S} are ${S - N} + ${N}, ${S - N + 1} + ${N - 1}, …, ${Math.ceil(S / 2) - 1} + ${S - Math.ceil(S / 2) + 1}, which makes ${p} pairs. The other ${alone} numbers (1 to ${S - N - 1}${S % 2 ? '' : `, and ${S / 2}, which would need itself`}) have no partner, so all of them can be chosen together with one number from each pair, which gives ${N - p} numbers with no two adding up to ${S}. Any ${N - p + 1} numbers, though, fall into only ${N - p} boxes (the ${p} pairs and the ${alone} loners), so two land in the same pair, and the answer is <b>${ans}</b>.`,
          diff: `Split 1 to ${N} into ${v} chains of numbers ${v} apart, one for each remainder (${range(1, 2).map((r) => `${r}, ${r + v}, ${r + 2 * v}, …`).join(' and ')} and so on), with ${listing(chains)} numbers. Two numbers differ by exactly ${v} only when they are next to each other in a chain, and from a chain of L numbers you can take at most ⌈L/2⌉ with no two next to each other (every other one). So at most ${chains.map((L) => Math.ceil(L / 2)).join(' + ')} = ${safe} numbers avoid a difference of ${v}, and taking every other number of each chain shows that ${safe} is possible. One more always makes a difference of ${v}, so the answer is <b>${ans}</b>.`,
          mult: `Sort the numbers by their remainder when divided by ${v}. Two of them have a sum divisible by ${v} when their remainders are r and ${v} − r, or both 0${v % 2 ? '' : `, or both ${v / 2}`}. So a safe choice takes at most one number with remainder 0${v % 2 ? '' : ` and at most one with remainder ${v / 2}`}, and from each pair of remainders r and ${v} − r it uses only one side, best the bigger one. With ${range(0, v - 1).map((r) => `${cnt[r]} numbers of remainder ${r}`).slice(0, 3).join(', ')} and so on, the most is ${[...sides, ...(cnt[0] ? [1] : []), ...(v % 2 === 0 && cnt[v / 2] ? [1] : [])].join(' + ')} = ${safe}. One more number forces a pair, so the answer is <b>${ans}</b>.`,
        }[kind],
      };
    },
    // birthdays and other labels: how many people make sure that k share one
    (d, ctx) => {
      const [kind, h, k] = pickKind(ctx, 'crowd', ['forward', 'reverse', 'two', 'leap'], [[7, 12, 26, 31], range(2, 8)], (kind, h, k) => ({
        forward: k >= 3 && (h <= 12 || k <= 4), reverse: h === 12 || h === 7, two: h === 12 && k <= 3, leap: h === 7 && k <= 4,
      })[kind]);
      const boxes = kind === 'two' ? 84 : kind === 'leap' ? 366 : h;
      const N = kind === 'reverse' ? h * (k + 2) + 1 + ((k * 5) % (h - 1)) : 0;
      const ans = kind === 'reverse' ? Math.ceil(N / h) : boxes * (k - 1) + 1;
      const label = { 7: ['were born on the same day of the week', 'days of the week'], 12: ['were born in the same month', 'months'], 26: ['have first names that start with the same letter (from A to Z)', 'letters'], 31: ['were born on the same day of a month (the 1st to the 31st)', 'days of a month'] }[h];
      return {
        topic: 'Pigeonhole', rank: kind === 'two' || kind === 'leap' ? 3 : 2,
        text: {
          forward: `What is the least number of people that must be in a room to be sure that at least ${k} of them ${label[0]}?`,
          reverse: `A school has ${N} students. What is the largest number n for which you can be sure that at least n of the students ${label[0]}?`,
          two: `What is the least number of people that must be in a room to be sure that at least ${k} of them were born in the same month and on the same day of the week?`,
          leap: `What is the least number of people that must be in a room to be sure that at least ${k} of them have the same birthday (month and day)? Count February 29 as a possible birthday.`,
        }[kind],
        answer: choices(d, ans, {
          forward: [h * (k - 1), h * k, h * k + 1, h + k],
          reverse: [ans - 1, ans + 1, ans + 2, h],
          two: [84 * (k - 1), 84 * k + 1, 19 * (k - 1) + 1, 12 * (k - 1) + 1],
          leap: [365 * (k - 1) + 1, 366 * (k - 1), 366 * k + 1, 365 * k + 1],
        }[kind]),
        check: () => {
          // the worst case played out: the largest crowd with at most k − 1 in every box (or the smallest biggest box for N)
          if (kind === 'reverse') { let t = 1; while (!reachable(h, t, N).has(N)) t++; return t === ans ? '' : `the smallest possible biggest box is ${t}, said ${ans}`; }
          const most = Math.max(...reachable(boxes, k - 1, boxes * k));
          return most + 1 === ans ? '' : `the largest crowd with no ${k} together is ${most}, said ${ans}`;
        },
        solution: kind === 'reverse'
          ? `Think of the ${h} ${label[1]} as boxes and the students as things put in them. Spreading ${N} students as evenly as possible gives ${N} = ${h}·${Math.floor(N / h)} + ${N % h}, so ${N % h === 1 ? `one of the ${label[1]} gets` : `${N % h} ${label[1]} get`} ${ans} students and the rest ${ans - 1}, and nobody can be sure of more than ${ans}. On the other hand, if every box had at most ${ans - 1}, there would be at most ${h}·${ans - 1} = ${h * (ans - 1)} students, fewer than ${N}. So some box always has at least ${ans}, and the answer is <b>${ans}</b>.`
          : `${{ forward: `Think of the ${h} ${label[1]} as boxes and the people as things put in them.`, two: 'Each person falls into one of 12·7 = 84 boxes, one for each month and day of the week together.', leap: 'Counting February 29, there are 366 possible birthdays, and those are the boxes.' }[kind]} With ${k - 1} ${k === 2 ? 'person' : 'people'} in every box, ${boxes}·${k - 1} = ${num(boxes * (k - 1))} people can avoid having ${k} in the same box, so ${num(boxes * (k - 1))} are not enough. With one more, the boxes can’t all hold ${k - 1} or fewer, so some box has at least ${k}, and the answer is <b>${num(ans)}</b>.`,
      };
    },
    // points: in a square, on a circular track, or with integer coordinates and an integer midpoint
    (d, ctx) => {
      const [kind, a, b] = pickKind(ctx, 'points', ['square', 'track', 'midpoint'], [range(2, 12), range(0, 9)], (kind, a, b) => ({
        square: (b === 2 || b === 3) && a % b === 0, track: b <= 4 && a >= 4 && a <= 9, midpoint: a <= 3 && b <= 1,
      })[kind]);
      const C = [360, 400, 480, 500, 600][b % 5], L = [24, 30, 32, 40, 45, 48, 50, 60, 75, 36][a], strict = kind === 'track' && a % 2 === 0;
      let ans = 0, text = '', solution = '', rank = 6, wrongs = [], check;
      if (kind === 'square') {
        const m = b, s = a, dist = surd(s / m, 2)[1];
        ans = m * m + 1;
        text = `What is the least number of points that must be placed inside or on a square of side ${s} to be sure that two of them are at most ${dist} apart?`;
        wrongs = [m * m, m * m + 2, (m + 1) ** 2, (m + 1) ** 2 + 1];
        solution = `Cut the square into ${m}·${m} = ${m * m} small squares of side ${s / m}; each has diagonal ${dist}, so two points in the same small square, edges included, are at most ${dist} apart. With ${ans} points, two must share a small square, by the pigeonhole principle. But ${m * m} points can be spread out, since ${m === 2 ? `the four corners are at least ${s} apart` : `the nine points of a 3 × 3 grid with spacing ${s / 2} are at least ${s / 2} apart`}, which is more than ${dist}. So the answer is <b>${ans}</b>.`;
        check = () => {
          const spots = range(0, m - 1).flatMap((i) => range(0, m - 1).map((j) => [(i * s) / (m - 1), (j * s) / (m - 1)]));
          const far = spots.every((p, i) => spots.slice(i + 1).every((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) > (s * Math.SQRT2) / m + 1e-9));
          const small = Math.hypot(s / m, s / m) <= (s * Math.SQRT2) / m + 1e-9;
          return far && small && spots.length + 1 === ans ? '' : 'the spread-out points or the small squares do not work';
        };
      } else if (kind === 'track') {
        ans = strict ? Math.floor(C / L) + 1 : Math.ceil(C / L);
        const q = ans - 1, whole = C % L === 0;
        rank = whole ? 7 : 6;
        text = `A circular running track is ${C} meters around. Some flags are planted on the track. What is the least number of flags that guarantees that two of them are ${strict ? 'less than' : 'at most'} ${L} meters apart, measured along the track?`;
        wrongs = [ans - 1, ans + 1, Math.floor(C / L), Math.ceil(C / L) + 1, Math.round(C / L)];
        solution = `If ${q} flags are spaced evenly, every gap between neighboring flags is ${frac(C, q)} meters, which is ${strict ? 'not less than' : 'more than'} ${L}, so ${q} flags are not enough. With ${ans} flags, the ${ans} gaps around the track add up to ${C} meters, so the smallest gap is at most ${frac(C, ans)} meters. That is ${strict ? 'less than' : 'at most'} ${L}${whole ? ` (the ${strict ? 'strict' : 'equal'} case is what makes the difference here)` : ''}, so the answer is <b>${ans}</b>.`;
        check = () => {
          // place flags one centimeter at a time, each as soon as it is far enough from the one before, and see how many fit
          const step = strict ? L * 100 : L * 100 + 1, around = C * 100;
          let flags = 1;
          while ((flags + 1) * step <= around) flags++;
          return flags + 1 === ans ? '' : `${flags} flags fit, said ${ans}`;
        };
      } else {
        const dim = a === 2 || a === 3 ? a : 2, even = b === 1, boxes = 2 ** (dim - (even ? 1 : 0));
        ans = boxes + 1;
        rank = even ? 7 : 6;
        const space = dim === 2 ? (even ? 'points (x, y) with integer coordinates and x + y even' : 'points (x, y) in the plane with integer coordinates')
          : (even ? 'points (x, y, z) with integer coordinates and x + y + z even' : 'points (x, y, z) in space with integer coordinates');
        text = `What is the least number of ${space} that guarantees that some two of them have a midpoint whose coordinates are all integers?`;
        wrongs = dim === 2 ? (even ? [5, 2, 4, 9] : [4, 6, 9, 3]) : (even ? [9, 4, 6, 8] : [8, 10, 27, 7]);
        const examples = dim === 2 ? (even ? '(0, 0) and (1, 1)' : '(0, 0), (1, 0), (0, 1) and (1, 1)') : (even ? '(0, 0, 0), (1, 1, 0), (1, 0, 1) and (0, 1, 1)' : 'the eight corners of a unit cube');
        solution = `The midpoint of two points with integer coordinates has integer coordinates exactly when each pair of matching coordinates are both even or both odd. So sort the points by the pattern of odd and even in their coordinates; there are ${2 ** dim} patterns${even ? `, but an even sum leaves only ${boxes} of them` : ''}, and those are the boxes. ${ans} points put two in the same box, which gives an integer midpoint, while one point of each pattern, like ${examples}, gives none. So the answer is <b>${ans}</b>.`;
        check = () => {
          const pts = [];
          for (let code = 0; code < 3 ** dim; code++) { const p = range(0, dim - 1).map((i) => Math.floor(code / 3 ** i) % 3); if (!even || total(p) % 2 === 0) pts.push(p.join(',')); }
          const most = mostApart(pts, (u, w) => u !== w && u.split(',').every((x, i) => (+x + +w.split(',')[i]) % 2 === 0));
          return most + 1 === ans ? '' : `the largest set with no integer midpoint has ${most}, said ${ans}`;
        };
      }
      return { topic: 'Pigeonhole', rank, text, answer: choices(d, ans, wrongs), check, solution };
    },
  ],

  'Binomial coefficients': [
    // one coefficient of (ax + b)^n, or the c that makes two neighboring coefficients of (x + c)^n equal
    (d, ctx) => {
      const [kind, a, b, n, k] = pickKind(ctx, 'coef', ['coef', 'equal'], [[1, 2, 3], [-3, -2, -1, 1, 2, 3], range(5, 10), range(1, 8)], (kind, a, b, n, k) => (kind === 'equal'
        ? a === 1 && b === 1 && k <= n - 2 && gcd(n - k, k + 1) !== n - k
        : k >= 2 && k <= n - 2 && Math.abs(choose(n, k) * a ** k * b ** (n - k)) < 1e5 && a !== Math.abs(b) && (a > 1 || 2 * k !== n)));
      if (kind === 'equal') {
        const c = [(n - k) / gcd(n - k, k + 1), (k + 1) / gcd(n - k, k + 1)];
        return {
          topic: 'Binomial coefficients', rank: 6,
          text: `For a certain positive number c, the coefficients of ${xPow(k)} and ${xPow(k + 1)} in the expansion of (x + c)<sup>${n}</sup> are equal. What is c?`,
          answer: choices(d, c, [[k + 1, n - k], [n - k - 1, k + 1], [k, n - k], [n - k, k], [1, 1]], showFrac),
          check: () => {
            // (x + p/q)^n is (qx + p)^n divided by q^n, so the two coefficients are equal when those of (qx + p)^n are
            const poly = expand([[1, c[1]], [0, c[0]]], n);
            return coefOf(poly, k) === coefOf(poly, k + 1) ? '' : `the coefficients are ${coefOf(poly, k)} and ${coefOf(poly, k + 1)}`;
          },
          solution: `The term with ${xPow(k)} is C(${n}, ${k})·c<sup>${n - k}</sup>·${xPow(k)}, and the term with ${xPow(k + 1)} is C(${n}, ${k + 1})·c<sup>${n - k - 1}</sup>·${xPow(k + 1)}. Setting the coefficients equal and dividing by c<sup>${n - k - 1}</sup> gives C(${n}, ${k})·c = C(${n}, ${k + 1}), so c = C(${n}, ${k + 1})/C(${n}, ${k}) = ${choose(n, k + 1)}/${choose(n, k)}. That ratio is always (${n} − ${k})/(${k} + 1), and here it is <b>${showFrac(c)}</b>.`,
        };
      }
      const ans = choose(n, k) * a ** k * b ** (n - k), poly = `${term(a, 1)} ${plusMinus(b, Math.abs(b))}`;
      return {
        topic: 'Binomial coefficients', rank: b < 0 ? 4 : 3,
        text: `What is the coefficient of ${xPow(k)} in the expansion of (${poly})<sup>${n}</sup>?`,
        answer: choices(d, ans, [choose(n, k) * a ** (n - k) * b ** k, choose(n, k) * a ** k * Math.abs(b) ** (n - k), choose(n, k) * b ** (n - k), choose(n, k - 1) * a ** k * b ** (n - k), -ans, choose(n, k) * a * b]),
        check: () => { const c = coefOf(expand([[1, a], [0, b]], n), k); return c === BigInt(ans) ? '' : `expanded to ${c}, said ${ans}`; },
        solution: `Multiplying out ${n} brackets, a term with ${xPow(k)} picks ${term(a, 1)} from ${k} of them and ${num(b)} from the other ${n - k}. There are C(${n}, ${k}) = ${choose(n, k)} ways to pick which brackets give ${term(a, 1)}, and each choice gives ${a === 1 ? '' : `${pow(a, k)}·`}${pow(b, n - k)}·${xPow(k)}. So the coefficient is ${choose(n, k)}${a === 1 ? '' : `·${pow(a, k)}`}·${pow(b, n - k)} = <b>${num(ans)}</b>.`,
      };
    },
    // the constant term of (p·x^α + q/x^β)^n: the powers of x must cancel
    (d, ctx) => {
      const FORMS = [[1, 2, 6], [1, 2, 9], [1, 2, 12], [2, 1, 3], [2, 1, 6], [2, 1, 9], [3, 1, 4], [3, 1, 8], [1, 3, 4], [1, 3, 8], [2, 3, 5], [2, 3, 10], [3, 2, 5], [3, 2, 10]];
      const [[al, be, n], p, q] = pick(ctx, 'const', [FORMS, [1, 2, 3], [-3, -2, -1, 1, 2, 3]], ([al, be, n], p, q) => {
        const j = (al * n) / (al + be);
        return Math.abs(choose(n, j) * p ** (n - j) * q ** j) <= 1e5 && !(p === 1 && Math.abs(q) === 1 && n < 6);
      });
      const j = (al * n) / (al + be), ans = choose(n, j) * p ** (n - j) * q ** j;
      const jHalf = Math.round(n / 2), first = term(p, al);
      return {
        topic: 'Binomial coefficients', rank: p === 1 && q > 0 ? 6 : 7,
        text: `What is the constant term in the expansion of (${first} ${plusMinus(q, overX(q, be))})<sup>${n}</sup>?`,
        answer: choices(d, ans, nonzero([choose(n, j) * q ** j, choose(n, j) * p ** j * q ** (n - j), -ans, choose(n, jHalf) * p ** (n - jHalf) * q ** jHalf, choose(n, j - 1) * p ** (n - j + 1) * q ** (j - 1), choose(n, j + 1) * p ** (n - j - 1) * q ** (j + 1), choose(n, j)]).filter((v) => v !== ans)),
        check: () => { const c = coefOf(expand([[al, p], [-be, q]], n), 0); return c === BigInt(ans) ? '' : `expanded to ${c}, said ${ans}`; },
        solution: `A term picks ${first} from ${n} − j of the brackets and ${q < 0 ? '−' : ''}${overX(q, be)} from the other j, so it is C(${n}, j)·${p === 1 ? '' : `${p}<sup>${n} − j</sup>·`}${q === 1 ? '' : `${q < 0 ? `(${num(q)})` : q}<sup>j</sup>·`}x<sup>${al === 1 ? '' : al}(${n} − j) − ${be === 1 ? '' : be}j</sup>. It is constant when ${al === 1 ? '' : al}(${n} − j) = ${be === 1 ? '' : be}j, which gives j = ${j}. So the constant term is C(${n}, ${j})${p === 1 ? '' : `·${pow(p, n - j)}`}${q === 1 ? '' : `·${pow(q, j)}`}${p === 1 && q === 1 ? '' : ` = ${choose(n, j)}${p === 1 ? '' : `·${num(p ** (n - j))}`}${q === 1 ? '' : `·${num(q ** j)}`}`} = <b>${num(ans)}</b>.`,
      };
    },
    // adding up only the even (or odd) powers' coefficients: P(1) and P(−1)
    (d, ctx) => {
      const [kind, a, b, n] = pickKind(ctx, 'sums', ['even', 'odd', 'tri'], [[1, 2, 3], [-3, -2, -1, 1, 2, 3], range(4, 8)], (kind, a, b, n) => {
        if (kind === 'tri') return a !== b && Math.abs(1 + b + a) ** n <= 1e5 && Math.abs(1 - b + a) ** n <= 1e5 && Math.abs(1 + b + a) !== Math.abs(1 - b + a);
        return Math.abs(a + b) ** n <= 1e5 && Math.abs(b - a) ** n <= 1e5 && Math.abs(a + b) !== Math.abs(b - a);
      });
      // tri: (x² + b·x + a)^n; even and odd: (a·x + b)^n
      const P1 = kind === 'tri' ? (1 + b + a) ** n : (a + b) ** n, Pm = kind === 'tri' ? (1 - b + a) ** n : (b - a) ** n;
      const even = (P1 + Pm) / 2, odd = (P1 - Pm) / 2, ans = kind === 'odd' ? odd : even;
      const poly = kind === 'tri' ? `x<sup>2</sup> ${plusMinus(b, Math.abs(b) === 1 ? 'x' : `${Math.abs(b)}x`)} ${plusMinus(a, a)}` : `${term(a, 1)} ${plusMinus(b, Math.abs(b))}`;
      const which = kind === 'odd' ? 'odd' : 'even';
      return {
        topic: 'Binomial coefficients', rank: kind === 'tri' ? 7 : 6,
        text: `What is the sum of the coefficients of the ${which} powers of x${which === 'even' ? ' (the constant term included)' : ''} in the expansion of (${poly})<sup>${n}</sup>?`,
        answer: choices(d, ans, nonzero([P1, kind === 'odd' ? even : odd, P1 / 2, Pm, -ans]).filter((v) => Number.isInteger(v) && v !== ans)),
        check: () => {
          const poly2 = expand(kind === 'tri' ? [[2, 1], [1, b], [0, a]] : [[1, a], [0, b]], n);
          const got = sumBig([...poly2].filter(([e]) => (e % 2 === 0) === (which === 'even')).map(([, c]) => c));
          return got === BigInt(ans) ? '' : `expanded to ${got}, said ${ans}`;
        },
        tip: 'Put x = 1 and x = −1 into the expansion: their sum and their difference pick out the even and the odd coefficients.',
        solution: `Let P(x) = (${poly})<sup>${n}</sup>. Putting x = 1 adds up all the coefficients, and putting x = −1 adds the even-power ones and subtracts the odd-power ones, since (−1)<sup>m</sup> is 1 for even m and −1 for odd m. So P(1) ${which === 'even' ? '+' : '−'} P(−1) is twice the sum we want. Here P(1) = ${pow(kind === 'tri' ? 1 + b + a : a + b, n)} = ${num(P1)} and P(−1) = ${pow(kind === 'tri' ? 1 - b + a : b - a, n)} = ${num(Pm)}, so the sum is (${num(P1)} ${which === 'even' ? '+' : '−'} ${Pm < 0 ? `(${num(Pm)})` : num(Pm)})/2 = <b>${num(ans)}</b>.`,
      };
    },
    // the hockey stick: a column of Pascal’s triangle adds up to the entry below and to the right of its end
    (d, ctx) => {
      const [kind, k, n, a] = pickKind(ctx, 'stick', ['plain', 'late', 'products', 'coef'], [[2, 3, 4], range(10, 20), range(4, 9)], (kind, k, n, a) => ({
        plain: a === 4 && n <= 18, late: a >= k + 2 && n <= 18 && a <= k + 5 && n >= a + 4, products: k <= 3 && a === 4 && n <= 20 && n >= 12, coef: a >= k + 1 && n <= 16 && n >= a + 4,
      })[kind]);
      const hockey = choose(n + 1, k + 1), late = hockey - choose(a, k + 1), prod = k === 2 ? 2 * choose(n + 2, 3) : 6 * choose(n + 3, 4);
      const ans = { plain: hockey, late, products: prod, coef: late }[kind];
      const C = (m, j) => `C(${m}, ${j})`;
      return {
        topic: 'Binomial coefficients', rank: { plain: 7, late: 8, products: 8, coef: 9 }[kind],
        text: {
          plain: `What is ${C(k, k)} + ${C(k + 1, k)} + ${C(k + 2, k)} + ⋯ + ${C(n, k)}? (Here C(m, j) is the number of ways to choose j things from m.)`,
          late: `What is ${C(a, k)} + ${C(a + 1, k)} + ${C(a + 2, k)} + ⋯ + ${C(n, k)}? (Here C(m, j) is the number of ways to choose j things from m.)`,
          products: k === 2 ? `What is 1·2 + 2·3 + 3·4 + ⋯ + ${n}·${n + 1}?` : `What is 1·2·3 + 2·3·4 + 3·4·5 + ⋯ + ${n}·${n + 1}·${n + 2}?`,
          coef: `What is the coefficient of ${xPow(k)} in (1 + x)<sup>${a}</sup> + (1 + x)<sup>${a + 1}</sup> + (1 + x)<sup>${a + 2}</sup> + ⋯ + (1 + x)<sup>${n}</sup>?`,
        }[kind],
        answer: choices(d, ans, {
          plain: [choose(n, k + 1), choose(n + 1, k), hockey - 1, choose(n + 2, k + 1)],
          late: [hockey, hockey - choose(a - 1, k + 1), hockey - choose(a + 1, k + 1), choose(n, k + 1) - choose(a, k + 1)],
          products: k === 2 ? [choose(n + 2, 3), (n * (n + 1) * (2 * n + 1)) / 6, 2 * choose(n + 1, 3), (n * (n + 1) * (n + 2)) / 2] : [choose(n + 3, 4), 6 * choose(n + 2, 4), (n * (n + 1) / 2) ** 2, (n * (n + 1) * (n + 2) * (n + 3)) / 6],
          coef: [hockey, hockey - choose(a - 1, k + 1), choose(n, k + 1) - choose(a, k + 1), choose(n + 1, k) - choose(a, k)],
        }[kind]),
        check: () => {
          const T = pascal(n + 3);
          const got = {
            plain: sumBig(range(k, n).map((m) => T[m][k])),
            late: sumBig(range(a, n).map((m) => T[m][k])),
            products: sumBig(range(1, n).map((m) => BigInt(k === 2 ? m * (m + 1) : m * (m + 1) * (m + 2)))),
            coef: sumBig(range(a, n).map((m) => coefOf(expand([[1, 1], [0, 1]], m), k))),
          }[kind];
          return got === BigInt(ans) ? '' : `added up to ${got}, said ${ans}`;
        },
        tip: 'Write each term as a binomial coefficient, see a column of Pascal’s triangle, and add it up with the hockey stick.',
        solution: {
          plain: `Count the ways to choose ${k + 1} numbers from 1 to ${n + 1} by the largest one chosen. If the largest is m + 1, the other ${k} come from 1 to m, in C(m, ${k}) ways, and m runs from ${k} to ${n}. So the sum counts every choice of ${k + 1} numbers from ${n + 1} exactly once, and it equals ${C(n + 1, k + 1)} = <b>${num(ans)}</b>.`,
          late: `Choosing ${k + 1} numbers from 1 to M + 1 and sorting by the largest shows that ${C(k, k)} + ${C(k + 1, k)} + ⋯ + C(M, ${k}) = C(M + 1, ${k + 1}), the hockey stick. The full sum up to ${C(n, k)} is ${C(n + 1, k + 1)} = ${num(hockey)}, and the terms left out, ${C(k, k)} to ${C(a - 1, k)}, add up to ${C(a, k + 1)} = ${num(choose(a, k + 1))}. So the sum is ${num(hockey)} − ${num(choose(a, k + 1))} = <b>${num(ans)}</b>.`,
          products: k === 2
            ? `Each term m(m + 1) is 2·C(m + 1, 2), so the sum is 2·(${C(2, 2)} + ${C(3, 2)} + ⋯ + ${C(n + 1, 2)}). A column of Pascal’s triangle adds up to the entry below and to the right of its end (choose 3 numbers from 1 to ${n + 2} and sort by the largest), so the bracket is ${C(n + 2, 3)} = ${num(choose(n + 2, 3))}. The sum is 2·${num(choose(n + 2, 3))} = <b>${num(ans)}</b>.`
            : `Each term m(m + 1)(m + 2) is 6·C(m + 2, 3), so the sum is 6·(${C(3, 3)} + ${C(4, 3)} + ⋯ + ${C(n + 2, 3)}). A column of Pascal’s triangle adds up to the entry below and to the right of its end (choose 4 numbers from 1 to ${n + 3} and sort by the largest), so the bracket is ${C(n + 3, 4)} = ${num(choose(n + 3, 4))}. The sum is 6·${num(choose(n + 3, 4))} = <b>${num(ans)}</b>.`,
          coef: `The coefficient of ${xPow(k)} in (1 + x)<sup>m</sup> is C(m, ${k}), so the answer is ${C(a, k)} + ${C(a + 1, k)} + ⋯ + ${C(n, k)}. By the hockey stick (choose ${k + 1} numbers and sort by the largest), ${C(k, k)} + ⋯ + ${C(n, k)} = ${C(n + 1, k + 1)} = ${num(hockey)}, and the missing start ${C(k, k)} + ⋯ + ${C(a - 1, k)} = ${C(a, k + 1)} = ${num(choose(a, k + 1))}. So the coefficient is ${num(hockey)} − ${num(choose(a, k + 1))} = <b>${num(ans)}</b>.`,
        }[kind],
      };
    },
  ],
};
