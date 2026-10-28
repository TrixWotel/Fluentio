// Tests like the ones in class for Kinematics, each three questions: 1. a lab to analyse (process the data, choose what
// to plot so the model gives a straight line, draw the line of best fit and use its gradient or intercept), 2. a motion
// graph to read, describe and sketch, and 3. a problem to solve in steps and explain. Original questions with new numbers
// and contexts every time. kit/exam-kit.js says what a question and its parts are.
import { examBank, dataTable, noisy, bestFit, sig } from '../kit/exam-kit.js';
import { graph, num, round } from '../kit/bank.js';

const G = 9.8;
const GUIDE = `<div class="cols">
  <ul>
    <li>Constant acceleration: <span class="f">v = u + at</span>, <span class="f">s = ut + ½at²</span>, <span class="f">v² = u² + 2as</span>, <span class="f">s = ½(u + v)t</span></li>
    <li>Falling freely (no air resistance): <span class="f">a = g = 9.8 m/s²</span> downward</li>
    <li>x–t graph: the gradient is the velocity. v–t graph: the gradient is the acceleration, and the area under the line is the displacement. a–t graph: the area under the line is the change in velocity</li>
    <li>Average velocity = displacement ÷ time</li>
  </ul>
  <ul>
    <li>A straight line: <span class="f">y = mx + c</span>. Gradient <span class="f">m = Δy ÷ Δx</span>, read from two points far apart on the line; the intercept <span class="f">c</span> is where it crosses the y-axis</li>
    <li>Area of a triangle: <span class="f">½ × base × height</span>. Of a trapezium: <span class="f">½(a + b) × width</span></li>
    <li>100 cm = 1 m · 1000 ms = 1 s · 3.6 km/h = 1 m/s</li>
  </ul>
</div>`;

// ---------- helpers ----------
// a number inside a sum: a negative one in brackets, so it reads "5 + (−3)", never "5 + −3"
const br = (x, d = 2) => (x < 0 ? `(${num(x, d)})` : num(x, d));
// an answer to 4 significant figures
const p4 = (x) => Number(x.toPrecision(4));
// "a" or "an" before a word, with a capital when it starts a sentence
const an = (w, cap = false) => (/^[aeiou]/i.test(w) ? (cap ? 'An' : 'an') : cap ? 'A' : 'a') + ' ' + w;
// a graph with a title above it, in the same box as lineGraph's
const chart = (title, svg) => `<div class="chart">${title ? `<p class="chart-title">${title}</p>` : ''}${svg}</div>`;
// a select field: the right option among the wrong ones, in an order from the dice
function field(d, label, right, wrong, marks) {
  const options = d.shuffle([...[].concat(right), ...wrong]);
  const correct = [].concat(right).map((r) => options.indexOf(r));
  return { label, options, correct: correct.length === 1 ? correct[0] : correct, ...(marks ? { marks } : {}) };
}
// a choice part's choices in an order from the dice, with the index of the right one
function choices(d, right, wrong) {
  const list = d.shuffle([right, ...wrong]);
  return { choices: list, correct: list.indexOf(right) };
}
// a sketch's model line through corners [[x, y]…] (in the graph's own units, x up to xMax and y up to yMax), on the
// drawing area from 0 to 1, with points along each piece so it draws smoothly (vertical jumps stay jumps)
function modelLine(corners, xMax, yMax, n = 22) {
  const X = (x) => round(Math.min(1, Math.max(0, x / xMax)), 4), Y = (y) => round(Math.min(1, Math.max(0, y / yMax)), 4);
  const width = corners.at(-1)[0] - corners[0][0], out = [[X(corners[0][0]), Y(corners[0][1])]];
  for (let i = 1; i < corners.length; i++) {
    const [x0, y0] = corners[i - 1], [x1, y1] = corners[i], k = x1 === x0 ? 1 : Math.max(1, Math.round((n * (x1 - x0)) / width));
    for (let j = 1; j <= k; j++) out.push([X(x0 + ((x1 - x0) * j) / k), Y(y0 + ((y1 - y0) * j) / k)]);
  }
  return out;
}
// a sketch's model curve: f(x) for x from a to b, n points, scaled the same way
const modelCurve = (f, a, b, xMax, yMax, n = 24) =>
  Array.from({ length: n }, (_, i) => { const x = a + ((b - a) * i) / (n - 1); return [round(Math.min(1, Math.max(0, x / xMax)), 4), round(Math.min(1, Math.max(0, f(x) / yMax)), 4)]; });
// the position at time t of something whose velocity–time graph runs straight between corners [[t, v]…], from 0 at the
// first corner: the area under the graph up to t
function areaTo(corners, t) {
  let s = 0;
  for (let i = 1; i < corners.length; i++) {
    const [t0, v0] = corners[i - 1], [t1, v1] = corners[i];
    if (t <= t0) break;
    const e = Math.min(t, t1), ve = v0 + ((v1 - v0) * (e - t0)) / (t1 - t0);
    s += ((v0 + ve) / 2) * (e - t0);
  }
  return s;
}

// ---------- 1. labs: process the data, plot it straight, use the gradient ----------

// a trolley let go from rest at the top of a ramp and timed with a stopwatch over different distances: d = ½at², so
// d against t² is a straight line through the origin whose gradient is half the acceleration
function rampTrolley(d) {
  const it = d.pick([
    { thing: 'trolley', on: 'a long wooden ramp' },
    { thing: 'toy car', on: 'a plank propped up on a pile of books' },
    { thing: 'dynamics cart', on: 'a tilted aluminium track' },
  ]);
  const a = d.pick([0.35, 0.4, 0.45, 0.5, 0.6, 0.7, 0.8]), d0 = d.pick([20, 25, 30, 40]), gap = d.pick([15, 20, 25]);
  const dcm = Array.from({ length: 6 }, (_, i) => d0 + i * gap);
  const runs = dcm.map((c) => { const t = Math.sqrt((2 * c) / 100 / a); return [0, 1, 2].map(() => round(noisy(d, t, 0.02), 2)); });
  const mean = runs.map((r) => (r[0] + r[1] + r[2]) / 3), dm = dcm.map((c) => c / 100), t2 = mean.map((t) => t * t);
  // the gradient of d (m) against t² (s²) from the data, and the acceleration it gives
  const s = bestFit(t2.map((x, i) => [x, dm[i]])).slope, A = 2 * s;
  const accOf = (line) => {
    if (line.y === 'd' && line.x === 't2') return 2 * line.slope;
    if (line.y === 't2' && line.x === 'd') return 2 / line.slope;
    return null;
  };
  // then how fast it's going, or how long it takes, at the bottom of the ramp
  const L = d.pick([1.8, 2, 2.2, 2.4]), speed = d.chance(0.5);
  const last = speed
    ? { label: `Its speed when it has rolled ${num(L)} m from rest`, value: Math.sqrt(2 * A * L), unit: 'm/s', of: (acc) => Math.sqrt(2 * acc * L),
      how: `v² = u² + 2as = 0 + 2 × ${sig(A, 3)} × ${num(L)}, so v = <b>${num(Math.sqrt(2 * A * L), 2)} m/s</b>` }
    : { label: `The time it takes to roll the whole ${num(L)} m ramp from rest`, value: Math.sqrt((2 * L) / A), unit: 's', of: (acc) => Math.sqrt((2 * L) / acc),
      how: `d = ½at², so t = √(2d ÷ a) = √(2 × ${num(L)} ÷ ${sig(A, 3)}) = <b>${num(Math.sqrt((2 * L) / A), 2)} s</b>` };

  const parts = [];
  if (d.chance(0.5)) parts.push({ kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
    fields: [field(d, 'Independent variable', 'The distance rolled', ['The time taken', 'The time squared', 'The mass of the ' + it.thing]),
      field(d, 'Dependent variable', 'The time taken', ['The distance rolled', 'The slope of the ramp', 'The acceleration'])],
    working: 'The student chooses each distance on purpose: that is the <b>independent</b> variable. They measure the <b>time taken</b>: the dependent variable. Your graph puts d up the side, but the axes don’t decide it: what the experiment changes on purpose is the independent variable.' });
  parts.push({ kind: 'table', ask: 'Process the data: find the mean time for each distance, write each distance in metres, and square each mean time.',
    head: ['<i>d</i> (cm)', '<i>t</i>₁ (s)', '<i>t</i>₂ (s)', '<i>t</i>₃ (s)', 'Mean <i>t</i> (s)', '<i>d</i> (m)', '<i>t</i>² (s²)'],
    rows: dcm.map((c, i) => [num(c), ...runs[i].map((t) => num(t, 2)), null, null, null]),
    fill: { 4: { values: mean, tol: 0.01, unit: 's' }, 5: { values: dm, tol: 0.01, unit: 'm' }, 6: { values: t2, tol: 0.02, unit: 's²' } },
    working: `For ${num(dcm[0])} cm: mean t = (${runs[0].map((t) => num(t, 2)).join(' + ')}) ÷ 3 = ${num(mean[0], 3)} s, d = ${num(dcm[0])} ÷ 100 = ${num(dm[0])} m, and t² = ${num(mean[0], 3)}² = ${num(t2[0], 3)} s². The same for each row.` });
  const P = parts.length;
  parts.push({ kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find the acceleration, and draw the line of best fit.',
    quantities: {
      d: { label: '<i>d</i> (m)', values: dm }, t: { label: 'mean <i>t</i> (s)', values: mean }, t2: { label: '<i>t</i>² (s²)', values: t2 },
      rt: { label: '√<i>t</i>', values: mean.map(Math.sqrt) }, it: { label: '1 ÷ <i>t</i> (1/s)', values: mean.map((t) => 1 / t) },
    },
    pairs: [['d', 't2'], ['t2', 'd']],
    working: 'The model d = ½a × t² has the same shape as y = mx, with y = d, x = t² and gradient m = ½a, the same for every distance. So plot d up the side against t² along the bottom: a straight line through the origin. (t² against d is straight too, with gradient 2 ÷ a.) d against t curves upward.' });
  parts.push({ kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: p4(s), unit: 'm/s²', tol: 0.06,
    from: { part: P, value: (line) => line.slope, tol: 0.02 },
    working: `Gradient = Δy ÷ Δx between two points far apart on the line: about <b>${sig(s, 3)} m/s²</b> for d (m) against t² (s²). (For t² against d it is about ${sig(1 / s, 3)} s²/m.)` });
  parts.push({ kind: 'steps', ask: `Use your gradient and the model to find the ${it.thing}’s <b>acceleration</b>, and then ${speed ? `its speed after rolling ${num(L)} m` : `how long it takes to roll the whole ${num(L)} m ramp`}. Show your working.`,
    topic: 'Acceleration from a curved x–t graph',
    steps: [{ label: `Acceleration of the ${it.thing}`, value: p4(A), unit: 'm/s²', tol: 0.08 }, { label: last.label, value: p4(last.value), unit: last.unit, tol: 0.05 }],
    from: { part: P, value: (line) => { const acc = accOf(line); return acc > 0 ? last.of(acc) : null; }, tol: 0.04 },
    working: `The gradient is ½a, so a = 2 × ${sig(s, 3)} = ${sig(A, 3)} m/s². (From t² against d: a = 2 ÷ gradient.) Then ${last.how}.` });
  const meaning = [
    { kind: 'written', ask: 'What does the gradient of your line represent? Show that its unit is the unit of an acceleration.', lines: 3,
      points: ['The model d = ½a × t² has the form y = mx, so the gradient is ½a: half the acceleration', 'The gradient’s unit is m ÷ s² = m/s², the unit of acceleration (so a = 2 × gradient)'],
      model: `d = ½a × t² is y = mx with y = d and x = t², so the gradient is ½a, half the ${it.thing}’s acceleration. Its unit is the unit of d over the unit of t²: m ÷ s² = m/s², which is the unit of an acceleration.`,
      notes: ['Saying “the gradient is the acceleration” loses the first mark: it is half of it.'] },
    { kind: 'written', ask: 'Explain why your line should pass through the origin.', lines: 3,
      points: [`The ${it.thing} starts from rest, so at t = 0 it has gone no distance (d = 0 when t² = 0)`, 'The model d = ½at² has no added constant, so the line has no intercept'],
      model: `The ${it.thing} is let go from rest, so at the moment the stopwatch starts it hasn’t moved: d = 0 when t = 0. With no starting speed, d = ½at² has no added constant, so the straight line goes through (0, 0).` },
  ];
  const error = [
    { kind: 'written', ask: 'The times were measured with a hand-held stopwatch. <b>Identify one source of error</b> in the set-up itself, and explain how it affects the acceleration found.', lines: 4,
      points: [`Names something specific in the set-up, such as the reaction time in stopping the stopwatch as the ${it.thing} crosses the finish, the ${it.thing} being pushed instead of let go, or the start of the distance measured from a different point of the ${it.thing} than its finish`, 'Says which way it changes the result, such as: stopping the watch late makes every time too long, so t² is too big, the gradient is too small and the acceleration comes out too small'],
      model: `The stopwatch is stopped by hand when the ${it.thing} crosses the finish line, and the student’s reaction time makes each time a little too long. Then every t² is too big, so the gradient of d against t², and the acceleration found from it, come out too small.`,
      notes: ['“Human error” on its own earns nothing: say what in the set-up causes it, and which way it changes the acceleration.'] },
    { kind: 'written', ask: 'Suggest one <b>improvement</b> to the method, and explain how it makes the value of the acceleration more accurate.', lines: 4,
      points: ['A specific improvement, such as timing with light gates and an electronic timer (or a data logger) instead of a hand-held stopwatch', 'Why it helps, such as: it removes the reaction time in starting and stopping the stopwatch, so the times, and so the gradient, are more accurate'],
      model: `Time each run with two light gates connected to an electronic timer, one at the start and one at the finish. There is then no reaction time in starting and stopping a stopwatch, so the times are much more accurate, and so is the gradient that gives the acceleration.`,
      notes: ['“Repeat it more” alone earns the first mark only if it says why: repeats reduce the effect of random errors, not of a reaction time that is always there.'] },
  ];
  parts.push(d.pick(meaning), d.pick(error));
  return {
    title: 'Rolling down a ramp',
    intro: `<p>A student lets a ${it.thing} go from rest at the top of ${it.on} and measures how long it takes to roll different distances <i>d</i> down it, using a hand-held stopwatch. They time each distance three times.</p><p>For something that starts from rest and speeds up steadily, the supplied model is</p><p class="model"><span class="f">d = ½ a t²</span></p><p>where <i>a</i> is the ${it.thing}’s acceleration, the same all the way down the ramp. The student wants to use the data to find <i>a</i>.</p>`,
    figures: [dataTable(['Distance <i>d</i> (cm)', '<i>t</i>₁ (s)', '<i>t</i>₂ (s)', '<i>t</i>₃ (s)'], dcm.map((c, i) => [num(c), ...runs[i].map((t) => num(t, 2))]), 'Time to roll each distance from rest')],
    parts,
  };
}

