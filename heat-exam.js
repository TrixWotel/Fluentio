// Tests like the ones in class for Science, each four questions built on a context, with lettered parts to answer:
// 1. a graph of heating or cooling to read and explain, 2. a data set about a system and its feedback loops, 3. an
// experiment to plan, sketch and explain, and 4. problem solving with Q = mcΔT, density and volume. Original questions in
// the style of a class test, with new numbers and contexts every time. kit/exam-kit.js says what a question and its
// parts are.
import { examBank, lineGraph, dataTable, sig } from '../kit/exam-kit.js';
import { num, round, graph } from '../kit/bank.js';

const GUIDE = `<div class="cols">
  <ul>
    <li>Heat absorbed or released: <span class="f">Q = mcΔT</span>, with <span class="f">ΔT = final − initial</span></li>
    <li>Density: <span class="f">ρ = m ÷ V</span></li>
    <li>A heater: <span class="f">Q = P × t</span> (watts × seconds = joules)</li>
  </ul>
  <ul>
    <li>Volume of a cube: <span class="f">V = a³</span>. Of a box: <span class="f">V = l × w × h</span>. Of a cylinder: <span class="f">V = πr²h</span></li>
    <li>1000 g = 1 kg · 1000 mL = 1 L · 1000 J = 1 kJ</li>
    <li>100 cm = 1 m · 1000 mm = 1 m · 1 m³ = 1,000,000 cm³</li>
  </ul>
</div>`;

// ---------- helpers ----------
// one field of a select part, its options in an order from the dice: right is the answer, wrong the others
function field(d, label, right, wrong, marks) {
  const options = d.shuffle([right, ...wrong]);
  return { label, options, correct: options.indexOf(right), ...(marks ? { marks } : {}) };
}
// the points of a sketch's model curve: f takes 0 to 1 across and gives 0 to 1 up
const curve = (f, n = 21) => Array.from({ length: n }, (_, i) => [round(i / (n - 1), 3), round(Math.min(1, Math.max(0, f(i / (n - 1)))), 3)]);
// a graph with a title, like lineGraph, for one line with lettered points on it: marks [[x, y, 'A', dx, dy]…], each
// letter dx, dy pixels from its point, so it can sit clear of the line (graph() would put it up and to the right)
function letteredGraph({ title, marks, w = 560, h = 320, ...g }) {
  const [x0, x1] = g.x, [y0, y1] = g.y, L = 56, R = 18, T = 16, B = 44;   // graph()'s margins
  const X = (v) => L + ((v - x0) / (x1 - x0)) * (w - L - R), Y = (v) => h - B - ((v - y0) / (y1 - y0)) * (h - T - B);
  const letters = marks.map(([a, b, text, dx, dy]) => `<text class="pl" x="${round(X(a) + dx, 2)}" y="${round(Y(b) + dy, 2)}" text-anchor="middle">${text}</text>`).join('');
  return `<div class="chart">${title ? `<p class="chart-title">${title}</p>` : ''}${graph({ ...g, w, h, points: marks.map(([a, b]) => [a, b, '']) }).replace('</svg>', letters + '</svg>')}</div>`;
}
// a whole number of minutes or a half, as people would read it off a graph
const halves = (t) => num(Math.round(t * 2) / 2, 1);
const minutes = (t) => `${halves(t)} minute${halves(t) === '1' ? '' : 's'}`;
const cap = (s) => s[0].toUpperCase() + s.slice(1);

// ---------- 1. graphs of heating and cooling ----------
const MATERIAL = ['Material 1', 'Material 2', 'Material 3'];
const VARIABLES = {
  independent: ['Time', 'The type of solid', 'The temperature', 'The power of the heaters'],
  dependent: ['Time', 'The type of solid', 'How fast each solid’s temperature rises', 'The mass of each solid'],
};

// three solids of equal mass warmed by identical heaters: each warms at a rate set by its specific heat, stays flat
// while it melts, then warms again as a liquid. The temperatures are read every half minute, so the lines wobble a little.
function heatingSolids(d) {
  const P = d.pick([15, 20, 25, 30]), m = d.pick([0.5, 0.6, 0.75, 0.8, 1]), T0 = d.int(15, 20), end = 20;
  // how fast each warms while solid (°C a minute), far enough apart that the slopes are easy to tell apart, in a random
  // order; their specific heats (J/(kg·°C)) follow from the heater and the mass
  let rate;
  do rate = d.shuffle([0.8, 1, 1.25, 1.6, 2, 2.5, 3.2]).slice(0, 3);
  while ([0, 1, 2].some((i) => [0, 1, 2].some((j) => i !== j && rate[i] < rate[j] && rate[j] / rate[i] < 1.5)));
  const slowest = rate.indexOf(Math.min(...rate));
  // one of the other two melts first, after 4 to 8 minutes, and stays flat for 3 to 6; the third melts later or not at all
  const first = d.pick([0, 1, 2].filter((i) => i !== slowest)), other = 3 - first - slowest;
  const t1 = d.int(8, 16) / 2, melt = [null, null, null];
  melt[first] = { at: t1, T: round(T0 + rate[first] * t1, 0), stay: d.int(6, 12) / 2 };
  const t2 = t1 + d.int(5, 12) / 2;
  if (d.chance(0.6) && t2 < end - 2) melt[other] = { at: t2, T: round(T0 + rate[other] * t2, 0), stay: d.int(4, 8) / 2 };
  // the temperature at time t (minutes), and what the probe read (a little off, every half minute)
  const temp = (i, t) => {
    const mt = melt[i];
    if (!mt) return T0 + rate[i] * t;
    const at = (mt.T - T0) / rate[i];
    if (t <= at) return T0 + rate[i] * t;
    if (t <= at + mt.stay) return mt.T;
    return mt.T + rate[i] * 0.8 * (t - at - mt.stay);
  };
  const series = [0, 1, 2].map((i) => ({ name: `${MATERIAL[i]} temperature (°C)`, points: Array.from({ length: end * 2 + 1 }, (_, k) => [k / 2, round(temp(i, k / 2) + (k ? (d.r() - 0.5) * 0.5 : 0), 1)]) }));
  const top = Math.max(...series.flatMap((s) => s.points.map((p) => p[1])));
  const yTop = Math.ceil((top + 2) / 5) * 5, yLow = Math.floor((T0 - 3) / 5) * 5;
  const meltT = melt[first].T;

  const parts = [
    { kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?', topic: null,
      fields: [{ label: 'Independent variable', options: VARIABLES.independent, correct: 1 }, { label: 'Dependent variable', options: VARIABLES.dependent, correct: 2 }],
      working: 'The researcher changes the <b>type of solid</b> on purpose (the independent variable) and measures <b>how fast each one’s temperature rises</b> (the dependent variable). Time and temperature are the graph’s axes, but the experiment is comparing the solids.' },
    { kind: 'choice', ask: 'By referring to the data, which material was the <b>first to start melting</b>?', choices: MATERIAL, correct: first,
      explain: { ask: 'Explain how the graph shows this.', lines: 3,
        points: [`${MATERIAL[first]}’s line is the first to go flat (at about ${meltT} °C, after about ${num(melt[first].at)} minutes)`, 'A flat line means the temperature stays the same while the heater still supplies energy: the solid is changing state'],
        model: `${MATERIAL[first]} is the first line to level off, at about ${meltT} °C after about ${num(melt[first].at)} minutes. Its temperature stays the same for a while even though its heater is still on, which is what happens while a solid melts.` } },
    { kind: 'written', ask: 'Explain the <b>atomic or molecular reason</b> why the graph of a material is flat while it is melting.', lines: 5,
      points: ['The heater still supplies energy at the same rate', 'That energy is used to break the bonds (overcome the forces) that hold the particles in their fixed positions', 'So the particles don’t speed up: their kinetic energy, and so the temperature, stays the same until all of it has melted'],
      model: 'While it melts, the heater keeps supplying energy, but the energy goes into breaking the bonds that hold the particles in the solid’s fixed structure instead of making the particles move faster. Temperature measures the particles’ average kinetic energy, so it stays the same until every particle is free to move as a liquid. Then the temperature rises again.',
      notes: ['“It is changing state” alone isn’t enough: say what the energy does to the particles.', 'The energy doesn’t disappear or stop: the heater is still on.'] },
    { kind: 'choice', ask: 'Based on the data provided, which material has the <b>highest specific heat capacity</b>?', choices: MATERIAL, correct: slowest, topic: 'Same heat, different materials',
      explain: { ask: 'Explain briefly.', lines: 3,
        points: [`${MATERIAL[slowest]} warms the slowest: its line is the shallowest while it is solid`, 'Each solid has the same mass and gets the same energy, so the one whose temperature rises least needs the most energy for each °C'],
        model: `${MATERIAL[slowest]}. The solids have equal masses and identical heaters, so each one gets the same energy every minute. ${MATERIAL[slowest]}’s temperature rises the least for that energy (the shallowest line), so it takes the most energy to warm each kilogram by 1 °C: the highest specific heat capacity.`,
        notes: ['The highest line or the first to melt isn’t the one with the highest specific heat: compare how steep the lines are.'] } },
  ];
  // and one more: reading the graph and the energy, the specific heat from the graph, or a source of error
  const extra = d.int(0, 2), tk = 10, k = d.pick([0, 1, 2].filter((i) => !melt[i] || melt[i].at > tk));
  if (extra === 0) {
    parts.push({ kind: 'number', ask: `Use the graph to estimate the <b>melting point</b> of ${MATERIAL[first]}.`, value: meltT, unit: '°C', tol: { abs: 1.5 },
      working: `${MATERIAL[first]}’s line is flat at about <b>${meltT} °C</b>: that’s where it melts.` });
    const mins = d.pick([5, 8, 10, 12, 15]);
    parts.push({ kind: 'steps', ask: `Each heater supplies ${P} W. How much energy does one heater supply in the first ${mins} minutes?`, topic: 'Electric heater',
      steps: [{ label: 'Time in seconds', value: mins * 60, unit: 's', tol: 0.001 }, { label: 'Energy supplied', value: P * mins * 60, unit: 'J', tol: 0.01 }],
      working: `t = ${mins} × 60 = ${mins * 60} s. Q = P × t = ${P} W × ${mins * 60} s = <b>${num(P * mins * 60)} J</b> (${num((P * mins * 60) / 1000)} kJ).` });
  } else if (extra === 1) {
    const rise = rate[k] * tk, Q = P * tk * 60, c = Q / (m * rise);
    parts.push({ kind: 'steps', ask: `Each sample has a mass of ${num(m)} kg, and each heater supplies ${P} W. Use the graph to estimate the <b>specific heat capacity</b> of ${MATERIAL[k]} while it is solid, using its first ${tk} minutes.`, topic: 'Finding the specific heat',
      steps: [{ label: `Temperature rise in the first ${tk} minutes`, value: round(rise, 1), unit: '°C', tol: { abs: 1.5 } }, { label: 'Energy supplied in that time', value: Q, unit: 'J', tol: 0.01 }, { label: 'Specific heat capacity', value: round(c, 0), unit: 'J/(kg·°C)', tol: 0.15 }],
      working: `From the graph, ${MATERIAL[k]} warms from ${T0} °C to about ${num(T0 + rise, 1)} °C in ${tk} minutes: ΔT ≈ ${num(rise, 1)} °C. The heater supplies Q = P × t = ${P} W × ${tk * 60} s = ${num(Q)} J. So c = Q ÷ (mΔT) = ${num(Q)} ÷ (${num(m)} × ${num(rise, 1)}) ≈ <b>${num(c, 0)} J/(kg·°C)</b>.` });
  } else {
    parts.push({ kind: 'written', ask: 'The data shows small ups and downs in the temperatures that may be caused by errors in the experiment. <b>Identify one possible source of error</b> in this experiment, and say how it affects the results.', lines: 4,
      points: ['Names a specific source in the set-up itself, such as heat escaping to the room, the probe not touching the middle of the solid, a solid not pressed evenly against its heater, or the solids not starting at the same temperature', 'Says how it changes the readings, such as lower or uneven temperatures than the heater’s energy should give'],
      model: 'The temperature probe might not touch the middle of each solid, so it reads the warmer outside near the heater, and the readings jump around as the heat spreads unevenly through the solid. Some heat also escapes to the room, so the temperatures rise less than the heater’s energy should make them.',
      notes: ['“Human error” or “the room” on its own earns nothing: it has to be something in the set-up itself, and say what it does to the readings.'] });
  }
  return {
    title: 'Looking at heating rates of materials',
    intro: `<p>A student researcher investigates the heating behavior of three different solid materials. Equal masses (${num(m)} kg) of each material are heated using identical heaters that supply energy at the same constant rate (${P} W). The temperatures of the materials are recorded every half minute throughout the experiment.</p><p>The results are shown in the graph below. Analyze the data and answer the questions that follow.</p>`,
    figures: [lineGraph({ title: 'Rate of heating of three different solids', series, x: [0, end, 2], y: [yLow, yTop, 5], xLabel: 'time (minutes)', yLabel: 'temperature (°C)' })],
    parts,
  };
}

// three substances melted in a hot-water bath, then left in a rack to cool: each cools fast while it is hot and more
// slowly as it nears room temperature (Newton’s law of cooling), stays flat while it freezes, then cools again as a solid.
// They freeze at different temperatures and cool at different rates, so the first to freeze isn’t always the one with the
// highest freezing point (in about 4 tests in 10 it isn’t, and a part asks about that).
const SUBSTANCE = ['Substance A', 'Substance B', 'Substance C'];
const coolingSets = new Map();
// every set of freezing points (°C) and cooling rates (a minute) that makes a readable graph: each starts to freeze
// between 1.5 and 16 minutes in, and the first does so at least 1.5 minutes before the next
function coolingSet(T0, room) {
  const key = `${T0}:${room}`;
  if (!coolingSets.has(key)) {
    const TF = [40, 46, 52, 58, 64, 70], K = [0.06, 0.08, 0.1, 0.12, 0.15], same = [], differ = [];
    for (const a of TF) for (const b of TF) for (const c of TF) for (const ka of K) for (const kb of K) for (const kc of K) {
      if (new Set([a, b, c]).size < 3 || new Set([ka, kb, kc]).size < 3) continue;
      const Tf = [a, b, c], k = [ka, kb, kc], at = Tf.map((T, i) => Math.log((T0 - room) / (T - room)) / k[i]);
      const order = [...at].sort((x, y) => x - y);
      if (at.some((t) => t < 1.5 || t > 16) || order[1] - order[0] < 1.5) continue;
      (at.indexOf(order[0]) === Tf.indexOf(Math.max(...Tf)) ? same : differ).push({ Tf, k, at });
    }
    coolingSets.set(key, { same, differ });
  }
  return coolingSets.get(key);
}
function coolingCurves(d) {
  const T0 = d.pick([85, 90]), room = d.int(19, 23), end = 20, S = SUBSTANCE;
  const sets = coolingSet(T0, room), { Tf, k, at } = d.pick(d.chance(0.4) ? sets.differ : sets.same);
  const stay = [0, 1, 2].map(() => d.int(8, 14) / 2);
  const first = at.indexOf(Math.min(...at)), hi = Tf.indexOf(Math.max(...Tf)), last = at.indexOf(Math.max(...at));
  // the temperature at time t (minutes): cooling as a liquid, flat while it freezes, then cooling as a solid
  const temp = (i, t) => {
    if (t <= at[i]) return room + (T0 - room) * Math.exp(-k[i] * t);
    if (t <= at[i] + stay[i]) return Tf[i];
    return room + (Tf[i] - room) * Math.exp(-1.2 * k[i] * (t - at[i] - stay[i]));
  };
  const series = [0, 1, 2].map((i) => ({ name: `${S[i]} temperature (°C)`, points: Array.from({ length: end * 2 + 1 }, (_, j) => [j / 2, round(temp(i, j / 2) + (j ? (d.r() - 0.5) * 0.5 : 0), 1)]) }));
  const low = Math.min(...series.flatMap((s) => s.points.map((p) => p[1])));
  const read = (i) => `about ${Tf[i]} °C, after about ${halves(at[i])} minutes`;

  const parts = [
    { kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
      fields: [field(d, 'Independent variable', 'The type of substance', ['Time', 'The temperature of the room', 'The temperature of each substance']),
        field(d, 'Dependent variable', 'The temperature of each substance as it cools', ['Time', 'The type of substance', 'The mass of each substance'])],
      working: 'The student chose which substances to compare: the <b>type of substance</b> is the independent variable. They measured <b>the temperature of each one as it cooled</b>: the dependent variable. Time is on the graph’s x-axis, but it only says when each reading was taken.' },
    { kind: 'choice', ask: 'By referring to the data, which substance was the <b>first to start freezing</b>?', choices: S, correct: first, working: `<b>${S[first]}</b>: its line is the first to go flat, at ${read(first)}.`,
      explain: { ask: 'Explain how the graph shows this.', lines: 3,
        points: [`${S[first]}’s line is the first to go flat (at ${read(first)})`, 'A flat line means the temperature stays the same although the substance is still losing heat to the room: it is changing state, from liquid to solid'],
        model: `${S[first]}’s line is the first to level off, at ${read(first)}. Its temperature stops falling for a while even though it is still losing heat to the room, which is what happens while a liquid freezes.`,
        notes: first === hi ? ['A line that is still falling is still liquid: the first to freeze is the first to go flat.'] : ['The line that goes flat at the highest temperature isn’t the first to freeze here: look for the first line to level off.'] } },
    { kind: 'number', ask: `Use the graph to estimate the <b>freezing point</b> of ${S[last]}.`, value: Tf[last], unit: '°C', tol: { abs: 1.5 },
      working: `${S[last]}’s line is flat at about <b>${Tf[last]} °C</b> while it freezes (from about ${halves(at[last])} minutes). A substance freezes and melts at the same temperature.` },
    { kind: 'written', ask: 'While a substance is freezing, its temperature stays the same even though it is still giving out heat to the room. Explain why, using ideas about <b>particles</b> and <b>energy</b>.', lines: 5,
      points: ['The substance is still losing energy to the cooler room the whole time it freezes', 'As it freezes, the attractions between the particles pull them into fixed positions (bonds form), and forming these bonds releases energy', 'That energy makes up for the energy lost to the room, so the particles’ average kinetic energy, and so the temperature, stays the same until all of it is solid'],
      model: 'The tube keeps losing energy to the cooler room. But as the liquid freezes, the forces of attraction pull its particles into the fixed positions of a solid, and forming those bonds releases energy. This released energy makes up for the energy lost to the room, so the particles’ average kinetic energy doesn’t fall and the temperature stays the same. Once all of it has frozen, no more energy is released, and the temperature falls again.',
      notes: ['“It is changing state” alone isn’t enough: say what happens to the particles and where the energy comes from.', 'The temperature doesn’t stay the same because the substance stops losing heat: heat leaves it the whole time.'] },
  ];
  // and more: why the first to freeze isn't the highest freezing point (when it isn't), why the lines flatten out, the
  // heat given out, or a source of error
  const more = [];
  if (first !== hi) more.push({ kind: 'choice', ask: 'Which substance has the <b>highest freezing point</b>?', choices: S, correct: hi, working: `<b>${S[hi]}</b>: its line levels off at the highest temperature, about ${Tf[hi]} °C.`,
    explain: { ask: 'It wasn’t the first to start freezing. Explain how the graph shows both.', lines: 3,
      points: [`${S[hi]}’s line levels off at the highest temperature: about ${Tf[hi]} °C`, `Its line is less steep at the start than ${S[first]}’s: it cools more slowly, so it took longer to cool down to its freezing point`],
      model: `${S[hi]}’s line goes flat at the highest temperature, about ${Tf[hi]} °C, so it has the highest freezing point. But it cools more slowly than ${S[first]} (its line is less steep at the start), so it took longer, about ${halves(at[hi])} minutes, to cool down to its freezing point.` } });
  const pool = [
    { kind: 'written', ask: 'Before they start to freeze, the lines get <b>less steep</b> as the liquids cool. Explain why.', lines: 3,
      points: ['The bigger the difference between a liquid’s temperature and the room’s, the faster it loses heat', 'As the liquid cools, that difference gets smaller, so it loses heat more slowly and its temperature falls by less each minute'],
      model: 'A hot liquid loses heat to the room faster the bigger the temperature difference between them. As it cools, it gets closer to room temperature, so the difference shrinks, it loses energy more slowly, and its temperature drops by less each minute.',
      notes: ['“It runs out of heat” isn’t the reason: it still has lots of energy, it just loses it more slowly.'] },
    { kind: 'written', ask: 'The lines show small ups and downs that may come from errors in the experiment. <b>Identify one possible source of error</b> in the set-up, and say how it affects the results.', lines: 4,
      points: ['Names a specific source in the set-up itself, such as a thermometer not in the middle of the substance or touching the glass, different amounts in the tubes, one tube nearer a window or a draft, or the tubes touching each other', 'Says how it changes the readings, such as one tube cooling faster than the others, or readings that jump up and down'],
      model: 'The thermometer in each tube might not be in the middle of the substance: if it touches the glass, it reads the cooler glass instead of the liquid, so the readings are too low and jump about. One tube could also be nearer a draft, so it cools faster than the others for a reason that has nothing to do with the substance.',
      notes: ['“Human error” or “the room” on its own earns nothing: it has to be something in the set-up itself, and say what it does to the readings.'] },
  ];
  const j = d.pick([0, 1, 2]), grams = d.pick([15, 20, 25, 30, 40]), c = d.pick([1800, 2000, 2200, 2400]), drop = T0 - Tf[j], Q = (grams / 1000) * c * drop;
  pool.push({ kind: 'steps', ask: `The tube of ${S[j]} held ${grams} g of it. As a liquid, ${S[j]} has a specific heat capacity of ${num(c)} J/(kg·°C). Use the graph to find how much heat it gave out as it cooled from ${T0} °C to its freezing point.`, topic: 'Heat released while cooling',
    steps: [{ label: 'Mass in kg', value: grams / 1000, unit: 'kg', tol: 0.001 }, { label: 'Temperature drop', value: drop, unit: '°C', tol: { abs: 1.5 } }, { label: 'Heat given out', value: round(Q, 1), unit: 'J', tol: 0.06 }],
    working: `m = ${grams} ÷ 1000 = ${num(grams / 1000, 3)} kg (in kg, because c is per kg: grams would make the answer 1000 times too big). ${S[j]} freezes at about ${Tf[j]} °C, so ΔT = ${T0} − ${Tf[j]} = ${drop} °C. Q = mcΔT = ${num(grams / 1000, 3)} × ${num(c)} × ${drop} = <b>${num(Q, 1)} J</b>.` });
  more.push(...d.shuffle(pool).slice(0, 2 - more.length));

  return {
    title: 'Cooling and freezing',
    intro: `<p>A student investigates how three substances, A, B and C, freeze. Equal masses of the three solids are melted in test tubes standing in a beaker of hot water, until all three are liquid at ${T0} °C. The student then moves the tubes to a rack in a room at ${room} °C, and records the temperature of each substance every half minute as it cools.</p><p>The results are shown in the graph below. Analyze the data and answer the questions that follow.</p>`,
    figures: [lineGraph({ title: 'Cooling curves of three substances', series, x: [0, end, 2], y: [Math.floor((low - 2) / 10) * 10, Math.ceil((T0 + 2) / 10) * 10, 5], xLabel: 'time (minutes)', yLabel: 'temperature (°C)' })],
    parts: [...parts, ...more],
  };
}

