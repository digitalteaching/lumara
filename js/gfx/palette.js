// Die eigene Hauptpalette von Lumara: 32 Farben, weich und leicht märchenhaft.
// Farbindex = Position + 1, Index 0 ist durchsichtig (Zeichen '.').

export const PALETTE = [
  { char: 'k', name: 'ink', hex: '#1b1a2e' },
  { char: 'n', name: 'night', hex: '#2b2d4a' },
  { char: 'd', name: 'dusk', hex: '#46496e' },
  { char: 's', name: 'slate', hex: '#6b6f94' },
  { char: 'm', name: 'mist', hex: '#a3a7c4' },
  { char: 'f', name: 'fog', hex: '#d4d6e6' },
  { char: 'c', name: 'cream', hex: '#f3ecd2' },
  { char: 'w', name: 'white', hex: '#fffaf0' },
  { char: 'b', name: 'bark', hex: '#4a3328' },
  { char: 'o', name: 'wood', hex: '#7a5236' },
  { char: 'r', name: 'frame', hex: '#a8743a' },
  { char: 'y', name: 'sand', hex: '#e2c48f' },
  { char: 'Y', name: 'sandlight', hex: '#f1ddb0' },
  { char: 'F', name: 'forest', hex: '#24493d' },
  { char: 'l', name: 'leaf', hex: '#3d7a55' },
  { char: 'g', name: 'moss', hex: '#6aa55c' },
  { char: 'G', name: 'meadow', hex: '#9cc76a' },
  { char: 'T', name: 'mint', hex: '#b5e3c4' },
  { char: 't', name: 'teal', hex: '#3f8f86' },
  { char: 'D', name: 'deep', hex: '#1f3f66' },
  { char: 'S', name: 'sea', hex: '#2f6f9c' },
  { char: 'L', name: 'lagoon', hex: '#4fa3c4' },
  { char: 'A', name: 'foam', hex: '#a7dde8' },
  { char: 'P', name: 'plum', hex: '#5e3a6e' },
  { char: 'v', name: 'violet', hex: '#8f62a8' },
  { char: 'V', name: 'lilac', hex: '#c49ad9' },
  { char: 'R', name: 'rose', hex: '#e6a3c0' },
  { char: 'e', name: 'ember', hex: '#b8412f' },
  { char: 'C', name: 'coral', hex: '#e0705a' },
  { char: 'p', name: 'peach', hex: '#f2a98a' },
  { char: 'h', name: 'gold', hex: '#e8b64a' },
  { char: 'H', name: 'lamp', hex: '#ffe08a' },
];

export const CHARS = Object.freeze(Object.fromEntries(PALETTE.map((p, i) => [p.char, i + 1])));
export const COLOR = Object.freeze(Object.fromEntries(PALETTE.map((p, i) => [p.name, i + 1])));

export function hexOf(index) {
  return index > 0 && index <= PALETTE.length ? PALETTE[index - 1].hex : null;
}