// a ball let go from rest rolls down a slope through a light gate set at different distances s from where it starts.
// Its speed is its diameter ÷ the time it blocks the beam, and v² = 2as, so v² against s is a straight line through the
// origin whose gradient is twice the acceleration
function lightGate(d) {
  const ball = d.pick([{ name: 'marble', D: 1.6 }, { name: 'steel ball', D: 1.9 }, { name: 'steel ball', D: 2.5 }, { name: 'wooden ball', D: 3.2 }]);
  const a = d.pick([0.5, 0.6, 0.7, 0.8, 0.9, 1, 1.2]), s0 = d.pick([0.2, 0.25, 0.3]), gap = d.pick([0.15, 0.2, 0.25]);
  const s = Array.from({ length: 6 }, (_, i) => round(s0 + i * gap, 2));
  const ms = s.map((x) => round(noisy(d, ((ball.D / 100) / Math.sqrt(2 * a * x)) * 1000, 0.02), 1));
  const v = ms.map((t) => ball.D / 100 / (t / 1000)), v2 = v.map((x) => x * x);
  const k = bestFit(s.map((x, i) => [x, v2[i]])).slope, A = k / 2;
  const accOf = (line) => {
    if (line.y === 'v2' && line.x === 's') return line.slope / 2;
    if (line.y === 's' && line.x === 'v2') return 1 / (2 * line.slope);
    return null;
  };
  const X = d.pick([1.5, 1.8, 2, 2.5]), speed = d.chance(0.5);
  const last = speed
    ? { label: `Its speed after rolling ${num(X)} m from rest`, value: Math.sqrt(2 * A * X), unit: 'm/s', of: (acc) => Math.sqrt(2 * acc * X),
      how: `v² = 2as = 2 × ${sig(A, 3)} × ${num(X)}, so v = <b>${num(Math.sqrt(2 * A * X), 2)} m/s</b>` }
    : { label: `The time it takes to roll ${num(X)} m from rest`, value: Math.sqrt((2 * X) / A), unit: 's', of: (acc) => Math.sqrt((2 * X) / acc),
      how: `s = ½at², so t = √(2s ÷ a) = √(2 × ${num(X)} ÷ ${sig(A, 3)}) = <b>${num(Math.sqrt((2 * X) / A), 2)} s</b>` };

  const parts = [];
  if (d.chance(0.5)) parts.push({ kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
    fields: [field(d, 'Independent variable', 'The distance from the start to the light gate', ['The time the beam is blocked', 'The speed of the ball', 'The diameter of the ball']),
      field(d, 'Dependent variable', ['The time the beam is blocked', 'The speed of the ball'], ['The distance from the start to the light gate', 'The slope of the ramp'])],
    working: 'The student moves the light gate to each distance on purpose: the distance is the <b>independent</b> variable. What they measure at each distance, the time the beam is blocked (and so the ball’s speed), is the <b>dependent</b> variable.' });
  parts.push({ kind: 'table', ask: `Process the data: work out the ball’s speed at each light gate (its diameter is ${num(ball.D)} cm), and square it.`,
    head: ['<i>s</i> (m)', 'Time blocked (ms)', '<i>v</i> (m/s)', '<i>v</i>² (m²/s²)'],
    rows: s.map((x, i) => [num(x), num(ms[i], 1), null, null]),
    fill: { 2: { values: v, tol: 0.02, unit: 'm/s' }, 3: { values: v2, tol: 0.03, unit: 'm²/s²' } },
    working: `Write both in SI units first: the diameter is ${num(ball.D / 100, 3)} m and ${num(ms[0], 1)} ms is ${num(ms[0] / 1000, 4)} s. Then v = ${num(ball.D / 100, 3)} ÷ ${num(ms[0] / 1000, 4)} = ${num(v[0], 3)} m/s and v² = ${num(v2[0], 3)} m²/s², and the same for each row.` });
  const P = parts.length;
  parts.push({ kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find the ball’s acceleration, and draw the line of best fit.',
    quantities: {
      s: { label: '<i>s</i> (m)', values: s }, v: { label: '<i>v</i> (m/s)', values: v }, v2: { label: '<i>v</i>² (m²/s²)', values: v2 },
      rv: { label: '√<i>v</i>', values: v.map(Math.sqrt) }, t: { label: 'time blocked (s)', values: ms.map((t) => t / 1000) },
    },
    pairs: [['v2', 's'], ['s', 'v2']],
    working: 'The model v² = 2a × s has the same shape as y = mx, with y = v², x = s and gradient m = 2a. So plot v² up the side against s along the bottom: a straight line through the origin. (s against v² works too, with gradient 1 ÷ 2a.) v against s curves.' });
  parts.push({ kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: p4(k), unit: 'm/s²', tol: 0.06,
    from: { part: P, value: (line) => line.slope, tol: 0.02 },
    working: `Gradient = Δy ÷ Δx between two points far apart on the line: about <b>${sig(k, 3)} m/s²</b> for v² (m²/s²) against s (m).` });
  parts.push({ kind: 'steps', ask: `Use your gradient and the model to find the ball’s <b>acceleration</b>, and then ${speed ? `its speed after rolling ${num(X)} m` : `how long it takes to roll ${num(X)} m`} from rest. Show your working.`,
    steps: [{ label: 'Acceleration of the ball', value: p4(A), unit: 'm/s²', tol: 0.08 }, { label: last.label, value: p4(last.value), unit: last.unit, tol: 0.05 }],
    from: { part: P, value: (line) => { const acc = accOf(line); return acc > 0 ? last.of(acc) : null; }, tol: 0.04 },
    working: `The gradient is 2a, so a = ${sig(k, 3)} ÷ 2 = ${sig(A, 3)} m/s². Then ${last.how}.` });
  const meaning = [
    { kind: 'written', ask: 'What does the gradient of your line represent? Show that its unit is the unit of an acceleration.', lines: 3,
      points: ['v² = 2a × s has the form y = mx, so the gradient is 2a: twice the acceleration', 'The gradient’s unit is (m²/s²) ÷ m = m/s², the unit of acceleration'],
      model: 'v² = 2a × s is y = mx with y = v² and x = s, so the gradient is 2a, twice the ball’s acceleration. Its unit is m²/s² ÷ m = m/s², the unit of an acceleration.' },
    { kind: 'written', ask: 'Name one variable that must be <b>kept the same</b> for every run, and explain why.', lines: 3,
      points: ['A specific control variable: the slope of the ramp, the same ball, or letting it go from rest at the same starting mark', 'Why: changing it would change the acceleration (or the starting speed), so the runs would no longer follow one straight line and the gradient would mean nothing'],
      model: 'The angle of the slope must stay the same, because a steeper slope gives the ball a bigger acceleration. If it changed between runs, the points would come from different accelerations and the gradient wouldn’t give one value of a.',
      notes: ['Be specific: “the equipment” or “the conditions” earns nothing.'] },
  ];
  const error = [
    { kind: 'written', ask: 'The light gate’s beam crosses the ball <b>below its centre</b>, not across its widest part. Explain how this affects the acceleration found.', lines: 4,
      points: ['The ball blocks the beam for a shorter length than its diameter, so each time blocked is shorter than it should be', 'Each v = diameter ÷ time is too big (by the same factor), so v², the gradient and the acceleration all come out too big'],
      model: 'Below its centre the ball is narrower than its diameter, so it blocks the beam for less time than its full width would. Dividing the full diameter by that shorter time gives speeds that are all too big by the same factor, so every v² is too big, and the gradient and the acceleration come out too big.' },
    { kind: 'written', ask: 'The student measured each distance <i>s</i> from the <b>front</b> of the ball at the start, instead of from its centre. Explain how this affects the graph and the acceleration found.', lines: 4,
      points: ['Every s is wrong by the same amount (the ball’s radius), so the whole line shifts sideways and no longer passes through the origin', 'The gradient doesn’t change, so the acceleration found from it is not affected'],
      model: 'The light gate reads the ball’s speed when its centre reaches the beam, so every s is out by the same amount, the radius. Adding the same amount to every s slides the line sideways: it misses the origin, but its gradient is the same, so the acceleration is unaffected.' },
  ];
  parts.push(d.pick(meaning), d.pick(error));
  return {
    title: 'Through a light gate',
    intro: `<p>A student lets a ${ball.name} of diameter ${num(ball.D)} cm go from rest at the top of a straight slope. A light gate at a distance <i>s</i> down the slope times how long the ball blocks its beam. Moving the light gate, the student repeats this for six distances.</p><p>The ball’s speed through the gate is its diameter ÷ the time it blocks the beam. For a ball that starts from rest with a constant acceleration <i>a</i>, the supplied model is</p><p class="model"><span class="f">v² = 2 a s</span></p><p>The student wants to use the data to find the ball’s acceleration.</p>`,
    figures: [dataTable(['Distance to the gate <i>s</i> (m)', 'Time the beam is blocked (ms)'], s.map((x, i) => [num(x), num(ms[i], 1)]), 'Mean of three runs at each distance')],
    parts,
  };
}

