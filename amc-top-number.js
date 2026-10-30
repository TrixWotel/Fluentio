// The hardest AMC 10 number theory (problems 17 to 25): eight topics, each asked three ways, modelled on contest ideas
// with new numbers, wording and settings. Zeros at the end of factorials (in other bases, the counts no factorial ever
// reaches, and binomial coefficients), primes in Pascal’s triangle (carries in base p), the gcd and lcm of three
// numbers, towers of powers and the periods that tame them, numbers picked out by their divisors, digit patterns in
// other bases, carries when a number is doubled or multiplied by 11 or 101, and numbers that are several powers at once.
// Every check() finds the answer again a second way: with whole factorials and binomial coefficients in BigInt, the
// powers worked out in full, or every number in the range tried one by one.
import { combo, num, gcd, lcm, choose } from '../kit/bank.js';
import { choices, range, ord } from './amc-kit.js';

// combo, with a name of its own for each kind of question, so no two kinds share a list of combinations
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
// for a kind of question with sub-kinds: the turns take the sub-kinds in turn (so a rare one isn't crowded out), and
// each sub-kind walks its own combinations; gives [kind, …values]
function pickKind(ctx, tag, kinds, lists, ok = () => true) {
  let h = 0;
  for (const ch of ctx.salt) h = (h * 31 + ch.charCodeAt(0)) % 1000003;
  const kind = kinds[(ctx.k + h) % kinds.length], inner = { ...ctx, k: Math.floor(ctx.k / kinds.length) };
  return [kind, ...pick(inner, `${tag}-${kind}`, lists, (...v) => ok(kind, ...v))];
}
const total = (xs) => xs.reduce((s, v) => s + v, 0);
const product = (xs) => xs.reduce((s, v) => s * v, 1);
const ints = (v) => num(v, 0);
const big = (v) => BigInt(v).toLocaleString('en-US');
const mod = (a, m) => ((a % m) + m) % m;
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const PRIMES = range(2, 1000).filter(isPrime);
const factor = (n) => { const out = []; for (let p = 2; p * p <= n; p++) if (n % p === 0) { let e = 0; while (n % p === 0) { n /= p; e++; } out.push([p, e]); } if (n > 1) out.push([n, 1]); return out; };
const divisors = (n) => { const lo = [], hi = []; for (let i = 1; i * i <= n; i++) if (n % i === 0) { lo.push(i); if (i * i !== n) hi.unshift(n / i); } return [...lo, ...hi]; };
const expOf = (n, p) => { let e = 0; while (n % p === 0) { n /= p; e++; } return e; };
const pw = (b, e) => (e === 1 ? `${b}` : `${b}<sup>${e}</sup>`);
const pwr = (b, e) => (e === 0 ? '1' : pw(b, e));                       // b⁰ shows as 1
const shown = (n) => factor(n).map(([p, e]) => pw(p, e)).join(' · ');
const listing = (xs, word = 'and') => (xs.length < 2 ? `${xs[0]}` : `${xs.slice(0, -1).join(', ')} ${word} ${xs.at(-1)}`);
const legendre = (n, p) => { let e = 0; for (let q = p; q <= n; q *= p) e += Math.floor(n / q); return e; };   // the power of p in n!
const isqrt = (n) => { let r = Math.floor(Math.sqrt(n)); while (r * r > n) r--; while ((r + 1) * (r + 1) <= n) r++; return r; };
const digitsOf = (n, b) => { const out = []; do { out.unshift(n % b); n = Math.floor(n / b); } while (n > 0); return out; };
const based = (n, b) => `${digitsOf(n, b).join('')}<sub>${b}</sub>`;
const readIn = (ds, b) => ds.reduce((v, x) => v * b + x, 0);
const dsum = (n) => { let s = 0; while (n > 0) { s += n % 10; n = Math.floor(n / 10); } return s; };
const factBig = (n) => { let f = 1n; for (let i = 2n; i <= BigInt(n); i++) f *= i; return f; };
const binomBig = (n, k) => { let c = 1n; for (let i = 1; i <= k; i++) c = (c * BigInt(n - k + i)) / BigInt(i); return c; };
// b^e mod m, the exponent as big as it likes (a BigInt)
const powMod = (b, e, m) => { let r = 1n, x = BigInt(b) % BigInt(m), k = BigInt(e); const M = BigInt(m); while (k > 0n) { if (k & 1n) r = (r * x) % M; x = (x * x) % M; k >>= 1n; } return Number(r % M); };
const orderMod = (a, m) => { let v = a % m, k = 1; while (v !== 1) { v = (v * a) % m; k++; if (k > m) return 0; } return k; };
const gcd3 = (a, b, c) => gcd(gcd(a, b), c);
const lcm3 = (a, b, c) => lcm(lcm(a, b), c);
const tri = (x) => (x * (x + 1)) / 2;

// the power of p in n!, worked out: ⌊50/3⌋ + ⌊50/9⌋ + ⌊50/27⌋ = 16 + 5 + 1 = 22 (just the numbers when there are many)
const legText = (n, p) => {
  const qs = []; for (let q = p; q <= n; q *= p) qs.push(q);
  const parts = qs.map((q) => Math.floor(n / q));
  if (!qs.length) return '0';
  if (qs.length === 1) return `⌊${n}/${p}⌋ = ${parts[0]}`;
  return `${qs.length <= 3 ? `${qs.map((q) => `⌊${n}/${q}⌋`).join(' + ')} = ` : ''}${parts.join(' + ')} = ${total(parts)}`;
};
// b, b², b³, … divided by m: where the remainders start repeating, and what b^c leaves, in words
function cycleText(b, m, c) {
  const seq = [], seen = new Map();
  let v = b % m, i = 1;
  while (!seen.has(v)) { seen.set(v, i); seq.push(v); v = (v * b) % m; i++; }
  const start = seen.get(v), period = i - start;
  const at = (k) => (k < start ? seq[k - 1] : seq[start - 1 + ((k - start) % period)]);
  const r = at(c), more = seq.slice(start - 1, start - 1 + Math.min(period, 3));
  const head = `The remainders of ${b}, ${pw(b, 2)}, ${pw(b, 3)}, … when divided by ${m} are ${[...seq, ...more].join(', ')}, …`;
  if (c < start) return { r, text: `${head}, so ${pw(b, c)} leaves ${r}.` };
  if (period === 1) return { r, text: start === 1 ? `${head}, so they all leave ${r}, ${pw(b, c)} too.` : `${head}, so from ${pw(b, start)} on they all leave ${seq[start - 1]}, ${pw(b, c)} too.` };
  const same = start + ((c - start) % period);
  if (same === c) return { r, text: `${head}, so ${pw(b, c)} leaves ${r}.` };
  return { r, text: `${head}, repeating every ${period}${start > 1 ? ` from ${pw(b, start)} on` : ''}; ${c} and ${same} leave the same remainder when divided by ${period}, so ${pw(b, c)} leaves the same as ${pw(b, same)}, which is ${r}.` };
}
// the 7-smooth numbers up to n (only 2, 3, 5 and 7 divide them)
const smoothList = new Map();
const smooth = (n) => { if (!smoothList.has(n)) smoothList.set(n, range(2, n).filter((v) => factor(v).every(([p]) => p <= 7))); return smoothList.get(n); };

// ---------- zeros at the end of n! ----------
const TA = 'Zeros at the end of n!';
const ZBASES = [12, 18, 20, 24, 28, 36, 40, 44, 45, 48, 50, 52, 54, 56, 63, 72, 75, 80, 96, 98, 99, 108, 112, 135, 144, 147, 160, 162, 175, 189, 196, 200, 225, 245, 250];
const zerosIn = (N, b) => factor(b).map(([p, e]) => Math.floor(legendre(N, p) / e));   // copies of each prime power of b in N!
const Z5m = (m) => legendre(5 * m, 5);                                                 // zeros at the end of (5m)!
const vC = (n, k, p) => legendre(n, p) - legendre(k, p) - legendre(n - k, p);          // the power of p in C(n, k)

// ---------- Pascal's triangle and primes ----------
const TB = 'Pascal’s triangle and primes';
// entries of the first N rows that are not multiples of p: the first d·pᵃ rows hold 1 + 2 + ⋯ + d copies of the first
// pᵃ rows, and the next r rows hold d + 1 copies of the first r rows
const pasCount = (N, p) => {
  if (N <= 0) return 0;
  let a = 0; while (p ** (a + 1) <= N) a++;
  const dd = Math.floor(N / p ** a);
  return tri(dd) * tri(p) ** a + (dd + 1) * pasCount(N - dd * p ** a, p);
};
const pasChain = (N, p) => { const out = []; let R = N; while (R > 0) { let a = 0; while (p ** (a + 1) <= R) a++; const dd = Math.floor(R / p ** a), r = R - dd * p ** a; out.push({ R, a, dd, r }); R = r; } return out; };

// ---------- gcd and lcm of three numbers ----------
const TC = 'GCD and LCM of three numbers';
let glList = null;
function gcdLcmPairs() {
  if (glList) return glList;
  glList = [];
  for (const L of smooth(20000)) {
    const f = factor(L);
    if (f.length < 2 || f.length > 3) continue;
    for (const G of divisors(L)) {
      if (G === 1 || G === L) continue;
      const gaps = f.map(([p, e]) => e - expOf(G, p));
      if (gaps.filter((x) => x > 0).length < 2 || Math.max(...gaps) < 2) continue;
      const count = product(gaps.map((x) => (x ? 6 * x : 1)));
      if (count >= 72 && count <= 2500) glList.push([G, L]);
    }
  }
  const every = Math.ceil(glList.length / 300);
  glList = glList.filter((x, i) => i % every === 0);
  return glList;
}
// lcm(a, b), lcm(b, c), lcm(c, a) prime by prime: ['all', e] gives each lcm pᵉ; ['two', e, f, w] gives lcm number w only pᶠ
let pairList = null;
function lcmPatterns() {
  if (pairList) return pairList;
  const opts = [];
  for (let e = 1; e <= 3; e++) opts.push(['all', e]);
  for (let e = 1; e <= 3; e++) for (let f = 0; f < e; f++) for (let w = 0; w < 3; w++) opts.push(['two', e, f, w]);
  pairList = [];
  for (const o2 of opts) for (const o3 of opts) for (const o5 of [null, ...opts]) {
    const pats = [[2, o2], [3, o3], ...(o5 ? [[5, o5]] : [])];
    const XYZ = [0, 1, 2].map((i) => product(pats.map(([p, o]) => p ** (o[0] === 'all' ? o[1] : i === o[3] ? o[2] : o[1]))));
    const count = product(pats.map(([, o]) => (o[0] === 'all' ? 3 * o[1] + 1 : 2 * o[2] + 1)));
    if (Math.max(...XYZ) > 6000 || count < 20 || count > 600 || new Set(XYZ).size < 3) continue;
    if (!pats.some(([, o]) => o[0] === 'all') || !pats.some(([, o]) => o[0] === 'two' && o[2] > 0)) continue;
    pairList.push({ pats, XYZ, count });
  }
  const every = Math.ceil(pairList.length / 300);
  pairList = pairList.filter((x, i) => i % every === 0);
  return pairList;
}
let setList = null;
function setNumbers() {
  if (setList) return setList;
  setList = smooth(60000).filter((N) => {
    const f = factor(N), w = f.length, T = product(f.map(([, e]) => 6 * e));
    if (w < 2 || w > 3 || Math.max(...f.map(([, e]) => e)) > 4) return false;
    const ans = (T - 3 * 2 ** w) / 6;
    return ans >= 15 && ans <= 800;
  });
  return setList;
}

