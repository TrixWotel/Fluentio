// Harder AMC 10–style algebra, for problems 15 to 20: five topics modelled on ideas from recent contests (the roots of a
// polynomial without solving it, remainders of polynomials, sums and products that telescope, floors of square roots,
// and sequences that repeat), with new numbers and wording; the real problems are the MAA's copyright. Each topic asks
// its idea three or four ways, and every check() gets the answer a second way: from the actual roots, by dividing
// polynomials with BigInt, with exact BigInt fractions, or by brute force.
import { combo, num, frac, gcd } from '../kit/bank.js';
import { choices, labelled, surd, showFrac, range, ord } from './amc-kit.js';

// combo, with a name of its own for each kind of question, so no two kinds share a list of combinations
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
const NAMES = ['Mina', 'Tariq', 'Lena', 'Jonah', 'Priya', 'Mateo', 'Ines', 'Kofi', 'Hana', 'Dario', 'Sofia', 'Ravi'];
const cut = (p, q) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return [p / g, q / g]; };
const fr = ([p, q]) => frac(p, q);
const pf = (x) => (x[0] < 0 || x[1] !== 1 ? `(${fr(x)})` : fr(x));          // a fraction in brackets when it needs them
const paren = (x) => (x < 0 ? `(${num(x)})` : num(x));
const sup = (b, e) => `${b}<sup>${e}</sup>`;
const sub = (v, i) => `${v}<sub>${i}</sub>`;
// a fraction of anything (letters, sums), stacked like frac()
const over = (top, bottom) => `<span class="fr"><span>${top}</span><span>${bottom}</span></span>`;
// numbers added up as people write them: 8 − 12 + 5
const plusList = (xs) => xs.map((x, i) => (i === 0 ? num(x) : x < 0 ? ` − ${num(-x)}` : ` + ${num(x)}`)).join('');
const listing = (xs) => (xs.length < 2 ? String(xs[0]) : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const divisors = (n) => range(1, n).filter((k) => n % k === 0);
const isqrt = (n) => { let r = Math.floor(Math.sqrt(n)); if (r * r > n) r--; if ((r + 1) * (r + 1) <= n) r++; return r; };
const icbrt = (n) => { let r = Math.round(Math.cbrt(n)); if (r ** 3 > n) r--; if ((r + 1) ** 3 <= n) r++; return r; };
const isSq = (n) => n >= 0 && isqrt(n) ** 2 === n;
const tri = (n) => (n * (n + 1)) / 2;

// choices() for exact answers (whole numbers, or fractions as [p, q]), with the wrong ones topped up here so that no two
// choices read the same even once the fraction bars are gone (3/2 and 32)
const val = (v) => (Array.isArray(v) ? v[0] / v[1] : v);
const bare = (v) => showFrac(v).replace(/<[^>]+>/g, '');
function fchoices(d, correct, wrongs) {
  const [p, q] = Array.isArray(correct) ? correct : [correct, 1], keep = [];
  for (const w of [...wrongs, ...range(1, 12).flatMap((k) => [[p + k, q], [p - k, q]])]) {
    if (keep.length === 4) break;
    if (Number.isFinite(val(w)) && (val(correct) < 0 || val(w) >= 0) && ![correct, ...keep].some((x) => Math.abs(val(x) - val(w)) < 1e-9 || bare(x) === bare(w))) keep.push(w);
  }
  return choices(d, correct, keep, showFrac);
}

// a sum like 4p − 2q + r, from [coefficient, letter] pairs (letter '' for a plain number), leaving out zeros
function expr(...parts) {
  let out = '';
  for (const [c, v] of parts) {
    if (!c) continue;
    const size = Math.abs(c) === 1 && v ? '' : num(Math.abs(c), 4);
    out += (out ? (c < 0 ? ' − ' : ' + ') : c < 0 ? '−' : '') + size + v;
  }
  return out || '0';
}
// a polynomial from [coefficient, power] pairs, highest power first: [[2, 2026], [−1, 3], [4, 0]] is 2x²⁰²⁶ − x³ + 4
const termsText = (list, v = 'x') => expr(...[...list].sort((a, b) => b[1] - a[1]).map(([c, e]) => [Number(c), e === 0 ? '' : e === 1 ? v : sup(v, e)]));
// a polynomial from its coefficients, lowest power first: [−7, 1, −5, 2] is 2x³ − 5x² + x − 7
const poly = (cs, v = 'x') => termsText(cs.map((c, i) => [c, i]), v);
// polynomials as labelled answers: sorted by their coefficients, highest power first
const polyChoice = (cs) => [cs.reduce((s, c, i) => s + Number(c) * 1000 ** i, 0), poly(cs)];
// x − a, written x + 2 for a = −2 (and x for a = 0)
const minus = (a, v = 'x') => (a === 0 ? v : `${v} ${a < 0 ? '+' : '−'} ${Math.abs(a)}`);

// ---------- exact fractions with BigInt: [p, q] in lowest terms, q > 0 ----------
const big = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const Q = (p, q = 1n) => { p = BigInt(p); q = BigInt(q); if (q < 0n) { p = -p; q = -q; } const g = big(p, q) || 1n; return [p / g, q / g]; };
const qadd = (x, y) => Q(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const qsub = (x, y) => Q(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const qmul = (x, y) => Q(x[0] * y[0], x[1] * y[1]);
const qdiv = (x, y) => Q(x[0] * y[1], x[1] * y[0]);
const isQ = (x, [p, q]) => { const y = Q(p, q); return x[0] === y[0] && x[1] === y[1]; };
const said = (x, [p, q]) => (isQ(x, [p, q]) ? '' : `worked out ${x[0]}/${x[1]}, said ${p}/${q}`);
// the value at t of the polynomial of lowest degree through the points (xs[i], ys[i]) (ys exact fractions), by Lagrange
const lagrange = (xs, ys, t) => xs.reduce((acc, xi, i) => qadd(acc, xs.reduce((term, xj, j) => (j === i ? term : qmul(term, Q(t - xj, xi - xj))), ys[i])), Q(0));

// ---------- polynomials with BigInt coefficients, lowest power first ----------
const pmul = (a, b) => { const out = Array(a.length + b.length - 1).fill(0n); a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; })); return out; };
const ppow = (a, n) => { let out = [1n]; for (let i = 0; i < n; i++) out = pmul(out, a); return out; };
const peval = (a, x) => a.reduceRight((s, c) => s * BigInt(x) + c, 0n);
// the remainder on dividing a by a monic polynomial m, by long division
function pmod(a, m) {
  const r = a.slice(), deg = m.length - 1;
  for (let i = r.length - 1; i >= deg; i--) { const c = r[i]; if (c) for (let j = 0; j <= deg; j++) r[i - deg + j] -= c * m[j]; }
  return range(0, deg - 1).map((i) => r[i] ?? 0n);
}
// a sum of terms c·x^e (as [c, e] pairs) as a BigInt polynomial
const terms = (list) => { const out = Array(Math.max(...list.map(([, e]) => e)) + 1).fill(0n); for (const [c, e] of list) out[e] += BigInt(c); return out; };

// ---------- complex numbers [re, im], for checking answers from the actual roots ----------
const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const cinv = (a) => { const n = a[0] * a[0] + a[1] * a[1]; return [a[0] / n, -a[1] / n]; };
const re = (x) => [x, 0];
// the two roots of ax² + bx + c
const roots2 = (a, b, c) => { const D = b * b - 4 * a * c, s = Math.sqrt(Math.abs(D)) / (2 * a), m = -b / (2 * a); return D >= 0 ? [re(m + s), re(m - s)] : [[m, s], [m, -s]]; };
// the coefficients (lowest power first) of the polynomial with leading coefficient 1 and these roots
const fromRoots = (rs) => rs.reduce((cs, r) => { const out = [...cs.map(() => [0, 0]), [0, 0]]; cs.forEach((c, i) => { out[i + 1] = cadd(out[i + 1], c); out[i] = cadd(out[i], cmul(c, [-r[0], -r[1]])); }); return out; }, [[1, 0]]);
// is the complex number z the real number v, to within rounding?
const near = (z, v, what) => (Math.abs(z[0] - v) <= 1e-7 * Math.max(1, Math.abs(v)) && Math.abs(z[1]) <= 1e-7 * Math.max(1, Math.abs(v)) ? '' : `${what}: from the roots ${z[0]}${z[1] ? ` + ${z[1]}i` : ''}, said ${v}`);

