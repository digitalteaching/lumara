// Verstecke in der Welt (Lumara 1.2, Spec 6.5). Regeln und Orte: js/world/hideouts.js und
// js/data/hideouts.js.
// - Anzeige: Jedes bereite Versteck zeigt sein schwaches Zeichen (HIDEOUT_ART) auf seinem Feld.
//   Sternenspur-Verstecke sieht man nur mit einem Sternenspur-Begleiter in der Nähe, dann leuchten sie.
// - „!“ über dem Begleiter, wenn ein bereites Versteck seiner Gabe nahe der Figur ist (nicht, solange
//   die Welt gesperrt ist). Die Spürnase zeigt über jedem bereiten Versteck in ihrer Reichweite das
//   Zeichen der Gabe, die es braucht.
// - A vor einem Versteck: leer, ein Hinweis oder mit dem passenden Begleiter eine kurze Szene. Danach
//   eine Frage aus dem Pool der Zettel (Fund-Versteck) oder ein wildes Duell (Wesen-Versteck).
// Alles nach A läuft unter der Sperre der Welt (world.update ruft die Handler in world.lock auf);
// solange sie gilt, kommt kein zweites A an. busy schützt zusätzlich vor einem doppelten Start.

import { CONFIG } from '../config.js';
import { MAPS } from '../world/network.js';
import { notePool } from '../world/notes.js';
import { companionAlert, companionGift, hideoutAction, hideoutAt, hideoutShown, hideoutsOn, openCreature, openFind, sniffedHideouts } from '../world/hideouts.js';
import { packProgress, recordNoteAnswer } from '../state.js';
import { playNote } from './note.js';
import { makeWildSetup } from './duel.js';
import { giftCanvas, hideoutCanvas } from '../gfx/art/gifts.js';
import { giftName } from '../friends/friends.js';
import { speciesName } from '../data/species.js';
import { treasureName } from '../items/treasures.js';
import { sound, jingle } from '../audio/bus.js';
import { say } from '../ui/dialog.js';
import { t } from '../i18n/i18n.js';

const T = 16;

// Ablauf der Szene als Anteil von sceneMs: bis go läuft der Begleiter hin, bis back bleibt er am
// Versteck, dann läuft er zurück. Der Effekt der Gabe beginnt kurz vor der Ankunft (effect).
export const SCENE = { go: 0.35, back: 0.8, effect: 0.25 };

// Wo der Begleiter beim Anteil p der Szene steht (Spielpixel), ob er dabei läuft und wohin er schaut.
// side fehlt, wenn er gerade nach oben oder unten läuft: Dann behält er seine Seite.
export function scenePose(from, to, p) {
  const back = p > SCENE.back;
  const f = back ? 1 - (p - SCENE.back) / (1 - SCENE.back) : Math.min(1, p / SCENE.go);
  const dx = back ? from.x - to.x : to.x - from.x;
  const pose = {
    x: Math.round(from.x + (to.x - from.x) * f),
    y: Math.round(from.y + (to.y - from.y) * f),
    walking: p < SCENE.go || back,
  };
  if (dx) pose.side = dx < 0 ? 'left' : 'right';
  return pose;
}

const A_ITEM = { berry: 'item.aBerry', starfruit: 'item.aStarfruit', farsight: 'item.aFarsight', shine: 'item.aShine' };

// Die Zeile nach einer richtigen Antwort in einem Fund-Versteck (out von openFind).
export function foundLine(out) {
  if (out.treasure) return t('hideout.foundTreasure', { name: treasureName(out.treasure) });
  if (out.lost) return t('hideout.foundFull', { item: t(A_ITEM[out.lost]) });
  if (out.item === 'treat') return t('hideout.foundTreat');
  return t('hideout.found', { item: t(A_ITEM[out.item]) });
}

// ---------- Kleine Effekte der Gaben ----------
// (ctx, cx, cy, ms): Mitte des Versteckfelds auf dem Bildschirm und Zeit seit Beginn der Szene.
// Bei „Bewegung reduzieren“ steht ms still, dann zeigt jeder Effekt ein ruhiges Bild.

// Teilchen i von n: Fortschritt 0 … 1 einer Schleife von period ms, gegeneinander versetzt.
const phase = (ms, i, n, period) => (ms / period + i / n) % 1;