// ---------- towers of powers ----------
const TD = 'Towers of powers';
const A100 = range(3, 49).filter((a) => gcd(a, 10) === 1 && [4, 5, 10, 20].includes(orderMod(a, 100)));
const CHAIN = { 4: [1, 2, 4], 5: [1, 2, 4, 5], 10: [1, 2, 4, 5, 10], 20: [1, 2, 4, 5, 10, 20] };
// the n from 1 to P·m for which aⁿ + n, aⁿ − n or aⁿ + n² is a multiple of m: one remainder of n mod P at a time
function towerSols(kind, m, a) {
  const P = orderMod(a, m), L = P * m, out = [], per = [];
  for (let r = 1; r <= P; r++) {
    const ar = powMod(a, r, m), t = kind === '−' ? ar : mod(-ar, m);
    const us = kind === 'sq' ? range(0, m - 1).filter((u) => (u * u) % m === t) : [t];
    per.push({ r, ar, t, us });
    for (const u of us) for (let n = r; n <= L; n += P) if (n % m === u) out.push(n);
  }
  return { P, L, S: out.sort((x, y) => x - y), per };
}
const towerCount = (kind, m, a, N) => { const { L, S } = towerSols(kind, m, a); return Math.floor(N / L) * S.length + S.filter((s) => s <= N % L).length; };

// ---------- numbers by their divisors ----------
const TE = 'Numbers by their divisors';
const SHAPES = { 4: [[3], [1, 1]], 6: [[5], [2, 1]], 8: [[7], [3, 1], [1, 1, 1]] };
const NLIST = { 4: [50, 60, 70, 80, 90, 100, 110, 120], 6: [100, 120, 150, 180, 200, 250, 300], 8: [100, 120, 150, 200, 250, 300] };
const FORM = (sh) => (sh.length === 1 ? pw('p', sh[0]) : sh.length === 3 ? 'pqr' : sh[0] === 1 ? 'pq' : `${pw('p', sh[0])}q`);
// the numbers up to N of one shape, in groups: by the repeated prime, by the smaller prime of pq, by the two smaller of pqr
function shapeGroups(sh, N, keep) {
  const P = PRIMES.filter((p) => p <= N);
  const groups = [];
  if (sh.length === 1) groups.push({ lead: '', last: P.filter((p) => p ** sh[0] <= N && keep(p ** sh[0])), make: (p) => p ** sh[0], single: true });
  else if (sh.length === 2 && sh[0] === 1) for (const p of P) groups.push({ lead: `${p}`, last: P.filter((q) => q > p && p * q <= N && keep(p * q)), make: (q) => p * q });
  else if (sh.length === 2) for (const p of P) groups.push({ lead: `${pw(p, sh[0])} · `, skip: p, last: P.filter((q) => q !== p && p ** sh[0] * q <= N && keep(p ** sh[0] * q)), make: (q) => p ** sh[0] * q });
  else for (const p of P) for (const q of P) if (q > p) groups.push({ lead: `${p} · ${q} · `, last: P.filter((r) => r > q && p * q * r <= N && keep(p * q * r)), make: (r) => p * q * r });
  return groups.filter((g) => g.last.length);
}
const dcount = (n) => { let k = 0; for (let i = 1; i * i <= n; i++) if (n % i === 0) k += i * i === n ? 1 : 2; return k; };
const LETTERS = ['x', 'y', 'z', 'w'];
// exponent tuples with (x + 1)(y + 1)⋯ = k: all of them, and grouped by the exponents they use (with how many fit the caps)
function tupleCount(caps, k) {
  const all = [];
  const rec = (i, left, cur) => { if (i === caps.length) { if (left === 1) all.push(cur); return; } for (const f of divisors(left)) rec(i + 1, left / f, [...cur, f - 1]); };
  rec(0, k, []);
  const pats = new Map();
  for (const t of all) {
    const exps = [...t].sort((x, y) => y - x), key = exps.join(',');
    const g = pats.get(key) ?? { exps, perms: 0, count: 0 };
    g.perms++;
    if (t.every((x, i) => x <= caps[i])) g.count++;
    pats.set(key, g);
  }
  const list = [...pats.values()];
  return { ans: total(list.map((g) => g.count)), unlimited: all.length, pats: list };
}
const E2BASES = [6, 10, 12, 14, 15, 18, 20, 21, 24, 28, 30, 35, 36, 40, 42, 45, 48, 60, 72, 84, 90];

// ---------- digit patterns in base b ----------
const TF = 'Digit patterns in base b';
const isPal = (ds) => ds.join(',') === [...ds].reverse().join(',');

// ---------- carries and digit sums ----------
const TG = 'Carries and digit sums';
const PLACE = { 1: { 0: 'first', 1: 'in the middle', 2: 'last' }, 2: { '01': 'first and in the middle', '02': 'first and last', '12': 'in the middle and last' }, 3: { '012': 'everywhere' } };
// three-digit numbers with digit sum s and exactly c digits that are 5 or more, by the places of those digits
function bigSplit(s, c) {
  const out = new Map();
  for (let a = 1; a <= 9; a++) for (let b = 0; b <= 9; b++) for (let e = 0; e <= 9; e++) {
    if (a + b + e !== s) continue;
    const at = [a, b, e].map((x, i) => (x >= 5 ? i : -1)).filter((i) => i >= 0);
    if (at.length !== c) continue;
    out.set(at.join(''), (out.get(at.join('')) ?? 0) + 1);
  }
  return out;
}
const sumCount = (s) => { let k = 0; for (let n = 100; n <= 999; n++) if (dsum(n) === s) k++; return k; };
const carryCases = (t) => range(0, 3).map((c) => ({ c, s: 9 * c + t, split: bigSplit(9 * c + t, c) })).filter((x) => x.s >= 1 && x.s <= 27 && x.split.size);
// multiplying by 11, 101, 111 or 1001: the columns of the sum, and the column sums that must stay below 10
const MULTS = [
  { m: 11, L: 3, k: 2, rank: 21, letters: 'abc', parts: 'abc0 + abc', cols: 'a, a + b, b + c, c', sums: ([a, b, c]) => [a + b, b + c], cond: 'a + b and b + c are both at most 9',
    how: 'For each middle digit b, the first digit a can be 1 to 9 − b and the last digit c can be 0 to 9 − b, so the count is 9 · 10 + 8 · 9 + 7 · 8 + ⋯ + 1 · 2' },
  { m: 101, L: 3, k: 2, rank: 21, letters: 'abc', parts: 'abc00 + abc', cols: 'a, b, a + c, b, c', sums: ([a, , c]) => [a + c], cond: 'a + c is at most 9',
    how: 'With a from 1 to 9, a + c ≤ 9 allows 9 + 8 + ⋯ + 1 = 45 pairs, and b can be any of the 10 digits, so the count is 45 · 10' },
  { m: 111, L: 3, k: 3, rank: 22, letters: 'abc', parts: 'abc00 + abc0 + abc', cols: 'a, a + b, a + b + c, b + c, c', sums: ([a, b, c]) => [a + b + c], cond: 'a + b + c is at most 9',
    how: 'With a at least 1, the digits add up to s in s(s + 1)/2 ways (give a its 1 first, then share out the other s − 1), so the count is 1 + 3 + 6 + 10 + 15 + 21 + 28 + 36 + 45' },
  { m: 101, L: 4, k: 2, rank: 22, letters: 'abcd', parts: 'abcd00 + abcd', cols: 'a, b, a + c, b + d, c, d', sums: ([a, b, c, e]) => [a + c, b + e], cond: 'a + c and b + d are both at most 9',
    how: 'With a from 1 to 9, a + c ≤ 9 allows 9 + 8 + ⋯ + 1 = 45 pairs, and b + d ≤ 9 allows 10 + 9 + ⋯ + 1 = 55 pairs, so the count is 45 · 55' },
  { m: 1001, L: 4, k: 2, rank: 21, letters: 'abcd', parts: 'abcd000 + abcd', cols: 'a, b, c, a + d, b, c, d', sums: ([a, , , e]) => [a + e], cond: 'a + d is at most 9',
    how: 'With a from 1 to 9, a + d ≤ 9 allows 9 + 8 + ⋯ + 1 = 45 pairs, and b and c can be anything, so the count is 45 · 100' },
];
// the L-digit numbers whose column sums are all at most lim (only the first one when first is true; a 0 in front allowed when lead0)
const multCount = (M, lim, { first = false, lead0 = false } = {}) => {
  let k = 0;
  for (let n = lead0 ? 0 : 10 ** (M.L - 1); n < 10 ** M.L; n++) {
    const ds = String(n).padStart(M.L, '0').split('').map(Number), s = M.sums(ds);
    if ((first ? s.slice(0, 1) : s).every((x) => x <= lim)) k++;
  }
  return k;
};
// the smallest number with digit sum A and exactly c digits from 5 to 9 (the rest 0 to 4), using L digits
function leastWith(A, c, L) {
  const out = [];
  let sum = A, bigs = c;
  for (let i = 0; i < L; i++) {
    const left = L - i - 1;
    let placed = false;
    for (let x = i === 0 ? 1 : 0; x <= 9 && !placed; x++) {
      const b2 = bigs - (x >= 5 ? 1 : 0), s2 = sum - x;
      if (b2 < 0 || b2 > left || s2 < 0) continue;
      if (s2 >= 5 * b2 && s2 <= 9 * b2 + 4 * (left - b2)) { out.push(x); sum = s2; bigs = b2; placed = true; }
    }
    if (!placed) return null;
  }
  return Number(out.join(''));
}
const leastLen = (A, c) => { if (5 * c > A) return null; for (let L = Math.max(c, 1); L <= 12; L++) if (9 * c + 4 * (L - c) >= A) return L; return null; };
const leastC = (A, c) => { const L = leastLen(A, c); return L === null ? null : leastWith(A, c, L); };

// ---------- several powers at once ----------
const TH = 'Several powers at once';
const KWORD = { 2: 'square', 3: 'cube', 4: 'fourth power', 5: 'fifth power', 7: 'seventh power' };
const condText = ([q, k, op]) => (op === 'div' ? `n/${q} is a perfect ${KWORD[k]}` : `${q}n is a perfect ${KWORD[k]}`);
const ownText = ([, k, op]) => (k === 2 ? 'odd' : op === 'div' ? `1 more than a multiple of ${k}` : `1 less than a multiple of ${k}`);
// the smallest exponent of condition i’s prime: ±1 more than a multiple of its own k, and a multiple of every other k
const expFor = (conds, i) => { const [, k, op] = conds[i]; for (let e = 0; e < 500; e++) if (mod(e, k) === (op === 'div' ? 1 % k : k - 1) && conds.every(([, kk], j) => j === i || e % kk === 0)) return e; return -1; };
const flip = (conds) => conds.map(([q, k, op]) => [q, k, op === 'div' ? 'mul' : 'div']);
const threeDivs = (conds) => product(conds.map((x, i) => expFor(conds, i) + 1));
const threeAsk = (conds, ask) => { const es = conds.map((x, i) => expFor(conds, i)); return { square: product(es.map((e) => Math.floor(e / 2) + 1)), cube: product(es.map((e) => Math.floor(e / 3) + 1)), mult: es[0] * es[1] * (es[2] + 1) }[ask]; };
let threeList = null;
function threeConds() {
  if (threeList) return threeList;
  threeList = [];
  for (const ks of [[2, 3, 5], [2, 3, 7]]) for (const qs of [[2, 3, 5], [2, 3, 7], [2, 5, 7], [3, 5, 7]]) {
    for (const perm of [[0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0]]) for (let ops = 0; ops < 8; ops++) {
      const conds = qs.map((q, i) => [q, ks[perm[i]], ops & (1 << i) ? 'mul' : 'div']);
      const es = conds.map((x, i) => expFor(conds, i));
      if (product(es.map((e) => e + 1)) <= 30000) threeList.push(conds);
    }
  }
  return threeList;
}
// how many n ≤ 10^j meet two conditions: every such n is n0 · t^L
let twoList = null;
function twoConds() {
  if (twoList) return twoList;
  twoList = [];
  for (const ks of [[2, 3], [3, 2], [2, 5], [5, 2], [3, 4], [4, 3], [3, 5], [5, 3], [2, 7]]) for (const q1 of [2, 3, 5, 7]) for (const q2 of [2, 3, 5, 7]) {
    if (q1 === q2) continue;
    for (const o1 of ['div', 'mul']) for (const o2 of ['div', 'mul']) for (let j = 5; j <= 12; j++) {
      const conds = [[q1, ks[0], o1], [q2, ks[1], o2]], e1 = expFor(conds, 0), e2 = expFor(conds, 1), L = ks[0] * ks[1];
      const n0 = BigInt(q1) ** BigInt(e1) * BigInt(q2) ** BigInt(e2), N = 10n ** BigInt(j);
      let T = 0; while (n0 * BigInt(T + 1) ** BigInt(L) <= N) T++;
      // (for a square, n/q and qn ask the same of q's exponent, so keep one of each pair of twins)
      const key = `${n0}|${L}|${j}`;
      if (T >= 3 && T <= 12 && n0 * BigInt(T + 1) ** BigInt(L) <= 10n ** 16n && !twoList.some((x) => x.key === key)) twoList.push({ conds, j, T, key });
    }
  }
  return twoList;
}
// is v a perfect k-th power (v a whole number below 2⁵³)?
const isPow = (v, k) => { if (v < 1 || !Number.isInteger(v)) return false; const r = Math.round(v ** (1 / k)); return [r - 1, r, r + 1].some((x) => x >= 1 && x ** k === v); };
const meets = (n, [q, k, op]) => (op === 'div' ? n % q === 0 && isPow(n / q, k) : isPow(n * q, k));
// the exponents of the smallest n = q1^x · q2^y · q3^z meeting three conditions, found by trying every exponent up to 90
function bruteExps(conds) {
  const q = conds.map(([p]) => p), fits = (x) => conds.every(([p, k, op]) => x.every((e, i) => (q[i] === p ? mod(e + (op === 'div' ? -1 : 1), k) === 0 : e % k === 0)));
  let best = null;
  for (let x = 0; x <= 90; x++) for (let y = 0; y <= 90; y++) for (let z = 0; z <= 90; z++) {
    if (!fits([x, y, z])) continue;
    const v = x * Math.log(q[0]) + y * Math.log(q[1]) + z * Math.log(q[2]);
    if (!best || v < best.v) best = { v, e: [x, y, z] };
  }
  return best ? best.e : [];
}

