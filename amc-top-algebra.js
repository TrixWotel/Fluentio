// The hardest AMC 10–style algebra, for problems 17 to 25: eight topics on functions and equations (functional
// equations at well-chosen points, systems that only open up when added or multiplied, equations inside equations,
// polynomials whose roots follow a rule, the best value under a condition, sequences with a hidden formula, logs and
// powers with a catch, and quadratics with an integer parameter). The ideas are the ones behind recent contest
// problems; the problems, numbers and wording are new (the real ones are the MAA's copyright). Each topic asks its idea
// three or four ways, and every check() gets the answer a second way: by brute force, with exact BigInt fractions, by
// Sturm sequences that count real roots exactly, from the actual roots, or numerically.
import { combo, dice, num, frac, gcd } from '../kit/bank.js';
import { choices, showFrac, range, ord } from './amc-kit.js';

// combo, with a name of its own for each kind of question, so no two kinds share a list of combinations
const pick = (ctx, tag, lists, ok) => combo({ ...ctx, salt: `${ctx.salt}|${tag}` }, lists, ok);
// a type with several forms: the forms take turns (the turn number stays as it is, so forms that share a list of
// combinations never draw the same one)
const turn = (ctx, forms) => [forms[ctx.k % forms.length], ctx];
const NAMES = ['Mina', 'Tariq', 'Lena', 'Jonah', 'Priya', 'Mateo', 'Ines', 'Kofi', 'Hana', 'Dario', 'Sofia', 'Ravi'];

// ---------- fractions as [p, q] (small whole numbers), and how they read ----------
const cut = (p, q = 1) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return [p / g, q / g]; };
const fa = (x, y) => cut(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const fs = (x, y) => cut(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const fm = (x, y) => cut(x[0] * y[0], x[1] * y[1]);
const fd = (x, y) => cut(x[0] * y[1], x[1] * y[0]);
const fk = (k, x) => cut(k * x[0], x[1]);
const fr = ([p, q]) => frac(p, q);
const pf = (x) => (x[0] < 0 ? `(${fr(x)})` : fr(x));          // a fraction in brackets when it is negative
const paren = (x) => (x < 0 ? `(${num(x)})` : num(x));
const sq2 = (x) => `${x[0] < 0 || x[1] !== 1 ? `(${fr(x)})` : fr(x)}<sup>2</sup>`;   // a fraction squared, in brackets unless whole and positive
const sup = (b, e) => `${b}<sup>${e}</sup>`;
const sub = (v, i) => `${v}<sub>${i}</sub>`;
const over = (top, bottom) => `<span class="fr"><span>${top}</span><span>${bottom}</span></span>`;
const X2 = sup('x', 2), X3 = sup('x', 3), X4 = sup('x', 4);
const isqrt = (n) => { let r = Math.floor(Math.sqrt(n)); while (r * r > n) r--; while ((r + 1) * (r + 1) <= n) r++; return r; };
const isSq = (n) => n >= 0 && isqrt(n) ** 2 === n;
const listing = (xs, and = 'and') => (xs.length < 2 ? String(xs[0]) : `${xs.slice(0, -1).join(', ')} ${and} ${xs.at(-1)}`);
const orList = (xs) => listing(xs, 'or');
const sum = (xs) => xs.reduce((s, x) => s + x, 0);

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
// five choices given as [value, how it reads] (answers like 3·2¹⁹ − 1 or 4 + √7), skipping wrong ones whose value or
// reading repeats; sorted by value like the AMC
const plain = (s) => String(s).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
function tchoices(correct, wrongs) {
  const list = [correct];
  for (const w of wrongs) if (w && list.length < 5 && Number.isFinite(w[0]) && !list.some((x) => Math.abs(x[0] - w[0]) < 1e-9 * Math.max(1, Math.abs(w[0])) || plain(x[1]) === plain(w[1]))) list.push(w);
  if (list.length < 5) throw new Error(`tchoices: only ${list.length} different choices for ${correct[1]}`);
  list.sort((a, b) => a[0] - b[0]);
  return { kind: 'choice', choices: list.map((x) => x[1]), correct: list.indexOf(correct) };
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
// a polynomial from its coefficients, lowest power first: [−7, 1, −5, 2] is 2x³ − 5x² + x − 7
const poly = (cs, v = 'x') => expr(...cs.map((c, i) => [c, i === 0 ? '' : i === 1 ? v : sup(v, i)]).reverse());
// v + a, written v − 3 for a = −3 (and v for 0)
const shift = (v, a) => (a === 0 ? v : `${v} ${a < 0 ? '−' : '+'} ${num(Math.abs(a))}`);
// a fraction [p, q] times a letter: x, −x, 3x, ½x
const fx = ([p, q], v) => (q === 1 ? (p === 1 ? v : p === -1 ? `−${v}` : `${num(p)}${v}`) : `${p < 0 ? '−' : ''}${over(Math.abs(p), q)}${v}`);
// " + 3xy" or " − 3xy", for a term after others
const signed = (c, v = '') => (c === 0 ? '' : ` ${c < 0 ? '−' : '+'} ${Math.abs(c) === 1 && v ? '' : num(Math.abs(c))}${v}`);

// ---------- exact fractions with BigInt: [p, q] in lowest terms, q > 0 ----------
const big = (a, b) => { a = a < 0n ? -a : a; b = b < 0n ? -b : b; while (b) [a, b] = [b, a % b]; return a; };
const Q = (p, q = 1n) => { p = BigInt(p); q = BigInt(q); if (q < 0n) { p = -p; q = -q; } const g = big(p, q) || 1n; return [p / g, q / g]; };
const qadd = (x, y) => Q(x[0] * y[1] + y[0] * x[1], x[1] * y[1]);
const qsub = (x, y) => Q(x[0] * y[1] - y[0] * x[1], x[1] * y[1]);
const qmul = (x, y) => Q(x[0] * y[0], x[1] * y[1]);
const qdiv = (x, y) => Q(x[0] * y[1], x[1] * y[0]);
const qf = (x) => Number(x[0]) / Number(x[1]);
const toQ = (v) => (Array.isArray(v) ? Q(v[0], v[1]) : Q(v));
const qeq = (x, y) => x[0] === y[0] && x[1] === y[1];
const said = (x, v) => (qeq(x, toQ(v)) ? '' : `worked out ${x[0]}/${x[1]}, said ${Array.isArray(v) ? v.join('/') : v}`);
const near = (got, want, what = 'value') => (Math.abs(got - want) <= 1e-7 * Math.max(1, Math.abs(want)) ? '' : `${what}: worked out ${got}, said ${want}`);
// n equations in n unknowns (rows of exact fractions, the right side last), solved by elimination
function solveLinear(rows) {
  const m = rows.map((r) => r.map(toQ)), n = m.length;
  for (let c = 0; c < n; c++) {
    const pr = range(c, n - 1).find((r) => m[r][c][0] !== 0n);
    if (pr === undefined) return null;
    [m[c], m[pr]] = [m[pr], m[c]];
    for (let r = 0; r < n; r++) if (r !== c && m[r][c][0] !== 0n) { const f = qdiv(m[r][c], m[c][c]); m[r] = m[r].map((x, j) => qsub(x, qmul(f, m[c][j]))); }
  }
  return m.map((r, i) => qdiv(r[n], r[i]));
}

// ---------- polynomials with BigInt coefficients, lowest power first ----------
const padd = (a, b) => range(0, Math.max(a.length, b.length) - 1).map((i) => (a[i] ?? 0n) + (b[i] ?? 0n));
const pmul = (a, b) => { const out = Array(a.length + b.length - 1).fill(0n); a.forEach((x, i) => b.forEach((y, j) => { out[i + j] += x * y; })); return out; };
const btrim = (a) => { const r = a.slice(); while (r.length > 1 && r[r.length - 1] === 0n) r.pop(); return r; };
const compose = (f, g) => btrim(f.reduceRight((acc, c) => padd(pmul(acc, g), [c]), [0n]));
const B = (cs) => cs.map((c) => BigInt(c));

// Sturm sequences: the exact number of different real roots of a polynomial with whole-number coefficients, and the
// roots themselves (to within 10⁻¹⁰), isolated by halving intervals and counting roots in each
const qtrim = (a) => { const r = a.slice(); while (r.length && r[r.length - 1][0] === 0n) r.pop(); return r; };
const qderiv = (a) => a.slice(1).map((c, i) => qmul(c, Q(i + 1)));
const qeval = (a, x) => a.reduceRight((s, c) => qadd(qmul(s, x), c), Q(0));
function qrem(a, b) {
  let r = qtrim(a);
  const bb = qtrim(b), db = bb.length - 1, lead = bb[db];
  while (r.length && r.length - 1 >= db) {
    const sh = r.length - 1 - db, f = qdiv(r[r.length - 1], lead);
    for (let j = 0; j <= db; j++) r[sh + j] = qsub(r[sh + j], qmul(f, bb[j]));
    r = qtrim(r);
  }
  return r;
}
function sturm(coeffs) {
  const p0 = qtrim(coeffs.map((c) => Q(c))), seq = [p0, qderiv(p0)];
  for (;;) { const r = qrem(seq[seq.length - 2], seq[seq.length - 1]); if (!r.length) break; seq.push(r.map(([p, q]) => [-p, q])); }
  return seq;
}
const qsign = (x) => (x[0] > 0n ? 1 : x[0] < 0n ? -1 : 0);
function changes(seq, x) {
  const signs = seq.map((p) => (x === Infinity ? qsign(p.at(-1)) : x === -Infinity ? qsign(p.at(-1)) * ((p.length - 1) % 2 ? -1 : 1) : qsign(qeval(p, x)))).filter(Boolean);
  let n = 0;
  for (let i = 1; i < signs.length; i++) if (signs[i] !== signs[i - 1]) n++;
  return n;
}
const realRootCount = (coeffs) => { const s = sturm(coeffs); return changes(s, -Infinity) - changes(s, Infinity); };
function realRoots(coeffs) {
  const s = sturm(coeffs), cs = btrim(coeffs.map(BigInt)).map(Number), out = [];
  const bound = 2 + Math.ceil(Math.max(...cs.slice(0, -1).map(Math.abs)) / Math.abs(cs.at(-1)));
  const go = (lo, hi, depth) => {
    const n = changes(s, lo) - changes(s, hi);
    if (!n) return;
    if (n === 1 && (qf(hi) - qf(lo) < 1e-10 || depth > 70)) { out.push((qf(lo) + qf(hi)) / 2); return; }
    let mid = qmul(qadd(lo, hi), Q(1, 2));
    if (qsign(qeval(s[0], mid)) === 0) mid = qadd(mid, qmul(qsub(hi, lo), Q(1, 1000)));   // never split at a root
    go(lo, mid, depth + 1); go(mid, hi, depth + 1);
  };
  go(Q(-3 * bound - 1, 3), Q(7 * bound + 1, 7), 0);
  return out;
}

// ---------- complex numbers [re, im], for checking answers from the actual roots ----------
const cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]];
const roots2 = (a, b, c) => { const D = b * b - 4 * a * c, s = Math.sqrt(Math.abs(D)) / (2 * a), m = -b / (2 * a); return D >= 0 ? [[m + s, 0], [m - s, 0]] : [[m, s], [m, -s]]; };
const fromRoots = (rs) => rs.reduce((cs, r) => { const out = [...cs.map(() => [0, 0]), [0, 0]]; cs.forEach((c, i) => { out[i + 1] = cadd(out[i + 1], c); out[i] = cadd(out[i], cmul(c, [-r[0], -r[1]])); }); return out; }, [[1, 0]]);
const cnear = (z, v) => Math.abs(z[0] - v) <= 1e-7 * Math.max(1, Math.abs(v)) && Math.abs(z[1]) <= 1e-7 * Math.max(1, Math.abs(v));

// ======================================================================================================================
// Functional equations: an equation that holds for every x, used at the few points where it closes up on itself
// ======================================================================================================================
const FE = 'Functional equations';
const FE_RECIP = [[2, 1], [3, 1], [4, 1], [1, 2], [1, 3], [-2, 1], [3, 2], [5, 1]];
const FE_AB = [[2, 1], [2, -1], [3, 1], [3, -1], [3, 2], [3, -2], [4, 1], [4, -3]];
// the partner of t under each pairing (each pairing undoes itself)
const partner = {
  recip: (t) => cut(t[1], t[0]),
  mirror: (t, c) => cut(c * t[1] - t[0], t[1]),
  mobius: (t, e) => cut(t[0] + e * t[1], t[0] - t[1]),
};
const functional = [
  // a·f(x) + b·f(partner of x) = R(x), where the partner is 1/x, c − x, or (x + e)/(x − 1): two equations, two unknowns
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['recip', 'mirror', 'mobius']);
    const opts = {
      recip: FE_RECIP.map((t) => [0, t]),
      mirror: [2, 3, 4, 5, 6].flatMap((c) => range(-1, 7).filter((t) => 2 * t !== c).map((t) => [c, [t, 1]])),
      mobius: [2, 3, 5, 7, 8].flatMap((e) => range(-6, 9).filter((t) => t !== 1 && (e + 1) % (t - 1) === 0 && (t - 1) ** 2 !== e + 1).map((t) => [e, [t, 1]])),
    }[form];
    const [[c, t], [a, b], p, q] = pick(c2, `swap-${form}`, [opts, FE_AB, [1, 2, 3, -2, 4, 6], [0, 1, -3, 5, 2, -4]],
      (o, ab, p, q) => form !== 'mirror' || q !== 0);
    const t2 = partner[form](t, c), R = (x) => (form === 'mirror' ? fa(fk(p, fm(x, x)), [q, 1]) : fa(fk(p, x), [q, 1]));
    const r1 = R(t), r2 = R(t2), den = a * a - b * b, top = fs(fk(a, r1), fk(b, r2)), ans = cut(top[0], top[1] * den);
    const T = fr(t), T2 = fr(t2), arg = { recip: over(1, 'x'), mirror: `${c} − x`, mobius: over('x + ' + c, 'x − 1') }[form];
    const rhs = form === 'mirror' ? expr([p, X2], [q, '']) : expr([p, 'x'], [q, '']);
    const where = { recip: 'every real number x except 0', mirror: 'every real number x', mobius: 'every real number x except 1' }[form];
    const way = {
      recip: `The rule pairs each x with 1/x, and the partner of ${T2} is ${T} again, so x = ${T} and x = ${T2} give two equations in the same two unknowns, f(${T}) and f(${T2}).`,
      mirror: `The rule pairs each x with ${c} − x, and the partner of ${T2} is ${c} − ${paren(t2[0])} = ${T} again, so x = ${T} and x = ${T2} give two equations in the same two unknowns, f(${T}) and f(${T2}).`,
      mobius: `The rule pairs each x with (x + ${c})/(x − 1), and that pairing undoes itself: x = ${T} gives (${T} + ${c})/(${T} − 1) = ${T2}, and x = ${T2} gives (${T2} + ${c})/(${T2} − 1) = ${T} back. So x = ${T} and x = ${T2} give two equations in the same two unknowns, f(${T}) and f(${T2}).`,
    }[form];
    return {
      topic: FE, rank: { recip: 18, mirror: 18, mobius: 20 }[form],
      text: `The function f satisfies ${expr([a, 'f(x)'], [b, `f(${arg})`])} = ${rhs} for ${where}. What is f(${T})?`,
      answer: fchoices(d, ans, [cut(fs(fk(a, r2), fk(b, r1))[0], fs(fk(a, r2), fk(b, r1))[1] * den), cut(r1[0], r1[1] * (a + b)),
        cut(fa(fk(a, r1), fk(b, r2))[0], fa(fk(a, r1), fk(b, r2))[1] * den), cut(top[0], top[1] * (a * a + b * b)), cut(r1[0], r1[1] * a)]),
      check: () => {
        if (fr(partner[form](t2, c)) !== T || T === T2) return 'the pairing does not undo itself here';
        // the two equations, solved numerically by elimination
        const A = [[a, b, val(r1)], [b, a, val(r2)]], k = A[1][0] / A[0][0], g = (A[1][2] - k * A[0][2]) / (A[1][1] - k * A[0][1]);
        return near((A[0][2] - b * g) / a, val(ans), 'f(t)');
      },
      solution: `${way} With x = ${T}: ${expr([a, `f(${T})`], [b, `f(${T2})`])} = ${fr(r1)}. With x = ${T2}: ${expr([b, `f(${T})`], [a, `f(${T2})`])} = ${fr(r2)}. `
        + `Multiplying the first by ${a} and the second by ${paren(b)} and subtracting gets rid of f(${T2}): (${a}<sup>2</sup> − ${paren(b)}<sup>2</sup>)·f(${T}) = ${a}·${pf(r1)} − ${paren(b)}·${pf(r2)} = ${fr(top)}. `
        + `So f(${T}) = ${pf(top)} ÷ ${den} = <b>${fr(ans)}</b>.`,
    };
  },
  // f(x) + f(T(x)) = g(x), where T(x) = 1/(1 − x) or (x − 1)/x goes round in a cycle of three
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['T1', 'T2']);
    const T = form === 'T1' ? (x) => cut(x[1], x[1] - x[0]) : (x) => cut(x[0] - x[1], x[0]);
    const STARTS = [[2, 1], [3, 1], [-1, 1], [1, 2], [4, 1], [-2, 1], [3, 2], [1, 3], [5, 1], [-3, 1], [2, 3]];
    const [t, kind, p, q] = pick(c2, `cycle-${form}`, [STARTS, ['lin', 'sq'], [1, 2, 3, -2, 4], [0, 1, -1, 3, 5]], (t, kind, p, q) => kind === 'lin' || p !== 3);
    const g = (x) => (kind === 'lin' ? fa(fk(p, x), [q, 1]) : fa(fk(p, fm(x, x)), [q, 1]));
    const y = T(t), z = T(y), gt = g(t), gy = g(y), gz = g(z), twice = fa(fs(gt, gy), gz), ans = cut(twice[0], twice[1] * 2);
    const half = (v) => cut(v[0], v[1] * 2), Tt = form === 'T1' ? over(1, '1 − x') : over('x − 1', 'x');
    const gtext = kind === 'lin' ? expr([p, 'x'], [q, '']) : expr([p, X2], [q, '']);
    return {
      topic: FE, rank: 22,
      text: `A function f is defined for every real number except 0 and 1, and f(x) + f(${Tt}) = ${gtext} for every such x. What is f(${fr(t)})?`,
      answer: fchoices(d, ans, [half(fa(fa(gt, gy), gz)), half(fs(fa(gt, gy), gz)), half(fs(fa(gy, gz), gt)), half(gt), twice]),
      check: () => {
        if (!qeq(toQ(T(z)), toQ(t))) return 'the rule does not come back in three steps';
        // the solution for every x, f(x) = (g(x) − g(Tx) + g(TTx))/2, really satisfies the equation (exactly, at a few x)
        const f = (x) => { const v = fa(fs(g(x), g(T(x))), g(T(T(x)))); return cut(v[0], v[1] * 2); };
        for (const x of [[7, 3], [-5, 2], [11, 1], [2, 5]]) if (!qeq(toQ(fa(f(x), f(T(x)))), toQ(g(x)))) return `f(x) + f(T(x)) ≠ g(x) at ${x}`;
        return said(toQ(f(t)), ans);
      },
      solution: `Follow the rule x → ${Tt} from ${fr(t)}: it gives ${fr(y)}, then ${fr(z)}, and then ${fr(t)} again, so the equation at these three numbers involves only three unknowns. `
        + `Write A = f(${fr(t)}), B = f(${fr(y)}) and C = f(${fr(z)}). The equation at x = ${fr(t)}, ${fr(y)} and ${fr(z)} says A + B = ${fr(gt)}, B + C = ${fr(gy)} and C + A = ${fr(gz)}. `
        + `Adding the first and the last and taking away the middle one leaves 2A = ${fr(gt)} − ${pf(gy)} + ${pf(gz)} = ${fr(twice)}. So f(${fr(t)}) = <b>${fr(ans)}</b>.`,
    };
  },
  // f(x) + f(ax + y) + kxy = f(bx − y) + mx² + c for all x, y: choose y so that the two inputs meet
  (d, ctx) => {
    const ALPHA = [[-1, 2], [1, 2], [-1, 1], [1, 1], [3, 2], [-3, 2], [2, 1], [-2, 1]];
    const make = (al, a, b) => [fk(-2 * (a + b), al), fk(1 + a * a - b * b, al)];
    const [al, a, b, c, t] = pick(ctx, 'collide', [ALPHA, [1, 2, 3], [2, 3, 4, 5, 6], [1, 2, 3, -1, -2, 4, 5], [2, 3, 4, 5, 6, 8, 10]],
      (al, a, b) => { const [k, m] = make(al, a, b); return b > a && !(a === 2 && b === 3) && k[1] === 1 && m[1] === 1 && k[0] !== 0 && m[0] !== 0; });
    const [[k], [m]] = make(al, a, b), h = cut(b - a, 2), mid = cut(a + b, 2), kh = fk(k, h), ans = fa(fk(t * t, al), [c, 1]);
    const lin = (n, s) => `${n === 1 ? '' : n}x ${s} y`;
    const at = (co) => fa(fk(t * t, co), [c, 1]);
    return {
      topic: FE, rank: 21,
      text: `A function f satisfies ${expr([1, 'f(x)'], [1, `f(${lin(a, '+')})`], [k, 'xy'])} = ${expr([1, `f(${lin(b, '−')})`], [m, X2], [c, ''])} for all real numbers x and y. What is f(${t})?`,
      answer: fchoices(d, ans, [at(fs([m, 1], fk(k, [b - a, 1]))), at(fa([m, 1], kh)), at([m, 1]), fs(fk(t * t, al), [c, 1]), fk(t * t, al)]),
      check: () => {
        // f(x) = αx² + c satisfies the equation for every x and y (checked exactly at several pairs)
        const f = (x) => fa(fm(al, fm(x, x)), [c, 1]);
        for (const [x, y] of [[[1, 1], [2, 1]], [[3, 1], [-1, 1]], [[-2, 1], [5, 3]], [[1, 2], [7, 1]]]) {
          const lhs = fa(fa(f(x), f(fa(fk(a, x), y))), fk(k, fm(x, y))), rhs = fa(fa(f(fs(fk(b, x), y)), fk(m, fm(x, x))), [c, 1]);
          if (!qeq(toQ(lhs), toQ(rhs))) return `the equation fails at x = ${x}, y = ${y}`;
        }
        return said(toQ(f([t, 1])), ans);
      },
      solution: `Choose y to make the two inputs ${lin(a, '+')} and ${lin(b, '−')} equal, so that those two values of f cancel. They are equal when 2y = ${fx([b - a, 1], 'x')}, that is, y = ${fx(h, 'x')}. `
        + `With that y, f(${fx(mid, 'x')}) is on both sides and cancels, and the term ${num(k)}xy becomes ${num(k)}·x·${fx(h, 'x')} = ${fx(kh, X2)}. `
        + `What is left is f(x)${kh[0] < 0 ? ' − ' : ' + '}${fx(cut(Math.abs(kh[0]), kh[1]), X2)} = ${expr([m, X2], [c, ''])}, so f(x) = ${fx(al, X2)}${signed(c)} for every x. `
        + `Then f(${t}) = ${fr(al)}·${t * t}${signed(c)} = <b>${fr(ans)}</b>.`,
    };
  },
];