// crushed ice from a freezer warmed by an immersion heater until the water boils: it warms as ice, stays at 0 °C while it
// melts, warms as water (a little more slowly as it gets hotter and loses more heat to the room), then stays at 100 °C
// while it boils. Worked out a second at a time, with the heat that leaks in or out through the beaker’s sides.
const ICE = { c: 2090, water: 4180, melt: 334000 };
const STAGE = ['The ice warms up', 'The ice melts', 'The water warms up', 'The water boils', 'The water freezes'];
function iceToSteam(d) {
  const sizes = [];
  for (const m of [0.15, 0.2, 0.25, 0.3]) for (const P of [100, 120, 150, 180, 200, 240]) if (P / m >= 550 && P / m <= 850) sizes.push([m, P]);
  const [m, P] = d.pick(sizes), T0 = -d.int(15, 25), room = d.int(19, 23), share = d.pick([0.85, 0.9, 0.95]), leak = d.pick([0.4, 0.5, 0.6]);
  // the temperature every second, and the second each stage ends (ice at 0 °C, all melted, boiling)
  const temps = [T0], ends = [];
  let T = T0, melted = 0;
  for (let t = 1; ends.length < 3 && t < 7200; t++) {
    const into = share * P + leak * (room - T);
    if (ends.length === 0) { T = Math.min(0, T + into / (m * ICE.c)); if (T === 0) ends.push(t); }
    else if (ends.length === 1) { melted += into; if (melted >= ICE.melt * m) ends.push(t); }
    else { T = Math.min(100, T + into / (m * ICE.water)); if (T === 100) ends.push(t); }
    temps.push(T);
  }
  const step = ends[2] / 60 < 18 ? 2 : 5, end = Math.ceil((ends[2] / 60 + d.int(3, 5)) / step) * step, every = 0.5;
  while (temps.length <= end * 60) temps.push(100);
  const at = (min) => temps[Math.round(min * 60)];
  const points = Array.from({ length: end / every + 1 }, (_, j) => {
    const t = j * every, s = Math.round(t * 60), v = at(t);
    if (!j) return [0, T0];
    if (s >= ends[0] && s < ends[1]) return [t, round(0.05 + (d.r() - 0.5) * 0.4, 1)];
    if (s >= ends[2]) return [t, round(99.8 - d.r() * 0.3, 1)];
    return [t, round(v + (d.r() - 0.5) * 0.6, 1)];
  });
  const mins = ends.map((s) => s / 60), lasts = [mins[0], mins[1] - mins[0], mins[2] - mins[1]];
  const most = lasts.indexOf(Math.max(...lasts)), next = lasts.indexOf(Math.max(...lasts.filter((_, i) => i !== most))), mid = [mins[0] / 2, (mins[0] + mins[1]) / 2, (mins[1] + mins[2]) / 2, (mins[2] + end) / 2];
  // the letters: below and to the right of the rising stages, above the flat ones
  const labels = mid.map((t, i) => [round(t, 2), round(at(t), 1), 'ABCD'[i], i % 2 ? 0 : 13, i % 2 ? -11 : 15]);
  const options = d.shuffle(STAGE), grams = round(m * 1000, 0);
  // stage C's length as read off the graph, to the half minute at each end
  const Qw = m * ICE.water * 100, tC = (Math.round(mins[2] * 2) / 2 - Math.round(mins[1] * 2) / 2) * 60, E = P * tC, pct = (Qw / E) * 100;

  const parts = [
    { kind: 'select', ask: 'The graph is marked with four stages, A to D. <b>What is happening</b> during each stage?',
      fields: [0, 1, 2, 3].map((i) => ({ label: `Stage ${'ABCD'[i]}`, options, correct: options.indexOf(STAGE[i]) })),
      working: `A: the ice warms up from ${num(T0)} °C to 0 °C. B: the ice melts, so the line is flat at 0 °C. C: the water warms up from 0 °C to 100 °C. D: the water boils, flat again at 100 °C.` },
    { kind: 'written', ask: 'Explain why the temperature stays at 0 °C during stage B, even though the heater is on.', lines: 5,
      points: ['The heater is still supplying energy at the same rate', 'The energy is used to break the bonds (overcome the forces of attraction) that hold the water particles in the fixed arrangement of ice', 'So the particles don’t speed up: their average kinetic energy, and so the temperature, stays at 0 °C until all the ice has melted'],
      model: 'The heater keeps supplying energy, but during stage B that energy goes into breaking the bonds that hold the water particles in the fixed structure of ice, instead of making the particles move faster. Temperature measures the particles’ average kinetic energy, so it stays at 0 °C until all the ice has melted. Only then does the energy speed the particles up again, and the temperature rises.',
      notes: ['“It is melting” alone isn’t enough: say what the energy does to the particles.', 'The energy isn’t lost or wasted: it goes into separating the particles.'] },
    { kind: 'choice', ask: 'In which stage, A, B or C, did the heater supply the <b>most energy</b>?', choices: ['Stage A', 'Stage B', 'Stage C'], correct: most, working: `<b>Stage ${'ABC'[most]}</b>: it lasts the longest, about ${minutes(lasts[most])}, and the heater supplies the same energy every minute.`,
      explain: { ask: 'Explain how the graph shows this.', lines: 3,
        points: ['The heater supplies energy at a constant rate, so the energy it supplies in a stage depends on how long that stage lasts', `Stage ${'ABC'[most]} lasts the longest: about ${minutes(lasts[most])}, against about ${minutes(lasts[next])} for stage ${'ABC'[next]}, the next longest`],
        model: `Stage ${'ABC'[most]}. The heater supplies the same energy every minute, so the longest stage takes the most energy. Stage ${'ABC'[most]} lasts about ${minutes(lasts[most])} (from about ${halves(most ? mins[most - 1] : 0)} to ${halves(mins[most])} minutes), longer than stage ${'ABC'[next]} (about ${minutes(lasts[next])}) or stage ${'ABC'[3 - most - next]} (about ${minutes(lasts[3 - most - next])}).`,
        notes: ['Compare how long each stage lasts, not how far the temperature changes: the heater gives the same energy every minute.'] } },
  ];
  const steep = { kind: 'written', ask: 'Explain why the line is <b>steeper</b> in stage A than in stage C.', lines: 4,
    points: ['The heater supplies the same energy every minute, to the same mass of water, in both stages', `Ice has a lower specific heat capacity (about ${num(ICE.c)} J/(kg·°C)) than liquid water (about ${num(ICE.water)} J/(kg·°C)), so the same energy warms ice about twice as much`],
    model: `The heater supplies energy at the same rate to the same ${grams} g of water in both stages. But ice’s specific heat capacity, about ${num(ICE.c)} J/(kg·°C), is about half of liquid water’s, about ${num(ICE.water)} J/(kg·°C). So each joule warms the ice about twice as much as it warms the water, and its temperature rises about twice as fast. (In stage C the hot water also loses more heat to the room, which makes it slower still.)`,
    notes: ['“Ice absorbs heat faster” isn’t the reason: the heater gives both the same energy each minute. It’s how much each °C costs.'] };
  const water = { kind: 'steps', ask: `How much energy is needed to warm the water from 0 °C to 100 °C? The specific heat capacity of water is ${num(ICE.water)} J/(kg·°C). Give your answer in <b>kJ</b>.`, topic: 'Heat in kilojoules',
    steps: [{ label: 'Mass in kg', value: m, unit: 'kg', tol: 0.001 }, { label: 'Energy in J', value: Qw, unit: 'J', tol: 0.01 }, { label: 'Energy in kJ', value: Qw / 1000, unit: 'kJ', tol: 0.01 }],
    working: `m = ${grams} ÷ 1000 = ${num(m)} kg. Q = mcΔT = ${num(m)} × ${num(ICE.water)} × (100 − 0) = ${num(Qw)} J = <b>${num(Qw / 1000, 1)} kJ</b> (÷ 1000).` };
  const efficiency = (withQ) => ({ kind: 'steps', ask: `The heater’s power is ${P} W. Use the graph to find what <b>percentage</b> of the energy the heater supplied during stage C went into warming the water.${withQ ? ` (The specific heat capacity of water is ${num(ICE.water)} J/(kg·°C).)` : ''}`, topic: 'Electric heater',
    steps: [{ label: 'How long stage C lasted, in seconds', value: tC, unit: 's', tol: { abs: 60 } }, { label: 'Energy the heater supplied in stage C', value: E, unit: 'J', tol: 0.08 },
      ...(withQ ? [{ label: 'Energy needed to warm the water from 0 °C to 100 °C', value: Qw, unit: 'J', tol: 0.01 }] : []), { label: 'Percentage that went into the water', value: round(pct, 1), unit: '%', tol: 0.1 }],
    working: `Stage C runs from about ${halves(mins[1])} to about ${halves(mins[2])} minutes: about ${minutes(tC / 60)}, or ${num(tC)} s. The heater supplied Q = P × t = ${P} × ${num(tC)} = ${num(E)} J. Warming the water needs ${withQ ? `Q = mcΔT = ${num(m)} × ${num(ICE.water)} × 100 = ` : ''}${num(Qw)} J${withQ ? '' : ' (from the part before)'}. So ${num(Qw)} ÷ ${num(E)} × 100 ≈ <b>${num(pct, 0)}%</b> went into the water. The rest warmed the beaker and the heater, and escaped to the room.` });
  const more = d.pick([[steep, water], [steep, efficiency(true)], [water, efficiency(false)]]);

  return {
    title: 'From ice to boiling water',
    intro: `<p>A student takes ${grams} g of crushed ice from a freezer at ${num(T0)} °C and puts it in a beaker with an electric immersion heater and a temperature probe. The student switches the heater on, stirs all the time, and records the temperature every half minute until the water has been boiling for a few minutes.</p><p>The results are shown in the graph below.</p>`,
    figures: [letteredGraph({ title: `Heating ${grams} g of ice`, lines: [points], marks: labels, x: [0, end, step], y: [Math.floor((T0 - 5) / 10) * 10, 110, 10], xLabel: 'time (minutes)', yLabel: 'temperature (°C)' })],
    ...(more.some((p) => p.topic === 'Electric heater') ? { guide: '<ul><li>Percentage of the energy that is useful = <span class="f">useful energy ÷ energy supplied × 100%</span></li></ul>' } : {}),
    parts: [...parts, ...more],
  };
}

// three liquids of the same mass on identical hot plates: each warms at a rate set by its specific heat capacity (a
// little more slowly as it gets hotter and loses more heat), and none of them boils
const LIQUIDS = [['water', 4180], ['sea water', 3990], ['glycerol', 2410], ['olive oil', 1970]];
const LIQUID = ['Liquid A', 'Liquid B', 'Liquid C'];
function heatingLiquids(d) {
  const used = d.shuffle([LIQUIDS[0], LIQUIDS[2], LIQUIDS[3]]), grams = d.pick([200, 250, 300]), m = grams / 1000, P = d.pick([40, 50, 60]), T0 = d.int(18, 22), end = 10, leak = 0.1;
  const temps = used.map(([, c]) => {
    const out = [T0];
    for (let t = 1, T = T0; t <= end * 60; t++) out.push((T += (P - leak * (T - T0)) / (m * c)));
    return out;
  });
  const series = used.map((_, i) => ({ name: `${LIQUID[i]} temperature (°C)`, points: Array.from({ length: end * 2 + 1 }, (_, j) => [j / 2, j ? round(temps[i][j * 30] + (d.r() - 0.5) * 0.5, 1) : T0]) }));
  const top = Math.max(...series.flatMap((s) => s.points.map((p) => p[1])));
  const highest = used.indexOf(LIQUIDS[0]);
  // the specific heat from the graph: one liquid's rise over the first few minutes (at least 15 °C, to read it well)
  const k = d.pick([0, 1, 2]), tk = [4, 5, 6, 8, 10].find((t) => temps[k][t * 60] - T0 >= 15) ?? 10;
  const rise = series[k].points[tk * 2][1] - T0, Q = P * tk * 60, c = Q / (m * rise);
  const near = LIQUIDS.reduce((a, b) => (Math.abs(b[1] - c) < Math.abs(a[1] - c) ? b : a));
  const table = `<table class="data"><thead><tr><th>Liquid</th><th>Specific heat capacity, J/(kg·°C)</th></tr></thead><tbody>${LIQUIDS.map(([n, cc]) => `<tr><td>${cap(n)}</td><td>${num(cc)}</td></tr>`).join('')}</tbody></table>`;

  const parts = [
    { kind: 'select', ask: 'Identify the <b>independent</b> variable, the <b>dependent</b> variable and one <b>control</b> variable in this experiment.',
      fields: [field(d, 'Independent variable', 'The type of liquid', ['Time', 'The temperature of each liquid', 'The power of the hot plates']),
        field(d, 'Dependent variable', 'How fast each liquid’s temperature rises', ['The type of liquid', 'Time', 'The mass of each liquid']),
        field(d, 'A control variable', 'The mass of each liquid', ['The type of liquid', 'How fast each liquid’s temperature rises', 'The temperature each liquid reaches'])],
      working: 'The student changes the <b>type of liquid</b> on purpose and measures <b>how fast each one’s temperature rises</b>. The <b>mass</b> (and the hot plates’ power, and the beakers) are kept the same so that only the liquid changes.' },
    { kind: 'choice', ask: 'Based on the data, which liquid has the <b>highest specific heat capacity</b>?', choices: LIQUID, correct: highest, topic: 'Same heat, different materials', working: `<b>${LIQUID[highest]}</b>: its line is the least steep, so it needs the most energy for each °C.`,
      explain: { ask: 'Explain briefly.', lines: 3,
        points: [`${LIQUID[highest]}’s temperature rises the slowest: its line is the least steep`, 'Each liquid has the same mass and gets the same energy every minute, so the one that warms least needs the most energy for each kg to warm by 1 °C'],
        model: `${LIQUID[highest]}. The liquids have equal masses and identical hot plates, so each gets the same energy every minute. ${LIQUID[highest]}’s line is the least steep: it warms the least for that energy, so it takes the most energy to warm each kilogram by 1 °C.`,
        notes: ['The liquid that gets hottest has the <i>lowest</i> specific heat capacity, not the highest.'] } },
    { kind: 'steps', ask: `Each hot plate delivers ${P} W to its beaker, and each beaker holds ${grams} g of liquid. Use the graph to calculate the <b>specific heat capacity</b> of ${LIQUID[k]}, using its first ${tk} minutes.`, topic: 'Finding the specific heat',
      steps: [{ label: `Temperature rise in the first ${tk} minutes`, value: round(rise, 1), unit: '°C', tol: { abs: 1 } }, { label: 'Energy supplied in that time', value: Q, unit: 'J', tol: 0.01 }, { label: 'Specific heat capacity', value: round(c, 0), unit: 'J/(kg·°C)', tol: 0.08 }],
      working: `From the graph, ${LIQUID[k]} warms from ${T0} °C to about ${num(T0 + rise, 1)} °C in ${tk} minutes: ΔT ≈ ${num(rise, 1)} °C. The hot plate supplies Q = P × t = ${P} W × ${tk * 60} s = ${num(Q)} J. The mass is ${grams} g = ${num(m)} kg. So c = Q ÷ (mΔT) = ${num(Q)} ÷ (${num(m)} × ${num(rise, 1)}) ≈ <b>${num(c, 0)} J/(kg·°C)</b>.` },
    { kind: 'choice', ask: `Use your answer and the table to say which liquid ${LIQUID[k]} is most likely to be.`, choices: LIQUIDS.map(([n]) => cap(n)), correct: LIQUIDS.indexOf(near),
      working: `${num(c, 0)} J/(kg·°C) is closest to <b>${near[0]}</b> (${num(near[1])} J/(kg·°C)).` },
  ];
  if (c > used[k][1] * 1.01) parts.push({ kind: 'written', ask: `The value you found for ${LIQUID[k]} is a little bigger than the one in the table. Suggest why.`, lines: 3, marks: 2,
    points: ['Some of the hot plate’s energy warms the beaker and escapes to the air, instead of warming the liquid', 'So the liquid’s temperature rises less than if all the energy went into it', 'c = Q ÷ (mΔT): the same Q with a smaller ΔT gives a bigger c'],
    model: 'Not all of the hot plate’s energy goes into the liquid: some warms the beaker, and some escapes to the air, more so as the liquid gets hotter. So the liquid warms by less than all that energy would make it. Since c = Q ÷ (mΔT), using the full Q with a smaller ΔT gives a value of c that is too big.',
    notes: ['“Human error” earns nothing: say where the energy goes and what that does to ΔT.'] });
  else parts.push({ kind: 'written', ask: 'Each line gets a little <b>less steep</b> as its liquid gets hotter. Explain why.', lines: 3, marks: 2,
    points: ['The hotter the liquid, the bigger the difference between its temperature and the room’s', 'So it loses heat to the air (and the beaker) faster', 'So less of the hot plate’s energy each minute is left to warm the liquid, and it warms more slowly'],
    model: 'The hot plate supplies the same energy every minute, but the hotter a liquid gets compared with the room, the faster it loses heat to the air around it. So as it warms, more of each minute’s energy escapes and less is left to raise its temperature, and the line gets less steep.',
    notes: ['The hot plate doesn’t get weaker: it supplies the same energy every minute. Say where the energy goes.'] });

  return {
    title: 'Heating three liquids',
    intro: `<p>A student pours ${grams} g of each of three liquids, A, B and C, into identical beakers and stands each one on its own hot plate. The three hot plates are identical and set to the same power. The student stirs each liquid and records its temperature every half minute for ${end} minutes. None of the liquids boils.</p><p>The results are shown in the graph below, and the table gives the specific heat capacities of some liquids.</p>`,
    figures: [lineGraph({ title: 'Heating equal masses of three liquids', series, x: [0, end, 1], y: [Math.floor((T0 - 3) / 10) * 10, Math.ceil((top + 3) / 10) * 10, 5], xLabel: 'time (minutes)', yLabel: 'temperature (°C)' }), `<div class="chart"><p class="chart-title">Specific heat capacities</p>${table}</div>`],
    parts,
  };
}

