// The Workspace: your notes, docs, tables and code, kept in this browser (look.js's fluentio.workspace; Settings can
// download a backup). On the left, each kind with its things, newest first, and a filter. In the middle, the open one:
// a note in Markdown ([[a note's name]] links to it, Preview shows it laid out), a doc (your own writing, and a Google
// Docs, Slides or Sheets link to open), a table (type in it, add rows and columns, CSV in and out), or code (JavaScript
// runs, in a worker of its own). On the right, what's in it: a note's outline and its links both ways, a doc's words,
// a table's numbers, a file's lines.
// Links: #note/<id> (or doc, table, code) opens one, and #new/note (and so on) makes one.
const f = window.fluentio;
const { el, svg } = f;
const $ = (id) => document.getElementById(id);
const ws = $('ws'), tree = $('tree'), editor = $('editor'), info = $('info'), filterBox = $('filter');
const KINDS = {
  note: { name: 'Note', group: 'Notes', icon: 'note', color: 'var(--accent-2)', blurb: 'Markdown, with [[links]] between notes', make: () => ({ title: 'Untitled note', text: '' }) },
  doc: { name: 'Doc', group: 'Docs', icon: 'doc', color: 'var(--accent)', blurb: 'An essay, or a Google Doc to keep close', make: () => ({ title: 'Untitled doc', text: '', link: '' }) },
  table: { name: 'Table', group: 'Data', icon: 'table', color: 'var(--good)', blurb: 'Rows and columns, with CSV in and out', make: () => ({ title: 'Untitled table', cols: ['A', 'B', 'C'], rows: [['', '', ''], ['', '', ''], ['', '', '']] }) },
  code: { name: 'Code', group: 'Code', icon: 'code', color: 'var(--plot2)', blurb: 'A file of code, and JavaScript runs', make: () => ({ title: 'untitled.js', text: "// Press Run to try it: what you log shows underneath\nconsole.log('Hello from Fluentio')\n" }) },
};

// ---------- your things, and saving them ----------
// (an item as it should be, whatever is in storage: text for notes, docs and code, and a table's rows all as wide as it)
function clean(list) {
  return list.filter((x) => KINDS[x.kind]).map((x) => {
    const it = { ...x, title: String(x.title ?? ''), made: +x.made || Date.now(), edited: +x.edited || Date.now() };
    if (x.kind === 'table') {
      it.cols = Array.isArray(x.cols) && x.cols.length ? x.cols.map((c) => String(c ?? '')) : ['A'];
      it.rows = (Array.isArray(x.rows) ? x.rows : []).map((r) => it.cols.map((_, c) => String((Array.isArray(r) ? r[c] : '') ?? '')));
    } else it.text = String(x.text ?? '');
    if (x.kind === 'doc') it.link = String(x.link ?? '');
    return it;
  });
}
let items = clean(f.workspace.items());
let current = null, timer = 0, dirty = false, pending = 0, hooks = {};
const shut = new Set(f.read('fluentio.ws.shut') || []);
const modes = new Map();                            // a note's Edit or Preview, for this visit
const sorted = () => [...items].sort((a, b) => b.edited - a.edited);
const byId = (id) => items.find((x) => x.id === id);
const saved = el('span', { className: 'saved', 'aria-live': 'polite' });
function save(now) {
  dirty = true;
  clearTimeout(timer);
  const go = () => {
    dirty = false;
    const ok = f.workspace.save(items);
    if (ok) dispatchEvent(new CustomEvent('fluentio:workspace'));   // (the sidebar lists your latest things)
    saved.textContent = ok ? 'Saved' : "Couldn't save: this browser's storage is full or turned off";
    saved.className = 'saved show' + (ok ? '' : ' bad');
    clearTimeout(saved.hide);
    if (ok) saved.hide = setTimeout(() => saved.classList.remove('show'), 1400);
  };
  if (now) go(); else timer = setTimeout(go, 350);
}
const flush = () => { if (dirty) { clearTimeout(timer); dirty = false; f.workspace.save(items); } };
addEventListener('pagehide', flush);
addEventListener('beforeunload', flush);
// something changed: save it soon, and redraw the list and the right pane once this frame
function touch(it) {
  it.edited = Date.now();
  save();
  if (!pending) pending = requestAnimationFrame(() => { pending = 0; drawTree(); drawInfo(); });
}
// another tab changed them: take its version, but keep the one you're typing in
addEventListener('storage', (e) => {
  if (e.key !== 'fluentio.workspace') return;
  const mine = byId(current), typing = editor.contains(document.activeElement);
  items = clean(f.workspace.items()).map((x) => (typing && mine && x.id === mine.id ? mine : x));
  const it = byId(current);
  if (!it) return route();
  drawTree();
  drawInfo();
  if (!typing) drawEditor(it);
});

