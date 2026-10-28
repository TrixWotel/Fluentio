// Tests like the ones in class for Vectors: a lab or a data set to analyse (process the data, plot it so the model gives
// a straight line and use the gradient, or add measured pulls and legs by components), a problem to solve in steps
// (river crossings, crosswinds, pulls at angles, bounces and turns), and vectors to explain. Original questions with new
// numbers and contexts every time. kit/exam-kit.js says what a question and its parts are.
import { examBank, dataTable, noisy, bestFit, sig } from '../kit/exam-kit.js';
import { num, round } from '../kit/bank.js';
import { plot, rad, deg, heading } from './draw.js';

const g = 9.8;
const T = {
  kinds: 'Scalars and vectors', parts: 'Components of a vector', size: 'Magnitude from components',
  angle: 'Direction from components', square: 'Adding vectors at right angles', add: 'Adding vectors by components',
  ij: 'Vectors in i and j', change: 'Subtracting vectors: change in velocity', river: 'Crossing a river',
  wind: 'Flying in a crosswind', balance: 'The vector that balances', path: 'Distance and displacement on a path',
};
const GUIDE = `<div class="cols">
  <ul>
    <li>Components of a vector of size A at θ from the +x axis: <span class="f">A<sub>x</sub> = A cos θ</span>, <span class="f">A<sub>y</sub> = A sin θ</span> (cos for the side next to the angle, sin for the side across from it)</li>
    <li>Magnitude: <span class="f">|A| = √(A<sub>x</sub>² + A<sub>y</sub>²)</span></li>
    <li>Direction: <span class="f">θ = tan⁻¹(A<sub>y</sub> ÷ A<sub>x</sub>)</span>, then check the quadrant (add 180° if A<sub>x</sub> is negative)</li>
    <li>Adding vectors: add the parts along each axis, <span class="f">R<sub>x</sub> = A<sub>x</sub> + B<sub>x</sub></span> and <span class="f">R<sub>y</sub> = A<sub>y</sub> + B<sub>y</sub></span></li>
  </ul>
  <ul>
    <li>Relative velocity: velocity over the ground = velocity through the water (or air) + the current’s (or wind’s) velocity, as vectors</li>
    <li>Change in velocity: <span class="f">Δv = v<sub>after</sub> − v<sub>before</sub></span>, as vectors. Average acceleration: <span class="f">a = Δv ÷ Δt</span></li>
    <li>Gradient of a straight line: <span class="f">m = Δy ÷ Δx</span>, read from two points far apart on the line</li>
    <li>Percent difference: <span class="f">|measured − expected| ÷ expected × 100%</span></li>
    <li>Weight: <span class="f">W = mg</span>, with m in kg and <span class="f">g = 9.8 N/kg</span> · 1000 g = 1 kg · 100 cm = 1 m · 1 h = 60 min · 1 min = 60 s</li>
  </ul>
</div>`;

// ---------- helpers ----------
const sin = (a) => Math.sin(rad(a)), cos = (a) => Math.cos(rad(a));
const atan = (y, x) => deg(Math.atan(y / x)), asin = (v) => deg(Math.asin(v)), acos = (v) => deg(Math.acos(v));
const hyp = (a, b) => Math.sqrt(a * a + b * b);
// a measurement as a table shows it, with all its decimals (12.0, not 12)
const fix = (x, dp = 1) => `${x < 0 ? '−' : ''}${Math.abs(x).toFixed(dp)}`;
// numbers in working that read right when they're negative: 4 − 1 rather than 4 + −1, 2 × (−1)
const paren = (v, dp = 2) => (v < 0 ? `(${num(v, dp)})` : num(v, dp));
const plus = (a, b, dp = 2) => `${num(a, dp)} ${b < 0 ? '−' : '+'} ${num(Math.abs(b), dp)}`;
const minus = (a, b, dp = 2) => `${num(a, dp)} ${b < 0 ? '+' : '−'} ${num(Math.abs(b), dp)}`;
const pct = (x) => `${Math.round(x * 100)}%`;
const bearing = (b) => String(Math.round(b)).padStart(3, '0');
// the right answer among wrong ones, in an order from the dice
const oneOf = (d, right, wrongs) => { const choices = d.shuffle([right, ...wrongs]); return { choices, correct: choices.indexOf(right) }; };
const field = (d, label, right, wrongs) => { const options = d.shuffle([right, ...wrongs]); return { label, options, correct: options.indexOf(right) }; };
// a figure with its title above it
const figure = (svg, title) => `<div class="chart">${title ? `<p class="chart-title">${title}</p>` : ''}${svg}</div>`;

// vectors drawn to scale (as in vectors.js): arrows on a grid where a step is as long across as up
function vectors(arrows, { unit = 'm', axes = ['x', 'y'], points = [] } = {}) {
  const xs = [...arrows.flatMap((a) => [a.from[0], a.to[0]]), ...points.map((p) => p[0])], ys = [...arrows.flatMap((a) => [a.from[1], a.to[1]]), ...points.map((p) => p[1])];
  const lo = (v) => Math.min(0, ...v), hi = (v) => Math.max(0, ...v), big = Math.max(hi(xs) - lo(xs), hi(ys) - lo(ys));
  const step = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find((s) => big / s <= 8) ?? 2000, pad = step * 0.6;
  const range = (v) => [lo(v) < 0 ? Math.floor((lo(v) - pad) / step) * step : 0, Math.ceil((hi(v) + pad) / step) * step, step];
  return plot({ x: range(xs), y: range(ys), equal: true, xLabel: `${axes[0]} (${unit})`, yLabel: `${axes[1]} (${unit})`, arrows, points });
}

// a diagram that isn't to scale, so there's no grid: water, circles, thin lines, angle arcs, arrows (as in draw.js:
// { from, to, label, tone, dash, side: 1 puts the label on the left of the arrow, −1 on the right }), dots and notes,
// fitted into the frame with y up. Arcs are { at, from, to, r, label, mark }: degrees counterclockwise from +x, r in
// pixels, and mark the angle the label sits at (halfway round the arc if left out).
function diagram({ water = [], circles = [], lines = [], arcs = [], arrows = [], dots = [], notes = [], w = 360, h = 240, pad = 36, label = 'A diagram' }) {
  const pts = [...water.flat(), ...circles.flatMap((c) => [[c.at[0] - c.r, c.at[1] - c.r], [c.at[0] + c.r, c.at[1] + c.r]]), ...lines.flatMap((l) => [l.from, l.to]), ...arrows.flatMap((a) => [a.from, a.to]), ...dots];
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
  const s = Math.min((w - 2 * pad) / (x1 - x0 || 1), (h - 2 * pad) / (y1 - y0 || 1));
  const ox = (w - s * (x1 - x0)) / 2 - s * x0, oy = (h + s * (y1 - y0)) / 2 + s * y0;
  const X = (x) => round(ox + s * x, 2), Y = (y) => round(oy - s * y, 2);
  const out = [`<svg class="graph phys" viewBox="0 0 ${w} ${h}" style="max-width:${Math.round(w * 1.15)}px" role="img" aria-label="${label}">`];
  for (const p of water) out.push(`<polygon class="water" points="${p.map(([a, b]) => `${X(a)},${Y(b)}`).join(' ')}"/>`);
  for (const c of circles) out.push(`<circle class="ax" cx="${X(c.at[0])}" cy="${Y(c.at[1])}" r="${round(c.r * s, 2)}" fill="none"/>`);
  for (const l of lines) out.push(`<line class="${l.wall ? 'ax' : 'dim'}"${l.dash ? ' stroke-dasharray="5 4"' : ''} x1="${X(l.from[0])}" y1="${Y(l.from[1])}" x2="${X(l.to[0])}" y2="${Y(l.to[1])}"/>`);
  for (const a of arcs) {
    const cx = X(a.at[0]), cy = Y(a.at[1]), at = (t, r) => [round(cx + r * Math.cos(rad(t)), 2), round(cy - r * Math.sin(rad(t)), 2)];
    const [sx, sy] = at(a.from, a.r), [ex, ey] = at(a.to, a.r), large = Math.abs(a.to - a.from) > 180 ? 1 : 0, sweep = a.to > a.from ? 0 : 1;
    out.push(`<path class="dim" d="M${sx},${sy} A${a.r},${a.r} 0 ${large} ${sweep} ${ex},${ey}"/>`);
    if (a.label) { const [lx, ly] = at(a.mark ?? (a.from + a.to) / 2, a.r + 13); out.push(`<text class="dl" x="${lx}" y="${round(ly + 4, 2)}" text-anchor="middle">${a.label}</text>`); }
  }
  arrows.forEach(({ from, to, label: text, tone = 0, dash = false, side = 1 }, i) => {
    const ax = X(from[0]), ay = Y(from[1]), bx = X(to[0]), by = Y(to[1]), len = Math.hypot(bx - ax, by - ay);
    const ux = (bx - ax) / len, uy = (by - ay) / len, head = Math.min(12, len * 0.45), wing = head * 0.5, cx = bx - ux * head, cy = by - uy * head;
    const delay = `style="--d:${i * 120}ms"`;
    out.push(`<line class="vec vec${tone}${dash ? ' dash' : ''}" pathLength="1" ${delay} x1="${ax}" y1="${ay}" x2="${round(dash ? bx : cx, 2)}" y2="${round(dash ? by : cy, 2)}"/>`);
    if (!dash) out.push(`<polygon class="head head${tone}" ${delay} points="${bx},${by} ${round(cx - uy * wing, 2)},${round(cy + ux * wing, 2)} ${round(cx + uy * wing, 2)},${round(cy - ux * wing, 2)}"/>`);
    if (text) {
      const half = String(text).length * 3.6, gap = 9 + Math.abs(uy) * half + Math.abs(ux) * 6;
      out.push(`<text class="vl vl${tone}" x="${round((ax + bx) / 2 + uy * gap * side, 2)}" y="${round((ay + by) / 2 - ux * gap * side + 4, 2)}" text-anchor="middle">${text}</text>`);
    }
  });
  for (const [x, y, text] of dots) out.push(`<circle class="pt" cx="${X(x)}" cy="${Y(y)}" r="4.5"/>${text ? `<text class="pl" x="${round(X(x) + 8, 2)}" y="${round(Y(y) - 8, 2)}">${text}</text>` : ''}`);
  for (const { at, text, anchor = 'middle', dy = 0 } of notes) out.push(`<text class="nt" x="${X(at[0])}" y="${round(Y(at[1]) + dy, 2)}" text-anchor="${anchor}">${text}</text>`);
  out.push('</svg>');
  return out.join('');
}

// ---------- 1. labs and data sets ----------

