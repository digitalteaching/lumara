// Der Begleiter in der Welt (Lumara 1.2): Das befreundete Wesen aus state.companion läuft als
// Kleinbild hinter der Spielfigur her (js/world/follower.js). Drückt man A und vor der Figur ist
// nichts, das reagiert, sagt es etwas zu seiner Gabe, in der Nähe eines bereiten Verstecks seiner
// Gabe einen eigenen Satz (companionLine). Befreundete Wesen kämpfen nie.

import { createFollower } from '../world/follower.js';
import { nearHideouts } from '../world/hideouts.js';
import { miniImages } from '../gfx/miniImages.js';
import { giftOf } from '../friends/friends.js';
import { speciesName } from '../data/species.js';
import { say } from '../ui/dialog.js';
import { t, tl } from '../i18n/i18n.js';

const T = 16;
const HOP_MS = 130; // beim Laufen wechseln Stehen und Hüpfen so schnell wie die Schritte der Bewohner

// Der Begleiter aus dem Spielstand, wenn er ein Freund mit Gabe ist, sonst null.
export function companionOf(state) {
  const id = state?.companion ?? null;
  return id && state.friends?.[id] && giftOf(id) ? id : null;
}

// Was der Begleiter auf A sagt, wenn die Figur bei (x, y) auf der Karte mapId steht. Ist ein bereites
// Versteck seiner Gabe höchstens nearRadius Felder entfernt, sein Satz companion.near.<Gabe>; die
// Spürnase öffnet keins, sie riecht jedes. Sonst abwechselnd (index) die allgemeinen Sätze.
export function companionLine(state, mapId, x, y, index) {
  const id = companionOf(state);
  if (!id) return null;
  const gift = giftOf(id);
  const near = nearHideouts(state, mapId, x, y);
  if (gift === 'sniff' ? near.length : near.some(h => h.gift === gift)) return t(`companion.near.${gift}`);
  const lines = tl(`companion.${gift}`);
  return lines[index % lines.length];
}

export function addCompanion(world, game) {
  const { player } = world;
  const follower = createFollower(world.map, player, world.blocked);
  let shown = null; // das Wesen, das gerade mitläuft
  let side = follower.dir === 'left' ? 'left' : 'right'; // nach oben und unten behält er seine Seite
  let at = follower.pixel();
  let pose = null; // eine Szene stellt ihn kurz woanders hin, siehe world.companion
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

  // Für Szenen wie das Öffnen eines Verstecks (js/scenes/hideoutEvents.js):
  // - pixel(): wo er gerade gezeichnet wird, in Spielpixeln (null ohne Begleiter)
  // - cell(): sein Feld (null ohne Begleiter)
  // - visible(): ob man ihn sieht (nicht, wenn er ohne Szene auf dem Feld der stehenden Figur steht)
  // - setPose({ x, y, side, walking }): zeichnet ihn dort statt hinter der Figur, walking lässt ihn
  //   hüpfen (nicht bei „Bewegung reduzieren“); setPose(null) stellt ihn wieder hinter die Figur.
  world.companion = {
    pixel: () => (shown ? (pose ? { x: pose.x, y: pose.y } : follower.pixel()) : null),
    cell: () => (shown ? { x: follower.x, y: follower.y } : null),
    visible: () => !!shown && (!!pose || !follower.hidden()),
    setPose(p) {
      pose = p ?? null;
    },
  };

  world.actors.push({
    z() {
      sync();
      at = follower.pixel();
      return (pose ?? at).y / T;
    },
    draw(ctx, cam) {
      if (!shown || (!pose && follower.hidden())) return;
      const walking = pose ? !!pose.walking : player.moving && (follower.x !== follower.fromX || follower.y !== follower.fromY);
      const hop = walking && !game.reducedMotion ? Math.floor(world.time / HOP_MS) % 2 : 0;
      // Ein Kleinbild, das sich nicht bauen lässt, fehlt nur (js/gfx/miniImages.js warnt einmal).
      const img = miniImages(shown, game.state.friends[shown].shiny === true)?.[pose?.side ?? side][hop];
      if (!img) return;
      const p = pose ?? at;
      const x = p.x - cam.x, y = p.y - cam.y - 2;
      world.drawShadow(ctx, x, y);
      ctx.drawImage(img, x, y);
    },
  });

  // Als letzter Handler: Nur wenn vor der Figur nichts ist und kein anderer Handler reagiert hat.
  world.onInteract.push(async ev => {
    const id = companionOf(game.state);
    if (ev.target || !id) return false;
    const line = companionLine(game.state, world.mapId, player.x, player.y, said++);
    await say(game, [line], { speaker: speciesName(id, 1) });
    return true;
  });
}