// a cart moving steadily along a track in front of a motion sensor, which times the echo of each ultrasound pulse off
// the cart: its distance is x = ½ × (speed of sound) × (echo time). x = x₀ + vt, so x against t is a straight line whose
// gradient is the velocity and whose intercept is where the cart was when the recording started
function motionSensor(d) {
  const away = d.chance(0.5), speed = d.pick([0.15, 0.2, 0.25, 0.3, 0.35, 0.4]), v = away ? speed : -speed;
  const step = d.pick([0.5, 1]), t = Array.from({ length: 6 }, (_, i) => (i + 1) * step), tEnd = t.at(-1);
  const x0 = away ? d.pick([0.3, 0.35, 0.4, 0.45, 0.5]) : round(0.4 + speed * tEnd + d.pick([0.1, 0.2, 0.3]), 2);
  const air = d.pick([{ T: 15, c: 340 }, { T: 20, c: 343 }, { T: 25, c: 346 }]);
  const echo = t.map((s) => round(noisy(d, ((2 * (x0 + v * s)) / air.c) * 1000, 0.01), 2)), es = echo.map((e) => e / 1000);
  const x = es.map((e) => (air.c * e) / 2);
  const fit = bestFit(t.map((s, i) => [s, x[i]])), V = fit.slope, X0 = fit.intercept;
  // where it is heading: the end of the track, or a block in front of the sensor
  const target = away ? round(x.at(-1) + speed * d.pick([1.5, 2, 2.5]), 1) : d.pick([0.2, 0.25, 0.3]);
  const tHit = (target - X0) / V;
  const timeOf = (line) => {
    if (line.y === 'x' && line.x === 't') return (target - line.intercept) / line.slope;
    if (line.y === 't' && line.x === 'x') return line.slope * target + line.intercept;
    return null;
  };
  const where = away ? `the end of the track, ${num(target)} m from the sensor` : `a wooden block ${num(target)} m in front of the sensor`;
  const dir = away ? 'away from' : 'towards';

  const parts = [];
  parts.push({ kind: 'table', ask: 'Process the data: write each echo time in seconds, then work out the cart’s distance from the sensor.',
    head: ['<i>t</i> (s)', 'Echo time (ms)', 'Echo time (s)', '<i>x</i> (m)'],
    rows: t.map((s, i) => [num(s), num(echo[i], 2), null, null]),
    fill: { 2: { values: es, tol: 0.01, unit: 's' }, 3: { values: x, tol: 0.02, unit: 'm' } },
    working: `${num(echo[0], 2)} ms = ${num(es[0], 5)} s. The pulse goes to the cart and back, so the distance is half of what sound covers in that time: x = ½ × ${air.c} × ${num(es[0], 5)} = ${num(x[0], 3)} m, and the same for each row.` });
  parts.push({ kind: 'choice', ask: 'Is the cart moving <b>towards</b> the sensor or <b>away</b> from it?',
    ...choices(d, away ? 'Away from the sensor' : 'Towards the sensor', [away ? 'Towards the sensor' : 'Away from the sensor']),
    explain: { ask: 'How does the data show this?', lines: 2, marks: 1,
      points: [`The echo times, and so the distances x, ${away ? 'get longer' : 'get shorter'} as time goes on`],
      model: `Each echo takes ${away ? 'longer' : 'less time'} than the one before, so the cart’s distance from the sensor ${away ? 'increases' : 'decreases'}: it is moving ${dir} the sensor.` } });
  const P = parts.length;
  parts.push({ kind: 'plot', ask: 'Plot a graph of your processed data that gives a <b>straight line</b> you can use to find the cart’s velocity, and draw the line of best fit.',
    quantities: {
      x: { label: '<i>x</i> (m)', values: x }, t: { label: '<i>t</i> (s)', values: t }, x2: { label: '<i>x</i>² (m²)', values: x.map((a) => a * a) },
      rt: { label: '√<i>t</i>', values: t.map(Math.sqrt) }, ix: { label: '1 ÷ <i>x</i> (1/m)', values: x.map((a) => 1 / a) },
    },
    pairs: [['x', 't'], ['t', 'x']],
    working: 'A steady velocity means x = x₀ + vt, the same shape as y = mx + c: plot x up the side against t along the bottom. The gradient is the velocity and the intercept is x₀, where the cart was at t = 0. (t against x is straight too, with gradient 1 ÷ v.)' });
  parts.push({ kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: p4(V), unit: '', tol: 0.06, topic: 'Velocity from a position–time graph',
    from: { part: P, value: (line) => line.slope, tol: 0.02 },
    working: `Gradient = Δx ÷ Δt between two points far apart on the line: about <b>${sig(V, 3)} m/s</b> for x (m) against t (s)${away ? '' : ', negative because x decreases'}.` });
  parts.push({ kind: 'steps', ask: `Use your line to find where the cart was when the recording started (t = 0), and when it will reach ${where} if it keeps going at the same velocity. Show your working.`,
    steps: [{ label: 'Its distance from the sensor at t = 0', value: p4(X0), unit: 'm', tol: { abs: 0.03 } }, { label: `The time it reaches ${num(target)} m`, value: p4(tHit), unit: 's', tol: 0.06 }],
    from: { part: P, value: (line) => { const h = timeOf(line); return h > 0 ? h : null; }, tol: 0.04 },
    working: `At t = 0 the line crosses the x-axis at the intercept: x₀ ≈ ${num(X0, 3)} m. It reaches ${num(target)} m when ${num(X0, 3)} + ${br(V, 3)} × t = ${num(target)}, so t = (${num(target)} − ${num(X0, 3)}) ÷ ${br(V, 3)} ≈ <b>${num(tHit, 1)} s</b>.` });
  const meaning = [
    { kind: 'written', ask: 'What do the <b>gradient</b> and the <b>intercept</b> of your line tell you about the cart’s motion?', lines: 3,
      points: [`The gradient is the cart’s velocity: about ${num(V, 2)} m/s (${away ? 'positive: moving away from' : 'negative: moving towards'} the sensor)`, `The intercept is the cart’s distance from the sensor at t = 0, when the recording started: about ${num(X0, 2)} m`],
      model: `The gradient, Δx ÷ Δt, is the cart’s velocity: about ${num(V, 2)} m/s, ${away ? 'positive because it moves away from' : 'negative because it moves towards'} the sensor. The intercept is x at t = 0: the cart was about ${num(X0, 2)} m from the sensor when the recording started, so it hadn’t started at the sensor.`,
      notes: ['The intercept isn’t where the cart started moving: the cart was already moving when the recording began.'] },
    { kind: 'written', ask: 'Describe the cart’s motion, and explain how your graph shows it.', lines: 3,
      points: [`It moves ${dir} the sensor at a constant velocity (a steady speed of about ${num(speed, 2)} m/s): it isn’t speeding up or slowing down`, 'Because the points lie on a straight line, whose gradient (the velocity) stays the same'],
      model: `The cart moves ${dir} the sensor at a steady ${num(speed, 2)} m/s or so. The x–t points lie on a straight line, so the gradient, which is the velocity, is the same all the way: no acceleration.` },
  ];
  const error = [
    { kind: 'written', ask: `The thermometer read ${air.T} °C, but the air near the track was colder, and sound travels more slowly in colder air. Explain how this affects the velocity found.`, lines: 4,
      points: ['With slower sound, each echo time really means a shorter distance: every x worked out is too big by the same factor', 'So the gradient, the velocity, comes out too big in size (and the intercept too)'],
      model: `In colder air sound is slower than ${air.c} m/s, so in each echo time it really travels less far than the student assumed. Every distance worked out is too big by the same factor, which stretches the line: its gradient, the cart’s velocity, comes out too big in size.` },
    { kind: 'written', ask: '<b>Identify one source of error</b> in the set-up itself, and explain how it affects the results.', lines: 4,
      points: ['Names something specific in the set-up, such as ultrasound echoing off something other than the cart (the track or a nearby bag), the back of the cart not facing the sensor squarely, friction slowing the cart, or the speed of sound being wrong for the room’s temperature', 'Says what it does to the results, such as a stray echo giving a distance far off the line, or friction making the later points fall below a straight line so the gradient is too small'],
      model: 'Friction on the wheels slows the cart a little, so it is not quite moving at a steady velocity: the later distances fall short of a straight line, and the gradient of the best line is a little smaller than the cart’s speed at the start.',
      notes: ['“Human error” earns nothing here: the sensor takes the readings. Name something in the set-up.'] },
  ];
  parts.push(d.pick(meaning), d.pick(error));
  return {
    title: 'A cart and a motion sensor',
    intro: `<p>A cart is given a push and then rolls along a level track ${dir} a motion sensor, with the track tilted very slightly so that friction is balanced. The sensor sends out short pulses of ultrasound and records how long each one takes to bounce off the back of the cart and return (the <b>echo time</b>). It records every ${num(step)} s, starting while the cart is already moving.</p><p>The room is at ${air.T} °C, where sound travels at ${air.c} m/s. For a cart moving at a steady velocity <i>v</i>, the supplied model is</p><p class="model"><span class="f">x = x₀ + v t</span></p><p>where <i>x</i> is its distance from the sensor and <i>x</i>₀ is where it was at <i>t</i> = 0.</p>`,
    figures: [dataTable(['Time <i>t</i> (s)', 'Echo time (ms)'], t.map((s, i) => [num(s), num(echo[i], 2)]), 'Motion sensor readings')],
    parts,
  };
}

// a ball dropped in front of a metre rule and photographed with a strobe light, let go as one flash goes off:
// d = ½gt², so d against t² is a straight line through the origin whose gradient is g ÷ 2 (and √d against t is too)
function strobeDrop(d) {
  const f = d.pick([10, 20, 25]), every = f === 10 ? 1 : 2;
  const n = Array.from({ length: 6 }, (_, i) => (i + 1) * every), t = n.map((k) => k / f);
  const gE = d.pick([9.55, 9.6, 9.65, 9.7, 9.75, 9.8, 9.85]), r0 = d.pick([4, 5.5, 8, 10, 12.5]);
  const read = t.map((s) => round(r0 + noisy(d, 0.5 * gE * s * s * 100, 0.015), 1));
  const dm = read.map((r) => round((r - r0) / 100, 4)), t2 = t.map((s) => s * s);
  const k = bestFit(t2.map((x, i) => [x, dm[i]])).slope, g = 2 * k;
  const gOf = (line) => {
    const m = line.slope;
    if (line.y === 'd' && line.x === 't2') return 2 * m;
    if (line.y === 't2' && line.x === 'd') return 2 / m;
    if (line.y === 'sd' && line.x === 't') return 2 * m * m;
    if (line.y === 't' && line.x === 'sd') return 2 / (m * m);
    return null;
  };
  const tl = t.at(-1), H = d.pick([2.5, 3, 4, 5]), speed = d.chance(0.5);
  const last = speed
    ? { label: `The ball’s speed in the last image (t = ${num(tl)} s)`, value: g * tl, unit: 'm/s', of: (gg) => gg * tl, how: `v = u + gt = 0 + ${sig(g, 3)} × ${num(tl)} = <b>${num(g * tl, 2)} m/s</b>` }
    : { label: `The time it would take to fall ${num(H)} m from rest`, value: Math.sqrt((2 * H) / g), unit: 's', of: (gg) => Math.sqrt((2 * H) / gg), how: `d = ½gt², so t = √(2d ÷ g) = √(2 × ${num(H)} ÷ ${sig(g, 3)}) = <b>${num(Math.sqrt((2 * H) / g), 2)} s</b>` };
  const ball = d.pick(['tennis ball', 'steel ball', 'golf ball', 'rubber ball']);

  const parts = [];
  parts.push({ kind: 'table', ask: `Process the data: find the time of each image after the release, how far the ball has fallen in metres, and the time squared.`,
    head: ['Image', 'Scale reading (cm)', '<i>t</i> (s)', '<i>d</i> (m)', '<i>t</i>² (s²)'],
    rows: n.map((k, i) => [num(k), num(read[i], 1), null, null, null]),
    fill: { 2: { values: t, tol: 0.01, unit: 's' }, 3: { values: dm, tol: 0.01, unit: 'm' }, 4: { values: t2, tol: 0.02, unit: 's²' } },
    working: `The flashes are 1 ÷ ${f} = ${num(1 / f, 2)} s apart, so image ${n[0]} is at t = ${n[0]} ÷ ${f} = ${num(t[0], 2)} s. The ball has fallen ${num(read[0], 1)} − ${num(r0, 1)} = ${num(read[0] - r0, 1)} cm = ${num(dm[0], 3)} m, and t² = ${num(t2[0], 4)} s². The same for each row.` });
  const P = parts.length;
  parts.push({ kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find g, and draw the line of best fit.',
    quantities: {
      d: { label: '<i>d</i> (m)', values: dm }, t: { label: '<i>t</i> (s)', values: t }, t2: { label: '<i>t</i>² (s²)', values: t2 },
      sd: { label: '√<i>d</i>', values: dm.map(Math.sqrt) }, d2: { label: '<i>d</i>² (m²)', values: dm.map((x) => x * x) },
    },
    pairs: [['d', 't2'], ['t2', 'd'], ['sd', 't'], ['t', 'sd']],
    working: 'The model d = ½g × t² has the same shape as y = mx, with y = d, x = t² and gradient ½g. So plot d up the side against t² along the bottom: a straight line through the origin. (√d against t is straight too, with gradient √(g ÷ 2).) d against t curves upward.' });
  parts.push({ kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: p4(k), unit: '', tol: 0.06,
    from: { part: P, value: (line) => line.slope, tol: 0.02 },
    working: `Gradient = Δy ÷ Δx between two points far apart on the line: about <b>${sig(k, 3)} m/s²</b> for d (m) against t² (s²).` });
  parts.push({ kind: 'steps', ask: `Use your gradient to find the <b>acceleration due to gravity</b>, g, and then ${speed ? 'the ball’s speed in the last image' : `how long the ball would take to fall ${num(H)} m from rest`}. Show your working.`, topic: 'Free fall',
    steps: [{ label: 'g, from your gradient', value: p4(g), unit: 'm/s²', tol: 0.08 }, { label: last.label, value: p4(last.value), unit: last.unit, tol: 0.05 }],
    from: { part: P, value: (line) => { const gg = gOf(line); return gg > 0 ? last.of(gg) : null; }, tol: 0.04 },
    working: `The gradient is ½g, so g = 2 × ${sig(k, 3)} = ${sig(g, 3)} m/s². Then ${last.how}.` });
  parts.push({ kind: 'written', ask: 'Show that the gradient of a graph of <i>d</i> against <i>t</i>² has the unit of an acceleration, and explain what it represents.', lines: 3,
    points: ['The unit of the gradient is the unit of d over the unit of t²: m ÷ s² = m/s², the unit of an acceleration', 'd = ½g × t² has the form y = mx, so the gradient is ½g: half the acceleration due to gravity'],
    model: 'The gradient is Δd ÷ Δ(t²), so its unit is m ÷ s² = m/s², an acceleration. Comparing d = ½g × t² with y = mx, the gradient is ½g, so g is twice the gradient.' });
  parts.push(d.pick([
    { kind: 'written', ask: 'The metre rule was fixed to the wall about 30 cm <b>behind</b> the falling ball, with the camera 2 m in front. Explain how this affects the value of g found.', lines: 4,
      points: ['Lines from the camera through the ball spread out before they reach the rule behind it, so the ball’s positions read on the rule are spread out too: each distance fallen reads too big', 'Every d is too big by the same factor, so the gradient and g come out too big'],
      model: 'Seen from the camera, the ball is lined up with marks on the rule behind it, and the lines of sight spread out between the ball and the rule. So the distances read on the rule are bigger than the ball really fell, all by the same factor (parallax). That makes the gradient, and so g, too big.' },
    { kind: 'written', ask: 'Compare your value of g with the accepted value, 9.8 m/s². Suggest one reason, from the set-up, for any difference.', lines: 4,
      points: [`States whether the value found (about ${num(g, 2)} m/s²) is above or below 9.8 m/s², and by roughly how much (about ${num(Math.abs((g - 9.8) / 9.8) * 100, 1)}%)`, 'Gives a reason from the set-up that pushes it that way, such as air resistance slowing the ball (g too small), the rule being behind the ball so distances read too big (g too big), or the strobe flashing at a slightly different rate than its setting'],
      model: `The value found, about ${num(g, 2)} m/s², is ${g < 9.8 ? 'a little below' : g > 9.8 ? 'a little above' : 'very close to'} 9.8 m/s² (about ${num(Math.abs((g - 9.8) / 9.8) * 100, 1)}% ${g < 9.8 ? 'low' : 'high'}). ${g < 9.8 ? 'Air resistance on the ball acts upward against its fall, so it speeds up a little less than 9.8 m/s every second.' : 'The rule is behind the ball, so its positions read on the rule are spread out by parallax and every distance fallen reads a little too big.'}`,
      notes: ['“Human error” earns nothing: name something in the set-up and say which way it moves g.'] },
  ]));
  return {
    title: 'A strobe photo of a falling ball',
    intro: `<p>A student drops a ${ball} from rest in front of a vertical metre rule in a dark room, and photographs it with a camera whose shutter stays open while a strobe light flashes ${f} times a second. The ball is let go just as one flash goes off, with its bottom edge level with the ${num(r0, 1)} cm mark. The table gives the scale reading at the bottom of the ball in ${every === 1 ? 'each image' : 'every second image'} after the release.</p><p>For an object falling from rest with no air resistance, the supplied model is</p><p class="model"><span class="f">d = ½ g t²</span></p><p>where <i>d</i> is the distance fallen after a time <i>t</i> and <i>g</i> is the acceleration due to gravity. The student wants to use the photo to find <i>g</i>.</p>`,
    figures: [dataTable(['Image after the release', 'Scale reading (cm)'], n.map((k, i) => [num(k), num(read[i], 1)]), `Strobe flashing ${f} times a second`)],
    parts,
  };
}