// the same material in three masses, each warmed by an identical heater: twice the mass warms half as fast. Water in
// lagged beakers with lids, or blocks of aluminum, so little heat escapes and the lines stay straight
function differentMasses(d) {
  const water = d.chance(0.5), c = water ? 4180 : 900, thing = water ? 'Beaker' : 'Block';
  const sizes = [];
  for (const m0 of water ? [0.1, 0.15, 0.2] : [0.5, 1]) for (const P of water ? [20, 25, 30, 40, 50, 60, 80] : [30, 40, 50, 60]) {
    const r = (P * 600) / (m0 * c);
    if (r >= 30 && r <= (water ? 60 : 70)) sizes.push([m0, P]);
  }
  const [m0, P] = d.pick(sizes), T0 = d.int(17, 22), end = 10, mass = d.shuffle([1, 2, 3]).map((x) => round(x * m0, 2));
  const shown = (kg) => (water ? `${num(kg * 1000)} g` : `${num(kg)} kg`);
  const series = mass.map((kg, i) => ({ name: `${thing} ${'ABC'[i]} temperature (°C)`, points: Array.from({ length: end + 1 }, (_, t) => [t, t ? round(T0 + (P * t * 60) / (kg * c) + (d.r() - 0.5) * 0.6, 1) : T0]) }));
  const top = Math.max(...series.flatMap((s) => s.points.map((p) => p[1])));
  const big = mass.indexOf(Math.max(...mass)), small = mass.indexOf(Math.min(...mass)), midI = 3 - big - small;
  const j = d.pick([small, midI]), rise = (P * end * 60) / (mass[j] * c), Q = mass[j] * c * rise;
  const what = water ? `${shown(m0)}, ${shown(2 * m0)} and ${shown(3 * m0)} of water` : `${shown(m0)}, ${shown(2 * m0)} and ${shown(3 * m0)}`;

  const parts = [
    { kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
      fields: [field(d, 'Independent variable', water ? 'The mass of water' : 'The mass of the block', ['Time', 'The power of the heaters', 'The temperature']),
        field(d, 'Dependent variable', 'How fast the temperature rises', ['Time', water ? 'The mass of water' : 'The mass of the block', 'The power of the heaters'])],
      working: `The student changes the <b>mass</b> on purpose and measures <b>how fast the temperature rises</b>. Time and temperature are the graph’s axes, but the experiment compares the masses.` },
    { kind: 'choice', ask: `Which ${thing.toLowerCase()} had the <b>largest mass</b>?`, choices: [0, 1, 2].map((i) => `${thing} ${'ABC'[i]}`), correct: big, working: `<b>${thing} ${'ABC'[big]}</b>: its line is the least steep, so it warms the least for the same energy.`,
      explain: { ask: 'Explain how the graph shows this.', lines: 3,
        points: [`${thing} ${'ABC'[big]}’s temperature rises the slowest: its line is the least steep`, 'Each heater supplies the same energy every minute, and a bigger mass needs more energy to warm by each °C, so it warms more slowly'],
        model: `${thing} ${'ABC'[big]}. The heaters are identical, so each ${thing.toLowerCase()} gets the same energy every minute. A bigger mass needs more energy for each °C it warms (Q = mcΔT), so the ${thing.toLowerCase()} with the most mass has the least steep line: ${thing} ${'ABC'[big]}.`,
        notes: ['The line that ends highest has the <i>smallest</i> mass.'] } },
    { kind: 'written', ask: `Using ideas about <b>particles</b>, explain why the ${thing.toLowerCase()} with the largest mass warms the slowest.`, lines: 4,
      points: ['A bigger mass has more particles', 'The same energy each minute is shared between more particles, so each particle’s kinetic energy goes up by less', 'Temperature measures the particles’ average kinetic energy, so the temperature rises more slowly'],
      model: `The ${thing.toLowerCase()} with three times the mass has three times as many particles. Its heater gives it the same energy each minute as the others, but that energy is shared between more particles, so the average kinetic energy of each one goes up by less. Since temperature measures the particles’ average kinetic energy, its temperature rises more slowly: about a third as fast as the smallest mass.`,
      notes: ['Say what happens to the particles’ energy: “there is more to heat” alone isn’t enough.'] },
    { kind: 'steps', ask: `${thing} ${'ABC'[j]} held ${shown(mass[j])}${water ? ' of water' : ''}. Use its line to find the <b>power</b> of each heater. The specific heat capacity of ${water ? 'water' : 'aluminum'} is ${num(c)} J/(kg·°C).`, topic: 'Electric heater',
      steps: [...(water ? [{ label: 'Mass in kg', value: mass[j], unit: 'kg', tol: 0.001 }] : []), { label: `Temperature rise in ${end} minutes`, value: round(rise, 1), unit: '°C', tol: { abs: 1 } },
        { label: 'Energy the heater supplied', value: round(Q, 0), unit: 'J', tol: 0.08 }, { label: 'Power of the heater', value: P, unit: 'W', tol: 0.1 }],
      working: `${water ? `m = ${num(mass[j] * 1000)} g = ${num(mass[j])} kg. ` : ''}From the graph, ${thing} ${'ABC'[j]} warms from ${T0} °C to about ${num(T0 + rise, 1)} °C in ${end} minutes: ΔT ≈ ${num(rise, 1)} °C. Q = mcΔT = ${num(mass[j])} × ${num(c)} × ${num(rise, 1)} ≈ ${num(Q, 0)} J. That took ${end} minutes = ${end * 60} s, so P = Q ÷ t = ${num(Q, 0)} ÷ ${end * 60} ≈ <b>${P} W</b>.` },
  ];
  const doubled = mass.indexOf(round(2 * m0, 2)), single = mass.indexOf(round(m0, 2));
  const r1 = series[single].points[end][1] - T0, r2 = series[doubled].points[end][1] - T0;
  parts.push(d.chance(0.5)
    ? { kind: 'choice', ask: `When the mass is doubled, what happens to how far the temperature rises in ${end} minutes?`, choices: ['It doubles', 'It halves', 'It stays the same', 'It falls to a quarter'], correct: 1, working: `<b>It halves</b>: about ${num(r1, 0)} °C for ${shown(m0)}, about ${num(r2, 0)} °C for ${shown(2 * m0)}.`,
      explain: { ask: 'Use the data to support your answer.', lines: 3, marks: 1,
        points: [`${thing} ${'ABC'[single]} (${shown(m0)}) warmed by about ${num(r1, 0)} °C in ${end} minutes, and ${thing} ${'ABC'[doubled]} (${shown(2 * m0)}) by about ${num(r2, 0)} °C: about half as much`],
        model: `It halves: ${thing} ${'ABC'[single]}, with ${shown(m0)}, warmed by about ${num(r1, 0)} °C, while ${thing} ${'ABC'[doubled]}, with twice the mass, warmed by about ${num(r2, 0)} °C, about half as much. The same energy spread over twice the mass warms it half as much.` } }
    : { kind: 'number', ask: `The student repeats the experiment with ${shown(4 * m0)}${water ? ' of water' : ''} and the same kind of heater. Use the graph to <b>predict</b> how far its temperature would rise in ${end} minutes.`, value: round((P * end * 60) / (4 * m0 * c), 1), unit: '°C', tol: 0.1,
      working: `Four times the smallest mass warms a quarter as much in the same time. ${thing} ${'ABC'[single]} (${shown(m0)}) warmed by about ${num(r1, 1)} °C, so ${shown(4 * m0)} would warm by about ${num(r1, 1)} ÷ 4 ≈ <b>${num(r1 / 4, 1)} °C</b>.` });

  return {
    title: water ? 'Heating different masses of water' : 'Heating aluminum blocks',
    intro: water
      ? `<p>A student investigates how the mass of water affects how fast it warms up. Three beakers, A, B and C, hold ${what}, in some order. Each beaker is wrapped in insulation, has a lid, and has an identical immersion heater in it. The student switches the heaters on together and records the temperature in each beaker every minute for ${end} minutes, but forgets to note which beaker held which mass.</p><p>The results are shown in the graph below.</p>`
      : `<p>A student investigates how the mass of a block affects how fast it warms up. Three aluminum blocks, A, B and C, have masses of ${what}, in some order. Each block is wrapped in insulation and has an identical electric heater in a hole drilled into it, and a thermometer in a second hole. The student switches the heaters on together and records each block’s temperature every minute for ${end} minutes.</p><p>The results are shown in the graph below.</p>`,
    figures: [lineGraph({ title: water ? 'Heating three masses of water' : 'Heating three aluminum blocks', series, x: [0, end, 1], y: [Math.floor((T0 - 3) / 10) * 10, Math.ceil((top + 3) / 10) * 10, 5], xLabel: 'time (minutes)', yLabel: 'temperature (°C)', dots: true })],
    parts,
  };
}

// ---------- 2. data sets and their feedback loops ----------
// Each data set is a system measured once a year for 9 or 10 years: in it one loop runs away (each change makes itself
// bigger, so the changes speed up), and another, starting later, pushes back and steadies things. The numbers come from
// simple models of each system, wobbling a little like real measurements, and the mark schemes quote the years and
// values in the test’s own table.
// a share from 0 to 1 over n years: slow, then faster and faster, then leveling off, steepest at year turn
function sCurve(n, turn, width) {
  const f = (i) => 1 / (1 + Math.exp(-(i - turn) / width)), a = f(0), b = f(n - 1);
  return Array.from({ length: n }, (_, i) => (f(i) - a) / (b - a));
}
// a measurement: v give or take up to by
const wobble = (d, v, by) => v + (d.r() * 2 - 1) * by;
// a value as a data table shows it: always dp decimals, thousands separated, a proper minus sign
const fix = (v, dp = 0) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });
const u = (unit) => (!unit || unit === '%' ? unit : ` ${unit}`);
const changes = (v) => v.slice(1).map((x, i) => x - v[i]);
// how much v changes over the two years from year i (sign −1 to measure a fall), and the two years it changes most
const over2 = (v, i, sign = 1) => (v[i + 2] - v[i]) * sign;
function steepest2(v, sign = 1) {
  let best = 0;
  for (let i = 1; i + 2 < v.length; i++) if (over2(v, i, sign) > over2(v, best, sign)) best = i;
  return best;
}
const RUNAWAY_NOTES = [
  'Naming the loop (“this is a run-away loop”) or listing numbers from the table isn’t enough: say how each change causes the next, and how the last one comes back round to make the first one bigger.',
  'Use the data: quote the years and the values you mean, not just “it went up”.',
  'Five sentences at most.',
];
const STEADY_NOTES = [
  'Saying that something “levels off” isn’t enough: say which change causes which, and how the loop pushes back against the first change.',
  'Use the data: quote the years and the values you mean.',
  'Five sentences at most.',
];
// the question for a system: { title, intro, caption, y0, cols: { key: { head, name, unit, dp, values } }, order (the
// table's columns), runaway and steady ({ points, model }), pairs (two pairs of variables and the loop each forms),
// calc ([{ key, i, j, as: ['percent' and/or 'rate'] }]: changes worth working out), fastest (a column, or none) }
function dataSet(d, sys) {
  const { y0, cols, order } = sys, n = cols[order[0]].values.length, Y = (i) => y0 + i;
  const rows = Array.from({ length: n }, (_, i) => [Y(i), ...order.map((k) => fix(cols[k].values[i], cols[k].dp))]);
  const parts = [
    { kind: 'written', ask: 'In no more than five sentences, use the data to explain a <b>reinforcing (run-away)</b> feedback loop in this system.', lines: 6, marks: 4, ...sys.runaway, notes: RUNAWAY_NOTES },
    { kind: 'written', ask: 'In no more than five sentences, use the data to explain a <b>balancing (stabilizing)</b> feedback loop in this system.', lines: 6, marks: 3, ...sys.steady, notes: STEADY_NOTES },
  ];
  // a change to work out from the table: as a percentage, or on average each year
  const c = d.pick(sys.calc), col = cols[c.key], a = col.values[c.i], b = col.values[c.j], size = Math.abs(b - a), up = b > a, by = `${up ? 'rise' : 'fall'} of ${fix(size, col.dp)}${u(col.unit)}`;
  if (d.pick(c.as) === 'percent') parts.push({ kind: 'steps', ask: `By what <b>percentage</b> did ${col.name} ${up ? 'rise' : 'fall'} between ${Y(c.i)} and ${Y(c.j)}?`,
    steps: [{ label: `How much it ${up ? 'rose' : 'fell'} by`, value: round(size, col.dp), unit: col.unit, tol: 0.01 }, { label: 'Percentage change', value: round((size / a) * 100, 1), unit: '%', tol: 0.02 }],
    working: `From ${fix(a, col.dp)} to ${fix(b, col.dp)}${u(col.unit)} is a ${by}. As a share of where it started: ${fix(size, col.dp)} ÷ ${fix(a, col.dp)} × 100 ≈ <b>${num((size / a) * 100, 1)}%</b>.` });
  else parts.push({ kind: 'steps', ask: `On average, by how much did ${col.name} ${up ? 'rise' : 'fall'} <b>each year</b> between ${Y(c.i)} and ${Y(c.j)}?`,
    steps: [{ label: `How much it ${up ? 'rose' : 'fell'} by altogether`, value: round(size, col.dp), unit: col.unit, tol: 0.01 }, { label: 'Average change each year', value: round(size / (c.j - c.i), col.dp + 2), unit: `${col.unit} per year`, tol: 0.02 }],
    working: `From ${fix(a, col.dp)} to ${fix(b, col.dp)}${u(col.unit)} is a ${by} over ${c.j - c.i} years, so on average ${fix(size, col.dp)} ÷ ${c.j - c.i} ≈ <b>${num(size / (c.j - c.i), col.dp + 2)}${u(col.unit)}</b> a year.` });
  // and which year changed most, or what kind of loop a pair of variables forms
  let last = null;
  if (sys.fastest && d.chance(0.5)) {
    const f = cols[sys.fastest], ch = changes(f.values), sz = ch.map(Math.abs), k = sz.indexOf(Math.max(...sz)), second = Math.max(...sz.filter((_, i) => i !== k));
    if (sz[k] - second >= Math.max(0.1 * sz[k], 10 ** -f.dp)) {
      const opts = [k, ...d.shuffle(sz.map((_, i) => i).filter((i) => i !== k)).slice(0, 3)].sort((x, y) => x - y);
      last = { kind: 'choice', ask: `Between which two years did ${f.name} change the <b>most</b>?`, choices: opts.map((i) => `${Y(i)} to ${Y(i + 1)}`), correct: opts.indexOf(k), working: `<b>${Y(k)} to ${Y(k + 1)}</b>: a change of ${fix(sz[k], f.dp)}${u(f.unit)}, the biggest in any one year.`,
        explain: { ask: 'Use the data to support your answer.', lines: 2, marks: 1,
          points: [`From ${Y(k)} to ${Y(k + 1)} it ${ch[k] > 0 ? 'rose' : 'fell'} by ${fix(sz[k], f.dp)}${u(f.unit)}: more than in any other year (the next biggest change was ${fix(second, f.dp)}${u(f.unit)})`],
          model: `${Y(k)} to ${Y(k + 1)}: ${f.name} ${ch[k] > 0 ? 'rose' : 'fell'} from ${fix(f.values[k], f.dp)} to ${fix(f.values[k + 1], f.dp)}${u(f.unit)}, a change of ${fix(sz[k], f.dp)}${u(f.unit)}, the biggest in any one year.` } };
    }
  }
  if (!last) {
    const pair = d.pick(sys.pairs);
    last = { kind: 'choice', ask: `${cap(pair.a)} and ${pair.b} affect each other. What kind of feedback loop do they form?`, choices: ['A reinforcing (run-away) loop', 'A balancing (stabilizing) loop'], correct: pair.balancing ? 1 : 0, working: pair.balancing ? `<b>Balancing</b>: each change in ${pair.a} brings a change in ${pair.b} that works against it.` : `<b>Reinforcing</b>: each change in ${pair.a} brings a change in ${pair.b} that pushes it further the same way.`,
      explain: { ask: 'Explain how, using the data.', lines: 3, points: pair.points, model: pair.model,
        notes: ['Say how each one changes the other, and whether that makes the first change bigger (reinforcing) or works against it (balancing).'] } };
  }
  parts.push(last);
  return {
    title: sys.title, intro: `${sys.intro}<p>By referring to the data, answer the questions that follow.</p>`,
    figures: [dataTable(['Year', ...order.map((k) => cols[k].head)], rows, sys.caption)], parts,
  };
}

// Arctic sea ice: less ice, a darker sea and a warmer region run away together; more low cloud over the open water
// slows the warming
function arcticIce(d) {
  const n = d.pick([9, 10]), y0 = d.int(2008, 2014), Y = (i) => y0 + i, e = n - 1, turn = n * d.pick([0.55, 0.6]) - 0.5, w = d.pick([1.1, 1.3]);
  const p = sCurve(n, turn, w), q = sCurve(n, turn - 0.4, w), r = sCurve(n, turn + 1, w * 0.8);
  const I0 = d.int(58, 66) * 10, drop = d.int(28, 36) * 10, T0 = d.int(4, 12) / 10, rise = d.int(18, 26) / 10, C0 = d.int(44, 50), dc = d.int(10, 15);
  const ice = p.map((x) => Math.round(wobble(d, I0 - drop * x, 2)));
  const alb = ice.map((x) => Math.round(wobble(d, 6 + 0.054 * x, 0.3)));
  const temp = q.map((x) => round(wobble(d, T0 + rise * x, 0.04), 1));
  const cloud = r.map((x) => Math.round(wobble(d, C0 + dc * x, 0.4)));
  const f = steepest2(ice, -1), b = Math.min(f + 2, e), tf = steepest2(temp), T = (i) => `${fix(temp[i], 1)} °C`;
  return {
    title: 'Arctic sea ice', y0, caption: `Measurements from one region of the Arctic Ocean, ${Y(0)} to ${Y(e)}`,
    intro: '<p>Sea ice is white and reflects most of the sunlight that reaches it, while the open ocean is dark and absorbs most of it. The share of sunlight a surface reflects is called its <b>albedo</b>. Warm air over open water also takes up more water vapor, which forms low clouds.</p><p>Climate scientists studying one region of the Arctic Ocean measured, every year, the area of sea ice left at the end of summer, the average albedo of the region, its average summer air temperature, and how much of the summer sky was covered by low cloud.</p>',
    order: ['ice', 'alb', 'temp', 'cloud'],
    cols: {
      ice: { head: 'Sea ice left in September (thousand km²)', name: 'the sea ice left in September', unit: 'thousand km²', dp: 0, values: ice },
      alb: { head: 'Average albedo of the region (%)', name: 'the region’s albedo', unit: '%', dp: 0, values: alb },
      temp: { head: 'Average summer air temperature (°C)', name: 'the summer air temperature', unit: '°C', dp: 1, values: temp },
      cloud: { head: 'Low cloud cover in summer (%)', name: 'the low cloud cover', unit: '%', dp: 0, values: cloud },
    },
    runaway: {
      points: [`As the sea ice shrank (from ${fix(ice[0])} thousand km² in ${Y(0)} to ${fix(ice[b])} thousand km² in ${Y(b)}), the region’s albedo fell (from ${alb[0]}% to ${alb[b]}%), because dark open water replaced white ice`,
        `The dark water absorbs more of the sun’s energy instead of reflecting it, so the region warmed: the summer air temperature rose from ${T(0)} to ${T(b)}`,
        'The warmer air and water melt even more ice, which lowers the albedo again: the change comes back round and makes itself bigger',
        `The data shows it speeding up: ${fix(over2(ice, 0, -1))} thousand km² of ice was lost from ${Y(0)} to ${Y(2)}, but ${fix(over2(ice, f, -1))} thousand km² from ${Y(f)} to ${Y(f + 2)}`],
      model: `Between ${Y(0)} and ${Y(b)} the sea ice shrank from ${fix(ice[0])} to ${fix(ice[b])} thousand km², so more of the region was dark open water, and its albedo fell from ${alb[0]}% to ${alb[b]}%. The darker surface absorbs more of the sun’s energy, so the summer air temperature rose from ${T(0)} to ${T(b)}. The warmer air and water then melt even more ice, which lowers the albedo again, so each change makes the next one bigger. That is why the loss sped up: ${fix(over2(ice, 0, -1))} thousand km² of ice went from ${Y(0)} to ${Y(2)}, but ${fix(over2(ice, f, -1))} thousand km² from ${Y(f)} to ${Y(f + 2)}.`,
    },
    steady: {
      points: [`As the region warmed and the open water grew, more water evaporated and low cloud cover rose: from ${cloud[f]}% in ${Y(f)} to ${cloud[e]}% in ${Y(e)}`,
        'Low clouds reflect sunlight back to space before it reaches the surface, so less of the sun’s energy warms the region',
        `So the warming slowed down: the temperature rose ${fix(over2(temp, tf), 1)} °C from ${Y(tf)} to ${Y(tf + 2)}, but only ${fix(over2(temp, e - 2), 1)} °C from ${Y(e - 2)} to ${Y(e)}`,
        'The warmer it gets, the more cloud forms to cool it: the loop pushes back against the change and steadies the temperature'],
      model: `As the region warmed, more water evaporated from the growing area of open sea, and low cloud cover rose from ${cloud[f]}% in ${Y(f)} to ${cloud[e]}% in ${Y(e)}. Low clouds reflect sunlight back to space before it can warm the surface. So the warming slowed: the temperature rose ${fix(over2(temp, tf), 1)} °C from ${Y(tf)} to ${Y(tf + 2)}, but only ${fix(over2(temp, e - 2), 1)} °C from ${Y(e - 2)} to ${Y(e)}. The more the region warms, the more cloud forms to cool it, which steadies the temperature.`,
    },
    pairs: [
      { a: 'the sea ice', b: 'the summer air temperature', balancing: false,
        points: ['Less ice means a lower albedo, so more sunlight is absorbed and the air warms; warmer air melts more ice', `Each change pushes the other further the same way: as the ice fell from ${fix(ice[0])} to ${fix(ice[e])} thousand km², the temperature rose from ${T(0)} to ${T(e)}`],
        model: `A reinforcing loop. Less ice lowers the albedo, so the region absorbs more sunlight and warms, and the warmer air and water melt more ice. From ${Y(0)} to ${Y(e)} the ice fell from ${fix(ice[0])} to ${fix(ice[e])} thousand km² while the temperature rose from ${T(0)} to ${T(e)}, each change driving the other on.` },
      { a: 'the summer air temperature', b: 'the low cloud cover', balancing: true,
        points: ['Warmer air over more open water makes more low cloud', `More cloud reflects sunlight and cools the region, working against the warming that made it: the warming slowed as cloud cover rose to ${cloud[e]}%`],
        model: `A balancing loop. Warmer air over open water makes more low cloud, and the cloud reflects sunlight and cools the region, so the warming makes something that works against it. As cloud cover rose from ${cloud[f]}% to ${cloud[e]}%, the temperature rose only ${fix(over2(temp, e - 2), 1)} °C in the last two years.` },
    ],
    calc: [{ key: 'ice', i: 0, j: e, as: ['percent', 'rate'] }, { key: 'temp', i: 0, j: e, as: ['rate'] }],
    fastest: 'ice',
  };
}

