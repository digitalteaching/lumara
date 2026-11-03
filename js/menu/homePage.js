// Hinweis zum Home-Bildschirm (Design 11.1, 13), dazu die Schritte, die auch der
// Installieren-Bildschirm zeigt.

import { el } from '../ui/dom.js';
import { readPlatform } from '../app/platform.js';

const SVG = 'http://www.w3.org/2000/svg';

// Teilen-Symbol, selbst gezeichnet: Kasten mit Pfeil nach oben.
export function shareIcon() {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('class', 'share-icon');
  svg.setAttribute('aria-hidden', 'true');
  for (const d of ['M8 9H6v12h12V9h-2', 'M12 3v12', 'M8 7l4-4 4 4']) {
    const p = document.createElementNS(SVG, 'path');
    p.setAttribute('d', d);
    p.setAttribute('fill', 'none');
    p.setAttribute('stroke', 'currentColor');
    p.setAttribute('stroke-width', '2');
    p.setAttribute('stroke-linecap', 'round');
    p.setAttribute('stroke-linejoin', 'round');
    svg.append(p);
  }
  return svg;
}

export function installSteps() {
  return el(
    'ol',
    { class: 'install-steps' },
    el('li', {}, 'Tippe auf Teilen ', shareIcon(), '.'),
    el('li', {}, 'Wähle „Zum Home-Bildschirm“.'),
    el('li', {}, 'Öffne Lumara dort über das neue Symbol.'),
  );
}

export function homeScreenPage() {
  return {
    title: 'Zum Home-Bildschirm',
    render(body) {
      const p = readPlatform();
      if (p.standalone) {
        body.append(el('p', { class: 'sheet-text' }, 'Lumara läuft schon vom Home-Bildschirm.'));
        return;
      }
      if (p.appleMobile) {
        body.append(
          el('p', { class: 'sheet-text' }, 'Leg Lumara auf deinen Home-Bildschirm. Dann bleibt dein Spielstand sicher gespeichert.'),
          installSteps(),
          el('p', { class: 'small' }, 'Wichtig: Die App auf dem Home-Bildschirm hat einen eigenen Speicher. Sichere vorher deinen Spielstand und lade ihn dort mit „Spielstand laden“.'),
        );
        return;
      }
      body.append(el('p', { class: 'sheet-text' }, 'Im Menü des Browsers findest du „App installieren“ oder „Zum Startbildschirm hinzufügen“.'));
    },
  };
}
