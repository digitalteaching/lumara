// Schutz gegen Doppeltipps: Knöpfe, die gerade erst unter dem Finger erschienen sind,
// nehmen für kurze Zeit nichts an. So landet der zweite Tipp nicht auf „Fliehen“ oder einer
// Antwort, die das Kind noch gar nicht gesehen hat.

export const FRESH_MS = 350;

export function createFreshGuard(ms = FRESH_MS, now = () => performance.now()) {
  let since = now();
  return {
    isFresh: () => now() - since < ms,
    reset() {
      since = now();
    },
  };
}

// Blockiert Klicks auf alles in `node`, solange der Wächter frisch ist (Capture-Phase).
export function guardClicks(node, guard) {
  const block = e => {
    if (!guard.isFresh()) return;
    e.preventDefault();
    e.stopPropagation();
  };
  node.addEventListener('click', block, true);
  return () => node.removeEventListener('click', block, true);
}
