// Aufträge (Design 5.6, 5.7): je Gebiet einer. Annehmen geht jederzeit, abschließen erst, wenn der
// Leuchtstein des Gebiets leuchtet. Alles, was Auftrag k braucht, liegt in den Gebieten 1 bis k.
// Ein Auftrag ist eine Folge von Schritten: etwas aufheben (pickup) oder mit jemandem sprechen
// (talk). Der letzte Schritt ist immer das Gespräch mit dem Auftraggeber.

export const QUESTS = [
  {
    id: 'q1', area: 1, giver: { map: 'bucht', npc: 'bram' },
    steps: [{ kind: 'pickup', id: 'muschel', map: 'bucht', x: 6, y: 20 }, { kind: 'talk', map: 'bucht', npc: 'bram' }],
    reward: { key: 'foodbag' },
  },
  {
    id: 'q2', area: 2, giver: { map: 'wald', npc: 'fenna' },
    steps: [{ kind: 'talk', map: 'bucht', npc: 'oda' }, { kind: 'talk', map: 'wald', npc: 'fenna' }],
    reward: { item: 'life', n: 1 },
  },
  {
    id: 'q3', area: 3, giver: { map: 'moor', npc: 'jasper' },
    steps: [{ kind: 'talk', map: 'wald', npc: 'flo' }, { kind: 'talk', map: 'moor', npc: 'jasper' }],
    reward: { key: 'lantern' },
  },
  {
    id: 'q4', area: 4, giver: { map: 'duenen', npc: 'samir' },
    steps: [{ kind: 'pickup', id: 'glaskugel', map: 'duenen', x: 5, y: 24 }, { kind: 'talk', map: 'duenen', npc: 'samir' }],
    reward: { item: 'shine', n: 3 },
  },
  {
    id: 'q5', area: 5, giver: { map: 'klippen', npc: 'tamo' },
    steps: [{ kind: 'talk', map: 'duenen', npc: 'talia' }, { kind: 'talk', map: 'klippen', npc: 'tamo' }],
    reward: { key: 'hook' },
  },
];

// Bewohner, die nur während eines Schritts irgendwo stehen (etwa der gesuchte Lehrling).
export const GUESTS = [
  { id: 'flo', name: 'Flo', map: 'wald', x: 24, y: 13, dir: 'left', sprite: 'flo', quest: 'q3', step: 0 },
];

export const questById = id => QUESTS.find(q => q.id === id) ?? null;
