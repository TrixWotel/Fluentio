// Learning Motion in a Straight Line: the path (speeding up and slowing down, then up and down, then v–t graphs) and
// a short lesson for every topic: the idea, how to do it, what to watch out for, and a tip after a wrong answer.
export const motionLearning = {
  path: [
    { unit: 'Speeding up and slowing down', topics: ['Speeding up from rest', 'Between two checkpoints', 'Using the average speed', 'Equal times, three points', 'A trip in three stages'] },
    { unit: 'Up and down', topics: ['Thrown down from a height', 'Up to the highest point', 'Thrown up and caught', 'Thrown up from above the ground', 'Bouncing back up'] },
    { unit: 'Velocity–time graphs', topics: ['Distance and displacement from a v–t graph', 'Reading a four-part v–t graph'] },
  ],
  lessons: {
    'Speeding up from rest': {
      idea: '<p>Starting from rest with a steady acceleration, s = ½at². So if you know how far it went in a certain time, you know the acceleration: a = 2s ÷ t².</p><p>A skier who slides 9 m in 3 s has a = 2 × 9 ÷ 9 = 2 m/s². Then v = at gives the time to any speed (24 m/s takes 12 s), and v² = 2as the distance to reach it.</p>',
      how: ['From the first distance and time: a = 2s ÷ t².', 'Speed after a time: v = at.', 'Time to reach a speed: t = v ÷ a.', 'Distance to reach a speed: s = v² ÷ 2a.'],
      watch: ['Using a = s ÷ t (that\'s an average speed, not an acceleration).', 'Forgetting the ½ in s = ½at².'],
      tip: 'From rest, a = 2s ÷ t². Then v = at and v² = 2as.',
    },
    'Between two checkpoints': {
      idea: '<p>With a steady acceleration, the average speed between two points is halfway between the speeds there: s = ½(u + v)t. With s = ut + ½at² as well, any two of the speeds, the distance and the time give the rest.</p><p>30 m in 4 s, starting at 5 m/s: v = 2 × 30 ÷ 4 − 5 = 10 m/s, so a = (10 − 5) ÷ 4 = 1.25 m/s².</p>',
      how: ['List what you know: s, t, u, v.', 'For a speed: s = ½(u + v)t.', 'For the acceleration: s = ut + ½at², or a = (v − u) ÷ t once you have v.', 'For the time: t = 2s ÷ (u + v).'],
      watch: ['Dividing the distance by the time and calling it the final speed: that\'s the average speed.'],
      tip: 'Steady acceleration: distance = ½(u + v) × time, and a = (v − u) ÷ t.',
    },
    'Using the average speed': {
      idea: '<p>When the acceleration is steady, the speed changes evenly, so the average speed is just halfway between the first and last speeds. That makes s = ½(u + v)t, which skips the acceleration altogether.</p><p>Braking from 20 m/s to rest, the average speed is 10 m/s, so stopping in 50 m takes 5 s.</p>',
      how: ['Average speed = ½(u + v).', 'Distance = average speed × time.', 'Time = distance ÷ average speed.', 'Final speed = 2s ÷ t − u.'],
      watch: ['Using this when the acceleration isn\'t steady.', 'Forgetting that stopping means v = 0.'],
      tip: 'With a steady acceleration, average speed = ½(u + v), and s = average speed × t.',
    },
    'Equal times, three points': {
      idea: '<p>Passing A, B and C with equal times t for AB and BC, the second stretch is longer by exactly at² (it\'s going faster). And B, being halfway in time, is passed at the average speed over the whole trip: (AB + BC) ÷ 2t.</p><p>If you know B\'s speed and how the distances compare, write AB = v<sub>B</sub>t − ½at² and BC = v<sub>B</sub>t + ½at², then solve for a.</p>',
      how: ['From the distances: a = (BC − AB) ÷ t².', 'Speed at B: (AB + BC) ÷ 2t.', 'Speed at A: v<sub>B</sub> − at. At C: v<sub>B</sub> + at.', 'From a ratio and v<sub>B</sub>: set up AB = v<sub>B</sub>t − ½at² and BC = v<sub>B</sub>t + ½at².'],
      watch: ['Using + ½at² for AB too: before B it was slower, so AB is shorter.'],
      tip: 'In equal times, the distances differ by at², and the middle point is passed at the average speed.',
    },
    'A trip in three stages': {
      idea: '<p>Speed up, cruise, brake. The cruise is the easy part: top speed = cruise distance ÷ cruise time. Then v² = 2as gives the acceleration from the speeding-up distance, and v = at the times.</p><p>Braking twice as hard as it sped up, it stops in half the time and half the distance.</p>',
      how: ['Top speed V = cruise distance ÷ cruise time.', 'Acceleration: a = V² ÷ (2 × speeding-up distance).', 'Speeding up takes V ÷ a, braking at ka takes V ÷ ka.', 'Add the three parts for the total time or distance.'],
      watch: ['Using the whole trip\'s distance to find the acceleration.', 'Forgetting the braking part in the total.'],
      tip: 'The steady part gives the top speed. From there, v² = 2as and v = at for each changing part.',
    },
    'Thrown down from a height': {
      idea: '<p>Thrown down, it already has a speed u, and gravity adds 9.8 m/s every second. Take down as positive: v² = u² + 2gh for the speed at the bottom, and v = u + gt for the time.</p><p>Thrown down at 8.4 m/s from 5 m: v = √(8.4² + 98) = 13.0 m/s, after (13.0 − 8.4) ÷ 9.8 = 0.47 s.</p>',
      how: ['Pick down as positive.', 'Landing speed: v = √(u² + 2gh).', 'Time: t = (v − u) ÷ g.', 'Height from the two speeds: h = (v² − u²) ÷ 2g.'],
      watch: ['Using the drop formula t = √(2h/g): that\'s only for starting at rest.', 'Mixing signs: if down is positive, u and g are both positive.'],
      tip: 'Down positive: v² = u² + 2gh, then t = (v − u) ÷ g.',
    },
    'Up to the highest point': {
      idea: '<p>Going straight up, gravity takes away 9.8 m/s every second, and at the top the velocity is zero. So the launch speed is 9.8 × the time to the top, and the height is ½gt² (the same as falling from the top for that time).</p><p>Reaching the top after 3 s: thrown at 29.4 m/s, to a height of 44.1 m.</p>',
      how: ['At the top, v = 0.', 'Launch speed: u = g × (time to the top), or √(2gH).', 'Height: H = ½g × (time to the top)², or u² ÷ 2g.', 'Time to the top: u ÷ g, or √(2H/g).'],
      watch: ['Thinking the acceleration is zero at the top: only the velocity is.'],
      tip: 'At the top v = 0: u = gt and H = ½gt² = u² ÷ 2g.',
    },
    'Thrown up and caught': {
      idea: '<p>Thrown up at u, it passes any height below its top twice: once going up and once coming down, at the same speed √(u² − 2gh) both times.</p><p>For the times, h = ut − ½gt² is a quadratic with two roots: the smaller one on the way up, the larger on the way down. Thrown at 20 m/s and caught 5 m up on the way down: it is caught at 17.4 m/s after 3.8 s.</p>',
      how: ['Speed at height h: √(u² − 2gh) (moving up or down).', 'Times at height h: t = (u ∓ √(u² − 2gh)) ÷ g.', 'Caught on the way down: the later time. Passing on the way up: the earlier one.', 'Below where it started: v = √(u² + 2gh).'],
      watch: ['Taking the wrong root of the quadratic.', 'Using v² = u² + 2gh above the start: going up, gravity takes speed away.'],
      tip: 'h = ut − ½gt² has two roots: the first is on the way up, the second on the way down.',
    },
    'Thrown up from above the ground': {
      idea: '<p>Projected up from a height h₀, it rises u² ÷ 2g above that point, so its highest point above the ground is h₀ + u² ÷ 2g. The ground is h₀ below the start: put that into the height equation to find when it lands.</p><p>For the time spent above some level, find the two times it is at that level: the gap between them is 2√(u² − 2gd) ÷ g, where d is how far that level is above the start.</p>',
      how: ['Greatest height above the ground: h₀ + u² ÷ 2g.', 'Time to the ground: −h₀ = ut − ½gt², the positive root.', 'Speed at the ground: √(u² + 2gh₀).', 'Time above a level d above the start: 2√(u² − 2gd) ÷ g.'],
      watch: ['Forgetting to add the starting height.', 'Measuring the level from the ground instead of from the start.'],
      tip: 'Measure everything from the starting point, then add h₀ for heights above the ground.',
    },
    'Bouncing back up': {
      idea: '<p>After a bounce, the ball leaves the ground with some speed and rises like anything thrown up: height = v² ÷ 2g, time to the top = v ÷ g.</p><p>The bounce itself is a big change in velocity in a tiny time. Hitting at 13 m/s down and leaving at 4.2 m/s up is a change of 17.2 m/s, in 20 ms that\'s an average acceleration of 860 m/s².</p>',
      how: ['Rebound height: H = v² ÷ 2g. Rebound speed: v = √(2gH).', 'Time to the top of the bounce: v ÷ g.', 'Change in velocity at the bounce: impact speed + rebound speed (it reverses).', 'Average acceleration = that change ÷ the contact time (in seconds).'],
      watch: ['Subtracting the speeds at the bounce: the direction flips, so they add.', 'Leaving the contact time in milliseconds.'],
      tip: 'At a bounce the velocity reverses, so the change is impact speed + rebound speed.',
    },
    'Distance and displacement from a v–t graph': {
      idea: '<p>The area between a v–t graph and the time axis is how far it moved. Area above the axis is moving forward (or down, if down is positive), area below is moving back.</p><p><b>Distance</b> adds all the area. <b>Displacement</b> subtracts the area below the axis. A ball that falls 5.9 m and bounces up 4.1 m has gone 10 m in all, but ends up 1.8 m below its start.</p>',
      how: ['Split the graph into triangles and rectangles.', 'Find each area: ½ × base × height, or base × height.', 'Distance: add every area.', 'Displacement: add the areas above, subtract the ones below.'],
      watch: ['Subtracting when the question asks for distance.', 'Reading the gradient (that\'s the acceleration) when you need the area.'],
      tip: 'Area = how far. Distance counts all of it, displacement takes away the part below the axis.',
    },
    'Reading a four-part v–t graph': {
      idea: '<p>Each straight part tells you something: its slope is the acceleration, and the area under it is the distance. With a letter for an unknown speed or time, write the areas in terms of it and use whatever the question says about them.</p><p>If the distance before the steady part is a third of the total, then the distance after it is twice the distance before. That gives one equation for V.</p>',
      how: ['Slope of a part: change in v ÷ time it takes.', 'Area of each part: triangles and trapezia.', 'Turn the question\'s condition into an equation between the areas.', 'Solve for the unknown.'],
      watch: ['Treating a trapezium as a triangle.', 'Turning "one third of the total" into "one third of the rest".'],
      tip: 'Slopes are accelerations, areas are distances. Write each area with the unknown, then use the condition.',
    },
  },
};
