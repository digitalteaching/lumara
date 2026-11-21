// Vertrauensring (Lumara 1.2): fünf Fragen, drei richtige füllen ihn. Ein Leckerli füllt vorab ein
// Feld. DOM-frei.

import { CONFIG } from '../config.js';

export function createTrust({ treat = false } = {}) {
  return { filled: treat ? 1 : 0, asked: 0, state: 'open' };
}

export function trustAnswer(trust, correct) {
  if (trust.state !== 'open') return trust.state;
  const { questions, needed } = CONFIG.friends;
  trust.asked += 1;
  if (correct) trust.filled += 1;
  if (trust.filled >= needed) trust.state = 'won';
  else if (questions - trust.asked < needed - trust.filled) trust.state = 'lost';
  return trust.state;
}
