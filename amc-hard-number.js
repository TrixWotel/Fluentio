// Harder AMC 10 number theory (ranks 12 to 22): six topics modelled on contest ideas, with new numbers and wording.
// Divisibility by 11 (the alternating digit sum, with a second test, in palindromes and in repeated blocks), Chinese
// remainders, fractions in lowest terms (Euler's totient), the gcd of two expressions in n (the Euclidean algorithm),
// fractions in n that come out whole, and a grid numbered two ways. Each topic asks its idea three or four ways, and
// every check() finds the answer again by brute force over every case.
import { combo, num, frac, gcd, lcm, choose } from '../kit/bank.js';
import { choices, showFrac, range, digitSum } from './amc-kit.js';

// combo, with a name of its own for each kind of question, so no two kinds share a list of combinations
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
const total = (list) => list.reduce((s, v) => s + v, 0);
const ints = (v) => num(v, 0);
const mod = (a, m) => ((a % m) + m) % m;
const factor = (n) => { const out = []; for (let p = 2; p * p <= n; p++) if (n % p === 0) { let e = 0; while (n % p === 0) { n /= p; e++; } out.push([p, e]); } if (n > 1) out.push([n, 1]); return out; };
const primesOf = (n) => factor(n).map(([p]) => p);
const rad = (n) => primesOf(n).reduce((x, p) => x * p, 1);
const divisors = (n) => { const lo = [], hi = []; for (let i = 1; i * i <= n; i++) if (n % i === 0) { lo.push(i); if (i * i !== n) hi.unshift(n / i); } return [...lo, ...hi]; };
const phi = (n) => factor(n).reduce((x, [p, e]) => x * (p - 1) * p ** (e - 1), 1);
const sigma = (n) => total(divisors(n));
const pw = (b, e) => (e === 1 ? `${b}` : `${b}<sup>${e}</sup>`);
const shown = (n) => factor(n).map(([p, e]) => pw(p, e)).join(' · ');
const listing = (xs, word = 'and') => (xs.length < 2 ? `${xs[0]}` : `${xs.slice(0, -1).join(', ')} ${word} ${xs.at(-1)}`);
const fr = (p, q) => `<span class="fr"><span>${p}</span><span>${q}</span></span>`;   // stacked as written, not reduced
const oneMinus = (n) => primesOf(n).map((p) => `(1 − ${frac(1, p)})`).join('');      // (1 − ½)(1 − ⅓)… for φ(n)
const co = (k, x) => (k === 1 ? x : `${k}${x}`);                                      // 3t, but t rather than 1t
const weave = (xs, ys) => range(0, Math.max(xs.length, ys.length) - 1).flatMap((i) => [xs[i], ys[i]]).filter((v) => v !== undefined);
const WORD = { 4: 'four', 5: 'five', 6: 'six' };
// a polynomial in n from [coefficient, power] pairs, highest power first: [[1, 2], [-3, 1], [7, 0]] is n² − 3n + 7
const poly = (terms) => terms.filter(([c]) => c !== 0).map(([c, p], i) => {
  const a = Math.abs(c), body = p === 0 ? `${a}` : `${a === 1 ? '' : a}n${p > 1 ? `<sup>${p}</sup>` : ''}`;
  return i === 0 ? `${c < 0 ? '−' : ''}${body}` : `${c < 0 ? '−' : '+'} ${body}`;
}).join(' ');

// ---------- divisibility by 11 ----------
// the alternating digit sum, from the units digit: units − tens + hundreds − …
const alt = (n) => String(n).split('').reverse().reduce((s, c, i) => s + (i % 2 ? -c : +c), 0);
// a·A + b·B + c written out, a letter with a plus sign first when there is one: B − A + 4, A + B − 13, 16 − A − B
function lin(a, b, c) {
  const letters = [[a, 'A'], [b, 'B']].filter(([k]) => k).sort((x, y) => y[0] - x[0]);
  const parts = (letters[0][0] > 0 ? [...letters, [c, '']] : [[c, ''], ...letters]).filter(([k]) => k);
  return parts.map(([k, v], i) => `${i ? (k < 0 ? '− ' : '+ ') : k < 0 ? '−' : ''}${v || Math.abs(k)}`).join(' ');
}
// multiples of 99, 88 or 66 with two digits hidden as A and B, kept when only one pair of digits fits: for 99, A and B
// sit on places of opposite sign in the alternating sum; for 88, B is among the last three digits and A before them;
// for 66, B is the last digit. Up to 60 of each kind, spread evenly. (Worked out with place values, so it stays quick.)
let hiddenList = null;
function hidden() {
  if (hiddenList) return hiddenList;
  hiddenList = [];
  for (const M of [99, 88, 66]) {
    const found = [];
    for (const L of [5, 6]) {
      const spots = [], sgn = (i) => ((L - 1 - i) % 2 ? -1 : 1), place = (i) => 10 ** (L - 1 - i);
      for (let pa = 1; pa < L; pa++) for (let pb = pa + 1; pb < L; pb++) if (M === 99 ? (pb - pa) % 2 : M === 88 ? pa < L - 3 && pb >= L - 3 : pb === L - 1) spots.push([pa, pb]);
      for (let q = Math.ceil(10 ** (L - 1) / M); q * M < 10 ** L; q += { 99: 97, 88: 7, 66: 29 }[M]) for (const [pa, pb] of spots) {
        const ds = String(q * M).split('').map(Number), A = ds[pa], B = ds[pb];
        if (!A || !B || A === B) continue;
        const S0 = total(ds) - A - B, T0 = alt(q * M) - sgn(pa) * A - sgn(pb) * B, base = q * M - A * place(pa) - B * place(pb);
        if (M === 88 && range(0, 9).filter((b) => (base + b * place(pb)) % 8 === 0).length < 2) continue;   // 8 alone mustn't fix B
        const first = [], eleven = [], both = [];
        for (let a = 0; a <= 9; a++) for (let b = 0; b <= 9; b++) {
          const n = base + a * place(pa) + b * place(pb), sum = S0 + a + b;
          const x = M === 99 ? sum % 9 === 0 : M === 88 ? n % 8 === 0 : b % 2 === 0 && sum % 3 === 0, y = mod(T0 + sgn(pa) * a + sgn(pb) * b, 11) === 0;
          if (x) first.push([a, b]);
          if (y) eleven.push([a, b]);
          if (x && y) both.push([a, b]);
        }
        if (both.length === 1) found.push({ M, L, pa, pb, ds, A, B, first, eleven });
      }
    }
    const every = Math.ceil(found.length / 60);
    hiddenList.push(...found.filter((x, i) => i % every === 0));
  }
  return hiddenList;
}
// two digits that add up to t, and the same with the first of them at least 1; the values the first one can take
const two = (t) => (t < 0 || t > 18 ? 0 : t <= 9 ? t + 1 : 19 - t);
const lead = (t) => (t < 1 || t > 18 ? 0 : t <= 9 ? t : 19 - t);
const from = (t, low) => `${Math.max(low, t - 9)} to ${Math.min(9, t)}`;
// the values a digit v can take when it and another digit make t: "a from 2 to 9", or "b = 0" when there is only one
const pick1 = (v, t, low) => (Math.max(low, t - 9) === Math.min(9, t) ? `${v} = ${Math.min(9, t)}` : `${v} from ${from(t, low)}`);
const BLOCKS = ['47', '58', '29', '83', '16', '65', '37', '92', '74', '124', '357', '508', '263', '419', '736', '852', '617', '345', '281', '1203', '2716', '3485', '5021', '4127', '6034', '7310', '2468'];
// four- and six-digit palindromes that are multiples of 11m, and why (each count is checked one palindrome at a time)
const PAL = {
  4: { 2: 40, 3: 30, 4: 20, 5: 10, 6: 13, 7: 18, 9: 10, 13: 9 },
  6: { 2: 400, 3: 300, 4: 200, 5: 100, 6: 133, 7: 140, 9: 100, 13: 90 },
};
const PAL_WHY = {
  4: {
    2: 'It is even exactly when its last digit, a, is even, so a is 2, 4, 6 or 8 and b can be anything, which makes 4 · 10 = 40.',
    3: 'Its digit sum is 2(a + b), so it is a multiple of 3 exactly when a + b is. For a = 3, 6 or 9 that allows b = 0, 3, 6 or 9, and for each of the other six values of a it allows three values of b, so 3 · 4 + 6 · 3 = 30.',
    4: 'It is a multiple of 4 exactly when its last two digits are, and they make 10b + a, which leaves the same remainder as 2b + a when divided by 4. So a must be even, with b even when a is 4 or 8 and b odd when a is 2 or 6, five choices of b each time, so 4 · 5 = 20.',
    5: 'It is a multiple of 5 exactly when its last digit is 0 or 5, and that digit is a, which can’t be 0 because it is also the first digit. So a = 5, and b can be any of the 10 digits.',
    6: 'It must be even, so a is 2, 4, 6 or 8, and its digit sum 2(a + b) must be a multiple of 3, so a + b must be. For a = 6 that allows b = 0, 3, 6 or 9, and for a = 2, 4 or 8 three values of b each, so 4 + 3 · 3 = 13.',
    7: 'Since 1001 = 7 · 11 · 13, the palindrome 1001a + 110b is a multiple of 7 exactly when 110b is, and 110 = 2 · 5 · 11 shares no factor with 7, so b must be 0 or 7. With 9 choices of a, that makes 9 · 2 = 18.',
    9: 'Its digit sum 2(a + b) is a multiple of 9 exactly when a + b is, so a + b = 9 (9 ways, a from 1 to 9) or a + b = 18 (a = b = 9), which makes 9 + 1 = 10.',
    13: 'Since 1001 = 7 · 11 · 13, the palindrome 1001a + 110b is a multiple of 13 exactly when 110b is, and 110 = 2 · 5 · 11 shares no factor with 13, so b must be 0. That leaves 1001, 2002, …, 9009, which is 9 palindromes.',
  },
  6: {
    2: 'It is even exactly when its last digit, a, is even, so a is 2, 4, 6 or 8 and b and c can be anything, which makes 4 · 10 · 10 = 400.',
    3: 'Its digit sum is 2(a + b + c), so a + b + c must be a multiple of 3. For each of the 90 choices of a and b, the good values of c are 0, 3, 6 and 9 when a + b is a multiple of 3 (30 of the choices) and three values otherwise, so 30 · 4 + 60 · 3 = 300.',
    4: 'It is a multiple of 4 exactly when its last two digits are, and they make 10b + a, which leaves the same remainder as 2b + a when divided by 4. So a must be even, with b even when a is 4 or 8 and b odd when a is 2 or 6, which gives 4 · 5 = 20 pairs, and with any c that makes 20 · 10 = 200.',
    5: 'It is a multiple of 5 exactly when its last digit is 0 or 5, and that digit is a, which can’t be 0 because it is also the first digit. So a = 5, and b and c can be anything, which makes 10 · 10 = 100.',
    6: 'It must be even, so a is 2, 4, 6 or 8, and a + b + c must be a multiple of 3. Of the 40 choices of a and b, the 13 with a + b a multiple of 3 allow c = 0, 3, 6 or 9, and the other 27 allow three values of c each, so 13 · 4 + 27 · 3 = 133.',
    7: 'Here 10010b = 10 · 1001 · b is a multiple of 7 (1001 = 7 · 11 · 13), while 100001 = 7 · 14285 + 6 and 1100 = 7 · 157 + 1, so the palindrome leaves the same remainder as 6a + c, or as c − a, when divided by 7. So c − a must be a multiple of 7, which allows c = a for every a, c = a + 7 for a = 1 or 2, and c = a − 7 for a = 7, 8 or 9, 9 + 5 = 14 pairs in all, and with any b that makes 14 · 10 = 140.',
    9: 'Its digit sum 2(a + b + c) must be a multiple of 9, so a + b + c must be. For each of the 90 choices of a and b exactly one c works, except that both c = 0 and c = 9 work when a + b is itself a multiple of 9, which happens for 10 choices (a + b = 9 or 18), so 90 + 10 = 100.',
    13: 'Here 10010b = 10 · 1001 · b is a multiple of 13 (1001 = 7 · 11 · 13), while 100001 = 13 · 7692 + 5 and 1100 = 13 · 84 + 8, so the palindrome leaves the same remainder as 5a + 8c = 13c + 5(a − c) when divided by 13. So a − c must be a multiple of 13, which means c = a, and with 9 choices of a and 10 of b that is 90.',
  },
};

