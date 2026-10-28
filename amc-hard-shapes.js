// Harder geometry for the AMC 10 practice (problems 15 to 23): circles resting on a line and touching each other,
// circles and squares among the semicircles and quarter circles in a square, cones and pyramids cut by a plane, and
// reflections that straighten out a bouncing or folded path. Four topics modelled on contest ideas, with new numbers
// and wording, each asking its idea four ways. Every question type has a figure drawn to scale from its own numbers,
// and check() gets each answer a second way: coordinates solved by bisection, a solid added up slice by slice, a grid
// count of an area, a ball or a light ray followed bounce by bounce, or every way of unfolding a box.
import { combo, num, frac, gcd } from '../kit/bank.js';
import { choices, labelled, surd, showFrac, range, ord } from './amc-kit.js';

// ---------- drawing: an svg with the figure styles (side, dash, seg, arc, vx and ang labels) ----------
const r2 = (v) => Math.round(v * 100) / 100;
const pts = (list) => list.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ');
const svg = (w, h, name, parts) => `<svg class="tri" viewBox="0 0 ${w} ${h}" role="img" aria-label="${name}">${parts.join('')}</svg>`;
const poly = (list, cls = 'side') => `<polygon class="${cls}" points="${pts(list)}"/>`;
const line = (list, cls = 'side') => `<polyline class="${cls}" points="${pts(list)}"/>`;
const seg = ([x1, y1], [x2, y2], cls = 'side') => `<line class="${cls}" x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}"/>`;
const ring = ([x, y], r, cls = 'side') => `<circle class="${cls}" cx="${r2(x)}" cy="${r2(y)}" r="${r2(r)}"/>`;
const label = ([x, y], text, cls = 'vx', anchor = 'middle') => `<text class="${cls}" x="${r2(x)}" y="${r2(y + 5)}" text-anchor="${anchor}">${text}</text>`;
const dot = (p) => ring(p, 3, 'seg');
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
// the little square marking a right angle at a corner (picture coordinates)
function corner(at, p, q, size = 10) {
  const u = unit(at, p), v = unit(at, q), c = (k, l) => `${r2(at[0] + u[0] * k + v[0] * l)} ${r2(at[1] + u[1] * k + v[1] * l)}`;
  return `<path class="arc" d="M${c(size, 0)} L${c(size, size)} L${c(0, size)}"/>`;
}
// points along a circle's arc in world coordinates, from angle a to angle b (degrees, counterclockwise)
const arcPts = ([cx, cy], r, a, b, n = 48) => range(0, n).map((i) => { const t = ((a + ((b - a) * i) / n) * Math.PI) / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; });
// a measured length beside p–q (picture coordinates): a thin line off pixels to one side, with end ticks and its label
function dim(p, q, text, off = 14) {
  const u = unit(p, q), n = [u[1], -u[0]], sg = Math.sign(off), a = [p[0] + n[0] * off, p[1] + n[1] * off], b = [q[0] + n[0] * off, q[1] + n[1] * off];
  const tk = (c) => seg([c[0] - n[0] * 4, c[1] - n[1] * 4], [c[0] + n[0] * 4, c[1] + n[1] * 4], 'arc'), m = mid(a, b);
  return seg(a, b, 'arc') + tk(a) + tk(b) + label([m[0] + n[0] * sg * 11, m[1] + n[1] * sg * 11 - (n[1] * sg < 0 ? 0 : 2)], text, 'ang');
}
// a box (x across, y going back, z up) seen from the front, a little from the right and above (as in amc-geometry.js).
// Corners A B C D on the bottom (A at the front left), then E F G H above them; D is hidden, so its edges are dashed.
const oblique = ([x, y, z]) => [x + 0.5 * y * Math.cos(Math.PI / 6), z + 0.5 * y * Math.sin(Math.PI / 6)];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
function boxPicture(a, b0, c, w, h) {
  const b = Math.max(b0, 0.5 * Math.max(a, c)), corners = [[0, 0, 0], [a, 0, 0], [a, b, 0], [0, b, 0], [0, 0, c], [a, 0, c], [a, b, c], [0, b, c]];
  const T = frame(...[0, 1].map((i) => [Math.min(...corners.map((p) => oblique(p)[i])), Math.max(...corners.map((p) => oblique(p)[i]))]), w, h, 34);
  const P = (p) => T(oblique(p)), at = corners.map(P);
  return { P: ([x, y, z]) => P([x, (y * b) / b0, z]), at, ctr: P([a / 2, b / 2, c / 2]), edges: EDGES.map(([i, j]) => seg(at[i], at[j], i === 3 || j === 3 ? 'side dash' : 'side')) };
}

// ---------- numbers ----------
const lowest = (p, q) => { const g = gcd(p, q) || 1; return [p / g, q / g]; };
const fr = ([p, q]) => frac(p, q);
const near = (got, want, what, tol = 1e-6) => (Math.abs(got - want) <= tol * Math.max(1, Math.abs(want)) ? '' : `${what}: worked out ${got}, said ${want}`);
const dist = (p, q) => Math.hypot(...p.map((v, i) => v - q[i]));
const root = (n) => surd(1, n)[1];   // √n, simplified (a whole number when n is a square)
const piShow = (v) => { const s = showFrac(v); return s === '1' ? 'π' : `${s}π`; };
const ratio = (p, q) => { const [x, y] = lowest(p, q); return [x / y, `${x} : ${y}`]; };
// 'a' or 'an' before a number, by how it sounds: an 8, an 11, an 18, an 80…, an 800…
const an = (n) => (/^8/.test(String(n)) || n === 11 || n === 18 ? 'an' : 'a');
// combo, with a name of its own for each kind of question, so no two kinds share a list of combinations
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
// where f changes sign between lo and hi, by halving the interval 200 times
function solve(f, lo, hi) {
  const s = Math.sign(f(lo));
  for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2; if (Math.sign(f(m)) === s) lo = m; else hi = m; }
  return (lo + hi) / 2;
}
// c·∛n with the cubes taken out of n, as [value, how it reads]
function cbrt(c, n) {
  for (let f = 2; f * f * f <= n; f++) while (n % (f * f * f) === 0) { n /= f * f * f; c *= f; }
  return [c * Math.cbrt(n), n === 1 ? num(c, 0) : `${c === 1 ? '' : num(c, 0)}∛${n}`];
}
// the area of the part of a rectangle where inside([x, y]) holds, counted on a fine grid
function gridArea([x0, x1], [y0, y1], inside, n = 600) {
  const sx = (x1 - x0) / n, sy = (y1 - y0) / n;
  let hits = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (inside([x0 + (i + 0.5) * sx, y0 + (j + 0.5) * sy])) hits++;
  return hits * sx * sy;
}
// ∫ f from a to b, by Simpson's rule
function simpson(f, a, b, n = 2000) {
  const h = (b - a) / n;
  let s = f(a) + f(b);
  for (let i = 1; i < n; i++) s += f(a + i * h) * (i % 2 ? 4 : 2);
  return (s * h) / 3;
}

// ---------- tangent circles on a line ----------
// where a circle of radius q resting on the line y = 0 sits when it touches the circle at (x, r) from the right: found
// by bisection on the distance between the centres, not from a formula
const touchRight = (x, r, q) => solve((X) => Math.hypot(X - x, q - r) - (r + q), x, x + r + q);
// circles resting on a line, each { x, r, text, out }: the line, the circles, and each radius drawn down to the line
// with its label beside it, or, when the circle is too small to hold the label, the label outside it, to the 'left',
// 'right', 'up', or 'below' the line with a pointer. marks: points [x, name] named under the line.
function onLine(circles, { marks = [], more = () => [], w = 400, h = 250, x0, x1, y1, lift = 0.12 } = {}) {
  const lo = x0 ?? Math.min(...circles.map((c) => c.x - c.r)), hi = x1 ?? Math.max(...circles.map((c) => c.x + c.r));
  const top = y1 ?? Math.max(...circles.map((c) => 2 * c.r)), pad = 0.05 * (hi - lo);
  const T = frame([lo - pad, hi + pad], [-lift * top, top], w, h, 14), parts = [seg(T([lo - pad, 0]), T([hi + pad, 0]))];
  for (const { x, r, text, out = 'up', cls = 'side' } of circles) {
    const c = T([x, r]), R = r * T.s, foot = T([x, 0]);
    parts.push(ring(c, R, cls));
    if (text == null) continue;
    const where = R >= 12 + 8 * String(text).length ? 'in' : out;
    if (where === 'in') parts.push(seg(c, foot, 'seg dash'), label([c[0] + 5, c[1] + R / 2], text, 'ang', 'start'));
    else if (where === 'left') parts.push(label([c[0] - R - 6, c[1]], text, 'ang', 'end'));
    else if (where === 'right') parts.push(label([c[0] + R + 6, c[1]], text, 'ang', 'start'));
    else if (where === 'up') parts.push(label([c[0], c[1] - R - 9], text, 'ang'));
    else parts.push(seg(c, [c[0] + 12, foot[1] + 12], 'arc'), label([c[0] + 15, foot[1] + 18], text, 'ang', 'start'));
  }
  for (const [x, name] of marks) parts.push(dot(T([x, 0])), label(T([x, 0]).map((v, i) => v + [0, 17][i]), name));
  parts.push(...more(T));
  return parts;
}
// a product written out, leaving out the factors that are 1: times(1, 9, 'x') is 9·x, times(4, 'x') is 4x
const times = (...f) => f.filter((v) => v !== 1).join('·').replace(/(\d)·([a-z])$/, '$1$2') || '1';
const sqrtOf = (inside) => (/^[a-z0-9]+$/.test(inside) && !/\d[a-z]/.test(inside) ? `√${inside}` : `√(${inside})`);
const PAIR = 'Two touching circles of radii p and q that rest on a line touch it 2√(pq) apart, because their centres are p + q apart and at heights p and q, and (p + q)² − (p − q)² = 4pq.';
// a circle in the gap under two touching circles: [ask, …]. 'small': big radii k·s₁² and k·s₂²; 'big': the radii are
// (p(p + q)t)², (q(p + q)t)² and (pqt)², so every square root is whole
const GAPS = [];
for (const k of [1, 2, 3]) for (let s1 = 1; s1 <= 5; s1++) for (let s2 = s1 + 1; s2 <= Math.min(6, 3 * s1); s2++) if (k * s2 * s2 <= 75) GAPS.push(['small', k, s1, s2]);
for (const [p, q, t] of [[1, 1, 2], [1, 1, 3], [1, 2, 1], [2, 1, 1], [1, 2, 2], [2, 1, 2], [1, 3, 1], [3, 1, 1], [2, 3, 1], [3, 2, 1]]) GAPS.push(['big', p, q, t]);
// the corner: the big circle has radius R = k·m², touches the floor D = k(n² − m²) from the corner, and the corner circle
// has radius k(n − m)²
const CORNERS = [[2, 3], [3, 5], [4, 6], [4, 7], [5, 8], [5, 9], [6, 9], [6, 10], [6, 11], [7, 10], [7, 11], [7, 12], [7, 13]];
function cornerFigure(R, D, r, [tR, tD, tr]) {
  // room under the floor for the measured length OT: at least 50 pixels, whichever way the picture is scaled
  const w = 380, h = 260, right = D + R, xs = [-0.12 * right, right * 1.06], scale = (low) => Math.min((w - 28) / (xs[1] - xs[0]), (h - 28) / (2.1 * R + low));
  let low = 0.25 * R;
  for (let i = 0; i < 3; i++) low = Math.max(low, 50 / scale(low));
  const T = frame(xs, [-low, 2.1 * R], w, h, 14), O = T([0, 0]), Tp = T([D, 0]);
  const parts = [seg(O, T([right * 1.06, 0])), seg(O, T([0, 2.1 * R])), ring(T([D, R]), R * T.s), ring(T([r, r]), r * T.s, 'arc'),
    seg(T([D, R]), Tp, 'seg dash'), label([T([D, R])[0] + 5, T([D, R / 2])[1]], tR, 'ang', 'start'), dot(Tp), label([Tp[0] + 10, Tp[1] + 13], 'T'),
    label([O[0] - 10, O[1] + 13], 'O'), dim(O, Tp, tD, -30)];
  const c = T([r, r]), rr = r * T.s;
  parts.push(...(rr >= 12 + 8 * String(tr).length ? [seg(c, T([r, 0]), 'seg dash'), label([c[0] + 5, c[1] + rr / 2], tr, 'ang', 'start')] : [label([c[0], c[1] - rr - 9], tr, 'ang')]));
  return svg(w, h, 'A circle on the floor and a smaller circle wedged in the corner between the floor, the wall and the first circle', parts);
}
// the ramp: circles of radii k·s² and k·t² (so 2√(ab) is whole), the ramp from P touching both
const RAMPS = [[1, 2], [2, 3], [3, 4], [3, 5], [4, 5]];
function rampFigure(a, b, c, texts, { names = true } = {}) {
  const AB = 2 * Math.sqrt(a * b), PA = (AB * a) / (b - a), xB = AB, xC = c ? xB + 2 * Math.sqrt(b * c) : 0;
  const th = 2 * Math.atan(a / PA), far = c ? xC + c * 1.15 : xB + b * 1.25, all = [{ x: 0, r: a, text: texts[0], out: names ? 'up' : 'below' }, { x: xB, r: b, text: texts[1] }];
  if (c) all.push({ x: xC, r: c, text: texts[2], cls: 'arc' });
  const tan = (x, r) => { const dd = Math.hypot(x + PA, r), al = Math.atan2(r, x + PA), L = Math.sqrt(dd * dd - r * r); return [-PA + L * Math.cos(2 * al), L * Math.sin(2 * al)]; };
  // the ramp runs on a little past the biggest circle, but no higher than the picture needs
  const topY = 1.12 * (c ? 2 * c : 2 * b), end = Math.min(far, -PA + topY / Math.tan(th)), endY = Math.tan(th) * (end + PA);
  return onLine(all, { x0: -PA, x1: far, y1: topY, lift: 0.1, marks: names ? [[-PA, 'P'], [0, 'A'], [xB, 'B']] : [[-PA, 'P']],
    more: (T) => [seg(T([-PA, 0]), T([end, endY])), ...(names === 'T' ? [dot(T(tan(xB, b))), label(T(tan(xB, b)).map((v, i) => v + [-8, -12][i]), 'T')] : [])] });
}

