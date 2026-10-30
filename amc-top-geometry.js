// The hardest geometry for the AMC 10 practice (problems 19 to 25 of a real contest): eight topics built on contest
// ideas, with new numbers, settings and questions. Segments from the corners of a triangle or a square and the region
// they cut out; circles (and balls) squeezed into a corner; belts and common tangents of two circles; folding paper;
// equilateral triangles tilted inside other shapes; pieces of regular hexagons and octagons; medians and Stewart's
// theorem; and slicing a cube with a plane. Each topic asks its idea at least three ways, every picture is drawn to
// scale from the variant's own numbers, and every check() works the answer out again another way: coordinates and the
// shoelace formula, bisection where a circle, a point or an angle has to be slid into place, a fold done as a
// reflection, or a solid's volume added up slice by slice.
import { combo, num, frac, gcd } from '../kit/bank.js';
import { choices, labelled, fracSurd, showFrac, range } from './amc-kit.js';

// ---------- drawing: an svg with the triangle styles (side, dash, seg, arc, tick, vx and ang) ----------
const r2 = (v) => Math.round(v * 100) / 100;
const pts = (list) => list.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ');
const svg = (w, h, name, parts) => `<svg class="tri" viewBox="0 0 ${w} ${h}" role="img" aria-label="${name}">${parts.join('')}</svg>`;
const poly = (list, cls = 'side') => `<polygon class="${cls}" points="${pts(list)}"/>`;
const curve = (list, cls = 'seg') => `<polyline class="${cls}" fill="none" points="${pts(list)}"/>`;
const seg = ([x1, y1], [x2, y2], cls = 'side') => `<line class="${cls}" x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}"/>`;
const ring = ([x, y], r, cls = 'side') => `<circle class="${cls}" cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}"/>`;
const label = ([x, y], text, cls = 'vx', anchor = 'middle') => `<text class="${cls}" x="${r2(x)}" y="${r2(y + 5)}" text-anchor="${anchor}">${text}</text>`;
const dot = (p) => ring(p, 2.6, 'seg');
const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
const along = (p, u, t) => [p[0] + t * u[0], p[1] + t * u[1]];
const away = (p, from, gap = 14) => along(p, unit(from, p), gap);   // just outside p, on the far side from a centre
// a spot gap away from point p, square to the line ab, on the side where `toward` is
const beside = (p, a, b, toward, gap = 12) => { const u = unit(a, b), n = [-u[1], u[0]], sg = (toward[0] - p[0]) * n[0] + (toward[1] - p[1]) * n[1] < 0 ? -1 : 1; return along(p, n, sg * gap); };
const centre = (list) => [list.reduce((s, p) => s + p[0], 0) / list.length, list.reduce((s, p) => s + p[1], 0) / list.length];
// a point's name, in the middle of the widest gap between the lines that leave it toward `others`
function nameAt(p, others, text, gap = 15) {
  const angles = others.map((q) => Math.atan2(q[1] - p[1], q[0] - p[0])).sort((a, b) => a - b);
  let best = 0, at = 0;
  angles.forEach((a, i) => { const b = i + 1 < angles.length ? angles[i + 1] : angles[0] + 2 * Math.PI; if (b - a > best) { best = b - a; at = a + (b - a) / 2; } });
  return label([p[0] + gap * Math.cos(at), p[1] + gap * Math.sin(at)], text);
}
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
// points along the circle with centre c and radius rad (world coordinates) from angle a0 to angle a1 (radians), going
// round the way that passes the angle `via`
function arcPts(c, rad, a0, a1, via) {
  const turn = (t) => ((t % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), ccw = turn(a1 - a0), sweep = turn(via - a0) < ccw ? ccw : ccw - 2 * Math.PI;
  return range(0, 60).map((i) => [c[0] + rad * Math.cos(a0 + (sweep * i) / 60), c[1] + rad * Math.sin(a0 + (sweep * i) / 60)]);
}
// a box (x across, y going back, z up) seen from the front, a little from the right and above, as in the other files
const oblique = ([x, y, z]) => [x + 0.5 * y * Math.cos(Math.PI / 6), z + 0.5 * y * Math.sin(Math.PI / 6)];

// ---------- coordinates ----------
const dist = (p, q) => Math.hypot(...p.map((v, i) => v - q[i]));
// where the line through a, b meets the line through c, e
function meet([a, b], [c, e]) {
  const r = [b[0] - a[0], b[1] - a[1]], s = [e[0] - c[0], e[1] - c[1]], den = r[0] * s[1] - r[1] * s[0];
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den;
  return [a[0] + t * r[0], a[1] + t * r[1]];
}
const shoelace = (P) => Math.abs(P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + p[0] * q[1] - q[0] * p[1]; }, 0)) / 2;
// the part of polygon P where f ≥ 0, for a linear f (one side of a line)
function clip(P, f) {
  const out = [];
  P.forEach((p, i) => {
    const q = P[(i + 1) % P.length], fp = f(p), fq = f(q);
    if (fp >= 0) out.push(p);
    if ((fp >= 0) !== (fq >= 0)) { const t = fp / (fp - fq); out.push([p[0] + t * (q[0] - p[0]), p[1] + t * (q[1] - p[1])]); }
  });
  return out;
}
// bisection: where f changes sign between lo and hi
function solve(f, lo, hi) {
  const below = f(lo) > 0;
  for (let i = 0; i < 90; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === below) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
// how far p is from the line through a and b
const offLine = (p, a, b) => Math.abs((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) / dist(a, b);
// the mirror image of p in the line through a and b
function reflect(p, a, b) {
  const u = unit(a, b), w = [p[0] - a[0], p[1] - a[1]], t = w[0] * u[0] + w[1] * u[1], f = [a[0] + t * u[0], a[1] + t * u[1]];
  return [2 * f[0] - p[0], 2 * f[1] - p[1]];
}
// the centre of the circle inscribed in triangle abc, and its radius
function incircle(a, b, c) {
  const la = dist(b, c), lb = dist(c, a), lc = dist(a, b), s = la + lb + lc;
  const o = [(la * a[0] + lb * b[0] + lc * c[0]) / s, (la * a[1] + lb * b[1] + lc * c[1]) / s];
  return { o, r: offLine(o, b, c) };
}
// triangle ABC with BC = a along the x-axis from B = (0, 0), CA = b and AB = c
function corners(a, b, c) {
  const x = (a * a + c * c - b * b) / (2 * a);
  return { A: [x, Math.sqrt(c * c - x * x)], B: [0, 0], C: [a, 0] };
}
const rot = ([x, y], deg) => { const t = (deg * Math.PI) / 180; return [x * Math.cos(t) - y * Math.sin(t), x * Math.sin(t) + y * Math.cos(t)]; };
// in space
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const cross3 = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const toPlane = (p, a, b, c) => { const n = cross3(sub3(b, a), sub3(c, a)); return Math.abs(dot3(n, sub3(p, a))) / Math.hypot(...n); };

// ---------- numbers ----------
const lowest = (p, q) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return [p / g, q / g]; };
const F = (p, q = 1) => lowest(p, q);
const fa = (x, y) => F(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const fs = (x, y) => F(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const fm = (x, y) => F(x[0] * y[0], x[1] * y[1]);
const fd = (x, y) => F(x[0] * y[1], x[1] * y[0]);
const fv = (x) => x[0] / x[1];
const fr = (x) => frac(x[0], x[1]);
const fl = (p, q = 1) => [p / q, frac(p, q)];                // p/q as [value, how it reads]
const flf = (x) => fl(x[0], x[1]);
const lcm = (a, b) => (a / gcd(a, b)) * b;
const isSquare = (n) => n >= 0 && Math.round(Math.sqrt(n)) ** 2 === n;
const sqrtF = ([p, q]) => (isSquare(p) && isSquare(q) ? [Math.round(Math.sqrt(p)), Math.round(Math.sqrt(q))] : null);
const rootF = ([p, q]) => { const [x, y] = lowest(p, q); return fracSurd(1, y, x * y); };   // √(p/q), simplified, as [value, how it reads]
const near = (got, want, what, tol = 1e-6) => (Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)) ? '' : `${what}: worked out ${got}, said ${want}`);
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
// labelled() needs four wrong answers with different values, none of them the right one
const enough = (correct, wrongs) => { const list = [correct]; for (const w of wrongs) if (Number.isFinite(w[0]) && w[0] > 0 && !list.some((x) => Math.abs(x[0] - w[0]) < 1e-9)) list.push(w); return list.length >= 5; };
const sane = (list) => list.filter((w) => Number.isFinite(w[0]) && w[0] > 1e-9);
// choices() reads fractions [p, q]: the wrong ones that are positive, in lowest terms
const positive = (list) => list.filter((v) => v[0] > 0 && v[1] > 0).map((v) => lowest(...v));
// (a + b√r)/den, with √r simplified and the fraction in lowest terms, as [value, how it reads]
function mix(a, b, r, den = 1) {
  let k = 1, inside = r;
  for (let f = 2; f * f <= inside; f++) while (inside % (f * f) === 0) { inside /= f * f; k *= f; }
  b *= k;
  if (inside === 1 || b === 0) return fl(a + b * Math.sqrt(inside), den);
  if (den < 0) { a = -a; b = -b; den = -den; }
  const g = gcd(gcd(a, b), den) || 1; a /= g; b /= g; den /= g;
  const rt = (c) => `${Math.abs(c) === 1 ? '' : num(Math.abs(c), 0)}√${inside}`;
  const top = a === 0 ? `${b < 0 ? '−' : ''}${rt(b)}` : b > 0 ? (a > 0 ? `${num(a, 0)} + ${rt(b)}` : `${rt(b)} − ${num(-a, 0)}`) : a > 0 ? `${num(a, 0)} − ${rt(b)}` : `−${num(-a, 0)} − ${rt(b)}`;
  return [(a + b * Math.sqrt(inside)) / den, den === 1 ? top : `<span class="fr"><span>${top}</span><span>${den}</span></span>`];
}
// a multiple of π, p/q·π, as it reads
const piText = ([p, q]) => `${p === 1 ? '' : num(p, 0)}π${q === 1 ? '' : `/${q}`}`;
const piOf = (x) => [fv(x) * Math.PI, piText(x)];
// a ratio x : y, then (when it isn't already) in lowest terms
const simplest = (x, y) => { const [p, q] = lowest(x, y); return p === x ? `${x} : ${y}` : `${x} : ${y} = ${p} : ${q}`; };
const pt = (list) => `(${list.map((v) => (Array.isArray(v) ? fr(v) : num(v))).join(', ')})`;
// a number (or how it reads) times a bracket, with no 1 in front
const times = (c, text) => (String(c) === '1' ? text : `${c}${text}`);
const by = (n) => (n < 0 ? `(${num(n)})` : num(n));   // a number to multiply by, a negative one in brackets

// ---------- segments from the corners ----------
// the triangle every picture uses, and D on BC with BD : DC = a1 : b1, E on CA with CE : EA = a2 : b2 and F on AB with
// AF : FB = a3 : b3; P is where AD meets BE, Q where BE meets CF and R where CF meets AD
const TRI = { A: [3.6, 7.4], B: [0, 0], C: [10, 0] };
const share = (P, Q, x, y) => [P[0] + (x / (x + y)) * (Q[0] - P[0]), P[1] + (x / (x + y)) * (Q[1] - P[1])];
function cevians([a1, b1], [a2, b2], [a3, b3]) {
  const { A, B, C } = TRI, D = share(B, C, a1, b1), E = share(C, A, a2, b2), Fp = share(A, B, a3, b3);
  return { A, B, C, D, E, F: Fp, P: meet([A, D], [B, E]), Q: meet([B, E], [C, Fp]), R: meet([C, Fp], [A, D]) };
}
function cevianPicture(g, shade, names = [], drawn = ['AD', 'BE', 'CF']) {
  const T = fit([g.A, g.B, g.C], 380, 270, 34), p = Object.fromEntries(Object.entries(g).map(([k, v]) => [k, T(v)])), ctr = centre([p.A, p.B, p.C]);
  const rays = { P: ['A', 'D', 'B', 'E'], Q: ['B', 'E', 'C', 'F'], R: ['C', 'F', 'A', 'D'] };
  return svg(380, 270, `Triangle ABC with segments ${drawn.join(', ')}`, [poly(shade.map((k) => p[k])), poly([p.A, p.B, p.C]), ...drawn.map((s) => seg(p[s[0]], p[s[1]], 'seg')),
    ...['A', 'B', 'C', 'D', 'E', 'F'].map((k) => label(away(p[k], ctr, 14), k)), ...names.map((k) => nameAt(p[k], rays[k].map((j) => p[j]), k, 14))]);
}
// the triangles ABP, BCQ and CAR on the sides, as shares of the whole (mass points and shared heights)
const sideShares = ([a1, b1], [a2, b2], [a3, b3]) => [F(a1 * b2, a1 * a2 + a1 * b2 + b1 * b2), F(a2 * b3, a2 * a3 + a2 * b3 + b2 * b3), F(a3 * b1, a3 * a1 + a3 * b1 + b3 * b1)];
// the triangle XYP on side XY, where the segment from X (to U on YZ, YU : UZ = a : b) meets the one from Y (to V on
// ZX, ZV : VX = e : f): the weights at the corners, its area, and the working in words
function sideTriangle([X, Y, Z, U, V, P], [a, b], [e, f], T0) {
  let wX = a * e, wY = b * f, wZ = a * f; const g = gcd(gcd(wX, wY), wZ); wX /= g; wY /= g; wZ /= g;
  const part = F(T0 * a * (wY + wZ), (a + b) * (wX + wY + wZ));
  const text = `${Y}${U} : ${U}${Z} = ${a} : ${b} puts weights ${b} : ${a} on ${Y} and ${Z}, and ${Z}${V} : ${V}${X} = ${e} : ${f} puts weights ${f} : ${e} on ${Z} and ${X}, so ${X} = ${wX}, ${Y} = ${wY}, ${Z} = ${wZ} and ${X}${P} : ${P}${U} = ${simplest(wY + wZ, wX)}; triangle ${X}${Y}${U} has ${frac(a, a + b)} of the area and ${X}${Y}${P} has ${frac(wY + wZ, wX + wY + wZ)} of that, ${fr(part)}`;
  return { part, text };
}
// the small triangle at corner X (for slips): XU is cut by the segments from Y (to V on ZX) and from Z (to W on XY),
// YU : UZ = a : b, ZV : VX = e : f, XW : WY = g : h; whichever crossing is nearer X closes off a triangle there
function cornerPiece([a, b], [e, f], [g, h], T0) {
  const near1 = F(f * (a + b), a * e + b * f + a * f), near2 = F(g * (a + b), b * h + b * g + a * g);
  return fv(near1) < fv(near2) ? fm(fm(F(f, e + f), near1), F(T0 * b, a + b)) : fm(fm(F(g, g + h), near2), F(T0 * a, a + b));
}
const EVEN = [[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, 4], [4, 1], [3, 4], [2, 5], [3, 5], [1, 5]];
const RATIOS = [[1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2]];
// three different-looking ratios (not all the same, and not three segments through one point), with the least area
// that makes every piece whole
const MIXED = [];
for (const r1 of RATIOS) for (const r2 of RATIOS) for (const r3 of RATIOS) {
  if ((r1 === r2 && r2 === r3) || r1[0] * r2[0] * r3[0] === r1[1] * r2[1] * r3[1]) continue;
  const sh = sideShares(r1, r2, r3), den = sh.reduce((acc, v) => lcm(acc, v[1]), 1), inner = fs(fs(fs([1, 1], sh[0]), sh[1]), sh[2]);
  if (den <= 240 && inner[0] > 0 && fv(inner) >= 0.02) MIXED.push([r1, r2, r3, den]);
}
const SQUARE_CUTS = [[1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, 4]];
const SQUARE_K = ([p, q], ask) => { const Dn = (p + q) ** 2 + p * p; return ask === 'inner' ? Dn : (2 * (p + q) * Dn) / gcd(2 * (p + q) * Dn, p ** 3); };
const UNEVEN = [[1, 2], [1, 3], [2, 3], [3, 4], [2, 5]];

// ---------- circles squeezed into a corner ----------
// isosceles triangles: half the base b, the height h and the equal sides L (a Pythagorean triple), the corner circle
// not too small
const ISO = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [21, 20, 29]];
// a ray from O through (px, py), and the bisector of its angle with the x-axis along (u, v), u² + v² = w²
const RAYS = [[7, 24, 4, 3, 5], [-7, 24, 3, 4, 5], [119, 120, 12, 5, 13], [-119, 120, 5, 12, 13], [161, 240, 15, 8, 17], [-161, 240, 8, 15, 17], [527, 336, 24, 7, 25]];
const RIGHT = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [12, 16, 20], [7, 24, 25], [20, 21, 29], [15, 20, 25], [10, 24, 26], [12, 35, 37], [9, 40, 41]];
// triangles with AB, AC and BC, scaled by k, whose corner A is a whole (or rational) distance from the inscribed centre
const WEDGE = [[7, 25, 24, 1], [7, 25, 24, 2], [7, 25, 24, 3], [17, 25, 26, 1], [11, 25, 30, 1], [5, 30, 29, 1], [5, 30, 29, 2]];
// square pyramids: half the base a, the height h and the slant height l
const PYRAMIDS = [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17], [9, 12, 15], [4, 3, 5], [7, 24, 25], [20, 21, 29]];

// ---------- belts and common tangents ----------
// an open belt: d = 2(R − r) with the wheels apart; a crossed belt: d = 2(R + r)
const OPEN = [], CROSSED = [];
for (let r = 1; r <= 4; r++) for (let R = r + 1; R <= 14; R++) if (R > 3 * r && 2 * (R - r) <= 26) OPEN.push([R, r]);
for (let r = 1; r <= 6; r++) for (let R = r; R <= 9; R++) if (R + r <= 12) CROSSED.push([R, r]);
// two circles apart (d > R + r) whose outer common tangent is a whole number long
const APART = [];
for (let dd = 5; dd <= 26; dd++) for (let R = 2; R <= 16; R++) for (let r = 1; r < R; r++) if (dd > R + r + 1 && isSquare(dd * dd - (R - r) ** 2)) APART.push([dd, R, r, Math.round(Math.sqrt(dd * dd - (R - r) ** 2))]);
// two circles crossing at A and B: AB = 2h, and the centres x1 and x2 from the chord on either side (R, r whole)
// (at most two pairs of legs for each chord, both ways round, so no one chord takes over)
const CHORDS = [];
for (let h = 3; h <= 24; h++) {
  const legs = range(1, 40).filter((x) => isSquare(h * h + x * x) && h * h + x * x <= 1600), pairs = [];
  for (let i = 0; i < legs.length; i++) for (let j = i + 1; j < legs.length; j++) pairs.push([legs[i], legs[j]]);
  for (const [x1, x2] of pairs.slice(0, 2)) CHORDS.push([h, x1, x2], [h, x2, x1]);
}

