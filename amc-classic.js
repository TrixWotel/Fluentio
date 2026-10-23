// The 12 classic AMC 10 topics, each with several kinds of question on the same idea (a different unknown, a different
// setup, working backward), so practising a topic isn't the same question with new numbers. Each topic is a list of
// forms that family() in amc-kit.js takes turns through, and every form checks its answer a second way.
import { combo, num, frac, gcd, lcm, choose } from '../kit/bank.js';
import { ord, range, choices, showFrac } from './amc-kit.js';

// every form of a topic says which topic it is, and walks through its own combinations (its salt names the topic too)
const named = (all) => Object.fromEntries(Object.entries(all).map(([name, forms]) => [name, forms.map((f) => (d, ctx) => ({ topic: name, ...f(d, { ...ctx, salt: `${ctx.salt}-${name}` }) }))]));
const TRIPLES = [[3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25], [20, 21, 29], [9, 40, 41], [12, 35, 37]];
// the powers of b (coprime to m) mod m, from b¹ until they come back to 1
const cycleOf = (b, m) => { const out = []; let v = 1; do { v = (v * b) % m; out.push(v); } while (v !== 1); return out; };
const powMod = (b, e, m) => Number(BigInt(b) ** BigInt(e) % BigInt(m));
const tau = (n) => { let k = 0; for (let i = 1; i * i <= n; i++) if (n % i === 0) k += i * i === n ? 1 : 2; return k; };
const countPairs = (ok) => { let c = 0; for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (ok(x, y)) c++; return c; };
const committees = (n, k, ok) => { let c = 0; for (let mask = 0; mask < 1 << n; mask++) { let bits = 0; for (let i = 0; i < n; i++) if (mask & (1 << i)) bits++; if (bits === k && ok(mask)) c++; } return c; };
const hours = (v) => { const [p, q] = v, g = gcd(p, q); const P = p / g, Q = q / g; return Q === 1 ? `${P} hour${P === 1 ? '' : 's'}` : P > Q ? `${Math.floor(P / Q)} ${frac(P % Q, Q)} hours` : `${frac(P, Q)} hour`; };
const pt = ([x, y]) => `(${num(x)}, ${num(y)})`;
// two class averages (70 to 91 and 60 to 94, at least 4 apart) whose combined average is a whole number
const averagePairs = (a, b) => range(70, 91).flatMap((x) => range(60, 94).filter((y) => Math.abs(y - x) >= 4 && (a * x + b * y) % (a + b) === 0).map((y) => [x, y]));
const pw = (p, e) => (e === 0 ? '' : e === 1 ? `${p}` : `${p}<sup>${e}</sup>`);
// x and y from x + y = s and xy = p, as complex numbers, so x², x³… can be checked straight from them
const roots = (s, p) => { const disc = s * s - 4 * p, r = Math.sqrt(Math.abs(disc)) / 2; return disc >= 0 ? [[s / 2 + r, 0], [s / 2 - r, 0]] : [[s / 2, r], [s / 2, -r]]; };
const cpow = ([a, b], n) => { let re = 1, im = 0; for (let i = 0; i < n; i++) [re, im] = [re * a - im * b, re * b + im * a]; return [re, im]; };
const powerSum = (s, p, n) => { const [x, y] = roots(s, p); return cpow(x, n)[0] + cpow(y, n)[0]; };
// the smallest number with D divisors: try every way of writing D as a product (e₁ + 1)(e₂ + 1)…, big exponents on small primes
function patterns(D, most = D) {
  if (D === 1) return [[]];
  const out = [];
  for (let f = Math.min(D, most); f >= 2; f--) if (D % f === 0) for (const rest of patterns(D / f, f)) out.push([f - 1, ...rest]);
  return out;
}
const PRIMES = [2, 3, 5, 7, 11, 13];
const valueOf = (exps) => exps.reduce((v, e, i) => v * PRIMES[i] ** e, 1);
const writeOf = (exps) => exps.map((e, i) => (e > 1 ? `${PRIMES[i]}<sup>${e}</sup>` : `${PRIMES[i]}`)).join('·');

