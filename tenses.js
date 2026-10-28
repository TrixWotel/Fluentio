// The Preterite and Imperfect tests: type a verb's form for a person, or choose the form that fits a sentence.
// Every form comes from verbs.js, and the sentences from sentences.js. Wrong choices are the slips people make: the
// other tense, another person, a missing accent, a spelling or stem change in the wrong place.
import { bank, combo } from '../kit/bank.js';
import { PERSONS, WHO, PRONOUNS, GROUPS, MEANING, groupOf, preterite, imperfect, REGULAR_IMPERFECT } from './verbs.js';
import { sentences } from './sentences.js';

const KEYS = ['á', 'é', 'í', 'ó', 'ú', 'ñ', 'ü'];
const FORM = { pret: preterite, imp: imperfect }, NAME = { pret: 'preterite', imp: 'imperfect' };
const verbsIn = (...groups) => groups.flatMap((g) => Object.keys(GROUPS[g]));
const stemOf = (verb) => verb.slice(0, -2);
const all5 = (tense, verb) => PERSONS.map((p) => FORM[tense](verb, p)).join(', ');
// a typed answer: the form, with or without a subject pronoun in front
const typed = (form, person) => ({ kind: 'text', accept: [form, ...PRONOUNS[person].map((p) => `${p} ${form}`)], keys: KEYS, lang: 'es' });
const flat = (s) => s.normalize('NFD').replace(/\u0301/g, '').normalize('NFC');   // accents off, ñ and ü kept
// five choices: the right form and four different wrong ones (the slips first), in a random order
function five(d, right, wrongs) {
  const list = [right];
  for (const w of wrongs) if (list.length < 5 && w && !list.includes(w)) list.push(w);
  if (list.length < 5) throw new Error(`only ${list.length} choices for ${right}`);
  const order = d.shuffle(list);
  return { kind: 'choice', choices: order.map((w) => `<span lang="es">${w}</span>`), correct: order.indexOf(right) };
}

// the slips for one form: the same verb said the way people get it wrong
const LITTLE_SLIPS = [
  { ser: 'fuí', ir: 'fuí', dar: 'dí', ver: 'ví' }, { ser: 'fuistes', ir: 'fuistes', dar: 'distes', ver: 'vistes' },
  { ser: 'fué', ir: 'fué', dar: 'dió', ver: 'vió' }, { ser: 'fuímos', ir: 'fuímos', dar: 'dímos', ver: 'vímos' },
  { ser: 'fuieron', ir: 'fuieron', dar: 'daron', ver: 'veyeron' }];
function slips(verb, person, tense) {
  const p = PERSONS.indexOf(person), g = groupOf(verb), right = FORM[tense](verb, person), out = [];
  if (flat(right) !== right) out.push(flat(right));                                   // the accent left off
  if (tense === 'pret') {
    const regular = verb.endsWith('ar') ? ['é', 'aste', 'ó', 'amos', 'aron'] : ['í', 'iste', 'ió', 'imos', 'ieron'];
    const swap = { car: 'qu', gar: 'gu', zar: 'c' }[g];
    if (swap && p === 0) out.push(stemOf(verb) + 'é');                                      // buscé, llegé, empezé
    if (swap && p !== 0) out.push(stemOf(verb).slice(0, -1) + swap + regular[p]);           // busquaste: the change in the wrong place
    if (g === 'y') out.push(stemOf(verb === 'oír' ? 'oir' : verb) + regular[p]);             // leió, leieron
    if (g === 'stem') out.push(p === 2 || p === 4 ? stemOf(verb) + regular[p] : FORM.pret(verb, 'él').replace(/ió$/, regular[p]));   // pedió, or pidí
    if (g === 'ustem' || g === 'ijstem') out.push(stemOf(verb) + regular[p], right.replace(/e$/, 'é').replace(/o$/, 'ó'));   // tení, tuvé
    if (g === 'ijstem' && p === 4 && /jeron$/.test(right)) out.push(right.replace(/eron$/, 'ieron'));   // dijieron
    if (g === 'fuidi') out.push(LITTLE_SLIPS[p][verb]);                                    // fué, dió, fuistes, daron
  } else {
    const own = { ser: ['seía', 'seías', 'seía', 'seíamos', 'seían'], ir: ['iva', 'ivas', 'iva', 'ívamos', 'ivan'], ver: ['vía', 'vías', 'vía', 'víamos', 'vían'] }[verb];
    if (own) out.push(own[p]);                                                               // seía, iva, vía
    else if (verb.endsWith('ar')) out.push(stemOf(verb) + ['ía', 'ías', 'ía', 'íamos', 'ían'][p]);   // hablía
    else out.push(stemOf(verb === 'oír' ? 'oir' : verb) + ['aba', 'abas', 'aba', 'ábamos', 'aban'][p]);   // comaba
    if (REGULAR_IMPERFECT.includes(verb)) out.push(FORM.pret(verb, person));
  }
  return out;
}
const others = (verb, person, tense) => PERSONS.filter((p) => p !== person).map((p) => FORM[tense](verb, p));
const other = (tense) => (tense === 'pret' ? 'imp' : 'pret');

