// Learning Vectors: the path (what a vector is, breaking one into parts, adding and subtracting, then relative
// velocity) and a short lesson for every topic: the idea, how to do it, what to watch out for, and a tip after a wrong
// answer.
export const vectorsLearning = {
  path: [
    { unit: 'What a vector is', topics: ['Scalars and vectors', 'Distance and displacement on a path'] },
    { unit: 'Breaking a vector into parts', topics: ['Components of a vector', 'Magnitude from components', 'Direction from components', 'Vectors in i and j'] },
    { unit: 'Adding and subtracting', topics: ['Adding vectors at right angles', 'Adding vectors by components', 'Subtracting vectors: change in velocity', 'The vector that balances'] },
    { unit: 'Relative velocity', topics: ['Crossing a river', 'Flying in a crosswind'] },
  ],
  lessons: {
    'Scalars and vectors': {
      idea: '<p>A <b>scalar</b> is just a size: 20 m, 5 s, 3 kg, 30 °C. A <b>vector</b> is a size <i>and</i> a direction: 20 m east, 5 m/s north, 10 N down.</p><p>They come in pairs: distance (scalar) and displacement (vector), speed (scalar) and velocity (vector). Acceleration, force, weight and momentum are vectors. Time, mass, energy, temperature and volume are scalars.</p>',
      how: ['Ask: does the quantity point anywhere?', 'If knowing which way matters (east, up, toward the wall), it is a vector.', 'If a single number with a unit says it all, it is a scalar.'],
      watch: ['Thinking speed and velocity are the same: velocity has a direction, speed doesn\'t.', 'Calling weight a scalar: weight is a force, so it points down.'],
      tip: 'A vector needs a direction to describe it. If there is no "which way", it is a scalar.',
    },
    'Distance and displacement on a path': {
      idea: '<p>Distance adds up every step you take. Displacement only cares where you end up compared with where you started: a straight arrow from start to finish.</p><p>Walk 300 m east and 300 m back west: the distance is 600 m, the displacement is 0. Average speed uses distance, average velocity uses displacement.</p>',
      how: ['For distance, add the length of every leg.', 'For displacement, find how far east (or west) and north (or south) you end up overall.', 'Put those together with Pythagoras.', 'Average velocity = displacement ÷ time.'],
      watch: ['Adding legs that point opposite ways when you want displacement: they partly cancel.', 'Using the distance around a curve for displacement: displacement is the straight line.'],
      tip: 'Displacement is the straight arrow from start to finish. Add up the east–west parts and the north–south parts first.',
    },
    'Components of a vector': {
      idea: '<p>Any vector can be split into two parts at right angles, its <b>components</b>. A force of 50 N at 30° above the horizontal pushes 50 cos 30° = 43.3 N across and 50 sin 30° = 25 N up.</p><p>The rule: the side <b>next to</b> the angle uses cos, the side <b>across from</b> it uses sin. So it matters where the angle is measured from: from the horizontal or from the vertical.</p>',
      how: ['Sketch the vector and mark the angle it gives you.', 'The component along the side the angle touches is size × cos θ.', 'The other component is size × sin θ.'],
      watch: ['Using cos for the horizontal part when the angle is measured from the vertical: then horizontal is sin.', 'Bearings like "east of north" start from north, so north is the cos side.'],
      tip: 'cos goes with the side the angle touches, sin with the side across from it. Check where the angle is measured from.',
    },
    'Magnitude from components': {
      idea: '<p>The two components are at right angles, so the vector is the hypotenuse of a right triangle: size = √(x² + y²).</p><p>Components (−6, 8) give √(36 + 64) = 10. Minus signs only tell you the direction, and they vanish when you square.</p>',
      how: ['Square each component (a negative squared is positive).', 'Add the squares.', 'Take the square root.'],
      watch: ['Adding the components (6 + 8 = 14) instead of using Pythagoras.', 'Getting a negative under the root by forgetting that (−6)² = +36.'],
      tip: 'Magnitude = √(x² + y²): square both parts, add, then square root.',
    },
    'Direction from components': {
      idea: '<p>The angle comes from tan θ = across ÷ beside. With x = 4 and y = 3, the angle above the +x axis is tan⁻¹(3/4) = 36.9°.</p><p>Then check the quadrant. tan⁻¹ only gives angles between −90° and 90°, so for a vector pointing left (x negative) you add 180° to get the angle from +x.</p>',
      how: ['Sketch the vector so you can see which way it points.', 'Decide what the angle is measured from (+x axis, east, north, the horizontal).', 'tan θ = (the side across from that angle) ÷ (the side next to it).', 'Adjust for the quadrant: pointing left means 180° minus the small angle (above the axis) or plus 180° (from tan⁻¹ of a negative).'],
      watch: ['Mixing up "north of east" (measured from east) and "east of north" (measured from north): they add up to 90°.', 'Using sin or cos with the wrong side when you only know the components: tan is safest.'],
      tip: 'tan θ = across ÷ beside, measured from the direction named last ("north of east" starts at east). Then check which quadrant it is in.',
    },
    'Vectors in i and j': {
      idea: '<p><b>i</b> is one unit along x and <b>j</b> one unit along y, so (3<b>i</b> + 4<b>j</b>) means 3 across and 4 up. You add, subtract and multiply vectors one part at a time: 2(3<b>i</b> + 4<b>j</b>) − (<b>i</b> − 2<b>j</b>) = 5<b>i</b> + 10<b>j</b>.</p><p>A unit vector has size 1: divide each part by the size. (3<b>i</b> + 4<b>j</b>) has size 5, so its unit vector is 0.6<b>i</b> + 0.8<b>j</b>.</p>',
      how: ['Line up the i parts and the j parts.', 'Do the arithmetic on each set separately, keeping the signs.', 'For the size, use √(i part² + j part²) at the end.', 'From a size and angle: i part = size × cos θ, j part = size × sin θ.'],
      watch: ['Mixing an i number with a j number.', 'Dropping a minus sign when multiplying by a negative number.'],
      tip: 'Treat the i parts and the j parts as two separate sums.',
    },
    'Adding vectors at right angles': {
      idea: '<p>Put the vectors tip to tail: the resultant goes from the start of the first to the tip of the last. At right angles, that makes a right triangle.</p><p>30 N east and 40 N north give √(30² + 40²) = 50 N, at tan⁻¹(40/30) = 53.1° north of east.</p>',
      how: ['Draw them tip to tail.', 'Size of the resultant = √(a² + b²).', 'Its angle from the first vector = tan⁻¹(second ÷ first).', 'If you know the resultant and one side, the other side is √(R² − a²).'],
      watch: ['Just adding the sizes: 30 N and 40 N at right angles give 50 N, not 70 N.', 'Measuring the angle from the wrong vector.'],
      tip: 'At right angles the resultant is the hypotenuse: √(a² + b²), and its angle is tan⁻¹(across ÷ beside).',
    },
    'Adding vectors by components': {
      idea: '<p>When vectors aren\'t at right angles, split each one into x and y parts, add all the x parts and all the y parts, then put the totals back together with Pythagoras and tan⁻¹.</p><p>An angle past 90° makes the cos negative: a leg at 120° from east goes 0.5 of its length <i>west</i>.</p>',
      how: ['For each vector: x = size cos θ, y = size sin θ, with θ measured from +x (or east).', 'Add the x parts. Add the y parts.', 'Size = √(Rx² + Ry²), direction = tan⁻¹(Ry ÷ Rx), adding 180° if Rx is negative.'],
      watch: ['Adding the sizes directly.', 'Forgetting that cos of an angle over 90° is negative.'],
      tip: 'Split every vector into x and y parts, add each set, then rebuild: √(Rx² + Ry²).',
    },
    'Subtracting vectors: change in velocity': {
      idea: '<p>Change in velocity is <b>after − before</b>, done as vectors. A ball hitting a wall at 5 m/s and bouncing back at 3 m/s changes by 8 m/s, not 2, because the direction flipped.</p><p>A car turning from 10 m/s east to 10 m/s north has the same speed, but its velocity changed by √(10² + 10²) = 14.1 m/s.</p>',
      how: ['Choose a positive direction (or use components).', 'Write the before and after velocities with signs or as i, j parts.', 'Subtract: Δv = after − before, part by part.', 'Its size comes from Pythagoras. Average acceleration = Δv ÷ time.'],
      watch: ['Subtracting the speeds (5 − 3) when the direction reversed.', 'Thinking a constant speed means no change in velocity on a turn.'],
      tip: 'Δv = after − before as vectors: a reversal adds the speeds, a right-angle turn uses Pythagoras.',
    },
    'The vector that balances': {
      idea: '<p>When something stays still, all the forces on it add to zero. So the force that balances the others is their resultant turned around: the same size, pointing the opposite way.</p><p>40 N east and 30 N north add to 50 N at 36.9° north of east. The balancing force is 50 N at 36.9° south of west.</p>',
      how: ['Add the known forces (tip to tail, or by components).', 'The balancing force has the same size as that sum.', 'Its direction is exactly opposite: flip both components\' signs.'],
      watch: ['Giving the resultant\'s direction instead of the opposite one.', 'Forgetting a minus sign when you write the balancing force in i and j.'],
      tip: 'Balancing force = −(sum of the others): same size, opposite direction.',
    },
    'Crossing a river': {
      idea: '<p>The boat\'s velocity over the ground is its own velocity through the water plus the current\'s velocity. Pointing straight across, the current doesn\'t slow the crossing (that only depends on the speed across), but it carries the boat downstream all the way.</p><p>To land straight opposite, the boat points upstream so its upstream part cancels the current: sin θ = current ÷ boat speed. Then it crosses more slowly, at √(boat² − current²).</p>',
      how: ['Time to cross = width ÷ (the speed straight across).', 'Drift downstream = current × that time.', 'Speed over the ground = √(boat² + current²) when pointing straight across.', 'To go straight across: θ = sin⁻¹(current ÷ boat speed) upstream.'],
      watch: ['Using the ground speed to work out the crossing time when pointing straight across.', 'Using tan instead of sin for the upstream angle: the boat\'s speed is the hypotenuse.'],
      tip: 'Across and downstream are independent: time comes from the across part alone, drift from current × time.',
    },
    'Flying in a crosswind': {
      idea: '<p>A plane\'s velocity over the ground is its velocity through the air plus the wind. Pointing north at 200 km/h with a 50 km/h wind blowing east, it travels √(200² + 50²) = 206 km/h at tan⁻¹(50/200) = 14° east of north.</p><p>To fly due north anyway, the pilot points into the wind: sin θ = wind ÷ airspeed. A headwind or tailwind along the same line just subtracts or adds.</p>',
      how: ['Draw the plane\'s air velocity, then the wind tip to tail.', 'At right angles, use Pythagoras for the ground speed and tan⁻¹ for the drift angle.', 'To cancel the wind, point at sin⁻¹(wind ÷ airspeed) into it.', 'Along one line, add or subtract the speeds, then time = distance ÷ ground speed.'],
      watch: ['Using tan for the heading that cancels the wind (the airspeed is the hypotenuse, so it\'s sin).', 'Adding a headwind instead of subtracting it.'],
      tip: 'Ground velocity = air velocity + wind. Into a crosswind, the heading angle is sin⁻¹(wind ÷ airspeed).',
    },
  },
};
