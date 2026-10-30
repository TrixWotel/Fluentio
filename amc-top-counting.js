// The hardest AMC 10 counting and probability (ranks 18 to 24, problems 17 to 25 of a real AMC 10): eight topics, each
// with an idea to find and several steps after it: routes on a grid that dodge closed corners or turn a set number of
// times, words with doubled letters kept apart, tilings of boards two and three squares wide, a bug walking on a
// regular solid, linearity of expectation, chances read off as lengths and areas, subsets with a sum or product rule,
// and chances that change once you know something. Each topic asks its idea three or four ways, and check() gets every
// answer again another way: every route, arrangement, seating, tiling, subset or roll gone through one by one, the
// real solid's graph solved exactly with fractions, or the region cut out exactly as a polygon.
import { combo, num, frac, gcd, lcm, choose } from '../kit/bank.js';
import { choices as kitChoices, showFrac, range, ord } from './amc-kit.js';

// ---------- small helpers ----------
// combo, with a name of its own for each kind of question, so no two kinds share a list of combinations
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
// a type with several kinds of question shows them in turn (starting from a kind that depends on where the topic sits
// in the bank), and walks each kind's own combinations: pickKind(ctx, tag, kinds, lists, ok) gives [kind, …values]
function pickKind(ctx, tag, kinds, lists, ok = () => true) {
  let h = 0;
  for (const ch of ctx.salt) h = (h * 31 + ch.charCodeAt(0)) % 1000003;
  const kind = kinds[(ctx.k + h) % kinds.length], inner = { ...ctx, k: Math.floor(ctx.k / kinds.length) };
  return [kind, ...pick(inner, `${tag}-${kind}`, lists, (...v) => ok(kind, ...v))];
}
const NAMES = ['Mira', 'Tomas', 'Priya', 'Kofi', 'Lena', 'Mateo', 'Yuki', 'Sami', 'Iris', 'Bruno', 'Dalia', 'Felix', 'Nora', 'Oskar', 'Rhea', 'Zane'];
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
// (the texts of a type are built for every kind at once and one is kept, so these take what the other kinds give them)
const Cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : '');
const listing = (xs) => (xs.length < 2 ? String(xs[0]) : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const total = (xs) => xs.reduce((s, v) => s + v, 0);
const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const popcount = (x) => { let c = 0; for (; x; x &= x - 1) c++; return c; };
const ix = (i) => `<sub>${i}</sub>`;
const sq = (v) => `${v}<sup>2</sup>`;
// a sum with signs, as written: 24 − 42 + 30
const signed = (xs) => xs.map((v, i) => (i === 0 ? num(v) : v < 0 ? ` − ${num(-v)}` : ` + ${num(v)}`)).join('');
// terms of an inclusion–exclusion sum written out, with − and + in turn
const alt = (terms) => terms.map((t, i) => (i === 0 ? t : `${i % 2 ? ' − ' : ' + '}${t}`)).join('');
// the answer p/q written out and reduced, in bold: "168/462 = <b>4/11</b>", or just "<b>4/11</b>" when nothing reduces
const reduced = (p, q) => (gcd(p, q) > 1 ? `${num(p)}/${num(q)} = <b>${frac(p, q)}</b>` : `<b>${frac(p, q)}</b>`);
const an = (v) => (/^(8|11|18)$/.test(String(v)) || /^8/.test(String(v)) ? 'an' : 'a');
const plural = (n, word, many = word + 's') => `${num(n)} ${n === 1 ? word : many}`;

// small fractions [p, q] in lowest terms, for answers and wrong answers
const cut = (p, q) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return [p / g, q / g]; };
const fr = (v) => (Array.isArray(v) ? frac(v[0], v[1]) : num(v));
const plus = ([a, b], [c, e]) => cut(a * e + c * b, b * e);
const minus = ([a, b], [c, e]) => cut(a * e - c * b, b * e);
const times = ([a, b], [c, e]) => cut(a * c, b * e);
const over = ([a, b], [c, e]) => cut(a * e, b * c);
const ONE = [1, 1];
const under1 = ([p, q]) => p > 0 && p < q;
const positive = ([p]) => p > 0;

// five choices as the kit makes them, but never a bare 0 (a wrong count of nothing), and when a fraction's own wrong
// answers run short, the extra ones are plausible: simple fractions near a probability, or neighbors of an expected value
function choices(d, correct, wrongs, show) {
  if (!Array.isArray(correct)) return kitChoices(d, correct, wrongs.filter((w) => w > 0), show);
  const v = correct[0] / correct[1], near = [];
  if (v < 1) {
    for (let q = 2; q <= 12; q++) for (let p = 1; p < q; p++) if (gcd(p, q) === 1) near.push([p, q]);
    near.sort((x, y) => Math.abs(x[0] / x[1] - v) - Math.abs(y[0] / y[1] - v));
  } else near.push(plus(correct, ONE), minus(correct, [1, 2]), plus(correct, [1, 2]), times(correct, [2, 1]), minus(correct, ONE));
  return kitChoices(d, correct, [...wrongs, ...near.filter(positive)], show);
}
// exact fractions for the checks: [top, bottom] as BigInts, bottom positive
const bgcd = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const norm = ([p, q]) => { if (q < 0n) { p = -p; q = -q; } const g = bgcd(p, q) || 1n; return [p / g, q / g]; };
const big = (p, q = 1) => norm([BigInt(p), BigInt(q)]);
const qadd = (x, y) => norm([x[0] * y[1] + y[0] * x[1], x[1] * y[1]]);
const qsub = (x, y) => norm([x[0] * y[1] - y[0] * x[1], x[1] * y[1]]);
const qmul = (x, y) => norm([x[0] * y[0], x[1] * y[1]]);
const qdiv = (x, y) => norm([x[0] * y[1], x[1] * y[0]]);
const qcmp = (x, y) => { const d = x[0] * y[1] - y[0] * x[1]; return d > 0n ? 1 : d < 0n ? -1 : 0; };
const qeq = (x, v) => (Array.isArray(v) ? x[0] * BigInt(v[1]) === x[1] * BigInt(v[0]) : x[0] === BigInt(v) * x[1]);
const qshow = (x) => `${x[0]}/${x[1]}`;
const sayAns = (v) => (Array.isArray(v) ? v.join('/') : String(v));
const verdict = (x, v) => (qeq(x, v) ? '' : `found ${qshow(x)}, said ${sayAns(v)}`);
// A·x = b, solved exactly (Gaussian elimination)
function solve(A, b) {
  const n = b.length, M = A.map((row, i) => [...row, b[i]]);
  for (let c = 0; c < n; c++) {
    const r = M.findIndex((row, i) => i >= c && row[c][0] !== 0n);
    [M[c], M[r]] = [M[r], M[c]];
    for (let i = 0; i < n; i++) if (i !== c && M[i][c][0] !== 0n) { const f = qdiv(M[i][c], M[c][c]); M[i] = M[i].map((v, j) => qsub(v, qmul(f, M[c][j]))); }
  }
  return M.map((row, i) => qdiv(row[n], row[i]));
}
// a convex polygon (corners [x, y], exact) cut down to the half-plane a·x + b·y ≤ c, and its area
function clip(poly, a, b, c) {
  const C = big(c), val = ([x, y]) => qadd(qmul(big(a), x), qmul(big(b), y)), out = [];
  for (let i = 0; i < poly.length; i++) {
    const P = poly[i], Q = poly[(i + 1) % poly.length], vp = val(P), vq = val(Q), pin = qcmp(vp, C) <= 0, qin = qcmp(vq, C) <= 0;
    if (pin) out.push(P);
    if (pin !== qin) {
      const t = qdiv(qsub(C, vp), qsub(vq, vp));
      out.push([qadd(P[0], qmul(t, qsub(Q[0], P[0]))), qadd(P[1], qmul(t, qsub(Q[1], P[1])))]);
    }
  }
  return out;
}
function area(poly) {
  let s = big(0);
  for (let i = 0; i < poly.length; i++) { const P = poly[i], Q = poly[(i + 1) % poly.length]; s = qadd(s, qsub(qmul(P[0], Q[1]), qmul(Q[0], P[1]))); }
  s = qdiv(s, big(2));
  return s[0] < 0n ? [-s[0], s[1]] : s;
}
const corner = (x, y) => [big(x), big(y)];

// every order of 0 … n − 1 (one array, changed in place: Heap's method), and every arrangement of letters 0, 1, 2, …
// with counts[i] copies of letter i
function eachPerm(n, f) {
  const a = range(0, n - 1), c = Array(n).fill(0);
  f(a);
  for (let i = 0; i < n;) {
    if (c[i] < i) { const j = i % 2 ? c[i] : 0; [a[j], a[i]] = [a[i], a[j]]; f(a); c[i]++; i = 0; } else { c[i] = 0; i++; }
  }
}
function eachArrangement(counts, f) {
  const N = total(counts), seq = [], left = counts.slice();
  const go = () => {
    if (seq.length === N) { f(seq); return; }
    for (let i = 0; i < left.length; i++) if (left[i]) { left[i]--; seq.push(i); go(); seq.pop(); left[i]++; }
  };
  go();
}

// ---------- drawing: an svg with the page's figure styles ----------
const r2 = (v) => Math.round(v * 100) / 100;
const svg = (w, h, name, parts) => `<svg class="tri" viewBox="0 0 ${w} ${h}" role="img" aria-label="${name}">${parts.join('')}</svg>`;
const label = ([x, y], t, cls = 'vx', anchor = 'middle') => `<text class="${cls}" x="${r2(x)}" y="${r2(y + 5)}" text-anchor="${anchor}">${t}</text>`;
const seg = ([x1, y1], [x2, y2], cls = 'side', style = '') => `<line class="${cls}" x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}"${style ? ` style="${style}"` : ''}/>`;
// a grid of streets m blocks wide and n tall, with A and B at opposite corners, closed corners marked × and a park shaded
function streets(m, n, { closed = [], park = null } = {}) {
  const u = Math.min(44, 320 / m, 200 / n), W = m * u, H = n * u, x0 = (400 - W) / 2, y0 = 28;
  const X = (x) => x0 + x * u, Y = (y) => y0 + H - y * u;
  const parts = [`<rect class="side" x="${r2(x0)}" y="${r2(y0)}" width="${r2(W)}" height="${r2(H)}"/>`];
  for (let i = 1; i < m; i++) parts.push(seg([X(i), y0], [X(i), y0 + H], 'side', 'stroke-width:1.2'));
  for (let j = 1; j < n; j++) parts.push(seg([x0, Y(j)], [x0 + W, Y(j)], 'side', 'stroke-width:1.2'));
  if (park) {
    const [a1, b1, a2, b2] = park, p = u * 0.3;
    parts.push(`<rect x="${r2(X(a1) - p)}" y="${r2(Y(b2) - p)}" width="${r2(X(a2) - X(a1) + 2 * p)}" height="${r2(Y(b1) - Y(b2) + 2 * p)}" rx="5" style="fill:var(--accent);fill-opacity:.28;stroke:var(--accent);stroke-width:1.5"/>`);
  }
  for (const [x, y, name] of closed) {
    const s = Math.min(7, u * 0.2);
    parts.push(seg([X(x) - s, Y(y) - s], [X(x) + s, Y(y) + s], 'seg', 'stroke-width:3'), seg([X(x) - s, Y(y) + s], [X(x) + s, Y(y) - s], 'seg', 'stroke-width:3'));
    if (name) parts.push(label([X(x) + 9, Y(y) - 13], name, 'ang', 'start'));
  }
  parts.push(label([X(0) - 13, Y(0) + 13], 'A'), label([X(m) + 13, Y(n) - 13], 'B'));
  return svg(400, r2(H + 60), `A grid of streets ${m} blocks wide and ${n} blocks tall${park ? ' with a park' : ''}`, parts);
}
// the two pieces of a tiling: a domino and an L made of three squares
function pieces() {
  const s = 34, cell = (x, y) => `<rect class="side" style="fill:var(--soft)" x="${x}" y="${y}" width="${s}" height="${s}"/>`;
  const parts = [cell(70, 30), cell(70 + s, 30), cell(240, 30), cell(240, 30 + s), cell(240 + s, 30 + s)];
  parts.push(label([70 + s, 30 + 2 * s + 26], 'domino', 'ang'), label([240 + s, 30 + 2 * s + 26], 'L-piece', 'ang'));
  return svg(400, 150, 'The two kinds of piece: a domino and an L made of three squares', parts);
}

// ---------- 1. routes on a grid ----------
const routes = (dx, dy) => (dx < 0 || dy < 0 ? 0 : choose(dx + dy, dx));
const WALKERS = ['courier', 'mail carrier', 'jogger', 'delivery robot', 'taxi driver'];
// every route from (0, 0) to (m, n) as the points it passes, handed to f
function eachRoute(m, n, f) {
  for (let mask = 0; mask < 1 << (m + n); mask++) {
    if (popcount(mask) !== n) continue;
    const pts = [[0, 0]];
    let x = 0, y = 0;
    for (let i = 0; i < m + n; i++) { if ((mask >> i) & 1) y++; else x++; pts.push([x, y]); }
    f(pts);
  }
}
const ELECTION = [['Ana', 'Ben'], ['Chloe', 'Dev'], ['Elif', 'Femi'], ['Greta', 'Hiro'], ['Ines', 'Jamal'], ['Kofi', 'Lena']];

// ---------- 2. doubled letters kept apart ----------
// arrangements of k doubled letters and s single ones: S[j] glues j chosen pairs (inclusion and exclusion), none(k, s)
// has no pair together
const glued = (k, s) => range(0, k).map((j) => (choose(k, j) * fact(2 * k + s - j)) / 2 ** (k - j));
const noneApart = (k, s) => total(glued(k, s).map((v, j) => (j % 2 ? -v : v)));
const factOver = (m, e) => (e === 0 ? `${m}!` : `${m}!/${2 ** e}`);
const TWIN_WORDS = { '2,3': ['BALLOON', 'RACCOON', 'ADDRESS'], '2,4': ['BALLROOM', 'MATTRESS', 'MUSHROOM'], '3,3': ['COMMITTEE'] };
const PAIR_COLORS = ['red', 'blue', 'green', 'yellow'], ONE_COLORS = ['white', 'black', 'orange', 'purple'];
// how the letters or flags of (k, s) read: the doubled ones, then the single ones
function twinSet(d, k, s, kind, useWord) {
  const words = TWIN_WORDS[`${k},${s}`];
  if (kind === 'flags') {
    const list = [...PAIR_COLORS.slice(0, k).map((c) => `two ${c}`), ...ONE_COLORS.slice(0, s).map((c) => `one ${c}`)];
    return { flags: true, list: listing(list), doubled: listing(PAIR_COLORS.slice(0, k)), unit: 'color', units: 'colors', items: 'flags', copies: 'flags' };
  }
  if (useWord && words) {
    const w = d.pick(words), seen = {};
    for (const ch of w) seen[ch] = (seen[ch] || 0) + 1;
    return { word: w, doubled: listing(Object.keys(seen).filter((ch) => seen[ch] === 2)), unit: 'letter', units: 'letters', items: 'letters', copies: 'copies' };
  }
  const letters = 'ABCDEFGHIJ'.split(''), dbl = letters.slice(0, k), one = letters.slice(k, k + s);
  return { tiles: listing([...dbl.flatMap((c) => [c, c]), ...one]), doubled: listing(dbl), unit: 'letter', units: 'letters', items: 'tiles', copies: 'tiles' };
}
// married couples seated so that men and women alternate and nobody sits beside their own spouse: the women's places
// once the men are seated, along a row (a chain of 2n − 1 neighboring pairs) or around a table (a ring of 2n)
const lineWays = (n) => total(range(0, n).map((k) => (k % 2 ? -1 : 1) * choose(2 * n - k, k) * fact(n - k)));
const ringPick = (n, k) => (k === 0 ? 1 : choose(2 * n - k, k) + choose(2 * n - k - 1, k - 1));
const ringWays = (n) => total(range(0, n).map((k) => (k % 2 ? -1 : 1) * ringPick(n, k) * fact(n - k)));
const DER = [1, 0, 1, 2, 9, 44];