// ---------- opening and making ----------
function route() {
  let hash = location.hash.slice(1);
  try { hash = decodeURIComponent(hash); } catch {}
  const [kind, id] = hash.split('/');
  if (kind === 'new' && KINDS[id]) return make(id);
  const it = KINDS[kind] && byId(id);
  if (it) return open(it);
  const first = sorted()[0];
  if (first) { history.replaceState(null, '', `#${first.kind}/${first.id}`); return open(first); }
  history.replaceState(null, '', location.pathname + location.search);
  open(null);
}
// a new thing (pushed onto the history when a link made it, so Back goes to where you were)
function make(kind, extra = {}, push = false) {
  const now = Date.now();
  const it = { id: now.toString(36) + Math.random().toString(36).slice(2, 7), kind, ...KINDS[kind].make(), ...extra, made: now, edited: now };
  items.unshift(it);
  save(true);
  history[push ? 'pushState' : 'replaceState'](null, '', `#${kind}/${it.id}`);
  open(it, true);
  return it;
}
function open(it, fresh) {
  current = it ? it.id : null;
  ws.classList.toggle('open', !!it);
  ws.classList.remove('details');
  drawTree();
  drawEditor(it, fresh);
  drawInfo();
  document.title = `${it ? `${it.title || 'Untitled'} · ` : ''}${f.settings.workspaceTitle} · ${f.settings.name}`;
}
// a [[link]]: the note or doc with that name, or a new note with it
const named = (name) => { const key = name.trim().toLowerCase(); return items.find((x) => (x.kind === 'note' || x.kind === 'doc') && x.title.trim().toLowerCase() === key); };
function openTitle(name) {
  const it = named(name);
  if (it) location.hash = `#${it.kind}/${it.id}`;
  else make('note', { title: name.trim() }, true);
}
function remove(it) {
  items = items.filter((x) => x !== it);
  save(true);
  const next = sorted().find((x) => x.kind === it.kind) || sorted()[0];
  history.replaceState(null, '', next ? `#${next.kind}/${next.id}` : location.pathname + location.search);
  open(next || null);
}
addEventListener('hashchange', route);
addEventListener('keydown', (e) => { if (e.key === 'Escape' && ws.classList.contains('details')) ws.classList.remove('details'); });

// ---------- the left pane ----------
function drawTree() {
  const q = filterBox.value.trim().toLowerCase();
  tree.replaceChildren(...Object.entries(KINDS).map(([kind, K]) => {
    const all = sorted().filter((x) => x.kind === kind);
    const list = q ? all.filter((x) => x.title.toLowerCase().includes(q) || (x.text || '').toLowerCase().includes(q)) : all;
    const closed = shut.has(kind) && !q;
    const group = el('section', { className: 'group' + (closed ? ' shut' : '') },
      el('div', { className: 'group-head' },
        el('button', { type: 'button', className: 'group-name', 'aria-expanded': String(!closed), onclick: () => {
          if (shut.has(kind)) shut.delete(kind); else shut.add(kind);
          f.write('fluentio.ws.shut', [...shut]);
          drawTree();
        } }, svg('chevron'), K.group, el('span', { className: 'count' }, String(list.length))),
        el('a', { className: 'add', href: `#new/${kind}`, title: `New ${K.name.toLowerCase()}`, 'aria-label': `New ${K.name.toLowerCase()}` }, svg('plus'))),
      closed ? null : list.length
        ? el('ul', { className: 'items' }, list.map((x) => el('li', {}, el('a', { className: 'item' + (x.id === current ? ' on' : ''), href: `#${kind}/${x.id}`, 'aria-current': x.id === current ? 'page' : null }, svg(K.icon), el('span', {}, x.title || 'Untitled')))))
        : el('p', { className: 'empty-group' }, q ? 'Nothing matches.' : `No ${K.group.toLowerCase()} yet.`));
    group.style.setProperty('--k', K.color);
    return group;
  }));
}
filterBox.addEventListener('input', drawTree);

