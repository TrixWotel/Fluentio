// The Middle Ages: 14 topics from the fall of Rome to the printing press, 20 variants each (280), asked nine ways: choose
// the answer, type a name or a word, type the year, put events in order, match people and words to what they were,
// true or false, choose all that fit, the odd one out, and the century. The facts are in middle-ages-data.js. Original
// questions; every date is the usual one in school histories.
import { bank } from '../kit/bank.js';
import { TOPICS, near } from './middle-ages-data.js';

export { TOPICS };
const TIMELINE = TOPICS.flatMap((t) => t.events);
const ordinal = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][n % 10] || 'th');
const century = (y) => Math.floor((y - 1) / 100) + 1;
const listing = (xs) => (xs.length < 2 ? xs.join('') : `${xs.slice(0, -1).join(', ')} and ${xs.at(-1)}`);
const lower = (s) => s.replace(/^The /, 'the ');
// a choice question: the right answer among the wrong ones, in an order from the dice
const choice = (d, right, wrong) => {
  const all = d.shuffle([right, ...wrong]);
  return { kind: 'choice', choices: all, correct: all.indexOf(right) };
};
// a typed year: the year alone, or with AD or CE
const yearAnswer = (y) => ({ kind: 'text', accept: [String(y), `${y} AD`, `AD ${y}`, `${y} CE`, `in ${y}`] });
// events from the whole timeline, at least `gap` years from each other and from the ones given
function spread(d, given, count, gap = 15) {
  const out = [...given];
  for (const e of d.shuffle(TIMELINE)) if (out.length < count && out.every((p) => Math.abs(p.y - e.y) >= gap)) out.push(e);
  return out;
}