// ---------- Roots without solving ----------
const QUAD_ASKS = {
  ratio: [15, `${over('r', 's')} + ${over('s', 'r')}`],
  gap: [15, '(r − s)<sup>2</sup>'],
  recip: [16, `${over(1, sup('r', 2))} + ${over(1, sup('s', 2))}`],
  cubes: [16, `${sup('r', 3)} + ${sup('s', 3)}`],
  plus: [17, `(${sup('r', 2)} + 1)(${sup('s', 2)} + 1)`],
};
const roots = [
  // a quadratic's roots: r/s + s/r, (r − s)², 1/r² + 1/s², r³ + s³ or (r² + 1)(s² + 1), from the coefficients alone
  (d, ctx) => {
    const [a, b, c, ask] = pick(ctx, 'quad', [[2, 3, 4], [-7, -5, -4, -3, -1, 1, 3, 4, 5, 7], [-5, -3, -2, -1, 1, 2, 3, 5], Object.keys(QUAD_ASKS)],
      (a, b, c) => b * b - 4 * a * c > 0 && !isSq(b * b - 4 * a * c) && gcd(gcd(a, b), c) === 1);
    const S = cut(-b, a), Pr = cut(c, a), sq = cut(b * b - 2 * a * c, a * a), [rank, what] = QUAD_ASKS[ask], sP = pf(S), pP = pf(Pr);
    const ans = { ratio: cut(b * b - 2 * a * c, a * c), gap: cut(b * b - 4 * a * c, a * a), recip: cut(b * b - 2 * a * c, c * c), cubes: cut(3 * a * b * c - b ** 3, a ** 3), plus: cut((c - a) ** 2 + b * b, a * a) }[ask];
    const wrong = {
      ratio: [cut(b * b + 2 * a * c, a * c), sq, cut(b * b, a * c), cut(-b, c), cut(b * b - 4 * a * c, a * c)],
      gap: [cut(b * b - 4 * a * c, 1), cut(b * b + 4 * a * c, a * a), sq, cut(b * b - 4 * a * c, a)],
      recip: [cut(b * b + 2 * a * c, c * c), cut(b * b, c * c), sq, cut(b * b - 2 * a * c, a * c)],
      cubes: [cut(-(b ** 3) - 3 * a * a * c, a ** 3), cut(-(b ** 3) - 3 * a * b * c, a ** 3), cut(-(b ** 3), a ** 3), cut(b ** 3 - 3 * a * b * c, a ** 3)],
      plus: [cut(c * c + a * a, a * a), cut(c * c + b * b + a * a, a * a), cut((c + a) ** 2 + b * b, a * a), cut(b * b - 2 * a * c + a * a, a * a)],
    }[ask];
    const r2s2 = `r<sup>2</sup> + s<sup>2</sup> = (r + s)<sup>2</sup> − 2rs = ${sP}<sup>2</sup> − 2·${pP} = ${fr(sq)}`;
    return {
      topic: 'Roots without solving', rank,
      text: `The equation ${poly([c, b, a])} = 0 has two roots, r and s. What is ${what}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const [r, s] = roots2(a, b, c), sqr = (z) => cmul(z, z);
        const got = {
          ratio: cadd(cmul(r, cinv(s)), cmul(s, cinv(r))), gap: sqr(cadd(r, cmul(s, [-1, 0]))), recip: cadd(sqr(cinv(r)), sqr(cinv(s))),
          cubes: cadd(cmul(r, sqr(r)), cmul(s, sqr(s))), plus: cmul(cadd(sqr(r), [1, 0]), cadd(sqr(s), [1, 0])),
        }[ask];
        return near(got, ans[0] / ans[1], ask);
      },
      solution: `By Vieta's formulas, r + s = ${fr(S)} and rs = ${fr(Pr)}, so the roots themselves are never needed. ` + {
        ratio: `Over a common denominator, ${over('r', 's')} + ${over('s', 'r')} = (r<sup>2</sup> + s<sup>2</sup>)/(rs), and ${r2s2}. So the value is ${fr(sq)} ÷ ${pP} = <b>${fr(ans)}</b>.`,
        gap: `Expanding, (r − s)<sup>2</sup> = r<sup>2</sup> − 2rs + s<sup>2</sup> = (r + s)<sup>2</sup> − 4rs. That is ${sP}<sup>2</sup> − 4·${pP} = <b>${fr(ans)}</b>.`,
        recip: `Over a common denominator, ${over(1, sup('r', 2))} + ${over(1, sup('s', 2))} = (r<sup>2</sup> + s<sup>2</sup>)/(rs)<sup>2</sup>, and ${r2s2}. So the value is ${fr(sq)} ÷ ${pP}<sup>2</sup> = <b>${fr(ans)}</b>.`,
        cubes: `Cubing the sum, (r + s)<sup>3</sup> = r<sup>3</sup> + s<sup>3</sup> + 3rs(r + s), so r<sup>3</sup> + s<sup>3</sup> = (r + s)<sup>3</sup> − 3rs(r + s). That is ${sP}<sup>3</sup> − 3·${pP}·${sP} = <b>${fr(ans)}</b>.`,
        plus: `Multiplying out, (r<sup>2</sup> + 1)(s<sup>2</sup> + 1) = (rs)<sup>2</sup> + (r<sup>2</sup> + s<sup>2</sup>) + 1, and ${r2s2}. So the value is ${pP}<sup>2</sup> + ${fr(sq)} + 1 = <b>${fr(ans)}</b>.`,
      }[ask],
    };
  },
  // a cubic's roots: the harmonic mean, the sum of the squares or of the reciprocal squares, or (r + s)(s + t)(t + r)
  (d, ctx) => {
    // (x − m)(Ax² + ux + v), multiplied out: one root is m, the other two are irrational; and the answer (never 0)
    const made = (A, m, u, v, ask) => {
      const B = u - A * m, C = v - u * m, D = -v * m;
      return { B, C, D, ans: { mean: cut(-3 * D, C), squares: cut(B * B - 2 * A * C, A * A), recip: cut(C * C - 2 * B * D, D * D), pairs: cut(A * D - B * C, A * A) }[ask] };
    };
    const [A, m, u, v, ask] = pick(ctx, 'cubic', [[1, 2, 3], [-3, -2, -1, 1, 2, 3], range(-5, 5), [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6], ['mean', 'squares', 'recip', 'pairs']],
      (A, m, u, v, ask) => u * u - 4 * A * v > 0 && !isSq(u * u - 4 * A * v) && v - u * m !== 0 && gcd(gcd(A, u - A * m), gcd(v - u * m, v * m)) === 1 && made(A, m, u, v, ask).ans[0] !== 0);
    const { B, C, D, ans } = made(A, m, u, v, ask), e1 = cut(-B, A), e2 = cut(C, A), e3 = cut(-D, A), x1 = cut(-C, D), x2 = cut(B, D);
    const wrong = {
      mean: [cut(-D, C), cut(3 * D, C), cut(-C, 3 * D), cut(-B, 3 * A), cut(-3 * C, D)],
      squares: [cut(B * B + 2 * A * C, A * A), cut(B * B, A * A), cut(B * B - 2 * A * C, A), cut(B * B - A * C, A * A)],
      recip: [cut(C * C + 2 * B * D, D * D), cut(C * C, D * D), cut(C * C - 2 * B * D, A * A), cut(C * C - B * D, D * D)],
      pairs: [cut(-A * D - B * C, A * A), cut(-B * C, A * A), cut(B * C - A * D, A * A), cut(-D, A), cut(A * D - B * C, A)],
    }[ask];
    return {
      topic: 'Roots without solving', rank: { mean: 17, squares: 16, recip: 18, pairs: 18 }[ask],
      text: `Let r, s and t be the three roots of ${poly([D, C, B, A])} = 0. ` + {
        mean: 'The harmonic mean of three numbers is 3 divided by the sum of their reciprocals. What is the harmonic mean of r, s and t?',
        squares: `What is ${sup('r', 2)} + ${sup('s', 2)} + ${sup('t', 2)}?`,
        recip: `What is ${over(1, sup('r', 2))} + ${over(1, sup('s', 2))} + ${over(1, sup('t', 2))}?`,
        pairs: 'What is (r + s)(s + t)(t + r)?',
      }[ask],
      answer: fchoices(d, ans, wrong),
      check: () => {
        const rs = [re(m), ...roots2(A, u, v)], sqr = (z) => cmul(z, z), sum = (zs) => zs.reduce(cadd, [0, 0]);
        const p = fromRoots(rs), shown = [D, C, B, A].map((x) => x / A);
        if (shown.some((x, i) => near(p[i], x, 'P'))) return 'the cubic does not have these roots';
        const got = {
          mean: cmul([3, 0], cinv(sum(rs.map(cinv)))), squares: sum(rs.map(sqr)), recip: sum(rs.map((z) => sqr(cinv(z)))),
          pairs: cmul(cmul(cadd(rs[0], rs[1]), cadd(rs[1], rs[2])), cadd(rs[2], rs[0])),
        }[ask];
        return near(got, ans[0] / ans[1], ask);
      },
      solution: {
        mean: `Over a common denominator, ${over(1, 'r')} + ${over(1, 's')} + ${over(1, 't')} = (st + tr + rs)/(rst). By Vieta's formulas, rs + st + tr = ${fr(e2)} and rst = ${fr(e3)}, so the reciprocals add up to ${fr(e2)} ÷ ${pf(e3)} = ${fr(x1)}. The harmonic mean is 3 ÷ ${pf(x1)} = <b>${fr(ans)}</b>.`,
        squares: `By Vieta's formulas, r + s + t = ${fr(e1)} and rs + st + tr = ${fr(e2)}. Squaring the sum gives each square once and each product twice: (r + s + t)<sup>2</sup> = r<sup>2</sup> + s<sup>2</sup> + t<sup>2</sup> + 2(rs + st + tr). So r<sup>2</sup> + s<sup>2</sup> + t<sup>2</sup> = ${pf(e1)}<sup>2</sup> − 2·${pf(e2)} = <b>${fr(ans)}</b>.`,
        recip: `By Vieta's formulas, r + s + t = ${fr(e1)}, rs + st + tr = ${fr(e2)} and rst = ${fr(e3)}. So the reciprocals 1/r, 1/s, 1/t add up to (rs + st + tr)/(rst) = ${fr(x1)}, and their products in pairs add up to (r + s + t)/(rst) = ${fr(x2)}. As for any three numbers, the sum of their squares is (their sum)<sup>2</sup> − 2·(their products in pairs) = ${pf(x1)}<sup>2</sup> − 2·${pf(x2)} = <b>${fr(ans)}</b>.`,
        pairs: `Multiplying out, (r + s)(s + t)(t + r) = (r + s + t)(rs + st + tr) − rst. By Vieta's formulas, r + s + t = ${fr(e1)}, rs + st + tr = ${fr(e2)} and rst = ${fr(e3)}. So the product is ${pf(e1)}·${pf(e2)} − ${pf(e3)} = <b>${fr(ans)}</b>.`,
      }[ask],
    };
  },
  // a new cubic whose roots are made from the old ones (shifted, added in pairs, multiplied in pairs, squared): a coefficient
  (d, ctx) => {
    // P(x) = (x − m)(x² + ux + v) = x³ + bx² + cx + e, and what is asked (never 0: that would mean a root of 0, or ±1 a root of P)
    const made = (m, u, v, ask, k) => {
      const b = u - m, c = v - u * m, e = -v * m, P = (x) => x ** 3 + b * x * x + c * x + e;
      return { b, c, e, P, ans: { shift: P(-k), sums: b * c - e, products: b * e, squares: -P(1) * P(-1) }[ask] };
    };
    const [m, u, v, ask, k] = pick(ctx, 'new', [[-3, -2, -1, 1, 2, 3], range(-4, 4), [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5], ['shift', 'sums', 'products', 'squares'], [1, 2, 3, -1, -2]],
      (m, u, v, ask, k) => !isSq(u * u - 4 * v) && (ask === 'shift' || k === 1) && u - m !== 0 && v - u * m !== 0 && made(m, u, v, ask, k).ans !== 0);
    const { b, c, e, P, ans } = made(m, u, v, ask, k), s1 = -b, s3 = -e;
    const wrong = {
      shift: [-P(-k), P(k), -P(k), e, e + k ** 3],
      sums: [e - b * c, b * c + e, -b * c - e, -e, -P(-b) + 1],
      products: [-b * e, c * c, -e * e, e * e, b * c],
      squares: [P(1) * P(-1), P(1) ** 2, -(P(1) ** 2), P(1) + P(-1), -P(1) * P(-1) + 2],
    }[ask];
    const kk = k > 0 ? `+ ${k}` : `− ${-k}`;
    return {
      topic: 'Roots without solving', rank: { shift: 17, sums: 19, products: 19, squares: 20 }[ask],
      text: `Let r, s and t be the roots of P(x) = ${poly([e, c, b, 1])}. The polynomial Q(x) = ${sup('x', 3)} + ⋯, with leading coefficient 1, has roots ${{
        shift: `r ${kk}, s ${kk} and t ${kk}`, sums: 'r + s, s + t and t + r', products: 'rs, st and tr', squares: `${sup('r', 2)}, ${sup('s', 2)} and ${sup('t', 2)}`,
      }[ask]}. ${{ shift: 'What is the constant term of Q(x)?', sums: 'What is the constant term of Q(x)?', products: 'What is the coefficient of x in Q(x)?', squares: 'What is the sum of the coefficients of Q(x)?' }[ask]}`,
      answer: choices(d, ans, wrong),
      check: () => {
        const rs = [re(m), ...roots2(1, u, v)], p = fromRoots(rs);
        if ([e, c, b, 1].some((x, i) => near(p[i], x, 'P'))) return 'P does not have these roots';
        const nr = {
          shift: rs.map((z) => cadd(z, re(k))), sums: [cadd(rs[0], rs[1]), cadd(rs[1], rs[2]), cadd(rs[2], rs[0])],
          products: [cmul(rs[0], rs[1]), cmul(rs[1], rs[2]), cmul(rs[2], rs[0])], squares: rs.map((z) => cmul(z, z)),
        }[ask];
        const q = fromRoots(nr), got = { shift: q[0], sums: q[0], products: q[1], squares: q.reduce(cadd, [0, 0]) }[ask];
        return near(got, ans, ask);
      },
      solution: {
        shift: `Q(x) = P(${minus(k)}), because that has leading coefficient 1 and ${minus(k)} is r, s or t exactly when x is r ${kk}, s ${kk} or t ${kk}. So the constant term of Q is Q(0) = P(${num(-k)}), with no need to find the roots. That is ${plusList([(-k) ** 3, b * k * k, -c * k, e])} = <b>${num(ans)}</b>.`,
        sums: `By Vieta's formulas, r + s + t = ${num(s1)}, so the new roots are ${num(s1)} − t, ${num(s1)} − r and ${num(s1)} − s. Since P(x) = (x − r)(x − s)(x − t), their product is P(${num(s1)}) = ${plusList([s1 ** 3, b * s1 * s1, c * s1, e])} = ${num(P(s1))}. A cubic with leading coefficient 1 has constant term −(the product of its roots), so the answer is <b>${num(ans)}</b>.`,
        products: `In a cubic with leading coefficient 1, the coefficient of x is the sum of the products of the roots in pairs. For Q that is (rs)(st) + (st)(tr) + (tr)(rs) = rst(s + t + r). By Vieta's formulas for P, r + s + t = ${num(s1)} and rst = ${num(s3)}, so the coefficient is ${paren(s3)}·${paren(s1)} = <b>${num(ans)}</b>.`,
        squares: `The sum of the coefficients of Q is Q(1) = (1 − ${sup('r', 2)})(1 − ${sup('s', 2)})(1 − ${sup('t', 2)}), and each factor splits like 1 − ${sup('r', 2)} = (1 − r)(1 + r). Now (1 − r)(1 − s)(1 − t) = P(1) = ${num(P(1))}, and (1 + r)(1 + s)(1 + t) = −P(−1) = ${num(-P(-1))}, because P(−1) = (−1 − r)(−1 − s)(−1 − t). So Q(1) = ${paren(P(1))}·${paren(-P(-1))} = <b>${num(ans)}</b>.`,
      }[ask],
    };
  },
  // integer roots: how many values of a coefficient give them, or what those values add up to
  (d, ctx) => {
    const forms = [
      ...[12, 18, 20, 24, 28, 30, 36, 40, 45, 48, 60, 72, -12, -18, -20, -24, -30, -36, -40, -48, -60].map((n) => ['given', n, '']),
      ...[[3, '−'], [4, '+'], [5, '−'], [6, '+'], [7, '−'], [8, '+'], [9, '−'], [10, '+'], [12, '−'], [3, '+'], [5, '+'], [6, '−'], [8, '−'], [10, '−']].map(([n, sg]) => ['times', n, sg]),
      ...[11, 17, 19, 23, 27, 29, 35, 39, 47].map((n) => ['plus', n, '']),
    ];
    const [[form, n, sg], ask] = pick(ctx, 'whole', [forms, ['count', 'sum']], ([form], ask) => form !== 'given' || ask === 'count');
    const N = form === 'given' ? Math.abs(n) : form === 'times' ? n * n : n + 1;
    const pos = divisors(N).filter((x) => x * x <= N && !(form === 'given' && x * x === N)).map((x) => [x, N / x]);
    const count = form === 'given' && n < 0 ? divisors(N).length : 2 * pos.length;
    const value = ([x, y]) => (form === 'times' ? (sg === '−' ? x + y + 2 * n : 2 * n - x - y) : 2 - x - y);   // a from the positive pair
    const total = form === 'times' ? 2 * n * count : 2 * count, ans = ask === 'count' ? count : total;
    const tau = divisors(N).length, posSum = pos.reduce((s, p) => s + value(p), 0), both = form === 'times' ? 4 * n : 4;
    const eq = form === 'given' ? `${sup('x', 2)} + bx ${n < 0 ? '−' : '+'} ${N} = 0` : form === 'times' ? `${sup('x', 2)} ${sg} ax + ${n}a = 0` : `${sup('x', 2)} + ax + (a + ${n}) = 0`;
    const pairs = listing(pos.map(([x, y]) => `${x}·${y}`));
    let solution;
    if (form === 'given' && n > 0) solution = `If the roots are r and s, Vieta's formulas give rs = ${N} and r + s = −b, so every b comes from a way of writing ${N} as a product of two integers. Since the product is positive, r and s have the same sign. The ways with two different positive numbers are ${pairs}${isSq(N) ? ` (${isqrt(N)}·${isqrt(N)} would give a double root)` : ''}, ${pos.length} in all. Each also works with both numbers negative, and each gives its own b = ±(r + s), so there are 2·${pos.length} = <b>${count}</b> values of b.`;
    else if (form === 'given') solution = `If the roots are r and s, Vieta's formulas give rs = −${N} and r + s = −b. So one root is positive and the other negative (they are always different). Say r = p and s = −q with pq = ${N}, so that b = q − p. Different choices of p give different values of b, since p and q can be found again from q − p and pq. There is one choice for each of the ${tau} divisors p of ${N}, so there are <b>${count}</b> values of b.`;
    else {
      const t = form === 'times', sh = t ? (sg === '−' ? `r − ${n}` : `r + ${n}`) : 'r + 1', shs = sh.replace('r', 's');
      const aIs = t ? (sg === '−' ? `u + v + ${2 * n}` : `${2 * n} − u − v`) : '2 − u − v';
      solution = (t
        ? `If the roots are r and s, Vieta's formulas give r + s = ${sg === '−' ? '' : '−'}a and rs = ${n}a, so rs = ${sg === '−' ? '' : '−'}${n}(r + s). Then rs ${sg} ${n}r ${sg} ${n}s + ${n * n} = ${n * n}, which factors as (${sh})(${shs}) = ${n * n}.`
        : `If the roots are r and s, Vieta's formulas give r + s = −a and rs = a + ${n}, and adding them gets rid of a, leaving rs + r + s = ${n}. Then rs + r + s + 1 = ${N}, which factors as (r + 1)(s + 1) = ${N}.`)
        + ` So u = ${sh} and v = ${shs} are integers with product ${N}, both positive or both negative. The positive pairs are ${pairs}, and with the negative ones that makes ${count} pairs (swapping u and v changes nothing).`
        + ` Each pair gives a = ${aIs}, and different pairs give different values.`
        + (ask === 'count' ? ` So there are <b>${count}</b> values of a.`
          : ` A pair and its negative give two values of a that add up to ${both}, so all the values add up to ${count / 2}·${both} = <b>${num(total)}</b>.`);
    }
    return {
      topic: 'Roots without solving', rank: form === 'given' ? 15 : (form === 'times' ? 19 : 18) + (ask === 'sum' ? 1 : 0),
      text: form === 'given' ? `For how many integers b does ${eq} have two different roots that are both integers?`
        : ask === 'count' ? `For how many integers a does ${eq} have only integer roots?` : `What is the sum of all the integers a for which ${eq} has only integer roots?`,
      answer: choices(d, ans, ask === 'sum' ? [posSum, n * count, total + 2 * both, 2 * tau]
        : form === 'given' && n < 0 ? [Math.ceil(tau / 2), 2 * tau, tau - 1, tau + 1] : [count / 2, tau, 2 * tau, count + 1, count - 1]),
      check: () => {
        const L = form === 'given' ? N + 2 : form === 'times' ? (n + 1) ** 2 + 5 : N + 10, good = [];
        for (let a = -L; a <= L; a++) {
          const [B, C] = form === 'given' ? [a, n] : form === 'times' ? [sg === '−' ? -a : a, n * a] : [a, a + n], D = B * B - 4 * C;
          if (D >= 0 && isSq(D) && !(form === 'given' && D === 0) && (isqrt(D) - B) % 2 === 0) good.push(a);
        }
        const got = ask === 'count' ? good.length : good.reduce((x, y) => x + y, 0);
        return got === ans ? '' : `found ${good.join(', ')}`;
      },
      solution,
    };
  },
];

