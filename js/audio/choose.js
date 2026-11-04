// Welche Musik wo läuft (Design 15): jedes Gebiet sein Stück, die Höhle eigens, geheime Orte wie ihr
// Gebiet (eine Karte kann mit music ein eigenes wählen). Duelle nach ihrer Art. DOM-frei.

export function musicFor(def) {
  if (def.cave) return 'cave';
  if (def.music) return def.music;
  return `area${def.area}`;
}

const DUEL = { boss: 'boss', ascent: 'ascent', trainer: 'trainer' };
export const duelMusic = setup => DUEL[setup.kind] ?? 'wild';
