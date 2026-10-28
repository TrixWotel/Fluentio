// Tests like the ones in class for Motion in a Straight Line, each three questions: 1. a lab to analyse (process the
// data, choose what to plot so the model gives a straight line, draw the line of best fit and use its gradient or
// intercept), 2. a problem to solve in steps, and 3. motion to explain with forces and sketched graphs. Original
// questions with new numbers and contexts every time. kit/exam-kit.js says what a question and its parts are.
import { examBank, dataTable, lineGraph, noisy, bestFit, sig } from '../kit/exam-kit.js';
import { num, round, span } from '../kit/bank.js';

const g = 9.8;
const GUIDE = `<div class="cols">
  <ul>
    <li>Constant acceleration: <span class="f">v = u + at</span>, <span class="f">s = ut + ½at²</span>, <span class="f">v² = u² + 2as</span>, <span class="f">s = ½(u + v)t</span></li>
    <li>Falling freely: <span class="f">a = g = 9.8 m/s²</span> downward, whichever way the object is moving</li>
    <li>On a v–t graph: the gradient is the acceleration, and the area under the line is the displacement</li>
    <li>Weight: <span class="f">W = mg</span>. Net force: <span class="f">F = ma</span></li>
  </ul>
  <ul>
    <li>A straight line: <span class="f">y = mx + c</span>. Gradient <span class="f">m = Δy ÷ Δx</span>, read from two points far apart on the line; the intercept <span class="f">c</span> is where it crosses the y-axis</li>
    <li>Area of a circle: <span class="f">A = πr²</span></li>
    <li>100 cm = 1 m · 1000 g = 1 kg · 1000 ms = 1 s · 3.6 km/h = 1 m/s</li>
  </ul>
</div>`;

// the course's practice topics, for parts that match one
const T = {
  graph: 'Distance and displacement from a v–t graph', down: 'Thrown down from a height', rest: 'Speeding up from rest',
  checkpoints: 'Between two checkpoints', caught: 'Thrown up and caught', sections: 'Equal times, three points',
  top: 'Up to the highest point', above: 'Thrown up from above the ground', stages: 'A trip in three stages',
  puzzle: 'Reading a four-part v–t graph', average: 'Using the average speed', bounce: 'Bouncing back up',
};

// ---------- sketches: the mark scheme's lines, from 0 to 1 across and up ----------
const clamp = (y) => Math.min(1, Math.max(0, y));
// f(x) at n + 1 points from x0 to x1
const curve = (f, n = 24, x0 = 0, x1 = 1) => Array.from({ length: n + 1 }, (_, i) => { const x = x0 + ((x1 - x0) * i) / n; return [round(x, 3), round(clamp(f(x)), 3)]; });
// about n points along straight lines between corners (each corner kept), so a model line draws smoothly
function along(corners, n = 20) {
  const len = corners.slice(1).map((p, i) => Math.hypot(p[0] - corners[i][0], p[1] - corners[i][1]));
  const total = len.reduce((a, b) => a + b, 0), out = [corners[0]];
  corners.slice(1).forEach((p, i) => {
    const q = corners[i], k = Math.max(1, Math.round((n * len[i]) / total));
    for (let j = 1; j <= k; j++) out.push([q[0] + ((p[0] - q[0]) * j) / k, q[1] + ((p[1] - q[1]) * j) / k]);
  });
  return out.map(([x, y]) => [round(x, 3), round(clamp(y), 3)]);
}

// ---------- the written parts every lab can have ----------
const ERROR_NOTE = '“Human error” or “measuring mistakes” on its own earns nothing: name something in the set-up itself, and say what it does to the readings.';
const VARIABLE_NOTE = 'The independent variable is what the experiment changes on purpose, not just whatever is on the graph’s x-axis.';
const errorPart = (points, model) => ({ kind: 'written', ask: 'Identify <b>one source of error in the set-up</b> of this experiment, and say how it affects the results.', lines: 4, marks: 2, points, model, notes: [ERROR_NOTE] });

// ---------- 1. labs: process the data, plot it straight, use the gradient or the intercept ----------
// a car braking to a stop from different speeds: d = v·t_r + v² ÷ 2a, so d ÷ v = t_r + v ÷ 2a, and d ÷ v against v is a
// straight line whose gradient gives the deceleration and whose intercept is the driver's reaction time
function stoppingDistance(d) {
  const tr = d.pick([0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9]), dec = d.pick([5.5, 6, 6.5, 7, 7.5, 8]);
  // from walking pace to motorway speed, so the reaction time (which matters most at low speeds) shows
  const k0 = d.pick([10, 15, 20]), dk = d.pick([15, 18, 20]), car = d.pick(['hatchback', 'family car', 'small electric car', 'estate car']);
  const kmh = Array.from({ length: 6 }, (_, i) => k0 + i * dk), v = kmh.map((k) => k / 3.6);
  const dm = v.map((s) => { const x = noisy(d, s * tr + (s * s) / (2 * dec), 0.02); return round(x, x < 10 ? 2 : 1); });
  const dText = dm.map((x) => x.toFixed(x < 10 ? 2 : 1));
  const vs = v.map((s) => round(s, 3)), dv = dm.map((x, i) => round(x / v[i], 3));
  const fit = bestFit(vs.map((s, i) => [s, dv[i]])), m = fit.slope, c = fit.intercept, A = 1 / (2 * m);
  // the gradient and intercept of d ÷ v against v, from a line drawn either way round
  const own = (line) => (line.y === 'dv' && line.x === 'v' ? { m: line.slope, c: line.intercept } : line.y === 'v' && line.x === 'dv' ? { m: 1 / line.slope, c: -line.intercept / line.slope } : null);
  const tR = '<i>t</i><sub>r</sub>';
  const parts = [
    { kind: 'table', ask: 'Process the data: convert each speed to m/s, and work out <i>d</i> ÷ <i>v</i> at each speed.',
      head: ['Speed (km/h)', '<i>d</i> (m)', '<i>v</i> (m/s)', '<i>d</i> ÷ <i>v</i> (s)'], rows: kmh.map((k, i) => [String(k), dText[i], null, null]),
      fill: { 2: { values: v.map((s) => round(s, 2)), tol: 0.01, unit: 'm/s' }, 3: { values: dv, tol: 0.02, unit: 's' } },
      working: `Divide each speed in km/h by 3.6: ${kmh[0]} km/h = ${num(v[0], 2)} m/s. Then divide each stopping distance by its speed: ${dText[0]} ÷ ${num(v[0], 2)} = ${num(dv[0], 3)} s, and so on.` },
    { kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find the reaction time and the deceleration, and draw the line of best fit.',
      quantities: {
        d: { label: '<i>d</i> (m)', values: dm }, v: { label: '<i>v</i> (m/s)', values: vs },
        dv: { label: '<i>d</i> ÷ <i>v</i> (s)', values: dv }, rv: { label: '√<i>v</i>', values: vs.map((s) => round(Math.sqrt(s), 4)) },
        iv: { label: '1 ÷ <i>v</i> (s/m)', values: vs.map((s) => round(1 / s, 4)) },
      },
      pairs: [['dv', 'v'], ['v', 'dv']],
      working: `Divide the model by <i>v</i>: <i>d</i> ÷ <i>v</i> = ${tR} + (1 ÷ 2<i>a</i>) × <i>v</i>. That has the form <i>y</i> = <i>c</i> + <i>mx</i> with <i>y</i> = <i>d</i> ÷ <i>v</i> and <i>x</i> = <i>v</i>, so <i>d</i> ÷ <i>v</i> against <i>v</i> is a straight line, with gradient 1 ÷ 2<i>a</i> and intercept ${tR}. <i>d</i> against <i>v</i> isn’t straight (the <i>v</i>² term bends it), and neither would <i>d</i> against <i>v</i>² be (the reaction distance <i>v</i>${tR} bends that): let the model decide what to plot, not how straight the points look.` },
    { kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: round(m, 5), unit: 's²/m', tol: 0.06, from: { part: 1, value: (line) => line.slope, tol: 0.03 },
      working: `Gradient = Δ<i>y</i> ÷ Δ<i>x</i> between two points far apart on the line: about <b>${sig(m, 3)} s²/m</b> for <i>d</i> ÷ <i>v</i> (s) against <i>v</i> (m/s).` },
    { kind: 'number', ask: `Use your line to find the driver’s <b>reaction time</b> ${tR}.`, value: round(c, 3), unit: 's', tol: { abs: 0.08 }, from: { part: 1, value: (line) => own(line)?.c ?? null, tol: 0.05 },
      working: `At <i>v</i> = 0 the braking term <i>v</i> ÷ 2<i>a</i> is zero, leaving <i>d</i> ÷ <i>v</i> = ${tR}: the reaction time is where the line crosses the <i>d</i> ÷ <i>v</i> axis, about <b>${num(c, 2)} s</b>.` },
    { kind: 'steps', ask: 'Use your gradient and the model to find the size of the car’s <b>deceleration</b> <i>a</i> while it brakes. Show your working.',
      steps: [{ label: '2<i>a</i>, from the gradient', value: round(1 / m, 3), unit: 'm/s²', tol: 0.08 }, { label: 'The deceleration <i>a</i>', value: round(A, 3), unit: 'm/s²', tol: 0.08 }],
      from: { part: 1, value: (line) => { const o = own(line); return o ? 1 / (2 * o.m) : null; }, tol: 0.04 },
      working: `The gradient is 1 ÷ 2<i>a</i> = ${sig(m, 3)} s²/m, so 2<i>a</i> = 1 ÷ ${sig(m, 3)} = ${num(1 / m, 2)} m/s², and <i>a</i> = <b>${num(A, 2)} m/s²</b>.` },
    { kind: 'written', ask: `In the model, ${tR} is a time and <i>a</i> is an acceleration. Use the model to <b>prove</b> that ${tR} is measured in s and <i>a</i> in m/s².`, lines: 4,
      points: ['Each term of the model is a distance in metres, like <i>d</i>', `<i>v</i> × ${tR} is in m and <i>v</i> is in m/s, so ${tR} is in m ÷ (m/s) = s`, '<i>v</i>² ÷ 2<i>a</i> is in m, so <i>a</i> is in (m/s)² ÷ m = (m²/s²) ÷ m = m/s²'],
      model: `Every term in the model has to be a distance in metres, like <i>d</i>. The first term is <i>v</i> × ${tR}: m/s × ${tR} = m only if ${tR} is in m ÷ (m/s) = s. The second is <i>v</i>² ÷ 2<i>a</i>, also in metres, so <i>a</i> must be in (m/s)² ÷ m = (m²/s²) ÷ m = m/s².`,
      notes: ['Work in SI units: m and m/s, not km/h.', 'Showing the units on both sides of the equation is the proof: saying “a is an acceleration” isn’t.'] },
  ];
  const extra = d.int(0, 2);
  if (extra === 0) {
    parts.push(errorPart(['Names a specific source in the set-up itself, such as: the speedometer only showing the speed to within a few km/h, or the speed not quite steady as the car reaches the marker; the brakes getting hot after many hard stops, so they grip less; the track damp or dusty in places; the driver knowing the light will flash, so reacting faster than on a real road', 'Says how it changes the results, for example: a speed that is really higher than the reading gives stopping distances that are too long for that speed, or brakes that grip less make the later stopping distances too long'],
      'The speed is read from the speedometer, which may show a speed a few km/h different from the real one, and the driver can’t hold it exactly steady. If the car is really going faster than the reading, it stops in a longer distance than that speed should give, so the points scatter and the gradient (and <i>a</i>) are off.'));
  } else if (extra === 1) {
    parts.push({ kind: 'written', ask: 'What does the <b>intercept</b> of your line on the <i>d</i> ÷ <i>v</i> axis represent? Explain using the model.', lines: 3, marks: 2,
      points: [`It is the driver’s reaction time ${tR}`, `From <i>d</i> ÷ <i>v</i> = ${tR} + <i>v</i> ÷ 2<i>a</i>: at <i>v</i> = 0 the braking term is zero, and only ${tR} is left`, 'It is the time the car keeps going at its full speed before the brakes come on'],
      model: `The intercept is the reaction time, ${tR}. Dividing the model by <i>v</i> gives <i>d</i> ÷ <i>v</i> = ${tR} + <i>v</i> ÷ 2<i>a</i>, and where the line meets the axis, <i>v</i> = 0, the braking part <i>v</i> ÷ 2<i>a</i> is zero, leaving ${tR}: the time between the light flashing and the brakes coming on, while the car is still going at full speed.` });
  } else {
    parts.push({ kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
      fields: [{ label: 'Independent variable', options: ['The car’s speed', 'The stopping distance', 'The driver’s reaction time', 'd ÷ v'], correct: 0 }, { label: 'Dependent variable', options: ['The car’s speed', 'The car’s deceleration', 'The stopping distance', 'The time for the light to flash'], correct: 2 }],
      working: 'The instructor sets the car’s <b>speed</b> on purpose (the independent variable) and measures the <b>stopping distance</b> that results (the dependent variable). <i>d</i> ÷ <i>v</i> is only what goes on the graph’s axis.' });
  }
  return {
    title: 'Stopping distances',
    intro: `<p>On a closed test track, a driving instructor investigates how the stopping distance of a ${car} depends on its speed. The driver holds a steady speed, read from the speedometer in km/h. As the car passes a marker, a light on the dashboard flashes and the driver brakes as hard as possible without skidding. The stopping distance <i>d</i> is measured from the marker to where the car stops. They repeat this at six speeds.</p><p>The supplied model is</p><p class="model"><span class="f">d = v t<sub>r</sub> + v² ÷ (2a)</span></p><p>where <i>v</i> is the speed in m/s, ${tR} is the driver’s reaction time (from the light flashing until the brakes come on) and <i>a</i> is the size of the car’s deceleration while it brakes. The instructor wants to use the results to find ${tR} and <i>a</i>.</p>`,
    figures: [dataTable(['Speed (km/h)', 'Stopping distance <i>d</i> (m)'], kmh.map((k, i) => [String(k), dText[i]]), 'Average of three runs at each speed')],
    parts,
  };
}