// a boat crossing a current from different distances, always pointing straight across: it drifts d = (vc ÷ vb) × w, so
// d against w is a straight line through the origin whose gradient gives the current's speed
function driftLab(d) {
  const vb = d.pick([0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8]), k = d.pick([0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.65]);
  const w0 = d.pick([0.4, 0.5, 0.6]), dw = d.pick([0.5, 0.6]), wide = d.pick([4.5, 5, 5.5]);
  const boat = d.pick(['small battery-powered boat', 'radio-controlled model boat', 'model tugboat with an electric motor']);
  const w = Array.from({ length: 6 }, (_, i) => round(w0 + i * dw, 1));
  // three trials at each distance (cm, read to the millimetre), their mean, and the mean in metres
  const trials = w.map((x) => [0, 1, 2].map(() => round(noisy(d, k * x * 100, 0.03), 1)));
  const mean = trials.map((t) => round((t[0] + t[1] + t[2]) / 3, 2)), dm = mean.map((c) => round(c / 100, 4));
  const s = bestFit(w.map((x, i) => [x, dm[i]])).slope, vc = s * vb;
  // v_c ÷ v_b from someone's own line, whichever way round they plotted it
  const ratio = (line) => (line.y === 'd' && line.x === 'w' ? line.slope : line.y === 'w' && line.x === 'd' ? 1 / line.slope : null);
  const extras = d.shuffle(['select', 'straight', 'control', 'error', 'predict']).slice(0, 3);
  const parts = [];
  if (extras.includes('select')) {
    parts.push({ kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
      fields: [field(d, 'Independent variable', 'The distance w from the far side', ['The drift d', 'The speed of the current', 'The boat’s speed through the water']),
        field(d, 'Dependent variable', 'The drift d', ['The distance w from the far side', 'The time each crossing takes', 'The direction the boat points'])],
      working: 'The student changes the <b>distance from the far side, <i>w</i></b>, on purpose: that is the independent variable. They measure the <b>drift <i>d</i></b> it causes: the dependent variable. The current, the boat’s speed and the way it points are kept the same.' });
  }
  parts.push({ kind: 'table', ask: 'Process the data: find the <b>mean drift</b> at each distance, in centimetres and then in metres.',
    head: ['<i>w</i> (m)', 'Trial 1 (cm)', 'Trial 2 (cm)', 'Trial 3 (cm)', 'Mean <i>d</i> (cm)', 'Mean <i>d</i> (m)'],
    rows: w.map((x, i) => [fix(x, 1), ...trials[i].map((t) => fix(t, 1)), null, null]),
    fill: { 4: { values: mean, tol: 0.01, unit: 'cm' }, 5: { values: dm, tol: 0.01, unit: 'm' } },
    working: `Add the three trials and divide by 3, then divide by 100 for metres. For w = ${fix(w[0], 1)} m: (${trials[0].map((t) => fix(t, 1)).join(' + ')}) ÷ 3 = ${num(mean[0], 2)} cm = ${num(dm[0], 4)} m. The same for each row.` });
  const P = parts.length;
  parts.push({ kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find the speed of the current, and draw the line of best fit.',
    quantities: {
      d: { label: 'Mean drift <i>d</i> (m)', values: dm }, w: { label: '<i>w</i> (m)', values: w },
      d2: { label: '<i>d</i>² (m²)', values: dm.map((x) => x * x) }, rw: { label: '√<i>w</i>', values: w.map(Math.sqrt) },
      iw: { label: '1 ÷ <i>w</i> (1/m)', values: w.map((x) => 1 / x) },
    },
    pairs: [['d', 'w'], ['w', 'd']],
    working: 'The model d = (v<sub>c</sub> ÷ v<sub>b</sub>) × w has the form y = mx, with the gradient m = v<sub>c</sub> ÷ v<sub>b</sub>, which is the same for every crossing. So plot the mean drift d (in metres) on the y-axis against w on the x-axis: a straight line through the origin.' });
  parts.push({ kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: round(s, 4), unit: '', tol: 0.05,
    from: { part: P, value: (line) => line.slope, tol: 0.02 },
    working: `Gradient = Δy ÷ Δx between two points far apart on the line: about <b>${sig(s, 3)}</b> for d (m) against w (m). It has no unit: metres ÷ metres.` });
  parts.push({ kind: 'steps', ask: 'Use your gradient and the model to find the <b>speed of the current</b>. Show your working.', topic: T.river,
    steps: [{ label: 'v<sub>c</sub> ÷ v<sub>b</sub>, from the gradient', value: round(s, 4), unit: '', tol: 0.06 }, { label: 'Speed of the current, v<sub>c</sub>', value: round(vc, 4), unit: 'm/s', tol: 0.06 }],
    from: { part: P, value: (line) => { const r = ratio(line); return r == null ? null : r * vb; }, tol: 0.03 },
    working: `The gradient is v<sub>c</sub> ÷ v<sub>b</sub> = ${sig(s, 3)}, so v<sub>c</sub> = ${sig(s, 3)} × ${num(vb)} m/s ≈ <b>${sig(vc, 3)} m/s</b>.` });
  if (extras.includes('predict')) {
    parts.push({ kind: 'steps', ask: `The tank is ${num(wide)} m wide. Predict how long the boat would take to cross from the near side (w = ${num(wide)} m), and how far downstream it would drift.`, topic: T.river,
      steps: [{ label: 'Time to cross', value: round(wide / vb, 3), unit: 's', tol: 0.02 }, { label: 'Drift downstream', value: round(s * wide, 4), unit: 'm', tol: 0.06 }],
      from: { part: P, value: (line) => { const r = ratio(line); return r == null ? null : r * wide; }, tol: 0.03 },
      working: `Only the boat’s own velocity carries it across: t = ${num(wide)} ÷ ${num(vb)} = ${num(wide / vb)} s. All that time the current carries it downstream, so d = gradient × w = ${sig(s, 3)} × ${num(wide)} ≈ <b>${num(s * wide)} m</b> (the same as v<sub>c</sub> × t = ${sig(vc, 3)} × ${num(wide / vb)}).` });
  }
  if (extras.includes('straight')) {
    parts.push({ kind: 'written', ask: 'Explain why the graph of <i>d</i> against <i>w</i> is a straight line through the origin.', lines: 3,
      points: ['d = (v<sub>c</sub> ÷ v<sub>b</sub>) × w has the form y = mx, with the gradient m = v<sub>c</sub> ÷ v<sub>b</sub>', 'The current and the boat’s speed are the same for every crossing, so the gradient is constant, and with nothing added the line goes through the origin: no distance to cross means no drift'],
      model: 'The model d = (v<sub>c</sub> ÷ v<sub>b</sub>) × w has the form y = mx. The current and the boat’s speed through the water don’t change between crossings, so v<sub>c</sub> ÷ v<sub>b</sub> is a constant gradient. Nothing is added to it, so the line passes through the origin: a boat with no distance to cross has no time to drift.' });
  }
  if (extras.includes('control')) {
    parts.push({ kind: 'written', ask: 'Name <b>one variable</b> the student must keep the same in this experiment, and explain why.', lines: 3,
      points: ['Names a specific control variable and how it is kept the same: the boat’s speed through the water (the same motor setting and a charged battery), the speed of the current (the same pump setting), or the boat pointing at right angles to the current', 'Explains that if it changed, the drift would change for another reason as well as w, so the gradient v<sub>c</sub> ÷ v<sub>b</sub> would not stay the same and the line could not give the current'],
      model: 'The boat’s speed through the water, by using the same motor setting and a fully charged battery for every trial. If the boat were slower on some crossings, it would take longer to cross and drift further for the same w, so the drift would no longer depend on w alone and v<sub>c</sub> ÷ v<sub>b</sub> would change from one crossing to the next.',
      notes: ['“Keep everything the same” or just “the boat” earns nothing: name the quantity, like the boat’s speed through the water, and say how it is kept the same.'] });
  }
  if (extras.includes('error')) {
    parts.push({ kind: 'written', ask: 'The three trials at each distance don’t agree exactly. <b>Identify one possible source of error</b> in the set-up, and say how it affects the drift.', lines: 4,
      points: ['Names a specific source in the set-up itself: the boat not pointing exactly at right angles to the current, the boat starting from rest and taking time to reach full speed, the water flowing slower near the tank’s sides than in the middle, or the battery running down over the trials', 'Says how it changes the drift: pointing a little downstream makes d too large (upstream, too small); a slower current near the sides makes d smaller; a weaker battery makes the boat slower, so later trials drift further'],
      model: 'The boat might not point exactly at right angles to the current when it is released. Pointing a little downstream, part of its own velocity also carries it downstream, so it drifts further than the model says; pointing a little upstream, it drifts less. That spreads the three trials apart.',
      notes: ['“Human error” or “measuring wrongly” earns nothing: it has to be something in the set-up itself, and say what it does to d.'] });
  }
  // the tank from above for the widest crossing (not to scale): where the boat starts, the way it points, the current,
  // and the path it actually takes to the far side
  const scene = diagram({
    water: [[[-1.2, -0.35], [3.3, -0.35], [3.3, 2], [-1.2, 2]]],
    lines: [{ from: [-1.2, 2], to: [3.3, 2], wall: true }, { from: [0, 0], to: [0, 2], dash: true },
      { from: [0, 1.82], to: [1.3, 1.82] }, { from: [0, 1.74], to: [0, 1.9] }, { from: [1.3, 1.74], to: [1.3, 1.9] }],
    arrows: [{ from: [0, 0], to: [0, 0.85], label: 'heading', tone: 0, side: 1 }, { from: [1.9, 0.55], to: [3, 0.55], label: 'current', tone: 1, side: -1 }, { from: [0, 0], to: [1.3, 2], tone: 2, dash: true }],
    dots: [[0, 0, 'start gate']],
    notes: [{ at: [-0.1, 1.3], text: 'w', anchor: 'end' }, { at: [0.65, 1.82], text: 'd', dy: 15 }, { at: [3.25, 2], text: 'far side', dy: -7, anchor: 'end' }],
    label: 'The tank seen from above, with the boat’s path to the far side',
  });
  return {
    title: 'Drifting across a current',
    intro: `<p>In a hydraulics lab, pumps keep the water in a long test tank flowing at a steady speed. A student releases a ${boat} from a start gate at different distances <i>w</i> from the far side of the tank. Each time the boat points straight across the tank, at right angles to the current, with its motor on the same setting. The student measures the <b>drift</b> <i>d</i>: how far downstream of the point directly opposite the start gate the boat reaches the far side. Each distance is tried three times.</p><p>In still water the boat moves at <i>v</i><sub>b</sub> = ${num(vb)} m/s. While it crosses, the current carries it downstream at <i>v</i><sub>c</sub>, so the supplied model is</p><p class="model"><span class="f">d = (v<sub>c</sub> ÷ v<sub>b</sub>) × w</span></p><p>The student wants to use the data to find the speed of the current.</p>`,
    figures: [figure(scene, 'One crossing, seen from above (not to scale)'), dataTable(['Distance from the far side, <i>w</i> (m)', 'Drift, trial 1 (cm)', 'Trial 2 (cm)', 'Trial 3 (cm)'], w.map((x, i) => [fix(x, 1), ...trials[i].map((t) => fix(t, 1))]), 'Drift downstream at each distance')],
    parts,
  };
}

// a force table: two equal bags pull a ring θ apart and a third string balances them, so FC = 2W cos(θ ÷ 2): FC
// against cos(θ ÷ 2) is a straight line through the origin whose gradient gives a bag's weight
function ringLab(d) {
  const mb = d.pick([150, 160, 180, 200, 220, 240, 250]) / 1000;
  const th = d.pick([[20, 45, 70, 95, 120, 145], [25, 50, 75, 100, 125, 150], [30, 55, 80, 105, 130, 155], [10, 40, 70, 100, 130, 160]]);
  const mC = th.map((t) => Math.round(noisy(d, 2 * mb * cos(t / 2) * 1000, 0.02)));          // g, to the gram
  const F = mC.map((m) => round((m / 1000) * g, 4)), ch = th.map((t) => round(cos(t / 2), 4));
  const s = bestFit(ch.map((c, i) => [c, F[i]])).slope, W = s / 2, mass = W / g;
  // a bag's weight from someone's own line: FC against cos(θ ÷ 2) has gradient 2W, FC² against cos θ has gradient 2W²
  const weightFrom = (line) => {
    const m = line.slope;
    if (line.y === 'F' && line.x === 'ch') return m / 2;
    if (line.y === 'ch' && line.x === 'F') return 1 / (2 * m);
    if (line.y === 'F2' && line.x === 'c') return m > 0 ? Math.sqrt(m / 2) : null;
    if (line.y === 'c' && line.x === 'F2') return m > 0 ? Math.sqrt(1 / (2 * m)) : null;
    return null;
  };
  const extras = d.shuffle(['select', 'balance', 'opposite', 'error', 'control']).slice(0, 3);
  const parts = [];
  if (extras.includes('select')) {
    parts.push({ kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
      fields: [field(d, 'Independent variable', 'The angle θ between strings A and B', ['The mass on hanger C', 'The mass of each bag', 'The position of the ring']),
        field(d, 'Dependent variable', 'The mass on hanger C that balances the ring', ['The angle θ between strings A and B', 'The mass of each bag', 'The direction of string C'])],
      working: 'The student sets the <b>angle θ between A and B</b> on purpose: the independent variable. For each angle they find the <b>mass on hanger C</b> that balances the ring: the dependent variable. The bags stay the same throughout.' });
  }
  parts.push({ kind: 'table', ask: 'Process the data: find the pull of string C, <i>F</i><sub>C</sub>, in newtons, and cos(<i>θ</i> ÷ 2), for each angle.',
    head: ['<i>θ</i> (°)', '<i>m</i><sub>C</sub> (g)', '<i>F</i><sub>C</sub> (N)', 'cos(<i>θ</i> ÷ 2)'],
    rows: th.map((t, i) => [String(t), String(mC[i]), null, null]),
    fill: { 2: { values: F, tol: 0.01, unit: 'N' }, 3: { values: ch, tol: { abs: 0.005 } } },
    working: `F<sub>C</sub> = m<sub>C</sub>g with the mass in kilograms: ${mC[0]} g = ${num(mC[0] / 1000, 3)} kg, so F<sub>C</sub> = ${num(mC[0] / 1000, 3)} × 9.8 = ${num(F[0], 3)} N. And cos(${th[0]}° ÷ 2) = cos ${num(th[0] / 2, 1)}° = ${num(ch[0], 3)}. The same for each row.` });
  const P = parts.length;
  parts.push({ kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find the weight of one bag, and draw the line of best fit.',
    quantities: {
      F: { label: '<i>F</i><sub>C</sub> (N)', values: F }, ch: { label: 'cos(<i>θ</i> ÷ 2)', values: ch },
      th: { label: '<i>θ</i> (°)', values: th }, c: { label: 'cos <i>θ</i>', values: th.map((t) => cos(t)) },
      F2: { label: '<i>F</i><sub>C</sub>² (N²)', values: F.map((f) => f * f) }, sh: { label: 'sin(<i>θ</i> ÷ 2)', values: th.map((t) => sin(t / 2)) },
    },
    pairs: [['F', 'ch'], ['ch', 'F'], ['F2', 'c'], ['c', 'F2']],
    working: 'The model F<sub>C</sub> = 2W cos(θ ÷ 2) has the form y = mx, with y = F<sub>C</sub>, x = cos(θ ÷ 2) and the gradient m = 2W, which is the same for every angle because the bags don’t change. So plot F<sub>C</sub> against cos(θ ÷ 2): a straight line through the origin. (F<sub>C</sub>² against cos θ is straight too, since F<sub>C</sub>² = 2W²(1 + cos θ).)' });
  parts.push({ kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: round(s, 4), unit: 'N', tol: 0.05,
    from: { part: P, value: (line) => line.slope, tol: 0.02 },
    working: `Gradient = Δy ÷ Δx between two points far apart on the line: about <b>${sig(s, 3)} N</b> for F<sub>C</sub> (N) against cos(θ ÷ 2), which has no unit.` });
  parts.push({ kind: 'steps', ask: 'Use your gradient and the model to find the <b>weight</b> of one bag of sand, and then its <b>mass in kilograms</b>.',
    steps: [{ label: 'Weight of one bag, W', value: round(W, 4), unit: 'N', tol: 0.06 }, { label: 'Mass of one bag', value: round(mass, 4), unit: 'kg', tol: 0.06 }],
    from: { part: P, value: (line) => { const wt = weightFrom(line); return wt == null ? null : wt / g; }, tol: 0.04 },
    working: `The gradient is 2W = ${sig(s, 3)} N, so W = ${sig(s, 3)} ÷ 2 = ${sig(W, 3)} N. Then m = W ÷ g = ${sig(W, 3)} ÷ 9.8 ≈ <b>${num(mass, 3)} kg</b> (${num(mass * 1000, 0)} g).` });
  if (extras.includes('opposite')) {
    const q = oneOf(d, 'None: the ring would stay still with nothing on C', ['The same mass as one bag', 'Twice the mass of one bag']);
    parts.push({ kind: 'choice', ask: 'What mass would hanger C need if strings A and B were <b>180°</b> apart?', topic: T.balance, ...q,
      explain: { ask: 'Explain your answer.', lines: 3,
        points: ['At 180° the two equal pulls point in exactly opposite directions, so they cancel: their resultant is zero', 'The model agrees: cos(180° ÷ 2) = cos 90° = 0, so F<sub>C</sub> = 0'],
        model: 'None. With A and B 180° apart, the two bags pull equally hard in opposite directions, so their pulls cancel and the ring is already balanced. The model says the same: F<sub>C</sub> = 2W cos 90° = 0.' } });
  }
  if (extras.includes('balance')) {
    parts.push({ kind: 'written', ask: 'The student finds that string C always has to point directly away from the line halfway between strings A and B. <b>Explain why.</b>', lines: 4, topic: T.balance,
      points: ['The ring is still, so the three pulls add to zero: the pull of C must be equal in size and opposite in direction to the resultant of A and B', 'A and B pull equally hard, so their parts across the halfway line cancel and their resultant points along the halfway line: C must point the opposite way along it'],
      model: 'The ring is still, so the three pulls on it add to zero: C must cancel the resultant of A and B, with the same size in the opposite direction. The bags pull equally hard, so the parts of their pulls across the line halfway between them are equal and opposite and cancel, leaving a resultant along that halfway line. So C has to point straight back along it.',
      notes: ['“Because it balances” alone earns nothing: say why the resultant of A and B lies along the halfway line.'] });
  }
  if (extras.includes('error')) {
    parts.push({ kind: 'written', ask: '<b>Identify one possible source of error</b> in the set-up, and say how it affects the results.', lines: 4,
      points: ['Names a specific source in the set-up itself: friction in the pulleys (the ring stays still over a small range of masses on C), a string not pointing through the centre of the ring, the table not level, or the angles read from the table’s scale to only a degree or so', 'Says how it affects the results: the recorded m<sub>C</sub> can be a few grams more or less than the mass that exactly balances, so the points scatter about the line (or a wrong angle gives a wrong cos(θ ÷ 2))'],
      model: 'Friction in the pulley of string C. Because of it, the ring stays still over a small range of masses on hanger C, so the recorded mass can be a few grams more or less than the mass that exactly balances A and B. That scatters the points a little above and below the line.',
      notes: ['“Human error” or “the masses were wrong” earns nothing: it has to be something in the set-up itself, and say what it does to the readings.'] });
  }
  if (extras.includes('control')) {
    parts.push({ kind: 'written', ask: 'Name <b>one variable</b> the student must keep the same, and explain why.', lines: 3,
      points: ['Names a specific control variable: the two bags (the same bags, so the pulls of A and B stay the same), or the ring sitting at the centre of the table for every reading (so the strings make the angles read from the scale)', 'Explains: if the bags changed, W would change, so the gradient 2W would not be the same for every angle (or, if the ring is off centre, the angles used would be wrong)'],
      model: 'The two bags of sand: the same two bags must hang from A and B for every angle. The gradient of the line is 2W, so if a bag were changed, W would change partway through and the points would no longer lie on one line that gives one weight.',
      notes: ['“Keep the masses the same” is too vague: say which masses (the bags on A and B, not the mass on C, which is what is measured).'] });
  }
  return {
    title: 'Balancing a ring on a force table',
    intro: `<p>A student uses a force table: a round, level table with a small ring at its centre and pulleys clamped around its edge. Strings tied to the ring run over the pulleys to hangers. Two identical sealed bags of sand hang from strings A and B, set an angle <i>θ</i> apart. The student moves the pulley of string C around the table and adds slotted masses to its hanger until the ring stays still at the centre without touching the pin there. They record the total mass on hanger C, <i>m</i><sub>C</sub>, for six angles.</p><p>When the ring balances, the pull of string C equals the resultant of the pulls of A and B. Each bag pulls with its weight <i>W</i>, so the supplied model is</p><p class="model"><span class="f">F<sub>C</sub> = 2W cos(θ ÷ 2)</span></p><p>where F<sub>C</sub> = m<sub>C</sub>g is the pull of string C and g = 9.8 N/kg. The student wants to use the data to find the mass of one bag of sand.</p>`,
    figures: [figure(tableTop(th[2]), 'The force table from above (not to scale)'), dataTable(['Angle between A and B, <i>θ</i> (°)', 'Mass on hanger C, <i>m</i><sub>C</sub> (g)'], th.map((t, i) => [String(t), String(mC[i])]), 'The mass on C that balances the ring')],
    parts,
  };
}
// the force table from above: its edge, strings A and B θ apart and C pointing away from the line halfway between them
function tableTop(t) {
  const end = (a) => [cos(a), sin(a)], c = 180 + t / 2;
  return diagram({
    circles: [{ at: [0, 0], r: 1 }],
    lines: [{ from: [0, 0], to: end(t / 2).map((v) => v * 0.7), dash: true }],
    arcs: [{ at: [0, 0], from: 0, to: t, r: 28, label: 'θ', mark: t * 0.27 }],
    arrows: [{ from: [0, 0], to: end(0), label: 'A', tone: 0, side: -1 }, { from: [0, 0], to: end(t), label: 'B', tone: 0, side: 1 }, { from: [0, 0], to: end(c), label: 'C', tone: 1, side: 1 }],
    dots: [end(0), end(t), end(c)].map(([x, y]) => [x, y, '']),
    w: 300, h: 260, pad: 26, label: 'The force table from above, with strings A, B and C',
  });
}

