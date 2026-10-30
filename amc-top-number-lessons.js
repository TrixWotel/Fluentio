// Lessons for the hardest AMC 10 number theory topics (amc-top-number.js): the order to learn them in, and for each one
// how to spot it, the idea, how to do it, the facts worth knowing by heart, what to watch out for, and a tip (the way in,
// shown after a wrong answer and as the first hint).
export const topics = [
  'Numbers by their divisors', 'Several powers at once', 'GCD and LCM of three numbers', 'Towers of powers',
  'Digit patterns in base b', 'Carries and digit sums', 'Zeros at the end of n!', 'Pascal’s triangle and primes',
];

export const lessons = {
  'Numbers by their divisors': {
    spot: 'A count of the numbers in a range that have exactly k divisors (sometimes only the odd or even ones), of the divisors of a big number that have exactly k divisors themselves, or of the n whose divisors add up to an odd number.',
    idea: 'Everything comes from the prime factorization. A number p<sup>a</sup>q<sup>b</sup>⋯ has (a + 1)(b + 1)⋯ divisors, so “exactly 6 divisors” means 6 = 6 or 6 = 3 · 2: the number is p<sup>5</sup> or p<sup>2</sup>q, and you count each shape prime by prime (4q, 9q, 25q, … with q a different prime). For the divisors of 12<sup>3</sup> = 2<sup>6</sup> · 3<sup>3</sup> with exactly 6 divisors, the exponents (x, y) of 2 and 3 must be (5, 0), (2, 1) or (1, 2), since (0, 5) needs more 3s than there are. The sum of the divisors is (1 + 2 + ⋯ + 2<sup>a</sup>)(1 + p + ⋯ + p<sup>b</sup>)⋯, and each bracket with an odd prime is odd only when its exponent is even, so the sum is odd exactly for squares and twice squares.',
    how: [
      'Write k as a product of numbers bigger than 1 in every way: each way is a shape, like p<sup>3</sup>q for 8 = 4 · 2.',
      'Count each shape by its smallest primes first: fix p (and q), then count the primes allowed for the last letter up to the limit, leaving out the ones already used.',
      'For divisors of a given number, list the exponent patterns and check each order against how many of each prime the number has.',
      'For sums of divisors, look at each bracket separately: odd or even, or a multiple of 3, one prime at a time.',
    ],
    facts: [
      'p<sup>a</sup>q<sup>b</sup>r<sup>c</sup>⋯ has (a + 1)(b + 1)(c + 1)⋯ positive divisors.',
      'The sum of its divisors is (1 + p + ⋯ + p<sup>a</sup>)(1 + q + ⋯ + q<sup>b</sup>)⋯.',
      'The primes up to 50: 2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47 (15 of them).',
    ],
    watch: [
      'Forgetting the one-prime shape (p<sup>5</sup> for 6 divisors, p<sup>3</sup> for 4).',
      'Letting q equal p in p<sup>2</sup>q, which really makes p<sup>3</sup> with only 4 divisors, or counting pq and qp twice.',
      'Dropping the twice-a-square numbers like 2, 8 and 18, whose divisor sums are odd too.',
    ],
    tip: 'Turn “exactly k divisors” into shapes: write k as a product, and each way gives a form like p<sup>2</sup>q to count prime by prime.',
  },
  'Several powers at once': {
    spot: 'One number has to be several kinds of power at once, like n/2 a perfect square, n/3 a perfect cube and n/5 a perfect fifth power (or 2n a square), and the question asks about the smallest such n, its divisors, or how many such n there are up to some limit.',
    idea: 'A perfect k-th power is a number whose prime exponents are all multiples of k, so look at one prime’s exponent at a time. For n/2 to be a square, the exponent of 2 in n must be odd; for n/3 to be a cube and n/5 a fifth power, it must also be a multiple of 3 and of 5. The smallest such exponent is 15, and the next ones are 15 + 30, 15 + 60, …. Doing the same for 3 and 5 gives the smallest n = 2<sup>15</sup> · 3<sup>10</sup> · 5<sup>6</sup>. With only two conditions, say n/2 a square and n/3 a cube, every such n is 2<sup>3</sup> · 3<sup>4</sup> · t<sup>6</sup> for some whole number t, so counting them up to a limit means counting t.',
    how: [
      'For each prime named, write what each condition says about its exponent: one more (for n/q) or one less (for qn) than a multiple of its own k, and a multiple of every other k.',
      'Find the smallest exponent that does all of that; it repeats every lcm of the k’s.',
      'Primes that aren’t named need exponents that are multiples of every k, so 0 in the smallest n.',
      'Count divisors from the exponents: (e + 1) choices each, or ⌊e/2⌋ + 1 choices for a square divisor.',
    ],
    facts: [
      'm is a perfect k-th power exactly when every prime exponent in m is a multiple of k.',
      'If k and l share no factor, the numbers that are a multiple of k and one more than a multiple of l repeat every kl.',
      'A divisor of p<sup>a</sup>q<sup>b</sup> is a perfect square in (⌊a/2⌋ + 1)(⌊b/2⌋ + 1) ways.',
    ],
    watch: [
      'Mixing up n/2 (exponent one more than a multiple) and 2n (one less).',
      'Taking the first exponent that fits only one condition instead of all of them.',
      'Counting only t that share no factor with 2 and 3, when t may contain them too.',
    ],
    tip: 'Look at one prime at a time: each condition says its exponent is a multiple of some number, or one more or one less than a multiple.',
  },
  'GCD and LCM of three numbers': {
    spot: 'Ordered triples (a, b, c) with a given gcd and lcm, or with given lcms of the three pairs, or sets of three different numbers with a given gcd and lcm.',
    idea: 'Split by primes: the exponent of 2 in the gcd is the smallest of the three exponents of 2, and in the lcm the largest, and different primes don’t affect each other, so count each prime and multiply. If the exponents must run from g to g + x with g and g + x both used, inclusion and exclusion gives (x + 1)<sup>3</sup> − 2x<sup>3</sup> + (x − 1)<sup>3</sup> = 6x ways. For pairwise lcms, the two largest of the three lcm exponents must be equal: if all three are e, at least two of a, b, c have e (3e + 1 ways); if lcm(a, b) has only f below e, then c has e and a, b are at most f with one equal to f (2f + 1 ways). For sets, count ordered triples, take away the ones with a repeat, and divide by 6.',
    how: [
      'Factor everything and handle one prime at a time; multiply the counts at the end.',
      'For each prime, count the exponent triples with the right smallest and largest by inclusion and exclusion.',
      'For lcm(a, b), lcm(b, c), lcm(c, a), ask which number must carry the top exponent, then count the others.',
      'For unordered sets of different numbers, remove the triples with two equal numbers before dividing by 3! = 6.',
    ],
    facts: [
      'gcd(a, b, c) takes the smallest exponent of each prime, lcm(a, b, c) the largest.',
      'Exponents from g to g + x with both ends used: 6x ordered triples (when x ≥ 1).',
      'Exponents from 0 to e with e used at least once: (e + 1)<sup>3</sup> − e<sup>3</sup> triples.',
    ],
    watch: [
      'Counting 6(x + 1) by choosing who gets the smallest, who gets the largest, and letting the third be anything: that counts some triples twice.',
      'Forgetting the triple where all three exponents are at the top.',
      'Dividing ordered triples by 6 when some have two equal numbers.',
    ],
    tip: 'Handle one prime at a time: the gcd fixes the smallest exponent of each prime and the lcm the largest.',
  },
  'Towers of powers': {
    spot: 'A power whose exponent is itself a power, like 7<sup>9<sup>9</sup></sup>, and the question asks for its remainder when divided by 100 (its last two digits) or by a prime; or how many n up to a limit make something like 3<sup>n</sup> + n a multiple of 7.',
    idea: 'Remainders of powers repeat. Find the period of the base first: the remainders of 3, 3<sup>2</sup>, 3<sup>3</sup>, … when divided by 13 are 3, 9, 1, so they repeat every 3 and only the exponent’s remainder when divided by 3 matters. Then the exponent is a smaller problem of the same kind: its remainder when divided by the period, found from its own repeating pattern (which may only settle down after a few powers when the base shares a factor with the period). When two things with different periods are mixed, like 3<sup>n</sup> (period 3 mod 13) and n (period 13), the whole pattern repeats every 3 · 13 = 39, so count one block and the leftover piece.',
    how: [
      'Find when the base’s powers come back to 1 (by squaring: a<sup>2</sup>, a<sup>4</sup>, a<sup>5</sup>, a<sup>10</sup>, a<sup>20</sup> for 100).',
      'Reduce the exponent by that period, working out the exponent’s own remainders the same way.',
      'For counting n, find the solutions in one full period, then multiply and add the partial block at the end.',
    ],
    facts: [
      'For a prime p and a not a multiple of p, a<sup>p − 1</sup> leaves remainder 1 when divided by p (Fermat), so the period divides p − 1.',
      'For a odd and not a multiple of 5, a<sup>20</sup> leaves 1 when divided by 100, so the last two digits repeat every 20 (or every 4, 5 or 10).',
      'Two patterns with periods m and n that share no factor repeat together every mn.',
    ],
    watch: [
      'Reading a<sup>b<sup>c</sup></sup> as (a<sup>b</sup>)<sup>c</sup> = a<sup>bc</sup>; a tower is worked from the top.',
      'Reducing the top exponent c by the period too, when it is b<sup>c</sup> that must be reduced.',
      'Using the period of the last digit (4) when the question is about the last two digits.',
    ],
    tip: 'Find how often the base’s powers repeat, then you only need the exponent’s remainder when divided by that period.',
  },
  'Digit patterns in base b': {
    spot: 'Numbers whose digits in some base follow a rule: sums of different powers of 3 (only 0s and 1s in base 3), palindromes in base 2, and the k-th such number or how many there are up to some limit.',
    idea: 'Sums of different powers of b are exactly the numbers whose base-b digits are all 0 or 1, and those numerals sort the same way as the binary numerals 1, 10, 11, 100, …, so the k-th one is k written in base 2 and read in base b. To count the ones up to N, write N in base b and go along its digits from the left: a numeral that matches N so far and is smaller at the next place is smaller whatever follows. Palindromes are settled by their first half, so there are (b − 1) · b<sup>⌈ℓ/2⌉ − 1</sup> with ℓ digits, and those with as many digits as N are compared by their first halves.',
    how: [
      'Write the limit in the base the question is about.',
      'Count all the shorter numerals first; they are all smaller.',
      'For numerals as long as the limit, go from the left: where the limit has a digit bigger than yours could be, everything after is free.',
      'Check the one borderline numeral (the one that matches the limit as far as possible) on its own.',
    ],
    facts: [
      'The last base-b digit of n is its remainder when divided by b.',
      'There are (b − 1) · b<sup>ℓ − 1</sup> base-b numerals with exactly ℓ digits.',
      'A base-b palindrome with ℓ digits is fixed by its first ⌈ℓ/2⌉ digits.',
    ],
    watch: [
      'Counting 0 as one of the numerals, or leaving out the limit itself when it qualifies.',
      'Giving the largest such number instead of how many there are.',
      'Treating a digit 2 in the limit like a 1 when going along its digits.',
    ],
    tip: 'Write the limit in the base the question uses, then count digit by digit from the left.',
  },
  'Carries and digit sums': {
    spot: 'The digit sum of 2n, 11n or 101n compared with the digit sum of n: how many n make them equal (or one bigger by so much), or the smallest n with given digit sums for n and 2n.',
    idea: 'Adding or multiplying column by column, the column sums add up to exactly what you would expect, and every carry turns 10 in one column into 1 in the next, taking 9 off the digit sum. So the digit sum of 2n is twice that of n minus 9 for each carry, and doubling makes a carry exactly at the digits that are 5 or more. Multiplying by 11 adds n to 10n, so the columns are a, a + b, b + c, c, and the digit sum doubles exactly when no two neighbouring digits add up to 10 or more.',
    how: [
      'Write the product or sum in columns and find each column sum in terms of the digits.',
      'Turn the question into a statement about the number of carries, using 9 per carry.',
      'Turn “no carries” or “exactly c carries” into conditions on the digits, and count them case by case.',
    ],
    facts: [
      'The digit sum of a + b is the digit sums added, minus 9 for every carry.',
      'Doubling carries out of exactly the digits that are 5 or more, so S(2n) = 2S(n) − 9c.',
      'A number and its digit sum leave the same remainder when divided by 9.',
    ],
    watch: [
      'Forgetting that a three-digit number can’t start with 0.',
      'Missing a carry out of the front column, which makes a new digit.',
      'Counting the numbers with the right digit sum without checking how many of their digits are 5 or more.',
    ],
    tip: 'Each carry takes exactly 9 off the digit sum, so count the carries.',
  },
  'Zeros at the end of n!': {
    spot: 'How many zeros n! ends with in another base, how many numbers are never the number of zeros at the end of a factorial, or how many zeros a binomial coefficient ends with.',
    idea: 'n! ends in k zeros in base b exactly when b<sup>k</sup> divides it, so count the primes of b in n! with Legendre’s formula, ⌊n/p⌋ + ⌊n/p<sup>2</sup>⌋ + ⋯, and see which runs out first: in base 12 = 2<sup>2</sup> · 3, 30! has 26 twos (13 fours) and 14 threes, so it ends in 13 zeros. In base ten the 5s always run out first, so Z(n) = ⌊n/5⌋ + ⌊n/25⌋ + ⋯ only changes at multiples of 5, and it jumps by 2 at multiples of 25, by 3 at multiples of 125, skipping numbers. For C(n, k) = n!/(k!(n − k)!), take away the 2s and 5s of the bottom from those of the top, and then the 2s can be the ones that run out.',
    how: [
      'Factor the base, and count each of its primes in n! with ⌊n/p⌋ + ⌊n/p<sup>2</sup>⌋ + ⋯.',
      'Divide each count by the power of that prime in the base, rounding down, and take the smallest.',
      'For skipped counts, list Z(5), Z(10), …, find the last one at most the limit, and subtract how many there are from the limit.',
      'For binomial coefficients, count both the 2s and the 5s, since dividing can leave fewer 2s.',
    ],
    facts: [
      'The power of p in n! is ⌊n/p⌋ + ⌊n/p<sup>2</sup>⌋ + ⌊n/p<sup>3</sup>⌋ + ⋯.',
      'Z(5m) = m + ⌊m/5⌋ + ⌊m/25⌋ + ⋯ for the zeros at the end of (5m)!.',
      'The number of zeros at the end of a number is the smaller of its powers of 2 and 5.',
    ],
    watch: [
      'Using only the biggest prime of the base, when a squared smaller prime can run out first.',
      'Forgetting ⌊n/25⌋, ⌊n/125⌋, … in Legendre’s formula.',
      'Assuming the 2s always outnumber the 5s in a quotient like C(n, k).',
    ],
    tip: 'Count the primes of the base in n!, prime by prime, and see which one runs out first.',
  },
  'Pascal’s triangle and primes': {
    spot: 'How many numbers in a row (or in the first rows) of Pascal’s triangle are odd, or are not multiples of 3, 5 or 7; or for which n the middle number C(2n, n) is not a multiple of 4 or 8.',
    idea: 'The power of p in m! works out to (m − s(m))/(p − 1), where s(m) is the sum of m’s digits in base p. So the power of p in C(n, k) is the number of carries when k and n − k are added in base p (Kummer). No carries means each base-p digit of k is at most the matching digit of n, so row n has (d<sub>1</sub> + 1)(d<sub>2</sub> + 1)⋯ entries that are not multiples of p, from n’s base-p digits d<sub>i</sub>. Adding n + n in base 2 carries once for each 1 in n, so C(2n, n) has exactly as many factors of 2 as n has 1s in base 2. Looking only at odd and even, the first 2<sup>a + 1</sup> rows are three copies of the first 2<sup>a</sup> rows, so the first 2<sup>a</sup> rows hold 3<sup>a</sup> odd numbers.',
    how: [
      'Write n (or the number of rows) in base p.',
      'For one row, multiply (digit + 1) over n’s base-p digits; take that from n + 1 for the multiples of p.',
      'For the first N rows, split N into powers of p: the first p<sup>a</sup> rows, then the copies of the rows after them.',
      'For C(2n, n), count the 1s of n in base 2.',
    ],
    facts: [
      'The power of p in m! is (m − s(m))/(p − 1), with s(m) the base-p digit sum.',
      'The power of p in C(n, k) is the number of carries when adding k and n − k in base p.',
      'Row n has 2<sup>(number of 1s in n in base 2)</sup> odd numbers, and rows 0 to 2<sup>a</sup> − 1 hold 3<sup>a</sup>.',
    ],
    watch: [
      'Multiplying the base-p digits of n themselves instead of digit + 1.',
      'Using n’s decimal digits instead of its base-p digits.',
      'Counting one row too many (rows run from 0, so the first N rows end at row N − 1).',
    ],
    tip: 'Write n in base p: carries in base p are what put factors of p into C(n, k).',
  },
};