// a steel ball dropped from different heights and timed: h = ½gt², so h against t² is a straight line through the origin
// whose gradient is ½g
function droppedBall(d) {
  const hcm = d.pick([[20, 40, 60, 80, 100, 120], [15, 35, 55, 75, 95, 115], [10, 30, 50, 70, 90, 110], [10, 25, 45, 70, 100, 130], [5, 20, 40, 65, 95, 130]]);
  const tms = hcm.map((h) => round(noisy(d, Math.sqrt((2 * h) / 100 / 9.81) * 1000, 0.012), 0));
  const hm = hcm.map((h) => h / 100), ts = tms.map((x) => x / 1000), t2 = ts.map((x) => round(x * x, 5));
  const fit = bestFit(t2.map((x, i) => [x, hm[i]])), m = fit.slope, G = 2 * m;
  const Hp = d.pick([1.5, 1.8, 2, 2.4, 2.5]), vHit = Math.sqrt(2 * G * Hp);
  // g from a line drawn either way round
  const gOf = (line) => (line.y === 'h' && line.x === 't2' ? 2 * line.slope : line.y === 't2' && line.x === 'h' ? 2 / line.slope : null);
  const timer = d.pick(['an electronic timer', 'a data logger']), ball = d.pick(['steel ball bearing', 'small steel ball']);
  const parts = [
    { kind: 'table', ask: 'Process the data: write each height in metres, and work out <i>t</i>² in s² (convert each time to seconds first).',
      head: ['<i>h</i> (cm)', '<i>t</i> (ms)', '<i>h</i> (m)', '<i>t</i>² (s²)'], rows: hcm.map((h, i) => [String(h), String(tms[i]), null, null]),
      fill: { 2: { values: hm, tol: 0.005, unit: 'm' }, 3: { values: t2, tol: 0.02, unit: 's²' } },
      working: `Divide each height by 100 and each time by 1000: ${hcm[0]} cm = ${num(hm[0])} m and ${tms[0]} ms = ${num(ts[0], 3)} s. Then square the time: ${num(ts[0], 3)}² = ${sig(t2[0], 3)} s², and so on.` },
    { kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find <i>g</i>, and draw the line of best fit.',
      quantities: {
        h: { label: '<i>h</i> (m)', values: hm }, t: { label: '<i>t</i> (s)', values: ts }, t2: { label: '<i>t</i>² (s²)', values: t2 },
        rt: { label: '√<i>t</i>', values: ts.map((x) => round(Math.sqrt(x), 4)) }, it: { label: '1 ÷ <i>t</i> (1/s)', values: ts.map((x) => round(1 / x, 3)) },
      },
      pairs: [['h', 't2'], ['t2', 'h']],
      working: 'The model <i>h</i> = ½<i>g</i> × <i>t</i>² has the form <i>y</i> = <i>mx</i> with <i>y</i> = <i>h</i> and <i>x</i> = <i>t</i>²: a straight line through the origin whose gradient is ½<i>g</i>. (<i>h</i> against <i>t</i> curves upward: the ball falls further in each extra millisecond.)' },
    { kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: round(m, 4), unit: 'm/s²', tol: 0.06, from: { part: 1, value: (line) => line.slope, tol: 0.03 },
      working: `Gradient = Δ<i>y</i> ÷ Δ<i>x</i> between two points far apart on the line: about <b>${sig(m, 3)} m/s²</b> for <i>h</i> (m) against <i>t</i>² (s²).` },
    { kind: 'steps', ask: `Use your gradient and the model to find <i>g</i>. Then use your value of <i>g</i> to predict how fast the ball would be moving after falling ${num(Hp)} m from rest. Show your working.`,
      steps: [{ label: 'The acceleration of free fall <i>g</i>', value: round(G, 3), unit: 'm/s²', tol: 0.06 }, { label: `Speed after falling ${num(Hp)} m`, value: round(vHit, 3), unit: 'm/s', tol: 0.05 }],
      from: { part: 1, value: (line) => { const gg = gOf(line); return gg ? Math.sqrt(2 * gg * Hp) : null; }, tol: 0.03 }, topic: null,
      working: `The gradient is ½<i>g</i> = ${sig(m, 3)} m/s², so <i>g</i> = 2 × ${sig(m, 3)} = ${num(G, 2)} m/s². From rest, <i>v</i>² = 2<i>gh</i>: <i>v</i> = √(2 × ${num(G, 2)} × ${num(Hp)}) = <b>${num(vHit, 2)} m/s</b>.` },
    { kind: 'written', ask: 'Show that the gradient of a graph of <i>h</i> against <i>t</i>² has the <b>units of an acceleration</b>, and use the model to explain why it equals ½<i>g</i>.', lines: 4,
      points: ['The gradient is Δ<i>h</i> ÷ Δ(<i>t</i>²), in m ÷ s² = m/s², the units of an acceleration', '<i>h</i> = ½<i>g</i> × <i>t</i>² has the form <i>y</i> = <i>mx</i>, with <i>h</i> on the y-axis and <i>t</i>² on the x-axis', 'so the gradient is the constant ½<i>g</i>, and <i>g</i> = 2 × the gradient'],
      model: 'The gradient is a change in height divided by a change in <i>t</i>²: metres ÷ seconds² = m/s², the units of an acceleration. Comparing <i>h</i> = ½<i>g</i> × <i>t</i>² with <i>y</i> = <i>mx</i>, with <i>h</i> as <i>y</i> and <i>t</i>² as <i>x</i>, the gradient <i>m</i> is ½<i>g</i>, which is the same for every drop. So <i>g</i> is twice the gradient.',
      notes: ['Use SI units: heights in m and times in s, not cm and ms, or the gradient won’t be in m/s².'] },
  ];
  const extra = d.int(0, 2);
  if (extra === 0) {
    parts.push(errorPart(['Names a specific source in the set-up itself, such as: the electromagnet holding the ball for a moment after it is switched off, so the timer starts before the ball falls; the trapdoor needing a moment, or a firm hit, to open; the metre rule read at an angle (parallax) or not held vertical; the height measured to the wrong point of the ball', 'Says how it changes the results, for example: times that are too long make <i>t</i>² too big, so the gradient and <i>g</i> come out too small'],
      'The electromagnet can hold the ball for a moment after the current is switched off, but the timer starts straight away. Each time is then a little too long, so every <i>t</i>² is too big, the gradient is too small and the value of <i>g</i> comes out too small.'));
  } else if (extra === 1) {
    parts.push({ kind: 'written', ask: 'Explain why the line of best fit should pass through the <b>origin</b>, and what it would show if it crossed the <i>h</i>-axis above zero.', lines: 4, marks: 2,
      points: ['The model <i>h</i> = ½<i>g</i> × <i>t</i>² has no added constant: when <i>t</i> = 0, <i>h</i> = 0 (a ball dropped from no height takes no time to land)', 'An intercept above zero means every height was measured too long by the same amount', 'for example to the top of the ball instead of its bottom: a systematic error in the set-up'],
      model: 'The model has no added constant, so a ball dropped from a height of zero takes no time to land: the line goes through (0, 0). If it crossed the <i>h</i>-axis above zero, every height would be too long by that amount, as if they had all been measured to the top of the ball instead of the bottom, a systematic error that shifts every point by the same amount.' });
  } else {
    parts.push({ kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
      fields: [{ label: 'Independent variable', options: ['The height the ball is dropped from', 'The time it takes to fall', 'The mass of the ball', 't²'], correct: 0 }, { label: 'Dependent variable', options: ['The height the ball is dropped from', 'The acceleration of free fall', 'The time it takes to fall', 'The size of the ball'], correct: 2 }],
      working: 'The student chooses each <b>drop height</b> on purpose (the independent variable) and measures the <b>time the ball takes to fall</b> (the dependent variable). <i>t</i>² is only what goes on the graph’s axis, and <i>g</i> is what the experiment finds.' });
  }
  return {
    title: 'Timing a falling ball',
    intro: `<p>A student uses an electromagnet to hold a ${ball} above a trapdoor switch. Switching off the electromagnet releases the ball and starts ${timer}; the ball hitting the trapdoor stops it. The student measures the drop height <i>h</i> from the bottom of the ball to the trapdoor with a metre rule, and times the fall <i>t</i> from six different heights.</p><p>For a ball dropped from rest, with air resistance neglected, the supplied model is</p><p class="model"><span class="f">h = ½ g t²</span></p><p>where <i>g</i> is the acceleration of free fall. The student wants to use the results to measure <i>g</i>.</p>`,
    figures: [dataTable(['Height <i>h</i> (cm)', 'Time to fall <i>t</i> (ms)'], hcm.map((h, i) => [String(h), String(tms[i])]), 'Average of three drops from each height')],
    parts,
  };
}