// ======================================================================================================================
// Equations in a cycle: systems whose equations are the same up to renaming, opened up by adding or multiplying them
// ======================================================================================================================
const CY = 'Equations in a cycle';
const cyclic = [
  // xy + c(x + y) = A and its two cousins: add c² to factor, then multiply all three
  (d, ctx) => {
    const [ask, c2] = turn(ctx, ['sum', 'prod', 'sq']);
    const [x, y, z, c] = pick(c2, 'shift', [range(1, 9), range(1, 9), range(1, 9), [1, 2, 3, 4]], (x, y, z) => x < y ? y !== z && x !== z : false);
    const u = x + c, v = y + c, w = z + c, PA = u * v, PB = v * w, PC = w * u, R = u * v * w;
    const A = PA - c * c, Bv = PB - c * c, C = PC - c * c, s = x + y + z;
    const ans = { sum: s, prod: x * y * z, sq: x * x + y * y + z * z }[ask];
    const what = { sum: 'x + y + z', prod: 'xyz', sq: `${X2} + ${sup('y', 2)} + ${sup('z', 2)}` }[ask];
    const wrong = {
      sum: [u + v + w, s + c, u + v + w - c, x * y + y * z + z * x, s + 2 * c + 1],
      prod: [R, s, (u - 1) * (v - 1) * (w - 1), x * y * z + c * s, R - c ** 3],
      sq: [s * s, u * u + v * v + w * w, x * y + y * z + z * x, s * s - (x * y + y * z + z * x), ans + 2 * c],
    }[ask];
    const pr = (p, q) => `(${shift(p, c)})(${shift(q, c)})`;
    return {
      topic: CY, rank: 19,
      text: `Positive real numbers x, y and z satisfy ${expr([1, 'xy'], [c, 'x'], [c, 'y'])} = ${A}, ${expr([1, 'yz'], [c, 'y'], [c, 'z'])} = ${Bv} and ${expr([1, 'zx'], [c, 'z'], [c, 'x'])} = ${C}. What is ${what}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const found = [];
        for (let a = 1; a <= 40; a++) for (let b = 1; b <= 40; b++) for (let e = 1; e <= 40; e++)
          if (a * b + c * (a + b) === A && b * e + c * (b + e) === Bv && e * a + c * (e + a) === C) found.push([a, b, e]);
        if (found.length !== 1) return `found ${found.length} solutions`;
        const [a, b, e] = found[0];
        return { sum: a + b + e, prod: a * b * e, sq: a * a + b * b + e * e }[ask] === ans ? '' : 'a different answer by search';
      },
      solution: `Adding ${c * c} to both sides makes each left side factor: ${expr([1, 'xy'], [c, 'x'], [c, 'y'])} + ${c * c} = ${pr('x', 'y')}. `
        + `So ${pr('x', 'y')} = ${PA}, ${pr('y', 'z')} = ${PB} and ${pr('z', 'x')} = ${PC}. `
        + `Multiplying all three, [(${shift('x', c)})(${shift('y', c)})(${shift('z', c)})]<sup>2</sup> = ${PA}·${PB}·${PC} = ${num(R * R)}, and the product is positive, so (${shift('x', c)})(${shift('y', c)})(${shift('z', c)}) = ${num(R)}. `
        + `Dividing by each equation in turn: ${shift('x', c)} = ${num(R)} ÷ ${PB} = ${u}, ${shift('y', c)} = ${num(R)} ÷ ${PC} = ${v} and ${shift('z', c)} = ${num(R)} ÷ ${PA} = ${w}. `
        + `So x = ${x}, y = ${y}, z = ${z}, and ${what} = <b>${num(ans)}</b>.`,
    };
  },
  // x(y + z) = A, y(z + x) = B, z(x + y) = C: adding gives xy + yz + zx, then each product alone, then xyz
  (d, ctx) => {
    const [ask, c2] = turn(ctx, ['sum', 'prod', 'sq']);
    const VALS = [[1, 2], [1, 1], [3, 2], [2, 1], [5, 2], [3, 1], [4, 1], [5, 1], [6, 1], [7, 2], [9, 2]];
    const ok = (x, y, z) => {
      if (fr(x) === fr(y) || fr(y) === fr(z) || fr(x) === fr(z) || (x[1] === 1 && y[1] === 1 && z[1] === 1)) return false;
      return [fm(x, fa(y, z)), fm(y, fa(z, x)), fm(z, fa(x, y))].every((v) => v[1] === 1);
    };
    const [x, y, z] = pick(c2, 'pairs', [VALS, VALS, VALS], ok);
    const A = fm(x, fa(y, z))[0], Bv = fm(y, fa(z, x))[0], C = fm(z, fa(x, y))[0], P = cut(A + Bv + C, 2);
    const yz = fs(P, [A, 1]), zx = fs(P, [Bv, 1]), xy = fs(P, [C, 1]), R = fm(fm(x, y), z), R2 = fm(R, R), s = fa(fa(x, y), z);
    const sq = fs(fm(s, s), fk(2, P)), ans = { sum: s, prod: R, sq }[ask];
    const what = { sum: 'x + y + z', prod: 'xyz', sq: `${X2} + ${sup('y', 2)} + ${sup('z', 2)}` }[ask];
    const wrong = { sum: [P, R, fa(s, [1, 2]), cut(A + Bv + C, 3)], prod: [R2, P, fk(2, R), fs([A + Bv + C, 1], R)], sq: [fm(s, s), fs(fm(s, s), P), fa(fm(s, s), fk(2, P)), P] }[ask];
    return {
      topic: CY, rank: ask === 'sq' ? 21 : 20,
      text: `Positive real numbers x, y and z satisfy x(y + z) = ${A}, y(z + x) = ${Bv} and z(x + y) = ${C}. What is ${what}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const found = [];
        for (const a of VALS) for (const b of VALS) for (const e of VALS) if (qeq(toQ(fm(a, fa(b, e))), Q(A)) && qeq(toQ(fm(b, fa(e, a))), Q(Bv)) && qeq(toQ(fm(e, fa(a, b))), Q(C))) found.push([a, b, e]);
        if (found.length !== 1) return `found ${found.length} solutions`;
        const [a, b, e] = found[0], t = fa(fa(a, b), e);
        return said(toQ({ sum: t, prod: fm(fm(a, b), e), sq: fa(fa(fm(a, a), fm(b, b)), fm(e, e)) }[ask]), ans);
      },
      solution: `Adding the three equations counts each of xy, yz and zx twice: 2(xy + yz + zx) = ${A} + ${Bv} + ${C} = ${A + Bv + C}, so xy + yz + zx = ${fr(P)}. `
        + `Taking each equation away from this leaves one product on its own: yz = ${fr(P)} − ${A} = ${fr(yz)}, zx = ${fr(P)} − ${Bv} = ${fr(zx)} and xy = ${fr(P)} − ${C} = ${fr(xy)}. `
        + `Multiplying these, (xyz)<sup>2</sup> = ${fr(yz)}·${fr(zx)}·${fr(xy)} = ${fr(R2)}, and xyz is positive, so xyz = ${ask === 'prod' ? `<b>${fr(R)}</b>.` : `${fr(R)}. `}`
        + (ask === 'prod' ? ''
          : `Then x = xyz ÷ yz = ${fr(x)}, y = xyz ÷ zx = ${fr(y)} and z = xyz ÷ xy = ${fr(z)}. `
            + (ask === 'sum' ? `So x + y + z = <b>${fr(s)}</b>.` : `So x + y + z = ${fr(s)}, and ${what} = (x + y + z)<sup>2</sup> − 2(xy + yz + zx) = ${sq2(s)} − 2·${pf(P)} = <b>${fr(sq)}</b>.`)),
    };
  },
  // a + 2b + 3c (+ 4d …) = P₁ and its cyclic shifts: add all, then subtract neighbours
  (d, ctx) => {
    const [n, c2] = turn(ctx, [3, 4, 5]);
    const [seed, ask, at] = pick(c2, `shifts-${n}`, [range(0, 39), ['one', 'max'], range(0, n - 1)], (s, ask, at) => ask === 'one' || at === 0);
    const r = dice(`top-cyclic-${n}-${seed}`, 0);
    let xs;
    do xs = r.shuffle(range(-4, 9)).slice(0, n); while (!xs.some((v) => v < 0) || !xs.some((v) => v > 0));
    const L = ['a', 'b', 'c', 'd', 'e'].slice(0, n), coef = (i, j) => ((j - i + n) % n) + 1;
    const Ps = range(0, n - 1).map((i) => sum(range(0, n - 1).map((j) => coef(i, j) * xs[j]))), S = sum(xs), tri = (n * (n + 1)) / 2;
    const eq = (i) => `${expr(...range(0, n - 1).map((k) => [k + 1, L[(i + k) % n]]))} = ${num(Ps[i])}`;
    const diff = (i) => Ps[i] - Ps[(i + 1) % n];
    const top = Math.max(...xs), ti = xs.indexOf(top), ans = ask === 'one' ? xs[at] : top, li = ask === 'one' ? at : ti;
    const wrong = ask === 'one'
      ? [cut(S + diff(at), n), cut(S, n), xs[(at + 1) % n], xs[(at + n - 1) % n], S]
      : [Math.min(...xs), [...xs].sort((p, q) => q - p)[1], S, cut(S, n), top + 1];
    return {
      topic: CY, rank: { 3: 19, 4: 20, 5: 21 }[n],
      text: `Numbers ${listing(L)} satisfy ${listing(range(0, n - 1).map(eq))}. ${ask === 'one' ? `What is ${L[at]}?` : `What is the largest of the ${['three', 'four', 'five'][n - 3]} numbers?`}`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const sol = solveLinear(range(0, n - 1).map((i) => [...range(0, n - 1).map((j) => coef(i, j)), Ps[i]]));
        if (!sol) return 'the system has no single solution';
        const got = sol.map(qf);
        return near(ask === 'one' ? got[at] : Math.max(...got), ans);
      },
      solution: `Add all ${n} equations: each letter gets each of the coefficients 1, 2, …, ${n} once, so ${tri}(${L.join(' + ')}) = ${num(sum(Ps))}, and ${L.join(' + ')} = ${num(S)}. `
        + `Now take each equation minus the next one. Every coefficient goes down by 1, except that the letter in front goes from 1 up to ${n}, so the difference is (${L.join(' + ')}) − ${n}·(that letter). `
        + `For ${L[li]}: ${num(Ps[li])} − ${paren(Ps[(li + 1) % n])} = ${num(S)} − ${n}${L[li]}, so ${L[li]} = (${num(S)} − ${paren(diff(li))}) ÷ ${n} = ${num(xs[li])}. `
        + (ask === 'one' ? `So ${L[at]} = <b>${num(ans)}</b>.`
          : `The same step gives every letter: ${listing(L.map((l, i) => `${l} = ${num(xs[i])}`))}. So the largest is <b>${num(ans)}</b>.`),
    };
  },
  // x² + 2py = E₁, y² + 2qz = E₂, z² + 2rx = E₃: added, they complete three squares that add up to 0
  (d, ctx) => {
    const [ask, c2] = turn(ctx, ['sum', 'prod', 'pair']);
    const VS = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5];
    const [p, q, r] = pick(c2, 'squares', [VS, VS, VS], (p, q, r) => new Set([Math.abs(p), Math.abs(q), Math.abs(r)]).size === 3 && r * r !== 2 * p * p && p * p !== 2 * q * q && q * q !== 2 * r * r);
    const E1 = r * r - 2 * p * p, E2 = p * p - 2 * q * q, E3 = q * q - 2 * r * r, x = -r, y = -p, z = -q, SE = E1 + E2 + E3;
    const ans = { sum: x + y + z, prod: x * y * z, pair: x * y + y * z + z * x }[ask];
    const what = { sum: 'x + y + z', prod: 'xyz', pair: 'xy + yz + zx' }[ask];
    const wrong = { sum: [-ans, SE, -SE, ans + 2, ans - 2], prod: [-ans, p * q + q * r + r * p, ans + SE, x + y + z], pair: [-ans, SE, -SE, ans + x + y + z] }[ask];
    const Y2 = sup('y', 2), Z2 = sup('z', 2);
    return {
      topic: CY, rank: 21,
      text: `Real numbers x, y and z satisfy ${expr([1, X2], [2 * p, 'y'])} = ${num(E1)}, ${expr([1, Y2], [2 * q, 'z'])} = ${num(E2)} and ${expr([1, Z2], [2 * r, 'x'])} = ${num(E3)}. What is ${what}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const found = [];
        for (let a = -15; a <= 15; a++) for (let b = -15; b <= 15; b++) for (let e = -15; e <= 15; e++)
          if (a * a + 2 * p * b === E1 && b * b + 2 * q * e === E2 && e * e + 2 * r * a === E3) found.push([a, b, e]);
        if (found.length !== 1) return `found ${found.length} integer solutions`;
        const [a, b, e] = found[0];
        return { sum: a + b + e, prod: a * b * e, pair: a * b + b * e + e * a }[ask] === ans ? '' : 'a different answer by search';
      },
      solution: `No equation can be solved on its own, so add all three: ${expr([1, X2], [2 * r, 'x'], [1, Y2], [2 * p, 'y'], [1, Z2], [2 * q, 'z'])} = ${num(SE)}. `
        + `Now each letter has its square next to a multiple of itself, so complete the three squares by adding ${r * r} + ${p * p} + ${q * q} = ${r * r + p * p + q * q} to both sides: (${shift('x', r)})<sup>2</sup> + (${shift('y', p)})<sup>2</sup> + (${shift('z', q)})<sup>2</sup> = ${num(SE)} + ${r * r + p * p + q * q} = 0. `
        + `Squares of real numbers are never negative, so all three are 0: x = ${num(x)}, y = ${num(y)} and z = ${num(z)}. `
        + `So ${what} = <b>${num(ans)}</b>.`,
    };
  },
];

// ======================================================================================================================
// Equations in layers: absolute values inside absolute values, and a function applied to itself
// ======================================================================================================================
const LY = 'Equations in layers';
// | | |x − h| − a | − b | = c: the values |x − h| can take, layer by layer from the outside
const absLayers = (a, b, c) => {
  const s1 = [...new Set([b + c, b - c])], s1ok = s1.filter((s) => s >= 0);
  const s2 = [...new Set(s1ok.flatMap((s) => [a + s, a - s]))], s2ok = s2.filter((s) => s >= 0);
  return { s1, s1ok, s2, s2ok, count: sum(s2ok.map((s) => (s > 0 ? 2 : 1))), zeros: s2ok.filter((s) => s === 0).length };
};
const layers = [
  // three absolute values deep: how many solutions, or (shifted) what they add up to
  (d, ctx) => {
    const [ask, c2] = turn(ctx, ['count', 'sum']);
    const [a, b, c, h] = pick(c2, `abs-${ask}`, [range(1, 8), range(1, 8), range(1, 6), ask === 'count' ? [0] : [2, 3, -2, 5, -3, 4]],
      (a, b, c) => { const L = absLayers(a, b, c); return L.count >= 3 && L.count <= 7; });
    const L = absLayers(a, b, c), inner = h === 0 ? '|x|' : `|${shift('x', -h)}|`, eq = `| | ${inner} − ${a} | − ${b} | = ${c}`;
    const pos = L.s2ok.filter((s) => s > 0).length, ans = ask === 'count' ? L.count : L.count * h;
    const wrong = ask === 'count' ? [8, L.count + L.zeros, pos, L.count + 1, L.count - 1] : [8 * h, (L.count + 1) * h, (L.count - 1) * h, 2 * h, L.count];
    const dropped1 = L.s1.filter((s) => s < 0), dropped2 = L.s2.filter((s) => s < 0), X = h === 0 ? '|x|' : inner;
    return {
      topic: LY, rank: ask === 'count' ? 18 : 19,
      text: ask === 'count' ? `How many real numbers x satisfy ${eq}?` : `What is the sum of all real numbers x that satisfy ${eq}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const g = (x) => Math.abs(Math.abs(Math.abs(x - h) - a) - b), xs = range(h - a - b - c - 3, h + a + b + c + 3).filter((x) => g(x) === c);
        // between whole numbers g changes by exactly 1 per unit, so with c whole every solution is a whole number
        return ask === 'count' ? (xs.length === ans ? '' : `found ${xs.length}`) : (sum(xs) === ans ? '' : `found ${xs.join(', ')}`);
      },
      solution: `Peel off the absolute values from the outside in, using that |u| = s has two solutions when s > 0, one (u = 0) when s = 0, and none when s &lt; 0. `
        + `The outer one gives | ${X} − ${a} | − ${b} = ±${c}, so | ${X} − ${a} | = ${orList(L.s1.map(num))}${dropped1.length ? `; ${num(dropped1[0])} is negative, so only ${orList(L.s1ok.map(num))} is possible` : ''}. `
        + `Next, ${X} − ${a} = ±(that), so ${X} is ${orList(L.s2.map(num))}${dropped2.length ? `, and ${listing(dropped2.map(num))} ${dropped2.length > 1 ? 'are' : 'is'} negative, which leaves ${listing(L.s2ok.map(num))}` : ''}. `
        + `Each positive value of ${X} gives two values of x${L.zeros ? ` and the value 0 gives just one` : ''}, so there are ${L.count} solutions. `
        + (ask === 'count' ? `So the answer is <b>${L.count}</b>.`
          : `They come in pairs ${num(h)} ± s (and ${num(h)} alone when s = 0), so they are symmetric about ${num(h)} and add up to ${L.count}·${paren(h)} = <b>${num(ans)}</b>.`),
    };
  },
  // f(x) = (x − p)² + m: how many x make f(f(x)) (or f(f(f(x)))) equal k
  (d, ctx) => {
    const [L, c2] = turn(ctx, [2, 3]);
    const [p, m, k] = pick(c2, `nest-${L}`, [[1, 2, 3, 4, -1, -2], range(-6, 2), range(-6, 12)], (p, m, k) => {
      const n = preCount(p, m, k, L);
      return L === 2 ? n >= 1 && n <= 3 : n >= 3 && n <= 7;
    });
    const f = [p * p + m, -2 * p, 1], levels = preLevels(p, m, k, L), ans = levels.at(-1).length;
    const F = L === 2 ? 'f(f(x))' : 'f(f(f(x)))';
    const where = (y) => (Math.abs(y - m) < 1e-9 ? `exactly the lowest value of f, which gives one` : y > m ? `above ${num(m)}, which gives two` : `below ${num(m)}, which gives no`);
    const show = (y) => (Math.abs(y - Math.round(y)) < 1e-9 ? num(Math.round(y)) : `about ${num(y, 2)}`);
    const first = levels[0];
    const firstText = first.length === 1 ? `y = ${num(p)}` : isSq(k - m) ? `y = ${num(p + isqrt(k - m))} or y = ${num(p - isqrt(k - m))}` : `y = ${num(p)} ± √${k - m}, about ${num(first[0], 2)} and ${num(first[1], 2)}`;
    const mid = L === 3 ? `Next, z = f(x) must make f(z) equal each of those: ${first.map((y) => `${show(y)} is ${where(y)} z`).join('; ')}. So z is ${orList(levels[1].map(show))}. ` : '';
    const last = levels[L - 2];
    return {
      topic: LY, rank: L === 2 ? 21 : 23,
      text: `Let f(x) = ${poly(f)}. How many real numbers x satisfy ${F} = ${num(k)}?`,
      answer: fchoices(d, ans, [2 ** L, ans + 1, ans - 1, levels[L - 2].length, 2 ** L - 1]),
      check: () => {
        let g = B(f);
        for (let i = 1; i < L; i++) g = compose(g, B(f));
        return realRootCount(padd(g, [BigInt(-k)])) === ans ? '' : `Sturm count ${realRootCount(padd(g, [BigInt(-k)]))}`;
      },
      solution: `Work from the outside in, using which values f can take: f(x) = (${shift('x', -p)})<sup>2</sup>${signed(m)}, so f takes each value above ${num(m)} at two x, the value ${num(m)} only at x = ${num(p)}, and nothing below ${num(m)}. `
        + `${F} = ${num(k)} means f(${L === 2 ? 'x' : 'f(x)'}) = y for a number y with f(y) = ${num(k)}: (${shift('y', -p)})<sup>2</sup> = ${k - m}, so ${firstText}. `
        + mid
        + `Finally f(x) must equal each of ${L === 2 ? 'those' : 'these'}: ${last.map((y) => `${show(y)} is ${where(y)} x`).join('; ')}. `
        + `So there are <b>${ans}</b> solutions.`,
    };
  },
  // f(f(x)) = x for a quadratic f: it factors as (f(x) − x)(f(x) + x + b + 1), and the second factor has 4 less discriminant
  (d, ctx) => {
    const [ask, c2] = turn(ctx, ['count', 'sum']);
    const OK = [0, 1, 4, 5, 8, 9, 12, 13];
    const [b, c] = pick(c2, 'fixed', [range(-5, 5), range(-6, 6)], (b, c) => OK.includes((b - 1) ** 2 - 4 * c) && c !== 0);
    const D1 = (b - 1) ** 2 - 4 * c, D2 = D1 - 4, q1 = [c, b - 1, 1], q2 = [c + b + 1, b + 1, 1];
    const count = D1 === 0 ? 1 : D1 <= 4 ? 2 : 4, total = D1 === 0 ? cut(1 - b, 2) : D1 <= 4 ? [1 - b, 1] : [-2 * b, 1];
    const ans = ask === 'count' ? count : total;
    const x0 = cut(-(b + 1), 2);
    const second = D2 > 0 ? `so two more real roots, all four different (the factors could only share a root where their difference, ${shift('2x', b + 1)}, is 0, and that needs the first discriminant to be exactly 4)`
      : D2 === 0 ? `so a double root x = ${fr(x0)}; but that is also a root of the first factor, so it adds nothing new`
        : 'so no real roots';
    return {
      topic: LY, rank: ask === 'count' ? 22 : 23,
      text: `Let f(x) = ${poly([c, b, 1])}. ${ask === 'count' ? 'How many real numbers x satisfy f(f(x)) = x?' : 'What is the sum of all real numbers x with f(f(x)) = x?'}`,
      answer: ask === 'count' ? choices(d, count, [0, 1, 2, 3, 4]) : fchoices(d, total, [[-2 * b, 1], [1 - b, 1], [-(b + 1), 1], [b - 1, 1], [2 * b, 1], cut(1 - b, 2)]),
      check: () => {
        const ff = padd(compose(B([c, b, 1]), B([c, b, 1])), [0n, -1n]);
        const n = realRootCount(ff);
        if (n !== count) return `Sturm count ${n}`;
        if (ask === 'sum') return near(sum(realRoots(ff)), val(total), 'sum of the roots');
        return '';
      },
      solution: `Any x with f(x) = x also has f(f(x)) = f(x) = x, so f(x) − x divides f(f(x)) − x; in fact f(f(x)) − x = (f(x) − x)(${shift('f(x) + x', b + 1)}), as multiplying out shows. `
        + `Here f(x) − x = ${poly(q1)} and ${shift('f(x) + x', b + 1)} = ${poly(q2)}. `
        + `The first has discriminant ${paren(b - 1)}<sup>2</sup> − 4·${paren(c)} = ${D1}, so ${D1 === 0 ? `one (double) root, x = ${fr(cut(1 - b, 2))}` : 'two real roots'}. `
        + `The second has discriminant ${paren(b + 1)}<sup>2</sup> − 4·${paren(c + b + 1)} = ${num(D2)} (always 4 less than the first), ${second}. `
        + (ask === 'count' ? `So there are <b>${count}</b> real solutions.`
          : D1 > 4 ? `By Vieta the first pair adds up to ${num(1 - b)} and the second pair to ${num(-(b + 1))}, so the sum is <b>${fr(total)}</b>.`
            : D1 === 0 ? `So the only solution is x = ${fr(total)}, and the sum is <b>${fr(total)}</b>.`
              : `By Vieta the two roots of the first factor add up to ${num(1 - b)}, so the sum is <b>${fr(total)}</b>.`),
    };
  },
];
// the numbers at each layer of f(f(…f(x)…)) = k, from the outside in, for f(x) = (x − p)² + m
function preLevels(p, m, k, L) {
  const pre = (y) => (Math.abs(y - m) < 1e-9 ? [p] : y > m ? [p + Math.sqrt(y - m), p - Math.sqrt(y - m)] : []);
  const out = [];
  let vals = [k];
  for (let i = 0; i < L; i++) { vals = vals.flatMap(pre); out.push(vals); }
  return out;
}
const preCount = (p, m, k, L) => preLevels(p, m, k, L).at(-1).length;

