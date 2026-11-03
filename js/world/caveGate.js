// Das Höhlentor am Berg (Design 5.2): acht Fassungen, eine für jeden Leuchtstein. Die Höhle selbst
// öffnet sich erst im Finale; bis dahin sagt das Tor, wie viele Fassungen schon leuchten. DOM-frei.

import { CONFIG } from '../config.js';
import { CAVE_SOCKETS } from '../gfx/art/tiles.js';
import { t, tl } from '../i18n/i18n.js';

export function caveGateLines(lit) {
  const head = t('cave.head');
  if (lit >= 8) return [head, ...tl('cave.allLit')];
  const count = lit <= 0 ? t('cave.none') : lit === 1 ? t('cave.one') : t('cave.some', { n: lit });
  return [head, count, t('cave.hint')];
}

// Welche Fassungen leuchten: für jeden entzündeten Stein n die Fassung n in der Farbe seines Rings
// am Leuchtturm, nach n sortiert. Lage im Torbild (Pixel).
export function caveSocketLights(stones) {
  return [...new Set(stones)]
    .filter(n => n >= 1 && n <= CAVE_SOCKETS.length)
    .sort((a, b) => a - b)
    .map(n => ({ x: CAVE_SOCKETS[n - 1][0], y: CAVE_SOCKETS[n - 1][1], color: CONFIG.beacons.ringColors[n - 1] }));
}