// thawing permafrost: warmer summers thaw the ground deeper, which gives off methane that warms the summers more; shrubs
// spreading over the thawed ground shade it and slow the thaw
function permafrost(d) {
  const n = d.pick([9, 10]), y0 = d.int(2008, 2014), Y = (i) => y0 + i, e = n - 1, turn = n * d.pick([0.55, 0.6]) - 0.5, w = d.pick([1.1, 1.3]);
  const p = sCurve(n, turn, w), q = sCurve(n, turn - 0.4, w), r = sCurve(n, turn + 1, w * 0.8);
  const D0 = d.int(44, 56), dD = d.int(22, 32), M0 = d.int(11, 15) * 100, grow = d.pick([2.4, 2.7, 3]), T0 = d.int(80, 95) / 10, rise = d.int(17, 25) / 10, S0 = d.int(7, 12), dS = d.int(11, 17);
  const depth = q.map((x) => Math.round(wobble(d, D0 + dD * x, 0.4)));
  const meth = p.map((x) => Math.round(wobble(d, M0 * (1 + (grow - 1) * x), 15) / 10) * 10);
  const temp = q.map((x) => round(wobble(d, T0 + rise * x, 0.04), 1));
  const shrub = r.map((x) => Math.round(wobble(d, S0 + dS * x, 0.3)));
  const f = steepest2(meth), b = Math.min(f + 2, e), df = steepest2(depth), T = (i) => `${fix(temp[i], 1)} °C`, M = (i) => `${fix(meth[i])} tonnes`;
  return {
    title: 'Thawing permafrost', y0, caption: `Measurements from an area of Arctic tundra, ${Y(0)} to ${Y(e)}`,
    intro: '<p><b>Permafrost</b> is ground that stays frozen all year round. It holds the remains of plants that died thousands of years ago. When it thaws, microbes break these remains down and give off methane, a greenhouse gas that traps heat in the atmosphere. In warmer summers, shrubs can also spread across the tundra: their leaves shade the ground beneath them, and they take in carbon dioxide as they grow.</p><p>Scientists studying an area of Arctic tundra measured, every year, how deep the ground thawed in summer, how much methane the area gave off, the average summer air temperature, and how much of the ground was covered by shrubs.</p>',
    order: ['depth', 'meth', 'temp', 'shrub'],
    cols: {
      depth: { head: 'Depth the ground thawed to in summer (cm)', name: 'the depth the ground thawed to', unit: 'cm', dp: 0, values: depth },
      meth: { head: 'Methane given off by the area (tonnes)', name: 'the methane given off', unit: 'tonnes', dp: 0, values: meth },
      temp: { head: 'Average summer air temperature (°C)', name: 'the summer air temperature', unit: '°C', dp: 1, values: temp },
      shrub: { head: 'Ground covered by shrubs (%)', name: 'the shrub cover', unit: '%', dp: 0, values: shrub },
    },
    runaway: {
      points: [`As the summers warmed (from ${T(0)} in ${Y(0)} to ${T(b)} in ${Y(b)}), the ground thawed deeper each summer: from ${depth[0]} cm to ${depth[b]} cm`,
        `Deeper thawing lets microbes break down more of the old plant remains, so the area gave off more methane: from ${M(0)} to ${M(b)}`,
        'Methane is a greenhouse gas, so more of it traps more heat: the summers warm further and the ground thaws even deeper, closing the loop',
        `The data shows it speeding up: the methane given off rose by ${fix(over2(meth, 0))} tonnes from ${Y(0)} to ${Y(2)}, but by ${fix(over2(meth, f))} tonnes from ${Y(f)} to ${Y(f + 2)}`],
      model: `Between ${Y(0)} and ${Y(b)} the summers warmed from ${T(0)} to ${T(b)}, and the ground thawed deeper, from ${depth[0]} cm to ${depth[b]} cm. With more of the old plant remains thawed, microbes gave off more methane: ${M(0)} rising to ${M(b)}. Methane traps heat, so the extra methane warms the summers further, which thaws the ground deeper still and gives off even more methane. So the rise sped up: ${fix(over2(meth, 0))} tonnes more from ${Y(0)} to ${Y(2)}, but ${fix(over2(meth, f))} tonnes more from ${Y(f)} to ${Y(f + 2)}.`,
    },
    steady: {
      points: [`As the ground thawed and the summers warmed, shrubs spread: shrub cover rose from ${shrub[f]}% in ${Y(f)} to ${shrub[e]}% in ${Y(e)}`,
        'Shrubs shade the ground from the summer sun (and take in carbon dioxide as they grow), so less energy reaches the soil',
        `So the thaw slowed down: the ground thawed ${over2(depth, df)} cm deeper from ${Y(df)} to ${Y(df + 2)}, but only ${over2(depth, e - 2)} cm deeper from ${Y(e - 2)} to ${Y(e)}`,
        'The more the ground thaws, the more shrubs grow to shade it: the loop pushes back against the thaw and steadies it'],
      model: `The thawed ground and warmer summers let shrubs spread, and shrub cover rose from ${shrub[f]}% in ${Y(f)} to ${shrub[e]}% in ${Y(e)}. The shrubs shade the soil from the summer sun and take in carbon dioxide as they grow, so less energy reaches the frozen ground. So the thaw slowed: ${over2(depth, df)} cm deeper from ${Y(df)} to ${Y(df + 2)}, but only ${over2(depth, e - 2)} cm deeper from ${Y(e - 2)} to ${Y(e)}. The more the ground thaws, the more shrubs grow to shade it, which steadies the thaw.`,
    },
    pairs: [
      { a: 'the methane given off', b: 'the summer air temperature', balancing: false,
        points: ['More methane traps more heat, so the summers get warmer; warmer summers thaw more ground, which gives off more methane', `Each pushes the other further the same way: the methane rose from ${M(0)} to ${M(e)} as the temperature rose from ${T(0)} to ${T(e)}`],
        model: `A reinforcing loop. More methane traps more heat and warms the summers, and warmer summers thaw more ground, which gives off more methane. From ${Y(0)} to ${Y(e)} the methane rose from ${M(0)} to ${M(e)} while the temperature rose from ${T(0)} to ${T(e)}, each driving the other on.` },
      { a: 'the depth the ground thaws to', b: 'the shrub cover', balancing: true,
        points: ['Deeper thawing in warmer summers lets shrubs spread', `The shrubs shade the ground and slow the thaw, working against the change that made them spread: the thaw slowed as shrub cover rose to ${shrub[e]}%`],
        model: `A balancing loop. Deeper thawing lets shrubs spread, and the shrubs shade the ground and slow the thaw. As shrub cover rose from ${shrub[f]}% to ${shrub[e]}%, the ground thawed only ${over2(depth, e - 2)} cm deeper in the last two years.` },
    ],
    calc: [{ key: 'meth', i: 0, j: e, as: ['percent', 'rate'] }, { key: 'depth', i: 0, j: e, as: ['percent', 'rate'] }],
    fastest: 'meth',
  };
}

// wildfires: fires destroy forest, a smaller forest makes less rain, and a drier forest burns more; the big fires burn up
// the dry fuel on the forest floor, so later fires are smaller
const FIRE_SETTINGS = [1.4, 1.5, 1.3, 1.6].flatMap((g) => [6e-5, 4e-5, 1e-4, 1.5e-4].flatMap((k) => [0.5, 0.2, 0.3].map((regrow) => [g, k, regrow])));
function wildfires(d) {
  const years = d.pick([9, 10]), y0 = d.int(2008, 2014), Y = (i) => y0 + i;
  const R0 = d.int(78, 88) * 10, F0 = d.int(60, 70), fuel0 = d.int(160, 190) / 10, B0 = d.int(7, 10), wob = Array.from({ length: years }, () => d.r() * 2 - 1);
  // a year's fires grow with the dryness and the year (g) and shrink with the fuel left; big fires use up fuel fast (k)
  // and it grows back slowly. The first setting that tells the story clearly (the fires speeding up to a peak in the
  // middle years, then falling back, with the rain still falling) is the one used, over 9 years if 10 don't work
  const run = ([g, k, regrow], n) => {
    const e = n - 1;
    const t = { rain: [], forest: [], burned: [], fuel: [] };
    for (let i = 0, fu = fuel0, fo = F0, ra = R0; i < n; i++) {
      const burn = B0 * (R0 / ra) ** 3 * g ** i * (fu / fuel0) ** 2;
      t.rain.push(Math.round(ra + wob[i] * 5)); t.forest.push(Math.round(fo)); t.burned.push(Math.round(burn)); t.fuel.push(round(fu, 1));
      fu = Math.max(4, fu + regrow - k * burn ** 3); fo -= 0.12 * burn; ra = R0 - 8 * (F0 - fo);
    }
    const B = t.burned, top = B.indexOf(Math.max(...B)), fast = steepest2(B.slice(0, top + 1));
    t.clear = top >= 3 && top <= e - 2 && fast > 0 && over2(B, fast) >= 1.5 * over2(B, 0) && B[e] < 0.75 * B[top] && B.slice(top + 1).every((x) => x < B[top]) && t.rain[e] < t.rain[top] && B[top] < 150;
    return t;
  };
  let best = null;
  for (const n of [years, 9]) for (const set of FIRE_SETTINGS) if (!best) { const t = run(set, n); if (t.clear) best = t; }
  const { rain, forest, burned, fuel } = best ?? run(FIRE_SETTINGS[0], 9), e = burned.length - 1;
  const pk = burned.indexOf(Math.max(...burned)), f = steepest2(burned.slice(0, pk + 1)), H = (i) => `${burned[i]} thousand hectares`;
  return {
    title: 'Drought and wildfires', y0, caption: `Records from a dry forest region, ${Y(0)} to ${Y(e)}`,
    intro: '<p>In a dry forest region, trees draw water from the soil and give off water vapor from their leaves, and much of it falls again nearby as rain. Fires spread through the dead leaves, twigs and grass on the forest floor, called <b>dry fuel</b>, and a dry forest burns far more easily than a damp one.</p><p>Foresters recorded, every year, the region’s rainfall, how much of the region was covered by forest, the area burned by wildfires, and the amount of dry fuel on the forest floor.</p>',
    order: ['rain', 'forest', 'burned', 'fuel'],
    cols: {
      rain: { head: 'Rainfall (mm)', name: 'the rainfall', unit: 'mm', dp: 0, values: rain },
      forest: { head: 'Forest cover (%)', name: 'the forest cover', unit: '%', dp: 0, values: forest },
      burned: { head: 'Area burned by wildfires (thousand hectares)', name: 'the area burned', unit: 'thousand hectares', dp: 0, values: burned },
      fuel: { head: 'Dry fuel on the forest floor (tonnes per hectare)', name: 'the dry fuel on the forest floor', unit: 'tonnes per hectare', dp: 1, values: fuel },
    },
    runaway: {
      points: [`Fires destroyed forest, so the forest cover fell: from ${forest[0]}% in ${Y(0)} to ${forest[pk]}% in ${Y(pk)}`,
        `With fewer trees giving off water vapor from their leaves, less rain fell (from ${fix(rain[0])} mm to ${fix(rain[pk])} mm), so the forest dried out`,
        `A drier forest burns more easily, so more of it burned (from ${H(0)} to ${H(pk)} a year), destroying even more forest: the loop feeds itself`,
        `The data shows it speeding up: the area burned grew by ${over2(burned, 0)} thousand hectares from ${Y(0)} to ${Y(2)}, but by ${over2(burned, f)} thousand hectares from ${Y(f)} to ${Y(f + 2)}`],
      model: `From ${Y(0)} to ${Y(pk)} fires cut the forest cover from ${forest[0]}% to ${forest[pk]}%. With fewer trees giving off water vapor, the rainfall fell from ${fix(rain[0])} mm to ${fix(rain[pk])} mm, and the forest dried out. A drier forest burns more easily, so the area burned grew from ${H(0)} to ${H(pk)} a year, which destroyed even more forest. So the fires grew faster and faster: ${over2(burned, 0)} thousand hectares more from ${Y(0)} to ${Y(2)}, but ${over2(burned, f)} thousand hectares more from ${Y(f)} to ${Y(f + 2)}.`,
    },
    steady: {
      points: [`The big fires burned up the dry fuel on the forest floor: it fell from ${fix(fuel[pk - 1], 1)} tonnes per hectare in ${Y(pk - 1)} to ${fix(fuel[e], 1)} in ${Y(e)}`,
        'With less dry fuel left, new fires could not spread as far or burn as fiercely',
        `So the area burned fell, from ${H(pk)} in ${Y(pk)} to ${H(e)} in ${Y(e)}, even though the rainfall kept falling`,
        'The more that burns, the less fuel is left for the next fires: the loop pushes back against the burning and limits it'],
      model: `The biggest fires burned up the dry fuel on the forest floor, which fell from ${fix(fuel[pk - 1], 1)} tonnes per hectare in ${Y(pk - 1)} to ${fix(fuel[e], 1)} in ${Y(e)}. With less fuel to burn, new fires could not spread as far. So the area burned fell from ${H(pk)} in ${Y(pk)} to ${H(e)} in ${Y(e)}, even though the rainfall kept falling. The more that burns, the less fuel is left for the next fires, which limits the burning.`,
    },
    pairs: [
      { a: 'the forest cover', b: 'the area burned', balancing: false,
        points: ['More burning destroys forest; less forest means less rain and a drier forest, which burns more', `Each pushes the other further the same way: from ${Y(0)} to ${Y(pk)} the forest cover fell from ${forest[0]}% to ${forest[pk]}% while the area burned rose from ${H(0)} to ${H(pk)}`],
        model: `A reinforcing loop. Fires destroy forest, and a smaller forest makes less rain, so the forest that is left dries out and burns more. From ${Y(0)} to ${Y(pk)} the forest cover fell from ${forest[0]}% to ${forest[pk]}% while the area burned rose from ${H(0)} to ${H(pk)}.` },
      { a: 'the area burned', b: 'the dry fuel on the forest floor', balancing: true,
        points: ['Big fires burn up the dry fuel', `Less fuel means smaller fires, which works against the burning: as the fuel fell to ${fix(fuel[e], 1)} tonnes per hectare, the area burned dropped to ${H(e)}`],
        model: `A balancing loop. The more that burns, the less dry fuel is left, and with less fuel the next fires are smaller. As the fuel fell from ${fix(fuel[pk - 1], 1)} to ${fix(fuel[e], 1)} tonnes per hectare, the area burned dropped from ${H(pk)} to ${H(e)}.` },
    ],
    calc: [{ key: 'rain', i: 0, j: e, as: ['percent', 'rate'] }, { key: 'fuel', i: pk - 1, j: e, as: ['percent'] }],
    fastest: null,
  };
}

// a lake: algae use up the deep water's oxygen as they rot, and mud with little oxygen above it releases the phosphorus
// that feeds them; water fleas, eating the algae, hold them back
function lake(d) {
  const n = d.pick([9, 10]), y0 = d.int(2008, 2014), Y = (i) => y0 + i, e = n - 1, turn = n * d.pick([0.5, 0.55]) - 0.5, w = d.pick([1, 1.2]);
  const p = sCurve(n, turn, w), r = sCurve(n, turn + 1.5, w * 0.8);
  const P0 = d.int(16, 24), Pm = d.pick([3.2, 3.6, 4]), O0 = d.int(82, 95) / 10, O1 = d.int(15, 25) / 10, W0 = d.int(6, 10), dW = d.int(30, 42);
  const phos = p.map((x) => Math.round(wobble(d, P0 * (1 + (Pm - 1) * x), 0.5)));
  const fleas = r.map((x) => Math.round(wobble(d, W0 + dW * x, 0.5)));
  const algae = phos.map((P, i) => round(wobble(d, 0.5 * P * (1 - 0.55 * r[i]), 0.2), 1));
  const oxy = p.map((x) => round(wobble(d, O0 - (O0 - O1) * x, 0.05), 1));
  const pa = algae.indexOf(Math.max(...algae)), f = steepest2(phos), A = (i) => `${fix(algae[i], 1)} µg/L`;
  return {
    title: 'A lake turning green', y0, caption: `Summer measurements from the lake, ${Y(0)} to ${Y(e)}`,
    intro: '<p>Fertilizer washing off nearby farms added phosphorus to a lake. Algae need phosphorus to grow. When algae die they sink, and the bacteria that break them down use up oxygen in the deep water. The mud at the bottom of a lake releases phosphorus into the water when there is little oxygen above it. Water fleas are tiny animals that eat algae.</p><p>Biologists measured, every summer, the phosphorus in the water, the amount of algae (measured by their green pigment, chlorophyll), the oxygen in the deep water, and the number of water fleas.</p>',
    order: ['phos', 'algae', 'oxy', 'fleas'],
    cols: {
      phos: { head: 'Phosphorus (µg per liter)', name: 'the phosphorus in the water', unit: 'µg/L', dp: 0, values: phos },
      algae: { head: 'Algae, as chlorophyll (µg per liter)', name: 'the algae', unit: 'µg/L', dp: 1, values: algae },
      oxy: { head: 'Oxygen in the deep water (mg per liter)', name: 'the oxygen in the deep water', unit: 'mg/L', dp: 1, values: oxy },
      fleas: { head: 'Water fleas (per liter)', name: 'the water fleas', unit: 'per liter', dp: 0, values: fleas },
    },
    runaway: {
      points: [`As the algae grew (from ${A(0)} to ${A(pa)} between ${Y(0)} and ${Y(pa)}), more dead algae sank, and the bacteria breaking them down used up oxygen: the deep water’s oxygen fell from ${fix(oxy[0], 1)} to ${fix(oxy[pa], 1)} mg/L`,
        `With less oxygen above it, the mud released more phosphorus: phosphorus in the water rose from ${phos[0]} to ${phos[pa]} µg/L`,
        'More phosphorus feeds more algae, so the loop comes back round and makes the algae grow even more',
        `The data shows it speeding up: phosphorus rose by ${over2(phos, 0)} µg/L from ${Y(0)} to ${Y(2)}, but by ${over2(phos, f)} µg/L from ${Y(f)} to ${Y(f + 2)}`],
      model: `From ${Y(0)} to ${Y(pa)} the algae grew from ${A(0)} to ${A(pa)}. More dead algae sank and rotted, and the bacteria breaking them down used up oxygen, so the deep water’s oxygen fell from ${fix(oxy[0], 1)} to ${fix(oxy[pa], 1)} mg/L. With little oxygen above it, the mud released phosphorus, which rose from ${phos[0]} to ${phos[pa]} µg/L and fed even more algae. So it sped up: phosphorus rose by ${over2(phos, 0)} µg/L from ${Y(0)} to ${Y(2)}, but by ${over2(phos, f)} µg/L from ${Y(f)} to ${Y(f + 2)}.`,
    },
    steady: {
      points: [`With so much algae to eat, the water fleas multiplied: from ${fleas[pa - 1]} per liter in ${Y(pa - 1)} to ${fleas[e]} per liter in ${Y(e)}`,
        'Water fleas eat algae, so more water fleas eat more of the algae',
        `So the algae stopped growing and fell, from ${A(pa)} in ${Y(pa)} to ${A(e)} in ${Y(e)}, even though the phosphorus kept rising (to ${phos[e]} µg/L)`,
        'The more algae there is, the more water fleas there are to eat it: the loop pushes back against the algae’s growth'],
      model: `With plenty of algae to eat, the water fleas multiplied from ${fleas[pa - 1]} per liter in ${Y(pa - 1)} to ${fleas[e]} per liter in ${Y(e)}. The water fleas eat the algae, so the algae stopped growing and fell from ${A(pa)} in ${Y(pa)} to ${A(e)} in ${Y(e)}, even though the phosphorus kept rising to ${phos[e]} µg/L. The more algae there is, the more water fleas there are to eat it, which holds the algae back.`,
    },
    pairs: [
      { a: 'the algae', b: 'the phosphorus in the water', balancing: false,
        points: ['More algae means more rotting, less oxygen in the deep water, and more phosphorus released from the mud', `More phosphorus grows more algae, so each pushes the other further the same way: phosphorus rose from ${phos[0]} to ${phos[pa]} µg/L as the algae grew from ${A(0)} to ${A(pa)}`],
        model: `A reinforcing loop. More algae rot and use up the deep water’s oxygen, so the mud releases more phosphorus, which grows more algae. From ${Y(0)} to ${Y(pa)} the phosphorus rose from ${phos[0]} to ${phos[pa]} µg/L as the algae grew from ${A(0)} to ${A(pa)}.` },
      { a: 'the algae', b: 'the water fleas', balancing: true,
        points: ['More algae means more food, so the water fleas multiply', `More water fleas eat more algae, which works against the algae’s growth: as the fleas rose to ${fleas[e]} per liter, the algae fell to ${A(e)}`],
        model: `A balancing loop. More algae feeds more water fleas, and more water fleas eat more algae. As the fleas rose from ${fleas[pa - 1]} to ${fleas[e]} per liter, the algae fell from ${A(pa)} to ${A(e)}.` },
    ],
    calc: [{ key: 'phos', i: 0, j: e, as: ['percent', 'rate'] }, { key: 'oxy', i: 0, j: e, as: ['percent', 'rate'] }],
    fastest: 'phos',
  };
}