// ======================================================================================================================
// Roots with conditions: roots in a progression, two roots with a known product, all roots whole numbers
// ======================================================================================================================
const RC = 'Roots with conditions';
// the ways to write N as a product of `parts` whole numbers, each at least `min`, in increasing order
const splits = (N, parts, min) => {
  if (parts === 1) return N >= min ? [[N]] : [];
  const out = [];
  for (let f = min; f ** parts <= N; f++) if (N % f === 0) for (const rest of splits(N / f, parts - 1, f)) out.push([f, ...rest]);
  return out;
};
const orderings = (list) => { let n = 1; const k = list.length; for (let i = 2; i <= k; i++) n *= i; const counts = {}; for (const v of list) counts[v] = (counts[v] || 0) + 1; for (const c of Object.values(counts)) for (let i = 2; i <= c; i++) n /= i; return n; };
const factorText = (N) => { const out = []; let n = N; for (let p = 2; p <= n; p++) { let e = 0; while (n % p === 0) { n /= p; e++; } if (e) out.push(e === 1 ? `${p}` : sup(p, e)); } return out.join('·'); };
const divisorCount = (N) => range(1, N).filter((k) => N % k === 0).length;
const rootsCond = [
  // roots in arithmetic or geometric progression: the middle root comes first
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['ap', 'gp']);
    if (form === 'ap') {
      const [u, e, ask] = pick(c2, 'ap', [[2, 3, 4, 5, -2, -3, 6], [1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 15, 18, 20], ['k', 'top']],
        (u, e, ask) => e !== u * u && (ask === 'k' || !isSq(e)));
      const A = 3 * u, M = u * (u * u - e), k = 3 * u * u - e, rt = Math.sqrt(e);
      const top = [u + rt, isSq(e) ? num(u + rt) : `${num(u)} + √${e}`];
      const sr = isSq(e) ? `${isqrt(e)}` : `√${e}`;
      return {
        topic: RC, rank: ask === 'k' ? 18 : 19,
        text: `The three solutions of ${expr([1, X3], [-A, X2], [1, 'kx'], [-M, ''])} = 0 are real numbers that form an arithmetic progression. What is ${ask === 'k' ? 'k' : 'the largest of the three solutions'}?`,
        answer: ask === 'k' ? fchoices(d, k, [3 * u * u + e, 2 * u * u - e, u * u - e, 3 * u * u, k + 2 * e])
          : tchoices(top, [[u + e, num(u + e)], [u - rt, `${num(u)} − √${e}`], [2 * u + rt, `${num(2 * u)} + √${e}`], [u + 2 * rt, `${num(u)} + 2√${e}`], [Math.sqrt(u * u + e), `√${u * u + e}`], [u + Math.sqrt(e + 1), `${num(u)} + √${e + 1}`]]),
        check: () => {
          const rs = [u - rt, u, u + rt], P = (x) => x ** 3 - A * x * x + k * x - M;
          if (rs.some((x) => Math.abs(P(x)) > 1e-7 * Math.max(1, Math.abs(M)))) return 'the roots do not solve the cubic';
          const pairs = rs[0] * rs[1] + rs[1] * rs[2] + rs[0] * rs[2];
          return ask === 'k' ? near(pairs, k, 'k') : near(Math.max(...rs), top[0], 'largest root');
        },
        solution: `Call the roots m − d, m and m + d. By Vieta their sum is 3m = ${num(A)}, so the middle root is m = ${num(u)}. `
          + `Their product is m(m − d)(m + d) = m(m<sup>2</sup> − d<sup>2</sup>) = ${num(M)}, so ${paren(u)}(${u * u} − d<sup>2</sup>) = ${num(M)} and d<sup>2</sup> = ${e}. `
          + (ask === 'k' ? `The products in pairs add up to k: (m − d)m + m(m + d) + (m − d)(m + d) = 3m<sup>2</sup> − d<sup>2</sup> = ${3 * u * u} − ${e} = <b>${num(k)}</b>.`
            : `So d = ${sr}, and the roots are ${num(u)} − ${sr}, ${num(u)} and ${num(u)} + ${sr}; the largest is <b>${top[1]}</b>.`),
      };
    }
    const SS = [[3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [-3, 1], [-4, 1], [5, 2], [10, 3], [17, 4]];
    const [g, s, ask] = pick(c2, 'gp', [[2, 3, -2, 4, 5, -3], SS, ['k', 'sq']], (g, s) => { const A = fk(g, fa(s, [1, 1])); return A[1] === 1 && A[0] !== 0; });
    const A = fk(g, fa(s, [1, 1]))[0], k = g * A, M = g ** 3, ans = ask === 'k' ? k : A * A - 2 * k;
    return {
      topic: RC, rank: 20,
      text: `The three solutions of ${expr([1, X3], [-A, X2], [1, 'kx'], [-M, ''])} = 0 are real numbers that form a geometric progression. What is ${ask === 'k' ? 'k' : 'the sum of the squares of the three solutions'}?`,
      answer: ask === 'k' ? fchoices(d, k, [A * g * g, A + g, M * A, A * A - k, k + M]) : fchoices(d, ans, [A * A, A * A + 2 * k, A * A - k, A * A - 2 * M, ans + 2 * g]),
      check: () => {
        const sv = val(s), r = (sv + Math.sign(sv) * Math.sqrt(sv * sv - 4)) / 2, rs = [g / r, g, g * r], P = (x) => x ** 3 - A * x * x + k * x - M;
        if (rs.some((x) => Math.abs(P(x)) > 1e-6 * Math.max(1, Math.abs(M), Math.abs(k * x)))) return 'the roots do not solve the cubic';
        const pairs = rs[0] * rs[1] + rs[1] * rs[2] + rs[0] * rs[2];
        return ask === 'k' ? near(pairs, k, 'k') : near(rs[0] ** 2 + rs[1] ** 2 + rs[2] ** 2, ans, 'sum of squares');
      },
      solution: `Call the roots g/r, g and gr. By Vieta their product is g<sup>3</sup> = ${num(M)}, so the middle root is g = ${num(g)}. `
        + `The products in pairs are g<sup>2</sup>/r, g<sup>2</sup>r and g<sup>2</sup>, which add up to g(g/r + g + gr) = g·(the sum of the roots) = ${paren(g)}·${paren(A)} = ${num(k)}. `
        + (ask === 'k' ? `By Vieta that sum of products is k, so k = <b>${num(k)}</b>.`
          : `So k = ${num(k)}, and the sum of the squares is (the sum)<sup>2</sup> − 2·(the products in pairs) = ${paren(A)}<sup>2</sup> − 2·${paren(k)} = <b>${num(ans)}</b>.`),
    };
  },
  // a quartic and two roots with a given product: it splits into two quadratics with unknown middle terms
  (d, ctx) => {
    const [ask, c2] = turn(ctx, ['B', 'pair']);
    const QS = [-6, -5, -4, -3, -2, 2, 3, 4, 5, 6], SS = [-8, -7, -6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8];
    const [u, v, q, s] = pick(c2, `quartic-${ask}`, [range(-4, 4), range(-4, 4), QS, SS], (u, v, q, s) => {
      const A = u + v, C = u * s + v * q;
      if (s === q || u === 0 || A === 0 || C === 0 || q + s + u * v === 0 || Math.abs(q * s) > 48 || isSq(u * u - 4 * q)) return false;
      // only one pair of roots has product q (the question names "those two")
      const rs = [...roots2(1, u, q), ...roots2(1, v, s)];
      let pairs = 0;
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (cnear(cmul(rs[i], rs[j]), q)) pairs++;
      return pairs === 1;
    });
    const A = u + v, C = u * s + v * q, D = q * s, Bc = q + s + u * v, ans = ask === 'B' ? Bc : -u;
    const u2 = -u, v2 = A - u2;
    return {
      topic: RC, rank: 23,
      text: `The equation ${expr([1, X4], [A, X3], [1, `B${X2}`], [C, 'x'], [D, ''])} = 0 has four solutions (real or not), and exactly two of them have product ${num(q)}. ${ask === 'B' ? 'What is B?' : 'What is the sum of those two solutions?'}`,
      answer: ask === 'B' ? fchoices(d, Bc, [q + s, u * v, q + s - u * v, q + s + u2 * v2, Bc + D]) : fchoices(d, -u, [u, A, -A, v, -v]),
      check: () => {
        const rs = [...roots2(1, u, q), ...roots2(1, v, s)], cs = fromRoots(rs);
        if (![D, C, Bc, A].every((x, i) => cnear(cs[i], x))) return 'the roots do not give these coefficients';
        let e2 = [0, 0];
        for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) e2 = cadd(e2, cmul(rs[i], rs[j]));
        if (ask === 'B') return cnear(e2, Bc) ? '' : `e2 is ${e2}`;
        for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) if (cnear(cmul(rs[i], rs[j]), q)) return cnear(cadd(rs[i], rs[j]), -u) ? '' : 'the pair adds up to something else';
        return 'no pair has that product';
      },
      solution: `The two solutions with product ${num(q)} are the roots of a quadratic ${expr([1, X2], [1, 'ux'], [q, ''])}, and the other two are the roots of ${expr([1, X2], [1, 'vx'], [1, 's'])}, so the quartic is (${expr([1, X2], [1, 'ux'], [q, ''])})(${expr([1, X2], [1, 'vx'], [1, 's'])}). `
        + `Matching the constant terms, ${num(q)}s = ${num(D)}, so s = ${num(s)}. `
        + `Matching ${X3}: u + v = ${num(A)}; matching x: ${expr([s, 'u'], [q, 'v'])} = ${num(C)}. `
        + `Solving these two, u = ${num(u)} and v = ${num(v)}. `
        + (ask === 'B' ? `Matching ${X2}, B = ${num(q)} + ${paren(s)} + uv = ${num(q + s)} + ${paren(u * v)} = <b>${num(Bc)}</b>.`
          : `So the two solutions with product ${num(q)} are the roots of ${poly([q, u, 1])}, and by Vieta their sum is −u = <b>${num(-u)}</b>.`),
    };
  },
  // all roots negative (or all greater than 1) whole numbers, and the coefficients add up to something: count polynomials
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['sum', 'p1', 'pos', 'quart']);
    const NS = {
      sum: [60, 72, 84, 90, 96, 100, 108, 120, 126, 140, 150, 168, 180],
      p1: [64, 72, 80, 96, 108, 112, 120, 144, 160, 200, 210],
      pos: [12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 60, 72],
      quart: [96, 120, 144, 160, 180, 192, 216, 240, 288],
    }[form];
    const [N] = pick(c2, `count-${form}`, [NS]);
    const parts = form === 'quart' ? 4 : 3, min = form === 'pos' ? 1 : 2, ways = splits(N, parts, min), ans = ways.length;
    const ordered = sum(ways.map(orderings)), loose = splits(N, parts, min === 2 ? 1 : 2).length;
    const wrong = [ordered, loose, form === 'sum' ? splits(N - 1, 3, 2).length : splits(N, parts, min).filter((w) => new Set(w).size === parts).length, divisorCount(N), ans + 1];
    const text = {
      sum: `How many polynomials x<sup>3</sup> + ax<sup>2</sup> + bx + c are there whose three roots are all negative integers (not necessarily different) and whose coefficients satisfy a + b + c = ${N - 1}?`,
      p1: `How many polynomials P(x) = x<sup>3</sup> + ax<sup>2</sup> + bx + c are there whose three roots are all negative integers (not necessarily different) and for which P(1) = ${N}?`,
      pos: `How many polynomials x<sup>3</sup> + ax<sup>2</sup> + bx + c are there whose three roots are all integers greater than 1 (not necessarily different) and whose coefficients satisfy a + b + c = ${num(-N - 1)}?`,
      quart: `How many polynomials P(x) = x<sup>4</sup> + ax<sup>3</sup> + bx<sup>2</sup> + cx + d are there whose four roots are all negative integers (not necessarily different) and for which P(1) = ${N}?`,
    }[form];
    const list = ways.map((w) => w.join('·')).join(', ');
    const setup = {
      sum: `Write the roots as −r, −s and −t with r, s and t positive integers, so the polynomial is P(x) = (x + r)(x + s)(x + t). Then 1 + a + b + c is P(1) = (1 + r)(1 + s)(1 + t), so (1 + r)(1 + s)(1 + t) = ${N - 1} + 1 = ${N}, with each factor at least 2.`,
      p1: `Write the roots as −r, −s and −t with r, s and t positive integers, so P(x) = (x + r)(x + s)(x + t). Then P(1) = (1 + r)(1 + s)(1 + t) = ${N}, with each factor at least 2.`,
      pos: `Write the roots as r, s and t, so the polynomial is P(x) = (x − r)(x − s)(x − t). Then 1 + a + b + c is P(1) = (1 − r)(1 − s)(1 − t) = −(r − 1)(s − 1)(t − 1), so (r − 1)(s − 1)(t − 1) = ${N}, with each factor at least 1.`,
      quart: `Write the roots as −r, −s, −t and −w with r, s, t and w positive integers, so P(x) = (x + r)(x + s)(x + t)(x + w). Then P(1) = (1 + r)(1 + s)(1 + t)(1 + w) = ${N}, with each factor at least 2.`,
    }[form];
    return {
      topic: RC, rank: { sum: 22, p1: 21, pos: 22, quart: 23 }[form],
      text,
      answer: fchoices(d, ans, wrong),
      check: () => {
        // build each polynomial from its roots and add up its coefficients
        const roots = (form === 'pos' ? range(2, N + 1) : range(-N, -1)), found = new Set();
        const go = (start, chosen) => {
          if (chosen.length === parts) {
            const cs = chosen.reduce((acc, r) => pmul(acc, [BigInt(-r), 1n]), [1n]), P1 = cs.reduce((s, c) => s + c, 0n);
            if (P1 === BigInt(form === 'pos' ? -N : N)) found.add(chosen.join(','));
            return;
          }
          for (let i = start; i < roots.length; i++) {
            const r = roots[i], f = Math.abs(1 - r), sofar = chosen.reduce((p, x) => p * Math.abs(1 - x), 1);
            if (sofar * f > N || N % (sofar * f) !== 0) continue;
            go(i, [...chosen, r]);
          }
        };
        go(0, []);
        return found.size === ans ? '' : `found ${found.size}`;
      },
      solution: `${setup} Since ${N} = ${factorText(N)}, the ways to write it as such a product, from the smallest factor up, are ${list}. `
        + `Each way gives one polynomial (the order of the roots doesn’t change it), so there are <b>${ans}</b>.`,
    };
  },
];

