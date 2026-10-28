// Heat capacity, Q = mcΔT: 11 kinds of question, 20 variants each (220), from warming and cooling to mixing hot
// metal into water, electric heaters, and calories.
import { bank, combo, num, round } from '../kit/bank.js';

// specific heats, J/(g·°C) — the table on the page shows the same values
export const MATERIALS = [
  ['water', 4.18], ['ethanol', 2.44], ['ice', 2.09], ['steam', 2.01], ['olive oil', 1.97], ['aluminum', 0.9], ['glass', 0.84],
  ['sand', 0.83], ['granite', 0.79], ['iron', 0.45], ['zinc', 0.39], ['copper', 0.385], ['silver', 0.24], ['tin', 0.23], ['lead', 0.13], ['gold', 0.13],
];
const SOLIDS = MATERIALS.filter(([n]) => !['water', 'ethanol', 'steam', 'olive oil', 'ice'].includes(n));
const METALS = MATERIALS.filter(([n]) => ['aluminum', 'iron', 'zinc', 'copper', 'silver', 'tin', 'lead', 'gold'].includes(n));
// ones far enough apart to tell apart by measuring c
const TELLABLE = ['water', 'ethanol', 'olive oil', 'aluminum', 'granite', 'iron', 'copper', 'silver', 'lead'].map((n) => MATERIALS.find((m) => m[0] === n));
const CW = 4.18, J = 'J', C = '°C', CU = 'J/(g·°C)';
// what the questions use: no steam or ice (ice above 0 °C would have melted), and ethanol only below its 78 °C boiling point
const USED = MATERIALS.filter(([n]) => n !== 'steam' && n !== 'ice');
const TOP = (mat) => (mat === 'ethanol' ? 75 : mat === 'water' ? 95 : 300);   // the warmest it may get
const ans = (value, unit, tol = 0.01) => ({ kind: 'number', value: round(value, 4), unit, tol });
const closest = (c) => MATERIALS.reduce((best, m) => (Math.abs(m[1] - c) < Math.abs(best[1] - c) ? m : best));
const MASS = [20, 25, 40, 50, 60, 75, 80, 100, 120, 125, 150, 200, 250, 300, 350, 400, 500];

