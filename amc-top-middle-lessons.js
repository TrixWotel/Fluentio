// Lessons for the mixed AMC 10 word problems (amc-top-middle.js), in the order to learn them: how to spot each kind in
// a test, the idea, how to do it, the facts worth knowing, what to watch out for, and a tip (the first hint).
export const topics = [
  'Calendars and weekdays', 'Logic puzzles', 'Whole-number puzzles', 'Clock hands', 'Replace and refill', 'Relative speed',
  'Mean, median and mode', 'Quarter circles in a square',
];

export const lessons = {
  'Calendars and weekdays': {
    spot: 'A date’s day of the week in another year, the next year with exactly the same calendar, or how many Mondays a month or a year can have: count days and keep only the remainder on division by 7.',
    idea: 'Only the remainder on division by 7 matters. A common year is 52 weeks and 1 day, so a date moves one day later in the week each year, and one more for each February 29 passed on the way. Leap years are the multiples of 4, except century years that are not multiples of 400: 2000 was a leap year, 1900 and 2100 are not. Which February 29ths are passed depends on whether the date comes before or after the end of February. The extra day (or two) of a year are its first days, so a year with 53 Fridays began on a Friday, and a month of 28 + e days has the first e days of its week five times.',
    how: [
      'Same date in another year: add the number of years and the number of February 29ths in between, then take the remainder on division by 7.',
      'For a date in January or February, the February 29ths in between are those of the earlier year up to the year before the later one; from March on, those of the year after the earlier one up to the later one.',
      'Same calendar: the same day of the week for January 1 and the same kind of year. Add 1 for each common year and 2 for each leap year until the total is a multiple of 7 at a year of the right kind.',
      'A month of 28 + e days: the e days of the week starting with its first day come five times, the rest four.',
    ],
    facts: [
      '365 = 7·52 + 1 and 366 = 7·52 + 2.',
      'Leap years: multiples of 4, except century years that are not multiples of 400 (2000 yes; 1900 and 2100 no).',
      'A common year’s calendar comes back after 6 or 11 years, a leap year’s after 28, unless a century year with no February 29 gets in the way.',
      'The day of the week that comes 53 times in a year is the day January 1 falls on (and also January 2’s in a leap year).',
    ],
    watch: [
      'Treating 1900 or 2100 as a leap year.',
      'Counting the February 29 of the wrong end year: it depends on whether the date is before or after it.',
      'Going back in time moves the day of the week earlier, not later.',
      'Two years starting on the same day only share a calendar if both are leap years or both are not.',
    ],
    tip: 'Work modulo 7: count how many days of the week the date moves, one for each year and one more for each February 29 in between.',
  },
  'Logic puzzles': {
    spot: 'Statements of which exactly one is true (or false), people in a row with clues about who sits where, or runners who each make two claims with exactly one true: fix one thing, follow what it forces, and throw out every case that breaks.',
    idea: 'There are only a few possibilities, so try them, but in a clever order. With one statement each, try each suspect as the culprit and count the true statements; only one suspect gives the count you were told. With seating clues, take the person in the most clues and try each seat for them; most seats break one or two clues at once. With two claims each and exactly one true, suppose a claim and follow the chain: a true claim makes every clashing claim false (the same place for someone else, or another place for the same runner), and a false claim makes its partner true. When the chain leaves someone with two false claims, the claim you supposed was false.',
    how: [
      'Whodunit: for each suspect, mark which statements would be true, count them, and keep the one suspect that matches.',
      'Seating: try each seat for the person in the most clues, and rule seats out with the clues that break there.',
      'Two claims each: suppose one claim, follow what it forces, and when it breaks take that person’s other claim instead; repeat until everything is fixed.',
      'Check the answer against every clue, then answer what is asked: a name, a seat or the whole order.',
    ],
    facts: [
      '“X is lying” is true exactly when X’s own statement is false.',
      '“Exactly one person sits between X and Y” means their seat numbers differ by 2.',
      'In a race with no ties, two true claims can’t give one place to two runners, or two places to one runner.',
      'If exactly one of five statements is false, the other four must all fit the same culprit.',
    ],
    watch: [
      'Mixing up “exactly one is true” with “exactly one is false”.',
      '“Somewhere to the left of” is not “directly to the left of”.',
      'Stopping at the first case that works: the answer must be the only one that works.',
    ],
    tip: 'Pick the thing with the fewest possibilities, try each one, and follow what it forces until it breaks or everything fits.',
  },
  'Whole-number puzzles': {
    spot: 'Coins or animals with a total number and a total value, “at least one of each”, or page numbers added up with a mistake or with a sheet missing: more unknowns than equations, and whole numbers do the rest.',
    idea: 'Two equations in three unknowns leave a whole family of answers. Use one equation to remove an unknown from the other, then the rule that every count is a whole number, at least 1 (or at least 0), cuts the family down to a few. Taking 5 cents for every coin away from the value leaves only the extra cents the dimes and quarters bring. Clear a price like “3 for $1” by multiplying first. For page numbers, the full total is n(n + 1)/2, so the size of the book is the n whose total sits just above (or just below) the sum, and a torn sheet takes away pages 2k − 1 and 2k, which add up to 4k − 1.',
    how: [
      'Name the unknowns and write the count equation and the value equation.',
      'Subtract a multiple of the count equation to get rid of one unknown.',
      'Write the other unknowns in terms of one of them and require each to be a whole number of the right size; that gives a range for it.',
      'Answer what is asked: how many solutions, the largest or smallest value of one unknown, or the one solution that fits.',
    ],
    facts: [
      '1 + 2 + ⋯ + n = n(n + 1)/2.',
      'The two pages on one sheet are 2k − 1 and 2k, adding up to 4k − 1.',
      'In ax + by = c, the whole-number solutions step along: x goes up by b/g as y goes down by a/g, where g is the GCD of a and b.',
      'There are M − m + 1 whole numbers from m to M.',
    ],
    watch: [
      'Forgetting “at least one of each”: it moves the ends of the range.',
      'Off by one when counting the values in a range.',
      'Not checking that the unknown you got rid of is still at least 1.',
    ],
    tip: 'Subtract a multiple of the count equation from the value equation to get rid of one unknown, then ask which whole numbers are allowed.',
  },
  'Clock hands': {
    spot: 'The first time after some hour that the hands are together or a given angle apart, how many times something happens between two times of day, or the hands as mirror images of each other: give each hand an angle measured clockwise from the 12.',
    idea: 'The minute hand turns 6° a minute and the hour hand ½° a minute, so the minute hand gains 5½° a minute, 330° an hour, and laps the hour hand every 720/11 minutes. At m minutes after h o’clock the hour hand is at 30h + ½m degrees and the minute hand at 6m degrees. Angle questions are about the difference of these, and mirror questions about their sum: mirror images in the 12–6 line add up to 360°, and in the 3–9 line to 180° or 540°. To count, follow the clockwise angle from the hour hand to the minute hand as it grows, without starting again at 360°, and count the values it passes.',
    how: [
      'Write the hour hand as 30h + ½m and the minute hand as 6m, both clockwise from the 12.',
      'For θ apart: the clockwise angle from the hour hand to the minute hand is θ or 360° − θ (plus whole turns), and it grows 5½° a minute.',
      'For mirror images, or one hand halfway between the 12 and the other, write the condition on the two angles and solve for m.',
      'For counting, find how much the angle grows over the span, 330° an hour, and count the target values it passes on the way.',
    ],
    facts: [
      'The gap between the hands changes by 5½° a minute, so answers come in elevenths of a minute (and thirteenths for sums, which change 6½° a minute).',
      'In 12 hours the hands are together 11 times and opposite 11 times, and any other angle comes 22 times.',
      'Mirror images in the 12–6 line: the two angles measured from the 12 add up to 360°.',
      'Dividing by 5½ is the same as multiplying by 2/11.',
    ],
    watch: [
      'Forgetting that the hour hand keeps moving during the minutes.',
      'Counting a time at the very start or end of the span when it isn’t strictly between.',
      'An angle θ apart comes twice a lap (θ and 360° − θ), except 0° and 180°, which come once.',
    ],
    tip: 'Write both hands’ angles from the 12 in terms of the minutes, and turn the question into an equation about them.',
  },
  'Replace and refill': {
    spot: 'A tank drained and topped up with water again and again, coffee and milk poured from one cup to another and back, or a mixture topped up with something stronger: follow the one ingredient that only ever leaves.',
    idea: 'Draining x liters from a well-stirred tank of V liters takes the same share, x/V, of every ingredient. So the juice is multiplied by (V − x)/V each round, and after n rounds V·((V − x)/V)<sup>n</sup> liters are left: not V − nx, because later rounds drain juice that is already watered down. When the top-up is pure antifreeze, follow the water instead, because the top-up adds none. With two cups, work out the share of each ingredient in the cup you pour from before pouring.',
    how: [
      'Choose the ingredient the top-up never adds: the juice when topping up with water, the water when topping up with antifreeze.',
      'Each round multiplies it by (V − x)/V; after n rounds by ((V − x)/V)<sup>n</sup>.',
      'Working back from what is left, take the n-th root of the share left to find (V − x)/V, then x.',
      'With two cups, write what is in the cup you pour from, then how much of each ingredient the poured amount carries.',
    ],
    facts: [
      'Draining x of V liters keeps (V − x)/V of every ingredient.',
      'After n rounds of draining x liters and refilling, V·((V − x)/V)<sup>n</sup> of the first ingredient is left.',
      'After pouring the same amount from A to B and back, A holds exactly as much milk as B holds coffee.',
      'When every drain is refilled, the total stays V, so a percent is just an amount divided by V.',
    ],
    watch: [
      'Taking away x each round as if the tank were still pure.',
      'Dividing by the cup’s size before a pour instead of after.',
      'Miscounting the rounds: “then does it twice more” means three in all.',
    ],
    tip: 'Follow one ingredient that the refill never adds, and multiply it by the share that stays each round.',
  },
  'Relative speed': {
    spot: 'Two people walking up a moving escalator, trains passing each other or a walker, or something dropped in a river and picked up later: choose a point of view in which one of the moving things stands still.',
    idea: 'Speeds add when things move toward each other and subtract when they move the same way, so watching from one of them leaves just one thing moving. To pass completely, a train has to move its own length past a person, or both lengths past another train. In a river the water carries the boat and the floating hat alike, so in the water the hat is still and the boat goes out and back at the same speed: the way back takes as long as the way out. On an escalator, the steps you take plus the stairs it carries you add up to all its stairs.',
    how: [
      'Pick the point of view: the slower train, the walker, or the water.',
      'Write what has to be covered from there (a length, both lengths, the stairs) as speed × time.',
      'With two situations, write an equation for each and solve them together, often by subtracting.',
      'Answer what is asked: a speed, a length, a time, or a number of steps.',
    ],
    facts: [
      'Toward each other the gap closes at u + v; the same way, at u − v.',
      'Passing a person takes length ÷ relative speed; passing another train takes (both lengths) ÷ relative speed.',
      'Anything floating is at rest relative to the water.',
      'On an escalator: stairs = steps taken + escalator speed × time on it.',
    ],
    watch: [
      'Using one train’s length when both lengths have to pass.',
      'Mixing units: 1 km/h is 1,000 ÷ 60 meters per minute.',
      'Walking down an up escalator, you go down w − e stairs a second, not w + e.',
    ],
    tip: 'Ride along with one of the moving things; then only one thing moves, and distance = speed × time does the rest.',
  },
  'Mean, median and mode': {
    spot: 'A list described by its mean, median and mode with a question about its largest number, a new number that makes the mean equal the median, or averages with the highest or lowest score left out: turn averages into totals and think about the order.',
    idea: 'Turn the mean into a total and write the list in order, with the median in the middle. To make one number as large as possible, make the others as small as the rules allow; to make the largest as small as possible, share the total as evenly as the rules allow. A unique mode must appear more often than any other value, which limits repeats, and using the mode one more time can let other values repeat, so compare the cases. When a new number joins, the median depends on where it lands: solve each case and keep only the answers that land where you assumed. Averages with scores left out are totals too, so subtract them.',
    how: [
      'Total = mean × how many; list the numbers in order with the median in the middle.',
      'Decide how many times the mode appears, then fill in the smallest values the rules allow for the rest.',
      'For a new number x, split into cases by where x falls, solve each, and check each answer falls in its own case.',
      'For averages without some scores, write each as a total and subtract the totals.',
    ],
    facts: [
      'The mean of n numbers is their total divided by n.',
      'With an odd number of values, the median is the middle one in order.',
      'A unique mode appears more often than every other value.',
      'With four numbers a ≤ b ≤ c ≤ d and a fifth x, the median of the five is b, x or c.',
    ],
    watch: [
      'Letting another value appear as often as the mode.',
      'Keeping an answer that falls outside the case it came from.',
      'Assuming the mode should appear as few times as possible: sometimes one more copy lets the other numbers be smaller.',
    ],
    tip: 'Turn the mean into a total, put the list in order, and make the other numbers as small (or as even) as the rules allow.',
  },
  'Quarter circles in a square': {
    spot: 'Quarter circles drawn inside a square from its corners, with a shaded region inside some arcs and outside others, or a circle that touches the arcs: look for equilateral triangles and right triangles made of radii.',
    idea: 'Two arcs of radius s centered at neighboring corners of a square of side s cross at a point s from both corners, so the two corners and that point make an equilateral triangle. The overlap is then two 60° sectors minus that triangle, of area (√3/4)s<sup>2</sup>. A circle touching an arc has its center on a line through the arc’s center, at the sum of the radii (touching from outside) or their difference (from inside), so Pythagoras gives its radius. For regions inside several arcs at once, add up the quarter circles: each point is counted once for every arc it is inside, which gives equations for the areas covered two, three or four times.',
    how: [
      'Draw the radii to the points where arcs cross; equal radii make equilateral or isosceles triangles.',
      'Build curved regions from sectors and triangles: a sector minus its triangle is the sliver between a chord and its arc.',
      'For a touching circle, set the distance between centers to the sum or difference of the radii and use Pythagoras.',
      'For “inside exactly k of the arcs”, the pieces add up to the square, and the quarter circles add up to each piece times the number of arcs covering it.',
    ],
    facts: [
      'A sector with angle θ has area (θ/360°)·πr<sup>2</sup>.',
      'An equilateral triangle with side s has area (√3/4)s<sup>2</sup>.',
      'Circles touching from outside have centers r + R apart; from inside, R − r.',
      'A quarter circle of radius s has area πs<sup>2</sup>/4.',
    ],
    watch: [
      'Counting the overlap twice when adding two quarter circles.',
      'Using the whole lens when only the half inside the square is shaded.',
      'Mixing up touching from inside and from outside.',
    ],
    tip: 'Join the arcs’ centers to the points where the arcs cross or touch; the triangles you get carry the lengths and angles you need.',
  },
};
