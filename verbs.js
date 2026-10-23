// Spanish verbs for the Preterite and Imperfect tests: what each means, which group it's in, and its forms.
// Five persons: yo, tú, él (also ella and usted), nosotros, ellos (also ellas and ustedes). Vosotros is left out.
export const PERSONS = ['yo', 'tú', 'él', 'nosotros', 'ellos'];
export const WHO = { yo: 'yo', tú: 'tú', él: 'él / ella / usted', nosotros: 'nosotros', ellos: 'ellos / ellas / ustedes' };
// the subject pronouns a typed answer may start with
export const PRONOUNS = { yo: ['yo'], tú: ['tú'], él: ['él', 'ella', 'usted'], nosotros: ['nosotros', 'nosotras'], ellos: ['ellos', 'ellas', 'ustedes'] };

// ---------- the verbs, in groups ----------
export const GROUPS = {
  // regular in the preterite (some change their stem in the present, but never here)
  ar: {
    hablar: 'to speak', trabajar: 'to work', estudiar: 'to study', cantar: 'to sing', bailar: 'to dance', caminar: 'to walk',
    comprar: 'to buy', cocinar: 'to cook', escuchar: 'to listen', mirar: 'to look at', nadar: 'to swim', viajar: 'to travel',
    visitar: 'to visit', tomar: 'to take, to drink', llevar: 'to carry, to wear', esperar: 'to wait, to hope', ganar: 'to win, to earn',
    necesitar: 'to need', preparar: 'to prepare', terminar: 'to finish', usar: 'to use', ayudar: 'to help', cambiar: 'to change',
    dejar: 'to leave, to let', entrar: 'to go in', enseñar: 'to teach, to show', limpiar: 'to clean', llamar: 'to call',
    lavar: 'to wash', olvidar: 'to forget', pasar: 'to pass, to spend (time)', pintar: 'to paint', preguntar: 'to ask',
    regresar: 'to return', descansar: 'to rest', desayunar: 'to have breakfast', cenar: 'to have dinner', contestar: 'to answer',
    celebrar: 'to celebrate', invitar: 'to invite', pensar: 'to think', cerrar: 'to close', recordar: 'to remember',
    encontrar: 'to find', contar: 'to count, to tell', mostrar: 'to show', probar: 'to try, to taste',
  },
  erir: {
    comer: 'to eat', beber: 'to drink', aprender: 'to learn', comprender: 'to understand', correr: 'to run', vender: 'to sell',
    deber: 'to owe, must', romper: 'to break', prometer: 'to promise', responder: 'to answer', volver: 'to come back',
    devolver: 'to give back', mover: 'to move', perder: 'to lose', entender: 'to understand', encender: 'to turn on, to light',
    barrer: 'to sweep', toser: 'to cough', vivir: 'to live', escribir: 'to write', abrir: 'to open', recibir: 'to receive',
    decidir: 'to decide', subir: 'to go up', compartir: 'to share', asistir: 'to attend', cubrir: 'to cover',
    describir: 'to describe', descubrir: 'to discover', discutir: 'to argue, to discuss', permitir: 'to allow',
    sufrir: 'to suffer', salir: 'to go out, to leave', partir: 'to leave, to split', insistir: 'to insist',
    añadir: 'to add', conocer: 'to know, to meet', ofrecer: 'to offer', aparecer: 'to appear',
  },
  // -car, -gar, -zar: only the yo form changes its spelling
  car: {
    buscar: 'to look for', tocar: 'to touch, to play (music)', sacar: 'to take out', practicar: 'to practice',
    explicar: 'to explain', pescar: 'to fish', marcar: 'to mark, to score', secar: 'to dry', chocar: 'to crash',
    indicar: 'to point out', colocar: 'to place', comunicar: 'to communicate',
  },
  gar: {
    llegar: 'to arrive', jugar: 'to play', pagar: 'to pay', apagar: 'to turn off', entregar: 'to hand in',
    navegar: 'to sail, to browse', obligar: 'to force', castigar: 'to punish', cargar: 'to load, to charge', colgar: 'to hang',
    negar: 'to deny', rogar: 'to beg',
  },
  zar: {
    empezar: 'to begin', comenzar: 'to begin', almorzar: 'to have lunch', cruzar: 'to cross', organizar: 'to organize',
    utilizar: 'to use', abrazar: 'to hug', alcanzar: 'to reach', realizar: 'to carry out', gozar: 'to enjoy', rezar: 'to pray',
    lanzar: 'to throw',
  },
  // a vowel before the ending: i becomes y in él and ellos
  y: {
    leer: 'to read', creer: 'to believe', caer: 'to fall', oír: 'to hear', poseer: 'to own', construir: 'to build',
    destruir: 'to destroy', incluir: 'to include', contribuir: 'to contribute', concluir: 'to conclude',
    distribuir: 'to distribute',
  },
  // -ir verbs that change their stem: e → i or o → u in él and ellos
  stem: {
    pedir: 'to ask for', servir: 'to serve', repetir: 'to repeat', seguir: 'to follow, to keep on', sentir: 'to feel',
    preferir: 'to prefer', mentir: 'to lie', vestir: 'to dress', competir: 'to compete', conseguir: 'to get, to manage',
    elegir: 'to choose', medir: 'to measure', sugerir: 'to suggest', convertir: 'to turn into', hervir: 'to boil',
    despedir: 'to say goodbye to, to fire', dormir: 'to sleep', morir: 'to die',
  },
  // the four little irregulars
  fuidi: { ser: 'to be', ir: 'to go', dar: 'to give', ver: 'to see' },
  // irregular stems with u (tuve, pude…)
  ustem: {
    tener: 'to have', estar: 'to be', poder: 'to be able to, can', poner: 'to put', saber: 'to know', andar: 'to walk',
    obtener: 'to obtain', mantener: 'to keep', detener: 'to stop, to arrest', proponer: 'to propose', suponer: 'to suppose',
  },
  // irregular stems with i and j (hice, quise, dije, traje…)
  ijstem: {
    hacer: 'to do, to make', querer: 'to want', venir: 'to come', deshacer: 'to undo', prevenir: 'to prevent',
    decir: 'to say, to tell', traer: 'to bring', conducir: 'to drive', producir: 'to produce', traducir: 'to translate',
    atraer: 'to attract', distraer: 'to distract',
  },
};
export const MEANING = Object.assign({}, ...Object.values(GROUPS));
export const groupOf = (verb) => Object.keys(GROUPS).find((g) => verb in GROUPS[g]);

