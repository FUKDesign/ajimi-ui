/* Ajimi next: dish table, ingredients, method, quiz, tasting. Reads the same lesson data and audio as the original app. */
(async () => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const view = $('#view'), app = $('#app'), sheet = $('#sheet'), say = $('#say');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const [lessons, vocab, regions] = await Promise.all(['data/lessons.json', 'data/vocabulary.json', 'data/regions.json'].map(u => fetch(u).then(r => r.json())));
  const byId = Object.fromEntries(lessons.map(l => [l.id, l]));
  const W = k => vocab[k] || {japanese: k, kana: '', romaji: '', english: ''};

  const icon = {
    close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    back: '<svg viewBox="0 0 24 24"><path d="M14.5 5.5L8 12l6.5 6.5"/></svg>',
    next: '<svg viewBox="0 0 24 24"><path d="M9.5 5.5L16 12l-6.5 6.5"/></svg>',
    hear: '<svg viewBox="0 0 24 24"><path d="M4 9.5v5h3.5L12 18.5v-13L7.5 9.5z"/><path d="M15.5 9a4.2 4.2 0 010 6M18 6.5a8 8 0 010 11"/></svg>',
    keep: '<svg viewBox="0 0 24 24"><path d="M6.5 3.5h11v17l-5.5-4-5.5 4z"/></svg>'
  };

  /* Every word has a clay model. A few file names differ from the vocabulary key. */
  const clay = {scallion: 'negi', ginger: 'shoga', stock: 'dashi', pancake: 'dish-osaka'};
  const pic = k => `img/${clay[k] || k}.webp`;
  const dishPic = id => id === 'kagawa' ? 'img/bowl-3.webp' : `img/dish-${id}.webp`;

  /* The seasoning line is the sentence the voice actor recorded. Romaji and the verbs to highlight are listed per kitchen. */
  const SEASON = {
    hokkaido: {ro: 'shōyu o nikai, mirin o ikkai.', verbs: []},
    fukuoka: {ro: 'dashi o nikai. shōyu wa irenaide.', verbs: [['入れないで', 'x-irenai']]},
    osaka: {ro: 'okonomi sōsu o nikai nutte, mayonēzu o ikkai kakete.', verbs: [['ぬって', 'x-nuru'], ['かけて', 'tech-pour']]},
    aichi: {ro: 'misodare o nihai kakete, karashi o sukoshi soete.', verbs: [['かけて', 'tech-pour'], ['添えて', 'x-soeru']]},
    miyagi: {ro: 'mizu o ippai, shio o hitotsumami kuwaete, mochi ni karamete.', verbs: [['加えて', 'x-kuwaeru']]},
    niigata: {ro: 'shōyu o nikai, mirin o ikkai irete nite. tonkatsu o kugurasete.', verbs: [['入れて', 'x-ireru']]},
    hiroshima: {ro: 'shōyu to mirin o ikkai zutsu irete nite. nijiru de kome o taite.', verbs: [['入れて', 'x-ireru']]},
    nagano: {ro: 'abura o ippai irete nasu o itame, miso to satō ippai o mazete. kawa de tsutsunde yaite.', verbs: [['入れて', 'x-ireru']]},
    tokyo: {ro: 'dashi o nihai irete nite. miso o ippai toite, gohan ni kakete.', verbs: [['入れて', 'x-ireru']]},
    okinawa: {ro: 'shōyu o ikkai, shio o hitotsumami irete.', verbs: [['入れて', 'x-ireru']]},
    kyoto: {ro: 'kozara ni ponzu o nikai. shōyu wa irenaide.', verbs: [['入れないで', 'x-irenai']]}
  };
  Object.assign(vocab, {
    'x-noseru': {japanese: 'のせる', kana: 'のせる', romaji: 'noseru', english: 'put on top'},
    'x-ireru': {japanese: '入れる', kana: 'いれる', romaji: 'ireru', english: 'put in'},
    'x-irenai': {japanese: '入れない', kana: 'いれない', romaji: 'irenai', english: 'do not put in'},
    'x-nuru': {japanese: 'ぬる', kana: 'ぬる', romaji: 'nuru', english: 'brush on'},
    'x-soeru': {japanese: '添える', kana: 'そえる', romaji: 'soeru', english: 'put on the side'},
    'x-kuwaeru': {japanese: '加える', kana: 'くわえる', romaji: 'kuwaeru', english: 'add'}
  });
  /* 杯 for ladles and spoonfuls when the recorded sentence uses it, 回 for everything else */
  const unitJP = (l, b) => /ladle|spoon/.test(b[2]) && l.seasonJP.includes('杯') ? '杯' : '回';

  /* ── saved words ── */
  const KEY = 'ajimi-next-saved';
  const saved = new Set(JSON.parse(localStorage.getItem(KEY) || '[]'));
  const persist = () => { localStorage.setItem(KEY, JSON.stringify([...saved])); badge(); };
  const badge = () => { const b = $('#saved-count'); b.hidden = !saved.size; b.textContent = saved.size; };
  const toggleSave = k => { saved.has(k) ? saved.delete(k) : saved.add(k); persist(); return saved.has(k); };

  /* ── romaji: one switch, remembered, for every reading in the app ── */
  const RKEY = 'ajimi-next-romaji';
  app.dataset.romaji = localStorage.getItem(RKEY) === 'off' ? 'off' : 'on';
  const roToggle = () => `<button class="ro-toggle" data-romaji-toggle aria-pressed="${app.dataset.romaji === 'on'}" aria-label="Show romaji">Rōmaji <i>${app.dataset.romaji}</i></button>`;
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-romaji-toggle]'); if (!b) return;
    const on = app.dataset.romaji !== 'on';
    app.dataset.romaji = on ? 'on' : 'off'; localStorage.setItem(RKEY, app.dataset.romaji);
    $$('[data-romaji-toggle]').forEach(t => { t.setAttribute('aria-pressed', on); $('i', t).textContent = app.dataset.romaji; });
    say.textContent = on ? 'Romaji on' : 'Romaji off';
  });
  const COUNT_RO = {'一杯': 'ippai', '二杯': 'nihai', '三杯': 'sanbai', '一回': 'ikkai', '二回': 'nikai', '三回': 'sankai'};

  /* ── audio ── */
  let player;
  const hear = k => { try { player?.pause(); player = new Audio(`../audio/${k}.mp3`); player.play().catch(() => {}); } catch {} };

  /* ── mochi: taster, hint-giver, keeper of saved words ── */
  const mochiHTML = '<button class="mochi" aria-label="Ask Mochi for a hint"><img src="img/mochi-idle.webp" alt="" data-fallback="../assets/mochi.svg"></button><div class="bubble glass" aria-hidden="true"></div>';
  let bubbleTimer;
  function mochi(mood, jp, en, hold = 2600) {
    const m = $('.mochi'), b = $('.bubble'); if (!m) return;
    const img = $('img', m);
    img.src = `img/mochi-${mood === 'puff' ? 'puff' : mood === 'happy' ? 'happy' : 'idle'}.webp`;
    m.classList.remove('hop', 'puff'); void m.offsetWidth;
    if (mood === 'happy') m.classList.add('hop');
    if (mood === 'puff') m.classList.add('puff');
    if (jp || en) {
      b.innerHTML = (jp ? `<b lang="ja">${esc(jp)}</b>` : '') + esc(en || '');
      b.classList.add('on'); say.textContent = `${jp || ''} ${en || ''}`;
      clearTimeout(bubbleTimer);
      bubbleTimer = setTimeout(() => { b.classList.remove('on'); if (mood !== 'idle') img.src = 'img/mochi-idle.webp'; }, hold);
    }
  }
  document.addEventListener('error', e => { const t = e.target; if (t.tagName === 'IMG' && t.dataset.fallback && !t.dataset.fell) { t.dataset.fell = 1; t.src = t.dataset.fallback; } }, true);

  /* ── word sheet ── */
  function openWord(k, extra = '') {
    const w = W(k), hasAudio = !k.startsWith('x-');
    sheet.innerHTML = `<div class="in glass" role="dialog" aria-modal="true" aria-label="${esc(w.english)}">
      <div class="grab"></div>
      <div class="ja" lang="ja">${esc(w.japanese)}</div>
      <p class="read"><b class="ro">${esc(w.romaji)}</b> ${esc(w.english)}${extra ? '<br>' + esc(extra) : ''}</p>
      <div class="foot">
        ${hasAudio ? `<button class="btn soft" data-hear="${k}">${icon.hear}Hear it</button>` : ''}
        <button class="btn ${saved.has(k) ? 'soft' : 'go'}" data-keep="${k}">${icon.keep}<span>${saved.has(k) ? 'Saved' : 'Save word'}</span></button>
      </div></div>`;
    sheet.hidden = false; $('.btn', sheet).focus();
    if (hasAudio) hear(k);
  }
  const closeSheet = () => { sheet.hidden = true; sheet.innerHTML = ''; };
  sheet.addEventListener('click', e => { if (e.target === sheet) closeSheet(); });
  addEventListener('keydown', e => { if (e.key === 'Escape' && !sheet.hidden) closeSheet(); });

  document.addEventListener('click', e => {
    const h = e.target.closest('[data-hear]'); if (h) hear(h.dataset.hear);
    const k = e.target.closest('[data-keep]');
    if (k) {
      const on = toggleSave(k.dataset.keep);
      k.setAttribute('aria-pressed', on);
      const label = $('span', k); if (label) { label.textContent = on ? 'Saved' : 'Save word'; k.classList.toggle('go', !on); k.classList.toggle('soft', on); }
      say.textContent = on ? 'Saved to your words' : 'Removed from your words';
      document.dispatchEvent(new CustomEvent('kept'));
    }
    const w = e.target.closest('[data-word]'); if (w) openWord(w.dataset.word, w.dataset.note);
  });

  /* ───────────── dish table ───────────── */
  let at = Math.max(0, lessons.findIndex(l => l.id === (sessionStorage.getItem('ajimi-at') || 'nagano')));
  function table() {
    app.dataset.view = 'table';
    const n = lessons.length, step = 360 / n;
    view.innerHTML = `<section class="table">
      <div class="wheel-zone" aria-hidden="true">
        <div class="wheel">${lessons.map((l, i) => `<div class="plate" style="--a:${-i * step}deg"><svg class="region" viewBox="-8 -8 116 116" aria-hidden="true"><path d="${regions[l.id] || ''}"/><text x="50" y="6" text-anchor="middle" lang="ja">${esc(l.kanji)}</text><text class="rn" x="50" y="104" text-anchor="middle">${esc(l.name)}</text></svg><img src="${dishPic(l.id)}" alt="" loading="${Math.abs(i - at) < 3 ? 'eager' : 'lazy'}"></div>`).join('')}</div>
        <div class="table-head"><img src="../assets/mark.svg" alt=""><span></span></div>
      </div>
      <div class="dish-card glass" role="group" aria-roledescription="carousel" aria-label="Regional dishes">
        <div class="arrows"><button class="round" data-go="-1" aria-label="Previous dish">${icon.back}</button><button class="round" data-go="1" aria-label="Next dish">${icon.next}</button></div>
        <div class="copy" aria-live="polite"></div>
        <div class="dish-actions"><a class="btn go" data-learn>Learn recipe</a><a class="btn soft" data-skip>Skip to recipe</a></div>
      </div></section>`;
    const wheel = $('.wheel'), copy = $('.copy'), count = $('.table-head span');
    let turn = at * step;
    const paint = () => {
      const l = lessons[at]; sessionStorage.setItem('ajimi-at', l.id);
      wheel.style.setProperty('--turn', turn + 'deg');
      $$('.plate', wheel).forEach((p, i) => p.classList.toggle('cur', i === at));
      copy.innerHTML = `<div class="swap"><div class="where"><span>${esc(l.name)}</span><span lang="ja">${esc(l.kanji)}</span></div><h1>${esc(l.dish)}</h1><div class="jp" lang="ja">${esc(l.jp)}</div><p>${esc(l.focus)}</p></div>`;
      count.textContent = `${at + 1} / ${n}`;
      $('[data-learn]').href = `#lesson/${l.id}/ingredients`; $('[data-skip]').href = `#lesson/${l.id}/method`;
    };
    const go = d => { at = (at + d + n) % n; turn += d * step; paint(); };
    paint();
    view.onclick = e => { const b = e.target.closest('[data-go]'); if (b) go(+b.dataset.go); };
    view.onkeydown = e => { if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    /* the plate follows the finger */
    const zone = $('.table'); let x0 = null, dx = 0;
    zone.onpointerdown = e => { if (e.target.closest('a,button')) return; x0 = e.clientX; dx = 0; wheel.classList.add('dragging'); zone.setPointerCapture(e.pointerId); };
    zone.onpointermove = e => { if (x0 === null) return; dx = e.clientX - x0; wheel.style.setProperty('--turn', (turn - dx / zone.clientWidth * step * 1.6) + 'deg'); };
    zone.onpointerup = zone.onpointercancel = () => { if (x0 === null) return; x0 = null; wheel.classList.remove('dragging'); const d = Math.abs(dx) > 40 ? (dx < 0 ? 1 : -1) : 0; d ? go(d) : paint(); };
  }

  /* ───────────── lesson ───────────── */
  const STEPS = [['ingredients', '材料', 'Ingredients'], ['method', '作り方', 'Method'], ['quiz', '復習', 'Review'], ['taste', '味見', 'Taste']];
  function shell(l, step, stage, panel, frac = 0) {
    app.dataset.view = 'lesson';
    const i = STEPS.findIndex(s => s[0] === step);
    view.innerHTML = `<section class="lesson" data-step="${step}">
      <header class="bar"><a class="round" href="#table" aria-label="Close ${esc(l.dish)}">${icon.close}</a>
        <div class="steps" role="img" aria-label="Step ${i + 1} of 4, ${STEPS[i][2]}">${STEPS.map((s, j) => `<i style="--p:${j < i ? 1 : j === i ? frac : 0}"></i>`).join('')}</div>
        <div class="now"><span lang="ja">${STEPS[i][1]}</span>${STEPS[i][2]}</div>${roToggle()}</header>
      <div class="stage">${stage}${mochiHTML}</div>
      <div class="panel">${panel}</div></section>`;
    view.onclick = view.onkeydown = null;
  }
  const progress = f => $$('.steps i').forEach((el, j, all) => { const i = STEPS.findIndex(s => s[0] === $('.lesson').dataset.step); if (j === i) el.style.setProperty('--p', f); });

  /* 1. ingredients: meet each word, save the ones you do not know */
  function ingredients(l) {
    const keys = [...l.ingredients, ...l.bottles.map(b => b[0])];
    shell(l, 'ingredients',
      `<div class="cards">${keys.map(k => `<article class="card" data-k="${k}"><img class="clay" src="${pic(k)}" alt="${esc(W(k).english)}"></article>`).join('')}</div>`,
      `<div class="word"></div>
       <div class="dots">${keys.map(() => '<i></i>').join('')}</div>
       <div class="foot"><button class="btn go wide" data-next>Next word</button></div>`);
    const wordBox = $('.word'), open = new Set();
    const paintWord = () => { const k = keys[cur], w = W(k);
      wordBox.innerHTML = `<div class="swap"><button class="ja" lang="ja" data-hear="${k}" aria-label="Hear ${esc(w.romaji)}">${esc(w.japanese)}</button>
        <div class="ro">${esc(w.romaji)}</div>
        <div class="read">${open.has(k) ? esc(w.english) : '<button class="veil">Show meaning</button>'}</div>
        <div class="word-tools"><button class="round" data-hear="${k}" aria-label="Hear ${esc(w.romaji)}">${icon.hear}</button><button class="round" data-keep="${k}" aria-pressed="${saved.has(k)}" aria-label="Save ${esc(w.romaji)}">${icon.keep}</button></div></div>`; };
    const cards = $('.cards'), dots = $$('.dots i'); let cur = -1;
    const seen = new Set();
    const mark = () => dots.forEach((d, i) => { d.classList.toggle('on', i === cur); d.classList.toggle('kept', saved.has(keys[i])); });
    const show = i => {
      if (i === cur) return; cur = i; seen.add(i); mark(); paintWord(); hear(keys[i]);
      $('[data-next]').textContent = i === keys.length - 1 ? 'Start cooking' : 'Next word';
      progress(seen.size / keys.length);
    };
    cards.onscroll = () => show(Math.round(cards.scrollLeft / cards.clientWidth));
    show(0);
    document.addEventListener('kept', mark);
    view.onclick = e => {
      const v = e.target.closest('.veil');
      if (v) { open.add(keys[cur]); paintWord(); return; }
      if (e.target.closest('.mochi')) { const w = W(keys[cur]); mochi('idle', w.japanese, `${w.romaji}. ${saved.has(keys[cur]) ? 'I am keeping this one for you.' : 'Save it and I will ask you later.'}`); hear(keys[cur]); }
      if (e.target.closest('[data-next]')) cur < keys.length - 1 ? cards.scrollTo({left: (cur + 1) * cards.clientWidth, behavior: reduced.matches ? 'auto' : 'smooth'}) : (location.hash = `#lesson/${l.id}/method`);
    };
  }

  /* 2. method: read the sentence, do the verb */
  function method(l) {
    const t = l.technique, tk = 'tech-' + (l.phrase.parts.find(p => p.startsWith('tech-')) || 'tech-' + t.key).replace('tech-', '');
    const obj = W(l.phrase.parts[0]), isUdon = l.id === 'kagawa';
    const [b1, b2] = l.bottles;
    const countRo = b => COUNT_RO[['', '一', '二', '三'][b[1]] + unitJP(l, b)] || '';
    const marked = s => SEASON[l.id].verbs.reduce((h, [v, k]) => h.replace(v, `<button class="verb" data-word="${k}" lang="ja">${v}</button>`), esc(s));
    const lines = [
      {ja: `${esc(obj.japanese)}を<button class="verb" data-word="${tk}" lang="ja">${esc(t.word)}</button>`, en: l.phrase.english, ro: `${obj.romaji} o ${W(tk).romaji}`, audio: 'phrase-' + l.id},
      isUdon
        ? {ja: `${esc(W(b1[0]).japanese)}を${counter(b1)}、${esc(W(b2[0]).japanese)}を${counter(b2)}<button class="verb" data-word="tech-pour" lang="ja">かける</button>`, en: `Add ${b1[1]} ${b1[2]} of ${W(b1[0]).english} and ${b2[1]} ${b2[2]} of ${W(b2[0]).english}.`, ro: `${W(b1[0]).romaji} o ${countRo(b1)}, ${W(b2[0]).romaji} o ${countRo(b2)} kakeru`, audio: l.id + '-pour'}
        : {ja: marked(l.seasonJP), en: l.seasonEN, ro: SEASON[l.id].ro, audio: l.id + '-pour'},
      ...(isUdon ? [{ja: `ねぎとしょうがを<button class="verb" data-word="x-noseru" lang="ja">のせる</button>`, en: 'Put the spring onion and ginger on top.', ro: 'negi to shōga o noseru', audio: l.id + '-pour'}] : [])
    ];
    let cur = 0;
    const draw = () => {
      shell(l, 'method', stageFor(cur),
        `<ol class="lines">${lines.map((s, i) => `<li class="${i === cur ? 'now' : i < cur ? 'done' : ''}"><span class="n">${i + 1}</span><div><div class="ja" lang="ja">${s.ja}</div><div class="ro">${esc(s.ro || '')}</div><div class="en">${esc(s.en)}</div></div></li>`).join('')}</ol>
         <div class="foot"><button class="round" data-hear="${lines[cur].audio}" aria-label="Hear the instruction">${icon.hear}</button>${footFor(cur)}</div>`, cur / lines.length);
      wire(cur);
    };
    function counter(b) { return ['', '一', '二', '三'][b[1]] + unitJP(l, b); }
    const stageFor = i => i === 0
      ? `<div class="pot${isUdon ? '' : ' clay-act'}" data-tech-key="${esc(t.key)}" data-method="${esc(t.method)}" data-tech-count="0" data-tech-done="false"><button data-act="tech-surface" aria-label="Hold to ${esc(t.en)}"><img src="${isUdon ? '../assets/pantry/donabe.webp' : pic(l.phrase.parts[0])}" alt="">${isUdon ? '<ajimi-boil aria-hidden="true"></ajimi-boil>' : '<span class="heat" aria-hidden="true"><i></i><i></i><i></i></span>'}</button><div class="meter" role="progressbar" aria-label="${esc(t.en)}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div></div>`
      : `<div class="bowl">${isUdon ? [0, 1, 2, 3].map(n => `<img src="img/bowl-${n}.webp" alt="" data-b="${n}" class="${n === (i === 1 ? 1 : 2) ? 'on' : ''}">`).join('') : `<img src="${dishPic(l.id)}" alt="" class="on">`}</div>`;
    const footFor = i => i === 0 ? `<button class="btn go" data-hold>Hold to ${esc(t.en)}</button>`
      : i === 1 ? `<div class="tray">${[b1, b2].map(b => `<button class="tool" data-pour="${b[0]}"><img src="${pic(b[0])}" alt=""><span class="ja" lang="ja">${esc(W(b[0]).japanese)}</span><span class="en">${esc(W(b[0]).english)}</span><span class="count" lang="ja" hidden></span></button>`).join('')}</div>`
      : `<div class="tray">${['scallion', 'ginger'].map(k => `<button class="tool" data-top="${k}"><img src="${pic(k)}" alt=""><span class="ja" lang="ja">${esc(W(k).japanese)}</span><span class="en">${esc(W(k).english)}</span></button>`).join('')}</div>`;
    const advance = (jp, en) => {
      mochi('happy', jp, en, 1500);
      setTimeout(() => { cur++; cur < lines.length ? draw() : (location.hash = `#lesson/${l.id}/quiz`); }, reduced.matches ? 900 : 1500);
    };
    function wire(i) {
      setTimeout(() => hear(lines[i].audio), 350);
      view.onclick = e => { if (e.target.closest('.mochi')) { mochi('idle', lines[i].ja.replace(/<[^>]+>/g, ''), lines[i].en, 3600); hear(lines[i].audio); } tap(e); };
      let tap = () => {};
      if (i === 0) {
        const board = $('.pot'), surface = $('button', board), bar = $('.meter i'), meter = $('.meter'), holdBtn = $('[data-hold]');
        let p = 0, holding = false, last = 0, raf = 0, done = false;
        const set = () => { bar.style.setProperty('--p', p); meter.setAttribute('aria-valuenow', Math.round(p * 100)); board.dataset.techCount = Math.floor(p * 3); progress(p / lines.length); };
        const loop = now => {
          if (!holding || done) return;
          p = Math.min(1, p + (now - last) / 2600); last = now; set();
          if (p >= 1) { done = true; stop(); board.dataset.techDone = 'true'; advance(t.word + '！', t.done); return; }
          raf = requestAnimationFrame(loop);
        };
        const start = () => { if (done || holding) return; holding = true; surface.classList.add('tech-engaged'); holdBtn.classList.add('pressed'); last = performance.now(); raf = requestAnimationFrame(loop); };
        const stop = () => { holding = false; surface.classList.remove('tech-engaged'); holdBtn.classList.remove('pressed'); cancelAnimationFrame(raf); };
        for (const el of [surface, holdBtn]) {
          el.onpointerdown = e => { e.preventDefault(); start(); };
          el.onpointerup = el.onpointerleave = el.onpointercancel = stop;
          el.onkeydown = e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); start(); } };
          el.onkeyup = stop; el.onblur = stop;
          el.oncontextmenu = e => e.preventDefault();
        }
        /* without motion, three presses do the same job */
        if (reduced.matches) holdBtn.onclick = () => { if (done) return; p = Math.min(1, p + 1 / 3); set(); if (p >= 1) { done = true; board.dataset.techDone = 'true'; advance(t.word + '！', t.done); } };
      }
      if (i === 1) {
        const need = {[b1[0]]: b1[1], [b2[0]]: b2[1]}, got = {[b1[0]]: 0, [b2[0]]: 0}, bowl = $('.bowl');
        tap = e => {
          const b = e.target.closest('[data-pour]'); if (!b) return;
          const k = b.dataset.pour; got[k]++;
          const c = $('.count', b); c.hidden = false; c.textContent = ['', '一', '二', '三', '四'][got[k]] + unitJP(l, k === b1[0] ? b1 : b2);
          bowl.classList.remove('splash'); void bowl.offsetWidth; bowl.classList.add('splash');
          if (isUdon && k === 'stock') { $$('img', bowl).forEach(im => im.classList.toggle('on', im.dataset.b === '2')); }
          hear(k);
          if (got[k] > need[k]) {
            const miss = need[k] === 0 ? [`${W(k).japanese}は入れないで。`, '', `Leave out the ${W(k).english} this time.`]
              : (k === b1[0] ? l.missHigh : l.missSecondHigh) || ['多すぎる。', '', 'Too much. Listen for the measure again.'];
            mochi('puff', miss[0], miss[2], 2600);
            setTimeout(() => { for (const x in got) got[x] = 0; $$('.count').forEach(x => x.hidden = true); if (isUdon) $$('img', bowl).forEach(im => im.classList.toggle('on', im.dataset.b === '1')); }, 1300);
            return;
          }
          progress((1 + (got[b1[0]] + got[b2[0]]) / (b1[1] + b2[1])) / lines.length);
          if (got[b1[0]] === need[b1[0]] && got[b2[0]] === need[b2[0]]) isUdon ? advance('ちょうどいい！', 'Just right.') : (mochi('happy', 'ちょうどいい！', 'Just right.', 1400), setTimeout(() => location.hash = `#lesson/${l.id}/quiz`, 1500));
        };
      }
      if (i === 2) {
        let n = 0;
        tap = e => {
          const b = e.target.closest('[data-top]'); if (!b) return;
          b.classList.add('used'); hear(b.dataset.top); n++;
          const bowl = $('.bowl'); bowl.classList.remove('splash'); void bowl.offsetWidth; bowl.classList.add('splash');
          progress((2 + n / 2) / lines.length);
          if (n === 2) { $$('img', bowl).forEach(im => im.classList.toggle('on', im.dataset.b === '3')); advance('できた！', 'Done. Now for the words.'); }
        };
      }
    }
    draw();
  }

  /* 3. review: fill the missing word. A wrong answer puffs Mochi up like a grilled rice cake. */
  function quiz(l) {
    const tk = l.phrase.parts.find(p => p.startsWith('tech-')), obj = l.phrase.parts[0];
    const others = Object.keys(vocab).filter(k => k.startsWith('tech-') && k !== tk);
    const pick = (arr, n, seed) => arr.map((v, i) => [Math.sin(seed * 99 + i * 7.3), v]).sort((a, b) => a[0] - b[0]).slice(0, n).map(x => x[1]);
    const [b1] = l.bottles, countJP = n => ['', '一', '二', '三'][n] + unitJP(l, b1);
    const food = [...l.ingredients, l.odd];
    const withAnswer = (a, seed) => pick([a, ...food.filter(k => k !== a).slice(0, 3)], 4, seed);
    let qs = [
      {pic: pic(obj), before: '', after: `を${esc(W(tk).japanese)}`, answer: obj, opts: withAnswer(obj, 1), key: obj},
      {pic: l.id === 'kagawa' ? '../assets/pantry/donabe.webp' : dishPic(l.id), before: `${esc(W(obj).japanese)}を`, after: '', answer: tk, opts: pick([tk, ...pick(others, 3, 2)], 4, 3), key: tk},
      {pic: pic(b1[0]), before: `${esc(W(b1[0]).japanese)}を`, after: l.id === 'kagawa' ? 'かける' : '', answer: countJP(b1[1]), opts: [1, 2, 3].map(countJP), raw: true, key: b1[0]},
      {pic: pic(l.ingredients[1]), before: '', after: l.id === 'kagawa' ? 'をのせる' : '', answer: l.ingredients[1], opts: withAnswer(l.ingredients[1], 5), key: l.ingredients[1]}
    ];
    /* the words you saved come back first */
    qs = [...qs.filter(q => saved.has(q.key)), ...qs.filter(q => !saved.has(q.key))];
    let cur = 0, slips = 0; const kept = [];
    const label = (q, o) => q.raw ? {ja: o, sub: COUNT_RO[o] || ''} : {ja: W(o).japanese, sub: W(o).romaji};
    const draw = () => {
      const q = qs[cur];
      shell(l, 'quiz', `<img class="q-pic" src="${q.pic}" alt="">`,
        `<p class="q-count">${saved.has(q.key) ? 'You saved this one' : `${cur + 1} of ${qs.length}`}</p>
         <p class="q-line" lang="ja">${q.before}<span class="gap">＿</span>${q.after}</p>
         <div class="opts">${q.opts.map(o => `<button class="opt" lang="ja" data-o="${esc(o)}">${esc(label(q, o).ja)}<small class="ro" lang="en">${esc(label(q, o).sub)}</small></button>`).join('')}</div>`, cur / qs.length);
      view.onclick = e => {
        if (e.target.closest('.mochi')) { const wrong = $$('.opt:not(.no)').find(b => b.dataset.o !== q.answer); if (wrong && $$('.opt:not(.no)').length > 2) wrong.classList.add('no'); mochi('idle', 'ヒント', 'Not that one.', 1600); if (!q.raw) hear(q.answer); return; }
        const b = e.target.closest('.opt'); if (!b || b.classList.contains('no')) return;
        if (b.dataset.o === q.answer) {
          b.classList.add('yes'); $$('.opt').forEach(x => x.disabled = true);
          const g = $('.gap'); g.textContent = label(q, q.answer).ja; g.classList.add('filled');
          if (!q.raw) hear(q.answer);
          mochi('happy', 'せいかい！', 'Correct.', 1200); progress((cur + 1) / qs.length);
          setTimeout(() => { cur++; cur < qs.length ? draw() : (sessionStorage.setItem('ajimi-kept', kept.map(k => W(k).japanese).join('、')), location.hash = `#lesson/${l.id}/taste`); }, 1300);
        } else {
          slips++; b.classList.add('no');
          if (vocab[q.key] && !saved.has(q.key)) { saved.add(q.key); persist(); kept.push(q.key); }
          const w = q.raw ? null : W(b.dataset.o);
          mochi('puff', 'ちがう！', w ? `${w.japanese} is ${w.english}. Try again.` : 'Count again.', 2400);
        }
      };
    };
    draw();
  }

  /* 4. taste: the finished dish, Mochi's verdict, what you learned */
  function taste(l) {
    const words = [...l.ingredients, ...l.bottles.map(b => b[0]), l.phrase.parts.find(p => p.startsWith('tech-'))];
    const kept = sessionStorage.getItem('ajimi-kept') || '';
    shell(l, 'taste',
      `<img class="finale" src="${dishPic(l.id)}" alt="${esc(l.dish)}"><div class="steam" aria-hidden="true"><i></i><i></i><i></i></div>`,
      `<h2 lang="ja">${esc(l.jp)}</h2><p class="hint">${esc(l.dish)}, ${esc(l.name)}. Tap a word to hear it again.</p>
       <div class="learned">${words.map(k => `<button class="chip ${saved.has(k) ? 'kept' : ''}" data-word="${k}" lang="ja">${esc(W(k).japanese)}<small class="ro" lang="en">${esc(W(k).romaji)}</small><small lang="en">${esc(W(k).english)}</small></button>`).join('')}</div>
       <details class="diet"><summary>Dietary notes</summary><p>${esc(l.dietary)}</p></details>
       <div class="foot"><a class="btn soft" href="#words">My words</a><a class="btn go" href="#table">Another dish</a></div>`, 1);
    setTimeout(() => { hear('tasty'); mochi('happy', 'おいしい！', kept ? `Delicious. I kept ${kept} for you to try again.` : 'Delicious. Not one slip.', 5200); }, 700);
    document.addEventListener('kept', () => $$('.chip').forEach(c => c.classList.toggle('kept', saved.has(c.dataset.word))));
    view.onclick = e => { if (e.target.closest('.mochi')) { hear('tasty'); mochi('happy', 'おいしい！', 'oishii: delicious.'); } };
  }

  /* ───────────── words ───────────── */
  function words() {
    app.dataset.view = 'words';
    const draw = () => {
      view.innerHTML = `<section class="book"><h1>My words</h1>${roToggle()}` + (saved.size
        ? `<p>${saved.size} saved. They come back first in every review.</p><ul class="rows">${[...saved].map(k => { const w = W(k); return `<li><div><div class="ja" lang="ja">${esc(w.japanese)}</div><div class="en"><span class="ro">${esc(w.romaji)}, </span>${esc(w.english)}</div></div><button class="round" data-hear="${k}" aria-label="Hear ${esc(w.romaji)}">${icon.hear}</button><button class="round" data-keep="${k}" aria-pressed="true" aria-label="Remove ${esc(w.romaji)}">${icon.keep}</button></li>`; }).join('')}</ul>`
        : `<div class="empty"><img src="img/mochi-idle.webp" data-fallback="../assets/mochi.svg" alt=""><p>Nothing saved yet.<br>Save a word in any kitchen and Mochi keeps it here.</p><a class="btn go" href="#table">Open a kitchen</a></div>`) + `</section>`;
    };
    draw(); view.onclick = null; document.addEventListener('kept', () => { if (app.dataset.view === 'words') draw(); });
  }

  /* ───────────── routes ───────────── */
  function route() {
    closeSheet();
    const [name, id, step] = location.hash.slice(1).split('/');
    $$('#tabs a').forEach(a => a.dataset.tab === (name === 'words' ? 'words' : 'table') ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
    const l = byId[id];
    if (name === 'lesson' && l) ({ingredients, method, quiz, taste}[step] || ingredients)(l);
    else if (name === 'words') words();
    else table();
    view.focus({preventScroll: true});
  }
  addEventListener('hashchange', route);
  badge(); route();
})();