// a drone flying at a set airspeed in a steady wind, at different headings: vg² = va² + w² + 2·va·w·cos φ, so vg²
// against cos φ is a straight line whose gradient (2·va·w) gives the wind's speed
function droneLab(d) {
  const va = d.pick([8, 9, 10, 11, 12]), wind = va * d.pick([0.4, 0.45, 0.5, 0.55]);
  const phi = [0, 30, 60, 90, 120, 150, 180];
  const vg = phi.map((p) => round(noisy(d, Math.sqrt(va * va + wind * wind + 2 * va * wind * cos(p)), 0.015), 1));
  const v2 = vg.map((v) => round(v * v, 2)), c = phi.map((p) => round(cos(p), 3) || 0);
  const fit = bestFit(c.map((x, i) => [x, v2[i]])), s = fit.slope, w = s / (2 * va);
  const windFrom = (line) => (line.y === 'v2' && line.x === 'c' ? line.slope / (2 * va) : line.y === 'c' && line.x === 'v2' ? 1 / (2 * va * line.slope) : null);
  const across = acos(-w / va);
  const extras = d.shuffle(['select', 'slowest', 'model', 'across']).slice(0, 2);
  const parts = [];
  if (extras.includes('select')) {
    parts.push({ kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
      fields: [field(d, 'Independent variable', 'The heading of each run', ['The ground speed', 'The wind’s speed', 'The airspeed']),
        field(d, 'Dependent variable', 'The ground speed', ['The heading of each run', 'The airspeed', 'The time each run takes'])],
      working: 'The club changes the <b>heading φ</b> on purpose from run to run: the independent variable. The GPS measures the <b>ground speed</b> that results: the dependent variable. The airspeed is kept the same, and the wind is (they hope) steady.' });
  }
  parts.push({ kind: 'table', ask: 'Process the data: find <i>v</i><sub>g</sub>² and cos <i>φ</i> for each run.',
    head: ['<i>φ</i> (°)', '<i>v</i><sub>g</sub> (m/s)', '<i>v</i><sub>g</sub>² (m²/s²)', 'cos <i>φ</i>'],
    rows: phi.map((p, i) => [String(p), fix(vg[i], 1), null, null]),
    fill: { 2: { values: v2, tol: 0.01, unit: 'm²/s²' }, 3: { values: c, tol: { abs: 0.005 } } },
    working: `Square each ground speed: ${fix(vg[1], 1)}² = ${num(v2[1], 2)} m²/s². And cos ${phi[1]}° = ${num(c[1], 3)}, cos 90° = 0, cos 180° = −1. The same for each row.` });
  const P = parts.length;
  parts.push({ kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find the wind’s speed, and draw the line of best fit.',
    quantities: {
      v2: { label: '<i>v</i><sub>g</sub>² (m²/s²)', values: v2 }, c: { label: 'cos <i>φ</i>', values: c },
      v: { label: '<i>v</i><sub>g</sub> (m/s)', values: vg }, p: { label: '<i>φ</i> (°)', values: phi }, s: { label: 'sin <i>φ</i>', values: phi.map((p) => round(sin(p), 3)) },
    },
    pairs: [['v2', 'c'], ['c', 'v2']],
    working: 'The model v<sub>g</sub>² = (2v<sub>a</sub>w) cos φ + (v<sub>a</sub>² + w²) has the form y = mx + c, with y = v<sub>g</sub>², x = cos φ, the gradient m = 2v<sub>a</sub>w and the intercept v<sub>a</sub>² + w², both the same for every run. So plot v<sub>g</sub>² against cos φ: a straight line (it doesn’t go through the origin).' });
  parts.push({ kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: round(s, 3), unit: 'm²/s²', tol: 0.05,
    from: { part: P, value: (line) => line.slope, tol: 0.02 },
    working: `Gradient = Δy ÷ Δx between two points far apart on the line: about <b>${sig(s, 3)} m²/s²</b> for v<sub>g</sub>² (m²/s²) against cos φ, which has no unit.` });
  parts.push({ kind: 'steps', ask: `The drone’s airspeed was v<sub>a</sub> = ${va} m/s. Use your gradient and the model to find the <b>speed of the wind</b>.`, topic: T.wind,
    steps: [{ label: 'The gradient is 2v<sub>a</sub>w', value: round(s, 3), unit: 'm²/s²', tol: 0.06 }, { label: 'Wind speed, w', value: round(w, 4), unit: 'm/s', tol: 0.06 }],
    from: { part: P, value: windFrom, tol: 0.03 },
    working: `The gradient is 2v<sub>a</sub>w = ${sig(s, 3)} m²/s², so w = ${sig(s, 3)} ÷ (2 × ${va}) ≈ <b>${sig(w, 3)} m/s</b>.` });
  if (extras.includes('slowest')) {
    parts.push({ kind: 'choice', ask: 'At which heading was the drone’s ground speed the <b>smallest</b>?', topic: T.wind,
      choices: ['0°, flying with the wind', '90°, flying across the wind', '180°, flying into the wind'], correct: 2,
      explain: { ask: 'Explain why, using vectors.', lines: 4,
        points: [`The data shows the smallest ground speed, ${fix(vg[6], 1)} m/s, at 180°`, 'Flying into the wind, the wind’s velocity points straight against the drone’s velocity through the air, so the two subtract: v<sub>a</sub> − w', 'At any other heading only part of the wind’s velocity works against the drone and part points sideways, so the resultant is bigger'],
        marks: 2,
        model: `At 180° (${fix(vg[6], 1)} m/s in the data). Flying into the wind, the wind’s velocity points exactly opposite to the drone’s velocity through the air, so the vectors subtract and the ground speed is v<sub>a</sub> − w. At any other heading, part of the wind’s velocity points sideways and adds to the resultant, so the drone moves faster over the ground.` } });
  }
  if (extras.includes('model')) {
    parts.push({ kind: 'written', ask: 'Show how the model comes from adding the drone’s velocity through the air and the wind’s velocity <b>by components</b>. Take the x-axis along the direction the wind blows toward.', lines: 5, topic: T.add,
      points: ['Components of the ground velocity: v<sub>a</sub> cos φ + w along the wind, and v<sub>a</sub> sin φ across it', 'By Pythagoras, v<sub>g</sub>² = (v<sub>a</sub> cos φ + w)² + (v<sub>a</sub> sin φ)²', 'Expanding, v<sub>a</sub>²cos²φ + 2v<sub>a</sub>w cos φ + w² + v<sub>a</sub>²sin²φ, and cos²φ + sin²φ = 1 gives v<sub>g</sub>² = v<sub>a</sub>² + w² + 2v<sub>a</sub>w cos φ'],
      model: 'The drone’s velocity through the air has components v<sub>a</sub> cos φ along the wind and v<sub>a</sub> sin φ across it; the wind adds w along its own direction. So the ground velocity has components (v<sub>a</sub> cos φ + w) and v<sub>a</sub> sin φ, and v<sub>g</sub>² = (v<sub>a</sub> cos φ + w)² + (v<sub>a</sub> sin φ)² = v<sub>a</sub>²(cos²φ + sin²φ) + 2v<sub>a</sub>w cos φ + w² = v<sub>a</sub>² + w² + 2v<sub>a</sub>w cos φ.',
      notes: ['Adding the speeds, v<sub>a</sub> + w, only works when the two velocities point the same way: at any other heading they have to be added as vectors.'] });
  }
  if (extras.includes('across')) {
    parts.push({ kind: 'steps', ask: 'Next the pilot wants the drone to travel straight across the wind over the ground (at right angles to it). Using v<sub>a</sub> and your wind speed, at what heading <i>φ</i> must the drone point? (Its velocity through the air must cancel the wind along the wind’s direction.)', topic: T.wind,
      steps: [{ label: 'cos φ = −w ÷ v<sub>a</sub>', value: round(-w / va, 4), unit: '', tol: 0.06 }, { label: 'Heading φ', value: round(across, 2), unit: '°', tol: { abs: 1.5 } }],
      from: { part: P, value: (line) => { const ww = windFrom(line); return ww == null || ww >= va ? null : acos(-ww / va); }, tol: 0.02 },
      working: `Along the wind, v<sub>a</sub> cos φ + w = 0, so cos φ = −w ÷ v<sub>a</sub> = −${sig(w, 3)} ÷ ${va} = ${num(-w / va, 3)} and φ = cos⁻¹(${num(-w / va, 3)}) ≈ <b>${num(across, 1)}°</b>: a little upwind of straight across.` });
  }
  return {
    title: 'A drone in a steady wind',
    intro: `<p>A drone club tests how a steady wind affects one of its drones. The drone’s controller holds its <b>airspeed</b>, its speed through the air, at <i>v</i><sub>a</sub> = ${va} m/s. It flies straight runs at different headings <i>φ</i>, measured from the direction the wind blows toward: at φ = 0° it flies with the wind, at 180° straight into it. On each run its GPS records the <b>ground speed</b> <i>v</i><sub>g</sub>, its speed over the ground.</p><p>The drone’s velocity over the ground is its velocity through the air plus the wind’s velocity. Adding these gives the supplied model</p><p class="model"><span class="f">v<sub>g</sub>² = v<sub>a</sub>² + w² + 2v<sub>a</sub>w cos φ</span></p><p>where <i>w</i> is the speed of the wind. The club wants to use the data to find the wind’s speed.</p>`,
    figures: [figure(droneTriangle(), 'The velocities added tip to tail (not to scale)'), dataTable(['Heading <i>φ</i> (°)', 'Ground speed <i>v</i><sub>g</sub> (m/s)'], phi.map((p, i) => [String(p), fix(vg[i], 1)]), 'Ground speed on each run')],
    parts,
  };
}
// the drone's velocity through the air at φ to the wind's direction, the wind's velocity added to its tip, and the
// velocity over the ground
function droneTriangle() {
  const p = 52, a = [2.3 * cos(p), 2.3 * sin(p)], end = [a[0] + 1.1, a[1]];
  return diagram({
    lines: [{ from: [0, 0], to: [1.6, 0], dash: true }],
    arcs: [{ at: [0, 0], from: 0, to: p, r: 30, label: 'φ' }],
    arrows: [{ from: [0, 0], to: a, label: 'through the air', tone: 0, side: 1 }, { from: a, to: end, label: 'wind', tone: 1, side: 1 }, { from: [0, 0], to: end, label: 'over the ground', tone: 2, side: -1 }],
    notes: [{ at: [1.6, 0], text: 'the way the wind blows', anchor: 'end', dy: 16 }],
    w: 360, h: 230, label: 'The drone’s velocity through the air plus the wind’s velocity gives its velocity over the ground',
  });
}

