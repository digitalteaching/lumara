// Kurze Hinweise, die von selbst wieder verschwinden.

import { el } from './dom.js';

// Hinweis oben in der Mitte. Liegt über allem, auch über dem Menü.
export function showToast(text, ms = 6000) {
  const node = el('div', { class: 'toast', role: 'status' }, text);
  document.body.append(node);
  setTimeout(() => node.remove(), ms);
  return node;
}

// Leise Sätze in der Welt (Flüstern der Bäume, Luftspiegelungen, Sätze der Spielaufgaben): ohne
// Fenster und ohne Sperre, nach ms von selbst weg. Ein neuer Satz ersetzt den alten derselben Zeile.
// whisper.clear() nimmt ihn sofort weg, etwa beim Verlassen der Welt. Ohne game.ui (Tests): nichts.
export function createWhisper(game, ms = 3000) {
  let node = null;
  let timer = null;
  const whisper = text => {
    if (!game.ui) return;
    node?.remove();
    clearTimeout(timer);
    node = el('div', { class: 'whisper passive', 'aria-live': 'polite' }, text);
    game.ui.append(node);
    timer = setTimeout(() => node?.remove(), ms);
  };
  whisper.clear = () => {
    clearTimeout(timer);
    node?.remove();
  };
  return whisper;
}
