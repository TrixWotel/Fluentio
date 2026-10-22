// AMC 10–style probability: a family of problems modelled on past contest ideas, with new numbers and wording.
// Every answer is exact, and check() gets it a second way, usually by counting the outcomes one by one.
import { combo, num, frac, gcd, choose } from '../kit/bank.js';
import { choices, showFrac, range } from './amc-kit.js';

const cut = (p, q) => { const g = gcd(p, q) || 1; return [p / g, q / g]; };
const fr = ([p, q]) => frac(p, q);
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const modpow = (b, e, m) => { let r = 1 % m; b %= m; while (e > 0) { if (e & 1) r = (r * b) % m; b = (b * b) % m; e = Math.floor(e / 2); } return r; };
const popcount = (x) => { let c = 0; for (; x; x &= x - 1) c++; return c; };
const NAMES = [['Nadia', 'Owen'], ['Lucia', 'Marek'], ['Tess', 'Uma'], ['Farid', 'Gwen'], ['Hana', 'Ivo']];

export const probability = [
  // 1. taking turns until someone succeeds: only the rounds that end the game matter
  (d, ctx) => {
    const [[p1, q1], [p2, q2], second] = combo(ctx, [[[1, 4], [1, 5], [2, 5], [1, 6], [2, 7], [3, 8], [1, 2], [3, 5]], [[1, 3], [1, 4], [1, 2], [2, 5], [3, 5], [1, 5], [2, 3]], [false, true]],
      ([p1, q1], [p2, q2]) => p1 * q2 + (q1 - p1) * p2 <= 60);
    const [P, Q] = d.pick(NAMES), wA = p1 * q2, wB = (q1 - p1) * p2, who = second ? Q : P, ans = cut(second ? wB : wA, wA + wB);
    const a = p1 / q1, b = p2 / q2, g = gcd(wA, wB);
    return {
      topic: 'Taking turns', rank: 18,
      text: `${P} and ${Q} take turns throwing a ball at a can, ${P} first. Each of ${P}'s throws knocks the can over with probability ${frac(p1, q1)}, and each of ${Q}'s with probability ${frac(p2, q2)}, all independently. The first to knock it over wins. What is the probability that ${who} wins?`,
      answer: choices(d, ans, [second ? cut(p2 * q1, p1 * q2 + p2 * q1) : cut(p1 * q2, p1 * q2 + p2 * q1), second ? cut(wB, q1 * q2) : [p1, q1], cut(second ? wA : wB, wA + wB), [1, 2],
        second ? [p2, q2] : cut(p1 * (q2 - p2), q1 * q2)], showFrac),
      check: () => {
        let s = 0, r = 1;
        for (let i = 0; i < 4000; i++) { s += second ? r * (1 - a) * b : r * a; r *= (1 - a) * (1 - b); }
        return Math.abs(s - ans[0] / ans[1]) < 1e-12 ? '' : `series gives ${s}, said ${ans[0]}/${ans[1]}`;
      },
      solution: `Think in rounds: ${P} throws, then ${Q}. A round ends with ${P} winning with probability ${frac(p1, q1)}, ends with ${Q} winning with probability ${frac(q1 - p1, q1)}·${frac(p2, q2)} = ${frac(wB, q1 * q2)}, and otherwise the game starts over exactly as before. So only those two endings matter, in the ratio ${frac(p1, q1)} : ${frac(wB, q1 * q2)} = ${wA / g} : ${wB / g}, and ${who} wins with probability ${(second ? wB : wA) / g}/(${wA / g} + ${wB / g}) = <b>${fr(ans)}</b>.`,
    };
  },
  // 2. re-trying whatever failed, up to k times: linearity of expectation, one coin (or die) at a time
  (d, ctx) => {
    const [[kind, N], k] = combo(ctx, [[['coin', 32], ['coin', 48], ['coin', 80], ['coin', 96], ['coin', 160], ['coin', 256], ['die', 27], ['die', 54], ['die', 81], ['die', 162]], [2, 3, 4, 5]],
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
        ? `A student ends without heads only if all ${k} flips are tails, which has probability (${frac(1, 2)})<sup>${k}</sup> = ${miss}. So each student ends with heads with probability ${hit}, and by linearity of expectation the expected number is ${N}·${hit} = <b>${num(E)}</b>.`
        : `A player ends without a 5 or 6 only if all ${k} rolls miss, which has probability (${frac(2, 3)})<sup>${k}</sup> = ${miss}. So each player succeeds with probability ${hit}, and by linearity of expectation the expected number is ${N}·${hit} = <b>${num(E)}</b>.`,
    };
  },
  // 3. many dice, a small total: give every die its 1, then stars and bars for what is left
  (d, ctx) => {
    const [n, e] = combo(ctx, [[4, 5, 6, 8, 9], [2, 3, 4, 5]]), s = n + e, m = choose(s - 1, n - 1);
    return {
      topic: 'Many dice', rank: 11,
      text: `A board game uses ${n} ordinary six-sided dice, rolled together. Of the 6<sup>${n}</sup> equally likely ways they can land, how many show a total of exactly ${s}?`,
      answer: choices(d, m, [choose(s - 1, n), choose(s, n - 1), choose(s, n), choose(n, e), n * e]),
      check: () => {
        let ways = [1];
        for (let i = 0; i < n; i++) { const next = Array(ways.length + 6).fill(0); ways.forEach((w, t) => { for (let f = 1; f <= 6; f++) next[t + f] += w; }); ways = next; }
        return ways[s] === m ? '' : `counted ${ways[s]}, said ${m}`;
      },
      solution: `Every die shows at least 1, which uses up ${n} of the ${s}. The other ${e} pips can be shared among the ${n} dice in any way (no die gets more than 5 extra, so none goes past 6). By stars and bars that is C(${e} + ${n - 1}, ${n - 1}) = C(${s - 1}, ${n - 1}) = <b>${num(m)}</b>.`,
    };
  },
  // 4. two random choices of k from n: exactly j in common
  (d, ctx) => {
    const [n, k, j] = combo(ctx, [[8, 9, 11, 12], [3, 4, 5, 6], [1, 2, 3, 4]], (n, k, j) => k <= n / 2 + 1 && j < k && k - j <= n - k);
    const [P, Q] = d.pick([['Iris', 'Jonah'], ['Kemal', 'Lise'], ['Mina', 'Noor']]);
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
      solution: `Fix ${P}'s ${k} films. ${Q}'s list is one of C(${n}, ${k}) = ${C} equally likely choices. To share exactly ${j}, ${Q} takes ${j} of ${P}'s ${k} films (C(${k}, ${j}) = ${a} ways) and ${k - j} of the other ${n - k} (C(${n - k}, ${k - j}) = ${b} ways). Probability = ${a}·${b}/${C} = <b>${fr(ans)}</b>.`,
    };
  },
  // 5. a running total lands on t: add up the ways the first few rolls make exactly t
  (d, ctx) => {
    const [t, r] = combo(ctx, [[2, 4, 5, 6], [2, 3, 4, 5]], (t, r) => r <= t);
    const ms = range(1, r), top = ms.reduce((s, m) => s + choose(t - 1, m - 1) * 6 ** (r - m), 0), ans = cut(top, 6 ** r);
    return {
      topic: 'Running totals', rank: 7,
      text: `A token starts on square 0 of a long track. Each turn a fair die is rolled and the token moves forward that many squares. After ${r} turns, what is the probability that the token has stopped on square ${t} at some point?`,
      answer: choices(d, ans, [[1, 6], cut(top - choose(t - 1, r - 1), 6 ** r), cut(choose(t - 1, r - 1), 6 ** r), cut(6 ** r - 5 ** r, 6 ** r)], showFrac),
      check: () => {
        let hit = 0;
        for (let s = 0; s < 6 ** r; s++) { let x = s, tot = 0, ok = false; for (let i = 0; i < r; i++) { tot += (x % 6) + 1; x = Math.floor(x / 6); if (tot === t) ok = true; } if (ok) hit++; }
        return hit * ans[1] === 6 ** r * ans[0] ? '' : `counted ${hit}/${6 ** r}, said ${ans[0]}/${ans[1]}`;
      },
      solution: `The token stops on ${t} exactly when its first few rolls add up to ${t}. With m rolls there are C(${t - 1}, m − 1) ways to do that (every roll is at most 6, since ${t} ≤ 6), each with probability (${frac(1, 6)})<sup>m</sup>. Adding m = 1 to ${r}: ${ms.map((m) => frac(choose(t - 1, m - 1), 6 ** m)).join(' + ')} = <b>${fr(ans)}</b>.`,
    };
  },
  // 6. how many throws until "at least once" is more likely than a given chance
  (d, ctx) => {
    const [s, [tp, tq]] = combo(ctx, [[2, 3, 4, 5, 6, 8, 9, 10, 11, 12], [[1, 2], [1, 3], [2, 3], [3, 4]]]);
    const c = 6 - Math.abs(s - 7), chance = (k) => 1 - ((36 - c) / 36) ** k;
    const enough = (k) => BigInt(tq) * (36n ** BigInt(k) - BigInt(36 - c) ** BigInt(k)) > BigInt(tp) * 36n ** BigInt(k);
    let n = 1; while (!enough(n)) n++;
    return {
      topic: 'At least once', rank: 12,
      text: `Two fair dice are thrown together, again and again. What is the smallest number of throws for which the probability of a total of ${s} turning up at least once is greater than ${frac(tp, tq)}?`,
      answer: choices(d, n, [n - 1, n + 1, Math.ceil((36 * tp) / (tq * c)), n + 2, n - 2].filter((x) => x >= 1)),
      check: () => (enough(n) && !enough(n - 1) ? '' : `${n} is not the least`),
      solution: `A total of ${s} happens in ${c} of the 36 ways, so one throw misses it with probability ${frac(36 - c, 36)}. In n throws the chance of at least one ${s} is 1 − (${frac(36 - c, 36)})<sup>n</sup>. For n = ${n - 1} that is about ${num(chance(n - 1), 4)}, not more than ${frac(tp, tq)} (about ${num(tp / tq, 4)}); for n = ${n} it is about ${num(chance(n), 4)}. So the answer is <b>${n}</b>.`,
    };
  },
  // 7. a random divisor of F! is a perfect square (or cube): count exponents
  (d, ctx) => {
    const [F, r] = combo(ctx, [[6, 7, 8, 9, 10, 11, 13, 14], [2, 3]]);
    const primes = range(2, F).filter(isPrime), exps = primes.map((p) => { let e = 0; for (let q = p; q <= F; q *= p) e += Math.floor(F / q); return e; });
    const prod = (f) => exps.reduce((a, e) => a * f(e), 1), D = prod((e) => e + 1), S = prod((e) => Math.floor(e / r) + 1), ans = cut(S, D), value = ans[0] + ans[1];
    const sum = ([p, q]) => p + q, word = r === 2 ? 'square' : 'cube';
    const fact = primes.map((p, i) => (exps[i] > 1 ? `${p}<sup>${exps[i]}</sup>` : p)).join(' · ');
    return {
      topic: 'Random divisors', rank: 15,
      text: `Ravi writes each positive divisor of ${F}! on its own card, shuffles the cards, and draws one. The probability that his number is a perfect ${word} is a/b, where a and b are relatively prime positive integers. What is a + b?`,
      answer: choices(d, value, [S + D, sum(cut(prod((e) => Math.floor((e / (5 - r))) + 1), D)), sum(cut(S, prod((e) => e))), prod((e) => Math.floor(e / r)) ? sum(cut(prod((e) => Math.floor(e / r)), D)) : NaN]),
      check: () => {
        const N = primes.reduce((a, p, i) => a * p ** exps[i], 1), power = (x) => (r === 2 ? Math.round(Math.sqrt(x)) ** 2 === x : Math.round(Math.cbrt(x)) ** 3 === x);
        let all = 0, good = 0;
        for (let i = 1; i * i <= N; i++) if (N % i === 0) for (const x of i * i === N ? [i] : [i, N / i]) { all++; if (power(x)) good++; }
        return good * ans[1] === all * ans[0] ? '' : `counted ${good}/${all}, said ${ans[0]}/${ans[1]}`;
      },
      solution: `${F}! = ${fact}. A divisor chooses each exponent from 0 up to the one here, so there are ${exps.map((e) => `(${e} + 1)`).join('·')} = ${D} divisors. It is a perfect ${word} when every exponent is a multiple of ${r}, which leaves ${exps.map((e) => Math.floor(e / r) + 1).join('·')} = ${S} of them. The probability is ${S}/${D} = ${fr(ans)}, so a + b = <b>${value}</b>.`,
    };
  },
  // 8. N^e − 1 divisible by a prime: only N mod p matters, and Fermat cuts the exponent down
  (d, ctx) => {
    const [[p, M], e] = combo(ctx, [[[3, 2025], [7, 2023], [11, 2024], [13, 2015], [7, 2030]], [6, 8, 9, 10, 12, 15, 18, 20, 24, 30]], ([p], e) => gcd(e, p - 1) > 1);
    const good = range(1, p - 1).filter((r) => modpow(r, e, p) === 1), g = good.length, ans = cut(g, p), small = e % (p - 1);
    return {
      topic: 'Remainders by chance', rank: 14,
      text: `A whole number N is chosen at random from 1 to ${M}, each equally likely. What is the probability that N<sup>${e}</sup> − 1 is a multiple of ${p}?`,
      answer: choices(d, ans, [cut(p - 1, p), [1, p], cut(g, p - 1), cut(p - 1 - g, p), [1, p - 1]], showFrac),
      check: () => { let hit = 0; for (let N = 1; N <= M; N++) if (modpow(N, e, p) === 1) hit++; return hit * ans[1] === M * ans[0] ? '' : `counted ${hit}/${M}, said ${ans[0]}/${ans[1]}`; },
      solution: `Only N's remainder when divided by ${p} matters, and ${M} = ${p}·${M / p}, so the remainders 0, 1, …, ${p - 1} are equally likely. Remainder 0 never works. For the others, r<sup>${p - 1}</sup> leaves remainder 1 (Fermat's little theorem), so r<sup>${e}</sup> leaves the same remainder as ${small ? `r<sup>${small}</sup>, and that is 1 for r = ${good.join(', ')}` : `r<sup>0</sup> = 1, for every one of them`}. So ${g} of the ${p} remainders work: <b>${fr(ans)}</b>.`,
    };
  },
  // 9. units digits of powers repeat every 4 steps, so count the years that work for each base
  (d, ctx) => {
    const SETS = [[12, 13, 14, 17, 19], [21, 23, 24, 26, 29], [31, 32, 33, 36, 39], [22, 23, 27, 28, 29], [41, 43, 44, 46, 47]];
    const per = (set, t, lo, hi) => set.map((m) => range(lo, hi).filter((Y) => modpow(m, Y, 10) === t).length);
    const [set, t, [lo, hi]] = combo(ctx, [SETS, [1, 6, 9], [[2001, 2020], [2011, 2030], [1981, 2004], [2025, 2040]]],
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
      solution: `The units digit of a<sup>Y</sup> depends only on the units digit of a, and repeats every 4 steps of Y; the ${N} years contain each remainder mod 4 exactly ${N / 4} times. ${set.map((m, i) => `${m} (units digits ${cycle(m)}, …): ${counts[i]} years`).join('; ')}. That is ${hits} of the 5·${N} = ${total} equally likely pairs: <b>${fr(ans)}</b>.`,
    };
  },
  // 10. numbers below 100 whose digits all come from a set: which are prime
  (d, ctx) => {
    const [[S, desc]] = combo(ctx, [[[[1, 3, 5, 7, 9], 'every digit is odd'], [[1, 3, 7, 9], 'every digit is 1, 3, 7 or 9'], [[1, 4, 9], 'every digit is a perfect square (1, 4 or 9)'], [[1, 2, 3], 'every digit is 1, 2 or 3'], [[1, 2, 4, 8], 'every digit is 1, 2, 4 or 8']]]);
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
      solution: `There are ${S.length} one-digit and ${S.length}² = ${S.length ** 2} two-digit numbers like that, ${tot} in all. The primes among them are ${primes.join(', ')}${S.includes(1) ? ' (1 is not prime)' : ''}: ${cnt} of them. So the probability is ${cnt}/${tot} = <b>${fr(ans)}</b>.`,
    };
  },
  // 11. a ring inside a diamond: the ring's area is π times the difference of the squared radii
  (d, ctx) => {
    const [a, c, w] = combo(ctx, [[6, 10, 12], range(4, 70), range(3, 30)], (a, c, w) => { const [m, n] = cut(w, a * a); return c - w >= 1 && c + w <= (a * a) / 2 && m + n >= 10; });
    const [m, n] = cut(w, a * a), value = m + n, sum = ([p, q]) => p + q;
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
        const G = 1200, h = (2 * a) / G;
        let inB = 0, inT = 0;
        for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
          const x = -a + (i + 0.5) * h, y = -a + (j + 0.5) * h;
          if (Math.abs(x) + Math.abs(y) <= a) { inB++; if ((x * x + y * y - c) ** 2 <= w * w) inT++; }
        }
        const want = (m / n) * Math.PI;
        return Math.abs(inT / inB - want) < 0.005 * want ? '' : `grid gives ${inT / inB}, said ${want}`;
      },
      solution: `The gold part is where ${c - w} ≤ x<sup>2</sup> + y<sup>2</sup> ≤ ${c + w}: a ring between radii √${c - w} and √${c + w}, with area π(${c + w} − ${c - w}) = ${2 * w}π. It lies inside the tile, because the largest circle in the tile has radius ${a}/√2, and (${a}/√2)<sup>2</sup> = ${(a * a) / 2} ≥ ${c + w}. The tile is a square with diagonals ${2 * a}, so its area is ½·${2 * a}·${2 * a} = ${2 * a * a}. The probability is ${2 * w}π/${2 * a * a} = ${frac(w, a * a)}·π, so m + n = <b>${num(value)}</b>.`,
    };
  },
];