// how a form is made, in a sentence or two
function why(verb, person, tense) {
  const form = FORM[tense](verb, person), g = groupOf(verb), stem = stemOf(verb), who = `<b>${WHO[person]}</b>`;
  if (tense === 'imp') {
    if (verb === 'ser' || verb === 'ir' || verb === 'ver') return `<b>${verb}</b> is one of only three irregular verbs in the imperfect. Its forms are ${all5('imp', verb)}, so for ${who} it’s <b>${form}</b>.`;
    const ending = form.slice(stemOf(verb === 'oír' ? 'oir' : verb).length);
    const change = REGULAR_IMPERFECT.includes(verb) ? ` It may change in the present, but the imperfect has no stem changes and no irregular stems.` : '';
    return `<b>${verb}</b> is regular in the imperfect.${change} Take off -${verb.slice(-2)} and add the ${verb.endsWith('ar') ? '-aba' : '-ía'} ending for ${who}: ${stemOf(verb === 'oír' ? 'oir' : verb)}- + -${ending} = <b>${form}</b>.`;
  }
  if (g === 'fuidi') return verb === 'ser' || verb === 'ir'
    ? `<b>ser</b> and <b>ir</b> share the same preterite (${all5('pret', verb)}); in a sentence, the meaning tells you which one it is. For ${who}: <b>${form}</b>.`
    : `<b>${verb}</b> has short preterite forms with no accents: ${all5('pret', verb)}. For ${who}: <b>${form}</b>.`;
  if (g === 'ustem' || g === 'ijstem') {
    const s = FORM.pret(verb, 'yo').slice(0, -1), j = s.endsWith('j');
    return `<b>${verb}</b> has the irregular preterite stem <b>${s}-</b>, with the endings -e, -iste, -o, -imos, -${j ? 'eron' : 'ieron'} and no accents${j ? ' (after j it is -eron, not -ieron)' : ''}${/zo$/.test(form) ? ' (c becomes z before o)' : ''}. For ${who}: <b>${form}</b>.`;
  }
  if (['car', 'gar', 'zar'].includes(g)) return person === 'yo'
    ? `-${g} verbs change their spelling in the yo form only: ${{ car: 'c → qu, so it still sounds like k before é', gar: 'g → gu, so it still sounds like the g in “go” before é', zar: 'z → c, because Spanish spells this sound ce, not ze' }[g]}. So ${stem}- becomes ${form.slice(0, -1)}-, and ${form.slice(0, -1)}- + -é = <b>${form}</b>.`
    : `Only the yo form of a -${g} verb changes its spelling. For ${who} it’s regular: ${stem}- + -${form.slice(stem.length)} = <b>${form}</b>.`;
  if (g === 'y') return person === 'él' || person === 'ellos'
    ? `The stem of <b>${verb}</b> ends in a vowel, so the i of -ió and -ieron becomes y between the vowels. So ${stemOf(verb === 'oír' ? 'oir' : verb)}- + -${form.slice(stemOf(verb === 'oír' ? 'oir' : verb).length)} = <b>${form}</b>.`
    : `For ${who}, <b>${verb}</b> keeps its i: <b>${form}</b>${verb.endsWith('uir') ? ' (no accent after -u-, except in the yo form)' : ' (with an accent, since the stem ends in a vowel)'}.`;
  if (g === 'stem') return person === 'él' || person === 'ellos'
    ? `<b>${verb}</b> is an -ir verb that changes its stem in the preterite, but only for él and ellos: ${verb === 'dormir' || verb === 'morir' ? 'o → u' : 'e → i'}. So ${form.slice(0, person === 'él' ? -2 : -5)}- + -${person === 'él' ? 'ió' : 'ieron'} = <b>${form}</b>.`
    : `<b>${verb}</b> changes its stem only for él and ellos; for ${who} it’s regular: <b>${form}</b>.`;
  const ending = form.slice(stem.length);
  return `<b>${verb}</b> is a regular -${verb.slice(-2)} verb: take off -${verb.slice(-2)} and add the ${verb.endsWith('ar') ? '-ar' : '-er/-ir'} ending for ${who}, ${stem}- + -${ending} = <b>${form}</b>.`;
}