// three force meters pull on a ring until it is still: the resultant of two of them by components, against the third
function balancesLab(d) {
  const best = d.int(0, 2), angles = d.shuffle([40, 50, 55, 65, 70, 80, 100, 110, 115, 125, 130, 140]).slice(0, 3);
  const sets = angles.map((tb, i) => {
    const FA = d.int(250, 650) / 100, FB = d.int(250, 650) / 100;
    const Rx = FA + FB * cos(tb), Ry = FB * sin(tb), R = hyp(Rx, Ry), tR = heading(Rx, Ry);
    // the set-up that agrees best is out by about 1.5% and a degree; the others by 3 to 4.5% and 2 or 3 degrees
    const off = (i === best ? d.int(14, 20) : d.int(30, 45)) / 1000 * (d.chance(0.5) ? 1 : -1);
    const FC = round(R * (1 + off), 2), tC = Math.round(tR + 180 + (i === best ? d.int(-1, 1) : d.pick([-3, -2, 2, 3])));
    return { FA, FB, tb, Rx, Ry, R, tR, FC, tC, pd: (Math.abs(FC - R) / R) * 100 };
  });
  const k = d.int(0, 2), K = sets[k];
  const extras = d.shuffle(['balance', 'error', 'still']).slice(0, 2);
  const parts = [
    { kind: 'table', ask: 'Process the data: for each set-up, use components to find the resultant <i>R</i> of the pulls of A and B (take string A along 0°), and the percent difference between the pull of C and <i>R</i>, taking <i>R</i> as the expected value.', topic: T.add,
      head: ['Set-up', '<i>R</i><sub>x</sub> (N)', '<i>R</i><sub>y</sub> (N)', '<i>R</i> (N)', 'Percent difference (%)'],
      rows: sets.map((_, i) => [String(i + 1), null, null, null, null]),
      fill: { 1: { values: sets.map((x) => round(x.Rx, 4)), tol: { abs: 0.03 }, unit: 'N' }, 2: { values: sets.map((x) => round(x.Ry, 4)), tol: { abs: 0.03 }, unit: 'N' },
        3: { values: sets.map((x) => round(x.R, 4)), tol: 0.01, unit: 'N' }, 4: { values: sets.map((x) => round(x.pd, 3)), tol: { abs: 0.3 }, unit: '%' } },
      working: `For set-up 1: R<sub>x</sub> = F<sub>A</sub> + F<sub>B</sub> cos θ<sub>B</sub> = ${fix(sets[0].FA, 2)} + ${fix(sets[0].FB, 2)} × cos ${sets[0].tb}° = ${num(sets[0].Rx, 2)} N, R<sub>y</sub> = F<sub>B</sub> sin θ<sub>B</sub> = ${fix(sets[0].FB, 2)} × sin ${sets[0].tb}° = ${num(sets[0].Ry, 2)} N, so R = √(${paren(sets[0].Rx)}² + ${num(sets[0].Ry)}²) = ${num(sets[0].R, 2)} N. Percent difference = |${fix(sets[0].FC, 2)} − ${num(sets[0].R, 2)}| ÷ ${num(sets[0].R, 2)} × 100% = ${num(sets[0].pd, 1)}%. The same for the others.` },
    { kind: 'steps', ask: `For set-up ${k + 1}, find the direction of the resultant of A and B, and the direction the model says string C should point (both counterclockwise from string A).`, topic: T.angle,
      steps: [{ label: 'Direction of R', value: round(K.tR, 2), unit: '°', tol: { abs: 1 } }, { label: 'Direction C should point', value: round(K.tR + 180, 2), unit: '°', tol: { abs: 1 } }],
      working: `tan⁻¹(R<sub>y</sub> ÷ R<sub>x</sub>) = tan⁻¹(${num(K.Ry)} ÷ ${paren(K.Rx)}) = ${num(atan(K.Ry, K.Rx), 1)}°${K.Rx < 0 ? `, but R<sub>x</sub> is negative, so R points up and to the left: add 180°, ${num(atan(K.Ry, K.Rx), 1)}° + 180° = ${num(K.tR, 1)}°` : ''}. So R points at ${num(K.tR, 1)}°, and C must point the opposite way: ${num(K.tR, 1)}° + 180° = <b>${num(K.tR + 180, 1)}°</b>. (The student measured ${K.tC}°.)` },
    { kind: 'choice', ask: 'Which set-up’s results agree best with the model?', choices: ['Set-up 1', 'Set-up 2', 'Set-up 3'], correct: best,
      explain: { ask: 'Explain how your processed data shows this.', lines: 3,
        points: [`Set-up ${best + 1} has the smallest percent difference between the pull of C and R (about ${num(sets[best].pd, 1)}%, against ${sets.filter((_, i) => i !== best).map((x) => `${num(x.pd, 1)}%`).join(' and ')})`, `So its measured pull of C is closest to the resultant of A and B, as the model says it should be (and its direction is within about ${Math.max(1, Math.round(Math.abs(sets[best].tC - sets[best].tR - 180)))}° of the opposite of R)`],
        model: `Set-up ${best + 1}. Its percent difference is the smallest, about ${num(sets[best].pd, 1)}%, so its measured pull of C (${fix(sets[best].FC, 2)} N) is closest to the resultant of A and B (${num(sets[best].R, 2)} N), and C points almost exactly opposite to that resultant.` } },
  ];
  if (extras.includes('balance')) {
    parts.push({ kind: 'written', ask: 'Explain why the pull of C should be <b>equal in size</b> to the resultant of A and B, and point the <b>opposite way</b>.', lines: 3, topic: T.balance,
      points: ['The ring is still, so the three pulls on it add to zero (their resultant is zero)', 'So C must cancel the resultant of A and B exactly: the same size, pointing in the opposite direction (180° from it)'],
      model: 'The ring stays still, so the forces on it are balanced: the three pulls add up to zero. A and B together act like their resultant R, so C has to cancel R exactly, with the same size in the opposite direction.' });
  }
  if (extras.includes('error')) {
    parts.push({ kind: 'written', ask: '<b>Identify one possible source of error</b> in the set-up, and say how it affects the results.', lines: 4,
      points: ['Names a specific source in the set-up itself: a force meter not zeroed before use, a string sloping up or down instead of lying flat along the table, a string not pointing through the centre of the ring, or the directions read from the table’s scale to only a degree or two', 'Says how it affects the results: a meter that reads 0.05 N with nothing pulling adds 0.05 N to every reading; a sloping string pulls partly up or down, so less of its reading pulls across the table'],
      model: 'One force meter might not read zero before it is used. If it reads 0.05 N with nothing pulling it, every reading it gives is 0.05 N too big, so the resultant of A and B (or the pull of C) is off and the percent differences come out larger.',
      notes: ['“Human error” or “reading the meters wrongly” earns nothing: name something in the set-up itself, and say what it does to the readings.'] });
  }
  if (extras.includes('still')) {
    parts.push({ kind: 'written', ask: 'Why must the ring be <b>still</b>, and <b>not touching the pin</b> at the centre, when the readings are taken?', lines: 3,
      points: ['If the pin touches the ring, it pushes on the ring too: a fourth force, so the three pulls would not have to balance', 'If the ring is still moving or speeding up, the pulls are not balanced, so the pull of C would not equal the resultant of A and B'],
      model: 'The model only works if the three pulls are the only forces and they balance. A pin touching the ring pushes on it as well, so A, B and C wouldn’t have to add to zero; and a ring that is still moving means the pulls aren’t balanced yet.' });
  }
  const S = sets[0];
  return {
    title: 'Three pulls on a ring',
    intro: '<p>A student ties three digital force meters, A, B and C, to a small ring in the middle of a table. They pull on the meters in different directions until the ring stays still without touching the pin at the centre, then record each meter’s reading and the direction of its string, measured counterclockwise from string A using the scale printed on the table. They do this for three different set-ups.</p><p>When the ring is still the three pulls balance, so the pull of C should be equal in size to the resultant of the pulls of A and B, and point the opposite way.</p>',
    figures: [figure(vectors([{ from: [0, 0], to: [S.FA, 0], label: 'A', tone: 0 }, { from: [0, 0], to: [S.FB * cos(S.tb), S.FB * sin(S.tb)], label: 'B', tone: 0 }, { from: [0, 0], to: [S.FC * cos(S.tC), S.FC * sin(S.tC)], label: 'C', tone: 1 }], { unit: 'N', axes: ['x', 'y'] }), 'Set-up 1 from above, the pulls to scale'),
      dataTable(['Set-up', 'A: pull (N)', 'B: pull (N)', 'B: direction (°)', 'C: pull (N)', 'C: direction (°)'], sets.map((x, i) => [String(i + 1), fix(x.FA, 2), fix(x.FB, 2), String(x.tb), fix(x.FC, 2), String(x.tC)]), 'String A points along 0° in every set-up')],
    parts,
  };
}

// an orienteering course walked leg by leg with a trundle wheel and a compass: each leg's components, the displacement
// and bearing from start to finish, the distance walked, and how the displacement compares with a GPS watch
function orienteeringLab(d) {
  const QUAD = [[25, 70], [105, 160], [200, 250], [290, 340]];
  const make = () => Array.from({ length: 3 }, () => { const [lo, hi] = d.pick(QUAD); return { b: d.int(lo, hi), len: d.int(110, 420) }; });
  const sum = (legs) => legs.reduce((a, l) => [a[0] + l.len * sin(l.b), a[1] + l.len * cos(l.b)], [0, 0]);
  // (the finish well away from the start, and not near due north, east, south or west of it)
  const good = (legs) => {
    const [e, n] = sum(legs), D = hyp(e, n), b = heading(n, e), total = legs.reduce((a, l) => a + l.len, 0);
    return D > 0.4 * total && Math.abs(e) > 40 && Math.abs(n) > 40 && [0, 90, 180, 270, 360].every((q) => Math.abs(b - q) > 10) && new Set(legs.map((l) => Math.floor(l.b / 90))).size >= 2;
  };
  let legs = null;
  for (let i = 0; i < 40 && !legs; i++) { const c = make(); if (good(c)) legs = c; }
  legs ??= [{ b: 52, len: 310 }, { b: 128, len: 240 }, { b: 64, len: 180 }];
  const E = legs.map((l) => l.len * sin(l.b)), N = legs.map((l) => l.len * cos(l.b));
  const e = E.reduce((a, x) => a + x, 0), n = N.reduce((a, x) => a + x, 0), D = hyp(e, n), B = heading(n, e), small = atan(Math.abs(e), Math.abs(n));
  const total = legs.reduce((a, l) => a + l.len, 0);
  const gps = Math.round(D * (1 + (d.int(20, 50) / 1000) * (d.chance(0.5) ? 1 : -1))), pd = (Math.abs(D - gps) / gps) * 100;
  const names = ['S → 1', '1 → 2', '2 → F'];
  const ew = (x) => (x < 0 ? 'west' : 'east'), ns = (x) => (x < 0 ? 'south' : 'north');
  const quarter = n >= 0 ? (e >= 0 ? `${num(small, 1)}°` : `360° − ${num(small, 1)}°`) : (e >= 0 ? `180° − ${num(small, 1)}°` : `180° + ${num(small, 1)}°`);
  const extras = d.shuffle(['gps', 'error', 'distance']).slice(0, 2);
  const parts = [
    { kind: 'table', ask: 'Process the data: find the <b>east</b> and <b>north</b> components of each leg. Use a negative number for a component pointing west or south.', topic: T.parts,
      head: ['Leg', 'Distance (m)', 'Bearing (°)', 'East (m)', 'North (m)'],
      rows: legs.map((l, i) => [names[i], String(l.len), bearing(l.b), null, null]),
      fill: { 3: { values: E.map((x) => round(x, 2)), tol: { abs: 1.5 }, unit: 'm' }, 4: { values: N.map((x) => round(x, 2)), tol: { abs: 1.5 }, unit: 'm' } },
      working: `East = d sin β and north = d cos β, with β the bearing. ${legs.map((l, i) => `${names[i]}: ${l.len} sin ${bearing(l.b)}° = ${num(E[i], 1)} m, ${l.len} cos ${bearing(l.b)}° = ${num(N[i], 1)} m`).join('. ')}. The signs take care of west and south.` },
    { kind: 'steps', ask: 'Add the components to find how far east and north of the start the finish is, then the size of the student’s <b>displacement</b>.', topic: T.add,
      steps: [{ label: 'Total east', value: round(e, 2), unit: 'm', tol: { abs: 3 } }, { label: 'Total north', value: round(n, 2), unit: 'm', tol: { abs: 3 } }, { label: 'Size of the displacement', value: round(D, 2), unit: 'm', tol: 0.01 }],
      working: `East: ${E.map((x, i) => (i ? paren(x, 1) : num(x, 1))).join(' + ')} = ${num(e, 1)} m. North: ${N.map((x, i) => (i ? paren(x, 1) : num(x, 1))).join(' + ')} = ${num(n, 1)} m. The two totals are at right angles, so the displacement is √(${paren(e, 1)}² + ${paren(n, 1)}²) = <b>${num(D, 1)} m</b>.` },
    { kind: 'steps', ask: 'Find the <b>bearing</b> of the finish from the start.', topic: T.angle,
      steps: [{ label: 'The angle between the displacement and the north–south line, tan⁻¹(|east| ÷ |north|)', value: round(small, 2), unit: '°', tol: { abs: 1.5 } }, { label: 'Bearing of F from S', value: round(B, 2), unit: '°', tol: { abs: 1.5 } }],
      working: `tan⁻¹(${num(Math.abs(e), 1)} ÷ ${num(Math.abs(n), 1)}) = ${num(small, 1)}°. The finish is ${ns(n)} and ${ew(e)} of the start, so the bearing, clockwise from north, is ${quarter} = <b>${bearing(B)}°</b> (${num(B, 1)}°).` },
  ];
  if (extras.includes('distance')) {
    parts.push({ kind: 'number', ask: 'What total <b>distance</b> did the student walk?', value: total, unit: 'm', tol: 0.005, topic: T.path,
      working: `Distance adds up every leg, whatever its direction: ${legs.map((l) => l.len).join(' + ')} = <b>${total} m</b>.` });
    parts.push({ kind: 'choice', ask: 'For the whole course, which is larger: the student’s <b>average speed</b> or the size of their <b>average velocity</b>?', topic: T.path,
      choices: ['The average speed', 'The size of the average velocity', 'They are the same'], correct: 0,
      explain: { ask: 'Explain why.', lines: 3,
        points: ['Average speed is the distance walked ÷ time and average velocity is the displacement ÷ time, over the same time', `The legs change direction, so the distance (${total} m) is longer than the straight-line displacement (${num(D, 0)} m), and the average speed is larger`],
        model: `The average speed. It uses the distance walked, ${total} m, while the average velocity uses the displacement, only ${num(D, 0)} m in a straight line, and both are divided by the same time. The distance is longer because the legs change direction.`,
        notes: ['“Velocity has a direction” on its own doesn’t say which is larger: compare the distance with the displacement.'] } });
  }
  if (extras.includes('gps')) {
    parts.push({ kind: 'steps', ask: `The GPS watch measured the straight-line distance from S to F as ${gps} m. Find the percent difference between your displacement and the GPS reading, taking the GPS reading as the expected value.`,
      steps: [{ label: 'Difference from the GPS reading', value: round(Math.abs(D - gps), 2), unit: 'm', tol: { abs: 1.5 } }, { label: 'Percent difference', value: round(pd, 3), unit: '%', tol: { abs: 0.4 } }],
      working: `|${num(D, 1)} − ${gps}| = ${num(Math.abs(D - gps), 1)} m, and ${num(Math.abs(D - gps), 1)} ÷ ${gps} × 100% ≈ <b>${num(pd, 1)}%</b>.` });
  }
  if (extras.includes('error')) {
    parts.push({ kind: 'written', ask: '<b>Identify one possible source of error</b> in how the legs were measured, and say how it affects the result.', lines: 4,
      points: ['Names a specific source in the set-up itself: the compass read to only a degree or two, or pulled off north by a metal fence or bench; the trundle wheel slipping on wet grass or rolling over bumps and roots; or not walking in a straight line along each bearing', 'Says how it affects the result: a bearing 2° out moves the end of a 300 m leg about 10 m sideways; bumps and wandering make the measured legs longer than the straight distances, so the displacement comes out too big'],
      model: 'The trundle wheel rolls over bumps, roots and tufts of grass, so it measures more than the straight-line length of each leg. Every leg comes out a little too long, so the calculated displacement is larger than the real one.',
      notes: ['“Human error” earns nothing: name something in how the legs were measured, and say what it does to the result.'] });
  }
  const at = legs.reduce((pts, l, i) => [...pts, [pts[i][0] + E[i], pts[i][1] + N[i]]], [[0, 0]]);
  return {
    title: 'An orienteering course',
    intro: '<p>On an orienteering course, a student walks from the start S past two checkpoints to the finish F, in a straight line from each point to the next. For each leg they measure the distance with a trundle wheel and the bearing with a compass. The student wants to use these measurements to find how far the finish is from the start, and in what direction.</p>',
    guide: '<ul><li>A bearing is measured clockwise from north, from 000° to 360°: east is 090°, south 180°, west 270°.</li><li>A leg of length d on a bearing β goes <span class="f">d sin β</span> east and <span class="f">d cos β</span> north (a negative answer means west or south).</li></ul>',
    figures: [dataTable(['Leg', 'Distance (m)', 'Bearing (°)'], legs.map((l, i) => [names[i], String(l.len), bearing(l.b)]), 'The legs as measured'),
      figure(vectors(legs.map((l, i) => ({ from: at[i], to: at[i + 1], tone: i === 1 ? 1 : 0 })), { unit: 'm', axes: ['east', 'north'], points: [[0, 0, 'S'], [at[1][0], at[1][1], '1'], [at[2][0], at[2][1], '2'], [at[3][0], at[3][1], 'F']] }), 'A map of the course, drawn to scale')],
    parts,
  };
}

// ---------- 2. problems ----------

