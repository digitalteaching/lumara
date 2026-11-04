// Das Finale (Design 5.4, 9): Nach dem Sieg über Morrow und seinem Namen löst sich der Nebel, die
// Bewohner sagen neue Sätze, und Morrow wohnt am Leuchtturm. Dieser Zustand gehört dem Kind und
// bleibt auch bei einem Paketwechsel (Design 10.4). DOM-frei.

export const finaleDone = state => state?.finale?.done === true;

// Nach dem Sieg über Morrow und vor der Szene: Wer jetzt die App schließt, hat das Finale trotzdem.
export function finishFinale(state) {
  if (finaleDone(state)) return false;
  state.finale = { done: true };
  return true;
}

// Objekte mit when: 'beforeFinale' gibt es nur vor dem Finale (Ilvy in der Höhle, Morrow unten),
// solche mit when: 'afterFinale' nur danach (Morrows Kristall, Morrow am Leuchtturm).
// Nach dem Finale ist auch Nebel außerhalb der Tore fort (Zier-Nebel neben einem Tor): Er wird zu dem
// nächsten Feld derselben Zeile, das kein Nebel ist (blockiert bleibt blockiert, etwa Bäume).
export function withFinale(def, state) {
  const done = finaleDone(state);
  let out = def;
  if (def.objects.some(o => o.when)) out = { ...out, objects: def.objects.filter(o => !o.when || (o.when === 'afterFinale') === done) };
  if (done) out = clearLooseFog(out);
  return out;
}

function clearLooseFog(def) {
  const isFog = c => def.legend[c] === 'fog';
  const inGate = (x, y) => (def.gates ?? []).some(g => x >= g.x && x < g.x + g.w && y >= g.y && y < g.y + g.h);
  let changed = false;
  const rows = def.rows.map((row, y) => [...row].map((c, x) => {
    if (!isFog(c) || inGate(x, y)) return c;
    for (let d = 1; d < row.length; d++) {
      for (const nx of [x - d, x + d]) {
        if (nx >= 0 && nx < row.length && !isFog(row[nx])) {
          changed = true;
          return row[nx];
        }
      }
    }
    return c;
  }).join(''));
  return changed ? { ...def, rows } : def;
}