// predators and their prey: the prey breed faster the more of them there are; the predators raise more young when food
// is plentiful, eat the prey down, then go short themselves. Shaped from a typical cycle, peaking in year 4 or 5
const HUNTS = [
  { prey: 'rabbits', pred: 'foxes', predHead: 'Foxes', kid: 'cubs', per: 'family', place: 'On a large island where foxes are the only large hunters', top: [90, 140] },
  { prey: 'snowshoe hares', pred: 'lynx', predHead: 'Lynx', kid: 'kittens', per: 'family', place: 'In an area of northern forest', top: [30, 50] },
  { prey: 'voles', pred: 'barn owls', predHead: 'Pairs of barn owls', kid: 'chicks', per: 'pair', place: 'In a valley of farmland', top: [36, 60] },
];
function predators(d) {
  const h = d.pick(HUNTS), y0 = d.int(2008, 2014), Y = (i) => y0 + i, e = 9, early = d.chance(0.5);
  const preyShape = early ? [0.18, 0.27, 0.42, 0.66, 1, 0.72, 0.45, 0.34, 0.33, 0.38] : [0.12, 0.18, 0.27, 0.42, 0.66, 1, 0.72, 0.45, 0.34, 0.33];
  const predShape = early ? [0.3, 0.27, 0.29, 0.38, 0.58, 0.86, 1, 0.82, 0.6, 0.48] : [0.31, 0.3, 0.27, 0.29, 0.38, 0.58, 0.86, 1, 0.82, 0.6];
  const top = d.pick([8, 10, 12, 15]), predTop = d.int(...h.top), born = d.pick([1.2, 1.3, 1.4]);
  const prey = preyShape.map((x) => round(wobble(d, top * x, top * x * 0.03), 1));
  const young = prey.map((x) => round(wobble(d, born * x, born * x * 0.02), 1));
  const pred = predShape.map((x) => Math.round(wobble(d, predTop * x, predTop * x * 0.03)));
  const kids = prey.map((x) => round(wobble(d, 0.8 + 3.4 * (x / top) ** 1.3, 0.08), 1));
  const pR = prey.indexOf(Math.max(...prey)), pF = pred.indexOf(Math.max(...pred)), low = pR + prey.slice(pR).indexOf(Math.min(...prey.slice(pR)));
  const f = steepest2(prey.slice(0, pR + 1)), K = (i) => `${fix(prey[i], 1)} thousand`, P = h.pred, Q = h.prey;
  return {
    title: `${cap(P)} and ${Q}`, y0, caption: `Spring counts, ${Y(0)} to ${Y(e)}`,
    intro: `<p>${h.place}, ${P} hunt ${Q}, and ${Q} are their main food. When there is plenty to eat, ${P} raise more young.</p><p>Ecologists counted the ${Q} and the ${P} every spring for ten years. They also estimated how many young ${Q} were born each year, and how many young the ${P} raised in each ${h.per}.</p>`,
    order: ['prey', 'young', 'pred', 'kids'],
    cols: {
      prey: { head: `${cap(Q)} (thousands)`, name: `the number of ${Q}`, unit: 'thousand', dp: 1, values: prey },
      young: { head: `Young ${Q} born (thousands)`, name: `the number of young ${Q} born`, unit: 'thousand', dp: 1, values: young },
      pred: { head: h.predHead, name: `the number of ${P}`, unit: '', dp: 0, values: pred },
      kids: { head: `${cap(h.kid)} raised per ${h.per}`, name: `the ${h.kid} raised per ${h.per}`, unit: '', dp: 1, values: kids },
    },
    runaway: {
      points: [`While there were few ${P}, the ${Q} increased fast: from ${K(0)} in ${Y(0)} to ${K(pR)} in ${Y(pR)}`,
        `More ${Q} means more of them breeding, so more young were born each year: from ${fix(young[0], 1)} thousand to ${fix(young[pR], 1)} thousand`,
        `The young grow up and breed too, adding even more ${Q}: the more there are, the faster their numbers grow`,
        `The data shows it speeding up: the ${Q} rose by ${fix(over2(prey, 0), 1)} thousand from ${Y(0)} to ${Y(2)}, but by ${fix(over2(prey, f), 1)} thousand from ${Y(f)} to ${Y(f + 2)}`],
      model: `From ${Y(0)} to ${Y(pR)}, while there were few ${P}, the ${Q} grew from ${K(0)} to ${K(pR)}. More ${Q} meant more of them breeding, so the young born each year rose from ${fix(young[0], 1)} thousand to ${fix(young[pR], 1)} thousand. Those young grew up and bred too, adding even more ${Q}, so the more ${Q} there were, the faster their numbers grew. The rise sped up: ${fix(over2(prey, 0), 1)} thousand more from ${Y(0)} to ${Y(2)}, but ${fix(over2(prey, f), 1)} thousand more from ${Y(f)} to ${Y(f + 2)}.`,
    },
    steady: {
      points: [`With plenty of ${Q} to eat, the ${P} raised more young (${fix(kids[pR], 1)} ${h.kid} per ${h.per} in ${Y(pR)}, against ${fix(kids[0], 1)} in ${Y(0)}), so their numbers rose: from ${pred[pR - 1]} in ${Y(pR - 1)} to ${pred[pF]} in ${Y(pF)}`,
        `More ${P} eat more ${Q}, so the ${Q} fell: from ${K(pR)} in ${Y(pR)} to ${K(low)} in ${Y(low)}`,
        `With fewer ${Q} to eat, the ${P} raised fewer young (${fix(kids[low], 1)} per ${h.per} in ${Y(low)}) and their numbers fell, to ${pred[e]} by ${Y(e)}`,
        `Each change pushes the other back: the ${Q} and the ${P} keep each other’s numbers in check instead of running away`],
      model: `With plenty of ${Q} to eat, the ${P} raised more young, ${fix(kids[pR], 1)} ${h.kid} per ${h.per} in ${Y(pR)}, and their numbers rose from ${pred[pR - 1]} in ${Y(pR - 1)} to ${pred[pF]} in ${Y(pF)}. More ${P} ate more ${Q}, so the ${Q} fell from ${K(pR)} to ${K(low)} by ${Y(low)}. With less to eat, the ${P} raised fewer young (${fix(kids[low], 1)} per ${h.per}) and fell to ${pred[e]} by ${Y(e)}, which lets the ${Q} recover. Each change pushes the other back, so the two populations hold each other in check.`,
    },
    pairs: [
      { a: `the number of ${Q}`, b: `the number of young ${Q} born`, balancing: false,
        points: [`More ${Q} breed more young, and the young grow up to breed too`, `Each pushes the other further the same way: from ${Y(0)} to ${Y(pR)} the ${Q} rose from ${K(0)} to ${K(pR)} and the young born from ${fix(young[0], 1)} to ${fix(young[pR], 1)} thousand`],
        model: `A reinforcing loop. More ${Q} breed more young, and the young grow up and breed too, so the population grows faster the bigger it gets: from ${K(0)} to ${K(pR)} between ${Y(0)} and ${Y(pR)}.` },
      { a: `the number of ${Q}`, b: `the number of ${P}`, balancing: true,
        points: [`More ${Q} feed more ${P}, so the ${P} increase`, `More ${P} eat more ${Q}, which pushes the ${Q} back down: after the ${P} rose to ${pred[pF]}, the ${Q} fell to ${K(low)}`],
        model: `A balancing loop. More ${Q} feed more ${P}, and more ${P} eat the ${Q} back down. The ${P} rose to ${pred[pF]} by ${Y(pF)}, and the ${Q} fell from ${K(pR)} to ${K(low)}; with less food, the ${P} then fell to ${pred[e]}.` },
    ],
    calc: [{ key: 'prey', i: 0, j: pR, as: ['rate'] }, { key: 'pred', i: pR - 1, j: pF, as: ['percent'] }],
    fastest: 'prey',
  };
}

// a city's summers: hotter summers bring more air conditioning, whose waste heat and power-station CO₂ heat the city
// more; the city's white and planted roofs, added after hot summers, slow the warming
function cityHeat(d) {
  const n = d.pick([9, 10]), y0 = d.int(2008, 2014), Y = (i) => y0 + i, e = n - 1, turn = n * d.pick([0.5, 0.55]) - 0.5, w = d.pick([1.1, 1.3]);
  const p = sCurve(n, turn, w), q = sCurve(n, turn - 0.3, w), r = sCurve(n, turn + 1.2, w * 0.8);
  const T0 = d.int(270, 295) / 10, rise = d.int(14, 20) / 10, A0 = d.int(32, 45), dA = d.int(24, 32), roof0 = d.int(5, 15), dRoof = d.int(30, 45) * 10;
  const temp = q.map((x) => round(wobble(d, T0 + rise * x, 0.04), 1));
  const ac = p.map((x) => Math.round(wobble(d, A0 + dA * x, 0.4)));
  const elec = ac.map((a, i) => Math.round(wobble(d, a * 9 * (1 + 0.25 * (temp[i] - T0)), 4)));
  const co2 = elec.map((x) => Math.round(wobble(d, x * 0.45, 2)));
  const roofs = r.map((x) => Math.round(wobble(d, roof0 + dRoof * x, 2)));
  const f = steepest2(elec), b = Math.min(f + 2, e), tf = steepest2(temp), T = (i) => `${fix(temp[i], 1)} °C`;
  return {
    title: 'A city’s hot summers', y0, caption: `City records, ${Y(0)} to ${Y(e)}`,
    intro: '<p>Air conditioners cool a building by pumping heat out of it into the street, and they run on electricity, much of which comes from power stations that burn gas or coal and give off carbon dioxide (CO₂), a greenhouse gas. After hot summers, more people buy air conditioners. After a run of very hot summers, the city also began paying for roofs to be painted white or planted with gardens, which reflect sunlight and cool the air around them.</p><p>The city council recorded, every year, the average summer temperature, the share of homes with air conditioning, the electricity used for cooling, the CO₂ given off by the power stations that supply the city, and the area of white or planted roofs.</p>',
    order: ['temp', 'ac', 'elec', 'co2', 'roofs'],
    cols: {
      temp: { head: 'Average summer temperature (°C)', name: 'the average summer temperature', unit: '°C', dp: 1, values: temp },
      ac: { head: 'Homes with air conditioning (%)', name: 'the share of homes with air conditioning', unit: '%', dp: 0, values: ac },
      elec: { head: 'Electricity used for cooling (GWh)', name: 'the electricity used for cooling', unit: 'GWh', dp: 0, values: elec },
      co2: { head: 'CO₂ from the power stations (thousand tonnes)', name: 'the CO₂ from the power stations', unit: 'thousand tonnes', dp: 0, values: co2 },
      roofs: { head: 'White or planted roofs (hectares)', name: 'the area of white or planted roofs', unit: 'hectares', dp: 0, values: roofs },
    },
    runaway: {
      points: [`As the summers got hotter (from ${T(0)} in ${Y(0)} to ${T(b)} in ${Y(b)}), more homes got air conditioning: from ${ac[0]}% to ${ac[b]}%`,
        `More air conditioning used more electricity (from ${fix(elec[0])} to ${fix(elec[b])} GWh), so the power stations burned more fuel and gave off more CO₂ (from ${fix(co2[0])} to ${fix(co2[b])} thousand tonnes)`,
        'Air conditioners pump heat out into the streets, and the extra CO₂ traps more heat, so the city gets hotter still and even more people turn on air conditioning: the loop feeds itself',
        `The data shows it speeding up: the electricity used for cooling rose by ${fix(over2(elec, 0))} GWh from ${Y(0)} to ${Y(2)}, but by ${fix(over2(elec, f))} GWh from ${Y(f)} to ${Y(f + 2)}`],
      model: `Between ${Y(0)} and ${Y(b)} the summers got hotter, from ${T(0)} to ${T(b)}, and the share of homes with air conditioning rose from ${ac[0]}% to ${ac[b]}%. The air conditioners used more electricity, ${fix(elec[0])} GWh rising to ${fix(elec[b])} GWh, so the power stations gave off more CO₂, from ${fix(co2[0])} to ${fix(co2[b])} thousand tonnes. The air conditioners pump heat into the streets and the CO₂ traps more heat, so the city got hotter still, and even more people turned on air conditioning. So it sped up: the electricity rose by ${fix(over2(elec, 0))} GWh from ${Y(0)} to ${Y(2)}, but by ${fix(over2(elec, f))} GWh from ${Y(f)} to ${Y(f + 2)}.`,
    },
    steady: {
      points: [`After the hottest summers, the city made more roofs white or planted them: from ${fix(roofs[f])} hectares in ${Y(f)} to ${fix(roofs[e])} hectares in ${Y(e)}`,
        'White and planted roofs reflect sunlight and cool the air around them, so less of the sun’s energy heats the city',
        `So the warming slowed down: the temperature rose ${fix(over2(temp, tf), 1)} °C from ${Y(tf)} to ${Y(tf + 2)}, but only ${fix(over2(temp, e - 2), 1)} °C from ${Y(e - 2)} to ${Y(e)}`,
        'The hotter the summers, the more roofs are changed, which works against the warming: the loop steadies the temperature'],
      model: `After the hottest summers, the city paid for more white and planted roofs, from ${fix(roofs[f])} hectares in ${Y(f)} to ${fix(roofs[e])} hectares in ${Y(e)}. These roofs reflect sunlight and cool the air, so less of the sun’s energy heats the city. So the warming slowed: the temperature rose ${fix(over2(temp, tf), 1)} °C from ${Y(tf)} to ${Y(tf + 2)}, but only ${fix(over2(temp, e - 2), 1)} °C from ${Y(e - 2)} to ${Y(e)}. The hotter the summers, the more roofs are changed, which steadies the temperature.`,
    },
    pairs: [
      { a: 'the summer temperature', b: 'the share of homes with air conditioning', balancing: false,
        points: ['Hotter summers make more people use air conditioning, whose waste heat and power-station CO₂ make the city hotter still', `Each pushes the other further the same way: from ${Y(0)} to ${Y(b)} the temperature rose from ${T(0)} to ${T(b)} and air conditioning from ${ac[0]}% to ${ac[b]}% of homes`],
        model: `A reinforcing loop. Hotter summers bring more air conditioning, and air conditioning heats the streets and, through the power stations’ CO₂, traps more heat. From ${Y(0)} to ${Y(b)} the temperature rose from ${T(0)} to ${T(b)} as air conditioning spread from ${ac[0]}% to ${ac[b]}% of homes.` },
      { a: 'the summer temperature', b: 'the area of white or planted roofs', balancing: true,
        points: ['Hotter summers lead the city to change more roofs', `The changed roofs reflect sunlight and cool the city, working against the warming that led to them: the warming slowed as the roofs grew to ${fix(roofs[e])} hectares`],
        model: `A balancing loop. Hotter summers led the city to change more roofs, and white or planted roofs reflect sunlight and cool the city. As the roofs grew from ${fix(roofs[f])} to ${fix(roofs[e])} hectares, the temperature rose only ${fix(over2(temp, e - 2), 1)} °C in the last two years.` },
    ],
    calc: [{ key: 'elec', i: 0, j: e, as: ['percent', 'rate'] }, { key: 'co2', i: 0, j: e, as: ['percent', 'rate'] }],
    fastest: 'elec',
  };
}
const SYSTEMS = [arcticIce, permafrost, wildfires, lake, predators, cityHeat].map((system) => (d) => dataSet(d, system(d)));

// ---------- 3. experiments to plan, sketch and explain ----------
// Each experiment changes one thing on purpose: the parts ask for its variables, a sketch of the graph it should give
// (a line for each condition), the reason for the result in terms of energy transfer, a control variable, and one more:
// a calculation from its results, a prediction, or an improvement.
const SKETCH_NOTES = ['Lines that start at different temperatures lose the first mark: every condition starts the same.', 'Label the axes with units and say which line is which: an unlabeled line can’t earn the order mark.'];
const CONTROL_NOTES = ['“Keep everything the same” isn’t a variable: name one thing.', 'Say why it matters: how would the results change if it weren’t kept the same?'];
const WATER = 4180;
// a model sketch line: warming toward a steady temperature, or cooling toward room temperature (start, top, room as
// shares of the graph’s height; k how fast)
const warming = (start, top, k) => curve((x) => start + (top - start) * (1 - Math.exp(-k * x)));
const cooling = (start, room, k) => curve((x) => room + (start - room) * Math.exp(-k * x));
// the parts every experiment has, then its own extra part: spec { iv, dv ([right, [wrong…]]), variables (the working),
// sketch { ask, x, y, pens, model, points }, explain { ask, points, model, notes }, control { points, model }, extra }
function experiment(d, spec) {
  return [
    { kind: 'select', ask: 'What are the <b>independent</b> and <b>dependent</b> variables in this experiment?',
      fields: [field(d, 'Independent variable', spec.iv[0], spec.iv[1]), field(d, 'Dependent variable', spec.dv[0], spec.dv[1])], working: spec.variables },
    { kind: 'sketch', marks: 3, notes: SKETCH_NOTES, ...spec.sketch },
    { kind: 'written', lines: 5, marks: 3, ...spec.explain },
    { kind: 'written', ask: 'Give one variable the student should <b>control</b> to make this a fair test, and briefly explain why.', lines: 3, marks: 2, ...spec.control, notes: CONTROL_NOTES },
    spec.extra,
  ];
}
// how much energy some water took in or gave out, from its volume and temperature change: a calculation part
function waterEnergy({ ml, from, to, what }) {
  const kg = ml / 1000, dT = Math.abs(to - from), Q = kg * WATER * dT, out = to < from;
  return { kind: 'steps', ask: `${what} ${out ? 'cooled' : 'warmed'} from ${from} °C to ${to} °C. How much energy did the water ${out ? 'give out' : 'take in'}? (1 mL of water has a mass of 1 g, and water’s specific heat capacity is ${num(WATER)} J/(kg·°C).)`,
    topic: out ? 'Heat released while cooling' : 'Heat needed to warm something',
    steps: [{ label: 'Mass of the water in kg', value: kg, unit: 'kg', tol: 0.001 }, { label: `Temperature ${out ? 'drop' : 'rise'}`, value: dT, unit: '°C', tol: 0.001 }, { label: `Energy ${out ? 'given out' : 'taken in'}`, value: round(Q, 1), unit: 'J', tol: 0.01 }],
    working: `${ml} mL of water is ${ml} g = ${num(kg, 3)} kg. ΔT = ${Math.max(from, to)} − ${Math.min(from, to)} = ${dT} °C. Q = mcΔT = ${num(kg, 3)} × ${num(WATER)} × ${dT} = <b>${num(Q, 1)} J</b> (about ${num(Q / 1000, 1)} kJ).` };
}
const improvement = (points, model) => ({ kind: 'written', ask: 'Suggest one <b>improvement</b> to the experiment, and explain how it would make the results more reliable or more accurate.', lines: 3, marks: 2, points, model,
  notes: ['“Be more careful” or “do it again” on its own isn’t enough: say exactly what to change, and why it helps.'] });

