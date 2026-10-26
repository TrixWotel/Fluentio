// Puts the settings on the page it's loaded in: the colors (light and dark), font, corners and motion, before the page
// is drawn. Every page loads it as a plain script in its <head>, right after settings.js. The settings are the built-in
// ones, then settings.js over them, then what the Settings page saved in this browser (fluentio.look) over those.
// It also gives the page window.fluentio: the settings (anything missing or mistyped filled in from the built-in ones),
// the site's top folder, link() for the links in the settings, the Workspace's items (kept in this browser), the icons,
// el() and svg() to build things with, and save() and reset() for the Settings page. It puts the site's name in the
// page's title, fills in any element marked data-fill="footer" (or another of the settings' words), and adds the
// drifting colors behind the page.
(() => {
  const DEFAULTS = {
    name: 'Fluentio', tagline: 'Web stack workspace', footer: 'TrixWotel', greeting: true, theme: 'auto',
    colors: {
      light: { accent: '#2f6fed', accent2: '#9b5cf6', background: '#f6f7f9', card: '#ffffff', text: '#1b1f24', muted: '#5b6470', line: '#e3e6ea', right: '#2da44e', wrong: '#e5534b', second: '#e8743b' },
      dark: { accent: '#6c9bff', accent2: '#b48cff', background: '#0f1115', card: '#171a21', text: '#e8eaee', muted: '#9aa3ae', line: '#262b35', right: '#3fb950', wrong: '#f85149', second: '#f0a04b' },
    },
    map: {
      light: { ocean: '#d6e6f5', land: '#e4e1da', country: '#fbf8f1', border: '#9aa4b1', late: '#d4a72c' },
      dark: { ocean: '#0c1828', land: '#23272e', country: '#4d5768', border: '#151920', late: '#d29922' },
    },
    font: 'system', corners: 14, style: 'glow', animations: true, speed: 1, floatingColors: true,
    home: ['workspace', 'study', 'data', 'quick'],
    quick: [
      { title: 'New note', link: 'workspace/#new/note' },
      { title: 'New table', link: 'workspace/#new/table' },
      { title: 'Start AMC test', link: 'math/#amc10/test' },
    ],
    workspaceTitle: 'Workspace',
    studyTitle: 'Study',
    studyIntro: 'Pick a subject. Take a test, learn it one topic at a time, or practise any question.',
    study: [
      { emoji: '🌍', title: 'Geography', text: 'Find countries and capitals on the world map, or one continent at a time.', link: 'geography/', color: '#1f9d74' },
      { emoji: '📐', title: 'Math', text: 'Triangle angles, and AMC 10 practice in 87 topics, each asked several ways.', link: 'math/', color: '#2f6fed' },
      { emoji: '🧪', title: 'Science', text: 'Heat capacity with Q = mcΔT: warming, cooling, mixing and heaters.', link: 'science/', color: '#8b5cf6' },
      { emoji: '🚀', title: 'Physics', text: 'Kinematics with motion graphs, a new graph for every question.', link: 'physics/', color: '#e8743b' },
      { emoji: '🇪🇸', title: 'Spanish', text: '1,100 words in 25 themes, and the preterite and the imperfect.', link: 'spanish/', color: '#e5484d' },
    ],
  };
  const FONTS = {
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    rounded: 'ui-rounded, "SF Pro Rounded", "Nunito", system-ui, sans-serif',
    serif: 'ui-serif, "New York", Georgia, "Times New Roman", serif',
    mono: 'ui-monospace, "SF Mono", Menlo, Consolas, monospace',
  };

  // settings over others: an object merges key by key, a list is replaced by one of the same kind of thing, and
  // anything else must be the same kind to replace one (so a typo falls back to what was there)
  const plain = (v) => !!v && typeof v === 'object' && !Array.isArray(v);
  const merge = (base, over) => {
    if (plain(base)) return Object.fromEntries(Object.keys(base).map((k) => [k, plain(over) && k in over ? merge(base[k], over[k]) : base[k]]));
    if (Array.isArray(base)) {
      if (!Array.isArray(over)) return base;
      const kept = over.filter((x) => (plain(base[0]) ? plain(x) : typeof x === typeof base[0]));
      return kept.length || !over.length ? kept : base;
    }
    return over !== undefined && typeof over === typeof base ? over : base;
  };
  // what's different between two settings, object by object (undefined when nothing is)
  const diff = (base, next) => {
    if (plain(base) && plain(next)) {
      const out = {};
      for (const k of Object.keys(base)) if (k in next) { const d = diff(base[k], next[k]); if (d !== undefined) out[k] = d; }
      return Object.keys(out).length ? out : undefined;
    }
    return JSON.stringify(base) === JSON.stringify(next) ? undefined : next;
  };
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const write = (key, value) => { try { if (value == null) localStorage.removeItem(key); else localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } };

  const given = window.FLUENTIO_SETTINGS;
  const site = merge(DEFAULTS, plain(given) ? given : {});        // the built-in settings with settings.js over them
  const mine = () => merge(site, read('fluentio.look') || {});    // and this browser's own, from the Settings page
  let s = mine();
  const color = (v, fallback) => (typeof v === 'string' && window.CSS && CSS.supports('color', v) ? v : fallback);
  const clamp = (v, lo, hi, fallback) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, v)) : fallback);

  // the custom properties every page's styles use
  const palette = (mode) => {
    const c = s.colors[mode] || {}, d = DEFAULTS.colors[mode], m = s.map[mode] || {}, dm = DEFAULTS.map[mode];
    const pick = (k) => color(c[k], d[k]), mp = (k) => color(m[k], dm[k]);
    return [
      `color-scheme: ${mode}`, `--accent: ${pick('accent')}`, `--accent-2: ${pick('accent2')}`, `--bg: ${pick('background')}`,
      `--card: ${pick('card')}`, `--text: ${pick('text')}`, `--muted: ${pick('muted')}`, `--line: ${pick('line')}`,
      `--good: ${pick('right')}`, `--bad: ${pick('wrong')}`, `--plot2: ${pick('second')}`, `--sky: ${mode === 'dark' ? 0.34 : 0.5}`,
      `--ocean: ${mp('ocean')}`, `--land: ${mp('land')}`, `--country: ${mp('country')}`, `--border: ${mp('border')}`, `--late: ${mp('late')}`,
    ].join('; ');
  };
  const css = () => {
    const font = typeof s.font === 'string' && s.font.trim() ? FONTS[s.font.trim()] || s.font : FONTS.system;
    const look = `--font: ${font.replace(/[;{}]/g, '')}; --radius: ${clamp(s.corners, 0, 40, 14)}px; --speed: ${clamp(s.speed, 0.25, 4, 1)}`;
    return [
      s.theme === 'dark' ? `html:root { ${palette('dark')}; ${look} }`
        : s.theme === 'light' ? `html:root { ${palette('light')}; ${look} }`
          : `html:root { ${palette('light')}; ${look} } @media (prefers-color-scheme: dark) { html:root { ${palette('dark')} } }`,
      // moving between pages: the old one fades out as the new one rises in (browsers that can't, just switch)
      s.animations !== false ? '@media (prefers-reduced-motion: no-preference) { @view-transition { navigation: auto; } }' : '',
    ].join('\n');
  };
  const style = document.createElement('style');
  style.id = 'fluentio-settings';
  document.head.append(style);
  const apply = () => {
    style.textContent = css();
    document.documentElement.classList.toggle('no-motion', s.animations === false);
    document.documentElement.classList.toggle('flat', s.style === 'flat');
  };
  apply();
  // (each page's <title>, which comes before this script, ends with the built-in name)
  if (s.name !== DEFAULTS.name) document.title = document.title.replace(/\bFluentio$/, () => s.name);

  // the words marked data-fill, and the drifting colors behind everything (each starts where the clock says it is, so
  // they carry on from one page to the next)
  const fill = () => { for (const n of document.querySelectorAll('[data-fill]')) if (typeof s[n.dataset.fill] === 'string') n.textContent = s[n.dataset.fill]; };
  const sky = () => {
    if (!document.body) return;
    const want = s.floatingColors !== false && document.body.dataset.sky !== 'off', have = document.querySelector('body > .sky');
    if (!want) return have?.remove();
    if (have) return;
    const el = document.createElement('div');
    el.className = 'sky';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<i></i><i></i><i></i>';
    document.body.prepend(el);
    for (const i of el.children) {
      const lap = 2 * parseFloat(getComputedStyle(i).animationDuration);   // there and back
      if (lap > 0) i.style.animationDelay = `${-((Date.now() / 1000) % lap)}s`;
    }
  };
  const changed = () => { window.fluentio.settings = s; apply(); fill(); sky(); dispatchEvent(new CustomEvent('fluentio:settings')); };

  // building things: el('a', { className, href, 'aria-label': … }, …children), and an icon as an element
  const el = (tag, props = {}, ...kids) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (/^(aria-|data-|role$|for$)/.test(k)) n.setAttribute(k, v === true ? '' : v); else n[k] = v;
    }
    for (const k of kids.flat()) if (k != null && k !== false) n.append(k.nodeType ? k : document.createTextNode(k));
    return n;
  };
  const ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    settings: '<path d="M4 6h8M16 6h4M4 12h2M10 12h10M4 18h11M19 18h1"/><circle cx="14" cy="6" r="2"/><circle cx="8" cy="12" r="2"/><circle cx="17" cy="18" r="2"/>',
    home: '<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10v9h12v-9"/><path d="M10 19v-5h4v5"/>',
    study: '<path d="M22 9 12 5 2 9l10 4z"/><path d="M6 10.6V16c0 1.66 2.69 3 6 3s6-1.34 6-3v-5.4"/>',
    workspace: '<path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M9 4v16M12 8h4M12 12h4"/>',
    note: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    doc: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    table: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M3 15h18M9 4v16"/>',
    code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14"/>',
    bolt: '<path d="M13 3 4 14h7l-1 7 9-11h-7z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    back: '<path d="M19 12H5M11 6l-6 6 6 6"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    check: '<path d="m5 12 5 5 9-10"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/>',
    play: '<path d="M7 4v16l13-8z"/>',
    copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
    download: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
    upload: '<path d="M12 20V9M7 14l5-5 5 5M5 4h14"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.66 0l3-3a4 4 0 0 0-5.66-5.66l-1 1"/><path d="M14 10a4 4 0 0 0-5.66 0l-3 3a4 4 0 0 0 5.66 5.66l1-1"/>',
    external: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16"/>',
  };
  const icon = (name) => `<svg class="i" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name] || ''}</svg>`;
  const svg = (name) => { const t = document.createElement('template'); t.innerHTML = icon(name); return t.content.firstChild; };

  // the site's top folder (this file is in its kit folder), for the links in the settings
  const here = document.currentScript && document.currentScript.src;
  const root = here ? new URL('..', here).href : new URL('./', location.href).href;
  window.fluentio = {
    settings: s, site, DEFAULTS, FONTS, root, read, write, el, svg, icon,
    link: (href) => new URL(String(href || ''), root).href,
    moving: () => s.animations !== false && !matchMedia('(prefers-reduced-motion: reduce)').matches,
    // the Workspace's notes, docs, tables and code: kept in this browser only (Settings can download a backup)
    workspace: {
      items: () => { const w = read('fluentio.workspace'); return plain(w) && Array.isArray(w.items) ? w.items.filter((x) => plain(x) && typeof x.id === 'string') : []; },
      save: (items) => write('fluentio.workspace', { v: 1, items }),
    },
    // the topic Learn was last on (tests.js keeps it), for Continue on the home page
    last: () => { const l = read('fluentio.last'); return plain(l) && typeof l.href === 'string' && /^\/(?!\/)/.test(l.href) ? l : null; },
    // the Settings page: keep what's different from the site's settings in this browser, and show it straight away
    save: (next) => { const d = diff(site, next), ok = write('fluentio.look', d ?? null); s = merge(site, d || {}); changed(); return ok; },
    reset: () => { write('fluentio.look', null); s = site; changed(); },
  };
  addEventListener('storage', (e) => { if (e.key === 'fluentio.look') { s = mine(); changed(); } });
  // (a page transition the browser skips, in a hidden tab say, isn't an error)
  addEventListener('pagereveal', (e) => e.viewTransition?.ready.catch(() => {}));

  addEventListener('DOMContentLoaded', () => {
    fill();
    sky();
    // a soft light that follows the pointer across a card
    if (matchMedia('(hover: hover)').matches) {
      addEventListener('pointermove', (e) => {
        const card = e.target instanceof Element && e.target.closest('.card');
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${e.clientX - r.left}px`);
        card.style.setProperty('--my', `${e.clientY - r.top}px`);
      }, { passive: true });
    }
  });
})();
