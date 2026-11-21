// Kleinbilder 16 × 16 für befreundete Wesen (Begleiter, Garten): zwei Bilder, Stehen/Laufen und Hüpfen.
// Sie entstehen aus dem 32 × 32-Bild der ersten Stufe; MINI_OVERRIDE (von Hand gezeichnet) hat Vorrang.
// DOM-frei.

import { CREATURE_ART } from './creatures.js';
import { shinyRows } from './shiny.js';

const N = 16;
const EMPTY = '.'.repeat(N);

// Von Hand gezeichnete Grundbilder (Stehen). Das Hüpfbild leitet sich daraus ab.
export const MINI_OVERRIDE = {
  // Oben und unten belegt: eine Zeile weggelassen, damit das Hüpfbild nichts abschneidet.
  duenenhuepfer: [
    '................',
    '.......kppppyk..',
    '.......kpypRyk..',
    '.......kyRyyyk..',
    'kkk....kyryyrk..',
    'wwck...kyrYYyk..',
    'ccYk...kYYYyyyk.',
    'kYyk.kkkYyyyyyk.',
    '.kkykYYYYyyyrrk.',
    '...krYYyyyrrkk..',
    '...kYYyyywwck...',
    '...kyyyyyccck...',
    '...kyyyyrccYk...',
    '...kYyyrrrkk....',
    '...kyyyrkk......',
    '....kkkk........',
  ],
  wolkenwal: [
    '................',
    '..........k.....',
    '........kkAk....',
    '.......kSAk.....',
    '.k..kkkwwwkkk...',
    'kSkkSSwwwwwSSk..',
    'SffSwwwwwwwwwSk.',
    'SffSwwfwffwwfSk.',
    'SfwwwwwwffffffSk',
    'kwwwwwfffffffffk',
    'kfwwffffffffffmS',
    'SffffAAAAAAAASSk',
    'SfmSfAmmAAALLSk.',
    'kmkkkSmmmmmSkk..',
    '.k..kSSkkkkk....',
    '.....kk.........',
  ],
  flockenhase: [
    '................',
    '.......kSSkSk...',
    '......kSwfSffk..',
    '......kSfRSffk..',
    '.......kffSfSk..',
    '.......kSmAfSk..',
    '.....kkkSwfffSk.',
    '....kSSSSffffSk.',
    '..kkSwwwffffmSk.',
    '.kSSwwfffffmSk..',
    'kSwwwffffffSk...',
    'kSwfffffffmSk...',
    '.kSSffffmmmk....',
    '..kSffmmmmSSk...',
    '..kSfffmSSfSk...',
    '...kkSSkkkkk....',
  ],
  wurzelgeist: [
    '................',
    '.......kkkk.....',
    '......kwwwHk....',
    '.....kwHHHHHk...',
    '.....kkHHhhk....',
    '....kGGkgkk.....',
    '...kGggrgok.....',
    '...krrlrlook....',
    '..krrrooooook...',
    '..krooooookbk...',
    'kbbkoooobbbk....',
    '.kkkbobbbbbk....',
    '..kbbbkkkbbk....',
    '..kbbk..kbbbk...',
    '..kbbk...kbbk...',
    '...kk.....kk....',
  ],
  irrlichtfee: [
    '................',
    '...........k....',
    '....kk....kgk...',
    '..kkwwkk.kkgk...',
    '.kwwwAAAkwwHk...',
    '.kwAAAAAwwHHHk..',
    '.kAAAALLwHHkHk..',
    '..kkLLkkHHHhhk..',
    '..kwwwwwwHhhk...',
    '.kwwwAwwHHHk....',
    '.kAAAAHHHHHk....',
    '...khhHHhhhk....',
    '..khhhkkhkk.....',
    '.khhhk..k.......',
    '.khhk...........',
    '..kk............',
  ],
  echomaus: [
    '................',
    '............k...',
    '.......kkk.kRk..',
    '......kRRpkRppk.',
    '.....kRRpppppppk',
    '.....kRpppppppsk',
    '.....kpppssppsk.',
    '......kpssfpsk..',
    '......kkkfmmmk..',
    '....kkfffmmmmmk.',
    '..kfffmmmmmskk..',
    '.kksmmmmmssk....',
    'ksssmmmsssk.....',
    'kskkksssssk.....',
    '.k..kskkksk.....',
    '.....k...k......',
  ],
};

// Jeder 2 × 2-Block wird ein Pixel: deckend bei mindestens 2 Farbpixeln (nicht '.' und nicht 'k'),
// Farbe = häufigste, bei Gleichstand die erste in Leserichtung.
function downscale(src) {
  const g = [];
  for (let y = 0; y < N; y++) {
    const row = [];
    for (let x = 0; x < N; x++) {
      const cells = [src[2 * y][2 * x], src[2 * y][2 * x + 1], src[2 * y + 1][2 * x], src[2 * y + 1][2 * x + 1]]
        .filter(c => c !== '.' && c !== 'k');
      if (cells.length < 2) {
        row.push('.');
        continue;
      }
      let best = cells[0];
      for (const c of cells) if (cells.filter(d => d === c).length > cells.filter(d => d === best).length) best = c;
      row.push(best);
    }
    g.push(row);
  }
  return g;
}

// Umriss k um alles Deckende (4er-Nachbarschaft), wie in creatures.js.
function outline(g) {
  const filled = (x, y) => x >= 0 && y >= 0 && x < N && y < N && g[y][x] !== '.';
  const marks = [];
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (g[y][x] !== '.') continue;
      if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) marks.push([x, y]);
    }
  }
  for (const [x, y] of marks) g[y][x] = 'k';
}

const standCache = new Map();

function standOf(id) {
  if (standCache.has(id)) return standCache.get(id);
  let rows;
  if (MINI_OVERRIDE[id]) {
    rows = MINI_OVERRIDE[id];
  } else {
    const g = downscale(CREATURE_ART[id][1]);
    outline(g);
    rows = g.map(r => r.join(''));
    if (rows[0] !== EMPTY) {
      if (rows[N - 1] !== EMPTY) throw new Error(`Kleinbild ${id}: oben und unten belegt, braucht MINI_OVERRIDE`);
      rows = [EMPTY, ...rows.slice(0, N - 1)];
    }
  }
  standCache.set(id, rows);
  return rows;
}

export function miniRows(id) {
  return standOf(id);
}

// [Stehen/Laufen, Hüpfen]; das Hüpfbild ist dasselbe Bild einen Pixel höher.
export function miniFrames(id, { shiny = false } = {}) {
  const stand = standOf(id);
  const hop = [...stand.slice(1), EMPTY];
  return shiny ? [shinyRows(stand, id), shinyRows(hop, id)] : [stand, hop];
}