// stacks of paper cupcake cases dropped open side up: each stack soon falls at a steady terminal speed with
// v² = 2mg ÷ (ρAC), so v² against m is a straight line through the origin whose gradient gives the air's density ρ or
// the drag coefficient C
function cupcakeCases(d) {
  const m1 = d.pick([0.38, 0.42, 0.45, 0.5, 0.55]), Dcm = d.pick([6.5, 7, 7.5, 8]), C0 = d.pick([1.1, 1.2, 1.3, 1.4]), rho0 = 1.2;
  const L = d.pick([1, 1.2, 1.5]), fps = d.pick([120, 240]), findRho = d.chance(0.5);
  const A = Math.PI * (Dcm / 200) ** 2, N = [1, 2, 3, 4, 5, 6];
  const grams = N.map((n) => round(noisy(d, n * m1, 0.01), 2)), kg = grams.map((x) => round(x / 1000, 5));
  const times = kg.map((x) => round(noisy(d, L / Math.sqrt((2 * x * g) / (rho0 * A * C0)), 0.015), 3));
  const v = times.map((t) => L / t), vs = v.map((x) => round(x, 3)), v2 = v.map((x) => round(x * x, 3));
  const fit = bestFit(kg.map((x, i) => [x, v2[i]])), k = fit.slope;
  // the unknown, from the gradient of v² against m
  const unknown = (grad) => (findRho ? (2 * g) / (grad * A * C0) : (2 * g) / (grad * rho0 * A));
  const gradOf = (line) => (line.y === 'v2' && line.x === 'm' ? line.slope : line.y === 'm' && line.x === 'v2' ? 1 / line.slope : null);
  const U = unknown(k), uName = findRho ? 'the density of the air, ρ' : 'the drag coefficient, <i>C</i>';
  const parts = [
    { kind: 'table', ask: 'Process the data: write each mass in kg, and work out each stack’s terminal speed <i>v</i> and <i>v</i>².',
      head: ['Cases', 'Mass (g)', `Time for the last ${num(L)} m (s)`, '<i>m</i> (kg)', '<i>v</i> (m/s)', '<i>v</i>² (m²/s²)'],
      rows: N.map((n, i) => [String(n), grams[i].toFixed(2), times[i].toFixed(3), null, null, null]),
      fill: { 3: { values: kg, tol: 0.005, unit: 'kg' }, 4: { values: vs, tol: 0.015, unit: 'm/s' }, 5: { values: v2, tol: 0.03, unit: 'm²/s²' } },
      working: `Divide each mass by 1000: ${grams[0].toFixed(2)} g = ${sig(kg[0], 3)} kg. The stack is at its terminal speed over the last ${num(L)} m, so <i>v</i> = distance ÷ time = ${num(L)} ÷ ${times[0].toFixed(3)} = ${num(vs[0], 3)} m/s, and <i>v</i>² = ${num(v2[0], 3)} m²/s², and so on.` },
    { kind: 'plot', ask: `Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find ${uName}, and draw the line of best fit.`,
      quantities: {
        m: { label: '<i>m</i> (kg)', values: kg }, v: { label: '<i>v</i> (m/s)', values: vs }, v2: { label: '<i>v</i>² (m²/s²)', values: v2 },
        rv: { label: '√<i>v</i>', values: v.map((x) => round(Math.sqrt(x), 4)) }, iv: { label: '1 ÷ <i>v</i> (s/m)', values: v.map((x) => round(1 / x, 4)) },
      },
      pairs: [['v2', 'm'], ['m', 'v2']],
      working: 'The model <i>v</i>² = (2<i>g</i> ÷ ρ<i>AC</i>) × <i>m</i> has the form <i>y</i> = <i>mx</i> with <i>y</i> = <i>v</i>² and <i>x</i> = <i>m</i>: <i>g</i>, ρ, <i>A</i> and <i>C</i> are the same for every stack, so it is a straight line through the origin with gradient 2<i>g</i> ÷ ρ<i>AC</i>. (<i>v</i> against <i>m</i> curves over: doubling the mass makes <i>v</i> only √2 times bigger.)' },
    { kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: round(k, 2), unit: 'm²/(kg·s²)', tol: 0.06, from: { part: 1, value: (line) => line.slope, tol: 0.03 },
      working: `Gradient = Δ<i>y</i> ÷ Δ<i>x</i> between two points far apart on the line: about <b>${sig(k, 3)} m²/(kg·s²)</b> for <i>v</i>² (m²/s²) against <i>m</i> (kg). (With the mass in grams instead, it would be 1000 times smaller.)` },
    { kind: 'steps', ask: `Each case is ${num(Dcm)} cm across at its open top. ${findRho ? `Taking <i>C</i> = ${num(C0)}, use` : 'Taking the density of the air as ρ = 1.2 kg/m³, use'} your gradient and the model to find ${uName}. Show your working.`,
      steps: [{ label: 'Cross-sectional area <i>A</i> of a case', value: Number(A.toPrecision(4)), unit: 'm²', tol: 0.02 }, { label: findRho ? 'The density of the air ρ' : 'The drag coefficient <i>C</i>', value: round(U, 3), unit: findRho ? 'kg/m³' : '', tol: 0.08 }],
      from: { part: 1, value: (line) => { const gr = gradOf(line); return gr ? unknown(gr) : null; }, tol: 0.03 },
      working: `<i>A</i> = π<i>r</i>² with <i>r</i> = ${num(Dcm / 2, 2)} cm = ${num(Dcm / 200, 4)} m: <i>A</i> = π × ${num(Dcm / 200, 4)}² = ${sig(A, 3)} m². The gradient is 2<i>g</i> ÷ ρ<i>AC</i> = ${sig(k, 3)}, so ${findRho ? `ρ = 2<i>g</i> ÷ (gradient × <i>A</i> × <i>C</i>) = 19.6 ÷ (${sig(k, 3)} × ${sig(A, 3)} × ${num(C0)}) = <b>${num(U, 2)} kg/m³</b>` : `<i>C</i> = 2<i>g</i> ÷ (gradient × ρ × <i>A</i>) = 19.6 ÷ (${sig(k, 3)} × 1.2 × ${sig(A, 3)}) = <b>${num(U, 2)}</b>`}.` },
    findRho
      ? { kind: 'written', ask: 'In the model, ρ is the density of the air. Rearrange the model for ρ, and use the units of the other quantities to <b>prove</b> that ρ is measured in kg/m³.', lines: 5,
        points: ['Rearranged: ρ = 2<i>mg</i> ÷ (<i>v</i>²<i>AC</i>)', 'Units: kg × m/s² on top; (m²/s²) × m² on the bottom, with <i>C</i> a number with no units', '(kg·m/s²) ÷ (m⁴/s²) = kg/m³, the units of a density'],
        model: 'Rearranging, ρ = 2<i>mg</i> ÷ (<i>v</i>²<i>AC</i>). On top, kg × m/s² = kg·m/s². On the bottom, <i>v</i>² is m²/s², <i>A</i> is m² and <i>C</i> has no units: m⁴/s². Dividing, (kg·m/s²) ÷ (m⁴/s²) = kg/m³, the units of a density.',
        notes: ['Use SI base units: the mass in kg, not g.', 'The 2 and <i>C</i> are numbers: they have no units.'] }
      : { kind: 'written', ask: 'The drag coefficient <i>C</i> is a number with <b>no units</b>. Rearrange the model for <i>C</i>, and use the units of the other quantities to <b>prove</b> this.', lines: 5,
        points: ['Rearranged: <i>C</i> = 2<i>mg</i> ÷ (ρ<i>Av</i>²)', 'Units: kg × m/s² on top; (kg/m³) × m² × (m²/s²) on the bottom', 'The bottom is also kg·m/s², so the units cancel: <i>C</i> is a pure number'],
        model: 'Rearranging, <i>C</i> = 2<i>mg</i> ÷ (ρ<i>Av</i>²). On top, kg × m/s² = kg·m/s². On the bottom, kg/m³ × m² × m²/s² = kg·m/s² as well. The units cancel, so <i>C</i> has no units.',
        notes: ['Use SI base units: the mass in kg, not g.'] },
  ];
  const extra = d.int(0, 2);
  if (extra === 0) {
    parts.push(errorPart(['Names a specific source in the set-up itself, such as: a stack not yet at its terminal speed when the timed part of the fall starts (more likely for the heavier stacks); the cases tilting, swaying or spinning as they fall; draughts in the stairwell; the ruler on the video read at an angle (parallax), or the frame rate limiting the timing', 'Says how it changes the results, for example: a stack still speeding up has an average speed below its terminal speed, so its <i>v</i>² is too small and the gradient comes out too small'],
      'The heavier stacks take longer to reach their terminal speed, so they may still be speeding up at the start of the timed part. Their average speed over it is then less than their terminal speed, so their <i>v</i>² is too small, the line is too shallow, and the gradient comes out too small.'));
  } else if (extra === 1) {
    parts.push({ kind: 'written', ask: 'Explain why the line of best fit should pass through the <b>origin</b>.', lines: 3, marks: 2,
      points: ['The model <i>v</i>² = (2<i>g</i> ÷ ρ<i>AC</i>) × <i>m</i> has the form <i>y</i> = <i>mx</i>, with no added constant', 'A case with no mass has no weight, so no drag is needed to balance it: its terminal speed would be zero', 'A real line that misses the origin shows a systematic error, such as every time being a little too long'],
      model: 'The model has the form <i>y</i> = <i>mx</i> with no added constant, so <i>v</i>² = 0 when <i>m</i> = 0. That makes sense: with no weight there is nothing for the drag to balance, so the terminal speed would be zero.' });
  } else {
    parts.push({ kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
      fields: [{ label: 'Independent variable', options: ['The mass of the stack', 'The terminal speed', 'The size of the cases', 'v²'], correct: 0 }, { label: 'Dependent variable', options: ['The mass of the stack', 'The height it is dropped from', 'The terminal speed', 'The density of the air'], correct: 2 }],
      working: 'The student changes the <b>mass</b> on purpose, by stacking more cases (the independent variable), and measures each stack’s <b>terminal speed</b> (the dependent variable). The size and shape of the cases stay the same, and <i>v</i>² is only what goes on the graph’s axis.' });
  }
  return {
    title: 'Falling cupcake cases',
    intro: `<p>A student drops stacks of 1 to 6 paper cupcake cases, nested inside each other and open side up, down a stairwell. Nested cases keep the same shape and size, so stacking them changes only the mass. Each stack is weighed, then dropped from about 4 m. It soon falls at a steady terminal speed, and a phone filming at ${fps} frames per second next to a metre rule gives the time it takes to fall the last ${num(L)} m.</p><p>At terminal speed, the supplied model is</p><p class="model"><span class="f">v² = 2mg ÷ (ρAC)</span></p><p>where <i>v</i> is the terminal speed, <i>m</i> the mass of the stack, <i>g</i> = 9.8 m/s², ρ the density of the air, <i>A</i> the cross-sectional area of a case and <i>C</i> its drag coefficient (a number with no units). ${findRho ? `The cases have <i>C</i> = ${num(C0)}. The student wants to use the results to find the density of the air.` : 'The air’s density is 1.2 kg/m³. The student wants to use the results to find the cases’ drag coefficient.'}</p>`,
    figures: [dataTable(['Cases', 'Mass of the stack (g)', `Time for the last ${num(L)} m (s)`], N.map((n, i) => [String(n), grams[i].toFixed(2), times[i].toFixed(3)]), 'Average of three drops of each stack')],
    parts,
  };
}