// ---------- the middle ----------
// a text box as tall as what's in it (the pane scrolls, not the box), without the pane jumping while it's measured
function fit(t) {
  if (!t.isConnected || t.hidden) return;
  const top = editor.scrollTop;
  t.style.height = 'auto';
  t.style.height = `${t.scrollHeight}px`;
  editor.scrollTop = top;
}
// typing into a text box the way the keyboard would (so Undo still works)
function insert(t, text) {
  if (!document.execCommand('insertText', false, text)) {
    t.setRangeText(text, t.selectionStart, t.selectionEnd, 'end');
    t.dispatchEvent(new Event('input'));
  }
}
function drawEditor(it, fresh) {
  hooks = {};
  if (!it) { editor.replaceChildren(welcome()); return; }
  const K = KINDS[it.kind];
  const title = el('input', { className: 'ed-title', value: it.title, placeholder: 'Untitled', spellcheck: false, 'aria-label': 'Name',
    oninput: () => { it.title = title.value; touch(it); hooks.title?.(); document.title = `${it.title || 'Untitled'} · ${f.settings.workspaceTitle} · ${f.settings.name}`; },
    onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); hooks.focus?.(); } } });
  const back = el('button', { type: 'button', className: 'icon-btn only-phone', title: 'All', 'aria-label': 'Back to the list', onclick: () => {
    ws.classList.remove('open');
    current = null;
    history.replaceState(null, '', location.pathname + location.search);
    drawTree();
  } }, svg('back'));
  const actions = el('div', { className: 'ed-actions' });
  const calm = () => actions.replaceChildren(saved,
    el('button', { type: 'button', className: 'icon-btn only-narrow', title: 'Details', 'aria-label': 'Details', onclick: () => ws.classList.toggle('details') }, svg('panel')),
    el('button', { type: 'button', className: 'icon-btn danger', title: 'Delete', 'aria-label': `Delete this ${K.name.toLowerCase()}`, onclick: () => actions.replaceChildren(
      el('span', { className: 'ask' }, `Delete this ${K.name.toLowerCase()}?`),
      el('button', { type: 'button', className: 'btn danger', onclick: () => remove(it) }, 'Delete'),
      el('button', { type: 'button', className: 'btn', onclick: calm }, 'Keep')) }, svg('trash')));
  calm();
  const box = el('div', { className: 'editor-in' }, el('div', { className: 'ed-head' }, back, el('span', { className: 'ed-ic' }, svg(K.icon)), title, actions), ...EDIT[it.kind](it));
  box.style.setProperty('--k', K.color);
  editor.replaceChildren(box);
  editor.scrollTop = 0;
  hooks.after?.();
  if (fresh) { title.focus(); title.select(); }
}
function welcome() {
  return el('div', { className: 'welcome' },
    el('h1', {}, `Your ${f.settings.workspaceTitle.toLowerCase()}`),
    el('p', {}, 'Notes, docs, tables and code, kept in this browser. Settings can download a backup of them.'),
    el('div', { className: 'makes' }, Object.entries(KINDS).map(([kind, K]) => {
      const a = el('a', { className: 'card make', href: `#new/${kind}` }, el('span', { className: 'ed-ic' }, svg(K.icon)), el('span', {}, el('b', {}, `New ${K.name.toLowerCase()}`), el('small', {}, K.blurb)));
      a.style.setProperty('--k', K.color);
      return a;
    })));
}

