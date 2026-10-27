// The bar at the top of every page: the site's name, Home, Study and Workspace (the one you're in is marked, and the
// mark slides across when you go to another), Search, and Settings. Each page loads this right after look.js and calls
// fluentio.bar() first thing in its <body>, so the bar is there before the page is drawn.
// Search finds the pages, the subjects, and everything in the Workspace. The keys are the settings' (Settings can record
// new ones): ⌃K (or /) searches, and ⌃1, ⌃2 and ⌃3 go to Home, Study and Workspace from anywhere.
(() => {
  const f = window.fluentio;
  if (!f) return;
  const { el, svg } = f;
  const keyFor = (name) => f.key.shown(f.settings.keys[name]);   // how a key reads ('' when it's off)
  const spaces = () => [
    { id: 'home', title: 'Home', href: f.link('./'), icon: 'home', key: keyFor('home') },
    { id: 'study', title: f.settings.studyTitle, href: f.link('study/'), icon: 'study', key: keyFor('study') },
    { id: 'workspace', title: f.settings.workspaceTitle, href: f.link('workspace/'), icon: 'workspace', key: keyFor('workspace') },
  ];
  // the space this page is in (a subject's page is in Study), or what it is: 'settings', say
  const where = () => {
    const top = new URL(f.root).pathname, path = location.pathname;
    const first = path.startsWith(top) ? path.slice(top.length).split('/')[0] : '';
    if (first === '' || first === 'index.html') return 'home';
    if (first === 'study' || f.settings.study.some((x) => String(x.link).replace(/^\.?\//, '').split('/')[0] === first)) return 'study';
    return first;
  };

  let nav = null, find = null;
  const drawNav = () => {
    const here = where();
    nav.replaceChildren(...spaces().map((x) => el('a', { href: x.href, className: x.id === here ? 'on' : '', title: x.key ? `${x.title} (${x.key})` : x.title, 'aria-current': x.id === here ? 'page' : null },
      x.id === here ? el('span', { className: 'pill', 'aria-hidden': 'true' }) : null, x.title)));
    const k = keyFor('search');
    find.title = k ? `Search (${k})` : 'Search';
    find.querySelector('kbd').textContent = k;
    find.querySelector('kbd').hidden = !k;
  };
  f.bar = () => {
    if (!document.body || document.querySelector('body > .topbar')) return;
    nav = el('nav', { className: 'spaces', 'aria-label': 'Spaces' });
    find = el('button', { type: 'button', className: 'find', onclick: () => openFind() }, svg('search'), el('span', {}, 'Search'), el('kbd'));
    drawNav();
    const brand = el('a', { className: 'brand', href: f.link('./'), 'data-fill': 'name' }, f.settings.name);
    const gear = el('a', { className: 'gear' + (where() === 'settings' ? ' on' : ''), href: f.link('settings/'), title: 'Settings', 'aria-label': 'Settings' }, svg('settings'));
    document.body.prepend(el('header', { className: 'topbar' }, brand, nav, el('div', { className: 'tools' }, find, gear)));
    document.documentElement.classList.add('has-bar');
    sync();
  };
  addEventListener('fluentio:settings', () => { if (nav) { drawNav(); sync(); } });

  // ---------- the bar at the side (bar: 'side'), like Fluent's: the subjects as tiles, then the spaces and your latest
  // things as rows, and Settings at the bottom (site.css shows it on a wide screen, and the top bar on a narrow one) ----------
  let side = null, frame = null;
  const ICON = { note: 'note', doc: 'doc', table: 'table', code: 'code' };
  function drawSide() {
    const s = f.settings, here = where();
    // (the space you're in has the mark that slides between pages, and the thing open in the Workspace a plain one)
    const row = (href, icon, title, { on, here: open, key } = {}) => el('a', { className: `side-row${open ? ' here' : ''}`, href, 'aria-current': on || open ? 'page' : null },
      on ? el('span', { className: 'pill', 'aria-hidden': 'true' }) : null, svg(icon), el('span', {}, title), key ? el('kbd', {}, key) : null);
    const tile = (x) => {
      const href = f.link(x.link), on = location.pathname.startsWith(new URL(href).pathname);
      return el('a', { className: 'side-tile' + (on ? ' on' : ''), href, title: x.title || '', 'aria-label': x.title || '', 'aria-current': on ? 'page' : null }, x.emoji || '📘');
    };
    const latest = f.workspace.items().sort((a, b) => (b.edited || 0) - (a.edited || 0)).slice(0, 8);
    side.replaceChildren(
      el('div', { className: 'side-head' },
        el('a', { className: 'side-name', href: f.link('./'), 'data-fill': 'name' }, s.name),
        el('button', { type: 'button', className: 'side-icon', title: keyFor('search') ? `Search (${keyFor('search')})` : 'Search', 'aria-label': 'Search', onclick: () => openFind() }, svg('search'))),
      el('nav', { className: 'side-tiles', 'aria-label': s.studyTitle }, s.study.map(tile)),
      el('div', { className: 'side-rule' }),
      ...spaces().map((x) => row(x.href, x.icon, x.title, { on: x.id === here, key: x.key })),
      el('div', { className: 'side-label' }, s.workspaceTitle),
      row(f.link('workspace/#new/note'), 'plus', 'New note'),
      ...latest.map((it) => row(f.link(`workspace/#${it.kind}/${it.id}`), ICON[it.kind] || 'note', it.title || 'Untitled', { here: here === 'workspace' && location.hash === `#${it.kind}/${it.id}` })),
      el('div', { className: 'side-foot' }, row(f.link('settings/'), 'settings', 'Settings', { on: here === 'settings' })));
  }
  // the sidebar when the settings ask for it: made, drawn again, or taken away
  function sync() {
    if (!document.body || !nav) return;
    const want = f.settings.bar === 'side';
    if (want && !side) {
      side = el('aside', { className: 'sidebar', 'aria-label': f.settings.name });
      frame = el('div', { className: 'frame', 'aria-hidden': 'true' });
      document.body.prepend(side, frame);
    } else if (!want && side) {
      side.remove();
      frame.remove();
      side = frame = null;
    }
    if (side) drawSide();
  }
  addEventListener('fluentio:workspace', () => side && drawSide());
  addEventListener('hashchange', () => side && drawSide());

  // ---------- Search ----------
  const KINDS = { note: 'Note', doc: 'Doc', table: 'Table', code: 'Code' };
  let box = null, input = null, list = null, found = [], at = 0, before = null;
  // everything there is to find, in the order it shows with nothing typed
  function everything(q) {
    const s = f.settings, out = [];
    spaces().forEach((x) => out.push({ title: x.title, kind: x.key || 'Page', icon: x.icon, href: x.href, group: 'Go to' }));
    out.push({ title: 'Settings', kind: 'Colors and more', icon: 'settings', href: f.link('settings/'), group: 'Go to' });
    const items = f.workspace.items().sort((a, b) => (b.edited || 0) - (a.edited || 0));
    for (const it of q ? items : items.slice(0, 6)) {
      out.push({ title: it.title || 'Untitled', kind: KINDS[it.kind] || '', icon: KINDS[it.kind] ? it.kind : 'note', href: f.link(`workspace/#${it.kind}/${it.id}`), group: s.workspaceTitle, text: typeof it.text === 'string' ? it.text : '' });
    }
    for (const x of s.study) out.push({ title: x.title || '', kind: s.studyTitle, emoji: x.emoji || '📘', href: f.link(x.link), group: s.studyTitle });
    for (const [k, name] of Object.entries(KINDS)) out.push({ title: `New ${name.toLowerCase()}`, kind: s.workspaceTitle, icon: 'plus', href: f.link(`workspace/#new/${k}`), group: 'Make' });
    for (const x of s.quick) if (x.link && !out.some((o) => o.href === f.link(x.link))) out.push({ title: x.title || x.link, kind: 'Quick', icon: 'bolt', href: f.link(x.link), group: 'Make' });
    return out;
  }
  // how well something matches: the title starting with it, then a word in it, then anywhere (a note's text last)
  function score(e, q) {
    if (!q) return 1;
    const title = e.title.toLowerCase(), words = q.split(/\s+/).filter(Boolean);
    if (!words.every((w) => title.includes(w) || e.text?.toLowerCase().includes(w))) return 0;
    if (title.startsWith(q)) return 4;
    if (title.split(/[^\p{L}\p{N}]+/u).some((w) => w.startsWith(words[0]))) return 3;
    return title.includes(q) ? 2 : 1;
  }
  function draw() {
    const q = input.value.trim().toLowerCase();
    found = everything(q).map((e, i) => ({ e, i, s: score(e, q) })).filter((x) => x.s > 0);
    if (q) found.sort((a, b) => b.s - a.s || a.i - b.i);
    found = found.slice(0, 60).map((x) => x.e);
    at = Math.min(at, Math.max(0, found.length - 1));
    let group = null;
    const rows = [];
    found.forEach((e, i) => {
      if (!q && e.group !== group) rows.push(el('div', { className: 'finder-head' }, (group = e.group)));
      rows.push(el('a', { className: 'finder-item' + (i === at ? ' at' : ''), href: e.href, role: 'option', 'aria-selected': String(i === at), onmousemove: () => mark(i), onclick: () => closeFind(true) },
        el('span', { className: 'finder-ic' }, e.emoji || svg(e.icon)), el('span', { className: 'finder-title' }, e.title), el('span', { className: 'finder-kind' }, e.kind)));
    });
    list.replaceChildren(...(rows.length ? rows : [el('p', { className: 'finder-empty' }, 'Nothing matches. Try another word.')]));
  }
  function mark(i) {
    if (i === at) return;
    at = i;
    list.querySelectorAll('.finder-item').forEach((n, j) => { n.classList.toggle('at', j === at); n.setAttribute('aria-selected', String(j === at)); });
  }
  function move(by) {
    if (!found.length) return;
    mark((at + by + found.length) % found.length);
    list.querySelectorAll('.finder-item')[at]?.scrollIntoView({ block: 'nearest' });
  }
  function build() {
    input = el('input', { type: 'text', placeholder: 'Search pages, subjects and your workspace', autocomplete: 'off', spellcheck: false, 'aria-label': 'Search' });
    list = el('div', { className: 'finder-list', role: 'listbox' });
    const s = f.settings;
    box = el('div', { className: 'finder', hidden: true, onclick: (e) => { if (e.target === box) closeFind(); } },
      el('div', { className: 'finder-box', role: 'dialog', 'aria-modal': 'true', 'aria-label': 'Search' },
        el('div', { className: 'finder-in' }, svg('search'), input, el('kbd', {}, 'Esc')),
        list,
        el('div', { className: 'finder-foot' },
          el('span', {}, el('kbd', {}, '↑'), el('kbd', {}, '↓'), ' move'), el('span', {}, el('kbd', {}, 'Enter'), ' open'),
          el('a', { href: f.link('settings/#keys'), onclick: () => closeFind(true) }, 'Change the keys'))));
    input.addEventListener('input', () => { at = 0; draw(); });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); move(e.key === 'ArrowDown' ? 1 : -1); }
      else if (e.key === 'Enter' && found[at]) { e.preventDefault(); go(found[at].href); }
    });
    document.body.append(box);
  }
  function openFind() {
    if (!box) build();
    before = document.activeElement;
    box.hidden = false;
    input.value = '';
    at = 0;
    draw();
    input.focus();
  }
  function closeFind(leaving) {
    if (!box || box.hidden) return;
    box.hidden = true;
    if (!leaving) before?.focus?.();
  }
  const go = (href) => { closeFind(true); if (href !== location.href) location.href = href; };
  f.find = openFind;

  // the keys: Search (and / too, when you're not typing), and the three spaces. A key without Ctrl, Alt or Meta only
  // counts when you're not typing, so it can't get in the way of writing
  addEventListener('keydown', (e) => {
    if (e.defaultPrevented || e.isComposing) return;
    if (e.key === 'Escape' && box && !box.hidden) { e.preventDefault(); closeFind(); return; }
    const pressed = f.key.pressed(e);
    if (!pressed) return;
    const typing = e.target instanceof Element && !!e.target.closest('input, textarea, select, [contenteditable]');
    const is = (name) => { const want = f.key.meant(f.settings.keys[name]); return !!want && want === pressed && (!typing || /Ctrl|Alt|Meta/.test(want)); };
    if (is('search') || (pressed === '/' && !typing)) {
      e.preventDefault();
      if (box && !box.hidden) closeFind(); else openFind();
      return;
    }
    const space = spaces().find((x) => is(x.id));
    if (space) { e.preventDefault(); go(space.href); }
  });
})();
