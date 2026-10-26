// Fluentio's settings: the colors, the look, the motion, and the words on the pages.
//
// Two ways to change them:
// On the site, Settings (the button at the top right) shows each change as you make it, but keeps it in that browser
// only. Its "Copy as settings.js" gives you a whole new version of this file.
// Here, for every device: open this file on the space branch, press the pencil, change a value (or paste that copy over
// everything), then press Commit changes. The whole site follows a minute or two later.
//
// Colors can be any CSS color: '#2f6fed', 'tomato', 'rgb(47 111 237)'. Keep the quotes and the commas.
// If something here has a typo, the site keeps working with its usual look.

window.FLUENTIO_SETTINGS = {
  // the name at the top of the home page, the line under it, and the footer
  name: 'Fluentio',
  tagline: 'Web stack workspace',
  footer: 'TrixWotel',
  greeting: true,          // a "Good morning", "Good afternoon" or "Good evening" above the name

  // 'auto' follows the device's light or dark mode, 'light' or 'dark' always uses that one
  theme: 'auto',

  colors: {
    light: {
      accent: '#2f6fed',     // buttons, links and anything selected
      accent2: '#9b5cf6',    // the second color in gradients and the drifting colors
      background: '#f6f7f9', // behind everything
      card: '#ffffff',       // cards, questions and panels
      text: '#1b1f24',
      muted: '#5b6470',      // quieter text
      line: '#e3e6ea',       // borders
      right: '#2da44e',      // right answers
      wrong: '#e5534b',      // wrong answers
      second: '#e8743b',     // the second line on graphs and drawings
    },
    dark: {
      accent: '#6c9bff',
      accent2: '#b48cff',
      background: '#0f1115',
      card: '#171a21',
      text: '#e8eaee',
      muted: '#9aa3ae',
      line: '#262b35',
      right: '#3fb950',
      wrong: '#f85149',
      second: '#f0a04b',
    },
  },

  // the world map on the Geography page
  map: {
    light: { ocean: '#d6e6f5', land: '#e4e1da', country: '#fbf8f1', border: '#9aa4b1', late: '#d4a72c' },
    dark: { ocean: '#0c1828', land: '#23272e', country: '#4d5768', border: '#151920', late: '#d29922' },
  },

  font: 'system',          // 'system', 'rounded', 'serif', 'mono', or any CSS font list
  corners: 14,             // how round cards and buttons are, in pixels (0 is square)

  animations: true,        // false turns every animation off (devices set to reduce motion never get them)
  speed: 1,                // 1 is normal, 2 is twice as fast, 0.5 is half as fast
  floatingColors: true,    // the soft colors drifting behind the pages

  // the home page's tiles, in this order (take one out to hide it): 'workspace', 'study', 'data' and 'quick'
  home: ['workspace', 'study', 'data', 'quick'],
  // the buttons on the Quick tile (a link can also be a whole web address)
  quick: [
    { title: 'New note', link: 'workspace/#new/note' },
    { title: 'New table', link: 'workspace/#new/table' },
    { title: 'Start AMC test', link: 'math/#amc10/test' },
  ],

  // the Workspace: notes, docs, tables and code, kept in your browser (Settings can back them up)
  workspaceTitle: 'Workspace',

  // the Study page: its title, the line under it, and its subjects in this order (color is the subject's own color)
  studyTitle: 'Study',
  studyIntro: 'Pick a subject. Take a test, learn it one topic at a time, or practise any question.',
  study: [
    { emoji: '🌍', title: 'Geography', text: 'Find countries and capitals on the world map, or one continent at a time.', link: 'geography/', color: '#1f9d74' },
    { emoji: '📐', title: 'Math', text: 'Triangle angles, and AMC 10 practice in 87 topics, each asked several ways.', link: 'math/', color: '#2f6fed' },
    { emoji: '🧪', title: 'Science', text: 'Heat capacity with Q = mcΔT: warming, cooling, mixing and heaters.', link: 'science/', color: '#8b5cf6' },
    { emoji: '🚀', title: 'Physics', text: 'Kinematics with motion graphs, a new graph for every question.', link: 'physics/', color: '#e8743b' },
    { emoji: '🇪🇸', title: 'Spanish', text: '1,100 words in 25 themes, and the preterite and the imperfect.', link: 'spanish/', color: '#e5484d' },
  ],
};
