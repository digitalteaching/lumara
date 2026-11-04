// Das Finale (Design 5.4, 9): Nach dem Sieg über Morrow und seinem Namen löst sich der Nebel, die
// Bewohner sagen neue Sätze, und Morrow wohnt am Leuchtturm. Dieser Zustand gehört dem Kind und
// bleibt auch bei einem Paketwechsel (Design 10.4). DOM-frei.

export const finaleDone = state => state?.finale?.done === true;

// Objekte mit when: 'beforeFinale' gibt es nur vor dem Finale (Ilvy in der Höhle, Morrow unten),
// solche mit when: 'afterFinale' nur danach (Morrows Kristall, Morrow am Leuchtturm).
export function withFinale(def, state) {
  if (!def.objects.some(o => o.when)) return def;
  const done = finaleDone(state);
  return { ...def, objects: def.objects.filter(o => !o.when || (o.when === 'afterFinale') === done) };
}
