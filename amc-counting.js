// Counting: 20 topics modelled on ideas from past AMC 10 counting questions, with new numbers and wording. Each topic
// has several kinds of question on its idea (a different unknown, a different setup, or the count worked backward), and
// check() counts the answer again another way, by brute force wherever it can.
import { combo, num, frac, gcd, choose } from '../kit/bank.js';
import { choices, labelled, range } from './amc-kit.js';

const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const odds = (n) => range(1, n, 2).filter((v) => v <= n);
const doubleFact = (n) => odds(n).reduce((p, v) => p * v, 1);      // (n − 1)·(n − 3)·…·1, the pairings of n + 1 people
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const PLACES = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
const NAMES = ['Ada', 'Ben', 'Cleo', 'Dev', 'Eli', 'Fay', 'Gus', 'Hana', 'Ivo', 'Juno', 'Kemal', 'Lise'];
const Cap = (s) => s[0].toUpperCase() + s.slice(1);
const svg = (w, h, label, body) => `<svg class="tri" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`;
const list = (items, and = 'and') => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} ${and} ${items.at(-1)}`);
// a, a + 1, …, b, written out in full when it is short (1, 2 and 3, not 1, 2, …, 3); f writes each one
const upto = (a, b, f = (v) => v, and = 'and') => (b - a <= 3 ? list(range(a, b).map(f), and) : `${f(a)}, ${f(a + 1)}, …, ${f(b)}`);
// b to the power e, written without a power of 1 (10, not 10¹)
const power = (b, e) => (e === 1 ? `${b}` : `${b}<sup>${e}</sup>`);
// the chain o, 2o, 4o, … up to N
const chainOf = (o, N) => { const c = []; for (let v = o; v <= N; v *= 2) c.push(v); return c.join(', '); };
// the orders of six colored pieces with counts[i] of color i, written 6!/(3!·3!)
const sixOrders = (counts) => { const f = counts.filter((c) => c > 1).map((c) => `${c}!`); return `6!/${f.length > 1 ? `(${f.join('·')})` : f[0]}`; };
// why a symmetry keeps the paintings it does, with counts[i] pieces of color i: each of its cycles must be one color.
// Two cycles of three (a turn by a third of a circle):
const keptByThirds = (counts, colors, what) => (counts.length === 2 && counts[0] === 3 && counts[1] === 3
  ? `Here that means one cycle ${colors[0]} and the other ${colors[1]}, either way round: 2`
  : `That needs two colors with three ${what} each, so here it keeps none`);
// three swapped pairs (a hexagon turned halfway, or flipped through the midpoints of two sides):
function keptByPairs(counts, colors, what) {
  const odd = counts.findIndex((c) => c % 2);
  if (odd >= 0) return `${Cap(colors[odd])} has ${WORDS[counts[odd]]} ${counts[odd] === 1 ? what.replace(/s$/, '') : what}, which can’t fill whole pairs, so here it keeps none`;
  if (counts.every((c) => c === 2)) return 'Here the three colors take one pair each, in 3! = 6 ways';
  const big = counts.findIndex((c) => c === 4), small = counts.findIndex((c) => c === 2);
  return `Here two pairs are ${colors[big]} and one is ${colors[small]}, with 3 choices for the ${colors[small]} pair: 3`;
}
// two swapped pairs and two pieces that stay put (a flip of the triangle, or of the hexagon through two corners):
function keptByFlip(counts, colors, what) {
  const cases = [];
  counts.forEach((_, i) => counts.forEach((__, j) => {
    if (j < i) return;
    const left = counts.slice();
    left[i] -= 2; left[j] -= 2;
    if (left.some((v) => v < 0)) return;
    const rest = left.flatMap((v, c) => Array(v).fill(c)), pairWays = i === j ? 1 : 2, restWays = rest[0] === rest[1] ? 1 : 2;
    const pairs = i === j ? `both pairs ${colors[i]}` : `one pair ${colors[i]} and the other ${colors[j]}, either way round`;
    const stay = rest[0] === rest[1] ? `the two ${what} that stay put both ${colors[rest[0]]}` : `the two ${what} that stay put ${colors[rest[0]]} and ${colors[rest[1]]}, either way round`;
    cases.push({ text: `${pairs}, with ${stay}`, pairWays, restWays, ways: pairWays * restWays });
  }));
  const all = cases.reduce((s, c) => s + c.ways, 0);
  if (!cases.length) return 'The two swapped pairs can’t both be filled with one color each, so here it keeps none';
  if (counts.every((c) => c === 2)) return `Here the two pairs take two of the three colors, either way round, and the two ${what} that stay put take the third: 3·2 = 6`;
  if (cases.length === 1) { const [c] = cases; return `Here that means ${c.text}: ${c.ways > 1 && c.pairWays > 1 && c.restWays > 1 ? '2·2 = ' : ''}${c.ways}`; }
  return `Here that means ${cases.map((c) => `${c.text} (${c.ways} way${c.ways === 1 ? '' : 's'})`).join('; or ')}: ${all} in all`;
}
// every ordering of 0 … n − 1 (Heap’s algorithm), handed to f (one array, changed in place)
function eachPerm(n, f) {
  const a = range(0, n - 1), c = Array(n).fill(0);
  f(a);
  for (let i = 0; i < n;) {
    if (c[i] < i) { const j = i % 2 ? c[i] : 0; [a[j], a[i]] = [a[i], a[j]]; f(a); c[i]++; i = 0; } else { c[i] = 0; i++; }
  }
}
// pairings of the people in `left` where ok(p, q) says p and q may be a pair
const pairings = (left, ok) => { if (!left.length) return 1; const [p, ...rest] = left; return rest.filter((q) => ok(p, q)).reduce((s, q) => s + pairings(rest.filter((x) => x !== q), ok), 0); };
// the most numbers from 1 … N with no two of them clashing
function largest(N, clash) {
  let best = 0;
  const set = [], go = (x) => {
    if (set.length + (N - x + 1) <= best) return;
    if (x > N) { best = set.length; return; }
    if (set.every((y) => !clash(x, y))) { set.push(x); go(x + 1); set.pop(); }
    go(x + 1);
  };
  go(1);
  return best;
}
// the points where lines y = ax + b (whole a and b) cross, counted exactly
const ratio = (p, q) => { if (q < 0) { p = -p; q = -q; } const g = gcd(p, q) || 1; return `${p / g}/${q / g}`; };
function crossings(lines) {
  const pts = new Set();
  lines.forEach(([a1, b1], i) => lines.slice(i + 1).forEach(([a2, b2]) => {
    if (a1 !== a2) pts.add(ratio(b2 - b1, a1 - a2) + ',' + ratio(a1 * (b2 - b1) + b1 * (a1 - a2), a1 - a2));
  }));
  return pts.size;
}

// the six disks of a triangle: 0 on top, 1 and 2 in the middle row, 3, 4 and 5 along the bottom; its turns and flips
const DISKS = [[150, 36], [120, 88], [180, 88], [90, 140], [150, 140], [210, 140]];
const TURN = [5, 2, 4, 0, 1, 3], FLIP = [0, 2, 1, 5, 4, 3], then = (p, q) => p.map((x) => q[x]);
const SYMMETRIES = [range(0, 5), TURN, then(TURN, TURN), FLIP, then(FLIP, TURN), then(FLIP, then(TURN, TURN))];
const moved = (col, p) => { const out = []; p.forEach((to, from) => { out[to] = col[from]; }); return out.join(''); };
// the turns (and flips) of a regular n-gon, as where each corner goes: turns by j steps, then flips
const dihedral = (n, flips) => [...range(0, n - 1).map((j) => range(0, n - 1).map((i) => (i + j) % n)), ...(flips ? range(0, n - 1).map((j) => range(0, n - 1).map((i) => (j - i + n) % n)) : [])];
const orbits = (all, perms) => new Set(all.map((s) => perms.map((p) => moved(s.split(''), p)).sort()[0])).size;
// every string of color digits with counts[i] of color i
const paintings = (counts) => { const all = [], fill = (s, left) => { if (s.length === counts.reduce((a, b) => a + b, 0)) { all.push(s); return; } left.forEach((c, i) => { if (c) { left[i]--; fill(s + i, left); left[i]++; } }); }; fill('', counts.slice()); return all; };
const corners = (n, R, cx, cy) => range(0, n - 1).map((i) => { const t = (2 * Math.PI * i) / n - Math.PI / 2; return [+(cx + R * Math.cos(t)).toFixed(1), +(cy + R * Math.sin(t)).toFixed(1)]; });
const beads = (n, label) => { const pts = corners(n, 78, 110, 104); return svg(220, 206, label, `<polygon class="side" points="${pts.map((p) => p.join(',')).join(' ')}"/>` + pts.map(([x, y]) => `<circle class="side" cx="${x}" cy="${y}" r="17"/>`).join('')); };
// a round piece cut into n wedges (with a circle in the middle when `hub` is its radius)
const wheel = (n, hub, label) => {
  const R = 95, c = 110;
  return svg(220, 220, label, `<circle class="side" cx="${c}" cy="${c}" r="${R}"/>` + (hub ? `<circle class="side" cx="${c}" cy="${c}" r="${hub}"/>` : '')
    + range(0, n - 1).map((i) => { const t = (2 * Math.PI * i) / n - Math.PI / 2; return `<line class="side" x1="${(c + (hub || 0) * Math.cos(t)).toFixed(1)}" y1="${(c + (hub || 0) * Math.sin(t)).toFixed(1)}" x2="${(c + R * Math.cos(t)).toFixed(1)}" y2="${(c + R * Math.sin(t)).toFixed(1)}"/>`; }).join(''));
};
// every way to write 1 … 9 in a 3 × 3 grid with consecutive numbers in squares that share a side (grid[square] = number)
const SNAKES = (() => {
  const near = (p, q) => Math.abs((p % 3) - (q % 3)) + Math.abs(Math.floor(p / 3) - Math.floor(q / 3)) === 1, out = [];
  const go = (path) => {
    if (path.length === 9) { const g = []; path.forEach((sq, i) => { g[sq] = i + 1; }); out.push(g); return; }
    for (let q = 0; q < 9; q++) if (!path.includes(q) && near(path.at(-1), q)) go([...path, q]);
  };
  for (let s = 0; s < 9; s++) go([s]);
  return out;
})();
const CENTERS = [...new Set(SNAKES.map((g) => g[4]))].sort((a, b) => a - b);
const SQUARE_KIND = (sq) => (sq === 4 ? 'center' : sq % 2 === 0 ? 'corner' : 'edge');   // squares 0 … 8, row by row
// L left-handers and r·L right-handers, the left-handers winning pct% more games: the L that leave the right-handers
// enough wins for their own games against each other, and those of them where every count is a whole number
function league(r, pct) {
  const fits = [], whole = [];
  for (let L = 1; L <= 80; L++) {
    const G = choose((r + 1) * L, 2), WR = (G * 100) / (200 + pct), WL = G - WR;
    if (WR < choose(r * L, 2)) continue;
    fits.push(L);
    if ((G * 100) % (200 + pct) === 0 && WL >= choose(L, 2) && WL <= choose(L, 2) + r * L * L) whole.push(L);
  }
  return { fits, whole };
}
// the setups with exactly one answer (the original problem’s 2 : 1 and 40% is left out)
const LEAGUES = [2, 3, 4].flatMap((r) => [20, 25, 30, 40, 50, 60, 75, 80, 100].map((pct) => [r, pct])).filter(([r, pct]) => {
  if (r === 2 && pct === 40) return false;
  const { fits, whole } = league(r, pct), wholeFits = fits.filter((L) => (choose((r + 1) * L, 2) * 100) % (200 + pct) === 0);
  return fits.length > 0 && fits.every((L, i) => L === i + 1) && wholeFits.length === 1 && whole.length === 1 && whole[0] === wholeFits[0] && whole[0] >= 3;
});
// the ways to split 3, 4 or 5 horses into j groups that share a place, j = 1 to n, and why
const SPLITS = {
  3: ['all three together', 'a pair and a lone horse, C(3, 2) = 3 ways', 'all apart'],
  4: ['all four together', 'three and one, 4 ways, or two pairs, 3 ways', 'one pair and two lone horses, C(4, 2) = 6 ways', 'all apart'],
  5: ['all five together', 'four and one, 5 ways, or three and two, C(5, 3) = 10 ways', 'three and two lone horses, C(5, 3) = 10 ways, or two pairs and a lone horse, 5·3 = 15 ways', 'one pair and three lone horses, C(5, 2) = 10 ways', 'all apart'],
};
const COPRIME = [[3, 5], [3, 7], [4, 7], [5, 7], [3, 8], [5, 8], [4, 9], [5, 9], [7, 9], [3, 10], [7, 10], [5, 11], [6, 7], [4, 11]];

export const counting = {
  'Handshakes': [
    // the guests who know nobody shake hands with everyone
    (d, ctx) => {
      const [a, b] = combo(ctx, [range(12, 24), range(6, 14)], (a, b) => a !== 20 && b !== 10 && choose(b, 2) + a * b !== 245);
      const n = a + b, shakes = choose(b, 2) + a * b;
      const [who, greet] = d.pick([['former teammates', 'bump fists'], ['cousins', 'hug'], ['old classmates', 'wave']]);
      return {
        topic: 'Handshakes', rank: 4,
        text: `At a reunion of ${n} guests, ${a} are ${who} who all know one another, and each of the other ${b} guests knows nobody there. Two guests who know each other ${greet}; two guests who have never met shake hands. How many handshakes take place?`,
        answer: choices(d, shakes, [a * b, a * b + b * (b - 1), choose(n, 2), 2 * a * b, choose(b, 2)]),
        check: () => { let c = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (j >= a) c++; return c === shakes ? '' : `counted ${c}, said ${shakes}`; },
        solution: `Only the ${b} guests who know nobody shake hands. Each of them shakes hands with all ${a} ${who}: ${a}·${b} = ${a * b}. They also shake hands with one another: C(${b}, 2) = ${choose(b, 2)}. In all, ${a * b} + ${choose(b, 2)} = <b>${num(shakes)}</b>.`,
      };
    },
    // everyone shakes hands with everyone
    (d, ctx) => {
      const [n] = combo(ctx, [range(8, 40)]), h = choose(n, 2), where = d.pick(['a club meeting', 'a science fair', 'a family reunion', 'a chess camp']);
      return {
        topic: 'Handshakes', rank: 1,
        text: `At ${where}, each of the ${n} people there shakes hands exactly once with each of the others. How many handshakes take place?`,
        answer: choices(d, h, [n * (n - 1), n * n, h + n, choose(n - 1, 2), 2 * n]),
        check: () => { let c = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) c++; return c === h ? '' : `counted ${c}, said ${h}`; },
        solution: `Each of the ${n} people shakes ${n - 1} hands, which makes ${n}·${n - 1} = ${num(n * (n - 1))} handshakes counted. But that counts every handshake twice, once for each of the two people in it, so there are ${num(n * (n - 1))}/2 = <b>${num(h)}</b>.`,
      };
    },
    // working back from the number of handshakes
    (d, ctx) => {
      const [n] = combo(ctx, [range(9, 45)]), h = choose(n, 2);
      return {
        topic: 'Handshakes', rank: 2,
        text: `At a party, everyone shook hands exactly once with everyone else, and there were ${num(h)} handshakes in all. How many people were at the party?`,
        answer: choices(d, n, [n - 1, n + 1, Math.round(Math.sqrt(h)), Math.round(h / n), 2 * n]),
        check: () => { const fit = range(2, 200).filter((m) => choose(m, 2) === h); return fit.length === 1 && fit[0] === n ? '' : `people that fit: ${fit}`; },
        tip: 'With m people there are m(m − 1)/2 handshakes: set that equal to the total, double it, and look for two numbers in a row that multiply to it.',
        solution: `With m people there are m(m − 1)/2 handshakes, so m(m − 1)/2 = ${num(h)}. Doubling, m(m − 1) = 2·${num(h)} = ${num(2 * h)}, two whole numbers in a row multiplied together. That is a little less than m<sup>2</sup>, so m is just over √${num(2 * h)} ≈ ${num(Math.sqrt(2 * h), 1)}: try m = ${n}. Indeed ${n - 1}·${n} = ${num(2 * h)}, so there were <b>${n}</b> people.`,
      };
    },
    // two teams shake hands with each other, and the referees with every player
    (d, ctx) => {
      const [p, q, r] = combo(ctx, [range(5, 15), range(5, 15), [2, 3, 4]], (p, q) => p <= q), total = p * q + r * (p + q);
      return {
        topic: 'Handshakes', rank: 2,
        text: `After a match, each of the ${p} players on one team shakes hands with each of the ${q} players on the other team. Then each of the ${r} referees shakes hands with every player. Nobody else shakes hands. How many handshakes are there in all?`,
        answer: choices(d, total, [p * q, p * q + r, choose(p + q, 2), p * q + r * (p + q) + choose(r, 2), p * q + r * q]),
        check: () => {
          const team = [...Array(p).fill('A'), ...Array(q).fill('B'), ...Array(r).fill('R')];
          let c = 0;
          for (let i = 0; i < team.length; i++) for (let j = i + 1; j < team.length; j++) if ((team[i] === 'A' && team[j] === 'B') || (team[i] !== 'R') !== (team[j] !== 'R')) c++;
          return c === total ? '' : `counted ${c}, said ${total}`;
        },
        solution: `Between the two teams there are ${p}·${q} = ${p * q} handshakes. Each of the ${r} referees shakes hands with all ${p} + ${q} = ${p + q} players, which makes ${r}·${p + q} = ${r * (p + q)}. In all, ${p * q} + ${r * (p + q)} = <b>${num(total)}</b>.`,
      };
    },
  ],

  'Separated neighbors': [
    // letters with no alphabet neighbors side by side (inclusion–exclusion over the neighbor pairs)
    (d, ctx) => {
      const [n, start] = combo(ctx, [[5, 6], range(0, 20)]);
      const letters = range(0, n - 1).map((i) => String.fromCharCode(65 + start + i));
      // forcing k of the n − 1 neighbor pairs together: if they form j runs, (n − k)! orders of the blocks, 2^j ways to flip them
      const terms = range(0, n - 1).map((k) => (k ? fact(n - k) * range(1, k).reduce((s, j) => s + choose(k - 1, j - 1) * choose(n - k, j) * 2 ** j, 0) : fact(n)));
      const ways = terms.reduce((s, t, k) => s + (k % 2 ? -t : t), 0), name = d.pick(['Ravi', 'Noor', 'Tess', 'Omar']);
      // how the term for k comes out: the choices of k pairs sorted by how many runs they make, and the orders for each
      const runs = (k) => range(1, k).map((j) => [j, choose(k - 1, j - 1) * choose(n - k, j)]).filter(([, c]) => c);
      const orders = (k, j) => `${n - k}!·${power(2, j)} = ${fact(n - k) * 2 ** j}`, runWord = (j) => (j === 1 ? 'one run' : `${WORDS[j]} runs`);
      const termWhy = (k) => {
        const rs = runs(k);
        if (rs.length === 1 && rs[0][1] === 1) return `For k = ${k}, the only choice makes ${runWord(rs[0][0])}, with ${orders(k, rs[0][0])} orders.`;
        if (rs.length === 1) return `For k = ${k}, each of the ${rs[0][1]} choices makes ${runWord(rs[0][0])}, with ${orders(k, rs[0][0])} orders, so ${rs[0][1]}·${fact(n - k) * 2 ** rs[0][0]} = ${num(terms[k])}.`;
        return `For k = ${k}, of the C(${n - 1}, ${k}) = ${choose(n - 1, k)} choices, ${list(rs.map(([j, c]) => `${c} make${c === 1 ? 's' : ''} ${runWord(j)} (${orders(k, j)} orders each)`))}, so ${rs.map(([j, c]) => num(c * fact(n - k) * 2 ** j)).join(' + ')} = ${num(terms[k])}.`;
      };
      return {
        topic: 'Separated neighbors', rank: 8,
        text: `${name} has ${WORDS[n]} letter tiles: ${list(letters)}. In how many orders can the tiles be laid in a row so that no two tiles side by side are neighbors in the alphabet (like ${letters[1]} and ${letters[2]})?`,
        answer: choices(d, ways, n === 5 ? [10, 12, 16, 24] : [72, 84, 96, 120]),
        check: () => {
          const dp = Array.from({ length: 1 << n }, () => Array(n).fill(0));
          for (let i = 0; i < n; i++) dp[1 << i][i] = 1;
          for (let m = 1; m < 1 << n; m++) for (let i = 0; i < n; i++) if (dp[m][i]) for (let j = 0; j < n; j++) if (!((m >> j) & 1) && Math.abs(i - j) !== 1) dp[m | (1 << j)][j] += dp[m][i];
          const c = dp[(1 << n) - 1].reduce((s, v) => s + v, 0);
          return c === ways ? '' : `counted ${c}, said ${ways}`;
        },
        solution: `Use inclusion–exclusion on the ${n - 1} pairs of alphabet neighbors (${list(range(1, n - 1).map((i) => `${letters[i - 1]}${letters[i]}`))}). Forcing k of those pairs to sit together glues the tiles into blocks; a run of glued pairs is one block that can read forward or backward, so if the k pairs make j runs there are (${n} − k)!·2<sup>j</sup> orders. For each k, add these up over every choice of k pairs; inclusion–exclusion then adds the totals for even k and subtracts those for odd k. With no pairs forced (k = 0) there are ${n}! = ${num(terms[0])} orders. ${range(1, n - 1).map(termWhy).join(' ')} So the count is ${terms.map((t, k) => (k ? (k % 2 ? ' − ' : ' + ') : '') + num(t)).join('')} = <b>${num(ways)}</b>.`,
      };
    },
    // two people who must stand side by side
    (d, ctx) => {
      const [n] = combo(ctx, [[5, 6, 7, 8]]), names = d.shuffle(NAMES).slice(0, n), [A, B] = names, ways = 2 * fact(n - 1);
      return {
        topic: 'Separated neighbors', rank: 2,
        text: `${Cap(WORDS[n])} friends, ${list(names)}, line up in a row for a photo. In how many orders can they stand so that ${A} and ${B} are side by side?`,
        answer: choices(d, ways, [fact(n - 1), fact(n), fact(n) - ways, 2 * fact(n - 2), (n - 1) * fact(n - 2)]),
        check: () => { let c = 0; eachPerm(n, (a) => { if (Math.abs(a.indexOf(0) - a.indexOf(1)) === 1) c++; }); return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `Glue ${A} and ${B} together into one block. Then ${n - 1} things line up, in ${n - 1}! = ${num(fact(n - 1))} orders, and the block can be ${A}–${B} or ${B}–${A}, so there are 2·${num(fact(n - 1))} = <b>${num(ways)}</b> orders.`,
      };
    },
    // two pairs of rivals, neither pair side by side
    (d, ctx) => {
      const [n] = combo(ctx, [[5, 6, 7, 8]]), names = d.shuffle(NAMES).slice(0, n), [A, B, C, D] = names;
      const all = fact(n), one = 2 * fact(n - 1), both = 4 * fact(n - 2), ways = all - 2 * one + both;
      return {
        topic: 'Separated neighbors', rank: 6,
        text: `${Cap(WORDS[n])} people, ${list(names)}, line up in a row. ${A} and ${B} are rivals, and so are ${C} and ${D}; no two rivals may stand side by side. In how many orders can they line up?`,
        answer: choices(d, ways, [all - 2 * one, all - one, all - 2 * one + both / 2, all - one + both, both]),
        check: () => { let c = 0; eachPerm(n, (a) => { if (Math.abs(a.indexOf(0) - a.indexOf(1)) !== 1 && Math.abs(a.indexOf(2) - a.indexOf(3)) !== 1) c++; }); return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `Use inclusion–exclusion, starting from all ${n}! = ${num(all)} orders. Gluing ${A} and ${B} into one block, which can face either way, gives 2·${n - 1}! = ${num(one)} orders with them side by side, and the same number have ${C} and ${D} side by side. Gluing both pairs gives 2·2·${n - 2}! = ${num(both)} orders, which were subtracted twice, so they are added back once. So ${num(all)} − 2·${num(one)} + ${num(both)} = <b>${num(ways)}</b>.`,
      };
    },
    // one pair together, another pair apart
    (d, ctx) => {
      const [n] = combo(ctx, [[5, 6, 7, 8]]), names = d.shuffle(NAMES).slice(0, n), [A, B, C, D] = names;
      const one = 2 * fact(n - 1), both = 4 * fact(n - 2), ways = one - both;
      return {
        topic: 'Separated neighbors', rank: 5,
        text: `${Cap(WORDS[n])} children, ${list(names)}, stand in a line for the bus. ${A} and ${B} insist on standing side by side, but ${C} and ${D} refuse to. In how many orders can the children line up?`,
        answer: choices(d, ways, [one, one - both / 2, both, fact(n) - one, one + both]),
        check: () => { let c = 0; eachPerm(n, (a) => { if (Math.abs(a.indexOf(0) - a.indexOf(1)) === 1 && Math.abs(a.indexOf(2) - a.indexOf(3)) !== 1) c++; }); return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `Glue ${A} and ${B} into one block, which can face either way, so they stand side by side in 2·${n - 1}! = ${num(one)} orders. Take away the orders where ${C} and ${D} stand side by side too, found by gluing them as well, 2·2·${n - 2}! = ${num(both)}. So ${num(one)} − ${num(both)} = <b>${num(ways)}</b>.`,
      };
    },
  ],

  'Sets with no multiples': [
    // the smallest number that can be in a biggest such set
    (d, ctx) => {
      const [N] = combo(ctx, [[10, 11, 14, 15, 16, 17, 18, 19, 20]]);
      const size = Math.ceil(N / 2), chains = range(1, N, 2).map((o) => { const c = []; for (let v = o; v <= N; v *= 2) c.push(v); return c; });
      let least = Infinity, example = null;
      const walk = (i, chosen) => {
        if (i === chains.length) { const m = Math.min(...chosen); if (m < least) { least = m; example = [...chosen].sort((x, y) => x - y); } return; }
        for (const v of chains[i]) if (chosen.every((u) => v % u && u % v)) walk(i + 1, [...chosen, v]);
      };
      walk(0, []);
      const name = d.pick(['Lena', 'Hugo', 'Priya', 'Sam']);
      return {
        topic: 'Sets with no multiples', rank: 14,
        text: `${name} picks ${size} different numbers from 1, 2, 3, …, ${N} so that none of the picked numbers is a multiple of another picked number. Over all the ways to do this, what is the smallest number that can be one of the ${size}?`,
        answer: choices(d, least, [1, 2, 3, 5, 6, 7, 8].filter((v) => v !== least)),
        check: () => {
          const clash = range(1, N).map((x) => range(1, N).reduce((m, y) => (y !== x && (x % y === 0 || y % x === 0) ? m | (1 << (y - 1)) : m), 0));
          let best = Infinity;
          for (let m = 0; m < 1 << N; m++) {
            let bits = 0;
            for (let t = m; t; t &= t - 1) bits++;
            if (bits !== size) continue;
            let ok = true, low = 0;
            for (let i = 0; i < N && ok; i++) if ((m >> i) & 1) { if (!low) low = i + 1; if (m & clash[i]) ok = false; }
            if (ok) best = Math.min(best, low);
          }
          return best === least && least === 4 ? '' : `brute force says ${best}, said ${least}`;
        },
        tip: 'Write each number as an odd number times a power of 2: a set this big takes exactly one number from each chain, so ask what the chains of 1, 3 and 9 allow.',
        solution: `Write each number as an odd number times a power of 2. The ${size} odd numbers up to ${N} each start a chain (${chainOf(1, N)}; ${chainOf(3, N)}; and so on), and any two numbers in one chain divide each other, so ${name} takes exactly one number from every chain. Say the picks from the chains of 1, 3 and 9 are 2<sup>a</sup>, 3·2<sup>b</sup> and 9·2<sup>c</sup>. The first can’t divide the second, so a > b; likewise b > c ≥ 0. So a ≥ 2 and b ≥ 1, which rules out 1, 2 and 3, while the choice ${list(example.map(String))} shows that 4 can be used. The answer is <b>4</b>.`,
      };
    },
    // the most numbers that can be picked
    (d, ctx) => {
      const [N] = combo(ctx, [range(10, 20)]), size = Math.ceil(N / 2), low = Math.floor(N / 2) + 1;
      return {
        topic: 'Sets with no multiples', rank: 6,
        text: `What is the largest number of numbers that can be chosen from 1, 2, 3, …, ${N} so that no chosen number is a multiple of another chosen number?`,
        answer: choices(d, size, [Math.floor(N / 2), size + 1, size - 1, size + 2, odds(N).length + 1]),
        check: () => { const best = largest(N, (x, y) => x % y === 0 || y % x === 0); return best === size ? '' : `search found ${best}, said ${size}`; },
        solution: `Write every number as an odd number times a power of 2. The odd numbers 1, 3, 5, … up to ${N} start ${size} chains (${chainOf(1, N)}; ${chainOf(3, N)}; and so on), and in a chain the smaller number always divides the larger, so at most one number per chain: at most ${size}. The numbers from ${low} to ${N} reach that, since any multiple of one of them, other than itself, is at least twice it and so bigger than ${N}. The answer is <b>${size}</b>.`,
      };
    },
    // how many picks force a pair where one divides the other
    (d, ctx) => {
      const [N] = combo(ctx, [range(10, 20)]), size = Math.ceil(N / 2), low = Math.floor(N / 2) + 1;
      return {
        topic: 'Sets with no multiples', rank: 10,
        text: `What is the smallest number k such that any k different numbers chosen from 1, 2, 3, …, ${N} must include two numbers where one is a multiple of the other?`,
        answer: choices(d, size + 1, [size, size + 2, Math.floor(N / 2), N - 1, odds(N).length + 2]),
        check: () => { const best = largest(N, (x, y) => x % y === 0 || y % x === 0); return best + 1 === size + 1 ? '' : `the biggest set without such a pair has ${best}`; },
        solution: `The ${size} numbers from ${low} to ${N} have no such pair, so ${size} picks are not enough. But every number is an odd number times a power of 2, and there are only ${size} odd numbers up to ${N}, so any ${size + 1} numbers put two in the same chain (like ${chainOf(3, N)}), where the smaller divides the larger. So k = <b>${size + 1}</b>.`,
      };
    },
  ],

  'Crossing lines': [
    // the possible numbers of crossing points of three or five lines
    (d, ctx) => {
      const [n, ask] = combo(ctx, [[3, 5], ['sum', 'count']]);
      const values = n === 3 ? [0, 1, 2, 3] : [0, 1, 4, 5, 6, 7, 8, 9, 10], total = values.reduce((s, v) => s + v, 0), value = ask === 'sum' ? total : values.length;
      const wrong = n === 3 ? (ask === 'sum' ? [3, 4, 5, 7, 10] : [2, 3, 5, 6]) : (ask === 'sum' ? [55, 53, 52, 47, 45] : [11, 10, 8, 7]);
      return {
        topic: 'Crossing lines', rank: n === 3 ? 3 : 11,
        text: `${Cap(WORDS[n])} different straight lines are drawn in a plane, and N is the number of points that lie on two or more of them. ${ask === 'sum' ? 'What is the sum of all the different values that N can take?' : 'How many different values can N take?'}`,
        answer: choices(d, value, wrong),
        check: () => {
          const lines = [];
          for (const [a, b] of [[0, 1], [1, 0], [1, 1], [1, -1], [1, 2]]) for (let c = -2; c <= 2; c++) lines.push([a, b, c]);
          const part = (p, q) => { const g = gcd(p, q) || 1, s = q < 0 ? -1 : 1; return `${(s * p) / g}/${(s * q) / g}`; };
          const seen = new Set(), L = lines.length;
          const pick = (from, chosen) => {
            if (chosen.length === n) {
              const pts = new Set();
              for (let x = 0; x < n; x++) for (let y = x + 1; y < n; y++) {
                const [a1, b1, c1] = chosen[x], [a2, b2, c2] = chosen[y], det = a1 * b2 - a2 * b1;
                if (det) pts.add(part(c1 * b2 - c2 * b1, det) + ',' + part(a1 * c2 - a2 * c1, det));
              }
              seen.add(pts.size);
              return;
            }
            for (let i = from; i < L; i++) pick(i + 1, [...chosen, lines[i]]);
          };
          pick(0, []);
          const got = [...seen].sort((p, q) => p - q).join(', ');
          return got === values.join(', ') ? '' : `a search through many sets of lines found ${got}`;
        },
        solution: n === 3
          ? `All three parallel gives N = 0, and all three through one point gives N = 1. If exactly two are parallel, the third crosses each of them: N = 2. Otherwise every two cross at different points: N = 3. ${ask === 'sum' ? 'So the sum is 0 + 1 + 2 + 3 = <b>6</b>.' : 'So N is 0, 1, 2 or 3: <b>4</b> values.'}`
          : `All five parallel gives N = 0, and all five through one point gives N = 1. In every other case N is at least 4. If two or more lines are parallel, the other lines cross them in at least 4 different points. If no two are parallel, then either some point has 3 or more of the lines through it (and a line missing that point crosses those 3 lines in 3 more points), or all C(5, 2) = 10 crossings are different. Every value from 4 to 10 happens. Four parallel lines and one more give 4; four lines through a point and one more give 5; three parallel lines crossed by two parallel lines give 6; three parallel lines crossed by two lines meeting elsewhere give 7. Three lines through a point and two more give 8, one parallel pair gives 9, and nothing special gives 10. ${ask === 'sum' ? 'So the sum is 0 + 1 + 4 + 5 + 6 + 7 + 8 + 9 + 10 = <b>50</b>.' : 'So N is one of 0, 1, 4, 5, 6, 7, 8, 9 and 10: <b>9</b> values.'}`,
      };
    },
    // the most crossing points n lines can have
    (d, ctx) => {
      const [n] = combo(ctx, [range(6, 30)]), most = choose(n, 2);
      return {
        topic: 'Crossing lines', rank: 1,
        text: `In a plane, ${n} straight lines are drawn. What is the greatest possible number of points where two of the lines cross?`,
        answer: choices(d, most, [n * (n - 1), n * n, most + n, choose(n - 1, 2), 2 * n]),
        check: () => { const c = crossings(range(1, n).map((i) => [i, i * i])); return c === most ? '' : `${n} lines in general position cross at ${c} points`; },
        solution: `Two lines cross at most once, so there are at most as many crossings as pairs of lines, C(${n}, 2) = ${n}·${n - 1}/2 = ${num(most)}. That many happen when no two lines are parallel and no three pass through one point. The answer is <b>${num(most)}</b>.`,
      };
    },
    // some of the lines parallel
    (d, ctx) => {
      const [n, k] = combo(ctx, [range(7, 14), [2, 3, 4, 5]], (n, k) => k <= n - 3), all = choose(n, 2), lost = choose(k, 2), N = all - lost;
      return {
        topic: 'Crossing lines', rank: 3,
        text: `In a plane, ${n} straight lines are drawn. Exactly ${k} of them are parallel to one another, no other two lines are parallel, and no three of the lines pass through one point. How many points lie on two of the lines?`,
        answer: choices(d, N, [all, all - k, choose(n - k, 2), all - 2 * lost, N + 1]),
        check: () => { const c = crossings([...range(1, k).map((c) => [0, c]), ...range(1, n - k).map((i) => [i, i * i])]); return c === N ? '' : `counted ${c}, said ${N}`; },
        solution: `If no two lines were parallel, every pair would cross at its own point: C(${n}, 2) = ${num(all)}. The ${k} parallel lines make C(${k}, 2) = ${lost} ${lost === 1 ? 'pair that never meets' : 'pairs that never meet'}, and every other pair still crosses at its own point. So ${num(all)} − ${lost} = <b>${num(N)}</b>.`,
      };
    },
    // some of the lines through one point
    (d, ctx) => {
      const [n, m] = combo(ctx, [range(6, 14), [3, 4, 5, 6]], (n, m) => m <= n - 2), all = choose(n, 2), joined = choose(m, 2), N = all - joined + 1;
      return {
        topic: 'Crossing lines', rank: 4,
        text: `In a plane, ${n} straight lines are drawn, no two of them parallel. Exactly ${m} of the lines pass through one common point, and apart from that point, no three of the lines meet at a single point. How many points lie on two or more of the lines?`,
        answer: choices(d, N, [all, all - joined, all - m + 1, N + m - 1, all - joined - 1]),
        check: () => { const c = crossings([...range(1, m).map((s) => [s, 0]), ...range(m + 1, n).map((s) => [s, s ** 3 + 1])]); return c === N ? '' : `counted ${c}, said ${N}`; },
        solution: `With no three lines meeting, the C(${n}, 2) = ${num(all)} pairs would cross at ${num(all)} different points. The C(${m}, 2) = ${joined} pairs among the ${m} lines through the common point all cross at that one point, so those ${joined} crossings count as just 1. That leaves ${num(all)} − ${joined} + 1 = <b>${num(N)}</b> points.`,
      };
    },
  ],

  'Lattice squares': [
    // squares that fit under a steep line
    (d, ctx) => {
      const [k, M] = combo(ctx, [[5, 6, 7, 8, 11, 12, 13], [4, 5, 6]]);
      const c = Math.sqrt(k), tops = range(1, M).map((a) => Math.floor(c * a));
      const sized = (extra) => range(1, M).map((s) => range(0, M - s).reduce((t, a) => t + Math.max(0, Math.floor(c * a) - s + 1 + extra), 0));
      const bySize = sized(0), count = bySize.reduce((s, v) => s + v, 0), loose = sized(1).reduce((s, v) => s + v, 0);
      // for each size that fits, the choices of b for a = 1 … M − s added up
      const sizeSums = range(1, M).filter((s) => bySize[s - 1]).map((s) => `side ${s} gives ${range(1, M - s).map((a) => Math.max(0, tops[a - 1] - s + 1)).join(' + ')} = ${bySize[s - 1]} (a from 1 to ${M - s})`);
      return {
        topic: 'Lattice squares', rank: 11,
        text: `The region R is bounded by the line y = x√${k}, the line y = −0.1 and the line x = ${M}.1. How many squares with sides parallel to the axes and all four corners at lattice points (points whose coordinates are integers) fit completely inside R?`,
        answer: choices(d, count, [bySize[0], loose, count - bySize[1], count + M]),
        check: () => {
          let t = 0;
          for (let s = 1; s <= M + 2; s++) for (let a = -3; a <= M + 2; a++) for (let b = -3; b <= Math.ceil(c * M) + 3; b++) {
            const corners = [[a, b], [a + s, b], [a, b + s], [a + s, b + s]];
            if (corners.every(([x, y]) => y >= -0.1 && x <= M + 0.1 && y <= c * x)) t++;
          }
          return t === count ? '' : `counted ${t}, said ${count}`;
        },
        solution: `A square with bottom-left corner (a, b) and side s fits when b ≥ 0, a + s ≤ ${M}, and its top-left corner (a, b + s) is under the line, that is b + s &lt; a√${k}. At x = ${upto(1, M)} the line is at heights whose whole parts are ${tops.join(', ')}, so for each a there are ⌊a√${k}⌋ − s + 1 choices of b (when that is positive). By size, ${sizeSums.join('; ')}. In all, ${bySize.filter(Boolean).join(' + ')} = <b>${num(count)}</b> squares.`,
      };
    },
    // squares of every size in a rectangle of graph paper
    (d, ctx) => {
      const [m, n] = combo(ctx, [range(3, 8), range(3, 10)], (m, n) => m <= n);
      const terms = range(1, m).map((s) => (m - s + 1) * (n - s + 1)), count = terms.reduce((a, b) => a + b, 0);
      const cell = Math.min(260 / n, 150 / m), W = n * cell, H = m * cell;
      const grid = `<rect class="side" x="10" y="10" width="${W.toFixed(1)}" height="${H.toFixed(1)}"/>` + range(1, n - 1).map((i) => `<line class="side" style="stroke-width:1" x1="${(10 + i * cell).toFixed(1)}" y1="10" x2="${(10 + i * cell).toFixed(1)}" y2="${(10 + H).toFixed(1)}"/>`).join('')
        + range(1, m - 1).map((j) => `<line class="side" style="stroke-width:1" x1="10" y1="${(10 + j * cell).toFixed(1)}" x2="${(10 + W).toFixed(1)}" y2="${(10 + j * cell).toFixed(1)}"/>`).join('');
      return {
        topic: 'Lattice squares', rank: 3,
        text: `A rectangle is drawn on graph paper, ${n} squares wide and ${m} squares tall, as shown. How many squares of any size, with sides along the grid lines, can be found in it?`,
        figure: svg(Math.ceil(W + 20), Math.ceil(H + 20), `A ${n} by ${m} grid`, grid),
        answer: choices(d, count, [m * n, count - m * n, range(1, m).reduce((s, v) => s + v * v, 0), (m + 1) * (n + 1), count + m]),
        check: () => { let t = 0; for (let s = 1; s <= m; s++) for (let x = 0; x + s <= n; x++) for (let y = 0; y + s <= m; y++) t++; return t === count ? '' : `counted ${t}, said ${count}`; },
        solution: `A square of side s can be placed with its left edge in ${n} − s + 1 places and its top edge in ${m} − s + 1 places, so there are (${n + 1} − s)(${m + 1} − s) squares of side s. For s = ${upto(1, m)} that is ${terms.map((t, i) => `${n - i}·${m - i}`).join(' + ')} = ${terms.join(' + ')} = <b>${num(count)}</b>.`,
      };
    },
    // squares inside a right triangle
    (d, ctx) => {
      const [a] = combo(ctx, [range(4, 13)]), terms = range(1, Math.floor(a / 2)).map((s) => choose(a - 2 * s + 2, 2)), count = terms.reduce((x, y) => x + y, 0);
      return {
        topic: 'Lattice squares', rank: 8,
        text: `How many squares with sides parallel to the axes and all four corners at lattice points lie inside the triangle with corners (0, 0), (${a}, 0) and (0, ${a})? (A square may touch the sides of the triangle.)`,
        answer: choices(d, count, [terms[0], count + terms[0], choose(a + 1, 2), choose(a, 2), count - 1]),
        check: () => { let t = 0; for (let s = 1; s <= a; s++) for (let x = 0; x <= a; x++) for (let y = 0; y <= a; y++) if (x + s + y + s <= a) t++; return t === count ? '' : `counted ${t}, said ${count}`; },
        solution: `A square of side s with its bottom-left corner at (x, y) fits exactly when x ≥ 0, y ≥ 0 and its top-right corner is on or under the line x + y = ${a}, that is x + y ≤ ${a} − 2s. The lattice points with x, y ≥ 0 and x + y ≤ t number (t + 1)(t + 2)/2. For s = ${upto(1, Math.floor(a / 2))} the limit t = ${a} − 2s is ${upto(1, Math.floor(a / 2), (s) => a - 2 * s)}, so the count is ${terms.join(' + ')} = <b>${num(count)}</b>.`,
      };
    },
    // lattice points under a steep line
    (d, ctx) => {
      const [k, M] = combo(ctx, [[2, 3, 5, 6, 7, 8, 10, 11, 12, 13, 14, 15], range(4, 8)]);
      const tops = range(1, M).map((x) => Math.floor(x * Math.sqrt(k))), count = tops.reduce((s, v) => s + v + 1, 0);
      return {
        topic: 'Lattice squares', rank: 5,
        text: `How many points (x, y) with whole-number coordinates satisfy 1 ≤ x ≤ ${M}, y ≥ 0 and y &lt; x√${k}?`,
        answer: choices(d, count, [count - M, count + M, tops.reduce((s, v) => s + v, 0) - M, count + 1]),
        check: () => { let t = 0; for (let x = 1; x <= M; x++) for (let y = 0; y * y < k * x * x; y++) t++; return t === count ? '' : `counted ${t}, said ${count}`; },
        tip: 'Count column by column: for each whole number x, count the whole numbers y from 0 up to the last one under the line.',
        solution: `${k} isn’t a perfect square, so x√${k} is never a whole number, and for each x the allowed y are 0, 1, …, ⌊x√${k}⌋, which is ⌊x√${k}⌋ + 1 of them. For x = 1 to ${M} the whole parts are ${tops.join(', ')}, so the count is ${tops.map((v) => v + 1).join(' + ')} = <b>${num(count)}</b>.`,
      };
    },
  ],

  'Colorings up to symmetry': [
    // a triangle of disks with fixed numbers of each color
    (d, ctx) => {
      const [counts] = combo(ctx, [[[2, 2, 2], [4, 1, 1], [3, 3], [2, 2, 1, 1], [4, 2], [3, 1, 1, 1]]]);
      const colors = d.pick([['red', 'blue', 'green', 'yellow'], ['gold', 'silver', 'copper', 'black'], ['white', 'orange', 'purple', 'gray']]);
      const all = paintings(counts), ways = orbits(all, SYMMETRIES);
      const fixed = (p) => all.filter((s) => moved(s.split(''), p) === s).length, turnFix = fixed(TURN), flipFix = fixed(FLIP);
      const paint = list(counts.map((c, i) => `${WORDS[c]} ${colors[i]}`));
      return {
        topic: 'Colorings up to symmetry', rank: 12,
        text: `Six equal disks are arranged in a triangle, as shown. Each disk is painted one color: ${paint}. Two paintings count as the same if turning or flipping the whole triangle carries one onto the other. How many different paintings are there?`,
        figure: svg(300, 176, 'Six disks in a triangle', '<title>Six disks in a triangle</title>' + DISKS.map(([x, y]) => `<circle class="side" cx="${x}" cy="${y}" r="29"/>`).join('')),
        answer: choices(d, ways, [all.length / 6, all.length / 3, all.length / 2, all.length, ways + 2].filter(Number.isInteger)),
        check: () => { const avg = SYMMETRIES.reduce((s, p) => s + fixed(p), 0) / 6; return avg === ways ? '' : `Burnside gives ${avg}, said ${ways}`; },
        solution: `With the triangle held still there are ${sixOrders(counts)} = ${all.length} paintings. The triangle has 6 symmetries, namely leaving it alone, two turns (by 120° and 240°) and three flips. By Burnside’s lemma, the number of different paintings is the average number of paintings that each symmetry leaves unchanged. Leaving it alone keeps all ${all.length}. A turn moves the three corner disks around in a cycle and the three edge disks in another, so all corners must be one color and all edge disks one color. ${keptByThirds(counts, colors, 'disks').replace('one cycle', 'the corners').replace('the other', 'the edge disks')}. A flip swaps two pairs of disks and keeps two disks in place, so each swapped pair must be one color. ${keptByFlip(counts, colors, 'disks')}. Average: (${all.length} + 2·${turnFix} + 3·${flipFix})/6 = ${all.length + 2 * turnFix + 3 * flipFix}/6 = <b>${ways}</b>.`,
      };
    },
    // beads on the corners of a square frame, any colors
    (d, ctx) => {
      const [k, flips] = combo(ctx, [[2, 3, 4, 5, 6], [false, true]]);
      const turns = (k ** 4 + k ** 2 + 2 * k) / 4, ways = flips ? (k ** 4 + 2 * k ** 3 + 3 * k ** 2 + 2 * k) / 8 : turns;
      return {
        topic: 'Colorings up to symmetry', rank: 13,
        text: `Four beads sit at the corners of a square frame, as shown, and each bead is painted one of ${k} colors (colors may repeat). Two paintings count as the same if ${flips ? 'turning or flipping' : 'turning'} the frame carries one onto the other. How many different paintings are there?`,
        figure: beads(4, 'Four beads at the corners of a square'),
        answer: choices(d, ways, [k ** 4, k ** 4 / 4, flips ? turns : (k ** 4 + 2 * k ** 3 + 3 * k ** 2 + 2 * k) / 8, (k ** 4 + 2 * k) / 4, ways + k].filter(Number.isInteger)),
        check: () => {
          const all = range(0, k ** 4 - 1).map((c) => range(0, 3).map((i) => Math.floor(c / k ** i) % k).join(''));
          const got = orbits(all, dihedral(4, flips));
          return got === ways ? '' : `counted ${got}, said ${ways}`;
        },
        solution: `By Burnside’s lemma, the number of different paintings is the average, over the ${flips ? 8 : 4} symmetries of the frame, of the number of paintings each one leaves unchanged. Leaving it alone: ${k}<sup>4</sup> = ${num(k ** 4)}. Turning by 90° or 270° moves every corner to the next, so all four beads must match: ${k} each. Turning by 180° swaps opposite corners, so each opposite pair must match: ${k}<sup>2</sup> = ${k * k}. ${flips ? `The two flips across a diagonal keep two corners and swap the other two, so they keep ${k}<sup>3</sup> = ${k ** 3} paintings each; the two flips across the middle swap two pairs, so they keep ${k}<sup>2</sup> = ${k * k} each. Average: (${num(k ** 4)} + 2·${k} + ${k * k} + 2·${k ** 3} + 2·${k * k})/8 = ${num(8 * ways)}/8 = <b>${num(ways)}</b>.` : `Average: (${num(k ** 4)} + 2·${k} + ${k * k})/4 = ${num(4 * ways)}/4 = <b>${num(ways)}</b>.`}`,
      };
    },
    // the corners of a hexagon with fixed numbers of each color
    (d, ctx) => {
      const [counts, flips] = combo(ctx, [[[3, 3], [4, 2], [2, 2, 2], [3, 2, 1], [4, 1, 1], [2, 2, 1, 1]], [false, true]]);
      const colors = d.pick([['red', 'blue', 'green', 'yellow'], ['black', 'white', 'gold', 'silver'], ['orange', 'purple', 'pink', 'teal']]);
      const all = paintings(counts), perms = dihedral(6, flips), ways = orbits(all, perms);
      const fixed = (p) => all.filter((s) => moved(s.split(''), p) === s).length, [f0, f60, f120, f180] = [0, 1, 2, 3].map((j) => fixed(perms[j]));
      const fc = flips ? fixed(perms[6]) : 0, fe = flips ? fixed(perms[7]) : 0, sum = f0 + 2 * f60 + 2 * f120 + f180 + 3 * fc + 3 * fe;
      return {
        topic: 'Colorings up to symmetry', rank: 14,
        text: `The six corners of a regular hexagon, as shown, are painted: ${list(counts.map((c, i) => `${WORDS[c]} ${colors[i]}`))}. Two paintings count as the same if ${flips ? 'turning or flipping' : 'turning'} the hexagon carries one onto the other. How many different paintings are there?`,
        figure: beads(6, 'A regular hexagon with a bead at each corner'),
        answer: choices(d, ways, [all.length, all.length / 6, all.length / 12, ways + 1, ways - 1, flips ? orbits(all, dihedral(6, false)) : orbits(all, dihedral(6, true))].filter((v) => Number.isInteger(v) && v > 0)),
        check: () => (sum / perms.length === ways ? '' : `Burnside gives ${sum / perms.length}, said ${ways}`),
        solution: `With the hexagon held still there are ${sixOrders(counts)} = ${all.length} paintings. By Burnside’s lemma, the number of different paintings is the average number that each symmetry leaves unchanged, and a painting is unchanged when each cycle of corners the symmetry moves around is one color. Leaving it alone keeps all ${f0}. Turning by 60° or 300° moves all six corners around in one cycle, so it keeps only paintings in a single color, and here none. Turning by 120° or 240° makes two cycles of three corners. ${keptByThirds(counts, colors, 'corners')}. Turning by 180° swaps the three pairs of opposite corners. ${keptByPairs(counts, colors, 'corners')}.${flips ? ` Each of the 3 flips across a line through two opposite corners keeps those two corners and swaps two pairs. ${keptByFlip(counts, colors, 'corners')}. Each of the 3 flips across a line through the midpoints of two opposite sides swaps three pairs. ${keptByPairs(counts, colors, 'corners')}.` : ''} Average: (${f0} + 2·${f60} + 2·${f120} + ${f180}${flips ? ` + 3·${fc} + 3·${fe}` : ''})/${perms.length} = ${sum}/${perms.length} = <b>${ways}</b>.`,
      };
    },
  ],

  'Seating with rules': [
    // twins who may not sit side by side or one behind the other
    (d, ctx) => {
      const [[rows, cols]] = combo(ctx, [[[2, 3], [3, 2], [2, 4], [4, 2], [3, 3]]]);
      const n = rows * cols, seat = (i, j) => i * cols + j, sideBySide = [], behind = [];
      for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { if (j + 1 < cols) sideBySide.push([seat(i, j), seat(i, j + 1)]); if (i + 1 < rows) behind.push([seat(i, j), seat(i + 1, j)]); }
      const count = (edges) => {
        const E = edges.length, touching = range(0, n - 1).reduce((s, v) => s + choose(edges.filter((e) => e.includes(v)).length, 2), 0), apart = choose(E, 2) - touching;
        return { E, touching, apart, one: 2 * E * fact(n - 2), both: 8 * apart * fact(n - 4), ways: fact(n) - 4 * E * fact(n - 2) + 8 * apart * fact(n - 4) };
      };
      const c = count([...sideBySide, ...behind]), rowsOnly = count(sideBySide).ways, ways = c.ways;
      // the seats sorted by how many close neighbors they have, for the pairs of close pairs that share a seat
      const deg = range(0, n - 1).map((v) => [...sideBySide, ...behind].filter((e) => e.includes(v)).length);
      const byDeg = [...new Set(deg)].sort((x, y) => x - y).map((g) => [g, deg.filter((x) => x === g).length]);
      const degText = list(byDeg.map(([g, cnt], i) => (i ? `${cnt} ${cnt === 1 ? 'has' : 'have'} ${g}` : `${cnt} seat${cnt === 1 ? ' has' : 's have'} ${g} close neighbors`)));
      return {
        topic: 'Seating with rules', rank: 14,
        text: `Two pairs of twins and ${WORDS[n - 4]} other children ride in a minibus with ${WORDS[rows]} rows of ${WORDS[cols]} seats. No child may sit right beside his or her twin in the same row, and no child may sit directly behind his or her twin. In how many ways can the ${n} children be seated?`,
        answer: choices(d, ways, [fact(n) - 2 * c.one, fact(n) - c.one, rowsOnly, ways + c.both / 2, ways - c.both / 2]),
        check: () => {
          const close = [...sideBySide, ...behind];
          let t = 0;
          eachPerm(n, (a) => { if (close.every(([u, v]) => (a[u] >> 1 !== a[v] >> 1) || a[u] > 3)) t++; });
          return t === ways ? '' : `counted ${t}, said ${ways}`;
        },
        solution: `Call two seats close if they are side by side in a row or one directly behind the other. There are ${rows}·${cols - 1} = ${rows * (cols - 1)} side-by-side pairs and ${cols}·${rows - 1} = ${cols * (rows - 1)} pairs one behind the other, ${c.E} close pairs in all. Use inclusion–exclusion, starting from the ${n}! = ${num(fact(n))} seatings with no rules. The first twins sit in a close pair in ${c.E}·2·${n - 2}! = ${num(c.one)} seatings (a close pair, the twins either way round in it, and the others anywhere), and the same goes for the second twins. When both sets of twins sit in close pairs, the two close pairs can’t share a seat. A seat with d close neighbors is shared by C(d, 2) pairs of close pairs, and here ${degText}, so ${byDeg.map(([g, cnt]) => `${cnt}·${choose(g, 2)}`).join(' + ')} = ${c.touching} of the C(${c.E}, 2) = ${choose(c.E, 2)} pairs of close pairs share a seat, leaving ${c.apart}. Either set of twins can take either of those two close pairs, each set sits 2 ways round, and the other children sit in ${n - 4}! ways, so there are 2·${c.apart}·2·2·${n - 4}! = ${num(c.both)} such seatings. So ${num(fact(n))} − 2·${num(c.one)} + ${num(c.both)} = <b>${num(ways)}</b>.`,
      };
    },
    // two people who won’t sit next to each other in a row
    (d, ctx) => {
      const [n] = combo(ctx, [range(5, 9)]), [A, B] = d.shuffle(NAMES), all = fact(n), next = 2 * fact(n - 1), ways = all - next;
      return {
        topic: 'Seating with rules', rank: 3,
        text: `${Cap(WORDS[n])} people, including ${A} and ${B}, sit in a row of ${n} chairs at a concert. ${A} and ${B} refuse to sit next to each other. In how many ways can the ${n} people be seated?`,
        answer: choices(d, ways, [all, next, all - fact(n - 1), all - 2 * fact(n - 2), fact(n - 1)]),
        check: () => { let c = 0; eachPerm(n, (a) => { if (Math.abs(a.indexOf(0) - a.indexOf(1)) !== 1) c++; }); return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `Count everything and take away the bad seatings. All seatings: ${n}! = ${num(all)}. With ${A} and ${B} together, glue them into one block, which sits with the other ${n - 2} people in ${n - 1}! = ${num(fact(n - 1))} ways, and the block can be either way round, so there are 2·${num(fact(n - 1))} = ${num(next)} such seatings. So ${num(all)} − ${num(next)} = <b>${num(ways)}</b>.`,
      };
    },
    // a round table, where turning the table changes nothing
    (d, ctx) => {
      const [n, together] = combo(ctx, [range(5, 9), [true, false]]), [A, B] = d.shuffle(NAMES), round = fact(n - 1), side = 2 * fact(n - 2), ways = together ? side : round - side;
      return {
        topic: 'Seating with rules', rank: 5,
        text: `${Cap(WORDS[n])} friends, including ${A} and ${B}, sit around a round table. Seatings that differ only by turning the whole table count as the same. In how many ways can they sit if ${A} and ${B} ${together ? 'must sit next to each other' : 'must not sit next to each other'}?`,
        answer: choices(d, ways, together ? [2 * fact(n - 1), fact(n - 2), round - side, round] : [round, fact(n) - 2 * fact(n - 1), side, round - fact(n - 2)]),
        check: () => {
          let c = 0;
          eachPerm(n - 1, (a) => { const seatB = a.indexOf(0) + 1, next = seatB === 1 || seatB === n - 1; if (next === together) c++; });   // A in seat 0
          return c === ways ? '' : `counted ${c}, said ${ways}`;
        },
        solution: together
          ? `Since turning the table doesn’t matter, seat ${A} first. Then ${B} takes one of the 2 seats beside ${A}, and the other ${n - 2} people fill the remaining seats in ${n - 2}! = ${num(fact(n - 2))} ways, so there are 2·${num(fact(n - 2))} = <b>${num(ways)}</b> seatings.`
          : `Since turning the table doesn’t matter, seat ${A} first; the others then fill the ${n - 1} remaining seats in ${n - 1}! = ${num(round)} ways. ${B} is next to ${A} when ${B} takes one of the 2 seats beside ${A}, and the other ${n - 2} people then sit in ${n - 2}! = ${num(fact(n - 2))} ways, so 2·${num(fact(n - 2))} = ${num(side)} seatings have them side by side. So ${num(round)} − ${num(side)} = <b>${num(ways)}</b>.`,
      };
    },
    // boys and girls alternating in a row
    (d, ctx) => {
      const [[b, g]] = combo(ctx, [[[2, 2], [3, 2], [3, 3], [4, 3], [4, 4], [5, 4]]]), ways = (b === g ? 2 : 1) * fact(b) * fact(g);
      return {
        topic: 'Seating with rules', rank: 2,
        text: `${Cap(WORDS[b])} boys and ${WORDS[g]} girls line up in a row so that boys and girls alternate: no two boys and no two girls stand side by side. In how many ways can they line up?`,
        answer: choices(d, ways, b === g ? [ways / 2, fact(b + g), fact(b) + fact(g), 4 * fact(b) * fact(g)] : [2 * ways, fact(b + g), fact(b) + fact(g), choose(b + g, b)]),
        check: () => { let c = 0; eachPerm(b + g, (a) => { if (a.every((x, i) => !i || (x < b) !== (a[i - 1] < b))) c++; }); return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: b === g
          ? `The row can start with a boy or with a girl: 2 patterns. In each, the ${b} boys fill their places in ${b}! = ${fact(b)} ways and the ${g} girls theirs in ${g}! = ${fact(g)} ways, so there are 2·${fact(b)}·${fact(g)} = <b>${num(ways)}</b> lineups.`
          : `With ${b} boys and ${g} girls the row must start and end with a boy (boy, girl, boy, …, boy): only 1 pattern. The boys fill their places in ${b}! = ${fact(b)} ways and the girls in ${g}! = ${fact(g)} ways, so there are ${fact(b)}·${fact(g)} = <b>${num(ways)}</b> lineups.`,
      };
    },
  ],

  'Number snakes in a grid': [
    // the corners fix the center
    (d, ctx) => {
      const sums = [...new Set(SNAKES.map((g) => g[0] + g[2] + g[6] + g[8]))].filter((s) => s !== 18).sort((x, y) => x - y);
      const [S] = combo(ctx, [sums]), center = 25 - S, name = d.pick(['Kai', 'Mara', 'Jonah', 'Ines']);
      return {
        topic: 'Number snakes in a grid', rank: 8,
        text: `${name} writes the numbers 1 through 9 in a 3 × 3 grid, one in each square, so that every two consecutive numbers (1 and 2, 2 and 3, …, 8 and 9) are in squares that share a side. The four corner squares hold numbers that add up to ${S}. What number is in the center square?`,
        answer: choices(d, center, range(1, 9).filter((v) => v !== center)),
        check: () => { const centers = new Set(SNAKES.filter((g) => g[0] + g[2] + g[6] + g[8] === S).map((g) => g[4])); return centers.size === 1 && centers.has(center) ? '' : `centers found: ${[...centers].join(', ')}`; },
        solution: `Color the grid like a checkerboard, so that the four corners and the center are one color (5 squares) and the other 4 squares the other color. Consecutive numbers are in squares that share a side, so the colors alternate along 1, 2, …, 9, and the odd numbers 1, 3, 5, 7, 9 all get one color and the even numbers 2, 4, 6, 8 the other. Only the first color has five squares, so the five odd numbers fill the corners and the center. Together they hold 1 + 3 + 5 + 7 + 9 = 25, so the center is 25 − ${S} = <b>${center}</b>.`,
      };
    },
    // the center fixes the corners
    (d, ctx) => {
      const [c] = combo(ctx, [CENTERS.filter((v) => v !== 7)]), S = 25 - c, name = d.pick(['Leo', 'Nia', 'Omar', 'Sofia']);
      return {
        topic: 'Number snakes in a grid', rank: 7,
        text: `${name} writes 1 through 9 in a 3 × 3 grid, one number per square, so that consecutive numbers are always in squares that share a side. The center square holds ${c}. What is the sum of the numbers in the four corner squares?`,
        answer: choices(d, S, [20, 25, 45 - c, 20 - c, S + 2, S - 2].filter((v) => v !== S && v > 0)),
        check: () => { const sums = new Set(SNAKES.filter((g) => g[4] === c).map((g) => g[0] + g[2] + g[6] + g[8])); return sums.size === 1 && sums.has(S) ? '' : `corner sums found: ${[...sums]}`; },
        solution: `Color the grid like a checkerboard, with the corners and the center one color (5 squares) and the edge squares the other (4). The numbers 1, 2, …, 9 step from square to neighboring square, so they alternate colors, and the 5-square color must get the odd numbers 1, 3, 5, 7, 9, which add up to 25. The center has ${c}, so the corners add up to 25 − ${c} = <b>${S}</b>.`,
      };
    },
    // where a given number can go
    (d, ctx) => {
      const KINDS = [[1, 'a corner square'], [2, 'an edge square (the middle of a side)'], [3, 'the center square'], [4, 'a corner square or the center'], [5, 'any square']];
      const kindOf = (x) => { const k = new Set(SNAKES.map((g) => SQUARE_KIND(g.indexOf(x)))); return k.has('edge') ? (k.size === 1 ? 1 : 4) : k.has('corner') && k.has('center') ? 3 : k.has('center') ? 2 : 0; };
      const [x] = combo(ctx, [range(1, 9).filter((v) => kindOf(v) === 1 || kindOf(v) === 3)]), right = KINDS[kindOf(x)];
      return {
        topic: 'Number snakes in a grid', rank: 6,
        text: `The numbers 1 through 9 are written in a 3 × 3 grid, one per square, so that consecutive numbers are always in squares that share a side. Where in the grid can the number ${x} be?`,
        answer: labelled(right, KINDS.filter((k) => k !== right)),
        check: () => { const k = new Set(SNAKES.map((g) => SQUARE_KIND(g.indexOf(x)))); const want = x % 2 ? ['corner', 'center'] : ['edge']; return want.every((w) => k.has(w)) && k.size === want.length ? '' : `${x} found in ${[...k]}`; },
        solution: `Color the grid like a checkerboard, with the corners and the center one color (5 squares) and the edge squares the other (4). Consecutive numbers alternate colors, and the 5-square color must take the five odd numbers. ${x % 2 ? `${x} is odd, so it is in a corner or the center, and both really happen in some grids. So <b>${right[1]}</b>.` : `${x} is even, so it must be in one of the 4 edge squares, and every edge square really happens in some grids. So <b>${right[1]}</b>.`}`,
      };
    },
  ],

  'Paths on a cube': [
    // walks along the edges visiting every corner once
    (d, ctx) => {
      const [ask] = combo(ctx, [['back', 'all', 'far']]);
      const ends = [];   // corners are 0 … 7 in binary; neighbors differ in one bit
      const go = (path) => { if (path.length === 8) { ends.push(path.at(-1)); return; } for (const b of [1, 2, 4]) { const q = path.at(-1) ^ b; if (!path.includes(q)) go([...path, q]); } };
      go([0]);
      const all = ends.length, back = ends.filter((e) => [1, 2, 4].includes(e)).length, far = ends.filter((e) => e === 7).length, value = { back, all, far }[ask];
      return {
        topic: 'Paths on a cube', rank: 12,
        text: `A beetle starts at a corner of a cube and crawls along exactly 7 edges, passing through every corner of the cube exactly once (its starting corner included). ${{ back: 'When it stops, it is one edge away from the corner where it started.', all: '', far: 'When it stops, it is at the corner of the cube farthest from where it started.' }[ask]} How many such walks are possible?`.replace('  ', ' '),
        answer: choices(d, value, [3, 6, 9, 12, 18, 24, 36].filter((v) => v !== value)),
        check: () => {
          let total = 0, home = 0, opposite = 0, fixedStart = 0, fixedFar = 0;
          eachPerm(7, (a) => {
            const path = [0, ...a.map((x) => x + 1)];
            for (let i = 0; i < 7; i++) if ([1, 2, 4].indexOf(path[i] ^ path[i + 1]) < 0) return;
            total++;
            if ([1, 2, 4].includes(path[7])) home++;
            if (path[7] === 7) opposite++;
            if (path[1] === 1 && path[2] === 3) { fixedStart++; if (path[7] === 7) fixedFar++; }
          });
          return total === all && home === back && opposite === far && fixedStart === 3 && fixedFar === 1 ? '' : `walks ${total}, back ${home}, far ${opposite}`;
        },
        solution: `The first edge can be any of 3 and the second any of 2, and by symmetry these 6 starts all finish the same number of ways. Say the beetle goes A → B → C around the bottom face, where D is the fourth corner of that face and A′, B′, C′ and D′ are the corners above A, B, C and D. If it goes on to D, it must climb to D′ and then go around the top face either way, ending at C′ or at A′. If it climbs from C to C′ instead, the only way to finish is C′ → B′ → A′ → D′ → D. So each start has exactly 3 finishes, and there are 6·3 = ${all} walks. ${{ back: `A 7-edge walk ends an odd number of edges from the start, so at one of its 3 neighbors or at the far corner (C′ above). Of the 3 finishes for each start, exactly 1 ends at the far corner, so 6 walks end there and ${all} − 6 = <b>${back}</b> end one edge from home.`, all: `So the answer is <b>${all}</b>.`, far: `Of the 3 finishes for each start, exactly 1 ends at the far corner (C′ above), so 6·1 = <b>${far}</b> walks end there.` }[ask]}`,
      };
    },
    // shortest routes along the edges of a box of little cubes
    (d, ctx) => {
      const [[a, b, c]] = combo(ctx, [[[1, 1, 2], [1, 2, 2], [1, 1, 3], [2, 2, 2], [1, 2, 3], [2, 2, 3], [1, 3, 3], [2, 3, 3]]]), n = a + b + c;
      const routes = fact(n) / (fact(a) * fact(b) * fact(c));
      return {
        topic: 'Paths on a cube', rank: 4,
        text: `A box is built from little cubes, ${a} by ${b} by ${c}. An ant crawls along the edges of the little cubes from one corner of the box to the opposite corner, always along a shortest route. How many shortest routes are there?`,
        answer: choices(d, routes, [fact(n), choose(n, a), (a + 1) * (b + 1) * (c + 1), routes / 2, 6].filter((v) => Number.isInteger(v) && v !== routes)),
        check: () => { const ways = (x, y, z) => (x < 0 || y < 0 || z < 0 ? 0 : x + y + z === 0 ? 1 : ways(x - 1, y, z) + ways(x, y - 1, z) + ways(x, y, z - 1)); const w = ways(a, b, c); return w === routes ? '' : `counted ${w}, said ${routes}`; },
        tip: 'A shortest route is a string of steps in the three directions: count the different orders of those steps.',
        solution: `A shortest route takes ${a} step${a > 1 ? 's' : ''} along the first direction, ${b} along the second and ${c} along the third, in some order. The number of orders of ${n} steps with ${a}, ${b} and ${c} of each kind is ${n}!/(${a}!·${b}!·${c}!) = <b>${num(routes)}</b>.`,
      };
    },
    // walks of a given length that may go back and forth
    (d, ctx) => {
      const [[target, L]] = combo(ctx, [[[0, 2], [0, 4], [0, 6], [3, 3], [3, 5], [3, 7]]]);
      const rows = [[1, 0, 0, 0]];
      for (let s = 1; s <= L; s++) { const [a, b, c, e] = rows.at(-1); rows.push([b, 3 * a + 2 * c, 2 * b + 3 * e, c]); }
      const ways = rows[L][target];
      return {
        topic: 'Paths on a cube', rank: 10,
        text: `A bug sits at a corner of a cube and crawls along exactly ${L} edges, one after another; it may go back along an edge it has already used. How many different walks end ${target ? 'at the corner of the cube farthest from where it started' : 'back at the corner where it started'}?`,
        answer: choices(d, ways, [3 ** L, ways * 3, Math.round(3 ** L / 8), ways + 3, ways - 3].filter((v) => v > 0)),
        check: () => { const walk = (at, left) => (left === 0 ? (at === (target ? 7 : 0) ? 1 : 0) : [1, 2, 4].reduce((s, b) => s + walk(at ^ b, left - 1), 0)); const w = walk(0, L); return w === ways ? '' : `counted ${w}, said ${ways}`; },
        solution: `Group the corners by how many edges they are from the start, namely the start, its 3 neighbors, the 3 corners two edges away, and the far corner. From the start every edge leads to a neighbor; from a neighbor, 1 edge goes back and 2 go two away; from a corner two away, 2 edges come back to neighbors and 1 goes to the far corner; from the far corner all 3 go two away. So if (a, b, c, e) count the walks that end at each distance (start, neighbors, two away, far), one more step turns them into (b, 3a + 2c, 2b + 3e, c). Starting from (1, 0, 0, 0), the counts go ${rows.slice(1).map((r, i) => `(${r.map((v) => num(v)).join(', ')}) after ${i + 1} step${i ? 's' : ''}`).join('; ')}. So <b>${num(ways)}</b> walks end ${target ? 'at the far corner' : 'back at the start'}.`,
      };
    },
    // segments joining the corners
    (d, ctx) => {
      const [what] = combo(ctx, [['edges', 'faces', 'inside', 'notEdges']]), value = { edges: 12, faces: 12, inside: 4, notEdges: 16 }[what];
      return {
        topic: 'Paths on a cube', rank: 2,
        text: `Every pair of corners of a cube is joined by a straight segment. How many of these segments ${{ edges: 'are edges of the cube', faces: 'are diagonals of the faces of the cube', inside: 'pass through the inside of the cube', notEdges: 'are not edges of the cube' }[what]}?`,
        answer: choices(d, value, [4, 6, 8, 12, 16, 24, 28].filter((v) => v !== value)),
        check: () => { const by = [0, 0, 0, 0]; for (let p = 0; p < 8; p++) for (let q = p + 1; q < 8; q++) by[[1, 2, 4].filter((b) => (p ^ q) & b).length]++; const got = { edges: by[1], faces: by[2], inside: by[3], notEdges: by[2] + by[3] }[what]; return got === value ? '' : `counted ${got}`; },
        tip: 'Sort the segments by where they run: along an edge, across a face, or through the inside of the cube.',
        solution: `A cube has 8 corners, so there are C(8, 2) = 28 segments. The cube has 12 edges, and each of its 6 faces has 2 diagonals, which makes 6·2 = 12 face diagonals. The remaining 28 − 12 − 12 = 4 join opposite corners through the inside. ${{ edges: 'So <b>12</b> of the segments are edges.', faces: 'So <b>12</b> of the segments are diagonals of the faces.', inside: 'So <b>4</b> of the segments pass through the inside.', notEdges: 'So 28 − 12 = <b>16</b> are not edges.' }[what]}`,
      };
    },
  ],

  'Coloring a map': [
    // a rectangle cut into two rows of regions
    (d, ctx) => {
      const [[t, b], k] = combo(ctx, [[[2, 3], [3, 2], [3, 3], [2, 4], [4, 2], [3, 4]], [4, 5, 6]], ([t, b], k) => !(t + b === 5 && k === 5));
      let top, bottom;
      const spaced = (cuts) => [0, ...cuts, 12].every((v, i, a) => !i || v - a[i - 1] >= 2);
      do {
        top = d.shuffle(range(2, 10)).slice(0, t - 1).sort((x, y) => x - y);
        bottom = d.shuffle(range(2, 10)).slice(0, b - 1).sort((x, y) => x - y);
      } while (!spaced(top) || !spaced(bottom) || top.some((v) => bottom.includes(v)));
      const n = t + b, ways = k * (k - 1) * (k - 2) ** (n - 2), X = (v) => 10 + v * 25;
      const body = '<rect class="side" x="10" y="10" width="300" height="110"/><line class="side" x1="10" y1="65" x2="310" y2="65"/>'
        + top.map((v) => `<line class="side" x1="${X(v)}" y1="10" x2="${X(v)}" y2="65"/>`).join('') + bottom.map((v) => `<line class="side" x1="${X(v)}" y1="65" x2="${X(v)}" y2="120"/>`).join('');
      return {
        topic: 'Coloring a map', rank: 7,
        text: `A rectangle is divided into ${n} regions, as shown. Each region is painted one of ${k} colors, and colors may be used more than once, but any two regions that share a border must get different colors. How many paintings are possible?`,
        figure: svg(320, 130, `A rectangle cut into ${n} regions in two rows`, body),
        answer: choices(d, ways, [k * (k - 1) ** (n - 1), k * (k - 1) ** 2 * (k - 2) ** (n - 3), k * (k - 1) * (k - 2) * (k - 3) ** (n - 3), k ** n]),
        check: () => {
          const cut = (cuts) => [0, ...cuts, 12].slice(1).map((e, i, a) => [i ? a[i - 1] : 0, e]);
          const regions = [...cut(top).map((r) => [0, ...r]), ...cut(bottom).map((r) => [1, ...r])], pairs = [];
          regions.forEach(([ra, sa, ea], i) => regions.forEach(([rb, sb, eb], j) => {
            if (j > i && (ra === rb ? ea === sb || eb === sa : Math.min(ea, eb) - Math.max(sa, sb) > 0)) pairs.push([i, j]);
          }));
          let c = 0;
          for (let code = 0; code < k ** n; code++) {
            const col = range(0, n - 1).map((i) => Math.floor(code / k ** i) % k);
            if (pairs.every(([i, j]) => col[i] !== col[j])) c++;
          }
          return c === ways ? '' : `counted ${c}, said ${ways}`;
        },
        solution: `Paint the regions from left to right, in the order their left edges come (top row first at the far left). The first region has ${k} choices. The first region of the other row touches it: ${k - 1} choices. Every later region touches exactly two regions already painted, the one just left of it in its own row and the one in the other row across from where it starts. Those two touch each other, so they use two different colors and leave ${k - 2} choices for each of the ${n - 2} later regions. In all, ${k}·${k - 1}·${k - 2}<sup>${n - 2}</sup> = <b>${num(ways)}</b>.`,
      };
    },
    // the stripes of a flag
    (d, ctx) => {
      const [n, k] = combo(ctx, [range(3, 7), [3, 4, 5, 6]]), ways = k * (k - 1) ** (n - 1);
      return {
        topic: 'Coloring a map', rank: 2,
        text: `A flag has ${n} vertical stripes side by side, as shown. Each stripe is painted one of ${k} colors; colors may be used more than once, but stripes that touch must be different colors. How many flags are possible?`,
        figure: svg(300, 110, `A flag with ${n} stripes`, '<rect class="side" x="10" y="10" width="280" height="90"/>' + range(1, n - 1).map((i) => `<line class="side" x1="${(10 + (280 * i) / n).toFixed(1)}" y1="10" x2="${(10 + (280 * i) / n).toFixed(1)}" y2="100"/>`).join('')),
        answer: choices(d, ways, [k ** n, k * (k - 1) * (k - 2) ** (n - 2), (k - 1) ** n, k * (k - 1) ** (n - 2), n * k]),
        check: () => { let c = 0; for (let code = 0; code < k ** n; code++) { const col = range(0, n - 1).map((i) => Math.floor(code / k ** i) % k); if (col.every((v, i) => !i || v !== col[i - 1])) c++; } return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `Paint from left to right. The first stripe has ${k} choices; every later stripe touches only the stripe just before it, so it has ${k - 1} choices. In all, ${k}·${k - 1}<sup>${n - 1}</sup> = <b>${num(ways)}</b>.`,
      };
    },
    // wedges around a round table
    (d, ctx) => {
      const [n, k] = combo(ctx, [range(4, 8), [3, 4, 5]]), R = [0, 0, k * (k - 1)];
      for (let m = 3; m <= n; m++) R[m] = k * (k - 1) ** (m - 1) - R[m - 1];
      const ways = R[n];
      return {
        topic: 'Coloring a map', rank: 10,
        text: `A round table top is divided into ${n} wedges, like slices of a pie, as shown. Each wedge is painted one of ${k} colors so that wedges sharing an edge get different colors. How many paintings are possible? (Paintings that differ only by turning the table count as different.)`,
        figure: wheel(n, 0, `A circle cut into ${n} wedges`),
        answer: choices(d, ways, [k * (k - 1) ** (n - 1), k * (k - 1) * (k - 2) ** (n - 2), (k - 1) ** n, ways / n, k ** n].filter(Number.isInteger)),
        check: () => { let c = 0; for (let code = 0; code < k ** n; code++) { const col = range(0, n - 1).map((i) => Math.floor(code / k ** i) % k); if (col.every((v, i) => v !== col[(i + 1) % n])) c++; } return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `Number the wedges 1 to ${n} around the table. Painting them in order with each wedge different from the one before gives ${k}·${k - 1}<sup>${n - 1}</sup> paintings, but some of those have wedge ${n} the same color as wedge 1. Merging wedges 1 and ${n} turns each of those into a good painting of a ring with one wedge fewer. So a ring of m wedges has R(m) = ${k}·${k - 1}<sup>m − 1</sup> − R(m − 1) paintings, starting from R(2) = ${k}·${k - 1} = ${R[2]}. Then ${range(3, n).map((m) => `R(${m}) = ${k}·${k - 1}<sup>${m - 1}</sup> − ${num(R[m - 1])} = ${num(R[m])}`).join(', ')}. That is (${k} − 1)<sup>${n}</sup> + (−1)<sup>${n}</sup>(${k} − 1) = <b>${num(ways)}</b>.`,
      };
    },
    // a center circle with a ring of panes around it
    (d, ctx) => {
      const [n, k] = combo(ctx, [[4, 5, 6], [4, 5, 6]]), c = k - 1, ring = (c - 1) ** n + (n % 2 ? -1 : 1) * (c - 1), ways = k * ring;
      return {
        topic: 'Coloring a map', rank: 11,
        text: `A round window has a circle in the middle and a ring of ${n} panes around it, as shown; every pane of the ring touches the middle circle and the two panes beside it. Each piece is painted one of ${k} colors so that pieces that touch get different colors. How many paintings are possible?`,
        figure: wheel(n, 34, `A circle in the middle of a ring of ${n} panes`),
        answer: choices(d, ways, [k * (k - 1) ** n, k * ((k - 1) ** n + (n % 2 ? -1 : 1) * (k - 1)), ring, k * (k - 1) * (k - 2) ** (n - 1), k ** (n + 1)]),
        check: () => { let t = 0; for (let code = 0; code < k ** (n + 1); code++) { const col = range(0, n).map((i) => Math.floor(code / k ** i) % k), mid = col[n]; if (range(0, n - 1).every((i) => col[i] !== mid && col[i] !== col[(i + 1) % n])) t++; } return t === ways ? '' : `counted ${t}, said ${ways}`; },
        solution: `The middle circle touches every pane, so paint it first (${k} ways); then the ring may only use the other ${c} colors, with neighbors different. A ring of ${n} pieces with c colors can be painted (c − 1)<sup>${n}</sup> + (−1)<sup>${n}</sup>(c − 1) ways (paint around in order, then take away the paintings where the last pane matches the first). With c = ${c}: ${c - 1}<sup>${n}</sup> ${n % 2 ? '−' : '+'} ${c - 1} = ${num(ring)}. In all, ${k}·${num(ring)} = <b>${num(ways)}</b>.`,
      };
    },
  ],

  'Digit rules': [
    // only even (or only odd) digits, and a multiple of 4, 5 or 25
    (d, ctx) => {
      const [k, rule] = combo(ctx, [[3, 4, 5], ['even5', 'odd5', 'even4', 'odd25']], (k, r) => !(k === 4 && r === 'even5'));
      const p = (e) => 5 ** e, lo = 10 ** (k - 1), hi = 10 ** k - 1;
      const R = {
        even5: { what: 'only even digits and are multiples of 5', ways: 4 * p(k - 2), wrong: [p(k - 1), 4 * p(k - 1), 8 * p(k - 2), 4 ** (k - 1)],
          why: `A multiple of 5 ends in 0 or 5, and 5 is odd, so the last digit is 0. The first digit is 2, 4, 6 or 8 (4 ways), and ${k === 3 ? 'the digit between can be 0, 2, 4, 6 or 8 (5 ways)' : `each of the ${k - 2} digits between can be 0, 2, 4, 6 or 8 (5 ways each)`}, so the count is 4·${power(5, k - 2)}` },
        odd5: { what: 'only odd digits and are multiples of 5', ways: p(k - 1), wrong: [p(k), 4 * p(k - 1), p(k - 2), 2 * p(k - 1)],
          why: `A multiple of 5 ends in 0 or 5, and 0 is even, so the last digit is 5. Each of the other ${k - 1} digits is 1, 3, 5, 7 or 9 (5 ways each), so the count is 5<sup>${k - 1}</sup>` },
        even4: { what: 'only even digits and are multiples of 4', ways: 12 * p(k - 2), wrong: [p(k - 1), 2 * p(k - 1), 8 * p(k - 2), 15 * p(k - 2)],
          why: `Whether a number is a multiple of 4 depends on its last two digits, 10a + b. With a even, 10a is a multiple of 20, and so of 4, so b must be a multiple of 4 too, and the even digits that are multiples of 4 are 0, 4 and 8 (3 ways). The first digit is 2, 4, 6 or 8 (4 ways), and ${k === 3 ? 'the digit after it, before the last, can be any of the 5 even digits' : `the ${k - 2} digits after it, before the last, can each be any of the 5 even digits`}, so the count is 4·${power(5, k - 2)}·3` },
        odd25: { what: 'only odd digits and are multiples of 25', ways: p(k - 2), wrong: [2 * p(k - 2), p(k - 1), 4 * p(k - 2), p(k - 3)],
          why: `A multiple of 25 ends in 00, 25, 50 or 75, and only 75 uses odd digits. ${k === 3 ? 'The other digit can be 1, 3, 5, 7 or 9, so the count is' : `Each of the other ${k - 2} digits can be 1, 3, 5, 7 or 9, so the count is 5<sup>${k - 2}</sup> =`}` },
      }[rule];
      return {
        topic: 'Digit rules', rank: 4,
        text: `How many integers from ${num(lo)} to ${num(hi)} have ${R.what}?`,
        answer: choices(d, R.ways, R.wrong),
        check: () => {
          const even = rule.startsWith('even'), m = +rule.replace(/\D/g, '');
          let c = 0;
          for (let x = lo; x <= hi; x++) if (x % m === 0 && String(x).split('').every((ch) => (+ch % 2 === 0) === even)) c++;
          return c === R.ways ? '' : `counted ${c}, said ${R.ways}`;
        },
        solution: `${R.why}${R.why.endsWith('is') || R.why.endsWith('=') ? '' : ' ='} <b>${num(R.ways)}</b>.`,
      };
    },
    // all digits different
    (d, ctx) => {
      const [k, odd] = combo(ctx, [[2, 3, 4], [false, true]]);
      const later = range(0, k - 2).map((i) => 9 - i), mid = range(0, k - 3).map((i) => 8 - i);
      const ways = odd ? 5 * 8 * mid.reduce((p, v) => p * v, 1) : 9 * later.reduce((p, v) => p * v, 1);
      return {
        topic: 'Digit rules', rank: 1,
        text: `How many ${k}-digit numbers ${odd ? 'are odd and ' : ''}have all their digits different?`,
        answer: choices(d, ways, odd ? [5 * 9 * mid.reduce((p, v) => p * v, 1), 9 * later.reduce((p, v) => p * v, 1) / 2, 5 * 10 ** (k - 1), 4 * 8 * mid.reduce((p, v) => p * v, 1)] : [9 * 10 ** (k - 1), 10 * later.reduce((p, v) => p * v, 1), 9 ** k, 9 * later.reduce((p, v) => p * v, 1) - 9]),
        check: () => { let c = 0; for (let x = 10 ** (k - 1); x < 10 ** k; x++) { const s = String(x); if (new Set(s).size === k && (!odd || x % 2)) c++; } return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: odd
          ? `The last digit must be odd, so choose it first (1, 3, 5, 7 or 9): 5 ways. The first digit can’t be 0 or the last digit: 8 ways.${k > 2 ? ` ${k === 3 ? 'The middle digit is any digit not used yet, 0 included: 8 ways' : `The two middle digits are any digits not used yet, 0 included, in ${mid.join(' and then ')} ways`}.` : ''} So there are 5·8${k > 2 ? '·' + mid.join('·') : ''} = <b>${num(ways)}</b>.`
          : `The first digit can be 1 to 9 (9 ways). After it, 0 is allowed too, so the second digit can be any of the 10 digits except the first (9 ways)${k > 2 ? `, the third any of the 8 not used yet${k > 3 ? ', and the fourth any of the 7 left' : ''}` : ''}. So there are 9${later.map((v) => '·' + v).join('')} = <b>${num(ways)}</b>.`,
      };
    },
    // at least one copy of a digit
    (d, ctx) => {
      const [k, digit] = combo(ctx, [[2, 3, 4], range(1, 9)]), all = 9 * 10 ** (k - 1), none = 8 * 9 ** (k - 1), ways = all - none;
      return {
        topic: 'Digit rules', rank: 2,
        text: `How many ${k}-digit numbers contain the digit ${digit} at least once?`,
        answer: choices(d, ways, [10 ** (k - 1), k * 10 ** (k - 1), all - 9 ** k, k * 9 ** (k - 1), none]),
        check: () => { let c = 0; for (let x = 10 ** (k - 1); x < 10 ** k; x++) if (String(x).includes(String(digit))) c++; return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `Count the ones without a ${digit} and subtract. There are 9·${power(10, k - 1)} = ${num(all)} numbers with ${k} digits. With no ${digit}: the first digit has 8 choices (not 0, not ${digit}) and ${k === 2 ? 'the other digit' : 'each other digit'} 9 (not ${digit}): 8·${power(9, k - 1)} = ${num(none)}. So ${num(all)} − ${num(none)} = <b>${num(ways)}</b>.`,
      };
    },
    // palindromes
    (d, ctx) => {
      const [k, kind] = combo(ctx, [[3, 4, 5, 6], ['all', 'five', 'even']]), half = Math.ceil(k / 2), free = 10 ** (half - 1);
      const ways = { all: 9, five: 1, even: 4 }[kind] * free;
      return {
        topic: 'Digit rules', rank: 2,
        text: `A palindrome reads the same forward and backward, like 4774 or 12321. How many ${k}-digit palindromes ${{ all: 'are there', five: 'are multiples of 5', even: 'are even' }[kind]}?`,
        answer: choices(d, ways, [9 * 10 ** half, 10 ** half, 9 * free, 5 * free, 2 * free, 4 * 10 ** half].filter((v) => v !== ways)),
        check: () => { let c = 0; for (let x = 10 ** (k - 1); x < 10 ** k; x++) { const s = String(x); if (s === [...s].reverse().join('') && (kind === 'all' || (kind === 'five' ? x % 5 === 0 : x % 2 === 0))) c++; } return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `A ${k}-digit palindrome is fixed by its first ${half} digits, since the rest mirror them. ${{ all: `The first digit is 1 to 9 and ${half - 1 === 1 ? 'the other one is' : `the other ${half - 1} are`} anything: 9·${power(10, half - 1)}`, five: `A multiple of 5 ends in 0 or 5. The last digit equals the first, which can’t be 0, so the first and last digits are 5. ${half - 1 === 1 ? 'The other free digit is anything (10 ways), so the count is' : `The other ${half - 1} free digits are anything: 10<sup>${half - 1}</sup>`}`, even: `An even number ends in an even digit, and the last digit equals the first, which can’t be 0: 2, 4, 6 or 8. ${half - 1 === 1 ? 'The other free digit is' : `The other ${half - 1} free digits are`} anything: 4·${power(10, half - 1)}` }[kind]}${kind === 'five' && half === 2 ? '' : ' ='} <b>${num(ways)}</b>.`,
      };
    },
  ],

  'Pairing friends': [
    // friends with neighbors and the person opposite at a round table
    (d, ctx) => {
      const [n] = combo(ctx, [[8, 12, 14]]);
      const m = n / 2, byCount = Array(m + 1).fill(0);
      for (let mask = 1; mask < 1 << m; mask++) {
        const pos = range(0, m - 1).filter((i) => (mask >> i) & 1);
        if (pos.every((p, i) => ((i + 1 < pos.length ? pos[i + 1] : pos[0] + m) - p) % 2)) byCount[pos.length]++;
      }
      const ways = 2 + byCount.reduce((s, v) => s + v, 0);
      // the same choices of lines sorted by the gaps between them, going around the table: { t: { '1, 3': ways } }
      const byGaps = {};
      for (let mask = 1; mask < 1 << m; mask++) {
        const pos = range(0, m - 1).filter((i) => (mask >> i) & 1), gaps = pos.map((p, i) => (i + 1 < pos.length ? pos[i + 1] : pos[0] + m) - p);
        if (gaps.every((g) => g % 2)) { const key = list(gaps.sort((x, y) => x - y).map(String)); (byGaps[pos.length] ??= {})[key] = (byGaps[pos.length][key] ?? 0) + 1; }
      }
      const parts = range(1, m).filter((t) => byCount[t]).map((t) => {
        const kinds = Object.entries(byGaps[t]), head = `${Cap(WORDS[t])} line${t === 1 ? '' : 's'}:`;
        if (t === 1) return `${head} the gap is ${m}, ${m} ways.`;
        if (t === m) return `${head} every gap is 1, 1 way.`;
        if (kinds.length === 1) return `${head} gaps ${kinds[0][0]}, ${kinds[0][1]} ways.`;
        return `${head} gaps ${kinds.map(([g, c]) => `${g} (${c} ways)`).join(' or ')}, ${byCount[t]} ways in all.`;
      });
      return {
        topic: 'Pairing friends', rank: 11,
        text: `At a dinner, ${n} guests sit evenly spaced around a round table. Each guest is friends with exactly three of the others: the two guests on either side and the guest sitting directly opposite. In how many ways can all ${n} guests be split into ${m} pairs so that the two guests in every pair are friends?`,
        answer: choices(d, ways, [ways - 2, ways - 1, ways + 1, ways + 2, m + 2, 2 * m]),
        check: () => { const c = pairings(range(0, n - 1), (i, j) => [1, n - 1, m].includes((j - i + n) % n)); return c === ways ? '' : `counted ${c}, said ${ways}`; },
        tip: 'Sort the pairings by which pairs sit across the table: the guests between two such pairs must pair off with their neighbors.',
        solution: `Every pair is two neighbors or two guests sitting opposite. With no one paired across the table, the pairs go around the circle: 2 ways. Otherwise, the guests in across-pairs split the others into arcs, and each arc must pair off with neighbors, so each arc needs an even number of guests (then it pairs up in exactly one way). Number the ${m} lines across the table in order around it. Then the chosen lines must be an odd number of steps apart, all the way around. With t of them, the t gaps between neighboring chosen lines (the last back to the first included) are odd and add up to ${m}. ${parts.join(' ')} In all, 2 + ${byCount.filter(Boolean).join(' + ')} = <b>${ways}</b>.`,
      };
    },
    // any pairs at all
    (d, ctx) => {
      const [n] = combo(ctx, [[4, 6, 8, 10, 12]]), ways = doubleFact(n - 1), factors = odds(n - 1).reverse();
      return {
        topic: 'Pairing friends', rank: 3,
        text: `A coach splits the ${n} players of a team into ${n / 2} practice pairs. In how many ways can this be done? (Only who is paired with whom matters.)`,
        answer: choices(d, ways, [fact(n) / 2 ** (n / 2), fact(n), choose(n, 2), ways * fact(n / 2) / 2, ways * 2].filter(Number.isInteger)),
        check: () => { const c = pairings(range(0, n - 1), () => true); return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `Take the tallest player, who can be paired with any of the other ${n - 1}. Then the tallest player not yet paired has ${n - 3} choice${n - 3 === 1 ? '' : 's'} of partner${n > 4 ? ', and so on' : ''}, so there are ${factors.join('·')} = <b>${num(ways)}</b> ways.`,
      };
    },
    // pairs of desks in two rows
    (d, ctx) => {
      const [n] = combo(ctx, [range(4, 10)]), T = [1, 1, 2];
      for (let m = 3; m <= n; m++) T[m] = T[m - 1] + T[m - 2];
      const ways = T[n];
      return {
        topic: 'Pairing friends', rank: 5,
        text: `A class of ${2 * n} students sits in two rows of ${n}, each student in the back row directly behind one in the front row. They split into pairs, and the two students in a pair must sit side by side in the same row or one directly behind the other. In how many ways can they pair up?`,
        answer: choices(d, ways, [2 ** (n - 1), T[n - 1], T[n + 1] ?? T[n] + T[n - 1], n + 1, 2 * n]),
        check: () => { const c = pairings(range(0, 2 * n - 1), (p, q) => { const [rp, cp, rq, cq] = [p % 2, p >> 1, q % 2, q >> 1]; return (rp === rq && Math.abs(cp - cq) === 1) || (cp === cq && rp !== rq); }); return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `Let T(m) count the ways for two rows of m, and look at the left end. Either the two students in the first column pair up (front with back), leaving two rows of m − 1, or the front-left student pairs with the one beside them, and then the back-left student must too, leaving two rows of m − 2. So T(m) = T(m − 1) + T(m − 2), with T(1) = 1 and T(2) = 2, which gives ${range(1, n).map((m) => T[m]).join(', ')} for m = 1 to ${n}. So T(${n}) = <b>${ways}</b>.`,
      };
    },
    // couples who mustn’t be paired with each other
    (d, ctx) => {
      const [m] = combo(ctx, [[2, 3, 4, 5]]), terms = range(0, m).map((j) => choose(m, j) * doubleFact(2 * m - 2 * j - 1)), ways = terms.reduce((s, t, j) => s + (j % 2 ? -t : t), 0);
      return {
        topic: 'Pairing friends', rank: 13,
        text: `${Cap(WORDS[m])} married couples come to a dance class, and the teacher splits all ${2 * m} people into ${m} pairs so that nobody is paired with their own partner. In how many ways can this be done? (Only who is paired with whom matters.)`,
        answer: choices(d, ways, [doubleFact(2 * m - 1), doubleFact(2 * m - 1) - m, terms[0] - terms[1], ways + 1, fact(m)].filter((v) => v > 0)),
        check: () => { const c = pairings(range(0, 2 * m - 1), (p, q) => p >> 1 !== q >> 1); return c === ways ? '' : `counted ${c}, said ${ways}`; },
        tip: 'Count all the pairings, then use inclusion–exclusion on the couples who end up paired together.',
        solution: `Use inclusion–exclusion. All pairings of ${2 * m} people number ${odds(2 * m - 1).reverse().join('·')} = ${num(terms[0])} (the first person has ${2 * m - 1} choices of partner, the next person not yet paired ${2 * m - 3}, and so on). If j chosen couples are kept together, the other ${2 * m} − 2j people pair up freely, in (${2 * m - 1} − 2j)·(${2 * m - 3} − 2j)·⋯·1 ways, and there are C(${m}, j) ways to choose the couples. Adding and subtracting, the count is ${num(terms[0])}${terms.slice(1).map((t, i) => `${i % 2 ? ' + ' : ' − '}C(${m}, ${i + 1})·${doubleFact(2 * m - 2 * i - 3)}`).join('')} = ${terms.map((t, j) => (j ? (j % 2 ? ' − ' : ' + ') : '') + num(t)).join('')} = <b>${num(ways)}</b>.`,
      };
    },
  ],

  'Knights, knaves and jokers': [
    // knights, knaves and jokers answering the same three questions
    (d, ctx) => {
      const [ask] = combo(ctx, [['knights', 'knaves', 'jokers', 'jokerTokens']]);
      let T, L, A1, A2;
      do { T = d.int(4, 12); L = d.int(3, 10); A1 = d.int(2, 8); A2 = d.int(2, 8); } while (T + L + A2 === 22 && L + A2 === 15 && A2 === 9);
      const N = T + L + A1 + A2, y1 = T + L + A2, y2 = L + A2, y3 = A2;
      const Q = {
        knights: ['How many tokens did the Knights receive in all?', T, [y1 - y3, y2 - y3, y3, N - y1, y1 - y2 + 1], `So there are ${y1} − ${y2} = ${T} Knights, and each got exactly one token: <b>${T}</b>.`],
        knaves: ['How many tokens did the Knaves receive in all?', 2 * L, [L, y2, 2 * y2, 3 * L, y1 - y2], `So there are ${y2} − ${y3} = ${L} Knaves, and each got two tokens: 2·${L} = <b>${2 * L}</b>.`],
        jokers: ['How many Jokers are there?', A1 + A2, [N - y1, y3, N - y2, 2 * y3, N - y1 + 2 * y3], `So Knights and Knaves together number ${y1} − ${y3} = ${T + L}, and the Jokers number ${N} − ${T + L} = <b>${A1 + A2}</b>.`],
        jokerTokens: ['How many tokens did the Jokers receive in all?', 3 * A2, [y3, 2 * y3, y2 + y3, 3 * y3 + (N - y1), 3 * (N - y1 + y3)], `Only the ${y3} Jokers who lied first got tokens, three each: 3·${y3} = <b>${3 * A2}</b>.`],
      }[ask];
      return {
        topic: 'Knights, knaves and jokers', rank: 11,
        text: `A quiz show has ${N} contestants. Each one is a Knight, who always tells the truth; a Knave, who always lies; or a Joker, who switches between the truth and a lie with every answer, starting with either one. The host asks every contestant the same three questions, in this order, and hands out a token for each “yes”. “Are you a Knight?” gets ${y1} yeses, “Are you a Joker?” gets ${y2}, and “Are you a Knave?” gets ${y3}. ${Q[0]}`,
        answer: choices(d, Q[1], Q[2]),
        check: () => {
          const seen = new Set();
          for (let t = 0; t <= N; t++) for (let l = 0; t + l <= N; l++) for (let a2 = 0; t + l + a2 <= N; a2++) {
            const a1 = N - t - l - a2;
            if (t + l + a2 === y1 && l + a2 === y2 && a2 === y3) seen.add({ knights: t, knaves: 2 * l, jokers: a1 + a2, jokerTokens: 3 * a2 }[ask]);
          }
          return seen.size === 1 && seen.has(Q[1]) ? '' : `possible answers: ${[...seen].join(', ')}`;
        },
        tip: 'Work out the three answers each kind of contestant gives, then see which kinds each count of yeses takes in.',
        solution: `Work out how each type answers. A Knight says yes, no, no. A Knave lies every time: yes, yes, no. A Joker who starts with the truth says no, no, no, and a Joker who starts with a lie says yes, yes, yes. So the first question’s ${y1} yeses come from Knights, Knaves and lying-first Jokers; the second’s ${y2} from Knaves and lying-first Jokers; the third’s ${y3} from lying-first Jokers only. ${Q[3]}`,
      };
    },
    // a line of islanders, each claiming at least so many knaves
    (d, ctx) => {
      const [n] = combo(ctx, [[6, 8, 10, 12, 14, 16, 18, 20]]), K = n / 2;
      return {
        topic: 'Knights, knaves and jokers', rank: 8,
        text: `On an island, every person is a knight, who always tells the truth, or a knave, who always lies. A line of ${n} islanders is numbered 1 to ${n}, and each of them makes one statement: person number i says, “At least i of us ${n} are knaves.” (So person 1 says “at least 1”, person 2 says “at least 2”, and so on.) How many knaves are there?`,
        answer: choices(d, K, [K - 1, K + 1, n, 1, K + 2]),
        check: () => { const fits = range(0, n).filter((k) => n - range(1, n).filter((i) => k >= i).length === k); return fits.length === 1 && fits[0] === K ? '' : `knave counts that fit: ${fits}`; },
        solution: `Say there are K knaves. Person i tells the truth exactly when K ≥ i, so the knights are persons 1 to K: K knights. Then the knaves number ${n} − K, and that must equal K. So K = ${n}/2 = <b>${K}</b>.`,
      };
    },
    // each claiming an exact number of knaves
    (d, ctx) => {
      const [n] = combo(ctx, [range(5, 14)]);
      return {
        topic: 'Knights, knaves and jokers', rank: 6,
        text: `On an island, ${n} people are each a knight, who always tells the truth, or a knave, who always lies. They are numbered 1 to ${n}, and person number i says, “Exactly i of us are knaves.” (Person 1 says “exactly 1”, and so on up to person ${n}.) Which person is a knight?`,
        answer: choices(d, n - 1, [n, 1, n - 2, Math.floor(n / 2), 2].filter((v) => v !== n - 1)),
        check: () => {
          const fits = [];
          for (let mask = 0; mask < 1 << n; mask++) {
            const knaves = n - range(0, n - 1).filter((i) => (mask >> i) & 1).length;
            if (range(1, n).every((i) => (((mask >> (i - 1)) & 1) === 1) === (knaves === i))) fits.push(mask);
          }
          return fits.length === 1 && fits[0] === 1 << (n - 2) ? '' : `${fits.length} ways fit`;
        },
        solution: `Two knights would both be telling the truth about the number of knaves while saying different numbers, which is impossible, so there is at most one knight. If there were no knight, all ${n} would be knaves, and then person ${n} would be telling the truth: impossible. So there is exactly one knight and ${n - 1} knaves, and the knight is the one who says “exactly ${n - 1}”: person <b>${n - 1}</b>.`,
      };
    },
  ],

  'Forming teams': [
    // two groups split into teams with a fixed mix
    (d, ctx) => {
      const [[g, a, b]] = combo(ctx, [[[2, 3, 2], [2, 2, 2], [3, 1, 3], [4, 2, 1], [3, 2, 1], [2, 4, 2], [2, 2, 3]]]);
      const J = g * a, S = g * b, split = fact(J) / (fact(a) ** g * fact(g)), deal = fact(S) / fact(b) ** g, ways = split * deal;
      const [[p1, pp], [q1, qq]] = d.pick([[['sixth grader', 'sixth graders'], ['seventh grader', 'seventh graders']], [['violinist', 'violinists'], ['cellist', 'cellists']], [['sophomore', 'sophomores'], ['freshman', 'freshmen']]]);
      const some = (c, one, many) => `${WORDS[c]} ${c === 1 ? one : many}`;
      return {
        topic: 'Forming teams', rank: 6,
        text: `A club has ${J} ${pp} and ${S} ${qq}. They split up into ${WORDS[g]} teams of ${a + b}, and every team must have ${some(a, p1, pp)} and ${some(b, q1, qq)}. In how many ways can the teams be formed? (The teams have no names, so only who is with whom matters.)`,
        answer: choices(d, ways, [ways * fact(g), choose(J, a) * choose(S, b), split + deal, ways / fact(g), ways * 2].filter(Number.isInteger)),
        check: () => {
          const kind = [...Array(J).fill(0), ...Array(S).fill(1)];
          const teams = (left) => {
            if (!left.length) return 1;
            const [first, ...rest] = left, need = [a, b];
            need[kind[first]]--;
            let total = 0;
            const pick = (i, chosen, na, nb) => {
              if (!na && !nb) { total += teams(rest.filter((x) => !chosen.includes(x))); return; }
              if (i === rest.length) return;
              const q = rest[i];
              if (kind[q] === 0 && na) pick(i + 1, [...chosen, q], na - 1, nb);
              if (kind[q] === 1 && nb) pick(i + 1, [...chosen, q], na, nb - 1);
              pick(i + 1, chosen, na, nb);
            };
            pick(0, [], need[0], need[1]);
            return total;
          };
          const c = teams(range(0, J + S - 1));
          return c === ways ? '' : `counted ${c}, said ${ways}`;
        },
        solution: a === 1
          ? `Each team gets exactly one of the ${J} ${pp}, so they start ${WORDS[g]} teams that are different from each other. Now hand out the ${S} ${qq}, ${b} to each team, in ${S}!/(${b}!)<sup>${g}</sup> = ${num(deal)} ways (choose ${b} for the first team, then ${b} of the rest for the next, and so on). So there are <b>${num(ways)}</b> ways.`
          : `First split the ${J} ${pp} into ${g} groups of ${a}, in ${J}!/((${a}!)<sup>${g}</sup>·${g}!) = ${num(split)} ways (dividing by ${g}! because the groups come in no order). Now the groups are different from each other, so hand out the ${S} ${qq}, ${b} to each group, in ${b === 1 ? `${S}! = ${num(deal)}` : `${S}!/(${b}!)<sup>${g}</sup> = ${num(deal)}`} ways. In all, ${num(split)}·${num(deal)} = <b>${num(ways)}</b>.`,
      };
    },
    // everyone into groups of the same size
    (d, ctx) => {
      const [[a, s]] = combo(ctx, [[[2, 3], [2, 4], [3, 2], [3, 3], [4, 2], [2, 5], [5, 2], [3, 4], [4, 3]]]), n = a * s;
      const labeled = fact(n) / fact(s) ** a, ways = labeled / fact(a);
      return {
        topic: 'Forming teams', rank: 4,
        text: `A club of ${n} hikers splits up into ${WORDS[a]} groups of ${s} for a trail race. Only who is with whom matters, not the order of the groups. In how many ways can the groups be formed?`,
        answer: choices(d, ways, [labeled, choose(n, s), fact(n) / fact(a), ways * 2, choose(n, s) * choose(n - s, s)].filter(Number.isInteger)),
        check: () => { const groups = (left) => { if (!left.length) return 1; const [p, ...rest] = left; let t = 0; const pick = (i, chosen) => { if (chosen.length === s - 1) { t += groups(rest.filter((x) => !chosen.includes(x))); return; } for (let j = i; j < rest.length; j++) pick(j + 1, [...chosen, rest[j]]); }; pick(0, []); return t; }; const c = groups(range(0, n - 1)); return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `If the groups had names (first group, second group, …), choosing ${s} people for each group in turn would give ${n}!/(${s}!)<sup>${a}</sup> = ${num(labeled)} ways. The groups have no names, so every split was counted once for each of the ${a}! = ${fact(a)} orders of the groups, and there are ${num(labeled)}/${fact(a)} = <b>${num(ways)}</b> ways.`,
      };
    },
    // a committee with at least one girl
    (d, ctx) => {
      const [b, g, k] = combo(ctx, [range(4, 8), range(3, 6), [3, 4, 5]], (b, g, k) => k <= b), all = choose(b + g, k), none = choose(b, k), ways = all - none;
      return {
        topic: 'Forming teams', rank: 3,
        text: `A class has ${b} boys and ${g} girls. In how many ways can a committee of ${k} be chosen that includes at least one girl?`,
        answer: choices(d, ways, [all, g * choose(b + g - 1, k - 1), all - choose(g, k), none, g * choose(b, k - 1)].filter((v) => v !== ways)),
        check: () => { let c = 0; for (let m = 0; m < 1 << (b + g); m++) { let bits = 0, girls = 0; for (let i = 0; i < b + g; i++) if ((m >> i) & 1) { bits++; if (i >= b) girls++; } if (bits === k && girls) c++; } return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `Count all committees and take away the ones with no girl. There are C(${b + g}, ${k}) = ${num(all)} committees in all, and C(${b}, ${k}) = ${num(none)} of them are all boys. So ${num(all)} − ${num(none)} = <b>${num(ways)}</b> include at least one girl.`,
      };
    },
    // a team with a captain
    (d, ctx) => {
      const [n, k] = combo(ctx, [range(6, 14), [3, 4, 5, 6]], (n, k) => k < n), ways = k * choose(n, k);
      return {
        topic: 'Forming teams', rank: 3,
        text: `From a club of ${n} members, a team of ${k} is picked, and then one member of the team is named captain. How many different teams with a captain are possible?`,
        answer: choices(d, ways, [choose(n, k), n * choose(n, k), choose(n, k) + k, n * choose(n - 1, k), k * choose(n, k - 1)].filter((v) => v !== ways)),
        check: () => { let c = 0; for (let m = 0; m < 1 << n; m++) { let bits = 0; for (let i = 0; i < n; i++) if ((m >> i) & 1) bits++; if (bits === k) c += k; } return c === ways ? '' : `counted ${c}, said ${ways}`; },
        tip: 'Pick the team first and then its captain from inside it, and multiply the numbers of choices.',
        solution: `Choose the team in C(${n}, ${k}) = ${num(choose(n, k))} ways; then any of its ${k} members can be captain, so there are ${k}·${num(choose(n, k))} = <b>${num(ways)}</b> teams with a captain. (Choosing the captain first gives the same, ${n}·C(${n - 1}, ${k - 1}) = ${n}·${num(choose(n - 1, k - 1))} = ${num(ways)}.)`,
      };
    },
  ],

  'Sum-free sets': [
    // the biggest set where no member is the sum of two members
    (d, ctx) => {
      const [N, twice] = combo(ctx, [range(14, 20), [true, false]]);
      const most = twice ? Math.ceil(N / 2) : Math.floor(N / 2) + 1, name = d.pick(['Mia', 'Theo', 'Asha', 'Ben']);
      return {
        topic: 'Sum-free sets', rank: 10,
        text: `${name} wants to choose as many numbers as possible from 1, 2, 3, …, ${N} so that no chosen number equals the sum of two ${twice ? 'chosen numbers (a number may be added to itself)' : 'different chosen numbers'}. What is the largest number of numbers ${name} can choose?`,
        answer: choices(d, most, [Math.floor(N / 2) - 1, Math.floor(N / 2), Math.ceil(N / 2), Math.floor(N / 2) + 1, Math.floor(N / 2) + 2, Math.ceil((2 * N) / 3)].filter((v) => v !== most)),
        check: () => {
          let best = 0;
          const set = [], fits = (x) => !set.some((a) => set.includes(x - a) && (twice || x - a !== a));
          const go = (x) => {
            if (set.length + (N - x + 1) <= best) return;
            if (x > N) { best = set.length; return; }
            if (fits(x)) { set.push(x); go(x + 1); set.pop(); }
            go(x + 1);
          };
          go(1);
          return best === most ? '' : `search found ${best}, said ${most}`;
        },
        solution: twice
          ? `Let m be the largest chosen number. For each x &lt; m/2, at most one of x and m − x can be chosen (their sum is m), and m/2 can’t be chosen (m/2 + m/2 = m). So besides m there are at most ⌊(m − 1)/2⌋ numbers, ⌈m/2⌉ in all, which is at most ⌈${N}/2⌉ = ${most}. The ${most} odd numbers 1, 3, 5, …, ${2 * most - 1} reach it, since two odd numbers (or one added to itself) always make an even number, which isn’t chosen: <b>${most}</b>.`
          : `Let m be the largest chosen number. For each x &lt; m/2, at most one of x and m − x can be chosen (their sum is m); now m/2 is allowed, since it would have to be added to itself. So below m there are at most ⌊m/2⌋ chosen numbers (one from each pair, and m/2 when m is even), ⌊m/2⌋ + 1 with m, which is at most ⌊${N}/2⌋ + 1 = ${most}. The ${most} numbers from ${Math.ceil(N / 2)} to ${N} reach it, since two different ones add to more than ${N}: <b>${most}</b>.`,
      };
    },
    // pairs whose sum stays in range
    (d, ctx) => {
      const [N] = combo(ctx, [range(8, 18)]), terms = range(3, N).map((s) => Math.floor((s - 1) / 2)), ways = terms.reduce((a, b) => a + b, 0);
      return {
        topic: 'Sum-free sets', rank: 4,
        text: `In how many ways can two different numbers be chosen from 1, 2, 3, …, ${N} so that their sum is also at most ${N}?`,
        answer: choices(d, ways, [choose(N, 2), Math.floor((N * N) / 4), ways + Math.floor(N / 2), choose(N - 1, 2), ways - 1]),
        check: () => { let c = 0; for (let x = 1; x <= N; x++) for (let y = x + 1; y <= N; y++) if (x + y <= N) c++; return c === ways ? '' : `counted ${c}, said ${ways}`; },
        tip: 'Sort the pairs by their sum, count the pairs with each sum, and add those counts up.',
        solution: `Count by the sum s = 3, 4, …, ${N}. A sum s comes from the pairs (1, s − 1), (2, s − 2), …, with the smaller number below s/2, so from ⌊(s − 1)/2⌋ pairs. Adding these for s = 3 to ${N} gives ${terms.join(' + ')} = <b>${num(ways)}</b>.`,
      };
    },
    // no two chosen numbers adding up to a target
    (d, ctx) => {
      const [N, shift] = combo(ctx, [range(10, 20), [-4, -2, 0, 1]]), T = N + shift;
      const pairs = range(Math.max(1, T - N), Math.ceil(T / 2) - 1).map((x) => [x, T - x]), free = N - 2 * pairs.length, most = N - pairs.length;
      return {
        topic: 'Sum-free sets', rank: 5,
        text: `What is the largest number of numbers that can be chosen from 1, 2, 3, …, ${N} so that no two different chosen numbers add up to ${T}?`,
        answer: choices(d, most, [free, pairs.length, most + 1, Math.ceil(N / 2), most - 1].filter((v) => v !== most)),
        check: () => { const best = largest(N, (x, y) => x + y === T); return best === most ? '' : `search found ${best}, said ${most}`; },
        solution: `The pairs of different numbers that add up to ${T} are ${pairs.map(([x, y]) => `(${x}, ${y})`).join(', ')}, which makes ${pairs.length} pairs, and at most one number from each can be chosen. ${free ? `The other ${free === 1 ? 'number' : `${free} numbers`}, ${list(range(1, N).filter((x) => !pairs.some((p) => p.includes(x))).map(String))}, belong${free === 1 ? 's' : ''} to no pair and can ${free === 1 ? 'be chosen too' : 'all be chosen'}. So the most is ${free} + ${pairs.length} = <b>${most}</b>.` : `Every number from 1 to ${N} is in one of these pairs, so the most is <b>${most}</b>.`}`,
      };
    },
    // no chosen number twice another
    (d, ctx) => {
      const [N] = combo(ctx, [range(10, 20)]);
      const chains = odds(N).map((o) => { const c = []; for (let v = o; v <= N; v *= 2) c.push(v); return c; }), most = chains.reduce((s, c) => s + Math.ceil(c.length / 2), 0);
      const shown = chains.filter((c) => c.length > 1).map((c) => `${c.join(', ')} (${Math.ceil(c.length / 2)})`);
      return {
        topic: 'Sum-free sets', rank: 8,
        text: `What is the largest number of numbers that can be chosen from 1, 2, 3, …, ${N} so that no chosen number is exactly twice another chosen number?`,
        answer: choices(d, most, [Math.ceil(N / 2), Math.floor(N / 2), most + 1, most - 1, Math.ceil((2 * N) / 3) + 1].filter((v) => v !== most)),
        check: () => { const best = largest(N, (x, y) => x === 2 * y || y === 2 * x); return best === most ? '' : `search found ${best}, said ${most}`; },
        solution: `Split the numbers into chains, each an odd number followed by its doubles, so that a number and its double are always next to each other in one chain. From a chain of length L, at most ⌈L/2⌉ can be chosen (no two neighbors), and every other one works. The chains longer than one are ${shown.join('; ')}, and the other ${chains.filter((c) => c.length === 1).length} odd numbers (${list(chains.filter((c) => c.length === 1).map((c) => String(c[0])))}) stand alone, 1 each. In all, ${chains.filter((c) => c.length > 1).map((c) => Math.ceil(c.length / 2)).join(' + ')} + ${chains.filter((c) => c.length === 1).length} = <b>${most}</b>.`,
      };
    },
  ],

  'Rising and falling digits': [
    // sliders against climbers
    (d, ctx) => {
      const [k, upTo] = combo(ctx, [[3, 4, 5], [false, true]]);
      const diff = upTo ? range(2, k).reduce((s, j) => s + choose(9, j - 1), 0) : choose(9, k - 1);
      const up = upTo ? range(2, k).reduce((s, j) => s + choose(9, j), 0) : choose(9, k), down = upTo ? range(2, k).reduce((s, j) => s + choose(10, j), 0) : choose(10, k);
      return {
        topic: 'Rising and falling digits', rank: 11,
        text: `Call a number with at least two digits a climber if its digits strictly increase from left to right, like 1479, and a slider if its digits strictly decrease, like 8530. ${upTo ? `Among the numbers from 10 to ${num(10 ** k - 1)}, how many more sliders are there than climbers?` : `How many more ${k}-digit sliders are there than ${k}-digit climbers?`}`,
        answer: choices(d, diff, [down, up, diff + (upTo ? k - 1 : 1), upTo ? diff - 9 : choose(10, k - 1), 0]),
        check: () => {
          let u = 0, w = 0;
          for (let x = 10; x < 10 ** k; x++) {
            if (!upTo && x < 10 ** (k - 1)) continue;
            const s = String(x);
            if ([...s].every((c, i) => !i || c > s[i - 1])) u++;
            if ([...s].every((c, i) => !i || c < s[i - 1])) w++;
          }
          return w - u === diff && u === up && w === down ? '' : `counted ${w} − ${u}, said ${diff}`;
        },
        solution: `A climber with j digits is j different digits from 1 to 9 written in increasing order (0 can never appear, since it can’t lead and nothing smaller can come before it), so there are C(9, j). A slider with j digits is any j different digits from 0 to 9 written in decreasing order (0 can only go last), so there are C(10, j). The difference C(10, j) − C(9, j) = C(9, j − 1) counts the sliders ending in 0. ${upTo ? `For lengths 2 to ${k} that is ${range(2, k).map((j) => `C(9, ${j - 1})`).join(' + ')} = ${range(2, k).map((j) => choose(9, j - 1)).join(' + ')} = <b>${num(diff)}</b>.` : `With j = ${k} that is C(10, ${k}) − C(9, ${k}) = ${choose(10, k)} − ${choose(9, k)} = <b>${num(diff)}</b>.`}`,
      };
    },
    // digits that never go down (or never go up)
    (d, ctx) => {
      const [k, up] = combo(ctx, [[2, 3, 4, 5], [true, false]]), ways = up ? choose(k + 8, 8) : choose(k + 9, 9) - 1, example = (up ? '13357' : '95520').slice(0, k);
      return {
        topic: 'Rising and falling digits', rank: 9,
        text: `How many ${k}-digit numbers have digits that never ${up ? 'decrease' : 'increase'} from left to right (like ${example})?`,
        answer: choices(d, ways, up ? [choose(9, k), choose(k + 9, 9), 9 ** k / 2, choose(k + 8, 8) - 1].filter(Number.isInteger) : [choose(10, k), choose(k + 9, 9), choose(k + 8, 8), choose(k + 9, 9) - 2]),
        check: () => { let c = 0; for (let x = 10 ** (k - 1); x < 10 ** k; x++) { const s = String(x); if ([...s].every((ch, i) => !i || (up ? ch >= s[i - 1] : ch <= s[i - 1]))) c++; } return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: up
          ? `Such a number is fixed by how many of each digit it uses, and 0 can’t appear (it would have to come first). So it is a choice of ${k} digits from 1 to 9 with repeats allowed, written in order. By stars and bars (${k} stars for the digits and 8 bars between the 9 kinds of digit) there are C(${k} + 8, 8) = C(${k + 8}, 8) = <b>${num(ways)}</b>.`
          : `Such a number is a choice of ${k} digits from 0 to 9 with repeats allowed, written in decreasing order. By stars and bars (${k} stars for the digits and 9 bars between the 10 kinds of digit) there are C(${k} + 9, 9) = C(${k + 9}, 9) = ${num(choose(k + 9, 9))} choices. Only the choice of all zeros fails, since a number can’t start with 0, so there are ${num(choose(k + 9, 9))} − 1 = <b>${num(ways)}</b>.`,
      };
    },
    // climbers that end in a given digit
    (d, ctx) => {
      const [dd] = combo(ctx, [range(3, 9)]), ways = 2 ** (dd - 1) - 1;
      return {
        topic: 'Rising and falling digits', rank: 4,
        text: `Call a number a climber if it has at least two digits and its digits strictly increase from left to right, like 1479. How many climbers end in the digit ${dd}?`,
        answer: choices(d, ways, [2 ** (dd - 1), 2 ** dd - 1, choose(dd - 1, 2), dd - 1, 2 ** (dd - 2)]),
        check: () => { let c = 0; for (let m = 1; m < 1 << 9; m++) { const digits = range(1, 9).filter((v) => (m >> (v - 1)) & 1); if (digits.length >= 2 && digits.at(-1) === dd) c++; } return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `A climber ending in ${dd} is ${dd} with some of the digits ${dd === 3 ? '1 and 2' : `1 to ${dd - 1}`} in front of it, in increasing order. Any set of those ${dd - 1} digits works, except the empty one (a climber has at least two digits): 2<sup>${dd - 1}</sup> − 1 = <b>${num(ways)}</b>.`,
      };
    },
    // climbers that start with a given digit
    (d, ctx) => {
      const [k, a] = combo(ctx, [[3, 4], range(1, 6)], (k, a) => choose(9 - a, k - 1) > 1), ways = choose(9 - a, k - 1);
      return {
        topic: 'Rising and falling digits', rank: 4,
        text: `Call a number a climber if its digits strictly increase from left to right, like 1479. How many ${k}-digit climbers begin with the digit ${a}?`,
        answer: choices(d, ways, [choose(10 - a, k - 1), choose(9 - a, k), (9 - a) ** (k - 1), choose(9, k - 1), ways + 9 - a].filter((v) => v !== ways && v > 0)),
        check: () => { let c = 0; for (let x = a * 10 ** (k - 1); x < (a + 1) * 10 ** (k - 1); x++) { const s = String(x); if ([...s].every((ch, i) => !i || ch > s[i - 1])) c++; } return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `After the ${a}, the other ${k - 1} digits must be different digits bigger than ${a}, written in increasing order. There are ${9 - a} digits from ${a + 1} to 9, so the count is C(${9 - a}, ${k - 1}) = <b>${num(ways)}</b>.`,
      };
    },
  ],

  'Round robin': [
    // the outnumbered left-handers win more games
    (d, ctx) => {
      const [[r, pct], ask] = combo(ctx, [LEAGUES, ['games', 'players', 'leftWins']]);
      const { fits, whole: [L] } = league(r, pct), X = fits.at(-1), n = (r + 1) * L, G = choose(n, 2), WR = (G * 100) / (200 + pct), WL = G - WR;
      const p = 100 / gcd(100, 200 + pct), q = (200 + pct) / gcd(100, 200 + pct);   // the right-handers won p/q of the games
      const value = { games: G, players: n, leftWins: WL }[ask];
      const wrong = { games: [choose((r + 1) * (L + 1), 2), choose((r + 1) * (L - 1), 2), WL, WR, choose(r * L, 2) + choose(L, 2)], players: [L, r * L, n + r + 1, n - r - 1, 2 * n], leftWins: [WR, G, WL + L, WL - L, choose(L, 2) + r * L * L] }[ask];
      return {
        topic: 'Round robin', rank: 14,
        text: `In a badminton league, every player played every other player exactly once, and no game ended in a tie. There were ${['', '', 'twice', 'three times', 'four times'][r]} as many right-handed players as left-handed players, yet the left-handed players won ${pct === 100 ? 'twice as many games as' : `${pct}% more games than`} the right-handed players. ${{ games: 'How many games were played in all?', players: 'How many players were in the league?', leftWins: 'How many games did the left-handed players win?' }[ask]}`,
        answer: choices(d, value, wrong.filter((v) => v > 0)),
        check: () => {
          const ok = [];
          for (let l = 1; l <= 200; l++) {
            const g = choose((r + 1) * l, 2), right = (g * 100) / (200 + pct), left = g - right;
            if (Number.isInteger(right) && right >= choose(r * l, 2) && left >= choose(l, 2) && left <= choose(l, 2) + r * l * l && right <= choose(r * l, 2) + r * l * l) ok.push({ games: g, players: (r + 1) * l, leftWins: left }[ask]);
          }
          return ok.length === 1 && ok[0] === value ? '' : `answers possible: ${ok.join(', ')}`;
        },
        solution: `Say there are L left-handers and ${r}L right-handers, so there are ${r + 1}L players and C(${r + 1}L, 2) games. Every game has a winner, and the left-handers won ${(100 + pct) / 100} times as many as the right-handers, so for every ${p} games the right-handers won, the left-handers won ${q - p}, and the right-handers won ${frac(p, q)} of all the games. They certainly won the C(${r}L, 2) games among themselves, so ${frac(p, q)}·C(${r + 1}L, 2) ≥ C(${r}L, 2). Writing C(m, 2) as m(m − 1)/2 and multiplying by ${2 * q}/L, this says ${p}·${r + 1}(${r + 1}L − 1) ≥ ${q}·${r}(${r}L − 1), that is ${p * (r + 1) ** 2}L − ${p * (r + 1)} ≥ ${q * r * r}L − ${q * r}, so L ≤ ${X}. The right-handers’ wins, ${frac(p, q)}·C(${r + 1}L, 2), must also be a whole number, so C(${r + 1}L, 2) must be a multiple of ${q}. For L = ${upto(1, X)} it is ${list(fits.map((l) => num(choose((r + 1) * l, 2))))}, and only ${num(G)} is, at L = ${L}. That gives ${n} players, ${num(G)} games, ${num(WR)} won by right-handers and ${num(WL)} by left-handers. ${{ games: `So <b>${num(G)}</b> games were played.`, players: `So there were <b>${n}</b> players.`, leftWins: `So the left-handers won <b>${num(WL)}</b> games.` }[ask]}`,
      };
    },
    // how many games a round robin has
    (d, ctx) => {
      const [n] = combo(ctx, [range(6, 30)]), G = choose(n, 2);
      return {
        topic: 'Round robin', rank: 1,
        text: `In a chess club tournament, each of the ${n} players plays every other player exactly once. How many games are played in all?`,
        answer: choices(d, G, [n * (n - 1), n * n, G + n, choose(n - 1, 2), (n - 1) * (n - 1)]),
        check: () => { let c = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) c++; return c === G ? '' : `counted ${c}, said ${G}`; },
        solution: `Each of the ${n} players plays ${n - 1} games, and adding up every player’s games gives ${n}·${n - 1} = ${num(n * (n - 1))}. But every game has two players in it, so each game was counted twice, and there are ${num(n * (n - 1))}/2 = <b>${num(G)}</b> games.`,
      };
    },
    // home and away
    (d, ctx) => {
      const [n] = combo(ctx, [range(6, 24)]), G = n * (n - 1);
      return {
        topic: 'Round robin', rank: 2,
        text: `In a soccer league of ${n} teams, every team plays every other team twice, once at home and once away. How many games are played in the season?`,
        answer: choices(d, G, [choose(n, 2), n * n, 2 * n * n, G / 2 + n, 2 * (n - 1)]),
        check: () => { let c = 0; for (let home = 0; home < n; home++) for (let away = 0; away < n; away++) if (home !== away) c++; return c === G ? '' : `counted ${c}, said ${G}`; },
        solution: `Each game has a home team and an away team, and every ordered pair of different teams plays once. There are ${n} choices of home team and then ${n - 1} of away team, so there are ${n}·${n - 1} = <b>${num(G)}</b> games. (That is twice the C(${n}, 2) = ${choose(n, 2)} pairs of teams.)`,
      };
    },
    // everyone wins the same number of games
    (d, ctx) => {
      const [n] = combo(ctx, [range(5, 25, 2)]), G = choose(n, 2), w = (n - 1) / 2;
      return {
        topic: 'Round robin', rank: 3,
        text: `In a round-robin tournament with ${n} players, everyone plays everyone else once, no game ends in a tie, and every player wins the same number of games. How many games does each player win?`,
        answer: choices(d, w, [n - 1, (n + 1) / 2, n, G / 2, w - 1].filter((v) => Number.isInteger(v) && v !== w)),
        check: () => { const wins = Array(n).fill(0); for (let i = 0; i < n; i++) for (let j = 1; j <= w; j++) wins[i]++; const games = n * w; return games === G && wins.every((v) => v === w) ? '' : `circle gives ${games} games`; },
        solution: `There are C(${n}, 2) = ${G} games, each with one winner, so ${G} wins are shared equally by ${n} players, ${G}/${n} = <b>${w}</b> each. (It can happen, for example when the players sit in a circle and each one beats the ${w} players after them.)`,
      };
    },
  ],

  'Races with ties': [
    // at most one tie, of any size
    (d, ctx) => {
      const [n, exactly] = combo(ctx, [[4, 6, 7], [false, true]]);
      const tie = range(2, n).map((k) => choose(n, k) * fact(n - k + 1)), ways = (exactly ? 0 : fact(n)) + tie.reduce((s, v) => s + v, 0);
      const cars = range(0, n - 1).map((i) => String.fromCharCode(65 + i)), g = n === 4 ? 2 : 3, tied = [cars[0], ...cars.slice(2, g + 1)];
      const example = [`${cars[1]} first`, `${list(tied)} tied for second`, ...cars.slice(g + 1).map((c, i) => `${c} ${PLACES[g + 2 + i]}`)].join('; ');
      const lost = range(2, n).reduce((s, k) => s + choose(n, k) * fact(n - k), 0) + (exactly ? 0 : fact(n));
      return {
        topic: 'Races with ties', rank: 9,
        text: `${Cap(WORDS[n])} toy cars, ${list(cars)}, run a race. ${exactly ? 'There is exactly one tie' : 'There is at most one tie'}, but a tie can involve any number of cars. For example, one possible result is: ${example}. How many different results are possible?`,
        answer: choices(d, ways, [fact(n), exactly ? ways + fact(n) : ways - fact(n), lost, (exactly ? 0 : fact(n)) + choose(n, 2) * fact(n - 1), ways - 1]),
        check: () => {
          let c = 0;
          for (let code = 0; code < n ** n; code++) {
            const place = range(0, n - 1).map((i) => Math.floor(code / n ** i) % n), seen = new Set(place);
            if (![...seen].every((v) => v < seen.size)) continue;   // places 0, 1, …, j − 1, each used
            const groups = [...seen].filter((v) => place.filter((p) => p === v).length > 1).length;
            if (exactly ? groups === 1 : groups <= 1) c++;
          }
          return c === ways ? '' : `counted ${c}, said ${ways}`;
        },
        solution: `${exactly ? '' : `With no tie there are ${n}! = ${num(fact(n))} orders. `}For a tie of exactly k cars, choose the k cars in C(${n}, k) ways, then treat them as one car, so ${n} − k + 1 “cars” finish in (${n} − k + 1)! orders. That gives ${range(2, n).map((k, i) => `C(${n}, ${k})·${n - k + 1}! = ${choose(n, k)}·${num(fact(n - k + 1))} = ${num(tie[i])} for k = ${k}`).join('; ')}. In all, ${exactly ? '' : `${num(fact(n))} + `}${tie.map((t) => num(t)).join(' + ')} = <b>${num(ways)}</b>.`,
      };
    },
    // one runner ahead of another
    (d, ctx) => {
      const [n] = combo(ctx, [range(4, 8)]), [A, B] = d.shuffle(NAMES), ways = fact(n) / 2;
      return {
        topic: 'Races with ties', rank: 2,
        text: `${Cap(WORDS[n])} runners, including ${A} and ${B}, run a race, and there are no ties. In how many of the possible finishing orders does ${A} finish ahead of ${B}?`,
        answer: choices(d, ways, [fact(n), fact(n - 1), fact(n) - fact(n - 1), fact(n - 2), ways + fact(n - 2)]),
        check: () => { let c = 0; eachPerm(n, (a) => { if (a.indexOf(0) < a.indexOf(1)) c++; }); return c === ways ? '' : `counted ${c}, said ${ways}`; },
        tip: 'Pair each finishing order with the one where the two runners swap places.',
        solution: `Swapping ${A} and ${B} turns every order with ${A} ahead into one with ${B} ahead, and back, so the two kinds of order come in pairs. So exactly half of the ${n}! = ${num(fact(n))} orders have ${A} ahead, ${num(fact(n))}/2 = <b>${num(ways)}</b>.`,
      };
    },
    // gold, silver and bronze
    (d, ctx) => {
      const [n] = combo(ctx, [range(5, 12)]), ways = n * (n - 1) * (n - 2);
      return {
        topic: 'Races with ties', rank: 1,
        text: `In a race of ${n} swimmers, gold, silver and bronze medals go to the first three, and there are no ties. In how many ways can the three medals be given out?`,
        answer: choices(d, ways, [choose(n, 3), n ** 3, n * (n - 1), 3 * n, ways / 2]),
        check: () => { let c = 0; for (let g = 0; g < n; g++) for (let s = 0; s < n; s++) for (let b = 0; b < n; b++) if (g !== s && s !== b && g !== b) c++; return c === ways ? '' : `counted ${c}, said ${ways}`; },
        tip: 'Hand out the medals one at a time, gold first, and multiply the numbers of choices.',
        solution: `Gold can go to any of ${n} swimmers, then silver to any of the other ${n - 1}, then bronze to any of the remaining ${n - 2}, so there are ${n}·${n - 1}·${n - 2} = <b>${num(ways)}</b> ways. (The order matters, since gold and silver are different medals.)`,
      };
    },
    // any ties at all
    (d, ctx) => {
      const [n] = combo(ctx, [[3, 4, 5]]);
      const S = (m, j) => (j === 0 ? (m === 0 ? 1 : 0) : m === 0 ? 0 : j * S(m - 1, j) + S(m - 1, j - 1));
      const terms = range(1, n).map((j) => fact(j) * S(n, j)), ways = terms.reduce((a, b) => a + b, 0);
      return {
        topic: 'Races with ties', rank: 9,
        text: `${Cap(WORDS[n])} horses run a race, and ties are allowed anywhere: any number of horses can share a place, and several places can have ties. How many different results are possible?`,
        answer: choices(d, ways, [fact(n), fact(n) + 1, 2 ** n, n ** n, ways - fact(n) / 2]),
        check: () => {
          let c = 0;
          for (let code = 0; code < n ** n; code++) { const place = range(0, n - 1).map((i) => Math.floor(code / n ** i) % n), seen = new Set(place); if ([...seen].every((v) => v < seen.size)) c++; }
          return c === ways ? '' : `counted ${c}, said ${ways}`;
        },
        solution: `Sort the results by how many different finishing places there are, j. Splitting the ${n} horses into j groups that share a place can be done in S(${n}, j) ways, and the groups can finish in j! orders. Here S(${n}, 1) = 1 (all ${WORDS[n]} together) and S(${n}, ${n}) = 1 (all apart). ${range(2, n - 1).map((j) => `S(${n}, ${j}) = ${S(n, j)}: ${SPLITS[n][j - 1]}.`).join(' ')} Adding j!·S(${n}, j) over j = 1 to ${n} gives ${range(1, n).map((j) => `${fact(j)}·${S(n, j)}`).join(' + ')} = ${terms.join(' + ')} = <b>${num(ways)}</b>.`,
      };
    },
  ],

  'Multiples in blocks': [
    // piles of consecutive cards with exactly one or two multiples
    (d, ctx) => {
      const [[B, k], m, ask] = combo(ctx, [[[10, 6], [10, 8], [10, 9], [12, 7], [12, 8], [12, 10], [15, 8], [15, 11], [20, 11], [20, 13], [20, 17]], [50, 60, 80, 120, 150], [2, 1]]);
      const N = B * m, total = Math.floor(N / k), twos = total - m, value = ask === 2 ? twos : m - twos, name = d.pick(['Ana', 'Felix', 'Rosa', 'Dev']);
      return {
        topic: 'Multiples in blocks', rank: 6,
        text: `${name} writes the whole numbers from 1 to ${num(N)} on cards and deals them, in order, into ${m} piles of ${B}: the first pile gets 1 to ${B}, the second ${B + 1} to ${2 * B}, and so on. How many piles contain exactly ${ask === 2 ? 'two multiples' : 'one multiple'} of ${k}?`,
        answer: choices(d, value, [value - 1, value + 1, ask === 2 ? m - twos : twos, Math.round(total / 2), m - Math.round(m / k)]),
        check: () => {
          let c = 0;
          for (let p = 0; p < m; p++) { let h = 0; for (let x = p * B + 1; x <= (p + 1) * B; x++) if (x % k === 0) h++; if (h === ask) c++; }
          return c === value ? '' : `counted ${c}, said ${value}`;
        },
        solution: `Any ${B} consecutive numbers hold one or two multiples of ${k}, since ${k} &lt; ${B} &lt; ${2 * k}. From 1 to ${num(N)} there are ⌊${num(N)}/${k}⌋ = ${total} multiples of ${k}, spread over ${m} piles. Every pile holds at least one, so if x piles hold two, the piles hold ${m} + x multiples in all, and ${m} + x = ${total} gives x = ${twos}. ${ask === 2 ? `So <b>${twos}</b> piles hold two multiples.` : `The other ${m} − ${twos} = <b>${value}</b> piles hold one.`}`,
      };
    },
    // multiples between two numbers
    (d, ctx) => {
      const [k] = combo(ctx, [range(3, 17)]), A = d.int(11, 99), Bn = d.int(300, 999), up = Math.floor(Bn / k), below = Math.floor((A - 1) / k), value = up - below;
      return {
        topic: 'Multiples in blocks', rank: 1,
        text: `How many multiples of ${k} are there from ${A} to ${Bn}, including both?`,
        answer: choices(d, value, [value - 1, value + 1, Math.floor((Bn - A) / k), up, Math.round((Bn - A) / k) + 2].filter((v) => v !== value)),
        check: () => { let c = 0; for (let x = A; x <= Bn; x++) if (x % k === 0) c++; return c === value ? '' : `counted ${c}, said ${value}`; },
        solution: `Up to ${Bn} there are ⌊${Bn}/${k}⌋ = ${up} multiples of ${k}; up to ${A - 1} there are ⌊${A - 1}/${k}⌋ = ${below}. So from ${A} to ${Bn} there are ${up} − ${below} = <b>${value}</b>.`,
      };
    },
    // rows of seats with no multiple at all
    (d, ctx) => {
      const [[B, k], m] = combo(ctx, [[[8, 11], [10, 13], [10, 17], [12, 15], [12, 19], [9, 14], [15, 19], [6, 11]], [40, 50, 60, 75, 90]]);
      const N = B * m, hit = Math.floor(N / k), value = m - hit;
      return {
        topic: 'Multiples in blocks', rank: 8,
        text: `A theater has ${m} rows of ${B} seats, numbered 1 to ${num(N)} row by row: the first row has seats 1 to ${B}, the second ${B + 1} to ${2 * B}, and so on. How many rows have no seat whose number is a multiple of ${k}?`,
        answer: choices(d, value, [hit, value - 1, value + 1, m - Math.floor(m / k), Math.round(N / k / 2)].filter((v) => v !== value)),
        check: () => { let c = 0; for (let r = 0; r < m; r++) { let h = 0; for (let x = r * B + 1; x <= (r + 1) * B; x++) if (x % k === 0) h++; if (!h) c++; } return c === value ? '' : `counted ${c}, said ${value}`; },
        solution: `A row covers only ${B} consecutive numbers, fewer than ${k}, so it holds at most one multiple of ${k}, and each multiple is in a different row. There are ⌊${num(N)}/${k}⌋ = ${hit} multiples of ${k} up to ${num(N)}, so ${hit} rows have one and ${m} − ${hit} = <b>${value}</b> rows have none.`,
      };
    },
    // numbers with a given remainder
    (d, ctx) => {
      const [k, r] = combo(ctx, [range(4, 13), range(1, 12)], (k, r) => r < k), N = d.int(200, 999), Q = Math.floor((N - r) / k), value = Q + 1;
      return {
        topic: 'Multiples in blocks', rank: 2,
        text: `How many whole numbers from 1 to ${N} leave a remainder of ${r} when divided by ${k}?`,
        answer: choices(d, value, [Q, value + 1, Math.floor(N / k), Math.ceil(N / k) + 1].filter((v) => v !== value)),
        check: () => { let c = 0; for (let x = 1; x <= N; x++) if (x % k === r) c++; return c === value ? '' : `counted ${c}, said ${value}`; },
        solution: `They are ${r}, ${r + k}, ${r + 2 * k}, …, the numbers ${k}q + ${r} with ${k}q + ${r} ≤ ${N}. So q runs from 0 to ⌊(${N} − ${r})/${k}⌋ = ${Q}, which is ${Q} + 1 = <b>${value}</b> numbers.`,
      };
    },
  ],

  'Making postage': [
    // the ways to make an amount from two kinds of stamp
    (d, ctx) => {
      const [[a, b]] = combo(ctx, [[[2, 5], [3, 4], [3, 5], [4, 5], [2, 7], [3, 7], [5, 6]]]);
      const N = d.int(600, 3000), Y = Math.floor(N / b);
      let y0 = 0;
      while ((N - b * y0) % a) y0++;
      const ways = Math.floor((Y - y0) / a) + 1, last = y0 + a * (ways - 1);
      return {
        topic: 'Making postage', rank: 6,
        text: `A post office sells only ${a}-cent and ${b}-cent stamps. In how many ways can exactly ${num(N)} cents of postage be made? (Only how many stamps of each kind are used matters, not their order.)`,
        answer: choices(d, ways, [ways - 1, ways + 1, Math.floor(N / (a * b)), Y, Math.floor(N / (a * b)) + 1]),
        check: () => { let c = 0; for (let y = 0; b * y <= N; y++) for (let x = 0; a * x + b * y <= N; x++) if (a * x + b * y === N) c++; return c === ways ? '' : `counted ${c}, said ${ways}`; },
        solution: `Say y of the stamps are ${b}-cent. The other ${num(N)} − ${b}y cents must be a multiple of ${a}, which happens exactly when ${y0 === 0 ? `y is a multiple of ${a}` : a === 2 ? 'y is odd' : `y is ${y0} more than a multiple of ${a}`}. Also ${b}y ≤ ${num(N)}, so y ≤ ${Y}. So y is ${y0}, ${y0 + a}, ${y0 + 2 * a}, …, ${last} (the largest such y up to ${Y}), which makes (${last} − ${y0})/${a} + 1 = <b>${num(ways)}</b> ways.`,
      };
    },
    // the largest amount that can’t be made
    (d, ctx) => {
      const [[a, b]] = combo(ctx, [COPRIME]), g = a * b - a - b;
      return {
        topic: 'Making postage', rank: 6,
        text: `A machine sells only ${a}-cent and ${b}-cent stamps. What is the largest amount of postage, in cents, that cannot be made exactly with these stamps?`,
        answer: choices(d, g, [a * b, a * b - 1, g - 1, g + a, a + b]),
        check: () => { const can = Array(a * b + 1).fill(false); can[0] = true; for (let x = 1; x <= a * b; x++) can[x] = (x >= a && can[x - a]) || (x >= b && can[x - b]); const top = can.lastIndexOf(false); return top === g ? '' : `largest that can’t be made: ${top}`; },
        solution: `Group the amounts by their remainder when divided by ${a}. Since ${a} and ${b} share no factor, using ${upto(0, a - 1, String, 'or')} of the ${b}-cent stamps (${upto(0, a - 1, (j) => j * b, 'or')} cents) gives every remainder exactly once. Each of those is the smallest amount with its remainder that can be made, and adding ${a}-cent stamps then reaches every larger amount with the same remainder. So the largest amount that can’t be made is ${a} below the biggest of these: ${(a - 1) * b} − ${a} = <b>${g}</b>.`,
      };
    },
    // how many amounts can’t be made
    (d, ctx) => {
      const [[a, b]] = combo(ctx, [COPRIME]), gaps = range(1, a - 1).map((j) => Math.floor((j * b) / a)), count = (a - 1) * (b - 1) / 2;
      return {
        topic: 'Making postage', rank: 9,
        text: `With an unlimited supply of ${a}-cent and ${b}-cent stamps, how many whole-number amounts of postage, in cents, cannot be made at all?`,
        answer: choices(d, count, [a * b - a - b, (a - 1) * (b - 1), count + 1, a + b, count - 1]),
        check: () => { const can = Array(a * b + 1).fill(false); can[0] = true; let c = 0; for (let x = 1; x <= a * b; x++) { can[x] = (x >= a && can[x - a]) || (x >= b && can[x - b]); if (!can[x]) c++; } return c === count ? '' : `counted ${c}, said ${count}`; },
        solution: `For each nonzero remainder when dividing by ${a}, the smallest amount with that remainder that can be made is j·${b} cents, where j is ${upto(1, a - 1, String, 'or')}; the amounts below it with the same remainder can’t be made, and there are ⌊j·${b}/${a}⌋ of them. For j = ${upto(1, a - 1)} that is ${list(gaps.map((g, i) => `⌊${(i + 1) * b}/${a}⌋ = ${g}`))}, and adding them up gives ${gaps.join(' + ')} = <b>${count}</b>, which is (${a} − 1)(${b} − 1)/2.`,
      };
    },
    // the fewest stamps for an amount
    (d, ctx) => {
      const [[a, b]] = combo(ctx, [[[2, 5], [3, 5], [3, 7], [4, 7], [5, 8], [3, 8], [5, 9], [4, 9]]]);
      let N, y;
      do { N = d.int(60, 400); y = Math.floor(N / b); while (y >= 0 && (N - b * y) % a) y--; } while (y < 0);
      const x = (N - b * y) / a, fewest = x + y, most = (() => { let yy = 0; while ((N - b * yy) % a) yy++; return (N - b * yy) / a + yy; })();
      return {
        topic: 'Making postage', rank: 4,
        text: `A post office has ${a}-cent and ${b}-cent stamps. What is the fewest number of stamps that make exactly ${N} cents of postage?`,
        answer: choices(d, fewest, [most, fewest + 1, Math.ceil(N / b), fewest + a - 1, Math.floor(N / b)].filter((v) => v !== fewest)),
        check: () => { let best = Infinity; for (let yy = 0; b * yy <= N; yy++) if ((N - b * yy) % a === 0) best = Math.min(best, yy + (N - b * yy) / a); return best === fewest ? '' : `fewest found ${best}, said ${fewest}`; },
        solution: `With y stamps of ${b} cents, the number of stamps is y + (${N} − ${b}y)/${a}, which gets smaller as y grows, so use as many ${b}-cent stamps as possible. ${x ? `Counting down from ${Math.floor(N / b)}, the first y that leaves a multiple of ${a} is y = ${y}, with ${x} ${x === 1 ? 'stamp' : 'stamps'} of ${a} cents for the other ${N - b * y} cents. So ${y} + ${x} = <b>${fewest}</b> stamps.` : `Here ${N} = ${b}·${y}, so every stamp can be ${b}-cent: <b>${fewest}</b> stamps.`}`,
      };
    },
  ],
};