// a cyclist already moving speeds up steadily, with a bike computer logging the speed in km/h every few seconds:
// v = u + at, so v against t is a straight line whose gradient is the acceleration and whose intercept is u
function cyclist(d) {
  const who = d.pick(['cyclist', 'rider on an electric bike', 'cyclist on a racing bike']), u = d.pick([2.5, 3, 3.5, 4, 4.5, 5]), dt = d.pick([2, 3]);
  const a = d.pick([0.3, 0.35, 0.4, 0.5, 0.6, 0.75].filter((x) => u + x * 5 * dt <= 12.5));
  const t = Array.from({ length: 6 }, (_, i) => i * dt), T = t.at(-1);
  const kmh = t.map((s) => round(noisy(d, 3.6 * (u + a * s), 0.015), 1)), v = kmh.map((k) => k / 3.6);
  const fit = bestFit(t.map((s, i) => [s, v[i]])), A = fit.slope, U = fit.intercept, S = U * T + 0.5 * A * T * T;
  const distOf = (line) => {
    if (line.y === 'v' && line.x === 't') return line.intercept * T + 0.5 * line.slope * T * T;
    if (line.y === 't' && line.x === 'v') { const acc = 1 / line.slope, u0 = -line.intercept / line.slope; return u0 * T + 0.5 * acc * T * T; }
    return null;
  };

  const parts = [];
  parts.push({ kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
    fields: [field(d, 'Independent variable', 'The time since the start cone', ['The speed of the bike', 'The distance travelled', 'The size of the wheels']),
      field(d, 'Dependent variable', 'The speed of the bike', ['The time since the start cone', 'The mass of the rider', 'The slope of the road'])],
    working: 'The bike computer takes a reading at set times, chosen in advance: time is the <b>independent</b> variable. The speed it measures at each of those times is the <b>dependent</b> variable.' });
  parts.push({ kind: 'table', ask: 'Process the data: write each speed in m/s.', head: ['<i>t</i> (s)', 'Speed (km/h)', 'Speed <i>v</i> (m/s)'],
    rows: t.map((s, i) => [num(s), num(kmh[i], 1), null]), fill: { 2: { values: v, tol: 0.02, unit: 'm/s' } },
    working: `1 m/s = 3.6 km/h, so divide each speed by 3.6: ${num(kmh[0], 1)} km/h ÷ 3.6 = ${num(v[0], 2)} m/s, and the same for each row.` });
  const P = parts.length;
  parts.push({ kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find the acceleration, and draw the line of best fit.',
    quantities: {
      v: { label: '<i>v</i> (m/s)', values: v }, t: { label: '<i>t</i> (s)', values: t }, v2: { label: '<i>v</i>² (m²/s²)', values: v.map((x) => x * x) },
      rt: { label: '√<i>t</i>', values: t.map(Math.sqrt) }, iv: { label: '1 ÷ <i>v</i> (s/m)', values: v.map((x) => 1 / x) },
    },
    pairs: [['v', 't'], ['t', 'v']],
    working: 'The model v = u + a × t has the same shape as y = c + mx: plot v up the side against t along the bottom. The gradient is the acceleration a and the intercept is u, the speed at t = 0. (t against v is straight too, with gradient 1 ÷ a.)' });
  parts.push({ kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: p4(A), unit: '', tol: 0.06, topic: 'Acceleration from a velocity–time graph',
    from: { part: P, value: (line) => line.slope, tol: 0.02 },
    working: `Gradient = Δv ÷ Δt between two points far apart on the line: about <b>${sig(A, 3)} m/s²</b>, the ${who}’s acceleration.` });
  parts.push({ kind: 'steps', ask: `Use your line to find the ${who}’s speed at <i>t</i> = 0, and then how far they travel in the ${T} s of the timing. Show your working.`, topic: 'Displacement from the area under a v–t graph',
    steps: [{ label: 'Speed at t = 0 (the intercept)', value: p4(U), unit: 'm/s', tol: { abs: 0.25 } }, { label: `Distance travelled in the ${T} s`, value: p4(S), unit: 'm', tol: 0.05 }],
    from: { part: P, value: distOf, tol: 0.04 },
    working: `The line crosses the speed axis at u ≈ ${num(U, 2)} m/s. The distance is the area under the line from 0 to ${T} s, a trapezium: ½ × (${num(U, 2)} + ${num(U + A * T, 2)}) × ${T}, or s = ut + ½at² = ${num(U, 2)} × ${T} + ½ × ${sig(A, 3)} × ${T}² ≈ <b>${num(S, 0)} m</b>.` });
  parts.push(d.pick([
    { kind: 'written', ask: 'What does the <b>intercept</b> of your line tell you about the motion?', lines: 3,
      points: ['It is the speed at t = 0, when the timing started (as the bike passed the start cone)', `It isn’t zero: the ${who} was already moving, at about ${num(U, 1)} m/s, before speeding up`],
      model: `The intercept is the speed at t = 0, the moment the bike passed the start cone. It is about ${num(U, 1)} m/s, not zero, so the ${who} was already moving when the timing began.` },
    { kind: 'written', ask: 'Explain why the speeds had to be changed to m/s before finding the acceleration, and show that the gradient then has the unit of an acceleration.', lines: 3,
      points: ['km/h is not an SI unit: with km/h on the axis the gradient would be in km/h per second, 3.6 times the value in m/s²', 'In SI units the gradient’s unit is (m/s) ÷ s = m/s², the unit of acceleration'],
      model: 'The gradient is Δv ÷ Δt. With speeds in km/h it would come out in km/h per second, a number 3.6 times too big for m/s². With v in m/s and t in s, its unit is (m/s) ÷ s = m/s², an acceleration.',
      notes: ['Like using kg instead of g: always work in SI units before using a model.'] },
  ]));
  parts.push(d.pick([
    { kind: 'written', ask: 'The bike computer works out the speed from how often the wheel turns, using a wheel size typed in by the rider. The size typed in was 3% too big. Explain how this affects the acceleration and the intercept found.', lines: 4,
      points: ['The computer thinks each turn of the wheel covers more ground than it does, so every speed reads 3% too high', 'Every speed too big by the same factor makes the gradient (acceleration) and the intercept both 3% too big'],
      model: 'With the wheel size 3% too big, the computer thinks each turn of the wheel covers 3% more ground than it really does, so every speed reads 3% too high. Scaling every speed up by the same factor makes the line steeper and higher: the acceleration and the intercept both come out 3% too big.' },
    { kind: 'written', ask: 'The bike computer’s display lags behind: each reading is really the speed about 1 s earlier. Explain how this affects the acceleration and the intercept found.', lines: 4,
      points: ['Each speed is the speed from 1 s before, which is lower by the same amount (a × 1 s), so every point is too low by the same amount', 'The line shifts down without changing its slope: the acceleration is unaffected, but the intercept (the speed at t = 0) comes out too small'],
      model: 'While speeding up steadily, the speed 1 s earlier is lower by the same amount every time (a × 1 s). So every reading is too low by the same amount: the whole line moves down, keeping its gradient. The acceleration found is still right, but the intercept is too small.' },
  ]));
  return {
    title: 'Speeding up on a bike',
    intro: `<p>A ${who} passes a start cone on a straight, level road and speeds up steadily. A bike computer records their speed, in km/h, every ${dt} s from the moment they pass the cone (t = 0).</p><p>For something moving with a constant acceleration <i>a</i>, the supplied model is</p><p class="model"><span class="f">v = u + a t</span></p><p>where <i>u</i> is the speed at <i>t</i> = 0. The student wants to use the data to find the ${who}’s acceleration and starting speed.</p>`,
    figures: [dataTable(['Time <i>t</i> (s)', 'Speed (km/h)'], t.map((s, i) => [num(s), num(kmh[i], 1)]), 'Bike computer readings')],
    parts,
  };
}

// ---------- 2. motion graphs to read, describe and sketch ----------
const VT = { xLabel: 'time t (s)', yLabel: 'velocity v (m/s)' };

