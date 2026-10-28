// Tests like the ones in class for Projectile Motion: a lab to analyse (process the data, choose what to plot so the
// model gives a straight line, draw the line of best fit and use its gradient), a problem to solve in steps, and
// motion to explain. Original questions with new numbers and contexts every time. kit/exam-kit.js says what a question
// and its parts are.
import { examBank, dataTable, noisy, bestFit, sig } from '../kit/exam-kit.js';
import { num, round } from '../kit/bank.js';
import { plot } from './draw.js';

const g = 9.8;
const GUIDE = `<div class="cols">
  <ul>
    <li>Across: <span class="f">x = v<sub>x</sub>t</span> (no acceleration)</li>
    <li>Up and down (up positive): <span class="f">y = u<sub>y</sub>t − ½gt²</span>, <span class="f">v<sub>y</sub> = u<sub>y</sub> − gt</span>, <span class="f">v<sub>y</sub>² = u<sub>y</sub>² − 2gy</span>, with <span class="f">g = 9.8 m/s²</span></li>
    <li>Launched at angle θ with speed v: <span class="f">v<sub>x</sub> = v cos θ</span>, <span class="f">u<sub>y</sub> = v sin θ</span></li>
    <li>Speed from its parts: <span class="f">v = √(v<sub>x</sub>² + v<sub>y</sub>²)</span></li>
  </ul>
  <ul>
    <li>Gradient of a straight line: <span class="f">m = Δy ÷ Δx</span>, read from two points far apart on the line</li>
    <li>100 cm = 1 m · 1000 mm = 1 m · 1000 g = 1 kg · 1000 ms = 1 s · 1000 L = 1 m³</li>
  </ul>
</div>`;

// the practice topics, so a lost mark points to its lesson
const T = {
  time: 'Launched sideways: time in the air', reach: 'Launched sideways: how far it lands', impact: 'Launched sideways: how it lands',
  speed: 'Launched sideways: the speed from where it lands', ledge: 'Clearing a ledge', parts: 'Launch speed in parts',
  flight: 'Time of flight on level ground', height: 'Maximum height', range: 'Range on level ground', partway: 'Where it is partway',
  high: 'Launched from a height at an angle',
};

// ---------- helpers ----------
const rad = (a) => (a * Math.PI) / 180, sin = (a) => Math.sin(rad(a)), cos = (a) => Math.cos(rad(a));
const fall = (h) => Math.sqrt((2 * h) / g);                 // the time to fall h from rest
// a measured value as a data table shows it: every reading to the same number of decimal places
const fix = (x, dp) => round(x, dp).toFixed(dp);
// a number added on at the end of a sum: "+ 0.3" or "− 0.3"
const plus = (x, s = 3) => (x < 0 ? `− ${sig(-x, s)}` : `+ ${sig(x, s)}`);
// a choice with the right answer among wrong ones, in an order from the dice
const choose = (d, right, wrongs) => { const choices = d.shuffle([right, ...wrongs]); return { choices, correct: choices.indexOf(right) }; };
// points for a sketch's model answer (x and y from 0 to 1): n + 1 along a straight line, or along a curve y = f(x)
const segment = ([x0, y0], [x1, y1], n = 20) => Array.from({ length: n + 1 }, (_, i) => [round(x0 + ((x1 - x0) * i) / n, 4), round(y0 + ((y1 - y0) * i) / n, 4)]);
const along = (f, n = 24) => Array.from({ length: n + 1 }, (_, i) => [round(i / n, 4), round(f(i / n), 4)]);

// ---------- drawings ----------
// the path of something launched from (0, h0) at v, a° above the horizontal: its height at x
const pathOf = (v, a, h0 = 0) => (x) => h0 + Math.tan(rad(a)) * x - (g * x * x) / (2 * (v * cos(a)) ** 2);
// a scene to scale: the ground (or the sea at the foot of a cliff), blocks (walls of players, nets, posts, ledges), the
// launch velocity, the path when drawing it gives no answer away, and lengths marked along the edges
function scene({ v, a = 0, h0 = 0, to, top: tall = 0, cliff = false, sea = false, blocks = [], path = true, pathTo, arrow = true, label, dims = [], notes = [], points = [], curves = [] }) {
  const apex = a > 0 ? h0 + (v * sin(a)) ** 2 / (2 * g) : h0;
  const right = Math.max(to, ...blocks.map((b) => b.x + b.w)), top = Math.max(apex, tall, ...blocks.map((b) => b.h), 0.01);
  const big = Math.max(right, top), step = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100].find((s) => big / s <= 7) ?? 200;
  const x0 = cliff ? -2 * step : 0, x1 = Math.ceil((right * 1.06) / step - 1e-9) * step, solids = [];
  if (cliff) solids.push({ pts: [[x0, 0], [0, 0], [0, h0], [x0, h0]] });
  if (sea) solids.push({ kind: 'water', pts: [[0, 0], [x1, 0], [x1, step * 0.1], [0, step * 0.1]] });
  for (const b of blocks) solids.push({ kind: b.kind, pts: [[b.x, 0], [b.x + b.w, 0], [b.x + b.w, b.h], [b.x, b.h]] });
  // the launch velocity, with its angle when it has one (on the arrow's own label, so the two never overlap)
  const len = big * 0.2;
  const arrows = arrow ? [{ from: [0, h0], to: [len * cos(a), h0 + len * sin(a)], label: label ?? `${num(v)} m/s${a ? ` at ${Math.abs(a)}°` : ''}`, side: a <= 0 ? -1 : undefined }] : [];
  return plot({
    x: [x0, x1, step], y: [0, Math.ceil((top * 1.18) / step - 1e-9) * step, step], equal: true, xLabel: 'distance (m)', yLabel: 'height (m)', solids,
    curves: [...(path ? [{ f: pathOf(v, a, h0), from: 0, to: pathTo ?? to }] : []), ...curves], arrows, dims, points, notes,
  });
}
const heightDim = (h, label, x = 0, off = -14) => ({ from: [x, 0], to: [x, h], label, off });
const groundDim = (x, label, from = 0) => ({ from: [from, 0], to: [x, 0], label, off: -12 });
// a figure with a title above it, as the data tables have
const titled = (title, svg) => `<div class="chart"><p class="chart-title">${title}</p>${svg}</div>`;

// the path with air resistance (a drag force against the motion, growing with the speed squared), stepped through time
// from the launch until it comes back down to the ground: [[x, y]…]
function dragPath(v, a, c) {
  let x = 0, y = 0, vx = v * cos(a), vy = v * sin(a);
  const pts = [[0, 0]], dt = 0.001;
  for (let i = 0; i < 200000; i++) {
    const s = Math.hypot(vx, vy);
    vx -= c * s * vx * dt;
    vy -= (g + c * s * vy) * dt;
    const nx = x + vx * dt, ny = y + vy * dt;
    if (ny < 0) { const f = y / (y - ny); pts.push([x + (nx - x) * f, 0]); break; }
    x = nx; y = ny; pts.push([x, y]);
  }
  return pts;
}
// the height of a path of points at x (between the two points either side of it)
function heightAt(pts, x) {
  const i = pts.findIndex((p) => p[0] >= x);
  if (i <= 0) return i === 0 ? pts[0][1] : pts.at(-1)[1];
  const [a, b] = [pts[i - 1], pts[i]];
  return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0] || 1);
}

// ---------- 1. labs: process the data, plot it straight, use the gradient ----------
// a ball rolled off a bench at different speeds: x = v√(2h/g), so x against v is a straight line through the origin
// whose gradient gives the bench's height
function offTheBench(d) {
  const h = d.pick([0.72, 0.75, 0.8, 0.84, 0.88, 0.92, 0.96, 1.05]), k = Math.sqrt((2 * h) / g);
  const v0 = d.pick([0.6, 0.8, 1]), dv = d.pick([0.3, 0.35, 0.4]);
  const v = Array.from({ length: 6 }, (_, i) => round(v0 + i * dv, 2));
  const xcm = v.map((s) => round(noisy(d, s * k * 100, 0.025), 1)), xm = xcm.map((c) => round(c / 100, 4));
  // the gradient of x (m) against v (m/s) from the data, and the height it gives
  const fit = bestFit(v.map((s, i) => [s, xm[i]])), s = fit.slope, H = (g * s * s) / 2;
  const heightFrom = (line) => {
    const m = line.slope;
    if (line.y === 'x' && line.x === 'v') return (g * m * m) / 2;
    if (line.y === 'v' && line.x === 'x') return g / (2 * m * m);
    if (line.y === 'x2' && line.x === 'v2') return (g * m) / 2;
    if (line.y === 'v2' && line.x === 'x2') return g / (2 * m);
    return null;
  };
  return {
    title: 'Rolling off a bench',
    intro: `<p>A student rolls a small steel ball along a level bench and off its edge. A light gate at the edge measures the ball’s speed <i>v</i> as it leaves, and the student measures how far from the foot of the bench it lands, <i>x</i>. They repeat this at six different speeds.</p><p>For a ball launched horizontally from a height <i>h</i>, the supplied model is</p><p class="model"><span class="f">x = v √(2h ÷ g)</span></p><p>where <i>g</i> = 9.8 m/s². Air resistance can be neglected. The student wants to use the data to find the height of the bench.</p>`,
    figures: [dataTable(['Speed <i>v</i> (m/s)', 'Landing distance <i>x</i> (cm)'], v.map((sp, i) => [num(sp), num(xcm[i], 1)]), 'Average of three readings at each speed')],
    parts: [
      { kind: 'table', ask: 'Process the data: write each landing distance in metres.', topic: null,
        head: ['<i>v</i> (m/s)', '<i>x</i> (cm)', '<i>x</i> (m)'], rows: v.map((sp, i) => [num(sp), num(xcm[i], 1), null]),
        fill: { 2: { values: xm, tol: 0.005, unit: 'm' } },
        working: `Divide each distance by 100: ${num(xcm[0], 1)} cm = ${num(xm[0], 4)} m, and so on.` },
      { kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find the bench’s height, and draw the line of best fit.',
        quantities: {
          x: { label: '<i>x</i> (m)', values: xm }, v: { label: '<i>v</i> (m/s)', values: v },
          x2: { label: '<i>x</i>² (m²)', values: xm.map((a) => a * a) }, v2: { label: '<i>v</i>² (m²/s²)', values: v.map((a) => a * a) },
          iv: { label: '1/<i>v</i> (s/m)', values: v.map((a) => 1 / a) },
        },
        pairs: [['x', 'v'], ['v', 'x'], ['x2', 'v2'], ['v2', 'x2']],
        working: 'The model is x = (√(2h ÷ g)) × v: the same shape as y = mx, with the gradient m = √(2h ÷ g), which is the same for every throw. So plot x on the y-axis against v on the x-axis: a straight line through the origin.' },
      { kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: round(s, 4), unit: '', tol: 0.05, from: { part: 1, value: (line) => line.slope, tol: 0.02 },
        working: `Gradient = Δy ÷ Δx between two points on the line: about <b>${sig(s, 3)} s</b> for x (m) against v (m/s).` },
      { kind: 'steps', ask: 'Use your gradient and the model to find the <b>height of the bench</b>. Show your working.',
        steps: [{ label: 'The model’s gradient, √(2h ÷ g), squared', value: round(s * s, 5), unit: 's²', tol: 0.08 }, { label: 'Height of the bench', value: round(H, 3), unit: 'm', tol: 0.08 }],
        from: { part: 1, value: heightFrom, tol: 0.04 },
        working: `The gradient is √(2h ÷ g) = ${sig(s, 3)} s. Squaring: 2h ÷ g = ${sig(s * s, 3)} s², so h = g × ${sig(s * s, 3)} ÷ 2 = 9.8 × ${sig(s * s, 3)} ÷ 2 ≈ <b>${num(H, 2)} m</b>.` },
      { kind: 'written', ask: 'Explain why the graph of <i>x</i> against <i>v</i> is a straight line through the origin.', lines: 3,
        points: ['x = (√(2h ÷ g)) × v has the form y = mx', 'h and g are the same for every throw, so the gradient √(2h ÷ g) is constant and there is no intercept: the line passes through the origin'],
        model: 'The model x = (√(2h ÷ g)) v has the form y = mx. The height and g don’t change between throws, so √(2h ÷ g) is a constant gradient, and with no added constant the line goes through the origin: a ball leaving at 0 m/s lands at the foot of the bench.' },
      { kind: 'written', ask: 'Describe how the ball’s <b>horizontal</b> and <b>vertical</b> velocities change from when it leaves the bench until just before it lands. Explain your reasoning.', lines: 5, topic: null,
        points: ['The horizontal velocity stays the same, because no horizontal force acts (air resistance is neglected)', 'The vertical velocity starts at zero and increases steadily downwards', 'because gravity gives it a constant downward acceleration of 9.8 m/s²'],
        model: 'Across, nothing pushes or pulls the ball once it leaves the bench, so its horizontal velocity stays the same all the way down. Up and down, it starts with no vertical velocity, and gravity speeds it up downwards by 9.8 m/s every second, so its vertical velocity grows steadily until it lands.',
        notes: ['Saying the ball “slows down” across loses the first mark: without air resistance nothing slows it.'] },
    ],
  };
}