// ---------- 3. tilings ----------
// how many ways R × C board can be covered by the shapes (each turned or flipped any way): fill the first empty square
// (going down each column, then on to the next column) with every piece that fits there, again and again
function countTilings(R, C, shapes) {
  const orients = [], seen = new Set();
  for (const sh of shapes) for (let t = 0; t < 8; t++) {
    let cells = sh.map(([r, c]) => { let [a, b] = t & 4 ? [c, r] : [r, c]; if (t & 1) a = -a; if (t & 2) b = -b; return [a, b]; });
    cells.sort((p, q) => p[1] - q[1] || p[0] - q[0]);
    const [r0, c0] = cells[0];
    cells = cells.map(([r, c]) => [r - r0, c - c0]);
    const key = JSON.stringify(cells);
    if (!seen.has(key)) { seen.add(key); orients.push(cells); }
  }
  const full = Array(R * C).fill(false), at = (r, c) => c * R + r;
  let count = 0;
  const go = (from) => {
    let i = from;
    while (i < R * C && full[i]) i++;
    if (i === R * C) { count++; return; }
    const r = i % R, c = Math.floor(i / R);
    for (const o of orients) {
      const cells = o.map(([dr, dc]) => [r + dr, c + dc]);
      if (cells.every(([a, b]) => a >= 0 && a < R && b >= 0 && b < C && !full[at(a, b)])) {
        for (const [a, b] of cells) full[at(a, b)] = true;
        go(i + 1);
        for (const [a, b] of cells) full[at(a, b)] = false;
      }
    }
  };
  go(0);
  return count;
}
const DOMINO = [[0, 0], [0, 1]], SQUARE = [[0, 0]], ELL = [[0, 0], [1, 0], [1, 1]];
const fib = (n) => { let a = 0, b = 1; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; };
// 3 × m boards with dominoes: f for the full board (m even), g with a corner square gone (m odd)
function threeWide(n) {
  const f = [1], g = [0, 1];
  for (let m = 2; m <= n; m++) { if (m % 2 === 0) f[m] = f[m - 2] + 2 * g[m - 1]; else g[m] = f[m - 1] + (g[m - 2] ?? 0); }
  return { f, g };
}
// 2 × m boards: f for the full board, g with one more square sticking out of the end of a row
function dominoEll(n) { const f = [1, 1], g = [0, 1]; for (let m = 2; m <= n; m++) { f[m] = f[m - 1] + f[m - 2] + 2 * g[m - 2]; g[m] = g[m - 1] + f[m - 1]; } return { f, g }; }
function squareDomino(n) { const f = [1, 2], g = [1, 3]; for (let m = 2; m <= n; m++) { f[m] = 2 * f[m - 1] + f[m - 2] + 2 * g[m - 2]; g[m] = f[m] + g[m - 1]; } return { f, g }; }

// ---------- 4. a bug on a solid ----------
// the vertices by distance from the start: how many there are, and the edges from each one back, sideways and out
const SOLIDS = {
  octa: { about: 'a regular octahedron (8 triangular faces, 6 vertices, 4 edges at each vertex)', V: 6, deg: 4, layers: [1, 4, 1], back: [0, 1, 4], side: [0, 2, 0], out: [4, 1, 0] },
  cube: { about: 'a cube (6 square faces, 8 vertices, 3 edges at each vertex)', V: 8, deg: 3, layers: [1, 3, 3, 1], back: [0, 1, 2, 3], side: [0, 0, 0, 0], out: [3, 2, 1, 0] },
  icosa: { about: 'a regular icosahedron (20 triangular faces, 12 vertices, 5 edges at each vertex)', V: 12, deg: 5, layers: [1, 5, 5, 1], back: [0, 1, 2, 5], side: [0, 2, 2, 0], out: [5, 2, 1, 0] },
  dodeca: { about: 'a regular dodecahedron (12 pentagonal faces, 20 vertices, 3 edges at each vertex)', V: 20, deg: 3, layers: [1, 3, 6, 6, 3, 1], back: [0, 1, 1, 1, 2, 3], side: [0, 0, 1, 1, 0, 0], out: [3, 2, 1, 1, 1, 0] },
};
function layerText(S) {
  const D = S.layers.length - 1;
  const each = range(1, D - 1).map((dd) => {
    const parts = [`${S.back[dd]} at distance ${dd - 1}`];
    if (S.side[dd]) parts.push(`${S.side[dd]} at distance ${dd}`);
    parts.push(`${S.out[dd]} at distance ${dd + 1}`);
    return `a vertex at distance ${dd} is joined to ${listing(parts)}`;
  });
  return `Counting the fewest edges from the start, there are ${listing(S.layers.slice(1).map(String))} vertices at distances ${listing(range(1, D).map(String))}, the last one being the opposite vertex. ${Cap(each.join('; '))}.`;
}
// the real solid: vertices from coordinates, joined when they are nearest neighbors; the opposite vertex is −v
function solidGraph(kind) {
  const phi = (1 + Math.sqrt(5)) / 2, signs = [1, -1], pts = [];
  const cyc = (a, b) => { for (const s of signs) for (const t of signs) { const p = [0, s * a, t * b]; pts.push(p, [p[1], p[2], p[0]], [p[2], p[0], p[1]]); } };
  if (kind === 'cube' || kind === 'dodeca') for (const a of signs) for (const b of signs) for (const c of signs) pts.push([a, b, c]);
  if (kind === 'octa') for (let i = 0; i < 3; i++) for (const s of signs) { const p = [0, 0, 0]; p[i] = s; pts.push(p); }
  if (kind === 'icosa') cyc(1, phi);
  if (kind === 'dodeca') cyc(1 / phi, phi);
  const d2 = (p, q) => total(p.map((v, i) => (v - q[i]) ** 2));
  let near = Infinity;
  for (const p of pts) for (const q of pts) if (p !== q) near = Math.min(near, d2(p, q));
  const adj = pts.map((p) => pts.map((q, j) => (p !== q && Math.abs(d2(p, q) - near) < 1e-6 ? j : -1)).filter((j) => j >= 0));
  const opp = pts.findIndex((q) => d2(q, pts[0].map((v) => -v)) < 1e-6);
  return { adj, opp };
}
// on the real graph: the chance of reaching `to` before `from` starting next to `from`, the expected moves from `from` to
// `to`, and the walks of n moves from 0 to a vertex (a count; the chance is that over deg^n)
function graphRace(G, from, to) {
  const free = G.adj.map((_, v) => v).filter((v) => v !== from && v !== to), at = new Map(free.map((v, i) => [v, i]));
  const A = free.map((v) => free.map((u) => big(u === v ? G.adj[v].length : 0))), b = free.map(() => big(0));
  free.forEach((v, i) => { for (const u of G.adj[v]) { if (u === to) b[i] = qadd(b[i], big(1)); else if (u !== from) A[i][at.get(u)] = qsub(A[i][at.get(u)], big(1)); } });
  const x = solve(A, b), val = (u) => (u === to ? big(1) : u === from ? big(0) : x[at.get(u)]);
  return qdiv(G.adj[from].reduce((s, u) => qadd(s, val(u)), big(0)), big(G.adj[from].length));
}
function graphTime(G, from, to) {
  const free = G.adj.map((_, v) => v).filter((v) => v !== to), at = new Map(free.map((v, i) => [v, i]));
  const A = free.map((v) => free.map((u) => big(u === v ? G.adj[v].length : 0))), b = free.map((v) => big(G.adj[v].length));
  free.forEach((v, i) => { for (const u of G.adj[v]) if (u !== to) A[i][at.get(u)] = qsub(A[i][at.get(u)], big(1)); });
  return solve(A, b)[at.get(from)];
}
function graphReturn(G, home) {
  const free = G.adj.map((_, v) => v).filter((v) => v !== home), at = new Map(free.map((v, i) => [v, i]));
  const A = free.map((v) => free.map((u) => big(u === v ? G.adj[v].length : 0))), b = free.map((v) => big(G.adj[v].length));
  free.forEach((v, i) => { for (const u of G.adj[v]) if (u !== home) A[i][at.get(u)] = qsub(A[i][at.get(u)], big(1)); });
  const T = solve(A, b);
  return qadd(big(1), qdiv(G.adj[home].reduce((s, u) => qadd(s, T[at.get(u)]), big(0)), big(G.adj[home].length)));
}
function graphWalks(G, n, target) {
  let w = G.adj.map((_, v) => (v === 0 ? 1n : 0n));
  for (let s = 0; s < n; s++) { const next = w.map(() => 0n); w.forEach((c, v) => { for (const u of G.adj[v]) next[u] += c; }); w = next; }
  return norm([w[target], BigInt(G.adj[0].length) ** BigInt(n)]);
}

// ---------- 5. linearity of expectation ----------
const harmonic = (t) => range(1, t).reduce((s, i) => plus(s, [1, i]), [0, 1]);
// every square (tilted or not) with corners in an a × b array of points, as the sets of its corners
function latticeQuads(a, b, test) {
  const P = [];
  for (let x = 0; x < a; x++) for (let y = 0; y < b; y++) P.push([x, y]);
  let c = 0;
  for (let i = 0; i < P.length; i++) for (let j = i + 1; j < P.length; j++) for (let k = j + 1; k < P.length; k++) for (let l = k + 1; l < P.length; l++) if (test([P[i], P[j], P[k], P[l]])) c++;
  return c;
}
const dist2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;
const isSquare = (Q) => { const d = []; for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) d.push(dist2(Q[i], Q[j])); d.sort((x, y) => x - y); return d[0] > 0 && d[0] === d[3] && d[4] === d[5] && d[4] === 2 * d[0]; };
const isUpright = (Q) => new Set(Q.map((p) => p[0])).size === 2 && new Set(Q.map((p) => p[1])).size === 2;

// ---------- 7. subsets ----------
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19];
const primesTo = (n) => PRIMES.filter((p) => p <= n);
// the primes of m that appear to an odd power, as a bit mask over PRIMES
const oddMask = (m) => { let mask = 0; PRIMES.forEach((p, i) => { let e = 0; while (m % p === 0) { m /= p; e++; } if (e % 2) mask |= 1 << i; }); return mask; };

// ---------- 8. dice ----------
const orders = (p) => { const c = {}; for (const v of p) c[v] = (c[v] || 0) + 1; return fact(p.length) / Object.values(c).reduce((x, k) => x * fact(k), 1); };
// the ways `count` dice can land, ignoring order, that pass a test: [faces from high to low, how many orders]
function diceSets(count, ok) {
  const out = [];
  const go = (max, parts) => {
    if (parts.length === count) { if (ok(parts)) out.push([parts.slice(), orders(parts)]); return; }
    for (let v = max; v >= 1; v--) { parts.push(v); go(v, parts); parts.pop(); }
  };
  go(6, []);
  return out;
}
const showSet = ([p, o], sign = ' + ') => `${p.join(sign)} (${plural(o, 'order')})`;
function eachRoll(count, f) { const r = Array(count).fill(1); for (;;) { f(r); let i = 0; while (i < count && r[i] === 6) r[i++] = 1; if (i === count) return; r[i]++; } }

