// The same chapter controls run in the portfolio route and the portable case study.
export function enhanceCaseStudy(root) {
  const chapters = [...root.querySelectorAll('.aj-chapter')];
  const section = root.querySelector('.aj-journey');
  const header = root.querySelector('.aj-journey-head');
  const count = root.querySelector('.aj-counter');
  const siteHeader = document.querySelector('.site-header');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  const options = {signal: events.signal};
  let frame = 0;
  let headerOffset = 0;
  let chapterTops = [];
  const manuallySet = new WeakSet();
  const demos = chapters.map(card => {
    const video = card.querySelector('video');
    const button = card.querySelector('.aj-play');
    let automatic = !reduced.matches && !navigator.connection?.saveData;
    let inView = false;
    const reflectPlayback = () => {
      const playing = !video.paused && !video.ended;
      button.textContent = playing ? (root.dataset.pauseLabel || 'Pause recording') : (root.dataset.playLabel || 'Play recording');
      button.setAttribute('aria-pressed', String(playing));
    };
    const setPlaying = value => {
      if (value && video.paused) video.play().catch(reflectPlayback);
      else if (!value && !video.paused) { video.pause(); reflectPlayback(); }
    };
    video.controls = false;
    video.addEventListener('play', reflectPlayback, options);
    video.addEventListener('pause', reflectPlayback, options);
    video.addEventListener('error', reflectPlayback, options);
    const sound = card.querySelector('.aj-sound');
    if (sound) {
      sound.hidden = false;
      sound.addEventListener('click', () => {
        video.muted = !video.muted;
        sound.setAttribute('aria-pressed', String(!video.muted));
        sound.textContent = video.muted ? (root.dataset.soundOn || 'Sound on') : (root.dataset.soundOff || 'Sound off');
      }, options);
    }
    button.hidden = false;
    button.addEventListener('click', () => {
      automatic = false;
      setPlaying(video.paused);
    }, options);
    const refresh = () => {
      if (!inView || !card.open || document.hidden) setPlaying(false);
      else if (automatic) setPlaying(true);
    };
    return {
      video, refresh,
      motionChanged() { automatic = !reduced.matches && !navigator.connection?.saveData; setPlaying(false); refresh(); },
      visibility(visible) { inView = visible; refresh(); }
    };
  });

  function visibleHeaderOffset() {
    if (!siteHeader) return 0;
    const style = getComputedStyle(siteHeader);
    const box = siteHeader.getBoundingClientRect();
    if (style.position !== 'fixed' && style.position !== 'sticky') return 0;
    return Math.round(Math.max(0, Math.min(box.height, box.bottom)));
  }

  function updateScroll() {
    frame = 0;
    headerOffset = visibleHeaderOffset();
    root.style.setProperty('--aj-header-offset', headerOffset + 'px');
    const anchor = scrollY + headerOffset + header.offsetHeight + Math.min(140, innerHeight * .18);
    let active = 0;
    chapterTops.forEach((top, index) => { if (top <= anchor) active = index; });
    count.textContent = (active + 1) + ' / ' + chapters.length;
    const first = chapterTops[0];
    const last = chapterTops[chapterTops.length - 1];
    const fraction = Math.min(1, Math.max(0, (anchor - first) / Math.max(1, last - first)));
    section.style.setProperty('--aj-progress', (1 / chapters.length + fraction * (1 - 1 / chapters.length)).toFixed(4));
    chapters[active].dataset.seen = '';
    // Keep the original space in the flow as a finished card folds. The next
    // chapter and the reader's scroll position stay put in both directions.
    chapters.forEach((card, index) => {
      if (manuallySet.has(card)) return;
      const shouldFold = !reduced.matches && index < active;
      if (shouldFold && card.open) {
        const summary = card.querySelector('summary');
        const border = card.offsetHeight - card.clientHeight;
        const space = Math.max(0, card.offsetHeight - summary.offsetHeight - border);
        card.style.setProperty('--aj-fold-space', space + 'px');
        card.dataset.autoFolded = '';
        card.open = false;
      } else if (!shouldFold && card.hasAttribute('data-auto-folded')) {
        card.removeAttribute('data-auto-folded');
        card.open = true;
      }
    });
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(updateScroll); };

  function measure() {
    headerOffset = visibleHeaderOffset();
    root.style.setProperty('--aj-header-offset', headerOffset + 'px');
    let pin = header.offsetHeight;
    let naturalTop = section.getBoundingClientRect().top + scrollY + header.offsetHeight;
    chapterTops = chapters.map(card => {
      const top = naturalTop;
      const height = card.offsetHeight;
      const reserve = card.hasAttribute('data-auto-folded')
        ? parseFloat(card.style.getPropertyValue('--aj-fold-space')) || 0 : 0;
      naturalTop += height + reserve;
      card.style.setProperty('--aj-pin', pin + 'px');
      card.classList.toggle('is-stackable', !reduced.matches && headerOffset + pin + height + 12 < innerHeight);
      pin += card.querySelector('summary').offsetHeight;
      return top;
    });
    schedule();
  }
  const observer = new ResizeObserver(measure);
  [root, header, ...chapters, ...(siteHeader ? [siteHeader] : [])].forEach(el => observer.observe(el));
  const viewport = new IntersectionObserver(entries => {
    entries.forEach(entry => demos.find(demo => demo.video === entry.target)?.visibility(entry.isIntersecting));
  }, {threshold:.2});
  demos.forEach(demo => viewport.observe(demo.video));
  chapters.forEach((card, i) => {
    card.querySelector('summary').addEventListener('click', () => {
      manuallySet.add(card);
      if (card.hasAttribute('data-auto-folded')) {
        card.removeAttribute('data-auto-folded');
        requestAnimationFrame(() => card.scrollIntoView({block:'start', behavior:'instant'}));
      }
    }, options);
    card.addEventListener('toggle', () => { demos[i].refresh(); measure(); }, options);
  });
  addEventListener('scroll', schedule, {passive:true, signal:events.signal});
  addEventListener('resize', measure, options);
  siteHeader?.addEventListener('transitionend', schedule, options);
  reduced.addEventListener('change', () => { demos.forEach(demo => demo.motionChanged()); measure(); }, options);
  document.addEventListener('visibilitychange', () => demos.forEach(demo => demo.refresh()), options);
  measure();
  return () => { demos.forEach(demo => demo.video.pause()); events.abort(); observer.disconnect(); viewport.disconnect(); cancelAnimationFrame(frame); };
}
