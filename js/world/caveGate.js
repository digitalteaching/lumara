// Das Höhlentor am Berg (Design 5.2): acht Fassungen, eine für jeden Leuchtstein. Die Höhle selbst
// öffnet sich erst im Finale; bis dahin sagt das Tor, wie viele Fassungen schon leuchten. DOM-frei.

import { CONFIG } from '../config.js';
import { CAVE_SOCKETS } from '../gfx/art/tiles.js';

export function caveGateLines(lit) {
  const head = 'Ein großes Tor im Berg mit acht Fassungen.';
  if (lit >= 8) return [head, 'Alle acht leuchten!', 'Hinter dem Tor ist es still. Der Weg hinein entsteht gerade.', 'In einer der nächsten Spielfassungen kannst du hindurch.'];
  const count = lit <= 0 ? 'Keine davon leuchtet.' : lit === 1 ? 'Eine davon leuchtet.' : `${lit} davon leuchten.`;
  return [head, count, 'Vielleicht öffnet es sich, wenn alle acht Leuchtsteine wieder leuchten.'];
}

// Welche Fassungen leuchten: für jeden entzündeten Stein n die Fassung n in der Farbe seines Rings
// am Leuchtturm, nach n sortiert. Lage im Torbild (Pixel).
export function caveSocketLights(stones) {
  return [...new Set(stones)]
    .filter(n => n >= 1 && n <= CAVE_SOCKETS.length)
    .sort((a, b) => a - b)
    .map(n => ({ x: CAVE_SOCKETS[n - 1][0], y: CAVE_SOCKETS[n - 1][1], color: CONFIG.beacons.ringColors[n - 1] }));
}
