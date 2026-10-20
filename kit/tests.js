// Fluentio's test runner, shared by the Math, Science and Physics pages: a card for each test, a test of random variants
// with a score (your best is kept in this browser), and practice by variant number with worked solutions.
// Links: #triangles opens a test's page, #triangles/test starts a test, #triangles/137 shows variant 137.
const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); for (const k of kids.flat()) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(k)); return n; };
const html = (tag, cls, markup) => { const n = el(tag, { className: cls }); n.innerHTML = markup; return n; };   // markup here is always the banks' own, never typed by anyone
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const store = { get: (k) => { try { return JSON.parse(localStorage.getItem('fluentio.' + k)); } catch { return null; } }, set: (k, v) => { try { localStorage.setItem('fluentio.' + k, JSON.stringify(v)); } catch {} } };
const clockText = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
const random = (t) => 1 + Math.floor(Math.random() * t.bank.count);
const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

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
const fmt = (v) => (v < 0 ? '−' : '') + Math.abs(v).toLocaleString('en-US', { maximumFractionDigits: 3 });
const shown = (answer) => (answer.kind === 'choice' ? `(${LETTERS[answer.correct]}) ${answer.choices[answer.correct]}` : `${fmt(answer.value)}${answer.unit ? (answer.unit === '°' ? '°' : ' ' + answer.unit) : ''}`);

