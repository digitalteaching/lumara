// Glanzform (Design 6.4): ein fester Farbtausch innerhalb der eigenen Palette. Jede Farbfamilie
// rückt eine weiter, hell und dunkel bleiben in der Reihenfolge. Umriss (k) und Grautöne bleiben,
// damit das Wesen wiederzuerkennen ist. DOM-frei.

export const SHINY_SWAP = {
  // Grün → Violett
  F: 'P', l: 'v', g: 'V', G: 'R', T: 'f',
  // Violett → Blau
  P: 'D', v: 'S', V: 'L', R: 'A',
  // Blau → Grün
  D: 'F', S: 't', L: 'g', A: 'T',
  // Holz → Silber
  b: 'n', o: 'd', r: 's', y: 'm', Y: 'f',
  // Warm → Kühl
  e: 'P', C: 'v', p: 'V', h: 'T', H: 'A',
  // Türkis → Koralle
  t: 'C',
};

// Eigene Regeln für Arten, die mit der allgemeinen Tabelle zu wenig anders aussähen (meist sehr graue
// Wesen). Sie dürfen auch Grautöne tauschen, nie aber den Umriss k.
export const SHINY_OVERRIDE = {
  nebelunke: { f: 'V', m: 'v', d: 'P', s: 'P' }, // Morgennebel → Fliedernebel
  klippbock: { f: 'Y', m: 'y', s: 'r', d: 'o' }, // Grauer Bock → goldener Bock
  frostrobbe: { f: 'R', m: 'V', S: 'v', A: 'V' }, // Weiße Robbe → Rosenrobbe
};

export function shinyRows(rows, speciesId = null) {
  const swap = { ...SHINY_SWAP, ...(SHINY_OVERRIDE[speciesId] ?? {}) };
  delete swap.k;
  return rows.map(r => [...r].map(ch => swap[ch] ?? ch).join(''));
}