const EDIT = {
  note(it) {
    let mode = modes.get(it.id) || (it.text.trim() ? 'read' : 'edit');
    const seg = el('div', { className: 'seg', role: 'group', 'aria-label': 'Edit or preview' });
    const text = el('textarea', { className: 'write', value: it.text, 'aria-label': 'Note', placeholder: 'Write in Markdown: # for a heading, - for a list, [[a note’s name]] to link to it.',
      oninput: () => { it.text = text.value; fit(text); touch(it); } });
    const view = el('div', { className: 'md', onclick: (e) => {
      const wiki = e.target.closest('a.wiki');
      if (wiki) { e.preventDefault(); return openTitle(wiki.dataset.name); }
      const tick = e.target.closest('input[type=checkbox][data-line]');
      if (tick) {
        const lines = it.text.split('\n'), n = +tick.dataset.line;
        lines[n] = lines[n].replace(/\[( |x|X)\]/, tick.checked ? '[x]' : '[ ]');
        it.text = text.value = lines.join('\n');
        touch(it);
      }
    } });
    const show = (m) => {
      mode = m;
      modes.set(it.id, m);
      for (const b of seg.children) b.classList.toggle('on', b.dataset.m === m);
      text.hidden = m !== 'edit';
      view.hidden = m === 'edit';
      if (m === 'edit') fit(text); else view.innerHTML = markdown(it.text);
    };
    seg.append(el('button', { type: 'button', 'data-m': 'edit', onclick: () => { show('edit'); text.focus(); } }, 'Edit'),
      el('button', { type: 'button', 'data-m': 'read', onclick: () => show('read') }, 'Preview'));
    hooks.after = () => show(mode);
    hooks.focus = () => { show('edit'); text.focus(); };
    // the outline's headings: in Edit, the cursor goes to the line; in Preview, the heading scrolls into view
    hooks.goto = (line) => {
      if (mode === 'read') return view.querySelector(`[data-line="${line}"]`)?.scrollIntoView({ behavior: f.moving() ? 'smooth' : 'auto', block: 'start' });
      const at = it.text.split('\n').slice(0, line).join('\n').length + (line ? 1 : 0);
      text.focus();
      text.setSelectionRange(at, at);
    };
    return [el('div', { className: 'ed-tools' }, seg), text, view];
  },

  doc(it) {
    const kindOf = (u) => (/docs\.google\.com\/document\//.test(u) ? 'Google Doc' : /docs\.google\.com\/presentation\//.test(u) ? 'Google Slides'
      : /docs\.google\.com\/spreadsheets\//.test(u) ? 'Google Sheet' : 'link');
    const go = el('a', { className: 'btn', target: '_blank', rel: 'noopener' }, svg('external'), el('span'));
    const sync = () => {
      const ok = /^https?:\/\/\S+$/.test(it.link);
      go.hidden = !ok;
      if (ok) { go.href = it.link; go.lastChild.textContent = `Open the ${kindOf(it.link)}`; }
    };
    const link = el('input', { className: 'input', type: 'url', value: it.link, 'aria-label': 'Link', placeholder: 'Paste a Google Docs, Slides or Sheets link, or any web address',
      oninput: () => { it.link = link.value.trim(); sync(); touch(it); } });
    const text = el('textarea', { className: 'write', value: it.text, 'aria-label': 'Doc', placeholder: 'Write your essay or research here.',
      oninput: () => { it.text = text.value; fit(text); touch(it); } });
    sync();
    hooks.after = () => fit(text);
    hooks.focus = () => text.focus();
    return [el('div', { className: 'ed-tools link-row' }, svg('link'), link, go), text];
  },

  table(it) {
    const grid = el('table', { className: 'grid' });
    const file = el('input', { type: 'file', hidden: true, accept: '.csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain', onchange: () => { if (file.files[0]) importTable(file.files[0]); file.value = ''; } });
    const cellAt = (r, c) => grid.querySelector(`tbody tr:nth-child(${r + 1}) td:nth-child(${c + 2}) input`);
    let added = -1;                                 // (the row just added, which slides in)
    const addRow = () => { it.rows.push(it.cols.map(() => '')); added = it.rows.length - 1; touch(it); draw(); added = -1; };
    const addCol = () => { it.cols.push(columnName(it.cols)); it.rows.forEach((row) => row.push('')); touch(it); draw(); grid.querySelector('thead th:last-child input')?.select(); };
    const draw = () => grid.replaceChildren(
      el('thead', {}, el('tr', {}, el('th', { className: 'num' }), it.cols.map((name, c) => el('th', {},
        el('input', { value: name, 'aria-label': `Column ${c + 1}'s name`, oninput: (e) => { it.cols[c] = e.target.value; touch(it); } }),
        it.cols.length > 1 ? el('button', { type: 'button', className: 'kill', title: 'Delete this column', 'aria-label': `Delete column ${c + 1}`, onclick: () => {
          it.cols.splice(c, 1);
          it.rows.forEach((row) => row.splice(c, 1));
          touch(it);
          draw();
        } }, svg('x')) : null)))),
      el('tbody', {}, it.rows.map((row, r) => el('tr', { className: r === added ? 'new' : '' },
        el('td', { className: 'num' }, el('span', {}, String(r + 1)), el('button', { type: 'button', className: 'kill', title: 'Delete this row', 'aria-label': `Delete row ${r + 1}`, onclick: () => { it.rows.splice(r, 1); touch(it); draw(); } }, svg('x'))),
        row.map((value, c) => el('td', {}, el('input', { value, 'aria-label': `Row ${r + 1}, ${it.cols[c] || `column ${c + 1}`}`,
          oninput: (e) => { it.rows[r][c] = e.target.value; touch(it); },
          onkeydown: (e) => { if (e.key === 'Enter') { e.preventDefault(); if (r === it.rows.length - 1) addRow(); cellAt(r + 1, c)?.focus(); } } })))))));
    draw();
    hooks.focus = () => cellAt(0, 0)?.focus();
    return [el('div', { className: 'ed-tools' },
      el('button', { type: 'button', className: 'btn', onclick: () => { addRow(); cellAt(it.rows.length - 1, 0)?.focus(); } }, svg('plus'), 'Row'),
      el('button', { type: 'button', className: 'btn', onclick: addCol }, svg('plus'), 'Column'),
      el('span', { className: 'grow' }),
      el('button', { type: 'button', className: 'btn', onclick: () => file.click() }, svg('upload'), 'Import CSV'),
      el('button', { type: 'button', className: 'btn', onclick: () => download(`${it.title.trim() || 'table'}.csv`, toCsv([it.cols, ...it.rows]), 'text/csv') }, svg('download'), 'Export CSV'),
      file),
    el('div', { className: 'table-wrap' }, grid)];
  },

  code(it) {
    const label = el('span', { className: 'lang' });
    const lines = el('pre', { className: 'gutter', 'aria-hidden': 'true' });
    const out = el('div', { className: 'out', hidden: true, 'aria-live': 'polite' });
    const number = () => { lines.textContent = Array.from({ length: it.text.split('\n').length }, (_, i) => i + 1).join('\n'); };
    const text = el('textarea', { className: 'code', value: it.text, wrap: 'off', spellcheck: false, autocomplete: 'off', autocapitalize: 'off', 'aria-label': 'Code',
      oninput: () => { it.text = text.value; number(); fit(text); touch(it); },
      onkeydown: (e) => {
        if (e.metaKey || e.ctrlKey || e.altKey) return;
        // Tab puts in two spaces, and a new line starts as far in as the one before it
        if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); insert(text, '  '); }
        else if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); insert(text, '\n' + /^[ \t]*/.exec(text.value.slice(0, text.selectionStart).split('\n').pop())[0]); }
      } });
    const run = el('button', { type: 'button', className: 'btn primary', onclick: () => runJs(it.text, out) }, svg('play'), 'Run');
    const copy = el('button', { type: 'button', className: 'btn', onclick: async () => {
      try { await navigator.clipboard.writeText(it.text); copy.lastChild.textContent = 'Copied'; } catch { copy.lastChild.textContent = "Couldn't copy"; }
      setTimeout(() => { copy.lastChild.textContent = 'Copy'; }, 1500);
    } }, svg('copy'), el('span', {}, 'Copy'));
    const lang = () => { const L = langOf(it.title); label.textContent = L.name; run.hidden = L.id !== 'js'; };
    number();
    lang();
    hooks.title = lang;
    hooks.after = () => fit(text);
    hooks.focus = () => text.focus();
    return [el('div', { className: 'ed-tools' }, label, el('span', { className: 'grow' }), run, copy), el('div', { className: 'code-wrap' }, lines, text), out];
  },
};

