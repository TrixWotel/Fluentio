// Learning Projectile Motion: the path (launched sideways, then launched at an angle, then other situations) and a
// short lesson for every topic: the idea, how to do it, what to watch out for, and a tip after a wrong answer.
export const projectilesLearning = {
  path: [
    { unit: 'Launched sideways', topics: [
      'Launched sideways: time in the air', 'Launched sideways: how far it lands', 'Launched sideways: how it lands',
      'Launched sideways: the speed from where it lands', 'Clearing a ledge',
    ] },
    { unit: 'Launched at an angle', topics: ['Launch speed in parts', 'Time of flight on level ground', 'Maximum height', 'Range on level ground', 'Where it is partway'] },
    { unit: 'More situations', topics: ['Straight up, then down', 'Launched from a height at an angle', 'Into a tank, in terms of g and D'] },
  ],
  lessons: {
    'Launched sideways: time in the air': {
      idea: '<p>Something launched horizontally starts with <b>no vertical velocity</b>, so it falls exactly like something dropped from the same height. Its sideways speed makes it land farther away, but not sooner or later.</p><p>From a 1.25 m table: h = ½gt², so t = √(2h/g) = √(2 × 1.25 / 9.8) = 0.51 s, whether it rolls off slowly or fast.</p>',
      how: ['Find the height it falls.', 't = √(2h/g), with g = 9.8 m/s².', 'Ignore the sideways speed for the time.', 'Going the other way, the height is h = ½gt².'],
      watch: ['Dividing the height by the speed: the speed is sideways and the fall is down.', 'Thinking a faster ball stays up longer.'],
      tip: 'Launched sideways, the fall time is √(2h/g): the sideways speed doesn\'t change it.',
    },
    'Launched sideways: how far it lands': {
      idea: '<p>Nothing pushes it sideways in flight, so its horizontal speed stays the same the whole time. How far it lands = horizontal speed × time in the air.</p><p>At 30 m/s off an 80 m cliff: t = √(2 × 80 / 9.8) = 4.04 s, so it lands 30 × 4.04 = 121 m out. Double the speed, double the distance. Four times the height only doubles the time (it\'s a square root), so twice as far.</p>',
      how: ['Get the time in the air from the height: t = √(2h/g).', 'Distance = horizontal speed × t.', 'For a change of speed, the distance scales with the speed. For a change of height, it scales with √(height).'],
      watch: ['Using the height in place of the time.', 'Thinking twice the height means twice as far: it\'s √2 times.'],
      tip: 'Distance across = speed across × time in the air, and the time comes from the height alone.',
    },
    'Launched sideways: how it lands': {
      idea: '<p>As it lands it has two velocities at right angles: the same horizontal speed it started with, and a vertical speed gained while falling, √(2gh) (or g × t).</p><p>Put them together: speed = √(v<sub>x</sub>² + v<sub>y</sub>²), and the angle below the horizontal is tan⁻¹(v<sub>y</sub> ÷ v<sub>x</sub>). From an 80 m cliff at 30 m/s: v<sub>y</sub> = 39.6 m/s, so it lands at 49.7 m/s, 52.9° below the horizontal.</p>',
      how: ['Vertical speed on landing: v<sub>y</sub> = √(2gh).', 'Horizontal speed on landing: the same as at launch.', 'Speed = √(v<sub>x</sub>² + v<sub>y</sub>²).', 'Angle below horizontal = tan⁻¹(v<sub>y</sub> ÷ v<sub>x</sub>).'],
      watch: ['Adding the two speeds instead of using Pythagoras.', 'Thinking the horizontal speed changes as it falls.'],
      tip: 'Landing velocity = (unchanged sideways speed) and (√(2gh) down), put together with Pythagoras.',
    },
    'Launched sideways: the speed from where it lands': {
      idea: '<p>Work backward: the height tells you the time in the air, and the landing distance divided by that time is the launch speed.</p><p>A cannon 67 m above the water hits a ship 150 m away: t = √(2 × 67 / 9.8) = 3.70 s, so it left at 150 ÷ 3.70 = 40.6 m/s. A dart that drops 5 cm on the way to a board 2.37 m away: t = 0.101 s, so it was thrown at 23.5 m/s.</p>',
      how: ['Time in the air from the drop: t = √(2h/g) (convert cm to m first).', 'Launch speed = horizontal distance ÷ t.', 'For the landing speed too: v<sub>y</sub> = gt, then Pythagoras.'],
      watch: ['Forgetting to change centimeters into meters.', 'Using the straight-line distance to the target instead of the horizontal distance.'],
      tip: 'The drop gives the time, then speed = horizontal distance ÷ time.',
    },
    'Clearing a ledge': {
      idea: '<p>To clear a ledge, something launched sideways has to travel the ledge\'s width in the time it takes to fall past it. That time comes from the height, so the slowest speed that works is width ÷ time.</p><p>A diver 9 m above a ledge 1.75 m wide: t = √(2 × 9 / 9.8) = 1.36 s, so they need at least 1.75 ÷ 1.36 = 1.29 m/s. Their weight doesn\'t matter: everything falls the same way.</p>',
      how: ['Time to fall the height: t = √(2h/g).', 'Slowest speed = width ÷ t.', 'Widest gap cleared at a given speed = speed × t.', 'To check a jump, compare speed × t with the width.'],
      watch: ['Including the weight or mass: it doesn\'t change the fall.', 'Using the height of the ledge itself instead of the drop down to it.'],
      tip: 'Clearing a ledge: speed × √(2h/g) has to be at least the width.',
    },
    'Launch speed in parts': {
      idea: '<p>Split the launch velocity into two parts at right angles. Across: v<sub>x</sub> = v cos θ, which never changes in flight. Up: v<sub>y</sub> = v sin θ, which gravity slows by 9.8 m/s every second.</p><p>Going back, the launch speed is √(v<sub>x</sub>² + v<sub>y</sub>²) and the angle is tan⁻¹(v<sub>y</sub> ÷ v<sub>x</sub>).</p>',
      how: ['Across (next to the angle): v cos θ.', 'Up (across from the angle): v sin θ.', 'From the parts: v = √(v<sub>x</sub>² + v<sub>y</sub>²), θ = tan⁻¹(v<sub>y</sub> ÷ v<sub>x</sub>).'],
      watch: ['Swapping sin and cos.', 'Adding the parts to get the speed.'],
      tip: 'Across is v cos θ, up is v sin θ, and back together it\'s Pythagoras.',
    },
    'Time of flight on level ground': {
      idea: '<p>Only the vertical motion decides how long it stays up. Gravity takes v sin θ ÷ g seconds to stop it rising, and on level ground it takes just as long to come back down, so the flight lasts 2v sin θ ÷ g.</p><p>At 40 m/s and 50°: v<sub>y</sub> = 30.6 m/s, so 3.13 s up and 6.25 s altogether. If you know the range and the horizontal speed instead, time = range ÷ v<sub>x</sub>.</p>',
      how: ['Vertical launch speed: v sin θ.', 'Time to the top: v sin θ ÷ g.', 'Time of flight on level ground: twice that.', 'Or, from the horizontal motion: t = range ÷ v cos θ.'],
      watch: ['Stopping at the time to the top when the question wants the whole flight.', 'Using the whole speed v instead of its vertical part.'],
      tip: 'Time of flight on level ground = 2 × v sin θ ÷ g.',
    },
    'Maximum height': {
      idea: '<p>At the top the vertical velocity is zero (it is still moving sideways). From v<sub>y</sub>² = u<sub>y</sub>² − 2gH, the highest point is H = (v sin θ)² ÷ 2g.</p><p>At 20 m/s and 30°: v<sub>y</sub> = 10 m/s, so H = 100 ÷ 19.6 = 5.1 m. Its speed at the top is just the horizontal part, v cos θ.</p>',
      how: ['Vertical launch speed: v sin θ.', 'H = (v sin θ)² ÷ (2g).', 'For a height you want: v<sub>y</sub> = √(2gH), then v = v<sub>y</sub> ÷ sin θ.', 'At the top, speed = v cos θ.'],
      watch: ['Saying the speed at the top is zero: only the vertical part is.', 'Using v² instead of (v sin θ)².'],
      tip: 'At the top v<sub>y</sub> = 0, so H = (v sin θ)² ÷ 2g, and the speed there is v cos θ.',
    },
    'Range on level ground': {
      idea: '<p>Range = horizontal speed × time of flight = v cos θ × 2v sin θ ÷ g = v² sin 2θ ÷ g.</p><p>sin 2θ is largest at θ = 45°, so that angle goes farthest: v² ÷ g. Angles that add to 90° (30° and 60°) give the same range. And on level ground it lands at the same speed and the same angle it was launched with.</p>',
      how: ['Time of flight: 2v sin θ ÷ g.', 'Range = v cos θ × that time (or v² sin 2θ ÷ g).', 'Farthest: at 45°, range = v² ÷ g.', 'Same range: θ and 90° − θ.'],
      watch: ['Using sin θ instead of sin 2θ in the range formula.', 'Thinking a steeper angle always goes farther.'],
      tip: 'Range = v² sin 2θ ÷ g: farthest at 45°, and the same for θ and 90° − θ.',
    },
    'Where it is partway': {
      idea: '<p>At any time t, across: x = v cos θ × t. Up: y = v sin θ × t − ½gt². Its vertical velocity then is v sin θ − gt (negative once it is coming down).</p><p>To find the height where it passes a wall, first find when it gets there, t = (distance to the wall) ÷ v cos θ, then put that time into y.</p>',
      how: ['Split the launch speed: v<sub>x</sub> = v cos θ, v<sub>y</sub> = v sin θ.', 'Across: x = v<sub>x</sub>t.', 'Up: y = v<sub>y</sub>t − 4.9t².', 'For a wall at distance X: t = X ÷ v<sub>x</sub>, then y.'],
      watch: ['Forgetting the −½gt² part of the height.', 'Using the whole speed v in x = vt.'],
      tip: 'x = v cos θ · t and y = v sin θ · t − ½gt². For a wall, find t from x first.',
    },
    'Straight up, then down': {
      idea: '<p>Thrown straight up, the trip down mirrors the trip up: the same time each way, and it comes back at the speed it left.</p><p>If it lands 1.6 s after its highest point, then it fell from rest for 1.6 s, so H = ½ × 9.8 × 1.6² = 12.5 m, and it was thrown at 9.8 × 1.6 = 15.7 m/s.</p>',
      how: ['Time up = time down, each u ÷ g.', 'Height from the time down: H = ½gt².', 'Launch speed from the time up (or down): u = gt.', 'Total time in the air: 2u ÷ g.'],
      watch: ['Using the whole flight time in H = ½gt² instead of half of it.'],
      tip: 'Up mirrors down: u = g × (time to the top), and H = ½g × (time down)².',
    },
    'Launched from a height at an angle': {
      idea: '<p>When it lands lower than it started, the way up and the way down aren\'t the same length. Use the height equation with the ground below the start: −h = v sin θ · t − ½gt², and take the positive root.</p><p>t = (v sin θ + √((v sin θ)² + 2gh)) ÷ g. Then the landing distance is v cos θ × t, and the landing speed is √(v² + 2gh).</p>',
      how: ['Write −h = v<sub>y</sub>t − 4.9t² (up positive).', 'Solve: t = (v<sub>y</sub> + √(v<sub>y</sub>² + 2gh)) ÷ g.', 'Distance = v cos θ × t.', 'Thrown downward, v<sub>y</sub> starts negative: t = (−v sin θ + √((v sin θ)² + 2gh)) ÷ g.'],
      watch: ['Using the level-ground time 2v sin θ ÷ g: it doesn\'t land at the height it started.', 'Taking the negative root of the quadratic.'],
      tip: 'Landing below the start: solve −h = v sin θ · t − ½gt² and keep the positive time.',
    },
    'Into a tank, in terms of g and D': {
      idea: '<p>At 45°, tan θ = 1 and 2v²cos²θ = v², so the path is y = x − gx²/v². To get into a tank whose near side is kD away and which is mD tall, the water must be higher than mD at the near side and lower than mD at the far side.</p><p>With k = 6 and m = 2: at x = 6D, 6D − 36gD²/v² ≥ 2D gives v ≥ 3√(gD), and at x = 7D, v ≤ 3.13√(gD).</p>',
      how: ['Write the path: y = x − gx²/v² (for 45°).', 'Near side (x = kD): y ≥ mD gives v² ≥ k²gD ÷ (k − m).', 'Far side (x = (k + 1)D): y ≤ mD gives v² ≤ (k + 1)²gD ÷ (k + 1 − m).', 'Take square roots, so each speed is a number times √(gD).'],
      watch: ['Mixing up which side gives the slowest speed (the near side) and which the fastest (the far side).', 'Forgetting the tank\'s height and using y = 0.'],
      tip: 'Clear the near rim (y ≥ the height at x = kD), drop in before the far rim (y ≤ the height at x = (k + 1)D).',
    },
  },
};