// ---------- Chinese remainders ----------
const COPRIME = [[3, 4, 5], [3, 5, 7], [4, 5, 7], [3, 5, 8], [3, 7, 8], [4, 5, 9], [5, 6, 7], [5, 7, 8], [4, 7, 9], [5, 7, 9], [5, 8, 9], [7, 8, 9]];
const SHARED = [[4, 6, 9], [6, 8, 9], [4, 6, 10], [4, 10, 15], [6, 9, 10], [8, 12, 18], [9, 12, 15], [10, 12, 15], [6, 8, 10], [8, 10, 12], [6, 14, 21], [12, 15, 20], [6, 9, 15], [4, 9, 15]];
const lcmOf = (ms) => ms.reduce((x, m) => lcm(x, m), 1);
const remText = (ms, N) => { const parts = ms.map((m) => `a remainder of ${N % m} when divided by ${m}`); return `${parts[0]}, ${parts[1]}, and ${parts[2]}`; };
// from start, going up by step, to the first number that passes test (at most a few dozen steps: remainders repeat)
const climb = (start, step, test) => { const out = [start]; for (let i = 0; i < 60 && !test(out.at(-1)); i++) out.push(out.at(-1) + step); return out; };
const few = (xs, step) => { const all = xs.length >= 3 ? xs : [...xs, ...range(1, 3 - xs.length).map((i) => xs.at(-1) + i * step)]; return (all.length <= 6 ? all.map(ints) : [...all.slice(0, 3).map(ints), '…', ints(all.at(-1))]).join(', '); };
// the sieve: the remainders for the biggest divisor first, then step by the lcm so far
function sieve(ms, N) {
  const [m1, m2, m3] = [...ms].sort((x, y) => y - x), [r1, r2, r3] = [m1, m2, m3].map((m) => N % m);
  const one = climb(r1, m1, (v) => v % m2 === r2), x = one.at(-1), L12 = lcm(m1, m2);
  const two = climb(x, L12, (v) => v % m3 === r3), N0 = two.at(-1);
  return {
    N0, x,
    // (when the first number tried already passes the next test, say so, rather than "go through … until" it)
    text: (one.length === 1 ? `Work from the biggest divisor down. The numbers that leave ${r1} when divided by ${m1} are ${few(one, m1)} and so on, and the first of them, ${ints(x)}, already leaves ${r2} when divided by ${m2}. `
      : `Work from the biggest divisor down, going through the numbers that leave ${r1} when divided by ${m1} (${few(one, m1)} and so on) until one also leaves ${r2} when divided by ${m2}, which first happens at ${ints(x)}. `) +
      (two.length === 1 ? `Numbers that pass both of those tests go up by lcm(${m1}, ${m2}) = ${L12}, and the first of them, ${ints(N0)}, already leaves ${r3} when divided by ${m3}.`
        : `Numbers that pass both of those tests go up by lcm(${m1}, ${m2}) = ${L12}, so go through ${few(two, L12)} and so on until one also leaves ${r3} when divided by ${m3}, which first happens at ${ints(N0)}.`),
  };
}
const passes = (ms, rs) => (v) => ms.every((m, i) => v % m === rs[i]);
const STORY = [['marbles', 'marble', 'rows', 'row'], ['beads', 'bead', 'strings', 'string'], ['coins', 'coin', 'stacks', 'stack'], ['cards', 'card', 'piles', 'pile'], ['chairs', 'chair', 'rows', 'row'], ['stickers', 'sticker', 'sheets', 'sheet']];
const PEOPLE = ['Amara', 'Bruno', 'Chen', 'Dalia', 'Emeka', 'Freya', 'Goran', 'Hira', 'Ishaan', 'Jolene', 'Kenji', 'Lucia'];

// ---------- fractions in lowest terms ----------
const THREE = range(100, 999).filter((n) => factor(n).length === 3);
const PAIRED = range(20, 130).filter((n) => factor(n).length >= 2 && factor(n).length <= 3);
const MANY = [180, 240, 252, 280, 300, 336, 360, 378, 420, 432, 480, 504, 540, 600, 630, 660, 720, 756, 780, 840, 900, 924, 960, 990];

// ---------- gcd of expressions ----------
// gcd(an + b, cn + e) where a and c share the prime p and b, e don't. With h = gcd(a, c), the gcd divides
// D = |(c/h)b − (a/h)e|, the smallest combination that cancels n; kept when D still has the factor p (which the gcd never
// has) and the values the gcd takes are exactly the divisors of what is left of D without p (checked for every n mod D).
let pairList = null;
function gcdPairs() {
  if (pairList) return pairList;
  pairList = [];
  const sets = { 2: [[2, 4, 6, 8, 10], [2, 4, 6, 8, 10, 12, 14], [1, 3, 5, 7, 9, 11, 13, 15]], 3: [[3, 6, 9], [3, 6, 9, 12, 15], [1, 2, 4, 5, 7, 8, 10, 11, 13, 14]] };
  for (const p of [2, 3]) {
    const [As, Cs, Bs] = sets[p];
    for (const a of As) for (const c of Cs) for (const b of Bs) for (const e of Bs) {
      const h = gcd(a, c), D = Math.abs((c / h) * b - (a / h) * e);
      if (a === c || D % p || D < 10 || D > 160) continue;
      let m = D;
      while (m % p === 0) m /= p;
      if (m < 5 || divisors(m).length > 4) continue;
      const at = new Map();
      for (let n = 1; n <= D; n++) { const g = gcd(a * n + b, c * n + e); if (!at.has(g)) at.set(g, n); }
      if ([...at.keys()].sort((x, y) => x - y).join() === divisors(m).join()) pairList.push({ p, a, b, c, e, h, D, m, at });
    }
  }
  return pairList;
}
const KS = [6, 10, 12, 14, 15, 18, 20, 21, 24, 26, 28, 30, 33, 35, 36, 39, 40, 42, 45, 50, 52, 54, 56, 60, 63, 66, 70, 75, 84, 90, 105];
const NS = [60, 66, 70, 78, 84, 90, 100, 105, 110, 120, 126, 130, 132, 140, 150, 154, 156, 165, 168, 180, 182, 195, 198, 200, 210];

// ---------- a grid numbered two ways ----------
const DUOS = [['Priya', 'Tomás'], ['Lena', 'Kofi'], ['Mei', 'Rafael'], ['Zara', 'Emil'], ['Noor', 'Dmitri'], ['Ines', 'Jonah']];
const byRows = (who, r, c) => `${who} numbers the squares 1 to ${ints(r * c)} row by row: the top row gets 1 to ${c} from left to right, the next row gets ${c + 1} to ${2 * c}, and so on.`;
const byCols = (who, r) => `${who} numbers them column by column: the left column gets 1 to ${r} from top to bottom, the next column gets ${r + 1} to ${2 * r}, and so on.`;
// how many squares of an r × c grid get the same number row by row and the second way, square by square (for checks)
const sameCount = (r, c, way) => { let k = 0; for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) if (c * i + j + 1 === way(i, j)) k++; return k; };
// how many of 1 to M share no factor with the primes ps (one or two of them), by inclusion and exclusion
// a, a + 1, …, b written out: "0, 1 or 2" when there are only a few, "0, 1, …, 9" otherwise
const run = (a, b) => (b - a <= 3 ? listing(range(a, b), 'or') : `${a}, ${a + 1}, …, ${b}`);
const coprimeUpTo = (M, ps) => M - total(ps.map((p) => Math.floor(M / p))) + (ps.length > 1 ? Math.floor(M / (ps[0] * ps[1])) : 0);

