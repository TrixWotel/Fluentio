# Fluentio: Math Tests

Served at https://trixwotel.github.io/Fluentio/math/ as the math folder of the Fluentio site (see the space branch).

* **index.html** is the page.
* **triangles.js** makes the Triangle Angles questions: 11 kinds, 20 variants each (220), every one with its triangle drawn to scale.
* **amc.js** makes the AMC 10 Practice problems: 17 kinds, 20 variants each (340), with five choices. A test is 25 random problems in a random order (or as many as you choose), scored like the AMC 10 (6 points for right, 1.5 for blank), with 3 minutes a problem. Each problem has a rank, roughly where it would sit in a real AMC 10, so learning lists the easier topics first.
  * The first 12 kinds are classic contest topics.
  * The last 5 are families that take turns through problems modelled on past AMC 10 ideas (2015 to 2024), with new numbers and wording: **amc-number.js** (number theory), **amc-algebra.js**, **amc-geometry.js**, **amc-counting.js** and **amc-probability.js**.
  * **amc-kit.js** has what they share: the five choices, surds and fractions as choices, and families.

The test runner and the drawing code are in the space branch's kit folder.

The AMC problems are original, in the style of the contest. Real AMC problems are the MAA's copyright, so none are copied here.

## License

Apache License 2.0, see LICENSE.
