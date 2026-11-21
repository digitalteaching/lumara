// Der Begleiter (Lumara 1.2) läuft ein Feld hinter der Spielfigur her, Feld für Feld und im selben
// Tempo wie sie, auch beim Gleiten auf Rutscheis. Er belegt kein Feld: Läuft die Figur auf ihn zu,
// tauschen die beiden die Plätze. DOM-frei.

import { step } from './map.js';

const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };

const distance = (ax, ay, bx, by) => Math.abs(ax - bx) + Math.abs(ay - by);

// Richtung eines Schritts zwischen zwei Nachbarfeldern.
function dirOf(dx, dy, fallback) {
  if (dx > 0) return 'right';
  if (dx < 0) return 'left';
  if (dy > 0) return 'down';
  if (dy < 0) return 'up';
  return fallback;
}

// occupied: zusätzlich belegte Felder (wie bei player.update), auf die er sich nicht stellt.
export function createFollower(map, player, occupied) {
  const f = { x: 0, y: 0, fromX: 0, fromY: 0, dir: player.dir };

  const onCell = (x, y) => f.x === x && f.y === y;

  // Aufs Feld hinter der Figur (Gegenrichtung zu ihrem Blick), sonst auf ihr eigenes Feld.
  f.place = () => {
    const back = step(player, OPPOSITE[player.dir]);
    const free = map.canEnter(back.x, back.y, occupied);
    f.x = f.fromX = free ? back.x : player.x;
    f.y = f.fromY = free ? back.y : player.y;
    f.dir = player.dir;
  };

  // Wo die Figur beim letzten update() stand. Ändert sich das, während sie steht, wurde sie versetzt
  // (Teleport, etwa beim Aufwachen nach einer Niederlage), auch wenn sie nur ein Feld weiter landet.
  let seenX = player.x, seenY = player.y;

  // Mehrmals pro Bild aufrufbar: Ohne neuen Schritt der Figur ändert sich nichts.
  f.update = () => {
    const moved = player.x !== seenX || player.y !== seenY;
    seenX = player.x;
    seenY = player.y;
    if (player.moving) {
      // Die Figur verlässt ein Feld, auf dem er nicht steht: Er geht dorthin.
      if (onCell(player.fromX, player.fromY)) return;
      // War er weit weg (etwa nach einem Teleport mitten im Schritt), springt er, statt zu gleiten.
      const far = distance(f.x, f.y, player.fromX, player.fromY) > 1;
      f.dir = far ? player.dir : dirOf(player.fromX - f.x, player.fromY - f.y, f.dir);
      f.fromX = far ? player.fromX : f.x;
      f.fromY = far ? player.fromY : f.y;
      f.x = player.fromX;
      f.y = player.fromY;
      return;
    }
    // Die Figur steht, aber an einem anderen Feld als zuletzt, oder er ist mehr als ein Feld weg: Sie
    // wurde versetzt, er stellt sich wieder hinter sie.
    if (moved || distance(f.x, f.y, player.x, player.y) > 1) f.place();
  };

  // Position in Spielpixeln: im selben Fortschritt zwischen seinen zwei Feldern wie die Figur.
  f.pixel = () => {
    const t = player.moving ? Math.min(1, Math.max(0, player.progress)) : 1;
    return {
      x: Math.round((f.fromX + (f.x - f.fromX) * t) * 16),
      y: Math.round((f.fromY + (f.y - f.fromY) * t) * 16),
    };
  };

  // Auf dem Feld der stehenden Figur sieht man ihn nicht.
  f.hidden = () => !player.moving && onCell(player.x, player.y);

  f.place();
  return f;
}
