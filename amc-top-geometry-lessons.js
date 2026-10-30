// Lessons for the hardest geometry topics (amc-top-geometry.js): the order to learn them in, and for each one how to
// spot it in a test, the idea, how to do it, the facts worth knowing by heart, what to watch out for, and a tip (shown
// after a wrong answer, and as the first hint).
export const topics = [
  'Segments from the corners', 'Medians and Stewart’s theorem', 'Pieces of regular polygons', 'Tilted equilateral triangles',
  'Folding paper', 'Belts and common tangents', 'Circles squeezed into a corner', 'Slicing a cube',
];

export const lessons = {
  'Segments from the corners': {
    spot: 'When segments from the corners of a triangle (or a square) to points on the opposite sides cross inside it, and the question asks for the area of a piece in the middle or near a corner.',
    idea: 'Two tools do all the work. Mass points tell you how a crossing point cuts a segment: if D cuts BC in the ratio BD : DC = m : n, put weights n and m on B and C (the heavier weight sits nearer D), and the crossing point of two segments cuts each one in the ratio of the weights. Shared heights then turn those ratios into areas: triangles with the same height have areas in the ratio of their bases. Three segments AD, BE and CF cut a triangle into a small triangle in the middle and three triangles that each stand on a whole side (ABP, BCQ and CAR, where P, Q, R are the crossing points), so the middle triangle is the whole minus those three. For example, with every side cut 1 : 2, each side triangle is 2/7 of the whole and the middle one is 1/7. In a square, four segments from the corners turned a quarter turn into each other meet at right angles, and similar right triangles give the pieces.',
    how: [
      'Name the crossing points, and decide which triangles stand on a whole side of the big triangle.',
      'For each crossing point, use the two ratios at the ends of its two segments to put weights on the three corners (scale them to agree at the shared corner).',
      'A crossing point P on AD splits it as AP : PD = (weight at D) : (weight at A), where D carries the two weights at the ends of its side.',
      'Area of a side triangle = (its share of the side) × (its share of the segment) × the whole; then subtract, or for a corner piece multiply the two shares it takes from the corner.',
    ],
    facts: [
      'Same height: areas are in the ratio of the bases.',
      'Mass points: BD : DC = m : n means weights n at B and m at C.',
      'A triangle cut off at a corner taking shares x and y of the two sides there has x·y of the area.',
      'Every side cut 1 : 2 the same way round: the middle triangle is 1/7 of the whole.',
    ],
    watch: [
      'Putting the weights the wrong way round: the heavier weight is at the nearer end.',
      'Using AP : PD as if it were AP : AD (the share of the whole segment is AP/(AP + PD)).',
      'Taking 1/7 for granted: it only holds when every side is cut 1 : 2.',
      'Mixing up which way round a ratio like CE : EA is measured.',
    ],
    tip: 'Find how each crossing point cuts its segments with mass points, then turn those ratios into areas with shared heights.',
  },
  'Medians and Stewart’s theorem': {
    spot: 'When a triangle has a median, an altitude, an angle bisector or some other segment from a corner to the opposite side, and the question asks for a length or an area that the plain side lengths don’t give at once.',
    idea: 'Know a few facts cold and the rest follows. The centroid G is two thirds of the way along each median, and it splits the triangle into three parts of equal area; if two medians are perpendicular, the right angle at G gives three right triangles, and for medians from A and B that leads to a² + b² = 5c². The three medians, scaled by 2/3, form a triangle inside the picture (extend a median past its midpoint to make a parallelogram), so the triangle’s area is 4/3 of the area of the triangle made of its medians. Stewart’s theorem gives any segment AD to side BC: b²·BD + c²·DC = a(AD² + BD·DC). And the circle inscribed in a triangle touches a side at a distance (the two sides at that corner minus the opposite side)/2 from the corner, so when AD splits ABC, the inscribed circles of the two halves touch AD at points whose distance apart doesn’t depend on AD at all.',
    how: [
      'Medians: put in the centroid G, two thirds of the way along each, and look for right triangles at G or for the triangle of medians.',
      'A point D on BC fixed by a condition (equal perimeters, a bisector, a foot of an altitude): first find BD and DC.',
      'Then use Stewart’s theorem for AD, or shared heights for areas (BD/BC of the whole).',
      'Inscribed circles: write each touching distance as half of (adjacent sides − opposite side); shared lengths cancel.',
    ],
    facts: [
      'Median length: 4·m_a² = 2b² + 2c² − a².',
      'Area of a triangle = 4/3 × area of the triangle with sides equal to its medians.',
      'Stewart: b²·BD + c²·DC = a(AD² + BD·DC).',
      'Medians from A and B perpendicular ⇔ a² + b² = 5c².',
    ],
    watch: [
      'Forgetting that the centroid is 2/3 of the way from the corner, not halfway.',
      'Using the 4/3 the wrong way round (the triangle is bigger than the median triangle).',
      'In Stewart’s theorem, pairing b² with DC instead of BD (b = CA goes with BD, the far piece).',
      'Assuming the foot of an altitude is the midpoint.',
    ],
    tip: 'Find exactly where the point on the side is first (BD and DC); then a length comes from Stewart’s theorem and an area from shared heights.',
  },
  'Pieces of regular polygons': {
    spot: 'When a regular hexagon or octagon is cut by diagonals or by segments to points on its sides, and the question asks for the area of a piece.',
    idea: 'A regular hexagon is six equilateral triangles round its centre, so triangles made from its corners and centre have simple shares: ABC and BCD are a sixth, ACD is a third, ACE is a half. A point P on a side moves the height of a triangle linearly, so [PCD] is a weighted average of [ACD] and [BCD]. When the figure looks the same after a turn about the centre, the middle piece is a smaller regular polygon, and its size comes from the distance from the centre to one of the cutting lines: areas of regular polygons go as the square of that distance. In a regular octagon, each angle is 135°, so the triangle cut off by a short diagonal has 22.5° angles, and tan 22.5° = √2 − 1; the octagon itself is a square of side s(1 + √2) with four corners of area s²/4 cut off.',
    how: [
      'Use the turning symmetry: equal pieces, and a regular polygon in the middle if there is one.',
      'For a triangle inside a hexagon: subtract equal outside pieces, splitting each into triangles whose shares of the hexagon you know.',
      'For a middle hexagon: find the area of a triangle with the centre as one corner, then the distance from the centre to the line as 2·area ÷ length, and compare squares.',
      'For an octagon: work with the 135° angles, 22.5° base angles, and the square-with-corners-cut picture.',
    ],
    facts: [
      'Regular hexagon: [ABC] = 1/6, [ACD] = 1/3, [ACE] = 1/2 of the whole.',
      'Regular octagon with side s: area 2(1 + √2)s²; its short diagonal squared is (2 + √2)s².',
      'tan 22.5° = √2 − 1.',
      'Similar regular polygons: area ratio = (ratio of distances from the centre to a side)².',
    ],
    watch: [
      'Using the 60° angle of a triangle where the hexagon’s corner is 120°.',
      'Forgetting to square when comparing the middle polygon with the big one.',
      'Counting a piece twice when adding overlapping squares (union = sum − overlap).',
    ],
    tip: 'Use the symmetry: equal pieces round the centre, and areas as known fractions of the whole polygon.',
  },
  'Tilted equilateral triangles': {
    spot: 'When an equilateral triangle sits at a slant: with corners on the sides of a square or rectangle, one corner on each of three parallel lines, or around a point whose distances to the corners are given.',
    idea: 'An equilateral triangle is one corner turned 60° about another. So put a corner at the origin and turn: the point (x, y) turned 60° counterclockwise is (x/2 − y√3/2, x√3/2 + y/2). If one corner is fixed and another is on a known line, turning that line by 60° tells you where the third corner is, and the third corner must also lie on its own line: one equation, and the side follows. With a corner of a square, symmetry gives the angles 15°, 60° and 15° at that corner, and cos²15° = (2 + √3)/4. With a point P inside and PA² + PB² = PC² (or any order), turning the triangle 60° about a corner brings the three lengths together into one right triangle, and the angle at P comes out as 150°, so the side follows from the law of cosines.',
    how: [
      'Put the corner you know at the origin and write the second corner with one unknown.',
      'Turn it by 60° to get the third corner, and make the third corner satisfy its condition (on a line, on a side).',
      'Solve, then side² = x² + y², and the area is (√3/4)·side².',
      'Inside point with a Pythagorean triple: turn 60° about the corner between the two shorter lengths; the angle between them is 150°.',
    ],
    facts: [
      'Turning (x, y) by 60° counterclockwise gives (x/2 − y√3/2, x√3/2 + y/2).',
      'Equilateral triangle in a square from a corner: area (2√3 − 3)s².',
      'One corner on each of three parallel lines, middle one a and b from the others: side² = 4(a² + ab + b²)/3.',
      'Area of an equilateral triangle = (√3/4)·side².',
    ],
    watch: [
      'Turning the wrong way (check that the third corner lands where it should).',
      'Using the height of the strip, a + b, as if a side were parallel to the lines.',
      'In the law of cosines, cos 150° = −√3/2, so the term is added.',
    ],
    tip: 'Fix one corner and turn another by 60° about it: the third corner has to land on its own line or side.',
  },
  'Folding paper': {
    spot: 'When a sheet of paper (a rectangle, a square or a triangle) is folded so that one point lands on another, and the question asks about the crease, the folded shape, or a small triangle that appears.',
    idea: 'A fold is a reflection, and the crease is the perpendicular bisector of the segment from a point to where it lands: every point of the crease is as far from one as from the other. So a point Q of the crease on an edge satisfies QA = QA′, and one Pythagoras (or law of cosines) equation gives where it is. The fold keeps lengths and angles, so a right angle at a folded corner stays a right angle, which makes the little triangles that appear similar to each other. The overlap of a folded flap is counted once in the area the folded sheet covers.',
    how: [
      'Draw the segment from the point to where it lands; the crease is its perpendicular bisector.',
      'Where the crease meets an edge, call the unknown x and write "distance to A = distance to A′" with Pythagoras or the law of cosines.',
      'Folded right angles make similar triangles; match the right angles and the equal angles carefully.',
      'For the crease length, use similar triangles through the centre, or the law of cosines in the corner the crease cuts off.',
    ],
    facts: [
      'Folding a w-by-h rectangle (w > h) corner to opposite corner: crease = h√(w² + h²)/w.',
      'Folding a square corner onto the opposite side: the small triangle that appears at the far corner has perimeter half the square’s.',
      'In an equilateral triangle, the corner triangles have a 60° angle, so the law of cosines has a − (product) term.',
    ],
    watch: [
      'Setting the crease through the midpoint of the paper instead of the midpoint of the fold segment.',
      'Matching the legs of similar right triangles the wrong way round.',
      'Counting the doubled part of a folded sheet twice (or not at all).',
    ],
    tip: 'A fold is a reflection: the crease is the perpendicular bisector of the segment joining a point to where it lands.',
  },
  'Belts and common tangents': {
    spot: 'When two circles share a tangent line (a belt or chain around two wheels, outer and inner common tangents), or two circles cross and a line through a crossing point meets them again.',
    idea: 'Slide a common tangent sideways by the smaller radius: it then runs through the small circle’s centre and touches a circle of radius R − r (outer tangent) or R + r (inner tangent) around the big centre. So the tangent is a leg of a right triangle with the distance between the centres as hypotenuse: √(d² − (R − r)²) for an outer tangent and √(d² − (R + r)²) for an inner one. The radii to the points of contact are perpendicular to the tangent, which tells you how much of each circle a belt wraps. Equal tangents from a point add up nicely: the part of an inner tangent between the two outer ones is exactly as long as an outer tangent. For crossing circles, the line of centres is the perpendicular bisector of the common chord, and a perpendicular from a centre halves any chord.',
    how: [
      'Draw the radii to the points of contact (perpendicular to the tangent) and the line of centres.',
      'Slide the tangent by the small radius to get a right triangle with hypotenuse d.',
      'For a belt, find the angle the straight parts make with the line of centres; each wheel is wrapped 180° plus or minus twice that angle.',
      'For tangents meeting tangents, write each length as a sum or difference of equal tangents from one point.',
    ],
    facts: [
      'Outer common tangent: √(d² − (R − r)²); inner: √(d² − (R + r)²).',
      'Two tangents from one point to a circle are equally long.',
      'A line through a crossing point parallel to the line of centres is twice as long (between the circles) as the distance between the centres.',
    ],
    watch: [
      'Using R + r for an outer tangent or R − r for an inner one.',
      'Wrapping half of each wheel: the arcs are only halves when the wheels are equal.',
      'Taking the distance between the centres for the length of a tangent.',
    ],
    tip: 'Slide the tangent sideways by the small radius: it becomes a leg of a right triangle whose hypotenuse joins the centres.',
  },
  'Circles squeezed into a corner': {
    spot: 'When a circle (or ball) sits in a corner touching both sides and also touches another circle there, often the inscribed circle; or a whole chain of circles runs into the corner.',
    idea: 'A circle touching both sides of an angle has its centre on the bisector, and its radius r and its centre’s distance d from the corner are in a fixed ratio: r = d·sin(half the angle). Two such circles touching each other have centres r₁ + r₂ apart along the bisector, so (r₁ − r₂)/sin = r₁ + r₂, and the next circle is (1 − sin)/(1 + sin) times the last: a geometric sequence. In an isosceles triangle there is a shortcut: the line touching the inscribed circle parallel to the base cuts off a small copy of the triangle whose inscribed circle is the corner circle, scaled by (h − 2r)/h. In space it works the same way along the long diagonal of a cube or the axis of a pyramid.',
    how: [
      'Put both centres on the bisector, and find the ratio radius : distance from the corner (from a right triangle, a slope, or the tangent length and r).',
      'Write "distance between centres = sum of radii" along the bisector and solve for the small radius.',
      'For the inscribed circle use r = area ÷ semi-perimeter, and the tangent length s − (opposite side) from the corner.',
      'For a chain, use the common ratio and a geometric series.',
    ],
    facts: [
      'Inscribed radius: r = area ÷ semi-perimeter; in a right triangle r = (a + b − c)/2.',
      'Next circle in a corner: ratio (1 − sin θ)/(1 + sin θ), θ half the angle; for a right angle, 3 − 2√2.',
      'Ball in the corner of a cube touching the inscribed ball: radius (2 − √3) times the big one.',
      'Sum of a geometric series: first term ÷ (1 − ratio).',
    ],
    watch: [
      'Using the whole angle instead of half of it.',
      'Measuring from the corner to the circle instead of to its centre.',
      'Forgetting to square the ratio when adding up areas.',
    ],
    tip: 'Both centres lie on the bisector of the corner; compare each radius with its centre’s distance from the corner.',
  },
  'Slicing a cube': {
    spot: 'When a plane through three named points cuts a cube or a box, and the question asks for the area of the cut, the volume of a piece, or a distance to the plane.',
    idea: 'Put the cube on coordinates with a corner at the origin. The plane through three points has an equation ax + by + cz = d, and checking each edge tells you where it crosses, which gives the shape of the cut. Its area is easiest from a shadow: drop one coordinate to get a flat polygon (shoelace formula), then divide by the cosine of the tilt, which is |c|/√(a² + b² + c²) when you drop z. For the volume of a piece, extend the plane until it cuts a tetrahedron off the corner (volume pqr/6 from its three edge lengths p, q, r), then subtract the smaller similar tetrahedra that poke out past the far faces, adding back any part taken off twice. For a corner cut off a box, the triangle’s area is ½√(p²q² + q²r² + r²p²), and the volume of the corner tetrahedron gives the distance from the corner to the plane.',
    how: [
      'Coordinates first: write down the given points and find the plane’s equation (check it on all three points).',
      'Find where the plane crosses the edges to get the corners of the cut, in order around it.',
      'Area: shadow area by the shoelace formula, divided by the cosine of the tilt.',
      'Volume: corner tetrahedron, minus similar tetrahedra outside the cube (their size from how far past the face each intercept is), plus overlaps.',
    ],
    facts: [
      'Corner tetrahedron with edges p, q, r: volume pqr/6.',
      'Similar solids: volume ratio = (length ratio)³.',
      'Area of a flat shape = area of its shadow ÷ cos(tilt).',
      'Corner triangle: area ½√(p²q² + q²r² + r²p²).',
    ],
    watch: [
      'Scaling a poked-out tetrahedron by the length ratio instead of its cube.',
      'Using the shadow’s area as the answer, or dividing by the wrong part of the normal.',
      'Missing a corner of the cut by not checking every edge.',
    ],
    tip: 'Put the cube on coordinates and find the plane’s equation; then the cut’s corners are where it crosses the edges.',
  },
};