// ---------- Polynomial remainders ----------
const PAIRS = [[1, 2], [2, 1], [-1, 2], [2, -1], [1, -2], [-2, 1], [-1, 1], [1, -1], [-2, 2], [2, -2], [-1, -2], [-2, -1]];
const TRIPLES = [[[-1, 1, 2], 3], [[-2, -1, 1], 2], [[0, 1, 2], -1], [[-1, 0, 1], 2], [[-2, 0, 2], 1], [[-1, 1, 2], -2],
  [[0, 1, 2], 3], [[-2, -1, 0], 1], [[1, 2, -1], 0], [[-2, 1, 2], -1], [[-1, 0, 2], 1], [[-2, -1, 2], 0]];
const factors = (xs) => (xs.includes(0) ? 'x' : '') + xs.filter((a) => a !== 0).map((a) => `(${minus(a)})`).join('');
// dividing by each of these, the powers of x go round: x^r leaves table[r] (coefficients, lowest first) for r = 0 … period − 1
const CYCLES = {
  'x2-1': { cs: [-1, 0, 1], rank: 14, table: [[1, 0], [0, 1]], why: `Dividing by ${poly([-1, 0, 1])}, x<sup>2</sup> leaves remainder 1, so every even power of x leaves 1 and every odd power leaves x.` },
  'x2+1': { cs: [1, 0, 1], rank: 15, table: [[1, 0], [0, 1], [-1, 0], [0, -1]], why: `Dividing by ${poly([1, 0, 1])}, x<sup>2</sup> leaves remainder −1, so x<sup>4</sup> leaves 1 and the powers of x go round in fours: x<sup>e</sup> leaves 1, x, −1 or −x as e leaves remainder 0, 1, 2 or 3 on division by 4.` },
  'x2+x+1': { cs: [1, 1, 1], rank: 16, table: [[1, 0], [0, 1], [-1, -1]], why: `Since x<sup>3</sup> − 1 = (x − 1)(${poly([1, 1, 1])}), x<sup>3</sup> leaves remainder 1, so the powers of x go round in threes: x<sup>e</sup> leaves 1, x or x<sup>2</sup> as e leaves remainder 0, 1 or 2 on division by 3, and x<sup>2</sup> itself leaves −x − 1.` },
  'x2-x+1': { cs: [1, -1, 1], rank: 17, table: [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]], why: `Since x<sup>3</sup> + 1 = (x + 1)(${poly([1, -1, 1])}), x<sup>3</sup> leaves remainder −1 and x<sup>6</sup> leaves 1, so the powers of x go round in sixes: x<sup>e</sup> leaves 1, x, x − 1, −1, −x or 1 − x as e leaves remainder 0, 1, 2, 3, 4 or 5 on division by 6.` },
  'x4+x3': { cs: [1, 1, 1, 1, 1], rank: 17, table: [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1], [-1, -1, -1, -1]], why: `Since x<sup>5</sup> − 1 = (x − 1)(${poly([1, 1, 1, 1, 1])}), x<sup>5</sup> leaves remainder 1, so the powers of x go round in fives: x<sup>e</sup> leaves the same as x<sup>r</sup>, where r is the remainder of e on division by 5, and x<sup>4</sup> itself leaves −x<sup>3</sup> − x<sup>2</sup> − x − 1.` },
};
// the same reduction with the wrong rules (for wrong answers): another divisor's cycle, or a sign slip
const SLIPS = {
  'x2-1': [CYCLES['x2+1'].table, CYCLES['x2+x+1'].table, [[0, 1], [1, 0]]],
  'x2+1': [CYCLES['x2-1'].table, CYCLES['x2-x+1'].table, [[1, 0], [0, 1], [1, 0], [0, 1]]],
  'x2+x+1': [[[1, 0], [0, 1], [1, 1]], CYCLES['x2-1'].table, CYCLES['x2+1'].table],
  'x2-x+1': [[[1, 0], [0, 1], [-1, 1]], CYCLES['x2+x+1'].table, CYCLES['x2+1'].table],
  'x4+x3': [[[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1], [1, 1, 1, 1]], [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [0, 0, 0, 1]], [[1, 0, 0, 0], [0, 1, 0, 0], [0, 0, 1, 0], [-1, -1, -1, 0]]],
};
const reduce = (list, c0, table, deg) => {
  const rem = Array(deg).fill(0);
  for (const [c, e] of list) table[e % table.length].forEach((x, j) => { rem[j] += c * x; });
  rem[0] += c0;
  return rem;
};
const EXPS = [[2026, 1001, 75], [2025, 998, 31], [1000, 501, 22], [999, 100, 13], [2027, 502, 6], [1234, 567, 89], [3001, 250, 11], [1990, 777, 38], [2024, 1003, 59], [1500, 333, 14]];
const COEFS = [[1, 1, 1], [1, 2, -1], [1, -1, 2], [2, 1, -3], [1, -2, 1], [3, -1, 1]];
// products whose coefficients are asked about: [coefficients (lowest first), power] for each factor
const PRODUCTS = [
  [[[-1, 2], 5], [[3, 1], 1]], [[[-1, 3], 4], [[-2, 1], 1]], [[[-2, 1], 6], [[1, 2], 1]], [[[1, 2], 4], [[-3, 1], 1]], [[[-2, 3], 3], [[1, 2], 1]],
  [[[2, 1], 5], [[-2, 1], 1]], [[[-3, 2], 4], [[2, 1], 1]], [[[-3, 1], 4], [[1, 3], 1]], [[[1, -3, 1], 5]], [[[-2, 2, 1], 4]], [[[-3, -1, 1], 4]], [[[3, -2, 1], 3]],
];
const factorText = (fs) => fs.map(([cs, n]) => `(${poly(cs)})${n > 1 ? `<sup>${n}</sup>` : ''}`).join('');
const at = (cs, x) => cs.reduce((s, c, i) => s + c * x ** i, 0);
const LINES = [[2, 1], [1, 0], [3, -2], [-1, 5], [2, -3], 'sq'];