// cans painted different colors, full of water, in the sun or under identical lamps: the darker the can, the more radiation
// it absorbs and the faster its water warms
function paintedCans(d) {
  const set = d.pick([['Matte black', 'White', 'Shiny silver'], ['Matte black', 'Dark blue', 'White'], ['Matte black', 'Shiny silver']]);
  const tops = { 'Matte black': [0.88, 3], 'Dark blue': [0.72, 2.7], White: [0.52, 2.4], 'Shiny silver': [0.38, 2.2] };
  const ml = d.pick([200, 250, 300, 330]), T0 = d.int(14, 20), mins = d.pick([30, 40]), sun = d.chance(0.5), rise = d.int(12, 24);
  const by = sun ? 'outside in strong sunshine, side by side' : 'under identical lamps, each 30 cm away';
  const order = set.length === 3 ? `then the ${set[1].toLowerCase()} can, with the ${set[2].toLowerCase()} can lowest` : `with the ${set[1].toLowerCase()} can lower`;
  const extra = d.pick([
    waterEnergy({ ml, from: T0, to: T0 + rise, what: `In ${mins} minutes, the water in the matte black can` }),
    { kind: 'choice', ask: 'The student adds a can painted <b>dark gray</b>. Where would you expect its line to be?', choices: ['Above the matte black can’s line', `Between the matte black can’s line and the ${set[1].toLowerCase()} can’s`, 'Below all the other lines'], correct: 1, working: '<b>Between them</b>: dark gray absorbs less radiation than matte black, but more than a lighter or shinier surface.',
      explain: { ask: 'Explain briefly.', lines: 2, marks: 1, points: ['A dark gray surface absorbs less of the radiation than matte black, but more than a lighter or shinier surface'],
        model: 'Between them: dark gray absorbs a little less radiation than matte black, but more than the lighter or shinier cans, so its water warms a little more slowly than the black can’s.' } },
    improvement(['A specific change: put a lid on every can, repeat with each can three times and average, stir before each reading, or use identical lamps instead of the sun', 'Says why it helps: lids stop energy escaping by evaporation, averages smooth out random errors, stirring gives one temperature to read, and lamps give every can the same steady radiation (clouds change sunlight)'],
      'Put an identical lid on each can, because without lids some energy escapes as water evaporates from the surface, and how much escapes could vary from can to can. Then the temperatures would show only the effect of the color.'),
  ]);
  return {
    title: 'Painted cans',
    intro: `<p>A student wants to find out how the color of a can affects how fast the water in it warms up. They take ${set.length === 3 ? 'three' : 'two'} identical steel cans and paint them: ${set.map((c) => c.toLowerCase()).join(', ').replace(/, ([^,]*)$/, ' and $1')}. Each can holds ${ml} mL of water at ${T0} °C, and the cans stand ${by}. The student measures the temperature of the water in each can every 5 minutes for ${mins} minutes.</p>`,
    parts: experiment(d, {
      iv: ['The color of the can', ['Time', 'The temperature of the water', 'The volume of water']],
      dv: ['How much the water’s temperature rises', ['The color of the can', 'Time', sun ? 'The amount of sunshine' : 'The power of the lamps']],
      variables: 'The student changes the <b>color of the can</b> on purpose, and measures <b>how much the water in each one warms up</b>. Time is when the readings are taken, not what is being compared.',
      sketch: { ask: `<b>Sketch</b> the graph of temperature against time you would expect for the ${set.length === 3 ? 'three' : 'two'} cans. Label the axes and each line.`, x: 'Time (minutes)', y: 'Temperature (°C)', pens: set,
        model: set.map((c, i) => ({ pen: i, pts: warming(0.12, tops[c][0], tops[c][1]) })),
        points: ['Every line starts at the same temperature', `The matte black can’s line rises fastest and ends highest, ${order}`, 'The lines curve, getting less steep, as each can starts to lose heat to the air as fast as it gains it', 'The axes are labeled with units (temperature in °C, time in minutes) and each line is labeled'] },
      explain: { ask: 'Using ideas about <b>energy transfer</b>, explain why the cans warm at different rates.',
        points: [`Energy reaches the cans from the ${sun ? 'sun' : 'lamps'} by radiation`, 'A matte black surface absorbs most of the radiation that falls on it, while a white or shiny surface reflects most of it', 'The energy absorbed passes through the metal by conduction and spreads through the water by convection, so the water’s particles move faster and its temperature rises', 'So the matte black can’s water gains energy fastest and warms the most'],
        model: `Energy reaches the cans from the ${sun ? 'sun' : 'lamps'} as radiation. The matte black can absorbs most of the radiation that falls on it, while ${set.includes('Shiny silver') ? 'the shiny silver can reflects most of it' : 'the white can reflects most of it'}. The absorbed energy passes through the metal by conduction and is carried through the water by convection, making its particles move faster, so its temperature rises. The black can gains energy fastest, so its water warms fastest.`,
        notes: ['Black doesn’t “attract heat”: it absorbs more of the radiation that reaches it.', 'Say how the energy gets in: radiation to the can, then conduction and convection into the water.'] },
      control: { points: ['Names a specific control variable, such as the volume of water, its starting temperature, the size and type of can, or each can’s distance from the lamp or place in the sun', 'Says why: for example, more water needs more energy to warm by each °C, so it would warm more slowly whatever its color, and the test would no longer compare only the colors'],
        model: `The volume of water in each can (${ml} mL). More water needs more energy to warm by each degree, so a can with more water would warm more slowly whatever its color, and the results wouldn’t show the effect of the color alone.` },
      extra,
    }),
  };
}

// hot water cooling in paper cups with and without a lid (and with a lid and a sleeve): a lid stops evaporation and the
// convection of warm air from the surface
function cupLids(d) {
  const three = d.chance(0.5), pens = three ? ['No lid', 'Lid', 'Lid and sleeve'] : ['No lid', 'Lid'], ks = [2.2, 1.2, 0.85];
  const ml = d.pick([200, 250, 300, 350]), T0 = d.pick([75, 80, 85, 90]), room = d.int(19, 23), mins = 20, drop = d.int(22, 32);
  const extra = d.pick([
    waterEnergy({ ml, from: T0, to: T0 - drop, what: `In ${mins} minutes, the water in the cup with no lid` }),
    { kind: 'choice', ask: 'The student pokes a small drinking hole in a lid and repeats the test. Where would you expect its line to be?', choices: ['Below the “No lid” line', 'Between the “No lid” and “Lid” lines', `Above the “${pens.at(-1)}” line`], correct: 1, working: '<b>Between them</b>: a little vapor and warm air escape through the hole.',
      explain: { ask: 'Explain briefly.', lines: 2, marks: 1, points: ['Some vapor and warm air can escape through the hole, so it loses energy faster than a sealed lid but much slower than no lid'],
        model: 'Between them: a little water vapor and warm air escape through the hole, so it loses more energy than with a sealed lid, but far less than an open cup.' } },
    improvement(['A specific change: repeat each cup three times and average, use a data logger, stir before each reading, or stand all the cups well away from drafts and windows', 'Says why it helps: averages smooth out random errors, a logger reads at exactly the right times, stirring gives one temperature to read, and drafts would cool one cup more than another'],
      'Repeat the test three times with each kind of cup and take the average temperature at each time, so that a one-off error, like a draft on one run, has less effect on the results.'),
  ]);
  return {
    title: 'Keeping a drink hot',
    intro: `<p>A café owner wants to know how much a lid keeps a hot drink warm. A student pours ${ml} mL of water at ${T0} °C into ${three ? 'three' : 'two'} identical paper cups: one is left open, ${three ? 'one has a tight plastic lid, and one has the same lid and a cardboard sleeve around it' : 'and one has a tight plastic lid'}. The cups stand on a bench in a room at ${room} °C, and the student records the temperature of the water every 2 minutes for ${mins} minutes.</p>`,
    parts: experiment(d, {
      iv: [three ? 'What covers the cup' : 'Whether the cup has a lid', ['Time', 'The temperature of the water', 'The size of the cup']],
      dv: ['How fast the water cools', [three ? 'What covers the cup' : 'Whether the cup has a lid', 'Time', 'The temperature of the room']],
      variables: `The student changes <b>${three ? 'what covers each cup' : 'whether the cup has a lid'}</b> on purpose, and measures <b>how fast the water in each one cools</b>.`,
      sketch: { ask: 'Sketch the graph of temperature against time you would expect for the cups. Label the axes and each line.', x: 'Time (minutes)', y: 'Temperature (°C)', pens,
        model: pens.map((_, i) => ({ pen: i, pts: cooling(0.88, 0.12, ks[i]) })),
        points: ['Every line starts at the same temperature', `The “No lid” line falls fastest and ends lowest, with the “${pens.at(-1)}” line staying highest`, 'The lines curve, getting less steep as the water gets closer to room temperature, and never go below it', 'The axes are labeled with units (temperature in °C, time in minutes) and each line is labeled'] },
      explain: { ask: 'Using ideas about <b>energy transfer</b>, explain why the lid changes how fast the water cools.',
        points: ['Without a lid, the fastest-moving water particles escape from the surface (evaporation), carrying energy away', 'Warm air above an open cup rises and is replaced by cooler air (convection), carrying more energy away', 'A lid traps a layer of air and stops the vapor escaping, so much less energy is lost by evaporation and convection', `Every cup loses some energy through its sides by conduction${three ? ', and the sleeve’s trapped air (a poor conductor) slows that too' : ''}`],
        model: `In the open cup, the fastest-moving water particles escape from the surface as vapor, taking energy with them, and the warm air above the water rises and is replaced by cooler air, which carries more energy away. A lid traps a still layer of air over the water and stops the vapor escaping, so much less energy is lost by evaporation and convection. ${three ? 'The cardboard sleeve traps air around the sides, and air is a poor conductor, so less energy leaves through the sides as well.' : 'Both cups still lose some energy through their sides by conduction.'}`,
        notes: ['“The lid keeps the heat in” isn’t enough: say how the energy would escape without it (evaporation and convection).'] },
      control: { points: ['Names a specific control variable, such as the volume of water, its starting temperature, the type of cup, or where the cups stand in the room', 'Says why: for example, a cup that starts hotter loses heat faster, because the difference from room temperature is bigger, so the comparison would be unfair'],
        model: `The starting temperature of the water (${T0} °C). Hotter water loses heat faster, because its difference from room temperature is bigger, so a cup that started hotter would cool faster whatever covered it.` },
      extra,
    }),
  };
}

// beakers of hot water wrapped in more and more layers of insulation: each layer traps air and slows conduction, but
// each extra layer helps a little less
function insulationLayers(d) {
  const stuff = d.pick(['felt', 'bubble wrap', 'cotton wool', 'newspaper']), ml = d.pick([150, 200, 250]), T0 = d.pick([70, 75, 80]), room = d.int(19, 23), mins = 20, drop = d.int(18, 26);
  const overTime = d.chance(0.5);
  const sketch = overTime
    ? { ask: 'Sketch the graph of temperature against time you would expect for the beakers with 0, 2 and 4 layers. Label the axes and each line.', x: 'Time (minutes)', y: 'Temperature (°C)', pens: ['No layers', '2 layers', '4 layers'],
      model: [2.1, 1.1, 0.8].map((k, i) => ({ pen: i, pts: cooling(0.88, 0.12, k) })),
      points: ['Every line starts at the same temperature', 'The beaker with no layers cools fastest and the one with 4 layers slowest', 'The gap between 2 and 4 layers is smaller than between none and 2: each extra layer helps less', 'The lines curve, getting less steep, and the axes and lines are labeled'] }
    : { ask: `Sketch the graph you would expect of the <b>temperature drop after ${mins} minutes</b> against the <b>number of layers</b>. Label the axes.`, x: 'Number of layers', y: `Temperature drop in ${mins} minutes (°C)`, pens: ['Temperature drop'],
      model: [{ pen: 0, pts: curve((x) => 0.2 + 0.68 * Math.exp(-2.6 * x)) }],
      points: ['The drop is biggest with no layers', 'The drop gets smaller as the number of layers goes up', 'Each extra layer makes less difference than the one before: the curve levels off but stays above zero', 'The axes are labeled with units'] };
  const extra = d.pick([
    waterEnergy({ ml, from: T0, to: T0 - drop, what: `In ${mins} minutes, the water in the beaker with no layers` }),
    improvement(['A specific change: put an identical lid on every beaker, repeat each and average, or use a data logger', 'Says why it helps: a lot of energy escapes from the open top by evaporation and convection, which the layers can’t stop, so lids let the results show the effect of the layers; averages smooth out random errors'],
      'Put an identical lid on every beaker. A lot of energy escapes from the open top of each beaker by evaporation and convection, which the layers do nothing to stop. With lids, more of the difference between the beakers would come from the layers themselves.'),
  ]);
  return {
    title: 'Layers of insulation',
    intro: `<p>A student investigates how much insulation keeps water hot. Five identical beakers are wrapped in 0, 1, 2, 3 and 4 layers of ${stuff}. Each beaker is filled with ${ml} mL of water at ${T0} °C, and they stand in a room at ${room} °C. The student measures ${overTime ? `the temperature of the water in each beaker every 2 minutes for ${mins} minutes` : `how much the water’s temperature has dropped in each beaker after ${mins} minutes`}.</p>`,
    parts: experiment(d, {
      iv: ['The number of layers of insulation', ['Time', 'The temperature of the water', 'The type of insulation']],
      dv: ['How much the water’s temperature drops', ['The number of layers of insulation', 'Time', 'The volume of water']],
      variables: 'The student changes the <b>number of layers</b> on purpose, and measures <b>how much the water’s temperature drops</b>.',
      sketch,
      explain: { ask: 'Using ideas about <b>energy transfer</b>, explain how the layers affect how fast the water cools.',
        points: ['Energy passes from the hot water through the glass and the insulation to the air by conduction', `${cap(stuff)} traps air in small pockets: air is a poor conductor, and trapped air can’t move to carry energy away by convection`, 'More layers trap more air, so energy passes through more slowly and the water cools less', 'Each extra layer helps less, because energy also escapes from the open top by evaporation and convection, which the layers don’t stop'],
        model: `The hot water loses energy through the glass by conduction, and then to the air. The ${stuff} traps air in small pockets, and air is a poor conductor that can’t carry energy away by convection while it is trapped, so each layer slows the flow of energy. More layers mean more trapped air and slower cooling. But some energy also escapes from the open top by evaporation and convection, which the layers don’t stop, so each extra layer makes less difference.`,
        notes: ['“Insulation keeps the heat in” isn’t enough: say what the insulation does (traps air, a poor conductor) to slow the energy down.'] },
      control: { points: [`Names a specific control variable, such as the volume of water, its starting temperature, the size of beaker, or using the same ${stuff} for every layer`, 'Says why: for example, a smaller volume of water has less energy to lose and cools faster, so it would look as if its insulation were worse'],
        model: `The volume of water in each beaker (${ml} mL). Less water cools faster, because it has less energy to lose for each degree, so a beaker with less water would seem to be less well insulated when it isn’t.` },
      extra,
    }),
  };
}

// equal masses of sand and water under identical lamps, then left to cool: sand, with its lower specific heat capacity,
// warms faster and cools faster
function sandAndWater(d) {
  const grams = d.pick([200, 250, 300, 400]), T0 = d.int(17, 22), on = d.pick([15, 20]), sandC = 830, rise = d.int(5, 9);
  const kg = grams / 1000, Q = kg * WATER * rise, sandRise = Q / (kg * sandC);
  const sandLine = curve((x) => (x <= 0.5 ? 0.12 + 0.72 * (1 - Math.exp(-5 * x)) : 0.12 + 0.72 * (1 - Math.exp(-2.5)) * Math.exp(-5 * (x - 0.5))), 25);
  const waterLine = curve((x) => (x <= 0.5 ? 0.12 + 0.6 * (1 - Math.exp(-1.2 * x)) : 0.12 + 0.6 * (1 - Math.exp(-0.6)) * Math.exp(-1.2 * (x - 0.5))), 25);
  const extra = d.pick([
    { kind: 'steps', ask: `While the lamps were on, the water warmed by ${rise} °C. If the sand had taken in the same amount of energy, by how much would its temperature have risen? (Specific heat capacities: water ${num(WATER)} J/(kg·°C), dry sand ${num(sandC)} J/(kg·°C).)`, topic: 'Same heat, different materials',
      steps: [{ label: 'Mass in kg', value: kg, unit: 'kg', tol: 0.001 }, { label: 'Energy the water took in', value: round(Q, 1), unit: 'J', tol: 0.01 }, { label: 'Temperature rise of the sand', value: round(sandRise, 2), unit: '°C', tol: 0.02 }],
      working: `m = ${grams} g = ${num(kg)} kg. The water took in Q = mcΔT = ${num(kg)} × ${num(WATER)} × ${rise} = ${num(Q, 1)} J. The same energy in the sand: ΔT = Q ÷ (mc) = ${num(Q, 1)} ÷ (${num(kg)} × ${num(sandC)}) ≈ <b>${num(sandRise, 1)} °C</b>, about five times as much, because sand’s specific heat capacity is about a fifth of water’s.` },
    { kind: 'written', ask: 'Use the results to explain why towns by the sea are often cooler in summer, and warmer on winter nights, than towns far inland.', lines: 4, marks: 2,
      points: ['The sea (water) has a high specific heat capacity, so it warms up slowly in summer and keeps the air near it cooler', 'For the same reason it cools slowly, so it stays warmer than the land in winter and at night, and warms the air near it'],
      model: 'Water has a much higher specific heat capacity than land, so the sea warms slowly in summer, and the air over it, which blows over seaside towns, stays cooler. In winter and at night the sea also cools slowly, so it stays warmer than the land and keeps the air near the coast warmer. Inland, the ground warms and cools quickly, like the sand.' },
    improvement(['A specific change: put the thermometers at the same depth in each dish, stir the water (or mix the sand) before each reading, repeat and average, or use a data logger', 'Says why it helps: the sand’s surface gets much hotter than the sand underneath, so readings at different depths aren’t comparable; averages smooth out random errors'],
      'Put both thermometers at exactly the same depth, about 1 cm below the surface. The top of the sand gets much hotter than the sand underneath, so a thermometer a little deeper in the sand would give a very different reading, and the comparison with the water wouldn’t be fair.'),
  ]);
  return {
    title: 'Sand and water',
    intro: `<p>At the beach on a sunny day, the sand gets hot while the sea stays cool. To find out why, a student puts ${grams} g of dry sand and ${grams} g of water in two identical dishes, each with a thermometer just under the surface, at ${T0} °C. Both dishes go under identical lamps for ${on} minutes, then the lamps are switched off for ${on} minutes. The student reads both thermometers every minute.</p>`,
    parts: experiment(d, {
      iv: ['The material: sand or water', ['Time', 'The power of the lamps', 'The temperature']],
      dv: ['How much the temperature changes', ['The material: sand or water', 'Time', 'The mass in each dish']],
      variables: 'The student compares two <b>materials, sand and water</b> (the independent variable), and measures <b>how much each one’s temperature changes</b> (the dependent variable).',
      sketch: { ask: `Sketch the graph of temperature against time you would expect for the sand and the water, over the whole ${2 * on} minutes. Label the axes and each line.`, x: 'Time (minutes)', y: 'Temperature (°C)', pens: ['Sand', 'Water'],
        model: [{ pen: 0, pts: sandLine }, { pen: 1, pts: waterLine }],
        points: ['Both lines start at the same temperature', 'While the lamps are on, the sand’s temperature rises much faster and higher than the water’s', 'After the lamps go off, the sand cools faster than the water, which cools only slowly', 'The axes are labeled with units, each line is labeled, and the moment the lamps go off can be seen'] },
      explain: { ask: 'Using ideas about <b>energy</b>, explain the difference between the sand and the water.',
        points: ['The identical lamps give both dishes the same energy every second, by radiation', `Sand has a much lower specific heat capacity than water (about ${num(sandC)} J/(kg·°C) against ${num(WATER)} J/(kg·°C)), so the same energy raises its temperature much more`, 'In the water, convection currents carry the energy down through all of it; in the sand, a poor conductor that can’t flow, the energy stays near the top', 'With its lower specific heat capacity (and its hot surface), the sand also loses its energy and cools faster once the lamps are off'],
        model: `The lamps give the sand and the water the same energy every second. Sand’s specific heat capacity is about a fifth of water’s, so each joule warms it far more and its temperature shoots up. The water also spreads its energy through the whole dish by convection, while the sand can’t flow and conducts poorly, so its energy stays near the surface where the thermometer is. Once the lamps go off, the sand loses its energy quickly and cools fast, while the water cools slowly.`,
        notes: ['“Sand absorbs more heat” is wrong: both get the same energy. It’s how much each °C costs.'] },
      control: { points: ['Names a specific control variable, such as the mass of sand and water, the lamps’ power and distance, the starting temperature, the dishes, or the depth of the thermometers', 'Says why: for example, a bigger mass needs more energy to warm by each °C, so it would warm more slowly and the comparison wouldn’t be fair'],
        model: `The mass in each dish (${grams} g). A bigger mass needs more energy for each degree it warms, so if there were more water than sand, the water would warm more slowly partly because of its mass, not only because it is water.` },
      extra,
    }),
  };
}