// a ball rolled down a ramp from rest, released at different distances s from a light gate: v² = 2as, so v² against s
// is a straight line through the origin with gradient 2a; a = 5g sin θ ÷ 7 for a rolling ball then gives the ramp's slope
function rollingBall(d) {
  const theta = d.pick([3, 3.5, 4, 4.5, 5, 6]), a0 = (5 / 7) * g * Math.sin((theta * Math.PI) / 180), Lr = d.pick([1.2, 1.5, 1.8, 2]);
  const what = d.pick(['steel ball', 'glass marble', 'snooker ball']), Dcm = what === 'snooker ball' ? 5.25 : d.pick([1.6, 1.9, 2.2, 2.5]);
  const scm = d.pick([[10, 20, 30, 40, 50, 60], [15, 30, 45, 60, 75, 90], [10, 25, 40, 55, 70, 85], [5, 15, 30, 45, 60, 80], [10, 22, 34, 46, 58, 70]]);
  const s = scm.map((x) => x / 100), Db = Dcm / 100, ball = { name: what, D: Dcm };
  const dtb = s.map((x) => round(noisy(d, (Db / Math.sqrt(2 * a0 * x)) * 1000, 0.012), 1));   // ms
  const v = dtb.map((x) => Db / (x / 1000)), vs = v.map((x) => round(x, 3)), v2 = v.map((x) => round(x * x, 4));
  const fit = bestFit(s.map((x, i) => [x, v2[i]])), k = fit.slope, a = k / 2, H = (Lr * 7 * a) / (5 * g);
  const aOf = (line) => (line.y === 'v2' && line.x === 's' ? line.slope / 2 : line.y === 's' && line.x === 'v2' ? 1 / (2 * line.slope) : null);
  const parts = [
    { kind: 'table', ask: 'Process the data: work out the ball’s speed <i>v</i> as it passes the light gate, and <i>v</i>², for each release distance.',
      head: ['<i>s</i> (m)', 'Δ<i>t</i> (ms)', '<i>v</i> (m/s)', '<i>v</i>² (m²/s²)'], rows: s.map((x, i) => [x.toFixed(2), dtb[i].toFixed(1), null, null]),
      fill: { 2: { values: vs, tol: 0.015, unit: 'm/s' }, 3: { values: v2, tol: 0.03, unit: 'm²/s²' } },
      working: `The ball blocks the beam while it moves its own diameter, ${num(ball.D)} cm = ${num(Db, 3)} m, so <i>v</i> = ${num(Db, 3)} ÷ Δ<i>t</i> with Δ<i>t</i> in seconds: ${num(Db, 3)} ÷ ${num(dtb[0] / 1000, 4)} = ${num(vs[0], 3)} m/s, and <i>v</i>² = ${num(v2[0], 3)} m²/s², and so on.` },
    { kind: 'plot', ask: 'Using the model and your processed data, plot a graph that gives a <b>straight line</b> you can use to find the ball’s acceleration, and draw the line of best fit.',
      quantities: {
        s: { label: '<i>s</i> (m)', values: s }, v: { label: '<i>v</i> (m/s)', values: vs }, v2: { label: '<i>v</i>² (m²/s²)', values: v2 },
        dt: { label: 'Δ<i>t</i> (s)', values: dtb.map((x) => round(x / 1000, 5)) }, s2: { label: '<i>s</i>² (m²)', values: s.map((x) => round(x * x, 4)) },
      },
      pairs: [['v2', 's'], ['s', 'v2']],
      working: 'From rest, <i>v</i>² = 2<i>as</i>. It has the form <i>y</i> = <i>mx</i> with <i>y</i> = <i>v</i>² and <i>x</i> = <i>s</i>, and <i>a</i> is the same for every run (the same ramp), so <i>v</i>² against <i>s</i> is a straight line through the origin with gradient 2<i>a</i>. (<i>v</i> against <i>s</i> curves over.)' },
    { kind: 'number', ask: 'Find the <b>gradient</b> of your line of best fit. Use two points far apart on the line, not data points.', value: round(k, 4), unit: 'm/s²', tol: 0.06, from: { part: 1, value: (line) => line.slope, tol: 0.03 },
      working: `Gradient = Δ<i>y</i> ÷ Δ<i>x</i> between two points far apart on the line: about <b>${sig(k, 3)} m/s²</b> for <i>v</i>² (m²/s²) against <i>s</i> (m).` },
    { kind: 'steps', ask: `The ramp is a straight plank ${num(Lr)} m long, with one end raised on a stack of books. Use your gradient and the model to find the ball’s acceleration, and then <b>how high the raised end is</b>. Show your working.`,
      steps: [{ label: 'The ball’s acceleration <i>a</i>', value: round(a, 4), unit: 'm/s²', tol: 0.07 }, { label: 'Height of the raised end', value: round(H, 4), unit: 'm', tol: 0.08 }],
      from: { part: 1, value: (line) => { const aa = aOf(line); return aa ? (Lr * 7 * aa) / (5 * g) : null; }, tol: 0.03 },
      working: `The gradient is 2<i>a</i> = ${sig(k, 3)} m/s², so <i>a</i> = ${sig(a, 3)} m/s². Then sin θ = 7<i>a</i> ÷ 5<i>g</i> = 7 × ${sig(a, 3)} ÷ 49 = ${sig((7 * a) / (5 * g), 3)}, and the raised end is ${num(Lr)} × sin θ = ${num(Lr)} × ${sig((7 * a) / (5 * g), 3)} = <b>${num(H, 3)} m</b> above the floor (θ ≈ ${num((Math.asin((7 * a) / (5 * g)) * 180) / Math.PI, 1)}°).` },
    { kind: 'written', ask: 'Show that the gradient of a graph of <i>v</i>² against <i>s</i> has the <b>units of an acceleration</b>, and use the model to explain why it equals 2<i>a</i>.', lines: 4,
      points: ['The gradient is Δ(<i>v</i>²) ÷ Δ<i>s</i>, in (m²/s²) ÷ m = m/s², the units of an acceleration', '<i>v</i>² = 2<i>as</i> has the form <i>y</i> = <i>mx</i>, with <i>v</i>² on the y-axis and <i>s</i> on the x-axis', 'so the gradient is the constant 2<i>a</i>, and <i>a</i> = gradient ÷ 2'],
      model: 'The gradient is a change in <i>v</i>² divided by a change in distance: (m²/s²) ÷ m = m/s², the units of an acceleration. Comparing <i>v</i>² = 2<i>as</i> with <i>y</i> = <i>mx</i>, with <i>v</i>² as <i>y</i> and <i>s</i> as <i>x</i>, the gradient is 2<i>a</i>, the same for every run on the same ramp. So the acceleration is half the gradient.',
      notes: ['Use the diameter in m and the times in s, so <i>v</i> comes out in m/s.'] },
  ];
  const extra = d.int(0, 2);
  if (extra === 0) {
    parts.push(errorPart(['Names a specific source in the set-up itself, such as: the light beam crossing the ball below or above its centre, so it is blocked for less than the full diameter; the ball pushed instead of let go from rest, or let go from slightly the wrong mark; the ball rubbing on the ramp’s side or the plank sagging in the middle; the ball skidding instead of rolling', 'Says how it changes the results, for example: a beam that misses the centre is blocked for a shorter time, so <i>v</i> and <i>v</i>² come out too big, and so does the gradient'],
      'If the light beam crosses the ball a little below its centre, the ball blocks it for less than its full diameter, so Δ<i>t</i> is too short. Each <i>v</i> = diameter ÷ Δ<i>t</i> then comes out too big, so <i>v</i>², the gradient and the acceleration are all too big.'));
  } else if (extra === 1) {
    parts.push({ kind: 'written', ask: 'Explain why the line of best fit should pass through the <b>origin</b>, and what it would show if it crossed the <i>s</i>-axis at a positive value.', lines: 4, marks: 2,
      points: ['<i>v</i>² = 2<i>as</i> has no added constant: a ball let go right at the gate (<i>s</i> = 0) passes it at <i>v</i> = 0', 'A positive intercept on the <i>s</i>-axis means every distance was measured too long by the same amount', 'for example from the back of the ball to the gate instead of its centre: a systematic error'],
      model: 'The model <i>v</i>² = 2<i>as</i> has no added constant, so a ball released at the gate itself would pass it at zero speed: the line goes through (0, 0). Crossing the <i>s</i>-axis at a positive value would mean every release distance was too long by that same amount, for example measured from the back of the ball instead of its centre, a systematic error.' });
  } else {
    parts.push({ kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
      fields: [{ label: 'Independent variable', options: ['The release distance', 'The ball’s speed at the gate', 'The angle of the ramp', 'v²'], correct: 0 }, { label: 'Dependent variable', options: ['The release distance', 'The ball’s speed at the gate', 'The ball’s diameter', 'The length of the ramp'], correct: 1 }],
      working: 'The student chooses each <b>release distance</b> on purpose (the independent variable) and measures the ball’s <b>speed at the light gate</b> (the dependent variable). The ramp’s angle is kept the same, and <i>v</i>² is only what goes on the graph’s axis.' });
  }
  return {
    title: 'Rolling down a ramp',
    intro: `<p>A student lets a ${ball.name} roll from rest down a straight ramp, released at different distances <i>s</i> up the slope from a light gate. The gate measures the time Δ<i>t</i> for which the ball blocks its beam, while the ball moves its own diameter, ${num(ball.D)} cm. The angle of the ramp stays the same throughout.</p><p>For a ball rolling from rest with a steady acceleration <i>a</i>, the supplied model is</p><p class="model"><span class="f">v² = 2as</span></p><p>where <i>v</i> is its speed at the gate. For a solid ball that rolls without slipping, <i>a</i> = 5<i>g</i> sin θ ÷ 7, where θ is the angle of the ramp and <i>g</i> = 9.8 m/s². The student wants to use the results to find the ball’s acceleration and the slope of the ramp.</p>`,
    figures: [dataTable(['Release distance <i>s</i> (m)', 'Time in the beam Δ<i>t</i> (ms)'], s.map((x, i) => [x.toFixed(2), dtb[i].toFixed(1)]), 'Average of three runs from each distance')],
    parts,
  };
}