// crossing a river: pointing straight across (time, drift, velocity over the riverbed), pointing upstream to land
// opposite, which is quicker, and pointing partly upstream
function riverProblem(d) {
  const who = d.pick([
    { name: 'A kayaker', it: 'she', its: 'her', them: 'her', vb: [1.2, 1.5, 1.6, 1.8, 2, 2.4], W: [40, 45, 60, 75, 90] },
    { name: 'A small passenger ferry', it: 'it', its: 'its', them: 'it', vb: [3, 3.5, 4, 4.5, 5], W: [150, 180, 200, 240, 300] },
    { name: 'A rescue boat', it: 'it', its: 'its', them: 'it', vb: [5, 6, 7, 8], W: [80, 100, 120, 160] },
  ]);
  const vb = d.pick(who.vb), W = d.pick(who.W), vc = round(vb * d.pick([0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6]), 1);
  const It = who.it[0].toUpperCase() + who.it.slice(1), the = who.name.replace(/^A /, 'the ');
  const tA = W / vb, xA = vc * tA, vbank = hyp(vb, vc), aA = atan(vc, vb), path = hyp(W, xA);
  const aB = asin(vc / vb), across = Math.sqrt(vb * vb - vc * vc), tB = W / across;
  // pointing partly upstream: half the angle that lands it opposite, to the nearest 5° (at least 5°)
  const al = Math.max(5, Math.round(aB / 2 / 5) * 5), acA = vb * cos(al), dnA = vc - vb * sin(al), xC = (dnA * W) / acA;
  const bank = d.chance(0.5), tail = d.pick([['quick'], ['angled'], ['quick', 'angled']]);
  const parts = [
    { kind: 'steps', ask: `First ${who.it} points straight across. How long does the crossing take, and how far downstream of the point directly opposite does ${who.it} land?`, topic: T.river,
      steps: [{ label: 'Time to cross', value: round(tA, 3), unit: 's', tol: 0.01 }, { label: 'Distance downstream', value: round(xA, 3), unit: 'm', tol: 0.01 }],
      working: `Only ${who.its} own velocity, straight across, carries ${who.them} to the far bank: t = ${W} ÷ ${num(vb)} = ${num(tA)} s. All that time the current carries ${who.them} downstream: ${num(vc)} × ${num(tA)} = <b>${num(xA)} m</b>.` },
    bank
      ? { kind: 'number', ask: `What is ${who.its} <b>speed relative to the riverbank</b> as ${who.it} crosses?`, value: round(vbank, 3), unit: 'm/s', tol: 0.01, topic: T.square,
        working: `${who.its[0].toUpperCase() + who.its.slice(1)} velocity through the water (${num(vb)} m/s across) and the current (${num(vc)} m/s downstream) are at right angles: √(${num(vb)}² + ${num(vc)}²) = <b>${num(vbank)} m/s</b>.` }
      : { kind: 'number', ask: `How far does ${who.it} actually travel, in a straight line, from where ${who.it} starts to where ${who.it} lands?`, value: round(path, 2), unit: 'm', tol: 0.01, topic: T.square,
        working: `${It} goes ${W} m across and ${num(xA)} m downstream, at right angles: √(${W}² + ${paren(xA)}²) = <b>${num(path)} m</b>.` },
    { kind: 'number', ask: `At what angle to the straight-across direction does ${who.it} actually move?`, value: round(aA, 2), unit: '°', tol: { abs: 0.5 }, topic: T.angle,
      working: `tan θ = downstream ÷ across = ${num(vc)} ÷ ${num(vb)}${bank ? '' : ` (or ${num(xA)} ÷ ${W})`}, so θ = tan⁻¹(${num(vc / vb, 3)}) = <b>${num(aA, 1)}°</b> downstream of straight across.` },
    { kind: 'steps', ask: `Next time ${who.it} must land <b>directly opposite</b> the start. At what angle upstream of straight across must ${who.it} point, how fast does ${who.it} then move across the river, and how long does the crossing take?`, topic: T.river,
      steps: [{ label: 'Angle upstream of straight across', value: round(aB, 2), unit: '°', tol: { abs: 0.5 } }, { label: 'Speed across the river', value: round(across, 3), unit: 'm/s', tol: 0.01 }, { label: 'Time to cross', value: round(tB, 3), unit: 's', tol: 0.01 }],
      working: `The upstream part of ${who.its} velocity must cancel the current: ${num(vb)} sin θ = ${num(vc)}, so θ = sin⁻¹(${num(vc)} ÷ ${num(vb)}) = ${num(aB, 1)}°. What is left across the river is ${num(vb)} cos ${num(aB, 1)}° = √(${num(vb)}² − ${num(vc)}²) = ${num(across)} m/s, so t = ${W} ÷ ${num(across)} = <b>${num(tB)} s</b>.` },
  ];
  if (tail.includes('quick')) {
    parts.push({ kind: 'choice', ask: 'Which way of crossing takes <b>less time</b>?', topic: T.river,
      choices: ['Pointing straight across', 'Pointing upstream to land opposite', 'Both take the same time'], correct: 0,
      explain: { ask: 'Explain why.', lines: 4,
        points: [`Pointing straight across, all of ${who.its} ${num(vb)} m/s through the water carries ${who.them} across, and the current, at right angles to that, doesn’t slow the crossing (${num(tA)} s)`, `Pointing upstream, part of ${who.its} velocity goes into cancelling the current, leaving only ${num(across)} m/s across, so the crossing takes longer (${num(tB)} s)`],
        model: `Pointing straight across. Then all of ${who.its} ${num(vb)} m/s carries ${who.them} across, and the current only moves ${who.them} downstream, at right angles, so it can’t slow the crossing: ${num(tA)} s. Pointing upstream, part of ${who.its} velocity is used to cancel the current, so only ${num(across)} m/s is left for crossing and it takes ${num(tB)} s.`,
        notes: ['“The current slows it down” is wrong: the current never acts across the river. What costs time is pointing partly upstream.'] } });
  }
  if (tail.includes('angled')) {
    parts.push({ kind: 'steps', ask: `Suppose instead ${who.it} points ${al}° upstream of straight across. Using components, how far downstream of the point directly opposite does ${who.it} land?`, topic: T.add,
      steps: [{ label: `Speed across, ${num(vb)} cos ${al}°`, value: round(acA, 4), unit: 'm/s', tol: 0.01 }, { label: `Speed downstream, ${num(vc)} − ${num(vb)} sin ${al}°`, value: round(dnA, 4), unit: 'm/s', tol: 0.02 }, { label: 'Distance downstream', value: round(xC, 3), unit: 'm', tol: 0.02 }],
      working: `Across: ${num(vb)} cos ${al}° = ${num(acA, 3)} m/s, so the crossing takes ${W} ÷ ${num(acA, 3)} = ${num(W / acA)} s. Downstream: the current’s ${num(vc)} m/s minus ${who.its} upstream part ${num(vb)} sin ${al}° = ${num(vb * sin(al), 3)} m/s leaves ${num(dnA, 3)} m/s. So ${who.it} lands ${num(dnA, 3)} × ${num(W / acA)} = <b>${num(xC)} m</b> downstream.` });
  }
  return {
    title: 'Crossing a river',
    intro: `<p>${who.name} crosses a river ${W} m wide, with straight, parallel banks. Through still water ${who.it} moves at ${num(vb)} m/s, and the river flows at a steady ${num(vc)} m/s.</p>`,
    figures: [figure(vectors([{ from: [0, 0], to: [0, vb], label: `${num(vb)} m/s`, tone: 0 }, { from: [0, 0], to: [vc, 0], label: `${num(vc)} m/s`, tone: 1 }], { unit: 'm/s', axes: ['downstream', 'across'] }), `Pointing straight across: ${the}’s velocity through the water and the current’s velocity, to scale`)],
    parts,
  };
}

// a plane (or a drone) in a crosswind: pointing straight at where it's going (ground speed, direction, how far off
// course it ends up), pointing into the wind to fly straight there, the trip back, and a wind at 45°
function crosswindProblem(d) {
  const craft = d.pick([
    { name: 'A light aircraft', it: 'the plane', va: [160, 180, 200, 220, 240], w: [30, 36, 40, 45, 50, 60], D: [90, 120, 150, 180, 210], from: 'an airfield', start: 'airfield', to: 'a town', end: 'town' },
    { name: 'A medical delivery drone', it: 'the drone', va: [54, 60, 72, 80], w: [12, 15, 18, 20, 24], D: [6, 8, 9, 12, 15], from: 'a hospital', start: 'hospital', to: 'a clinic', end: 'clinic' },
  ]);
  const va = d.pick(craft.va), w = d.pick(craft.w), D = d.pick(craft.D);
  const DIR = ['north', 'east', 'south', 'west'], r = d.int(0, 3), q = (r + (d.chance(0.5) ? 1 : 3)) % 4;
  const route = DIR[r], toward = DIR[q], against = DIR[(q + 2) % 4], back = DIR[(r + 2) % 4];
  // the compass point halfway between two that are at right angles: north or south first
  const between = (a, b) => (a % 2 === 0 ? `${DIR[a]}-${DIR[b]}` : `${DIR[b]}-${DIR[a]}`);
  const vgA = hyp(va, w), aA = atan(w, va), tA = D / va, off = w * tA;
  const aB = asin(w / va), vgB = Math.sqrt(va * va - w * w), tB = (D / vgB) * 60;
  const tailwind = d.chance(0.5), diag = between(tailwind ? r : (r + 2) % 4, q);
  const along = va + (tailwind ? 1 : -1) * w * cos(45), side = w * sin(45), vgC = hyp(along, side);
  const tail = d.pick([['back'], ['diag'], ['back', 'diag']]);
  const It = craft.it[0].toUpperCase() + craft.it.slice(1);
  const parts = [
    { kind: 'number', ask: `First the pilot points ${craft.it} straight at the ${craft.end}, due ${route}. What is its <b>speed over the ground</b>?`, value: round(vgA, 2), unit: 'km/h', tol: 0.01, topic: T.wind,
      working: `${It}’s velocity through the air (${va} km/h ${route}) and the wind (${w} km/h ${toward}) are at right angles: √(${va}² + ${w}²) = <b>${num(vgA, 1)} km/h</b>.` },
    { kind: 'number', ask: `In what direction does it actually travel? Give the angle ${toward} of ${route}.`, value: round(aA, 2), unit: '°', tol: { abs: 0.5 }, topic: T.angle,
      working: `tan θ = ${w} ÷ ${va}, so θ = tan⁻¹(${num(w / va, 3)}) = <b>${num(aA, 1)}°</b> ${toward} of ${route}.` },
    { kind: 'steps', ask: `Still pointing due ${route}, how long does ${craft.it} take to travel ${D} km ${route}, and how far ${toward} of the ${craft.end} is it then?`, topic: T.wind,
      steps: [{ label: 'Time, in hours', value: round(tA, 4), unit: 'h', tol: 0.01 }, { label: `Distance ${toward} of the ${craft.end}`, value: round(off, 3), unit: 'km', tol: 0.01 }],
      working: `Its ${route}ward speed is its own ${va} km/h (the wind only pushes it ${toward}), so t = ${D} ÷ ${va} = ${num(tA, 3)} h. In that time the wind carries it ${w} × ${num(tA, 3)} = <b>${num(off)} km</b> ${toward}.` },
    { kind: 'steps', ask: `To fly in a straight line to the ${craft.end}, the pilot points ${craft.it} partly into the wind. At what angle ${against} of ${route} must it point, what is its ground speed then, and how many <b>minutes</b> does the trip take?`, topic: T.wind,
      steps: [{ label: `Angle ${against} of ${route}`, value: round(aB, 2), unit: '°', tol: { abs: 0.5 } }, { label: 'Ground speed', value: round(vgB, 2), unit: 'km/h', tol: 0.01 }, { label: 'Time for the trip', value: round(tB, 2), unit: 'min', tol: 0.01 }],
      working: `The ${against}ward part of its velocity must cancel the wind: ${va} sin θ = ${w}, so θ = sin⁻¹(${w} ÷ ${va}) = ${num(aB, 1)}°. What is left due ${route} is √(${va}² − ${w}²) = ${num(vgB, 1)} km/h, so the trip takes ${D} ÷ ${num(vgB, 1)} = ${num(D / vgB, 3)} h = <b>${num(tB, 1)} min</b>.` },
  ];
  if (tail.includes('back')) {
    parts.push({ kind: 'choice', ask: `${It} flies straight back to the ${craft.start}, due ${back}, in the same wind. Compared with the trip out in a straight line, the trip back takes`, topic: T.wind,
      choices: ['more time', 'less time', 'the same time'], correct: 2,
      explain: { ask: 'Explain why.', lines: 4,
        points: [`The wind still blows at right angles to the route, so the pilot points ${craft.it} ${num(aB, 1)}° ${against} of ${back} to cancel it, the same angle as before`, `The part left along the route is again √(${va}² − ${w}²) = ${num(vgB, 1)} km/h, so the trip takes the same ${num(tB, 1)} minutes`],
        model: `The same time. Going ${back}, the wind still blows across the route, so the pilot points the same ${num(aB, 1)}° into it (now ${against} of ${back}). That leaves the same ${num(vgB, 1)} km/h along the route, so the ${D} km take the same ${num(tB, 1)} minutes. A crosswind slows the trip equally both ways.`,
        notes: ['Saying the wind “helps one way” is wrong here: it blows across the route, so it neither helps nor hinders along it.'] } });
  }
  if (tail.includes('diag')) {
    parts.push({ kind: 'steps', ask: `Another day the wind blows toward the <b>${diag}</b> at ${w} km/h (45° between ${tailwind ? route : back} and ${toward}). If the pilot points ${craft.it} due ${route}, what is its ground speed? Use components.`, topic: T.add,
      steps: [{ label: `Part of the ground velocity due ${route}`, value: round(along, 3), unit: 'km/h', tol: 0.01 }, { label: `Part due ${toward}`, value: round(side, 3), unit: 'km/h', tol: 0.01 }, { label: 'Ground speed', value: round(vgC, 3), unit: 'km/h', tol: 0.01 }],
      working: `The wind’s parts: ${w} cos 45° = ${num(w * cos(45), 1)} km/h ${tailwind ? route : back} and ${w} sin 45° = ${num(side, 1)} km/h ${toward}. Due ${route}: ${tailwind ? `${va} + ${num(w * cos(45), 1)}` : `${va} − ${num(w * cos(45), 1)}`} = ${num(along, 1)} km/h. So the ground speed is √(${num(along, 1)}² + ${num(side, 1)}²) = <b>${num(vgC, 1)} km/h</b>.` });
  }
  return {
    title: 'Flying in a crosswind',
    intro: `<p>${craft.name} flies from ${craft.from} to ${craft.to} ${D} km due ${route}. Its airspeed, its speed through the air, is ${va} km/h. A steady wind blows toward the ${toward} (from the ${against}) at ${w} km/h.</p>`,
    figures: [figure(vectors([{ from: [0, 0], to: unitDir(r, va), label: `${va} km/h`, tone: 0 }, { from: [0, 0], to: unitDir(q, w), label: `${w} km/h`, tone: 1 }], { unit: 'km/h', axes: ['east', 'north'] }), `Pointing due ${route}: ${craft.it}’s velocity through the air and the wind’s velocity, to scale`)],
    parts,
  };
}
// a vector of size v pointing north, east, south or west (0 to 3)
const unitDir = (k, v) => [[0, v], [v, 0], [0, -v], [-v, 0]][k];