const tangentCircles = [
  // three circles in a row on a line: how far apart the outer two touch it (or, turned round, the middle radius)
  (d, ctx) => {
    const [k, s1, s2, s3, ask] = pick(ctx, 'row', [[1, 2, 3], range(1, 6), range(1, 6), range(1, 6), ['gap', 'middle']], (k, s1, s2, s3, ask) =>
      k * Math.max(s1, s2, s3) ** 2 <= 50 && s2 * (s1 + s3) > s1 * s3 && s2 >= Math.min(s1, s3) && Math.max(s1, s2, s3) <= 3 * Math.min(s1, s2, s3) &&
      !(s1 === s2 && s2 === s3) && (ask === 'gap' || k === 1));
    const [r1, r2, r3] = [s1, s2, s3].map((s) => k * s * s), g1 = 2 * k * s1 * s2, g2 = 2 * k * s2 * s3, L = g1 + g2;
    const figure = svg(400, 250, 'Three circles in a row on a line, the outer two touching it at P and Q', onLine([
      { x: 0, r: r1, text: r1, out: 'left' }, { x: g1, r: r2, text: ask === 'gap' ? r2 : '?' }, { x: L, r: r3, text: r3, out: 'right' }], { marks: [[0, 'P'], [L, 'Q']] }));
    const check = () => {
      const x2 = touchRight(0, r1, r2), x3 = touchRight(x2, r2, r3);
      return Math.hypot(x3, r3 - r1) <= r1 + r3 ? 'the outer circles overlap' : near(x3, L, 'PQ');
    };
    if (ask === 'gap') return {
      topic: 'Tangent circles on a line', rank: 16,
      text: `Three circles rest on a straight line in a row, each touching the next. From left to right their radii are ${r1}, ${r2} and ${r3}, and the outer two touch the line at P and Q. How long is PQ?`,
      figure,
      answer: choices(d, L, [r1 + 2 * r2 + r3, L / 2, 2 * k * s1 * s3, L + r1 + r3]),
      solution: `${PAIR} For the left pair that is 2√(${r1}·${r2}) = ${g1}, and for the right pair 2√(${r2}·${r3}) = ${g2}. So PQ = ${g1} + ${g2} = <b>${L}</b>.`,
      check,
    };
    return {
      topic: 'Tangent circles on a line', rank: 17,
      text: `Three circles rest on a straight line in a row, each touching the next. ${r1 === r3 ? `The outer two both have radius ${r1}` : `The outer two have radii ${r1} and ${r3}`} and touch the line at P and Q, and PQ = ${L}. What is the radius of the middle circle?`,
      figure,
      answer: choices(d, r2, [s2, 4 * r2, lowest(L * L, 4 * (r1 + r3)), lowest(L - r1 - r3, 2)], showFrac),
      solution: `${PAIR} With the middle radius r, PQ = 2√(${r1}r) + 2√(${r3}r) = ${2 * s1}√r + ${2 * s3}√r = ${2 * (s1 + s3)}√r. So ${2 * (s1 + s3)}√r = ${L}, which gives √r = ${s2} and r = <b>${r2}</b>.`,
      check,
    };
  },
  // a circle in the gap under two touching circles: its radius (or, turned round, one of the big radii)
  (d, ctx) => {
    const [[ask, u, v, w]] = pick(ctx, 'gap', [GAPS]);
    let r1, r2, r3, a1, a2, a3;
    if (ask === 'small') { const k = u; r1 = k * v * v; r2 = k * w * w; r3 = (k * v * v * w * w) / (v + w) ** 2; }
    else { [a1, a2, a3] = [u * (u + v) * w, v * (u + v) * w, u * v * w]; [r1, r2, r3] = [a1 * a1, a2 * a2, a3 * a3]; }
    const xb = 2 * Math.sqrt(r1 * r2), xg = 2 * Math.sqrt(r1 * r3);
    const figure = (texts) => svg(400, 250, 'Two touching circles on a line, with a third circle in the gap between them', onLine([
      { x: 0, r: r1, text: texts[0], out: 'left' }, { x: xb, r: r2, text: texts[1], out: 'right' }, { x: xg, r: r3, text: texts[2], out: 'below', cls: 'arc' }], { lift: 0.2 }));
    if (ask === 'small') {
      const k = u, s1 = v, s2 = w, ans = lowest(k * s1 * s1 * s2 * s2, (s1 + s2) ** 2), rt = k * s1 * s2;
      return {
        topic: 'Tangent circles on a line', rank: 18,
        text: `Two circles, with radii ${r1} and ${r2}, rest on a straight line and touch each other. A third circle fits in the gap below them: it touches both circles and the line. What is the radius of the third circle?`,
        figure: figure([r1, r2, '?']),
        answer: choices(d, ans, [lowest(r1 * r2, r1 + r2), k === 1 ? lowest(s1 * s2, s1 + s2) : lowest(rt, s1 + s2), lowest(r1 * r2, r1 + r2 + rt), lowest(k * s1 * s1 * s2 * s2, 4 * (s1 + s2) ** 2), lowest(4 * k * s1 * s1 * s2 * s2, (s1 + s2) ** 2)], showFrac),
        solution: `${PAIR} If the small circle has radius x, its point of contact splits the big circles’ contact distance in two: 2√(${r1}·${r2}) = 2${sqrtOf(times(r1, 'x'))} + 2√(${r2}x). Dividing by 2${sqrtOf(times(r1, r2, 'x'))} gives 1/√x = ${r1 === 1 ? '1' : `1/√${r1}`} + 1/√${r2}` + (k === 1
          ? ` = ${frac(1, s1)} + ${frac(1, s2)} = ${frac(s1 + s2, s1 * s2)}. So √x = ${frac(s1 * s2, s1 + s2)}, and x = <b>${fr(ans)}</b>.`
          : `, so √x = √(${r1}·${r2})/(√${r1} + √${r2}). Squaring, x = ${r1}·${r2}/(${r1} + ${r2} + 2√(${r1}·${r2})), and √(${r1}·${r2}) = √${r1 * r2} = ${rt}, so x = ${r1 * r2}/(${r1} + ${r2} + ${2 * rt}) = <b>${fr(ans)}</b>.`),
        check: () => {
          const xB = touchRight(0, r1, r2), got = solve((x) => Math.hypot(xB - touchRight(0, r1, x), r2 - x) - (r2 + x), 1e-9, Math.min(r1, r2));
          return near(got, ans[0] / ans[1], 'radius');
        },
      };
    }
    return {
      topic: 'Tangent circles on a line', rank: 19,
      text: `Two circles rest on a straight line and touch each other; one of them has radius ${r1}. A circle of radius ${r3} fits in the gap below them: it touches both circles and the line. What is the radius of the other circle?`,
      figure: figure([r1, '?', r3]),
      answer: choices(d, r2, [lowest(r1 * r3, r1 - r3), a2, lowest(r1 * r3, (a1 + a3) ** 2), (a1 - a3) ** 2], showFrac),
      solution: `${PAIR} With the other radius y, the small circle’s contact point splits the big circles’ contact distance in two: 2√(${r1}y) = 2√(${r1}·${r3}) + 2√(${r3}y). Dividing by 2√(${r1}·${r3}·y) gives 1/√${r3} = 1/√y + 1/√${r1}, so 1/√y = ${frac(1, a3)} − ${frac(1, a1)} = ${frac(a1 - a3, a1 * a3)}. So √y = ${a2}, and y = <b>${r2}</b>.`,
      check: () => { const xB = touchRight(0, r1, r2), xG = touchRight(0, r1, r3); return near(Math.hypot(xB - xG, r2 - r3), r2 + r3, 'the gap circle against the other circle'); },
    };
  },
  // a circle wedged in the corner between a wall, the floor and a circle on the floor: its radius, the big circle's
  // radius, or how far from the corner the big circle stands
  (d, ctx) => {
    const [[m, n], k, ask] = pick(ctx, 'corner', [CORNERS, [1, 2], ['r', 'D', 'R']], ([m, n], k) => k * (n * n - m * m) <= 100);
    const R = k * m * m, D = k * (n * n - m * m), r = k * (n - m) ** 2, AB = 2 * k * m * (n - m);
    const intro = 'In the figure, a floor and a wall meet at a right angle at the corner O.';
    const first = `Both circles rest on the floor. ${PAIR}`;
    if (ask === 'r') return {
      topic: 'Tangent circles on a line', rank: 19,
      text: `${intro} A circle of radius ${R} rests on the floor, touching it at T, where OT = ${D}. A smaller circle is wedged into the corner, touching the floor, the wall and the first circle. What is the radius of the smaller circle?`,
      figure: cornerFigure(R, D, r, [R, D, '?']),
      answer: choices(d, r, [lowest(D * D, 4 * R), D - R, lowest(R, 4), 4 * r, lowest(D, 4)], showFrac),
      solution: `${first} The small circle, of radius x, also touches the wall, so it touches the floor x from O, and then ${D} − x = 2√(${R}x). Adding ${R} to both sides of ${D} = x + 2√(${R}x) makes the right side a square: ${D + R} = (√x + ${surd(m, k)[1]})². So √x + ${surd(m, k)[1]} = ${surd(n, k)[1]}, √x = ${surd(n - m, k)[1]}, and x = <b>${r}</b>.`,
      check: () => near(solve((x) => Math.hypot(D - x, R - x) - (R + x), 0, D), r, 'radius'),
    };
    if (ask === 'D') return {
      topic: 'Tangent circles on a line', rank: 17,
      text: `${intro} A circle of radius ${R} rests on the floor, touching it at T. A circle of radius ${r} is wedged into the corner, touching the floor, the wall and the first circle. How long is OT?`,
      figure: cornerFigure(R, D, r, [R, '?', r]),
      answer: choices(d, D, [AB, R + r, AB + 2 * r, AB + R, D + r]),
      solution: `${first} The small circle also touches the wall, so it touches the floor ${r} from O. Its point of contact and T are 2√(${R}·${r}) = ${AB} apart, so OT = ${r} + ${AB} = <b>${D}</b>.`,
      check: () => near(touchRight(r, r, R), D, 'OT'),
    };
    return {
      topic: 'Tangent circles on a line', rank: 18,
      text: `${intro} A circle rests on the floor, touching it at T, where OT = ${D}. A circle of radius ${r} is wedged into the corner, touching the floor, the wall and the first circle. What is the radius of the first circle?`,
      figure: cornerFigure(R, D, r, ['?', D, r]),
      answer: choices(d, R, [lowest((D - r) ** 2, 2 * r), lowest(D * D, 4 * r), D - r, lowest((D - r) ** 2, 4)], showFrac),
      solution: `${first} The small circle also touches the wall, so it touches the floor ${r} from O, which is ${D} − ${r} = ${D - r} from T. So 2√(${r}R) = ${D - r}, and squaring, ${4 * r}R = ${(D - r) ** 2}, so R = <b>${R}</b>.`,
      check: () => near(solve((y) => Math.hypot(D - r, y - r) - (y + r), 1e-9, 1e4), R, 'radius'),
    };
  },
  // a ramp touching two circles on the ground: where it starts, how long it is up to the big circle, or the next circle
  (d, ctx) => {
    const [[s, t], k, ask] = pick(ctx, 'ramp', [RAMPS, [1, 2, 3], ['P', 'T', 'next']], ([s, t], k, ask) => ask !== 'next' || t - s === 1 && s > 1);
    const a = k * s * s, b = k * t * t, AB = 2 * k * s * t, PA = lowest(2 * k * s ** 3 * t, t * t - s * s), PB = lowest(2 * k * s * t ** 3, t * t - s * s), nx = lowest(k * t ** 4, s * s);
    const common = `${PAIR} So the two circles touch the ground 2√(${a}·${b}) = ${AB} apart.`;
    const scale = `The ground and the ramp both touch the two circles, so the enlargement from P with scale ${frac(b, a)} takes the small circle to the large one`;
    // the ramp's foot P, by matching the angles that the upper tangents from P make with the ground, and the ramp line
    const geo = () => {
      const xB = touchRight(0, a, b), xP = solve((x) => Math.atan2(a, -x) - Math.atan2(b, xB - x), -1e4, -1e-9), th = 2 * Math.atan2(a, -xP);
      return { xB, xP, th, gap: ([X, Y]) => Math.sin(th) * (X - xP) - Math.cos(th) * Y };
    };
    if (ask === 'next') return {
      topic: 'Tangent circles on a line', rank: 19,
      text: `Two circles, with radii ${a} and ${b}, rest on level ground and touch each other. A straight ramp starts on the ground beside the smaller circle and touches both circles from above. A third circle, on the far side of the circle of radius ${b}, touches that circle, the ground and the ramp. What is the radius of the third circle?`,
      figure: svg(400, 250, 'Two touching circles on the ground under a ramp, and a third circle beyond them', rampFigure(a, b, nx[0] / nx[1], [a, b, '?'], { names: false })),
      answer: choices(d, nx, [[2 * b - a, 1], [a + b, 1], lowest(b ** 3, a * a), [k * (s + t) ** 2, 1]], showFrac),
      tip: 'The ramp and the ground both touch every circle, so an enlargement from P, where they meet, takes each circle to the next one.',
      solution: `The ground and the ramp meet at P, and the enlargement from P that takes the circle of radius ${a} to the one of radius ${b} (scale ${frac(b, a)}) keeps both lines where they are. So it takes the circle of radius ${b} to a circle on its far side that touches it, the ground and the ramp, and that is the third circle. Its radius is ${b}·${frac(b, a)} = <b>${fr(nx)}</b>.`,
      check: () => {
        const { xB, gap } = geo(), got = solve((q) => gap([touchRight(xB, b, q), q]) - q, 1e-6, 50 * b);
        return near(got, nx[0] / nx[1], 'third radius');
      },
    };
    if (ask === 'P') return {
      topic: 'Tangent circles on a line', rank: 20,
      text: `Two circles, with radii ${a} and ${b}, rest on level ground and touch each other; they touch the ground at A and B. A straight ramp starts on the ground at P, on the far side of A from B, and touches both circles from above. How long is PA?`,
      figure: svg(400, 250, 'Two touching circles on the ground under a ramp that starts at P', rampFigure(a, b, 0, [a, b])),
      answer: choices(d, PA, [[AB, 1], PB, lowest(2 * k * s ** 3 * t, t * t + s * s), lowest(AB * a, b), lowest(AB, 2)], showFrac),
      tip: 'Touching circles touch the ground 2√(pq) apart, and an enlargement from P, where the ramp meets the ground, takes the small circle to the large one.',
      solution: `${common} ${scale}, and PB = ${frac(b, a)}·PA. Then PA + ${AB} = ${frac(b, a)}·PA, so (${frac(b, a)} − 1)·PA = ${AB}, which gives PA = ${AB}·${a}/(${b} − ${a}) = <b>${fr(PA)}</b>.`,
      check: () => { const { xP } = geo(); return near(-xP, PA[0] / PA[1], 'PA'); },
    };
    return {
      topic: 'Tangent circles on a line', rank: 21,
      text: `Two circles, with radii ${a} and ${b}, rest on level ground and touch each other. A straight ramp starts on the ground at P, beside the smaller circle, and touches both circles from above; it touches the larger circle at T. How long is PT?`,
      figure: svg(400, 250, 'Two touching circles on the ground under a ramp from P that touches the larger circle at T', rampFigure(a, b, 0, [a, b], { names: 'T' })),
      answer: choices(d, PB, [PA, [AB, 1], [PB[0] + b * PB[1], PB[1]], lowest(AB * b, a + b)], showFrac),
      tip: 'Touching circles touch the ground 2√(pq) apart, and an enlargement from P, where the ramp meets the ground, takes the small circle to the large one.',
      solution: `${PAIR} So the circles touch the ground at points A and B that are 2√(${a}·${b}) = ${AB} apart. ${scale}, which makes PA = ${frac(a, b)}·PB. Since PB − PA = ${AB}, (1 − ${frac(a, b)})·PB = ${AB}, and PB = ${AB}·${b}/(${b} − ${a}) = ${fr(PB)}. PT and PB are the two tangents from P to the large circle, and the two tangents from a point to a circle are equally long. So PT = <b>${fr(PB)}</b>.`,
      check: () => {
        const { xB, xP, th } = geo(), c = [xB, b], u = [Math.cos(th), Math.sin(th)], along = (c[0] - xP) * u[0] + c[1] * u[1];
        return near(Math.hypot(c[0] - xP - along * u[0], c[1] - along * u[1]), b, 'the ramp touching the large circle') || near(along, PB[0] / PB[1], 'PT');
      },
    };
  },
];

