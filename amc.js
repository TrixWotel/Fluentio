// AMC 10–style practice: 87 topics, each its own kind of question with 12 variants drawn from at least three different
// question types (1,044 in all). These are original problems in the style of the AMC 10 (real past AMC problems are the
// MAA's copyright). Five choices, (A)–(E), in increasing order, the wrong ones mostly the slips people actually make.
// Each problem has a rank, roughly where it would sit in a real AMC 10 (1 to 25), so the list of topics can put the
// easier ones first. The order to learn them in is in amc-lessons.js.
// The topics live in amc-classic.js (12 classic contest topics) and in five files of topics modelled on past contest
// ideas, with new numbers and wording: amc-number.js, amc-algebra.js, amc-geometry.js, amc-counting.js and
// amc-probability.js. Each is { topic: [question types] }, and a topic's turns take its types in turn (family()).
import { bank } from '../kit/bank.js';
import { family } from './amc-kit.js';
import { classic } from './amc-classic.js';
import { numberTheory } from './amc-number.js';
import { algebra } from './amc-algebra.js';
import { geometry } from './amc-geometry.js';
import { counting } from './amc-counting.js';
import { probability } from './amc-probability.js';

const TOPICS = { ...classic, ...numberTheory, ...algebra, ...geometry, ...counting, ...probability };
export const PER_TOPIC = 12;
export const amc = bank('amc10', Object.values(TOPICS).map(family), Object.keys(TOPICS).length * PER_TOPIC);
