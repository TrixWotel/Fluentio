# Fluentio

My personal web playground, live at https://trixwotel.github.io/Fluentio/

## Branches

Every branch is one part of the site. A push to any of them puts the whole site back together and deploys it with the workflow in .github/workflows/pages.yml (the same file is on every branch).

* **space** is served at the top: the home page, Modules (study/), Data, Code and Notes (data/, code/ and notes/, one app kept in workspace/) and Settings (settings/). It also holds settings.js (see below) and kit/: the look and the bar every page shares, and the test runner and question toolkit that the Math, Science, Physics and Spanish tests share.
* **geography** is served at /geography: find countries or capitals on the world map, or one continent at a time.
* **math** is served at /math: Triangle Angles (220 variants) and AMC 10 Practice (1,404 variants, 117 topics, from problem 1 hard to problem 25 hard).
* **science** is served at /science: Heat Capacity with Q = mcΔT (220 variants).
* **physics** is served at /physics: Kinematics with motion graphs (280 variants), Motion in a Straight Line (240), Vectors (240) and Projectile Motion (260).
* **spanish** is served at /spanish: Vocabulary (1,100 words in 25 themes, 2,200 variants), the Preterite (270 variants) and the Imperfect (180 variants).

There is no build step. The files are served as they are.

## The pages

Every page has the same bar at the top: Home, Modules, Data, Code and Notes, Search, and Settings.