// ---------- folding paper ----------
// sheets w by h whose diagonal is a whole number, or a whole number times √13 or √10
const SHEETS = [];
for (let w = 4; w <= 16; w++) for (let h = 3; h < w; h++) if (w < 2 * h && [1, 10, 13].some((f) => isSquare((w * w + h * h) / f))) SHEETS.push([w, h]);
// a square folded corner A onto P on CD, DP = x: the pieces of the little triangle at C come out as simple fractions
const SQUARE_FOLDS = [];
for (let s = 4; s <= 12; s++) for (let x = 1; x < s; x++) if (lowest(2 * s * x, s + x)[1] <= 5 && lowest(s * x * (s - x), s + x)[1] <= 5) SQUARE_FOLDS.push([s, x]);
const TRIANGLE_FOLDS = [];
for (let p = 1; p <= 8; p++) for (let q = 1; p + q <= 9; q++) if (p !== q) TRIANGLE_FOLDS.push([p, q]);

// ---------- tilted equilateral triangles ----------
const LINES = [];
for (let a = 1; a <= 6; a++) for (let b = a; b <= 7; b++) LINES.push([a, b]);
// rectangles in which an equilateral triangle fits with a corner at A and its others on the far sides
const BOXES = [];
for (let w = 5; w <= 15; w++) for (let h = 5; h <= 15; h++) if (w !== h && h / w > Math.sqrt(3) / 2 + 0.02 && h / w < 2 / Math.sqrt(3) - 0.02) BOXES.push([w, h]);
// PU = x and PV = y with x² + y² = PW² = z²: which corner gets which
const INSIDE = [];
for (const [x, y, z] of [[3, 4, 5], [6, 8, 10], [5, 12, 13], [8, 15, 17]]) for (const order of ['ABC', 'BAC', 'BCA', 'CBA', 'CAB', 'ACB']) INSIDE.push([x, y, z, order]);

// ---------- pieces of regular polygons ----------
const HEX_CUTS = [[1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, 4]];
// a regular hexagon's corners A to F (A on the right, going counterclockwise), on the unit circle
const HEX = range(0, 5).map((i) => [Math.cos((i * Math.PI) / 3), Math.sin((i * Math.PI) / 3)]);
// a regular octagon's corners A to H, A at the top left of the top side, going clockwise
const OCT = range(0, 7).map((i) => [Math.cos(((112.5 - 45 * i) * Math.PI) / 180), Math.sin(((112.5 - 45 * i) * Math.PI) / 180)]);

// ---------- medians and Stewart's theorem ----------
// BC = a and CA = b with the medians from A and B perpendicular: AB² = (a² + b²)/5, a real triangle, not too flat
const PERPENDICULAR = [];
for (let a = 2; a <= 14; a++) for (let b = 2; b <= 14; b++) {
  const c = Math.sqrt((a * a + b * b) / 5);
  if (a !== b && (a * a + b * b) % 5 === 0 && !(a + b === 13 && a * b === 42) && a + b > c + 1 && a + c > b + 1 && b + c > a + 1) PERPENDICULAR.push([a, b]);
}
// three medians making a triangle with a whole-number area (Heron)
const MEDIANS = [[3, 4, 5], [6, 8, 10], [9, 12, 15], [5, 12, 13], [13, 14, 15], [5, 5, 6], [5, 5, 8], [10, 13, 13], [7, 15, 20], [12, 16, 20]];
// triangles a = BC, b = CA, c = AB with b ≠ c, not too flat; `acute` when the foot of the altitude from A is inside BC
const SCALENE = [];
for (let a = 4; a <= 15; a++) for (let b = 3; b <= 15; b++) for (let c = 3; c <= 15; c++) {
  if (b === c || a + 2 > b + c || b + 2 > a + c || c + 2 > a + b) continue;
  SCALENE.push([a, b, c, b * b < a * a + c * c && c * c < a * a + b * b]);
}
// whole-number triangles with a whole-number area, no two sides equal (a = BC, b = CA, c = AB)
const HERONIAN = [];
for (let a = 5; a <= 25; a++) for (let b = 5; b <= 25; b++) for (let c = 5; c <= 25; c++) {
  if (b === c || a === b || a === c || a + 2 > b + c || b + 2 > a + c || c + 2 > a + b || (a + b + c) % 2) continue;
  const s = (a + b + c) / 2, K2 = s * (s - a) * (s - b) * (s - c);
  if (isSquare(K2)) HERONIAN.push([a, b, c, Math.round(Math.sqrt(K2))]);
}