// ---------- semicircles in a square ----------
// square ABCD (A bottom left, B bottom right, C top right, D top left) with side s: its frame, outline, corner names
// and the length of AB
function squareFigure(s, w = 320, h = 300) {
  const T = frame([0, s], [0, s], w, h, 30), at = [[0, 0], [s, 0], [s, s], [0, s]].map(T), ctr = T([s / 2, s / 2]);
  return { T, parts: [poly(at), ...'ABCD'.split('').map((n, i) => label(away(at[i], ctr, 15), n)), label([mid(at[0], at[1])[0], at[0][1] + 21], s, 'ang')] };
}
const arc = (T, c, r, a, b, cls = 'side') => line(arcPts(c, r, a, b).map(T), cls);
const piMinus = (a, b) => [a * Math.PI - b, `${a === 1 ? '' : num(a, 0)}π − ${num(b, 0)}`];
// the squares: [ask, number]: 'hang' the big square's side, 'quarter' the radius, 'region' an eighth of the square's area
const SQUARES = [...[5, 10, 15, 20, 6, 8, 12, 16].map((s) => ['hang', s]), ...[5, 10, 15, 3, 4, 6, 7, 8].map((R) => ['quarter', R]), ...[1, 2, 3, 4, 5, 6, 8, 10].map((m) => ['region', m])];

