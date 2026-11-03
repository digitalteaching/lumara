// Das Lernpaket setzen (Design 10.6): Mit dem Paket kommt die Spielsprache. Alle Stellen, die ein
// Paket übernehmen, gehen über setGamePack, damit Sprache, <html lang> und Seitentitel stimmen.

import { setLanguage, t } from '../i18n/i18n.js';

export function applyLanguage(lang) {
  const active = setLanguage(lang);
  if (typeof document !== 'undefined') {
    document.documentElement.lang = active;
    document.title = t('app.title');
  }
  return active;
}

export function setGamePack(game, pack) {
  game.pack = pack;
  return applyLanguage(pack?.data?.language ?? 'de');
}
