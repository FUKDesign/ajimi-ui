/* Turn the dish menu by one place setting, keeping the track under the finger. */
window.AjimiTable = (() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const cached = new Map();
  let motion = null;
  let gesture = null;
  let frame = 0;

  function neighbour(origin, direction) {
    return regions[(regions.indexOf(origin) + direction + regions.length) % regions.length];
  }
  function warm(id) {
    if (cached.has(id)) return;
    const image = new Image();
    image.src = 'assets/' + id + '-plate.webp';
    cached.set(id, image);
  }
  function preloadNeighbours() {
    if (route().page !== 'atlas') return;
    warm(neighbour(state.selected, -1));
    warm(neighbour(state.selected, 1));
  }
  function cancel() {
    cancelAnimationFrame(frame);
    if (motion) {
      motion.stage.replaceChildren(motion.centre);
      motion.centre.removeAttribute('style');
      motion.stage.classList.remove('turning');
    }
    motion = null;
    gesture = null;
  }
  function prepare() {
    const stage = main.querySelector('.table-stage');
    if (!stage || motion) return motion;
    const id = state.selected, centre = stage.firstElementChild;
    const sides = [-1, 1].map(direction => {
      const el = document.createElement('div');
      el.className = 'turn-disc side-disc';
      el.innerHTML = plate(neighbour(id, direction));
      stage.append(el);
      return el;
    });
    motion = { stage, centre, id, discs: [sides[0], centre, sides[1]], u: 0, radius: stage.clientWidth * 1.13 };
    stage.classList.add('turning');
    draw(0);
    return motion;
  }
  function draw(fraction) {
    if (!motion) return;
    motion.u = fraction;
    motion.discs.forEach((disc, i) => {
      const slot = i - 1 - fraction;
      const angle = slot * 1.28;
      const distance = Math.min(1, Math.abs(slot));
      const x = Math.sin(angle) * motion.radius;
      const y = (1 - Math.cos(angle)) * motion.radius * .43;
      disc.style.transform = 'translate(' + x + 'px,' + y + 'px) rotate(' + (slot * 32) + 'deg) scale(' + (1 - distance * .24) + ')';
      disc.style.opacity = String(Math.max(0, 1 - Math.pow(distance, 2.2)));
      disc.style.zIndex = String(Math.round(10 - distance * 8));
    });
  }
  function commit(direction, focusAction) {
    const id = neighbour(state.selected, direction);
    cancel();
    state.selected = id;
    sampleRound = 0; sampleGuess = ''; heardSample = false;
    player?.pause();
    persist();
    render();
    preloadNeighbours();
    announce.textContent = R[id].dish + ', ' + R[id].name + '. Dish ' + (regions.indexOf(id) + 1) + ' of ' + regions.length + '.';
    if (focusAction) (focusAction === 'poster' ? main.querySelector('.dish-poster') : main.querySelector('[data-act="' + focusAction + '"]'))?.focus({preventScroll:true});
  }
  function settle(direction, focusAction) {
    if (!motion) return;
    cancelAnimationFrame(frame);
    const start = motion.u, startTime = performance.now(), duration = reduce.matches ? 0 : Math.max(180, 800 * Math.abs(direction - start));
    const active = motion;
    function tick(now) {
      if (motion !== active || !active.stage.isConnected) { cancel(); return; }
      const t = duration ? Math.min(1, (now - startTime) / duration) : 1;
      const eased = t * t * (3 - 2 * t);
      draw(start + (direction - start) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
      else if (direction) commit(direction, focusAction);
      else cancel();
    }
    frame = requestAnimationFrame(tick);
  }
  function turn(direction, control) {
    if (route().page !== 'atlas' || !prepare()) return;
    const action = control?.dataset.act || 'poster';
    settle(direction, action === 'region' ? 'poster' : action);
  }
  main.addEventListener('pointerdown', event => {
    const poster = event.target.closest('.dish-poster');
    if (!poster || !event.isPrimary || event.button !== 0 || event.target.closest('button,a') || motion) return;
    gesture = { poster, id:event.pointerId, x:event.clientX, y:event.clientY, start:event.timeStamp, active:false };
  });
  main.addEventListener('pointermove', event => {
    if (!gesture || event.pointerId !== gesture.id) return;
    const dx = event.clientX - gesture.x, dy = event.clientY - gesture.y;
    if (!gesture.active && Math.abs(dy) > 9 && Math.abs(dy) > Math.abs(dx)) { gesture=null; return; }
    if (!gesture.active && Math.abs(dx) > 7 && Math.abs(dx) > Math.abs(dy)) {
      gesture.active = true;
      gesture.poster.setPointerCapture(event.pointerId);
      prepare();
    }
    if (gesture.active && motion) {
      const u = Math.max(-.98, Math.min(.98, -dx / Math.min(460, gesture.poster.clientWidth * .68)));
      if (reduce.matches) motion.u = u;
      else draw(u);
    }
  });
  function release(event, aborted) {
    if (!gesture || event.pointerId !== gesture.id) return;
    const g = gesture;
    gesture = null;
    if (!g.active || !motion) return;
    if (g.poster.hasPointerCapture(event.pointerId)) g.poster.releasePointerCapture(event.pointerId);
    const dx = event.clientX - g.x, speed = Math.abs(dx) / Math.max(1, event.timeStamp - g.start);
    const accepted = !aborted && (Math.abs(motion.u) > .22 || (Math.abs(dx) > 25 && speed > .42));
    settle(accepted ? (dx < 0 ? 1 : -1) : 0);
  }
  main.addEventListener('pointerup', e => release(e,false));
  main.addEventListener('pointercancel', e => release(e,true));
  main.addEventListener('keydown', e => {
    if (e.target.matches('.dish-poster') && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
      e.preventDefault(); turn(e.key === 'ArrowRight' ? 1 : -1);
    }
  });
  addEventListener('load', preloadNeighbours, {once:true});
  return {turn,cancel};
})();