// a drill: type one verb's form for one person. `focus` persons come up half the time (the ones that change);
// once a group's combinations run out, the same ones come back as a choice of five instead
function drill(topic, tense, verbs, focus) {
  return (d, ctx) => {
    const list = verbs(), rest = PERSONS.filter((p) => !focus?.includes(p));
    const [verb, person] = focus
      ? combo({ ...ctx, k: ctx.k >> 1, salt: ctx.salt + (ctx.k % 2 ? '-rest' : '-focus') }, [list, ctx.k % 2 ? rest : focus])
      : combo(ctx, [list, PERSONS]);
    const form = FORM[tense](verb, person), choose = !focus && ctx.k >= list.length * PERSONS.length;
    return {
      topic,
      text: `${choose ? 'Choose' : 'Write'} the ${NAME[tense]} of <b lang="es">${verb}</b> (${MEANING[verb]}) for <b>${WHO[person]}</b>.`,
      answer: choose ? five(d, form, [...slips(verb, person, tense), FORM[other(tense)](verb, person), ...d.shuffle(others(verb, person, tense))]) : typed(form, person),
      solution: why(verb, person, tense),
      check: () => (FORM[tense](verb, person) === form ? '' : 'form changed'),
    };
  };
}

// a sentence with a blank: choose the form that fits (`pick` says which sentences, and whether the tense is the question)
function inSentences(topic, pick, contrast) {
  const pool = sentences.filter(pick);
  return (d, ctx) => {
    const [s] = combo(ctx, [pool]);
    const form = FORM[s.tense](s.verb, s.person), twin = FORM[other(s.tense)](s.verb, s.person);
    const wrongs = contrast
      ? [twin, ...d.shuffle([...others(s.verb, s.person, s.tense), ...others(s.verb, s.person, other(s.tense))])]
      : [...d.shuffle([...slips(s.verb, s.person, s.tense), ...others(s.verb, s.person, s.tense)]).slice(0, 2), twin, ...d.shuffle(others(s.verb, s.person, s.tense))];
    return {
      topic,
      text: `${contrast ? 'Preterite or imperfect? ' : ''}Choose the form of <b lang="es">${s.verb}</b> (${MEANING[s.verb]}) that fits: <span lang="es">${s.es.replace('___', '<b>___</b>')}</span>`,
      answer: five(d, form, wrongs),
      solution: `${s.why} The ${NAME[s.tense]} of ${s.verb} for ${WHO[s.person]} is <b>${form}</b>: <span lang="es">${s.es.replace('___', `<b>${form}</b>`)}</span> <i>(${s.en})</i>`,
      check: () => (pool.includes(s) ? '' : 'sentence missing'),
    };
  };
}

export const PRETERITE_TOPICS = ['Regular -ar verbs', 'Regular -er and -ir verbs', 'Spelling changes: -car, -gar, -zar', 'Spelling changes: i to y',
  'Stem changes in -ir verbs', 'ser, ir, dar and ver', 'Irregular stems with u', 'Irregular stems with i and j', 'The preterite in sentences'];
export const preteriteTest = bank('preterite', [
  drill(PRETERITE_TOPICS[0], 'pret', () => verbsIn('ar')),
  drill(PRETERITE_TOPICS[1], 'pret', () => verbsIn('erir')),
  drill(PRETERITE_TOPICS[2], 'pret', () => verbsIn('car', 'gar', 'zar'), ['yo']),
  drill(PRETERITE_TOPICS[3], 'pret', () => verbsIn('y'), ['él', 'ellos']),
  drill(PRETERITE_TOPICS[4], 'pret', () => verbsIn('stem'), ['él', 'ellos']),
  drill(PRETERITE_TOPICS[5], 'pret', () => verbsIn('fuidi')),
  drill(PRETERITE_TOPICS[6], 'pret', () => verbsIn('ustem')),
  drill(PRETERITE_TOPICS[7], 'pret', () => verbsIn('ijstem')),
  inSentences(PRETERITE_TOPICS[8], (s) => s.tense === 'pret'),
], 9 * 30);

export const IMPERFECT_TOPICS = ['Regular -ar verbs', 'Regular -er and -ir verbs', 'ser, ir and ver', 'No stem changes', 'The imperfect in sentences', 'Preterite or imperfect?'];
export const imperfectTest = bank('imperfect', [
  drill(IMPERFECT_TOPICS[0], 'imp', () => verbsIn('ar', 'car', 'gar', 'zar').filter((v) => !REGULAR_IMPERFECT.includes(v))),
  drill(IMPERFECT_TOPICS[1], 'imp', () => verbsIn('erir', 'y').filter((v) => !REGULAR_IMPERFECT.includes(v))),
  drill(IMPERFECT_TOPICS[2], 'imp', () => ['ser', 'ir', 'ver']),
  drill(IMPERFECT_TOPICS[3], 'imp', () => REGULAR_IMPERFECT),
  inSentences(IMPERFECT_TOPICS[4], (s) => s.tense === 'imp'),
  inSentences(IMPERFECT_TOPICS[5], () => true, true),
], 6 * 30);
