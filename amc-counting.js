// Counting: 20 problems modelled on ideas from past AMC 10 counting questions, with new numbers and wording.
// Each appears once in the family; check() counts the answer again another way, by brute force wherever it can.
import { combo, num, frac, gcd, choose } from '../kit/bank.js';
import { choices, range } from './amc-kit.js';

const fact = (n) => (n <= 1 ? 1 : n * fact(n - 1));
const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
const PLACES = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];
const svg = (w, h, label, body) => `<svg class="tri" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`;
const list = (items) => (items.length < 2 ? items.join('') : `${items.slice(0, -1).join(', ')} and ${items.at(-1)}`);
// every ordering of 0 … n − 1 (Heap's algorithm), handed to f (one array, changed in place)
function eachPerm(n, f) {
  const a = range(0, n - 1), c = Array(n).fill(0);
  f(a);
  for (let i = 0; i < n;) {
    if (c[i] < i) { const j = i % 2 ? c[i] : 0; [a[j], a[i]] = [a[i], a[j]]; f(a); c[i]++; i = 0; } else { c[i] = 0; i++; }
  }
}

// the six disks of a triangle: 0 on top, 1 and 2 in the middle row, 3, 4 and 5 along the bottom; its turns and flips
const DISKS = [[150, 36], [120, 88], [180, 88], [90, 140], [150, 140], [210, 140]];
const TURN = [5, 2, 4, 0, 1, 3], FLIP = [0, 2, 1, 5, 4, 3], then = (p, q) => p.map((x) => q[x]);
const SYMMETRIES = [range(0, 5), TURN, then(TURN, TURN), FLIP, then(FLIP, TURN), then(FLIP, then(TURN, TURN))];
const moved = (col, p) => { const out = []; p.forEach((to, from) => { out[to] = col[from]; }); return out.join(''); };
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