// a journey in stages on a velocity–time graph: one that ends at rest, or one that turns back
function journeyVT(d) {
  const back = d.chance(0.5);
  const who = back
    ? d.pick([
      { name: 'warehouse robot', where: 'along a straight aisle', ut: 1, uv: 0.5 },
      { name: 'remote-control car', where: 'along a straight path', ut: 1, uv: 1 },
      { name: 'shunting locomotive', where: 'along a straight siding', ut: 5, uv: 1 },
    ])
    : d.pick([
      { name: 'tram', where: 'between two stops', ut: 5, uv: 2 },
      { name: 'delivery van', where: 'between two sets of traffic lights', ut: 5, uv: 2 },
      { name: 'electric scooter', where: 'along a straight cycle path', ut: 2, uv: 1 },
      { name: 'model train', where: 'along a straight track', ut: 1, uv: 0.2 },
    ]);
  const { name, ut, uv } = who, T = (k) => k * ut, V = (k) => round(k * uv, 6);
  const axes = (c, lo, hi) => chart(`The ${name}’s velocity`, graph({ x: [0, c.at(-1)[0], ut], y: [V(lo), V(hi), uv], ...VT, lines: [c], points: c.slice(1).map(([a, b]) => [a, b, true]) }));
  const sketchOf = (c, end, top) => ({ kind: 'sketch', ask: `Sketch the ${name}’s <b>position–time</b> graph for the whole journey, starting from position 0. Mark the times where the stages change.`,
    x: 'time (s)', y: 'position (m)', pens: ['Position'], model: [{ pen: 0, pts: modelCurve((t) => areaTo(c, t), 0, end, end / 0.95, top / 0.9) }] });

  if (!back) {
    const t1 = d.int(2, 4), t2 = t1 + d.int(2, 5), t3 = t2 + d.int(1, 3), t4 = t3 + d.int(2, 4);
    const v1 = d.int(3, 5), v2 = d.pick([v1 - 2, v1 - 1, v1 + 1, v1 + 2].filter((v) => v >= 2 && v <= 6));
    const c = [[0, 0], [T(t1), V(v1)], [T(t2), V(v1)], [T(t3), V(v2)], [T(t4), 0]];
    const a1 = V(v1) / T(t1), A1 = 0.5 * T(t1) * V(v1), A2 = V(v1) * (T(t2) - T(t1)), A3 = 0.5 * (V(v1) + V(v2)) * (T(t3) - T(t2)), A4 = 0.5 * V(v2) * (T(t4) - T(t3));
    const total = A1 + A2 + A3 + A4, faster = v2 > v1;
    // the sketch: its position–time graph, or its acceleration–time graph (which goes below zero while it brakes)
    const a3s = (V(v2) - V(v1)) / (T(t3) - T(t2)), a4 = -V(v2) / (T(t4) - T(t3)), off = Math.max(a1, Math.abs(a3s), -a4) * 1.15;
    const sketch = d.chance(0.5)
      ? { ...sketchOf(c, T(t4), total), marks: 3,
        points: ['Starts flat at the origin and curves upward, getting steeper, while it speeds up', `A straight line sloping up from ${T(t1)} s to ${T(t2)} s, at the steady speed`, `${faster ? 'Curves to get steeper' : 'Curves to get less steep'} from ${T(t2)} s to ${T(t3)} s as it ${faster ? 'speeds up' : 'slows down'}`, `Then curves over to flat (horizontal) at ${T(t4)} s when it stops: it never slopes down, since the ${name} never goes back`],
        notes: ['A position–time graph has no sudden corners here: the velocity (its gradient) changes gradually.'] }
      : { kind: 'sketch', ask: `Sketch the ${name}’s <b>acceleration–time</b> graph for the whole journey. Mark the times where the stages change.`, x: 'time (s)', y: 'acceleration (m/s²)', pens: ['Acceleration'], y0: 0.5, marks: 3,
        model: [{ pen: 0, pts: modelLine([[0, a1], [T(t1), a1], [T(t1), 0], [T(t2), 0], [T(t2), a3s], [T(t3), a3s], [T(t3), a4], [T(t4), a4]].map(([x, y]) => [x, y + off]), T(t4) / 0.95, 2 * off) }],
        points: ['Flat (horizontal) lines: a constant acceleration in each stage, jumping from one stage to the next', `Above the axis at ${num(a1, 2)} m/s² from 0 to ${T(t1)} s, then on the axis (zero) from ${T(t1)} s to ${T(t2)} s`,
          `${faster ? 'Above' : 'Below'} the axis from ${T(t2)} s to ${T(t3)} s (${num(a3s, 2)} m/s²), then below it from ${T(t3)} s to ${T(t4)} s (${num(a4, 2)} m/s²) while it brakes`, 'Each value is the gradient of that stage of the v–t graph, so the steepest stage is furthest from the axis'],
        notes: ['A flat stage of the v–t graph means zero acceleration: draw it on the axis, not at the speed.'] };
    return {
      title: `A ${name}’s journey`,
      intro: `<p>A ${name} travels in a straight line ${who.where}. It starts from rest, speeds up, travels at a steady speed, ${faster ? 'speeds up again' : 'slows down'}, and then brakes to a stop. The graph shows its velocity during the journey.</p>`,
      figures: [axes(c, 0, Math.max(v1, v2) + 1)],
      parts: [
        { kind: 'number', ask: `What is the ${name}’s <b>acceleration</b> during the first ${T(t1)} s?`, value: p4(a1), unit: 'm/s²', tol: 0.02, topic: 'Acceleration from a velocity–time graph',
          working: `Acceleration is the gradient of the v–t graph: a = Δv ÷ Δt = (${num(V(v1))} − 0) ÷ (${T(t1)} − 0) = <b>${num(a1, 3)} m/s²</b>.` },
        { kind: 'steps', ask: `How far does the ${name} travel in the first ${T(t2)} s? Show your working.`, topic: 'Displacement from the area under a v–t graph',
          steps: [{ label: `While speeding up (0 to ${T(t1)} s)`, value: p4(A1), unit: 'm' }, { label: `At the steady speed (${T(t1)} to ${T(t2)} s)`, value: p4(A2), unit: 'm' }, { label: `In the first ${T(t2)} s`, value: p4(A1 + A2), unit: 'm' }],
          working: `The distance is the area under the graph. Speeding up, a triangle: ½ × ${T(t1)} × ${num(V(v1))} = ${num(A1)} m. At the steady speed, a rectangle: (${T(t2)} − ${T(t1)}) × ${num(V(v1))} = ${num(A2)} m. Altogether <b>${num(A1 + A2)} m</b>.` },
        { kind: 'steps', ask: `Find the ${name}’s <b>average velocity</b> for the whole journey. Show your working.`, topic: 'Average velocity from a v–t graph',
          steps: [{ label: 'Displacement for the whole journey', value: p4(total), unit: 'm' }, { label: 'Average velocity', value: p4(total / T(t4)), unit: 'm/s' }],
          working: `Add the areas of all four stages: ${num(A1)} + ${num(A2)} + ½ × (${num(V(v1))} + ${num(V(v2))}) × ${T(t3) - T(t2)} + ½ × ${T(t4) - T(t3)} × ${num(V(v2))} = ${num(total)} m. Average velocity = displacement ÷ time = ${num(total)} ÷ ${T(t4)} = <b>${num(total / T(t4), 2)} m/s</b>. (Not the average of the speeds on the graph.)` },
        { kind: 'written', ask: `Describe the ${name}’s motion in each of the four stages of the journey.`, lines: 5,
          points: [`0 to ${T(t1)} s: speeds up steadily from rest to ${num(V(v1))} m/s (a constant acceleration of ${num(a1, 2)} m/s²)`, `${T(t1)} to ${T(t2)} s: moves at a steady ${num(V(v1))} m/s (zero acceleration)`,
            `${T(t2)} to ${T(t3)} s: ${faster ? 'speeds up' : 'slows down'} steadily to ${num(V(v2))} m/s`, `${T(t3)} to ${T(t4)} s: slows down steadily (decelerates) and stops at ${T(t4)} s`],
          model: `For the first ${T(t1)} s the ${name} speeds up steadily from rest to ${num(V(v1))} m/s. From ${T(t1)} s to ${T(t2)} s it moves at a constant ${num(V(v1))} m/s, with no acceleration. From ${T(t2)} s to ${T(t3)} s it ${faster ? 'speeds up' : 'slows down'} steadily to ${num(V(v2))} m/s. In the last stage it decelerates steadily and comes to rest at ${T(t4)} s.`,
          notes: ['A flat part of a v–t graph means a steady speed, not stopped: stopped is a line along the time axis.', 'Be specific: give the speeds and times from the graph, not just “it goes faster”.'] },
        sketch,
      ],
    };
  }

  const A3 = d.pick([1, 2]), k1 = d.int(2, A3 === 1 ? 4 : 3), v1 = A3 * k1, k2 = d.int(1, k1 - 1), v3 = A3 * k2;
  const t1 = d.int(2, 3), t2 = t1 + d.int(2, 4), tc = t2 + k1, t3 = tc + k2, t4 = t3 + d.int(1, 3);
  const c = [[0, 0], [T(t1), V(v1)], [T(t2), V(v1)], [T(t3), -V(v3)], [T(t4), 0]];
  const a3 = -(V(v1) + V(v3)) / (T(t3) - T(t2));
  const fwd = 0.5 * T(t1) * V(v1) + V(v1) * (T(t2) - T(t1)) + 0.5 * (T(tc) - T(t2)) * V(v1), bwd = 0.5 * (T(t4) - T(tc)) * V(v3), disp = fwd - bwd;
  const times = [t1, t2, tc, t3, t4].map((k) => `t = ${T(k)} s`);
  return {
    title: `A ${name} that turns back`,
    intro: `<p>A ${name} moves in a straight line ${who.where}. It starts from rest and moves forward, then slows down, turns back and finally stops. The graph shows its velocity, with forward as positive.</p>`,
    figures: [axes(c, -v3 - 1, v1 + 1)],
    parts: [
      { kind: 'number', ask: `What is the ${name}’s <b>acceleration</b> from t = ${T(t2)} s to t = ${T(t3)} s? Give its sign.`, value: p4(a3), unit: 'm/s²', tol: 0.02, topic: 'Acceleration from a velocity–time graph',
        working: `It is the gradient of that straight piece: a = Δv ÷ Δt = (${br(-V(v3))} − ${num(V(v1))}) ÷ (${T(t3)} − ${T(t2)}) = <b>${num(a3, 3)} m/s²</b>. It is negative all the way along that piece, even after the ${name} turns back.` },
      { kind: 'choice', ask: `At what time is the ${name} <b>furthest from where it started</b>?`, choices: times, correct: 2,
        explain: { ask: 'Explain how the graph shows this.', lines: 3, marks: 1,
          points: [`The velocity is positive (moving forward, away from the start) until the line crosses the time axis at t = ${T(tc)} s, and negative (coming back) after it`],
          model: `Until ${T(tc)} s the velocity is positive, so the ${name} keeps moving away from its start. After ${T(tc)} s it is negative, so it comes back. It is furthest away at ${T(tc)} s, where the line crosses the time axis and the velocity is zero for an instant.`,
          notes: ['Not where the velocity is biggest: it keeps moving away until the velocity reaches zero.'] } },
      { kind: 'steps', ask: `What <b>total distance</b> does the ${name} travel? Show your working.`, topic: 'Total distance from a v–t graph',
        steps: [{ label: 'Distance moving forward (the area above the time axis)', value: p4(fwd), unit: 'm' }, { label: 'Distance moving back (the area below the axis)', value: p4(bwd), unit: 'm' }, { label: 'Total distance travelled', value: p4(fwd + bwd), unit: 'm' }],
        working: `Above the axis (0 to ${T(tc)} s): ½ × ${T(t1)} × ${num(V(v1))} + (${T(t2)} − ${T(t1)}) × ${num(V(v1))} + ½ × (${T(tc)} − ${T(t2)}) × ${num(V(v1))} = ${num(fwd)} m. Below the axis (${T(tc)} s to ${T(t4)} s), a triangle: ½ × ${T(t4) - T(tc)} × ${num(V(v3))} = ${num(bwd)} m. Distance counts both: <b>${num(fwd + bwd)} m</b>.` },
      { kind: 'steps', ask: `Find the ${name}’s <b>displacement</b> at the end, and its <b>average velocity</b> for the whole journey.`, topic: 'Average velocity from a v–t graph',
        steps: [{ label: 'Displacement at the end', value: p4(disp), unit: 'm' }, { label: 'Average velocity', value: p4(disp / T(t4)), unit: 'm/s' }],
        working: `The area below the axis counts as negative: displacement = ${num(fwd)} − ${num(bwd)} = ${num(disp)} m forward. Average velocity = displacement ÷ time = ${num(disp)} ÷ ${T(t4)} = <b>${num(disp / T(t4), 2)} m/s</b>.` },
      { kind: 'written', ask: `Describe the ${name}’s motion from t = ${T(t2)} s until it stops.`, lines: 4,
        points: [`It slows down steadily (a constant deceleration of ${num(-a3, 2)} m/s²) and stops for an instant at t = ${T(tc)} s`, `Then it speeds up in the opposite direction, back towards its start, with the same acceleration, to ${num(V(v3))} m/s at ${T(t3)} s`, `Then it slows down while still moving backward, and stops at ${T(t4)} s`],
        model: `From ${T(t2)} s the ${name} slows down steadily, stopping for an instant at ${T(tc)} s. With the same acceleration it then speeds up backward, towards where it started, reaching ${num(V(v3))} m/s at ${T(t3)} s. Finally it slows down, still moving backward, and stops at ${T(t4)} s.`,
        notes: ['Below the time axis doesn’t mean slowing down: it means moving the opposite way.'] },
      { ...sketchOf(c, T(t4), fwd), marks: 3,
        points: ['Starts flat at the origin and curves upward, getting steeper, while it speeds up', `A straight line sloping up from ${T(t1)} s to ${T(t2)} s, at the steady speed`, `Curves over to a peak, flat for an instant, at ${T(tc)} s: its furthest point`, `Then slopes down as it comes back, levelling off flat at ${T(t4)} s, still above where it started`] },
    ],
  };
}

