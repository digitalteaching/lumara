// Ein Zettel unter dem Stein (Design 5.4): genau eine Aufgabe im Antwort-Panel aus dem Duell,
// über der Welt, ohne Arena und ohne Fähigkeiten. „Später“ (oder B) lässt den Zettel liegen.

import { CONFIG } from '../config.js';
import { createDuel } from '../duel/duel.js';
import { createDeck } from '../duel/questions.js';
import { createDuelPanel, watchKeyboard } from '../ui/duelPanel.js';
import { packProgress } from '../state.js';
import { displayName } from '../data/species.js';

const FOUND = {
  berry: 'eine Beere',
  starfruit: 'eine Sternfrucht',
  farsight: 'einen Weitblickstein',
  shine: 'einen Glanzstein',
  life: 'einen Lebensstein',
  time: 'einen Zeitstein',
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
      if (out.item) lines.push(`Du findest außerdem ${FOUND[out.item]}.`);
      if (out.item === 'life') lines.push(`${displayName(c)} hat jetzt dauerhaft 1 Energie mehr.`);
      if (out.lost) lines.push(`Du findest außerdem ${FOUND[out.lost]}. Dein Rucksack ist voll.`);
      await panel.feedback({ ok: true, title: `Richtig! +${out.xp} XP`, lines, minMs: 600 });
    } else {
      await panel.feedback({
        ok: false,
        title: r.almost ? 'Fast! Achte auf die Schreibweise.' : 'Leider falsch.',
        lines: [`Richtig ist: ${r.correctText}`, 'Der Zettel bleibt hier liegen.'],
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
