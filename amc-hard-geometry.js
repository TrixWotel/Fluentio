// Harder geometry for the AMC 10 practice (ranks 12 to 19): power of a point, angle bisectors, angles in circles and
// areas cut by a line, built on contest ideas with new numbers and wording. Each topic asks its idea four ways (another
// unknown, the question turned around, another setting), every figure is drawn to scale from the variant's own numbers,
// and every check() works the answer out again with coordinates: circles through three points, lines meeting, angles
// from vectors, and areas by the shoelace formula, with bisection where a line has to be turned or slid until a ratio
// or an area comes out right.
import { combo, num, frac, gcd } from '../kit/bank.js';
import { choices, labelled, surd, fracSurd, showFrac, range } from './amc-kit.js';

// ---------- drawing: an svg with the triangle styles (side, dash, seg, arc, tick, vx and ang) ----------
const r2 = (v) => Math.round(v * 100) / 100;
const pts = (list) => list.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ');
const svg = (w, h, name, parts) => `<svg class="tri" viewBox="0 0 ${w} ${h}" role="img" aria-label="${name}">${parts.join('')}</svg>`;
const poly = (list, cls = 'side') => `<polygon class="${cls}" points="${pts(list)}"/>`;
const seg = ([x1, y1], [x2, y2], cls = 'side') => `<line class="${cls}" x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}"/>`;
const ring = ([x, y], r, cls = 'side') => `<circle class="${cls}" cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}"/>`;
const label = ([x, y], text, cls = 'vx', anchor = 'middle') => `<text class="${cls}" x="${r2(x)}" y="${r2(y + 5)}" text-anchor="${anchor}">${text}</text>`;
const dot = (p) => ring(p, 2.6, 'seg');
const mid = (p, q) => [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
const unit = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1; return [dx / l, dy / l]; };
const along = (p, u, t) => [p[0] + t * u[0], p[1] + t * u[1]];
const away = (p, from, dist = 15) => along(p, unit(from, p), dist);   // just outside p, on the far side from a centre
const centre = (list) => [list.reduce((s, p) => s + p[0], 0) / list.length, list.reduce((s, p) => s + p[1], 0) / list.length];
// the middle of segment pq, moved gap across it to the side where `toward` is (to the other side when gap < 0)
function beside(p, q, toward, gap = 12) {
  const m = mid(p, q), u = unit(p, q), n = [-u[1], u[0]], s = (toward[0] - m[0]) * n[0] + (toward[1] - m[1]) * n[1] < 0 ? -1 : 1;
  return [m[0] + s * gap * n[0], m[1] + s * gap * n[1]];
}
// the two places gap away on either side of the middle of pq: the one farthest from the busy points
function freeSide(p, q, busy, gap = 12) {
  const m = mid(p, q), u = unit(p, q), cands = [[m[0] - gap * u[1], m[1] + gap * u[0]], [m[0] + gap * u[1], m[1] - gap * u[0]]];
  const room = (c) => Math.min(...busy.map((b) => Math.hypot(c[0] - b[0], c[1] - b[1])));
  return room(cands[0]) >= room(cands[1]) ? cands[0] : cands[1];
}
// where a label goes just outside p, on the far side from `from`, pushed out further for a wide text going sideways
function outAt(p, from, text, gap = 11) {
  const u = unit(from, p), wide = 4.2 * String(text).replace(/<[^>]+>/g, '').length;
  return along(p, u, gap + wide * Math.abs(u[0]) + 6 * Math.abs(u[1]));
}
// an angle's arc at V (between the rays to P and Q) and its value, put in the widest part left between any other lines
// leaving V inside the angle (splits), far enough out to clear them
function valueAt(V, P, Q, text, splits = []) {
  const ang = (p) => Math.atan2(p[1] - V[1], p[0] - V[0]), a0 = ang(P);
  let sweep = ang(Q) - a0;
  while (sweep <= -Math.PI) sweep += 2 * Math.PI;
  while (sweep > Math.PI) sweep -= 2 * Math.PI;
  const rel = (p) => { let t = (ang(p) - a0) * Math.sign(sweep); while (t < 0) t += 2 * Math.PI; return t; };
  const cuts = [0, ...splits.map(rel).filter((t) => t > 0 && t < Math.abs(sweep)), Math.abs(sweep)].sort((x, y) => x - y);
  let best = [0, 0];
  for (let i = 1; i < cuts.length; i++) if (cuts[i] - cuts[i - 1] > best[1] - best[0]) best = [cuts[i - 1], cuts[i]];
  const part = best[1] - best[0], m = a0 + Math.sign(sweep) * (best[0] + part / 2), r = splits.length ? Math.min(72, Math.max(44, 16 / Math.sin(part / 2))) : 34;
  return arcMark(V, P, Q, 18) + label([V[0] + r * Math.cos(m), V[1] + r * Math.sin(m)], text, 'ang');
}
// how far p is from the segment ab
const toSeg = (p, [a, b]) => { const v = [b[0] - a[0], b[1] - a[1]], t = Math.max(0, Math.min(1, ((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / (v[0] * v[0] + v[1] * v[1] || 1))); return Math.hypot(p[0] - a[0] - t * v[0], p[1] - a[1] - t * v[1]); };
// a corner's name just outside it, away from the centre, turned aside when one of the drawn lines passes there (an
// unnamed corner with no clear spot gets no name)
function cornerName(p, ctr, text, lines, needed = true, gap = 14) {
  const base = Math.atan2(p[1] - ctr[1], p[0] - ctr[0]), spots = [0, 0.5, -0.5, 1, -1].map((t) => [p[0] + gap * Math.cos(base + t), p[1] + gap * Math.sin(base + t)]);
  const room = (s) => Math.min(99, ...lines.map((l) => toSeg(s, l))), best = spots.find((s) => room(s) >= 10) ?? spots.reduce((x, y) => (room(y) > room(x) ? y : x));
  return needed || room(best) >= 8 ? label(best, text) : '';
}
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
// an arc marking the angle at `at` between the directions to p and q (picture coordinates), with its label if given;
// tick puts a short stroke across the arc, for two angles marked equal; cls 'arc ext' draws it in the second color
function arcMark(at, p, q, r = 22, text = '', tick = false, cls = 'arc') {
  const u = unit(at, p), v = unit(at, q), a1 = Math.atan2(u[1], u[0]);
  let sweep = Math.atan2(v[1], v[0]) - a1;
  while (sweep <= -Math.PI) sweep += 2 * Math.PI;
  while (sweep > Math.PI) sweep -= 2 * Math.PI;
  const m = a1 + sweep / 2, end = [at[0] + r * Math.cos(a1 + sweep), at[1] + r * Math.sin(a1 + sweep)], out = [];
  out.push(`<path class="${cls}" d="M${r2(at[0] + r * u[0])} ${r2(at[1] + r * u[1])} A${r} ${r} 0 0 ${sweep > 0 ? 1 : 0} ${r2(end[0])} ${r2(end[1])}"/>`);
  if (tick) out.push(seg([at[0] + (r - 5) * Math.cos(m), at[1] + (r - 5) * Math.sin(m)], [at[0] + (r + 5) * Math.cos(m), at[1] + (r + 5) * Math.sin(m)], 'tick'));
  if (text) out.push(label([at[0] + (r + 15) * Math.cos(m), at[1] + (r + 15) * Math.sin(m)], text, 'ang'));
  return out.join('');
}
// a coordinate picture: fits the points and the origin with a margin (and room to spare across, mx, and up and down,
// my), with the axes drawn across it
function plane(list, w, h, pad = 30, mx = 0, my = 0) {
  const xs = [0, ...list.map((p) => p[0])], ys = [0, ...list.map((p) => p[1])];
  const bx = [Math.min(...xs) - 0.8 - mx, Math.max(...xs) + 0.8 + mx], by = [Math.min(...ys) - 0.8 - my, Math.max(...ys) + 0.8 + my], T = frame(bx, by, w, h, pad);
  return { T, bx, by, axes: [seg(T([bx[0], 0]), T([bx[1], 0]), 'arc'), seg(T([0, by[0]]), T([0, by[1]]), 'arc')] };
}

// ---------- coordinates ----------
const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);
const dir = (deg) => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
// where the line through a, b meets the line through c, e
function meet([a, b], [c, e]) {
  const r = [b[0] - a[0], b[1] - a[1]], s = [e[0] - c[0], e[1] - c[1]], den = r[0] * s[1] - r[1] * s[0];
  const t = ((c[0] - a[0]) * s[1] - (c[1] - a[1]) * s[0]) / den;
  return [a[0] + t * r[0], a[1] + t * r[1]];
}
// the circle through three points: its centre o and radius r
function circle3(a, b, c) {
  const sq = (p) => p[0] * p[0] + p[1] * p[1], den = 2 * (a[0] * (b[1] - c[1]) + b[0] * (c[1] - a[1]) + c[0] * (a[1] - b[1]));
  const o = [(sq(a) * (b[1] - c[1]) + sq(b) * (c[1] - a[1]) + sq(c) * (a[1] - b[1])) / den, (sq(a) * (c[0] - b[0]) + sq(b) * (a[0] - c[0]) + sq(c) * (b[0] - a[0])) / den];
  return { o, r: dist(o, a) };
}
// the two values of t (smaller first) where the line p + t·u, u a unit vector, meets the circle with centre o and radius r
function hits(p, u, o, r) {
  const w = [p[0] - o[0], p[1] - o[1]], b = w[0] * u[0] + w[1] * u[1], disc = Math.sqrt(Math.max(0, b * b - (w[0] * w[0] + w[1] * w[1] - r * r)));
  return [-b - disc, -b + disc];
}
// the angle at q between the rays to p and r, in degrees
function angleAt(p, q, r) {
  const u = [p[0] - q[0], p[1] - q[1]], v = [r[0] - q[0], r[1] - q[1]];
  return (Math.acos(Math.max(-1, Math.min(1, (u[0] * v[0] + u[1] * v[1]) / (Math.hypot(...u) * Math.hypot(...v))))) * 180) / Math.PI;
}
// the foot of the perpendicular from p to the line through a and b
function project(p, a, b) {
  const v = [b[0] - a[0], b[1] - a[1]], t = ((p[0] - a[0]) * v[0] + (p[1] - a[1]) * v[1]) / (v[0] * v[0] + v[1] * v[1]);
  return [a[0] + t * v[0], a[1] + t * v[1]];
}
// triangle ABC with BC = a along the x-axis from B = (0, 0), CA = b and AB = c
function corners(a, b, c) {
  const x = (a * a + c * c - b * b) / (2 * a);
  return { A: [x, Math.sqrt(c * c - x * x)], B: [0, 0], C: [a, 0] };
}
// a point on the bisector of the angle at V (between the rays to P and Q), and where that bisector meets line PQ
const halfway = (V, P, Q) => { const u = unit(V, P), v = unit(V, Q); return [V[0] + u[0] + v[0], V[1] + u[1] + v[1]]; };
const bisect = (V, P, Q) => meet([V, halfway(V, P, Q)], [P, Q]);
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
  for (let i = 0; i < 70; i++) { const m = (lo + hi) / 2; if ((f(m) > 0) === below) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

// ---------- numbers ----------
const lowest = (p, q) => { const g = gcd(p, q) || 1; return [p / g, q / g]; };
const near = (got, want, what, tol = 1e-6) => (Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)) ? '' : `${what}: worked out ${got}, said ${want}`);
const ratio = (p, q) => { const [x, y] = lowest(p, q); return [x / y, `${x} : ${y}`]; };
// a ratio x : y, then (when it isn't already) in lowest terms, the last one in bold
const chain = (x, y) => { const [p, q] = lowest(x, y); return p === x ? `<b>${x} : ${y}</b>` : `${x} : ${y} = <b>${p} : ${q}</b>`; };
const simplest = (x, y) => { const [p, q] = lowest(x, y); return p === x ? `${x} : ${y}` : `${x} : ${y} = ${p} : ${q}`; };
const half2 = (p) => (p >= 0 && p % 2 === 0 ? `${p / 2}²` : `(${frac(p, 2)})²`);   // (p/2)², without brackets round a whole number
const fl = (p, q = 1) => [p / q, frac(p, q)];                                                    // p/q as [value, how it reads]
const rootOf = (n, m = 1) => { const [p, q] = lowest(n, m); return fracSurd(1, q, p * q); };      // √(n/m), simplified
const times = (L, n, m) => { const [p, q] = lowest(n, m); return fracSurd(L, q, p * q); };        // L·√(n/m), simplified
const deg = (v) => `${num(v, 1)}°`;
const pt = ([x, y]) => `(${num(x)}, ${num(y)})`;
const sides = (n) => `${n} side${n === 1 ? '' : 's'}`;
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
// labelled() needs four wrong answers with different values, none of them the right one
const enough = (correct, wrongs) => { const list = [correct]; for (const w of wrongs) if (Number.isFinite(w[0]) && !list.some((x) => Math.abs(x[0] - w[0]) < 1e-9)) list.push(w); return list.length >= 5; };
// choices() reads fractions [p, q]: the wrong ones that are positive, in lowest terms
const positive = (list) => list.filter((v) => v[0] > 0 && v[1] > 0).map((v) => lowest(...v));

