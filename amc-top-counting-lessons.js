// Lessons for the hardest counting and probability topics (amc-top-counting.js): the order to learn them in, and for each
// one how to spot it, the idea, how to do it, facts worth knowing, what to watch out for, and a tip (the first hint).
export const topics = [
  'Grid routes with roadblocks', 'Keeping pairs apart', 'Subsets with a sum or product rule', 'Tiling wider boards',
  'Linearity of expectation', 'Chances given what you saw', 'Chances from lengths and arcs', 'A bug on a solid',
];

export const lessons = {
  'Grid routes with roadblocks': {
    spot: 'When you count shortest routes on a grid of streets (only east and north) that must miss closed corners or a closed block, turn a set number of times, or never cross a line, and the same counts in disguise: strings of letters, ballots counted one at a time, or a line of people paying with $5 and $10 bills.',
    idea: 'A route m blocks east and n blocks north is an order of m E’s and n N’s, so there are C(m + n, n) of them, and the routes through a point P number (routes to P)·(routes from P). Closed corners are handled by inclusion and exclusion: take away the routes through each one, then add back those through two of them, which is possible only when one is east and north of the other. A closed block of corners is easier one side at a time: every route passes it below or above, and you can sort the routes by where they cross the block’s last column or top row. A route with exactly t turns is t + 1 runs, alternating between E and N, and cutting m blocks into k runs that are not empty can be done in C(m − 1, k − 1) ways. “Never behind” uses a reflection: in a bad string, swap every letter up to the first point where the wrong side leads by one. For example, with 5 A’s and 3 B’s, C(8, 3) − C(8, 2) = 56 − 28 = 28 orders never have more B’s than A’s so far.',
    how: [
      'Turn the grid into letters: a route is a string of E’s and N’s, and C(m + n, n) counts them.',
      'Through a point, multiply the routes to it by the routes from it; through two points in order, multiply three counts.',
      'Closed corners: all routes, minus those through each corner, plus those through each pair of corners. Check that a pair can really lie on one route.',
      'Turns: count the runs, decide which direction comes first, and cut the E’s and N’s into runs with C(m − 1, k − 1). Add both starting directions.',
      'Never behind (ballots, change at a ticket booth): all strings minus C(a + b, b − 1), by the reflection.',
    ],
    facts: [
      'Routes m east and n north: C(m + n, n); through P = (p, q): C(p + q, p)·C(m − p + n − q, m − p).',
      'm things in a row cut into k runs, none empty: C(m − 1, k − 1).',
      'Strings of a A’s and b B’s (a ≥ b) in which the B’s never get ahead: C(a + b, b) − C(a + b, b − 1). The A’s are strictly ahead the whole way with chance (a − b)/(a + b).',
    ],
    watch: [
      'Adding back routes through two closed corners that no route can pass together, because neither is east and north of the other.',
      'Counting only the routes that start east, when routes with the same number of turns can also start north.',
      'Using C(m, k) instead of C(m − 1, k − 1) for cutting m blocks into k runs that are not empty.',
      'Reflecting at the wrong moment: swap up to the first time the wrong side leads by exactly one.',
    ],
    tip: 'Write each route as a string of E’s and N’s, then count the bad ones and take them away.',
  },
  'Keeping pairs apart': {
    spot: 'When the letters of a word with repeated letters, flags of a few colors, or married couples are arranged in a row or around a table, and some pairs must not be side by side (or exactly some of them must be).',
    idea: 'Use inclusion and exclusion over the pairs that touch. Glue a pair that is together into one block and count the arrangements of what is left; do that for every choice of j pairs, and add and subtract: everything, minus one pair glued, plus two pairs glued, and so on. With repeated letters, divide by 2 for each doubled letter still in two pieces. For example, BALLOON has 7!/4 = 1,260 arrangements; gluing the L’s gives 6!/2 = 360, the same for the O’s, and gluing both gives 5! = 120, so 1,260 − 720 + 120 = 660 have no two equal letters together. For exactly r pairs together, choose those r and glue them first, then keep the others apart. When couples must alternate men and women with nobody beside their own spouse, seat the men first, then use inclusion and exclusion on the neighboring pairs of chairs: k chosen pairs can all hold couples only if no two of them share a chair.',
    how: [
      'List the pairs that must stay apart: doubled letters, colors, couples.',
      'Count everything, then for each j glue j chosen pairs into blocks: C(k, j)·(N − j)!/2<sup>k − j</sup> for k doubled letters among N.',
      'Alternate the signs: S<sub>0</sub> − S<sub>1</sub> + S<sub>2</sub> − ⋯.',
      'For exactly r together, choose them in C(k, r) ways, glue them, and keep the other doubled letters apart in the same way.',
      'For alternating couples, seat the men (2·n! ways at a numbered table or in a row), then place the women by inclusion and exclusion over neighboring pairs of chairs, no two of them touching.',
    ],
    facts: [
      'k letters doubled among N letters in all: N!/2<sup>k</sup> arrangements.',
      'Choosing k of m places in a row with no two next to each other: C(m − k + 1, k); around a ring of m: C(m − k, k) + C(m − k − 1, k − 1).',
      'Three couples alternating around a table with numbered chairs, nobody beside their own spouse: 12 seatings.',
    ],
    watch: [
      'Forgetting that a glued pair is one block, so the number of things drops by one for each glued pair.',
      'Multiplying a glued block of two equal letters by 2: AA reads the same both ways.',
      'Stopping after the first subtraction: the arrangements with two pairs together were taken away twice.',
      '“Exactly one pair together” is not the same as “at least one pair together”.',
    ],
    tip: 'Count everything, then glue the pairs that touch into blocks and use inclusion and exclusion.',
  },
  'Subsets with a sum or product rule': {
    spot: 'When you count subsets, or choices of a few numbers, whose sum is a multiple of something or leaves a given remainder, or whose product is a perfect square (or twice one).',
    idea: 'Only remainders matter for a sum, so sort the numbers by their remainders. For a few numbers, list the patterns of remainders that add up to a multiple of m, and count each pattern with binomial coefficients. For subsets of any size with a sum divisible by 3, the multiples of 3 are free (2 choices each), and if a numbers that leave 1 and b that leave 2 are chosen, the sum leaves the same remainder as a − b, so you need a and b to leave the same remainder. For a square product, only the parity of each prime’s power matters: choose all the numbers that are not prime freely, and then each prime p is the only number left that changes the power of p, so it is forced in or out. For example, {1, …, 10} has 6 numbers that are not prime, so 2<sup>6</sup> = 64 of its subsets have a square product.',
    how: [
      'Sort the numbers by remainder and write down how many are in each class.',
      'For k numbers: list the remainder patterns that add up to a multiple of m, and count each as a product of C(class size, how many are taken).',
      'For all subsets with a sum divisible by 3: 2 to the number of multiples of 3, times the sum of C(r<sub>1</sub>, a)·C(r<sub>2</sub>, b) over the pairs with a − b a multiple of 3.',
      'For a square (or twice a square) product: choose the numbers that are not prime freely, then each prime is forced.',
    ],
    facts: [
      'a + 2b leaves the same remainder on division by 3 as a − b.',
      'Each prime p in {1, …, n} is the only number there that is exactly p, so it can fix the parity of the power of p in one way.',
      'Three numbers add to a multiple of 3 exactly when their remainders are all the same or all different.',
    ],
    watch: [
      'Missing a remainder pattern, like three numbers from one class, or two from one class and one from another.',
      'Leaving out the free multiples of 3, which double the count each.',
      'Counting the empty set when the question says nonempty, or dropping it when the question includes it.',
      'Thinking a prime above n/2 lowers the count: it is simply forced out, which is one way.',
    ],
    tip: 'Only remainders, or the parities of prime powers, matter, so sort the numbers by them first.',
  },
  'Tiling wider boards': {
    spot: 'When you count the ways to cover a 2 × n or 3 × n board with dominoes, unit squares or L-shaped pieces, with no gaps or overlaps.',
    idea: 'Look at how one end of the board can be covered, and see what is left. On a 2-wide board with only dominoes, what is left is always a shorter full board, which gives a rule like the Fibonacci numbers. With L-pieces, or on a 3-wide board, some ways leave a board with a square missing or sticking out, so keep a second count for that shape and write a rule for it too. For example, for a 3 × n board with dominoes let f(n) count the full boards and g(n) the boards with a corner square missing: then f(n) = f(n − 2) + 2g(n − 1) and g(n) = f(n − 1) + g(n − 2), which give f(2) = 3 and f(4) = 3 + 2·4 = 11.',
    how: [
      'Fix one end of the board and list every way its end column can be covered.',
      'For each way, describe the shape that is left: a shorter full board, or one with a square missing or sticking out.',
      'Give each new shape its own count, and write a rule for it in the same way.',
      'Start from the smallest boards (the empty board counts as 1 way) and fill in a table up to the size asked.',
    ],
    facts: [
      'A 2 × n board with dominoes: 1, 2, 3, 5, 8, … ways (the Fibonacci numbers).',
      'A 3 × n board can be covered by dominoes only when n is even.',
      'A board with a square sticking out is often the same count as one with a square missing at the other end.',
    ],
    watch: [
      'Forgetting that an L-piece, or another lopsided shape, can sit at the end in two mirror-image ways.',
      'Counting the same covering twice by letting a piece cover the end in two different steps.',
      'Using the 2-wide rule on a 3-wide board: there a standing domino leaves a jagged edge, not a shorter board.',
    ],
    tip: 'Look at how the end column can be covered, and give each leftover shape its own count.',
  },
  'Linearity of expectation': {
    spot: 'When the question asks for the expected number of something that is a count: runs of colors, cards before the first ace, cards left over, rolls until every face has shown, squares with matching corners.',
    idea: 'The expected value of a sum is the sum of the expected values, even when the parts depend on each other. So write the count as a sum of yes-or-no pieces (1 if a given pair of neighbors differs, 1 if a given card comes before every ace) and add up their chances. For example, in a shuffled 52-card deck each of the 48 cards that are not aces comes before all 4 aces with chance 1/5, since it is equally likely to be anywhere among itself and the aces; so the first ace is at position 1 + 48/5 = 53/5 on average. Waiting times split the same way into stages: while i wanted faces of an s-sided die are still missing, the stage lasts s/i rolls on average.',
    how: [
      'Write the thing being counted as a sum of yes-or-no pieces, one for each pair, card, square or stage.',
      'Find the chance of one piece; by symmetry it is often the same for all of them.',
      'Multiply by the number of pieces, or add up the pieces when their chances differ.',
      'For a wait, split it into stages and add 1/p for each stage that ends with chance p per try.',
    ],
    facts: [
      'Two neighboring places in a random row of r red and b blue differ in color with chance 2rb/((r + b)(r + b − 1)).',
      'With k special cards among N, a given ordinary card is in each of the k + 1 gaps around them with chance 1/(k + 1).',
      'Something with chance p per try takes 1/p tries on average.',
      'Four corners all one of c colors, each chosen at random: chance 1/c<sup>3</sup>.',
    ],
    watch: [
      'Using the chance with replacement, r/N·b/N, when the marbles are placed without replacement.',
      'Forgetting the first run, or the special card itself, in the final count.',
      'Counting only upright squares when tilted ones count too.',
    ],
    tip: 'Write what you are counting as a sum of yes-or-no pieces, and add up their chances.',
  },
  'Chances given what you saw': {
    spot: 'When you are told something about the result (every flip was heads, exactly two coins came up heads, every roll was even, the dice add up to 10) and asked for a chance or an expected value given that.',
    idea: 'Being told something means: keep only the outcomes that fit it, and rescale their chances so they add up to 1. Weigh each possible cause by its chance times the chance that it gives what you saw. For example, with 3 fair coins and 1 two-headed coin in a jar, three heads in a row give weights 3·1/8 and 1·1, which are 3 and 8 after multiplying by 8, so the coin is two-headed with probability 8/11. Conditions can surprise: rolling a die until a 6, given that every roll was even, short runs are favored (each extra roll had to dodge 1, 3 and 5), so the expected number of rolls is 3/2, not 3.',
    how: [
      'List the possible causes or outcomes, with their chances before you knew anything.',
      'Multiply each by the chance of what you saw, given that cause.',
      'Scale the weights to whole numbers and divide each by their total.',
      'For a later event (like the next flip), average its chance over the causes, using the new weights.',
      'With dice, count the ordered outcomes that fit what you were told; those are equally likely.',
    ],
    facts: [
      'P(A given B) = P(A and B) ÷ P(B).',
      'Three dice have 27 ordered ways to add up to 10, and 25 ways to add up to 9.',
      'Weights can be scaled by any number before dividing by their total.',
    ],
    watch: [
      'Treating unordered outcomes, like 6 + 3 + 1 and 4 + 3 + 3, as equally likely.',
      'Giving the chance of the cause when the question asks about the next flip.',
      'Thinking a condition like “every roll was even” just turns the die into a smaller die.',
    ],
    tip: 'Keep only the outcomes that fit what you were told, weigh each by its chance, and rescale.',
  },
  'Chances from lengths and arcs': {
    spot: 'When numbers are chosen at random from an interval, a stick is cut at random points, or points are dropped at random on a circle, and you want the chance of a condition.',
    idea: 'Two random numbers are a random point in a rectangle, so a chance is an area divided by the rectangle’s area. Write the condition as inequalities, draw their lines, and cut the region into triangles and trapezoids. A stick cut at two random points gives a random point of the triangle 0 &lt; x &lt; y &lt; L, and a rule like “every piece is at least c” cuts out a smaller triangle of the same shape, so the chance is a ratio of squares. For points on a circle, ask which point starts the arc: if k points all fit in an arc that is a fraction f of the circle (f at most 1/2), exactly one of them has all the others within f clockwise of it, so the chance is k·f<sup>k − 1</sup>. For example, 4 random points lie in some semicircle with chance 4·(1/2)<sup>3</sup> = 1/2.',
    how: [
      'Turn the random choices into a point in a rectangle or triangle.',
      'Write each condition as a straight-line inequality and draw its line.',
      'Find the good area with triangles and trapezoids, or the bad area if that is simpler.',
      'For cut sticks, use similar triangles: a corner with legs a out of L has chance (a/L)<sup>2</sup>, and corners that overlap are added back.',
      'For points on a circle, add up over which point starts the arc.',
    ],
    facts: [
      'A stick cut at two random points makes pieces that form a triangle with chance 1/4.',
      'Every piece of a stick of length L is at least c with chance ((L − 3c)/L)<sup>2</sup>.',
      'The polygon with k random points of a circle as corners contains the center exactly when the points do not all lie in one semicircle.',
    ],
    watch: [
      'Forgetting a corner piece, like x + y &lt; c, when listing where a triangle fails.',
      'Treating a trapezoid as a triangle when a line runs out through the side of the rectangle.',
      'Leaving out the overlaps when two pieces can both be long.',
    ],
    tip: 'Draw the random choices as a point in a region, and find the good part as an area.',
  },
  'A bug on a solid': {
    spot: 'When a bug walks at random along the edges of a cube, octahedron, icosahedron or dodecahedron, and you want the chance of reaching one vertex before another, the expected number of moves, or the chance of being somewhere after n moves.',
    idea: 'By symmetry only the bug’s distance from its start matters, so group the vertices into layers by distance and count, for a vertex in each layer, its edges back, sideways and out. For a chance, give each layer an unknown equal to the average over its edges, and write the unknowns one by one in terms of the first. For an expected time, add up the times to step out one layer at a time: if a vertex has b edges back and f out of d in all, the step from its layer takes h = (d + b·h′)/f moves on average, where h′ is the step before it. On a cube the layers have 1, 3, 3 and 1 vertices, the steps take 1, (3 + 1)/2 = 2 and (3 + 2·2)/1 = 7 moves, and reaching the opposite corner takes 10 moves on average.',
    how: [
      'Group the vertices by distance from the start and count each layer.',
      'For one vertex of each layer, count its edges back, sideways and out.',
      'For a race between two vertices: one unknown per layer, each the average over the edges; solve outward from the start.',
      'For an expected time: step out (or in) one layer at a time with h = (d + b·h′)/f, and add up the steps.',
      'After n moves: a rule for the chance of being at the start, often looking two moves at a time.',
    ],
    facts: [
      'Layers by distance from a vertex: cube 1, 3, 3, 1; octahedron 1, 4, 1; icosahedron 1, 5, 5, 1; dodecahedron 1, 3, 6, 6, 3, 1.',
      'On a cube or dodecahedron every move changes the distance by exactly 1; on an octahedron or icosahedron a move can stay in the same layer.',
      'The first move from the start always goes out to distance 1.',
    ],
    watch: [
      'Forgetting the sideways edges: on an octahedron or icosahedron a vertex has neighbors in its own layer.',
      'Forgetting to count the first move.',
      'Charging a step back only once: after it, the bug must climb that layer again and then the one it was in.',
    ],
    tip: 'Use symmetry: all that matters is how far the bug is from where it started.',
  },
};
