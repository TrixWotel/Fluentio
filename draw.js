// Drawings for the physics tests that kit/bank.js's graph() doesn't make: vectors as arrows on a grid where a step is
// as long across as it is up (so angles look right), and projectile scenes, with the ground, cliffs, ledges, walls and
// tanks, the path drawing itself in, and lengths marked along the edges. physics/index.html styles them.
import { num, round } from '../kit/bank.js';

// plot({ x: [x0, x1, step], y: [y0, y1, step], xLabel, yLabel, equal, arrows, solids, curves, points, dims, notes })
//   arrows: { from: [x, y], to: [x, y], label, tone (0 accent, 1 second color, 2 green), dash, side (1 or −1 to choose
//   which side of the arrow its label goes; left out, it goes on the side away from the other arrows) }
//   solids: { pts: [[x, y]…], kind: 'rock' | 'water' | 'tank' }   curves: { f, from, to } (y = f(x))
//   points: [x, y, label]   dims: { from, to, label, off (pixels to the side) }   notes: { at: [x, y], text, anchor, dy }
export function plot({ x: [x0, x1, xs], y: [y0, y1, ys], xLabel, yLabel, equal = false, arrows = [], solids = [], curves = [], points = [], dims = [], notes = [] }) {
  const L = 56, R = 20, T = 18, B = 44;
  let iw = 464, ih = 236;
  if (equal) {
    // one step as long across as up: the height follows the width, within reason (more room up top if it's flat)
    ih = (iw * (y1 - y0)) / (x1 - x0);
    if (ih > 340) { ih = 340; iw = (ih * (x1 - x0)) / (y1 - y0); }
    if (ih < 150) { y1 = y0 + Math.ceil(((150 * (x1 - x0)) / iw) / ys - 1e-9) * ys; ih = (iw * (y1 - y0)) / (x1 - x0); }
    // (and not too narrow: more room on the right, a step at a time)
    while (iw < 230) { x1 += xs; iw = (ih * (x1 - x0)) / (y1 - y0); }
  }
  const w = L + iw + R, h = T + ih + B;
  const X = (v) => round(L + ((v - x0) / (x1 - x0)) * iw, 2), Y = (v) => round(T + ih - ((v - y0) / (y1 - y0)) * ih, 2);
  // (a drawing narrower than the page isn't stretched to fill it, so a tall one stays a sensible height)
  const out = [`<svg class="graph phys" viewBox="0 0 ${round(w, 2)} ${round(h, 2)}" style="max-width:${Math.min(560, Math.round(w * 1.1))}px" role="img" aria-label="${yLabel} against ${xLabel}">`];
  const ticks = (a, b, s) => { const t = []; for (let k = 0; a + k * s <= b + 1e-9; k++) t.push(round(a + k * s, 6)); return t; };
  const label = (v, s, count) => count <= 11 || Math.round(v / s) % 2 === 0;
  const tx = ticks(x0, x1, xs), ty = ticks(y0, y1, ys);
  for (const v of tx) out.push(`<line class="gr" x1="${X(v)}" y1="${T}" x2="${X(v)}" y2="${T + ih}"/>` + (label(v, xs, tx.length) ? `<text class="tk" x="${X(v)}" y="${T + ih + 16}" text-anchor="middle">${num(v)}</text>` : ''));
  for (const v of ty) out.push(`<line class="gr" x1="${L}" y1="${Y(v)}" x2="${L + iw}" y2="${Y(v)}"/>` + (label(v, ys, ty.length) ? `<text class="tk" x="${L - 7}" y="${Y(v) + 4}" text-anchor="end">${num(v)}</text>` : ''));
  const zx = x0 <= 0 && x1 >= 0 ? X(0) : L, zy = y0 <= 0 && y1 >= 0 ? Y(0) : T + ih;
  out.push(`<line class="ax" x1="${L}" y1="${zy}" x2="${L + iw}" y2="${zy}"/><line class="ax" x1="${zx}" y1="${T}" x2="${zx}" y2="${T + ih}"/>`);
  out.push(`<text class="al" x="${L + iw / 2}" y="${round(h - 6, 2)}" text-anchor="middle">${xLabel}</text>`);
  out.push(`<text class="al" transform="translate(14 ${round(T + ih / 2, 2)}) rotate(-90)" text-anchor="middle">${yLabel}</text>`);
  for (const s of solids) out.push(`<polygon class="${s.kind === 'water' ? 'water' : s.kind === 'tank' ? 'tank' : 'solid'}" points="${s.pts.map(([a, b]) => `${X(a)},${Y(b)}`).join(' ')}"/>`);
  // (pathLength 1 lets the page draw each path in, whatever its real length)
  curves.forEach(({ f, from, to }, i) => {
    const pts = []; for (let k = 0; k <= 80; k++) { const t = from + ((to - from) * k) / 80; pts.push(`${X(t)},${Y(f(t))}`); }
    out.push(`<polyline class="ln ln${i}" pathLength="1" points="${pts.join(' ')}"/>`);
  });
  // a measurement: a thin line with a bar at each end, set off to one side, and its length in the middle
  for (const { from, to, label: text, off = 0 } of dims) {
    const [ax, ay] = [X(from[0]), Y(from[1])], [bx, by] = [X(to[0]), Y(to[1])], len = Math.hypot(bx - ax, by - ay) || 1;
    const nx = (-(by - ay) / len) * off, ny = ((bx - ax) / len) * off, ex = (-(by - ay) / len) * 5, ey = ((bx - ax) / len) * 5;
    const p = [ax + nx, ay + ny], q = [bx + nx, by + ny], mid = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    out.push(`<path class="dim" d="M${round(p[0], 2)},${round(p[1], 2)}L${round(q[0], 2)},${round(q[1], 2)}M${round(p[0] - ex, 2)},${round(p[1] - ey, 2)}L${round(p[0] + ex, 2)},${round(p[1] + ey, 2)}M${round(q[0] - ex, 2)},${round(q[1] - ey, 2)}L${round(q[0] + ex, 2)},${round(q[1] + ey, 2)}"/>`);
    // (the length goes on the far side of the line from what it measures)
    const vertical = Math.abs(bx - ax) < Math.abs(by - ay), away = vertical ? Math.sign(nx) || 1 : Math.sign(ny) || -1;
    out.push(`<text class="dl" x="${round(mid[0] + (vertical ? away * 6 : 0), 2)}" y="${round(mid[1] + (vertical ? 4 : away > 0 ? 16 : -6), 2)}" text-anchor="${vertical ? (away > 0 ? 'start' : 'end') : 'middle'}">${text}</text>`);
  }
  // arrows: the line stops where its head starts, and the label sits beside the middle, on the side away from the
  // other arrows (so it isn't caught between two of them), unless that's off the grid
  const ends = arrows.flatMap(({ from, to }) => [[X(from[0]), Y(from[1])], [X(to[0]), Y(to[1])]]);
  const centre = [ends.reduce((s, p) => s + p[0], 0) / (ends.length || 1), ends.reduce((s, p) => s + p[1], 0) / (ends.length || 1)];
  const onGrid = ([px, py], half, low) => px - half > L + 3 && px + half < L + iw - 3 && py > T + 12 && py < T + ih - low;
  arrows.forEach(({ from, to, label: text, tone = 0, dash = false, side }, i) => {
    const [ax, ay] = [X(from[0]), Y(from[1])], [bx, by] = [X(to[0]), Y(to[1])], len = Math.hypot(bx - ax, by - ay);
    if (len < 1) return;
    const ux = (bx - ax) / len, uy = (by - ay) / len, head = Math.min(12, len * 0.45), wing = head * 0.5;
    const cx = bx - ux * head, cy = by - uy * head;
    const delay = `style="--d:${i * 120}ms"`;          // (each arrow a little after the one before; the page times them)
    out.push(`<line class="vec vec${tone}${dash ? ' dash' : ''}" pathLength="1" ${delay} x1="${round(ax, 2)}" y1="${round(ay, 2)}" x2="${round(cx, 2)}" y2="${round(cy, 2)}"/>`);
    if (!dash) out.push(`<polygon class="head head${tone}" ${delay} points="${round(bx, 2)},${round(by, 2)} ${round(cx - uy * wing, 2)},${round(cy + ux * wing, 2)} ${round(cx + uy * wing, 2)},${round(cy - ux * wing, 2)}"/>`);
    if (text) {
      // (far enough out that the whole label clears the line: a wide label beside a steep arrow needs more room)
      const half = String(text).length * 3.9, gap = 8 + Math.abs(uy) * half + Math.abs(ux) * 7;
      const at = (s, f = 0.5) => [ax + (bx - ax) * f - uy * gap * s, ay + (by - ay) * f + ux * gap * s], far = (p) => Math.hypot(p[0] - centre[0], p[1] - centre[1]);
      const s = side ?? (far(at(1)) + 0.5 >= far(at(-1)) ? 1 : -1);
      // (if it would hang off the grid, the other side, then further along the arrow: clear of the lengths marked along
      // the ground if it can be, and on the grid at least)
      const tries = side === undefined ? [[s, 0.5], [-s, 0.5], [s, 0.7], [-s, 0.7], [s, 0.85], [-s, 0.85], [s, 1], [-s, 1]] : [[s, 0.5]];
      const fits = (low) => tries.find(([k, f]) => onGrid(at(k, f), half, low));
      const [mx, my] = at(...(fits(20) ?? fits(8) ?? tries[0]));
      out.push(`<text class="vl vl${tone}" x="${round(mx, 2)}" y="${round(my + 4, 2)}" text-anchor="middle">${text}</text>`);
    }
  });
  const between = (v, s) => Math.abs(v / s - Math.round(v / s)) > 1e-6;
  for (const [a, b, text] of points) {
    const shown = text === true ? (between(a, xs) || between(b, ys) ? `(${num(a)}, ${num(b)})` : '') : text;
    out.push(`<circle class="pt" cx="${X(a)}" cy="${Y(b)}" r="4.5"/>` + (shown ? `<text class="pl" x="${X(a) + 8}" y="${Y(b) - 8}">${shown}</text>` : ''));
  }
  for (const { at, text, anchor = 'middle', dy = 0 } of notes) out.push(`<text class="nt" x="${X(at[0])}" y="${round(Y(at[1]) + dy, 2)}" text-anchor="${anchor}">${text}</text>`);
  out.push('</svg>');
  return out.join('');
}

// an axis range from lo to hi (with 0 in it) on a step from the list that gives about `steps` grid lines
export function axis(lo, hi, steps = 6, nice = [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500]) {
  lo = Math.min(0, lo); hi = Math.max(0, hi);
  const step = nice.find((s) => (hi - lo) / s <= steps + 0.01) ?? nice[nice.length - 1];
  return [Math.floor(lo / step + 1e-9) * step, Math.ceil(hi / step - 1e-9) * step || step, step];
}

// a vector's components from its size and its angle (degrees, counterclockwise from +x), and back
export const rad = (deg) => (deg * Math.PI) / 180;
export const deg = (r) => (r * 180) / Math.PI;
export const comps = (size, angle) => [size * Math.cos(rad(angle)), size * Math.sin(rad(angle))];
// the angle of (x, y) counterclockwise from +x, from 0 up to 360
export const heading = (x, y) => { const a = deg(Math.atan2(y, x)); return a < 0 ? a + 360 : a; };
