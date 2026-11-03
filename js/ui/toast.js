// Kurzer Hinweis oben in der Mitte, der von selbst wieder verschwindet. Liegt über allem, auch über dem Menü.

import { el } from './dom.js';

export function showToast(text, ms = 6000) {
  const node = el('div', { class: 'toast', role: 'status' }, text);
  document.body.append(node);
  setTimeout(() => node.remove(), ms);
  return node;
}
