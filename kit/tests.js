// Fluentio's test runner, shared by the Math, Science and Physics pages: a card for each test, a test of random variants
// with a score (your best is kept in this browser), learning a topic at a time with hints, and practice by variant
// number with worked solutions.
// Links: #triangles opens a test's page, #triangles/test starts a test (#triangles/test/40 one of 40 questions),
// #triangles/learn lists the topics to learn, #triangles/learn/all mixes them, and #triangles/137 shows variant 137.
const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); for (const k of kids.flat()) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(k)); return n; };
const html = (tag, cls, markup) => { const n = el(tag, { className: cls }); n.innerHTML = markup; return n; };   // markup here is always the banks' own, never typed by anyone
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const GOAL = 3;                                     // right in a row (first try, no hints) to learn a topic
const store = { get: (k) => { try { return JSON.parse(localStorage.getItem('fluentio.' + k)); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem('fluentio.' + k, JSON.stringify(v)); } catch {} } };
const clockText = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const random = (t) => 1 + Math.floor(Math.random() * t.bank.count);
const pick = (list) => list[Math.floor(Math.random() * list.length)];
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const standard = (t) => (t.amc ? 25 : t.length);   // a test's usual number of questions
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

// what someone typed → a number (takes 4.5, −2.5, 1,250, 3/4, 45°, 12 m/s, x = 7)
export function readNumber(text) {
  const clean = String(text ?? '').trim().replace(/−/g, '-').replace(/^[a-zA-Zθ∠ ]*=\s*/, '').replace(/,(?=\d{3}\b)/g, '');
  const m = clean.match(/^([+-]?(?:\d+(?:\.\d*)?|\.\d+))(?:\s*\/\s*(\d+(?:\.\d+)?))?/);
  if (!m) return null;
  const v = parseFloat(m[1]) / (m[2] ? parseFloat(m[2]) : 1);
  return Number.isFinite(v) ? v : null;
}
// right if within the question's tolerance: { abs } is plus or minus that much, a plain number is a share of the answer
export function isRight(answer, given) {
  if (given == null) return false;
  if (answer.kind === 'choice') return given === answer.correct;
  const v = readNumber(given);
  if (v == null) return false;
  const tol = answer.tol && typeof answer.tol === 'object' ? answer.tol.abs : Math.max((answer.tol ?? 0.02) * Math.abs(answer.value), 0.005);
  return Math.abs(v - answer.value) <= tol + 1e-9;
}
// a worked solution a step at a time, for hints: split after a sentence's end, or after a colon (so "The angles add up
// to 180°:" comes before the sum itself), never inside a tag
export function steps(markup) {
  const out = [];
  let depth = 0, from = 0;
  for (let i = 0; i < markup.length; i++) {
    if (markup[i] === '<') {
      const end = markup.indexOf('>', i);
      if (end < 0) break;
      const tag = markup.slice(i, end + 1);
      if (tag[1] === '/') depth--; else if (!/^<(br|hr|img|wbr)\b|\/>$/i.test(tag)) depth++;
      i = end;
    } else if (depth === 0 && markup[i + 1] === ' ' && (('.?!'.includes(markup[i]) && /[A-Z0-9(]/.test(markup[i + 2] || '')) || (markup[i] === ':' && markup[i - 1] !== ' '))) {
      out.push(markup.slice(from, i + 1));
      from = i + 2;
    }
  }
  out.push(markup.slice(from));
  return out.filter((s) => s.trim());
}
const fmt = (v) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 3 });
const shown = (answer) => (answer.kind === 'choice' ? `(${LETTERS[answer.correct]}) ${answer.choices[answer.correct]}` : `${fmt(answer.value)}${answer.unit ? (answer.unit === '°' ? '°' : ' ' + answer.unit) : ''}`);

