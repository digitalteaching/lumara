// Neutrale Standardtexte, wenn das Lernpaket keine eigenen Zeilen hat (Design 10.2), in der
// Sprache des Pakets (Design 10.6). Ein Paket hat immer eine feste Sprache, deshalb setzt der
// Parser sie schon beim Einlesen ein.

import { textIn } from '../i18n/i18n.js';

export const defaultLines = lang => ({
  hello: textIn(lang, 'trainer.defaultHello'),
  win: textIn(lang, 'trainer.defaultWin'),
  loss: textIn(lang, 'trainer.defaultLoss'),
  rematch: textIn(lang, 'trainer.defaultRematch'),
});