const semicircles = [
  // two quarter circles in a square: the circle between them and a side (or inside both, or on a semicircle too)
  (d, ctx) => {
    const [s, ask] = pick(ctx, 'quarter', [[4, 6, 8, 10, 12, 16, 20, 24], ['top', 'low', 'three']]);
    const h = s / 2, ans = { top: lowest(s, 16), low: lowest(3 * s, 8), three: lowest(s, 6) }[ask], r = ans[0] / ans[1];
    const { T, parts } = squareFigure(s);
    parts.push(arc(T, [0, 0], s, 0, 90), arc(T, [s, 0], s, 90, 180), ...(ask === 'three' ? [arc(T, [h, 0], h, 0, 180)] : []), ring(T([h, { top: s - r, low: r, three: h + r }[ask]]), r * T.s, 'arc'));
    const arcs = `In square ABCD with side ${s}, two quarter circles are drawn inside the square: one centred at A, from B to D, and one centred at B, from A to C.`;
    const start = `Put A at (0, 0) and B at (${s}, 0). By symmetry the circle’s centre is on the line x = ${h}, halfway between A and B.`;
    const text = {
      top: `${arcs} A small circle, above the point where the two arcs cross, touches both arcs and side CD. What is the radius of the small circle?`,
      low: `${arcs} A circle inside both quarter circles touches both arcs and side AB. What is the radius of the circle?`,
      three: `${arcs} A semicircle with diameter AB is drawn inside the square too. A circle inside both quarter circles touches both arcs and touches the semicircle from outside. What is the radius of the circle?`,
    }[ask];
    const solution = {
      top: `${start} It touches CD, so its centre is (${h}, ${s} − r), and it is outside both quarter circles, so its centre is ${s} + r from A: ${h}² + (${s} − r)² = (${s} + r)². Expanding, ${h * h} = ${4 * s}r, so r = <b>${fr(ans)}</b>.`,
      low: `${start} It touches AB, so its centre is (${h}, r), and it is inside both quarter circles, so its centre is ${s} − r from A: ${h}² + r² = (${s} − r)². Expanding, ${h * h} = ${s * s} − ${2 * s}r, so r = ${(3 * s * s) / 4}/${2 * s} = <b>${fr(ans)}</b>.`,
      three: `${start} It touches the semicircle (centre (${h}, 0), radius ${h}) from outside, so its centre is (${h}, ${h} + r); it is inside the quarter circle about A, so ${h}² + (${h} + r)² = (${s} − r)². Expanding, ${2 * h * h} + ${s}r = ${s * s} − ${2 * s}r, so ${3 * s}r = ${(s * s) / 2} and r = <b>${fr(ans)}</b>.`,
    }[ask];
    const wrongs = { top: [[s, 8], [s, 12], [s, 4], [3 * s, 16], [s, 32]], low: [[s, 2], [s, 4], [3 * s, 16], [s, 3], [5 * s, 8]], three: [[s, 4], [s, 8], [s, 3], [s, 5], [s, 12]] }[ask];
    return {
      topic: 'Semicircles in a square', rank: { top: 19, low: 18, three: 19 }[ask], text,
      figure: svg(320, 300, 'Square ABCD with quarter circles about A and B and a circle touching them', parts),
      answer: choices(d, ans, wrongs.map((w) => lowest(...w)), showFrac),
      solution,
      check: () => {
        const got = {
          top: () => solve((x) => Math.hypot(h, s - x) - (s + x), 0, h),
          low: () => solve((x) => s - x - Math.hypot(h, x), 0, h),
          three: () => solve((x) => s - x - Math.hypot(h, h + x), 0, h),
        }[ask]();
        return near(got, r, 'radius');
      },
    };
  },
  // a circle touching two semicircles (or a semicircle and a quarter circle) drawn in a square, and a side
  (d, ctx) => {
    const [s, ask] = pick(ctx, 'semis', [[6, 8, 10, 12, 16, 18, 20, 24], ['in-out', 'quarter', 'sides']]);
    const h = s / 2, ans = { 'in-out': lowest(2 * s, 9), quarter: lowest(s, 4), sides: lowest(s, 8) }[ask], r = ans[0] / ans[1];
    const { T, parts } = squareFigure(s);
    if (ask === 'in-out') parts.push(arc(T, [h, 0], h, 0, 180), arc(T, [0, h], h, -90, 90), ring(T([3 * r, r]), r * T.s, 'arc'));
    if (ask === 'quarter') parts.push(arc(T, [0, 0], s, 0, 90), arc(T, [h, 0], h, 0, 180), ring(T([r, Math.sqrt(2 * s * r)]), r * T.s, 'arc'));
    if (ask === 'sides') parts.push(arc(T, [0, h], h, -90, 90), arc(T, [s, h], h, 90, 270), ring(T([h, r]), r * T.s, 'arc'));
    const text = {
      'in-out': `Square ABCD has side ${s}. Semicircles are drawn inside the square on sides AB and AD, with those sides as diameters. A circle inside the semicircle on AB touches that semicircle, touches side AB, and touches the semicircle on AD from outside. What is the radius of the circle?`,
      quarter: `Square ABCD has side ${s}. Inside it are drawn a quarter circle centred at A, from B to D, and a semicircle with diameter AB. A circle inside the quarter circle touches its arc, touches side AD, and touches the semicircle from outside. What is the radius of the circle?`,
      sides: `Square ABCD has side ${s}. Semicircles are drawn inside the square on sides AD and BC, with those sides as diameters, so they meet at the centre of the square. A circle touches both semicircles from outside and touches side AB. What is the radius of the circle?`,
    }[ask];
    const solution = {
      'in-out': `Put A at (0, 0), B at (${s}, 0) and D at (0, ${s}); the circle touches AB, so its centre is (x, r). It is inside the semicircle about (${h}, 0) of radius ${h}, so (x − ${h})² + r² = (${h} − r)², that is (x − ${h})² = ${h * h} − ${s}r. It is outside the semicircle about (0, ${h}), so x² + (r − ${h})² = (r + ${h})², that is x² = ${2 * s}r. Subtracting the first from the second gives ${s}x − ${h * h} = ${3 * s}r − ${h * h}, so x = 3r; then 9r² = ${2 * s}r, and r = <b>${fr(ans)}</b>.`,
      quarter: `Put A at (0, 0) and B at (${s}, 0); the circle touches AD, so its centre is (r, y). It is inside the quarter circle of radius ${s} about A, so r² + y² = (${s} − r)², that is y² = ${s * s} − ${2 * s}r. It is outside the semicircle about (${h}, 0) of radius ${h}, so (r − ${h})² + y² = (r + ${h})², that is y² = ${2 * s}r. So ${s * s} − ${2 * s}r = ${2 * s}r, and r = <b>${fr(ans)}</b>.`,
      sides: `By symmetry the circle’s centre is halfway across, at (${h}, r) when A is (0, 0) and B is (${s}, 0). It touches the semicircle about (0, ${h}), of radius ${h}, from outside, so ${h}² + (${h} − r)² = (${h} + r)². Expanding, ${h * h} = ${2 * s}r, so r = <b>${fr(ans)}</b>.`,
    }[ask];
    const wrongs = { 'in-out': [[s, 4], [s, 6], [s, 8], [s, 3], [4 * s, 9]], quarter: [[s, 3], [s, 6], [s, 8], [3 * s, 8], [s, 5]], sides: [[s, 4], [s, 6], [s, 16], [3 * s, 8], [s, 9]] }[ask];
    return {
      topic: 'Semicircles in a square', rank: { 'in-out': 22, quarter: 20, sides: 18 }[ask], text,
      figure: svg(320, 300, 'Square ABCD with arcs drawn inside it and a circle touching them', parts),
      answer: choices(d, ans, wrongs.map((w) => lowest(...w)), showFrac),
      solution,
      check: () => {
        const got = {
          // for each radius, the centre that touches the outer arc and the side, then how far it misses the other arc
          'in-out': () => solve((q) => { const x = solve((X) => Math.hypot(X, q - h) - (q + h), 0, s); return h - q - Math.hypot(x - h, q); }, 0.01 * h, 0.9 * h),
          quarter: () => solve((q) => { const y = solve((Y) => Math.hypot(q - h, Y) - (q + h), 0, s); return s - q - Math.hypot(q, y); }, 0.01 * h, 0.99 * h),
          sides: () => solve((q) => Math.hypot(h, h - q) - (h + q), 0, h),
        }[ask]();
        return near(got, r, 'radius');
      },
    };
  },
  // a chord of a big semicircle touching a smaller one inside it (or the arbelos): only one length matters
  (d, ctx) => {
    const [c, ask] = pick(ctx, 'chord', [[2, 4, 6, 8, 10, 12, 14, 16], ['area', 'chord', 'arbelos']]);
    const w = 400, h = 250, same = 'A semicircle has diameter AB. A smaller semicircle sits inside it, on the same side of AB, with its diameter lying along AB but not centred on it. A chord PQ of the large semicircle is parallel to AB and touches the small semicircle';
    if (ask === 'arbelos') {
      const ans = lowest(c * c, 4), A = [-1.25 * c, 0], C = [-0.75 * c, 0], B = [1.25 * c, 0], D = [-0.75 * c, c];
      const T = frame([-1.25 * c, 1.25 * c], [0, 1.25 * c], w, h, 26), O = [0, 0];
      const region = [...arcPts(O, 1.25 * c, 0, 180), ...arcPts([-c, 0], 0.25 * c, 180, 0), ...arcPts([0.25 * c, 0], c, 180, 0)].map(T);
      return {
        topic: 'Semicircles in a square', rank: 20,
        text: `Points A, C and B lie on a line in that order, and semicircles are drawn on AB, AC and CB, all on the same side of the line. The line through C perpendicular to AB meets the large semicircle at D, and CD = ${c}. What is the area of the region inside the large semicircle but outside both small ones?`,
        figure: svg(w, h, 'Three semicircles on AB, AC and CB, with CD perpendicular to AB', [poly(region), seg(T(A), T(B)), seg(T(C), T(D), 'seg'), corner(T(C), T(B), T(D)),
          ...[[A, 'A', -12, 8], [B, 'B', 12, 8], [C, 'C', 0, 16], [D, 'D', -10, -12]].map(([p, n, dx, dy]) => label(T(p).map((v, i) => v + [dx, dy][i]), n)), label(mid(T(C), T(D)).map((v, i) => v + [-12, 0][i]), c, 'ang')]),
        answer: choices(d, ans, [lowest(c * c, 2), lowest(c * c, 8), [c * c, 1], lowest(c * c, 16)], piShow),
        tip: 'Call the small radii p and q, so the big one is p + q; angle ADB is a right angle, so CD² = AC·CB.',
        solution: `Say AC = 2p and CB = 2q, so the three radii are p, q and p + q. Angle ADB is a right angle (it stands on the diameter AB), and CD is the altitude to its hypotenuse, so CD² = AC·CB = 4pq. The region’s area is ½π(p + q)² − ½πp² − ½πq² = πpq = π·${c}²/4 = <b>${piShow(ans)}</b>.`,
        check: () => {
          // two different splits of AB with the same CD: grid counts of the region
          const area = (p, q) => gridArea([-(p + q), p + q], [0, p + q], ([x, y]) => x * x + y * y <= (p + q) ** 2 && Math.hypot(x + q, y) > p && Math.hypot(x - p, y) > q);
          return near(area(c / 4, c), (Math.PI * ans[0]) / ans[1], 'area, AC : CB = 1 : 4', 0.01) || near(area(c / 2, c / 2), (Math.PI * ans[0]) / ans[1], 'area, AC = CB', 0.01);
        },
      };
    }
    const area = lowest(c * c, 8), hc = c / 2, R = 1.25 * hc, r = 0.75 * hc, e = (ask === 'area' ? -0.35 : 0.3) * hc;
    const T = frame([-R, R], [0, R], w, h, 26), O = [0, 0], P = [-hc, r], Q = [hc, r];
    const region = [...arcPts(O, R, 0, 180), ...arcPts([e, 0], r, 180, 0)].map(T);
    const figure = svg(w, h, 'A semicircle on AB with a smaller semicircle inside it and a chord PQ touching the smaller one', [poly(region), seg(T([-R, 0]), T([R, 0])), seg(T(P), T(Q), 'seg'), dot(T([e, r])),
      label(T([-R, 0]).map((v, i) => v + [-12, 8][i]), 'A'), label(T([R, 0]).map((v, i) => v + [12, 8][i]), 'B'), label(T(P).map((v, i) => v + [-12, -6][i]), 'P'), label(T(Q).map((v, i) => v + [12, -6][i]), 'Q'),
      label([T([0, r])[0], T([0, r])[1] - 12], ask === 'area' ? c : '?', 'ang')]);
    // grid counts of the region for the pictured semicircles and for another pair with the same chord
    const check = () => {
      const reg = (Rr, rr, ee) => gridArea([-Rr, Rr], [0, Rr], ([x, y]) => x * x + y * y <= Rr * Rr && Math.hypot(x - ee, y) > rr);
      const r1 = 0.4 * hc, R1 = Math.sqrt(hc * hc + r1 * r1), want = (Math.PI * area[0]) / area[1];
      return near(2 * Math.sqrt(R * R - r * r), c, 'PQ') || near(reg(R, r, e), want, 'area', 0.01) || near(reg(R1, r1, 0.5 * hc), want, 'area with other radii', 0.01);
    };
    if (ask === 'area') return {
      topic: 'Semicircles in a square', rank: 19,
      text: `${same}, and PQ = ${c}. What is the area of the region inside the large semicircle but outside the small one?`,
      figure,
      answer: choices(d, area, [lowest(c * c, 4), lowest(c * c, 2), lowest(c * c, 16), [c, 1]], piShow),
      tip: 'The chord is r above AB, so Pythagoras in the large semicircle gives R² − r², and that is all the region’s area needs.',
      solution: `Call the radii R and r. The chord is parallel to AB and touches the small semicircle at its highest point, so it is r above AB, and so r from the centre of the large semicircle too. By Pythagoras, (PQ/2)² + r² = R², so R² − r² = (${c}/2)² = ${(c * c) / 4}. The region’s area is ½πR² − ½πr² = ½π·${(c * c) / 4} = <b>${piShow(area)}</b>.`,
      check,
    };
    return {
      topic: 'Semicircles in a square', rank: 19,
      text: `${same}. The region inside the large semicircle but outside the small one has area ${piShow(area)}. How long is PQ?`,
      figure,
      answer: labelled([c, num(c, 0)], [[c / 2, num(c / 2, 0)], [2 * c, num(2 * c, 0)], surd(c / 2, 2), surd(c, 2)]),
      tip: 'The chord is r above AB, so Pythagoras in the large semicircle gives R² − r², and that is all the region’s area needs.',
      solution: `Call the radii R and r. The chord is parallel to AB and touches the small semicircle at its highest point, so it is r above AB, and so r from the centre of the large semicircle; by Pythagoras, (PQ/2)² = R² − r². The region’s area is ½πR² − ½πr² = ½π(PQ/2)², so ½π(PQ/2)² = ${piShow(area)}, which gives (PQ/2)² = ${(c * c) / 4}. So PQ/2 = ${c / 2}, and PQ = <b>${c}</b>.`,
      check,
    };
  },
  // squares among semicircles: hanging from a side onto a semicircle, in a quarter circle, or standing in a semicircle
  (d, ctx) => {
    const [[ask, v]] = pick(ctx, 'squares', [SQUARES]);
    if (ask === 'hang') {
      const s = v, half = frac(s, 2), t = (3 * s) / 5, ans = lowest(9 * s * s, 25), { T, parts } = squareFigure(s);
      const sq = [[s / 2 - t / 2, s], [s / 2 + t / 2, s], [s / 2 + t / 2, s - t], [s / 2 - t / 2, s - t]].map(T);
      parts.push(arc(T, [s / 2, 0], s / 2, 0, 180), poly(sq, 'arc'), dot(sq[2]), dot(sq[3]));
      return {
        topic: 'Semicircles in a square', rank: 21,
        text: `Square ABCD has side ${s}, and a semicircle with diameter AB is drawn inside it. A smaller square hangs from side CD: its top side lies along CD, and its two bottom corners are on the semicircle. What is the area of the smaller square?`,
        figure: svg(320, 300, 'Square ABCD with a semicircle on AB and a smaller square hanging from CD onto it', parts),
        answer: choices(d, ans, [lowest(s * s, 5), lowest(s * s, 4), lowest(16 * s * s, 25), lowest(9 * s * s, 16), lowest(s * s, 2)], showFrac),
        tip: 'Give the square’s corners coordinates, using its symmetry; a corner on an arc is exactly one radius from that arc’s centre.',
        solution: `Put A at (0, 0) and B at (${s}, 0), so the semicircle has centre (${half}, 0) and radius ${half}. The two bottom corners are at the same height, so they sit symmetrically about x = ${half}, and with side t they are (${half} ± t/2, ${s} − t). Being on the semicircle, (t/2)² + (${s} − t)² = ${s % 2 ? `(${half})` : half}², which simplifies to 5t² − ${8 * s}t + ${3 * s * s} = 0, or (5t − ${3 * s})(t − ${s}) = 0. The smaller square has t = ${frac(3 * s, 5)}, so its area is <b>${fr(ans)}</b>.`,
        check: () => { const got = solve((x) => (x / 2) ** 2 + (s - x) ** 2 - (s / 2) ** 2, 0, 0.9 * s); return near(got * got, ans[0] / ans[1], 'area'); },
      };
    }
    if (ask === 'quarter') {
      const R = v, ans = lowest(2 * R * R, 5), u = R / Math.sqrt(5), T = frame([0, R], [0, R], 320, 290, 30), O = T([0, 0]);
      const sq = [[u, 0], [0, u], [u, 2 * u], [2 * u, u]].map(T);
      return {
        topic: 'Semicircles in a square', rank: 20,
        text: `A quarter circle has centre O and radius ${R}; its straight edges are the radii OX and OY. Square EFGH has E on OX, F on OY, and G and H on the arc. What is the area of the square?`,
        figure: svg(320, 290, 'A quarter circle with a square that has a corner on each straight edge and two on the arc', [poly([O, ...arcPts([0, 0], R, 0, 90).map(T)]), poly(sq, 'arc'),
          label([O[0] - 10, O[1] + 12], 'O'), label(T([R, 0]).map((v2, i) => v2 + [10, 12][i]), 'X'), label(T([0, R]).map((v2, i) => v2 + [-12, -2][i]), 'Y'),
          ...['E', 'F', 'G', 'H'].map((n, i) => label(away(sq[i], centre(sq), 13), n)), label(T([R * 0.82, 0]).map((v2, i) => v2 + [0, 18][i]), R, 'ang')]),
        answer: choices(d, ans, [lowest(R * R, 2), lowest(4 * R * R, 5), lowest(R * R, 5), lowest(2 * R * R, 3), lowest(R * R, 4)], showFrac),
        tip: 'Give the square’s corners coordinates, using its symmetry; a corner on an arc is exactly one radius from that arc’s centre.',
        solution: `Put O at (0, 0) with E = (u, 0) and F = (0, v). Turning FE = (u, −v) a quarter turn gives (v, u), so the other corners are G = F + (v, u) = (v, u + v) and H = E + (v, u) = (u + v, u). Both are ${R} from O, so v² + (u + v)² = ${R * R} = (u + v)² + u², which gives u = v, and then 5u² = ${R * R}. The side EF is u√2, so the area is 2u² = <b>${fr(ans)}</b>.`,
        check: () => {
          // for each E, the F that puts H on the arc; then the E that puts G on the arc too
          const vOf = (x) => Math.sqrt(R * R - x * x) - x, e = solve((x) => Math.hypot(vOf(x), x + vOf(x)) - R, 1e-9, 0.7 * R), f = vOf(e);
          return near(e * e + f * f, ans[0] / ans[1], 'area');
        },
      };
    }
    const m = v, A = 8 * m, x = Math.sqrt(A), R = Math.sqrt(10 * m), correct = piMinus(5 * m, A), T = frame([-R, R], [0, R], 400, 230, 24);
    const region = [[-R, 0], [-x / 2, 0], [-x / 2, x], [x / 2, x], [x / 2, 0], [R, 0], ...arcPts([0, 0], R, 0, 180)].map(T);
    return {
      topic: 'Semicircles in a square', rank: 19,
      text: `A square stands on the diameter of a semicircle, with its two top corners on the arc. The square has area ${A}. What is the area of the part of the semicircle outside the square?`,
      figure: svg(400, 230, 'A square standing on the diameter of a semicircle with its top corners on the arc', [poly(region), poly([[-x / 2, 0], [-x / 2, x], [x / 2, x], [x / 2, 0]].map(T)), label(T([0, x / 2]), A, 'ang')]),
      answer: labelled(correct, [piMinus(10 * m, A), piMinus(4 * m, A), [5 * m * Math.PI, `${5 * m === 1 ? '' : 5 * m}π`], piMinus(5 * m, 4 * m)]),
      tip: 'Give the square’s corners coordinates, using its symmetry; a corner on an arc is exactly one radius from that arc’s centre.',
      solution: `By symmetry the square is centred on the semicircle’s centre O; with side x, its top corners are x/2 to the side of O and x up. So the radius R satisfies R² = (x/2)² + x² = ${frac(5, 4)}x² = ${frac(5, 4)}·${A} = ${10 * m}. The semicircle has area ½πR² = ${5 * m}π, so the part outside the square is <b>${correct[1]}</b>.`,
      check: () => near(gridArea([-R, R], [0, R], ([px, py]) => px * px + py * py <= R * R && !(Math.abs(px) <= x / 2 && py <= x)), correct[0], 'area', 0.01),
    };
  },
];

