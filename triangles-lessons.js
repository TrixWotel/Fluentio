// Learning Triangle Angles: the path (from the angle sum to the lines drawn inside a triangle) and a short lesson for
// every topic: the idea, how to do it, what to watch out for, and a tip after a wrong answer.
export const triangleLearning = {
  path: [
    { unit: 'The angle sum', topics: [
      'Angle sum of a triangle', 'Right triangle', 'Angles in a ratio', 'Angles in terms of x'
    ] },
    { unit: 'Isosceles triangles', topics: [
      'Isosceles: base angles', 'Isosceles: the top angle'
    ] },
    { unit: 'Exterior angles', topics: [
      'Exterior angle', 'Exterior angle: an interior angle', 'Isosceles with an exterior angle'
    ] },
    { unit: 'Lines inside a triangle', topics: [
      'Angle bisector', 'Altitude'
    ] },
  ],
  lessons: {
    'Angle sum of a triangle': {
      idea: 'The three angles inside any triangle always add up to <b>180°</b>. Tear the three corners off a paper triangle and line them up: they make a straight line, and a straight line is 180°. So if you know two angles, the third is whatever is left over: with 20° and 100°, the third is 180° − 20° − 100° = 60°.',
      how: ['Add the two angles you know.', 'Subtract that total from 180°.', 'Check that all three angles add back up to 180°.'],
      watch: ['Subtract both known angles, not just one of them.', 'The answer must be between 0° and 180°: a negative or zero angle means something went wrong.'],
      tip: 'All three angles of a triangle add up to 180°, so find what is left after the two you know.',
    },
    'Right triangle': {
      idea: 'A right angle, marked with a little square, is exactly 90°. That uses up 90° of the triangle’s 180°, so the other two angles share the remaining 90°: they always add up to 90°. If one of them is 10°, the other is 90° − 10° = 80°.',
      how: ['Spot the right angle (the small square): it is 90°.', 'The other two angles add up to 90°.', 'Subtract the angle you know from 90°.'],
      watch: ['Subtracting from 180° instead of 90° forgets the right angle.', 'The other angles are acute, so the answer must be less than 90°.'],
      tip: 'The right angle already takes 90°, so the two other angles share the remaining 90°.',
    },
    'Angles in a ratio': {
      idea: 'A ratio like 1 : 1 : 4 means the angles are 1 part, 1 part and 4 parts, all parts the same size. Altogether that is 1 + 1 + 4 = 6 parts, and they must fill 180°, so one part is 180° ÷ 6 = 30°. The angles are 30°, 30° and 4 × 30° = 120°.',
      how: ['Add the numbers in the ratio to get the total number of parts.', 'Divide 180° by that total to find the size of one part.', 'Multiply one part by the ratio number of the angle you want (the largest or the smallest).', 'Check that the three angles add up to 180°.'],
      watch: ['Dividing 180° by the biggest ratio number instead of by the total number of parts.', 'Answering with one part when the question asks for the largest or the smallest angle.', 'Read carefully whether the question wants the largest or the smallest angle.'],
      tip: 'Add up all the parts of the ratio first: together they make 180°.',
    },
    'Angles in terms of x': {
      idea: 'Even when the angles are written as expressions like (x + 10)° and (2x − 5)°, they still add up to 180°. Adding the three expressions collects the x terms and the plain numbers, which gives one equation to solve for x. For example, x + 2x + 3x = 180 gives 6x = 180, so x = 30.',
      how: ['Add the three expressions and set the total equal to 180.', 'Collect the x terms together and the plain numbers together.', 'Solve the equation for x.', 'If the question asks for an angle, put x back into that angle’s expression.'],
      watch: ['Keep the signs: (2x − 10) adds −10, not +10.', 'Stopping at x when the question asks for ∠B, or giving ∠B when it asks for x.'],
      tip: 'Add all three expressions, set the total equal to 180, and solve for x first.',
    },
    'Isosceles: base angles': {
      idea: 'An isosceles triangle has two equal sides, shown by the tick marks. The angles opposite those sides, called the base angles, are equal too. So once you know the top angle (the one between the equal sides), the two base angles split what is left of 180° equally: with a top angle of 150°, each base angle is (180° − 150°) ÷ 2 = 15°.',
      how: ['Find the equal sides (the ticks): the angles opposite them are the equal base angles.', 'Subtract the top angle from 180°.', 'Halve what is left: each base angle gets the same share.'],
      watch: ['Forgetting to halve: 180° minus the top angle is both base angles together.', 'Mixing up which angle is the top: it is the one between the two equal sides.'],
      tip: 'The two base angles are equal, so they share what is left of 180° after the top angle.',
    },
    'Isosceles: the top angle': {
      idea: 'This uses the same fact the other way round. In an isosceles triangle the two base angles are equal, so knowing one base angle tells you both of them. Take both away from 180° and what is left is the top angle: with base angles of 85°, the top angle is 180° − 2 × 85° = 10°.',
      how: ['Use the ticks to find the equal sides; the base angles opposite them are equal.', 'Double the base angle you are given.', 'Subtract that from 180° to get the top angle.'],
      watch: ['Subtracting the base angle only once: there are two of them.', 'Halving by mistake: halving is how you find a base angle, not the top angle.'],
      tip: 'There are two equal base angles, so take both of them away from 180°.',
    },
    'Exterior angle': {
      idea: 'Extending one side of a triangle makes an exterior angle outside it. The exterior angle and the inside angle next to it lie on a straight line, so together they make 180°. That inside angle also makes 180° with the other two interior angles, so the exterior angle must equal the <b>sum of the two interior angles far from it</b>. With 15° and 95° far from it, the exterior angle is 110°.',
      how: ['Find the two interior angles that are not next to the exterior angle.', 'Add them: that sum is the exterior angle.', 'Or find the third interior angle (180° minus the other two) and take it away from 180°.'],
      watch: ['Using the interior angle next to the exterior angle in the sum: use the two far ones.', 'Giving the inside angle at C instead of the exterior angle outside it.'],
      tip: 'An exterior angle equals the two interior angles far from it, added together.',
    },
    'Exterior angle: an interior angle': {
      idea: 'An exterior angle equals the sum of the two interior angles far from it, so the fact also works backwards. If you know the exterior angle and one of those far angles, the other far angle is the difference. With an exterior angle of 105° and one far angle of 15°, the other is 105° − 15° = 90°.',
      how: ['Write the fact: exterior angle = one far interior angle + the other far interior angle.', 'Subtract the far angle you know from the exterior angle.', 'Check that the answer is positive and smaller than the exterior angle.'],
      watch: ['Subtracting from 180° instead of from the exterior angle.', 'Using the interior angle at C, next to the exterior angle, instead of the far angle at A.'],
      tip: 'The exterior angle is the sum of the two far interior angles, so subtract the one you know from it.',
    },
    'Isosceles with an exterior angle': {
      idea: 'Two facts work together here. The exterior angle and the interior angle next to it make a straight line, so that interior angle is 180° minus the exterior angle. In this isosceles triangle that interior angle is a base angle, and the other base angle equals it, which lets you find the top angle. With an exterior angle of 160°: each base angle is 20°, so the top angle is 180° − 2 × 20° = 140°.',
      how: ['Find the interior angle next to the exterior angle: 180° minus the exterior angle.', 'That is a base angle, and the other base angle is the same size.', 'Subtract both base angles from 180° to get the top angle.'],
      watch: ['Treating the exterior angle itself as a base angle.', 'Forgetting that there are two equal base angles to take away.'],
      tip: 'Start at the straight line: the angle inside the triangle next to the exterior angle is 180° minus it.',
    },
    'Angle bisector': {
      idea: 'An angle bisector cuts an angle into two equal halves. Here it starts at A and meets BC at D, making a smaller triangle ABD. Find the whole of ∠A from the angle sum, halve it to get ∠BAD, then use the angle sum again in triangle ABD. For example, if ∠B = 85° and ∠C = 35°, then ∠A = 60°, ∠BAD = 30°, and ∠ADB = 180° − 85° − 30° = 65°.',
      how: ['Find ∠A: 180° minus ∠B and ∠C.', 'Halve it: the bisector makes ∠BAD = ∠A ÷ 2.', 'In triangle ABD, ∠ADB = 180° − ∠B − ∠BAD.'],
      watch: ['Using the whole of ∠A in triangle ABD instead of half of it.', 'Using ∠C in triangle ABD: that triangle’s angles are at A (the half), B and D.'],
      tip: 'Work out the whole of ∠A first, halve it, then look at the small triangle ABD.',
    },
    'Altitude': {
      idea: 'An altitude drops from a corner to the opposite side and meets it at a right angle, so ∠ADB = 90°. That makes ABD a right triangle, and its other two angles add up to 90°. So ∠BAD is just 90° minus ∠B, and ∠C isn’t needed at all. With ∠B = 80°, ∠BAD = 10°.',
      how: ['Mark the right angle where the altitude meets BC: ∠ADB = 90°.', 'Look only at the small triangle ABD.', 'Its other two angles add up to 90°, so ∠BAD = 90° − ∠B.'],
      watch: ['Halving ∠A: an altitude is not a bisector, so it usually doesn’t split ∠A in half.', 'Using ∠C: it belongs to the other small triangle, ADC.'],
      tip: 'The altitude meets BC at 90°, so look at the right triangle ABD on its own.',
    },
  },
};
