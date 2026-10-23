// Geometry for the AMC 10 practice: 12 topics built on ideas from past contests (a perpendicular to a diagonal,
// extended sides, solids around a segment, boxes, circles inside circles, inscribed squares…), with new numbers and
// wording, most with a figure drawn to scale from the variant's own numbers. Each topic asks its idea several ways (a
// different unknown, the question turned around, the same fact in another figure), and each way walks through its own
// combinations.
import { combo, num, frac, gcd } from '../kit/bank.js';
import { choices, labelled, surd, fracSurd, showFrac } from './amc-kit.js';

// ---------- drawing: an svg with the triangle styles (side, dash, seg, arc, vx and ang labels) ----------
const r2 = (v) => Math.round(v * 100) / 100;
const pts = (list) => list.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ');
const svg = (w, h, name, parts) => `<svg class="tri" viewBox="0 0 ${w} ${h}" role="img" aria-label="${name}">${parts.join('')}</svg>`;
const poly = (list, cls = 'side') => `<polygon class="${cls}" points="${pts(list)}"/>`;
const seg = ([x1, y1], [x2, y2], cls = 'side') => `<line class="${cls}" x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}"/>`;
const ring = ([x, y], r, cls = 'side') => `<circle class="${cls}" cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}"/>`;
const label = ([x, y], text, cls = 'vx', anchor = 'middle') => `<text class="${cls}" x="${r2(x)}" y="${r2(y + 5)}" text-anchor="${anchor}">${text}</text>`;
const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
const away = (p, from, dist = 15) => { const u = unit(from, p); return [p[0] + u[0] * dist, p[1] + u[1] * dist]; };   // just outside p, on the far side from a centre
const centre = (list) => [list.reduce((s, p) => s + p[0], 0) / list.length, list.reduce((s, p) => s + p[1], 0) / list.length];
// world (y up) → picture: fits [x0, x1] × [y0, y1] into w × h with a margin, keeping the shape
function frame([x0, x1], [y0, y1], w, h, pad = 30) {
  const s = Math.min((w - 2 * pad) / (x1 - x0), (h - 2 * pad) / (y1 - y0));
  const ox = (w - s * (x1 - x0)) / 2 - s * x0, oy = (h + s * (y1 - y0)) / 2 + s * y0;
  const T = ([x, y]) => [ox + s * x, oy - s * y];
  T.s = s;
  return T;
}
const fit = (list, w, h, pad) => frame([Math.min(...list.map((p) => p[0])), Math.max(...list.map((p) => p[0]))], [Math.min(...list.map((p) => p[1])), Math.max(...list.map((p) => p[1]))], w, h, pad);
// the little square marking a right angle at a corner (picture coordinates)
function corner(at, p, q, size = 10) {
  const u = unit(at, p), v = unit(at, q), c = (k, l) => `${r2(at[0] + u[0] * k + v[0] * l)} ${r2(at[1] + u[1] * k + v[1] * l)}`;
  return `<path class="arc" d="M${c(size, 0)} L${c(size, size)} L${c(0, size)}"/>`;
}
// a box (x across, y going back, z up) seen from the front, a little from the right and above. Corners in the order
// A B C D (bottom, A at the front left) then E F G H above them; D is hidden, so its three edges are dashed.
const oblique = ([x, y, z]) => [x + 0.5 * y * Math.cos(Math.PI / 6), z + 0.5 * y * Math.sin(Math.PI / 6)];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
function boxPicture(a, b0, c, w, h) {
  const b = Math.max(b0, 0.5 * Math.max(a, c)), corners = [[0, 0, 0], [a, 0, 0], [a, b, 0], [0, b, 0], [0, 0, c], [a, 0, c], [a, b, c], [0, b, c]];
  const T = fit(corners.map(oblique), w, h, 34), P = (p) => T(oblique(p)), at = corners.map(P);
  return { P: ([x, y, z]) => P([x, (y * b) / b0, z]), at, ctr: P([a / 2, b / 2, c / 2]), top: centre(at.slice(4)), edges: EDGES.map(([i, j]) => seg(at[i], at[j], i === 3 || j === 3 ? 'side dash' : 'side')) };
}
const boxLetters = (at, ctr, skip = '') => 'ABCDEFGH'.split('').filter((s) => !skip.includes(s)).map((s) => label(away(at['ABCDEFGH'.indexOf(s)], ctr, 14), s));
// the box's three edge lengths, on AB (across), BC (going back) and CG (up)
const boxSides = (at, a, b, c) => [label([mid(at[0], at[1])[0], at[0][1] + 20], a, 'ang'), label(mid(at[1], at[2]).map((v, i) => v + [12, 10][i]), b, 'ang'), label([at[2][0] + 14, mid(at[2], at[6])[1]], c, 'ang')];
// the octahedron joining the centres of a box's faces (a across, b back, c up)
function octahedron(a, b, c, w = 380, h = 280) {
  const { P, at, ctr, edges } = boxPicture(a, b, c, w, h), lines = [];
  const V = [[0, b / 2, c / 2], [a, b / 2, c / 2], [a / 2, 0, c / 2], [a / 2, b, c / 2], [a / 2, b / 2, 0], [a / 2, b / 2, c]];
  for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (j !== i + 1 || i % 2) lines.push(seg(P(V[i]), P(V[j]), 'seg'));
  return { P, at, ctr, parts: [...edges, ...lines] };
}

// ---------- numbers ----------
const lowest = (p, q) => { const g = gcd(p, q) || 1; return [p / g, q / g]; };
const near = (got, want, what, tol = 1e-6) => (Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)) ? '' : `${what}: worked out ${got}, said ${want}`);
const shoelace = (P) => Math.abs(P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
const dist = (p, q) => Math.hypot(...p.map((v, i) => v - q[i]));
// where the line through a, b meets the line through c, e
function meet([a, b], [c, e]) {
  const r = [b[0] - a[0], b[1] - a[1]], s = [e[0] - c[0], e[1] - c[1]], den = r[0] * s[1] - r[1] * s[0];
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den;
  return [a[0] + t * r[0], a[1] + t * r[1]];
}
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const det3 = (a, b, c) => a[0] * (b[1] * c[2] - b[2] * c[1]) - a[1] * (b[0] * c[2] - b[2] * c[0]) + a[2] * (b[0] * c[1] - b[1] * c[0]);
const tetra = (p, q, r, s) => Math.abs(det3(sub3(q, p), sub3(r, p), sub3(s, p))) / 6;
const over = (top, bottom) => `<span class="fr"><span>${top}</span><span>${bottom}</span></span>`;
const root = (n) => (Number.isInteger(Math.sqrt(n)) ? num(Math.sqrt(n), 0) : surd(1, n)[1]);   // √n, simplified
const piShow = (v) => { const s = showFrac(v); return s === '1' ? 'π' : `${s}π`; };
const ratio = (p, q) => { const [x, y] = lowest(p, q); return [x / y, `${x} : ${y}`]; };
const plusPi = (a, b) => [a + b * Math.PI, `${num(a, 0)} + ${b === 1 ? '' : num(b, 0)}π`];
const minusPi = (a, b) => [a - b * Math.PI, `${num(a, 0)} − ${b === 1 ? '' : num(b, 0)}π`];
const plusRoot = (a, b, n) => [a + b * Math.sqrt(n), `${num(a, 0)} + ${b === 1 ? '' : num(b, 0)}√${n}`];
const sA = (n) => (n === 1 ? '√3' : `${n}√3`);
const k3 = '<span class="fr"><span>√3</span><span>3</span></span>';
const units = (n) => `${n} unit${n === 1 ? '' : 's'}`;
const an = (n) => (n === 8 || n === 11 || n === 18 || (n >= 80 && n < 90) ? 'an' : 'a');
// how far apart two points are along a scale of grid squares: fraction of a region's grid points that pass a test
function gridArea([x0, x1], [y0, y1], inside, n = 600) {
  const sx = (x1 - x0) / n, sy = (y1 - y0) / n;
  let hits = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (inside([x0 + (i + 0.5) * sx, y0 + (j + 0.5) * sy])) hits++;
  return hits * sx * sy;
}
// how far a point is from a segment
const toSegment = (p, a, b) => { const v = [b[0] - a[0], b[1] - a[1]], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / (v[0] * v[0] + v[1] * v[1]))); return dist(p, [a[0] + t * v[0], a[1] + t * v[1]]); };

// ---------- shared setups ----------
// rectangle WXYZ (W bottom left, X bottom right, Y top right, Z top left), WX = a and XY = b
function rectangle(names, a, b, w = 360, h = 250) {
  const T = frame([0, a], [0, b], w, h, 36), at = [[0, 0], [a, 0], [a, b], [0, b]].map(T), ctr = T([a / 2, b / 2]);
  return { T, at, marks: [...at.map((p, i) => label(away(p, ctr, 17), names[i])), label([mid(at[0], at[1])[0], at[0][1] + 20], a, 'ang'), label([at[1][0] + 16, mid(at[1], at[2])[1]], b, 'ang')] };
}
const TRIPLES = [[3, 4, 5], [4, 3, 5], [6, 8, 10], [8, 6, 10], [5, 12, 13], [12, 5, 13], [8, 15, 17], [15, 8, 17], [9, 12, 15], [12, 9, 15], [7, 24, 25], [24, 7, 25], [20, 15, 25], [15, 20, 25]];
const NAMES = ['WXYZFG', 'KLMNTU', 'PQRSHJ'];
// a triangle extended at each side by m (= p/q) times itself: how the extension reads, and the picture
const TIMES = { '2/1': 'twice as long as', '1/1': 'as long as', '1/2': 'half as long as', '3/2': '1½ times as long as', '1/3': 'a third as long as', '2/3': 'two thirds as long as', '3/1': 'three times as long as', '4/1': 'four times as long as' };
function extended(m, names = ['P', 'Q', 'R']) {
  const ext = (A, B) => [B[0] + m * (B[0] - A[0]), B[1] + m * (B[1] - A[1])];
  const P0 = [0, 0], Q0 = [4, 0], R0 = [1.4, 2.8], all = [P0, Q0, R0, ext(R0, P0), ext(P0, Q0), ext(Q0, R0)];
  const w = 380, h = 290, Tf = fit(all, w, h, 30), [a0, b0, c0, a1, b1, c1] = all.map(Tf), g0 = centre([a0, b0, c0]), g1 = centre([a1, b1, c1]);
  return svg(w, h, `Triangle ${names.join('')} with its sides extended`, [
    poly([a0, b0, c0]), poly([a1, b1, c1]), seg(b0, b1, 'side dash'), seg(c0, c1, 'side dash'), seg(a0, a1, 'side dash'),
    ...[[a0, names[0]], [b0, names[1]], [c0, names[2]]].map(([pt, s]) => label(away(pt, g0, 13), s)),
    ...[[a1, names[0] + '′'], [b1, names[1] + '′'], [c1, names[2] + '′']].map(([pt, s]) => label(away(pt, g1, 15), s))]);
}
// the triangle extended, worked out with coordinates, scaled to area T0
function extendedArea(m, T0) {
  const ext = (A, B) => [B[0] + m * (B[0] - A[0]), B[1] + m * (B[1] - A[1])];
  const P0 = [0, 0], Q0 = [4, 0], R0 = [1.4, 2.8], s = Math.sqrt(T0 / shoelace([P0, Q0, R0])), [P, Q, R] = [P0, Q0, R0].map(([x, y]) => [x * s, y * s]);
  return shoelace([ext(R, P), ext(P, Q), ext(Q, R)]);
}
// all the points within r of a segment of length L: a capsule (or, in a plane, a stadium)
function capsule(r, L, X, Y) {
  const w = 480, h = 170, T = frame([-r, L + r], [-r, r], w, h, 26), R = r * T.s, [x0, y0] = T([0, 0]), [x1] = T([L, 0]);
  const rim = [x1 + R * Math.cos(Math.PI / 4), y0 - R * Math.sin(Math.PI / 4)];
  return svg(w, h, `The points within ${r} of segment ${X}${Y}`, [
    `<path class="side" d="M${r2(x0)} ${r2(y0 - R)} L${r2(x1)} ${r2(y0 - R)} A${r2(R)} ${r2(R)} 0 0 1 ${r2(x1)} ${r2(y0 + R)} L${r2(x0)} ${r2(y0 + R)} A${r2(R)} ${r2(R)} 0 0 1 ${r2(x0)} ${r2(y0 - R)} Z"/>`,
    seg([x0, y0], [x1, y0], 'seg'), seg([x1, y0], rim, 'arc'), ring([x0, y0], 3), ring([x1, y0], 3),
    label([x0, y0 + 17], X), label([x1, y0 + 17], Y), label(mid([x1, y0], rim).map((v, i) => v + [-8, -6][i]), r, 'ang')]);
}
// the capsule's volume, slice by slice (Simpson's rule): a disc of radius √(r² − e²), e being how far past an end
function capsuleVolume(r, L, n = 20000) {
  const a = -r, b = L + r, hs = (b - a) / n, A = (x) => { const e = Math.max(0, -x, x - L); return Math.PI * Math.max(0, r * r - e * e); };
  let s = A(a) + A(b);
  for (let i = 1; i < n; i++) s += A(a + i * hs) * (i % 2 ? 4 : 2);
  return (s * hs) / 3;
}
// a right triangle with legs a (up) and b (across) and a square in the corner at the right angle
function cornerSquare(a, b, w = 360, h = 260) {
  const x = (a * b) / (a + b), T = fit([[0, 0], [b, 0], [0, a]], w, h, 30), [pQ, pR, pP] = [[0, 0], [b, 0], [0, a]].map(T);
  return svg(w, h, 'A right triangle with a square in its right angle', [poly([pP, pQ, pR]), poly([[0, 0], [x, 0], [x, x], [0, x]].map(T), 'arc'),
    label([pQ[0] - 14, mid(pQ, pP)[1]], a, 'ang'), label([mid(pQ, pR)[0], pQ[1] + 20], b, 'ang'), label(T([x / 2, x / 2]), 's', 'ang')]);
}
// a right triangle lying on its hypotenuse c, with a square standing on the hypotenuse
function hypotenuseSquare(a, b, c, w = 420, h = 230) {
  const hgt = (a * b) / c, foot = (a * a) / c, y = (c * hgt) / (c + hgt), yl = (foot * y) / hgt, T = fit([[0, 0], [c, 0], [foot, hgt]], w, h, 26);
  return svg(w, h, 'A right triangle on its hypotenuse with a square standing on it', [poly([[0, 0], [c, 0], [foot, hgt]].map(T)), poly([[yl, 0], [yl + y, 0], [yl + y, y], [yl, y]].map(T), 'arc'),
    label(T([c / 2, 0]).map((v, i) => v + [0, 18][i]), c, 'ang'), label(T([yl + y / 2, y / 2]), 's', 'ang')]);
}
// whole-number lengths from a corner to the far side: how many segments, given the shortest length (squared) and the
// two ends' lengths; and the same count done by solving for the points, for checking
const shortest = (h2) => { let L = 1; while (L * L < h2) L++; return L; };
// the triangle with sides x, y, z (z along the bottom), to scale
function triangleFigure(x, y, z, alt, w = 380, h = 250) {
  const px = (x * x - y * y + z * z) / (2 * z), A = [px, Math.sqrt(x * x - px * px)], B = [0, 0], C = [z, 0];
  const T = fit([A, B, C, [0, -0.15 * z]], w, h, 26), [pA, pB, pC] = [A, B, C].map(T), ctr = centre([pA, pB, pC]);
  const parts = [poly([pA, pB, pC]), label(away(mid(pB, pA), ctr, 14), x, 'ang'), label(away(mid(pA, pC), ctr, 14), y, 'ang'), label(away(mid(pB, pC), ctr, 14), z, 'ang')];
  if (alt) parts.push(seg(pA, T([px, 0]), 'seg dash'), corner(T([px, 0]), pC, pA));
  return svg(w, h, `A triangle with sides ${x}, ${y} and ${z}`, parts);
}
const HERON = [[13, 14, 15, 84], [5, 5, 6, 12], [5, 5, 8, 12], [10, 13, 13, 60], [9, 10, 17, 36], [7, 15, 20, 42], [11, 13, 20, 66], [13, 20, 21, 126], [10, 17, 21, 84], [12, 17, 25, 90]];
// a triangle's three altitudes from coordinates (Heron not needed): 2·area/side for each side
function altitudes(x, y, z) {
  const px = (x * x - y * y + z * z) / (2 * z), A = [px, Math.sqrt(x * x - px * px)], area = shoelace([A, [0, 0], [z, 0]]);
  return [x, y, z].map((s) => (2 * area) / s);
}
// rectangle KLMN (K top left, L top right, M bottom right, N bottom left) with S on KL (SL = e) and U on MN (NU = f)
const cross = (p, q) => p[0] * q[1] - p[1] * q[0];
// where segment S→U meets the line A→Z: s along SU and u along AZ, as whole-number fractions, or null if not inside both
function cut(S, U, A, Z) {
  const d1 = [U[0] - S[0], U[1] - S[1]], d2 = [Z[0] - A[0], Z[1] - A[1]], wv = [A[0] - S[0], A[1] - S[1]];
  let den = cross(d1, d2), sT = cross(wv, d2), uT = cross(wv, d1);
  if (den < 0) { den = -den; sT = -sT; uT = -uT; }
  return den && sT > 0 && sT < den && uT > 0 && uT < den ? { s: lowest(sT, den), u: lowest(uT, den) } : null;
}
const fracOf = (p) => frac(p[0], p[1]);
function rectangleKLMN(W, H, e, f, lines, marks, w = 380, h = 280) {
  const T = frame([0, W], [0, H], w, h, 32), [K, L, M, N] = [[0, H], [W, H], [W, 0], [0, 0]].map(T), ctr = T([W / 2, H / 2]);
  const S = T([W - e, H]), U = T([f, 0]);
  return svg(w, h, 'Rectangle KLMN with segment SU', [poly([K, L, M, N]), seg(S, U), ...lines.map(([p, q]) => seg(T(p), T(q), 'seg')),
    ...[[K, 'K'], [L, 'L'], [M, 'M'], [N, 'N']].map(([p, s]) => label(away(p, ctr, 16), s)), label([S[0], S[1] - 12], 'S'), label([U[0], U[1] + 17], 'U'),
    ...marks.map(([p, s, dx, dy]) => label(T(p).map((v, i) => v + [dx, dy][i]), s))]);
}
// the seven-cookie flower: dough of radius 3r, cookies of radius r
function flower(r, w = 300, h = 300) {
  const T = frame([-3 * r, 3 * r], [-3 * r, 3 * r], w, h, 14), O = T([0, 0]);
  const ring6 = Array.from({ length: 6 }, (_, i) => [2 * r * Math.cos((i * Math.PI) / 3), 2 * r * Math.sin((i * Math.PI) / 3)]);
  return { ring6, figure: svg(w, h, 'Seven cookies cut from a round sheet of dough', [ring(O, 3 * r * T.s), ring(O, r * T.s), ...ring6.map((p) => ring(T(p), r * T.s))]) };
}
const flowerLeft = (r) => {
  const ring6 = Array.from({ length: 6 }, (_, i) => [2 * r * Math.cos((i * Math.PI) / 3), 2 * r * Math.sin((i * Math.PI) / 3)]), cookies = [[0, 0], ...ring6];
  return gridArea([-3 * r, 3 * r], [-3 * r, 3 * r], (p) => Math.hypot(...p) <= 3 * r && cookies.every((q) => dist(p, q) > r), 700);
};