function bubble(ctx, x, y, big) {
  if (big) {
    ctx.fillRect(x - 1, y - 1, 3, 1);
    ctx.fillRect(x - 1, y + 1, 3, 1);
    ctx.fillRect(x - 1, y, 1, 1);
    ctx.fillRect(x + 1, y, 1, 1);
  } else {
    ctx.fillRect(x, y, 2, 2);
  }
}

const EFFECTS = {
  // Strandgut: Sand fliegt im Bogen hoch und fällt wieder.
  beachcomb(ctx, cx, cy, ms) {
    for (let i = 0; i < 6; i++) {
      const f = phase(ms, i, 6, 600);
      const dir = i % 2 ? 1 : -1;
      ctx.fillStyle = i % 3 ? '#e2c48f' : '#f1ddb0';
      // Bogen: oben bei f = 0,5, 10 Pixel über dem Start
      ctx.fillRect(cx + Math.round(dir * (2 + (i >> 1) * 2) * f * 2), cy + 4 - Math.round(40 * f * (1 - f)), 1, 1);
    }
  },
  // Klettern: Blätter fallen und schaukeln.
  climb(ctx, cx, cy, ms) {
    for (let i = 0; i < 4; i++) {
      const f = phase(ms, i, 4, 900);
      const x = cx - 5 + i * 3 + Math.round(Math.sin(f * 6 + i) * 2), y = cy - 8 + Math.round(f * 14);
      ctx.globalAlpha = 1 - f * 0.5;
      ctx.fillStyle = i % 2 ? '#3d7a55' : '#9cc76a';
      ctx.fillRect(x, y, 2, 1);
      ctx.fillRect(x + 1, y + 1, 1, 1);
    }
  },
  // Leuchten: ein weicher Schein, in der Mitte hell.
  glow(ctx, cx, cy, ms) {
    const r = 10 + Math.sin(ms / 150) * 1.5;
    const g = ctx.createRadialGradient(cx, cy, 1, cx, cy, r);
    g.addColorStop(0, 'rgba(181, 227, 196, 0.8)');
    g.addColorStop(1, 'rgba(181, 227, 196, 0)');
    ctx.fillStyle = g;
    ctx.fillRect(cx - 12, cy - 12, 24, 24);
    ctx.fillStyle = '#fffaf0';
    ctx.fillRect(cx - 1, cy - 1, 2, 2);
  },
  // Klarblick: Die Luft flimmert in drei Wellenlinien.
  clearsight(ctx, cx, cy, ms) {
    ctx.fillStyle = '#fffaf0';
    ctx.globalAlpha = 0.75;
    for (let row = 0; row < 3; row++) {
      for (let dx = -7; dx <= 7; dx++) ctx.fillRect(cx + dx, cy - 4 + row * 4 + Math.round(Math.sin((dx + ms / 60 + row * 2) / 2.5)), 1, 1);
    }
  },
  // Aufwind: Windstriche steigen auf.
  updraft(ctx, cx, cy, ms) {
    ctx.fillStyle = '#fffaf0';
    for (let i = 0; i < 4; i++) {
      const f = phase(ms, i, 4, 500);
      ctx.globalAlpha = 1 - f;
      ctx.fillRect(cx - 6 + i * 4, cy + 6 - Math.round(f * 16), 1, 4);
    }
  },
  // Tüfteln: Funken springen aus der Mitte.
  tinker(ctx, cx, cy, ms) {
    for (let i = 0; i < 5; i++) {
      const f = phase(ms, i, 5, 450);
      const a = i * 1.26 + 0.4, d = 2 + f * 7;
      const x = cx + Math.round(Math.cos(a) * d), y = cy + Math.round(Math.sin(a) * d);
      ctx.fillStyle = f < 0.5 ? '#ffe08a' : '#e0705a';
      ctx.fillRect(x, y, 1, 1);
      if (f < 0.3) {
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 1, 1, 3);
      }
    }
  },
  // Tauchen: Blasen steigen auf.
  dive(ctx, cx, cy, ms) {
    ctx.fillStyle = '#a7dde8';
    for (let i = 0; i < 5; i++) {
      const f = phase(ms, i, 5, 800);
      bubble(ctx, cx - 5 + Math.round(i * 2.5 + Math.sin(f * 5 + i)), cy + 5 - Math.round(f * 14), i % 2 === 1);
    }
  },
  // Sternenspur: Sternpunkte kreisen und funkeln.
  startrail(ctx, cx, cy, ms) {
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3 + ms / 400;
      const x = cx + Math.round(Math.cos(a) * 7), y = cy + Math.round(Math.sin(a) * 4);
      ctx.fillStyle = i % 2 ? '#c49ad9' : '#ffe08a';
      ctx.fillRect(x, y, 1, 1);
      if ((ms / 120 + i) % 3 < 1) {
        ctx.fillRect(x - 1, y, 3, 1);
        ctx.fillRect(x, y - 1, 1, 3);
      }
    }
  },
};

