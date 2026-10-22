// AMC 10 number theory: 20 problems modelled on ideas from past contests (digit patterns, divisors, remainders,
// bases), each with new numbers and wording. Every one checks its answer a second, independent way.
import { combo, num, frac, gcd, lcm } from '../kit/bank.js';
import { range, digitSum, choices, labelled } from './amc-kit.js';

const divisors = (n) => { const out = []; for (let i = 1; i * i <= n; i++) if (n % i === 0) { out.push(i); if (i * i !== n) out.push(n / i); } return out.sort((a, b) => a - b); };
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const primesTo = (n) => range(2, n).filter(isPrime);
const vp = (n, p) => { let e = 0; while (n % p === 0) { n /= p; e++; } return e; };
const legendre = (n, p) => { let e = 0; for (let q = p; q <= n; q *= p) e += Math.floor(n / q); return e; };   // the power of p in n!
const sup = (b, e) => `${b}<sup>${e}</sup>`;
const pw = (b, e) => (e === 1 ? `${b}` : sup(b, e));
const fr = (p, q) => `<span class="fr"><span>${p}</span><span>${q}</span></span>`;
// b^e mod m, for big exponents
const powMod = (b, e, m) => { let r = 1n, x = BigInt(b) % BigInt(m), k = BigInt(e); const M = BigInt(m); while (k > 0n) { if (k & 1n) r = (r * x) % M; x = (x * x) % M; k >>= 1n; } return Number(r); };
// the remainders of b, b², b³, … mod m, up to where they start over
const cycle = (b, m) => { const seq = []; let v = b % m; while (!seq.includes(v)) { seq.push(v); v = (v * b) % m; } return seq; };
// the floor of the k-th root of a BigInt
const iroot = (n, k) => { if (n < 2n) return n; const K = BigInt(k); let lo = 0n, hi = 1n; while (hi ** K <= n) hi *= 2n; while (hi - lo > 1n) { const mid = (lo + hi) / 2n; if (mid ** K <= n) lo = mid; else hi = mid; } return lo; };
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

