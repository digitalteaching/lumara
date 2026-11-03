// Die Spielfigur läuft Feld für Feld mit weichem Übergang (Design 13).

import { CONFIG } from '../config.js';
import { step } from './map.js';

export function createPlayer({ x, y, dir }) {
  const ms = CONFIG.walk.msPerTile;
  const p = {
    x,
    y,
    dir,
    moving: false,
    progress: 0,
    frame: 0,
    fromX: x,
    fromY: y,
  };

  function tryStart(d, map, occupied) {
    p.dir = d;
    const n = step(p, d);
    if (!map.canEnter(n.x, n.y, occupied)) return false;
    p.fromX = p.x;
    p.fromY = p.y;
    p.x = n.x;
    p.y = n.y;
    p.moving = true;
    p.progress = 0;
    p.frame ^= 1;
    return true;
  }

  // Anstoßen (Design 5.3, Luftspiegelungen): einmal pro Drücken gegen dasselbe Feld. Ein Schritt,
  // ein anderes Zielfeld oder das Loslassen machen es wieder möglich.
  let bumpedAt = null;
  function bump(events, d) {
    const n = step(p, d);
    const k = `${n.x},${n.y}`;
    if (bumpedAt === k) return;
    bumpedAt = k;
    events.push({ type: 'bump', x: n.x, y: n.y });
  }

  p.update = (dtMs, intent, map, occupied) => {
    const events = [];
    if (!intent.dir) bumpedAt = null;
    if (!p.moving) {
      if (intent.dir) {
        if (tryStart(intent.dir, map, occupied)) {
          p.progress = dtMs / ms;
          bumpedAt = null;
        } else bump(events, intent.dir);
      } else if (intent.a) {
        const f = step(p, p.dir);
        events.push({ type: 'interact', x: f.x, y: f.y, target: map.objectAt(f.x, f.y) });
      }
      return events;
    }

    p.progress += dtMs / ms;
    if (p.progress >= 1) {
      const leftover = (p.progress - 1) * ms;
      p.moving = false;
      p.progress = 0;
      p.fromX = p.x;
      p.fromY = p.y;
      events.push({ type: 'stepped', x: p.x, y: p.y });
      bumpedAt = null;
      if (intent.dir) {
        if (tryStart(intent.dir, map, occupied)) p.progress = leftover / ms;
        else bump(events, intent.dir);
      }
    }
    return events;
  };

  // Position in Spielpixeln, zwischen zwei Feldern weich interpoliert.
  p.pixel = () => {
    const t = p.moving ? p.progress : 1;
    return {
      x: Math.round((p.fromX + (p.x - p.fromX) * t) * 16),
      y: Math.round((p.fromY + (p.y - p.fromY) * t) * 16),
    };
  };

  // Einen gerade begonnenen Schritt zurücknehmen (wenn nach dem letzten Schritt etwas passiert).
  p.cancelMove = () => {
    if (!p.moving) return;
    p.x = p.fromX;
    p.y = p.fromY;
    p.moving = false;
    p.progress = 0;
  };

  p.teleport = (nx, ny, nd) => {
    p.x = p.fromX = nx;
    p.y = p.fromY = ny;
    p.dir = nd ?? p.dir;
    p.moving = false;
    p.progress = 0;
  };

  return p;
}