// ---------- 2. problems: a calculation in steps, with method marks, and a sketch or an explanation ----------
// a ball thrown straight up from a balcony that falls past it to the ground (up is positive)
function balconyThrow(d) {
  const u = d.pick([5, 6, 7, 8, 9, 10]), h = d.pick([4.5, 6, 7.5, 9, 10.5, 12]), ball = d.pick(['tennis ball', 'rubber ball', 'juggling ball']);
  const rise = (u * u) / (2 * g), top = h + rise, tTop = u / g, vg = Math.sqrt(u * u + 2 * g * h), tLand = (u + vg) / g;
  const parts = [
    { kind: 'steps', ask: 'How high above the ground does the ball get?', topic: T.above,
      steps: [{ label: 'Height it rises above the balcony', value: round(rise, 4), unit: 'm' }, { label: 'Greatest height above the ground', value: round(top, 4), unit: 'm' }],
      working: `At the highest point <i>v</i> = 0, so 0 = <i>u</i>² − 2<i>g</i> × rise: rise = ${u}² ÷ (2 × 9.8) = ${u * u} ÷ 19.6 = ${num(rise)} m. Above the ground: ${num(h)} + ${num(rise)} = <b>${num(top)} m</b>.` },
    { kind: 'number', ask: 'How long after it is thrown does the ball reach its highest point?', value: round(tTop, 4), unit: 's', topic: T.top,
      working: `At the highest point <i>v</i> = 0: 0 = <i>u</i> − <i>gt</i>, so <i>t</i> = ${u} ÷ 9.8 = <b>${num(tTop)} s</b>.` },
    { kind: 'steps', ask: 'How fast is the ball moving just before it hits the ground, and how long after it was thrown does it land?', topic: T.above,
      steps: [{ label: 'Speed just before it hits the ground', value: round(vg, 4), unit: 'm/s' }, { label: 'Time from the throw until it lands', value: round(tLand, 4), unit: 's', marks: 2 }],
      working: `Taking up as positive, the ground is ${num(h)} m below the hand, so the displacement is −${num(h)} m: <i>v</i>² = <i>u</i>² + 2 × 9.8 × ${num(h)} = ${u * u} + ${num(2 * g * h)} = ${num(vg * vg)}, so the speed is <b>${num(vg)} m/s</b> (downward). Then <i>v</i> = <i>u</i> − <i>gt</i> with <i>v</i> = −${num(vg)} m/s: <i>t</i> = (${u} + ${num(vg)}) ÷ 9.8 = <b>${num(tLand)} s</b>.` },
    { kind: 'choice', ask: 'As the ball falls back past the balcony, how fast is it moving?', topic: T.caught,
      choices: [`Slower than ${u} m/s`, `${u} m/s`, `Faster than ${u} m/s`], correct: 1,
      explain: { ask: 'Explain your answer.', lines: 3,
        points: ['On the way up it loses 9.8 m/s of speed every second, and on the way down it gains 9.8 m/s every second, for the same time (or: <i>v</i>² = <i>u</i>² − 2<i>gs</i> with <i>s</i> = 0)', `so back at the height it was thrown from, it has the same speed, ${u} m/s, now moving downward`],
        model: `The way down mirrors the way up. Rising, the ball loses 9.8 m/s every second until it stops at the top; falling, it gains 9.8 m/s every second, and it takes as long to come back down to the balcony as it took to rise. So it passes the balcony at ${u} m/s again, this time moving down. (With <i>s</i> = 0, <i>v</i>² = <i>u</i>² − 2<i>gs</i> gives <i>v</i>² = <i>u</i>².)`,
        notes: ['Without air resistance nothing takes speed away for good: it comes back to the same height at the same speed.'] } },
  ];
  if (d.chance(0.5)) {
    parts.push({ kind: 'written', ask: `A second ${ball} is thrown straight <b>down</b> from the same balcony at ${u} m/s. Explain why it hits the ground at the same speed as the first one, but sooner.`, lines: 5, topic: T.down,
      points: [`The first ball comes back past the balcony at ${u} m/s moving down, just like the second one starts`, `From there both fall the same ${num(h)} m from ${u} m/s with the same acceleration, so they land at the same speed (<i>v</i>² = <i>u</i>² + 2<i>gh</i>)`, `The second skips the trip up and back down to the balcony, which takes 2<i>u</i> ÷ <i>g</i> = ${num((2 * u) / g)} s, so it lands that much sooner`],
      model: `The first ball comes back down past the balcony at ${u} m/s, moving downward: exactly how the second ball starts. From there, both fall the same ${num(h)} m with the same acceleration, so both hit the ground at <i>v</i> = √(${u}² + 2 × 9.8 × ${num(h)}) = ${num(vg)} m/s. The second ball just skips the trip up and back, which takes 2 × ${u} ÷ 9.8 = ${num((2 * u) / g)} s, so it lands that much sooner.` });
  } else {
    parts.push({ kind: 'number', ask: 'For how long is the ball higher than the balcony?', value: round((2 * u) / g, 4), unit: 's', topic: T.caught,
      working: `It takes ${num(tTop)} s to rise to the top, and as long again to fall back to the balcony: 2 × ${num(tTop)} = <b>${num((2 * u) / g)} s</b>.` });
    parts.push({ kind: 'number', ask: 'What total <b>distance</b> does the ball travel from the throw until it lands?', value: round(2 * rise + h, 4), unit: 'm',
      working: `Up ${num(rise)} m, back down ${num(rise)} m to the balcony, then ${num(h)} m to the ground: ${num(rise)} + ${num(rise)} + ${num(h)} = <b>${num(2 * rise + h)} m</b>. (Its displacement is only ${num(h)} m downward.)` });
  }
  return {
    title: 'Thrown up from a balcony',
    intro: `<p>Standing on a balcony, a student throws a ${ball} straight up at ${u} m/s. It leaves her hand ${num(h)} m above the ground, rises, falls back past the balcony and lands on the ground below.</p><p>Ignore air resistance, and take <i>g</i> = 9.8 m/s².</p>`,
    parts,
  };
}