// ---------- slicing a cube ----------
// the cube ABCDEFGH with edges 1: ABCD the bottom (A at the front left), E, F, G and H above A, B, C and D
const CUBE = { A: [0, 0, 0], B: [1, 0, 0], C: [1, 1, 0], D: [0, 1, 0], E: [0, 0, 1], F: [1, 0, 1], G: [1, 1, 1], H: [0, 1, 1] };
const EDGES = ['AB', 'BC', 'CD', 'DA', 'EF', 'FG', 'GH', 'HE', 'AE', 'BF', 'CG', 'DH'];
const corner3 = (name, s) => CUBE[name].map((v) => v * s);
// where the plane n·x = dd crosses the edges of the cube with edges s, exactly (coordinates as fractions), each point
// once, with the edge it is on and how far along it (t); null if the plane holds a whole edge
function section(n, dd, s) {
  const out = [];
  for (const e of EDGES) {
    const U = corner3(e[0], s), V = corner3(e[1], s), nu = dot3(n, U), nv = dot3(n, V);
    if (nu === dd && nv === dd) return null;
    if ((nu - dd) * (nv - dd) > 0 || nu === nv) continue;
    const t = F(dd - nu, nv - nu), P = U.map((u, i) => fa(F(u), fm(t, F(V[i] - u)))), key = P.map((c) => c.join('/')).join(',');
    if (!out.some((o) => o.key === key)) out.push({ key, P, edge: e, t, vertex: t[0] === 0 ? e[0] : t[0] === t[1] ? e[1] : null });
  }
  // in order round the polygon, seen along the axis the plane is least tilted from
  const k = [0, 1, 2].reduce((best, i) => (Math.abs(n[i]) > Math.abs(n[best]) ? i : best), 0), keep = [0, 1, 2].filter((i) => i !== k);
  const flat = (o) => keep.map((i) => fv(o.P[i])), c = centre(out.map(flat));
  out.sort((x, y) => Math.atan2(flat(x)[1] - c[1], flat(x)[0] - c[0]) - Math.atan2(flat(y)[1] - c[1], flat(y)[0] - c[0]));
  return { k, keep, list: out };
}
// the area of a polygon given by exact coordinates (fractions), by the shoelace formula
const shoelaceF = (P) => { let s = [0, 1]; P.forEach((p, i) => { const q = P[(i + 1) % P.length]; s = fa(s, fs(fm(p[0], q[1]), fm(q[0], p[1]))); }); return F(Math.abs(s[0]), 2 * s[1]); };
// a plane's equation as it reads, like 2x − y + 3z = 4
function equation(n, dd) {
  const terms = n.map((c, i) => [c, 'xyz'[i]]).filter(([c]) => c !== 0);
  return terms.map(([c, v], i) => `${i === 0 ? (c < 0 ? '−' : '') : c < 0 ? ' − ' : ' + '}${Math.abs(c) === 1 ? '' : Math.abs(c)}${v}`).join('') + ` = ${num(dd)}`;
}
const SHAPES = { 3: 'triangle', 4: 'quadrilateral', 5: 'pentagon', 6: 'hexagon' };
// planes through three of the cube's corners and edge midpoints (with edges 2, so the midpoints are whole), none of the
// plane's coefficients 0, cutting a quadrilateral, pentagon or hexagon; the first three points found for each plane
const CUTS = [];
{
  const spots = [...Object.keys(CUBE).map((v) => [v, corner3(v, 2)]), ...EDGES.map((e) => [e, corner3(e[0], 2).map((u, i) => (u + corner3(e[1], 2)[i]) / 2)])];
  const seen = new Set();
  for (let i = 0; i < spots.length; i++) for (let j = i + 1; j < spots.length; j++) for (let k = j + 1; k < spots.length; k++) {
    let n = cross3(sub3(spots[j][1], spots[i][1]), sub3(spots[k][1], spots[i][1]));
    if (n.some((c) => c === 0)) continue;
    const g = gcd(gcd(n[0], n[1]), n[2]), sg = n[0] < 0 ? -1 : 1;
    n = n.map((c) => (sg * c) / g);
    const dd = dot3(n, spots[i][1]), key = `${n}|${dd}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const sec = section(n, dd, 2);
    if (!sec || sec.list.length < 4) continue;
    CUTS.push({ n, dd, given: [spots[i][0], spots[j][0], spots[k][0]] });
  }
}
// planes ax + by + cz = d cutting a cube with edges 6 so that the piece at A is not just a corner tetrahedron, not
// through the centre, crossing the edges at multiples of ½, described by three of those crossings (corners first,
// then midpoints)
const CHOPS = [];
for (const a of [1, 2, 3]) for (const b of [1, 2, 3]) for (const c of [1, 2, 3]) for (let dd = 1; dd < 6 * (a + b + c); dd++) {
  if (gcd(gcd(a, b), gcd(c, dd)) > 1 || 2 * dd === 6 * (a + b + c) || dd <= 6 * Math.min(a, b, c)) continue;
  const sec = section([a, b, c], dd, 6);
  if (!sec || sec.list.length < 4 || sec.list.some((o) => o.P.some((v) => 2 % v[1] !== 0))) continue;
  const score = (o) => (o.vertex ? 0 : o.t[0] * 2 === o.t[1] ? 1 : 2), order = sec.list.slice().sort((x, y) => score(x) - score(y));
  let given = null;
  for (let i = 0; i < order.length && !given; i++) for (let j = i + 1; j < order.length && !given; j++) for (let k = j + 1; k < order.length && !given; k++) {
    const [p, q, r] = [order[i], order[j], order[k]].map((o) => o.P.map(fv));
    if (cross3(sub3(q, p), sub3(r, p)).some((v) => Math.abs(v) > 1e-9)) given = [order[i], order[j], order[k]];
  }
  if (given && given.filter((o) => score(o) === 2).length <= 1) CHOPS.push([a, b, c, dd, given]);
}
// three edges of a box at A, with points P, Q and R on them: p²q² + q²r² + r²p² a square times at most 30
const PRONGS = [];
for (let p = 1; p <= 9; p++) for (let q = p; q <= 9; q++) for (let r = q; r <= 12; r++) {
  if (p === r || r > 4 * p) continue;
  const N = p * p * q * q + q * q * r * r + r * r * p * p;
  let inside = N;
  for (let f = 2; f * f <= inside; f++) while (inside % (f * f) === 0) inside /= f * f;
  if (inside <= 30) PRONGS.push([p, q, r]);
}

// four of the slips, picked so that the right answer can land anywhere from (A) to (E): a place is drawn from those
// the slips allow (as many smaller ones below it as its place, the rest bigger), then slips from each side at random
function spread(d, value, correct, wrongs) {
  const v0 = value(correct), seen = [v0], small = [], big = [];
  for (const w of wrongs) { const v = value(w); if (!Number.isFinite(v) || v <= 0 || seen.some((x) => Math.abs(x - v) < 1e-9)) continue; seen.push(v); (v < v0 ? small : big).push(w); }
  const lo = Math.max(0, 4 - big.length), hi = Math.min(4, small.length);
  if (lo > hi) return d.shuffle(wrongs);
  const at = d.int(lo, hi);
  return [...d.shuffle(small).slice(0, at), ...d.shuffle(big).slice(0, 4 - at)];
}
// and none that reads like another once the fraction's markup is gone (1/2 and 12 both read "12" then)
const bare = (t) => String(t).replace(/<[^>]+>/g, '');
const distinct = (first, list, read) => { const seen = [bare(read(first))]; return list.filter((w) => { const t = bare(read(w)); if (seen.includes(t)) return false; seen.push(t); return true; }); };
function choicesS(d, ans, wrongs, show) {
  let list = spread(d, (x) => x[0] / x[1], ans, distinct(ans, wrongs, show)), res = choices(d, ans, list, show);
  for (let i = 0; i < 4; i++) {
    const texts = res.choices.map(bare), clash = texts.find((t, j) => texts.indexOf(t) !== j);
    if (clash === undefined) break;
    list = list.filter((w) => bare(show(w)) !== clash);
    res = choices(d, ans, list.length < 4 ? list : list.slice(0, 3), show);
  }
  return res;
}
const labelledS = (d, correct, wrongs) => labelled(correct, spread(d, (x) => x[0], correct, distinct(correct, wrongs, (w) => w[1])));

// ---------- pictures used by more than one topic ----------
// a cube with edges s, its corners named, and some points on it marked and named
function cubePicture(s, marks, w = 360, h = 300) {
  const all = Object.values(CUBE).map((v) => oblique(v.map((x) => x * s))), T = frame([Math.min(...all.map((p) => p[0])), Math.max(...all.map((p) => p[0]))], [Math.min(...all.map((p) => p[1])), Math.max(...all.map((p) => p[1]))], w, h, 36);
  const P = (v) => T(oblique(v)), at = Object.fromEntries(Object.keys(CUBE).map((k) => [k, P(corner3(k, s))])), ctr = P([s / 2, s / 2, s / 2]);
  const parts = EDGES.map((e) => seg(at[e[0]], at[e[1]], e.includes('D') ? 'side dash' : 'side'));
  parts.push(...Object.keys(CUBE).map((k) => label(away(at[k], ctr, 13), k)));
  for (const [name, v] of marks) { const q = P(v); parts.push(dot(q)); if (name) parts.push(label(away(q, ctr, 13), name, 'ang')); }
  return svg(w, h, 'Cube ABCDEFGH', parts);
}

// a cross-section of the cube with edges s by one of the CUTS: its corners, its shadow, the answer and the slips
function cutData(cut, s) {
  const { n } = cut, dd = (cut.dd * s) / 2, sec = section(n, dd, s), poly3 = sec.list.map((o) => o.P), { k, keep } = sec;
  const shadow = shoelaceF(poly3.map((P) => keep.map((i) => P[i]))), nn = dot3(n, n), nk = Math.abs(n[k]), coefF = fd(shadow, F(nk)), correct = fracSurd(coefF[0], coefF[1], nn);
  // names for the given points: corners keep theirs, midpoints are M, N and K
  const names = ['M', 'N', 'K'], given = [];
  let next = 0;
  for (const g of cut.given) {
    if (g.length === 1) given.push({ name: g, at: corner3(g, s) });
    else { const nm = names[next++]; given.push({ name: nm, at: corner3(g[0], s).map((u, i) => (u + corner3(g[1], s)[i]) / 2), text: `${nm} is the midpoint of edge ${g}` }); }
  }
  const defs = given.filter((g) => g.text).map((g) => g.text), defText = defs.length ? `${defs.length === 1 ? defs[0] : `${defs.slice(0, -1).join(', ')} and ${defs.at(-1)}`}. ` : '';
  const tri = cross3(sub3(given[1].at, given[0].at), sub3(given[2].at, given[0].at)), others = [0, 1, 2].filter((i) => i !== k && n[i] !== 0);
  const wrongs = sane([flf(shadow), fracSurd(1, 2, dot3(tri, tri)), ...others.map((i) => { const f = fd(shadow, F(Math.abs(n[i]))); return fracSurd(f[0], f[1], nn); }), fracSurd(s * s, nk, nn), fracSurd(shadow[0], shadow[1], nn), fracSurd(shadow[0], 2 * shadow[1] * nk, nn)]);
  const axis = 'xyz'[k], view = { x: 'from the side, straight along the x-axis', y: 'from the front, straight along the y-axis', z: 'from straight above' }[axis];
  return { n, dd, poly3, keep, shadow, nn, nk, correct, wrongs, given, defText, axis, view };
}

export const topGeometry = {
  'Segments from the corners': [
    // three segments that cut every side in the same ratio: the middle triangle is what the three side triangles leave
    (d, ctx) => {
      const [[m, n], c] = pick(ctx, 'sc-even', [EVEN, [2, 3, 4, 5]]);
      const S = m * m + m * n + n * n, T0 = c * S, ans = F(c * (m - n) ** 2), wD = n * n + m * n;
      const ABD = F(T0 * m, m + n), ABP = F(T0 * m * n, S), g = cevians([m, n], [m, n], [m, n]);
      const wrongs = positive([F(T0 * (m * m - m * n + n * n), (m + n) ** 2), F(T0 * (m - n) ** 2, (m + n) ** 2), ABP, F(T0, 7), F(T0 * (m - n) ** 2, m * m + n * n), fs(F(T0), fm(F(2), ABP)), ABD, F(c * m ** 3, m + n), F(c * n ** 3, m + n)]);
      return {
        topic: 'Segments from the corners', rank: 21,
        text: `Triangle ABC has area ${num(T0)}. Points D, E and F lie on sides BC, CA and AB, with BD : DC = CE : EA = AF : FB = ${m} : ${n}. Segments AD, BE and CF cut out a small triangle in the middle. What is its area?`,
        figure: cevianPicture(g, ['P', 'Q', 'R']),
        answer: choicesS(d, ans, wrongs, showFrac),
        solution: `The three segments cut ABC into the small triangle in the middle and three triangles that each stand on a whole side: ABP, BCQ and CAR, where P is where AD meets BE, Q is where BE meets CF, and R is where CF meets AD. The picture is the same from every corner, so those three have the same area, and it is enough to find ABP. Use mass points on AD and BE: BD : DC = ${m} : ${n} puts weights ${n} : ${m} on B and C, and CE : EA = ${m} : ${n} puts weights ${n} : ${m} on C and A. Taking C = ${m * n} makes A = ${m * m} and B = ${n * n}, so D carries ${n * n} + ${m * n} = ${wD} and AP : PD = ${simplest(wD, m * m)}. Triangle ABD has base BD, ${frac(m, m + n)} of BC, so its area is ${frac(m, m + n)}·${num(T0)} = ${fr(ABD)}, and triangle ABP has ${frac(wD, wD + m * m)} of that, ${fr(ABP)}. So the middle triangle has area ${num(T0)} − 3·${fr(ABP)} = <b>${showFrac(ans)}</b>.`,
        check: () => near((shoelace([g.P, g.Q, g.R]) / shoelace([g.A, g.B, g.C])) * T0, fv(ans), 'middle triangle'),
      };
    },
    // three different ratios: each side triangle by its own mass points (Routh's theorem without the formula)
    (d, ctx) => {
      const [[r1, r2, r3, den], c] = pick(ctx, 'sc-mixed', [MIXED, [1, 2]]);
      const T0 = den * c * (den < 30 ? 2 : 1), t1 = sideTriangle(['A', 'B', 'C', 'D', 'E', 'P'], r1, r2, T0), t2 = sideTriangle(['B', 'C', 'A', 'E', 'F', 'Q'], r2, r3, T0), t3 = sideTriangle(['C', 'A', 'B', 'F', 'D', 'R'], r3, r1, T0);
      const ans = fs(fs(fs(F(T0), t1.part), t2.part), t3.part), g = cevians(r1, r2, r3);
      const [[a1, b1], [a2, b2], [a3, b3]] = [r1, r2, r3];
      const DEF = fs(fs(fs(F(T0), F(T0 * a3 * b2, (a3 + b3) * (a2 + b2))), F(T0 * a1 * b3, (a1 + b1) * (a3 + b3))), F(T0 * a2 * b1, (a2 + b2) * (a1 + b1)));
      // reading AP : PD the wrong way up: each side triangle gets the other part of its segment
      const flip = [[r1, r2], [r2, r3], [r3, r1]].reduce((acc, [[a, b], [e, f]]) => { let wX = a * e, wY = b * f, wZ = a * f; return fs(acc, F(T0 * a * wX, (a + b) * (wX + wY + wZ))); }, F(T0));
      const wrongs = positive([DEF, fs(F(T0), fm(F(3), t1.part)), fs(fs(F(T0), t1.part), t2.part), F(T0, 7), flip, cornerPiece(r1, r2, r3, T0), cornerPiece(r2, r3, r1, T0), cornerPiece(r3, r1, r2, T0), fa(ans, t1.part)]);
      return {
        topic: 'Segments from the corners', rank: 23,
        text: `Triangle ABC has area ${num(T0)}. Point D is on side BC with BD : DC = ${a1} : ${b1}, point E is on side CA with CE : EA = ${a2} : ${b2}, and point F is on side AB with AF : FB = ${a3} : ${b3}. Segments AD, BE and CF cut out a small triangle in the middle. What is its area?`,
        figure: cevianPicture(g, ['P', 'Q', 'R']),
        answer: choicesS(d, ans, wrongs, showFrac),
        solution: `The three segments cut ABC into the small triangle in the middle and three triangles that each stand on a whole side: ABP, BCQ and CAR, where P is where AD meets BE, Q is where BE meets CF, and R is where CF meets AD. Find each one with mass points (to see how the crossing point cuts a segment) and shared heights. For ABP, ${t1.text}. For BCQ, ${t2.text}. For CAR, ${t3.text}. So the middle triangle has area ${num(T0)} − ${fr(t1.part)} − ${fr(t2.part)} − ${fr(t3.part)} = <b>${showFrac(ans)}</b>.`,
        check: () => near((shoelace([g.P, g.Q, g.R]) / shoelace([g.A, g.B, g.C])) * T0, fv(ans), 'middle triangle'),
      };
    },
    // a square with a segment from each corner: a quarter turn shows they meet at right angles, and similar triangles
    // give the pieces
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'corner' : 'inner', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[p, q], c] = pick(turn, `sc-square-${ask}`, [SQUARE_CUTS, [1, 2, 3, 4]], (pq, cc) => cc * SQUARE_K(pq, ask) <= 700);
      const Dn = (p + q) ** 2 + p * p, S = c * SQUARE_K([p, q], ask), t = p / (p + q);
      const ABE = F(S * p, 2 * (p + q)), ABX = F(S * p * (p + q), 2 * Dn), inner = F(S * q * q, Dn), BEX = fs(ABE, ABX);
      const ans = ask === 'inner' ? inner : BEX;
      const wrongs = ask === 'inner'
        ? positive([F(S, 5), F(S * q * q, (p + q) ** 2), ABX, fm(F(4), ABX), fs(F(S), fm(F(4), ABE)), F(S * q, p + q), BEX, fs(F(S), fm(F(2), ABX))])
        : positive([ABX, ABE, F(S * p * p, 2 * (p + q) ** 2), inner, F(S * p ** 3, 2 * (p + q) ** 3), fs(ABE, F(S, 5))]);
      const A = [0, 0], B = [1, 0], C = [1, 1], D = [0, 1], E = [1, t], Fq = [1 - t, 1], G = [0, 1 - t], H = [t, 0];
      const X = meet([A, E], [B, Fq]), Y = meet([B, Fq], [C, G]), Z = meet([C, G], [D, H]), W = meet([D, H], [A, E]);
      const T = fit([A, B, C, D], 300, 300, 34), ctr = T([0.5, 0.5]), drawn = ask === 'inner' ? [[A, E], [B, Fq], [C, G], [D, H]] : [[A, E], [B, Fq]];
      const names = ask === 'inner' ? [[A, 'A'], [B, 'B'], [C, 'C'], [D, 'D'], [E, 'E'], [Fq, 'F'], [G, 'G'], [H, 'H']] : [[A, 'A'], [B, 'B'], [C, 'C'], [D, 'D'], [E, 'E'], [Fq, 'F']];
      const AE2 = F(Dn, (p + q) ** 2);
      const start = `A quarter turn about the centre of the square takes A to B and E to F, so it takes segment AE to BF: the two meet at right angles. Let X be where AE meets BF. Triangle ABX has a right angle at X and shares its angle at A with triangle ABE, so it is similar to ABE, scaled by AB/AE. BE is ${frac(p, p + q)} of the side, so AE² = AB²·(1 + ${frac(p * p, (p + q) ** 2)}) = ${fr(AE2)}·AB², and [ABE] = ½·AB·BE = ${frac(p, 2 * (p + q))}·${num(S)} = ${fr(ABE)}. So [ABX] = [ABE]·AB²/AE² = ${fr(ABE)}·${fr(fd(F(1), AE2))} = ${fr(ABX)}.`;
      return {
        topic: 'Segments from the corners', rank: ask === 'inner' ? 20 : 21,
        text: ask === 'inner'
          ? `Square ABCD has area ${num(S)}. Points E, F, G and H are on sides BC, CD, DA and AB, with BE : EC = CF : FD = DG : GA = AH : HB = ${p} : ${q}. Segments AE, BF, CG and DH cut out a smaller square in the middle. What is its area?`
          : `Square ABCD has area ${num(S)}. Point E is on side BC and point F is on side CD, with BE : EC = CF : FD = ${p} : ${q}. Segments AE and BF cross at X. What is the area of triangle BEX?`,
        figure: svg(300, 300, ask === 'inner' ? 'Square ABCD with a segment from each corner' : 'Square ABCD with segments AE and BF crossing at X', [poly((ask === 'inner' ? [X, Y, Z, W] : [B, E, X]).map(T)), poly([A, B, C, D].map(T)),
          ...drawn.map(([u, v]) => seg(T(u), T(v), 'seg')), ...names.map(([v, s]) => label(away(T(v), ctr, 14), s)), ...(ask === 'corner' ? [nameAt(T(X), [T(A), T(E), T(B), T(Fq)], 'X', 14)] : [])]),
        answer: choicesS(d, ans, wrongs, showFrac),
        solution: ask === 'inner'
          ? `${start} The same goes for the triangles on the other three sides, and those four triangles and the middle square fill the whole square. So the middle square has area ${num(S)} − 4·${fr(ABX)} = <b>${showFrac(ans)}</b>.`
          : `${start} Triangle BEX is the rest of triangle ABE, so its area is ${fr(ABE)} − ${fr(ABX)} = <b>${showFrac(ans)}</b>.`,
        check: () => near(shoelace(ask === 'inner' ? [X, Y, Z, W] : [B, E, X]) * S, fv(ans), ask === 'inner' ? 'middle square' : 'triangle BEX'),
      };
    },
    // the small triangle at a corner, or the quadrilateral beside it: two crossing points on the same segment AD
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'quad' : 'tri', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[m, n], c] = pick(turn, `sc-corner-${ask}`, [UNEVEN, [1, 2, 3]], ([mm, nn], cc) => cc * (mm + nn) * (mm * mm + mm * nn + nn * nn) <= 600);
      const S = m * m + m * n + n * n, T0 = c * (m + n) * S, ABD = F(T0 * m, m + n), AR = F(m * (m + n), S), AP = F(n * (m + n), S), AF = F(m, m + n);
      const AFR = fm(fm(AF, AR), ABD), ABP = fm(AP, ABD), quad = fs(ABP, AFR), ans = ask === 'tri' ? AFR : quad;
      const inner = F(T0 * (m - n) ** 2, S), AFE = F(T0 * m * n, (m + n) ** 2), g = cevians([m, n], [m, n], [m, n]);
      const wrongs = ask === 'tri' ? positive([AFE, fm(fm(AF, AP), ABD), inner, fm(AF, ABD), F(T0, 21), fm(AFR, AF), fm(fm(AF, AF), fm(AR, ABD))]) : positive([ABP, fa(ABP, AFR), inner, fs(ABD, ABP), fs(ABD, AFR), ABD, fa(quad, inner)]);
      return {
        topic: 'Segments from the corners', rank: 22,
        text: `Triangle ABC has area ${num(T0)}. Points D, E and F lie on sides BC, CA and AB with BD : DC = CE : EA = AF : FB = ${m} : ${n}. Segment AD crosses CF at R and BE at P. What is the area of ${ask === 'tri' ? 'triangle AFR' : 'quadrilateral FBPR'}?`,
        figure: cevianPicture(g, ask === 'tri' ? ['A', 'F', 'R'] : ['F', 'B', 'P', 'R'], ['P', 'R']),
        answer: choicesS(d, ans, wrongs, showFrac),
        solution: `Mass points tell how R and P cut AD. For R, on CF: AF : FB = ${m} : ${n} puts weights ${n} : ${m} on A and B, and BD : DC = ${m} : ${n} puts weights ${n} : ${m} on B and C; with B = ${m * n} that is A = ${n * n} and C = ${m * m}, so D carries ${m * n + m * m} and AR : RD = ${simplest(m * n + m * m, n * n)}, which makes AR ${fr(AR)} of AD. For P, on BE: CE : EA = ${m} : ${n} puts weights ${n} : ${m} on C and A, so with C = ${m * n}, A = ${m * m} and B = ${n * n}, D carries ${n * n + m * n} and AP : PD = ${simplest(n * n + m * n, m * m)}, so AP is ${fr(AP)} of AD. Triangle ABD has base BD, ${frac(m, m + n)} of BC, so its area is ${fr(ABD)}. ` +
          (ask === 'tri'
            ? `Triangle AFR takes ${fr(AF)} of AB and ${fr(AR)} of AD from the corner A of triangle ABD, so its area is ${fr(AF)}·${fr(AR)}·${fr(ABD)} = <b>${showFrac(ans)}</b>.`
            : `Triangle ABP has ${fr(AP)} of ABD, ${fr(ABP)}, and triangle AFR takes ${fr(AF)} of AB and ${fr(AR)} of AD, so it has ${fr(AF)}·${fr(AR)}·${fr(ABD)} = ${fr(AFR)}. Quadrilateral FBPR is what is left of ABP: ${fr(ABP)} − ${fr(AFR)} = <b>${showFrac(ans)}</b>.`),
        check: () => near((shoelace(ask === 'tri' ? [g.A, g.F, g.R] : [g.F, g.B, g.P, g.R]) / shoelace([g.A, g.B, g.C])) * T0, fv(ans), ask === 'tri' ? 'AFR' : 'FBPR'),
      };
    },
  ],

  'Circles squeezed into a corner': [
    // isosceles: the line touching the inscribed circle parallel to the base cuts off a small copy of the triangle,
    // and the corner circle is that copy's inscribed circle
    (d, ctx) => {
      const [[b0, h0, L0], k] = pick(ctx, 'cc-iso', [ISO, [1, 2, 3]]);
      const b = k * b0, h = k * h0, L = k * L0, area = b * h, sp = L + b, r = F(area, sp), top = fs(F(h), fm(F(2), r)), ratio = fd(top, F(h)), ans = fm(r, ratio);
      const wrongs = positive([r, fm(r, fd(fs(F(h), r), F(h))), fm(ans, ratio), fd(top, F(2)), fm(r, F(b0, L0)), top, fm(F(2), ans), fm(r, F(L0 - b0, L0))]);
      const A = [0, h], B = [-b, 0], C = [b, 0], T = fit([A, B, C], 340, 280, 30), ctr = centre([A, B, C].map(T));
      return {
        topic: 'Circles squeezed into a corner', rank: 21,
        text: `Triangle ABC has AB = AC = ${L} and BC = ${2 * b}. A circle is inscribed in the triangle, and a smaller circle sits in the corner at A, touching AB, AC and the inscribed circle. What is the radius of the smaller circle?`,
        figure: svg(340, 280, 'Isosceles triangle ABC with its inscribed circle and a small circle in the corner at A', [poly([A, B, C].map(T)), ring(T([0, fv(r)]), fv(r) * T.s, 'arc'), ring(T([0, 2 * fv(r) + fv(ans)]), fv(ans) * T.s, 'arc ext'),
          ...[[A, 'A'], [B, 'B'], [C, 'C']].map(([p, s]) => label(away(T(p), ctr, 14), s))]),
        answer: choicesS(d, ans, wrongs, showFrac),
        solution: `Find the inscribed circle first. The height from A to BC is √(${L}² − ${b}²) = ${h}, so the area is ${b}·${h} = ${num(area)}, and with semi-perimeter ${L} + ${b} = ${sp}, the inscribed radius is r = ${num(area)} ÷ ${sp} = ${fr(r)}. Now draw the line that touches the inscribed circle on A’s side, parallel to BC: it is 2r = ${fr(fm(F(2), r))} above BC, so it cuts off a small triangle at A with height ${h} − ${fr(fm(F(2), r))} = ${fr(top)}, similar to ABC and scaled by ${fr(top)} ÷ ${h} = ${fr(ratio)}. The circle in the corner is that small triangle’s inscribed circle: it touches AB, AC and the new line, and it touches the line on the axis of symmetry, at the same point as the big circle, so the two circles touch there. So its radius is ${fr(ratio)}·${fr(r)} = <b>${showFrac(ans)}</b>.`,
        check: () => {
          // the inscribed circle from the corners, then slide a circle's centre down the axis until it touches it
          const { o, r: ri } = incircle(A, B, C), y = solve((yy) => yy - o[1] - ri - offLine([0, yy], A, B), o[1] + ri + 1e-9, h);
          return near(offLine([0, y], A, B), fv(ans), 'corner radius');
        },
      };
    },
    // a chain of circles in an angle given by a ray: the bisector's direction, then each circle a fixed fraction of the
    // last, and a geometric series
    (d, ctx) => {
      const ask = ['third', 'sum', 'area'][ctx.k % 3], turn = { ...ctx, k: Math.floor(ctx.k / 3) };
      const [[px, py, u, v, w], c] = pick(turn, `cc-chain-${ask}`, [RAYS, [1, 2, 3, 4]]);
      const L = Math.round(Math.hypot(px, py)), X = u * c, R = v * c, k = F(w - v, w + v), k2 = fm(k, k);
      const third = fm(F(R), k2), sum = fd(F(R), fs(F(1), k)), area = fd(F(R * R), fs(F(1), k2));
      const sine = F(v, w), wrongTwo = fm(sine, sine);
      let answer, tail;
      if (ask === 'third') {
        answer = choicesS(d, third, positive([fm(F(R), k), fm(third, k), fm(F(R), wrongTwo), fm(F(R), fm(fs(F(1), k), fs(F(1), k))), fm(fm(F(R), k), F(1, 2))]), showFrac);
        tail = `So the second circle has radius ${R}·${fr(k)}, and the third has radius ${R}·(${fr(k)})² = <b>${showFrac(third)}</b>.`;
      } else if (ask === 'sum') {
        answer = choicesS(d, sum, positive([fd(F(R), fs(F(1), k2)), fd(F(R), fa(F(1), k)), fm(F(R), fa(fa(F(1), k), k2)), fm(F(2), sum), fd(F(R), fs(F(1), sine))]), showFrac);
        tail = `The radii make a geometric series, ${R} + ${R}·${fr(k)} + ${R}·(${fr(k)})² + ⋯, whose sum is ${R} ÷ (1 − ${fr(k)}) = <b>${showFrac(sum)}</b>.`;
      } else {
        const correct = piOf(area), wrongs = [piOf(fd(F(R * R), fs(F(1), k))), piOf(fd(F(R * R), fm(fs(F(1), k), fs(F(1), k)))), piOf(fm(F(R * R), fa(F(1), k2))), piOf(fd(F(R * R), fs(F(1), wrongTwo))), piOf(fm(F(R * R), F(4, 3)))];
        answer = labelledS(d, correct, wrongs.filter((x, i) => wrongs.findIndex((y) => Math.abs(y[0] - x[0]) < 1e-9) === i && Math.abs(x[0] - correct[0]) > 1e-9));
        tail = `The areas make a geometric series too, with first term ${R * R}π and ratio (${fr(k)})² = ${fr(k2)}, so the total is ${R * R}π ÷ (1 − ${fr(k2)}) = <b>${correct[1]}</b>.`;
      }
      // the picture: the two rays, and the first circles of the chain
      const ray = [px / L, py / L], far = w * c * 1.12 + R, circles = range(0, 4).map((i) => { const t = c * fv(k) ** i; return [[u * t, v * t], v * t]; });
      const T = fit([[0, 0], [far, 0], [far * ray[0], far * ray[1]], [u * c, v * c + R], [u * c - R, v * c]], 380, 260, 26);
      return {
        topic: 'Circles squeezed into a corner', rank: ask === 'third' ? 21 : 22,
        text: `Two rays start at the origin O: the positive x-axis, and the ray through (${num(px)}, ${py}). A circle inside the angle between them touches both rays, and touches the x-axis at (${X}, 0). A second, smaller circle touches both rays and the first circle; a third touches both rays and the second; and so on forever, each one closer to O. ${{ third: 'What is the radius of the third circle?', sum: 'What is the sum of the radii of all the circles?', area: 'What is the total area of all the circles?' }[ask]}`,
        figure: svg(380, 260, 'Circles in a chain inside an angle', [seg(T([0, 0]), T([far, 0])), seg(T([0, 0]), T([far * ray[0], far * ray[1]])), ...circles.map(([o, rr], i) => ring(T(o), rr * T.s, i ? 'arc' : 'arc ext')), dot(T([X, 0])),
          label([T([0, 0])[0] - 12, T([0, 0])[1] + 6], 'O'), label([T([X, 0])[0], T([X, 0])[1] + 16], `(${X}, 0)`, 'ang', T([X, 0])[0] - T([0, 0])[0] < 40 ? 'start' : 'middle')]),
        answer,
        solution: `Every circle that touches both rays has its centre on the bisector of the angle. Adding the unit vectors along the rays, (1, 0) and (${num(px)}/${L}, ${py}/${L}), gives (${L + px}/${L}, ${py}/${L}), which points along (${u}, ${v}); so a centre is t(${u}, ${v}) for some t, the circle’s radius is its height ${v}t, and the centre is √(${u}² + ${v}²)·t = ${w}t from O. The first circle touches the x-axis right below its centre, so ${u}t = ${X}, t = ${c} and its radius is ${R}. Two neighbours touch, so their centres are r₁ + r₂ apart along the bisector: ${w}(t₁ − t₂) = ${v}(t₁ + t₂), which gives t₂ = ${fr(k)}·t₁. So each circle’s radius is ${fr(k)} of the one before. ${tail}`,
        check: () => {
          // the half-angle from the ray's direction; each next circle slid toward O until it touches the last; sum up
          const half = Math.atan2(py, px) / 2, sn = Math.sin(half);
          let rr = X * Math.tan(half), total = 0, squares = 0, list = [];
          for (let i = 0; i < 400 && rr > 1e-13; i++) {
            list.push(rr); total += rr; squares += rr * rr;
            const d1 = rr / sn, prev = rr;
            rr = solve((x) => (d1 - x / sn) - (prev + x), 0, prev);
          }
          return ask === 'third' ? near(list[2], fv(third), 'third radius') : ask === 'sum' ? near(total, fv(sum), 'sum of radii', 1e-7) : near(squares, fv(area), 'total area / π', 1e-7);
        },
      };
    },
    // a right angle (3 − 2√2), or a corner whose distance to the inscribed centre comes out whole
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'corner' : 'right', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      if (ask === 'right') {
        const [[a, b, c]] = pick(turn, 'cc-right', [RIGHT]), r = (a + b - c) / 2, correct = mix(3 * r, -2 * r, 2);
        const wrongs = [mix(-r, r, 2), mix(2 * r, -r, 2), mix(-r, r, 2, 2), mix(6 * r, -4 * r, 2), mix(3 * r, -2 * r, 2, 2), mix(17 * r, -12 * r, 2), mix(2 * r, -r, 3)];
        const C = [0, 0], A = [0, a], B = [b, 0], T = fit([A, B, C], 330, 290, 30), ctr = centre([A, B, C].map(T)), rho = correct[0];
        return {
          topic: 'Circles squeezed into a corner', rank: 21,
          text: `Right triangle ABC has its right angle at C, with AC = ${a}, BC = ${b} and AB = ${c}. A circle is inscribed in the triangle. A smaller circle sits in the corner at C, touching both legs and the inscribed circle. What is the radius of the smaller circle?`,
          figure: svg(330, 290, 'Right triangle ABC with its inscribed circle and a small circle in the corner at C', [poly([A, B, C].map(T)), corner(T(C), T(A), T(B), 9), ring(T([r, r]), r * T.s, 'arc'), ring(T([rho, rho]), rho * T.s, 'arc ext'),
            ...[[A, 'A'], [B, 'B'], [C, 'C']].map(([p, s]) => label(away(T(p), ctr, 14), s))]),
          answer: labelledS(d, correct, wrongs),
          solution: `In a right triangle the inscribed radius is r = (AC + BC − AB)/2, because the two tangents from C are both r long (with the radii they make a square in the corner) and the tangents from A and B make up AB. Here r = (${a} + ${b} − ${c})/2 = ${r}. Both circles have their centres on the bisector of the right angle at C, and a circle of radius x in that corner has its centre x from each leg, so x√2 from C (the diagonal of an x-by-x square). The circles touch, so their centres are r + ρ apart: r√2 − ρ√2 = r + ρ, which gives ρ = r(√2 − 1)/(√2 + 1) = r(√2 − 1)² = r(3 − 2√2). So ρ = ${r === 1 ? '' : r}(3 − 2√2) = <b>${correct[1]}</b>.`,
          check: () => {
            const { o, r: ri } = incircle(A, B, C), dir = unit(C, o), x = solve((t) => dist(along(C, dir, t), o) - ri - offLine(along(C, dir, t), C, B), 1e-9, dist(C, o) - ri);
            return near(offLine(along(C, dir, x), C, B), correct[0], 'corner radius');
          },
        };
      }
      const [[c0, b0, a0, k]] = pick(turn, 'cc-wedge', [WEDGE]), a = k * a0, b = k * b0, c = k * c0, s = (a + b + c) / 2;
      const K = Math.round(Math.sqrt(s * (s - a) * (s - b) * (s - c))), r = F(K, s), t = s - a, AI = sqrtF(fa(F(t * t), fm(r, r))), ans = fd(fm(r, fs(AI, r)), fa(AI, r));
      const wrongs = positive([r, fd(fm(r, fs(AI, r)), AI), fm(ans, fd(fs(AI, r), fa(AI, r))), fd(fs(AI, r), F(2)), fd(fm(r, r), AI), fm(F(2), ans), fd(ans, F(2)), fs(AI, r)]);
      const { A, B, C } = corners(a, b, c), T = fit([A, B, C], 380, 250, 26), ctr = centre([A, B, C].map(T)), { o } = incircle(A, B, C), rho = fv(ans), J = along(A, unit(A, o), (dist(A, o) * rho) / fv(r));
      return {
        topic: 'Circles squeezed into a corner', rank: 22,
        text: `The sides of triangle ABC are AB = ${c}, BC = ${a} and CA = ${b}. A circle is inscribed in it. A second circle, inside the angle at A, touches AB, AC and the inscribed circle. What is the radius of the second circle?`,
        figure: svg(380, 250, 'Triangle ABC with its inscribed circle and a small circle in the corner at A', [poly([A, B, C].map(T)), ring(T(o), fv(r) * T.s, 'arc'), ring(T(J), rho * T.s, 'arc ext'),
          ...[[A, 'A'], [B, 'B'], [C, 'C']].map(([p, nm]) => label(away(T(p), ctr, 14), nm))]),
        answer: choicesS(d, ans, wrongs, showFrac),
        solution: `Heron’s formula first: s = (${a} + ${b} + ${c})/2 = ${s}, and the area is √(${s}·${s - a}·${s - b}·${s - c}) = ${K}, so the inscribed radius is r = ${K}/${s} = ${fr(r)}. The two tangents from A to the inscribed circle are each s − BC = ${t} long, so its centre I is √(${t}² + ${r[1] === 1 ? r[0] : `(${fr(r)})`}²) = ${fr(AI)} from A. The second circle’s centre J is on AI too, and it is ρ from AB as I is r from AB, so by similar right triangles AJ = AI·ρ/r. The circles touch, so AI − AJ = r + ρ: AI − AI·ρ/r = r + ρ, which gives ρ = r(AI − r)/(AI + r). That is ${fr(r)}·(${fr(AI)} − ${fr(r)}) ÷ (${fr(AI)} + ${fr(r)}) = <b>${showFrac(ans)}</b>.`,
        check: () => {
          const { o: oo, r: ri } = incircle(A, B, C), dir = unit(A, oo), x = solve((tt) => dist(along(A, dir, tt), oo) - ri - offLine(along(A, dir, tt), A, B), 1e-9, dist(A, oo) - ri);
          return near(offLine(along(A, dir, x), A, B), fv(ans), 'corner radius');
        },
      };
    },
    // the same idea in space: a ball in the corner of a cube, of a regular tetrahedron, or above another in a pyramid
    (d, ctx) => {
      const ask = ['cube', 'tetra', 'pyramid'][ctx.k % 3], turn = { ...ctx, k: Math.floor(ctx.k / 3) };
      if (ask === 'cube') {
        const [R] = pick(turn, 'cc-cube', [[1, 2, 3, 4, 5, 6, 7, 8]]), correct = mix(2 * R, -R, 3);
        return {
          topic: 'Circles squeezed into a corner', rank: 21,
          text: `A ball fits snugly in a cube-shaped box with edges ${2 * R} long, touching all six faces. A smaller ball is wedged into one corner of the box, touching the three faces there and the big ball. What is the radius of the smaller ball?`,
          answer: labelledS(d, correct, [mix(-R, R, 3), mix(3 * R, -2 * R, 2), mix(-R, R, 3, 2), mix(-R, R, 2), mix(4 * R, -2 * R, 3), mix(7 * R, -4 * R, 3), mix(2 * R, -R, 3, 2)]),
          solution: `Both centres lie on the long diagonal from that corner. Put the corner at the origin: the big ball has radius ${R} and centre (${R}, ${R}, ${R}), which is ${R}√3 from the corner. The small ball, of radius ρ, touches the three faces, so its centre is (ρ, ρ, ρ), ρ√3 from the corner. They touch, so their centres are ${R} + ρ apart: ${R}√3 − ρ√3 = ${R} + ρ, which gives ρ = ${R}(√3 − 1)/(√3 + 1) = ${R}(√3 − 1)²/2 = <b>${correct[1]}</b>.`,
          check: () => { const t = solve((x) => Math.sqrt(3) * (R - x) - R - x, 0, R); return near(t, correct[0], 'small radius'); },
        };
      }
      if (ask === 'tetra') {
        const [e] = pick(turn, 'cc-tetra', [[4, 6, 8, 12, 24, 3]]), correct = fracSurd(e, 24, 6);
        return {
          topic: 'Circles squeezed into a corner', rank: 22,
          text: `A ball sits inside a regular tetrahedron (four equilateral triangles for faces) with edges ${e} long, touching all four faces. A smaller ball is wedged into one corner, touching the three faces that meet there and the first ball. What is the radius of the smaller ball?`,
          answer: labelledS(d, correct, [fracSurd(e, 12, 6), fracSurd(e, 36, 6), fracSurd(e, 48, 6), fracSurd(e, 6, 3), fracSurd(e, 18, 6)]),
          solution: `Look along the height from that corner V to the centre of the opposite face, where both centres lie. The height of a regular tetrahedron with edge ${e} is ${fracSurd(e, 3, 6)[1]}: the centre of a face is ${fracSurd(e, 3, 3)[1]} from each of its corners, and then Pythagoras. The big ball’s centre is the same distance r from all four faces, so the tetrahedron splits into four pyramids of height r on the faces, and r is a quarter of the height: r = ${fracSurd(e, 12, 6)[1]}, with the centre 3r from V. Any ball touching the three faces at V has its radius in the same ratio to its centre’s distance from V, r : 3r = 1 : 3, so a ball of radius ρ there has its centre 3ρ from V. The balls touch, so 3r − 3ρ = r + ρ, which gives ρ = r/2 = <b>${correct[1]}</b>.`,
          check: () => {
            // a regular tetrahedron around the origin, its inscribed ball, and a ball slid from V toward the centre
            const sc = e / (2 * Math.SQRT2), V = [1, 1, 1].map((x) => x * sc), W1 = [1, -1, -1].map((x) => x * sc), W2 = [-1, 1, -1].map((x) => x * sc), W3 = [-1, -1, 1].map((x) => x * sc);
            const rin = toPlane([0, 0, 0], W1, W2, W3), cAt = (t) => V.map((x) => x * (1 - t)), rad = (t) => toPlane(cAt(t), V, W1, W2);
            const t = solve((tt) => Math.hypot(...cAt(tt)) - rin - rad(tt), 1e-9, 1 - 1e-9);
            return near(rad(t), correct[0], 'small radius') || near(rin, fracSurd(e, 12, 6)[0], 'inscribed radius');
          },
        };
      }
      const [[a, h, l]] = pick(turn, 'cc-pyramid', [PYRAMIDS]), r = F(a * h, a + l), top = fs(F(h), fm(F(2), r)), ans = fm(r, fd(top, F(h)));
      return {
        topic: 'Circles squeezed into a corner', rank: 23,
        text: `A pyramid has a square base with sides ${2 * a} long and its top directly above the centre of the base, and each of its four triangular faces has area ${a * l}. A ball inside the pyramid touches the base and all four triangular faces. A smaller ball above it touches the four triangular faces and the first ball. What is the radius of the smaller ball?`,
        answer: choicesS(d, ans, positive([r, fm(r, fd(fs(F(h), r), F(h))), fd(top, F(2)), fm(ans, fd(top, F(h))), fm(r, F(a, l)), top, fm(F(2), ans), fm(r, F(l - a, l))]), showFrac),
        solution: `Each triangular face has base ${2 * a} and area ${a * l}, so its height (the slant height of the pyramid) is ${2 * a * l} ÷ ${2 * a} = ${l}, and the pyramid’s height is √(${l}² − ${a}²) = ${h}. Cut the pyramid through its top and the midpoints of two opposite base edges: the cut is an isosceles triangle with base ${2 * a}, equal sides ${l} and height ${h}, and it goes through both balls’ centres, so it shows them as circles touching its sides. The first is that triangle’s inscribed circle, radius area ÷ semi-perimeter = ${a * h} ÷ ${a + l} = ${fr(r)}. The plane touching the top of the first ball, parallel to the base, is ${fr(fm(F(2), r))} up, so it cuts off a smaller pyramid of height ${fr(top)}, similar to the whole and scaled by ${fr(top)} ÷ ${h}; the smaller ball is that pyramid’s first ball, and it touches the big one where both touch the plane. So its radius is ${fr(fd(top, F(h)))}·${fr(r)} = <b>${showFrac(ans)}</b>.`,
        check: () => {
          // in space: the pyramid's faces, the first ball resting on the base, the second slid down the axis onto it
          const apex = [0, 0, h], B1 = [a, -a, 0], B2 = [a, a, 0], face = (z) => toPlane([0, 0, z], apex, B1, B2);
          const z1 = solve((z) => face(z) - z, 1e-9, h - 1e-9), z2 = solve((z) => z - z1 - z1 - face(z), 2 * z1 + 1e-12, h - 1e-12);
          return near(z1, fv(r), 'first ball') || near(face(z2), fv(ans), 'second ball');
        },
      };
    },
  ],

  'Belts and common tangents': [
    // a belt round two wheels: slide a straight part to make a right triangle; here it is 30-60-90, so the arcs are
    // two thirds and one third of each wheel (or two thirds of both, crossed)
    (d, ctx) => {
      const crossed = ctx.k % 2 === 1, turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[R, r]] = pick(turn, crossed ? 'bt-crossed' : 'bt-open', [crossed ? CROSSED : OPEN]), dd = crossed ? 2 * (R + r) : 2 * (R - r);
      const read = (sq, x) => [sq * Math.sqrt(3) + fv(x) * Math.PI, `${sq === 1 ? '' : num(sq)}√3 + ${piText(x)}`];
      const coef = crossed ? F(4 * (R + r), 3) : F(4 * R + 2 * r, 3), correct = read(dd, coef);
      const wrongs = crossed
        ? [read(dd, F(R + r)), read(dd, F(4 * R + 2 * r, 3)), [2 * dd + fv(coef) * Math.PI, `${2 * dd} + ${piText(coef)}`], read(dd / 2, coef), read(dd, F(2 * (R + r))), read(2 * dd, coef), [dd + fv(coef) * Math.PI, `${dd} + ${piText(coef)}`]]
        : [read(dd, F(R + r)), read(dd, F(2 * R + 4 * r, 3)), [2 * dd + fv(coef) * Math.PI, `${2 * dd} + ${piText(coef)}`], read(dd / 2, coef), read(dd, F(4 * (R + r), 3)), read(2 * dd, coef), read(dd, F(2 * (R + r))), [dd + fv(coef) * Math.PI, `${dd} + ${piText(coef)}`]];
      // the picture: the belt's straight parts touch at R·n and the small wheel at O2 ± r·n, n at 30° to the upright
      const O1 = [0, 0], O2 = [dd, 0], sn = crossed ? (R + r) / dd : (R - r) / dd, cs = Math.sqrt(1 - sn * sn), up = [sn, cs], dn = [sn, -cs];
      const P1 = along(O1, up, R), Q1 = along(O1, dn, R), P2 = along(O2, up, crossed ? -r : r), Q2 = along(O2, dn, crossed ? -r : r), ang = (p, o) => Math.atan2(p[1] - o[1], p[0] - o[0]);
      const belt = [...arcPts(O1, R, ang(Q1, O1), ang(P1, O1), Math.PI), ...arcPts(O2, r, ang(P2, O2), ang(Q2, O2), 0), Q1];
      const T = fit([[-R, -R], [-R, R], [dd + r, r], [dd + r, -r]], 380, 230, 22);
      const both = R === r ? `each with radius ${R}` : `with radii ${R} and ${r}`;
      return {
        topic: 'Belts and common tangents', rank: 21,
        text: `Two wheels, ${both}, have their centres ${dd} apart. A tight belt goes around both wheels${crossed ? ' and crosses itself between them, like a figure 8' : ' without crossing itself'}. How long is the belt?`,
        figure: svg(380, 230, crossed ? 'A crossed belt around two wheels' : 'A belt around two wheels', [seg(T(O1), T(O2), 'side dash'), ring(T(O1), R * T.s), ring(T(O2), r * T.s), curve(belt.map(T)), dot(T(O1)), dot(T(O2))]),
        answer: labelledS(d, correct, wrongs),
        solution: crossed
          ? `Each straight part of the belt runs between the wheels, touching them on opposite sides. Slide it sideways by ${r} toward the small wheel’s centre: it then runs from that centre and touches a circle of radius ${R} + ${r} = ${R + r} around the other centre, so it is a leg of a right triangle with hypotenuse ${dd} and other leg ${R + r}, exactly half of ${dd}. That is a 30-60-90 triangle, so each straight part is ${dd}·√3/2 and the two together are ${dd}√3, each at 30° to the line of centres. The radii to the points of contact are perpendicular to the straight parts, so the belt wraps 180° + 60° = 240° of each wheel, two thirds of it: ${frac(2, 3)}·2π·${R} + ${frac(2, 3)}·2π·${r} = ${piText(coef)}. So the belt is <b>${correct[1]}</b> long.`
          : `Each straight part of the belt touches both wheels on the same side. Slide it sideways by ${r} toward the small wheel’s centre: it then runs from that centre and touches a circle of radius ${R} − ${r} = ${R - r} around the big wheel’s centre, so it is a leg of a right triangle with hypotenuse ${dd} and other leg ${R - r}, exactly half of ${dd}. That is a 30-60-90 triangle, so each straight part is ${dd}·√3/2 and the two together are ${dd}√3, each at 30° to the line of centres. The radii to the points of contact are perpendicular to the straight parts, so the belt wraps 180° + 60° = 240° of the big wheel and 180° − 60° = 120° of the small one: ${frac(2, 3)}·2π·${R} + ${frac(1, 3)}·2π·${r} = ${piText(coef)}. So the belt is <b>${correct[1]}</b> long.`,
        check: () => {
          // walk round the belt: the straight parts between the points of contact, and each arc from the angles
          const sweep = (o, p, q, via) => { const a0 = ang(p, o), a1 = ang(q, o), t = (x) => ((x % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), ccw = t(a1 - a0); return t(via - a0) < ccw ? ccw : 2 * Math.PI - ccw; };
          const len = dist(P1, P2) + dist(Q1, Q2) + R * sweep(O1, Q1, P1, Math.PI) + r * sweep(O2, P2, Q2, 0);
          return near(Math.abs(offLine(O2, P1, P2) - r) + Math.abs(offLine(O1, P1, P2) - R), 0, 'tangent') || near(len, correct[0], 'belt');
        },
      };
    },
    // the inner tangent between the two outer ones is exactly as long as an outer tangent: equal tangents, added twice
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'centres' : 'XY', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[dd, R, r, L]] = pick(turn, `ct-xy-${ask}`, [APART]), inner = dd * dd - (R + r) ** 2;
      const correct = ask === 'XY' ? [L, num(L)] : [dd, num(dd)];
      const wrongs = ask === 'XY'
        ? [fracSurd(1, 1, inner), [dd, num(dd)], mix(L, 1, inner, 2), fracSurd(1, 1, dd * dd - R * R - r * r), fracSurd(2, 1, R * r), [L + R - r, num(L + R - r)]]
        : [fracSurd(1, 1, L * L + (R + r) ** 2), [L + R - r, num(L + R - r)], fracSurd(1, 1, L * L + R * R + r * r), [L, num(L)], [L + R + r, num(L + R + r)]];
      // the picture: centres on the x-axis, the outer tangents m·p = R, the inner one n·p = R
      const O2 = [dd, 0], sm = (R - r) / dd, sn = (R + r) / dd, m1 = [sm, Math.sqrt(1 - sm * sm)], m2 = [sm, -Math.sqrt(1 - sm * sm)], nn = [sn, Math.sqrt(1 - sn * sn)];
      const cut = (u, v) => { const den = u[0] * v[1] - u[1] * v[0]; return [(R * v[1] - u[1] * R) / den, (u[0] * R - R * v[0]) / den]; };
      const X = cut(nn, m1), Y = cut(nn, m2), P = along([0, 0], m1, R), Q = along(O2, m1, r), P2 = along([0, 0], m2, R), Q2 = along(O2, m2, r);
      const T = fit([[-R, -R], [-R, R], [dd + r, r], [dd + r, -r], X, Y], 380, 240, 24), ext = (a, b) => [along(a, unit(b, a), 18), along(b, unit(a, b), 18)];
      const ctrPic = T([dd / 2, 0]);
      return {
        topic: 'Belts and common tangents', rank: ask === 'XY' ? 23 : 22,
        text: ask === 'XY'
          ? `Two circles, with radii ${R} and ${r}, have their centres ${dd} apart. Their two outer common tangents are drawn, and one inner common tangent (the kind that passes between the circles). The inner tangent meets the outer tangents at X and Y. How long is XY?`
          : `Two circles have radii ${R} and ${r} and lie outside each other. Their two outer common tangents are drawn, and one inner common tangent, which passes between the circles and meets the outer tangents at X and Y. If XY = ${L}, how far apart are the centres of the circles?`,
        figure: svg(380, 240, 'Two circles with their outer common tangents and an inner common tangent', [ring(T([0, 0]), R * T.s), ring(T(O2), r * T.s), seg(...ext(T(P), T(Q))), seg(...ext(T(P2), T(Q2))), seg(T(X), T(Y), 'seg'), dot(T(X)), dot(T(Y)),
          label(away(T(X), ctrPic, 14), 'X'), label(away(T(Y), ctrPic, 14), 'Y')]),
        answer: labelledS(d, correct, wrongs),
        solution: `Name the points of contact: the outer tangent through X touches the circles at P and Q, the other outer tangent (through Y) touches them at P′ and Q′, and the inner tangent touches them at S and T, so that S and T lie between X and Y. The two tangents from one point to a circle are equally long, so XS = XP, XT = XQ, YS = YP′ and YT = YQ′. Then XY = XS + SY = XP + YP′, and also XY = XT + TY = XQ + YQ′. Adding these, 2XY = (XP + XQ) + (YP′ + YQ′) = PQ + P′Q′ = 2PQ, so XY is exactly as long as an outer tangent, PQ. ` +
          (ask === 'XY'
            ? `Slide PQ sideways by ${r} toward the centres: it becomes a leg of a right triangle with hypotenuse ${dd} (the centres) and other leg ${R} − ${r} = ${R - r}, so XY = PQ = √(${dd}² − ${R - r}²) = <b>${num(L)}</b>.`
            : `Slide PQ sideways by ${r} toward the centres: it becomes a leg of a right triangle whose other leg is ${R} − ${r} = ${R - r} and whose hypotenuse joins the centres. So the centres are √(${L}² + ${R - r}²) = <b>${num(dd)}</b> apart.`),
        check: () => {
          const tangent = [[P, Q], [P2, Q2]].every(([u, v]) => Math.abs(offLine([0, 0], u, v) - R) < 1e-9 && Math.abs(offLine(O2, u, v) - r) < 1e-9) && Math.abs(offLine([0, 0], X, Y) - R) < 1e-9 && Math.abs(offLine(O2, X, Y) - r) < 1e-9;
          return (tangent ? '' : 'not tangent') || near(dist(X, Y), L, 'XY');
        },
      };
    },
    // two circles crossing: the line through A parallel to the centres is twice the distance between them
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'area' : 'PQ', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[h, x1, x2]] = pick(turn, `ct-chord-${ask}`, [CHORDS]), R = Math.round(Math.hypot(h, x1)), r = Math.round(Math.hypot(h, x2)), dd = x1 + x2;
      const ans = ask === 'PQ' ? F(2 * dd) : F(2 * dd * h);
      const wrongs = ask === 'PQ' ? positive([F(dd), F(2 * (R + r)), F(R + r), F(2 * dd + 2 * h), F(4 * h), F(4 * dd), F(dd + h)]) : positive([F(4 * dd * h), F(dd * h), F(2 * (R + r) * h), F((R + r) * h), F(2 * dd * h + 2 * h * h), F(3 * dd * h), F(dd * h + h * h)]);
      const O1 = [-x1, 0], O2 = [x2, 0], A = [0, h], B = [0, -h], P = [-2 * x1, h], Q = [2 * x2, h], T = fit([[-x1 - R, -R], [x2 + r, r], [-x1 - R, R], [x2 + r, -r]], 380, 250, 24);
      return {
        topic: 'Belts and common tangents', rank: ask === 'PQ' ? 20 : 21,
        text: `Two circles, with radii ${R} and ${r}, cross at A and B, where AB = ${2 * h}, and their centres are on opposite sides of line AB. The line through A parallel to the line joining the centres meets the circles again at P and Q. ${ask === 'PQ' ? 'How long is PQ?' : 'What is the area of triangle PBQ?'}`,
        figure: svg(380, 250, 'Two crossing circles, their common chord AB and the line PQ through A', [ask === 'area' ? poly([P, B, Q].map(T)) : seg(T(O1), T(O2), 'side dash'), ring(T(O1), R * T.s), ring(T(O2), r * T.s), seg(T(A), T(B), 'seg'), seg(T(P), T(Q), 'seg'), seg(T(O1), T(O2), 'side dash'), dot(T(O1)), dot(T(O2)),
          label([T(A)[0] + 9, T(A)[1] - 12], 'A'), label([T(B)[0] + 10, T(B)[1] + 14], 'B'), label([T(P)[0] - 12, T(P)[1] - 8], 'P'), label([T(Q)[0] + 12, T(Q)[1] - 8], 'Q')]),
        answer: choicesS(d, ans, wrongs, showFrac),
        solution: `The line of centres O₁O₂ is the perpendicular bisector of the common chord AB, so it crosses AB at its midpoint M, with AM = ${h}. By Pythagoras in the right triangles O₁MA and O₂MA, O₁M = √(${R}² − ${h}²) = ${x1} and O₂M = √(${r}² − ${h}²) = ${x2}, so O₁O₂ = ${x1} + ${x2} = ${dd}. Drop perpendiculars from O₁ and O₂ to line PQ, meeting it at K and L: a perpendicular from a centre cuts a chord in half, so K is the midpoint of PA and L is the midpoint of AQ. Then PQ = PA + AQ = 2KA + 2AL = 2KL, and KL = O₁O₂ because O₁O₂LK is a rectangle. ` +
          (ask === 'PQ' ? `So PQ = 2·${dd} = <b>${num(2 * dd)}</b>.` : `So PQ = 2·${dd} = ${2 * dd}, and since AB is perpendicular to PQ, B is ${2 * h} from line PQ: triangle PBQ has area ½·${2 * dd}·${2 * h} = <b>${num(2 * dd * h)}</b>.`),
        check: () => {
          // the circles from their radii and the chord, then the line through A hits each again
          const c1 = [-Math.sqrt(R * R - h * h), 0], c2 = [Math.sqrt(r * r - h * h), 0];
          const other = (c, rr) => { const half = Math.sqrt(rr * rr - h * h), xs = [c[0] - half, c[0] + half]; return [Math.abs(xs[0]) > Math.abs(xs[1]) ? xs[0] : xs[1], h]; };
          const p = other(c1, R), q = other(c2, r);
          const ok = Math.abs(dist(p, c1) - R) < 1e-9 && Math.abs(dist(q, c2) - r) < 1e-9 && Math.abs(dist(A, c1) - R) < 1e-9;
          return (ok ? '' : 'not on the circles') || near(ask === 'PQ' ? dist(p, q) : shoelace([p, B, q]), fv(ans), ask);
        },
      };
    },
  ],

  'Folding paper': [
    // corner onto corner: the crease is the perpendicular bisector of the diagonal
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'shape' : 'crease', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[w, h]] = pick(turn, `fp-sheet-${ask}`, [SHEETS]), x = F(w * w + h * h, 2 * w), nn = w * w + h * h;
      const A = [0, 0], B = [w, 0], C = [w, h], D = [0, h], E = [fv(x), 0], Fp = [w - fv(x), h], T = fit([A, B, C, D], 360, 250, 30), ctr = T([w / 2, h / 2]);
      const picture = svg(360, 250, 'Rectangle ABCD with the crease EF', [poly([A, B, C, D].map(T)), seg(T(A), T(C), 'side dash'), seg(T(E), T(Fp), 'seg'),
        ...[[A, 'A'], [B, 'B'], [C, 'C'], [D, 'D'], [E, 'E'], [Fp, 'F']].map(([p, s]) => label(away(T(p), ctr, 14), s))]);
      const start = `The fold puts A on C, so every point of the crease is as far from A as from C: the crease is the perpendicular bisector of the diagonal AC, through the centre of the rectangle. Let it meet AB at E and CD at F, and write EA = EC = x. Then EB = ${w} − x, and in right triangle EBC, x² = (${w} − x)² + ${h}², which gives x = (${w}² + ${h}²)/(2·${w}) = ${fr(x)}.`;
      if (ask === 'crease') {
        const correct = fracSurd(h, w, nn);
        return {
          topic: 'Folding paper', rank: 19,
          text: `A rectangular sheet of paper ABCD has AB = ${w} and BC = ${h}. It is folded flat so that corner A lands exactly on corner C. How long is the crease?`,
          figure: picture,
          answer: labelledS(d, correct, [fracSurd(1, 1, nn), fracSurd(1, 2, nn), fracSurd(w, h, nn), flf(x), fracSurd(h, 2 * w, nn), [h, num(h)], flf(fs(F(w), x)), fracSurd(h, w + h, nn)]),
          solution: `${start} The crease EF and the diagonal cross at the centre O at right angles, so triangle AOE is a right triangle similar to triangle ABC (they share the angle at A): OE ÷ AO = BC ÷ AB = ${h}/${w}. AO is half of AC = √(${w}² + ${h}²), and EF = 2·OE, so EF = AC·${h}/${w} = √(${w}² + ${h}²)·${h}/${w} = <b>${correct[1]}</b>.`,
          check: () => { const O = [w / 2, h / 2], n = [-h, w], e = meet([O, [O[0] + n[0], O[1] + n[1]]], [A, B]), f = meet([O, [O[0] + n[0], O[1] + n[1]]], [D, C]); return near(dist(e, f), correct[0], 'crease'); },
        };
      }
      const ans = F(h * (3 * w * w - h * h), 4 * w), overlap = fm(F(h, 2), x);
      return {
        topic: 'Folding paper', rank: 20,
        text: `A rectangular sheet of paper ABCD has AB = ${w} and BC = ${h}. It is folded flat so that corner A lands exactly on corner C. What is the area of the folded shape, the part of the table it covers?`,
        figure: picture,
        answer: choicesS(d, ans, positive([F(w * h, 2), fs(F(w * h), fm(F(h), x)), fm(fs(F(w), x), F(h)), fs(F(w * h), fm(F(w, 2), x)), fs(F(w * h), fm(F(h, 2), fs(F(w), x))), F(w * h), fs(F(w * h), fm(F(h, 4), x))]), showFrac),
        solution: `${start} The rectangle looks the same after a half turn about its centre, which swaps A with C and E with F, so FC = EA = x too. After the fold, the flap AEFD lies on top of the part EBCF, and the two layers overlap in triangle ECF. So the folded shape covers the whole sheet less one copy of that overlap: ${w * h} − ½·FC·BC = ${w * h} − ½·${fr(x)}·${h} = ${w * h} − ${fr(overlap)} = <b>${showFrac(ans)}</b>.`,
        check: () => {
          // fold AEFD over the crease and see how much of it lands on the sheet
          const flap = [A, E, Fp, D].map((p) => reflect(p, E, Fp)), on = [(p) => p[0], (p) => w - p[0], (p) => p[1], (p) => h - p[1]].reduce((P, f) => clip(P, f), flap);
          return near(w * h - shoelace(on), fv(ans), 'folded shape') || near(dist(reflect(A, E, Fp), C), 0, 'A onto C');
        },
      };
    },
    // corner A onto a point P of the far side: the crease's right angle at P makes the little triangle at C similar to
    // the one at D (and its perimeter is always half the square's)
    (d, ctx) => {
      const ask = ['CE', 'area', 'perimeter'][ctx.k % 3], turn = { ...ctx, k: Math.floor(ctx.k / 3) };
      const [[s, x]] = pick(turn, `fp-square-${ask}`, [SQUARE_FOLDS]);
      const DQ = F(s * s - x * x, 2 * s), QP = F(s * s + x * x, 2 * s), PC = F(s - x), scale = fd(PC, DQ), CE = fm(F(x), scale), PE = fm(QP, scale), area = fm(F(1, 2), fm(PC, CE)), per = fa(fa(PC, CE), PE);
      const wrongCE = fm(PC, fd(DQ, F(x)));   // pairing the legs the wrong way round
      const ans = { CE, area, perimeter: per }[ask];
      const wrongs = {
        CE: [F(x), DQ, QP, PC, wrongCE],
        area: [fm(F(1, 2), fm(F(x), DQ)), fm(F(1, 2), fm(PC, wrongCE)), fm(F(1, 2), fm(PC, F(x))), fm(F(1, 2), fm(PC, DQ)), fm(F(1, 2), fm(PC, PC))],
        perimeter: [F(s + x), F(2 * s - x), F(3 * s, 2), fa(fa(PC, wrongCE), fm(PC, fd(QP, F(x)))), F(2 * s + x)],
      }[ask];
      // the picture: the square, the folded flap Q P B′ R, and E
      const A = [0, 0], B = [s, 0], C = [s, s], D = [0, s], P = [x, s], Q = [0, fv(fs(F(s), DQ))], Rr = [s, (s - x) ** 2 / (2 * s)], B2 = reflect(B, Q, Rr), E = [s, s - fv(CE)];
      const T = fit([A, B, C, D, B2], 320, 300, 30), ctr = T([s / 2, s / 2]);
      return {
        topic: 'Folding paper', rank: ask === 'CE' ? 21 : 22,
        text: `A square sheet of paper ABCD has sides ${s} long, with A, B, C and D in order around it. It is folded flat so that corner A lands on the point P of side CD with DP = ${x}. After the fold, the edge that was AB runs from P across side BC, crossing it at E. ${{ CE: 'How long is CE?', area: 'What is the area of triangle PCE?', perimeter: 'What is the perimeter of triangle PCE?' }[ask]}`,
        figure: svg(320, 300, 'A square folded so that corner A lands on side CD', [poly([Q, P, B2, Rr].map(T)), poly([A, B, C, D].map(T)), seg(T(Q), T(Rr), 'seg dash'), seg(T(P), T(B2), 'seg'), seg(T(B2), T(Rr), 'seg'),
          ...[[A, 'A'], [B, 'B'], [C, 'C'], [D, 'D']].map(([p, nm]) => label(away(T(p), ctr, 14), nm)), label([T(P)[0], T(P)[1] - 12], 'P'), label([T(E)[0] + 13, T(E)[1]], 'E'), label([T(Q)[0] - 13, T(Q)[1]], 'Q'), label(away(T(B2), ctr, 14), 'B′')]),
        answer: choicesS(d, ans, positive(wrongs), showFrac),
        solution: `The crease is the perpendicular bisector of AP; let it meet AD at Q, so QP = QA. Writing QA = y, triangle QDP has a right angle at D, with DQ = ${s} − y and DP = ${x}, so y² = (${s} − y)² + ${x}², which gives y = (${s}² + ${x}²)/(2·${s}) = ${fr(QP)} and DQ = ${fr(DQ)}. The fold keeps the right angle at A, so the angle QPE (the image of angle QAB) is 90°. Then ∠CPE = 90° − ∠DPQ = ∠DQP, so triangles QDP and PCE are similar, with the right angles at D and C and PC = ${s} − ${x} = ${s - x} matching DQ. The scale factor is ${s - x} ÷ ${fr(DQ)} = ${fr(scale)}, so CE = DP·${fr(scale)} = ${fr(CE)} and PE = QP·${fr(scale)} = ${fr(PE)}. ` +
          { CE: `So CE = <b>${showFrac(CE)}</b>.`, area: `So triangle PCE has area ½·${s - x}·${fr(CE)} = <b>${showFrac(area)}</b>.`, perimeter: `So the perimeter of triangle PCE is ${s - x} + ${fr(CE)} + ${fr(PE)} = <b>${showFrac(per)}</b>, half the perimeter of the square.` }[ask],
        check: () => {
          // fold B over the crease (the perpendicular bisector of AP) and follow the folded edge to BC
          const M = mid(A, P), dir = [-(P[1] - A[1]), P[0] - A[0]], b2 = reflect(B, M, [M[0] + dir[0], M[1] + dir[1]]), e = meet([P, b2], [B, C]);
          const got = { CE: dist(C, e), area: shoelace([P, C, e]), perimeter: dist(P, C) + dist(C, e) + dist(e, P) }[ask];
          return near(dist(reflect(A, M, [M[0] + dir[0], M[1] + dir[1]]), P), 0, 'A onto P') || near(got, fv(ans), ask);
        },
      };
    },
    // an equilateral triangle folded so A lands on BC: the law of cosines with 60° in each corner triangle
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'flap' : 'crease', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[p, q]] = pick(turn, `fp-triangle-${ask}`, [TRIANGLE_FOLDS]), s = p + q;
      const u = F(s * s - s * p + p * p, 2 * s - p), v = F(s * s - s * q + q * q, 2 * s - q), uv = fm(u, v), MN2 = fs(fa(fm(u, u), fm(v, v)), uv);
      const correct = ask === 'crease' ? rootF(MN2) : fracSurd(uv[0], 4 * uv[1], 3);
      const wrongs = ask === 'crease'
        ? [rootF(fa(fm(u, u), fm(v, v))), rootF(fa(fa(fm(u, u), fm(v, v)), uv)), rootF(F(s * s - s * p + p * p)), rootF(F(s * s - s * p + p * p, 4)), flf(fd(fa(u, v), F(2))), fl(s, 2), flf(F(Math.abs(u[0] * v[1] - v[0] * u[1]), u[1] * v[1]))]
        : [fracSurd(uv[0], 2 * uv[1], 3), fracSurd(u[0] * u[0], 4 * u[1] * u[1], 3), fracSurd(v[0] * v[0], 4 * v[1] * v[1], 3), flf(fd(uv, F(2))), fracSurd(s * s, 16, 3), fracSurd(uv[0], 8 * uv[1], 3), fracSurd(s * s, 8, 3)];
      const B = [0, 0], C = [s, 0], A = [s / 2, (s * Math.sqrt(3)) / 2], A2 = [p, 0], M = along(A, unit(A, B), fv(u)), N = along(A, unit(A, C), fv(v));
      const T = fit([A, B, C], 340, 280, 30), ctr = centre([A, B, C].map(T));
      return {
        topic: 'Folding paper', rank: ask === 'crease' ? 23 : 22,
        text: `An equilateral triangle ABC is cut from paper, with sides ${s} long. It is folded flat along a line from M on AB to N on AC, so that corner A lands on the point A′ of side BC with BA′ = ${p}. ${ask === 'crease' ? 'How long is the crease MN?' : 'What is the area of triangle A′MN, the flap that was folded over?'}`,
        figure: svg(340, 280, 'Equilateral triangle ABC folded so that A lands on BC', [poly([A2, M, N].map(T)), poly([A, B, C].map(T)), seg(T(M), T(N), 'seg dash'), seg(T(M), T(A2), 'seg'), seg(T(N), T(A2), 'seg'),
          ...[[A, 'A'], [B, 'B'], [C, 'C']].map(([pp, nm]) => label(away(T(pp), ctr, 14), nm)), label([T(A2)[0], T(A2)[1] + 18], 'A′'), label([T(M)[0] - 14, T(M)[1]], 'M'), label([T(N)[0] + 14, T(N)[1]], 'N')]),
        answer: labelledS(d, correct, wrongs),
        solution: `The fold takes A to A′, so MA′ = MA and NA′ = NA. Write AM = u: then MB = ${s} − u, and in triangle MBA′ the angle at B is 60°, so by the law of cosines u² = (${s} − u)² + ${p}² − (${s} − u)·${p}. The u² cancels, leaving u(2·${s} − ${p}) = ${s}² − ${s}·${p} + ${p}², so u = ${fr(u)}. In the same way, with AN = v and A′C = ${q}, v = (${s}² − ${s}·${q} + ${q}²)/(2·${s} − ${q}) = ${fr(v)}. ` +
          (ask === 'crease'
            ? `Triangle AMN has a 60° angle at A, so MN² = u² + v² − uv = ${fr(MN2)}, and MN = <b>${correct[1]}</b>.`
            : `The flap A′MN is a copy of triangle AMN, which has a 60° angle at A, so its area is ½·u·v·sin 60° = (√3/4)·${fr(u)}·${fr(v)} = <b>${correct[1]}</b>.`),
        check: () => {
          // find M on AB and N on AC as far from A′ as from A, by bisection
          const m = solve((t) => dist(along(A, unit(A, B), t), A2) - t, 1e-9, s), n = solve((t) => dist(along(A, unit(A, C), t), A2) - t, 1e-9, s);
          const Mm = along(A, unit(A, B), m), Nn = along(A, unit(A, C), n);
          return near(ask === 'crease' ? dist(Mm, Nn) : shoelace([A2, Mm, Nn]), correct[0], ask);
        },
      };
    },
  ],

  'Tilted equilateral triangles': [
    // in a square from a corner: symmetry makes the corner triangle right isosceles (or the angles 15°, 60°, 15°)
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'square' : 'corner', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [n] = pick(turn, `te-square-${ask}`, [ask === 'corner' ? [2, 3, 4, 5, 6, 7, 8, 9, 10] : [2, 4, 6, 8, 10, 12, 14]]);
      const s = ask === 'corner' ? n : (n * (Math.SQRT2 + Math.sqrt(6))) / 4, e = s * (2 - Math.sqrt(3));
      const A = [0, 0], B = [s, 0], C = [s, s], D = [0, s], E = [s, e], Fq = [e, s], T = fit([A, B, C, D], 300, 300, 32), ctr = T([s / 2, s / 2]);
      const picture = svg(300, 300, 'Equilateral triangle AEF inside square ABCD', [poly((ask === 'corner' ? [E, C, Fq] : [A, E, Fq]).map(T)), poly([A, B, C, D].map(T)), curve([A, E, Fq, A].map(T)),
        ...[[A, 'A'], [B, 'B'], [C, 'C'], [D, 'D'], [E, 'E'], [Fq, 'F']].map(([p, nm]) => label(away(T(p), ctr, 14), nm))]);
      if (ask === 'corner') {
        const correct = mix(2 * s * s, -s * s, 3);
        return {
          topic: 'Tilted equilateral triangles', rank: 20,
          text: `Square ABCD has sides ${s} long. Point E is on side BC and point F is on side CD, placed so that triangle AEF is equilateral. What is the area of triangle ECF?`,
          figure: picture,
          answer: labelledS(d, correct, [mix(-3 * s * s, 2 * s * s, 3), mix(2 * s * s, -s * s, 3, 2), mix(4 * s * s, -2 * s * s, 3), mix(0, s * s, 3, 4), mix(-s * s, s * s, 3, 2), mix(7 * s * s, -4 * s * s, 3), mix(3 * s * s, -2 * s * s, 2)]),
          solution: `Triangles ABE and ADF are right triangles with AB = AD and AE = AF, so they are congruent and BE = DF; that makes CE = CF, and triangle ECF is right and isosceles. Write CE = CF = c: then EF = c√2, so AE = c√2 as well. In triangle ABE, AE² = AB² + BE², that is 2c² = ${s}² + (${s} − c)², or c² + ${2 * s}c − ${2 * s * s} = 0, so c = ${s}(√3 − 1). The area of ECF is ½c² = ½·${s * s}·(√3 − 1)² = ${s * s}(2 − √3) = <b>${correct[1]}</b>.`,
          check: () => {
            // slide E up BC until AE = EF, with F the matching point on CD
            const ee = solve((y) => Math.hypot(s, y) - Math.SQRT2 * (s - y), 0, s);
            return near(shoelace([[s, ee], C, [ee, s]]), correct[0], 'triangle ECF') || near(Math.hypot(s, ee), dist([s, ee], [ee, s]), 'equilateral');
          },
        };
      }
      const correct = mix((n * n) / 2, (n * n) / 4, 3);
      return {
        topic: 'Tilted equilateral triangles', rank: 21,
        text: `Equilateral triangle AEF has sides ${n} long. It sits inside square ABCD with A a corner of both, E on side BC and F on side CD. What is the area of the square?`,
        figure: picture,
        answer: labelledS(d, correct, [[n * n, num(n * n)], mix(n * n, (n * n) / 2, 3), fracSurd(n * n, 4, 3), mix((3 * n * n) / 4, (n * n) / 4, 3), mix((n * n) / 2, (n * n) / 4, 2)]),
        solution: `Triangles ABE and ADF are right triangles with AB = AD and AE = AF, so they are congruent and ∠BAE = ∠DAF. The angle at A is 90° = ∠BAE + 60° + ∠DAF, so ∠BAE = 15°. So the square’s side is AB = AE·cos 15° = ${n}·cos 15°, and its area is ${n * n}·cos² 15°. By the double-angle formula, cos² 15° = (1 + cos 30°)/2 = (2 + √3)/4. So the area is ${n * n}·(2 + √3)/4 = <b>${correct[1]}</b>.`,
        check: () => {
          // for a square of side x, slide E up BC until AE = EF; find the x that makes that side n
          const sideFor = (x) => { const ee = solve((y) => Math.hypot(x, y) - Math.SQRT2 * (x - y), 0, x); return Math.hypot(x, ee); };
          const x = solve((xx) => sideFor(xx) - n, n / 2, n);
          return near(x * x, correct[0], 'square');
        },
      };
    },
    // one corner on each of three parallel lines: turn by 60° about the corner on the middle line
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'side' : 'area', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[a, b]] = pick(turn, `te-lines-${ask}`, [LINES]), N = a * a + a * b + b * b;
      const correct = ask === 'area' ? fracSurd(N, 3, 3) : fracSurd(2, 3, 3 * N);
      const wrongs = ask === 'area'
        ? [fracSurd((a + b) ** 2, 3, 3), fracSurd(a * a + b * b, 3, 3), fracSurd(N, 4, 3), fracSurd(N, 2, 3), fracSurd(a * a - a * b + b * b, 3, 3), fracSurd(N, 12, 3), fracSurd((a + b) ** 2, 2, 3), fracSurd(N, 1, 3)]
        : [fracSurd(2, 3, 3 * (a + b) ** 2), fracSurd(2, 3, 3 * (a * a + b * b)), fracSurd(1, 3, 3 * N), fracSurd(1, 1, N), fracSurd(2, 3, 3 * (a * a - a * b + b * b)), fracSurd(2, 1, N), fl(a + b), fracSurd(4, 3, 3 * N)];
      const x = (a + 2 * b) / Math.sqrt(3), P = [0, 0], Q = [x, a], R = [x / 2 + (a * Math.sqrt(3)) / 2, a / 2 - (x * Math.sqrt(3)) / 2];
      const lo = Math.min(P[0], Q[0], R[0]) - 0.6 * (a + b), hi = Math.max(P[0], Q[0], R[0]) + 0.4 * (a + b), T = fit([[lo, a], [hi, -b]], 380, 240, 22), gapX = lo + 0.2 * (a + b);
      return {
        topic: 'Tilted equilateral triangles', rank: 21,
        text: `Three parallel lines are drawn. The middle one is ${a === b ? `${a} from each of the other two` : `${a} from one of the outer lines and ${b} from the other`}. An equilateral triangle has one corner on each of the three lines. ${ask === 'area' ? 'What is the area of the triangle?' : 'How long are its sides?'}`,
        figure: svg(380, 240, 'An equilateral triangle with a corner on each of three parallel lines', [poly([P, Q, R].map(T)), ...[a, 0, -b].map((y) => seg(T([lo, y]), T([hi, y]))), seg(T([gapX, a]), T([gapX, 0]), 'arc'), seg(T([gapX, 0]), T([gapX, -b]), 'arc ext'),
          label([T([gapX, a / 2])[0] - 6, T([gapX, a / 2])[1]], a, 'ang', 'end'), label([T([gapX, -b / 2])[0] - 6, T([gapX, -b / 2])[1]], b, 'ang', 'end')]),
        answer: labelledS(d, correct, wrongs),
        solution: `Put the corner P on the middle line at the origin, with the outer lines y = ${a} and y = −${b}. The corner Q on the line y = ${a} is (x, ${a}) for some x, and turning Q by 60° clockwise about P gives the third corner R = (x/2 + ${a === 1 ? '' : a}√3/2, ${frac(a, 2)} − x√3/2). R is on the line y = −${b}, so ${frac(a, 2)} − x√3/2 = −${b}, which gives x = (${a} + 2·${b})/√3 = ${a + 2 * b}/√3. The side squared is PQ² = x² + ${a}² = ${frac((a + 2 * b) ** 2, 3)} + ${a * a} = ${frac(4 * N, 3)}. ` +
          (ask === 'area' ? `So the area is (√3/4)·${frac(4 * N, 3)} = ${N}/√3 = <b>${correct[1]}</b>.` : `So each side is √(${frac(4 * N, 3)}) = <b>${correct[1]}</b>.`),
        check: () => {
          // turn a side through every direction until its other corner lands on the far line
          const th = solve((t) => (a / Math.sin(t)) * Math.sin(t - Math.PI / 3) + b, 1e-6, Math.PI / 3), side = a / Math.sin(th);
          return near(ask === 'area' ? (Math.sqrt(3) / 4) * side * side : side, correct[0], ask);
        },
      };
    },
    // in a rectangle from a corner: turn E by 60° about A to get F, and F must reach the top side
    (d, ctx) => {
      const [[w, h]] = pick(ctx, 'te-box', [BOXES]), correct = mix(-3 * w * h, w * w + h * h, 3);
      const wrongs = [mix(-3 * w * h, 2 * w * h, 3), mix(-3 * w * w, 2 * w * w, 3), mix(-3 * h * h, 2 * h * h, 3), fracSurd(w * w + h * h, 4, 3), mix(-3 * w * h, w * w + h * h, 3, 4), mix(0, w * w + h * h, 3), mix(-2 * w * h, w * w + h * h, 3), mix(3 * w * h, w * w + h * h, 3, 4)];
      const e = 2 * h - w * Math.sqrt(3), f = 2 * w - h * Math.sqrt(3), A = [0, 0], B = [w, 0], C = [w, h], D = [0, h], E = [w, e], Fq = [f, h], T = fit([A, B, C, D], 320, 300, 32), ctr = T([w / 2, h / 2]);
      return {
        topic: 'Tilted equilateral triangles', rank: 23,
        text: `Rectangle ABCD has AB = ${w} and BC = ${h}. Point E is on side BC and point F is on side CD, placed so that triangle AEF is equilateral. What is the area of triangle AEF?`,
        figure: svg(320, 300, 'Equilateral triangle AEF inside rectangle ABCD', [poly([A, E, Fq].map(T)), poly([A, B, C, D].map(T)), ...[[A, 'A'], [B, 'B'], [C, 'C'], [D, 'D'], [E, 'E'], [Fq, 'F']].map(([p, nm]) => label(away(T(p), ctr, 14), nm))]),
        answer: labelledS(d, correct, wrongs),
        solution: `Put A at the origin, B = (${w}, 0) and D = (0, ${h}), and write E = (${w}, e). Turning E by 60° counterclockwise about A gives F: F = (${frac(w, 2)} − e√3/2, ${w}√3/2 + e/2). F is on CD, where y = ${h}, so ${w}√3/2 + e/2 = ${h}, which gives e = ${2 * h} − ${w}√3. The side squared is AE² = ${w}² + e² = ${w * w} + ${4 * h * h} − ${4 * w * h}√3 + ${3 * w * w} = 4(${w * w + h * h} − ${w * h}√3). So the area is (√3/4)·AE² = √3·(${w * w + h * h} − ${w * h}√3) = <b>${correct[1]}</b>.`,
        check: () => {
          // slide E up BC until the point F on CD with AF = AE is just as far from E
          const side = (y) => Math.hypot(w, y), gap = (y) => { const ff = Math.sqrt(Math.max(0, side(y) ** 2 - h * h)); return dist([w, y], [ff, h]) - side(y); };
          const y = solve(gap, Math.max(0, e - 0.3 * h), Math.min(h, e + 0.3 * h));
          return near((Math.sqrt(3) / 4) * side(y) ** 2, correct[0], 'area');
        },
      };
    },
    // a point inside with distances x, y, z, x² + y² = z²: turn 60° about a corner and find a 150° angle
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'area' : 'side', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[x, y, z, order]] = pick(turn, `te-inside-${ask}`, [INSIDE]), [U, V, W] = order.split(''), dists = { [U]: x, [V]: y, [W]: z };
      const sq = mix(x * x + y * y, x * y, 3), area = mix(3 * x * y, x * x + y * y, 3, 4), correct = ask === 'side' ? sq : area;
      const wrongs = ask === 'side'
        ? [[x * x + y * y + x * y, num(x * x + y * y + x * y)], [z * z, num(z * z)], mix(x * x + y * y, x * y, 2), mix(x * x + y * y, -x * y, 3), [(x + y) ** 2, num((x + y) ** 2)], mix(x * x + y * y, 2 * x * y, 3)]
        : [fracSurd(x * x + y * y + x * y, 4, 3), fracSurd(z * z, 4, 3), mix(3 * x * y, x * x + y * y, 3, 2), mix(x * x + y * y, x * y, 3), fracSurd((x + y) ** 2, 4, 3), mix(6 * x * y, x * x + y * y, 3, 4)];
      // the picture: the triangle drawn from its side, with P where the circles about U and V cross inside it
      const Lside = Math.sqrt(sq[0]), tri = { A: [0, 0], B: [Lside, 0], C: [Lside / 2, (Lside * Math.sqrt(3)) / 2] }, du = dists.A, dv = dists.B;
      const px = (Lside * Lside + du * du - dv * dv) / (2 * Lside), P = [px, Math.sqrt(du * du - px * px)], T = fit(Object.values(tri), 320, 280, 30), ctr = centre(Object.values(tri).map(T));
      return {
        topic: 'Tilted equilateral triangles', rank: 23,
        text: `Point P is inside equilateral triangle ABC, with PA = ${dists.A}, PB = ${dists.B} and PC = ${dists.C}. ${ask === 'side' ? 'What is AB²?' : 'What is the area of triangle ABC?'}`,
        figure: svg(320, 280, 'Point P inside equilateral triangle ABC', [poly(Object.values(tri).map(T)), ...['A', 'B', 'C'].map((k) => seg(T(P), T(tri[k]), 'seg')), dot(T(P)), nameAt(T(P), ['A', 'B', 'C'].map((k) => T(tri[k])), 'P', 13),
          ...['A', 'B', 'C'].map((k) => label(away(T(tri[k]), ctr, 14), k)), ...['A', 'B', 'C'].map((k) => label(along(mid(T(P), T(tri[k])), [-(T(tri[k])[1] - T(P)[1]) / dist(T(P), T(tri[k])), (T(tri[k])[0] - T(P)[0]) / dist(T(P), T(tri[k]))], 9), dists[k], 'ang'))]),
        answer: labelledS(d, correct, wrongs),
        solution: `Here ${x}² + ${y}² = ${z}², so P${U}, P${V} and P${W} would make a right triangle; a 60° turn brings them together. Turn the whole picture 60° about ${V}, the way that takes ${U} to ${W}, and let P go to P′. Then ${V}P′ = ${V}P = ${y} and ∠P${V}P′ = 60°, so triangle P${V}P′ is equilateral and PP′ = ${y}; and ${W}P′ = ${U}P = ${x}, since the turn takes segment ${U}P to ${W}P′. So triangle PP′${W} has sides ${y}, ${x} and ${z}, and since ${x}² + ${y}² = ${z}², it has a right angle at P′. That makes ∠${V}P′${W} = 60° + 90° = 150°, and this is where the turn takes ∠${V}P${U}, so ∠${U}P${V} = 150° too. By the law of cosines in triangle ${U}P${V}, ${U}${V}² = ${x}² + ${y}² − 2·${x}·${y}·cos 150° = ${x * x + y * y} + ${x * y}√3. ` +
          (ask === 'side' ? `All three sides are equal, so AB² = <b>${correct[1]}</b>.` : `So the area is (√3/4)·(${x * x + y * y} + ${x * y}√3) = <b>${correct[1]}</b>.`),
        check: () => {
          // for a triangle of side t, put P where PA and PB say; find the t that makes PC right
          const far = (t) => { const xx = (t * t + dists.A ** 2 - dists.B ** 2) / (2 * t), yy = Math.sqrt(Math.max(0, dists.A ** 2 - xx * xx)); return dist([xx, yy], [t / 2, (t * Math.sqrt(3)) / 2]) - dists.C; };
          const lo = Math.max(dists.A, dists.B, dists.C), hi = dists.A + dists.B + dists.C;
          let a0 = lo, found = null;
          for (let i = 1; i <= 400 && !found; i++) { const b0 = lo + ((hi - lo) * i) / 400; if (far(a0) * far(b0) <= 0) found = solve(far, a0, b0); a0 = b0; }
          if (found === null) return 'no triangle fits';
          return near(ask === 'side' ? found * found : (Math.sqrt(3) / 4) * found * found, correct[0], ask);
        },
      };
    },
  ],

  'Pieces of regular polygons': [
    // six segments from the corners make a smaller regular hexagon: its size from the distance to the centre
    (d, ctx) => {
      const [[p, q], c] = pick(ctx, 'rp-hex-inner', [HEX_CUTS, [1, 2, 3, 4]]), t = F(p, p + q), Den = 3 * p * p + 3 * p * q + q * q, H = c * Den, ans = F(c * (p + q) ** 2);
      const one = fa(fa(F(1), t), fm(t, t));
      const wrongs = positive([F(H * (p + q) ** 2, (p + q) ** 2 + p * p), F(H * q * q, (p + q) ** 2), F(4 * H, 7), F(H, 3), F(H * (p * p + p * q + q * q), (p + q) ** 2 + p * p + p * q), F(H * (q * q + p * q), (p + q) ** 2), F(H * (p + q) ** 4, Den * Den), F(H * (p + q) ** 2, (p + q) ** 2 + p * q)]).filter((v) => fv(v) < H);
      const onSide = HEX.map((V, i) => share(HEX[(i + 1) % 6], HEX[(i + 2) % 6], p, q)), lines = HEX.map((V, i) => [V, onSide[i]]);
      const inner = lines.map((l, i) => meet(l, lines[(i + 1) % 6])), T = fit(HEX, 300, 280, 28), ctr = T([0, 0]);
      return {
        topic: 'Pieces of regular polygons', rank: 22,
        text: `Regular hexagon ABCDEF has area ${num(H)}. Points P, Q, R, S, T and U lie on sides BC, CD, DE, EF, FA and AB, with BP : PC = CQ : QD = DR : RE = ES : SF = FT : TA = AU : UB = ${p} : ${q}. Segments AP, BQ, CR, DS, ET and FU cut out a smaller regular hexagon in the middle. What is its area?`,
        figure: svg(300, 280, 'Regular hexagon ABCDEF with a segment from each corner', [poly(inner.map(T)), poly(HEX.map(T)), ...lines.map(([u, v]) => seg(T(u), T(v), 'seg')),
          ...'ABCDEF'.split('').map((nm, i) => label(away(T(HEX[i]), ctr, 14), nm)), ...'PQRSTU'.split('').map((nm, i) => label(away(T(onSide[i]), ctr, 13), nm))]),
        answer: choicesS(d, ans, wrongs, showFrac),
        solution: `The figure looks the same after a 60° turn about the centre O, so the middle hexagon is regular with centre O, and its size is fixed by how far O is from one of the segments, say AP. Let the side be s and BP = ${fr(t)}·s. Triangles ABO and OBC are equilateral, each a sixth of the hexagon, and the four-sided piece ABPO is ABO plus OBP, and also ABP plus APO; OBP is ${fr(t)} of OBC, and ABP (sides s and ${fr(t)}s with 120° between) is also ${fr(t)} of a sixth. So triangle APO is exactly a sixth of the hexagon, ½·s·a, where a is the hexagon’s distance from O to a side. By the law of cosines with the 120° angle at B, AP² = s²(1 + ${fr(t)} + ${fr(fm(t, t))}) = ${fr(one)}·s², and the distance from O to AP is 2·[APO] ÷ AP = s·a ÷ AP = a ÷ √(${fr(one)}). Regular hexagons have areas in the ratio of the squares of these distances, so the middle one has area ${num(H)} ÷ ${fr(one)} = <b>${showFrac(ans)}</b>.`,
        check: () => near((shoelace(inner) / shoelace(HEX)) * H, fv(ans), 'middle hexagon'),
      };
    },
    // a triangle on three alternate sides: the hexagon less three equal four-sided pieces
    (d, ctx) => {
      const [[p, q], c] = pick(ctx, 'rp-hex-triangle', [HEX_CUTS, [1, 2, 3]]), t = F(p, p + q), [num0, den0] = lowest(p * p + p * q + q * q, 2 * (p + q) ** 2), H = c * den0, ans = F(c * num0);
      const piece = fm(F(H, 6), fs(fa(F(1), t), fm(t, t)));
      const wrongs = positive([piece, F(H, 2), F(3 * H, 8), F(H * (p * p + p * q + q * q), 3 * (p + q) ** 2), F(H * (p * p + q * q), 2 * (p + q) ** 2), fm(F(H, 2), fs(F(1), t)), fm(F(H, 2), fa(fs(F(1), fm(t, t)), t)), fm(F(H, 2), fa(F(1), t)), fs(F(H), fm(F(H, 2), fs(F(1), t)))]).filter((v) => fv(v) < H);
      const P = share(HEX[0], HEX[1], p, q), Q = share(HEX[2], HEX[3], p, q), R = share(HEX[4], HEX[5], p, q), T = fit(HEX, 300, 280, 28), ctr = T([0, 0]);
      return {
        topic: 'Pieces of regular polygons', rank: 21,
        text: `Regular hexagon ABCDEF has area ${num(H)}. Points P, Q and R lie on sides AB, CD and EF, with AP : PB = CQ : QD = ER : RF = ${p} : ${q}. What is the area of triangle PQR?`,
        figure: svg(300, 280, 'Triangle PQR inside regular hexagon ABCDEF', [poly([P, Q, R].map(T)), poly(HEX.map(T)), ...'ABCDEF'.split('').map((nm, i) => label(away(T(HEX[i]), ctr, 14), nm)), ...[[P, 'P'], [Q, 'Q'], [R, 'R']].map(([pp, nm]) => label(away(T(pp), ctr, 13), nm))]),
        answer: choicesS(d, ans, wrongs, showFrac),
        solution: `Triangle PQR is the hexagon less three four-sided pieces, PBCQ, QDER and RFAP, and a turn of 120° about the centre takes each to the next, so they are equal. Split PBCQ along PC. Triangle PBC has the base PB, ${frac(q, p + q)} of AB, and the same height as ABC, which is a sixth of the hexagon, so [PBC] = ${frac(q, p + q)}·${num(H)}/6. P is ${fr(t)} of the way from A to B, so its height above line CD goes ${fr(t)} of the way from A’s to B’s; triangles ACD and BCD are a third and a sixth of the hexagon, so [PCD] = (${frac(q, p + q)}·⅓ + ${fr(t)}·⅙)·${num(H)}, and [PCQ] is ${fr(t)} of that. Adding, [PBCQ] = ${num(H)}·(1 + ${fr(t)} − ${fr(fm(t, t))})/6 = ${fr(piece)}. So [PQR] = ${num(H)} − 3·${fr(piece)} = <b>${showFrac(ans)}</b>.`,
        check: () => near((shoelace([P, Q, R]) / shoelace(HEX)) * H, fv(ans), 'triangle PQR'),
      };
    },
    // two squares in a regular octagon: eight notches with 22.5° corners, then the overlap and the star's points
    (d, ctx) => {
      const ask = ['star', 'overlap', 'point'][ctx.k % 3], turn = { ...ctx, k: Math.floor(ctx.k / 3) };
      const [s] = pick(turn, `rp-oct-${ask}`, [[1, 2, 3, 4, 5, 6, 8]]), s2 = s * s;
      const correct = { star: [4 * s2, num(4 * s2)], overlap: mix(0, 2 * s2, 2), point: mix(2 * s2, -s2, 2, 4) }[ask];
      const pool = [mix(2 * s2, 2 * s2, 2), mix(2 * s2, s2, 2), mix(4 * s2, 2 * s2, 2), [4 * s2, num(4 * s2)], mix(0, 2 * s2, 2), mix(-2 * s2, 2 * s2, 2), [2 * s2, num(2 * s2)], mix(-s2, s2, 2, 4), mix(2 * s2, -s2, 2, 2), [3 * s2, num(3 * s2)], mix(2 * s2, -s2, 2, 8)];
      const wrongs = pool.filter((w) => Math.abs(w[0] - correct[0]) > 1e-9);
      // the picture: the octagon (circumradius 1), the two squares, and what is asked for shaded
      const sqA = [0, 2, 4, 6].map((i) => OCT[i]), sqB = [1, 3, 5, 7].map((i) => OCT[i]);
      const both = [0, 1, 2, 3].reduce((P, i) => clip(P, (x) => { const a = sqA[i], b = sqA[(i + 1) % 4]; return (b[1] - a[1]) * (x[0] - a[0]) - (b[0] - a[0]) * (x[1] - a[1]); }), sqB);
      const ang = (p) => Math.atan2(p[1], p[0]), starPts = [...OCT, ...both].sort((u, v) => ang(u) - ang(v));
      const tip = OCT[1], nearTip = both.slice().sort((u, v) => dist(u, tip) - dist(v, tip)).slice(0, 2);
      const T = fit(OCT, 300, 300, 28), ctr = T([0, 0]);
      return {
        topic: 'Pieces of regular polygons', rank: ask === 'star' ? 23 : 22,
        text: `In regular octagon ABCDEFGH, with sides ${s} long, the diagonals AC, CE, EG and GA make one square and BD, DF, FH and HB make another. ${{ star: 'Together the two squares cover an eight-pointed star. What is the area of the star?', overlap: 'What is the area of the region inside both squares?', point: 'Square BDFH sticks out of square ACEG in four small triangles, one at each of B, D, F and H. What is the area of one of them?' }[ask]}`,
        figure: svg(300, 300, 'Two squares in a regular octagon', [poly({ star: starPts, overlap: both, point: [tip, ...nearTip] }[ask].map(T)), poly(OCT.map(T)), poly(sqA.map(T), 'seg'), poly(sqB.map(T), 'seg'),
          ...'ABCDEFGH'.split('').map((nm, i) => label(away(T(OCT[i]), ctr, 14), nm))]).replace(/<polygon class="seg"/g, '<polygon class="seg" fill="none"'),
        answer: labelledS(d, correct, wrongs),
        solution: `Each angle of a regular octagon is 135°, so in triangle ABC (AB = BC = ${s}, 135° at B) the angles at A and C are 22.5°. Side AB is outside both squares except at its ends: AC cuts it off from one square and BH from the other, leaving a notch, triangle ABX with X where AC meets BH, with base ${s} and base angles of 22.5°. Its height is ${s === 2 ? '' : `${frac(s, 2)}·`}tan 22.5° = ${s === 2 ? '√2 − 1' : times(frac(s, 2), '(√2 − 1)')}, since tan 22.5° = sin 45°/(1 + cos 45°) = √2 − 1, so each of the eight notches has area ${times(s2, '(√2 − 1)')}/4. The octagon is a square of side ${times(s, '(1 + √2)')} with four corners of area ${frac(s2, 4)} cut off, so its area is ${times(s2, '(3 + 2√2)')} − ${s2} = ${times(s2, '(2 + 2√2)')}, and the star is what the notches leave: ${times(s2, '(2 + 2√2)')} − ${times(2 * s2, '(√2 − 1)')} = ${4 * s2}. ` +
          {
            star: `So the star has area <b>${correct[1]}</b>.`,
            overlap: `Each square has area AC² = ${s}² + ${s}² − 2·${s2}·cos 135° = ${times(s2, '(2 + √2)')}, and the star is the two squares less their overlap, so the overlap is 2·${times(s2, '(2 + √2)')} − ${4 * s2} = <b>${correct[1]}</b>.`,
            point: `Each square has area AC² = ${s}² + ${s}² − 2·${s2}·cos 135° = ${times(s2, '(2 + √2)')}, and the star is the two squares less their overlap, so the overlap is 2·${times(s2, '(2 + √2)')} − ${4 * s2} = ${mix(0, 2 * s2, 2)[1]}. Square BDFH is the overlap plus its four points, so one point has area (${times(s2, '(2 + √2)')} − ${mix(0, 2 * s2, 2)[1]})/4 = <b>${correct[1]}</b>.`,
          }[ask],
        check: () => {
          // the octagon scaled to sides s, the overlap clipped out, the star by inclusion and exclusion
          const k = s / dist(OCT[0], OCT[1]), sq = shoelace(sqA) * k * k, over = shoelace(both) * k * k;
          return near({ star: 2 * sq - over, overlap: over, point: (sq - over) / 4 }[ask], correct[0], ask) || near(shoelace(starPts) * k * k, 4 * s2, 'star outline');
        },
      };
    },
  ],

  'Medians and Stewart’s theorem': [
    // perpendicular medians: three right triangles at the centroid
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'area' : 'side', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[a, b]] = pick(turn, `ms-perp-${ask}`, [PERPENDICULAR]), S = a * a + b * b, Pr = (4 * b * b - a * a) * (4 * a * a - b * b);
      const correct = ask === 'side' ? rootF(F(S, 5)) : fracSurd(1, 10, Pr);
      const wrongs = ask === 'side' ? [rootF(F(S, 2)), rootF(F(S, 3)), rootF(F(S, 4)), rootF(F(S, 10)), rootF(F(S))] : [fracSurd(1, 30, Pr), fracSurd(1, 15, Pr), fracSurd(1, 5, Pr), fl(a * b, 2), fracSurd(1, 20, Pr)];
      const c = Math.sqrt(S / 5), { A, B, C } = corners(a, b, c), D = mid(B, C), E = mid(C, A), G = [(A[0] + B[0] + C[0]) / 3, (A[1] + B[1] + C[1]) / 3];
      const T = fit([A, B, C], 360, 260, 30), ctr = centre([A, B, C].map(T));
      return {
        topic: 'Medians and Stewart’s theorem', rank: ask === 'side' ? 20 : 22,
        text: `In triangle ABC, BC = ${a} and CA = ${b}, and the median from A is perpendicular to the median from B. ${ask === 'side' ? 'How long is AB?' : 'What is the area of triangle ABC?'}`,
        figure: svg(360, 260, 'Triangle ABC with perpendicular medians AD and BE', [poly([A, B, C].map(T)), seg(T(A), T(D), 'seg'), seg(T(B), T(E), 'seg'), corner(T(G), T(D), T(E), 8),
          ...[[A, 'A'], [B, 'B'], [C, 'C'], [D, 'D'], [E, 'E']].map(([p, nm]) => label(away(T(p), ctr, 14), nm)), nameAt(T(G), [T(A), T(B), T(D), T(E)], 'G', 13)]),
        answer: labelledS(d, correct, wrongs),
        solution: `Let the medians AD and BE meet at the centroid G, which is two thirds of the way along each, and write GD = x and GE = y, so AG = 2x and BG = 2y. The right angle at G gives three right triangles: in BGD, BD² = (${a}/2)² = 4y² + x²; in AGE, AE² = (${b}/2)² = 4x² + y²; and in AGB, AB² = 4x² + 4y². ` +
          (ask === 'side'
            ? `Adding the first two, ${frac(S, 4)} = 5(x² + y²), so x² + y² = ${frac(S, 20)}. So AB² = 4(x² + y²) = ${frac(S, 5)}, and AB = <b>${correct[1]}</b>.`
            : `Solving the first two, x² = (4·${b}² − ${a}²)/60 = ${frac(4 * b * b - a * a, 60)} and y² = (4·${a}² − ${b}²)/60 = ${frac(4 * a * a - b * b, 60)}. Triangle ABG is a third of ABC (the centroid splits a triangle into three equal parts), and its area is ½·2x·2y = 2xy, so [ABC] = 6xy = 6·√(${frac(4 * b * b - a * a, 60)}·${frac(4 * a * a - b * b, 60)}) = <b>${correct[1]}</b>.`),
        check: () => {
          // swing CA about C until the medians are perpendicular
          const Aof = (th) => [b * Math.cos(th), b * Math.sin(th)], Bp = [a, 0], Cp = [0, 0], f = (th) => { const Ap = Aof(th), Dp = mid(Bp, Cp), Ep = mid(Cp, Ap); return (Dp[0] - Ap[0]) * (Ep[0] - Bp[0]) + (Dp[1] - Ap[1]) * (Ep[1] - Bp[1]); };
          let th = null, a0 = 1e-6;
          for (let i = 1; i <= 600 && th === null; i++) { const b0 = (Math.PI * i) / 600; if (f(a0) * f(b0) <= 0) th = solve(f, a0, b0); a0 = b0; }
          if (th === null) return 'no angle works';
          return near(ask === 'side' ? dist(Aof(th), Bp) : shoelace([Aof(th), Bp, Cp]), correct[0], ask);
        },
      };
    },
    // three medians: the triangle they make, scaled by 2/3, sits inside, so the area is 4/3 of theirs
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'side' : 'area', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[m1, m2, m3]] = pick(turn, `ms-three-${ask}`, [MEDIANS]), s = (m1 + m2 + m3) / 2, M = Math.round(Math.sqrt(s * (s - m1) * (s - m2) * (s - m3)));
      const sumSq = m1 * m1 + m2 * m2 + m3 * m3, longest = 2 * m2 * m2 + 2 * m3 * m3 - m1 * m1;   // opposite the shortest median, m1
      const correct = ask === 'area' ? fl(4 * M, 3) : fracSurd(2, 3, longest);
      const wrongs = ask === 'area' ? [[M, num(M)], fl(3 * M, 4), fl(2 * M, 3), fl(8 * M, 3), fl(4 * M, 9), [2 * M, num(2 * M)], fl(16 * M, 9), [3 * M, num(3 * M)]] : [fracSurd(1, 1, longest), fracSurd(1, 2, longest), fracSurd(2, 3, 2 * m1 * m1 + 2 * m3 * m3 - m2 * m2), fl(4 * m3, 3), fracSurd(2, 3, 2 * m1 * m1 + 2 * m2 * m2 - m3 * m3), fracSurd(4, 3, longest), fl(2 * m3, 1), fracSurd(1, 3, longest)];
      return {
        topic: 'Medians and Stewart’s theorem', rank: ask === 'area' ? 20 : 21,
        text: `The three medians of a triangle are ${m1}, ${m2} and ${m3} long. ${ask === 'area' ? 'What is the area of the triangle?' : 'How long is its longest side?'}`,
        answer: labelledS(d, correct, wrongs),
        solution: ask === 'area'
          ? `Let the medians AD, BE and CF meet at the centroid G, two thirds of the way along each. Extend GD past D by its own length to G′: the diagonals of BGCG′ cut each other in half at D, so it is a parallelogram and CG′ = BG. So triangle GCG′ has sides GG′ = ⅔·AD, GC = ⅔·CF and CG′ = ⅔·BE: it is the triangle made of the three medians, scaled by ⅔. Its area is also twice [GCD] (GG′ = 2GD, same corner C), which is [GBC], a third of [ABC]. By Heron’s formula the triangle with sides ${m1}, ${m2} and ${m3} has area ${M} (s = ${num(s)}), so [ABC] = 3·(⅔)²·${M} = ${frac(4, 3)}·${M} = <b>${correct[1]}</b>.`
          : `Use the median formula, 4·m<sub>a</sub>² = 2b² + 2c² − a², for each of the three medians. Adding all three, 4(m<sub>a</sub>² + m<sub>b</sub>² + m<sub>c</sub>²) = 3(a² + b² + c²), so a² + b² + c² = ${frac(4, 3)}·${sumSq} = ${frac(4 * sumSq, 3)}. Then 4·m<sub>a</sub>² = 2(a² + b² + c²) − 3a², so a² = (2(a² + b² + c²) − 4m<sub>a</sub>²)/3, which is largest for the shortest median, ${m1}: a² = (${frac(8 * sumSq, 3)} − ${4 * m1 * m1})/3 = ${frac(4 * longest, 9)}. So the longest side is <b>${correct[1]}</b>.`,
        check: () => {
          // build the triangle round its centroid: GA, GB and GC are ⅔ of the medians and add up to nothing
          const ga = (2 / 3) * m1, gb = (2 / 3) * m2, gc = (2 / 3) * m3, cosP = (gc * gc - ga * ga - gb * gb) / (2 * ga * gb), A = [ga, 0], B = [gb * cosP, gb * Math.sqrt(1 - cosP * cosP)], C = [-A[0] - B[0], -A[1] - B[1]];
          const medOK = [[A, B, C, m1], [B, C, A, m2], [C, A, B, m3]].every(([p, q, r, m]) => Math.abs(dist(p, mid(q, r)) - m) < 1e-9);
          return (medOK ? '' : 'medians') || near(ask === 'area' ? shoelace([A, B, C]) : Math.max(dist(A, B), dist(B, C), dist(C, A)), correct[0], ask);
        },
      };
    },
    // the circles inscribed in ABD and ACD touch AD at P and Q: tangent lengths, and AD cancels
    (d, ctx) => {
      const kind = ['median', 'altitude', 'bisector'][ctx.k % 3], turn = { ...ctx, k: Math.floor(ctx.k / 3) };
      const ok = (a, b, c, acute) => (kind !== 'altitude' || acute) && lowest(Math.abs(b - c) * (b + c - a), 2 * a)[1] <= 30 && lowest(Math.abs(b - c) * (b + c - a), 2 * (b + c))[1] <= 30;
      const [[a, b, c]] = pick(turn, `ms-touch-${kind}`, [SCALENE], (row) => ok(...row));
      const BD = { median: F(a, 2), altitude: F(a * a + c * c - b * b, 2 * a), bisector: F(a * c, b + c) }[kind], CD = fs(F(a), BD), gap = fs(CD, BD);
      const diff = fs(F(b - c), gap), ans = F(Math.abs(diff[0]), 2 * diff[1]);
      const others = { median: F(Math.abs(b - c), 2), altitude: F(Math.abs(b - c) * (b + c - a), 2 * a), bisector: F(Math.abs(b - c) * (b + c - a), 2 * (b + c)) };
      const wrongs = positive([...Object.entries(others).filter(([k]) => k !== kind).map(([, v]) => v), F(Math.abs(gap[0]), 2 * gap[1]), F(b + c - a, 2), F(Math.abs(b - c))]);
      const { A, B, C } = corners(a, b, c), D = [fv(BD), 0], i1 = incircle(A, B, D), i2 = incircle(A, D, C), foot = (o) => { const u = unit(A, D), t = (o[0] - A[0]) * u[0] + (o[1] - A[1]) * u[1]; return along(A, u, t); };
      const T = fit([A, B, C], 380, 260, 30), ctr = centre([A, B, C].map(T)), P1 = foot(i1.o), Q1 = foot(i2.o);
      const what = { median: 'D is the midpoint of BC', altitude: 'AD is perpendicular to BC', bisector: 'AD bisects angle BAC' }[kind];
      const working = { median: `Here D is the midpoint, so CD − BD = 0`, altitude: `Here AD is an altitude, so by Pythagoras AB² − BD² = AD² = AC² − CD², which gives CD² − BD² = ${num(b * b - c * c)}; with CD + BD = ${a}, CD − BD = ${fr(gap)}`, bisector: `Here AD bisects angle A, so BD : DC = AB : AC = ${c} : ${b}, BD = ${fr(BD)} and CD = ${fr(CD)}, and CD − BD = ${fr(gap)}` }[kind];
      return {
        topic: 'Medians and Stewart’s theorem', rank: kind === 'median' ? 20 : 22,
        text: `In triangle ABC, AB = ${c}, BC = ${a} and CA = ${b}. Point D is on side BC, where ${what}. The circles inscribed in triangles ABD and ACD touch AD at P and Q. How long is PQ?`,
        figure: svg(380, 260, 'Triangle ABC split by AD, with the circles inscribed in the two parts', [poly([A, B, C].map(T)), seg(T(A), T(D), 'seg'), ring(T(i1.o), i1.r * T.s, 'arc'), ring(T(i2.o), i2.r * T.s, 'arc'), dot(T(P1)), dot(T(Q1)),
          ...[[A, 'A'], [B, 'B'], [C, 'C'], [D, 'D']].map(([p, nm]) => label(away(T(p), ctr, 14), nm)), label(beside(T(P1), T(A), T(D), T(B)), 'P'), label(beside(T(Q1), T(A), T(D), T(C)), 'Q')]),
        answer: choicesS(d, ans, wrongs, showFrac),
        solution: `A circle inscribed in a triangle touches a side at a distance from a corner equal to half of (the two sides at that corner minus the side opposite), because the two tangents from each corner are equally long. So AP = (AB + AD − BD)/2 and AQ = (AC + AD − CD)/2, and AD cancels: PQ = |AQ − AP| = |(AC − AB) − (CD − BD)|/2. ${working}. So PQ = |${b - c >= 0 ? b - c : `(${num(b - c)})`} − ${gap[0] < 0 ? `(${fr(gap)})` : fr(gap)}|/2 = <b>${showFrac(ans)}</b>.`,
        check: () => near(dist(P1, Q1), fv(ans), 'PQ'),
      };
    },
    // equal perimeters fix D (BD = (a + b − c)/2), then Stewart's theorem or a shared height
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'area' : 'length', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[a, b, c, K]] = pick(turn, `ms-split-${ask}`, [HERONIAN]), BD = F(a + b - c, 2), CD = F(a - b + c, 2), BDCD = fm(BD, CD);
      const AD2 = fs(fd(fa(fm(F(b * b), BD), fm(F(c * c), CD)), F(a)), BDCD), swapped = fs(fd(fa(fm(F(b * b), CD), fm(F(c * c), BD)), F(a)), BDCD);
      const correct = ask === 'length' ? rootF(AD2) : flf(fm(F(K, a), BD));
      const wrongs = ask === 'length'
        ? [rootF(F(2 * b * b + 2 * c * c - a * a, 4)), rootF(fm(F(b * c), fs(F(1), F(a * a, (b + c) ** 2)))), rootF(swapped), rootF(BDCD), rootF(fa(AD2, F(1)))]
        : [flf(fm(F(K, a), CD)), fl(K, 2), flf(F(K * c, b + c)), flf(F(K * b, b + c)), flf(fm(F(K, a), fs(BD, F(1))))];
      return {
        topic: 'Medians and Stewart’s theorem', rank: ask === 'length' ? 22 : 21,
        text: `Triangle ABC has AB = ${c}, BC = ${a} and CA = ${b}. Point D on side BC splits it into triangles ABD and ACD with equal perimeters. ${ask === 'length' ? 'How long is AD?' : 'What is the area of triangle ABD?'}`,
        answer: labelledS(d, correct, sane(wrongs)),
        solution: `The two perimeters share AD, so they are equal exactly when AB + BD = AC + CD. With BD + CD = ${a}, that is ${c} + BD = ${b} + ${a} − BD, so BD = (${a} + ${b} − ${c})/2 = ${fr(BD)} and CD = ${fr(CD)}. ` +
          (ask === 'length'
            ? `Stewart’s theorem for the segment AD says AC²·BD + AB²·CD = BC·(AD² + BD·CD), so AD² = (${b}²·${fr(BD)} + ${c}²·${fr(CD)})/${a} − ${fr(BD)}·${fr(CD)} = ${fr(AD2)}. So AD = <b>${correct[1]}</b>.`
            : `By Heron’s formula, with s = ${(a + b + c) / 2}, the area of ABC is √(${(a + b + c) / 2}·${(b + c - a) / 2}·${(a + c - b) / 2}·${(a + b - c) / 2}) = ${K}. Triangles ABD and ABC have the same height from A, so [ABD] = (BD/BC)·${K} = ${fr(BD)}/${a}·${K} = <b>${correct[1]}</b>.`),
        check: () => {
          // slide D along BC until the perimeters agree
          const { A, B, C } = corners(a, b, c), x = solve((t) => (c + t + dist(A, [t, 0])) - (b + (a - t) + dist(A, [t, 0])), 0, a), D = [x, 0];
          return near(ask === 'length' ? dist(A, D) : shoelace([A, B, D]), correct[0], ask);
        },
      };
    },
  ],

  'Slicing a cube': [
    // a cross-section: find the polygon from where the plane crosses the edges, then its area from its shadow
    (d, ctx) => {
      const [cut, s] = pick(ctx, 'cube-cut', [CUTS, [2, 4, 6]], (cc, ss) => { const x = cutData(cc, ss); return enough(x.correct, x.wrongs); });
      const { n, dd, poly3, keep, shadow, nn, nk, correct, wrongs, given, defText, axis, view } = cutData(cut, s);
      return {
        topic: 'Slicing a cube', rank: { 4: 22, 5: 23, 6: 21 }[poly3.length],
        text: `Cube ABCDEFGH has edges ${s} long: ABCD is its bottom face, and E, F, G and H are above A, B, C and D. ${defText}The plane through ${given.map((g) => g.name).join(', ').replace(/, ([^,]*)$/, ' and $1')} cuts the cube in a flat cross-section. What is the area of the cross-section?`,
        figure: cubePicture(s, given.filter((g) => g.text).map((g) => [g.name, g.at])),
        answer: labelledS(d, correct, wrongs),
        solution: `Put the cube on coordinates with A = (0, 0, 0), B = (${s}, 0, 0), D = (0, ${s}, 0) and E = (0, 0, ${s}), so that ${given.map((g) => `${g.name} = ${pt(g.at)}`).join(', ')}. The plane through these three points is ${equation(n, dd)}, as each of them satisfies it. Checking where it crosses each edge of the cube, the cross-section is a ${SHAPES[poly3.length]} with corners ${poly3.map((P) => pt(P)).join(', ')}. Seen ${view} (dropping the ${axis}-coordinate), it casts a shadow with corners ${poly3.map((P) => pt(keep.map((i) => P[i]))).join(', ')}, whose area by the shoelace formula is ${fr(shadow)}. A flat shape’s shadow is its area times cos θ, where θ is the angle between its plane and the shadow’s, and here cos θ = ${nk}/√(${n.map((c) => (c < 0 ? `(−${-c})²` : `${c}²`)).join(' + ')}) = ${nk}/√${nn}, the ${axis}-part of the plane’s unit normal. So the cross-section has area ${fr(shadow)}·√${nn}/${nk} = <b>${correct[1]}</b>.`,
        check: () => {
          // the polygon's area straight from its corners in space (half the length of the sum of cross products)
          const V = poly3.map((P) => P.map(fv)), tot = V.reduce((acc, p, i) => { const q = V[(i + 1) % V.length], c = cross3(p, q); return [acc[0] + c[0], acc[1] + c[1], acc[2] + c[2]]; }, [0, 0, 0]);
          const onPlane = V.every((p) => Math.abs(dot3(n, p) - dd) < 1e-9) && given.every((g) => Math.abs(dot3(n, g.at) - dd) < 1e-9);
          return (onPlane ? '' : 'not on the plane') || near(Math.hypot(...tot) / 2, correct[0], 'cross-section');
        },
      };
    },
    // the piece at A: extend the cut to a corner tetrahedron, then take off the similar tetrahedra that poke out
    (d, ctx) => {
      const [[a, b, c, dd, given]] = pick(ctx, 'cube-chop', [CHOPS]), s = 6, coef = [a, b, c], six = 6 * a * b * c;
      const pos = (x) => Math.max(0, x), over = coef.map((ai) => pos(dd - ai * s) ** 3), pairs = [[0, 1], [0, 2], [1, 2]].map(([i, j]) => [i, j, pos(dd - (coef[i] + coef[j]) * s) ** 3]);
      const V0 = F(dd ** 3, six), V = F(dd ** 3 - over.reduce((x, y) => x + y, 0) + pairs.reduce((x, p) => x + p[2], 0), six);
      const firstOver = over.findIndex((x) => x > 0);
      const wrongs = positive([V0, F(dd ** 3 - over[firstOver], six), fs(F(s ** 3), V), F(dd ** 3 - over.reduce((x, y) => x + y, 0), six), fm(V0, fs(F(1), coef.reduce((acc, ai) => fa(acc, F(pos(dd - ai * s), dd)), [0, 1]))), F(dd ** 3 - coef.reduce((acc, ai) => acc + pos(dd - ai * s) ** 2 * dd, 0), six)]).filter((w) => fv(w) < s ** 3);
      // names for the three points: corners keep theirs, the others are P, Q and R
      const names = ['P', 'Q', 'R'], pts3 = [];
      let next = 0;
      for (const o of given) {
        if (o.vertex) { pts3.push({ name: o.vertex, at: o.P.map(fv) }); continue; }
        const nm = names[next++], from = o.edge[0], gap = fm(o.t, F(s));
        pts3.push({ name: nm, at: o.P.map(fv), text: o.t[0] * 2 === o.t[1] ? `${nm} is the midpoint of edge ${o.edge}` : `${nm} is on edge ${o.edge} with ${from}${nm} = ${fr(gap)}` });
      }
      const defs = pts3.filter((g) => g.text).map((g) => g.text), defText = defs.length ? `${defs.length === 1 ? defs[0] : `${defs.slice(0, -1).join(', ')} and ${defs.at(-1)}`}. ` : '';
      const ints = coef.map((ai) => F(dd, ai)), faces = ['BCGF (where x = 6)', 'CDHG (where y = 6)', 'EFGH (where z = 6)'];
      const pokes = coef.map((ai, i) => (over[i] ? `Past the face ${faces[i]} it pokes out by a smaller tetrahedron, similar to the big one with lengths scaled by (${fr(ints[i])} − 6)/${fr(ints[i])} = ${fr(F(dd - ai * s, dd))}, so with volume ${fr(fm(V0, fm(F(dd - ai * s, dd), fm(F(dd - ai * s, dd), F(dd - ai * s, dd)))))}.` : '')).filter(Boolean);
      const twice = pairs.filter((p) => p[2] > 0).map(([i, j, cube]) => `The parts past ${faces[i].split(' ')[0]} and past ${faces[j].split(' ')[0]} overlap in a still smaller similar tetrahedron, of volume ${fr(F(cube, six))}, which was taken off twice, so it goes back once.`);
      return {
        topic: 'Slicing a cube', rank: 24,
        text: `Cube ABCDEFGH has edges ${s} long: ABCD is its bottom face, and E, F, G and H are above A, B, C and D. ${defText}The plane through ${pts3.map((g) => g.name).join(', ').replace(/, ([^,]*)$/, ' and $1')} cuts the cube into two pieces. What is the volume of the piece that contains A?`,
        figure: cubePicture(s, pts3.filter((g) => g.text).map((g) => [g.name, g.at])),
        answer: choicesS(d, V, wrongs, showFrac),
        solution: `Put A at the origin with B = (6, 0, 0), D = (0, 6, 0) and E = (0, 0, 6), so that ${pts3.map((g) => `${g.name} = ${pt(g.at.map((v) => F(Math.round(v * 2), 2)))}`).join(', ')}. The plane through them is ${equation(coef, dd)} (each point satisfies it); at A the left side is 0, so the piece with A is where it is less than ${dd}. Forget the cube for a moment: the plane meets the lines AB, AD and AE at distances ${ints.map(fr).join(', ')} from A, cutting off a corner tetrahedron with volume ${ints.map(fr).join('·')}/6 = ${fr(V0)}. But it pokes out of the cube. ${pokes.join(' ')} ${twice.join(' ')} So the piece that contains A has volume ${[fr(V0), ...pokes.length ? over.filter((x) => x).map((x) => fr(F(x, six))) : []].join(' − ')}${pairs.filter((p) => p[2] > 0).map((p) => ` + ${fr(F(p[2], six))}`).join('')} = <b>${showFrac(V)}</b>.`.replace(/ {2,}/g, ' '),
        check: () => {
          // add the piece up slice by slice: each level is the part of the square below the line ax + by = dd − cz
          const sq = [[0, 0], [s, 0], [s, s], [0, s]], area = (z) => shoelace(clip(sq, (p) => dd - c * z - a * p[0] - b * p[1])), N = 3000, hh = s / N;
          let tot = area(0) + area(s);
          for (let i = 1; i < N; i++) tot += (i % 2 ? 4 : 2) * area(i * hh);
          const onPlane = pts3.every((g) => Math.abs(dot3(coef, g.at) - dd) < 1e-9);
          return (onPlane ? '' : 'not on the plane') || near((tot * hh) / 3, fv(V), 'volume', 1e-7);
        },
      };
    },
    // a corner cut off a box: the triangle's area (a height through two right angles) or how far the plane is from A
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'distance' : 'area', turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [[p, q, r]] = pick(turn, `cube-prong-${ask}`, [PRONGS]), N = p * p * q * q + q * q * r * r + r * r * p * p, qr2 = q * q + r * r;
      const correct = ask === 'area' ? fracSurd(1, 2, N) : fracSurd(p * q * r, N, N);
      const wrongs = ask === 'area'
        ? [fracSurd(1, 1, N), fl(p * q + q * r + r * p, 2), fracSurd(1, 2, p * p + q * q + r * r), fracSurd(1, 2, p * p * q * q + q * q * r * r), fracSurd(1, 4, N), fracSurd(1, 2, (p * p + q * q) * (q * q + r * r)), fl(p * q * r, 2), fracSurd(1, 6, N)]
        : [fracSurd(p * q * r, 2 * N, N), fracSurd(3 * p * q * r, N, N), fracSurd(1, 1, (p * p + q * q + r * r)), fracSurd(p * q * r, 3 * N, N), fl(p * q * r, p * q + q * r + r * p), fracSurd(2 * p * q * r, N, N), fracSurd(1, 3, p * p + q * q + r * r), fracSurd(p * q * r, 6 * N, N)];
      // the picture: the corner A at the bottom, its three edges going up to the right, up to the left and straight up
      const iso = ([x, y, z]) => [(x - y) * Math.cos(Math.PI / 6), z + (x + y) * Math.sin(Math.PI / 6)], ends = [[p * 1.45, 0, 0], [0, q * 1.45, 0], [0, 0, r * 1.3]];
      const T = fit([[0, 0, 0], ...ends].map(iso), 320, 280, 34), A0 = T(iso([0, 0, 0])), P = T(iso([p, 0, 0])), Q = T(iso([0, q, 0])), R = T(iso([0, 0, r])), ctr = centre([P, Q, R]);
      const edges = ends.map((e) => seg(A0, T(iso(e))));
      const QR = rootF(F(qr2)), AK2 = F(q * q * r * r, qr2), PK2 = fa(F(p * p), AK2);
      const working = `Drop the perpendicular from A to QR, meeting it at K. In right triangle AQR, QR = √(${q}² + ${r}²) = ${QR[1]} and AK = AQ·AR/QR, so AK² = (${q}·${r})² ÷ ${qr2} = ${fr(AK2)}. PA is perpendicular to the whole face AQR, so triangle PAK has a right angle at A, and PK² = ${p}² + ${fr(AK2)} = ${fr(PK2)}. By the theorem of three perpendiculars, PK is perpendicular to QR, so it is the height of triangle PQR on the base QR, and [PQR] = ½·QR·PK = ½√(${qr2}·${fr(PK2)}) = ½√${N}`;
      return {
        topic: 'Slicing a cube', rank: ask === 'area' ? 20 : 22,
        text: `Three edges of a box meet at the corner A. Points P, Q and R lie on these edges, with AP = ${p}, AQ = ${q} and AR = ${r}. ${ask === 'area' ? 'What is the area of triangle PQR?' : 'How far is A from the plane through P, Q and R?'}`,
        figure: svg(340, 290, 'Triangle PQR cut off a corner of a box', [poly([P, Q, R]), ...edges, dot(P), dot(Q), dot(R), label([A0[0], A0[1] + 16], 'A'), ...[[P, 'P'], [Q, 'Q'], [R, 'R']].map(([pp, nm]) => label(away(pp, ctr, 14), nm))]),
        answer: labelledS(d, correct, sane(wrongs)),
        solution: ask === 'area'
          ? `${working} = <b>${correct[1]}</b>.`
          : `First the area of PQR. ${working}. The tetrahedron APQR has volume ⅙·${p}·${q}·${r} = ${frac(p * q * r, 6)}, counting AQR as its base; counting PQR as its base instead, it is ⅓·[PQR]·h, where h is the distance from A to the plane. So h = 3·${frac(p * q * r, 6)} ÷ (½√${N}) = <b>${correct[1]}</b>.`,
        check: () => {
          const P3 = [p, 0, 0], Q3 = [0, q, 0], R3 = [0, 0, r], la = dist(Q3, R3), lb = dist(R3, P3), lc = dist(P3, Q3), sh = (la + lb + lc) / 2, heron = Math.sqrt(sh * (sh - la) * (sh - lb) * (sh - lc));
          return near(ask === 'area' ? heron : toPlane([0, 0, 0], P3, Q3, R3), correct[0], ask);
        },
      };
    },
  ],
};
