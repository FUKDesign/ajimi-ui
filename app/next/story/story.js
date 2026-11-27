/* Ajimi case study: stacked cards and scroll-linked motion. With reduced motion, or without this file, the page is a plain document. */
(() => {
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = [...document.querySelectorAll('.card')];
  const scrubs = [...document.querySelectorAll('[data-scrub]')];
  const reveals = [...document.querySelectorAll('[data-reveal]')];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const kitchens = document.querySelector('.kitchens'), labels = [...document.querySelectorAll('.kitchen-labels li')];
  const mochi = document.querySelector('.mochi'), jobs = [...document.querySelectorAll('.jobs li')];
  let tops = [], heights = [], vh = innerHeight, queued = false, live = false;
  root.classList.add('js');

  const pick = (items, i) => items.forEach((el, j) => el.classList.toggle('on', j === i));

  /* Each card sticks once its last line is on screen, so the next card slides over it. */
  function measure() {
    if (!live) return;
    vh = innerHeight;
    let y = cards[0].parentElement.offsetTop;
    cards.forEach((c, i) => { heights[i] = c.offsetHeight; tops[i] = y; y += heights[i]; c.style.top = Math.min(0, vh - heights[i]) + 'px'; });
    frame();
  }

  function frame() {
    queued = false;
    if (!live) return;
    const y = scrollY;
    cards.forEach((c, i) => {
      const p = clamp((y - tops[i]) / Math.max(1, heights[i] - vh));
      c.style.setProperty('--p', p.toFixed(4));
      c.style.setProperty('--out', clamp((y - (tops[i] + heights[i] - vh)) / vh).toFixed(4));
      if (c === kitchens) pick(labels, Math.round(p * (labels.length - 1)));
      if (c === mochi) pick(jobs, p < .34 ? 0 : p < .67 ? 1 : 2);
    });
    for (const el of scrubs) {
      const r = el.getBoundingClientRect();
      if (r.bottom < -vh || r.top > vh * 2) continue;
      el.style.setProperty('--v', clamp((vh * .95 - r.top) / (vh * .6)).toFixed(4));
    }
  }
  const tick = () => { if (!queued) { queued = true; requestAnimationFrame(frame); } };

  /* Text and figures rise in as they arrive. Siblings follow one another. */
  const seen = new IntersectionObserver(entries => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      const el = e.target;
      const sibs = [...el.parentElement.children].filter(x => x.hasAttribute('data-reveal'));
      el.style.setProperty('--d', sibs.indexOf(el));
      el.classList.add('in');
      const n = el.querySelector('[data-count]');
      if (n && live) count(n);
      seen.unobserve(el);
    }
  }, {rootMargin: '0px 0px -8% 0px', threshold: .12});

  function count(el) {
    const to = +el.dataset.count, dec = (el.dataset.count.split('.')[1] || '').length, suffix = el.dataset.suffix || '';
    const t0 = performance.now(), ms = 1300;
    const step = now => {
      const k = clamp((now - t0) / ms), v = to * (1 - Math.pow(1 - k, 3));
      el.textContent = v.toLocaleString('en-GB', {minimumFractionDigits: dec, maximumFractionDigits: dec}) + suffix;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* Each flow is a short recording. It plays while it is on screen. */
  const clips = [...document.querySelectorAll('video.clip')];
  const watching = new IntersectionObserver(entries => {
    for (const e of entries) { if (!live) continue; e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause(); }
  }, {threshold: .35});
  clips.forEach(v => watching.observe(v));

  /* In-page links go to where a card starts, not to where it is stuck. */
  function goTo(hash, smooth) {
    const target = hash.length > 1 && document.getElementById(hash.slice(1));
    const i = target ? cards.indexOf(target.closest('.card')) : -1;
    if (i < 0) return false;
    scrollTo({top: live ? tops[i] : target.getBoundingClientRect().top + scrollY, behavior: smooth && live ? 'smooth' : 'auto'});
    return true;
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (a && goTo(a.getAttribute('href'), true)) { e.preventDefault(); history.replaceState(null, '', a.getAttribute('href')); }
  });

  function mode() {
    live = !reduced.matches;
    root.classList.toggle('still', !live);
    clips.forEach(v => { v.controls = !live; if (!live) v.pause(); });
    if (live) { measure(); }
    else {
      cards.forEach(c => { c.style.top = ''; c.style.removeProperty('--p'); c.style.removeProperty('--out'); });
      scrubs.forEach(el => el.style.removeProperty('--v'));
    }
  }
  reveals.forEach(el => seen.observe(el));
  addEventListener('scroll', tick, {passive: true});
  addEventListener('resize', measure);
  new ResizeObserver(measure).observe(cards[0].parentElement);
  reduced.addEventListener('change', mode);
  mode();
  if (location.hash) requestAnimationFrame(() => goTo(location.hash, false));
})();