const templates = [
  // 1. heat needed: Q = mcΔT
  (d) => {
    const [mat, c] = d.pick(USED), m = d.pick(MASS), T1 = d.int(10, 30), dT = d.int(5, Math.min(60, TOP(mat) - T1)), T2 = T1 + dT;
    return {
      topic: 'Heat needed to warm something',
      text: `How much heat is needed to warm ${m} g of ${mat} from ${T1} °C to ${T2} °C? (c = ${num(c, 3)} J/(g·°C))`,
      answer: ans(m * c * dT, J),
      solution: `ΔT = ${T2} − ${T1} = ${dT} °C. Q = mcΔT = ${m} g × ${num(c, 3)} J/(g·°C) × ${dT} °C = <b>${num(m * c * dT, 1)} J</b>.`,
    };
  },
  // 2. kilograms and kilojoules
  (d) => {
    const [mat, c] = d.pick(USED), m = d.pick([0.2, 0.25, 0.4, 0.5, 0.75, 1, 1.2, 1.5, 2, 2.5, 3, 4, 5]), dT = d.int(4, 45), ck = round(c * 1000, 1);
    return {
      topic: 'Heat in kilojoules',
      text: `${['water', 'ethanol', 'olive oil', 'sand'].includes(mat) ? `${num(m)} kg of ${mat}` : `A ${num(m)} kg block of ${mat}`} warms by ${dT} °C. How much heat did it absorb, in kilojoules? (c = ${num(ck, 1)} J/(kg·°C))`,
      answer: ans((m * ck * dT) / 1000, 'kJ'),
      solution: `Q = mcΔT = ${num(m)} kg × ${num(ck, 1)} J/(kg·°C) × ${dT} °C = ${num(m * ck * dT, 1)} J. A kilojoule is 1000 J, so that is ${num(m * ck * dT, 1)} ÷ 1000 = <b>${num((m * ck * dT) / 1000, 3)} kJ</b>.`,
    };
  },
  // 3. final temperature from the heat added
  (d) => {
    const [mat, c] = d.pick(USED), m = d.pick(MASS), T0 = d.int(12, 30), dT = d.int(5, Math.min(50, TOP(mat) - T0 - 1)), Q = Math.round(m * c * dT);
    const rise = Q / (m * c);
    return {
      topic: 'Final temperature',
      text: `${num(Q, 0)} J of heat is added to ${m} g of ${mat} at ${T0} °C. What is its final temperature? (c = ${num(c, 3)} J/(g·°C))`,
      answer: ans(T0 + rise, C, { abs: 0.3 }),
      solution: `ΔT = Q/(mc) = ${num(Q, 0)} / (${m} × ${num(c, 3)}) = ${num(rise, 2)} °C. Final temperature = ${T0} + ${num(rise, 2)} = <b>${num(T0 + rise, 2)} °C</b>.`,
    };
  },
  // 4. find the mass
  (d) => {
    const [mat, c] = d.pick(USED), m = d.pick(MASS), dT = d.int(5, 40), Q = Math.round(m * c * dT);
    return {
      topic: 'Finding the mass',
      text: `It takes ${num(Q, 0)} J to raise the temperature of some ${mat} by ${dT} °C. What is its mass? (c = ${num(c, 3)} J/(g·°C))`,
      answer: ans(Q / (c * dT), 'g'),
      solution: `Rearrange Q = mcΔT: m = Q/(cΔT) = ${num(Q, 0)} / (${num(c, 3)} × ${dT}) = <b>${num(Q / (c * dT), 1)} g</b>.`,
    };
  },
  // 5. find the specific heat (and so the material)
  (d) => {
    const [mat, c] = d.pick(TELLABLE), m = d.pick(MASS), dT = d.int(5, 40), Q = Math.round(m * c * dT), cc = Q / (m * dT);
    return {
      topic: 'Finding the specific heat',
      text: `A ${m} g sample absorbs ${num(Q, 0)} J and warms by ${dT} °C. What is its specific heat? Which material in the table could it be?`,
      answer: ans(cc, CU, 0.02),
      solution: `c = Q/(mΔT) = ${num(Q, 0)} / (${m} × ${dT}) = <b>${num(cc, 3)} J/(g·°C)</b>. That matches <b>${closest(cc)[0]}</b> (${num(closest(cc)[1], 3)}).`,
      check: () => (closest(cc)[0] === mat || closest(cc)[1] === c ? '' : `measured c points to ${closest(cc)[0]}, not ${mat}`),
    };
  },
  // 6. heat given off while cooling
  (d) => {
    const [mat, c] = d.pick(USED), m = d.pick(MASS), T1 = d.int(60, Math.min(95, TOP(mat))), dT = d.int(10, 50), T2 = T1 - dT;
    return {
      topic: 'Heat released while cooling',
      text: `${m} g of ${mat} cools from ${T1} °C to ${T2} °C. How much heat does it give off? (c = ${num(c, 3)} J/(g·°C); answer as a positive number)`,
      answer: ans(m * c * dT, J),
      solution: `ΔT = ${T2} − ${T1} = −${dT} °C, so Q = mcΔT = ${m} g × ${num(c, 3)} J/(g·°C) × (−${dT} °C) = −${num(m * c * dT, 1)} J. The minus sign means heat leaves, so it gives off <b>${num(m * c * dT, 1)} J</b>.`,
    };
  },
  // 7. mixing: hot metal dropped into water → final temperature
  (d) => {
    const [mat, c] = d.pick(METALS), m1 = d.pick([50, 75, 100, 120, 150, 200, 250, 300]), T1 = d.pick([80, 90, 95, 100, 120, 150]), m2 = d.pick([100, 150, 200, 250, 300, 400, 500]), T2 = d.int(15, 25);
    const a = m1 * c, b = m2 * CW, Tf = (a * T1 + b * T2) / (a + b);
    return {
      topic: 'Mixing: final temperature',
      text: `A ${m1} g piece of ${mat} at ${T1} °C is dropped into ${m2} g of water at ${T2} °C. Ignoring heat lost to the surroundings, what is the final temperature? (c of ${mat} = ${num(c, 3)}, water = ${CW} J/(g·°C))`,
      answer: ans(Tf, C, { abs: 0.3 }),
      solution: `Heat lost by the metal = heat gained by the water: ${m1} × ${num(c, 3)} × (${T1} − T) = ${m2} × ${CW} × (T − ${T2}). Working out the products, ${num(a, 3)} × (${T1} − T) = ${num(b, 2)} × (T − ${T2}). Multiplying out and gathering the T terms on one side, ${num(a, 3)} × ${T1} + ${num(b, 2)} × ${T2} = (${num(a, 3)} + ${num(b, 2)}) × T. So T = ${num(a * T1 + b * T2, 2)} ÷ ${num(a + b, 3)} = <b>${num(Tf, 1)} °C</b>.`,
    };
  },
  // 8. mixing: find an unknown metal's specific heat
  (d, ctx) => {
    const [[mat, c], m1, T1, m2, T2] = combo(ctx, [METALS.filter(([n]) => !['zinc', 'tin', 'gold'].includes(n)), [100, 150, 200, 250, 300], [90, 95, 100], [100, 150, 200, 250], [18, 19, 20, 21, 22, 23, 24]]);
    const Tf = round((m1 * c * T1 + m2 * CW * T2) / (m1 * c + m2 * CW), 1), cc = (m2 * CW * (Tf - T2)) / (m1 * (T1 - Tf));
    return {
      topic: 'Mixing: unknown metal',
      text: `A ${m1} g metal block at ${T1} °C is placed in ${m2} g of water at ${T2} °C. They settle at ${num(Tf, 1)} °C. What is the metal’s specific heat? (water: ${CW} J/(g·°C))`,
      answer: ans(cc, CU, 0.03),
      solution: `Heat gained by the water = ${m2} × ${CW} × (${num(Tf, 1)} − ${T2}) = ${num(m2 * CW * (Tf - T2), 1)} J. The metal lost that same heat while cooling by ${T1} − ${num(Tf, 1)} = ${num(T1 - Tf, 1)} °C, so ${m1} × c × ${num(T1 - Tf, 1)} = ${num(m2 * CW * (Tf - T2), 1)}. So c = ${num(m2 * CW * (Tf - T2), 1)} ÷ (${m1} × ${num(T1 - Tf, 1)}) = <b>${num(cc, 3)} J/(g·°C)</b>, close to ${closest(cc)[0]} (${num(closest(cc)[1], 3)}).`,
    };
  },
  // 9. an electric heater: Q = P·t
  (d) => {
    // (only combinations that give a believable rise: the water shouldn't need to boil)
    const fits = (P, t, m) => { const r = (P * t) / (m * CW); return r >= 2 && r <= 70; };
    const P = d.pick([100, 200, 250, 300, 500, 600, 750, 800, 1000, 1200, 1500]), m = d.pick([200, 250, 300, 400, 500, 750, 1000, 1500, 2000].filter((mm) => [30, 45, 60, 90, 120, 150, 180, 240, 300].some((tt) => fits(P, tt, mm))));
    const t = d.pick([30, 45, 60, 90, 120, 150, 180, 240, 300].filter((tt) => fits(P, tt, m)));
    const rise = (P * t) / (m * CW), mins = t % 60 === 0 && d.chance(0.5);
    return {
      topic: 'Electric heater',
      text: `A ${num(P, 0)} W heater warms ${num(m, 0)} g of water for ${mins ? `${t / 60} minute${t === 60 ? '' : 's'}` : `${t} seconds`}. If all its energy goes into the water, how much does the water’s temperature rise? (water: ${CW} J/(g·°C))`,
      answer: ans(rise, C),
      solution: `${mins ? `The time in seconds is ${t / 60} × 60 = ${t} s. ` : ''}Energy = power × time = ${num(P, 0)} W × ${t} s = ${num(P * t, 0)} J. Then ΔT = Q/(mc) = ${num(P * t, 0)} / (${num(m, 0)} × ${CW}) = <b>${num(rise, 2)} °C</b>.`,
      check: () => (rise > 0 && rise < 200 ? '' : 'temperature rise out of range'),
    };
  },
  // 10. same heat, same mass, different materials
  (d) => {
    // (only pairs where the second change is believable: up to 100 °C for a solid, 50 °C for a liquid)
    const most = (n) => (['water', 'ethanol', 'olive oil'].includes(n) ? 50 : 100);
    const [A, cA] = d.pick(SOLIDS.concat([['water', 4.18]])), others = USED.filter(([n, c]) => n !== A && c !== cA && cA * 4 <= most(n) * c), [B, cB] = d.pick(others);
    const dTA = d.int(4, Math.min(30, Math.floor((most(B) * cB) / cA)));
    return {
      topic: 'Same heat, different materials',
      text: `Equal masses of ${A} and ${B} absorb the same amount of heat. The ${A} warms by ${dTA} °C. By how much does the ${B} warm? (c: ${A} ${num(cA, 3)}, ${B} ${num(cB, 3)} J/(g·°C))`,
      answer: ans((dTA * cA) / cB, C),
      solution: `Same Q and m, so c × ΔT is the same for both: ΔT(${B}) = ${dTA} × ${num(cA, 3)} / ${num(cB, 3)} = <b>${num((dTA * cA) / cB, 2)} °C</b>. Lower specific heat means a bigger temperature change.`,
    };
  },
  // 11. calories
  (d) => {
    const m = d.pick(MASS.concat([600, 750, 1000])), dT = d.int(5, 60), joules = d.chance(0.5);
    return {
      topic: 'Calories',
      text: `How much heat is needed to warm ${num(m, 0)} g of water by ${dT} °C, ${joules ? 'in joules? (1 cal = 4.184 J, and water takes 1 cal/(g·°C))' : 'in calories? (water takes 1 cal/(g·°C))'}`,
      answer: joules ? ans(m * dT * 4.184, J) : ans(m * dT, 'cal'),
      solution: joules ? `In calories: Q = ${num(m, 0)} × 1 × ${dT} = ${num(m * dT, 0)} cal. In joules: ${num(m * dT, 0)} × 4.184 = <b>${num(m * dT * 4.184, 1)} J</b>.` : `Q = mcΔT = ${num(m, 0)} g × 1 cal/(g·°C) × ${dT} °C = <b>${num(m * dT, 0)} cal</b>. That’s ${num((m * dT) / 1000, 3)} kcal, or ${num((m * dT) / 1000, 3)} food Calories.`,
    };
  },
];

export const heat = bank('heat', templates, 220);