// the page: tests = [{ bank, name, blurb, about, length, amc, order(n), aside(), asideName, asideOpen }]
// order(n), if given, is how hard variant n is: learning lists the easier topics first
export function testsPage({ tests }) {
  const app = document.getElementById('app'), top = document.getElementById('top');   // top: the page's title, shown on the cards only
  const byId = Object.fromEntries(tests.map((t) => [t.bank.id, t]));
  const topics = new Map();                         // each test's kinds of question, and the variants of each (worked out once)
  let run = null, clock = 0;                        // the test in progress, and its timer
  const show = (...nodes) => app.replaceChildren(...nodes.flat().filter(Boolean));   // (replaceChildren would print a null as "null")
  const go = (hash) => { if (location.hash !== hash) location.hash = hash; else route(); };
  function route() {
    clearInterval(clock);
    const [id, part, sub] = location.hash.slice(1).split('/');
    const t = byId[id];
    window.scrollTo(0, 0);
    top.hidden = !!t;
    if (!t) return home();
    if (part === 'test') return startTest(t, /^\d+$/.test(sub ?? '') ? Math.min(Math.max(1, +sub), t.bank.count) : Math.min(standard(t), t.bank.count));
    if (part === 'learn') return sub ? learn(t, sub) : learnHome(t);
    if (part && /^\d+$/.test(part)) return practice(t, Math.min(Math.max(1, +part), t.bank.count));
    return testHome(t);
  }
  const extra = (t, open) => (t.aside ? el('details', { className: 'aside', open: open || !!t.asideOpen }, el('summary', {}, t.asideName || 'Formulas'), t.aside()) : null);
  function kindsOf(t) {
    if (!topics.has(t)) {
      const byTopic = new Map(), hard = new Map();
      for (let n = 1; n <= t.bank.count; n++) {
        const name = t.bank.make(n).topic;
        if (!byTopic.has(name)) byTopic.set(name, []);
        byTopic.get(name).push(n);
        if (t.order) hard.set(name, (hard.get(name) || 0) + t.order(n));
      }
      const names = [...byTopic.keys()], level = (name) => hard.get(name) / byTopic.get(name).length;
      if (t.order) names.sort((a, b) => level(a) - level(b));
      topics.set(t, { names, byTopic });
    }
    return topics.get(t);
  }
  const progressOf = (t) => store.get(t.bank.id + '.learn') || {};   // topic → { streak, right, tried, learned }
  const learnedIn = (p) => Object.values(p).filter((s) => s.learned).length;

  // ---------- the cards ----------
  function home() {
    document.title = document.body.dataset.title;
    show(el('div', { className: 'grid' }, ...tests.map((t) => {
      const best = store.get(t.bank.id + '.best'), learned = learnedIn(progressOf(t));
      return el('a', { className: 'card', href: '#' + t.bank.id },
        el('b', {}, t.name), el('span', { className: 'count' }, `${t.blurb} ${t.bank.count} variants.`),
        el('span', { className: 'best' + (best ? ' has' : '') }, best ? `Best: ${best.text}` : 'Not taken yet'),
        learned ? el('span', { className: 'best has' }, `${plural(learned, 'topic')} learned`) : null);
    })));
  }

  // ---------- one test's page: start a test, learn, or practise any variant ----------
  function testHome(t) {
    document.title = `${t.name} · ${document.body.dataset.title}`;
    const { names } = kindsOf(t), learned = learnedIn(progressOf(t));
    const howMany = el('input', { type: 'number', min: 1, max: t.bank.count, value: Math.min(standard(t), t.bank.count), className: 'num' });
    howMany.setAttribute('aria-label', 'Number of questions');
    const begin = () => { const len = Math.min(Math.max(1, Math.round(+howMany.value) || standard(t)), t.bank.count); go(`#${t.bank.id}/test${len === standard(t) ? '' : '/' + len}`); };
    howMany.addEventListener('keydown', (e) => { if (e.key === 'Enter') begin(); });
    const pickN = el('input', { type: 'number', min: 1, max: t.bank.count, value: 1, className: 'num' });
    pickN.setAttribute('aria-label', 'Variant number');
    const open = () => go(`#${t.bank.id}/${Math.min(Math.max(1, Math.round(+pickN.value) || 1), t.bank.count)}`);
    pickN.addEventListener('keydown', (e) => { if (e.key === 'Enter') open(); });
    const best = store.get(t.bank.id + '.best');
    show(
      el('a', { className: 'back', href: '#' }, '← All tests'),
      el('h2', { className: 'tname' }, t.name),
      el('p', { className: 'lead small' }, t.about),
      el('div', { className: 'start' },
        el('button', { className: 'btn primary big', onclick: begin }, 'Start a test'),
        el('label', { className: 'muted' }, howMany, ' questions')),
      el('p', { className: 'muted note' }, t.amc
        ? 'Random problems in a random order every time. Scored like the AMC 10: 6 points for right, 1.5 for blank, 0 for wrong (150 for 25 questions), with 3 minutes a question.'
        : `Random variants out of ${t.bank.count} in a random order every time, checked as you go.`),
      best ? el('p', { className: 'muted best-line' }, `Your best: ${best.text}`) : null,
      el('h3', {}, 'Learn'),
      el('div', { className: 'start' },
        el('a', { className: 'btn', href: `#${t.bank.id}/learn` }, 'Learn topic by topic'),
        el('span', { className: 'muted' }, `No clock, hints a step at a time. ${learned} of ${names.length} topics learned.`)),
      el('h3', {}, 'Practice'),
      el('div', { className: 'start' },
        el('label', { className: 'muted' }, 'Variant ', pickN, ` of ${t.bank.count}`),
        el('button', { className: 'btn', onclick: open }, 'Open'),
        el('button', { className: 'btn', onclick: () => go(`#${t.bank.id}/${random(t)}`) }, 'Random variant')),
      el('h3', {}, `What's in it`),
      el('ul', { className: 'kinds' }, ...names.map((k) => el('li', {}, k))),
      extra(t, true));
  }

  // ---------- a question: its text, figure, and a way to answer ----------
  // feedback: say right or wrong straight away (practice and the checked tests); otherwise just remember the answer (AMC).
  // learn: a wrong answer can be tried again (onWrong), hints show the working a step at a time (onHelp), onAnswer comes
  // once it's right, and onReveal if the whole working is shown first
  function card(q, { feedback, learn, onAnswer, given, onSkip, onWrong, onHelp, onReveal }) {
    const box = el('div', { className: 'q' },
      el('div', { className: 'qhead' }, el('span', {}, q.topic), el('span', { className: 'muted' }, `Variant ${q.n}`)),
      html('p', 'qtext', q.text));
    if (q.figure) box.append(html('div', 'fig', q.figure));
    const result = el('div', { className: 'result' });
    const working = el('details', { className: 'working', hidden: true }, el('summary', {}, 'Show the working'));
    working.append(html('div', 'sol', q.solution));
    let answered = false;
    const reveal = (ok) => {
      result.className = 'result ' + (ok ? 'good' : 'bad');
      result.innerHTML = ok ? '✓ Right.' : `✗ ${ok === null ? 'Skipped.' : 'Not quite.'} The answer is <b>${shown(q.answer)}</b>.`;
      working.hidden = false;
      if (!ok) working.open = true;
    };
    const finish = (value) => {
      if (answered && feedback) return;
      answered = true;
      const ok = isRight(q.answer, value);
      if (feedback) reveal(ok);
      onAnswer(value, ok);
    };
    // learning: the working comes out a sentence at a time, and all of it once the answer is right
    const parts = steps(q.solution), sol = el('div', { className: 'sol', hidden: true });
    let out = 0;
    const more = (k) => {
      if (!answered) onHelp();
      out = Math.min(parts.length, out + k);
      sol.innerHTML = parts.slice(0, out).join(' ');
      sol.hidden = false;
      hint.textContent = out === parts.length - 1 ? 'Last hint' : `Hint ${out + 1} of ${parts.length}`;
      if (out === parts.length) { hints.hidden = true; if (!answered) onReveal(); }
    };
    const hint = el('button', { className: 'btn', hidden: parts.length < 2, onclick: () => more(1) }, `Hint 1 of ${parts.length}`);
    const hints = el('div', { className: 'hints' }, hint, el('button', { className: 'btn', onclick: () => more(parts.length) }, 'Show the working'));
    const tryAgain = () => { result.className = 'result bad'; result.textContent = 'Not quite. Try again, or take a hint.'; onWrong(); };
    const gotIt = (value) => { answered = true; result.className = 'result good'; result.textContent = '✓ Right.'; more(parts.length); onAnswer(value, true); };
    if (q.answer.kind === 'choice') {
      const list = el('div', { className: 'choices' });
      q.answer.choices.forEach((c, i) => {
        const b = el('button', { className: 'choice' + (given === i ? ' picked' : ''), onclick: () => {
          if (answered && (feedback || learn)) return;
          if (learn) {
            if (i !== q.answer.correct) { b.classList.add('wrong'); b.disabled = true; return tryAgain(); }
            b.classList.add('right');
            return gotIt(i);
          }
          for (const x of list.children) x.classList.remove('picked');
          b.classList.add('picked');
          if (feedback) { b.classList.add(i === q.answer.correct ? 'right' : 'wrong'); list.children[q.answer.correct].classList.add('right'); }
          finish(i);
        } });
        b.append(el('span', { className: 'letter' }, `(${LETTERS[i]})`), html('span', 'cv', c));
        list.append(b);
      });
      box.append(list);
    } else {
      const input = el('input', { type: 'text', inputMode: 'decimal', autocomplete: 'off', spellcheck: false, className: 'ans', placeholder: 'Your answer', value: given ?? '' });
      input.setAttribute('aria-label', 'Your answer');
      const check = el('button', { className: 'btn primary', onclick: () => {
        if (answered) return;
        if (readNumber(input.value) == null) { input.focus(); result.className = 'result bad'; result.textContent = 'Type a number (like 12.5, −3 or 3/4).'; return; }
        if (learn) {
          if (!isRight(q.answer, input.value)) { input.select(); return tryAgain(); }
          input.readOnly = true; check.disabled = true;
          return gotIt(input.value);
        }
        input.readOnly = true; check.disabled = true; skip.hidden = true;
        finish(input.value);
      } }, 'Check');
      const skip = el('button', { className: 'btn', hidden: !onSkip, onclick: () => { if (answered) return; answered = true; input.readOnly = true; check.disabled = true; skip.hidden = true; reveal(null); onSkip(); } }, 'Skip');
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check.click(); });
      box.append(el('div', { className: 'answer' }, input, q.answer.unit ? el('span', { className: 'unit' }, q.answer.unit) : null, check, skip));
      requestAnimationFrame(() => input.focus({ preventScroll: true }));
    }
    box.append(result, ...(learn ? [hints, sol] : [working]));
    return box;
  }

  // ---------- practice: any variant, check it, see the working ----------
  function practice(t, n) {
    document.title = `${t.name} ${n} · ${document.body.dataset.title}`;
    const q = t.bank.make(n);
    const next = el('button', { className: 'btn', disabled: n >= t.bank.count, onclick: () => go(`#${t.bank.id}/${n + 1}`) }, 'Next ›');
    show(
      el('div', { className: 'pnav btns' },
        el('a', { className: 'back', href: '#' + t.bank.id }, '← ' + t.name),
        el('span', { className: 'grow' }),
        el('button', { className: 'btn', disabled: n <= 1, onclick: () => go(`#${t.bank.id}/${n - 1}`) }, '‹ Previous'),
        el('button', { className: 'btn', onclick: () => go(`#${t.bank.id}/${random(t)}`) }, 'Random'),
        next),
      card(q, { feedback: true, onAnswer: () => requestAnimationFrame(() => next.focus({ preventScroll: true })) }),
      extra(t, false));
  }

  // ---------- learning: pick a topic (or mix them all), no clock, as many tries as it takes ----------
  function learnHome(t) {
    document.title = `Learn ${t.name} · ${document.body.dataset.title}`;
    const { names } = kindsOf(t), p = progressOf(t);
    const status = (s) => (!s ? 'Not started' : s.learned ? `✓ Learned · ${s.right} of ${s.tried} right` : s.streak ? `${s.streak} of ${GOAL} in a row` : `${s.right} of ${s.tried} right`);
    show(
      el('a', { className: 'back', href: '#' + t.bank.id }, '← ' + t.name),
      el('h2', { className: 'tname' }, `Learn: ${t.name}`),
      el('p', { className: 'lead small' }, `One topic at a time, at your own pace: no clock, as many tries as you need, and hints that show the working a step at a time. A topic is learned once you get ${GOAL} right in a row on the first try, without hints.`),
      el('div', { className: 'start' },
        el('a', { className: 'btn primary big', href: `#${t.bank.id}/learn/all` }, 'Mix all the topics'),
        el('span', { className: 'muted' }, `${learnedIn(p)} of ${names.length} topics learned.`),
        el('span', { className: 'grow' }),
        Object.keys(p).length ? el('button', { className: 'btn', onclick: () => { if (confirm(`Forget what you've learned in ${t.name}?`)) { store.set(t.bank.id + '.learn', {}); learnHome(t); } } }, 'Start over') : null),
      el('h3', {}, 'Topics'),
      el('div', { className: 'grid topics' }, ...names.map((name, k) => el('a', { className: 'card topic', href: `#${t.bank.id}/learn/${k}` },
        el('b', {}, name), el('span', { className: 'status' + (p[name]?.learned ? ' learned' : '') }, status(p[name]))))),
      extra(t, false));
  }
  function learn(t, which) {
    const { names, byTopic } = kindsOf(t), mixed = which === 'all', k = +which;
    if (!mixed && !(Number.isInteger(k) && k >= 0 && k < names.length)) return go(`#${t.bank.id}/learn`);
    document.title = `Learn ${mixed ? t.name : names[k]} · ${document.body.dataset.title}`;
    const p = progressOf(t), seen = new Set();
    const stat = (name) => (p[name] ??= { streak: 0, right: 0, tried: 0, learned: false });
    const dots = (s) => el('span', { className: 'dots', title: `${Math.min(s?.streak ?? 0, GOAL)} of ${GOAL} in a row` },
      ...Array.from({ length: GOAL }, (_, i) => el('span', { className: s?.learned || i < (s?.streak ?? 0) ? 'on' : '' })));
    function ask() {
      // mixed: any topic not learned yet (or any at all, once they all are); a topic: its variants, new ones first
      const open = names.filter((n) => !p[n]?.learned), name = mixed ? pick(open.length ? open : names) : names[k];
      const all = byTopic.get(name), fresh = all.filter((n) => !seen.has(n)), n = pick(fresh.length ? fresh : all);
      seen.add(n);
      const q = t.bank.make(n);
      let clean = true, settled = false;
      const head = el('div', { className: 'learnhead' });
      const paint = () => head.replaceChildren(...[
        el('b', {}, mixed ? `Mixed: ${learnedIn(p)} of ${names.length} topics learned` : name),
        mixed ? el('span', { className: 'muted' }, `This one: ${name}`) : null,
        dots(p[name]),
        el('span', { className: 'muted' }, p[name]?.learned ? '✓ Learned' : `${Math.min(p[name]?.streak ?? 0, GOAL)} of ${GOAL} in a row`)].filter(Boolean));
      const note = el('p', { className: 'learned-note', hidden: true });
      const following = mixed ? -1 : names.map((_, j) => (k + 1 + j) % names.length).find((j) => j !== k && !p[names[j]]?.learned) ?? -1;
      const nextTopic = el('a', { className: 'btn', hidden: true, href: following >= 0 ? `#${t.bank.id}/learn/${following}` : `#${t.bank.id}/learn` }, following >= 0 ? `Next topic: ${names[following]} ›` : 'All topics');
      const settle = (right) => {
        if (settled) return;
        settled = true;
        const s = stat(name);
        s.tried++;
        if (right) s.right++;
        s.streak = right && clean ? s.streak + 1 : 0;
        if (s.streak >= GOAL && !s.learned) {
          s.learned = true;
          note.hidden = false;
          note.textContent = mixed ? `You've learned ${name}!` : 'Topic learned! Keep going, or move on to another topic.';
          nextTopic.hidden = mixed;
        }
        store.set(t.bank.id + '.learn', p);
        paint();
      };
      const next = el('button', { className: 'btn primary', hidden: true, onclick: () => { settle(false); window.scrollTo(0, 0); ask(); } }, 'Next question ›');
      const ready = () => { next.hidden = false; requestAnimationFrame(() => next.focus({ preventScroll: true })); };
      const body = card(q, { learn: true, onWrong: () => { clean = false; }, onHelp: () => { clean = false; }, onReveal: ready, onAnswer: () => { settle(true); ready(); } });
      paint();
      show(
        el('div', { className: 'pnav' }, el('a', { className: 'back', href: `#${t.bank.id}/learn` }, '← Topics'), el('span', { className: 'grow' })),
        head, body, note,
        el('div', { className: 'start' }, next, nextTopic),
        extra(t, false));
    }
    ask();
  }

  // ---------- a test ----------
  function startTest(t, length) {
    document.title = `${t.name} test · ${document.body.dataset.title}`;
    // a test is spread over every kind of question (each kind once before any kind twice), in a random order
    const { kinds, count } = t.bank;
    const pool = Array.from({ length: kinds }, (_, k) => shuffle(Array.from({ length: Math.ceil((count - k) / kinds) }, (_, j) => k + 1 + j * kinds)));
    const list = [];
    while (list.length < length) for (const k of shuffle([...pool.keys()])) if (list.length < length && pool[k].length) list.push(pool[k].pop());
    run = { t, list: shuffle(list), i: 0, given: [], started: Date.now() };
    showQuestion();
  }
  function startClock(timer, limit) {
    clearInterval(clock);
    const paint = () => {
      if (!timer.isConnected) return clearInterval(clock);
      const s = Math.floor((Date.now() - run.started) / 1000);
      timer.textContent = clockText(s) + (limit ? ` of ${clockText(limit)}` : '');
      timer.classList.toggle('over', !!limit && s > limit);
    };
    paint();
    clock = setInterval(paint, 1000);
  }
  function showQuestion() {
    const { t, list, i } = run, q = t.bank.make(list[i]), last = i === list.length - 1;
    const move = (to) => { run.i = to; window.scrollTo(0, 0); showQuestion(); };
    const timer = el('span', { className: 'muted timer' });
    let bar;
    if (t.amc) {
      // AMC: answer in any order, change your mind, leave some blank
      const next = el('button', { className: 'btn primary', hidden: last, onclick: () => move(i + 1) }, 'Next ›');
      const body = card(q, { feedback: false, given: run.given[i], onAnswer: (value) => { run.given[i] = value; map.children[i].classList.add('done'); } });
      const map = el('div', { className: 'qmap' }, ...list.map((_, k) => el('button', {
        className: (run.given[k] != null ? 'done' : '') + (k === i ? ' now' : ''), title: `Question ${k + 1}`, onclick: () => move(k),
      }, String(k + 1))));
      bar = [map, el('p', { className: 'muted qcount' }, `Question ${i + 1} of ${list.length}`), body,
        el('div', { className: 'start' },
          el('button', { className: 'btn', disabled: i === 0, onclick: () => move(i - 1) }, '‹ Back'),
          el('button', { className: 'btn', onclick: () => { run.given[i] = null; if (last) showQuestion(); else move(i + 1); } }, 'Leave blank'),
          next,
          el('span', { className: 'grow' }),
          el('button', { className: 'btn' + (last ? ' primary' : ''), onclick: results }, 'Finish the test'))];
    } else {
      const next = el('button', { className: 'btn primary', hidden: true, onclick: () => (last ? results() : move(i + 1)) }, last ? 'See my score' : 'Next ›');
      const done = () => { next.hidden = false; requestAnimationFrame(() => next.focus({ preventScroll: true })); };
      const body = card(q, { feedback: true, onAnswer: (value) => { run.given[i] = value; done(); }, onSkip: () => { run.given[i] = null; done(); } });
      bar = [el('div', { className: 'progress' }, el('div', { style: `width:${(i / list.length) * 100}%` })),
        el('p', { className: 'muted qcount' }, `Question ${i + 1} of ${list.length}`), body, el('div', { className: 'start' }, next)];
    }
    show(el('div', { className: 'pnav' }, el('a', { className: 'back', href: '#' + t.bank.id }, '← Stop the test'), el('span', { className: 'grow' }), timer), ...bar, extra(t, false));
    startClock(timer, t.amc ? list.length * 3 * 60 : 0);   // the AMC 10's 75 minutes for 25 problems
  }
  function results() {
    clearInterval(clock);
    const { t, list, given, started } = run;
    const qs = list.map((n) => t.bank.make(n));
    const right = qs.map((q, i) => isRight(q.answer, given[i]));
    const correct = right.filter(Boolean).length, blank = list.filter((_, i) => given[i] == null).length;
    const score = t.amc ? correct * 6 + blank * 1.5 : correct, of = t.amc ? list.length * 6 : list.length;
    const text = t.amc ? `${fmt(score)} / ${of} (${correct} right, ${blank} blank)` : `${correct} / ${list.length}`;
    // a best score is for a full test: one of the usual length or longer
    const full = list.length >= Math.min(standard(t), t.bank.count), best = store.get(t.bank.id + '.best');
    const isBest = full && (!best || score / of > best.score / best.of);
    if (isBest) store.set(t.bank.id + '.best', { score, of, text, when: Date.now() });
    const mins = Math.max(1, Math.round((Date.now() - started) / 60000));
    const again = `#${t.bank.id}/test${list.length === standard(t) ? '' : '/' + list.length}`;
    run = null;
    window.scrollTo(0, 0);
    show(
      el('a', { className: 'back', href: '#' + t.bank.id }, '← ' + t.name),
      el('h2', { className: 'tname' }, 'Your score'),
      el('p', { className: 'score' }, text),
      el('p', { className: 'muted' }, (isBest ? 'A new best! ' : best ? `Your best: ${best.text}. ` : '')
        + (full ? '' : `Only tests of ${standard(t)} or more questions count for your best. `) + `It took about ${plural(mins, 'minute')}.`),
      el('div', { className: 'start' }, el('button', { className: 'btn primary', onclick: () => go(again) }, 'Take another test'), el('a', { className: 'btn', href: `#${t.bank.id}/learn` }, 'Learn'), el('a', { className: 'btn', href: '#' }, 'All tests')),
      el('h3', {}, 'Review'),
      el('div', { className: 'review' }, ...qs.map((q, i) => {
        const g = given[i];
        const yours = g == null ? 'left blank' : q.answer.kind === 'choice' ? `(${LETTERS[g]})` : `${g}`;
        const d = el('details', { className: 'rv ' + (right[i] ? 'good' : g == null ? 'blank' : 'bad') });
        d.append(el('summary', {}, el('span', { className: 'mark' }, right[i] ? '✓' : g == null ? '–' : '✗'), `${i + 1}. ${q.topic}`, el('span', { className: 'muted' }, ` · variant ${q.n} · you: ${yours}`)));
        d.append(html('p', 'qtext', q.text));
        if (q.figure) d.append(html('div', 'fig', q.figure));
        d.append(html('p', 'answer-line', `Answer: <b>${shown(q.answer)}</b>`), html('div', 'sol', q.solution));
        return d;
      })));
  }

  // start once everything above is set up (a link straight to a test or a variant opens it)
  addEventListener('hashchange', route);
  route();
}