export const counting = [
  // 1. greetings at a reunion: the guests who know nobody shake hands with everyone
  (d, ctx) => {
    const [a, b] = combo(ctx, [range(12, 24), range(6, 14)], (a, b) => a !== 20 && b !== 10 && choose(b, 2) + a * b !== 245);
    const n = a + b, shakes = choose(b, 2) + a * b;
    const [who, greet] = d.pick([['former teammates', 'bump fists'], ['cousins', 'hug'], ['old classmates', 'wave']]);
    return {
      topic: 'Handshakes', rank: 8,
      text: `At a reunion of ${n} guests, ${a} are ${who} who all know one another, and each of the other ${b} guests knows nobody there. Two guests who know each other ${greet}; two guests who have never met shake hands. How many handshakes take place?`,
      answer: choices(d, shakes, [a * b, a * b + b * (b - 1), choose(n, 2), 2 * a * b, choose(b, 2)]),
      check: () => { let c = 0; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (j >= a) c++; return c === shakes ? '' : `counted ${c}, said ${shakes}`; },
      solution: `Only the ${b} guests who know nobody shake hands. Each of them shakes hands with all ${a} ${who}: ${a}·${b} = ${a * b}. They also shake hands with one another: C(${b}, 2) = ${choose(b, 2)}. In all, ${a * b} + ${choose(b, 2)} = <b>${num(shakes)}</b>.`,
    };
  },
  // 2. lining up letters so that no two side by side are neighbors in the alphabet (inclusion–exclusion)
  (d, ctx) => {
    const [n, start] = combo(ctx, [[5, 6], range(0, 20)]);
    const letters = range(0, n - 1).map((i) => String.fromCharCode(65 + start + i));
    // forcing k of the n − 1 neighbor pairs together: if they form j runs, (n − k)! orders of the blocks, 2^j ways to flip them
    const terms = range(0, n - 1).map((k) => (k ? fact(n - k) * range(1, k).reduce((s, j) => s + choose(k - 1, j - 1) * choose(n - k, j) * 2 ** j, 0) : fact(n)));
    const ways = terms.reduce((s, t, k) => s + (k % 2 ? -t : t), 0), name = d.pick(['Ravi', 'Noor', 'Tess', 'Omar']);
    return {
      topic: 'Separated neighbors', rank: 10,
      text: `${name} has ${WORDS[n]} letter tiles: ${list(letters)}. In how many orders can the tiles be laid in a row so that no two tiles side by side are neighbors in the alphabet (like ${letters[1]} and ${letters[2]})?`,
      answer: choices(d, ways, n === 5 ? [10, 12, 16, 24] : [72, 84, 96, 120]),
      check: () => {
        const dp = Array.from({ length: 1 << n }, () => Array(n).fill(0));
        for (let i = 0; i < n; i++) dp[1 << i][i] = 1;
        for (let m = 1; m < 1 << n; m++) for (let i = 0; i < n; i++) if (dp[m][i]) for (let j = 0; j < n; j++) if (!((m >> j) & 1) && Math.abs(i - j) !== 1) dp[m | (1 << j)][j] += dp[m][i];
        const c = dp[(1 << n) - 1].reduce((s, v) => s + v, 0);
        return c === ways ? '' : `counted ${c}, said ${ways}`;
      },
      solution: `Use inclusion–exclusion on the ${n - 1} pairs of alphabet neighbors. Forcing k of those pairs to sit together glues the tiles into blocks; a run of glued pairs is one block that can read forward or backward, so if the k pairs make j runs there are (${n} − k)!·2<sup>j</sup> orders. Adding over every choice of k pairs: ${terms.map((t, k) => `k = ${k} gives ${num(t)}`).join('; ')}. So the count is ${terms.map((t, k) => (k ? (k % 2 ? ' − ' : ' + ') : '') + num(t)).join('')} = <b>${num(ways)}</b>.`,
    };
  },
  // 3. as many numbers as possible from 1 to N with none a multiple of another: the smallest number that can be used
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
      topic: 'Sets with no multiples', rank: 17,
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
      solution: `Write each number as an odd number times a power of 2. The ${size} odd numbers up to ${N} each start a chain (1, 2, 4, …; 3, 6, 12, …; and so on), and any two numbers in one chain divide each other, so ${name} takes exactly one number from every chain. Say the picks from the chains of 1, 3 and 9 are 2<sup>a</sup>, 3·2<sup>b</sup> and 9·2<sup>c</sup>. The first can't divide the second, so a > b; likewise b > c ≥ 0. So a ≥ 2 and b ≥ 1, which rules out 1, 2 and 3, while the choice ${list(example.map(String))} shows that 4 can be used. The answer is <b>4</b>.`,
    };
  },
  // 4. how many crossing points five lines can have
  (d, ctx) => {
    const [ask] = combo(ctx, [['sum', 'count']]);
    const values = [0, 1, 4, 5, 6, 7, 8, 9, 10], total = values.reduce((s, v) => s + v, 0), value = ask === 'sum' ? total : values.length;
    return {
      topic: 'Crossing lines', rank: 14,
      text: `Five different straight lines are drawn in a plane, and N is the number of points that lie on two or more of them. ${ask === 'sum' ? 'What is the sum of all the different values that N can take?' : 'How many different values can N take?'}`,
      answer: choices(d, value, ask === 'sum' ? [55, 53, 52, 47, 45] : [11, 10, 8, 7]),
      check: () => {
        const lines = [];
        for (const [a, b] of [[0, 1], [1, 0], [1, 1], [1, -1], [1, 2]]) for (let c = -2; c <= 2; c++) lines.push([a, b, c]);
        const part = (p, q) => { const g = gcd(p, q) || 1, s = q < 0 ? -1 : 1; return `${(s * p) / g}/${(s * q) / g}`; };
        const seen = new Set(), L = lines.length;
        for (let i = 0; i < L; i++) for (let j = i + 1; j < L; j++) for (let k = j + 1; k < L; k++) for (let l = k + 1; l < L; l++) for (let m = l + 1; m < L; m++) {
          const five = [lines[i], lines[j], lines[k], lines[l], lines[m]], pts = new Set();
          for (let x = 0; x < 5; x++) for (let y = x + 1; y < 5; y++) {
            const [a1, b1, c1] = five[x], [a2, b2, c2] = five[y], det = a1 * b2 - a2 * b1;
            if (det) pts.add(part(c1 * b2 - c2 * b1, det) + ',' + part(a1 * c2 - a2 * c1, det));
          }
          seen.add(pts.size);
        }
        const got = [...seen].sort((p, q) => p - q).join(', ');
        return got === values.join(', ') ? '' : `a search through many sets of lines found ${got}`;
      },
      solution: `All five parallel gives N = 0, and all five through one point gives N = 1. Otherwise N ≥ 4: if two or more lines are parallel, the other lines cross them in at least 4 different points; if no two are parallel, then either some point has 3 or more of the lines through it (and a line missing that point crosses those 3 lines in 3 more points), or all C(5, 2) = 10 crossings are different. Every value from 4 to 10 happens: four parallel lines and one more (4); four lines through a point and one more (5); three parallel lines crossed by two parallel lines (6); three parallel lines crossed by two lines meeting elsewhere (7); three lines through a point and two more (8); one parallel pair (9); nothing special (10). ${ask === 'sum' ? 'So the sum is 0 + 1 + 4 + 5 + 6 + 7 + 8 + 9 + 10 = <b>50</b>.' : 'So N is one of 0, 1, 4, 5, 6, 7, 8, 9 and 10: <b>9</b> values.'}`,
    };
  },
  // 5. lattice squares that fit under a steep line
  (d, ctx) => {
    const [k, M] = combo(ctx, [[5, 6, 7, 8, 11, 12, 13], [4, 5, 6]]);
    const c = Math.sqrt(k), tops = range(1, M).map((a) => Math.floor(c * a));
    const sized = (extra) => range(1, M).map((s) => range(0, M - s).reduce((t, a) => t + Math.max(0, Math.floor(c * a) - s + 1 + extra), 0));
    const bySize = sized(0), count = bySize.reduce((s, v) => s + v, 0), loose = sized(1).reduce((s, v) => s + v, 0);
    return {
      topic: 'Lattice squares', rank: 14,
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
      solution: `A square with bottom-left corner (a, b) and side s fits when b ≥ 0, a + s ≤ ${M}, and its top-left corner (a, b + s) is under the line: b + s &lt; a√${k}. At x = 1, 2, …, ${M} the line is at heights whose whole parts are ${tops.join(', ')}, so for each a there are ⌊a√${k}⌋ − s + 1 choices of b (when that is positive). By size: ${bySize.map((v, i) => `side ${i + 1}: ${v}`).filter((s, i) => bySize[i]).join(', ')}. In all, <b>${num(count)}</b> squares.`,
    };
  },
  // 6. painting a triangle of disks, counting paintings that a turn or flip carries onto each other as the same
  (d, ctx) => {
    const [counts] = combo(ctx, [[[2, 2, 2], [4, 1, 1], [3, 3], [2, 2, 1, 1], [4, 2], [3, 1, 1, 1]]]);
    const colors = d.pick([['red', 'blue', 'green', 'yellow'], ['gold', 'silver', 'copper', 'black'], ['white', 'orange', 'purple', 'gray']]);
    const all = [];
    const fill = (s, left) => { if (s.length === 6) { all.push(s); return; } left.forEach((c, i) => { if (c) { left[i]--; fill(s + i, left); left[i]++; } }); };
    fill('', counts.slice());
    const ways = new Set(all.map((s) => SYMMETRIES.map((p) => moved(s.split(''), p)).sort()[0])).size;
    const fixed = (p) => all.filter((s) => moved(s.split(''), p) === s).length, turnFix = fixed(TURN), flipFix = fixed(FLIP);
    const paint = list(counts.map((c, i) => `${WORDS[c]} ${colors[i]}`));
    return {
      topic: 'Colorings up to symmetry', rank: 18,
      text: `Six equal disks are arranged in a triangle, as shown. Each disk is painted one color: ${paint}. Two paintings count as the same if turning or flipping the whole triangle carries one onto the other. How many different paintings are there?`,
      figure: svg(300, 176, 'Six disks in a triangle', '<title>Six disks in a triangle</title>' + DISKS.map(([x, y]) => `<circle class="side" cx="${x}" cy="${y}" r="29"/>`).join('')),
      answer: choices(d, ways, [all.length / 6, all.length / 3, all.length / 2, all.length, ways + 2].filter(Number.isInteger)),
      check: () => {
        const avg = SYMMETRIES.reduce((s, p) => s + fixed(p), 0) / 6;
        return avg === ways ? '' : `Burnside gives ${avg}, said ${ways}`;
      },
      solution: `With the triangle held still there are ${all.length} paintings. The triangle has 6 symmetries: leaving it alone, two turns (by 120° and 240°) and three flips. By Burnside's lemma, the number of different paintings is the average number of paintings that each symmetry leaves unchanged. Leaving it alone keeps all ${all.length}. A turn moves the corner disks around in a cycle of three and the edge disks in another, so it keeps only paintings with all corners one color and all edge disks one color: ${turnFix}. A flip swaps two pairs of disks and keeps two disks in place: it keeps ${flipFix}. Average: (${all.length} + 2·${turnFix} + 3·${flipFix})/6 = <b>${ways}</b>.`,
    };
  },
  // 7. twins who may not sit side by side or one behind the other (inclusion–exclusion over neighboring seats)
  (d, ctx) => {
    const [[rows, cols]] = combo(ctx, [[[2, 3], [3, 2], [2, 4], [4, 2], [3, 3]]]);
    const n = rows * cols, seat = (i, j) => i * cols + j, sideBySide = [], behind = [];
    for (let i = 0; i < rows; i++) for (let j = 0; j < cols; j++) { if (j + 1 < cols) sideBySide.push([seat(i, j), seat(i, j + 1)]); if (i + 1 < rows) behind.push([seat(i, j), seat(i + 1, j)]); }
    const count = (edges) => {
      const E = edges.length, touching = range(0, n - 1).reduce((s, v) => s + choose(edges.filter((e) => e.includes(v)).length, 2), 0), apart = choose(E, 2) - touching;
      return { E, touching, apart, one: 2 * E * fact(n - 2), both: 8 * apart * fact(n - 4), ways: fact(n) - 4 * E * fact(n - 2) + 8 * apart * fact(n - 4) };
    };
    const c = count([...sideBySide, ...behind]), rowsOnly = count(sideBySide).ways, ways = c.ways;
    return {
      topic: 'Seating with rules', rank: 18,
      text: `Two pairs of twins and ${WORDS[n - 4]} other children ride in a minibus with ${WORDS[rows]} rows of ${WORDS[cols]} seats. No child may sit right beside his or her twin in the same row, and no child may sit directly behind his or her twin. In how many ways can the ${n} children be seated?`,
      answer: choices(d, ways, [fact(n) - 2 * c.one, fact(n) - c.one, rowsOnly, ways + c.both / 2, ways - c.both / 2]),
      check: () => {
        const close = [...sideBySide, ...behind];
        let t = 0;
        eachPerm(n, (a) => { if (close.every(([u, v]) => (a[u] >> 1 !== a[v] >> 1) || a[u] > 3)) t++; });
        return t === ways ? '' : `counted ${t}, said ${ways}`;
      },
      solution: `Call two seats close if they are side by side in a row or one directly behind the other: ${rows}·${cols - 1} + ${cols}·${rows - 1} = ${c.E} close pairs. Use inclusion–exclusion. With no rules there are ${n}! = ${num(fact(n))} seatings. The first twins in a close pair: ${c.E}·2·${n - 2}! = ${num(c.one)} seatings, and the same for the second twins. Both: the two close pairs can't share a seat; of the C(${c.E}, 2) = ${choose(c.E, 2)} pairs of close pairs, ${c.touching} share a seat, leaving ${c.apart}. Either set of twins can take either pair, each set sits 2 ways round, and the rest ${n - 4}! ways: 2·${c.apart}·2·2·${n - 4}! = ${num(c.both)}. So ${num(fact(n))} − 2·${num(c.one)} + ${num(c.both)} = <b>${num(ways)}</b>.`,
    };
  },
  // 8. 1 to 9 in a 3 × 3 grid with consecutive numbers in neighboring squares: the corners fix the center
  (d, ctx) => {
    const sums = [...new Set(SNAKES.map((g) => g[0] + g[2] + g[6] + g[8]))].filter((s) => s !== 18).sort((x, y) => x - y);
    const [S] = combo(ctx, [sums]), center = 25 - S, name = d.pick(['Kai', 'Mara', 'Jonah', 'Ines']);
    return {
      topic: 'Number snakes in a grid', rank: 15,
      text: `${name} writes the numbers 1 through 9 in a 3 × 3 grid, one in each square, so that every two consecutive numbers (1 and 2, 2 and 3, …, 8 and 9) are in squares that share a side. The four corner squares hold numbers that add up to ${S}. What number is in the center square?`,
      answer: choices(d, center, range(1, 9).filter((v) => v !== center)),
      check: () => {
        const near = (p, q) => Math.abs((p % 3) - (q % 3)) + Math.abs(Math.floor(p / 3) - Math.floor(q / 3)) === 1, centers = new Set();
        eachPerm(9, (a) => {   // a[i] = the square holding i + 1
          for (let i = 0; i < 8; i++) if (!near(a[i], a[i + 1])) return;
          const g = []; a.forEach((sq, i) => { g[sq] = i + 1; });
          if (g[0] + g[2] + g[6] + g[8] === S) centers.add(g[4]);
        });
        return centers.size === 1 && centers.has(center) ? '' : `centers found: ${[...centers].join(', ')}`;
      },
      solution: `Color the grid like a checkerboard: the four corners and the center are one color (5 squares) and the other 4 squares the other color. Consecutive numbers are in squares that share a side, so the colors alternate along 1, 2, …, 9. Five of the nine numbers are on the first color, so they must be 1, 3, 5, 7 and 9. The corners and center together hold 1 + 3 + 5 + 7 + 9 = 25, so the center is 25 − ${S} = <b>${center}</b>.`,
    };
  },
  // 9. walks along the edges of a cube that visit every corner once
  (d, ctx) => {
    const [ask] = combo(ctx, [['back', 'all']]);
    const ends = [];   // corners are 0 … 7 in binary; neighbors differ in one bit
    const go = (path) => { if (path.length === 8) { ends.push(path.at(-1)); return; } for (const b of [1, 2, 4]) { const q = path.at(-1) ^ b; if (!path.includes(q)) go([...path, q]); } };
    go([0]);
    const all = ends.length, back = ends.filter((e) => [1, 2, 4].includes(e)).length, value = ask === 'back' ? back : all;
    return {
      topic: 'Paths on a cube', rank: 20,
      text: `A beetle starts at a corner of a cube and crawls along exactly 7 edges, passing through every corner of the cube exactly once (its starting corner included). ${ask === 'back' ? 'When it stops, it is one edge away from the corner where it started. How many such walks are possible?' : 'How many such walks are possible?'}`,
      answer: choices(d, value, [6, 9, 12, 18, 24, 36].filter((v) => v !== value)),
      check: () => {
        let total = 0, home = 0, fixedStart = 0, fixedFar = 0;
        eachPerm(7, (a) => {
          const path = [0, ...a.map((x) => x + 1)];
          for (let i = 0; i < 7; i++) if ([1, 2, 4].indexOf(path[i] ^ path[i + 1]) < 0) return;
          total++;
          if ([1, 2, 4].includes(path[7])) home++;
          if (path[1] === 1 && path[2] === 3) { fixedStart++; if (path[7] === 7) fixedFar++; }
        });
        return total === all && home === back && fixedStart === 3 && fixedFar === 1 ? '' : `walks ${total}, back ${home}, after two fixed edges ${fixedStart} (${fixedFar} far)`;
      },
      solution: `The first edge can be any of 3 and the second any of 2, and by symmetry these 6 starts all finish the same number of ways. Fixing them (along one face), there are exactly 3 ways to finish visiting every corner, so there are 6·3 = ${all} walks. ${ask === 'back' ? `A 7-edge walk ends at an odd distance from the start: at one of its 3 neighbors, or at the far corner. Of the 3 finishes for each start, exactly 1 ends at the far corner, so 6 walks can't get back and ${all} − 6 = <b>${back}</b> end one edge from home.` : `So the answer is <b>${all}</b>.`}`,
    };
  },
  // 10. coloring the regions of a rectangle cut into two rows so that regions that touch differ
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
      topic: 'Coloring a map', rank: 9,
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
      solution: `Paint the regions from left to right, in the order their left edges come (top row first at the far left). The first region has ${k} choices. The first region of the other row touches it: ${k - 1} choices. Every later region touches exactly two regions already painted: the one just left of it in its own row, and the one in the other row across from where it starts. Those two touch each other, so they use two different colors and leave ${k - 2} choices. In all, ${k}·${k - 1}·${k - 2}<sup>${n - 2}</sup> = <b>${num(ways)}</b>.`,
    };
  },
  // 11. numbers with only even (or only odd) digits that are multiples of 4, 5 or 25
  (d, ctx) => {
    const [k, rule] = combo(ctx, [[3, 4, 5], ['even5', 'odd5', 'even4', 'odd25']], (k, r) => !(k === 4 && r === 'even5'));
    const p = (e) => 5 ** e, lo = 10 ** (k - 1), hi = 10 ** k - 1;
    const R = {
      even5: { what: 'only even digits and are multiples of 5', ways: 4 * p(k - 2), wrong: [p(k - 1), 4 * p(k - 1), 8 * p(k - 2), 4 ** (k - 1)],
        why: `A multiple of 5 ends in 0 or 5, and 5 is odd, so the last digit is 0. The first digit is 2, 4, 6 or 8 (4 ways) and each of the ${k - 2} digits between can be 0, 2, 4, 6 or 8 (5 ways each): 4·5<sup>${k - 2}</sup>` },
      odd5: { what: 'only odd digits and are multiples of 5', ways: p(k - 1), wrong: [p(k), 4 * p(k - 1), p(k - 2), 2 * p(k - 1)],
        why: `A multiple of 5 ends in 0 or 5, and 0 is even, so the last digit is 5. Each of the other ${k - 1} digits is 1, 3, 5, 7 or 9: 5<sup>${k - 1}</sup>` },
      even4: { what: 'only even digits and are multiples of 4', ways: 12 * p(k - 2), wrong: [p(k - 1), 2 * p(k - 1), 8 * p(k - 2), 15 * p(k - 2)],
        why: `Whether a number is a multiple of 4 depends on its last two digits, 10a + b. With a even, 10a is a multiple of 4, so b must be: b is 0, 4 or 8 (3 ways). The first digit is 2, 4, 6 or 8 (4 ways) and the ${k - 2} digits after it, before the last, can be any of the 5 even digits: 4·5<sup>${k - 2}</sup>·3` },
      odd25: { what: 'only odd digits and are multiples of 25', ways: p(k - 2), wrong: [2 * p(k - 2), p(k - 1), 4 * p(k - 2), p(k - 3)],
        why: `A multiple of 25 ends in 00, 25, 50 or 75, and only 75 uses odd digits. The other ${k - 2} digits are any of 1, 3, 5, 7, 9: 5<sup>${k - 2}</sup>` },
    }[rule];
    return {
      topic: 'Digit rules', rank: 6,
      text: `How many integers from ${num(lo)} to ${num(hi)} have ${R.what}?`,
      answer: choices(d, R.ways, R.wrong),
      check: () => {
        const even = rule.startsWith('even'), m = +rule.replace(/\D/g, '');
        let c = 0;
        for (let x = lo; x <= hi; x++) if (x % m === 0 && String(x).split('').every((ch) => (+ch % 2 === 0) === even)) c++;
        return c === R.ways ? '' : `counted ${c}, said ${R.ways}`;
      },
      solution: `${R.why} = <b>${num(R.ways)}</b>.`,
    };
  },
  // 12. pairing up people around a table who know their neighbors and the person opposite
  (d, ctx) => {
    const [n] = combo(ctx, [[8, 12, 14]]);
    const m = n / 2, byCount = Array(m + 1).fill(0);
    for (let mask = 1; mask < 1 << m; mask++) {
      const pos = range(0, m - 1).filter((i) => (mask >> i) & 1);
      if (pos.every((p, i) => ((i + 1 < pos.length ? pos[i + 1] : pos[0] + m) - p) % 2)) byCount[pos.length]++;
    }
    const ways = 2 + byCount.reduce((s, v) => s + v, 0);
    const parts = byCount.map((v, t) => (v ? `${t} across: ${v}` : '')).filter(Boolean);
    return {
      topic: 'Pairing friends', rank: 17,
      text: `At a dinner, ${n} guests sit evenly spaced around a round table. Each guest is friends with exactly three of the others: the two guests on either side and the guest sitting directly opposite. In how many ways can all ${n} guests be split into ${m} pairs so that the two guests in every pair are friends?`,
      answer: choices(d, ways, [ways - 2, ways - 1, ways + 1, ways + 2, m + 2, 2 * m]),
      check: () => {
        const friends = (i, j) => [1, n - 1, m].includes((j - i + n) % n);
        const pairings = (left) => { if (!left.length) return 1; const [p, ...rest] = left; return rest.filter((q) => friends(p, q)).reduce((s, q) => s + pairings(rest.filter((x) => x !== q)), 0); };
        const c = pairings(range(0, n - 1));
        return c === ways ? '' : `counted ${c}, said ${ways}`;
      },
      solution: `Every pair is two neighbors or two guests sitting opposite. With no one paired across the table, the pairs go around the circle: 2 ways. Otherwise, the guests in across-pairs split the others into arcs, and each arc must pair off with neighbors, so each arc needs an even number of guests (then it pairs up in exactly one way). Numbering the ${m} lines across the table in order, this means the chosen lines are an odd number of steps apart, all the way around. Counting the choices by how many lines are used: ${parts.join('; ')}. In all, 2 + ${byCount.filter(Boolean).join(' + ')} = <b>${ways}</b>.`,
    };
  },
  // 13. knights, knaves and jokers answering the same three questions
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
      topic: 'Knights, knaves and jokers', rank: 12,
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
      solution: `Work out how each type answers. A Knight says yes, no, no. A Knave lies every time: yes, yes, no. A Joker who starts with the truth says no, no, no, and a Joker who starts with a lie says yes, yes, yes. So the first question's ${y1} yeses come from Knights, Knaves and lying-first Jokers; the second's ${y2} from Knaves and lying-first Jokers; the third's ${y3} from lying-first Jokers only. ${Q[3]}`,
    };
  },
  // 14. splitting two groups into teams with a fixed mix
  (d, ctx) => {
    const [[g, a, b]] = combo(ctx, [[[2, 3, 2], [2, 2, 2], [3, 1, 3], [4, 2, 1], [3, 2, 1], [2, 4, 2], [2, 2, 3]]]);
    const J = g * a, S = g * b, split = fact(J) / (fact(a) ** g * fact(g)), deal = fact(S) / fact(b) ** g, ways = split * deal;
    const [[p1, pp], [q1, qq]] = d.pick([[['sixth grader', 'sixth graders'], ['seventh grader', 'seventh graders']], [['violinist', 'violinists'], ['cellist', 'cellists']], [['sophomore', 'sophomores'], ['freshman', 'freshmen']]]);
    const some = (c, one, many) => `${WORDS[c]} ${c === 1 ? one : many}`;
    return {
      topic: 'Forming teams', rank: 9,
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
      solution: `First split the ${J} ${pp} into ${g} groups of ${a}: ${J}!/((${a}!)<sup>${g}</sup>·${g}!) = ${num(split)} ways (dividing by ${g}! because the groups come in no order). Now the groups are different from each other, so hand out the ${S} ${qq}, ${b} to each group: ${S}!/(${b}!)<sup>${g}</sup> = ${num(deal)} ways. In all, ${num(split)}·${num(deal)} = <b>${num(ways)}</b>.`,
    };
  },
  // 15. the biggest set in 1..N where no member is the sum of two members
  (d, ctx) => {
    const [N, twice] = combo(ctx, [range(14, 20), [true, false]]);
    const most = twice ? Math.ceil(N / 2) : Math.floor(N / 2) + 1, name = d.pick(['Mia', 'Theo', 'Asha', 'Ben']);
    return {
      topic: 'Sum-free sets', rank: 14,
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
        ? `Let m be the largest chosen number. For each x &lt; m/2, at most one of x and m − x can be chosen (their sum is m), and m/2 can't be chosen (m/2 + m/2 = m). So besides m there are at most ⌊(m − 1)/2⌋ numbers, ⌈m/2⌉ in all, which is at most ⌈${N}/2⌉ = ${most}. The odd numbers 1, 3, 5, … reach it, since two odd numbers always add to an even one: <b>${most}</b>.`
        : `Let m be the largest chosen number. For each x &lt; m/2, at most one of x and m − x can be chosen (their sum is m); now m/2 is allowed, since it would have to be added to itself. That leaves at most ⌊${N}/2⌋ + 1 = ${most} numbers. The numbers from ${Math.ceil(N / 2)} to ${N} reach it, since two different ones add to more than ${N}: <b>${most}</b>.`,
    };
  },
  // 16. numbers whose digits rise against numbers whose digits fall
  (d, ctx) => {
    const [k, upTo] = combo(ctx, [[3, 4, 5], [false, true]]);
    const diff = upTo ? range(2, k).reduce((s, j) => s + choose(9, j - 1), 0) : choose(9, k - 1);
    const up = upTo ? range(2, k).reduce((s, j) => s + choose(9, j), 0) : choose(9, k), down = upTo ? range(2, k).reduce((s, j) => s + choose(10, j), 0) : choose(10, k);
    return {
      topic: 'Rising and falling digits', rank: 16,
      text: `Call a number with at least two digits a climber if its digits strictly increase from left to right, like 1479, and a slider if its digits strictly decrease, like 8530. ${upTo ? `Among the numbers from 10 to ${num(10 ** k - 1)}, how many more sliders are there than climbers?` : `How many more ${k}-digit sliders are there than ${k}-digit climbers?`}`,
      answer: choices(d, diff, [down, up, diff + (upTo ? k - 1 : 1), upTo ? diff - 9 : choose(10, k - 1), 0]),
      check: () => {
        let u = 0, w = 0;
        for (let x = 10; x < (upTo ? 10 ** k : 10 ** k); x++) {
          if (!upTo && x < 10 ** (k - 1)) continue;
          const s = String(x);
          if ([...s].every((c, i) => !i || c > s[i - 1])) u++;
          if ([...s].every((c, i) => !i || c < s[i - 1])) w++;
        }
        return w - u === diff && u === up && w === down ? '' : `counted ${w} − ${u}, said ${diff}`;
      },
      solution: `A climber with j digits is j different digits from 1 to 9 written in increasing order (0 can never appear: it can't lead, and nothing smaller can come before it), so there are C(9, j). A slider with j digits is any j different digits from 0 to 9 written in decreasing order (0 can only go last), so there are C(10, j). The difference C(10, j) − C(9, j) = C(9, j − 1) counts the sliders ending in 0. ${upTo ? `For lengths 2 to ${k}: ${range(2, k).map((j) => choose(9, j - 1)).join(' + ')} = <b>${num(diff)}</b>.` : `With j = ${k}: ${choose(10, k)} − ${choose(9, k)} = <b>${num(diff)}</b>.`}`,
    };
  },
  // 17. a round robin where the outnumbered left-handers win more games
  (d, ctx) => {
    const [r, pct] = combo(ctx, [[2, 3, 4], [20, 25, 30, 40, 50, 60, 75, 80, 100]], (r, pct) => {
      if (r === 2 && pct === 40) return false;
      const { fits, whole } = league(r, pct), wholeFits = fits.filter((L) => (choose((r + 1) * L, 2) * 100) % (200 + pct) === 0);
      return fits.length > 0 && fits.every((L, i) => L === i + 1) && wholeFits.length === 1 && whole.length === 1 && whole[0] === wholeFits[0] && whole[0] >= 3;
    });
    const { fits, whole: [L] } = league(r, pct), X = fits.at(-1), n = (r + 1) * L, G = choose(n, 2), WR = (G * 100) / (200 + pct), WL = G - WR;
    return {
      topic: 'Round robin', rank: 16,
      text: `In a badminton league, every player played every other player exactly once, and no game ended in a tie. There were ${['', '', 'twice', 'three times', 'four times'][r]} as many right-handed players as left-handed players, yet the left-handed players won ${pct === 100 ? 'twice as many games as' : `${pct}% more games than`} the right-handed players. How many games were played in all?`,
      answer: choices(d, G, [choose((r + 1) * (L + 1), 2), choose((r + 1) * (L - 1), 2), WL, WR, choose(r * L, 2) + choose(L, 2)].filter((v) => v > 0)),
      check: () => {
        const ok = [];
        for (let l = 1; l <= 200; l++) {
          const g = choose((r + 1) * l, 2), right = (g * 100) / (200 + pct), left = g - right;
          if (Number.isInteger(right) && right >= choose(r * l, 2) && left >= choose(l, 2) && left <= choose(l, 2) + r * l * l && right <= choose(r * l, 2) + r * l * l) ok.push(g);
        }
        return ok.length === 1 && ok[0] === G ? '' : `games possible: ${ok.join(', ')}`;
      },
      solution: `Say there are L left-handers and ${r}L right-handers: ${r + 1}L players and C(${r + 1}L, 2) games. Every game has a winner, and the left-handers won ${(100 + pct) / 100} times as many as the right-handers, so the right-handers won ${frac(100, 200 + pct)} of all the games. They certainly won the C(${r}L, 2) games among themselves, and ${frac(100, 200 + pct)}·C(${r + 1}L, 2) ≥ C(${r}L, 2) only holds for L ≤ ${X}. Of L = 1, 2, …, ${X}, only L = ${L} makes the numbers of wins whole: ${n} players, ${num(G)} games, ${num(WR)} won by right-handers and ${num(WL)} by left-handers. So <b>${num(G)}</b> games were played.`,
    };
  },
  // 18. results of a race when at most one tie (of any size) can happen
  (d, ctx) => {
    const [n, exactly] = combo(ctx, [[4, 6, 7], [false, true]]);
    const tie = range(2, n).map((k) => choose(n, k) * fact(n - k + 1)), ways = (exactly ? 0 : fact(n)) + tie.reduce((s, v) => s + v, 0);
    const cars = range(0, n - 1).map((i) => String.fromCharCode(65 + i)), g = n === 4 ? 2 : 3, tied = [cars[0], ...cars.slice(2, g + 1)];
    const example = [`${cars[1]} first`, `${list(tied)} tied for second`, ...cars.slice(g + 1).map((c, i) => `${c} ${PLACES[g + 2 + i]}`)].join('; ');
    const lost = range(2, n).reduce((s, k) => s + choose(n, k) * fact(n - k), 0) + (exactly ? 0 : fact(n));
    return {
      topic: 'Races with ties', rank: 17,
      text: `${WORDS[n][0].toUpperCase() + WORDS[n].slice(1)} toy cars, ${list(cars)}, run a race. ${exactly ? 'There is exactly one tie' : 'There is at most one tie'}, but a tie can involve any number of cars. For example, one possible result is: ${example}. How many different results are possible?`,
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
      solution: `${exactly ? '' : `With no tie there are ${n}! = ${num(fact(n))} orders. `}A tie of exactly k cars: choose the k cars in C(${n}, k) ways, then treat them as one car, so ${n} − k + 1 “cars” finish in (${n} − k + 1)! orders. For k = ${range(2, n).join(', ')} that gives ${tie.map((t) => num(t)).join(', ')}. In all, ${exactly ? '' : `${num(fact(n))} + `}${tie.map((t) => num(t)).join(' + ')} = <b>${num(ways)}</b>.`,
    };
  },
  // 19. blocks of consecutive numbers holding exactly one or two multiples of k
  (d, ctx) => {
    const [[B, k], m, ask] = combo(ctx, [[[10, 6], [10, 8], [10, 9], [12, 7], [12, 8], [12, 10], [15, 8], [15, 11], [20, 11], [20, 13], [20, 17]], [50, 60, 80, 120, 150], [2, 1]]);
    const N = B * m, total = Math.floor(N / k), twos = total - m, value = ask === 2 ? twos : m - twos, name = d.pick(['Ana', 'Felix', 'Rosa', 'Dev']);
    return {
      topic: 'Multiples in blocks', rank: 8,
      text: `${name} writes the whole numbers from 1 to ${num(N)} on cards and deals them, in order, into ${m} piles of ${B}: the first pile gets 1 to ${B}, the second ${B + 1} to ${2 * B}, and so on. How many piles contain exactly ${ask === 2 ? 'two multiples' : 'one multiple'} of ${k}?`,
      answer: choices(d, value, [value - 1, value + 1, ask === 2 ? m - twos : twos, Math.round(total / 2), m - Math.round(m / k)]),
      check: () => {
        let c = 0;
        for (let p = 0; p < m; p++) { let h = 0; for (let x = p * B + 1; x <= (p + 1) * B; x++) if (x % k === 0) h++; if (h === ask) c++; }
        return c === value ? '' : `counted ${c}, said ${value}`;
      },
      solution: `Any ${B} consecutive numbers hold one or two multiples of ${k}, since ${k} &lt; ${B} &lt; ${2 * k}. From 1 to ${num(N)} there are ⌊${N}/${k}⌋ = ${total} multiples of ${k}, spread over ${m} piles. If x piles hold two, then ${m} + x = ${total}, so x = ${twos}. ${ask === 2 ? `So <b>${twos}</b> piles hold two multiples.` : `The other ${m} − ${twos} = <b>${value}</b> piles hold one.`}`,
    };
  },
  // 20. making an amount of postage from two kinds of stamp
  (d, ctx) => {
    const [[a, b]] = combo(ctx, [[[2, 5], [3, 4], [3, 5], [4, 5], [2, 7], [3, 7], [5, 6]]]);
    const N = d.int(600, 3000), Y = Math.floor(N / b);
    let y0 = 0;
    while ((N - b * y0) % a) y0++;
    const ways = Math.floor((Y - y0) / a) + 1, last = y0 + a * (ways - 1);
    return {
      topic: 'Making postage', rank: 14,
      text: `A post office sells only ${a}-cent and ${b}-cent stamps. In how many ways can exactly ${num(N)} cents of postage be made? (Only how many stamps of each kind are used matters, not their order.)`,
      answer: choices(d, ways, [ways - 1, ways + 1, Math.floor(N / (a * b)), Y, Math.floor(N / (a * b)) + 1]),
      check: () => {
        let c = 0;
        for (let y = 0; b * y <= N; y++) for (let x = 0; a * x + b * y <= N; x++) if (a * x + b * y === N) c++;
        return c === ways ? '' : `counted ${c}, said ${ways}`;
      },
      solution: `Say y of the stamps are ${b}-cent. The other ${num(N)} − ${b}y cents must be a multiple of ${a}, which happens exactly when y is ${y0} more than a multiple of ${a}. Also ${b}y ≤ ${num(N)}, so y ≤ ${Y}. So y is ${y0}, ${y0 + a}, ${y0 + 2 * a}, …, ${last}: that is (${last} − ${y0})/${a} + 1 = <b>${num(ways)}</b> ways.`,
    };
  },
];