// ======================================================================================================================
// Best value under a condition: AM-GM, Cauchy–Schwarz, and the discriminant, each where it fits
// ======================================================================================================================
const BV = 'Best value under a condition';
// the least value of f on (lo, hi), by a fine scan and then golden-section search around the best point
function minimize(f, lo, hi, steps = 4000) {
  let best = lo, bv = Infinity;
  for (let i = 0; i <= steps; i++) { const t = lo + ((hi - lo) * i) / steps, v = f(t); if (v < bv) { bv = v; best = t; } }
  let a = Math.max(lo, best - (hi - lo) / steps), b = Math.min(hi, best + (hi - lo) / steps);
  const g = (Math.sqrt(5) - 1) / 2;
  for (let i = 0; i < 200; i++) { const c = b - g * (b - a), e = a + g * (b - a); if (f(c) < f(e)) b = e; else a = c; }
  return Math.min(bv, f((a + b) / 2));
}
const AP_PAIRS = [[1, 4], [4, 1], [2, 8], [8, 2], [1, 9], [9, 1], [2, 18], [3, 12], [12, 3], [3, 3], [2, 2], [1, 1], [4, 9], [9, 4], [1, 16], [6, 6], [5, 5], [3, 27], [1, 25], [18, 2], [8, 8], [2, 32]];
const best = [
  // a/x + b/y = 1 (or in disguise, xy = bx + ay, or the other way round): the least px + qy is (√(ap) + √(bq))²
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['plain', 'hidden', 'swap']);
    const [[a, p], [b, q]] = pick(c2, `amgm-${form}`, [AP_PAIRS, AP_PAIRS], (s, t) => isqrt(s[0] * s[1]) !== isqrt(t[0] * t[1]) && !(s[0] === t[0] && s[1] === t[1]));
    const al = isqrt(a * p), be = isqrt(b * q), ans = (al + be) ** 2, pb = p * b, qa = q * a;
    const lin = expr([p, 'x'], [q, 'y']), rec = `${over(a, 'x')} + ${over(b, 'y')}`;
    const text = {
      plain: `Positive real numbers x and y satisfy ${rec} = 1. What is the least possible value of ${lin}?`,
      hidden: `Positive real numbers x and y satisfy xy = ${expr([b, 'x'], [a, 'y'])}. What is the least possible value of ${lin}?`,
      swap: `Positive real numbers x and y satisfy ${lin} = 1. What is the least possible value of ${rec}?`,
    }[form];
    const one = form === 'swap' ? lin : rec, goal = form === 'swap' ? rec : lin;
    return {
      topic: BV, rank: form === 'hidden' ? 20 : 19,
      text,
      answer: fchoices(d, ans, [4 * al * be, al * al + be * be, al * al + be * be + al * be, 2 * (al * al + be * be), ans + al * be]),
      check: () => {
        const got = form === 'swap'
          ? minimize((t) => { const x = 1 / p / (1 + Math.exp(-t)), y = (1 - p * x) / q; return a / x + b / y; }, -25, 25)
          : minimize((t) => { const x = a + Math.exp(t), y = (b * x) / (x - a); return p * x + q * y; }, -25, 25);
        return Math.abs(got - ans) < 1e-6 * ans ? '' : `numerically the least value is ${got}`;
      },
      solution: (form === 'hidden' ? `Dividing both sides by xy turns the condition into ${rec} = 1. ` : '')
        + `Since ${one} = 1, multiplying by it changes nothing: ${goal} = (${lin})(${rec}) = ${a * p} + ${b * q} + ${pb === 1 ? '' : pb}${over('x', 'y')} + ${qa === 1 ? '' : qa}${over('y', 'x')}. `
        + `By AM-GM, ${pb === 1 ? '' : pb}${over('x', 'y')} + ${qa === 1 ? '' : qa}${over('y', 'x')} ≥ 2√(${pb}·${qa}) = ${2 * al * be}, with equality when ${pb === 1 ? '' : pb}${X2} = ${qa === 1 ? '' : qa}${sup('y', 2)}, which happens for some x and y that meet the condition. `
        + `So the least value is ${a * p} + ${b * q} + ${2 * al * be} = <b>${num(ans)}</b>.`,
    };
  },
  // a + b + c and ab + bc + ca (or a² + b² + c²) fixed: c is largest when the quadratic for a and b has a double root
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['Q', 'T', 'span']);
    const [S, t, ext] = pick(c2, `disc-${form}`, [range(-4, 15), range(1, 9), ['max', 'min']],
      (S, t, ext) => (S * S - t * t) % 3 === 0 && S * S !== t * t && (form !== 'span' || ext === 'max'));
    const Qv = (S * S - t * t) / 3, T = S * S - 2 * Qv, hi = cut(S + 2 * t, 3), lo = cut(S - 2 * t, 3);
    const ans = form === 'span' ? cut(4 * t, 3) : ext === 'max' ? hi : lo, at = ext === 'max' || form === 'span' ? hi : lo, ab = cut(3 * S - (S + (ext === 'max' ? 2 : -2) * t), 6);
    const given = form === 'Q' ? `ab + bc + ca = ${num(Qv)}` : `a<sup>2</sup> + b<sup>2</sup> + c<sup>2</sup> = ${num(T)}`;
    const wrong = form === 'span' ? [cut(2 * t, 3), [2 * t, 1], [t, 1], cut(8 * t, 3), cut(2 * t, 1)]
      : ext === 'max' ? [cut(S + t, 3), cut(S + 2 * t, 6), lo, cut(S, 3), cut(S + 4 * t, 3)] : [cut(S - t, 3), cut(S - 2 * t, 6), hi, cut(S, 3), cut(S - 4 * t, 3)];
    const disc = (c) => { const sc = qsub(Q(S), c); return qsub(qmul(sc, sc), qmul(Q(4), qadd(qsub(qmul(c, c), qmul(Q(S), c)), Q(Qv)))); };
    return {
      topic: BV, rank: form === 'Q' ? 21 : 22,
      text: `Real numbers a, b and c satisfy a + b + c = ${num(S)} and ${given}. ${form === 'span' ? 'What is the difference between the largest and the smallest possible values of c?' : `What is the ${ext === 'max' ? 'largest' : 'smallest'} possible value of c?`}`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        // at the end of the range the discriminant is 0, just inside it is positive, just outside negative, and a = b works there
        const eps = Q(1, 1000);
        for (const [end, dir] of [[hi, 1], [lo, -1]]) {
          const e = toQ(end), out = dir > 0 ? qadd(e, eps) : qsub(e, eps), inn = dir > 0 ? qsub(e, eps) : qadd(e, eps);
          if (qsign(disc(e)) !== 0 || qsign(disc(out)) >= 0 || qsign(disc(inn)) <= 0) return 'the range of c is not what was said';
          const a = qmul(qsub(Q(S), e), Q(1, 2));
          if (!qeq(qadd(qmul(a, a), qmul(Q(2), qmul(a, e))), Q(Qv))) return 'a = b does not give the right ab + bc + ca';
        }
        return form === 'span' ? said(qsub(toQ(hi), toQ(lo)), ans) : said(toQ(ext === 'max' ? hi : lo), ans);
      },
      solution: (form === 'Q' ? '' : `First, ab + bc + ca = ((a + b + c)<sup>2</sup> − (a<sup>2</sup> + b<sup>2</sup> + c<sup>2</sup>))/2 = (${paren(S)}<sup>2</sup> − ${num(T)})/2 = ${num(Qv)}. `)
        + `Fix c and ask when real numbers a and b exist: a + b = ${num(S)} − c, and ab = ${num(Qv)} − c(a + b) = ${expr([1, 'c<sup>2</sup>'], [-S, 'c'], [Qv, ''])}. `
        + `Two real numbers with sum s and product p exist exactly when s<sup>2</sup> ≥ 4p, so (${num(S)} − c)<sup>2</sup> ≥ 4(${expr([1, 'c<sup>2</sup>'], [-S, 'c'], [Qv, ''])}), which simplifies to ${expr([3, 'c<sup>2</sup>'], [-2 * S, 'c'], [4 * Qv - S * S, ''])} ≤ 0. `
        + `The roots of the left side are c = (${num(S)} ± 2√(${paren(S)}<sup>2</sup> − 3·${paren(Qv)}))/3 = (${num(S)} ± ${2 * t})/3, so c lies between ${fr(lo)} and ${fr(hi)}. `
        + (form === 'span' ? `Both ends happen (with a = b), so the difference is ${fr(hi)} − ${pf(lo)} = <b>${fr(ans)}</b>.`
          : `That end happens, with a = b = ${fr(ab)}, so the ${ext === 'max' ? 'largest' : 'smallest'} possible value of c is <b>${fr(at)}</b>.`),
    };
  },
  // a circle written as x² + y² = 2ux + 2vy + w, and the largest or smallest px + qy on it
  (d, ctx) => {
    const PQ = [[3, 4], [4, 3], [3, -4], [-4, 3], [5, 12], [12, 5], [6, 8], [8, -6], [-3, 4], [5, -12]];
    const UV = [-5, -4, -3, -2, -1, 1, 2, 3, 4, 5, 6, 7, 8];
    const [u, v, R, [p, q], ext] = pick(ctx, 'circle', [UV, UV, [2, 3, 4, 5, 6, 7, 10], PQ, ['max', 'min']], (u, v, R) => R * R - u * u - v * v !== 0 && Math.abs(R * R - u * u - v * v) <= 90);
    const w = R * R - u * u - v * v, L = Math.round(Math.hypot(p, q)), c0 = p * u + q * v, sg = ext === 'max' ? 1 : -1, ans = c0 + sg * L * R;
    const lin = expr([p, 'x'], [q, 'y']);
    return {
      topic: BV, rank: 20,
      text: `Real numbers x and y satisfy ${X2} + ${sup('y', 2)} = ${expr([2 * u, 'x'], [2 * v, 'y'], [w, ''])}. What is the ${ext === 'max' ? 'largest' : 'smallest'} possible value of ${lin}?`,
      answer: fchoices(d, ans, [c0, c0 + sg * R * (Math.abs(p) + Math.abs(q)), c0 + sg * R, c0 - sg * L * R, c0 + sg * (L + R)]),
      check: () => {
        const X = u + (sg * R * p) / L, Y = v + (sg * R * q) / L;
        if (Math.abs(X * X + Y * Y - (2 * u * X + 2 * v * Y + w)) > 1e-9) return 'the best point is not on the circle';
        let bestV = -sg * Infinity;
        for (let i = 0; i < 20000; i++) { const th = (2 * Math.PI * i) / 20000, f = p * (u + R * Math.cos(th)) + q * (v + R * Math.sin(th)); bestV = sg > 0 ? Math.max(bestV, f) : Math.min(bestV, f); }
        return Math.abs(bestV - ans) < 1e-3 ? (Math.abs(p * X + q * Y - ans) < 1e-9 ? '' : 'the best point gives another value') : `numerically ${bestV}`;
      },
      solution: `Move the x and y terms to the left and complete the squares: (${shift('x', -u)})<sup>2</sup> + (${shift('y', -v)})<sup>2</sup> = ${num(w)} + ${u * u} + ${v * v} = ${R * R}. `
        + `So the point (x, y) lies on the circle with center (${num(u)}, ${num(v)}) and radius ${R}. `
        + `Write x = ${num(u)} + X and y = ${num(v)} + Y, where X<sup>2</sup> + Y<sup>2</sup> = ${R * R}; then ${lin} = ${num(c0)} + (${expr([p, 'X'], [q, 'Y'])}). `
        + `By the Cauchy–Schwarz inequality, ${expr([p, 'X'], [q, 'Y'])} is at most √(${p * p} + ${q * q})·${R} = ${L * R} and at least −${L * R}, and each happens when (X, Y) points along (${num(p)}, ${num(q)}) or the opposite way. `
        + `So the ${ext === 'max' ? 'largest' : 'smallest'} value is ${num(c0)} ${sg > 0 ? '+' : '−'} ${L * R} = <b>${num(ans)}</b>.`,
    };
  },
  // (px + a/y)(qy + b/x): multiply out first, and only then use AM-GM, on the one quantity xy
  (d, ctx) => {
    const NUMS = [1, 2, 3, 4, 6, 8, 9, 12];
    const [p, a, q, b] = pick(ctx, 'brackets', [[1, 2, 3], NUMS, [1, 2, 3], NUMS], (p, a, q, b) => isSq(p * q * a * b) && p * b !== a * q && !(p === 1 && q === 1 && a * b === 4));
    const s = isqrt(p * q * a * b), pq = p * q, ab = a * b, ans = 2 * s + p * b + a * q;
    const one = (k, v) => `${k === 1 ? '' : k}${v}`;
    return {
      topic: BV, rank: 21,
      text: `For positive real numbers x and y, what is the least possible value of (${one(p, 'x')} + ${over(a, 'y')})(${one(q, 'y')} + ${over(b, 'x')})?`,
      answer: fchoices(d, ans, [4 * s, p * b + a * q, 2 * s, 4 * s + p * b + a * q, 2 * (p * b + a * q)]),
      check: () => {
        let m = Infinity;
        for (let i = -300; i <= 300; i++) for (let j = -300; j <= 300; j++) { const x = Math.exp(i / 50), y = Math.exp(j / 50); m = Math.min(m, (p * x + a / y) * (q * y + b / x)); }
        return m >= ans * (1 - 1e-9) && m <= ans * (1 + 1e-3) ? '' : `numerically ${m}`;
      },
      solution: `Multiply out before using any inequality: the product is ${one(pq, 'xy')} + ${p * b} + ${a * q} + ${over(ab, 'xy')}. `
        + `So it depends only on the one number t = xy: it is ${one(pq, 't')} + ${over(ab, 't')} + ${p * b + a * q}, and t can be any positive number. `
        + `By AM-GM, ${one(pq, 't')} + ${over(ab, 't')} ≥ 2√(${pq}·${ab}) = ${2 * s}, with equality when ${one(pq, 't')} = ${over(ab, 't')}. `
        + `Using AM-GM on each bracket separately would only show that the product is at least ${4 * s}, a bound that is never reached, because the two brackets can’t both be at their smallest for the same x and y. `
        + `So the least value is ${2 * s} + ${p * b + a * q} = <b>${num(ans)}</b>.`,
    };
  },
];

