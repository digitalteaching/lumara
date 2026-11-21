// Ein Zettel unter dem Stein (Design 5.4): genau eine Aufgabe im Antwort-Panel aus dem Duell,
// über der Welt, ohne Arena und ohne Fähigkeiten. „Später“ (oder B) lässt den Zettel liegen.

import { CONFIG } from '../config.js';
import { createDuel } from '../duel/duel.js';
import { createDeck } from '../duel/questions.js';
import { createDuelPanel, watchKeyboard } from '../ui/duelPanel.js';
import { packProgress } from '../state.js';
import { displayName } from '../data/species.js';
import { treasureName } from '../items/treasures.js';
import { t } from '../i18n/i18n.js';

const FOUND = {
  berry: 'item.aBerry',
  starfruit: 'item.aStarfruit',
  farsight: 'item.aFarsight',
  shine: 'item.aShine',
  life: 'item.aLife',
  time: 'item.aTime',
};

// settle(answer) wird nach der Antwort genau einmal gerufen (answer = { key, correct, trainer })
// und liefert { xp, item, lost, story, evolved }. Ergebnis: null bei „Später“, sonst
// { correct, xp, item, lost, story, evolved }.
export async function playNote(game, pool, settle) {
  const c = game.state.creature;
  const history = packProgress(game.state, game.pack.data.shortId).history;
  const question = createDeck(pool, history, game.rng).draw();
  // Stufe 1: keine zweite Chance und kein Schild, ein Zettel ist kein Kampf.
  const duel = createDuel({
    kind: 'note',
    player: { species: c.species, stage: 1, energy: 1, maxEnergy: 1 },
    foe: { maxEnergy: 1 },
    deck: { draw: () => question },
    rng: game.rng,
  });
  duel.ask();

  const prevMode = game.mode;
  game.mode = 'duel';
  const panel = createDuelPanel(game);
  const stopKeyboard = watchKeyboard();
  try {
    const action = await panel.ask(duel, {});
    if (action.type !== 'answer') return null;
    const r = duel.answer(action.response);
    const out = settle(duel.summary().answers[0]);
    if (r.correct) {
      const lines = [];
      if (out.item === 'treasure') lines.push(t('note.alsoFoundTreasure', { name: treasureName(out.treasure) }));
      else if (out.item) lines.push(t('note.alsoFound', { item: t(FOUND[out.item]) }));
      if (out.item === 'life') lines.push(t('note.lifeStone', { name: displayName(c) }));
      if (out.lost) lines.push(t('note.alsoFoundFull', { item: t(FOUND[out.lost]) }));
      await panel.feedback({ ok: true, title: t('note.right', { xp: out.xp }), lines, minMs: 600 });
    } else {
      await panel.feedback({
        ok: false,
        title: r.almost ? t('feedback.almost') : t('feedback.wrong'),
        lines: [t('duel.correctIs', { answer: r.correctText }), t('note.stays')],
        minMs: CONFIG.duel.wrongMinMs,
      });
    }
    return { correct: r.correct, ...out };
  } finally {
    stopKeyboard();
    panel.remove();
    game.mode = prevMode;
  }
}