// two pulls on either side of a line: their components, the resultant's size and direction, and the force that holds
// the load still
function forcesProblem(d) {
  const c = d.pick([
    { what: 'Two tugboats pull a cargo ship away from a dock', A: 'Tug A', B: 'Tug B', unit: 'kN', F1: [40, 45, 50, 60, 70, 80], F2: [30, 35, 40, 50, 55, 65], held: 'Until its last mooring rope is untied, the rope holds the ship still', holder: 'the mooring rope' },
    { what: 'Two tow trucks pull a car out of a muddy field with ropes', A: 'Rope A', B: 'Rope B', unit: 'N', F1: [1200, 1500, 1800, 2000, 2400], F2: [900, 1000, 1200, 1400, 1600], held: 'At first the car doesn’t move: the mud holds it still', holder: 'the mud' },
    { what: 'Two people pull on ropes to drag a tree stump out of the ground', A: 'Rope A', B: 'Rope B', unit: 'N', F1: [600, 750, 800, 900, 1000], F2: [400, 450, 500, 600, 700], held: 'At first the stump doesn’t move: its roots hold it still', holder: 'the roots' },
  ]);
  let F1, F2, al, be, Rx, Ry;
  for (let i = 0; i < 30; i++) {
    F1 = d.pick(c.F1); F2 = d.pick(c.F2); al = d.pick([15, 20, 25, 30, 35, 40]); be = d.pick([10, 15, 20, 25, 30, 35, 45]);
    Rx = F1 * cos(al) + F2 * cos(be); Ry = F1 * sin(al) - F2 * sin(be);
    if (al !== be && Math.abs(Ry) > 0.08 * hyp(Rx, Ry)) break;
  }
  if (!(al !== be && Math.abs(Ry) > 0.08 * hyp(Rx, Ry))) { F1 = c.F1[2]; F2 = c.F2[1]; al = 30; be = 15; Rx = F1 * cos(al) + F2 * cos(be); Ry = F1 * sin(al) - F2 * sin(be); }
  const u = c.unit, R = hyp(Rx, Ry), th = atan(Math.abs(Ry), Rx), side = Ry > 0 ? 'north' : 'south', opp = Ry > 0 ? 'south' : 'north';
  const dirs = [`${num(th, 1)}° ${opp} of west`, `${num(th, 1)}° ${side} of east`, `${num(th, 1)}° ${side} of west`, `${num(th, 1)}° ${opp} of east`];
  const q = oneOf(d, dirs[0], dirs.slice(1));
  const why = d.chance(0.5);
  const parts = [
    { kind: 'table', ask: 'Find the <b>east</b> and <b>north</b> components of each pull. Use a negative number for a component pointing south.', topic: T.parts,
      head: ['Pull', `Size (${u})`, 'Direction', `East (${u})`, `North (${u})`],
      rows: [[c.A, num(F1), `${al}° north of east`, null, null], [c.B, num(F2), `${be}° south of east`, null, null]],
      fill: { 3: { values: [round(F1 * cos(al), 3), round(F2 * cos(be), 3)], tol: 0.015, unit: u }, 4: { values: [round(F1 * sin(al), 3), round(-F2 * sin(be), 3)], tol: 0.015, unit: u } },
      working: `${c.A}: ${num(F1)} cos ${al}° = ${num(F1 * cos(al), 1)} ${u} east, ${num(F1)} sin ${al}° = ${num(F1 * sin(al), 1)} ${u} north. ${c.B}: ${num(F2)} cos ${be}° = ${num(F2 * cos(be), 1)} ${u} east, and ${num(F2)} sin ${be}° = ${num(F2 * sin(be), 1)} ${u} south, so its north component is ${num(-F2 * sin(be), 1)} ${u}.` },
    { kind: 'steps', ask: 'Add the components to find the resultant of the two pulls: its east part, its north part and its size.', topic: T.add,
      steps: [{ label: 'East part of the resultant', value: round(Rx, 3), unit: u, tol: 0.01 }, { label: 'North part of the resultant', value: round(Ry, 3), unit: u, tol: { abs: round(0.015 * R, 2) } }, { label: 'Size of the resultant', value: round(R, 3), unit: u, tol: 0.01 }],
      working: `East: ${num(F1 * cos(al), 1)} + ${num(F2 * cos(be), 1)} = ${num(Rx, 1)} ${u}. North: ${plus(F1 * sin(al), -F2 * sin(be), 1)} = ${num(Ry, 1)} ${u}. They are at right angles, so R = √(${num(Rx, 1)}² + ${paren(Ry, 1)}²) = <b>${num(R, 1)} ${u}</b>.` },
    { kind: 'number', ask: 'How many degrees north or south of east does the resultant point?', value: round(th, 2), unit: '°', tol: { abs: 0.5 }, topic: T.angle,
      working: `tan θ = |north part| ÷ east part = ${num(Math.abs(Ry), 1)} ÷ ${num(Rx, 1)}, so θ = <b>${num(th, 1)}°</b>, ${side} of east because the north part is ${Ry > 0 ? 'positive' : 'negative'}.` },
    { kind: 'number', ask: `${c.held}. What is the size of the force from ${c.holder}?`, value: round(R, 3), unit: u, tol: 0.01, topic: T.balance,
      working: `Still means the forces add to zero, so ${c.holder} must cancel the resultant exactly: the same size, <b>${num(R, 1)} ${u}</b>.` },
    { kind: 'choice', ask: `In which direction does the force from ${c.holder} act?`, topic: T.balance, ...q,
      explain: { ask: 'Explain briefly.', lines: 2,
        points: [`The forces add to zero, so this force points exactly opposite to the resultant (${num(th, 1)}° ${side} of east): ${num(th, 1)}° ${opp} of west`],
        model: `${num(th, 1)}° ${opp} of west. To cancel the resultant it must point the opposite way, which turns east into west and ${side} into ${opp}.` } },
  ];
  if (why) {
    parts.push({ kind: 'written', ask: `Explain why the resultant is less than the two pulls added together (${num(F1)} + ${num(F2)} = ${num(F1 + F2)} ${u}).`, lines: 3, topic: T.add,
      points: ['The pulls point in different directions, so they add as vectors, not like ordinary numbers: only their east components add in full', `Their north–south components point opposite ways (${c.A} north, ${c.B} south), so they partly cancel, and the resultant is smaller than ${num(F1 + F2)} ${u}`],
      model: `The pulls aren’t in the same direction, so they don’t simply add. Their east components add (${num(Rx, 1)} ${u}), but ${c.A} pulls partly north and ${c.B} partly south, so those components partly cancel. What’s left, ${num(R, 1)} ${u}, is less than ${num(F1 + F2)} ${u}.` });
  } else {
    parts.push({ kind: 'choice', ask: `If ${c.B} moved round to pull due east with the same force, would the resultant be bigger, smaller or the same?`, topic: T.add,
      choices: ['Bigger', 'Smaller', 'The same'], correct: 0,
      explain: { ask: 'Explain why.', lines: 3,
        points: [`Pulling due east, all of ${c.B}’s ${num(F2)} ${u} would add to the east part, instead of only ${num(F2 * cos(be), 1)} ${u}`, `The angle between the two pulls would be smaller (${al}° instead of ${al + be}°), so less of one pull works against the other`],
        model: `Bigger. Due east, the whole of ${c.B}’s pull adds to the east part instead of just ${num(F2 * cos(be), 1)} ${u}, and none of it is lost pointing south against ${c.A}’s north component. The smaller the angle between two pulls, the bigger their resultant.` } });
  }
  return {
    title: 'Two pulls at angles',
    intro: `<p>${c.what}. ${c.A} pulls with ${num(F1)} ${u} at ${al}° north of east, and ${c.B} with ${num(F2)} ${u} at ${be}° south of east.</p>`,
    figures: [figure(vectors([{ from: [0, 0], to: [F1 * cos(al), F1 * sin(al)], label: `${c.A.split(' ')[1]}: ${num(F1)} ${u}`, tone: 0 }, { from: [0, 0], to: [F2 * cos(be), -F2 * sin(be)], label: `${c.B.split(' ')[1]}: ${num(F2)} ${u}`, tone: 1 }], { unit: u, axes: ['east', 'north'] }), 'The two pulls seen from above, to scale')],
    parts,
  };
}

// the change in velocity when something bounces off a wall at an angle or turns a corner: the velocities in
// components, Δv = after − before, its size and direction, and the average acceleration
function turnProblem(d) {
  const parts = [];
  let title, intro, fig;
  if (d.chance(0.5)) {
    // a puck bouncing off the boards: along them it keeps f of its speed, straight out it leaves with e of the speed in
    const u = d.pick([12, 15, 16, 18, 20, 24]), th = d.pick([25, 30, 35, 40, 50, 55]), f = d.pick([0.85, 0.9, 0.95]), e = d.pick([0.5, 0.6, 0.7, 0.8]), ms = d.pick([4, 5, 6, 8]);
    const b = [u * cos(th), -u * sin(th)], a = [f * u * cos(th), e * u * sin(th)], dv = [a[0] - b[0], a[1] - b[1]], DV = hyp(dv[0], dv[1]);
    const back = atan(Math.abs(dv[0]), dv[1]), acc = DV / (ms / 1000), after = hyp(a[0], a[1]);
    title = 'A puck bouncing off the boards';
    intro = `<p>An ice hockey puck slides across the ice at ${u} m/s and hits the boards at the edge of the rink at ${th}° to them. In the bounce, the part of its velocity along the boards drops to ${pct(f)} of what it was, and the part straight into the boards is reversed: the puck leaves with ${pct(e)} of that part, straight out from the boards. The puck touches the boards for ${ms} ms.</p><p>Take <b>i</b> along the boards, the way the puck slides along them, and <b>j</b> straight out from the boards.</p>`;
    fig = figure(vectors([{ from: [0, 0], to: b, label: 'before', tone: 0 }, { from: [0, 0], to: a, label: 'after', tone: 1 }], { unit: 'm/s', axes: ['along the boards', 'out from the boards'] }), 'The puck’s velocity before and after the bounce, to scale');
    parts.push(
      { kind: 'table', ask: 'Write the puck’s velocity <b>before</b> and <b>after</b> the bounce in components.', topic: T.ij,
        head: ['', '<b>i</b>-component (m/s)', '<b>j</b>-component (m/s)'], rows: [['Before', null, null], ['After', null, null]],
        fill: { 1: { values: [round(b[0], 3), round(a[0], 3)], tol: 0.015, unit: 'm/s' }, 2: { values: [round(b[1], 3), round(a[1], 3)], tol: 0.015, unit: 'm/s' } },
        working: `Before: ${u} cos ${th}° = ${num(b[0])} m/s along the boards and ${u} sin ${th}° = ${num(-b[1])} m/s into them, so v = (${num(b[0])}<b>i</b> − ${num(-b[1])}<b>j</b>) m/s. After: ${pct(f)} of ${num(b[0])} is ${num(a[0])}, and ${pct(e)} of ${num(-b[1])} is ${num(a[1])}, now outward: v = (${num(a[0])}<b>i</b> + ${num(a[1])}<b>j</b>) m/s.` },
      { kind: 'steps', ask: 'Find the change in velocity, <b>Δv = v<sub>after</sub> − v<sub>before</sub></b>: its <b>i</b> and <b>j</b> parts, and its size.', topic: T.change,
        steps: [{ label: '<b>i</b> part of Δv', value: round(dv[0], 3), unit: 'm/s', tol: { abs: 0.05 } }, { label: '<b>j</b> part of Δv', value: round(dv[1], 3), unit: 'm/s', tol: 0.01 }, { label: 'Size of Δv', value: round(DV, 3), unit: 'm/s', tol: 0.01 }],
        working: `<b>i</b>: ${minus(a[0], b[0])} = ${num(dv[0])} m/s. <b>j</b>: ${num(a[1])} − (${num(b[1])}) = ${num(a[1])} + ${num(-b[1])} = ${num(dv[1])} m/s. Size: √(${paren(dv[0])}² + ${num(dv[1])}²) = <b>${num(DV)} m/s</b>.` },
      { kind: 'number', ask: 'Δv points almost straight out from the boards. By how many degrees is it tilted back from straight out (against the way the puck slides)?', value: round(back, 2), unit: '°', tol: { abs: 0.5 }, topic: T.angle,
        working: `tan θ = |<b>i</b> part| ÷ <b>j</b> part = ${num(Math.abs(dv[0]))} ÷ ${num(dv[1])}, so θ = <b>${num(back, 1)}°</b>.` },
      { kind: 'steps', ask: 'Find the size of the puck’s <b>average acceleration</b> while it touches the boards.', topic: T.change,
        steps: [{ label: 'Time in seconds', value: ms / 1000, unit: 's', tol: 0.001 }, { label: 'Average acceleration', value: round(acc, 1), unit: 'm/s²', tol: 0.02 }],
        working: `${ms} ms = ${num(ms / 1000, 3)} s, so a = Δv ÷ Δt = ${num(DV)} ÷ ${num(ms / 1000, 3)} ≈ <b>${num(acc, 0)} m/s²</b>.` },
      { kind: 'written', ask: `The puck’s speed only drops from ${u} m/s to ${num(after, 2)} m/s, but its velocity changes by ${num(DV, 2)} m/s. <b>Explain</b> why the change in velocity is so much bigger.`, lines: 4, topic: T.kinds,
        points: [`Velocity is a vector: the part straight into the boards (${num(-b[1])} m/s) is reversed to ${num(a[1])} m/s straight out`, `So the change in that direction adds the two, ${num(-b[1])} + ${num(a[1])} = ${num(dv[1])} m/s, while the speed, a size only, just drops a little`],
        model: `Speed only measures how fast, but velocity includes the direction. Straight into the boards the puck went from ${num(-b[1])} m/s in to ${num(a[1])} m/s out: a reversal, so that part of the velocity changes by ${num(-b[1])} + ${num(a[1])} = ${num(dv[1])} m/s. The speed, which ignores direction, only drops from ${u} to ${num(after)} m/s.`,
        notes: [`Subtracting the speeds (${u} − ${num(after)}) is the mistake the question is about: subtract the velocities as vectors.`] });
  } else {
    // a cyclist (or a car) going round a bend: east at v1, then at v2 on a new heading, the turn taking t seconds
    const who = d.pick([{ name: 'A cyclist', v1: [6, 7, 8, 9, 10], v2: [5, 6, 7, 8] }, { name: 'A car', v1: [12, 14, 15, 16, 18], v2: [10, 12, 14, 15] }]);
    const v1 = d.pick(who.v1), v2 = d.chance(0.35) ? v1 : d.pick(who.v2), turn = d.pick([50, 60, 70, 80, 100, 110, 120]), t = d.pick([2, 2.5, 3, 4, 5]);
    const b = [v1, 0], a = [v2 * cos(turn), v2 * sin(turn)], dv = [a[0] - b[0], a[1] - b[1]], DV = hyp(dv[0], dv[1]), dir = atan(dv[1], Math.abs(dv[0])), acc = DV / t;
    const newHeading = turn < 90 ? `${turn}° north of east` : `${180 - turn}° north of west`;
    title = 'Round a bend';
    intro = `<p>${who.name} travels due east at ${v1} m/s, then goes round a bend onto a road heading ${newHeading}, travelling at ${v2} m/s. The turn takes ${num(t)} s.</p>`;
    fig = figure(vectors([{ from: [0, 0], to: b, label: 'before', tone: 0 }, { from: [0, 0], to: a, label: 'after', tone: 1 }], { unit: 'm/s', axes: ['east', 'north'] }), 'The velocity before and after the bend, to scale');
    parts.push(
      { kind: 'table', ask: 'Find the <b>east</b> and <b>north</b> components of the velocity before and after the bend. Use a negative number for a component pointing west.', topic: T.parts,
        head: ['', 'East (m/s)', 'North (m/s)'], rows: [['Before', null, null], ['After', null, null]],
        fill: { 1: { values: [v1, round(a[0], 3)], tol: { abs: 0.05 }, unit: 'm/s' }, 2: { values: [0, round(a[1], 3)], tol: { abs: 0.05 }, unit: 'm/s' } },
        working: `Before: ${v1} m/s east and 0 north. After: the heading is ${turn}° counterclockwise from east, so east = ${v2} cos ${turn}° = ${num(a[0])} m/s and north = ${v2} sin ${turn}° = ${num(a[1])} m/s.` },
      { kind: 'steps', ask: 'Find the change in velocity, <b>Δv = v<sub>after</sub> − v<sub>before</sub></b>: its east and north parts, and its size.', topic: T.change,
        steps: [{ label: 'East part of Δv', value: round(dv[0], 3), unit: 'm/s', tol: { abs: 0.05 } }, { label: 'North part of Δv', value: round(dv[1], 3), unit: 'm/s', tol: 0.01 }, { label: 'Size of Δv', value: round(DV, 3), unit: 'm/s', tol: 0.01 }],
        working: `East: ${minus(a[0], v1)} = ${num(dv[0])} m/s. North: ${num(a[1])} − 0 = ${num(dv[1])} m/s. Size: √(${paren(dv[0])}² + ${num(dv[1])}²) = <b>${num(DV)} m/s</b>.` },
      { kind: 'number', ask: 'How many degrees north of west does Δv point?', value: round(dir, 2), unit: '°', tol: { abs: 0.5 }, topic: T.angle,
        working: `Δv points west (its east part is negative) and north. tan θ = north ÷ west = ${num(dv[1])} ÷ ${num(-dv[0])}, so θ = <b>${num(dir, 1)}°</b> north of west.` },
      { kind: 'steps', ask: 'Find the size of the <b>average acceleration</b> during the turn.', topic: T.change,
        steps: [{ label: 'Size of Δv', value: round(DV, 3), unit: 'm/s', tol: 0.01 }, { label: 'Average acceleration', value: round(acc, 3), unit: 'm/s²', tol: 0.02 }],
        working: `a = Δv ÷ Δt = ${num(DV)} ÷ ${num(t)} = <b>${num(acc)} m/s²</b>, pointing the same way as Δv.` });
    if (v1 === v2) {
      parts.push({ kind: 'choice', ask: `${who.name.replace('A ', 'The ')} goes into and out of the bend at the same speed, ${v1} m/s. Did ${who.name.replace('A ', 'the ')} accelerate?`, topic: T.kinds,
        choices: ['Yes', 'No'], correct: 0,
        explain: { ask: 'Explain why.', lines: 3,
          points: ['Velocity is a vector: it has a direction as well as a size, and the direction changed from east to ' + newHeading, `So the velocity changed (by ${num(DV, 1)} m/s), and acceleration is the change in velocity ÷ time, even though the speed stayed the same`],
          model: `Yes. Acceleration is the rate of change of velocity, and velocity includes direction. The speed stayed at ${v1} m/s, but the direction turned from east to ${newHeading}, so the velocity changed by ${num(DV, 1)} m/s in ${num(t)} s: an average acceleration of ${num(acc)} m/s².`,
          notes: ['“No, the speed didn’t change” confuses speed (a scalar) with velocity (a vector).'] } });
    } else {
      parts.push({ kind: 'written', ask: `The speed changed by only ${Math.abs(v1 - v2)} m/s, but the velocity changed by ${num(DV, 1)} m/s. <b>Explain</b> why.`, lines: 3, topic: T.kinds,
        points: ['Velocity is a vector, so its change depends on the change of direction as well as the change of speed', `The direction turned through ${turn}°, so Δv has to be found by subtracting the velocities as vectors, not by subtracting the speeds (${v2} − ${v1})`],
        model: `Speed only says how fast, but velocity includes the direction. Turning through ${turn}° changes the velocity a lot even though the speed only changes by ${Math.abs(v1 - v2)} m/s, so Δv comes from subtracting the vectors: ${num(DV, 1)} m/s.` });
    }
  }
  return { title, intro, figures: [fig], parts };
}