// ======================================================================================================================
// Hidden formulas in sequences: a shift that makes a rule geometric, sums that give the terms, second differences
// ======================================================================================================================
const HF = 'Hidden formulas in sequences';
// c·k^e + t, written 5·2¹⁹ − 3, as [value, how it reads]
// (with the coefficient's own factors of k moved into the power, as an answer would be written: 12·2²¹ is 3·2²³)
const powLabel = (c, k, e, t) => {
  if (c === 0) return null;
  while (c % k === 0) { c /= k; e++; }
  return [c * k ** e + t, `${c === 1 ? '' : c === -1 ? '−' : `${num(c)}·`}${sup(k, e)}${signed(t)}`];
};
const hidden = [
  // a(n+1) = k·a(n) + c, or 2a(n) + cn: shift to a plain geometric sequence
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['const', 'lin']);
    const an = sub('a', 'n'), an1 = sub('a', 'n+1');
    if (form === 'const') {
      const [k, c, s, N] = pick(c2, 'affine', [[2, 3], [1, 2, 3, 4, 5, -1, -2, -3, 6], [1, 2, 3, 4, 5, -1, 0, 7], range(12, 25)],
        (k, c, s, N) => c % (k - 1) === 0 && s + c / (k - 1) !== 0 && (k === 2 || N <= 20));
      const h = c / (k - 1), co = s + h, right = powLabel(co, k, N - 1, -h);
      const wrongs = [powLabel(co, k, N, -h), powLabel(co, k, N - 2, -h), powLabel(co, k, N - 1, h), powLabel(s - h, k, N - 1, h), powLabel(s, k, N - 1, -h), powLabel(co, k, N - 1, -h - 1)];
      return {
        topic: HF, rank: 19,
        text: `A sequence has ${sub('a', 1)} = ${num(s)} and ${an1} = ${k}${an}${signed(c)} for every n ≥ 1. What is ${sub('a', N)}?`,
        answer: tchoices(right, wrongs),
        check: () => { let a = BigInt(s); for (let n = 1; n < N; n++) a = BigInt(k) * a + BigInt(c); return a === BigInt(co) * BigInt(k) ** BigInt(N - 1) - BigInt(h) && Number(a) === right[0] ? '' : `a_N is ${a}`; },
        solution: `Shift every term by the same number so that the rule becomes plain multiplication: ${shift(an1, h)} = ${k}${an}${signed(c + h)} = ${k}(${shift(an, h)}). `
          + `So the numbers ${sub('b', 'n')} = ${shift(an, h)} are multiplied by ${k} at every step, starting from ${sub('b', 1)} = ${num(s)}${signed(h)} = ${num(co)}. `
          + `There are ${N - 1} steps from the first term to the ${ord(N)}, so ${sub('b', N)} = ${num(co)}·${sup(k, N - 1)}${co % k === 0 ? ` = ${powLabel(co, k, N - 1, 0)[1]}` : ''}. `
          + `So ${sub('a', N)} = ${sub('b', N)}${signed(-h)} = <b>${right[1]}</b>.`,
      };
    }
    const [c, s, N] = pick(c2, 'affine-n', [[1, 2, 3, -1, -2], [1, 2, 3, 0, -1, 4], range(12, 25)], (c, s) => s + 2 * c !== 0);
    const co = s + 2 * c, right = powLabel(co, 2, N - 1, -c * (N + 1));
    const wrongs = [powLabel(co, 2, N - 1, -c * N), powLabel(co, 2, N, -c * (N + 1)), powLabel(s + c, 2, N - 1, -c * N), powLabel(co, 2, N - 1, -c * (N + 2)), powLabel(co, 2, N - 1, c * (N + 1)), powLabel(s, 2, N - 1, -c * (N + 1))];
    const bn = `${an}${signed(c, 'n')}${signed(c)}`;
    return {
      topic: HF, rank: 20,
      text: `A sequence has ${sub('a', 1)} = ${num(s)} and ${an1} = 2${an}${signed(c, 'n')} for every n ≥ 1. What is ${sub('a', N)}?`,
      answer: tchoices(right, wrongs),
      check: () => { let a = BigInt(s); for (let n = 1; n < N; n++) a = 2n * a + BigInt(c * n); return Number(a) === right[0] ? '' : `a_N is ${a}`; },
      solution: `The ${c === 1 ? '' : c === -1 ? '−' : num(c)}n spoils plain doubling, so look for b<sub>n</sub> = ${an} + αn + β that just doubles. `
        + `Trying α = β = ${num(c)}: ${an1}${signed(c, '(n + 1)')}${signed(c)} = 2${an}${signed(2 * c, 'n')}${signed(2 * c)} = 2(${bn}). `
        + `So ${sub('b', 'n')} = ${bn} doubles at every step, from ${sub('b', 1)} = ${num(s)}${signed(2 * c)} = ${num(co)}, and ${sub('b', N)} = ${num(co)}·${sup(2, N - 1)}${co % 2 === 0 ? ` = ${powLabel(co, 2, N - 1, 0)[1]}` : ''}. `
        + `So ${sub('a', N)} = ${sub('b', N)} − ${paren(c)}·${N} − ${paren(c)} = <b>${right[1]}</b>.`,
    };
  },
  // the sum of the first n terms is c(n)·a(n): subtract neighbouring sums, then multiply the ratios that telescope
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['sq', 'mean', 'tri', 'third']);
    const [A1, N, ask] = pick(c2, `sums-${form}`, [[1, 2, 3, 4, 5, 6, 10, 12, 100, 2025, 2026], [10, 12, 15, 20, 24, 30, 40, 49, 50, 99, 100], ['term', 'first']], (A1, N, ask) => ask === 'term' || A1 <= 6);
    const ratio = { sq: [2, N * (N + 1)], mean: [2, N * (N + 1)], tri: [6, (N + 1) * (N + 2)], third: [N * (N + 1), 2] }[form];
    const slips = {
      sq: [[2, N * N], [1, N * (N + 1)], [2, N * (N - 1)], [2, (N + 1) * (N + 2)], [1, N * N]],
      tri: [[6, N * (N + 1)], [2, (N + 1) * (N + 2)], [6, (N + 2) * (N + 3)], [3, (N + 1) * (N + 2)], [1, (N + 1) * (N + 2)]],
      third: [[N * (N - 1), 2], [(N + 1) * (N + 2), 2], [N * N, 1], [N * (N + 1), 1], [N, 1]],
    }[form === 'mean' ? 'sq' : form];
    const an = sub('a', 'n'), an1 = sub('a', 'n−1'), aN = sub('a', N), a1 = sub('a', 1);
    const use = (r) => (ask === 'term' ? cut(A1 * r[0], r[1]) : cut(A1 * r[1], r[0]));
    const ans = use(ratio);
    const rule = {
      sq: `${a1} + ${sub('a', 2)} + ⋯ + ${an} = n<sup>2</sup>${an} for every n ≥ 1`,
      mean: `the property that, for every n ≥ 1, the average of ${a1}, ${sub('a', 2)}, …, ${an} is n·${an}`,
      tri: `${a1} + ${sub('a', 2)} + ⋯ + ${an} = (1 + 2 + ⋯ + n)·${an} for every n ≥ 1`,
      third: `${a1} + ${sub('a', 2)} + ⋯ + ${an} = ${over('n + 2', 3)}·${an} for every n ≥ 1`,
    }[form];
    const cn = { sq: 'n<sup>2</sup>', mean: 'n<sup>2</sup>', tri: over('n(n + 1)', 2), third: over('n + 2', 3) }[form];
    const steps = {
      sq: `So ${an} = n<sup>2</sup>${an} − (n − 1)<sup>2</sup>${an1}, which gives (n<sup>2</sup> − 1)${an} = (n − 1)<sup>2</sup>${an1}, that is, ${an} = ${over('n − 1', 'n + 1')}·${an1}. Multiplying these ratios from n = 2 to n = ${N}, nearly everything cancels: ${over(1, 3)}·${over(2, 4)}·${over(3, 5)}⋯${over(N - 1, N + 1)} = ${over(2, `${N}·${N + 1}`)}.`,
      tri: `So ${an} = ${over('n(n + 1)', 2)}${an} − ${over('(n − 1)n', 2)}${an1}, which gives ${over('(n − 1)(n + 2)', 2)}${an} = ${over('(n − 1)n', 2)}${an1}, that is, ${an} = ${over('n', 'n + 2')}·${an1}. Multiplying these ratios from n = 2 to n = ${N}, nearly everything cancels: ${over(2, 4)}·${over(3, 5)}·${over(4, 6)}⋯${over(N, N + 2)} = ${over('2·3', `${N + 1}·${N + 2}`)}.`,
      third: `So ${an} = ${over('n + 2', 3)}${an} − ${over('n + 1', 3)}${an1}, which gives ${over('n − 1', 3)}${an} = ${over('n + 1', 3)}${an1}, that is, ${an} = ${over('n + 1', 'n − 1')}·${an1}. Multiplying these ratios from n = 2 to n = ${N}, nearly everything cancels: ${over(3, 1)}·${over(4, 2)}·${over(5, 3)}⋯${over(N + 1, N - 1)} = ${over(`${N}·${N + 1}`, 2)}.`,
    }[form === 'mean' ? 'sq' : form];
    return {
      topic: HF, rank: form === 'third' ? 21 : 22,
      text: `A sequence ${a1}, ${sub('a', 2)}, ${sub('a', 3)}, … has ${rule}. ${ask === 'term' ? `If ${a1} = ${num(A1)}, what is ${aN}?` : `If ${aN} = ${num(A1)}, what is ${a1}?`}`,
      answer: fchoices(d, ans, slips.map(use)),
      check: () => {
        // straight from the rule: with S the sum so far, S + a(n) = c(n)·a(n), so a(n) = S/(c(n) − 1)
        const c = (n) => ({ sq: Q(n * n), mean: Q(n * n), tri: Q(n * (n + 1), 2), third: Q(n + 2, 3) }[form]);
        let S = Q(1), a = Q(1);
        for (let n = 2; n <= N; n++) { a = qdiv(S, qsub(c(n), Q(1))); S = qadd(S, a); }
        return said(ask === 'term' ? qmul(Q(A1), a) : qdiv(Q(A1), a), ans);
      },
      solution: (form === 'mean' ? `The average of the first n terms is their sum over n, so the sum of the first n terms is S<sub>n</sub> = n<sup>2</sup>${an}. ` : `Write S<sub>n</sub> for the sum of the first n terms, so S<sub>n</sub> = ${cn}${an}. `)
        + `Each term is the difference of two neighbouring sums: ${an} = S<sub>n</sub> − S<sub>n−1</sub>. ${steps} `
        + (ask === 'term' ? `So ${aN} = ${num(A1)}·${fr(ratio)} = <b>${fr(ans)}</b>.` : `So ${aN} = ${a1}·${fr(ratio)}, and ${a1} = ${num(A1)} ÷ ${fr(ratio)} = <b>${fr(ans)}</b>.`),
    };
  },
  // differences that go up by d each time, and two terms that are 0: the terms are (d/2)(n − p)(n − q)
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['first', 'least', 'later']);
    const [dd, p, gap, j] = pick(c2, `second-${form}`, [form === 'least' ? [1, 2, 3, 4] : [1, 2, 3, 4, -2, -1], range(5, 30), [7, 9, 11, 12, 15, 17, 20, 24, 27, 31, 36], [3, 5, 8, 10]],
      (dd, p, gap, j) => (dd % 2 === 0 || gap % 2 === 1) && (form === 'later' || j === 3));
    const q = p + gap, hd = cut(dd, 2), A = (n) => fk((n - p) * (n - q), hd), m = q + j, nv = Math.floor((p + q) / 2);
    const at = { first: 1, least: nv, later: m }[form], ans = A(at);
    const lead = hd[1] === 1 ? (hd[0] === 1 ? '' : hd[0] === -1 ? '−' : num(hd[0])) : fr(hd);
    const wrong = {
      first: [fk(2, ans), fk(p * q, hd), A(2), fk(-1, ans), fk((p - 1) * (q + 1), hd)],
      least: [fk(2, ans), fk(-((q - p) ** 2), cut(dd, 8)), A(nv - 1), A(nv + 2), fk(-1, ans)],
      later: [fk(2, ans), fk((m - p + 1) * (m - q + 1), hd), A(m - 1), A(m + 1), fk(-1, ans)],
    }[form];
    const what = { first: sub('a', 1), least: 'the smallest term of the sequence', later: sub('a', m) }[form];
    return {
      topic: HF, rank: form === 'later' ? 22 : 23,
      text: `In the sequence ${sub('a', 1)}, ${sub('a', 2)}, ${sub('a', 3)}, …, each difference ${sub('a', 'n+1')} − ${sub('a', 'n')} is ${Math.abs(dd)} ${dd > 0 ? 'more' : 'less'} than the difference before it. If ${sub('a', p)} = ${sub('a', q)} = 0, what is ${what}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        // a(n) = a(1) + (n − 1)δ + d(n − 1)(n − 2)/2; find a(1) and δ from the two zeros, then run the sequence
        const sol = solveLinear([[1, p - 1, cut(-dd * (p - 1) * (p - 2), 2)], [1, q - 1, cut(-dd * (q - 1) * (q - 2), 2)]]);
        const terms = [sol[0]];
        let diff = sol[1];
        for (let n = 2; n <= m + 3; n++) { terms.push(qadd(terms.at(-1), diff)); diff = qadd(diff, Q(dd)); }
        if (terms[p - 1][0] !== 0n || terms[q - 1][0] !== 0n) return 'the zeros are not where they should be';
        const got = form === 'least' ? terms.reduce((x, y) => (qf(y) < qf(x) ? y : x)) : terms[at - 1];
        return said(got, ans);
      },
      solution: `When the differences change by the same amount each time, the terms follow a quadratic in n, and since the differences of n<sup>2</sup> go up by 2 each time, the coefficient of n<sup>2</sup> is half of ${num(dd)}, which is ${fr(hd)}. `
        + `This quadratic is 0 at n = ${p} and n = ${q}, so ${sub('a', 'n')} = ${lead}(n − ${p})(n − ${q}). `
        + (form === 'least' ? `With a positive coefficient of n<sup>2</sup>, the terms are smallest at the whole numbers nearest the vertex, n = ${fr(cut(p + q, 2))}${(p + q) % 2 ? `; both ${nv} and ${nv + 1} give the same value` : ''}. ` : '')
        + `So ${sub('a', at)} = ${lead}(${at} − ${p})(${at} − ${q}) = ${fr(hd)}·${paren(at - p)}·${paren(at - q)} = <b>${fr(ans)}</b>.`,
    };
  },
];

// ======================================================================================================================
// Logs and exponents: a power equal to 1, a log and its reciprocal, products of solutions, and when a log is rational
// ======================================================================================================================
const LE = 'Logs and exponents';
// (x² − (m + n)x + mn − 1)^((x − p)(x − q)) = 1: the whole-number solutions (and whether the two base-1 ones are whole)
function powSols(m, n, p, q, slip = {}) {
  const Bf = (x) => (x - m) * (x - n) - 1, E = (x) => (x - p) * (x - q), D1 = (m - n) ** 2 + 8, intOne = isSq(D1);
  const ints = new Set();
  if (intOne) { ints.add((m + n + isqrt(D1)) / 2); ints.add((m + n - isqrt(D1)) / 2); }
  for (const x of [p, q]) if (Bf(x) !== 0 || slip.zero) ints.add(x);
  for (const x of new Set([m, n])) if (slip.neg === 'all' || (slip.neg !== 'none' && E(x) % 2 === 0)) ints.add(x);
  return { intOne, D1, ints, count: ints.size + (intOne ? 0 : 2), total: sum([...ints]) + (intOne ? 0 : m + n) };
}
const logs = [
  // a power equal to 1: base 1, exponent 0 (base not 0), or base −1 with an even exponent
  (d, ctx) => {
    const [ask, c2] = turn(ctx, ['count', 'sum']);
    const [m, n, p, q] = pick(c2, `pow1-${ask}`, [range(1, 6), range(1, 7), range(0, 8), range(1, 9)], (m, n, p, q) => {
      if (n < m || q <= p || (m === 2 && n === 3 && p === 4 && q === 5)) return false;
      const S = powSols(m, n, p, q), naive = powSols(m, n, p, q, { zero: true, neg: 'none' });
      return (ask === 'count' ? S.count !== naive.count : S.total !== naive.total) && S.count >= 3;
    });
    const S = powSols(m, n, p, q), get = (s) => (ask === 'count' ? s.count : s.total);
    const Bc = [m * n - 1, -(m + n), 1], Ec = [p * q, -(p + q), 1], Bf = (x) => (x - m) * (x - n) - 1, E = (x) => (x - p) * (x - q);
    const ans = get(S), wrong = [powSols(m, n, p, q, { zero: true, neg: 'none' }), powSols(m, n, p, q, { neg: 'none' }), powSols(m, n, p, q, { neg: 'all' }), powSols(m, n, p, q, { zero: true }), powSols(m, n, p, q, { zero: true, neg: 'all' })].map(get);
    const r1 = (m + n + isqrt(S.D1)) / 2, r2 = (m + n - isqrt(S.D1)) / 2;
    const zeroText = [p, q].map((x) => (Bf(x) === 0 ? `at x = ${x} the base is 0, and 0<sup>0</sup> is not defined, so x = ${x} does not count` : `at x = ${x} the base is ${num(Bf(x))}, so x = ${x} works`)).join('; ');
    const negs = [...new Set([m, n])], negText = negs.map((x) => `at x = ${x} the exponent is ${num(E(x))}, so the power is (−1)<sup>${num(E(x))}</sup> = ${E(x) % 2 === 0 ? '1 and x = ' + x + ' works' : '−1 and x = ' + x + ' does not'}`).join('; ');
    const others = [...S.ints].sort((a, b) => a - b);
    return {
      topic: LE, rank: 22,
      text: ask === 'count' ? `How many real numbers x satisfy (${poly(Bc)})<sup>${poly(Ec)}</sup> = 1?` : `What is the sum of all real numbers x for which (${poly(Bc)})<sup>${poly(Ec)}</sup> = 1?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        // |b|^e = 1 needs |b| = 1 or e = 0, so these are all the candidates; then work out each power the long way
        const cand = [p, q, m, n, ...[1, -1].map((s) => (m + n + s * Math.sqrt(S.D1)) / 2)], found = [];
        for (const x of cand) {
          if (found.some((y) => Math.abs(y - x) < 1e-9)) continue;
          const b = Bf(x), e = E(x);
          if (Math.abs(b) < 1e-12) continue;
          let v;
          if (b < 0) { if (Math.abs(e - Math.round(e)) > 1e-9) continue; v = (Math.round(e) % 2 === 0 ? 1 : -1) * Math.abs(b) ** e; } else v = b ** e;
          if (Math.abs(v - 1) < 1e-9) found.push(x);
        }
        return ask === 'count' ? (found.length === ans ? '' : `found ${found.length}`) : near(sum(found), ans, 'sum');
      },
      solution: `A power b<sup>e</sup> equals 1 in exactly three ways: the base is 1; the exponent is 0 and the base is not 0; or the base is −1 and the exponent is an even integer. `
        + `Base 1: ${poly(Bc)} = 1 means ${poly([m * n - 2, -(m + n), 1])} = 0, whose discriminant ${S.D1} is positive, so it gives two solutions${S.intOne ? `, x = ${r1} and x = ${r2}` : `, adding up to ${m + n}`}. `
        + `Exponent 0: ${poly(Ec)} = 0 at x = ${p} and x = ${q}; ${zeroText}. `
        + `Base −1: ${poly(Bc)} = −1 means ${poly([m * n, -(m + n), 1])} = 0, so x = ${orList(negs)}; ${negText}. `
        + (ask === 'count' ? `Counting each x once, there are <b>${ans}</b> solutions.`
          : `Counting each x once, the solutions are ${S.intOne ? '' : `the two base-1 ones (adding up to ${m + n})${others.length ? ' and ' : ''}`}${others.length ? listing(others.map(num)) : ''}, so the sum is <b>${num(ans)}</b>.`),
    };
  },
  // log_a b + log_b a given, and ab (or a/b): the log is a ratio of whole numbers, then a and b are powers of one base
  (d, ctx) => {
    const IJ = [[2, 1], [3, 1], [4, 1], [3, 2], [5, 2], [5, 3], [4, 3]];
    const [k, [i, j], given, ask] = pick(ctx, 'logpair', [[2, 3, 5, 6, 7, 10], IJ, ['prod', 'quot'], ['sum', 'diff']], (k, [i, j]) => k ** (i + j) <= 2e6);
    const a = k ** i, b = k ** j, G = given === 'prod' ? a * b : a / b, ans = ask === 'sum' ? a + b : a - b, e = given === 'prod' ? i + j : i - j;
    const one = (c, v) => `${c === 1 ? '' : c}${v}`;
    const wrong = (ask === 'sum' ? [k ** (i + 1) + b, a + k ** (j + 1), k ** (i - 1) + b, a + k ** (j - 1), G, a - b] : [a + b, k ** (i + 1) - b, a - k ** (j - 1), k ** (i - 1) - b, a - k ** (j + 1), G]).filter((w) => w > 0);
    return {
      topic: LE, rank: 19,
      text: `Real numbers a and b with a > b > 1 satisfy log<sub>a</sub> b + log<sub>b</sub> a = ${fr(cut(i * i + j * j, i * j))} and ${given === 'prod' ? 'ab' : over('a', 'b')} = ${num(G)}. What is ${ask === 'sum' ? 'a + b' : 'a − b'}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const la = Math.log(a), lb = Math.log(b);
        if (Math.abs(lb / la + la / lb - (i * i + j * j) / (i * j)) > 1e-9 || !(a > b && b > 1)) return 'a and b do not fit';
        return (given === 'prod' ? a * b : a / b) === G ? '' : 'the second condition fails';
      },
      solution: `Write t = log<sub>a</sub> b; then log<sub>b</sub> a = 1/t, so t + 1/t = ${fr(cut(i * i + j * j, i * j))}. `
        + `Multiplying by ${i * j}t gives ${i * j}t<sup>2</sup> − ${i * i + j * j}t + ${i * j} = 0, which factors as (${one(i, 't')} − ${j})(${one(j, 't')} − ${i}) = 0, so t = ${fr(cut(j, i))} or t = ${fr(cut(i, j))}. `
        + `Since a > b > 1, log<sub>a</sub> b is less than 1, so t = ${fr(cut(j, i))}, which means b = a<sup>${j}/${i}</sup>. `
        + (given === 'prod' ? `Then ab = a<sup>1 + ${j}/${i}</sup> = a<sup>${i + j}/${i}</sup> = ${num(G)} = ${sup(k, e)}, so a = ${sup(k, i)} = ${num(a)} and b = ${sup(k, j)} = ${num(b)}. `
          : `Then ${over('a', 'b')} = a<sup>1 − ${j}/${i}</sup> = a<sup>${i - j}/${i}</sup> = ${num(G)} = ${sup(k, e)}, so a = ${sup(k, i)} = ${num(a)} and b = ${sup(k, j)} = ${num(b)}. `)
        + `So ${ask === 'sum' ? 'a + b' : 'a − b'} = <b>${num(ans)}</b>.`,
    };
  },
  // the product of the solutions of x^(log_k x) = k^j·x^m (and two cousins): a quadratic in log_k x, and Vieta
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['basic', 'shift', 'plus']);
    const disc = (m, j, c) => ({ basic: m * m + 4 * j, shift: (1 - m) ** 2 + 4 * j, plus: c * c + 4 * j }[form]);
    const [k, m, j, c] = pick(c2, `logprod-${form}`, [[2, 3, 5, 10], range(1, 5), range(1, 12), [1, 2, 3]],
      (k, m, j, c) => !isSq(disc(m, j, c)) && k ** j <= 1e6 && (form === 'plus' ? m === 1 : c === 1));
    const sL = { basic: m, shift: m - 1, plus: -c }[form], pw = (e) => (e >= 0 ? [k ** e, 1] : [1, k ** -e]), ans = pw(sL), K = num(k ** j);
    const xm = m === 1 ? 'x' : sup('x', m), L2 = sup('L', 2), lg = `log<sub>${k}</sub> x`;
    const text = {
      basic: `x<sup>${lg}</sup> = ${K}${xm}`, shift: `(${k}x)<sup>${lg}</sup> = ${K}${xm}`, plus: `x<sup>${lg} + ${c}</sup> = ${K}`,
    }[form];
    const quad = { basic: expr([1, L2], [-m, 'L'], [-j, '']), shift: expr([1, L2], [1 - m, 'L'], [-j, '']), plus: expr([1, L2], [c, 'L'], [-j, '']) }[form];
    const sides = {
      basic: `the left side becomes L·L = ${L2} and the right side ${j} + ${m === 1 ? '' : m}L`,
      shift: `the left side becomes (1 + L)·L and the right side ${j} + ${m === 1 ? '' : m}L`,
      plus: `the left side becomes (L + ${c})·L and the right side ${j}`,
    }[form];
    return {
      topic: LE, rank: 20,
      text: `What is the product of all positive real numbers x that satisfy ${text}?`,
      answer: fchoices(d, ans, [[k ** j, 1], pw(-sL), pw(sL + 1), pw(sL - 1), [Math.abs(sL), 1], [j, 1]]),
      check: () => {
        const D = disc(m, j, c), b = { basic: -m, shift: 1 - m, plus: c }[form], Ls = [(-b + Math.sqrt(D)) / 2, (-b - Math.sqrt(D)) / 2];
        for (const Lv of Ls) {
          const x = k ** Lv, lhs = { basic: Lv * Lv, shift: (1 + Lv) * Lv, plus: (Lv + c) * Lv }[form], rhs = j + (form === 'plus' ? 0 : m * Lv);
          // both sides of the equation, compared through their logs base k (the numbers themselves can be huge)
          if (Math.abs(lhs - rhs) > 1e-9 || Math.abs(Math.log(x) / Math.log(k) - Lv) > 1e-9) return 'a root does not solve the equation';
        }
        return near(k ** (Ls[0] + Ls[1]), val(ans), 'product');
      },
      solution: `Take logarithms base ${k} of both sides, writing L = ${lg}, so that x = ${k}<sup>L</sup>: ${sides}, so ${quad} = 0. `
        + `Its discriminant, ${disc(m, j, c)}, is positive, so there are two values of L, one for each solution x = ${k}<sup>L</sup>; they aren’t nice numbers, and they don’t need to be. `
        + `The product of the two solutions is ${k}<sup>L₁</sup>·${k}<sup>L₂</sup> = ${k}<sup>L₁ + L₂</sup>, and by Vieta L₁ + L₂ = ${num(sL)}. `
        + `So the product is ${k}<sup>${num(sL)}</sup> = <b>${fr(ans)}</b>.`,
    };
  },
  // ordered pairs (a, b) from 2 to N with log_a b a whole number, a rational number, or either log whole
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['int', 'rat', 'either']);
    const [N] = pick(c2, `logcount-${form}`, [[30, 40, 50, 60, 64, 80, 100, 120, 150, 200]]);
    const pows = (a) => { const out = []; for (let v = a; v <= N; v *= a) out.push(v); return out; };
    const sq = isqrt(N), I = sum(range(2, N).map((a) => pows(a).length));
    const perfect = (c) => range(2, isqrt(c)).some((b) => pows(b).includes(c));
    const groups = range(2, N).filter((c) => !perfect(c)).map(pows), big = groups.filter((g) => g.length > 1), singles = groups.length - big.length;
    const R = sum(groups.map((g) => g.length ** 2)), E = 2 * I - (N - 1), ans = { int: I, rat: R, either: E }[form];
    const lines = range(2, sq).map((a) => `a = ${a}: ${pows(a).length}`).join(', ');
    const wrong = { int: [I - (N - 1), I + 1, E, I + sq, I - 1], rat: [I, E, R - (N - 1), R + big.length, R - 1], either: [2 * I, I, E - (N - 1), R, E + 1] }[form];
    const rule = { int: 'a whole number', rat: 'a rational number', either: '' }[form];
    return {
      topic: LE, rank: { int: 20, rat: 23, either: 21 }[form],
      text: form === 'either' ? `How many ordered pairs (a, b) of integers with 2 ≤ a ≤ ${N} and 2 ≤ b ≤ ${N} make at least one of log<sub>a</sub> b and log<sub>b</sub> a a whole number?`
        : `How many ordered pairs (a, b) of integers with 2 ≤ a ≤ ${N} and 2 ≤ b ≤ ${N} make log<sub>a</sub> b ${rule}?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        // prime exponents of each number; b is a power of a, or both are powers of one number, compared through them
        const ex = (v) => { const out = {}; for (let f = 2; f <= v; f++) while (v % f === 0) { out[f] = (out[f] || 0) + 1; v /= f; } return out; };
        const E2 = range(0, N).map((v) => (v >= 2 ? ex(v) : null));
        const power = (a, b) => { let v = a; while (v < b) v *= a; return v === b; };
        const prop = (a, b) => { const ps = [...new Set([...Object.keys(E2[a]), ...Object.keys(E2[b])])], p0 = ps[0]; return ps.every((p) => (E2[a][p] || 0) * (E2[b][p0] || 0) === (E2[b][p] || 0) * (E2[a][p0] || 0)); };
        let cnt = 0;
        for (let a = 2; a <= N; a++) for (let b = 2; b <= N; b++) if (form === 'int' ? power(a, b) : form === 'rat' ? prop(a, b) : power(a, b) || power(b, a)) cnt++;
        return cnt === ans ? '' : `counted ${cnt}`;
      },
      solution: {
        int: `log<sub>a</sub> b is a whole number k exactly when b = a<sup>k</sup>, and b ≥ 2 forces k ≥ 1. `
          + `So for each a, count its powers a, a<sup>2</sup>, a<sup>3</sup>, … up to ${N}: ${lines}. `
          + `Every a from ${sq + 1} to ${N} has only b = a, which is ${N - sq} more. `
          + `In all, ${sum(range(2, sq).map((a) => pows(a).length))} + ${N - sq} = <b>${I}</b>.`,
        rat: `log<sub>a</sub> b = r/s (whole numbers r, s > 0) means a<sup>r</sup> = b<sup>s</sup>, and that happens exactly when a and b are both powers of one number c that is not itself a perfect power. `
          + `So sort the numbers 2 to ${N} into groups by that c: ${big.map((g) => g.join(', ')).join('; ')}; and each of the other ${singles} numbers is alone. `
          + `Any two numbers from one group work (in either order, or the same number twice), and two from different groups never do. `
          + `So the count is the sum of the squares of the group sizes: ${big.map((g) => `${g.length}<sup>2</sup>`).join(' + ')} + ${singles} = <b>${R}</b>.`,
        either: `One of the two logs is a whole number exactly when one of a and b is a power of the other (with exponent at least 1). `
          + `Pairs with b a power of a: for each a, count a, a<sup>2</sup>, … up to ${N} (${lines}, and 1 each for a from ${sq + 1} to ${N}), ${I} in all. `
          + `By symmetry ${I} pairs have a a power of b, and the ${N - 1} pairs with a = b are in both lists (two different numbers can’t each be a power of the other). `
          + `So the total is 2·${I} − ${N - 1} = <b>${E}</b>.`,
      }[form],
    };
  },
];

