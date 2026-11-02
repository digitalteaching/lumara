// Spielschleife mit festem Zeitschritt (60 Schritte pro Sekunde).
// Nach einer Pause im Hintergrund wird nichts nachgeholt.

const STEP = 1000 / 60;
const MAX_STEPS = 5;

export function startLoop({ update, render }) {
  let acc = 0;
  let last = null;
  let running = true;
  let raf = 0;

  function frame(now) {
    if (!running) return;
    raf = requestAnimationFrame(frame);
    if (document.hidden) {
      last = null;
      return;
    }
    if (last === null) last = now;
    acc += Math.min(now - last, STEP * MAX_STEPS);
    last = now;

    let steps = 0;
    while (acc >= STEP && steps < MAX_STEPS) {
      update(STEP);
      acc -= STEP;
      steps++;
    }
    if (steps === MAX_STEPS) acc = 0;
    render(now);
  }

  function reset() {
    last = null;
    acc = 0;
  }

  document.addEventListener('visibilitychange', reset);
  raf = requestAnimationFrame(frame);

  return () => {
    running = false;
    cancelAnimationFrame(raf);
    document.removeEventListener('visibilitychange', reset);
  };
}
