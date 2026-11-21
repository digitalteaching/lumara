// Wünsche in der Welt (Lumara 1.3, Spec 7.2). Regeln: js/world/wishes.js; neue Wünsche bringt der
// Aushang (js/scenes/boardEvents.js), im Rucksack nennt die Karte eines Schatzes, wer ihn sich wünscht.
// - Sprechblase: Über dem Wunsch-Bewohner dieser Karte steht, solange sein Wunsch offen ist, eine
//   kleine weiße Blase mit dem Schatzbild. Sie wippt langsam (unter 1 Hz), bei „Bewegung reduzieren“
//   nie. Solange die Welt gesperrt ist (etwa im Gespräch), ist sie weg. Berührt sie das Feld der Figur
//   oder des Begleiters (über ihm), rückt sie zur Seite. Nach Feldern, nicht nach Pixeln: So springt
//   sie nicht mitten in einem Schritt.
// - A vor ihm: Er dreht sich zur Figur.
//   - Offener Wunsch und der Schatz im Rucksack: sein eigener Satz, der Wunsch, dann [Ja] [Nein].
//     Ja: erst tauschen und speichern, dann erzählen (Abgabe, Dank, was es gibt, Level-Zeilen).
//     Nein: Er wartet, nichts ändert sich.
//   - Ohne den Schatz: erst seine normalen Sätze (wie ohne Wunsch, etwa Pims Tipp zum Fliehen mit B),
//     dann sein eigener Satz, der Wunsch und wo man ihn findet.
//   - Erfüllt: seine normalen Sätze, dann: Morgen kommt ein neuer Wunsch.
//   - Ohne Wunsch (sein Gebiet ist noch zu): Er redet wie immer (der allgemeine Bewohner-Handler).
// - Ein Auftrag, dessen Schritt gerade bei ihm ist (Talia, Greta), geht vor: Dann antwortet der Auftrag,
//   und so lange zeigt er keine Blase.
// Alles nach A läuft unter der Sperre der Welt; solange sie gilt, kommt kein zweites A an. busy schützt
// zusätzlich vor einem doppelten Start (Doppeltipp).

import { WISH_GIVERS, wishOf, canGive, giveWish, wishHint } from '../world/wishes.js';
import { questFor } from '../world/quests.js';
import { npcLines } from '../world/network.js';
import { treasureName } from '../items/treasures.js';
import { itemCanvas } from '../gfx/art/items.js';
import { COLOR, hexOf } from '../gfx/palette.js';
import { nameAtStage } from '../data/species.js';
import { stageForLevel } from '../duel/progress.js';
import { jingle } from '../audio/bus.js';
import { say, choose } from '../ui/dialog.js';
import { t } from '../i18n/i18n.js';
import { SCREEN_W, SCREEN_H } from './world.js';

const T = 16;
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const BOX = 18; // weißer Kasten mit dunklem Rand, darin das Schatzbild (16 × 16) in voller Größe
const TAIL = 2; // der Zipfel unter dem Kasten
const GAP = 2; // so viel Luft zwischen Zipfel und Kopf
const BOB_MS = 600; // so lange oben, dann so lange unten: unter 1 Hz
const INK = hexOf(COLOR.ink);
const WHITE = hexOf(COLOR.white);

// Eine Figur belegt x … x+15 und y-2 … y+13 ihres Felds (ihr Bild beginnt 2 Pixel darüber).
const touches = (b, f) => b.x < f.x + T && b.x + BOX > f.x && b.y < f.y + T - 2 && b.y + BOX + TAIL > f.y - 2;

// Wo die Blase steht (oben links des Kastens, Spielpixel) und wo ihr Zipfel sitzt. n: Bewohner,
// figures: die Figur und, wenn es ihn gibt, der Begleiter, alle als Pixel der linken oberen Ecke ihres
// Felds. Mittig über seinem Kopf; berührt sie dort eine Figur, gleich hoch daneben, zuerst auf der
// Seite weg von der Figur, der Zipfel zu ihm hin. Ist nirgends Platz, bleibt sie über ihm.
export function bubbleSpot(n, figures) {
  const y = n.y - 2 - GAP - TAIL - BOX;
  const above = { x: n.x - 1, y, tail: 'mid' };
  const right = { x: n.x + T, y, tail: 'left' };
  const left = { x: n.x - BOX, y, tail: 'right' };
  const sides = figures[0] && figures[0].x < n.x ? [right, left] : [left, right];
  return [above, ...sides].find(b => !figures.some(f => touches(b, f))) ?? above;
}