export const topNumber = {
  [TA]: [
    // N! in base b: the prime of b that runs out first, which is often not the biggest one
    (d, ctx) => {
      const [b, N] = pick(ctx, 'zero-base', [ZBASES, range(21, 119)], (b, N) => {
        const counts = zerosIn(N, b), ans = Math.min(...counts);
        return ans >= 4 && counts.at(-1) !== ans && counts[0] !== counts[1];
      });
      const f = factor(b), counts = zerosIn(N, b), ans = Math.min(...counts), [bp] = f[counts.indexOf(ans)];
      return {
        topic: TA, rank: 19,
        text: `When ${N}! = 1 · 2 · 3 ⋯ ${N} is written in base ${b}, how many zeros does it end with?`,
        answer: choices(d, ans, [counts.at(-1), ...counts, legendre(N, bp), legendre(N, 5), Math.floor(N / b), ans + 1].filter((v) => v > 0)),
        check: () => { let F = factBig(N), k = 0; const B = BigInt(b); while (F % B === 0n) { F /= B; k++; } return k === ans ? '' : `${N}! ends in ${k} zeros in base ${b}`; },
        solution: [
          `A number ends in k zeros in base ${b} exactly when it is a multiple of ${b}<sup>k</sup>, just as it ends in k zeros in base ten when it is a multiple of 10<sup>k</sup>; and ${b} = ${shown(b)}.`,
          ...f.map(([p, e], i) => `The power of ${p} in ${N}! is ${legText(N, p)}${e > 1 ? `, enough for ⌊${legendre(N, p)}/${e}⌋ = ${counts[i]} factors of ${pw(p, e)}` : ''}.`),
          `Each factor of ${b} needs ${f.map(([p, e]) => (e > 1 ? pw(p, e) : `one ${p}`)).join(' and ')}, so the number of zeros is the smaller count, <b>${ans}</b>.`,
        ].join(' '),
      };
    },
    // the numbers of zeros no factorial ends in: each multiple of 25 makes the count jump
    (d, ctx) => {
      const [K] = pick(ctx, 'zero-skip', [[60, 75, 80, 90, 100, 110, 120, 125, 140, 150, 160, 175, 180, 200, 225, 240, 250, 300, 360, 400, 450, 500, 600, 750, 800, 1000]]);
      let M = 0; while (Z5m(M + 1) <= K) M++;
      const ans = K - M, under = Z5m(M) - M;
      return {
        topic: TA, rank: 23,
        text: `Call a positive integer k <i>missed</i> if there is no positive integer n for which n! = 1 · 2 ⋯ n ends in exactly k zeros. How many of the integers 1, 2, 3, …, ${ints(K)} are missed?`,
        answer: choices(d, ans, [Math.floor(M / 5), under, M, Math.floor(K / 5), Math.floor(K / 25), ans + 1]),
        check: () => {
          // build the factorials’ 2s and 5s one factor at a time, without Legendre’s formula
          let t2 = 0, t5 = 0;
          const seen = new Set();
          for (let n = 1; n <= 5 * K + 10; n++) { let x = n; while (x % 2 === 0) { x /= 2; t2++; } while (x % 5 === 0) { x /= 5; t5++; } seen.add(Math.min(t2, t5)); }
          const k = range(1, K).filter((x) => !seen.has(x)).length;
          return k === ans ? '' : `counted ${k}`;
        },
        solution: [
          `Each zero at the end of n! needs a 2 and a 5, and the 2s outnumber the 5s, so n! ends in Z(n) = ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + ⋯ zeros.`,
          `Z(n) only changes when n reaches a multiple of 5, so the numbers of zeros that happen are Z(5), Z(10), Z(15), …, each bigger than the one before.`,
          `Z(5m) = m + ⌊m/5⌋ + ⌊m/25⌋ + ⋯ is a little more than m, so m is about four fifths of ${ints(K)}: Z(${ints(5 * M)}) = ${legText(5 * M, 5)} is at most ${ints(K)}, but Z(${ints(5 * M + 5)}) = ${legText(5 * M + 5, 5)} is more.`,
          `So the numbers of zeros from 1 to ${ints(K)} that happen are Z(5), Z(10), …, Z(${ints(5 * M)}), ${M} of them, and the other ${ints(K)} − ${M} = <b>${ints(ans)}</b> are missed.`,
        ].join(' '),
      };
    },
    // zeros at the end of a binomial coefficient: the 2s can run out before the 5s
    (d, ctx) => {
      const [who, n, k] = pickKind(ctx, 'zero-binom', ['2', '5'], [range(50, 199), range(10, 99)], (who, n, k) => {
        if (2 * k > n) return false;
        const v2 = vC(n, k, 2), v5 = vC(n, k, 5);
        return who === '2' ? v2 >= 1 && v5 >= v2 + 1 : v5 >= 2 && v2 > v5;
      });
      const v2 = vC(n, k, 2), v5 = vC(n, k, 5), ans = Math.min(v2, v5), slip = Math.floor(n / 5) - Math.floor(k / 5) - Math.floor((n - k) / 5);
      return {
        topic: TA, rank: who === '2' ? 23 : 21,
        text: `How many zeros are at the end of C(${n}, ${k}) = ${n}!/(${k}! · ${n - k}!), the number of ways to choose ${k} things from ${n}?`,
        answer: choices(d, ans, [v5, v2, legendre(n, 5), slip, ans + 1, Math.max(v2, v5) + 1]),
        check: () => { let c = binomBig(n, k), z = 0; while (c % 10n === 0n) { c /= 10n; z++; } return z === ans ? '' : `it ends in ${z} zeros`; },
        solution: [
          `The number of zeros at the end of a whole number is the smaller of its powers of 2 and 5, so count the 2s and the 5s in ${n}!, ${k}! and ${n - k}!.`,
          `For the 5s, ${n}! has ${legText(n, 5)}, ${k}! has ${legText(k, 5)} and ${n - k}! has ${legText(n - k, 5)}, so C(${n}, ${k}) has ${legendre(n, 5)} − ${legendre(k, 5)} − ${legendre(n - k, 5)} = ${v5}.`,
          `For the 2s (⌊m/2⌋ + ⌊m/4⌋ + ⌊m/8⌋ + ⋯ in m!), ${n}! has ${legendre(n, 2)}, ${k}! has ${legendre(k, 2)} and ${n - k}! has ${legendre(n - k, 2)}, so C(${n}, ${k}) has ${legendre(n, 2)} − ${legendre(k, 2)} − ${legendre(n - k, 2)} = ${v2}.`,
          `${who === '2' ? 'This time the 2s run out first, so' : 'So'} C(${n}, ${k}) ends in <b>${ans}</b> zero${ans === 1 ? '' : 's'}.`,
        ].join(' '),
      };
    },
  ],

  [TB]: [
    // one row: C(n, k) is not a multiple of p exactly when adding k and n − k in base p has no carries
    (d, ctx) => {
      const [p, n, ask] = pickKind(ctx, 'pascal-row', [2, 3, 5, 7], [range(40, 999), ['not', 'mult']], (p, n, ask) => {
        if (p === 2 && ask === 'not') return false;
        const ds = digitsOf(n, p), P = product(ds.map((x) => x + 1));
        return ds.length >= 3 && ds.includes(0) && P >= 8 && P <= n / 2;
      });
      const ds = digitsOf(n, p), P = product(ds.map((x) => x + 1)), M = n + 1 - P, ans = ask === 'not' ? P : M;
      const what = p === 2 ? 'even' : ask === 'not' ? `not multiples of ${p}` : `multiples of ${p}`, notWhat = p === 2 ? 'odd' : `not multiples of ${p}`;
      const decimal = product(String(n).split('').map((c) => +c + 1)), nonzero = 2 ** ds.filter((x) => x > 0).length, bare = product(ds.filter((x) => x > 0));
      return {
        topic: TB, rank: p === 2 ? 21 : 22,
        text: `Row ${n} of Pascal’s triangle is C(${n}, 0), C(${n}, 1), C(${n}, 2), …, C(${n}, ${n}), where C(n, k) = n!/(k! (n − k)!). How many of these ${n + 1} numbers are ${what}?`,
        answer: choices(d, ans, ask === 'not' ? [M, decimal, nonzero, bare, Math.floor((n + 1) / p), P + 1] : [P, n + 1 - decimal, n + 1 - nonzero, n + 1 - bare, n - Math.floor((n + 1) / p), M + 1]),
        check: () => {
          let row = [1];
          for (let r = 1; r <= n; r++) { const next = [1]; for (let j = 1; j < r; j++) next.push((row[j - 1] + row[j]) % p); next.push(1); row = next; }
          const zeros = row.filter((x) => x === 0).length, got = ask === 'not' ? n + 1 - zeros : zeros;
          return got === ans ? '' : `counted ${got}`;
        },
        solution: [
          `The power of ${p} in m! is ⌊m/${p}⌋ + ⌊m/${p * p}⌋ + ⋯, which works out to ${p === 2 ? 'm − s(m)' : `(m − s(m))/${p - 1}`}, where s(m) is the sum of the digits of m in base ${p}.`,
          `So the power of ${p} in C(${n}, k) is ${p === 2 ? `s(k) + s(${n} − k) − s(${n})` : `(s(k) + s(${n} − k) − s(${n}))/${p - 1}`}, which is the number of carries when k and ${n} − k are added in base ${p} (each carry turns ${p} in one place into 1 in the next, so it takes ${p - 1} off the digit sum).`,
          `So C(${n}, k) is ${p === 2 ? 'odd' : `not a multiple of ${p}`} exactly when that addition has no carries, that is, when each base-${p} digit of k is at most the matching digit of ${n}.`,
          `${n} = ${based(n, p)}, so the digits of k can be chosen in ${ds.map((x) => x + 1).join(' · ')} = ${P} ways.`,
          ask === 'not' ? `So <b>${ints(P)}</b> of the numbers are not multiples of ${p}.` : `Those ${P} numbers are ${notWhat}, and the other ${n + 1} − ${P} = <b>${ints(M)}</b> are ${what}.`,
        ].join(' '),
      };
    },
    // the first N rows: two (or three) copies of the rows above, row block by row block
    (d, ctx) => {
      const [p, N] = pickKind(ctx, 'pascal-rows', [2, 3], [range(20, 200)], (p, N) => {
        const nz = digitsOf(N, p).filter((x) => x > 0).length;
        return nz >= 2 && nz <= 4 && (p === 2 ? N >= 24 : N <= 130);
      });
      const ans = pasCount(N, p), chain = pasChain(N, p);
      const noDouble = total(chain.map(({ a, dd }) => tri(dd) * tri(p) ** a)), whole = tri(p) ** (chain[0].a + 1);
      const block = ({ a, dd }) => (p === 2 ? pwr(3, a) : `${tri(dd) === 1 ? '' : `${tri(dd)} · `}${pwr(6, a)}`);
      const links = chain.map((x) => `f(${x.R}) = ${block(x)}${x.r ? ` + ${x.dd + 1} · f(${x.r})` : ''}`);
      const back = chain.slice().reverse().map((x) => `f(${x.R}) = ${x.r ? `${ints(tri(x.dd) * tri(p) ** x.a)} + ${x.dd + 1} · ${ints(pasCount(x.r, p))} = ` : ''}${ints(pasCount(x.R, p))}`);
      const sumText = chain.map(({ a, dd }) => (p === 2 ? pwr(2, a) : a === 0 ? `${dd}` : `${dd === 1 ? '' : `${dd} · `}${pw(3, a)}`)).join(' + ');
      const why = p === 2 ? [
        `Only odd and even matter, and an entry is odd exactly when one of the two above it is odd and the other even; so the first 2<sup>a+1</sup> rows are three copies of the first 2<sup>a</sup> rows (one on top and two side by side below it), with only even numbers in the gap between the bottom two.`,
        `So the first 2<sup>a</sup> rows hold 3<sup>a</sup> odd numbers, and the r rows after row 2<sup>a</sup> − 1 (for r less than 2<sup>a</sup>) are two copies of rows 0 to r − 1, with twice as many odd numbers.`,
      ] : [
        `Only the remainders when dividing by 3 matter, and each entry’s remainder comes from the two above it; so the first 3<sup>a+1</sup> rows are six copies of the first 3<sup>a</sup> rows (1, then 2, then 3 side by side, some of them doubled, which doesn’t change which entries are multiples of 3), with only multiples of 3 in the gaps.`,
        `So the first 3<sup>a</sup> rows hold 6<sup>a</sup> numbers that are not multiples of 3 and the first 2 · 3<sup>a</sup> rows hold 1 + 2 = 3 copies of them, and the r rows after the first 3<sup>a</sup> (or 2 · 3<sup>a</sup>) rows, for r less than 3<sup>a</sup>, are 2 (or 3) copies of rows 0 to r − 1.`,
      ];
      return {
        topic: TB, rank: 24,
        text: `How many of the numbers in the first ${N} rows of Pascal’s triangle (row 0, which is just 1, through row ${N - 1}) are ${p === 2 ? 'odd' : 'not multiples of 3'}?`,
        answer: choices(d, ans, [noDouble, pasCount(N + 1, p), pasCount(N - 1, p), whole, ans + 2]),
        check: () => {
          let row = [1], k = 0;
          for (let r = 0; r < N; r++) { k += row.filter((x) => x !== 0).length; const next = [1]; for (let j = 1; j < row.length; j++) next.push((row[j - 1] + row[j]) % p); next.push(1); row = next; }
          return k === ans ? '' : `counted ${k}`;
        },
        solution: [
          ...why,
          `Write f(m) for how many of the first m rows’ numbers are ${p === 2 ? 'odd' : 'not multiples of 3'}; since ${N} = ${sumText}, ${links.join(', ')}.`,
          `Working back up, ${back.join(', ')}, so the answer is <b>${ints(ans)}</b>.`,
        ].join(' '),
      };
    },
    // the middle of row 2n: its power of 2 is the number of 1s in n written in base 2
    (d, ctx) => {
      const [ask, N] = pickKind(ctx, 'pascal-middle', ['not8', 'four'], [range(40, 1000)], (ask, N) => {
        let a = 0; while (2 ** (a + 1) <= N) a++;
        return N - 2 ** a >= 2;
      });
      let a = 0; while (2 ** (a + 1) <= N) a++;
      const rest = N - 2 ** a;
      let J = 0; while (2 ** (J + 1) <= rest) J++;
      const ones = a + 1, low = choose(a, 2), top = J + 1, two = low + top, ans = ask === 'not8' ? ones + two : two;
      return {
        topic: TB, rank: ask === 'not8' ? 23 : 22,
        text: `For how many integers n from 1 to ${N} is C(2n, n), the middle number of row 2n of Pascal’s triangle, ${ask === 'not8' ? 'not a multiple of 8' : 'a multiple of 4 but not a multiple of 8'}?`,
        answer: choices(d, ans, ask === 'not8' ? [two, ones + choose(a + 1, 2), ones + low, ones + two + choose(a, 3), ans + 1] : [ans + ones, choose(a + 1, 2), low, ans + 1, ans - 1]),
        check: () => {
          let c = 1n, got = 0;
          for (let m = 1; m <= N; m++) { c = (c * BigInt(2 * m - 1) * BigInt(2 * m)) / BigInt(m * m); if (ask === 'not8' ? c % 8n !== 0n : c % 4n === 0n && c % 8n !== 0n) got++; }
          return got === ans ? '' : `counted ${got}`;
        },
        solution: [
          `The power of 2 in m! is ⌊m/2⌋ + ⌊m/4⌋ + ⌊m/8⌋ + ⋯ = m − s(m), where s(m) is the number of 1s in m written in base 2 (a 1 worth 2<sup>i</sup> adds 2<sup>i−1</sup> + ⋯ + 2 + 1 = 2<sup>i</sup> − 1).`,
          `Doubling n shifts its base-2 digits without changing them, so s(2n) = s(n), and C(2n, n) = (2n)!/(n! · n!) has (2n − s(n)) − 2(n − s(n)) = s(n) factors of 2.`,
          ask === 'not8' ? 'So C(2n, n) is not a multiple of 8 exactly when n has at most two 1s in base 2.' : 'So C(2n, n) is a multiple of 4 but not of 8 exactly when n has exactly two 1s in base 2.',
          `${N} = ${based(N, 2)}, between 2<sup>${a}</sup> = ${ints(2 ** a)} and 2<sup>${a + 1}</sup>.`,
          ...(ask === 'not8' ? [`With one 1 there are the ${a + 1} powers 1, 2, 4, …, ${ints(2 ** a)}.`] : []),
          `With two 1s, 2<sup>i</sup> + 2<sup>j</sup> with i bigger than j, there are C(${a}, 2) = ${low} with i less than ${a}, all below ${ints(2 ** a)}; with i = ${a} we need 2<sup>j</sup> ≤ ${N} − ${2 ** a} = ${rest}, so j = 0 to ${J}, ${top} more.`,
          `In all, ${ask === 'not8' ? `${ones} + ` : ''}${low} + ${top} = <b>${ans}</b>.`,
        ].join(' '),
      };
    },
  ],

  [TC]: [
    // ordered triples with a given gcd and lcm: 6x for each prime whose exponent goes up by x
    (d, ctx) => {
      const glCount = ([G, L]) => product(factor(L).map(([p, e]) => (e - expOf(G, p) ? 6 * (e - expOf(G, p)) : 1)));
      const [want] = pick(ctx, 'triple-gl', [[...new Set(gcdLcmPairs().map(glCount))]]);
      const [G, L] = d.pick(gcdLcmPairs().filter((x) => glCount(x) === want));
      const info = factor(L).map(([p, e]) => ({ p, g: expOf(G, p), l: e, x: e - expOf(G, p) }));
      const each = info.map(({ x }) => (x ? 6 * x : 1)), ans = product(each);
      return {
        topic: TC, rank: 20,
        text: `How many ordered triples (a, b, c) of positive integers have gcd(a, b, c) = ${ints(G)} and lcm(a, b, c) = ${ints(L)}?`,
        answer: choices(d, ans, [product(info.map(({ x }) => (x ? 6 * (x + 1) : 1))), product(info.map(({ l }) => (l + 1) ** 3 - l ** 3)), product(info.map(({ x }) => (x + 1) ** 3)), ans / 6, product(info.map(({ x }) => (x + 1) ** 3 - x ** 3))]),
        check: () => {
          const ds = divisors(L).filter((v) => v % G === 0);
          let k = 0;
          for (const a of ds) for (const b of ds) for (const c of ds) if (gcd3(a, b, c) === G && lcm3(a, b, c) === L) k++;
          return k === ans ? '' : `counted ${k}`;
        },
        solution: [
          `Since ${ints(G)} = ${shown(G)} and ${ints(L)} = ${shown(L)}, each prime can be handled on its own, and the counts multiply.`,
          `Suppose a prime has exponent g in the gcd and g + x in the lcm, with x at least 1. Its exponents in a, b and c then run from g to g + x, with the smallest exactly g and the largest exactly g + x; of the (x + 1)<sup>3</sup> choices, x<sup>3</sup> miss g, x<sup>3</sup> miss g + x, and (x − 1)<sup>3</sup> miss both, which leaves (x + 1)<sup>3</sup> − 2x<sup>3</sup> + (x − 1)<sup>3</sup> = 6x.`,
          `Here ${info.map(({ p, g, l, x }) => (x ? `${p} has x = ${l} − ${g} = ${x}, which gives ${6 * x}` : `${p} has exponent ${l} in both, which gives 1`)).join('; ')}.`,
          `So there are ${each.join(' · ')} = <b>${ints(ans)}</b> ordered triples.`,
        ].join(' '),
      };
    },
    // the three lcms of the pairs: each prime is either all at the top, or one pair stays lower
    (d, ctx) => {
      const [want] = pick(ctx, 'triple-pair', [[...new Set(lcmPatterns().map((x) => x.count))]]);
      const P = d.pick(lcmPatterns().filter((x) => x.count === want));
      const { pats, XYZ: [X, Y, Z], count: ans } = P;
      const PAIR = ['lcm(a, b)', 'lcm(b, c)', 'lcm(c, a)'], TWO = ['α and β', 'β and γ', 'γ and α'], THIRD = ['γ', 'α', 'β'];
      const each = pats.map(([, o]) => (o[0] === 'all' ? 3 * o[1] + 1 : 2 * o[2] + 1));
      const lines = pats.map(([p, o]) => (o[0] === 'all'
        ? `For ${p}, all three lcms have ${pw(p, o[1])}, so α, β and γ are at most ${o[1]} and at least two of them equal ${o[1]}: all three (1 way) or exactly two, with the third from 0 to ${o[1] - 1} (3 · ${o[1]} ways), ${3 * o[1] + 1} in all.`
        : o[2] === 0
          ? `For ${p}, ${PAIR[o[3]]} has no factor of ${p} while the other two lcms have ${pw(p, o[1])}, so ${TWO[o[3]]} are 0 and ${THIRD[o[3]]} = ${o[1]}, just 1 way.`
          : `For ${p}, ${PAIR[o[3]]} has ${o[2] === 1 ? `just one factor of ${p}` : `only ${pw(p, o[2])}`} while the other two lcms have ${pw(p, o[1])}, so ${THIRD[o[3]]} = ${o[1]}, and ${TWO[o[3]]} are at most ${o[2]} with at least one of them equal to ${o[2]}, which happens in ${2 * o[2] + 1} ways.`));
      return {
        topic: TC, rank: 23,
        text: `How many ordered triples (a, b, c) of positive integers satisfy lcm(a, b) = ${ints(X)}, lcm(b, c) = ${ints(Y)} and lcm(c, a) = ${ints(Z)}?`,
        answer: choices(d, ans, [
          product(pats.map(([, o]) => (o[0] === 'all' ? 3 * o[1] : 2 * o[2] + 1))),
          product(pats.map(([, o]) => (o[0] === 'all' ? 3 * o[1] + 1 : (o[2] + 1) ** 2))),
          product(pats.map(([, o]) => (o[0] === 'all' ? 3 * o[1] + 1 : (2 * o[2] + 1) * (o[1] + 1)))),
          product(pats.map(([, o]) => (o[0] === 'all' ? (o[1] + 1) ** 3 - o[1] ** 3 : 2 * o[2] + 1))),
          ans + 1,
        ]),
        check: () => {
          const ds = divisors(lcm3(X, Y, Z));
          let k = 0;
          for (const a of ds) for (const b of ds) if (lcm(a, b) === X) for (const c of ds) if (lcm(b, c) === Y && lcm(c, a) === Z) k++;
          return k === ans ? '' : `counted ${k}`;
        },
        solution: [
          `Write α, β and γ for the exponents of a prime p in a, b and c; then lcm(a, b), lcm(b, c) and lcm(c, a) have max(α, β), max(β, γ) and max(γ, α) factors of p, and each prime can be handled on its own.`,
          `Here ${ints(X)} = ${shown(X)}, ${ints(Y)} = ${shown(Y)} and ${ints(Z)} = ${shown(Z)}.`,
          ...lines,
          `Multiplying, ${each.join(' · ')} = <b>${ints(ans)}</b>.`,
        ].join(' '),
      };
    },
    // sets of three different numbers with gcd 1 and a given lcm: ordered triples, less the ones with a repeat, over 6
    (d, ctx) => {
      const [N] = pick(ctx, 'triple-set', [setNumbers()]);
      const f = factor(N), w = f.length, T = product(f.map(([, e]) => 6 * e)), rep = 3 * 2 ** w, ans = (T - rep) / 6;
      return {
        topic: TC, rank: 24,
        text: `How many sets {a, b, c} of three different positive integers have gcd(a, b, c) = 1 and lcm(a, b, c) = ${ints(N)}? (The order of the three numbers doesn’t matter.)`,
        answer: choices(d, ans, [T / 6, T - rep, T / 6 - 2 ** w, (T - 2 ** w) / 6, ans + 1].filter((v) => Number.isInteger(v) && v > 0)),
        check: () => {
          const ds = divisors(N);
          let k = 0;
          for (let i = 0; i < ds.length; i++) for (let j = i + 1; j < ds.length; j++) for (let l = j + 1; l < ds.length; l++) if (gcd3(ds[i], ds[j], ds[l]) === 1 && lcm3(ds[i], ds[j], ds[l]) === N) k++;
          return k === ans ? '' : `counted ${k}`;
        },
        solution: [
          `First count ordered triples, one prime at a time: if p<sup>e</sup> is the power of p in ${ints(N)}, the exponents of p in a, b and c run from 0 to e with the smallest 0 and the largest e, and (e + 1)<sup>3</sup> − 2e<sup>3</sup> + (e − 1)<sup>3</sup> = 6e choices do that.`,
          `With ${ints(N)} = ${shown(N)}, that makes ${f.map(([, e]) => 6 * e).join(' · ')} = ${ints(T)} ordered triples.`,
          `None has a = b = c, since then the gcd would equal the lcm. If a = b, each prime has exponent 0 in a and b and e in c, or e in a and b and 0 in c, so there are 2<sup>${w}</sup> = ${2 ** w} such triples, and as many with b = c and with c = a.`,
          `That leaves ${ints(T)} − 3 · ${2 ** w} = ${ints(T - rep)} ordered triples of three different numbers, and each set shows up in 6 orders, so there are <b>${ints(ans)}</b> sets.`,
        ].join(' '),
      };
    },
  ],

  [TD]: [
    // the last two digits of a tower: the powers of a repeat every 4, 5, 10 or 20, so only the exponent's remainder matters
    (d, ctx) => {
      const [a, b, c] = pick(ctx, 'tower-100', [A100, range(2, 9), range(2, 9)], (a, b, c) => {
        const P = orderMod(a, 100), r = Number(BigInt(b) ** BigInt(c) % BigInt(P));
        return r >= 2 && b ** c > 60 && b !== c;
      });
      const P = orderMod(a, 100), R = {}, exps = CHAIN[P];
      for (const e of exps) R[e] = powMod(a, e, 100);
      const how = { 2: [1, 1], 4: [2, 2], 5: [4, 1], 10: [5, 5], 20: [10, 10] };
      const steps = exps.slice(1).map((e) => {
        const [x, y] = how[e], v = R[x] * R[y];
        return e === 2 ? `${a}<sup>2</sup> = ${ints(a * a)}, which leaves ${R[2]}` : `${a}<sup>${e}</sup> leaves the same as ${x === y ? `${R[x]}<sup>2</sup>` : `${R[x]} · ${R[y]}`} = ${ints(v)}, so ${R[e]}`;
      });
      const cyc = cycleText(b, P, c), r = cyc.r;
      const parts = []; let left = r;
      for (const e of exps.slice(0, -1).reverse()) while (left >= e) { parts.push(e); left -= e; }
      const prodV = product(parts.map((e) => R[e])), ans = prodV % 100;
      return {
        topic: TD, rank: 20,
        text: `What is the remainder when ${a}<sup>${b}<sup>${c}</sup></sup> is divided by 100? (The exponent is ${b}<sup>${c}</sup>.)`,
        answer: choices(d, ans, [powMod(a, b * c, 100), powMod(a, BigInt(c) ** BigInt(b), 100), powMod(a, mod(b ** c, 4) || 4, 100), powMod(a, mod(b ** c, 10) || 10, 100), powMod(a, r + 1, 100), ...range(1, 20).map((e) => powMod(a, e, 100)), ...range(1, 9).map((e) => mod(a * 10 * e + ans, 100))].filter((v) => v > 0)),
        check: () => { const got = powMod(a, BigInt(b) ** BigInt(c), 100); return got === ans ? '' : `the full power leaves ${got}`; },
        solution: [
          `Work with the remainders when dividing by 100: ${steps.join('; ')}.`,
          `So ${a}<sup>${P}</sup> leaves 1, the remainders of ${a}, ${a}<sup>2</sup>, ${a}<sup>3</sup>, … repeat every ${P}, and only the remainder of the exponent ${b}<sup>${c}</sup> when divided by ${P} matters.`,
          cyc.text,
          `So ${a}<sup>${b}<sup>${c}</sup></sup> leaves the same remainder as ${pw(a, r)}${parts.length > 1 ? ` = ${parts.map((e) => pw(a, e)).join(' · ')}, that is, as ${parts.map((e) => R[e]).join(' · ')} = ${ints(prodV)}, which leaves` : ', which is'} <b>${ans}</b>.`,
        ].join(' '),
      };
    },
    // a tower divided by a prime: the exponent's own powers need a second, shorter cycle
    (d, ctx) => {
      const [m, a, b, c] = pickKind(ctx, 'tower-prime', [7, 11, 13, 19, 31, 37, 41, 43], [range(2, 12), range(2, 9), [50, 64, 77, 99, 100, 128, 200, 365, 999, 1000, 2024, 2025, 2026]], (m, a, b, c) => {
        if (a > m - 2) return false;
        const P = orderMod(a, m);
        if (P < 4 || P > 12 || gcd(b, P) === 1) return false;
        const r = powMod(b, c, P);
        if (r === 0) return false;
        return powMod(a, r, m) > 1;
      });
      const P = orderMod(a, m), seq = range(1, P).map((e) => powMod(a, e, m)), cyc = cycleText(b, P, c), r = cyc.r, ans = seq[r - 1];
      return {
        topic: TD, rank: 22,
        text: `What is the remainder when ${a}<sup>${b}<sup>${c}</sup></sup> is divided by ${m}? (The exponent is ${b}<sup>${c}</sup>.)`,
        answer: choices(d, ans, [powMod(a, powMod(b, c, m) || m, m), powMod(a, powMod(b, c % P, P) || P, m), powMod(a, (b * c) % P || P, m), powMod(b, c, m), powMod(a, c % P || P, m), ...seq, ...range(1, m - 1)].filter((v) => v > 0 && v < m)),
        check: () => { const got = powMod(a, BigInt(b) ** BigInt(c), m); return got === ans ? '' : `the full power leaves ${got}`; },
        solution: [
          `The remainders of ${a}, ${a}<sup>2</sup>, ${a}<sup>3</sup>, … when divided by ${m} are ${seq.join(', ')}, …; ${a}<sup>${P}</sup> leaves 1, so they repeat every ${P}, and only the remainder of the exponent ${b}<sup>${c}</sup> when divided by ${P} matters.`,
          cyc.text,
          `So ${a}<sup>${b}<sup>${c}</sup></sup> leaves the same remainder as ${pw(a, r)}, which is <b>${ans}</b>.`,
        ].join(' '),
      };
    },
    // how many n make aⁿ ± n (or aⁿ + n²) a multiple of m: two periods together repeat every P·m
    (d, ctx) => {
      const [kind, m, a, N] = pickKind(ctx, 'tower-count', ['+', '−', 'sq'], [[5, 7, 11, 13], range(2, 12), [100, 120, 150, 200, 250, 300, 365, 400, 500, 750, 1000, 2025]], (kind, m, a, N) => {
        if (a > m - 2) return false;
        const P = orderMod(a, m), L = P * m;
        if (P < 3 || (kind === 'sq' && P > 6) || N < 2 * L || N % L === 0) return false;
        const { S } = towerSols(kind, m, a);
        return kind !== 'sq' || (S.length > 0 && S.length !== P);
      });
      const { P, L, S, per } = towerSols(kind, m, a), q = Math.floor(N / L), t = N % L, tail = S.filter((s) => s <= t), ans = q * S.length + tail.length;
      const seq = range(1, P).map((e) => powMod(a, e, m)), expr = `${a}<sup>n</sup> ${kind === '−' ? '−' : '+'} ${kind === 'sq' ? 'n<sup>2</sup>' : 'n'}`;
      const rule = kind === 'sq'
        ? `If n leaves r when divided by ${P}, then ${a}<sup>n</sup> leaves the same as ${a}<sup>r</sup>, and n<sup>2</sup> must leave the remainder of −${a}<sup>r</sup> when divided by ${m}; ${per.map(({ r, ar, t: tt, us }) => `for r = ${r}, ${pw(a, r)} leaves ${ar}, so n<sup>2</sup> must leave ${tt}, ${us.length ? `which happens when n leaves ${listing(us, 'or')}` : 'which no square does'}`).join('; ')}.`
        : `If n leaves r when divided by ${P}, then ${a}<sup>n</sup> leaves the same as ${a}<sup>r</sup>, and n must leave ${kind === '+' ? `the remainder of −${a}<sup>r</sup>` : `the same remainder as ${a}<sup>r</sup>`} when divided by ${m}; for each r exactly one n in every block of ${L} does both.`;
      return {
        topic: TD, rank: kind === 'sq' ? 24 : 22,
        text: `For how many positive integers n ≤ ${ints(N)} is ${expr} a multiple of ${m}?`,
        answer: choices(d, ans, [Math.floor(N / m), q * S.length, (q + 1) * S.length, towerCount(kind === '+' ? '−' : '+', m, a, N), Math.round((N * S.length) / L) === ans ? ans + 2 : Math.round((N * S.length) / L), ans - 1]),
        check: () => { let k = 0; for (let n = 1; n <= N; n++) { const v = powMod(a, n, m) + (kind === '+' ? n : kind === '−' ? -n : n * n); if (mod(v, m) === 0) k++; } return k === ans ? '' : `counted ${k}`; },
        solution: [
          `The remainders of ${a}, ${a}<sup>2</sup>, ${a}<sup>3</sup>, … when divided by ${m} are ${seq.join(', ')}, repeating every ${P}, while the remainder of ${kind === 'sq' ? 'n<sup>2</sup>' : 'n'} repeats every ${m}; since ${P} and ${m} share no factor, the whole pattern repeats every ${P} · ${m} = ${L}.`,
          rule,
          `So from 1 to ${L} the n that work are ${listing(S)}.`,
          `${ints(N)} = ${q} · ${L} + ${t}, so the ${q} full blocks hold ${q} · ${S.length} = ${q * S.length}, and 1 to ${t} hold ${tail.length} more${tail.length ? ` (${listing(tail)})` : ''}, which makes <b>${ints(ans)}</b>.`,
        ].join(' '),
      };
    },
  ],

  [TE]: [
    // numbers up to N with exactly k divisors: one count for each shape p^a q^b ⋯, prime by prime
    (d, ctx) => {
      const [k, cond, N] = pickKind(ctx, 'divisor-exact', [4, 6, 8], [['', 'odd', 'even'], [50, 60, 70, 80, 90, 100, 110, 120, 150, 180, 200, 250, 300]], (k, cond, N) => {
        if (!NLIST[k].includes(N)) return false;
        const keep = (v) => (cond === 'odd' ? v % 2 === 1 : cond === 'even' ? v % 2 === 0 : true);
        const counts = SHAPES[k].map((sh) => total(shapeGroups(sh, N, keep).map((g) => g.last.length)));
        return total(counts) >= 6 && total(counts) <= 60 && counts.filter((x) => x > 0).length >= 2;
      });
      const keep = (v) => (cond === 'odd' ? v % 2 === 1 : cond === 'even' ? v % 2 === 0 : true), word = cond ? `${cond} ` : '';
      const shapes = SHAPES[k].map((sh) => ({ sh, groups: shapeGroups(sh, N, keep) })).map((x) => ({ ...x, count: total(x.groups.map((g) => g.last.length)) }));
      const ans = total(shapes.map((x) => x.count));
      const qText = (g) => (g.last.length <= 4 ? `= ${listing(g.last, 'or')}` : `one of the ${g.last.length} primes from ${g.last[0]} to ${g.last.at(-1)}${g.skip && g.last[0] < g.skip && g.skip < g.last.at(-1) ? ` other than ${g.skip}` : ''}`);
      const lines = shapes.map(({ sh, groups, count }) => {
        const form = FORM(sh), letter = sh.length === 3 ? 'r' : 'q';
        if (sh.length === 1) {
          const vals = groups.length ? groups[0].last.map((p) => p ** sh[0]) : [];
          const first = PRIMES.find((p) => keep(p ** sh[0]));
          return vals.length > 1 ? `The ${word}numbers ${form} up to ${N} are ${listing(vals.map(ints))}, so ${vals.length}.` : vals.length ? `The only ${word}number ${form} up to ${N} is ${ints(vals[0])}, so 1.` : `No ${word}number ${form} is at most ${N} (${pw(first, sh[0])} = ${ints(first ** sh[0])}), so 0.`;
        }
        return `For ${form}${sh[0] === 1 ? ` with ${sh.length === 3 ? 'p &lt; q &lt; r' : 'p &lt; q'}` : ''}, ${groups.map((g) => `${g.lead}${letter} with ${letter} ${qText(g)} gives ${g.last.length}`).join(', ')}${groups.length > 1 ? `, so ${count}` : ''}.`;
      });
      const plain = (cond === '' ? ans : (() => { const all = SHAPES[k].map((sh) => total(shapeGroups(sh, N, () => true).map((g) => g.last.length))); return total(all); })());
      const single = shapes[0].count, repeat = k === 4 ? 0 : PRIMES.filter((p) => p ** (SHAPES[k][1][0] + 1) <= N && keep(p ** (SHAPES[k][1][0] + 1))).length;
      const pairs = shapes.find(({ sh }) => sh.length === 2 && sh[0] === 1)?.count ?? 0;
      return {
        topic: TE, rank: k === 4 && cond === '' ? 18 : k === 8 ? 21 : 20,
        text: `How many ${word}integers from 1 to ${N} have exactly ${k} positive divisors?`,
        answer: choices(d, ans, [ans - single, plain, ans + repeat, ans + pairs, ans + 1, ans - 1].filter((v) => v > 0)),
        check: () => { let c = 0; for (let n = 1; n <= N; n++) if (keep(n) && dcount(n) === k) c++; return c === ans ? '' : `counted ${c}`; },
        solution: [
          `A number p<sup>a</sup>q<sup>b</sup>⋯ (p, q, … different primes) has (a + 1)(b + 1)⋯ positive divisors, so exactly ${k} divisors means it is ${listing(SHAPES[k].map(FORM), 'or')}${SHAPES[k].some((sh) => sh.length === 3) ? ' (p, q and r different primes)' : ''}${cond === 'odd' ? ', and being odd, it can’t use the prime 2' : cond === 'even' ? ', and being even, it must use the prime 2' : ''}.`,
          ...lines,
          `In all, ${shapes.map((x) => x.count).join(' + ')} = <b>${ans}</b>.`,
        ].join(' '),
      };
    },
    // divisors of a big power with exactly k divisors of their own: exponent patterns, and the caps on each prime
    (d, ctx) => {
      const [base, n, k] = pick(ctx, 'divisor-divisors', [E2BASES, [2, 3, 4, 5, 6], [4, 6, 8, 9, 10, 12, 16, 18, 20, 24]], (base, n, k) => {
        if (base ** n > 1e12) return false;
        const caps = factor(base).map(([, e]) => e * n), { ans, unlimited, pats } = tupleCount(caps, k);
        return ans >= 3 && ans <= 40 && unlimited !== ans && pats.filter((g) => g.count > 0).length >= 2;
      });
      const M = base ** n, f = factor(M), caps = f.map(([, e]) => e), { ans, unlimited, pats } = tupleCount(caps, k);
      const L = LETTERS.slice(0, f.length), used = pats.filter((g) => g.count > 0);
      return {
        topic: TE, rank: 20,
        text: `How many positive divisors of ${base}<sup>${n}</sup> have exactly ${k} positive divisors themselves?`,
        answer: choices(d, ans, [unlimited, pats.length, used.length, ans + 1, ans - 1, total(used.map((g) => g.perms))]),
        check: () => {
          // every divisor of M, made from its prime powers, and the divisors of each one found among them
          let ds = [1];
          for (const [p, e] of f) ds = ds.flatMap((v) => range(0, e).map((i) => v * p ** i));
          const got = ds.filter((t) => ds.filter((s) => t % s === 0).length === k).length;
          return got === ans ? '' : `counted ${got}`;
        },
        solution: [
          `${base}<sup>${n}</sup> = ${shown(M)}, so its divisors are ${f.map(([p], i) => `${p}<sup>${L[i]}</sup>`).join(' · ')} with ${f.map(([, e], i) => `${L[i]} from 0 to ${e}`).join(', ')}, and such a divisor has ${L.map((x) => `(${x} + 1)`).join('')} divisors of its own.`,
          `So ${L.map((x) => `(${x} + 1)`).join('')} = ${k}, which means the exponents, in some order, are ${pats.map((g) => g.exps.join(', ')).join('; or ')}.`,
          `Taking the caps into account, ${pats.map((g) => `${g.exps.join(', ')} fits in ${g.count} of its ${g.perms} order${g.perms === 1 ? '' : 's'}`).join('; ')}.`,
          `In all, ${pats.map((g) => g.count).join(' + ')} = <b>${ans}</b>.`,
        ].join(' '),
      };
    },
    // the sum of the divisors is odd exactly for squares and twice squares
    (d, ctx) => {
      const [ask, N] = pickKind(ctx, 'divisor-sum', ['odd', 'even', 'evenOdd'], [[100, 150, 200, 250, 300, 400, 500, 600, 750, 800, 1000, 1200, 1500, 2000, 2025]]);
      const s1 = isqrt(N), s2 = isqrt(Math.floor(N / 2)), s3 = isqrt(Math.floor(N / 4)), odd = s1 + s2, ans = { odd, even: N - odd, evenOdd: s3 + s2 }[ask];
      const sigma = (n) => { let s = 0; for (let i = 1; i * i <= n; i++) if (n % i === 0) s += i + (i * i === n ? 0 : n / i); return s; };
      const counts = `Up to ${ints(N)} there are ${s1} squares (${s1}<sup>2</sup> = ${ints(s1 * s1)}) and ${s2} numbers 2m<sup>2</sup> (2 · ${s2}<sup>2</sup> = ${ints(2 * s2 * s2)})`;
      return {
        topic: TE, rank: ask === 'evenOdd' ? 21 : 20,
        text: ask === 'evenOdd' ? `For how many even integers n from 1 to ${ints(N)} is the sum of all the positive divisors of n odd?` : `For how many integers n from 1 to ${ints(N)} is the sum of all the positive divisors of n ${ask}?`,
        answer: choices(d, ans, { odd: [s1, s1 + s3, N - odd, odd + 1, odd - 1, 2 * s1], even: [N - s1, odd, N - s2, N - odd + 1, Math.floor(N / 2)], evenOdd: [s2, s3, s1 + s2, ans + 1, ans - 1] }[ask]),
        check: () => { let k = 0; for (let n = 1; n <= N; n++) { const o = sigma(n) % 2 === 1; if (ask === 'odd' ? o : ask === 'even' ? !o : o && n % 2 === 0) k++; } return k === ans ? '' : `counted ${k}`; },
        solution: [
          `If n = 2<sup>a</sup> · p<sup>b</sup> · q<sup>c</sup> ⋯ with p, q, … odd primes, the sum of its divisors is (1 + 2 + ⋯ + 2<sup>a</sup>)(1 + p + ⋯ + p<sup>b</sup>)(1 + q + ⋯ + q<sup>c</sup>)⋯, since each divisor picks one term from each bracket.`,
          `The first bracket is always odd, and 1 + p + ⋯ + p<sup>b</sup> adds up b + 1 odd numbers, so it is odd exactly when b is even.`,
          `So the sum is odd exactly when every odd prime has an even exponent, which means n is a perfect square (a even) or twice a perfect square (a odd).`,
          ask === 'odd' ? `${counts}, so <b>${ints(ans)}</b>.`
            : ask === 'even' ? `${counts}, which makes ${odd} with an odd sum, so the other ${ints(N)} − ${odd} = <b>${ints(ans)}</b> have an even sum.`
              : `The even ones are the even squares (2m)<sup>2</sup>, ${s3} of them up to ${ints(N)} (${2 * s3}<sup>2</sup> = ${ints(4 * s3 * s3)}), and all ${s2} of the numbers 2m<sup>2</sup> (2 · ${s2}<sup>2</sup> = ${ints(2 * s2 * s2)}), so <b>${ints(ans)}</b>.`,
        ].join(' '),
      };
    },
  ],

  [TF]: [
    // sums of different powers of b, in order: count in base 2 and read the digits in base b
    (d, ctx) => {
      const [kind, k] = pickKind(ctx, 'base-list', ['nth 3', 'place 4', 'nth 5', 'place 3', 'nth 4', 'place 5'], [range(30, 260)], (kind, k) => digitsOf(k, 2).filter((x) => x === 1).length >= 3 && readIn(digitsOf(k, 2), +kind.split(' ')[1]) <= 200000);
      const [ask, bs] = kind.split(' '), b = +bs;
      const bin = digitsOf(k, 2), value = readIn(bin, b), terms = bin.map((x, i) => (x ? pwr(b, bin.length - 1 - i) : null)).filter(Boolean);
      const val = (j) => readIn(digitsOf(j, 2), b), intro = `The positive integers that are sums of one or more different powers of ${b} (that is, of 1, ${b}, ${b * b}, ${b ** 3}, …) are listed in increasing order, starting 1, ${b}, ${b + 1}, ${b * b}, ${b * b + 1} and so on.`;
      return {
        topic: TF, rank: ask === 'nth' ? 17 : 18,
        text: ask === 'nth' ? `${intro} What is the ${ord(k)} number in the list?` : `${intro} In which place in the list is ${ints(value)}?`,
        answer: ask === 'nth'
          ? choices(d, value, [val(k - 1), val(k + 1), readIn(bin, b + 1), b > 3 ? readIn(bin, b - 1) : k, val(k) + 1])
          : choices(d, k, [k - 1, k + 1, 2 ** bin.length - 1, k - 2 ** (bin.length - 1) + 1, 2 * k]),
        check: () => {
          const list = [];
          for (let n = 1; n <= Math.max(val(k + 1), value) && list.length <= k + 1; n++) if (digitsOf(n, b).every((x) => x <= 1)) list.push(n);
          return list[k - 1] === value ? '' : `the ${k}th is ${list[k - 1]}`;
        },
        solution: [
          `A sum of different powers of ${b} is a number whose base-${b} digits are all 0s and 1s, like ${b * b + 1} = ${based(b * b + 1, b)}.`,
          `Two such numerals compare the same way whether they are read in base ${b} or in base 2 (more digits means bigger, and otherwise the first place where they differ decides), and read in base 2 they are just 1, 2, 3, … in order.`,
          ask === 'nth'
            ? `So the ${ord(k)} number has the digits of ${k} = ${bin.join('')}<sub>2</sub>, read in base ${b}: ${bin.join('')}<sub>${b}</sub> = ${terms.join(' + ')} = <b>${ints(value)}</b>.`
            : `${ints(value)} = ${terms.join(' + ')} = ${bin.join('')}<sub>${b}</sub>, and ${bin.join('')}<sub>2</sub> = ${k}, so it is number <b>${k}</b> in the list.`,
        ].join(' '),
      };
    },
    // how many numbers up to N use only 0s and 1s in base b: go along N's digits from the left
    (d, ctx) => {
      const [b, N] = pick(ctx, 'base-count', [[3, 4, 5], range(100, 3000)], (b, N) => {
        const ds = digitsOf(N, b), i = ds.findIndex((x) => x >= 2);
        return ds.length >= 5 && ds[0] === 1 && i >= 2 && ds.slice(1, i).includes(1);
      });
      const ds = digitsOf(N, b), L = ds.length, parts = [];
      let cnt = 0;
      for (let i = 0; i < L; i++) {
        const rem = L - 1 - i;
        if (ds[i] >= 2) { parts.push({ i, big: true, add: 2 ** (rem + 1), rem }); cnt += 2 ** (rem + 1); break; }
        if (ds[i] === 1) { parts.push({ i, big: false, add: 2 ** rem, rem }); cnt += 2 ** rem; }
      }
      const ans = cnt - 1, stop = parts.at(-1), Nb = ds.join('');
      const largest = readIn([...ds.slice(0, stop.i), 1, ...Array(stop.rem).fill(1)], b);
      const text = (x) => {
        const rest = x.rem ? `, then anything in the last ${x.rem} place${x.rem > 1 ? 's' : ''}` : '';
        if (!x.i) return `0 first (where ${Nb} has its leading 1)${rest}, which gives ${x.add}`;
        return `${ds.slice(0, x.i).join('')} first, then ${x.big ? `0 or 1 where ${Nb} has its ${ds[x.i]}` : `0 where ${Nb} has a 1`}${rest}, which gives ${x.big && x.rem ? `2 · ${2 ** x.rem} = ` : ''}${x.add}`;
      };
      return {
        topic: TF, rank: 21,
        text: `How many of the integers 1, 2, 3, …, ${ints(N)} have only the digits 0 and 1 when they are written in base ${b}?`,
        answer: choices(d, ans, [cnt, 2 ** L - 1, readIn(ds.map((x) => Math.min(x, 1)), 2), largest, 2 ** (L - 1) - 1, ans + 2]),
        check: () => { let k = 0; for (let n = 1; n <= N; n++) if (digitsOf(n, b).every((x) => x <= 1)) k++; return k === ans ? '' : `counted ${k}`; },
        solution: [
          `${ints(N)} = ${based(N, b)}, so we want the ${L}-digit strings of 0s and 1s (leading zeros allowed) that are at most ${Nb} in base ${b}.`,
          `Compare from the left: a string that agrees with ${Nb} up to some place and is smaller there is smaller, whatever comes after, so count by the first place where it is smaller.`,
          `Going along, ${parts.map(text).join('; ')}.`,
          `No string can agree past the ${ds[stop.i]}, so there are ${parts.map((x) => x.add).join(' + ')} = ${cnt} strings; one of them is 0, which leaves <b>${ints(ans)}</b>.`,
        ].join(' '),
      };
    },
    // palindromes in base 2 or 3 up to N: the shorter ones all count, the longest are settled by their first half
    (d, ctx) => {
      const [b, N] = pickKind(ctx, 'base-pal', [2, 3], [range(100, 2000)], (b, N) => {
        const ds = digitsOf(N, b), L = ds.length, h = Math.ceil(L / 2), pre = readIn(ds.slice(0, h), b);
        return (b === 2 || N <= 1500) && L >= 6 && pre - b ** (h - 1) >= 2 && !isPal(ds);
      });
      const ds = digitsOf(N, b), L = ds.length, h = Math.ceil(L / 2), preDs = ds.slice(0, h), pre = readIn(preDs, b);
      const palDs = [...preDs, ...preDs.slice(0, L - h).reverse()], pal = readIn(palDs, b), extra = pal <= N ? 1 : 0;
      const shorter = range(1, L - 1).map((l) => (b - 1) * b ** (Math.ceil(l / 2) - 1)), S = total(shorter), X = pre - b ** (h - 1), ans = S + X + extra;
      const ex = b === 2 ? 9 : 16;
      return {
        topic: TF, rank: b === 2 ? 22 : 23,
        text: `How many of the integers 1, 2, 3, …, ${ints(N)} are palindromes when written in base ${b}? (A palindrome reads the same forwards and backwards, like ${ex} = ${based(ex, b)}.)`,
        answer: choices(d, ans, [S + (b - 1) * b ** (h - 1), S, ans + 1, ans - 1, S + X + (1 - extra)]),
        check: () => { let k = 0; for (let n = 1; n <= N; n++) if (isPal(digitsOf(n, b))) k++; return k === ans ? '' : `counted ${k}`; },
        solution: [
          `${ints(N)} = ${based(N, b)}, which has ${L} digits in base ${b}.`,
          `A base-${b} palindrome with ℓ digits is settled by its first ⌈ℓ/2⌉ digits, the first of which can’t be 0, so there are ${b === 2 ? '' : '2 · '}${b}<sup>⌈ℓ/2⌉ − 1</sup> of them; for ℓ = 1 to ${L - 1} that is ${shorter.join(' + ')} = ${S}.`,
          `A ${L}-digit palindrome is settled by its first ${h} digits, and if those are less than ${preDs.join('')}, the first ${h} digits of ${ds.join('')}<sub>${b}</sub>, the palindrome is less than ${ints(N)}; as base-${b} numbers the first halves run from ${'1' + '0'.repeat(h - 1)}<sub>${b}</sub> = ${b ** (h - 1)} up, so ${pre} − ${b ** (h - 1)} = ${X} of them are less than ${preDs.join('')}<sub>${b}</sub> = ${pre}.`,
          `The palindrome that starts with ${preDs.join('')} is ${palDs.join('')}<sub>${b}</sub> = ${ints(pal)}, which is ${extra ? `less than ${ints(N)}, so it counts too` : `more than ${ints(N)}, so it doesn’t count`}.`,
          `In all, ${S} + ${X}${extra ? ' + 1' : ''} = <b>${ans}</b>.`,
        ].join(' '),
      };
    },
  ],

  [TG]: [
    // doubling: the digits of 2n add up to 2S(n) − 9c, c the digits from 5 to 9
    (d, ctx) => {
      const [t] = pick(ctx, 'carry-double', [range(-8, 9)], (t) => { const cs = carryCases(t), n = total(cs.map((x) => total([...x.split.values()]))); return cs.length >= 2 && n >= 10 && n <= 250; });
      const cs = carryCases(t), counts = cs.map((x) => total([...x.split.values()])), ans = total(counts);
      const ignore = total(cs.map((x) => sumCount(x.s))), flipT = total(carryCases(-t).map((x) => total([...x.split.values()])));
      const rel = t === 0 ? 'the same total as' : t > 0 ? `exactly ${t} more than` : `exactly ${-t} less than`;
      const caseText = ({ c, s, split }) => {
        const n = total([...split.values()]);
        const are = n === 1 ? 'is 1' : `are ${n}`;
        if (c === 0) return `with no big digit and digit sum ${s} there ${are}`;
        if (c === 3) return `with all 3 digits big and digit sum ${s} there ${are}`;
        const keys = [...split.keys()].sort(), where = keys.map((key) => `${split.get(key)} with the big digit${c > 1 ? 's' : ''} ${PLACE[c][key]}`);
        return `with ${c} big digit${c > 1 ? 's' : ''} and digit sum ${s} there ${where.length > 1 ? `are ${listing(where)}, so ${n}` : `${are} (with the big digit${c > 1 ? 's' : ''} ${PLACE[c][keys[0]]})`}`;
      };
      return {
        topic: TG, rank: 22,
        text: `For how many three-digit positive integers n do the digits of 2n add up to ${rel} the digits of n?`,
        answer: choices(d, ans, [ignore, Math.max(...counts), ans - Math.min(...counts), flipT, ans + 1].filter((v) => v > 0)),
        check: () => { let k = 0; for (let n = 100; n <= 999; n++) if (dsum(2 * n) - dsum(n) === t) k++; return k === ans ? '' : `counted ${k}`; },
        solution: [
          `Double n one place at a time from the units: a digit d becomes 2d, plus 1 if a carry comes in, and a carry goes out exactly when d is 5 or more, since 2 · 4 + 1 = 9 but 2 · 5 = 10.`,
          `Without carries the digits of 2n would add up to 2S, where S is the digit sum of n; each carry turns 10 in one place into 1 in the next and takes 9 off, so the digits of 2n add up to 2S − 9c, where c is how many digits of n are 5 or more.`,
          `So 2S − 9c = S${t === 0 ? '' : t > 0 ? ` + ${t}` : ` − ${-t}`}, that is, S = 9c${t === 0 ? '' : t > 0 ? ` + ${t}` : ` − ${-t}`}, which leaves ${listing(cs.map(({ c, s }) => `c = ${c} with S = ${s}`), 'or')}.`,
          `Calling the digits from 5 to 9 big (and n can’t start with 0), ${cs.map(caseText).join('; ')}.`,
          `In all, ${counts.join(' + ')} = <b>${ans}</b>.`,
        ].join(' '),
      };
    },
    // multiplying by 11, 101, 111 or 1001 adds shifted copies of n: the digit sum is k·S(n) exactly when nothing carries
    (d, ctx) => {
      const [ask, M] = pickKind(ctx, 'carry-times', ['eq', 'less'], [MULTS]);
      const count = multCount(M, 9), tot = 9 * 10 ** (M.L - 1), ans = ask === 'eq' ? count : tot - count, times = M.k === 2 ? 'twice' : 'three times';
      const slips = [multCount(M, 9, { lead0: true }), multCount(M, 10), multCount(M, 9, { first: true })].map((v) => (ask === 'eq' ? v : tot - v));
      const letters = M.letters.split('');
      return {
        topic: TG, rank: M.rank,
        text: `For how many ${M.L === 3 ? 'three' : 'four'}-digit positive integers n is the sum of the digits of ${M.m}n ${ask === 'eq' ? `exactly ${times}` : `less than ${times}`} the sum of the digits of n?`,
        answer: choices(d, ans, [tot - ans, ...slips, tot, ans + 1].filter((v) => v > 0)),
        check: () => { let k = 0; for (let n = 10 ** (M.L - 1); n < 10 ** M.L; n++) { const x = dsum(M.m * n), y = M.k * dsum(n); if (ask === 'eq' ? x === y : x < y) k++; } return k === ans ? '' : `counted ${k}`; },
        solution: [
          `Write n with digits ${letters.join(', ')} (so n is ${M.letters}, with a not 0); then ${M.m}n = ${M.parts}, and adding in columns gives, from the left, the column sums ${M.cols}.`,
          `These column sums add up to ${M.k}(${letters.join(' + ')}), ${times} the digit sum of n, and if none of them reaches 10 they are exactly the digits of ${M.m}n; each carry turns 10 in one column into 1 in the next and takes 9 off, so the digits of ${M.m}n add up to ${times} the digit sum of n, minus 9 for every carry.`,
          `So the digit sum of ${M.m}n is ${times} that of n exactly when nothing carries, which happens exactly when ${M.cond}${ask === 'less' ? ', and otherwise it is less' : ''}.`,
          ask === 'eq' ? `${M.how} = <b>${ints(count)}</b>.` : `${M.how} = ${ints(count)}. Those are the numbers with no carry, and the other ${ints(tot)} − ${ints(count)} = <b>${ints(ans)}</b> have a smaller digit sum.`,
        ].join(' '),
      };
    },
    // the smallest n with given digit sums for n and 2n: the gap fixes how many digits are 5 or more
    (d, ctx) => {
      const [A, c] = pick(ctx, 'carry-least', [range(12, 34), [1, 2, 3, 4]], (A, c) => {
        const B = 2 * A - 9 * c, L = leastLen(A, c);
        if (B < 3 || L === null || L > 6) return false;
        const n = leastWith(A, c, L);
        return n !== null && n !== Number(`${A % 9 || ''}${'9'.repeat(Math.floor(A / 9))}`);
      });
      const B = 2 * A - 9 * c, L = leastLen(A, c), n = leastWith(A, c, L), any = Number(`${A % 9 || ''}${'9'.repeat(Math.floor(A / 9))}`);
      const max = 9 * c + 4 * (L - c), prevMax = L - 1 >= c ? 9 * c + 4 * (L - 1 - c) : null;
      return {
        topic: TG, rank: 21,
        text: `What is the smallest positive integer n for which the digits of n add up to ${A} and the digits of 2n add up to ${B}?`,
        answer: choices(d, n, [any, leastC(A, c + 1), leastC(A, c - 1), Number(String(n).split('').reverse().join('')), n + 9].filter((v) => v !== null && v > 0), ints),
        check: () => { for (let x = 1; x <= 1000000; x++) if (dsum(x) === A && dsum(2 * x) === B) return x === n ? '' : `the smallest is ${x}`; return 'none below a million'; },
        solution: [
          `Doubling a digit d makes a carry exactly when d is 5 or more, and each carry takes 9 off the digit sum, so the digits of 2n add up to 2 · (the digit sum of n) − 9c, where c is how many digits of n are 5 or more.`,
          `Here 2 · ${A} − 9c = ${B}, so c = ${c}, and n has exactly ${c} digit${c > 1 ? 's' : ''} from 5 to 9, with every other digit from 0 to 4.`,
          prevMax === null ? `n needs at least ${c} digits, and ${c} digits from 5 to 9 can add up to as much as ${max}, so n has ${L} digits (fewer digits make a smaller number).`
            : `With ${L} digits the most they can add up to is 9 · ${c} + 4 · ${L - c} = ${max}, while ${L - 1} digits reach at most ${prevMax}, less than ${A}, so n has ${L} digits (fewer digits make a smaller number).`,
          `Now make each digit from the left as small as it can be while the rest can still reach the total with the right number of big digits, which gives ${ints(n)}; its digits add up to ${A}, and 2 · ${ints(n)} = ${ints(2 * n)} has digit sum ${B}.`,
          `So n = <b>${ints(n)}</b>.`,
        ].join(' '),
      };
    },
  ],

  [TH]: [
    // the smallest n that is several powers at once: each prime's exponent meets one condition of its own and the others
    (d, ctx) => {
      const [want] = pick(ctx, 'powers-divisors', [[...new Set(threeConds().map(threeDivs))]]);
      const conds = d.pick(threeConds().filter((x) => threeDivs(x) === want));
      const es = conds.map((x, i) => expFor(conds, i)), ans = product(es.map((e) => e + 1)), fl = flip(conds), fes = fl.map((x, i) => expFor(fl, i));
      return {
        topic: TH, rank: 20,
        text: `Let n be the smallest positive integer for which ${conds.slice(0, 2).map(condText).join(', ')}, and ${condText(conds[2])}. How many positive divisors does n have?`,
        answer: choices(d, ans, [product(es), product(fes.map((e) => e + 1)), product(es.map((e) => e + 2)), total(es.map((e) => e + 1)), ans + es[0] + 1], ints),
        check: () => { const got = product(bruteExps(conds).map((e) => e + 1)); return got === ans ? '' : `found ${got}`; },
        solution: [
          `A perfect k-th power is a number whose prime exponents are all multiples of k, and the smallest n uses no primes besides ${listing(conds.map(([q]) => q))}, so look at the exponent of each of them.`,
          ...conds.map(([q], i) => `The exponent of ${q} has to be ${ownText(conds[i])} (so that ${condText(conds[i])}) and a multiple of ${listing(conds.filter((x, j) => j !== i).map(([, kk]) => kk), 'and of')} (for the other two), and the smallest such number is ${es[i]}.`),
          `So n = ${conds.map(([q], i) => pw(q, es[i])).join(' · ')}, which has ${es.map((e) => e + 1).join(' · ')} = <b>${ints(ans)}</b> positive divisors.`,
        ].join(' '),
      };
    },
    // the same n, and its divisors that are squares, cubes, or multiples of two of its primes
    (d, ctx) => {
      const ask = ['square', 'cube', 'mult'][ctx.k % 3];
      const [want] = pick({ ...ctx, k: Math.floor(ctx.k / 3) }, `powers-which-${ask}`, [[...new Set(threeConds().map((x) => threeAsk(x, ask)))]]);
      const conds = d.pick(threeConds().filter((x) => threeAsk(x, ask) === want));
      const es = conds.map((x, i) => expFor(conds, i)), [q1, q2] = conds.map(([q]) => q);
      const sq = product(es.map((e) => Math.floor(e / 2) + 1)), cu = product(es.map((e) => Math.floor(e / 3) + 1)), mu = es[0] * es[1] * (es[2] + 1);
      const ans = { square: sq, cube: cu, mult: mu }[ask], all = product(es.map((e) => e + 1));
      const what = { square: 'perfect squares', cube: 'perfect cubes', mult: `multiples of ${q1 * q2}` }[ask];
      const last = ask === 'mult'
        ? `A divisor ${conds.map(([q], i) => `${q}<sup>${LETTERS[i]}</sup>`).join(' · ')} is a multiple of ${q1 * q2} when x is 1 to ${es[0]} and y is 1 to ${es[1]}, with z anything from 0 to ${es[2]}, so ${es[0]} · ${es[1]} · ${es[2] + 1} = <b>${ints(ans)}</b>.`
        : `A divisor is a perfect ${ask} exactly when each of its exponents is a multiple of ${ask === 'square' ? 2 : 3}, so ${conds.map(([q], i) => `the exponent of ${q} has ${Math.floor(es[i] / (ask === 'square' ? 2 : 3)) + 1} choices (0 to ${(ask === 'square' ? 2 : 3) * Math.floor(es[i] / (ask === 'square' ? 2 : 3))})`).join(', ')}, and ${es.map((e) => Math.floor(e / (ask === 'square' ? 2 : 3)) + 1).join(' · ')} = <b>${ints(ans)}</b>.`;
      return {
        topic: TH, rank: 22,
        text: `Let n be the smallest positive integer for which ${conds.slice(0, 2).map(condText).join(', ')}, and ${condText(conds[2])}. How many positive divisors of n are ${what}?`,
        answer: choices(d, ans, {
          square: [all, product(es.map((e) => Math.ceil(e / 2))), product(es.map((e) => Math.floor(e / 2))), cu, sq + 1],
          cube: [all, product(es.map((e) => Math.ceil(e / 3))), product(es.map((e) => Math.floor(e / 3))), sq, cu + 1],
          mult: [all, product(es), (es[0] - 1) * (es[1] - 1) * (es[2] + 1), es[0] * es[1] * es[2], (es[0] + 1) * (es[1] + 1) * es[2]],
        }[ask], ints),
        check: () => {
          // the smallest n found by trying exponents, then every divisor of it tested one by one
          const e = bruteExps(conds);
          let k = 0;
          for (let x = 0; x <= e[0]; x++) for (let y = 0; y <= e[1]; y++) for (let z = 0; z <= e[2]; z++) {
            const fits = ask === 'mult' ? x >= 1 && y >= 1 : [x, y, z].every((v) => v % (ask === 'square' ? 2 : 3) === 0);
            if (fits) k++;
          }
          return k === ans ? '' : `counted ${k}`;
        },
        solution: [
          `A perfect k-th power is a number whose prime exponents are all multiples of k, and the smallest n uses no primes besides ${listing(conds.map(([q]) => q))}.`,
          ...conds.map(([q], i) => `The exponent of ${q} has to be ${ownText(conds[i])} and a multiple of ${listing(conds.filter((x, j) => j !== i).map(([, kk]) => kk), 'and of')}, so it is ${es[i]}.`),
          `So n = ${conds.map(([q], i) => pw(q, es[i])).join(' · ')}.`,
          last,
        ].join(' '),
      };
    },
    // every n that meets two power conditions is n0 · t^L, so counting them up to 10^j is counting t
    (d, ctx) => {
      const [want] = pick(ctx, 'powers-count', [[...new Set(twoConds().map((x) => x.T))]]);
      const { conds, j, T } = d.pick(twoConds().filter((x) => x.T === want));
      const [[q1, k1], [q2, k2]] = conds, L = k1 * k2, e1 = expFor(conds, 0), e2 = expFor(conds, 1), n0 = q1 ** e1 * q2 ** e2, N = 10 ** j;
      const at = (t) => BigInt(n0) * BigInt(t) ** BigInt(L), cop = range(1, T).filter((t) => t % q1 && t % q2).length;
      const sqrtish = Math.floor((N / n0) ** (1 / Math.max(k1, k2)) + 1e-9);
      return {
        topic: TH, rank: 23,
        text: `How many positive integers n ≤ 10<sup>${j}</sup> have the property that ${condText(conds[0])} and ${condText(conds[1])}?`,
        answer: choices(d, T, [T + 1, T - 1, cop, sqrtish <= 300 ? sqrtish : T + 2, 1]),
        check: () => {
          // list the n that meet the first condition, then test the second directly
          let k = 0;
          const [, , op1] = conds[0];
          for (let x = 1; ; x++) {
            const n = op1 === 'div' ? q1 * x ** k1 : (q1 * x) ** k1 / q1;
            if (n > N) break;
            if (meets(n, conds[1]) && (op1 === 'div' || meets(n, conds[0]))) k++;
          }
          return k === T ? '' : `counted ${k}`;
        },
        solution: [
          `Look at the exponent of each prime in n; a perfect k-th power has every exponent a multiple of k.`,
          `The exponent of ${q1} has to be ${ownText(conds[0])} and a multiple of ${k2}, so it is ${e1}, ${e1 + L}, ${e1 + 2 * L}, …, that is, ${e1} more than a multiple of ${L}.`,
          `Likewise the exponent of ${q2} has to be ${ownText(conds[1])} and a multiple of ${k1}, so it is ${e2} more than a multiple of ${L}; and every other prime needs an exponent that is a multiple of both ${k1} and ${k2}, so of ${L}.`,
          `So n = ${pw(q1, e1)} · ${pw(q2, e2)} · t<sup>${L}</sup> = ${ints(n0)} · t<sup>${L}</sup> for a positive integer t (which may contain ${q1}s and ${q2}s of its own), and every such n works.`,
          `${ints(n0)} · ${T}<sup>${L}</sup> = ${big(at(T))} is at most 10<sup>${j}</sup>, but ${ints(n0)} · ${T + 1}<sup>${L}</sup> = ${big(at(T + 1))} is more, so t can be 1 to ${T}, which makes <b>${T}</b>.`,
        ].join(' '),
      };
    },
  ],
};