// the page: tests = [{ bank, name, blurb, about, length, amc, order(n), aside(), asideName, asideOpen }]
export function testsPage({ tests }) {
  const app = document.getElementById('app'), top = document.getElementById('top');   // top: the page's title, shown on the cards only
  const byId = Object.fromEntries(tests.map((t) => [t.bank.id, t]));
  const topics = new Map();                         // each test's kinds of question, in order (worked out once)
  let run = null, clock = 0;                        // the test in progress, and its timer
  const show = (...nodes) => app.replaceChildren(...nodes.flat().filter(Boolean));   // (replaceChildren would print a null as "null")
  const go = (hash) => { if (location.hash !== hash) location.hash = hash; else route(); };
  function route() {
    clearInterval(clock);
    const [id, part] = location.hash.slice(1).split('/');
    const t = byId[id];
    window.scrollTo(0, 0);
    top.hidden = !!t;
    if (!t) return home();
    if (part === 'test') return startTest(t);
    if (part && /^\d+$/.test(part)) return practice(t, Math.min(Math.max(1, +part), t.bank.count));
    return testHome(t);
  }
  const extra = (t, open) => (t.aside ? el('details', { className: 'aside', open: open || !!t.asideOpen }, el('summary', {}, t.asideName || 'Formulas'), t.aside()) : null);

  // ---------- the cards ----------
  function home() {
    document.title = document.body.dataset.title;
    show(el('div', { className: 'grid' }, ...tests.map((t) => {
      const best = store.get(t.bank.id + '.best');
      return el('a', { className: 'card', href: '#' + t.bank.id },
        el('b', {}, t.name), el('span', { className: 'count' }, `${t.blurb} ${t.bank.count} variants.`),
        el('span', { className: 'best' + (best ? ' has' : '') }, best ? `Best: ${best.text}` : 'Not taken yet'));
    })));
  }

  // ---------- one test's page: start a test, or practise any variant ----------
  function testHome(t) {
    document.title = `${t.name} · ${document.body.dataset.title}`;
    if (!topics.has(t)) { const seen = new Set(); for (let n = 1; n <= t.bank.count; n++) seen.add(t.bank.make(n).topic); topics.set(t, [...seen]); }
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
        el('button', { className: 'btn primary big', onclick: () => go(`#${t.bank.id}/test`) }, `Start a ${t.amc ? 25 : t.length}-question test`),
        el('span', { className: 'muted' }, t.amc ? 'Scored like the AMC 10: 6 points for right, 1.5 for blank, 0 for wrong, out of 150.' : `${t.length} random variants out of ${t.bank.count}, checked as you go.`)),
      best ? el('p', { className: 'muted best-line' }, `Your best: ${best.text}`) : null,
      el('h3', {}, 'Practice'),
      el('div', { className: 'start' },
        el('label', { className: 'muted' }, 'Variant ', pickN, ` of ${t.bank.count}`),
        el('button', { className: 'btn', onclick: open }, 'Open'),
        el('button', { className: 'btn', onclick: () => go(`#${t.bank.id}/${random(t)}`) }, 'Random variant')),
      el('h3', {}, `What's in it`),
      el('ul', { className: 'kinds' }, ...topics.get(t).map((k) => el('li', {}, k))),
      extra(t, true));
  }

  // ---------- a question: its text, figure, and a way to answer ----------
  // feedback: say right or wrong straight away (practice and the checked tests); otherwise just remember the answer (AMC)
  function card(q, { feedback, onAnswer, given, onSkip }) {
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
    if (q.answer.kind === 'choice') {
      const list = el('div', { className: 'choices' });
      q.answer.choices.forEach((c, i) => {
        const b = el('button', { className: 'choice' + (given === i ? ' picked' : ''), onclick: () => {
          if (answered && feedback) return;
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
        input.readOnly = true; check.disabled = true; skip.hidden = true;
        finish(input.value);
      } }, 'Check');
      const skip = el('button', { className: 'btn', hidden: !onSkip, onclick: () => { if (answered) return; answered = true; input.readOnly = true; check.disabled = true; skip.hidden = true; reveal(null); onSkip(); } }, 'Skip');
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check.click(); });
      box.append(el('div', { className: 'answer' }, input, q.answer.unit ? el('span', { className: 'unit' }, q.answer.unit) : null, check, skip));
      requestAnimationFrame(() => input.focus({ preventScroll: true }));
    }
    box.append(result, working);
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

  // ---------- a test ----------
  function startTest(t) {
    document.title = `${t.name} test · ${document.body.dataset.title}`;
    // a test is spread over every kind of question: each kind once (in a random order) before any kind twice
    const { kinds, count } = t.bank, length = t.amc ? 25 : t.length;
    const pool = Array.from({ length: kinds }, (_, k) => shuffle(Array.from({ length: Math.ceil((count - k) / kinds) }, (_, j) => k + 1 + j * kinds)));
    const list = [];
    while (list.length < length) for (const k of shuffle([...pool.keys()])) if (list.length < length && pool[k].length) list.push(pool[k].pop());
    // AMC problems get harder as the test goes on, so a page can give its own order of difficulty
    if (t.order) list.sort((a, b) => t.order(a) - t.order(b));
    run = { t, list, i: 0, given: [], started: Date.now() };
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
    startClock(timer, t.amc ? 75 * 60 : 0);
  }
  function results() {
    clearInterval(clock);
    const { t, list, given, started } = run;
    const qs = list.map((n) => t.bank.make(n));
    const right = qs.map((q, i) => isRight(q.answer, given[i]));
    const correct = right.filter(Boolean).length, blank = list.filter((_, i) => given[i] == null).length;
    const score = t.amc ? correct * 6 + blank * 1.5 : correct, of = t.amc ? 150 : list.length;
    const text = t.amc ? `${fmt(score)} / 150 (${correct} right, ${blank} blank)` : `${correct} / ${list.length}`;
    const best = store.get(t.bank.id + '.best');
    const isBest = !best || score / of > best.score / best.of;
    if (isBest) store.set(t.bank.id + '.best', { score, of, text, when: Date.now() });
    const mins = Math.max(1, Math.round((Date.now() - started) / 60000));
    run = null;
    window.scrollTo(0, 0);
    show(
      el('a', { className: 'back', href: '#' + t.bank.id }, '← ' + t.name),
      el('h2', { className: 'tname' }, 'Your score'),
      el('p', { className: 'score' }, text),
      el('p', { className: 'muted' }, `${isBest ? 'A new best! ' : `Your best: ${best.text}. `}It took about ${mins} minute${mins === 1 ? '' : 's'}.`),
      el('div', { className: 'start' }, el('button', { className: 'btn primary', onclick: () => go(`#${t.bank.id}/test`) }, 'Take another test'), el('a', { className: 'btn', href: '#' }, 'All tests')),
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