// a motorbike sets off from traffic lights as a truck passes, speeds up to the speed limit and catches the truck
function catchTheTruck(d) {
  const lim = d.pick([{ v: 20, kmh: 72 }, { v: 25, kmh: 90 }]), vmax = lim.v;
  const V = d.pick([12, 13, 14, 15, 16, 18].filter((x) => vmax > x + 3 && vmax < 2 * x - 1)), a = d.pick([2, 2.5, 3, 4]);
  const t1 = vmax / a, s1 = (vmax * vmax) / (2 * a), sT1 = V * t1, gap = sT1 - s1, tClose = gap / (vmax - V), tc = t1 + tClose, dist = V * tc;
  // the sketch: time across to a bit after it draws level, speed up to a bit over the limit
  const tEnd = tc * 1.15, vTop = vmax * 1.25;
  return {
    title: 'Catching the truck',
    intro: `<p>A motorbike is waiting at traffic lights on a straight road. As the lights turn green, a truck travelling at a steady ${V} m/s passes it. At that moment the motorbike sets off, speeding up steadily at ${num(a)} m/s² until it reaches the speed limit of ${vmax} m/s (${lim.kmh} km/h), which it then keeps to. The truck keeps going at ${V} m/s.</p>`,
    parts: [
      { kind: 'number', ask: 'How long does the motorbike take to reach the speed limit?', value: round(t1, 4), unit: 's', topic: T.rest,
        working: `From rest, <i>v</i> = <i>at</i>: <i>t</i> = ${vmax} ÷ ${num(a)} = <b>${num(t1)} s</b>.` },
      { kind: 'steps', ask: 'How far ahead of the motorbike is the truck at the moment the motorbike reaches the speed limit?', topic: T.average,
        steps: [{ label: 'Distance the motorbike has covered', value: round(s1, 4), unit: 'm' }, { label: 'Distance the truck has covered', value: round(sT1, 4), unit: 'm' }, { label: 'How far ahead the truck is', value: round(gap, 4), unit: 'm' }],
        working: `Motorbike: average speed ½(0 + ${vmax}) = ${num(vmax / 2)} m/s for ${num(t1)} s, so ${num(vmax / 2)} × ${num(t1)} = ${num(s1)} m. Truck: ${V} × ${num(t1)} = ${num(sT1)} m. The truck is <b>${num(gap)} m</b> ahead.` },
      { kind: 'steps', ask: 'How long after the lights turn green does the motorbike draw level with the truck?',
        steps: [{ label: 'Time to close the gap at the speed limit', value: round(tClose, 4), unit: 's' }, { label: 'Time from the green light until it draws level', value: round(tc, 4), unit: 's' }],
        working: `At the speed limit the motorbike gains ${vmax} − ${V} = ${vmax - V} m every second, so it closes the ${num(gap)} m gap in ${num(gap)} ÷ ${vmax - V} = ${num(tClose)} s. Altogether: ${num(t1)} + ${num(tClose)} = <b>${num(tc)} s</b> after the green light.` },
      { kind: 'number', ask: 'How far from the traffic lights does the motorbike draw level with the truck?', value: round(dist, 4), unit: 'm',
        working: `The truck has gone at ${V} m/s for ${num(tc)} s: ${V} × ${num(tc)} = <b>${num(dist)} m</b>. (Check: the motorbike, ${num(s1)} + ${vmax} × ${num(tClose)} = ${num(s1 + vmax * tClose)} m.)` },
      { kind: 'sketch', ask: 'On the same axes, sketch the velocity–time graphs of the motorbike and the truck, from the green light until the motorbike draws level. Label the axes.',
        x: 'time (s)', y: 'velocity (m/s)', pens: ['Motorbike', 'Truck'],
        model: [{ pen: 0, pts: along([[0, 0], [t1 / tEnd, vmax / vTop], [1, vmax / vTop]], 24) }, { pen: 1, pts: along([[0, V / vTop], [1, V / vTop]], 16) }],
        points: [`The truck: a horizontal line at ${V} m/s from the start`, `The motorbike: a straight line rising from the origin to ${vmax} m/s at ${num(t1)} s, then horizontal, above the truck’s line`, 'The motorbike’s line crosses the truck’s, and it draws level later, when the areas under the two lines are equal'] },
      { kind: 'written', ask: 'At one moment the motorbike and the truck have the same speed, but the motorbike has not caught up. Explain why.', lines: 4, marks: 2,
        points: [`Until that moment (${num(V / a)} s after the green light) the truck was going faster, so the gap between them kept growing`, 'With equal speeds the gap stops growing: it is the biggest it gets', 'The motorbike only gains once it is the faster one, so it draws level later'],
        model: `For the first ${num(V / a)} s the truck is faster than the motorbike, so the gap grows all that time. When their speeds are equal, the gap stops growing: it is as big as it gets. Only after that, with the motorbike faster, does the gap shrink, so it draws level later, at ${num(tc)} s, when it has covered the same distance (equal areas under the two v–t graphs).`,
        notes: ['Same speed doesn’t mean same place: compare the distances (the areas under the graphs), not the speeds.'] },
    ],
  };
}

// a lift's trip between floors, read from its v–t graph: slopes are accelerations, areas are distances
function liftRide(d) {
  const up = d.chance(0.6), V = d.pick([2, 2.5, 3, 4]);
  // (whole seconds, so every corner of the graph is on a grid line)
  const t1 = d.pick([2, 3, 4, 5].filter((x) => V / x <= 1.6 && V / x >= 0.5));
  const t3 = d.pick([2, 3, 4, 5].filter((x) => V / x <= 1.6 && V / x >= 0.5 && x !== t1)), t2 = d.pick([4, 5, 6, 8, 10]);
  const T2 = t1 + t2, Tend = T2 + t3, tri = 0.5 * V * (t1 + t3), flat = V * t2, total = tri + flat;
  const corners = [[0, 0], [t1, V], [T2, V], [Tend, 0]];
  const where = up ? 'from the ground floor up to a higher floor' : 'from a high floor down to the ground floor';
  // distance travelled at time t, for the sketch
  const sAt = (t) => (t <= t1 ? (0.5 * V * t * t) / t1 : t <= T2 ? 0.5 * V * t1 + V * (t - t1) : total - (0.5 * V * (Tend - t) ** 2) / t3);
  return {
    title: 'A lift’s journey',
    intro: `<p>A lift carries passengers ${where} of an office building. It starts from rest, speeds up steadily, travels at a steady speed, then slows down steadily and stops. The graph shows its velocity${up ? '' : ' (taking downward as positive)'} during the trip.</p>`,
    figures: [lineGraph({ title: 'The lift’s velocity', series: [{ name: 'velocity', points: corners }], x: span(corners.map((p) => p[0]), 8), y: span([0, V], 5), xLabel: 'time t (s)', yLabel: 'velocity v (m/s)' })],
    parts: [
      { kind: 'number', ask: 'What is the lift’s acceleration while it speeds up?', value: round(V / t1, 4), unit: 'm/s²', topic: T.puzzle,
        working: `The gradient of the first part: ${num(V)} ÷ ${num(t1)} = <b>${num(V / t1)} m/s²</b>.` },
      { kind: 'number', ask: 'What is the size of the lift’s deceleration as it slows down?', value: round(V / t3, 4), unit: 'm/s²', topic: T.puzzle,
        working: `The gradient of the last part: it loses ${num(V)} m/s in ${num(t3)} s, so ${num(V)} ÷ ${num(t3)} = <b>${num(V / t3)} m/s²</b>.` },
      { kind: 'steps', ask: 'Use the graph to find how far the lift travels.', topic: T.graph,
        steps: [{ label: 'Distance while speeding up and slowing down (the two triangles)', value: round(tri, 4), unit: 'm' }, { label: 'Distance at the steady speed (the rectangle)', value: round(flat, 4), unit: 'm' }, { label: 'Total distance travelled', value: round(total, 4), unit: 'm' }],
        working: `The distance is the area under the graph. Triangles: ½ × ${num(t1)} × ${num(V)} + ½ × ${num(t3)} × ${num(V)} = ${num(tri)} m. Rectangle: ${num(t2)} × ${num(V)} = ${num(flat)} m. Total: <b>${num(total)} m</b>.` },
      { kind: 'number', ask: 'What is the lift’s average speed over the whole trip?', value: round(total / Tend, 4), unit: 'm/s',
        working: `Average speed = total distance ÷ total time = ${num(total)} ÷ ${num(Tend)} = <b>${num(total / Tend)} m/s</b>.` },
      { kind: 'written', ask: 'Describe the lift’s <b>velocity</b> and <b>acceleration</b> in each of the three stages of the trip.', lines: 5,
        points: [`Speeding up: the velocity increases steadily from zero, with a constant acceleration (${num(V / t1)} m/s²) in the direction it moves`, `Steady: the velocity stays at ${num(V)} m/s and the acceleration is zero`, `Slowing down: the velocity decreases steadily to zero, with a constant acceleration (${num(V / t3)} m/s²) opposite to the way it moves`],
        model: `For the first ${num(t1)} s the velocity rises steadily from 0 to ${num(V)} m/s: a constant acceleration of ${num(V / t1)} m/s² in the direction of motion. For the next ${num(t2)} s the velocity is a steady ${num(V)} m/s, so the acceleration is zero. In the last ${num(t3)} s the velocity falls steadily to zero: a constant acceleration of ${num(V / t3)} m/s² opposite to the motion (a deceleration).`,
        notes: ['A flat part of a v–t graph means a steady speed, not that the lift has stopped.'] },
      { kind: 'sketch', ask: 'Sketch a graph of the <b>distance</b> the lift has travelled against time, for the whole trip. Label the axes.',
        x: 'time (s)', y: 'distance travelled (m)', pens: ['Distance'],
        model: [{ pen: 0, pts: curve((x) => (0.9 * sAt(x * Tend)) / total, 28) }],
        points: ['Starts at the origin, flat at first, and curves upward (getting steeper) while the lift speeds up', 'A straight sloping line while it moves at a steady speed', 'Curves over to become flat (horizontal) as it stops, at the total distance'],
        notes: ['The slope of a distance–time graph is the speed: steeper means faster, and flat means stopped.'] },
    ],
  };
}

