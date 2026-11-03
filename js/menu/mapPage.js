// Menüseite „Karte“ (Design 5.2, 13): der Ring der Insel mit den acht Gebieten und dem Berg.
// Gebiete im Nebel sind grau und tragen „Im Nebel“; wo das Kind ist, steht „Du bist hier“.

import { el } from '../ui/dom.js';
import { islandMap, mapLabels, caveLabels, breakName } from '../world/islandMap.js';

export function mapPage(game) {
  return {
    title: 'Karte',
    render(body) {
      const m = islandMap(game.state, game.pack.data);
      const cell = (col, row, cls, [name, ...lines]) =>
        el('div', { class: `map-cell ${cls}`, role: 'listitem', style: { gridColumn: String(col), gridRow: String(row) } },
          el('p', { class: 'map-name' }, name),
          lines.map(l => el('p', { class: 'map-state' }, l)));
      body.append(
        el('div', { class: 'island-map', role: 'list', 'aria-label': 'Karte der Insel' },
          m.areas.map(a => cell(a.col, a.row, `map-area${a.open ? '' : ' fog'}${a.here ? ' here' : ''}`, [breakName(a.name), ...mapLabels(a)])),
          cell(m.cave.col, m.cave.row, 'map-cave', caveLabels(m.cave))),
      );
    },
  };
}