// ---------- the numbers each question type walks through ----------
const LETTERS = [['A', 'B', 'C', 'D', 'E'], ['P', 'Q', 'R', 'S', 'T'], ['K', 'L', 'M', 'N', 'X']];
// two chords crossing: AE = a and EB = b, and CD's pieces c < e with ce = ab (not just a and b again)
const CHORDS = [];
for (let a = 2; a <= 9; a++) for (let b = a; b <= 14; b++) for (let c = 2; c * c < a * b; c++) {
  const e = (a * b) / c;
  if (Number.isInteger(e) && c !== a && e <= 6 * c && a * b <= 90) CHORDS.push([a, b, c, e]);
}
// a tangent PT = t and a secant from the same point P: PA = x and AB = y, with x(x + y) = t²
const TANGENTS = [];
for (let x = 2; x <= 16; x++) for (let y = 2; y <= 21; y++) { const t = Math.sqrt(x * (x + y)); if (Number.isInteger(t) && t <= 20) TANGENTS.push([x, y, t]); }
// two secants from P: PA = x, AB = y, PC = c and CD = z, with x(x + y) = c(c + z)
const SECANTS = [];
for (let x = 2; x <= 9; x++) for (let y = 2; y <= 12; y++) for (let c = 2; c <= 12; c++) {
  const z = (x * (x + y)) / c - c;
  if (c !== x && Number.isInteger(z) && z >= 2 && z <= 14) SECANTS.push([x, y, c, z]);
}
// a point P at distance d from the centre of a circle of radius r. Inside: a chord through P with pieces x and kx, so
// kx² = r² − d². Outside: a line through P meeting the circle at A and then B with AB = k·PA, so (k + 1)·PA² = d² − r².
// Either way x² = m is whole, and the line really meets the circle like that (it isn't longer than the circle allows)
const INSIDE = [], OUTSIDE = [];
for (let r = 3; r <= 13; r++) {
  for (let d = 1; d < r; d++) for (const k of [2, 3, 4]) { const m = (r * r - d * d) / k; if (Number.isInteger(m) && (k + 1) ** 2 * m < 3.9 * r * r) INSIDE.push([r, d, k, m]); }
  for (let d = r + 1; d <= 3 * r; d++) for (const k of [1, 2]) { const m = (d * d - r * r) / (k + 1); if (Number.isInteger(m) && (k + 2) ** 2 * m < 3.9 * d * d) OUTSIDE.push([r, d, k, m]); }
}
// perpendicular chords crossing at E: AE = a, EB = b, CE = c and ED = e = ab/c, the centre on neither chord
const CROSS = [];
for (let a = 1; a <= 9; a++) for (let b = 1; b <= 12; b++) for (let c = 1; c <= 10; c++) {
  const e = (a * b) / c;
  if (a !== b && Number.isInteger(e) && e !== c && c !== a && c !== b && e <= 14 && Math.min(a, b, c) >= 2) CROSS.push([a, b, c, e]);
}
// a bisector from A cutting BC into BD = p and DC = q, so AB = mp and AC = mq for some m > 1: a real triangle, not too flat
const SPLITS = [];
for (let p = 2; p <= 9; p++) for (let q = 2; q <= 9; q++) for (const [mt, mb] of [[3, 2], [2, 1], [5, 2], [3, 1], [4, 3], [5, 3], [5, 4], [7, 4]]) {
  const AB = (mt * p) / mb, AC = (mt * q) / mb;
  if (p !== q && Number.isInteger(AB) && Number.isInteger(AC) && Math.abs(AB - AC) < 0.8 * (p + q) && AB + AC + p + q <= 60) SPLITS.push([p, q, AB, AC]);
}
// whole-number sides a = BC, b = CA and c = AB (b ≠ c, not too flat) whose bisector from A cuts BC into whole numbers
const BISECTED = [];
for (let a = 4; a <= 16; a++) for (let b = 3; b <= 16; b++) for (let c = 3; c <= 16; c++) {
  const bd = (a * c) / (b + c);
  if (b !== c && a + 1 < b + c && b + 1 < a + c && c + 1 < a + b && Number.isInteger(bd)) BISECTED.push([a, b, c, bd, a - bd]);
}
// two right triangles glued along a common leg h, the altitude AH: BH = p with AB = c1, and HC = q with AC = c2
const LEGS = {};
for (let p = 1; p <= 36; p++) for (let h = 3; h <= 24; h++) { const hyp = Math.hypot(p, h); if (Number.isInteger(hyp) && hyp <= 40) (LEGS[h] = LEGS[h] || []).push([p, hyp]); }
const GLUED = [];
for (const h of Object.keys(LEGS)) for (const [p, c1] of LEGS[h]) for (const [q, c2] of LEGS[h]) if (p !== q && p + q <= 40) GLUED.push([+h, p, c1, q, c2]);
// whole-number triangles a = BC, b = CA, c = AB, not too flat, with no two sides equal
const TRIANGLES = [];
for (let a = 4; a <= 15; a++) for (let b = 4; b <= 15; b++) for (let c = 3; c <= 13; c++) if (a + 1 < b + c && b + 1 < a + c && c + 1 < a + b && a !== b && b !== c && a !== c) TRIANGLES.push([a, b, c]);
// four arcs AB, BC, CD, DA in the ratio p : q : r : s, the parts adding to a divisor of 360 (so each part is whole),
// in lowest terms, no arc a half circle or more, and the quadrilateral's four angles all different
const ARCS = [];
for (const S of [9, 10, 12, 15, 18, 20, 24]) for (let p = 1; p <= 9; p++) for (let q = 1; q <= 9; q++) for (let r = 1; r <= 9; r++) {
  const s = S - p - q - r, u = 360 / S;
  if (s < 1 || s > 9 || gcd(gcd(p, q), gcd(r, s)) > 1 || Math.max(p, q, r, s) * u >= 180) continue;
  const angles = [(q + r) * u, (r + s) * u, (s + p) * u, (p + q) * u];
  if (new Set(angles).size === 4) ARCS.push([p, q, r, s]);
}
const POLYGON = { 8: 'octagon', 9: 'nonagon', 10: 'decagon', 12: '12-sided polygon', 15: '15-sided polygon', 18: '18-sided polygon' };
const VERTICES = 'ABCDEFGHIJKLMNOPQR';
// a regular n-gon's corners on the unit circle, the first at the top, going clockwise
const corner0 = (n, i) => dir(90 - (i * 360) / n);
// two diagonals of a regular n-gon from corners i < j < k < l, ViVk and VjVl, crossing inside, not too near the edge
// (so the angle at X can be seen); ask 0 is ∠ViXVj, ask 1 ∠VjXVk
const CROSSING = [];
for (const n of [8, 9, 10, 12, 15, 18]) for (let i = 0; i <= 1; i++) for (let j = i + 1; j < n; j++) for (let k = j + 1; k < n; k++) for (let l = k + 1; l < n; l++) {
  const diagonal = (x, y) => y - x >= 2 && n - (y - x) >= 2, [Vi, Vj, Vk, Vl] = [i, j, k, l].map((v) => corner0(n, v));
  if (diagonal(i, k) && diagonal(j, l) && l - i <= 10 && Math.hypot(...meet([Vi, Vk], [Vj, Vl])) <= 0.72) for (const ask of [0, 1]) CROSSING.push([n, i, j, k, l, ask]);
}
// lines through corners of a regular n-gon meeting outside it at X: ViVj and VlVk (i < j < k < l) or the tangent at Vi
// and VlVk (i < k < l, j = i). X is past Vj and Vk, so the near arc runs from Vj to Vk and the far arc from Vl round to
// Vi; the angle at X is at least 12°, and X is clear of the polygon but not far off the picture
const MEETING = [];
for (const n of [8, 9, 10, 12, 15, 18]) for (let i = 0; i <= 1; i++) for (let j = i; j < n; j++) for (let k = j + 1; k < n; k++) for (let l = k + 1; l < n; l++) {
  const near = k - j, far = n - l + i, angle = ((far - near) * 180) / n;
  if (far <= near || angle < 12 || (j > i && j - i > 3)) continue;
  const [Vi, Vj, Vk, Vl] = [i, j, k, l].map((v) => corner0(n, v)), tangent = j === i;
  const X = meet([Vi, tangent ? [Vi[0] + Vi[1], Vi[1] - Vi[0]] : Vj], [Vl, Vk]);
  if (Math.hypot(...X) >= 1.3 && Math.hypot(...X) <= 2.6) MEETING.push([n, i, j, k, l]);
}
// acute triangles with ∠B = β and ∠C = γ (so ∠A = 180° − β − γ), every angle from 36° to 80° (so no answer is a sliver),
// β and γ not close
const ACUTE = [];
for (let b = 36; b <= 80; b += 2) for (let c = 36; c <= 80; c += 2) { const a = 180 - b - c; if (a >= 36 && a <= 80 && Math.abs(b - c) >= 6) ACUTE.push([b, c]); }
// a triangle with whole-number corners A, B (up and to the right of A) and C (to the right), and a ratio m : n for the
// areas of the pieces next to B and C; the slope of the cutting line, and the slopes the usual slips give, all positive
const VERTEX_CUTS = [];
for (const A of [[0, 0], [1, 1], [-1, 2], [2, -1]]) for (const [bx, by] of [[1, 6], [2, 8], [3, 7], [0, 5], [2, 5]]) for (const [cx, cy] of [[9, 1], [10, -2], [8, 3], [11, 2], [7, -1]]) {
  for (const [m, n] of [[1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, 4], [3, 4]]) VERTEX_CUTS.push([A, [A[0] + bx, A[1] + by], [A[0] + cx, A[1] + cy], m, n]);
}
// a line parallel to BC cutting off the fraction p/(p + q) of triangle ABC at A (p : q is triangle : trapezoid)
const PARALLEL = [];
for (const L of [6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 21, 24]) for (const [p, q] of [[1, 1], [1, 2], [2, 1], [1, 3], [1, 8], [4, 5], [9, 7], [16, 9], [1, 15], [4, 21], [2, 7], [3, 1], [2, 3]]) PARALLEL.push([L, p, q]);
// a trapezoid's parallel sides a < b (both odd or both even, so (a² + b²)/2 is whole)
const HALVING = [[1, 7], [7, 17], [2, 14], [3, 21], [7, 23], [17, 31], [4, 10], [2, 4], [5, 11], [6, 8], [2, 10], [1, 5], [3, 9], [6, 12], [5, 7], [4, 6]];
// triangles with whole-number corners for a level or upright halving line: x-coordinates (or y-coordinates) u1 < u2 < u3,
// the other coordinates from a few shapes; u2 isn't in the middle (the line would go through it) and (u3 − u1)·(wider part) is even
const HALVES = [];
for (let u1 = -2; u1 <= 2; u1++) for (let u2 = u1 + 1; u2 <= 7; u2++) for (let u3 = u2 + 1; u3 <= 11; u3++) {
  const wide = Math.max(u2 - u1, u3 - u2);
  if (u2 - u1 === u3 - u2 || ((u3 - u1) * wide) % 2 || u3 - u1 < 5) continue;
  const m = ((u3 - u1) * wide) / 2, k = u3 - u2 > u2 - u1 ? u3 - Math.sqrt(m) : u1 + Math.sqrt(m);
  if (Math.abs(k - u2) < 0.35) continue;
  for (const shape of [[0, 6, 1], [1, 7, -1], [5, -1, 2], [0, -4, 3], [-1, 5, 4], [4, 0, 6]]) {
    // no slivers: the triangle fills a fair part of the box around it
    if (shoelace([u1, u2, u3].map((v, i) => [v, shape[i]])) < 0.22 * (u3 - u1) * (Math.max(...shape) - Math.min(...shape))) continue;
    for (const upright of [true, false]) HALVES.push([u1, u2, u3, shape, upright]);
  }
}
// cevians AD and BE: BD : DC = m : n, CE : EA = p : q (not both midpoints), and which region is asked for
const CEVIANS = [];
for (const [m, n] of [[1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [3, 4]]) for (const [p, q] of [[1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2]]) {
  if (m === n && p === q) continue;
  for (const ask of ['ABP', 'PDCE']) CEVIANS.push([m, n, p, q, ask]);
}

// ---------- answers worked out in one place, so combo() can skip the combinations whose wrong answers coincide ----------
const pointAnswers = (inside, [r, d, k, m]) => {
  const pw = Math.abs(r * r - d * d);
  return inside
    ? [surd(k + 1, m), [[2 * r, num(2 * r, 0)], surd(2, pw), surd(k, m), surd(1, m), [r + d, num(r + d, 0)]]]
    : [surd(k, m), [surd(k + 1, m), surd(1, pw), surd(1, k * pw), surd(k, pw), ...(k > 1 ? [surd(1, m)] : [])]];
};
const crossAnswers = ([a, b, c, e], ask) => {
  const S = a * a + b * b + c * c + e * e, Q = (a - b) ** 2 + (c - e) ** 2;
  return ask === 'radius'
    ? [fracSurd(1, 2, S), [surd(1, S), fl(a + b, 2), fl(c + e, 2), fracSurd(1, 2, (a + b) ** 2 + (c + e) ** 2), fracSurd(1, 2, a * a + b * b + 2 * c * c)]]
    : [fracSurd(1, 2, Q), [surd(1, Q), fl(Math.abs(a - b), 2), fl(Math.abs(c - e), 2), fl(Math.abs(a - b) + Math.abs(c - e), 2), fracSurd(1, 2, S)]];
};
const lengthAnswers = ([a, b, c, bd, dc]) => [surd(1, b * c - bd * dc), [surd(1, b * c), surd(1, b * c + bd * dc), fracSurd(1, 2, 2 * b * b + 2 * c * c - a * a), ...(c > bd ? [surd(1, c * c - bd * bd)] : []), surd(1, bd * dc)]];
const altitudeAnswers = ([h, p, c1, q, c2]) => [ratio(c1, p), [ratio(p, c1), ratio(c1, p + q), ratio(c1, c2), ratio(h, p), ratio(1, 1)]];
const medianAnswers = ([a, b, c]) => [ratio(2 * c, b), [ratio(c, b), ratio(b, 2 * c), ratio(2, 1), ratio(2 * c, a), ratio(c, a)]];
// AI and ID from AD² = bc − BD·DC and AI : ID = AB : BD; the wrong ones: AD itself, the other piece, half of AD, the
// inradius, and the piece AB : AC would give
const incentreAnswers = ([a, b, c, bd, dc], ask) => {
  const ad2 = b * c - bd * dc, s2 = a + b + c, part = (x) => rootOf(ad2 * x * x, (c + bd) ** 2);
  return [ask === 'AI' ? part(c) : part(bd), [surd(1, ad2), ask === 'AI' ? part(bd) : part(c), rootOf(ad2, 4), rootOf((b + c - a) * (c + a - b) * (a + b - c), 4 * s2), rootOf(ad2 * (ask === 'AI' ? c * c : b * b), (b + c) ** 2)]];
};
const incentreSquare = ([a, b, c, bd, dc], ask) => lowest((b * c - bd * dc) * (ask === 'AI' ? c * c : bd * bd), (c + bd) ** 2);
const trapezoidAnswers = ([a, b]) => [rootOf(a * a + b * b, 2), [fl(a + b, 2), surd(1, a * b), fl(2 * a * b, a + b), surd(1, a * a + b * b), fl(a * a + b * b, a + b)]];
const parallelAnswers = ([L, p, q]) => [times(L, p, p + q), [fl(L * p, p + q), times(L, p, q), times(L, q, p + q), fl(L, 2), [L * (1 - Math.sqrt(p / (p + q))), `${L}(1 − ${times(1, p, p + q)[1]})`]]];
// the halving line for the triangle with coordinates u1 < u2 < u3 along the axis it crosses
function halving(u1, u2, u3) {
  const high = u3 - u2 > u2 - u1, m = ((u3 - u1) * (high ? u3 - u2 : u2 - u1)) / 2, rt = surd(1, m), whole = Number.isInteger(Math.sqrt(m));
  const k = high ? u3 - Math.sqrt(m) : u1 + Math.sqrt(m);
  const read = (base, sign, root) => (base === 0 && sign > 0 ? root : `${num(base, 0)} ${sign > 0 ? '+' : '−'} ${root}`);
  const correct = [k, whole ? num(k, 0) : read(high ? u3 : u1, high ? -1 : 1, rt[1])];
  const slip = (u3 - u1) / Math.SQRT2, other = rootOf((u3 - u1) * (high ? u2 - u1 : u3 - u2), 2);
  const wrongs = [fl(u1 + u2 + u3, 3), fl(u1 + u3, 2), [u2, num(u2, 0)],
    [high ? u3 - slip : u1 + slip, read(high ? u3 : u1, high ? -1 : 1, fracSurd(u3 - u1, 2, 2)[1])],
    [high ? u1 + other[0] : u3 - other[0], read(high ? u1 : u3, high ? 1 : -1, other[1])]];
  return { high, m, k, rt, whole, correct, wrongs };
}
// the cevians' regions as fractions of the whole: mass points give AP : PD = (wB + wC) : wA
function cevianParts(m, n, p, q) {
  const g = gcd(gcd(m * p, n * q), m * q), wA = (m * p) / g, wB = (n * q) / g, wC = (m * q) / g, wD = wB + wC;
  const ABD = [m, m + n], ABE = [q, p + q], ABP = lowest(m * wD, (m + n) * (wD + wA));
  const sub = ([a, b], [c, e]) => lowest(a * e - c * b, b * e);
  const BPD = sub(ABD, ABP), APE = sub(ABE, ABP), PDCE = sub(sub([1, 1], ABD), sub(ABE, ABP)), CDE = lowest(n * p, (m + n) * (p + q));
  return { wA, wB, wC, wD, ABD, ABE, ABP, BPD, APE, PDCE, CDE, rest: sub(sub([1, 1], ABD), ABE) };
}
const lcm = (a, b) => (a / gcd(a, b)) * b;

export const hardGeometry = {
  'Power of a point': [
    // two chords cross: their pieces multiply to the same number, so with the whole of CD known its pieces solve a quadratic
    (d, ctx) => {
      const [[a0, b0, c, e], flip] = pick(ctx, 'pp-chords', [CHORDS, [false, true]]);
      const [a, b] = flip ? [b0, a0] : [a0, b0], ab = a * b, L = c + e, [A, B, C, D, E] = d.pick(LETTERS);
      // E at the origin, chord AB along u and chord CD along v; the circle is the one through A, B and C
      const u = dir(-12), v = dir(60), Aw = along([0, 0], u, -a), Bw = along([0, 0], u, b), Cw = along([0, 0], v, -c), Dw = along([0, 0], v, e);
      const { o, r } = circle3(Aw, Bw, Cw), T = frame([o[0] - r, o[0] + r], [o[1] - r, o[1] + r], 340, 300, 28);
      const [pA, pB, pC, pD, pE, pO] = [Aw, Bw, Cw, Dw, [0, 0], o].map(T), eAt = along(pE, unit([0, 0], along(unit(pE, pD), unit(pE, pA), 1)), 15);
      const aAt = freeSide(pA, pE, [eAt]), bAt = freeSide(pE, pB, [eAt, aAt]);
      return {
        topic: 'Power of a point', rank: 15,
        text: `Chords ${A}${B} and ${C}${D} of a circle cross at ${E}, with ${A}${E} = ${a} and ${E}${B} = ${b}. Chord ${C}${D} is ${L} long. How long is the shorter of its two pieces, ${C}${E} and ${E}${D}?`,
        figure: svg(340, 300, `Chords ${A}${B} and ${C}${D} crossing at ${E}`, [ring(pO, r * T.s), seg(pA, pB), seg(pC, pD, 'seg'), dot(pE),
          ...[[pA, A], [pB, B], [pC, C], [pD, D]].map(([p, s]) => label(away(p, pO, 14), s)), label(eAt, E), label(aAt, a, 'ang'), label(bAt, b, 'ang')]),
        answer: choices(d, [c, 1], positive([[e, 1], [ab, L], [a * L, a + b], [L, 2], [e - c, 1]]), showFrac),
        solution: `When two chords cross, the two pieces of one multiply to the same number as the two pieces of the other: ${A}${E}·${E}${B} = ${C}${E}·${E}${D}. (Triangles ${A}${E}${C} and ${D}${E}${B} are similar, since their angles at ${E} are vertical angles and their angles at ${A} and ${D} stand on the same arc ${B}${C}). So the pieces of ${C}${D} multiply to ${a}·${b} = ${ab} and add up to ${L}, which makes them the two roots of x² − ${L}x + ${ab} = 0. That factors as (x − ${c})(x − ${e}) = 0, so the pieces are ${c} and ${e}, and the shorter one is <b>${c}</b>.`,
        check: () => {
          // the circle through A, B and C (with CE the answer); the line from C through E meets it again at D
          const circle = circle3(Aw, Bw, Cw), [, far] = hits([0, 0], v, circle.o, circle.r);
          return near(c + far, L, 'CE + ED') || (c < far ? '' : 'CE is not the shorter piece');
        },
      };
    },
    // a tangent and a secant, or two secants, from one point: PA·PB is the same for every line through P
    (d, ctx) => {
      const tangent = ctx.k % 2 === 0, turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [row] = tangent ? pick(turn, 'pp-tangent', [TANGENTS]) : pick(turn, 'pp-secants', [SECANTS]);
      const [x, y, c, z = 0] = row, pw = x * (x + y);   // for a tangent, c is its length PT
      // the picture: centre O at the origin, P on the left; each line through P runs to its chord's middle, which is
      // (chord/2 before the far end), and the chord is √(R² − (chord/2)²) from O
      const R = Math.max(0.62 * Math.sqrt(pw), 0.56 * Math.max(y, z)), PO = Math.sqrt(pw + R * R), P = [-PO, 0];
      const toward = (len, chord, sign) => [(len + chord / 2) / PO, (sign * Math.sqrt(R * R - (chord * chord) / 4)) / PO];
      const u1 = toward(x, y, -1), u2 = tangent ? [c / PO, R / PO] : toward(c, z, 1);
      const T = frame([-PO, R], [-R, R], 400, 270, 28), [pP, pO, pA, pB, pC, pD] = [P, [0, 0], along(P, u1, x), along(P, u1, x + y), along(P, u2, c), along(P, u2, c + z)].map(T);
      const wrongs = tangent ? [[pw, y], [x + y, 1], [2 * x, 1], [c - y, 1]] : [[pw, y], [c * z, y], [x + y, 1], [2 * x, 1], [c, 1]];
      return {
        topic: 'Power of a point', rank: 16,
        text: tangent
          ? `From a point P outside a circle, a tangent touches the circle at T, and a secant cuts the circle at A and then at B. If PT = ${c} and AB = ${y}, how long is PA?`
          : `From a point P outside a circle, two lines cut the circle: one at A and then at B, the other at C and then at D. If PC = ${c}, CD = ${z} and AB = ${y}, how long is PA?`,
        figure: svg(400, 270, tangent ? 'A tangent PT and a secant PAB' : 'Two secants PAB and PCD', [ring(pO, R * T.s), seg(pP, pB), seg(pP, tangent ? pC : pD), dot(pP),
          nameAt(pP, [pB, pC], 'P'), ...(tangent ? [[pA, 'A'], [pB, 'B'], [pC, 'T']] : [[pA, 'A'], [pB, 'B'], [pC, 'C'], [pD, 'D']]).map(([p, s]) => label(away(p, pO, 14), s)),
          label(beside(pA, pB, pO), y, 'ang'), label(beside(pP, pC, pO, -12), c, 'ang'), ...(tangent ? [] : [label(beside(pC, pD, pO), z, 'ang')])]),
        answer: choices(d, [x, 1], positive(wrongs), showFrac),
        solution: tangent
          ? `By power of a point, the tangent and the secant from P satisfy PT² = PA·PB, where PB is the whole secant and not just the chord AB. (Triangles PTA and PBT are similar, since they share the angle at P, and the angle between the tangent and the chord TA equals the inscribed angle TBA). Write PA = x, so PB = x + ${y} and x(x + ${y}) = ${c}² = ${pw}. That is x² + ${y}x − ${pw} = 0, which factors as (x − ${x})(x + ${x + y}) = 0, and a length is positive, so PA = <b>${x}</b>.`
          : `By power of a point, two secants from the same point P satisfy PA·PB = PC·PD, each measured from P to both points where it meets the circle. Here PD = ${c} + ${z} = ${c + z}, so PC·PD = ${c}·${c + z} = ${pw}. Write PA = x, so PB = x + ${y} and x(x + ${y}) = ${pw}, that is x² + ${y}x − ${pw} = 0. That factors as (x − ${x})(x + ${x + y}) = 0, and a length is positive, so PA = <b>${x}</b>.`,
        check: () => {
          // the same picture from Pythagoras alone, around a circle of radius R0: P is √(PT² + R0²) from the centre (or
          // √((PC + CD/2)² + R0² − (CD/2)²)), line PAB is √(R0² − (AB/2)²) from it, and PA is the run to AB's middle less AB/2
          const R0 = Math.max(y, z) + 1, PO2 = tangent ? c * c + R0 * R0 : (c + z / 2) ** 2 + R0 * R0 - (z * z) / 4;
          return near(Math.sqrt(PO2 - (R0 * R0 - (y * y) / 4)) - y / 2, x, 'PA');
        },
      };
    },
    // a point at distance d from the centre: the pieces of every chord (or line) through it multiply to |r² − d²|
    (d, ctx) => {
      const inside = ctx.k % 2 === 0, turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      const [row] = pick(turn, inside ? 'pp-inside' : 'pp-outside', [inside ? INSIDE : OUTSIDE], (rw) => enough(...pointAnswers(inside, rw)));
      const [r, dd, k, m] = row, [correct, wrongs] = pointAnswers(inside, row), pw = Math.abs(r * r - dd * dd), x = Math.sqrt(m), xs = surd(1, m)[1];
      // P on the left of the centre O; the line through P makes the angle phi with PO, so that its two pieces come out right
      const P = [-dd, 0], phi = Math.acos(((inside ? k - 1 : k + 2) * x) / (2 * dd)), u = [Math.cos(phi), Math.sin(phi)];
      const Aw = along(P, u, inside ? -x : x), Bw = along(P, u, inside ? k * x : (k + 1) * x);
      const w = inside ? 360 : 400, h = inside ? 300 : 280, T = inside ? frame([-r, r], [-r, r], w, h, 26) : frame([-dd, r], [-r, r], w, h, 26);
      // d is written under OP, at its middle unless that is where the circle crosses it (then on the longer part)
      const dMid = !inside && Math.abs(dd / 2 - r) * T.s < 22 ? (dd - r >= r ? (dd + r) / 2 : r / 2) : dd / 2;
      const [pO, pP, pA, pB, pR, pF, pd] = [[0, 0], P, Aw, Bw, along([0, 0], dir(-60), r), project([0, 0], Aw, Bw), [-dMid, 0]].map(T);
      const AB = k === 1 ? 'x' : `${k}x`;
      return {
        topic: 'Power of a point', rank: 17,
        text: inside
          ? `A circle has radius ${r}, and P is a point inside it, ${dd} from its centre. A chord through P is cut by P into two pieces, one ${{ 2: 'twice', 3: 'three times', 4: 'four times' }[k]} as long as the other. How long is the chord?`
          : `A circle has radius ${r}, and P is a point outside it, ${dd} from its centre. A line through P meets the circle at A and then at B, with AB ${k === 1 ? 'as long as' : 'twice as long as'} PA. How long is AB?`,
        figure: svg(w, h, inside ? 'A chord through a point P inside a circle' : 'A line through a point P outside a circle', [ring(pO, r * T.s), seg(inside ? pA : pP, pB),
          seg(pO, pP, 'seg dash'), seg(pO, pR, 'seg dash'), dot(pO), dot(pP), label([pd[0], pd[1] + 13], dd, 'ang'), label(beside(pO, pR, [pR[0] + 99, pR[1]], 11), r, 'ang'),
          nameAt(pP, inside ? [pO, pA, pB] : [pO, pB], 'P'), nameAt(pO, [pP, pR, pF], 'O'), cornerName(pA, pO, 'A', [[inside ? pA : pP, pB], [pO, pP]]), cornerName(pB, pO, 'B', [[inside ? pA : pP, pB], [pO, pR]])]),
        answer: labelled(correct, wrongs),
        solution: inside
          ? `Every chord through P is cut by P into two pieces with the same product, so find that product from the easiest chord, the diameter through P. Its pieces are ${r} − ${dd} = ${r - dd} and ${r} + ${dd} = ${r + dd}, so the product is ${r}² − ${dd}² = ${pw}. Our chord's pieces are x and ${k}x, so ${k}x² = ${pw}, x² = ${m} and x = ${xs}. The chord is x + ${k}x = ${k + 1}x = <b>${correct[1]}</b>.`
          : `From a point outside, every line through P that meets the circle has the same product PA·PB, the square of the tangent from P. By Pythagoras (the radius to the point of tangency is perpendicular to the tangent), that is ${dd}² − ${r}² = ${pw}. Write PA = x; then AB = ${AB} and PB = ${k + 1}x, so ${k + 1}x² = ${pw}. So x² = ${m} and x = ${xs}, and AB = ${AB} = <b>${correct[1]}</b>.`,
        check: () => {
          // turn a line about P until the circle cuts it in the stated ratio, then measure (no power of a point)
          const cut = (f) => hits(P, [Math.cos(f), Math.sin(f)], [0, 0], r);
          const f = inside ? solve((t) => { const [t1, t2] = cut(t); return t2 / -t1 - k; }, 0, Math.PI / 2) : solve((t) => { const [t1, t2] = cut(t); return t2 / t1 - (k + 1); }, 0, Math.asin(r / dd) * (1 - 1e-12));
          const [t1, t2] = cut(f);
          return near(t2 - t1, correct[0], inside ? 'chord' : 'AB');
        },
      };
    },
    // perpendicular chords: power of a point gives the fourth piece, and the centre sits over both chords' middles
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'centre' : 'radius';
      const [[a, b, c, e]] = pick({ ...ctx, k: Math.floor(ctx.k / 2) }, `pp-cross-${ask}`, [CROSS], (row) => enough(...crossAnswers(row, ask)));
      const [correct, wrongs] = crossAnswers([a, b, c, e], ask), [A, B, C, D, E] = d.pick(LETTERS), S = a * a + b * b + c * c + e * e;
      const o = [(b - a) / 2, (e - c) / 2], R = Math.hypot((a + b) / 2, (e - c) / 2), T = frame([o[0] - R, o[0] + R], [o[1] - R, o[1] + R], 340, 300, 28);
      const [pA, pB, pC, pD, pE, pO] = [[-a, 0], [b, 0], [0, -c], [0, e], [0, 0], o].map(T);
      // E's name goes in the quarter opposite the centre (clear of the line to it), the right-angle mark in a quarter
      // beside that, and each length on whichever side of its piece is farther from those and from the labels before it
      const sx = Math.sign(pO[0] - pE[0]), sy = Math.sign(pO[1] - pE[1]), eAt = [pE[0] - 12 * sx, pE[1] - 12 * sy + 1];
      const busy = [eAt, [pE[0] + 7 * sx, pE[1] - 7 * sy], pO], aAt = freeSide(pA, pE, busy), bAt = freeSide(pE, pB, [...busy, aAt]), cAt = freeSide(pC, pE, [...busy, aAt, bAt]);
      const centreAt = `(${frac(b - a, 2)}, ${frac(e - c, 2)})`;
      const start = `By power of a point, ${C}${E}·${E}${D} = ${A}${E}·${E}${B}, so the missing piece is ${E}${D} = ${a}·${b}/${c} = ${e}. Now take ${E} as the origin, with ${A}${B} on the x-axis and ${C}${D} on the y-axis: ${A} = (−${a}, 0), ${B} = (${b}, 0), ${C} = (0, −${c}) and ${D} = (0, ${e}). The centre is on the perpendicular bisector of each chord, so it is straight above or below the middle of ${A}${B} and level with the middle of ${C}${D}, at ${centreAt}.`;
      return {
        topic: 'Power of a point', rank: ask === 'radius' ? 18 : 19,
        text: `Chords ${A}${B} and ${C}${D} of a circle are perpendicular and cross at ${E}, with ${A}${E} = ${a}, ${E}${B} = ${b} and ${C}${E} = ${c}. ${ask === 'radius' ? 'What is the radius of the circle?' : `How far is ${E} from the centre of the circle?`}`,
        figure: svg(340, 300, `Perpendicular chords ${A}${B} and ${C}${D} crossing at ${E}`, [ring(pO, R * T.s), seg(pA, pB), seg(pC, pD), corner(pE, sx > 0 ? pB : pA, sy > 0 ? pD : pC), dot(pO),
          ...(ask === 'centre' ? [seg(pE, pO, 'seg dash')] : []), ...[[pA, A], [pB, B], [pC, C], [pD, D]].map(([p, s]) => label(away(p, pO, 14), s)),
          label(eAt, E), nameAt(pO, [pE], 'O'), label(aAt, a, 'ang'), label(bAt, b, 'ang'), label(cAt, c, 'ang')]),
        answer: labelled(correct, wrongs),
        solution: ask === 'radius'
          ? `${start} The radius is its distance to ${B}, ${frac(a + b, 2)} across and ${frac(Math.abs(e - c), 2)} ${e > c ? 'down' : 'up'}: r² = ${half2(a + b)} + ${half2(Math.abs(e - c))} = ${frac(S, 4)}, which is the sum of the squares of the four pieces, divided by 4. So r = <b>${correct[1]}</b>.`
          : `${start} So the centre is ${frac(Math.abs(b - a), 2)} across and ${frac(Math.abs(e - c), 2)} ${e > c ? 'up' : 'down'} from ${E}, and their distance apart is √(${half2(Math.abs(b - a))} + ${half2(Math.abs(e - c))}) = <b>${correct[1]}</b>.`,
        check: () => {
          // the circle through A, B and C; D must be on it too, and then its radius or its centre's distance from E
          const circle = circle3([-a, 0], [b, 0], [0, -c]);
          if (Math.abs(dist(circle.o, [0, e]) - circle.r) > 1e-9) return 'D is not on the circle';
          return near(ask === 'radius' ? circle.r : Math.hypot(...circle.o), correct[0], ask);
        },
      };
    },
  ],

  'Angle bisectors': [
    // the bisector theorem turned around: the pieces of BC and the perimeter give a side
    (d, ctx) => {
      const [[p, q, AB, AC], ask] = pick(ctx, 'ab-sides', [SPLITS, ['AB', 'AC']]);
      const BC = p + q, P = AB + AC + BC, ans = ask === 'AB' ? AB : AC, piece = ask === 'AB' ? p : q, k = lowest(P - BC, BC);
      const { A, B, C } = corners(BC, AC, AB), T = fit([A, B, C], 380, 250, 34), [pA, pB, pC, pD] = [A, B, C, [p, 0]].map(T), ctr = centre([pA, pB, pC]);
      return {
        topic: 'Angle bisectors', rank: 14,
        text: `In triangle ABC, the bisector of angle A meets side BC at D, with BD = ${p} and DC = ${q}. The perimeter of triangle ABC is ${P}. How long is ${ask}?`,
        figure: svg(380, 250, 'Triangle ABC with the bisector of angle A', [poly([pA, pB, pC]), seg(pA, pD, 'seg'), arcMark(pA, pB, pD, 30, '', true), arcMark(pA, pD, pC, 30, '', true),
          ...[[pA, 'A'], [pB, 'B'], [pC, 'C']].map(([pp, s]) => label(away(pp, ctr, 14), s)), label([pD[0], pD[1] + 17], 'D'),
          label(beside(pB, pD, ctr, -13), p, 'ang'), label(beside(pD, pC, ctr, -13), q, 'ang')]),
        answer: choices(d, [ans, 1], positive([[ask === 'AB' ? AC : AB, 1], [P - BC, 2], [P * piece, BC], [P * (BC - piece), BC], [ans + piece, 1]]), showFrac),
        solution: `By the angle bisector theorem, the bisector from A cuts BC in the same ratio as the two sides next to angle A: AB : AC = BD : DC = ${p} : ${q}. So AB = ${p}k and AC = ${q}k for some number k. The perimeter is AB + AC + BC = ${BC}k + ${BC} = ${P}, so ${BC}k = ${P - BC} and k = ${frac(...k)}. Then ${ask} = ${piece}k = <b>${showFrac([ans, 1])}</b>.`,
        check: () => {
          // keep BC and AB + AC as given and slide AB until the bisector from A lands BD = p from B (coordinates, no theorem)
          const sum = P - BC, bd = (s) => { const t = corners(BC, sum - s, s); return dist(t.B, bisect(t.A, t.B, t.C)); };
          const s = solve((v) => bd(v) - p, (sum - BC) / 2 + 1e-9, (sum + BC) / 2 - 1e-9);
          return near(ask === 'AB' ? s : sum - s, ans, ask);
        },
      };
    },
    // the bisector's length: AD² = AB·AC − BD·DC
    (d, ctx) => {
      const [row] = pick(ctx, 'ab-length', [BISECTED], (rw) => enough(...lengthAnswers(rw)));
      const [a, b, c, bd, dc] = row, [correct, wrongs] = lengthAnswers(row), ad2 = b * c - bd * dc;
      const { A, B, C } = corners(a, b, c), T = fit([A, B, C], 380, 250, 34), [pA, pB, pC, pD] = [A, B, C, [bd, 0]].map(T), ctr = centre([pA, pB, pC]);
      const under = bd > dc ? beside(pB, pD, ctr, -13) : beside(pD, pC, ctr, -13);   // BC's length, under its longer piece
      return {
        topic: 'Angle bisectors', rank: 16,
        text: `Triangle ABC has AB = ${c}, AC = ${b} and BC = ${a}. The bisector of angle A meets BC at D. How long is AD?`,
        figure: svg(380, 250, 'Triangle ABC with the bisector AD', [poly([pA, pB, pC]), seg(pA, pD, 'seg'), arcMark(pA, pB, pD, 30, '', true), arcMark(pA, pD, pC, 30, '', true),
          ...[[pA, 'A'], [pB, 'B'], [pC, 'C']].map(([pp, s]) => label(away(pp, ctr, 14), s)), label([pD[0], pD[1] + 17], 'D'),
          label(beside(pA, pB, ctr, -13), c, 'ang'), label(beside(pA, pC, ctr, -13), b, 'ang'), label(under, a, 'ang')]),
        answer: labelled(correct, wrongs),
        solution: `Start with the angle bisector theorem: D cuts BC in the ratio AB : AC = ${c} : ${b}, so BD = ${a}·${frac(c, b + c)} = ${bd} and DC = ${dc}. The bisector's own length comes from Stewart's theorem, which for a bisector boils down to AD² = AB·AC − BD·DC. (To see why, extend AD to meet the circle through A, B and C again at E; then triangles ABD and AEC are similar, so AB·AC = AD·AE = AD² + AD·DE, and AD·DE = BD·DC by power of a point). Here AD² = ${c}·${b} − ${bd}·${dc} = ${ad2}, so AD = <b>${correct[1]}</b>.`,
        check: () => near(dist(A, bisect(A, B, C)), correct[0], 'AD'),
      };
    },
    // a bisector meeting an altitude or a median: the angle bisector theorem again, inside a smaller triangle
    (d, ctx) => {
      const altitude = ctx.k % 2 === 0, turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      if (altitude) {
        const [row] = pick(turn, 'ab-altitude', [GLUED], (rw) => enough(...altitudeAnswers(rw)));
        const [h, p, c1, q, c2] = row, [correct, wrongs] = altitudeAnswers(row), a = p + q;
        const { A, B, C } = corners(a, c2, c1), H = [p, 0], E = bisect(B, A, C), P = meet([B, E], [A, H]);
        const T = fit([A, B, C], 380, 260, 34), [pA, pB, pC, pH, pE, pP] = [A, B, C, H, E, P].map(T), ctr = centre([pA, pB, pC]);
        return {
          topic: 'Angle bisectors', rank: 17,
          text: `Triangle ABC has AB = ${c1}, BC = ${a} and CA = ${c2}. The altitude from A meets BC at H, and the bisector of angle B meets AH at P. What is AP : PH?`,
          figure: svg(380, 260, 'Triangle ABC with the altitude AH and the bisector of angle B', [poly([pA, pB, pC]), seg(pA, pH, 'seg dash'), corner(pH, pB, pA), seg(pB, pE, 'seg'), dot(pP),
            arcMark(pB, pA, pE, 30, '', true), arcMark(pB, pE, pC, 30, '', true), ...[[pA, 'A'], [pB, 'B'], [pC, 'C']].map(([pp, s]) => label(away(pp, ctr, 14), s)),
            label([pH[0], pH[1] + 17], 'H'), nameAt(pP, [pA, pH, pB, pE], 'P'), label(beside(pA, pB, ctr, -13), c1, 'ang'),
            label(dist(pA, pE) > dist(pE, pC) ? beside(pA, pE, ctr, -13) : beside(pE, pC, ctr, -13), c2, 'ang')]),   // CA's length, clear of the bisector's end
          answer: labelled(correct, wrongs),
          solution: `H is on BC, so the bisector of angle B also bisects angle ABH of the right triangle ABH, and the angle bisector theorem in that triangle gives AP : PH = AB : BH. To find BH, use the altitude twice: AH² = AB² − BH² = AC² − HC², so BH² − HC² = ${c1}² − ${c2}² = ${num(c1 * c1 - c2 * c2)}. Dividing by BH + HC = ${a} gives BH − HC = ${num(p - q)}, and adding these two equations, 2·BH = ${2 * p}, so BH = ${p}. So AP : PH = AB : BH = ${chain(c1, p)}.`,
          check: () => {
            // from the three sides alone: the foot of the altitude, the bisector of B, where they meet
            const t = corners(a, c2, c1), foot = project(t.A, t.B, t.C), Pp = meet([t.B, halfway(t.B, t.A, t.C)], [t.A, foot]);
            return near(dist(t.A, Pp) / dist(Pp, foot), correct[0], 'AP/PH');
          },
        };
      }
      const [row] = pick(turn, 'ab-median', [TRIANGLES], (rw) => enough(...medianAnswers(rw)));
      const [a, b, c] = row, [correct, wrongs] = medianAnswers(row);
      const { A, B, C } = corners(a, b, c), M = mid(A, C), D = bisect(A, B, C), P = meet([A, D], [B, M]);
      const T = fit([A, B, C], 380, 260, 34), [pA, pB, pC, pM, pD, pP] = [A, B, C, M, D, P].map(T), ctr = centre([pA, pB, pC]);
      return {
        topic: 'Angle bisectors', rank: 17,
        text: `Triangle ABC has AB = ${c}, BC = ${a} and CA = ${b}. M is the midpoint of CA, and the bisector of angle A meets BM at P. What is BP : PM?`,
        figure: svg(380, 260, 'Triangle ABC with the median BM and the bisector of angle A', [poly([pA, pB, pC]), seg(pB, pM, 'seg dash'), seg(pA, pD, 'seg'), dot(pP),
          arcMark(pA, pB, pD, 28, '', true), arcMark(pA, pD, pC, 28, '', true), ...[[pA, 'A'], [pB, 'B'], [pC, 'C']].map(([pp, s]) => label(away(pp, ctr, 14), s)),
          label(away(pM, ctr, 14), 'M'), label([pD[0], pD[1] + 17], 'D'), nameAt(pP, [pA, pD, pB, pM], 'P'),
          label(beside(pA, pB, ctr, -13), c, 'ang'), label(beside(pM, pC, ctr, -13), b, 'ang'), label(dist(pB, pD) > dist(pD, pC) ? beside(pB, pD, ctr, -13) : beside(pD, pC, ctr, -13), a, 'ang')]),
        answer: labelled(correct, wrongs),
        solution: `M is on side CA, so the bisector of angle BAC is also the bisector of angle BAM in triangle ABM. By the angle bisector theorem in that triangle, BP : PM = AB : AM. M is the midpoint of CA, so AM = ${frac(b, 2)}, and BP : PM = ${b % 2 ? `${c} : ${frac(b, 2)} = ${chain(2 * c, b)}` : chain(c, b / 2)}.`,
        check: () => {
          const t = corners(a, b, c), Mm = mid(t.A, t.C), Pp = meet([t.A, halfway(t.A, t.B, t.C)], [t.B, Mm]);
          return near(dist(t.B, Pp) / dist(Pp, Mm), correct[0], 'BP/PM');
        },
      };
    },
    // the incentre on a bisector: BI bisects angle B of triangle ABD, so AI : ID = AB : BD
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'ID' : 'AI';
      const [row] = pick({ ...ctx, k: Math.floor(ctx.k / 2) }, `ab-incentre-${ask}`, [BISECTED], (rw) => incentreSquare(rw, ask)[1] <= 9 && enough(...incentreAnswers(rw, ask)));
      const [a, b, c, bd, dc] = row, [correct, wrongs] = incentreAnswers(row, ask), ad2 = b * c - bd * dc, AD = surd(1, ad2)[1];
      const { A, B, C } = corners(a, b, c), D = [bd, 0], E = bisect(B, A, C), I = meet([A, D], [B, E]);
      const T = fit([A, B, C], 380, 260, 34), [pA, pB, pC, pD, pE, pI] = [A, B, C, D, E, I].map(T), ctr = centre([pA, pB, pC]);
      return {
        topic: 'Angle bisectors', rank: 19,
        text: `Triangle ABC has AB = ${c}, BC = ${a} and CA = ${b}. The bisector of angle A meets BC at D, and I is the incentre, where the three angle bisectors meet. How long is ${ask}?`,
        figure: svg(380, 260, 'Triangle ABC with its incircle and the bisectors from A and B', [poly([pA, pB, pC]), ring(pI, I[1] * T.s, 'arc'), seg(pA, pD, 'seg'), seg(pB, pE, 'seg dash'), dot(pI),
          ...[[pA, 'A'], [pB, 'B'], [pC, 'C']].map(([pp, s]) => label(away(pp, ctr, 14), s)), label([pD[0], pD[1] + 17], 'D'), nameAt(pI, [pA, pD, pB, pE], 'I', 13),
          label(beside(pA, pB, ctr, -13), c, 'ang'), label(dist(pA, pE) > dist(pE, pC) ? beside(pA, pE, ctr, -13) : beside(pE, pC, ctr, -13), b, 'ang'), label(bd > dc ? beside(pB, pD, ctr, -13) : beside(pD, pC, ctr, -13), a, 'ang')]),
        answer: labelled(correct, wrongs),
        solution: `Start with the bisector AD, which cuts BC in the ratio AB : AC = ${c} : ${b}, so BD = ${bd} and DC = ${dc}. Then AD² = AB·AC − BD·DC = ${c}·${b} − ${bd}·${dc} = ${ad2}, so AD = ${AD}. The incentre is also on the bisector of angle B, and in triangle ABD that line bisects the angle at B, so the angle bisector theorem there gives AI : ID = AB : BD = ${simplest(c, bd)}. So ${ask} is ${frac(ask === 'AI' ? c : bd, c + bd)} of AD, which is ${frac(ask === 'AI' ? c : bd, c + bd)}·${AD} = <b>${correct[1]}</b>.`,
        check: () => {
          // the incentre as the crossing of two bisectors, from the three sides alone
          const t = corners(a, b, c), Ip = meet([t.A, halfway(t.A, t.B, t.C)], [t.B, halfway(t.B, t.A, t.C)]), Dp = bisect(t.A, t.B, t.C);
          return near(ask === 'AI' ? dist(t.A, Ip) : dist(Ip, Dp), correct[0], ask);
        },
      };
    },
  ],

  'Angles in circles': [
    // arcs in a ratio: each angle of the quadrilateral is half the two arcs it looks across
    (d, ctx) => {
      const ask = ctx.k % 2 ? 'smallest' : 'largest';
      const [[p, q, r, s]] = pick({ ...ctx, k: Math.floor(ctx.k / 2) }, `ac-arcs-${ask}`, [ARCS]);
      const S = p + q + r + s, u = 360 / S, arcs = [p, q, r, s].map((v) => v * u), ang = [(q + r) * u, (r + s) * u, (s + p) * u, (p + q) * u].map((v) => v / 2);
      const ans = ask === 'largest' ? Math.max(...ang) : Math.min(...ang), at = ang.indexOf(ans), edge = ask === 'largest' ? Math.max(...arcs) : Math.min(...arcs);
      const th = [0, arcs[0], arcs[0] + arcs[1], arcs[0] + arcs[1] + arcs[2]].map((t) => 250 - arcs[0] / 2 + t), W = th.map(dir);
      const T = frame([-1, 1], [-1, 1], 320, 300, 30), pW = W.map(T), pO = T([0, 0]);
      return {
        topic: 'Angles in circles', rank: 12,
        text: `Points A, B, C and D lie on a circle in that order, and the four arcs between neighbours, AB, BC, CD and DA, are in the ratio ${p} : ${q} : ${r} : ${s}. What is the ${ask} angle of quadrilateral ABCD?`,
        figure: svg(320, 300, 'Quadrilateral ABCD with its corners on a circle', [poly(pW), ring(pO, T.s), ...pW.map((pp, i) => label(away(pp, pO, 14), 'ABCD'[i]))]),
        answer: choices(d, ans, [...ang.filter((v) => v !== ans), edge / 2, edge, 180 - ans], deg),
        solution: `The four arcs make up the whole circle, so one part of the ratio is 360° ÷ ${S} = ${u}°, and the arcs are AB = ${arcs[0]}°, BC = ${arcs[1]}°, CD = ${arcs[2]}° and DA = ${arcs[3]}°. An inscribed angle is half the arc it looks across, and the angle at each corner of ABCD looks across the two arcs that don't touch that corner. So ∠A = ½(${arcs[1]}° + ${arcs[2]}°) = ${deg(ang[0])}, ∠B = ½(${arcs[2]}° + ${arcs[3]}°) = ${deg(ang[1])}, ∠C = ½(${arcs[3]}° + ${arcs[0]}°) = ${deg(ang[2])} and ∠D = ½(${arcs[0]}° + ${arcs[1]}°) = ${deg(ang[3])}. (Opposite angles add up to 180°, as in every quadrilateral whose corners lie on a circle). The ${ask} is ∠${'ABCD'[at]} = <b>${deg(ans)}</b>.`,
        check: () => {
          // the corners on the unit circle, and each corner's angle from vectors
          const inner = W.map((pp, i) => angleAt(W[(i + 3) % 4], pp, W[(i + 1) % 4]));
          return near(ask === 'largest' ? Math.max(...inner) : Math.min(...inner), ans, 'angle');
        },
      };
    },
    // two diagonals of a regular polygon cross inside: half the sum of the arcs
    (d, ctx) => {
      const [[n, i, j, k, l, ask]] = pick(ctx, 'ac-cross', [CROSSING]);
      const u = 360 / n, V = (v) => VERTICES[v], name = VERTICES.slice(0, n);
      const [a1, a2] = ask ? [k - j, n - l + i] : [j - i, l - k], ans = ((a1 + a2) * u) / 2;
      const [s1, s2] = ask ? [j, k] : [i, j], [o1, o2] = ask ? [l, i] : [k, l];   // the asked angle's rays, and the rays of the angle opposite it
      const W = range(0, n - 1).map((v) => corner0(n, v)), X = meet([W[i], W[k]], [W[j], W[l]]);
      const T = frame([-1, 1], [-1, 1], 330, 310, 30), pW = W.map(T), pO = T([0, 0]), pX = T(X), mid1 = along(pX, unit(pX, mid(along(pX, unit(pX, pW[s1]), 1), along(pX, unit(pX, pW[s2]), 1))), 9);
      return {
        topic: 'Angles in circles', rank: 14,
        text: `${name} is a regular ${POLYGON[n]}. Its diagonals ${V(i)}${V(k)} and ${V(j)}${V(l)} cross at X. What is the measure of ∠${V(s1)}X${V(s2)}?`,
        figure: svg(330, 310, `A regular ${POLYGON[n]} with two diagonals crossing at X`, [poly(pW), ring(pO, T.s, 'arc'), seg(pW[i], pW[k], 'seg'), seg(pW[j], pW[l], 'seg'), dot(pX),
          arcMark(pX, pW[s1], pW[s2], 18), ...pW.map((pp, v) => label(away(pp, pO, 13), V(v))), nameAt(pX, [pW[i], pW[k], pW[j], pW[l], mid1], 'X')]),
        answer: choices(d, ans, [(Math.abs(a1 - a2) * u) / 2, (a1 + a2) * u, 180 - ans, (a1 * u) / 2, a1 * u, (a2 * u) / 2, a2 * u].filter((v) => v > 0 && v < 180), deg),
        solution: `The corners of a regular polygon all lie on one circle, and each side cuts off an arc of 360° ÷ ${n} = ${u}°. When two chords cross inside a circle, each angle between them is half the sum of the arc it cuts off and the arc its vertical angle cuts off. Here ∠${V(s1)}X${V(s2)} cuts off arc ${V(s1)}${V(s2)}, ${sides(a1)} or ${a1 * u}°, and the vertical angle ∠${V(o1)}X${V(o2)} cuts off arc ${V(o1)}${V(o2)}, ${sides(a2)} or ${a2 * u}°. So ∠${V(s1)}X${V(s2)} = ½(${a1 * u}° + ${a2 * u}°) = <b>${deg(ans)}</b>.`,
        check: () => near(angleAt(W[s1], X, W[s2]), ans, 'angle'),
      };
    },
    // lines through corners of a regular polygon (or a tangent) meeting outside: half the difference of the arcs
    (d, ctx) => {
      const [[n, i, j, k, l]] = pick(ctx, 'ac-outside', [MEETING]);
      const u = 360 / n, V = (v) => VERTICES[v], name = VERTICES.slice(0, n), tangent = i === j, near1 = k - j, far = n - l + i, ans = ((far - near1) * u) / 2;
      const W = range(0, n - 1).map((v) => corner0(n, v)), td = [W[i][1], -W[i][0]];   // the tangent at Vi runs along td
      const X = meet([W[i], tangent ? along(W[i], td, 1) : W[j]], [W[l], W[k]]);
      const T = fit([[-1, -1], [1, 1], X], 400, 290, 30), pW = W.map(T), pO = T([0, 0]), pX = T(X);
      const back = tangent ? T(along(W[i], unit(X, W[i]), 0.45)) : pW[i];   // the tangent drawn a little past its point of contact
      const nearArc = tangent ? `${V(i)}${V(k)}` : `${V(j)}${V(k)}`;
      return {
        topic: 'Angles in circles', rank: 16,
        text: tangent
          ? `${name} is a regular ${POLYGON[n]}, and a circle passes through all of its corners. The tangent to that circle at ${V(i)} meets line ${V(l)}${V(k)}, extended past ${V(k)}, at X. What is the measure of ∠${V(i)}X${V(l)}?`
          : `${name} is a regular ${POLYGON[n]}. Lines ${V(i)}${V(j)} and ${V(l)}${V(k)} are extended past ${V(j)} and ${V(k)} until they meet at X. What is the measure of ∠${V(i)}X${V(l)}?`,
        figure: svg(400, 290, tangent ? `A regular ${POLYGON[n]} with a tangent and a line meeting at X` : `A regular ${POLYGON[n]} with two lines meeting outside it at X`, [poly(pW), ring(pO, T.s, 'arc'),
          seg(back, pX, 'seg'), seg(pW[l], pX, 'seg'), dot(pX), arcMark(pX, pW[i], pW[l], 24), nameAt(pX, [pW[i], pW[l]], 'X'),
          // every corner's name clear of the two lines, except an unnamed one that would crowd X or has no clear spot
          ...pW.map((pp, v) => { const named = [i, j, k, l].includes(v); return named || dist(away(pp, pO, 14), pX) > 30 ? cornerName(pp, pO, V(v), [[back, pX], [pW[l], pX]], named) : ''; })]),
        answer: choices(d, ans, [((far + near1) * u) / 2, (far - near1) * u, (far * u) / 2, 180 - ans, (near1 * u) / 2, near1 * u].filter((v) => v > 0 && v < 180), deg),
        solution: `The corners lie on one circle, and each side cuts off an arc of 360° ÷ ${n} = ${u}°. ${tangent ? 'A tangent and a secant' : 'Two secants'} that meet outside a circle make an angle of half the difference of the two arcs between them: the far arc ${V(l)}${V(i)}, ${sides(far)} or ${far * u}°, and the near arc ${nearArc}, ${sides(near1)} or ${near1 * u}°. (In triangle X${tangent ? V(i) : V(j)}${tangent ? V(k) : V(l)}, the outside angle at ${tangent ? V(k) : V(j)} is an inscribed angle on the far arc, and the angle at ${tangent ? `${V(i)}, between the tangent and the chord ${V(i)}${V(k)},` : V(l)} is half the near arc, so the angle at X is the difference). So ∠${V(i)}X${V(l)} = ½(${far * u}° − ${near1 * u}°) = <b>${deg(ans)}</b>.`,
        check: () => {
          // X from the two lines, and its angle from vectors; X must be past Vj (or the point of contact) and Vk
          const Xp = meet([W[i], tangent ? along(W[i], td, 1) : W[j]], [W[l], W[k]]);
          if (dist(Xp, W[k]) > dist(Xp, W[l]) || (!tangent && dist(Xp, W[j]) > dist(Xp, W[i]))) return 'X is on the wrong side';
          return near(angleAt(W[i], Xp, W[l]), ans, 'angle');
        },
      };
    },
    // the circumcentre: a central angle is twice the inscribed angle, and OA = OB = OC makes isosceles triangles
    (d, ctx) => {
      const ask = ['OBC', 'OAF', 'OAB'][ctx.k % 3];
      // where a radius splits a given angle, one of the two parts must be wide enough to hold that angle's value
      const roomy = ([b, c]) => { const a = 180 - b - c; return Math.max(90 - a, 90 - c) >= 28 && (ask !== 'OBC' || Math.max(90 - a, 90 - b) >= 28); };
      const [[be, ga]] = pick({ ...ctx, k: Math.floor(ctx.k / 3) }, `ac-centre-${ask}`, [ACUTE], ask === 'OAF' ? undefined : roomy);
      const al = 180 - be - ga, ans = ask === 'OBC' ? 90 - al : ask === 'OAB' ? 90 - ga : Math.abs(be - ga);
      // on the unit circle: arc BC = 2∠A at the bottom, then arc CA = 2∠B, then arc AB = 2∠C
      const [A, B, C] = [270 + al + 2 * be, 270 - al, 270 + al].map(dir), F = project(A, B, C);
      const T = frame([-1, 1], [-1, 1], 330, 300, 28), [pA, pB, pC, pO, pF] = [A, B, C, [0, 0], F].map(T);
      // the radii drawn and the asked angle's arc (in the second color); the given angles' values keep clear of the radii
      const lines = ask === 'OBC' ? [seg(pO, pB, 'seg'), seg(pO, pC, 'seg'), arcMark(pB, pC, pO, 30, '', false, 'arc ext')]
        : ask === 'OAB' ? [seg(pO, pA, 'seg'), seg(pO, pB, 'seg'), arcMark(pA, pB, pO, 30, '', false, 'arc ext')]
          : [seg(pO, pA, 'seg'), seg(pA, pF, 'seg dash'), corner(pF, pC, pA), arcMark(pA, pF, pO, 34, '', false, 'arc ext'), label([pF[0], pF[1] + 16], 'F')];
      // the central angle on chord xy is twice the inscribed angle at z, and the isosceles triangle xOy gives ∠Oxy
      const iso = (x, y, z, angle, last) => `The central angle ∠${x}O${y} stands on the same arc ${x}${y} as the inscribed angle ∠${x}${z}${y}, so it is twice as big: ∠${x}O${y} = ${2 * angle}°. O${x} and O${y} are both radii, so triangle ${x}O${y} is isosceles and its two base angles are equal: ∠O${x}${y} = (180° − ${2 * angle}°) ÷ 2 = ${last ? `<b>${deg(90 - angle)}</b>` : deg(90 - angle)}.`;
      return {
        topic: 'Angles in circles', rank: ask === 'OAF' ? 17 : 15,
        text: `In acute triangle ABC, ∠ABC = ${be}° and ∠ACB = ${ga}°. O is the centre of the circle through A, B and C${ask === 'OAF' ? ', and F is the foot of the altitude from A to BC' : ''}. What is the measure of ∠${ask}?`,
        figure: svg(330, 300, 'Triangle ABC in its circle, with centre O', [poly([pA, pB, pC]), ring(pO, T.s), ...lines, dot(pO), valueAt(pB, pA, pC, `${be}°`, ask === 'OAF' ? [] : [pO]), valueAt(pC, pB, pA, `${ga}°`, ask === 'OBC' ? [pO] : []),
          ...[[pA, 'A'], [pB, 'B'], [pC, 'C']].map(([pp, s]) => label(away(pp, pO, 14), s)), nameAt(pO, ask === 'OBC' ? [pB, pC] : [pA, ask === 'OAB' ? pB : pA], 'O', 13)]),
        answer: choices(d, ans, ask === 'OBC' ? [al, 2 * al, 90 - be, 90 - ga, 180 - 2 * al] : ask === 'OAB' ? [90 - be, ga, 2 * ga, 90 - al, 180 - 2 * ga] : [Math.abs(be - ga) / 2, 2 * Math.abs(be - ga), 90 - be, 90 - ga, al / 2], deg),
        solution: ask === 'OBC'
          ? `First ∠BAC = 180° − ${be}° − ${ga}° = ${al}°. ${iso('B', 'C', 'A', al, true)}`
          : ask === 'OAB'
            ? `Only ∠ACB matters here, because it is the inscribed angle on chord AB. ${iso('A', 'B', 'C', ga, true)}`
            : `In the right triangle ABF, ∠BAF = 90° − ${be}° = ${90 - be}°. ${iso('A', 'B', 'C', ga, false)} Both angles are measured from side AB, so the angle between AF and AO is ∠OAF = |${90 - be}° − ${90 - ga}°| = <b>${deg(ans)}</b>.`,
        check: () => {
          // the corners' own angles first, then the asked angle from vectors
          const bad = near(angleAt(A, B, C), be, '∠B') || near(angleAt(B, C, A), ga, '∠C');
          if (bad) return bad;
          const got = ask === 'OBC' ? angleAt([0, 0], B, C) : ask === 'OAB' ? angleAt([0, 0], A, B) : angleAt([0, 0], A, project(A, B, C));
          return near(got, ans, ask);
        },
      };
    },
  ],

  'Areas cut by a line': [
    // a line through a corner: the two pieces share their height, so the areas are in the ratio of the bases
    (d, ctx) => {
      const ok = (A, B, C, m, n) => { const sl = slopes(A, B, C, m, n); return sl.every((v) => v[0] > 0 && v[1] > 0 && v[1] <= 60) && sl[0][1] <= 40 && new Set(sl.map((v) => v[0] / v[1])).size === sl.length; };
      const [A, B, C, m, n] = pick(ctx, 'al-vertex', [VERTEX_CUTS], (row) => ok(...row))[0];
      const [ans, ...wrongs] = slopes(A, B, C, m, n), runN = n * (B[0] - A[0]) + m * (C[0] - A[0]), riseN = n * (B[1] - A[1]) + m * (C[1] - A[1]);
      const P = [(n * B[0] + m * C[0]) / (m + n), (n * B[1] + m * C[1]) / (m + n)];
      const { T, axes } = plane([A, B, C], 380, 280, 28), [pA, pB, pC, pP] = [A, B, C, P].map(T), ctr = centre([pA, pB, pC]);
      return {
        topic: 'Areas cut by a line', rank: 15,
        text: `Triangle ABC has corners A = ${pt(A)}, B = ${pt(B)} and C = ${pt(C)}. A line through A cuts it into two triangles, the one next to B and the one next to C, whose areas are in the ratio ${m} : ${n}. What is the slope of that line?`,
        figure: svg(380, 280, 'Triangle ABC on coordinate axes, cut by a line through A', [poly([pA, pB, pC]), ...axes, seg(pA, pP, 'seg'), dot(pP),
          ...[[pA, 'A'], [pB, 'B'], [pC, 'C']].map(([pp, s]) => label(away(pp, ctr, 14), s)), nameAt(pP, [pA, pB, pC], 'P')]),
        answer: choices(d, ans, wrongs, showFrac),
        solution: `The line meets BC at a point P, and the two pieces, triangles ABP and APC, have the same height, the distance from A to line BC. So their areas are in the ratio of their bases, BP : PC = ${m} : ${n}, which puts P ${frac(m, m + n)} of the way from B to C, at (${frac(n * B[0] + m * C[0], m + n)}, ${frac(n * B[1] + m * C[1], m + n)}). From A to P the run is ${frac(runN, m + n)} and the rise is ${frac(riseN, m + n)}. So the slope is ${frac(riseN, m + n)} ÷ ${frac(runN, m + n)} = <b>${showFrac(ans)}</b>.`,
        check: () => {
          // the line through A with that slope meets BC at Q; the shoelace areas of ABQ and AQC must be in the ratio m : n
          const Q = meet([A, [A[0] + ans[1], A[1] + ans[0]]], [B, C]);
          return near(shoelace([A, B, Q]) * n, shoelace([A, Q, C]) * m, 'areas');
        },
      };
    },
    // a line parallel to a side: areas go as the square of the lengths, so lengths go as the square root
    (d, ctx) => {
      const triangle = ctx.k % 2 === 0, turn = { ...ctx, k: Math.floor(ctx.k / 2) };
      if (triangle) {
        const [row] = pick(turn, 'al-parallel', [PARALLEL], (rw) => enough(...parallelAnswers(rw)));
        const [L, p, q] = row, [correct, wrongs] = parallelAnswers(row), f = Math.sqrt(p / (p + q)), share = times(1, p, p + q)[1];
        const A = [0.36 * L, 0.78 * L], B = [0, 0], C = [L, 0], E1 = along(A, unit(A, B), f * dist(A, B)), E2 = along(A, unit(A, C), f * dist(A, C));
        const T = fit([A, B, C], 380, 260, 32), [pA, pB, pC, p1, p2] = [A, B, C, E1, E2].map(T), ctr = centre([pA, pB, pC]);
        return {
          topic: 'Areas cut by a line', rank: 16,
          text: `A line parallel to side BC of triangle ABC cuts the triangle into a smaller triangle at A and a trapezoid, and their areas are in the ratio ${p} : ${q}. If BC = ${L}, how long is the part of the line inside triangle ABC?`,
          figure: svg(380, 260, 'Triangle ABC cut by a line parallel to BC', [poly([pA, p1, p2]), poly([pA, pB, pC]), seg(p1, p2, 'seg'),
            ...[[pA, 'A'], [pB, 'B'], [pC, 'C']].map(([pp, s]) => label(away(pp, ctr, 14), s)), label(beside(pB, pC, ctr, -14), L, 'ang')]),
          answer: labelled(correct, wrongs),
          solution: `The line is parallel to BC, so it cuts off a triangle at A that is similar to ABC. Areas of similar figures go as the square of their lengths, so lengths go as the square root of the areas. The small triangle has ${p} of the ${p + q} equal parts of the whole area, so its sides are √(${frac(p, p + q)}) = ${share} of ABC's. The segment is that share of BC, ${share}·${L} = <b>${correct[1]}</b>.`,
          check: () => {
            // slide a level line down from A until the part above it has the right share of the area, then measure it
            const tri = [A, B, C], whole = shoelace(tri), y = solve((t) => shoelace(clip(tri, (pp) => pp[1] - t)) / whole - p / (p + q), 0, A[1]);
            return near(meet([A, C], [[0, y], [1, y]])[0] - meet([A, B], [[0, y], [1, y]])[0], correct[0], 'segment');
          },
        };
      }
      const [row] = pick(turn, 'al-trapezoid', [HALVING], (rw) => enough(...trapezoidAnswers(rw)));
      const [a, b] = row, [correct, wrongs] = trapezoidAnswers(row), sq = (a * a + b * b) / 2;
      // the trapezoid to scale: bottom b, top a, the top set in a little from the left; the halving segment where the
      // width has come down to m
      const H = 0.45 * b, sh = 0.3 * (b - a), at = (y) => [(sh * y) / H, b + ((sh + a - b) * y) / H], ym = (H * (b - correct[0])) / (b - a);
      const Q = [[0, 0], [b, 0], [sh + a, H], [sh, H]], T = fit(Q, 400, 250, 32), pQ = Q.map(T), [x1, x2] = at(ym), ctr = centre(pQ);
      return {
        topic: 'Areas cut by a line', rank: 18,
        text: `A trapezoid has parallel sides of lengths ${a} and ${b}. A segment parallel to those two sides, with its ends on the other two sides, cuts the trapezoid into two pieces of equal area. How long is the segment?`,
        figure: svg(400, 250, 'A trapezoid cut in half by a segment parallel to its bases', [poly(pQ), seg(T([x1, ym]), T([x2, ym]), 'seg'),
          label(beside(pQ[0], pQ[1], ctr, -14), b, 'ang'), label(beside(pQ[2], pQ[3], ctr, -14), a, 'ang')]),
        answer: labelled(correct, wrongs),
        solution: `Extend the two slanted sides until they meet, so the trapezoid becomes a big triangle with a small triangle cut off its tip. Every triangle cut off by a line parallel to the bases is similar to the others, so its area is k·x² for its base x, the same k for all. The trapezoid is then k(${b}² − ${a}²), and the segment, of length s, halves it when s² − ${a}² = ${b}² − s². So s² = (${a}² + ${b}²) ÷ 2 = ${sq}, and s = <b>${correct[1]}</b>.`,
        check: () => {
          // slide a level line up until it has half the area below it, then measure it
          const whole = shoelace(Q), y = solve((t) => shoelace(clip(Q, (pp) => t - pp[1])) / whole - 0.5, 0, H), [l, r] = at(y);
          return near(r - l, correct[0], 'segment');
        },
      };
    },
    // an upright (or level) line halving a triangle: past the middle corner, the piece cut off is a triangle whose area
    // goes as the square of its width
    (d, ctx) => {
      const [[u1, u2, u3, shape, upright]] = pick(ctx, 'al-halves', [HALVES], ([v1, v2, v3]) => { const hv = halving(v1, v2, v3); return enough(hv.correct, hv.wrongs); });
      const { high, m, rt, whole, correct, wrongs, k } = halving(u1, u2, u3), c = upright ? 'x' : 'y';
      const V = [u1, u2, u3].map((v, i) => (upright ? [v, shape[i]] : [shape[i], v])), shown = d.shuffle(V);
      const side = upright ? (high ? 'to the right of' : 'to the left of') : high ? 'above' : 'below', size = upright ? 'width' : 'height';
      const f = (pp) => (upright ? pp[0] : pp[1]) - k, piece = clip(V, high ? f : (pp) => -f(pp));
      // the picture, with room past the triangle for the line's name: the corners' coordinates go outside them, and
      // "x = k" (or "y = k") at whichever end of the line is farther from those
      const { T } = plane(V, 380, 290, 28, 1.4, upright ? 0.5 : 0), pV = V.map(T), ctr = centre(pV), at = pV.map((p, i) => outAt(p, ctr, pt(V[i])));
      // the line is drawn a little past where it crosses the triangle, and named at the end with more room
      const hitsAt = [];
      V.forEach((p, i) => {
        const q = V[(i + 1) % 3], a = upright ? p[0] : p[1], b = upright ? q[0] : q[1];
        if ((a - k) * (b - k) <= 0 && a !== b) hitsAt.push(upright ? p[1] + ((k - a) / (b - a)) * (q[1] - p[1]) : p[0] + ((k - a) / (b - a)) * (q[0] - p[0]));
      });
      const lo = Math.min(...hitsAt) - 0.8, hi = Math.max(...hitsAt) + 0.8, ends = upright ? [T([k, hi]), T([k, lo])] : [T([lo, k]), T([hi, k])];
      const spots = upright ? [[ends[0][0], ends[0][1] - 11], [ends[1][0], ends[1][1] + 13]] : [[ends[0][0] - 5, ends[0][1]], [ends[1][0] + 5, ends[1][1]]];
      const room = (s) => Math.min(...at.map((p) => dist(p, s))), pick2 = room(spots[0]) >= room(spots[1]) ? 0 : 1;
      const wide = high ? u3 - u2 : u2 - u1, end = high ? u3 : u1, gap = high ? `${u3} − k` : u1 === 0 ? 'k' : u1 < 0 ? `k + ${-u1}` : `k − ${u1}`;
      const bracket = gap === 'k' ? 'k' : `(${gap})`;   // the tip piece's width, in brackets when it is a difference
      return {
        topic: 'Areas cut by a line', rank: 18,
        text: `The ${upright ? 'vertical' : 'horizontal'} line ${c} = k cuts the triangle with corners ${pt(shown[0])}, ${pt(shown[1])} and ${pt(shown[2])} into two pieces of equal area. What is k?`,
        figure: svg(380, 290, `A triangle cut in half by the line ${c} = k`, [poly(piece.map(T)), poly(pV), seg(ends[0], ends[1], 'seg dash'),
          ...V.map((v, i) => label(at[i], pt(v), 'ang')), label(spots[pick2], `${c} = k`, 'ang', upright ? 'middle' : pick2 ? 'start' : 'end')]),
        answer: labelled(correct, wrongs),
        solution: `Only the ${c}-coordinates matter here, and they are ${num(u1)}, ${num(u2)} and ${num(u3)}. The line ${c} = ${num(u2)} through the middle corner cuts the triangle into two triangles that share a side on that line, so their areas are in the ratio of their ${size}s, ${u2 - u1} : ${u3 - u2}, and the bigger one is ${side} it, so that is where k is. The piece ${side} ${c} = k is a triangle with its tip at ${c} = ${num(end)}, and as k moves, its side on the line and its ${size} ${gap} shrink together, so its area is ${frac(wide, u3 - u1)} of the whole times (${bracket}/${wide})². For half the whole, ${bracket}² = ${u3 - u1}·${wide}/2 = ${m}, so k = ${whole ? `${num(end)} ${high ? '−' : '+'} ${rt[1]} = ` : ''}<b>${correct[1]}</b>.`,
        check: () => {
          // slide the line across until the piece on one side has half the area (shoelace on the clipped triangle)
          const all = shoelace(V), g = (t) => shoelace(clip(V, (pp) => (upright ? pp[0] : pp[1]) - t)) / all - 0.5;
          return near(solve(g, u1, u3), correct[0], 'k');
        },
      };
    },
    // two cevians: mass points give where they cross, and areas with a shared height are in the ratio of their bases
    (d, ctx) => {
      const want = ctx.k % 2 ? 'PDCE' : 'ABP';
      const [[m, n, p, q, ask], factor] = pick({ ...ctx, k: Math.floor(ctx.k / 2) }, `al-cevians-${want}`, [CEVIANS, [1, 2, 3]], (row) => row[4] === want);
      const parts = cevianParts(m, n, p, q), { wA, wB, wC, wD } = parts, den = [parts.ABD, parts.ABE, parts.ABP, parts.BPD, parts.APE, parts.PDCE].reduce((acc, v) => lcm(acc, v[1]), 1);
      const Tot = den * factor * Math.ceil(24 / den), of = (v) => lowest(Tot * v[0], v[1]), area = (v) => showFrac(of(v));
      const ans = of(parts[ask]), wrongs = ask === 'ABP' ? [of(parts.ABD), of(parts.BPD), of(parts.APE), of(parts.CDE), lowest(Tot, 4)] : [of(parts.CDE), of(parts.ABP), of(parts.BPD), of(parts.APE), of(parts.rest)];
      const A = [3.6, 7.4], B = [0, 0], C = [10, 0], D = along(B, [1, 0], (10 * m) / (m + n)), E = along(C, unit(C, A), (dist(C, A) * p) / (p + q)), P = meet([A, D], [B, E]);
      const T = fit([A, B, C], 380, 260, 32), [pA, pB, pC, pD, pE, pP] = [A, B, C, D, E, P].map(T), ctr = centre([pA, pB, pC]);
      const start = `Use mass points to see how P cuts AD. For D to balance BC with BD : DC = ${m} : ${n}, the weights at B and C are in the ratio ${n} : ${m}, and for E to balance CA with CE : EA = ${p} : ${q}, the weights at C and A are in the ratio ${q} : ${p}. Scaled to agree at C, the weights are A = ${wA}, B = ${wB} and C = ${wC}, so D carries ${wB} + ${wC} = ${wD}, and AP : PD = ${simplest(wD, wA)}. Triangle ABD has base BD, ${frac(m, m + n)} of BC, and the same height as ABC, so its area is ${area(parts.ABD)}`;
      return {
        topic: 'Areas cut by a line', rank: ask === 'ABP' ? 18 : 19,
        text: `Triangle ABC has area ${Tot}. Point D is on side BC with BD : DC = ${m} : ${n}, and point E is on side CA with CE : EA = ${p} : ${q}. Segments AD and BE cross at P. What is the area of ${ask === 'ABP' ? 'triangle ABP' : 'quadrilateral PDCE'}?`,
        figure: svg(380, 260, `Triangle ABC with segments AD and BE crossing at P`, [poly((ask === 'ABP' ? [A, B, P] : [P, D, C, E]).map(T)), poly([pA, pB, pC]), seg(pA, pD, 'seg'), seg(pB, pE, 'seg'), dot(pP),
          ...[[pA, 'A'], [pB, 'B'], [pC, 'C']].map(([pp, s]) => label(away(pp, ctr, 14), s)), label([pD[0], pD[1] + 17], 'D'), label(along(pE, unit(mid(pC, pA), beside(pC, pA, ctr, -1)), 14), 'E'), nameAt(pP, [pA, pD, pB, pE], 'P')]),
        answer: choices(d, ans, positive(wrongs), showFrac),
        solution: ask === 'ABP'
          ? `${start}. Triangle ABP shares the corner B with ABD, and its base AP is ${frac(wD, wD + wA)} of AD on the same line, so its area is ${frac(wD, wD + wA)}·${area(parts.ABD)} = <b>${area(parts.ABP)}</b>.`
          : `${start}, and triangle ABP, which shares the corner B and has the base AP, ${frac(wD, wD + wA)} of AD, has ${frac(wD, wD + wA)} of that, ${area(parts.ABP)}. In the same way triangle ABE has ${frac(q, p + q)} of the whole area, ${area(parts.ABE)}, so BPD = ${area(parts.ABD)} − ${area(parts.ABP)} = ${area(parts.BPD)} and APE = ${area(parts.ABE)} − ${area(parts.ABP)} = ${area(parts.APE)}. What is left is PDCE = ${Tot} − ${area(parts.ABP)} − ${area(parts.BPD)} − ${area(parts.APE)} = <b>${area(parts.PDCE)}</b>.`,
        check: () => {
          // the same triangle in coordinates, P where the segments cross, and the region's share by the shoelace formula
          const region = ask === 'ABP' ? [A, B, P] : [P, D, C, E];
          return near((shoelace(region) / shoelace([A, B, C])) * Tot, ans[0] / ans[1], 'area');
        },
      };
    },
  ],
};

// the slope of the line through A cutting ABC in the ratio m : n (B's side first), then the slopes from the usual slips:
// the ratio the wrong way round, the median, the ratio squared, and the smaller number over the larger read as a share
// of BC (BP : BC = m : n, or PC : BC = n : m). through(s, t) aims at P = (sB + tC)/(s + t)
function slopes(A, B, C, m, n) {
  const through = (s, t) => lowest(s * (B[1] - A[1]) + t * (C[1] - A[1]), s * (B[0] - A[0]) + t * (C[0] - A[0]));
  return [through(n, m), through(m, n), through(1, 1), through(n * n, m * m), m < n ? through(n - m, m) : through(n, m - n)];
}