// a trip on a position–time graph: away, a stop, further away at another speed, then part of the way back
function xtTrip(d) {
  const who = d.pick([
    { name: 'student', intro: 'A student walks along a straight corridor in front of a motion sensor. The graph shows their distance from the sensor.', y: 'distance x (m)', ut: 1, ux: 0.5, back: 'walks back towards the sensor', pos: 'Away from the sensor' },
    { name: 'lift', intro: 'A lift moves up and down the shaft of a tall building. The graph shows its height above the ground floor.', y: 'height (m)', ut: 5, ux: 3, back: 'comes back down', pos: 'Up' },
    { name: 'robot vacuum', intro: 'A robot vacuum cleaner moves along a straight wall. The graph shows its distance from its charging dock.', y: 'distance x (m)', ut: 2, ux: 0.5, back: 'heads back towards its dock', pos: 'Away from the dock' },
    { name: 'canal boat', intro: 'A canal boat moves along a straight stretch of canal. The graph shows its distance from a lock gate.', y: 'distance x (m)', ut: 10, ux: 5, back: 'comes back towards the lock gate', pos: 'Away from the lock gate' },
  ]);
  const { name, ut, ux } = who, T = (k) => k * ut, X = (k) => round(k * ux, 6);
  // the corners, in grid squares; one speed clearly the fastest when the dice allow it
  let k, clear = false;
  for (let i = 0; i < 40 && !clear; i++) {
    const x0 = d.int(0, 2), t1 = d.int(2, 4), x1 = x0 + d.int(3, 6), t2 = t1 + d.int(2, 4), t3 = t2 + d.int(2, 4), x3 = x1 + d.int(2, 6), t4 = t3 + d.int(2, 5), x4 = x3 - d.int(2, x3 - x0 - 1);
    k = { x0, t1, x1, t2, t3, x3, t4, x4 };
    const sp = [(x1 - x0) / t1, (x3 - x1) / (t3 - t2), (x3 - x4) / (t4 - t3)].sort((a, b) => b - a);
    clear = sp[0] >= 1.25 * sp[1];
  }
  const { x0, t1, x1, t2, t3, x3, t4, x4 } = k;
  const c = [[0, X(x0)], [T(t1), X(x1)], [T(t2), X(x1)], [T(t3), X(x3)], [T(t4), X(x4)]];
  const v1 = (X(x1) - X(x0)) / T(t1), v2 = (X(x3) - X(x1)) / (T(t3) - T(t2)), v3 = (X(x4) - X(x3)) / (T(t4) - T(t3));
  const out = X(x3) - X(x0), back = X(x3) - X(x4), disp = X(x4) - X(x0);
  const ivl = [[0, t1], [t1, t2], [t2, t3], [t3, t4]].map(([a, b]) => `${T(a)} s to ${T(b)} s`);
  const speeds = [Math.abs(v1), 0, Math.abs(v2), Math.abs(v3)], fastest = speeds.indexOf(Math.max(...speeds));
  const rest = !clear || d.chance(0.5);
  return {
    title: `A ${name}’s position–time graph`,
    intro: `<p>${who.intro} ${who.pos} is the positive direction.</p>`,
    figures: [chart(`The ${name}’s position`, graph({ x: [0, T(t4), ut], y: [0, X(x3 + 1), ux], xLabel: 'time t (s)', yLabel: who.y, lines: [c], points: c.map(([a, b]) => [a, b, true]) }))],
    parts: [
      { kind: 'number', ask: `What is the ${name}’s <b>velocity</b> during the first ${T(t1)} s?`, value: p4(v1), unit: 'm/s', tol: 0.02, topic: 'Velocity from a position–time graph',
        working: `Velocity is the gradient of the x–t graph: v = Δx ÷ Δt = (${num(X(x1))} − ${num(X(x0))}) ÷ (${T(t1)} − 0) = <b>${num(v1, 3)} m/s</b>.` },
      rest
        ? { kind: 'choice', ask: `During which time interval is the ${name} <b>at rest</b>?`, choices: ivl, correct: 1,
          explain: { ask: 'How does the graph show this?', lines: 2, marks: 1, points: ['The line is flat (horizontal) there: the position doesn’t change, so the velocity, the gradient, is zero'],
            model: `From ${ivl[1]} the line is flat: the ${name}’s position stays at ${num(X(x1))} m, so its gradient, the velocity, is zero.` } }
        : { kind: 'choice', ask: `During which time interval is the ${name} moving <b>fastest</b>?`, choices: ivl, correct: fastest,
          explain: { ask: 'How does the graph show this?', lines: 2, marks: 1, points: ['That part of the line is the steepest: the position changes most each second (the size of the gradient is the speed)'],
            model: `From ${ivl[fastest]} the line is steepest, so the position changes fastest: the size of the gradient, ${num(speeds[fastest], 2)} m/s, is the biggest speed.`,
            notes: ['The highest part of the graph isn’t the fastest: look at how steep each part is.'] } },
      { kind: 'number', ask: `What is the ${name}’s <b>velocity</b> while it ${who.back}?`, value: p4(v3), unit: 'm/s', tol: 0.02, topic: 'Velocity on one part of an x–t graph',
        working: `Use only that piece of the line: v = (${num(X(x4))} − ${num(X(x3))}) ÷ (${T(t4)} − ${T(t3)}) = <b>${num(v3, 3)} m/s</b>. It is negative because x decreases: the ${name} moves the opposite way.` },
      { kind: 'steps', ask: `What <b>total distance</b> does the ${name} travel in the ${T(t4)} s? Show your working.`, topic: 'Distance or displacement from an x–t graph',
        steps: [{ label: 'Distance on the way out', value: p4(out), unit: 'm' }, { label: 'Distance on the way back', value: p4(back), unit: 'm' }, { label: 'Total distance', value: p4(out + back), unit: 'm' }],
        working: `Out: from ${num(X(x0))} m to ${num(X(x3))} m, ${num(out)} m (the flat part adds nothing). Back: from ${num(X(x3))} m to ${num(X(x4))} m, ${num(back)} m. Distance adds every leg: ${num(out)} + ${num(back)} = <b>${num(out + back)} m</b>.` },
      { kind: 'steps', ask: `Find the ${name}’s <b>displacement</b> over the whole ${T(t4)} s, and its <b>average velocity</b>.`, topic: 'Average velocity from an x–t graph',
        steps: [{ label: 'Displacement', value: p4(disp), unit: 'm' }, { label: 'Average velocity', value: p4(disp / T(t4)), unit: 'm/s' }],
        working: `Displacement = final position − starting position = ${num(X(x4))} − ${num(X(x0))} = ${num(disp)} m. Average velocity = displacement ÷ time = ${num(disp)} ÷ ${T(t4)} = <b>${num(disp / T(t4), 3)} m/s</b>.` },
      { kind: 'sketch', ask: `Sketch the ${name}’s <b>speed–time</b> graph for the ${T(t4)} s.`, x: 'time (s)', y: 'speed (m/s)', pens: ['Speed'], marks: 3,
        model: [{ pen: 0, pts: modelLine([[0, speeds[0]], [T(t1), speeds[0]], [T(t1), 0], [T(t2), 0], [T(t2), speeds[2]], [T(t3), speeds[2]], [T(t3), speeds[3]], [T(t4), speeds[3]]], T(t4) / 0.95, Math.max(...speeds) / 0.85) }],
        points: ['Flat (horizontal) lines: a steady speed on each part, jumping where the speed changes', `On the time axis (speed 0) from ${T(t1)} s to ${T(t2)} s, while it is at rest`, `The right speeds in order: ${num(speeds[0], 2)} m/s, then 0, then ${num(speeds[2], 2)} m/s, then ${num(speeds[3], 2)} m/s`, 'The way back drawn above the axis: speed has no direction, so it is never negative'],
        notes: ['Copying the shape of the x–t graph earns nothing: the speed is its gradient, not its height.'] },
    ],
  };
}

// an acceleration–time graph: speeding up, a steady speed, then slowing down
function atGraph(d) {
  const who = d.pick([
    { name: 'electric car', where: 'on a straight test track', ut: 1, a1: [2, 2.5, 3, 4], t1: [3, 4, 5, 6], t2: [3, 4, 5, 6, 8], a3: [2, 3, 4, 5, 6], dt3: [2, 3, 4, 5], u: [0, 0, 5, 10] },
    { name: 'train', where: 'leaving a station', ut: 5, a1: [0.5, 0.75, 1], t1: [10, 15, 20], t2: [20, 25, 30, 40], a3: [0.5, 0.75, 1, 1.25], dt3: [5, 10, 15, 20], u: [0] },
    { name: 'speedboat', where: 'across a calm lake', ut: 2, a1: [1, 1.5, 2], t1: [4, 6, 8], t2: [6, 8, 10], a3: [1, 1.5, 2, 2.5], dt3: [2, 4, 6], u: [0, 2, 4] },
    { name: 'lift', where: 'going up a tall building', ut: 1, a1: [0.5, 1, 1.5], t1: [2, 3, 4], t2: [4, 5, 6, 8, 10], a3: [0.5, 1, 1.5, 2], dt3: [1, 2, 3, 4], u: [0], stop: true },
  ]);
  const { name, ut } = who, a1 = d.pick(who.a1), t1 = d.pick(who.t1), u = d.pick(who.u), v1 = u + a1 * t1, t2 = t1 + d.pick(who.t2);
  // the braking: leaves it still moving forward, or (a lift) just stopped
  const options = who.a3.flatMap((a) => who.dt3.map((t) => [a, t])).filter(([a, t]) => (who.stop ? Math.abs(a * t - v1) < 1e-9 : a * t <= 0.8 * v1));
  const [a3, dt3] = options.length ? d.pick(options) : [v1 / who.dt3.at(-1), who.dt3.at(-1)];
  const t3 = t2 + dt3, v3 = round(v1 - a3 * dt3, 6), dv = a1 * t1;
  const ys = [a1, a3].every((a) => Number.isInteger(a)) && Math.max(a1, a3) > 3 ? 1 : [a1, a3].every((a) => Number.isInteger(a * 2)) ? 0.5 : 0.25;
  const s1 = 0.5 * (u + v1) * t1, s2 = v1 * (t2 - t1);
  const zeroClaim = d.pick([`A student says the ${name} has stopped between t = ${t1} s and t = ${t2} s, because its acceleration is zero.`, `A student says the ${name} is not moving from t = ${t1} s to t = ${t2} s, since the graph is at zero there.`]);
  return {
    title: `A ${name}’s acceleration`,
    intro: `<p>A ${name} moves in a straight line ${who.where}. ${u ? `At t = 0 it is already moving at ${u} m/s.` : 'It starts from rest at t = 0.'} The graph shows its acceleration.</p>`,
    figures: [chart(`The ${name}’s acceleration`, graph({ x: [0, t3 + ut, ut], y: [-(a3 + ys), a1 + ys, ys], xLabel: 'time t (s)', yLabel: 'acceleration a (m/s²)',
      lines: [[[0, a1], [t1, a1], [t1, 0], [t2, 0], [t2, -a3], [t3, -a3], [t3, 0]]], points: [[t1, a1, true], [t2, -a3, true], [t3, -a3, true]] }))],
    parts: [
      { kind: 'number', ask: `By how much does the ${name}’s velocity change in the first ${t1} s?`, value: p4(dv), unit: 'm/s', tol: 0.02, topic: 'Velocity from an acceleration–time graph',
        working: `The change in velocity is the area under the a–t graph: ${num(a1)} m/s² × ${t1} s = <b>${num(dv)} m/s</b>.` },
      { kind: 'steps', ask: `What is the ${name}’s velocity at t = ${t3} s? Show your working.`, topic: 'Velocity from an acceleration–time graph',
        steps: [{ label: `Velocity at t = ${t1} s`, value: p4(v1), unit: 'm/s' }, { label: `Change in velocity from ${t2} s to ${t3} s`, value: p4(-a3 * dt3), unit: 'm/s' }, { label: `Velocity at t = ${t3} s`, value: p4(v3), unit: 'm/s', tol: v3 === 0 ? { abs: 0.05 } : 0.02 }],
        working: `At ${t1} s: v = ${u} + ${num(a1)} × ${t1} = ${num(v1)} m/s. From ${t1} s to ${t2} s the acceleration is zero, so the velocity stays ${num(v1)} m/s. From ${t2} s to ${t3} s the area is below the axis: Δv = ${br(-a3)} × ${dt3} = ${num(-a3 * dt3)} m/s. So at ${t3} s, v = ${num(v1)} + (${num(-a3 * dt3)}) = <b>${num(v3)} m/s</b>${v3 === 0 ? ': it has stopped' : ''}.` },
      { kind: 'choice', ask: `${zeroClaim} Is the student right?`, ...choices(d, `No: it keeps moving at a steady ${num(v1)} m/s`, ['Yes: with no acceleration it isn’t moving']),
        explain: { ask: 'Explain.', lines: 3, marks: 2,
          points: ['Zero acceleration means the velocity isn’t changing, not that the velocity is zero', `So the ${name} keeps moving at the ${num(v1)} m/s it had reached at ${t1} s`],
          model: `Acceleration is how fast the velocity changes. Zero acceleration means the velocity stays the same, so from ${t1} s to ${t2} s the ${name} keeps moving at a steady ${num(v1)} m/s, the velocity it reached at ${t1} s.` } },
      { kind: 'sketch', ask: `Sketch the ${name}’s <b>velocity–time</b> graph from t = 0 to t = ${t3} s.`, x: 'time (s)', y: 'velocity (m/s)', pens: ['Velocity'], marks: 3,
        model: [{ pen: 0, pts: modelLine([[0, u], [t1, v1], [t2, v1], [t3, v3]], t3 / 0.95, v1 / 0.9) }],
        points: [`A straight line sloping up from ${u ? `${u} m/s` : 'the origin'} to ${num(v1)} m/s at ${t1} s`, `A flat line at ${num(v1)} m/s from ${t1} s to ${t2} s`, `A straight line sloping down to ${num(v3)} m/s at ${t3} s`, 'The line joins up with no jumps: the velocity changes smoothly even where the acceleration jumps'],
        notes: ['Copying the a–t graph’s steps earns nothing: the velocity–time graph’s gradient is the acceleration.'] },
      { kind: 'steps', ask: `How far does the ${name} travel in the first ${t2} s? Show your working.`, topic: 'Displacement from the area under a v–t graph',
        steps: [{ label: `Distance from 0 to ${t1} s`, value: p4(s1), unit: 'm' }, { label: `Distance from ${t1} s to ${t2} s`, value: p4(s2), unit: 'm' }, { label: `Distance in the first ${t2} s`, value: p4(s1 + s2), unit: 'm' }],
        working: `Use the areas under your v–t graph. Speeding up: ½ × (${u} + ${num(v1)}) × ${t1} = ${num(s1)} m. At the steady speed: ${num(v1)} × (${t2} − ${t1}) = ${num(s2)} m. Altogether <b>${num(s1 + s2)} m</b>.` },
    ],
  };
}

