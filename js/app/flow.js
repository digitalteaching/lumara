// Startablauf ohne DOM: welcher Weg nach dem Titel, wann gespeichert wird, und ein sauberer Neustart.
// Die Szenen dazu liegen in js/scenes/start.js.

import { SAVE_KEYS } from '../save/store.js';

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
// Mit state (Sicherung laden): Paket und Stand werden gespeichert; der bisherige Stand landet
// dabei als Sicherung im zweiten Schlüssel.
export function reloadGame(game, { state = null, packText = null } = {}, { reload = () => location.reload() } = {}) {
  game.saveEnabled = false;
  game.state = null;
  if (state) {
    if (packText) game.packStore.save(packText);
    game.store.save(state);
  } else {
    game.store.clear();
  }
  reload();
}

// Zwei offene Tabs: Speichert ein anderer Tab, hört dieser auf zu speichern, damit er den neueren
// Stand nicht mit seinem alten überschreibt. Das storage-Ereignis kommt nur in den anderen Tabs an.
export function watchOtherTabs(game, win, { onTakenOver }) {
  const onStorage = e => {
    if (e.key !== SAVE_KEYS.main || game.takenOver) return;
    game.takenOver = true;
    game.saveEnabled = false;
    onTakenOver();
  };
  win.addEventListener('storage', onStorage);
  return () => win.removeEventListener('storage', onStorage);
}

// game.save(): null, solange es nichts zu speichern gibt (Titel, Probefrage, Entwickler-Abkürzungen,
// ein anderer Tab hat übernommen), sonst das Ergebnis des Speichers.
export function makeSaver(game, { onFirstSave = () => {} } = {}) {
  let first = true;
  return () => {
    if (!game.saveEnabled || !game.state || game.takenOver) return null;
    const ok = game.store.save(game.state);
    if (ok && first) {
      first = false;
      onFirstSave();
    }
    return ok;
  };
}
