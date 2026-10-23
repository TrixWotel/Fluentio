// Vocabulary: 1,100 words in 25 themes of 44, from words.js. Every word comes up both ways, what a Spanish word means
// and how to say an English one in Spanish, with the four wrong choices from the same theme. A theme's lesson is its
// word list, with the theme's notes.
import { bank } from '../kit/bank.js';
import { THEMES } from './words.js';

// feminine nouns that take el because they start with a stressed a sound (el agua, but las aguas)
const STRESSED_A = new Set(['agua', 'águila', 'hambre', 'arma', 'alma', 'área', 'aula', 'hacha', 'ala', 'hada', 'ancla', 'ave', 'asma', 'alga', 'arpa', 'acta']);
function gender(es) {
  const [article, ...rest] = es.split(' '), noun = rest.join(' ');
  if (!rest.length || !['el', 'la', 'los', 'las'].includes(article)) return '';
  if (article === 'el' && STRESSED_A.has(noun)) return ' (feminine, but it takes el because it starts with a stressed a sound)';
  return { el: ' (masculine)', la: ' (feminine)', los: ' (masculine plural)', las: ' (feminine plural)' }[article];
}
const es = (w) => `<span lang="es">${w}</span>`;

// a theme's turns: its 44 words from Spanish, then the same 44 into Spanish
const templates = THEMES.map((theme) => (d, ctx) => {
  const n = theme.words.length, word = theme.words[ctx.k % n], toSpanish = Math.floor(ctx.k / n) % 2 === 1;
  const options = d.shuffle([word, ...d.shuffle(theme.words.filter((w) => w !== word)).slice(0, 4)]);
  return {
    topic: theme.name,
    text: toSpanish ? `How do you say <b>${word[1]}</b> in Spanish?` : `What does <b>${es(word[0])}</b> mean?`,
    answer: { kind: 'choice', choices: options.map((w) => (toSpanish ? es(w[0]) : w[1])), correct: options.indexOf(word) },
    solution: `<b>${es(word[0])}</b> means <b>${word[1]}</b>${gender(word[0])}.`,
  };
});
export const vocab = bank('vocab', templates, THEMES.length * 88);

// learning: the themes in units (the key words come early, since every other theme leans on them), each theme's lesson
// its notes and its word list (no worked example: a word list has nothing to work); a theme is learned after 8 right in
// a row
const UNITS = [
  ['Basics', ['Greetings and phrases', 'Numbers', 'Time and the calendar', 'Colors and shapes']],
  ['Key words', ['Common verbs', 'Describing things', 'Little words']],
  ['People', ['Family and people', 'The body', 'Clothes', 'Feelings and personality', 'Jobs']],
  ['Daily life', ['Food', 'Drinks and the kitchen', 'The house', 'School', 'Daily routine', 'Health']],
  ['The world', ['Animals', 'Nature and weather', 'The city', 'Travel and transport', 'Shopping and money', 'Sports and free time', 'Technology and media']],
];
const table = (words) => `<table class="data words"><thead><tr><th>Spanish</th><th>English</th></tr></thead><tbody>${
  words.map(([s, e]) => `<tr><td lang="es">${s}</td><td>${e}</td></tr>`).join('')}</tbody></table>`;
export const vocabLearning = {
  goal: 8, example: false,
  path: UNITS.map(([unit, topics]) => ({ unit, topics })),
  lessons: Object.fromEntries(THEMES.map((t) => [t.name, {
    idea: `<p>${t.notes.intro}</p>${table(t.words)}`, how: t.notes.how, watch: t.notes.watch, tip: t.notes.tip,
  }])),
};