// the parts every lab ends with: a source of error in the set-up itself, marked on being specific
const errorPart = (ask, source, model) => ({
  kind: 'written', ask, lines: 4,
  points: [`Names a specific source in the set-up, such as ${source}`, 'Says how it changes the results: which readings come out too big or too small, or scattered about the line'],
  model,
  notes: ['“Human error”, “measuring wrong” or “air resistance” on their own earn nothing: name something in the set-up itself, and what it does to the readings.'],
});

// a launcher fired at different angles: R = (v² ÷ g) × sin 2θ, so R against sin 2θ is a straight line through the origin
// whose gradient, v² ÷ g, gives the launch speed. The angles are all below 45°, all above it, or on both sides (where θ
// and 90° − θ land together); either way sin 2θ is spread from about 0.5 or less up to nearly 1
function launcherAngles(d) {
  const v = d.pick([4.2, 4.4, 4.6, 4.8, 5, 5.2, 5.4, 5.6, 5.8, 6]);
  const angles = d.pick([[10, 15, 20, 25, 30, 35, 40], [15, 20, 25, 30, 35, 40], [50, 55, 60, 65, 70, 75, 80], [50, 55, 60, 65, 70, 75],
    [10, 20, 30, 40, 50, 60, 70], [15, 25, 35, 45, 55, 65, 75], [20, 30, 40, 50, 60, 70, 80]]);
  const s2 = angles.map((a) => sin(2 * a));
  const Rcm = s2.map((s) => round(noisy(d, ((v * v) / g) * s * 100, 0.02), 1)), Rm = Rcm.map((c) => round(c / 100, 4));
  const fit = bestFit(s2.map((s, i) => [s, Rm[i]])), m = fit.slope, v2 = g * m, vf = Math.sqrt(v2);
  const speedFrom = (line) => (line.y === 'R' && line.x === 's2' ? Math.sqrt(g * line.slope) : line.y === 's2' && line.x === 'R' ? Math.sqrt(g / line.slope) : null);
  const ball = d.pick(['small steel ball', 'plastic ball', 'rubber ball']);
  return {
    title: 'Launching at different angles',
    intro: `<p>A student clamps a spring-loaded launcher to a bench and fires a ${ball} across the lab at different angles <i>θ</i> above the horizontal. The spring is pulled back to the same notch every time, so the ball always leaves at the same speed <i>v</i>. It lands on a second bench at the same height as the point where it leaves the launcher, and the student measures its range <i>R</i>: the horizontal distance from that point to where it lands.</p><p>For a projectile that lands at the height it was launched from, the supplied model is</p><p class="model"><span class="f">R = v² sin 2θ ÷ g</span></p><p>where <i>g</i> = 9.8 m/s². Air resistance can be neglected. The student wants to use the data to find the launch speed.</p>`,
    figures: [dataTable(['Launch angle <i>θ</i> (°)', 'Range <i>R</i> (cm)'], angles.map((a, i) => [String(a), fix(Rcm[i], 1)]), 'Average of three launches at each angle')],
    parts: [
      { kind: 'table', ask: 'Process the data: write each range in metres, and work out sin 2<i>θ</i> for each angle (to 3 decimal places).',
        head: ['<i>θ</i> (°)', '<i>R</i> (cm)', '<i>R</i> (m)', 'sin 2<i>θ</i>'], rows: angles.map((a, i) => [String(a), fix(Rcm[i], 1), null, null]),
        fill: { 2: { values: Rm, tol: 0.005, unit: 'm' }, 3: { values: s2.map((s) => round(s, 3)), tol: { abs: 0.002 } } },
        working: `Divide each range by 100: ${fix(Rcm[0], 1)} cm = ${num(Rm[0], 4)} m. Double each angle before taking the sine (with the calculator in degrees): sin (2 × ${angles[0]}°) = sin ${2 * angles[0]}° = ${fix(s2[0], 3)}, and so on.` },
      { kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find the launch speed, and draw the line of best fit.',
        quantities: {
          R: { label: '<i>R</i> (m)', values: Rm }, th: { label: '<i>θ</i> (°)', values: angles }, s1: { label: 'sin <i>θ</i>', values: angles.map(sin) },
          c1: { label: 'cos <i>θ</i>', values: angles.map(cos) }, s2: { label: 'sin 2<i>θ</i>', values: s2 },
        },
        pairs: [['R', 's2'], ['s2', 'R']],
        working: 'The model is R = (v² ÷ g) × sin 2θ: the same shape as y = mx, with R on the y-axis, sin 2θ on the x-axis and the gradient m = v² ÷ g, which is the same for every launch. So plot R against sin 2θ: a straight line through the origin. (R against θ curves, because R follows sin 2θ, not the angle itself.)' },
      { kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: round(m, 4), unit: '', tol: 0.05, from: { part: 1, value: (line) => line.slope, tol: 0.02 },
        working: `Gradient = Δy ÷ Δx between two points far apart on the line: about <b>${sig(m, 3)} m</b> for R (m) against sin 2θ (which has no units).` },
      { kind: 'steps', ask: 'Use your gradient and the model to find the <b>launch speed</b> <i>v</i>. Show your working.',
        steps: [{ label: '<i>v</i>² = gradient × <i>g</i>', value: round(v2, 4), unit: 'm²/s²', tol: 0.08 }, { label: 'Launch speed <i>v</i>', value: round(vf, 3), unit: 'm/s', tol: 0.05 }],
        from: { part: 1, value: speedFrom, tol: 0.04 },
        working: `The gradient is v² ÷ g = ${sig(m, 3)} m, so v² = 9.8 × ${sig(m, 3)} = ${sig(v2, 3)} m²/s² and v = √${sig(v2, 3)} ≈ <b>${num(vf, 2)} m/s</b>.` },
      { kind: 'written', ask: 'Use the model to show that √(<i>g</i> × gradient) has the units of a speed.', lines: 4,
        points: ['sin 2θ has no units, so the gradient (a change in R ÷ a change in sin 2θ) is in m', 'g × gradient is in m/s² × m = m²/s², and √(m²/s²) = m/s, the units of a speed'],
        model: 'The gradient is a change in R (in m) divided by a change in sin 2θ, which has no units (it is a ratio of two lengths), so the gradient is in m. Then g × gradient is in m/s² × m = m²/s², and its square root is in m/s: the units of a speed.',
        notes: ['Write the units at every step: saying “it’s a speed” doesn’t prove it.'] },
      errorPart('Identify <b>one source of error in the set-up</b> of this experiment, and say how it would affect the ranges.',
        'the launcher recoiling or sliding when it fires (so the angle changes), its angle scale read from the side, the landing bench lower or higher than the launch point, or the range measured from the launcher’s base rather than from where the ball leaves it',
        'The launcher can jerk back or slide a little each time it fires, so the angle and the launch point change from shot to shot. That scatters the ranges about the line: some land shorter or longer than the set angle should give.'),
      { kind: 'written', ask: 'Explain why the model gives a straight line <b>through the origin</b> for <i>R</i> against sin 2<i>θ</i>.', lines: 3, marks: 2,
        points: ['R = (v² ÷ g) × sin 2θ has the form y = mx', 'v² ÷ g is the same for every launch (the same speed every time, and g doesn’t change), so the gradient is constant', 'There is no added constant: R = 0 when sin 2θ = 0, as a ball fired flat along the bench (0°) or straight up (90°) lands where it started'],
        model: 'The model R = (v² ÷ g) × sin 2θ has the form y = mx with y = R and x = sin 2θ. The ball leaves at the same speed every time and g doesn’t change, so the gradient v² ÷ g is constant: a straight line. There is no added constant, so R = 0 when sin 2θ = 0: a ball fired flat along the bench, or straight up, lands back where it started.' },
    ],
  };
}

// a marble launched sideways at one speed from different heights: x = v√(2h ÷ g), so x² against h (or x against √h) is
// a straight line through the origin whose gradient gives the launch speed
function fromHeights(d) {
  const v = d.pick([1.4, 1.5, 1.6, 1.8, 2, 2.2, 2.4]), h0 = d.pick([10, 15]), dh = d.pick([15, 20]), n = d.pick([6, 7]);
  const hcm = Array.from({ length: n }, (_, i) => h0 + i * dh), hm = hcm.map((c) => c / 100);
  const xcm = hm.map((h) => round(noisy(d, v * Math.sqrt((2 * h) / g) * 100, 0.02), 1)), xm = xcm.map((c) => round(c / 100, 4)), x2 = xm.map((x) => x * x);
  const fit = bestFit(hm.map((h, i) => [h, x2[i]])), m = fit.slope, v2 = (g * m) / 2, vf = Math.sqrt(v2);
  const speedFrom = (line) => {
    const s = line.slope;
    if (line.y === 'x2' && line.x === 'h') return Math.sqrt((g * s) / 2);
    if (line.y === 'h' && line.x === 'x2') return Math.sqrt(g / (2 * s));
    if (line.y === 'x' && line.x === 'rh') return s * Math.sqrt(g / 2);
    if (line.y === 'rh' && line.x === 'x') return Math.sqrt(g / 2) / s;
    return null;
  };
  const ball = d.pick(['marble', 'small steel ball', 'glass marble']);
  return {
    title: 'Launching from different heights',
    intro: `<p>A student clamps a short curved ramp to a tall stand so that the end of the ramp is level. They let a ${ball} go from the same mark on the ramp every time, so it always leaves the end horizontally at the same speed <i>v</i>. They slide the ramp up the stand to change the height <i>h</i> of its end above the floor, and measure where the ${ball} lands, <i>x</i>, from the point directly below the end of the ramp (found with a plumb line).</p><p>For something launched horizontally from a height <i>h</i>, the supplied model is</p><p class="model"><span class="f">x = v √(2h ÷ g)</span></p><p>where <i>g</i> = 9.8 m/s². Air resistance can be neglected. The student wants to use the data to find the speed at which the ${ball} leaves the ramp.</p>`,
    figures: [dataTable(['Height of the end of the ramp <i>h</i> (cm)', 'Landing distance <i>x</i> (cm)'], hcm.map((c, i) => [String(c), fix(xcm[i], 1)]), 'Average of three readings at each height')],
    parts: [
      { kind: 'table', ask: 'Process the data: write each height in metres, and work out <i>x</i>² in m² (change <i>x</i> to metres first).',
        head: ['<i>h</i> (cm)', '<i>x</i> (cm)', '<i>h</i> (m)', '<i>x</i>² (m²)'], rows: hcm.map((c, i) => [String(c), fix(xcm[i], 1), null, null]),
        fill: { 2: { values: hm, tol: 0.005, unit: 'm' }, 3: { values: x2.map((a) => round(a, 4)), tol: 0.01, unit: 'm²' } },
        working: `Divide by 100 to get metres: ${hcm[0]} cm = ${num(hm[0])} m, and ${fix(xcm[0], 1)} cm = ${num(xm[0], 4)} m, so x² = ${num(xm[0], 4)}² = ${num(x2[0], 4)} m², and so on.` },
      { kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find the launch speed, and draw the line of best fit.',
        quantities: {
          x2: { label: '<i>x</i>² (m²)', values: x2 }, h: { label: '<i>h</i> (m)', values: hm }, x: { label: '<i>x</i> (m)', values: xm },
          rh: { label: '√<i>h</i> (√m)', values: hm.map(Math.sqrt) }, h2: { label: '<i>h</i>² (m²)', values: hm.map((a) => a * a) },
        },
        pairs: [['x2', 'h'], ['h', 'x2'], ['x', 'rh'], ['rh', 'x']],
        working: 'Square both sides of the model: x² = (2v² ÷ g) × h, the same shape as y = mx, with the gradient 2v² ÷ g, which is the same at every height. So plot x² on the y-axis against h on the x-axis: a straight line through the origin. (x against √h is straight too, with the gradient v√(2 ÷ g). x against h is not: it curves over.)' },
      { kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: round(m, 4), unit: '', tol: 0.05, from: { part: 1, value: (line) => line.slope, tol: 0.02 },
        working: `Gradient = Δy ÷ Δx between two points far apart on the line: about <b>${sig(m, 3)} m</b> for x² (m²) against h (m).` },
      { kind: 'steps', ask: 'Use your gradient and the model to find the <b>launch speed</b> <i>v</i>. Show your working.',
        steps: [{ label: '<i>v</i>² = gradient × <i>g</i> ÷ 2', value: round(v2, 4), unit: 'm²/s²', tol: 0.08 }, { label: 'Launch speed <i>v</i>', value: round(vf, 3), unit: 'm/s', tol: 0.05 }],
        from: { part: 1, value: speedFrom, tol: 0.04 },
        working: `The gradient is 2v² ÷ g = ${sig(m, 3)} m, so v² = ${sig(m, 3)} × 9.8 ÷ 2 = ${sig(v2, 3)} m²/s², and v = √${sig(v2, 3)} ≈ <b>${num(vf, 2)} m/s</b>. (From a graph of x against √h, the gradient is v√(2 ÷ g), so v = gradient × √(g ÷ 2).)` },
      { kind: 'written', ask: 'Use the model to show that √(gradient × <i>g</i> ÷ 2) has the units of a speed.', lines: 4,
        points: ['The gradient of x² against h is in m² ÷ m = m', 'gradient × g ÷ 2 is in m × m/s² = m²/s² (the 2 has no units), and √(m²/s²) = m/s, the units of a speed'],
        model: 'The gradient is a change in x² (m²) divided by a change in h (m), so it is in m² ÷ m = m. Multiplying by g gives m × m/s² = m²/s², and dividing by 2 changes nothing. The square root of m²/s² is m/s: the units of a speed.',
        notes: ['Write the units at every step, and work with SI units (m, not cm).'] },
      errorPart(`Identify <b>one source of error in the set-up</b> of this experiment, and say how it would affect the landing distances.`,
        `the end of the ramp not quite level (so the ${ball} leaves slightly upward or downward), the ${ball} let go from a slightly different mark each time, h measured to the top of the ramp’s end rather than to the bottom of the ${ball}, or x measured from the foot of the stand rather than from the point below the end of the ramp`,
        `The end of the ramp might tilt slightly downward, so the ${ball} leaves a little below horizontal and lands short. The tilt changes a little each time the ramp is moved up the stand, so the landing distances are scattered about the line.`),
      { kind: 'written', ask: 'Explain why the model gives a straight line <b>through the origin</b> for <i>x</i>² against <i>h</i>.', lines: 3, marks: 2,
        points: ['x² = (2v² ÷ g) × h has the form y = mx', '2v² ÷ g is the same at every height (the same launch speed each time, and g doesn’t change), so the gradient is constant', `There is no added constant: launched from h = 0 (from the floor), the ${ball} lands where it leaves, x = 0`],
        model: `Squaring the model gives x² = (2v² ÷ g) × h, which has the form y = mx. The ${ball} leaves at the same speed from every height and g doesn’t change, so the gradient 2v² ÷ g is constant: a straight line. There is no added constant, so the line passes through the origin: from a height of zero the ${ball} would land where it left the ramp.` },
    ],
  };
}