const remainders = [
  // the remainders on division by x − a and x − b known: the remainder on division by their product (with three, its value)
  (d, ctx) => {
    const [ask, i] = pick(ctx, 'two', [['line', 'expanded', 'three'], range(0, 11)]);
    const xs = ask === 'three' ? TRIPLES[i][0] : PAIRS[i], t = ask === 'three' ? TRIPLES[i][1] : 0;
    // the polynomial behind the remainders, never shown: x^e + c2·x² + c1·x + c0
    const e = d.pick([3, 4, 5]), c2 = d.int(-3, 3), c0 = d.int(-5, 5);
    let c1 = d.int(-3, 3);
    const Pv = (x) => x ** e + c2 * x * x + c1 * x + c0;
    if (ask !== 'three' && Pv(xs[1]) === Pv(xs[0])) c1 += 1;             // so the remainder isn't just a number
    const us = xs.map(Pv), [x1, x2, x3] = xs, [u1, u2, u3] = us, f12 = (u2 - u1) / (x2 - x1);
    // the answer from the remainders alone: the line (or parabola) through the points (x, P(x)), by divided differences
    let R;
    if (ask === 'three') { const f123 = ((u3 - u2) / (x3 - x2) - f12) / (x3 - x1); R = [u1 - f12 * x1 + f123 * x1 * x2, f12 - f123 * (x1 + x2), f123]; }
    else R = [u1 - f12 * x1, f12];
    const check = () => {
      const hidden = [c0, c1, c2, ...Array(e - 3).fill(0), 1].map(BigInt), div = xs.reduce((p, x) => pmul(p, [BigInt(-x), 1n]), [1n]);
      if (us.some((u, j) => Number(peval(hidden, xs[j])) !== u)) return 'the remainders are not P’s values';
      const r = pmod(hidden, div).map(Number);
      return r.every((x, j) => x === R[j]) ? '' : `long division leaves ${poly(r)}, said ${poly(R)}`;
    };
    if (ask === 'three') {
      const ans = R[0] + R[1] * t + R[2] * t * t, line = u1 + (f12 * (t - x1));
      return {
        topic: 'Polynomial remainders', rank: 17,
        text: `A polynomial P(x) leaves remainder ${num(u1)} when divided by ${minus(x1)}, remainder ${num(u2)} when divided by ${minus(x2)}, and remainder ${num(u3)} when divided by ${minus(x3)}. Let R(x) be the remainder when P(x) is divided by ${factors(xs)}. What is R(${num(t)})?`,
        answer: choices(d, ans, [line, u1 + u2 + u3, -ans, R[0] - R[1] * t + R[2] * t * t, R[0]].filter(Number.isInteger)),
        check: () => check() || (ans === R[0] + R[1] * t + R[2] * t * t ? '' : 'R(t) wrong'),
        solution: `Dividing by a cubic leaves a remainder of degree at most 2, and since P(x) = ${factors(xs)}·S(x) + R(x), R agrees with P wherever the cubic is 0. By the remainder theorem that means R(${num(x1)}) = ${num(u1)}, R(${num(x2)}) = ${num(u2)} and R(${num(x3)}) = ${num(u3)}. Writing R(x) = px<sup>2</sup> + qx + r, these say ${listing(xs.map((x, j) => `${expr([x * x, 'p'], [x, 'q'], [1, 'r'])} = ${num(us[j])}`))}. Subtracting them in pairs to get rid of r and solving, R(x) = ${poly(R)}. So R(${num(t)}) = <b>${num(ans)}</b>.`,
      };
    }
    const [a, b] = xs, [u, v] = us, [n, m] = R;
    const correct = polyChoice(R);
    return {
      topic: 'Polynomial remainders', rank: ask === 'line' ? 15 : 16,
      text: `When a polynomial P(x) is divided by ${minus(a)}, the remainder is ${num(u)}, and when it is divided by ${minus(b)}, the remainder is ${num(v)}. What is the remainder when P(x) is divided by ${ask === 'line' ? factors(xs) : poly([a * b, -(a + b), 1])}?`,
      answer: labelled(correct, [[v + m * a, -m], [n, -m], [u - (v - u) * a, v - u], [m, n], [-n, m], [u + v, 0], [u, v - u], [n + 1, m]].map(polyChoice)),
      check,
      solution: `${ask === 'expanded' ? `The divisor factors as ${poly([a * b, -(a + b), 1])} = ${factors(xs)}. ` : ''}Dividing by a quadratic leaves a remainder of degree at most 1, so P(x) = ${factors(xs)}·S(x) + mx + n for some polynomial S(x). Putting in x = ${num(a)} makes the first part 0, and by the remainder theorem P(${num(a)}) = ${num(u)}, so ${expr([a, 'm'], [1, 'n'])} = ${num(u)}; in the same way ${expr([b, 'm'], [1, 'n'])} = ${num(v)}. Subtracting, ${expr([b - a, 'm'])} = ${num(v - u)}${b - a === 1 ? '' : `, so m = ${num(m)}`}, and then n = ${num(n)}. The remainder is <b>${correct[1]}</b>.`,
    };
  },
  // a sum of huge powers of x divided by x² − 1, x² + 1, x² ± x + 1 or x⁴ + x³ + x² + x + 1: the powers go round
  (d, ctx) => {
    const [key, exps, coefs, c0] = pick(ctx, 'cycle', [Object.keys(CYCLES), EXPS, COEFS, [-2, 1, 3, 4]],
      (key, exps, coefs, c0) => reduce(exps.map((e, j) => [coefs[j], e]), c0, CYCLES[key].table, CYCLES[key].cs.length - 1).slice(1).some((x) => x !== 0));
    const { cs, rank, table, why } = CYCLES[key], deg = cs.length - 1, list = exps.map((e, j) => [coefs[j], e]);
    const rem = reduce(list, c0, table, deg), correct = polyChoice(rem), P1 = coefs.reduce((s, c) => s + c, 0) + c0;
    // wrong rules, the powers left unreduced past the divisor's degree, and P(1) as if the remainder were a number
    const unreduced = Array(table.length).fill(0);
    for (const [c, e] of list) unreduced[e % table.length] += c;
    unreduced[0] += c0;
    const wrongs = [...SLIPS[key].map((tb) => reduce(list, c0, tb, deg)), unreduced, [P1], rem.map((x, j) => (j === 1 ? -x : x)), rem.map((x) => -x),
      rem.map((x, j) => (j === 0 ? x - c0 : x)), rem.map((x, j) => (j === 0 ? x + 1 : x)), rem.map((x, j) => (j === 1 ? x + 1 : x))];
    return {
      topic: 'Polynomial remainders', rank,
      text: `What is the remainder when ${termsText([...list, [c0, 0]])} is divided by ${poly(cs)}?`,
      answer: labelled(correct, wrongs.map(polyChoice)),
      check: () => {
        const r = pmod(terms([...list, [c0, 0]]), cs.map(BigInt)).map(Number);
        return r.every((x, j) => x === rem[j]) ? '' : `long division leaves ${poly(r)}`;
      },
      solution: `${why} Here ${list.map(([c, e]) => `${termsText([[c, e]])} leaves ${poly(table[e % table.length].map((x) => c * x))}`).join(', ')}, and ${num(c0)} stays as it is. Adding these up, the remainder is <b>${correct[1]}</b>.`,
    };
  },
  // sums of some of the coefficients of a product, from P(1), P(−1) and P(0)
  (d, ctx) => {
    const sums = (fs) => {
      const P = (x) => fs.reduce((s, [cs, n]) => s * at(cs, x) ** n, 1), P1 = P(1), Pm = P(-1), P0 = P(0), E = (P1 + Pm) / 2, O = (P1 - Pm) / 2;
      return { P1, Pm, P0, E, O, ans: { even: E, odd: O, noconst: P1 - P0, evenx: E - P0 } };
    };
    const [fs, ask] = pick(ctx, 'coef', [PRODUCTS, ['even', 'odd', 'noconst', 'evenx']], (fs, ask) => sums(fs).ans[ask] !== 0);
    const { P1, Pm, P0, E, O } = sums(fs), ans = sums(fs).ans[ask];
    const shownAt = (x) => fs.map(([cs, n]) => (n > 1 ? `${paren(at(cs, x))}<sup>${n}</sup>` : paren(at(cs, x)))).join('·');
    const ones = `Write P(x) for the product. Putting x = 1 adds up all of its coefficients, and putting x = −1 adds the coefficients of the even powers and subtracts those of the odd powers. Here P(1) = ${shownAt(1)} = ${num(P1)} and P(−1) = ${shownAt(-1)} = ${num(Pm)}.`;
    return {
      topic: 'Polynomial remainders', rank: { even: 15, odd: 15, noconst: 14, evenx: 16 }[ask],
      text: `When ${factorText(fs)} is multiplied out, what is the sum of ${{
        even: 'the coefficients of the even powers of x (x<sup>0</sup>, x<sup>2</sup>, x<sup>4</sup>, …), counting the constant term', odd: 'the coefficients of the odd powers of x (x, x<sup>3</sup>, x<sup>5</sup>, …)',
        noconst: 'all of its coefficients except the constant term', evenx: 'the coefficients of x<sup>2</sup>, x<sup>4</sup>, x<sup>6</sup>, …',
      }[ask]}?`,
      answer: choices(d, ans, {
        even: [O, P1 + Pm, P1, Pm, E - P0], odd: [E, P1 - Pm, P1, -Pm, -O], noconst: [P1, P1 + P0, P0 - P1, P1 - 1, -P0], evenx: [E, E + P0, O - P0, P1 - P0, O],
      }[ask]),
      check: () => {
        const cs = fs.reduce((acc, [c, n]) => pmul(acc, ppow(c.map(BigInt), n)), [1n]);
        const got = Number(cs.reduce((s, c, i) => s + ({ even: i % 2 === 0, odd: i % 2 === 1, noconst: i > 0, evenx: i % 2 === 0 && i > 0 }[ask] ? c : 0n), 0n));
        return got === ans ? '' : `multiplied out, they add up to ${got}`;
      },
      solution: {
        even: `${ones} Adding them cancels the odd powers and counts each even power twice, so the even-power coefficients add up to (${num(P1)} + ${paren(Pm)})/2 = <b>${num(ans)}</b>.`,
        odd: `${ones} Subtracting cancels the even powers and counts each odd power twice, so the odd-power coefficients add up to (${num(P1)} − ${paren(Pm)})/2 = <b>${num(ans)}</b>.`,
        noconst: `Write P(x) for the product. Putting x = 1 adds up all of its coefficients: P(1) = ${shownAt(1)} = ${num(P1)}. The constant term is P(0) = ${shownAt(0)} = ${num(P0)}, so the other coefficients add up to ${num(P1)} − ${paren(P0)} = <b>${num(ans)}</b>.`,
        evenx: `${ones} Adding them counts each even power twice, so the even powers, constant included, add up to (${num(P1)} + ${paren(Pm)})/2 = ${num(E)}. Taking away the constant term P(0) = ${shownAt(0)} = ${num(P0)} leaves <b>${num(ans)}</b>.`,
      }[ask],
    };
  },
  // values of P at 1, 2, …, n: take away what they follow, and what is left has 1, 2, …, n as roots
  (d, ctx) => {
    const [ask, n, j, w] = pick(ctx, 'fit', [['monic', 'extra', 'recip'], [3, 4, 5], range(0, 5), [0, 1, 2]], (ask, n, j) => ask !== 'recip' || j === 0);
    const prod = (x, N = n) => range(1, N).reduce((s, k) => s * (x - k), 1), prodText = (x, N = n) => range(1, N).map((k) => paren(x - k)).join('·');
    const roots = (N = n) => range(1, N).map((k) => `(x − ${k})`).join('');
    if (ask === 'recip') {
      // xP(x) − 1 = c(x − 1)⋯(x − N), with c = −1/f where f = (−1)(−2)⋯(−N), so P(m) = (1 − prod(m)/f)/m
      const N = n, m = [N + 1, N + 2, -1][w], f = prod(0, N), c = cut(-1, f), ans = cut(f - prod(m, N), f * m), cp = cut(-prod(m, N), f);
      return {
        topic: 'Polynomial remainders', rank: 19,
        text: `A polynomial P(x) of degree ${N - 1} has ${listing(range(1, N).map((k) => `P(${k}) = ${frac(1, k)}`))}. What is P(${num(m)})?`,
        answer: fchoices(d, ans, [cut(1, m), cut(f + prod(m, N), f * m), cut(-prod(m, N), f * m), [0, 1], cut(f - prod(m, N), f)]),
        check: () => said(lagrange(range(1, N), range(1, N).map((k) => Q(1, k)), m), ans),
        solution: `The values 1/k are awkward, but D(x) = xP(x) − 1 is 0 at x = ${listing(range(1, N))}, and it has degree ${N}. So D(x) = c${roots(N)} for some number c. At x = 0, D(0) = −1, while the product is ${prodText(0, N)} = ${num(f)}, so c = ${fr(c)}. Then ${paren(m)}·P(${num(m)}) − 1 = ${pf(c)}·${prodText(m, N)} = ${fr(cp)}, so P(${num(m)}) = <b>${fr(ans)}</b>.`,
      };
    }
    const Lp = LINES[j], L = Lp === 'sq' ? (x) => x * x : (x) => Lp[0] * x + Lp[1], Ltext = Lp === 'sq' ? sup('x', 2) : poly([Lp[1], Lp[0]]);
    const C = ask === 'monic' ? 1 : [2, -1, 3, -2, 4, -3][j], m = ask === 'monic' ? [n + 1, n + 2, 0][w] : [n + 1, n + 2, -1][w];
    const P0 = L(0) + C * prod(0), ans = L(m) + C * prod(m), values = range(1, n).map((k) => `P(${k}) = ${num(L(k))}`);
    const D = `D(x) = P(x) − ${Lp === 'sq' || Lp[1] === 0 ? Ltext : `(${Ltext})`}`;
    return {
      topic: 'Polynomial remainders', rank: ask === 'monic' ? 16 : 17,
      text: ask === 'monic' ? `A polynomial P(x) of degree ${n} with leading coefficient 1 has ${listing(values)}. What is P(${num(m)})?`
        : `A polynomial P(x) of degree ${n} has ${listing([...values, `P(0) = ${num(P0)}`])}. What is P(${num(m)})?`,
      answer: choices(d, ans, ask === 'monic' ? [L(m), L(m) - prod(m), prod(m), L(m) + range(0, n - 1).reduce((s, k) => s * (m - k), 1), L(m) + prod(m) / 2]
        : [L(m), L(m) + prod(m), L(m) - C * prod(m), C * prod(m), L(m) + C * prod(m, n - 1)]),
      check: () => {
        const xs = range(1, n), at0 = ask === 'monic' ? null : Q(P0);
        // monic: P − xⁿ has degree n − 1 and is fixed by n values; otherwise the n + 1 values fix P
        const got = ask === 'monic' ? qadd(lagrange(xs, xs.map((k) => Q(L(k) - k ** n)), m), Q(m ** n)) : lagrange([0, ...xs], [at0, ...xs.map((k) => Q(L(k)))], m);
        return said(got, [ans, 1]);
      },
      solution: ask === 'monic'
        ? `The values are those of ${Ltext} at x = ${listing(range(1, n))}, so ${D} is 0 at each of them. Taking away ${Ltext} doesn't change the top term, so D(x) still has degree ${n} and leading coefficient 1, and D(x) = ${roots()}. So P(${num(m)}) = ${num(L(m))} + ${prodText(m)} = ${num(L(m))} + ${paren(prod(m))} = <b>${num(ans)}</b>.`
        : `The values are those of ${Ltext} at x = ${listing(range(1, n))}, so ${D} is 0 at each of them, and D has degree ${n}. So D(x) = c${roots()} for some number c. At x = 0, D(0) = ${num(P0)} − ${paren(L(0))} = ${num(P0 - L(0))}, while the product is ${prodText(0)} = ${num(prod(0))}, so c = ${num(C)}. Then P(${num(m)}) = ${num(L(m))} + ${paren(C)}·${prodText(m)} = <b>${num(ans)}</b>.`,
    };
  },
];

