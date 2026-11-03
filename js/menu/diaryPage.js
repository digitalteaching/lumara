// Tagebuch (Design 5.4, 13): die gefundenen Geschichtsstücke, nach Gebiet geordnet.
// Fehlende Stücke stehen als „Noch nicht gefunden“ da. Aufträge kommen mit Plan 4.

import { el } from '../ui/dom.js';
import { STORY } from '../data/story.js';
import { MAPS } from '../world/network.js';

const areaName = area => Object.values(MAPS).find(m => m.area === area)?.name ?? `Gebiet ${area}`;

export function diaryPage(game) {
  return {
    title: 'Tagebuch',
    render(body) {
      const found = game.state.story;
      const areas = Object.keys(STORY).map(Number).sort((a, b) => a - b);
      body.append(
        el('div', { class: 'sheet-section diary' },
          el('h3', {}, 'Geschichte'),
          areas.map(area =>
            el('div', { class: 'diary-area' },
              el('h4', {}, areaName(area)),
              STORY[area].map((text, i) =>
                i < (found[area] ?? 0)
                  ? el('p', { class: 'diary-piece' }, text)
                  : el('p', { class: 'diary-piece missing' }, 'Noch nicht gefunden')),
            )),
        ),
      );
    },
  };
}