// a ball rolled down a ramp from different heights and off the bench: v² = 2kgH, so x² = 4khH, and x² against H is a
// straight line whose gradient gives k, the share of the energy the ball loses that becomes forward motion. H is
// measured from the bench top, but the bottom of the ramp sits b above it, so the line crosses the H-axis at about b
function rampRelease(d) {
  const h = d.pick([0.82, 0.85, 0.88, 0.9, 0.92, 0.95]), k = d.pick([0.56, 0.58, 0.6, 0.62, 0.64, 0.66]), b = d.pick([2, 2.5, 3, 3.5]);
  const H0 = d.pick([6, 8, 10]), dH = d.pick([5, 6]), n = d.pick([6, 7]);
  const Hcm = Array.from({ length: n }, (_, i) => H0 + i * dH), Hm = Hcm.map((c) => c / 100);
  const xcm = Hm.map((H) => round(noisy(d, 2 * Math.sqrt(k * h * (H - b / 100)) * 100, 0.015), 1)), xm = xcm.map((c) => round(c / 100, 4)), x2 = xm.map((x) => x * x);
  const fit = bestFit(Hm.map((H, i) => [H, x2[i]])), m = fit.slope, kf = m / (4 * h), cross = -fit.intercept / m;
  const kFrom = (line) => (line.y === 'x2' && line.x === 'H' ? line.slope / (4 * h) : line.y === 'H' && line.x === 'x2' ? 1 / (4 * h * line.slope) : null);
  const crossFrom = (line) => (line.y === 'x2' && line.x === 'H' ? -line.intercept / line.slope : line.y === 'H' && line.x === 'x2' ? line.intercept : null);
  const parts = [
    { kind: 'table', ask: 'Process the data: write each release height in metres, and work out <i>x</i>² in m² (change <i>x</i> to metres first).',
      head: ['<i>H</i> (cm)', '<i>x</i> (cm)', '<i>H</i> (m)', '<i>x</i>² (m²)'], rows: Hcm.map((c, i) => [String(c), fix(xcm[i], 1), null, null]),
      fill: { 2: { values: Hm, tol: 0.005, unit: 'm' }, 3: { values: x2.map((a) => round(a, 4)), tol: 0.01, unit: 'm²' } },
      working: `Divide by 100 to get metres: ${Hcm[0]} cm = ${num(Hm[0])} m, and ${fix(xcm[0], 1)} cm = ${num(xm[0], 4)} m, so x² = ${num(xm[0], 4)}² = ${num(x2[0], 4)} m², and so on.` },
    { kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find <i>k</i>, and draw the line of best fit.',
      quantities: {
        x2: { label: '<i>x</i>² (m²)', values: x2 }, H: { label: '<i>H</i> (m)', values: Hm }, x: { label: '<i>x</i> (m)', values: xm },
        rx: { label: '√<i>x</i> (√m)', values: xm.map(Math.sqrt) }, H2: { label: '<i>H</i>² (m²)', values: Hm.map((a) => a * a) },
      },
      pairs: [['x2', 'H'], ['H', 'x2']],
      working: 'The model x² = (4kh) × H has the same shape as y = mx, with x² on the y-axis, H on the x-axis and the gradient 4kh, which is the same for every release. So plot x² against H: a straight line. (x against H curves over.)' },
    { kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: round(m, 4), unit: '', tol: 0.05, from: { part: 1, value: (line) => line.slope, tol: 0.02 },
      working: `Gradient = Δy ÷ Δx between two points far apart on the line: about <b>${sig(m, 3)} m</b> for x² (m²) against H (m).` },
    { kind: 'steps', ask: `Use your gradient and the model to find <b><i>k</i></b>. The end of the ramp is <i>h</i> = ${num(h)} m above the floor. Show your working.`,
      steps: [{ label: 'The gradient ÷ 4, which is <i>k</i> × <i>h</i>', value: round(m / 4, 4), unit: 'm', tol: 0.08 }, { label: '<i>k</i>', value: round(kf, 4), unit: '', tol: 0.06 }],
      from: { part: 1, value: kFrom, tol: 0.04 },
      working: `The gradient is 4kh = ${sig(m, 3)} m, so kh = ${sig(m, 3)} ÷ 4 = ${sig(m / 4, 3)} m, and k = ${sig(m / 4, 3)} ÷ ${num(h)} ≈ <b>${num(kf, 2)}</b>.` },
    { kind: 'number', ask: 'The model says the line should pass through the origin, but your line of best fit doesn’t. Where does it cross the <i>H</i>-axis? Give your answer in metres.', value: round(cross, 4), unit: 'm', tol: { abs: 0.006 },
      from: { part: 1, value: crossFrom, tol: { abs: 0.004 } },
      working: `The line of best fit is x² = ${sig(m, 3)}H ${plus(fit.intercept)}, which is zero (it meets the H-axis) at H = <b>${num(cross, 3)} m</b>, about ${num(cross * 100, 1)} cm. Read it where your own line crosses the H-axis.` },
    { kind: 'written', ask: 'Use the model to explain what this intercept tells you about how the release heights <i>H</i> were measured.', lines: 5,
      points: [`At the intercept x = 0: a ball let go from about ${num(cross * 100, 0)} cm would leave the ramp with no speed, so it hasn’t really dropped at all`,
        `So the ball drops about ${num(cross * 100, 0)} cm less than each measured H: the heights were measured from the bench top, but the bottom of the ramp (where the ball leaves it) is about that far above the bench`,
        'The same amount is added to every reading (a systematic error), so it shifts the line sideways but doesn’t change its gradient, or k'],
      model: `By the model, x = 0 only when the ball drops no height at all. The line reaches x = 0 at H ≈ ${num(cross * 100, 0)} cm, so the ball’s real drop is about ${num(cross * 100, 0)} cm less than every measured H: the student measured from the bench top, but the bottom of the ramp, where the ball leaves it, is about ${num(cross * 100, 0)} cm above the bench. The same amount is added to every reading, so the line moves sideways but its gradient, and so k, is still right.`,
      notes: ['“Human error” or “the data is wrong” isn’t enough: say what the intercept means for the ball and how H was measured.', 'Use the gradient, not a single reading of x² ÷ H, to find k: the intercept makes every single reading give the wrong answer.'] },
  ];
  // and one more: why k is less than 1 (when the data gives a value below a rolling ball's 5/7), or a source of error
  if (kf < 0.7 && d.chance(0.6)) {
    parts.push({ kind: 'written', ask: 'For a solid ball that rolls without slipping, theory gives <i>k</i> = 5/7 ≈ 0.71. Using ideas about <b>energy</b>, explain why <i>k</i> is less than 1, and suggest why the student’s value is lower than 0.71.', lines: 5,
      points: ['As the ball rolls down, the gravitational potential energy it loses (mgH) is transferred to kinetic energy',
        'The ball spins as it rolls, so some of that energy becomes rotational kinetic energy, not the kinetic energy of moving forward: ½mv² is less than mgH, so k < 1',
        'Some is also transferred to heat and sound by friction as the ball rubs and bumps along the ramp (or it rolls in a groove and spins faster), so k comes out below 5/7'],
      model: 'Going down the ramp the ball loses gravitational potential energy, mgH. If all of it became the kinetic energy of moving forward, ½mv² = mgH and k would be 1. But a rolling ball also spins, so part of the energy is rotational kinetic energy, leaving less for moving forward: k < 1. On a real ramp some energy is also transferred to heat and sound by friction and by the ball rattling along the track, so even less is left for moving forward, and k is lower than 5/7.',
      notes: ['“Energy is lost” on its own isn’t enough: say where it goes (into spinning, heat or sound).'] });
  } else {
    parts.push(errorPart('Apart from how <i>H</i> was measured, identify <b>one source of error in the set-up</b> of this experiment, and say how it would affect the results.',
      'the ball given a small push or let go from slightly different heights, the end of the ramp not quite level, the ramp slipping as the ball rolls, or the landing point judged by eye where the ball bounces (instead of marked with carbon paper)',
      'Where the ball lands is judged by eye as it bounces off the floor, so each x could be a few centimetres out either way. That scatters the points about the line and makes its gradient, and so k, less certain.'));
  }
  return {
    title: 'Rolling down a ramp',
    intro: `<p>A student clamps a curved ramp at the edge of a bench so that its bottom end is level, ${num(h)} m above the floor. They let a steel ball roll down from different release heights <i>H</i>, measuring each one from the bench top to the bottom of the ball, and measure how far from the foot of the bench the ball lands, <i>x</i>.</p><p>If all the energy the ball loses on the ramp became forward motion, it would leave with <i>v</i>² = 2<i>gH</i>. A rolling ball also spins, so only a share <i>k</i> of it does: <i>v</i>² = 2<i>kgH</i>, where <i>H</i> is the height the ball drops. With the time it takes to fall to the floor, the supplied model is</p><p class="model"><span class="f">x² = 4khH</span></p><p>where <i>h</i> = ${num(h)} m and <i>k</i> is a constant for this ball and ramp. Air resistance can be neglected. The student wants to use the data to find <i>k</i>.</p>`,
    figures: [dataTable(['Release height <i>H</i> (cm)', 'Landing distance <i>x</i> (cm)'], Hcm.map((c, i) => [String(c), fix(xcm[i], 1)]), 'Average of three readings at each height')],
    parts,
  };
}

