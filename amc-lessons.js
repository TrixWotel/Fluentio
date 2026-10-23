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
      idea: 'A percent change is a multiplication: up p% is × (1 + p/100), down p% is × (1 − p/100), and two changes in a row multiply. Every percent is a percent of something: of the price before the change. So to undo a discount, divide by the multiplier (don’t add the percent back), and to find a percent increase, divide the change by the old value. For example, up 25% makes 100 into 125, and getting back needs a drop of 25 out of 125: 20%, not 25%.',
      how: [
        'Turn each change into a multiplier: up 20% is × 1.2, down 20% is × 0.8.',
        'Two changes: multiply the multipliers and compare with 1.',
        'The price before a change: divide the new price by the multiplier.',
        'The percent change from A to B: (B − A)/A × 100%.',
      ],
      watch: [
        'Adding or subtracting percents that are taken of different amounts.',
        'Undoing a p% discount by adding p% back to the new, smaller price.',
        'Dividing the change by the new value instead of the old one.',
      ],
      tip: 'Ask what the percent is a percent of, then write the change as a multiplier.',
    },
    'Percent of what is left': {
      idea: 'A percent of "what is left" is a percent of a smaller amount, so it multiplies instead of subtracting: spending 30% and then 20% of the rest keeps 0.7 × 0.8 = 0.56, or 56%, not 50%. Working backward, divide by that same factor. When two prices each depend on what the other leaves, write one equation per price and solve them together; calling the allowance A = 100 makes every price a percent of A straight away.',
      how: [
        'For one purchase after another, turn each into the part it keeps (1 − p) and multiply the parts.',
        'To find the starting amount, divide what is left by that product.',
        'When each price is a percent of "A minus the other price", write t = (P/100)(A − s) and s = (Q/100)(A − t).',
        'Substitute one equation into the other, solve, add the two prices, and round only at the end.',
      ],
      watch: [
        'Subtracting the percents (100 − P − Q) when the second percent is of what was left.',
        'Taking each percent of the whole amount instead of the part that remains.',
        'Rounding the prices before adding them, which can tip the total to the wrong whole percent.',
      ],
      tip: 'Each percent here is of what is left, not of the whole: turn the steps into multipliers, or write one equation per price.',
    },
    'Saying and meaning': {
      idea: 'Picture a real crowd and sort it into four boxes: likes it and says so, likes it but says not, dislikes it and says so, dislikes it but claims to like it. Every question is about some of those boxes. "What fraction of those who say no really like it" looks only at the two "say no" boxes; "what percent say yes" adds the two "say yes" boxes. Working backward, call the true percent L and write the "say yes" total in terms of L. For example, with 1,000 people, 60% liking, 20% of likers saying no and 90% of non-likers saying no: 120 + 360 = 480 say no, and 120/480 = 1/4 of them like it.',
      how: [
        'Pick a convenient crowd size, like 10,000 (or 100 for percents), so every box is a whole number.',
        'Split the likers into "say yes" and "say no", and the non-likers the same way.',
        'For "what part of those who answer X", divide the right box by everyone who answered X.',
        'If the true share is unknown, call it L, write the total of one answer in terms of L, and solve.',
      ],
      watch: [
        'Dividing by the whole crowd instead of only the people who gave that answer.',
        'Forgetting the people who claim the opposite of the truth when counting an answer.',
        'Flipping the fraction: giving the part that truly dislikes it.',
      ],
      tip: 'Sort everyone into four boxes (likes or not, says yes or no), then use only the boxes the question asks about.',
    },
    'Averages': {
      idea: 'An average hides a total: total = average × how many. So compare totals, not averages. When a score is added or removed, the change in the total is that score. When two groups merge, add their totals and divide by everyone (an average of averages only works if the groups are the same size). For evenly spaced numbers such as consecutive integers, the average is the middle of the list. For example, 4 scores averaging 70 total 280; if a fifth makes the average 72, the total is 360, so the fifth score is 80.',
      how: [
        'Turn each average into a total: average × count.',
        'One score added or taken away: it is the difference of the two totals.',
        'Two groups: (total of the first + total of the second) ÷ (everyone).',
        'Consecutive numbers: the average is the middle, so the largest is the average plus half the spread.',
      ],
      watch: [
        'Averaging two group averages when the groups are different sizes.',
        'Multiplying the new average by the wrong count (the count changed by one).',
        'For consecutive even or odd numbers, forgetting they are 2 apart.',
      ],
      tip: 'Turn every average into a total (average × how many) and work with the totals.',
    },
    'Working together': {
      idea: 'Work with rates, not times: something that takes 4 hours does 1/4 of the job per hour. Rates of things working together add; something working against you (a drain) has its rate subtracted; and the time is the work left divided by the combined rate. To find one worker’s time from the time together, subtract rates: 1/(alone) = 1/(together) − 1/(the other). For example, pumps taking 3 and 6 hours fill 1/3 + 1/6 = 1/2 tank per hour, so together they take 2 hours.',
      how: [
        'Write each rate as a fraction of the job per hour (or minute): 1/time.',
        'Add the rates of things working together; subtract a rate that works against them.',
        'Time = (work to do) ÷ (combined rate); if someone has already done part of the job, the work to do is what is left.',
        'Working backward: subtract the known rate from the combined rate and flip.',
      ],
      watch: [
        'Averaging or adding the times instead of the rates.',
        'Forgetting to subtract the part of the job already done before the others join.',
        'Adding the drain’s rate instead of subtracting it.',
      ],
      tip: 'Turn every time into a rate (fraction of the job per hour), combine the rates, then divide the work left by the combined rate.',
    },
    'Arithmetic sequences': {
      idea: 'In an arithmetic sequence every step adds the same common difference d, so everything comes down to counting steps. The n-th term is the first plus n − 1 steps: a₁ + (n − 1)d. Turned around, a value v is term (v − a₁)/d + 1, and a list from a to b has (b − a)/d + 1 numbers. The sum of n terms is n times the average of the first and last, because the terms pair up from the two ends. For example, 2, 5, 8, …, 29 has 27/3 + 1 = 10 numbers, and they add up to 10·(2 + 29)/2 = 155.',
      how: [
        'Find d: the change in value divided by the number of steps (j − i) between two known terms.',
        'A far term: start from a known term and add (number of steps)·d.',
        'Which term, or how many numbers in a list: count the steps, (value − first)/d, and add 1.',
        'A sum: find the last term, then multiply the number of terms by the average of the first and last.',
      ],
      watch: [
        'Off by one: the n-th term is a₁ + (n − 1)d, and a list with k steps has k + 1 numbers.',
        'In a sum, forgetting to halve: n·(first + last) counts every term twice.',
        'Losing the minus sign when the sequence goes down.',
      ],
      tip: 'Count steps of the common difference, then remember that k steps join k + 1 terms.',
    },
    'Triangular numbers': {
      idea: 'Rows of 1, 2, 3, …, N objects hold 1 + 2 + ⋯ + N = N(N + 1)/2 in all. (Pair the first row with the last, the second with the second-to-last, and so on: every pair holds N + 1.) Going backward, twice the total is N(N + 1), two whole numbers in a row, so N is just below the square root of twice the total. Rows a through b hold the first b rows minus the first a − 1 rows. For example, 55 objects: 2 × 55 = 110 = 10 × 11, so 10 rows; and rows 4 through 6 hold 21 − 6 = 15.',
      how: [
        'Total from rows: N(N + 1)/2.',
        'Rows from a total: double it, take the square root, and check that N × (N + 1) gives exactly twice the total.',
        'A band of rows a to b: (1 + ⋯ + b) − (1 + ⋯ + (a − 1)).',
        'Left over: find the most complete rows that fit, then subtract what they use.',
      ],
      watch: [
        'Being off by one row: check by multiplying N by N + 1.',
        'For rows a to b, subtracting the first a rows instead of the first a − 1.',
        'Using N² or N(N + 1) without halving.',
      ],
      tip: 'Use 1 + 2 + ⋯ + N = N(N + 1)/2, and for a band of rows subtract the rows above it.',
    },
    'Geometric series': {
      idea: 'An infinite geometric series a + ar + ar² + ⋯ with r between −1 and 1 adds up to S = a/(1 − r). That one formula answers a lot: knowing a and S gives r; the odd-position terms are their own series with ratio r², adding to a/(1 − r²); and a bouncing ball travels the first drop plus twice every bounce height. Fixing one term ties a to r, so the least possible sum comes from making the bottom of a formula in r as large as possible: r(1 − r) is at most 1/4 (at r = 1/2), and r²(1 − r) is at most 4/27 (at r = 2/3).',
      how: [
        'Write what you know with a and r, and use S = a/(1 − r).',
        'For odd and even positions, note the even ones are the odd ones times r, so S = S<sub>odd</sub>(1 + r).',
        'For a bouncing ball, add the falls H/(1 − r) and the rises (the same minus the first drop).',
        'For the least sum with a fixed term, make the expression in r as large as possible for r between 0 and 1 (AM–GM).',
      ],
      watch: [
        'Counting a bounce only once: the ball goes up and comes back down.',
        'Assuming r = 1/2 is always best: with the third term fixed, the best r is 2/3.',
        'Mixing up a (the first term) with the second term ar.',
      ],
      tip: 'Start from S = a/(1 − r) and write everything you are given in terms of a and r.',
    },
    'Fibonacci remainders': {
      idea: 'Each term depends only on the two before it, and there are only so many possible pairs of remainders, so the sequence must start repeating, and it returns to 0, 1. Once you know the cycle, everything is about where a term falls in it: a far term is the term at its position mod the cycle length; a long sum is full cycles plus a part of one; and a block exactly one cycle long always adds up to one cycle. The 0s come at regular spacing (every multiple of the first place a 0 appears after the start). For example, mod 3 the remainders run 0, 1, 1, 2, 0, 2, 2, 1, then repeat: a cycle of 8 that adds up to 9, with 0s every 4 terms.',
      how: [
        'Write out the remainders until the pair 0, 1 appears again; the terms before it are one cycle.',
        'Note the cycle\'s length P and its sum.',
        'For one far term, divide its index by P and use the remainder.',
        'For a long sum, count the full cycles and add the leftover terms; for 0s, count the multiples of their spacing.',
      ],
      watch: [
        'Stopping at the first 0: the cycle only ends when 0 is followed by 1.',
        'Being off by one: G<sub>0</sub> to G<sub>N</sub> is N + 1 terms.',
      ],
      tip: 'Write out the remainders until 0, 1 comes back, then use where each term falls in that cycle.',
    },
    'Recursive functions': {
      idea: 'Many rules settle into a pattern you can see by writing a few terms. g(n) = g(n − 1) − g(n − 2) repeats every 6 terms: from a, b it goes b − a, −a, −b, a − b, then a, b again. b(n + 1) = 1/(1 − b(n)) comes back after 3 steps. A rule that adds something each step, f(n) = f(n − 1) + (an + b), just adds up those steps. And if a rule has an extra + cn, first find a simple sequence that obeys it, like c(n + 1), and subtract it: what is left obeys the plain rule.',
      how: [
        'Write out the first several terms and look for a repeat or a running total.',
        'For a repeating rule, find the cycle length and use the remainder of N.',
        'For f(n) = f(n − 1) + (an + b), add the steps for n = 2 to N to f(1).',
        'With an extra + cn term, subtract c(n + 1) first; the rest repeats every 6.',
      ],
      watch: [
        'Matching remainders to the cycle off by one: a remainder of 0 means the last term of the cycle.',
        'Adding the steps from n = 1 instead of n = 2.',
        'Answering just c(N + 1) and forgetting the repeating part.',
      ],
      tip: 'Write out several terms: they either repeat in a short cycle or add up step by step.',
    },
    'Reciprocal sequences': {
      idea: 'Some messy-looking rules become simple when you flip every term over. a<sub>n+1</sub> = a<sub>n</sub>/(1 + k·a<sub>n</sub>) flips to 1/a<sub>n+1</sub> = 1/a<sub>n</sub> + k, so the reciprocals go up by k each time; with k·n instead of k, they go up by k, 2k, 3k, …, so they add a triangular number. And a<sub>n</sub> = a<sub>n−2</sub>a<sub>n−1</sub>/(2a<sub>n−2</sub> − a<sub>n−1</sub>) flips to 1/a<sub>n</sub> = 2/a<sub>n−1</sub> − 1/a<sub>n−2</sub>, which says the reciprocals form an arithmetic sequence. Then 1/a<sub>N</sub> = 1/a<sub>1</sub> + (N − 1)d.',
      how: [
        'Flip both sides of the rule and simplify the fraction.',
        'Read off how the reciprocal changes from one term to the next.',
        'If it changes by the same step d, use 1/a<sub>N</sub> = 1/a<sub>1</sub> + (N − 1)d (or the step from two known terms).',
        'If the step grows with n, add up the steps; then flip back and reduce before adding p + q.',
      ],
      watch: [
        'Taking N steps from the first term instead of N − 1.',
        'Adding p + q before reducing the fraction to lowest terms.',
      ],
      tip: 'Flip every term over and look at how the reciprocals change from one term to the next.',
    },
    'Perpendicular lines': {
      idea: 'For a line written px + qy = r, the slope is −p/q. Two lines are perpendicular when their slopes multiply to −1, which for lines in this form is the same as pp′ + qq′ = 0. So a perpendicular line through a point has the negative reciprocal slope, and the point of a line closest to a given point is where the perpendicular from that point meets the line. With unknown coefficients, the perpendicular condition plus "the point is on both lines" gives the equations you need.',
      how: [
        'Find each line\'s slope (−p/q for px + qy = r), or use pp′ + qq′ = 0 directly.',
        'For a perpendicular through a point, use the negative reciprocal slope in y − y<sub>1</sub> = m(x − x<sub>1</sub>).',
        'For the closest point, intersect the line with the perpendicular through the given point.',
        'For unknown coefficients, solve the perpendicular condition together with the point on each line.',
      ],
      watch: [
        'Using the same slope (that makes the lines parallel) or the opposite slope instead of the negative reciprocal.',
        'Sign slips when the point has negative coordinates.',
        'Taking the point straight below or beside the given point instead of along the perpendicular.',
      ],
      tip: 'Perpendicular slopes multiply to −1: for px + qy = r and p′x + q′y = r′, that is pp′ + qq′ = 0.',
    },
    'Parabolas and triangles': {
      idea: 'A level chord of y = kx² is symmetric about the y-axis, so its ends are (−t, kt²) and (t, kt²). With the third corner at the origin, the triangle has base 2t and height kt², so its area is ½ · 2t · kt² = kt³. Extra conditions fix t: a right angle at the origin means the two slanted sides are perpendicular, (−t)(t) + (kt²)(kt²) = 0, so t = 1/k; an equilateral triangle needs the height kt² to equal √3 · t, so t = √3/k. For example, on y = 4x² an area of 32 gives 4t³ = 32, t = 2, and a level side of 4.',
      how: [
        'Name the ends of the level side (−t, kt²) and (t, kt²).',
        'The base is 2t and the height, from the origin up to that side, is kt²; the area is kt³.',
        'Turn the condition you are given (an area, a side, a right angle, equal sides) into an equation in t.',
        'Solve for t, then answer what is asked: the side 2t or the area kt³.',
      ],
      watch: [
        'Answering t instead of 2t.',
        'Using t as the height instead of kt².',
        'Forgetting the ½ in the area.',
      ],
      tip: 'Put the ends of the level side at (−t, kt²) and (t, kt²), turn the condition into an equation in t, and solve.',
    },
    'Symmetric sums': {
      idea: 'You rarely need x and y themselves (they may not even be real). Everything follows from expanding: (x + y)² = x² + y² + 2xy, (x − y)² = x² + y² − 2xy, and (x + y)³ = x³ + y³ + 3xy(x + y). So any one of x + y, xy and x² + y² follows from the other two, and x³ + y³ = (x + y)³ − 3xy(x + y). The same trick works for x + 1/x, since x·(1/x) = 1: (x + 1/x)² = x² + 2 + 1/x². For example, if x + y = 5 and x² + y² = 13, then 25 = 13 + 2xy, so xy = 6.',
      how: [
        'Write down the identity that links what you know to what you want.',
        'From x + y and x² + y²: xy = ((x + y)² − (x² + y²))/2.',
        'From x − y and xy: x² + y² = (x − y)² + 2xy, and (x + y)² = (x − y)² + 4xy.',
        'For x + 1/x = s: x² + 1/x² = s² − 2 and x³ + 1/x³ = s³ − 3s.',
      ],
      watch: [
        'Forgetting the 2 in 2xy, or adding it instead of subtracting.',
        'For cubes, subtracting 3xy instead of 3xy(x + y).',
        'For x + 1/x, forgetting the cross term: x·(1/x) = 1, so squaring adds 2.',
      ],
      tip: 'Square (or cube) the sum or difference you know and solve for the piece you want; you never need x and y themselves.',
    },
    'Least value of a product': {
      idea: 'A product is easiest to minimize as a single square. Two factors (x − a)(x − b) make a parabola lowest halfway between a and b. Four factors pair up so both pairs share the same x² + (something)x part: call one product u, the other is u + D, and u(u + D) = (u + D/2)² − D²/4, so the least value is the constant minus D²/4 (when u can reach −D/2). A sum of squares (x − a)² + (x − b)² + (x − c)² is lowest at the average of a, b and c. For example, x(x + 1)(x + 2)(x + 3) = u(u + 2) with u = x² + 3x, which is (u + 1)² − 1, so it is never below −1.',
      how: [
        'Two factors: go halfway between the roots and multiply the two factors there.',
        'Four factors: pair them so each pair has the same x-term (the outer pair and the inner pair), call one u.',
        'Complete the square in u; a square is never negative.',
        'A sum of squares: put x at the average of the numbers and add up the squares.',
      ],
      watch: [
        'Answering the added constant itself and forgetting what the square takes away.',
        'Pairing factors whose x-terms don\'t match.',
        'For a sum of squares, putting x at the middle number instead of the average.',
      ],
      tip: 'Turn the expression into a square plus a constant: pair the factors so they share the same x-term, or go to the middle.',
    },
    'Ratios of big powers': {
      idea: 'When one base is bigger, its powers swamp the other\'s, so a ratio of sums is close to the bigger base raised to the gap in exponents. Pulling that power out of the top shows exactly how far off it is: with plus signs the ratio is a little below the power, with minus signs a little above. With a single base, take the smallest power out of the top and the bottom and it cancels. To compare big powers, rewrite them with the same exponent and compare the bases. For example, (3¹⁰ + 2¹⁰)/(3⁸ + 2⁸) ≈ 9 − 0.19, so its floor is 8, and 2³⁰⁰ = 8¹⁰⁰ is less than 3²⁰⁰ = 9¹⁰⁰.',
      how: [
        'Find the gap between the exponents and the bigger base to that power.',
        'Rewrite the top as that power times the bottom, plus or minus a leftover, and check the leftover part is less than 1.',
        'With one base, factor out its smallest power from the top and the bottom.',
        'To compare powers, write each with the largest common exponent and compare what is being raised.',
      ],
      watch: [
        'Forgetting that the minus-sign version lands just above the whole number, not just below.',
        'Splitting the fraction term by term, as if (A + B)/(C + D) were A/C + B/D.',
        'Comparing only the exponents or only the bases of big powers.',
      ],
      tip: 'Factor the biggest common power out (or give the powers the same exponent), and see what is left.',
    },
    'Age multiples': {
      idea: 'If a parent is G years older than the child, then when the child is z the parent is z + G, and z + G is a multiple of z exactly when z divides G. So "how many birthdays when the parent\'s age is a multiple" means "how many divisors G has", and "the next time" means "the next divisor of the gap". When a set multiple is asked for, like "twice as old", the gap stays the same while both ages grow, so write the two ages in y years and solve. For example, with a gap of 12 it happens when the child is 1, 2, 3, 4, 6 and 12: six birthdays.',
      how: [
        'Turn each parent\'s age into an age gap with the child (the child is 1 today, so the gap is the parent\'s age minus 1).',
        'Count divisors of the gap for "how many times", or use the count to find which gap in the range fits.',
        'For the next time, find the smallest divisor of the gap above 1: the parent is then the gap plus that age.',
        'For "m times as old in y years", solve P + y = m(C + y).',
      ],
      watch: [
        'Using the parent\'s age instead of the age gap.',
        'Answering the child\'s age, or the gap, instead of the parent\'s age.',
        'Forgetting that today counts, since 1 divides every gap.',
      ],
      tip: 'The gap between two ages never changes: a parent\'s age is a multiple of the child\'s exactly when the child\'s age divides that gap.',
    },
    // ---------- number theory ----------
    'Changing a digit': {
      idea: 'Count digit by digit, place by place. A digit in the units place is worth 1 and in the tens place 10, so changing x into y lowers a number by (x − y) times the place value. From 1 to N, a digit appears in the units place once in every 10 numbers and in the tens place 10 times in a row each hundred, which also counts how often it is written. Digit sums add the same way: each full run 0 to 9 in the units place adds 45. And page numbers use 9 digits for pages 1 to 9 and 180 for pages 10 to 99, then 3 a page. Example: writing 1 to 20 uses the digit 1 twelve times.',
      how: [
        'Split the count by place: the units place and the tens place (and the hundreds if N goes that high).',
        'Units place: one appearance in every full run of 10, plus any at the end; tens place: 10 in a row for each matching block.',
        'For a changed digit, multiply each count by its place value and by the difference of the digits.',
        'For a digit sum, add the units digits run by run (45 per full run) and the tens digits block by block.',
        'For page numbers, take off 9 digits for pages 1 to 9 and 180 for 10 to 99, then divide what is left by 3.',
      ],
      watch: [
        'Treating every appearance as worth the same: a tens digit is worth 10 times a units digit.',
        'Counting only one place, or missing numbers like 22 where the digit appears twice.',
        'Forgetting to add back the 99 pages before the three-digit ones.',
      ],
      tip: 'Count the units place and the tens place separately, then combine them.',
    },
    'Units digits': {
      idea: 'The units digit of a sum or product depends only on the units digits of the numbers, so a huge base can be swapped for its last digit. The last digits of the powers of any digit repeat in a cycle of length 1, 2 or 4 (powers of 7 end in 7, 9, 3, 1, 7, …), so the exponent’s remainder when divided by the cycle length picks the digit. The same idea works for the last two digits: 7<sup>4</sup> ends in 01, so powers of 7 repeat their last two digits every 4 steps. Example: 3<sup>10</sup> ends like 3<sup>2</sup>, in 9, because 10 = 4 · 2 + 2.',
      how: [
        'Keep only the last digit of each base (the last two digits if the question asks for two).',
        'Write the cycle of last digits of its powers until it repeats.',
        'Divide the exponent by the cycle length: remainder r means the r-th entry, remainder 0 the last one.',
        'Add or multiply the digits you found and keep only the last digit.',
        'To count how often a<sup>1</sup>, a<sup>2</sup>, …, a<sup>N</sup> end in a digit, count the exponents with the right remainder.',
      ],
      watch: [
        'Giving the units digit of just one of the two powers instead of the sum or product.',
        'Landing one place off in the cycle: remainder 1 is the base itself, remainder 0 is the end of the cycle.',
        'Adding the last digits of the bases without raising them to their powers.',
      ],
      tip: 'Replace each base by its last digit, find the repeating cycle of its powers, and use the exponent’s remainder to pick the spot.',
    },
    'Remainders of powers': {
      idea: 'Only remainders matter along the way: the remainder of b<sup>k+1</sup> is the remainder of (remainder of b<sup>k</sup>) × b. So the remainders of b, b², b³, … must repeat, and when b shares no factor with m they come back to 1 and start over. The first k with remainder 1 is the cycle length L. Then b<sup>k</sup> leaves the same remainder as b<sup>r</sup>, where r is k mod L; b<sup>k</sup> − 1 is a multiple of m exactly when L divides k; and remainders of a sum add up. Example, mod 7: powers of 3 leave 3, 2, 6, 4, 5, 1, so L = 6 and 3<sup>20</sup> leaves the same as 3² = 9: 2.',
      how: [
        'List the remainders of b, b², b³, … mod m, multiplying the last remainder by b each time.',
        'Stop at the first 1: that position is the cycle length L (the smallest k with b<sup>k</sup> leaving 1).',
        'For b<sup>k</sup>: divide k by L and use the remainder r (the last in the list if r is 0).',
        'For "how many k make b<sup>k</sup> − 1 a multiple of m": count the multiples of L.',
        'For a sum of powers: find each remainder, add them, and reduce mod m.',
      ],
      watch: [
        'Reducing the exponent with m (or m − 1) instead of the actual cycle length L.',
        'Being one place off when you count along the cycle.',
        'Leaving a sum of remainders unreduced: it must end up between 0 and m − 1.',
      ],
      tip: 'List the remainders of b, b², b³, … until one comes back to 1; that cycle length tells you everything else.',
    },
    'Sums of powers mod m': {
      idea: 'Consecutive powers share a factor: b<sup>k</sup> + b<sup>k+1</sup> + b<sup>k+2</sup> = b<sup>k</sup> · (1 + b + b<sup>2</sup>), and remainders multiply. A base one less than the divisor acts like −1 (its powers leave 1 or m − 1), and one more acts like 1. For a long sum 1 + b + ⋯ + b<sup>n</sup>, the remainders of the powers repeat in a cycle, and often a full cycle adds up to a multiple of m, so only the leftover terms count. Example: mod 5, powers of 2 leave 1, 2, 4, 3, which add to 10; so 1 + 2 + ⋯ + 2<sup>5</sup> leaves the same remainder as its last two terms, 1 + 2 = 3.',
      how: [
        'For consecutive powers, factor out the smallest one and work out the small sum in the bracket.',
        'For a base of m − 1 or m + 1, replace it by −1 or 1 before raising it to the power.',
        'Otherwise list the remainders of b, b<sup>2</sup>, … until they repeat, and use the exponent’s remainder to find b<sup>k</sup>.',
        'For a long sum, count the full cycles it holds and, when a full cycle adds to a multiple of m, add up only the leftover remainders.',
        'Multiply (or add) the remainders and take the remainder once more.',
      ],
      watch: [
        'Stopping at the remainder of the bracket alone, or of b<sup>k</sup> alone.',
        'Adding the two remainders instead of multiplying them.',
        'Miscounting the terms of 1 + b + ⋯ + b<sup>n</sup>: there are n + 1 of them.',
      ],
      tip: 'Work only with remainders: factor out the smallest power, or swap a base like m − 1 for −1.',
    },
    'Primes in a digit pattern': {
      idea: 'A pattern in the digits usually means a pattern in the factors, so you can count primes without testing big numbers. k ones, a 0 and k more ones is (k ones) × (10<sup>k+1</sup> + 1). A two-digit prime written over and over is that prime times 101, 10101, …. And 10<sup>k</sup> + 1 has the factor 10<sup>k/m</sup> + 1 whenever k has an odd factor m > 1, because x<sup>m</sup> + 1 is divisible by x + 1 when m is odd. For multiples of 11, use 10 = 11 − 1: an even power of 10 is 1 more than a multiple of 11, an odd power 1 less.',
      how: [
        'Write the first few numbers of the list as products, and look for one factorization that fits them all.',
        'Use the patterns: (block of ones) × (10<sup>k+1</sup> + 1), a repeated prime p × 1010…1, and x<sup>m</sup> + 1 = (x + 1)(…) for odd m.',
        'For multiples of 11, swap each power of 10 for −1 (odd power) or +1 (even power) and add up.',
        'Check the leftover small cases by hand, and answer what was asked: primes or composites.',
      ],
      watch: [
        'Counting the first number of the list as composite: it may be the one prime.',
        'Answering with the number of primes when the question asks for composites, or the other way round.',
        'Thinking 10<sup>k</sup> + 1 can only be composite when k is odd: any odd factor of k bigger than 1 gives a factor (10<sup>6</sup> + 1 = 101 · 9901), and even 10<sup>4</sup> + 1 = 73 · 137.',
      ],
      tip: 'Look for one factorization that fits every number in the list before testing anything for being prime.',
    },
    'LCM and GCD': {
      idea: 'Think in prime powers: the lcm takes the larger power of each prime and the gcd the smaller, so gcd × lcm is the product of the two numbers, which gives a missing number straight away. For pairs with gcd g and lcm L, write them as gx and gy: x and y share no factor and xy = L/g, so each prime power of L/g goes whole to x or to y, 2 choices per prime. A number that leaves remainder 1 when divided by several numbers is 1 more than a common multiple of them. Example: lcm(n, 6) = 60 with gcd(n, 45) = 5 forces n = 20.',
      how: [
        'Factor everything into primes and compare the powers prime by prime.',
        'To pin down n, let the lcm fix the powers n must have and the gcd fix the rest.',
        'For the other number of a pair, divide gcd × lcm by the one you know.',
        'To count pairs, factor L/g: each prime goes whole to one number, so there are 2<sup>(number of primes)</sup> ordered pairs.',
        'For the same remainder from several divisors, take their lcm and add the remainder.',
      ],
      watch: [
        'Stopping after the lcm condition, which usually allows several values of n.',
        'Counting the primes of L instead of L/g, or counting unordered pairs when ordered ones are asked for.',
        'Multiplying the divisors together instead of taking their lcm.',
      ],
      tip: 'Factor into primes: the lcm takes the larger power of each prime, the gcd the smaller, and gcd × lcm is the product.',
    },
    'Product and least sum': {
      idea: 'With negatives allowed, the sum can get much smaller. The product is positive, so there are no negatives or exactly two, and with −x, −y and z the sum is z − x − y: you want z just above x + y. With only positive numbers it goes the other way: for a fixed product the sum is smallest when the three numbers are as close together as possible, near the cube root of the product. When both the product and the sum are given, list the ways to split the product into three factors and add each up. Example: positive numbers with product 30 can be 1 · 5 · 6 (sum 12) or 2 · 3 · 5 (sum 10), the closest.',
      how: [
        'Read the question: may the integers be negative, or are they positive?',
        'If negatives are allowed, make two of them negative, −x and −y, so the sum is z − x − y, and look for z just above x + y.',
        'If all are positive, try splittings with the three numbers near the cube root of the product.',
        'If the sum is given too, go through the splittings until one adds up to it, then answer what is asked.',
      ],
      watch: [
        'Only trying positive integers when negatives are allowed, which gives a much larger sum.',
        'Assuming a sum of 1 is possible without finding integers that give it.',
        'Answering with the smallest of the three numbers when the question asks for the largest.',
      ],
      tip: 'Decide first whether negatives are allowed: with two negatives the sum is the positive one minus the other two; with none, keep the three numbers close together.',
    },
    'Counting divisors': {
      idea: 'A divisor of N is built by choosing how many copies of each prime of N to use, from 0 up to its exponent, so N = p<sup>a</sup>q<sup>b</sup>… has (a + 1)(b + 1)… divisors. Conditions just limit the choices: an odd divisor uses no 2s at all; a multiple of M must use at least as many of each prime as M does; a perfect square uses even powers only. Turned around, to make a number with D divisors, write D as a product of (exponent + 1)s and put the biggest exponents on the smallest primes. For 72 = 2³·3²: 4·3 = 12 divisors, 3 of them odd, and 2·2 = 4 of them multiples of 6.',
      how: [
        'Factor N into primes with exponents.',
        'For each prime, count the powers a divisor may use: 0 to the exponent, or fewer if the question restricts it.',
        'Multiply those counts.',
        'For the smallest number with D divisors: try every way of writing D as a product, turn each factor into an exponent (factor − 1), put big exponents on 2, 3, 5, …, and compare.',
      ],
      watch: [
        'Multiplying the exponents themselves, without adding 1 to each.',
        'For even divisors, forgetting that the power of 2 must be at least 1 (a choices, not a + 1).',
        'For the smallest number with D divisors, trying only one way of factoring D.',
      ],
      tip: 'Factor N into primes and count, prime by prime, which powers a divisor is allowed to use.',
    },
    'Odd and even divisor sums': {
      idea: 'Write N = 2<sup>a</sup> × m with m odd. The odd divisors of N are exactly the divisors of m; call their sum s. Every even divisor is an odd divisor times 2, 4, …, or 2<sup>a</sup>, so the even divisors add up to (2 + 4 + ⋯ + 2<sup>a</sup>) · s = (2<sup>a+1</sup> − 2) · s, and the two totals are in the ratio 1 : (2<sup>a+1</sup> − 2). Counting works the same way: a divisor’s power of 2 is one of a + 1 choices, and all but one are even, so a/(a + 1) of the divisors are even. Example: 12 = 2<sup>2</sup> · 3 has odd divisors 1, 3 (sum 4) and even ones 2, 4, 6, 12 (sum 24 = 6 · 4).',
      how: [
        'Split N into 2<sup>a</sup> times an odd number m (add up the powers of 2 if N is given as a product).',
        'The odd divisors are the divisors of m, so their sum s is the sum of the divisors of m.',
        'The even divisors add up to (2 + 4 + ⋯ + 2<sup>a</sup>) · s = (2<sup>a+1</sup> − 2) · s.',
        'For the share of divisors that are even, count the choices for the power of 2: a of the a + 1 are even.',
      ],
      watch: [
        'Using 1 + 2 + ⋯ + 2<sup>a</sup>, which also counts the odd divisors, instead of 2 + ⋯ + 2<sup>a</sup>.',
        'Giving the sum of all the divisors when only the odd (or only the even) ones are asked for.',
        'Miscounting the power of 2 when N is given as a product of several numbers.',
      ],
      tip: 'Split N into a power of 2 times an odd number; every even divisor is an odd divisor times a power of 2.',
    },
    'Square and cube divisors': {
      idea: 'A divisor of p<sup>a</sup>q<sup>b</sup>⋯ is p<sup>i</sup>q<sup>j</sup>⋯ with each exponent from 0 up to its limit. It is a perfect square when every exponent is even, a cube when every one is a multiple of 3, and both when every one is a multiple of 6. So count the allowed exponents for each prime and multiply; then combine with inclusion and exclusion: squares or cubes = squares + cubes − both, and cubes that aren’t squares = cubes − both. Example: 6<sup>4</sup> has 3 · 3 = 9 square divisors and 2 · 2 = 4 cube divisors, 1 of them both: 12.',
      how: [
        'Factor the number into prime powers.',
        'For each prime, count the allowed exponents: even ones for squares, multiples of 3 for cubes, multiples of 6 for both.',
        'Multiply those counts across the primes.',
        'Combine: squares + cubes − both, or cubes − both for cubes that aren’t squares.',
      ],
      watch: [
        'Forgetting to subtract the divisors that are both squares and cubes.',
        'Forgetting that 0 is an allowed exponent, so 1 counts as a square and a cube.',
        'Using the same count for every prime when their exponents are different.',
      ],
      tip: 'Count the allowed exponents for each prime separately, then take away the divisors counted twice.',
    },
    'Powers of a fraction': {
      idea: 'For n ≥ 0, A · (p/q)<sup>n</sup> = A · p<sup>n</sup>/q<sup>n</sup>, which is whole exactly when q<sup>n</sup> divides A; for negative n the fraction flips and p<sup>|n|</sup> must divide A. So if A has p to the power x and q to the power y, n runs from −x up to y: x + y + 1 values. Turned around, the smallest A that works for a range of n needs q to the largest positive n and p to the largest |n|. And each step up in n multiplies by p/q, so the value is biggest at one end of the range. Example: 12 · (2/3)<sup>n</sup> is whole for n = −2, −1, 0 and 1.',
      how: [
        'Factor A and find its powers of p and q.',
        'Positive n needs q<sup>n</sup> to divide A; negative n needs p<sup>|n|</sup> to divide A.',
        'Count every allowed n, including 0.',
        'For the smallest A, multiply q to the largest positive n by p to the largest negative |n|.',
        'For the largest value, go to the end of the range where the fraction keeps multiplying it up.',
      ],
      watch: [
        'Forgetting the negative values of n, where the fraction turns upside down.',
        'Forgetting n = 0, or multiplying the two counts instead of adding them.',
        'Taking the largest value at n = 0 instead of at the end of the range.',
      ],
      tip: 'Positive n puts powers of the denominator under A, and negative n puts powers of the numerator there.',
    },
    'Squares from factorials': {
      idea: 'A number is a perfect square when every prime has an even power, so find the prime powers and fix the odd ones. In n! the power of p is ⌊n/p⌋ + ⌊n/p<sup>2</sup>⌋ + ⋯. For a product of factorials, pair each odd one with the next: (2j − 1)! · (2j)! = ((2j − 1)!)<sup>2</sup> · 2j, so the product is a square times 2 · 4 ⋯ n = 2<sup>n/2</sup> · (n/2)!. That leftover tells you what m must supply, or which single factorial to remove. Example: 6! = 2<sup>4</sup> · 3<sup>2</sup> · 5, so 5 · 6! is a perfect square.',
      how: [
        'For one factorial, find the power of each prime with ⌊n/p⌋ + ⌊n/p<sup>2</sup>⌋ + ⋯.',
        'For a product of factorials, pair (2j − 1)! with (2j)!: each pair is a square times 2j.',
        'Multiply the leftovers, 2 · 4 · 6 ⋯ n = 2<sup>n/2</sup> · (n/2)!, and find its prime powers.',
        'm is the product of the primes with an odd power; a removed factor must be exactly the part that isn’t a square.',
        'For the power of 2 in the whole product, add up the power of 2 in each factorial.',
      ],
      watch: [
        'Working with the whole product instead of the small leftover, where the numbers get huge.',
        'Forgetting the extra 2<sup>n/2</sup> that comes from 2 · 4 · 6 ⋯ n.',
        'Counting only the multiples of p, and not the extra copies in multiples of p<sup>2</sup>.',
      ],
      tip: 'Make every prime’s power even: count the primes in each factorial, or pair the factorials (2j − 1)! · (2j)! first.',
    },
    'Sums dividing factorials': {
      idea: 'T = 1 + 2 + ⋯ + n = n(n + 1)/2, so n!/T = 2 · (n − 1)!/(n + 1). When n + 1 is composite (and n ≥ 3), it splits into factors that can all be found among 2, 3, …, n − 1 (for 9 = 3 · 3, use 3 and 6), so the division works. When n + 1 is an odd prime, nothing in 2 · (n − 1)! can cancel it. So every question here is about primes: the greatest n is one less than the largest prime in reach, the number of n that fail is the number of odd primes up to N + 1, and the one that fails is the n with n + 1 prime. Example: n = 4 gives T = 10, which does not divide 24.',
      how: [
        'Write T = n(n + 1)/2 and simplify n!/T to 2 · (n − 1)!/(n + 1).',
        'It fails to be whole exactly when n + 1 is an odd prime.',
        'For the greatest n, find the largest prime p with p − 1 in range; the answer is p − 1.',
        'To count the n that fail, count the odd primes from 3 up to N + 1.',
        'To spot the one that fails, add 1 to each choice and look for the prime.',
      ],
      watch: [
        'Answering with the prime itself instead of one less than it.',
        'Looking for a prime n instead of a prime n + 1.',
        'Counting 2 as one of the primes: n = 1 works, since T = 1.',
      ],
      tip: 'Simplify n! divided by n(n + 1)/2, and ask when n + 1 can fail to divide what is left.',
    },
    'Repeating decimals': {
      idea: 'A block of digits repeating forever sits over 9s: 0.ababab… = ab/99, while cut off after two digits it is ab/100. So using w.ab instead of w.ababab… loses M · ab/9900 when multiplied by M. When a digit comes first and then a block repeats, shift twice and subtract: for x = 0.a(bc)(bc)…, 1000x − 10x = abc − a, so x = (abc − a)/990. A fraction’s decimal repeats a fixed block, so its n-th digit after the point comes from n’s remainder when divided by the block’s length. Example: 1/7 = 0.142857…, so its 9th digit is the 3rd of the block, 2.',
      how: [
        'For a repeating block, call the number x, multiply by 10 to the block’s length and subtract x, so the repeating part cancels.',
        'If a digit comes before the block, multiply by 10 as well and subtract those two shifted numbers instead.',
        'Reduce the fraction to lowest terms before adding its numerator and denominator.',
        'For a far digit, find the repeating block, divide the position by its length and use the remainder (0 means the last digit of the block).',
      ],
      watch: [
        'Swapping the two digits: the answer is ab, not ba.',
        'Putting the repeating part over 90 or 100 instead of 99, or forgetting to reduce.',
        'Being one place off in the block when counting to a far digit.',
      ],
      tip: 'Multiply by a power of 10 that lines the repeating part up with itself, then subtract so it cancels.',
    },
    'Diagonal through tiles': {
      idea: 'Follow the line. On an m × n floor it crosses m − 1 grid lines one way and n − 1 the other, entering a new tile each time, except at the gcd(m, n) − 1 grid points where it crosses two lines at once: m + n − gcd(m, n) tiles. The same gcd counts lattice points: a segment going a across and b up splits into gcd(a, b) equal steps, so it has gcd(a, b) + 1 lattice points counting both ends. In three dimensions, inclusion and exclusion gives a + b + c − gcd(a, b) − gcd(b, c) − gcd(a, c) + gcd(a, b, c) cubes. Example: a 4 × 6 floor gives 4 + 6 − 2 = 8 tiles.',
      how: [
        'Find the gcd of the side lengths (or of the steps across and up).',
        'Tiles crossed: m + n − gcd(m, n).',
        'Lattice points on a segment: the gcd of the two steps, plus 1 for the starting point.',
        'Cubes in a box: add the three sides, subtract the three pairwise gcds, and add back the gcd of all three.',
      ],
      watch: [
        'Using m + n or m + n − 1, which ignores the grid points on the diagonal.',
        'Forgetting to count one of the two ends of the segment.',
        'In three dimensions, forgetting to add back the gcd of all three.',
      ],
      tip: 'Count the grid lines crossed, and remember that at a grid point two crossings happen at once.',
    },
    'Difference of squares': {
      idea: 'Everything here comes from x<sup>2</sup> − y<sup>2</sup> = (x − y)(x + y). The two factors differ by 2y, so they are both odd or both even. That is why the differences of two squares are exactly the odd numbers and the multiples of 4, never 2, 6, 10, …. The same factoring finds whole-number solutions from factor pairs of the right parity, finds two numbers from their difference and the difference of their squares, and turns a big subtraction of squares into one easy product. Example: 53<sup>2</sup> − 47<sup>2</sup> = 6 · 100 = 600.',
      how: [
        'Rewrite the difference of squares as (x − y)(x + y).',
        'For whole-number solutions, list the factor pairs of the number with both factors odd or both even.',
        'Each such pair u · v gives x = (u + v)/2 and y = (v − u)/2; a square root is never negative, but the other number can be.',
        'To count which numbers work, leave out the ones that are 2 more than a multiple of 4.',
        'To compute a<sup>2</sup> − b<sup>2</sup>, multiply (a − b) by (a + b).',
      ],
      watch: [
        'Keeping factor pairs of different parity, which give fractions.',
        'Forgetting the negative values, or allowing a negative square root.',
        'Thinking every even number is a difference of squares: 2, 6, 10, … are not.',
      ],
      tip: 'Factor x² − y² as (x − y)(x + y), and remember the two factors are both odd or both even.',
    },
    'Factoring an equation': {
      idea: 'Simon’s favorite factoring trick: mn − am − bn = 0 doesn’t factor as it stands, but adding ab to both sides gives (m − b)(n − a) = ab. Each divisor of ab, positive or negative, then gives exactly one ordered pair. The equation 1/m + 1/n = 1/k becomes (m − k)(n − k) = k<sup>2</sup>; there the pair making m = 0 is not allowed, and for positive m and n both factors must be positive. Since m + n = (m − k) + (n − k) + 2k, the largest sum puts the two factors as far apart as they go: 1 and k<sup>2</sup>.',
      how: [
        'Rearrange to mn − am − bn = 0; for 1/m + 1/n = 1/k, multiply through by kmn first.',
        'Add the product of the two coefficients to both sides so the left side factors.',
        'Count the divisors of the right side: positive and negative ones for integer solutions, only positive ones when m and n must be positive.',
        'Throw out any pair the problem forbids, such as m = 0 when m is in a denominator.',
        'For the largest m + n, use the factor pair 1 and the whole right side.',
      ],
      watch: [
        'Counting only the positive divisors when negative ones are allowed, or the negative ones when they can’t happen.',
        'For 1/m + 1/n = 1/k, keeping the pair that makes m = 0.',
        'Counting unordered pairs when the question asks for ordered ones.',
      ],
      tip: 'Add a constant to both sides so the left side factors as (m − something)(n − something).',
    },
    'Laps and common multiples': {
      idea: 'Something that repeats every k minutes is back at the start exactly at the multiples of k. So all of them meet again at the lcm of their times, and two things that repeat every a and b seconds line up every lcm(a, b) seconds, ⌊T/lcm⌋ times in T seconds. When only some of them need to meet, try small times in order and count how many lap times divide each: numbers with many small divisors, like 12, 24 or 60, win. Example: lap times of 4 and 6 minutes meet every 12 minutes, 5 times in the first hour.',
      how: [
        'Each runner, kart or light is back at the multiples of its period.',
        'For all of them together, take the lcm: the highest power of each prime in any of the periods.',
        'To count meetings in a time T, divide T by the lcm and round down.',
        'For "at least j of them", try T = 1, 2, 3, … and count how many periods divide each T.',
      ],
      watch: [
        'Multiplying the periods together instead of taking their lcm.',
        'Taking the lcm of the j smallest lap times, which is often bigger than needed.',
        'Counting the start (time 0) as a meeting when the question says not to.',
      ],
      tip: 'A runner is back at the start at the multiples of their lap time; look for common multiples, starting with the smallest.',
    },
    'Digit sums': {
      idea: 'Adding 1 raises the digit sum by 1, unless n ends in t nines: each becomes 0 and the digit before them goes up, so S(n + 1) = S(n) + 1 − 9t. For the smallest number with digit sum s, use as few digits as possible, all 9s except the first, which takes what is left. Two digits can add up to t in t + 1 ways when t ≤ 9 and 19 − t ways when 10 ≤ t ≤ 18, which counts three-digit numbers with a given digit sum. And 10<sup>k</sup> − c is a string of 9s followed by the last few digits. Example: 10<sup>5</sup> − 7 = 99,993.',
      how: [
        'For S(n + 1), compare remainders on division by 9: it leaves the same remainder as S(n) + 1 and is at most S(n) + 1.',
        'For the smallest number with a digit sum, put as many 9s as possible at the end and the leftover first.',
        'For three-digit numbers with a digit sum, fix the first digit and count how two digits can make the rest.',
        'For 10<sup>k</sup> − c, split it into a string of 9s and the last few digits, and add them up.',
      ],
      watch: [
        'Picking S(n) + 10: it has the right remainder, but a digit sum can’t go up by more than 1.',
        'Putting the 9s first, which makes the number bigger, not smaller.',
        'Letting the first digit of a three-digit number be 0.',
      ],
      tip: 'Think about what carrying does to the digit sum, and use 9s wherever a digit can be as big as possible.',
    },
    'Divisibility in other bases': {
      idea: 'A base-b numeral is a polynomial in b: 1234<sub>b</sub> = b<sup>3</sup> + 2b<sup>2</sup> + 3b + 4. Its remainder on division by q depends only on b’s remainder, so test each remainder once and count the bases that have a good one. A numeral equation like 12<sub>b</sub> × 3<sub>b</sub> = 40<sub>b</sub> becomes an ordinary equation in b: 3(b + 2) = 4b, so b = 6. Some numerals are squares in every base: 121<sub>b</sub> = (b + 1)<sup>2</sup>. And since b leaves remainder 1 when divided by b − 1, a numeral leaves the same remainder as its digit sum. A base-b numeral uses only digits less than b.',
      how: [
        'Write the numeral as a polynomial in b.',
        'For divisibility by q, try each remainder 0 to q − 1 for b, then count the bases in range with a good remainder.',
        'For an equation between numerals, turn each into its polynomial and solve for b (or test the choices).',
        'For the remainder on division by b − 1, add up the digits.',
        'Check that every digit is less than b.',
      ],
      watch: [
        'Treating q as a base-b number: it is an ordinary base-ten number.',
        'Being one run off when counting how many times the remainders repeat in the range.',
        'Allowing bases too small for the numeral’s digits.',
      ],
      tip: 'Write the numeral as a polynomial in b; then work with b’s remainder, or solve the equation for b.',
    },
    'Bases without letters': {
      idea: 'In a base B above 10, the digits ten, eleven, … are written as letters. A number avoids letters when every one of its base-B digits is 0 to 9, so count digit strings place by place, the way you would count numbers below N in base ten with some digits banned. "At least one letter" is easiest as all the numerals minus the letter-free ones. A numeral with letters converts like any other: each letter’s value times its place value. And the last base-B digit is the remainder on division by B, so it is a letter exactly when that remainder is 10 or more. Example: 1B in base 12 is 12 + 11 = 23.',
      how: [
        'Write N in base B by dividing by B<sup>2</sup>, then by B.',
        'To count letter-free numbers up to N, go place by place: a smaller digit leaves 10 choices for each later place.',
        'For "at least one letter", count all the numerals and subtract the letter-free ones.',
        'To read a numeral, replace each letter by its value (A = 10, B = 11, …) and multiply by the place values.',
        'For the last digit, use the remainder on division by B.',
      ],
      watch: [
        'Forgetting to remove 0, which isn’t in the list 1, 2, 3, ….',
        'Allowing 10 choices for a digit bounded by a smaller digit of N, or 0 as a leading digit.',
        'Getting a letter’s place value wrong when converting to base ten.',
      ],
      tip: 'Write N in the new base, then count place by place the numbers whose digits are all 0 to 9.',
    },
    'Repeating digits in base k': {
      idea: 'In base k, shifting one place multiplies by k. So 0.ddd…<sub>k</sub> = d/(k − 1), and 0.ababab…<sub>k</sub> = (ak + b)/(k<sup>2</sup> − 1), where ab<sub>k</sub> means a · k + b. To find k, test the choices against the given fraction (k must be bigger than both digits). A fraction 1/n ends instead of repeating in base b exactly when some power of b is a multiple of n, that is, when every prime factor of n divides b. Example: 0.121212…<sub>3</sub> = (1 · 3 + 2)/(9 − 1) = 5/8.',
      how: [
        'Let x be the number and multiply by k (one repeating digit) or by k<sup>2</sup> (two).',
        'Subtract x so the repeating part cancels: x = d/(k − 1), or (ak + b)/(k<sup>2</sup> − 1).',
        'Reduce to lowest terms, or compare values when testing choices for k.',
        'For a fraction that ends, list n’s prime factors: b must be a multiple of every one of them.',
      ],
      watch: [
        'Reading ab<sub>k</sub> as the base-ten number ab instead of a · k + b.',
        'Using k − 1 or k<sup>2</sup> as the denominator for two repeating digits instead of k<sup>2</sup> − 1.',
        'Thinking b must be a multiple of n itself, rather than of n’s prime factors.',
      ],
      tip: 'Multiply by k or k² to shift the repeating block over, then subtract so it cancels.',
    },
    // ---------- counting ----------
    'Digit rules': {
      idea: 'Fill the number place by place and multiply the choices, deciding the most restricted place first: the last digit or two when a divisibility rule applies, and always remembering that the first digit can\'t be 0. “At least one” is easier as everything minus “none”, and a palindrome is fixed by its first half, since the rest mirrors it. For example, 3-digit numbers with at least one 5: 900 − 8·9·9 = 900 − 648 = 252.',
      how: [
        'Divisibility: a multiple of 5 ends in 0 or 5; for a multiple of 4, the last two digits make a multiple of 4. Decide the ending first.',
        'All digits different: 9 choices for the first digit (not 0), then 9, 8, 7, … for the places after it.',
        'At least one copy of a digit d (1 to 9): all k-digit numbers, 9·10<sup>k − 1</sup>, minus those with no d, 8·9<sup>k − 1</sup> (the first digit is neither 0 nor d).',
        'Palindromes with k digits: choose the first ⌈k/2⌉ digits (the first not 0); the rest are their mirror image.',
      ],
      watch: [
        'The first digit can never be 0: with only even digits it has 4 choices (2, 4, 6, 8), not 5.',
        'Counting “at least one 7” by adding cases counts numbers with two 7s more than once; use the complement.',
        'A palindrome\'s last digit equals its first, so it can\'t be 0 either.',
      ],
      tip: 'Decide the most restricted digit first, multiply the choices, and count “at least one” as everything minus none.',
    },
    'Handshakes': {
      idea: 'A handshake is a pair of people, so counting handshakes means counting pairs. When everyone shakes hands with everyone, n people make C(n, 2) = n(n − 1)/2 handshakes: each shakes n − 1 hands, and every handshake has two people in it. When only some pairs shake, split the pairs into kinds and count each: two separate groups shaking across make a·b handshakes, with no halving. With 3 friends and 2 strangers, where only pairs that include a stranger shake: 3·2 + C(2, 2) = 7. Worked backward, h handshakes among everyone means n(n − 1) = 2h, two whole numbers in a row: 45 handshakes give n(n − 1) = 90 = 10·9, so 10 people.',
      how: [
        'Decide which pairs of people shake hands.',
        'Everyone with everyone: C(n, 2) = n(n − 1)/2.',
        'Two groups shaking across: (size of one)·(size of the other).',
        'A mix: split the pairs into kinds (stranger–friend and stranger–stranger, or team–team and referee–player) and add the counts.',
        'Given the number of handshakes: double it and find two whole numbers in a row with that product.',
      ],
      watch: [
        'n(n − 1) without halving counts each handshake twice.',
        'Handshakes between two separate groups are a·b; don\'t halve those.',
        'Strangers also shake hands with one another: C(b, 2) more.',
        'Working backward, double the number of handshakes before looking for n(n − 1).',
      ],
      tip: 'A handshake is a pair of people: count the pairs, splitting them by kind when only some pairs shake.',
    },
    'Counting committees': {
      idea: 'C(n, k) counts the ways to pick k people from n when order doesn’t matter. Conditions are easiest by forcing people in or out: if a person must be on, put them in and choose the rest from everyone else; if they are out, choose from the others. When the condition is "at least one" or "not both", count everything and subtract the bad committees. Jobs inside a committee (a chair) multiply: pick the committee, then the chair. For example, from 6 people a committee of 3 with neither of two given people: C(4, 3) = 4.',
      how: [
        'Decide who is forced in or out, and choose the remaining seats from the remaining people: C(people left, seats left).',
        '"Exactly one of two": pick which one (2 ways), then the rest from the other n − 2.',
        '"At least one" or "not both together": all committees minus the bad ones.',
        'A chair or other job: multiply by the number of ways to give it out.',
      ],
      watch: [
        'Counting "at least one girl" as (one girl) × (anyone): it counts teams with two girls more than once.',
        'Only committees with both of the two feuding people are forbidden; one of them is fine.',
        'Forgetting the factor 2 when either of two people could be the one on the committee.',
      ],
      tip: 'Force the named people in or out first, then choose the remaining seats from the remaining people (or count all and subtract the bad ones).',
    },
    'Forming teams': {
      idea: 'Count as if the groups had names, then divide by the orders of groups that are really interchangeable: 6 people into 3 unnamed pairs is 6!/((2!)<sup>3</sup>·3!) = 15. With two kinds of members per team, split the first kind into unnamed groups, then deal the second kind to those groups, which are now different from one another, with no more dividing. “At least one girl” is all committees minus the all-boy ones, and a team with a captain is the team times its choice of captain. For 2 coaches and 4 players making 2 teams of 1 coach and 2 players: the coaches split 1 way, then the players are dealt 4!/(2!·2!) = 6 ways, so 6.',
      how: [
        'Equal groups with no names: n!/((s!)<sup>g</sup>·g!) for g groups of s.',
        'Two kinds per team: split the first kind into g unnamed groups, J!/((a!)<sup>g</sup>·g!), then deal the second kind out, S!/(b!)<sup>g</sup>, and multiply.',
        'At least one girl: C(everyone, k) − C(boys, k).',
        'A team with a captain: C(n, k)·k, which is also n·C(n − 1, k − 1).',
      ],
      watch: [
        'Divide by g! exactly once: forgetting it counts named teams, and dividing again when dealing the second kind undercounts.',
        'C(girls, 1)·C(rest, k − 1) for “at least one girl” counts committees with several girls more than once.',
        'Adding the two stages instead of multiplying.',
      ],
      tip: 'Name the groups to count, then divide by the orders of groups that have no names; count “at least one” as all minus none.',
    },
    'Multiples in blocks': {
      idea: 'Up to N there are ⌊N/k⌋ multiples of k, and everything else follows from that. From A to B there are ⌊B/k⌋ − ⌊(A − 1)/k⌋. Numbers leaving remainder r are r, r + k, r + 2k, …, so from 1 to N there are ⌊(N − r)/k⌋ + 1. For blocks of consecutive numbers, compare the block size B with k: when k &lt; B &lt; 2k every block holds one or two multiples, so the multiples beyond one per block are the blocks with two; when B &lt; k every block holds at most one, so the blocks with none are the blocks minus the multiples. For 1 to 30 in 3 piles of 10, there are 4 multiples of 7, so exactly 4 − 3 = 1 pile has two.',
      how: [
        'Multiples of k from A to B: ⌊B/k⌋ − ⌊(A − 1)/k⌋.',
        'Remainder r (with 1 ≤ r &lt; k) from 1 to N: ⌊(N − r)/k⌋ + 1.',
        'Blocks of size B with k &lt; B &lt; 2k: piles with two = ⌊N/k⌋ − (number of piles); piles with exactly one = the rest.',
        'Blocks of size B &lt; k: blocks with none = (number of blocks) − ⌊N/k⌋.',
      ],
      watch: [
        'From A to B, subtract the multiples up to A − 1, not up to A, or A itself gets lost.',
        'Remainder r: the first one is r itself (q = 0), so add 1 to the largest q.',
        'Read the question: piles with two multiples, exactly one, or none.',
      ],
      tip: 'Count multiples with ⌊N/k⌋, and compare the block size with k to see how many each block can hold.',
    },
    'Inclusion and exclusion': {
      idea: 'When you add two groups, everyone in both is counted twice, so subtract them once: |A or B| = |A| + |B| − |A and B|. With three groups, add the three, subtract the three overlaps of two, and add back the overlap of all three. In word problems, "neither" is the total minus "at least one"; for divisibility, the numbers divisible by both a and b are the multiples of lcm(a, b). For example, in a class of 30 where 12 swim, 15 run and 8 do neither, 22 do at least one, so 12 + 15 − 22 = 5 do both.',
      how: [
        'Count each group: for multiples of a up to N, ⌊N/a⌋.',
        'Count the overlap: the multiples of lcm(a, b), or "both" from a word problem.',
        'At least one = sum of groups − overlaps (+ the triple overlap, with three groups).',
        '"Neither" = total − at least one; "a but not b" = (multiples of a) − (multiples of both).',
      ],
      watch: [
        'Using a·b for the overlap when a and b share a factor: for 4 and 6 it is the multiples of 12.',
        'With three groups, forgetting to add back the numbers in all three.',
        'In a Venn problem, forgetting the people in neither group.',
      ],
      tip: 'Add the groups, subtract what was counted twice (the overlap), and remember the ones in neither.',
    },
    'Separated neighbors': {
      idea: 'To keep two people together, glue them into one block: n people with one glued pair line up in 2·(n − 1)! ways, since the block can face either way. To keep them apart, count all n! orders and subtract the together ones. With several pairs, use inclusion–exclusion: subtract the orders with each pair together, then add back the orders with two pairs together, which were subtracted twice. Pairs that share a letter, like the alphabet neighbors AB and BC, glue into one block ABC that can only read forward or backward. For A, B, C, D with no alphabet neighbors side by side: 24 − 36 + 16 − 2 = 2 orders (BDAC and CADB).',
      how: [
        'Together: 2·(n − 1)!. Apart: n! − 2·(n − 1)!.',
        'Two pairs both apart: n! − 2·2·(n − 1)! + 2·2·(n − 2)!.',
        'One pair together and another apart: glue the first pair, 2·(n − 1)!, then subtract the orders where the second pair is glued too, 2·2·(n − 2)!.',
        'Many pairs: for each set of k glued pairs there are (n − k)! orders times 2 for every run of glued letters; add for even k, subtract for odd k.',
      ],
      watch: [
        'Forgetting the 2 ways a glued pair can face.',
        'Overlapping pairs like AB and BC make one block with 2 orientations, not two blocks with 2·2.',
        'Subtracting each pair but not adding back the orders where both pairs are together.',
      ],
      tip: 'Glue pairs that must touch into blocks; for pairs that must not touch, subtract the glued orders, with inclusion–exclusion when there are several.',
    },
    'Making postage': {
      idea: 'Once you decide how many stamps of one kind to use, the other kind is forced, if it works at all, and the good choices form an arithmetic sequence you can count. For two stamp values a and b with no common factor, the amounts that can\'t be made run out: the largest is ab − a − b, and exactly (a − 1)(b − 1)/2 amounts can\'t be made. With 3- and 5-cent stamps, 1, 2, 4 and 7 can\'t be made: 4 amounts, the largest 7. For the fewest stamps, use as many of the larger stamp as you can.',
      how: [
        'Ways to make N: let y be the number of b-cent stamps; the y that leave a multiple of a form y, y + a, y + 2a, … up to b·y ≤ N. Count them: (last − first)/a + 1.',
        'Largest amount that can\'t be made: ab − a − b (a and b sharing no factor).',
        'How many amounts can\'t be made: (a − 1)(b − 1)/2.',
        'Fewest stamps: start with ⌊N/b⌋ stamps of b cents and count down until the rest is a multiple of a.',
      ],
      watch: [
        'Off by one when counting the list: include both the first and the last value.',
        'The largest unmakeable amount is ab − a − b, not ab − 1 or ab.',
        'These formulas need a and b to share no factor.',
      ],
      tip: 'Fix the number of stamps of one kind and let the other follow; for what can\'t be made, remember ab − a − b and (a − 1)(b − 1)/2.',
    },
    'Rising and falling digits': {
      idea: 'A number with strictly increasing digits is decided by which digits it uses: pick the set, and there is exactly one way to write it in increasing order. The same goes for decreasing digits, except that 0 can end a decreasing number but never appear in an increasing one. When repeats are allowed (digits that never decrease), the number is decided by how many of each digit it uses, which is stars and bars. Two-digit examples: C(9, 2) = 36 rising, C(10, 2) = 45 falling, and C(2 + 8, 8) = 45 never decreasing.',
      how: [
        'Strictly rising, j digits: C(9, j). Strictly falling: C(10, j). Their difference, C(9, j − 1), counts the falling numbers ending in 0.',
        'Rising and starting with a, k digits: choose the other k − 1 from the 9 − a digits above a: C(9 − a, k − 1).',
        'Rising and ending in d: any nonempty set of the digits below d in front: 2<sup>d − 1</sup> − 1.',
        'Never decreasing, k digits: C(k + 8, 8) (no 0). Never increasing: C(k + 9, 9) − 1 (0 allowed, but not all zeros).',
      ],
      watch: [
        'Letting a rising number use 0: it would have to be the first digit.',
        'Repeats allowed is stars and bars, not C(9, k).',
        'A climber needs at least two digits, so the empty set of smaller digits doesn\'t count.',
      ],
      tip: 'Think of each number as the set (or, with repeats, the multiset) of its digits, and ask whether 0 can be one of them.',
    },
    'Races with ties': {
      idea: 'Handle one tie by gluing: if exactly k racers tie, choose which k, then treat them as one racer sharing a place, leaving n − k + 1 to put in order. With ties allowed anywhere, sort the results by the number of different places j: split the racers into j tied groups (S(n, j) ways, the Stirling numbers) and order the groups (j!); 3 horses give 1 + 6 + 6 = 13. Without ties, symmetry helps: A beats B in exactly half of the n! orders. Medals are an ordered choice: n(n − 1)(n − 2).',
      how: [
        'At most one tie: n! + the sum of C(n, k)·(n − k + 1)! for k = 2 to n; exactly one tie: leave out the n!.',
        'Ties anywhere: add j!·S(n, j) for j = 1 to n, where S(n, 1) = S(n, n) = 1, S(n, 2) = 2<sup>n − 1</sup> − 1 and S(n, n − 1) = C(n, 2).',
        'A ahead of B, no ties: n!/2.',
        'Gold, silver and bronze: n(n − 1)(n − 2).',
      ],
      watch: [
        'Include n! only when a race with no tie counts.',
        'Using (n − k)! forgets that the tied group still takes a place.',
        'The medals are different, so order matters: C(n, 3) is 3! too small.',
      ],
      tip: 'Group the tied racers, count the ways to form the groups, then order the groups.',
    },
    'Coloring a map': {
      idea: 'Paint the regions one at a time, each touching regions already painted, and multiply the choices: a region has k minus the number of different colors its painted neighbors use. A row of n stripes gives k·(k − 1)<sup>n − 1</sup>. A ring is harder because the last region touches the first: a ring of n regions with k colors has (k − 1)<sup>n</sup> + (−1)<sup>n</sup>(k − 1) paintings; for 4 regions and 3 colors, 16 + 2 = 18. A region that touches all the others, like the middle of a wheel, goes first, and the ring then has only k − 1 colors.',
      how: [
        'Stripes in a row: k for the first, k − 1 for each later one.',
        'Two rows of regions: after the first column, each new region touches two painted regions that touch each other: k − 2 choices.',
        'Ring of n (pie wedges): (k − 1)<sup>n</sup> + (−1)<sup>n</sup>(k − 1).',
        'Wheel: k choices for the middle, times the ring painted with k − 1 colors.',
      ],
      watch: [
        'In a ring, the last region touches the first: k·(k − 1)<sup>n − 1</sup> is too many.',
        'Giving a region k − 1 choices when it touches two painted regions of different colors.',
        'In a wheel, the ring can\'t use the middle\'s color.',
      ],
      tip: 'Paint in an order where each region touches painted ones, and for a ring, correct for the last region touching the first.',
    },
    'Knights, knaves and jokers': {
      idea: 'Work out what each kind of person would say, then let the statements check each other. Two knights can never make different claims about the same fact, so if everyone names a different exact number of knaves, at most one person is a knight. When person i says “at least i of us are knaves”, with K knaves the true statements are exactly those of persons 1 to K, so there are K knights and K knaves. On the quiz show, tabulate the three answers of a Knight, a Knave and the two kinds of Joker, and compare the yes counts.',
      how: [
        'Quiz show: Knight yes, no, no; Knave yes, yes, no; truth-first Joker no, no, no; lie-first Joker yes, yes, yes. Write each yes count as a sum of types and subtract.',
        '“At least i are knaves”: persons 1 to K tell the truth, so K knights and K knaves: K = n/2.',
        '“Exactly i are knaves”: at most one knight; if there were none, person n would be telling the truth, so there is exactly one knight, the one who says n − 1.',
        'Answer what is asked: a number of people, a number of tokens, or which person.',
      ],
      watch: [
        'A Knave asked “Are you a Knave?” says no, because the true answer is yes.',
        'Tokens are not people: count each type\'s yes answers.',
        'With “exactly i”, rule out the case where everyone is a knave.',
      ],
      tip: 'Ask which statements can be true at the same time, and let the number of knaves decide who is telling the truth.',
    },
    'Number snakes in a grid': {
      idea: 'Color the 3 × 3 grid like a checkerboard. Squares that share a side have different colors, so walking 1, 2, 3, …, 9 the colors alternate. The color with 5 squares (the four corners and the center) must hold the five numbers in the odd positions of the walk, 1, 3, 5, 7 and 9, which add up to 25, and the even numbers go on the four edge squares. So the center and the corners always add up to 25, and an even number can only be on an edge square.',
      how: [
        'Color the grid like a checkerboard: the corners and the center one color, the four edge squares the other.',
        'Consecutive numbers share a side, so their colors alternate along 1, 2, …, 9.',
        'The corners and center hold 1, 3, 5, 7, 9 (sum 25); the edge squares hold 2, 4, 6, 8.',
        'Given the corners, the center is 25 minus their sum; given the center, the corners add up to 25 minus it.',
      ],
      watch: [
        'Trying arrangements by hand is slow and easy to get wrong; the coloring argument is quick and certain.',
        'The center is not always 5; it depends on the corners.',
        'An even number can never be in a corner or the center.',
      ],
      tip: 'Color the squares like a checkerboard and ask which numbers must land on the corners and the center.',
    },
    'Crossing lines': {
      idea: 'Two lines cross at most once, so n lines have at most C(n, 2) crossing points, reached when no two are parallel and no three meet at one point. Every special arrangement costs points: k parallel lines lose the C(k, 2) pairs that never meet, and m lines through one point merge C(m, 2) crossings into a single point. For 6 lines with exactly 3 parallel: 15 − 3 = 12 points. To find every possible number of points for a few lines, start from the extremes (all parallel: 0; all through one point: 1; general: C(n, 2)) and test the small values in between one at a time, since some are impossible.',
      how: [
        'Most points: C(n, 2), with no parallels and no three lines through one point.',
        'A family of k parallel lines: subtract C(k, 2).',
        'm lines through one common point: subtract C(m, 2) and add back 1 for the shared point.',
        'All possible values: list the extremes, build the middle values by mixing parallel families and shared points, and prove which small values can\'t happen.',
      ],
      watch: [
        'Lines through a common point still make one point there: add 1 back.',
        'Assuming every whole number from 0 up to C(n, 2) can happen.',
        'Mixing up “the sum of the values” with “how many values”.',
      ],
      tip: 'Start from C(n, 2) crossings and take away what each parallel family or shared point costs.',
    },
    'Lattice squares': {
      idea: 'Count squares one size at a time. In a grid n squares wide and m tall, a square of side s has n − s + 1 places across and m − s + 1 up, so add (n − s + 1)(m − s + 1) over every s: a 3 × 2 grid has 6 + 2 = 8 squares. Inside a slanted boundary, describe each square by its bottom-left corner and side, and check only the corner closest to the line: the top-left one under a rising line y = x√k, the top-right one under x + y = a. Lattice points under a line are counted the same way, column by column.',
      how: [
        'Grid rectangle n by m: add (n − s + 1)(m − s + 1) for s = 1 up to the shorter side.',
        'Triangle x, y ≥ 0, x + y ≤ a: a square of side s fits with its bottom-left corner at (x, y) when x + y ≤ a − 2s, and there are (t + 1)(t + 2)/2 lattice points with x, y ≥ 0 and x + y ≤ t.',
        'Under y = x√k: a square with bottom-left corner (a, b) and side s fits when b + s ≤ ⌊a√k⌋, giving ⌊a√k⌋ − s + 1 heights (or none).',
        'Lattice points (x, y) with 0 ≤ y &lt; x√k (k not a perfect square): ⌊x√k⌋ + 1 in each column x.',
      ],
      watch: [
        'Counting only the unit squares; bigger squares count too.',
        'Off by one: a side of length L has L − s + 1 places for a square of side s, not L − s.',
        'Checking the wrong corner against a slanted line.',
      ],
      tip: 'Count by square size, and for each size count where its corner nearest the boundary can go.',
    },
    'Sum-free sets': {
      idea: 'Group the numbers that clash and take as many from each group as the rule allows. For no two chosen numbers adding up to T, the clashing pairs are (1, T − 1), (2, T − 2), …; take one from each pair, plus every number that is in no pair. For no chosen number being the sum of two chosen ones, look at the largest chosen number m and pair x with m − x. For no number being twice another, the clashes form doubling chains like 3, 6, 12, and a chain of L numbers allows ⌈L/2⌉ (every other one). Counting pairs with a small sum is simpler still: sort them by their sum s, which comes from ⌊(s − 1)/2⌋ pairs of different numbers.',
      how: [
        'No two different numbers adding to T: one from each pair x, T − x, plus the numbers in no pair (including T/2 and everything from T up).',
        'No number the sum of two chosen ones: pair up below the largest chosen m; then show a set reaching the limit, such as the top half or all the odd numbers.',
        'No number twice another: split into chains o, 2o, 4o, … and take ⌈L/2⌉ from a chain of length L.',
        'Pairs of different numbers with sum at most N: add ⌊(s − 1)/2⌋ for s = 3 to N.',
      ],
      watch: [
        'Whether a number may be added to itself decides whether m/2 is allowed.',
        'Numbers that clash with nothing still count.',
        'Giving only an example, or only a limit: you need both.',
      ],
      tip: 'Group the numbers into clashing pairs or chains and take as many as each group allows.',
    },
    'Sets with no multiples': {
      idea: 'Write every number as an odd number times a power of 2. The numbers with the same odd part form a chain, like 3, 6, 12, and in a chain the smaller number always divides the larger. From 1 to N there are ⌈N/2⌉ odd numbers, so ⌈N/2⌉ chains: a set with no multiples has at most one number per chain, and any ⌈N/2⌉ + 1 numbers must put two in one chain (pigeonhole). The numbers above N/2 reach ⌈N/2⌉, since twice any of them is bigger than N. For 1 to 10: chains 1, 2, 4, 8; 3, 6; 5, 10; 7; 9, so at most 5 numbers, and 6, 7, 8, 9, 10 works.',
      how: [
        'Split 1 to N into chains: an odd number o, then 2o, 4o, 8o, …',
        'Largest set with no multiples: one per chain, ⌈N/2⌉, reached by the numbers above N/2.',
        'Fewest picks that force a multiple: one more than that, ⌈N/2⌉ + 1.',
        'Smallest number in a largest set: the set takes exactly one number from every chain, and along odd parts like 1, 3, 9 the powers of 2 in the picks must go strictly down; that rules out the small numbers. Then show a whole set that uses your answer.',
      ],
      watch: [
        'Pigeonhole needs one more pick than the largest safe set.',
        '1 divides everything, and other small numbers get blocked by the powers-of-2 argument, so the smallest member is bigger than it looks.',
        'Ruling out small numbers is only half the job: also show a complete set that uses your answer.',
      ],
      tip: 'Write each number as an odd number times a power of 2: the chains this makes give the largest set, and pigeonhole forces a multiple one pick later.',
    },
    'Round robin': {
      idea: 'Every game is a pair of players, so a round robin of n players has C(n, 2) games, and a home-and-away league has n(n − 1), one for every ordered pair. Every game has exactly one winner, so the wins add up to the number of games: if all n players win equally, each wins (n − 1)/2. The same fact drives the left- and right-handers puzzle: the share of the wins fixes what fraction of the games each side won, and the games among the right-handers, which they must win, limit the number of players.',
      how: [
        'Single round robin: C(n, 2) = n(n − 1)/2 games. Home and away: n(n − 1).',
        'Equal wins: C(n, 2) wins shared by n players, (n − 1)/2 each (so n is odd).',
        'Left- and right-handers: with L left-handers and r·L right-handers, write the games and the right-handers\' share of them in terms of L.',
        'The right-handers win at least the C(rL, 2) games among themselves; that caps L, and among the allowed L keep the one that makes every number of wins whole.',
      ],
      watch: [
        'n(n − 1) counts every single-round-robin game twice.',
        'Answer what is asked: total games, players, or one side\'s wins.',
        'Forgetting the games among the right-handers, which force them a minimum number of wins.',
      ],
      tip: 'A game is a pair of players with one winner: count pairs for games, and add up wins to get the number of games.',
    },
    'Pairing friends': {
      idea: 'To split 2m people into pairs, take any unpaired person and choose their partner, then repeat: (2m − 1)·(2m − 3)·…·1 ways, 105 for 8 people. When only some pairs are allowed, look at how one person at the end can pair: in two rows of students, the left column pairs front-to-back, or the two left students in each row pair sideways, so T(m) = T(m − 1) + T(m − 2), the Fibonacci numbers. To keep couples apart, use inclusion–exclusion over the couples kept together. Around a table with neighbors and opposite guests as friends, pairs across the table must leave arcs with an even number of guests.',
      how: [
        'Any pairs: (2m − 1)·(2m − 3)·…·3·1.',
        'Two rows, side by side or one behind the other: T(m) = T(m − 1) + T(m − 2), with T(1) = 1 and T(2) = 2.',
        'Couples kept apart: add (−1)<sup>j</sup>·C(m, j)·(pairings of the other 2m − 2j people) for j = 0 to m.',
        'Round table: 2 pairings use only neighbors; otherwise choose the across pairs so that every arc between them has an even number of guests.',
      ],
      watch: [
        'C(2m, 2)·C(2m − 2, 2)·… puts the pairs in order; divide by m!, or use the odd-number product.',
        'In two rows, if the front-left student pairs sideways, the back-left student must too.',
        'Forgetting the 2 round-table pairings that use only neighbors.',
      ],
      tip: 'Pair off the first unpaired person each time; with rules, look at how the end person can pair and build a recursion.',
    },
    'Seating with rules': {
      idea: 'Most seating rules come down to three tools. Glue people who must sit together into a block (it can face 2 ways). Count everything and subtract the seatings that break a rule, using inclusion–exclusion when two rules can both be broken. At a round table where turning doesn\'t matter, seat one person first to fix the table, so n people sit in (n − 1)! ways. For 5 people at a round table with two of them side by side: seat one, the other takes one of the 2 seats beside them, and the last 3 sit in 3! ways: 2·6 = 12.',
      how: [
        'Row, two people apart: n! − 2·(n − 1)!.',
        'Round table: seat one person to fix the table; the others fill the rest in (n − 1)! ways, and that person\'s neighbors are 2 particular seats.',
        'Boys and girls alternating: the row starts with either group if the numbers are equal (2 patterns) or with the bigger group (1 pattern); then order each group in its places.',
        'Twins kept apart in rows of seats: count the close pairs of seats, then all − (first twins close) − (second twins close) + (both close), using only close pairs that share no seat in the last count.',
      ],
      watch: [
        'At a round table, n! counts each seating n times, once for every turn.',
        'With equal numbers of boys and girls, don\'t forget the factor 2 for who starts.',
        'Forgetting that a glued pair can sit either way round.',
      ],
      tip: 'Glue, subtract, or fix one person at a round table: pick the tool that makes the rule easy.',
    },
    'Colorings up to symmetry': {
      idea: 'When paintings that turn or flip into each other count as the same, use Burnside\'s lemma: the number of different paintings is the average, over all the symmetries, of how many paintings each symmetry leaves exactly unchanged. A symmetry moves the positions around in cycles, and a painting stays the same only when every cycle is one color. With k colors free, a symmetry with c cycles keeps k<sup>c</sup> paintings. Four beads on a square with 2 colors, turns only: (16 + 2 + 4 + 2)/4 = 6.',
      how: [
        'List the symmetries: a triangle has 6 (doing nothing, 2 turns, 3 flips), a square 8 and a hexagon 12; use only the turns when flips don\'t count.',
        'For each symmetry, find the cycles it moves the positions in: on a square, a quarter turn is one cycle of 4 and a half turn two cycles of 2.',
        'Count the paintings it keeps: k<sup>(number of cycles)</sup> with k free colors, or the ways to fill whole cycles with the required number of each color.',
        'Add the counts over all the symmetries and divide by how many there are.',
      ],
      watch: [
        'Dividing the held-still count by the number of symmetries only works when no painting is kept by any symmetry except doing nothing.',
        'Forgetting the flips, or including them when only turns count.',
        'A hexagon flip through two opposite corners keeps those two corners in place; a flip through the middles of two opposite sides keeps none.',
      ],
      tip: 'For each symmetry, count the paintings it leaves exactly as they were (every cycle one color), then average.',
    },
    'Paths on a cube': {
      idea: 'Use the cube\'s symmetry and its two-coloring. Color the corners in two colors so that every edge joins different colors: a walk changes color at every step, so after an odd number of edges it can\'t be back at the start, and after 7 edges it is on a neighbor of the start or the far corner. For walks that may repeat, group the corners by distance from the start (1, 3, 3 and 1 corners at distances 0, 1, 2, 3) and track how many walks are at each distance after each step. Shortest routes in an a × b × c box are the orders of a + b + c steps: (a + b + c)!/(a!·b!·c!).',
      how: [
        'Walks through every corner once: fix the first two edges (3·2 = 6 equally good starts), list the finishes from there, and multiply.',
        'Walks of a given length: from distance 0 all 3 edges go to distance 1; from 1, 1 edge goes back and 2 go on; from 2, 2 go back and 1 goes on; from 3, all 3 go back. Update the counts step by step.',
        'Shortest routes in a box: (a + b + c)!/(a!·b!·c!).',
        'Segments joining corners: C(8, 2) = 28 = 12 edges + 12 face diagonals (2 on each of 6 faces) + 4 diagonals through the inside.',
      ],
      watch: [
        'A walk through every corner exactly once never comes back to a corner.',
        'With repeats allowed, an odd number of edges can never end at the start.',
        'An n × n × n box takes n steps in each direction, not 1.',
      ],
      tip: 'Use symmetry to fix the start, sort the corners by distance, and remember that a walk changes color at every step.',
    },
    // ---------- probability ----------
    'Probability with dice': {
      idea: 'Think of the dice as different colors, so two dice give 6 × 6 = 36 equally likely ordered outcomes and three give 216; a probability is (outcomes that work)/(all outcomes). Count sums, products and differences pair by pair, or count the outcomes that fail and subtract. For "the largest of three dice is exactly m", count "all three at most m" (m³) and take away "all three at most m − 1" ((m − 1)³). For example, two dice differ by exactly 2 in 4 ways each order: 8/36 = 2/9.',
      how: [
        'Treat the dice as different, so outcomes are ordered: 36 for two dice, 216 for three.',
        'Count the outcomes that work: list them, use 6 − |s − 7| ways for a sum of s, or count the ones that fail and subtract.',
        'For "largest (or smallest) is exactly m": all at most m minus all at most m − 1 (or the same from the top).',
        'Divide by the total number of outcomes and reduce.',
      ],
      watch: [
        'Counting unordered pairs: (1, 3) and (3, 1) are different outcomes.',
        'For a difference of j ≥ 1, forgetting the pairs in the other order.',
        'For three dice, using m³ alone: that counts "at most m", not "exactly m".',
      ],
      tip: 'Picture the dice as different colors and count the ordered outcomes that work; when that is hard, count the ones that fail.',
    },
    'Many dice': {
      idea: 'Every die shows at least 1, so give each die its 1 first; then share the leftover e pips. If e is 5 or less, no die can pass 6, and stars and bars gives C(e + n − 1, n − 1) ways. A big total is a small one in disguise: turn every die over (x becomes 7 − x) and a total of s becomes 7n − s. For a total between, a die might pass 6: count with stars and bars, then take away the ways where one die gets 6 or more extra. And "or less" adds a spare box for unused pips: C(e + n, n). For example, 3 dice with total 10: C(9, 2) = 36, minus 3·C(3, 2) = 9 with a die over 6, gives 27.',
      how: [
        'Small total: subtract n, then share the e extra pips among n dice: C(e + n − 1, n − 1).',
        'Big total: use 7 − x on every die to turn the total s into 7n − s, and count that instead.',
        'Middle total: start with stars and bars, then subtract n × C(t − 7, n − 1) for a die that went past 6.',
        '"Total of s or less": give the unused pips a spare box, C(e + n, n), or add the exact counts.',
      ],
      watch: [
        'Off-by-one slips in stars and bars: C(s − 1, n) or C(s, n − 1) instead of C(s − 1, n − 1).',
        'Forgetting that every die must show at least 1, or that no die can show more than 6.',
        'Taking 5 extra instead of 6 when removing a die that went past 6.',
      ],
      tip: 'Give every die its 1 first, then count the ways to share the pips that are left, and check that no die passes 6.',
    },
    'Prime chances': {
      idea: 'When every outcome is equally likely, the probability is (outcomes that give a prime)/(all outcomes), so count both carefully. To spot primes below 100, test division by 2, 3, 5 and 7 only (a composite number below 100 has a factor at most 9), and remember that 1 is not prime and 2 is. For two dice, list the ordered rolls: a sum is prime for the prime totals, each made in its own number of ways; a product is prime only when one die is 1 and the other is prime.',
      how: [
        'Count all the equally likely outcomes: numbers in the range, ordered rolls, or two-digit numbers made.',
        'List the candidates, and cross out anything divisible by 2, 3, 5 or 7 (other than those primes themselves).',
        'For a product of two numbers, only 1 × (a prime) works, in either order.',
        'Divide the number of primes by the number of outcomes, and reduce.',
      ],
      watch: [
        'Dividing by the wrong total, like 99 instead of only the allowed numbers.',
        'Counting 1 as a prime, or forgetting that 2 is one.',
        'Counting the possible sums instead of the ordered rolls that make them.',
      ],
      tip: 'Count every equally likely outcome first, then test each candidate for a factor of 2, 3, 5 or 7.',
    },
    'Choices in common': {
      idea: 'Fix the first person\'s choice: by symmetry it doesn\'t matter which one it is. Then count the second person\'s equally likely choices, C(n, k), and the ones that do what is asked. Exactly j in common: C(k, j)·C(n − k, k − j). At least one: use the opposite, no overlap at all, C(n − k, k). All inside the first list: C(m, k). And for the expected overlap, use linearity: each of the second person\'s b items is on the first list with probability a/n, so the expected overlap is ab/n. For example, with 6 films and lists of 2, sharing exactly 1 has probability C(2, 1)·C(4, 1)/C(6, 2) = 8/15.',
      how: [
        'Fix the first person\'s list.',
        'Count every possible second list: C(n, k).',
        'Count the good second lists: shared ones from inside, the rest from outside the first list; or use the opposite for "at least one".',
        'For an expected number in common, multiply the second list\'s size by the chance that one of its items is on the first list.',
      ],
      watch: [
        'Counting "at least j" when the question says "exactly j", or the other way round.',
        'Leaving out a factor: the shared items and the other items are both choices, so multiply.',
        'Treating the picks as if they could repeat (m/n multiplied k times) when they are all different.',
      ],
      tip: 'Fix the first list, then count which second lists do what is asked, or use the opposite.',
    },
    'Running totals': {
      idea: 'The running total only goes up, so it can land on a given square at most once, and the different ways of landing there never overlap. With a few rolls, split by how many rolls it takes: m rolls add up to t in C(t − 1, m − 1) ways, each with probability (1/6)<sup>m</sup>. With no limit, work square by square: to land on k you must land on one of the squares just before it and then move exactly the gap, so P(k) = ⅙(P(k − 1) + ⋯ + P(k − 6)), with P(0) = 1. The same recursion works for any steps, like a frog that jumps 1 or 2: P(k) = ½P(k − 1) + ½P(k − 2).',
      how: [
        'With a turn limit: split by m, the number of rolls that reach the square exactly, and add C(t − 1, m − 1)·(1/6)<sup>m</sup>.',
        'With no limit: let P(k) be the chance of ever landing on k, with P(0) = 1 and P(k) = 0 below 0.',
        'Write P(k) from the squares that can jump to k, each times the chance of that jump.',
        'Work up from P(1) to the square you want.',
      ],
      watch: [
        'Only checking where the token is at the end: it counts if it stops on the square at any turn.',
        'Answering 1/6, or using 1 − (5/6)<sup>r</sup>: that is the chance of rolling one particular number, a different event.',
        'Forgetting that P(0) = 1: the token starts there.',
      ],
      tip: 'Ask which squares could jump straight to this one, and build up the chances square by square.',
    },
    'At least once': {
      idea: '"At least once" is easiest through its opposite: you fail only by missing every time, so the chance is 1 − q<sup>n</sup>, where q is the chance of missing once. That grows as n grows, so "how many tries" means the first n that beats the target. "At least twice" takes away two cases: never, q<sup>n</sup>, and exactly once, n·p·q<sup>n−1</sup>. And "both things at least once" uses inclusion and exclusion on the ways to miss: all outcomes, minus those with no X, minus those with no Y, plus those with neither. For example, a 1 and a 6 both in 2 rolls: 36 − 25 − 25 + 16 = 2 of 36.',
      how: [
        'Find q, the chance of missing on one try, and write "at least once" as 1 − q<sup>n</sup>.',
        'For the fewest tries, find the first n with q<sup>n</sup> below 1 − (target), and check one fewer does not work.',
        'For "at least twice", subtract the chance of none and of exactly one (n ways to choose which try).',
        'For two different things, count outcomes missing each, and add back those missing both.',
      ],
      watch: [
        'Adding the chances (n × p): the tries can both hit, so adding overcounts.',
        'Forgetting the factor n for "exactly once": it can happen on any of the n tries.',
        'Multiplying the two "at least once" chances: the two events are not independent.',
      ],
      tip: 'Count the opposite: the ways to miss every time.',
    },
    'Taking turns': {
      idea: 'Look at one round: each player gets one try, in order. The round ends with a win for the first player (probability a), a win for the second (probability (1 − a)·b, since the second only plays after a miss), or nobody, and then the game starts over exactly as before. A restart changes nothing, so only the endings matter: the first player wins with probability a/(a + (1 − a)b). The same picture answers the rest: a game is fair when the two endings are equally likely; three players have endings a, (1 − a)a and (1 − a)²a; and with a time limit you add the wins in rounds 1, 2, … to the last, each r times the one before (r: nobody wins a round).',
      how: [
        'Find the chance that each player wins a single round: the first a, the next (1 − a)·b, and so on, each only after everyone before has missed.',
        'With no limit, only these endings matter: a player wins with probability (their ending)/(sum of all endings).',
        'For a fair game, set the two endings equal and solve for the unknown chance.',
        'With a limit of n rounds, add (the player\'s ending) × (1 + r + r² + ⋯), stopping after n terms, where r is the chance a whole round has no winner.',
      ],
      watch: [
        'Using b instead of (1 − a)·b: the second player only throws if the first one missed.',
        'Answering with a player\'s chance on a single try: going first, or getting extra tries, changes the overall chance.',
        'With a time limit, using the no-limit answer: the game can end with nobody winning.',
      ],
      tip: 'Compare the chances that each player wins a single round; a restart changes nothing.',
    },
    'Expected value': {
      idea: 'Linearity of expectation: the expected value of a total is the sum of the expected values of its parts, even when the parts depend on each other. So break the count into yes-or-no pieces, one per person, per number on the dice, or per place in a row, and add up the chance that each piece happens. For example, the expected number of different numbers on 2 dice is 6 × (1 − (5/6)²) = 11/6, since each number shows unless both dice miss it. The same trick counts tries: the j-th try happens only if all the tries before it failed.',
      how: [
        'Decide what you are counting, and split it into yes-or-no pieces: one per person, per number, or per pair of neighbors.',
        'Find the chance that one piece happens: often 1 minus the chance that everything misses, like 1 − (1 − p)<sup>k</sup>.',
        'For the number of tries, add the chance that each try happens: 1 + (1 − p) + (1 − p)<sup>2</sup> + ⋯ up to the limit.',
        'Add up the pieces (or multiply one piece by how many there are). Overlaps between pieces do not matter.',
      ],
      watch: [
        'Using the wrong number of tries, one too few or one too many.',
        'Giving the expected number of failures instead of successes, or the chance for one piece instead of the total.',
        'Worrying that pieces overlap (HHH has two pairs): linearity counts each piece on its own, so overlaps are fine.',
      ],
      tip: 'Break the count into yes-or-no pieces and add up the chance of each one.',
    },
    'Random divisors': {
      idea: 'Write the number as a product of prime powers. A divisor picks each exponent independently from 0 up to the one in the number, so with exponents e₁, e₂, … there are (e₁ + 1)(e₂ + 1)⋯ divisors, all equally likely. Then count the good ones the same way: perfect squares need every exponent even (⌊e/2⌋ + 1 choices each); multiples of m are m times a divisor of N/m; divisors of M (when M divides N) are just the divisors of M; and multiples of 10<sup>k</sup> need both exponents at least k. For example, 4! = 2³·3 has 8 divisors, and 2 of them are squares (1 and 4).',
      how: [
        'Factor the number into primes (for F!, the exponent of p is ⌊F/p⌋ + ⌊F/p²⌋ + ⋯).',
        'Count all divisors: multiply (e + 1) over the primes.',
        'Count the good divisors with the same idea: limit each exponent, or count the divisors of N/m or of M.',
        'Divide and reduce; if the question asks for a + b, add only after reducing.',
      ],
      watch: [
        'Forgetting the "+ 1" for exponent 0, which is always allowed.',
        'Taking 1/m as the chance of a multiple of m: divisors are not spread out like whole numbers.',
        'Adding a + b before reducing the fraction.',
      ],
      tip: 'Write the number as prime powers; a divisor is a choice of exponents, so count the choices.',
    },
    'Remainders by chance': {
      idea: 'When the numbers run over a whole number of blocks of m, every remainder mod m is equally likely, and a question about remainders only depends on the remainder. So test each remainder r from 0 to m − 1 and count the ones that work. Shortcuts help: Fermat\'s little theorem says r<sup>p−1</sup> leaves remainder 1 mod a prime p (for r not 0), so exponents can be cut down mod p − 1; the powers of a base mod m go round a cycle that ends at 1; and for a product ab to be a multiple of m, each remainder x of a allows gcd(x, m) remainders for b. For example, N² + 1 is a multiple of 5 for N ≡ 2 or 3: 2/5.',
      how: [
        'Check that the range splits evenly into blocks of m, so every remainder is equally likely.',
        'Reduce the question to remainders: work with r instead of N (and r, s for two numbers).',
        'Test each remainder, using Fermat or the cycle of powers to keep the numbers small.',
        'Divide the number of good remainders (or pairs) by m (or m²).',
      ],
      watch: [
        'Dividing by m − 1: remainder 0 is one of the equally likely cases too.',
        'Assuming every remainder works, or that each remainder works the same for every exponent.',
        'For a product, checking only whether a or b alone is a multiple of m.',
      ],
      tip: 'Only the remainders matter: test each one.',
    },
    'Units digits by chance': {
      idea: 'The units digit of a sum, product or power depends only on the units digits involved, and in a range like 1 to 100 every units digit turns up equally often. So work with the 10 digits (or the 100 pairs of digits) and count the ones that give the wanted ending. For powers, the units digits go round a cycle of length 1, 2 or 4: 2, 4, 8, 6 for 2; 3, 9, 7, 1 for 3; 4, 6 for 4; 7, 9, 3, 1 for 7; 8, 4, 2, 6 for 8; 9, 1 for 9; and 0, 1, 5, 6 never change. Squares end in 0, 1, 4, 5, 6 or 9 only.',
      how: [
        'Reduce every number to its units digit; check that each digit (or pair of digits) is equally likely.',
        'For a power with a random exponent, use the cycle of 4: the exponent mod 4 picks the entry (≡ 0 gives the last one).',
        'For a power of a random number, list the last digit of d<sup>e</sup> for d = 0 to 9.',
        'For two random numbers, count the pairs of digits that work, out of 100.',
      ],
      watch: [
        'Lining the cycle up with the wrong remainder: the cycle starts at exponent 1, so an exponent ≡ 0 (mod 4) gives the last entry.',
        'Dividing by 9 or 99 instead of 10 or 100: 0 is a units digit too.',
        'Counting pairs of digits as unordered: (2, 3) and (3, 2) are different pairs.',
      ],
      tip: 'Only the units digits matter, and each one is equally likely; count the digits (or pairs) that work.',
    },
    'Geometric probability': {
      idea: 'When a point lands at random in a region, the chance of landing in a part is (area of the part)/(area of the region). Two random times, or two random numbers, are one random point in a square or rectangle, so the question becomes an area. Useful shapes: |x| + |y| ≤ a is a square on its corner with area 2a²; c − w ≤ x² + y² ≤ c + w is a ring of area 2wπ; |x − y| ≤ w in a T-by-T square leaves out two corner triangles that make a (T − w)-by-(T − w) square; x + y ≤ c is a right triangle of area c²/2; and the points within r of the corners of a square are four quarter circles.',
      how: [
        'Turn the random choice into a random point: one number gives a segment, two give a rectangle.',
        'Find the area of the whole region.',
        'Sketch the good part and find its area, often as the whole minus simple shapes.',
        'Divide, and reduce (keep π if the answer has it).',
      ],
      watch: [
        'Using only the outer circle of a ring, or counting four whole circles instead of four quarter circles.',
        'For two arrival times, using w/T: the good region is a band, not a strip of width w.',
        'Forgetting to check that the shape fits inside the region (or that pieces don\'t overlap).',
      ],
      tip: 'Turn the random choices into a random point in a shape, then compare areas.',
    },
    // ---------- geometry ----------
    'Right triangles': {
      idea: 'Most right-triangle facts come from the Pythagorean theorem, the area, and similar triangles. The area is ½·a·b with the legs, and also ½·c·h with the hypotenuse and its altitude, so h = ab/c. The altitude splits the hypotenuse into pieces p and q and makes two triangles similar to the big one: h² = pq, and each leg² = (its piece)·c. The circle inside touches the sides, and the two tangents from each corner are equal, which gives r = (a + b − c)/2. For legs 6 and 8: c = 10, h = 4.8, r = 2.',
      how: [
        'Find the third side with a² + b² = c² (look for scaled 3-4-5, 5-12-13, 8-15-17 triples).',
        'Area: ½ × leg × leg; the altitude to the hypotenuse is ab/c.',
        'Pieces of the hypotenuse: h = √(pq), and a leg = √(piece next to it × c).',
        'Inscribed circle: r = (a + b − c)/2.',
      ],
      watch: [
        'Using the hypotenuse as if it were a leg in ½·a·b.',
        'Mixing up the inscribed circle (r = (a + b − c)/2) with the circle around the triangle, whose radius is c/2.',
        'Taking the leg as √(p·q) instead of √(p·c).',
      ],
      tip: 'Find all three sides first, then use the area two ways or the similar triangles the altitude makes.',
    },
    'Coordinate geometry': {
      idea: 'Slopes, distances and areas all come from differences of coordinates. The slope between two points is (change in y)/(change in x); points are on one line when the slope between each pair is the same; the line crosses the x-axis where y has dropped to 0 along that slope. The distance between points is the hypotenuse of the right triangle with legs |Δx| and |Δy|. A triangle’s area is ½·|(x₂ − x₁)(y₃ − y₁) − (x₃ − x₁)(y₂ − y₁)| (the shoelace formula). For (0, 0), (4, 1), (1, 3): ½·|4·3 − 1·1| = 11/2.',
      how: [
        'Distance: √((x₂ − x₁)² + (y₂ − y₁)²).',
        'Slope: (y₂ − y₁)/(x₂ − x₁); a third point on the line changes y by the slope times its change in x.',
        'Where a line meets the x-axis: from a point at height y₁, run y₁ ÷ (slope) to reach height 0 (watch the sign).',
        'Area of a triangle: the shoelace formula, or a box around it minus the corner triangles.',
      ],
      watch: [
        'Adding |Δx| + |Δy| instead of using the Pythagorean theorem.',
        'Forgetting the ½ in the area: the cross product is a parallelogram.',
        'Sign slips with negative coordinates: subtract carefully, x₂ − (−3) = x₂ + 3.',
      ],
      tip: 'Work with the differences in x and in y between the points: they give the slope, the distance and the area.',
    },
    'Altitudes of a triangle': {
      idea: 'Every altitude comes from the area: the altitude to a side is 2·area/side, so the longest altitude goes to the shortest side. A line that crosses both axes cuts off a right triangle with its right angle at the origin, and two of its three altitudes are the legs themselves, since each leg is perpendicular to the other; the third, to the hypotenuse, is (leg × leg)/hypotenuse. When only the three sides are known, Heron\'s formula gives the area: with s half the perimeter, area = √(s(s − a)(s − b)(s − c)). The reciprocal of each altitude is side/(2·area), so the three reciprocals add up to perimeter/(2·area), which is s/area.',
      how: [
        'For a line and the axes: find the intercepts (set y = 0, then x = 0); those are the legs, and the hypotenuse is √(leg² + leg²).',
        'Two altitudes are the legs; the third is (leg × leg)/hypotenuse. Add all three.',
        'For a triangle given by its sides: find s, half the perimeter, and the area √(s(s − a)(s − b)(s − c)).',
        'Each altitude is 2·area/side, the longest on the shortest side; the reciprocals of all three add up to s/area.',
      ],
      watch: [
        'Adding the hypotenuse instead of the altitude to it.',
        'Leaving out the legs: they count as two of the altitudes.',
        'Pairing the longest altitude with the longest side: it is the other way round.',
        'Forgetting the 2 in 2·area/side.',
      ],
      tip: 'Every altitude is 2·area/side; in a right triangle, two of them are the legs.',
    },
    'Segments to the hypotenuse': {
      idea: 'Slide a point along the hypotenuse from one end to the other and watch its distance from the right-angle corner: it starts at one leg\'s length, shrinks to the altitude h = (leg × leg)/hypotenuse at the foot of the altitude, then grows to the other leg\'s length. Lengths change smoothly, so on each side of the foot every length between h and that leg happens exactly once. Count the whole numbers in each range; if h is itself a whole number, that one segment sits on both sides, so count it once. If the question asks for different lengths rather than segments, a length that happens on both sides counts once, so just count the whole numbers from h up to the longer leg. In an isosceles triangle the shortest segment from the apex is its height, √(side² − (base/2)²), and both sides of its foot run up to the same length.',
      how: [
        'Find the shortest segment: the altitude h = ab/c in a right triangle, or the height √(side² − (base/2)²) from the apex of an isosceles one.',
        'On one side of its foot the lengths run from h up to the first side: count the whole numbers in that range.',
        'On the other side they run from h up to the second side: count again.',
        'Counting segments: add the two counts, and subtract 1 if h is a whole number. Counting different lengths: count the whole numbers from h up to the longer side, once.',
      ],
      watch: [
        'Counting only one side of the foot of the altitude.',
        'Double counting the altitude: subtract 1 only when its length is a whole number.',
        'Assuming the lengths simply run from one leg to the other.',
        'Mixing up segments and lengths: the same length on both sides is two segments but one length.',
      ],
      tip: 'Find the shortest possible segment first, then count the whole-number lengths on each side of where it lands.',
    },
    'Perpendicular to a diagonal': {
      idea: 'Put the rectangle on axes with W = (0, 0), X = (a, 0), Y = (a, b) and Z = (0, b), and drop the perpendicular from X to the diagonal WY, meeting it at F. Its length comes from the area of triangle WXY worked out two ways: ½·a·b = ½·WY·XF, so XF = ab/WY. The right triangles WFX and WXY share the angle at W, so they are similar, which gives WF = a²/WY; in the same way FY = b²/WY, so F splits the diagonal in the ratio a² : b². Measured from the same corner, the feet of two perpendiculars are a difference of two such distances apart. For an area like triangle WFZ, the height is how far F is from the side the triangle stands on: WZ lies along the y-axis, so it is F\'s x-coordinate, WF·(a/WY) = a³/(a² + b²).',
      how: [
        'Find the diagonal: WY = √(a² + b²).',
        'The perpendicular from X has length XF = ab/WY (the area of triangle WXY, taken with the diagonal as its base).',
        'Its foot is WF = a²/WY from W and FY = b²/WY from Y, so WF : FY = a² : b².',
        'A perpendicular from Z lands b²/WY from W, so the two feet are |a² − b²|/WY apart.',
        'For triangle WFZ, the height to WZ is F\'s x-coordinate a³/(a² + b²), so its area is ½·b·a³/(a² + b²).',
      ],
      watch: [
        'Using WF as the height: the height to base WZ is F\'s horizontal distance from WZ.',
        'Giving a : b as the ratio: the pieces of the diagonal are in the ratio of the squares, a² : b².',
        'Measuring the two feet from different ends of the diagonal before subtracting.',
        'Swapping the two side lengths: check which side is a and which is b.',
      ],
      tip: 'The area of the half-rectangle gives the perpendicular, and similar right triangles give where its foot lands: a leg squared over the hypotenuse.',
    },
    'Squares in a right triangle': {
      idea: 'The two squares sit differently, so find each one separately. With the legs on the axes, the hypotenuse is the line x/a + y/b = 1, and a square in the right-angle corner has its far corner (x, x) on that line, so x = ab/(a + b). For a square standing on the hypotenuse, use the altitude h = ab/c: cuts parallel to the hypotenuse shrink evenly from width c at the bottom to 0 at height h (similar triangles), so the width at height y is c(1 − y/h), and the square needs that width to equal y, which gives y = ch/(c + h). The corner square covers x² out of the triangle\'s ½ab, a fraction that simplifies to 2ab/(a + b)².',
      how: [
        'Square at the right angle: solve x/a + x/b = 1, so x = ab/(a + b).',
        'Square on the hypotenuse: find the altitude h = ab/c.',
        'At height y above the hypotenuse the triangle is c(1 − y/h) wide; set that equal to y to get y = ch/(c + h).',
        'For the ratio, divide x by y and simplify; for the part of the triangle the corner square covers, divide x² by ½ab.',
      ],
      watch: [
        'Assuming the two squares are the same size: they are close, but not equal.',
        'Flipping the ratio: the question asks for x divided by y.',
        'Comparing sides instead of areas: the fraction covered uses x², not x.',
      ],
      tip: 'Handle the squares separately: one has a corner on the hypotenuse, the other stands on it, and similar triangles give each side.',
    },
    'Lines making an equilateral triangle': {
      idea: 'A slope is the tangent of the angle a line makes with the x-axis: tan 30° = √3/3 and tan 60° = √3. So y = b + (√3/3)x rises at 30°, while a vertical line stands at 90°. Those two meet at 60°, which is right for an equilateral triangle; the third side must make 60° with both, so it falls at 30°, and through the origin that is y = −(√3/3)x. Then one side of the triangle lies on the vertical line, between the points where the two sloping lines cross it. In the same way, y = √3·x + c rises at 60° and y = −√3·x + c falls at 60°, so together with any horizontal line they make an equilateral triangle. Its height h is the vertical gap between the point where they cross and the horizontal line, its side is 2h/√3, and its area is h²/√3.',
      how: [
        'Turn each slope into an angle: √3/3 is 30°, √3 is 60°, and a vertical line is 90°.',
        'For y = b + (√3/3)x with a vertical line, the third side through the origin is y = −(√3/3)x.',
        'Find where the two sloping lines cross the vertical line, and subtract the y-values: that is one side, and the perimeter is three times it. If the perimeter is given, solve for the unknown intercept.',
        'For y = ±√3·x + c with a horizontal line: find the height h, then side = 2h/√3 and area = h²/√3.',
      ],
      watch: [
        'Giving one side instead of the perimeter.',
        'Slips simplifying √3 terms: 3 × (√3/3) = √3, and 1/√3 = √3/3.',
        'Using the height as the side: the side is 2h/√3, a bit longer.',
      ],
      tip: 'Turn each slope into an angle; every angle of an equilateral triangle is 60°.',
    },
    'Extending the sides': {
      idea: 'Look at one of the three new corner triangles, say the one at Q. Its two sides at Q are the extension (m times PQ) and QR plus its own extension ((1 + m) times QR), and the angle between them is the supplement of angle Q. Supplementary angles have the same sine, so by area = ½·(side)·(side)·sin(angle) that corner triangle has m(1 + m) times the area of the original. The three corners are alike, so the big triangle has area T + 3·m(1 + m)·T. For example, extending each side by 3 times itself gives T + 3·3·4·T = 37T. Working backward, divide the big area by 1 + 3m(1 + m), or, knowing both areas, solve for m. A square works the same way, only more simply: each of its four corner triangles is right-angled, with legs m·s and (1 + m)·s.',
      how: [
        'Pick one corner triangle; its sides at the shared vertex are m × one side and (1 + m) × the next side.',
        'Its angle there is supplementary to the triangle\'s angle, so it has the same sine, and its area is m(1 + m) times the original\'s.',
        'The big triangle is the original plus three corners: (1 + 3m(1 + m))·T.',
        'Given the big area, divide by 1 + 3m(1 + m); given both areas, set 1 + 3m(1 + m) equal to their ratio and solve for m (try small numbers).',
        'For a square of side s: the square plus four right-triangle corners, each ½·ms·(1 + m)s.',
      ],
      watch: [
        'Scaling both sides by the same amount (m² or (1 + m)²): one side grows by m, the other by 1 + m.',
        'Forgetting to add the original triangle in the middle, or counting only one corner triangle.',
        'Multiplying instead of dividing when the big area is the one given.',
        'Counting three corners for a square: it has four.',
      ],
      tip: 'Compare one corner triangle with the original using ½·ab·sin C; the angle at the shared vertex has the same sine.',
    },
    'Cutting a segment in a rectangle': {
      idea: 'Coordinates turn this into algebra. Put the rectangle on axes and write every point of SU as S + s·(U − S), where s runs from 0 at S to 1 at U. The value of s tells you what fraction of the way along SU a point is, so XY/SU is simply the difference between the s-values at X and at Y; no square roots are needed. Each s-value comes from solving the equation of SU together with the other line. When SU joins two opposite sides and crosses a diagonal at Y, the two triangles it makes with the diagonal, like KYS and MYU, are similar (vertical angles at Y, alternate angles at the ends). So KY : YM = KS : MU, and the heights of those triangles across the rectangle are in the same ratio and add up to the side between them, which gives their areas.',
      how: [
        'Place the rectangle with a corner at the origin and write down the coordinates of every named point.',
        'Write segment SU as S + s·(U − S), with s from 0 at S to 1 at U.',
        'Solve for the s where SU meets each of the other two lines; XY/SU is the difference of those two s-values.',
        'For a ratio along the diagonal, use the similar triangles: KY : YM = KS : MU.',
        'For the area of KYS, split the side LM in the ratio KS : MU to get its height, then take ½·KS·height.',
      ],
      watch: [
        'Giving one of the s-values instead of the difference between them.',
        'Measuring from the wrong corner: SL is measured from L, MT from M and NU from N.',
        'Using SL and NU in the ratio instead of KS and MU, the pieces at the diagonal\'s ends.',
      ],
      tip: 'Parametrize SU from 0 to 1 and subtract the two parameter values; for a ratio on a diagonal, look for similar triangles.',
    },
    'Circles inside a circle': {
      idea: 'When a small circle touches a big one from the inside, the big centre O, the small centre and the point of contact all lie on one line, with the small centre R − r from O and the contact point R from O. So each contact point is its small centre pushed straight out from O by the factor R/(R − r). The two small centres are 2r apart (the small circles touch each other), so triangle OAB is triangle OPQ enlarged by R/(R − r), and AB = 2r·R/(R − r). For example, R = 3 and r = 1 give AB = 2·3/2 = 3. The point T where the small circles touch is the midpoint of PQ, and OT is perpendicular to PQ, so OT = √((R − r)² − r²). Three equal circles that touch each other have centres at the corners of an equilateral triangle of side 2r, centred at O, so each is 2r/√3 from O and R = r + 2r/√3.',
      how: [
        'Join the big centre O to each small centre P and Q; the contact points A and B lie on those lines.',
        'OP = OQ = R − r, OA = OB = R, and PQ = 2r because the small circles touch.',
        'Triangle OAB is OPQ scaled by R/(R − r), so AB = 2r·R/(R − r); if AB is given, solve that for r.',
        'For the point T where the small circles touch: OT = √((R − r)² − r²), by Pythagoras in triangle OPT.',
        'For three equal circles: R = r + 2r/√3 = r + (2√3/3)·r.',
      ],
      watch: [
        'Answering 2r: the contact points are farther apart than the small centres.',
        'Scaling by the wrong factor, such as R/(R + r) or (R − r)/R.',
        'Using R instead of R − r for OP: the small centre is inside, R − r from O.',
        'For three circles, forgetting to add the small radius to the distance from O to a small centre.',
      ],
      tip: 'Draw lines from the big circle\'s centre through each small centre to the contact points, and use similar triangles or Pythagoras.',
    },
    'Cookies from a sheet of dough': {
      idea: 'Every version is the same bookkeeping: the dough\'s area minus the cookies\'. In the flower pattern the outer cookies touch the middle one, so their centres are 2r from the centre, and they reach r further to the edge of the dough: the dough\'s radius is 3r (or, the other way round, each cookie\'s radius is a third of the dough\'s). The scraps are π(3r)² − 7πr² = 2πr², and rolled out just as thick, the scrap cookie has that same area, so its radius is √(2r²) = r√2. Two cookies of radii p and q that touch each other and the edge fill a dough of radius p + q, and leave π((p + q)² − p² − q²) = 2πpq. In a square sheet of side a cut into n rows of n cookies, each cookie has diameter a/n, and together they cover π/4 of the square, whatever n is.',
      how: [
        'Relate the radii: in the flower the dough\'s radius is 3 times a cookie\'s; with two cookies side by side, the dough\'s diameter is the sum of their diameters.',
        'Leftover area = dough minus cookies: for the flower, π(3r)² − 7πr² = 2πr².',
        'A scrap cookie of that area has radius √(leftover/π): r√2 for the flower. Given the scrap cookie, work backward to r, then to the dough.',
        'For a square sheet of side a with n rows of n cookies: each radius is a/(2n), and the leftover is a² − πa²/4.',
      ],
      watch: [
        'Taking the dough\'s radius as 2r: the outer cookies stick out a further r past their centres.',
        'Forgetting the square root at the end, or comparing radii instead of areas.',
        'Using a/n as the radius in a square sheet: it is the diameter.',
      ],
      tip: 'Find the dough\'s size in terms of a cookie\'s, then compare areas: dough minus cookies.',
    },
    'Points near a segment': {
      idea: 'All the points within r of a segment make a capsule: around the middle of the segment they fill a cylinder of radius r, and around each end they fill half a ball of radius r. The two half balls make one whole ball, so the volume is πr²·L + (4/3)πr³. Knowing the volume, take away the ball and divide by πr² to get the length. The surface is the side of the cylinder, 2πr·L, plus the two half spheres, which make one whole sphere, 4πr². In a flat plane the same idea gives a rectangle 2r wide and L long with half a disc on each end: area 2rL + πr².',
      how: [
        'Picture the solid: a cylinder of radius r along the segment, with a half ball on each end.',
        'Volume = πr²·L + (4/3)πr³; given the volume, subtract the ball and divide by πr² to find L.',
        'Surface area = 2πr·L + 4πr²: the cylinder\'s side plus one whole sphere (the cylinder\'s flat ends are inside).',
        'In a plane: a 2r-by-L rectangle plus one whole disc, 2rL + πr².',
      ],
      watch: [
        'Leaving out the rounded ends, or counting two whole balls instead of two halves.',
        'Mixing up the powers: the cylinder uses r², the ball uses r³.',
        'Adding the cylinder\'s two flat ends to the surface: the half spheres cover them.',
        'Making the flat rectangle r wide instead of 2r: the region reaches r on both sides of the segment.',
      ],
      tip: 'Split the shape into a straight middle (a cylinder, or a rectangle in a plane) and round ends that together make one ball, sphere or disc.',
    },
    'Pyramid in a box': {
      idea: 'The rectangle BCHE cuts through the box from edge BC to edge EH. Edge FG is parallel to that rectangle, so every point of FG is the same distance from it: the apex can slide along FG without changing the height, and the answer doesn\'t depend on where M is. Put the apex at F. In the face ABFE, the height from F to the diagonal BE is AB·BF/BE, while the base BCHE has sides BC and BE, so BE cancels and the volume is ⅓·AB·BC·CG: a third of the box. Corners work the same way: the plane through the three corners next to a corner cuts off a pyramid with a right-triangle base (half a face) and the third edge as its height, ⅙ of the box. The tetrahedron on four corners with no two on an edge, like ACFH, is the box with four such corners taken off: abc − 4·abc/6 = abc/3.',
      how: [
        'Notice that FG is parallel to the base BCHE, so moving M along FG keeps the same height; put M at F.',
        'The base has sides BC and BE = √(AB² + CG²), and the height from F to BE is AB·CG/BE.',
        'Volume = ⅓·base·height; the BE cancels, leaving AB·BC·CG/3. Given the volume, solve for the missing edge.',
        'A corner sliced off through its three neighbours: ⅓·(½·edge·edge)·edge, the product of its three edges over 6.',
        'A tetrahedron like ACFH: take the four corner pyramids (each abc/6) away from the box, leaving abc/3.',
      ],
      watch: [
        'Forgetting the ⅓ in a pyramid\'s volume, or the ½ in a triangular base.',
        'Thinking the position of M matters: anywhere on FG gives the same height.',
        'Taking off fewer than four corners for ACFH: there is one at each of B, D, E and G.',
      ],
      tip: 'Slide the apex along its edge to a corner where the height is easier to see; for a tetrahedron, subtract the corner pieces from the box.',
    },
    'Octahedron in a box': {
      idea: 'The segments joining opposite face centres have lengths a, b and c, the box\'s dimensions, and they cross at right angles at the centre of the box. Two of them are the diagonals of a rhombus with area ½·a·b, and that rhombus cuts the octahedron into two pyramids, each of height c/2. So the volume is 2·⅓·(ab/2)·(c/2) = abc/6: one sixth of the box, whatever its shape. Two neighbouring face centres are a/2 and b/2 from the centre of the box along perpendicular lines, so by Pythagoras they are √((a/2)² + (b/2)²) apart. In a cube of edge e that distance, e/√2, is the edge of a regular octahedron, whose 8 faces are equilateral triangles of area (√3/4)·(edge)².',
      how: [
        'Join opposite face centres: three perpendicular segments of lengths a, b and c through the centre of the box.',
        'Two of them are the diagonals of a rhombus of area ab/2, which splits the octahedron into two pyramids of height c/2.',
        'Volume = 2 × ⅓ × (ab/2) × (c/2) = abc/6; if the volume is given, solve abc/6 = V for the missing edge.',
        'Two neighbouring face centres are √((a/2)² + (b/2)²) apart.',
        'In a cube of edge e the octahedron has edge e/√2, so its surface area is 8·(√3/4)·(e²/2) = √3·e².',
      ],
      watch: [
        'Using a full a-by-b rectangle as the base instead of the rhombus inside it: that doubles the answer.',
        'Using the wrong pyramid fraction: a pyramid is ⅓ of base × height.',
        'Using whole edges instead of half edges for the distance between face centres.',
        'Taking the cube\'s edge as the octahedron\'s edge: it is e/√2.',
      ],
      tip: 'Split the octahedron into two pyramids sharing a rhombus whose diagonals are two of the box\'s dimensions.',
    },
  },
};
