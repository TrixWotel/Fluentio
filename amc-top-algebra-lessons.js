// Lessons for the hardest AMC 10 algebra topics (amc-top-algebra.js): the order to learn them in, and for each one how
// to spot it in a test, the idea, how to do it, the facts worth knowing by heart, what to watch out for, and a tip
// (shown after a wrong answer, and as the first hint: the way in, never the answer).
export const topics = [
  'Equations in a cycle', 'Functional equations', 'Best value under a condition', 'Hidden formulas in sequences',
  'Logs and exponents', 'Roots with conditions', 'Integer parameters in quadratics', 'Equations in layers',
];

export const lessons = {
  'Equations in a cycle': {
    spot: 'Three or more equations that are the same up to renaming the letters (xy + 2x + 2y, then yz + 2y + 2z, then zx + 2z + 2x; or x(y + z), y(z + x), z(x + y); or a + 2b + 3c with the coefficients shifted round), and a question about the sum, the product or one letter: don’t solve them one at a time, combine them all.',
    idea: 'When the equations are copies of each other with the letters moved round, adding (or multiplying) all of them gives something that treats every letter the same way, and that unlocks the rest. Adding x(y + z) = A, y(z + x) = B and z(x + y) = C gives 2(xy + yz + zx), and taking each equation away from that leaves one product. Adding c<sup>2</sup> to xy + cx + cy factors it as (x + c)(y + c), and multiplying the three equations gives the square of (x + c)(y + c)(z + c). With shifted coefficients, adding gives the sum of the letters and subtracting neighbours isolates one letter. And when the sum of the equations completes to squares that add up to 0, every square must be 0. For example, x(y + z) = 5, y(z + x) = 8 and z(x + y) = 9 add to 2(xy + yz + zx) = 22, so yz = 11 − 5 = 6, zx = 3, xy = 2, and xyz = √(6·3·2) = 6.',
    how: [
      'Look at what the equations share: the same pattern with the letters moved round.',
      'Add them all (or multiply them all) to get something symmetric: the sum of the letters, xy + yz + zx, or a product.',
      'Take each equation away from that total (or divide it into the product) to get one letter or one product at a time.',
      'If the sum has each square next to a multiple of the same letter, complete the squares: real squares adding up to 0 are all 0.',
    ],
    facts: [
      'xy + cx + cy + c<sup>2</sup> = (x + c)(y + c).',
      'x(y + z) + y(z + x) + z(x + y) = 2(xy + yz + zx).',
      '(xyz)<sup>2</sup> = (xy)(yz)(zx).',
      'For real numbers, p<sup>2</sup> + q<sup>2</sup> + r<sup>2</sup> = 0 only when p = q = r = 0.',
    ],
    watch: [
      'Trying to solve one equation by itself: with the unknowns in a cycle, no single equation is enough.',
      'Matching a product to the wrong letter: x = xyz ÷ (yz), not ÷ (xy).',
      'Taking the negative square root when the numbers are known to be positive.',
    ],
    tip: 'The equations are copies of each other with the letters moved round, so first add (or multiply) all of them and see what symmetric quantity appears.',
  },
  'Functional equations': {
    spot: 'An equation such as 2f(x) + f(1/x) = 3x or f(x) + f(1/(1 − x)) = x that holds for every x (or one with f at several inputs that holds for every x and y), and a question about a single value like f(5): put in the few numbers that make the equation talk about the same unknowns again.',
    idea: 'The equation holds for every x, so you get to choose x. Pick values whose partners lead back to the start: x and 1/x, x and c − x, or x and (x + e)/(x − 1) pair up, so putting in t and its partner gives two equations in the two unknowns f(t) and f(partner). The rule x → 1/(1 − x) instead goes round three numbers, t, 1/(1 − t) and (t − 1)/t, and back, which gives A + B, B + C and C + A; adding two and taking away the third isolates one value. With two letters x and y, choose y so that two of the inputs become equal and cancel. For example, f(x) + 2f(1/x) = 3x at x = 2 and x = ½ gives f(2) + 2f(½) = 6 and f(½) + 2f(2) = 3/2, so f(2) = −1.',
    how: [
      'Find the partner of the input you want: the number the rule turns it into (1/t, c − t, …).',
      'Keep applying the rule until you are back at the start: two steps give a 2 by 2 system, three steps a cycle of three.',
      'Write one equation for each number on the cycle, with the unknown values as letters, and eliminate.',
      'With two letters, choose y so that two inputs become the same and their values of f cancel.',
    ],
    facts: [
      'x → 1/x, x → c − x and x → (x + e)/(x − 1) each undo themselves.',
      'x → 1/(1 − x) → (x − 1)/x → x comes back in three steps.',
      'From A + B = p, B + C = q and C + A = r: A = (p − q + r)/2.',
    ],
    watch: [
      'Giving the partner’s value f(1/t) instead of f(t).',
      'Assuming f(t) and f(partner) are equal: they usually aren’t.',
      'Sign slips when subtracting the two equations, especially with a negative coefficient.',
    ],
    tip: 'Put in the number you want and then its partner under the rule; keep going until the inputs come back to where you started.',
  },
  'Best value under a condition': {
    spot: '“The least (or largest) possible value” of an expression in two or three real numbers tied together by a condition: a/x + b/y = 1, a fixed a + b + c with a fixed ab + bc + ca, a circle x<sup>2</sup> + y<sup>2</sup> = …, or a product of two brackets with x and y in both.',
    idea: 'Reshape the problem so that one inequality, whose equality case can really happen, does all the work. Multiplying by a condition that equals 1 turns px + qy into (px + qy)(a/x + b/y) = ap + bq + pb·x/y + qa·y/x, and AM-GM on the last two terms gives the bound (√(ap) + √(bq))<sup>2</sup>. When three numbers have a fixed sum and a fixed sum of products in pairs, fix one of them and ask when the other two can be real: their sum s and product p need s<sup>2</sup> ≥ 4p, a quadratic inequality whose two ends are the extremes. A circle is easiest from its center: write x = u + X, y = v + Y and use Cauchy–Schwarz on pX + qY. For example, with x + y = 1, 1/x + 4/y = (x + y)(1/x + 4/y) = 5 + y/x + 4x/y, which is at least 5 + 4 = 9.',
    how: [
      'Use the condition to turn the expression into one sum where AM-GM or Cauchy–Schwarz applies, often by multiplying by the condition when it equals 1.',
      'For three numbers with fixed symmetric sums, fix the one asked about and require the other two to be real: discriminant at least 0.',
      'For a circle, complete the squares to find the center and radius, then measure from the center.',
      'Multiply out products of brackets first, so the inequality is used once on the whole expression.',
    ],
    facts: [
      'a + b ≥ 2√(ab) for positive a and b, with equality only when a = b.',
      '(a/x + b/y)(px + qy) ≥ (√(ap) + √(bq))<sup>2</sup> for positive numbers.',
      'Two real numbers with sum s and product p exist exactly when s<sup>2</sup> ≥ 4p.',
      '|pX + qY| ≤ √(p<sup>2</sup> + q<sup>2</sup>)·√(X<sup>2</sup> + Y<sup>2</sup>).',
    ],
    watch: [
      'Using AM-GM on pieces whose equality cases can’t happen together: the bound is then never reached.',
      'Dropping the middle term: the least value is (√(ap) + √(bq))<sup>2</sup>, not ap + bq.',
      'Giving the smallest possible value when the question asks for the largest.',
    ],
    tip: 'Look for a way to make one inequality do all the work, and check that its equality case can really happen.',
  },
  'Hidden formulas in sequences': {
    spot: 'A sequence given by a rule (a<sub>n+1</sub> = 3a<sub>n</sub> + 2, “the sum of the first n terms is n<sup>2</sup>a<sub>n</sub>”, differences that change by the same amount each time) and a question about a far-off term like a<sub>50</sub>: find a formula instead of stepping through.',
    idea: 'Many rules hide a simple formula. a<sub>n+1</sub> = k·a<sub>n</sub> + c becomes plain multiplication after a shift: a<sub>n+1</sub> + h = k(a<sub>n</sub> + h) with h = c/(k − 1), so a<sub>n</sub> + h = (a<sub>1</sub> + h)k<sup>n−1</sup>; a term like + cn needs a shift by a multiple of n as well. When the sum of the first n terms is given in terms of a<sub>n</sub>, subtract the rule for n − 1: a<sub>n</sub> = S<sub>n</sub> − S<sub>n−1</sub> gives the ratio a<sub>n</sub>/a<sub>n−1</sub>, and the product of the ratios telescopes. When the differences change by d each time, the terms are a quadratic in n with leading coefficient d/2, so two zeros p and q give a<sub>n</sub> = (d/2)(n − p)(n − q). For example, a<sub>1</sub> = 1 and a<sub>n+1</sub> = 2a<sub>n</sub> + 1 give a<sub>n</sub> + 1 = 2<sup>n</sup>, so a<sub>10</sub> = 1,023.',
    how: [
      'Write out a few terms and guess the shape: geometric after a shift, a product that telescopes, or a quadratic.',
      'For a<sub>n+1</sub> = k·a<sub>n</sub> + c (or + cn), find the shift that makes the rule plain multiplication.',
      'For rules about sums, subtract neighbouring sums to get a rule between neighbouring terms, then multiply the ratios.',
      'For constant second differences, write the quadratic from its zeros and its leading coefficient d/2.',
    ],
    facts: [
      'a<sub>n+1</sub> = k·a<sub>n</sub> + c gives a<sub>n</sub> + h = (a<sub>1</sub> + h)k<sup>n−1</sup>, with h = c/(k − 1).',
      'a<sub>n</sub> = S<sub>n</sub> − S<sub>n−1</sub> for n ≥ 2.',
      '(1/3)(2/4)(3/5)⋯((n − 1)/(n + 1)) = 2/(n(n + 1)).',
      'If the second differences are all d, then a<sub>n</sub> = (d/2)n<sup>2</sup> + bn + c for some b and c.',
    ],
    watch: [
      'Off by one in the power: from a<sub>1</sub> to a<sub>n</sub> there are n − 1 steps.',
      'Forgetting to undo the shift at the end.',
      'Using d instead of d/2 as the coefficient of n<sup>2</sup>.',
    ],
    tip: 'Write the first few terms, then look for a shift, a ratio that telescopes, or a quadratic hiding in the rule.',
  },
  'Logs and exponents': {
    spot: 'The unknown in an exponent or inside a log (x<sup>log x</sup>, log<sub>a</sub> b next to log<sub>b</sub> a), a power that must equal 1, or a count of pairs (a, b) for which log<sub>a</sub> b is a whole or a rational number.',
    idea: 'Take logs to bring exponents down, and give the log a name. With L = log<sub>k</sub> x, the equation x<sup>log<sub>k</sub> x</sup> = k<sup>j</sup>x<sup>m</sup> becomes L<sup>2</sup> = j + mL, a quadratic, and the product of its solutions x = k<sup>L</sup> is k<sup>L₁ + L₂</sup>, which Vieta gives even when L₁ and L₂ are ugly. Since log<sub>b</sub> a = 1/log<sub>a</sub> b, an equation t + 1/t = (i<sup>2</sup> + j<sup>2</sup>)/(ij) gives t = j/i or i/j. A power b<sup>e</sup> equals 1 only for base 1, exponent 0 with a base that isn’t 0, or base −1 with an even exponent. And log<sub>a</sub> b is rational exactly when a and b are powers of the same number. For example, x<sup>log<sub>2</sub> x</sup> = 8x<sup>2</sup> gives L<sup>2</sup> − 2L − 3 = 0, so L = 3 or −1, x = 8 or ½, and the product is 4.',
    how: [
      'Name the log (L = log<sub>k</sub> x, or t = log<sub>a</sub> b) and rewrite everything in terms of it.',
      'Solve the quadratic that appears, or use Vieta when only a sum or a product of solutions is asked.',
      'For a power equal to 1, go through the three cases one by one and check each candidate.',
      'For counting, write each number as a power of a base that is not itself a perfect power.',
    ],
    facts: [
      'log<sub>k</sub>(x<sup>m</sup>) = m·log<sub>k</sub> x, and log<sub>b</sub> a = 1/log<sub>a</sub> b.',
      'k<sup>L₁</sup>·k<sup>L₂</sup> = k<sup>L₁ + L₂</sup>.',
      'b<sup>e</sup> = 1 exactly when b = 1; or e = 0 and b ≠ 0; or b = −1 and e is an even integer.',
      'a<sup>r</sup> = b<sup>s</sup> (with r, s > 0) exactly when a and b are powers of one number.',
    ],
    watch: [
      '0<sup>0</sup> is not defined: an exponent of 0 only works when the base is not 0.',
      'Forgetting the base −1 case, or counting it when the exponent is odd.',
      'Picking the wrong root of t + 1/t: when a > b > 1, log<sub>a</sub> b is less than 1.',
    ],
    tip: 'Give the log a name, rewrite the equation in terms of it, and see what kind of equation you have.',
  },
  'Roots with conditions': {
    spot: 'A polynomial whose roots follow a rule (an arithmetic or geometric progression, two roots with a known product, all roots negative integers) and a question about a missing coefficient or how many such polynomials there are.',
    idea: 'Turn the condition on the roots into a shape for them. Roots in arithmetic progression are m − d, m and m + d, so the sum, 3m, gives the middle root at once; in geometric progression they are g/r, g and gr, so the product g<sup>3</sup> gives the middle root, and the products in pairs add up to g times the sum. Two roots with product q means the polynomial splits as (x<sup>2</sup> + ux + q)(x<sup>2</sup> + vx + s), and matching coefficients finds u and v. If all the roots are negative integers −r, −s and −t, then P(1) = (1 + r)(1 + s)(1 + t), so a fixed sum of coefficients becomes a product to split into factors of at least 2. For example, if x<sup>3</sup> − 9x<sup>2</sup> + kx − 15 has roots in arithmetic progression, the middle root is 3, 3(9 − d<sup>2</sup>) = 15 gives d<sup>2</sup> = 4, the roots are 1, 3 and 5, and k = 3 + 15 + 5 = 23.',
    how: [
      'Write the roots in the shape the condition gives: m − d, m, m + d; g/r, g, gr; or −r, −s, −t.',
      'Use the Vieta formula that pins down the easiest part first: the sum for an arithmetic progression, the product for a geometric one.',
      'For two roots with a known product, factor into two quadratics with unknown middle coefficients and match the coefficients.',
      'To count polynomials, put x = 1 to turn the condition on the coefficients into a factorization.',
    ],
    facts: [
      'For x<sup>3</sup> − Ax<sup>2</sup> + Bx − C: the roots add up to A, their products in pairs to B, and their product is C.',
      'For roots g/r, g and gr, the products in pairs add up to g × (the sum of the roots).',
      'P(1) is the sum of all the coefficients of P.',
      'The same roots in a different order give the same polynomial.',
    ],
    watch: [
      'Vieta’s signs: for x<sup>3</sup> + ax<sup>2</sup> + bx + c the roots add up to −a.',
      'Counting ordered triples of roots when the polynomial only depends on which roots there are.',
      'Forgetting the leading 1 in P(1) = 1 + a + b + c.',
    ],
    tip: 'Write the roots in the form the condition describes, and use the Vieta formula that fixes one of them first.',
  },
  'Integer parameters in quadratics': {
    spot: '“For how many integers a (or k, or pairs (b, c))” does a quadratic have integer roots, real roots, or roots inside some interval.',
    idea: 'Turn the condition into something you can count. If x<sup>2</sup> − ax + (ka + m) has integer roots r and s, Vieta gives r + s = a and rs = ka + m; getting rid of a gives (r − k)(s − k) = k<sup>2</sup> + m, so each factor pair of k<sup>2</sup> + m, negative pairs too, gives one a. For real roots, the discriminant inequalities bound the parameters, and then you count case by case. For roots inside an interval, use the discriminant, the value of the quadratic at the ends of the interval, and where the vertex is. For example, x<sup>2</sup> − ax + 4a with integer roots gives (r − 4)(s − 4) = 16, and the pairs 1·16, 2·8, 4·4 and their negatives give a = 25, 18, 16, −9, −2 and 0.',
    how: [
      'Write the condition with Vieta (for integer roots) or the discriminant (for real roots).',
      'Get rid of the parameter and factor, or turn the inequalities into a range for the parameter.',
      'List the factor pairs, negative ones too, or count the whole numbers in the range.',
      'Check the edges: a double root, or a root exactly at the end of the interval, may not count.',
    ],
    facts: [
      'rs − kr − ks = m factors as (r − k)(s − k) = k<sup>2</sup> + m.',
      'x<sup>2</sup> + bx + c = 0 has two different real roots exactly when b<sup>2</sup> > 4c.',
      'A quadratic with a positive leading coefficient has both roots above t exactly when it has real roots, its value at t is positive, and its vertex is to the right of t.',
    ],
    watch: [
      'Forgetting the negative factor pairs.',
      'Counting the same value of the parameter twice when two pairs give it.',
      'Counting the edge cases: equal roots when two different ones are asked for, or a root exactly at the end of the interval.',
    ],
    tip: 'Write what the roots must satisfy with Vieta or the discriminant, then get rid of the parameter so that what is left can be counted.',
  },
  'Equations in layers': {
    spot: 'Absolute values inside absolute values, or a function applied to itself (f(f(x)) = k, f(f(f(x))) = k, f(f(x)) = x), and the question is how many real solutions there are or what they add up to.',
    idea: 'Work from the outside in. For | | |x| − a | − b | = c, the outer bars give | |x| − a | = b + c or b − c (only values of at least 0 count), then |x| = a ± (each of those), and each positive value of |x| gives two x while 0 gives one. For f(f(x)) = k, first solve f(y) = k, then count the x with f(x) = y for each y, using the range of f: (x − p)<sup>2</sup> + m takes each value above m twice, m once, and nothing below m. For f(f(x)) = x, the points with f(x) = x are solutions too, so f(x) − x divides f(f(x)) − x; for f(x) = x<sup>2</sup> + bx + c the other factor is x<sup>2</sup> + (b + 1)x + b + c + 1. For example, | |x| − 2 | = 1 gives |x| = 3 or 1, so x = ±3 or ±1: four solutions.',
    how: [
      'Name what is inside the outermost layer (y = f(x), or u = |x| − a) and solve the outer equation for it.',
      'Throw away the values the inside can never take: negative values of an absolute value, or values below the minimum of f.',
      'Count the solutions for each value that is left, one layer at a time, and add them up without counting any x twice.',
      'For f(f(x)) = x, divide out f(x) − x and look at the discriminant of what is left.',
    ],
    facts: [
      '|u| = s has two solutions when s > 0, one when s = 0, and none when s &lt; 0.',
      '(x − p)<sup>2</sup> + m = y has two solutions when y > m, one when y = m, and none when y &lt; m.',
      'For f(x) = x<sup>2</sup> + bx + c: f(f(x)) − x = (f(x) − x)(x<sup>2</sup> + (b + 1)x + b + c + 1).',
    ],
    watch: [
      'Assuming every layer doubles the count: a negative or too-small value gives nothing.',
      'Counting the bottom point of a V or a parabola twice.',
      'Adding all the roots of a quartic with Vieta when only some of them are real.',
    ],
    tip: 'Name what is inside the outermost layer, solve for it first, and only then go one layer in.',
  },
};