// ---------- the right pane ----------
const facts = (rows) => el('dl', { className: 'facts' }, rows.flatMap(([k, v]) => [el('dt', {}, k), el('dd', {}, String(v))]));
const none = (text) => el('p', { className: 'none' }, text);
const fmt = (v) => v.toLocaleString('en-US', { maximumFractionDigits: 2 });
const when = (t) => new Date(t).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const wordCount = (text) => (text.trim() ? text.trim().split(/\s+/).length : 0);
// the notes and docs whose text links here
function linkedFrom(it) {
  const name = it.title.trim().toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  if (!name) return [];
  const find = new RegExp(`\\[\\[\\s*${name}\\s*(\\||\\]\\])`, 'i');
  return sorted().filter((x) => x !== it && (x.kind === 'note' || x.kind === 'doc') && find.test(x.text));
}
function drawInfo() {
  const it = byId(current);
  if (!it) { info.replaceChildren(); return; }
  info.replaceChildren(...INFO[it.kind](it).filter(Boolean), el('h3', {}, 'About'), facts([['Made', when(it.made)], ['Edited', when(it.edited)]]));
}
const INFO = {
  note(it) {
    const heads = [...it.text.matchAll(/^(#{1,6})[ \t]+(.+)$/gm)].map((m) => ({ level: m[1].length, text: m[2].trim(), line: it.text.slice(0, m.index).split('\n').length - 1 }));
    const outs = [...new Set([...it.text.matchAll(/\[\[([^\]|]+)(?:\|[^\]]*)?\]\]/g)].map((m) => m[1].trim()).filter(Boolean))];
    const ins = linkedFrom(it);
    return [
      el('h3', {}, 'Outline'),
      heads.length ? el('ul', { className: 'links outline' }, heads.map((h) => {
        const b = el('button', { type: 'button', onclick: () => hooks.goto?.(h.line) }, h.text);
        b.style.setProperty('--lvl', h.level - 1);
        return el('li', {}, b);
      })) : none('Headings (# like this) show here.'),
      el('h3', {}, 'Links'),
      outs.length ? el('ul', { className: 'links' }, outs.map((name) => el('li', {}, el('button', { type: 'button', className: named(name) ? '' : 'new', title: named(name) ? '' : 'Not made yet: opening it makes it', onclick: () => openTitle(name) }, svg('link'), name))))
        : none('[[A note’s name]] links to it.'),
      el('h3', {}, 'Linked from'),
      ins.length ? el('ul', { className: 'links' }, ins.map((x) => el('li', {}, el('a', { href: `#${x.kind}/${x.id}` }, svg(KINDS[x.kind].icon), x.title || 'Untitled')))) : none('Nothing links here yet.'),
      el('h3', {}, 'Size'),
      facts([['Words', wordCount(it.text).toLocaleString('en-US')], ['Characters', it.text.length.toLocaleString('en-US')]]),
    ];
  },
  doc(it) {
    const words = wordCount(it.text);
    return [
      el('h3', {}, 'Size'),
      facts([['Words', words.toLocaleString('en-US')], ['Characters', it.text.length.toLocaleString('en-US')], ['Reading time', `${Math.max(1, Math.round(words / 220))} min`]]),
      el('h3', {}, 'Link'),
      /^https?:\/\//.test(it.link) ? el('ul', { className: 'links' }, el('li', {}, el('a', { href: it.link, target: '_blank', rel: 'noopener' }, svg('external'), new URL(it.link).hostname))) : none('No link yet.'),
      linkedFrom(it).length ? el('h3', {}, 'Linked from') : null,
      linkedFrom(it).length ? el('ul', { className: 'links' }, linkedFrom(it).map((x) => el('li', {}, el('a', { href: `#${x.kind}/${x.id}` }, svg(KINDS[x.kind].icon), x.title || 'Untitled')))) : null,
    ];
  },
  table(it) {
    const columns = it.cols.map((name, c) => ({ name: name.trim() || `Column ${c + 1}`, nums: it.rows.map((r) => number(r[c])).filter((v) => v != null) })).filter((x) => x.nums.length);
    return [
      el('h3', {}, 'Size'),
      facts([['Rows', it.rows.length.toLocaleString('en-US')], ['Columns', it.cols.length]]),
      ...columns.flatMap((x, i) => {
        const sum = x.nums.reduce((a, b) => a + b, 0), lo = x.nums.reduce((a, b) => Math.min(a, b)), hi = x.nums.reduce((a, b) => Math.max(a, b));
        return [el('h3', {}, x.name), facts([['Numbers', x.nums.length], ['Lowest', fmt(lo)], ['Highest', fmt(hi)], ['Average', fmt(sum / x.nums.length)], ['Total', fmt(sum)]]), i === 0 ? bars(x.nums) : null];
      }),
      columns.length ? null : none('A column of numbers shows its lowest, highest, average and total here.'),
    ];
  },
  code(it) {
    return [el('h3', {}, 'File'), facts([['Language', langOf(it.title).name], ['Lines', it.text.split('\n').length.toLocaleString('en-US')], ['Characters', it.text.length.toLocaleString('en-US')]])];
  },
};
// a cell as a number (1,250 and 12.5% count), or null
function number(v) {
  const t = String(v ?? '').trim().replace(/[,\s]/g, '').replace(/%$/, '');
  return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t) ? parseFloat(t) : null;
}
function bars(nums) {
  const some = nums.slice(0, 30), top = some.reduce((a, b) => Math.max(a, Math.abs(b)), 0) || 1;
  return el('div', { className: 'minibars', 'aria-hidden': 'true' }, some.map((v, i) => {
    const b = el('span', { style: `height:${Math.max(3, Math.round((100 * Math.abs(v)) / top))}%` });
    b.style.animationDelay = `calc(${i * 25}ms / var(--speed))`;
    return b;
  }));
}

