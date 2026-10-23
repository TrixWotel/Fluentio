# Fluentio

My personal web playground, live at https://trixwotel.github.io/Fluentio/

## Branches

Every branch is one part of the site. A push to any of them puts the whole site back together and deploys it with the workflow in .github/workflows/pages.yml (the same file is on every branch).

* **space** is the main page, served at the top. It also holds kit/, the test runner and question toolkit that the Math, Science and Physics tests share.
* **geography** is served at /geography: find countries or capitals on the world map, or one continent at a time.
* **math** is served at /math: Triangle Angles (220 variants) and AMC 10 Practice (340 variants).
* **science** is served at /science: Heat Capacity with Q = mcΔT (220 variants).
* **physics** is served at /physics: Kinematics with motion graphs (240 variants).

There is no build step. The files are served as they are.

## The tests

Each question is built from its variant number, so variant 137 is always the same question with the same picture. Every test has three ways in:

* **A test** picks random variants spread over every kind of question, in a random order every time. It has its usual length (25 for the AMC, 10 for the others) unless you choose another, and your best score on a full-length test stays in your browser.
* **Learning** goes one topic at a time (or mixes them), with no clock and as many tries as you need. Hints show the worked solution a step at a time, and a topic is learned after 3 right in a row on the first try without hints. What you've learned stays in your browser.
* **Practice** opens any variant by its number, with a worked solution.

Links can go straight to one: math/#amc10/test starts an AMC test (math/#amc10/test/40 one of 40 problems), physics/#kinematics/learn lists the topics to learn, and physics/#kinematics/137 opens variant 137.

The AMC 10 problems are original problems in the style of the contest. Real AMC problems are the MAA's copyright, so none are copied here.

## License

Apache License 2.0, see LICENSE. The geography map comes from Natural Earth (public domain).
