// Welche Frage kommt (Design 7.7): Fragenpool, Formwahl und gewichtetes Ziehen. DOM-frei.
// Fehler kommen wieder: zuletzt falsch beantwortete Fragen werden öfter gezogen.

import { CONFIG } from '../config.js';

export function questionWeight(entry) {
  const w = CONFIG.questionWeights;
  if (!entry || entry.n === 0) return w.neverAsked;
  if (entry.w) return w.wrongLast;
  if (entry.s >= 2) return w.mastered;
  return w.normal;
}

export function recordAnswer(history, key, correct) {
  const e = history[key] ?? { n: 0, s: 0, w: false };
  history[key] = { n: e.n + 1, s: correct ? e.s + 1 : 0, w: !correct };
}

// Für jede Frage zufällig eine erlaubte Form, aber nie dreimal dieselbe, wenn es Alternativen gibt.
export function pickForm(forms, recent, rng) {
  if (forms.length === 1) return forms[0];
  const [a, b] = recent.slice(-2);
  const options = a && a === b && forms.includes(a) ? forms.filter(f => f !== a) : forms;
  return rng.pick(options);
}

// Ohne Zurücklegen gewichtet ziehen; ist das Deck leer, beginnt es neu.
export function createDeck(questions, history, rng) {
  let remaining = [];
  let last = null;
  return {
    draw() {
      if (!remaining.length) remaining = [...questions];
      // Nach einem Neubeginn kommt die zuletzt gezogene Frage nicht direkt wieder.
      const candidates = remaining.length > 1 && last ? remaining.filter(x => x !== last) : remaining;
      const pick = rng.weighted(candidates, x => questionWeight(history[x.key]));
      remaining = remaining.filter(x => x !== pick);
      last = pick;
      return pick;
    },
  };
}

export function poolFor(pack, { kind, trainerNumber, beaten = [] }) {
  const all = pack.trainers;
  if (kind === 'trainer') return all.find(t => t.number === trainerNumber)?.questions ?? [];
  if (kind === 'boss') return all.flatMap(t => t.questions);
  if (kind === 'note' && pack.notes.length) return pack.notes;
  const done = new Set(beaten);
  const next = all.find(t => !done.has(t.number));
  return all.filter(t => done.has(t.number) || t === next).flatMap(t => t.questions);
}
