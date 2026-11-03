// Karte der Insel (Design 5.2, 13): der Ring der acht Gebiete um den Berg, als Daten für die
// Menüseite. Im Nebel ist, was mit diesem Paket nicht offen ist, auch wenn der Stein leuchtet.
// Jeder Zustand steht als Text da, nicht nur als Farbe (Design 14). DOM-frei.

import { MAPS, areaOpen } from './network.js';

// Lage im Raster mit 3 Spalten und 5 Zeilen: unten die Bucht, links hinauf Wald, Moor und Dünen,
// oben die Klippen, rechts hinunter Ruinen, See und Wiese, in der Mitte der Berg.
const LAYOUT = { 1: [2, 5], 2: [1, 4], 3: [1, 3], 4: [1, 2], 5: [2, 1], 6: [3, 2], 7: [3, 3], 8: [3, 4] };
const CAVE = { col: 2, row: 3 };

export function islandMap(state, pack) {
  const defs = Object.values(MAPS);
  const hereArea = MAPS[state.position?.map]?.area ?? null;
  const areas = Object.entries(LAYOUT).map(([key, [col, row]]) => {
    const area = Number(key);
    return {
      area,
      name: defs.find(d => d.area === area)?.name ?? '',
      col,
      row,
      open: areaOpen(state, pack, area),
      lit: state.stones.includes(area),
      here: hereArea === area,
    };
  });
  const lit = new Set(state.stones.filter(n => n >= 1 && n <= 8)).size;
  return { areas, cave: { ...CAVE, lit } };
}

export function mapLabels({ open, lit, here }) {
  const out = [!open ? '☁ Im Nebel' : lit ? '✦ Leuchtstein leuchtet' : '○ Leuchtstein dunkel'];
  if (here) out.push('● Du bist hier');
  return out;
}

export const caveLabels = ({ lit }) => ['Berg mit Höhle', `${lit} von 8 Fassungen leuchten`];

// Feste Trennstellen für die zusammengesetzten Gebietsnamen (weicher Trennstrich), damit schmale
// Kästen und Knöpfe „Uhrwerk-ruinen“ trennen und nicht „Uhrwer-kruinen“.
const BREAKS = {
  Leuchtturmbucht: ['Leucht', 'turm', 'bucht'],
  Flüsterwald: ['Flüster', 'wald'],
  Pilzmoor: ['Pilz', 'moor'],
  Spiegeldünen: ['Spiegel', 'dünen'],
  Windklippen: ['Wind', 'klippen'],
  Uhrwerkruinen: ['Uhrwerk', 'ruinen'],
  Nordlichtsee: ['Nordlicht', 'see'],
  Sternenwiese: ['Sternen', 'wiese'],
};
export const breakName = name => BREAKS[name]?.join('\u00ad') ?? name;
