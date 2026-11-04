// Leuchtstein-Szene (Design 5.1): Der Stein flammt auf, der Nebel des Tors zieht sich zurück,
// der Weg öffnet sich. Etwa 2,6 Sekunden. Bei „Bewegung reduzieren“ wird nur übergeblendet.

import { CONFIG } from '../config.js';
import { beaconOf, openGatesFor } from '../world/network.js';
import { sound, jingle } from '../audio/bus.js';

const T = 16;

export function playBeaconScene(game, world, number) {
  jingle('beacon');
  return new Promise(resolve => {
    const map = world.map;
    const def = map.def;
    const b = beaconOf(def, number);
    const ms = CONFIG.beacons.sceneMs;
    const reduced = game.reducedMotion;

    // Tore, die jetzt offen sein dürfen: Boden sofort setzen, Nebel als Überblendung darüber.
    const open = openGatesFor(def, game.state, game.pack.data);
    const cells = [];
    for (const g of def.gates ?? []) {
      if (!open.includes(g.id)) continue;
      for (let y = g.y; y < g.y + g.h; y++) for (let x = g.x; x < g.x + g.w; x++) {
        if (map.tileAt(x, y) !== 'fog') continue;
        map.setTile(x, y, g.ground);
        cells.push([x, y]);
      }
    }
    world.refreshFog();

    let t = 0;
    let fogSounded = false;
    const tick = dt => {
      t += dt;
      // Der Nebel-Ton kommt, wenn der Nebel wirklich zu weichen beginnt (bei 35 % der Szene).
      if (!fogSounded && t >= ms * 0.35) {
        fogSounded = true;
        sound('fog');
      }
      if (t < ms) return;
      world.onTick.splice(world.onTick.indexOf(tick), 1);
      world.afterRender.splice(world.afterRender.indexOf(draw), 1);
      resolve();
    };
    const draw = (ctx, cam) => {
      const f = Math.min(1, t / ms);
      // Nebel weicht ab der Hälfte der Szene
      const fogA = Math.max(0, 1 - Math.max(0, f - 0.35) / 0.5);
      if (fogA > 0) {
        ctx.fillStyle = `rgba(212, 214, 230, ${fogA * 0.95})`;
        for (const [x, y] of cells) ctx.fillRect(x * T - cam.x, y * T - cam.y, T, T);
      }
      // Lichtkreis am Kristall: wächst und wird wieder kleiner (bei reduzierter Bewegung nur heller)
      const cx = b.x * T + 8 - cam.x;
      const cy = (b.y + 1) * T - 32 + 13 - cam.y;
      const pulse = Math.sin(Math.PI * Math.min(1, f * 1.15));
      const r = reduced ? 36 : 10 + 70 * pulse;
      const a = reduced ? 0.55 * pulse : 0.7 * pulse;
      const grad = ctx.createRadialGradient(cx, cy, 1, cx, cy, r);
      grad.addColorStop(0, `rgba(255, 250, 240, ${a})`);
      grad.addColorStop(0.4, `rgba(255, 224, 138, ${a * 0.7})`);
      grad.addColorStop(1, 'rgba(255, 224, 138, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    };
    world.onTick.push(tick);
    world.afterRender.push(draw);
  });
}