// a jet of water from a hose held level, the tap opened by different amounts: the water leaves at v = Q ÷ A, so
// x = (Q ÷ A)√(2h ÷ g), and x against the flow rate Q is a straight line through the origin whose gradient gives the
// area of the nozzle's opening, and so its diameter
function hoseJet(d) {
  const h = d.pick([0.8, 0.9, 1, 1.1, 1.2]), dmm = d.pick([6, 7, 8, 9, 10]), A = Math.PI * (dmm / 2000) ** 2, litres = dmm <= 7 ? 5 : 10;
  const tf = fall(h), v0 = d.pick([1.6, 1.8, 2]), dv = d.pick([0.7, 0.8, 0.9]), speeds = Array.from({ length: 6 }, (_, i) => v0 + i * dv);
  const times = speeds.map((s) => round(noisy(d, litres / 1000 / (A * s), 0.015), 1)), Q = times.map((t) => litres / 1000 / t);
  const xcm = speeds.map((s) => round(noisy(d, s * tf * 100, 0.02), 0)), xm = xcm.map((c) => c / 100);
  const fit = bestFit(Q.map((q, i) => [q, xm[i]])), m = fit.slope, Af = tf / m, df = 2000 * Math.sqrt(Af / Math.PI);
  const diameterFrom = (line) => {
    const m = line.slope, area = { 'x Q': tf / m, 'Q x': m * tf, 'x2 Q2': tf / Math.sqrt(m), 'Q2 x2': tf * Math.sqrt(m) }[`${line.y} ${line.x}`];
    return area > 0 ? 2000 * Math.sqrt(area / Math.PI) : null;
  };
  return {
    title: 'A jet of water',
    intro: `<p>A student clamps the nozzle of a garden hose so that it points horizontally, ${num(h)} m above a flat lawn, and opens the tap by different amounts. At each setting they time how long the hose takes to fill a ${litres} L bucket, which gives the flow rate <i>Q</i> (the volume of water each second), and measure how far the jet lands from the point below the nozzle, <i>x</i>.</p><p>The water leaves the nozzle at <i>v</i> = <i>Q</i> ÷ <i>A</i>, where <i>A</i> is the area of the nozzle’s opening, so the supplied model is</p><p class="model"><span class="f">x = (Q ÷ A) √(2h ÷ g)</span></p><p>where <i>g</i> = 9.8 m/s². Air resistance can be neglected. The opening is too small to measure with a ruler, so the student wants to use the data to find its diameter.</p>`,
    guide: '<ul><li>Flow rate: <span class="f">Q = volume ÷ time</span></li><li>Area of a circle of diameter d: <span class="f">A = πd² ÷ 4</span></li></ul>',
    figures: [dataTable(['Tap setting', `Time to fill the ${litres} L bucket (s)`, 'Landing distance <i>x</i> (cm)'], times.map((t, i) => [String(i + 1), fix(t, 1), String(xcm[i])]), 'One reading at each setting')],
    parts: [
      { kind: 'table', ask: `Process the data: work out each flow rate <i>Q</i> in m³/s (the ${litres} L divided by the time), and write each landing distance in metres.`,
        head: ['Setting', 'Time (s)', '<i>x</i> (cm)', '<i>Q</i> (m³/s)', '<i>x</i> (m)'], rows: times.map((t, i) => [String(i + 1), fix(t, 1), String(xcm[i]), null, null]),
        fill: { 3: { values: Q.map((q) => Number(q.toPrecision(4))), tol: 0.01, unit: 'm³/s' }, 4: { values: xm, tol: 0.005, unit: 'm' } },
        working: `${litres} L = ${num(litres / 1000, 3)} m³, so at setting 1, Q = ${num(litres / 1000, 3)} ÷ ${fix(times[0], 1)} = ${sig(Q[0], 3)} m³/s. Divide each distance by 100: ${xcm[0]} cm = ${num(xm[0])} m, and so on.` },
      { kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find the area of the nozzle’s opening, and draw the line of best fit.',
        quantities: {
          x: { label: '<i>x</i> (m)', values: xm }, Q: { label: '<i>Q</i> (m³/s)', values: Q }, t: { label: 'time to fill (s)', values: times },
          x2: { label: '<i>x</i>² (m²)', values: xm.map((a) => a * a) }, Q2: { label: '<i>Q</i>² (m⁶/s²)', values: Q.map((q) => q * q) },
        },
        pairs: [['x', 'Q'], ['Q', 'x'], ['x2', 'Q2'], ['Q2', 'x2']],
        working: 'The model is x = (√(2h ÷ g) ÷ A) × Q: the same shape as y = mx, with x on the y-axis, Q on the x-axis and the gradient √(2h ÷ g) ÷ A, which is the same at every setting. So plot x against Q: a straight line through the origin. (x against the time to fill curves the other way: a longer time means a slower flow.)' },
      { kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: round(m, 0), unit: '', tol: 0.05, from: { part: 1, value: (line) => line.slope, tol: 0.02 },
        working: `Gradient = Δy ÷ Δx between two points far apart on the line: about <b>${sig(m, 3)} s/m²</b> for x (m) against Q (m³/s).` },
      { kind: 'steps', ask: 'Use your gradient and the model to find the <b>inside diameter of the nozzle</b>. Show your working.',
        steps: [{ label: 'Time the water takes to fall to the lawn, √(2<i>h</i> ÷ <i>g</i>)', value: round(tf, 4), unit: 's', tol: 0.02 },
          { label: 'Area of the opening, <i>A</i> = √(2<i>h</i> ÷ <i>g</i>) ÷ gradient', value: Number(Af.toPrecision(4)), unit: 'm²', tol: 0.08 },
          { label: 'Inside diameter of the nozzle', value: round(df, 2), unit: 'mm', tol: 0.05 }],
        from: { part: 1, value: diameterFrom, tol: 0.04 },
        working: `The gradient is √(2h ÷ g) ÷ A. The water falls ${num(h)} m in √(2 × ${num(h)} ÷ 9.8) = ${num(tf, 3)} s, so A = ${num(tf, 3)} ÷ ${sig(m, 3)} = ${sig(Af, 3)} m². A = πd² ÷ 4, so d = √(4A ÷ π) = ${sig(df / 1000, 3)} m = <b>${num(df, 1)} mm</b>.` },
      { kind: 'written', ask: 'Use the model to show that √(2<i>h</i> ÷ <i>g</i>) ÷ gradient has the units of an area.', lines: 5,
        points: ['√(2h ÷ g) is in √(m ÷ m/s²) = √(s²) = s', 'The gradient (a change in x ÷ a change in Q) is in m ÷ m³/s = s/m²', 's ÷ s/m² = m², the units of an area'],
        model: 'The 2 has no units, so √(2h ÷ g) is in √(m ÷ m/s²) = √(s²) = s: it is the time to fall. The gradient is a change in x (m) divided by a change in Q (m³/s), so it is in m × s/m³ = s/m². Then s ÷ s/m² = s × m²/s = m²: the units of an area.',
        notes: ['Write the units at every step, in SI units: m³/s for the flow rate, not L/s.'] },
      errorPart('Identify <b>one source of error in the set-up</b> of this experiment, and say how it would affect the results.',
        'the nozzle drooping under the weight of the hose (so the jet points slightly down), the jet breaking into drops so it lands over a patch, the water pressure changing while the bucket fills, or the bucket’s fill line read from above at an angle',
        'The weight of the full hose can pull the nozzle down a little, so the jet leaves slightly below horizontal and lands short. It pulls more at higher flow rates, so the biggest landing distances come out too small.'),
      { kind: 'written', ask: 'Explain why the model gives a straight line <b>through the origin</b> for <i>x</i> against <i>Q</i>.', lines: 3, marks: 2,
        points: ['x = (√(2h ÷ g) ÷ A) × Q has the form y = mx', 'h, g and A are the same for every reading (the same nozzle at the same height), so the gradient is constant', 'There is no added constant: with no flow (Q = 0) the water leaves with no speed and drips straight down, x = 0'],
        model: 'The model x = (√(2h ÷ g) ÷ A) × Q has the form y = mx. The nozzle and its height don’t change and g is constant, so the gradient √(2h ÷ g) ÷ A is the same at every setting: a straight line. There is no added constant, so it passes through the origin: with the tap off, no water leaves and x = 0.' },
    ],
  };
}

// ---------- 2. problems: a calculation a step at a time ----------
// something thrown up at an angle from a sea cliff: how high it rises, how long it's in the air, where it lands and how
// fast it hits the water, and a reason (the same place if it's heavier, or less time if it's thrown flat)
function intoTheSea(d) {
  const h = d.pick([24, 28, 30, 32, 36, 40, 45]), v = d.pick([12, 14, 15, 16, 18, 20]), a = d.pick([20, 25, 30, 35, 40]);
  const [who, obj] = d.pick([['A walker', 'stone'], ['A climber', 'pebble'], ['A student on a field trip', 'stone'], ['A tourist', 'small rubber ball']]);
  const vx = v * cos(a), uy = v * sin(a), tUp = uy / g, rise = (uy * uy) / (2 * g), top = h + rise;
  const tDown = fall(top), tf = tUp + tDown, X = vx * tf, vy = g * tDown, speed = Math.hypot(vx, vy);
  const parts = [
    { kind: 'steps', ask: `How high above the sea does the ${obj} rise?`, topic: T.height,
      steps: [{ label: 'Vertical part of the launch velocity, <i>u</i><sub>y</sub>', value: round(uy, 3), unit: 'm/s' }, { label: 'Height it rises above the top of the cliff', value: round(rise, 3), unit: 'm' }, { label: 'Greatest height above the sea', value: round(top, 2), unit: 'm' }],
      working: `u<sub>y</sub> = v sin θ = ${v} × sin ${a}° = ${num(uy)} m/s. At the highest point v<sub>y</sub> = 0, so 0 = u<sub>y</sub>² − 2gy gives y = ${num(uy)}² ÷ (2 × 9.8) = ${num(rise)} m above the cliff top: <b>${num(top, 1)} m</b> above the sea.` },
    { kind: 'steps', ask: `How long is the ${obj} in the air before it hits the water?`, topic: T.high,
      steps: [{ label: 'Time to reach its highest point', value: round(tUp, 4), unit: 's' }, { label: 'Time to fall from its highest point to the sea', value: round(tDown, 4), unit: 's' }, { label: 'Time in the air', value: round(tf, 4), unit: 's' }],
      working: `Up: v<sub>y</sub> = u<sub>y</sub> − gt is zero at the top, so t = ${num(uy)} ÷ 9.8 = ${num(tUp)} s. Down: it falls ${num(top)} m from rest, so t = √(2 × ${num(top)} ÷ 9.8) = ${num(tDown)} s. Altogether <b>${num(tf)} s</b>. (Solving −${h} = ${num(uy)}t − 4.9t² for t gives the same.)` },
    { kind: 'steps', ask: `How far from the foot of the cliff does the ${obj} land?`, topic: T.high,
      steps: [{ label: 'Horizontal part of the launch velocity, <i>v</i><sub>x</sub>', value: round(vx, 3), unit: 'm/s' }, { label: 'Distance from the foot of the cliff', value: round(X, 2), unit: 'm' }],
      working: `Across, nothing changes its velocity: v<sub>x</sub> = ${v} × cos ${a}° = ${num(vx)} m/s for the whole ${num(tf)} s, so x = ${num(vx)} × ${num(tf)} = <b>${num(X, 1)} m</b>.` },
    { kind: 'steps', ask: `How fast is the ${obj} moving as it hits the water?`, topic: T.high,
      steps: [{ label: 'How fast it is moving downward as it hits the water', value: round(vy, 3), unit: 'm/s' }, { label: 'Its speed as it hits the water', value: round(speed, 3), unit: 'm/s' }],
      working: `It falls from rest at the top for ${num(tDown)} s, so v<sub>y</sub> = gt = 9.8 × ${num(tDown)} = ${num(vy)} m/s downward (or v<sub>y</sub>² = ${num(uy)}² + 2 × 9.8 × ${h}). It still moves across at ${num(vx)} m/s, so its speed is √(${num(vx)}² + ${num(vy)}²) = <b>${num(speed, 1)} m/s</b>.` },
  ];
  if (d.chance(0.5)) {
    parts.push({ kind: 'choice', ask: `A second ${obj} with twice the mass is thrown at the same speed and angle. Where does it land?`, ...choose(d, 'In the same place', ['Closer to the cliff', 'Farther from the cliff']),
      explain: { ask: 'Explain briefly.', lines: 3,
        points: ['Without air resistance, everything falls with the same acceleration, g = 9.8 m/s², whatever its mass', 'It leaves with the same velocity, so its horizontal and vertical motions are the same: the same time in the air and the same distance'],
        model: `Without air resistance the only force is its weight, and every object falls with the same acceleration, 9.8 m/s², whatever its mass: twice the mass means twice the weight but also twice as much to speed up. The heavier ${obj} leaves with the same velocity, so it rises as high, takes as long and lands in the same place.`,
        notes: ['“Heavier things fall faster” is the mistake this question is testing.'] } });
  } else {
    const flat = fall(h);
    parts.push({ kind: 'choice', ask: `If the ${obj} were thrown horizontally at the same speed instead, how long would it be in the air?`, ...choose(d, 'Less time than before', ['The same time as before', 'More time than before']),
      explain: { ask: 'Explain briefly.', lines: 3,
        points: ['Thrown horizontally it starts with no upward velocity, so it doesn’t rise first', `It falls only the cliff’s ${h} m from rest, which takes √(2 × ${h} ÷ 9.8) = ${num(flat)} s, less than ${num(tf)} s`],
        model: `Thrown horizontally, it has no upward velocity to lose first, so it starts falling straight away and only falls the ${h} m of the cliff: t = √(2 × ${h} ÷ 9.8) = ${num(flat)} s, less than the ${num(tf)} s it took when it rose ${num(rise, 1)} m first. Its sideways speed doesn’t change how long it falls.` } });
  }
  return {
    title: 'Into the sea',
    intro: `<p>${who} stands at the edge of a sea cliff ${h} m above the water and throws a ${obj} at ${v} m/s, ${a}° above the horizontal. It rises, then falls into the sea. Ignore air resistance.</p>`,
    figures: [scene({ v, a, h0: h, to: X, cliff: true, sea: true, dims: [heightDim(h, `${h} m`)] })],
    parts,
  };
}

