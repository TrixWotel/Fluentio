// AMC 10–style probability: 11 topics, each with three or four different kinds of question on the same idea (who wins,
// what makes a game fair, three players, a time limit…), modelled on past contest ideas with new numbers and wording.
// Every answer is exact, and check() gets it a second way, usually by counting the outcomes one by one.
import { combo, num, frac, gcd, choose } from '../kit/bank.js';
import { choices, showFrac, range } from './amc-kit.js';

const cut = (p, q) => { const g = gcd(p, q) || 1; return [p / g, q / g]; };
const fr = ([p, q]) => frac(p, q);
// a fraction as written, not reduced (for working that goes on to reduce it)
const raw = (p, q) => `<span class="fr"><span>${num(p)}</span><span>${num(q)}</span></span>`;
// "p/q = " before a fraction that reduces, nothing when p/q is already in lowest terms
const ratio = (p, q) => (gcd(p, q) === 1 ? '' : `${num(p)}/${num(q)} = `);
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const Cap = (s) => s[0].toUpperCase() + s.slice(1);
const listOr = (xs) => (xs.length < 2 ? String(xs[0]) : `${xs.slice(0, -1).join(', ')} or ${xs.at(-1)}`);
// √v, or its whole-number root when v is a perfect square
const root = (v) => (Number.isInteger(Math.sqrt(v)) ? String(Math.sqrt(v)) : `√${v}`);
const sum = ([p, q]) => p + q;
const under1 = ([p, q]) => p > 0 && p < q;
// combo, with a name of its own for each kind of question, so no two kinds share a list of combinations
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const modpow = (b, e, m) => { let r = 1 % m; b %= m; while (e > 0) { if (e & 1) r = (r * b) % m; b = (b * b) % m; e = Math.floor(e / 2); } return r; };
const popcount = (x) => { let c = 0; for (; x; x &= x - 1) c++; return c; };
const listing = (xs) => (xs.length < 2 ? String(xs[0]) : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const factor = (n) => { const f = []; for (let p = 2; p * p <= n; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) f.push([p, e]); } if (n > 1) f.push([n, 1]); return f; };
const pw = (b, e) => (e === 1 ? `${b}` : `${b}<sup>${e}</sup>`);
const shown = (n) => factor(n).map(([p, e]) => pw(p, e)).join(' · ');
const tau = (n) => factor(n).reduce((a, [, e]) => a * (e + 1), 1);
const divisorsOf = (n) => range(1, n).filter((x) => n % x === 0);
// the share of a w-by-h box where inside(x, y) holds, on a fine grid (for checking areas)
function share(w, h, inside, G = 1000) {
  let hit = 0;
  for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) if (inside(((i + 0.5) * w) / G, ((j + 0.5) * h) / G)) hit++;
  return hit / (G * G);
}
// every way n dice can land (as arrays), for checks
function* rolls(n, faces = 6) { const a = Array(n).fill(1); for (;;) { yield a; let i = 0; while (i < n && a[i] === faces) a[i++] = 1; if (i === n) return; a[i]++; } }
const totals = (n) => { let ways = [1]; for (let i = 0; i < n; i++) { const next = Array(ways.length + 6).fill(0); ways.forEach((w, t) => { for (let f = 1; f <= 6; f++) next[t + f] += w; }); ways = next; } return ways; };
const NAMES = [['Nadia', 'Owen'], ['Lucia', 'Marek'], ['Tess', 'Uma'], ['Farid', 'Gwen'], ['Hana', 'Ivo']];
const TRIOS = [['Ana', 'Ben', 'Cleo'], ['Dev', 'Ella', 'Finn'], ['Gia', 'Hugo', 'Isla'], ['Jun', 'Kira', 'Leo']];

