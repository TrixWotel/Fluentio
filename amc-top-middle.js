// Mixed AMC 10 word problems, for the middle of the test (problems 8 to 18): eight topics of the multi-step kind that
// fill a real contest's middle (relative speed, replacing part of a mixture again and again, clock hands, logic puzzles
// with one consistent answer, whole-number puzzles, quarter circles in a square, mean, median and mode together, and
// calendars over long spans), with original settings and numbers; real AMC problems are the MAA's copyright. Each topic
// asks its idea three or four ways, and every check() gets the answer again another way: exact BigInt fractions,
// simulation, brute force over every list, seating or order, slice-by-slice areas, or JavaScript's own calendar.
import { combo, num, frac, gcd, lcm } from '../kit/bank.js';
import { choices, labelled, showFrac, range, ord } from './amc-kit.js';

// combo, with a name of its own for each kind of question, so no two kinds share a list of combinations
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
// the kinds of question take turns, so a type's variants ask each kind; combo() picks the numbers for the kind
const byTurn = (ctx, tag, asks, lists, ok = () => true) => {
  const ask = asks[ctx.k % asks.length];
  return [ask, ...pick({ ...ctx, k: Math.floor(ctx.k / asks.length) }, `${tag}:${ask}`, lists, (...v) => ok(...v, ask))];
};
const NAMES = ['Ava', 'Ben', 'Cleo', 'Dev', 'Eli', 'Faye', 'Gus', 'Hana', 'Ivan', 'Jade', 'Kai', 'Lena', 'Milo', 'Nora', 'Omar', 'Pia', 'Rosa', 'Sam', 'Tess', 'Uma', 'Vito', 'Wren', 'Yuki', 'Zane'];
const names = (d, n) => d.shuffle(NAMES).slice(0, n);
const cut = (p, q) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return [p / g, q / g]; };
const fr = ([p, q]) => frac(p, q);
const val = (v) => (Array.isArray(v) ? v[0] / v[1] : v);
const plain = (s) => String(s).replace(/<[^>]+>/g, '');
const listing = (xs) => (xs.length < 2 ? String(xs[0]) : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const plural = (n, word, many = word + 's') => `${num(n)} ${n === 1 ? word : many}`;
// "A" or "An" before a number, as it is said: an 8-liter tank, an 18-liter one, an 80-liter one
const A_ = (n) => (n === 8 || n === 11 || n === 18 || (n >= 80 && n <= 89) || (n >= 800 && n <= 899) ? 'An' : 'A');
const isInt = (v) => Number.isInteger(Math.round(v * 1e9) / 1e9) && Math.abs(v - Math.round(v)) < 1e-9;

// choices() for exact answers (whole numbers, or fractions as [p, q]), the wrong ones topped up here so that no two
// choices read the same even once the fraction bars are gone (3/2 and 32)
function fchoices(d, correct, wrongs, show = showFrac) {
  const [p, q] = Array.isArray(correct) ? correct : [correct, 1], keep = [], bare = (v) => plain(show(v));
  const size = q === 1 ? Math.abs(p) / 12 : 0, step = size < 5 ? 1 : [1, 2, 5, 10].map((f) => f * 10 ** Math.floor(Math.log10(size))).find((v) => v >= size);
  for (const w of [...wrongs, ...range(1, 12).flatMap((k) => [[p + k * step, q], [p - k * step, q]])]) {
    if (keep.length === 4) break;
    if (Number.isFinite(val(w)) && (val(correct) < 0 || val(w) >= 0) && ![correct, ...keep].some((x) => Math.abs(val(x) - val(w)) < 1e-9 || bare(x) === bare(w))) keep.push(w);
  }
  return choices(d, correct, keep, show);
}
// whole-number answers: the wrong ones that are whole numbers too
const wchoices = (d, ans, wrongs) => fchoices(d, ans, wrongs.filter((w) => isInt(w) && w > 0).map((w) => Math.round(w)));
// a mixed number: 32 8/11
function mixed(v) {
  const [p, q] = Array.isArray(v) ? cut(v[0], v[1]) : [v, 1];
  if (q === 1) return num(p, 0);
  const w = Math.floor(p / q), r = p - w * q;
  return w ? `${num(w, 0)} ${frac(r, q)}` : frac(r, q);
}
// labelled() with the wrong ones whose values differ from the answer and from each other, topped up from `more`
function lchoices(correct, wrongs, more = []) {
  const keep = [];
  for (const w of [...wrongs, ...more]) {
    if (keep.length === 4) break;
    if (Number.isFinite(w[0]) && w[0] > 0 && ![correct, ...keep].some((x) => Math.abs(x[0] - w[0]) < 1e-9 || plain(x[1]) === plain(w[1]))) keep.push(w);
  }
  return labelled(correct, keep);
}

// ---------- exact fractions with BigInt, for the checks: [p, q] in lowest terms, q > 0 ----------
const big = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const Q = (p, q = 1n) => { p = BigInt(p); q = BigInt(q); if (q < 0n) { p = -p; q = -q; } const g = big(p, q) || 1n; return [p / g, q / g]; };
const qadd = (x, y) => Q(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const qsub = (x, y) => Q(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const qmul = (x, y) => Q(x[0] * y[0], x[1] * y[1]);
const qdiv = (x, y) => Q(x[0] * y[1], x[1] * y[0]);
const qis = (x, v) => { const [p, q] = Array.isArray(v) ? v : [v, 1]; const y = Q(p, q); return x[0] === y[0] && x[1] === y[1]; };
const qsay = (x, v, what = '') => (qis(x, v) ? '' : `${what} worked out ${x[0]}/${x[1]}, said ${Array.isArray(v) ? v.join('/') : v}`);

// ---------- Relative speed ----------
const relative = [
  // an escalator: two people walking up it count their steps; the stairs on it, the ride standing still, or walking down
  (d, ctx) => {
    const downRate = (N, e, w1, w2) => range(e + 1, 7).find((w) => w !== w1 && w !== w2 && N % (w - e) === 0);
    const [ask, w1, w2, e, t] = byTurn(ctx, 'esc', ['visible', 'stand', 'down'], [[1, 2], [2, 3, 4], [1, 2, 3], range(1, 12)], (w1, w2, e, t, ask) => {
      const N = lcm(w1 + e, w2 + e) * t;
      return w2 > w1 && N >= 24 && N <= 180 && (ask !== 'stand' || N % e === 0) && (ask !== 'down' || downRate(N, e, w1, w2) !== undefined);
    });
    const N = lcm(w1 + e, w2 + e) * t, t1 = N / (w1 + e), t2 = N / (w2 + e), n1 = w1 * t1, n2 = w2 * t2, [A, B, C] = names(d, 3);
    const w3 = ask === 'down' ? downRate(N, e, w1, w2) : 0, t3 = w3 ? N / (w3 - e) : 0;
    const ans = { visible: N, stand: N / e, down: w3 * t3 }[ask];
    const solved = `Let the escalator carry riders up e stairs per second, and let N be the number of stairs from bottom to top. ${A} takes ${n1} steps at ${plural(w1, 'step')} per second, so ${A} is on the escalator for ${t1} seconds, and in that time it carries ${A} up ${t1}e stairs: N = ${n1} + ${t1}e. In the same way, ${B} is on it for ${n2} ÷ ${w2} = ${t2} seconds, so N = ${n2} + ${t2}e. Subtracting, ${t1 - t2}e = ${n2 - n1}, so e = ${e}.`;
    return {
      topic: 'Relative speed', rank: { visible: 14, stand: 14, down: 15 }[ask],
      text: `An escalator moves up at a steady speed. ${A} walks up it, taking ${plural(w1, 'step')} per second, and takes ${n1} steps to get from the bottom to the top. ${B} walks up it taking ${w2} steps per second and takes ${n2} steps. Each step climbs one stair. ` + {
        visible: 'How many steps would it take to walk from the bottom to the top if the escalator were switched off?',
        stand: 'How many seconds does the ride from the bottom to the top take for someone who stands still?',
        down: `${C} walks down this escalator while it keeps moving up, taking ${w3} steps per second. How many steps does ${C} take to get from the top to the bottom?`,
      }[ask],
      answer: wchoices(d, ans, {
        visible: [2 * n2 - n1, n1 + n2, n2 + e * t1, N - n1, N + e],
        stand: [t1, t2, t1 + t2, 2 * N / e, N / (e + 1)],
        down: [N, (N * w3) / (w3 + e), t3, N + e * t3, 2 * N - n1],
      }[ask]),
      check: () => {
        // from the counts alone: N − n = e·(n/w) for both walkers, solved with fractions; then the asked number
        const a1 = Q(n1, w1), a2 = Q(n2, w2), ee = qdiv(Q(n2 - n1), qsub(a1, a2)), NN = qadd(Q(n1), qmul(ee, a1));
        const got = { visible: NN, stand: qdiv(NN, ee), down: qmul(Q(w3), qdiv(NN, qsub(Q(w3), ee))) }[ask];
        return qsay(got, ans, ask);
      },
      solution: solved + {
        visible: ` Then N = ${n1} + ${t1}·${e} = <b>${N}</b>.`,
        stand: ` Then N = ${n1} + ${t1}·${e} = ${N}. Standing still, a rider is carried up just ${plural(e, 'stair')} per second, so the ride takes ${N} ÷ ${e} = <b>${N / e}</b> seconds.`,
        down: ` Then N = ${n1} + ${t1}·${e} = ${N}. Walking down at ${w3} steps per second while the escalator brings ${C} back up ${e} per second, ${C} gets ${plural(w3 - e, 'stair')} lower each second, so the trip takes ${N} ÷ ${w3 - e} = ${t3} seconds and ${C} takes ${w3}·${t3} = <b>${ans}</b> steps.`,
      }[ask],
    };
  },
  // two trains: the time to pass each other going opposite ways and the same way; one of the speeds
  (d, ctx) => {
    const [ask, u, v, D] = byTurn(ctx, 'trains', ['fast', 'slow'], [range(14, 40), range(6, 30), [240, 280, 300, 320, 360, 400, 420, 480, 500, 540, 560, 600]],
      (u, v, D) => u > v + 1 && D % (u + v) === 0 && D % (u - v) === 0 && D / (u + v) >= 4 && D / (u - v) <= 150);
    const splits = range(5, 20).map((k) => 20 * k).filter((a) => D - a >= 100 && D - a <= 400 && a < D - a);
    const LA = d.pick(splits), LB = D - LA, to = D / (u + v), ts = D / (u - v), fast = ask === 'fast', ans = fast ? u : v;
    return {
      topic: 'Relative speed', rank: 11,
      text: `Two trains run at steady speeds on parallel tracks; one is ${LA} meters long and the other ${LB} meters long. When they run toward each other, ${to} seconds pass from the moment their fronts meet until their rear ends pass each other. When they run in the same direction, the faster train takes ${ts} seconds to pass the slower one completely, from the moment its front reaches the slower train’s rear until its rear passes the slower train’s front. What is the speed of the ${fast ? 'faster' : 'slower'} train, in meters per second?`,
      answer: wchoices(d, ans, fast ? [u + v, u - v, v, (u + v) / 2, D / to / 2 + 1] : [u - v, u, (u - v) / 2, u + v, (u + v) / 2]),
      check: () => {
        // simulate: the gap to close is the two lengths, at the sum or the difference of the speeds
        const a = Q(D, to), b = Q(D, ts), got = fast ? qdiv(qadd(a, b), Q(2)) : qdiv(qsub(a, b), Q(2));
        return qsay(got, ans) || (LA + LB === D && (LA + LB) / (u + v) === to && (LA + LB) / (u - v) === ts ? '' : 'times do not fit');
      },
      solution: `Watch from the slower train: it stands still, and the faster one moves past it at the sum of the two speeds when they run toward each other, or at their difference when they run the same way. Either way, passing completely means moving ${LA} + ${LB} = ${D} meters past each other. So u + v = ${D} ÷ ${to} = ${u + v} and u − v = ${D} ÷ ${ts} = ${u - v}, where u is the faster speed and v the slower. ${fast ? `Adding, 2u = ${2 * u}, so u = <b>${u}</b>.` : `Subtracting, 2v = ${2 * v}, so v = <b>${v}</b>.`}`,
    };
  },
  // a train passing two walkers, one walking with it and one toward it: the train's length or speed
  (d, ctx) => {
    const [ask, w, u, m] = byTurn(ctx, 'walkers', ['length', 'speed'], [[1, 2], range(8, 30), range(1, 8)], (w, u, m) => { const L = lcm(u - w, u + w) * m; return L >= 120 && L <= 600; });
    const L = lcm(u - w, u + w) * m, t1 = L / (u - w), t2 = L / (u + w), [A, B] = names(d, 2), ans = ask === 'length' ? L : u;
    return {
      topic: 'Relative speed', rank: ask === 'length' ? 12 : 11,
      text: `A train moving at a steady speed passes two people walking beside the track, each at ${w} m/s: ${A} walks in the same direction as the train, and ${B} walks toward it. From the moment the front of the train reaches a walker until its rear passes them, the train takes ${t1} seconds to pass ${A} and ${t2} seconds to pass ${B}. ${ask === 'length' ? 'How long is the train, in meters?' : 'What is the speed of the train, in meters per second?'}`,
      answer: wchoices(d, ans, ask === 'length' ? [u * t1, u * t2, (u + w) * t1, (u - w) * t2, (L * 3) / 2] : [u - w, u + w, (t1 + t2) / (t1 - t2), 2 * u, (w * t1) / (t1 - t2)]),
      check: () => {
        // from the times alone: (u − w)t1 = (u + w)t2 gives u; then L
        const uu = Q(w * (t1 + t2), t1 - t2), LL = qmul(qsub(uu, Q(w)), Q(t1));
        return qsay(ask === 'length' ? LL : uu, ans, ask) || (qis(qmul(qadd(uu, Q(w)), Q(t2)), L) ? '' : 'the two lengths differ');
      },
      solution: `Watch from each walker. ${A} sees the train go by at u − ${w} m/s, where u is its speed, and it has to move its whole length L past ${A}, so L = ${t1}(u − ${w}). ${B} sees it go by at u + ${w} m/s, so L = ${t2}(u + ${w}). Setting these equal, ${t1}u − ${t1 * w} = ${t2}u + ${t2 * w}, so ${t1 - t2}u = ${(t1 + t2) * w}. ` +
        (ask === 'length' ? `So u = ${u}, and L = ${t1}·(${u} − ${w}) = <b>${L}</b>.` : `So the train’s speed is u = <b>${u}</b> meters per second.`),
    };
  },
  // a hat dropped in a river: picked up after turning back; the current, where, or how far the canoe went
  (d, ctx) => {
    const [ask, T, c, r] = byTurn(ctx, 'hat', ['current', 'distance', 'total'], [[6, 9, 12, 15, 18, 24, 30], [1, 2, 3, 4, 5], [6, 8, 9, 10, 12]],
      (T, c, r, ask) => r >= c + 3 && (ask === 'current' ? r === 6 : true));
    const [A] = names(d, 1), D = (100 * c * T) / 3, total = (100 * r * T) / 3, k = (x) => (50 * x * T) / 3;
    const ans = { current: c, distance: D, total }[ask];
    const story = `Passing under a bridge, ${A} drops a hat, which floats off with the current. ${T} minutes later ${A} notices, turns around at once, and paddles back downstream`;
    const frame = `Watch from the water, which carries the hat and the canoe alike. In the water the hat stays put, and ${A} paddles away from it for ${T} minutes and back at the same speed, so the way back also takes ${T} minutes. So the hat is picked up ${2 * T} minutes after it fell.`;
    return {
      topic: 'Relative speed', rank: { current: 11, distance: 10, total: 11 }[ask],
      text: ask === 'current'
        ? `${A} paddles a canoe upstream with a steady effort. ${story} with the same effort, picking the hat up ${num(D)} meters downstream of the bridge. How fast does the river flow, in kilometers per hour?`
        : `${A} paddles a canoe upstream at ${r} km/h relative to the water, on a river that flows at ${c} km/h. ${story}, still at ${r} km/h relative to the water. ${ask === 'distance' ? `How many meters downstream of the bridge does ${A} pick up the hat?` : `How many meters does the canoe travel in all, from the bridge until ${A} picks up the hat?`}`,
      answer: wchoices(d, ans, {
        current: [2 * c, c + 1, 3 * c, c - 1, 4 * c],
        distance: [D / 2, 2 * D, k(r - c), k(r + c), D + k(c)],
        total: [2 * k(r - c), 2 * k(r + c), total / 2, total + D, k(r)],
      }[ask]),
      check: () => {
        // on the bank, in meters and minutes: the hat drifts at the current; the canoe goes up for T minutes, then down
        const vc = Q(50 * c, 3), vr = Q(50 * (ask === 'current' ? 6 : r), 3), up = qsub(vr, vc), down = qadd(vr, vc);
        const start = qmul(up, Q(T)), meet = qdiv(qadd(start, qmul(down, Q(T))), qsub(down, vc));   // −start + down(t − T) = vc·t
        const where = qmul(vc, meet), went = qadd(start, qmul(down, qsub(meet, Q(T))));
        if (ask === 'current') return qsay(where, D, 'where');
        return qsay(ask === 'distance' ? where : went, ans, ask);
      },
      solution: frame + {
        current: ` In those ${2 * T} minutes the current carried the hat ${num(D)} meters, so in 60 minutes it would carry it ${num(D)}·60 ÷ ${2 * T} = ${num(1000 * c)} meters: the river flows at <b>${c}</b> kilometer${c === 1 ? '' : 's'} per hour.`,
        distance: ` The current flows at ${c} km/h, which is ${c}·1,000 ÷ 60 = ${frac(50 * c, 3)} meters per minute, so in ${2 * T} minutes the hat drifts ${frac(50 * c, 3)}·${2 * T} = <b>${num(D)}</b> meters.`,
        total: ` Upstream the canoe moves at ${r} − ${c} = ${r - c} km/h for ${T} minutes, and downstream at ${r} + ${c} = ${r + c} km/h for ${T} minutes, so it covers as much ground as ${2 * r} km/h for ${T} minutes. That is ${2 * r}·1,000 ÷ 60·${T} = <b>${num(total)}</b> meters.`,
      }[ask],
    };
  },
];

// ---------- Replace and refill ----------
// what is kept each round, as q/p
const KEEP = [[2, 1], [3, 2], [4, 3], [5, 4], [5, 3], [3, 1], [5, 2], [4, 1]];
const DRINKS = [['pure orange juice', 'juice'], ['pure apple cider', 'cider'], ['pure grape juice', 'juice'], ['pure lemonade', 'lemonade']];
// the setups for "the same amount poured out n times" and "twice as much the second time"
const SAME = (n) => KEEP.flatMap(([p, q]) => range(1, 12).map((m) => [p, q, m])).filter(([p, , m]) => m * p ** n >= 16 && m * p ** n <= 250);
const DOUBLE = range(2, 20).map((k) => 10 * k).flatMap((V) => range(1, Math.ceil(V / 2) - 1).map((x) => [V, x])).filter(([V, x]) => ((V - x) * (V - 2 * x)) % V === 0 && x % 1 === 0 && (V - x) * (V - 2 * x) > 0);
const BACK = { two: SAME(2), three: SAME(3), double: DOUBLE };

const refill = [
  // drained and refilled with water two or three times: how much juice, or water, is left
  (d, ctx) => {
    const [[n, ask], [p, q], m] = byTurn(ctx, 'draw', [[2, 'juice'], [3, 'water'], [3, 'juice'], [2, 'water']], [KEEP, range(1, 12)], ([p], m, [n]) => m * p ** n >= 16 && m * p ** n <= 250);
    const V = m * p ** n, x = (V * (p - q)) / p, J = m * q ** n, W = V - J, [full, short] = d.pick(DRINKS), [A] = names(d, 1);
    const kept = (k) => (V * q ** k) / p ** k;
    const ans = ask === 'juice' ? J : W;
    return {
      topic: 'Replace and refill', rank: n === 2 ? 10 : 11,
      text: `${A_(V)} ${V}-liter tank is full of ${full}. ${A} drains ${x} liters, refills the tank with water and stirs well, and then does the same thing ${n === 2 ? 'once more' : 'twice more'}. How many liters of ${ask === 'juice' ? short : 'water'} are in the tank now?`,
      answer: wchoices(d, ans, ask === 'juice' ? [V - n * x, kept(n - 1), W, kept(n + 1), J + x] : [n * x, V - kept(n - 1), J, V - kept(n + 1), W - x]),
      check: () => {
        let jj = Q(V);
        for (let i = 0; i < n; i++) jj = qsub(jj, qmul(jj, Q(x, V)));   // each draining takes x/V of what is there
        return qsay(ask === 'juice' ? jj : qsub(Q(V), jj), ans);
      },
      solution: `The ${x} liters drained each time are a sample of the well-stirred tank, so they take away ${x}/${V} = ${frac(p - q, p)} of the ${short} in it and leave ${frac(q, p)} of it; the water poured in brings none back. So each round multiplies the ${short} by ${frac(q, p)}. After ${n} rounds the tank has ${V}·(${frac(q, p)})<sup>${n}</sup> = ` +
        (ask === 'juice' ? `<b>${J}</b> liters of ${short}.` : `${J} liters of ${short}, so the other ${V} − ${J} = <b>${W}</b> liters are water.`),
    };
  },
  // working back: how much was poured out each time, or the first time when the second pour is twice as much
  (d, ctx) => {
    const [form, i] = byTurn(ctx, 'back', ['two', 'double', 'three'], [range(0, 40)], (i, form) => i < BACK[form].length);
    const [full, short] = d.pick(DRINKS), [A] = names(d, 1);
    if (form === 'double') {
      const [V, x] = BACK.double[i], J = ((V - x) * (V - 2 * x)) / V, other = cut(3 * V - 2 * x, 2);
      return {
        topic: 'Replace and refill', rank: 14,
        text: `${A_(V)} ${V}-liter tank is full of ${full}. ${A} drains some of it, refills the tank with water and stirs well. Then ${A} drains twice as much of the mixture as the first time and refills the tank with water again. The tank now holds ${J} liters of ${short}. How many liters did ${A} drain the first time?`,
        answer: wchoices(d, x, [(V - J) / 3, (V - J) / 2, 2 * x, V - J, val(other)]),
        check: () => {
          // try every amount, in steps of a tenth of a liter
          const ok = range(1, 10 * V).filter((t) => { const a = Q(t, 10), left = qmul(qsub(Q(V), a), qsub(Q(1), qdiv(qmul(Q(2), a), Q(V)))); return qmul(Q(2), a)[0] <= BigInt(V) * qmul(Q(2), a)[1] && qis(left, J); });
          return ok.length === 1 && ok[0] === 10 * x ? '' : `found ${ok.map((t) => t / 10).join(', ')}`;
        },
        solution: `Say ${A} drains x liters the first time, which leaves ${V} − x liters of ${short}. The second time 2x of the ${V} liters go, taking 2x/${V} of the ${short} and leaving (${V} − 2x)/${V} of it, so (${V} − x)(${V} − 2x)/${V} = ${J}. Multiplying out, 2x<sup>2</sup> − ${3 * V}x + ${num(V * V)} = ${num(J * V)}, so 2x<sup>2</sup> − ${3 * V}x + ${num(V * V - J * V)} = 0, which factors as (x − ${x})(2x − ${3 * V - 2 * x}) = 0. The other root, ${fr(other)}, is more than the whole tank, so x = <b>${x}</b>.`,
      };
    }
    const n = form === 'two' ? 2 : 3, [p, q, m] = BACK[form][i], V = m * p ** n, J = m * q ** n, x = (V * (p - q)) / p;
    return {
      topic: 'Replace and refill', rank: n === 2 ? 12 : 13,
      text: `${A_(V)} ${V}-liter barrel is full of ${full}. ${A} pours out some of it, refills the barrel with water and stirs well, and then pours out the same amount of the mixture and refills it with water again${n === 3 ? ', and then does it a third time' : ''}. The barrel now holds ${J} liters of ${short}. How many liters did ${A} pour out each time?`,
      answer: wchoices(d, x, [(V - J) / n, V - J, (V * q) / p, ((V - J) * 2) / (n + 1), x * n]),
      check: () => {
        const ok = range(1, 10 * V - 1).filter((t) => { let jj = Q(V); for (let k = 0; k < n; k++) jj = qmul(jj, Q(10 * V - t, 10 * V)); return qis(jj, J); });
        return ok.length === 1 && ok[0] === 10 * x ? '' : `found ${ok.map((t) => t / 10).join(', ')}`;
      },
      solution: `Each time x liters of the ${V} go, they take x/${V} of the ${short}, so the ${short} is multiplied by (${V} − x)/${V}. After ${n} pours, ${V}·((${V} − x)/${V})<sup>${n}</sup> = ${J}, so ((${V} − x)/${V})<sup>${n}</sup> = ${frac(J, V)} = (${frac(q, p)})<sup>${n}</sup>. So (${V} − x)/${V} = ${frac(q, p)}, which makes ${V} − x = ${(V * q) / p} and x = <b>${x}</b>.`,
    };
  },
  // coffee into milk and some of the mixture back: what fraction of a cup is milk, or coffee
  (d, ctx) => {
    const [ask, a, b, x, y0] = byTurn(ctx, 'cups', ['milkA', 'uneven', 'coffeeB'], [[100, 120, 150, 200, 240, 250, 300], [100, 120, 150, 180, 200, 240], [20, 25, 30, 40, 50, 60], [10, 15, 20, 30, 40, 45, 60, 75, 80]],
      (a, b, x, y, ask) => x < a && (ask === 'uneven' ? y !== x && y <= b + x && y < a && cut(y * b, (b + x) * (a - x + y))[1] <= 60 : y === 10 && cut(x * b, (b + x) * a)[1] <= 60));
    const y = ask === 'uneven' ? y0 : x, [A] = names(d, 1);
    const milkBack = cut(y * b, b + x), coffeeBack = cut(y * x, b + x);
    const ans = { milkA: cut(x * b, (b + x) * a), coffeeB: cut(x, b + x), uneven: cut(y * b, (b + x) * (a - x + y)) }[ask];
    const wrong = {
      milkA: [cut(x, a), cut(x, a + x), cut(x, b + x), cut(x * b, (b + x) * (a + x)), cut(x * x, a * (b + x))],
      coffeeB: [cut(x, b), cut(x * x, b * (b + x)), cut(x, a), cut(x * b, a * (b + x)), cut(b, b + x)],
      uneven: [cut(y, a - x + y), cut(y * b, (b + x) * a), cut(y, a), cut(y * x, (b + x) * (a - x + y)), cut(y * b, (b + y) * (a - x + y))],
    }[ask];
    return {
      topic: 'Replace and refill', rank: ask === 'uneven' ? 12 : 11,
      text: `Cup A holds ${a} mL of coffee and cup B holds ${b} mL of milk. ${A} pours ${x} mL from cup A into cup B and stirs well, then pours ${y} mL from cup B back into cup A and stirs again. What fraction of the liquid in cup ${ask === 'coffeeB' ? 'B is now coffee' : 'A is now milk'}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        // follow the coffee and the milk in each cup
        let A1 = { c: Q(a), m: Q(0) }, B1 = { c: Q(0), m: Q(b) };
        const pour = (from, to, amt) => { const tot = qadd(from.c, from.m), sc = qdiv(qmul(from.c, Q(amt)), tot), sm = qdiv(qmul(from.m, Q(amt)), tot); return [{ c: qsub(from.c, sc), m: qsub(from.m, sm) }, { c: qadd(to.c, sc), m: qadd(to.m, sm) }]; };
        [A1, B1] = pour(A1, B1, x); [B1, A1] = pour(B1, A1, y);
        const got = ask === 'coffeeB' ? qdiv(B1.c, qadd(B1.c, B1.m)) : qdiv(A1.m, qadd(A1.c, A1.m));
        return qsay(got, ans);
      },
      solution: `After the first pour, cup B holds ${b} mL of milk and ${x} mL of coffee, ${b + x} mL in all, so ${frac(b, b + x)} of it is milk and ${frac(x, b + x)} is coffee. The ${y} mL poured back is that same mixture, so it carries ${y}·${frac(b, b + x)} = ${fr(milkBack)} mL of milk and ${fr(coffeeBack)} mL of coffee. ` + {
        milkA: `Cup A is back to ${a} mL, so the fraction that is milk is ${fr(milkBack)} ÷ ${a} = <b>${fr(ans)}</b>.`,
        coffeeB: `Cup B is back to ${b} mL, with ${x} − ${fr(coffeeBack)} = ${fr(cut(x * b, b + x))} mL of coffee left in it, so the fraction that is coffee is ${fr(cut(x * b, b + x))} ÷ ${b} = <b>${fr(ans)}</b>.`,
        uneven: `Cup A now holds ${a} − ${x} + ${y} = ${a - x + y} mL, so the fraction that is milk is ${fr(milkBack)} ÷ ${a - x + y} = <b>${fr(ans)}</b>.`,
      }[ask],
    };
  },
  // drained twice and topped up with pure antifreeze: the percent at the end, or at the start
  (d, ctx) => {
    const [ask, [p, q], c0, Vm] = byTurn(ctx, 'acid', ['final', 'start'], [KEEP.filter(([, q]) => q >= 2), range(2, 17).map((k) => 5 * k), [4, 5, 6, 8]],
      ([p, q], c0) => ((100 - c0) * q * q) % (p * p) === 0);
    const V = p * Vm, x = (V * (p - q)) / p, W = ((100 - c0) * q * q) / (p * p), F = 100 - W, [A] = names(d, 1);
    const tenth = (v) => v > 0 && v < 100 && Math.abs(v * 10 - Math.round(v * 10)) < 1e-9;
    const ans = ask === 'final' ? F : c0;
    const wrong = ask === 'final'
      ? [c0 + (2 * (100 - c0) * (p - q)) / p, c0 + ((100 - c0) * (p - q)) / p, 100 - (100 * q * q) / (p * p), W, (c0 * q * q) / (p * p) + 100 - W]
      : [100 - ((100 - F) * p) / q, 100 - c0, (F * q * q) / (p * p), F - (200 * (p - q)) / p, F - (100 * (p - q)) / p];
    const follow = `Follow the water, not the antifreeze: only the draining changes it. Each time, ${x} of the ${V} liters go, taking ${frac(p - q, p)} of the water and leaving ${frac(q, p)} of it, and pure antifreeze adds no water. So two rounds leave (${frac(q, p)})<sup>2</sup> = ${frac(q * q, p * p)} of the water.`;
    return {
      topic: 'Replace and refill', rank: ask === 'final' ? 12 : 13,
      text: ask === 'final'
        ? `${A_(V)} ${V}-liter radiator holds a mixture that is ${c0}% antifreeze and the rest water. ${A} drains ${x} liters and replaces them with pure antifreeze, stirs, and then does the same thing once more. What percent of the mixture is antifreeze now?`
        : `${A_(V)} ${V}-liter radiator holds a mixture of antifreeze and water. ${A} drains ${x} liters and replaces them with pure antifreeze, stirs, and then does the same thing once more. Now the mixture is ${F}% antifreeze. What percent antifreeze was it at the start?`,
      answer: fchoices(d, ans, wrong.filter(tenth)),
      check: () => {
        let acid = Q(c0 * V, 100);
        for (let i = 0; i < 2; i++) acid = qadd(qsub(acid, qmul(acid, Q(x, V))), Q(x));
        return qsay(qdiv(qmul(acid, Q(100)), Q(V)), F, 'final');
      },
      solution: follow + (ask === 'final'
        ? ` The water starts at ${100 - c0}% of the radiator, so it ends at ${100 - c0}%·${frac(q * q, p * p)} = ${W}%. So the antifreeze is 100% − ${W}% = <b>${F}</b>%.`
        : ` The water is now ${100 - F}% of the radiator, so at the start it was ${100 - F}% ÷ ${frac(q * q, p * p)} = ${100 - c0}%. So the mixture started at 100% − ${100 - c0}% = <b>${c0}</b>% antifreeze.`),
    };
  },
];

// ---------- Clock hands ----------
// how the hands are, said in words: together, opposite, or an angle apart
const handsPhrase = (th) => (th === 0 ? 'pointing in the same direction' : th === 180 ? 'pointing in exactly opposite directions' : `exactly ${th}° apart`);
// the clockwise angles from the hour hand to the minute hand at which the hands are th apart
const handsAt = (th) => (th === 0 || th === 180 ? [th] : [th, 360 - th]);
const handsList = (th) => (th === 0 ? '0° (a whole turn)' : th === 180 ? '180°' : `${th}° or ${360 - th}°`);
const clockTime = (H) => (H % 24 === 0 ? 'midnight' : H === 12 ? 'noon' : H < 12 ? `${H}:00 a.m.` : `${H - 12}:00 p.m.`);
// the hands at t = j/U minutes after h o'clock, in units of 1/(2U) of a degree (a whole turn is 720U): [hour, minute]
const hands = (h, j, U) => [(60 * h * U + j) % (720 * U), (12 * j) % (720 * U)];
const apart = ([H, M], U) => { const a = (((M - H) % (720 * U)) + 720 * U) % (720 * U); return Math.min(a, 720 * U - a); };

const WINDOWS = [[7, 17], [1, 11], [8, 20], [2, 9], [10, 22], [5, 15], [13, 21], [3, 14], [9, 16], [6, 18], [4, 23], [11, 19], [1, 20], [14, 23], [2, 17]];

const clock = [
  // from h o'clock, the first or second time the hands are together, opposite or a given angle apart
  (d, ctx) => {
    const events = (h, th) => {
      const R0 = (360 - 30 * h) % 360;
      return handsAt(th).flatMap((tau) => [0, 1].map((k) => ({ tau, D: ((((tau - R0) % 360) + 360) % 360) + 360 * k }))).filter((e) => e.D > 0).sort((x, y) => x.D - y.D);
    };
    const [ask, h, th] = byTurn(ctx, 'next', ['first', 'second'], [range(1, 11), [0, 30, 60, 90, 120, 150, 180]],
      (h, th, ask) => Math.min(30 * h, 360 - 30 * h) !== th && (ask === 'second' || events(h, th)[0].D < 330));
    const ev = events(h, th), R0 = (360 - 30 * h) % 360, a0 = Math.min(30 * h, 360 - 30 * h), i = ask === 'first' ? 0 : 1, D = ev[i].D;
    const ans = cut(2 * D, 11), other = cut(2 * ev[1 - i].D, 11);
    const path = ev.slice(0, i + 1).map((e) => `${e.tau}° after growing ${e.D}°`).join(', and then ');
    return {
      topic: 'Clock hands', rank: ask === 'first' ? 10 : 11,
      text: `At ${h}:00 the hour and minute hands of a clock are ${a0}° apart. How many minutes after ${h}:00 are the hands ${handsPhrase(th)} for the ${ask} time?`,
      answer: fchoices(d, ans, [cut(D, 6), cut(2 * D, 13), other, cut(D, 5), cut(2 * D + 60, 11)], mixed),
      check: () => {
        // step through the hour in elevenths of a minute, placing each hand on its own
        const U = 11, hits = [];
        for (let j = 1; j < 180 * U && hits.length < 2; j++) if (apart(hands(h, j, U), U) === th * 2 * U) hits.push(j);
        return hits[i] === (2 * D * U) / 11 ? '' : `the ${ask} time is ${hits[i]}/${U} minutes`;
      },
      solution: `The minute hand turns 6° a minute and the hour hand ½° a minute, so the minute hand gains 5½° a minute on the hour hand. Measure the angle clockwise from the hour hand to the minute hand: at ${h}:00 it is ${R0}°, and it grows by 5½° a minute, starting again at 0° each time it passes 360°. The hands are ${handsPhrase(th)} when this angle is ${handsList(th)}. Starting from ${R0}°, it reaches ${path}. That takes ${D} ÷ 5½ = ${frac(2 * D, 11)} = <b>${mixed(ans)}</b> minutes.`,
    };
  },
  // how many times between two times of day the hands are together, opposite or a given angle apart
  (d, ctx) => {
    const atHour = (H) => { const a = 30 * (H % 12); return Math.min(a, 360 - a); };
    const [[T1, T2], th] = pick(ctx, 'count', [WINDOWS, [0, 180, 90, 45, 135, 100, 20, 160, 70]], ([T1, T2], th) => atHour(T1) !== th && atHour(T2) !== th);
    const D = T2 - T1, r1 = (330 * T1) % 360, end = r1 + 330 * D;
    const per = handsAt(th).map((tau) => { const ks = range(0, 60).map((k) => tau + 360 * k).filter((v) => v > r1 && v < end); return { tau, ks }; });
    const ans = per.reduce((s, x) => s + x.ks.length, 0), twice = th !== 0 && th !== 180;
    const show = (ks) => (ks.length <= 3 ? listing(ks.map((v) => `${num(v)}°`)) : `${num(ks[0])}°, ${num(ks[1])}°, …, ${num(ks.at(-1))}°`);
    const parts = per.map(({ tau, ks }) => `${ks.length} of the form ${tau}° + a multiple of 360° (${ks.length ? show(ks) : 'none'})`);
    return {
      topic: 'Clock hands', rank: D > 12 ? 14 : 13,
      text: `How many times between ${clockTime(T1)} and ${clockTime(T2)} on the same day are the hour and minute hands of a clock ${handsPhrase(th)}?`,
      answer: wchoices(d, ans, twice ? [2 * D, 2 * D - 2, ans + 1, ans - 1, Math.round((11 * D) / 12)] : [D, D - 1, ans + 1, ans - 1, 2 * ans]),
      check: () => {
        // step through the whole span in elevenths of a minute, placing each hand on its own
        const U = 11;
        let count = 0;
        for (let j = 1; j < 60 * D * U; j++) if (apart(hands(T1 % 12, j, U), U) === th * 2 * U) count++;
        return count === ans ? '' : `counted ${count}`;
      },
      solution: `The minute hand gains 5½° a minute, which is 330° an hour, on the hour hand. Measure the angle clockwise from the hour hand to the minute hand, and let it keep growing past 360° instead of starting again. At ${clockTime(T1)} it is ${r1}°, and in the ${D} hours to ${clockTime(T2)} it grows by 330·${D} = ${num(330 * D)}°, to ${num(end)}°. The hands are ${handsPhrase(th)} when this angle is ${th === 0 ? 'a multiple of 360°' : `${twice ? `${th}° or ${360 - th}°` : '180°'} plus a multiple of 360°`}. Between ${r1}° and ${num(end)}° there ${parts.length > 1 ? `are ${parts.join(', and ')}` : `are ${parts[0]}`}. So it happens <b>${ans}</b> times.`,
    };
  },
  // the hands mirror images in the 12–6 line or the 3–9 line, or the minute hand halfway to the hour hand
  (d, ctx) => {
    const [ask, h] = byTurn(ctx, 'mirror', ['vertical', 'halfway', 'horizontal'], [range(1, 11)], (h, ask) => !(ask === 'horizontal' && h === 6));
    const target = h <= 5 ? 180 : 540;
    const ans = { vertical: cut(720 - 60 * h, 13), horizontal: cut(2 * (target - 30 * h), 13), halfway: cut(60 * h, 23) }[ask];
    const vert = cut(720 - 60 * h, 13), hor = cut(2 * ((h <= 5 ? 180 : 540) - 30 * h), 13);
    const wrong = {
      vertical: [cut(360 - 30 * h, 6), cut(720 - 60 * h, 11), h === 6 ? cut(720 - 60 * h, 14) : hor, cut(720 - 60 * h, 14), cut(360 - 30 * h, 13)],
      horizontal: [cut(target - 30 * h, 6), cut(2 * (target - 30 * h), 11), vert, cut(target - 30 * h, 13), cut(2 * (target - 30 * h), 14)],
      halfway: [cut(5 * h, 2), cut(60 * h, 11), cut(60 * h, 25), cut(30 * h, 23), cut(120 * h, 23)],
    }[ask];
    const pos = `Measure each hand’s angle clockwise from the 12. At m minutes after ${h}:00 the hour hand is at ${30 * h} + ½m degrees, since it moves ½° a minute, and the minute hand is at 6m degrees.`;
    return {
      topic: 'Clock hands', rank: { vertical: 12, horizontal: 13, halfway: 11 }[ask],
      text: `At some time between ${h}:00 and ${h + 1}:00, ` + {
        vertical: 'the hour and minute hands of a clock are mirror images of each other in the line through the 12 and the 6, the same angle from the 12 on opposite sides.',
        horizontal: 'the hour and minute hands of a clock are mirror images of each other in the line through the 3 and the 9, the same angle from that line on opposite sides.',
        halfway: 'the minute hand of a clock points exactly halfway between the 12 and the hour hand, splitting the angle from the 12 clockwise to the hour hand into two equal parts.',
      }[ask] + ` How many minutes after ${h}:00 is it?`,
      answer: fchoices(d, ans, wrong, mixed),
      check: () => {
        // step through the hour in 1/299ths of a minute, placing each hand on its own
        const U = 13 * 23, hits = [];
        for (let j = 0; j < 60 * U; j++) {
          const [H, M] = hands(h, j, U), s = (H + M) % (720 * U);
          if ((ask === 'vertical' && s === 0) || (ask === 'horizontal' && s === 360 * U) || (ask === 'halfway' && H === 2 * M)) hits.push(j);
        }
        return hits.length === 1 && hits[0] * ans[1] === ans[0] * U ? '' : `found ${hits.map((j) => j / U).join(', ')}`;
      },
      solution: pos + {
        vertical: ` Mirror images in the 12–6 line are the same angle from the 12 going opposite ways, so their two angles add up to 360°: ${30 * h} + 6½m = 360. So 6½m = ${360 - 30 * h}, and m = ${360 - 30 * h} ÷ 6½ = <b>${mixed(ans)}</b>.`,
        horizontal: ` Reflecting in the 3–9 line sends a hand at angle a to 180° − a, going round the circle, so the two angles add up to 180° or 540°. In the hour after ${h}:00 the sum ${30 * h} + 6½m runs from ${30 * h}° up to ${30 * h + 390}°, so it must be ${target}°. So 6½m = ${target - 30 * h}, and m = ${target - 30 * h} ÷ 6½ = <b>${mixed(ans)}</b>.`,
        halfway: ` The minute hand is halfway between the 12 and the hour hand when the hour hand’s angle is twice the minute hand’s: ${30 * h} + ½m = 12m. So 11½m = ${30 * h}, and m = ${30 * h} ÷ 11½ = <b>${mixed(ans)}</b>.`,
      }[ask],
    };
  },
];

// ---------- Logic puzzles ----------
const DEEDS = ['broke the vase', 'ate the last cookie', 'let the dog out', 'hid the remote', 'left the gate open', 'spilled the paint'];
// all the orders of 0 … n − 1
const perms = (n) => (n === 0 ? [[]] : perms(n - 1).flatMap((p) => range(0, n - 1).map((i) => [...p.slice(0, i), n - 1, ...p.slice(i)])));
const PERMS = { 4: perms(4), 5: perms(5), 6: perms(6) };
// the names in alphabetical order as choices: [place in that order, name]
const nameChoices = (P, answer, keepOut = []) => {
  const pool = [...P].sort().filter((x) => x === answer || !keepOut.includes(x)).slice(0, 5);
  return labelled([pool.indexOf(answer), answer], pool.filter((x) => x !== answer).map((x) => [pool.indexOf(x), x]));
};

// whodunit: one statement each, exactly one of them true (or exactly one false)
function whoStatements(d) {
  const st = [];
  for (let s = 0; s < 5; s++) {
    const others = range(0, 4).filter((x) => x !== s), earlier = range(0, s - 1).filter((x) => st[x].kind !== 'liar');
    const kind = d.pick(['accuse', 'accuse', 'accuse', 'clear', 'clear', 'clear', 'deny', 'either', 'either', ...(earlier.length ? ['liar', 'liar'] : [])]);
    const [y, z] = d.shuffle(kind === 'liar' ? earlier : others);
    st.push({ kind, y, z: kind === 'either' ? z : undefined });
  }
  return st;
}
const whoTrue = (st, k) => { const t = []; st.forEach((x, s) => { t[s] = x.kind === 'accuse' ? k === x.y : x.kind === 'clear' ? k !== x.y : x.kind === 'deny' ? k !== s : x.kind === 'either' ? k === x.y || k === x.z : !t[x.y]; }); return t; };
const whoSays = (x, P) => ({ accuse: `${P[x.y]} did it.`, clear: `${P[x.y]} didn’t do it.`, deny: 'I didn’t do it.', either: `It was ${P[x.y]} or ${P[x.z]}.`, liar: `${P[x.y]} is lying.` })[x.kind];

// seating in a row: clues true of the real seating, added until only it is left
const SEAT_KINDS = ['adj', 'adj', 'adj', 'notAdj', 'notAdj', 'left', 'left', 'rightNext', 'rightNext', 'gap', 'gap', 'end', 'notEnd'];
const seatHolds = (c, pos, n) => {
  const a = pos[c.a], b = pos[c.b];
  return { adj: Math.abs(a - b) === 1, notAdj: Math.abs(a - b) !== 1, left: a < b, rightNext: a === b + 1, gap: Math.abs(a - b) === c.g + 1, end: a === 0 || a === n - 1, notEnd: a !== 0 && a !== n - 1 }[c.kind];
};
const seatSays = (c, P) => ({
  adj: `${P[c.a]} sits next to ${P[c.b]}.`, notAdj: `${P[c.a]} does not sit next to ${P[c.b]}.`, left: `${P[c.a]} sits somewhere to the left of ${P[c.b]}.`,
  rightNext: `${P[c.a]} sits directly to the right of ${P[c.b]}.`, gap: `Exactly ${c.g === 1 ? 'one person sits' : `${WORDS[c.g]} people sit`} between ${P[c.a]} and ${P[c.b]}.`,
  end: `${P[c.a]} sits in one of the two end seats.`, notEnd: `${P[c.a]} does not sit in an end seat.`,
})[c.kind];
const posOf = (order) => { const pos = []; order.forEach((p, i) => { pos[p] = i; }); return pos; };

// the race: each runner's two claims, a literal (who, place); exactly one of each runner's claims is true
const clash = (x, y) => x !== y && (x.who === y.who || x.at === y.at);

const logic = [
  // whodunit: exactly one statement true, or exactly one false; who did it, or who told the truth (or lied)
  (d, ctx) => {
    const [[mode, ask]] = byTurn(ctx, 'who', [['oneFalse', 'culprit'], ['oneTrue', 'speaker'], ['oneTrue', 'culprit'], ['oneFalse', 'speaker']], [range(0, 9)]);
    const P = names(d, 5), deed = d.pick(DEEDS), want = mode === 'oneTrue' ? 1 : 4;
    let st, fits = [];
    for (let tries = 0; ; tries++) {
      st = whoStatements(d);
      fits = range(0, 4).filter((k) => whoTrue(st, k).filter(Boolean).length === want);
      if (fits.length === 1 && (tries > 3000 || range(0, 4).filter((k) => Math.abs(whoTrue(st, k).filter(Boolean).length - want) === 1).length >= 2)) break;
    }
    const c = fits[0], truth = whoTrue(st, c), odd = range(0, 4).find((s) => truth[s] === (mode === 'oneTrue')), ans = ask === 'culprit' ? P[c] : P[odd];
    const counted = mode === 'oneTrue' ? 'true' : 'false';
    const tryK = (k) => { const t = whoTrue(st, k), who = range(0, 4).filter((s) => t[s] === (mode === 'oneTrue')).map((s) => `${P[s]}’s`); return `If ${P[k]} did it, ${who.length ? `the ${counted} statement${who.length > 1 ? 's are' : ' is'} ${listing(who)}` : `no statement is ${counted}`}.`; };
    return {
      topic: 'Logic puzzles', rank: mode === 'oneFalse' && ask === 'culprit' ? 9 : 10,
      text: `Exactly one of five friends, ${listing(P)}, ${deed}. Each of them made one statement. ${P.map((p, s) => `${p} said, “${whoSays(st[s], P)}”`).join(' ')} Exactly one of the five statements is ${counted}. ${ask === 'culprit' ? `Who ${deed}?` : mode === 'oneTrue' ? 'Who told the truth?' : 'Who lied?'}`,
      answer: nameChoices(P, ans),
      check: () => {
        // each statement as the set of culprits that make it true; a "lying" statement is the other culprits
        const sets = [];
        st.forEach((x, s) => { sets[s] = new Set(range(0, 4).filter((k) => (x.kind === 'accuse' ? k === x.y : x.kind === 'clear' ? k !== x.y : x.kind === 'deny' ? k !== s : x.kind === 'either' ? [x.y, x.z].includes(k) : !sets[x.y].has(k)))); });
        const good = range(0, 4).filter((k) => sets.filter((S) => S.has(k)).length === want);
        if (good.length !== 1) return `${good.length} culprits fit`;
        const liar = range(0, 4).filter((s) => sets[s].has(good[0]) === (mode === 'oneTrue'));
        return (ask === 'culprit' ? P[good[0]] : liar.length === 1 && P[liar[0]]) === ans ? '' : 'another answer';
      },
      solution: `Try each friend as the one who did it, and see which statements are then ${counted}. ${range(0, 4).map(tryK).join(' ')} Only when ${P[c]} did it is exactly one statement ${counted}. ` +
        (ask === 'culprit' ? `So <b>${P[c]}</b> ${deed}.` : `So ${P[c]} ${deed}, and the only ${counted} statement is ${P[odd]}’s: <b>${P[odd]}</b>.`),
    };
  },
  // people in a row of seats with clues: who sits in a seat, at an end, or right of someone
  (d, ctx) => {
    const [[n, ask]] = byTurn(ctx, 'seat', [[5, 'seat'], [6, 'right'], [5, 'end'], [6, 'seat']], [range(0, 9)]);
    const P = names(d, n), all = PERMS[n].map(posOf);
    let order, clues, found = null;
    for (let tries = 0; tries < 400 || !found; tries++) {
      order = d.shuffle(range(0, n - 1));
      const pos = posOf(order);
      let cand = all;
      clues = [];
      for (let k = 0; k < 60 && cand.length > 1; k++) {
        const kind = d.pick(SEAT_KINDS), [a, b] = d.shuffle(range(0, n - 1)), c = { kind, a, b, g: d.pick([1, 2]) };
        if (!seatHolds(c, pos, n)) continue;
        const next = cand.filter((p) => seatHolds(c, p, n));
        if (next.length < cand.length) { clues.push(c); cand = next; }
      }
      if (cand.length !== 1) continue;
      for (const i of d.shuffle(range(0, clues.length - 1))) {           // drop the clues the others make unneeded
        const without = clues.filter((_, j) => j !== i && clues[j]);
        if (all.filter((p) => without.every((c) => !c || seatHolds(c, p, n))).length === 1) clues[i] = null;
      }
      clues = clues.filter(Boolean);
      found = [order, clues];
      if (clues.length >= 4 && clues.length <= n + 1) break;
    }
    [order, clues] = found;
    const pos = posOf(order), fits = (p, list) => list.every((c) => seatHolds(c, p, n));
    // the question: who is in a seat, at an end, or directly right of someone
    // the casework: the seats for the person in the most clues, each ruled out by as few clues as can do it
    const busy = range(0, n - 1).sort((x, y) => clues.filter((c) => c.a === y || c.b === y).length - clues.filter((c) => c.a === x || c.b === x).length)[0];
    const seat = ask === 'seat' ? d.pick(range(1, n).filter((s) => s !== pos[busy] + 1)) : ask === 'end' ? d.pick([1, n]) : 0;
    const X = ask === 'right' ? order[d.pick(range(0, n - 2).filter((i) => order[i + 1] !== busy))] : -1;
    const ans = ask === 'right' ? P[order[pos[X] + 1]] : P[order[seat - 1]];
    const reasons = range(0, n - 1).filter((s) => s !== pos[busy]).map((s) => {
      const here = all.filter((p) => p[busy] === s);
      // the fewest clues that already rule the seat out (all of them do, together)
      const sets = range(1, 2 ** clues.length - 1).map((mask) => range(0, clues.length - 1).filter((i) => (mask >> i) & 1)).sort((x, y) => x.length - y.length);
      const why = sets.find((set) => !here.some((p) => fits(p, set.map((i) => clues[i]))));
      return { s, why: why.map((i) => i + 1) };
    });
    const said = (r) => (r.length === 1 ? `clue ${r[0]} could not hold` : `clues ${listing(r.map(String))} could not ${r.length === 2 ? 'both' : 'all'} hold`);
    const grouped = [];
    for (const r of reasons) { const key = said(r.why), g = grouped.find((x) => x.key === key); if (g) g.seats.push(r.s + 1); else grouped.push({ key, seats: [r.s + 1] }); }
    return {
      topic: 'Logic puzzles', rank: n === 5 ? 10 : 11,
      text: `${listing(P)} sit in a row of ${n} seats, numbered 1 to ${n} from left to right. ${clues.map((c, i) => `(${i + 1}) ${seatSays(c, P)}`).join(' ')} ` +
        (ask === 'right' ? `Who sits directly to the right of ${P[X]}?` : ask === 'end' ? `Who sits in the seat at the ${seat === 1 ? 'left' : 'right'} end?` : `Who sits in seat ${seat}?`),
      answer: nameChoices(P, ans, n === 6 ? [X >= 0 ? P[X] : d.pick(P.filter((x) => x !== ans))] : []),
      check: () => {
        // every seating written as a string of letters, and each clue read off the string
        const L = 'ABCDEF'.slice(0, n), ok = [];
        const rows = PERMS[n].map((o) => o.map((i) => L[i]).join(''));
        for (const row of rows) {
          const at = (i) => row.indexOf(L[i]);
          const good = clues.every((c) => {
            const a = L[c.a], b = L[c.b];
            return { adj: row.includes(a + b) || row.includes(b + a), notAdj: !(row.includes(a + b) || row.includes(b + a)), left: at(c.a) < at(c.b), rightNext: row.includes(b + a),
              gap: new RegExp(`${a}.{${c.g}}${b}|${b}.{${c.g}}${a}`).test(row), end: row[0] === a || row.at(-1) === a, notEnd: row[0] !== a && row.at(-1) !== a }[c.kind];
          });
          if (good) ok.push(row);
        }
        if (ok.length !== 1) return `${ok.length} seatings fit`;
        const row = ok[0], who = ask === 'right' ? row[row.indexOf(L[X]) + 1] : row[seat - 1];
        return P[L.indexOf(who)] === ans ? '' : `the seating gives ${who}`;
      },
      solution: `Try each seat for ${P[busy]}, who is in the most clues. ${grouped.map((g) => `If ${P[busy]} sat in seat ${listing(g.seats.map(String)).replace(/ and /, ' or ')}, ${g.key}.`).join(' ')} So ${P[busy]} sits in seat ${pos[busy] + 1}, and then the clues leave only one seating, from left to right: ${order.map((i) => P[i]).join(', ')}. ` +
        (ask === 'right' ? `So the person directly to the right of ${P[X]} is <b>${ans}</b>.` : `So the person in ${ask === 'end' ? `the ${seat === 1 ? 'left' : 'right'} end seat` : `seat ${seat}`} is <b>${ans}</b>.`),
    };
  },
  // a race: each runner makes two claims about the places, exactly one true; the order, or who finished k-th
  (d, ctx) => {
    const [n] = byTurn(ctx, 'race', [4, 5], [range(0, 9)]);
    const P = names(d, n);
    let order, place, lits;
    for (let tries = 0; tries < 3000; tries++) {
      order = d.shuffle(range(0, n - 1)); place = posOf(order);
      const sigma = d.shuffle(range(0, n - 1)), used = new Set();
      lits = [];
      let bad = false;
      for (let i = 0; i < n && !bad; i++) {
        const t = { who: sigma[i], at: place[sigma[i]] };
        const opts = range(0, n - 1).flatMap((who) => range(0, n - 1).map((at) => ({ who, at }))).filter((f) => f.at !== place[f.who] && f.who !== t.who && f.at !== t.at && !used.has(`${f.who},${f.at}`));
        if (!opts.length) { bad = true; break; }
        const f = d.pick(opts);
        used.add(`${f.who},${f.at}`);
        const pair = d.chance(0.5) ? [t, f] : [f, t];
        pair.forEach((x, slot) => lits.push({ ...x, runner: i, slot, truth: x === t }));
      }
      if (bad) continue;
      // count the ways to pick one true claim per runner with the picked claims fitting together
      let ways = 0;
      for (let mask = 0; mask < 1 << n; mask++) {
        const chosen = range(0, n - 1).map((i) => lits[2 * i + ((mask >> i) & 1)]);
        if (new Set(chosen.map((x) => x.who)).size === n && new Set(chosen.map((x) => x.at)).size === n) ways++;
      }
      if (ways === 1) break;
    }
    const k = d.int(1, n), ans = n === 4 ? order.map((i) => P[i]).join(', ') : P[order[k - 1]];
    const fact = (x) => `${P[x.who]} finished ${ord(x.at + 1)}`;
    const said = (x, i) => (x.who === i ? `I finished ${ord(x.at + 1)}` : fact(x));
    // the reasoning: suppose a claim is true and follow what it forces, until two things clash
    const known = new Map();
    const follow = (start) => {
      const v = new Map(known), why = new Map(), seq = [], queue = [];
      const set = (id, b, r) => { if (v.has(id)) return v.get(id) === b ? null : { id, b, r }; v.set(id, b); why.set(id, r); queue.push(id); if (b) seq.push(id); return null; };
      let bad = set(start, true, { kind: 'assume' });
      while (!bad && queue.length) {
        const id = queue.shift();
        if (v.get(id)) { bad = set(id ^ 1, false, { kind: 'partner', from: id }); for (let j = 0; j < 2 * n && !bad; j++) if (j !== id && clash(lits[id], lits[j])) bad = set(j, false, { kind: 'clash', from: id }); }
        else bad = set(id ^ 1, true, { kind: 'other', from: id });
      }
      return { v, why, seq, bad };
    };
    // why a claim is false (the true claim it clashes with), and a true claim forced by its runner's false one
    const reasonOf = (why, f) => { const r = why.get(f); if (!r || r.kind !== 'clash') return ''; const c = lits[r.from], L = lits[f]; return ` (${c.who === L.who ? `${P[c.who]} finished ${ord(c.at + 1)}` : `${P[c.who]} did`})`; };
    const claimOf = (L) => (L.who === L.runner ? `claim to have finished ${ord(L.at + 1)}` : `claim that ${fact(L)}`);
    const derive = (why, id) => { const f = why.get(id).from, L = lits[f]; return `${P[L.runner]}’s ${claimOf(L)} is false${reasonOf(why, f)}, so ${fact(lits[id])}`; };
    const steps = [];
    for (let guard = 0; guard < n && range(0, n - 1).some((i) => !known.has(2 * i)); guard++) {
      // of the claims not settled yet, the one that leads to a clash fastest
      const tries = range(0, 2 * n - 1).filter((id) => !known.has(id)).map((id) => ({ id, ...follow(id) })).filter((t) => t.bad).sort((x, y) => x.seq.length - y.seq.length);
      const t = tries[0], roots = new Set();
      const up = (id) => { if (roots.has(id)) return; roots.add(id); const r = t.why.get(id); if (r && r.kind === 'other') { const f = t.why.get(r.from); if (f && f.kind === 'clash') up(f.from); } };
      const b = t.bad;
      if (b.r.kind === 'clash') { up(b.r.from); up(b.id); }
      else if (b.r.kind === 'other') { const f1 = t.why.get(b.r.from), f2 = t.why.get(b.id); if (f1?.kind === 'clash') up(f1.from); if (f2?.kind === 'clash') up(f2.from); }
      else { up(b.r.from); up(b.id); }
      const chain = t.seq.filter((id) => roots.has(id) && id !== t.id).map((id) => derive(t.why, id));
      const R = lits[t.id].runner, R2 = lits[b.id].runner;
      const end = b.r.kind === 'clash' ? `${fact(lits[b.id])} and ${fact(lits[b.r.from])} can’t both be true`
        : b.r.kind === 'other' ? `both of ${P[R2]}’s claims, that ${fact(lits[2 * R2])}${reasonOf(t.why, 2 * R2)} and that ${fact(lits[2 * R2 + 1])}${reasonOf(t.why, 2 * R2 + 1)}, would be false`
        : `both of ${P[R2]}’s claims would be true`;
      const before = new Set([...known.keys()].filter((id) => known.get(id)));
      const res = follow(t.id ^ 1);
      for (const [id, b2] of res.v) known.set(id, b2);
      const fresh = [...res.v.keys()].filter((id) => res.v.get(id) && !before.has(id) && id !== (t.id ^ 1));
      steps.push(`Suppose ${P[R]}’s ${claimOf(lits[t.id])} were true. Then ${chain.length ? chain.join('; then ') + '; but ' : ''}${end}. So that claim is false, which makes ${P[R]}’s other claim true, and ${fact(lits[t.id ^ 1])}.` +
        (fresh.length ? ` From there, ${fresh.map((id) => derive(res.why, id)).join('; ')}.` : ''));
    }
    const finalOrder = order.map((i) => P[i]).join(', ');
    const choicesFor = () => {
      if (n === 5) return nameChoices(P, ans);
      const score = (o) => { const pl = posOf(o); return range(0, n - 1).filter((i) => [0, 1].filter((s) => pl[lits[2 * i + s].who] === lits[2 * i + s].at).length === 1).length; };
      const others = d.shuffle(PERMS[4].filter((o) => o.join() !== order.join())).sort((x, y) => score(y) - score(x)).slice(0, 4);
      const idx = (o) => PERMS[4].findIndex((x) => x.join() === o.join());
      return labelled([idx(order), finalOrder], others.map((o) => [idx(o), o.map((i) => P[i]).join(', ')]));
    };
    return {
      topic: 'Logic puzzles', rank: n === 4 ? 12 : 14,
      text: `${listing(P)} ran a race, and there were no ties. Afterward each of them made two claims, exactly one of which was true. ${range(0, n - 1).map((i) => `${P[i]}: “${said(lits[2 * i], i)}, and ${said(lits[2 * i + 1], i)}.”`).join(' ')} ` +
        (n === 4 ? 'In what order did they finish, from first to last?' : `Who finished ${ord(k)}?`),
      answer: choicesFor(),
      check: () => {
        // every finishing order, each runner's two claims read off it
        const fit = PERMS[n].filter((o) => { const pl = posOf(o); return range(0, n - 1).every((i) => (pl[lits[2 * i].who] === lits[2 * i].at) !== (pl[lits[2 * i + 1].who] === lits[2 * i + 1].at)); });
        if (fit.length !== 1) return `${fit.length} orders fit`;
        const got = n === 4 ? fit[0].map((i) => P[i]).join(', ') : P[fit[0][k - 1]];
        if (got !== ans) return `the order gives ${got}`;
        const told = range(0, n - 1).every((i) => known.get(2 * i) === lits[2 * i].truth);
        return told ? '' : 'the reasoning reaches another answer';
      },
      solution: `Each runner has exactly one true claim, so suppose a claim is true and follow what it forces: a true claim makes every claim that gives the same runner another place, or the same place to another runner, false, and a false claim makes its runner’s other claim true. ${steps.join(' ')} ` +
        (n === 4 ? `So the finishing order, from first to last, is <b>${finalOrder}</b>.` : `So the finishing order is ${finalOrder}, and the runner who finished ${ord(k)} is <b>${ans}</b>.`),
    };
  },
];

// ---------- Whole-number puzzles ----------
const tri = (n) => (n * (n + 1)) / 2;
const dollars = (cents) => `$${(cents / 100).toFixed(2)}`;
// a + b·c written with the right sign: 4 + 3c, 3c − 4
const lin = (a, b, v) => (a === 0 ? `${b === 1 ? '' : b}${v}` : a > 0 ? `${a} + ${b === 1 ? '' : b}${v}` : `${b === 1 ? '' : b}${v} − ${-a}`);
const ANIMALS = [['goats', 'sheep', 'chickens'], ['cows', 'pigs', 'hens'], ['geese', 'ducks', 'chicks'], ['llamas', 'goats', 'rabbits']];

const wholes = [
  // nickels, dimes and quarters: how many combinations, the most quarters, or the most dimes
  (d, ctx) => {
    const solve = (n, V) => { const K = (V - 5 * n) / 5, out = []; for (let c = 1; 4 * c < K; c++) { const b = K - 4 * c, a = n - b - c; if (a >= 1) out.push([a, b, c]); } return { K, out }; };
    const [ask, n, V] = byTurn(ctx, 'coins', ['count', 'mostQ', 'mostD'], [range(12, 30), range(20, 100).map((k) => 5 * k)], (n, V) => { const s = solve(n, V).out; return s.length >= 3 && s.length <= 8; });
    const { K, out } = solve(n, V), cmin = out[0][2], cmax = out.at(-1)[2], [A] = names(d, 1);
    const ans = { count: out.length, mostQ: cmax, mostD: K - 4 * cmin }[ask];
    const zeroOK = []; for (let c = 0; 4 * c <= K; c++) { const b = K - 4 * c, a = n - b - c; if (a >= 0) zeroOK.push([a, b, c]); }
    const aIs = lin(n - K, 3, 'c');
    return {
      topic: 'Whole-number puzzles', rank: ask === 'count' ? 11 : ask === 'mostQ' ? 10 : 11,
      text: `${A} has ${n} coins, all nickels, dimes and quarters, with at least one of each, worth ${dollars(V)} in all. ` + {
        count: `How many different combinations of coins could ${A} have?`, mostQ: `What is the greatest number of quarters ${A} could have?`, mostD: `What is the greatest number of dimes ${A} could have?`,
      }[ask],
      answer: wchoices(d, ans, {
        count: [zeroOK.length, out.length + 1, out.length - 1, cmax, cmax - cmin],
        mostQ: [Math.floor(K / 4), cmax + 1, cmax - 1, Math.floor(V / 25), out.length],
        mostD: [K - 4, K, K - 4 * cmax, K - 4 * cmin + 4, Math.floor(V / 10)],
      }[ask]),
      check: () => {
        const all = [];
        for (let a = 1; a <= n; a++) for (let b = 1; a + b < n; b++) { const c = n - a - b; if (5 * a + 10 * b + 25 * c === V) all.push([a, b, c]); }
        const got = { count: all.length, mostQ: Math.max(...all.map((x) => x[2])), mostD: Math.max(...all.map((x) => x[1])) }[ask];
        return got === ans ? '' : `found ${got}`;
      },
      solution: `Say ${A} has a nickels, b dimes and c quarters. Then a + b + c = ${n} and 5a + 10b + 25c = ${V}. Taking 5 times the first equation from the second leaves 5b + 20c = ${V - 5 * n}, so b + 4c = ${K}. Then b = ${K} − 4c is at least 1 only when c ≤ ${cmax}, and a = ${n} − b − c = ${aIs} is at least 1 ${n - K + 3 >= 1 ? 'for every c ≥ 1' : `only when c ≥ ${cmin}`}. ` + {
        count: `So c can be any whole number from ${cmin} to ${cmax}, and each gives exactly one combination: <b>${out.length}</b> in all.`,
        mostQ: `So the most quarters ${A} could have is <b>${cmax}</b>, with ${out.at(-1)[1]} dime${out.at(-1)[1] === 1 ? '' : 's'} and ${out.at(-1)[0]} nickel${out.at(-1)[0] === 1 ? '' : 's'}.`,
        mostD: `Fewer quarters means more dimes, so the most dimes come with c = ${cmin}: b = ${K} − 4·${cmin} = <b>${K - 4 * cmin}</b>.`,
      }[ask],
    };
  },
  // a hundred animals for a hundred dollars, with one kind sold several for a dollar: how many of one kind, or how many ways
  (d, ctx) => {
    const solve = (p1, p2, k, N, D) => { const out = []; for (let x = 1; x < N; x++) for (let y = 1; x + y < N; y++) { const z = N - x - y; if (k * (p1 * x + p2 * y) + z === k * D) out.push([x, y, z]); } return out; };
    const pairsOf = (p1, p2, k, N, D) => { const A = k * p1 - 1, B = k * p2 - 1, R = k * D - N, out = []; for (let x = 1; A * x < R; x++) if ((R - A * x) % B === 0 && (R - A * x) / B >= 1) out.push([x, (R - A * x) / B]); return out; };
    const [ask, p1, p2, k, N, Dm] = byTurn(ctx, 'fowl', ['big', 'count'], [[4, 5, 6, 8, 10], [2, 3, 4], [2, 3, 4, 5], [20, 24, 30, 36, 40, 48, 50, 60, 100], [1, 2, 3]],
      (p1, p2, k, N, Dm, ask) => { if (p2 >= p1) return false; const D = (N * Dm) / 2; if (!Number.isInteger(D)) return false; const s = solve(p1, p2, k, N, D).length, pr = pairsOf(p1, p2, k, N, D).length; return pr <= 8 && (ask === 'big' ? s === 1 : s >= 2 && s <= 5); });
    const D = (N * Dm) / 2, sols = solve(p1, p2, k, N, D), [a1, a2, a3] = d.pick(ANIMALS);
    const A = k * p1 - 1, B = k * p2 - 1, R = k * D - N, step = B / gcd(A, B);
    const pairs = pairsOf(p1, p2, k, N, D);
    const ans = ask === 'big' ? sols[0][0] : sols.length;
    const allZero = []; for (let x = 0; x <= N; x++) for (let y = 0; x + y <= N; y++) if (k * (p1 * x + p2 * y) + (N - x - y) === k * D) allZero.push([x, y]);
    return {
      topic: 'Whole-number puzzles', rank: ask === 'big' ? 12 : 13,
      text: `A farmer spends exactly $${D} on exactly ${N} animals: ${a1} at $${p1} each, ${a2} at $${p2} each, and ${a3} at ${k} for $1. She buys at least one of each kind. ${ask === 'big' ? `How many ${a1} does she buy?` : 'In how many different ways could she do this?'}`,
      answer: wchoices(d, ans, ask === 'big' ? [sols[0][1], sols[0][2], ...pairs.map((p) => p[0]), pairs.length] : [pairs.length, allZero.length, sols.length + 1, sols.length - 1, pairs.length + 1]),
      check: () => {
        // every way, counted by the number of the cheap ones first
        const found = [];
        for (let z = 1; z < N; z++) for (let x = 1; x + z < N; x++) { const y = N - x - z; if (p1 * x * k + p2 * y * k + z === D * k) found.push([x, y, z]); }
        return (ask === 'big' ? found.length === 1 && found[0][0] === ans : found.length === ans) ? '' : `found ${found.length} ways`;
      },
      solution: `Say she buys x ${a1}, y ${a2} and z ${a3}. Then x + y + z = ${N}, and the cost is ${p1}x + ${p2}y + z/${k} = ${D}, or ${k * p1}x + ${k * p2}y + z = ${k * D} after multiplying by ${k}. Subtracting the first equation leaves ${A}x + ${B}y = ${R}. For y to be a whole number, ${R} − ${A}x must be a multiple of ${B}, which happens ${step === 1 ? 'for every x' : `every ${step} steps of x`}; ${pairs.length === 1 ? `the only pair with x and y both at least 1 is (${pairs[0][0]}, ${pairs[0][1]})` : `the pairs with x and y both at least 1 are ${listing(pairs.map(([x, y]) => `(${x}, ${y})`))}`}. ` +
        (pairs.length === sols.length ? `${pairs.length === 1 ? 'That pair leaves' : 'Each of them leaves'} z = ${N} − x − y at least 1, giving ${sols.length === 1 ? `x = ${sols[0][0]}, y = ${sols[0][1]}, z = ${sols[0][2]}` : listing(sols.map(([x, y, z]) => `(${x}, ${y}, ${z})`))}. `
          : `Then z = ${N} − x − y must be at least 1 too, which leaves ${sols.length === 1 ? `only x = ${sols[0][0]}, y = ${sols[0][1]}, z = ${sols[0][2]}` : listing(sols.map(([x, y, z]) => `(${x}, ${y}, ${z})`))}. `) +
        (ask === 'big' ? `So she buys <b>${ans}</b> ${a1}.` : `So there are <b>${ans}</b> ways.`),
    };
  },
  // page numbers: one added twice, or a sheet torn out; which page, how many pages, or the torn pages' sum
  (d, ctx) => {
    // the books (an even number of pages n) and torn sheets k that leave the sum S
    const tornFits = (S) => { const out = []; for (let n = 2; tri(n) - S <= 2 * n; n += 2) { const gap = tri(n) - S; if (gap >= 3 && gap % 4 === 3 && gap <= 2 * n - 1) out.push([n, (gap + 1) / 4]); } return out; };
    const firstEven = (S) => { let m = 2; while (tri(m) <= S) m += 2; return m; };
    const [form, n, k] = byTurn(ctx, 'pages', ['sum', 'twice', 'pages', 'first'], [range(15, 60).map((h) => 2 * h), range(1, 60)],
      (n, k, form) => (form === 'twice' ? k <= n && k % 3 === 1 : 2 * k <= n && tornFits(tri(n) - (4 * k - 1)).length === 1 && tornFits(tri(n) - (4 * k - 1))[0][0] === n && (n < 40 || k > 3)));
    const [A] = names(d, 1);
    if (form === 'twice') {
      const S = tri(n) + k;
      return {
        topic: 'Whole-number puzzles', rank: 10,
        text: `The pages of a booklet are numbered 1, 2, 3, … up to the last page. ${A} adds up all the page numbers but adds one of them twice by mistake, and gets ${num(S)}. Which page number did ${A} add twice?`,
        answer: wchoices(d, k, [S - tri(n - 1), k + 1, k - 1, n, S - tri(n + 1) + 2 * n]),
        check: () => { const ok = []; for (let m = 1; tri(m) < S; m++) for (let p = 1; p <= m; p++) if (tri(m) + p === S) ok.push(p); return ok.length === 1 && ok[0] === k ? '' : `found ${ok.join(', ')}`; },
        solution: `A booklet of n pages has page numbers adding up to 1 + 2 + ⋯ + n = n(n + 1)/2, and ${A}’s total is more than that by one page number, which is at most n. Since n(n + 1)/2 is about n<sup>2</sup>/2, n is near √(2·${num(S)}) ≈ ${Math.round(Math.sqrt(2 * S))}. Now ${n}·${n + 1}/2 = ${num(tri(n))} is less than ${num(S)} by at most ${n}, while ${n + 1}·${n + 2}/2 = ${num(tri(n + 1))} is already more than ${num(S)}. So the booklet has ${n} pages, and the page added twice is ${num(S)} − ${num(tri(n))} = <b>${k}</b>.`,
      };
    }
    const S = tri(n) - (4 * k - 1);
    const m0 = firstEven(S);
    const tried = []; for (let m = m0; tri(m) - S <= 2 * m - 1; m += 2) tried.push(m);
    const verdict = (m) => { const gap = tri(m) - S; return gap % 4 === 3 ? `${num(gap)}, which is 4·${(gap + 1) / 4} − 1, so it works` : `${num(gap)}, which is not 3 more than a multiple of 4`; };
    const next = tried.at(-1) + 2;
    const ans = { pages: n, sum: 4 * k - 1, first: 2 * k - 1 }[form];
    return {
      topic: 'Whole-number puzzles', rank: 12,
      text: `A book has an even number of pages, numbered 1, 2, 3, … on both sides of its sheets: pages 1 and 2 are the two sides of the first sheet, pages 3 and 4 of the second, and so on. One sheet is torn out, and the page numbers left in the book add up to ${num(S)}. ` + {
        pages: 'How many pages did the book have?', sum: 'What is the sum of the two page numbers on the torn-out sheet?', first: 'What is the smaller of the two page numbers on the torn-out sheet?',
      }[form],
      answer: wchoices(d, ans, {
        pages: [n - 2, n + 2, m0, n - 4, n + 4],
        sum: [tri(m0) - S, 4 * k + 3, 4 * k - 5, 2 * k, tri(n + 2) - S],
        first: [2 * k, 2 * k + 1, 2 * k - 3, 4 * k - 1, k],
      }[form]),
      check: () => {
        // every book up to 400 pages, every sheet
        const ok = [];
        for (let m = 2; m <= 400; m += 2) for (let j = 1; 2 * j <= m; j++) if (tri(m) - (2 * j - 1) - 2 * j === S) ok.push([m, j]);
        if (ok.length !== 1) return `${ok.length} books fit`;
        const [m, j] = ok[0];
        return { pages: m, sum: 4 * j - 1, first: 2 * j - 1 }[form] === ans ? '' : 'another book';
      },
      solution: `If the book has n pages, all its page numbers add up to n(n + 1)/2. A sheet holds pages 2k − 1 and 2k, which add up to 4k − 1: one of 3, 7, 11, …, up to 2n − 1, always 3 more than a multiple of 4. So n(n + 1)/2 − ${num(S)} must be a number like that, and it must be positive and at most 2n − 1. The first even n with n(n + 1)/2 above ${num(S)} is ${m0}. ${tried.map((m) => `For n = ${m}, the gap is ${num(tri(m))} − ${num(S)} = ${verdict(m)}.`).join(' ')} For n = ${next} or more the gap is already more than 2n − 1 (${num(tri(next) - S)} > ${2 * next - 1}). ` + {
        pages: `So the book had <b>${n}</b> pages.`, sum: `So the torn pages add up to <b>${4 * k - 1}</b>.`, first: `So the torn sheet holds pages ${2 * k - 1} and ${2 * k}, and the smaller is <b>${2 * k - 1}</b>.`,
      }[form],
    };
  },
];

// ---------- Quarter circles in a square ----------
// an exact answer like 36 − 6π − 9√3, from [coefficient, unit] terms, a positive term first
const UNIT = { '': 1, 'π': Math.PI, '√2': Math.SQRT2, '√3': Math.sqrt(3), 'π√2': Math.PI * Math.SQRT2 };
function sumText(terms) {
  const list = [...terms.filter(([c]) => c > 0), ...terms.filter(([c]) => c < 0)];
  return list.map(([c, u], k) => { const a = Math.abs(c), body = u ? (a === 1 ? u : `${num(a)}${u}`) : num(a); return (k === 0 ? (c < 0 ? '−' : '') : c < 0 ? ' − ' : ' + ') + body; }).join('') || '0';
}
const exact = (terms) => [terms.reduce((s, [c, u]) => s + c * UNIT[u], 0), sumText(terms)];
const whole3 = (terms) => terms.every(([c]) => Number.isInteger(c));
// a multiple of π: 9π, or 16π/9 stacked
const piShow = (v) => { const [p, q] = Array.isArray(v) ? cut(v[0], v[1]) : [v, 1]; const top = `${p === 1 ? '' : num(p, 0)}π`; return q === 1 ? top : `<span class="fr"><span>${top}</span><span>${q}</span></span>`; };

// drawing: the unit square [0, 1]² as a 220-pixel square, y up
const r2 = (v) => Math.round(v * 100) / 100;
const PX = ([x, y]) => [40 + 220 * x, 262 - 220 * y];
const qsvg = (name, parts) => `<svg class="tri" viewBox="0 0 300 300" role="img" aria-label="${name}">${parts.join('')}</svg>`;
const arcPts = ([cx, cy], r, a0, a1, n = 30) => range(0, n).map((i) => { const t = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; return [cx + r * Math.cos(t), cy + r * Math.sin(t)]; });
const line = (list, cls = 'arc') => `<polyline class="${cls}" points="${list.map(PX).map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ')}"/>`;
// a shaded region (the first child of the figure, so the page fills it): pieces of outline, each a list of points
const shade = (pieces, evenodd = false) => `<path class="side"${evenodd ? ' fill-rule="evenodd"' : ''} d="${pieces.map((pp) => 'M' + pp.map(PX).map(([x, y]) => `${r2(x)} ${r2(y)}`).join(' L') + ' Z').join(' ')}"/>`;
const square = () => `<polygon class="side" points="${[[0, 0], [1, 0], [1, 1], [0, 1]].map(PX).map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ')}"/>`;
const corners = () => [['A', [0, 0], [-12, 14]], ['B', [1, 0], [12, 14]], ['C', [1, 1], [12, -8]], ['D', [0, 1], [-12, -8]]]
  .map(([t, p, [dx, dy]]) => { const [x, y] = PX(p); return `<text class="vx" x="${r2(x + dx)}" y="${r2(y + dy)}" text-anchor="middle">${t}</text>`; }).join('');
// a quarter circle of radius 1 centered at a corner, inside the square
const QUARTER = { A: [[0, 0], 0, 90], B: [[1, 0], 90, 180], C: [[1, 1], 180, 270], D: [[0, 1], 270, 360] };
const quarter = (k, r = 1) => line(arcPts(QUARTER[k][0], r, QUARTER[k][1], QUARTER[k][2]));
const S3 = Math.sqrt(3) / 2;
// turning the unit square a quarter turn counterclockwise about its center
const turn = ([x, y], k) => { for (let i = 0; i < k; i++) [x, y] = [1 - y, x]; return [x, y]; };

// area of the points of a rectangle where inside(x, y) holds, slice by slice: on each thin slice the region's edges
// are found exactly from the circles, so only the slices' own width is approximated
function areaOf(inside, circles, [x0, x1, y0, y1], slices = 20000) {
  let total = 0;
  const w = (x1 - x0) / slices;
  for (let i = 0; i < slices; i++) {
    const x = x0 + (i + 0.5) * w, cuts = [y0, y1];
    for (const [cx, cy, r] of circles) { const h = r * r - (x - cx) ** 2; if (h > 0) cuts.push(cy - Math.sqrt(h), cy + Math.sqrt(h)); }
    cuts.sort((a, b) => a - b);
    for (let j = 0; j + 1 < cuts.length; j++) { const a = Math.max(cuts[j], y0), b = Math.min(cuts[j + 1], y1); if (b > a && inside(x, (a + b) / 2)) total += (b - a) * w; }
  }
  return total;
}
const within = (x, y, [cx, cy, r]) => (x - cx) ** 2 + (y - cy) ** 2 < r * r;

const quarters = [
  // quarter circles from two neighboring corners: the region inside both, outside both, or inside exactly one
  (d, ctx) => {
    const [ask, s] = byTurn(ctx, 'two', ['both', 'one', 'outside'], [[6, 12, 18, 24]]);
    const t = s * s, both = [[t / 3, 'π'], [-t / 4, '√3']], out = [[t, ''], [-t / 6, 'π'], [-t / 4, '√3']], one = [[-t / 6, 'π'], [t / 2, '√3']];
    const ans = exact({ both, outside: out, one }[ask]);
    const slips = [[[2 * t / 3, 'π'], [-t / 2, '√3']], [[t / 3, 'π'], [t / 4, '√3']], [[t / 6, 'π'], [-t / 4, '√3']], [[t, ''], [-t / 2, 'π']], [[t, ''], [-t / 3, 'π'], [t / 4, '√3']], [[t / 2, 'π'], [-t / 4, '√3']], [[t, ''], [-t / 6, 'π'], [-t / 2, '√3']], [[-t / 3, 'π'], [t / 2, '√3']]];
    const pieces = {
      both: [[[0, 0], [1, 0], ...arcPts([0, 0], 1, 0, 60), ...arcPts([1, 0], 1, 120, 180)]],
      outside: [[[0, 1], [1, 1], ...arcPts([1, 0], 1, 90, 120), ...arcPts([0, 0], 1, 60, 90)]],
      one: [[[0, 0], [0, 1], ...arcPts([0, 0], 1, 90, 60), ...arcPts([1, 0], 1, 120, 180)], [[1, 0], [1, 1], ...arcPts([1, 0], 1, 90, 120), ...arcPts([0, 0], 1, 60, 0)]],
    }[ask];
    const what = { both: 'inside both quarter circles', outside: 'inside the square but outside both quarter circles', one: 'inside exactly one of the two quarter circles' }[ask];
    const overlap = `The arcs cross at a point P that is ${s} from both A and B, so triangle ABP is equilateral and ∠PAB = ∠PBA = 60°. The region inside both quarter circles is covered by the 60° sector of the circle centered at A between AB and AP, of area ${frac(1, 6)}·π·${s}<sup>2</sup> = ${sumText([[t / 6, 'π']])}, together with the matching sector centered at B. Those two sectors overlap in triangle ABP, of area (√3/4)·${s}<sup>2</sup> = ${sumText([[t / 4, '√3']])}, so the region inside both has area 2·${sumText([[t / 6, 'π']])} − ${sumText([[t / 4, '√3']])} = `;
    return {
      topic: 'Quarter circles in a square', rank: ask === 'both' ? 13 : 14,
      text: `Square ABCD has side length ${s}. Inside it, a quarter circle centered at A runs from B to D, and a quarter circle centered at B runs from A to C. What is the area of the shaded region, the part of the square ${what}?`,
      figure: qsvg(`Square ABCD with quarter circles centered at A and B, the part ${what} shaded`, [shade(pieces), square(), quarter('A'), quarter('B'), corners()]),
      answer: lchoices(ans, [...Object.values({ both, outside: out, one }).map(exact), ...slips.filter(whole3).map(exact)]),
      check: () => {
        const cA = [0, 0, s], cB = [s, 0, s];
        const inside = { both: (x, y) => within(x, y, cA) && within(x, y, cB), outside: (x, y) => !within(x, y, cA) && !within(x, y, cB), one: (x, y) => within(x, y, cA) !== within(x, y, cB) }[ask];
        const got = areaOf(inside, [cA, cB], [0, s, 0, s]);
        return Math.abs(got - ans[0]) < 1e-5 * t ? '' : `measured ${got}, said ${ans[0]}`;
      },
      solution: overlap + (ask === 'both' ? `<b>${ans[1]}</b>.` : `${sumText(both)}. ` + (ask === 'outside'
        ? `Each quarter circle has area ${sumText([[t / 4, 'π']])}, so together they cover ${sumText([[t / 4, 'π']])} + ${sumText([[t / 4, 'π']])} − (${sumText(both)}) = ${sumText([[t / 6, 'π'], [t / 4, '√3']])} of the square, counting the overlap once. The shaded region is the rest: ${t} − (${sumText([[t / 6, 'π'], [t / 4, '√3']])}) = <b>${ans[1]}</b>.`
        : `Each quarter circle has area ${sumText([[t / 4, 'π']])}, and the part of it inside only that one is ${sumText([[t / 4, 'π']])} − (${sumText(both)}) = ${sumText([[-t / 12, 'π'], [t / 4, '√3']])}. There are two such parts, so the shaded area is <b>${ans[1]}</b>.`)),
    };
  },
  // a circle touching both arcs and a side of the square: its radius or its area
  (d, ctx) => {
    const [[where, ask], s] = byTurn(ctx, 'touch', [['top', 'radius'], ['bottom', 'area'], ['top', 'area'], ['bottom', 'radius']], [[8, 16, 24, 32, 48, 64]], (s, [where]) => (where === 'top' ? s % 16 === 0 : s <= 32));
    const top = where === 'top', r = top ? s / 16 : (3 * s) / 8, [A] = names(d, 1);
    const radiusWrong = top ? [cut(s, 8), cut(s, 12), cut(s, 32), cut(s, 4), cut(s, 6)] : [cut(s, 2), cut(s, 4), cut(3 * s, 16), cut(s, 3), cut(5 * s, 8)];
    const fig = top ? [0.5, 1 - 1 / 16, 1 / 16] : [0.5, 3 / 8, 3 / 8];
    const circlePts = arcPts([fig[0], fig[1]], fig[2], 0, 360, 48);
    return {
      topic: 'Quarter circles in a square', rank: top ? 14 : 13,
      text: `Square ABCD has side length ${s}, with AB along the bottom. Inside it, a quarter circle centered at A runs from B to D, and a quarter circle centered at B runs from A to C. ` +
        (top ? 'A small circle sits above both arcs, touching each of them and touching side CD.' : 'A circle sits inside both quarter circles, touching each arc and touching side AB.') + ` What is ${ask === 'radius' ? 'its radius' : 'its area'}?`,
      figure: qsvg(`Square ABCD with quarter circles centered at A and B and a circle touching both arcs and side ${top ? 'CD' : 'AB'}`, [shade([circlePts]), square(), quarter('A'), quarter('B'), corners()]),
      answer: ask === 'radius' ? fchoices(d, r, radiusWrong) : fchoices(d, r * r, radiusWrong.map(([p, q]) => [p * p, q * q]), piShow),
      check: () => {
        // slide the radius until a circle touching the side (centered on the middle line) just touches the arc at A
        const miss = (x) => (top ? Math.hypot(s / 2, s - x) - (s + x) : Math.hypot(s / 2, x) - (s - x));
        let lo = 1e-9, hi = s / 2;
        for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (Math.sign(miss(mid)) === Math.sign(miss(lo))) lo = mid; else hi = mid; }
        const got = (lo + hi) / 2, want = ask === 'radius' ? got : got * got;
        return Math.abs(want - (ask === 'radius' ? r : r * r)) < 1e-7 ? '' : `found radius ${got}`;
      },
      solution: `Let the circle have center O and radius r. By symmetry O is on the line halfway between A and B, ${s / 2} across from A, and ${top ? `since the circle touches CD, O is ${s} − r above AB` : 'since the circle touches AB, O is r above AB'}. ` +
        (top ? `The circle touches the arc centered at A from outside, so AO = ${s} + r. By Pythagoras, ${s / 2}<sup>2</sup> + (${s} − r)<sup>2</sup> = (${s} + r)<sup>2</sup>, which simplifies to ${num((s * s) / 4)} = ${4 * s}r. So r = ${r}`
          : `The circle touches the arc centered at A from inside, so AO = ${s} − r. By Pythagoras, ${s / 2}<sup>2</sup> + r<sup>2</sup> = (${s} − r)<sup>2</sup>, which simplifies to ${num((s * s) / 4)} = ${num(s * s)} − ${2 * s}r. So ${2 * s}r = ${num((3 * s * s) / 4)} and r = ${r}`) +
        (ask === 'radius' ? `, and the radius is <b>${r}</b>.` : `, and the area is π·${r}<sup>2</sup> = <b>${piShow(r * r)}</b>.`),
    };
  },
  // quarter circles from all four corners: the region inside all four, or the parts inside exactly three or two
  (d, ctx) => {
    const [ask, s] = byTurn(ctx, 'four', ['all', 'three', 'two'], [[6, 12, 18, 24]]);
    const t = s * s, all = [[t, ''], [t / 3, 'π'], [-t, '√3']], three = [[-4 * t, ''], [t / 3, 'π'], [2 * t, '√3']], two = [[4 * t, ''], [(-2 * t) / 3, 'π'], [-t, '√3']];
    const ans = exact({ all, three, two }[ask]);
    const slips = [[[2 * t, ''], [-t, '√3']], [[t, ''], [-t / 3, 'π'], [t, '√3']], [[t, ''], [t / 6, 'π'], [-t / 2, '√3']], [[-t, ''], [t / 3, 'π']], [[t, ''], [-t / 4, 'π']], [[-2 * t, ''], [t / 3, 'π'], [t, '√3']], [[t, ''], [(2 * t) / 3, 'π'], [-t, '√3']], [[-4 * t, ''], [(2 * t) / 3, 'π'], [2 * t, '√3']]];
    const Pt = [0.5, S3], Pr = [S3, 0.5], Pb = [0.5, 1 - S3], Pl = [1 - S3, 0.5];
    const center = [...arcPts([0, 0], 1, 60, 30), ...arcPts([0, 1], 1, -30, -60), ...arcPts([1, 1], 1, 240, 210), ...arcPts([1, 0], 1, 150, 120)];
    const cornerPiece = [[0, 0], ...arcPts([0, 1], 1, -90, -60), ...arcPts([1, 1], 1, 240, 210), ...arcPts([1, 0], 1, 150, 180)];
    const sidePiece = [[0, 0], [1, 0], ...arcPts([1, 1], 1, 270, 240), ...arcPts([0, 1], 1, -60, -90)];
    const pieces = ask === 'all' ? [center] : range(0, 3).map((k) => (ask === 'three' ? cornerPiece : sidePiece).map((p) => turn(p, k)));
    const what = { all: 'inside all four quarter circles', three: 'inside exactly three of the quarter circles', two: 'inside exactly two of the quarter circles' }[ask];
    const xText = sumText(all);
    const xWork = `Call P, Q, R and S the four points where neighboring arcs cross. Each is ${s} from two neighboring corners, so it makes an equilateral triangle with them; for example the arcs centered at A and B cross at a point 60° up from AB at both A and B. The region inside all four quarter circles is the square PQRS, with side ${s}(√3 − 1)/√2 and so area ${s}<sup>2</sup>(√3 − 1)<sup>2</sup>/2 = ${sumText([[2 * t, ''], [-t, '√3']])}, plus four slivers between its sides and the arcs. Each sliver is a 30° sector of radius ${s} (area ${sumText([[t / 12, 'π']])}) minus a triangle with two sides ${s} and a 30° angle between them (area ${num(t / 4)}), so the four add up to ${sumText([[t / 3, 'π'], [-t, '']])}. So the region inside all four has area ${sumText([[2 * t, ''], [-t, '√3']])} + ${sumText([[t / 3, 'π'], [-t, '']])} = `;
    return {
      topic: 'Quarter circles in a square', rank: { all: 16, three: 17, two: 18 }[ask],
      text: `Square ABCD has side length ${s}. Four quarter circles of radius ${s} are drawn inside it, one centered at each corner, each running between the two neighboring corners. What is the total area of the shaded region, the part of the square ${what}?`,
      figure: qsvg(`Square ABCD with quarter circles centered at all four corners, the part ${what} shaded`, [shade(pieces), square(), ...['A', 'B', 'C', 'D'].map((k) => quarter(k)), corners()]),
      answer: lchoices(ans, [...[all, three, two].map(exact), ...slips.filter(whole3).map(exact)]),
      check: () => {
        const cs = [[0, 0, s], [s, 0, s], [s, s, s], [0, s, s]], want = { all: 4, three: 3, two: 2 }[ask];
        const got = areaOf((x, y) => cs.filter((c) => within(x, y, c)).length === want, cs, [0, s, 0, s]);
        return Math.abs(got - ans[0]) < 1e-5 * t ? '' : `measured ${got}, said ${ans[0]}`;
      },
      solution: xWork + (ask === 'all' ? `<b>${ans[1]}</b>.` : `${xText}. Every point of the square is inside at least two quarter circles. Call the area inside all four x, inside exactly three y, and inside exactly two z. Then x + y + z = ${t}, the whole square, and adding up the four quarter circles counts each point once for each circle it is in: 4x + 3y + 2z = 4·${sumText([[t / 4, 'π']])} = ${sumText([[t, 'π']])}. Taking twice the first equation from the second gives 2x + y = ${sumText([[t, 'π'], [-2 * t, '']])}, so y = ${sumText([[t, 'π'], [-2 * t, '']])} − 2(${xText}) = ${sumText(three)}. ` +
        (ask === 'three' ? `So the shaded area is <b>${ans[1]}</b>.` : `So z = ${t} − x − y = <b>${ans[1]}</b>.`)),
    };
  },
  // quarter circles of half the side at each corner and a circle in the middle touching all four: its radius, or what is left
  (d, ctx) => {
    const [ask, a] = byTurn(ctx, 'middle', ['shaded', 'radius'], [[1, 2, 3, 4, 5, 6]]);
    const t = a * a, rText = sumText([[a, '√2'], [-a, '']]);
    const ans = ask === 'radius' ? exact([[a, '√2'], [-a, '']]) : exact([[4 * t, ''], [-4 * t, 'π'], [2 * t, 'π√2']]);
    const wrong = ask === 'radius'
      ? [exact([[a, '√2']]), exact([[2 * a, ''], [-a, '√2']]), [a / 2, num(a / 2)], exact([[a, '√3'], [-a, '']]), exact([[2 * a, '√2'], [-2 * a, '']]), exact([[a, '']])]
      : [exact([[4 * t, ''], [-t, 'π']]), exact([[4 * t, ''], [-3 * t, 'π'], [2 * t, 'π√2']]), exact([[3 * t, 'π'], [-2 * t, 'π√2']]), exact([[4 * t, ''], [-4 * t, 'π'], [3 * t, 'π√2']]), exact([[4 * t, ''], [-2 * t, 'π'], [t, 'π√2']])];
    const rr = (Math.SQRT2 - 1) / 2, circle = arcPts([0.5, 0.5], rr, 0, 360, 60);
    const sectors = [[0, 0, 0], [1, 0, 90], [1, 1, 180], [0, 1, 270]].map(([x, y, a0]) => [[x, y], ...arcPts([x, y], 0.5, a0, a0 + 90)]);
    return {
      topic: 'Quarter circles in a square', rank: ask === 'radius' ? 10 : 12,
      text: `A square has side length ${2 * a}. Four quarter circles of radius ${a}, each centered at a corner of the square, are drawn inside it, and a circle in the middle touches all four of them. ` +
        (ask === 'radius' ? 'What is the radius of the middle circle?' : 'What is the area of the shaded region, the part of the square outside all five circles and quarter circles?'),
      figure: qsvg('A square with quarter circles at its corners and a circle in the middle touching all four', [ask === 'shaded' ? shade([[[0, 0], [1, 0], [1, 1], [0, 1]], ...sectors, circle], true) : shade([circle]), square(), ...sectors.map((p) => line(p.slice(1))), ask === 'shaded' ? line(circle) : '']),
      answer: lchoices(ans, wrong),
      check: () => {
        const r = a * Math.SQRT2 - a, cs = [[0, 0, a], [2 * a, 0, a], [2 * a, 2 * a, a], [0, 2 * a, a], [a, a, r]];
        if (Math.abs(Math.hypot(a, a) - (a + r)) > 1e-9) return 'the middle circle does not touch';
        if (ask === 'radius') return Math.abs(r - ans[0]) < 1e-9 ? '' : `radius ${r}`;
        const got = areaOf((x, y) => !cs.some((c) => within(x, y, c)), cs, [0, 2 * a, 0, 2 * a]);
        return Math.abs(got - ans[0]) < 1e-5 * t ? '' : `measured ${got}, said ${ans[0]}`;
      },
      solution: `The middle circle is centered at the center O of the square, half a diagonal from each corner: ${a}√2. Along the line from a corner to O, the quarter circle covers the first ${a}, and the middle circle must fill the rest up to O, since it just touches. So its radius is r = ` +
        (ask === 'radius' ? `<b>${ans[1]}</b>.` : `${rText}` + `. Its area is π(${rText})<sup>2</sup> = π(${sumText([[3 * t, ''], [-2 * t, '√2']])}) = ${sumText([[3 * t, 'π'], [-2 * t, 'π√2']])}. The four quarter circles make up one whole circle of radius ${a}, of area ${sumText([[t, 'π']])}. So the shaded area is ${4 * t} − ${sumText([[t, 'π']])} − (${sumText([[3 * t, 'π'], [-2 * t, 'π√2']])}) = <b>${ans[1]}</b>.`),
    };
  },
];

// ---------- Mean, median and mode ----------
// is u the only most common value of the list?
const onlyMode = (list, u) => { const c = new Map(); for (const x of list) c.set(x, (c.get(x) || 0) + 1); const top = c.get(u) || 0; return [...c].every(([x, k]) => x === u || k < top); };
// a fraction as a decimal when it ends, otherwise stacked
const decShow = (v) => { const [p, q] = Array.isArray(v) ? cut(v[0], v[1]) : [v, 1]; let r = q; while (r % 2 === 0) r /= 2; while (r % 5 === 0) r /= 5; return r === 1 ? num(p / q, 4) : frac(p, q); };

const averages = [
  // mean, median and only mode given: the largest the biggest number can be, or the smallest
  (d, ctx) => {
    // with seven numbers the mode appears twice (the six others at least 1, u, u, m, m + 1, m + 2) or three times
    // (u, u, u, m, m, m + 1): whichever leaves more for the largest
    const twice = (u, m) => 2 * u + 3 * m + 4, thrice = (u, m) => 3 * u + 3 * m + 1;
    const [form, M, m, u] = byTurn(ctx, 'mmm', ['max5', 'max7', 'min5'], [range(8, 18), range(5, 16), range(1, 12)], (M, m, u, form) => {
      if (u + 1 >= m || m === M) return false;
      if (form === 'max5') { const e = 5 * M - 2 * u - 2 * m - 1; return e > m + 1 && e < 4 * M; }
      if (form === 'min5') { const S2 = 5 * M - 2 * u - m, e = Math.floor(S2 / 2) + 1; return S2 - e >= m + 1; }
      const g = 7 * M - Math.min(twice(u, m), thrice(u, m)); return u >= 2 && u !== 3 && g >= m + 3 && g < 5 * M;
    });
    const n = form === 'max7' ? 7 : 5, S = n * M, low = Math.min(twice(u, m), thrice(u, m)), high = Math.max(twice(u, m), thrice(u, m));
    const ans = form === 'max5' ? S - 2 * u - 2 * m - 1 : form === 'min5' ? Math.floor((S - 2 * u - m) / 2) + 1 : S - low;
    const S2 = S - 2 * u - m, dd = S2 - ans;
    const wrong = {
      max5: [S - 2 * u - 2 * m, S - 2 - 2 * m - 1, S - 2 * u - m, ans - 1, S - u - 2 * m - 1],
      min5: [Math.ceil(S2 / 2), ans + 1, Math.floor(S2 / 2), ans + 2, m + 2],
      max7: [S - high, S - 3 * u - 3 * m - 4, S - 3 * u - 3 * m - 2, S - 3 * u - 3 * m, ans + 1],
    }[form];
    return {
      topic: 'Mean, median and mode', rank: { max5: 11, min5: 12, max7: 15 }[form],
      text: `A list of ${n} positive integers has mean ${M}, median ${m}, and a unique mode of ${u}. What is the ${form === 'min5' ? 'smallest' : 'largest'} possible value of the largest number in the list?`,
      answer: wchoices(d, ans, wrong),
      check: () => {
        // every list in order, with the median in the middle
        let best = form === 'min5' ? Infinity : -Infinity;
        const keep = (list) => { const top = list.at(-1); if (onlyMode(list, u)) best = form === 'min5' ? Math.min(best, top) : Math.max(best, top); };
        if (n === 5) { for (let a = 1; a <= m; a++) for (let b = a; b <= m; b++) for (let e4 = m; a + b + m + 2 * e4 <= S; e4++) keep([a, b, m, e4, S - a - b - m - e4]); }
        else for (let a = 1; a <= m; a++) for (let b = a; b <= m; b++) for (let c = b; c <= m; c++) for (let e = m; a + b + c + m + 3 * e <= S; e++) for (let f = e; a + b + c + m + e + 2 * f <= S; f++) keep([a, b, c, m, e, f, S - a - b - c - m - e - f]);
        return best === ans ? '' : `found ${best}`;
      },
      solution: `The ${n} numbers add up to ${n}·${M} = ${S}, and in order the middle one is the median, ${m}. ` + {
        max5: `The mode ${u} is less than ${m}, so it can only be the two smallest numbers, and it appears exactly twice. Then no other number may appear twice, so the fourth number is not ${m}: it is at least ${m + 1}. To make the largest number as big as possible, make the others as small as possible: ${u}, ${u}, ${m}, ${m + 1}, which add up to ${2 * u + 2 * m + 1}. So the largest number can be ${S} − ${2 * u + 2 * m + 1} = <b>${ans}</b>.`,
        min5: `The mode ${u} is less than ${m}, so it can only be the two smallest numbers, and it appears exactly twice; then no other number may appear twice. That leaves ${S} − ${u} − ${u} − ${m} = ${S2} for the two largest numbers, which must be different and both more than ${m}. To make the larger one as small as possible, split ${S2} as evenly as possible with the two different: ${dd} and ${ans}. So the smallest possible value is <b>${ans}</b>.`,
        max7: `The mode ${u} is less than ${m}, so its copies are among the three smallest numbers: it appears twice or three times. If ${u} appears just twice, no other number may appear twice, so the six numbers other than the largest are at least 1, ${u}, ${u}, ${m}, ${m + 1}, ${m + 2}, adding up to ${twice(u, m)}. If ${u} appears three times, other numbers may appear twice, and the six can be ${u}, ${u}, ${u}, ${m}, ${m}, ${m + 1}, adding up to ${thrice(u, m)}. ${twice(u, m) < thrice(u, m) ? `So ${u} should appear just twice` : `So ${u} should appear three times`}, leaving the largest number ${S} − ${low} = <b>${ans}</b>.`,
      }[form],
    };
  },
  // a fifth number added so that the mean equals the median: all three cases work, or only one does
  (d, ctx) => {
    // the three places x can land, each giving one candidate, which counts only if it lands where it was assumed
    const cases = (a, b, c, dd) => { const S = a + b + c + dd; return [{ x: [5 * b - S, 1], ok: 5 * b - S <= b }, { x: cut(S, 4), ok: S / 4 >= b && S / 4 <= c }, { x: [5 * c - S, 1], ok: 5 * c - S >= c }]; };
    const [ask, a, g1, g2, g3] = byTurn(ctx, 'mean=median', ['three', 'one'], [range(1, 20), range(1, 12), range(1, 12), range(1, 12)], (a, g1, g2, g3, ask) => {
      const cs = cases(a, a + g1, a + g1 + g2, a + g1 + g2 + g3), good = cs.filter((c) => c.ok);
      return ask === 'three' ? good.length === 3 && new Set(cs.map((c) => val(c.x))).size === 3 : good.length === 1 && val(good[0].x) !== 0;
    });
    const b = a + g1, c = b + g2, dd = c + g3, S = a + b + c + dd, cs = cases(a, b, c, dd), good = cs.filter((x) => x.ok), shown = d.shuffle([a, b, c, dd]);
    const add = (list) => list.reduce((s, x) => qadd(s, Q(x[0], x[1])), Q(0)), asFrac = (q) => [Number(q[0]), Number(q[1])];
    const ans = asFrac(add(good.map((x) => x.x))), every = asFrac(add(cs.map((x) => x.x)));
    const wrong = ask === 'three'
      ? [cut(S, 4), [5 * b + 5 * c - 2 * S, 1], asFrac(add(good.filter((x) => x.x[1] === 1).map((x) => x.x))), cut(S, 5), [5 * c - S, 1]]
      : [every, ...cs.filter((x) => !x.ok).map((x) => x.x), asFrac(add(cs.filter((x) => !x.ok || x.x[1] === 1).map((x) => x.x))), cut(S, 5)];
    const say = [`If x ≤ ${b}, the median is ${b}`, `If ${b} ≤ x ≤ ${c}, the median is x itself`, `If x ≥ ${c}, the median is ${c}`];
    const eqs = [`(${S} + x)/5 = ${b} gives x = ${num(5 * b - S)}`, `(${S} + x)/5 = x gives x = ${S}/4 = ${decShow(cut(S, 4))}`, `(${S} + x)/5 = ${c} gives x = ${num(5 * c - S)}`];
    const where = ['is not at most ' + b, `is not between ${b} and ${c}`, 'is not at least ' + c];
    const verdicts = cs.map((x, i) => `${say[i]}, and ${eqs[i]}, which ${x.ok ? 'fits' : `does not fit, since it ${where[i]}`}.`);
    return {
      topic: 'Mean, median and mode', rank: 13,
      text: `The numbers ${listing(shown.map(String))} are written on a board. ${names(d, 1)[0]} writes one more real number, x, and the mean of the five numbers turns out to equal their median. What is the sum of all possible values of x?`,
      answer: fchoices(d, ans, wrong, decShow),
      check: () => {
        // try every x in steps of a quarter from −400 to 400: is the mean (exactly) the median?
        const hits = [];
        for (let k = -1600; k <= 1600; k++) { const list = [4 * a, 4 * b, 4 * c, 4 * dd, k].sort((p, q) => p - q); if (4 * S + k === 5 * list[2]) hits.push(Q(k, 4)); }
        return qsay(hits.reduce(qadd, Q(0)), ans) || (hits.length === good.length ? '' : `found ${hits.length} values`);
      },
      solution: `The four numbers add up to ${S}, so the mean of all five is (${S} + x)/5. In order they are ${a}, ${b}, ${c}, ${dd}, and the median of the five depends on where x lands. ${verdicts.join(' ')} ` +
        (good.length === 1 ? `So the only possible value is x = ${decShow(good[0].x)}, and the sum is <b>${decShow(ans)}</b>.` : `So the possible values are ${listing(good.map((x) => decShow(x.x)))}, and they add up to <b>${decShow(ans)}</b>.`),
    };
  },
  // averages without the highest score, without the lowest, without both, and the gap between them
  (d, ctx) => {
    const [ask, n, A1, gap, j] = byTurn(ctx, 'drop', ['mean', 'lowest', 'count', 'highest'], [range(5, 12), range(40, 85), range(2, 6), range(1, 5)], (n, A1, gap, j, ask) => {
      const A2 = A1 + gap, A3 = A1 + j; if (A3 >= A2) return false;
      const L = A1 * (n - 1) - A3 * (n - 2), H = A2 * (n - 1) - A3 * (n - 2), T = (A1 + A2) * (n - 1) - A3 * (n - 2);
      let den = cut(T, n)[1]; while (den % 2 === 0) den /= 2; while (den % 5 === 0) den /= 5;   // an average that ends, like 36.8
      return L >= 20 && H <= 100 && (ask !== 'mean' || den === 1);
    });
    const A2 = A1 + gap, A3 = A1 + j, D = gap * (n - 1), T = (A1 + A2) * (n - 1) - A3 * (n - 2), L = T - A2 * (n - 1), H = T - A1 * (n - 1);
    const ans = { mean: cut(T, n), count: n, lowest: L, highest: H }[ask];
    const wrong = {
      mean: [cut(A1 + A2, 2), cut(A1 + A2 + A3, 3), A3, cut(T, n - 1), cut(T + D, n)],
      count: [n - 1, n + 1, D / gap + 2, n + 2, D],
      lowest: [H, A1 - D / 2, L + gap, L - gap, A3 - D],
      highest: [L, A2 + D / 2, H + gap, H - gap, A3 + D],
    }[ask];
    const show = ask === 'mean' ? decShow : showFrac;
    return {
      topic: 'Mean, median and mode', rank: { mean: 13, count: 11, lowest: 12, highest: 12 }[ask],
      text: `In a list of test scores, the highest score and the lowest score each appear only once. Without the highest score, the average of the others is ${A1}. Without the lowest score instead, the average of the others is ${A2}. Without both of them, the average is ${A3}. The highest score is ${D} points more than the lowest. ` + {
        mean: 'What is the average of all the scores?', count: 'How many scores are in the list?', lowest: 'What is the lowest score?', highest: 'What is the highest score?',
      }[ask],
      answer: fchoices(d, ans, wrong.filter((w) => val(w) > 0), show),
      check: () => {
        // a real list: the lowest, the highest and n − 2 scores of average A3 in between; and no other length fits
        const list = [L, ...Array(n - 2).fill(A3), H], sum = list.reduce((s, x) => s + x, 0);
        if (!qis(Q(sum - H, n - 1), A1) || !qis(Q(sum - L, n - 1), A2) || !qis(Q(sum - H - L, n - 2), A3) || H - L !== D || !(L < A3 && A3 < H)) return 'the list does not fit';
        const lengths = range(3, 200).filter((m) => (A2 - A1) * (m - 1) === D);
        const got = { mean: Q(sum, n), count: Q(lengths.length === 1 ? lengths[0] : -1), lowest: Q(L), highest: Q(H) }[ask];
        return qsay(got, ans, ask);
      },
      solution: `Let there be n scores with total T, highest H and lowest L, and turn each average into a total: T − H = ${A1}(n − 1), T − L = ${A2}(n − 1) and T − H − L = ${A3}(n − 2). Subtracting the first from the second gives H − L = ${gap}(n − 1), so ${gap}(n − 1) = ${D}` +
        (ask === 'count' ? `. So n − 1 = ${D} ÷ ${gap} = ${n - 1}, and there are <b>${n}</b> scores.` : ` and n = ${n}. So T − H = ${A1 * (n - 1)}, T − L = ${A2 * (n - 1)} and T − H − L = ${A3 * (n - 2)}. Adding the first two and taking away the third leaves T = ${A1 * (n - 1)} + ${A2 * (n - 1)} − ${A3 * (n - 2)} = ${T}. ` + {
          mean: `So the average of all ${n} scores is ${T} ÷ ${n} = <b>${decShow(ans)}</b>.`,
          lowest: `So L = T − ${A2 * (n - 1)} = <b>${L}</b>.`,
          highest: `So H = T − ${A1 * (n - 1)} = <b>${H}</b>.`,
        }[ask]),
    };
  },
];

// ---------- Calendars and weekdays ----------
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const LENGTHS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const leap = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
// the day of the week (0 = Sunday) by counting days from a known Monday, January 1, 1900
const dayNumber = (y, m, day) => { let n = 0; for (let k = 1900; k < y; k++) n += leap(k) ? 366 : 365; for (let k = y; k < 1900; k++) n -= leap(k) ? 366 : 365; for (let k = 0; k < m; k++) n += k === 1 && leap(y) ? 29 : LENGTHS[k]; return n + day - 1; };
const weekday = (y, m, day) => (((1 + dayNumber(y, m, day)) % 7) + 7) % 7;
const jsDay = (y, m, day) => new Date(Date.UTC(y, m, day)).getUTCDay();
// five weekdays as choices: the answer, the slips, then the days next to it
const dayChoices = (ans, slips) => {
  const keep = [];
  for (const w of [...slips, ans + 1, ans - 1, ans + 2, ans - 2, ans + 3].map((x) => ((x % 7) + 7) % 7)) if (w !== ans && !keep.includes(w) && keep.length < 4) keep.push(w);
  return labelled([ans, DAYS[ans]], keep.map((w) => [w, DAYS[w]]));
};
const DATES = [[0, 15], [1, 10], [2, 3], [3, 22], [4, 5], [5, 1], [6, 4], [7, 9], [8, 30], [9, 31], [10, 11], [11, 25], [1, 20], [0, 28]];

const calendars = [
  // a date's weekday given, the same date many years away: across 2000, 2100 or 1900, or neither
  (d, ctx) => {
    const SPANS = { within: [2021, 2030, 2060, 2095], with2000: [2021, 2030, 1960, 1999], cross2100: [2021, 2035, 2101, 2130], cross1900: [2021, 2030, 1870, 1899] };
    const [kind, [mo, day], y1k, y2k] = byTurn(ctx, 'years', ['within', 'cross2100', 'with2000', 'cross1900'], [DATES, range(0, 9), range(0, 9)]);
    const [a1, b1, a2, b2] = SPANS[kind], Y1 = a1 + Math.round(((b1 - a1) * y1k) / 9), Y2 = a2 + Math.round(((b2 - a2) * y2k) / 9);
    const lo = Math.min(Y1, Y2), hi = Math.max(Y1, Y2), early = mo <= 1, forward = Y2 > Y1;
    // the February 29ths between the two dates: in the years lo … hi − 1 for a date in January or February, lo + 1 … hi after
    const from = early ? lo : lo + 1, to = early ? hi - 1 : hi, leaps = range(from, to).filter(leap), skipped = range(from, to).filter((y) => y % 4 === 0 && !leap(y));
    const shift = hi - lo + leaps.length, w1 = weekday(Y1, mo, day), sign = forward ? 1 : -1, ans = (((w1 + sign * shift) % 7) + 7) % 7;
    const at = (s) => (((w1 + sign * s) % 7) + 7) % 7;
    const slips = [at(shift + skipped.length), at(shift + (early ? 1 : -1)), at(hi - lo), (((w1 - sign * shift) % 7) + 7) % 7, at(shift + 1), at(shift - 1)];
    const date = `${MONTHS[mo]} ${day}`, w4 = range(from, to).filter((y) => y % 4 === 0);
    return {
      topic: 'Calendars and weekdays', rank: { within: 9, with2000: 10, cross2100: 11, cross1900: 11 }[kind],
      text: `${date}, ${Y1}, is a ${DAYS[w1]}. On what day of the week ${forward ? 'will' : 'did'} ${date}, ${Y2}, fall?`,
      answer: dayChoices(ans, slips),
      check: () => (jsDay(Y1, mo, day) === w1 && jsDay(Y2, mo, day) === ans ? '' : `the calendar says ${DAYS[jsDay(Y1, mo, day)]} and ${DAYS[jsDay(Y2, mo, day)]}`),
      solution: `Each year moves a date one day later in the week, because 365 = 7·52 + 1, and each February 29 in between moves it one day more. From ${date}, ${lo}, to ${date}, ${hi}, is ${hi - lo} years. ${date} comes ${early ? 'before' : 'after'} February 29, so the February 29ths in between are those of the leap years from ${from} to ${to}: the multiples of 4 there run from ${w4[0]} to ${w4.at(-1)}, ${w4.length} of them` +
        (skipped.length ? `, but ${listing(skipped.map(String))} ${skipped.length > 1 ? 'are' : 'is'} not a leap year (divisible by 100 but not by 400), which leaves ${leaps.length}` : leaps.includes(2000) ? ' (2000 is a leap year, being divisible by 400)' : '') +
        `. So the weekday moves ${hi - lo} + ${leaps.length} = ${shift} days, which is ${shift % 7} more than a multiple of 7, ${forward ? 'later' : 'earlier'}: from ${DAYS[w1]} to <b>${DAYS[ans]}</b>.`,
    };
  },
  // the next (or last) year with exactly the same calendar
  (d, ctx) => {
    const same = (Y, dir) => { let shift = 0, y = Y; for (;;) { if (dir > 0) { shift += leap(y) ? 2 : 1; y++; } else { y--; shift += leap(y) ? 2 : 1; } if (shift % 7 === 0 && leap(y) === leap(Y)) return { y, shift }; } };
    const crossing = (Y, t) => [1900, 2100].find((c) => (c - Y) * (c - t) < 0 || c === t);
    const [[kind, dir], Y] = byTurn(ctx, 'again', [['common', 1], ['leap', -1], ['cross', 1], ['common', -1]], [range(1985, 2099)], (Y, [kind, dir]) => {
      const t = same(Y, dir).y, c = crossing(Y, t);
      return t >= 1905 && t <= 2199 && (kind === 'cross' ? c !== undefined : c === undefined && leap(Y) === (kind === 'leap'));
    });
    const { y: ans } = same(Y, dir), L = leap(Y), crosses = crossing(Y, ans) !== undefined;
    // how far January 1 has moved by each year of the same kind, up to the answer
    const moved = [];
    let shift = 0, y = Y;
    while (y !== ans) {
      if (dir > 0) { shift += leap(y) ? 2 : 1; y++; } else { y--; shift += leap(y) ? 2 : 1; }
      if (leap(y) === L) moved.push([y, shift]);
    }
    const later = dir > 0 ? 'later' : 'earlier', items = moved.map(([z, m], i) => (i === 0 ? `${plural(m, 'day')} ${later} in the week by ${z}` : `${m} by ${z}`));
    const movedText = items.length > 8 ? [...items.slice(0, 3), '…', ...items.slice(-3)].join(', ') : listing(items);
    const firstSame = (() => { let s = 0, z = Y; for (;;) { if (dir > 0) { s += leap(z) ? 2 : 1; z++; } else { z--; s += leap(z) ? 2 : 1; } if (s % 7 === 0) return z; } })();
    const wrong = [Y + dir * 28, Y + dir * 6, Y + dir * 11, Y + dir * 5, firstSame, Y + dir * 7, Y + dir * 12].filter((x) => x !== ans);
    return {
      topic: 'Calendars and weekdays', rank: crosses ? 13 : L ? 12 : 11,
      text: `Two years have the same calendar when every date falls on the same day of the week in both. What is the ${dir > 0 ? 'first year after' : 'last year before'} ${Y} with exactly the same calendar as ${Y}?`,
      answer: fchoices(d, ans, wrong, (v) => String(val(v))),
      check: () => {
        // compare every month's first day and February's length, using the built-in calendar
        const cal = (z) => [...range(0, 11).map((m) => jsDay(z, m, 1)), new Date(Date.UTC(z, 2, 0)).getUTCDate()].join();
        let z = Y + dir;
        while (cal(z) !== cal(Y)) z += dir;
        return z === ans ? '' : `the calendar says ${z}`;
      },
      solution: `Two years have the same calendar exactly when they start on the same day of the week and are both leap years or both not; ${Y} ${L ? 'is' : 'is not'} a leap year. A common year moves the next January 1 one day later in the week, and a leap year moves it two` +
        (crosses ? `, and ${crossing(Y, ans)} is not a leap year (divisible by 100 but not by 400). ` : '. ') +
        `Going ${dir > 0 ? 'forward' : 'back'} from ${Y} and counting only the ${L ? 'leap' : 'common'} years, January 1 has moved ${movedText}. The first of these that is a multiple of 7 is ${moved.at(-1)[1]}, so the year is <b>${ans}</b>.`,
    };
  },
  // the weekday counts in a month, or a year with 53 of one or two weekdays
  (d, ctx) => {
    const [form, X, len, mo, day] = byTurn(ctx, 'count', ['same', 'year1', 'more', 'year2'], [range(0, 6), [29, 30, 31], range(0, 11), [1, 4, 10, 15, 25, 31]],
      (X, len, mo, day, form) => (form.startsWith('year') ? len === 30 && day <= LENGTHS[mo] && !(mo === 0 && day === 1) : mo === 0 && day === 1));
    if (form === 'same' || form === 'more') {
      const Y = (X + d.pick([2, 3, 4])) % 7, extra = len - 28;
      const starts = range(0, 6).filter((s) => { const five = range(0, extra - 1).map((i) => (s + i) % 7); return form === 'same' ? five.includes(X) === five.includes(Y) : five.includes(X) && !five.includes(Y); });
      const ans = starts.length;
      return {
        topic: 'Calendars and weekdays', rank: form === 'same' ? 9 : 10,
        text: `A month with ${len} days has ${form === 'same' ? `the same number of ${DAYS[X]}s as ${DAYS[Y]}s` : `more ${DAYS[X]}s than ${DAYS[Y]}s`}. On how many of the seven days of the week could the month have begun?`,
        answer: wchoices(d, ans, form === 'same' ? [7 - ans, ans - 1, ans + 1, extra, 7 - extra] : [extra, ans + 1, ans - 1, 7 - extra, 2 * extra]),
        check: () => {
          // every month of that length from 1901 to 2099, counted day by day with the built-in calendar
          const firsts = new Set();
          for (let z = 1901; z <= 2099; z++) for (let m = 0; m < 12; m++) {
            if (new Date(Date.UTC(z, m + 1, 0)).getUTCDate() !== len) continue;
            const c = Array(7).fill(0);
            for (let k = 1; k <= len; k++) c[jsDay(z, m, k)]++;
            if (form === 'same' ? c[X] === c[Y] : c[X] > c[Y]) firsts.add(jsDay(z, m, 1));
          }
          return firsts.size === ans ? '' : `found ${firsts.size}`;
        },
        solution: `A ${len}-day month is 4 whole weeks and ${plural(extra, 'day')} more. In the 4 weeks every day of the week comes 4 times, and the ${extra === 1 ? 'first day of the month comes' : `first ${extra} days of the month come`} a fifth time. So the ${extra === 1 ? 'day it begins on is' : `${extra} days starting with the one it begins on are`} the ${extra === 1 ? 'only day' : 'days'} with 5. ` +
          (form === 'same' ? `${DAYS[X]}s and ${DAYS[Y]}s come equally often when both or neither of them are among ${extra === 1 ? 'that day' : 'those days'}.` : `There are more ${DAYS[X]}s than ${DAYS[Y]}s exactly when ${DAYS[X]} is among ${extra === 1 ? 'that day' : 'those days'} and ${DAYS[Y]} is not.`) +
          ` Going through the seven possible first days, that works for ${ans ? listing(starts.map((s) => DAYS[s])) : 'none of them'}: <b>${ans}</b>.`,
      };
    }
    const two = form === 'year2', doy = range(0, mo - 1).reduce((s, k) => s + (k === 1 && two ? 29 : LENGTHS[k]), 0) + day, ans = (X + doy - 1) % 7;
    const Y2 = (X + 1) % 7, otherLen = range(0, mo - 1).reduce((s, k) => s + (k === 1 && !two ? 29 : LENGTHS[k]), 0) + day;
    const slips = [(X + otherLen - 1) % 7, (X + doy) % 7, (X + doy - 2 + 7) % 7, two ? (Y2 + doy - 1) % 7 : (X + doy + 1) % 7, (X + doy - 1 + 3) % 7];
    return {
      topic: 'Calendars and weekdays', rank: two ? 11 : 10,
      text: `In a certain year there were 53 ${DAYS[X]}s${two ? ` and 53 ${DAYS[Y2]}s` : ''}, and 52 of every other day of the week. On what day of the week did ${MONTHS[mo]} ${day} fall that year?`,
      answer: dayChoices(ans, slips),
      check: () => {
        // every year from 1901 to 2099 with those counts, counted day by day with the built-in calendar
        const days = new Set();
        let years = 0;
        for (let z = 1901; z <= 2099; z++) {
          const c = Array(7).fill(0), n = leap(z) ? 366 : 365;
          for (let k = 0; k < n; k++) c[new Date(Date.UTC(z, 0, 1 + k)).getUTCDay()]++;
          const big = range(0, 6).filter((w) => c[w] === 53);
          if (big.length === (two ? 2 : 1) && big.includes(X) && (!two || big.includes(Y2))) { years++; days.add(jsDay(z, mo, day)); }
        }
        return years && days.size === 1 && days.has(ans) ? '' : `found ${[...days].map((w) => DAYS[w]).join(', ')}`;
      },
      solution: `A year is 52 whole weeks and 1 more day, or 2 more in a leap year, and the extra days are the first one or two days of the year. ${two ? `With two days of the week at 53, it was a leap year, and its first two days were a ${DAYS[X]} and a ${DAYS[Y2]}: January 1 was a ${DAYS[X]}.` : `With only one day of the week at 53, it was not a leap year, and January 1 was a ${DAYS[X]}.`} ${MONTHS[mo]} ${day} is day ${doy} of the year, ${doy - 1} days after January 1, and ${doy - 1} = 7·${Math.floor((doy - 1) / 7)} + ${(doy - 1) % 7}. So it fell ${plural((doy - 1) % 7, 'day')} later in the week than ${DAYS[X]}: <b>${DAYS[ans]}</b>.`,
    };
  },
];

export const topMiddle = {
  'Relative speed': relative,
  'Replace and refill': refill,
  'Clock hands': clock,
  'Logic puzzles': logic,
  'Whole-number puzzles': wholes,
  'Quarter circles in a square': quarters,
  'Mean, median and mode': averages,
  'Calendars and weekdays': calendars,
};
