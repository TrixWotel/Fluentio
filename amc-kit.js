// What the AMC 10 problems share: five choices in increasing order, fractions and surds that read well, and
// family(), which makes a topic's different question types take turns.
import { num, frac, gcd } from '../kit/bank.js';

export const ord = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
export const range = (a, b, step = 1) => { const out = []; for (let v = a; v <= b; v += step) out.push(v); return out; };
export const digitSum = (n) => String(n).split('').reduce((s, c) => s + +c, 0);

// five choices: the answer, then wrong ones (skipping repeats), topped up with near misses; sorted like the AMC.
// values are numbers, or fractions as [p, q]. An answer that isn't a number is a mistake in the question, so it stops
// here (the near misses around it would never end).
export function choices(d, correct, wrongs, show = (v) => num(v, 4)) {
  const val = (v) => (Array.isArray(v) ? v[0] / v[1] : v), same = (a, b) => Math.abs(val(a) - val(b)) < 1e-9;
  if (!Number.isFinite(val(correct))) throw new Error(`choices: the answer is ${correct}, not a number`);
  const list = [correct];
  for (const w of wrongs) if (list.length < 5 && Number.isFinite(val(w)) && !list.some((v) => same(v, w)) && (val(correct) < 0 || val(w) >= 0)) list.push(w);
  const unit = Array.isArray(correct) ? null : Math.max(1, Math.round(Math.abs(correct) / 10));
  for (let k = 1; list.length < 5; k++) {
    for (const s of d.shuffle([1, -1])) {
      const cand = Array.isArray(correct) ? [correct[0] + s * k, correct[1]] : correct + s * k * unit;
      if (list.length < 5 && val(cand) >= 0 && !list.some((v) => same(v, cand))) list.push(cand);
    }
  }
  list.sort((a, b) => val(a) - val(b));
  return { kind: 'choice', choices: list.map(show), correct: list.findIndex((v) => same(v, correct)) };
}
export const showFrac = (v) => (Array.isArray(v) ? frac(v[0], v[1]) : num(v, 4));

// five choices given as [value, how it reads], for answers like 2√3 that aren't plain numbers (or "infinitely
// many", with a big value so it sorts last). The wrong ones must give four different values.
export function labelled(correct, wrongs) {
  const list = [correct];
  for (const w of wrongs) if (list.length < 5 && Number.isFinite(w[0]) && !list.some((x) => Math.abs(x[0] - w[0]) < 1e-9)) list.push(w);
  if (list.length < 5) throw new Error('labelled: fewer than four different wrong answers');
  list.sort((a, b) => a[0] - b[0]);
  return { kind: 'choice', choices: list.map((x) => x[1]), correct: list.indexOf(correct) };
}

// c√r in simplest form, as [value, how it reads]: surd(2, 12) is 4√3, surd(1, 9) is 3
export function surd(c, r) {
  let out = 1, inside = r;
  for (let f = 2; f * f <= inside; f++) while (inside % (f * f) === 0) { inside /= f * f; out *= f; }
  const coef = c * out;
  return [coef * Math.sqrt(inside), inside === 1 ? num(coef, 0) : `${coef === 1 ? '' : coef === -1 ? '−' : num(coef, 0)}√${inside}`];
}
// p/q·√r (or p/q when r is 1), in lowest terms, as [value, how it reads]
export function fracSurd(p, q, r = 1) {
  const [c, inside] = (() => { let o = 1, i = r; for (let f = 2; f * f <= i; f++) while (i % (f * f) === 0) { i /= f * f; o *= f; } return [o, i]; })();
  p *= c;
  const g = gcd(p, q) || 1; p /= g; q /= g;
  const top = inside === 1 ? num(p, 0) : `${p === 1 ? '' : num(p, 0)}√${inside}`;
  return [(p / q) * Math.sqrt(inside), q === 1 ? top : `<span class="fr"><span>${top}</span><span>${q}</span></span>`];
}

// a topic's question types make one kind of question in the bank: its k-th turn is type k mod (how many), and that
// type learns which of its own turns this is, so the second time round it can walk on to new numbers
export function family(problems) {
  return (d, ctx) => {
    const i = ctx.k % problems.length;
    return problems[i](d, { ...ctx, k: Math.floor(ctx.k / problems.length), salt: `${ctx.salt}-${i}` });
  };
}