// a free kick over a wall of players 9.15 m away: its height at the wall and at the goal line, whether it goes in under
// the crossbar, its highest point, and what air resistance would do
function freeKick(d) {
  const wall = 9.15, bar = 2.44;
  let v, a, D, W, vx, uy;
  const at = (x) => { const t = x / vx; return { t, y: uy * t - 0.5 * g * t * t }; };
  do {
    v = d.pick([18, 19, 20, 21, 22, 23, 24]); a = d.pick([16, 18, 20, 22, 24, 26]); D = d.pick([18, 20, 22, 25]); W = d.pick([1.9, 2, 2.1]);
    vx = v * cos(a); uy = v * sin(a);
    // (it clears the wall, and it's on its way down at the goal line, low enough to be a real chance, and clearly under
    // or over the bar)
  } while (at(wall).y < W + 0.2 || at(D).t < uy / g + 0.08 || at(D).y < 1.2 || at(D).y > 3.4 || Math.abs(at(D).y - bar) < 0.2);
  const tW = at(wall).t, yW = at(wall).y, tG = at(D).t, yG = at(D).y, tTop = uy / g, H = (uy * uy) / (2 * g), under = yG < bar;
  return {
    title: 'A free kick',
    intro: `<p>A footballer takes a free kick ${D} m from the goal line, kicking the ball from the ground at ${v} m/s, ${a}° above the horizontal, straight toward the goal. A wall of defenders stands ${wall} m from the ball, and when they jump the top of the wall is ${num(W)} m high. The goal’s crossbar is ${bar} m above the ground. Ignore air resistance and spin.</p>`,
    figures: [scene({ v, a, to: D, path: false, blocks: [{ x: wall - 0.3, w: 0.6, h: W }, { x: D, w: 0.15, h: bar, kind: 'tank' }],
      notes: [{ at: [wall, W], text: `wall, ${wall} m away`, dy: -8 }, { at: [D, bar], text: `goal, ${D} m away`, anchor: 'end', dy: -8 }] })],
    parts: [
      { kind: 'steps', ask: 'How long does the ball take to reach the wall?', topic: T.partway,
        steps: [{ label: 'Horizontal part of the launch velocity, <i>v</i><sub>x</sub>', value: round(vx, 3), unit: 'm/s' }, { label: 'Time to reach the wall', value: round(tW, 4), unit: 's' }],
        working: `v<sub>x</sub> = ${v} × cos ${a}° = ${num(vx)} m/s, and it doesn’t change, so t = ${wall} ÷ ${num(vx)} = <b>${num(tW, 3)} s</b>.` },
      { kind: 'steps', ask: 'How high is the ball when it reaches the wall? Does it clear the defenders?', topic: T.partway,
        steps: [{ label: 'Vertical part of the launch velocity, <i>u</i><sub>y</sub>', value: round(uy, 3), unit: 'm/s' }, { label: 'Height of the ball at the wall', value: round(yW, 3), unit: 'm' }],
        working: `u<sub>y</sub> = ${v} × sin ${a}° = ${num(uy)} m/s. y = u<sub>y</sub>t − ½gt² = ${num(uy)} × ${num(tW, 3)} − 4.9 × ${num(tW, 3)}² = <b>${num(yW)} m</b>: higher than the ${num(W)} m wall, so it clears the defenders.` },
      { kind: 'steps', ask: 'How high is the ball as it crosses the goal line?', topic: T.partway,
        steps: [{ label: 'Time to reach the goal line', value: round(tG, 4), unit: 's' }, { label: 'Height of the ball at the goal line', value: round(yG, 3), unit: 'm' }],
        working: `t = ${D} ÷ ${num(vx)} = ${num(tG, 3)} s, so y = ${num(uy)} × ${num(tG, 3)} − 4.9 × ${num(tG, 3)}² = <b>${num(yG)} m</b>.` },
      { kind: 'choice', ask: 'Does the ball go into the goal under the crossbar?', ...choose(d, under ? 'Yes: it is below the crossbar as it crosses the goal line' : 'No: it goes over the crossbar', [under ? 'No: it goes over the crossbar' : 'Yes: it is below the crossbar as it crosses the goal line', 'No: it lands before it reaches the goal line']),
        working: `At the goal line the ball is ${num(yG)} m up, ${under ? 'below' : 'above'} the ${bar} m crossbar, so <b>${under ? 'it goes in under the bar' : 'it goes over the bar'}</b>.` },
      { kind: 'steps', ask: 'How high above the ground does the ball rise?', topic: T.height,
        steps: [{ label: 'Time to reach its highest point', value: round(tTop, 4), unit: 's' }, { label: 'Greatest height', value: round(H, 3), unit: 'm' }],
        working: `At the top v<sub>y</sub> = 0: t = u<sub>y</sub> ÷ g = ${num(uy)} ÷ 9.8 = ${num(tTop, 3)} s, and y = ${num(uy)} × ${num(tTop, 3)} − 4.9 × ${num(tTop, 3)}² = <b>${num(H)} m</b> (or u<sub>y</sub>² ÷ 2g = ${num(uy)}² ÷ 19.6).` },
      { kind: 'written', ask: 'In a real kick, air resistance acts on the ball. Explain how it would change the height at which the ball crosses the goal line.', lines: 4,
        points: ['Air resistance acts against the ball’s motion, so it slows the ball’s horizontal velocity: it takes longer to reach the goal line', 'So gravity has longer to pull it down (and air resistance also stops it rising as high): it crosses the goal line lower than the calculation says'],
        model: 'Air resistance pushes back against the ball’s motion, so its horizontal velocity drops as it flies and it takes longer to reach the goal line. In that extra time gravity pulls it further down, and air resistance also stops it rising as high in the first place, so it crosses the goal line lower than the calculated height.',
        notes: ['Say what air resistance does to the motion (slows it, so more time in the air before the goal line), not just that the ball is “lower”.'] },
    ],
  };
}

// a tennis serve hit horizontally over the net: its height at the net, where it lands and whether it's in, the slowest
// serve that clears the net (or the fastest that lands in), and how fast it lands
function tennisServe(d) {
  const net = 0.91, toNet = 11.9, box = 6.4, line = toNet + box;
  const h = d.pick([2.4, 2.5, 2.6, 2.7, 2.8]), vMin = toNet / fall(h - net);
  const v = d.pick([20, 21, 22, 23, 24, 25, 26, 27, 28].filter((s) => s >= vMin + 0.8 && Math.abs(s * fall(h) - line) > 0.3));
  const tN = toNet / v, drop = 0.5 * g * tN * tN, yN = h - drop, tf = fall(h), X = v * tf, inside = X <= line, vy = g * tf, sp = Math.hypot(v, vy);
  const parts = [
    { kind: 'steps', ask: 'How high above the court is the ball as it passes over the net?', topic: T.ledge,
      steps: [{ label: 'Time to reach the net', value: round(tN, 4), unit: 's' }, { label: 'How far the ball has fallen by then', value: round(drop, 3), unit: 'm' }, { label: 'Height above the court at the net', value: round(yN, 3), unit: 'm' }],
      working: `Across at a steady ${v} m/s, t = ${toNet} ÷ ${v} = ${num(tN, 3)} s. Starting with no vertical velocity, it falls ½gt² = 4.9 × ${num(tN, 3)}² = ${num(drop)} m, so it is ${num(h)} − ${num(drop)} = <b>${num(yN)} m</b> up: ${num(yN - net)} m above the ${net} m net.` },
    { kind: 'steps', ask: 'How far from the server does the ball land?', topic: T.reach,
      steps: [{ label: 'Time in the air', value: round(tf, 4), unit: 's' }, { label: 'Distance from the server', value: round(X, 2), unit: 'm' }],
      working: `It falls ${num(h)} m from rest: t = √(2 × ${num(h)} ÷ 9.8) = ${num(tf, 3)} s. Across: x = ${v} × ${num(tf, 3)} = <b>${num(X, 1)} m</b>.` },
    { kind: 'choice', ask: `To be in, the serve must land before the service line, ${num(box, 1)} m beyond the net. Is this serve in?`, ...choose(d, inside ? 'In: it lands before the service line' : 'Out: it lands beyond the service line', [inside ? 'Out: it lands beyond the service line' : 'In: it lands before the service line', 'Out: it hits the net']),
      working: `The service line is ${toNet} + ${num(box, 1)} = ${num(line, 1)} m from the server, and the ball lands ${num(X, 1)} m away, so it is <b>${inside ? 'in' : 'out'}</b>.` },
  ];
  if (d.chance(0.5)) {
    parts.push({ kind: 'steps', ask: 'What is the slowest the player could serve horizontally from this height and still clear the net?', topic: T.ledge,
      steps: [{ label: 'The most the ball can fall before it reaches the net', value: round(h - net, 3), unit: 'm' }, { label: 'Time to fall that far', value: round(fall(h - net), 4), unit: 's' }, { label: 'Slowest serve', value: round(vMin, 2), unit: 'm/s' }],
      working: `To clear the net the ball can fall at most ${num(h)} − ${net} = ${num(h - net)} m by the time it gets there, which takes √(2 × ${num(h - net)} ÷ 9.8) = ${num(fall(h - net), 3)} s. In that time it must cover ${toNet} m: v = ${toNet} ÷ ${num(fall(h - net), 3)} = <b>${num(vMin, 1)} m/s</b>.` });
  } else {
    const vMax = line / tf;
    parts.push({ kind: 'steps', ask: 'What is the fastest the player could serve horizontally from this height and still land the ball in?', topic: T.speed,
      steps: [{ label: 'Time in the air', value: round(tf, 4), unit: 's' }, { label: 'Fastest serve that lands on the service line', value: round(vMax, 2), unit: 'm/s' }],
      working: `Whatever the speed, it is in the air for ${num(tf, 3)} s. To land no farther than the service line, ${num(line, 1)} m away: v = ${num(line, 1)} ÷ ${num(tf, 3)} = <b>${num(vMax, 1)} m/s</b>.` });
  }
  parts.push({ kind: 'steps', ask: 'How fast is the ball moving as it lands?', topic: T.impact,
    steps: [{ label: 'How fast it is moving downward as it lands', value: round(vy, 3), unit: 'm/s' }, { label: 'Its speed as it lands', value: round(sp, 3), unit: 'm/s' }],
    working: `v<sub>y</sub> = gt = 9.8 × ${num(tf, 3)} = ${num(vy)} m/s downward (or √(2 × 9.8 × ${num(h)})). It still moves across at ${v} m/s, so its speed is √(${v}² + ${num(vy)}²) = <b>${num(sp, 1)} m/s</b>.` });
  return {
    title: 'A tennis serve',
    intro: `<p>A tennis player serves from the baseline, hitting the ball horizontally at ${v} m/s from ${num(h)} m above the court. The net is ${toNet} m away and ${net} m high in the middle, where the ball crosses it. Ignore air resistance and spin.</p>`,
    figures: [scene({ v, h0: h, to: line, top: h, path: false, blocks: [{ x: toNet, w: 0.12, h: net, kind: 'tank' }],
      dims: [heightDim(h, `${num(h)} m`, 0, 14), groundDim(toNet, `${toNet} m`), groundDim(line, `${num(box, 1)} m`, toNet)], notes: [{ at: [toNet, net], text: 'net', dy: -8 }, { at: [line, 0], text: 'service line', anchor: 'end', dy: -40 }] })],
    parts,
  };
}

