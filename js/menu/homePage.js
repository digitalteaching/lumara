// Hinweis zum Home-Bildschirm (Design 11.1, 13), dazu die Schritte, die auch der
// Installieren-Bildschirm zeigt.

import { el } from '../ui/dom.js';
import { readPlatform } from '../app/platform.js';
import { t } from '../i18n/i18n.js';

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
    el('li', {}, t('home.step1'), shareIcon(), '.'),
    el('li', {}, t('home.step2')),
    el('li', {}, t('home.step3')),
  );
}

export function homeScreenPage() {
  return {
    title: t('settings.homeScreen'),
    render(body) {
      const p = readPlatform();
      if (p.standalone) {
        body.append(el('p', { class: 'sheet-text' }, t('home.already')));
        return;
      }
      if (p.appleMobile) {
        body.append(
          el('p', { class: 'sheet-text' }, t('install.text')),
          installSteps(),
          el('p', { class: 'small' }, t('home.ownStorage')),
        );
        return;
      }
      body.append(el('p', { class: 'sheet-text' }, t('home.otherBrowser')));
    },
  };
}