// ---------- cutting a cone ----------
// a level circle (radius rho, at height y, centred on x = cx) seen a little from above, as half an ellipse: angles
// 180 to 360 are its front half, 0 to 180 its back half
const ell = (cx, y, rho, a, b) => range(0, 24).map((i) => { const t = ((a + ((b - a) * i) / 24) * Math.PI) / 180; return [cx + rho * Math.cos(t), y + 0.25 * rho * Math.sin(t)]; });
// a cone of height hc and radius rb with its axis on x = cx, point up (on its base) or point down, and the water in it
// wd deep (0 for none), the water first so that it is shaded; wrapped in a group so a second cone is shaded too
function cone(T, cx, rb, hc, up, wd = 0) {
  const parts = [];
  if (up) {
    const rw = (rb * (hc - wd)) / hc;
    if (wd) parts.push(poly([...ell(cx, 0, rb, 180, 360), ...ell(cx, wd, rw, 360, 180)].map(T)), line(ell(cx, wd, rw, 180, 360).map(T), 'arc'), line(ell(cx, wd, rw, 0, 180).map(T), 'arc'));
    parts.push(seg(T([cx - rb, 0]), T([cx, hc])), seg(T([cx + rb, 0]), T([cx, hc])), line(ell(cx, 0, rb, 180, 360).map(T)), line(ell(cx, 0, rb, 0, 180).map(T), 'side dash'));
  } else {
    const rw = (rb * wd) / hc;
    if (wd) parts.push(poly([[cx, 0], ...ell(cx, wd, rw, 180, 360)].map(T)), line(ell(cx, wd, rw, 0, 360).map(T), 'arc'));
    parts.push(seg(T([cx - rb, hc]), T([cx, 0])), seg(T([cx + rb, hc]), T([cx, 0])), line(ell(cx, hc, rb, 0, 360).map(T)));
  }
  return `<g>${parts.join('')}</g>`;
}
// a height marked beside a cone: a measuring line on x from y0 to y1 (world), its label to the left or right
const tall = (T, x, y0, y1, text, side = -1) => dim(T([x, y1]), T([x, y0]), text, side);
// volume of a cone of height 1 and base radius 1 between heights t0 and t1 measured from the apex, slice by slice
const coneSlices = (t0, t1) => simpson((t) => Math.PI * t * t, t0, t1, 400);
const TWO = [[1, 1], [1, 2], [2, 1], [1, 3], [3, 1], [2, 3], [3, 2], [1, 4], [3, 4], [4, 3]];
const SLICES = [[3, 2], [3, 3], [4, 2], [4, 3], [4, 4], [5, 2], [5, 3], [5, 4], [5, 5]];
const FILLS = [[1, 2, 'half'], [1, 4, 'a quarter'], [1, 3, 'a third'], [2, 3, 'two thirds'], [3, 4, 'three quarters'], [1, 9, 'a ninth'], [2, 9, 'two ninths']];
// frustums whose volume is whole and whose missing apex is a whole number of units up: [a, b, h]
const FRUSTA = [];
for (let a = 4; a <= 12; a++) for (let b = 2; b < a; b++) for (let h = 2; h <= 9; h++) if ((h * a) % (a - b) === 0 && (h * a) / (a - b) <= 30 && (h * (a * a + a * b + b * b)) % 3 === 0) FRUSTA.push([a, b, h]);
// the oblique picture of a frustum: bottom a-by-a square, top b-by-b square, height h
function frustumFigure(a, b, h, [ta, tb, th]) {
  const e = (a - b) / 2, dep = (v) => [v[0], v[1] * 0.85, v[2]], bottom = [[0, 0, 0], [a, 0, 0], [a, a, 0], [0, a, 0]], top = [[e, e, h], [a - e, e, h], [a - e, a - e, h], [e, a - e, h]];
  const all = [...bottom, ...top].map((v) => oblique(dep(v))), T = frame(...[0, 1].map((i) => [Math.min(...all.map((p) => p[i])), Math.max(...all.map((p) => p[i]))]), 380, 270, 34);
  const P = (v) => T(oblique(dep(v))), B = bottom.map(P), U = top.map(P), hid = (i) => (i === 3 ? 'side dash' : 'side');
  const parts = [poly([B[0], B[1], U[1], U[0]]), ...[0, 1, 2, 3].map((i) => seg(B[i], B[(i + 1) % 4], i === 2 || i === 3 ? 'side dash' : 'side')), ...[0, 1, 2, 3].map((i) => seg(U[i], U[(i + 1) % 4])), ...[0, 1, 2, 3].map((i) => seg(B[i], U[i], hid(i)))];
  const cb = P([a / 2, a / 2, 0]), ct = P([a / 2, a / 2, h]);
  parts.push(seg(ct, cb, 'seg dash'), label([mid(cb, ct)[0] + 6, mid(cb, ct)[1]], th, 'ang', 'start'), label([mid(B[0], B[1])[0], B[0][1] + 20], ta, 'ang'), label([mid(U[0], U[1])[0], U[0][1] + 17], tb, 'ang'));
  return svg(380, 270, 'A frustum of a square pyramid', parts);
}
const PEELS = [[3, 4, 5], [4, 3, 5], [5, 12, 13], [6, 8, 10], [8, 6, 10], [12, 5, 13], [9, 12, 15], [8, 15, 17]];
const TURNS = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5], [1, 5]];