// a rope bag thrown up onto a ledge: how high it rises, when it comes down to the ledge's height (the later of the two
// times), where it lands, whether it's still rising over the edge, and how fast it lands
function ontoTheLedge(d) {
  // the front edge of the ledge, a whole or half metre out: past where the bag rises through the ledge's height, at least
  // 1 m short of where it comes back down, and not right below its highest point (so rising or falling is clear)
  let v, a, H, vx, uy, top, vyH, tH, xH, xUp, edges;
  do {
    v = d.pick([11, 12, 13, 14]); a = d.pick([55, 60, 65, 70]); H = d.pick([3, 3.5, 4, 4.5, 5]); vx = v * cos(a); uy = v * sin(a);
    top = (uy * uy) / (2 * g); vyH = Math.sqrt(Math.max(0, uy * uy - 2 * g * H)); tH = (uy + vyH) / g; xH = vx * tH; xUp = (vx * (uy - vyH)) / g;
    edges = [];
    for (let e = Math.ceil((xUp + 0.5) * 2) / 2; e <= xH - 1; e += 0.5) if (Math.abs(e - (vx * uy) / g) >= 0.4) edges.push(e);
  } while (top < H + 1 || !edges.length);
  const D = d.pick(edges), tTop = uy / g, beyond = xH - D, rising = D / vx < tTop, sp = Math.hypot(vx, vyH);
  const [who, obj] = d.pick([['A climber', 'rope bag'], ['An instructor', 'coil of rope'], ['A climber', 'chalk bag']]);
  const parts = [
    { kind: 'steps', ask: `How high above the point where it leaves the hand does the ${obj} rise?`, topic: T.height,
      steps: [{ label: 'Vertical part of the launch velocity, <i>u</i><sub>y</sub>', value: round(uy, 3), unit: 'm/s' }, { label: 'Greatest height', value: round(top, 3), unit: 'm' }],
      working: `u<sub>y</sub> = ${v} × sin ${a}° = ${num(uy)} m/s. At the top v<sub>y</sub> = 0, so 0 = u<sub>y</sub>² − 2gy and y = ${num(uy)}² ÷ (2 × 9.8) = <b>${num(top)} m</b>: higher than the ${num(H)} m ledge.` },
    { kind: 'steps', ask: `How long after it is thrown does the ${obj} come back down to the height of the ledge?`, topic: T.partway,
      steps: [{ label: 'How fast it is moving downward when it comes back down to the ledge’s height', value: round(vyH, 3), unit: 'm/s' }, { label: 'Time from the throw', value: round(tH, 4), unit: 's' }],
      working: `v<sub>y</sub>² = u<sub>y</sub>² − 2gy = ${num(uy)}² − 2 × 9.8 × ${num(H)}, so v<sub>y</sub> = ${num(vyH)} m/s, downward on the way back down: v<sub>y</sub> = −${num(vyH)} m/s. From v<sub>y</sub> = u<sub>y</sub> − gt: t = (${num(uy)} + ${num(vyH)}) ÷ 9.8 = <b>${num(tH, 3)} s</b>. (Solving ${num(H)} = ${num(uy)}t − 4.9t² gives two times: ${num((uy - vyH) / g, 3)} s on the way up and ${num(tH, 3)} s on the way down. It lands at the later one.)` },
    { kind: 'steps', ask: `How far beyond the front edge of the ledge does the ${obj} land?`, topic: T.partway,
      steps: [{ label: 'Horizontal part of the launch velocity, <i>v</i><sub>x</sub>', value: round(vx, 3), unit: 'm/s' }, { label: 'Horizontal distance from the throw', value: round(xH, 3), unit: 'm' }, { label: 'Distance beyond the front edge', value: round(beyond, 3), unit: 'm', tol: { abs: 0.06 } }],
      working: `v<sub>x</sub> = ${v} × cos ${a}° = ${num(vx)} m/s for ${num(tH, 3)} s: x = ${num(vx)} × ${num(tH, 3)} = ${num(xH)} m from the throw, so <b>${num(beyond)} m</b> beyond the edge, ${num(D)} m away.` },
    { kind: 'choice', ask: `As the ${obj} passes over the front edge of the ledge, is it still rising, or already falling?`, ...choose(d, rising ? 'Still rising' : 'Already falling', [rising ? 'Already falling' : 'Still rising', 'At its highest point']),
      explain: { ask: 'Explain how you know.', lines: 3, marks: 1,
        points: [`It is above the edge after ${num(D)} ÷ ${num(vx)} = ${num(D / vx, 2)} s, ${rising ? 'before' : 'after'} it reaches its highest point at u<sub>y</sub> ÷ g = ${num(tTop, 2)} s (or: its highest point is ${num(vx * tTop, 1)} m out, ${rising ? 'past' : 'short of'} the edge)`],
        model: `It reaches the edge, ${num(D)} m out, after ${num(D)} ÷ ${num(vx)} = ${num(D / vx, 2)} s. It reaches its highest point after ${num(uy)} ÷ 9.8 = ${num(tTop, 2)} s, ${num(vx * tTop, 1)} m out, so over the edge it is ${rising ? 'still rising' : 'already falling'}.` } },
    { kind: 'steps', ask: `How fast is the ${obj} moving as it lands on the ledge?`,
      steps: [{ label: 'Horizontal part of its velocity as it lands', value: round(vx, 3), unit: 'm/s' }, { label: 'Its speed as it lands', value: round(sp, 3), unit: 'm/s' }],
      working: `Across it still moves at v<sub>x</sub> = ${num(vx)} m/s, and from (b) it is moving down at ${num(vyH)} m/s, so its speed is √(${num(vx)}² + ${num(vyH)}²) = <b>${num(sp)} m/s</b>: slower than the ${v} m/s it was thrown at, because it is ${num(H)} m higher.` },
  ];
  return {
    title: 'Onto a ledge',
    intro: `<p>${who} at the foot of a crag throws a ${obj} up onto a wide, flat ledge. The ledge is ${num(H)} m higher than the point where the ${obj} leaves the hand, and its front edge is ${num(D)} m away horizontally. The ${obj} is thrown at ${v} m/s, ${a}° above the horizontal. Ignore air resistance.</p>`,
    figures: [scene({ v, a, to: D + 3.5, path: false, blocks: [{ x: D, w: 3.5, h: H }], dims: [heightDim(H, `${num(H)} m`, D), groundDim(D, `${num(D)} m`)] })],
    parts,
  };
}

// a long jump, the jumper's centre of mass as a projectile: the time in the air and the length on level ground, the
// highest point and the speed there, then the length when it lands lower than it took off
function longJump(d) {
  const v = d.pick([8.6, 8.8, 9, 9.2, 9.4, 9.6]), a = d.pick([18, 19, 20, 21, 22]), drop = d.pick([0.4, 0.45, 0.5, 0.55, 0.6]);
  const vx = v * cos(a), uy = v * sin(a), tUp = uy / g, tf = 2 * tUp, R = vx * tf, rise = (uy * uy) / (2 * g);
  const vyL = Math.sqrt(uy * uy + 2 * g * drop), t2 = (uy + vyL) / g, R2 = vx * t2;
  const who = d.pick(['A long jumper', 'An athlete', 'A long jumper at a school sports day']);
  const parts = [
    { kind: 'steps', ask: 'In this model, how long is the jumper in the air?', topic: T.flight,
      steps: [{ label: 'Vertical part of the take-off velocity, <i>u</i><sub>y</sub>', value: round(uy, 3), unit: 'm/s' }, { label: 'Time to reach the highest point', value: round(tUp, 4), unit: 's' }, { label: 'Time in the air', value: round(tf, 4), unit: 's' }],
      working: `u<sub>y</sub> = ${num(v)} × sin ${a}° = ${num(uy)} m/s. Gravity takes it away in ${num(uy)} ÷ 9.8 = ${num(tUp, 3)} s, and coming back down to the same height takes as long again: <b>${num(tf, 3)} s</b>.` },
    { kind: 'steps', ask: 'How long is the jump in this model?', topic: T.range,
      steps: [{ label: 'Horizontal part of the take-off velocity, <i>v</i><sub>x</sub>', value: round(vx, 3), unit: 'm/s' }, { label: 'Length of the jump', value: round(R, 3), unit: 'm' }],
      working: `v<sub>x</sub> = ${num(v)} × cos ${a}° = ${num(vx)} m/s for ${num(tf, 3)} s: ${num(vx)} × ${num(tf, 3)} = <b>${num(R)} m</b> (the same as v² sin 2θ ÷ g).` },
    { kind: 'number', ask: 'How high does the jumper’s centre of mass rise above its height at take-off?', value: round(rise, 4), unit: 'm', topic: T.height,
      working: `At the top v<sub>y</sub> = 0, so the rise is u<sub>y</sub>² ÷ 2g = ${num(uy)}² ÷ 19.6 = <b>${num(rise)} m</b>.` },
    { kind: 'number', ask: 'How fast is the jumper moving at the highest point of the jump?', value: round(vx, 3), unit: 'm/s', topic: T.height,
      working: `At the top only the vertical part of the velocity is zero; the horizontal part never changes. So the speed there is v<sub>x</sub> = <b>${num(vx)} m/s</b>, not zero.` },
    { kind: 'steps', ask: `In a real jump, the jumper’s legs reach forward into the sand, so the centre of mass lands ${num(drop)} m lower than it took off. How long is the jump now?`, topic: T.high,
      steps: [{ label: 'How fast the centre of mass is moving downward as it lands', value: round(vyL, 3), unit: 'm/s' }, { label: 'Time in the air', value: round(t2, 4), unit: 's' }, { label: 'Length of the jump', value: round(R2, 3), unit: 'm' }],
      working: `Taking up as positive, it lands at y = −${num(drop)} m: v<sub>y</sub>² = ${num(uy)}² + 2 × 9.8 × ${num(drop)}, so it is moving down at ${num(vyL)} m/s. From v<sub>y</sub> = u<sub>y</sub> − gt: t = (${num(uy)} + ${num(vyL)}) ÷ 9.8 = ${num(t2, 3)} s. Across: ${num(vx)} × ${num(t2, 3)} = <b>${num(R2)} m</b>, ${num(R2 - R)} m longer.` },
  ];
  // and sometimes: which helps more, a faster take-off or a steeper one (by amounts where either can win, and not too
  // close to call)
  const dv = d.pick([0.3, 0.4, 0.5, 0.6]), da = d.pick([1, 2, 3]), faster = ((v + dv) ** 2 * sin(2 * a)) / g, steeper = (v * v * sin(2 * (a + da))) / g;
  if (Math.abs(faster - steeper) > 0.015 * R && d.chance(0.5)) {
    const fasterWins = faster > steeper, F = `${num(dv)} m/s faster`, S = `${da}° steeper`;
    parts.push({ kind: 'choice', ask: `In the level-ground model, which would make the jump longer: taking off ${num(dv)} m/s faster at the same angle, or ${da}° steeper at the same speed?`,
      ...choose(d, fasterWins ? F : S, [fasterWins ? S : F, 'Both make it longer by the same amount']),
      explain: { ask: 'Show how you decided.', lines: 3,
        points: ['Works out the length of the jump for both changes, with R = v² sin 2θ ÷ g (or the time in the air and v<sub>x</sub>)', `Finds about ${num(faster, 2)} m going faster and ${num(steeper, 2)} m going steeper, so ${fasterWins ? 'taking off faster' : 'taking off steeper'} wins`],
        model: `R = v² sin 2θ ÷ g. Faster: ${num(v + dv)}² × sin ${2 * a}° ÷ 9.8 = ${num(faster, 2)} m. Steeper: ${num(v)}² × sin ${2 * (a + da)}° ÷ 9.8 = ${num(steeper, 2)} m. So ${fasterWins ? `${num(dv)} m/s faster` : `${da}° steeper`} gives the longer jump, compared with ${num(R, 2)} m now.` } });
  }
  return {
    title: 'The long jump',
    intro: `<p>${who} takes off at ${num(v)} m/s, ${a}° above the horizontal. Treat the jumper’s centre of mass as a projectile. At first, model it as landing at the same height it took off from. Ignore air resistance.</p>`,
    figures: [scene({ v, a, to: R, dims: [groundDim(R, '?')] })],
    parts,
  };
}

