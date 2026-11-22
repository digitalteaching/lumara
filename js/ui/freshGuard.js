// Schutz gegen Doppeltipps: Knöpfe, die gerade erst unter dem Finger erschienen sind,
// nehmen für kurze Zeit nichts an. So landet der zweite Tipp nicht auf „Fliehen“ oder einer
// Antwort, die das Kind noch gar nicht gesehen hat.

export const FRESH_MS = 350;
// Fragen (dialog.js choose) schützen länger: Kinder tippen oft schnell durch Gesprächszeilen, und die
// Frage danach (Wunsch eintauschen, Aufgabe annehmen, Reiseziel) erscheint genau unter dem Finger.
export const CHOICE_FRESH_MS = 650;

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
// ownPress: Ein Klick zählt außerdem nur, wenn ein Finger nach dem Erscheinen auf `node` aufgesetzt hat
// (pointerdown). Ein Tipp, der schon vorher begann (etwa auf der letzten Gesprächszeile), wählt so nie
// etwas, auch wenn der Finger länger liegen bleibt als die Schutzzeit. Ein Klick per Tastatur (Enter
// auf einem Knopf, detail 0) braucht keinen Finger.
export function guardClicks(node, guard, { ownPress = false } = {}) {
  let pressed = false;
  const press = () => {
    pressed = true;
  };
  const block = e => {
    if (!guard.isFresh() && (!ownPress || pressed || e.detail === 0)) return;
    e.preventDefault();
    e.stopPropagation();
  };
  if (ownPress) node.addEventListener('pointerdown', press, true);
  node.addEventListener('click', block, true);
  return () => {
    node.removeEventListener('click', block, true);
    if (ownPress) node.removeEventListener('pointerdown', press, true);
  };
}