// a 100 m sprint in two stages: speeding up steadily, then a steady top speed (the areas under the v–t graph add to 100 m)
function sprintRace(d) {
  const Tf = d.pick([10.5, 10.8, 11, 11.5, 12, 12.5, 13]), t1 = d.pick([2.5, 3, 3.5, 4, 4.5]), mark = d.pick([40, 50, 60, 80]);
  const v = 100 / (Tf - t1 / 2), acc = v / t1, s1 = (v * t1) / 2, tMark = t1 + (mark - s1) / v, who = d.pick(['sprinter', 'runner']);
  const vTop = v * 1.25;
  return {
    title: 'A 100 m race',
    intro: `<p>A model of a ${who}’s 100 m race: from rest at the start, she speeds up steadily for the first ${num(t1)} s, then runs at a steady top speed until she crosses the finish line ${num(Tf)} s after the start.</p>`,
    parts: [
      { kind: 'steps', ask: 'Find her top speed. Show your working.', topic: T.stages,
        steps: [{ label: 'Time she runs at her top speed', value: round(Tf - t1, 4), unit: 's' }, { label: 'Her top speed', value: round(v, 4), unit: 'm/s', marks: 2 }],
        working: `Call the top speed <i>v</i>. Speeding up from rest, her average speed is ½<i>v</i>, so she covers ½<i>v</i> × ${num(t1)} = ${num(t1 / 2)}<i>v</i>. Then <i>v</i> × (${num(Tf)} − ${num(t1)}) = ${num(Tf - t1)}<i>v</i>. Together: ${num(t1 / 2)}<i>v</i> + ${num(Tf - t1)}<i>v</i> = 100, so ${num(Tf - t1 / 2)}<i>v</i> = 100 and <i>v</i> = <b>${num(v)} m/s</b>.` },
      { kind: 'number', ask: `What is her acceleration over the first ${num(t1)} s?`, value: round(acc, 4), unit: 'm/s²', topic: T.rest,
        working: `<i>a</i> = <i>v</i> ÷ <i>t</i> = ${num(v)} ÷ ${num(t1)} = <b>${num(acc)} m/s²</b>.` },
      { kind: 'steps', ask: `How long after the start does she pass the ${mark} m mark?`, topic: T.average,
        steps: [{ label: 'Distance she covers while speeding up', value: round(s1, 4), unit: 'm' }, { label: `Time at the ${mark} m mark`, value: round(tMark, 4), unit: 's' }],
        working: `While speeding up: ½ × ${num(v)} × ${num(t1)} = ${num(s1)} m. The other ${num(mark - s1)} m at ${num(v)} m/s take ${num((mark - s1) / v)} s, so she passes ${mark} m at ${num(t1)} + ${num((mark - s1) / v)} = <b>${num(tMark)} s</b>.` },
      { kind: 'sketch', ask: 'Sketch the velocity–time graph of her race in this model. Label the axes, with her top speed and the times where the graph changes.',
        x: 'time (s)', y: 'velocity (m/s)', pens: ['The ' + who],
        model: [{ pen: 0, pts: along([[0, 0], [t1 / Tf, v / vTop], [1, v / vTop]], 24) }],
        points: [`A straight line rising from the origin to her top speed (${num(v)} m/s) at ${num(t1)} s`, `then a horizontal line at the top speed until the finish at ${num(Tf)} s`, 'The top speed and the two times are marked on the axes'] },
      { kind: 'written', ask: 'In a real race, a sprinter speeds up fastest at the start and then more and more gently until she reaches her top speed. Describe how the real velocity–time graph differs from this model, and explain why the area under it must still be 100 m.', lines: 4, marks: 2,
        points: ['The first part is a curve, steepest at the start and bending over to level off at the top speed (her acceleration decreases)', 'The area under a velocity–time graph is the distance covered, and the race is 100 m whatever the shape of the graph'],
        model: 'Instead of a straight line up to the top speed, the real graph starts steep and bends over, levelling off smoothly at the top speed, because her acceleration is biggest at the start and falls to zero. The area under any velocity–time graph is the distance covered, so for a 100 m race it is still 100 m.' },
    ],
  };
}

// ---------- 3. explaining motion: forces, speed and acceleration, and sketched graphs ----------
const FORCES_NOTE = 'Name the forces: the weight (down) and the drag, or air resistance (up). “Gravity balances out” isn’t specific enough.';

// an object falling with air resistance until it reaches terminal velocity (the drag grows as the square of the speed)
function fallingWithDrag(d) {
  const obj = d.pick([
    { name: 'shuttlecock', what: 'a badminton shuttlecock', from: 'a high balcony', vT: 6.8, heavy: 'two shuttlecocks, one pushed inside the other' },
    { name: 'table-tennis ball', what: 'a table-tennis ball', from: 'the top of a tall stairwell', vT: 9, heavy: 'a table-tennis ball of the same size with sand inside, twice as heavy' },
    { name: 'foam ball', what: 'a soft foam ball', from: 'the roof of the sports hall', vT: 9.5, heavy: 'a ball of the same size and shape with twice the mass' },
  ]);
  const two = d.chance(0.5), p = d.pick([0.5, 0.6, 0.7, 0.8]), vAt = p * obj.vT, frac = p * p, acc = g * (1 - frac);
  // the sketch: velocity against time up to well after terminal velocity (v = vT tanh(gt ÷ vT) for drag ∝ v²)
  const vMax = two ? Math.SQRT2 * obj.vT : obj.vT, tEnd = (3 * vMax) / g, vTop = 1.25 * vMax;
  const fall = (vT) => curve((x) => (vT / vTop) * Math.tanh((g * x * tEnd) / vT), 28);
  const sketchPoints = ['Starts at the origin, steepest at the start (a gradient of 9.8 m/s²)', 'The gradient gets less and less: the curve bends over', 'It levels off to a horizontal line at the terminal velocity'];
  if (two) sketchPoints.push('The heavier one starts with the same gradient but levels off at a higher terminal velocity: it needs more drag, so a higher speed, to balance its bigger weight');
  return {
    title: 'Falling to terminal velocity',
    intro: `<p>A student drops ${obj.what} from ${obj.from}. It falls straight down, speeding up at first, and soon falls at a steady speed: its terminal velocity. Air resistance (drag) acts on it all the way down, and it grows as the ${obj.name} goes faster.</p>`,
    parts: [
      { kind: 'written', ask: `Describe how the ${obj.name}’s <b>speed</b> and <b>acceleration</b> change from the moment it is let go until it reaches terminal velocity. Explain your reasoning, using the forces on it.`, lines: 7,
        points: ['When it is let go its speed is zero, so there is no drag: the only force is its weight, and it accelerates at 9.8 m/s²', 'As it speeds up, the drag on it increases', 'so the net force (weight − drag) gets smaller, and so does the acceleration: it still speeds up, but more and more slowly', 'When the drag equals its weight, the net force is zero: the acceleration is zero and it falls at a steady speed, its terminal velocity'],
        model: `At the moment it is let go, the ${obj.name} isn’t moving, so there is no drag: its weight is the only force, and it accelerates at <i>g</i> = 9.8 m/s². As it speeds up, the drag grows. The net force, its weight minus the drag, gets smaller, so its acceleration decreases: it keeps speeding up, but more and more slowly. Eventually the drag is as big as its weight. Then the net force is zero, so the acceleration is zero, and it falls at a constant speed, its terminal velocity.`,
        notes: [FORCES_NOTE, 'Until it reaches terminal velocity its speed keeps increasing: it’s the acceleration that decreases, not the speed.'] },
      { kind: 'sketch', ask: two ? `On the same axes, sketch velocity–time graphs for the ${obj.name} and for ${obj.heavy}, dropped from the same height, from release until both have been at terminal velocity for a while. Label the axes.` : `Sketch the velocity–time graph of the ${obj.name} from release until it has been at terminal velocity for a while. Label the axes.`,
        x: 'time (s)', y: 'velocity (m/s)', pens: two ? [`The ${obj.name}`, 'The heavier one'] : [`The ${obj.name}`],
        model: two ? [{ pen: 0, pts: fall(obj.vT) }, { pen: 1, pts: fall(Math.SQRT2 * obj.vT) }] : [{ pen: 0, pts: fall(obj.vT) }],
        points: sketchPoints, notes: ['The gradient of a velocity–time graph is the acceleration, so a curve that flattens out shows the acceleration falling to zero.'] },
      { kind: 'steps', ask: `The drag on the ${obj.name} is proportional to the square of its speed, and its terminal velocity is ${num(obj.vT)} m/s. Find its acceleration at the moment it is falling at ${num(vAt)} m/s.`,
        steps: [{ label: 'The drag, as a fraction of its weight', value: round(frac, 4), unit: '' }, { label: 'Its acceleration', value: round(acc, 4), unit: 'm/s²' }],
        working: `At terminal velocity the drag equals the weight. At ${num(vAt)} m/s, ${num(p)} of the terminal velocity, the drag is ${num(p)}² = ${num(frac)} of the weight. The net force is then (1 − ${num(frac)}) × <i>mg</i> = ${num(1 - frac)}<i>mg</i>, so <i>a</i> = <i>F</i> ÷ <i>m</i> = ${num(1 - frac)} × 9.8 = <b>${num(acc)} m/s²</b> downward.` },
      { kind: 'choice', ask: `Once the ${obj.name} is falling at its terminal velocity, which statement about the forces on it is true?`,
        choices: ['The drag is bigger than its weight', 'The drag is the same size as its weight', 'The drag is smaller than its weight', 'There are no forces on it'], correct: 1,
        explain: { ask: 'Explain your answer.', lines: 3,
          points: ['At terminal velocity its velocity is constant, so its acceleration is zero', 'so the net force on it is zero: the upward drag exactly balances the downward weight'],
          model: 'At terminal velocity it falls at a constant velocity, so it has no acceleration. By <i>F</i> = <i>ma</i>, the net force is zero: the upward drag is exactly as big as its downward weight.',
          notes: ['There are still two forces on it; they just balance. “No forces” is wrong.'] } },
    ],
  };
}

