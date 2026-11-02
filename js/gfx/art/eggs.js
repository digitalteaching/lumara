// Die fünf leuchtenden Eier am Strand (Design 4, Schritt 5). Ein Ei, je Startwesen anders eingefärbt.
// Rollen: c hell, Y Grundton, y dunkel, h Flecken.

export const EGG_ROWS = [
  '......kkkk......',
  '....kkccYYkk....',
  '...kccccYYYYk...',
  '..kcccYYYYYYYk..',
  '..kccYYYhYYYYk..',
  '.kccYYYhhhYYYyk.',
  '.kcYYYYYhYYYYyk.',
  '.kcYYYYYYYYYYyk.',
  'kccYYhYYYYYYYYyk',
  'kcYYhhhYYYYYYyyk',
  'kcYYYhYYYYYhYyyk',
  'kYYYYYYYYYhhhyyk',
  'kYYYYYYYYYYhYyyk',
  'kYYYYYYYYYYYyyyk',
  '.kYYYYYYYYYYyyk.',
  '.kyYYYYYYYYyyyk.',
  '..kyyYYYYYyyyk..',
  '...kyyyyyyyyk...',
  '....kkyyyykk....',
  '......kkkk......',
];

export const EGG_TINTS = {
  funki: { c: 'w', Y: 'V', y: 'v', h: 'H' },
  kiesel: { c: 'f', Y: 'm', y: 's', h: 'g' },
  nixi: { c: 'w', Y: 'R', y: 'C', h: 'A' },
  flausch: { c: 'w', Y: 'f', y: 'm', h: 'h' },
  pieks: { c: 'T', Y: 'G', y: 'g', h: 'o' },
};

// Farbe des Scheins um das Ei
export const EGG_GLOW = {
  funki: '255, 224, 138',
  kiesel: '181, 227, 196',
  nixi: '230, 163, 192',
  flausch: '243, 236, 210',
  pieks: '156, 199, 106',
};

export function eggRows(starterId) {
  const tint = EGG_TINTS[starterId];
  return EGG_ROWS.map(r => [...r].map(ch => tint[ch] ?? ch).join(''));
}
