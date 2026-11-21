// Effekte (Design 15): kurze Rezepte aus Tönen, die gleiten, und Rauschen. at: Versatz in Sekunden.
// Falsche Antworten klingen sanft (Dreieck, abwärts), nie wie ein Buzzer.

export const SFX = {
  menu: [{ type: 'square', from: 880, at: 0, dur: 0.04, level: 0.14 }],
  confirm: [{ type: 'square', from: 660, at: 0, dur: 0.05, level: 0.14 }, { type: 'square', from: 990, at: 0.05, dur: 0.07, level: 0.14 }],
  correct: [{ type: 'square', from: 784, at: 0, dur: 0.08, level: 0.16 }, { type: 'square', from: 1047, at: 0.08, dur: 0.14, level: 0.16 }],
  wrong: [{ type: 'triangle', from: 330, to: 247, at: 0, dur: 0.24, level: 0.3 }],
  hit: [{ drum: 's', at: 0 }, { type: 'square', from: 220, to: 110, at: 0, dur: 0.1, level: 0.14 }],
  crit: [{ type: 'square', from: 440, to: 880, at: 0, dur: 0.12, level: 0.16 }, { drum: 's', at: 0.06 }, { type: 'square', from: 1319, at: 0.12, dur: 0.1, level: 0.12 }],
  tile: [{ type: 'triangle', from: 523, at: 0, dur: 0.05, level: 0.3 }],
  type: [{ drum: 'h', at: 0 }],
  lift: [{ type: 'triangle', from: 262, to: 392, at: 0, dur: 0.16, level: 0.3 }],
  transition: [{ type: 'triangle', from: 392, to: 196, at: 0, dur: 0.26, level: 0.22 }],
  fog: [{ drum: 'h', at: 0 }, { type: 'triangle', from: 523, to: 1047, at: 0.02, dur: 0.6, level: 0.18 }, { drum: 'h', at: 0.3 }],
  // Rucksack auf und zu (Lumara 1.1): Rascheln aus Rauschen, dazu ein heller Ton, beim Schließen tiefer.
  bagOpen: [{ drum: 'h', at: 0 }, { drum: 'h', at: 0.04 }, { drum: 'h', at: 0.09 }, { type: 'triangle', from: 784, to: 1175, at: 0.06, dur: 0.12, level: 0.2 }],
  bagClose: [{ drum: 'h', at: 0 }, { drum: 'h', at: 0.04 }, { drum: 'h', at: 0.09 }, { type: 'triangle', from: 392, to: 262, at: 0.06, dur: 0.12, level: 0.24 }],
  // Ein Feld im Vertrauensring leuchtet auf (Lumara 1.2): zwei weiche, steigende Dreiecktöne.
  trust: [{ type: 'triangle', from: 659, at: 0, dur: 0.12, level: 0.26 }, { type: 'triangle', from: 880, to: 988, at: 0.11, dur: 0.22, level: 0.26 }],
  // Ein Versteck geht auf (Lumara 1.2): kurzes Rascheln, ein weicher Ton gleitet hoch, ein heller Klang.
  hideout: [{ drum: 'h', at: 0 }, { drum: 'h', at: 0.05 }, { type: 'triangle', from: 440, to: 784, at: 0.04, dur: 0.16, level: 0.24 }, { type: 'triangle', from: 1175, at: 0.2, dur: 0.2, level: 0.18 }],
};

export function playSfx(synth, id, when) {
  for (const step of SFX[id] ?? []) {
    if (step.drum) synth.drum(step.drum, when + step.at, { channel: 'sfx', scale: 0.8 });
    else synth.sweep({ ...step, when: when + step.at });
  }
}
