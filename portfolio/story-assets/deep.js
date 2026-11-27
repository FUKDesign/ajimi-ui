/* Ajimi deep dive: clips play while on screen, and the sound buttons speak the Japanese. */
const still = matchMedia('(prefers-reduced-motion: reduce)');
const clips = [...document.querySelectorAll('.ajd video')];
const seen = new IntersectionObserver(entries => {
  for (const e of entries) { if (still.matches) continue; e.isIntersecting ? e.target.play().catch(() => {}) : e.target.pause(); }
}, {threshold: .35});
clips.forEach(v => seen.observe(v));
let voice;
for (const b of document.querySelectorAll('.ajd-say')) {
  b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') === 'true';
    voice?.pause(); document.querySelectorAll('.ajd-say').forEach(x => x.setAttribute('aria-pressed', 'false'));
    if (on) return;
    voice = new Audio(b.dataset.audio); b.setAttribute('aria-pressed', 'true');
    voice.addEventListener('ended', () => b.setAttribute('aria-pressed', 'false'));
    voice.play().catch(() => b.setAttribute('aria-pressed', 'false'));
  });
}