// hot water cooling in mugs of different materials: a metal mug conducts energy out through its walls fastest
function mugMaterials(d) {
  const middle = d.pick(['Ceramic mug', 'Glass mug']), pens = ['Steel mug', middle, 'Plastic mug'], ks = [2.1, 1.45, 1.0];
  const ml = d.pick([200, 250, 300]), T0 = d.pick([75, 80, 85]), room = d.int(19, 23), mins = 20, drop = d.int(25, 35);
  const extra = d.pick([
    waterEnergy({ ml, from: T0, to: T0 - drop, what: `In ${mins} minutes, the water in the steel mug` }),
    { kind: 'choice', ask: 'The student also tests a <b>double-walled steel mug</b>, with a vacuum between its two walls. Where would you expect its line to be?', choices: ['Below the steel mug’s line', 'Between the steel and plastic mugs’ lines', 'Above all the other lines'], correct: 2, working: '<b>Above all the others</b>: no energy crosses the vacuum by conduction or convection.',
      explain: { ask: 'Explain briefly.', lines: 3, marks: 2, points: ['A vacuum has no particles, so no energy can cross it by conduction or convection', 'Only a little energy crosses by radiation (and through the rim), so its water cools slowest of all'],
        model: 'Above all the others. The vacuum between the walls has no particles in it, so energy can’t cross it by conduction or convection; only a little crosses by radiation and through the rim. So the water in it cools the slowest.' } },
    improvement(['A specific change: put an identical lid on every mug, repeat each mug and average, or stir before each reading', 'Says why it helps: much of the energy escapes from the open top by evaporation, the same for every mug, which hides the difference the walls make; averages smooth out random errors'],
      'Put an identical lid on each mug. Without lids a lot of the energy escapes from the open top by evaporation and convection, the same for every mug, so the difference made by the walls is harder to see.'),
  ]);
  return {
    title: 'Which mug keeps a drink hot?',
    intro: `<p>A student wants to know which mug keeps a hot drink warm the longest. They have three mugs of the same size, shape and wall thickness, made of steel, ${middle.split(' ')[0].toLowerCase()} and plastic. The student pours ${ml} mL of water at ${T0} °C into each mug and records the temperature of the water every 2 minutes for ${mins} minutes, in a room at ${room} °C.</p>`,
    parts: experiment(d, {
      iv: ['The material of the mug', ['Time', 'The temperature of the water', 'The size of the mug']],
      dv: ['How fast the water cools', ['The material of the mug', 'Time', 'The temperature of the room']],
      variables: 'The student changes the <b>material of the mug</b> on purpose, and measures <b>how fast the water in each one cools</b>.',
      sketch: { ask: 'Sketch the graph of temperature against time you would expect for the three mugs. Label the axes and each line.', x: 'Time (minutes)', y: 'Temperature (°C)', pens,
        model: pens.map((_, i) => ({ pen: i, pts: cooling(0.88, 0.12, ks[i]) })),
        points: ['Every line starts at the same temperature', `The steel mug’s line falls fastest, then the ${middle.toLowerCase()}’s, with the plastic mug’s line staying highest`, 'The lines curve, getting less steep as the water gets closer to room temperature, and never go below it', 'The axes are labeled with units (temperature in °C, time in minutes) and each line is labeled'] },
      explain: { ask: 'Using ideas about <b>energy transfer</b>, explain why the water cools at different rates in the three mugs.',
        points: ['Energy passes from the hot water through the mug’s wall by conduction, then from the outside of the mug to the air (by convection and radiation)', 'Steel is a metal and a good conductor: its free electrons carry energy through the wall quickly', `${middle.split(' ')[0]} conducts less well, and plastic is a poor conductor (an insulator), so energy passes through their walls more slowly`, 'So the water in the steel mug loses energy fastest and cools fastest, and the water in the plastic mug cools slowest'],
        model: `The hot water loses energy through the wall of its mug by conduction, and the outside of the mug passes it on to the air. Steel is a metal, and its free electrons carry energy through the wall quickly, so the water in the steel mug loses energy fastest. ${middle.split(' ')[0]} conducts less well, and plastic is a poor conductor, so energy passes through their walls more slowly. So the water cools fastest in the steel mug and slowest in the plastic one.`,
        notes: ['“Metal is cold” isn’t a reason: say that it conducts energy away faster.'] },
      control: { points: ['Names a specific control variable, such as the volume of water, its starting temperature, the mugs’ size, shape and wall thickness, or whether they have lids', 'Says why: for example, a thicker wall slows conduction, so a mug with thicker walls would keep the water hotter whatever it was made of'],
        model: 'The thickness of the mugs’ walls. A thicker wall slows the energy passing through it, so a mug with a thicker wall would keep the water hotter for a reason that has nothing to do with its material.' },
      extra,
    }),
  };
}

// a model solar water heater with and without a clear cover: the cover lets the light in and traps the warm air
function solarHeater(d) {
  const ml = d.pick([300, 400, 500]), T0 = d.int(16, 21), mins = d.pick([30, 40]), rise = d.int(10, 20), cover = d.pick(['clear plastic', 'glass']);
  const pens = [`With a ${cover} cover`, 'Without a cover'];
  const extra = d.pick([
    waterEnergy({ ml, from: T0, to: T0 + rise, what: `In ${mins} minutes, the water in the covered heater` }),
    { kind: 'choice', ask: 'The student paints the inside of the covered box <b>white</b> instead of black and repeats the test. What happens to how fast its water warms?', choices: ['It warms faster', 'It warms more slowly', 'It makes no difference'], correct: 1, working: '<b>More slowly</b>: white reflects most of the light instead of absorbing it.',
      explain: { ask: 'Explain briefly.', lines: 2, marks: 1, points: ['A white surface reflects most of the light instead of absorbing it, so less energy reaches the water'],
        model: 'More slowly: a white surface reflects most of the light that comes through the cover instead of absorbing it, so less energy passes to the water.' } },
    improvement(['A specific change: repeat the test and average, put both heaters under the same lamp position by swapping them halfway, or use a data logger', 'Says why it helps: averages smooth out random errors; swapping makes sure one lamp isn’t stronger than the other'],
      'Repeat the test three times and average the results, swapping which lamp each heater stands under, so that a lamp that is slightly stronger doesn’t make one heater look better than it is.'),
  ]);
  return {
    title: 'A model solar water heater',
    intro: `<p>A student builds two model solar water heaters. Each is a shallow box painted matte black inside, holding a flat tray with ${ml} mL of water at ${T0} °C. The two are identical, except that one has a ${cover} cover over the top and the other is open. Both stand under identical lamps, and the student records the temperature of the water in each every 5 minutes for ${mins} minutes.</p>`,
    parts: experiment(d, {
      iv: ['Whether the heater has a cover', ['Time', 'The temperature of the water', 'The color of the box']],
      dv: ['How much the water’s temperature rises', ['Whether the heater has a cover', 'Time', 'The power of the lamps']],
      variables: 'The student changes <b>whether the heater has a cover</b> on purpose, and measures <b>how much the water in each one warms up</b>.',
      sketch: { ask: 'Sketch the graph of temperature against time you would expect for the two heaters. Label the axes and each line.', x: 'Time (minutes)', y: 'Temperature (°C)', pens,
        model: [{ pen: 0, pts: warming(0.12, 0.86, 2.6) }, { pen: 1, pts: warming(0.12, 0.55, 2.4) }],
        points: ['Both lines start at the same temperature', 'The covered heater’s line rises faster and ends higher', 'The lines curve, getting less steep, as each heater loses heat as fast as it gains it', 'The axes are labeled with units (temperature in °C, time in minutes) and each line is labeled'] },
      explain: { ask: 'Using ideas about <b>energy transfer</b>, explain why the cover makes a difference.',
        points: ['Light from the lamp passes through the clear cover and is absorbed by the black inside of the box, which warms the water', 'Without a cover, the warm air above the water rises and is replaced by cooler air (convection), carrying energy away, and water evaporates from the surface', 'The cover traps the warm air and the vapor, so much less energy escapes by convection and evaporation (and it also stops some of the infrared the warm box gives off)', 'So the covered heater keeps more of the energy it absorbs, and its water warms faster and ends hotter'],
        model: `Light passes straight through the ${cover} cover and is absorbed by the black box, which warms the water. In the open heater, the warm air above the water rises away and is replaced by cooler air, and water evaporates, so a lot of the energy is carried off by convection and evaporation. The cover traps the warm air and the vapor, and stops some of the infrared the warm box gives off, so the covered heater keeps more of its energy and its water warms faster.`,
        notes: ['“The cover keeps the heat in” isn’t enough: say how the energy would escape without it.'] },
      control: { points: ['Names a specific control variable, such as the volume of water, its starting temperature, the lamps’ power and distance, or the color and size of the boxes', 'Says why: for example, a lamp that is closer gives a heater more energy every second, so its water would warm faster whether or not it had a cover'],
        model: 'The distance from each lamp to its heater. A closer lamp gives the heater more energy every second, so that heater’s water would warm faster whether or not it had a cover, and the test wouldn’t show the effect of the cover alone.' },
      extra,
    }),
  };
}
const EXPERIMENTS = [paintedCans, cupLids, insulationLayers, sandAndWater, mugMaterials, solarHeater];

// ---------- 4. problem solving ----------
// Calculations in steps, each a box with its own mark: a cube, a box or a cylinder's volume, its mass from the density,
// Q = mcΔT, heaters, mixing, efficiency and cost, and food calories. Show every step: a right step still earns its mark
// when the final answer is wrong.
const SHOW = '<p>Show all the steps of your working, and use the formula guide.</p>';
const EFFICIENCY = '<li>Percentage of the energy that is useful: <span class="f">useful energy ÷ energy supplied × 100</span></li>';
const KWH = '<li>1 kW = 1000 W · 1 kWh = 3,600,000 J · cost = energy in kWh × price per kWh</li>';

// a solid cube: its volume, mass and the heat to warm it; a heater's time; the heat it gives out cooling; and the rise
// the same heat gives another material of the same mass
const SOLIDS = [['aluminum', 2700, 900], ['copper', 8960, 385], ['iron', 7870, 450], ['zinc', 7140, 390], ['granite', 2700, 790]];
function heatingACube(d) {
  const [name, rho, c] = d.pick(SOLIDS), a = d.pick([4, 5, 6, 8, 10, 12]), T1 = d.int(15, 22), dT = d.pick([40, 50, 60, 75, 80]), T2 = T1 + dT;
  const cm3 = a ** 3, m3 = cm3 / 1e6, kg = rho * m3, Q = kg * c * dT;
  const P = d.pick([25, 50, 100, 150, 200, 250, 500, 1000].filter((p) => Q / p / 60 >= 3 && Q / p / 60 <= 45));
  const T3 = T1 + d.int(5, 15), drop = T2 - T3, out = kg * c * drop;
  const [other, , c2] = d.pick(SOLIDS.filter((s) => s[0] !== name && s[2] !== c && s[2] >= c / 3)), dT2 = Q / (kg * c2);
  return {
    title: `A cube of ${name}`,
    intro: `<p>An engineer is testing a solid cube of ${name} with sides of ${a} cm. ${cap(name)} has a density of ${num(rho)} kg/m³ and a specific heat capacity of ${num(c)} J/(kg·°C).</p>${SHOW}`,
    parts: [
      { kind: 'steps', ask: `How much heat is needed to warm the cube from ${T1} °C to ${T2} °C?`, topic: 'Heat needed to warm something',
        steps: [{ label: 'Volume of the cube in cm³', value: cm3, unit: 'cm³', tol: 0.001 }, { label: 'Volume in m³', value: m3, unit: 'm³', tol: 0.01 }, { label: 'Mass of the cube', value: round(kg, 4), unit: 'kg', tol: 0.01 }, { label: 'Heat needed', value: round(Q, 0), unit: 'J', tol: 0.015 }],
        working: `V = a³ = ${a}³ = ${num(cm3)} cm³ = ${num(cm3)} ÷ 1,000,000 = ${sig(m3, 3)} m³. m = ρV = ${num(rho)} × ${sig(m3, 3)} = ${num(kg, 4)} kg. ΔT = ${T2} − ${T1} = ${dT} °C, so Q = mcΔT = ${num(kg, 4)} × ${num(c)} × ${dT} ≈ <b>${num(Q, 0)} J</b>.` },
      { kind: 'steps', ask: `The cube is warmed by a ${P} W heater. If all the heater’s energy goes into the cube, how many <b>minutes</b> does it take to warm it from ${T1} °C to ${T2} °C?`, topic: 'Electric heater',
        steps: [{ label: 'Time in seconds', value: round(Q / P, 1), unit: 's', tol: 0.015 }, { label: 'Time in minutes', value: round(Q / P / 60, 2), unit: 'minutes', tol: 0.015 }],
        working: `Q = P × t, so t = Q ÷ P = ${num(Q, 0)} ÷ ${P} ≈ ${num(Q / P, 0)} s, and ÷ 60 ≈ <b>${num(Q / P / 60, 1)} minutes</b>.` },
      { kind: 'steps', ask: `The hot cube is then left on a bench, where it cools from ${T2} °C to ${T3} °C. How much heat does it give out? Give your answer in <b>kJ</b>.`, topic: 'Heat released while cooling',
        steps: [{ label: 'Temperature drop', value: drop, unit: '°C', tol: 0.001 }, { label: 'Heat given out in J', value: round(out, 0), unit: 'J', tol: 0.015 }, { label: 'Heat given out in kJ', value: round(out / 1000, 3), unit: 'kJ', tol: 0.015 }],
        working: `ΔT = ${T2} − ${T3} = ${drop} °C. Q = mcΔT = ${num(kg, 4)} × ${num(c)} × ${drop} ≈ ${num(out, 0)} J = <b>${num(out / 1000, 2)} kJ</b>.` },
      { kind: 'steps', ask: `A block of ${other} with the <b>same mass</b> takes in the same heat as the cube did in (a). Its specific heat capacity is ${num(c2)} J/(kg·°C). By how much does its temperature rise?`, topic: 'Same heat, different materials',
        steps: [{ label: 'Temperature rise', value: round(dT2, 2), unit: '°C', tol: 0.015, marks: 2 }],
        working: `ΔT = Q ÷ (mc) = ${num(Q, 0)} ÷ (${num(kg, 4)} × ${num(c2)}) ≈ <b>${num(dT2, 1)} °C</b>. (The same mass and heat, so ΔT is ${dT} × ${num(c)} ÷ ${num(c2)}: ${c2 < c ? 'a lower specific heat capacity, a bigger rise' : 'a higher specific heat capacity, a smaller rise'}.)` },
    ],
  };
}

// a cylindrical hot-water tank: its volume and the water's mass, the heat to warm it, the element's time, its efficiency
// and the cost
function hotWaterTank(d) {
  const r = d.pick([20, 22.5, 25, 27.5, 30]), h = d.pick([80, 90, 100, 110, 120]), T1 = d.int(10, 16), T2 = d.pick([55, 60, 65]), kW = d.pick([2, 2.5, 3]);
  const m3 = Math.PI * (r / 100) ** 2 * (h / 100), kg = m3 * 1000, Q = kg * WATER * (T2 - T1), t = Q / (kW * 1000);
  const mins = Math.round(t / d.pick([0.82, 0.85, 0.88, 0.9]) / 60), E = kW * 1000 * mins * 60, pct = (Q / E) * 100, price = d.pick([0.15, 0.18, 0.2, 0.22, 0.25, 0.3]), kWh = E / 3.6e6;
  return {
    title: 'A hot-water tank',
    intro: `<p>A home’s hot-water tank is a cylinder with an inside radius of ${num(r, 1)} cm and a height of ${h} cm, full of water. An electric heating element of ${num(kW, 1)} kW inside it warms the water from ${T1} °C, the temperature it comes in at, to ${T2} °C. The density of water is 1,000 kg/m³, and its specific heat capacity is ${num(WATER)} J/(kg·°C).</p>${SHOW}`,
    guide: `<ul>${EFFICIENCY}${KWH}</ul>`,
    parts: [
      { kind: 'steps', ask: `How much heat is needed to warm the full tank of water from ${T1} °C to ${T2} °C?`, topic: 'Heat needed to warm something',
        steps: [{ label: 'Volume of the tank in m³', value: round(m3, 5), unit: 'm³', tol: 0.015 }, { label: 'Mass of the water', value: round(kg, 2), unit: 'kg', tol: 0.015 }, { label: 'Heat needed', value: round(Q, 0), unit: 'J', tol: 0.015 }],
        working: `In meters, r = ${num(r / 100, 3)} m and h = ${num(h / 100, 2)} m, so V = πr²h = π × ${num(r / 100, 3)}² × ${num(h / 100, 2)} ≈ ${num(m3, 4)} m³. m = ρV = 1,000 × ${num(m3, 4)} ≈ ${num(kg, 1)} kg. Q = mcΔT = ${num(kg, 1)} × ${num(WATER)} × (${T2} − ${T1}) ≈ <b>${num(Q, 0)} J</b> (about ${num(Q / 1e6, 1)} million J).` },
      { kind: 'steps', ask: `If all of the element’s energy went into the water, how long would it take to heat the tank? Give your answer in <b>hours</b>.`, topic: 'Electric heater',
        steps: [{ label: 'Power in W', value: kW * 1000, unit: 'W', tol: 0.001 }, { label: 'Time in seconds', value: round(t, 0), unit: 's', tol: 0.015 }, { label: 'Time in hours', value: round(t / 3600, 3), unit: 'hours', tol: 0.015 }],
        working: `${num(kW, 1)} kW = ${num(kW * 1000)} W. t = Q ÷ P = ${num(Q, 0)} ÷ ${num(kW * 1000)} ≈ ${num(t, 0)} s, and ÷ 3600 ≈ <b>${num(t / 3600, 2)} hours</b>.` },
      { kind: 'steps', ask: `In fact the element takes ${mins} minutes to heat the tank, because some energy escapes through the tank’s walls. What <b>percentage</b> of the energy it supplies heats the water?`,
        steps: [{ label: 'Energy the element supplies', value: E, unit: 'J', tol: 0.01 }, { label: 'Percentage that heats the water', value: round(pct, 1), unit: '%', tol: 0.015 }],
        working: `It supplies Q = P × t = ${num(kW * 1000)} × (${mins} × 60) = ${num(E)} J. The water takes in ${num(Q, 0)} J, so ${num(Q, 0)} ÷ ${num(E)} × 100 ≈ <b>${num(pct, 1)}%</b> heats the water.` },
      { kind: 'steps', ask: `Electricity costs $${price.toFixed(2)} per kWh. How much does it cost to heat the tank, using the energy the element really supplies?`,
        steps: [{ label: 'Energy supplied in kWh', value: round(kWh, 3), unit: 'kWh', tol: 0.01 }, { label: 'Cost in dollars', value: round(kWh * price, 3), unit: 'dollars', tol: 0.02 }],
        working: `${num(E)} J ÷ 3,600,000 ≈ ${num(kWh, 2)} kWh (or ${num(kW, 1)} kW × ${num(mins / 60, 3)} h). Cost = ${num(kWh, 2)} × $${price.toFixed(2)} ≈ <b>$${(kWh * price).toFixed(2)}</b>.` },
    ],
  };
}