const cones = [
  // a cone cut by planes parallel to its base: the ratio of the two pieces, or the share of one slice
  (d, ctx) => {
    const [[ask, u, v]] = pick(ctx, 'pieces', [[...TWO.map(([m, n]) => ['two', m, n]), ...SLICES.map(([n, j]) => ['slice', n, j])]]);
    const w = 320, h = 290, T = frame([-1.5, 1.25], [-0.3, 2.05], w, h, 16), rb = 1, hc = 2;
    if (ask === 'two') {
      const m = u, n = v, q = m + n, yc = (hc * n) / q, rc = (rb * m) / q, correct = ratio(m ** 3, q ** 3 - m ** 3);
      return {
        topic: 'Cutting a cone', rank: 16,
        text: `A plane parallel to the base of a solid cone cuts its height in the ratio ${m} : ${n}, measured from the apex. What is the ratio of the volume of the small cone it cuts off to the volume of the piece that is left?`,
        figure: svg(w, h, 'A cone cut by a plane parallel to its base', [cone(T, 0, rb, hc, true), line(ell(0, yc, rc, 180, 360).map(T)), line(ell(0, yc, rc, 0, 180).map(T), 'side dash'),
          tall(T, -1.2, yc, hc, m), tall(T, -1.2, 0, yc, n)]),
        answer: labelled(correct, [ratio(m, n), ratio(m * m, q * q - m * m), ratio(m ** 3, q ** 3), ratio(m, q), ratio(m * m, q * q), ratio(m ** 3, n ** 3)]),
        solution: `The small cone is similar to the whole cone, with ${frac(m, q)} of its height, so it has (${frac(m, q)})³ = ${frac(m ** 3, q ** 3)} of its volume. The piece that is left has the other ${frac(q ** 3 - m ** 3, q ** 3)}. So the ratio is <b>${correct[1]}</b>.`,
        check: () => near(coneSlices(0, m / q) / coneSlices(m / q, 1), correct[0], 'ratio', 1e-6),
      };
    }
    const n = u, j = v, ans = lowest(j ** 3 - (j - 1) ** 3, n ** 3), y0 = hc * (1 - j / n), y1 = hc * (1 - (j - 1) / n), r0 = (rb * j) / n, r1 = (rb * (j - 1)) / n;
    return {
      topic: 'Cutting a cone', rank: 17,
      text: `Planes parallel to the base cut a solid cone into ${n} slices of equal thickness. Counting from the apex, what fraction of the cone’s volume is in the ${ord(j)} slice?`,
      figure: svg(w, h, `A cone cut into ${n} slices of equal thickness`, [`<g>${poly([...ell(0, y0, r0, 180, 360), ...ell(0, y1, r1, 360, 180)].map(T))}</g>`, cone(T, 0, rb, hc, true),
        ...range(1, n - 1).flatMap((i) => { const y = (hc * i) / n, r = rb * (1 - i / n); return [line(ell(0, y, r, 180, 360).map(T)), line(ell(0, y, r, 0, 180).map(T), 'side dash')]; }),
        label(T([0, (y0 - 0.25 * r0 + y1 - 0.25 * r1) / 2]), '?', 'ang')]),
      answer: choices(d, ans, [[1, n], lowest(2 * j - 1, n * n), lowest(j ** 3, n ** 3), lowest((j - 1) ** 3, n ** 3), lowest(j, (n * (n + 1)) / 2)].filter((v) => v[0] < v[1]), showFrac),
      solution: `The top j slices together make a cone similar to the whole one, with j/${n} of its height, so they hold (j/${n})³ of its volume. So the top ${j} slices hold ${j === n ? 'all of it, 1' : `(${j}/${n})³ = ${frac(j ** 3, n ** 3)}`}, and the top ${j - 1} ${j - 1 === 1 ? 'slice holds' : 'slices hold'} (${j - 1}/${n})³ = ${frac((j - 1) ** 3, n ** 3)}. The ${ord(j)} slice is the difference: ${frac(j ** 3, n ** 3)} − ${frac((j - 1) ** 3, n ** 3)} = <b>${fr(ans)}</b>.`,
      check: () => near(coneSlices((j - 1) / n, j / n) / coneSlices(0, 1), ans[0] / ans[1], 'share', 1e-6),
    };
  },
  // water in a cone standing point down: how deep it is when it holds a given share, or how long it takes to fill
  (d, ctx) => {
    const [[ask, x, y, z]] = pick(ctx, 'water', [[...FILLS.flatMap(([a, b, word]) => [2, 3].map((u) => ['depth', [a, b, word], b * u, 0])), ...[[1, 2], [1, 3], [2, 3], [3, 4], [2, 5], [3, 5], [1, 4]].flatMap(([p, q]) => [1, 2].map((u) => ['time', p, q, u]))]]);
    const w = 320, h = 290, T = frame([-1.45, 1.2], [-0.15, 2.4], w, h, 16), rb = 0.95, hc = 2;
    const vol = (dd, H) => simpson((t) => Math.PI * t * t, 0, dd, 400) / simpson((t) => Math.PI * t * t, 0, H, 400);   // share of a point-down cone of height H filled to depth dd
    if (ask === 'depth') {
      const [a, b, word] = x, H = y, c = cbrt(H / b, a * b * b), wd = hc * Math.cbrt(a / b);
      const sq = surd(H / b, a * b), top = cbrt(H / b, (b - a) * b * b), low = cbrt(H / b, a * a * b);
      return {
        topic: 'Cutting a cone', rank: 18,
        text: `A cone-shaped glass stands point down and is ${H} cm deep inside. It holds water filling ${word} of its volume. How deep is the water, in centimetres?`,
        figure: svg(w, h, 'A cone-shaped glass, point down, partly filled with water', [cone(T, 0, rb, hc, false, wd), tall(T, -1.15, 0, hc, H), tall(T, 1.05, 0, wd, '?', 1)]),
        answer: labelled(c, [[(H * a) / b, frac(H * a, b)], sq, [H - c[0], `${H} − ${c[1]}`], top, low]),
        solution: `The water forms a cone similar to the glass, point down, so when it is d deep its volume is (d/${H})³ of the full glass. So (d/${H})³ = ${frac(a, b)}, and d = ${H}·∛(${frac(a, b)}). Multiplying the top and bottom inside the cube root by ${b * b} gives ∛(${frac(a, b)}) = ∛${a * b * b}/${b}, so d = ${H}·∛${a * b * b}/${b} = ${`${H / b}∛${a * b * b}` === c[1] ? '' : `${H / b}∛${a * b * b} = `}<b>${c[1]}</b>.`,
        check: () => near(vol(c[0], H), a / b, 'share of the glass', 1e-6),
      };
    }
    const p = x, q = y, u = z, Tm = p ** 3 * u, ans = u * (q ** 3 - p ** 3), wd = (hc * p) / q;
    return {
      topic: 'Cutting a cone', rank: 17,
      text: `Water pours at a steady rate into a cone-shaped tank that stands point down. After ${Tm} minutes the water is ${frac(p, q)} of the way up the tank, measured by depth. How many more minutes does it take to fill the tank?`,
      figure: svg(w, h, 'A cone-shaped tank, point down, partly filled with water', [cone(T, 0, rb, hc, false, wd), tall(T, -1.15, 0, hc, 'h'), tall(T, 1.05, 0, wd, `${p === 1 ? '' : p}h/${q}`, 1)]),
      answer: choices(d, ans, [lowest(Tm * (q - p), p), lowest(Tm * (q * q - p * p), p * p), u * q ** 3, lowest(Tm * (q - p) ** 3, p ** 3)], showFrac),
      solution: `At depth d the water is a cone similar to the tank, so its volume grows like d³. When the water is ${frac(p, q)} of the way up, the tank is (${frac(p, q)})³ = ${frac(p ** 3, q ** 3)} full, and at a steady rate that took ${Tm} minutes. So the whole tank takes ${Tm} ÷ ${frac(p ** 3, q ** 3)} = ${u * q ** 3} minutes, and the time still needed is ${u * q ** 3} − ${Tm} = <b>${ans}</b>.`,
      check: () => near(Tm / vol(p / q, 1) - Tm, ans, 'minutes', 1e-6),
    };
  },
  // a frustum of a square pyramid: its volume (by putting the apex back), or its whole surface
  (d, ctx) => {
    const [[ask, x, y, z]] = pick(ctx, 'frustum', [[...FRUSTA.map(([a, b, h]) => ['volume', a, b, h]), ...PEELS.flatMap((t) => [2, 3, 4, 5].map((b) => ['surface', t, b, 0]))]]);
    if (ask === 'volume') {
      const [a, b, h] = [x, y, z], H = (h * a) / (a - b), V = (h * (a * a + a * b + b * b)) / 3;
      return {
        topic: 'Cutting a cone', rank: 17,
        text: `A frustum is the part of a pyramid between its base and a cut parallel to the base. This one comes from a square pyramid: its bottom is ${an(a)} ${a}-by-${a} square, its top is ${an(b)} ${b}-by-${b} square, and it is ${h} tall. What is its volume?`,
        figure: frustumFigure(a, b, h, [a, b, h]),
        answer: choices(d, V, [lowest(h * (a * a + b * b), 2), lowest(h * (a + b) ** 2, 4), lowest(a * a * H, 3), lowest(h * (a * a + b * b), 3), h * a * b], showFrac),
        solution: `Put the missing top back. The cut-off top is a pyramid similar to the whole one with ${frac(b, a)} of its size, so if the whole pyramid is H tall the top part is ${frac(b, a)}·H tall, and H − ${frac(b, a)}·H = ${h} gives H = ${H}. The frustum is the whole pyramid minus the small one: ⅓·${a}²·${H} − ⅓·${b}²·${H - h} = ${frac(a * a * H, 3)} − ${frac(b * b * (H - h), 3)} = <b>${num(V)}</b>.`,
        check: () => near(simpson((t) => (a + ((b - a) * t) / h) ** 2, 0, h), V, 'volume', 1e-9),
      };
    }
    const [e, h, sl] = x, b = y, a = b + 2 * e, lat = 2 * (a + b) * sl, S = a * a + b * b + lat;
    return {
      topic: 'Cutting a cone', rank: 18,
      text: `A frustum of a square pyramid (the part between its base and a cut parallel to the base) has ${an(a)} ${a}-by-${a} square bottom, ${an(b)} ${b}-by-${b} square top, and height ${h}. What is its total surface area, both squares included?`,
      figure: frustumFigure(a, b, h, [a, b, h]),
      answer: choices(d, S, [lat, a * a + b * b + 2 * (a + b) * h, a * a + lat, a * a + b * b + 4 * (a + b) * sl]),
      tip: 'Each slanted face is a trapezoid, and its height, the slant height, comes from a right triangle with the frustum’s height and how far each side steps in.',
      solution: `Each of the four slanted faces is a trapezoid with parallel sides ${a} and ${b}. Its height, the slant height, is the hypotenuse of a right triangle with legs ${h} (the frustum’s height) and (${a} − ${b})/2 = ${e} (how far each side steps in), so it is √(${h}² + ${e}²) = ${sl}. The four trapezoids have area 4·½·(${a} + ${b})·${sl} = ${lat}, and with the two squares, ${a * a} and ${b * b}, the total is <b>${num(S)}</b>.`,
      check: () => {
        // the corners in space, and each slanted face as two triangles
        const lo = [[0, 0, 0], [a, 0, 0], [a, a, 0], [0, a, 0]], hi = [[e, e, h], [a - e, e, h], [a - e, a - e, h], [e, a - e, h]];
        const tri = (p, q, r) => { const u = q.map((v, i) => v - p[i]), v = r.map((w2, i) => w2 - p[i]); return Math.hypot(u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]) / 2; };
        let area = a * a + b * b;
        for (let i = 0; i < 4; i++) { const j = (i + 1) % 4; area += tri(lo[i], lo[j], hi[j]) + tri(lo[i], hi[j], hi[i]); }
        return near(area, S, 'surface');
      },
    };
  },
  // a closed cone of water turned over: how deep the water is afterwards
  (d, ctx) => {
    const [[p, q], u, ask] = pick(ctx, 'turn', [TURNS, [1, 2, 3], ['down', 'up']], ([, q], u) => q * u <= 15);
    const H = q * u, air = cbrt(u, q ** 3 - p ** 3), sq = surd(u, q * q - p * p);
    const w = 400, h = 250, T = frame([-1.3, 3.3], [-0.2, 2.1], w, h, 14), rb = 0.85, hc = 2;
    const vDown = (y) => simpson((t) => t * t, 0, y, 200), vUp = (y) => simpson((t) => (H - t) ** 2, 0, y, 200);   // water in a cone of height H, point down or point up, y deep
    if (ask === 'down') {
      const correct = [H - air[0], `${H} − ${air[1]}`], hd = p * u;
      return {
        topic: 'Cutting a cone', rank: 20,
        text: `A closed container shaped like a cone is ${H} cm tall. It stands point down, holding water ${hd} cm deep. Then it is turned over to stand on its flat base. How deep is the water now, in centimetres?`,
        figure: svg(w, h, 'A closed cone of water standing point down, and the same cone turned over', [cone(T, 0, rb, hc, false, (hc * p) / q), cone(T, 2.1, rb, hc, true, correct[0] * (hc / H)),
          tall(T, -1.05, 0, hc, H), tall(T, 0.95, 0, (hc * p) / q, hd, 1), tall(T, 3.05, 0, correct[0] * (hc / H), '?', 1)]),
        answer: labelled(correct, [air, [H - hd, num(H - hd, 0)], [hd, num(hd, 0)], Number.isInteger(sq[0]) ? [H - sq[0], num(H - sq[0], 0)] : [H - sq[0], `${H} − ${sq[1]}`], [(u * p ** 3) / (q * q), frac(u * p ** 3, q * q)]]),
        solution: `Point down, the water is a cone similar to the container with ${frac(p, q)} of its height, so it fills (${frac(p, q)})³ = ${frac(p ** 3, q ** 3)} of the container. Turned over, the air at the top is a cone similar to the container filling the other ${frac(q ** 3 - p ** 3, q ** 3)}, so its height is ${H}·∛(${frac(q ** 3 - p ** 3, q ** 3)}) = ${H}·∛${q ** 3 - p ** 3}/${q} = ${air[1]}. The water fills the rest of the height: <b>${correct[1]}</b>.`,
        check: () => { const v = vDown(hd); return near(solve((y) => vUp(y) - v, 0, H), correct[0], 'depth', 1e-6); },
      };
    }
    const dd = (q - p) * u;
    return {
      topic: 'Cutting a cone', rank: 19,
      text: `A closed container shaped like a cone is ${H} cm tall. It stands on its flat base, point up, and the water in it is ${dd} cm deep. Then it is turned over to stand on its point. How deep is the water now, in centimetres?`,
      figure: svg(w, h, 'A closed cone of water standing on its base, and the same cone turned over onto its point', [cone(T, 0, rb, hc, true, (hc * dd) / H), cone(T, 2.1, rb, hc, false, air[0] * (hc / H)),
        tall(T, -1.05, 0, hc, H), tall(T, 0.95, 0, (hc * dd) / H, dd, 1), tall(T, 3.05, 0, air[0] * (hc / H), '?', 1)]),
      answer: labelled(air, [[dd, num(dd, 0)], [H - dd, num(H - dd, 0)], [H - air[0], `${H} − ${air[1]}`], Number.isInteger(sq[0]) ? [sq[0], num(sq[0], 0)] : sq, [(u * (q ** 3 - p ** 3)) / (q * q), frac(u * (q ** 3 - p ** 3), q * q)]]),
      solution: `Point up, the air above the water is a cone similar to the container, ${H} − ${dd} = ${p * u} tall, which is ${frac(p, q)} of the height, so it fills (${frac(p, q)})³ = ${frac(p ** 3, q ** 3)} of the container, and the water fills the other ${frac(q ** 3 - p ** 3, q ** 3)}. Turned over, the water is a cone similar to the container, point down. So its depth is ${H}·∛(${frac(q ** 3 - p ** 3, q ** 3)}) = ${H}·∛${q ** 3 - p ** 3}/${q} = <b>${air[1]}</b>.`,
      check: () => { const v = vUp(dd); return near(solve((y) => vDown(y) - v, 0, H), air[0], 'depth', 1e-6); },
    };
  },
];

// ---------- reflections and shortest paths ----------
const NAMES = ['Priya', 'Mateo', 'Ines', 'Kofi', 'Yara', 'Bram', 'Selin', 'Tomas', 'Hana', 'Ivo'];
// [d, a, b]: bank points d apart, the tent a and the campfire b from the river, with d and a + b two legs of a
// right triangle with a whole hypotenuse
const RIVERS = [[12, 2, 3], [12, 1, 4], [8, 2, 4], [8, 1, 5], [6, 3, 5], [15, 3, 5], [15, 2, 6], [24, 3, 4], [12, 4, 5], [12, 2, 7], [9, 4, 8], [16, 5, 7], [16, 3, 9], [12, 6, 10], [20, 6, 9], [5, 4, 8], [21, 8, 12]];
// [ax, ay, bx, by]: the farmhouse and the barn east of the road and north of the river, with ax·by > ay·bx so that the
// straight line between the mirror images really crosses the river and then the road
const CROSSINGS = [[8, 2, 4, 7], [6, 3, 3, 9], [10, 4, 6, 8], [9, 5, 3, 11], [5, 2, 3, 4], [4, 3, 2, 5], [9, 2, 6, 6], [6, 5, 2, 10], [14, 2, 10, 5], [12, 5, 8, 10], [7, 1, 5, 4], [3, 4, 2, 8]];
const TABLES = [[6, 4], [8, 6], [9, 6], [10, 4], [10, 6], [12, 8], [12, 9], [9, 4], [8, 3], [7, 5], [5, 3], [10, 8], [12, 10], [15, 6], [14, 8], [7, 3], [11, 4], [9, 5], [16, 6], [15, 9], [14, 10]];
const plusRoot = (a, n) => { const s = surd(1, n); return Number.isInteger(s[0]) ? [a + s[0], num(a + s[0], 0)] : [a + s[0], `${a} + ${s[1]}`]; };
const rootOf = (n) => [Math.sqrt(n), root(n)];
// √m + √n, simplified, with a whole number first: 10 + 2√29
const rootSum = (m, n) => { const [a, b] = [surd(1, m), surd(1, n)].sort((x, y) => Number.isInteger(y[0]) - Number.isInteger(x[0])); return Number.isInteger(a[0]) && Number.isInteger(b[0]) ? [a[0] + b[0], num(a[0] + b[0], 0)] : [a[0] + b[0], `${a[1]} + ${b[1]}`]; };
// the shortest route over the outside of a box [0, X]×[0, Y]×[0, Z] from p to q, by brute force over the unfoldings:
// every chain of faces from one with p on it to one with q on it (no face twice) is laid flat, a face at a time,
// turned about the edge it shares with the one before; the straight segment counts if it crosses each shared edge in
// turn, and the shortest such segment is the route
function boxRoute(dims, p, q) {
  const faces = [];
  for (let k = 0; k < 3; k++) for (const v of [0, dims[k]]) faces.push([k, v]);
  const on = ([k, v], pt) => Math.abs(pt[k] - v) < 1e-9, middle = ([k, v]) => dims.map((s, i) => (i === k ? v : s / 2));
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], cross = (a, b) => a[0] * b[1] - a[1] * b[0];
  let best = Infinity;
  for (const f of faces) if (on(f, p) && on(f, q)) best = Math.min(best, dist(p, q));
  const grow = (chain, map, p2, edges) => {
    const f = chain.at(-1);
    if (chain.length > 1 && on(f, q)) {
      const dd = sub(map(q), p2);
      let last = -1e-9, ok = true;
      for (const [e0, e1] of edges) {
        const r = sub(e1, e0), den = cross(dd, r), wv = sub(e0, p2);
        if (Math.abs(den) < 1e-12) { ok = false; break; }
        const t = cross(wv, r) / den, s = cross(wv, dd) / den;
        if (t < last - 1e-9 || t > 1 + 1e-9 || s < -1e-9 || s > 1 + 1e-9) { ok = false; break; }
        last = t;
      }
      if (ok) best = Math.min(best, Math.hypot(...dd));
    }
    if (chain.length === 6) return;
    for (const g of faces) {
      if (g[0] === f[0] || chain.includes(g)) continue;
      const m = 3 - f[0] - g[0], E0 = [0, 0, 0], E1 = [0, 0, 0];
      E0[f[0]] = E1[f[0]] = f[1]; E0[g[0]] = E1[g[0]] = g[1]; E1[m] = dims[m];
      const e0 = map(E0), e1 = map(E1), u = [(e1[0] - e0[0]) / dims[m], (e1[1] - e0[1]) / dims[m]], c2 = map(middle(f));
      const n = (-u[1] * (c2[0] - e0[0]) + u[0] * (c2[1] - e0[1]) > 0) ? [u[1], -u[0]] : [-u[1], u[0]];   // pointing away from the face before
      const mapG = (X) => { const al = X[m], b = Math.abs(X[f[0]] - f[1]); return [e0[0] + al * u[0] + b * n[0], e0[1] + al * u[1] + b * n[1]]; };
      grow([...chain, g], mapG, p2, [...edges, [e0, e1]]);
    }
  };
  for (const f of faces) {
    if (!on(f, p)) continue;
    const [i, j] = [0, 1, 2].filter((x) => x !== f[0]), map = (X) => [X[i], X[j]];
    grow([f], map, map(p), []);
  }
  return best;
}
const boxSides = (at, a, b, c) => [label([mid(at[0], at[1])[0], at[0][1] + 20], a, 'ang'), label(mid(at[1], at[2]).map((v, i) => v + [12, 10][i]), b, 'ang'), label([at[2][0] + 14, mid(at[2], at[6])[1]], c, 'ang')];
const CORNER_BOXES = [[3, 5, 6], [4, 8, 9], [5, 7, 9], [6, 10, 12], [7, 9, 12], [5, 11, 12], [8, 12, 15], [9, 11, 15], [7, 13, 15], [4, 5, 12], [2, 7, 12], [6, 14, 15]];
const CENTRE_BOXES = [[6, 4, 2], [12, 8, 4], [10, 6, 9], [8, 10, 8], [12, 10, 3], [18, 12, 6], [16, 12, 9], [14, 16, 8], [6, 10, 9], [18, 8, 8], [10, 8, 8], [16, 10, 10], [24, 10, 4], [4, 6, 2]];
// rooms where the route over the ceiling, a side wall and the floor beats every other, and is a whole number of feet
const ROOMS = [[26, 10, 11], [28, 8, 8], [33, 6, 6], [34, 6, 9], [34, 8, 7], [34, 12, 15], [34, 14, 13], [38, 4, 5], [38, 12, 18], [38, 14, 16], [38, 16, 14], [40, 20, 20]];

