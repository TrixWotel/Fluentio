// AMC 10 number theory: 20 topics, each with three or four different kinds of question on the same idea (digit
// patterns, divisors, remainders, bases…) and new numbers every time. Every question checks its answer a second,
// independent way.
import { combo, num, frac, gcd, lcm } from '../kit/bank.js';
import { ord, range, digitSum, choices, labelled, showFrac } from './amc-kit.js';

const divisors = (n) => { const out = []; for (let i = 1; i * i <= n; i++) if (n % i === 0) { out.push(i); if (i * i !== n) out.push(n / i); } return out.sort((a, b) => a - b); };
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const primesTo = (n) => range(2, n).filter(isPrime);
const vp = (n, p) => { let e = 0; while (n % p === 0) { n /= p; e++; } return e; };
const legendre = (n, p) => { let e = 0; for (let q = p; q <= n; q *= p) e += Math.floor(n / q); return e; };   // the power of p in n!
const factor = (n) => { const out = []; for (let p = 2; p * p <= n; p++) if (n % p === 0) { let e = 0; while (n % p === 0) { n /= p; e++; } out.push([p, e]); } if (n > 1) out.push([n, 1]); return out; };
const sigma = (n) => divisors(n).reduce((s, x) => s + x, 0);
const product = (list) => list.reduce((x, y) => x * y, 1);
const total = (list) => list.reduce((x, y) => x + y, 0);
const ints = (v) => num(v, 0);
const sup = (b, e) => `${b}<sup>${e}</sup>`;
const pw = (b, e) => (e === 1 ? `${b}` : sup(b, e));
const fr = (p, q) => `<span class="fr"><span>${p}</span><span>${q}</span></span>`;
const opt = (v, s = String(v)) => [v, s];
// b^e mod m, for big exponents
const powMod = (b, e, m) => { let r = 1n, x = BigInt(b) % BigInt(m), k = BigInt(e); const M = BigInt(m); while (k > 0n) { if (k & 1n) r = (r * x) % M; x = (x * x) % M; k >>= 1n; } return Number(r); };
// the remainders of b, b², b³, … mod m, up to where they start over
const cycle = (b, m) => { const seq = []; let v = b % m; while (!seq.includes(v)) { seq.push(v); v = (v * b) % m; } return seq; };
// the floor of the k-th root of a BigInt
const iroot = (n, k) => { if (n < 2n) return n; const K = BigInt(k); let lo = 0n, hi = 1n; while (hi ** K <= n) hi *= 2n; while (hi - lo > 1n) { const mid = (lo + hi) / 2n; if (mid ** K <= n) lo = mid; else hi = mid; } return lo; };
const isSquare = (n) => { const N = BigInt(n), r = iroot(N, 2); return r * r === N; };
// Miller–Rabin with the first twelve primes as witnesses: certain for numbers below 3·10²⁴
function isPrimeBig(n) {
  const W = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
  if (n < 2n) return false;
  for (const p of W) { if (n === p) return true; if (n % p === 0n) return false; }
  let d = n - 1n, s = 0;
  while (d % 2n === 0n) { d /= 2n; s++; }
  const mp = (b, e) => { let r = 1n; b %= n; while (e > 0n) { if (e & 1n) r = (r * b) % n; b = (b * b) % n; e >>= 1n; } return r; };
  next: for (const a of W) {
    let x = mp(a, d);
    if (x === 1n || x === n - 1n) continue;
    for (let i = 1; i < s; i++) { x = (x * x) % n; if (x === n - 1n) continue next; }
    return false;
  }
  return true;
}
// a topic: its kinds of question, each told the topic's name
const topic = (name, ...forms) => [name, forms.map((f) => (d, ctx) => ({ topic: name, ...f(d, ctx) }))];

// three integers (two may be negative) with product P: the smallest positive sum, and the smallest with all positive
function search(P) {
  let low = null, allPos = Infinity;
  const sums = new Set();
  for (const x of divisors(P)) for (const y of divisors(P / x)) {
    const z = P / x / y;
    allPos = Math.min(allPos, x + y + z);
    sums.add(x + y + z);
    if (z - x - y > 0) { sums.add(z - x - y); if (!low || z - x - y < low.s) low = { s: z - x - y, x, y, z }; }
  }
  return { ...low, allPos, sums: [...sums].sort((a, b) => a - b) };
}
// every way to write P as x · y · z with 1 ≤ x ≤ y ≤ z
const triples = (P) => { const out = []; for (const x of divisors(P)) for (const y of divisors(P / x)) { const z = P / x / y; if (x <= y && y <= z) out.push([x, y, z]); } return out; };
// the ones whose sum no other has (so the product and the sum pin them down), leaving out 1 · 1 · P
const pinned = (P) => { const all = triples(P), s = all.map(total); return all.filter((t, i) => t[0] > 1 && s.filter((v) => v === s[i]).length === 1); };

const unit = (x, k) => { const c = cycle(x % 10, 10); return c[(k - 1) % c.length]; };
const sayUnit = (x, k) => {
  const cyc = cycle(x % 10, 10), p = ((k - 1) % cyc.length) + 1;
  return `Powers of ${x % 10} end in ${cyc.join(', ')}, over and over; ${k} leaves remainder ${k % cyc.length} when divided by ${cyc.length}, so ${sup(x, k)} ends in the same digit as ${pw(x % 10, p)}, which is ${cyc[p - 1]}.`;
};
// the digits of p/q that repeat (q has no factor 2 or 5, so the block starts right after the point)
const block = (p, q) => { let r = p % q, out = ''; const seen = new Set(); while (!seen.has(r)) { seen.add(r); r *= 10; out += Math.floor(r / q); r %= q; } return out; };
// the base-b value of a string of decimal digits, and the digits written out as a polynomial in b
const poly = (ds) => ds.map((c, i) => [c, ds.length - 1 - i]).filter(([c]) => c).map(([c, e]) => (e === 0 ? `${c}` : `${c === 1 ? '' : c}b${e > 1 ? `<sup>${e}</sup>` : ''}`)).join(' + ');
const inBase = (s, b) => s.split('').reduce((v, c) => v * b + +c, 0);
const WORDS = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'];
const letters = (B) => {
  const L = B - 10;
  return L === 1 ? 'the letter A for ten' : L <= 3 ? `the letters ${'ABC'.slice(0, L - 1).split('').join(', ')} and ${'ABC'[L - 1]} for ${WORDS.slice(0, L - 1).join(', ')} and ${WORDS[L - 1]}` : `the letters A through ${'ABCDEF'[L - 1]} for ${WORDS[0]} through ${WORDS[L - 1]}`;
};
const digitOf = (v) => (v < 10 ? String(v) : 'ABCDEF'[v - 10]);
// the first n digits of p/q in base k, by long division
const expand = (p, q, k, n) => { const out = []; let r = p; for (let i = 0; i < n; i++) { r *= k; out.push(Math.floor(r / q)); r %= q; } return out; };
// 1 + 2 + ⋯ + k divides k!?
function sumDivides(k) {
  let T = (k * (k + 1)) / 2;
  for (let f = 2; f <= T; f++) if (T % f === 0) { const e = vp(T, f); T /= f ** e; if (legendre(k, f) < e) return false; }
  return true;
}
// the first time at least j of the karts a, a + 1, …, M (k minutes a lap) are at the start together
const firstMeet = (a, M, j) => { let T = 1; while (range(a, M).filter((k) => T % k === 0).length < j) T++; return T; };
// how many times the digit x (1 to 9) is written in 1, 2, …, N, place by place
const placeCount = (N, x, p) => { const high = Math.floor(N / (10 * p)), cur = Math.floor(N / p) % 10, low = N % p; return high * p + (cur > x ? p : cur === x ? low + 1 : 0); };
// two digits that add up to t: how many ways; and 1 + 2 + ⋯ + r written out with its total
const upTo = (r) => (r === 1 ? '1' : r === 2 ? '1 + 2 = 3' : `1 + 2 + ⋯ + ${r} = ${(r * (r + 1)) / 2}`);
const pairs = (t) => (t < 0 || t > 18 ? 0 : t <= 9 ? t + 1 : 19 - t);