// ---------- Telescoping sums ----------
const half = frac(1, 2);
const fact = (n) => range(1, n).reduce((s, k) => s * k, 1);
const telescoping = [
  // sums of 1/((2k − 1)(2k + 1)), 1/(k(k + 2)), 1/(k² − 1) or 1/(k(k + 1)(k + 2)): each term is half a difference
  (d, ctx) => {
    const [ask, N] = pick(ctx, 'split', [['odd', 'gap', 'square', 'triple'], [8, 9, 10, 12, 14, 18, 19, 20, 24, 28, 30, 48]]);
    const bottom = { odd: (k) => (2 * k - 1) * (2 * k + 1), gap: (k) => k * (k + 2), square: (k) => k * k - 1, triple: (k) => k * (k + 1) * (k + 2) }[ask], from = ask === 'square' ? 2 : 1;
    const shown = { odd: (k) => `${2 * k - 1}·${2 * k + 1}`, gap: (k) => `${k}·${k + 2}`, square: (k) => `${sup(k, 2)} − 1`, triple: (k) => `${k}·${k + 1}·${k + 2}` }[ask];
    const A = N + 1, B = N + 2;
    const ans = { odd: cut(N, 2 * N + 1), gap: cut(3 * A * B - 2 * (A + B), 4 * A * B), square: cut(3 * N * A - 2 * (N + A), 4 * N * A), triple: cut(A * B - 2, 4 * A * B) }[ask];
    const wrong = {
      odd: [cut(2 * N, 2 * N + 1), cut(N, 2 * N - 1), cut(N + 1, 2 * N + 1), [1, 2], cut(N - 1, 2 * N - 1)],
      gap: [cut(3 * A * B - 2 * (A + B), 2 * A * B), cut(A, 2 * B), cut(3 * B - 2, 4 * B), [3, 4], cut(N, B)],
      square: [cut(3 * N * A - 2 * (N + A), 2 * N * A), cut(N, 2 * A), cut(3 * A - 2, 4 * A), [3, 4], cut(N - 1, A)],
      triple: [cut(A * B - 2, 2 * A * B), [1, 4], cut(B * (B + 1) - 2, 4 * B * (B + 1)), cut(N, 2 * B), cut(A * B - 1, 4 * A * B)],
    }[ask];
    return {
      topic: 'Telescoping sums', rank: { odd: 14, gap: 15, square: 16, triple: 16 }[ask],
      text: `What is ${[from, from + 1, from + 2].map((k) => over(1, shown(k))).join(' + ')} + ⋯ + ${over(1, shown(N))}?`,
      answer: fchoices(d, ans, wrong),
      check: () => { let sum = Q(0); for (let k = from; k <= N; k++) sum = qadd(sum, Q(1, bottom(k))); return said(sum, ans); },
      solution: {
        odd: `The fractions ${over(1, '2k − 1')} and ${over(1, '2k + 1')} differ by ${over(2, '(2k − 1)(2k + 1)')}, so each term is half of that difference. Adding the halves for k = 1 to ${N}, every fraction after ${over(1, 1)} comes in once with a plus and once with a minus, so only ${half}(1 − ${frac(1, 2 * N + 1)}) is left. That is <b>${fr(ans)}</b>.`,
        gap: `The fractions ${over(1, 'k')} and ${over(1, 'k + 2')} differ by ${over(2, 'k(k + 2)')}, so each term is ${half}(${over(1, 'k')} − ${over(1, 'k + 2')}). Adding these for k = 1 to ${N}, each ${over(1, 'k')} is cancelled by the term two places later, so only the first two plus parts and the last two minus parts are left: ${half}(1 + ${half} − ${frac(1, A)} − ${frac(1, B)}). That is <b>${fr(ans)}</b>.`,
        square: `Since k<sup>2</sup> − 1 = (k − 1)(k + 1), and ${over(1, 'k − 1')} − ${over(1, 'k + 1')} = ${over(2, `${sup('k', 2)} − 1`)}, each term is ${half}(${over(1, 'k − 1')} − ${over(1, 'k + 1')}). Adding these for k = 2 to ${N}, each fraction is cancelled by one two places later, so only ${half}(1 + ${half} − ${frac(1, N)} − ${frac(1, A)}) is left. That is <b>${fr(ans)}</b>.`,
        triple: `The fractions ${over(1, 'k(k + 1)')} and ${over(1, '(k + 1)(k + 2)')} differ by ${over(2, 'k(k + 1)(k + 2)')}, so each term is half of that difference. Adding the halves for k = 1 to ${N}, the middle parts cancel, so only ${half}(${frac(1, 2)} − ${frac(1, A * B)}) is left. That is <b>${fr(ans)}</b>.`,
      }[ask],
    };
  },
  // products like (1 − 1/k²) or (k³ − 1)/(k³ + 1): factor every term, and the factors cancel along the line
  (d, ctx) => {
    const [ask, N] = pick(ctx, 'prod', [['squares', 'pairs', 'cubes', 'plus'], [6, 8, 9, 10, 12, 15, 20, 24, 30, 40, 50, 99]], (ask, N) => ask !== 'cubes' || N <= 20);
    const term = { squares: (k) => [k * k - 1, k * k], pairs: (k) => [k * (k + 1) - 2, k * (k + 1)], cubes: (k) => [k ** 3 - 1, k ** 3 + 1], plus: (k) => [k * (k + 2) + 1, k * (k + 2)] }[ask];
    const from = ask === 'plus' ? 1 : 2, A = N + 1, B = N + 2, M = N * N + N + 1;
    const shown = {
      squares: (k) => `(1 − ${over(1, sup(k, 2))})`, pairs: (k) => `(1 − ${over(2, `${k}·${k + 1}`)})`,
      cubes: (k) => over(`${sup(k, 3)} − 1`, `${sup(k, 3)} + 1`), plus: (k) => `(1 + ${over(1, `${k}·${k + 2}`)})`,
    }[ask];
    const ans = { squares: cut(A, 2 * N), pairs: cut(B, 3 * N), cubes: cut(2 * M, 3 * N * A), plus: cut(2 * A, B) }[ask];
    const wrong = {
      squares: [cut(1, N), cut(A, N), cut(N - 1, 2 * N), [1, 2], cut(N, 2 * (N - 1))],
      pairs: [cut(1, N), cut(B, 3), cut(A, 3 * N), [1, 3], cut(B, 2 * N)],
      cubes: [cut(2, N * A), cut(M, 3 * N * A), [2, 3], cut(M, 3), cut(2 * (N * N - N + 1), 3 * N * (N - 1))],
      plus: [cut(A, B), cut(2 * N, A), [2, 1], cut(2 * B, N + 3), [A, 1]],
    }[ask];
    return {
      topic: 'Telescoping sums', rank: { squares: 15, pairs: 17, cubes: 18, plus: 16 }[ask],
      text: `What is ${ask === 'cubes' ? `${[2, 3, 4].map(shown).join(' · ')} · ⋯ · ${shown(N)}` : `${[from, from + 1, from + 2].map(shown).join('')}⋯${shown(N)}`}?`,
      answer: fchoices(d, ans, wrong),
      check: () => { let p = Q(1); for (let k = from; k <= N; k++) p = qmul(p, Q(...term(k))); return said(p, ans); },
      solution: {
        squares: `Factor each term: 1 − ${over(1, sup('k', 2))} = ${over('(k − 1)(k + 1)', sup('k', 2))} = ${over('k − 1', 'k')} · ${over('k + 1', 'k')}. The parts ${over('k − 1', 'k')} are ${frac(1, 2)} · ${frac(2, 3)} ⋯ ${over(N - 1, N)}, which cancel down to ${frac(1, N)}, and the parts ${over('k + 1', 'k')} are ${over(3, 2)} · ${over(4, 3)} ⋯ ${over(A, N)}, which cancel down to ${frac(A, 2)}. So the product is ${frac(1, N)} · ${frac(A, 2)} = <b>${fr(ans)}</b>.`,
        pairs: `Each term is ${over('k(k + 1) − 2', 'k(k + 1)')} = ${over('(k − 1)(k + 2)', 'k(k + 1)')} = ${over('k − 1', 'k')} · ${over('k + 2', 'k + 1')}. The parts ${over('k − 1', 'k')} cancel down to ${frac(1, N)}, and the parts ${over('k + 2', 'k + 1')} are ${over(4, 3)} · ${over(5, 4)} ⋯ ${over(B, A)}, which cancel down to ${frac(B, 3)}. So the product is ${frac(1, N)} · ${frac(B, 3)} = <b>${fr(ans)}</b>.`,
        cubes: `Factor: k<sup>3</sup> − 1 = (k − 1)(k<sup>2</sup> + k + 1) and k<sup>3</sup> + 1 = (k + 1)(k<sup>2</sup> − k + 1). The parts ${over('k − 1', 'k + 1')} are ${over(1, 3)} · ${over(2, 4)} · ${over(3, 5)} ⋯ ${over(N - 1, A)}, which cancel down to ${over('1·2', `${N}·${A}`)} = ${frac(2, N * A)}. The parts ${over(`${sup('k', 2)} + k + 1`, `${sup('k', 2)} − k + 1`)} cancel too, because k<sup>2</sup> + k + 1 is what k<sup>2</sup> − k + 1 becomes at k + 1: they are ${over(7, 3)} · ${over(13, 7)} ⋯ ${over(M, N * N - N + 1)}, which cancel down to ${frac(M, 3)}. So the product is ${frac(2, N * A)} · ${frac(M, 3)} = <b>${fr(ans)}</b>.`,
        plus: `Each term is ${over('k(k + 2) + 1', 'k(k + 2)')} = ${over(`(k + 1)<sup>2</sup>`, 'k(k + 2)')} = ${over('k + 1', 'k')} · ${over('k + 1', 'k + 2')}. The parts ${over('k + 1', 'k')} are ${over(2, 1)} · ${over(3, 2)} ⋯ ${over(A, N)}, which cancel down to ${A}, and the parts ${over('k + 1', 'k + 2')} are ${over(2, 3)} · ${over(3, 4)} ⋯ ${over(A, B)}, which cancel down to ${frac(2, B)}. So the product is ${A} · ${frac(2, B)} = <b>${fr(ans)}</b>.`,
      }[ask],
    };
  },
  // sums of 1/(√k + √(k + 1)) and relatives: rationalize, and the square roots cancel in pairs
  (d, ctx) => {
    const options = [
      ...[[1, 49], [4, 100], [4, 81], [9, 144], [1, 64], [4, 121], [16, 169], [9, 196], [25, 225]].map((x) => ['consecutive', x]),
      ...[12, 24, 40, 60, 84, 112, 144, 180, 220].map((x) => ['odd', x]),
      ...[3, 4, 5, 6, 7, 8, 9, 10, 11].map((x) => ['mixed', x]),
      ...[5, 6, 7, 8, 9, 10, 11, 12, 14].map((x) => ['count', x]),
    ];
    const [[ask, v]] = pick(ctx, 'roots', [options]);
    const t = (top, a, b) => over(top, `${a} + ${b}`);
    if (ask === 'consecutive') {
      const [a, B] = v, r = isqrt(B), s0 = isqrt(a), ans = r - s0;
      return {
        topic: 'Telescoping sums', rank: 15,
        text: `What is ${t(1, `√${a}`, `√${a + 1}`)} + ${t(1, `√${a + 1}`, `√${a + 2}`)} + ${t(1, `√${a + 2}`, `√${a + 3}`)} + ⋯ + ${t(1, `√${B - 1}`, `√${B}`)}?`,
        answer: labelled([ans, num(ans)], [[Math.sqrt(B - 1) - s0, `${surd(1, B - 1)[1]} − ${s0}`], [r + s0, num(r + s0)], [r, num(r)], [ans - 1, num(ans - 1)], [ans + 1, num(ans + 1)]]),
        check: () => { let sum = 0; for (let k = a; k < B; k++) sum += 1 / (Math.sqrt(k) + Math.sqrt(k + 1)); return near([sum, 0], ans, 'sum'); },
        solution: `Rationalize each term. Multiplying top and bottom by √(k + 1) − √k turns ${t(1, '√k', '√(k + 1)')} into ${over('√(k + 1) − √k', '(k + 1) − k')} = √(k + 1) − √k. So the sum is (√${a + 1} − √${a}) + (√${a + 2} − √${a + 1}) + ⋯ + (√${B} − √${B - 1}), and everything cancels except √${B} − √${a}. That is ${r} − ${s0} = <b>${num(ans)}</b>.`,
      };
    }
    if (ask === 'odd') {
      const N = v, q = isqrt(2 * N + 1), ans = (q - 1) / 2;
      return {
        topic: 'Telescoping sums', rank: 16,
        text: `What is ${t(1, '√1', '√3')} + ${t(1, '√3', '√5')} + ${t(1, '√5', '√7')} + ⋯ + ${t(1, `√${2 * N - 1}`, `√${2 * N + 1}`)}?`,
        answer: fchoices(d, ans, [q - 1, (q + 1) / 2, cut(q, 2), q, ans - 1]),
        check: () => { let sum = 0; for (let k = 1; k <= N; k++) sum += 1 / (Math.sqrt(2 * k - 1) + Math.sqrt(2 * k + 1)); return near([sum, 0], ans, 'sum'); },
        solution: `Rationalize each term. Multiplying top and bottom by √(2k + 1) − √(2k − 1) turns it into ${over('√(2k + 1) − √(2k − 1)', '2')}, since (2k + 1) − (2k − 1) = 2. Adding these, the square roots cancel in pairs, leaving ${over(`√${2 * N + 1} − √1`, 2)}. That is ${over(`${q} − 1`, 2)} = <b>${num(ans)}</b>.`,
      };
    }
    if (ask === 'mixed') {
      const q = v, N = q * q - 1, ans = cut(q - 1, q);
      const term = (k) => over(1, `${k + 1}√${k} + ${k}√${k + 1}`);
      return {
        topic: 'Telescoping sums', rank: 18,
        text: `What is ${term(1)} + ${term(2)} + ${term(3)} + ⋯ + ${term(N)}?`,
        answer: fchoices(d, ans, [cut(N, N + 1), [1, q], cut(q, q + 1), cut(q - 1, q + 1), cut(q - 2, q - 1)]),
        check: () => { let sum = 0; for (let k = 1; k <= N; k++) sum += 1 / ((k + 1) * Math.sqrt(k) + k * Math.sqrt(k + 1)); return near([sum, 0], ans[0] / ans[1], 'sum'); },
        solution: `Take √k · √(k + 1) out of the bottom: (k + 1)√k + k√(k + 1) = √k · √(k + 1) · (√(k + 1) + √k). Rationalizing then turns each term into ${over('√(k + 1) − √k', '√k · √(k + 1)')} = ${over(1, '√k')} − ${over(1, '√(k + 1)')}. Adding these for k = 1 to ${N}, everything cancels except ${over(1, '√1')} − ${over(1, `√${q * q}`)} = 1 − ${frac(1, q)} = <b>${fr(ans)}</b>.`,
      };
    }
    const S = v, n = (S + 1) ** 2 - 1;
    return {
      topic: 'Telescoping sums', rank: 15,
      text: `For a positive integer n, the sum ${t(1, '√1', '√2')} + ${t(1, '√2', '√3')} + ${t(1, '√3', '√4')} + ⋯ + ${t(1, '√n', '√(n + 1)')} is equal to ${S}. What is n?`,
      answer: choices(d, n, [(S + 1) ** 2, S * S - 1, S * S, n - 1, (S + 2) ** 2 - 1]),
      check: () => { let sum = 0; for (let k = 1; k <= n; k++) sum += 1 / (Math.sqrt(k) + Math.sqrt(k + 1)); return near([sum, 0], S, 'sum'); },
      solution: `Rationalize each term: (√(k + 1) + √k)(√(k + 1) − √k) = (k + 1) − k = 1, so ${t(1, '√k', '√(k + 1)')} = √(k + 1) − √k. So the sum telescopes to √(n + 1) − √1 = √(n + 1) − 1. Setting that equal to ${S} gives √(n + 1) = ${S + 1}, so n + 1 = ${(S + 1) ** 2} and n = <b>${num(n)}</b>.`,
    };
  },
  // terms that are secretly a difference of neighbours: (2k + 1)/(k²(k + 1)²), k/(k + 1)!, k/(k⁴ + k² + 1), (3k² + 3k + 1)/(k³(k + 1)³)
  (d, ctx) => {
    const [[ask, N]] = pick(ctx, 'hidden', [[
      ...[5, 6, 8, 9, 10, 12, 14, 19, 24, 29].map((n) => ['squares', n]), ...[3, 4, 5, 6, 7].map((n) => ['factorial', n]),
      ...[4, 5, 6, 8, 9, 10, 12, 15, 20].map((n) => ['quartic', n]), ...[3, 4, 5, 6, 9, 19].map((n) => ['cubes', n]),
    ]]);
    const A = N + 1, F = fact(A), M = N * N + N + 1;
    const term = { squares: (k) => [2 * k + 1, k * k * (k + 1) ** 2], factorial: (k) => [k, fact(k + 1)], quartic: (k) => [k, k ** 4 + k * k + 1], cubes: (k) => [3 * k * k + 3 * k + 1, k ** 3 * (k + 1) ** 3] }[ask];
    const shown = {
      squares: (k) => over(2 * k + 1, `${sup(k, 2)}·${sup(k + 1, 2)}`), factorial: (k) => over(k, `${k + 1}!`),
      quartic: (k) => over(k, `${sup(k, 4)} + ${sup(k, 2)} + 1`), cubes: (k) => over(3 * k * k + 3 * k + 1, `${sup(k, 3)}·${sup(k + 1, 3)}`),
    }[ask];
    const ans = { squares: cut(A * A - 1, A * A), factorial: cut(F - 1, F), quartic: cut(N * A, 2 * M), cubes: cut(A ** 3 - 1, A ** 3) }[ask];
    const wrong = {
      squares: [cut(N * N - 1, N * N), cut(N, A), cut((N + 2) ** 2 - 1, (N + 2) ** 2), [1, 1], cut(A * A + 1, A * A)],
      factorial: [cut(fact(N) - 1, fact(N)), cut(fact(N + 2) - 1, fact(N + 2)), [1, 1], cut(F + 1, F), cut(N, A)],
      quartic: [cut(N * A, M), [1, 2], cut(N * (N - 1), 2 * (N * N - N + 1)), cut(N, 2 * A), cut(N * A + 1, 2 * M)],
      cubes: [cut(N ** 3 - 1, N ** 3), cut(A * A - 1, A * A), [1, 1], cut((N + 2) ** 3 - 1, (N + 2) ** 3), cut(N, A)],
    }[ask];
    return {
      topic: 'Telescoping sums', rank: { squares: 16, factorial: 17, quartic: 18, cubes: 17 }[ask],
      text: `What is ${[1, 2, 3].map(shown).join(' + ')} + ⋯ + ${shown(N)}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        let sum = Q(0);
        for (let k = 1; k <= N; k++) { const [p, q] = term(k); sum = qadd(sum, Q(p, q)); }
        return said(sum, ans);
      },
      solution: {
        squares: `The top is the gap between the two squares below it: (k + 1)<sup>2</sup> − k<sup>2</sup> = 2k + 1. So each term is ${over(`(k + 1)<sup>2</sup> − ${sup('k', 2)}`, `${sup('k', 2)}(k + 1)<sup>2</sup>`)} = ${over(1, sup('k', 2))} − ${over(1, '(k + 1)<sup>2</sup>')}. Adding these for k = 1 to ${N}, everything cancels except 1 − ${over(1, sup(A, 2))} = <b>${fr(ans)}</b>.`,
        factorial: `Write the top as k = (k + 1) − 1. Then ${over('k', '(k + 1)!')} = ${over('k + 1', '(k + 1)!')} − ${over(1, '(k + 1)!')} = ${over(1, 'k!')} − ${over(1, '(k + 1)!')}. Adding these for k = 1 to ${N}, everything cancels except ${over(1, '1!')} − ${over(1, `${A}!`)} = 1 − ${frac(1, F)} = <b>${fr(ans)}</b>.`,
        quartic: `The bottom factors: k<sup>4</sup> + k<sup>2</sup> + 1 = (k<sup>2</sup> + 1)<sup>2</sup> − k<sup>2</sup> = (k<sup>2</sup> − k + 1)(k<sup>2</sup> + k + 1). Those two factors differ by 2k, so each term is ${half}(${over(1, `${sup('k', 2)} − k + 1`)} − ${over(1, `${sup('k', 2)} + k + 1`)}). And k<sup>2</sup> + k + 1 is what k<sup>2</sup> − k + 1 becomes at k + 1, so adding these for k = 1 to ${N} leaves only ${half}(1 − ${frac(1, M)}) = <b>${fr(ans)}</b>.`,
        cubes: `The top is the gap between the two cubes below it: (k + 1)<sup>3</sup> − k<sup>3</sup> = 3k<sup>2</sup> + 3k + 1. So each term is ${over(1, sup('k', 3))} − ${over(1, '(k + 1)<sup>3</sup>')}. Adding these for k = 1 to ${N}, everything cancels except 1 − ${over(1, sup(A, 3))} = <b>${fr(ans)}</b>.`,
      }[ask],
    };
  },
];

// ---------- Floors and square roots ----------
const FLOOR = '(⌊x⌋ means the greatest integer less than or equal to x.)';
const brief = (xs) => (xs.length <= 5 ? xs.join(' + ') : `${xs.slice(0, 3).join(' + ')} + ⋯ + ${xs.at(-1)}`);
const times = (c) => (c === 1 ? 'once' : c === 2 ? 'twice' : `${c} times`);
// count numbers from first, step apart: all of them when there are few, else the first two and the last
const run = (first, step, count) => (count <= 4 ? listing(range(0, count - 1).map((j) => num(first + j * step))) : `${num(first)}, ${num(first + step)}, …, ${num(first + (count - 1) * step)}`);
// x² + b = a⌊x⌋: the n allowed by n² ≤ an − b, and those that also pass an − b < (n + 1)²
const floorEq = (a, b) => { const cand = range(1, a).filter((n) => n * n - a * n + b <= 0); return { cand, good: cand.filter((n) => a * n - b < (n + 1) ** 2) }; };
const EQS = range(5, 12).flatMap((a) => range(1, Math.floor((a * a) / 4)).map((b) => [a, b])).filter(([a, b]) => { const { cand, good } = floorEq(a, b); return good.length >= 2 && good.length < cand.length; });
const floors = [
  // ⌊√1⌋ + ⌊√2⌋ + ⋯ + ⌊√N⌋ (or with ⌈√k⌉, or ⌊∛k⌋): group the terms by their value
  (d, ctx) => {
    const [[ask, N]] = pick(ctx, 'sum', [[...[60, 70, 85, 99, 110, 130, 150, 175, 200, 240].map((n) => ['floor', n]), ...[55, 60, 80, 90, 105, 120, 150, 180].map((n) => ['ceil', n]), ...[30, 50, 70, 100, 130, 150, 200, 250].map((n) => ['cube', n])]]);
    const M = { floor: isqrt(N), ceil: isqrt(N - 1) + 1, cube: icbrt(N) }[ask];
    const len = { floor: (m) => 2 * m + 1, ceil: (m) => 2 * m - 1, cube: (m) => 3 * m * m + 3 * m + 1 }[ask];
    const start = { floor: M * M, ceil: (M - 1) ** 2 + 1, cube: M ** 3 }[ask], cnt = N - start + 1;
    const parts = range(1, M - 1).map((m) => m * len(m)), full = parts.reduce((x, y) => x + y, 0), ans = full + M * cnt;
    const slip = { floor: (m) => 2 * m, ceil: (m) => 2 * m, cube: (m) => 3 * m * m }[ask];
    const other = ask === 'ceil' ? range(1, N).reduce((x, k) => x + isqrt(k), 0) : ans + cnt;
    const f = (k) => ({ floor: `⌊√${k}⌋`, ceil: `⌈√${k}⌉`, cube: `⌊∛${k}⌋` }[ask]);
    return {
      topic: 'Floors and square roots', rank: { floor: 15, ceil: 16, cube: 17 }[ask],
      text: `What is ${f(1)} + ${f(2)} + ${f(3)} + ⋯ + ${f(N)}? ${ask === 'ceil' ? '(⌈x⌉ means the least integer greater than or equal to x.)' : FLOOR}`,
      answer: choices(d, ans, [full, full + M * len(M), ans - M, range(1, M - 1).reduce((x, m) => x + m * slip(m), 0) + M * cnt, other]),
      check: () => {
        let sum = 0;
        for (let k = 1; k <= N; k++) sum += ask === 'floor' ? isqrt(k) : ask === 'ceil' ? (isSq(k) ? isqrt(k) : isqrt(k) + 1) : icbrt(k);
        return sum === ans ? '' : `added up to ${sum}`;
      },
      solution: `${{
        floor: '⌊√k⌋ = m exactly when m<sup>2</sup> ≤ k &lt; (m + 1)<sup>2</sup>, which happens for the 2m + 1 numbers from m<sup>2</sup> to m<sup>2</sup> + 2m.',
        ceil: '⌈√k⌉ = m exactly when (m − 1)<sup>2</sup> &lt; k ≤ m<sup>2</sup>, which happens for the 2m − 1 numbers from (m − 1)<sup>2</sup> + 1 to m<sup>2</sup>.',
        cube: '⌊∛k⌋ = m exactly when m<sup>3</sup> ≤ k &lt; (m + 1)<sup>3</sup>, which happens for the (m + 1)<sup>3</sup> − m<sup>3</sup> = 3m<sup>2</sup> + 3m + 1 numbers from m<sup>3</sup> to m<sup>3</sup> + 3m<sup>2</sup> + 3m.',
      }[ask]} So 1 appears ${times(len(1))}, 2 appears ${times(len(2))}, and so on up to ${M - 1}, which appears ${times(len(M - 1))}; then ${M} appears from ${start} to ${N}, ${times(cnt)}. The complete groups add up to ${brief(range(1, M - 1).map((m) => `${m}·${len(m)}`))} = ${num(full)}, and the last one gives ${M}·${cnt} = ${num(M * cnt)}. So the sum is ${num(full)} + ${num(M * cnt)} = <b>${num(ans)}</b>.`,
    };
  },
  // how many n up to N have ⌊√n⌋ (or ⌊√n⌋ + 1, or ⌊∛n⌋) dividing n: the same few in every complete group
  (d, ctx) => {
    const [[ask, N]] = pick(ctx, 'div', [[...[50, 90, 120, 150, 200, 250, 300, 420, 500, 600].map((n) => ['sqrt', n]), ...[60, 100, 150, 200, 300, 500, 1000, 2026].map((n) => ['next', n]), ...[150, 250, 350, 420, 600, 750, 900, 1200].map((n) => ['cube', n])]]);
    const test = { sqrt: (n) => n % isqrt(n) === 0, next: (n) => n % (isqrt(n) + 1) === 0, cube: (n) => n % icbrt(n) === 0 }[ask];
    const check = (ans) => () => { let c = 0; for (let n = 1; n <= N; n++) if (test(n)) c++; return c === ans ? '' : `counted ${c}`; };
    if (ask === 'next') {
      const ans = isqrt(N + 1) - (isqrt(N + 1) * (isqrt(N + 1) + 1) > N ? 1 : 0), M = isqrt(N);
      return {
        topic: 'Floors and square roots', rank: 16,
        text: `For how many positive integers n ≤ ${num(N)} does ⌊√n⌋ + 1 divide n? ${FLOOR}`,
        answer: choices(d, ans, [M, M - 1, 2 * ans, ans + 1, ans - 1, M + 1]),
        check: check(ans),
        solution: `Sort the numbers by m = ⌊√n⌋. For each m they are m<sup>2</sup>, m<sup>2</sup> + 1, …, m<sup>2</sup> + 2m. The multiples of m + 1 near there are m<sup>2</sup> − 1 = (m − 1)(m + 1), m<sup>2</sup> + m = m(m + 1) and m<sup>2</sup> + 2m + 1 = (m + 1)<sup>2</sup>, and only the middle one is in the group. So every group has exactly one, m(m + 1), and the question is how many of 1·2, 2·3, 3·4, … are at most ${num(N)}. Since ${ans}·${ans + 1} = ${num(ans * (ans + 1))} ≤ ${num(N)} &lt; ${ans + 1}·${ans + 2} = ${num((ans + 1) * (ans + 2))}, there are <b>${ans}</b>.`,
      };
    }
    if (ask === 'sqrt') {
      const M = isqrt(N), last = [M * M, M * M + M, M * M + 2 * M].filter((x) => x <= N), ans = 3 * (M - 1) + last.length;
      return {
        topic: 'Floors and square roots', rank: 17,
        text: `For how many positive integers n ≤ ${N} is ⌊√n⌋ a divisor of n? ${FLOOR}`,
        answer: choices(d, ans, [3 * M, 3 * (M - 1), 2 * (M - 1) + Math.min(last.length, 2), M, ans + 1]),
        check: check(ans),
        solution: `Sort the numbers by m = ⌊√n⌋. For each m they are m<sup>2</sup>, m<sup>2</sup> + 1, …, m<sup>2</sup> + 2m, the numbers before (m + 1)<sup>2</sup>. The multiples of m among them are m<sup>2</sup>, m<sup>2</sup> + m and m<sup>2</sup> + 2m, three in every complete group. The groups for m = 1 to ${M - 1} are complete, giving 3·${M - 1} = ${3 * (M - 1)}, and the last group, from ${M * M} up to ${N}, has ${listing(last)}${last.length < 3 ? ` (not ${listing([M * M, M * M + M, M * M + 2 * M].filter((x) => x > N))})` : ''}. So the count is ${3 * (M - 1)} + ${last.length} = <b>${ans}</b>.`,
      };
    }
    const M = icbrt(N), per = range(1, M - 1).map((m) => 3 * m + 4), full = per.reduce((x, y) => x + y, 0), part = Math.floor((N - M ** 3) / M) + 1, ans = full + part;
    return {
      topic: 'Floors and square roots', rank: 19,
      text: `For how many positive integers n ≤ ${num(N)} is ⌊∛n⌋ a divisor of n? ${FLOOR}`,
      answer: choices(d, ans, [full, full + 3 * M + 4, full - (M - 1) + part, ans + 1, ans - 1]),
      check: check(ans),
      solution: `Sort the numbers by m = ⌊∛n⌋. For each m they run from m<sup>3</sup> to (m + 1)<sup>3</sup> − 1 = m<sup>3</sup> + 3m<sup>2</sup> + 3m. The multiples of m among them are m<sup>3</sup>, m<sup>3</sup> + m, …, m<sup>3</sup> + 3m<sup>2</sup> + 3m, which is (3m<sup>2</sup> + 3m)/m + 1 = 3m + 4 numbers. The groups for m = 1 to ${M - 1} are complete and give ${brief(per)} = ${full}. In the last group the multiples of ${M} from ${num(M ** 3)} up to ${num(N)} are ${run(M ** 3, M, part)}, which is ${part} more. So the count is ${full} + ${part} = <b>${ans}</b>.`,
    };
  },
  // how many k up to N have ⌊√k⌋ even (or odd, or the same parity as k): whole groups at a time
  (d, ctx) => {
    const [[ask, N]] = pick(ctx, 'parity', [[...[50, 80, 99, 120, 150, 200, 250, 300].map((n) => ['even', n]), ...[60, 90, 110, 140, 175, 220, 260, 320].map((n) => ['odd', n]), ...[50, 75, 110, 130, 160, 200, 240, 300].map((n) => ['same', n])]]);
    const M = isqrt(N), cnt = N - M * M + 1;
    if (ask === 'same') {
      const per = range(1, M - 1).map((m) => m + 1), full = per.reduce((x, y) => x + y, 0), part = Math.floor((N - M * M) / 2) + 1, ans = full + part;
      return {
        topic: 'Floors and square roots', rank: 17,
        text: `For how many integers k with 1 ≤ k ≤ ${N} are k and ⌊√k⌋ both even or both odd? ${FLOOR}`,
        answer: choices(d, ans, [N - ans, Math.floor(N / 2), full, full + M + 1, ans + 1]),
        check: () => { let c = 0; for (let k = 1; k <= N; k++) if ((k - isqrt(k)) % 2 === 0) c++; return c === ans ? '' : `counted ${c}`; },
        solution: `⌊√k⌋ = m for the 2m + 1 numbers from m<sup>2</sup> to m<sup>2</sup> + 2m, and the first of them, m<sup>2</sup>, has the same parity as m. Every second number from there has that parity too (m<sup>2</sup>, m<sup>2</sup> + 2, …, m<sup>2</sup> + 2m), so a complete group has m + 1 of them. The groups for m = 1 to ${M - 1} give ${brief(per)} = ${full}, and the last group, from ${M * M} to ${N}, gives ${run(M * M, 2, part)}, which is ${part} more. So there are ${full} + ${part} = <b>${ans}</b>.`,
      };
    }
    const p = ask === 'even' ? 0 : 1, ms = range(1, M - 1).filter((m) => m % 2 === p), per = ms.map((m) => 2 * m + 1), full = per.reduce((x, y) => x + y, 0);
    const part = M % 2 === p ? cnt : 0, ans = full + part;
    return {
      topic: 'Floors and square roots', rank: 15,
      text: `For how many integers k with 1 ≤ k ≤ ${N} is ⌊√k⌋ ${ask}? ${FLOOR}`,
      answer: choices(d, ans, [N - ans, full + (part ? 0 : 2 * M + 1), Math.round(N / 2), part ? full : full + cnt, ans + 1]),
      check: () => { let c = 0; for (let k = 1; k <= N; k++) if (isqrt(k) % 2 === p) c++; return c === ans ? '' : `counted ${c}`; },
      solution: `⌊√k⌋ = m for the 2m + 1 numbers from m<sup>2</sup> to m<sup>2</sup> + 2m, so the k we want come in whole groups, one for each ${ask} m. The complete groups, m = ${listing(ms)}, have ${listing(per)} numbers, ${full} in all. The last group, m = ${M}, runs from ${M * M} to ${N}${part ? `, and ${M} is ${ask}, so it adds ${part}` : `, but ${M} is not ${ask}, so it adds nothing`}. So there are <b>${ans}</b>.`,
    };
  },
  // equations with a floor: x² + b = a⌊x⌋ (how many solutions, or the sum of their squares), or ⌊√n⌋ = ⌊n/c⌋
  (d, ctx) => {
    const [[form, v], ask] = pick(ctx, 'eq', [[...EQS.map((e) => ['eq', e]), ...range(3, 9).map((c) => ['match', c])], ['count', 'sumsq']], ([form], ask) => form === 'eq' || ask === 'count');
    if (form === 'match') {
      const c = v, ranges = range(1, c + 2).map((m) => [m, Math.max(m * m, c * m), Math.min(m * m + 2 * m, c * m + c - 1)]).filter(([, lo, hi]) => lo <= hi);
      const ans = ranges.reduce((x, [, lo, hi]) => x + hi - lo + 1, 0);
      return {
        topic: 'Floors and square roots', rank: 18,
        text: `For how many positive integers n is ⌊√n⌋ = ⌊${over('n', c)}⌋? ${FLOOR}`,
        answer: choices(d, ans, [ans + 1, ans - 1, ans + 2, ranges.length * c, ans + c]),
        check: () => { let k = 0; for (let n = 1; n <= (c + 3) ** 2; n++) if (isqrt(n) === Math.floor(n / c)) k++; return k === ans ? '' : `counted ${k}`; },
        solution: `Call the common value m. Then ⌊√n⌋ = m means m<sup>2</sup> ≤ n ≤ m<sup>2</sup> + 2m, and ⌊${over('n', c)}⌋ = m means ${c}m ≤ n ≤ ${c}m + ${c - 1}, so n has to be in both ranges. ${ranges.map(([m, lo, hi], i) => `${i ? 'for' : 'For'} m = ${m} that leaves ${lo === hi ? `n = ${lo} only` : `n = ${lo} to ${hi}`}`).join('; ')}. For any other m the two ranges miss each other (for large m, m<sup>2</sup> is already more than ${c}m + ${c - 1}), so there are ${ranges.map(([, lo, hi]) => hi - lo + 1).join(' + ')} = <b>${ans}</b> such n.`,
      };
    }
    const [a, b] = v, { cand, good } = floorEq(a, b), bad = cand.filter((n) => !good.includes(n)), sq = good.map((n) => a * n - b), total = sq.reduce((x, y) => x + y, 0);
    const ans = ask === 'count' ? good.length : total;
    return {
      topic: 'Floors and square roots', rank: ask === 'count' ? 17 : 18,
      text: ask === 'count' ? `How many real numbers x satisfy x<sup>2</sup> + ${b} = ${a}⌊x⌋? ${FLOOR}` : `What is the sum of the squares of all the real numbers x with x<sup>2</sup> + ${b} = ${a}⌊x⌋? ${FLOOR}`,
      answer: choices(d, ans, ask === 'count' ? [cand.length, 2 * good.length, 2 * cand.length, good.length + 1, good.length - 1]
        : [cand.reduce((x, n) => x + a * n - b, 0), good.reduce((x, n) => x + n * n, 0), total + good.length, total - good.length]),
      check: () => {
        // every whole number n that could be ⌊x⌋, and both square roots of an − b
        const xs = new Set();
        for (let n = -60; n <= 60; n++) {
          const t = a * n - b;
          if (t < 0) continue;
          for (const x of [Math.sqrt(t), -Math.sqrt(t)]) if (Math.floor(x) === n) xs.add(`${Math.sign(x)}·${t}`);
        }
        const got = ask === 'count' ? xs.size : [...xs].reduce((x, key) => x + Number(key.split('·')[1]), 0);
        return got === ans ? '' : `found ${[...xs].join(', ')}`;
      },
      solution: `Call n = ⌊x⌋, so x<sup>2</sup> = ${a}n − ${b}. The left side x<sup>2</sup> + ${b} is positive, so n is positive, x is positive too, and x = √(${a}n − ${b}). For n really to be ⌊x⌋ we need n ≤ x &lt; n + 1, that is n<sup>2</sup> ≤ ${a}n − ${b} &lt; (n + 1)<sup>2</sup>. The left part, n<sup>2</sup> − ${a}n + ${b} ≤ 0, allows n = ${listing(cand)}, and the right part rules out ${listing(bad)} (there ${a}n − ${b} is at least (n + 1)<sup>2</sup>). So the solutions are x = ${listing(good.map((n) => surd(1, a * n - b)[1]))}` + (ask === 'count' ? `, and there are <b>${ans}</b> of them.` : `, and the sum of their squares is ${sq.join(' + ')} = <b>${total}</b>.`),
    };
  },
];

// ---------- Repeating patterns ----------
const fadd = ([a, b], [c, e]) => cut(a * e + c * b, b * e);
const fmul = ([a, b], [c, e]) => cut(a * c, b * e);
const an = (i) => sub('a', i);
// the first terms of a(n+1) = 1/(1 − a(n)) ('three') or (1 + a(n))/(1 − a(n)) ('four'), as fractions
const STEP = { three: ([p, q]) => cut(q, q - p), four: ([p, q]) => cut(q + p, q - p) };
const orbit = (rule, x0) => { const out = [x0]; for (let i = 1; i < (rule === 'three' ? 3 : 4); i++) out.push(STEP[rule](out.at(-1))); return out; };
// a(n+2) = a(n+1) − a(n) from a(1) = x, a(2) = y: the term, and the sum of the first n terms, for each remainder of n mod 6
const SIX_T = { 1: [1, 0], 2: [0, 1], 3: [-1, 1], 4: [-1, 0], 5: [0, -1], 0: [1, -1] };
const SIX_S = { 1: [1, 0], 2: [1, 1], 3: [0, 2], 4: [-1, 2], 5: [-1, 1], 0: [0, 0] };
const xy = ([i, j]) => expr([i, 'x'], [j, 'y']);
// f(x) = (px + q)/(rx + s) that come back to x after 3, 4 or 6 steps
const MOBIUS = [[1, -3, 1, 1, 3], [2, -3, 1, -1, 3], [1, -7, 1, 2, 3], [3, -5, 1, -1, 4], [0, 2, -1, 2, 4], [1, 1, -1, 2, 6], [2, -1, 1, 1, 6]];
const mob = ([p, q, r, s], [a, b]) => (r * a + s * b === 0 ? null : cut(p * a + q * b, r * a + s * b));
const linear = (c1, c0) => (c1 < 0 && c0 > 0 ? `${c0} − ${c1 === -1 ? '' : -c1}x` : poly([c0, c1]));
const mobOrbit = (m, x0) => { const out = [x0]; for (let i = 1; i < m[4]; i++) { const nx = out.at(-1) && mob(m, out.at(-1)); out.push(nx); } return out; };
const mobOk = (m, x0) => { const o = mobOrbit(m, x0); if (o.some((v) => !v)) return false; const back = mob(m, o.at(-1)); return !!back && back[0] === x0[0] && back[1] === x0[1] && new Set(o.map(String)).size === m[4]; };
const digitSq = (n) => String(n).split('').reduce((s, c) => s + (+c) ** 2, 0);
// the numbers from n0 until one repeats: [the path, where the cycle starts in it]
const path = (n0, f) => { const seen = new Map(), out = []; let v = n0; for (let i = 0; i < 200 && !seen.has(v); i++) { seen.set(v, i); out.push(v); v = f(v); } return [out, seen.get(v)]; };

const repeating = [
  // a(n+1) = 1/(1 − a(n)) or (1 + a(n))/(1 − a(n)) goes round in 3 or 4 steps: a long product or sum is whole cycles and a bit
  (d, ctx) => {
    const [rule, x0, ask] = pick(ctx, 'cycle', [['three', 'four'], [[2, 1], [3, 1], [4, 1], [5, 1], [-2, 1], [-3, 1], [1, 3], [2, 3], [3, 4], [4, 3]], ['product', 'sum']],
      (rule, [p, q], ask) => p !== 0 && p !== q && p !== -q && !(ask === 'sum' && orbit(rule, [p, q]).reduce(fadd, [0, 1])[0] === 0));
    const o = orbit(rule, x0), P = o.length, N0 = d.int(150, 2100), N = N0 + (N0 % P ? 0 : 1), q = Math.floor(N / P), r = N % P, first = o.slice(0, r);
    const cycleP = o.reduce(fmul, [1, 1]), cycleS = o.reduce(fadd, [0, 1]), partP = first.reduce(fmul, [1, 1]), partS = first.reduce(fadd, [0, 1]);
    const ans = ask === 'product' ? fmul(cycleP[0] < 0 && q % 2 ? [-1, 1] : [1, 1], partP) : fadd(fmul(cycleS, [q, 1]), partS);
    const last = o[(N - 1) % P];
    // slips: the sign of the whole blocks, the last term alone, the wrong number of leftover terms
    const sign = cycleP[0] < 0 && q % 2 ? [-1, 1] : [1, 1], upTo = (k) => o.slice(0, k);
    const wrong = ask === 'product' ? [fmul(ans, [-1, 1]), last, partP, ...range(1, P).map((k) => fmul(sign, upTo(k).reduce(fmul, [1, 1]))), [1, 1], [-1, 1], ...o]
      : [fmul(cycleS, [q, 1]), fadd(fmul(cycleS, [q + 1, 1]), [0, 1]), partS, fadd(ans, last), fadd(ans, fmul(last, [-1, 1])), ...range(1, P).map((k) => fadd(fmul(cycleS, [q, 1]), upTo(k).reduce(fadd, [0, 1])))];
    return {
      topic: 'Repeating patterns', rank: ask === 'product' ? 17 : 16,
      text: `A sequence has ${an(1)} = ${fr(x0)} and ${an('n+1')} = ${rule === 'three' ? over(1, `1 − ${an('n')}`) : over(`1 + ${an('n')}`, `1 − ${an('n')}`)} for every n ≥ 1. What is ${ask === 'product' ? `the product ${an(1)}·${an(2)}·${an(3)}·⋯·${an(N)}` : `the sum ${an(1)} + ${an(2)} + ${an(3)} + ⋯ + ${an(N)}`}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        let a = Q(...x0), acc = Q(ask === 'product' ? 1 : 0);
        for (let n = 1; n <= N; n++) { acc = ask === 'product' ? qmul(acc, a) : qadd(acc, a); a = rule === 'three' ? qdiv(Q(1), qsub(Q(1), a)) : qdiv(qadd(Q(1), a), qsub(Q(1), a)); }
        return said(acc, ans);
      },
      solution: `Work out a few terms: ${o.map((v, i) => `${an(i + 1)} = ${fr(v)}`).join(', ')}, and then ${an(P + 1)} = ${fr(x0)} again, so the terms repeat every ${P}. Each block of ${P} terms in a row ${ask === 'product' ? `multiplies to ${o.map(pf).join('·')} = ${fr(cycleP)}` : `adds up to ${o.map(pf).join(' + ')} = ${fr(cycleS)}`}. ${N} = ${P}·${q} + ${r}, so the first ${N} terms are ${q} full blocks and then ${r === 1 ? `one more term, ${fr(first[0])}` : `${r} more terms, ${listing(first.map(fr))}, which ${ask === 'product' ? `multiply to ${fr(partP)}` : `add up to ${fr(partS)}`}`}. So the ${ask} is ${ask === 'product'
        ? `${cycleP[0] < 0 ? `(−1)<sup>${q}</sup>` : `1<sup>${q}</sup>`}·${pf(partP)}`
        : `${q}·${pf(cycleS)} + ${pf(partS)}`} = <b>${fr(ans)}</b>.`,
    };
  },
  // a(n+2) = a(n+1) − a(n) repeats every 6, and any 6 terms in a row add up to 0: sums of the first N terms
  (d, ctx) => {
    const [ask, x, y] = pick(ctx, 'six', [['direct', 'terms', 'sums'], [-4, -3, -2, -1, 1, 2, 3, 5, 7], [-5, -3, -2, -1, 1, 2, 4, 6]], (ask, x, y) => x !== y && x + y !== 0 && x !== 2 * y);
    const T = (r) => SIX_T[r][0] * x + SIX_T[r][1] * y, S = (r) => SIX_S[r][0] * x + SIX_S[r][1] * y;
    const big = (r) => 6 * d.int(150, 340) + r;
    if (ask === 'direct') {
      const r = d.pick([1, 2, 3, 4, 5].filter((k) => S(k) !== 0)), N = big(r), ans = S(r);
      return {
        topic: 'Repeating patterns', rank: 15,
        text: `A sequence has ${an(1)} = ${num(x)}, ${an(2)} = ${num(y)}, and ${an('n+2')} = ${an('n+1')} − ${an('n')} for every n ≥ 1. What is ${an(1)} + ${an(2)} + ${an(3)} + ⋯ + ${an(N)}?`,
        answer: choices(d, ans, [S((r + 1) % 6), S((r + 5) % 6), T(r % 6), 0, x + y]),
        check: () => { let [p, q] = [x, y], sum = 0; for (let n = 1; n <= N; n++) { sum += p; [p, q] = [q, q - p]; } return sum === ans ? '' : `added up to ${sum}`; },
        solution: `Write out the terms: ${num(x)}, ${num(y)}, ${num(y - x)}, ${num(-x)}, ${num(-y)}, ${num(x - y)}, and then ${num(x)}, ${num(y)} again, since each term depends only on the two before it. So the terms repeat every 6, and each block of 6 adds up to 0. ${N} = 6·${(N - r) / 6} + ${r}, so the sum is just ${r === 1 ? `the first term, <b>${num(ans)}</b>` : `that of the first ${r} terms, ${plusList([x, y, y - x, -x, -y].slice(0, r))} = <b>${num(ans)}</b>`}.`,
      };
    }
    // two facts about the sequence pick out x and y; then a third sum
    const given = ask === 'terms' ? SIX_T : SIX_S, rs = ask === 'terms' ? [1, 2, 3, 4, 5, 0] : [1, 2, 3, 4, 5];
    const pairs = rs.flatMap((i) => rs.filter((j) => j !== i && given[i][0] * given[j][1] - given[i][1] * given[j][0] !== 0 && (ask === 'sums' || [3, 0].includes(i) || [3, 0].includes(j))).map((j) => [i, j]));
    const [rA, rB] = d.pick(pairs), rC = d.pick([1, 2, 3, 4, 5].filter((k) => k !== rA && k !== rB && S(k) !== 0));
    const A = big(rA), B = big(rB), C = big(rC), U = ask === 'terms' ? T(rA) : S(rA), V = ask === 'terms' ? T(rB) : S(rB), ans = S(rC);
    const what = ask === 'terms' ? (k) => `${an(k)}` : (k) => `the sum of the first ${k} terms`;
    return {
      topic: 'Repeating patterns', rank: ask === 'terms' ? 16 : 18,
      text: ask === 'terms'
        ? `In a sequence, ${an('n+2')} = ${an('n+1')} − ${an('n')} for every n ≥ 1. If ${an(A)} = ${num(U)} and ${an(B)} = ${num(V)}, what is the sum of the first ${C} terms?`
        : `In a sequence of numbers, every term from the third on is the term before it minus the term before that. The sum of the first ${A} terms is ${num(U)}, and the sum of the first ${B} terms is ${num(V)}. What is the sum of the first ${C} terms?`,
      answer: choices(d, ans, [S((rC + 1) % 6), S((rC + 5) % 6), U + V, U - V, V - U, T(rC)]),
      check: () => {
        let [p, q] = [x, y], sum = 0;
        const seen = {};
        for (let n = 1; n <= Math.max(A, B, C); n++) { sum += p; seen[n] = [p, sum]; [p, q] = [q, q - p]; }
        const k = ask === 'terms' ? 0 : 1;
        return seen[A][k] === U && seen[B][k] === V && seen[C][1] === ans ? '' : 'the sequence does not fit';
      },
      solution: `Call the first two terms x and y. The terms go x, y, y − x, −x, −y, x − y, and then x, y again, so they repeat every 6 and each block of 6 adds up to 0; so ${ask === 'terms' ? 'a term' : 'the sum of the first n terms'} depends only on the remainder when its position is divided by 6. ${A} leaves remainder ${rA}, so ${what(A)} is ${xy(given[rA])}, and ${B} leaves remainder ${rB}, so ${what(B)} is ${xy(given[rB])}. Solving ${xy(given[rA])} = ${num(U)} and ${xy(given[rB])} = ${num(V)} gives x = ${num(x)} and y = ${num(y)}. ${C} leaves remainder ${rC}, so the first ${C} terms add up to the first ${rC}, which is ${xy(SIX_S[rC])} = <b>${num(ans)}</b>.`,
    };
  },
  // blocks that grow: 1, 2, 2, 3, 3, 3, … (each n written n times) or 1; 1, 2; 1, 2, 3; …: a far term, or a long sum
  (d, ctx) => {
    const [ask, N] = pick(ctx, 'blocks', [['term', 'sum', 'row', 'rowsum'], [100, 150, 200, 250, 300, 500, 777, 1000, 1234, 2026]]);
    const n = range(1, 100).find((k) => tri(k) >= N), r = N - tri(n - 1), sq = ((n - 1) * n * (2 * n - 1)) / 6, tet = ((n - 1) * n * (n + 1)) / 6;
    const ans = { term: n, sum: sq + n * r, row: r, rowsum: tet + tri(r) }[ask];
    const reps = ask === 'term' || ask === 'sum';
    return {
      topic: 'Repeating patterns', rank: { term: 14, row: 15, sum: 16, rowsum: 16 }[ask],
      text: (reps ? 'In the sequence 1, 2, 2, 3, 3, 3, 4, 4, 4, 4, 5, …, each positive integer n appears n times in a row.' : 'The sequence 1, 1, 2, 1, 2, 3, 1, 2, 3, 4, 1, … counts from 1 up to 1, then from 1 up to 2, then from 1 up to 3, and so on.')
        + (ask === 'term' || ask === 'row' ? ` What is its ${ord(N)} term?` : ` What is the sum of its first ${num(N)} terms?`),
      answer: choices(d, ans, {
        term: [n - 1, n + 1, r, isqrt(2 * N) + 1, isqrt(N)], sum: [sq + n * n, sq, sq + (n - 1) * r, ans + n, ans - n],
        row: [n, r - 1, r + 1, n - r, tri(n) - N], rowsum: [tet + tri(n), tet, tet + r, ans + r, ans - r],
      }[ask]),
      check: () => {
        const seq = [];
        for (let k = 1; seq.length < N; k++) for (let j = 1; j <= k && seq.length < N; j++) seq.push(reps ? k : j);
        const got = ask === 'term' || ask === 'row' ? seq[N - 1] : seq.reduce((x, y) => x + y, 0);
        return got === ans ? '' : `the sequence gives ${got}`;
      },
      solution: reps
        ? `The block of m's ends at position 1 + 2 + ⋯ + m = ${over('m(m + 1)', 2)}${ask === 'sum' ? ' and adds up to m·m = m<sup>2</sup>' : ''}. Since ${num(tri(n - 1))} &lt; ${num(N)} ≤ ${num(tri(n))}, the ${ord(N)} term is in the block of ${n}s${ask === 'sum' ? `, and it is the ${ord(r)} ${n} there` : ''}. ${ask === 'term'
          ? `So it is <b>${n}</b>.`
          : `So the first ${num(N)} terms are the complete blocks up to ${n - 1} and then ${r} copies of ${n}. Using 1<sup>2</sup> + 2<sup>2</sup> + ⋯ + k<sup>2</sup> = ${over('k(k + 1)(2k + 1)', 6)}, their sum is ${num(sq)} + ${r}·${n} = <b>${num(ans)}</b>.`}`
        : `Row k is 1, 2, …, k, so it ends at position 1 + 2 + ⋯ + k = ${over('k(k + 1)', 2)}${ask === 'rowsum' ? ' and adds up to that same number' : ''}. Since ${num(tri(n - 1))} &lt; ${num(N)} ≤ ${num(tri(n))}, the ${ord(N)} term is in row ${n}, in place ${num(N)} − ${num(tri(n - 1))} = ${r} there. ${ask === 'row'
          ? `So it is <b>${r}</b>.`
          : `So the first ${num(N)} terms are the complete rows 1 to ${n - 1} and then 1, 2, …, ${r}. Since 1 + 3 + 6 + ⋯ + ${over('k(k + 1)', 2)} = ${over('k(k + 1)(k + 2)', 6)}, the complete rows add up to ${over(`${n - 1}·${n}·${n + 1}`, 6)} = ${num(tet)}, and the rest adds 1 + 2 + ⋯ + ${r} = ${tri(r)}. So the sum is ${num(tet)} + ${tri(r)} = <b>${num(ans)}</b>.`}`,
    };
  },
  // a function applied over and over: a fraction rule that comes back after 3, 4 or 6 steps, sums of digit squares, or halving
  (d, ctx) => {
    const STARTS = [[0, 1], [2, 1], [3, 1], [4, 1], [5, 1], [-2, 1], [-3, 1], [1, 2], [1, 3], [2, 3]];
    const options = [
      ...MOBIUS.flatMap((m) => STARTS.filter((x0) => mobOk(m, x0)).map((x0) => ['mobius', [m, x0]])),
      ...[2026, 1999, 3141, 2718, 4096, 777, 5050, 1234, 9876, 2468, 1357, 8642].map((n0) => ['digits', [n0]]),
      ...[3, 5, 7].flatMap((c) => [40, 48, 50, 60, 72, 80, 96, 100, 120].map((n0) => ['halve', [c, n0]])),
    ];
    const [[ask, v]] = pick(ctx, 'apply', [options]);
    const N = d.pick([100, 250, 500, 1000, 2025, 2026, 777]), name = d.pick(NAMES);
    if (ask === 'mobius') {
      const [m, x0] = v, o = mobOrbit(m, x0), P = m[4], M = N + (N % P ? 0 : 1), r = M % P, ans = o[r], [p, q, rr, s] = m;
      return {
        topic: 'Repeating patterns', rank: 17,
        text: `Let f(x) = ${over(linear(p, q), linear(rr, s))}. ${name} starts with ${fr(x0)} and applies f again and again: ${fr(x0)}, f(${fr(x0)}), f(f(${fr(x0)})), and so on. What number does ${name} have after applying f ${num(M)} times?`,
        answer: fchoices(d, ans, [...o.filter((x) => x !== ans), cut(-x0[0], x0[1])]),
        check: () => { let a = Q(...x0); for (let i = 0; i < M; i++) a = qdiv(qadd(qmul(Q(p), a), Q(q)), qadd(qmul(Q(rr), a), Q(s))); return said(a, ans); },
        solution: `Work out the first few values: ${[...o, x0].map(fr).join(' → ')}. So after ${P} steps the starting number comes back, and from then on everything repeats every ${P} steps. ${num(M)} = ${P}·${Math.floor(M / P)} + ${r}, so after ${num(M)} steps ${name} has the same number as after ${r} step${r > 1 ? 's' : ''}, which is <b>${fr(ans)}</b>.`,
      };
    }
    const f = ask === 'digits' ? digitSq : (x) => (x % 2 ? x + v[0] : x / 2), n0 = ask === 'digits' ? v[0] : v[1];
    const [seq, start] = path(n0, f), L = seq.length - start, at = (k) => (k < seq.length ? seq[k] : seq[start + ((k - start) % L)]), ans = at(N);
    const cycle = seq.slice(start);
    return {
      topic: 'Repeating patterns', rank: ask === 'digits' ? 15 : 14,
      text: ask === 'digits'
        ? `${name} starts with the number ${n0} and keeps replacing it with the sum of the squares of its digits (so 12 would become 1 + 4 = 5). What is the number after ${num(N)} replacements?`
        : `${name} starts with ${n0}. At each step, an even number is halved and an odd number has ${v[0]} added to it. What is the number after ${num(N)} steps?`,
      answer: choices(d, ans, [at(N + 1), at(N - 1), at(N + 2), ...cycle, ...seq.slice(-4), n0]),
      check: () => { let x = n0; for (let i = 0; i < N; i++) x = f(x); return x === ans ? '' : `after ${N} steps it is ${x}`; },
      solution: `Follow the numbers: ${seq.join(' → ')} → ${seq[start]}. ${L === 1 ? `From ${seq[start]} on the number never changes` : `From ${seq[start]} on they go round a cycle of ${L} numbers (${cycle.join(', ')})`}, and the start reaches ${seq[start]} after ${start} step${start === 1 ? '' : 's'}. ${L === 1 ? `So after ${num(N)} steps the number is still <b>${ans}</b>.` : `After ${num(N)} steps we are ${num(N - start)} steps into the cycle, and ${(N - start) % L ? `${num(N - start)} = ${L}·${Math.floor((N - start) / L)} + ${(N - start) % L}, so the number is <b>${ans}</b>` : `${num(N - start)} is a whole number of turns round it (${L}·${Math.floor((N - start) / L)}), so the number is back at <b>${ans}</b>`}.`}`,
    };
  },
];

export const hardAlgebra = {
  'Roots without solving': roots,
  'Polynomial remainders': remainders,
  'Telescoping sums': telescoping,
  'Floors and square roots': floors,
  'Repeating patterns': repeating,
};