// a skydiver's fall from a hovering helicopter, read from her velocity–time graph: terminal velocity, then the parachute
function skydiver(d) {
  const v1 = d.pick([48, 50, 52, 54, 56]), v2 = d.pick([4.5, 5, 5.5, 6]), tOpen = d.pick([25, 30, 35]), tEnd = tOpen + d.pick([15, 20]);
  const M = d.pick([55, 60, 65, 70, 75, 80]), D = d.pick([1500, 1800, 2000, 2400]), aUp = (D - M * g) / M;
  // her velocity, stepped through in hundredths of a second: drag kv², with k growing as the canopy fills over 3 s
  const k1 = g / (v1 * v1), k2 = g / (v2 * v2), fill = 3, pts = [];
  let v = 0;
  for (let i = 0; i <= tEnd * 100; i++) {
    const t = i / 100;
    if (i % 50 === 0) pts.push([round(t, 1), i ? round(noisy(d, v, 0.01), 2) : 0]);
    const k = t < tOpen ? k1 : t < tOpen + fill ? k1 + (k2 - k1) * ((t - tOpen) / fill) ** 3 : k2;
    v += (g - k * v * v) / 100;
  }
  // what the graph shows: her steady speed before the parachute opens, and the area under it from 20 s until it opens
  const steady = pts.filter(([t]) => t >= 20 && t <= tOpen), vRead = steady.reduce((s, q) => s + q[1], 0) / steady.length;
  const area = steady.slice(1).reduce((s, q, i) => s + ((q[1] + steady[i][1]) / 2) * (q[0] - steady[i][0]), 0);
  return {
    title: 'A skydiver’s fall',
    intro: `<p>A skydiver of mass ${M} kg jumps from a helicopter hovering high above the ground, so she starts falling from rest. She falls with her arms and legs spread out, and ${tOpen} s after jumping she opens her parachute. A data logger she carries records her downward velocity; the graph shows the first ${tEnd} s.</p>`,
    figures: [lineGraph({ title: 'The skydiver’s downward velocity', series: [{ name: 'velocity', points: pts }], x: [0, tEnd, 5], y: [0, 60, 10], xLabel: 'time t (s)', yLabel: 'velocity v (m/s)' })],
    parts: [
      { kind: 'number', ask: 'Use the graph to estimate her terminal velocity before she opens the parachute.', value: round(vRead, 2), unit: 'm/s', tol: { abs: 2 },
        working: `The graph levels off at about <b>${num(vRead, 0)} m/s</b> before the parachute opens.` },
      { kind: 'number', ask: `Use the graph to estimate how far she falls between <i>t</i> = 20 s and <i>t</i> = ${tOpen} s.`, value: round(area, 1), unit: 'm', tol: 0.05, topic: T.graph,
        working: `The distance is the area under the graph. Her velocity is steady at about ${num(vRead, 0)} m/s, so the area is a rectangle: ${num(vRead, 0)} × (${tOpen} − 20) ≈ <b>${num(area, 0)} m</b>.` },
      { kind: 'written', ask: 'Explain, using the forces on her, why her velocity stops increasing before she opens the parachute.', lines: 5,
        points: ['At first she is slow, so the drag is small compared with her weight: she accelerates downward at nearly 9.8 m/s²', 'As her speed increases, the drag increases, so the net force and her acceleration decrease', 'When the drag equals her weight, the net force is zero: no acceleration, so she falls at a steady speed, her terminal velocity'],
        model: 'When she jumps she is slow, so the air resistance is small and her weight makes her accelerate downward at nearly 9.8 m/s². The faster she falls, the bigger the air resistance, so the net force (weight − drag) and her acceleration get smaller. Once the drag is as big as her weight, the net force is zero, so she stops accelerating and falls at a steady speed: her terminal velocity.',
        notes: [FORCES_NOTE] },
      { kind: 'written', ask: 'Describe and explain what happens to her speed and acceleration from the moment the parachute opens until she reaches her new steady speed.', lines: 6,
        points: ['Opening the parachute makes the drag much bigger (a much bigger area), bigger than her weight', 'so the net force is upward: her acceleration is upward, opposite to her motion, and she slows down', 'As she slows down the drag gets smaller, so the net force and her deceleration get smaller', `When the drag equals her weight again, she falls at a new, much lower steady speed (about ${num(v2)} m/s)`],
        model: `The open parachute has a much bigger area, so the drag suddenly becomes much bigger than her weight. The net force is now upward, so she decelerates: her acceleration points up while she is still moving down, and she slows down quickly. As she slows, the drag gets smaller, so the deceleration gets smaller too, until the drag equals her weight again. Then she falls at a new, much lower terminal velocity of about ${num(v2)} m/s.`,
        notes: ['Opening the parachute doesn’t make her go up: she keeps falling, more slowly.', 'Her weight doesn’t change: it’s the drag that changes.'] },
      { kind: 'choice', ask: 'Just after the parachute opens, which way is her acceleration?',
        choices: ['Downward, the way she is moving', 'Upward, opposite to the way she is moving', 'Zero, because she is still falling'], correct: 1,
        explain: { ask: 'Explain your answer.', lines: 3,
          points: ['The drag is now bigger than her weight, so the net force on her is upward', 'Her velocity is downward but getting smaller, so her acceleration points the other way: upward'],
          model: 'The drag is now bigger than her weight, so the net force on her, and so her acceleration, points upward. She is still moving down, but her downward velocity is getting smaller, which is what an upward acceleration does.' } },
      { kind: 'steps', ask: `Just after the parachute opens, the drag on her is ${num(D)} N. Find her acceleration at that moment.`,
        steps: [{ label: 'The net force on her (upward)', value: round(D - M * g, 3), unit: 'N' }, { label: 'Her acceleration (upward)', value: round(aUp, 4), unit: 'm/s²' }],
        working: `Her weight is <i>mg</i> = ${M} × 9.8 = ${num(M * g)} N. The net force is ${num(D)} − ${num(M * g)} = ${num(D - M * g)} N upward, so <i>a</i> = <i>F</i> ÷ <i>m</i> = ${num(D - M * g)} ÷ ${M} = <b>${num(aUp)} m/s²</b> upward.` },
    ],
  };
}

// a ball thrown straight up and caught at the same height: the velocity changes steadily, the acceleration never does
function thrownUpCaught(d) {
  const u = d.pick([6, 7, 8, 9, 10, 12]), who = d.pick(['A juggler throws a ball', 'A student throws a tennis ball', 'A cricket fielder throws a ball']);
  const tTop = u / g, H = (u * u) / (2 * g), drag = d.chance(0.5);
  const parts = [
    { kind: 'written', ask: 'Describe the ball’s <b>velocity</b> and <b>acceleration</b> on the way up, at the highest point, and on the way down.', lines: 6, topic: T.caught,
      points: ['On the way up: the velocity is upward and decreases steadily, by 9.8 m/s every second', 'At the highest point: the velocity is zero for an instant, but the acceleration is still 9.8 m/s² downward', 'On the way down: the velocity is downward and grows steadily, by 9.8 m/s every second', 'The acceleration is 9.8 m/s² downward the whole time, because its weight is the only force on it'],
      model: `Going up, the velocity points up and gets smaller by 9.8 m/s every second, from ${u} m/s to zero. At the highest point it is zero for an instant, but the ball is still accelerating at 9.8 m/s² downward: its velocity is still changing. Coming down, the velocity points down and grows by 9.8 m/s every second, back to ${u} m/s as it is caught. All the time, its weight is the only force on it, so the acceleration is 9.8 m/s² downward from start to finish.`,
      notes: ['At the top the velocity is zero, not the acceleration: gravity is still pulling, so the velocity is still changing.', 'Say which way the velocity points, not just whether it gets bigger or smaller.'] },
    { kind: 'sketch', ask: 'Sketch the ball’s velocity–time graph from when it leaves the hand until it is caught, taking upward as positive. Label the axes.',
      x: 'time (s)', y: 'velocity (m/s), up positive', y0: 0.5, pens: ['Velocity'],
      model: [{ pen: 0, pts: along([[0, 0.88], [1, 0.12]], 20) }],
      points: ['A single straight line sloping downward: the same gradient, −9.8 m/s², all the way', `It starts at +${u} m/s and crosses <i>v</i> = 0 halfway through, at the highest point (${num(tTop)} s)`, `It ends at −${u} m/s: the same speed, now downward`],
      notes: ['Don’t draw a V or bounce the line off the axis: the velocity goes through zero and becomes negative (downward).'] },
    { kind: 'sketch', ask: 'Sketch the ball’s acceleration–time graph for the same time, taking upward as positive. Label the axes.',
      x: 'time (s)', y: 'acceleration (m/s²), up positive', y0: 0.5, pens: ['Acceleration'],
      model: [{ pen: 0, pts: along([[0, 0.2], [1, 0.2]], 16) }],
      points: ['A horizontal line: the acceleration is the same the whole time, including at the highest point', 'below the time axis, at −9.8 m/s² (downward, with upward positive)'] },
    { kind: 'steps', ask: 'How long does the ball take to reach its highest point, and how high above the hand does it rise?', topic: T.top,
      steps: [{ label: 'Time to reach the highest point', value: round(tTop, 4), unit: 's' }, { label: 'Height it rises above the hand', value: round(H, 4), unit: 'm' }],
      working: `At the highest point <i>v</i> = 0: 0 = ${u} − 9.8<i>t</i>, so <i>t</i> = ${u} ÷ 9.8 = ${num(tTop)} s. Its average speed on the way up is ½ × ${u} = ${num(u / 2)} m/s, so it rises ${num(u / 2)} × ${num(tTop)} = <b>${num(H)} m</b> (or <i>h</i> = <i>u</i>² ÷ 2<i>g</i>).` },
  ];
  if (drag) {
    parts.push({ kind: 'choice', ask: 'With air resistance, how does the time the ball takes to fall back to the hand compare with the time it takes to rise?',
      choices: ['Shorter', 'The same', 'Longer'], correct: 2,
      explain: { ask: 'Explain your answer.', lines: 4, marks: 2,
        points: ['Going up, the drag and its weight both act downward, so it slows at more than 9.8 m/s²', 'Coming down, the drag acts upward, against its weight, so it speeds up at less than 9.8 m/s²', 'so falling back the same distance takes longer (and it comes back slower than it was thrown)'],
        model: 'On the way up, the drag points down, the same way as its weight, so the ball slows down at more than 9.8 m/s². On the way down, the drag points up, against its weight, so it speeds up at less than 9.8 m/s². Covering the same distance with a smaller acceleration takes longer, so the fall back to the hand takes longer than the rise.' } });
  }
  return {
    title: 'Thrown up and caught',
    intro: `<p>${who} straight up at ${u} m/s and catches it at the same height on its way down. ${drag ? 'Ignore air resistance except where a part asks about it' : 'Ignore air resistance'}, and take upward as positive.</p>`,
    parts,
  };
}

export const motionExam = examBank('motion-exam', {
  title: 'Motion in a Straight Line', minutes: 45, guide: GUIDE,
  slots: [
    [stoppingDistance, droppedBall, cupcakeCases, rollingBall],   // 1. a lab
    [balconyThrow, catchTheTruck, liftRide, sprintRace],   // 2. a problem
    [fallingWithDrag, skydiver, thrownUpCaught],   // 3. explaining motion
  ],
});
