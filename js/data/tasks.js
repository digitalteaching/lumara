// Spielaufgaben (Lumara 1.2, Spec 6.6): je Gebiet eine kleine Aufgabe ohne Lernfrage, etwa 1 bis 3
// Minuten lang. Die Regeln stehen in js/world/tasks.js, die Anbindung an die Welt in
// js/scenes/taskEvents.js, die Texte in i18n unter task.<gebiet>.*.
//
// Die Teile einer Aufgabe sind Kartenobjekte { type: 'task', id: 'task<gebiet>-<rolle><index>', task,
// role, index?, prop, x, y } auf Feldern, auf denen man in 1.1 nicht stehen konnte (Baum, Fels,
// Zaun, Wasser, Düne …). prop ist ihr Bild ohne Szene (Anfangszustand). Fortschritt gilt nur für
// einen Besuch der Karte; gespeichert wird allein, welche Aufgaben gelöst sind (state.tasks).
//
// Arten:
// - collect: alle role 'item' (index 0 … items-1) ansprechen, dann role 'giver'.
// - order:   role 'switch' (index) oder Platten (plates, Felder zum Betreten) in der Reihenfolge
//            order; ein falscher setzt zurück. role 'clue' nennt die Reihenfolge.
// - turn:    jedes role 'switch' dreht A eine Stellung weiter (0 oben, 1 rechts, 2 unten, 3 links,
//            wie das Zahnrad der Sternwarte); gelöst, wenn alle wie goal stehen. start: Anfang.
// - follow:  ein Irrlicht wartet an stations[i]; kommt die Figur höchstens near Felder heran
//            (auch schräg), fliegt es zur nächsten. Ist sie weiter als lose weg, fliegt es zurück.

import { DUENEN } from '../world/maps/duenen.js';

// Wohin man von from aus schaut, um to zu sehen: die längere Achse zählt.
export function facing(from, to) {
  const dx = to.x - from.x, dy = to.y - from.y;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 1 : 3;
  return dy > 0 ? 2 : 0;
}

const parts = (def, area, role) => def.objects.filter(o => o.type === 'task' && o.task === area && o.role === role).sort((a, b) => a.index - b.index);
const beaconOf = (def, number) => def.objects.find(o => o.type === 'beacon' && o.number === number);

export const TASKS = {
  // Bucht: Drei Möwenküken stecken hinter einer Kiste, in einem Blütenbusch und unter einem alten
  // Boot am Strand. Die Möwenmutter sitzt auf ihrem Nest am Steg, gleich neben dem Start.
  1: { area: 1, map: 'bucht', type: 'collect', items: 3 },
  // Flüsterwald: vier Bäume mit Zeichen (0 Raute, 1 Dreieck, 2 Kreis, 3 Viereck), der Zeichenstein
  // am Eingang nennt die Reihenfolge. Im letzten Baum öffnet sich das Astloch.
  2: { area: 2, map: 'wald', type: 'order', order: [2, 1, 3, 0] },
  // Pilzmoor: Das Irrlicht wartet über einem Leuchtpilz westlich vom Eingang, abseits vom Weg zum Steg
  // (wer nur durchs Moor geht, startet nichts). Es führt über den Torf nach Westen bis zum
  // Wurzelstock, ohne hohes Schilf.
  3: {
    area: 3, map: 'moor', type: 'follow', near: 1, lose: 8,
    stations: [{ x: 14, y: 25 }, { x: 16, y: 21 }, { x: 12, y: 17 }, { x: 8, y: 17 }, { x: 3, y: 17 }],
  },
  // Spiegeldünen: drei Glasstatuen um den Leuchtstein. Am Anfang schauen alle an ihm vorbei.
  4: {
    area: 4, map: 'duenen', type: 'turn', start: [3, 0, 0],
    goal: parts(DUENEN, 4, 'switch').map(s => facing(s, beaconOf(DUENEN, 4))),
  },
};
