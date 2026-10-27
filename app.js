// Aachen Sans site: type tester, Bulgarian highlights, copy buttons, glyph search.
(function () {
  const SAMPLES = {
    'en': 'The quick brown fox jumps over the lazy dog.',
    'de': 'Grüße aus Aachen! Falsches Üben von Xylophonmusik quält jeden größeren Zwerg. STRAẞE',
    'nl-BE': 'Pa’s wijze lynx bezag vroom het fikse aquaduct. IJzertijd, fijn en blij.',
    'bg': 'Ах, чудна българска земьо, полюшвай цъфтящи жита.'
  };
  document.documentElement.classList.add('js');
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => Array.from(el.querySelectorAll(s));

  function toast(msg) {
    let t = $('.toast');
    if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._h);
    t._h = setTimeout(() => t.classList.remove('show'), 1400);
  }

  function copy(text, msg) {
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(() => toast(msg), () => toast('Copy failed'));
  }

  // ------------------------------------------------------------ header name: only once the title is out of view
  const title = $('.home .hero h1');
  if (title && 'IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => document.body.classList.toggle('past-title', !e.isIntersecting),
                             { rootMargin: `-${$('.top').offsetHeight}px 0px 0px 0px` }).observe(title);
  } else if (title) {
    document.body.classList.add('past-title');
  }

  // ------------------------------------------------------------ feature tabs: keep the current one in view on phones
  const tab = $('.subnav [aria-current]');
  if (tab) {
    const strip = tab.parentElement;
    strip.scrollLeft = tab.offsetLeft - strip.offsetLeft - (strip.clientWidth - tab.offsetWidth) / 2;
  }

  // ------------------------------------------------------------ type tester
  const sample = $('#sample');
  if (sample) {
    let edited = false;
    const lang = $('#lang'), size = $('#size'), out = $('#sizeOut');
    sample.textContent = SAMPLES.en;
    sample.addEventListener('input', () => { edited = true; });
    lang.addEventListener('change', () => {
      sample.lang = lang.value;
      if (!edited) sample.textContent = SAMPLES[lang.value];
    });
    if (window.innerWidth < 600) size.value = 40;   // phones: start at a size that fits
    const setSize = () => { sample.style.fontSize = size.value + 'px'; out.textContent = size.value + ' px'; };
    size.addEventListener('input', setSize);
    setSize();
    $$('.tester .seg button').forEach(b => b.addEventListener('click', () => {
      $$('.tester .seg button').forEach(x => x.classList.toggle('on', x === b));
      sample.style.fontWeight = b.dataset.w;
      sample.style.fontStyle = b.dataset.s;
    }));
  }

  // ------------------------------------------------------------ Bulgarian: the letters that change, in white
  const BG = new Set('вгджзийѝклптцшщюДЛ');
  $$('[data-hl]').forEach(p => {
    const text = p.textContent;
    p.textContent = '';
    for (const ch of text) {
      if (BG.has(ch)) { const s = document.createElement('span'); s.className = 'hl'; s.textContent = ch; p.appendChild(s); }
      else p.appendChild(document.createTextNode(ch));
    }
  });

  // ------------------------------------------------------------ glyph page
  const search = $('#gsearch');
  if (search) {
    const cells = $$('.g');
    const count = $('#gcount');
    const total = new Set(cells.map(c => c.dataset.u)).size;   // Bulgarian forms repeat Cyrillic cells; count each once
    const fmt = n => n.toLocaleString('en');
    const run = () => {
      const raw = search.value.trim();
      const q = raw.toLowerCase().replace(/^u\+/, '');
      const single = [...raw].length === 1;          // one character: find that character only
      const hits = new Set();
      cells.forEach(c => {
        const hit = !q || (single ? c.dataset.ch === raw
                                  : c.dataset.u.toLowerCase().startsWith(q) || c.dataset.n.includes(q));
        c.hidden = !hit;
        if (hit) hits.add(c.dataset.u);
      });
      $$('.block').forEach(b => { b.hidden = !b.querySelector('.g:not([hidden])'); });
      $$('.cat').forEach(s => { s.hidden = !s.querySelector('.g:not([hidden])'); });
      count.textContent = q ? `${fmt(hits.size)} of ${fmt(total)}` : `${fmt(total)} glyphs`;
    };
    search.addEventListener('input', run);
    run();
    cells.forEach(c => c.addEventListener('click', () => copy(c.dataset.ch, `Copied ${c.dataset.ch}  U+${c.dataset.u}`)));
    $$('.g-tools .seg button').forEach(b => b.addEventListener('click', () => {
      $$('.g-tools .seg button').forEach(x => x.classList.toggle('on', x === b));
      document.body.classList.toggle('bold', b.dataset.w === '700');
      document.body.classList.toggle('italic', b.dataset.s === 'italic');
    }));
  }
})();
