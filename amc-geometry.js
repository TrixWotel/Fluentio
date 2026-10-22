// Geometry for the AMC 10 practice: 12 problems built on ideas from past contests (a perpendicular to a diagonal,
// extended sides, solids around a segment, boxes, circles inside circles, inscribed squares…), with new numbers and
// wording, most with a figure drawn to scale from the variant's own numbers. The first 8 come round twice in the
// family's 20 turns, so they walk through their own combinations.
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

// ---------- checking ----------
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

export const geometry = [
  // 1. the foot of a perpendicular to a rectangle's diagonal
  (d, ctx) => {
    const [[a, b]] = combo(ctx, [[[2, 3], [3, 2], [3, 5], [5, 3], [4, 5], [5, 4], [5, 6], [6, 5], [4, 7], [7, 4], [5, 7], [7, 5], [1, 2], [2, 1], [2, 5], [5, 2]]]);
    const [W, X, Y, Z, F] = d.pick(['WXYZF', 'KLMNT', 'PQRSH']).split(''), c2 = a * a + b * b, ans = [a ** 3 * b, 2 * c2];
    const w = 360, h = 250, T = frame([0, a], [0, b], w, h, 36);
    const [pW, pX, pY, pZ] = [[0, 0], [a, 0], [a, b], [0, b]].map(T), pF = T([a ** 3 / c2, (a * a * b) / c2]), ctr = T([a / 2, b / 2]);
    return {
      topic: 'Perpendicular to a diagonal', rank: 15,
      text: `In rectangle ${W}${X}${Y}${Z}, side ${W}${X} is ${a} long and side ${X}${Y} is ${b} long. A perpendicular dropped from ${X} meets the diagonal ${W}${Y} at ${F}. What is the area of triangle ${W}${F}${Z}?`,
      figure: svg(w, h, `Rectangle ${W}${X}${Y}${Z} with the perpendicular from ${X} to ${W}${Y}`, [
        poly([pW, pF, pZ]), poly([pW, pX, pY, pZ]), seg(pW, pY), seg(pX, pF, 'seg'), corner(pF, pX, pY),
        ...[[pW, W], [pX, X], [pY, Y], [pZ, Z]].map(([p, s]) => label(away(p, ctr, 17), s)), label(away(pF, pX, 16), F),
        label([mid(pW, pX)[0], pW[1] + 20], a, 'ang'), label([pX[0] + 16, mid(pX, pY)[1]], b, 'ang')]),
      answer: choices(d, ans, [[a * b ** 3, 2 * c2], [a * b, 4], [a ** 3 * b, c2], [a * a * b * b, 2 * c2], [a * b, 2]], showFrac),
      solution: `Put ${W} at (0, 0), ${X} at (${a}, 0), ${Y} at (${a}, ${b}) and ${Z} at (0, ${b}). Right triangles ${W}${F}${X} and ${W}${X}${Y} share the angle at ${W}, so ${W}${F} = ${W}${X}²/${W}${Y} = ${a * a}/${root(c2)}, and ${F} is ${W}${F}·${a}/${root(c2)} = ${frac(a ** 3, c2)} to the right of ${W}${Z}. Triangle ${W}${F}${Z} has base ${W}${Z} = ${b} and that much height, so its area is ½·${b}·${frac(a ** 3, c2)} = <b>${frac(...ans)}</b>.`,
      check: () => near(shoelace([[0, 0], meet([[0, 0], [a, b]], [[a, 0], [a - b, a]]), [0, b]]), ans[0] / ans[1], 'area'),
    };
  },
  // 2. extend each side of a triangle by a multiple of itself
  (d, ctx) => {
    const [[p, q]] = combo(ctx, [[[2, 1], [1, 1], [1, 2], [3, 2], [1, 3], [2, 3]]]);
    const times = { '2/1': 'twice as long as', '1/1': 'as long as', '1/2': 'half as long as', '3/2': '1½ times as long as', '1/3': 'a third as long as', '2/3': 'two thirds as long as' }[`${p}/${q}`];
    const t = d.int(2, 6), T0 = q * q * t, cornerA = t * p * (p + q), ans = T0 + 3 * cornerA;
    const mT = q === 1 ? num(p, 0) : frac(p, q), m = p / q;
    const ext = (A, B) => [B[0] + m * (B[0] - A[0]), B[1] + m * (B[1] - A[1])];
    const P0 = [0, 0], Q0 = [4, 0], R0 = [1.4, 2.8], all = [P0, Q0, R0, ext(R0, P0), ext(P0, Q0), ext(Q0, R0)];
    const w = 380, h = 290, Tf = fit(all, w, h, 30), [a0, b0, c0, a1, b1, c1] = all.map(Tf), g0 = centre([a0, b0, c0]), g1 = centre([a1, b1, c1]);
    return {
      topic: 'Extending the sides', rank: 19,
      text: `Triangle PQR has area ${T0}. Each side is extended past one end: PQ past Q to Q′, QR past R to R′, and RP past P to P′, each extension ${times} the side it extends. What is the area of triangle P′Q′R′?`,
      figure: svg(w, h, 'Triangle PQR with its sides extended to P′, Q′ and R′', [
        poly([a0, b0, c0]), poly([a1, b1, c1]), seg(b0, b1, 'side dash'), seg(c0, c1, 'side dash'), seg(a0, a1, 'side dash'),
        ...[[a0, 'P'], [b0, 'Q'], [c0, 'R']].map(([pt, s]) => label(away(pt, g0, 13), s)),
        ...[[a1, 'P′'], [b1, 'Q′'], [c1, 'R′']].map(([pt, s]) => label(away(pt, g1, 15), s))]),
      answer: choices(d, ans, [t * (p + q) ** 2, t * (2 * p + q) ** 2, 3 * cornerA, t * (q * q + 3 * p * p), t * (q * q + 2 * p * (p + q))]),
      solution: `Look at triangle QQ′R′. At Q its sides are QQ′ = ${p === q ? '' : mT + '·'}PQ and QR′ = ${frac(p + q, q)}·QR, and the angle between them is the supplement of angle Q, which has the same sine. So its area is ${p === q ? '' : `${mT}·${frac(p + q, q)} = `}${frac(p * (p + q), q * q)} times the area of PQR, that is ${num(cornerA)}. The corner triangles at R and P are the same size, so P′Q′R′ has area ${T0} + 3·${num(cornerA)} = <b>${num(ans)}</b>.`,
      check: () => {
        const s = Math.sqrt(T0 / shoelace([P0, Q0, R0])), [P, Q, R] = [P0, Q0, R0].map(([x, y]) => [x * s, y * s]);
        return near(shoelace([ext(R, P), ext(P, Q), ext(Q, R)]), ans, 'area');
      },
    };
  },
  // 3. everything within r of a segment: a cylinder with a half ball on each end
  (d, ctx) => {
    const [r, L] = combo(ctx, [[2, 4, 5, 6], [5, 6, 7, 8, 9, 10, 11, 12, 14, 15]]);
    const [vp, vq] = lowest(3 * r * r * L + 4 * r ** 3, 3), V = `${vq === 1 ? num(vp, 0) : frac(vp, vq)}π`;
    const [X, Y] = d.pick([['X', 'Y'], ['M', 'N'], ['U', 'V']]);
    const w = 480, h = 170, T = frame([-r, L + r], [-r, r], w, h, 26), R = r * T.s, [x0, y0] = T([0, 0]), [x1] = T([L, 0]);
    const rim = [x1 + R * Math.cos(Math.PI / 4), y0 - R * Math.sin(Math.PI / 4)];
    return {
      topic: 'Points near a segment', rank: 11,
      text: `The points of space that are at most ${r} units from segment ${X}${Y} fill a solid with volume ${V}. How long is ${X}${Y}?`,
      figure: svg(w, h, `The solid around segment ${X}${Y}`, [
        `<path class="side" d="M${r2(x0)} ${r2(y0 - R)} L${r2(x1)} ${r2(y0 - R)} A${r2(R)} ${r2(R)} 0 0 1 ${r2(x1)} ${r2(y0 + R)} L${r2(x0)} ${r2(y0 + R)} A${r2(R)} ${r2(R)} 0 0 1 ${r2(x0)} ${r2(y0 - R)} Z"/>`,
        seg([x0, y0], [x1, y0], 'seg'), seg([x1, y0], rim, 'arc'), ring([x0, y0], 3), ring([x1, y0], 3),
        label([x0, y0 + 17], X), label([x1, y0 + 17], Y), label(mid([x1, y0], rim).map((v, i) => v + [-8, -6][i]), r, 'ang')]),
      answer: choices(d, [L, 1], [[3 * r * r * L + 4 * r ** 3, 3 * r * r], [3 * L + 2 * r, 3], [3 * L - 4 * r, 3], [L + 2 * r, 1]], showFrac),
      solution: `The solid is a cylinder of radius ${r} around ${X}${Y}, with half a ball of radius ${r} on each end; the two halves make one whole ball. So ${V} = ${frac(4, 3)}π·${r}³ + π·${r}²·${X}${Y} = ${frac(4 * r ** 3, 3)}π + ${r * r}π·${X}${Y}, which gives ${X}${Y} = <b>${L}</b>.`,
      check: () => {
        // add up the slices across the axis: a disc of radius √(r² − e²), e being how far past an end the slice is
        const n = 20000, a = -r, b = L + r, hs = (b - a) / n, A = (x) => { const e = Math.max(0, -x, x - L); return Math.PI * Math.max(0, r * r - e * e); };
        let s = A(a) + A(b);
        for (let i = 1; i < n; i++) s += A(a + i * hs) * (i % 2 ? 4 : 2);
        return near((s * hs) / 3, (Math.PI * vp) / vq, 'volume', 1e-6);
      },
    };
  },
  // 4. the octahedron whose corners are the centres of a box's faces
  (d, ctx) => {
    const [[a, b, c]] = combo(ctx, [[[2, 3, 4], [2, 3, 5], [3, 4, 6], [2, 4, 6], [3, 5, 6], [4, 5, 6], [2, 6, 7], [3, 4, 8], [4, 6, 9], [3, 6, 7]]]);
    const abc = a * b * c, { P, at, edges } = boxPicture(a, c, b, 380, 280);
    const V = [[0, 0.5, 0.5], [1, 0.5, 0.5], [0.5, 0, 0.5], [0.5, 1, 0.5], [0.5, 0.5, 0], [0.5, 0.5, 1]].map(([x, y, z]) => [x * a, y * c, z * b]);
    const oct = [];
    for (let i = 0; i < 6; i++) for (let j = i + 1; j < 6; j++) if (j !== i + 1 || i % 2) oct.push(seg(P(V[i]), P(V[j]), 'seg'));
    return {
      topic: 'Octahedron in a box', rank: 17,
      text: `A box measures ${a} by ${b} by ${c}. The centres of its six faces are the corners of an octahedron. What is the volume of the octahedron?`,
      figure: svg(380, 280, 'A box with the octahedron joining the centres of its faces', [...edges, ...oct,
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
  // 5. a pyramid inside a box, on a slanted rectangle, with its apex on an edge
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
        ...'ABCDEGH'.split('').map((s) => label(away(at['ABCDEFGH'.indexOf(s)], ctr, 14), s)), label(away(at[5], at[6], 14), 'F'), label(away(pM, top, 15), 'M'),
        label([mid(at[0], at[1])[0], at[0][1] + 20], a, 'ang'), label(mid(at[1], at[2]).map((v, i) => v + [12, 10][i]), b, 'ang'), label([at[2][0] + 14, mid(at[2], at[6])[1]], c, 'ang')]),
      answer: choices(d, [abc, 3], [[abc, 6], [abc, 2], [2 * abc, 3], [abc, 1], [abc, 12]], showFrac),
      solution: `BCHE is a rectangle with BC = ${b} and BE = √(${a}² + ${c}²) = ${BE}. Edge FG is parallel to it, so M is exactly as far from BCHE as F is, and that is the height from F to the diagonal BE in the ${a}-by-${c} rectangle ABFE: ${over(`${a}·${c}`, BE)}. So the volume is ⅓·${b}·${BE}·${over(`${a}·${c}`, BE)} = ${over(`${a}·${b}·${c}`, 3)} = <b>${frac(abc, 3)}</b>, wherever M is on FG.`,
      check: () => {
        const B = [a, 0, 0], C = [a, b, 0], E = [0, 0, c], H = [0, b, c];
        return near(tetra(M3, B, C, H) + tetra(M3, B, H, E), abc / 3, 'volume');
      },
    };
  },
  // 6. two equal circles inside a big one: how far apart are the points of contact?
  (d, ctx) => {
    const [[r, R]] = combo(ctx, [[[2, 5], [2, 7], [3, 7], [3, 8], [3, 10], [4, 9], [4, 11], [5, 12], [5, 14], [6, 13], [4, 13], [6, 17]]]);
    const ans = [2 * r * R, R - r], yc = -Math.sqrt((R - r) ** 2 - r * r), k = R / (R - r);
    const w = 320, h = 320, T = frame([-R, R], [-R, R], w, h, 26), O = T([0, 0]), A = T([-r * k, yc * k]), B = T([r * k, yc * k]);
    return {
      topic: 'Circles inside a circle', rank: 15,
      text: `Two circles of radius ${r} touch each other, and each of them touches the inside of a circle of radius ${R}: one at A, the other at B. How far apart are A and B?`,
      figure: svg(w, h, 'Two equal circles inside a larger circle, touching it at A and B', [
        ring(O, R * T.s), ring(T([-r, yc]), r * T.s), ring(T([r, yc]), r * T.s), seg(A, B, 'seg dash'),
        label(away(A, O, 14), 'A'), label(away(B, O, 14), 'B')]),
      answer: choices(d, ans, [[2 * r, 1], [2 * r * R, R + r], [2 * r * (R - r), R], [r * R, R - r], [2 * r * R, R - 2 * r]], showFrac),
      solution: `Let O be the centre of the big circle and P, Q the centres of the small ones. P is on OA with OP = ${R} − ${r} = ${R - r}, Q is on OB with OQ = ${R - r}, and PQ = ${2 * r}. So triangle OAB is triangle OPQ enlarged by ${R}/${R - r}, and AB = ${2 * r}·${R}/${R - r} = <b>${frac(...ans)}</b>.`,
      check: () => {
        const Pc = [-r, yc], Qc = [r, yc], ok = Math.abs(dist(Pc, [0, 0]) - (R - r)) < 1e-9 && Math.abs(dist(Pc, Qc) - 2 * r) < 1e-9;
        const Ap = Pc.map((v) => (v * R) / dist(Pc, [0, 0])), Bp = Qc.map((v) => (v * R) / dist(Qc, [0, 0]));
        return ok ? near(dist(Ap, Bp), ans[0] / ans[1], 'AB') : 'circles placed wrong';
      },
    };
  },
  // 7. whole-number segments from the right angle to the hypotenuse
  (d, ctx) => {
    const [[a, b]] = combo(ctx, [[[6, 8], [9, 12], [15, 20], [12, 16], [8, 15], [5, 12], [7, 24], [10, 24], [16, 30], [18, 24], [10, 10], [6, 9], [12, 18], [9, 9]]]);
    const c2 = a * a + b * b, ab2 = a * a * b * b;
    let low = 1;
    while (low * low * c2 < ab2) low++;
    const hWhole = low * low * c2 === ab2, sideP = a - low + 1, sideR = b - low + 1, count = sideP + sideR - (hWhole ? 1 : 0);
    const c = Math.sqrt(c2), hText = Number.isInteger(c) ? frac(a * b, c) : over(a * b, root(c2)), hNum = (a * b) / c;
    const w = 380, h = 270, T = fit([[0, 0], [b, 0], [0, a]], w, h, 32), [pQ, pR, pP] = [[0, 0], [b, 0], [0, a]].map(T);
    const foot = T([(a * a * b) / c2, (a * b * b) / c2]), other = T([b * 0.72, a * 0.28]), ctr = centre([pP, pQ, pR]);
    return {
      topic: 'Segments to the hypotenuse', rank: 16,
      text: `Right triangle PQR has its right angle at Q, with PQ = ${a} and QR = ${b}. Segments are drawn from Q to points of the hypotenuse PR. Counting PQ and QR themselves, how many of these segments have a whole-number length?`,
      figure: svg(w, h, 'Right triangle PQR with segments from Q to the hypotenuse', [poly([pP, pQ, pR]), corner(pQ, pP, pR), seg(pQ, foot, 'seg dash'), seg(pQ, other, 'seg'),
        label(away(pP, ctr, 14), 'P'), label(away(pQ, ctr, 14), 'Q'), label(away(pR, ctr, 14), 'R'),
        label([pQ[0] - 14, mid(pQ, pP)[1]], a, 'ang'), label([mid(pQ, pR)[0], pQ[1] + 20], b, 'ang')]),
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
  // 8. the three altitudes of the triangle a line cuts off with the axes
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
  // 9. a square in a right triangle two ways: at the right angle, and on the hypotenuse
  (d, ctx) => {
    const [[a, b, c]] = combo(ctx, [[[5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [12, 5, 13], [15, 8, 17]]]);
    const x = (a * b) / (a + b), hgt = (a * b) / c, y = (c * hgt) / (c + hgt), ans = [c * c + a * b, c * (a + b)];
    const gap = 0.12 * (b + c), foot = (a * a) / c, x0 = b + gap, yl = x0 + (foot * y) / hgt;
    const w = 520, h = 220, T = fit([[0, 0], [x0 + c, 0], [0, Math.max(a, hgt)]], w, h, 26);
    const xy = '<span class="fr"><span>x</span><span>y</span></span>';
    return {
      topic: 'Squares in a right triangle', rank: 21,
      text: `Two copies of a right triangle with sides ${a}, ${b} and ${c} each hold a square. In the first, a square of side x shares the triangle's right angle, and its far corner touches the hypotenuse. In the second, a square of side y has one side lying along the hypotenuse and its other two corners on the legs. What is ${xy}?`,
      figure: svg(w, h, 'A square at the right angle of one triangle, and a square on the hypotenuse of another', ['<g/>',
        poly([[0, 0], [b, 0], [0, a]].map(T)), poly([[0, 0], [x, 0], [x, x], [0, x]].map(T), 'arc'),
        poly([[x0, 0], [x0 + c, 0], [x0 + foot, hgt]].map(T), 'side'), poly([[yl, 0], [yl + y, 0], [yl + y, y], [yl, y]].map(T), 'arc'),
        label(T([x / 2, x / 2]), 'x', 'ang'), label(T([yl + y / 2, y / 2]), 'y', 'ang')]),
      answer: choices(d, ans, [[c * (a + b), c * c + a * b], [1, 1], [a + b, c], [c, a + b], [c * c, c * c + a * b]], showFrac),
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
  // 10. a line through the origin finishes an equilateral triangle
  (d, ctx) => {
    const [a, b] = combo(ctx, [[1, 2, 3], [1, 2, 3, 4, 5, 6]], (a, b) => a !== 1 || b !== 1);
    const r3 = Math.sqrt(3), per = 3 * b + 2 * a * r3, k3 = '<span class="fr"><span>√3</span><span>3</span></span>';
    const sA = (n) => (n === 1 ? '√3' : `${n}√3`), correct = [per, `${3 * b} + ${sA(2 * a)}`];
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
  // 11. a segment across a rectangle, cut by a diagonal and by a line from a corner
  (d, ctx) => {
    const cross = (p, q) => p[0] * q[1] - p[1] * q[0];
    // where segment SU (as S + s(U − S)) meets the line from K to Z: s as a fraction [top, bottom], or null if not inside both
    const along = (W, H, e, f, Z) => {
      const S = [W - e, H], d1 = [f - S[0], -H], K = [0, H], d2 = [Z[0] - K[0], Z[1] - K[1]], wv = [K[0] - S[0], K[1] - S[1]];
      let den = cross(d1, d2), sT = cross(wv, d2), uT = cross(wv, d1);
      if (den < 0) { den = -den; sT = -sT; uT = -uT; }
      return den && sT > 0 && sT < den && uT > 0 && uT < den ? [sT, den] : null;
    };
    const solve = (W, H, e, g, f) => {
      const X = along(W, H, e, f, [W, g]), Y = along(W, H, e, f, [W, 0]);
      if (!X || !Y) return null;
      const top = Math.abs(X[0] * Y[1] - Y[0] * X[1]), bot = X[1] * Y[1];
      return top ? { X, Y, ratio: lowest(top, bot) } : null;
    };
    const [W, H, e, g, f] = combo(ctx, [[4, 5, 6, 7, 8], [3, 4, 5, 6], [1, 2, 3], [1, 2, 3], [1, 2, 3]],
      (W, H, e, g, f) => !(W === 5 && H === 4 && e === 1 && g === 1 && f === 2) && e < W && g < H && f < W && (solve(W, H, e, g, f)?.ratio[1] ?? 999) <= 150);
    const { X, Y, ratio } = solve(W, H, e, g, f), fr = (p) => frac(p[0], p[1]);
    const w = 380, h = 280, T = frame([0, W], [0, H], w, h, 32), [K, L, M, N] = [[0, H], [W, H], [W, 0], [0, 0]].map(T);
    const S = T([W - e, H]), Tp = T([W, g]), U = T([f, 0]), pX = T(meet([[W - e, H], [f, 0]], [[0, H], [W, g]])), pY = T(meet([[W - e, H], [f, 0]], [[0, H], [W, 0]]));
    const nrm = unit(S, U), off = [nrm[1] * 13, -nrm[0] * 13], ctr = T([W / 2, H / 2]);
    return {
      topic: 'Cutting a segment in a rectangle', rank: 19,
      text: `Rectangle KLMN has KL = ${W} and LM = ${H}. Point S is on side KL with SL = ${e}, point T is on side LM with MT = ${g}, and point U is on side MN with NU = ${f}. Segment SU crosses segment KT at X and diagonal KM at Y. What is <span class="fr"><span>XY</span><span>SU</span></span>?`,
      figure: svg(w, h, 'Rectangle KLMN with segments SU, KT and KM', [poly([K, L, M, N]), seg(S, U), seg(K, Tp, 'seg'), seg(K, M, 'seg'),
        ...[[K, 'K'], [L, 'L'], [M, 'M'], [N, 'N']].map(([p, s]) => label(away(p, ctr, 16), s)),
        label([S[0], S[1] - 12], 'S'), label([Tp[0] + 13, Tp[1]], 'T'), label([U[0], U[1] + 17], 'U'),
        label([pX[0] + off[0], pX[1] + off[1]], 'X'), label([pY[0] - off[0], pY[1] - off[1]], 'Y')]),
      answer: choices(d, ratio, [lowest(...X), lowest(...Y), [ratio[1] - ratio[0], ratio[1]], [2 * ratio[0], ratio[1]], [ratio[0], ratio[1] + 1]], showFrac),
      solution: `Put N at (0, 0): K = (0, ${H}), M = (${W}, 0), S = (${W - e}, ${H}), T = (${W}, ${g}) and U = (${f}, 0). Write the points of SU as S + s·(U − S), with s from 0 at S to 1 at U. Solving with the line KT gives s = ${fr(X)} at X, and with the line KM gives s = ${fr(Y)} at Y. So <span class="fr"><span>XY</span><span>SU</span></span> = |${fr(X)} − ${fr(Y)}| = <b>${fr(ratio)}</b>.`,
      check: () => {
        const Sp = [W - e, H], Up = [f, 0], Xp = meet([Sp, Up], [[0, H], [W, g]]), Yp = meet([Sp, Up], [[0, H], [W, 0]]);
        return near(dist(Xp, Yp) / dist(Sp, Up), ratio[0] / ratio[1], 'XY/SU', 1e-9);
      },
    };
  },
  // 12. seven cookies cut from a round sheet of dough, and one more from the scraps
  (d, ctx) => {
    const [r, given] = combo(ctx, [[2, 3, 4, 5], ['dough', 'cookie']]);
    const correct = surd(r, 2), w = 300, h = 300, T = frame([-3 * r, 3 * r], [-3 * r, 3 * r], w, h, 14), O = T([0, 0]);
    const ring6 = Array.from({ length: 6 }, (_, i) => [2 * r * Math.cos((i * Math.PI) / 3), 2 * r * Math.sin((i * Math.PI) / 3)]);
    return {
      topic: 'Cookies from a sheet of dough', rank: 15,
      text: (given === 'dough' ? `Seven equal round cookies are cut from a round sheet of dough of radius ${3 * r}` : `Seven round cookies, each of radius ${r}, are cut from a round sheet of dough`) +
        ': one in the middle and six in a ring around it. Each cookie touches the ones next to it, and the six outer ones touch the edge of the dough. The leftover dough is rolled out, just as thick, into one more round cookie. What is the radius of that cookie?',
      figure: svg(w, h, 'Seven cookies cut from a round sheet of dough', [ring(O, 3 * r * T.s), ring(O, r * T.s), ...ring6.map((p) => ring(T(p), r * T.s))]),
      answer: labelled(correct, [[1.5 * r, num(1.5 * r)], surd(r, 3), [2 * r, num(2 * r, 0)], surd(r, 7)]),
      solution: (given === 'dough' ? `The outer cookies' centres are two cookie radii from the middle, so the dough's radius is three cookie radii: each cookie has radius ${3 * r}/3 = ${r}. ` : `The outer cookies' centres are ${2 * r} from the middle, so the dough's radius is ${3 * r}. `) +
        `The dough's area is π·${3 * r}² = ${9 * r * r}π and the cookies take 7·π·${r}² = ${7 * r * r}π, leaving ${2 * r * r}π. A round cookie of that area has radius √${2 * r * r} = <b>${correct[1]}</b>.`,
      check: () => {
        // tangent where it should be, then count grid points that are dough but no cookie
        if (ring6.some((p, i) => Math.abs(dist(p, ring6[(i + 1) % 6]) - 2 * r) > 1e-9)) return 'outer cookies not touching';
        const n = 700, step = (6 * r) / n, cookies = [[0, 0], ...ring6];
        let left = 0;
        for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
          const p = [-3 * r + (i + 0.5) * step, -3 * r + (j + 0.5) * step];
          if (Math.hypot(...p) <= 3 * r && cookies.every((q) => dist(p, q) > r)) left++;
        }
        return near(Math.sqrt((left * step * step) / Math.PI), correct[0], 'scrap radius', 0.01);
      },
    };
  },
];
