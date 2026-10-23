// Fluentio's test runner, shared by the Math, Science and Physics pages: a card for each test, a test of random variants
// with a score (your best is kept in this browser), learning a topic at a time with hints, and practice by variant
// number with worked solutions.
// Links: #triangles opens a test's page, #triangles/test starts a test (#triangles/test/40 one of 40 questions),
// #triangles/learn shows the learning path (#triangles/learn/3 its 4th topic, #triangles/learn/all mixed practice),
// and #triangles/137 shows variant 137.
const el = (tag, props = {}, ...kids) => { const n = Object.assign(document.createElement(tag), props); for (const k of kids.flat()) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(k)); return n; };
const html = (tag, cls, markup) => { const n = el(tag, { className: cls }); n.innerHTML = markup; return n; };   // markup here is always the banks' own, never typed by anyone
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const GOAL = 3;                                     // right in a row (first try, no hints) to learn a topic, unless a test says
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
// typed words: capitals, spaces and a final full stop don't matter; accents do (nearly() spots a slip in only those)
const words = (s) => String(s ?? '').normalize('NFC').trim().toLowerCase().replace(/\s+/g, ' ').replace(/[.!?]+$/, '');
const bare = (s) => words(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
export const nearly = (answer, given) => answer.kind === 'text' && given != null && !isRight(answer, given) && answer.accept.some((a) => bare(a) === bare(given));
// right if within the question's tolerance: { abs } is plus or minus that much, a plain number is a share of the answer;
// a typed answer is right if it's one of answer.accept
export function isRight(answer, given) {
  if (given == null) return false;
  if (answer.kind === 'choice') return given === answer.correct;
  if (answer.kind === 'text') return answer.accept.some((a) => words(a) === words(given));
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
const shown = (answer) => (answer.kind === 'choice' ? `(${LETTERS[answer.correct]}) ${answer.choices[answer.correct]}`
  : answer.kind === 'text' ? answer.accept[0] : `${fmt(answer.value)}${answer.unit ? (answer.unit === '°' ? '°' : ' ' + answer.unit) : ''}`);

// the page: tests = [{ bank, name, blurb, about, length, amc, order(n), learn, aside(), asideName, asideOpen }]
// order(n), if given, is how hard variant n is: without a path, learning lists the easier topics first.
// learn, if given, is { path: [{ unit, topics: [names] }], lessons: { name: { idea, how: [steps], watch: [traps], tip } }, goal,
// example }: the order to learn the topics in, a short lesson for each, how many right in a row learn a topic (3 if not
// given), and example: false to skip the worked example (for a word list, say, where it would add nothing).
// An answer is { kind: 'choice', choices, correct }, { kind: 'number', value, unit, tol }, or { kind: 'text', accept: [the
// right answers], keys: [letters to offer as buttons], lang }
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
  // learning progress, topic → { streak, right, tried, learned }: kept for this visit, and saved in this browser unless
  // someone turns that off (then it's gone when the page closes)
  const saving = () => store.get('learn.save') !== false;
  const memory = {};
  const progressOf = (t) => (memory[t.bank.id] ??= (saving() && store.get(t.bank.id + '.learn')) || {});
  const keep = (t) => { if (saving()) store.set(t.bank.id + '.learn', progressOf(t)); };
  const setSaving = (on) => {
    store.set('learn.save', on);
    for (const t of tests) if (on) keep(t); else try { localStorage.removeItem(`fluentio.${t.bank.id}.learn`); } catch {}
  };
  const learnedIn = (p) => Object.values(p).filter((s) => s.learned).length;
  // the order to learn in: the page's units, then any topic they leave out; without units, one list (easier first)
  function pathOf(t) {
    const { names } = kindsOf(t), units = (t.learn?.path || [{ unit: 'Topics', topics: names }])
      .map((u) => ({ unit: u.unit, topics: u.topics.filter((n) => names.includes(n)) })).filter((u) => u.topics.length);
    const listed = new Set(units.flatMap((u) => u.topics)), rest = names.filter((n) => !listed.has(n));
    if (rest.length) units.push({ unit: 'More', topics: rest });
    return units;
  }
  const sequence = (t) => pathOf(t).flatMap((u) => u.topics);
  const upNext = (t, p = progressOf(t)) => sequence(t).findIndex((n) => !p[n]?.learned);   // −1 once every topic is learned

  // ---------- the cards ----------
  function home() {
    document.title = document.body.dataset.title;
    show(el('div', { className: 'grid' }, ...tests.map((t) => {
      const best = store.get(t.bank.id + '.best'), learned = learnedIn(progressOf(t));
      return el('a', { className: 'card', href: '#' + t.bank.id },
        el('b', {}, t.name), el('span', { className: 'count' }, `${t.blurb} ${t.bank.count.toLocaleString('en-US')} variants.`),
        el('span', { className: 'best' + (best ? ' has' : '') }, best ? `Best: ${best.text}` : 'Not taken yet'),
        learned ? el('span', { className: 'best has' }, `${plural(learned, 'topic')} learned`) : null);
    })));
  }

  // ---------- one test's page: start a test, learn, or practise any variant ----------
  function testHome(t) {
    document.title = `${t.name} · ${document.body.dataset.title}`;
    const { names } = kindsOf(t), p = progressOf(t), learned = learnedIn(p), next = upNext(t, p);
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
        next >= 0 ? el('a', { className: 'btn', href: `#${t.bank.id}/learn/${next}` }, Object.keys(p).length ? `Continue: ${sequence(t)[next]}` : 'Start learning') : null,
        el('a', { className: 'btn', href: `#${t.bank.id}/learn` }, 'The learning path'),
        el('span', { className: 'muted' }, `Lessons, worked examples and practice, a topic at a time. ${learned} of ${names.length} topics learned.`)),
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
  // learn: a wrong answer can be tried again (onWrong, with the lesson's nudge if there is one), hints show the working a
  // step at a time (onHelp), onAnswer comes once it's right, and onReveal if the whole working is shown first
  function card(q, { feedback, learn, nudge, onAnswer, given, onSkip, onWrong, onHelp, onReveal }) {
    const box = el('div', { className: 'q' },
      el('div', { className: 'qhead' }, el('span', {}, q.topic), el('span', { className: 'muted' }, `Variant ${q.n}`)),
      html('p', 'qtext', q.text));
    if (q.figure) box.append(html('div', 'fig', q.figure));
    const result = el('div', { className: 'result' });
    const working = el('details', { className: 'working', hidden: true }, el('summary', {}, 'Show the working'));
    working.append(html('div', 'sol', q.solution));
    let answered = false;
    const reveal = (ok, value) => {
      result.className = 'result ' + (ok ? 'good' : 'bad');
      result.innerHTML = ok ? '✓ Right.' : `✗ ${ok === null ? 'Skipped.' : nearly(q.answer, value) ? 'Almost: check the accents.' : 'Not quite.'} The answer is <b>${shown(q.answer)}</b>.`;
      working.hidden = false;
      if (!ok) working.open = true;
    };
    const finish = (value) => {
      if (answered && feedback) return;
      answered = true;
      const ok = isRight(q.answer, value);
      if (feedback) reveal(ok, value);
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
    const tip = el('p', { className: 'nudge', hidden: true });
    const tryAgain = (value) => {
      result.className = 'result bad';
      result.textContent = nearly(q.answer, value) ? 'Almost: check the accents, then try again.' : nudge ? 'Not quite. Try again.' : 'Not quite. Try again, or take a hint.';
      if (nudge) { tip.innerHTML = `<b>Tip:</b> ${nudge}`; tip.hidden = false; }
      onWrong();
    };
    const gotIt = (value) => { answered = true; tip.hidden = true; result.className = 'result good'; result.textContent = '✓ Right.'; more(parts.length); onAnswer(value, true); };
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
      // a number, or (kind 'text') words, with buttons for the letters a keyboard may not have (answer.keys)
      const text = q.answer.kind === 'text';
      const input = el('input', { type: 'text', inputMode: text ? 'text' : 'decimal', autocomplete: 'off', autocapitalize: 'off', spellcheck: false, className: 'ans' + (text ? ' wide' : ''), placeholder: 'Your answer', value: given ?? '' });
      input.setAttribute('aria-label', 'Your answer');
      if (q.answer.lang) input.lang = q.answer.lang;
      const type = (ch) => {
        if (input.readOnly) return;
        const a = input.selectionStart ?? input.value.length, b = input.selectionEnd ?? a;
        input.value = input.value.slice(0, a) + ch + input.value.slice(b);
        input.focus();
        input.setSelectionRange(a + ch.length, a + ch.length);
      };
      const keys = text && q.answer.keys ? el('div', { className: 'keys' }, ...q.answer.keys.map((ch) => el('button', { className: 'key', type: 'button', onmousedown: (e) => e.preventDefault(), onclick: () => type(ch) }, ch))) : null;
      const check = el('button', { className: 'btn primary', onclick: () => {
        if (answered) return;
        if (text ? !input.value.trim() : readNumber(input.value) == null) { input.focus(); result.className = 'result bad'; result.textContent = text ? 'Type your answer first.' : 'Type a number (like 12.5, −3 or 3/4).'; return; }
        if (learn) {
          if (!isRight(q.answer, input.value)) { input.select(); return tryAgain(input.value); }
          input.readOnly = true; check.disabled = true;
          return gotIt(input.value);
        }
        input.readOnly = true; check.disabled = true; skip.hidden = true;
        finish(input.value);
      } }, 'Check');
      const skip = el('button', { className: 'btn', hidden: !onSkip, onclick: () => { if (answered) return; answered = true; input.readOnly = true; check.disabled = true; skip.hidden = true; reveal(null); onSkip(); } }, 'Skip');
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') check.click(); });
      box.append(el('div', { className: 'answer' }, input, q.answer.unit ? el('span', { className: 'unit' }, q.answer.unit) : null, check, skip), keys);
      requestAnimationFrame(() => input.focus({ preventScroll: true }));
    }
    box.append(result, ...(learn ? [tip, hints, sol] : [working]));
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

  // ---------- learning: a path of units, and each topic on it a lesson, a worked example, then practice ----------
  function learnHome(t) {
    const goal = t.learn?.goal ?? GOAL;
    document.title = `Learn ${t.name} · ${document.body.dataset.title}`;
    const units = pathOf(t), order = units.flatMap((u) => u.topics), p = progressOf(t), next = upNext(t, p), done = learnedIn(p);
    const status = (s) => (!s ? '' : s.learned ? 'learned' : s.streak ? `${s.streak} of ${goal} in a row` : `${s.right} of ${s.tried} right`);
    const save = el('input', { type: 'checkbox', checked: saving(), onchange: () => {
      if (!save.checked && !confirm('Stop saving your progress? What this device has saved will be forgotten; this visit keeps it until you close the page.')) { save.checked = true; return; }
      setSaving(save.checked);
      learnHome(t);
    } });
    show(
      el('a', { className: 'back', href: '#' + t.bank.id }, '← ' + t.name),
      el('h2', { className: 'tname' }, `Learn: ${t.name}`),
      el('p', { className: 'lead small' }, `${order.length} topics${units.length > 1 ? ` in ${units.length} units` : ''}, in an order where each builds on the ones before. Every topic starts with a short lesson${t.learn?.example === false ? '' : ' and a worked example'}, then practice with hints until you get ${goal} right in a row on the first try.`),
      el('div', { className: 'start' },
        next >= 0 ? el('a', { className: 'btn primary big', href: `#${t.bank.id}/learn/${next}` }, `${Object.keys(p).length ? 'Continue' : 'Start'}: ${order[next]}`)
          : el('span', { className: 'learned-note' }, '✓ Every topic learned!'),
        el('a', { className: 'btn', href: `#${t.bank.id}/learn/all` }, 'Mixed practice')),
      el('div', { className: 'progress' }, el('div', { style: `width:${(done / order.length) * 100}%` })),
      el('p', { className: 'muted qcount' }, `${done} of ${order.length} topics learned`),
      el('label', { className: 'save' }, save, ' Save my progress on this device', saving() ? null : el('span', { className: 'muted' }, ' (off: it lasts until you close the page)')),
      units.flatMap((u, i) => [
        el('h3', {}, `${units.length > 1 ? `${i + 1}. ` : ''}${u.unit}`, el('span', { className: 'unitcount' }, ` · ${u.topics.filter((n) => p[n]?.learned).length} of ${u.topics.length}`)),
        el('ol', { className: 'path' }, ...u.topics.map((name) => {
          const k = order.indexOf(name), s = p[name];
          return el('li', {}, el('a', { className: 'step' + (s?.learned ? ' learned' : '') + (k === next ? ' next' : ''), href: `#${t.bank.id}/learn/${k}` },
            el('span', { className: 'mark' }, s?.learned ? '✓' : String(k + 1)), el('span', { className: 'name' }, name), el('span', { className: 'muted' }, k === next ? 'up next' : status(s))));
        }))]),
      Object.keys(p).length ? el('div', { className: 'start' }, el('button', { className: 'btn', onclick: () => {
        if (confirm(`Forget what you've learned in ${t.name}?`)) { memory[t.bank.id] = {}; keep(t); learnHome(t); }
      } }, 'Start over')) : null,
      extra(t, false));
  }
  function learn(t, which) {
    const goal = t.learn?.goal ?? GOAL;
    const order = sequence(t), { byTopic } = kindsOf(t), mixed = which === 'all', k = +which;
    if (!mixed && !(Number.isInteger(k) && k >= 0 && k < order.length)) return go(`#${t.bank.id}/learn`);
    const topic = mixed ? null : order[k], lesson = (name) => t.learn?.lessons?.[name];
    document.title = `Learn ${topic ?? t.name} · ${document.body.dataset.title}`;
    const p = progressOf(t), seen = new Set(), units = pathOf(t);
    const stat = (name) => (p[name] ??= { streak: 0, right: 0, tried: 0, learned: false });
    // a variant of a topic, new ones first; the next topic on the path that isn't learned yet (−1 if none)
    const variant = (name) => { const all = byTopic.get(name), fresh = all.filter((n) => !seen.has(n)), n = pick(fresh.length ? fresh : all); seen.add(n); return n; };
    const after = (from) => { for (let j = 1; j <= order.length; j++) { const x = (from + j) % order.length; if (!p[order[x]]?.learned) return x; } return -1; };
    const dots = (s) => el('span', { className: 'dots', title: `${Math.min(s?.streak ?? 0, goal)} of ${goal} in a row` },
      ...Array.from({ length: goal }, (_, i) => el('span', { className: s?.learned || i < (s?.streak ?? 0) ? 'on' : '' })));
    let current = topic;                             // the topic of the question showing (in mixed practice it changes)
    const head = el('div', { className: 'learnhead' });
    const paint = () => {
      const s = p[current], unit = units.find((u) => u.topics.includes(current))?.unit;
      head.replaceChildren(...[
        el('b', {}, mixed ? `Mixed practice: ${learnedIn(p)} of ${order.length} topics learned` : current),
        el('span', { className: 'muted' }, mixed ? `This one: ${current}` : `${units.length > 1 ? unit + ' · ' : ''}topic ${k + 1} of ${order.length}`),
        dots(s),
        el('span', { className: 'muted' }, s?.learned ? '✓ Learned' : `${Math.min(s?.streak ?? 0, goal)} of ${goal} in a row`)]);
    };

    // a topic's stages: the lesson (when there is one), a worked example, and practice; mixed practice is only practice
    const stages = mixed ? ['practice'] : [lesson(topic) && 'lesson', t.learn?.example !== false && 'example', 'practice'].filter(Boolean);
    const LABEL = { lesson: 'Lesson', example: 'Worked example', practice: 'Practice' };
    const tabs = el('div', { className: 'tabs', hidden: stages.length < 2 }), stage = el('div');
    const views = {};
    function goTo(s) {
      tabs.replaceChildren(...stages.map((x, i) => el('button', { className: 'tab' + (x === s ? ' on' : ''), onclick: () => goTo(x) }, `${i + 1}. ${LABEL[x]}`)));
      stage.replaceChildren(views[s] ??= { lesson: lessonView, example: exampleView, practice: practiceView }[s]());
      window.scrollTo(0, 0);
    }
    function lessonView() {
      const l = lesson(topic);
      return el('div', { className: 'lesson' },
        html('div', 'idea', l.idea),
        el('h4', {}, 'How to do it'), el('ol', {}, ...l.how.map((s) => html('li', '', s))),
        el('h4', {}, 'Watch out for'), el('ul', {}, ...l.watch.map((s) => html('li', '', s))),
        el('div', { className: 'start' }, stages.includes('example')
          ? el('button', { className: 'btn primary', onclick: () => goTo('example') }, 'See a worked example ›')
          : el('button', { className: 'btn primary', onclick: () => goTo('practice') }, 'Start practicing ›')));
    }
    // a worked example: a real variant, its working shown a step at a time
    function exampleView() {
      const q = t.bank.make(variant(topic)), parts = steps(q.solution);
      const box = el('div', { className: 'q example' },
        el('div', { className: 'qhead' }, el('span', {}, 'Worked example'), el('span', { className: 'muted' }, `Variant ${q.n}`)),
        html('p', 'qtext', q.text));
      if (q.figure) box.append(html('div', 'fig', q.figure));
      const options = q.answer.kind === 'choice' ? el('div', { className: 'choices still' }, ...q.answer.choices.map((c, i) => el('div', { className: 'choice' }, el('span', { className: 'letter' }, `(${LETTERS[i]})`), html('span', 'cv', c)))) : null;
      const worked = el('ol', { className: 'worked' }), answer = html('p', 'answer-line', `Answer: <b>${shown(q.answer)}</b>`);
      answer.hidden = true;
      let out = 0;
      const reveal = (n) => {
        for (const s of parts.slice(out, out + n)) worked.append(html('li', '', s));
        out = Math.min(parts.length, out + n);
        one.textContent = `Step ${out + 1} of ${parts.length}`;
        if (out < parts.length) return;
        one.hidden = all.hidden = true; answer.hidden = false; tryIt.hidden = false;
        options?.children[q.answer.correct].classList.add('right');
      };
      const one = el('button', { className: 'btn primary', onclick: () => reveal(1) }, `Step 1 of ${parts.length}`);
      const all = el('button', { className: 'btn', onclick: () => reveal(parts.length) }, 'Show every step');
      const tryIt = el('button', { className: 'btn primary', hidden: true, onclick: () => goTo('practice') }, 'Now you try ›');
      box.append(...[options, worked, answer, el('div', { className: 'hints' }, one, all, tryIt)].filter(Boolean));
      return box;
    }
    // practice: as many tries as it takes; a topic is learned after `goal` right in a row on the first try without hints
    function practiceView() {
      const box = el('div');
      const ask = () => {
        const open = order.filter((n) => !p[n]?.learned), name = mixed ? pick(open.length ? open : order) : topic;
        const q = t.bank.make(variant(name));
        current = name;
        let clean = true, settled = false;
        const note = el('p', { className: 'learned-note', hidden: true });
        const onward = el('a', { className: 'btn primary', hidden: true });
        const settle = (right) => {
          if (settled) return;
          settled = true;
          const s = stat(name);
          s.tried++;
          if (right) s.right++;
          s.streak = right && clean ? s.streak + 1 : 0;
          if (s.streak >= goal && !s.learned) { s.learned = true; note.hidden = false; note.textContent = mixed ? `You've learned ${name}!` : 'Topic learned!'; }
          if (!mixed && s.learned) {
            const j = after(k);
            onward.href = j >= 0 ? `#${t.bank.id}/learn/${j}` : `#${t.bank.id}/learn`;
            onward.textContent = j >= 0 ? `Next topic: ${order[j]} ›` : 'Every topic learned: back to the path';
            onward.hidden = false; next.className = 'btn';
          }
          keep(t);
          paint();
        };
        const next = el('button', { className: 'btn primary', hidden: true, onclick: () => { settle(false); ask(); window.scrollTo(0, 0); } }, mixed ? 'Next question ›' : 'Another one ›');
        const ready = () => { next.hidden = false; requestAnimationFrame(() => (onward.hidden ? next : onward).focus({ preventScroll: true })); };
        const body = card(q, { learn: true, nudge: lesson(name)?.tip, onWrong: () => { clean = false; }, onHelp: () => { clean = false; }, onReveal: ready, onAnswer: () => { settle(true); ready(); } });
        paint();
        box.replaceChildren(...[body, note, el('div', { className: 'start' }, onward, next),
          mixed && lesson(name) ? el('p', { className: 'muted' }, 'Stuck? ', el('a', { href: `#${t.bank.id}/learn/${order.indexOf(name)}` }, `The lesson on ${name}`)) : null].filter(Boolean));
      };
      ask();
      return box;
    }

    paint();
    show(el('div', { className: 'pnav' }, el('a', { className: 'back', href: `#${t.bank.id}/learn` }, '← The learning path'), el('span', { className: 'grow' })),
      head, tabs, stage, extra(t, false));
    // a new topic starts at its lesson; one you've practised before starts at practice
    goTo(mixed || p[topic] ? 'practice' : stages[0]);
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
