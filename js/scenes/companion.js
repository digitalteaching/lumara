// Der Begleiter in der Welt (Lumara 1.2): Das befreundete Wesen aus state.companion läuft als
// Kleinbild hinter der Spielfigur her (js/world/follower.js). Drückt man A und vor der Figur ist
// nichts, das reagiert, sagt es etwas zu seiner Gabe. Befreundete Wesen kämpfen nie.

import { createFollower } from '../world/follower.js';
import { miniImages } from '../gfx/miniImages.js';
import { giftOf } from '../friends/friends.js';
import { speciesName } from '../data/species.js';
import { say } from '../ui/dialog.js';
import { tl } from '../i18n/i18n.js';

const T = 16;
const HOP_MS = 130; // beim Laufen wechseln Stehen und Hüpfen so schnell wie die Schritte der Bewohner

// Der Begleiter aus dem Spielstand, wenn er ein Freund mit Gabe ist, sonst null.
export function companionOf(state) {
  const id = state?.companion ?? null;
  return id && state.friends?.[id] && giftOf(id) ? id : null;
}

export function addCompanion(world, game) {
  const { player } = world;
  const follower = createFollower(world.map, player, world.blocked);
  let shown = null; // das Wesen, das gerade mitläuft
  let side = follower.dir === 'left' ? 'left' : 'right'; // nach oben und unten behält er seine Seite
  let at = follower.pixel();
  let said = 0;

  // Den Begleiter neu lesen und der Figur folgen. Kommt einer dazu, steht er sofort hinter ihr.
  // world.onTick läuft vor dem Schritt der Figur; vor dem Zeichnen gleicht z() noch einmal ab, sonst
  // stünde er an jeder Feldgrenze ein Bild lang auf seinem alten Feld.
  function sync() {
    const id = companionOf(game.state);
    if (id !== shown) {
      shown = id;
      if (id) follower.place();
    }
    follower.update();
    if (follower.dir === 'left' || follower.dir === 'right') side = follower.dir;
  }
  world.onTick.push(sync);

  world.actors.push({
    z() {
      sync();
      at = follower.pixel();
      return at.y / T;
    },
    draw(ctx, cam) {
      if (!shown || follower.hidden()) return;
      const walking = player.moving && (follower.x !== follower.fromX || follower.y !== follower.fromY);
      const hop = walking && !game.reducedMotion ? Math.floor(world.time / HOP_MS) % 2 : 0;
      // Ein Kleinbild, das sich nicht bauen lässt, fehlt nur (js/gfx/miniImages.js warnt einmal).
      const img = miniImages(shown, game.state.friends[shown].shiny === true)?.[side][hop];
      if (!img) return;
      const x = at.x - cam.x, y = at.y - cam.y - 2;
      world.drawShadow(ctx, x, y);
      ctx.drawImage(img, x, y);
    },
  });

  // Als letzter Handler: Nur wenn vor der Figur nichts ist und kein anderer Handler reagiert hat.
  world.onInteract.push(async ev => {
    const id = companionOf(game.state);
    if (ev.target || !id) return false;
    const lines = tl(`companion.${giftOf(id)}`);
    await say(game, [lines[said++ % lines.length]], { speaker: speciesName(id, 1) });
    return true;
  });
}
