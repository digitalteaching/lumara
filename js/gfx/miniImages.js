// Kleinbilder der Freunde (Lumara 1.2): Stehen und Hüpfen, nach rechts (wie die Bilder) und nach links
// gespiegelt, einmal je Wesen und Farbe erzeugt. Der Begleiter (js/scenes/companion.js) und der Garten
// (js/scenes/gardenEvents.js) zeichnen damit.
//
// Lässt sich ein Kleinbild nicht bauen, gibt es null zurück und warnt einmal je Wesen in der Konsole.
// Dann fehlt nur dieses Bild, statt dass ein Fehler die Spielschleife anhält.

import { miniFrames } from './art/minis.js';
import { spriteFrom } from './canvasSprites.js';

const images = new Map();
const warned = new Set();

export function miniImages(id, shiny) {
  const key = `${id}:${shiny ? 1 : 0}`;
  if (images.has(key)) return images.get(key);
  let set = null;
  try {
    const suffix = shiny ? ':glanz' : '';
    const frames = miniFrames(id, { shiny });
    set = {
      right: frames.map((rows, f) => spriteFrom(`mini:${id}:${f}${suffix}`, rows)),
      left: frames.map((rows, f) => spriteFrom(`mini:${id}:${f}${suffix}`, rows, { flip: true })),
    };
  } catch (err) {
    if (!warned.has(id)) {
      warned.add(id);
      console.warn(`mini sprite for "${id}" could not be built, it is not drawn:`, err);
    }
  }
  images.set(key, set);
  return set;
}