// Kleines „!“ über dem Begleiter: weiß auf dunkel, wie eine kleine Sprechblase (x, y: oben links).
function drawAlert(ctx, x, y) {
  ctx.fillStyle = '#1b1a2e';
  ctx.fillRect(x + 1, y, 4, 9);
  ctx.fillRect(x, y + 1, 6, 7);
  ctx.fillRect(x + 2, y + 9, 2, 1);
  ctx.fillStyle = '#fffaf0';
  ctx.fillRect(x + 2, y + 1, 2, 4);
  ctx.fillRect(x + 2, y + 6, 2, 2);
}

const onScreen = (x, y) => x > -T && y > -T && x < 240 + T && y < 160 + T;

// wildDuel(setup): ein wildes Duell mit diesem Aufbau und zurück in die Welt (aus createGameWorld).
// levelUps(levelBefore): Level-Zeilen und Entwicklung nach XP außerhalb eines Duells.
export function addHideouts(world, game, { wildDuel, levelUps }) {
  const list = hideoutsOn(world.mapId);
  if (!list.length) return; // Garten, Höhle, geheime Orte: keine Verstecke
  const { player } = world;
  let scene = null; // { h, ms } solange die Szene läuft
  let busy = false;

  // Das Feld des Begleiters (Sternenspur, Spürnase); ohne Begleiter das der Figur.
  const companionCell = () => world.companion?.cell() ?? { x: player.x, y: player.y };

  world.groundRender.push((ctx, cam) => {
    const at = companionCell();
    for (const h of list) {
      const x = h.x * T - cam.x, y = h.y * T - cam.y;
      if (!onScreen(x, y) || !hideoutShown(game.state, h, at)) continue;
      if (h.gift === 'startrail') {
        // Leuchten unter 1 Hz, bei „Bewegung reduzieren“ ruhig.
        const glow = game.reducedMotion ? 0.85 : 0.7 + 0.2 * Math.sin(world.time / 400);
        const g = ctx.createRadialGradient(x + 8, y + 7, 1, x + 8, y + 7, 11);
        g.addColorStop(0, `rgba(196, 154, 217, ${0.45 * glow})`);
        g.addColorStop(1, 'rgba(196, 154, 217, 0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - 4, y - 4, 24, 24);
        ctx.globalAlpha = glow;
      } else {
        ctx.globalAlpha = 0.5;
      }
      ctx.drawImage(hideoutCanvas(h.gift), x, y);
      ctx.globalAlpha = 1;
    }
  });

  world.afterRender.push((ctx, cam) => {
    const at = companionCell();
    for (const h of sniffedHideouts(game.state, world.mapId, at.x, at.y)) {
      const x = h.x * T - cam.x + 4, y = h.y * T - cam.y - 5;
      if (onScreen(x, y)) ctx.drawImage(giftCanvas(h.gift), x, y);
    }
    if (scene) {
      const p = scene.ms / scene.total;
      if (game.reducedMotion || p >= SCENE.effect) {
        EFFECTS[scene.h.gift]?.(ctx, scene.h.x * T - cam.x + 8, scene.h.y * T - cam.y + 8, game.reducedMotion ? 0 : scene.ms);
        ctx.globalAlpha = 1;
      }
    }
    if (world.locked || !companionAlert(game.state, world.mapId, player.x, player.y)) return;
    const p = world.companion?.pixel();
    if (p) drawAlert(ctx, p.x - cam.x + 5, p.y - cam.y - 12);
  });

  // Die Szene: sceneMs lang läuft der Begleiter zum Versteck und zurück, dazu der Effekt der Gabe.
  // Bei „Bewegung reduzieren“ kürzer und ohne Laufen. Danach steht er wieder hinter der Figur.
  function playScene(h) {
    const reduced = game.reducedMotion;
    const total = reduced ? CONFIG.hideouts.sceneMsReduced : CONFIG.hideouts.sceneMs;
    const companion = world.companion;
    const from = companion?.pixel();
    // Bis kurz vor die Mitte des Versteckfelds, ein Stück zur Figur hin.
    const to = { x: h.x * T + Math.sign(player.x - h.x) * 4, y: h.y * T + Math.sign(player.y - h.y) * 4 };
    const s = { h, ms: 0, total };
    scene = s;
    return new Promise(resolve => {
      const tick = dt => {
        s.ms = Math.min(total, s.ms + dt);
        if (!reduced && from) companion.setPose(scenePose(from, to, s.ms / total));
        if (s.ms < total) return;
        world.onTick.splice(world.onTick.indexOf(tick), 1);
        resolve();
      };
      world.onTick.push(tick);
    }).finally(() => {
      scene = null;
      companion?.setPose(null);
    });
  }

  async function hint(h) {
    await say(game, [t(`hideout.hint.${h.gift}`)]);
    // Die Spürnase sagt dazu, welche Gabe hier hilft.
    if (companionGift(game.state) === 'sniff') {
      await say(game, [t('hideout.sniff', { gift: giftName(h.gift) })], { speaker: speciesName(game.state.companion, 1) });
    }
  }

  // Wesen-Versteck: sofort leer und gespeichert, dann das versteckte Wesen des Gebiets auf dem oberen
  // Level des Gebiets. Befreunden kommt danach wie bei jedem wilden Duell.
  async function openCreatureHideout(h) {
    const species = openCreature(game.state, h);
    if (!species) return say(game, [t('hideout.empty')]);
    game.save();
    const area = MAPS[h.map].area;
    const setup = makeWildSetup(game, area, { common: [species], rare: species });
    setup.foe.level = CONFIG.wild.levelByArea[area - 1][1];
    await wildDuel(setup);
  }

  // Fund-Versteck: eine Frage wie unter einem Zettel; sie zählt wie ein Zettel, nie als Sieg. Das
  // Panel sagt nur „Richtig! +XP“ (oder dass das Versteck zu bleibt), den Fund sagt danach die Welt.
  async function openFindHideout(h) {
    const state = game.state;
    const shortId = game.pack.data.shortId;
    const levelBefore = state.creature.level;
    let out = null;
    const pool = notePool(game.pack.data, packProgress(state, shortId).beaten);
    const result = await playNote(game, pool, answer => {
      recordNoteAnswer(state, shortId, answer);
      out = openFind(state, h, MAPS[h.map].area, answer.correct, game.rng);
      game.save();
      return { xp: out.xp, item: null, lost: null, story: null, evolved: out.evolved };
    }, { stays: 'hideout.stays' });
    if (!result?.correct || !out?.xp) return; // „Später“, falsch oder schon leer
    jingle('find');
    await say(game, [foundLine(out)]);
    await levelUps?.(levelBefore);
  }

  async function useHideout(h) {
    const action = hideoutAction(game.state, h);
    if (action === 'empty') return say(game, [t('hideout.empty')]);
    if (action === 'hint') return hint(h);
    await playScene(h);
    sound('hideout');
    if (h.kind === 'creature') return openCreatureHideout(h);
    return openFindHideout(h);
  }

  // Verstecke sind keine Kartenobjekte: Vor einem Versteck ist ev.target leer. Als erster Handler,
  // damit weder das Glitzern noch der Begleiter („A ins Leere“) zuerst antworten.
  world.onInteract.unshift(async ev => {
    if (ev.target) return false;
    const h = hideoutAt(world.mapId, ev.x, ev.y);
    if (!h) return false;
    if (busy) return true;
    busy = true;
    try {
      await useHideout(h);
    } finally {
      busy = false;
    }
    return true;
  });
}