// ---------- the forms ----------
const STRONG = {                                    // irregular preterite stems (endings -e, -iste, -o, -imos, -ieron; -eron after j)
  tener: 'tuv', estar: 'estuv', poder: 'pud', poner: 'pus', saber: 'sup', andar: 'anduv', obtener: 'obtuv', mantener: 'mantuv',
  detener: 'detuv', proponer: 'propus', suponer: 'supus', hacer: 'hic', querer: 'quis', venir: 'vin', deshacer: 'deshic',
  prevenir: 'previn', decir: 'dij', traer: 'traj', conducir: 'conduj', producir: 'produj', traducir: 'traduj', atraer: 'atraj',
  distraer: 'distraj',
};
const LITTLE = {
  ser: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'], ir: ['fui', 'fuiste', 'fue', 'fuimos', 'fueron'],
  dar: ['di', 'diste', 'dio', 'dimos', 'dieron'], ver: ['vi', 'viste', 'vio', 'vimos', 'vieron'],
};
const at = (person) => PERSONS.indexOf(person);
const stemOf = (verb) => verb.slice(0, -2);
// e → i or o → u in the stem's last e or o (pedir → pid, dormir → durm, seguir → sigu)
const raise = (stem) => { const i = Math.max(stem.lastIndexOf('e'), stem.lastIndexOf('o')); return stem.slice(0, i) + (stem[i] === 'e' ? 'i' : 'u') + stem.slice(i + 1); };

export function preterite(verb, person) {
  const p = at(person), g = groupOf(verb);
  if (LITTLE[verb]) return LITTLE[verb][p];
  if (STRONG[verb]) {
    const s = STRONG[verb], j = s.endsWith('j');
    if (p === 2 && /hic$/.test(s)) return s.slice(0, -1) + 'zo';     // hizo, not hico
    return s + ['e', 'iste', 'o', 'imos', j ? 'eron' : 'ieron'][p];
  }
  const end = verb.slice(-2), stem = stemOf(verb === 'oír' ? 'oir' : verb);
  if (end === 'ar') {
    if (p === 0 && g === 'car') return stem.slice(0, -1) + 'qué';
    if (p === 0 && g === 'gar') return stem + 'ué';
    if (p === 0 && g === 'zar') return stem.slice(0, -1) + 'cé';
    return stem + ['é', 'aste', 'ó', 'amos', 'aron'][p];
  }
  if (g === 'y') {
    // -uir verbs: construí, construiste, construyó, construimos, construyeron; the others: leí, leíste, leyó, leímos, leyeron
    if (verb.endsWith('uir')) return stem + ['í', 'iste', 'yó', 'imos', 'yeron'][p];
    return stem + ['í', 'íste', 'yó', 'ímos', 'yeron'][p];
  }
  if (g === 'stem' && (p === 2 || p === 4)) return raise(stem) + (p === 2 ? 'ió' : 'ieron');
  return stem + ['í', 'iste', 'ió', 'imos', 'ieron'][p];
}

export function imperfect(verb, person) {
  const p = at(person);
  if (verb === 'ser') return ['era', 'eras', 'era', 'éramos', 'eran'][p];
  if (verb === 'ir') return ['iba', 'ibas', 'iba', 'íbamos', 'iban'][p];
  if (verb === 'ver') return ['veía', 'veías', 'veía', 'veíamos', 'veían'][p];
  const stem = stemOf(verb === 'oír' ? 'oir' : verb);
  return verb.endsWith('ar') ? stem + ['aba', 'abas', 'aba', 'ábamos', 'aban'][p] : stem + ['ía', 'ías', 'ía', 'íamos', 'ían'][p];
}

// verbs that change or are irregular in the present but are completely regular in the imperfect
export const REGULAR_IMPERFECT = ['querer', 'poder', 'tener', 'venir', 'dormir', 'pedir', 'jugar', 'pensar', 'empezar', 'volver',
  'decir', 'hacer', 'poner', 'salir', 'conocer', 'traer', 'oír', 'seguir', 'sentir', 'cerrar', 'encontrar', 'recordar', 'almorzar',
  'entender', 'perder', 'servir', 'preferir', 'saber', 'leer', 'conducir'];