export const numberTheory = Object.fromEntries([
  topic('Primes in a digit pattern',
    // k ones, a 0, k ones: always (k ones) × (10^(k+1) + 1)
    (d, ctx) => {
      const [count, ask] = combo(ctx, [range(6, 12), ['prime', 'composite']]), value = ask === 'prime' ? 1 : count - 1;
      const term = (k) => '1'.repeat(k) + '0' + '1'.repeat(k);
      return {
        rank: 6,
        text: `The list 101, 11011, 1110111, 111101111, … goes on the same way: its k-th number is k ones, then a 0, then k more ones. How many of the first ${count} numbers in the list are ${ask}?`,
        answer: choices(d, value, ask === 'prime' ? [0, 2, 3, count] : [count, count - 2, 0, 1]),
        check: () => { const primes = range(1, count).filter((k) => isPrimeBig(BigInt(term(k)))).length; return (ask === 'prime' ? primes : count - primes) === value ? '' : `found ${primes} primes`; },
        solution: `The k-th number is 11…1 (k ones) times 10<sup>k+1</sup> + 1: for example 11011 = 11 × 1001 and 1110111 = 111 × 10001. For k ≥ 2 both factors are more than 1, so the number is composite. Only the first number, 101, is prime. So ${ask === 'prime' ? `<b>1</b> of the first ${count} is prime` : `<b>${count - 1}</b> of the first ${count} are composite`}.`,
      };
    },
    // 10^k + 1: only 11 and 101 are prime among the first dozen
    (d, ctx) => {
      const [n, ask] = combo(ctx, [range(5, 12), ['prime', 'composite']]), value = ask === 'prime' ? 2 : n - 2;
      return {
        rank: 9,
        text: `The list 11, 101, 1001, 10001, 100001, … goes on the same way: its k-th number is a 1, then k − 1 zeros, then a 1 (that is, 10<sup>k</sup> + 1). How many of the first ${n} numbers in the list are ${ask}?`,
        answer: choices(d, value, ask === 'prime' ? [1, 3, 4, 0, n - 2] : [n - 1, n - 3, n - 4, n]),
        check: () => { const primes = range(1, n).filter((k) => isPrimeBig(10n ** BigInt(k) + 1n)).length; return (ask === 'prime' ? primes : n - primes) === value ? '' : `found ${primes} primes`; },
        solution: `If k has an odd factor m > 1, then 10<sup>k</sup> + 1 = x<sup>m</sup> + 1 with x = 10<sup>k/m</sup>, and x + 1 divides x<sup>m</sup> + 1 because m is odd: for example 1001 = 11 × 91 and 100001 = 11 × 9091. That leaves k = 1, 2, 4 and 8: 11 and 101 are prime, but 10001 = 73 × 137 and 100000001 = 17 × 5882353. So ${ask === 'prime' ? `<b>2</b> of the first ${n} are prime` : `<b>${n - 2}</b> of the first ${n} are composite`}.`,
      };
    },
    // 1, m zeros, 1: a multiple of 11 exactly when m is even
    (d, ctx) => {
      const [N] = combo(ctx, [range(15, 60)]), value = Math.floor(N / 2);
      return {
        rank: 8,
        text: `A number is written as a 1, then m zeros, then another 1 (so m = 2 gives 1001). For how many values of m from 1 to ${N} is the number a multiple of 11?`,
        answer: choices(d, value, [Math.ceil(N / 2) === value ? value + 1 : Math.ceil(N / 2), N, Math.floor(N / 3), value - 1, Math.floor(N / 11)]),
        check: () => { const k = range(1, N).filter((m) => (10n ** BigInt(m + 1) + 1n) % 11n === 0n).length; return k === value ? '' : `found ${k}`; },
        solution: `The number is 10<sup>m+1</sup> + 1. Since 10 = 11 − 1, a power of 10 is 1 less than a multiple of 11 when its exponent is odd, and 1 more when it is even (10 = 11 − 1, 100 = 99 + 1, 1000 = 1001 − 1, …). So 10<sup>m+1</sup> + 1 is a multiple of 11 exactly when m + 1 is odd, that is, when m is even. From 1 to ${N} there are <b>${value}</b> even numbers.`,
      };
    },
    // a two-digit prime written over and over: a multiple of itself
    (d, ctx) => {
      const [ab, n, ask] = combo(ctx, [primesTo(97).filter((p) => p > 10), range(5, 10), ['prime', 'composite']]), value = ask === 'prime' ? 1 : n - 1;
      const term = (k) => String(ab).repeat(k);
      return {
        rank: 6,
        text: `The numbers ${ab}, ${term(2)}, ${term(3)}, … are made by writing the prime ${ab} once, twice, three times, and so on. How many of the first ${n} of them are ${ask}?`,
        answer: choices(d, value, ask === 'prime' ? [0, 2, n, Math.ceil(n / 2)] : [n, n - 2, 0, Math.floor(n / 2)]),
        check: () => { const primes = range(1, n).filter((k) => isPrimeBig(BigInt(term(k)))).length; return (ask === 'prime' ? primes : n - primes) === value ? '' : `found ${primes} primes`; },
        solution: `Writing ${ab} k times gives ${ab} × 1010…101 (with k ones): for example ${term(2)} = ${ab} × 101 and ${term(3)} = ${ab} × 10101. So every number after the first is a multiple of ${ab} bigger than ${ab}, and that makes it composite. Only ${ab} itself is prime, so ${ask === 'prime' ? '<b>1</b> of them is prime' : `<b>${n - 1}</b> of them are composite`}.`,
      };
    }),

  topic('Product and least sum',
    // two of the three may be negative
    (d, ctx) => {
      const [P] = combo(ctx, [[36, 40, 48, 54, 72, 84, 90, 96, 100, 108, 126, 132, 150, 168, 180, 200, 210, 252]], (P) => search(P).s !== 3), b = search(P);
      return {
        rank: 7,
        text: `Three integers, which need not be positive or different, have a product of ${P}. Of all the positive values their sum can have, what is the smallest?`,
        answer: choices(d, b.s, [b.allPos, b.sums[1], 1, 2, b.s + 1, b.s + 2]),
        check: () => {
          let low = Infinity;
          for (let a = -P; a <= P; a++) for (let c = -P; c <= P; c++) { if (!a || !c || P % (a * c)) continue; const s = a + c + P / (a * c); if (s > 0) low = Math.min(low, s); }
          return low === b.s ? '' : `brute force says ${low}`;
        },
        solution: `A product of ${P} has an even number of negative factors. With none, the sum is at least ${b.allPos}. With two, call the integers −x, −y and z, where xyz = ${P}; their sum is z − x − y. Going through the ways to split ${P} as x · y · z, the smallest positive value of z − x − y is ${b.z} − ${b.x} − ${b.y}, from the integers −${b.x}, −${b.y} and ${b.z}. So the answer is <b>${b.s}</b>.`,
      };
    },
    // all positive: keep them close together
    (d, ctx) => {
      const [P] = combo(ctx, [[36, 40, 48, 54, 60, 72, 84, 90, 96, 100, 108, 120, 126, 150, 168, 180, 200, 216, 240, 252]]);
      const all = triples(P), sums = [...new Set(all.map(total))].sort((a, b) => a - b), best = all.find((t) => total(t) === sums[0]);
      return {
        rank: 5,
        text: `Three positive integers have a product of ${P}. What is the smallest their sum can be?`,
        answer: choices(d, sums[0], [search(P).s, sums[1], 2 + P, sums[2], sums[0] - 1]),
        check: () => { let low = Infinity; for (let x = 1; x <= P; x++) for (let y = 1; y <= P; y++) if (P % (x * y) === 0) low = Math.min(low, x + y + P / (x * y)); return low === sums[0] ? '' : `brute force says ${low}`; },
        solution: `For a fixed product, the sum is smallest when the three numbers are as close together as possible, near the cube root of ${P} (about ${num(Math.cbrt(P), 1)}). Trying the ways to split ${P} near there, ${best.join(' · ')} has the smallest sum: ${best.join(' + ')} = <b>${sums[0]}</b>.`,
      };
    },
    // the product and the sum together pin the three numbers down
    (d, ctx) => {
      const [P] = combo(ctx, [[60, 72, 84, 90, 96, 120, 126, 144, 150, 168, 180, 210, 240, 252, 270, 280]], (P) => pinned(P).length > 0);
      const [x, y, z] = d.pick(pinned(P)), S = x + y + z, others = triples(P).filter((t) => t.join() !== [x, y, z].join());
      const near = others.sort((a, b) => Math.abs(total(a) - S) - Math.abs(total(b) - S)).slice(0, 3);
      return {
        rank: 9,
        text: `Three positive integers have a product of ${P} and a sum of ${S}. What is the largest of the three?`,
        answer: choices(d, z, [y, x, ...near.map((t) => t[2]), S - z, P / z]),
        check: () => { const hits = []; for (let a = 1; a <= P; a++) for (let b = a; b <= P; b++) { const c = P / (a * b); if (Number.isInteger(c) && c >= b && a + b + c === S) hits.push(c); } return hits.length === 1 && hits[0] === z ? '' : `found ${hits.join(', ')}`; },
        solution: `List the ways to write ${P} as a product of three positive integers and add up each: for example ${near.map((t) => `${t.join(' · ')} adds to ${total(t)}`).join(', ')}. Only ${x} · ${y} · ${z} adds up to ${S}, so the largest of the three is <b>${z}</b>.`,
      };
    }),

  topic('LCM and GCD',
    // an lcm with one number and a gcd with another pin down n
    (d) => {
      let a, b, n, L, G, fits;
      for (;;) {
        a = d.pick([12, 14, 15, 20, 21, 24, 28, 30, 35, 36, 40]); b = d.pick([18, 20, 27, 28, 30, 42, 45, 50, 54, 70, 75, 98]); n = d.int(12, 150);
        L = lcm(n, a); G = gcd(n, b); fits = divisors(L).filter((x) => lcm(x, a) === L);
        if (G > 1 && n !== a && n !== L && fits.length >= 3 && fits.filter((x) => gcd(x, b) === G).length === 1) break;
      }
      return {
        rank: 7,
        text: `A positive integer n has least common multiple ${L} with ${a}, and greatest common divisor ${G} with ${b}. What is n?`,
        answer: choices(d, n, [...d.shuffle(fits.filter((x) => x !== n)), ...d.shuffle(divisors(L).filter((x) => x !== n && gcd(x, b) === G)), L, 2 * n]),
        check: () => { const found = range(1, 2 * L).filter((x) => lcm(x, a) === L && gcd(x, b) === G); return found.length === 1 && found[0] === n ? '' : `found ${found.join(', ')}`; },
        solution: `Since lcm(n, ${a}) = ${L}, n is a divisor of ${L}. The divisors of ${L} whose lcm with ${a} is ${L} are ${fits.join(', ')}. Of these, only ${n} has gcd ${G} with ${b}. So n = <b>${n}</b>.`,
      };
    },
    // how many pairs share a given gcd and lcm
    (d, ctx) => {
      const [G, K] = combo(ctx, [[1, 2, 3, 4, 5, 6, 10, 12], [6, 10, 12, 18, 20, 30, 36, 42, 60, 70, 84, 90, 210]], (G, K) => G * K <= 3000);
      const L = G * K, f = factor(K), w = f.length, value = 2 ** w;
      return {
        rank: 13,
        text: `Positive integers a and b have greatest common divisor ${G} and least common multiple ${num(L, 0)}. How many ordered pairs (a, b) are possible?`,
        answer: choices(d, value, [2 ** (w - 1), w, divisors(K).length, value + 2, 2 * divisors(K).length]),
        check: () => { const ds = divisors(L); let k = 0; for (const x of ds) for (const y of ds) if (gcd(x, y) === G && lcm(x, y) === L) k++; return k === value ? '' : `brute force found ${k}`; },
        solution: `Write a = ${G}x and b = ${G}y. Then x and y have no common factor, and their lcm is xy = ${num(L, 0)}/${G} = ${K} = ${f.map(([p, e]) => pw(p, e)).join(' · ')}. Each prime power must go whole to x or to y (split between them, it would leave a common factor), so there are 2 choices for each of the ${w} primes: 2<sup>${w}</sup> = <b>${value}</b> ordered pairs.`,
      };
    },
    // gcd × lcm = product: one number gives the other
    (d, ctx) => {
      const [G, [x, y]] = combo(ctx, [[2, 3, 4, 5, 6, 7, 8, 9, 12, 15], [[2, 3], [3, 4], [3, 5], [4, 5], [2, 5], [5, 6], [4, 7], [3, 7], [5, 8], [7, 9]]]);
      const a = G * x, b = G * y, L = G * x * y;
      return {
        rank: 5,
        text: `Two positive integers have greatest common divisor ${G} and least common multiple ${L}. One of them is ${a}. What is the other?`,
        answer: choices(d, b, [y, x * y, L - a, b + G, 2 * b]),
        check: () => { const hits = range(1, L).filter((c) => gcd(a, c) === G && lcm(a, c) === L); return hits.length === 1 && hits[0] === b ? '' : `found ${hits.join(', ')}`; },
        solution: `For any two positive integers, gcd × lcm = the product of the two numbers. So the other number is ${G} · ${L} / ${a} = <b>${b}</b>.`,
      };
    },
    // the same remainder from three divisors: one more than a common multiple
    (d, ctx) => {
      const [[a, b, c], r] = combo(ctx, [[[4, 6, 9], [6, 8, 10], [4, 10, 15], [6, 9, 15], [8, 12, 18], [10, 12, 15], [9, 12, 14], [6, 14, 21], [8, 14, 20], [12, 15, 20]], [1, 2, 3]], (t, r) => r < t[0]);
      const L = lcm(lcm(a, b), c), value = L + r;
      return {
        rank: 6,
        text: `What is the smallest integer greater than ${r} that leaves a remainder of ${r} when divided by ${a}, by ${b} and by ${c}?`,
        answer: choices(d, value, [a * b * c + r, L, 2 * L + r, a * b + r, lcm(a, b) + r]),
        check: () => { let n = r + 1; while (n % a !== r || n % b !== r || n % c !== r) n++; return n === value ? '' : `search found ${n}`; },
        solution: `n − ${r} must be a multiple of ${a}, of ${b} and of ${c}, so a multiple of their least common multiple: lcm(${a}, ${b}, ${c}) = ${L}. The smallest such n above ${r} is ${L} + ${r} = <b>${value}</b>.`,
      };
    }),

  topic('Odd and even divisor sums',
    // the ratio of the two totals
    (d) => {
      const pool = [15, 21, 33, 35, 45, 49, 55, 75, 77, 81, 99, 6, 10, 14, 18, 22, 26, 30, 42, 50, 66, 70, 90, 98, 12, 20, 28, 36, 44, 52, 60, 84, 100, 24, 40, 56, 72, 88, 48, 80, 112];
      const a = d.pick([1, 2, 4, 5]);
      let f;
      do f = [0, 1, 2].map(() => d.pick(pool)).sort((x, y) => x - y); while (f.reduce((s, x) => s + vp(x, 2), 0) !== a || f[0] * f[1] * f[2] > 2e6);
      const N = f[0] * f[1] * f[2], m = N / 2 ** a, r = 2 ** (a + 1) - 2, powers = range(1, a).map((i) => 2 ** i);
      const ratio = (v) => [v, `1 : ${v}`];
      return {
        rank: 9,
        text: `Let N = ${f.join(' · ')}. Add up all the odd positive divisors of N, and separately add up all the even ones. What is the ratio of the odd total to the even total?`,
        answer: labelled(ratio(r), [2 ** a, 2 ** (a + 1), 2 ** (a + 1) - 1, 2 ** a - 1, 2 ** (a + 2) - 2, a + 1, 2 * a].filter((v) => v > 0).map(ratio)),
        check: () => { let odd = 0, even = 0; for (const x of divisors(N)) if (x % 2) odd += x; else even += x; return even === r * odd ? '' : `sums ${odd} and ${even}`; },
        solution: `N = ${pw(2, a)} · ${num(m, 0)}, and ${num(m, 0)} is odd. The odd divisors of N are the divisors of ${num(m, 0)}; say they add up to s. `
          + (a === 1 ? 'Every even divisor is 2 times an odd one, so the even divisors add up to 2s.' : `Every even divisor is ${powers.slice(0, -1).join(', ')} or ${powers.at(-1)} times an odd one, so the even divisors add up to (${powers.join(' + ')}) · s = ${r}s.`)
          + ` The ratio is <b>1 : ${r}</b>.`,
      };
    },
    // the odd divisors are the divisors of the odd part
    (d, ctx) => {
      const [a, m] = combo(ctx, [[1, 2, 3, 4, 5], [9, 15, 21, 25, 27, 35, 45, 49, 63, 75, 81, 99, 105]]), N = 2 ** a * m, value = sigma(m);
      return {
        rank: 7,
        text: `What is the sum of all the odd positive divisors of ${ints(N)}?`,
        answer: choices(d, value, [sigma(N), sigma(N) - value, value - m, value - 1, 2 * value], ints),
        check: () => { const s = divisors(N).filter((x) => x % 2).reduce((t, x) => t + x, 0); return s === value ? '' : `brute force says ${s}`; },
        solution: `${ints(N)} = ${pw(2, a)} · ${m}, so its odd divisors are exactly the divisors of ${m}: ${divisors(m).join(', ')}. They add up to <b>${ints(value)}</b>.`,
      };
    },
    // the share of divisors that are even depends only on the power of 2
    (d, ctx) => {
      const [a, m] = combo(ctx, [[1, 2, 3, 4, 5, 6], [3, 5, 7, 9, 15, 21, 25, 27, 35, 45]]), N = 2 ** a * m;
      return {
        rank: 8,
        text: `What fraction of the positive divisors of ${ints(N)} are even?`,
        answer: choices(d, [a, a + 1], [[1, 2], [1, a + 1], [a, a + 2], [a + 1, a + 2], [divisors(m).length, divisors(N).length], [1, 3], [3, 4], [1, 4]], showFrac),
        check: () => { const ds = divisors(N), even = ds.filter((x) => x % 2 === 0).length; return even * (a + 1) === ds.length * a ? '' : `${even} of ${ds.length}`; },
        solution: `${ints(N)} = ${pw(2, a)} · ${m} with ${m} odd. Every divisor is 2<sup>i</sup> times a divisor of ${m}, with i from 0 to ${a}: ${a + 1} equally common choices for i, and the divisor is even unless i = 0. So the fraction that are even is <b>${frac(a, a + 1)}</b>.`,
      };
    },
    // the even divisors' total: (2 + 4 + … + 2^a) times the odd total
    (d, ctx) => {
      const [a, m] = combo(ctx, [[1, 2, 3, 4], [9, 15, 21, 25, 27, 35, 45, 49, 63, 75]]), N = 2 ** a * m, s = sigma(m), value = (2 ** (a + 1) - 2) * s;
      const powers = range(1, a).map((i) => 2 ** i);
      return {
        rank: 9,
        text: `What is the sum of all the even positive divisors of ${ints(N)}?`,
        answer: choices(d, value, [sigma(N), s, 2 * s, (2 ** a) * s, sigma(N) - 2 * s].filter((v) => v !== value), ints),
        check: () => { const t = divisors(N).filter((x) => x % 2 === 0).reduce((u, x) => u + x, 0); return t === value ? '' : `brute force says ${t}`; },
        solution: `${ints(N)} = ${pw(2, a)} · ${m} with ${m} odd. Each even divisor is ${a === 1 ? '2' : powers.join(', ').replace(/, (\d+)$/, ' or $1')} times a divisor of ${m}, and the divisors of ${m} add up to ${ints(s)}. So the even divisors add up to (${powers.join(' + ')}) · ${ints(s)} = ${2 ** (a + 1) - 2} · ${ints(s)} = <b>${ints(value)}</b>.`,
      };
    }),

  topic('Repeating decimals',
    // a repeating decimal used as if it stopped
    (d, ctx) => {
      const [M, ab, w] = combo(ctx, [[12, 18, 22, 24, 33, 36, 44, 45, 54, 55, 72, 77, 88, 90, 99], range(10, 99), [1, 2, 3]], (M, ab) => (M * ab) % 99 === 0 && ab % 10 !== 0 && Math.floor(ab / 10) !== ab % 10);
      const diff = (M * ab) / 9900, swapped = (ab % 10) * 10 + Math.floor(ab / 10);
      return {
        rank: 8,
        text: `Nadia was supposed to multiply ${M} by the repeating decimal ${w}.<i>ab</i><i>ab</i><i>ab</i>…, in which the two digits <i>a</i> and <i>b</i> repeat forever. Not noticing the repeat, she multiplied ${M} by ${w}.<i>ab</i> instead, and her answer came out ${num(diff, 2)} too small. What is the two-digit number <i>ab</i>?`,
        answer: choices(d, ab, [swapped, ab + 9, ab - 9, ab + 11, Math.round(ab / 2)].filter((v) => v >= 10 && v <= 99)),
        check: () => { const hits = range(10, 99).filter((t) => Math.abs(M * (Number(`${w}.${String(t).repeat(8)}`) - Number(`${w}.${t}`)) - diff) < 1e-6); return hits.length === 1 && hits[0] === ab ? '' : `matches: ${hits.join(', ')}`; },
        solution: `The repeating decimal is ${w} + ${fr('<i>ab</i>', 99)} and the number she used is ${w} + ${fr('<i>ab</i>', 100)}. So her answer was short by ${M} · <i>ab</i> · (${fr(1, 99)} − ${fr(1, 100)}) = ${fr(`${M} · <i>ab</i>`, '9900')}. Setting that equal to ${num(diff, 2)} gives <i>ab</i> = 9900 · ${num(diff, 2)} / ${M} = <b>${ab}</b>.`,
      };
    },
    // two repeating digits as a fraction in lowest terms
    (d, ctx) => {
      const [ab] = combo(ctx, [range(12, 98)], (ab) => gcd(ab, 99) > 1 && ab % 11 !== 0), g = gcd(ab, 99), p = ab / g, q = 99 / g, value = p + q;
      return {
        rank: 9,
        text: `The repeating decimal 0.${ab}${ab}${ab}…, in which the digits ${ab} repeat forever, is written as a fraction p/q in lowest terms. What is p + q?`,
        answer: choices(d, value, [ab + 99, ab + 100, p + 99, q + ab, value + 1]),
        check: () => (gcd(p, q) === 1 && Math.abs(p / q - Number(`0.${String(ab).repeat(8)}`)) < 1e-12 ? '' : 'fraction wrong'),
        solution: `Call the number x. Then 100x = ${ab}.${ab}${ab}…, and subtracting x gives 99x = ${ab}. So x = ${fr(ab, 99)}, which is ${fr(p, q)} in lowest terms (divide top and bottom by ${g}). So p + q = ${p} + ${q} = <b>${value}</b>.`,
      };
    },
    // one digit, then two that repeat
    (d, ctx) => {
      const [a, bc] = combo(ctx, [range(1, 9), range(10, 98)], (a, bc) => bc % 11 !== 0 && bc % 10 !== a);
      const top = 99 * a + bc, g = gcd(top, 990), q = 990 / g;
      return {
        rank: 11,
        text: `When the repeating decimal 0.${a}${bc}${bc}${bc}… (the digit ${a}, then the digits ${bc} repeating forever) is written as a fraction in lowest terms, what is the denominator?`,
        answer: choices(d, q, [990, 99, 900, 999, 1000].filter((v) => v !== q), ints),
        check: () => (Math.abs(top / g / q - Number(`0.${a}${String(bc).repeat(7)}`)) < 1e-12 && gcd(top / g, q) === 1 ? '' : 'fraction wrong'),
        solution: `Call the number x. Then 10x = ${a}.${bc}${bc}… and 1000x = ${a}${bc}.${bc}${bc}…, so subtracting, 990x = ${a}${bc} − ${a} = ${top}. That makes x = ${fr(top, 990)} = ${fr(top / g, q)} in lowest terms, so the denominator is <b>${q}</b>.`,
      };
    },
    // a far-off digit of a repeating decimal
    (d, ctx) => {
      const [[p, q], N] = combo(ctx, [[[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7], [1, 13], [2, 13], [1, 27], [5, 27], [5, 11], [7, 11], [1, 37], [10, 37]], range(2001, 2040)]);
      const digits = block(p, q), L = digits.length, i = (N - 1) % L, value = +digits[i];
      return {
        rank: 8,
        text: `What is the ${ord(N)} digit after the decimal point in the decimal form of ${frac(p, q)}?`,
        answer: choices(d, value, [+digits[(i + 1) % L], +digits[(i + L - 1) % L], ...d.shuffle(digits.split('').map(Number)), ...d.shuffle(range(0, 9))]),
        check: () => { let r = p, digit = -1; for (let k = 0; k < N; k++) { r *= 10; digit = Math.floor(r / q); r %= q; } return digit === value ? '' : `long division says ${digit}`; },
        solution: `${frac(p, q)} = 0.${digits}${digits}…: the block ${digits} of ${L} digits repeats forever. ${N} = ${L} · ${Math.floor((N - 1) / L)} + ${i + 1}, so the ${ord(N)} digit is the ${ord(i + 1)} digit of the block: <b>${value}</b>.`,
      };
    }),

  topic('Units digits',
    // a sum of two big powers
    (d) => {
      let a, b, c, e, value;
      do {
        a = 10 * d.int(100, 999) + d.pick([2, 3, 7, 8]); c = 10 * d.int(100, 999) + d.pick([2, 3, 4, 7, 8, 9]);
        b = d.int(100, 3000); e = d.int(100, 3000); value = (unit(a, b) + unit(c, e)) % 10;
      } while (value === 7);
      const ua = unit(a, b), uc = unit(c, e);
      return {
        rank: 8,
        text: `What is the units digit of ${sup(a, b)} + ${sup(c, e)}?`,
        answer: choices(d, value, [ua, uc, (a + c) % 10, (unit(a, b + 1) + uc) % 10, (ua + unit(c, e + 1)) % 10, ...d.shuffle(range(0, 9))]),
        check: () => ((powMod(a, b, 10) + powMod(c, e, 10)) % 10 === value ? '' : 'units digit wrong'),
        solution: `Only the last digits matter. ${sayUnit(a, b)} ${sayUnit(c, e)} So the sum ends in the units digit of ${ua} + ${uc}: <b>${value}</b>.`,
      };
    },
    // a product of two big powers
    (d) => {
      const a = 10 * d.int(10, 99) + d.pick([2, 3, 7, 8, 9]), c = 10 * d.int(10, 99) + d.pick([3, 4, 7, 9]), b = d.int(50, 999), e = d.int(50, 999);
      const ua = unit(a, b), uc = unit(c, e), value = (ua * uc) % 10;
      return {
        rank: 7,
        text: `What is the units digit of ${sup(a, b)} × ${sup(c, e)}?`,
        answer: choices(d, value, [(ua + uc) % 10, ua, uc, (a * c) % 10, ...d.shuffle(range(0, 9))]),
        check: () => ((powMod(a, b, 10) * powMod(c, e, 10)) % 10 === value ? '' : 'units digit wrong'),
        solution: `Only the last digits matter. ${sayUnit(a, b)} ${sayUnit(c, e)} So the product ends in the units digit of ${ua} × ${uc} = ${ua * uc}: <b>${value}</b>.`,
      };
    },
    // how often a power ends in a given digit
    (d, ctx) => {
      const [a, N] = combo(ctx, [[2, 3, 7, 8, 12, 13, 17, 18, 22, 23, 27, 28], range(40, 120)]);
      const cyc = cycle(a % 10, 10), t = cyc[ctx.k % cyc.length], r = cyc.indexOf(t) + 1, value = Math.floor((N - r) / 4) + 1;
      return {
        rank: 9,
        text: `How many of the numbers ${a}<sup>1</sup>, ${a}<sup>2</sup>, ${a}<sup>3</sup>, …, ${sup(a, N)} end in the digit ${t}?`,
        answer: choices(d, value, [Math.floor(N / 4) === value ? value + 1 : Math.floor(N / 4), Math.ceil(N / 4) === value ? value - 1 : Math.ceil(N / 4), Math.floor(N / 10), value + 2, Math.round(N / 3)]),
        check: () => { const k = range(1, N).filter((i) => powMod(a, i, 10) === t).length; return k === value ? '' : `brute force found ${k}`; },
        solution: `Powers of ${a % 10} end in ${cyc.join(', ')}, over and over, so ${a}<sup>i</sup> ends in ${t} exactly when i leaves remainder ${r % 4} when divided by 4: i = ${r}, ${r + 4}, ${r + 8}, …. Up to ${N} that is ${r}, ${r + 4}, …, ${r + 4 * (value - 1)}: <b>${value}</b> of them.`,
      };
    },
    // the last two digits, which repeat every 4 powers
    (d, ctx) => {
      const [B, n] = combo(ctx, [[7, 43, 57, 93], range(2001, 2060)]), cyc = cycle(B, 100), value = cyc[(n - 1) % 4];
      const two = (v) => String(v).padStart(2, '0');
      return {
        rank: 12,
        text: `What are the last two digits of ${sup(B, n)}?`,
        answer: labelled(opt(value, two(value)), [...cyc.filter((v) => v !== value).map((v) => opt(v, two(v))), opt((value + 10) % 100, two((value + 10) % 100))]),
        check: () => (powMod(B, n, 100) === value ? '' : 'last two digits wrong'),
        solution: `Only the last two digits matter: ${B}, ${B}<sup>2</sup>, ${B}<sup>3</sup> and ${B}<sup>4</sup> end in ${cyc.map(two).join(', ')}. Since ${B}<sup>4</sup> ends in 01, the pattern starts over every 4 powers. ${n} leaves remainder ${n % 4} when divided by 4, so ${sup(B, n)} ends in the same two digits as ${pw(B, ((n - 1) % 4) + 1)}: <b>${two(value)}</b>.`,
      };
    }),

  topic('Sums of powers mod m',
    // consecutive powers: factor out the smallest
    (d, ctx) => {
      const S = (b, t) => range(0, t - 1).reduce((s, i) => s + b ** i, 0);
      const [b, m, t] = combo(ctx, [[2, 3, 5, 6, 7, 10], [7, 11, 13, 17, 19, 23], [3, 4]], (b, m, t) => b % m !== 0 && cycle(b, m).length <= 10 && S(b, t) % m !== 0 && !(b === 7 && m === 19));
      const k = d.int(2025, 2060), sum = S(b, t), F = sum % m, seq = cycle(b, m), L = seq.length, x = seq[(k - 1) % L], value = (F * x) % m;
      const terms = range(0, t - 1).map((i) => sup(b, k + i)).join(' + '), small = range(0, t - 1).map((i) => (i === 0 ? '1' : pw(b, i))).join(' + ');
      return {
        rank: 7,
        text: `What is the remainder when ${terms} is divided by ${m}?`,
        answer: choices(d, value, [F, x, (F + x) % m, (t * x) % m, (F * seq[k % L]) % m, ...d.shuffle(range(0, m - 1))]),
        check: () => (range(0, t - 1).reduce((s, i) => s + powMod(b, k + i, m), 0) % m === value ? '' : 'remainder wrong'),
        solution: `Factor out ${sup(b, k)}: the sum is ${sup(b, k)} · (${small}) = ${sup(b, k)} · ${sum}${sum >= m ? `, and ${sum} leaves remainder ${F} when divided by ${m}` : ''}. The remainders of ${b}, ${sup(b, 2)}, ${sup(b, 3)}, … mod ${m} are ${seq.join(', ')}, and then they repeat. ${k} leaves remainder ${k % L} when divided by ${L}, so ${sup(b, k)} leaves remainder ${x}. The sum leaves the same remainder as ${F} · ${x} = ${F * x}: <b>${value}</b>.`,
      };
    },
    // a base one more or one less than the divisor
    (d, ctx) => {
      const [[b, m], k] = combo(ctx, [[[10, 11], [26, 27], [16, 17], [8, 9], [12, 13], [14, 13], [22, 21], [20, 19], [100, 101], [99, 100], [34, 35], [50, 49]], range(2021, 2060)]);
      const up = b % m === 1, value = up || k % 2 === 0 ? 1 : m - 1;
      return {
        rank: 6,
        text: `What is the remainder when ${sup(b, k)} is divided by ${m}?`,
        answer: choices(d, value, [1, m - 1, 0, b % m, 2, k % m]),
        check: () => (powMod(b, k, m) === value ? '' : 'remainder wrong'),
        solution: up
          ? `${b} = ${m} + 1 leaves remainder 1 when divided by ${m}, so every power of ${b} does too (1 · 1 · ⋯ · 1). The remainder is <b>1</b>.`
          : `${b} = ${m} − 1, so ${b} acts like −1 when divided by ${m}: ${sup(b, k)} acts like (−1)<sup>${k}</sup> = ${k % 2 ? '−1' : '1'}. ${k % 2 ? `A remainder of −1 means ${m} − 1, so the answer is <b>${value}</b>.` : 'So the remainder is <b>1</b>.'}`,
      };
    },
    // 1 + b + b² + ⋯ + b^n: full blocks of the cycle add up to a multiple of m
    (d, ctx) => {
      const [b, m, n] = combo(ctx, [[2, 3, 5], [7, 11, 13], range(30, 70)], (b, m) => cycle(b, m).length >= 3 && cycle(b, m).length <= 12);
      const L = cycle(b, m).length, seq = range(0, L - 1).map((i) => powMod(b, i, m)), S = total(seq);
      const full = Math.floor((n + 1) / L), left = (n + 1) % L, part = total(seq.slice(0, left)), value = part % m;
      return {
        rank: 10,
        text: `What is the remainder when 1 + ${b} + ${sup(b, 2)} + ${sup(b, 3)} + ⋯ + ${sup(b, n)} is divided by ${m}?`,
        answer: choices(d, value, [(n + 1) % m, (value + 1) % m, (full * S) % m === value ? (value + 2) % m : (full * S) % m, powMod(b, n, m), ...d.shuffle(range(0, m - 1))]),
        check: () => { let s = 0; for (let i = 0; i <= n; i++) s = (s + powMod(b, i, m)) % m; return s === value ? '' : `adding up gives ${s}`; },
        solution: `The remainders of 1, ${b}, ${sup(b, 2)}, … when divided by ${m} are ${seq.join(', ')}, and then they repeat every ${L} terms; one full block adds up to ${S}, a multiple of ${m}. The sum has ${n + 1} terms: ${full} full block${full > 1 ? 's' : ''}${left ? ` and ${left} more term${left > 1 ? 's' : ''} (${seq.slice(0, left).join(' + ')} = ${part})` : ''}. So the remainder is ${left ? `the remainder of ${part}` : '0'}: <b>${value}</b>.`,
      };
    }),

  topic('Difference of squares',
    // a square root that has to come out whole
    (d, ctx) => {
      const [c] = combo(ctx, [[45, 48, 63, 64, 72, 75, 80, 81, 96, 99, 105, 120, 135, 144]]);
      const pairList = divisors(c).filter((u) => u * u <= c && (u + c / u) % 2 === 0).map((u) => [(c / u - u) / 2, (u + c / u) / 2]);   // [m, n]
      const count = 2 * pairList.length, withNegM = count + 2 * pairList.filter(([m]) => m > 0).length, allPairs = 2 * divisors(c).filter((u) => u * u <= c).length;
      return {
        rank: 11,
        text: `For how many ordered pairs (m, n) of integers is √(n<sup>2</sup> − ${c}) equal to m?`,
        answer: labelled(opt(count), [[1e9, 'infinitely many'], opt(count / 2), opt(withNegM), opt(count + 2), opt(count - 2), opt(allPairs)]),
        check: () => { let k = 0; for (let n = -c - 1; n <= c + 1; n++) for (let m = 0; m <= c; m++) if (m * m === n * n - c) k++; return k === count ? '' : `brute force found ${k}`; },
        solution: `A square root is never negative, so m ≥ 0, and squaring gives n<sup>2</sup> − m<sup>2</sup> = ${c}, that is (n − m)(n + m) = ${c}. The two factors differ by 2m, so they have the same parity. For n > 0 the same-parity factor pairs of ${c} are ${pairList.map(([m, n]) => `${n - m} · ${n + m}`).join(', ')}, giving (m, n) = ${pairList.map(([m, n]) => `(${m}, ${n})`).join(', ')}. Each n can also be made negative, so there are <b>${count}</b> pairs.`,
      };
    },
    // which numbers are differences of two squares: all but 2, 6, 10, …
    (d, ctx) => {
      const [N] = combo(ctx, [[30, 40, 50, 60, 75, 80, 90, 100, 120, 150, 200, 250, 300]]), bad = Math.floor((N + 2) / 4), value = N - bad;
      return {
        rank: 14,
        text: `How many of the integers 1, 2, 3, …, ${N} can be written as x<sup>2</sup> − y<sup>2</sup> for some integers x and y?`,
        answer: choices(d, value, [Math.ceil(N / 2), N, Math.floor(N / 2), N - Math.floor(N / 4), value - Math.floor(N / 4)]),
        check: () => { const k = range(1, N).filter((t) => divisors(t).some((u) => u * u <= t && (u + t / u) % 2 === 0)).length; return k === value ? '' : `brute force found ${k}`; },
        solution: `x<sup>2</sup> − y<sup>2</sup> = (x − y)(x + y), and the two factors differ by 2y, so they are both odd or both even. Both odd gives an odd number, and both even gives a multiple of 4. Every such number works: an odd n is 1 · n (x = (n + 1)/2, y = (n − 1)/2), and 4k is 2 · 2k (x = k + 1, y = k − 1). So only 2, 6, 10, … (2 more than a multiple of 4) fail, and up to ${N} there are ${bad} of them. That leaves <b>${value}</b>.`,
      };
    },
    // the gap and the gap between the squares give the numbers
    (d, ctx) => {
      const [x, gap] = combo(ctx, [range(12, 60), [2, 3, 4, 5, 6, 7, 8]]), y = x - gap, D = x * x - y * y, s = x + y;
      return {
        rank: 5,
        text: `Two positive integers differ by ${gap}, and their squares differ by ${D}. What is the larger of the two integers?`,
        answer: choices(d, x, [s, y, Math.round(Math.sqrt(D)), x + gap, Math.round(D / gap / 2)]),
        check: () => { const hits = range(gap + 1, D).filter((u) => u * u - (u - gap) * (u - gap) === D); return hits.length === 1 && hits[0] === x ? '' : `found ${hits.join(', ')}`; },
        solution: `Call them x and y. x<sup>2</sup> − y<sup>2</sup> = (x − y)(x + y), so ${D} = ${gap}(x + y) and x + y = ${s}. Together with x − y = ${gap}, x = (${s} + ${gap})/2 = <b>${x}</b>.`,
      };
    },
    // a difference of squares worked out by factoring
    (d, ctx) => {
      const [c, e] = combo(ctx, [[300, 500, 700, 800, 1000, 1200, 1500, 2000, 2500, 3000], range(2, 15)]), A = c + e, B = c - e, value = A * A - B * B;
      return {
        rank: 3,
        text: `What is ${ints(A)}<sup>2</sup> − ${ints(B)}<sup>2</sup>?`,
        answer: choices(d, value, [(2 * e) ** 2, 2 * c * e, value + 4 * e * e, value / 2, value * 2], ints),
        check: () => (BigInt(A) ** 2n - BigInt(B) ** 2n === BigInt(value) ? '' : 'difference wrong'),
        solution: `Factor it as a difference of squares: (${ints(A)} − ${ints(B)})(${ints(A)} + ${ints(B)}) = ${2 * e} · ${ints(2 * c)} = <b>${ints(value)}</b>.`,
      };
    }),

  topic('Factoring an equation',
    // all integer pairs of mn = am + bn
    (d, ctx) => {
      const [a, b] = combo(ctx, [range(2, 9), range(2, 9)]), ab = a * b, t = divisors(ab).length, value = 2 * t;
      return {
        rank: 14,
        text: `How many ordered pairs (m, n) of integers satisfy mn = ${a}m + ${b}n?`,
        answer: choices(d, value, [t, 2 * t - 1, 2 * t + 2, t + 1, 4 * t]),
        check: () => { let k = 0; for (let m = b - ab; m <= b + ab; m++) if (m !== b && ab % (m - b) === 0) { const n = a + ab / (m - b); if (m * n === a * m + b * n) k++; } return k === value ? '' : `brute force found ${k}`; },
        solution: `Move everything to one side and add ${ab}: mn − ${a}m − ${b}n + ${ab} = ${ab}, which factors as (m − ${b})(n − ${a}) = ${ab}. Any divisor of ${ab}, positive or negative, can be m − ${b}, and then n − ${a} is fixed. ${ab} has ${t} positive divisors, so there are 2 · ${t} = <b>${value}</b> pairs.`,
      };
    },
    // 1/m + 1/n = 1/k over the nonzero integers
    (d, ctx) => {
      const [k] = combo(ctx, [range(2, 12)]), K = k * k, t = divisors(K).length, value = 2 * t - 1;
      return {
        rank: 14,
        text: `How many ordered pairs (m, n) of nonzero integers satisfy ${fr(1, 'm')} + ${fr(1, 'n')} = ${fr(1, k)}?`,
        answer: choices(d, value, [t, 2 * t, t - 1, 2 * t + 1, 2 * t - 3]),
        check: () => { let c = 0; for (let m = k - K; m <= k + K; m++) { if (!m || m === k || (m * k) % (m - k)) continue; const n = (m * k) / (m - k); if (n && n * k + m * k === m * n) c++; } return c === value ? '' : `brute force found ${c}`; },
        solution: `Multiply through by ${k}mn: ${k}n + ${k}m = mn, which rearranges to (m − ${k})(n − ${k}) = ${K}. Any of the ${t} positive divisors of ${K}, or its negative, can be m − ${k}: that is ${2 * t} pairs. But m − ${k} = −${k} gives m = 0 (and n = 0), which is not allowed. So there are <b>${value}</b>.`,
      };
    },
    // the same equation over the positive integers: the negative factors can't happen
    (d, ctx) => {
      const [a, b] = combo(ctx, [range(2, 9), range(2, 9)]), ab = a * b, value = divisors(ab).length;
      return {
        rank: 12,
        text: `How many ordered pairs (m, n) of positive integers satisfy mn = ${a}m + ${b}n?`,
        answer: choices(d, value, [2 * value, value - 1, value + 1, 2 * value - 1, value + 2]),
        check: () => { let k = 0; for (let m = 1; m <= b + ab; m++) for (let n = 1; n <= a + ab; n++) if (m * n === a * m + b * n) k++; return k === value ? '' : `brute force found ${k}`; },
        solution: `Rearrange to (m − ${b})(n − ${a}) = ${ab}. If both factors were negative, we would have m − ${b} = −u and n − ${a} = −v with u &lt; ${b} and v &lt; ${a} (m and n are positive), so uv &lt; ${ab}: impossible. So both factors are positive, and each of the ${value} positive divisors of ${ab} gives one pair: <b>${value}</b>.`,
      };
    },
    // the largest m + n: put the factors as far apart as they go
    (d, ctx) => {
      const [k] = combo(ctx, [range(3, 18)]), value = (k + 1) ** 2;
      return {
        rank: 12,
        text: `Positive integers m and n satisfy ${fr(1, 'm')} + ${fr(1, 'n')} = ${fr(1, k)}. What is the largest possible value of m + n?`,
        answer: choices(d, value, [4 * k, k * k + 1, k * k + k, value - 1, k * k + 2 * k]),
        check: () => { let best = 0; for (let m = k + 1; m <= k + k * k; m++) if ((m * k) % (m - k) === 0) best = Math.max(best, m + (m * k) / (m - k)); return best === value ? '' : `search found ${best}`; },
        solution: `Clear the fractions: ${k}n + ${k}m = mn, so (m − ${k})(n − ${k}) = ${k * k}. Both m and n are more than ${k} (1/m and 1/n are each less than 1/${k}), so both factors are positive. m + n = (m − ${k}) + (n − ${k}) + ${2 * k}, and two positive numbers with product ${k * k} have the biggest sum when they are 1 and ${k * k}. So the largest m + n is 1 + ${k * k} + ${2 * k} = <b>${value}</b>.`,
      };
    }),

  topic('Squares from factorials',
    // a product of factorials made into a perfect square
    (d, ctx) => {
      const [n] = combo(ctx, [[8, 10, 12, 18, 20, 22, 24, 26]]), h = n / 2;
      const exps = primesTo(h).map((p) => [p, (p === 2 ? h : 0) + legendre(h, p)]);
      const odd = exps.filter(([, e]) => e % 2).map(([p]) => p), m = product(odd);
      const sqfree = (k) => product(primesTo(k).filter((p) => legendre(k, p) % 2));
      return {
        rank: 15,
        text: `The product 1! · 2! · 3! ⋯ ${n}! is multiplied by a positive integer m, and the result is a perfect square. What is the smallest m that works?`,
        answer: choices(d, m, [sqfree(h), sqfree(n), m % 2 ? 2 * m : m / 2, product(primesTo(h)), m * primesTo(n).find((p) => m % p)], ints),
        check: () => {
          let P = 1n, f = 1n;
          for (let k = 1; k <= n; k++) { f *= BigInt(k); P *= f; }
          let rest = P, mm = 1n;
          for (const p of primesTo(n).map(BigInt)) { let e = 0; while (rest % p === 0n) { rest /= p; e++; } if (e % 2) mm *= p; }
          const r = iroot(mm * P, 2);
          return rest === 1n && mm === BigInt(m) && r * r === mm * P ? '' : `factoring gives m = ${mm}`;
        },
        solution: `Pair each odd factorial with the next one: (2j − 1)! · (2j)! = ((2j − 1)!)<sup>2</sup> · 2j. So 1! · 2! ⋯ ${n}! is a perfect square times 2 · 4 · 6 ⋯ ${n} = ${sup(2, h)} · ${h}! = ${exps.map(([p, e]) => pw(p, e)).join(' · ')}. In a perfect square every prime has an even power, so m must supply one more of each prime whose power here is odd: m = ${odd.length > 1 ? `${odd.join(' · ')} = ` : ''}<b>${ints(m)}</b>.`,
      };
    },
    // one factorial made into a perfect square
    (d, ctx) => {
      const [n] = combo(ctx, [range(6, 22)]), ps = primesTo(n), odd = ps.filter((p) => legendre(n, p) % 2), m = product(odd);
      return {
        rank: 10,
        text: `What is the smallest positive integer m for which m · ${n}! is a perfect square?`,
        answer: choices(d, m, [product(ps), n, m % 2 ? 2 * m : m / 2, product(ps.filter((p) => 2 * p > n)), m * (ps.find((p) => m % p) ?? 1)], ints),
        check: () => { let f = 1n; for (let k = 2; k <= n; k++) f *= BigInt(k); const r = iroot(BigInt(m) * f, 2); const smaller = divisors(m).filter((x) => x < m).some((x) => isSquare(BigInt(x) * f)); return r * r === BigInt(m) * f && !smaller ? '' : 'not the smallest square'; },
        solution: `Find the power of each prime in ${n}! (count the multiples of p, then of p<sup>2</sup>, and so on): ${n}! = ${ps.map((p) => pw(p, legendre(n, p))).join(' · ')}. In a perfect square every power is even, so m supplies one more of each prime with an odd power: m = ${odd.length > 1 ? `${odd.join(' · ')} = ` : ''}<b>${ints(m)}</b>.`,
      };
    },
    // which factorial to take out so the rest is a square
    (d, ctx) => {
      // n/2 even (so 2^(n/2) is a square), and neither n/2 nor n/2 + 1 a square (or (n/2 − 1)! or (n/2 + 1)! would work too)
      const [n] = combo(ctx, [[12, 20, 24, 28, 36, 40, 44]]), h = n / 2, options = [h, h - 1, h + 1, n - 1, n];
      const leaves = (k) => primesTo(n).every((p) => (total(range(1, n).map((j) => legendre(j, p))) - legendre(k, p)) % 2 === 0);
      return {
        rank: 16,
        text: `One factor is removed from the product 1! · 2! · 3! ⋯ ${n}!, and what is left is a perfect square. Which factor was removed?`,
        answer: labelled(opt(h, `${h}!`), options.slice(1).map((k) => opt(k, `${k}!`))),
        check: () => { const works = options.filter(leaves); return works.length === 1 && works[0] === h ? '' : `works: ${works.join(', ')}`; },
        solution: `Pair each odd factorial with the next one: (2j − 1)! · (2j)! = ((2j − 1)!)<sup>2</sup> · 2j. So the whole product is a perfect square times 2 · 4 · 6 ⋯ ${n} = ${sup(2, h)} · ${h}!. Since ${h} is even, ${sup(2, h)} is a perfect square too, so the product is a perfect square times ${h}!, and taking out <b>${h}!</b> leaves a perfect square.`,
      };
    },
    // the power of 2 in a product of factorials
    (d, ctx) => {
      const [n] = combo(ctx, [range(6, 16)]), each = range(1, n).map((j) => legendre(j, 2)), value = total(each);
      return {
        rank: 13,
        text: `What is the largest integer k for which 2<sup>k</sup> divides 1! · 2! · 3! ⋯ ${n}!?`,
        answer: choices(d, value, [legendre(n, 2), total(range(1, n).map((j) => Math.floor(j / 2))), value - 1, value + legendre(n, 2), Math.floor(n / 2)]),
        check: () => { let P = 1n, f = 1n; for (let j = 1; j <= n; j++) { f *= BigInt(j); P *= f; } let k = 0; while (P % 2n === 0n) { P /= 2n; k++; } return k === value ? '' : `the product has 2^${k}`; },
        solution: `Add up the power of 2 in each factorial (in j! it is ⌊j/2⌋ + ⌊j/4⌋ + ⌊j/8⌋ + ⋯): for 1!, 2!, …, ${n}! these are ${each.join(', ')}, and they add up to <b>${value}</b>.`,
      };
    }),

  topic('Divisibility in other bases',
    // a numeral divisible by q in many bases
    (d) => {
      const value = (ds, b) => ((ds[0] * b + ds[1]) * b + ds[2]) * b + ds[3];
      let ds, q, lo, t, good;
      do {
        ds = [d.int(1, 4), d.int(0, 4), d.int(0, 4), d.int(0, 4)]; q = d.pick([6, 8, 9, 10, 12, 14, 15, 18]);
        lo = d.int(Math.max(...ds) + 1, 9); t = d.int(40, 150); good = range(0, q - 1).filter((r) => value(ds, r) % q === 0);
      } while (!good.length || good.length === q || ds.join('') === '2024');
      const hi = lo + q * t - 1, count = good.length * t, D = ds.join('');
      const poly = [[ds[0], 'b<sup>3</sup>'], [ds[1], 'b<sup>2</sup>'], [ds[2], 'b'], [ds[3], '']].filter(([c]) => c).map(([c, x]) => (c === 1 && x ? x : `${c}${x}`)).join(' + ');
      return {
        rank: 18,
        text: `For how many integers b with ${lo} ≤ b ≤ ${ints(hi)} is the base-b numeral ${D}<sub>b</sub> divisible by ${q}? (Here ${q} is an ordinary base-ten number.)`,
        answer: choices(d, count, [good.length * (t + 1), good.length * (t - 1), (good.length + 1) * t, t, count + 1], ints),
        check: () => { const k = range(lo, hi).filter((b) => value(ds, b) % q === 0).length; return k === count ? '' : `brute force found ${k}`; },
        solution: `In base b, ${D}<sub>b</sub> = ${poly}. Whether that is a multiple of ${q} depends only on the remainder of b when divided by ${q}, and trying all ${q} remainders, it works exactly for remainder${good.length > 1 ? 's' : ''} ${good.join(', ')}. The ${ints(hi - lo + 1)} bases from ${lo} to ${ints(hi)} run through the ${q} remainders exactly ${t} times, so the count is ${good.length} · ${t} = <b>${ints(count)}</b>.`,
      };
    },
    // find the base from a multiplication
    (d) => {
      let b, X, Y, Z, xv, yv, zv, zd, x1, x0, y1, y0;
      for (;;) {
        b = d.int(5, 12); x1 = d.int(1, Math.min(4, b - 1)); x0 = d.int(0, Math.min(9, b - 1)); y1 = d.int(1, Math.min(4, b - 1)); y0 = d.int(0, Math.min(9, b - 1));
        xv = x1 * b + x0; yv = y1 * b + y0; zv = xv * yv;
        if (zv >= b ** 3) continue;
        zd = [Math.floor(zv / (b * b)), Math.floor(zv / b) % b, zv % b];
        if (zd.some((v) => v > 9)) continue;
        X = `${x1}${x0}`; Y = `${y1}${y0}`; Z = zd.join('');
        const hi = Math.max(x1, x0, y1, y0, ...zd);
        if (b - 2 > hi && range(hi + 1, 40).filter((j) => inBase(X, j) * inBase(Y, j) === inBase(Z, j)).length === 1) break;
      }
      return {
        rank: 12,
        text: `In which base b is it true that ${X}<sub>b</sub> × ${Y}<sub>b</sub> = ${Z}<sub>b</sub>?`,
        answer: choices(d, b, [b - 2, b - 1, b + 1, b + 2, b + 3]),
        check: () => { const works = range(Math.max(...(X + Y + Z).split('').map(Number)) + 1, 40).filter((j) => inBase(X, j) * inBase(Y, j) === inBase(Z, j)); return works.length === 1 && works[0] === b ? '' : `works in ${works.join(', ')}`; },
        solution: `In base b, ${X}<sub>b</sub> = ${poly([x1, x0])}, ${Y}<sub>b</sub> = ${poly([y1, y0])} and ${Z}<sub>b</sub> = ${poly(zd)}. Try the choices: with b = ${b}, ${xv} × ${yv} = ${zv}, and ${zd[0]} · ${b * b} + ${zd[1]} · ${b} + ${zd[2]} = ${zv} as well, while none of the other bases works. So b = <b>${b}</b>.`,
      };
    },
    // numerals that are squares in every base
    (d, ctx) => {
      const [[pat, low, poly, root], N] = combo(ctx, [[['121', 3, 'b<sup>2</sup> + 2b + 1', 'b + 1'], ['12321', 4, 'b<sup>4</sup> + 2b<sup>3</sup> + 3b<sup>2</sup> + 2b + 1', 'b<sup>2</sup> + b + 1'], ['144', 5, 'b<sup>2</sup> + 4b + 4', 'b + 2']], [20, 30, 40, 50, 60, 75, 100]]);
      const value = N - low + 1;
      return {
        rank: 9,
        text: `For how many integers b with 2 ≤ b ≤ ${N} is ${pat}<sub>b</sub> a perfect square? (A base-b numeral can only use digits less than b.)`,
        answer: choices(d, value, [N - 1, N, value - 1, Math.floor(Math.sqrt(N)), value + 1]),
        check: () => { const k = range(2, N).filter((b) => Math.max(...pat.split('').map(Number)) < b && isSquare(inBase(pat, b))).length; return k === value ? '' : `brute force found ${k}`; },
        solution: `${pat}<sub>b</sub> = ${poly} = (${root})<sup>2</sup>, a perfect square in every base where it is a numeral at all. Its largest digit is ${low - 1}, so b can be ${low}, ${low + 1}, …, ${N}: <b>${value}</b> bases.`,
      };
    },
    // dividing by b − 1 leaves what the digit sum leaves
    (d, ctx) => {
      const [b] = combo(ctx, [range(7, 16)]), top = Math.min(9, b - 1), len = d.int(4, 5);
      const digits = [d.int(1, top), ...range(2, len).map(() => d.int(0, top))], X = digits.join(''), s = total(digits), value = s % (b - 1);
      return {
        rank: 10,
        text: `What is the remainder when the base-${b} number ${X}<sub>${b}</sub> is divided by ${b - 1}?`,
        answer: choices(d, value, [s % b, digits.at(-1) % (b - 1), (value + 1) % (b - 1), s % 9, ...d.shuffle(range(0, b - 2))]),
        check: () => (inBase(X, b) % (b - 1) === value ? '' : `it leaves ${inBase(X, b) % (b - 1)}`),
        solution: `${b} leaves remainder 1 when divided by ${b - 1}, so every power of ${b} does too. So ${X}<sub>${b}</sub> = ${digits.map((c, i) => `${c} · ${pw(b, len - 1 - i)}`).join(' + ').replace(/ · [0-9]+<sup>0<\/sup>/, '')} leaves the same remainder as the sum of its digits, ${digits.join(' + ')} = ${s}. ${s < b - 1 ? `That is already less than ${b - 1}, so the remainder is <b>${value}</b>.` : `And ${s} leaves remainder <b>${value}</b> when divided by ${b - 1}.`}`,
      };
    }),

  topic('Powers of a fraction',
    // how many powers keep a number whole
    (d) => {
      let p, q, x, y, r, A;
      do {
        [p, q] = d.pick([[2, 3], [3, 2], [3, 5], [5, 3], [2, 7], [7, 2], [5, 7], [7, 5], [3, 7]]);
        x = d.int(1, 6); y = d.int(1, 6); r = d.pick([1, 1, 11, 13]); A = p ** x * q ** y * r;
      } while (A > 2e6 || x === y || x + y + 1 === 9);
      const value = x + y + 1, An = ints(A);
      return {
        rank: 7,
        text: `For how many integers n, positive, negative or zero, is ${An} · (${frac(p, q)})<sup>n</sup> an integer?`,
        answer: choices(d, value, [y + 1, x + y, x + y + 2, x + 1, (x + 1) * (y + 1)]),
        check: () => {
          let k = 0;
          for (let n = -40; n <= 40; n++) { const P = BigInt(p) ** BigInt(Math.abs(n)), Q = BigInt(q) ** BigInt(Math.abs(n)); if (n >= 0 ? (BigInt(A) * P) % Q === 0n : (BigInt(A) * Q) % P === 0n) k++; }
          return k === value ? '' : `brute force found ${k}`;
        },
        solution: `${An} = ${pw(p, x)} · ${pw(q, y)}${r > 1 ? ` · ${r}` : ''}. For n ≥ 0 the expression is ${An} · ${p}<sup>n</sup> / ${q}<sup>n</sup>, a whole number exactly when ${q}<sup>n</sup> divides ${An}, that is n ≤ ${y}. For n &lt; 0 it is ${An} · ${q}<sup>|n|</sup> / ${p}<sup>|n|</sup>, whole exactly when |n| ≤ ${x}. So n runs from −${x} to ${y}: <b>${value}</b> integers.`,
      };
    },
    // the smallest number that survives a whole range of powers
    (d, ctx) => {
      const [[p, q], x, y] = combo(ctx, [[[2, 3], [3, 2], [2, 5], [5, 2], [3, 5], [5, 3], [2, 7]], range(1, 5), range(1, 5)], ([p, q], x, y) => x !== y && p ** x * q ** y <= 20000);
      const value = p ** x * q ** y;
      const works = (A) => range(-x, y).every((n) => (n >= 0 ? (BigInt(A) * BigInt(p) ** BigInt(n)) % BigInt(q) ** BigInt(n) === 0n : (BigInt(A) * BigInt(q) ** BigInt(-n)) % BigInt(p) ** BigInt(-n) === 0n));
      return {
        rank: 9,
        text: `What is the smallest positive integer A for which A · (${frac(p, q)})<sup>n</sup> is an integer for every integer n from −${x} to ${y}?`,
        answer: choices(d, value, [p ** y * q ** x, (p * q) ** Math.max(x, y), p ** x, q ** y, value * p], ints),
        check: () => (works(value) && divisors(value).filter((v) => v < value).every((v) => !works(v)) ? '' : 'not the smallest'),
        solution: `At n = ${y} the expression is A · ${pw(p, y)} / ${pw(q, y)}, so ${pw(q, y)} must divide A. At n = −${x} it is A · ${pw(q, x)} / ${pw(p, x)}, so ${pw(p, x)} must divide A. The n in between need less than that. So the smallest A is ${pw(p, x)} · ${pw(q, y)} = <b>${ints(value)}</b>.`,
      };
    },
    // the largest whole value it reaches
    (d, ctx) => {
      const [[p, q], x, y] = combo(ctx, [[[2, 3], [3, 2], [2, 5], [5, 2], [3, 5], [5, 3]], range(1, 5), range(1, 5)], ([p, q], x, y) => x !== y && p ** x * q ** y <= 20000);
      const A = p ** x * q ** y, big = Math.max(p, q), small = Math.min(p, q), value = big ** (x + y), at = p > q ? y : -x;
      return {
        rank: 10,
        text: `For some integers n, the number ${ints(A)} · (${frac(p, q)})<sup>n</sup> is an integer. What is the largest integer value it can take?`,
        answer: choices(d, value, [A, small ** (x + y), A * big, big ** (x + y - 1), p ** y * q ** x], ints),
        check: () => {
          let best = 0n;
          for (let n = -30; n <= 30; n++) { const top = BigInt(A) * BigInt(n >= 0 ? p : q) ** BigInt(Math.abs(n)), bottom = BigInt(n >= 0 ? q : p) ** BigInt(Math.abs(n)); if (top % bottom === 0n && top / bottom > best) best = top / bottom; }
          return best === BigInt(value) ? '' : `search found ${best}`;
        },
        solution: `${ints(A)} = ${pw(p, x)} · ${pw(q, y)}, so the expression is an integer for n from −${x} to ${y}. Each step up in n multiplies it by ${frac(p, q)}, which is ${p > q ? 'more' : 'less'} than 1, so the largest value comes at n = ${num(at, 0)}: ${p > q ? `${pw(p, x)} · ${pw(q, y)} · ${pw(p, y)} / ${pw(q, y)}` : `${pw(p, x)} · ${pw(q, y)} · ${pw(q, x)} / ${pw(p, x)}`} = ${pw(big, x + y)} = <b>${ints(value)}</b>.`,
      };
    }),

  topic('Sums dividing factorials',
    // the greatest n in a range
    (d, ctx) => {
      const [[U, words]] = combo(ctx, [[[99, 'two-digit positive integer n'], [299, 'positive integer n less than 300'], [500, 'positive integer n with n ≤ 500'], [750, 'positive integer n with n ≤ 750'], [1200, 'positive integer n with n ≤ 1,200'], [9999, 'four-digit positive integer n']]]);
      let p = U + 1;
      while (!isPrime(p)) p--;
      const n = p - 1;
      let below = U; while (!isPrime(below)) below--;
      return {
        rank: 9,
        text: `Let T = 1 + 2 + ⋯ + n and P = 1 · 2 ⋯ n = n!. What is the greatest ${words} for which P is not a multiple of T?`,
        answer: choices(d, n, [below, U, U - 1, p, n - 2, n - 4], ints),
        check: () => { for (let k = U; k >= 1; k--) if (!sumDivides(k)) return k === n ? '' : `first failure at ${k}`; return 'never fails'; },
        solution: `T = n(n + 1)/2, so P/T = 2 · (n − 1)!/(n + 1). If n + 1 is composite (and n ≥ 3), it splits into factors that all show up in 2 · (n − 1)!, so P/T is a whole number. If n + 1 is an odd prime, it divides neither 2 nor any of 1, 2, …, n − 1, so T does not divide P. So we need the greatest n in range for which n + 1 is prime. ${ints(p)} is the largest prime up to ${ints(U + 1)}, so n = <b>${ints(n)}</b>.`,
      };
    },
    // how many n fail: one for each odd prime
    (d, ctx) => {
      const [N] = combo(ctx, [[20, 25, 30, 36, 40, 50, 60, 72, 80, 100]]), odd = primesTo(N + 1).filter((p) => p > 2), value = odd.length;
      return {
        rank: 12,
        text: `For how many positive integers n ≤ ${N} is n! not a multiple of 1 + 2 + ⋯ + n?`,
        answer: choices(d, value, [primesTo(N).length === value ? value + 2 : primesTo(N).length, value + 1, value - 1, Math.floor(N / 2), Math.floor(N / 3)]),
        check: () => { const k = range(1, N).filter((n) => !sumDivides(n)).length; return k === value ? '' : `brute force found ${k}`; },
        solution: `1 + 2 + ⋯ + n = n(n + 1)/2, and n! divided by it is 2 · (n − 1)!/(n + 1). That is a whole number unless n + 1 is an odd prime. So count the odd primes from 3 to ${N + 1}: ${odd.join(', ')}. That is <b>${value}</b>.`,
      };
    },
    // spot the one that fails
    (d, ctx) => {
      const [p] = combo(ctx, [primesTo(200).filter((v) => v > 30)]), n = p - 1;
      const wrongs = d.shuffle(range(n - 8, n + 8).filter((k) => k !== n && !isPrime(k + 1))).slice(0, 4);
      return {
        rank: 9,
        text: `Each choice below is a value of n between ${Math.min(n, ...wrongs)} and ${Math.max(n, ...wrongs)}. For which of them is n! <i>not</i> a multiple of 1 + 2 + ⋯ + n?`,
        answer: choices(d, n, wrongs),
        check: () => { const fails = [n, ...wrongs].filter((k) => !sumDivides(k)); return fails.length === 1 && fails[0] === n ? '' : `fails for ${fails.join(', ')}`; },
        solution: `n! ÷ (1 + 2 + ⋯ + n) = 2 · (n − 1)!/(n + 1), which fails to be whole only when n + 1 is an odd prime. Of the choices, only ${n} + 1 = ${p} is prime, so the answer is <b>${n}</b>.`,
      };
    }),

  topic('Changing a digit',
    // a copied list with one digit changed
    (d, ctx) => {
      const [N, [x, y]] = combo(ctx, [[40, 45, 55, 64, 75, 88, 99, 120, 150], [[3, 1], [4, 1], [5, 2], [6, 3], [7, 2], [3, 0], [9, 5], [4, 2], [8, 3]]]);
      const cnt = [0, 0, 0];
      for (let k = 1; k <= N; k++) String(k).split('').reverse().forEach((c, i) => { if (+c === x) cnt[i]++; });
      const D = (x - y) * (cnt[0] + 10 * cnt[1] + 100 * cnt[2]);
      const places = [[cnt[0], 'units', 1], [cnt[1], 'tens', 10], [cnt[2], 'hundreds', 100]].filter(([c]) => c);
      return {
        rank: 6,
        text: `Rosa writes the whole numbers from 1 to ${N}. Theo copies her list, but wherever the digit ${x} appears he writes ${y} instead. Each of them adds up the numbers on their own list. How much greater is Rosa's total than Theo's?`,
        answer: choices(d, D, [(x - y) * (cnt[0] + cnt[1] + cnt[2]), (x - y) * cnt[0], (x - y) * 10 * cnt[1], D + 10 * (x - y), D - (x - y)].filter((v) => v > 0), ints),
        check: () => { let s = 0; for (let k = 1; k <= N; k++) s += k - Number(String(k).replaceAll(String(x), String(y))); return s === D ? '' : `brute force says ${s}`; },
        solution: `Each ${x} written as a ${y} makes its number smaller by ${x - y} times the digit's place value. From 1 to ${N}, the digit ${x} appears ${places.map(([c, w]) => `${c} time${c > 1 ? 's' : ''} in the ${w} place`).join(' and ')}. So the difference is ${x - y} · (${places.map(([c, , v]) => `${c} · ${v}`).join(' + ')}) = <b>${ints(D)}</b>.`,
      };
    },
    // how often one digit gets written
    (d, ctx) => {
      const [N, x] = combo(ctx, [[50, 64, 75, 88, 99, 100, 120, 150, 199, 250], range(1, 9)]);
      const u = placeCount(N, x, 1), t = placeCount(N, x, 10), h = placeCount(N, x, 100), value = u + t + h;
      const containing = range(1, N).filter((k) => String(k).includes(String(x))).length;
      return {
        rank: 5,
        text: `How many times is the digit ${x} written when the whole numbers from 1 to ${N} are written out?`,
        answer: choices(d, value, [containing === value ? value + 1 : containing, value - 1, u, t, value + 10]),
        check: () => { const k = range(1, N).map(String).join('').split('').filter((c) => c === String(x)).length; return k === value ? '' : `counting gives ${k}`; },
        solution: `Count place by place. In the units place ${x} comes once in every 10 numbers: ${u} time${u === 1 ? '' : 's'}. In the tens place it is the ${x}0s (${x}0 to ${x}9) in each hundred: ${t} time${t === 1 ? '' : 's'}.${h ? ` In the hundreds place: ${h} time${h === 1 ? '' : 's'}.` : ''} Total: <b>${value}</b>.`,
      };
    },
    // the sum of every digit written
    (d, ctx) => {
      const [N] = combo(ctx, [range(20, 99)], (N) => N % 10 !== 0 || N % 20 === 0);
      const f = Math.floor(N / 10), r = N % 10, U = 45 * f + (r * (r + 1)) / 2, T = (10 * (f - 1) * f) / 2 + f * (r + 1), value = U + T;
      return {
        rank: 8,
        text: `Ana writes out the whole numbers from 1 to ${N}. What is the sum of all the digits she writes?`,
        answer: choices(d, value, [(N * (N + 1)) / 2, U, T, value + 10, value - 9], ints),
        check: () => { const s = total(range(1, N).map(digitSum)); return s === value ? '' : `adding up gives ${s}`; },
        solution: `Add the units digits and the tens digits separately. Units: each full run 0, 1, …, 9 adds 45, and there are ${f} of them${r ? `, plus ${upTo(r)} at the end` : ''}: ${U}. Tens: the digit t is written 10 times for each t from 1 to ${f - 1} (10 · ${f - 1 > 1 ? `(${upTo(f - 1)})` : '1'} = ${(10 * (f - 1) * f) / 2}), and ${f} is written ${r + 1} time${r ? 's' : ''} at the end (${f * (r + 1)}): ${T}. Altogether ${U} + ${T} = <b>${ints(value)}</b>.`,
      };
    },
    // working back from how many digits a book's page numbers take
    (d, ctx) => {
      const [P] = combo(ctx, [range(105, 600)]), D = 189 + 3 * (P - 99);
      const digitsUpTo = (n) => range(1, n).reduce((s, k) => s + String(k).length, 0);
      return {
        rank: 7,
        text: `The pages of a book are numbered 1, 2, 3, and so on. Printing all the page numbers takes ${ints(D)} digits. How many pages does the book have?`,
        answer: choices(d, P, [Math.floor(D / 3), D - 189, P - 9, Math.round((D - 9) / 2), P + 33], ints),
        check: () => (digitsUpTo(P) === D ? '' : `${P} pages take ${digitsUpTo(P)} digits`),
        solution: `Pages 1 to 9 take 9 digits and pages 10 to 99 take 90 · 2 = 180, so 189 in all. The other ${ints(D)} − 189 = ${ints(D - 189)} digits are for three-digit pages: ${ints(D - 189)} / 3 = ${P - 99} pages after page 99. So the book has 99 + ${P - 99} = <b>${P}</b> pages.`,
      };
    }),

  topic('Bases without letters',
    // the numbers up to N whose base-B form uses no letters
    (d) => {
      const B = d.pick([11, 12, 13, 14, 16]), c = d.int(1, 9), e = d.int(0, B - 1), f = d.int(0, B - 1), N = c * B * B + e * B + f;
      const part1 = c * 100, part2 = Math.min(e, 10) * 10, part3 = e <= 9 ? Math.min(f, 9) + 1 : 0, all = part1 + part2 + part3, value = all - 1;
      const steps = [`First digit 0 to ${c - 1}: ${c} · 10 · 10 = ${part1}.`];
      if (e > 0) steps.push(`First digit ${c}, second digit 0 to ${Math.min(e - 1, 9)}: ${Math.min(e, 10)} · 10 = ${part2}.`);
      steps.push(e <= 9 ? `First two digits ${c}${e}, last digit 0 to ${Math.min(f, 9)}: ${part3}.` : `The second base-${B} digit of ${ints(N)} is a letter, so no number starting ${c}${digitOf(e)} counts.`);
      return {
        rank: 18,
        text: `In base ${B}, numbers are written with the digits 0 through 9 and ${letters(B)}. How many of the integers 1, 2, 3, …, ${ints(N)} have a base-${B} form that uses no letters?`,
        answer: choices(d, value, [all, part1 - 1, value + 10, value - 10, part1 + 99], ints),
        check: () => { const k = range(1, N).filter((x) => /^[0-9]+$/.test(x.toString(B))).length; return k === value ? '' : `brute force found ${k}`; },
        solution: `${ints(N)} = ${c} · ${B}<sup>2</sup> + ${e} · ${B} + ${f}, which is ${digitOf(c)}${digitOf(e)}${digitOf(f)} in base ${B}. Count the numbers from 0 to ${ints(N)} whose three base-${B} digits (with leading zeros) are all 0–9. ${steps.join(' ')} That makes ${ints(all)} numbers counting 0, so the answer is <b>${ints(value)}</b>.`,
      };
    },
    // three-digit numerals with at least one letter: all of them minus the all-digit ones
    (d, ctx) => {
      const [B] = combo(ctx, [[11, 12, 13, 14, 15, 16]]), all = (B - 1) * B * B, value = all - 900;
      return {
        rank: 10,
        text: `In base ${B}, numbers are written with the digits 0 through 9 and ${letters(B)}. How many three-digit base-${B} numbers (with no leading zero) contain at least one letter?`,
        answer: choices(d, value, [all, 900, (B - 10) ** 3, (B - 10) * B * B, all - 1000], ints),
        check: () => { const k = range(B * B, B ** 3 - 1).filter((x) => /[a-f]/.test(x.toString(B))).length; return k === value ? '' : `brute force found ${k}`; },
        solution: `A three-digit base-${B} number has ${B - 1} choices for its first digit (anything but 0) and ${B} for each of the other two: ${B - 1} · ${B} · ${B} = ${ints(all)} in all. The ones with no letters use only 0–9: 9 · 10 · 10 = 900. So ${ints(all)} − 900 = <b>${ints(value)}</b> contain a letter.`,
      };
    },
    // a numeral with letters, read in base ten
    (d, ctx) => {
      const [B] = combo(ctx, [[11, 12, 13, 14, 15, 16]]);
      let c, e, f;
      do { c = d.int(1, B - 1); e = d.int(0, B - 1); f = d.int(0, B - 1); } while (Math.max(c, e, f) < 10);
      const X = digitOf(c) + digitOf(e) + digitOf(f), value = c * B * B + e * B + f;
      return {
        rank: 6,
        text: `In base ${B}, numbers are written with the digits 0 through 9 and ${letters(B)}. What number, in base ten, is ${X}<sub>${B}</sub>?`,
        answer: choices(d, value, [c * 100 + e * 10 + f, c * B * B + f * B + e, value + B, value - B, c * B + e * B + f], ints),
        check: () => (parseInt(X, B) === value ? '' : `it is ${parseInt(X, B)}`),
        solution: `${X}<sub>${B}</sub> = ${c} · ${B}<sup>2</sup> + ${e} · ${B} + ${f} = ${ints(c * B * B)} + ${e * B} + ${f} = <b>${ints(value)}</b>.`,
      };
    },
    // the last digit is the remainder, and it's a letter for remainders 10 and up
    (d, ctx) => {
      const [B, N] = combo(ctx, [[11, 12, 13, 14, 15, 16], [100, 150, 200, 250, 300, 400, 500]]);
      const q = Math.floor(N / B), r = N % B, extra = Math.max(0, r - 9), value = q * (B - 10) + extra;
      return {
        rank: 9,
        text: `In base ${B}, numbers are written with the digits 0 through 9 and ${letters(B)}. How many of the integers 1, 2, 3, …, ${N} end in a letter when written in base ${B}?`,
        answer: choices(d, value, [q, value + (B - 10), Math.round((N * (B - 10)) / 10), N - value, value - 1], ints),
        check: () => { const k = range(1, N).filter((x) => /[a-f]$/.test(x.toString(B))).length; return k === value ? '' : `brute force found ${k}`; },
        solution: `The last base-${B} digit of a number is its remainder when divided by ${B}, and that digit is a letter when the remainder is 10 or more: ${B - 10} of every ${B} numbers in a row. ${N} = ${B} · ${q} + ${r}, so the ${q} full runs of ${B} give ${q} · ${B - 10} = ${q * (B - 10)}, and the last ${r} numbers give ${extra} more. That is <b>${value}</b>.`,
      };
    }),

  topic('Repeating digits in base k',
    // the base, from a fraction and its repeating digits
    (d) => {
      let k, a, b, p, q;
      for (;;) {
        k = d.int(5, 20); a = d.int(1, Math.min(9, k - 1)); b = d.int(0, Math.min(9, k - 1));
        if (a === b || (k === 16 && a === 2 && b === 3)) continue;
        const g = gcd(a * k + b, k * k - 1);
        if (g === 1) continue;
        p = (a * k + b) / g; q = (k * k - 1) / g;
        if (!range(Math.max(a, b) + 1, 80).some((j) => j !== k && (a * j + b) * q === p * (j * j - 1))) break;
      }
      return {
        rank: 18,
        text: `For some integer k, the base-k expansion of the fraction ${frac(p, q)} is 0.${a}${b}${a}${b}${a}${b}…<sub>k</sub>, with the two digits ${a}${b} repeating forever. What is k?`,
        answer: choices(d, k, [k - 2, k - 1, k + 1, k + 2, k + 3, k + 4].filter((j) => j > Math.max(a, b))),
        check: () => { const want = [a, b, a, b, a, b].join(','), hits = range(Math.max(a, b) + 1, k + 4).filter((j) => expand(p, q, j, 6).join(',') === want); return hits.length === 1 && hits[0] === k ? '' : `long division matches ${hits.join(', ')}`; },
        solution: `Call the number x. Multiplying by k<sup>2</sup> shifts it two places: k<sup>2</sup>x = ${a}${b}<sub>k</sub> + x = ${poly([a, b]).replace(/b/g, 'k')} + x. So x = (${poly([a, b]).replace(/b/g, 'k')})/(k<sup>2</sup> − 1). With k = ${k} this is ${a * k + b}/${k * k - 1} = ${frac(p, q)}, and none of the other choices works. So k = <b>${k}</b>.`,
      };
    },
    // two repeating digits in base k as a fraction
    (d, ctx) => {
      const [k, a, b] = combo(ctx, [range(5, 16), range(1, 9), range(0, 9)], (k, a, b) => k !== 10 && a < k && b < k && a !== b);
      const top = a * k + b, bottom = k * k - 1, g = gcd(top, bottom), p = top / g, q = bottom / g, value = p + q;
      return {
        rank: 14,
        text: `In base ${k}, the repeating expansion 0.${a}${b}${a}${b}${a}${b}…<sub>${k}</sub> equals a fraction p/q in lowest terms. What is p + q?`,
        answer: choices(d, value, [top + bottom, 10 * a + b + 99, value + 1, q, a + b + k]),
        check: () => (expand(p, q, k, 8).join(',') === [a, b, a, b, a, b, a, b].join(',') ? '' : 'long division disagrees'),
        solution: `Call the number x. Multiplying by ${k}<sup>2</sup> shifts it two places: ${k * k}x = ${a}${b}<sub>${k}</sub> + x, so ${bottom}x = ${a} · ${k} + ${b} = ${top} and x = ${fr(top, bottom)}${g > 1 ? ` = ${fr(p, q)}` : ''}. So p + q = <b>${value}</b>.`,
      };
    },
    // one repeating digit in base k
    (d, ctx) => {
      const [k, a] = combo(ctx, [range(5, 16), range(1, 9)], (k, a) => k !== 10 && a < k - 1);   // (all k − 1s would be 1)
      return {
        rank: 10,
        text: `In base ${k}, what fraction is 0.${a}${a}${a}${a}…<sub>${k}</sub>, with the digit ${a} repeating forever?`,
        answer: choices(d, [a, k - 1], [[a, k], [a, 9], [a, k + 1], [1, k - 1], [a + 1, k - 1]], showFrac),
        check: () => (expand(a, k - 1, k, 6).every((v) => v === a) ? '' : 'long division disagrees'),
        solution: `Call the number x. Multiplying by ${k} shifts it one place: ${k}x = ${a}.${a}${a}${a}…<sub>${k}</sub> = ${a} + x. So ${k - 1}x = ${a}, and x = <b>${frac(a, k - 1)}</b>.`,
      };
    },
    // when a fraction ends instead of repeating
    (d, ctx) => {
      const [q, N] = combo(ctx, [[6, 10, 12, 14, 15, 18, 20, 21, 30, 35], [40, 50, 60, 75, 80, 100, 120]]);
      const primes = factor(q).map(([p]) => p), rad = product(primes), value = Math.floor(N / rad);
      return {
        rank: 15,
        text: `For how many integers b with 2 ≤ b ≤ ${N} does the fraction ${frac(1, q)} have an expansion in base b that ends, rather than repeating forever?`,
        answer: choices(d, value, [Math.floor(N / q) === value ? value + 1 : Math.floor(N / q), Math.floor(N / primes[0]), Math.floor(N / primes.at(-1)), N - value, value - 1]),
        check: () => { const k = range(2, N).filter((b) => { let r = 1; for (let i = 0; i < 40 && r; i++) r = (r * b) % q; return r === 0; }).length; return k === value ? '' : `long division ends in ${k} bases`; },
        solution: `${frac(1, q)} ends in base b exactly when some power of b is a multiple of ${q}, that is, when every prime factor of ${q} (${primes.join(' and ')}) divides b. So b must be a multiple of ${rad}, and from 2 to ${N} there are ⌊${N}/${rad}⌋ = <b>${value}</b> of them.`,
      };
    }),

  topic('Diagonal through tiles',
    // a diagonal across a tiled floor
    (d, ctx) => {
      const [g, [u, v]] = combo(ctx, [[2, 3, 4, 5, 6], [[2, 3], [2, 5], [3, 4], [3, 5], [3, 7], [4, 5], [4, 7], [5, 6], [5, 7], [2, 7]]], (g, uv) => g * uv[1] <= 42);
      const m = g * u, n = g * v, count = m + n - g;
      return {
        rank: 10,
        text: `A rectangular hall ${m} meters wide and ${n} meters long is covered with ${ints(m * n)} square tiles, each 1 meter on a side. A robot rolls in a straight line from one corner of the hall to the opposite corner. How many tiles does it roll across, counting the first and the last? (Just touching the corner of a tile doesn't count.)`,
        answer: choices(d, count, [m + n, m + n - 1, m + n - 2 * g, count - 1, u + v - 1]),
        check: () => { let k = 0; for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (Math.max(j * m, n * i) < Math.min((j + 1) * m, n * (i + 1))) k++; return k === count ? '' : `tile by tile: ${k}`; },
        solution: `The robot starts in one tile and enters a new one each time it crosses a grid line: ${m - 1} lines one way and ${n - 1} the other. But where it crosses two lines at once, at a grid point, it enters only one new tile. The diagonal passes through gcd(${m}, ${n}) − 1 = ${g - 1} grid point${g - 1 > 1 ? 's' : ''} inside the hall. So it crosses 1 + ${m - 1} + ${n - 1} − ${g - 1} = <b>${count}</b> tiles.`,
      };
    },
    // lattice points on a segment
    (d, ctx) => {
      const [g, [u, v], sx, sy] = combo(ctx, [[2, 3, 4, 5, 6, 8, 12], [[1, 2], [2, 3], [3, 4], [1, 3], [3, 5], [2, 5], [4, 5], [1, 4]], [-1, 1], [-1, 1]]);
      const x1 = d.int(-6, 6), y1 = d.int(-6, 6), dx = g * u * sx, dy = g * v * sy, x2 = x1 + dx, y2 = y1 + dy, value = g + 1;
      return {
        rank: 8,
        text: `How many points with integer coordinates lie on the line segment from (${num(x1, 0)}, ${num(y1, 0)}) to (${num(x2, 0)}, ${num(y2, 0)}), counting both ends?`,
        answer: choices(d, value, [g, g - 1, g + 2, u + v, Math.abs(dx) + 1]),
        check: () => { let k = 0; for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) if (((x - x1) * dy) % dx === 0) k++; return k === value ? '' : `counting gives ${k}`; },
        solution: `The segment goes ${Math.abs(dx)} across and ${Math.abs(dy)} ${dy > 0 ? 'up' : 'down'}, and gcd(${Math.abs(dx)}, ${Math.abs(dy)}) = ${g}. So it splits into ${g} equal steps of ${u} across and ${v} ${dy > 0 ? 'up' : 'down'}, each ending at a point with integer coordinates, and there are none in between. Counting the starting point too, that is ${g} + 1 = <b>${value}</b> points.`,
      };
    },
    // the same idea in three dimensions
    (d, ctx) => {
      const [a, b, c] = combo(ctx, [[2, 3, 4, 6], [3, 4, 5, 6, 8, 9, 10], [4, 5, 6, 8, 9, 10, 12, 15]], (a, b, c) => a < b && b < c);
      const g3 = gcd(gcd(a, b), c), value = a + b + c - gcd(a, b) - gcd(b, c) - gcd(a, c) + g3;
      return {
        rank: 18,
        text: `A ${a} × ${b} × ${c} box is built from unit cubes. A straight line runs from one corner of the box to the opposite corner. How many of the unit cubes does it pass through the inside of?`,
        answer: choices(d, value, [a + b + c, a + b + c - 2, a + b + c - gcd(a, b) - gcd(b, c) - gcd(a, c), value + 1, a * b * c > 200 ? value + g3 + 2 : a * b * c]),
        check: () => { const seen = new Set(); for (const s of [a, b, c]) for (let i = 1; i < s; i++) { const g = gcd(i, s); seen.add(`${i / g}/${s / g}`); } return seen.size + 1 === value ? '' : `crossings give ${seen.size + 1}`; },
        solution: `The line enters a new cube each time it crosses one of the ${a - 1} + ${b - 1} + ${c - 1} inner planes, except that where it crosses two or three planes at once it enters only one new cube. Counting with inclusion and exclusion: ${a} + ${b} + ${c} − gcd(${a}, ${b}) − gcd(${b}, ${c}) − gcd(${a}, ${c}) + gcd(${a}, ${b}, ${c}) = ${a + b + c} − ${gcd(a, b)} − ${gcd(b, c)} − ${gcd(a, c)} + ${g3} = <b>${value}</b>.`,
      };
    }),

  topic('Square and cube divisors',
    // divisors that are squares or cubes
    (d, ctx) => {
      const [[p, q], e] = combo(ctx, [[[5, 17], [7, 13], [11, 13], [13, 17], [3, 37], [7, 11], [3, 41], [5, 23]], [6, 7, 8, 10, 11, 12]]), base = p * q;
      const f = (k) => Math.floor(e / k) + 1, sq = f(2) ** 2, cu = f(3) ** 2, six = f(6) ** 2, value = sq + cu - six;
      return {
        rank: 11,
        text: `How many positive divisors of ${sup(base, e)} are perfect squares, perfect cubes, or both?`,
        answer: choices(d, value, [sq + cu, sq, sq + cu - 2 * six, value + f(2), cu + six]),
        check: () => {
          let k = 0;
          for (let i = 0; i <= e; i++) for (let j = 0; j <= e; j++) { const N = BigInt(p) ** BigInt(i) * BigInt(q) ** BigInt(j); if (iroot(N, 2) ** 2n === N || iroot(N, 3) ** 3n === N) k++; }
          return k === value ? '' : `brute force found ${k}`;
        },
        solution: `${base} = ${p} · ${q}, so each divisor is ${p}<sup>i</sup> · ${q}<sup>j</sup> with 0 ≤ i, j ≤ ${e}. It is a square when i and j are both even: ${f(2)} choices each, so ${sq} squares. It is a cube when both are multiples of 3: ${f(3)} choices each, so ${cu} cubes. It is both when both are multiples of 6: ${six}. So the count is ${sq} + ${cu} − ${six} = <b>${value}</b>.`,
      };
    },
    // square divisors of a product of three prime powers
    (d, ctx) => {
      const [[p, q, r], a, b, c] = combo(ctx, [[[2, 3, 5], [2, 3, 7], [2, 5, 7], [3, 5, 7]], range(2, 9), range(1, 7), range(1, 5)]);
      const h = (e) => Math.floor(e / 2) + 1, value = h(a) * h(b) * h(c), N = `${pw(p, a)} · ${pw(q, b)} · ${pw(r, c)}`;
      return {
        rank: 9,
        text: `How many positive divisors of ${N} are perfect squares?`,
        answer: choices(d, value, [(a + 1) * (b + 1) * (c + 1), Math.ceil(a / 2) * Math.ceil(b / 2) * Math.ceil(c / 2), value + 1, Math.floor(a / 2) * Math.floor(b / 2) * Math.floor(c / 2), h(a) + h(b) + h(c)]),
        check: () => { let k = 0; for (let i = 0; i <= a; i++) for (let j = 0; j <= b; j++) for (let l = 0; l <= c; l++) if (isSquare(BigInt(p) ** BigInt(i) * BigInt(q) ** BigInt(j) * BigInt(r) ** BigInt(l))) k++; return k === value ? '' : `brute force found ${k}`; },
        solution: `A divisor is ${p}<sup>i</sup> · ${q}<sup>j</sup> · ${r}<sup>l</sup> with 0 ≤ i ≤ ${a}, 0 ≤ j ≤ ${b} and 0 ≤ l ≤ ${c}. It is a perfect square exactly when i, j and l are all even: ${h(a)} choices for i, ${h(b)} for j and ${h(c)} for l. So there are ${h(a)} · ${h(b)} · ${h(c)} = <b>${value}</b>.`,
      };
    },
    // cubes that aren't squares
    (d, ctx) => {
      const [[p, q], a, b] = combo(ctx, [[[2, 3], [2, 5], [3, 5], [2, 7]], range(3, 13), range(3, 13)], (pq, a, b) => a <= b);
      const t = (e) => Math.floor(e / 3) + 1, s = (e) => Math.floor(e / 6) + 1, cubes = t(a) * t(b), both = s(a) * s(b), value = cubes - both;
      return {
        rank: 12,
        text: `How many positive divisors of ${pw(p, a)} · ${pw(q, b)} are perfect cubes but not perfect squares?`,
        answer: choices(d, value, [cubes, both, cubes + both, value + 1, (Math.floor(a / 2) + 1) * (Math.floor(b / 2) + 1)]),
        check: () => { let k = 0; for (let i = 0; i <= a; i++) for (let j = 0; j <= b; j++) { const N = BigInt(p) ** BigInt(i) * BigInt(q) ** BigInt(j); if (iroot(N, 3) ** 3n === N && !isSquare(N)) k++; } return k === value ? '' : `brute force found ${k}`; },
        solution: `A divisor ${p}<sup>i</sup> · ${q}<sup>j</sup> is a cube when i and j are multiples of 3: ${t(a)} · ${t(b)} = ${cubes} of them. It is also a square when i and j are multiples of 6: ${s(a)} · ${s(b)} = ${both}. So ${cubes} − ${both} = <b>${value}</b> are cubes but not squares.`,
      };
    }),

  topic('Laps and common multiples',
    // the first time at least j of the karts meet at the start
    (d, ctx) => {
      const [a, M, j] = combo(ctx, [[2, 3], range(8, 12), [3, 4, 5]], (a, M, j) => M >= a + 6 && firstMeet(a, M, j) !== 12);
      const T = firstMeet(a, M, j), at = range(a, M).filter((k) => T % k === 0), small = range(a, a + j - 1).reduce((x, k) => lcm(x, k), 1);
      return {
        rank: 16,
        text: `On a circular track, ${M - a + 1} go-karts leave the start line together. Kart k takes exactly k minutes per lap, for each k from ${a} to ${M}, and every kart keeps a steady speed. After how many minutes are at least ${j} of the karts at the start line at the same moment for the first time?`,
        answer: choices(d, T, [small, 2 * T, T + a, T - 1, T + j]),
        check: () => { let best = Infinity; const ks = range(a, M); const walk = (s, c, l) => { if (c === j) { best = Math.min(best, l); return; } for (let i = s; i < ks.length; i++) walk(i + 1, c + 1, lcm(l, ks[i])); }; walk(0, 0, 1); return best === T ? '' : `subsets say ${best}`; },
        solution: `A kart with a k-minute lap is at the start line exactly at multiples of k minutes. So we want the least T that is a multiple of at least ${j} of the numbers ${a}, ${a + 1}, …, ${M}. Going through T = 1, 2, 3, …, each earlier time is a multiple of fewer than ${j} of them, while ${T} is a multiple of ${at.join(', ')}. The answer is <b>${T}</b>.`,
      };
    },
    // all three runners together again
    (d, ctx) => {
      const [[x, y, z]] = combo(ctx, [[[4, 6, 10], [6, 8, 9], [5, 6, 8], [6, 10, 15], [8, 12, 18], [9, 12, 15], [10, 12, 16], [4, 9, 15], [6, 14, 21], [12, 16, 20], [8, 10, 14], [9, 10, 12]]]);
      const value = lcm(lcm(x, y), z);
      return {
        rank: 5,
        text: `Three runners leave the start line of a track together. They run at steady speeds and take ${x}, ${y} and ${z} minutes per lap. After how many minutes are all three at the start line together again for the first time?`,
        answer: choices(d, value, [x * y * z, x + y + z, lcm(x, y), lcm(y, z), 2 * value], ints),
        check: () => { let t = 1; while (t % x || t % y || t % z) t++; return t === value ? '' : `search found ${t}`; },
        solution: `Each runner is at the start line at the multiples of their lap time, so we need the least common multiple of ${x}, ${y} and ${z}. With ${[x, y, z].map((v) => `${v} = ${factor(v).map(([p, e]) => pw(p, e)).join(' · ')}`).join(', ')}, take the highest power of each prime: lcm = <b>${value}</b>.`,
      };
    },
    // how many times two blinking lights line up
    (d, ctx) => {
      const [[a, b], T] = combo(ctx, [[[4, 6], [6, 9], [8, 12], [10, 15], [6, 10], [12, 18], [9, 15], [14, 21], [16, 24], [15, 20]], [120, 180, 240, 300, 360, 600]]);
      const L = lcm(a, b), value = Math.floor(T / L);
      return {
        rank: 7,
        text: `Two lights start blinking at the same moment. One blinks every ${a} seconds and the other every ${b} seconds. How many times in the next ${T} seconds do they blink at the same moment? (Count the very end of that time if they blink together then, but not the start.)`,
        answer: choices(d, value, [Math.floor(T / (a * b)), Math.floor(T / a) + Math.floor(T / b), value + 1, Math.floor(T / gcd(a, b)), value - 1]),
        check: () => { const k = range(1, T).filter((t) => t % a === 0 && t % b === 0).length; return k === value ? '' : `counting gives ${k}`; },
        solution: `They blink together at the multiples of lcm(${a}, ${b}) = ${L} seconds: ${L}, ${2 * L}, ${3 * L}, …. Up to ${T} that is ⌊${T}/${L}⌋ = <b>${value}</b> times.`,
      };
    }),

  topic('Digit sums',
    // what the digit sum of n + 1 can be
    (d) => {
      let s;
      do s = d.int(500, 2500); while (s === 1274);
      const t = d.int(5, Math.floor(s / 9) - 1), value = s + 1 - 9 * t;
      const possible = (w) => w >= 1 && w <= s + 1 && (s + 1 - w) % 9 === 0;
      const wrongs = [s + 10, ...d.shuffle([s, s - 9, value + 3, value - 2, value + 5, 1 + ((s + 3) % 9), 12, value + 1, value - 1])].filter((w) => w > 0 && !possible(w));
      const answer = choices(d, value, wrongs, ints);
      return {
        rank: 20,
        text: `Let S(n) be the sum of the digits of the positive integer n; for example, S(4096) = 19. For a certain n, S(n) = ${ints(s)}. Which of the following could be the value of S(n + 1)?`,
        answer,
        check: () => {
          const R = s - 9 * t, n = (R % 8 ? String(R % 8) : '') + '8'.repeat(Math.floor(R / 8)) + '9'.repeat(t);
          const shown = answer.choices.map((c) => Number(c.replace(/,/g, '')));
          return digitSum(n) === s && digitSum((BigInt(n) + 1n).toString()) === value && shown.filter(possible).length === 1 ? '' : 'the choices are off';
        },
        solution: `Adding 1 to n raises its last digit by 1, unless n ends in 9s: each of those becomes a 0 (losing 9 apiece) and the digit before them goes up by 1. So S(n + 1) = S(n) + 1 − 9t, where t is the number of 9s at the end of n. That means S(n + 1) is at most ${ints(s + 1)} and leaves the same remainder as ${ints(s + 1)} when divided by 9. Of the choices, only <b>${ints(value)}</b> does (it needs ${t} nines at the end of n).`,
      };
    },
    // the smallest number with a given digit sum
    (d, ctx) => {
      const [s] = combo(ctx, [range(20, 60)]), k = Math.floor(s / 9), r = s % 9, str = (r ? String(r) : '') + '9'.repeat(k), value = Number(str), len = str.length;
      const wrongs = [Number('9'.repeat(k) + (r ? String(r) : '')), r < 8 ? Number(String(r + 1) + '8' + '9'.repeat(k - 1)) : value + 9, Number('1' + String(r ? r - 1 : 8) + '9'.repeat(r ? k : k - 1)), value + 9, value * 10];
      return {
        rank: 8,
        text: `What is the smallest positive integer whose digits add up to ${s}?`,
        answer: choices(d, value, wrongs, ints),
        check: () => {
          let rest = s, out = '';                     // greedy from the left: the smallest digit that still leaves room for the rest
          for (let i = 0; i < len; i++) { let g = i === 0 ? 1 : 0; while (rest - g > 9 * (len - 1 - i)) g++; out += g; rest -= g; }
          return 9 * (len - 1) < s && out === str ? '' : `greedy gives ${out}`;
        },
        solution: `A smaller number has fewer digits, and each digit is at most 9, so ${s} needs at least ${len} digits (${len - 1} nines only reach ${9 * (len - 1)}). With ${len} digits, make the first digit as small as it can be, which means all the others are 9: the first digit is ${s} − 9 · ${len - 1} = ${s - 9 * (len - 1)}. So the answer is <b>${ints(value)}</b>.`,
      };
    },
    // three-digit numbers with a given digit sum
    (d, ctx) => {
      const [s] = combo(ctx, [range(4, 24)]), each = range(1, 9).map((a) => pairs(s - a)), value = total(each);
      const used = each.map((v, i) => [i + 1, v]).filter(([, v]) => v);
      return {
        rank: 12,
        text: `How many three-digit positive integers have digits that add up to ${s}?`,
        answer: choices(d, value, [value + pairs(s), ((s + 2) * (s + 1)) / 2, value - 1, value + 1, (s * (s + 1)) / 2]),
        check: () => { const k = range(100, 999).filter((n) => digitSum(n) === s).length; return k === value ? '' : `brute force found ${k}`; },
        solution: `Fix the first digit a (from 1 to 9). The other two digits add up to ${s} − a, and two digits can make a total of t in t + 1 ways when t ≤ 9, or 19 − t ways when 10 ≤ t ≤ 18. Going through a = ${used.map(([a]) => a).join(', ')}: ${used.map(([, v]) => v).join(' + ')} = <b>${value}</b>.`,
      };
    },
    // the digits of a power of ten minus a little
    (d, ctx) => {
      const [k, m] = combo(ctx, [range(12, 40), [7, 13, 37, 48, 99, 123, 250, 999, 2025, 77]]);
      const L = String(m).length, tail = 10 ** L - m, value = 9 * (k - L) + digitSum(tail);
      return {
        rank: 10,
        text: `What is the sum of the digits of 10<sup>${k}</sup> − ${ints(m)}?`,
        answer: choices(d, value, [9 * k, 9 * k - digitSum(m), 9 * (k - L), value + 9, value - 9]),
        check: () => (digitSum((10n ** BigInt(k) - BigInt(m)).toString()) === value ? '' : 'digit sum wrong'),
        solution: `10<sup>${k}</sup> − ${ints(m)} = (10<sup>${k}</sup> − 10<sup>${L}</sup>) + (10<sup>${L}</sup> − ${ints(m)}): that is ${k - L} nines followed by the ${L} digits of ${10 ** L} − ${ints(m)} = ${String(tail).padStart(L, '0')}. So its digit sum is 9 · ${k - L} + ${digitSum(tail)} = <b>${value}</b>.`,
      };
    }),
]);
