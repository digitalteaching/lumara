// Ereignisse (Lumara 1.3): Was das Kind getan hat, als kurze Liste im Spielstand. Aushang und
// Wünsche lesen sie später. Reines Blattmodul: nur die Zahlen aus config, sonst nichts importieren.

import { CONFIG } from '../config.js';

export const EVENT_TYPES = ['answer', 'wildWin', 'note', 'treasure', 'befriend', 'hideout', 'visit', 'wish'];
export const BOARD_KINDS = ['befriend', 'hideouts', 'streak', 'wildWins', 'notes', 'treasure', 'visit', 'wish'];
export const WISH_GIVER_IDS = ['pim', 'lio', 'nele', 'talia', 'ina', 'greta', 'ari', 'kai'];

// Hängt { type, ...data } an state.events; die ältesten fallen weg, wenn es mehr als maxEvents werden.
export function emit(state, type, data = {}) {
  const list = Array.isArray(state.events) ? state.events : [];
  list.push({ type, ...data });
  const max = CONFIG.board.maxEvents;
  state.events = list.length > max ? list.slice(list.length - max) : list;
}