// a fish tank: the water's volume and mass from a box, the temperature a heater brings it to, the heat it loses
// overnight, and the time to put it back
function fishTank(d) {
  const sizes = [];
  for (const l of [60, 80, 100, 120]) for (const w of [30, 35, 40]) for (const h of [30, 35, 40, 45]) for (const P of [100, 150, 200, 250, 300]) for (const hrs of [2, 3, 4, 5]) {
    const rise = (P * hrs * 3600) / ((l * w * h) / 1000 * WATER);
    if (rise >= 2 && rise <= 8) sizes.push([l, w, h, P, hrs]);
  }
  const [l, w, h, P, hrs] = d.pick(sizes), cm3 = l * w * h, L = cm3 / 1000, T1 = d.int(17, 21), E = P * hrs * 3600, rise = E / (L * WATER), T2 = T1 + rise;
  const night = round(T2, 0) - d.int(2, 5), drop = round(T2, 0) - night, lost = L * WATER * drop, back = lost / P;
  return {
    title: 'A fish tank',
    intro: `<p>A fish tank is ${l} cm long and ${w} cm wide, and is filled with water to a depth of ${h} cm. Its heater has a power of ${P} W. One liter of water has a mass of 1 kg, and water’s specific heat capacity is ${num(WATER)} J/(kg·°C).</p>${SHOW}`,
    parts: [
      { kind: 'steps', ask: 'What is the <b>mass</b> of the water in the tank?',
        steps: [{ label: 'Volume of the water in cm³', value: cm3, unit: 'cm³', tol: 0.001 }, { label: 'Volume in liters', value: L, unit: 'L', tol: 0.001 }, { label: 'Mass of the water', value: L, unit: 'kg', tol: 0.001 }],
        working: `V = l × w × h = ${l} × ${w} × ${h} = ${num(cm3)} cm³. 1 L = 1000 cm³ (1000 mL), so that is ${num(cm3)} ÷ 1000 = ${num(L, 1)} L, which has a mass of <b>${num(L, 1)} kg</b>.` },
      { kind: 'steps', ask: `The water starts at ${T1} °C and the heater runs for ${hrs} hours. If all its energy goes into the water, what is the water’s <b>final temperature</b>?`, topic: 'Final temperature',
        steps: [{ label: 'Energy the heater supplies', value: E, unit: 'J', tol: 0.01 }, { label: 'Temperature rise', value: round(rise, 2), unit: '°C', tol: 0.015 }, { label: 'Final temperature', value: round(T2, 2), unit: '°C', tol: { abs: 0.1 } }],
        working: `t = ${hrs} × 3600 = ${num(hrs * 3600)} s, so Q = P × t = ${P} × ${num(hrs * 3600)} = ${num(E)} J. ΔT = Q ÷ (mc) = ${num(E)} ÷ (${num(L, 1)} × ${num(WATER)}) ≈ ${num(rise, 2)} °C, so the water ends at ${T1} + ${num(rise, 2)} ≈ <b>${num(T2, 1)} °C</b>.` },
      { kind: 'steps', ask: `One night the heater breaks, and the water cools from ${round(T2, 0)} °C to ${night} °C by morning. How much energy did the water lose? Give your answer in <b>kJ</b>.`, topic: 'Heat released while cooling',
        steps: [{ label: 'Energy lost in J', value: round(lost, 0), unit: 'J', tol: 0.01 }, { label: 'Energy lost in kJ', value: round(lost / 1000, 2), unit: 'kJ', tol: 0.01 }],
        working: `ΔT = ${round(T2, 0)} − ${night} = ${drop} °C. Q = mcΔT = ${num(L, 1)} × ${num(WATER)} × ${drop} = ${num(lost, 0)} J = <b>${num(lost / 1000, 1)} kJ</b>.` },
      { kind: 'steps', ask: 'Once it is mended, how long will the heater take to put that energy back? Give your answer in <b>hours</b>.', topic: 'Electric heater',
        steps: [{ label: 'Time in seconds', value: round(back, 0), unit: 's', tol: 0.015 }, { label: 'Time in hours', value: round(back / 3600, 3), unit: 'hours', tol: 0.015 }],
        working: `t = Q ÷ P = ${num(lost, 0)} ÷ ${P} ≈ ${num(back, 0)} s, and ÷ 3600 ≈ <b>${num(back / 3600, 2)} hours</b> (if none of it escapes as it warms).` },
    ],
  };
}

// a metal cylinder: its density from its size and mass, then its specific heat capacity from mixing it, hot, into
// cold water; which metal it is; and a prediction with more water
const IDENTIFY = [['aluminum', 2.7, 900], ['iron', 7.87, 450], ['copper', 8.96, 385], ['silver', 10.49, 240], ['lead', 11.34, 130]];
function identifyMetal(d) {
  const [name, rho, c] = d.pick(IDENTIFY), T2 = d.int(18, 22);
  const mix = (g, ml, T) => ((g / 1000) * c * 100 + (ml / 1000) * WATER * T) / ((g / 1000) * c + (ml / 1000) * WATER);
  const sizes = [];
  for (const r of [1, 1.5, 2]) for (const h of [3, 4, 5, 6]) for (const ml of [100, 150, 200]) if (mix(rho * Math.PI * r * r * h, ml, T2) - T2 >= 3 && mix(rho * Math.PI * r * r * h, ml, T2) - T2 <= 15) sizes.push([r, h, ml]);
  const [r, h, ml] = d.pick(sizes), cm3 = Math.PI * r * r * h, g = round(rho * cm3, 1), Tf = round(mix(g, ml, T2), 1);
  const rise = Tf - T2, Qw = (ml / 1000) * WATER * rise, cc = Qw / ((g / 1000) * (100 - Tf)), dens = g / cm3, ml2 = 2 * ml, Tf2 = mix(g, ml2, T2);
  const table = `<table class="data"><thead><tr><th>Metal</th><th>Density (g/cm³)</th><th>c, J/(kg·°C)</th></tr></thead><tbody>${IDENTIFY.map(([n, p, cv]) => `<tr><td>${cap(n)}</td><td>${num(p, 2)}</td><td>${num(cv)}</td></tr>`).join('')}</tbody></table>`;
  return {
    title: 'Which metal is it?',
    intro: `<p>A student is given a solid metal cylinder with a radius of ${num(r, 1)} cm and a height of ${h} cm. Its mass is ${num(g, 1)} g. To find its specific heat capacity, the student heats it in boiling water to 100 °C, then quickly moves it into an insulated cup holding ${ml} mL of water at ${T2} °C. The water warms to ${num(Tf, 1)} °C. (1 mL of water has a mass of 1 g; water’s specific heat capacity is ${num(WATER)} J/(kg·°C).)</p>${SHOW}`,
    guide: `<ul><li>Mixing: <span class="f">heat given out by the hot metal = heat taken in by the cold water</span> (no heat lost)</li></ul>${table}`,
    parts: [
      { kind: 'steps', ask: 'Find the <b>density</b> of the metal.',
        steps: [{ label: 'Volume of the cylinder', value: round(cm3, 3), unit: 'cm³', tol: 0.015 }, { label: 'Density', value: round(dens, 3), unit: 'g/cm³', tol: 0.015 }],
        working: `V = πr²h = π × ${num(r, 1)}² × ${h} ≈ ${num(cm3, 2)} cm³. ρ = m ÷ V = ${num(g, 1)} ÷ ${num(cm3, 2)} ≈ <b>${num(dens, 2)} g/cm³</b>.` },
      { kind: 'steps', ask: 'How much heat did the water take in?', topic: 'Mixing: unknown metal',
        steps: [{ label: 'Mass of the water in kg', value: ml / 1000, unit: 'kg', tol: 0.001 }, { label: 'Temperature rise of the water', value: round(rise, 1), unit: '°C', tol: 0.01 }, { label: 'Heat the water took in', value: round(Qw, 1), unit: 'J', tol: 0.015 }],
        working: `${ml} mL of water is ${ml} g = ${num(ml / 1000, 2)} kg. ΔT = ${num(Tf, 1)} − ${T2} = ${num(rise, 1)} °C. Q = mcΔT = ${num(ml / 1000, 2)} × ${num(WATER)} × ${num(rise, 1)} ≈ <b>${num(Qw, 0)} J</b>.` },
      { kind: 'steps', ask: 'Use your answer to find the <b>specific heat capacity</b> of the metal.', topic: 'Mixing: unknown metal',
        steps: [{ label: 'Temperature drop of the metal', value: round(100 - Tf, 1), unit: '°C', tol: 0.01 }, { label: 'Mass of the metal in kg', value: g / 1000, unit: 'kg', tol: 0.001 }, { label: 'Specific heat capacity', value: round(cc, 1), unit: 'J/(kg·°C)', tol: 0.02 }],
        working: `The metal cools from 100 °C to ${num(Tf, 1)} °C: ΔT = ${num(100 - Tf, 1)} °C. Its mass is ${num(g, 1)} g = ${num(g / 1000, 4)} kg. It gave out the ${num(Qw, 0)} J the water took in, so c = Q ÷ (mΔT) = ${num(Qw, 0)} ÷ (${num(g / 1000, 4)} × ${num(100 - Tf, 1)}) ≈ <b>${num(cc, 0)} J/(kg·°C)</b>.` },
      { kind: 'choice', ask: 'Using both your answers and the table, which metal is the cylinder most likely made of?', choices: IDENTIFY.map(([n]) => cap(n)), correct: IDENTIFY.findIndex((m) => m[0] === name),
        working: `A density of about ${num(dens, 2)} g/cm³ and a specific heat capacity of about ${num(cc, 0)} J/(kg·°C) both match <b>${name}</b> (${num(rho, 2)} g/cm³, ${num(c)} J/(kg·°C)).` },
      { kind: 'steps', ask: `The student heats the cylinder to 100 °C again and moves it into ${ml2} mL of water at ${T2} °C. Using the table’s specific heat capacity for the metal, predict the <b>final temperature</b>.`, topic: 'Mixing: final temperature',
        steps: [{ label: 'Final temperature', value: round(Tf2, 2), unit: '°C', tol: { abs: 0.2 }, marks: 2 }],
        working: `Heat given out = heat taken in: ${num(g / 1000, 4)} × ${num(c)} × (100 − T) = ${num(ml2 / 1000, 2)} × ${num(WATER)} × (T − ${T2}). So T = (${num(g / 1000, 4)} × ${num(c)} × 100 + ${num(ml2 / 1000, 2)} × ${num(WATER)} × ${T2}) ÷ (${num(g / 1000, 4)} × ${num(c)} + ${num(ml2 / 1000, 2)} × ${num(WATER)}) ≈ <b>${num(Tf2, 1)} °C</b>: a smaller rise than before, since the same heat warms twice as much water.` },
    ],
  };
}

// running a bath: mixing hot and cold water, the cold water needed for a set temperature, the heat to make the hot water,
// and what the gas for it costs
function runningABath(d) {
  const hot = d.pick([40, 50, 60, 70]), T1 = d.pick([55, 60, 65]), cold = d.pick([30, 40, 50, 60]), T2 = d.int(10, 16);
  const Tf = (hot * T1 + cold * T2) / (hot + cold), H = d.pick([50, 60, 70, 80]), Tw = d.pick([38, 40, 42]);
  const given = H * WATER * (T1 - Tw), need = given / (WATER * (Tw - T2)), Q = hot * WATER * (T1 - T2);
  const eff = d.pick([0.85, 0.88, 0.9, 0.92]), price = d.pick([0.06, 0.08, 0.1, 0.12]), gas = Q / eff, kWh = gas / 3.6e6;
  return {
    title: 'Running a bath',
    intro: `<p>A bath is filled with ${hot} L of hot water at ${T1} °C from the boiler and ${cold} L of cold water at ${T2} °C. One liter of water has a mass of 1 kg, and water’s specific heat capacity is ${num(WATER)} J/(kg·°C). Assume no heat is lost to the bath or the air.</p>${SHOW}`,
    guide: `<ul><li>Mixing: <span class="f">heat given out by the hot water = heat taken in by the cold water</span></li>${EFFICIENCY}${KWH}</ul>`,
    parts: [
      { kind: 'steps', ask: 'What is the temperature of the bath once the water has mixed?', topic: 'Mixing: final temperature',
        steps: [{ label: 'Mass of the hot water', value: hot, unit: 'kg', tol: 0.001 }, { label: 'Mass of the cold water', value: cold, unit: 'kg', tol: 0.001 }, { label: 'Final temperature', value: round(Tf, 2), unit: '°C', tol: { abs: 0.2 } }],
        working: `${hot} L and ${cold} L have masses of ${hot} kg and ${cold} kg. Heat given out = heat taken in: ${hot} × ${num(WATER)} × (${T1} − T) = ${cold} × ${num(WATER)} × (T − ${T2}). The c’s cancel, so T = (${hot} × ${T1} + ${cold} × ${T2}) ÷ (${hot} + ${cold}) ≈ <b>${num(Tf, 1)} °C</b>.` },
      { kind: 'steps', ask: `Another day, the bath has ${H} L of hot water at ${T1} °C. How many liters of cold water at ${T2} °C must be added to make the bath ${Tw} °C?`, topic: 'Finding the mass',
        steps: [{ label: `Heat the hot water gives out cooling to ${Tw} °C`, value: given, unit: 'J', tol: 0.01 }, { label: 'Cold water needed', value: round(need, 2), unit: 'L', tol: 0.015 }],
        working: `The hot water gives out Q = mcΔT = ${H} × ${num(WATER)} × (${T1} − ${Tw}) = ${num(given)} J. The cold water takes that in warming by ${Tw} − ${T2} = ${Tw - T2} °C, so m = Q ÷ (cΔT) = ${num(given)} ÷ (${num(WATER)} × ${Tw - T2}) ≈ ${num(need, 1)} kg: <b>about ${num(need, 1)} L</b>.` },
      { kind: 'steps', ask: `The boiler heated the ${hot} L of hot water for the first bath from ${T2} °C to ${T1} °C. How much heat did that take, in <b>kJ</b>?`, topic: 'Heat in kilojoules',
        steps: [{ label: 'Heat in J', value: Q, unit: 'J', tol: 0.01 }, { label: 'Heat in kJ', value: Q / 1000, unit: 'kJ', tol: 0.01 }],
        working: `Q = mcΔT = ${hot} × ${num(WATER)} × (${T1} − ${T2}) = ${num(Q)} J = <b>${num(Q / 1000, 1)} kJ</b>.` },
      { kind: 'steps', ask: `The gas boiler is ${Math.round(eff * 100)}% efficient: only ${Math.round(eff * 100)}% of the energy in the gas it burns ends up in the water. Gas costs $${price.toFixed(2)} per kWh. How much did the gas for that hot water cost?`,
        steps: [{ label: 'Energy from the gas', value: round(gas, 0), unit: 'J', tol: 0.015 }, { label: 'Energy in kWh', value: round(kWh, 3), unit: 'kWh', tol: 0.015 }, { label: 'Cost in dollars', value: round(kWh * price, 3), unit: 'dollars', tol: 0.02 }],
        working: `The water took in ${num(Q)} J, which is ${Math.round(eff * 100)}% of the gas’s energy: ${num(Q)} ÷ ${eff} ≈ ${num(gas, 0)} J. ÷ 3,600,000 ≈ ${num(kWh, 2)} kWh, and × $${price.toFixed(2)} ≈ <b>$${(kWh * price).toFixed(2)}</b>.` },
    ],
  };
}

// burning a snack under a can of water: the energy the water took in, in joules and calories, against what the packet
// says, as a percentage; and the rise a bigger piece would give
const SNACKS = [['peanut', 567], ['cashew nut', 553], ['almond', 579], ['walnut', 654], ['corn chip', 500], ['cracker', 430]];
function burningASnack(d) {
  const [food, kcal] = d.pick(SNACKS), sizes = [];
  for (const g of [0.5, 0.6, 0.8, 1, 1.2]) for (const ml of [50, 75, 100]) for (const share of [0.25, 0.3, 0.35, 0.4, 0.45]) {
    const rise = Math.round((share * g * (kcal / 100) * 4184) / ((ml / 1000) * WATER));
    if (rise >= 8 && rise <= 45) sizes.push([g, ml, rise]);
  }
  const [g, ml, rise] = d.pick(sizes), T1 = d.int(17, 22), kg = ml / 1000, Q = kg * WATER * rise, cal = Q / 4.184;
  const inFood = (kcal / 100) * g, J = inFood * 4184, pct = (Q / J) * 100, g2 = g * 2, rise2 = (Q * 2) / (kg * WATER);
  return {
    title: `Burning a ${food}`,
    intro: `<p>A student burns a ${num(g, 1)} g piece of ${food} under a small metal can holding ${ml} mL of water. The water warms from ${T1} °C to ${T1 + rise} °C. The ${food} packet says that 100 g contains ${kcal} kcal (food Calories). (1 mL of water has a mass of 1 g; water’s specific heat capacity is ${num(WATER)} J/(kg·°C).)</p>${SHOW}`,
    guide: `<ul><li>1 cal = 4.184 J · 1 kcal (a food Calorie) = 1000 cal = 4,184 J</li>${EFFICIENCY}</ul>`,
    parts: [
      { kind: 'steps', ask: 'How much energy did the water take in?', topic: 'Heat needed to warm something',
        steps: [{ label: 'Mass of the water in kg', value: kg, unit: 'kg', tol: 0.001 }, { label: 'Temperature rise', value: rise, unit: '°C', tol: 0.001 }, { label: 'Energy the water took in', value: round(Q, 1), unit: 'J', tol: 0.01 }],
        working: `${ml} mL = ${ml} g = ${num(kg, 3)} kg. ΔT = ${T1 + rise} − ${T1} = ${rise} °C. Q = mcΔT = ${num(kg, 3)} × ${num(WATER)} × ${rise} = <b>${num(Q, 1)} J</b>.` },
      { kind: 'steps', ask: 'Write that energy in <b>calories</b>, and in <b>kilocalories</b> (food Calories).', topic: 'Calories',
        steps: [{ label: 'Energy in calories', value: round(cal, 1), unit: 'cal', tol: 0.01 }, { label: 'Energy in kilocalories', value: round(cal / 1000, 4), unit: 'kcal', tol: 0.01 }],
        working: `${num(Q, 1)} J ÷ 4.184 ≈ ${num(cal, 0)} cal, and ÷ 1000 ≈ <b>${num(cal / 1000, 2)} kcal</b>.` },
      { kind: 'steps', ask: `According to the packet, how much energy was in the ${num(g, 1)} g piece, in <b>joules</b>?`, topic: 'Calories',
        steps: [{ label: 'Energy in the piece in kcal', value: round(inFood, 4), unit: 'kcal', tol: 0.01 }, { label: 'Energy in the piece in J', value: round(J, 0), unit: 'J', tol: 0.01 }],
        working: `100 g holds ${kcal} kcal, so ${num(g, 1)} g holds ${kcal} × ${num(g, 1)} ÷ 100 = ${num(inFood, 3)} kcal, and × 4,184 ≈ <b>${num(J, 0)} J</b>.` },
      { kind: 'steps', ask: 'What <b>percentage</b> of the energy in the food went into the water?',
        steps: [{ label: 'Percentage that went into the water', value: round(pct, 1), unit: '%', tol: 0.02, marks: 2 }],
        working: `${num(Q, 1)} ÷ ${num(J, 0)} × 100 ≈ <b>${num(pct, 0)}%</b>. The rest warmed the can and the air around the flame, or stayed in the bits that didn’t burn.` },
      { kind: 'steps', ask: `The student burns a ${num(g2, 1)} g piece of the same ${food} under the same can of water. If the same percentage of its energy goes into the water, by how much will the water’s temperature rise?`, topic: 'Final temperature',
        steps: [{ label: 'Energy the water takes in', value: round(Q * 2, 1), unit: 'J', tol: 0.015 }, { label: 'Temperature rise', value: round(rise2, 2), unit: '°C', tol: 0.015 }],
        working: `Twice the food gives twice the energy: ${num(Q * 2, 1)} J. ΔT = Q ÷ (mc) = ${num(Q * 2, 1)} ÷ (${num(kg, 3)} × ${num(WATER)}) = <b>${num(rise2, 0)} °C</b>, twice the first rise.` },
    ],
  };
}
const PROBLEMS = [heatingACube, hotWaterTank, fishTank, identifyMetal, runningABath, burningASnack];

export const heatExam = examBank('heat-exam', {
  title: 'Heat and Energy', minutes: 50, guide: GUIDE,
  slots: [
    [heatingSolids, coolingCurves, iceToSteam, heatingLiquids, differentMasses],   // 1. a graph to read
    SYSTEMS,   // 2. a data set and its feedback loops
    EXPERIMENTS,   // 3. an experiment to plan, sketch and explain
    PROBLEMS,   // 4. problem solving
  ],
});