// ---------- 3. explaining ----------

// a trip with legs at right angles: scalars and vectors from it, distance and displacement, speed and velocity
function scalarsExplain(d) {
  const ctx = d.pick([
    { who: 'A runner', person: 'runner', device: 'GPS watch', legs: [[500, 600, 700, 800, 900], [300, 400, 500, 600], [100, 200, 300, 400]], pace: [2.8, 3, 3.2, 3.5], top: 5.6, kg: 60, noun: 'run', it: 'she', its: 'her' },
    { who: 'A bike courier', person: 'courier', device: 'bike computer', legs: [[800, 900, 1000, 1200, 1500], [400, 500, 600, 800], [200, 300, 400, 500]], pace: [5, 5.5, 6, 6.5], top: 11.5, kg: 78, noun: 'ride', it: 'he', its: 'his' },
  ]);
  const DIR = ['north', 'east', 'south', 'west'], r = d.int(0, 3), q = (r + (d.chance(0.5) ? 1 : 3)) % 4;
  const a = d.pick(ctx.legs[0]), b = d.pick(ctx.legs[1]), c = d.pick(ctx.legs[2].filter((x) => x <= a - 200));
  const total = a + b + c, net = a - c, D = hyp(net, b), speed = d.pick(ctx.pace), time = Math.round(total / speed / 60) * 60, avs = total / time, avv = D / time;
  // three quantities from the trip, at least one of each kind (none of them an answer worked out later)
  const SCA = [['The temperature of the air, 14 °C', 0, 'no direction'], [`The ${ctx.person}’s mass, ${ctx.kg} kg`, 0, 'an amount of matter, with no direction'], [`The ${ctx.person}’s top speed, ${num(ctx.top, 1)} m/s`, 0, 'how fast, not which way'], [`The time the ${ctx.noun} took`, 0, 'no direction']];
  const VEC = [[`The ${ctx.person}’s weight, ${num(ctx.kg * g, 0)} N`, 1, 'a force, pulling down'], [`A wind of 4 m/s blowing from the ${DIR[q]}`, 1, 'a velocity: it has a direction'], [`The ${ctx.person}’s velocity on the last leg, ${num(speed, 1)} m/s ${DIR[(r + 2) % 4]}`, 1, 'a speed with a direction']];
  const pool = d.shuffle([...d.shuffle(SCA).slice(0, d.int(1, 2)), ...d.shuffle(VEC).slice(0, 2)]).slice(0, 3);
  const fields = pool.map(([label, right]) => ({ label, options: ['Scalar', 'Vector'], correct: right }));
  const curve = num(d.pick(ctx.pace), 1);
  const parts = [
    { kind: 'select', ask: 'For each quantity from the trip, say whether it is a <b>scalar</b> or a <b>vector</b>.', topic: T.kinds, fields,
      working: `A vector has a direction as well as a size; a scalar is a size only. ${pool.map(([l, rr, why]) => `${l}: <b>${rr ? 'vector' : 'scalar'}</b> (${why})`).join('. ')}.` },
    { kind: 'number', ask: `What total <b>distance</b> did ${ctx.it} travel?`, value: total, unit: 'm', tol: 0.005, topic: T.path,
      working: `Distance adds every leg, whatever its direction: ${a} + ${b} + ${c} = <b>${num(total)} m</b>.` },
    { kind: 'steps', ask: `What is the size of ${ctx.its} <b>displacement</b> at the end?`, topic: T.path,
      steps: [{ label: `How far ${DIR[r]} of the start ${ctx.it} ends up`, value: net, unit: 'm', tol: 0.005 }, { label: 'Size of the displacement', value: round(D, 2), unit: 'm', tol: 0.01 }],
      working: `${a} m ${DIR[r]} and then ${c} m back ${DIR[(r + 2) % 4]} leave ${a} − ${c} = ${net} m ${DIR[r]}, and ${b} m ${DIR[q]}. At right angles: √(${net}² + ${b}²) = <b>${num(D, 1)} m</b>.` },
    { kind: 'number', ask: `The ${ctx.noun} took ${time / 60} minutes. What was ${ctx.its} <b>average speed</b>?`, value: round(avs, 4), unit: 'm/s', tol: 0.02, topic: T.path,
      working: `Average speed = distance ÷ time = ${num(total)} ÷ ${time} s = <b>${num(avs)} m/s</b>.` },
    { kind: 'number', ask: `And the size of ${ctx.its} <b>average velocity</b>?`, value: round(avv, 4), unit: 'm/s', tol: 0.02, topic: T.path,
      working: `Average velocity = displacement ÷ time = ${num(D, 1)} ÷ ${time} s = <b>${num(avv)} m/s</b>, ${DIR[r]} and ${DIR[q]} of the start.` },
  ];
  if (d.chance(0.5)) {
    parts.push({ kind: 'written', ask: `Explain why ${ctx.its} average velocity is smaller than ${ctx.its} average speed.`, lines: 3, topic: T.path,
      points: ['Average speed uses the distance (every metre travelled) and average velocity uses the displacement (start to finish in a straight line), over the same time', `The route changed direction and partly doubled back, so the displacement (${num(D, 0)} m) is much shorter than the distance (${num(total)} m)`],
      model: `Both are divided by the same ${time / 60} minutes, but average speed uses the whole ${num(total)} m travelled, while average velocity only uses the ${num(D, 0)} m straight line from start to finish. The route turned and came partly back, so the displacement is much shorter than the distance.`,
      notes: ['“Velocity has a direction” alone doesn’t explain why it is smaller: compare the distance with the displacement.'] });
  } else {
    parts.push({ kind: 'choice', ask: `Could a ${ctx.noun} have an average velocity of zero, but an average speed that isn’t zero?`, topic: T.path,
      choices: ['Yes', 'No'], correct: 0,
      explain: { ask: 'Explain, with an example.', lines: 3,
        points: ['Yes: if the trip ends back where it started, the displacement is zero, so the average velocity is zero', `But the distance travelled isn’t zero (for example a loop back to the start), so the average speed is the distance ÷ time, more than zero`],
        model: `Yes. If ${ctx.it} finished back at the start, say after going ${a} m ${DIR[r]} and ${a} m back, the displacement would be zero, so the average velocity would be zero. But ${ctx.it} would still have travelled ${2 * a} m, so the average speed would not be zero.` } });
  }
  parts.push({ kind: 'choice', ask: `On one stretch the ${ctx.device} showed a steady ${curve} m/s while ${ctx.it} went round a curve. Which statement is true?`, topic: T.kinds,
    choices: ['The speed and the velocity both stayed the same', 'The speed stayed the same but the velocity changed', 'The velocity stayed the same but the speed changed', 'The speed and the velocity both changed'], correct: 1,
    explain: { ask: 'Explain why.', lines: 3,
      points: [`Speed is a scalar, a size only, and it stayed at ${curve} m/s`, 'Velocity is a vector: its direction changed all the way round the curve, so the velocity changed (it was accelerating)'],
      model: `The speed stayed the same but the velocity changed. Speed is just how fast, ${curve} m/s the whole time. Velocity also has a direction, and going round a curve the direction changes all the time, so the velocity changes even though its size doesn’t.` } });
  return {
    title: 'Distance or displacement?',
    intro: `<p>${ctx.who} goes ${a} m ${DIR[r]}, then ${b} m ${DIR[q]}, then ${c} m ${DIR[(r + 2) % 4]}, along straight paths, and stops. ${ctx.it[0].toUpperCase() + ctx.it.slice(1)} records the trip on a ${ctx.device}.</p>`,
    figures: [figure(vectors([{ from: [0, 0], to: unitDir(r, a), tone: 0, label: `${a} m` }, { from: unitDir(r, a), to: [unitDir(r, a)[0] + unitDir(q, b)[0], unitDir(r, a)[1] + unitDir(q, b)[1]], tone: 1, label: `${b} m` },
      { from: [unitDir(r, a)[0] + unitDir(q, b)[0], unitDir(r, a)[1] + unitDir(q, b)[1]], to: [unitDir(r, net)[0] + unitDir(q, b)[0], unitDir(r, net)[1] + unitDir(q, b)[1]], tone: 0, label: `${c} m` }],
    { unit: 'm', axes: ['east', 'north'], points: [[0, 0, 'start']] }), `The ${ctx.noun} from above, to scale`)],
    parts,
  };
}

// two pulls on one object at an angle: the largest and smallest resultants, why the resultant depends on the angle,
// the resultant at 90° or another angle, and a sketch of how it changes with the angle
function angleExplain(d) {
  const ctx = d.pick([
    { what: 'Two people pull a heavy crate across a floor with ropes', u: 'N', F1: [250, 300, 350, 400], F2: [120, 150, 180, 200] },
    { what: 'Two tractors pull a fallen tree trunk off a road with chains', u: 'kN', F1: [12, 15, 18, 20], F2: [5, 6, 8, 9] },
    { what: 'Two dogs pull a sled across the snow', u: 'N', F1: [150, 160, 180, 200], F2: [60, 70, 80, 90] },
  ]);
  const F1 = d.pick(ctx.F1), F2 = d.pick(ctx.F2.filter((x) => F1 !== 2 * x));
  const u = ctx.u, R = (t) => Math.sqrt(F1 * F1 + F2 * F2 + 2 * F1 * F2 * cos(t)), R90 = hyp(F1, F2);
  const t = d.pick([40, 50, 60, 70, 110, 120, 130, 140]), Rx = F1 + F2 * cos(t), Ry = F2 * sin(t);
  // the right size among the slips people make (each value once)
  const sizes = (right, wrongs) => oneOf(d, `${num(right, 0)} ${u}`, [...new Set(wrongs.map((x) => `${num(x, 0)} ${u}`))].filter((x) => x !== `${num(right, 0)} ${u}`).slice(0, 3));
  const big = sizes(F1 + F2, [R90, F1 - F2, (F1 + F2) / 2, F1]);
  const low = sizes(F1 - F2, [0, F2, R90, (F1 + F2) / 2]);
  const parts = [
    { kind: 'choice', ask: 'What is the <b>largest</b> possible resultant of the two pulls?', topic: T.add, ...big,
      explain: { ask: 'At what angle does it happen? Explain briefly.', lines: 2,
        points: [`At 0°: when both pull in the same direction, all of each pull adds along one line, ${num(F1)} + ${num(F2)} = ${num(F1 + F2)} ${u}`],
        model: `When the ${u === 'kN' ? 'chains' : 'ropes'} point the same way (0° apart), nothing is wasted sideways: the pulls add like numbers, ${num(F1)} + ${num(F2)} = ${num(F1 + F2)} ${u}.` } },
    { kind: 'choice', ask: 'What is the <b>smallest</b> possible resultant?', topic: T.add, ...low,
      explain: { ask: 'At what angle does it happen? Explain briefly.', lines: 2,
        points: [`At 180°: pulling in opposite directions, the smaller pull cancels part of the bigger one, ${num(F1)} − ${num(F2)} = ${num(F1 - F2)} ${u}`],
        model: `When they pull in opposite directions (180° apart), the smaller pull cancels ${num(F2)} ${u} of the bigger one, leaving ${num(F1 - F2)} ${u}. It can’t be zero, because the pulls aren’t equal.` } },
    { kind: 'written', ask: 'Explain why the resultant gets <b>smaller</b> as the angle between the two pulls gets bigger. Use the idea of components.', lines: 5, topic: T.add,
      points: [`Split the smaller pull into a part along the bigger pull, ${num(F2)} cos θ, and a part at right angles to it, ${num(F2)} sin θ`, 'As the angle grows, the part along the bigger pull shrinks (cos θ gets smaller), so less of it adds to the bigger pull', 'The sideways part only adds at right angles (by Pythagoras), which adds less than pulling in line', 'Past 90° the part along the line points backwards, against the bigger pull, until at 180° the whole of it does'],
      marks: 3,
      model: `Split the ${num(F2)} ${u} pull into a part along the ${num(F1)} ${u} pull (${num(F2)} cos θ) and a part at right angles to it (${num(F2)} sin θ). At 0° all of it is along the line and the pulls add fully. As the angle grows, cos θ gets smaller, so less of the smaller pull adds to the bigger one; the part that turns sideways only adds at right angles, which counts for less. Past 90° the part along the line points backwards and starts cancelling the bigger pull, until at 180° the resultant is just ${num(F1)} − ${num(F2)} = ${num(F1 - F2)} ${u}.`,
      notes: ['“The forces cancel” on its own isn’t enough: say which parts of the pulls add and which work against each other.'] },
  ];
  if (d.chance(0.5)) {
    parts.push({ kind: 'number', ask: 'What is the resultant when the two pulls are at <b>90°</b> to each other?', value: round(R90, 3), unit: u, tol: 0.01, topic: T.square,
      working: `At right angles, the resultant is the hypotenuse: √(${num(F1)}² + ${num(F2)}²) = <b>${num(R90, 1)} ${u}</b>.` });
  } else {
    parts.push({ kind: 'steps', ask: `Use components to find the resultant when the pulls are <b>${t}°</b> apart. Take the bigger pull along the x-axis.`, topic: T.add,
      steps: [{ label: `Part along the bigger pull, ${num(F1)} + ${num(F2)} cos ${t}°`, value: round(Rx, 3), unit: u, tol: 0.01 }, { label: `Part across it, ${num(F2)} sin ${t}°`, value: round(Ry, 3), unit: u, tol: 0.01 }, { label: 'Size of the resultant', value: round(R(t), 3), unit: u, tol: 0.01 }],
      working: `Along: ${num(F1)} + ${num(F2)} × cos ${t}° = ${plus(F1, F2 * cos(t), 1)} = ${num(Rx, 1)} ${u}. Across: ${num(F2)} × sin ${t}° = ${num(Ry, 1)} ${u}. Size: √(${num(Rx, 1)}² + ${num(Ry, 1)}²) = <b>${num(R(t), 1)} ${u}</b>.` });
  }
  parts.push({ kind: 'sketch', ask: 'Sketch how the size of the resultant changes as the angle between the pulls goes from 0° to 180°. Mark its values at 0° and at 180°.',
    x: 'angle between the pulls (0° to 180°)', y: `size of the resultant (${u})`, pens: ['Resultant'],
    model: [{ pen: 0, pts: Array.from({ length: 25 }, (_, i) => [round(i / 24, 4), round((0.92 * R((180 * i) / 24)) / (F1 + F2), 4)]) }],
    points: [`Starts at its largest, ${num(F1 + F2)} ${u}, at 0°`, 'Falls all the way as the angle grows, with no rise anywhere', `Ends at its smallest, ${num(F1 - F2)} ${u}, at 180°, not at zero`, 'A curve, flattening out near 0° and near 180°, not a straight line'],
    marks: 3,
    notes: ['Ending at zero is wrong: the pulls aren’t equal, so they never cancel completely.'] });
  return {
    title: 'Two pulls at an angle',
    intro: `<p>${ctx.what}. One pulls with ${num(F1)} ${u} and the other with ${num(F2)} ${u}, and they can choose the angle between their ${u === 'kN' ? 'chains' : 'ropes'}.</p>`,
    figures: [figure(diagram({
      arrows: [{ from: [0, 0], to: [2.2, 0], label: `${num(F1)} ${u}`, tone: 0, side: -1 }, { from: [0, 0], to: [1.5 * cos(55), 1.5 * sin(55)], label: `${num(F2)} ${u}`, tone: 1, side: 1 }],
      arcs: [{ at: [0, 0], from: 0, to: 55, r: 34, label: 'θ' }], dots: [[0, 0, '']], w: 320, h: 190, label: 'Two pulls with an angle θ between them',
    }), 'The two pulls from above (not to scale)')],
    parts,
  };
}

