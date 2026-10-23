// Learning AMC 10 Practice: the path (five units, each in an order where a topic builds on the ones before) and a
// short lesson for every topic: the idea, how to do it, what to watch out for, and a tip after a wrong answer.
export const amcLearning = {
  path: [
    { unit: 'Arithmetic and algebra', topics: [
      'Percent change', 'Percent of what is left', 'Saying and meaning', 'Averages', 'Working together',
      'Arithmetic sequences', 'Triangular numbers', 'Geometric series', 'Fibonacci remainders',
      'Recursive functions', 'Reciprocal sequences', 'Perpendicular lines', 'Parabolas and triangles',
      'Symmetric sums', 'Least value of a product', 'Ratios of big powers', 'Age multiples'
    ] },
    { unit: 'Number theory', topics: [
      'Changing a digit', 'Units digits', 'Remainders of powers', 'Sums of powers mod m',
      'Primes in a digit pattern', 'LCM and GCD', 'Product and least sum', 'Counting divisors',
      'Odd and even divisor sums', 'Square and cube divisors', 'Powers of a fraction', 'Squares from factorials',
      'Sums dividing factorials', 'Repeating decimals', 'Diagonal through tiles', 'Difference of squares',
      'Factoring an equation', 'Laps and common multiples', 'Digit sums', 'Divisibility in other bases',
      'Bases without letters', 'Repeating digits in base k'
    ] },
    { unit: 'Counting', topics: [
      'Digit rules', 'Handshakes', 'Counting committees', 'Forming teams', 'Multiples in blocks',
      'Inclusion and exclusion', 'Separated neighbors', 'Making postage', 'Rising and falling digits',
      'Races with ties', 'Coloring a map', 'Knights, knaves and jokers', 'Number snakes in a grid', 'Crossing lines',
      'Lattice squares', 'Sum-free sets', 'Sets with no multiples', 'Round robin', 'Pairing friends',
      'Seating with rules', 'Colorings up to symmetry', 'Paths on a cube'
    ] },
    { unit: 'Probability', topics: [
      'Probability with dice', 'Many dice', 'Prime chances', 'Choices in common', 'Running totals', 'At least once',
      'Taking turns', 'Expected value', 'Random divisors', 'Remainders by chance', 'Units digits by chance',
      'Geometric probability'
    ] },
    { unit: 'Geometry', topics: [
      'Right triangles', 'Coordinate geometry', 'Altitudes of a triangle', 'Segments to the hypotenuse',
      'Perpendicular to a diagonal', 'Squares in a right triangle', 'Lines making an equilateral triangle',
      'Extending the sides', 'Cutting a segment in a rectangle', 'Circles inside a circle',
      'Cookies from a sheet of dough', 'Points near a segment', 'Pyramid in a box', 'Octahedron in a box'
    ] },
  ],
  lessons: {
    // ---------- arithmetic and algebra ----------
    'Percent change': {
      idea: 'A percent change is really a multiplication. Going up p% multiplies by 1 + p/100, and going down p% multiplies by 1 − p/100. The second change acts on the <i>new</i> price, so two changes in a row multiply; they don\'t add. For example, up 10% and then down 10% is 1.1 × 0.9 = 0.99: a 1% decrease, not "no change".',
      how: [
        'Turn each change into a multiplier: up 5% is × 1.05, down 5% is × 0.95.',
        'Multiply the two multipliers together.',
        'Compare the product with 1: above 1 is an increase, below 1 is a decrease, and the gap from 1 is the percent.',
      ],
      watch: [
        'Simply adding or subtracting the two percents ignores that the second percent is taken of a different price.',
        'Reading the product the wrong way round: 0.93 means a 7% decrease, not a 93% one.',
      ],
      tip: 'Write each change as a multiplier (like × 1.1 or × 0.9) and multiply them, instead of adding the percents.',
    },
    'Percent of what is left': {
      idea: 'Here each price depends on the other, so neither can be found on its own: you get two equations and solve them together. Calling the allowance A = 100 makes every price a percent of A straight away. For example, if t = ½(100 − s) and s = ½(100 − t), then by symmetry t = s, so t = 50 − t/2, t = 33⅓, and the two together are 66⅔% of A.',
      how: [
        'Let A = 100, so each price is directly a percent of A.',
        'Write one equation per price: t = (P/100)(100 − s) and s = (Q/100)(100 − t).',
        'Substitute the second equation into the first and solve the linear equation for t.',
        'Use t to find s, add the two, and only then round to the nearest whole percent.',
      ],
      watch: [
        'Adding the two percents, P + Q, forgets that each is a percent of a smaller amount than A.',
        'Taking each percent of the whole allowance A instead of A minus the other price.',
        'Rounding t and s before adding them, which can tip the total to the wrong whole percent.',
      ],
      tip: 'Call the two prices t and s, write each as its percent of "A minus the other price", and solve the two equations together.',
    },
    'Saying and meaning': {
      idea: 'This is a question about one group inside a crowd: of everyone who <i>gives a certain answer</i>, what part actually has the trait? Picture a real crowd and sort it into four boxes: likes it and says so, likes it but says not, dislikes it and says so, dislikes it but claims to like it. The question only looks at the boxes with the given answer. For example, with 1,000 people, 60% liking, 20% of likers saying no and 90% of non-likers saying no: 120 + 360 = 480 say no, and 120/480 = 1/4 of them like it.',
      how: [
        'Pick a convenient crowd size, like 10,000, so every group is a whole number.',
        'Split the people who like it into "say yes" and "say no", and the people who don\'t like it the same way.',
        'Add up everyone who gives the answer the question asks about.',
        'Divide the ones among them who truly like it by that total, and simplify.',
      ],
      watch: [
        'Dividing by the whole crowd instead of only the people who gave that answer.',
        'Answering the share of likers who say no, which answers a different question.',
        'Flipping the fraction: giving the part that truly dislikes it.',
      ],
      tip: 'Only the people who gave that answer count: find how many of them there are in all, then what part of them truly like it.',
    },
    'Averages': {
      idea: 'An average hides a total: total = average × number of scores. So when one more score arrives, compare totals rather than averages. Another way to see it: the new score must equal the new average plus enough extra to lift each of the old scores by the change. For example, 3 scores averaging 70 total 210; if 4 scores average 72 they total 288, so the new score is 78 (that is 72 + 3 × 2).',
      how: [
        'Old total = old average × number of old scores.',
        'New total = new average × (number of old scores + 1).',
        'The new score is the new total minus the old total.',
      ],
      watch: [
        'Answering the new average itself, or the new average plus the change, as if only one score had to move.',
        'Multiplying the new average by the old count instead of the old count plus 1.',
      ],
      tip: 'Turn each average into a total (average × how many scores), then compare the two totals.',
    },
    'Working together': {
      idea: 'Work with rates, not times. A pump that fills a tank in 4 hours fills 1/4 of the tank each hour. When two pumps run together their rates add, and the time is 1 divided by the combined rate. For example, pumps taking 3 and 6 hours fill 1/3 + 1/6 = 1/2 of the tank per hour, so together they take 2 hours.',
      how: [
        'Write each pump\'s rate as a fraction of the tank per hour: 1/a and 1/b.',
        'Add the rates: 1/a + 1/b = (a + b)/(ab).',
        'Flip the combined rate to get the time: ab/(a + b) hours.',
        'If the answer is an improper fraction, write it as whole hours and a fraction.',
      ],
      watch: [
        'Averaging the two times gives a time longer than the faster pump alone, which can\'t be right.',
        'Adding the times instead of the rates.',
      ],
      tip: 'Add the rates (the fraction of the tank each pump fills per hour), not the times, then take 1 ÷ the total rate.',
    },
    'Arithmetic sequences': {
      idea: 'In an arithmetic sequence every step adds the same common difference d. From the i-th term to the j-th term there are j − i steps, so d is the change in value divided by j − i. After that you can walk to any term by counting steps. For example, if the 2nd term is 7 and the 5th is 16, three steps add 9, so d = 3, and the 10th term is 7 + 8 · 3 = 31.',
      how: [
        'Count the steps between the two given terms: j − i.',
        'Divide the change in value by that number of steps to get d.',
        'Count the steps from a known term to the one you want (n − i).',
        'Add that many d\'s to the known term.',
      ],
      watch: [
        'Off by one: the n-th term is a₁ + (n − 1)d, not a₁ + nd.',
        'Counting terms instead of steps between the two given terms.',
        'Losing the minus sign when the sequence goes down.',
      ],
      tip: 'Count steps, not terms: from the i-th term to the n-th term is n − i steps of the common difference.',
    },
    'Triangular numbers': {
      idea: 'Rows of 1, 2, 3, …, N objects hold 1 + 2 + ⋯ + N = N(N + 1)/2 in all. (Pair the first row with the last, the second with the second-to-last, and so on: every pair holds N + 1.) So twice the total is N(N + 1), a product of two whole numbers in a row, and N sits just below the square root of twice the total. For example, 55 objects: 2 × 55 = 110 = 10 × 11, so there are 10 rows.',
      how: [
        'Double the number of objects: N(N + 1) = 2 × total.',
        'Take the square root of that; N is the whole number just below it.',
        'Check that N × (N + 1) gives exactly twice the total.',
      ],
      watch: [
        'Taking the square root of the total instead of twice the total.',
        'Being off by one row: always check by multiplying N by N + 1.',
      ],
      tip: 'Use 1 + 2 + ⋯ + N = N(N + 1)/2: double the total and look for two whole numbers in a row that multiply to it.',
    },
    'Geometric series': {
      idea: 'An infinite geometric series a + ar + ar² + ⋯ with r between −1 and 1 adds up to a/(1 − r). Fixing one term ties a to r, so the sum becomes a formula in r alone, and the question becomes: for which r is it smallest? That happens when the bottom of the formula is largest, and AM–GM finds that: r(1 − r) is at most 1/4 (at r = 1/2), and r²(1 − r) = 4 · (r/2)(r/2)(1 − r) is at most 4/27 (at r = 2/3).',
      how: [
        'Write the fixed term with a and r (the second term is ar, the third is ar²) and solve for a.',
        'Put that into S = a/(1 − r), so S is the fixed term divided by an expression in r.',
        'Use the condition given (a positive sum, or positive terms) to see that r must be between 0 and 1.',
        'Make the expression in r as large as possible with AM–GM, and divide the fixed term by that largest value.',
      ],
      watch: [
        'Assuming r = 1/2 is always best: with the third term fixed, r²(1 − r) peaks at r = 2/3 instead.',
        'Forgetting that r must stay between 0 and 1 here.',
      ],
      tip: 'Write the sum as the given term divided by an expression in r, then make that expression as large as possible for r between 0 and 1.',
    },
    'Fibonacci remainders': {
      idea: 'Each term depends only on the two before it, and there are only so many possible pairs of remainders, so the sequence must start repeating. (It even returns to 0, 1, because you can also run the rule backwards.) Once you know the cycle, any block of terms exactly as long as the cycle contains each part of the cycle once, so its sum is one full cycle\'s sum, wherever the block starts. For example, mod 3 the remainders run 0, 1, 1, 2, 0, 2, 2, 1, then 0, 1 again: a cycle of 8 that adds up to 9.',
      how: [
        'Write out the remainders until the pair 0, 1 appears again; the terms before it are one cycle.',
        'Note the cycle\'s length and add up one full cycle.',
        'If the question adds a block of terms as long as the cycle, the answer is that cycle sum, whatever the starting index.',
      ],
      watch: [
        'Stopping at the first 0: the cycle only ends when 0 is followed by 1.',
        'Adding the real Fibonacci numbers instead of their remainders.',
      ],
      tip: 'Write out the remainders until 0, 1 comes back; a block as long as that cycle always adds up to one full cycle.',
    },
    'Recursive functions': {
      idea: 'The rule g(n) = g(n − 1) − g(n − 2) repeats every 6 terms: from a, b it goes b − a, −a, −b, a − b, and then a, b again. The extra + cn in f\'s rule spoils that, so first find a simple sequence that obeys the full rule: c(n + 1) does, since cn − c(n − 1) + cn = c(n + 1). Subtract it from f, and what is left obeys the plain rule, so it cycles every 6. For example, 2, 5 continues 3, −2, −5, −3, 2, 5, …',
      how: [
        'Check that c(n + 1) satisfies the rule by itself.',
        'Let g(n) = f(n) − c(n + 1), and work out g(1) and g(2).',
        'Run g(n) = g(n − 1) − g(n − 2) to get its 6-term cycle.',
        'Use the remainder of N on division by 6 to read off g(N), then f(N) = c(N + 1) + g(N).',
      ],
      watch: [
        'Answering just c(N + 1) and forgetting the repeating part g(N).',
        'Matching remainders to the cycle off by one: a remainder of 1 means g(1), and a remainder of 0 means g(6).',
      ],
      tip: 'Subtract c(n + 1) from f(n): what is left follows g(n) = g(n − 1) − g(n − 2), which repeats every 6 terms.',
    },
    'Reciprocal sequences': {
      idea: 'Some messy-looking rules become simple when you flip every term over. Taking reciprocals of a<sub>n</sub> = a<sub>n−2</sub>a<sub>n−1</sub>/(2a<sub>n−2</sub> − a<sub>n−1</sub>) gives 1/a<sub>n</sub> = 2/a<sub>n−1</sub> − 1/a<sub>n−2</sub>. That says each reciprocal minus the one before is the same as the previous difference, so the reciprocals form an arithmetic sequence: 1/a<sub>n</sub> = 1/a<sub>1</sub> + (n − 1)d.',
      how: [
        'Flip both sides of the rule and split the fraction into 2/a<sub>n−1</sub> − 1/a<sub>n−2</sub>.',
        'Recognize b<sub>n</sub> = 1/a<sub>n</sub> as an arithmetic sequence.',
        'Find b<sub>1</sub> = 1/a<sub>1</sub> and the step d = 1/a<sub>2</sub> − 1/a<sub>1</sub>.',
        'Compute b<sub>N</sub> = b<sub>1</sub> + (N − 1)d, flip it back to get a<sub>N</sub>, and reduce before adding p + q.',
      ],
      watch: [
        'Taking N steps from the first term instead of N − 1.',
        'Adding p + q before reducing the fraction to lowest terms.',
      ],
      tip: 'Flip every term over: the reciprocals 1/a<sub>n</sub> go up by the same amount each time.',
    },
    'Perpendicular lines': {
      idea: 'For a line written px + qy = r, the slope is −p/q. Two lines are perpendicular when their slopes multiply to −1, and for lines in this form that is the same as pp′ + qq′ = 0 (it also covers vertical lines). A point where the lines meet must make both equations true. With three unknowns a, b and c, that gives exactly the three equations you need.',
      how: [
        'Write the perpendicular condition pp′ + qq′ = 0 using the two lines\' x and y coefficients.',
        'Put the meeting point into each line\'s equation.',
        'Solve the three equations: for example, get c from the first line and b from the perpendicular condition, then use the second line.',
        'Check the values in all three equations.',
      ],
      watch: [
        'Treating perpendicular as "same slope" (that is parallel) or as "opposite slope".',
        'Sign slips with the c on the right-hand side of the second line.',
        'Stopping at a or b when the question asks for c.',
      ],
      tip: 'Use pp′ + qq′ = 0 for perpendicular lines px + qy = r, then put the meeting point into both equations.',
    },
    'Parabolas and triangles': {
      idea: 'A level chord of y = kx² is symmetric about the y-axis, so its ends are (−t, kt²) and (t, kt²). With the third corner at the origin, the triangle has base 2t and height kt², so its area is ½ · 2t · kt² = kt³. Knowing the area pins down t, and the level side is 2t long. For example, on y = 4x² an area of 32 gives 4t³ = 32, t = 2, and a level side of 4.',
      how: [
        'Name the ends of the level side (−t, kt²) and (t, kt²).',
        'The base is 2t and the height, from the origin up to that side, is kt².',
        'Set ½ · 2t · kt² = kt³ equal to the area and solve for t.',
        'The level side is 2t.',
      ],
      watch: [
        'Answering t instead of 2t.',
        'Using t as the height instead of kt².',
      ],
      tip: 'Put the ends of the level side at (−t, kt²) and (t, kt²), write the area in terms of t, and solve.',
    },
    'Symmetric sums': {
      idea: 'You never need x and y themselves (they might not even be real numbers). Expanding (x + y)² = x² + 2xy + y² shows that x² + y² = (x + y)² − 2xy. In the same way, (x + y)³ = x³ + y³ + 3xy(x + y), so x³ + y³ = (x + y)³ − 3xy(x + y). For example, if x + y = 3 and xy = 1, then x² + y² = 9 − 2 = 7 and x³ + y³ = 27 − 9 = 18.',
      how: [
        'Write the expression you want using only x + y and xy, with the identities above.',
        'Substitute the given values.',
        'Take care with signs when xy is negative.',
      ],
      watch: [
        'Forgetting the 2 in 2xy, or adding it instead of subtracting.',
        'For cubes, subtracting 3xy instead of 3xy(x + y).',
      ],
      tip: 'Square (or cube) x + y and take away the extra xy terms; you never need x and y themselves.',
    },
    'Least value of a product': {
      idea: 'Four evenly spaced factors pair up nicely: the outer two and the inner two multiply to expressions with the same x² + (something)x part. Call the first u; then the second is u + 2g², where g is the spacing. The product u(u + 2g²) = (u + g²)² − g⁴, and a square is never negative, so the least value is the constant minus g⁴ (and u really can reach −g²). For example, x(x + 1)(x + 2)(x + 3) = u(u + 2) with u = x² + 3x, which is (u + 1)² − 1, so it is never below −1.',
      how: [
        'Multiply the first factor by the last, and the two middle factors together.',
        'Call the first product u; the second is u plus a constant.',
        'Complete the square in u.',
        'A square is never negative, so the least value is the added constant minus g⁴ (u really can reach −g²).',
      ],
      watch: [
        'Answering the added constant itself and forgetting the − g⁴.',
        'Subtracting g² instead of g⁴.',
        'Pairing the first two factors and the last two, which doesn\'t give matching expressions.',
      ],
      tip: 'Multiply the outer pair and the inner pair, call one product u, and complete the square in u.',
    },
    'Ratios of big powers': {
      idea: 'When one base is bigger, its powers swamp the other\'s, so the ratio is close to the bigger base raised to the difference of the exponents. Pulling that power out of the top shows the ratio is that number minus a small positive amount, which is less than 1. So the ratio sits just below a whole number. For example, (3¹⁰ + 2¹⁰)/(3⁸ + 2⁸) = 9 − 5 · 2⁸/(3⁸ + 2⁸) ≈ 9 − 0.19, so the greatest integer not above it is 8.',
      how: [
        'Spot the gap between the exponents, e, and find the bigger base to the power e.',
        'Rewrite the top as (bigger base)<sup>e</sup> × (bottom) minus a leftover, so the ratio is that power minus a fraction.',
        'Check that the fraction is positive and less than 1.',
        'The greatest integer that doesn\'t exceed the ratio is one less than that power.',
      ],
      watch: [
        'Answering the power itself: the ratio is a little less than it.',
        'Splitting the fraction term by term, as if (A + B)/(C + D) were A/C + B/D.',
      ],
      tip: 'Factor the bigger base\'s power out of the top: the ratio is a whole number minus a small positive amount.',
    },
    'Age multiples': {
      idea: 'If a parent is G years older than the child, then when the child is z the parent is z + G, and z + G is a multiple of z exactly when z divides G. So "how many birthdays when the parent\'s age is a multiple" means "how many divisors G has", and "the next time" means "the next divisor of the gap". For example, with a gap of 12 it happens when the child is 1, 2, 3, 4, 6 and 12: six birthdays.',
      how: [
        'Turn each parent\'s age into an age gap with the child (the child is 1 today, so the gap is the parent\'s age minus 1).',
        'Use the number of divisors to find which gap in the allowed range fits.',
        'Get the other parent\'s gap from the difference between the parents.',
        'Find the smallest divisor of that gap above 1: that is the child\'s age next time. The parent is then the gap plus that age.',
      ],
      watch: [
        'Using the parent\'s age instead of the age gap.',
        'Answering the child\'s age, or the gap, instead of the parent\'s age.',
        'Forgetting that today counts, since 1 divides every gap.',
      ],
      tip: 'A parent\'s age is a multiple of the child\'s exactly when the child\'s age divides the gap between their ages.',
    },
    // ---------- number theory ----------
    'Changing a digit': {
      idea: "A number is its digits times their place values: 47 = 4 · 10 + 7. So changing a digit x into a smaller digit y lowers the number by (x − y) times that digit's place value: 1 in the units place, 10 in the tens place, 100 in the hundreds place. The total difference is (x − y) times a weighted count of where x appears. Example: from 1 to 20, write every 1 as a 0. A 1 sits in the units place twice (1 and 11) and in the tens place ten times (10 to 19), so the sum drops by 1 · (2 · 1 + 10 · 10) = 102.",
      how: [
        "Count how many times the digit appears in the units place from 1 to N.",
        "Count how many times it appears in the tens place, and in the hundreds place if N goes that high.",
        "Weight each count by its place value (1, 10 or 100) and add them up.",
        "Multiply that total by the difference between the old digit and the new one.",
      ],
      watch: [
        "Treating every appearance as worth the same: a digit in the tens place is worth 10 times as much as one in the units place.",
        "Counting only the units place, or only the tens place.",
        "Missing numbers where the digit appears twice, like 33: both copies change.",
      ],
      tip: "Each changed digit lowers its number by the difference of the digits times that digit's place value, so count the units place and the tens place separately.",
    },
    'Units digits': {
      idea: "The units digit of a product depends only on the units digits of the factors, so a huge base can be swapped for its last digit. The last digits of the powers of any digit repeat in a short cycle of length 1, 2 or 4: powers of 7 end in 7, 9, 3, 1, 7, 9, 3, 1, …. The remainder of the exponent divided by the cycle length tells you where in the cycle you land. Example: 7<sup>10</sup>: 10 = 4 · 2 + 2, so it ends like 7<sup>2</sup>, in 9.",
      how: [
        "Keep only the last digit of each base.",
        "Write the cycle of last digits of its powers: 1st power, 2nd power, … until it repeats.",
        "Divide the exponent by the cycle length; remainder r means the r-th entry, and remainder 0 means the last entry.",
        "Add the two units digits you found and keep only the units digit of that sum.",
      ],
      watch: [
        "Giving the units digit of just one of the two powers instead of the sum.",
        "Landing one place off in the cycle: remainder 1 is the base itself, remainder 0 is the end of the cycle.",
        "Adding the last digits of the bases without raising them to their powers.",
      ],
      tip: "Replace each base by its last digit, find the repeating cycle of its powers, and use the exponent's remainder to pick the right spot in that cycle.",
    },
    'Remainders of powers': {
      idea: "To find a remainder you only need remainders along the way: the remainder of b<sup>k+1</sup> is the remainder of (remainder of b<sup>k</sup>) × b. So the remainders of b, b<sup>2</sup>, b<sup>3</sup>, … can only take a few values and must start repeating; they come back to 1 and then repeat from the start. If the cycle has length L, b<sup>k</sup> leaves the same remainder as b<sup>r</sup>, where r is the remainder of k divided by L. Example, mod 7: powers of 3 leave 3, 2, 6, 4, 5, 1 and repeat, so 3<sup>20</sup> leaves the same remainder as 3<sup>2</sup> (20 = 6 · 3 + 2): 2.",
      how: [
        "List the remainders of b, b<sup>2</sup>, b<sup>3</sup>, … when divided by m, multiplying the previous remainder by b each time.",
        "Stop when you reach 1: the list repeats from there, and its length is the cycle length L.",
        "Divide the exponent k by L to get a remainder r.",
        "The answer is the r-th remainder in your list (the last one if r is 0).",
      ],
      watch: [
        "Reducing the exponent using m instead of the cycle length L.",
        "Being one place off when you count along the cycle.",
        "Multiplying out the full powers instead of just the remainders, which makes slips likely.",
      ],
      tip: "List the remainders of b, b², b³, … until one comes back to 1; the length of that cycle tells you where the exponent lands.",
    },
    'Sums of powers mod m': {
      idea: "Consecutive powers share a common factor: b<sup>k</sup> + b<sup>k+1</sup> + b<sup>k+2</sup> = b<sup>k</sup> · (1 + b + b<sup>2</sup>). The bracket is a small ordinary number, and b<sup>k</sup> can be handled with the repeating cycle of remainders. Remainders multiply, so the answer is the remainder of (remainder of b<sup>k</sup>) × (remainder of the bracket). Example: 2<sup>10</sup> + 2<sup>11</sup> + 2<sup>12</sup> mod 5 is 2<sup>10</sup> · 7. Powers of 2 mod 5 go 2, 4, 3, 1, so 2<sup>10</sup> leaves 4; 7 leaves 2; and 4 · 2 = 8 leaves 3.",
      how: [
        "Factor out the smallest power: the sum is b<sup>k</sup> times (1 + b + b<sup>2</sup> + ⋯).",
        "Work out the bracket as an ordinary number and find its remainder.",
        "Find the remainder of b<sup>k</sup> from the cycle of remainders of b, b<sup>2</sup>, b<sup>3</sup>, ….",
        "Multiply the two remainders and take the remainder of that product.",
      ],
      watch: [
        "Stopping at the remainder of the bracket alone, or of b<sup>k</sup> alone.",
        "Adding the two remainders instead of multiplying them.",
        "Landing one place off in the cycle of remainders.",
      ],
      tip: "Factor out the smallest power first; then multiply its remainder by the remainder of the small sum left in the bracket.",
    },
    'Primes in a digit pattern': {
      idea: "A pattern in the digits often means a pattern in the factors. Here k ones, a 0 and k more ones is always (k ones) × (10<sup>k+1</sup> + 1): multiplying the block of ones by 10<sup>k+1</sup> + 1 puts one copy of it k + 1 places to the left and one copy at the right, with a 0 between. For example 11011 = 11 × 1001 and 1110111 = 111 × 10001. When both factors are bigger than 1 the number cannot be prime, so you can count without testing any big number.",
      how: [
        "Write out the first few numbers and look for one factorization that fits all of them.",
        "Check why it works: (block of k ones) × (10<sup>k+1</sup> + 1) places two copies of the block with a 0 between.",
        "Find for which k both factors are bigger than 1: those numbers are composite.",
        "Check the leftover small case by hand, and answer the question that was asked (primes or composites).",
      ],
      watch: [
        "Assuming numbers made of 1s are often prime: the factorization shows almost none of these are.",
        "Forgetting that the first number, with one 1 on each side, has to be checked on its own.",
        "Answering with the number of primes when the question asks for composites, or the other way round.",
      ],
      tip: "Look for a factorization that fits every number in the list, like 11011 = 11 × 1001.",
    },
    'LCM and GCD': {
      idea: "Think in prime powers: the lcm takes the larger power of each prime, the gcd the smaller. If lcm(n, a) = L, then n divides L, and for every prime where a has less than L does, n must supply L's full power. The gcd condition then fixes the powers of the primes n shares with the other number. Example: lcm(n, 6) = 60 = 2<sup>2</sup> · 3 · 5 forces 2<sup>2</sup> and 5 into n, with 3 optional; gcd(n, 45) = 5 rules out the 3. So n = 20.",
      how: [
        "Factor the lcm, the gcd and the two given numbers into primes.",
        "From the lcm: n divides it, and wherever the given number has a smaller power of a prime than the lcm, n has the lcm's power.",
        "From the gcd: for each prime of the other number, the smaller of its power there and in n must equal the gcd's power.",
        "Put the powers together to get n, and check both conditions.",
      ],
      watch: [
        "Stopping after the lcm condition, which usually allows several values of n.",
        "Answering with the lcm itself, or a multiple of n.",
      ],
      tip: "Factor everything into primes: the lcm pins down some of the prime powers in n, and the gcd pins down the rest.",
    },
    'Product and least sum': {
      idea: "The integers may be negative, and that lets the sum get much smaller. The product is positive, so there are no negatives or exactly two. With two negatives, −x and −y, and a positive z (where x · y · z is the product), the sum is z − x − y: you want z just a little bigger than x + y. Small sums like 1 or 2 may be impossible, so check actual splittings. Example: for a product of 12, the integers −1, −2 and 6 give 3, and no splitting gives 1 or 2.",
      how: [
        "Note that an even number of the integers are negative: none or two.",
        "With none negative, find the smallest sum of three positive factors; it is usually large.",
        "With two negative, write the integers as −x, −y and z with x · y · z equal to the product, so the sum is z − x − y.",
        "Go through the ways to split the product as x · y · z and find the smallest positive z − x − y.",
      ],
      watch: [
        "Only trying positive integers, which gives a much larger sum.",
        "Assuming a sum of 1 or 2 is possible without finding integers that give it.",
      ],
      tip: "Let two of the integers be negative: the sum is then the positive one minus the other two, and you want that just above 0.",
    },
    'Counting divisors': {
      idea: "A divisor of N is built by choosing how many copies of each prime of N to use, from 0 up to its exponent. For 72 = 2<sup>3</sup> · 3<sup>2</sup>, a divisor uses 2<sup>0</sup>, 2<sup>1</sup>, 2<sup>2</sup> or 2<sup>3</sup> (4 choices) and 3<sup>0</sup>, 3<sup>1</sup> or 3<sup>2</sup> (3 choices), so 72 has 4 · 3 = 12 divisors. That is why you add 1 to each exponent and multiply.",
      how: [
        "Factor N into primes and write it with exponents.",
        "Add 1 to each exponent: the extra choice is using none of that prime.",
        "Multiply those numbers together.",
      ],
      watch: [
        "Multiplying the exponents themselves, without adding 1 to each.",
        "Adding instead of multiplying, or leaving out one of the primes.",
        "Leaving out 1 and N, which are divisors too.",
      ],
      tip: "Factor N into primes; in a divisor, each prime can appear anywhere from 0 times up to its exponent.",
    },
    'Odd and even divisor sums': {
      idea: "Write N = 2<sup>a</sup> × m with m odd. The odd divisors of N are exactly the divisors of m; call their sum s. Every even divisor is an odd divisor times 2, 4, …, or 2<sup>a</sup>, so the even divisors add up to (2 + 4 + ⋯ + 2<sup>a</sup>) · s = (2<sup>a+1</sup> − 2) · s. So the ratio depends only on the power of 2 in N. Example: N = 12 = 2<sup>2</sup> · 3: the odd divisors 1, 3 add to 4, the even ones 2, 4, 6, 12 add to 24 = 6 · 4, a ratio of 1 : 6.",
      how: [
        "Find the power of 2 in N, adding up the powers of 2 in each factor N is given as.",
        "Call the sum of the odd divisors s; you never need to work it out.",
        "The even divisors add up to (2 + 4 + ⋯ + 2<sup>a</sup>) times s.",
        "So the ratio is 1 : (2<sup>a+1</sup> − 2).",
      ],
      watch: [
        "Using 1 + 2 + ⋯ + 2<sup>a</sup>, which also counts the odd divisors, instead of 2 + ⋯ + 2<sup>a</sup>.",
        "Using 2<sup>a</sup> or 2<sup>a+1</sup> on its own.",
        "Miscounting the power of 2 when N is given as a product of several numbers.",
      ],
      tip: "Split N into a power of 2 times an odd number; every even divisor is an odd divisor times a power of 2.",
    },
    'Square and cube divisors': {
      idea: "A divisor of (pq)<sup>e</sup> is p<sup>i</sup>q<sup>j</sup> with i and j from 0 to e. It is a perfect square when both exponents are even, a perfect cube when both are multiples of 3, and both when both are multiples of 6. Count each kind, then subtract the overlap so it isn't counted twice. Example: for 6<sup>4</sup>, the even exponents 0, 2, 4 give 3 · 3 = 9 squares, the exponents 0, 3 give 2 · 2 = 4 cubes, and only exponent 0 gives 1 that is both: 9 + 4 − 1 = 12.",
      how: [
        "Write the number as p<sup>e</sup> · q<sup>e</sup>, so its divisors are p<sup>i</sup>q<sup>j</sup> with each exponent from 0 to e.",
        "Count the even numbers from 0 to e and square that count: the perfect squares.",
        "Do the same with multiples of 3 for the cubes, and with multiples of 6 for divisors that are both.",
        "Add the squares and cubes, then subtract the ones that are both.",
      ],
      watch: [
        "Forgetting to subtract the divisors that are both squares and cubes.",
        "Forgetting that 0 is an allowed exponent, so 1 counts as a square and a cube.",
        "Subtracting the overlap twice.",
      ],
      tip: "Count the squares and the cubes separately by their exponents, then take away the divisors you counted twice.",
    },
    'Powers of a fraction': {
      idea: "For n ≥ 0, A · (p/q)<sup>n</sup> = A · p<sup>n</sup> / q<sup>n</sup>, which is whole exactly when q<sup>n</sup> divides A. For negative n the fraction flips, and you need p<sup>|n|</sup> to divide A. So if A has p to the power x and q to the power y, n can run from −x up to y: x + y + 1 values. Example: 12 · (2/3)<sup>n</sup> with 12 = 2<sup>2</sup> · 3 is whole for n = −2, −1, 0, 1, which is 4 values.",
      how: [
        "Factor A and find its powers of p and q.",
        "For n ≥ 0 you need q<sup>n</sup> to divide A, so n can go up to the power of q in A.",
        "For negative n the fraction is upside down, so |n| can go up to the power of p in A.",
        "Count all the allowed n, including n = 0.",
      ],
      watch: [
        "Forgetting the negative values of n, where the fraction turns upside down.",
        "Forgetting n = 0.",
        "Multiplying the two counts, as for divisors, instead of adding them.",
      ],
      tip: "Positive n puts powers of the denominator under A and negative n puts powers of the numerator there; count how far you can go each way.",
    },
    'Squares from factorials': {
      idea: "Pair each odd factorial with the next one: (2j − 1)! · (2j)! = ((2j − 1)!)<sup>2</sup> · 2j, a perfect square times 2j. So the whole product is a perfect square times 2 · 4 · 6 ⋯ n = 2<sup>n/2</sup> · (n/2)!, and m only has to fix that much smaller leftover: it needs one more copy of each prime whose power there is odd. Example: 1! · 2! · 3! · 4! = (1!)<sup>2</sup> · 2 · (3!)<sup>2</sup> · 4, a square times 2<sup>3</sup>, so m = 2.",
      how: [
        "Pair (2j − 1)! with (2j)!: each pair is a perfect square times 2j.",
        "Multiply the leftovers: 2 · 4 · 6 ⋯ n = 2<sup>n/2</sup> · (n/2)!.",
        "Find the power of each prime in that leftover (for a factorial, count the multiples of p, then of p<sup>2</sup>, and so on).",
        "m is the product of the primes whose power is odd.",
      ],
      watch: [
        "Working with the whole product instead of the small leftover, where the numbers get huge.",
        "Forgetting the extra 2<sup>n/2</sup> that comes from 2 · 4 · 6 ⋯ n.",
        "Including a prime whose power is already even.",
      ],
      tip: "Group the factorials in pairs, (2j − 1)! · (2j)!, and see what is left over once the squares are taken out.",
    },
    'Sums dividing factorials': {
      idea: "T = 1 + 2 + ⋯ + n = n(n + 1)/2, so n!/T = 2 · (n − 1)!/(n + 1). When n + 1 is composite (and n ≥ 3), it splits into factors that can all be found among 2, 3, …, n − 1 (for 9 = 3 · 3, use 3 and 6), so the division works. When n + 1 is an odd prime, nothing in 2 · (n − 1)! can cancel it, so T does not divide n!. So the question is really about the largest prime in reach. Example: n = 4 gives T = 10, which does not divide 4! = 24, and 5 is prime.",
      how: [
        "Write T = n(n + 1)/2 and simplify n!/T to 2 · (n − 1)!/(n + 1).",
        "Notice it fails to be whole exactly when n + 1 is an odd prime.",
        "Find the largest prime p for which p − 1 is in the allowed range.",
        "The answer is n = p − 1.",
      ],
      watch: [
        "Answering with the prime itself instead of one less than it.",
        "Looking for the largest prime n instead of the largest prime n + 1.",
        "Assuming the top of the range works without checking whether n + 1 is prime.",
      ],
      tip: "Simplify n! divided by n(n + 1)/2, and ask when n + 1 can fail to divide what is left.",
    },
    'Repeating decimals': {
      idea: "A two-digit block repeating forever is that block over 99: 0.272727… = 27/99. Cut off after two digits, the same block is over 100: 0.27 = 27/100. So using w.ab instead of w.ababab… loses ab/99 − ab/100 = ab/9900, and multiplying by M loses M · ab/9900. The whole-number part w is the same in both and drops out.",
      how: [
        "Write the repeating decimal as w + ab/99 and the cut-off one as w + ab/100.",
        "Subtract: the whole-number part cancels and the difference is ab/9900.",
        "Multiply by M and set the result equal to the shortfall given.",
        "Solve for the two-digit number ab.",
      ],
      watch: [
        "Swapping the two digits: the answer is ab, not ba.",
        "Writing the repeating part over 90 or 100 instead of 99.",
      ],
      tip: "Write 0.ababab… as a fraction over 99 and compare it with 0.ab, which is over 100.",
    },
    'Diagonal through tiles': {
      idea: "Follow the robot. It starts in one tile and enters a new tile each time it crosses a grid line. On an m × n floor it crosses m − 1 lines one way and n − 1 the other, but at a grid point it crosses two lines at once and enters only one new tile. The diagonal passes through gcd(m, n) − 1 grid points inside the floor, so the count is 1 + (m − 1) + (n − 1) − (gcd − 1) = m + n − gcd(m, n). Example: a 4 × 6 floor gives 4 + 6 − 2 = 8 tiles.",
      how: [
        "Find g = gcd(m, n): the diagonal passes through g − 1 grid points inside the floor.",
        "Count the grid lines crossed: m − 1 one way and n − 1 the other.",
        "Start with 1 tile, add one per line crossed, and take away one for each grid point where two crossings happen together.",
        "That gives m + n − g.",
      ],
      watch: [
        "Using m + n or m + n − 1, which ignores the grid points on the diagonal.",
        "Subtracting 2g instead of g.",
      ],
      tip: "Count the grid lines the robot crosses, and remember that at a grid point it crosses two lines but enters only one new tile.",
    },
    'Difference of squares': {
      idea: "A square root is never negative, so m ≥ 0, and squaring gives n<sup>2</sup> − m<sup>2</sup> = c, which factors as (n − m)(n + m) = c. The two factors differ by 2m, so they are both even or both odd. Each same-parity factor pair u · v of c (u ≤ v) gives m = (v − u)/2 and n = ±(u + v)/2. Example: c = 15 has pairs 1 · 15 and 3 · 5, giving (m, n) = (7, ±8) and (1, ±4): 4 pairs.",
      how: [
        "Use m ≥ 0 and rewrite the equation as (n − m)(n + m) = c.",
        "List the factor pairs u · v of c with u ≤ v.",
        "Keep only pairs where u and v are both even or both odd.",
        "Each kept pair gives one m and two values of n, one positive and one negative; count them.",
      ],
      watch: [
        "Allowing negative m: the square root is never negative.",
        "Forgetting that n can be negative.",
        "Keeping factor pairs of different parity, which give fractions.",
      ],
      tip: "Square both sides and factor n² − m² as (n − m)(n + m); then think about which factor pairs of the number can work.",
    },
    'Factoring an equation': {
      idea: "Simon's favorite factoring trick: an equation like mn − 3m − 2n = 0 doesn't factor as it stands, but adding the product of the two coefficients makes it factor: mn − 3m − 2n + 6 = 6 is (m − 2)(n − 3) = 6. Now each divisor of 6, positive or negative, gives exactly one solution. The equation 1/m + 1/n = 1/k takes the same shape after multiplying through by kmn: (m − k)(n − k) = k<sup>2</sup>.",
      how: [
        "Rearrange to mn − am − bn = 0; for 1/m + 1/n = 1/k, multiply through by kmn first.",
        "Add the product of the two coefficients to both sides so the left side factors as (m − b)(n − a).",
        "Each divisor of the right side, positive or negative, gives exactly one ordered pair.",
        "Throw out any pair the problem forbids, such as m = 0 when m is in a denominator.",
      ],
      watch: [
        "Counting only the positive divisors and missing the negative ones.",
        "For 1/m + 1/n = 1/k, keeping the pair that makes m = 0 and n = 0, which isn't allowed.",
        "Counting unordered pairs when the question asks for ordered ones.",
      ],
      tip: "Add a constant to both sides so the left side factors as (m − something)(n − something).",
    },
    'Laps and common multiples': {
      idea: "A kart with a k-minute lap is at the start line exactly at the multiples of k. So you want the smallest time T that is a multiple of at least j of the lap times. Numbers with many small divisors win: 12 is a multiple of 1, 2, 3, 4 and 6. Rather than taking the lcm of the j smallest lap times, try small T in order and count how many lap times divide each. Example: lap times 1 to 8 and at least 5 karts: T = 12 works (laps 1, 2, 3, 4, 6), and no smaller time does.",
      how: [
        "Kart k is at the start when T is a multiple of k.",
        "Try T = 1, 2, 3, … and count how many of the lap times divide each one.",
        "Pay attention to numbers with many small divisors, like 12, 24, 30 or 60.",
        "The first T that at least j lap times divide is the answer.",
      ],
      watch: [
        "Taking the lcm of the j smallest lap times, which is often bigger than needed.",
        "Mixing up the condition: T must be a multiple of the lap time, not a divisor of it.",
        "Overshooting with a later meeting time: check the smaller times first.",
      ],
      tip: "A kart is at the start line when the time is a multiple of its lap time; look for a small time with many divisors among the lap times.",
    },
    'Digit sums': {
      idea: "Adding 1 usually raises the last digit by 1, so the digit sum goes up by 1. But if n ends in t nines, each 9 turns into a 0 (losing 9) and the digit before them goes up by 1. So S(n + 1) = S(n) + 1 − 9t. That means S(n + 1) is never more than S(n) + 1, and it leaves the same remainder as S(n) + 1 when divided by 9. Example: 1299 becomes 1300, and the digit sum goes from 21 to 4 = 21 + 1 − 18.",
      how: [
        "Write S(n + 1) = S(n) + 1 − 9t, where t is the number of 9s at the end of n.",
        "So S(n + 1) is at most S(n) + 1 and leaves the same remainder as S(n) + 1 when divided by 9.",
        "Find the remainder of S(n) + 1 on division by 9 (adding its digits gives it quickly).",
        "Pick the choice with that remainder that is not bigger than S(n) + 1.",
      ],
      watch: [
        "Picking S(n) + 10: it has the right remainder, but a digit sum can't go up by more than 1.",
        "Assuming S(n + 1) must be S(n) + 1, which ignores the 9s that carry.",
      ],
      tip: "Think about what carrying does to the digit sum when n ends in 9s, and compare remainders on division by 9.",
    },
    'Divisibility in other bases': {
      idea: "A base-b numeral is a polynomial in b: 1234<sub>b</sub> = b<sup>3</sup> + 2b<sup>2</sup> + 3b + 4. Whether that is a multiple of q depends only on the remainder of b when divided by q, since changing b by q doesn't change the value's remainder. So test the q possible remainders once, then count how many bases in the range have a good remainder. Example: 11<sub>b</sub> = b + 1 is a multiple of 3 exactly when b leaves remainder 2.",
      how: [
        "Write the numeral as a polynomial in b.",
        "Try each remainder 0, 1, …, q − 1 in place of b and see which make the value a multiple of q.",
        "Count how many full runs of q consecutive bases the range contains.",
        "Multiply the number of good remainders by the number of runs, adjusting for any partial run.",
      ],
      watch: [
        "Being one run off when counting how many times the remainders repeat in the range.",
        "Answering with the number of runs instead of good remainders times runs.",
        "Treating q as a base-b number: it is an ordinary base-ten number.",
      ],
      tip: "The numeral's remainder on division by q depends only on b's remainder on division by q, so test each remainder once.",
    },
    'Bases without letters': {
      idea: "A number avoids letters exactly when every one of its base-B digits is 0 to 9. So write N in base B and count digit strings place by place, the way you would count numbers below N in base ten with some digits banned. If the first digit is smaller than N's first digit, each later digit has 10 choices; if it is equal, move on to the next place. Count 0 along the way and subtract it at the end. Example: in base 12, 287 is 1BB, and the numbers from 0 to 287 with no letters have first digit 0 or 1 and two digits from 0 to 9: 2 · 10 · 10 = 200, so 199 of them are from 1 to 287.",
      how: [
        "Write N in base B by dividing by B<sup>2</sup>, then by B.",
        "Count strings that start with a smaller first digit: each later digit has 10 choices.",
        "Then fix the first digit equal to N's and count by the second digit the same way, then the third.",
        "If one of N's digits is a letter, nothing more starting that way counts; at the end subtract 1 for the number 0.",
      ],
      watch: [
        "Forgetting to remove 0, which isn't in the list 1, 2, 3, ….",
        "Allowing 10 choices for a digit that is bounded by a smaller digit of N.",
        "Treating a letter digit of N as if it were allowed.",
      ],
      tip: "Write N in the new base, then count place by place the numbers whose digits are all ordinary digits 0 to 9.",
    },
    'Repeating digits in base k': {
      idea: "In base k, shifting two places multiplies by k<sup>2</sup>. If x = 0.ababab…<sub>k</sub>, then k<sup>2</sup>x = ab<sub>k</sub> + x, where ab<sub>k</sub> means a · k + b. So x = (ak + b)/(k<sup>2</sup> − 1), and you can test the choices against the fraction given, remembering that k must be bigger than both digits. Example: 0.121212…<sub>3</sub> = (1 · 3 + 2)/(9 − 1) = 5/8.",
      how: [
        "Let x be the number and multiply by k<sup>2</sup>: k<sup>2</sup>x = (a · k + b) + x.",
        "Solve: x = (ak + b)/(k<sup>2</sup> − 1).",
        "Set this equal to the given fraction; k must be larger than both digits.",
        "Test the choices (or solve the equation for k) and compare values, since the fraction may have been reduced.",
      ],
      watch: [
        "Reading ab<sub>k</sub> as the base-ten number ab instead of a · k + b.",
        "Putting k − 1 or k<sup>2</sup> in the denominator instead of k<sup>2</sup> − 1.",
        "Comparing numerators directly when the given fraction is in lowest terms.",
      ],
      tip: "Multiply the number by k² to shift the repeating block over by one block, then subtract to get a fraction in terms of k.",
    },
    // ---------- counting ----------
    'Digit rules': {
      idea: 'Divisibility by 5, 4 or 25 depends only on the last one or two digits, so decide the ending first. After that, every other place is free, and the multiplication principle says to multiply the number of choices for each place. For example, two-digit numbers with only odd digits that are multiples of 5 must end in 5, and the first digit can be 1, 3, 5, 7 or 9: 5 numbers.',
      how: [
        'Recall the rule: a multiple of 5 ends in 0 or 5; a multiple of 4 has last two digits forming a multiple of 4; a multiple of 25 ends in 00, 25, 50 or 75.',
        'Keep only the endings that use allowed digits (all even, or all odd).',
        'Count the choices for the first digit, which can never be 0.',
        'Count the choices for each middle digit: 5 even digits (0, 2, 4, 6, 8) or 5 odd digits (1, 3, 5, 7, 9).',
        'Multiply the choices place by place.',
      ],
      watch: [
        'With only even digits the first digit has 4 choices (2, 4, 6, 8), not 5, because a number can\'t start with 0.',
        'An odd-digit multiple of 5 must end in 5, and an even-digit one must end in 0: only one ending survives, not two.',
        'For multiples of 4 with even digits: an even tens digit means the tens part (0, 20, 40, 60 or 80) is already a multiple of 4, so only the units digit decides.',
      ],
      tip: 'First decide which last digit (or last two digits) is possible, then multiply the choices for every other place, remembering the first digit can\'t be 0.',
    },
    'Handshakes': {
      idea: 'Every pair of people either knows each other or doesn\'t, and only the pairs who have never met shake hands. In this setup that means every pair that includes at least one person who knows nobody. Split those pairs into two kinds and count each: a stranger with a member of the group, and two strangers together. With 3 friends and 2 strangers, that is 3·2 + C(2, 2) = 6 + 1 = 7 handshakes.',
      how: [
        'Decide which pairs shake hands: exactly the pairs with at least one guest who knows nobody.',
        'Count stranger–friend pairs: (number of strangers)·(number in the group).',
        'Count stranger–stranger pairs: C(b, 2) = b(b − 1)/2 for b strangers.',
        'Add the two counts.',
      ],
      watch: [
        'Stopping at the stranger–friend pairs: the strangers also shake hands with one another.',
        'Writing b(b − 1) for the stranger–stranger handshakes counts each one twice; divide by 2.',
        'Using C(total, 2) counts every pair, including the ones who greet another way.',
      ],
      tip: 'Only pairs that include someone who knows nobody shake hands: count stranger–friend pairs and stranger–stranger pairs separately.',
    },
    'Counting committees': {
      idea: 'When one situation is forbidden, it is usually easier to count everything and subtract the bad cases (complementary counting). A committee is bad only if both of the two people who refuse to serve together are on it. To count those, put both of them in and choose the rest from everyone else. For 5 members, a committee of 3 and one feuding pair: C(5, 3) − C(3, 1) = 10 − 3 = 7.',
      how: [
        'Count all committees, ignoring the rule: C(n, k).',
        'Count the forbidden committees: both people are in, so choose the other k − 2 members from the other n − 2 people: C(n − 2, k − 2).',
        'Subtract: C(n, k) − C(n − 2, k − 2).',
      ],
      watch: [
        'Only committees with both of the two are forbidden; committees with just one of them are fine.',
        'C(n − 2, k) counts only committees with neither person, which leaves out the allowed ones with exactly one of them.',
        'Forgetting to subtract anything at all.',
      ],
      tip: 'Count every possible committee, then subtract the ones where both of the people who refuse are on it together.',
    },
    'Forming teams': {
      idea: 'Build the teams in two stages. First split one group into the g teams-to-be; the teams have no names, so divide by g! for the orders of the groups. Once those partial teams exist they are different from one another (they contain different people), so the second group is simply dealt out to them, with no more dividing. For 2 coaches and 4 players making 2 teams of 1 coach and 2 players: the coaches split 1 way, then the players are dealt 4!/(2!·2!) = 6 ways, so 6.',
      how: [
        'Split the first group into g unlabeled groups of a: J!/((a!)<sup>g</sup>·g!).',
        'Treat those groups as labeled now, since their members tell them apart.',
        'Deal the second group out, b to each team: S!/(b!)<sup>g</sup>.',
        'Multiply the two counts.',
      ],
      watch: [
        'Divide by g! exactly once: forgetting it counts named teams, and dividing again when dealing the second group undercounts.',
        'C(J, a)·C(S, b) only builds one team, not all of them.',
        'Adding the two stages instead of multiplying.',
      ],
      tip: 'Split the first group into teams (dividing once by the number of ways to order the teams), then hand out the second group to those now-different teams.',
    },
    'Multiples in blocks': {
      idea: 'When k &lt; B &lt; 2k, any B consecutive numbers contain one or two multiples of k: never none (a block of at least k numbers always hits one) and never three (that needs more than 2k numbers). So every pile has one multiple, and some piles have one extra. Counting all the multiples tells you how many extras there are. For 1 to 30 in 3 piles of 10, there are 4 multiples of 7, so exactly 4 − 3 = 1 pile has two.',
      how: [
        'Check that each block must hold one or two multiples of k, since k &lt; B &lt; 2k.',
        'Count all the multiples of k from 1 to N: ⌊N/k⌋.',
        'Give one multiple to each pile; the multiples left over are the piles with two: ⌊N/k⌋ − (number of piles).',
        'Piles with exactly one = (number of piles) − (piles with two).',
      ],
      watch: [
        'Read the question: it may ask for piles with two multiples or piles with exactly one.',
        'Guessing from N/k alone, without the one-per-pile argument, easily gives an answer that is off by one or by a lot.',
      ],
      tip: 'Every pile holds at least one multiple, so compare the total number of multiples with the number of piles.',
    },
    'Inclusion and exclusion': {
      idea: 'If you add the multiples of a and the multiples of b, the numbers divisible by both get counted twice, so subtract them once. The numbers divisible by both a and b are exactly the multiples of lcm(a, b), which is a·b only when a and b share no factor. From 1 to 20, the numbers divisible by 4 or 6 number 5 + 3 − 1 = 7, since the only common multiple is 12.',
      how: [
        'Count the multiples of a up to N: ⌊N/a⌋, and the multiples of b: ⌊N/b⌋.',
        'Count the multiples of both: ⌊N/lcm(a, b)⌋.',
        'Divisible by a or b: ⌊N/a⌋ + ⌊N/b⌋ − ⌊N/lcm(a, b)⌋.',
        'Divisible by neither: N minus that.',
      ],
      watch: [
        'Using a·b for the overlap when a and b share a factor: for 4 and 6 the common multiples are the multiples of 12, not 24.',
        'Forgetting to subtract the overlap, which counts those numbers twice.',
        'For "neither", subtracting both counts from N without adding the overlap back.',
      ],
      tip: 'Add the two counts of multiples, then subtract the numbers divisible by both, which are the multiples of the lcm.',
    },
    'Separated neighbors': {
      idea: 'Count all orders, then use inclusion–exclusion on the forbidden pairs: subtract orders where a pair touches, add back orders where two pairs touch, and so on. To count orders where chosen pairs touch, glue each pair into a block. Pairs that share a letter, like AB and BC, glue into one block ABC, which can only read forward or backward. For A, B, C, D this gives 24 − 36 + 16 − 2 = 2 orders (BDAC and CADB).',
      how: [
        'Start with all n! orders of the n letters.',
        'For a set of k forbidden pairs, glue them: n − k blocks, so (n − k)! orders of the blocks.',
        'Each run of glued letters can be read forward or backward: multiply by 2 for every run.',
        'Add the totals for even k and subtract them for odd k (k = 0, 1, 2, …), then simplify.',
      ],
      watch: [
        'Overlapping pairs like AB and BC make one block with 2 orientations, not two blocks with 2·2.',
        'Stopping after subtracting single pairs: orders with two touching pairs were subtracted twice and must be added back.',
      ],
      tip: 'Glue the forbidden pairs into blocks and use inclusion–exclusion, remembering that a chain of glued letters can only flip as a whole.',
    },
    'Making postage': {
      idea: 'Once you decide how many stamps of one kind to use, the other kind is forced, if it works at all. So count the good choices for one kind. The good values all leave the same remainder, so they form an arithmetic sequence that you can count from its first term to its last. For 30 cents from 3-cent and 4-cent stamps, the number of 4-cent stamps can be 0, 3 or 6: 3 ways.',
      how: [
        'Let y be the number of stamps of the larger kind b; then b·y ≤ N.',
        'Find the smallest y that makes N − b·y a multiple of a.',
        'The values that work are y, y + a, y + 2a, …, up to the largest one with b·y ≤ N.',
        'Count them: (last − first)/a + 1.',
      ],
      watch: [
        'Off by one when counting the list: include both the first and the last value.',
        'N/(a·b) is only a rough estimate; find the actual first and last values.',
      ],
      tip: 'Fix the number of stamps of one kind; the values that work form an arithmetic sequence you can count from first to last.',
    },
    'Rising and falling digits': {
      idea: 'A number with strictly increasing digits is decided completely by which digits it uses: pick the set of digits, and there is exactly one way to write them in increasing order. The same goes for decreasing digits. The only difference is the digit 0: it can never be in an increasing number (it would have to come first), but it can end a decreasing one. Two-digit examples: C(9, 2) = 36 rising, C(10, 2) = 45 falling.',
      how: [
        'Match each number with the set of its digits.',
        'j-digit numbers with rising digits: choose j digits from 1 to 9, C(9, j).',
        'j-digit numbers with falling digits: choose j digits from 0 to 9, C(10, j).',
        'Their difference, C(10, j) − C(9, j) = C(9, j − 1), counts the falling numbers that end in 0; add these up over every length asked about.',
      ],
      watch: [
        'Letting a rising number use 0: it would have to be the first digit.',
        'Answering with the number of falling (or rising) numbers instead of the difference.',
        'When a range of lengths is asked, include every length from 2 digits up.',
      ],
      tip: 'Think of each number as the set of its digits, and ask whether 0 can be one of them.',
    },
    'Races with ties': {
      idea: 'Handle a tie by gluing: if exactly k cars tie, choose which k cars, then treat them as one car sharing a place. That leaves n − k + 1 "cars" to put in order. Add over every possible size of the tie, plus the results with no tie at all if those are allowed. With 3 cars and at most one tie: 6 + C(3, 2)·2! + C(3, 3)·1! = 6 + 6 + 1 = 13.',
      how: [
        'If ties are optional, count the results with no tie: n!.',
        'For a tie of exactly k cars, choose them: C(n, k).',
        'Glue the tied cars into one and order the n − k + 1 "cars": (n − k + 1)!.',
        'Add C(n, k)·(n − k + 1)! for k = 2 up to n, plus n! if no tie is allowed.',
      ],
      watch: [
        'Include n! only when a race with no tie counts; leave it out when there must be exactly one tie.',
        'Using (n − k)! forgets that the tied group still takes a place in the order.',
        'A tie can involve 3, 4 or more cars, not just 2.',
      ],
      tip: 'Choose the tied cars, glue them into one, and order that group together with the other cars.',
    },
    'Coloring a map': {
      idea: 'Paint the regions one at a time, in an order where each new region touches regions already painted, and multiply the number of choices at each step. A region\'s choices are the colors not already used by the painted regions it touches. If those neighbors touch each other too, they must differ, so they use up two colors. One region on top and two below, with 3 colors: 3·2·1 = 6.',
      how: [
        'Paint from left to right, so each new region touches regions already painted.',
        'The first region has k choices, and the region it touches in the other row has k − 1.',
        'Each later region touches two painted regions that also touch each other, so they use two different colors: k − 2 choices.',
        'Multiply all the choices.',
      ],
      watch: [
        'Giving every new region k − 1 choices: most regions touch two already-painted regions, not one.',
        'Taking away three colors: the two painted neighbors use exactly two different colors.',
        'Ignoring the rule entirely and answering k to the power of the number of regions.',
      ],
      tip: 'Paint from left to right and, for each region, count how many different colors its already-painted neighbors use.',
    },
    'Knights, knaves and jokers': {
      idea: 'Turn each kind of contestant into a pattern of three answers. A Joker splits into two kinds: one who starts with the truth and one who starts with a lie. Once you know who says yes to each question, every count of yeses is a sum of some of the type counts, and subtracting one count from another isolates a single type.',
      how: [
        'Work out the three answers of a Knight, a Knave, a truth-first Joker and a lie-first Joker.',
        'Write each question\'s number of yeses as the sum of the types that say yes to it.',
        'Subtract one equation from another to find each type\'s count.',
        'Answer what is asked: a number of people, or of tokens (one for every yes that person gave).',
      ],
      watch: [
        'A Knave asked "Are you a Knave?" says no, because the true answer is yes.',
        'The two kinds of Joker answer every question in opposite ways; don\'t lump them together.',
        'Tokens are not people: count each type\'s yes answers.',
      ],
      tip: 'Make a table of what each type, including the two kinds of Joker, answers to the three questions, then compare the yes counts.',
    },
    'Number snakes in a grid': {
      idea: 'Color the 3 × 3 grid like a checkerboard. Squares that share a side have different colors, so walking 1, 2, 3, …, 9 the colors alternate. The color with 5 squares (the four corners and the center) must hold the five numbers in the odd positions of that walk, which are 1, 3, 5, 7 and 9. That turns a puzzle about paths into simple addition.',
      how: [
        'Color the grid like a checkerboard: the corners and the center are one color, the four edge squares the other.',
        'Consecutive numbers share a side, so their colors alternate along 1, 2, …, 9.',
        'So the five corner-and-center squares hold the five odd numbers, which add up to 25.',
        'Subtract the corner total from 25 to get the center.',
      ],
      watch: [
        'Trying arrangements by hand is slow and easy to get wrong; the coloring argument is quick and certain.',
        'The center is not always 5; it depends on the corners.',
      ],
      tip: 'Color the squares like a checkerboard and ask which numbers must land on the corners and the center.',
    },
    'Crossing lines': {
      idea: 'Organize the possibilities by how lines are parallel or meet at one point, instead of drawing at random. The extremes are easy: all lines parallel gives 0 points, all through one point gives 1, and no parallels with no three through a point gives the most, C(5, 2) = 10. The values in between come from mixing parallel families and shared crossing points, but some small values may be impossible, and those need a reason. With 3 lines, every value 0, 1, 2 and 3 is possible.',
      how: [
        'Find the extremes: all parallel, all through one point, and lines in general position (C(5, 2) crossings).',
        'Build the values in between by combining families of parallel lines and points where several lines meet.',
        'Check the small values one at a time and prove which of them are impossible.',
        'Answer the question asked: the sum of the possible values, or how many there are.',
      ],
      watch: [
        'Assuming every whole number from 0 to 10 can happen.',
        'Forgetting the arrangements with 0 points (all parallel) or 1 point (all through one point).',
        'Mixing up "the sum of the values" with "how many values".',
      ],
      tip: 'Start from the extreme arrangements, then test the small values one by one: can that many crossing points really happen?',
    },
    'Lattice squares': {
      idea: 'The line rises from left to right, so the corner of a square closest to it is the top-left one: if that corner is under the line, the whole square is. That turns the question into counting heights. For a square of side s whose left side is at x = a, the top can be at most ⌊a√k⌋, the whole number just under the line. For example, at x = 2 the line y = x√3 is at height 3.46…, so a square of side 1 can sit at heights 0, 1 or 2.',
      how: [
        'Describe a square by its bottom-left corner (a, b) and side s.',
        'It fits when b ≥ 0, its right side stays left of the boundary (a + s ≤ M for the line x = M.1), and its top-left corner is under the line: b + s ≤ ⌊a√k⌋.',
        'For each a and s, that gives ⌊a√k⌋ − s + 1 choices of b (or none, if that is not positive).',
        'Add over every left edge a and every size s.',
      ],
      watch: [
        'Counting only squares of side 1; bigger squares fit too.',
        'An off-by-one in the heights: the top of the square can be at ⌊a√k⌋ at most, never above the line.',
        'Checking the wrong corner: for a rising line, the top-left corner is the one at risk.',
      ],
      tip: 'For each square size and each position of its left side, count the heights at which its top-left corner stays under the line.',
    },
    'Sum-free sets': {
      idea: 'Look at the largest chosen number m. Any two numbers below it that add up to m can\'t both be chosen, so pairing x with m − x caps how many numbers fit. Then find a set that reaches the cap: all the odd numbers always work (odd + odd is even), and when the two numbers must be different, so does the top half of 1 to N (any two different ones add to more than N). Whether a number may be added to itself matters, because that decides whether m/2 is allowed.',
      how: [
        'Let m be the largest chosen number.',
        'Pair each x below m/2 with m − x: at most one number from each pair can be chosen.',
        'Decide about m/2: it is out if a number may be added to itself, and allowed if the two numbers must be different.',
        'This gives a limit; then give a set that reaches it, such as all the odd numbers or the top half.',
      ],
      watch: [
        'Ignoring the rule about adding a number to itself; it can change the answer by one.',
        'Giving only an example, or only a limit: you need a set that reaches the limit, and a reason nothing bigger works.',
      ],
      tip: 'Look at the largest chosen number and pair up the smaller numbers that add up to it.',
    },
    'Sets with no multiples': {
      idea: 'Write every number as an odd number times a power of 2. The numbers sharing an odd part form a chain, like 3, 6, 12, and any two numbers in a chain divide each other. There is one chain per odd number, so a set as big as the number of odd numbers must take exactly one number from every chain. Now compare chains whose odd parts divide each other, like 1, 3, 9: each pick needs a bigger power of 2 than the next, or it would divide it.',
      how: [
        'Split 1 to N into chains: an odd number o, then 2o, 4o, 8o, …',
        'A set of the largest size takes exactly one number from each chain.',
        'Follow a chain of odd parts like 1, 3, 9: the powers of 2 in the picks must go strictly down along it.',
        'Use that to rule out the small numbers, then check that a whole set exists with your answer in it.',
      ],
      watch: [
        '1 divides everything, and other small numbers get blocked by the powers-of-2 argument, so the smallest member is bigger than it looks.',
        'Ruling out small numbers is only half the job: also show a complete set that uses your answer.',
      ],
      tip: 'Write each number as an odd number times a power of 2, and notice that the set must take exactly one number from each chain.',
    },
    'Round robin': {
      idea: 'Two facts pin down the number of players. Every game has exactly one winner, so all the wins add up to the number of games, and "won p% more" fixes what share of the games each side won. Also, games between two right-handers are always won by a right-hander, so the right-handers\' share can\'t be too small. That limits the possible sizes, and only some of those make every number of wins a whole number.',
      how: [
        'With L left-handers and r·L right-handers there are (r + 1)L players and C((r + 1)L, 2) games.',
        'If the left-handers won (1 + p/100) times as many games, the right-handers won 1/(2 + p/100) of all the games.',
        'The right-handers won at least all C(rL, 2) games among themselves; that gives a limit on L.',
        'Among the allowed values of L, keep the one where every number of wins is a whole number, and count the games.',
      ],
      watch: [
        'The question asks for the total number of games, not the wins of one side.',
        'Forgetting the games among the right-handers, which force them to have a minimum number of wins.',
      ],
      tip: 'Write the number of games and the right-handers\' share of the wins in terms of L, then use that right-handers win every game among themselves.',
    },
    'Pairing friends': {
      idea: 'Every pair is either two neighbors or two guests sitting opposite. If nobody is paired across the table, the pairs go around the circle, and there are exactly 2 ways to do that. Pairs across the table cut the circle into arcs, and the guests in each arc must pair off with their neighbors, which works (in exactly one way) only when the arc has an even number of guests. So you are counting the choices of across-the-table pairs that leave every arc even.',
      how: [
        'Count the pairings with no across pairs: neighbors all the way around, 2 ways.',
        'For pairings that use across pairs, each arc between them must hold an even number of guests.',
        'Number the lines across the table in order; the chosen lines must be an odd number of steps apart, all the way around.',
        'Count the choices for each number of across pairs and add everything up.',
      ],
      watch: [
        'Forgetting the 2 pairings that use only neighbors.',
        'Allowing an arc with an odd number of guests: someone would be left out.',
      ],
      tip: 'Choose which across-the-table pairs to use, then check that each arc of guests left between them has an even number of people.',
    },
    'Seating with rules': {
      idea: 'Use inclusion–exclusion on the two sets of twins. Call two seats close if they are side by side in a row or one directly behind the other. Subtract the seatings where the first twins sit in a close pair, and those where the second twins do; the seatings where both sets break the rule were subtracted twice, so add them back once. In that last count, the two close pairs can\'t share a seat.',
      how: [
        'Count the close pairs of seats: side by side in each row, plus front and back in each column.',
        'All seatings: n!. With one given set of twins in a close pair: (close pairs)·2·(n − 2)!.',
        'With both sets in close pairs: pick two close pairs that share no seat, give them to the two sets (2 ways), seat each set either way round (2·2), and seat the rest: (n − 4)!.',
        'Answer: all − 2·(one set close) + (both sets close).',
      ],
      watch: [
        'Subtracting the single cases but not adding back the seatings where both sets of twins sit close.',
        'Counting pairs of close pairs that share a seat in the "both" step.',
        'Forgetting that each set of twins can sit either way round in its two seats.',
      ],
      tip: 'Count the seatings where a set of twins sits close, combine the two sets with inclusion–exclusion, and check which close pairs can be used at the same time.',
    },
    'Colorings up to symmetry': {
      idea: 'When paintings that turn or flip into each other count as the same, use Burnside\'s lemma: the number of different paintings is the average, over all the symmetries, of how many paintings each symmetry leaves exactly unchanged. Three beads in a triangle, two red and one blue: doing nothing keeps 3, each turn keeps 0, each flip keeps 1, so (3 + 0 + 0 + 1 + 1 + 1)/6 = 1.',
      how: [
        'Count the paintings with the triangle held still, using the given number of disks of each color.',
        'List the 6 symmetries of the triangle: do nothing, two turns (120° and 240°) and three flips.',
        'For a turn, a painting stays the same only if each cycle of disks it moves around is one color.',
        'For a flip, the disks it swaps must match in pairs, while the disks on the axis stay where they are.',
        'Add the six counts and divide by 6.',
      ],
      watch: [
        'Dividing the held-still count by 6 only works when no painting is unchanged by a turn or flip.',
        'Forgetting the flips and averaging over the turns only.',
        'When counting unchanged paintings, still use exactly the given number of disks of each color.',
      ],
      tip: 'Go through the six symmetries and, for each one, count the paintings it leaves exactly as they were; then average.',
    },
    'Paths on a cube': {
      idea: 'The cube looks the same from every corner and along every edge, so fix the start and use symmetry. The first edge can be any of 3 and the second any of 2 (it can\'t go back), and these 6 starts all finish in the same number of ways: count the finishes for one of them and multiply. To see where a walk can end, color the corners in two colors so that every edge joins different colors: after 7 edges you are on the other color from the start, which is either one of its 3 neighbors or the far corner.',
      how: [
        'Fix the first two edges; by symmetry there are 3·2 = 6 equally good choices.',
        'From there, list every way to visit the remaining corners exactly once, branching carefully at each corner.',
        'Multiply the number of finishes by 6.',
        'If the walk must end next to its start, use the coloring: keep the walks that end at a neighbor, not at the far corner.',
      ],
      watch: [
        'Missing walks when listing by hand: branch systematically at every corner.',
        'A walk may never return to a corner it has already visited.',
        'Mixing up "all walks" with "walks that end one edge from the start".',
      ],
      tip: 'Use symmetry to fix the first two edges, list the ways to finish from there, and multiply.',
    },
    // ---------- probability ----------
    'Probability with dice': {
      idea: "Think of the two dice as different colors, say red and blue. Then there are 6 × 6 = 36 ordered outcomes, like (red 1, blue 3), and every one of them is equally likely, so a probability is just (outcomes that work)/36. A single total s can be made in 6 − |s − 7| ways: 1 way for 2 or 12, rising to 6 ways for 7. For example, both dice show the same number in 6 of the 36 ways, (1, 1) up to (6, 6): 6/36 = 1/6.",
      how: [
        'Treat the dice as different, so there are 36 equally likely ordered pairs (first die, second die).',
        'For one exact total s, count 6 − |s − 7| pairs.',
        'For "at least s" or "a multiple of s", list every total that qualifies and add up their counts.',
        'Divide by 36 and reduce the fraction.',
      ],
      watch: [
        'Counting unordered pairs: (1, 3) and (3, 1) are different outcomes, and the 21 unordered pairs are not equally likely.',
        'For "at least s", include s itself; for "a multiple of s", check every multiple from 2 up to 12.',
        'Counting the outcomes that fail instead of the ones that work.',
      ],
      tip: 'Picture the dice as two different colors and count the ordered pairs that work, out of 36.',
    },
    'Many dice': {
      idea: "Every die shows at least 1, so give each die its 1 first; the question becomes how to share the leftover pips. When the leftover is 5 or less, no die can go past 6, so the sharing has no limits, and the number of ways to share e identical pips among n dice is C(e + n − 1, n − 1) (stars and bars: e stars and n − 1 bars in a row). The dice are different, so 2 + 1 + 1 and 1 + 2 + 1 count separately, which stars and bars does. For example, 3 dice with a total of 5: two extra pips among 3 dice gives C(4, 2) = 6 ways.",
      how: [
        'Subtract the number of dice n from the total: that leaves e extra pips to share.',
        'Check that e is at most 5, so no die can go over 6.',
        'Count the ways to share e identical pips among n dice: C(e + n − 1, n − 1).',
        'That count is the answer: it is already out of the 6<sup>n</sup> outcomes.',
      ],
      watch: [
        'Off-by-one slips in stars and bars: C(s − 1, n) or C(s, n − 1) instead of C(s − 1, n − 1).',
        'Forgetting that every die must show at least 1 (sharing the whole total from 0 up).',
      ],
      tip: 'Give every die its 1 first, then count the ways to share the pips that are left.',
    },
    'Prime chances': {
      idea: 'When every allowed number is equally likely, the probability is (allowed numbers that are prime)/(allowed numbers). So count the allowed numbers first: with a set of k usable digits there are k one-digit numbers and k × k two-digit ones. Then test each for primality: below 100 you only need to try dividing by 2, 3, 5 and 7, because a composite number below 100 has a factor of at most 9.',
      how: [
        'Count the allowed numbers: k one-digit and k² two-digit, where k is the number of usable digits.',
        'List them, and cross out any that are divisible by 2, 3, 5 or 7 (other than 2, 3, 5 and 7 themselves).',
        'Remember that 1 is not prime.',
        'Divide the number of primes by the number of allowed numbers, and reduce.',
      ],
      watch: [
        'Dividing by 99 (every number below 100) instead of by the allowed numbers only.',
        'Forgetting the one-digit numbers, in the count or among the primes.',
        'Counting 1 as a prime.',
      ],
      tip: 'First count how many numbers are allowed at all, one-digit ones included, then test each for primality.',
    },
    'Choices in common': {
      idea: "Fix the first person's list: by symmetry it doesn't matter which one it is. The second list is one of C(n, k) equally likely choices. To share exactly j films, the second person takes j of the first person's k films and the other k − j from the n − k films that are not on the first list. For example, with 6 films and lists of 2, sharing exactly 1 has probability C(2, 1)·C(4, 1)/C(6, 2) = 8/15.",
      how: [
        "Fix the first person's list of k.",
        'Count every possible second list: C(n, k).',
        "Count the second lists sharing exactly j: C(k, j) ways to pick the shared ones, times C(n − k, k − j) ways to pick the rest from outside the first list.",
        'Divide and reduce.',
      ],
      watch: [
        'Counting "at least j" in common when the question says "exactly j".',
        'Leaving out a factor: the shared films and the other films are both choices, so multiply C(k, j) by C(n − k, k − j).',
      ],
      tip: "Fix the first person's list, then count the second lists that take exactly j of its films and the rest from outside it.",
    },
    'Running totals': {
      idea: 'The running total only goes up, so it can land on a given square at most once, and the ways of landing there never overlap. Split by how many rolls it takes: the first m rolls add up to exactly t in C(t − 1, m − 1) ways (each roll is at least 1, and with t ≤ 6 none can be too big), and each of those starts has probability (1/6)<sup>m</sup> no matter what comes after. Add the cases. For example, landing on 3 within 2 rolls: roll a 3 (1/6), or roll 1 then 2 or 2 then 1 (2/36), for 8/36 = 2/9 in all.',
      how: [
        'Split by m, the number of rolls it takes to reach the square exactly (m runs from 1 up to the number of turns, and no more than t).',
        'Count the ways m rolls can add up to t: C(t − 1, m − 1).',
        'Multiply each count by (1/6)<sup>m</sup>; the later rolls do not matter.',
        'Add the cases and reduce.',
      ],
      watch: [
        'Only checking where the token is at the end: it counts if it stops on the square at any turn.',
        'Answering 1/6, or using 1 − (5/6)<sup>r</sup>: that is the chance of rolling some particular number at least once, a different event.',
      ],
      tip: 'Split by how many rolls it takes to reach the square exactly, and add those separate cases.',
    },
    'At least once': {
      idea: "\"At least once\" is easiest through its opposite: you fail only by missing every single time. With two dice, a total of s comes up in 6 − |s − 7| of the 36 ways, so one throw misses with probability q = (36 − that)/36, and n independent throws all miss with probability q<sup>n</sup>. So the chance of at least one hit is 1 − q<sup>n</sup>, which grows as n grows; the answer is the first n that pushes it past the target. For example, one die and a 6: 1 − (5/6)<sup>3</sup> ≈ 0.42 but 1 − (5/6)<sup>4</sup> ≈ 0.52, so 4 throws beat 1/2.",
      how: [
        'Count the ways the total can appear with two dice, and find the chance q that one throw misses it.',
        'The chance of at least one hit in n throws is 1 − q<sup>n</sup>.',
        'Rewrite the condition as q<sup>n</sup> < 1 − (target).',
        'Try values of n and take the first one that works; check that one fewer throw does not.',
      ],
      watch: [
        'Adding the chances (n × c/36): the throws can both hit, so adding overcounts and gives too small an n.',
        'Stopping one throw too early: the chance must be greater than the target, not just close to it.',
      ],
      tip: 'Find the chance of missing on every single throw, and subtract it from 1.',
    },
    'Taking turns': {
      idea: "Look at one round: the first player throws, then the second. The round ends with a win for the first player with probability a, with a win for the second with probability (1 − a)·b (the second only throws if the first missed), and otherwise the game starts over exactly as before. Because a restart changes nothing, only those two endings matter, so the first player wins with probability a/(a + (1 − a)b). For example, if each succeeds a third of the time, the endings are 1/3 and 2/3 · 1/3 = 2/9, in the ratio 3 : 2, so the first player wins 3/5 of the time.",
      how: [
        "Find the chance that the first player wins in a round: a.",
        'Find the chance that the second player wins in a round: (1 − a)·b.',
        'Only these two endings matter, so the first player wins with probability a/(a + (1 − a)b), and the second with the rest.',
        'Answer for the player the question asks about, in lowest terms.',
      ],
      watch: [
        "Using b instead of (1 − a)·b: the second player only throws if the first one missed.",
        "Answering with a player's chance for a single throw: going first, or getting extra tries, changes the overall chance.",
        'Giving the other player\'s probability: check whose win is asked for.',
      ],
      tip: "Compare the chance that the first player wins a round with the chance that the second player wins it.",
    },
    'Expected value': {
      idea: "Linearity of expectation: the expected number of people who succeed is the sum of each person's chance of succeeding, so you never need to track who throws when. One person ends without success only if every allowed try fails, which has probability (1 − p)<sup>k</sup>. So each succeeds with probability 1 − (1 − p)<sup>k</sup>, and the expected number is N times that. For example, 10 people with fair coins and at most 2 flips each: 10 × (1 − 1/4) = 7.5 expected heads.",
      how: [
        'Find the chance of success on one try: 1/2 for heads on a coin, 2/6 = 1/3 for a 5 or a 6 on a die.',
        'One person fails every try with probability (1 − p)<sup>k</sup>, where k is the most tries allowed.',
        'So one person succeeds with probability 1 − (1 − p)<sup>k</sup>.',
        'Multiply by the number of people.',
      ],
      watch: [
        'Using the wrong number of tries, one too few or one too many.',
        'Giving the expected number of failures, N·(1 − p)<sup>k</sup>, instead of successes.',
        'Taking p = 1/6 for "a 5 or a 6": that is two faces out of six.',
      ],
      tip: "Find one person's chance of failing every allowed try, then use it for everyone at once.",
    },
    'Random divisors': {
      idea: 'Write the factorial as a product of prime powers. A divisor picks each exponent independently from 0 up to the one in the factorial, so with exponents e₁, e₂, … there are (e₁ + 1)(e₂ + 1)⋯ divisors, all equally likely here. A divisor is a perfect square exactly when every exponent is even (a cube: every exponent a multiple of 3), so each prime allows ⌊e/2⌋ + 1 choices (or ⌊e/3⌋ + 1). For example, 4! = 2³·3 has 4·2 = 8 divisors, and the squares need exponents 0 or 2 on the 2 and 0 on the 3: 2 of them, so the probability is 1/4.',
      how: [
        'Find the exponent of each prime p in F! with ⌊F/p⌋ + ⌊F/p²⌋ + ⌊F/p³⌋ + ⋯.',
        'Count all divisors: multiply (e + 1) over the primes.',
        'Count the perfect squares: multiply (⌊e/2⌋ + 1); for cubes, multiply (⌊e/3⌋ + 1).',
        'Divide, reduce to lowest terms, then add the top and bottom.',
      ],
      watch: [
        'Forgetting the "+ 1" for exponent 0, which is always allowed.',
        'Adding a + b before reducing the fraction.',
        'Missing the extra 2s and 3s in numbers like 4, 8 and 9 when finding the exponents.',
      ],
      tip: 'Write the factorial as prime powers, then count the divisors whose exponents are all even (or all multiples of 3).',
    },
    'Remainders by chance': {
      idea: "Whether p divides N<sup>e</sup> − 1 depends only on N's remainder when divided by p. The range has a multiple of p numbers, so each remainder 0, 1, …, p − 1 is equally likely. Remainder 0 never works, and for the others Fermat's little theorem says r<sup>p−1</sup> leaves remainder 1, so you can cut the exponent down to e mod (p − 1) before testing. For example, with p = 5 and e = 2, the squares 1, 4, 9, 16 leave remainders 1, 4, 4, 1, so remainders 1 and 4 work: 2/5.",
      how: [
        'Check that the range splits evenly by p, so the remainders 0 to p − 1 are equally likely.',
        'Rule out remainder 0: then N<sup>e</sup> − 1 leaves remainder p − 1.',
        'Reduce the exponent mod p − 1 (Fermat), and find which remainders r give r<sup>e</sup> a remainder of 1.',
        'Divide the number of good remainders by p, all p of them.',
      ],
      watch: [
        'Dividing by p − 1: remainder 0 is one of the equally likely cases too.',
        'Assuming every nonzero remainder works: that is only true when e is a multiple of p − 1.',
      ],
      tip: "Only N's remainder when divided by the prime matters, so test each possible remainder.",
    },
    'Units digits by chance': {
      idea: "The units digit of a power depends only on the units digit of the base, and it repeats in a cycle of length 1, 2 or 4: for 2 it goes 2, 4, 8, 6; for 3 it goes 3, 9, 7, 1; for 7 it goes 7, 9, 3, 1; for 8 it goes 8, 4, 2, 6; 4 and 9 alternate; 1, 5 and 6 never change. Every cycle fits into 4 steps, so only the exponent mod 4 matters. When the years cover a whole number of 4-year blocks, each remainder mod 4 turns up equally often, so for each base you can count the good years block by block.",
      how: [
        'Reduce each base to its units digit and write its cycle of units digits.',
        'Note how many years there are; each remainder of Y mod 4 appears (number of years)/4 times.',
        'For each base, find which remainders of Y give the wanted digit (Y ≡ 1 picks the first entry of the cycle, Y ≡ 0 the fourth) and count those years.',
        'Add the counts over the bases and divide by 5 × (number of years).',
      ],
      watch: [
        'Lining the cycle up with the wrong remainder: the cycle starts at exponent 1, so Y ≡ 0 (mod 4) gives the last entry, not the first.',
        'Only counting the bases that can ever end in the digit: the year matters too.',
      ],
      tip: 'The units digit of a power depends only on the last digit of the base and the exponent mod 4; count the good years for each base.',
    },
    'Geometric probability': {
      idea: 'When a point lands at random in a region, the chance of landing in a part of it is (area of the part)/(area of the region). The region |x| + |y| ≤ a is a square standing on a corner with diagonals 2a, so its area is ½·2a·2a = 2a². A condition (u − c)² ≤ w² means c − w ≤ u ≤ c + w, and with u = x² + y² that is a ring between two circles; its area is π·(bigger radius² − smaller radius²), and the squared radii are just c + w and c − w, so no square roots are needed. Check that the ring fits inside: the biggest circle in the diamond has radius² a²/2.',
      how: [
        'Find the area of the board: |x| + |y| ≤ a is a diamond of area 2a².',
        'Rewrite the target condition as c − w ≤ x² + y² ≤ c + w: a ring.',
        'The ring has area π((c + w) − (c − w)) = 2wπ.',
        'Check that c + w ≤ a²/2 so the ring is inside, then divide the areas, reduce m/n and add.',
      ],
      watch: [
        'Using only the outer circle and forgetting to take away the hole in the middle.',
        'Getting the diamond wrong: its area is half of the 2a-by-2a square around it, 2a², not a² or 4a².',
      ],
      tip: 'Find both areas: the board is a square standing on its corner, and the target is a ring between two circles.',
    },
    // ---------- geometry ----------
    'Right triangles': {
      idea: "The area of a triangle doesn't depend on which side you call the base. In a right triangle the two legs are a base and its height, so the area is ½·a·b. Using the hypotenuse c as the base instead, the height is the altitude h to the hypotenuse, so the area is also ½·c·h. Setting the two equal gives h = ab/c. For example, legs 15 and 20 give hypotenuse 25 and altitude 15·20/25 = 12.",
      how: [
        'Find the hypotenuse c = √(a² + b²); it is often a scaled Pythagorean triple like 3-4-5 or 5-12-13.',
        'Write the area with the legs: ½·a·b.',
        'Write it again with the hypotenuse as the base: ½·c·h.',
        'Set them equal and solve: h = ab/c.',
      ],
      watch: [
        'Using ab/(a + b) or (a + b)/2: neither is the altitude.',
        'Dropping or doubling the ½ on one side: h = ab/c, not ab/(2c).',
      ],
      tip: 'Write the area of the triangle twice: once with the legs, once with the hypotenuse as the base.',
    },
    'Coordinate geometry': {
      idea: 'For a triangle with corners (x₁, y₁), (x₂, y₂) and (x₃, y₃), the shoelace formula gives the area as ½·|(x₂ − x₁)(y₃ − y₁) − (x₃ − x₁)(y₂ − y₁)|: the cross product of the two sides from the first corner is the area of the parallelogram they span, and the triangle is half of it. Another way: draw the smallest rectangle around the triangle with sides parallel to the axes, and subtract the right triangles in its corners. For example, (0, 0), (4, 1) and (1, 3) give ½·|4·3 − 1·1| = 11/2.',
      how: [
        'Pick one corner and write the two sides from it: (x₂ − x₁, y₂ − y₁) and (x₃ − x₁, y₃ − y₁).',
        'Cross-multiply: (x₂ − x₁)(y₃ − y₁) − (x₃ − x₁)(y₂ − y₁).',
        'Take the absolute value and halve it.',
        'To check, box the triangle in an axis-parallel rectangle and subtract the corner triangles.',
      ],
      watch: [
        'Forgetting the ½: the cross product is a parallelogram, twice the triangle.',
        'Giving the area of the box around the triangle (or half of it) instead of the triangle itself.',
      ],
      tip: 'Use the shoelace formula, or box the triangle in a rectangle and subtract the corner triangles.',
    },
    'Altitudes of a triangle': {
      idea: "A line that crosses both axes cuts off a right triangle with its right angle at the origin. In a right triangle, two of the three altitudes are the legs themselves, since each leg is perpendicular to the other. The third altitude, to the hypotenuse, comes from the area: it is (leg × leg)/hypotenuse. So the total is leg + leg + (leg × leg)/hypotenuse.",
      how: [
        'Find the intercepts: set y = 0 to get the x-intercept and x = 0 to get the y-intercept.',
        'The legs are those two intercepts; the hypotenuse is √(leg² + leg²).',
        'Two altitudes are the legs; the third is (leg × leg)/hypotenuse.',
        'Add all three.',
      ],
      watch: [
        'Adding the hypotenuse instead of the altitude to it.',
        'Leaving out the legs: they count as two of the altitudes.',
      ],
      tip: "Two of a right triangle's altitudes are its legs; find the third from the area.",
    },
    'Segments to the hypotenuse': {
      idea: "Slide a point along the hypotenuse from one end to the other and watch its distance from the right-angle corner: it starts at one leg's length, shrinks to the altitude h = (leg × leg)/hypotenuse at the foot of the altitude, then grows to the other leg's length. Lengths change smoothly, so on each side of the foot every length between h and that leg happens exactly once. Count the whole numbers in each range; if h is itself a whole number, that one segment sits on both sides, so count it once.",
      how: [
        'Find the altitude h = ab/c, the shortest segment from the corner to the hypotenuse.',
        'On one side of its foot the lengths run from h up to the first leg: count the whole numbers in that range.',
        'On the other side they run from h up to the second leg: count again.',
        'Add the two counts, and subtract 1 if h is a whole number (the altitude was counted twice).',
      ],
      watch: [
        'Counting only one side of the foot of the altitude.',
        'Double counting the altitude: subtract 1 only when its length is a whole number.',
        'Assuming the lengths simply run from one leg to the other.',
      ],
      tip: 'Find the shortest possible segment first, then count the whole-number lengths on each side of where it lands.',
    },
    'Perpendicular to a diagonal': {
      idea: 'Put the rectangle on axes with W = (0, 0), X = (a, 0), Y = (a, b) and Z = (0, b). The perpendicular from X to the diagonal WY makes a small right triangle similar to WXY, which gives WF = WX²/WY (a leg squared over the hypotenuse). Triangle WFZ stands on side WZ, which lies along the y-axis, so its height is just how far F is from that side, its x-coordinate: WF·(a/WY) = a³/(a² + b²).',
      how: [
        'Place the rectangle with W = (0, 0), X = (a, 0), Y = (a, b) and Z = (0, b).',
        'Use similar right triangles: WF = WX²/WY = a²/√(a² + b²).',
        "F's distance from side WZ is WF·a/WY = a³/(a² + b²).",
        'Area of WFZ = ½·WZ·(that distance) = ½·b·a³/(a² + b²).',
      ],
      watch: [
        "Using WF as the height: the height to base WZ is F's horizontal distance from WZ.",
        'Swapping the two side lengths: check which side is a and which is b.',
        'Assuming the triangle is a simple fraction of the rectangle, like a quarter.',
      ],
      tip: 'Put the rectangle on coordinate axes and work out how far F is from the side the triangle stands on.',
    },
    'Squares in a right triangle': {
      idea: "The two squares sit differently, so find each one separately. With the legs on the axes, the hypotenuse is the line x/a + y/b = 1, and a square in the right-angle corner has its far corner (x, x) on that line, so x = ab/(a + b). For a square standing on the hypotenuse, use the altitude h = ab/c: cuts parallel to the hypotenuse shrink evenly from width c at the bottom to 0 at height h (similar triangles), so the width at height y is c(1 − y/h), and the square needs that width to equal y.",
      how: [
        'Square at the right angle: solve x/a + x/b = 1, so x = ab/(a + b).',
        'Square on the hypotenuse: find the altitude h = ab/c.',
        'At height y above the hypotenuse the triangle is c(1 − y/h) wide; set that equal to y to get y = ch/(c + h).',
        'Divide x by y and simplify.',
      ],
      watch: [
        'Assuming the two squares are the same size: they are close, but not equal.',
        'Flipping the ratio: the question asks for x divided by y.',
      ],
      tip: 'Handle the squares separately: one has a corner on the hypotenuse, the other stands on it, and similar triangles give each side.',
    },
    'Lines making an equilateral triangle': {
      idea: 'A slope is the tangent of the angle a line makes with the x-axis, and tan 30° = √3/3, so y = b + (√3/3)x rises at 30°, while a vertical line stands at 90°. Those two meet at 60°, which is right for an equilateral triangle; the third side must make 60° with both, so it falls at 30°, and through the origin that is y = −(√3/3)x. Then one side of the triangle lies on the vertical line, between the points where the two sloping lines cross it.',
      how: [
        'Turn the slope √3/3 into an angle: the line rises at 30°.',
        'The third side makes 60° with both lines, so through the origin it is y = −(√3/3)x.',
        'Find where the two sloping lines cross the vertical line, and subtract the y-values: that is one side.',
        'Multiply by 3 for the perimeter, and simplify (3 · 2a√3/3 = 2a√3).',
      ],
      watch: [
        'Giving one side instead of the perimeter.',
        'Slips simplifying √3 terms: 3 × (√3/3) = √3.',
      ],
      tip: 'Turn each slope into an angle; every angle of an equilateral triangle is 60°.',
    },
    'Extending the sides': {
      idea: "Look at one of the three new corner triangles, say the one at Q. Its two sides at Q are the extension (m times PQ) and QR plus its own extension ((1 + m) times QR), and the angle between them is the supplement of angle Q. Supplementary angles have the same sine, so by area = ½·(side)·(side)·sin(angle) that corner triangle has m(1 + m) times the area of the original. The three corners are alike, so the big triangle has area T + 3·m(1 + m)·T. For example, extending each side by 3 times itself gives T + 3·3·4·T = 37T.",
      how: [
        'Pick one corner triangle; its sides at the shared vertex are m × one side and (1 + m) × the next side.',
        'Its angle there is supplementary to the triangle\'s angle, so it has the same sine.',
        'So its area is m(1 + m) times the original area.',
        'Add the original triangle and the three corner triangles: T + 3·m(1 + m)·T.',
      ],
      watch: [
        'Scaling both sides by the same amount (m² or (1 + m)²): one side grows by m, the other by 1 + m.',
        'Forgetting to add the original triangle in the middle, or counting only one corner triangle.',
      ],
      tip: 'Compare one corner triangle with the original using ½·ab·sin C; the angle at the shared vertex has the same sine.',
    },
    'Cutting a segment in a rectangle': {
      idea: 'Coordinates turn this into algebra. Put the rectangle on axes and write every point of SU as S + s·(U − S), where s runs from 0 at S to 1 at U. The value of s tells you what fraction of the way along SU a point is, so XY/SU is simply the difference between the s-values at X and at Y; no square roots are needed. Each s-value comes from solving the equation of SU together with the other line.',
      how: [
        'Place the rectangle with a corner at the origin and write down the coordinates of every named point.',
        'Write segment SU as S + s·(U − S), with s from 0 at S to 1 at U.',
        'Solve for the s where SU meets KT, and the s where it meets KM.',
        'XY/SU is the difference of those two s-values.',
      ],
      watch: [
        'Giving one of the s-values instead of the difference between them.',
        'Measuring from the wrong corner: SL is measured from L, MT from M and NU from N.',
      ],
      tip: 'Parametrize SU from 0 to 1; the ratio you want is the difference of the two parameter values.',
    },
    'Circles inside a circle': {
      idea: "When a small circle touches a big one from the inside, the big centre O, the small centre and the point of contact all lie on one line, with the small centre R − r from O and the contact point R from O. So each contact point is its small centre pushed straight out from O by the factor R/(R − r). The two small centres are 2r apart (the small circles touch each other), so triangle OAB is triangle OPQ enlarged by R/(R − r), and AB = 2r·R/(R − r). For example, R = 3 and r = 1 give AB = 2·3/2 = 3.",
      how: [
        'Join the big centre O to each small centre P and Q; the contact points A and B lie on those lines.',
        'OP = OQ = R − r and OA = OB = R.',
        'The small circles touch, so PQ = 2r.',
        'Triangle OAB is OPQ scaled by R/(R − r), so AB = 2r·R/(R − r).',
      ],
      watch: [
        'Answering 2r: the contact points are farther apart than the small centres.',
        'Scaling by the wrong factor, such as R/(R + r) or (R − r)/R.',
      ],
      tip: "Draw lines from the big circle's centre through each small centre to the contact points, and use similar triangles.",
    },
    'Cookies from a sheet of dough': {
      idea: "In this flower pattern the outer cookies touch the middle one, so their centres are 2r from the centre, and they reach r further to the edge of the dough: the dough's radius is 3r (or, the other way round, each cookie's radius is a third of the dough's). The scraps are the dough's area minus seven cookies, π(3r)² − 7πr² = 2πr². Rolled out just as thick, the scrap cookie has that same area, so its radius is √(2r²) = r√2.",
      how: [
        "Relate the radii: the dough's radius is 3 times a cookie's.",
        'Leftover area = π(3r)² − 7πr² = 2πr².',
        'The scrap cookie has area 2πr², so its radius is √(2r²) = r√2.',
      ],
      watch: [
        "Taking the dough's radius as 2r: the outer cookies stick out a further r past their centres.",
        'Forgetting the square root at the end, or comparing radii instead of areas.',
      ],
      tip: "Find the dough's radius in terms of a cookie's, then compare areas: dough minus seven cookies.",
    },
    'Points near a segment': {
      idea: 'All the points within r of a segment make a capsule: around the middle of the segment they fill a cylinder of radius r, and around each end they fill half a ball of radius r. The two half balls make one whole ball, so the volume is πr²·L + (4/3)πr³. Knowing the volume, take away the ball and divide by πr² to get the length.',
      how: [
        'Picture the solid: a cylinder of radius r along the segment, with a half ball on each end.',
        'Volume = πr²·L + (4/3)πr³.',
        'Subtract the ball from the given volume, then divide by πr² to find L.',
      ],
      watch: [
        'Leaving out the rounded ends, or counting two whole balls instead of two halves.',
        'Mixing up the powers: the cylinder uses r², the ball uses r³.',
      ],
      tip: 'Split the solid into a cylinder plus the two half-ball caps at its ends.',
    },
    'Pyramid in a box': {
      idea: 'The rectangle BCHE cuts through the box from edge BC to edge EH. Edge FG is parallel to that rectangle, so every point of FG is the same distance from it: the apex can slide along FG without changing the height, and the answer doesn\'t depend on where M is. Put the apex at F. In the face ABFE, the height from F to the diagonal BE is AB·BF/BE, while the base BCHE has sides BC and BE, so BE cancels and the volume is ⅓·AB·BC·CG: a third of the box.',
      how: [
        'Notice that FG is parallel to the base BCHE, so moving M along FG keeps the same height; put M at F.',
        'The base has sides BC and BE = √(AB² + CG²).',
        'The height is the distance from F to BE in the face ABFE: AB·CG/BE.',
        'Volume = ⅓·base·height; the BE cancels, leaving AB·BC·CG/3.',
      ],
      watch: [
        'Using ½ or ⅙ instead of ⅓ for a pyramid.',
        'Thinking the position of M matters: anywhere on FG gives the same height.',
      ],
      tip: 'Slide the apex along its edge to a corner where the height is easier to see; the edge is parallel to the base.',
    },
    'Octahedron in a box': {
      idea: "The segments joining opposite face centres have lengths a, b and c, the box's dimensions, and they cross at right angles at the centre of the box. Two of them are the diagonals of a rhombus with area ½·a·b, and that rhombus cuts the octahedron into two pyramids, each of height c/2. So the volume is 2·⅓·(ab/2)·(c/2) = abc/6: one sixth of the box, whatever its shape.",
      how: [
        'Join opposite face centres: three perpendicular segments of lengths a, b and c through the centre of the box.',
        'Two of them are the diagonals of a rhombus of area ab/2.',
        'The rhombus splits the octahedron into two pyramids of height c/2.',
        'Volume = 2 × ⅓ × (ab/2) × (c/2) = abc/6.',
      ],
      watch: [
        'Using a full a-by-b rectangle as the base instead of the rhombus inside it: that doubles the answer.',
        'Using the wrong pyramid fraction: a pyramid is ⅓ of base × height.',
      ],
      tip: 'Split the octahedron into two pyramids sharing a rhombus whose diagonals are two of the box\'s dimensions.',
    },
  },
};