export const classic = named({
  // ---------- arithmetic sequences ----------
  'Arithmetic sequences': [
    // a far term from two terms
    (d, ctx) => {
      const [i, gap, dd] = combo(ctx, [[2, 3, 4, 5], [3, 4, 5, 6, 7, 8], [-7, -5, -4, -3, -2, 2, 3, 4, 5, 6, 7, 9]]);
      const a1 = d.int(-15, 30), j = i + gap, n = d.int(j + 8, 40), t = (k) => a1 + (k - 1) * dd;
      return {
        rank: 5,
        text: `In an arithmetic sequence, the ${ord(i)} term is ${num(t(i))} and the ${ord(j)} term is ${num(t(j))}. What is the ${ord(n)} term?`,
        answer: choices(d, t(n), [t(n) + dd, t(n) - dd, t(i) + (n - i + 1) * dd, t(n) + 2 * dd]),
        check: () => { let v = t(i); const step = (t(j) - t(i)) / (j - i); for (let k = i; k < n; k++) v += step; return v === t(n) ? '' : `walked to ${v}`; },
        solution: `The common difference is (${num(t(j))} − ${num(t(i))}) / (${j} − ${i}) = ${num(dd)}. Then the ${ord(n)} term is the ${ord(i)} term plus ${n - i} steps: ${num(t(i))} + ${n - i}·(${num(dd)}) = <b>${num(t(n))}</b>.`,
      };
    },
    // how many terms in a list
    (d, ctx) => {
      const [a, dd, count] = combo(ctx, [[3, 5, 7, 8, 11, 12, 17, 20], [3, 4, 6, 7, 9, 11], [18, 23, 27, 31, 36, 42, 50, 57]]);
      const last = a + (count - 1) * dd;
      return {
        rank: 4,
        text: `How many numbers are in the list ${a}, ${a + dd}, ${a + 2 * dd}, ${a + 3 * dd}, …, ${num(last)}?`,
        answer: choices(d, count, [count - 1, count + 1, Math.floor(last / dd), count + 2]),
        check: () => { let c = 0; for (let v = a; v <= last; v += dd) c++; return c === count ? '' : `counted ${c}`; },
        solution: `The numbers go up by ${dd}. From ${a} to ${num(last)} is ${num(last - a)}, which is ${(last - a) / dd} steps of ${dd}. ${(last - a) / dd} steps join ${(last - a) / dd} + 1 numbers, so there are <b>${count}</b>.`,
      };
    },
    // the sum of the first n terms
    (d, ctx) => {
      const [a, dd, n] = combo(ctx, [[2, 3, 4, 5, 7, 9, 10], [2, 3, 4, 5, 6], [10, 12, 15, 20, 24, 25, 30]]);
      const last = a + (n - 1) * dd, S = (n * (a + last)) / 2;
      return {
        rank: 7,
        text: `What is the sum of the first ${n} terms of the arithmetic sequence ${a}, ${a + dd}, ${a + 2 * dd}, …?`,
        answer: choices(d, S, [n * (a + last), n * last, S + last + dd, S - last]),
        check: () => { let s = 0; for (let k = 0; k < n; k++) s += a + k * dd; return s === S ? '' : `summed ${s}`; },
        solution: `The ${ord(n)} term is ${a} + ${n - 1}·${dd} = ${last}. The sum is the number of terms times the average of the first and last: ${n}·(${a} + ${last})/2 = <b>${num(S)}</b>.`,
      };
    },
    // which term is a given value
    (d, ctx) => {
      const [a, dd, m] = combo(ctx, [[-20, -13, -7, 4, 9, 15], [3, 4, 5, 6, 7, 8], [14, 19, 23, 28, 31, 37, 42]]);
      const v = a + (m - 1) * dd, show = (x) => `the ${ord(x)} term`;
      return {
        rank: 6,
        text: `In the arithmetic sequence ${[0, 1, 2, 3].map((k) => num(a + k * dd)).join(', ')}, …, which term is ${num(v)}?`,
        answer: choices(d, m, [m - 1, m + 1, Math.round(v / dd), m + 2], show),
        check: () => { let k = 1, t = a; while (t < v) { t += dd; k++; } return t === v && k === m ? '' : `reached term ${k}`; },
        solution: `From ${num(a)} to ${num(v)} is ${num(v - a)}, that is ${m - 1} steps of ${dd}. The first term is 0 steps in, so ${num(v)} is term ${m - 1} + 1: <b>${show(m)}</b>.`,
      };
    },
  ],

  // ---------- remainders of powers ----------
  'Remainders of powers': [
    // the remainder of one big power
    (d, ctx) => {
      const [b, m] = combo(ctx, [[2, 3, 5, 6, 7], [5, 7, 9, 11, 13]], (b, m) => gcd(b, m) === 1 && b % m !== 1), k = d.int(20, 150);
      const cyc = cycleOf(b, m), r = cyc[(k - 1) % cyc.length];
      return {
        rank: 9,
        text: `What is the remainder when ${b}<sup>${k}</sup> is divided by ${m}?`,
        answer: choices(d, r, d.shuffle(range(0, m - 1)).filter((x) => x !== r)),
        check: () => (powMod(b, k, m) === r ? '' : 'remainder wrong'),
        solution: `Powers of ${b} mod ${m} repeat: ${cyc.join(', ')}, then start over (a cycle of ${cyc.length}). ${k} = ${cyc.length}·${Math.floor((k - 1) / cyc.length)} + ${((k - 1) % cyc.length) + 1}, so ${b}<sup>${k}</sup> leaves the same remainder as ${b}<sup>${((k - 1) % cyc.length) + 1}</sup>: <b>${r}</b>.`,
      };
    },
    // the remainder of a sum of two big powers
    (d, ctx) => {
      const [b, c, m] = combo(ctx, [[2, 3, 5], [3, 4, 6, 7], [5, 7, 11, 13]], (b, c, m) => b !== c && gcd(b, m) === 1 && gcd(c, m) === 1);
      const e = d.int(30, 99), f = d.int(30, 99), cb = cycleOf(b, m), cc = cycleOf(c, m);
      const rb = cb[(e - 1) % cb.length], rc = cc[(f - 1) % cc.length], r = (rb + rc) % m;
      return {
        rank: 10,
        text: `What is the remainder when ${b}<sup>${e}</sup> + ${c}<sup>${f}</sup> is divided by ${m}?`,
        answer: choices(d, r, [(rb * rc) % m, rb, rc, ...d.shuffle(range(0, m - 1))]),
        check: () => ((powMod(b, e, m) + powMod(c, f, m)) % m === r ? '' : 'remainder wrong'),
        solution: `Remainders can be added, so find each one. Powers of ${b} mod ${m} cycle through ${cb.join(', ')} (length ${cb.length}), so ${b}<sup>${e}</sup> leaves ${rb}. Powers of ${c} cycle through ${cc.join(', ')} (length ${cc.length}), so ${c}<sup>${f}</sup> leaves ${rc}. The sum leaves ${rb} + ${rc} = ${rb + rc}, which is ${r} more than a multiple of ${m}: <b>${r}</b>.`,
      };
    },
    // how many exponents make a multiple
    (d, ctx) => {
      const [b, m, N] = combo(ctx, [[2, 3, 5, 7], [7, 9, 11, 13, 17], [50, 60, 100, 120, 200]], (b, m) => gcd(b, m) === 1 && cycleOf(b, m).length >= 3);
      const cyc = cycleOf(b, m), o = cyc.length, count = Math.floor(N / o);
      return {
        rank: 12,
        text: `For how many integers k with 1 ≤ k ≤ ${N} is ${b}<sup>k</sup> − 1 a multiple of ${m}?`,
        answer: choices(d, count, [Math.floor(N / (m - 1)), count + 1, count - 1, Math.floor(N / m), Math.floor(N / (o + 1))]),
        check: () => { let c = 0, v = 1; for (let k = 1; k <= N; k++) { v = (v * b) % m; if (v === 1) c++; } return c === count ? '' : `counted ${c}`; },
        solution: `Powers of ${b} mod ${m} go ${cyc.join(', ')}: they first come back to 1 at ${b}<sup>${o}</sup>, and then every ${o} steps. So ${b}<sup>k</sup> − 1 is a multiple of ${m} exactly when k is a multiple of ${o}, and there are ⌊${N}/${o}⌋ = <b>${count}</b> of those up to ${N}.`,
      };
    },
    // the smallest exponent that gives 1
    (d, ctx) => {
      const [b, m] = combo(ctx, [[2, 3, 5, 6, 7, 10], [7, 11, 13, 17, 19]], (b, m) => gcd(b, m) === 1 && b % m !== 1);
      const cyc = cycleOf(b, m), o = cyc.length;
      return {
        rank: 8,
        text: `What is the smallest positive integer k for which ${b}<sup>k</sup> leaves a remainder of 1 when divided by ${m}?`,
        answer: choices(d, o, [m - 1, (m - 1) / 2, o + 1, m, ...range(2, m - 2).filter((x) => (m - 1) % x === 0)]),
        check: () => { let k = 1; while (powMod(b, k, m) !== 1) k++; return k === o ? '' : `found ${k}`; },
        solution: `Keep multiplying by ${b} and reducing mod ${m}: ${cyc.map((v, i) => `${b}<sup>${i + 1}</sup> → ${v}`).join(', ')}. The first 1 comes at k = <b>${o}</b>.`,
      };
    },
  ],

  // ---------- counting divisors ----------
  'Counting divisors': [
    // all the divisors
    (d, ctx) => {
      const [[p, q, r], a, b, c] = combo(ctx, [[[2, 3, 5], [2, 3, 7], [2, 5, 7], [3, 5, 7], [2, 3, 11]], [1, 2, 3, 4, 5], [1, 2, 3], [0, 1, 2]], (pr, a, b, c) => pr[0] ** a * pr[1] ** b * pr[2] ** c <= 2000000 && (c > 0 || !(pr[0] === 2 && pr[1] === 3 && pr[2] !== 5)));
      const N = p ** a * q ** b * r ** c, count = (a + 1) * (b + 1) * (c + 1);
      const fac = [[p, a], [q, b], [r, c]].filter(([, e]) => e).map(([x, e]) => (e > 1 ? `${x}<sup>${e}</sup>` : x)).join(' · ');
      return {
        rank: 7,
        text: `How many positive divisors does ${num(N, 0)} have?`,
        answer: choices(d, count, [a * b * Math.max(c, 1), count - 2, a + b + c + 1, (a + 1) * (b + 1), count + (a + 1)]),
        check: () => (tau(N) === count ? '' : `counted ${tau(N)}`),
        solution: `${num(N, 0)} = ${fac}. A divisor picks each prime's power from 0 up to its exponent, so there are ${[a, b, c].filter((e) => e).map((e) => `(${e} + 1)`).join(' · ')} = <b>${count}</b> divisors.`,
      };
    },
    // the odd or the even divisors
    (d, ctx) => {
      const [a, [q, r], b, c, odd] = combo(ctx, [[1, 2, 3, 4, 5], [[3, 5], [3, 7], [5, 7], [3, 11]], [1, 2, 3], [1, 2], [false, true]], (a, qr, b, c) => 2 ** a * qr[0] ** b * qr[1] ** c <= 2000000);
      const N = 2 ** a * q ** b * r ** c, odds = (b + 1) * (c + 1), evens = a * odds, value = odd ? odds : evens, total = (a + 1) * odds;
      return {
        rank: 9,
        text: `How many of the positive divisors of ${num(N, 0)} are ${odd ? 'odd' : 'even'}?`,
        answer: choices(d, value, [odd ? evens : odds, total, total / 2, value + 1, (a + 1) * b * c]),
        check: () => { let k = 0; for (let i = 1; i <= N; i++) if (N % i === 0 && i % 2 === (odd ? 1 : 0)) k++; return k === value ? '' : `counted ${k}`; },
        solution: `${num(N, 0)} = 2${a > 1 ? `<sup>${a}</sup>` : ''}·${q}${b > 1 ? `<sup>${b}</sup>` : ''}·${r}${c > 1 ? `<sup>${c}</sup>` : ''}. An odd divisor takes no 2 at all, which leaves (${b} + 1)(${c} + 1) = ${odds} choices. ${odd ? `So <b>${odds}</b> are odd.` : `An even one takes 2 to a power from 1 to ${a}: ${a}·${odds} = <b>${evens}</b>.`}`,
      };
    },
    // the divisors that are multiples of a given number
    (d, ctx) => {
      const [[p, q, r], a, b, c] = combo(ctx, [[[2, 3, 5], [2, 3, 7], [2, 5, 7], [3, 5, 7]], [2, 3, 4], [1, 2, 3], [1, 2]], (pr, a, b, c) => pr[0] ** a * pr[1] ** b * pr[2] ** c <= 300000);
      const x = d.int(1, a), y = d.int(1, b), N = p ** a * q ** b * r ** c, M = p ** x * q ** y;
      const value = (a - x + 1) * (b - y + 1) * (c + 1), total = (a + 1) * (b + 1) * (c + 1);
      return {
        rank: 10,
        text: `How many positive divisors of ${num(N, 0)} are multiples of ${num(M, 0)}?`,
        answer: choices(d, value, [total, (a - x) * (b - y) * (c + 1), total - value, (x + 1) * (y + 1), Math.floor(total / M)]),
        check: () => { let k = 0; for (let i = M; i <= N; i += M) if (N % i === 0) k++; return k === value ? '' : `counted ${k}`; },
        solution: `${num(N, 0)} = ${pw(p, a)}·${pw(q, b)}·${pw(r, c)} and ${num(M, 0)} = ${pw(p, x)}·${pw(q, y)}. A divisor that is a multiple of ${num(M, 0)} has ${p} to a power from ${x} to ${a} (${a - x + 1} choice${a - x ? 's' : ''}), ${q} to a power from ${y} to ${b} (${b - y + 1} choice${b - y ? 's' : ''}) and ${r} to a power from 0 to ${c} (${c + 1} choices): ${a - x + 1}·${b - y + 1}·${c + 1} = <b>${value}</b>. (They are ${num(M, 0)} times the divisors of ${num(N / M, 0)}.)`,
      };
    },
    // the smallest number with a given number of divisors
    (d, ctx) => {
      const [D] = combo(ctx, [[4, 6, 8, 9, 10, 12, 14, 15, 16, 18, 20, 24]]);
      const options = patterns(D).map((e) => [valueOf(e), e]).sort((u, v) => u[0] - v[0]), best = options[0][0];
      const others = []; for (let n = best + 1; others.length < 4; n++) if (tau(n) === D) others.push(n);
      return {
        rank: 12,
        text: `What is the smallest positive integer that has exactly ${D} positive divisors?`,
        answer: choices(d, best, others),
        check: () => { let n = 1; while (tau(n) !== D) n++; return n === best ? '' : `found ${n}`; },
        solution: `The number of divisors of 2<sup>a</sup>·3<sup>b</sup>·5<sup>c</sup>⋯ is (a + 1)(b + 1)(c + 1)⋯, so write ${D} as such a product and put the biggest powers on the smallest primes: ${options.map(([v, e]) => `${writeOf(e)} = ${num(v, 0)}`).join('; ')}. The smallest is <b>${num(best, 0)}</b>.`,
      };
    },
  ],

  // ---------- probability with dice ----------
  'Probability with dice': [
    // the sum of two dice
    (d, ctx) => {
      const [kind, s] = combo(ctx, [['equal', 'atleast', 'multiple'], range(2, 12)], (k, s) => (k === 'equal' ? true : k === 'atleast' ? s >= 3 : [3, 4, 5, 6].includes(s)));
      const ok = (x, y) => (kind === 'equal' ? x + y === s : kind === 'atleast' ? x + y >= s : (x + y) % s === 0);
      const count = countPairs(ok);
      const phrase = kind === 'equal' ? `the sum is ${s}` : kind === 'atleast' ? `the sum is at least ${s}` : `the sum is a multiple of ${s}`;
      const having = kind === 'equal' ? `a sum of ${s}` : kind === 'atleast' ? `a sum of at least ${s}` : `a sum that is a multiple of ${s}`;
      return {
        rank: 10,
        text: `Two fair six-sided dice are rolled. What is the probability that ${phrase}?`,
        answer: choices(d, [count, 36], [[count + 1, 36], [Math.max(count - 1, 1), 36], [count, 21], [36 - count, 36], [count, 30]].filter(([p, q]) => p <= q), showFrac),
        check: () => { let c = 0; for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (ok(y, x)) c++; return c === count ? '' : `counted ${c}`; },
        solution: `There are 36 equally likely outcomes, and ${count} of them have ${having}. Probability = ${count}/36 = <b>${frac(count, 36)}</b>.`,
      };
    },
    // the product of two dice
    (d, ctx) => {
      const PRODUCT = [
        ['the product is even', (x, y) => (x * y) % 2 === 0, 'only odd × odd is odd, and there are 3·3 = 9 of those, so 36 − 9'],
        ['the product is odd', (x, y) => (x * y) % 2 === 1, 'both dice must be odd: 3·3'],
        ['the product is a multiple of 3', (x, y) => (x * y) % 3 === 0, 'it fails only when neither die is 3 or 6: 4·4 = 16, so 36 − 16'],
        ['the product is a multiple of 4', (x, y) => (x * y) % 4 === 0, 'a 4 on either die, or two even numbers (2s and 6s): list them'],
        ['the product is a multiple of 6', (x, y) => (x * y) % 6 === 0, 'the pair needs a factor 2 and a factor 3 between them: list them'],
        ['the product is a perfect square', (x, y) => Number.isInteger(Math.sqrt(x * y)), 'the 6 doubles, plus 1 and 4 both ways'],
        ['the product is greater than 12', (x, y) => x * y > 12, 'list them: 3·5, 3·6, 4·4, 4·5, 4·6, 5·5, 5·6, 6·6 and the reverses'],
        ['the product is less than 10', (x, y) => x * y < 10, 'count die by die: a 1 goes with anything, a 2 with 1 to 4, and so on'],
      ];
      const [[phrase, ok, how]] = combo(ctx, [PRODUCT]);
      const count = countPairs(ok);
      return {
        rank: 9,
        text: `Two fair six-sided dice are rolled and the two numbers are multiplied. What is the probability that ${phrase}?`,
        answer: choices(d, [count, 36], [[36 - count, 36], [count, 21], [count + 2, 36], [Math.max(count - 2, 1), 36], [count + 4, 36]].filter(([p, q]) => p <= q), showFrac),
        check: () => { let c = 0; for (let n = 0; n < 36; n++) if (ok(1 + Math.floor(n / 6), 1 + (n % 6))) c++; return c === count ? '' : `counted ${c}`; },
        solution: `Count the ordered pairs (first die, second die) out of 36 (${how}): ${count} of them. Probability = ${count}/36 = <b>${frac(count, 36)}</b>.`,
      };
    },
    // how far apart the two dice are
    (d, ctx) => {
      const [mode, k] = combo(ctx, [['exactly', 'at least'], [0, 1, 2, 3, 4, 5]], (m, k) => !(m === 'at least' && k <= 1));
      const ok = (x, y) => (mode === 'exactly' ? Math.abs(x - y) === k : Math.abs(x - y) >= k), count = countPairs(ok);
      const phrase = k === 0 ? 'show the same number' : `differ by ${mode} ${k}`;
      return {
        rank: 9,
        text: `Two fair six-sided dice are rolled. What is the probability that the two numbers ${phrase}?`,
        answer: choices(d, [count, 36], [[count / (k === 0 ? 1 : 2), 36], [count, 21], [count + 1, 36], [36 - count, 36], [count + 2, 36]].filter(([p, q]) => p <= q), showFrac),
        check: () => { let c = 0; for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) if (mode === 'exactly' ? x - y === k || y - x === k : x - y >= k || y - x >= k) c++; return c === count ? '' : `counted ${c}`; },
        solution: k === 0
          ? `The pairs (1, 1), (2, 2), …, (6, 6) are 6 of the 36 equally likely outcomes. Probability = 6/36 = <b>${frac(6, 36)}</b>.`
          : `A difference of exactly j happens in 6 − j ways in each order, so 2(6 − j) ways. ${mode === 'exactly' ? `For j = ${k}: ${count}.` : `Add these up for j = ${k} to 5: ${count}.`} Probability = ${count}/36 = <b>${frac(count, 36)}</b>.`,
      };
    },
    // the largest or smallest of three dice
    (d, ctx) => {
      const [which, m] = combo(ctx, [['largest', 'smallest'], [2, 3, 4, 5]]);
      const t = which === 'largest' ? m : 7 - m, count = t ** 3 - (t - 1) ** 3;
      return {
        rank: 12,
        text: `Three fair six-sided dice are rolled. What is the probability that the ${which} of the three numbers is exactly ${m}?`,
        answer: choices(d, [count, 216], [[t ** 3, 216], [1, 6], [3 * (t - 1) ** 2, 216], [(t - 1) ** 3, 216], [count + 6, 216]], showFrac),
        check: () => { let c = 0; for (let x = 1; x <= 6; x++) for (let y = 1; y <= 6; y++) for (let z = 1; z <= 6; z++) if ((which === 'largest' ? Math.max(x, y, z) : Math.min(x, y, z)) === m) c++; return c === count ? '' : `counted ${c}`; },
        solution: `The ${which} number is ${which === 'largest' ? 'at most' : 'at least'} ${m} when all three dice are: ${t}<sup>3</sup> = ${t ** 3} of the 216 outcomes. ${which === 'largest' ? `At most ${m - 1}` : `At least ${m + 1}`}: ${t - 1}<sup>3</sup> = ${(t - 1) ** 3}. So exactly ${m}: ${t ** 3} − ${(t - 1) ** 3} = ${count}, a probability of <b>${frac(count, 216)}</b>.`,
      };
    },
  ],

  // ---------- counting committees ----------
  'Counting committees': [
    // two people who won't serve together
    (d, ctx) => {
      const [n, k] = combo(ctx, [range(7, 14), [3, 4, 5]]), total = choose(n, k), both = choose(n - 2, k - 2), good = total - both;
      const [P1, P2] = d.pick([['Alex', 'Blake'], ['Casey', 'Drew'], ['Emery', 'Finn'], ['Gray', 'Harper'], ['Jordan', 'Kai']]);
      return {
        rank: 11,
        text: `A club has ${n} members. A committee of ${k} is chosen, but ${P1} and ${P2} refuse to serve together. How many different committees are possible?`,
        answer: choices(d, good, [total, choose(n - 2, k), total - choose(n - 2, k - 1), choose(n - 1, k), good - both]),
        check: () => { const c = committees(n, k, (mask) => (mask & 3) !== 3); return c === good ? '' : `counted ${c}`; },
        solution: `All committees: C(${n}, ${k}) = ${total}. Committees with both ${P1} and ${P2}: choose the other ${k - 2} from ${n - 2}, C(${n - 2}, ${k - 2}) = ${both}. Allowed: ${total} − ${both} = <b>${good}</b>.`,
      };
    },
    // at least one from a group
    (d, ctx) => {
      const [b, g, k] = combo(ctx, [[4, 5, 6, 7, 8], [3, 4, 5, 6], [3, 4]], (b, g, k) => b >= k && b + g <= 14);
      const total = choose(b + g, k), none = choose(b, k), value = total - none;
      return {
        rank: 10,
        text: `A team of ${k} is chosen from ${b} boys and ${g} girls. How many different teams include at least one girl?`,
        answer: choices(d, value, [g * choose(b + g - 1, k - 1), total, g * choose(b, k - 1), total - choose(g, k), value - g]),
        check: () => { const c = committees(b + g, k, (mask) => mask >> b !== 0); return c === value ? '' : `counted ${c}`; },
        solution: `Count the teams with no girl and take them away. All teams: C(${b + g}, ${k}) = ${total}. All boys: C(${b}, ${k}) = ${none}. At least one girl: ${total} − ${none} = <b>${value}</b>. (Choosing "one girl, then anyone" counts some teams more than once.)`,
      };
    },
    // a committee and its chair
    (d, ctx) => {
      const [n, k] = combo(ctx, [range(6, 12), [3, 4, 5]], (n, k) => n > k + 1);
      const value = choose(n, k) * k;
      return {
        rank: 9,
        text: `From a club of ${n} members, a committee of ${k} is chosen, and then one of those ${k} is named its chair. In how many ways can this be done?`,
        answer: choices(d, value, [choose(n, k), choose(n, k) * (k - 1), choose(n, k) + k, n * choose(n, k), choose(n, k) * k * (k - 1)]),
        check: () => { const c = committees(n, k, () => true) * k, other = n * choose(n - 1, k - 1); return c === value && other === value ? '' : `counted ${c}`; },
        solution: `There are C(${n}, ${k}) = ${choose(n, k)} committees, and each has ${k} choices of chair: ${choose(n, k)}·${k} = <b>${num(value, 0)}</b>. (Or choose the chair first, ${n} ways, then the other ${k - 1} from ${n - 1}: ${n}·C(${n - 1}, ${k - 1}), the same.)`,
      };
    },
    // two particular members: both, exactly one, or neither
    (d, ctx) => {
      const [n, k, mode] = combo(ctx, [[8, 9, 10, 11, 12], [3, 4, 5], ['both', 'exactly one', 'neither']]);
      const [P1, P2] = d.pick([['Ivy', 'Jules'], ['Lena', 'Milo'], ['Nora', 'Omar'], ['Pia', 'Quinn'], ['Rosa', 'Sami']]);
      const counts = { both: choose(n - 2, k - 2), 'exactly one': 2 * choose(n - 2, k - 1), neither: choose(n - 2, k) }, value = counts[mode];
      const phrase = mode === 'both' ? `both ${P1} and ${P2}` : mode === 'exactly one' ? `exactly one of ${P1} and ${P2}` : `neither ${P1} nor ${P2}`;
      return {
        rank: 9,
        text: `A club has ${n} members, among them ${P1} and ${P2}. A committee of ${k} is chosen. How many possible committees include ${phrase}?`,
        answer: choices(d, value, [...Object.values(counts), choose(n, k), choose(n - 2, k - 1), choose(n - 1, k - 1)]),
        check: () => { const c = committees(n, k, (mask) => { const has = (mask & 1) + ((mask >> 1) & 1); return mode === 'both' ? has === 2 : mode === 'exactly one' ? has === 1 : has === 0; }); return c === value ? '' : `counted ${c}`; },
        solution: mode === 'both'
          ? `Put ${P1} and ${P2} on it, then choose the other ${k - 2} from the remaining ${n - 2}: C(${n - 2}, ${k - 2}) = <b>${value}</b>.`
          : mode === 'exactly one'
            ? `Pick which of the two is on it (2 ways), then the other ${k - 1} members from the ${n - 2} people who are neither: 2·C(${n - 2}, ${k - 1}) = <b>${value}</b>.`
            : `Leave both out and choose all ${k} from the other ${n - 2}: C(${n - 2}, ${k}) = <b>${value}</b>.`,
      };
    },
  ],

  // ---------- right triangles ----------
  'Right triangles': [
    // the altitude to the hypotenuse
    (d, ctx) => {
      const [[a0, b0, c0], s] = combo(ctx, [TRIPLES, [1, 2, 3]]);
      const a = a0 * s, b = b0 * s, c = c0 * s;
      return {
        rank: 12,
        text: `A right triangle has legs of length ${a} and ${b}. What is the length of the altitude to the hypotenuse?`,
        answer: choices(d, [a * b, c], [[a * b, a + b], [c, 2], [a * b, 2 * c], [a + b, 2], [a * b, c + 1]], showFrac),
        check: () => (Math.abs((a * b) / Math.hypot(a, b) - (a * b) / c) < 1e-9 ? '' : 'altitude wrong'),
        solution: `The hypotenuse is √(${a}² + ${b}²) = ${c}. The area is ½·${a}·${b} = ${num((a * b) / 2)}, and also ½·${c}·h. So h = ${a}·${b}/${c} = <b>${frac(a * b, c)}</b>.`,
      };
    },
    // the circle inside
    (d, ctx) => {
      const [[a0, b0, c0], s] = combo(ctx, [TRIPLES, [1, 2, 3, 4]], (t, s) => t[2] * s <= 120);
      const a = a0 * s, b = b0 * s, c = c0 * s, r = (a + b - c) / 2;
      return {
        rank: 13,
        text: `A circle is drawn inside a right triangle with legs ${a} and ${b} so that it touches all three sides. What is the radius of the circle?`,
        answer: choices(d, r, [[c, 2], [a * b, c], [a + b + c, 2], a + b - c, c - a], showFrac),
        check: () => (Math.abs((a * b) / (a + b + c) - r) < 1e-9 ? '' : 'radius wrong'),
        solution: `The hypotenuse is ${c}. From the right-angle corner, both tangent lengths equal r, so the legs are r + x and r + y with x + y = ${c} (the tangent lengths from the other two corners). Then ${a} + ${b} = 2r + ${c}, and r = (${a} + ${b} − ${c})/2 = <b>${r}</b>.`,
      };
    },
    // the area from the hypotenuse and a leg
    (d, ctx) => {
      const [[a0, b0, c0], s, which] = combo(ctx, [TRIPLES, [1, 2, 3], [0, 1]], (t, s) => t[2] * s <= 90);
      const a = a0 * s, b = b0 * s, c = c0 * s, leg = which ? b : a, other = which ? a : b, area = (a * b) / 2;
      return {
        rank: 8,
        text: `A right triangle has a hypotenuse of length ${c} and one leg of length ${leg}. What is its area?`,
        answer: choices(d, area, [(c * leg) / 2, leg * other, (c * other) / 2, c * leg]),
        check: () => { const p = (a + b + c) / 2; return Math.abs(Math.sqrt(p * (p - a) * (p - b) * (p - c)) - area) < 1e-6 ? '' : 'Heron disagrees'; },
        solution: `The other leg is √(${c}² − ${leg}²) = √${c * c - leg * leg} = ${other}. The legs meet at the right angle, so the area is ½·${leg}·${other} = <b>${num(area)}</b>.`,
      };
    },
    // the altitude cuts the hypotenuse into two pieces
    (d, ctx) => {
      const [[a0, b0, c0], ask] = combo(ctx, [TRIPLES.slice(0, 5), ['altitude', 'shorter leg', 'longer leg']]);
      const p = a0 * a0, q = b0 * b0, h = a0 * b0, value = ask === 'altitude' ? h : ask === 'shorter leg' ? a0 * c0 : b0 * c0;
      return {
        rank: 13,
        text: `The altitude to the hypotenuse of a right triangle cuts the hypotenuse into pieces of lengths ${p} and ${q}. How long is the ${ask === 'altitude' ? 'altitude' : `${ask} of the triangle`}?`,
        answer: choices(d, value, [h, a0 * c0, b0 * c0, p + q, (p + q) / 2, Math.round(Math.sqrt(p * p + q * q))]),
        check: () => { const A = [0, 0], B = [p + q, 0], C = [p, h], leg1 = Math.hypot(C[0] - A[0], C[1]), leg2 = Math.hypot(B[0] - C[0], C[1]); const right = Math.abs((C[0] - A[0]) * (C[0] - B[0]) + C[1] * C[1]) < 1e-6; const got = ask === 'altitude' ? h : ask === 'shorter leg' ? Math.min(leg1, leg2) : Math.max(leg1, leg2); return right && Math.abs(got - value) < 1e-6 ? '' : 'not a right triangle'; },
        solution: ask === 'altitude'
          ? `The altitude makes two smaller triangles similar to each other, so ${p}/h = h/${q}: h² = ${p}·${q} = ${p * q}, and h = <b>${h}</b>.`
          : `The hypotenuse is ${p} + ${q} = ${p + q}. Each leg is the geometric mean of the hypotenuse and the piece next to it: ${ask === 'shorter leg' ? `√(${p}·${p + q})` : `√(${q}·${p + q})`} = <b>${value}</b>.`,
      };
    },
  ],

  // ---------- inclusion and exclusion ----------
  'Inclusion and exclusion': [
    // divisible by a or b, or by neither
    (d, ctx) => {
      const [N, [a, b], neither] = combo(ctx, [[100, 120, 150, 200, 250, 300, 360, 400, 500, 600, 1000], [[2, 3], [2, 5], [3, 4], [3, 5], [4, 6], [4, 10], [5, 6], [6, 9], [6, 10], [7, 11], [8, 12]], [false, true]]);
      const L = lcm(a, b), both = Math.floor(N / L), either = Math.floor(N / a) + Math.floor(N / b) - both, value = neither ? N - either : either;
      return {
        rank: 8,
        text: `How many integers from 1 to ${N} are divisible by ${neither ? `neither ${a} nor ${b}` : `${a} or ${b}`}?`,
        answer: choices(d, value, neither ? [N - Math.floor(N / a) - Math.floor(N / b), N - either + both, either, N - Math.floor(N / (a * b))] : [Math.floor(N / a) + Math.floor(N / b), Math.floor(N / a) + Math.floor(N / b) - Math.floor(N / (a * b)), both, either + both]),
        check: () => { let c = 0; for (let i = 1; i <= N; i++) { const hit = i % a === 0 || i % b === 0; if (neither ? !hit : hit) c++; } return c === value ? '' : `counted ${c}`; },
        solution: `Divisible by ${a}: ${Math.floor(N / a)}. By ${b}: ${Math.floor(N / b)}. By both (by lcm ${L}): ${both}. By ${a} or ${b}: ${Math.floor(N / a)} + ${Math.floor(N / b)} − ${both} = ${either}.` + (neither ? ` Neither: ${N} − ${either} = <b>${value}</b>.` : ` So the answer is <b>${value}</b>.`),
      };
    },
    // a Venn diagram in words
    (d, ctx) => {
      const [N, both] = combo(ctx, [[30, 32, 35, 40, 45, 50], [4, 5, 6, 7, 8, 9]]);
      const onlyA = d.int(5, 12), onlyB = d.int(4, 11), neither = N - both - onlyA - onlyB, A = onlyA + both, B = onlyB + both;
      const [act1, act2] = d.pick([['play soccer', 'play chess'], ['take Spanish', 'take music'], ['have a dog', 'have a cat'], ['like pizza', 'like tacos'], ['ride a bike to school', 'take the bus some days']]);
      return {
        rank: 5,
        text: `In a class of ${N} students, ${A} ${act1}, ${B} ${act2}, and ${neither} do neither. How many students do both?`,
        answer: choices(d, both, [A + B - N, N - neither - A, Math.min(A, B), A + B - neither - both]),
        check: () => { const set = []; for (let i = 0; i < N; i++) set.push([i < A, i >= A - both && i < A - both + B]); const c = set.filter(([x, y]) => x && y).length, none = set.filter(([x, y]) => !x && !y).length; return c === both && none === neither ? '' : `counted ${c}`; },
        solution: `${N} − ${neither} = ${N - neither} students do at least one. Adding ${A} + ${B} = ${A + B} counts the students who do both twice, so both = ${A + B} − ${N - neither} = <b>${both}</b>.`,
      };
    },
    // three numbers
    (d, ctx) => {
      const [N, [a, b, c]] = combo(ctx, [[100, 120, 150, 200, 300, 360, 500, 1000], [[2, 3, 5], [2, 3, 7], [2, 5, 7], [3, 5, 7], [2, 3, 11]]]);
      const f = (x) => Math.floor(N / x), singles = f(a) + f(b) + f(c), pairs = f(a * b) + f(a * c) + f(b * c), triple = f(a * b * c), value = singles - pairs + triple;
      return {
        rank: 11,
        text: `How many integers from 1 to ${N} are divisible by at least one of ${a}, ${b} and ${c}?`,
        answer: choices(d, value, [singles, singles - pairs, N - value, value + triple, singles - pairs - triple]),
        check: () => { let k = 0; for (let i = 1; i <= N; i++) if (i % a === 0 || i % b === 0 || i % c === 0) k++; return k === value ? '' : `counted ${k}`; },
        solution: `Add the three counts: ${f(a)} + ${f(b)} + ${f(c)} = ${singles}. Numbers divisible by two of them were counted twice, so subtract ${f(a * b)} + ${f(a * c)} + ${f(b * c)} = ${pairs}. Numbers divisible by all three were added three times and taken away three times, so add them back: ${triple}. Total ${singles} − ${pairs} + ${triple} = <b>${value}</b>.`,
      };
    },
    // one but not the other
    (d, ctx) => {
      const [N, [a, b]] = combo(ctx, [[100, 150, 200, 250, 300, 500, 1000], [[2, 3], [3, 4], [4, 6], [3, 5], [5, 7], [6, 9], [4, 10], [6, 8]]]);
      const L = lcm(a, b), value = Math.floor(N / a) - Math.floor(N / L);
      return {
        rank: 7,
        text: `How many integers from 1 to ${N} are divisible by ${a} but not by ${b}?`,
        answer: choices(d, value, [Math.floor(N / a) - Math.floor(N / b), Math.floor(N / a) - Math.floor(N / (a * b)), Math.floor(N / a), Math.floor(N / b) - Math.floor(N / L)]),
        check: () => { let k = 0; for (let i = 1; i <= N; i++) if (i % a === 0 && i % b !== 0) k++; return k === value ? '' : `counted ${k}`; },
        solution: `Multiples of ${a}: ${Math.floor(N / a)}. The ones that are also multiples of ${b} are the multiples of lcm(${a}, ${b}) = ${L}: ${Math.floor(N / L)}. So ${Math.floor(N / a)} − ${Math.floor(N / L)} = <b>${value}</b>.`,
      };
    },
  ],

  // ---------- symmetric sums ----------
  'Symmetric sums': [
    // x² + y² or x³ + y³ from the sum and product
    (d, ctx) => {
      const [s, p, ask] = combo(ctx, [range(2, 12), [-6, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10, 12, 15], ['squares', 'cubes']]);
      const value = ask === 'squares' ? s * s - 2 * p : s ** 3 - 3 * s * p;
      return {
        rank: 14,
        text: `Real or not, x and y satisfy x + y = ${s} and xy = ${num(p)}. What is ${ask === 'squares' ? 'x<sup>2</sup> + y<sup>2</sup>' : 'x<sup>3</sup> + y<sup>3</sup>'}?`,
        answer: choices(d, value, ask === 'squares' ? [s * s - p, s * s + 2 * p, s * s, 2 * s - p] : [s ** 3 - s * p, s ** 3 + 3 * s * p, s ** 3, s ** 3 - 3 * p]),
        check: () => (Math.abs(powerSum(s, p, ask === 'squares' ? 2 : 3) - value) < 1e-6 ? '' : 'power sum wrong'),
        solution: ask === 'squares' ? `x² + y² = (x + y)² − 2xy = ${s}² − 2·(${num(p)}) = <b>${num(value)}</b>.` : `x³ + y³ = (x + y)³ − 3xy(x + y) = ${s}³ − 3·(${num(p)})·${s} = <b>${num(value)}</b>.`,
      };
    },
    // the product, or the cubes, from the sum and the sum of squares
    (d, ctx) => {
      const [s, p, ask] = combo(ctx, [range(2, 11), [-6, -4, -3, -2, 2, 3, 4, 5, 6, 8, 10, 12], ['product', 'cubes']]);
      const q = s * s - 2 * p, value = ask === 'product' ? p : s * (q - p);
      return {
        rank: 12,
        text: `Two numbers have a sum of ${s}, and the sum of their squares is ${num(q)}. What is ${ask === 'product' ? 'their product' : 'the sum of their cubes'}?`,
        answer: choices(d, value, ask === 'product' ? [s * s - q, (q - s * s) / 2, q - s, (s * s + q) / 2] : [s * q, s ** 3 - q, s * (q + p), s ** 3]),
        check: () => (Math.abs(powerSum(s, p, ask === 'product' ? 0 : 3) - (ask === 'product' ? 2 : value)) < 1e-6 && Math.abs(powerSum(s, p, 2) - q) < 1e-6 ? '' : 'wrong'),
        solution: ask === 'product'
          ? `(x + y)² = x² + y² + 2xy, so ${s}² = ${num(q)} + 2xy, and xy = (${s * s} − ${num(q)})/2 = <b>${num(value)}</b>.`
          : `First the product: ${s}² = ${num(q)} + 2xy gives xy = ${num(p)}. Then x³ + y³ = (x + y)(x² − xy + y²) = ${s}·(${num(q)} − (${num(p)})) = <b>${num(value)}</b>.`,
      };
    },
    // from the difference and the product
    (d, ctx) => {
      const [t, p, ask] = combo(ctx, [range(1, 9), [2, 3, 4, 5, 6, 8, 10, 12, 15], ['squares', 'sum squared']]);
      const value = ask === 'squares' ? t * t + 2 * p : t * t + 4 * p;
      return {
        rank: 12,
        text: `The numbers x and y satisfy x − y = ${t} and xy = ${p}. What is ${ask === 'squares' ? 'x<sup>2</sup> + y<sup>2</sup>' : '(x + y)<sup>2</sup>'}?`,
        answer: choices(d, value, ask === 'squares' ? [t * t - 2 * p, t * t + p, t * t + 4 * p, t * t] : [t * t + 2 * p, t * t - 4 * p, t * t + p, (t + p) ** 2]),
        check: () => { const y = (-t + Math.sqrt(t * t + 4 * p)) / 2, x = y + t; const got = ask === 'squares' ? x * x + y * y : (x + y) ** 2; return Math.abs(x * y - p) < 1e-9 && Math.abs(got - value) < 1e-6 ? '' : `got ${got}`; },
        solution: ask === 'squares'
          ? `(x − y)² = x² + y² − 2xy, so x² + y² = (x − y)² + 2xy = ${t}² + 2·${p} = <b>${value}</b>.`
          : `(x + y)² and (x − y)² differ by 4xy: (x + y)² = (x − y)² + 4xy = ${t}² + 4·${p} = <b>${value}</b>.`,
      };
    },
    // x + 1/x
    (d, ctx) => {
      const [s, ask] = combo(ctx, [[3, 4, 5, 6, 7, 8, 9], [2, 3]]);
      const value = ask === 2 ? s * s - 2 : s ** 3 - 3 * s;
      return {
        rank: 13,
        text: `A number x satisfies x + 1/x = ${s}. What is x<sup>${ask}</sup> + 1/x<sup>${ask}</sup>?`,
        answer: choices(d, value, ask === 2 ? [s * s, s * s + 2, s * s - 1, 2 * s] : [s ** 3, s ** 3 - s, s ** 3 + 3 * s, s ** 3 - 3]),
        check: () => { const x = (s + Math.sqrt(s * s - 4)) / 2; return Math.abs(x ** ask + x ** -ask - value) < 1e-6 ? '' : 'wrong'; },
        solution: ask === 2
          ? `Square both sides: x² + 2·x·(1/x) + 1/x² = ${s}², so x² + 1/x² = ${s * s} − 2 = <b>${value}</b>.`
          : `Cube both sides: x³ + 3x + 3/x + 1/x³ = ${s}³, that is x³ + 1/x³ + 3(x + 1/x) = ${s ** 3}. So x³ + 1/x³ = ${s ** 3} − 3·${s} = <b>${value}</b>.`,
      };
    },
  ],

  // ---------- percent change ----------
  'Percent change': [
    // up, then down
    (d, ctx) => {
      const [up, down] = combo(ctx, [[10, 20, 25, 30, 40, 50, 60], [10, 20, 25, 30, 40, 50, 60]], (u, w) => u !== w || u === 50);
      const net = Math.round(((1 + up / 100) * (1 - down / 100) - 1) * 10000) / 100;
      const show = (v) => (v > 0 ? `${num(v, 2)}% increase` : v < 0 ? `${num(-v, 2)}% decrease` : 'no change');
      return {
        rank: 3,
        text: `The price of a game rises by ${up}%. Later, the new price falls by ${down}%. Overall, how did the price change?`,
        answer: choices(d, net, [up - down, -(up * down) / 100, up - down - (up * down) / 100 + 10, down - up], show),
        check: () => { const price = 100 * (100 + up) * (100 - down) / 10000; return Math.abs(price - 100 - net) < 1e-9 ? '' : 'net wrong'; },
        solution: `Multiply the factors: ${num(1 + up / 100, 2)} × ${num(1 - down / 100, 2)} = ${num((1 + up / 100) * (1 - down / 100), 4)}. That is a <b>${show(net)}</b>, not simply ${up}% − ${down}%.`,
      };
    },
    // the price before a discount
    (d, ctx) => {
      const [pct, orig] = combo(ctx, [[10, 15, 20, 25, 30, 40, 50, 60, 75], [40, 60, 80, 120, 160, 200, 240, 300, 400]], (p, o) => (o * (100 - p)) % 100 === 0);
      const price = (orig * (100 - pct)) / 100, show = (v) => `$${num(v, 2)}`;
      return {
        rank: 4,
        text: `After a ${pct}% discount, a jacket costs $${price}. What was its price before the discount?`,
        answer: choices(d, orig, [(price * (100 + pct)) / 100, price + pct, (price * 100) / pct, price + (price * pct) / 100 + 10], show),
        check: () => (orig - (orig * pct) / 100 === price ? '' : 'price wrong'),
        solution: `After the discount the jacket costs ${100 - pct}% of its old price, so ${num((100 - pct) / 100, 2)} × (old price) = $${price}, and the old price is ${price} ÷ ${num((100 - pct) / 100, 2)} = <b>${show(orig)}</b>. (Adding ${pct}% to $${price} doesn't undo it: the ${pct}% was taken off a bigger price.)`,
      };
    },
    // the decrease that undoes an increase
    (d, ctx) => {
      const [p] = combo(ctx, [[25, 60, 100, 150, 300, 400, 900]]);
      const value = (100 * p) / (100 + p), show = (v) => `${num(v, 2)}%`;
      return {
        rank: 8,
        text: `A number is increased by ${p}%. By what percent must the new number now be decreased to get back to the original number?`,
        answer: choices(d, value, [p, p / 2, 100 - value / 2, value + 10, 100], show),
        check: () => (Math.abs((1 + p / 100) * (1 - value / 100) - 1) < 1e-12 ? '' : 'does not undo'),
        solution: `Start with 100. After the increase it is ${100 + p}. To get back to 100, take off ${p} out of ${100 + p}: ${p}/${100 + p} = ${num(value / 100, 4)}, which is <b>${show(value)}</b>.`,
      };
    },
    // the percent from two prices
    (d, ctx) => {
      const [A, pct] = combo(ctx, [[20, 25, 40, 50, 60, 80, 120, 160, 200, 250], [5, 10, 12, 15, 20, 25, 30, 35, 40, 60, 75]], (a, p) => (a * p) % 100 === 0);
      const B = (A * (100 + pct)) / 100, show = (v) => `${num(v, 2)}%`;
      return {
        rank: 2,
        text: `The price of a ticket went up from $${A} to $${num(B, 2)}. By what percent did it go up?`,
        answer: choices(d, pct, [Math.round(((B - A) / B) * 10000) / 100, B - A, Math.round((B / A) * 10000) / 100, pct + 5], show),
        check: () => (Math.abs(A * (1 + pct / 100) - B) < 1e-9 ? '' : 'wrong'),
        solution: `It went up by $${num(B - A, 2)}, compared with the old price of $${A}: ${num(B - A, 2)}/${A} = ${num(pct / 100, 2)}, which is <b>${show(pct)}</b>. (Compare with the old price, not the new one.)`,
      };
    },
  ],

  // ---------- working together ----------
  'Working together': [
    // two pumps together
    (d, ctx) => {
      const [a, b] = combo(ctx, [range(2, 12), range(3, 18)], (a, b) => b > a && (a * b) % (a + b) !== 0);
      return {
        rank: 6,
        text: `Alone, one pump fills a tank in ${a} hours and a second pump fills it in ${b} hours. How long do they take working together?`,
        answer: choices(d, [a * b, a + b], [[a + b, 2], [a, 2], [a * b, a + b + 1], [a * b - 1, a + b], [b - a, 1]], hours),
        check: () => { let filled = 0, t = 0; while (filled < 1 - 1e-12) { filled += (1 / a + 1 / b) / 1000; t += 1 / 1000; } return Math.abs(t - (a * b) / (a + b)) < 0.002 ? '' : `simulated ${t}`; },
        solution: `Rates add: 1/${a} + 1/${b} = ${a + b}/${a * b} of the tank per hour. Time = ${a * b}/${a + b} = <b>${hours([a * b, a + b])}</b>.`,
      };
    },
    // working backward: one alone, from both together
    (d, ctx) => {
      const PAIRS = [[3, 6], [4, 12], [6, 12], [6, 30], [10, 15], [12, 24], [5, 20], [8, 24], [9, 18], [10, 40], [12, 60], [14, 35], [15, 30], [18, 36], [21, 28], [20, 30]];
      const [[a, b], unit, first] = combo(ctx, [PAIRS, ['hours', 'minutes'], [0, 1]]);
      const T = (a * b) / (a + b), known = first ? a : b, value = first ? b : a, show = (v) => `${num(v, 2)} ${unit}`;
      return {
        rank: 8,
        text: `Working together, two printers finish a job in ${T} ${unit}. Alone, the first printer takes ${known} ${unit}. How long would the second printer take alone?`,
        answer: choices(d, value, [known - T, 2 * T, known + T, (known * T) / (known + T), 2 * known], show),
        check: () => (known * value === T * (known + value) ? '' : 'rates do not add up'),
        solution: `In one ${unit.slice(0, -1)} both together do 1/${T} of the job and the first does 1/${known}, so the second does 1/${T} − 1/${known} = ${frac(known - T, T * known)} of it. It takes <b>${show(value)}</b> alone.`,
      };
    },
    // filling with the drain open
    (d, ctx) => {
      const [a, b] = combo(ctx, [[3, 4, 5, 6, 8, 10, 12], [6, 8, 9, 10, 12, 15, 18, 20, 24, 30]], (a, b) => b > a && (a * b) % (b - a) === 0);
      const value = (a * b) / (b - a), show = (v) => `${num(v, 2)} minutes`;
      return {
        rank: 7,
        text: `A faucet fills a tub in ${a} minutes, and the open drain empties a full tub in ${b} minutes. With the faucet on and the drain open, how long does it take to fill the empty tub?`,
        answer: choices(d, value, [(a * b) / (a + b), b - a, (a + b) / 2, a + b, 2 * a], show),
        check: () => { let level = 0, t = 0; while (level < 1 - 1e-9) { level += 1 / a / 1000 - 1 / b / 1000; t += 1 / 1000; } return Math.abs(t - value) < 0.01 ? '' : `simulated ${t}`; },
        solution: `Each minute the faucet adds 1/${a} of the tub and the drain takes away 1/${b}: 1/${a} − 1/${b} = ${frac(b - a, a * b)} per minute. So filling takes ${a * b}/${b - a} = <b>${show(value)}</b>.`,
      };
    },
    // one starts alone, then both finish
    (d, ctx) => {
      const [a, b, h] = combo(ctx, [[4, 5, 6, 8, 10, 12], [6, 8, 10, 12, 15, 20, 24], [1, 2, 3]], (a, b, h) => a !== b && h < a);
      const [P, Q] = d.pick([['Ana', 'Ben'], ['Kim', 'Leo'], ['Maya', 'Noah'], ['Rita', 'Sam']]);
      const value = [(a - h) * b, a + b];
      return {
        rank: 9,
        text: `${P} can paint a fence alone in ${a} hours, and ${Q} can paint it alone in ${b} hours. ${P} paints alone for ${h} hour${h === 1 ? '' : 's'}, then ${Q} joins and they finish the fence together. How long do they work together?`,
        answer: choices(d, value, [[a * b, a + b], [a * b - h * (a + b), a + b], [(a - h) * b, a], [b - h, 2], [(a - h) * a, a + b]], hours),
        check: () => { const [p, q] = value; return h * b * q + p * (a + b) === a * b * q ? '' : 'the work does not add up to one fence'; },
        solution: `In ${h} hour${h === 1 ? '' : 's'} ${P} paints ${frac(h, a)} of the fence, leaving ${frac(a - h, a)}. Together they paint 1/${a} + 1/${b} = ${frac(a + b, a * b)} per hour, so the rest takes ${frac(a - h, a)} ÷ ${frac(a + b, a * b)} = ${frac((a - h) * b, a + b)}: <b>${hours(value)}</b>.`,
      };
    },
  ],

  // ---------- averages ----------
  'Averages': [
    // the score on one more test
    (d, ctx) => {
      const [n, change] = combo(ctx, [range(4, 12), [-4, -3, -2, -1, 1, 2, 3, 4, 5]], (n, ch) => Math.max(50, 5 - (n + 1) * ch) <= Math.min(90, 95 - (n + 1) * ch));
      const m = d.int(Math.max(50, 5 - (n + 1) * change), Math.min(90, 95 - (n + 1) * change)), m2 = m + change, x = (n + 1) * m2 - n * m;
      return {
        rank: 4,
        text: `The average of ${n} test scores is ${m}. After one more test, the average of all ${n + 1} scores is ${m2}. What was the score on the new test?`,
        answer: choices(d, x, [m2 + change, n * m2 - (n - 1) * m, m2, x + n, x - change]),
        check: () => (Math.abs((n * m + x) / (n + 1) - m2) < 1e-9 && x >= 0 && x <= 100 ? '' : 'average wrong'),
        solution: `The ${n} scores add to ${n}·${m} = ${n * m}. All ${n + 1} add to ${n + 1}·${m2} = ${(n + 1) * m2}. The new score is ${(n + 1) * m2} − ${n * m} = <b>${x}</b>.`,
      };
    },
    // the number taken away
    (d, ctx) => {
      const [n, change] = combo(ctx, [range(5, 12), [-3, -2, -1, 1, 2, 3, 4]]);
      const m = d.int(40, 80), m2 = m + change, x = n * m - (n - 1) * m2;
      return {
        rank: 5,
        text: `The average of ${n} numbers is ${m}. When one of the numbers is taken away, the average of the other ${n - 1} is ${m2}. What number was taken away?`,
        answer: choices(d, x, [m - change, n * m - n * m2, m2 - change, x + n, x - change]),
        check: () => (Math.abs((n * m - x) / (n - 1) - m2) < 1e-9 ? '' : 'average wrong'),
        solution: `The ${n} numbers add to ${n}·${m} = ${n * m}. The other ${n - 1} add to ${n - 1}·${m2} = ${(n - 1) * m2}. The missing number is ${n * m} − ${(n - 1) * m2} = <b>${num(x)}</b>.`,
      };
    },
    // two groups together
    (d, ctx) => {
      const [a, b] = combo(ctx, [[10, 12, 15, 18, 20, 24, 25, 30], [8, 10, 12, 15, 16, 20, 25]], (a, b) => a !== b && averagePairs(a, b).length > 0);
      const [x, y] = d.pick(averagePairs(a, b)), value = (a * x + b * y) / (a + b);
      return {
        rank: 4,
        text: `On a test, a class of ${a} students averaged ${x} and another class of ${b} students averaged ${y}. What was the average score of all ${a + b} students?`,
        answer: choices(d, value, [(x + y) / 2, (a * y + b * x) / (a + b), Math.round((x + y) / 2) + 1, value + 1, value - 2]),
        check: () => { const all = [...Array(a).fill(x), ...Array(b).fill(y)]; return Math.abs(all.reduce((s, v) => s + v, 0) / all.length - value) < 1e-9 ? '' : 'average wrong'; },
        solution: `Totals add, averages don't: ${a}·${x} + ${b}·${y} = ${a * x} + ${b * y} = ${a * x + b * y} points for ${a + b} students, an average of <b>${num(value, 2)}</b>. (Just averaging ${x} and ${y} ignores that the classes are different sizes.)`,
      };
    },
    // consecutive numbers
    (d, ctx) => {
      const [kind, n] = combo(ctx, [['integers', 'even numbers', 'odd numbers'], [5, 6, 7, 8, 9, 10, 11]], (k, n) => k !== 'integers' || n % 2 === 1);
      const step = kind === 'integers' ? 1 : 2;
      let m = d.int(20, 90);
      if (kind !== 'integers') { const want = kind === 'even numbers' ? (n % 2 ? 0 : 1) : n % 2 ? 1 : 0; if (m % 2 !== want) m++; }
      const largest = m + ((n - 1) / 2) * step;
      return {
        rank: 3,
        text: `The average of ${n} consecutive ${kind} is ${m}. What is the largest of them?`,
        answer: choices(d, largest, [m + (n - 1) * step, m - ((n - 1) / 2) * step, largest + step, largest - step, largest + 2 * step]),
        check: () => { const first = largest - (n - 1) * step, list = range(0, n - 1).map((i) => first + i * step); const avg = list.reduce((s, v) => s + v, 0) / n; return avg === m && list.every((v) => (kind === 'integers' ? true : (v % 2 === 0) === (kind === 'even numbers'))) ? '' : 'list wrong'; },
        solution: `Consecutive ${kind} are evenly spaced (${step} apart), so their average is the middle of the list. The ${n} numbers stretch ${num(((n - 1) / 2) * step)} on each side of ${m}, so the largest is ${m} + ${num(((n - 1) / 2) * step)} = <b>${num(largest)}</b>.`,
      };
    },
  ],

  // ---------- coordinate geometry ----------
  'Coordinate geometry': [
    // the area of a triangle (the first corner walks through its combinations, so no two turns are the same)
    (d, ctx) => {
      const first = combo(ctx, [range(-6, 2), range(-5, 3)]);
      let P, area;
      do {
        P = [first, [d.int(1, 8), d.int(-6, 2)], [d.int(-3, 6), d.int(2, 9)]];
        area = Math.abs((P[1][0] - P[0][0]) * (P[2][1] - P[0][1]) - (P[2][0] - P[0][0]) * (P[1][1] - P[0][1])) / 2;
      } while (area < 6);
      const xs = P.map((p) => p[0]), ys = P.map((p) => p[1]), boxA = (Math.max(...xs) - Math.min(...xs)) * (Math.max(...ys) - Math.min(...ys));
      return {
        rank: 13,
        text: `What is the area of the triangle with vertices ${pt(P[0])}, ${pt(P[1])} and ${pt(P[2])}?`,
        answer: choices(d, area, [2 * area, area + 1, boxA, area - 1, boxA / 2]),
        check: () => { const [u, v, w] = [0, 1, 2].map((i) => Math.hypot(P[i][0] - P[(i + 1) % 3][0], P[i][1] - P[(i + 1) % 3][1])), s = (u + v + w) / 2; return Math.abs(Math.sqrt(s * (s - u) * (s - v) * (s - w)) - area) < 1e-6 ? '' : 'Heron disagrees'; },
        solution: `Shoelace formula: ½·|(x₂ − x₁)(y₃ − y₁) − (x₃ − x₁)(y₂ − y₁)| = ½·|(${num(P[1][0] - P[0][0])})(${num(P[2][1] - P[0][1])}) − (${num(P[2][0] - P[0][0])})(${num(P[1][1] - P[0][1])})| = <b>${num(area)}</b>.`,
      };
    },
    // where a line crosses the x-axis
    (d, ctx) => {
      const [run, drop] = combo(ctx, [range(1, 6), range(1, 8)]);
      const x1 = d.int(-6, 2), y1 = d.int(1, 9), x2 = x1 + run, y2 = -drop;
      const dx = x2 - x1, dy = y2 - y1, top = x1 * dy - y1 * dx, g = gcd(top, dy) || 1, X = [top / g, dy / g];
      const fix = ([p, q]) => (q < 0 ? [-p, -q] : [p, q]), val = ([p, q]) => p / q;
      const ans = fix(X), wrongs = [fix([x1 * dy + y1 * dx, dy]), fix([y1 * dx, dy]), fix([-ans[0], ans[1]]), fix([ans[0] + ans[1], ans[1]]), fix([x1 * dx - y1 * dy, dx])].filter((w) => Math.abs(val(w) - val(ans)) > 1e-9);
      return {
        rank: 10,
        text: `The line through ${pt([x1, y1])} and ${pt([x2, y2])} crosses the x-axis at the point (k, 0). What is k?`,
        answer: choices(d, ans, wrongs, showFrac),
        check: () => { const k = val(ans); return Math.abs((x2 - x1) * (0 - y1) - (k - x1) * (y2 - y1)) < 1e-9 ? '' : 'not on the line'; },
        solution: `The slope is (${num(y2)} − ${num(y1)})/(${num(x2)} − ${x1 < 0 ? `(${num(x1)})` : num(x1)}) = ${frac(dy, dx)}. Going down from height ${y1} to 0 at that slope takes a run of ${y1} ÷ ${frac(-dy, dx)} = ${frac(y1 * dx, -dy)}, so k = ${num(x1)} + ${frac(y1 * dx, -dy)} = <b>${showFrac(ans)}</b>.`,
      };
    },
    // the missing coordinate of a point on the same line
    (d, ctx) => {
      const [dx, dy, j] = combo(ctx, [range(1, 4), [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], range(2, 5)]);
      const x1 = d.int(-5, 3), y1 = d.int(-6, 6);
      const x2 = x1 + dx, y2 = y1 + dy, x3 = x1 + j * dx, k = y1 + j * dy;
      return {
        rank: 9,
        text: `The points ${pt([x1, y1])}, ${pt([x2, y2])} and (${num(x3)}, k) all lie on one straight line. What is k?`,
        answer: choices(d, k, [y1 + j * dx, k + dy, y2 + j * dy, -k, y1 + (j - 1) * dy]),
        check: () => ((x2 - x1) * (k - y1) - (x3 - x1) * (y2 - y1) === 0 ? '' : 'not on the line'),
        solution: `From ${pt([x1, y1])} to ${pt([x2, y2])}, x goes up ${dx} and y changes by ${num(dy)}. To reach x = ${num(x3)}, x goes up ${j * dx} from ${num(x1)}, which is ${j} times as far, so y changes by ${j}·(${num(dy)}) = ${num(j * dy)}: k = ${num(y1)} + (${num(j * dy)}) = <b>${num(k)}</b>.`,
      };
    },
    // the distance between two points
    (d, ctx) => {
      const [[a, b], swap] = combo(ctx, [[[3, 4], [5, 12], [6, 8], [8, 15], [7, 24], [9, 12], [12, 16], [20, 21]], [false, true]]);
      const x1 = d.int(-9, 5), y1 = d.int(-9, 5), sx = d.pick([1, -1]), sy = d.pick([1, -1]);
      const [ex, ey] = swap ? [b, a] : [a, b], x2 = x1 + sx * ex, y2 = y1 + sy * ey, c = Math.hypot(a, b);
      return {
        rank: 4,
        text: `How far apart are the points ${pt([x1, y1])} and ${pt([x2, y2])}?`,
        answer: choices(d, c, [a + b, a * a + b * b, Math.abs(b - a), c + 1, c - 1]),
        check: () => (Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2) === c ? '' : 'distance wrong'),
        solution: `Across: |${num(x2)} − (${num(x1)})| = ${ex}. Up or down: |${num(y2)} − (${num(y1)})| = ${ey}. These are the legs of a right triangle, so the distance is √(${ex}² + ${ey}²) = √${a * a + b * b} = <b>${c}</b>.`,
      };
    },
  ],
});