// the ways a topic asks, in turn (twice round in its 20 variants); a topic without dates (feudalism) asks without them
const DATED = ['fact', 'typed', 'order', 'match', 'year', 'tf', 'multi', 'fact', 'century', 'odd'];
const UNDATED = ['fact', 'typed', 'match', 'tf', 'multi', 'odd', 'fact', 'typed', 'tf', 'multi'];
const ASK = {
  // a question with five choices, and why the answer is right
  fact(d, topic, turn) {
    const [q, right, wrong, why] = topic.facts[turn % topic.facts.length];
    return { text: q, answer: choice(d, right, wrong), solution: `${why} The answer is <b>${right}</b>.` };
  },
  // type a name, a place or a word
  typed(d, topic, turn) {
    const [q, accept, why] = topic.typed[turn % topic.typed.length];
    return { text: `${q} <span class="muted">Type your answer.</span>`, answer: { kind: 'text', accept }, solution: `${why} The answer is <b>${accept[0]}</b>.` };
  },
  // type the year of one of the topic's events
  year(d, topic, turn) {
    const event = topic.events[turn % topic.events.length];
    const other = TIMELINE.filter((e) => e.y !== event.y).sort((a, b) => Math.abs(a.y - event.y) - Math.abs(b.y - event.y))[0];
    return { text: `In what year ${event.ask}? <span class="muted">Type the year.</span>`, answer: yearAnswer(event.y),
      tip: 'Place it in its century first, then think which events on the timeline came just before and after it.',
      solution: `It was in the ${ordinal(century(event.y))} century. The closest other date here is ${other.y} (${other.label}), ${Math.abs(other.y - event.y)} years ${other.y < event.y ? 'before' : 'after'}. The year was <b>${event.y}</b>.` };
  },
  // put four or five events in order, one of them the topic's own
  order(d, topic, turn) {
    const own = topic.events[turn % topic.events.length], events = spread(d, [own], turn % 2 ? 5 : 4);
    const sorted = events.slice().sort((a, b) => a.y - b.y);
    let picked;
    do picked = d.shuffle(events); while (picked.every((e, i) => e === sorted[i]));   // never shown already in order
    return { text: 'Put these events in order, the earliest first. <span class="muted">Tap them in order.</span>',
      answer: { kind: 'order', items: picked.map((e) => e.label), correct: sorted.map((e) => picked.indexOf(e)) },
      tip: 'Put each event in its century first, then compare the ones in the same century.',
      solution: `In order: ${sorted.map((e) => `<b>${e.label}</b> (${e.y})`).join(', ')}.` };
  },
  // match four of the topic's people, places and words to what they were
  match(d, topic, turn) {
    const start = (turn * 2) % topic.pairs.length, four = d.shuffle([0, 1, 2, 3].map((i) => topic.pairs[(start + i) % topic.pairs.length]));
    const right = d.shuffle(four.map((p) => p[1]));
    return { text: `Match each one to what it was. <span class="muted">${topic.name}.</span>`,
      answer: { kind: 'match', left: four.map((p) => p[0]), right, correct: four.map((p) => right.indexOf(p[1])) },
      tip: 'Start with the ones you’re surest of: the last one is then the one left over.',
      solution: four.map(([a, b]) => `${a} → ${b}.`).join(' ') };
  },
  // true or false: an event's year, or which of two came first (feudalism: a statement about it)
  tf(d, topic, turn) {
    const TF = ['True', 'False'];
    if (!topic.events.length) {
      const [s, yes, why] = topic.tf[turn % topic.tf.length];
      return { text: `True or false? ${s}`, answer: { kind: 'choice', choices: TF, correct: yes ? 0 : 1 }, solution: `${why} So it’s <b>${yes ? 'true' : 'false'}</b>.` };
    }
    const event = topic.events[turn % topic.events.length];
    if (turn % 2 === 0) {
      const yes = d.chance(0.5), shownYear = yes ? event.y : event.y + d.pick([-1, 1]) * d.pick([20, 50, 100, 150]);
      return { text: `True or false? <b>${shownYear}</b>: ${event.label}.`, answer: { kind: 'choice', choices: TF, correct: yes ? 0 : 1 },
        tip: 'Think what else was happening in that century, and whether this fits.',
        solution: `It was in ${event.y}${yes ? '' : `, not ${shownYear}`}. So it’s <b>${yes ? 'true' : 'false'}</b>.` };
    }
    const [, other] = spread(d, [event], 2, 20), first = d.chance(0.5) ? [event, other] : [other, event], yes = first[0].y < first[1].y;
    return { text: `True or false? ${first[0].label} came before ${lower(first[1].label)}.`, answer: { kind: 'choice', choices: TF, correct: yes ? 0 : 1 },
      tip: 'Put each one in its century first.',
      solution: `The dates are ${first[0].y} for “${first[0].label}” and ${first[1].y} for “${first[1].label}”. So it’s <b>${yes ? 'true' : 'false'}</b>.` };
  },
  // choose all that fit: the right ones among three or so wrong ones
  multi(d, topic, turn) {
    const [q, rights, wrongs, why] = topic.multi[turn % topic.multi.length];
    const all = d.shuffle([...rights, ...wrongs]);
    return { text: q, answer: { kind: 'multi', choices: all, correct: rights.map((r) => all.indexOf(r)).sort((a, b) => a - b) },
      tip: 'Check each one on its own: does it really belong here? More than one can be right.',
      solution: `${why} So the ones to choose are ${listing(rights.map((r) => `<b>“${r}”</b>`))}.` };
  },
  // the odd one out: three of the topic's people, places or words, and one from a topic far from it
  odd(d, topic, turn) {
    const others = TOPICS.filter((t) => !near(t.name, topic.name)), from = others[(turn * 5 + topic.name.length) % others.length];
    const outsider = d.pick(from.pairs), three = d.shuffle(topic.pairs).slice(0, 3), all = d.shuffle([...three, outsider]);
    return { text: `Three of these belong to <b>${lower(topic.name)}</b>. Which one doesn’t?`, answer: { kind: 'choice', choices: all.map((p) => p[0]), correct: all.indexOf(outsider) },
      tip: 'Say what each one is famous for, then which part of the Middle Ages that belongs to.',
      solution: `${three.map(([a, b]) => `${a} → ${b}.`).join(' ')} But ${outsider[0]} belongs to ${lower(from.name)} (${outsider[1]}). The odd one out is <b>${outsider[0]}</b>.` };
  },
  // the century of one of the topic's events, from five in a row
  century(d, topic, turn) {
    const event = topic.events[turn % topic.events.length];
    const c = century(event.y), from = Math.max(5, Math.min(c - d.int(1, 3), 11)), list = [0, 1, 2, 3, 4].map((i) => from + i);
    const rule = event.y % 100 === 0 ? `A year ending in 00 is the last year of its century, so ${event.y} closes the ${ordinal(c)} century` : `The century is one more than the hundreds: ${Math.floor(event.y / 100)} + 1 = ${c}`;
    return { text: `In which century ${event.ask}?`, answer: { kind: 'choice', choices: list.map((x) => `The ${ordinal(x)} century`), correct: list.indexOf(c) },
      tip: 'Remember the year first, then add one to its hundreds (1776 → 17 + 1, the 18th century).',
      solution: `It happened in ${event.y}. ${rule}. So it was <b>the ${ordinal(c)} century</b>, the years ${(c - 1) * 100 + 1} to ${c * 100}.` };
  },
};
// variant k of a topic asks the (k mod 10)-th way; turn counts how many times this topic has asked that way before, so
// each time round it moves on to a new fact, event or set
const templates = TOPICS.map((topic) => (d, ctx) => {
  const kinds = topic.events.length ? DATED : UNDATED, at = ctx.k % kinds.length, kind = kinds[at];
  const turn = kinds.slice(0, at).filter((x) => x === kind).length + Math.floor(ctx.k / kinds.length) * kinds.filter((x) => x === kind).length;
  return { topic: topic.name, ...ASK[kind](d, topic, turn) };
});
export const middleAges = bank('middleages', templates, TOPICS.length * 20);
