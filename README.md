# Fluentio: Physics Tests

Served at https://trixwotel.github.io/Fluentio/physics/ as the physics folder of the Fluentio site (see the space branch).

* **index.html** is the page, with the formulas for each test and the styles for the drawings.
* **kinematics.js** makes the Kinematics questions: 14 kinds, 20 variants each (280), and every variant draws its own motion graph (position, velocity or acceleration against time).
* **motion.js** makes Motion in a Straight Line: 12 topics, 20 variants each (240), all with constant acceleration. Speeding up and braking, checkpoints, trips in stages, throwing things down and up (and catching them), bounces, and v–t graphs read for distance and displacement.
* **vectors.js** makes Vectors: 12 topics, 20 variants each (240). Scalars and vectors, components, sizes and directions, i and j, adding and subtracting, the balancing vector, distance and displacement, river crossings and crosswinds. Most variants draw their vectors to scale.
* **projectiles.js** makes Projectile Motion: 13 topics, 20 variants each (260). Things launched sideways (time in the air, how far, how they land, the speed from where they land, clearing a ledge) and at an angle (components, time of flight, highest point, range, where they are partway), straight up and down, from a height at an angle, and into a tank, in terms of g and D. Most variants draw the scene to scale.
* **kinematics-lessons.js**, **motion-lessons.js**, **vectors-lessons.js** and **projectiles-lessons.js** are each test's learning path (its units, in order) and a short lesson for every topic.
* **draw.js** draws what the kit's graphs don't: arrows on a grid where a step is as long across as up, and projectile scenes with cliffs, ledges, walls and tanks, and lengths marked along the edges.

Every topic asks in at least three different ways (a different situation, or a different thing to find). Motion in a Straight Line and Projectile Motion follow the skills in two Advanced Science problem sets (rectilinear and two dimensional kinematics) with new numbers and wording, so nothing is copied from them.

The test runner and the graph drawing are in the space branch's kit folder. The colors and the rest of the look come from its settings.js.

## License

Apache License 2.0, see LICENSE.
