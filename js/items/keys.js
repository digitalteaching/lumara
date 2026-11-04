// Schlüsselgegenstände (Design 5.7, 8.4): Belohnungen aus Aufträgen, die nie verbraucht werden.
// Sie öffnen geheime Orte (Laterne, Kletterhaken, Nussschale, Eiskufen, Sternkarte) oder geben
// mehr Platz für Futter (Futterbeutel). DOM-frei.

export const KEY_ITEMS = ['foodbag', 'lantern', 'hook', 'nutshell', 'skates', 'starmap'];

export const hasKey = (state, key) => Array.isArray(state.keys) && state.keys.includes(key);

// Wahr, wenn der Gegenstand neu ist.
export function giveKey(state, key) {
  if (!KEY_ITEMS.includes(key) || hasKey(state, key)) return false;
  state.keys = [...(state.keys ?? []), key];
  return true;
}