function drawBubble(ctx, img, x, y, tail) {
  // Kasten mit abgeschnittenen Ecken
  ctx.fillStyle = INK;
  ctx.fillRect(x + 1, y, BOX - 2, BOX);
  ctx.fillRect(x, y + 1, BOX, BOX - 2);
  ctx.fillStyle = WHITE;
  ctx.fillRect(x + 1, y + 1, BOX - 2, BOX - 2);
  // Zipfel nach unten, 4 Pixel breit, innen weiß und offen zum Kasten
  const tx = tail === 'mid' ? x + 7 : tail === 'left' ? x + 1 : x + BOX - 5;
  ctx.fillStyle = INK;
  ctx.fillRect(tx, y + BOX, 4, 1);
  ctx.fillRect(tx + 1, y + BOX + 1, 2, 1);
  ctx.fillStyle = WHITE;
  ctx.fillRect(tx + 1, y + BOX - 1, 2, 2);
  ctx.drawImage(img, x + 1, y + 1);
}

const onScreen = (x, y) => x > -BOX && y > -BOX - TAIL && x < SCREEN_W && y < SCREEN_H;

// levelUps(levelBefore): Level-Zeilen und Entwicklung nach XP außerhalb eines Duells (aus
// createGameWorld). say und choose ersetzen in Tests den Dialog.
export function addWishes(world, game, { levelUps = async () => {}, say: speak = say, choose: ask = choose } = {}) {
  const giver = Object.values(WISH_GIVERS).find(g => g.map === world.mapId);
  const npc = giver && world.map.def.objects.find(o => o.type === 'npc' && o.id === giver.npc);
  if (!npc) return; // keine Karte eines Wunsch-Bewohners (Garten, Höhle, geheime Orte)
  const { player } = world;
  let busy = false;

  // Ein Auftrag mit einem Schritt bei ihm geht vor (dann antwortet dessen Handler).
  const questFirst = () => {
    const q = questFor(game.state, world.mapId, npc.id);
    return !!q && q.role !== 'done';
  };
  const openWish = () => {
    const w = wishOf(game.state, npc.id);
    return w && w.done === false && !questFirst() ? w : null;
  };
  // Felder der Figur und des Begleiters (der kommt in createGameWorld erst nach den Wünschen dazu).
  const figures = () => [player, world.companion?.cell()].filter(Boolean).map(c => ({ x: c.x * T, y: c.y * T }));
  // Was er ohne Wunsch sagen würde (js/scenes/world.js).
  const usualLines = () => npcLines(npc, game.state, world.map.def.area, game.pack?.data) ?? [];

  // ---------- Sprechblase ----------

  world.afterRender.push((ctx, cam) => {
    const w = openWish();
    if (!w || world.locked) return;
    const bob = game.reducedMotion ? 0 : Math.floor(world.time / BOB_MS) % 2;
    const spot = bubbleSpot({ x: npc.x * T, y: npc.y * T }, figures());
    const x = spot.x - cam.x, y = spot.y - cam.y - bob;
    if (onScreen(x, y)) drawBubble(ctx, itemCanvas(w.treasure), x, y, spot.tail);
  });

  // ---------- Ansprechen ----------

  // Was es außer dem Dank zu sagen gibt: welcher Stein, wie viele XP.
  function gotLine(out) {
    if (out.reward === 'stone') return t('wish.got', { item: t(`item.${out.item}.name`) });
    if (out.reward === 'xp') return t('duel.xp', { name: nameAtStage(game.state.creature, stageForLevel(out.levelBefore)), xp: out.xp, extra: '' });
    return null;
  }

  async function trade(treasure) {
    const out = giveWish(game.state, npc.id, game.rng);
    if (!out) return speak(game, [t('wish.waiting', { treasure })], { speaker: npc.name });
    game.save();
    await speak(game, [t('wish.give', { treasure })]);
    jingle('find');
    await speak(game, [t(`wish.thanks.${out.reward}`)], { speaker: npc.name });
    const got = gotLine(out);
    if (got) await speak(game, [got]);
    if (game.state.creature.level > out.levelBefore) await levelUps(out.levelBefore);
  }

  async function talk(w) {
    if (w.done) return speak(game, [...usualLines(), t('wish.nextDay')], { speaker: npc.name });
    const treasure = treasureName(w.treasure);
    const intro = [t(`wish.${npc.id}.own`), t('wish.want', { treasure })];
    if (!canGive(game.state, npc.id)) return speak(game, [...usualLines(), ...intro, wishHint(w.treasure)], { speaker: npc.name });
    await speak(game, intro, { speaker: npc.name });
    const pick = await ask(game, t('wish.ask', { treasure }), [t('common.yes'), t('common.no')], { cancelIndex: 1 });
    if (pick === 0) return trade(treasure);
    return speak(game, [t('wish.waiting', { treasure })], { speaker: npc.name });
  }

  // Vor dem allgemeinen Bewohner-Handler (js/scenes/world.js) und vor dem der Aufträge.
  world.onInteract.unshift(async ev => {
    const o = ev.target;
    if (o?.type !== 'npc' || o.id !== npc.id) return false;
    const w = wishOf(game.state, npc.id);
    if (!w || questFirst()) return false;
    if (busy) return true;
    busy = true;
    world.turnToward(o, OPPOSITE[player.dir]);
    try {
      await talk(w);
    } finally {
      world.resetFacing(o);
      busy = false;
    }
    return true;
  });
}