export const topCounting = {
  'Grid routes with roadblocks': [
    // two closed corners, one beyond the other: inclusion and exclusion with the routes through both
    (d, ctx) => {
      const [kind, m, n, p1, p2, e1, e2] = pickKind(ctx, 'two', ['avoid', 'one', 'prob'], [[5, 6, 7], [4, 5, 6], [1, 2, 3], [1, 2, 3], [0, 1, 2, 3], [0, 1, 2]],
        (kind, m, n, p1, p2, e1, e2) => n <= m && p1 + e1 <= m - 1 && p2 + e2 <= n - 1 && e1 + e2 >= 2 && p1 + p2 >= 2);
      const q1 = p1 + e1, q2 = p2 + e2, T = routes(m, n), aP = routes(p1, p2), bP = routes(m - p1, n - p2), aQ = routes(q1, q2), bQ = routes(m - q1, n - q2), mid = routes(e1, e2);
      const NP = aP * bP, NQ = aQ * bQ, NPQ = aP * mid * bQ, avoid = T - NP - NQ + NPQ, one = NP + NQ - 2 * NPQ, who = d.pick(WALKERS);
      const wrong = { avoid: [T - NP - NQ, NP + NQ - NPQ, T - NP - NQ + 2 * NPQ, T - Math.max(NP, NQ), T - NP - NQ - NPQ],
        one: [NP + NQ - NPQ, NP + NQ, avoid, Math.abs(NP - NQ), NP + NQ - 3 * NPQ] };
      const end = {
        avoid: `Those were taken away twice, so ${num(T)} − ${num(NP)} − ${num(NQ)} + ${num(NPQ)} = <b>${num(avoid)}</b> routes avoid both.`,
        one: `Each of those is in both counts but passes through both points, not exactly one, so ${num(NP)} + ${num(NQ)} − 2·${num(NPQ)} = <b>${num(one)}</b> routes pass through exactly one.`,
        prob: `Those were taken away twice, so ${num(T)} − ${num(NP)} − ${num(NQ)} + ${num(NPQ)} = ${num(avoid)} routes avoid both, and the probability is ${reduced(avoid, T)}.`,
      }[kind];
      return {
        topic: 'Grid routes with roadblocks', rank: { avoid: 19, one: 20, prob: 20 }[kind],
        text: `A ${who} travels from corner A to corner B of the grid of streets shown, ${m} blocks east and ${n} blocks north, going only east or north along the streets, so every route is ${m + n} blocks long. Put A at (0, 0) and B at (${m}, ${n}); the intersections P = (${p1}, ${p2}) and Q = (${q1}, ${q2}) are being repaired. ${{
          avoid: 'How many routes from A to B pass through neither P nor Q?',
          one: 'How many routes from A to B pass through exactly one of P and Q?',
          prob: `The ${who} picks a route at random, all routes from A to B equally likely. What is the probability that it passes through neither P nor Q?`,
        }[kind]}`,
        figure: streets(m, n, { closed: [[p1, p2, 'P'], [q1, q2, 'Q']] }),
        answer: kind === 'prob'
          ? choices(d, cut(avoid, T), [...wrong.avoid.filter((v) => v > 0).map((v) => cut(v, T)), times(cut(T - NP, T), cut(T - NQ, T))].filter(under1), showFrac)
          : choices(d, kind === 'avoid' ? avoid : one, wrong[kind]),
        check: () => {
          let c = 0;
          eachRoute(m, n, (pts) => {
            const hits = [[p1, p2], [q1, q2]].filter(([x, y]) => pts.some((p) => p[0] === x && p[1] === y)).length;
            if (kind === 'one' ? hits === 1 : hits === 0) c++;
          });
          return kind === 'prob' ? verdict(big(c, T), cut(avoid, T)) : c === (kind === 'avoid' ? avoid : one) ? '' : `counted ${c}`;
        },
        solution: `${kind === 'one' ? 'Count the routes through P and through Q, then deal with the routes through both.' : 'Count all the routes, then take away the ones through P or Q, using inclusion and exclusion.'} A route is an order of ${m} east blocks and ${n} north blocks, so there are C(${m + n}, ${n}) = ${num(T)} routes in all. A route through P is a route from A to P followed by one from P to B, so there are ${aP}·${bP} = ${num(NP)} of them, and through Q there are ${aQ}·${bQ} = ${num(NQ)}. Q can be reached from P by going ${e1 && e2 ? 'east and north' : e1 ? 'east' : 'north'}, so ${aP}·${mid}·${bQ} = ${num(NPQ)} routes pass through both. ${end}`,
      };
    },
    // routes with an exact number of turns: the runs between turns are compositions of the east and north blocks
    (d, ctx) => {
      const [kind, [m, n], t] = pickKind(ctx, 'turns', ['count', 'words', 'prob'], [[[5, 5], [6, 4], [6, 5], [7, 4], [7, 5], [6, 6], [8, 5], [7, 6], [8, 6]], [3, 4, 5]],
        (kind, [m, n]) => kind !== 'prob' || m + n <= 12);
      const split = (tt) => { const hi = Math.ceil((tt + 1) / 2), lo = Math.floor((tt + 1) / 2); return [choose(m - 1, hi - 1) * choose(n - 1, lo - 1), choose(m - 1, lo - 1) * choose(n - 1, hi - 1)]; };
      const hi = Math.ceil((t + 1) / 2), lo = Math.floor((t + 1) / 2), [cE, cN] = split(t), ans = cE + cN, T = routes(m, n);
      const W = kind === 'words' ? { thing: 'string', turn: 'changes of letter', run: 'block', runs: 'blocks', A: 'E', B: 'N', unit: 'letter E', unitB: 'letter N', unitsA: 'E’s', unitsB: 'N’s' }
        : kind === 'prob' ? { thing: 'path', turn: 'turns', run: 'run', runs: 'runs', A: 'right', B: 'up', unitsA: 'right steps', unitsB: 'up steps' }
          : { thing: 'route', turn: 'turns', run: 'run', runs: 'runs', A: 'east', B: 'north', unitsA: 'east blocks', unitsB: 'north blocks' };
      const wrongs = [cE === cN ? cE : Math.max(cE, cN), total(split(t - 1)), total(split(t + 1)), choose(m, hi) * choose(n, lo) + choose(m, lo) * choose(n, hi), cE * cN];
      return {
        topic: 'Grid routes with roadblocks', rank: t % 2 ? 21 : 22,
        text: {
          count: `A ${d.pick(['delivery robot', 'street sweeper', 'snowplow'])} drives along a grid of streets from (0, 0) to (${m}, ${n}), one block at a time, each block going east or north. A turn is a place where it switches from east to north or from north to east. How many of its routes have exactly ${t} turns?`,
          words: `How many strings made of ${m} letters E and ${n} letters N change letter exactly ${t} times when read from left to right? (For example, EENEN changes letter 3 times.)`,
          prob: `A path from (0, 0) to (${m}, ${n}) is made of ${m + n} unit steps, each one unit right or one unit up, and is chosen at random from all such paths. What is the probability that it changes direction exactly ${t} times?`,
        }[kind],
        answer: kind === 'prob' ? choices(d, cut(ans, T), wrongs.map((v) => cut(v, T)).filter(under1), showFrac) : choices(d, ans, wrongs),
        check: () => {
          let c = 0;
          eachRoute(m, n, (pts) => {
            let turns = 0;
            for (let i = 2; i < pts.length; i++) if (pts[i][0] - pts[i - 1][0] !== pts[i - 1][0] - pts[i - 2][0]) turns++;
            if (turns === t) c++;
          });
          return kind === 'prob' ? verdict(big(c, T), cut(ans, T)) : c === ans ? '' : `counted ${c}`;
        },
        solution: `A ${W.thing} with exactly ${t} ${W.turn} is made of ${t + 1} ${W.runs}, alternating between ${W.A} and ${W.B}. If it starts with ${W.A}, it has ${hi} ${W.A} ${W.runs} and ${lo} ${W.B} ${W.runs}. Cutting the ${m} ${W.unitsA} into ${hi} ${W.runs}, none of them empty, means choosing ${hi - 1} of the ${m - 1} gaps between them, in C(${m - 1}, ${hi - 1}) ways, and the ${n} ${W.unitsB} go into ${lo} ${W.runs} in C(${n - 1}, ${lo - 1}) ways, so ${choose(m - 1, hi - 1)}·${choose(n - 1, lo - 1)} = ${num(cE)} start with ${W.A}. If it starts with ${W.B}, it has ${lo} ${W.A} ${W.runs} and ${hi} ${W.B} ${W.runs}, which gives C(${m - 1}, ${lo - 1})·C(${n - 1}, ${hi - 1}) = ${num(cN)}. ${kind === 'prob' ? `So ${num(cE)} + ${num(cN)} = ${num(ans)} of the C(${m + n}, ${n}) = ${num(T)} paths have exactly ${t} turns, and the probability is <b>${fr(cut(ans, T))}</b>.` : `In all, ${num(cE)} + ${num(cN)} = <b>${num(ans)}</b>.`}`,
      };
    },
    // a park that closes a whole block of intersections: every route passes it on one side or the other
    (d, ctx) => {
      const [kind, m, n, x1, w, y1, h] = pickKind(ctx, 'park', ['count', 'prob'], [[6, 7, 8], [4, 5, 6], [1, 2, 3], [0, 1, 2], [1, 2], [0, 1, 2]],
        (kind, m, n, x1, w, y1, h) => n <= m && x1 + w <= m - 2 && y1 + h <= n - 1 && w + h >= 1 && (kind === 'count' || m + n <= 12));
      const x2 = x1 + w, y2 = y1 + h, T = routes(m, n), who = d.pick(WALKERS);
      const below = range(0, y1 - 1).map((j) => [routes(x2, j), routes(m - x2 - 1, n - j)]), above = range(0, x1 - 1).map((i) => [routes(i, y2), routes(m - i, n - y2 - 1)]);
      const B = total(below.map(([a, b]) => a * b)), A = total(above.map(([a, b]) => a * b)), ans = A + B;
      const terms = (list) => list.map(([a, b]) => `${num(a)}·${num(b)}`).join(' + ');
      const corners = T - routes(x1, y1) * routes(m - x1, n - y1) - routes(x2, y2) * routes(m - x2, n - y2) + routes(x1, y1) * routes(w, h) * routes(m - x2, n - y2);
      const wrongs = [A, B, T - routes(x1, y1) * routes(m - x1, n - y1), ans + routes(x2, y1) * routes(m - x2 - 1, n - y1), corners, ans + routes(x1, y2) * routes(m - x1, n - y2 - 1)];
      const xr = w ? `${x1} ≤ x ≤ ${x2}` : `x = ${x1}`, yr = h ? `${y1} ≤ y ≤ ${y2}` : `y = ${y1}`;
      return {
        topic: 'Grid routes with roadblocks', rank: 21,
        text: `A ${who} travels along the streets of the grid shown from A = (0, 0) to B = (${m}, ${n}), going only east or north. A park, shaded, has closed every intersection (x, y) with ${xr} and ${yr}. ${kind === 'count'
          ? 'How many routes from A to B pass through none of the closed intersections?'
          : 'Before the park was built, the route was chosen at random from all routes from A to B, all equally likely. What is the probability that the chosen route misses every intersection that is now closed?'}`,
        figure: streets(m, n, { park: [x1, y1, x2, y2] }),
        answer: kind === 'count' ? choices(d, ans, wrongs) : choices(d, cut(ans, T), wrongs.filter((v) => v > 0).map((v) => cut(v, T)).filter(under1), showFrac),
        check: () => {
          // fill in every intersection with the number of open routes to it
          const ways = range(0, m).map(() => Array(n + 1).fill(0));
          for (let x = 0; x <= m; x++) for (let y = 0; y <= n; y++) {
            if (x >= x1 && x <= x2 && y >= y1 && y <= y2) continue;
            ways[x][y] = x + y === 0 ? 1 : (x ? ways[x - 1][y] : 0) + (y ? ways[x][y - 1] : 0);
          }
          const c = ways[m][n];
          return kind === 'count' ? (c === ans ? '' : `counted ${c}`) : verdict(big(c, T), cut(ans, T));
        },
        solution: `Every route that misses the park passes either below it (to the southeast) or above it (to the northwest), and none does both, so count the two kinds separately. A route below the park crosses from the line x = ${x2} to the line x = ${x2 + 1} by an east block ${y1 === 1 ? 'along the bottom street, at height 0, since any higher would run into the park' : `at some height j from 0 to ${y1 - 1}, since any higher would run into the park`}. It is a route from A to (${x2}, ${y1 === 1 ? 0 : 'j'}), then that block, then a route from (${x2 + 1}, ${y1 === 1 ? 0 : 'j'}) to B, which gives ${terms(below)} = ${num(B)} routes. In the same way a route above the park crosses from the line y = ${y2} to the line y = ${y2 + 1} by a north block ${x1 === 1 ? 'along the left street, at x = 0' : `at some x = i from 0 to ${x1 - 1}`}, which gives ${terms(above)} = ${num(A)} routes. ${kind === 'count' ? `So there are ${num(B)} + ${num(A)} = <b>${num(ans)}</b> routes.` : `So ${num(B)} + ${num(A)} = ${num(ans)} of the C(${m + n}, ${n}) = ${num(T)} routes miss the park, and the probability is <b>${fr(cut(ans, T))}</b>.`}`,
      };
    },
    // never behind: the reflection trick (swap everything up to the first time the wrong side leads by one)
    (d, ctx) => {
      const [kind, a, b] = pickKind(ctx, 'ballot', ['queue', 'tie', 'ahead'], [range(4, 8), range(2, 6)], (kind, a, b) => b < a && (kind !== 'queue' || a + b >= 8));
      const Y = choose(a + b, b), X = choose(a + b, b - 1), good = Y - X, [A, B] = d.pick(ELECTION);
      const Y1 = choose(a + b - 1, b), X1 = choose(a + b - 1, b - 1), ahead = Y1 - X1;
      const reflect = (tens, fives, more, fewer, total_) => `in a bad string, find the first point where the ${tens} lead by exactly one, and swap every letter up to and including that point. The result has ${more} ${fives} and ${fewer} ${tens}, and every string like that comes from exactly one bad string (it has more ${fives} than ${tens}, so it reaches a first point where the ${fives} lead by one, and swapping back undoes it). That makes C(${total_}, ${fewer}) = ${num(choose(total_, fewer))} bad strings.`;
      const ans = { queue: good, tie: cut(good, Y), ahead: cut(ahead, Y) }[kind];
      return {
        topic: 'Grid routes with roadblocks', rank: 23,
        text: {
          queue: `${Cap(WORDS[a])} people with a $5 bill and ${WORDS[b]} people with a $10 bill line up to buy $5 tickets. The cashier starts with no money and can give change only from the $5 bills already taken in. People with the same kind of bill count as alike, so an order of the line is a string of ${a} fives and ${b} tens. For how many of these orders can the cashier always give change?`,
          tie: `In a class election ${A} gets ${a} votes and ${B} gets ${b}. The ballots are counted one at a time, in random order. What is the probability that ${A} is never behind ${B} during the count? (Being tied is fine.)`,
          ahead: `In a class election ${A} gets ${a} votes and ${B} gets ${b}. The ballots are counted one at a time, in random order. What is the probability that ${A} is strictly ahead of ${B} after every ballot, from the first one to the last?`,
        }[kind],
        answer: kind === 'queue'
          ? choices(d, good, [Y, Y - choose(a + b, b - 2), Y1, ahead, Y - choose(a + b, b + 1)])
          : choices(d, ans, (kind === 'tie' ? [cut(a - b, a + b), cut(a, a + b), cut(a - b + 1, a + b), cut(a - b, a), cut(b, a + 1)] : [cut(a - b + 1, a + 1), cut(a - b, a), cut(a, a + b), cut(a - b + 1, a + b), cut(a - b, a + b + 1)]).filter(under1), showFrac),
        check: () => {
          let c = 0;
          for (let mask = 0; mask < 1 << (a + b); mask++) {
            if (popcount(mask) !== b) continue;
            let lead = 0, ok = true;
            for (let i = 0; i < a + b; i++) { lead += (mask >> i) & 1 ? -1 : 1; if (kind === 'ahead' ? lead <= 0 : lead < 0) ok = false; }
            if (ok) c++;
          }
          return kind === 'queue' ? (c === good ? '' : `counted ${c}`) : verdict(big(c, Y), ans);
        },
        solution: {
          queue: `Call an order bad if at some point the tens so far outnumber the fives, and count the bad orders with a reflection. In a bad order, find the first point where the tens lead by exactly one, and swap every letter up to and including that point (fives become tens and tens become fives). The result has ${a + 1} fives and ${b - 1} tens, and every string like that comes from exactly one bad order (it has more fives than tens, so it reaches a first point where the fives lead by one, and swapping back undoes it). So there are C(${a + b}, ${b - 1}) = ${num(X)} bad orders out of C(${a + b}, ${b}) = ${num(Y)}, and the cashier can always give change in ${num(Y)} − ${num(X)} = <b>${num(good)}</b> orders.`,
          tie: `Write the count as a string of ${a} A’s (votes for ${A}) and ${b} B’s (votes for ${B}); all C(${a + b}, ${b}) = ${num(Y)} strings are equally likely. ${A} falls behind exactly when at some point the B’s so far outnumber the A’s; call such a string bad, and count the bad strings with a reflection: ${reflect('B’s', 'A’s', a + 1, b - 1, a + b)} So ${A} is never behind with probability (${num(Y)} − ${num(X)})/${num(Y)} = ${num(good)}/${num(Y)} = <b>${fr(ans)}</b>.`,
          ahead: `Write the count as a string of ${a} A’s (votes for ${A}) and ${b} B’s (votes for ${B}); all C(${a + b}, ${b}) = ${num(Y)} strings are equally likely. The first letter must be an A, and after it ${A} leads by one, so ${A} stays strictly ahead exactly when, in the other ${a - 1} A’s and ${b} B’s, the B’s never outnumber the A’s. Call those strings bad when they do, and count them with a reflection: ${reflect('B’s', 'A’s', a, b - 1, a + b - 1)} So C(${a + b - 1}, ${b}) − ${num(X1)} = ${num(Y1)} − ${num(X1)} = ${num(ahead)} strings keep ${A} strictly ahead, and the probability is ${num(ahead)}/${num(Y)} = <b>${fr(ans)}</b>.`,
        }[kind],
      };
    },
  ],

  'Keeping pairs apart': [
    // no two equal letters side by side: inclusion and exclusion over the doubled letters, gluing each pair into a block
    (d, ctx) => {
      const [kind, [k, s]] = pickKind(ctx, 'apart', ['tiles', 'flags', 'prob'], [[[2, 3], [2, 4], [3, 0], [3, 1], [3, 2], [3, 3], [4, 0], [4, 1]]],
        (kind, [k, s]) => kind !== 'prob' || TWIN_WORDS[`${k},${s}`] || k >= 3);
      const N = 2 * k + s, S = glued(k, s), ans = noneApart(k, s), set = twinSet(d, k, s, kind, kind === 'prob' || d.chance(0.6)), name = d.pick(NAMES);
      // slips: stopping the inclusion and exclusion early, a glued pair counted as two orders, or not halving for the glued pairs
      const doubleGlue = total(range(0, k).map((j) => (j % 2 ? -1 : 1) * choose(k, j) * 2 ** j * fact(N - j) / 2 ** k));
      const noHalf = total(range(0, k).map((j) => (j % 2 ? -1 : 1) * choose(k, j) * fact(N - j) / 2 ** k));
      const wrongs = [S[0] - S[1], S[0] - S[1] + S[2], doubleGlue, noHalf, S[0] - S[1] + S[2] - (S[3] ?? 0), S[0]].filter((v) => v > 0 && v !== ans);
      const thing = set.flags ? 'color' : 'letter';
      const glue = range(2, k).map((j) => `${j === k ? '' : `C(${k}, ${j})·`}${factOver(N - j, k - j)} = ${num(S[j])}`);
      return {
        topic: 'Keeping pairs apart', rank: { 2: 18, 3: 20, 4: 21 }[k] + (kind === 'prob' ? 1 : 0),
        text: set.flags
          ? `${Cap(WORDS[N])} flags are hung in a row on a line: ${set.list}. Flags of the same color look alike. In how many different orders can they be hung so that no two flags of the same color are next to each other?`
          : kind === 'prob'
            ? (set.word ? `The letters of the word ${set.word} are shuffled into a random order, all different arrangements equally likely. What is the probability that no two identical letters end up next to each other?`
              : `The ${N} letter tiles ${set.tiles} are laid in a row in a random order, all different arrangements equally likely. What is the probability that no two tiles with the same letter are side by side?`)
            : set.word ? `How many different arrangements of the letters of ${set.word} have no two identical letters next to each other?`
              : `${name} has ${N} letter tiles: ${set.tiles}. Tiles with the same letter look alike. In how many different orders can the tiles be laid in a row so that no two tiles with the same letter are side by side?`,
        answer: kind === 'prob' ? choices(d, cut(ans, S[0]), wrongs.filter((v) => v > 0).map((v) => cut(v, S[0])).filter(under1), showFrac) : choices(d, ans, wrongs.filter(Number.isInteger)),
        check: () => {
          let c = 0, all = 0;
          eachArrangement([...Array(k).fill(2), ...Array(s).fill(1)], (q) => { all++; if (q.every((v, i) => !i || v !== q[i - 1])) c++; });
          return kind === 'prob' ? verdict(big(c, all), cut(ans, S[0])) : c === ans ? '' : `counted ${c}`;
        },
        solution: `Count all the arrangements, then take away those in which some ${thing} has its two ${set.copies} side by side, using inclusion and exclusion over the ${k} doubled ${thing}s. With ${N} ${set.items} and ${k} ${thing}s appearing twice, there are ${factOver(N, k)} = ${num(S[0])} arrangements in all. If one chosen ${thing} has its two ${set.copies} together, glue them into a single block: that leaves ${N - 1} things with ${k - 1} ${thing}${k - 1 === 1 ? '' : 's'} doubled, so ${factOver(N - 1, k - 1)} arrangements, and with ${k} choices of the ${thing} that makes ${num(S[1])}. In the same way, gluing ${k === 2 ? `both ${thing}s gives` : `two, three${k > 3 ? ' or four' : ''} chosen ${thing}s gives`} ${listing(glue)}. So ${signed(S.map((v, j) => (j % 2 ? -v : v)))} = ${kind === 'prob' ? `${num(ans)} arrangements have no two equal ${set.copies} together, and the probability is ${reduced(ans, S[0])}.` : `<b>${num(ans)}</b> arrangements have no two equal ${set.copies} together.`}`,
      };
    },
    // exactly r of the doubled letters together: choose them and glue them, then keep the rest apart
    (d, ctx) => {
      const [kind, [k, s, r]] = pickKind(ctx, 'exact', ['tiles', 'flags'], [[[3, 0, 1], [3, 1, 1], [3, 2, 1], [3, 3, 1], [3, 1, 2], [3, 2, 2], [3, 3, 2], [4, 0, 1], [4, 1, 1], [4, 0, 2], [4, 1, 2], [4, 0, 3]]]);
      const N = 2 * k + s, exact = (rr) => choose(k, rr) * noneApart(k - rr, s + rr), ans = exact(r), set = twinSet(d, k, s, kind, true), name = d.pick(NAMES);
      const inner = glued(k - r, s + r), Y = noneApart(k - r, s + r), S = glued(k, s), thing = set.flags ? 'color' : 'letter';
      const wrongs = [S[r], exact(r - 1), r < k ? exact(r + 1) : S[r] - Y, S[r] - S[r + 1], choose(k, r) * inner[0]];
      return {
        topic: 'Keeping pairs apart', rank: k === 3 ? 22 : 23,
        text: set.flags
          ? `${Cap(WORDS[N])} flags are hung in a row on a line: ${set.list}. Flags of the same color look alike. In how many different orders can they be hung so that exactly ${r} of the colors ${set.doubled} ${r === 1 ? 'has its' : 'have their'} two flags next to each other?`
          : set.word ? `In how many different arrangements of the letters of ${set.word} do exactly ${r} of the letters ${set.doubled} have their two copies side by side?`
            : `${name} has ${N} letter tiles: ${set.tiles}. Tiles with the same letter look alike. In how many different orders can the tiles be laid in a row so that exactly ${r} of the letters ${set.doubled} ${r === 1 ? 'has its' : 'have their'} two tiles side by side?`,
        answer: choices(d, ans, wrongs.filter((v) => Number.isInteger(v) && v > 0)),
        check: () => {
          let c = 0;
          eachArrangement([...Array(k).fill(2), ...Array(s).fill(1)], (q) => { let t = 0; for (let i = 1; i < q.length; i++) if (q[i] === q[i - 1]) t++; if (t === r) c++; });
          return c === ans ? '' : `counted ${c}`;
        },
        solution: `First choose which ${r === 1 ? `${thing} has its` : `${r} ${thing}s have their`} two ${set.copies} together: C(${k}, ${r}) = ${choose(k, r)} ways. Glue ${r === 1 ? 'those two' : 'each of those pairs'} into one block, which then acts like a single ${thing} of its own: now there are ${N - r} things, with ${k - r} ${thing}${k - r === 1 ? '' : 's'} still doubled, ${k - r === 1 ? 'whose two copies must not touch' : 'and no two equal copies may touch'}. Count those orders with inclusion and exclusion over the doubled ${thing}${k - r === 1 ? '' : 's'}: ${alt(range(0, k - r).map((j) => `${j ? `C(${k - r}, ${j})·` : ''}${factOver(N - r - j, k - r - j)}`))} = ${signed(inner.map((v, j) => (j % 2 ? -v : v)))} = ${num(Y)}. So the answer is ${choose(k, r)}·${num(Y)} = <b>${num(ans)}</b>.`,
      };
    },
    // married couples, men and women alternating and nobody next to their own spouse
    (d, ctx) => {
      const [kind, n] = pickKind(ctx, 'menage', ['row', 'round', 'same', 'prob'], [[3, 4]]);
      const L = lineWays(n), U = ringWays(n), F = fact(n), row = 2 * F * L, round = 2 * F * U, same = fact(n - 1) * U, all = fact(2 * n);
      const ans = { row, round, same, prob: cut(round, all) }[kind];
      const chain = alt(range(0, n).map((k) => `${k ? `${choose(2 * n - k, k)}·` : ''}${fact(n - k)}`)), ring = alt(range(0, n).map((k) => `${k ? `${ringPick(n, k)}·` : ''}${fact(n - k)}`));
      const men = `Seat the men first, then the women. The men take either the odd-numbered chairs or the even-numbered ones, 2 ways, and they can be ordered in ${n}! = ${F} ways.`;
      const ie = (pairs, rule) => `Now ${pairs} pairs of neighboring chairs ${rule}, each pair one man’s chair and one woman’s chair, and no pair may hold a couple. Use inclusion and exclusion on the pairs that do: a set of k such pairs can all hold couples only if no two of them share a chair, which means no two are next to each other`;
      return {
        topic: 'Keeping pairs apart', rank: n === 3 ? 21 : 24,
        text: {
          row: `${Cap(WORDS[n])} married couples sit in a row of ${2 * n} chairs. Men and women must alternate, and nobody may sit next to their own spouse. In how many ways can the ${2 * n} people be seated?`,
          round: `${Cap(WORDS[n])} married couples sit around a round table with ${2 * n} chairs, numbered 1 to ${2 * n}. Men and women must alternate around the table, and nobody may sit next to their own spouse. In how many ways can the ${2 * n} people be seated?`,
          same: `${Cap(WORDS[n])} married couples sit around a round table with ${2 * n} chairs, where two seatings that differ only by turning the table count as the same. Men and women must alternate around the table, and nobody may sit next to their own spouse. How many different seatings are there?`,
          prob: `${Cap(WORDS[n])} married couples sit down in random order around a round table with ${2 * n} numbered chairs, all ${num(all)} seatings equally likely. What is the probability that men and women alternate around the table and nobody sits next to their own spouse?`,
        }[kind],
        answer: kind === 'prob'
          ? choices(d, ans, [cut(2 * F * L, all), cut(2 * F * DER[n], all), cut(F * U, all), cut(2 * F * F, all), cut(F * F, all)].filter(under1), showFrac)
          : choices(d, ans, { row: [2 * F * DER[n], F * L, round, 2 * F * F, 2 * F * (L + 1)], round: [row, F * U, 2 * F * DER[n], same, 2 * F * F], same: [round, fact(n - 1) * L, F * U, fact(n - 1) * DER[n], fact(n - 1) * F] }[kind]),
        check: () => {
          // person i < n is a man, his wife is i + n
          let c = 0;
          const N = 2 * n, ringy = kind !== 'row';
          eachPerm(N, (p) => {
            for (let i = 0; i < N; i++) {
              const j = i + 1 < N ? i + 1 : ringy ? 0 : -1;
              if (j < 0) continue;
              if ((p[i] < n) === (p[j] < n) || p[i] % n === p[j] % n) return;
            }
            c++;
          });
          if (kind === 'same') c /= N;
          return kind === 'prob' ? verdict(big(c, all), ans) : c === ans ? '' : `counted ${c}`;
        },
        solution: kind === 'row'
          ? `${men} ${ie(2 * n - 1, 'form a chain')} in the chain. There are C(${2 * n} − k, k) such sets of k pairs, and then the other ${n} − k women sit in (${n} − k)! ways. So the women can be seated in ${chain} = ${L} way${L === 1 ? '' : 's'}. In all, 2·${F}·${L} = <b>${num(row)}</b>.`
          : `${kind === 'same' ? `Turn the table so that one particular man sits in chair 1; then the men take the odd chairs, and the other men can be ordered in ${n - 1}! = ${fact(n - 1)} ways.` : men} ${ie(2 * n, 'form a ring')} around the ring. Picking k of the ${2 * n} pairs in a ring with no two neighbors can be done in C(${2 * n} − k, k) + C(${2 * n - 1} − k, k − 1) ways (split on whether pair 1 is picked), and then the other ${n} − k women sit in (${n} − k)! ways. So the women can be seated in ${ring} = ${U} way${U === 1 ? '' : 's'}. ${{
            round: `In all, 2·${F}·${U} = <b>${num(round)}</b>.`,
            same: `So there are ${fact(n - 1)}·${U} = <b>${num(same)}</b> different seatings.`,
            prob: `That makes 2·${F}·${U} = ${num(round)} good seatings out of ${2 * n}! = ${num(all)}, so the probability is <b>${fr(ans)}</b>.`,
          }[kind]}`,
      };
    },
  ],

  'Tiling wider boards': [
    // 3 × n with dominoes: a second count for the board with a corner missing
    (d, ctx) => {
      const [n] = pick(ctx, 'three', [[4, 6, 8, 10]]);
      const { f, g } = threeWide(n), ans = f[n], name = d.pick(NAMES);
      const steps = range(2, n).map((m) => (m % 2 ? `g(${m}) = ${num(g[m])}` : `f(${m}) = ${num(f[m])}`)).join(', ');
      return {
        topic: 'Tiling wider boards', rank: { 4: 21, 6: 22, 8: 23, 10: 23 }[n],
        text: d.pick([
          `In how many ways can a 3 × ${n} rectangle be covered by 1 × 2 dominoes, with no gaps or overlaps?`,
          `A patio 3 meters wide and ${n} meters long is paved with 1 × 2 meter stone slabs, each laid along the patio or across it, with no gaps, overlaps or cut slabs. In how many ways can this be done?`,
          `${name}’s chocolate tray has 3 rows of ${n} square holes. ${name} fills it with ${3 * n / 2} bars, each covering two holes side by side in a row or in a column. In how many ways can the tray be filled?`,
        ]),
        answer: choices(d, ans, [3 ** (n / 2), 4 * f[n - 2], 3 * f[n - 2], f[n - 2] + 4 * g[n - 1], ans + f[n - 2], fib(n + 1)]),
        check: () => { const c = countTilings(3, n, [DOMINO]); return c === ans ? '' : `counted ${c}`; },
        solution: `Look at how the first column is covered, and keep a second count for boards with a corner square missing. Let f(m) count the tilings of a 3 × m board, and g(m) those of a 3 × m board with its bottom-left square removed (the top-left square gives the same count). In a full board, the first column is covered by three dominoes lying along the board, which fill the first two columns and leave a 3 × (m − 2) board, or by a domino standing in its top two or bottom two squares with a lying domino in the third square, which leaves a 3 × (m − 1) board with a corner missing. So f(m) = f(m − 2) + 2g(m − 1). When the bottom-left square is missing, the two squares above it are covered by one standing domino, leaving a full 3 × (m − 1) board, or by two lying dominoes, and then the bottom square of the second column needs a third lying domino, which leaves a 3 × (m − 2) board with a corner missing. So g(m) = f(m − 1) + g(m − 2). Starting from f(0) = 1 and g(1) = 1, the values go ${steps}, so there are <b>${num(ans)}</b> tilings.`,
      };
    },
    // 2 × n with dominoes and L-pieces
    (d, ctx) => {
      const [n] = pick(ctx, 'ell', [[4, 5, 6, 7, 8]]);
      const { f, g } = dominoEll(n + 1), ans = f[n];
      return {
        topic: 'Tiling wider boards', rank: n <= 6 ? 22 : 23,
        text: `A 2 × ${n} board is to be covered, with no gaps or overlaps, by 1 × 2 dominoes and L-shaped pieces made of three unit squares (both shown; each piece may be turned or flipped). In how many ways can this be done?`,
        figure: pieces(),
        answer: choices(d, ans, [f[n - 1] + f[n - 2] + 4 * g[n - 2], f[n - 1] + f[n - 2] + g[n - 2], ans + f[n - 2], 2 * f[n - 1], fib(n + 1), f[n + 1]]),
        check: () => { const c = countTilings(2, n, [DOMINO, ELL]); return c === ans ? '' : `counted ${c}`; },
        solution: `Look at how the right end of the board is covered, and keep a second count for boards with one extra square sticking out. Let f(m) count the coverings of a 2 × m board, and g(m) those of a 2 × m board with one more square stuck to the right end of its top row (the bottom row gives the same count). At the right end of a full board there is a standing domino, which leaves a 2 × (m − 1) board, or two lying dominoes, which leave 2 × (m − 2), or an L covering the last column and one square of the column before it, in 2 ways, each leaving a 2 × (m − 2) board with one square sticking out. So f(m) = f(m − 1) + f(m − 2) + 2g(m − 2). The extra square of g(m) is covered by a lying domino, which leaves a 2 × (m − 1) board with a square sticking out of the other row, or by an L that also covers the whole last column, which leaves a full 2 × (m − 1) board, so g(m) = g(m − 1) + f(m − 1). From f(0) = f(1) = 1, g(0) = 0 and g(1) = 1, the values of f for m = 1 to ${n} are ${f.slice(1, n + 1).map((v) => num(v)).join(', ')}, and of g are ${g.slice(1, n + 1).map((v) => num(v)).join(', ')}. So there are <b>${num(ans)}</b> coverings.`,
      };
    },
    // 2 × n with unit squares and dominoes
    (d, ctx) => {
      const [n] = pick(ctx, 'sqdom', [[3, 4, 5, 6]]);
      const { f, g } = squareDomino(n), ans = f[n];
      return {
        topic: 'Tiling wider boards', rank: { 3: 21, 4: 22, 5: 23, 6: 23 }[n],
        text: d.pick([
          `A 2 × ${n} board is covered, with no gaps or overlaps, by 1 × 1 squares and 1 × 2 dominoes (a domino may lie along the board or stand across it). How many different coverings are there?`,
          `A wall panel 2 feet tall and ${n} feet wide is covered with 1-foot square tiles and 1 × 2 foot tiles, which may be set either way, with no gaps, overlaps or cut tiles. How many different panels can be made?`,
        ]),
        answer: choices(d, ans, [2 * f[n - 1] + f[n - 2] + 4 * g[n - 2], 2 * f[n - 1] + f[n - 2] + g[n - 2], fib(n + 1) ** 2, ans + f[n - 2], 2 * f[n - 1] + f[n - 2], 3 ** n]),
        check: () => { const c = countTilings(2, n, [SQUARE, DOMINO]); return c === ans ? '' : `counted ${c}`; },
        solution: `Look at how the right end of the board is covered, and keep a second count for boards with one extra square sticking out. Let f(m) count the coverings of a 2 × m board, and g(m) those of a 2 × m board with one more square stuck to the right end of its top row (the bottom row gives the same count). In a full board, the last column is a standing domino or two squares, each leaving a 2 × (m − 1) board, or two lying dominoes, leaving 2 × (m − 2), or one lying domino and one square, in 2 ways, each leaving a 2 × (m − 2) board with one square sticking out. So f(m) = 2f(m − 1) + f(m − 2) + 2g(m − 2). The extra square of g(m) is a square tile, leaving a full 2 × m board, or half of a lying domino, leaving a 2 × (m − 1) board with a square sticking out of the other row, so g(m) = f(m) + g(m − 1). From f(0) = 1, g(0) = 1 and f(1) = 2, the values of f for m = 1 to ${n} are ${f.slice(1, n + 1).map((v) => num(v)).join(', ')}, and of g are ${g.slice(1, n + 1).map((v) => num(v)).join(', ')}. So there are <b>${num(ans)}</b> coverings.`,
      };
    },
  ],

  'A bug on a solid': [
    // the chance of reaching the opposite vertex before coming home: write every layer's chance in terms of the first
    (d, ctx) => {
      const [kind] = pick(ctx, 'race', [['octa', 'cube', 'icosa', 'dodeca']]);
      const S = SOLIDS[kind], D = S.layers.length - 1, c = [[0, 1], [1, 1]];
      for (let dd = 1; dd < D; dd++) c[dd + 1] = over(minus(times([S.deg - S.side[dd], 1], c[dd]), times([S.back[dd], 1], c[dd - 1])), [S.out[dd], 1]);
      const t = over(ONE, c[D]), coef = (v) => (v[0] === v[1] ? 't' : `${fr(v)}t`);
      const term = (k, i) => (k === 0 ? '' : `${k === 1 ? '' : k}x${ix(i)}`);
      const eqs = range(1, D - 1).map((dd) => `from distance ${dd}, ${S.deg}x${ix(dd)} = ${[term(S.back[dd], dd - 1), term(S.side[dd], dd), term(S.out[dd], dd + 1)].filter(Boolean).join(' + ')}, so x${ix(dd + 1)} = ${coef(c[dd + 1])}`);
      return {
        topic: 'A bug on a solid', rank: { octa: 19, cube: 21, icosa: 22, dodeca: 23 }[kind],
        text: `A bug sits at one vertex of ${S.about}. Each minute it crawls along one of the edges at its vertex, chosen at random, to the next vertex. What is the probability that it reaches the vertex opposite its starting point before it gets back to its starting point?`,
        answer: choices(d, t, [[1, 2], [1, D], minus(ONE, t), [1, S.V / 2], times(t, [1, 2]), [S.out[D - 1], S.deg], over(ONE, c[D - 1]), [1, S.V], [S.out[1], S.deg], [2, 3], [1, 3]].filter(under1), showFrac),
        check: () => { const G = solidGraph(kind); return verdict(graphRace(G, 0, G.opp), t); },
        solution: `All that matters is how far the bug is from its start, so group the vertices by distance. ${layerText(S)} Let x${ix('d')} be the chance of reaching the opposite vertex before the start from a vertex at distance d, so x${ix(0)} = 0 and x${ix(D)} = 1, and call x${ix(1)} = t. Each chance is the average over the ${S.deg} edges: ${eqs.join('; ')}. Since x${ix(D)} = 1, ${coef(c[D])} = 1 and t = ${fr(t)}. The first move always goes to distance 1, so the answer is <b>${fr(t)}</b>.`,
      };
    },
    // the expected number of moves out to the opposite vertex, or back home: one stage per layer
    (d, ctx) => {
      const [kind, solid] = pickKind(ctx, 'time', ['reach', 'return'], [['octa', 'cube', 'icosa', 'dodeca']]);
      const S = SOLIDS[solid], D = S.layers.length - 1, deg = S.deg;
      const h = [[1, 1]];
      for (let dd = 1; dd < D; dd++) h[dd] = over(plus([deg, 1], times([S.back[dd], 1], h[dd - 1])), [S.out[dd], 1]);
      const k = [];
      k[D] = [deg / S.back[D], 1];
      for (let dd = D - 1; dd >= 1; dd--) k[dd] = over(plus([deg, 1], times([S.out[dd], 1], k[dd + 1])), [S.back[dd], 1]);
      const reach = h.reduce(plus, [0, 1]), back = plus(ONE, k[1]), ans = kind === 'reach' ? reach : back;
      const showH = range(1, D - 1).map((dd) => `h${ix(dd)} = (${deg} + ${S.back[dd]}·${fr(h[dd - 1])})/${S.out[dd]} = ${fr(h[dd])}`).join(', ');
      const showK = range(1, D - 1).reverse().map((dd) => `k${ix(dd)} = (${deg} + ${S.out[dd]}·${fr(k[dd + 1])})/${S.back[dd]} = ${fr(k[dd])}`).join(', ');
      return {
        topic: 'A bug on a solid', rank: kind === 'reach' ? { octa: 20, cube: 21, icosa: 22, dodeca: 24 }[solid] : { octa: 21, cube: 22, icosa: 23, dodeca: 24 }[solid],
        text: `A bug sits at one vertex of ${S.about}. Each minute it crawls along one of the edges at its vertex, chosen at random, to the next vertex. What is the expected number of minutes until it ${kind === 'reach' ? 'first reaches the vertex opposite its starting point' : 'first gets back to its starting point'}?`,
        answer: choices(d, ans, (kind === 'reach' ? [minus(reach, ONE), plus(reach, [D, 1]), back, [S.V * deg / 2, 1], [S.V - 1, 1], [D * D, 1], [deg * D, 1], times(reach, [2, 1])] : [minus(back, ONE), reach, [deg, 1], [2 * deg, 1], [S.V + 1, 1], [2 * (S.V - 1), 1]]).filter(positive), showFrac),
        check: () => { const G = solidGraph(solid); return verdict(kind === 'reach' ? graphTime(G, 0, G.opp) : graphReturn(G, 0), ans); },
        solution: kind === 'reach'
          ? `Break the trip into stages, one for each step farther out, and group the vertices by distance. ${layerText(S)} Let h${ix('d')} be the expected number of moves to get from distance d to distance d + 1 for the first time; from the start every move goes out, so h${ix(0)} = 1. From a vertex at distance d with b edges back, s to its own distance and f out, a move goes out with chance f/${deg}, sideways with chance s/${deg} (and then h${ix('d')} more moves are needed) or back with chance b/${deg} (and then h${ix('d − 1')} + h${ix('d')} more). So h${ix('d')} = 1 + (s/${deg})h${ix('d')} + (b/${deg})(h${ix('d − 1')} + h${ix('d')}), which works out to h${ix('d')} = (${deg} + b·h${ix('d − 1')})/f. Layer by layer, ${showH}. The expected number of minutes is ${h.map(fr).join(' + ')} = <b>${fr(ans)}</b>.`
          : `The first move always goes to distance 1, so the answer is 1 plus the expected time to get from distance 1 back to the start; group the vertices by distance to find it. ${layerText(S)} Let k${ix('d')} be the expected number of moves to get from distance d to distance d − 1 for the first time; from the opposite vertex every move comes in, so k${ix(D)} = 1. From a vertex at distance d with b edges back, s to its own distance and f out, a move comes in with chance b/${deg}, sideways with chance s/${deg} (and then k${ix('d')} more moves are needed) or out with chance f/${deg} (and then k${ix('d + 1')} + k${ix('d')} more), which works out to k${ix('d')} = (${deg} + f·k${ix('d + 1')})/b. Working inward, ${showK}. So the answer is 1 + ${fr(k[1])} = <b>${fr(ans)}</b>.`,
      };
    },
    // the chance of being at the start (or the opposite vertex) after exactly n moves
    (d, ctx) => {
      const CASES = [...[4, 5, 6, 7].flatMap((n) => [['octa', n, 'start'], ['octa', n, 'opposite']]), ['cube', 4, 'start'], ['cube', 6, 'start'], ['cube', 8, 'start'], ['cube', 5, 'opposite'], ['cube', 7, 'opposite']];
      const [kind, [, n, where]] = pickKind(ctx, 'steps', ['octa', 'cube'], [CASES], (kind, c) => c[0] === kind);
      const S = SOLIDS[kind];
      let ans, seq, sol;
      if (kind === 'octa') {
        const a = [[1, 1], [0, 1]];
        for (let m = 1; m < n; m++) a[m + 1] = times(minus(ONE, times([2, 1], a[m])), [1, 4]);
        ans = a[n];
        seq = a.slice(2, n + 1).map((v, i) => `a${ix(i + 2)} = ${fr(v)}`).join(', ');
        sol = `Call the starting vertex A and the opposite one Z; the other four vertices form a square around the middle, and the bug is on that square after its first move. From the square a move goes to A with chance 1/4 and to Z with chance 1/4, so A and Z play the same part from then on: for every n ≥ 1 the bug is at Z with the same chance a${ix('n')} as at A, and on the square with chance 1 − 2a${ix('n')}. It can reach A only from the square, so a${ix('n + 1')} = (1 − 2a${ix('n')})/4. From a${ix(1)} = 0: ${seq}. So the answer is <b>${fr(ans)}</b>.`;
        if (where === 'opposite') sol = sol.replace('So the answer is', 'The chance of being at Z is the same, so the answer is');
      } else {
        const x = [];
        x[where === 'start' ? 0 : 1] = where === 'start' ? [1, 1] : [0, 1];
        for (let m = where === 'start' ? 0 : 1; m + 2 <= n; m += 2) x[m + 2] = plus([2, 9], times(x[m], [1, 9]));
        ans = x[n];
        seq = range(where === 'start' ? 2 : 3, n).filter((m) => (m - n) % 2 === 0).map((m) => `x${ix(m)} = ${fr(x[m])}`).join(', ');
        sol = where === 'start'
          ? `Each move changes the distance from the start by one, so after an even number of moves the bug is at the start or at distance 2; look two moves at a time. From the start, two moves bring it back with chance 1/3 (any first move, then the one edge back out of 3). From a vertex at distance 2, two moves reach the start with chance 2/3·1/3 = 2/9. So if x${ix('n')} is the chance of being at the start after n moves, x${ix('n + 2')} = (1/3)x${ix('n')} + (2/9)(1 − x${ix('n')}) = 2/9 + x${ix('n')}/9. From x${ix(0)} = 1: ${seq}. So the answer is <b>${fr(ans)}</b>.`
          : `Each move changes the distance from the start by one, so after an odd number of moves the bug is at distance 1 or at the opposite vertex; look two moves at a time. From the opposite vertex, two moves bring it back there with chance 1/3, and from a vertex at distance 1, two moves reach it with chance 2/3·1/3 = 2/9. So if x${ix('n')} is the chance of being at the opposite vertex after n moves, x${ix('n + 2')} = (1/3)x${ix('n')} + (2/9)(1 − x${ix('n')}) = 2/9 + x${ix('n')}/9. From x${ix(1)} = 0: ${seq}. So the answer is <b>${fr(ans)}</b>.`;
      }
      const prev = kind === 'octa' ? [cut(1, 4), cut(1, 6), [1, 2 ** n], cut(1, 3)] : [cut(1, 8), cut(1, 4), [1, 3 ** (n >> 1)], cut(2, 9)];
      return {
        topic: 'A bug on a solid', rank: kind === 'octa' ? 21 : 22,
        text: `A bug starts at a vertex of ${S.about}. Each minute it crawls along one of the edges at its vertex, chosen at random, to the next vertex. What is the probability that after exactly ${n} minutes it is ${where === 'start' ? 'back at its starting vertex' : 'at the vertex opposite its starting vertex'}?`,
        answer: choices(d, ans, [...prev, times(ans, [1, 2]), plus(ans, [1, 4 ** (n - 2)])].filter(under1), showFrac),
        check: () => { const G = solidGraph(kind); return verdict(graphWalks(G, n, where === 'start' ? 0 : G.opp), ans); },
        solution: sol,
      };
    },
  ],

  'Linearity of expectation': [
    // runs of one color: one plus the neighboring pairs that differ
    (d, ctx) => {
      const CASES = [[4, 3], [5, 3], [5, 4], [6, 3], [6, 4], [6, 5], [7, 4], [7, 5], [8, 4]], TRIPLES = [[3, 2, 2], [4, 3, 2], [3, 3, 3], [4, 2, 2], [5, 3, 2], [4, 4, 2], [3, 3, 2]];
      const [kind, cs] = pickKind(ctx, 'runs', ['row2', 'ring2', 'row3'], [[...CASES, ...TRIPLES]], (kind, cs) => (kind === 'row3') === (cs.length === 3));
      const N = total(cs), same = total(cs.map((c) => c * (c - 1))), [r, b] = cs;
      const ans = { row2: cut(N + 2 * r * b, N), ring2: cut(2 * r * b, N - 1), row3: cut(N * N - same, N) }[kind];
      const pDiff = cut(N * (N - 1) - same, N * (N - 1));
      const wrongs = {
        row2: [cut(2 * r * b, N), plus(ONE, cut(2 * r * b, N - 1)), plus(ONE, cut((N - 1) * 2 * r * b, N * N)), cut(N + 1, 2), plus(ONE, cut(r * b, N))],
        ring2: [plus(ONE, cut(2 * r * b, N - 1)), cut(2 * r * b, N), cut(r * b, N - 1), cut(N, 2), cut(2 * r * b * N, N * N)],
        row3: [cut(N * N - same - N, N), plus(ONE, times([N, 1], pDiff)), plus(ONE, times([N - 1, 1], minus(ONE, cut(total(cs.map((c) => c * c)), N * N)))), cut(N + 1, 2), plus(ONE, cut(2 * (N - 1), 3)), [N, 1]],
      }[kind];
      const cols = ['red', 'white', 'blue'];
      return {
        topic: 'Linearity of expectation', rank: { row2: 20, ring2: 21, row3: 21 }[kind],
        text: {
          row2: `${Cap(WORDS[r])} red and ${WORDS[b]} blue marbles are lined up in a row in random order, all orders of the colors equally likely. A run is a longest block of neighboring marbles of one color; for example, RRBRBB has 4 runs. What is the expected number of runs?`,
          ring2: `A circular necklace has ${N} evenly spaced spots. ${Cap(WORDS[r])} of them are chosen at random for red beads, all choices equally likely, and the other ${WORDS[b]} get blue beads. A run is a longest block of neighboring beads of one color around the circle. What is the expected number of runs?`,
          row3: `${listing(cs.map((c, i) => `${i ? WORDS[c] : Cap(WORDS[c])} ${cols[i]}`))} flags hang on a line in random order, all orders of the colors equally likely. A run is a longest block of neighboring flags of one color. What is the expected number of runs?`,
        }[kind],
        answer: choices(d, ans, wrongs, showFrac),
        check: () => {
          let sum = 0, all = 0;
          eachArrangement(cs, (q) => {
            all++;
            let runs = kind === 'ring2' ? 0 : 1;
            for (let i = 1; i < q.length; i++) if (q[i] !== q[i - 1]) runs++;
            if (kind === 'ring2' && q[0] !== q.at(-1)) runs++;
            sum += runs;
          });
          return verdict(big(sum, all), ans);
        },
        solution: {
          row2: `Count the runs by where they start: the first marble starts a run, and so does every marble whose left neighbor has the other color. So the number of runs is 1 plus the number of the ${N - 1} neighboring pairs that differ in color. A given pair of neighboring spots holds two marbles drawn without replacement, so it differs in color with chance 2·(${r}/${N})·(${b}/${N - 1}) = ${fr(cut(2 * r * b, N * (N - 1)))}. By linearity of expectation, the expected number of runs is 1 + ${N - 1}·${fr(cut(2 * r * b, N * (N - 1)))} = <b>${fr(ans)}</b>.`,
          ring2: `Around a circle each run ends where a bead is followed by one of the other color, and both colors are there, so the number of runs equals the number of the ${N} neighboring pairs that differ in color. A given pair of neighboring spots holds two beads drawn without replacement, so it differs with chance 2·(${r}/${N})·(${b}/${N - 1}) = ${fr(cut(2 * r * b, N * (N - 1)))}. By linearity of expectation, the expected number of runs is ${N}·${fr(cut(2 * r * b, N * (N - 1)))} = <b>${fr(ans)}</b>.`,
          row3: `Count the runs by where they start: the first flag starts a run, and so does every flag whose left neighbor has another color. So the number of runs is 1 plus the number of the ${N - 1} neighboring pairs that differ. A given pair of neighboring spots holds the same color with chance (${cs.map((c) => `${c}·${c - 1}`).join(' + ')})/(${N}·${N - 1}) = ${fr(cut(same, N * (N - 1)))}, so it differs with chance ${fr(pDiff)}. By linearity of expectation, the expected number of runs is 1 + ${N - 1}·${fr(pDiff)} = <b>${fr(ans)}</b>.`,
        }[kind],
      };
    },
    // where the special cards fall: each ordinary card is equally likely to be anywhere among them
    (d, ctx) => {
      const CASES = [['first', 52, 4], ['first', 20, 3], ['first', 15, 2], ['first', 24, 5], ['first', 30, 4], ['jth', 52, 4, 2], ['jth', 20, 4, 2], ['jth', 24, 3, 2], ['jth', 30, 5, 3], ['jth', 15, 4, 3],
        ['between', 52, 4], ['between', 20, 3], ['between', 24, 5], ['between', 16, 3], ['after', 52, 4], ['after', 20, 4], ['after', 30, 5], ['after', 13, 3]];
      const [kind, [, N, k, j = 1]] = pickKind(ctx, 'cards', ['first', 'jth', 'between', 'after'], [CASES], (kind, c) => c[0] === kind);
      const deck = N === 52, name = d.pick(NAMES), M = N - k;
      const ans = { first: cut(N + 1, k + 1), jth: cut(j * (N + 1), k + 1), between: plus([k - 2, 1], cut(M * (k - 1), k + 1)), after: cut(M, k + 1) }[kind];
      const S = deck ? { all: 'a standard 52-card deck, with 4 aces,', sp: 'ace', sps: 'aces', other: 'card that is not an ace', others: 'cards that are not aces' }
        : kind === 'first' || kind === 'jth' ? { sp: 'red marble', sps: 'red marbles', other: 'marble that is not red', others: 'other marbles' }
          : { all: `a deck of ${N} cards that includes ${k} jokers`, sp: 'joker', sps: 'jokers', other: 'card that is not a joker', others: 'other cards' };
      const why = { first: [1, `it comes before every ${S.sp}`, 'first'], jth: [j, `it comes before the ${ord(j)} ${S.sp}`, `in one of the first ${j} places`], between: [k - 1, `it lies between the first and the last ${S.sp}`, 'neither first nor last'], after: [1, `it comes after every ${S.sp}`, 'last'] }[kind];
      const per = cut(why[0], k + 1), part = times([M, 1], per);
      return {
        topic: 'Linearity of expectation', rank: { first: 21, jth: 22, between: 23, after: 22 }[kind],
        text: {
          first: deck ? 'A standard 52-card deck, with 4 aces, is shuffled, and cards are turned over one at a time from the top until the first ace appears. What is the expected number of cards turned over, counting the ace?'
            : `A bag holds ${N} marbles, ${k} of them red. ${name} draws marbles one at a time, without putting any back, until the first red marble comes out. What is the expected number of marbles drawn, counting the red one?`,
          jth: deck ? `A standard 52-card deck, with 4 aces, is shuffled, and cards are turned over one at a time from the top until the ${ord(j)} ace appears. What is the expected number of cards turned over, counting that ace?`
            : `A bag holds ${N} marbles, ${k} of them red. ${name} draws marbles one at a time, without putting any back, until the ${ord(j)} red marble comes out. What is the expected number of marbles drawn, counting that red one?`,
          between: `${Cap(S.all)} is shuffled. What is the expected number of cards strictly between the first ${S.sp} and the last ${S.sp}?`,
          after: `${Cap(S.all)} is shuffled, and cards are dealt from the top until all ${k} ${S.sps} have been dealt. What is the expected number of cards left undealt?`,
        }[kind],
        answer: choices(d, ans, {
          first: [cut(N, k), cut(N + 1, k), cut(N, k + 1), cut(M, k + 1), cut(M, k)],
          jth: [cut(j * N, k), cut(j * (N + 1), k), cut(j * N, k + 1), cut(j * M, k + 1), cut(N + 1, k + 1)],
          between: [cut(M * (k - 1), k + 1), plus([k - 2, 1], cut(M * (k - 1), k)), cut(N * (k - 1), k + 1), plus([k, 1], cut(M * (k - 1), k + 1)), cut((N + 1) * (k - 1), k + 1)],
          after: [cut(N, k + 1), cut(M, k), cut(N + 1, k + 1), cut(M + k + 1, k + 1), cut(M, k + 2)],
        }[kind].filter(positive), showFrac),
        check: () => {
          // every set of places for the special cards, equally likely
          let sum = 0, all = 0;
          const pos = range(0, k - 1);
          for (;;) {
            all++;
            sum += { first: pos[0] + 1, jth: pos[j - 1] + 1, between: pos[k - 1] - pos[0] - 1, after: N - 1 - pos[k - 1] }[kind];
            let i = k - 1;
            while (i >= 0 && pos[i] === N - k + i) i--;
            if (i < 0) break;
            pos[i]++;
            for (let t = i + 1; t < k; t++) pos[t] = pos[t - 1] + 1;
          }
          return verdict(big(sum, all), ans);
        },
        solution: `Look at the ${M} ${S.others} one at a time. Take any ${S.other} and look only at it and the ${k} ${S.sps}: all ${k + 1} orders of where it falls among them are equally likely, and ${why[1]} exactly when it is ${why[2]} among these ${k + 1}, which has chance ${fr(per)}. By linearity of expectation, the expected number of ${S.others} ${kind === 'between' ? `between the first and last ${S.sp}` : kind === 'after' ? `after the last ${S.sp}` : kind === 'first' ? `before the first ${S.sp}` : `before the ${ord(j)} ${S.sp}`} is ${M}·${fr(per)} = ${fr(part)}. ${{
          first: `Adding the ${S.sp} itself, the expected number is 1 + ${fr(part)} = <b>${fr(ans)}</b>.`,
          jth: `Adding the ${j} ${S.sps} themselves, the expected number is ${j} + ${fr(part)} = <b>${fr(ans)}</b>.`,
          between: `The ${plural(k - 2, S.sp, S.sps)} in the middle ${k - 2 === 1 ? 'lies' : 'lie'} between them too, so the expected number of cards between is ${k - 2} + ${fr(part)} = <b>${fr(ans)}</b>.`,
          after: `Those are exactly the cards left undealt, so the answer is <b>${fr(ans)}</b>.`,
        }[kind]}`,
      };
    },
    // collecting: the wait splits into stages, one for each wanted thing still missing
    (d, ctx) => {
      const CASES = [['faces', 6, 3], ['faces', 6, 4], ['faces', 6, 5], ['faces', 6, 6], ['faces', 8, 3], ['faces', 8, 4], ['faces', 10, 3], ['faces', 12, 4], ['faces', 4, 4], ['faces', 8, 5],
        ['pair', 3, 2, 1], ['pair', 4, 2, 1], ['pair', 2, 2, 1], ['pair', 5, 3, 2], ['pair', 4, 3, 1], ['pair', 6, 3, 1], ['pair', 5, 2, 2], ['pair', 3, 1, 1]];
      const [kind, c] = pickKind(ctx, 'collect', ['faces', 'pair'], [CASES], (kind, cs) => cs[0] === kind);
      const name = d.pick(NAMES);
      if (kind === 'faces') {
        const [, s, t] = c, ans = times([s, 1], harmonic(t)), stages = range(1, t).reverse().map((i) => cut(s, i));
        const anyT = range(0, t - 1).reduce((acc, i) => plus(acc, cut(s, s - i)), [0, 1]);
        return {
          topic: 'Linearity of expectation', rank: t >= 5 ? 21 : 20,
          text: `A fair ${s}-sided die, numbered 1 to ${s}, is rolled again and again until ${t === s ? 'every number has come up at least once' : `each of the numbers ${listing(range(1, t).map(String))} has come up at least once`}. What is the expected number of rolls?`,
          answer: choices(d, ans, [[s * t, 1], minus(ans, ONE), anyT, cut(s * (t + 1), 2), plus(times([s, 1], harmonic(t - 1)), ONE), plus(ans, ONE)].filter(positive), showFrac),
          check: () => {
            // the wait for the last of the t numbers, by inclusion and exclusion over which of them are still missing
            let e = big(0);
            for (let j = 1; j <= t; j++) e = (j % 2 ? qadd : qsub)(e, qmul(big(choose(t, j)), big(s, j)));
            return verdict(e, ans);
          },
          solution: `Split the wait into stages, one ending each time another of the wanted numbers comes up for the first time. While i of them are still missing, each roll hits one with chance i/${s}, and something with chance p per try takes 1/p tries on average, so that stage lasts ${s}/i rolls on average. By linearity of expectation, the expected total is ${stages.map(fr).join(' + ')} = <b>${fr(ans)}</b>.`,
        };
      }
      const [, a, b, g] = c, T = a + b + g, both = cut(T, b + g), ans = minus(plus(cut(T, b), cut(T, g)), both), most = Math.max(T / b, T / g);
      return {
        topic: 'Linearity of expectation', rank: 22,
        text: `A bag holds ${a} red, ${b} blue and ${g} green marble${g === 1 ? '' : 's'}. ${name} draws a marble, notes its color and puts it back, again and again, until at least one blue and at least one green marble have been drawn. What is the expected number of draws?`,
        answer: choices(d, ans, [plus(cut(T, b), cut(T, g)), cut(most * 6, 6), plus(both, cut(most * 6, 6)), minus(plus(cut(T, b), cut(T, g)), ONE), times([2, 1], both)], showFrac),
        check: () => {
          // states: nothing yet, blue only, green only (each draw counts 1)
          const Eb = big(T, g), Eg = big(T, b), p = (x) => big(x, T);
          const E0 = qdiv(qadd(big(1), qadd(qmul(p(b), Eb), qmul(p(g), Eg))), qsub(big(1), p(a)));
          return verdict(E0, ans);
        },
        solution: `Split the wait in two: first wait for a marble that is blue or green, then for the other of those two colors. Each draw is blue or green with chance ${b + g}/${T}, so the first part takes ${fr(both)} draws on average (something with chance p per try takes 1/p tries). That first one is blue with chance ${fr(cut(b, b + g))}, and then a green one takes ${fr(cut(T, g))} more draws on average; it is green with chance ${fr(cut(g, b + g))}, and then a blue one takes ${fr(cut(T, b))} more. By linearity, the expected number of draws is ${fr(both)} + ${fr(cut(b, b + g))}·${fr(cut(T, g))} + ${fr(cut(g, b + g))}·${fr(cut(T, b))} = <b>${fr(ans)}</b>.`,
      };
    },
    // squares and rectangles with matching corners in a randomly colored array of points
    (d, ctx) => {
      const CASES = [['axis', 4, 4], ['axis', 5, 5], ['axis', 6, 6], ['tilted', 3, 3], ['tilted', 4, 4], ['tilted', 5, 5], ['rect', 3, 4], ['rect', 4, 4], ['rect', 4, 5], ['rect', 3, 5], ['rect', 5, 5]];
      const [kind, [, m, n], c] = pickKind(ctx, 'mono', ['axis', 'tilted', 'rect'], [CASES, [2, 3]], (kind, cs) => cs[0] === kind);
      const axis = total(range(1, n - 1).map((s) => (n - s) ** 2)), tilted = total(range(1, n - 1).map((s) => s * (n - s) ** 2)), rect = choose(m, 2) * choose(n, 2);
      const count = { axis, tilted, rect }[kind], c3 = c ** 3, ans = cut(count, c3), cols = c === 2 ? 'red or blue' : 'red, white or blue';
      const what = { axis: 'squares with sides parallel to the rows', tilted: 'squares, tilted or not,', rect: 'rectangles with sides parallel to the rows' }[kind];
      const howMany = {
        axis: `A square of side s fits in (${n} − s)<sup>2</sup> places, so there are ${range(1, n - 1).map((s) => sq(n - s)).join(' + ')} = ${count} squares.`,
        tilted: `Every such square, tilted or not, fits snugly in an upright s by s box with one corner on each side of the box, and each upright s by s box holds exactly s of them: the box itself and s − 1 tilted ones. There are (${n} − s)<sup>2</sup> boxes of side s, so there are ${range(1, n - 1).map((s) => `${s}·${sq(n - s)}`).join(' + ')} = ${count} squares in all.`,
        rect: `A rectangle is fixed by choosing 2 of the ${n} columns and 2 of the ${m} rows of points, so there are C(${n}, 2)·C(${m}, 2) = ${count} rectangles.`,
      }[kind];
      return {
        topic: 'Linearity of expectation', rank: { axis: 20, rect: 20, tilted: 22 }[kind] + (c === 3 ? 1 : 0),
        text: `Each of the ${m * n} points of a ${m} by ${n} ${m === n ? 'square ' : ''}array of points, spaced 1 apart, is colored ${cols} at random, each color equally likely and each point on its own. What is the expected number of ${what} whose four corners are all points of the array and all the same color?`,
        answer: choices(d, ans, [cut(count, c ** 4), cut(count, c * c), kind === 'tilted' ? cut(axis, c3) : cut((m - 1) * (n - 1), c3), cut(count, 2 * c3), kind === 'tilted' ? cut(count + axis, c3) : cut(count * c, c3)], showFrac),
        check: () => {
          const k = latticeQuads(m, n, (Q) => (kind === 'rect' ? isUpright(Q) : isSquare(Q) && (kind === 'tilted' || isUpright(Q))));
          let same = 0;
          for (let x = 0; x < c ** 4; x++) { const a = x % c, b = Math.floor(x / c) % c, e = Math.floor(x / c / c) % c, f = Math.floor(x / c ** 3); if (a === b && b === e && e === f) same++; }
          return verdict(qmul(big(k), big(same, c ** 4)), ans);
        },
        solution: `By linearity of expectation, add up, over all these ${kind === 'rect' ? 'rectangles' : 'squares'}, the chance that the four corners match. The first corner can be any color, and each of the other three matches it with chance 1/${c}, so that chance is 1/${c}<sup>3</sup> = 1/${c3}. ${howMany} So the expected number is ${count}/${c3} = <b>${fr(ans)}</b>.`,
      };
    },
  ],

  'Chances from lengths and arcs': [
    // three lengths c, x, y with x and y random: the triangle inequalities cut corners off a rectangle
    (d, ctx) => {
      const [kind, [a, b, c]] = pickKind(ctx, 'sides', ['form', 'fail'], [[[3, 2, 1], [4, 3, 2], [5, 3, 2], [4, 2, 1], [5, 4, 3], [6, 4, 3], [4, 3, 1], [6, 3, 2], [5, 4, 2], [6, 5, 2], [5, 2, 1]]]);
      const R = [a * b, 1], T1 = cut(c * c, 2), T2 = cut((b - c) ** 2, 2), trap = a - c > b, T3 = trap ? cut(2 * b * (a - c) - b * b, 2) : cut((a - c) ** 2, 2);
      const good = minus(R, plus(plus(T1, T2), T3)), P = over(good, R), ans = kind === 'form' ? P : minus(ONE, P);
      const slips = [over(minus(R, plus(T2, T3)), R), over(minus(R, plus(T1, T3)), R), over(minus(R, plus(plus(T1, T2), cut((a - c) ** 2, 2))), R), over(minus(R, plus(T1, times([2, 1], T2))), R), over(minus(R, times([2, 1], T3)), R)];
      const wrongs = kind === 'form' ? [...slips, minus(ONE, P)] : [...slips.map((w) => minus(ONE, w)), P];
      const piece3 = trap
        ? `a trapezoid at the bottom right, between x = ${c} and x = ${a} under the line y = x − ${c}, cut off by the top edge y = ${b}: its parallel sides are ${a - c} and ${a - c - b} and its height is ${b}, so its area is ${fr(T3)}`
        : `a triangle at the bottom right with legs ${a - c}, of area ${fr(T3)}`;
      return {
        topic: 'Chances from lengths and arcs', rank: 20,
        text: `A number x is chosen at random between 0 and ${a}, and a number y at random between 0 and ${b}, each uniformly and independently. What is the probability that ${kind === 'form' ? `there is a triangle with side lengths ${c}, x and y` : `${c}, x and y cannot be the side lengths of a triangle`}?`,
        answer: choices(d, ans, wrongs.filter(under1), showFrac),
        check: () => {
          let poly = [corner(0, 0), corner(a, 0), corner(a, b), corner(0, b)];
          poly = clip(clip(clip(poly, -1, -1, -c), -1, 1, c), 1, -1, c);
          const p = qdiv(area(poly), big(a * b));
          return verdict(kind === 'form' ? p : qsub(big(1), p), ans);
        },
        solution: `Think of the choice as a point (x, y) dropped at random in the ${a} by ${b} rectangle, of area ${a * b}; the chance is an area divided by ${a * b}. Three lengths make a triangle exactly when each is less than the sum of the other two: here x + y > ${c}, y &lt; x + ${c} and x &lt; y + ${c}. The corner where x + y &lt; ${c} is a triangle with legs ${c}, of area ${fr(T1)}. The part where y > x + ${c} is a triangle at the top left with legs ${b - c}, of area ${fr(T2)}. The part where x > y + ${c} is ${piece3}. These pieces don’t overlap, so the ${kind === 'form' ? `good part has area ${a * b} − ${fr(T1)} − ${fr(T2)} − ${fr(T3)} = ${fr(good)}, and the probability is ${fr(good)} ÷ ${a * b}` : `bad part has area ${fr(T1)} + ${fr(T2)} + ${fr(T3)} = ${fr(minus(R, good))}, and the probability is ${fr(minus(R, good))} ÷ ${a * b}`} = <b>${fr(ans)}</b>.`,
      };
    },
    // a stick cut at two random points: the pieces fill a triangle, and each rule cuts off similar corners
    (d, ctx) => {
      const CASES = [['least', 12, 2], ['least', 12, 3], ['least', 10, 2], ['least', 20, 3], ['least', 30, 4], ['least', 15, 2], ['least', 20, 5], ['least', 18, 4],
        ['longest', 12, 5], ['longest', 12, 8], ['longest', 10, 4], ['longest', 20, 15], ['longest', 30, 12], ['longest', 12, 9], ['longest', 20, 9], ['longest', 18, 7], ['longest', 15, 10],
        ['between', 12, 2, 5], ['between', 20, 4, 9], ['between', 30, 5, 12], ['between', 20, 3, 10], ['between', 12, 2, 6], ['between', 30, 6, 13]];
      const [kind, cs] = pickKind(ctx, 'stick', ['least', 'longest', 'between'], [CASES], (kind, cs) => cs[0] === kind);
      const L = cs[1], unit = d.pick(['inches', 'centimeters']), LL = L * L, tri = `Call the two cut points x &lt; y (which cut is which does not matter), so (x, y) is a random point of the triangle 0 &lt; x &lt; y &lt; ${L}, of area ${L}<sup>2</sup>/2, and the pieces are x, y − x and ${L} − y.`;
      let ans, wrongs, text, sol, rank, rules;
      if (kind === 'least') {
        const c = cs[2], L1 = L - 3 * c;
        ans = cut(L1 * L1, LL);
        wrongs = [cut(L1, L), cut((L - 2 * c) ** 2, LL), cut((L - c) ** 3, LL * L), minus(ONE, cut(3 * c * c, LL)), cut(L1 ** 3, LL * L)];
        text = `every piece is at least ${c} ${unit} long`;
        sol = `${tri} Asking every piece to be at least ${c} means x ≥ ${c}, y − x ≥ ${c} and y ≤ ${L - c}, and these three lines cut out a smaller triangle of the same shape, with legs ${L} − 3·${c} = ${L1} instead of ${L}. Similar shapes have areas in the ratio of the squares of their sides, so the probability is (${L1}/${L})<sup>2</sup> = <b>${fr(ans)}</b>.`;
        rank = 20;
        rules = [[-1, 0, -c], [1, -1, -c], [0, 1, L - c]];
      } else if (kind === 'longest') {
        const t = cs[2], a1 = L - t, a2 = L - 2 * t, big2 = 2 * t > L;
        ans = big2 ? cut(LL - 3 * a1 * a1, LL) : cut((3 * t - L) ** 2, LL);
        wrongs = [cut(t * t, LL), minus(ONE, cut(a1 * a1, LL)), cut((3 * t - L) ** 2, LL), big2 ? cut(LL - 3 * a1 * a1 + 3 * a2 * a2, LL) : cut(LL - 3 * a1 * a1 + a2 * a2, LL), cut(LL - 3 * a1 * a1, LL), cut(3 * t - L, L)];
        text = `the longest of the three pieces is shorter than ${t} ${unit}`;
        const one = `Some piece is at least ${t} when x ≥ ${t}, or y − x ≥ ${t}, or y ≤ ${L - t}, and each of these is a corner of the triangle of the same shape with legs ${a1}, so each has chance (${a1}/${L})<sup>2</sup> = ${fr(cut(a1 * a1, LL))}.`;
        sol = big2
          ? `${tri} ${one} Two pieces can’t both be at least ${t}, since 2·${t} is more than ${L}, so these corners don’t overlap. So the probability that every piece is shorter than ${t} is 1 − 3·${fr(cut(a1 * a1, LL))} = <b>${fr(ans)}</b>.`
          : `${tri} ${one} This time two pieces can both be at least ${t}, since 2·${t} is less than ${L}: two of the corners overlap in a smaller corner with legs ${L} − 2·${t} = ${a2}, of chance (${a2}/${L})<sup>2</sup> = ${fr(cut(a2 * a2, LL))}, while all three pieces can’t be that long. By inclusion and exclusion, the probability that every piece is shorter than ${t} is 1 − 3·${fr(cut(a1 * a1, LL))} + 3·${fr(cut(a2 * a2, LL))} = <b>${fr(ans)}</b>.`;
        rank = big2 ? 21 : 23;
        rules = [[1, 0, t], [-1, 1, t], [0, -1, t - L]];
      } else {
        const [, , c, t] = cs, L1 = L - 3 * c, a1 = L1 - (t - c), a2 = L1 - 2 * (t - c), lap = a2 > 0, top = L1 * L1 - 3 * a1 * a1 + (lap ? 3 * a2 * a2 : 0);
        ans = cut(top, LL);
        wrongs = [cut(L1 * L1, LL), cut(L1 * L1 - 3 * a1 * a1, LL), cut(L1 * L1 - 3 * a1 * a1 + (lap ? a2 * a2 : 3), LL), cut((t - c) ** 2, LL), minus(cut(L1 * L1, LL), cut((3 * t - L) ** 2, LL))];
        text = `every piece is at least ${c} ${unit} and at most ${t} ${unit} long`;
        sol = `${tri} Asking every piece to be at least ${c} (x ≥ ${c}, y − x ≥ ${c}, y ≤ ${L - c}) cuts out a smaller triangle of the same shape, with legs ${L} − 3·${c} = ${L1}. Inside it, a piece longer than ${t} fills a corner of the same shape with legs ${L1} − (${t} − ${c}) = ${a1}, and there are 3 such corners${lap ? `, which overlap in pairs in corners with legs ${L1} − 2·(${t} − ${c}) = ${a2}` : ', which don’t overlap, since two pieces longer than ' + t + ' would leave too little for the third piece'}. So the good part has area (${sq(L1)} − 3·${sq(a1)}${lap ? ` + 3·${sq(a2)}` : ''})/2 = ${fr(cut(top, 2))}, and the probability is ${fr(cut(top, 2))} ÷ ${fr(cut(LL, 2))} = <b>${fr(ans)}</b>.`;
        rank = 23;
        rules = [[-1, 0, -c], [1, 0, t], [1, -1, -c], [-1, 1, t], [0, 1, L - c], [0, -1, t - L]];
      }
      return {
        topic: 'Chances from lengths and arcs', rank,
        text: `A stick ${L} ${unit} long is cut at two points chosen independently and uniformly at random along its length, making three pieces. What is the probability that ${text}?`,
        answer: choices(d, ans, wrongs.filter(under1), showFrac),
        check: () => {
          let poly = [corner(0, 0), corner(L, L), corner(0, L)];
          for (const [p, q, r] of rules) poly = clip(poly, p, q, r);
          return verdict(qdiv(area(poly), big(LL, 2)), ans);
        },
        solution: sol,
      };
    },
    // random points on a circle all inside some arc: exactly one of them starts that arc
    (d, ctx) => {
      const CASES = [...[3, 4, 5, 6].flatMap((k) => [['semi', k, 180], ['center', k, 180]]), ['arc', 3, 120], ['arc', 4, 120], ['arc', 3, 90], ['arc', 4, 90], ['arc', 3, 144], ['arc', 4, 144], ['arc', 5, 120], ['arc', 3, 72]];
      const [kind, [, k, deg]] = pickKind(ctx, 'circle', ['semi', 'center', 'arc'], [CASES], (kind, cs) => cs[0] === kind);
      const f = cut(deg, 360), fk = [f[0] ** (k - 1), f[1] ** (k - 1)], inArc = times([k, 1], fk), ans = kind === 'center' ? minus(ONE, inArc) : inArc;
      const poly = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon' }[k], arcName = deg === 180 ? 'semicircle' : `${deg}° arc`;
      const who = kind === 'center' ? ['points are chosen', 'at random on a circle, independently and uniformly', 'points'] : d.pick([['points are chosen', 'at random on a circle, independently and uniformly', 'points'], ['lighthouses are built', 'at random spots on the shore of a perfectly round island, each spot chosen uniformly and independently', 'lighthouses'], ['ants stop', 'at random spots on the rim of a round plate, each spot chosen uniformly and independently', 'ants']]);
      const reason = `For each ${who[2].slice(0, -1)}, ask whether all the others lie on the ${arcName} running clockwise from it. If they all fit on some ${arcName}, exactly one passes this test, the first one going clockwise along that arc: if two passed, the clockwise arcs from each would reach the other and so cover the whole circle, which ${deg < 180 ? `two ${deg}° arcs cannot do` : 'two semicircles do only when the points sit exactly opposite each other, which has probability 0'}. A given one passes when each of the other ${k - 1} lands in its arc, each with chance ${fr(f)} independently, which has chance (${fr(f)})<sup>${k - 1}</sup> = ${fr(fk)}. These ${k} events never happen together, so their chances add up to ${k}·${fr(fk)} = ${fr(inArc)}.`;
      return {
        topic: 'Chances from lengths and arcs', rank: kind === 'arc' ? 23 : kind === 'semi' && k === 3 ? 21 : 22,
        text: kind === 'center'
          ? `${Cap(WORDS[k])} points are chosen independently and uniformly at random on a circle. What is the probability that the ${poly} with these ${k} points as its corners contains the center of the circle?`
          : `${Cap(WORDS[k])} ${who[0]} ${who[1]}. What is the probability that all ${k} ${who[2]} lie within some ${arcName}?`,
        answer: choices(d, ans, (kind === 'center'
          ? [inArc, minus(ONE, [1, 2 ** (k - 1)]), [1, 2], minus(ONE, cut(k - 1, 2 ** (k - 1))), minus(ONE, cut(k, 2 ** k)), minus(ONE, times([choose(k, 2), 1], fk)), [1, 2 ** k]]
          : [fk, times([choose(k, 2), 1], fk), times([k - 1, 1], fk), times([k, 1], times(fk, f)), minus(ONE, fk), minus(ONE, inArc)]).filter(under1), showFrac),
        check: () => {
          // the largest gap between neighboring points is at least 360° − deg: inclusion and exclusion over which gaps are
          let p = big(0);
          for (let j = 1; j <= k; j++) {
            const room = 360 - j * (360 - deg);
            if (room > 0) p = (j % 2 ? qadd : qsub)(p, qmul(big(choose(k, j)), norm([BigInt(room) ** BigInt(k - 1), 360n ** BigInt(k - 1)])));
          }
          return verdict(kind === 'center' ? qsub(big(1), p) : p, ans);
        },
        solution: kind === 'center'
          ? `The ${poly} misses the center exactly when all ${k} points lie on some semicircle (then the side joining the two end points of that run cuts the center off), so find that chance first. ${reason} So the ${poly} contains the center with probability 1 − ${fr(inArc)} = <b>${fr(ans)}</b>.`
          : `${reason} So the probability is <b>${fr(ans)}</b>.`,
      };
    },
  ],

  'Subsets with a sum or product rule': [
    // k numbers with a sum divisible by m: sort by remainder and go through the remainder patterns
    (d, ctx) => {
      // (only cases where the count is not just C(n, k)/m, rounded)
      const CASES = [[10, 3, 3], [11, 3, 3], [13, 3, 3], [14, 3, 3], [9, 3, 4], [11, 3, 4], [13, 3, 4], [15, 3, 4], [10, 4, 3], [11, 4, 3], [13, 4, 3], [14, 4, 3], [9, 3, 5], [14, 3, 5]];
      const [kind, [n, k, m]] = pickKind(ctx, 'mod', ['count', 'prob'], [CASES], (kind, cs) => kind === 'count' || cs[1] === 3);
      const cls = range(0, m - 1).map((r) => range(1, n).filter((x) => x % m === r)), cnt = cls.map((l) => l.length);
      const pats = [];
      const go = (from, left, acc) => { if (left === 0) { pats.push(acc.slice()); return; } for (let r = from; r < m; r++) { acc.push(r); go(r, left - 1, acc); acc.pop(); } };
      go(0, k, []);
      const mult = (p) => { const c = {}; for (const r of p) c[r] = (c[r] || 0) + 1; return Object.entries(c); };
      const ways = (p) => mult(p).reduce((x, [r, e]) => x * choose(cnt[r], e), 1);
      const shown = (p) => mult(p).map(([r, e]) => (e === 1 ? `${cnt[r]}` : `C(${cnt[r]}, ${e})`)).join('·');
      const hit = (want) => pats.filter((p) => total(p) % m === want && ways(p) > 0), live = hit(0), ans = total(live.map(ways)), all = choose(n, k);
      const off = total(hit(1).map(ways)), small = Math.min(...live.map(ways)), bigOne = Math.max(...live.map(ways));
      const counts = [Math.round(all / m), off, ans - small, ans - bigOne, ans + small, Math.floor(all / m) + 1];
      return {
        topic: 'Subsets with a sum or product rule', rank: m === 5 ? 22 : m === 4 || k === 4 ? 21 : 19,
        text: kind === 'count'
          ? `How many ${k}-element subsets of {1, 2, 3, …, ${n}} have a sum that is divisible by ${m}?`
          : `${Cap(WORDS[k])} different numbers are chosen at random from 1, 2, 3, …, ${n}, all choices equally likely. What is the probability that their sum is a multiple of ${m}?`,
        answer: kind === 'count' ? choices(d, ans, counts) : choices(d, cut(ans, all), [...counts.map((v) => cut(v, all)), [1, m]].filter(under1), showFrac),
        check: () => {
          let c = 0;
          for (let mask = 0; mask < 1 << n; mask++) if (popcount(mask) === k && range(0, n - 1).reduce((s, i) => s + ((mask >> i) & 1 ? i + 1 : 0), 0) % m === 0) c++;
          return kind === 'count' ? (c === ans ? '' : `counted ${c}`) : verdict(big(c, all), cut(ans, all));
        },
        solution: `Only the remainders on division by ${m} decide whether the sum is a multiple of ${m}, so sort the numbers 1 to ${n} by remainder: ${cls.map((l, r) => `${l.length} leave ${r} (${l.join(', ')})`).join(', ')}. The sum is a multiple of ${m} exactly when the ${k} remainders add up to a multiple of ${m}, so go through the possible patterns of remainders, choosing the numbers for each: ${live.map((p) => `{${p.join(', ')}} gives ${shown(p)} = ${ways(p)}`).join('; ')}. ${kind === 'count' ? `Adding these, ${live.map((p) => ways(p)).join(' + ')} = <b>${num(ans)}</b> subsets have such a sum.` : `Adding these, ${live.map((p) => ways(p)).join(' + ')} = ${num(ans)} of the C(${n}, ${k}) = ${num(all)} choices work, so the probability is ${reduced(ans, all)}.`}`,
      };
    },
    // every subset with a sum divisible by 3: the multiples of 3 are free, the rest need a ≡ b
    (d, ctx) => {
      const [kind, n] = pickKind(ctx, 'all3', ['all', 'nonempty', 'rem1', 'prob'], [[7, 8, 9, 10, 11, 12]]);
      const zeros = range(1, n).filter((x) => x % 3 === 0), ones = range(1, n).filter((x) => x % 3 === 1), twos = range(1, n).filter((x) => x % 3 === 2);
      const r0 = zeros.length, r1 = ones.length, r2 = twos.length, want = kind === 'rem1' ? 1 : 0;
      const pairsFor = (w) => { const out = []; for (let a = 0; a <= r1; a++) for (let b = 0; b <= r2; b++) if ((((a - b) % 3) + 3) % 3 === w) out.push([a, b]); return out; };
      const ways = (list) => total(list.map(([a, b]) => choose(r1, a) * choose(r2, b))), pairs = pairsFor(want), S = ways(pairs), cnt = 2 ** r0 * S, other = 2 ** r0 * ways(pairsFor(want ? 0 : 1));
      const ans = { all: cnt, nonempty: cnt - 1, rem1: cnt, prob: cut(cnt, 2 ** n) }[kind];
      const counts = [Math.round(2 ** n / 3), S, kind === 'nonempty' ? cnt : cnt - 1, other, Math.floor(2 ** n / 3) === Math.round(2 ** n / 3) ? Math.ceil(2 ** n / 3) : Math.floor(2 ** n / 3), 2 ** r0 * (S - 1)];
      return {
        topic: 'Subsets with a sum or product rule', rank: 22,
        text: {
          all: `How many subsets of {1, 2, 3, …, ${n}} have a sum of elements that is divisible by 3? (The empty set counts, with sum 0.)`,
          nonempty: `How many nonempty subsets of {1, 2, 3, …, ${n}} have a sum of elements that is divisible by 3?`,
          rem1: `How many subsets of {1, 2, 3, …, ${n}} have a sum of elements that leaves a remainder of 1 when divided by 3?`,
          prob: `A subset of {1, 2, 3, …, ${n}} is chosen at random, all ${num(2 ** n)} subsets equally likely (the empty set counts, with sum 0). What is the probability that the sum of its elements is a multiple of 3?`,
        }[kind],
        answer: kind === 'prob' ? choices(d, ans, [[1, 3], ...counts.map((v) => cut(v, 2 ** n))].filter(under1), showFrac) : choices(d, ans, counts),
        check: () => {
          let c = 0;
          for (let mask = kind === 'nonempty' ? 1 : 0; mask < 1 << n; mask++) if (range(0, n - 1).reduce((s, i) => s + ((mask >> i) & 1 ? i + 1 : 0), 0) % 3 === want) c++;
          return kind === 'prob' ? verdict(big(c, 2 ** n), ans) : c === ans ? '' : `counted ${c}`;
        },
        solution: `Split the numbers by their remainders on division by 3: ${r0} multiples of 3 (${zeros.join(', ')}), ${r1} numbers that leave 1 (${ones.join(', ')}) and ${r2} that leave 2 (${twos.join(', ')}). The multiples of 3 never change the sum’s remainder, so each can be in or out freely, in 2<sup>${r0}</sup> = ${2 ** r0} ways. If a numbers that leave 1 and b numbers that leave 2 are chosen, the sum leaves the same remainder as a + 2b, which is the remainder of a − b, so a − b must ${want ? 'leave a remainder of 1' : 'be a multiple of 3'}. The pairs (a, b) that work are ${pairs.map(([a, b]) => `(${a}, ${b})`).join(', ')}, and choosing the numbers for them gives ${pairs.map(([a, b]) => `${choose(r1, a)}·${choose(r2, b)}`).join(' + ')} = ${S} ways. ${{
          all: `So there are ${2 ** r0}·${S} = <b>${num(cnt)}</b> subsets.`, rem1: `So there are ${2 ** r0}·${S} = <b>${num(cnt)}</b> subsets.`,
          nonempty: `That gives ${2 ** r0}·${S} = ${num(cnt)} subsets, one of them the empty set, so <b>${num(cnt - 1)}</b> are nonempty.`,
          prob: `That gives ${2 ** r0}·${S} = ${num(cnt)} of the ${num(2 ** n)} subsets, so the probability is <b>${fr(ans)}</b>.`,
        }[kind]}`,
      };
    },
    // subsets with a square product: choose the non-primes freely, then every prime is forced
    (d, ctx) => {
      const [kind, n] = pickKind(ctx, 'square', ['square', 'nonempty', 'twice', 'prob'], [range(10, 16)]);
      const P = primesTo(n), others = n - P.length, sqs = range(1, n).filter((x) => Number.isInteger(Math.sqrt(x))).length, lonely = P.filter((p) => 2 * p > n).length;
      const ans = { square: 2 ** others, nonempty: 2 ** others - 1, twice: 2 ** others, prob: [1, 2 ** P.length] }[kind];
      const counts = [2 ** sqs, kind === 'nonempty' ? 2 ** others : 2 ** others - 1, 2 ** (others - 1), 2 ** (others + 1), 2 ** (others - lonely), 2 ** P.length];
      return {
        topic: 'Subsets with a sum or product rule', rank: 23,
        text: {
          square: `How many subsets of {1, 2, 3, …, ${n}} have a product of elements that is a perfect square? (The empty set counts, with product 1.)`,
          nonempty: `How many nonempty subsets of {1, 2, 3, …, ${n}} have a product of elements that is a perfect square?`,
          twice: `How many subsets of {1, 2, 3, …, ${n}} have a product of elements that is twice a perfect square, such as 2, 8, 18 or 50?`,
          prob: `A subset of {1, 2, 3, …, ${n}} is chosen at random, all ${num(2 ** n)} subsets equally likely (the empty set counts, with product 1). What is the probability that the product of its elements is a perfect square?`,
        }[kind],
        answer: kind === 'prob' ? choices(d, ans, [[1, 2 ** (P.length - 1)], [1, 2 ** (P.length + 1)], cut(2 ** sqs, 2 ** n), cut(2 ** (others - lonely), 2 ** n), [1, n]].filter(under1), showFrac) : choices(d, ans, counts),
        check: () => {
          const masks = range(1, n).map(oddMask), want = kind === 'twice' ? oddMask(2) : 0;
          let c = 0;
          for (let mask = kind === 'nonempty' ? 1 : 0; mask < 1 << n; mask++) { let x = 0; for (let i = 0; i < n; i++) if ((mask >> i) & 1) x ^= masks[i]; if (x === want) c++; }
          return kind === 'prob' ? verdict(big(c, 2 ** n), ans) : c === ans ? '' : `counted ${c}`;
        },
        solution: `Split the numbers 1 to ${n} into the ${P.length} primes (${P.join(', ')}) and the other ${others} numbers, and choose the other numbers first, in any of 2<sup>${others}</sup> ways. ${kind === 'twice' ? 'For the product to be twice a square, 2 must appear in it to an odd power and every other prime to an even power.' : 'For the product to be a square, every prime must appear in it to an even power.'} Now go through the primes: the only number still to be decided that contains a given prime p is p itself, and putting it in changes the power of p by exactly 1 and leaves every other prime alone. So each prime is forced, in or out according to whether the power of p from the numbers chosen so far has the right parity, and every choice of the other ${others} numbers is completed in exactly one way. ${{
          square: `So there are 2<sup>${others}</sup> = <b>${num(ans)}</b> such subsets.`, twice: `So there are 2<sup>${others}</sup> = <b>${num(ans)}</b> such subsets.`,
          nonempty: `That gives 2<sup>${others}</sup> = ${num(2 ** others)} subsets, one of them the empty set, so <b>${num(ans)}</b> are nonempty.`,
          prob: `That gives 2<sup>${others}</sup> of the 2<sup>${n}</sup> subsets, so the probability is 1/2<sup>${P.length}</sup> = <b>${fr(ans)}</b>.`,
        }[kind]}`,
      };
    },
  ],

  'Chances given what you saw': [
    // a coin from a jar gives heads every time: weigh each kind of coin by how well it explains that
    (d, ctx) => {
      const PLAIN = [], BENT = [];
      for (const f of [2, 3, 4, 5]) for (const g of [1, 2]) for (const k of [2, 3, 4]) if (g < f) PLAIN.push([f, g, k]);
      for (const f of [1, 2, 3]) for (const g of [1, 2]) for (const p of [[3, 4], [2, 3], [1, 3], [1, 4]]) for (const k of [2, 3]) BENT.push([f, g, p, k]);
      const [kind, cs] = pickKind(ctx, 'coins', ['which', 'next', 'bent'], [[...PLAIN, ...BENT]], (kind, cs) => (kind === 'bent') === (cs.length === 4));
      const name = d.pick(NAMES), half = frac(1, 2);
      if (kind !== 'bent') {
        const [f, g, k] = cs, W1 = f, W2 = g * 2 ** k, W = W1 + W2, two = cut(W2, W), next = cut(2 * W2 + W1, 2 * W), ans = kind === 'which' ? two : next;
        const nextAt = (kk) => cut(2 * g * 2 ** kk + f, 2 * (g * 2 ** kk + f));
        return {
          topic: 'Chances given what you saw', rank: kind === 'which' ? 19 : 20,
          text: `A jar holds ${f} fair coins and ${g === 1 ? 'one coin' : `${g} coins`} with heads on both sides. ${name} picks a coin from the jar at random and, without looking at its faces, flips it ${k} times. It lands heads every time. What is the probability that ${kind === 'which' ? 'the coin has two heads' : 'the next flip of the same coin is heads too'}?`,
          answer: choices(d, ans, (kind === 'which'
            ? [cut(g, f + g), cut(g * 2 ** (k - 1), g * 2 ** (k - 1) + f), minus(ONE, [1, 2 ** k]), cut(g * 2 ** (k + 1), g * 2 ** (k + 1) + f), cut(W2, W2 + f * 2)]
            : [two, cut(2 * g + f, 2 * (f + g)), [1, 2], minus(ONE, [1, 2 ** (k + 1)]), nextAt(k - 1), nextAt(k + 1)]).filter(under1), showFrac),
          check: () => {
            // every coin and every way its flips can land, weighted exactly
            let seen = big(0), more = big(0);
            for (let i = 0; i < f + g; i++) {
              const pH = big(i < f ? 1 : 2, 2);
              let pk = big(1);
              for (let j = 0; j < k; j++) pk = qmul(pk, pH);
              const w = qmul(big(1, f + g), pk);
              seen = qadd(seen, w);
              more = qadd(more, kind === 'which' ? (i < f ? big(0) : w) : qmul(w, pH));
            }
            return verdict(qdiv(more, seen), ans);
          },
          solution: `Weigh each kind of coin by how likely it is to be picked and then to land heads ${k} times in a row. A fair coin is picked with chance ${f}/${f + g} and then does that with chance 1/${2 ** k}; a two-headed coin is picked with chance ${g}/${f + g} and then surely does. Multiplying both by ${(f + g) * 2 ** k} gives weights ${W1} for a fair coin and ${W2} for a two-headed one, so, given the heads, the coin is two-headed with probability ${W2}/(${W1} + ${W2}) = ${fr(two)}${kind === 'which' ? '.' : ` and fair with probability ${fr(cut(W1, W))}.`} ${kind === 'which' ? `So the answer is <b>${fr(ans)}</b>.` : `The next flip is surely heads with a two-headed coin, and heads with chance ${half} with a fair one, so the probability is ${fr(two)} + ${fr(cut(W1, W))}·${half} = <b>${fr(ans)}</b>.`}`,
        };
      }
      const [f, g, p, k] = cs, D = lcm(2 ** k, p[1] ** k), W1 = (f * D) / 2 ** k, W2 = (g * p[0] ** k * D) / p[1] ** k, W = W1 + W2;
      const pf = cut(W1, W), pb = cut(W2, W), at = (kk) => { const D2 = lcm(2 ** kk, p[1] ** kk), A = (f * D2) / 2 ** kk, B = (g * p[0] ** kk * D2) / p[1] ** kk; return plus(times(cut(A, A + B), [1, 2]), times(cut(B, A + B), p)); };
      const ans = at(k);
      return {
        topic: 'Chances given what you saw', rank: 21,
        text: `A drawer holds ${f === 1 ? 'one fair coin' : `${f} fair coins`} and ${g === 1 ? 'one bent coin that lands' : `${g} bent coins that land`} heads with probability ${fr(p)}. ${name} picks one of these coins at random, flips it ${k} times and gets heads every time. What is the probability that the next flip of the same coin is heads too?`,
        answer: choices(d, ans, [at(0), [1, 2], p, pb, at(k - 1), at(k + 1)].filter(under1), showFrac),
        check: () => {
          let seen = big(0), more = big(0);
          for (let i = 0; i < f + g; i++) {
            const pH = i < f ? big(1, 2) : big(p[0], p[1]);
            let pk = big(1);
            for (let j = 0; j < k; j++) pk = qmul(pk, pH);
            seen = qadd(seen, pk);
            more = qadd(more, qmul(pk, pH));
          }
          return verdict(qdiv(more, seen), ans);
        },
        solution: `Weigh each kind of coin by how likely it is to be picked and then to land heads ${k} times in a row: ${f}/${f + g}·(${half})<sup>${k}</sup> for a fair coin and ${g}/${f + g}·(${fr(p)})<sup>${k}</sup> for a bent one. Multiplying both by ${(f + g) * D} gives whole-number weights ${W1} for fair and ${W2} for bent, so, given the heads, the coin is fair with probability ${fr(pf)} and bent with probability ${fr(pb)}. The next flip is heads with chance ${half} for a fair coin and ${fr(p)} for a bent one, so the probability is ${fr(pf)}·${half} + ${fr(pb)}·${fr(p)} = <b>${fr(ans)}</b>.`,
      };
    },
    // a die decides how many coins are flipped; the number of heads tells something about the die
    (d, ctx) => {
      const CASES = [];
      for (const s of [4, 6]) for (const h of [1, 2, 3]) { CASES.push(['even', s, h], ['mean', s, h]); for (let j = h; j <= s; j++) CASES.push(['which', s, h, j]); }
      const [kind, [, s, h, j]] = pickKind(ctx, 'diecoin', ['which', 'even', 'mean'], [CASES], (kind, cs) => cs[0] === kind);
      const W = range(0, s).map((m) => (m >= 1 && m >= h ? choose(m, h) * 2 ** (s - m) : 0)), Wt = total(W), B = range(0, s).map((m) => (m >= 1 ? choose(m, h) : 0)), Bt = total(B);
      const evens = range(1, s).filter((m) => m % 2 === 0), We = total(evens.map((m) => W[m])), Wm = total(range(1, s).map((m) => m * W[m]));
      const ans = { which: cut(W[j] ?? 0, Wt), even: cut(We, Wt), mean: cut(Wm, Wt) }[kind], name = d.pick(NAMES), from = Math.max(h, 1);
      const list = range(from, s).map((m) => `${choose(m, h)}·${2 ** (s - m)} = ${W[m]}`).join(', ');
      return {
        topic: 'Chances given what you saw', rank: kind === 'mean' ? 23 : 22,
        text: `${name} rolls a fair ${s}-sided die, numbered 1 to ${s}, and then flips as many fair coins as the number rolled. Exactly ${h === 1 ? 'one coin comes' : `${WORDS[h]} coins come`} up heads. ${{ which: `What is the probability that the die showed ${j}?`, even: 'What is the probability that the die showed an even number?', mean: 'Given that, what is the expected value of the number the die showed?' }[kind]}`,
        answer: choices(d, ans, ({
          which: [[1, s], cut(choose(j, h), 2 ** j), cut(B[j], Bt), cut(W[j], Wt + W[j]), cut(W[j === s ? j - 1 : j + 1], Wt)],
          even: [[1, 2], cut(evens.length, s), cut(total(evens.map((m) => B[m])), Bt), minus(ONE, ans), cut(We, Wt + We)],
          mean: [cut(s + 1, 2), [2 * h, 1], cut(total(range(1, s).map((m) => m * B[m])), Bt), plus(ans, [1, 2]), [h + 1, 1]],
        }[kind]).filter(positive).filter((v) => kind === 'mean' || under1(v)), showFrac),
        check: () => {
          // every roll and every way its coins can land
          let seen = big(0), more = big(0);
          for (let m = 1; m <= s; m++) for (let mask = 0; mask < 1 << m; mask++) {
            if (popcount(mask) !== h) continue;
            const w = big(1, s * 2 ** m);
            seen = qadd(seen, w);
            more = qadd(more, qmul(w, big(kind === 'which' ? +(m === j) : kind === 'even' ? +(m % 2 === 0) : m)));
          }
          return verdict(qdiv(more, seen), ans);
        },
        solution: `Weigh each possible roll m by the chance of rolling it and then getting exactly ${h} head${h > 1 ? 's' : ''} from m coins, which is (1/${s})·C(m, ${h})/2<sup>m</sup>. Multiplying all of these by ${s}·2<sup>${s}</sup> gives whole-number weights C(m, ${h})·2<sup>${s} − m</sup>, which for m = ${from} to ${s} are ${list}${h > 1 ? ` (a roll below ${h} can’t give ${h} heads)` : ''}. They add up to ${Wt}. ${{
          which: `So the die showed ${j} with probability ${reduced(W[j], Wt)}.`,
          even: `The even rolls have weights adding up to ${evens.filter((m) => W[m]).map((m) => W[m]).join(' + ')} = ${We}, so the probability is ${reduced(We, Wt)}.`,
          mean: `So the expected value is (${range(from, s).map((m) => `${m}·${W[m]}`).join(' + ')})/${Wt} = ${reduced(Wm, Wt)}.`,
        }[kind]}`,
      };
    },
    // rolling until the top number, told that every roll was allowed: shorter runs are favored
    (d, ctx) => {
      const SETS = [
        { s: 6, a: 3, cond: 'every roll was an even number', others: '2 or 4' },
        { s: 6, a: 3, cond: 'no roll was less than 4', others: '4 or 5' },
        { s: 6, a: 2, cond: 'every roll was a 5 or a 6', others: 'a 5' },
        { s: 8, a: 4, cond: 'every roll was an even number', others: '2, 4 or 6' },
        { s: 8, a: 3, cond: 'every roll was at least 6', others: '6 or 7' },
        { s: 10, a: 5, cond: 'every roll was an even number', others: '2, 4, 6 or 8' },
        { s: 12, a: 4, cond: 'every roll was a multiple of 3', others: '3, 6 or 9' },
        { s: 4, a: 2, cond: 'every roll was an even number', others: 'a 2' },
      ];
      const [kind, S] = pickKind(ctx, 'given', ['mean', 'first', 'two'], [SETS]);
      const { s, a, cond, others } = S, r = cut(a - 1, s), q = cut(s - a + 1, s), ans = { mean: over(ONE, q), first: q, two: times(r, q) }[kind];
      return {
        topic: 'Chances given what you saw', rank: kind === 'mean' ? 24 : 23,
        text: `A fair ${s}-sided die, numbered 1 to ${s}, is rolled again and again until ${an(s)} ${s} comes up. Given that ${cond}, ${{ mean: 'what is the expected number of rolls?', first: `what is the probability that the very first roll was the ${s}?`, two: 'what is the probability that exactly two rolls were made?' }[kind]}`,
        answer: choices(d, ans, ({
          mean: [[a, 1], [s, 1], cut(s, s - a), cut(a + 1, 2), cut(s, a), plus(over(ONE, q), ONE)],
          first: [cut(1, a), cut(1, s), cut(s - a, s), cut(1, s - a + 1), cut(a, s)],
          two: [times(cut(a - 1, a), cut(1, a)), times(cut(a - 1, s), cut(1, s)), times(r, cut(1, a)), r, times(q, q)],
        }[kind]).filter((v) => positive(v) && (kind === 'mean' || under1(v))), showFrac),
        check: () => {
          // add up the chances roll by roll, far enough out that the rest is negligible
          let pCond = 0, top = 0;
          for (let n = 1; n <= 400; n++) {
            const pn = ((a - 1) / s) ** (n - 1) / s;
            pCond += pn;
            top += { mean: n * pn, first: n === 1 ? pn : 0, two: n === 2 ? pn : 0 }[kind];
          }
          return Math.abs(top / pCond - ans[0] / ans[1]) < 1e-9 ? '' : `summed ${top / pCond}, said ${ans.join('/')}`;
        },
        solution: `Find, for each n, the chance that the rolling stops at roll n and ${cond}, then rescale so that these chances add up to 1. Rolls 1 to n − 1 must each be ${others} (allowed, but not ${an(s)} ${s}), with chance ${fr(r)} each, and roll n must be the ${s}, with chance 1/${s}, so that chance is (${fr(r)})<sup>n − 1</sup>·1/${s}. Adding over all n gives the chance that ${cond}: (1/${s})/(1 − ${fr(r)}) = ${fr(cut(1, s - a + 1))}. Dividing by it, given that ${cond}, the rolling stops at roll n with chance (${fr(r)})<sup>n − 1</sup>·${fr(q)}, exactly as if each roll ended things with chance ${fr(q)} (not ${fr([1, a])}, as it would for ${an(a)} ${a}-sided die). ${{
          mean: `So the expected number of rolls is 1 ÷ ${fr(q)} = <b>${fr(ans)}</b>.`,
          first: `So the first roll was the ${s} with probability <b>${fr(ans)}</b>.`,
          two: `So exactly two rolls were made with probability ${fr(r)}·${fr(q)} = <b>${fr(ans)}</b>.`,
        }[kind]}`,
      };
    },
    // dice with a known sum or product: list the outcomes that fit, counted in order
    (d, ctx) => {
      const CASES = [...[9, 10, 11, 12].map((v) => ['six', v]), ...[8, 9, 10, 11, 12, 13].map((v) => ['diff', v]), ...[8, 12, 24, 36, 48, 72].map((v) => ['prod', v]), ...[8, 9, 10, 11, 12].map((v) => ['four', v])];
      const [kind, [, v]] = pickKind(ctx, 'known', ['six', 'diff', 'prod', 'four'], [CASES], (kind, cs) => cs[0] === kind);
      const count = kind === 'four' ? 4 : 3, prod = kind === 'prod';
      const cond = prod ? (p) => p.reduce((x, y) => x * y, 1) === v : (p) => total(p) === v;
      const event = { six: (p) => p.includes(6), diff: (p) => new Set(p).size === 3, prod: (p) => new Set(p).size < 3, four: (p) => p.includes(1) }[kind];
      const sets = diceSets(count, cond), good = sets.filter(([p]) => event(p)), T = total(sets.map(([, o]) => o)), F = total(good.map(([, o]) => o)), ans = cut(F, T);
      const sign = prod ? '·' : ' + ', said = prod ? `a product of ${v}` : `a sum of ${v}`;
      const blind = { six: cut(91, 216), diff: cut(120, 216), prod: cut(96, 216), four: cut(671, 1296) }[kind];
      const what = { six: 'at least one 6', diff: 'three different numbers', prod: 'a repeated number', four: 'at least one 1' }[kind];
      return {
        topic: 'Chances given what you saw', rank: { six: 19, diff: 19, prod: 20, four: 21 }[kind],
        text: {
          six: `Three fair dice are rolled, and their sum is ${v}. Given that, what is the probability that at least one of the dice shows a 6?`,
          diff: `Three fair dice are rolled, and you are told only that the numbers add up to ${v}. What is the probability that the three numbers are all different?`,
          prod: `Three fair dice are rolled, and the product of the three numbers is ${v}. Given that, what is the probability that at least two of the dice show the same number?`,
          four: `Four fair dice are rolled, and their sum is ${v}. Given that, what is the probability that at least one of the dice shows a 1?`,
        }[kind],
        answer: choices(d, ans, [cut(good.length, sets.length), blind, minus(ONE, ans), prod ? cut(F, T + good.length) : cut(F, choose(v - 1, count - 1)), cut(F + 1, T + 1)].filter(under1), showFrac),
        check: () => {
          let seen = 0, hit = 0;
          eachRoll(count, (r) => { if (cond(r)) { seen++; if (event(r)) hit++; } });
          return verdict(big(hit, seen), ans);
        },
        solution: `Only the rolls with ${said} count, and as ordered rolls they are all equally likely, so list them by their numbers, ignoring order, and count the orders of each. They are ${sets.map((x) => showSet(x, sign)).join(', ')}, which makes ${T} equally likely rolls in all. Those with ${what} are ${listing(good.map(([p]) => p.join(sign)))}, with ${F} orders between them. So the probability is ${reduced(F, T)}.`,
      };
    },
  ],
};