// pulling at an angle: the pull's components, why a pull can be replaced by its components, what happens as the angle
// changes, and why the components don't add up like numbers
function componentsExplain(d) {
  const ctx = d.pick([
    { what: 'A student drags a sled across flat snow with a rope', thing: 'rope', F: [40, 50, 60, 70, 80], th: [25, 30, 35, 40, 50] },
    { what: 'A traveller pulls a wheeled suitcase through an airport by its handle', thing: 'handle', F: [20, 24, 25, 30, 36], th: [35, 40, 50, 55, 60] },
    { what: 'A child pulls a toy wagon along a path by its handle', thing: 'handle', F: [15, 16, 18, 20, 24], th: [20, 25, 30, 35, 40] },
  ]);
  const F = d.pick(ctx.F), th = d.pick(ctx.th), Fx = F * cos(th), Fy = F * sin(th);
  const ijForm = d.chance(0.5);
  const H = d.pick([0.6, 0.7, 0.75, 0.8, 0.9].map((r) => Math.round(F * r)).filter((h) => Math.abs(acos(h / F) - th) >= 5));
  const tH = acos(H / F);
  const parts = [
    { kind: 'number', ask: ijForm ? `Write the pull as (a<b>i</b> + b<b>j</b>) N, with <b>i</b> along the ground and <b>j</b> straight up. What is a?` : 'What is the <b>horizontal</b> component of the pull?', value: round(Fx, 3), unit: 'N', tol: 0.01, topic: ijForm ? T.ij : T.parts,
      working: `The angle is measured from the ground, so the horizontal part is the side next to it: ${F} cos ${th}° = <b>${num(Fx)} N</b>.` },
    { kind: 'number', ask: ijForm ? 'And what is b?' : 'What is the <b>vertical</b> component of the pull?', value: round(Fy, 3), unit: 'N', tol: 0.01, topic: ijForm ? T.ij : T.parts,
      working: `The vertical part is the side across from the angle: ${F} sin ${th}° = <b>${num(Fy)} N</b>.` },
    { kind: 'written', ask: 'Explain why the pull can be <b>replaced</b> by its two components.', lines: 4, topic: T.parts,
      points: ['Placed tip to tail, the two components make a right-angled triangle whose hypotenuse is the pull itself, so together they have the same size and direction as the pull', 'Directions at right angles don’t affect each other: the vertical component does nothing along the ground and the horizontal one nothing up and down', `So the horizontal component alone pulls the ${ctx.what.includes('sled') ? 'sled' : ctx.what.includes('suitcase') ? 'suitcase' : 'wagon'} along, and the vertical component alone lifts it a little (it presses less on the ground)`],
      model: `Put tip to tail, the ${num(Fx, 1)} N horizontal part and the ${num(Fy, 1)} N vertical part form a right-angled triangle whose hypotenuse is exactly the ${F} N pull, at ${th}°: together they are the pull. And because they are at right angles, each acts on its own: the horizontal part moves it along the ground, while the vertical part only lifts it slightly, making it press less on the ground.`,
      notes: ['“Because the components add up to the force” needs to say how: tip to tail, as the sides of a right-angled triangle, not as numbers.'] },
    { kind: 'choice', ask: `The ${ctx.thing} is lowered to a smaller angle, still pulling with ${F} N. What happens to the <b>horizontal</b> component?`, topic: T.parts,
      choices: ['It gets bigger', 'It gets smaller', 'It stays the same'], correct: 0,
      explain: { ask: 'Explain why.', lines: 3,
        points: ['The horizontal component is F cos θ, and cos θ gets bigger as θ gets smaller (cos 0° = 1)', 'More of the pull lies along the ground and less of it points up: at 0° the whole pull is horizontal'],
        model: `It gets bigger. The horizontal component is ${F} cos θ, and cos θ grows as θ shrinks, up to cos 0° = 1. With the ${ctx.thing} lower, more of the pull lies along the ground and less points upward; flat along the ground, all ${F} N would be horizontal.` } },
  ];
  const classmate = { kind: 'written', ask: `A classmate adds the two components, ${num(Fx, 1)} + ${num(Fy, 1)} = ${num(Fx + Fy, 1)} N, which is more than the ${F} N pull, and says splitting the pull has made extra force. <b>Explain</b> what is wrong.`, lines: 3, topic: T.size,
    points: ['The components are at right angles, so they don’t add like ordinary numbers', `They add as vectors, tip to tail, by Pythagoras: √(${num(Fx, 1)}² + ${num(Fy, 1)}²) = ${F} N, exactly the original pull, so nothing extra is made`],
    model: `Two forces only add like numbers when they point the same way. These are at right angles, so they add tip to tail as the sides of a right-angled triangle: √(${num(Fx, 1)}² + ${num(Fy, 1)}²) = ${F} N, exactly the pull, with no extra force.` };
  const angleFor = { kind: 'number', ask: `At what angle to the ground would the horizontal component be exactly ${H} N?`, value: round(tH, 2), unit: '°', tol: { abs: 0.5 }, topic: T.angle,
    working: `${F} cos θ = ${H}, so cos θ = ${H} ÷ ${F} = ${num(H / F, 3)} and θ = cos⁻¹(${num(H / F, 3)}) = <b>${num(tH, 1)}°</b>.` };
  // (the two in either order)
  parts.push(...(d.chance(0.5) ? [classmate, angleFor] : [angleFor, classmate]));
  const what = ctx.what.includes('sled') ? 'sled' : ctx.what.includes('suitcase') ? 'suitcase' : 'wagon';
  return {
    title: 'Pulling at an angle',
    intro: `<p>${ctx.what}. The ${ctx.thing} pulls with a force of ${F} N at ${th}° above the horizontal.</p>`,
    figures: [figure(vectors([{ from: [0, 0], to: [Fx, 0], label: '', tone: 1, dash: true }, { from: [Fx, 0], to: [Fx, Fy], label: '', tone: 1, dash: true }, { from: [0, 0], to: [Fx, Fy], label: `${F} N`, tone: 0 }], { unit: 'N', axes: ['along the ground', 'up'] }), `The pull on the ${what} and its components, to scale`)],
    parts,
  };
}

// a swimmer heading straight across a river: where they land, the time and the drift, why the current doesn't change the
// time, a sketch of the drift or the time against the current, and which way to point to land opposite
function swimmerExplain(d) {
  const p = d.pick([{ it: 'she', its: 'her', them: 'her' }, { it: 'he', its: 'his', them: 'him' }]);
  const W = d.pick([30, 40, 50, 60, 80]), vs = d.pick([0.8, 0.9, 1.2, 1.25, 1.5]), vc = round(vs * d.pick([0.3, 0.4, 0.5, 0.6]), 2);
  const t = W / vs, x = vc * t, up = asin(vc / vs), It = p.it[0].toUpperCase() + p.it.slice(1);
  const driftSketch = d.chance(0.5);
  const parts = [
    { kind: 'choice', ask: `Where does the swimmer reach the far bank?`, topic: T.river,
      choices: [`Directly opposite where ${p.it} started`, 'Downstream of the point directly opposite', 'Upstream of the point directly opposite'], correct: 1,
      explain: { ask: 'Explain why, using vectors.', lines: 4,
        points: [`${p.its[0].toUpperCase() + p.its.slice(1)} velocity relative to the bank is ${p.its} velocity through the water (straight across) plus the current’s velocity (downstream), added as vectors`, `The water carries ${p.them} downstream at ${num(vc)} m/s for the whole time ${p.it} is in it, so ${p.its} path slants downstream even though ${p.it} points straight across`],
        model: `Downstream. Relative to the bank, ${p.its} velocity is the sum of ${p.its} own ${num(vs)} m/s straight across and the current’s ${num(vc)} m/s downstream, so it points at a slant downstream. However hard ${p.it} swims, the water carries ${p.them} downstream for the whole crossing.`,
        notes: ['“The current pushes the swimmer” on its own isn’t enough: say that the velocities add as vectors, and that the drift lasts the whole crossing.'] } },
    { kind: 'steps', ask: `How long does the crossing take, and how far downstream does ${p.it} land?`, topic: T.river,
      steps: [{ label: 'Time to cross', value: round(t, 3), unit: 's', tol: 0.01 }, { label: 'Distance downstream', value: round(x, 3), unit: 'm', tol: 0.01 }],
      working: `Only ${p.its} own swimming carries ${p.them} across: t = ${W} ÷ ${num(vs)} = ${num(t)} s. In that time the current carries ${p.them} ${num(vc)} × ${num(t)} = <b>${num(x)} m</b> downstream.` },
  ];
  if (driftSketch) {
    parts.push({ kind: 'written', ask: 'Explain why the current does <b>not</b> change how long the crossing takes.', lines: 3, topic: T.river,
      points: ['The current flows along the river, at right angles to the direction across it, so it has no component across the river', `Only ${p.its} own velocity through the water (${num(vs)} m/s straight across) carries ${p.them} to the other bank, so the time is ${W} ÷ ${num(vs)} whatever the current`],
      model: `The current flows at right angles to the crossing, so none of its velocity points across the river: it only moves ${p.them} sideways. ${It} still gets ${num(vs)} m/s straight across from swimming, so it takes ${W} ÷ ${num(vs)} = ${num(t)} s, fast current or slow.` });
    parts.push({ kind: 'sketch', ask: `Sketch how the <b>drift</b> (how far downstream ${p.it} lands) depends on the speed of the current, for this swimmer and for a swimmer twice as fast.`,
      x: 'speed of the current', y: 'drift downstream', pens: ['This swimmer', 'Twice as fast'],
      model: [{ pen: 0, pts: Array.from({ length: 21 }, (_, i) => [round(i / 20, 3), round((0.9 * i) / 20, 3)]) }, { pen: 1, pts: Array.from({ length: 21 }, (_, i) => [round(i / 20, 3), round((0.45 * i) / 20, 3)]) }],
      points: ['Both are straight lines starting at the origin: no current, no drift', 'The faster swimmer’s line is half as steep (half the time in the water, so half the drift)', 'Doubling the current doubles the drift: drift = current × width ÷ swimming speed'],
      notes: ['Curves that level off are wrong: the drift grows in proportion to the current.'] });
  } else {
    parts.push({ kind: 'written', ask: `Explain why a faster swimmer drifts less, but still can’t stop drifting by pointing straight across.`, lines: 3, topic: T.river,
      points: ['A faster swimmer crosses in less time (time = width ÷ swimming speed), so the current has less time to carry them downstream', 'But pointing straight across, nothing cancels the current’s downstream velocity, so there is always some drift while they are in the water'],
      model: `Swimming faster shortens the time in the water, ${W} ÷ speed, so the current has less time to carry the swimmer and the drift is smaller. But pointing straight across, none of the swimmer’s velocity points upstream, so nothing cancels the current: as long as they are in the water, it carries them downstream.` });
    parts.push({ kind: 'sketch', ask: `Sketch how the <b>time to cross</b> depends on the speed of the current, for this swimmer and for a swimmer twice as fast, both pointing straight across.`,
      x: 'speed of the current', y: 'time to cross', pens: ['This swimmer', 'Twice as fast'],
      model: [{ pen: 0, pts: Array.from({ length: 21 }, (_, i) => [round(i / 20, 3), 0.8]) }, { pen: 1, pts: Array.from({ length: 21 }, (_, i) => [round(i / 20, 3), 0.4]) }],
      points: ['Both lines are flat (horizontal): the current doesn’t change the crossing time', 'The faster swimmer’s line is lower, at half the height (half the time)', `Neither line is at zero: even with no current, crossing takes width ÷ swimming speed (${num(t)} s for this swimmer)`],
      notes: ['A line that slopes up is wrong: the current flows at right angles to the crossing, so it can’t slow it down.'] });
  }
  parts.push({ kind: 'choice', ask: `To land <b>directly opposite</b> the start, which way should ${p.it} point?`, topic: T.river,
    choices: ['Straight across', 'Angled upstream', 'Angled downstream'], correct: 1,
    explain: { ask: `Explain why, and find the angle.`, lines: 4,
      points: [`Pointing upstream gives ${p.its} velocity an upstream component that can cancel the current exactly, so ${p.its} velocity relative to the bank points straight across`, `The upstream component must equal the current: ${num(vs)} sin θ = ${num(vc)}, so θ = sin⁻¹(${num(vc)} ÷ ${num(vs)}) ≈ ${num(up, 1)}° upstream of straight across`, `This only works because ${p.it} swims faster than the current: the upstream component can never be more than ${num(vs)} m/s`],
      marks: 2,
      model: `Angled upstream. Part of ${p.its} velocity then points upstream, and if that part equals the current, ${num(vs)} sin θ = ${num(vc)}, the two cancel and ${p.it} moves straight across. That needs θ = sin⁻¹(${num(vc)} ÷ ${num(vs)}) ≈ ${num(up, 1)}°. It only works because ${p.it} swims faster than the current.` } });
  return {
    title: 'Swimming across a river',
    intro: `<p>A lifeguard explains river safety to a group of swimmers. A swimmer who swims at ${num(vs)} m/s in still water heads <b>straight across</b> a river ${W} m wide, pointing at right angles to the bank the whole time. The river flows at a steady ${num(vc)} m/s.</p>`,
    figures: [figure(diagram({
      water: [[[-0.6, 0], [3.2, 0], [3.2, 2], [-0.6, 2]]],
      lines: [{ from: [-0.6, 0], to: [3.2, 0], wall: true }, { from: [-0.6, 2], to: [3.2, 2], wall: true }, { from: [0.9, 0], to: [0.9, 2], dash: true }],
      arrows: [{ from: [0.9, 0], to: [0.9, 0.85], label: 'points across', tone: 0, side: 1 }, { from: [2, 1.3], to: [2.9, 1.3], label: 'current', tone: 1, side: 1 }],
      dots: [[0.9, 0, 'start'], [0.9, 2, '']], notes: [{ at: [0.9, 2], text: 'directly opposite', dy: -10 }],
      w: 340, h: 200, label: 'The river from above, with the swimmer pointing straight across',
    }), 'The river from above (not to scale)')],
    parts,
  };
}

export const vectorsExam = examBank('vectors-exam', {
  title: 'Vectors', minutes: 45, guide: GUIDE,
  slots: [
    [driftLab, ringLab, droneLab, balancesLab, orienteeringLab],          // 1. a lab or a data set
    [riverProblem, crosswindProblem, forcesProblem, turnProblem],          // 2. a problem in steps
    [scalarsExplain, angleExplain, componentsExplain, swimmerExplain],     // 3. explaining
  ],
});