export const hardNumber = {
  'Divisibility by 11': [
    // two hidden digits in a multiple of 99, 88 or 66: the test for 11 together with the test for the other factor
    (d, ctx) => {
      const val = { sum: ([a, b]) => a + b, product: ([a, b]) => a * b };
      const [P, ask] = pick(ctx, 'eleven-hidden', [hidden(), ['sum', 'product']], (P, ask) => new Set(P.first.map(val[ask])).size > 1 && new Set(P.eleven.map(val[ask])).size > 1);
      const { M, L, pa, pb, ds, A, B } = P, f = val[ask], value = f([A, B]);
      const sgn = (i) => ((L - 1 - i) % 2 ? -1 : 1), sa = sgn(pa), sb = sgn(pb);
      const S0 = total(ds) - A - B, T0 = alt(ds.join('')) - sa * A - sb * B;
      const shownN = ds.map((v, i) => (i === pa ? 'A' : i === pb ? 'B' : v)).join('');
      const altText = `${shownN.split('').reverse().map((t, i) => (i ? `${i % 2 ? '−' : '+'} ${t}` : t)).join(' ')} = ${lin(sa, sb, T0)}`;
      let why;
      if (M === 99) {
        const r = mod(-S0, 9), sums = [r, r + 9, r + 18].filter((v) => v <= 18);
        const Dn = sa > 0 ? 'A − B' : 'B − A', D = sa > 0 ? A - B : B - A, x = mod(-T0, 11), diffs = [x, x - 11].filter((v) => v >= -9 && v <= 9);
        why = [
          '99 = 9 · 11, and 9 and 11 share no factor, so the number is a multiple of 99 exactly when it is a multiple of both 9 and 11.',
          `For 9, its digit sum ${S0} + A + B must be a multiple of 9, and A + B is between 0 and 18, so A + B is ${listing(sums, 'or')}.`,
          `For 11, its alternating digit sum from the units digit, ${altText}, must be a multiple of 11, and ${Dn} is between −9 and 9, so ${Dn} is ${listing(diffs.map(ints), 'or')}.`,
          `A + B and ${Dn} add up to 2${sa > 0 ? 'A' : 'B'}, so they are both even or both odd, and the only such pair that makes A and B digits is A + B = ${A + B} with ${Dn} = ${ints(D)}, which gives A = ${A} and B = ${B}.`,
        ];
      } else if (M === 88) {
        const tail = (b) => Number(ds.slice(L - 3).map((v, i) => (L - 3 + i === pb ? b : v)).join(''));
        const SB = range(0, 9).filter((b) => tail(b) % 8 === 0), need = (b) => mod(-sa * (T0 + sb * b), 11);
        why = [
          '88 = 8 · 11, and 8 and 11 share no factor, so the number must be a multiple of both 8 and 11.',
          `Since 1000 is a multiple of 8, a number is a multiple of 8 exactly when its last three digits are, and ${shownN.slice(-3)} is a multiple of 8 only for B = ${listing(SB, 'or')}.`,
          `For 11, its alternating digit sum from the units digit, ${altText}, must be a multiple of 11.`,
          `Trying each B in turn, ${SB.map((b) => `B = ${b} makes it ${lin(sa, 0, T0 + sb * b)}, ${need(b) <= 9 ? `a multiple of 11 only for A = ${need(b)}` : 'a multiple of 11 for no digit A'}`).join('; ')}.`,
          `That leaves A = ${A} and B = ${B}.`,
        ];
      } else {
        const need = (b) => mod(-sa * (T0 + b), 11), fit = [0, 2, 4, 6, 8].filter((b) => need(b) <= 9), miss = [0, 2, 4, 6, 8].filter((b) => need(b) > 9);
        why = [
          '66 = 2 · 3 · 11, so the number must be even, a multiple of 3 and a multiple of 11.',
          'Being even means its last digit B is 0, 2, 4, 6 or 8.',
          `For 11, its alternating digit sum from the units digit, ${altText}, must be a multiple of 11, which pairs ${fit.map((b) => `B = ${b} with A = ${need(b)}`).join(', ')}${miss.length ? `, while ${listing(miss.map((b) => `B = ${b}`))} ${miss.length > 1 ? 'fit' : 'fits'} no digit A` : ''}.`,
          `For 3, the digit sum ${S0} + A + B must be a multiple of 3, and of those pairs only A = ${A}, B = ${B} does it (${S0} + ${A} + ${B} = ${S0 + A + B}).`,
        ];
      }
      return {
        topic: 'Divisibility by 11', rank: M === 88 ? 15 : 16,
        text: `The ${WORD[L]}-digit number ${shownN} is a multiple of ${M}, where A and B stand for single digits. What is ${ask === 'sum' ? 'A + B' : 'the product A · B'}?`,
        answer: choices(d, value, weave(d.shuffle([...new Set(P.first.map(f))]), d.shuffle([...new Set(P.eleven.map(f))]))),
        check: () => {
          const found = [];
          for (let a = 0; a <= 9; a++) for (let b = 0; b <= 9; b++) { const e = ds.slice(); e[pa] = a; e[pb] = b; if (Number(e.join('')) % M === 0) found.push([a, b]); }
          return found.length === 1 && found[0][0] === A && found[0][1] === B && f(found[0]) === value ? '' : `digits that work: ${found.map((x) => x.join('')).join(', ')}`;
        },
        solution: [...why, `So ${ask === 'sum' ? `A + B = <b>${value}</b>` : `A · B = ${A} · ${B} = <b>${value}</b>`}.`].join(' '),
      };
    },
    // how many four- or five-digit multiples of 11 have a given digit sum: split the digits into the two alternating groups
    (d, ctx) => {
      const [[L, s]] = pick(ctx, 'eleven-count', [[...range(11, 25).map((s) => [4, s]), ...[6, 8, 10, 12, 14, 16].map((s) => [5, s])]]);
      let count, wrongs, why;
      if (L === 4 && s % 2 === 0) {
        const X = s / 2;
        count = lead(X) * two(X);
        wrongs = [two(X) ** 2, X * (X + 1), (X + 1) ** 2, lead(X) + two(X), lead(X) * (two(X) - 1)];
        why = [
          `Here (a + c) + (b + d) = ${s} is even, so the difference (a + c) − (b + d) is even too, and it lies between −18 and 18; the only even multiple of 11 there is 0, so a + c = b + d = ${X}.`,
          `With a at least 1, a + c = ${X} has ${lead(X)} solutions (a from ${from(X, 1)}), and b + d = ${X} has ${two(X)} (b from ${from(X, 0)}).`,
          `So there are ${lead(X)} · ${two(X)} = <b>${count}</b> such numbers.`,
        ];
      } else if (L === 4) {
        const X = (s + 11) / 2, Y = (s - 11) / 2, p1 = lead(X) * two(Y), p2 = lead(Y) * two(X);
        count = p1 + p2;
        wrongs = [0, p1, p2, 2 * two(X) * two(Y), count + two(X), lead(X) * two(X)];
        why = [
          `Here (a + c) + (b + d) = ${s} is odd, so the difference (a + c) − (b + d) is odd and can’t be 0; between −18 and 18 it must be 11 or −11.`,
          `If it is 11, then a + c = ${X} and b + d = ${Y}, which happens in ${lead(X)} · ${two(Y)} = ${p1} ways (${pick1('a', X, 1)}, and ${pick1('b', Y, 0)}).`,
          `If it is −11, then a + c = ${Y} and b + d = ${X}, which happens in ${lead(Y)} · ${two(X)} = ${p2} ways${Y === 0 ? ' (a can’t be 0)' : ` (${pick1('a', Y, 1)}, and ${pick1('b', X, 0)})`}.`,
          `So there are ${p1} + ${p2} = <b>${count}</b> such numbers.`,
        ];
      } else {
        const X = s / 2, C = choose(X + 1, 2);
        count = C * (X + 1);
        wrongs = [choose(X + 2, 2) * (X + 1), choose(X, 2) * (X + 1), C + X + 1, C * X, 2 * C * (X + 1)];
        why = [
          `The two groups add up to ${s}, so their difference is even, and it is smaller than 22 in size; the only even multiple of 11 like that is 0, so a + c + e = b + d = ${X}.`,
          `There are ${X + 1} ways to make b + d = ${X}.`,
          `For a + c + e = ${X} with a at least 1, write a = 1 + a′; then a′ + c + e = ${X - 1} has C(${X + 1}, 2) = ${C} solutions by stars and bars, and no digit can go over 9.`,
          `So there are ${C} · ${X + 1} = <b>${count}</b> such numbers.`,
        ];
      }
      return {
        topic: 'Divisibility by 11', rank: L === 4 && s % 2 === 0 ? 18 : 19,
        text: `How many ${WORD[L]}-digit positive integers are multiples of 11 and have digits that add up to ${s}?`,
        answer: choices(d, count, wrongs),
        check: () => { let k = 0; for (let n = 11 * Math.ceil(10 ** (L - 1) / 11); n < 10 ** L; n += 11) if (digitSum(n) === s) k++; return k === count ? '' : `counted ${k}`; },
        solution: [L === 4
          ? 'Write the number as abcd; it is a multiple of 11 exactly when its alternating digit sum d − c + b − a is, that is, when (a + c) − (b + d) is a multiple of 11.'
          : 'Write the number as abcde; it is a multiple of 11 exactly when its alternating digit sum e − d + c − b + a is, that is, when (a + c + e) − (b + d) is a multiple of 11.', ...why].join(' '),
      };
    },
    // a block of digits written over and over: for 11 it matters whether the block has an even or an odd number of digits
    (d, ctx) => {
      const [B, M, K] = pick(ctx, 'eleven-block', [BLOCKS, [99, 33], [60, 80, 100, 120, 150, 200, 250, 300]], (B, M, K) => {
        const p = M / 11 / gcd(M / 11, digitSum(B)), q = B.length % 2 ? 2 : 11;
        return Number(B) % 11 !== 0 && p > 1 && Math.floor(K / (p * q)) >= 2 && Math.floor(K / (p * q)) <= 30;
      });
      const p0 = M / 11, s = digitSum(B), p = p0 / gcd(p0, s), even = B.length % 2 === 0, q = even ? 11 : 2, ans = Math.floor(K / (p * q)), t = alt(B);
      const tText = `${B.split('').reverse().map((c, i) => (i ? `${i % 2 ? '−' : '+'} ${c}` : c)).join(' ')} = ${ints(t)}`, tk = t === 1 ? 'k' : t === -1 ? '−k' : `${ints(t)}k`;
      return {
        topic: 'Divisibility by 11', rank: M === 99 ? 16 : 15,
        text: `Write the block of digits ${B} over and over: ${B}, ${B.repeat(2)}, ${B.repeat(3)}, and so on, so that the k-th number has k copies of ${B}. For how many k from 1 to ${K} is the k-th number a multiple of ${M}?`,
        answer: choices(d, ans, [Math.floor(K / p), Math.floor(K / q), Math.floor(K / (p * (even ? 2 : 11))), Math.floor(K / p) + Math.floor(K / q) - ans, Math.floor(K / M)].filter((v) => v > 0)),
        check: () => { let r = 0, hits = 0; for (let k = 1; k <= K; k++) { r = (r * 10 ** B.length + Number(B)) % M; if (r === 0) hits++; } return hits === ans ? '' : `counted ${hits}`; },
        solution: [
          `${M} = ${p0} · 11, and ${p0} and 11 share no factor, so the k-th number must be a multiple of both ${p0} and 11.`,
          `Each copy of ${B} adds ${s} to the digit sum, so the k-th number has digit sum ${s}k, which is a multiple of ${p0} exactly when k is a multiple of ${p}.`,
          even ? `For 11, use the alternating digit sum from the units digit. ${B} has an even number of digits, so every copy comes in with the same signs and adds ${tText}, and the total, ${tk}, is a multiple of 11 exactly when k is (11 doesn’t divide ${ints(t)}).`
            : `For 11, use the alternating digit sum from the units digit. ${B} has an odd number of digits, so the copies come in with signs that take turns, adding ${tText}, then ${ints(-t)}, then ${ints(t)}, and so on; they cancel in pairs, so the total is 0 when k is even and ${ints(t)}, not a multiple of 11, when k is odd.`,
          `So k must be a multiple of ${p} · ${q} = ${p * q}, and from 1 to ${K} there are <b>${ans}</b> of those.`,
        ].join(' '),
      };
    },
    // palindromes with an even number of digits are all multiples of 11, so only the other factor of 11m matters
    (d, ctx) => {
      const [L, m] = pick(ctx, 'eleven-pal', [[4, 6], [2, 3, 4, 5, 6, 7, 9, 13]]);
      const M = 11 * m, count = PAL[L][m], many = L === 4 ? 90 : 900;
      let lead0 = 0;   // the count if the first digit could be 0 too (a slip)
      for (let a = 0; a <= 9; a++) for (let b = 0; b <= 9; b++) for (let c = 0; c <= (L === 6 ? 9 : 0); c++) if ((L === 4 ? 1001 * a + 110 * b : 100001 * a + 10010 * b + 1100 * c) % M === 0) lead0++;
      return {
        topic: 'Divisibility by 11', rank: (L === 4 ? 15 : 16) + ([4, 6, 7, 13].includes(m) ? 1 : 0),
        text: `How many ${WORD[L]}-digit palindromes are multiples of ${M}? (A palindrome reads the same forwards and backwards, like ${d.pick((L === 4 ? ['3773', '5225', '8118', '4994', '6336', '2772'] : ['417714', '250052', '863368', '901109', '537735']).filter((x) => Number(x) % M))}.)`,
        answer: choices(d, count, [lead0, Math.round(many / m), Math.round(many / M), 2 * count, count + many / 10]),
        check: () => {
          let k = 0;
          for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) for (let c = 0; c <= (L === 6 ? 9 : 0); c++) if (Number(L === 4 ? `${a}${b}${b}${a}` : `${a}${b}${c}${c}${b}${a}`) % M === 0) k++;
          return k === count ? '' : `counted ${k}`;
        },
        solution: [
          L === 4 ? 'A four-digit palindrome abba is 1001a + 110b = 11 · (91a + 10b), so every one of them is a multiple of 11 (its alternating digit sum, a − b + b − a, is 0).'
            : 'A six-digit palindrome abccba is 100001a + 10010b + 1100c = 11 · (9091a + 910b + 100c), so every one of them is a multiple of 11 (its alternating digit sum is 0).',
          `So it is a multiple of ${M} = 11 · ${m} exactly when it is a multiple of ${m}, since 11 and ${m} share no factor.`,
          PAL_WHY[L][m],
          `So <b>${count}</b> of them are multiples of ${M}.`,
        ].join(' '),
      };
    },
  ],

  'Chinese remainders': [
    // the smallest number with three remainders, or the smallest with four digits: the sieve, biggest divisor first
    (d, ctx) => {
      const [ms, N0, ask] = pick(ctx, 'crt-least', [COPRIME, range(10, 503), ['least', 'four']], (ms, N) => {
        const rs = ms.map((m) => N % m);
        return N < lcmOf(ms) && N > ms[2] && rs.every((r) => r > 0) && new Set(rs).size > 1 && new Set(ms.map((m, i) => m - rs[i])).size > 1 && !(N === 23 && ms.join() === '3,5,7');   // (not the famous old 23)
      });
      const L = lcmOf(ms), rs = ms.map((m) => N0 % m), S = sieve(ms, N0), N4 = N0 + L * Math.ceil((1000 - N0) / L), value = ask === 'least' ? N0 : N4;
      const small = climb(rs[0], ms[0], (v) => v % ms[1] === rs[1]).at(-1);   // passes the two smallest tests only
      return {
        topic: 'Chinese remainders', rank: ask === 'least' ? 12 : 13,
        text: `What is the smallest ${ask === 'least' ? 'positive integer' : 'four-digit number'} that leaves ${remText(ms, N0)}?`,
        answer: choices(d, value, ask === 'least' ? [S.x, N0 + L, L - N0, total(rs), small] : [N4 - L, N4 + L, 1000 + N0, L * Math.ceil(1000 / L), N4 + ms[2]]),
        check: () => { const ok = passes(ms, rs), start = ask === 'least' ? 1 : 1000; for (let v = start; v < start + 2 * L; v++) if (ok(v)) return v === value ? '' : `the first is ${v}`; return 'none found'; },
        solution: `${S.text} So the numbers that work are ${ints(N0)}, ${ints(N0 + L)}, ${ints(N0 + 2 * L)}, …, one every lcm(${ms.join(', ')}) = ${L}. ` +
          (ask === 'least' ? `The smallest is <b>${ints(N0)}</b>.` : `${ints(N4 - L)} is still below 1,000, so the first of them with four digits is ${ints(N0)} + ${(N4 - N0) / L} · ${L} = <b>${ints(N4)}</b>.`),
      };
    },
    // how many below a bound: one every lcm, which is less than the product when the divisors share factors
    (d, ctx) => {
      const [ms, N0, B] = pick(ctx, 'crt-count', [SHARED, range(1, 359), [500, 1000, 1200, 1500, 2000, 2500, 3000]], (ms, N, B) => {
        const L = lcmOf(ms), rs = ms.map((m) => N % m), c = Math.floor((B - 1 - N) / L) + 1;
        return N < L && N > Math.max(...ms) && rs.every((r) => r > 0) && new Set(rs).size > 1 && c >= 6 && c <= 60;
      });
      const L = lcmOf(ms), P = ms[0] * ms[1] * ms[2], rs = ms.map((m) => N0 % m), S = sieve(ms, N0), c = Math.floor((B - 1 - N0) / L) + 1;
      return {
        topic: 'Chinese remainders', rank: 14,
        text: `How many positive integers less than ${ints(B)} leave ${remText(ms, N0)}?`,
        answer: choices(d, c, [c - 1, c + 1, Math.floor(B / L) === c ? c + 2 : Math.floor(B / L), Math.floor((B - 1 - N0) / P) + 1, Math.floor(B / P)].filter((v) => v > 0)),
        check: () => { const ok = passes(ms, rs); let k = 0; for (let v = 1; v < B; v++) if (ok(v)) k++; return k === c ? '' : `counted ${k}`; },
        solution: `${S.text} So the numbers that work are ${ints(N0)}, ${ints(N0 + L)}, ${ints(N0 + 2 * L)}, …, one every lcm(${ms.join(', ')}) = ${L}; that is not ${ms.join(' · ')} = ${ints(P)}, because the divisors share factors. ` +
          `The last one below ${ints(B)} is ${ints(N0)} + ${c - 1} · ${L} = ${ints(N0 + (c - 1) * L)}, since the next would be ${ints(N0 + c * L)}. Counting ${ints(N0)} itself as ${ints(N0)} + 0 · ${L}, that makes ${c - 1} + 1 = <b>${c}</b> of them.`,
      };
    },
    // a story: some leftovers told as how short the last group is, and a range that holds just one answer
    (d, ctx) => {
      const [ms, N, mask] = pick(ctx, 'crt-story', [COPRIME.filter((ms) => lcmOf(ms) >= 105), range(150, 950, 3), [1, 2, 3, 4, 5, 6]], (ms, N) => {
        const rs = ms.map((m) => N % m);
        return rs.every((r) => r > 0) && new Set(rs).size > 1 && N % 100 > 5 && N % 100 < 95;
      });
      const [things, thing, groups, group] = d.pick(STORY), name = d.pick(PEOPLE), lo = 100 * Math.floor(N / 100), hi = lo + 100, L = lcmOf(ms);
      const rs = ms.map((m) => N % m), short = ms.map((m, i) => ((mask >> i) & 1 ? m - rs[i] : 0)), S = sieve(ms, N);
      const misread = range(lo, lo + L).find(passes(ms, ms.map((m, i) => (short[i] ? short[i] % m : rs[i])))) ?? 0;   // reading "2 short" as 2 left over
      const lines = ms.map((m, i) => (short[i] ? `In ${groups} of ${m}, the last ${group} is ${short[i]} ${short[i] === 1 ? thing : things} short.`
        : `In ${groups} of ${m}, ${rs[i]} ${rs[i] === 1 ? `${thing} is` : `${things} are`} left over.`));
      const told = ms.map((m, i) => [m, short[i], rs[i]]).filter(([, s]) => s);
      return {
        topic: 'Chinese remainders', rank: 13,
        text: `${name} has between ${lo} and ${hi} ${things} and tries putting them in equal ${groups} three ways. ${lines.join(' ')} How many ${things} does ${name} have?`,
        answer: choices(d, N, [misread, S.N0, N - L, N + L].filter((v) => v > 0)),
        check: () => {
          const fits = range(lo, hi).filter((v) => ms.every((m, i) => (short[i] ? (v + short[i]) % m === 0 : v % m === rs[i])));
          return fits.length === 1 && fits[0] === N ? '' : `fits: ${fits.join(', ')}`;
        },
        solution: `${told.map(([m, s, r]) => `Being ${s} short in ${groups} of ${m} means ${s} more would fill the last ${group}, so the number leaves a remainder of ${m} − ${s} = ${r} when divided by ${m}.`).join(' ')} ${S.text} ` +
          `So the possible numbers are ${ints(S.N0)}, ${ints(S.N0 + L)}, ${ints(S.N0 + 2 * L)}, …, one every ${L}, and the only one between ${lo} and ${hi} is <b>${ints(N)}</b>.`,
      };
    },
    // the sum of all of them below a bound: an arithmetic series whose step is the lcm
    (d, ctx) => {
      const [ms, N0, B] = pick(ctx, 'crt-sum', [[...SHARED, ...COPRIME], range(1, 250), [200, 250, 300, 400, 500, 600, 800, 1000]], (ms, N, B) => {
        const L = lcmOf(ms), rs = ms.map((m) => N % m), c = Math.floor((B - 1 - N) / L) + 1;
        return N < L && N > Math.max(...ms) && rs.every((r) => r > 0) && new Set(rs).size > 1 && c >= 3 && c <= 8;
      });
      const L = lcmOf(ms), P = ms[0] * ms[1] * ms[2], shared = L < P, rs = ms.map((m) => N0 % m), S = sieve(ms, N0);
      const c = Math.floor((B - 1 - N0) / L) + 1, terms = range(0, c - 1).map((j) => N0 + j * L), last = terms.at(-1), sum = (c * (N0 + last)) / 2;
      const byP = range(0, Math.floor((B - 1 - N0) / P)).reduce((s, j) => s + N0 + j * P, 0);   // stepping by the product instead
      return {
        topic: 'Chinese remainders', rank: shared ? 16 : 15,
        text: `What is the sum of all positive integers less than ${ints(B)} that leave ${remText(ms, N0)}?`,
        answer: choices(d, sum, [sum - last, sum + last + L, c * N0, c * (N0 + last), byP, c * last].filter((v) => v > 0)),
        check: () => { const ok = passes(ms, rs); let s = 0; for (let v = 1; v < B; v++) if (ok(v)) s += v; return s === sum ? '' : `added up to ${s}`; },
        solution: `${S.text} So the numbers that work are ${ints(N0)}, ${ints(N0 + L)}, ${ints(N0 + 2 * L)}, …, one every lcm(${ms.join(', ')}) = ${L}${shared ? ` (not ${ms.join(' · ')} = ${ints(P)}, since the divisors share factors)` : ''}. ` +
          `Below ${ints(B)} they are ${listing(terms.map(ints))}, which is ${c} numbers going up in equal steps, so their sum is ${c} · (${ints(N0)} + ${ints(last)})/2 = <b>${ints(sum)}</b>.`,
      };
    },
  ],

  'Fractions in lowest terms': [
    // how many of k/n are in lowest terms, or can be simplified: inclusion and exclusion over the primes of n
    (d, ctx) => {
      const [n, ask] = pick(ctx, 'phi-count', [THREE, ['lowest', 'simplified']]);
      const [p, q, r] = primesOf(n), f = phi(n), firstStep = n - n / p - n / q - n / r, missLast = firstStep + n / (p * q) + n / (p * r) + n / (q * r);
      const value = ask === 'lowest' ? f : n - 1 - f;
      const ie = `${ints(n)} − (${n / p} + ${n / q} + ${n / r}) + (${n / (p * q)} + ${n / (p * r)} + ${n / (q * r)}) − ${n / (p * q * r)}`;
      return {
        topic: 'Fractions in lowest terms', rank: 15,
        text: `How many of the fractions ${fr(1, ints(n))}, ${fr(2, ints(n))}, ${fr(3, ints(n))}, …, ${fr(ints(n - 1), ints(n))} ${ask === 'lowest' ? 'are already in lowest terms' : 'can be simplified, that is, written with a smaller denominator'}?`,
        answer: choices(d, value, ask === 'lowest' ? [n - 1 - f, firstStep, missLast, (p - 1) * (q - 1) * (r - 1), f + 1] : [f, n - f, n - 1 - missLast, n / p + n / q + n / r, n - 1 - (p - 1) * (q - 1) * (r - 1)]),
        check: () => { let k = 0; for (let j = 1; j < n; j++) if (gcd(j, n) === 1) k++; return (ask === 'lowest' ? k : n - 1 - k) === value ? '' : `counted ${k} in lowest terms`; },
        solution: [
          `The fraction k/${ints(n)} is in lowest terms exactly when k shares no prime factor with ${ints(n)} = ${shown(n)}, that is, when k is a multiple of none of ${p}, ${q} and ${r}.`,
          `Counting from 1 to ${ints(n)} with inclusion and exclusion (take away the multiples of each prime, put back the multiples of each pair, take away the multiples of all three) leaves ${ie} = ${ints(f)}.`,
          `That is Euler’s φ(${ints(n)}) = ${ints(n)} · ${oneMinus(n)} = ${ints(f)}, and k = ${ints(n)} itself was never counted, being a multiple of all three.`,
          ask === 'lowest' ? `So <b>${ints(f)}</b> of the fractions are in lowest terms.` : `So ${ints(f)} of the ${ints(n - 1)} fractions are in lowest terms, and the other ${ints(n - 1)} − ${ints(f)} = <b>${ints(value)}</b> can be simplified.`,
        ].join(' '),
      };
    },
    // the sum of the fractions in lowest terms with denominator n: pair k with n − k
    (d, ctx) => {
      const [n, a] = pick(ctx, 'phi-sum', [PAIRED, [0, 1, 2]]);
      const f = phi(n), ans = [f * (2 * a + 1), 2];
      return {
        topic: 'Fractions in lowest terms', rank: a ? 17 : 16,
        text: `What is the sum of all the fractions between ${a} and ${a + 1} that have denominator ${n} when written in lowest terms?`,
        answer: choices(d, ans, [[(2 * a + 1) * (n - 1), 2], [f * (a + 1), 1], [f, 1], [f * (2 * a + 1), 1], [f * (2 * a + 1) + 2, 2], ...(a ? [[a * f, 1], [f, 2]] : [[f + 2, 2], [f - 2, 2]])], showFrac),
        check: () => { let top = 0; for (let k = 1; k < n; k++) if (gcd(k, n) === 1) top += a * n + k; return top * ans[1] === ans[0] * n ? '' : `added up to ${top}/${n}`; },
        solution: [
          `Such a fraction is ${a ? `${a} + ` : ''}k/${n} with 0 &lt; k &lt; ${n}, where k shares no factor with ${n} = ${shown(n)}; there are φ(${n}) = ${n} · ${oneMinus(n)} = ${f} of them.`,
          `Pair each k with ${n} − k, which also shares no factor with ${n}; the two fractions k/${n} and (${n} − k)/${n} add up to 1.`,
          `No k is its own partner (k = ${n}/2 ${n % 2 ? 'is not a whole number' : `shares the factor ${n / 2} with ${n}`}), so the ${f} fractions k/${n} make ${f / 2} pairs and add up to ${f / 2}.`,
          a ? `Each fraction also has ${a} in front of the k/${n}, which adds ${a} · ${f} = ${a * f}, so the sum is ${a * f} + ${f / 2} = <b>${showFrac(ans)}</b>.` : `So the sum is <b>${showFrac(ans)}</b>.`,
        ].join(' '),
      };
    },
    // fractions a/b with 1 ≤ a < b ≤ N: how many are in lowest terms, how many different values, how many values below ½
    (d, ctx) => {
      const [N, ask] = pick(ctx, 'phi-values', [range(8, 20), ['lowest', 'all', 'half']]);
      const ph = range(2, N).map(phi), S = total(ph), value = ask === 'half' ? (S - 1) / 2 : S;
      const pairs = total(range(2, N).map((b) => Math.floor((b - 1) / 2)));   // pairs with 2a < b, before reducing
      const lowest = ask === 'lowest';
      return {
        topic: 'Fractions in lowest terms', rank: { lowest: 17, all: 18, half: 19 }[ask],
        text: lowest ? `How many of the fractions ${fr('a', 'b')} with whole numbers 1 ≤ a &lt; b ≤ ${N} are in lowest terms?`
          : `How many different values ${ask === 'all' ? '' : `less than ${frac(1, 2)} `}does the fraction ${fr('a', 'b')} take, where a and b are whole numbers with 1 ≤ a &lt; b ≤ ${N}?`,
        answer: choices(d, value, ask === 'half' ? [pairs, (S + 1) / 2, value - 1, value + phi(N) / 2, Math.floor(choose(N, 2) / 2)] : [choose(N, 2), S + 1, S - phi(N), S + phi(N + 1), S - 1]),
        check: () => {
          let k = 0;
          const seen = new Set();
          for (let b = 2; b <= N; b++) for (let a = 1; a < b; a++) {
            const g = gcd(a, b);
            if (g === 1) k++;
            if (ask === 'all' || 2 * a < b) seen.add(`${a / g}/${b / g}`);
          }
          return (lowest ? k : seen.size) === value ? '' : `found ${lowest ? k : seen.size}`;
        },
        solution: [
          lowest ? 'A fraction a/b is in lowest terms exactly when a and b share no factor, so count them one denominator at a time.'
            : `Each value of a/b can be written in lowest terms in exactly one way, so count only the fractions already in lowest terms (like ${frac(1, 2)}) and skip the others (like ${fr(2, 4)}, which is ${frac(1, 2)} again).`,
          `For a denominator b, the numerators a &lt; b that share no factor with b number φ(b)${lowest ? ', which is b − 1 when b is prime' : ''}.`,
          `Adding φ(b) for b = 2 to ${N} gives ${ph.join(' + ')} = ${S}.`,
          ask === 'half' ? `Pairing a/b with (b − a)/b, also in lowest terms, matches each value below ${frac(1, 2)} with one above it, and ${frac(1, 2)} is the only value left over. So (${S} − 1)/2 = <b>${value}</b> of the values are less than ${frac(1, 2)}.`
            : lowest ? `So <b>${S}</b> of the fractions are in lowest terms.` : `So the fraction takes <b>${S}</b> different values.`,
        ].join(' '),
      };
    },
    // how many k ≤ n have gcd(k, n) = g, or reduce to denominator n/g: φ(n/g)
    (d, ctx) => {
      const [n, g, ask] = pick(ctx, 'phi-gcd', [MANY, [2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 15, 18, 20, 24, 30], ['gcd', 'denominator']],
        (n, g) => n % g === 0 && n / g >= 12 && factor(n / g).length >= 2 && factor(n / g).length <= 3);
      const e = n / g, f = phi(e), N = ints(n);
      return {
        topic: 'Fractions in lowest terms', rank: ask === 'gcd' ? 16 : 17,
        text: ask === 'gcd' ? `How many integers k with 1 ≤ k ≤ ${N} have gcd(k, ${N}) = ${g}?`
          : `Each of the ${N} fractions ${fr(1, N)}, ${fr(2, N)}, ${fr(3, N)}, …, ${fr(N, N)} is written in lowest terms. How many of them then have denominator ${e}?`,
        answer: choices(d, f, [e, e - 1, phi(g), e - e / primesOf(e)[0], phi(n) / g, phi(n) / phi(g)].filter(Number.isInteger)),
        check: () => { let k = 0; for (let j = 1; j <= n; j++) if (ask === 'gcd' ? gcd(j, n) === g : n / gcd(j, n) === e) k++; return k === f ? '' : `counted ${k}`; },
        solution: (ask === 'gcd' ? [
          `If gcd(k, ${N}) = ${g}, then k is a multiple of ${g}, say k = ${g}j, with j from 1 to ${N}/${g} = ${e}.`,
          `Then gcd(k, ${N}) = ${g} · gcd(j, ${e}), which is exactly ${g} when j shares no factor with ${e} = ${shown(e)}.`,
          `The number of such j is φ(${e}) = ${e} · ${oneMinus(e)} = <b>${f}</b>.`,
        ] : [
          `In lowest terms k/${N} is (k ÷ h)/(${N} ÷ h), where h = gcd(k, ${N}), so its denominator is ${e} exactly when h = ${N}/${e} = ${g}.`,
          `Then k = ${g}j with j from 1 to ${e}, the fraction is j/${e}, and that is already in lowest terms exactly when j shares no factor with ${e} = ${shown(e)}.`,
          `So the count is φ(${e}) = ${e} · ${oneMinus(e)} = <b>${f}</b>.`,
        ]).join(' '),
      };
    },
  ],

  'GCD of expressions': [
    // the largest gcd of a quadratic and n + b: the gcd always divides the remainder, the value at n = −b
    (d, ctx) => {
      const [p, q, b] = pick(ctx, 'gcd-max', [range(-4, 5), range(1, 45), range(1, 7)], (p, q, b) => { const D = b * b - p * b + q; return D >= 15 && D <= 150 && D > b + 1; });
      const D = b * b - p * b + q, P = poly([[1, 2], [p, 1], [q, 0]]), n0 = D - b, v0 = n0 * n0 + p * n0 + q;
      return {
        topic: 'GCD of expressions', rank: p ? 16 : 15,
        text: `As n runs through the positive integers, what is the largest value that gcd(${P}, n + ${b}) can take?`,
        answer: choices(d, D, [b * b + p * b + q, q, b * b + q, n0, gcd(1 + p + q, 1 + b), D + b].filter((v) => v > 0)),
        // the gcd depends only on n's remainder by the (at most 150) number it divides, so n up to 1,000 meets every value
        check: () => { let best = 0; for (let n = 1; n <= 1000; n++) best = Math.max(best, gcd(n * n + p * n + q, n + b)); return best === D ? '' : `the largest found is ${best}`; },
        solution: [
          `Dividing ${P} by n + ${b} gives ${P} = ${p === b ? `n(n + ${b})` : `(n + ${b})(${poly([[1, 1], [p - b, 0]])})`} + ${D}.`,
          `So any common divisor of ${P} and n + ${b} also divides ${D}, and the gcd is always a divisor of ${D}.`,
          `It can be ${D} itself, because when n + ${b} = ${D}, that is n = ${n0}, the value ${P} = ${ints(v0)} = ${ints(v0 / D)} · ${D} is a multiple of ${D} too.`,
          `So the largest value is <b>${D}</b>.`,
        ].join(' '),
      };
    },
    // all the values gcd(an + b, cn + e) can take: divisors of cb − ae, but none with the factor a and c share
    (d, ctx) => {
      const [P] = pick(ctx, 'gcd-values', [gcdPairs()]);
      const { p, a, b, c, e, h, D, m, at } = P, E1 = poly([[a, 1], [b, 0]]), E2 = poly([[c, 1], [e, 0]]), vals = divisors(m), ans = sigma(m);
      const [x, y] = [c / h, a / h], times = (k, E) => `${k === 1 ? '' : k}(${E})`;
      return {
        topic: 'GCD of expressions', rank: 18,
        text: `As n runs through the positive integers, gcd(${E1}, ${E2}) takes only a few different values. What is the sum of all the values it can take?`,
        answer: choices(d, ans, [sigma(D), D, m, ans - 1, sigma(D) - ans]),
        // the gcd divides a number of at most 160, so it depends only on n's remainder by that: n up to 2,000 meets every value
        check: () => { const seen = new Set(); for (let n = 1; n <= 2000; n++) seen.add(gcd(a * n + b, c * n + e)); return total([...seen]) === ans ? '' : `found ${[...seen].join(', ')}`; },
        solution: [
          `Call the gcd g; it divides both numbers, so it also divides ${times(x, E1)} − ${times(y, E2)} = ${ints(x * b)} − ${ints(y * e)} = ${ints(x * b - y * e)}, which makes g a divisor of ${D} = ${shown(D)}.`,
          p === 2 ? `But ${E1} is always odd (${a}n is even and ${b} is odd), so g is odd, and it divides ${m}.` : `But ${E1} is never a multiple of 3 (${a}n is a multiple of 3 and ${b} is not), so g has no factor 3, and it divides ${m}.`,
          `Each divisor of ${m} really happens, since ${listing(vals.map((v) => `n = ${at.get(v)} gives ${v}`))}.`,
          `So the possible values are ${listing(vals)}, and their sum is <b>${ans}</b>.`,
        ].join(' '),
      };
    },
    // how many n make gcd(n² + c, n + b) bigger than 1 (or equal to 1): it is gcd(b² + c, n + b)
    (d, ctx) => {
      const [b, K, N, ask] = pick(ctx, 'gcd-share', [[1, 2, 3], KS, NS, ['more', 'one']], (b, K, N) => K - b * b >= 2 && N % rad(K) === 0 && primesOf(K).length >= 2);
      const c = K - b * b, P = poly([[1, 2], [c, 0]]), ps = primesOf(K), cop = (N / rad(K)) * ps.reduce((x, p) => x * (p - 1), 1), value = ask === 'more' ? N - cop : cop;
      const slip = (k) => range(1, N).filter((n) => gcd(k, n + b) > 1).length;   // the count if the gcd were taken with k instead
      const sumOf = total(ps.map((p) => N / p));
      return {
        topic: 'GCD of expressions', rank: ps.length > 2 ? 19 : 18,
        text: `For how many positive integers n ≤ ${N} is gcd(${P}, n + ${b}) ${ask === 'more' ? 'greater than 1' : 'equal to 1'}?`,
        answer: choices(d, value, (ask === 'more' ? [cop, sumOf, slip(c), N / ps[0], c !== b * b ? slip(Math.abs(c - b * b)) : N - 1] : [N - cop, N - sumOf, N - slip(c), N - N / ps[0], c !== b * b ? N - slip(Math.abs(c - b * b)) : 1]).filter((v) => v > 0)),
        check: () => { let k = 0; for (let n = 1; n <= N; n++) if (gcd(n * n + c, n + b) > 1) k++; return (ask === 'more' ? k : N - k) === value ? '' : `counted ${k} with gcd above 1`; },
        solution: [
          `Since ${P} = (n + ${b})(n − ${b}) + ${K}, a number divides both ${P} and n + ${b} exactly when it divides both n + ${b} and ${K}, so gcd(${P}, n + ${b}) = gcd(${K}, n + ${b}).`,
          `That gcd is 1 exactly when n + ${b} shares no prime factor with ${K} = ${shown(K)}, that is, when n + ${b} is a multiple of ${ps.length === 2 ? `neither ${ps[0]} nor ${ps[1]}` : `none of ${listing(ps)}`}.`,
          `As n goes from 1 to ${N}, n + ${b} runs through the ${N} whole numbers from ${b + 1} to ${N + b}, and since ${N} is a multiple of ${rad(K)}, exactly ${N} · ${oneMinus(K)} = ${cop} of them share no factor with ${K}.`,
          ask === 'more' ? `So the gcd is greater than 1 for ${N} − ${cop} = <b>${value}</b> values of n.` : `So the gcd is 1 for <b>${value}</b> values of n.`,
        ].join(' '),
      };
    },
    // consecutive terms of n² + k: their gcd divides 4k + 1, and reaches it at n = 2k
    (d, ctx) => {
      const [k, ask] = pick(ctx, 'gcd-next', [range(6, 60), ['max', 'first']]);
      const T = 4 * k + 1, value = ask === 'max' ? T : 2 * k;
      return {
        topic: 'GCD of expressions', rank: ask === 'max' ? 18 : 19,
        text: `For each positive integer n, let a(n) = n<sup>2</sup> + ${k} and d(n) = gcd(a(n), a(n + 1)). ${ask === 'max' ? 'What is the largest value that d(n) can take?' : 'What is the smallest n for which d(n) is as large as it can ever be?'}`,
        answer: choices(d, value, ask === 'max' ? [2 * k + 1, 4 * k - 1, k, k + 1, 4 * k + 3, 2 * k] : [k, 2 * k + 1, 4 * k, T, 2 * k - 1]),
        check: () => {
          let best = 0, at = 0;
          for (let n = 1; n <= 1000; n++) { const g = gcd(n * n + k, (n + 1) ** 2 + k); if (g > best) { best = g; at = n; } }   // 4k + 1 ≤ 237, so every remainder comes up
          return (ask === 'max' ? best : at) === value ? '' : `largest ${best}, first at n = ${at}`;
        },
        solution: [
          'A common divisor of a(n) and a(n + 1) divides their difference, a(n + 1) − a(n) = 2n + 1.',
          `It then also divides 4a(n) − (2n − 1)(2n + 1) = (4n<sup>2</sup> + ${4 * k}) − (4n<sup>2</sup> − 1) = ${T}, so d(n) is always a divisor of ${T}.`,
          `For n = ${2 * k}, 2n + 1 = ${T} and a(n) = ${ints(4 * k * k + k)} = ${k} · ${T}, so a(n) and a(n + 1) = a(n) + 2n + 1 are both multiples of ${T}, and d(${2 * k}) = ${T}.`,
          ask === 'max' ? `So the largest value is <b>${T}</b>.` : `No smaller n can do it, because d(n) = ${T} needs ${T} to divide 2n + 1, so 2n + 1 ≥ ${T}. So the answer is <b>${2 * k}</b>.`,
        ].join(' '),
      };
    },
  ],

  'Whole-number fractions': [
    // how many integers n make (n² + an + b)/(n + c) whole: n + c must divide the remainder
    (d, ctx) => {
      const [a, b, c] = pick(ctx, 'whole-count', [range(-6, 7), range(-30, 40), [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]], (a, b, c) => {
        const R = Math.abs(c * c - a * c + b), R2 = Math.abs(c * c + a * c + b);
        return b !== 0 && a !== 0 && R >= 6 && R <= 72 && divisors(R).length >= 4 && divisors(R).length <= 9 && R2 > 0 && R2 !== R;
      });
      const R = c * c - a * c + b, Ra = Math.abs(R), t = divisors(Ra).length, top = poly([[1, 2], [a, 1], [b, 0]]), bot = poly([[1, 1], [c, 0]]), quot = poly([[1, 1], [a - c, 0]]);
      const sign = R > 0 ? '+' : '−', pos = divisors(Ra).filter((e) => e - c >= 1).length, R2 = Math.abs(c * c + a * c + b);
      return {
        topic: 'Whole-number fractions', rank: 14,
        text: `For how many integers n (positive, negative or zero) is ${fr(top, bot)} an integer?`,
        answer: choices(d, 2 * t, [t, 2 * divisors(R2).length, pos, 2 * t - 1, 2 * t + 2]),
        check: () => {
          // n + c has to divide the remainder, which is at most 72 in size, so every n with |n + c| ≤ 1,000 covers all cases
          let k = 0;
          for (let n = -1000 - c; n <= 1000 - c; n++) if (n + c !== 0 && (n * n + a * n + b) % (n + c) === 0) k++;
          return k === 2 * t ? '' : `counted ${k}`;
        },
        solution: [
          `Long division gives ${top} = (${bot})(${quot}) ${sign} ${Ra}, so the fraction equals ${quot} ${sign} ${fr(Ra, bot)}.`,
          `That is an integer exactly when ${bot} divides ${Ra}.`,
          `${Ra} has ${t} positive divisors (${listing(divisors(Ra))}), and ${bot} can equal any of them or any of their negatives, each choice giving one n.`,
          `So there are 2 · ${t} = <b>${2 * t}</b> integers n.`,
        ].join(' '),
      };
    },
    // the sum of all those n: the divisors pair up as e and −e, and each pair of n adds up to −2c
    (d, ctx) => {
      const [a, b, c] = pick(ctx, 'whole-sum', [range(-6, 7), range(-30, 40), [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6]], (a, b, c) => {
        const R = Math.abs(c * c - a * c + b);
        return b !== 0 && R >= 6 && R <= 60 && divisors(R).length >= 3 && divisors(R).length <= 8;
      });
      const R = c * c - a * c + b, Ra = Math.abs(R), divs = divisors(Ra), t = divs.length, top = poly([[1, 2], [a, 1], [b, 0]]), bot = poly([[1, 1], [c, 0]]), quot = poly([[1, 1], [a - c, 0]]);
      const sign = R > 0 ? '+' : '−', sum = -2 * c * t, shift = `${c > 0 ? '−' : '+'} ${Math.abs(c)}`;
      return {
        topic: 'Whole-number fractions', rank: 16,
        text: `What is the sum of all integers n for which ${fr(top, bot)} is an integer?`,
        answer: choices(d, sum, [total(divs) - c * t, 2 * c * t, -c * t, 0, -2 * c * (t - 1), total(divs)]),
        check: () => {
          // as before, |n + c| can't be more than the remainder (at most 60), so this range holds every such n
          let s = 0;
          for (let n = -1000 - c; n <= 1000 - c; n++) if (n + c !== 0 && (n * n + a * n + b) % (n + c) === 0) s += n;
          return s === sum ? '' : `added up to ${s}`;
        },
        solution: [
          `Long division gives ${top} = (${bot})(${quot}) ${sign} ${Ra}, so the fraction equals ${quot} ${sign} ${fr(Ra, bot)}, an integer exactly when ${bot} divides ${Ra}.`,
          `So ${bot} must be one of the ${2 * t} divisors ${divs.map((v) => `±${v}`).join(', ')}.`,
          `They pair up as e and −e, which give n = e ${shift} and n = −e ${shift}, and each such pair of n adds up to ${ints(-2 * c)}.`,
          `There are ${t} pairs, so the sum is ${t} · ${c > 0 ? `(${ints(-2 * c)})` : ints(-2 * c)} = <b>${ints(sum)}</b>.`,
        ].join(' '),
      };
    },
    // positive n making (an + b)/(cn + k) whole: cn + k divides the remainder, is big enough, and has the right remainder mod c
    (d, ctx) => {
      const [c, m, k, R] = pick(ctx, 'whole-linear', [[1, 2, 3], [1, 2, 3, 4], range(1, 9), [24, 30, 36, 40, 42, 45, 48, 54, 56, 60, 63, 66, 70, 72, 80, 84, 90, 96, 100, 105]], (c, m, k, R) => {
        if (gcd(c, k) !== 1) return false;
        const good = divisors(R).filter((e) => e >= c + k && (e - k) % c === 0).length, big = divisors(R).filter((e) => e >= c + k).length;
        return good >= 2 && (c === 1 || big > good) && divisors(R).length > good + 1;
      });
      const top = poly([[c * m, 1], [R + m * k, 0]]), bot = poly([[c, 1], [k, 0]]), divs = divisors(R);
      const good = divs.filter((e) => e >= c + k && (e - k) % c === 0), ns = good.map((e) => (e - k) / c);
      return {
        topic: 'Whole-number fractions', rank: c === 1 ? 13 : 15,
        text: `For how many positive integers n is ${fr(top, bot)} an integer?`,
        answer: choices(d, ns.length, [divs.length, divs.filter((e) => e >= c + k).length, divs.filter((e) => (e - k) % c === 0).length, ns.length + 1, ns.length - 1].filter((v) => v > 0)),
        check: () => {
          // cn + k must divide the remainder (at most 105), so n is at most 105: trying n up to 1,000 covers every case
          let count = 0;
          for (let n = 1; n <= 1000; n++) if ((c * m * n + R + m * k) % (c * n + k) === 0) count++;
          return count === ns.length ? '' : `counted ${count}`;
        },
        solution: [
          `Since ${top} = ${m === 1 ? '' : m}(${bot}) + ${R}, the fraction equals ${m} + ${fr(R, bot)}, an integer exactly when ${bot} divides ${R}.`,
          c === 1 ? `For positive n, n + ${k} is at least ${k + 1}, so it must be a divisor of ${R} = ${shown(R)} bigger than ${k}, and those are ${listing(good)}.`
            : c === 2 ? `For positive n, ${bot} is odd and at least ${c + k}, so it must be an odd divisor of ${R} = ${shown(R)} that is at least ${c + k}, and those are ${listing(good)}.`
              : `For positive n, ${bot} is at least ${c + k} and leaves a remainder of ${k % 3} when divided by 3, so it must be a divisor of ${R} = ${shown(R)} like that, and those are ${listing(good)}.`,
          `These give n = ${listing(ns)}, so there are <b>${ns.length}</b> such n.`,
        ].join(' '),
      };
    },
    // n + k dividing n³ + m: n³ + k³ is a multiple of n + k, so n + k divides k³ − m
    (d, ctx) => {
      const [k, m, ask] = pick(ctx, 'whole-cube', [range(2, 9), range(-60, 90), ['largest', 'count']], (k, m, ask) => {
        const D = Math.abs(k ** 3 - m);
        return m !== 0 && D >= 20 && D <= 900 && (ask === 'largest' || (divisors(D).filter((e) => e > k).length >= 3 && divisors(D).length <= 16));
      });
      const D = Math.abs(k ** 3 - m), P = poly([[1, 3], [m, 0]]), good = divisors(D).filter((e) => e > k), value = ask === 'largest' ? D - k : good.length;
      const flip = Math.abs(k ** 3 + m);   // the slip of using n = k instead of n = −k
      return {
        topic: 'Whole-number fractions', rank: ask === 'largest' ? 16 : 17,
        text: ask === 'largest' ? `What is the largest positive integer n for which n + ${k} divides ${P}?` : `For how many positive integers n does n + ${k} divide ${P}?`,
        answer: choices(d, value, ask === 'largest' ? [flip - k, D, D + k, Math.abs(m) - k, (D / 2) - k].filter((v) => Number.isInteger(v) && v > 0)
          : [divisors(D).length, good.length + 1, good.length - 1, flip ? divisors(flip).filter((e) => e > k).length : 0].filter((v) => v > 0)),
        check: () => {
          // n + k must divide k³ − m (at most 900 in size), so n is below 900: trying n up to 2,000 covers every case
          const ns = range(1, 2000).filter((n) => (n ** 3 + m) % (n + k) === 0);
          return (ask === 'largest' ? ns.at(-1) : ns.length) === value ? '' : `found ${ns.join(', ')}`;
        },
        solution: [
          `The sum of cubes n<sup>3</sup> + ${k ** 3} = (n + ${k})(${poly([[1, 2], [-k, 1], [k * k, 0]])}) is always a multiple of n + ${k}, so n + ${k} divides ${P} exactly when it divides the difference (n<sup>3</sup> + ${k ** 3}) − (${P}) = ${ints(k ** 3 - m)}.`,
          ask === 'largest' ? `So n + ${k} must be a divisor of ${D}, and the largest divisor of ${D} is ${D} itself.` : `So n + ${k} must be a divisor of ${D} = ${shown(D)}.`,
          ask === 'largest' ? `So the largest n has n + ${k} = ${D}, that is, n = <b>${D - k}</b>.`
            : `Since n ≥ 1, n + ${k} is bigger than ${k}, which leaves the divisors ${listing(good)}. Each gives one n, so there are <b>${good.length}</b>.`,
        ].join(' '),
      };
    },
  ],

  'Numbering a grid two ways': [
    // rows against columns: row i, column j match when (c − 1)i = (r − 1)j, which happens gcd(r − 1, c − 1) + 1 times
    (d, ctx) => {
      const [r, c] = pick(ctx, 'grid-count', [range(4, 24), range(5, 40)], (r, c) => { const g = gcd(r - 1, c - 1); return r < c && g >= 3 && g <= 12 && r * c <= 900 && gcd(r, c) !== g; });
      const g = gcd(r - 1, c - 1), u = (r - 1) / g, v = (c - 1) / g, [P, Q] = d.pick(DUOS);
      return {
        topic: 'Numbering a grid two ways', rank: 18,
        text: `A grid of squares has ${r} rows and ${c} columns. ${byRows(P, r, c)} ${byCols(Q, r)} In how many squares do ${P} and ${Q} write the same number?`,
        answer: choices(d, g + 1, [g, gcd(r, c) + 1, gcd(r, c), 2, g + 2, g - 1].filter((x) => x > 0)),
        check: () => { const k = sameCount(r, c, (i, j) => r * j + i + 1); return k === g + 1 ? '' : `counted ${k}`; },
        solution: [
          `Number the rows 0 to ${r - 1} from the top and the columns 0 to ${c - 1} from the left, so that the square in row i and column j gets ${c}i + j + 1 from ${P} and ${r}j + i + 1 from ${Q}.`,
          `These are equal exactly when ${c}i + j = ${r}j + i, that is, ${c - 1}i = ${r - 1}j.`,
          `Dividing by gcd(${c - 1}, ${r - 1}) = ${g} gives ${co(v, 'i')} = ${co(u, 'j')}, ${u === 1 ? `so i = t and j = ${co(v, 't')}` : v === 1 ? `so i is a multiple of ${u}, say i = ${u}t, and then j = t` : `and since ${v} and ${u} share no factor, i is a multiple of ${u}, say i = ${u}t, and then j = ${v}t`} for a whole number t.`,
          `Row ${co(u, 't')} must be at most ${r - 1}${u === 1 ? '' : ` = ${u} · ${g}`}, so t can be ${run(0, g)}, and that is <b>${g + 1}</b> squares.`,
        ].join(' '),
      };
    },
    // the sum of the matching numbers: they go up in equal steps from 1 to rc
    (d, ctx) => {
      const [r, c] = pick(ctx, 'grid-sum', [range(4, 24), range(5, 40)], (r, c) => { const g = gcd(r - 1, c - 1); return r < c && g >= 2 && g <= 10 && r * c <= 600; });
      const g = gcd(r - 1, c - 1), u = (r - 1) / g, v = (c - 1) / g, step = (r * c - 1) / g, sum = ((g + 1) * (r * c + 1)) / 2, [P, Q] = d.pick(DUOS);
      return {
        topic: 'Numbering a grid two ways', rank: 20,
        text: `A grid of squares has ${r} rows and ${c} columns. ${byRows(P, r, c)} ${byCols(Q, r)} In some squares ${P} and ${Q} write the same number. What is the sum of the numbers in those squares?`,
        answer: choices(d, sum, [(g * (r * c + 1)) / 2, ((g + 1) * r * c) / 2, ((g + 2) * (r * c + 1)) / 2, (g + 1) * (r * c + 1), ((g - 1) * (r * c + 1)) / 2].filter((x) => Number.isInteger(x) && x > 0)),
        check: () => { let s = 0; for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) if (c * i + j + 1 === r * j + i + 1) s += c * i + j + 1; return s === sum ? '' : `added up to ${s}`; },
        solution: [
          `Number the rows 0 to ${r - 1} from the top and the columns 0 to ${c - 1} from the left, so that the square in row i and column j gets ${c}i + j + 1 from ${P} and ${r}j + i + 1 from ${Q}; these match when ${c - 1}i = ${r - 1}j.`,
          `Dividing by gcd(${c - 1}, ${r - 1}) = ${g} gives ${co(v, 'i')} = ${co(u, 'j')}, so i = ${co(u, 't')} and j = ${co(v, 't')} for t = ${run(0, g)}, and the number there is ${c} · ${co(u, 't')} + ${co(v, 't')} + 1 = ${co(step, 't')} + 1.`,
          `These ${g + 1} numbers go up in equal steps of ${step} from 1 to ${ints(r * c)}, so their average is (1 + ${ints(r * c)})/2 = ${frac(r * c + 1, 2)}.`,
          `Their sum is ${g + 1} · ${frac(r * c + 1, 2)} = <b>${ints(sum)}</b>.`,
        ].join(' '),
      };
    },
    // the second numbering goes up each column from the bottom, or starts from the right-hand column
    (d, ctx) => {
      const [r, c, way] = pick(ctx, 'grid-other', [range(4, 24), range(5, 40), ['bottom', 'right']], (r, c, way) => {
        const g = way === 'bottom' ? gcd(c + 1, r - 1) : gcd(r + 1, c - 1);
        return r !== c && g >= 3 && g <= 11 && r * c <= 900 && gcd(r - 1, c - 1) + 1 !== g - 1;
      });
      const [P, Q] = d.pick(DUOS), up = way === 'bottom';
      const g = up ? gcd(c + 1, r - 1) : gcd(r + 1, c - 1), u = up ? (r - 1) / g : (r + 1) / g, v = up ? (c + 1) / g : (c - 1) / g;
      const second = up ? `${Q} numbers them column by column, going up: the left column gets 1 to ${r} from the bottom square to the top one, the next column gets ${r + 1} to ${2 * r} in the same way, and so on.`
        : `${Q} numbers them column by column from the right: the right-hand column gets 1 to ${r} from top to bottom, the column to its left gets ${r + 1} to ${2 * r}, and so on.`;
      return {
        topic: 'Numbering a grid two ways', rank: 21,
        text: `A grid of squares has ${r} rows and ${c} columns. ${byRows(P, r, c)} ${second} In how many squares do ${P} and ${Q} write the same number?`,
        answer: choices(d, g - 1, [gcd(r - 1, c - 1) + 1, g, g + 1, g - 2, (up ? gcd(r + 1, c - 1) : gcd(c + 1, r - 1)) - 1].filter((x) => x > 0)),
        check: () => { const k = sameCount(r, c, up ? (i, j) => r * j + (r - 1 - i) + 1 : (i, j) => r * (c - 1 - j) + i + 1); return k === g - 1 ? '' : `counted ${k}`; },
        solution: (up ? [
          `Number the rows 0 to ${r - 1} from the top and the columns 0 to ${c - 1} from the left, so that the square in row i and column j gets ${c}i + j + 1 from ${P}; ${Q}’s column j starts with ${r}j + 1 in the bottom row, so the square gets ${r}j + (${r - 1} − i) + 1 from ${Q}.`,
          `These are equal exactly when ${c}i + j = ${r}j + ${r - 1} − i, that is, ${c + 1}i = ${r - 1}(j + 1).`,
          `Dividing by gcd(${c + 1}, ${r - 1}) = ${g} gives ${co(v, 'i')} = ${u === 1 ? 'j + 1' : `${u}(j + 1)`}, so i = ${co(u, 't')} and j + 1 = ${co(v, 't')} for a whole number t.`,
          `Since j + 1 is between 1 and ${c}, t is at least 1, and t = ${g} would already make j + 1 = ${c + 1}, too big; so t can only be ${run(1, g - 1)}, and that is <b>${g - 1}</b> squares.`,
        ] : [
          `Number the rows 0 to ${r - 1} from the top and the columns 0 to ${c - 1} from the left, so that the square in row i and column j gets ${c}i + j + 1 from ${P}; ${Q} starts at the right, so column j is ${Q}’s column ${c - 1} − j counting from 0, and the square gets ${r}(${c - 1} − j) + i + 1 from ${Q}.`,
          `These are equal exactly when ${c}i + j = ${r}(${c - 1} − j) + i, that is, ${r + 1}j = ${c - 1}(${r} − i).`,
          `Dividing by gcd(${r + 1}, ${c - 1}) = ${g} gives ${co(u, 'j')} = ${v === 1 ? `${r} − i` : `${v}(${r} − i)`}, so j = ${co(v, 't')} and ${r} − i = ${co(u, 't')} for a whole number t.`,
          `Since ${r} − i is between 1 and ${r}, t is at least 1, and t = ${g} would already make ${r} − i = ${r + 1}, too big; so t can only be ${run(1, g - 1)}, and that is <b>${g - 1}</b> squares.`,
        ]).join(' '),
      };
    },
    // turned around: which widths c give exactly K matching squares, that is, gcd(r − 1, c − 1) = K − 1
    (d, ctx) => {
      const [r, K, N] = pick(ctx, 'grid-which', [[7, 9, 10, 11, 13, 16, 17, 19, 21, 25, 31, 37, 41, 43], range(2, 13), [40, 50, 60, 75, 80, 100, 120]], (r, K, N) => {
        const R1 = r - 1, G = K - 1;
        if (R1 % G || G === R1) return false;
        const ps = primesOf(R1 / G), Mx = Math.floor((N - 1) / G);
        return ps.length <= 2 && Mx >= 10 && coprimeUpTo(Mx, ps) >= 3;
      });
      const R1 = r - 1, G = K - 1, Qt = R1 / G, ps = primesOf(Qt), Mx = Math.floor((N - 1) / G), count = coprimeUpTo(Mx, ps), [P, Q] = d.pick(DUOS);
      const ie = `${Mx} − ${ps.map((p) => Math.floor(Mx / p)).join(' − ')}${ps.length > 1 ? ` + ${Math.floor(Mx / (ps[0] * ps[1]))}` : ''}`;
      const wrongShift = range(2, N).filter((c) => gcd(r, c) === G).length;
      return {
        topic: 'Numbering a grid two ways', rank: G === 1 ? 21 : 22,
        text: `A grid of squares has ${r} rows and c columns. ${P} numbers the squares 1, 2, 3, … row by row (the top row from left to right, then the next row, and so on), and ${Q} numbers them 1, 2, 3, … column by column (the left column from top to bottom, then the next column, and so on). For how many values of c from 2 to ${N} do exactly ${K} squares get the same number from both of them?`,
        answer: choices(d, count, [Math.floor((N - 1) / G), count + 1, count - 1, wrongShift, coprimeUpTo(Math.floor(N / G), ps) === count ? count + 2 : coprimeUpTo(Math.floor(N / G), ps)].filter((x) => x > 0)),
        check: () => { let k = 0; for (let c = 2; c <= N; c++) if (sameCount(r, c, (i, j) => r * j + i + 1) === K) k++; return k === count ? '' : `counted ${k}`; },
        solution: [
          `Counting the rows and columns from 0, the square in row i and column j gets ci + j + 1 from ${P} and ${r}j + i + 1 from ${Q}, so they match when (c − 1)i = ${R1}j.`,
          `With g = gcd(${R1}, c − 1), the matches are i = t · ${R1}/g and j = t · (c − 1)/g for t = 0, 1, …, g, so g + 1 squares match.`,
          G === 1 ? `So we need gcd(${R1}, c − 1) = 1, which means c − 1 shares no factor with ${R1} = ${shown(R1)}, as c − 1 runs from 1 to ${N - 1}.`
            : `So we need gcd(${R1}, c − 1) = ${G}, which means c − 1 = ${G}m where m shares no factor with ${R1}/${G} = ${Qt}${factor(Qt).length > 1 || factor(Qt)[0][1] > 1 ? ` = ${shown(Qt)}` : ''}, and c ≤ ${N} means m runs from 1 to ${Mx}.`,
          `Taking away the multiples of ${listing(ps)}${ps.length > 1 ? ` and putting back the multiples of ${ps[0] * ps[1]}` : ''} leaves ${ie} = ${count}.`,
          `So <b>${count}</b> values of c work.`,
        ].join(' '),
      };
    },
  ],
};