// ---------- Markdown (what Preview shows): headings, lists and to-dos, quotes, code, links and [[links]] ----------
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const unesc = (s) => s.replace(/&(amp|lt|gt|quot);/g, (m, e) => ({ amp: '&', lt: '<', gt: '>', quot: '"' })[e]);
function inline(text) {
  return text.split(/(`[^`]+`)/).map((part, i) => (i % 2 ? `<code>${esc(part.slice(1, -1))}</code>` : esc(part)
    .replace(/\[\[([^\]|]+?)(?:\|([^\]]+?))?\]\]/g, (m, name, shown) => `<a href="#" class="wiki${named(unesc(name)) ? '' : ' new'}" data-name="${name.trim()}">${(shown || name).trim()}</a>`)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
    .replace(/\*\*(.+?)\*\*/g, '<b>$1</b>')
    .replace(/(^|[\s(])[*_](?!\s)(.+?)[*_](?=[\s).,!?:;]|$)/g, '$1<i>$2</i>')
    .replace(/~~(.+?)~~/g, '<s>$1</s>')
    .replace(/(^|\s)#([\p{L}\p{N}_/-]+)/gu, '$1<span class="tag">#$2</span>'))).join('');
}
function markdown(src) {
  const lines = String(src || '').replace(/\r\n?/g, '\n').split('\n'), out = [];
  let para = [], list = null;
  const endPara = () => { if (para.length) out.push(`<p>${para.map(inline).join('<br>')}</p>`); para = []; };
  const endList = () => { if (list) out.push(`</${list}>`); list = null; };
  const inList = (kind, cls = '') => { endPara(); if (list !== kind) { endList(); out.push(`<${kind}${cls ? ` class="${cls}"` : ''}>`); list = kind; } };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    let m;
    if (/^```/.test(line)) {
      endPara(); endList();
      const code = [];
      while (++i < lines.length && !/^```/.test(lines[i])) code.push(lines[i]);
      out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);
    } else if ((m = /^(#{1,6})[ \t]+(.*)$/.exec(line))) { endPara(); endList(); out.push(`<h${m[1].length} data-line="${i}">${inline(m[2])}</h${m[1].length}>`); }
    else if (/^ {0,3}([-*_])( *\1){2,} *$/.test(line)) { endPara(); endList(); out.push('<hr>'); }
    else if ((m = /^>\s?(.*)$/.exec(line))) { endPara(); endList(); out.push(`<blockquote>${inline(m[1])}</blockquote>`); }
    else if ((m = /^\s*[-*+]\s+\[([ xX])\]\s+(.*)$/.exec(line))) { inList('ul', 'tasks'); out.push(`<li><input type="checkbox" data-line="${i}"${m[1] === ' ' ? '' : ' checked'} aria-label="${esc(m[2])}">${inline(m[2])}</li>`); }
    else if ((m = /^\s*[-*+]\s+(.*)$/.exec(line))) { inList('ul'); out.push(`<li>${inline(m[1])}</li>`); }
    else if ((m = /^\s*\d+[.)]\s+(.*)$/.exec(line))) { inList('ol'); out.push(`<li>${inline(m[1])}</li>`); }
    else if (!line.trim()) { endPara(); endList(); }
    else { endList(); para.push(line); }
  }
  endPara();
  endList();
  return out.join('') || '<p class="empty">Nothing here yet. Edit to write something.</p>';
}

// ---------- tables: CSV in and out ----------
// (the separator is whichever of comma, tab or semicolon the first line has most of)
function parseCsv(text) {
  const first = text.split('\n', 1)[0], sep = [',', '\t', ';'].reduce((a, b) => (first.split(b).length > first.split(a).length ? b : a));
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) { if (ch !== '"') cell += ch; else if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false; }
    else if (ch === '"' && cell === '') quoted = true;
    else if (ch === sep) { row.push(cell); cell = ''; }
    else if (ch === '\n' || ch === '\r') { if (ch === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
    else cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const kept = rows.filter((r) => r.some((c) => c.trim() !== '')), width = kept.reduce((w, r) => Math.max(w, r.length), 1);
  return kept.map((r) => Array.from({ length: width }, (_, c) => r[c] ?? ''));
}
const toCsv = (rows) => rows.map((r) => r.map((c) => (/[",\n\r]/.test(c) ? `"${c.replace(/"/g, '""')}"` : c)).join(',')).join('\n') + '\n';
function columnName(cols) {
  const name = (n) => (n >= 26 ? name(Math.floor(n / 26) - 1) : '') + String.fromCharCode(65 + (n % 26));
  for (let n = cols.length; ; n++) if (!cols.includes(name(n))) return name(n);
}
async function importTable(file) {
  if (file.size > 2_000_000) { alertIn(`${file.name} is too big to keep in this browser (2 MB at most).`); return; }
  const rows = parseCsv(await file.text());
  if (!rows.length) { alertIn(`${file.name} has nothing in it to make a table from.`); return; }
  const [head, ...rest] = rows;
  make('table', { title: file.name.replace(/\.(csv|tsv|txt)$/i, ''), cols: head.map((c, i) => c.trim() || columnName(head.slice(0, i))), rows: rest }, true);
}
// a message at the top of the open thing (no pop-ups here)
function alertIn(text) {
  const box = editor.querySelector('.editor-in');
  box?.querySelector('.confirm')?.remove();
  box?.children[1]?.before(el('div', { className: 'confirm', role: 'alert' }, el('span', {}, text), el('span', { className: 'grow' }), el('button', { type: 'button', className: 'btn', onclick: (e) => e.target.closest('.confirm').remove() }, 'OK')));
}
function download(name, text, type) {
  const a = el('a', { href: URL.createObjectURL(new Blob([text], { type })), download: name });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ---------- code ----------
const LANGS = { js: 'JavaScript', mjs: 'JavaScript', ts: 'TypeScript', py: 'Python', html: 'HTML', css: 'CSS', json: 'JSON', md: 'Markdown', sh: 'Shell', java: 'Java', c: 'C', cpp: 'C++', cs: 'C#', go: 'Go', rs: 'Rust', rb: 'Ruby', swift: 'Swift', kt: 'Kotlin', sql: 'SQL', lua: 'Lua', txt: 'Text' };
function langOf(title) {
  const ext = (/\.([a-z0-9+]+)$/i.exec(title.trim()) || [])[1]?.toLowerCase() || '';
  return { id: ext === 'mjs' ? 'js' : ext, name: LANGS[ext] || (ext ? ext.toUpperCase() : 'Text') };
}
// JavaScript runs in a worker of its own (no page to change, and it's stopped after 5 seconds): console.log, warn and
// error show underneath, and so does anything that goes wrong
let worker = null;
function runJs(code, out) {
  worker?.terminate();
  out.hidden = false;
  out.replaceChildren();
  const say = (kind, text) => out.append(el('div', { className: kind }, text));
  // (your code starts on the worker's 4th line, so a line it reports is 3 more than yours)
  const url = URL.createObjectURL(new Blob([`const show = (kind, args) => postMessage([kind, args.map((a) => { if (typeof a === 'string') return a; try { return JSON.stringify(a) ?? String(a); } catch { return String(a); } }).join(' ')]), where = (e) => { const m = /:(\\d+):\\d+/.exec(String((e && e.stack) || '').split('\\n').find((l) => l.includes('blob:')) || ''); return m ? \` (line \${m[1] - 3})\` : ''; };
console.log = console.info = (...a) => show('log', a); console.warn = (...a) => show('warn', a); console.error = (...a) => show('error', a);
(async () => {
${code}
})().catch((e) => show('error', [(e && e.name ? \`\${e.name}: \${e.message}\` : String(e)) + where(e)])).finally(() => postMessage(['done']));`], { type: 'text/javascript' }));
  const w = (worker = new Worker(url));
  const stop = setTimeout(() => { w.terminate(); say('warn', 'Stopped after 5 seconds.'); }, 5000);
  const end = () => { clearTimeout(stop); w.terminate(); URL.revokeObjectURL(url); };
  w.onmessage = (e) => {
    const [kind, text] = e.data;
    if (kind !== 'done') return say(kind, text);
    end();
    if (!out.childElementCount) say('note', 'Done. Nothing was logged.');
  };
  w.onerror = (e) => { e.preventDefault(); end(); say('error', `${(e.message || 'That code has an error').replace(/^Uncaught /, '')}${e.lineno > 3 ? ` (line ${e.lineno - 3})` : ''}`); };
}

// ---------- start ----------
drawTree();
route();
setTimeout(() => tree.classList.remove('enter'), 1200);
