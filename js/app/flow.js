// Startablauf ohne DOM: welcher Weg nach dem Titel, wann gespeichert wird, und ein sauberer Neustart.
// Die Szenen dazu liegen in js/scenes/start.js.

// Weg nach dem Titelbildschirm (Design 4, 11).
export function routeAfterTitle({ status, storedPackOk, installFirst = false }) {
  if (status === 'ok') return storedPackOk ? 'world' : 'pack-world';
  if (status === 'backup' || status === 'damaged') return 'recover';
  if (status === 'newer') return 'newer';
  return installFirst ? 'install' : 'new-game';
}

// Neustart nach „Neues Spiel“ oder nach dem Laden einer Sicherung. Zuerst wird das Speichern
// abgeschaltet: Sonst würde das automatische Speichern beim Verlassen der Seite den alten Stand
// zurückschreiben.
export function reloadGame(game, options = {}, { reload = () => location.reload() } = {}) {
  game.saveEnabled = false;
  game.state = null;
  game.store.clear();
  reload();
}

// game.save(): null, solange es nichts zu speichern gibt (Titel, Probefrage, Entwickler-Abkürzungen),
// sonst das Ergebnis des Speichers. Gespeichert wird nur, wenn der normale Startablauf es erlaubt.
export function makeSaver(game, { onFirstSave = () => {} } = {}) {
  let first = true;
  return () => {
    if (!game.saveEnabled || !game.state) return null;
    const ok = game.store.save(game.state);
    if (ok && first) {
      first = false;
      onFirstSave();
    }
    return ok;
  };
}