// ======================================================================================================================
// Integer parameters in quadratics: how many whole-number values of a parameter make the roots behave
// ======================================================================================================================
const IP = 'Integer parameters in quadratics';
const intParams = [
  // both roots of x² ∓ ax + (ka + m) integers: eliminate a, factor (r ∓ k)(s ∓ k) = k² + m
  (d, ctx) => {
    const [ask, c2] = turn(ctx, ['count', 'sum']);
    const [sg, k, m] = pick(c2, `introots-${ask}`, [['minus', 'plus'], [2, 3, 4, 5, 6], range(-8, 8)], (sg, k, m) => {
      const N = k * k + m;
      return N !== 0 && !(sg === 'minus' && k === 2 && m === 0) && Math.abs(N) <= 64 && divisorCount(Math.abs(N)) >= 3;
    });
    const N = k * k + m, pairs = [];
    for (let e = -Math.abs(N); e <= Math.abs(N); e++) if (e !== 0 && N % e === 0 && e <= N / e) pairs.push([e, N / e]);
    const aOf = ([e, f]) => (sg === 'minus' ? e + f + 2 * k : 2 * k - e - f), as = [...new Set(pairs.map(aOf))].sort((x, y) => x - y);
    const count = as.length, total = sum(as), ans = ask === 'count' ? count : total;
    const posPairs = pairs.filter(([e]) => e > 0), posAs = [...new Set(posPairs.map(aOf))], tau = divisorCount(Math.abs(N));
    const wrong = ask === 'count' ? [posAs.length, tau, 2 * tau, count + 1, count - 1] : [sum(posAs), sum(pairs.map(aOf)) + sum(pairs.filter(([e, f]) => e !== f).map(aOf)), total + 2 * k, total - 2 * k, count];
    const eq = expr([1, X2], [sg === 'minus' ? -1 : 1, 'ax'], [k, 'a'], [m, '']), rk = shift('r', sg === 'minus' ? -k : k), sk = shift('s', sg === 'minus' ? -k : k);
    return {
      topic: IP, rank: 22,
      text: ask === 'count' ? `For how many integers a are both roots of ${eq} = 0 integers?` : `What is the sum of all integers a for which both roots of ${eq} = 0 are integers?`,
      answer: fchoices(d, ans, wrong),
      check: () => {
        const good = [];
        for (let a = -200; a <= 200; a++) {
          const D = a * a - 4 * (k * a + m);
          if (isSq(D) && (a + isqrt(D)) % 2 === 0) good.push(a);
        }
        return ask === 'count' ? (good.length === ans ? '' : `found ${good.length}`) : (sum(good) === ans ? '' : `found sum ${sum(good)}`);
      },
      solution: `Call the roots r and s. By Vieta, r + s = ${sg === 'minus' ? 'a' : '−a'} and rs = ${expr([k, 'a'], [m, ''])}. `
        + `Eliminate a: rs = ${sg === 'minus' ? '' : '−'}${k}(r + s)${signed(m)}, so rs ${sg === 'minus' ? '−' : '+'} ${k}r ${sg === 'minus' ? '−' : '+'} ${k}s + ${k * k} = ${num(N)}, which factors as (${rk})(${sk}) = ${num(N)}. `
        + `So ${rk} and ${sk} are two integers with product ${num(N)}: ${pairs.map(([e, f]) => `${paren(e)}·${paren(f)}`).join(', ')}. `
        + `Each pair gives a = ${sg === 'minus' ? `(${rk}) + (${sk}) + ${2 * k}` : `${2 * k} − (${rk}) − (${sk})`}: ${listing(pairs.map(aOf).map(num))}. `
        + (ask === 'count' ? `${as.length < pairs.length ? 'Some of these repeat, so there' : 'There'} are <b>${count}</b> such integers a.` : `${as.length < pairs.length ? 'Counting each value once, they' : 'They'} add up to <b>${num(total)}</b>.`),
    };
  },
  // ordered pairs (b, c) for which neither x² + bx + kc nor x² + cx + kb (or with 2bx, 2cx) has two different (or any)
  // real roots: both discriminant conditions together bound b and c, then count c for each b
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['two', 'none']);
    const [style, k] = pick(c2, 'discpairs', [['plain', 'double'], [2, 3, 5, 6, 7, 8, 9, 10, 11]], (style, k) => { const K = style === 'plain' ? 4 * k : k; return K >= 5 && K <= 12; });
    const K = style === 'plain' ? 4 * k : k, ok2 = (b, c, strict) => (strict ? b * b < K * c && c * c < K * b : b * b <= K * c && c * c <= K * b);
    const span = (strict) => range(1, K).map((b) => {
      const lo = Math.max(1, strict ? Math.floor((b * b) / K) + 1 : Math.ceil((b * b) / K)), hi = strict ? (isSq(K * b) ? isqrt(K * b) - 1 : isqrt(K * b)) : isqrt(K * b);
      return [b, lo, hi, Math.max(0, hi - lo + 1)];
    });
    const strict = form === 'none', rows = span(strict), count = sum(rows.map((r) => r[3])), other = sum(span(!strict).map((r) => r[3]));
    const diag = range(1, K).filter((b) => ok2(b, b, strict)).length;
    const lines = rows.map(([b, lo, hi, n]) => (n ? `b = ${b}: c = ${lo}${hi > lo ? ` to ${hi}` : ''} (${n})` : `b = ${b}: none`)).join('; ');
    const lin = (v) => (style === 'plain' ? `${v}x` : `2${v}x`), rel = strict ? '&lt;' : '≤';
    const disc = style === 'plain' ? `b<sup>2</sup> − ${4 * k}c` : `(2b)<sup>2</sup> − 4·${k}c`;
    return {
      topic: IP, rank: K <= 8 ? 20 : 21,
      text: `How many ordered pairs (b, c) of positive integers are there for which neither ${X2} + ${lin('b')} + ${k}c = 0 nor ${X2} + ${lin('c')} + ${k}b = 0 has ${form === 'two' ? 'two different real solutions' : 'a real solution'}?`,
      answer: fchoices(d, count, [other, (count + diag) / 2, count + 1, count - 1, K * K]),
      check: () => {
        // straight from the discriminants of the two equations as written
        const bad = (B, C) => { const D = style === 'plain' ? B * B - 4 * k * C : 4 * B * B - 4 * k * C; return strict ? D < 0 : D <= 0; };
        let n = 0;
        for (let b = 1; b <= 200; b++) for (let c = 1; c <= 200; c++) if (bad(b, c) && bad(c, b)) n++;
        return n === count ? '' : `counted ${n}`;
      },
      solution: `${form === 'two' ? '“Not two different real solutions” means the discriminant is not positive' : '“No real solution” means the discriminant is negative'}: the first has discriminant ${disc}, so b<sup>2</sup> ${rel} ${K}c, and in the same way c<sup>2</sup> ${rel} ${K}b. `
        + `Together these keep both numbers small: b<sup>4</sup> ≤ ${K * K}c<sup>2</sup> ≤ ${K * K}·${K}b, so b<sup>3</sup> ≤ ${K ** 3} and b ≤ ${K}, and in the same way c ≤ ${K}. `
        + `For each b, c runs from the smallest whole number ${strict ? 'above' : 'at least'} b<sup>2</sup>/${K} to the largest ${strict ? 'below' : 'at most'} √(${K}b): ${lines}. `
        + `Adding these up gives <b>${count}</b> pairs.`,
    };
  },
  // how many integers k put both roots of x² − kx + c strictly inside a window
  (d, ctx) => {
    const [form, c2] = turn(ctx, ['between', 'above']);
    const win = (c, e) => { const k0 = isqrt(4 * c) + 1, k1 = Math.floor((e * e + c - 1) / e); return [k0, k1, k1 - k0 + 1]; };
    const [c, e] = pick(c2, `window-${form}`, [range(6, 60), range(1, 12)], (c, e) => {
      if (form === 'between' ? e * e <= c : e * e >= c) return false;
      const n = win(c, e)[2];
      return n >= 2 && n <= 7 && (isSq(c) || c % e === 0);
    });
    const [k0, k1, count] = win(c, e), U = cut(e * e + c, e), Uint = U[1] === 1, sqc = isSq(c);
    const ks = range(k0, k1), shown = count <= 6 ? listing(ks.map(String)) : `${k0}, ${k0 + 1}, …, ${k1}`;
    return {
      topic: IP, rank: 21,
      text: `For how many integers k does ${X2} − kx + ${c} = 0 have two different real solutions that are both ${form === 'between' ? `strictly between 0 and ${e}` : `greater than ${e}`}?`,
      answer: fchoices(d, count, [count + 1, count + 2, count - 1, count + (sqc ? 1 : 0) + (Uint ? 1 : 0) + 1, k1]),
      check: () => {
        let n = 0;
        for (let k = -200; k <= 200; k++) {
          const D = k * k - 4 * c;
          if (D <= 0) continue;
          // roots (k ± √D)/2, compared with whole numbers exactly: (k − √D)/2 > t ⇔ k − 2t > 0 and D < (k − 2t)²
          const above = (t) => k - 2 * t > 0 && D < (k - 2 * t) ** 2, below = (t) => 2 * t - k > 0 && D < (2 * t - k) ** 2;
          if (form === 'between' ? above(0) && below(e) : above(e)) n++;
        }
        return n === count ? '' : `counted ${n}`;
      },
      solution: `Let f(x) = ${X2} − kx + ${c}, an upward parabola with its vertex at x = k/2. `
        + `Two different real roots need k<sup>2</sup> > ${4 * c}, and positive roots need k > 0, so k > ${sqc ? `${2 * isqrt(c)} (k = ${2 * isqrt(c)} itself gives a double root, not two different ones)` : `√${4 * c}, which is about ${num(Math.sqrt(4 * c), 2)}`}; so k ≥ ${k0}. `
        + (form === 'between'
          ? `Both roots below ${e} needs f(${e}) > 0 with the vertex to the left of ${e}: ${e * e} − ${e}k + ${c} > 0 gives k &lt; ${fr(U)}${Uint ? `, and k = ${U[0]} would put a root exactly at ${e}` : ''}. The vertex condition, k/2 &lt; ${e}, then holds as well. `
          : `Both roots above ${e} needs f(${e}) > 0 with the vertex to the right of ${e}: ${e * e} − ${e}k + ${c} > 0 gives k &lt; ${fr(U)}${Uint ? `, and k = ${U[0]} would put a root exactly at ${e}` : ''}. The vertex condition, k/2 > ${e}, already follows from k > ${sqc ? 2 * isqrt(c) : `√${4 * c}`}. `)
        + `So k can be ${shown}, which is <b>${count}</b> integers.`,
    };
  },
];

export const topAlgebra = {
  [FE]: functional,
  [CY]: cyclic,
  [LY]: layers,
  [RC]: rootsCond,
  [BV]: best,
  [HF]: hidden,
  [LE]: logs,
  [IP]: intParams,
};