export const numberTheory = [
  // 1. a digit pattern that always factors: k ones, a 0, k ones
  (d) => {
    const count = d.int(6, 12), ask = d.pick(['prime', 'composite']), value = ask === 'prime' ? 1 : count - 1;
    const term = (k) => '1'.repeat(k) + '0' + '1'.repeat(k);
    return {
      topic: 'Primes in a digit pattern', rank: 6,
      text: `The list 101, 11011, 1110111, 111101111, … goes on the same way: its k-th number is k ones, then a 0, then k more ones. How many of the first ${count} numbers in the list are ${ask}?`,
      answer: choices(d, value, ask === 'prime' ? [0, 2, 3, count] : [count, count - 2, 0, 1]),
      check: () => { const primes = range(1, count).filter((k) => isPrimeBig(BigInt(term(k)))).length; return (ask === 'prime' ? primes : count - primes) === value ? '' : `found ${primes} primes`; },
      solution: `The k-th number is 11…1 (k ones) times 10<sup>k+1</sup> + 1: for example 11011 = 11 × 1001 and 1110111 = 111 × 10001. For k ≥ 2 both factors are more than 1, so the number is composite. Only the first number, 101, is prime. So ${ask === 'prime' ? `<b>1</b> of the first ${count} is prime` : `<b>${count - 1}</b> of the first ${count} are composite`}.`,
    };
  },
  // 2. three integers with a given product: the smallest positive sum
  (d) => {
    const search = (P) => {
      let low = null, allPos = Infinity;
      const sums = new Set();
      for (const x of divisors(P)) for (const y of divisors(P / x)) {
        const z = P / x / y;
        allPos = Math.min(allPos, x + y + z);
        sums.add(x + y + z);
        if (z - x - y > 0) { sums.add(z - x - y); if (!low || z - x - y < low.s) low = { s: z - x - y, x, y, z }; }
      }
      return { ...low, allPos, sums: [...sums].sort((a, b) => a - b) };
    };
    let P, b;
    do { P = d.pick([36, 40, 48, 54, 72, 84, 90, 96, 100, 108, 126, 132, 150, 168, 180, 200, 210, 252]); b = search(P); } while (b.s === 3);
    return {
      topic: 'Product and least sum', rank: 7,
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
  // 3. an lcm and a gcd that pin down n
  (d) => {
    let a, b, n, L, G, fits;
    for (;;) {
      a = d.pick([12, 14, 15, 20, 21, 24, 28, 30, 35, 36, 40]); b = d.pick([18, 20, 27, 28, 30, 42, 45, 50, 54, 70, 75, 98]); n = d.int(12, 150);
      L = lcm(n, a); G = gcd(n, b); fits = divisors(L).filter((x) => lcm(x, a) === L);
      if (G > 1 && n !== a && n !== L && fits.length >= 3 && fits.filter((x) => gcd(x, b) === G).length === 1) break;
    }
    return {
      topic: 'LCM and GCD', rank: 7,
      text: `A positive integer n has least common multiple ${L} with ${a}, and greatest common divisor ${G} with ${b}. What is n?`,
      answer: choices(d, n, [...d.shuffle(fits.filter((x) => x !== n)), ...d.shuffle(divisors(L).filter((x) => x !== n && gcd(x, b) === G)), L, 2 * n]),
      check: () => { const found = range(1, 2 * L).filter((x) => lcm(x, a) === L && gcd(x, b) === G); return found.length === 1 && found[0] === n ? '' : `found ${found.join(', ')}`; },
      solution: `Since lcm(n, ${a}) = ${L}, n is a divisor of ${L}. The divisors of ${L} whose lcm with ${a} is ${L} are ${fits.join(', ')}. Of these, only ${n} has gcd ${G} with ${b}. So n = <b>${n}</b>.`,
    };
  },
  // 4. the odd divisors against the even ones
  (d) => {
    const pool = [15, 21, 33, 35, 45, 49, 55, 75, 77, 81, 99, 6, 10, 14, 18, 22, 26, 30, 42, 50, 66, 70, 90, 98, 12, 20, 28, 36, 44, 52, 60, 84, 100, 24, 40, 56, 72, 88, 48, 80, 112];
    const a = d.pick([1, 2, 4, 5]);
    let f;
    do f = [0, 1, 2].map(() => d.pick(pool)).sort((x, y) => x - y); while (f.reduce((s, x) => s + vp(x, 2), 0) !== a || f[0] * f[1] * f[2] > 2e6);
    const N = f[0] * f[1] * f[2], m = N / 2 ** a, r = 2 ** (a + 1) - 2, powers = range(1, a).map((i) => 2 ** i);
    const ratio = (v) => [v, `1 : ${v}`];
    return {
      topic: 'Odd and even divisor sums', rank: 9,
      text: `Let N = ${f.join(' · ')}. Add up all the odd positive divisors of N, and separately add up all the even ones. What is the ratio of the odd total to the even total?`,
      answer: labelled(ratio(r), [2 ** a, 2 ** (a + 1), 2 ** (a + 1) - 1, 2 ** a - 1, 2 ** (a + 2) - 2, a + 1, 2 * a].filter((v) => v > 0).map(ratio)),
      check: () => { let odd = 0, even = 0; for (const x of divisors(N)) if (x % 2) odd += x; else even += x; return even === r * odd ? '' : `sums ${odd} and ${even}`; },
      solution: `N = ${pw(2, a)} · ${num(m, 0)}, and ${num(m, 0)} is odd. The odd divisors of N are the divisors of ${num(m, 0)}; say they add up to s. `
        + (a === 1 ? 'Every even divisor is 2 times an odd one, so the even divisors add up to 2s.' : `Every even divisor is ${powers.slice(0, -1).join(', ')} or ${powers.at(-1)} times an odd one, so the even divisors add up to (${powers.join(' + ')}) · s = ${r}s.`)
        + ` The ratio is <b>1 : ${r}</b>.`,
    };
  },
  // 5. a repeating decimal used as if it stopped
  (d, ctx) => {
    const [M, ab, w] = combo(ctx, [[12, 18, 22, 24, 33, 36, 44, 45, 54, 55, 72, 77, 88, 90, 99], range(10, 99), [1, 2, 3]], (M, ab) => (M * ab) % 99 === 0 && ab % 10 !== 0 && Math.floor(ab / 10) !== ab % 10);
    const diff = (M * ab) / 9900, swapped = (ab % 10) * 10 + Math.floor(ab / 10);
    return {
      topic: 'Repeating decimals', rank: 8,
      text: `Nadia was supposed to multiply ${M} by the repeating decimal ${w}.<i>ab</i><i>ab</i><i>ab</i>…, in which the two digits <i>a</i> and <i>b</i> repeat forever. Not noticing the repeat, she multiplied ${M} by ${w}.<i>ab</i> instead, and her answer came out ${num(diff, 2)} too small. What is the two-digit number <i>ab</i>?`,
      answer: choices(d, ab, [swapped, ab + 9, ab - 9, ab + 11, Math.round(ab / 2)].filter((v) => v >= 10 && v <= 99)),
      check: () => { const hits = range(10, 99).filter((t) => Math.abs(M * (Number(`${w}.${String(t).repeat(8)}`) - Number(`${w}.${t}`)) - diff) < 1e-6); return hits.length === 1 && hits[0] === ab ? '' : `matches: ${hits.join(', ')}`; },
      solution: `The repeating decimal is ${w} + ${fr('<i>ab</i>', 99)} and the number she used is ${w} + ${fr('<i>ab</i>', 100)}. So her answer was short by ${M} · <i>ab</i> · (${fr(1, 99)} − ${fr(1, 100)}) = ${fr(`${M} · <i>ab</i>`, '9900')}. Setting that equal to ${num(diff, 2)} gives <i>ab</i> = 9900 · ${num(diff, 2)} / ${M} = <b>${ab}</b>.`,
    };
  },
  // 6. the units digit of a sum of two big powers
  (d) => {
    const unit = (x, k) => { const c = cycle(x % 10, 10); return c[(k - 1) % c.length]; };
    let a, b, c, e, value;
    do {
      a = 10 * d.int(100, 999) + d.pick([2, 3, 7, 8]); c = 10 * d.int(100, 999) + d.pick([2, 3, 4, 7, 8, 9]);
      b = d.int(100, 3000); e = d.int(100, 3000); value = (unit(a, b) + unit(c, e)) % 10;
    } while (value === 7);
    const ua = unit(a, b), uc = unit(c, e);
    const say = (x, k) => {
      const cyc = cycle(x % 10, 10), p = ((k - 1) % cyc.length) + 1;
      return `Powers of ${x % 10} end in ${cyc.join(', ')}, over and over; ${k} leaves remainder ${k % cyc.length} when divided by ${cyc.length}, so ${sup(x, k)} ends in the same digit as ${pw(x % 10, p)}, which is ${cyc[p - 1]}.`;
    };
    return {
      topic: 'Units digits', rank: 8,
      text: `What is the units digit of ${sup(a, b)} + ${sup(c, e)}?`,
      answer: choices(d, value, [ua, uc, (a + c) % 10, (unit(a, b + 1) + uc) % 10, (ua + unit(c, e + 1)) % 10, ...d.shuffle(range(0, 9))]),
      check: () => ((powMod(a, b, 10) + powMod(c, e, 10)) % 10 === value ? '' : 'units digit wrong'),
      solution: `Only the last digits matter. ${say(a, b)} ${say(c, e)} So the sum ends in the units digit of ${ua} + ${uc}: <b>${value}</b>.`,
    };
  },
  // 7. consecutive powers added up, mod a prime
  (d, ctx) => {
    const S = (b, t) => range(0, t - 1).reduce((s, i) => s + b ** i, 0);
    const [b, m, t] = combo(ctx, [[2, 3, 5, 6, 7, 10], [7, 11, 13, 17, 19, 23], [3, 4]], (b, m, t) => b % m !== 0 && cycle(b, m).length <= 10 && S(b, t) % m !== 0 && !(b === 7 && m === 19));
    const k = d.int(2025, 2060), sum = S(b, t), F = sum % m, seq = cycle(b, m), L = seq.length, x = seq[(k - 1) % L], value = (F * x) % m;
    const terms = range(0, t - 1).map((i) => sup(b, k + i)).join(' + '), small = range(0, t - 1).map((i) => (i === 0 ? '1' : pw(b, i))).join(' + ');
    return {
      topic: 'Sums of powers mod m', rank: 7,
      text: `What is the remainder when ${terms} is divided by ${m}?`,
      answer: choices(d, value, [F, x, (F + x) % m, (t * x) % m, (F * seq[k % L]) % m, ...d.shuffle(range(0, m - 1))]),
      check: () => (range(0, t - 1).reduce((s, i) => s + powMod(b, k + i, m), 0) % m === value ? '' : 'remainder wrong'),
      solution: `Factor out ${sup(b, k)}: the sum is ${sup(b, k)} · (${small}) = ${sup(b, k)} · ${sum}${sum >= m ? `, and ${sum} leaves remainder ${F} when divided by ${m}` : ''}. The remainders of ${b}, ${sup(b, 2)}, ${sup(b, 3)}, … mod ${m} are ${seq.join(', ')}, and then they repeat. ${k} leaves remainder ${k % L} when divided by ${L}, so ${sup(b, k)} leaves remainder ${x}. The sum leaves the same remainder as ${F} · ${x} = ${F * x}: <b>${value}</b>.`,
    };
  },
  // 8. a square root that has to come out whole
  (d) => {
    const c = d.pick([45, 48, 63, 64, 72, 75, 80, 81, 96, 99, 105, 120, 135, 144]);
    const pairs = divisors(c).filter((u) => u * u <= c && (u + c / u) % 2 === 0).map((u) => [(c / u - u) / 2, (u + c / u) / 2]);   // [m, n]
    const count = 2 * pairs.length, withNegM = count + 2 * pairs.filter(([m]) => m > 0).length, allPairs = 2 * divisors(c).filter((u) => u * u <= c).length;
    const opt = (v) => [v, String(v)];
    return {
      topic: 'Difference of squares', rank: 11,
      text: `For how many ordered pairs (m, n) of integers is √(n<sup>2</sup> − ${c}) equal to m?`,
      answer: labelled(opt(count), [[1e9, 'infinitely many'], opt(count / 2), opt(withNegM), opt(count + 2), opt(count - 2), opt(allPairs)]),
      check: () => { let k = 0; for (let n = -c - 1; n <= c + 1; n++) for (let m = 0; m <= c; m++) if (m * m === n * n - c) k++; return k === count ? '' : `brute force found ${k}`; },
      solution: `A square root is never negative, so m ≥ 0, and squaring gives n<sup>2</sup> − m<sup>2</sup> = ${c}, that is (n − m)(n + m) = ${c}. The two factors differ by 2m, so they have the same parity. For n > 0 the same-parity factor pairs of ${c} are ${pairs.map(([m, n]) => `${n - m} · ${n + m}`).join(', ')}, giving (m, n) = ${pairs.map(([m, n]) => `(${m}, ${n})`).join(', ')}. Each n can also be made negative, so there are <b>${count}</b> pairs.`,
    };
  },
  // 9. an equation that factors (Simon's favourite factoring trick)
  (d) => {
    if (d.chance(0.5)) {
      const a = d.int(2, 9), b = d.int(2, 9), ab = a * b, t = divisors(ab).length, value = 2 * t;
      return {
        topic: 'Factoring an equation', rank: 14,
        text: `How many ordered pairs (m, n) of integers satisfy mn = ${a}m + ${b}n?`,
        answer: choices(d, value, [t, 2 * t - 1, 2 * t + 2, t + 1, 4 * t]),
        check: () => { let k = 0; for (let m = b - ab; m <= b + ab; m++) if (m !== b && ab % (m - b) === 0) { const n = a + ab / (m - b); if (m * n === a * m + b * n) k++; } return k === value ? '' : `brute force found ${k}`; },
        solution: `Move everything to one side and add ${ab}: mn − ${a}m − ${b}n + ${ab} = ${ab}, which factors as (m − ${b})(n − ${a}) = ${ab}. Any divisor of ${ab}, positive or negative, can be m − ${b}, and then n − ${a} is fixed. ${ab} has ${t} positive divisors, so there are 2 · ${t} = <b>${value}</b> pairs.`,
      };
    }
    const k = d.int(2, 12), K = k * k, t = divisors(K).length, value = 2 * t - 1;
    return {
      topic: 'Factoring an equation', rank: 14,
      text: `How many ordered pairs (m, n) of nonzero integers satisfy ${fr(1, 'm')} + ${fr(1, 'n')} = ${fr(1, k)}?`,
      answer: choices(d, value, [t, 2 * t, t - 1, 2 * t + 1, 2 * t - 3]),
      check: () => { let c = 0; for (let m = k - K; m <= k + K; m++) { if (!m || m === k || (m * k) % (m - k)) continue; const n = (m * k) / (m - k); if (n && n * k + m * k === m * n) c++; } return c === value ? '' : `brute force found ${c}`; },
      solution: `Multiply through by ${k}mn: ${k}n + ${k}m = mn, which rearranges to (m − ${k})(n − ${k}) = ${K}. Any of the ${t} positive divisors of ${K}, or its negative, can be m − ${k}: that is ${2 * t} pairs. But m − ${k} = −${k} gives m = 0 (and n = 0), which is not allowed. So there are <b>${value}</b>.`,
    };
  },
  // 10. a product of factorials made into a perfect square
  (d) => {
    const n = d.pick([8, 10, 12, 18, 20, 22, 24, 26]), h = n / 2;
    const exps = primesTo(h).map((p) => [p, (p === 2 ? h : 0) + legendre(h, p)]);
    const odd = exps.filter(([, e]) => e % 2).map(([p]) => p), m = odd.reduce((x, p) => x * p, 1);
    const sqfree = (k) => primesTo(k).filter((p) => legendre(k, p) % 2).reduce((x, p) => x * p, 1);
    return {
      topic: 'Squares from factorials', rank: 15,
      text: `The product 1! · 2! · 3! ⋯ ${n}! is multiplied by a positive integer m, and the result is a perfect square. What is the smallest m that works?`,
      answer: choices(d, m, [sqfree(h), sqfree(n), m % 2 ? 2 * m : m / 2, primesTo(h).reduce((x, p) => x * p, 1), m * primesTo(n).find((p) => m % p)], (v) => num(v, 0)),
      check: () => {
        let P = 1n, f = 1n;
        for (let k = 1; k <= n; k++) { f *= BigInt(k); P *= f; }
        let rest = P, mm = 1n;
        for (const p of primesTo(n).map(BigInt)) { let e = 0; while (rest % p === 0n) { rest /= p; e++; } if (e % 2) mm *= p; }
        const r = iroot(mm * P, 2);
        return rest === 1n && mm === BigInt(m) && r * r === mm * P ? '' : `factoring gives m = ${mm}`;
      },
      solution: `Pair each odd factorial with the next one: (2j − 1)! · (2j)! = ((2j − 1)!)<sup>2</sup> · 2j. So 1! · 2! ⋯ ${n}! is a perfect square times 2 · 4 · 6 ⋯ ${n} = ${sup(2, h)} · ${h}! = ${exps.map(([p, e]) => pw(p, e)).join(' · ')}. In a perfect square every prime has an even power, so m must supply one more of each prime whose power here is odd: m = ${odd.length > 1 ? `${odd.join(' · ')} = ` : ''}<b>${num(m, 0)}</b>.`,
    };
  },
  // 11. a numeral that is divisible by q in many bases
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
      topic: 'Divisibility in other bases', rank: 18,
      text: `For how many integers b with ${lo} ≤ b ≤ ${num(hi, 0)} is the base-b numeral ${D}<sub>b</sub> divisible by ${q}? (Here ${q} is an ordinary base-ten number.)`,
      answer: choices(d, count, [good.length * (t + 1), good.length * (t - 1), (good.length + 1) * t, t, count + 1], (v) => num(v, 0)),
      check: () => { const k = range(lo, hi).filter((b) => value(ds, b) % q === 0).length; return k === count ? '' : `brute force found ${k}`; },
      solution: `In base b, ${D}<sub>b</sub> = ${poly}. Whether that is a multiple of ${q} depends only on the remainder of b when divided by ${q}, and trying all ${q} remainders, it works exactly for remainder${good.length > 1 ? 's' : ''} ${good.join(', ')}. The ${num(hi - lo + 1, 0)} bases from ${lo} to ${num(hi, 0)} run through the ${q} remainders exactly ${t} times, so the count is ${good.length} · ${t} = <b>${num(count, 0)}</b>.`,
    };
  },
  // 12. how many powers of a fraction keep a number whole
  (d) => {
    let p, q, x, y, r, A;
    do {
      [p, q] = d.pick([[2, 3], [3, 2], [3, 5], [5, 3], [2, 7], [7, 2], [5, 7], [7, 5], [3, 7]]);
      x = d.int(1, 6); y = d.int(1, 6); r = d.pick([1, 1, 11, 13]); A = p ** x * q ** y * r;
    } while (A > 2e6 || x === y || x + y + 1 === 9);
    const value = x + y + 1, An = num(A, 0);
    return {
      topic: 'Powers of a fraction', rank: 7,
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
  // 13. when 1 + 2 + ⋯ + n fails to divide n!
  (d) => {
    const [U, words] = d.pick([[99, 'two-digit positive integer n'], [299, 'positive integer n less than 300'], [500, 'positive integer n with n ≤ 500'], [750, 'positive integer n with n ≤ 750'], [1200, 'positive integer n with n ≤ 1,200'], [9999, 'four-digit positive integer n']]);
    let p = U + 1;
    while (!isPrime(p)) p--;
    const n = p - 1;
    let below = U; while (!isPrime(below)) below--;
    return {
      topic: 'Sums dividing factorials', rank: 9,
      text: `Let T = 1 + 2 + ⋯ + n and P = 1 · 2 ⋯ n = n!. What is the greatest ${words} for which P is not a multiple of T?`,
      answer: choices(d, n, [below, U, U - 1, p, n - 2, n - 4], (v) => num(v, 0)),
      check: () => {
        const divides = (k) => {
          let T = (k * (k + 1)) / 2;
          for (let f = 2; f <= T; f++) if (T % f === 0) { const e = vp(T, f); T /= f ** e; if (legendre(k, f) < e) return false; }
          return true;
        };
        for (let k = U; k >= 1; k--) if (!divides(k)) return k === n ? '' : `first failure at ${k}`;
        return 'never fails';
      },
      solution: `T = n(n + 1)/2, so P/T = 2 · (n − 1)!/(n + 1). If n + 1 is composite (and n ≥ 3), its factors all show up in 2 · (n − 1)!, so P/T is a whole number. If n + 1 is an odd prime, it divides neither 2 nor any of 1, 2, …, n − 1, so T does not divide P. So we need the greatest n in range for which n + 1 is prime. ${num(p, 0)} is the largest prime up to ${num(U + 1, 0)}, so n = <b>${num(n, 0)}</b>.`,
    };
  },
  // 14. a copied list with one digit changed
  (d) => {
    const N = d.pick([40, 45, 55, 64, 75, 88, 99, 120, 150]), [x, y] = d.pick([[3, 1], [4, 1], [5, 2], [6, 3], [7, 2], [3, 0], [9, 5], [4, 2], [8, 3]]);
    const cnt = [0, 0, 0];
    for (let k = 1; k <= N; k++) String(k).split('').reverse().forEach((c, i) => { if (+c === x) cnt[i]++; });
    const D = (x - y) * (cnt[0] + 10 * cnt[1] + 100 * cnt[2]);
    const places = [[cnt[0], 'units', 1], [cnt[1], 'tens', 10], [cnt[2], 'hundreds', 100]].filter(([c]) => c);
    return {
      topic: 'Changing a digit', rank: 6,
      text: `Rosa writes the whole numbers from 1 to ${N}. Theo copies her list, but wherever the digit ${x} appears he writes ${y} instead. Each of them adds up the numbers on their own list. How much greater is Rosa's total than Theo's?`,
      answer: choices(d, D, [(x - y) * (cnt[0] + cnt[1] + cnt[2]), (x - y) * cnt[0], (x - y) * 10 * cnt[1], D + 10 * (x - y), D - (x - y)].filter((v) => v > 0), (v) => num(v, 0)),
      check: () => { let s = 0; for (let k = 1; k <= N; k++) s += k - Number(String(k).replaceAll(String(x), String(y))); return s === D ? '' : `brute force says ${s}`; },
      solution: `Each ${x} written as a ${y} makes its number smaller by ${x - y} times the digit's place value. From 1 to ${N}, the digit ${x} appears ${places.map(([c, w]) => `${c} time${c > 1 ? 's' : ''} in the ${w} place`).join(' and ')}. So the difference is ${x - y} · (${places.map(([c, , v]) => `${c} · ${v}`).join(' + ')}) = <b>${num(D, 0)}</b>.`,
    };
  },
  // 15. numbers whose base-B form needs no letters
  (d) => {
    const B = d.pick([11, 12, 13, 14, 16]), c = d.int(1, 9), e = d.int(0, B - 1), f = d.int(0, B - 1), N = c * B * B + e * B + f;
    const part1 = c * 100, part2 = Math.min(e, 10) * 10, part3 = e <= 9 ? Math.min(f, 9) + 1 : 0, total = part1 + part2 + part3, value = total - 1;
    const words = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen'], L = B - 10, show = (v) => (v < 10 ? v : 'ABCDEF'[v - 10]);
    const letters = L === 1 ? 'the letter A for ten' : L <= 3 ? `the letters ${'ABC'.slice(0, L - 1).split('').join(', ')} and ${'ABC'[L - 1]} for ${words.slice(0, L - 1).join(', ')} and ${words[L - 1]}` : `the letters A through ${'ABCDEF'[L - 1]} for ${words[0]} through ${words[L - 1]}`;
    const steps = [`First digit 0 to ${c - 1}: ${c} · 10 · 10 = ${part1}.`];
    if (e > 0) steps.push(`First digit ${c}, second digit 0 to ${Math.min(e - 1, 9)}: ${Math.min(e, 10)} · 10 = ${part2}.`);
    steps.push(e <= 9 ? `First two digits ${c}${e}, last digit 0 to ${Math.min(f, 9)}: ${part3}.` : `The second base-${B} digit of ${num(N, 0)} is a letter, so no number starting ${c}${show(e)} counts.`);
    return {
      topic: 'Bases without letters', rank: 18,
      text: `In base ${B}, numbers are written with the digits 0 through 9 and ${letters}. How many of the integers 1, 2, 3, …, ${num(N, 0)} have a base-${B} form that uses no letters?`,
      answer: choices(d, value, [total, part1 - 1, value + 10, value - 10, part1 + 99], (v) => num(v, 0)),
      check: () => { const k = range(1, N).filter((x) => /^[0-9]+$/.test(x.toString(B))).length; return k === value ? '' : `brute force found ${k}`; },
      solution: `${num(N, 0)} = ${c} · ${B}<sup>2</sup> + ${e} · ${B} + ${f}, which is ${show(c)}${show(e)}${show(f)} in base ${B}. Count the numbers from 0 to ${num(N, 0)} whose three base-${B} digits (with leading zeros) are all 0–9. ${steps.join(' ')} That makes ${total} numbers counting 0, so the answer is <b>${num(value, 0)}</b>.`,
    };
  },
  // 16. a fraction whose base-k expansion repeats two digits
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
    const expand = (j) => { const out = []; let r = p; for (let i = 0; i < 6; i++) { r *= j; out.push(Math.floor(r / q)); r %= q; } return out.join(','); };
    return {
      topic: 'Repeating digits in base k', rank: 18,
      text: `For some integer k, the base-k expansion of the fraction ${frac(p, q)} is 0.${a}${b}${a}${b}${a}${b}…<sub>k</sub>, with the two digits ${a}${b} repeating forever. What is k?`,
      answer: choices(d, k, [k - 2, k - 1, k + 1, k + 2, k + 3, k + 4].filter((j) => j > Math.max(a, b))),
      check: () => { const want = [a, b, a, b, a, b].join(','), hits = range(Math.max(a, b) + 1, k + 4).filter((j) => expand(j) === want); return hits.length === 1 && hits[0] === k ? '' : `long division matches ${hits.join(', ')}`; },
      solution: `Call the number x. Multiplying by k<sup>2</sup> shifts it two places: k<sup>2</sup>x = ${a}${b}<sub>k</sub> + x = ${a}k + ${b} + x. So x = (${a}k + ${b})/(k<sup>2</sup> − 1). With k = ${k} this is ${a * k + b}/${k * k - 1} = ${frac(p, q)}, and none of the other choices works. So k = <b>${k}</b>.`,
    };
  },
  // 17. a diagonal across a tiled floor
  (d, ctx) => {
    const [g, [u, v]] = combo(ctx, [[2, 3, 4, 5, 6], [[2, 3], [2, 5], [3, 4], [3, 5], [3, 7], [4, 5], [4, 7], [5, 6], [5, 7], [2, 7]]], (g, uv) => g * uv[1] <= 42);
    const m = g * u, n = g * v, count = m + n - g;
    return {
      topic: 'Diagonal through tiles', rank: 10,
      text: `A rectangular hall ${m} meters wide and ${n} meters long is covered with ${num(m * n, 0)} square tiles, each 1 meter on a side. A robot rolls in a straight line from one corner of the hall to the opposite corner. How many tiles does it roll across, counting the first and the last? (Just touching the corner of a tile doesn't count.)`,
      answer: choices(d, count, [m + n, m + n - 1, m + n - 2 * g, count - 1, u + v - 1]),
      check: () => { let k = 0; for (let i = 0; i < m; i++) for (let j = 0; j < n; j++) if (Math.max(j * m, n * i) < Math.min((j + 1) * m, n * (i + 1))) k++; return k === count ? '' : `tile by tile: ${k}`; },
      solution: `The robot starts in one tile and enters a new one each time it crosses a grid line: ${m - 1} lines one way and ${n - 1} the other. But where it crosses two lines at once, at a grid point, it enters only one new tile. The diagonal passes through gcd(${m}, ${n}) − 1 = ${g - 1} grid point${g - 1 > 1 ? 's' : ''} inside the hall. So it crosses 1 + ${m - 1} + ${n - 1} − ${g - 1} = <b>${count}</b> tiles.`,
    };
  },
  // 18. divisors that are squares or cubes
  (d) => {
    const [p, q] = d.pick([[5, 17], [7, 13], [11, 13], [13, 17], [3, 37], [7, 11], [3, 41], [5, 23]]), e = d.pick([6, 7, 8, 10, 11, 12]), base = p * q;
    const f = (k) => Math.floor(e / k) + 1, sq = f(2) ** 2, cu = f(3) ** 2, six = f(6) ** 2, value = sq + cu - six;
    return {
      topic: 'Square and cube divisors', rank: 11,
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
  // 19. laps of a track: the first time enough of them meet at the start
  (d) => {
    let a, M, j, T;
    do {
      a = d.pick([1, 2, 3]); M = d.int(a + 6, 12); j = d.int(3, 5);
      T = 1; while (range(a, M).filter((k) => T % k === 0).length < j) T++;
    } while (T === 12);
    const at = range(a, M).filter((k) => T % k === 0), small = range(a, a + j - 1).reduce((x, k) => lcm(x, k), 1);
    return {
      topic: 'Laps and common multiples', rank: 16,
      text: `On a circular track, ${M - a + 1} go-karts leave the start line together. Kart k takes exactly k minutes per lap, for each k from ${a} to ${M}, and every kart keeps a steady speed. After how many minutes are at least ${j} of the karts at the start line at the same moment for the first time?`,
      answer: choices(d, T, [small, 2 * T, T + a, T - 1, T + j]),
      check: () => { let best = Infinity; const ks = range(a, M); const walk = (s, c, l) => { if (c === j) { best = Math.min(best, l); return; } for (let i = s; i < ks.length; i++) walk(i + 1, c + 1, lcm(l, ks[i])); }; walk(0, 0, 1); return best === T ? '' : `subsets say ${best}`; },
      solution: `A kart with a k-minute lap is at the start line exactly at multiples of k minutes. So we want the least T that is a multiple of at least ${j} of the numbers ${a}, ${a + 1}, …, ${M}. Going through T = 1, 2, 3, …, each earlier time is a multiple of fewer than ${j} of them, while ${T} is a multiple of ${at.join(', ')}. The answer is <b>${T}</b>.`,
    };
  },
  // 20. what the digit sum of n + 1 can be
  (d) => {
    let s;
    do s = d.int(500, 2500); while (s === 1274);
    const t = d.int(5, Math.floor(s / 9) - 1), value = s + 1 - 9 * t;
    const possible = (w) => w >= 1 && w <= s + 1 && (s + 1 - w) % 9 === 0;
    const wrongs = [s + 10, ...d.shuffle([s, s - 9, value + 3, value - 2, value + 5, 1 + ((s + 3) % 9), 12])].filter((w) => w > 0 && !possible(w));
    return {
      topic: 'Digit sums', rank: 20,
      text: `Let S(n) be the sum of the digits of the positive integer n; for example, S(4096) = 19. For a certain n, S(n) = ${num(s, 0)}. Which of the following could be the value of S(n + 1)?`,
      answer: choices(d, value, wrongs, (v) => num(v, 0)),
      check: () => {
        const R = s - 9 * t, n = (R % 8 ? String(R % 8) : '') + '8'.repeat(Math.floor(R / 8)) + '9'.repeat(t);
        return digitSum(n) === s && digitSum((BigInt(n) + 1n).toString()) === value && wrongs.slice(0, 4).every((w) => !possible(w)) ? '' : 'no n gives that';
      },
      solution: `Adding 1 to n raises its last digit by 1, unless n ends in 9s: each of those becomes a 0 (losing 9 apiece) and the digit before them goes up by 1. So S(n + 1) = S(n) + 1 − 9t, where t is the number of 9s at the end of n. That means S(n + 1) is at most ${num(s + 1, 0)} and leaves the same remainder as ${num(s + 1, 0)} when divided by 9. Of the choices, only <b>${num(value, 0)}</b> does (it needs ${t} nines at the end of n).`,
    };
  },
];