// ---------- 3. explaining: velocities, forces and paths ----------
// the horizontal and vertical velocity and the acceleration through a flight: kicked from level ground, or rolled off
// a roof, with sketches of v_x and v_y against time
function flightVelocities(d) {
  const vxSketch = (vx, note) => ({ kind: 'sketch', ask: 'Sketch a graph of the <b>horizontal</b> velocity <i>v</i><sub>x</sub> against time <i>t</i>, from launch until the ball lands. Label your axes.', marks: 2,
    x: 'time <i>t</i> (s)', y: 'horizontal velocity <i>v</i><sub>x</sub> (m/s)', pens: ['Horizontal velocity'], model: [{ pen: 0, pts: segment([0, 0.6], [1, 0.6]) }],
    points: ['A horizontal straight line: v<sub>x</sub> doesn’t change', `Above the time axis (not zero: ${num(vx, 1)} m/s), from launch all the way to the landing`, 'Axes labelled: v<sub>x</sub> (m/s) up the side, t (s) along the bottom'],
    notes: [note] });
  const accel = (ask, wrongs, points, model) => ({ kind: 'choice', ask, ...choose(d, '9.8 m/s² downward', wrongs), explain: { ask: 'Explain briefly.', lines: 3, points, model, notes: ['Zero velocity, or a steady sideways speed, doesn’t mean zero acceleration.'] } });
  if (d.chance(0.6)) {
    const v = d.pick([14, 16, 18, 20, 22]), a = d.pick([30, 35, 40, 50, 55, 60]), vx = v * cos(a), uy = v * sin(a), tf = (2 * uy) / g;
    return {
      title: 'Velocity through a flight',
      intro: `<p>A goalkeeper kicks a ball from the ground at ${v} m/s, ${a}° above the horizontal. It rises to its highest point and lands on level ground ${num(tf, 1)} s later. Ignore air resistance.</p>`,
      figures: [scene({ v, a, to: (2 * vx * uy) / g })],
      parts: [
        { kind: 'written', ask: 'Describe how the <b>horizontal</b> part of the ball’s velocity changes during the flight, and explain why.', lines: 3,
          points: [`It stays the same all the way, at ${v} cos ${a}° = ${num(vx, 1)} m/s`, 'because no horizontal force acts on the ball (its weight acts straight down and air resistance is ignored), so there is no horizontal acceleration'],
          model: `It doesn’t change: ${num(vx, 1)} m/s from the kick to the landing. Once the ball leaves the boot the only force on it is its weight, which acts straight down, so nothing speeds it up or slows it down horizontally.`,
          notes: ['“It slows down as it rises” describes the vertical part, not the horizontal one.'] },
        vxSketch(vx, 'A line that dips at the highest point mixes up the horizontal and vertical velocities.'),
        { kind: 'sketch', ask: 'Sketch a graph of the <b>vertical</b> velocity <i>v</i><sub>y</sub> against time <i>t</i>, from the kick until the ball lands, taking upward as positive. The time axis runs across the middle, at <i>v</i><sub>y</sub> = 0, so upward velocities go above it and downward ones below.',
          x: 'time <i>t</i> (s)', y: 'vertical velocity <i>v</i><sub>y</sub> (m/s)', y0: 0.5, pens: ['Vertical velocity'], model: [{ pen: 0, pts: segment([0, 0.9], [1, 0.1]) }],
          points: ['A straight line sloping down: its gradient is the acceleration, the same 9.8 m/s² downward all the way', `It starts above the time axis (${num(uy, 1)} m/s upward) and crosses it (v<sub>y</sub> = 0) halfway through the flight, at the highest point`, 'It ends as far below the time axis as it started above it: the ball lands moving down as fast as it was kicked up'],
          notes: ['A curve, or a line that stops at zero or bounces back up, isn’t right: v<sub>y</sub> changes by the same 9.8 m/s every second, through zero and out the other side.'] },
        accel('What is the ball’s acceleration at its highest point?', ['Zero', '9.8 m/s² upward', 'Less than 9.8 m/s², because it has stopped rising'],
          ['Its weight (gravity) still acts on it at the top, and it is the only force', 'Its vertical velocity is zero for only an instant: it is changing from upward to downward, so it is still accelerating at 9.8 m/s² downward'],
          'At the top the ball’s weight is still the only force on it, so it still accelerates at 9.8 m/s² downward. Its vertical velocity is zero for just an instant as it changes from upward to downward; the velocity is zero there, not the acceleration.'),
        { kind: 'number', ask: 'How fast is the ball moving at its highest point?', value: round(vx, 3), unit: 'm/s', topic: T.height,
          working: `At the top only the vertical part of the velocity is zero. The horizontal part never changes: v<sub>x</sub> = ${v} cos ${a}° = <b>${num(vx)} m/s</b>.` },
      ],
    };
  }
  const h = d.pick([5, 6, 7.5, 8, 10, 12]), v = d.pick([2, 3, 4, 5]), tf = fall(h), vy = g * tf, sp = Math.hypot(v, vy);
  return {
    title: 'Velocity through a flight',
    intro: `<p>A ball rolls off the edge of a flat roof ${num(h)} m above the ground, moving horizontally at ${v} m/s, and lands ${num(tf, 2)} s later. Ignore air resistance.</p>`,
    figures: [scene({ v, h0: h, to: v * tf, cliff: true, dims: [heightDim(h, `${num(h)} m`)] })],
    parts: [
      { kind: 'written', ask: 'Describe how the <b>horizontal</b> part of the ball’s velocity changes as it falls, and explain why.', lines: 3,
        points: [`It stays the same all the way down, ${v} m/s`, 'because no horizontal force acts on the ball (its weight acts straight down and air resistance is ignored), so there is no horizontal acceleration'],
        model: `It doesn’t change: the ball keeps moving across at ${v} m/s until it lands. Once it leaves the roof the only force on it is its weight, which acts straight down, so nothing speeds it up or slows it down horizontally.`,
        notes: ['“It slows down as it falls” is wrong: without air resistance nothing slows it across.'] },
      vxSketch(v, 'A line that rises or falls as the ball drops mixes up the horizontal and vertical velocities.'),
      { kind: 'sketch', ask: 'Sketch a graph of the <b>vertical</b> velocity <i>v</i><sub>y</sub> against time <i>t</i>, from when the ball leaves the roof until it lands, taking <b>downward</b> as positive. Label your axes.',
        x: 'time <i>t</i> (s)', y: 'vertical velocity <i>v</i><sub>y</sub> (m/s)', pens: ['Vertical velocity'], model: [{ pen: 0, pts: segment([0, 0], [1, 0.85]) }],
        points: ['A straight line: its gradient is the acceleration, a steady 9.8 m/s²', 'Starting at zero: the ball leaves the roof moving horizontally, with no vertical velocity', `Rising steadily to its biggest value (${num(vy, 1)} m/s) as the ball lands`],
        notes: ['Starting the line above zero is the usual mistake: the ball’s velocity at the edge is all horizontal.'] },
      accel('What is the ball’s acceleration halfway down?', ['Zero, because it is moving at a steady speed', 'More than 9.8 m/s², because it is moving faster', 'Less than 9.8 m/s², because it is also moving sideways'],
        ['Its weight (gravity) is the only force on it all the way down', 'So its acceleration is 9.8 m/s² downward throughout, whatever its speed or its sideways motion'],
        'The only force on the ball all the way down is its weight, so its acceleration is g = 9.8 m/s² downward the whole time. Moving faster, or moving sideways as well, doesn’t change that.'),
      { kind: 'steps', ask: 'How fast is the ball moving just before it lands?', topic: T.impact,
        steps: [{ label: 'How fast it is moving downward just before it lands', value: round(vy, 3), unit: 'm/s' }, { label: 'Its speed just before it lands', value: round(sp, 3), unit: 'm/s' }],
        working: `Down: v<sub>y</sub> = gt = 9.8 × ${num(tf, 3)} = ${num(vy)} m/s (or √(2 × 9.8 × ${num(h)})). It still moves across at ${v} m/s, so its speed is √(${v}² + ${num(vy)}²) = <b>${num(sp)} m/s</b>.` },
    ],
  };
}

// how air resistance changes a path: lower, shorter and lopsided (it comes down more steeply than it went up), the
// vertical acceleration more than g going up and less coming down, and a sketch of both paths
function airResistance(d) {
  const [who, ball] = d.pick([['A footballer kicks', 'football'], ['A student throws', 'tennis ball'], ['A child throws', 'light foam ball'], ['A volleyball player hits', 'volleyball']]);
  const v = d.pick([12, 14, 15, 16, 18, 20]), a = d.pick([35, 40, 45, 50, 55]), R0 = (v * v * sin(2 * a)) / g, H0 = (v * sin(a)) ** 2 / (2 * g);
  // the sketch's model: both paths on the same scale, the one with air resistance from a drag strong enough to show its shape
  const drag = dragPath(v, a, (1.6 * g) / (v * v)), Rd = drag.at(-1)[0];
  const ideal = along((x) => 0.85 * 4 * x * (1 - x)), real = Array.from({ length: 25 }, (_, i) => [round((Rd * i) / 24 / R0, 4), round((0.85 * heightAt(drag, (Rd * i) / 24)) / H0, 4)]);
  const ACC = ['more than 9.8 m/s²', 'exactly 9.8 m/s²', 'less than 9.8 m/s²'];
  const parts = [
    { kind: 'choice', ask: `With air resistance, how would the ${ball}’s path be different from the one in the drawing?`,
      ...choose(d, 'Lower and shorter, and it comes down more steeply than it went up', d.shuffle(['Lower and shorter, but the same shape coming down as going up', 'Higher and longer, because the air holds it up', 'Lower and shorter, and it comes down less steeply than it went up', 'The same path, only slower']).slice(0, 3)),
      explain: { ask: 'Explain your answer.', lines: 5,
        points: ['Air resistance acts against the motion, so it slows the horizontal velocity all through the flight: the ball covers less ground, so it lands closer', 'Going up, air resistance acts downward along with its weight, so the ball stops rising sooner: its highest point is lower', 'By the time it comes down it is moving across more slowly, so its path drops more steeply than it rose: the path isn’t symmetric'],
        model: 'Air resistance always acts against the ball’s motion. It slows the horizontal velocity the whole time, so the ball covers less ground and lands closer. On the way up it acts partly downward, adding to the ball’s weight, so it stops rising sooner and doesn’t go as high. By the time it comes down it is moving across much more slowly than when it left, so it falls more steeply than it rose: the path is lopsided, with its highest point past halfway.',
        notes: ['“It goes less far” alone isn’t enough: say what air resistance does to the horizontal and vertical motion.'] } },
    { kind: 'sketch', ask: 'On one set of axes, sketch the path with <b>no air resistance</b> and the path <b>with air resistance</b> for the same launch. Use a different pen for each.', marks: 3,
      x: 'distance across', y: 'height', pens: ['No air resistance', 'With air resistance'], model: [{ pen: 0, pts: ideal }, { pen: 1, pts: real }],
      points: ['Both paths start at the same point, in the same direction', 'The path with air resistance is lower and lands closer', 'It is lopsided: its highest point is past halfway, and it comes down more steeply than it went up', 'Axes labelled (height against distance across), and the two paths told apart'],
      notes: ['A smaller copy of the same symmetric shape misses the main point: air resistance makes the path lopsided.'] },
    { kind: 'select', ask: `How does the ${ball}’s vertical acceleration compare with <i>g</i> = 9.8 m/s² when air resistance acts?`,
      fields: [{ label: 'While it rises, it slows down at', options: ACC, correct: 0 }, { label: 'While it falls, it speeds up at', options: ACC, correct: 2 }],
      explain: { ask: 'Explain your answers.', lines: 4,
        points: ['Rising, air resistance acts downward (against the motion), adding to its weight', 'Falling, air resistance acts upward (against the motion), against its weight, so the overall downward force, and the acceleration, is less'],
        model: 'Air resistance always acts against the motion. While the ball rises it acts downward, adding to its weight, so the ball slows down at more than 9.8 m/s². While it falls it acts upward, against its weight, so the overall downward force is less than its weight and it speeds up at less than 9.8 m/s².' } },
  ];
  if (d.chance(0.5)) {
    parts.push({ kind: 'choice', ask: `With air resistance, which takes longer: the ${ball}’s way up, or its way down?`, ...choose(d, 'The way down', ['The way up', 'They take the same time']),
      explain: { ask: 'Explain briefly.', lines: 3,
        points: ['It rises and falls through the same height', 'Going up it slows at more than g, but coming down it speeds up at less than g, so it takes longer to fall the same height'],
        model: 'The ball rises and falls through the same height. Going up, gravity and air resistance together stop it quickly (more than 9.8 m/s²). Coming down, air resistance works against gravity, so it speeds up more slowly (less than 9.8 m/s²) and takes longer to cover the same height.' } });
  }
  return {
    title: 'With air resistance',
    intro: `<p>${who} a ${ball} at ${v} m/s, ${a}° above the horizontal, over level ground. The drawing shows the path it would follow with no air resistance: it would land ${num(R0, 1)} m away after rising ${num(H0, 1)} m. In fact, air resistance acts on the ball throughout its flight.</p>`,
    figures: [titled('The path with no air resistance', scene({ v, a, to: R0, notes: [{ at: [R0 / 2, H0], text: 'no air resistance', dy: -10 }] }))],
    parts,
  };
}