export const probability = {
  'Taking turns': [
    // two players take turns until one succeeds: only the rounds that end the game matter
    (d, ctx) => {
      const [[p1, q1], [p2, q2], second] = pick(ctx, 'who', [[[1, 4], [1, 5], [2, 5], [1, 6], [2, 7], [3, 8], [1, 2], [3, 5]], [[1, 3], [1, 4], [1, 2], [2, 5], [3, 5], [1, 5], [2, 3]], [false, true]],
        ([p1, q1], [p2, q2]) => p1 * q2 + (q1 - p1) * p2 <= 60);
      const [P, Q] = d.pick(NAMES), wA = p1 * q2, wB = (q1 - p1) * p2, who = second ? Q : P, ans = cut(second ? wB : wA, wA + wB);
      const a = p1 / q1, b = p2 / q2, g = gcd(wA, wB);
      return {
        topic: 'Taking turns', rank: 18,
        text: `${P} and ${Q} take turns throwing a ball at a can, ${P} first. Each of ${P}’s throws knocks the can over with probability ${frac(p1, q1)}, and each of ${Q}’s with probability ${frac(p2, q2)}, all independently. The first to knock it over wins. What is the probability that ${who} wins?`,
        answer: choices(d, ans, [second ? cut(p2 * q1, p1 * q2 + p2 * q1) : cut(p1 * q2, p1 * q2 + p2 * q1), second ? cut(wB, q1 * q2) : [p1, q1], cut(second ? wA : wB, wA + wB), [1, 2],
          second ? [p2, q2] : cut(p1 * (q2 - p2), q1 * q2), [q1 - p1, q1], [1, 3]].filter(under1), showFrac),
        check: () => {
          let s = 0, r = 1;
          for (let i = 0; i < 4000; i++) { s += second ? r * (1 - a) * b : r * a; r *= (1 - a) * (1 - b); }
          return Math.abs(s - ans[0] / ans[1]) < 1e-12 ? '' : `series gives ${s}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `Think in rounds of two throws, ${P}’s and then ${Q}’s. A round ends with ${P} winning with probability ${frac(p1, q1)}, ends with ${Q} winning with probability ${frac(q1 - p1, q1)}·${frac(p2, q2)} = ${frac(wB, q1 * q2)} (${Q} only throws after a miss), and otherwise the game starts over exactly as before. So only those two endings matter. With the common denominator ${q1 * q2} they are ${raw(wA, q1 * q2)} and ${raw(wB, q1 * q2)}, in the ratio ${wA} : ${wB}${g > 1 ? ` = ${wA / g} : ${wB / g}` : ''}, so ${who} wins with probability ${(second ? wB : wA) / g}/(${wA / g} + ${wB / g}) = <b>${fr(ans)}</b>.`,
      };
    },
    // a fair game: the chance the second player needs so that both are equally likely to win
    (d, ctx) => {
      const [[p, q]] = pick(ctx, 'fair', [[[1, 3], [1, 4], [1, 5], [2, 5], [1, 6], [2, 7], [3, 8], [3, 7], [2, 9], [1, 7], [3, 10], [4, 9]]]);
      const [P, Q] = d.pick(NAMES), b = cut(p, q - p), a = p / q;
      return {
        topic: 'Taking turns', rank: 17,
        text: `${P} and ${Q} take turns shooting at a target, ${P} first, and the first to hit it wins. Each of ${P}’s shots hits with probability ${frac(p, q)}. What must the probability of each of ${Q}’s shots be for the game to be fair, with each of them equally likely to win?`,
        answer: choices(d, b, [[p, q], cut(q - p, q), [1, 2], cut(p, q + p), cut(2 * p, q)].filter(under1), showFrac),
        check: () => {
          const bb = b[0] / b[1];
          let s = 0, r = 1;
          for (let i = 0; i < 4000; i++) { s += r * a; r *= (1 - a) * (1 - bb); }
          return b[0] < b[1] && Math.abs(s - 0.5) < 1e-12 ? '' : `${P} wins with probability ${s}`;
        },
        solution: `Call the chance of each of ${Q}’s shots b, and look at one round. ${P} wins it with probability ${frac(p, q)}; ${Q} only shoots after a miss, so ${Q} wins it with probability ${frac(q - p, q)}·b; otherwise the game starts over. The game is fair when those two endings are equally likely, ${frac(p, q)} = ${frac(q - p, q)}·b, so b = ${frac(p, q)} ÷ ${frac(q - p, q)} = <b>${fr(b)}</b>.`,
      };
    },
    // three players in turn, all with the same chance
    (d, ctx) => {
      const [[p, q], who] = pick(ctx, 'three', [[[1, 2], [1, 3], [1, 4], [2, 3], [2, 5], [1, 5], [3, 4], [3, 5]], [0, 1, 2]]);
      const names = d.pick(TRIOS), m = q - p, w = [q * q, m * q, m * m], S = w[0] + w[1] + w[2], ans = cut(w[who], S), a = p / q;
      return {
        topic: 'Taking turns', rank: 19,
        text: `${names[0]}, ${names[1]} and ${names[2]} take turns, in that order, rolling a ball at a single pin, and the first to knock it down wins. Every roll knocks it down with probability ${frac(p, q)}, independently. What is the probability that ${names[who]} wins?`,
        answer: choices(d, ans, [[1, 3], [p, q], cut(m ** who * p * q ** (2 - who), q ** 3), cut(w[2 - who], S), cut(w[who], w[0] + w[1])].filter(under1), showFrac),
        check: () => {
          let s = 0, r = 1;
          for (let i = 0; i < 3000; i++) { s += r * (1 - a) ** who * a; r *= (1 - a) ** 3; }
          return Math.abs(s - ans[0] / ans[1]) < 1e-12 ? '' : `series gives ${s}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `Look at one round of three rolls. ${names[0]} wins it with probability ${frac(p, q)}, ${names[1]} with ${frac(m, q)}·${frac(p, q)} (only after a miss), ${names[2]} with (${frac(m, q)})<sup>2</sup>·${frac(p, q)}, and otherwise the game starts over exactly as before. Dividing each by ${frac(p, q)}, their chances are in the ratio 1 : ${frac(m, q)} : (${frac(m, q)})<sup>2</sup>, and multiplying by ${q * q} turns that into ${w.join(' : ')}. So ${names[who]} wins with probability ${w[who]}/(${w.join(' + ')}) = <b>${fr(ans)}</b>.`,
      };
    },
    // a time limit: each player only gets n tries
    (d, ctx) => {
      const [[p1, q1], [p2, q2], n, second] = pick(ctx, 'limit', [[[1, 2], [1, 3], [2, 3], [1, 4], [2, 5]], [[1, 2], [1, 3], [2, 3], [1, 4], [3, 5]], [2, 3], [false, true]]);
      const [P, Q] = d.pick(NAMES), Q1 = q1 * q2, R = (q1 - p1) * (q2 - p2), win = second ? (q1 - p1) * p2 : p1 * q2;
      let top = 0;
      for (let i = 0; i < n; i++) top += R ** i * win * Q1 ** (n - 1 - i);
      const ans = cut(top, Q1 ** n), r = cut(R, Q1), many = range(0, n - 1).reduce((s, i) => s + R ** i * Q1 ** (n - 1 - i), 0);
      return {
        topic: 'Taking turns', rank: 16,
        tip: 'Find the chance that one round ends with this player scoring and the chance that nobody scores in it, then add up this player’s chances over the rounds there is time for.',
        text: `${P} and ${Q} take turns at a basketball shot, ${P} first, and the first to score wins. Each of ${P}’s shots goes in with probability ${frac(p1, q1)}, and each of ${Q}’s with probability ${frac(p2, q2)}. They only have time for ${n} shots each; if nobody has scored by then, nobody wins. What is the probability that ${second ? Q : P} wins?`,
        answer: choices(d, ans, [cut(win, Q1 - R), cut(win, Q1), cut(Q1 ** n - R ** n, Q1 ** n), cut(top - R ** (n - 1) * win, Q1 ** n), cut(n * win, Q1)].filter(under1), showFrac),
        check: () => {
          // every way the 2n shots could go, weighted, and who scores first
          let good = 0, all = 0;
          for (let s = 0; s < 1 << (2 * n); s++) {
            let wgt = 1, first = -1;
            for (let i = 0; i < 2 * n; i++) { const hit = (s >> i) & 1, [pp, qq] = i % 2 ? [p2, q2] : [p1, q1]; wgt *= hit ? pp : qq - pp; if (hit && first < 0) first = i % 2; }
            all += wgt;
            if (first === (second ? 1 : 0)) good += wgt;
          }
          return good * ans[1] === all * ans[0] ? '' : `counted ${good}/${all}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `A round (one shot each) ends with ${P} scoring with probability ${frac(p1, q1)}, with ${Q} scoring with probability ${frac(q1 - p1, q1)}·${frac(p2, q2)} = ${frac((q1 - p1) * p2, Q1)}, and with both missing with probability r = ${frac(q1 - p1, q1)}·${frac(q2 - p2, q2)} = ${fr(r)}; only a double miss leads to another round. So ${second ? Q : P} wins in round ${n === 3 ? '1, 2 or 3' : '1 or 2'} with probability ${frac(win, Q1)}·(1 + ${fr(r)}${n === 3 ? ` + (${fr(r)})<sup>2</sup>` : ''}) = ${frac(win, Q1)}·${frac(many, Q1 ** (n - 1))} = <b>${fr(ans)}</b>.`,
      };
    },
  ],

  'Expected value': [
    // re-trying whatever failed, up to k times: the expected number of successes
    (d, ctx) => {
      const [[kind, N], k] = pick(ctx, 'heads', [[['coin', 32], ['coin', 48], ['coin', 80], ['coin', 96], ['coin', 160], ['coin', 256], ['die', 27], ['die', 54], ['die', 81], ['die', 162]], [2, 3, 4, 5]],
        ([kind, N], k) => N % (kind === 'coin' ? 2 ** k : 3 ** k) === 0);
      const base = kind === 'coin' ? 2 : 3, fail = (j) => (N * (base - 1) ** j) / base ** j, E = N - fail(k);
      const miss = frac((base - 1) ** k, base ** k), hit = frac(base ** k - (base - 1) ** k, base ** k);
      return {
        topic: 'Expected value', rank: 18,
        text: kind === 'coin'
          ? `A teacher gives each of ${N} students a fair coin. Everyone flips. Anyone showing tails flips again, and so on, stopping at the first heads, but nobody flips more than ${k} times in all. What is the expected number of students who end up with heads?`
          : `Each of ${N} players rolls a fair die, hoping for a 5 or a 6. Anyone who misses rolls again, and so on, stopping at the first 5 or 6, but nobody rolls more than ${k} times in all. What is the expected number of players who get a 5 or a 6?`,
        answer: choices(d, E, [N - fail(1), N - fail(k - 1), N - fail(k + 1), fail(k), Math.min(N - 1, (k * N) / base)].filter(Number.isInteger)),
        check: () => {
          let good = 0;
          for (let s = 0; s < base ** k; s++) { let x = s, ok = false; for (let i = 0; i < k; i++) { if (x % base === 0) ok = true; x = Math.floor(x / base); } if (ok) good++; }
          return (N * good) / base ** k === E ? '' : `counted ${(N * good) / base ** k}, said ${E}`;
        },
        solution: kind === 'coin'
          ? `A student ends without heads only if all ${k} flips are tails, which has probability (${frac(1, 2)})<sup>${k}</sup> = ${miss}. So each student ends with heads with probability 1 − ${miss} = ${hit}, and by linearity of expectation the expected number is ${N}·${hit} = ${N / base ** k}·${base ** k - (base - 1) ** k} = <b>${num(E)}</b>.`
          : `A player ends without a 5 or 6 only if all ${k} rolls miss, which has probability (${frac(2, 3)})<sup>${k}</sup> = ${miss}. So each player succeeds with probability 1 − ${miss} = ${hit}, and by linearity of expectation the expected number is ${N}·${hit} = ${N / base ** k}·${base ** k - (base - 1) ** k} = <b>${num(E)}</b>.`,
      };
    },
    // the same games, but the expected number of tries used
    (d, ctx) => {
      const [[kind, N], k] = pick(ctx, 'tries', [[['coin', 32], ['coin', 64], ['coin', 96], ['coin', 160], ['die', 27], ['die', 54], ['die', 81]], [2, 3, 4]],
        ([kind, N], k) => N % (kind === 'coin' ? 2 : 3) ** (k - 1) === 0);
      const base = kind === 'coin' ? 2 : 3, word = kind === 'coin' ? 'flip' : 'roll';
      const total = (j) => range(0, j - 1).reduce((s, i) => s + (N * (base - 1) ** i) / base ** i, 0), E = total(k);
      return {
        topic: 'Expected value', rank: 17,
        text: kind === 'coin'
          ? `Each of ${N} students flips a fair coin until it shows heads, but gives up after ${k} flips if it never does. What is the expected total number of flips?`
          : `Each of ${N} players rolls a fair die until it shows a 5 or a 6, but gives up after ${k} rolls if it never does. What is the expected total number of rolls?`,
        answer: choices(d, E, [N * k, N * base, total(k - 1), total(k + 1), (N * (k + 1)) / 2].filter(Number.isInteger)),
        check: () => {
          let tries = 0;
          for (let s = 0; s < base ** k; s++) { let x = s, t = k; for (let i = 0; i < k; i++) { if (x % base === 0) { t = i + 1; break; } x = Math.floor(x / base); } tries += t; }
          return (N * tries) / base ** k === E ? '' : `counted ${(N * tries) / base ** k}, said ${E}`;
        },
        solution: `By linearity, add up each person’s expected number of ${word}s. The first ${word} always happens; the next happens only if every ${word} before it failed, so the j-th happens with probability (${frac(base - 1, base)})<sup>j−1</sup>. One person expects 1 + ${frac(base - 1, base)}${k > 2 ? ` + (${frac(base - 1, base)})<sup>2</sup>` : ''}${k > 3 ? ` + (${frac(base - 1, base)})<sup>3</sup>` : ''} = ${frac(E, N)} ${word}s, so ${N} people expect ${N}·${frac(E, N)} = <b>${num(E)}</b>.`,
      };
    },
    // how many different numbers show on a handful of dice: one yes-or-no count per number
    (d, ctx) => {
      const [n, s] = pick(ctx, 'faces', [[2, 3, 4], [4, 6, 8]]);
      const E = cut(s ** n - (s - 1) ** n, s ** (n - 1)), shows = frac(s ** n - (s - 1) ** n, s ** n);
      return {
        topic: 'Expected value', rank: 19,
        text: `${Cap(WORDS[n])} fair ${s}-sided dice, numbered 1 to ${s}, are rolled. What is the expected number of different numbers that show?`,
        answer: choices(d, E, [[n, 1], cut(n * s - choose(n, 2), s), cut(s ** n - (s - 1) ** n, s ** n), cut((s - 1) ** n, s ** (n - 1)), cut(n * (s + 1), 2 * s)], showFrac),
        check: () => {
          let total = 0, all = 0;
          for (const r of rolls(n, s)) { total += new Set(r).size; all++; }
          return total * E[1] === all * E[0] ? '' : `counted ${total}/${all}, said ${E[0]}/${E[1]}`;
        },
        solution: `Count with one yes-or-no question per number. A given number is missed by ${n === 2 ? 'both' : `all ${n}`} dice with probability (${frac(s - 1, s)})<sup>${n}</sup>, so it shows with probability 1 − (${frac(s - 1, s)})<sup>${n}</sup> = ${shows}. By linearity of expectation, adding that up over the ${s} numbers gives ${s}·${shows} = <b>${fr(E)}</b>.`,
      };
    },
    // back-to-back heads in a row of tosses: overlapping pairs still add by linearity
    (d, ctx) => {
      const [n, [a, b]] = pick(ctx, 'pairs', [[6, 8, 10, 11, 13], [[1, 2], [1, 3], [2, 3]]]);
      const E = cut((n - 1) * a * a, b * b), coin = b === 2 ? 'A fair coin is' : `A bent coin lands heads with probability ${frac(a, b)}. It is`;
      return {
        topic: 'Expected value', rank: 16,
        text: `${coin} tossed ${n} times in a row. What is the expected number of places where two heads come up back to back? (So HHH has two such places.)`,
        answer: choices(d, E, [cut(n * a * a, b * b), cut((n - 1) * a, b), cut((n - 2) * a * a, b * b), cut(Math.floor(n / 2) * a * a, b * b), cut((n - 1) * a * a, 2 * b * b)], showFrac),
        check: () => {
          let total = 0;
          for (let s = 0; s < 1 << n; s++) {
            let h = 0, pairs = 0;
            for (let i = 0; i < n; i++) { if ((s >> i) & 1) h++; if (i && ((s >> i) & 1) && ((s >> (i - 1)) & 1)) pairs++; }
            total += pairs * a ** h * (b - a) ** (n - h);
          }
          return total * E[1] === b ** n * E[0] ? '' : `counted ${total}/${b ** n}, said ${E[0]}/${E[1]}`;
        },
        solution: `There are ${n - 1} places where two tosses sit side by side (tosses 1 and 2, 2 and 3, …, ${n - 1} and ${n}), and each of them is two heads with probability (${frac(a, b)})<sup>2</sup> = ${frac(a * a, b * b)}. Linearity of expectation doesn’t mind that the places overlap, so the expected count is ${n - 1}·${frac(a * a, b * b)} = <b>${fr(E)}</b>.`,
      };
    },
  ],

  'Many dice': [
    // a small total: give every die its 1, then stars and bars for what is left
    (d, ctx) => {
      const [n, e] = pick(ctx, 'low', [[4, 5, 6, 8, 9], [2, 3, 4, 5]]), s = n + e, m = choose(s - 1, n - 1);
      return {
        topic: 'Many dice', rank: 11,
        text: `A board game uses ${n} ordinary six-sided dice, rolled together. Of the 6<sup>${n}</sup> equally likely ways they can land, how many show a total of exactly ${s}?`,
        answer: choices(d, m, [choose(s - 1, n), choose(s, n - 1), choose(s, n), choose(n, e), n * e]),
        check: () => (totals(n)[s] === m ? '' : `counted ${totals(n)[s]}, said ${m}`),
        solution: `Every die shows at least 1, which uses up ${n} of the ${s}. The other ${e} pips can be shared among the ${n} dice in any way (no die gets more than 5 extra, so none goes past 6). By stars and bars that is C(${e} + ${n - 1}, ${n - 1}) = C(${s - 1}, ${n - 1}) = <b>${num(m)}</b>.`,
      };
    },
    // a big total: turn every die upside down (x becomes 7 − x) and it’s a small total
    (d, ctx) => {
      const [n, e] = pick(ctx, 'high', [[3, 4, 5, 6, 7], [2, 3, 4, 5]]), s = 6 * n - e, m = choose(e + n - 1, n - 1);
      return {
        topic: 'Many dice', rank: 12,
        text: `${Cap(WORDS[n])} ordinary dice are thrown at once. In how many of the 6<sup>${n}</sup> equally likely outcomes is the total exactly ${s}?`,
        tip: 'Turn every die upside down in your mind: x becomes 7 − x, so a big total becomes a small one, which is easier to count.',
        answer: choices(d, m, [choose(e + n, n), choose(e + n - 1, n), choose(e + n, n - 1), choose(e + n - 2, n - 1), n * e, choose(s - 1, n - 1)].filter((v) => v < 6 ** n)),
        check: () => (totals(n)[s] === m ? '' : `counted ${totals(n)[s]}, said ${m}`),
        solution: `Turn each die over in your mind, since a die showing x has 7 − x on the bottom. That turns every outcome with a total of ${s} into one with a total of 7·${n} − ${s} = ${n + e}, one for one. So count the outcomes with a total of ${n + e} instead. Giving each die its 1 leaves ${e} extra pips to share among the ${n} dice (no die gets more than 5 extra, so none goes past 6), and by stars and bars that can be done in C(${e} + ${n - 1}, ${n - 1}) = <b>${num(m)}</b> ways.`,
      };
    },
    // a middle total, where a die could go past 6: stars and bars, then take those out
    (d, ctx) => {
      const [n, t] = pick(ctx, 'cap', [[3, 4], range(9, 14)], (n, t) => (n === 3 ? t <= 12 : t >= 10));
      const X = choose(t - 1, n - 1), Y = choose(t - 7, n - 1), m = X - n * Y;
      return {
        topic: 'Many dice', rank: 14,
        text: `${n === 3 ? 'Three' : 'Four'} ordinary dice are rolled. In how many of the ${6 ** n} equally likely outcomes do the numbers add up to exactly ${t}?`,
        answer: choices(d, m, [X, X - Y, choose(t, n - 1) - n * choose(t - 6, n - 1), X - n * choose(t - 6, n - 1)].filter((v) => v > 0)),
        check: () => (totals(n)[t] === m ? '' : `counted ${totals(n)[t]}, said ${m}`),
        solution: `Ignoring the limit of 6 at first, give each die its 1 and share the other ${t - n} pips freely, in C(${t - n} + ${n - 1}, ${n - 1}) = C(${t - 1}, ${n - 1}) = ${X} ways. But a die can’t show 7 or more. The ways where one particular die does are counted by giving it 6 extra first, which leaves ${t - n - 6} pip${t - n - 6 === 1 ? '' : 's'} to share freely, in C(${t - n - 6} + ${n - 1}, ${n - 1}) = ${Y} way${Y === 1 ? '' : 's'}. Any of the ${n} dice could be that one, and two dice can’t both go past 6, since that needs a total of at least ${12 + n}. So the count is ${X} − ${n}·${Y} = <b>${num(m)}</b>.`,
      };
    },
    // "or less": a spare box for the pips not used
    (d, ctx) => {
      const [n, e] = pick(ctx, 'atmost', [[3, 4, 5, 6], [2, 3, 4, 5]]), m = choose(n + e, n);
      return {
        topic: 'Many dice', rank: 13,
        text: `${Cap(WORDS[n])} ordinary dice are rolled. In how many of the 6<sup>${n}</sup> equally likely outcomes is the total ${n + e} or less?`,
        answer: choices(d, m, [choose(n + e - 1, n - 1), choose(n + e, n - 1), choose(n + e + 1, n), choose(n + e - 1, n)]),
        check: () => { const w = totals(n), c = range(n, n + e).reduce((s, t) => s + w[t], 0); return c === m ? '' : `counted ${c}, said ${m}`; },
        solution: `Give every die its 1, so the ${n} dice share at most ${e} extra pips (no die gets more than 5 extra, so none goes past 6). Add a spare box for the pips that aren’t used, so that exactly ${e} pips go into ${n + 1} boxes, the ${n} dice and the spare. By stars and bars that can be done in C(${e} + ${n}, ${n}) ways, the same as adding up C(j + ${n - 1}, ${n - 1}) for j = 0 to ${e} extra pips (the hockey-stick identity). So the count is C(${n + e}, ${n}) = <b>${num(m)}</b>.`,
      };
    },
  ],

  'Choices in common': [
    // two random choices of k from n: exactly j in common
    (d, ctx) => {
      const [n, k, j] = pick(ctx, 'exactly', [[8, 9, 11, 12], [3, 4, 5, 6], [1, 2, 3, 4]], (n, k, j) => k <= n / 2 + 1 && j < k && k - j <= n - k);
      const [P, Q] = d.pick(NAMES);
      const a = choose(k, j), b = choose(n - k, k - j), C = choose(n, k), ans = cut(a * b, C);
      let atLeast = 0; for (let i = j; i <= k; i++) atLeast += choose(k, i) * choose(n - k, k - i);
      return {
        topic: 'Choices in common', rank: 11,
        text: `A film club has a list of ${n} films. ${P} and ${Q} each choose ${k} of them to watch, at random and independently. What is the probability that exactly ${j} of the films ${j === 1 ? 'is' : 'are'} on both of their lists?`,
        answer: choices(d, ans, [cut(atLeast, C), cut(a * k ** j * (n - k) ** (k - j), n ** k), [1, k + 1], cut(b, C), cut(a, C)], showFrac),
        check: () => {
          const sets = range(0, 2 ** n - 1).filter((x) => popcount(x) === k);
          let hit = 0, all = 0;
          for (const x of sets) for (const y of sets) { all++; if (popcount(x & y) === j) hit++; }
          return hit * ans[1] === all * ans[0] ? '' : `counted ${hit}/${all}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `Fix ${P}’s ${k} films. ${Q}’s list is one of C(${n}, ${k}) = ${C} equally likely choices. To share exactly ${j}, ${Q} takes ${j} of ${P}’s ${k} films (C(${k}, ${j}) = ${a} ways) and ${k - j} of the other ${n - k} (C(${n - k}, ${k - j}) = ${b} ways). Probability = ${a}·${b}/${C} = <b>${fr(ans)}</b>.`,
      };
    },
    // at least one in common: the complement is "none in common"
    (d, ctx) => {
      const [n, k] = pick(ctx, 'atleast', [[8, 9, 10, 11, 12], [2, 3, 4]], (n, k) => 2 * k <= n);
      const [P, Q] = d.pick(NAMES), none = choose(n - k, k), C = choose(n, k), ans = cut(C - none, C);
      return {
        topic: 'Choices in common', rank: 10,
        text: `${P} and ${Q} each pick ${k} of the ${n} songs on an album at random, independently. What is the probability that at least one song is on both of their lists?`,
        answer: choices(d, ans, [cut(none, C), cut(k * k, n), cut(k * choose(n - k, k - 1), C), cut(k, n), [1, 2]].filter(under1), showFrac),
        check: () => {
          const sets = range(0, 2 ** n - 1).filter((x) => popcount(x) === k);
          let hit = 0, all = 0;
          for (const x of sets) for (const y of sets) { all++; if (x & y) hit++; }
          return hit * ans[1] === all * ans[0] ? '' : `counted ${hit}/${all}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `Use the opposite. Fix ${P}’s list; ${Q} shares nothing with it exactly when ${k === 2 ? 'both' : `all ${k}`} of ${Q}’s songs come from the other ${n - k}, which happens for C(${n - k}, ${k}) = ${none} of the C(${n}, ${k}) = ${C} equally likely lists. So at least one song is shared with probability 1 − ${raw(none, C)}${gcd(none, C) > 1 ? ` = 1 − ${frac(none, C)}` : ''} = <b>${fr(ans)}</b>.`,
      };
    },
    // the expected number in common: linearity, one item at a time
    (d, ctx) => {
      const [n, a, b] = pick(ctx, 'expect', [[10, 12, 15, 20], [3, 4, 5, 6], [2, 3, 4, 5]], (n, a, b) => a !== b);
      const [P, Q] = d.pick(NAMES), E = cut(a * b, n);
      return {
        topic: 'Choices in common', rank: 13,
        text: `A menu has ${n} dishes. ${P} picks ${a} different dishes at random, and ${Q}, separately, picks ${b} at random. What is the expected number of dishes that both of them pick?`,
        tip: 'Add up, one of the second person’s dishes at a time, the chance that it is also on the first person’s list.',
        answer: choices(d, E, [cut(a * b, n * n), cut(Math.min(a, b), n), cut(a + b, n), cut(a * b, n - 1), cut(a * b, 2 * n)], showFrac),
        check: () => {
          // the overlap’s whole distribution (hypergeometric), added up: Σ j·C(a, j)·C(n − a, b − j) over C(n, b)
          let top = 0; for (let j = 0; j <= Math.min(a, b); j++) top += j * choose(a, j) * choose(n - a, b - j);
          return top * E[1] === choose(n, b) * E[0] ? '' : `counted ${top}/${choose(n, b)}, said ${E[0]}/${E[1]}`;
        },
        solution: `Use linearity of expectation, one of ${Q}’s dishes at a time. Each is one of ${P}’s ${a} with probability ${ratio(a, n)}${frac(a, n)}. So the expected number of dishes on both lists is ${b}·${frac(a, n)} = <b>${fr(E)}</b>.`,
      };
    },
    // everything one person picks lies inside the other’s list
    (d, ctx) => {
      const [n, m, k] = pick(ctx, 'inside', [[8, 9, 10, 12], [4, 5, 6], [2, 3]], (n, m, k) => k < m && m < n);
      const [P, Q] = d.pick(NAMES), top = choose(m, k), C = choose(n, k), ans = cut(top, C);
      return {
        topic: 'Choices in common', rank: 9,
        text: `${P} marks ${m} of the ${n} books on a shelf as favorites. ${Q}, without knowing which, picks ${k} of the ${n} books at random. What is the probability that ${k === 2 ? 'both' : `all ${k}`} of ${Q}’s books are among ${P}’s favorites?`,
        answer: choices(d, ans, [cut(m, n), cut(m ** k, n ** k), cut(top, choose(n, m)), cut(k, m), cut(choose(m - 1, k - 1), C)].filter(under1), showFrac),
        check: () => {
          let hit = 0, all = 0;
          for (let x = 0; x < 2 ** n; x++) if (popcount(x) === k) { all++; if (x < 2 ** m) hit++; }
          return hit * ans[1] === all * ans[0] ? '' : `counted ${hit}/${all}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `Fix ${P}’s ${m} favorites. ${Q}’s pick is one of C(${n}, ${k}) = ${C} equally likely sets of ${k} books, and C(${m}, ${k}) = ${top} of them lie entirely among the favorites. So the probability is ${top}/${C} = <b>${fr(ans)}</b>.`,
      };
    },
  ],

  'Running totals': [
    // within r turns, the token stops on square t: split by how many rolls it takes
    (d, ctx) => {
      const [t, r] = pick(ctx, 'within', [[2, 4, 5, 6], [2, 3, 4, 5]], (t, r) => r <= t);
      const ms = range(1, r), top = ms.reduce((s, m) => s + choose(t - 1, m - 1) * 6 ** (r - m), 0), ans = cut(top, 6 ** r);
      return {
        topic: 'Running totals', rank: 7,
        tip: 'Split by how many rolls it takes to land exactly on the square, and count the ordered ways that many rolls can add up to it.',
        text: `A token starts on square 0 of a long track. Each turn a fair die is rolled and the token moves forward that many squares. After ${r} turns, what is the probability that the token has stopped on square ${t} at some point?`,
        answer: choices(d, ans, [[1, 6], cut(top - choose(t - 1, r - 1), 6 ** r), cut(choose(t - 1, r - 1), 6 ** r), cut(6 ** r - 5 ** r, 6 ** r)], showFrac),
        check: () => {
          let hit = 0;
          for (let s = 0; s < 6 ** r; s++) { let x = s, tot = 0, ok = false; for (let i = 0; i < r; i++) { tot += (x % 6) + 1; x = Math.floor(x / 6); if (tot === t) ok = true; } if (ok) hit++; }
          return hit * ans[1] === 6 ** r * ans[0] ? '' : `counted ${hit}/${6 ** r}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `The token stops on ${t} exactly when its first few rolls add up to ${t}. With m rolls, that means writing ${t} as an ordered sum of m whole numbers, each at least 1. There are C(${t - 1}, m − 1) such sums, one for each way to cut a row of ${t} dots at m − 1 of the ${t - 1} gaps between them, and no part is more than ${t}, so a die can roll every part. Each way has probability (${frac(1, 6)})<sup>m</sup>. Adding these for m = 1 to ${r} gives ${ms.map((m) => raw(choose(t - 1, m - 1), 6 ** m)).join(' + ')} = ${gcd(top, 6 ** r) > 1 ? `${raw(top, 6 ** r)} = ` : ''}<b>${fr(ans)}</b>.`,
      };
    },
    // no turn limit: the chance of ever stopping on a square, square by square
    (d, ctx) => {
      const [t] = pick(ctx, 'ever', [[2, 3, 4, 5, 6]]);
      const N = [1];                                // N[k] = 6^k × (chance of ever stopping on square k)
      for (let k = 1; k <= t; k++) N.push(range(1, 6).reduce((s, j) => s + (k - j >= 0 ? N[k - j] * 6 ** (j - 1) : 0), 0));
      const P = (k) => cut(N[k], 6 ** k), ans = P(t);
      return {
        topic: 'Running totals', rank: 12,
        text: `A token starts on square 0. A fair die is rolled again and again, and each time the token moves forward that many squares, until it has gone past square ${t}. What is the probability that it stops on square ${t} along the way?`,
        answer: choices(d, ans, [[1, 6], [2, 7], P(t - 1), cut(6 ** t - 5 ** t, 6 ** t), cut(t, 21)].filter(under1), showFrac),
        check: () => {
          // the first t rolls decide it (each roll is at least 1), so try every way they can go
          let hit = 0;
          for (const r of rolls(t)) { let tot = 0; for (const x of r) { tot += x; if (tot >= t) break; } if (tot === t) hit++; }
          return hit * ans[1] === 6 ** t * ans[0] ? '' : `counted ${hit}/${6 ** t}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `Let P(k) be the chance that the token ever stops on square k. To stop on k it must stop on one of the six squares just before it and then roll exactly the gap, and those are separate cases, so P(k) = ${frac(1, 6)}·(P(k − 1) + ⋯ + P(k − 6)), with P(0) = 1 and P(k) = 0 below 0. For k from 2 to 6, the bracket is the one for P(k − 1), which is 6·P(k − 1), plus P(k − 1) itself, so P(k) = ${frac(7, 6)}·P(k − 1). Working up from P(1) = ${frac(1, 6)} gives ${range(2, t - 1).map((k) => `P(${k}) = ${fr(P(k))}, `).join('')}${t > 2 ? 'and ' : ''}P(${t}) = 7${t > 2 ? `<sup>${t - 1}</sup>` : ''}/6<sup>${t}</sup> = <b>${fr(ans)}</b>.`,
      };
    },
    // a frog jumping by a coin: the same idea with two step sizes
    (d, ctx) => {
      const [t, [s1, s2]] = pick(ctx, 'frog', [[3, 4, 5, 6, 7, 8], [[1, 2], [1, 3], [2, 3]]]);
      const N = [1];                                // N[k] = 2^k × (chance of ever landing on stone k)
      for (let k = 1; k <= t; k++) N.push((k >= s1 ? N[k - s1] * 2 ** (s1 - 1) : 0) + (k >= s2 ? N[k - s2] * 2 ** (s2 - 1) : 0));
      const P = (k) => cut(N[k], 2 ** k), ans = P(t);
      return {
        topic: 'Running totals', rank: 10,
        text: `A frog starts on stone 0 of a long row of stones. Every second it flips a fair coin: on heads it jumps ${s1} stone${s1 > 1 ? 's' : ''} forward, and on tails ${s2} stones forward. What is the probability that it ever lands on stone ${t}?`,
        answer: choices(d, ans, [[1, 2], cut(2, s1 + s2), P(t - 1), [1, t], cut(1, s2)].filter(under1), showFrac),
        check: () => {
          let hit = 0;
          for (let s = 0; s < 1 << t; s++) { let tot = 0; for (let i = 0; i < t && tot < t; i++) tot += (s >> i) & 1 ? s1 : s2; if (tot === t) hit++; }
          return hit * ans[1] === 2 ** t * ans[0] ? '' : `counted ${hit}/${2 ** t}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `Let P(k) be the chance that the frog ever lands on stone k. The jump that lands it on k is either a heads jump from stone k − ${s1} or a tails jump from stone k − ${s2}, so P(k) = ${frac(1, 2)}·P(k − ${s1}) + ${frac(1, 2)}·P(k − ${s2}), with P(0) = 1 and P(k) = 0 below 0. Working up: ${range(1, t).map((k) => `P(${k}) = ${fr(P(k))}`).join(', ')}. So the answer is <b>${fr(ans)}</b>.`,
      };
    },
  ],

  'At least once': [
    // how many throws until "at least once" beats a given chance
    (d, ctx) => {
      const [s, [tp, tq]] = pick(ctx, 'least', [[2, 3, 4, 5, 6, 8, 9, 10, 11, 12], [[1, 2], [1, 3], [2, 3], [3, 4]]]);
      const c = 6 - Math.abs(s - 7), chance = (k) => 1 - ((36 - c) / 36) ** k;
      const enough = (k) => BigInt(tq) * (36n ** BigInt(k) - BigInt(36 - c) ** BigInt(k)) > BigInt(tp) * 36n ** BigInt(k);
      let n = 1; while (!enough(n)) n++;
      const miss = frac(36 - c, 36), bound = Math.log(tq / (tq - tp)) / Math.log(36 / (36 - c)), exact = Number.isInteger((tp / tq) * 1e4);
      return {
        topic: 'At least once', rank: 12,
        text: `Two fair dice are thrown together, again and again. What is the smallest number of throws for which the probability of a total of ${s} turning up at least once is greater than ${frac(tp, tq)}?`,
        answer: choices(d, n, [n - 1, n + 1, Math.ceil((36 * tp) / (tq * c)), n + 2, n - 2].filter((x) => x >= 1)),
        check: () => (enough(n) && !enough(n - 1) ? '' : `${n} is not the least`),
        solution: `A total of ${s} happens in ${c} of the 36 ways, so one throw misses it with probability ${ratio(36 - c, 36)}${miss}. In n throws the chance of at least one ${s} is 1 − (${miss})<sup>n</sup>, which is more than ${frac(tp, tq)} when (${miss})<sup>n</sup> is less than ${frac(tq - tp, tq)}. Taking logarithms, that means n > log(${frac(tq, tq - tp)}) ÷ log(${frac(36, 36 - c)}) ≈ ${num(bound, 2)}, so try the whole numbers on either side. For n = ${n - 1} the chance is about ${num(chance(n - 1), 4)}, not more than ${frac(tp, tq)} (${exact ? '' : 'about '}${num(tp / tq, 4)}), and for n = ${n} it is about ${num(chance(n), 4)}. So the answer is <b>${n}</b>.`,
      };
    },
    // the chance itself, for a few throws: 1 minus the chance of missing every time
    (d, ctx) => {
      const EVENTS = [['a double', (x, y) => x === y], ['a total of 7', (x, y) => x + y === 7], ['a total of 5', (x, y) => x + y === 5], ['a total of 10', (x, y) => x + y === 10], ['a total of 6', (x, y) => x + y === 6], ['a total of 11', (x, y) => x + y === 11]];
      const [[ev, test], n] = pick(ctx, 'chance', [EVENTS, [2, 3]]);
      let c = 0; for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (test(x, y)) c++;
      const ans = cut(36 ** n - (36 - c) ** n, 36 ** n);
      return {
        topic: 'At least once', rank: 9,
        text: `A pair of fair dice is thrown ${n === 2 ? 'twice' : `${n} times`}. What is the probability of getting ${ev} at least once?`,
        answer: choices(d, ans, [cut(n * c, 36), cut(c ** n, 36 ** n), cut((36 - c) ** n, 36 ** n), cut(n * c * (36 - c) ** (n - 1), 36 ** n)], showFrac),
        check: () => {
          let hit = 0;
          for (const r of rolls(2 * n)) { let ok = false; for (let i = 0; i < n; i++) if (test(r[2 * i], r[2 * i + 1])) ok = true; if (ok) hit++; }
          return hit * ans[1] === 36 ** n * ans[0] ? '' : `counted ${hit}/${36 ** n}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `One throw gives ${ev} in ${c} of the 36 ways, so it misses in the other ${36 - c}, with probability ${ratio(36 - c, 36)}${frac(36 - c, 36)}. ${n === 2 ? 'Both' : `All ${n}`} throws miss with probability (${frac(36 - c, 36)})<sup>${n}</sup> = ${frac((36 - c) ** n, 36 ** n)}, so getting it at least once has probability 1 − ${frac((36 - c) ** n, 36 ** n)} = <b>${fr(ans)}</b>.`,
      };
    },
    // at least twice: take away "never" and "exactly once"
    (d, ctx) => {
      const [[face, a], n] = pick(ctx, 'twice', [[['a 6', 1], ['a 5 or a 6', 2], ['an even number', 3], ['a 1 or a 2', 2]], [3, 4, 5]]);
      const none = (6 - a) ** n, once = n * a * (6 - a) ** (n - 1), ans = cut(6 ** n - none - once, 6 ** n);
      return {
        topic: 'At least once', rank: 14,
        tip: 'Count the opposite, which here is getting it never or exactly once.',
        text: `A fair die is rolled ${n} times. What is the probability of getting ${face} at least twice?`,
        answer: choices(d, ans, [cut(6 ** n - none, 6 ** n), cut(choose(n, 2) * a * a * (6 - a) ** (n - 2), 6 ** n), cut(6 ** n - none - a * (6 - a) ** (n - 1), 6 ** n), cut(a * a, 36)], showFrac),
        check: () => {
          const good = { 'a 6': [6], 'a 5 or a 6': [5, 6], 'an even number': [2, 4, 6], 'a 1 or a 2': [1, 2] }[face];
          let hit = 0;
          for (const r of rolls(n)) if (r.filter((x) => good.includes(x)).length >= 2) hit++;
          return hit * ans[1] === 6 ** n * ans[0] ? '' : `counted ${hit}/${6 ** n}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `Count the opposite, ${face} never or exactly once, among the 6<sup>${n}</sup> = ${num(6 ** n)} equally likely outcomes. Never means every roll is one of the other ${6 - a} numbers, in ${6 - a}<sup>${n}</sup> = ${num(none)} outcomes. Exactly once means ${n} choices of which roll, ${a === 1 ? 'one way' : `${a} ways`} for that roll and ${6 - a} for each of the others, in ${n}·${a}·${6 - a}<sup>${n - 1}</sup> = ${num(once)} outcomes. So ${num(6 ** n)} − ${num(none)} − ${num(once)} = ${num(6 ** n - none - once)} outcomes have it at least twice, and the probability is ${ratio(6 ** n - none - once, 6 ** n)}<b>${fr(ans)}</b>.`,
      };
    },
    // two things each at least once: inclusion and exclusion on the ways to miss
    (d, ctx) => {
      const PAIRS = [['a 1', [1], 'a 6', [6]], ['a 6', [6], 'an odd number', [1, 3, 5]], ['a 1 or a 2', [1, 2], 'a 5 or a 6', [5, 6]], ['a 2', [2], 'a 5 or a 6', [5, 6]]];
      const [[X, xs, Y, ys], n] = pick(ctx, 'both', [PAIRS, [2, 3, 4]]);
      const bare = (s) => s.replace(/\ban? (?=\d|odd)/g, '');   // 'a 5 or a 6' → '5 or 6', 'an odd number' → 'odd number'
      const a1 = xs.length, a2 = ys.length, top = 6 ** n - (6 - a1) ** n - (6 - a2) ** n + (6 - a1 - a2) ** n, ans = cut(top, 6 ** n);
      return {
        topic: 'At least once', rank: 15,
        text: `A fair die is rolled ${n === 2 ? 'twice' : `${n} times`}. What is the probability that at least one roll shows ${X} and at least one roll shows ${Y}?`,
        tip: 'Take away the outcomes that miss the first thing and those that miss the second, then add back the ones that miss both.',
        answer: choices(d, ans, [cut((6 ** n - (6 - a1) ** n) * (6 ** n - (6 - a2) ** n), 6 ** (2 * n)), cut(6 ** n - (6 - a1) ** n - (6 - a2) ** n, 6 ** n), cut(6 ** n - (6 - a1 - a2) ** n, 6 ** n), cut(a1 * a2 * n * (n - 1), 36), [a1 * a2, 36], cut(a1 + a2, 6), [1, 6]].filter(under1), showFrac),
        check: () => {
          let hit = 0;
          for (const r of rolls(n)) if (r.some((x) => xs.includes(x)) && r.some((x) => ys.includes(x))) hit++;
          return hit * ans[1] === 6 ** n * ans[0] ? '' : `counted ${hit}/${6 ** n}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `Of the 6<sup>${n}</sup> = ${6 ** n} equally likely outcomes, take away those that miss one of the two. With no ${bare(X)}, every roll is one of the other ${6 - a1} numbers, in ${6 - a1}<sup>${n}</sup> = ${(6 - a1) ** n} outcomes. With no ${bare(Y)}, every roll is one of the other ${6 - a2}, in ${6 - a2}<sup>${n}</sup> = ${(6 - a2) ** n} outcomes. Both of those counts include the ${6 - a1 - a2}<sup>${n}</sup> = ${(6 - a1 - a2) ** n} outcomes with neither, which were taken away twice, so add them back once. That leaves ${6 ** n} − ${(6 - a1) ** n} − ${(6 - a2) ** n} + ${(6 - a1 - a2) ** n} = ${top} outcomes with both, and the probability is ${ratio(top, 6 ** n)}<b>${fr(ans)}</b>.`,
      };
    },
  ],

  'Random divisors': [
    // a random divisor of F! is a perfect square (or cube): count exponents
    (d, ctx) => {
      const [F, r] = pick(ctx, 'square', [[6, 7, 8, 9, 10, 11, 13, 14], [2, 3]]);
      const primes = range(2, F).filter(isPrime), exps = primes.map((p) => { let e = 0; for (let q = p; q <= F; q *= p) e += Math.floor(F / q); return e; });
      const prod = (f) => exps.reduce((a, e) => a * f(e), 1), D = prod((e) => e + 1), S = prod((e) => Math.floor(e / r) + 1), ans = cut(S, D), value = ans[0] + ans[1];
      const word = r === 2 ? 'square' : 'cube', fact = primes.map((p, i) => pw(p, exps[i])).join(' · ');
      return {
        topic: 'Random divisors', rank: 15,
        text: `Ravi writes each positive divisor of ${F}! on its own card, shuffles the cards, and draws one. The probability that his number is a perfect ${word} is a/b, where a and b are relatively prime positive integers. What is a + b?`,
        answer: choices(d, value, [S + D, sum(cut(prod((e) => Math.floor(e / (5 - r)) + 1), D)), sum(cut(S, prod((e) => e))), prod((e) => Math.floor(e / r)) ? sum(cut(prod((e) => Math.floor(e / r)), D)) : NaN]),
        check: () => {
          const N = primes.reduce((a, p, i) => a * p ** exps[i], 1), power = (x) => (r === 2 ? Math.round(Math.sqrt(x)) ** 2 === x : Math.round(Math.cbrt(x)) ** 3 === x);
          let all = 0, good = 0;
          for (let i = 1; i * i <= N; i++) if (N % i === 0) for (const x of i * i === N ? [i] : [i, N / i]) { all++; if (power(x)) good++; }
          return good * ans[1] === all * ans[0] ? '' : `counted ${good}/${all}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `${F}! = ${fact}. A divisor chooses each exponent from 0 up to the one here, so there are ${exps.map((e) => `(${e} + 1)`).join('·')} = ${D} divisors. It is a perfect ${word} when every exponent is a multiple of ${r} (the exponent of ${primes[0]}, for example, can be ${listOr(range(0, exps[0]).filter((x) => x % r === 0))}), which leaves ${exps.map((e) => Math.floor(e / r) + 1).join('·')} = ${S} of them. The probability is ${S}/${D} = ${fr(ans)}, so a + b = <b>${value}</b>.`,
      };
    },
    // a random divisor is a multiple of m: those are m times the divisors of N/m
    (d, ctx) => {
      const [N, m] = pick(ctx, 'multiple', [[720, 1080, 480, 1800, 432, 600, 2160], [4, 6, 9, 10, 12, 15, 18]], (N, m) => N % m === 0 && N / m > 1);
      const D = tau(N), K = tau(N / m), ans = cut(K, D);
      return {
        topic: 'Random divisors', rank: 12,
        text: `A positive divisor of ${N} is chosen at random, each equally likely. What is the probability that it is a multiple of ${m}?`,
        answer: choices(d, ans, [[1, m], cut(tau(m), D), cut(D - K, D), cut(K + 1, D), cut(1, tau(m))].filter(under1), showFrac),
        check: () => { const ds = divisorsOf(N), hit = ds.filter((x) => x % m === 0).length; return hit * ans[1] === ds.length * ans[0] ? '' : `counted ${hit}/${ds.length}, said ${ans[0]}/${ans[1]}`; },
        solution: `A divisor of ${N} that is a multiple of ${m} is ${m}·k for a divisor k of ${N}/${m} = ${N / m}, and every such k gives one. ${N} = ${shown(N)} has ${factor(N).map(([, e]) => `(${e} + 1)`).join('·')} = ${D} divisors, and ${N / m} = ${shown(N / m)} has ${factor(N / m).map(([, e]) => `(${e} + 1)`).join('·')} = ${K}. So the probability is ${ratio(K, D)}<b>${fr(ans)}</b>.`,
      };
    },
    // a random divisor of N also divides M (which divides N)
    (d, ctx) => {
      const [[N, M]] = pick(ctx, 'divides', [[[360, 60], [720, 48], [540, 90], [1260, 84], [1800, 120], [840, 56], [600, 75], [1000, 40]]]);
      const D = tau(N), K = tau(M), ans = cut(K, D);
      return {
        topic: 'Random divisors', rank: 13,
        text: `A positive divisor of ${N} is chosen at random, each equally likely. What is the probability that it is also a divisor of ${M}?`,
        answer: choices(d, ans, [cut(M, N), cut(tau(N / M), D), cut(K - 1, D), [1, N / M], cut(K, D + K)].filter(under1), showFrac),
        check: () => { const ds = divisorsOf(N), hit = ds.filter((x) => M % x === 0).length; return hit * ans[1] === ds.length * ans[0] ? '' : `counted ${hit}/${ds.length}, said ${ans[0]}/${ans[1]}`; },
        solution: `${M} divides ${N}, so every divisor of ${M} is also a divisor of ${N}, and the good choices are exactly the divisors of ${M}. ${M} = ${shown(M)} has ${factor(M).map(([, e]) => `(${e} + 1)`).join('·')} = ${K} divisors, and ${N} = ${shown(N)} has ${factor(N).map(([, e]) => `(${e} + 1)`).join('·')} = ${D}. So the probability is ${ratio(K, D)}<b>${fr(ans)}</b>.`,
      };
    },
    // a divisor of a power of pq is a multiple of a smaller power: two exponents to choose
    (d, ctx) => {
      const [n, k, [base, p, q]] = pick(ctx, 'power', [[4, 5, 6, 8, 9], [1, 2, 3], [[10, 2, 5], [6, 2, 3], [15, 3, 5]]], (n, k) => k < n);
      const ans = cut((n - k + 1) ** 2, (n + 1) ** 2);
      return {
        topic: 'Random divisors', rank: 14,
        text: `A positive divisor of ${pw(base, n)} is chosen at random, each equally likely. What is the probability that it is a multiple of ${pw(base, k)}?`,
        answer: choices(d, ans, [cut(n - k + 1, n + 1), cut((n - k) ** 2, (n + 1) ** 2), [1, base ** k], cut(n - k, n), cut((n - k + 1) ** 2, n * n)].filter(under1), showFrac),
        check: () => { let hit = 0; for (let i = 0; i <= n; i++) for (let j = 0; j <= n; j++) if (i >= k && j >= k) hit++; return hit * ans[1] === (n + 1) ** 2 * ans[0] ? '' : `counted ${hit}, said ${ans[0]}/${ans[1]}`; },
        solution: `${pw(base, n)} = ${pw(p, n)}·${pw(q, n)}, so its divisors are ${p}<sup>i</sup>·${q}<sup>j</sup> with i and j each from 0 to ${n}, and there are ${n + 1}·${n + 1} = ${(n + 1) ** 2} of them. Such a divisor is a multiple of ${pw(base, k)} = ${pw(p, k)}·${pw(q, k)} exactly when i ≥ ${k} and j ≥ ${k}, which leaves ${n - k + 1}·${n - k + 1} = ${(n - k + 1) ** 2}. So the probability is ${ratio((n - k + 1) ** 2, (n + 1) ** 2)}<b>${fr(ans)}</b>.`,
      };
    },
  ],

  'Remainders by chance': [
    // N^e − 1 divisible by a prime: only N mod p matters, and Fermat cuts the exponent down
    (d, ctx) => {
      const [[p, M], e] = pick(ctx, 'fermat', [[[3, 2025], [7, 2023], [11, 2024], [13, 2015], [7, 2030]], [6, 8, 9, 10, 12, 15, 18, 20, 24, 30]], ([p], e) => gcd(e, p - 1) > 1);
      const good = range(1, p - 1).filter((r) => modpow(r, e, p) === 1), g = good.length, ans = cut(g, p), small = e % (p - 1);
      return {
        topic: 'Remainders by chance', rank: 14,
        text: `A whole number N is chosen at random from 1 to ${M}, each equally likely. What is the probability that N<sup>${e}</sup> − 1 is a multiple of ${p}?`,
        answer: choices(d, ans, [cut(p - 1, p), [1, p], cut(g, p - 1), cut(p - 1 - g, p), [1, p - 1]], showFrac),
        check: () => { let hit = 0; for (let N = 1; N <= M; N++) if (modpow(N, e, p) === 1) hit++; return hit * ans[1] === M * ans[0] ? '' : `counted ${hit}/${M}, said ${ans[0]}/${ans[1]}`; },
        solution: `Only N’s remainder when divided by ${p} matters, and ${M} = ${p}·${M / p}, so the remainders 0, 1, …, ${p - 1} are equally likely. Remainder 0 never works. ${e < p - 1 ? '' : `For the others, r<sup>${p - 1}</sup> leaves remainder 1 (Fermat’s little theorem), ${e === p - 1 ? 'for every one of them' : `and ${e} = ${e < 2 * (p - 1) ? '' : `${Math.floor(e / (p - 1))}·`}${p - 1}${small ? ` + ${small}` : ''}, so r<sup>${e}</sup> leaves ${small ? `the same remainder as r<sup>${small}</sup>` : 'remainder 1 for every one of them'}`}. `}${small || e < p - 1 ? `For r = 1, 2, …, ${p - 1}, r<sup>${small || e}</sup> leaves remainders ${range(1, p - 1).map((r) => modpow(r, small || e, p)).join(', ')}, so it is 1 only for r = ${listing(good)}. ` : ''}So ${g} of the ${p} remainders work, and the probability is <b>${fr(ans)}</b>.`,
      };
    },
    // N² + k divisible by a prime: test the remainders
    (d, ctx) => {
      const [[p, M], k] = pick(ctx, 'square', [[[5, 2025], [13, 2028], [7, 2023], [11, 2024], [17, 2023]], [1, 2, 3, 4, 6]], ([p], k) => range(0, p - 1).some((r) => (r * r + k) % p === 0));
      const good = range(0, p - 1).filter((r) => (r * r + k) % p === 0), ans = cut(good.length, p);
      return {
        topic: 'Remainders by chance', rank: 13,
        text: `A whole number N is chosen at random from 1 to ${M}, each equally likely. What is the probability that N<sup>2</sup> + ${k} is a multiple of ${p}?`,
        answer: choices(d, ans, [[1, p], cut(good.length, p - 1), [1, p - 1], cut(p - good.length, p), [1, 2]], showFrac),
        check: () => { let hit = 0; for (let N = 1; N <= M; N++) if ((N * N + k) % p === 0) hit++; return hit * ans[1] === M * ans[0] ? '' : `counted ${hit}/${M}, said ${ans[0]}/${ans[1]}`; },
        solution: `Only N’s remainder r when divided by ${p} matters, and ${M} = ${p}·${M / p}, so all ${p} remainders are equally likely. Try them: r<sup>2</sup> + ${k} is a multiple of ${p} only for r = ${listing(good)} (${good.map((r) => `${r * r + k}`).join(' and ')}). So ${good.length} of the ${p} remainders work: <b>${fr(ans)}</b>.`,
      };
    },
    // a product of two random numbers is a multiple of m: count pairs of remainders
    (d, ctx) => {
      const [m] = pick(ctx, 'product', [[4, 6, 8, 9, 10, 12]]), M = d.pick([60, 120, 360].filter((x) => x % m === 0));
      const g = range(0, m - 1).map((x) => gcd(x, m) || m), cnt = g.reduce((a, b) => a + b, 0), ans = cut(cnt, m * m);
      return {
        topic: 'Remainders by chance', rank: 12,
        text: `Two whole numbers a and b are chosen independently at random from 1 to ${M}. What is the probability that the product ab is a multiple of ${m}?`,
        answer: choices(d, ans, [[1, m], cut(2 * m - 1, m * m), [2, m], cut(m * m - cnt, m * m), cut(cnt - m, m * m)].filter(under1), showFrac),
        check: () => { let hit = 0; for (let a = 1; a <= M; a++) for (let b = 1; b <= M; b++) if ((a * b) % m === 0) hit++; return hit * ans[1] === M * M * ans[0] ? '' : `counted ${hit}/${M * M}, said ${ans[0]}/${ans[1]}`; },
        solution: `Only the remainders of a and b when divided by ${m} matter, and ${M} is a multiple of ${m}, so all ${m}·${m} = ${m * m} pairs of remainders are equally likely. If a leaves remainder x, then ab is a multiple of ${m} exactly when b is a multiple of ${m}/gcd(x, ${m}), and that allows gcd(x, ${m}) of the ${m} remainders for b. Adding gcd(x, ${m}) for x = 0 to ${m - 1} gives ${g.join(' + ')} = ${cnt} good pairs. So the probability is ${ratio(cnt, m * m)}<b>${fr(ans)}</b>.`,
      };
    },
    // a power b^N leaves remainder 1: the remainders of the powers go round in a cycle
    (d, ctx) => {
      const [[b, m]] = pick(ctx, 'cycle', [[[2, 7], [2, 9], [3, 7], [2, 5], [3, 10], [2, 11], [3, 8], [5, 13]]]), M = d.pick([60, 120, 360]);
      const cyc = []; let v = 1; do { v = (v * b) % m; cyc.push(v); } while (v !== 1);
      const ord = cyc.length, ans = [1, ord], phi = range(1, m).filter((x) => gcd(x, m) === 1).length;
      return {
        topic: 'Remainders by chance', rank: 15,
        text: `A whole number N is chosen at random from 1 to ${M}. What is the probability that ${b}<sup>N</sup> leaves a remainder of 1 when divided by ${m}?`,
        answer: choices(d, ans, [[1, m], [1, m - 1], [1, phi], [1, 2], cut(ord - 1, ord)].filter(under1), showFrac),
        check: () => { let hit = 0; for (let N = 1; N <= M; N++) if (modpow(b, N, m) === 1) hit++; return hit * ord === M ? '' : `counted ${hit}/${M}, said 1/${ord}`; },
        solution: `The remainders of ${b}<sup>1</sup>, ${b}<sup>2</sup>, ${b}<sup>3</sup>, … when divided by ${m} are ${cyc.join(', ')}, and then they repeat: a cycle of ${ord}. So ${b}<sup>N</sup> leaves remainder 1 exactly when N is a multiple of ${ord}, and since ${M} is a multiple of ${ord}, that is 1 number in every ${ord}: <b>${fr(ans)}</b>.`,
      };
    },
  ],

  'Units digits by chance': [
    // units digits of powers repeat every 4 steps, so count the years that work for each base
    (d, ctx) => {
      const SETS = [[12, 13, 14, 17, 19], [21, 23, 24, 26, 29], [31, 32, 33, 36, 39], [22, 23, 27, 28, 29], [41, 43, 44, 46, 47]];
      const per = (set, t, lo, hi) => set.map((m) => range(lo, hi).filter((Y) => modpow(m, Y, 10) === t).length);
      const [set, t, [lo, hi]] = pick(ctx, 'years', [SETS, [1, 6, 9], [[2001, 2020], [2011, 2030], [1981, 2004], [2025, 2040]]],
        (set, t, [lo, hi]) => { const h = per(set, t, lo, hi).reduce((a, b) => a + b, 0); return h > 0 && h < 2 * (hi - lo + 1); });
      const counts = per(set, t, lo, hi), hits = counts.reduce((a, b) => a + b, 0), N = hi - lo + 1, total = 5 * N, ans = cut(hits, total);
      const cycle = (m) => range(1, 4).map((i) => modpow(m, i, 10)).join(', ');
      const shifted = per(set, t, lo + 1, hi + 1).reduce((a, b) => a + b, 0), able = set.filter((m) => range(1, 4).some((i) => modpow(m, i, 10) === t)).length;
      return {
        topic: 'Units digits by chance', rank: 19,
        text: `A fair spinner lands on one of the numbers ${set.slice(0, -1).join(', ')} or ${set.at(-1)}, each equally likely; call it a. Separately, a year Y from ${lo} through ${hi} is chosen at random. What is the probability that a<sup>Y</sup> has units digit ${t}?`,
        answer: choices(d, ans, [[1, 4], [1, 5], cut(able, 5), cut(shifted, total), cut(hits, 4 * N)], showFrac),
        check: () => {
          let hit = 0;
          for (const m of set) for (let Y = lo; Y <= hi; Y++) if ((BigInt(m) ** BigInt(Y)) % 10n === BigInt(t)) hit++;
          return hit * ans[1] === total * ans[0] ? '' : `counted ${hit}/${total}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `The units digit of a<sup>Y</sup> depends only on the units digit of a, and repeats every 4 steps of Y, so it is settled by Y’s remainder when divided by 4; the ${N} years from ${lo} to ${hi} contain each remainder exactly ${N / 4} times. Going through the spinner’s numbers, ${set.map((m, i) => `${m} (units digits ${cycle(m)}, …) gives ${counts[i]} years`).join('; ')}. That is ${hits} of the 5·${N} = ${total} equally likely pairs, so the probability is ${ratio(hits, total)}<b>${fr(ans)}</b>.`,
      };
    },
    // a power of a random number: only its last digit matters, and every last digit is equally likely
    (d, ctx) => {
      const ends = (e, t) => range(0, 9).filter((x) => modpow(x, e, 10) === t);
      const [[e, t]] = pick(ctx, 'power', [[[2, 1], [2, 4], [2, 6], [2, 9], [2, 5], [4, 1], [4, 6], [3, 7], [4, 5], [3, 3]]]), M = d.pick([100, 200, 500]);
      const good = ends(e, t), ans = cut(good.length, 10);
      return {
        topic: 'Units digits by chance', rank: 11,
        text: `A whole number n is chosen at random from 1 to ${M}. What is the probability that n<sup>${e}</sup> ends in the digit ${t}?`,
        answer: choices(d, ans, [[1, 10], [1, 4], cut(good.length + 1, 10), cut(good.length, 9), [1, 5], [2, 5], [3, 10], [1, 2]].filter(under1), showFrac),
        check: () => { let hit = 0; for (let n = 1; n <= M; n++) if (modpow(n, e, 10) === t) hit++; return hit * ans[1] === M * ans[0] ? '' : `counted ${hit}/${M}, said ${ans[0]}/${ans[1]}`; },
        solution: `The last digit of n<sup>${e}</sup> depends only on the last digit of n, and from 1 to ${M} every last digit 0 to 9 turns up equally often. Raising 0, 1, …, 9 to the power ${e} gives last digits ${range(0, 9).map((x) => modpow(x, e, 10)).join(', ')}, and ${t} comes from ${good.length === 1 ? `only the digit ${good[0]}` : `the digits ${listing(good)}`}. So the probability is ${good.length}/10 = <b>${fr(ans)}</b>.`,
      };
    },
    // a sum of two squares: pair up the last digits of squares
    (d, ctx) => {
      const SQ = range(0, 9).map((x) => (x * x) % 10), count = (t) => range(0, 99).filter((v) => (SQ[Math.floor(v / 10)] + SQ[v % 10]) % 10 === t).length;
      const [t] = pick(ctx, 'squares', [[0, 1, 2, 5, 8, 3]]), M = d.pick([20, 50, 100]);
      const cnt = count(t), ans = cut(cnt, 100), many = (u) => SQ.filter((x) => x === u).length;
      const ways = [0, 1, 4, 5, 6, 9].flatMap((u) => [0, 1, 4, 5, 6, 9].filter((v) => (u + v) % 10 === t).map((v) => [u, v]));
      return {
        topic: 'Units digits by chance', rank: 15,
        text: `Two whole numbers a and b are chosen independently at random from 1 to ${M}. What is the probability that a<sup>2</sup> + b<sup>2</sup> ends in the digit ${t}?`,
        answer: choices(d, ans, [[1, 10], cut(cnt, 50), cut(ways.length, 36), cut(cnt + 10, 100), cut(cnt, 90)].filter(under1), showFrac),
        check: () => { let hit = 0; for (let a = 1; a <= M; a++) for (let b = 1; b <= M; b++) if ((a * a + b * b) % 10 === t) hit++; return hit * ans[1] === M * M * ans[0] ? '' : `counted ${hit}/${M * M}, said ${ans[0]}/${ans[1]}`; },
        solution: `Only the last digits matter, and each of the 100 pairs of last digits is equally likely. Squares of 0 to 9 end in ${SQ.join(', ')}, so the endings 0 and 5 come from one digit each, and 1, 4, 6 and 9 from two digits each. The sum ends in ${t} for these pairs of square endings, each with the number of pairs of digits that give it: ${ways.map(([u, v]) => `${u} + ${v} (${many(u)}·${many(v)} = ${many(u) * many(v)})`).join(', ')}, ${cnt} pairs of digits in all. So the probability is ${ratio(cnt, 100)}<b>${fr(ans)}</b>.`,
      };
    },
    // a product of two random numbers: count the pairs of last digits
    (d, ctx) => {
      const [t] = pick(ctx, 'product', [[0, 2, 4, 5, 6, 8, 1]]), M = d.pick([30, 50, 100]);
      const per = range(0, 9).map((x) => range(0, 9).filter((y) => (x * y) % 10 === t).length), cnt = per.reduce((a, b) => a + b, 0), ans = cut(cnt, 100);
      return {
        topic: 'Units digits by chance', rank: 13,
        text: `Two whole numbers are chosen independently at random from 1 to ${M}. What is the probability that their product ends in the digit ${t}?`,
        answer: choices(d, ans, [[1, 10], cut(cnt, 50), cut(cnt - per[0], 100), cut(cnt + 1, 100), cut(cnt, 81)].filter(under1), showFrac),
        check: () => { let hit = 0; for (let a = 1; a <= M; a++) for (let b = 1; b <= M; b++) if ((a * b) % 10 === t) hit++; return hit * ans[1] === M * M * ans[0] ? '' : `counted ${hit}/${M * M}, said ${ans[0]}/${ans[1]}`; },
        solution: `Only the last digits matter, and each of the 100 pairs of last digits is equally likely. For each last digit x of the first number, count the last digits y of the second with x·y ending in ${t}: ${range(0, 9).filter((x) => per[x]).map((x) => `${x} → ${per[x]}`).join(', ')}${per.some((c) => !c) ? ' (the others give none)' : ''}. That is ${cnt} pairs, so the probability is ${ratio(cnt, 100)}<b>${fr(ans)}</b>.`,
      };
    },
  ],

  'Prime chances': [
    // numbers below 100 whose digits all come from a set: which are prime
    (d, ctx) => {
      const [[S, desc]] = pick(ctx, 'digits', [[[[1, 3, 5, 7, 9], 'every digit is odd'], [[1, 3, 7, 9], 'every digit is 1, 3, 7 or 9'], [[1, 4, 9], 'every digit is a perfect square (1, 4 or 9)'], [[1, 2, 3], 'every digit is 1, 2 or 3'], [[1, 2, 4, 8], 'every digit is 1, 2, 4 or 8']]]);
      const nums = [...S, ...S.flatMap((a) => S.map((b) => 10 * a + b))], primes = nums.filter(isPrime), cnt = primes.length, tot = nums.length, ans = cut(cnt, tot);
      return {
        topic: 'Prime chances', rank: 11,
        text: `Zoe picks at random one of the positive integers below 100 in which ${desc}. What is the probability that the number she picks is prime?`,
        answer: choices(d, ans, [cut(cnt, 99), cut(primes.filter((x) => x > 9).length, S.length ** 2), cut(cnt, S.length ** 2), cut(cnt + 1, tot), [1, 2]], showFrac),
        check: () => {
          const sieve = Array(100).fill(true); sieve[0] = sieve[1] = false;
          for (let i = 2; i < 100; i++) if (sieve[i]) for (let j = i * i; j < 100; j += i) sieve[j] = false;
          let all = 0, hit = 0;
          for (let x = 1; x < 100; x++) if ([...String(x)].every((c) => S.includes(+c))) { all++; if (sieve[x]) hit++; }
          return hit * ans[1] === all * ans[0] ? '' : `counted ${hit}/${all}, said ${ans[0]}/${ans[1]}`;
        },
        solution: `Below 100 there are ${S.length} one-digit and ${S.length}² = ${S.length ** 2} two-digit numbers like that, ${tot} in all. Testing each for a factor of 2, 3, 5 or 7, the primes among them are ${listing(primes)}${S.includes(1) ? ' (1 is not prime)' : ''}, ${cnt} of them. So the probability is ${ratio(cnt, tot)}<b>${fr(ans)}</b>.`,
      };
    },
    // two dice: is their sum (or product) prime
    (d, ctx) => {
      const [s, op] = pick(ctx, 'dice', [[4, 6, 8, 10, 12], ['sum', 'product']]);
      const pairs = range(1, s).flatMap((x) => range(1, s).map((y) => [x, y])), f = op === 'sum' ? ([x, y]) => x + y : ([x, y]) => x * y;
      const cnt = pairs.filter((pr) => isPrime(f(pr))).length, ans = cut(cnt, s * s);
      const sums = range(2, 2 * s).filter(isPrime), small = range(2, s).filter(isPrime);
      return {
        topic: 'Prime chances', rank: 9,
        ...(op === 'product' ? { tip: 'Ask when a product of two whole numbers can be prime at all.' } : {}),
        text: `Two fair ${s}-sided dice, numbered 1 to ${s}, are rolled. What is the probability that the ${op} of the two numbers is prime?`,
        answer: choices(d, ans, op === 'sum'
          ? [cut(sums.length, 2 * s - 1), cut(cnt + 1, s * s), cut(cnt - 1, s * s), cut(cnt, s * (s + 1) / 2)]
          : [cut(small.length, s), cut(small.length, s * s), cut(2 * small.length + 1, s * s), cut(small.length, 2 * s)], showFrac),
        check: () => {
          const sieve = Array(s * s + 1).fill(true); sieve[0] = sieve[1] = false;
          for (let i = 2; i * i <= s * s; i++) if (sieve[i]) for (let j = i * i; j <= s * s; j += i) sieve[j] = false;
          let hit = 0; for (let x = 1; x <= s; x++) for (let y = 1; y <= s; y++) if (sieve[op === 'sum' ? x + y : x * y]) hit++;
          return hit * ans[1] === s * s * ans[0] ? '' : `counted ${hit}/${s * s}, said ${ans[0]}/${ans[1]}`;
        },
        solution: op === 'sum'
          ? `There are ${s}·${s} = ${s * s} equally likely ordered rolls. The prime sums possible are ${listing(sums)}, made in ${sums.map((p) => pairs.filter((pr) => f(pr) === p).length).join(' + ')} = ${cnt} ways. So the probability is ${ratio(cnt, s * s)}<b>${fr(ans)}</b>.`
          : `A product of two whole numbers is prime only when one of them is 1 and the other is prime. The primes up to ${s} are ${listing(small)} (${small.length} of them), and either die can be the 1, so ${2 * small.length} of the ${s}·${s} = ${s * s} equally likely rolls work. So the probability is ${ratio(2 * small.length, s * s)}<b>${fr(ans)}</b>.`,
      };
    },
    // a stretch of twenty numbers: list its primes
    (d, ctx) => {
      const [[lo, hi]] = pick(ctx, 'stretch', [[[20, 39], [30, 49], [40, 59], [50, 69], [60, 79], [70, 89], [80, 99], [100, 119], [10, 29]]]);
      const primes = range(lo, hi).filter(isPrime), cnt = primes.length, ans = cut(cnt, hi - lo + 1);
      return {
        topic: 'Prime chances', rank: 8,
        text: `A whole number is chosen at random from ${lo} to ${hi}, each equally likely. What is the probability that it is prime?`,
        answer: choices(d, ans, [cut(cnt, hi - lo), cut(cnt + 1, hi - lo + 1), [1, 4], cut(cnt - 1, hi - lo + 1), [1, 5], [3, 10], [1, 2]].filter(under1), showFrac),
        check: () => { let hit = 0; for (let x = lo; x <= hi; x++) { let p = x > 1; for (let i = 2; i < x; i++) if (x % i === 0) p = false; if (p) hit++; } return hit * ans[1] === (hi - lo + 1) * ans[0] ? '' : `counted ${hit}, said ${ans[0]}/${ans[1]}`; },
        solution: `There are ${hi} − ${lo} + 1 = ${hi - lo + 1} numbers from ${lo} to ${hi}. Testing each for a factor of 2, 3, 5${hi > 120 ? ', 7 or 11' : ' or 7'}, the primes among them are ${listing(primes)}, ${cnt} of them. So the probability is ${ratio(cnt, hi - lo + 1)}<b>${fr(ans)}</b>.`,
      };
    },
    // a two-digit number made from two spins or rolls
    (d, ctx) => {
      const [[S, desc]] = pick(ctx, 'made', [[[[1, 2, 3, 4, 5, 6], 'An ordinary die is rolled twice'], [[1, 2, 3, 4], 'A four-sided die numbered 1 to 4 is rolled twice'], [[1, 2, 3, 4, 5, 6, 7, 8], 'An eight-sided die numbered 1 to 8 is rolled twice'], [[2, 3, 5, 7], 'A spinner showing 2, 3, 5 and 7 is spun twice'], [[1, 5, 7, 9], 'A spinner showing 1, 5, 7 and 9 is spun twice']]]);
      const made = S.flatMap((a) => S.map((b) => 10 * a + b)), primes = made.filter(isPrime), ans = cut(primes.length, made.length);
      return {
        topic: 'Prime chances', rank: 10,
        text: `${desc}: the first result is the tens digit and the second the units digit of a two-digit number. What is the probability that this number is prime?`,
        answer: choices(d, ans, [cut(primes.length, 90), cut(primes.length + 1, made.length), cut(S.filter(isPrime).length, S.length), cut(primes.length, made.length + S.length), [1, 2]].filter(under1), showFrac),
        check: () => { let hit = 0; for (const a of S) for (const b of S) { const x = 10 * a + b; let p = true; for (let i = 2; i * i <= x; i++) if (x % i === 0) p = false; if (p) hit++; } return hit * ans[1] === made.length * ans[0] ? '' : `counted ${hit}, said ${ans[0]}/${ans[1]}`; },
        solution: `There are ${S.length}·${S.length} = ${made.length} equally likely numbers. A prime can’t end in an even digit or 5, so only the numbers ending in ${listOr(S.filter((x) => [1, 3, 7, 9].includes(x)))} can work; testing those, the primes are ${listing(primes)}, ${primes.length} of them. So the probability is ${ratio(primes.length, made.length)}<b>${fr(ans)}</b>.`,
      };
    },
  ],

  'Geometric probability': [
    // a ring inside a diamond: the ring’s area is π times the difference of the squared radii
    (d, ctx) => {
      const [a, c, w] = pick(ctx, 'ring', [[6, 10, 12], range(4, 70), range(3, 30)], (a, c, w) => { const [m, n] = cut(w, a * a); return c - w >= 1 && c + w <= (a * a) / 2 && m + n >= 10; });
      const [m, n] = cut(w, a * a), value = m + n;
      const s = 110 / a, R = (r2) => Math.round(Math.sqrt(r2) * s * 100) / 100;
      const figure = `<svg class="tri" viewBox="0 0 300 260" role="img" aria-label="The tile |x| + |y| ≤ ${a} with a ring painted on it">`
        + `<polygon class="side" points="250,130 140,20 30,130 140,240"/>`
        + `<circle cx="140" cy="130" r="${(R(c - w) + R(c + w)) / 2}" fill="none" class="seg" style="stroke-width:${R(c + w) - R(c - w)};stroke-opacity:.35"/>`
        + `<circle class="arc" cx="140" cy="130" r="${R(c - w)}"/><circle class="arc" cx="140" cy="130" r="${R(c + w)}"/>`
        + `<line class="side dash" style="stroke-width:1" x1="14" y1="130" x2="266" y2="130"/><line class="side dash" style="stroke-width:1" x1="140" y1="8" x2="140" y2="252"/>`
        + `<text class="vx" x="264" y="152" text-anchor="middle">(${a}, 0)</text><text class="vx" x="176" y="22" text-anchor="middle">(0, ${a})</text></svg>`;
      return {
        topic: 'Geometric probability', rank: 14,
        text: `A tile is the region of the coordinate plane where |x| + |y| ≤ ${a}. The part of the tile where (x<sup>2</sup> + y<sup>2</sup> − ${c})<sup>2</sup> ≤ ${w * w} is painted gold. A grain of rice lands at a random point of the tile, every point equally likely. The probability that it lands on gold is <span class="fr"><span>m</span><span>n</span></span>·π, where m and n are relatively prime positive integers. What is m + n?`,
        figure,
        answer: choices(d, value, [sum(cut(c + w, 2 * a * a)), sum(cut(2 * w, a * a)), sum(cut(w, 2 * a * a)), w + a * a]),
        check: () => {
          const got = share(2 * a, 2 * a, (x, y) => Math.abs(x - a) + Math.abs(y - a) <= a && ((x - a) ** 2 + (y - a) ** 2 - c) ** 2 <= w * w, 1200) * 4 * a * a / (2 * a * a);
          const want = (m / n) * Math.PI;
          return Math.abs(got - want) < 0.005 * want ? '' : `grid gives ${got}, said ${want}`;
        },
        solution: `Since ${w * w} = ${w}<sup>2</sup>, the gold condition says that x<sup>2</sup> + y<sup>2</sup> − ${c} is between −${w} and ${w}, so the gold part is where ${c - w} ≤ x<sup>2</sup> + y<sup>2</sup> ≤ ${c + w}. That is a ring between radii ${root(c - w)} and ${root(c + w)}, with area π(${c + w} − ${c - w}) = ${2 * w}π. It lies inside the tile, because the largest circle in the tile has radius ${a}/√2, and (${a}/√2)<sup>2</sup> = ${(a * a) / 2} ≥ ${c + w}. The tile is a square with diagonals ${2 * a}, so its area is ½·${2 * a}·${2 * a} = ${2 * a * a}. The probability is ${2 * w}π/${2 * a * a} = ${frac(w, a * a)}·π, so m + n = <b>${num(value)}</b>.`,
      };
    },
    // two people arrive at random times and wait: a square with a band along its diagonal
    (d, ctx) => {
      const [T, w] = pick(ctx, 'meet', [[30, 40, 60, 90], [10, 12, 15, 20, 30]], (T, w) => w < T);
      const [P, Q] = d.pick(NAMES), end = { 30: '4:30', 40: '4:40', 60: '5:00', 90: '5:30' }[T], ans = cut(w * (2 * T - w), T * T);
      return {
        topic: 'Geometric probability', rank: 12,
        text: `${P} and ${Q} each arrive at the park at a random time between 4:00 and ${end}, independently, every moment equally likely. Whoever comes first waits ${w} minutes for the other, then leaves. What is the probability that they meet?`,
        answer: choices(d, ans, [cut(w, T), cut(2 * w, T), cut((T - w) ** 2, T * T), cut(w * w, T * T), cut(w * (2 * T - w), 2 * T * T)].filter(under1), showFrac),
        check: () => { const got = share(T, T, (x, y) => Math.abs(x - y) <= w); return Math.abs(got - ans[0] / ans[1]) < 0.004 ? '' : `grid gives ${got}, said ${ans[0]}/${ans[1]}`; },
        solution: `Put ${P}’s arrival time (in minutes after 4:00) on one axis and ${Q}’s on the other, so that every point of a ${T}-by-${T} square is equally likely. They meet when the two times differ by at most ${w}, which is the square minus two corner triangles with legs ${T - w}. Together those triangles make a ${T - w}-by-${T - w} square, so the probability is 1 − ${raw((T - w) ** 2, T * T)} = <b>${fr(ans)}</b>.`,
      };
    },
    // near a corner of a square: four quarter circles
    (d, ctx) => {
      const [s, r] = pick(ctx, 'corner', [[4, 6, 8, 10, 12], [1, 2, 3, 4, 5]], (s, r) => 2 * r <= s);
      const [m, n] = cut(r * r, s * s), value = m + n;
      const S = 200, o = 30, rp = Math.round(((S * r) / s) * 100) / 100;
      const quarter = (cx, cy, sx, sy) => `<path d="M${cx},${cy} L${cx + sx * rp},${cy} A${rp},${rp} 0 0 ${sx * sy > 0 ? 1 : 0} ${cx},${cy + sy * rp} Z" style="fill:var(--accent);fill-opacity:.22;stroke:var(--accent);stroke-width:1.5"/>`;
      const figure = `<svg class="tri" viewBox="0 0 260 268" role="img" aria-label="A square of side ${s} with a quarter circle of radius ${r} at each corner">`
        + `<rect class="side" x="${o}" y="${o}" width="${S}" height="${S}"/>`
        + quarter(o, o, 1, 1) + quarter(o + S, o, -1, 1) + quarter(o, o + S, 1, -1) + quarter(o + S, o + S, -1, -1)
        + `<text class="vx" x="${o + S / 2}" y="${o + S + 24}" text-anchor="middle">${s}</text><text class="vx" x="${o + rp / 2}" y="${o - 8}" text-anchor="middle">${r}</text></svg>`;
      return {
        topic: 'Geometric probability', rank: 15,
        text: `A point is chosen at random inside a square of side ${s}, every point equally likely. The probability that it is within ${r} of at least one corner of the square is <span class="fr"><span>m</span><span>n</span></span>·π, where m and n are relatively prime positive integers. What is m + n?`,
        figure,
        answer: choices(d, value, [sum(cut(r * r, 4 * s * s)), sum(cut(r, s)), sum(cut(4 * r * r, s * s)), sum(cut(r * r, 2 * s * s)), r * r + s * s]),
        check: () => {
          const near = (x, y) => [[0, 0], [s, 0], [0, s], [s, s]].some(([a, b]) => (x - a) ** 2 + (y - b) ** 2 <= r * r);
          const got = share(s, s, near), want = (m / n) * Math.PI;
          return Math.abs(got - want) < 0.005 * want + 0.001 ? '' : `grid gives ${got}, said ${want}`;
        },
        solution: `Around each corner, the points within ${r} form a quarter circle of area ¼·π·${r}<sup>2</sup>. The four quarter circles don’t overlap (${r} + ${r} ≤ ${s}), so together they make one whole circle’s worth, ${r === 1 ? '' : r * r}π. The square’s area is ${s * s}, so the probability is ${r === 1 ? '' : r * r}π/${s * s} = ${frac(r * r, s * s)}·π, and m + n = <b>${num(value)}</b>.`,
      };
    },
    // two random numbers with a small sum: a triangle in a rectangle
    (d, ctx) => {
      const [a, b, c] = pick(ctx, 'sum', [[4, 5, 6, 8, 10], [2, 3, 4, 5, 6], [1, 2, 3, 4]], (a, b, c) => a > b && c <= b);
      const ans = cut(c * c, 2 * a * b);
      return {
        topic: 'Geometric probability', rank: 11,
        text: `A number x is chosen at random between 0 and ${a}, and a number y at random between 0 and ${b}, independently, with every real value equally likely. What is the probability that x + y ≤ ${c}?`,
        answer: choices(d, ans, [cut(c, a + b), cut(c * c, a * b), cut(c, 2 * b), cut(c * c, 2 * a * a), cut(c, a * b)].filter(under1), showFrac),
        check: () => { const got = share(a, b, (x, y) => x + y <= c); return Math.abs(got - ans[0] / ans[1]) < 0.004 ? '' : `grid gives ${got}, said ${ans[0]}/${ans[1]}`; },
        solution: `The pairs (x, y) fill ${a === 8 ? 'an' : 'a'} ${a}-by-${b} rectangle of area ${a * b}, every point equally likely. The pairs with x + y ≤ ${c} form a right triangle in the corner at (0, 0) with both legs ${c} (it fits, since ${c} ≤ ${b} ≤ ${a}), of area ½·${c}<sup>2</sup> = ${num((c * c) / 2)}. So the probability is ${num((c * c) / 2)}/${a * b} = <b>${fr(ans)}</b>.`,
      };
    },
  ],
};
