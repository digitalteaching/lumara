// Befreunden nach einem gewonnenen Duell gegen ein wildes Wesen (Lumara 1.2, Spec 6.1).
// Das Wesen bleibt erschöpft sitzen. Mit „Befreunden“ beginnt der Vertrauensring: bis zu fünf Fragen
// aus dem Pool des Duells, ohne Uhr und ohne Energieverlust, drei richtige füllen ihn. Ein Leckerli
// füllt vorab ein Feld und ist verbraucht, sobald es gegeben ist. B oder „Weiterziehen“ beendet den
// Ring jederzeit. Die Antworten zählen wie Antworten auf Zettel, als Siege zählen sie nicht.
//
// view kommt von der Duellszene:
//   alive()             ist die Szene noch da (nach jedem await prüfen)
//   setRing(trust|null) Ring und Namensschild zeigen den Stand, null blendet beides aus
//   heart()             das Herz steigt auf
//   onLeave(fn|null)    fn läuft, wenn die Szene verlassen wird (räumt das Antwort-Panel weg)
//   deck                das Deck des Duells: Der Ring zieht weiter daraus, damit eine Frage, deren
//                       Antwort eben erst zu sehen war, nicht gleich wiederkommt (fehlt es, ein neues)
// Ergebnis: 'friend' | 'shy' | 'left'.
// deps ersetzt in Tests Dialoge und Panel: { say, choose, createDuelPanel }.

import { CONFIG } from '../config.js';
import { createDuel } from '../duel/duel.js';
import { createDeck } from '../duel/questions.js';
import { createDuelPanel } from '../ui/duelPanel.js';
import { say, choose } from '../ui/dialog.js';
import { sound, jingle } from '../audio/bus.js';
import { packProgress, recordNoteAnswer } from '../state.js';
import { takeItem } from '../items/bag.js';
import { speciesName, speciesText } from '../data/species.js';
import { makeFriend, setCompanion } from '../friends/friends.js';
import { createTrust, trustAnswer } from '../friends/trust.js';
import { t } from '../i18n/i18n.js';

const RESULT = { won: 'friend', lost: 'shy', open: 'left' };
const UI = { say, choose, createDuelPanel };

export async function playBefriend(game, setup, offer, view, deps = {}) {
  const ui = { ...UI, ...deps };
  const { say, choose } = ui;
  const name = speciesName(offer.species, 1);
  await say(game, [t('befriend.sits', { name })]);
  if (!view.alive()) return 'left';
  // B wählt „Weiterziehen“: Dann endet es still, die XP für den Sieg bleiben.
  const pick = await choose(game, t('befriend.ask'), [t('befriend.yes'), t('befriend.moveOn')]);
  if (!view.alive() || pick !== 0) return 'left';

  let treat = false;
  if (game.state.bag.treat > 0) {
    const yes = (await choose(game, t('befriend.treatAsk', { name }), [t('common.yes'), t('common.no')])) === 0;
    if (!view.alive()) return 'left';
    treat = yes && takeItem(game.state, 'treat');
    if (treat) game.save?.();
  }

  const trust = createTrust({ treat });
  view.setRing(trust);
  try {
    if (treat) await say(game, [t('befriend.treatTaken', { name })]);
    if (!view.alive()) return 'left';
    const { questions, needed } = CONFIG.friends;
    await say(game, [t('befriend.start', { need: needed - trust.filled, questions, name })]);
    if (!view.alive()) return 'left';
    await askRing(game, setup, trust, name, view, ui);

    if (trust.state === 'won') {
      // Erst der Freund, dann alles Sichtbare: Ein voller Ring zählt, auch wenn die Szene gerade endet.
      makeFriend(game.state, offer.species, offer.shiny);
      game.save?.();
      if (!view.alive()) return 'friend';
      jingle('friendship');
      view.heart();
      const done = offer.upgrade ? t('befriend.shinyNow', { name }) : t(`befriend.done.${speciesText(offer.species).gender}`, { name });
      await say(game, [done]);
      if (!view.alive() || game.state.companion) return 'friend';
      const yes = (await choose(game, t('befriend.companionAsk', { name }), [t('common.yes'), t('common.no')])) === 0;
      if (!view.alive()) return 'friend';
      if (yes && setCompanion(game.state, offer.species)) {
        game.save?.();
        await say(game, [t('befriend.companionYes', { name })]);
      }
      return 'friend';
    }
    if (!view.alive()) return RESULT[trust.state];
    await say(game, [t(trust.state === 'lost' ? 'befriend.shy' : 'befriend.left', { name })]);
    return RESULT[trust.state];
  } finally {
    view.setRing(null);
  }
}

// Die Fragen des Rings, bis er gewonnen oder verloren ist oder das Kind weiterzieht. Ein einziges
// Duell für alle Fragen, damit die Antwortformen wechseln. Die hohen Energien sorgen dafür, dass es
// nie von selbst endet; Stufe 1: keine zweite Chance und kein Schild. Nach jeder Antwort wird
// gespeichert, damit das Schließen der App mitten im Ring nichts verliert.
async function askRing(game, setup, trust, name, view, ui) {
  const c = game.state.creature;
  const shortId = game.pack.data.shortId;
  const duel = createDuel({
    kind: 'befriend',
    player: { species: c.species, stage: 1, energy: 99, maxEnergy: 99 },
    foe: { maxEnergy: 99 },
    deck: view.deck ?? createDeck(setup.pool, packProgress(game.state, shortId).history, game.rng),
    rng: game.rng,
  });
  const ctx = { farsight: null };
  // Weitblick wie im Duell: steht da, wenn zu Beginn einer im Rucksack war.
  if (game.state.bag.farsight > 0) {
    ctx.farsight = {
      label: () => t('duel.farsightBtn', { n: game.state.bag.farsight }),
      enabled: () => duel.canFarsight() && game.state.bag.farsight > 0,
      use: () => (ctx.farsight.enabled() && takeItem(game.state, 'farsight') ? duel.useFarsight() : null),
    };
  }
  const panel = ui.createDuelPanel(game);
  view.onLeave?.(() => {
    panel.interrupt({ type: 'moveon' });
    panel.remove();
  });
  try {
    while (trust.state === 'open') {
      if (duel.state === 'ready') duel.ask();
      const action = await panel.ask(duel, ctx);
      if (!view.alive() || action.type !== 'answer') return;
      const r = duel.answer(action.response);
      if (!r) continue;
      recordNoteAnswer(game.state, shortId, duel.summary().answers.at(-1));
      trustAnswer(trust, r.correct);
      game.save?.();
      if (r.correct) {
        sound('trust');
        view.setRing(trust);
        await panel.feedback({ ok: true, title: t('befriend.right', { name }), autoMs: 1100 });
      } else {
        sound('wrong');
        await panel.feedback({
          ok: false,
          title: r.almost ? t('feedback.almost') : t('feedback.wrong'),
          lines: [t('duel.correctIs', { answer: r.correctText })],
          minMs: CONFIG.duel.wrongMinMs,
        });
      }
      if (!view.alive()) return;
      duel.next();
    }
  } finally {
    view.onLeave?.(null);
    panel.remove();
  }
}