export const geometry = {
  'Perpendicular to a diagonal': [
    // the area of a triangle cut off by the foot of the perpendicular
    (d, ctx) => {
      const [[a, b]] = combo(ctx, [[[2, 3], [3, 2], [3, 5], [5, 3], [4, 5], [5, 4], [5, 6], [6, 5], [4, 7], [7, 4], [5, 7], [7, 5], [1, 2], [2, 1], [2, 5], [5, 2]]]);
      const [W, X, Y, Z, F] = d.pick(NAMES).split(''), c2 = a * a + b * b, ans = [a ** 3 * b, 2 * c2];
      const { T, at, marks } = rectangle([W, X, Y, Z], a, b), pF = T([a ** 3 / c2, (a * a * b) / c2]);
      return {
        topic: 'Perpendicular to a diagonal', rank: 15,
        text: `In rectangle ${W}${X}${Y}${Z}, side ${W}${X} is ${a} long and side ${X}${Y} is ${b} long. A perpendicular dropped from ${X} meets the diagonal ${W}${Y} at ${F}. What is the area of triangle ${W}${F}${Z}?`,
        figure: svg(360, 250, `Rectangle ${W}${X}${Y}${Z} with the perpendicular from ${X} to ${W}${Y}`, [
          poly([at[0], pF, at[3]]), poly(at), seg(at[0], at[2]), seg(at[1], pF, 'seg'), corner(pF, at[1], at[2]), ...marks, label(away(pF, at[1], 16), F)]),
        answer: choices(d, ans, [[a * b ** 3, 2 * c2], [a * b, 4], [a ** 3 * b, c2], [a * a * b * b, 2 * c2], [a * b, 2]], showFrac),
        solution: `Put ${W} at (0, 0), ${X} at (${a}, 0), ${Y} at (${a}, ${b}) and ${Z} at (0, ${b}). Right triangles ${W}${F}${X} and ${W}${X}${Y} share the angle at ${W}, so ${W}${F} = ${W}${X}²/${W}${Y} = ${a * a}/${root(c2)}, and ${F} is ${W}${F}·${a}/${root(c2)} = ${frac(a ** 3, c2)} to the right of ${W}${Z}. Triangle ${W}${F}${Z} has base ${W}${Z} = ${b} and that much height, so its area is ½·${b}·${frac(a ** 3, c2)} = <b>${frac(...ans)}</b>.`,
        check: () => near(shoelace([[0, 0], meet([[0, 0], [a, b]], [[a, 0], [a - b, a]]), [0, b]]), ans[0] / ans[1], 'area'),
      };
    },
    // how long the perpendicular is
    (d, ctx) => {
      const [[a, b, c]] = combo(ctx, [TRIPLES]);
      const [W, X, Y, Z, F] = d.pick(NAMES).split(''), ans = lowest(a * b, c), c2 = c * c;
      const { T, at, marks } = rectangle([W, X, Y, Z], a, b), pF = T([a ** 3 / c2, (a * a * b) / c2]);
      return {
        topic: 'Perpendicular to a diagonal', rank: 12,
        text: `In rectangle ${W}${X}${Y}${Z}, ${W}${X} = ${a} and ${X}${Y} = ${b}. The perpendicular from ${X} to the diagonal ${W}${Y} meets it at ${F}. How long is ${X}${F}?`,
        figure: svg(360, 250, `Rectangle ${W}${X}${Y}${Z} with the perpendicular from ${X} to ${W}${Y}`, [
          poly(at), seg(at[0], at[2]), seg(at[1], pF, 'seg'), corner(pF, at[1], at[2]), ...marks, label(away(pF, at[1], 16), F)]),
        answer: choices(d, ans, [lowest(a * b, a + b), lowest(c, 2), lowest(a * b, 2 * c), lowest(a + b, 2), lowest(a * b, c + 1)], showFrac),
        solution: `The diagonal is √(${a}² + ${b}²) = ${c}. Triangle ${W}${X}${Y} has area ½·${a}·${b}, and also ½·${c}·${X}${F}, taking the diagonal as its base. So ${X}${F} = ${a}·${b}/${c} = <b>${frac(...ans)}</b>.`,
        check: () => near(dist([a, 0], meet([[0, 0], [a, b]], [[a, 0], [a - b, a]])), ans[0] / ans[1], 'XF'),
      };
    },
    // the ratio in which the foot splits the diagonal
    (d, ctx) => {
      const [[a, b]] = combo(ctx, [[[2, 3], [3, 2], [1, 2], [2, 1], [3, 4], [4, 3], [2, 5], [5, 2], [3, 5], [5, 3], [4, 5], [5, 4], [1, 3], [3, 1]]]);
      const [W, X, Y, Z, F] = d.pick(NAMES).split(''), c2 = a * a + b * b, correct = ratio(a * a, b * b);
      const { T, at, marks } = rectangle([W, X, Y, Z], a, b), pF = T([a ** 3 / c2, (a * a * b) / c2]);
      return {
        topic: 'Perpendicular to a diagonal', rank: 13,
        text: `In rectangle ${W}${X}${Y}${Z}, ${W}${X} = ${a} and ${X}${Y} = ${b}. The perpendicular from ${X} to the diagonal ${W}${Y} meets it at ${F}. What is the ratio ${W}${F} : ${F}${Y}?`,
        figure: svg(360, 250, `Rectangle ${W}${X}${Y}${Z} with the perpendicular from ${X} to ${W}${Y}`, [
          poly(at), seg(at[0], at[2]), seg(at[1], pF, 'seg'), corner(pF, at[1], at[2]), ...marks, label(away(pF, at[1], 16), F)]),
        answer: labelled(correct, [ratio(a, b), ratio(b * b, a * a), ratio(b, a), ratio(a * a, c2), ratio(a * a, 2 * b * b)]),
        solution: `Right triangles ${W}${F}${X} and ${W}${X}${Y} are similar (they share the angle at ${W}), so ${W}${F} = ${W}${X}²/${W}${Y}. In the same way, ${X}${F}${Y} and ${W}${X}${Y} share the angle at ${Y}, so ${F}${Y} = ${X}${Y}²/${W}${Y}. Dividing, ${W}${F} : ${F}${Y} = ${a}² : ${b}² = <b>${correct[1]}</b>.`,
        check: () => { const Fp = meet([[0, 0], [a, b]], [[a, 0], [a - b, a]]); return near(dist([0, 0], Fp) / dist(Fp, [a, b]), correct[0], 'WF/FY'); },
      };
    },
    // two perpendiculars to the same diagonal: how far apart their feet are
    (d, ctx) => {
      const [[a, b, c]] = combo(ctx, [TRIPLES]);
      const [W, X, Y, Z, F, G] = d.pick(NAMES).split(''), c2 = c * c, ans = lowest(Math.abs(a * a - b * b), c);
      const { T, at, marks } = rectangle([W, X, Y, Z], a, b), pF = T([a ** 3 / c2, (a * a * b) / c2]), pG = T([(a * b * b) / c2, b ** 3 / c2]);
      return {
        topic: 'Perpendicular to a diagonal', rank: 16,
        text: `In rectangle ${W}${X}${Y}${Z}, ${W}${X} = ${a} and ${X}${Y} = ${b}. Perpendiculars from ${X} and from ${Z} meet the diagonal ${W}${Y} at ${F} and ${G}. How long is ${F}${G}?`,
        figure: svg(360, 250, `Rectangle ${W}${X}${Y}${Z} with perpendiculars from ${X} and ${Z} to ${W}${Y}`, [
          poly(at), seg(at[0], at[2]), seg(at[1], pF, 'seg'), seg(at[3], pG, 'seg'), corner(pF, at[1], at[2]), corner(pG, at[3], at[0]), ...marks,
          label(away(pF, at[1], 16), F), label(away(pG, at[3], 16), G)]),
        answer: choices(d, ans, [lowest(Math.abs(a - b), 1), lowest(a * b, c), lowest(Math.abs(a * a - b * b), 2 * c), lowest(c, 2), lowest((a - b) ** 2, c)], showFrac),
        solution: `Similar right triangles give the distance of each foot from ${W} along the diagonal: ${W}${F} = ${W}${X}²/${W}${Y} = ${frac(a * a, c)}, and ${W}${G} = ${W}${Z}²/${W}${Y} = ${frac(b * b, c)} (${W}${Z} = ${X}${Y} = ${b}). Both are measured from ${W}, so ${F}${G} = |${a * a} − ${b * b}|/${c} = <b>${frac(...ans)}</b>.`,
        check: () => near(dist(meet([[0, 0], [a, b]], [[a, 0], [a - b, a]]), meet([[0, 0], [a, b]], [[0, b], [b, b - a]])), ans[0] / ans[1], 'FG'),
      };
    },
  ],

  'Extending the sides': [
    // the area of the big triangle
    (d, ctx) => {
      const [[p, q]] = combo(ctx, [[[2, 1], [1, 1], [1, 2], [3, 2], [1, 3], [2, 3]]]);
      const t = d.int(2, 6), T0 = q * q * t, cornerA = t * p * (p + q), ans = T0 + 3 * cornerA, mT = q === 1 ? num(p, 0) : frac(p, q);
      return {
        topic: 'Extending the sides', rank: 19,
        text: `Triangle PQR has area ${T0}. Each side is extended past one end: PQ past Q to Q′, QR past R to R′, and RP past P to P′, each extension ${TIMES[`${p}/${q}`]} the side it extends. What is the area of triangle P′Q′R′?`,
        figure: extended(p / q),
        answer: choices(d, ans, [t * (p + q) ** 2, t * (2 * p + q) ** 2, 3 * cornerA, t * (q * q + 3 * p * p), t * (q * q + 2 * p * (p + q))]),
        solution: `Look at triangle QQ′R′. At Q its sides are QQ′ = ${p === q ? '' : mT + '·'}PQ and QR′ = ${frac(p + q, q)}·QR, and the angle between them is the supplement of angle Q, which has the same sine. So its area is ${p === q ? '' : `${mT}·${frac(p + q, q)} = `}${frac(p * (p + q), q * q)} times the area of PQR, that is ${num(cornerA)}. The corner triangles at R and P are the same size, so P′Q′R′ has area ${T0} + 3·${num(cornerA)} = <b>${num(ans)}</b>.`,
        check: () => near(extendedArea(p / q, T0), ans, 'area'),
      };
    },
    // the big triangle's area given: the original's
    (d, ctx) => {
      const [[p, q], t] = combo(ctx, [[[2, 1], [1, 1], [1, 2], [3, 2], [1, 3], [2, 3]], [2, 3, 4, 5]]);
      const T0 = q * q * t, cornerA = t * p * (p + q), T1 = T0 + 3 * cornerA, mT = q === 1 ? num(p, 0) : frac(p, q);
      return {
        topic: 'Extending the sides', rank: 17,
        text: `Each side of triangle PQR is extended past one end: PQ past Q to Q′, QR past R to R′, and RP past P to P′, each extension ${TIMES[`${p}/${q}`]} the side it extends. Triangle P′Q′R′ has area ${T1}. What is the area of triangle PQR?`,
        figure: extended(p / q),
        answer: choices(d, T0, [cornerA, 3 * cornerA, T1 - cornerA, 2 * T0, T1 - 2 * T0]),
        solution: `Each corner triangle, like QQ′R′, has sides ${p === q ? '' : mT + '·'}PQ and ${frac(p + q, q)}·QR around an angle with the same sine as angle Q, so it has ${frac(p * (p + q), q * q)} times the area of PQR. So P′Q′R′ has 1 + 3·${frac(p * (p + q), q * q)} = ${frac(q * q + 3 * p * (p + q), q * q)} times the area of PQR, and PQR has area ${T1} ÷ ${frac(q * q + 3 * p * (p + q), q * q)} = <b>${T0}</b>.`,
        check: () => near(extendedArea(p / q, T0), T1, 'area'),
      };
    },
    // both areas given: how far each side was extended
    (d, ctx) => {
      const [[p, q], t] = combo(ctx, [[[1, 1], [2, 1], [3, 1], [1, 2], [3, 2], [2, 3], [1, 3], [4, 1]], [1, 2, 3]]);
      const T0 = q * q * t, T1 = t * (q * q + 3 * p * (p + q)), kk = lowest(T1 - T0, 3 * T0);
      return {
        topic: 'Extending the sides', rank: 20,
        text: `Triangle PQR has area ${T0}. Each side is extended past one end, PQ past Q to Q′, QR past R to R′ and RP past P to P′, every extension being the same number k times as long as the side it extends. Triangle P′Q′R′ has area ${T1}. What is k?`,
        figure: extended(p / q),
        answer: choices(d, lowest(p, q), [kk, lowest(p + q, q), lowest(2 * p, q), lowest(p, 2 * q), lowest(T1 - T0, T0), lowest(3 * p, q), lowest(p + 2 * q, 2 * q)], showFrac),
        solution: `Each corner triangle, like QQ′R′, has sides k·PQ and (k + 1)·QR at Q, around an angle with the same sine as angle Q, so it has k(k + 1) times the area of PQR. So ${T1} = ${T0}·(1 + 3k(k + 1)), which gives k(k + 1) = ${frac(...kk)}. Then k = <b>${frac(p, q)}</b>, since ${frac(p, q)}·${frac(p + q, q)} = ${frac(p * (p + q), q * q)}.`,
        check: () => { const c = kk[0] / kk[1], k = (-1 + Math.sqrt(1 + 4 * c)) / 2; return near(k, p / q, 'k') || near(extendedArea(k, T0), T1, 'area'); },
      };
    },
    // the same with a square
    (d, ctx) => {
      const [s, [p, q]] = combo(ctx, [[2, 3, 4, 5, 6], [[1, 1], [2, 1], [1, 2], [3, 1], [3, 2]]], (s, [p, q]) => (s * s * (q * q + 2 * p * (p + q))) % (q * q) === 0);
      const m = p / q, area = (s * s * (q * q + 2 * p * (p + q))) / (q * q), leg1 = m * s, leg2 = (1 + m) * s;
      const ext = (A, B) => [B[0] + m * (B[0] - A[0]), B[1] + m * (B[1] - A[1])], sq = [[0, 0], [s, 0], [s, s], [0, s]];
      const big = [ext(sq[3], sq[0]), ext(sq[0], sq[1]), ext(sq[1], sq[2]), ext(sq[2], sq[3])];
      const Tf = fit([...sq, ...big], 340, 300, 28), ps = sq.map(Tf), pb = big.map(Tf), g = centre(ps);
      return {
        topic: 'Extending the sides', rank: 14,
        text: `Square ABCD has side ${s}. Each side is extended past one end: AB past B to B′, BC past C to C′, CD past D to D′ and DA past A to A′, each extension ${TIMES[`${p}/${q}`]} the side it extends. What is the area of A′B′C′D′?`,
        figure: svg(340, 300, 'Square ABCD with its sides extended', [poly(ps), poly(pb), ...ps.map((pt, i) => seg(pt, pb[i], 'side dash')),
          ...'ABCD'.split('').map((n, i) => label(away(ps[i], g, 13), n)), ...'ABCD'.split('').map((n, i) => label(away(pb[i], g, 15), n + '′'))]),
        answer: choices(d, area, [s * s * (1 + m) ** 2, s * s * (1 + 2 * m) ** 2, s * s * (1 + 4 * m * (1 + m)), s * s * (1 + m * (1 + m)), s * s * 2 * m * (1 + m)]),
        solution: `Each corner triangle, like BB′C′, has a right angle at the square's corner, with legs BB′ = ${num(leg1)} and BC′ = ${s} + ${num(leg1)} = ${num(leg2)}, so its area is ½·${num(leg1)}·${num(leg2)} = ${num((leg1 * leg2) / 2)}. A′B′C′D′ is the square plus four of them: ${s * s} + 4·${num((leg1 * leg2) / 2)} = <b>${num(area)}</b>.`,
        check: () => near(shoelace(big), area, 'area'),
      };
    },
  ],

  'Points near a segment': [
    // the length, from the volume
    (d, ctx) => {
      const [r, L] = combo(ctx, [[2, 4, 5, 6], [5, 6, 7, 8, 9, 10, 11, 12, 14, 15]]);
      const [vp, vq] = lowest(3 * r * r * L + 4 * r ** 3, 3), V = piShow([vp, vq]), [X, Y] = d.pick([['X', 'Y'], ['M', 'N'], ['U', 'V']]);
      return {
        topic: 'Points near a segment', rank: 11,
        text: `The points of space that are at most ${units(r)} from segment ${X}${Y} fill a solid with volume ${V}. How long is ${X}${Y}?`,
        figure: capsule(r, L, X, Y),
        answer: choices(d, [L, 1], [[3 * r * r * L + 4 * r ** 3, 3 * r * r], [3 * L + 2 * r, 3], [3 * L - 4 * r, 3], [L + 2 * r, 1]], showFrac),
        solution: `The solid is a cylinder of radius ${r} around ${X}${Y}, with half a ball of radius ${r} on each end; the two halves make one whole ball. So ${V} = ${frac(4, 3)}π·${r}³ + π·${r}²·${X}${Y} = ${piShow(lowest(4 * r ** 3, 3))} + ${r * r}π·${X}${Y}, which gives ${X}${Y} = <b>${L}</b>.`,
        check: () => near(capsuleVolume(r, L), (Math.PI * vp) / vq, 'volume'),
      };
    },
    // the volume, from the length
    (d, ctx) => {
      const [r, L] = combo(ctx, [[1, 2, 3, 4, 5, 6], [2, 3, 4, 5, 6, 8, 9, 10, 12]]);
      const ans = lowest(3 * r * r * L + 4 * r ** 3, 3);
      return {
        topic: 'Points near a segment', rank: 9,
        text: `What is the volume of the solid made of all the points of space that are at most ${units(r)} from a segment ${units(L)} long?`,
        figure: capsule(r, L, 'A', 'B'),
        answer: choices(d, ans, [[r * r * L, 1], lowest(3 * r * r * L + 8 * r ** 3, 3), lowest(3 * r * r * L + 2 * r ** 3, 3), [r * r * L + 4 * r ** 3, 1], lowest(3 * r * r * L + 4 * r * r, 3)], piShow),
        solution: `The solid is a cylinder of radius ${r} and length ${L}, with half a ball of radius ${r} on each end; the two halves make one whole ball. Volume: π·${r}²·${L} + ${frac(4, 3)}π·${r}³ = ${piShow([r * r * L, 1])} + ${piShow(lowest(4 * r ** 3, 3))} = <b>${piShow(ans)}</b>.`,
        check: () => near(capsuleVolume(r, L), (Math.PI * ans[0]) / ans[1], 'volume'),
      };
    },
    // the surface area of the same solid
    (d, ctx) => {
      const [r, L] = combo(ctx, [[1, 2, 3, 4, 5], [2, 3, 4, 5, 6, 7, 8, 10]]);
      const k = 2 * r * L + 4 * r * r;
      return {
        topic: 'Points near a segment', rank: 12,
        text: `The points of space that are at most ${units(r)} from a segment ${units(L)} long fill a solid. What is the surface area of that solid?`,
        figure: capsule(r, L, 'A', 'B'),
        answer: choices(d, k, [2 * r * L, 2 * r * L + 2 * r * r, 2 * r * L + 8 * r * r, r * L + 4 * r * r, 4 * r * L + 4 * r * r], (v) => piShow([v, 1])),
        solution: `The surface is the side of a cylinder of radius ${r} and length ${L}, plus a half sphere at each end, which together make one whole sphere: 2π·${r}·${L} + 4π·${r}² = ${piShow([2 * r * L, 1])} + ${piShow([4 * r * r, 1])} = <b>${piShow([k, 1])}</b>.`,
        // the surface is how fast the volume grows as the radius grows
        check: () => { const e = 1e-4; return near((capsuleVolume(r + e, L) - capsuleVolume(r - e, L)) / (2 * e), k * Math.PI, 'surface', 1e-4); },
      };
    },
    // the flat version: the points of a plane near a segment
    (d, ctx) => {
      const [r, L] = combo(ctx, [[1, 2, 3, 4, 5], [3, 4, 5, 6, 8, 10]]);
      const correct = plusPi(2 * r * L, r * r);
      return {
        topic: 'Points near a segment', rank: 10,
        text: `In a flat plane, the points that are at most ${units(r)} from a segment ${units(L)} long fill a region. What is the area of the region?`,
        figure: capsule(r, L, 'A', 'B'),
        answer: labelled(correct, [plusPi(2 * r * L, 2 * r * r), plusPi(r * L, r * r), [2 * r * L + 4 * r * r, num(2 * r * L + 4 * r * r, 0)], plusPi(4 * r * L, r * r), [r * r * L * Math.PI, piShow([r * r * L, 1])]]),
        solution: `Along the segment the region is ${an(2 * r)} ${2 * r}-by-${L} rectangle, and around each end it is half a disc of radius ${r}; the two halves make one disc. Area: ${2 * r}·${L} + π·${r}² = <b>${correct[1]}</b>.`,
        check: () => near(gridArea([-r, L + r], [-r, r], (p) => toSegment(p, [0, 0], [L, 0]) <= r, 800), correct[0], 'area', 0.01),
      };
    },
  ],

  'Octahedron in a box': [
    // the octahedron's volume
    (d, ctx) => {
      const [[a, b, c]] = combo(ctx, [[[2, 3, 4], [2, 3, 5], [3, 4, 6], [2, 4, 6], [3, 5, 6], [4, 5, 6], [2, 6, 7], [3, 4, 8], [4, 6, 9], [3, 6, 7]]]);
      const abc = a * b * c, { at, parts } = octahedron(a, c, b);
      return {
        topic: 'Octahedron in a box', rank: 17,
        text: `A box measures ${a} by ${b} by ${c}. The centres of its six faces are the corners of an octahedron. What is the volume of the octahedron?`,
        figure: svg(380, 280, 'A box with the octahedron joining the centres of its faces', [...parts,
          label([mid(at[0], at[1])[0], at[0][1] + 20], a, 'ang'), label([at[0][0] - 14, mid(at[0], at[4])[1]], b, 'ang'), label(mid(at[1], at[2]).map((v, i) => v + [14, 8][i]), c, 'ang')]),
        answer: choices(d, [abc, 6], [[abc, 3], [abc, 2], [abc, 12], [abc, 4], [abc, 8]], showFrac),
        solution: `The segments joining opposite face centres have lengths ${a}, ${b} and ${c}, and they cross at right angles at the centre of the box. The plane of the first two cuts the octahedron into two pyramids, each with a rhombus base of diagonals ${a} and ${b} (area ½·${a}·${b} = ${num((a * b) / 2)}) and height ${frac(c, 2)}. Volume: 2·⅓·${num((a * b) / 2)}·${frac(c, 2)} = ${a}·${b}·${c}/6 = <b>${frac(abc, 6)}</b>.`,
        check: () => {
          // the 8 faces each take one corner from each pair of opposite face centres; add up the tetrahedra they make with the middle
          const X = [[0, b / 2, c / 2], [a, b / 2, c / 2]], Y = [[a / 2, 0, c / 2], [a / 2, b, c / 2]], Z = [[a / 2, b / 2, 0], [a / 2, b / 2, c]], O = [a / 2, b / 2, c / 2];
          let vol = 0;
          for (const x of X) for (const y of Y) for (const z of Z) vol += tetra(O, x, y, z);
          return near(vol, abc / 6, 'volume');
        },
      };
    },
    // the volume given: how tall the box is
    (d, ctx) => {
      const [[a, b, c]] = combo(ctx, [[[2, 3, 4], [2, 3, 5], [3, 4, 6], [2, 4, 6], [3, 5, 6], [4, 5, 6], [2, 6, 7], [3, 4, 8], [4, 6, 9], [3, 6, 7]]]);
      const V = lowest(a * b * c, 6), { at, parts } = octahedron(a, b, c);
      return {
        topic: 'Octahedron in a box', rank: 15,
        text: `A box has a ${a}-by-${b} bottom, and its height h is unknown. The centres of its six faces are the corners of an octahedron with volume ${frac(...V)}. What is h?`,
        figure: svg(380, 280, 'A box with the octahedron joining the centres of its faces', [...parts,
          label([mid(at[0], at[1])[0], at[0][1] + 20], a, 'ang'), label(mid(at[1], at[2]).map((v, i) => v + [12, 10][i]), b, 'ang'), label([at[2][0] + 14, mid(at[2], at[6])[1]], 'h', 'ang')]),
        answer: choices(d, c, [2 * c, lowest(c, 2), lowest(c, 3), 3 * c, lowest(2 * c, 3)], showFrac),
        solution: `The octahedron is always a sixth of its box: two pyramids on a rhombus of area ½·${a}·${b}, each of height h/2, make 2·⅓·${frac(a * b, 2)}·${over('h', 2)} = ${over(`${a * b}h`, 6)}. So ${a * b}h/6 = ${frac(...V)}, and h = 6·${frac(...V)}/${a * b} = <b>${c}</b>.`,
        check: () => {
          const X = [[0, b / 2, c / 2], [a, b / 2, c / 2]], Y = [[a / 2, 0, c / 2], [a / 2, b, c / 2]], Z = [[a / 2, b / 2, 0], [a / 2, b / 2, c]], O = [a / 2, b / 2, c / 2];
          let vol = 0;
          for (const x of X) for (const y of Y) for (const z of Z) vol += tetra(O, x, y, z);
          return near(vol, V[0] / V[1], 'volume');
        },
      };
    },
    // a cube: the regular octahedron's surface area
    (d, ctx) => {
      const [s] = combo(ctx, [[2, 4, 6, 8, 10, 12]]);
      const correct = surd(s * s, 3), { at, parts } = octahedron(s, s, s, 340, 280);
      return {
        topic: 'Octahedron in a box', rank: 18,
        text: `The centres of the six faces of a cube with edge ${s} are the corners of a regular octahedron. What is the surface area of the octahedron?`,
        figure: svg(340, 280, 'A cube with the octahedron joining the centres of its faces', [...parts, label([mid(at[0], at[1])[0], at[0][1] + 20], s, 'ang')]),
        answer: labelled(correct, [surd(2 * s * s, 3), fracSurd(s * s, 2, 3), surd(s * s, 2), fracSurd(s * s, 4, 3), [s * s, num(s * s, 0)], surd(4 * s * s, 3)]),
        solution: `Two neighbouring face centres are each ${s / 2} from the cube's centre, along perpendicular lines, so the octahedron's edge is √(${s / 2}² + ${s / 2}²) = ${surd(s / 2, 2)[1]}. Its 8 faces are equilateral triangles of area (√3/4)·(edge)² = (√3/4)·${(s * s) / 2}, so the surface area is 8·(√3/4)·${(s * s) / 2} = <b>${correct[1]}</b>.`,
        check: () => {
          const h = s / 2, X = [[-h, 0, 0], [h, 0, 0]], Y = [[0, -h, 0], [0, h, 0]], Z = [[0, 0, -h], [0, 0, h]];
          let area = 0;
          for (const x of X) for (const y of Y) for (const z of Z) { const u = sub3(y, x), v = sub3(z, x); area += Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]) / 2; }
          return near(area, correct[0], 'surface');
        },
      };
    },
    // how far apart the centres of two neighbouring faces are
    (d, ctx) => {
      const [[a, b, c]] = combo(ctx, [[[2, 3, 4], [6, 8, 5], [3, 4, 6], [2, 4, 6], [5, 12, 4], [4, 5, 6], [2, 6, 7], [3, 4, 8], [4, 6, 9], [3, 6, 7]]]);
      const correct = fracSurd(1, 2, a * a + b * b), { P, at, ctr, edges } = boxPicture(a, b, c, 380, 280);
      const p1 = P([a / 2, 0, c / 2]), p2 = P([a, b / 2, c / 2]);
      return {
        topic: 'Octahedron in a box', rank: 14,
        text: `A box measures ${a} by ${b} by ${c}, with its ${a}-by-${c} face at the front and its ${b}-by-${c} face on the right, so the two faces share an edge. How far apart are the centres of those two faces?`,
        figure: svg(380, 280, 'A box with the centres of two neighbouring faces joined', [...edges, seg(p1, p2, 'seg'), ring(p1, 3, 'seg'), ring(p2, 3, 'seg'), ...boxSides(at, a, b, c)]),
        answer: labelled(correct, [surd(1, a * a + b * b), fracSurd(1, 2, a * a + b * b + c * c), fracSurd(a + b, 2), fracSurd(1, 2, a * a + c * c), fracSurd(1, 2, b * b + c * c)]),
        solution: `Both centres are halfway up the box. Seen from above, one is ${frac(a, 2)} from the shared edge along the ${a} side and the other is ${frac(b, 2)} from it along the ${b} side, at right angles. So they are √((${a}/2)² + (${b}/2)²) = √(${a * a + b * b})/2 = <b>${correct[1]}</b> apart.`,
        check: () => near(Math.hypot(a / 2 - a, 0 - b / 2, 0), correct[0], 'distance'),
      };
    },
  ],

  'Pyramid in a box': [
    // the pyramid on a slanted rectangle, apex on an edge
    (d, ctx) => {
      const [[a, b, c], [fp, fq]] = combo(ctx, [[[4, 2, 3], [2, 3, 4], [5, 2, 3], [4, 3, 2], [6, 1, 3], [3, 2, 4], [5, 3, 2], [4, 1, 3], [6, 2, 1], [2, 1, 5]], [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]]);
      const abc = a * b * c, { P, at, ctr, top, edges } = boxPicture(a, b, c, 380, 280);
      const M3 = [a, (b * fp) / fq, c], pM = P(M3);
      const where = fp * 2 === fq ? 'Point M is the midpoint of edge FG.' : `Point M is on edge FG, with FM : MG = ${fp} : ${fq - fp}.`;
      const BE = root(a * a + c * c);
      return {
        topic: 'Pyramid in a box', rank: 10,
        text: `In the box ABCDEFGH shown, AB = ${a}, BC = ${b} and CG = ${c}. ${where} What is the volume of the pyramid whose base is the rectangle BCHE and whose apex is M?`,
        figure: svg(380, 280, 'Box ABCDEFGH with the pyramid on BCHE', [poly([at[1], at[2], at[7], at[4]]), ...edges,
          ...[at[1], at[2], at[7], at[4]].map((p) => seg(pM, p, 'seg')),
          ...boxLetters(at, ctr, 'F'), label(away(at[5], at[6], 14), 'F'), label(away(pM, top, 15), 'M'), ...boxSides(at, a, b, c)]),
        answer: choices(d, [abc, 3], [[abc, 6], [abc, 2], [2 * abc, 3], [abc, 1], [abc, 12]], showFrac),
        solution: `BCHE is a rectangle with BC = ${b} and BE = √(${a}² + ${c}²) = ${BE}. Edge FG is parallel to it, so M is exactly as far from BCHE as F is, and that is the height from F to the diagonal BE in the ${a}-by-${c} rectangle ABFE: ${over(`${a}·${c}`, BE)}. So the volume is ⅓·${b}·${BE}·${over(`${a}·${c}`, BE)} = ${over(`${a}·${b}·${c}`, 3)} = <b>${frac(abc, 3)}</b>, wherever M is on FG.`,
        check: () => {
          const B = [a, 0, 0], C = [a, b, 0], E = [0, 0, c], H = [0, b, c];
          return near(tetra(M3, B, C, H) + tetra(M3, B, H, E), abc / 3, 'volume');
        },
      };
    },
    // a plane through three corners slices off a corner
    (d, ctx) => {
      const [[a, b, c]] = combo(ctx, [[[4, 2, 3], [2, 3, 4], [5, 2, 3], [4, 3, 2], [6, 1, 3], [3, 2, 4], [5, 3, 2], [6, 2, 5], [3, 4, 5], [2, 5, 6]]]);
      const abc = a * b * c, ans = lowest(abc, 6), { at, ctr, edges } = boxPicture(a, b, c, 380, 280);
      return {
        topic: 'Pyramid in a box', rank: 8,
        text: `In the box ABCDEFGH shown, AB = ${a}, AD = ${b} and AE = ${c}. The plane through B, D and E slices the corner at A off the box. What is the volume of the piece it slices off?`,
        figure: svg(380, 280, 'Box ABCDEFGH with the corner at A sliced off', [...edges, seg(at[1], at[3], 'seg'), seg(at[3], at[4], 'seg'), seg(at[4], at[1], 'seg'), ...boxLetters(at, ctr),
          label([mid(at[0], at[1])[0], at[0][1] + 20], a, 'ang'), label([at[0][0] - 14, mid(at[0], at[4])[1]], c, 'ang'), label(mid(at[1], at[2]).map((v, i) => v + [12, 10][i]), b, 'ang')]),
        answer: choices(d, ans, [lowest(abc, 3), lowest(abc, 2), lowest(abc, 12), [abc, 1], lowest(abc, 4)], showFrac),
        solution: `The piece is the pyramid ABDE. Its base is the right triangle ABD, of area ½·${a}·${b}, and its height is AE = ${c}, so its volume is ⅓·½·${a}·${b}·${c} = ${over(`${a}·${b}·${c}`, 6)} = <b>${frac(...ans)}</b>.`,
        check: () => near(tetra([0, 0, 0], [a, 0, 0], [0, b, 0], [0, 0, c]), ans[0] / ans[1], 'volume'),
      };
    },
    // the pyramid's volume given: the height of the box
    (d, ctx) => {
      const [[a, b, c]] = combo(ctx, [[[4, 2, 3], [2, 3, 4], [5, 2, 3], [4, 3, 2], [6, 1, 3], [3, 2, 4], [5, 3, 2], [4, 1, 3], [6, 2, 5], [2, 1, 5]]]);
      const V = lowest(a * b * c, 3), { P, at, ctr, top, edges } = boxPicture(a, b, c, 380, 280), M3 = [a, b / 2, c], pM = P(M3);
      return {
        topic: 'Pyramid in a box', rank: 11,
        text: `In the box ABCDEFGH shown, AB = ${a} and BC = ${b}, and M is the midpoint of edge FG. The pyramid whose base is the rectangle BCHE and whose apex is M has volume ${frac(...V)}. How long is CG?`,
        figure: svg(380, 280, 'Box ABCDEFGH with the pyramid on BCHE', [poly([at[1], at[2], at[7], at[4]]), ...edges,
          ...[at[1], at[2], at[7], at[4]].map((p) => seg(pM, p, 'seg')), ...boxLetters(at, ctr, 'F'), label(away(at[5], at[6], 14), 'F'), label(away(pM, top, 15), 'M'),
          label([mid(at[0], at[1])[0], at[0][1] + 20], a, 'ang'), label(mid(at[1], at[2]).map((v, i) => v + [12, 10][i]), b, 'ang')]),
        answer: choices(d, c, [2 * c, lowest(c, 3), lowest(2 * c, 3), 3 * c, lowest(c, 2)], showFrac),
        solution: `FG is parallel to the base BCHE, so the pyramid's volume doesn't depend on where M is on FG; with M at F it works out to a third of the box: ${a}·${b}·CG/3. So ${a * b}·CG/3 = ${frac(...V)}, and CG = 3·${frac(...V)}/${a * b} = <b>${c}</b>.`,
        check: () => { const B = [a, 0, 0], C = [a, b, 0], E = [0, 0, c], H = [0, b, c]; return near(tetra(M3, B, C, H) + tetra(M3, B, H, E), V[0] / V[1], 'volume'); },
      };
    },
    // the tetrahedron on four corners, no two on an edge
    (d, ctx) => {
      const [[a, b, c]] = combo(ctx, [[[4, 2, 3], [2, 3, 4], [5, 2, 3], [4, 3, 2], [6, 1, 3], [3, 2, 4], [5, 3, 2], [6, 2, 5], [3, 4, 5], [2, 5, 6]]]);
      const abc = a * b * c, ans = lowest(abc, 3), { at, ctr, edges } = boxPicture(a, b, c, 380, 280);
      const [A, C, F, H] = [at[0], at[2], at[5], at[7]];
      return {
        topic: 'Pyramid in a box', rank: 17,
        text: `In the box ABCDEFGH shown, AB = ${a}, BC = ${b} and CG = ${c}. What is the volume of the tetrahedron ACFH, whose corners are four corners of the box with no two on the same edge?`,
        figure: svg(380, 280, 'Box ABCDEFGH with the tetrahedron ACFH', [...edges, seg(A, C, 'seg dash'), seg(A, F, 'seg'), seg(A, H, 'seg'), seg(C, F, 'seg'), seg(C, H, 'seg'), seg(F, H, 'seg'),
          ...boxLetters(at, ctr), ...boxSides(at, a, b, c)]),
        answer: choices(d, ans, [lowest(abc, 6), lowest(abc, 2), lowest(2 * abc, 3), lowest(abc, 4), [abc, 1]], showFrac),
        solution: `Taking the tetrahedron out of the box leaves four corner pieces, at B, D, E and G. Each is a pyramid like BACF: a right-triangle base with half the area of a face, and the third edge as its height, so each has volume ${a}·${b}·${c}/6. So ACFH has volume ${a}·${b}·${c} − 4·${over(`${a}·${b}·${c}`, 6)} = ${over(`${a}·${b}·${c}`, 3)} = <b>${frac(...ans)}</b>.`,
        check: () => near(tetra([0, 0, 0], [a, b, 0], [a, 0, c], [0, b, c]), ans[0] / ans[1], 'volume'),
      };
    },
  ],

  'Circles inside a circle': [
    // how far apart the points of contact are
    (d, ctx) => {
      const [[r, R]] = combo(ctx, [[[2, 5], [2, 7], [3, 7], [3, 8], [3, 10], [4, 9], [4, 11], [5, 12], [5, 14], [6, 13], [4, 13], [6, 17]]]);
      const ans = [2 * r * R, R - r], yc = -Math.sqrt((R - r) ** 2 - r * r), k = R / (R - r);
      const w = 320, h = 320, T = frame([-R, R], [-R, R], w, h, 26), O = T([0, 0]), A = T([-r * k, yc * k]), B = T([r * k, yc * k]);
      return {
        topic: 'Circles inside a circle', rank: 15,
        text: `Two circles of radius ${r} touch each other, and each of them touches the inside of a circle of radius ${R}: one at A, the other at B. How far apart are A and B?`,
        figure: svg(w, h, 'Two equal circles inside a larger circle, touching it at A and B', [
          ring(O, R * T.s), ring(T([-r, yc]), r * T.s), ring(T([r, yc]), r * T.s), seg(A, B, 'seg dash'), label(away(A, O, 14), 'A'), label(away(B, O, 14), 'B')]),
        answer: choices(d, ans, [[2 * r, 1], [2 * r * R, R + r], [2 * r * (R - r), R], [r * R, R - r], [2 * r * R, R - 2 * r]], showFrac),
        solution: `Let O be the centre of the big circle and P, Q the centres of the small ones. P is on OA with OP = ${R} − ${r} = ${R - r}, Q is on OB with OQ = ${R - r}, and PQ = ${2 * r}. So triangle OAB is triangle OPQ enlarged by ${R}/${R - r}, and AB = ${2 * r}·${R}/${R - r} = <b>${frac(...ans)}</b>.`,
        check: () => {
          const Pc = [-r, yc], Qc = [r, yc], ok = Math.abs(dist(Pc, [0, 0]) - (R - r)) < 1e-9 && Math.abs(dist(Pc, Qc) - 2 * r) < 1e-9;
          const Ap = Pc.map((v) => (v * R) / dist(Pc, [0, 0])), Bp = Qc.map((v) => (v * R) / dist(Qc, [0, 0]));
          return ok ? near(dist(Ap, Bp), ans[0] / ans[1], 'AB') : 'circles placed wrong';
        },
      };
    },
    // the contact points given: the small radius
    (d, ctx) => {
      const [[r, R]] = combo(ctx, [[[2, 5], [2, 7], [3, 7], [3, 8], [3, 10], [4, 9], [4, 11], [5, 12], [5, 14], [6, 13], [4, 13], [6, 17]]]);
      const AB = lowest(2 * r * R, R - r), yc = -Math.sqrt((R - r) ** 2 - r * r), k = R / (R - r);
      const w = 320, h = 320, T = frame([-R, R], [-R, R], w, h, 26), O = T([0, 0]), A = T([-r * k, yc * k]), B = T([r * k, yc * k]);
      return {
        topic: 'Circles inside a circle', rank: 16,
        text: `Two equal circles touch each other, and each touches the inside of a circle of radius ${R}: one at A, the other at B. If AB = ${frac(...AB)}, what is the radius of the two equal circles?`,
        figure: svg(w, h, 'Two equal circles inside a larger circle, touching it at A and B', [
          ring(O, R * T.s), ring(T([-r, yc]), r * T.s), ring(T([r, yc]), r * T.s), seg(A, B, 'seg dash'), label(away(A, O, 14), 'A'), label(away(B, O, 14), 'B')]),
        answer: choices(d, r, [R - r, lowest(AB[0], 2 * AB[1]), R - 2 * r, 2 * r, lowest(R, 2)], showFrac),
        solution: `With O the big centre and P, Q the small centres, P and Q lie on OA and OB with OP = OQ = ${R} − r and PQ = 2r, so triangle OAB is OPQ enlarged by ${R}/(${R} − r), and AB = 2r·${R}/(${R} − r). Setting that equal to ${frac(...AB)}: ${2 * R * AB[1]}r = ${AB[0]}(${R} − r), so r = ${AB[0] * R}/${2 * R * AB[1] + AB[0]} = <b>${r}</b>.`,
        check: () => {
          const Pc = [-r, yc], Qc = [r, yc], Ap = Pc.map((v) => (v * R) / dist(Pc, [0, 0])), Bp = Qc.map((v) => (v * R) / dist(Qc, [0, 0]));
          return near(dist(Ap, Bp), AB[0] / AB[1], 'AB') || near((AB[0] * R) / (2 * R * AB[1] + AB[0]), r, 'r');
        },
      };
    },
    // how far the small circles' point of contact is from the big centre
    (d, ctx) => {
      const [[r, R]] = combo(ctx, [[[2, 5], [2, 7], [3, 7], [3, 8], [3, 10], [4, 9], [4, 11], [5, 12], [5, 14], [6, 13], [4, 13], [6, 17]]]);
      const correct = surd(1, R * R - 2 * R * r), yc = -Math.sqrt((R - r) ** 2 - r * r);
      const w = 320, h = 320, T = frame([-R, R], [-R, R], w, h, 26), O = T([0, 0]), Tp = T([0, yc]);
      return {
        topic: 'Circles inside a circle', rank: 14,
        text: `Two circles of radius ${r} touch each other at T, and each of them touches the inside of a circle of radius ${R} whose centre is O. How far is T from O?`,
        figure: svg(w, h, 'Two equal circles touching at T inside a larger circle with centre O', [
          ring(O, R * T.s), ring(T([-r, yc]), r * T.s), ring(T([r, yc]), r * T.s), seg(O, Tp, 'seg dash'), ring(O, 2.5, 'seg'), label([O[0] + 12, O[1] - 4], 'O'), label([Tp[0] + 11, Tp[1] - 12], 'T')]),
        answer: labelled(correct, [[R - 2 * r, num(R - 2 * r, 0)], surd(1, R * R - r * r), [R - r, num(R - r, 0)], surd(1, (R - r) ** 2 + r * r)]),
        solution: `A circle touching the big one from inside has its centre ${R} − ${r} = ${R - r} from O, so the small centres P and Q are each ${R - r} from O. T is the midpoint of PQ (the circles touch there), so PT = ${r} and OT is perpendicular to PQ. By Pythagoras, OT = √(${R - r}² − ${r}²) = <b>${correct[1]}</b>.`,
        check: () => { const Pc = [-r, yc], Qc = [r, yc]; return Math.abs(dist(Pc, [0, 0]) - (R - r)) > 1e-9 ? 'P placed wrong' : near(dist(mid(Pc, Qc), [0, 0]), correct[0], 'OT'); },
      };
    },
    // three equal circles inside a circle
    (d, ctx) => {
      const [k] = combo(ctx, [[1, 2, 3, 4, 5]]);
      const r = 3 * k, correct = plusRoot(3 * k, 2 * k, 3), R = correct[0], cd = (2 * r) / Math.sqrt(3);
      const centres = [0, 1, 2].map((i) => [cd * Math.cos(Math.PI / 2 + (i * 2 * Math.PI) / 3), cd * Math.sin(Math.PI / 2 + (i * 2 * Math.PI) / 3)]);
      const w = 300, h = 300, T = frame([-R, R], [-R, R], w, h, 18);
      return {
        topic: 'Circles inside a circle', rank: 18,
        text: `Three circles of radius ${r} each touch the other two, and all three touch the inside of a larger circle. What is the radius of the larger circle?`,
        figure: svg(w, h, 'Three equal circles inside a larger circle', [ring(T([0, 0]), R * T.s), ...centres.map((p) => ring(T(p), r * T.s))]),
        answer: labelled(correct, [[9 * k, num(9 * k, 0)], plusRoot(3 * k, 3 * k, 3), plusRoot(3 * k, k, 3), [6 * k, num(6 * k, 0)], plusRoot(6 * k, 2 * k, 3)]),
        solution: `The three small centres form an equilateral triangle of side ${2 * r}, so they are ${2 * r}/√3 = ${surd(2 * k, 3)[1]} from its centre, which is also the centre of the large circle. Each small circle reaches ${r} further out, so the large radius is <b>${correct[1]}</b>.`,
        check: () => {
          if (centres.some((p, i) => Math.abs(dist(p, centres[(i + 1) % 3]) - 2 * r) > 1e-9)) return 'small circles not touching';
          return near(Math.max(...centres.map((p) => Math.hypot(...p) + r)), R, 'R');
        },
      };
    },
  ],

  'Segments to the hypotenuse': [
    // how many whole-number segments
    (d, ctx) => {
      const [[a, b]] = combo(ctx, [[[6, 8], [9, 12], [15, 20], [12, 16], [8, 15], [5, 12], [7, 24], [10, 24], [16, 30], [18, 24], [10, 10], [6, 9], [12, 18], [9, 9]]]);
      const c2 = a * a + b * b, ab2 = a * a * b * b, low = shortest(ab2 / c2);
      const hWhole = low * low * c2 === ab2, sideP = a - low + 1, sideR = b - low + 1, count = sideP + sideR - (hWhole ? 1 : 0);
      const c = Math.sqrt(c2), hText = fracSurd(a * b, c2, c2)[1], hNum = (a * b) / c;
      const w = 380, h = 270, T = fit([[0, 0], [b, 0], [0, a]], w, h, 32), [pQ, pR, pP] = [[0, 0], [b, 0], [0, a]].map(T);
      const foot = T([(a * a * b) / c2, (a * b * b) / c2]), other = T([b * 0.72, a * 0.28]), ctr = centre([pP, pQ, pR]);
      return {
        topic: 'Segments to the hypotenuse', rank: 16,
        text: `Right triangle PQR has its right angle at Q, with PQ = ${a} and QR = ${b}. Segments are drawn from Q to points of the hypotenuse PR. Counting PQ and QR themselves, how many of these segments have a whole-number length?`,
        figure: svg(w, h, 'Right triangle PQR with segments from Q to the hypotenuse', [poly([pP, pQ, pR]), corner(pQ, pP, pR), seg(pQ, foot, 'seg dash'), seg(pQ, other, 'seg'),
          label(away(pP, ctr, 14), 'P'), label(away(pQ, ctr, 14), 'Q'), label(away(pR, ctr, 14), 'R'), label([pQ[0] - 14, mid(pQ, pP)[1]], a, 'ang'), label([mid(pQ, pR)[0], pQ[1] + 20], b, 'ang')]),
        answer: choices(d, count, [sideR, count + (hWhole ? 1 : -1), count - 2 + (hWhole ? 1 : 0), b - a + 1, count + 2]),
        solution: `The shortest segment from Q to PR is the altitude, of length ${a}·${b}/PR = ${hText}${hWhole ? '' : ` ≈ ${num(hNum, 2)}`}. As its far end slides from the foot of the altitude to P, the length grows steadily from that to ${a}; sliding to R, it grows to ${b}. So the P side has ${low === a ? `just one whole-number segment (length ${a})` : `one segment of each whole-number length from ${low} to ${a} (${sideP} of them)`}, and the R side one of each from ${low} to ${b} (${sideR} of them): ${sideP} + ${sideR}${hWhole ? ` − 1 (the altitude itself, ${low} long, was counted on both sides)` : ''} = <b>${count}</b>.`,
        check: () => {
          // points of PR at distance L from Q: |P + t(R − P)|² = L² is a quadratic in t; count its roots in [0, 1]
          let n = 0;
          for (let L = 1; L <= Math.max(a, b); L++) {
            const disc = c2 * L * L - ab2;
            if (disc < 0) continue;
            const roots = disc === 0 ? [(a * a) / c2] : [(a * a - Math.sqrt(disc)) / c2, (a * a + Math.sqrt(disc)) / c2];
            n += roots.filter((t) => t > -1e-12 && t < 1 + 1e-12).length;
          }
          return n === count ? '' : `counted ${n}, said ${count}`;
        },
      };
    },
    // how many different whole-number lengths
    (d, ctx) => {
      const [[a, b]] = combo(ctx, [[[6, 8], [9, 12], [15, 20], [12, 16], [8, 15], [5, 12], [7, 24], [10, 24], [16, 30], [18, 24], [6, 9], [12, 18]]]);
      const c2 = a * a + b * b, ab2 = a * a * b * b, low = shortest(ab2 / c2), hWhole = low * low * c2 === ab2, top = Math.max(a, b), ans = top - low + 1;
      const count = (a - low + 1) + (b - low + 1) - (hWhole ? 1 : 0), c = Math.sqrt(c2), hText = fracSurd(a * b, c2, c2)[1];
      const w = 380, h = 270, T = fit([[0, 0], [b, 0], [0, a]], w, h, 32), [pQ, pR, pP] = [[0, 0], [b, 0], [0, a]].map(T), foot = T([(a * a * b) / c2, (a * b * b) / c2]), ctr = centre([pP, pQ, pR]);
      return {
        topic: 'Segments to the hypotenuse', rank: 14,
        text: `Right triangle PQR has its right angle at Q, with PQ = ${a} and QR = ${b}. A segment is drawn from Q to a point of the hypotenuse PR. How many different whole-number lengths can the segment have?`,
        figure: svg(w, h, 'Right triangle PQR with the altitude from Q', [poly([pP, pQ, pR]), corner(pQ, pP, pR), seg(pQ, foot, 'seg dash'),
          label(away(pP, ctr, 14), 'P'), label(away(pQ, ctr, 14), 'Q'), label(away(pR, ctr, 14), 'R'), label([pQ[0] - 14, mid(pQ, pP)[1]], a, 'ang'), label([mid(pQ, pR)[0], pQ[1] + 20], b, 'ang')]),
        answer: choices(d, ans, [count, ans - 1, ans + 1, Math.abs(b - a) + 1, Math.min(a, b) - low + 1]),
        solution: `The shortest such segment is the altitude, ${hText}${hWhole ? '' : ` ≈ ${num((a * b) / c, 2)}`}. From its foot, the far end can slide to P (length ${a}) or to R (length ${b}), so every length from the altitude up to ${top} happens. The whole numbers in that range run from ${low} to ${top}: <b>${ans}</b> of them.`,
        check: () => {
          let n = 0;
          for (let L = 1; L <= top; L++) {
            const disc = c2 * L * L - ab2;
            if (disc < 0) continue;
            const roots = [(a * a - Math.sqrt(disc)) / c2, (a * a + Math.sqrt(disc)) / c2];
            if (roots.some((t) => t > -1e-12 && t < 1 + 1e-12)) n++;
          }
          return n === ans ? '' : `counted ${n}, said ${ans}`;
        },
      };
    },
    // the same count in an isosceles triangle
    (d, ctx) => {
      const [[s, t]] = combo(ctx, [[[10, 6], [13, 5], [9, 4], [12, 7], [10, 8], [15, 9], [11, 6], [17, 8], [13, 12], [8, 3], [7, 5], [25, 7]]]);
      const h2 = s * s - t * t, low = shortest(h2), hWhole = low * low === h2, side = s - low + 1, count = 2 * side - (hWhole ? 1 : 0), hS = root(h2);
      const w = 380, h = 250, T = fit([[-t, 0], [t, 0], [0, Math.sqrt(h2)]], w, h, 30), [pB, pC, pA] = [[-t, 0], [t, 0], [0, Math.sqrt(h2)]].map(T), foot = T([0, 0]), ctr = centre([pA, pB, pC]);
      return {
        topic: 'Segments to the hypotenuse', rank: 15,
        text: `Triangle ABC has AB = AC = ${s} and BC = ${2 * t}. Segments are drawn from A to points of side BC. Counting AB and AC themselves, how many of these segments have a whole-number length?`,
        figure: svg(w, h, 'Isosceles triangle ABC with segments from A to BC', [poly([pA, pB, pC]), seg(pA, foot, 'seg dash'), corner(foot, pC, pA), seg(pA, T([t * 0.55, 0]), 'seg'),
          label(away(pA, ctr, 14), 'A'), label(away(pB, ctr, 14), 'B'), label(away(pC, ctr, 14), 'C'), label(away(mid(pA, pB), ctr, 14), s, 'ang'), label(away(mid(pA, pC), ctr, 14), s, 'ang')]),
        answer: choices(d, count, [side, count + (hWhole ? 1 : -1), 2 * s - 2 * t, s, count + 2]),
        solution: `The shortest segment from A is the height to BC, √(${s}² − ${t}²) = ${hS}${hWhole ? '' : ` ≈ ${num(Math.sqrt(h2), 2)}`}. On each side of its foot the lengths grow steadily from that up to ${s}, so each side has ${side === 1 ? `just one whole-number length, ${s}` : `the ${side} whole numbers from ${low} to ${s}`}: ${side} + ${side}${hWhole ? ` − 1 (the height itself, ${low} long, was counted on both sides)` : ''} = <b>${count}</b>.`,
        check: () => {
          // points B + u(C − B) at distance L from A: (2tu − t)² + h² = L²
          let n = 0;
          for (let L = 1; L <= s; L++) {
            const rest = L * L - h2;
            if (rest < 0) continue;
            const us = rest === 0 ? [0.5] : [(t - Math.sqrt(rest)) / (2 * t), (t + Math.sqrt(rest)) / (2 * t)];
            n += us.filter((u) => u > -1e-12 && u < 1 + 1e-12).length;
          }
          return n === count ? '' : `counted ${n}, said ${count}`;
        },
      };
    },
  ],

  'Altitudes of a triangle': [
    // the three altitudes of the triangle a line cuts off with the axes
    (d, ctx) => {
      const [[u, v, hyp], flip] = combo(ctx, [[[3, 4, 5], [6, 8, 10], [8, 15, 17], [7, 24, 25], [9, 12, 15], [20, 21, 29], [12, 16, 20], [15, 20, 25]], [false, true]]);
      const [s, t] = flip ? [v, u] : [u, v], g = gcd(s, t), eq = `${t / g === 1 ? '' : t / g}x + ${s / g === 1 ? '' : s / g}y = ${(s * t) / g}`;
      const ans = [(s + t) * hyp + s * t, hyp];
      const w = 360, h = 270, T = fit([[-0.12 * s, -0.12 * t], [1.15 * s, 1.15 * t]], w, h, 22), [O, X, Y] = [[0, 0], [s, 0], [0, t]].map(T);
      const foot = T([(s * t * t) / (s * s + t * t), (s * s * t) / (s * s + t * t)]);
      return {
        topic: 'Altitudes of a triangle', rank: 13,
        text: `The x-axis, the y-axis and the line ${eq} are the three sides of a triangle. What is the total length of its three altitudes?`,
        figure: svg(w, h, `The triangle cut off by ${eq}`, [poly([O, X, Y]), seg(T([-0.12 * s, 0]), T([1.15 * s, 0]), 'arc'), seg(T([0, -0.12 * t]), T([0, 1.15 * t]), 'arc'),
          seg(O, foot, 'seg dash'), corner(O, X, Y), label([X[0], X[1] + 20], s, 'ang'), label([Y[0] - 14, Y[1]], t, 'ang'), label([O[0] - 12, O[1] + 16], 'O')]),
        answer: choices(d, ans, [[s + t + hyp, 1], [s + t, 1], [(s + t) * hyp + 2 * s * t, hyp], [s * t + hyp * hyp, hyp], [s * t, hyp]], showFrac),
        solution: `The line meets the axes at (${s}, 0) and (0, ${t}), so the triangle has legs ${s} and ${t} and hypotenuse √(${s}² + ${t}²) = ${hyp}. Two of the altitudes are the legs; the third, to the hypotenuse, is ${s}·${t}/${hyp} = ${frac(s * t, hyp)}. Total: ${s} + ${t} + ${frac(s * t, hyp)} = <b>${frac(...ans)}</b>.`,
        check: () => {
          const A = [[0, 0], [s, 0], [0, t]], area = shoelace(A), sides = [dist(A[0], A[1]), dist(A[1], A[2]), dist(A[2], A[0])];
          return near(sides.reduce((sum, side) => sum + (2 * area) / side, 0), ans[0] / ans[1], 'altitudes');
        },
      };
    },
    // the shortest or the longest altitude of a triangle with whole-number sides
    (d, ctx) => {
      const [[x, y, z, A], which] = combo(ctx, [HERON, ['shortest', 'longest']]);
      const side = which === 'shortest' ? z : x, ans = lowest(2 * A, side), s = (x + y + z) / 2;
      return {
        topic: 'Altitudes of a triangle', rank: 11,
        text: `A triangle has sides ${x}, ${y} and ${z}. How long is its ${which} altitude?`,
        figure: triangleFigure(x, y, z, which === 'shortest'),
        answer: choices(d, ans, [lowest(2 * A, which === 'shortest' ? x : z), lowest(A, side), lowest(2 * A, y), lowest(4 * A, side), lowest(A, y)], showFrac),
        solution: `Heron's formula: s = ${s}, so the area is √(${s}·${s - x}·${s - y}·${s - z}) = ${A}. An altitude is 2·area divided by its side, so the ${which} altitude goes to the ${which === 'shortest' ? 'longest' : 'shortest'} side, ${side}: 2·${A}/${side} = <b>${frac(...ans)}</b>.`,
        check: () => { const hs = altitudes(x, y, z); return near(which === 'shortest' ? Math.min(...hs) : Math.max(...hs), ans[0] / ans[1], 'altitude'); },
      };
    },
    // the reciprocals of the three altitudes, added up
    (d, ctx) => {
      const [[x, y, z, A]] = combo(ctx, [HERON]);
      const P = x + y + z, ans = lowest(P, 2 * A), s = P / 2;
      const recip = (i) => `<span class="fr"><span>1</span><span>h<sub>${i}</sub></span></span>`;
      return {
        topic: 'Altitudes of a triangle', rank: 16,
        text: `A triangle has sides ${x}, ${y} and ${z}, and its altitudes are h<sub>1</sub>, h<sub>2</sub> and h<sub>3</sub>. What is ${recip(1)} + ${recip(2)} + ${recip(3)}?`,
        figure: triangleFigure(x, y, z, false),
        answer: choices(d, ans, [lowest(2 * A, P), lowest(P, A), lowest(P, 4 * A), lowest(3, s), lowest(P + 1, 2 * A)], showFrac),
        solution: `Each altitude is 2·area divided by its side, so 1/h is the side divided by 2·area, and the three add up to the perimeter divided by 2·area. Heron's formula (s = ${s}) gives the area √(${s}·${s - x}·${s - y}·${s - z}) = ${A}, so the sum is ${P}/(2·${A}) = <b>${frac(...ans)}</b>.`,
        check: () => near(altitudes(x, y, z).reduce((sum, h) => sum + 1 / h, 0), ans[0] / ans[1], 'sum'),
      };
    },
  ],

  'Squares in a right triangle': [
    // the ratio of the two squares
    (d, ctx) => {
      const [[a, b, c]] = combo(ctx, [[[5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 5, 13], [15, 8, 17], [3, 4, 5], [9, 40, 41]]]);
      const x = (a * b) / (a + b), hgt = (a * b) / c, y = (c * hgt) / (c + hgt), ans = lowest(c * c + a * b, c * (a + b));
      const gap = 0.12 * (b + c), foot = (a * a) / c, x0 = b + gap, yl = x0 + (foot * y) / hgt;
      const T = fit([[0, 0], [x0 + c, 0], [0, Math.max(a, hgt)]], 520, 220, 26);
      const xy = '<span class="fr"><span>x</span><span>y</span></span>';
      return {
        topic: 'Squares in a right triangle', rank: 21,
        text: `Two copies of a right triangle with sides ${a}, ${b} and ${c} each hold a square. In the first, a square of side x shares the triangle's right angle, and its far corner touches the hypotenuse. In the second, a square of side y has one side lying along the hypotenuse and its other two corners on the legs. What is ${xy}?`,
        figure: svg(520, 220, 'A square at the right angle of one triangle, and a square on the hypotenuse of another', ['<g/>',
          poly([[0, 0], [b, 0], [0, a]].map(T)), poly([[0, 0], [x, 0], [x, x], [0, x]].map(T), 'arc'),
          poly([[x0, 0], [x0 + c, 0], [x0 + foot, hgt]].map(T), 'side'), poly([[yl, 0], [yl + y, 0], [yl + y, y], [yl, y]].map(T), 'arc'),
          label(T([x / 2, x / 2]), 'x', 'ang'), label(T([yl + y / 2, y / 2]), 'y', 'ang')]),
        answer: choices(d, ans, [lowest(c * (a + b), c * c + a * b), [1, 1], lowest(a + b, c), lowest(c, a + b), lowest(c * c, c * c + a * b)], showFrac),
        solution: `First square: with the legs along the axes, its far corner (x, x) is on the hypotenuse, so x/${b} + x/${a} = 1 and x = ${over(`${a}·${b}`, `${a} + ${b}`)} = ${frac(a * b, a + b)}. Second square: the altitude to the hypotenuse is h = ${a}·${b}/${c} = ${frac(a * b, c)}; at height y above the hypotenuse the triangle is ${c}(1 − y/h) wide, and that must be y, so y = ${c}h/(${c} + h) = ${frac(a * b * c, c * c + a * b)}. So ${xy} = ${frac(a * b, a + b)} ÷ ${frac(a * b * c, c * c + a * b)} = <b>${frac(...ans)}</b>.`,
        check: () => {
          // grow each square until it no longer fits (bisection), measuring the triangle's width with line intersections
          const fits1 = (s) => s / b + s / a <= 1;
          const Lft = [[0, 0], [foot, hgt]], Rgt = [[c, 0], [foot, hgt]], width = (s) => meet([[0, s], [1, s]], Rgt)[0] - meet([[0, s], [1, s]], Lft)[0];
          const grow = (ok) => { let lo = 0, hi = Math.max(a, b); for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (ok(m)) lo = m; else hi = m; } return lo; };
          return near(grow(fits1) / grow((s) => width(s) >= s), ans[0] / ans[1], 'x/y', 1e-9);
        },
      };
    },
    // the square in the right angle
    (d, ctx) => {
      const [[a, b, c]] = combo(ctx, [[[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [6, 8, 10], [9, 12, 15], [12, 16, 20], [9, 40, 41], [12, 35, 37]]]);
      const ans = lowest(a * b, a + b);
      return {
        topic: 'Squares in a right triangle', rank: 12,
        text: `A right triangle has sides ${a}, ${b} and ${c}. A square sits in the corner at the right angle, with two of its sides along the legs and its far corner on the hypotenuse. How long is a side of the square?`,
        figure: cornerSquare(a, b),
        answer: choices(d, ans, [lowest(a * b, c), lowest(a + b, 4), lowest(a * b, 2 * (a + b)), lowest(a * b * c, c * c + a * b), lowest(c, 2)], showFrac),
        solution: `Put the right angle at the origin, the leg ${b} along the x-axis and the leg ${a} along the y-axis; the hypotenuse is then the line x/${b} + y/${a} = 1. The square's far corner (s, s) is on it, so s/${b} + s/${a} = 1, which gives s = ${over(`${a}·${b}`, `${a} + ${b}`)} = <b>${frac(...ans)}</b>.`,
        check: () => { let lo = 0, hi = Math.max(a, b); for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (m / b + m / a <= 1) lo = m; else hi = m; } return near(lo, ans[0] / ans[1], 'side', 1e-9); },
      };
    },
    // the square standing on the hypotenuse
    (d, ctx) => {
      const [[a, b, c]] = combo(ctx, [[[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [6, 8, 10], [9, 12, 15], [12, 16, 20], [9, 40, 41], [12, 35, 37]]]);
      const ans = lowest(a * b * c, c * c + a * b), hgt = (a * b) / c, foot = (a * a) / c;
      return {
        topic: 'Squares in a right triangle', rank: 17,
        text: `A right triangle has sides ${a}, ${b} and ${c}. A square has one side lying along the hypotenuse and its other two corners on the legs. How long is a side of the square?`,
        figure: hypotenuseSquare(a, b, c),
        answer: choices(d, ans, [lowest(a * b, a + b), lowest(a * b, c), lowest(a * b * c, c * c + 2 * a * b), lowest(c, 2), lowest(a * b, 2 * c)], showFrac),
        solution: `The altitude to the hypotenuse is h = ${a}·${b}/${c} = ${frac(a * b, c)}. At height s above the hypotenuse the triangle is ${c}(1 − s/h) wide (similar triangles), and the square needs that width to be s: s = ${c}h/(${c} + h) = <b>${frac(...ans)}</b>.`,
        check: () => {
          const Lft = [[0, 0], [foot, hgt]], Rgt = [[c, 0], [foot, hgt]], width = (s) => meet([[0, s], [1, s]], Rgt)[0] - meet([[0, s], [1, s]], Lft)[0];
          let lo = 0, hi = hgt; for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (width(m) >= m) lo = m; else hi = m; }
          return near(lo, ans[0] / ans[1], 'side', 1e-9);
        },
      };
    },
    // how much of the triangle the corner square covers
    (d, ctx) => {
      const [[a, b]] = combo(ctx, [[[3, 4], [5, 12], [8, 15], [7, 24], [20, 21], [2, 3], [1, 2], [3, 5], [4, 7], [2, 5]]]);
      const ans = lowest(2 * a * b, (a + b) ** 2);
      return {
        topic: 'Squares in a right triangle', rank: 14,
        text: `A right triangle has legs ${a} and ${b}. A square sits in the corner at the right angle, with two of its sides along the legs and its far corner on the hypotenuse. What fraction of the triangle's area does the square cover?`,
        figure: cornerSquare(a, b),
        answer: choices(d, ans, [lowest(a * b, (a + b) ** 2), lowest(a * b, a * a + b * b), lowest(2 * a * b, a * a + b * b), [1, 2], lowest(4 * a * b, (a + b) ** 2)], showFrac),
        solution: `The square's far corner is on the hypotenuse, so its side is ${a}·${b}/(${a} + ${b}) = ${frac(a * b, a + b)}. Its area divided by the triangle's area ½·${a}·${b} is (${frac(a * b, a + b)})² ÷ ${num((a * b) / 2)} = ${over(`2·${a}·${b}`, `(${a} + ${b})²`)} = <b>${frac(...ans)}</b>.`,
        check: () => { let lo = 0, hi = Math.max(a, b); for (let i = 0; i < 80; i++) { const m = (lo + hi) / 2; if (m / b + m / a <= 1) lo = m; else hi = m; } return near((lo * lo) / ((a * b) / 2), ans[0] / ans[1], 'fraction', 1e-9); },
      };
    },
  ],

  'Lines making an equilateral triangle': [
    // a line through the origin finishes the triangle: its perimeter
    (d, ctx) => {
      const [a, b] = combo(ctx, [[1, 2, 3], [1, 2, 3, 4, 5, 6]], (a, b) => a !== 1 || b !== 1);
      const r3 = Math.sqrt(3), per = 3 * b + 2 * a * r3, correct = [per, `${3 * b} + ${sA(2 * a)}`];
      const V1 = [a, b + a / r3], V2 = [a, -a / r3], V3 = [(-b * r3) / 2, b / 2];
      const w = 360, h = 300, T = fit([[V3[0] - 0.8, V2[1] - 0.8], [a + 0.9, V1[1] + 0.8]], w, h, 18), lo = V3[0] - 0.8, hi = a + 0.9;
      return {
        topic: 'Lines making an equilateral triangle', rank: 17,
        text: `Three lines enclose an equilateral triangle: the vertical line x = ${a}, the line y = ${b} + ${k3}x, and a third line that passes through the origin. What is the perimeter of the triangle?`,
        figure: svg(w, h, 'Three lines enclosing an equilateral triangle', [poly([V1, V2, V3].map(T)),
          seg(T([lo, 0]), T([hi, 0]), 'arc'), seg(T([0, V2[1] - 0.8]), T([0, V1[1] + 0.8]), 'arc'),
          seg(T([a, V2[1] - 0.8]), T([a, V1[1] + 0.8])), seg(T([lo, b + lo / r3]), T([hi, b + hi / r3])), seg(T([lo, -lo / r3]), T([hi, -hi / r3])),
          label(T([0, 0]).map((v, i) => v + [-10, 14][i]), 'O'), label(T([a, V1[1] + 0.8]).map((v, i) => v + [-7, 6][i]), `x = ${a}`, 'ang', 'end')]),
        answer: labelled(correct, [[per / 3, `${b} + ${fracSurd(2 * a, 3, 3)[1]}`], [3 * b + a * r3, `${3 * b} + ${sA(a)}`], [3 * (a + b), num(3 * (a + b), 0)], [3 * b + 3 * a * r3, `${3 * b} + ${sA(3 * a)}`], [2 * b + 2 * a * r3, `${2 * b} + ${sA(2 * a)}`]]),
        solution: `The line y = ${b} + ${k3}x rises at 30°, and x = ${a} stands at 90°, so they meet at 60°. The third side must make 60° with both, so it falls at 30°: y = −${k3}x. It meets x = ${a} at (${a}, −${fracSurd(a, 3, 3)[1]}), and the sloping line meets x = ${a} at (${a}, ${b} + ${fracSurd(a, 3, 3)[1]}), so each side is ${b} + ${fracSurd(2 * a, 3, 3)[1]}, and the perimeter is three times that: <b>${correct[1]}</b>.`,
        check: () => {
          const vert = [[a, 0], [a, 1]], up = [[0, b], [1, b + 1 / r3]], third = [[0, 0], [1, -1 / r3]];
          const P = [meet(vert, up), meet(vert, third), meet(up, third)], s = [dist(P[0], P[1]), dist(P[1], P[2]), dist(P[2], P[0])];
          if (Math.max(...s) - Math.min(...s) > 1e-9) return 'not equilateral';
          return near(s[0] + s[1] + s[2], per, 'perimeter');
        },
      };
    },
    // two steep lines through the origin and a horizontal line
    (d, ctx) => {
      const [hh] = combo(ctx, [[2, 3, 4, 5, 6, 9]]);
      const r3 = Math.sqrt(3), correct = surd(2 * hh, 3), xe = hh / r3;
      const w = 320, h = 260, T = frame([-xe - 1, xe + 1], [-0.8, hh + 0.8], w, h, 22);
      return {
        topic: 'Lines making an equilateral triangle', rank: 13,
        text: `The lines y = √3·x, y = −√3·x and y = ${hh} enclose a triangle. What is its perimeter?`,
        figure: svg(w, h, 'Two lines through the origin and a horizontal line enclosing a triangle', [poly([[0, 0], [xe, hh], [-xe, hh]].map(T)),
          seg(T([-xe - 1, 0]), T([xe + 1, 0]), 'arc'), seg(T([0, -0.8]), T([0, hh + 0.8]), 'arc'), seg(T([-xe - 1, hh]), T([xe + 1, hh])),
          label(T([0, 0]).map((v, i) => v + [12, 14][i]), 'O'), label(T([xe + 1, hh]).map((v, i) => v + [0, -10][i]), `y = ${hh}`, 'ang', 'end')]),
        answer: labelled(correct, [surd(hh, 3), [6 * hh, num(6 * hh, 0)], fracSurd(2 * hh, 3, 3), surd(3 * hh, 3), [3 * hh, num(3 * hh, 0)]]),
        solution: `y = √3·x rises at 60° and y = −√3·x falls at 60°, so with the level line y = ${hh} they make a triangle whose angles are all 60°: it is equilateral. Its top side runs from x = −${hh}/√3 to x = ${hh}/√3, so each side is 2·${hh}/√3 = ${fracSurd(2 * hh, 3, 3)[1]}, and the perimeter is three times that: <b>${correct[1]}</b>.`,
        check: () => {
          const l1 = [[0, 0], [1, r3]], l2 = [[0, 0], [1, -r3]], l3 = [[0, hh], [1, hh]];
          const P = [meet(l1, l2), meet(l1, l3), meet(l2, l3)], s = [dist(P[0], P[1]), dist(P[1], P[2]), dist(P[2], P[0])];
          return Math.max(...s) - Math.min(...s) > 1e-9 ? 'not equilateral' : near(s[0] + s[1] + s[2], correct[0], 'perimeter');
        },
      };
    },
    // two steep lines through a point on the y-axis, and the x-axis: the area
    (d, ctx) => {
      const [p] = combo(ctx, [[2, 3, 4, 5, 6]]);
      const r3 = Math.sqrt(3), correct = fracSurd(p * p, 3, 3), xe = p / r3;
      const w = 320, h = 250, T = frame([-xe - 1, xe + 1], [-0.8, p + 0.8], w, h, 22);
      return {
        topic: 'Lines making an equilateral triangle', rank: 14,
        text: `The lines y = √3·x + ${p} and y = −√3·x + ${p} and the x-axis enclose a triangle. What is its area?`,
        figure: svg(w, h, 'Two lines and the x-axis enclosing a triangle', [poly([[-xe, 0], [xe, 0], [0, p]].map(T)),
          seg(T([-xe - 1, 0]), T([xe + 1, 0]), 'arc'), seg(T([0, -0.8]), T([0, p + 0.8]), 'arc'), label(T([0, 0]).map((v, i) => v + [10, 14][i]), 'O')]),
        answer: labelled(correct, [fracSurd(p * p, 4, 3), fracSurd(p * p, 2, 3), surd(p * p, 3), fracSurd(2 * p * p, 3, 3), [p * p, num(p * p, 0)]]),
        solution: `Both lines pass through (0, ${p}), one rising at 60° and one falling at 60°, so with the x-axis they make an equilateral triangle. They cross the x-axis where √3·x = ∓${p}, at x = ±${p}/√3, so the base is 2·${p}/√3 and the height is ${p}. The area is ½·(2·${p}/√3)·${p} = ${p * p}/√3 = <b>${correct[1]}</b>.`,
        check: () => near(shoelace([meet([[0, p], [1, p + r3]], [[0, 0], [1, 0]]), meet([[0, p], [1, p - r3]], [[0, 0], [1, 0]]), [0, p]]), correct[0], 'area'),
      };
    },
    // the perimeter given: where the sloping line crosses the y-axis
    (d, ctx) => {
      const [a, b] = combo(ctx, [[1, 2, 3], [1, 2, 3, 4, 5, 6]], (a, b) => a !== 1 || b !== 1);
      const r3 = Math.sqrt(3), per = `${3 * b} + ${sA(2 * a)}`;
      return {
        topic: 'Lines making an equilateral triangle', rank: 15,
        text: `Three lines enclose an equilateral triangle: the vertical line x = ${a}, a line y = c + ${k3}x for some number c > 0, and a third line through the origin. The perimeter of the triangle is ${per}. What is c?`,
        answer: choices(d, b, [3 * b, b + a, 2 * b, b + 2 * a, Math.max(1, b - a)]),
        solution: `The line y = c + ${k3}x rises at 30° and x = ${a} is vertical, so the third side falls at 30°: y = −${k3}x. On the line x = ${a} the two sloping lines are at y = c + ${fracSurd(a, 3, 3)[1]} and y = −${fracSurd(a, 3, 3)[1]}, so each side is c + ${fracSurd(2 * a, 3, 3)[1]} and the perimeter is 3c + ${sA(2 * a)}. So 3c = ${3 * b}, and c = <b>${b}</b>.`,
        check: () => {
          const vert = [[a, 0], [a, 1]], up = [[0, b], [1, b + 1 / r3]], third = [[0, 0], [1, -1 / r3]];
          const P = [meet(vert, up), meet(vert, third), meet(up, third)], s = [dist(P[0], P[1]), dist(P[1], P[2]), dist(P[2], P[0])];
          return Math.max(...s) - Math.min(...s) > 1e-9 ? 'not equilateral' : near(s[0] + s[1] + s[2], 3 * b + 2 * a * r3, 'perimeter');
        },
      };
    },
  ],

  'Cutting a segment in a rectangle': [
    // SU crossed by KT and by KM: the piece between them
    (d, ctx) => {
      const solve = (W, H, e, g, f) => {
        const S = [W - e, H], U = [f, 0], X = cut(S, U, [0, H], [W, g]), Y = cut(S, U, [0, H], [W, 0]);
        if (!X || !Y) return null;
        const top = Math.abs(X.s[0] * Y.s[1] - Y.s[0] * X.s[1]), bot = X.s[1] * Y.s[1];
        return top ? { X: X.s, Y: Y.s, ratio: lowest(top, bot) } : null;
      };
      const [W, H, e, g, f] = combo(ctx, [[4, 5, 6, 7, 8], [3, 4, 5, 6], [1, 2, 3], [1, 2, 3], [1, 2, 3]],
        (W, H, e, g, f) => !(W === 5 && H === 4 && e === 1 && g === 1 && f === 2) && e < W && g < H && f < W && (solve(W, H, e, g, f)?.ratio[1] ?? 999) <= 150);
      const { X, Y, ratio: rr } = solve(W, H, e, g, f);
      const pX = meet([[W - e, H], [f, 0]], [[0, H], [W, g]]), pY = meet([[W - e, H], [f, 0]], [[0, H], [W, 0]]);
      return {
        topic: 'Cutting a segment in a rectangle', rank: 19,
        text: `Rectangle KLMN has KL = ${W} and LM = ${H}. Point S is on side KL with SL = ${e}, point T is on side LM with MT = ${g}, and point U is on side MN with NU = ${f}. Segment SU crosses segment KT at X and diagonal KM at Y. What is <span class="fr"><span>XY</span><span>SU</span></span>?`,
        figure: rectangleKLMN(W, H, e, f, [[[0, H], [W, g]], [[0, H], [W, 0]]], [[[W, g], 'T', 13, 0], [pX, 'X', 12, -4], [pY, 'Y', -12, 4]]),
        answer: choices(d, rr, [X, Y, [rr[1] - rr[0], rr[1]], [2 * rr[0], rr[1]], [rr[0], rr[1] + 1]].map((v) => lowest(...v)), showFrac),
        solution: `Put N at (0, 0): K = (0, ${H}), M = (${W}, 0), S = (${W - e}, ${H}), T = (${W}, ${g}) and U = (${f}, 0). Write the points of SU as S + s·(U − S), with s from 0 at S to 1 at U. Solving with the line KT gives s = ${fracOf(X)} at X, and with the line KM gives s = ${fracOf(Y)} at Y. So <span class="fr"><span>XY</span><span>SU</span></span> = |${fracOf(X)} − ${fracOf(Y)}| = <b>${fracOf(rr)}</b>.`,
        check: () => { const Sp = [W - e, H], Up = [f, 0]; return near(dist(pX, pY) / dist(Sp, Up), rr[0] / rr[1], 'XY/SU', 1e-9); },
      };
    },
    // where SU crosses the diagonal: the ratio along the diagonal
    (d, ctx) => {
      const [W, H, e, f] = combo(ctx, [[4, 5, 6, 7, 8, 9], [3, 4, 5, 6], [1, 2, 3, 4], [1, 2, 3, 4, 5]], (W, H, e, f) => e < W && f < W && e !== f && !!cut([W - e, H], [f, 0], [0, H], [W, 0]));
      const correct = ratio(W - e, W - f), pY = meet([[W - e, H], [f, 0]], [[0, H], [W, 0]]);
      return {
        topic: 'Cutting a segment in a rectangle', rank: 14,
        text: `Rectangle KLMN has KL = ${W} and LM = ${H}. Point S is on side KL with SL = ${e}, and point U is on side MN with NU = ${f}. Segment SU crosses the diagonal KM at Y. What is KY : YM?`,
        figure: rectangleKLMN(W, H, e, f, [[[0, H], [W, 0]]], [[pY, 'Y', 13, -4]]),
        answer: labelled(correct, [ratio(W - f, W - e), ratio(e, f), ratio(W - e, f), ratio(e, W - f), ratio(W - e, 2 * W - e - f), ratio(f, e), ratio(W - e, W), ratio(W - f, W)]),
        solution: `KS = ${W} − ${e} = ${W - e} and MU = ${W} − ${f} = ${W - f} lie on the parallel sides KL and MN, so triangles KYS and MYU are similar (their angles at Y are vertical angles, and the other angles are alternate angles). So KY : YM = KS : MU = ${`${W - e} : ${W - f}` === correct[1] ? `<b>${correct[1]}</b>` : `${W - e} : ${W - f} = <b>${correct[1]}</b>`}.`,
        check: () => near(dist([0, H], pY) / dist(pY, [W, 0]), correct[0], 'KY/YM', 1e-9),
      };
    },
    // both diagonals cross SU: the piece between them
    (d, ctx) => {
      const solve = (W, H, e, f) => {
        const S = [W - e, H], U = [f, 0], X = cut(S, U, [W, H], [0, 0]), Y = cut(S, U, [0, H], [W, 0]);
        if (!X || !Y) return null;
        const top = Math.abs(X.s[0] * Y.s[1] - Y.s[0] * X.s[1]), bot = X.s[1] * Y.s[1];
        return top ? { X: X.s, Y: Y.s, ratio: lowest(top, bot) } : null;
      };
      const [W, H, e, f] = combo(ctx, [[4, 5, 6, 7, 8], [3, 4, 5, 6], [1, 2, 3], [1, 2, 3, 4, 5, 6]], (W, H, e, f) => e < W && f < W && (solve(W, H, e, f)?.ratio[1] ?? 999) <= 150);
      const { X, Y, ratio: rr } = solve(W, H, e, f);
      const pX = meet([[W - e, H], [f, 0]], [[W, H], [0, 0]]), pY = meet([[W - e, H], [f, 0]], [[0, H], [W, 0]]);
      return {
        topic: 'Cutting a segment in a rectangle', rank: 21,
        text: `Rectangle KLMN has KL = ${W} and LM = ${H}. Point S is on side KL with SL = ${e}, and point U is on side MN with NU = ${f}. Segment SU crosses the diagonal LN at X and the diagonal KM at Y. What is <span class="fr"><span>XY</span><span>SU</span></span>?`,
        figure: rectangleKLMN(W, H, e, f, [[[0, H], [W, 0]], [[W, H], [0, 0]]], [[pX, 'X', 13, -4], [pY, 'Y', -13, 4]]),
        answer: choices(d, rr, [X, Y, [rr[1] - rr[0], rr[1]], [2 * rr[0], rr[1]], [rr[0], rr[1] + 1]].map((v) => lowest(...v)), showFrac),
        solution: `Put N at (0, 0): K = (0, ${H}), L = (${W}, ${H}), M = (${W}, 0), S = (${W - e}, ${H}) and U = (${f}, 0). Write the points of SU as S + s·(U − S), with s from 0 at S to 1 at U. Solving with the line LN gives s = ${fracOf(X)} at X, and with the line KM gives s = ${fracOf(Y)} at Y. So <span class="fr"><span>XY</span><span>SU</span></span> = |${fracOf(X)} − ${fracOf(Y)}| = <b>${fracOf(rr)}</b>.`,
        check: () => near(dist(pX, pY) / dist([W - e, H], [f, 0]), rr[0] / rr[1], 'XY/SU', 1e-9),
      };
    },
    // SU and the diagonal cut off a triangle at K: its area
    (d, ctx) => {
      const [W, H, e, f] = combo(ctx, [[4, 5, 6, 7, 8], [2, 3, 4, 5, 6], [1, 2, 3], [1, 2, 3, 4, 5]], (W, H, e, f) => e < W && f < W && !!cut([W - e, H], [f, 0], [0, H], [W, 0]));
      const ks = W - e, mu = W - f, depth = lowest(H * ks, ks + mu), ans = lowest(ks * ks * H, 2 * (ks + mu)), pY = meet([[W - e, H], [f, 0]], [[0, H], [W, 0]]);
      return {
        topic: 'Cutting a segment in a rectangle', rank: 18,
        text: `Rectangle KLMN has KL = ${W} and LM = ${H}. Point S is on side KL with SL = ${e}, and point U is on side MN with NU = ${f}. Segment SU crosses the diagonal KM at Y. What is the area of triangle KYS?`,
        figure: rectangleKLMN(W, H, e, f, [[[0, H], [W, 0]]], [[pY, 'Y', 13, -4]]),
        answer: choices(d, ans, [lowest(ks * H, 2), lowest(mu * mu * H, 2 * (ks + mu)), lowest(ks * H, 4), lowest(ks * ks * H, ks + mu), lowest(ks * mu * H, 2 * (ks + mu))], showFrac),
        solution: `KS = ${ks} and MU = ${mu} lie on the parallel sides KL and MN, so triangles KYS and MYU are similar with ratio ${ks} : ${mu}. Their heights across the rectangle are in the same ratio and add up to LM = ${H}, so Y is ${H}·${ks}/${ks + mu} = ${fracOf(depth)} below KL. Triangle KYS has base KS = ${ks} and that height, so its area is ½·${ks}·${fracOf(depth)} = <b>${fracOf(ans)}</b>.`,
        check: () => near(shoelace([[0, H], pY, [W - e, H]]), ans[0] / ans[1], 'area', 1e-9),
      };
    },
  ],

  'Cookies from a sheet of dough': [
    // seven cookies in a flower, one more from the scraps
    (d, ctx) => {
      const [r, given] = combo(ctx, [[2, 3, 4, 5], ['dough', 'cookie']]);
      const correct = surd(r, 2), { ring6, figure } = flower(r);
      return {
        topic: 'Cookies from a sheet of dough', rank: 15,
        text: (given === 'dough' ? `Seven equal round cookies are cut from a round sheet of dough of radius ${3 * r}` : `Seven round cookies, each of radius ${r}, are cut from a round sheet of dough`) +
          ': one in the middle and six in a ring around it. Each cookie touches the ones next to it, and the six outer ones touch the edge of the dough. The leftover dough is rolled out, just as thick, into one more round cookie. What is the radius of that cookie?',
        figure,
        answer: labelled(correct, [fracSurd(3 * r, 2), surd(r, 3), [2 * r, num(2 * r, 0)], surd(r, 7)]),
        solution: (given === 'dough' ? `The outer cookies' centres are two cookie radii from the middle, so the dough's radius is three cookie radii: each cookie has radius ${3 * r}/3 = ${r}. ` : `The outer cookies' centres are ${2 * r} from the middle, so the dough's radius is ${3 * r}. `) +
          `The dough's area is π·${3 * r}² = ${9 * r * r}π and the cookies take 7·π·${r}² = ${7 * r * r}π, leaving ${2 * r * r}π. A round cookie of that area has radius √${2 * r * r} = <b>${correct[1]}</b>.`,
        check: () => {
          if (ring6.some((p, i) => Math.abs(dist(p, ring6[(i + 1) % 6]) - 2 * r) > 1e-9)) return 'outer cookies not touching';
          return near(Math.sqrt(flowerLeft(r) / Math.PI), correct[0], 'scrap radius', 0.01);
        },
      };
    },
    // two cookies of different sizes
    (d, ctx) => {
      const [[r1, r2]] = combo(ctx, [[[1, 2], [2, 4], [1, 8], [3, 6], [2, 9], [4, 8], [1, 4], [2, 3], [3, 4], [2, 5], [1, 3], [3, 5]]]);
      const R = r1 + r2, correct = surd(1, 2 * r1 * r2), c1 = [-R + r1, 0], c2 = [R - r2, 0];
      const T = frame([-R, R], [-R, R], 300, 300, 14);
      return {
        topic: 'Cookies from a sheet of dough', rank: 13,
        text: `Two round cookies, of radii ${r1} and ${r2}, are cut from a round sheet of dough of radius ${R}: they touch each other, and each touches the edge of the dough. The leftover dough is rolled out, just as thick, into one more round cookie. What is the radius of that cookie?`,
        figure: svg(300, 300, 'Two cookies cut from a round sheet of dough', [ring(T([0, 0]), R * T.s), ring(T(c1), r1 * T.s), ring(T(c2), r2 * T.s)]),
        answer: labelled(correct, [surd(1, r1 * r1 + r2 * r2), fracSurd(r1 + r2, 2), surd(1, r1 * r2), surd(2, r1 * r2), [r2 - r1 + 1, num(r2 - r1 + 1, 0)]]),
        solution: `The leftover area is π·${R}² − π·${r1}² − π·${r2}² = ${2 * r1 * r2}π, because (r₁ + r₂)² − r₁² − r₂² = 2r₁r₂. A round cookie with that area has radius ${correct[1] === `√${2 * r1 * r2}` ? `<b>${correct[1]}</b>` : `√${2 * r1 * r2} = <b>${correct[1]}</b>`}.`,
        check: () => {
          if (Math.abs(dist(c1, c2) - (r1 + r2)) > 1e-9) return 'cookies not touching';
          return near(Math.sqrt(gridArea([-R, R], [-R, R], (p) => Math.hypot(...p) <= R && dist(p, c1) > r1 && dist(p, c2) > r2, 700) / Math.PI), correct[0], 'scrap radius', 0.01);
        },
      };
    },
    // a square sheet cut into rows of round cookies: the leftover area
    (d, ctx) => {
      const [s, n] = combo(ctx, [[8, 12, 16, 20, 24], [2, 3, 4]]);
      const correct = minusPi(s * s, (s * s) / 4), r = s / (2 * n), T = frame([0, s], [0, s], 280, 280, 16);
      const cookies = [];
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) cookies.push([(2 * i + 1) * r, (2 * j + 1) * r]);
      return {
        topic: 'Cookies from a sheet of dough', rank: 12,
        text: `A square sheet of dough, ${s} cm on each side, is cut into ${n} rows of ${n} equal round cookies, each touching its neighbors, with the outer cookies touching the edges of the sheet. What is the area of the leftover dough, in square centimeters?`,
        figure: svg(280, 280, 'Round cookies cut from a square sheet of dough', [poly([[0, 0], [s, 0], [s, s], [0, s]].map(T)), ...cookies.map((c) => ring(T(c), r * T.s))]),
        answer: labelled(correct, [minusPi(s * s, (s * s) / 2), minusPi(s * s, (s * s) / 8), [(s * s * Math.PI) / 4, piShow([(s * s) / 4, 1])], [s * s, num(s * s, 0)]]),
        solution: `Each cookie's diameter is ${s}/${n}, so its radius is ${frac(s, 2 * n)}, and the ${n * n} cookies cover ${n * n}·π·(${frac(s, 2 * n)})² = ${(s * s) / 4}π. (That is π/4 of the sheet whatever the number of rows.) The leftover is ${s}² − ${(s * s) / 4}π = <b>${correct[1]}</b>.`,
        check: () => near(gridArea([0, s], [0, s], (p) => cookies.every((c) => dist(p, c) > r), 700), correct[0], 'leftover', 0.01),
      };
    },
    // the scrap cookie's size given: the dough's radius
    (d, ctx) => {
      const [k] = combo(ctx, [[2, 3, 4, 5, 6]]);
      const scrap = surd(k, 2), { figure } = flower(k);
      return {
        topic: 'Cookies from a sheet of dough', rank: 11,
        text: `Seven equal round cookies are cut from a round sheet of dough: one in the middle and six in a ring around it, each touching the ones next to it, with the six outer ones touching the edge of the dough. The leftover dough is rolled out, just as thick, into one more round cookie, of radius ${scrap[1]}. What was the radius of the sheet of dough?`,
        figure,
        answer: choices(d, 3 * k, [2 * k, 4 * k, 6 * k, 2 * k + 1]),
        solution: `With cookie radius r, the outer cookies' centres are 2r from the middle, so the dough's radius is 3r. The leftover is π(3r)² − 7πr² = 2πr², so the scrap cookie has radius r√2. Here r√2 = ${scrap[1]}, so r = ${k}, and the dough's radius is 3·${k} = <b>${3 * k}</b>.`,
        check: () => near(Math.sqrt(flowerLeft(k) / Math.PI), scrap[0], 'scrap radius', 0.01),
      };
    },
  ],
};
