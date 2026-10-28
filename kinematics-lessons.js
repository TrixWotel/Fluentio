// Learning Kinematics: the path (position–time graphs, then velocity–time graphs, then constant acceleration) and a
// short lesson for every topic: the idea, how to do it, what to watch out for, and a tip after a wrong answer.
export const kinematicsLearning = {
  path: [
    { unit: 'Position–time graphs', topics: [
      'Velocity from a position–time graph', 'Velocity on one part of an x–t graph',
      'Distance or displacement from an x–t graph', 'Average velocity from an x–t graph',
      'Acceleration from a curved x–t graph'
    ] },
    { unit: 'Velocity–time graphs', topics: [
      'Acceleration from a velocity–time graph', 'Displacement from the area under a v–t graph',
      'Total distance from a v–t graph', 'Average velocity from a v–t graph', 'Two objects on one v–t graph',
      'Velocity from an acceleration–time graph'
    ] },
    { unit: 'Constant acceleration', topics: [
      'Braking distance', 'Free fall', 'Thrown straight up'
    ] },
  ],
  lessons: {
    'Velocity from a position–time graph': {
      idea: 'A position–time graph shows where something is at each moment. Its <b>slope</b> (rise over run) is how many meters the position changes each second, and that is the velocity. A straight line means a steady velocity. If the position goes from 3 m to 9 m in 3 s, v = (9 − 3) ÷ 3 = 2 m/s. A line sloping down gives a negative velocity: the object is moving backward.',
      how: ['Read two points on the line, ideally the marked ones.', 'Find the change in position: Δx = later x − earlier x.', 'Find the change in time: Δt = later t − earlier t.', 'Velocity v = Δx/Δt in m/s, keeping the sign.'],
      watch: ['Dropping the minus sign when the line slopes down.', 'Dividing one position by one time instead of using changes: that only works if the line starts at x = 0.'],
      tip: 'Velocity is the slope of the x–t graph: change in position divided by change in time.',
    },
    'Velocity on one part of an x–t graph': {
      idea: 'A trip graph can be made of several straight pieces: one going up (moving away), a flat one (stopped, because the position isn’t changing) and one going down (coming back). Each piece has its own slope, so for the speed on one part of the trip, use only that piece’s start and end. Coming back 5 m in 2 s is a speed of 5 ÷ 2 = 2.5 m/s; the velocity is −2.5 m/s, since x is decreasing.',
      how: ['Find the piece for the part of the trip you are asked about (walking back is the piece going down).', 'Read the positions and times at its start and end.', 'Speed = how far it moves on that piece ÷ how long that piece lasts.'],
      watch: ['Using the times for the whole trip instead of just that piece.', 'Using the farthest position instead of how far it actually moves on that piece.'],
      tip: 'Use only the straight piece for that part of the trip: how far it moves on it, divided by how long it takes.',
    },
    'Distance or displacement from an x–t graph': {
      idea: '<b>Distance</b> is every meter actually traveled, there and back. <b>Displacement</b> only compares where you end up with where you started: final position − starting position. Walk 10 m away and 4 m back, and the distance is 10 + 4 = 14 m, but the displacement is just 6 m.',
      how: ['Read the starting position, the farthest position and the final position off the graph.', 'For distance, add the length of every leg: the way out plus the way back.', 'For displacement, subtract: final position − starting position.'],
      watch: ['Giving the displacement when the question asks for the distance, or the other way round.', 'Counting the flat part as distance: a flat piece means no movement.'],
      tip: 'Distance adds up every leg of the trip; displacement only compares the end with the start.',
    },
    'Average velocity from an x–t graph': {
      idea: 'Average velocity over a time interval is the total displacement divided by the time taken, whatever happened in between. On an x–t graph that is the slope of a straight line joining the two moments, even if the real path speeds up, stops or turns back. From x = 3 m at t = 1 s to x = 12 m at t = 4 s, the average velocity is (12 − 3) ÷ (4 − 1) = 3 m/s.',
      how: ['Read the position at the start time and at the end time.', 'Displacement = later position − earlier position (it can be negative or zero).', 'Divide by the time between them.'],
      watch: ['Averaging the speeds of the separate pieces: that is not the same thing unless the pieces take equal times.', 'Using the total distance instead of the displacement.'],
      tip: 'Only the positions at the two times matter: their difference divided by the time between them.',
    },
    'Acceleration from a curved x–t graph': {
      idea: 'When something speeds up steadily from rest, its x–t graph curves upward instead of being straight, because it covers more ground every second. Starting from rest at x = 0, its position is <b>x = ½at²</b>, so one point on the curve is enough to find a: rearranged, a = 2x/t². For example, if it reaches 12 m at t = 2 s, a = 2 × 12 ÷ 2² = 6 m/s².',
      how: ['Read the marked point (t, x) on the curve.', 'Use x = ½at², which holds for a start from rest at x = 0.', 'Rearrange it: a = 2x/t².'],
      watch: ['Using x/t: that is the average velocity, not the acceleration.', 'Forgetting to square the time, or forgetting the 2.'],
      tip: 'From rest, x = ½at²: put in the marked point and solve for a.',
    },
    'Acceleration from a velocity–time graph': {
      idea: 'On a velocity–time graph the <b>slope</b> is the acceleration: how many m/s the velocity changes each second. A line going up means speeding up; a line going down means slowing down, which is a negative acceleration. If the velocity goes from 4 m/s to 10 m/s in 3 s, a = (10 − 4) ÷ 3 = 2 m/s².',
      how: ['Read two points on the line.', 'Find the change in velocity: Δv = later v − earlier v.', 'Divide by the change in time: a = Δv/Δt, in m/s², keeping the sign.'],
      watch: ['Dividing one velocity by one time when the line doesn’t start at v = 0.', 'Losing the minus sign for a line that slopes down.'],
      tip: 'Acceleration is the slope of the v–t graph: change in velocity divided by change in time.',
    },
    'Displacement from the area under a v–t graph': {
      idea: 'Velocity × time is distance, so on a v–t graph the <b>area</b> under the line is how far the object travels (its displacement, while the line stays above the axis). When the line slopes, the area between two times is a trapezoid: the average of the two velocities times the time between them. Going from 3 m/s at t = 2 s to 7 m/s at t = 4 s covers (3 + 7) ÷ 2 × 2 = 10 m.',
      how: ['Read the velocities at the two times.', 'Average them: (v<sub>1</sub> + v<sub>2</sub>) ÷ 2.', 'Multiply by the time between them.'],
      watch: ['Multiplying just one of the velocities by the time: the velocity changes, so use the average.', 'Measuring the area from t = 0 instead of from the first time in the question.'],
      tip: 'Find the area under the v–t line between the two times: it is a trapezoid.',
    },
    'Total distance from a v–t graph': {
      idea: 'A trip that speeds up, cruises and then brakes makes a flat-topped shape on a v–t graph, and the total distance is its whole <b>area</b>. Split it into easy shapes: a triangle while speeding up (½ × time × top speed), a rectangle while cruising (time × speed) and a triangle while braking. For 2 s up to 9 m/s, 3 s at 9 m/s and 2 s down: 9 + 27 + 9 = 45 m.',
      how: ['Split the area under the graph into a triangle, a rectangle and a triangle.', 'Each triangle: ½ × how long that part lasts × the top speed.', 'The rectangle: how long the cruise lasts × the speed.', 'Add the three areas.'],
      watch: ['Forgetting the ½ for the triangles.', 'Using the time where a part ends on the axis instead of how long that part lasts.'],
      tip: 'The total distance is the whole area under the v–t graph: split it into triangles and a rectangle.',
    },
    'Average velocity from a v–t graph': {
      idea: 'Average velocity is the total displacement divided by the total time. On a v–t graph the displacement is the area under the line, so first find the whole area, then divide it by how long the trip takes. A trip with an area of 50 m that takes 10 s has an average velocity of 5 m/s, less than its top speed, because part of the time was spent speeding up and slowing down.',
      how: ['Find the total area under the graph (triangle + rectangle + triangle).', 'Read the total time, where the trip ends on the time axis.', 'Divide the area by the total time.'],
      watch: ['Giving the top speed, or the average of the speeds on the graph, as the average velocity.', 'Dividing by only the cruising time instead of the whole trip.'],
      tip: 'Average velocity = the whole area under the v–t graph divided by the whole time.',
    },
    'Two objects on one v–t graph': {
      idea: 'With two lines on one v–t graph, the point where they cross is the moment both have the <b>same velocity</b>, not where the two objects meet. Here car A cruises at a steady speed while car B starts from rest with velocity a·t, so the speeds match when a·t equals A’s speed. Until then A is faster and pulls ahead, and the gap equals the area between the two lines up to that moment: A’s distance minus B’s.',
      how: ['Find when the speeds are equal: set a·t equal to A’s speed and solve for t.', 'A’s distance by then: its speed × t.', 'B’s distance by then: ½ × a × t².', 'The gap is A’s distance minus B’s (the area between the lines).'],
      watch: ['Thinking the crossing point is where the cars meet: it is only where their speeds are equal.', 'Forgetting the ½ in B’s distance.'],
      tip: 'The lines cross when the speeds are equal; the gap is the area between the two lines up to that time.',
    },
    'Velocity from an acceleration–time graph': {
      idea: 'On an acceleration–time graph the <b>area</b> under the line is the change in velocity, because acceleration × time = change in velocity. A flat line at 3 m/s² for 2 s adds 3 × 2 = 6 m/s, while a line below the axis takes velocity away. Then add that change to the starting velocity: starting at 1 m/s, it ends at 1 + 6 = 7 m/s.',
      how: ['Read the acceleration (the height of the line) and how long it lasts.', 'Change in velocity: Δv = a × t (the area).', 'Final velocity = starting velocity + Δv, keeping the sign of a.'],
      watch: ['Giving Δv and forgetting to add the starting velocity.', 'Adding when the acceleration is negative: then the velocity goes down.'],
      tip: 'The area under the a–t graph is the change in velocity: add it to the starting velocity.',
    },
    'Braking distance': {
      idea: 'A car braking steadily loses the same speed every second until it stops. With final speed v = 0, the equation <b>v² = v₀² + 2aΔx</b> (a is negative, since it slows down) gives the braking distance Δx = v₀² ÷ (2 × the deceleration). On the v–t graph it is the area of the triangle: ½ × stopping time × starting speed. A car at 8 m/s braking at 2 m/s² stops in 64 ÷ (2 × 2) = 16 m.',
      how: ['Square the starting speed.', 'Divide by 2 × the deceleration: Δx = v₀² ÷ (2 × deceleration).', 'Check with the graph: ½ × (v₀ ÷ deceleration) × v₀ gives the same area.'],
      watch: ['Forgetting to square the speed, or forgetting the 2.', 'Putting a in as a negative number and getting a negative distance: in v₀² ÷ (2 × deceleration), use the size of the deceleration.'],
      tip: 'The car ends at 0 m/s, so use v² = v₀² + 2aΔx (a is negative), or the area of the triangle under the v–t graph.',
    },
    'Free fall': {
      idea: 'Without air resistance, anything dropped from rest speeds up by <b>g = 9.8 m/s²</b>: it gains 9.8 m/s of speed every second, so its speed after t seconds is v = g·t. Its distance grows faster, as the square of the time: d = ½·g·t². After 7 s, a dropped stone falls at 9.8 × 7 = 68.6 m/s and has fallen ½ × 9.8 × 7² = 240.1 m.',
      how: ['Check whether the question asks how fast (speed) or how far (distance).', 'Speed from rest: v = 9.8 × t.', 'Distance from rest: d = ½ × 9.8 × t², squaring the time first.'],
      watch: ['Using v = g·t when the question asks how far it fell.', 'Forgetting the ½ or forgetting to square the time.'],
      tip: 'From rest, speed is 9.8 × t, and distance fallen is ½ × 9.8 × t².',
    },
    'Thrown straight up': {
      idea: 'A ball thrown straight up slows down by 9.8 m/s every second, because gravity pulls it down. At the highest point its velocity is zero for an instant, which on the v–t graph is where the line crosses the time axis. So the time to the top is t = v<sub>0</sub>/9.8, and the height is the area of the triangle above the axis: ½ × that time × v<sub>0</sub>, which is the same as v<sub>0</sub>²/(2 × 9.8).',
      how: ['Use up as positive: the ball starts at v<sub>0</sub> and loses 9.8 m/s each second.', 'Time to the top: t = v<sub>0</sub> ÷ 9.8 (where the velocity is zero).', 'Height reached: ½ × t × v<sub>0</sub>, or v<sub>0</sub>² ÷ (2 × 9.8).'],
      watch: ['Thinking the acceleration is zero at the top: only the velocity is zero; gravity still pulls at 9.8 m/s².', 'Using the time for the whole flight (up and back down) instead of just the way up.'],
      tip: 'At the highest point the velocity is zero, which is where the v–t line crosses the time axis.',
    },
  },
};
