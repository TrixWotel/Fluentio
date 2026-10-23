# Fluentio: Math Tests

Served at https://trixwotel.github.io/Fluentio/math/ as the math folder of the Fluentio site (see the space branch).

* **index.html** is the page.
* **triangles.js** makes the Triangle Angles questions: 11 kinds, 20 variants each (220), every one with its triangle drawn to scale. **triangles-lessons.js** is its learning path (4 units) and a short lesson for each kind.
* **amc.js** makes the AMC 10 Practice problems: 87 topics, each with 12 variants from at least three different kinds of question (1,044), with five choices. A test is 25 random problems in a random order (or as many as you choose), scored like the AMC 10 (6 points for right, 1.5 for blank), with 3 minutes a problem. Each problem has a rank, roughly where it would sit in a real AMC 10, so the list of topics puts the easier ones first.
  * **amc-classic.js** has 12 classic contest topics, and **amc-number.js**, **amc-algebra.js**, **amc-geometry.js**, **amc-counting.js** and **amc-probability.js** the 75 topics modelled on past AMC 10 ideas (2015 to 2024), with new numbers and wording. Each file is its topics, and each topic a list of question types that take turns.
  * **amc-kit.js** has what they share: the five choices, surds and fractions as choices, and family(), which takes a topic's question types in turn.
  * **amc-lessons.js** is the learning path (5 units: arithmetic and algebra, number theory, counting, probability, geometry) and a short lesson for every topic.

The test runner and the drawing code are in the space branch's kit folder.

The AMC problems are original, in the style of the contest. Real AMC problems are the MAA's copyright, so none are copied here.

## License

Apache License 2.0, see LICENSE.