* **Home** has a tile for each part: Recent (what you worked on last in Data, Code and Notes), Modules (Continue, with the topic you were learning and how far along that test you are), Data (your sheets) and Quick (a row of buttons from settings.js).
* **Modules** lists the subjects, with what you've learned and your best scores in each.
* **Data**, **Code** and **Notes** are where your own things live, each a space of its own in the bar (one app, in workspace/). **Notes** keeps Markdown notes in folders, where [[a note's name]] links to another note and the right side shows the outline and the links both ways. **Data** holds databases (one can hold more), each with its docs and sheets. A doc is your own writing, with a Google Docs, Slides or Sheets link to open beside it, and a sheet takes CSV in and out and shows each column's numbers. **Code** keeps files in HTML, CSS, JavaScript, Python, Java and C++, in folders too, with their words in color. JavaScript and Python run right there (Python with Pyodide, which downloads the first time it runs), an HTML page shows in a preview with the CSS and JavaScript files it links, and Java and C++ download to run on a computer. Everything shows as cards, folders and databases first: drag a card onto a folder to move it, or drop files from your computer to add them. Each space's View menu sorts its cards and turns its own animations off. All of it stays in your browser, never in this repo. Settings → GitHub can also save it to a private repo of yours (TrixWotel/Database) as files laid out like its folders, so every browser and Fluent workspace connected to it shows the same things, and Settings downloads a backup too. A link from when they were the Workspace goes on to where that thing is now.
* **Settings** picks a theme (Fluentio, Fluent with the Fluent browser's own pure black look, or GitHub with GitHub's colors) or changes each part of the look: the colors (or a ready-made pair), light or dark, the style, font, corners, motion (with Data, Code and Notes each on their own), the home page's tiles and buttons, and the names. Each change shows straight away and stays in that browser. Copy as settings.js turns them into a new settings.js to paste here for every device. Settings also downloads and restores a backup of everything Fluentio keeps in the browser, and connects Data, Code and Notes to a private GitHub repo (a token that can only read and write that repo stays in the browser, never in a backup).

Keys: ⌃K (or /) searches everything, and ⌃1 to ⌃5 go to Home, Modules, Data, Code and Notes (on Windows and Linux, Alt with the number). Settings → Keys can change each one: click it and press the new key.

## Settings

**settings.js**, at the top of the space branch, holds the colors and settings for the whole site. To change one on GitHub, open the file, press the pencil, change a value and press Commit changes. The site follows a minute or two later. (Or try changes in Settings on the site first, then paste its Copy as settings.js here.)

* **name**, **tagline** and **footer** are the words at the top of the home page and at the bottom of the pages, and **greeting** turns the "Good morning" above the name on or off.
* **theme** is 'auto' (the device's light or dark mode), 'light' or 'dark'.
* **colors** has a light set and a dark set: the accent (buttons, links and anything selected), a second color for gradients, the background, cards, text, quieter text, borders, right and wrong answers, and the second line on graphs. Any CSS color works, like '#2f6fed' or 'tomato'.
* **map** is the colors of the Geography map, light and dark.
* **font** is 'system', 'rounded', 'serif', 'mono' or any CSS font list, and **corners** is how round the cards and buttons are, in pixels.
* **style** is 'glow' (soft shadows, glowing edges and gradients) or 'flat' (borders and solid colors, like GitHub).
* **textSize** is how big the words are, in pixels (12 to 20).
* **keys** are the keys for search, home, study (Modules), data, code and notes, written like 'Ctrl+K' (Ctrl, Alt, Shift or Meta with a key, Meta being ⌘ on a Mac). An empty one ('') turns that key off.
* **animations** turns every animation on or off, **speed** makes them faster (2) or slower (0.5), and **floatingColors** turns the soft colors drifting behind the pages on or off. **animationsIn** turns the animations in Data, Code and Notes on or off, each on its own. A device set to reduce motion never gets the animations.
* **home** is the home page's tiles in order ('workspace' for Recent, 'study', 'data' and 'quick'), and **quick** the Quick tile's buttons, each a title and a link.
* **dataTitle**, **codeTitle** and **notesTitle** are the names of Data, Code and Notes. **studyTitle**, **studyIntro** and **study** are Modules (the study/ page): its title, the line under it, and the subjects in order, each with an emoji, its words, a link and its own color.

A typo can't break the site. Anything missing or mistyped falls back to the usual look.

## How it looks and moves

kit/look.js puts settings.js (and what Settings changed in that browser) on each page before the page is drawn, and kit/bar.js adds the bar, Search and the keys. kit/site.css is the look every page shares: the colors drifting behind the page (they carry on from one page to the next), cards that lift and glow under the pointer, buttons, page transitions, and the animations the pages share. kit/tests.css is the test pages' own layout, where questions rise in, a right choice bumps and a wrong one shakes, hints fade in a sentence at a time, and graphs draw themselves.

## The tests

Each question is built from its variant number, so variant 137 is always the same question with the same picture. Every test has three ways in:

* **A test** picks random variants spread over every kind of question, in a random order every time. It has its usual length (25 for the AMC, 10 for the others) unless you choose another, and your best score on a full-length test stays in your browser. An AMC test comes in three kinds: like the real AMC 10 (easier problems first, so question 1 is about as hard as problem 1 and the last as hard as problem 25), harder problems only (like numbers 16 to 25), or mixed (every level in a random order), each with its own best score. Afterwards the score page shows how each unit went and what to work on, each topic a link to its lesson.
* **Learning** follows a path: the topics in units, in an order where each builds on the ones before, so Continue always takes you to the next one. Each topic is a short lesson (how to spot it, the idea, how to do it, the facts worth knowing by heart, what to watch out for), a worked example shown a step at a time, then practice with no clock and as many tries as you need. The first hint, like a wrong answer, gives the lesson's tip, and the next hints show the working a step at a time. A topic is learned after 3 right in a row on the first try without hints. Progress is saved in your browser unless you turn that off.
* **Practice** opens any variant by its number, with a worked solution.

Links can go straight to one: math/#amc10/test starts an AMC test (math/#amc10/test/40 one of 40 problems, math/#amc10/test/hard the harder problems), physics/#kinematics/learn shows the learning path, and physics/#kinematics/137 opens variant 137.

The AMC 10 problems are original problems in the style of the contest. Real AMC problems are the MAA's copyright, so none are copied here.

## License

Apache License 2.0, see LICENSE. The geography map comes from Natural Earth (public domain).