// two angles that add up to 90° land at the same place: the ranges worked out, why they match, why 45° goes farthest,
// and how the range changes with the angle
function sameRange(d) {
  const a = d.pick([15, 20, 25, 30, 35]), b = 90 - a, v = d.pick([8, 10, 12, 14, 15, 16]), R = (v * v * sin(2 * a)) / g;
  const t1 = (2 * v * sin(a)) / g, t2 = (2 * v * sin(b)) / g, vx1 = v * cos(a), vx2 = v * cos(b);
  const what = d.pick(['small launcher', 'ball launcher', 'tennis ball launcher']);
  const parts = [
    { kind: 'steps', ask: `Find the range at ${a}°.`, topic: T.range,
      steps: [{ label: 'Time in the air', value: round(t1, 4), unit: 's' }, { label: 'Horizontal velocity, <i>v</i><sub>x</sub>', value: round(vx1, 3), unit: 'm/s' }, { label: 'Range', value: round(R, 3), unit: 'm' }],
      working: `Up: u<sub>y</sub> = ${v} sin ${a}° = ${num(v * sin(a))} m/s, so the flight lasts 2 × ${num(v * sin(a))} ÷ 9.8 = ${num(t1, 3)} s. Across: v<sub>x</sub> = ${v} cos ${a}° = ${num(vx1)} m/s, so R = ${num(vx1)} × ${num(t1, 3)} = <b>${num(R)} m</b>.` },
    { kind: 'steps', ask: `Find the range at ${b}°.`, topic: T.range,
      steps: [{ label: 'Time in the air', value: round(t2, 4), unit: 's' }, { label: 'Range', value: round(R, 3), unit: 'm' }],
      working: `Up: u<sub>y</sub> = ${v} sin ${b}° = ${num(v * sin(b))} m/s, so the flight lasts 2 × ${num(v * sin(b))} ÷ 9.8 = ${num(t2, 3)} s, longer. Across: v<sub>x</sub> = ${v} cos ${b}° = ${num(vx2)} m/s, slower. R = ${num(vx2)} × ${num(t2, 3)} = <b>${num(R)} m</b>: the same.` },
    { kind: 'written', ask: `Explain why the two angles give the same range, even though the ball goes much higher at ${b}°.`, lines: 5,
      points: [`At ${b}° the ball has a bigger vertical velocity (v sin θ), so it stays in the air longer (${num(t2, 2)} s against ${num(t1, 2)} s)`, `but a smaller horizontal velocity (v cos θ), so it moves across more slowly (${num(vx2, 1)} m/s against ${num(vx1, 1)} m/s)`, `The two balance exactly: the range is v<sub>x</sub> × t = 2v² sin θ cos θ ÷ g, and changing θ to 90° − θ swaps sin and cos, so sin θ cos θ (and sin 2θ) is the same`],
      model: `The range is the horizontal velocity times the time in the air. At ${b}° the ball is launched upward faster, v sin ${b}° instead of v sin ${a}°, so it stays up longer, but it moves across more slowly, v cos ${b}° instead of v cos ${a}°. Because sin ${b}° = cos ${a}° and cos ${b}° = sin ${a}°, the products are equal: R = 2v² sin θ cos θ ÷ g = v² sin 2θ ÷ g is the same, and sin ${2 * a}° = sin ${2 * b}°.`,
      notes: ['Name both effects (longer in the air, slower across) and say why they cancel exactly.'] },
    { kind: 'choice', ask: 'At this speed, which launch angle gives the longest range?', ...choose(d, '45°', [`${a}°`, `${b}°`, '90°']),
      explain: { ask: 'Explain why.', lines: 4,
        points: ['A steeper launch keeps it in the air longer (v sin θ grows) but moves it across more slowly (v cos θ shrinks)', 'The range depends on sin θ cos θ, or sin 2θ, which is biggest at 45° (sin 90° = 1): the best balance between time in the air and speed across'],
        model: 'Steeper launches stay in the air longer but move across more slowly. The range is v² sin 2θ ÷ g, and sin 2θ is biggest, 1, when 2θ = 90°: at 45° the time in the air and the speed across are best balanced. Angles above and below 45° by the same amount give equal, shorter ranges.' } },
  ];
  if (d.chance(0.5)) {
    parts.push({ kind: 'sketch', ask: `Sketch how the range changes with the launch angle, from 0° to 90°, at ${v} m/s on level ground. Label your axes.`, marks: 3,
      x: 'launch angle θ (0° to 90°)', y: 'range R (m)', pens: ['Range'], model: [{ pen: 0, pts: along((x) => 0.9 * Math.sin(Math.PI * x)) }],
      points: ['Zero range at 0° and at 90°', 'One smooth peak, at 45°', `Symmetric about 45°: ${a}° and ${b}° (and any angles the same amount either side of 45°) at the same height`, 'Axes labelled: range up the side, launch angle along the bottom'],
      notes: ['A straight line, or a peak anywhere but 45°, doesn’t fit R = v² sin 2θ ÷ g.'] });
  } else {
    parts.push({ kind: 'number', ask: `What is the longest range at ${v} m/s on level ground?`, value: round((v * v) / g, 3), unit: 'm', topic: T.range,
      working: `At 45°, sin 2θ = sin 90° = 1, so R = v² ÷ g = ${v}² ÷ 9.8 = <b>${num((v * v) / g)} m</b>.` });
  }
  return {
    title: 'Same speed, different angles',
    intro: `<p>A student fires a ${what} on level ground at ${v} m/s, first at ${a}° above the horizontal and then at ${b}°. The drawing shows the two paths: they land in the same place. Ignore air resistance.</p>`,
    figures: [scene({ v, a, to: R, top: (v * sin(b)) ** 2 / (2 * g), arrow: false, curves: [{ f: pathOf(v, b), from: 0, to: R }],
      notes: [{ at: [R / 2, (v * sin(a)) ** 2 / (2 * g)], text: `${a}°`, dy: -8 }, { at: [R / 2, (v * sin(b)) ** 2 / (2 * g)], text: `${b}°`, dy: -8 }] })],
    parts,
  };
}

// two identical objects from the same height, one dropped and one launched sideways: they land together, as a drawing
// of where they are at equal times shows; the time, how far apart, their vertical velocities, and how fast each lands
function droppedAndThrown(d) {
  const coins = d.chance(0.4);
  const h = coins ? d.pick([0.8, 0.9, 1]) : d.pick([5, 6, 7.5, 8, 10]), v = coins ? d.pick([1.5, 2, 2.5]) : d.pick([3, 4, 5, 6]);
  const obj = coins ? 'coin' : 'ball', tf = fall(h), X = v * tf, vy = g * tf, sp = Math.hypot(v, vy);
  // a flash every dt: the step that gives about six of them on the way down
  const dt = [0.05, 0.1, 0.15, 0.2, 0.25].reduce((best, s) => (Math.abs(tf / s - 6) < Math.abs(tf / best - 6) ? s : best));
  const flashes = Array.from({ length: Math.floor(tf / dt + 1e-9) + 1 }, (_, i) => i * dt), at = (t) => h - 0.5 * g * t * t;
  const step = [0.1, 0.2, 0.25, 0.5, 1, 2, 2.5, 5].find((s) => Math.max(X, h) / s <= 6) ?? 10;
  const x0 = -step, x1 = Math.ceil((X * 1.15) / step - 1e-9) * step, last = at(flashes.at(-1));
  const drawing = plot({ x: [x0, x1, step], y: [0, Math.ceil((h * 1.12) / step - 1e-9) * step, step], equal: true, xLabel: 'distance (m)', yLabel: 'height (m)',
    points: [...flashes.map((t) => [0, at(t), '']), ...flashes.slice(1).map((t) => [v * t, at(t), ''])],
    notes: [{ at: [0, last], text: 'A', anchor: 'end', dy: 4 }, { at: [v * flashes.at(-1), last], text: 'B', dy: 22 }] });
  const intro = coins
    ? `<p>Two identical coins sit at the edge of a table ${num(h)} m high. A flick sends coin B off the edge horizontally at ${num(v)} m/s and, at the same moment, lets coin A drop straight down from the same edge. Ignore air resistance.</p><p>The drawing shows where the coins are every ${num(dt)} s, as in a multiflash photo.</p>`
    : `<p>From a balcony ${num(h)} m above the ground, a student drops ball A from one hand and, at the same moment, throws an identical ball B horizontally at ${num(v)} m/s with the other. Ignore air resistance.</p><p>The drawing shows where the balls are every ${num(dt)} s, as in a multiflash photo.</p>`;
  return {
    title: 'Dropped or thrown',
    intro,
    figures: [titled(`Where the ${obj}s are every ${num(dt)} s`, drawing)],
    parts: [
      { kind: 'choice', ask: `Which ${obj} lands first?`, ...choose(d, 'They land at the same time', [`${coins ? 'Coin' : 'Ball'} A, which falls straight down`, `${coins ? 'Coin' : 'Ball'} B, which is launched sideways`, `Whichever ${obj} is heavier`]),
        explain: { ask: 'Explain your answer using ideas about forces and motion.', lines: 4,
          points: [`Both start with no vertical velocity: ${obj} B’s velocity is all horizontal`, 'Both have only their weight acting, so both accelerate downward at 9.8 m/s²', 'So they fall the same height in the same time: the horizontal motion doesn’t change the vertical motion'],
          model: `Both ${obj}s start with no vertical velocity, because ${obj} B’s ${num(v)} m/s is all sideways. The only force on each is its weight, so both speed up downward at 9.8 m/s². Starting the same way and accelerating the same way, they fall the ${num(h)} m in the same time: ${obj} B’s sideways motion doesn’t change how it falls.`,
          notes: ['“B has further to go, so it takes longer” is the mistake: the time depends only on the vertical motion.'] } },
      { kind: 'steps', ask: `How long does each ${obj} take to land, and how far apart are they when they land?`, topic: T.reach,
        steps: [{ label: 'Time to land', value: round(tf, 4), unit: 's' }, { label: `How far apart the ${obj}s land`, value: round(X, 3), unit: 'm' }],
        working: `Each falls ${num(h)} m from rest: t = √(2 × ${num(h)} ÷ 9.8) = ${num(tf, 3)} s. ${coins ? 'Coin' : 'Ball'} A lands straight below the edge, and ${obj} B ${num(v)} × ${num(tf, 3)} = <b>${num(X)} m</b> away from it.` },
      { kind: 'written', ask: `By referring to the drawing, explain how it shows that ${obj} B’s sideways motion doesn’t change the way it falls.`, lines: 5,
        points: ['At every flash the two are at the same height (level with each other)', `${coins ? 'Coin' : 'Ball'} B’s images are equally spaced across: its horizontal velocity stays the same`, 'The gaps downward grow in the same way for both: they speed up downward together, at the same rate'],
        model: `At every flash ${obj} B is level with ${obj} A, so it has fallen exactly as far in the same time. Its images are equally spaced across, so its horizontal velocity stays the same, while the gaps downward grow in the same way for both ${obj}s: they speed up downward together. So the sideways motion and the falling happen independently.`,
        notes: ['Point to what the drawing shows (the same heights at each flash, the even spacing across), not just what you know.'] },
      { kind: 'sketch', ask: `On one set of axes, sketch the <b>vertical</b> velocity of each ${obj} against time until it lands, taking downward as positive. Use a different pen for each.`, marks: 2,
        x: 'time <i>t</i> (s)', y: 'vertical velocity <i>v</i><sub>y</sub> (m/s)', pens: [`${coins ? 'Coin' : 'Ball'} A`, `${coins ? 'Coin' : 'Ball'} B`], model: [{ pen: 0, pts: segment([0, 0], [1, 0.85]) }, { pen: 1, pts: segment([0, 0], [1, 0.85]) }],
        points: ['Both are straight lines starting at zero: neither has any vertical velocity at the start', 'The two lines are the same: the same gradient (g), ending at the same time and the same value, when they land'],
        notes: [`${coins ? 'Coin' : 'Ball'} B’s line isn’t higher: its extra speed is horizontal, not vertical.`] },
      { kind: 'steps', ask: `How fast is each ${obj} moving just before it lands?`, topic: T.impact,
        steps: [{ label: `${coins ? 'Coin' : 'Ball'} A (straight down)`, value: round(vy, 3), unit: 'm/s' }, { label: `${coins ? 'Coin' : 'Ball'} B`, value: round(sp, 3), unit: 'm/s' }],
        working: `Both are moving down at v<sub>y</sub> = gt = 9.8 × ${num(tf, 3)} = ${num(vy)} m/s, which is ${obj} A’s speed. ${coins ? 'Coin' : 'Ball'} B also moves across at ${num(v)} m/s, so its speed is √(${num(v)}² + ${num(vy)}²) = <b>${num(sp)} m/s</b>: faster, though they land together.` },
    ],
  };
}

export const projectilesExam = examBank('projectiles-exam', {
  title: 'Projectile Motion', minutes: 45, guide: GUIDE,
  slots: [
    [offTheBench, launcherAngles, fromHeights, rampRelease, hoseJet],   // 1. a lab
    [intoTheSea, freeKick, tennisServe, ontoTheLedge, longJump],        // 2. a problem
    [flightVelocities, airResistance, sameRange, droppedAndThrown],     // 3. explaining
  ],
});