const reflections = [
  // a walk that touches a river (or a river and then a road) on the way: reflect the end in the line
  (d, ctx) => {
    const [[ask, ...v]] = pick(ctx, 'river', [[...RIVERS.flatMap((r) => [['length', ...r], ['where', ...r]]), ...CROSSINGS.map((c) => ['two', ...c])]]);
    const N = d.pick(NAMES);
    if (ask === 'two') {
      const [ax, ay, bx, by] = v, L = Math.hypot(ax + bx, ay + by), T = frame([-0.15 * (ax + bx), 1.1 * Math.max(ax, bx)], [-0.15 * (ay + by), 1.1 * Math.max(ay, by)], 360, 270, 22);
      const Hs = T([ax, ay]), Bs = T([bx, by]), O = T([0, 0]);
      return {
        topic: 'Reflections and shortest paths', rank: 18,
        text: `A straight river runs east–west, and a straight road runs north–south, crossing it at right angles. ${N}’s house H is ${ax} m east of the road and ${ay} m north of the river, and the barn B is ${bx} m east of the road and ${by} m north of the river. ${N} walks from the house to the river, then to the road, then to the barn. What is the shortest possible length of the walk, in metres?`,
        figure: svg(360, 270, 'A river and a road crossing at right angles, with a house and a barn beside them', [seg(T([-0.15 * (ax + bx), 0]), T([1.1 * Math.max(ax, bx), 0])), seg(T([0, -0.15 * (ay + by)]), T([0, 1.1 * Math.max(ay, by)])),
          dot(Hs), dot(Bs), label([Hs[0] + 11, Hs[1] - 8], 'H'), label([Bs[0] + 11, Bs[1] - 8], 'B'), label([T([1.1 * Math.max(ax, bx), 0])[0] - 4, O[1] + 16], 'river', 'ang', 'end'), label([O[0] - 8, T([0, 1.1 * Math.max(ay, by)])[1] + 4], 'road', 'ang', 'end')]),
        answer: labelled([L, num(L, 0)], [rootOf((ax - bx) ** 2 + (ay - by) ** 2), rootOf((ax - bx) ** 2 + (ay + by) ** 2), rootOf((ax + bx) ** 2 + (ay - by) ** 2), rootSum(ax * ax + ay * ay, bx * bx + by * by), [ax + ay + bx + by, num(ax + ay + bx + by, 0)]]),
        solution: `Reflect the house in the river (its image is ${ay} m south of the river) and the barn in the road (its image is ${bx} m west of the road). Each leg that touches the river or the road can be swapped for an equally long leg to a mirror image, so the walk is as long as a path from one image to the other, and the shortest such path is the straight segment between them, which does cross the river and then the road. The images are ${ax} + ${bx} = ${ax + bx} m apart east to west and ${ay} + ${by} = ${ay + by} m apart north to south, so the walk is √(${ax + bx}² + ${ay + by}²) = <b>${num(L, 0)}</b>.`,
        check: () => {
          // the best point on the road for each point on the river, then the best point on the river (both convex)
          const tern = (f, lo, hi) => { for (let i = 0; i < 100; i++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (f(m1) < f(m2)) hi = m2; else lo = m1; } return f((lo + hi) / 2); };
          const walk = (x, y) => Math.hypot(ax - x, ay) + Math.hypot(x, y) + Math.hypot(bx, by - y);
          return near(tern((x) => tern((y) => walk(x, y), -100, 100), -100, 100), L, 'shortest walk', 1e-6);
        },
      };
    }
    const [dd, a, b] = v, L = Math.hypot(dd, a + b), T = frame([-0.12 * dd, 1.12 * dd], [-0.45 * Math.max(a, b), 1.15 * Math.max(a, b)], 380, 250, 18);
    const Ts = T([0, a]), Cs = T([dd, b]), F1 = T([0, 0]), F2 = T([dd, 0]);
    const tent = `${N}’s tent T is ${a} m from a straight river, and the campfire C is ${b} m from it, on the same side; the points of the bank nearest to them are ${dd} m apart.`;
    const figure = svg(380, 250, 'A tent and a campfire beside a straight river', [seg(T([-0.12 * dd, 0]), T([1.12 * dd, 0])), seg(Ts, F1, 'side dash'), seg(Cs, F2, 'side dash'), dot(Ts), dot(Cs),
      label([Ts[0] - 12, Ts[1] - 6], 'T'), label([Cs[0] + 12, Cs[1] - 6], 'C'), label([F1[0] - 9, mid(Ts, F1)[1]], a, 'ang', 'end'), label([F2[0] + 9, mid(Cs, F2)[1]], b, 'ang', 'start'),
      dim(F1, F2, dd, -16), label([T([1.12 * dd, 0])[0] - 2, F1[1] + 40], 'river', 'ang', 'end')]);
    const along = (x) => Math.hypot(x, a) + Math.hypot(dd - x, b);
    const tern = () => { let lo = 0, hi = dd; for (let i = 0; i < 200; i++) { const m1 = lo + (hi - lo) / 3, m2 = hi - (hi - lo) / 3; if (along(m1) < along(m2)) hi = m2; else lo = m1; } return (lo + hi) / 2; };
    if (ask === 'length') return {
      topic: 'Reflections and shortest paths', rank: 15,
      text: `${tent} ${N} walks from the tent to the river to fill a bucket, and then to the campfire. What is the shortest possible length of the walk, in metres?`,
      figure,
      answer: labelled([L, num(L, 0)], [[a + b + dd, num(a + b + dd, 0)], rootOf(dd * dd + (a - b) ** 2), plusRoot(a, dd * dd + b * b), plusRoot(b, dd * dd + a * a), [L + 1, num(L + 1, 0)]]),
      solution: `If the campfire is reflected in the bank, its mirror image is ${b} m from the river on the other side, and any path from the bank to the campfire is exactly as long as the same path to the image. So the walk is shortest when the tent, the bucket point and the image lie on one straight line. The tent and the image are ${dd} m apart along the bank and ${a} + ${b} = ${a + b} m apart across it, so the shortest walk is √(${dd}² + ${a + b}²) = <b>${num(L, 0)}</b>.`,
      check: () => near(along(tern()), L, 'shortest walk', 1e-9),
    };
    const ans = lowest(dd * a, a + b);
    return {
      topic: 'Reflections and shortest paths', rank: 16,
      text: `${tent} ${N} walks from the tent to the river to fill a bucket, and then to the campfire, by the shortest possible route. How far from the bank point nearest the tent does ${N} fill the bucket, in metres?`,
      figure,
      answer: choices(d, ans, [lowest(dd, 2), lowest(dd * b, a + b), lowest(dd * a, b), lowest(dd * a, 2 * b)], showFrac),
      solution: `Reflect the campfire in the bank; the best walk heads straight from the tent toward the campfire’s mirror image and fills the bucket where that line crosses the bank. The tent, its nearest bank point and the bucket point make a right triangle similar to the one made by the image, its bank point and the bucket point, and their legs across the river are ${a} and ${b}. So the bucket point splits the ${dd} m between the two bank points in the ratio ${a} : ${b}, which puts it ${frac(a, a + b)} of the way from the tent’s bank point: ${dd}·${frac(a, a + b)} = <b>${fr(ans)}</b>.`,
      check: () => near(tern(), ans[0] / ans[1], 'bucket point', 1e-6),
    };
  },
  // a ball shot at 45° from a corner of a table: unfold the table, and the path is straight
  (d, ctx) => {
    const [[m, n], ask] = pick(ctx, 'table', [TABLES, ['corner', 'length']]);
    const l = (m * n) / gcd(m, n), bounces = l / m + l / n - 2, across = l / m, up = l / n;
    const cornerAt = (x, y) => (x ? (y ? 'C' : 'B') : y ? 'D' : 'A'), end = cornerAt(across % 2, up % 2);
    const T = frame([0, m], [0, n], 380, 260, 30), at = [[0, 0], [m, 0], [m, n], [0, n]].map(T), ctr = T([m / 2, n / 2]), first = Math.min(m, n);
    const figure = svg(380, 260, 'A rectangular table ABCD with a ball shot from A at 45°', [poly(at), seg(at[0], T([first, first]), 'seg'), dot(at[0]),
      ...'ABCD'.split('').map((s, i) => label(away(at[i], ctr, 15), s)), label([mid(at[0], at[1])[0], at[0][1] + 21], m, 'ang'), label([at[1][0] + 16, mid(at[1], at[2])[1]], n, 'ang', 'start')]);
    const roll = () => {
      // the ball one unit step at a time: x and y both change by 1, and a side turns that direction round
      let x = 0, y = 0, vx = 1, vy = 1, hits = 0, steps = 0;
      for (; steps < 10000; ) {
        x += vx; y += vy; steps++;
        const sideX = x === 0 || x === m, sideY = y === 0 || y === n;
        if (sideX && sideY) break;
        if (sideX) { vx = -vx; hits++; }
        if (sideY) { vy = -vy; hits++; }
      }
      return { hits, steps, corner: cornerAt(x === m ? 1 : 0, y === n ? 1 : 0) };
    };
    const intro = `A rectangular pool table ABCD has AB = ${m} and BC = ${n}, with pockets only at its four corners. A ball is shot from corner A at 45° to the sides; each time it hits a side it bounces off at the same angle, and it rolls until it drops into a corner pocket.`;
    const why = `Instead of bouncing the ball, reflect the table, so that copies of the table tile the plane and the ball rolls on through them in a straight line at 45°, going as far across as up. It first reaches a corner of a copy when it has gone a common multiple of ${m} and ${n} both ways, and the first is lcm(${m}, ${n}) = ${l}.`;
    if (ask === 'length') {
      const correct = surd(l, 2);
      return {
        topic: 'Reflections and shortest paths', rank: 18,
        text: `${intro} How far does the ball roll?`,
        figure,
        answer: labelled(correct, [surd(m * n, 2), [l, num(l, 0)], surd(m + n, 2), surd(2 * l, 2), surd(l, 1).map((x, i) => (i ? `${num(2 * l, 0)}` : 2 * l))]),
        solution: `${why} Going ${l} across and ${l} up, it rolls the diagonal of ${an(l)} ${l}-by-${l} square: ${l}·√2 = <b>${correct[1]}</b>.`,
        check: () => { const r = roll(); return near(r.steps * Math.SQRT2, correct[0], 'distance rolled'); },
      };
    }
    const say = (b, c) => [b * 10 + 'ABCD'.indexOf(c), `${b} bounce${b === 1 ? '' : 's'}, into ${c}`];
    const others = ['B', 'C', 'D'].filter((c) => c !== end), noGcd = cornerAt(n % 2, m % 2);
    const sideX = across % 2 ? 'an odd number, so it ends on side BC' : 'an even number, so it ends back on side AD';
    const sideY = up % 2 ? 'an odd number, so it ends on side CD' : 'an even number, so it ends back on side AB';
    return {
      topic: 'Reflections and shortest paths', rank: 19,
      text: `${intro} How many times does it bounce, and into which corner does it drop?`,
      figure,
      answer: labelled(say(bounces, end), [say(bounces, others[0]), say(bounces, others[1]), say(bounces + 1, end), say(m + n - 2, noGcd), say(bounces + 2, end), say(Math.max(bounces - 1, 0), end)]),
      solution: `${why} That is ${l} ÷ ${m} = ${across} table lengths across and ${l} ÷ ${n} = ${up} table widths up. On the way it crosses ${across} − 1 = ${across - 1} lines between copies going across and ${up} − 1 = ${up - 1} going up, one bounce each, so it bounces ${bounces} times. It has gone ${across} table lengths across, ${sideX}, and ${up} table widths up, ${sideY}. So the answer is <b>${say(bounces, end)[1]}</b>.`,
      check: () => { const r = roll(); return r.hits === bounces && r.corner === end ? '' : `rolled: ${r.hits} bounces into ${r.corner}, said ${bounces} into ${end}`; },
    };
  },
  // a light ray between two mirrors: reflect the mirrors instead, and the ray goes straight
  (d, ctx) => {
    const [[ask, th, ph]] = pick(ctx, 'mirrors', [[...[7, 8, 9, 10, 11, 12, 14, 15, 16, 18, 20].flatMap((t) => [30, 40, 45, 50, 60, 70, 80, 90].filter((p) => (180 - p) % t !== 0).map((p) => ['start', t, p])),
      ...[7, 8, 9, 11, 12, 13, 14, 15, 16, 18, 22, 25].map((t) => ['parallel', t, 0])]]);
    const turn = 180 - ph, count = Math.ceil(turn / th) - 1, rad = (x) => (x * Math.PI) / 180;
    // follow the ray: from where it is, the nearest mirror ahead (a ray from O at 0° or at th°), reflect, and repeat
    const follow = () => {
      let pos = ask === 'start' ? [1, 0] : [100, 1], dir = ask === 'start' ? [Math.cos(rad(turn)), Math.sin(rad(turn))] : [-1, 0], hits = 0, skip = ask === 'start' ? 0 : -1;
      for (; hits < 1000; ) {
        let best = null;
        for (const k of [0, 1]) {
          if (k === skip) continue;
          const m = [Math.cos(rad(k * th)), Math.sin(rad(k * th))], den = dir[0] * m[1] - dir[1] * m[0];
          if (Math.abs(den) < 1e-12) continue;
          const t = (pos[1] * m[0] - pos[0] * m[1]) / den, s = (pos[0] + t * dir[0]) * m[0] + (pos[1] + t * dir[1]) * m[1];
          if (t > 1e-9 && t < 1e7 && s > 0 && (!best || t < best.t)) best = { t, k, m };
        }
        if (!best) return hits;
        pos = [pos[0] + best.t * dir[0], pos[1] + best.t * dir[1]];
        const dot2 = dir[0] * best.m[0] + dir[1] * best.m[1];
        dir = [2 * dot2 * best.m[0] - dir[0], 2 * dot2 * best.m[1] - dir[1]];
        skip = best.k; hits++;
      }
      return hits;
    };
    const Lm = 10, T = frame([-0.6, Lm * 1.02], [-0.8, Lm * Math.sin(rad(th)) * 1.02 + 0.9], 400, 250, 16), O = T([0, 0]), M2 = T([Lm * Math.cos(rad(th)), Lm * Math.sin(rad(th))]);
    const parts = [seg(O, T([Lm, 0])), seg(O, M2), line(arcPts([0, 0], 1.6, 0, th, 12).map(T), 'arc'), label([O[0] + 1.6 * T.s + 6, O[1] - 1.6 * T.s * Math.sin(rad(th + 8)) - 12], `${th}°`, 'ang', 'start'), label([O[0] - 10, O[1] + 4], 'O')];
    if (ask === 'start') {
      const P = [0.75 * Lm, 0], s2 = (0.75 * Lm * Math.sin(rad(ph))) / Math.sin(rad(th + ph)), X = [s2 * Math.cos(rad(th)), s2 * Math.sin(rad(th))];
      parts.push(seg(T(P), T(X), 'seg'), dot(T(P)), label(T(P).map((v, i) => v + [6, 16][i]), 'P'), line(arcPts(P, 0.9, turn, 180, 12).map(T), 'arc'), label(T(arcPts(P, 0.9, (turn + 180) / 2, 0, 1)[0]).map((v, i) => v + [-14, -10][i]), `${ph}°`, 'ang'));
    } else {
      const hy = 0.45 * Lm * Math.sin(rad(th)), X = [hy / Math.tan(rad(th)), hy];
      parts.push(seg(T([0.9 * Lm, hy]), T(X), 'seg'), label(T([0.9 * Lm, hy]).map((v, i) => v + [6, 0][i]), 'ray', 'ang', 'start'));
    }
    const why = `Instead of reflecting the ray, reflect the mirrors, so that copies of the ${th}° angle fan out around O and the ray goes straight on through them, one reflection for each mirror line it crosses.`;
    const lastLine = `${count}·${th}° = ${count * th}°`, next = (count + 1) * th;
    return {
      topic: 'Reflections and shortest paths', rank: ask === 'start' ? 20 : 21,
      text: ask === 'start'
        ? `Two long flat mirrors stand upright on a table, meeting at O at an angle of ${th}°. A light ray starts at a point P on one mirror and travels into the angle between them, making an angle of ${ph}° with PO. Each time it meets a mirror it reflects, at the same angle it arrived. How many times does it meet a mirror before it travels away for good?`
        : `Two long flat mirrors stand upright on a table, meeting at O at an angle of ${th}°. A light ray comes in between them, travelling toward O parallel to one of the mirrors. Each time it meets a mirror it reflects, at the same angle it arrived. How many times does it meet a mirror before it travels away for good?`,
      figure: svg(400, 250, 'Two mirrors meeting at O and a light ray between them', parts),
      answer: choices(d, count, [count + 1, count - 1, Math.floor(180 / th), Math.floor((ask === 'start' ? ph : 90) / th), count + 2]),
      solution: ask === 'start'
        ? `${why} Seen from O, the ray starts on a mirror, at 0°, and as it travels off along its straight line its direction from O turns toward 180° − ${ph}° = ${turn}°, the way the ray is heading (PO points back at 180°, and the ray makes ${ph}° with it), without reaching it. So it crosses the mirror lines at ${th}°, ${2 * th}°, … up to ${lastLine}, the last one below ${turn}° (the next, ${next}°, is past it). So it meets a mirror <b>${count}</b> times.`
        : `${why} Seen from O, the ray’s direction starts at 0° (far off, beside the first mirror) and turns to 180° (far off the other way) as it goes past. So it crosses the mirror lines at ${th}°, ${2 * th}°, … up to ${lastLine}, the last one below 180° (the next, ${next}°, ${next === 180 ? 'is parallel to the ray' : 'is past 180°'}). So it meets a mirror <b>${count}</b> times.`,
      check: () => { const got = follow(); return got === count ? '' : `followed the ray: ${got} reflections, said ${count}`; },
    };
  },
  // walking over the outside of a box (or the inside of a room): unfold the faces it crosses
  (d, ctx) => {
    const [[ask, L, W, H]] = pick(ctx, 'box', [[...CORNER_BOXES.map((b) => ['corner', ...b]), ...CENTRE_BOXES.map((b) => ['centre', ...b]), ...ROOMS.map((b) => ['room', ...b])]]);
    const { P, at, ctr, edges } = boxPicture(L, W, H, 380, 280), parts = [...edges, ...boxSides(at, L, W, H)];
    if (ask === 'corner') {
      const c = [(L + W) ** 2 + H * H, (L + H) ** 2 + W * W, (W + H) ** 2 + L * L], best = Math.min(...c), ans = Math.sqrt(best);
      parts.push(dot(at[0]), dot(at[6]), label(away(at[0], ctr, 14), 'A'), label(away(at[6], ctr, 14), 'G'));
      return {
        topic: 'Reflections and shortest paths', rank: 17,
        text: `An ant is at corner A of a closed box that is ${L} long, ${W} wide and ${H} tall. It crawls over the outside of the box to G, the corner farthest from A. How long is the shortest route it can take?`,
        figure: svg(380, 280, 'A box with an ant at corner A and the far corner G', parts),
        answer: labelled([ans, num(ans, 0)], [...c.filter((x) => x !== best).map(rootOf), rootOf(L * L + W * W + H * H), [L + W + H, num(L + W + H, 0)]]),
        tip: 'Unfold the faces the route crosses into one flat net; on the net the route is a straight line, so compare the different nets.',
        solution: `The ant’s best route crosses one edge, from one face to a neighbouring one. Unfold those two faces into one flat rectangle, and the route is a straight line, the diagonal of that rectangle. There are three ways to pair the faces, giving √((${L} + ${W})² + ${H}²) = ${root(c[0])}, √((${L} + ${H})² + ${W}²) = ${root(c[1])} and √((${W} + ${H})² + ${L}²) = ${root(c[2])}. The shortest is <b>${num(ans, 0)}</b>.`,
        check: () => near(boxRoute([L, W, H], [0, 0, 0], [L, W, H]), ans, 'shortest route'),
      };
    }
    if (ask === 'centre') {
      const c1 = (L / 2) ** 2 + (H + W / 2) ** 2, c2 = (W / 2) ** 2 + (H + L / 2) ** 2, best = Math.min(c1, c2), ans = Math.sqrt(best), M = P([L / 2, W / 2, H]);
      parts.push(dot(at[0]), dot(M), label(away(at[0], ctr, 14), 'A'), label([M[0], M[1] - 12], 'M'));
      return {
        topic: 'Reflections and shortest paths', rank: 19,
        text: `An ant is at corner A of a closed box that is ${L} long, ${W} wide and ${H} tall. It crawls over the outside of the box to M, the centre of the top face. How long is the shortest route it can take?`,
        figure: svg(380, 280, 'A box with an ant at corner A and the centre M of the top face', parts),
        answer: labelled([ans, num(ans, 0)], [rootOf(Math.max(c1, c2)), rootOf((L / 2) ** 2 + (W / 2) ** 2 + H * H), plusRoot(H, (L / 2) ** 2 + (W / 2) ** 2), [H + L / 2 + W / 2, num(H + L / 2 + W / 2, 0)]]),
        tip: 'Unfold the faces the route crosses into one flat net; on the net the route is a straight line, so compare the different nets.',
        solution: `The ant has to cross a side face and then the top. Unfold the top face so that it lies flat beside a side face; then the best route is a straight line. Across the ${L}-by-${H} face, M ends up ${L / 2} along and ${H} + ${W / 2} = ${H + W / 2} up, giving √(${L / 2}² + ${H + W / 2}²) = ${root(c1)}; across the ${W}-by-${H} face, M is ${W / 2} along and ${H} + ${L / 2} = ${H + L / 2} up, giving √(${W / 2}² + ${H + L / 2}²) = ${root(c2)}. The shorter is <b>${num(ans, 0)}</b>.`,
        check: () => near(boxRoute([L, W, H], [0, 0, 0], [L / 2, W / 2, H]), ans, 'shortest route'),
      };
    }
    const ans = Math.hypot(L + 2, W + H), side = (L + W) ** 2 + (H - 2) ** 2, cs = (L + W / 2 + 1) ** 2 + (H + W / 2 - 1) ** 2, S = P([0, W / 2, H - 1]), F = P([L, W / 2, 1]);
    // the middle line of each end wall (the far one hidden), and S and F named outside the box with a pointer
    const Sl = [at[0][0] - 22, S[1] - 16], Fl = [at[2][0] + 22, F[1] - 14];
    parts.push(seg(P([0, W / 2, 0]), P([0, W / 2, H]), 'arc dash'), seg(P([L, W / 2, 0]), P([L, W / 2, H]), 'arc'), dot(S), dot(F), seg(S, [Sl[0] + 6, Sl[1] + 3], 'arc'), seg(F, [Fl[0] - 6, Fl[1] + 2], 'arc'), label(Sl, 'S'), label(Fl, 'F'));
    return {
      topic: 'Reflections and shortest paths', rank: 22,
      text: `A room shaped like a box is ${L} feet long, ${W} feet wide and ${H} feet high. A spider S is on one end wall, halfway across it and 1 foot below the ceiling. A fly F is on the opposite end wall, halfway across it and 1 foot above the floor. Crawling only over the walls, the floor and the ceiling, how long is the spider’s shortest route to the fly, in feet?`,
      figure: svg(380, 280, 'A box-shaped room with a spider on one end wall and a fly on the other', parts),
      answer: labelled([ans, num(ans, 0)], [[L + H, num(L + H, 0)], rootOf(side), rootOf(cs), rootOf(L * L + (H - 2) ** 2)]),
      tip: 'Unfold the faces the route crosses into one flat net; on the net the route is a straight line, so compare the different nets.',
      solution: `Unfold the room flat in different ways; on each unfolding the best route is a straight line, and the shortest of them is the answer. The spider and the fly are each ${W}/2 = ${W / 2} feet from the side walls. Straight over the ceiling it is 1 + ${L} + ${H - 1} = ${L + H} (the floor is the same), across one side wall it is √((${W / 2} + ${L} + ${W / 2})² + (${H} − 2)²) = √(${L + W}² + ${H - 2}²) ≈ ${num(Math.sqrt(side), 1)}, and across the ceiling and then a side wall it is √((1 + ${L} + ${W / 2})² + (${W / 2} + ${H} − 1)²) = √(${L + W / 2 + 1}² + ${H + W / 2 - 1}²) ≈ ${num(Math.sqrt(cs), 1)}. Better still is the strip that crosses the ceiling, a side wall and the floor, which is 1 + ${L} + 1 = ${L + 2} long and ${W / 2} + ${H} + ${W / 2} = ${W + H} across, so that route is √(${L + 2}² + ${W + H}²) = <b>${num(ans, 0)}</b>.`,
      check: () => near(boxRoute([L, W, H], [0, W / 2, H - 1], [L, W / 2, 1]), ans, 'shortest route'),
    };
  },
];

// ---------- the topics ----------
export const hardShapes = {
  'Tangent circles on a line': tangentCircles,
  'Semicircles in a square': semicircles,
  'Cutting a cone': cones,
  'Reflections and shortest paths': reflections,
};
