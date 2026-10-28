// Learning the Preterite and the Imperfect: the lessons for every topic (when the tense is used, how its forms are built,
// the classic mistakes) and the order to learn them in. A topic is learned after 5 right in a row.

const P = (rows) => `<table class="data"><tr><th>Person</th>${rows[0].map((h) => `<th>${h}</th>`).join('')}</tr>${
  ['yo', 'tú', 'él / ella / usted', 'nosotros', 'ellos / ellas / ustedes'].map((who, i) => `<tr><td>${who}</td>${rows.slice(1).map((col) => `<td>${col[i]}</td>`).join('')}</tr>`).join('')}</table>`;

const preteriteLessons = {
  'Regular -ar verbs': {
    idea: 'The preterite tells what happened: one finished action at a definite time (<i>ayer</i>, <i>anoche</i>, <i>el año pasado</i>). For a regular -ar verb, take off -ar and add the endings. The yo and él forms end in an accented vowel, and that accent is what tells <b>hablé</b> (I spoke) from <b>hable</b>, and <b>habló</b> (he spoke) from <b>hablo</b> (I speak).'
      + P([['ending', 'hablar'], ['-é', '-aste', '-ó', '-amos', '-aron'], ['hablé', 'hablaste', 'habló', 'hablamos', 'hablaron']]),
    how: ['Take -ar off the infinitive: hablar → habl-.', 'Add the ending for the person: -é, -aste, -ó, -amos or -aron.', 'Put the accent on -é and -ó; the other forms have none.'],
    watch: ['Leaving off the accent: <b>hablo</b> means "I speak", <b>habló</b> means "he spoke".', 'Adding an s to the tú form: it is <b>hablaste</b>, not "hablastes".', 'The nosotros form is the same as in the present (hablamos), so the time words tell you which it is.'],
    tip: 'Drop the -ar, then use the preterite ending for that person, with its accent if it has one.',
  },
  'Regular -er and -ir verbs': {
    idea: '-er and -ir verbs share one set of preterite endings: -í, -iste, -ió, -imos, -ieron. As with -ar verbs, yo and él carry an accent: <b>comí</b>, <b>comió</b>. Verbs that change their stem in the present, like volver or entender, are regular here: <b>volví</b>, <b>entendió</b>.'
      + P([['ending', 'comer', 'vivir'], ['-í', '-iste', '-ió', '-imos', '-ieron'], ['comí', 'comiste', 'comió', 'comimos', 'comieron'], ['viví', 'viviste', 'vivió', 'vivimos', 'vivieron']]),
    how: ['Take -er or -ir off the infinitive: comer → com-, vivir → viv-.', 'Add -í, -iste, -ió, -imos or -ieron.', 'Keep the accents on -í and -ió.'],
    watch: ['Writing <b>comio</b> or <b>comi</b> without the accent.', 'Giving volver a stem change: it is <b>volví</b> and <b>volvió</b>, not "vuelví".', 'Using the -ar endings: it is <b>comieron</b>, not "comaron".'],
    tip: 'Both -er and -ir verbs use the same preterite endings, starting with an accented -í for yo.',
  },
  'Spelling changes: -car, -gar, -zar': {
    idea: 'These verbs are regular, but the yo ending -é changes the spelling in front of it. Before e, c would sound like s and g like the j sound, so they change to keep their sound: c → qu (<b>busqué</b>), g → gu (<b>llegué</b>). And Spanish writes ce, not ze, so z → c (<b>empecé</b>). Only yo changes; every other form is regular: buscaste, llegó, empezamos.'
      + '<table class="data"><tr><th>Ending</th><th>yo</th><th>tú</th><th>él</th></tr><tr><td>-car: buscar</td><td>busqué</td><td>buscaste</td><td>buscó</td></tr><tr><td>-gar: llegar</td><td>llegué</td><td>llegaste</td><td>llegó</td></tr><tr><td>-zar: empezar</td><td>empecé</td><td>empezaste</td><td>empezó</td></tr></table>',
    how: ['Check the person: if it is not yo, conjugate like any regular -ar verb.', 'For yo, change the letter before the ending: c → qu, g → gu, z → c.', 'Add -é with its accent.'],
    watch: ['Changing the other persons too: it is <b>buscó</b> and <b>llegaron</b>, with no change.', 'Writing "jugé" or "empezé": the yo forms are <b>jugué</b> and <b>empecé</b>.'],
    tip: 'Only the yo form changes its spelling: c → qu and g → gu keep their sound before é, and z → c because Spanish writes ce, not ze.',
  },
  'Spelling changes: i to y': {
    idea: 'When the stem ends in a vowel (le-er, cre-er, ca-er, o-ír, constru-ir), the i of -ió and -ieron would sit between two vowels, so it turns into y: <b>leyó</b>, <b>leyeron</b>. Leer, creer, caer, oír and poseer also put accents on the other i endings (leí, leíste, leímos). The -uir verbs (construir, incluir…) do not: construiste, construimos.'
      + P([['leer', 'construir'], ['leí', 'leíste', 'leyó', 'leímos', 'leyeron'], ['construí', 'construiste', 'construyó', 'construimos', 'construyeron']]),
    how: ['Check that the stem ends in a vowel: le-, cre-, ca-, o-, constru-.', 'For él and ellos, use -yó and -yeron.', 'For the others use -í, -iste, -imos, with an accent on the i for leer, creer, caer, oír and poseer.'],
    watch: ['Writing "leió" or "leieron": the i becomes y, so <b>leyó</b>, <b>leyeron</b>.', 'Adding accents to the -uir verbs: it is <b>construiste</b> and <b>construimos</b>; only construí and construyó have one.'],
    tip: 'In the él and ellos forms an i between two vowels becomes y; then check the accents.',
  },
  'Stem changes in -ir verbs': {
    idea: '-ir verbs that change their stem in the present also change in the preterite, but only in the third person (él/ella/usted and ellos/ellas/ustedes), and only a little: e → i and o → u. So <b>pedir</b> gives pidió, pidieron, and <b>dormir</b> gives durmió, durmieron. Yo, tú and nosotros stay regular: pedí, dormiste, seguimos.'
      + P([['pedir', 'dormir'], ['pedí', 'pediste', 'pidió', 'pedimos', 'pidieron'], ['dormí', 'dormiste', 'durmió', 'dormimos', 'durmieron']]),
    how: ['Check the person: yo, tú and nosotros are regular (pedí, pediste, pedimos).', 'For él and ellos, change the last e of the stem to i, or the o to u.', 'Add -ió or -ieron.'],
    watch: ['Changing yo or nosotros: it is <b>pedí</b> and <b>dormimos</b>.', 'Using the present-tense change: it is <b>durmió</b> (o → u), not "duermió".', '-ar and -er verbs never change their stem in the preterite: <b>pensó</b>, <b>volvió</b>.'],
    tip: 'Only él and ellos change the stem, and only e → i or o → u.',
  },
  'ser, ir, dar and ver': {
    idea: 'Ser and ir share the same preterite: fui, fuiste, fue, fuimos, fueron. The sentence tells you which one is meant (<i>Fui al cine</i>: I went; <i>Fue un día largo</i>: it was). Dar and ver use the -er/-ir endings, but they are so short that they need no accents: <b>di</b>, <b>dio</b>, <b>vi</b>, <b>vio</b>.'
      + P([['ser / ir', 'dar', 'ver'], ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'], ['di', 'diste', 'dio', 'dimos', 'dieron'], ['vi', 'viste', 'vio', 'vimos', 'vieron']]),
    how: ['For ser or ir, use fui, fuiste, fue, fuimos, fueron.', 'For dar, use di, diste, dio, dimos, dieron; for ver, vi, viste, vio, vimos, vieron.', 'Write no accents on any of them.'],
    watch: ['Adding accents: <b>fue</b>, <b>fui</b>, <b>dio</b> and <b>vio</b> have none.', 'Giving dar the -ar endings: it is <b>dio</b> and <b>dieron</b>, not "dó" or "daron".'],
    tip: 'These four are short and take no accents: start from fui, di or vi.',
  },
  'Irregular stems with u': {
    idea: 'A few very common verbs get a new stem with a u in the preterite: tener → tuv-, estar → estuv-, poder → pud-, poner → pus-, saber → sup-, andar → anduv-. They all take the same endings, -e, -iste, -o, -imos, -ieron, with no accents. Verbs built on them follow along: obtener → obtuve, suponer → supuse.'
      + P([['ending', 'tener', 'poder'], ['-e', '-iste', '-o', '-imos', '-ieron'], ['tuve', 'tuviste', 'tuvo', 'tuvimos', 'tuvieron'], ['pude', 'pudiste', 'pudo', 'pudimos', 'pudieron']]),
    how: ['Find the preterite stem: tuv-, estuv-, pud-, pus-, sup-, anduv- (and the same for obtener, mantener, detener, proponer, suponer).', 'Add -e, -iste, -o, -imos or -ieron.', 'Write no accents: tuve, pudo.'],
    watch: ['Using regular endings: it is <b>tuve</b>, not "tení", and <b>estuvo</b>, not "estó".', 'Adding accents: <b>tuvo</b> and <b>pudo</b> have none.'],
    tip: 'This verb has a special preterite stem with a u, and its endings carry no accents.',
  },
  'Irregular stems with i and j': {
    idea: 'Hacer, querer and venir take a stem with an i: hic-, quis-, vin-. Decir, traer and the -ducir verbs take a stem with a j: dij-, traj-, conduj-. They use the same endings as the u-stems, with two twists: hacer writes <b>hizo</b> (the z keeps the sound before o), and after a j the ellos ending is -eron, not -ieron: <b>dijeron</b>, <b>trajeron</b>.'
      + P([['hacer', 'decir'], ['hice', 'hiciste', 'hizo', 'hicimos', 'hicieron'], ['dije', 'dijiste', 'dijo', 'dijimos', 'dijeron']]),
    how: ['Find the stem: hic-, quis-, vin- (deshacer, prevenir too), or dij-, traj-, -duj- (atraer, distraer too).', 'Add -e, -iste, -o or -imos; for ellos add -ieron, or just -eron after a j.', 'Remember hizo, and write no accents.'],
    watch: ['Writing "hico": it is <b>hizo</b>.', 'Writing "dijieron" or "trajieron": after a j it is <b>dijeron</b>, <b>trajeron</b>.', 'Adding accents: <b>hice</b>, <b>vino</b> and <b>dijo</b> have none.'],
    tip: 'Use the stem with i or j and the endings with no accents, and check the ellos ending after a j.',
  },
  'The preterite in sentences': {
    idea: 'In a sentence, two things decide the form: who did it, and that it is a finished action, which is what the preterite is for. Look for a definite time (<i>ayer</i>, <i>anoche</i>, <i>el lunes pasado</i>, <i>en 2019</i>, <i>a las tres</i>), a single event (<i>una vez</i>, <i>de repente</i>), or an action that breaks into something going on (<i>Mientras dormía, sonó el teléfono</i>). Then conjugate for the subject: a name or a noun like <i>mi hermana</i> is él, and <i>mis amigos</i> is ellos.',
    how: ['Find the subject of the blank and its person: yo, tú, él, nosotros or ellos.', 'Check the time words: a finished action at a definite time calls for the preterite.', 'Conjugate the verb in the preterite for that person, irregular stems and accents included.'],
    watch: ['The right tense with the wrong person: <i>mis padres</i> needs the ellos form.', 'The imperfect (hablaba) for one finished action at a set time.'],
    tip: 'Who is the subject of the blank, and what is the preterite form for that person?',
  },
};

const imperfectLessons = {
  'Regular -ar verbs': {
    idea: 'The imperfect describes the past as it was going on: what used to happen (<i>De niño jugaba al fútbol</i>), what was happening (<i>Llovía</i>), and descriptions, time and age. For -ar verbs, drop -ar and add -aba, -abas, -aba, -ábamos, -aban. Only nosotros has an accent, and yo and él share one form.'
      + P([['ending', 'hablar'], ['-aba', '-abas', '-aba', '-ábamos', '-aban'], ['hablaba', 'hablabas', 'hablaba', 'hablábamos', 'hablaban']]),
    how: ['Take -ar off the infinitive: hablar → habl-.', 'Add -aba, -abas, -aba, -ábamos or -aban.', 'Put the accent on nosotros only: hablábamos.'],
    watch: ['Forgetting the accent in <b>-ábamos</b>.', 'Using the -ía endings with an -ar verb: it is <b>hablaba</b>, not "hablía".', 'Spelling the ending with a v: it is always -aba, with a b.'],
    tip: 'For -ar verbs, every imperfect ending starts with -aba.',
  },
  'Regular -er and -ir verbs': {
    idea: '-er and -ir verbs share the endings -ía, -ías, -ía, -íamos, -ían, and every form has an accent on the í. Yo and él/ella/usted look the same (<b>comía</b>), so the sentence tells you who it is.'
      + P([['ending', 'comer', 'vivir'], ['-ía', '-ías', '-ía', '-íamos', '-ían'], ['comía', 'comías', 'comía', 'comíamos', 'comían'], ['vivía', 'vivías', 'vivía', 'vivíamos', 'vivían']]),
    how: ['Take -er or -ir off the infinitive: comer → com-, vivir → viv-.', 'Add -ía, -ías, -ía, -íamos or -ían.', 'Keep the accent on the í in every form.'],
    watch: ['Leaving off the accent: <b>comía</b>, not "comia".', 'Using -aba with an -er or -ir verb: it is <b>vivía</b>, not "vivaba".'],
    tip: 'For -er and -ir verbs, every imperfect ending starts with an accented -í.',
  },
  'ser, ir and ver': {
    idea: 'Only three verbs are irregular in the imperfect. <b>Ser</b>: era, eras, era, éramos, eran. <b>Ir</b>: iba, ibas, iba, íbamos, iban. <b>Ver</b> just keeps its e: veía, veías, veía, veíamos, veían. Every other verb in Spanish is regular in the imperfect.'
      + P([['ser', 'ir', 'ver'], ['era', 'eras', 'era', 'éramos', 'eran'], ['iba', 'ibas', 'iba', 'íbamos', 'iban'], ['veía', 'veías', 'veía', 'veíamos', 'veían']]),
    how: ['Spot ser, ir or ver.', 'Use the era…, iba… or veía… form for the person.', 'Check the accents: éramos, íbamos, and every form of veía.'],
    watch: ['Writing "vía" for ver: it is <b>veía</b>.', 'Forgetting the accent in <b>éramos</b> and <b>íbamos</b>.'],
    tip: 'This is one of the only three verbs with an irregular imperfect.',
  },
  'No stem changes': {
    idea: 'Verbs that are tricky in the present (quiero, puedo, tengo, digo, duermo) or in the preterite (tuve, hice, pidió) are completely regular in the imperfect. Just take the stem of the infinitive and add the endings: querer → <b>quería</b>, tener → <b>tenía</b>, dormir → <b>dormía</b>, jugar → <b>jugaba</b>, hacer → <b>hacía</b>.',
    how: ['Start from the infinitive, not from the present or the preterite.', 'Take off -ar, -er or -ir without changing anything in the stem.', 'Add -aba… for -ar verbs, or -ía… for -er and -ir verbs.'],
    watch: ['Carrying over a present stem change: it is <b>quería</b>, not "quiería", and <b>jugaba</b>, not "juegaba".', 'Carrying over a preterite stem: it is <b>tenía</b>, not "tuvía".'],
    tip: 'Build the imperfect from the infinitive: in this tense the stem never changes.',
  },
  'The imperfect in sentences': {
    idea: 'Use the imperfect for the background of the past: habits (<i>todos los días</i>, <i>siempre</i>, <i>de niño</i>, <i>antes</i>), actions in progress (<i>mientras</i>), descriptions of people, places and weather, and time and age (<i>Eran las tres</i>, <i>Tenía diez años</i>). Then match the form to the subject of the blank.',
    how: ['Find the subject of the blank and its person.', 'Look for a habit, a description, a time or an age, or an action in progress.', 'Conjugate the verb in the imperfect for that person.'],
    watch: ['Using the preterite for something that used to happen again and again.', 'Mixing up the persons: yo and él share one form, but nosotros and ellos don’t.', 'Clock time is plural from two o’clock on: <i>eran las tres</i>, but <i>era la una</i>.'],
    tip: 'Is this a habit, a description or something in progress, and who is the subject?',
  },
  'Preterite or imperfect?': {
    idea: 'Think of a story: the imperfect is the scenery and the preterite is what happens. The preterite moves the story on with finished actions (<i>ayer</i>, <i>de repente</i>, <i>una vez</i>); the imperfect sets the scene and says what was going on or used to happen (<i>siempre</i>, <i>mientras</i>, <i>de niño</i>). When one action breaks into another, the one in progress is imperfect and the interruption is preterite: <i>Mientras cocinaba, sonó el teléfono.</i>',
    how: ['Look at the time words: a definite, finished time points to the preterite; a habit or a "while" points to the imperfect.', 'Ask whether the verb is an event in the story (preterite) or the background (imperfect).', 'In a "when" or "while" sentence, the action in progress is imperfect and the one that breaks in is preterite.', 'Conjugate for the subject.'],
    watch: ['The imperfect for a single event at a set time: <i>ayer comí</i>, not "ayer comía".', 'The preterite for a description or an age: <i>tenía diez años</i>, not "tuvo".', 'Describing what something was like with <i>fue</i>: a big house <b>era</b> grande.'],
    tip: 'Is the blank an event that happened, or the background, a habit or a description?',
  },
};

// the order to learn each test's topics in
export const preteriteLearning = {
  goal: 5,
  path: [
    { unit: 'Regular verbs', topics: ['Regular -ar verbs', 'Regular -er and -ir verbs'] },
    { unit: 'Spelling changes', topics: ['Spelling changes: -car, -gar, -zar', 'Spelling changes: i to y'] },
    { unit: 'Stem changes', topics: ['Stem changes in -ir verbs'] },
    { unit: 'Irregular verbs', topics: ['ser, ir, dar and ver', 'Irregular stems with u', 'Irregular stems with i and j'] },
    { unit: 'Using the preterite', topics: ['The preterite in sentences'] },
  ],
  lessons: preteriteLessons,
};
export const imperfectLearning = {
  goal: 5,
  path: [
    { unit: 'Regular verbs', topics: ['Regular -ar verbs', 'Regular -er and -ir verbs'] },
    { unit: 'Irregular, or not', topics: ['ser, ir and ver', 'No stem changes'] },
    { unit: 'Using the imperfect', topics: ['The imperfect in sentences', 'Preterite or imperfect?'] },
  ],
  lessons: imperfectLessons,
};