// two objects on one velocity–time graph: one at a steady speed, the other setting off after it from rest
function twoOnOne(d) {
  const it = d.pick([
    { a: 'car', b: 'police motorcycle', intro: (V) => `A car driving at a steady ${V} m/s passes a police motorcycle waiting at the side of a straight road. At that moment (t = 0) the motorcycle sets off after it, speeding up steadily.`, combos: [[20, 4], [24, 4], [25, 5], [20, 2.5], [24, 3], [30, 5], [18, 3], [16, 2]] },
    { a: 'jogger', b: 'friend', intro: (V) => `A jogger running at a steady ${V} m/s passes a friend standing on a straight path. At that moment (t = 0) the friend starts running after the jogger, speeding up steadily.`, combos: [[4, 1], [5, 1.25], [4.5, 1.5], [3, 0.75], [5, 1]] },
    { a: 'lorry', b: 'car', intro: (V) => `A lorry moving at a steady ${V} m/s passes a car waiting at traffic lights just as they turn green (t = 0). The car speeds up steadily after it.`, combos: [[10, 2], [12, 3], [12, 2], [14, 3.5], [9, 1.5]] },
  ]);
  const [V, a] = d.pick(it.combos), ts = V / a, Tc = 2 * ts, cap = (s) => s[0].toUpperCase() + s.slice(1);
  const ahead = V * ts, gone = 0.5 * V * ts, gap = ahead - gone, meet = V * Tc;
  const tMax = 1.25 * Tc, xMax = tMax / 0.95, yMax = (0.5 * a * tMax * tMax) / 0.9, ys = V >= 10 ? 5 : 1;
  return {
    title: `The ${it.a} and the ${it.b}`,
    intro: `<p>${it.intro(num(V))} The graph shows both velocities until the ${it.b} catches up.</p>`,
    figures: [chart('Velocities of both', graph({ x: [0, Tc, 1], y: [0, Math.ceil((2 * V) / ys) * ys, ys], ...VT,
      lines: [[[0, V], [Tc, V]], [[0, 0], [Tc, 2 * V]]], points: [[ts, V, true], [Tc, 2 * V, true]] }) + `<div class="legend"><span class="k k0">${cap(it.a)}</span><span class="k k1">${cap(it.b)}</span></div>`)],
    parts: [
      { kind: 'number', ask: `What is the ${it.b}’s <b>acceleration</b>?`, value: p4(a), unit: 'm/s²', tol: 0.02, topic: 'Acceleration from a velocity–time graph',
        working: `The gradient of the ${it.b}’s line: a = Δv ÷ Δt = (${num(V)} − 0) ÷ (${num(ts)} − 0) = <b>${num(a, 3)} m/s²</b>.` },
      { kind: 'number', ask: `At what time do the ${it.a} and the ${it.b} have the <b>same speed</b>?`, value: p4(ts), unit: 's', tol: { abs: 0.2 }, topic: 'Two objects on one v–t graph',
        working: `Where the two lines cross: ${num(a)} × t = ${num(V)}, so t = <b>${num(ts)} s</b>.` },
      { kind: 'steps', ask: `How far ahead of the ${it.b} is the ${it.a} at that moment? Show your working.`, topic: 'Two objects on one v–t graph',
        steps: [{ label: `Distance the ${it.a} has gone`, value: p4(ahead), unit: 'm' }, { label: `Distance the ${it.b} has gone`, value: p4(gone), unit: 'm' }, { label: `How far ahead the ${it.a} is`, value: p4(gap), unit: 'm' }],
        working: `Each distance is the area under its own line up to ${num(ts)} s. The ${it.a}: a rectangle, ${num(V)} × ${num(ts)} = ${num(ahead)} m. The ${it.b}: a triangle, ½ × ${num(ts)} × ${num(V)} = ${num(gone)} m. The gap is ${num(ahead)} − ${num(gone)} = <b>${num(gap)} m</b>, the area between the lines.` },
      { kind: 'written', ask: `Explain why the ${it.a} is <b>furthest ahead</b> of the ${it.b} at the moment their speeds are equal.`, lines: 4,
        points: [`Before then the ${it.a} is faster, so it gains on the ${it.b} every second and the gap grows`, `After then the ${it.b} is faster, so it closes the gap: the gap stops growing exactly when the speeds are equal`],
        model: `Until ${num(ts)} s the ${it.a} is moving faster, so every second it pulls further ahead. After ${num(ts)} s the ${it.b} is faster and starts closing the gap. So the gap is biggest at ${num(ts)} s, when the speeds are equal.`,
        notes: ['Equal speeds doesn’t mean they are side by side: the gap is biggest there, not zero.'] },
      { kind: 'steps', ask: `When does the ${it.b} catch up with the ${it.a}, and how far from the start is that? Show your working.`, topic: 'Two objects on one v–t graph',
        steps: [{ label: `Time when the ${it.b} catches up`, value: p4(Tc), unit: 's' }, { label: 'Distance from the start', value: p4(meet), unit: 'm' }],
        working: `They have gone the same distance when the areas under the two lines are equal: ${num(V)} × t = ½ × ${num(a)} × t², so t = 2 × ${num(V)} ÷ ${num(a)} = ${num(Tc)} s. Both have then gone ${num(V)} × ${num(Tc)} = <b>${num(meet)} m</b>.` },
      { kind: 'sketch', ask: `Sketch the <b>position–time</b> graphs of the ${it.a} and the ${it.b} on the same axes, from t = 0 until a little after the ${it.b} catches up.`, x: 'time (s)', y: 'distance from the start (m)', pens: [cap(it.a), cap(it.b)], marks: 3,
        model: [{ pen: 0, pts: modelLine([[0, 0], [tMax, V * tMax]], xMax, yMax) }, { pen: 1, pts: modelCurve((t) => 0.5 * a * t * t, 0, tMax, xMax, yMax) }],
        points: [`${cap(it.a)}: a straight line from the origin, sloping up steadily (a steady speed)`, `${cap(it.b)}: starts flat at the origin (from rest) and curves upward, getting steeper`, `The curve stays below the line until they cross at ${num(Tc)} s, where the curve is the steeper of the two`] },
    ],
  };
}

// ---------- 3. problems to solve in steps and explain ----------

// a driver sees a hazard and stops: the thinking distance at a steady speed, then the braking distance
function braking(d) {
  const kmh = d.pick([36, 45, 54, 63, 72, 81, 90, 108]), v = kmh / 3.6;
  const tr = d.pick([0.6, 0.7, 0.8, 0.9, 1, 1.1, 1.2]), b = d.pick([5.5, 6, 6.5, 7, 7.5, 8]);
  const think = v * tr, brk = (v * v) / (2 * b), stop = think + brk;
  const hz = d.pick(['a fallen branch', 'a deer', 'a broken-down car', 'a dog']);
  const ok = d.chance(0.5), D = Math.round(stop * (ok ? d.pick([1.15, 1.2, 1.25]) : d.pick([0.78, 0.82, 0.86])));
  const cond = d.pick([
    { what: 'The driver is very tired', which: 0, pens: ['Alert driver', 'Tired driver'], tr2: tr + 0.6, b2: b,
      why: 'A tired driver takes longer to react, so the car travels further at full speed before the brakes come on; the brakes and the road are the same, so the braking distance doesn’t change' },
    { what: 'The driver is glancing at a phone', which: 0, pens: ['Watching the road', 'Glancing at a phone'], tr2: tr + 0.8, b2: b,
      why: 'Looking at a phone makes the driver slower to react, so the car travels further before braking starts; once braking, it slows just as fast, so the braking distance doesn’t change' },
    { what: 'The road is wet', which: 1, pens: ['Dry road', 'Wet road'], tr2: tr, b2: b * 0.6,
      why: 'On a wet road the tyres grip less, so the car can’t decelerate as hard and the braking distance is longer; the driver reacts just as quickly, so the thinking distance doesn’t change' },
    { what: 'The car’s tyres are badly worn', which: 1, pens: ['Good tyres', 'Worn tyres'], tr2: tr, b2: b * 0.7,
      why: 'Worn tyres grip the road less, so the car can’t decelerate as hard and the braking distance is longer; the reaction time is the same, so the thinking distance doesn’t change' },
  ]);
  const end1 = tr + v / b, end2 = cond.tr2 + v / cond.b2, tMax = Math.max(end1, end2) * 1.15, late = cond.which === 0;
  return {
    title: 'Stopping in time',
    intro: `<p>A car is travelling at ${kmh} km/h along a straight, level road when the driver sees ${hz} on the road ${D} m ahead. The driver’s reaction time is ${num(tr)} s: the car keeps its speed until the brakes come on. The brakes then slow the car at a steady ${num(b)} m/s² until it stops.</p>`,
    parts: [
      { kind: 'steps', ask: 'Find the car’s <b>stopping distance</b>: how far it travels from the moment the driver sees the danger until it stops. Show your working.', topic: 'Braking distance',
        steps: [{ label: 'Speed in m/s', value: p4(v), unit: 'm/s', tol: 0.01 }, { label: 'Thinking distance (during the reaction time)', value: p4(think), unit: 'm' }, { label: 'Braking distance', value: p4(brk), unit: 'm' }, { label: 'Stopping distance', value: p4(stop), unit: 'm' }],
        working: `${kmh} km/h ÷ 3.6 = ${num(v, 2)} m/s. While the driver reacts, the car keeps its speed: ${num(v, 2)} × ${num(tr)} = ${num(think, 1)} m. While braking, v² = u² + 2as with v = 0 and a = −${num(b)} m/s²: s = u² ÷ 2b = ${num(v, 2)}² ÷ (2 × ${num(b)}) = ${num(brk, 1)} m. Stopping distance = ${num(think, 1)} + ${num(brk, 1)} = <b>${num(stop, 1)} m</b>.` },
      { kind: 'choice', ask: `Does the car stop before it reaches ${hz}?`, choices: [`Yes: it stops before reaching ${hz}`, `No: it reaches ${hz} before it stops`], correct: ok ? 0 : 1,
        explain: { ask: 'Explain, using your answer above.', lines: 2, marks: 1, points: [`Its stopping distance, about ${num(stop, 0)} m, is ${ok ? 'less' : 'more'} than the ${D} m to ${hz}`],
          model: `The car needs about ${num(stop, 0)} m to stop, and ${hz} is ${D} m ahead, so it ${ok ? `stops about ${num(D - stop, 0)} m short` : `is still moving when it gets there`}.` } },
      { kind: 'written', ask: 'At double the speed, the <b>thinking distance</b> doubles but the <b>braking distance</b> becomes four times as long. Explain why.', lines: 5, topic: 'Braking distance',
        points: ['Thinking distance = speed × reaction time: the car keeps its speed while the driver reacts, so the distance is proportional to the speed (double the speed, double the distance)', 'Braking distance = v² ÷ 2a: with the same deceleration it is proportional to the speed squared', 'So doubling the speed makes the braking distance 2² = 4 times as long (it takes twice as long to stop, at twice the average speed)'],
        model: 'While the driver reacts, the car moves at a steady speed, so the thinking distance is speed × reaction time: twice the speed covers twice the distance. While braking, s = v² ÷ 2a. The brakes give the same deceleration, so the braking distance depends on the speed squared: at twice the speed it is 2² = 4 times as long. Put another way, it takes twice as long to stop, at twice the average speed, so 2 × 2 = 4 times the distance.',
        notes: ['“Because it’s going faster” isn’t enough: say how each distance depends on the speed.'] },
      { kind: 'choice', ask: `${cond.what}. Which part of the stopping distance does this change?`, choices: ['Only the thinking distance', 'Only the braking distance', 'Both distances', 'Neither distance'], correct: cond.which,
        explain: { ask: 'Explain why.', lines: 3, marks: 1, points: [cond.why[0].toUpperCase() + cond.why.slice(1)],
          model: `${cond.why[0].toUpperCase() + cond.why.slice(1)}.` } },
      { kind: 'sketch', ask: `Sketch velocity–time graphs of the stop for two cases on the same axes: “${cond.pens[0]}” and “${cond.pens[1]}”, from the moment the driver sees the danger.`, x: 'time (s)', y: 'velocity (m/s)', pens: cond.pens, marks: 3,
        model: [{ pen: 0, pts: modelLine([[0, v], [tr, v], [end1, 0], [tMax, 0]], tMax, v / 0.85) }, { pen: 1, pts: modelLine([[0, v], [cond.tr2, v], [end2, 0], [tMax, 0]], tMax, v / 0.85) }],
        points: ['Both start flat at the same speed during the reaction time, then slope down in a straight line to zero (a steady deceleration)',
          late ? `${cond.pens[1]}: the flat part lasts longer, and the sloping part is parallel to the other line (the same deceleration)` : `${cond.pens[1]}: the same flat part, then a less steep slope that reaches zero later`,
          `The area under the “${cond.pens[1]}” line, its stopping distance, is the bigger one`] },
    ],
  };
}

// something dropped from rest: how far or how long it falls, how fast it lands, and why
function freeFall(d) {
  const timed = d.chance(0.5), parts = [];
  let intro, T, H, thing;
  if (timed) {
    const place = d.pick([{ where: 'the edge of a deep well', into: 'the water at the bottom' }, { where: 'the top of a sea cliff', into: 'the sea below' }, { where: 'a high bridge', into: 'the river below' }]);
    thing = 'stone'; T = d.pick([1.2, 1.4, 1.5, 1.6, 1.8, 2, 2.2, 2.4]); H = 0.5 * G * T * T;
    const tSound = H / 340;
    intro = `<p>A student drops a small stone from rest from ${place.where}. Watching closely, they see it splash into ${place.into} ${num(T)} s later. Air resistance can be neglected, and g = 9.8 m/s².</p>`;
    parts.push({ kind: 'steps', ask: 'How far does the stone fall, and how fast is it moving when it reaches the water? Show your working.', topic: 'Free fall',
      steps: [{ label: 'Distance fallen', value: p4(H), unit: 'm' }, { label: 'Speed when it reaches the water', value: p4(G * T), unit: 'm/s' }],
      working: `From rest, s = ½gt² = ½ × 9.8 × ${num(T)}² = ${num(H, 2)} m. Then v = u + gt = 0 + 9.8 × ${num(T)} = <b>${num(G * T, 2)} m/s</b> (or v² = 2gs).` });
    parts.push({ kind: 'steps', ask: 'In the dark, the student could only <b>hear</b> the splash. Sound travels at a steady 340 m/s. How long after letting go would they hear it? Show your working.', topic: 'Free fall',
      steps: [{ label: 'Time for the sound to travel back up', value: p4(tSound), unit: 's', tol: 0.03 }, { label: 'Time from letting go until they hear the splash', value: p4(T + tSound), unit: 's', tol: 0.005 }],
      working: `The sound travels the ${num(H, 2)} m back up at a steady 340 m/s: t = ${num(H, 2)} ÷ 340 = ${num(tSound, 3)} s. So they hear it ${num(T)} + ${num(tSound, 3)} = <b>${num(T + tSound, 3)} s</b> after letting go.` });
  } else {
    const place = d.pick([{ who: 'A builder', thing: 'spanner', from: 'some scaffolding' }, { who: 'A window cleaner', thing: 'squeegee', from: 'a platform on the side of a building' }, { who: 'A student', thing: 'ball', from: 'a footbridge' }]);
    H = d.pick([5, 7.5, 10, 12, 15, 20, 25, 30]); T = Math.sqrt((2 * H) / G); thing = place.thing;
    intro = `<p>${place.who} accidentally drops a ${thing} from rest from ${place.from}, ${num(H)} m above the ground. Air resistance can be neglected, and g = 9.8 m/s².</p>`;
    parts.push({ kind: 'steps', ask: `How long does the ${thing} take to reach the ground, and how fast is it moving when it lands? Show your working.`, topic: 'Free fall',
      steps: [{ label: 'Time to fall', value: p4(T), unit: 's' }, { label: 'Speed when it lands', value: p4(G * T), unit: 'm/s' }],
      working: `From rest, s = ½gt², so t = √(2s ÷ g) = √(2 × ${num(H)} ÷ 9.8) = ${num(T, 2)} s. Then v = gt = 9.8 × ${num(T, 3)} = <b>${num(G * T, 1)} m/s</b> (or v = √(2gs)).` });
    parts.push({ kind: 'steps', ask: `How far has the ${thing} fallen by the time it is moving at <b>half</b> its landing speed? Show your working.`, topic: 'Free fall',
      steps: [{ label: 'Time to reach half the landing speed', value: p4(T / 2), unit: 's' }, { label: 'Distance fallen by then', value: p4(H / 4), unit: 'm' }],
      working: `Its speed grows steadily (v = gt), so it reaches half its landing speed at half the time: ${num(T / 2, 3)} s. By then s = ½gt² = ½ × 9.8 × ${num(T / 2, 3)}² = <b>${num(H / 4, 2)} m</b>: only a quarter of the way down, since the distance grows with t².` });
  }
  parts.push(d.pick([
    { kind: 'written', ask: `A second ${thing}, twice as heavy, is dropped at the same moment from the same place. Explain why, with no air resistance, both arrive at the same time.`, lines: 4,
      points: ['Without air resistance every object falls with the same acceleration, g = 9.8 m/s²', 'The heavier one has twice the weight pulling it, but twice the mass to speed up, so its acceleration is the same (a = W ÷ m = g); from rest with the same acceleration, they take the same time'],
      model: `With no air resistance the only force is the weight. The heavier ${thing} has twice the weight, but also twice the mass to speed up, so its acceleration is the same: a = W ÷ m = g = 9.8 m/s². Both start from rest with the same acceleration, so they fall side by side and land together.`,
      notes: ['“Gravity is the same” isn’t enough: the pull is bigger on the heavier one. Say why the acceleration is the same.'] },
    { kind: 'written', ask: `Explain why the ${thing} falls further during each second than during the second before.`, lines: 3,
      points: ['Its speed increases by 9.8 m/s every second (a constant acceleration)', 'So its average speed during each second is higher than in the second before, and distance = average speed × time'],
      model: `The ${thing} speeds up by 9.8 m/s every second. So during each second its average speed is 9.8 m/s higher than during the second before, and since the distance in a second is its average speed × 1 s, it covers more ground every second.` },
  ]));
  const vt = 0.6 * G * T, xMax = T / 0.95, yMax = (G * T) / 0.9;
  parts.push({ kind: 'sketch', ask: `Sketch the ${thing}’s <b>speed–time</b> graph as it falls, on the same axes for two cases: with no air resistance, and with some air resistance.`, x: 'time (s)', y: 'speed (m/s)', pens: ['No air resistance', 'With air resistance'], marks: 3,
    model: [{ pen: 0, pts: modelLine([[0, 0], [T, G * T]], xMax, yMax) }, { pen: 1, pts: modelCurve((t) => vt * (1 - Math.exp((-G * t) / vt)), 0, T, xMax, yMax) }],
    points: ['No air resistance: a straight line through the origin (the speed rises by 9.8 m/s every second)', 'With air resistance: starts at the origin with the same gradient as the straight line', 'then curves, getting less steep and staying below the straight line, levelling off towards a top speed'] });
  parts.push({ kind: 'written', ask: `A real ${thing} takes a little longer to fall than you calculated. Explain why, using the forces on it.`, lines: 4,
    points: ['Air resistance acts upward, against its motion, and grows as it speeds up', 'So the resultant (net) force downward is less than its weight: its acceleration is less than 9.8 m/s², it speeds up more slowly and takes longer'],
    model: `As the ${thing} falls, air resistance pushes up against its motion, more and more as it speeds up. The resultant force downward is its weight minus the air resistance, which is less than its weight, so it accelerates at less than 9.8 m/s². It speeds up more slowly and takes longer to fall.`,
    notes: ['“Air resistance slows it down” loses the second mark: it still speeds up, just less quickly.'] });
  return { title: timed ? 'How deep?' : 'Dropped from a height', intro, parts };
}

// a ball thrown straight up: the highest point, its velocity later on, and why it still accelerates at the top
function thrownUp(d) {
  const it = d.pick([{ who: 'A juggler', thing: 'ball' }, { who: 'A volleyball player', thing: 'volleyball' }, { who: 'A student', thing: 'tennis ball' }, { who: 'A child', thing: 'beanbag' }]);
  const u = d.pick([6, 7, 8, 9, 10, 12, 14, 15]), top = u / G, H = (u * u) / (2 * G), back = 2 * top;
  const t1 = round(top + d.pick([0.2, 0.3, 0.4, 0.5]), 1), v1 = u - G * t1;
  const parts = [
    { kind: 'steps', ask: `How long does the ${it.thing} take to reach its <b>highest point</b>, and how high above the hand does it rise? Show your working.`, topic: 'Thrown straight up',
      steps: [{ label: 'Time to the highest point', value: p4(top), unit: 's' }, { label: 'Greatest height above the hand', value: p4(H), unit: 'm' }],
      working: `At the highest point v = 0. Taking up as positive, a = −9.8 m/s². v = u + at: 0 = ${u} + (−9.8) × t, so t = ${u} ÷ 9.8 = ${num(top, 2)} s. v² = u² + 2as: 0 = ${u}² + 2 × (−9.8) × s, so s = ${u}² ÷ 19.6 = <b>${num(H, 2)} m</b>.` },
    { kind: 'number', ask: `Taking upward as positive, what is the ${it.thing}’s <b>velocity</b> ${num(t1)} s after it is thrown? Give its sign.`, value: p4(v1), unit: 'm/s', tol: 0.03, topic: 'Thrown straight up',
      working: `v = u + at = ${u} + (−9.8) × ${num(t1)} = <b>${num(v1, 2)} m/s</b>. It is negative because by then the ${it.thing} has passed its highest point and is falling.` },
    { kind: 'number', ask: `How long after it is thrown does the ${it.thing} get back to the thrower’s hand, at the height it was thrown from?`, value: p4(back), unit: 's', tol: 0.02, topic: 'Thrown straight up',
      working: `With no air resistance it takes as long to come down as to go up: 2 × ${num(top, 3)} = <b>${num(back, 2)} s</b>. (Or put s = 0 in s = ut + ½at²: t = 2u ÷ g.)` },
    { kind: 'written', ask: `At its highest point the ${it.thing}’s velocity is zero. Explain why its acceleration is still 9.8 m/s² downward there.`, lines: 4, marks: 2,
      points: [`Gravity (its weight) still pulls on the ${it.thing} at the top, so there is still a resultant force downward`, 'Its velocity is still changing there: from upward to downward, by 9.8 m/s every second', 'It is at rest for an instant only: zero velocity doesn’t mean zero acceleration'],
      model: `At the top the ${it.thing}’s weight still pulls it down, so it still accelerates downward at 9.8 m/s². Its velocity is zero for an instant only: it is changing from upward to downward, by 9.8 m/s every second, the whole time.`,
      notes: ['Zero velocity and zero acceleration are different things: acceleration is how fast the velocity changes.'] },
    d.chance(0.5)
      ? { kind: 'sketch', ask: `Sketch the ${it.thing}’s <b>height–time</b> graph from when it leaves the hand until it gets back to it.`, x: 'time (s)', y: 'height above the hand (m)', pens: ['Height'], marks: 3,
        model: [{ pen: 0, pts: modelCurve((t) => u * t - 0.5 * G * t * t, 0, back, back / 0.95, H / 0.9) }],
        points: ['A smooth curve shaped like an arch (an upside-down U), not straight lines or a sharp point', `Highest (${num(H, 2)} m) at ${num(top, 2)} s, where the curve is flat for an instant`, `Symmetrical: back at height 0 at ${num(back, 2)} s`] }
      : { kind: 'sketch', ask: `Taking upward as positive, sketch the ${it.thing}’s <b>velocity–time</b> graph from when it leaves the hand until it gets back to it.`, x: 'time (s)', y: 'velocity (m/s)', pens: ['Velocity'], y0: 0.5, marks: 3,
        model: [{ pen: 0, pts: modelLine([[0, u + 1.15 * u], [back, -u + 1.15 * u]], back / 0.95, 2.3 * u) }],
        points: ['One straight line sloping down (its gradient is −9.8 m/s² the whole time), not a V shape or a curve', `Starts at +${u} m/s and crosses the time axis (v = 0) at ${num(top, 2)} s, the highest point`, `Ends at −${u} m/s at ${num(back, 2)} s: the same speed as it was thrown at, moving down`],
        notes: ['The line doesn’t bounce off the axis at the top: the velocity keeps changing the same way, from up to down.'] },
  ];
  if (d.chance(0.5)) parts.push({ kind: 'written', ask: `How does the ${it.thing}’s speed when it gets back to the hand compare with the speed it was thrown at? Explain.`, lines: 3,
    points: [`The same speed, ${u} m/s, but downward`, 'On the way up it loses 9.8 m/s every second, and on the way down it gains 9.8 m/s every second, over the same time'],
    model: `It comes back at ${u} m/s, the same speed it was thrown at, but moving downward. Going up it loses 9.8 m/s every second for ${num(top, 2)} s; coming down it gains 9.8 m/s every second for the same time.` });
  return {
    title: 'Thrown straight up',
    intro: `<p>${it.who} throws a ${it.thing} straight up at ${u} m/s and lets it fall back to the same hand. Air resistance can be neglected, and g = 9.8 m/s².</p>`,
    parts,
  };
}

export const kinematicsExam = examBank('kinematics-exam', {
  title: 'Kinematics', minutes: 45, guide: GUIDE,
  slots: [
    [rampTrolley, lightGate, motionSensor, strobeDrop, cyclist],   // 1. a lab
    [journeyVT, xtTrip, atGraph, twoOnOne],                         // 2. a motion graph to read, describe and sketch
    [braking, freeFall, thrownUp],                                  // 3. a problem to solve and explain
  ],
});
