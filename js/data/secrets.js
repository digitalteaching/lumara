// Geheime Orte (Design 5.7): abseits des Wegs, erreichbar mit einem Schlüsselgegenstand. Jeder hat
// eine seltene Art, ein Geschichtsstück und einen seltenen Stein. Die Sternwarte hat dazu ein Rätsel:
// gears ist die Stellung der drei Zahnräder auf der Sternkarte (0 oben, 1 rechts, 2 unten, 3 links).

export const SECRET_PLACES = {
  eiche: { area: 2, key: 'lantern', stone: 'life' },
  glasturm: { area: 4, key: 'hook', stone: 'farsight' },
  gezeiten: { area: 1, key: 'nutshell', stone: 'shine' },
  irrlicht: { area: 3, key: 'nutshell', stone: 'time' },
  eisgrotte: { area: 7, key: 'skates', stone: 'life' },
  sternwarte: { area: 6, key: 'starmap', stone: 'farsight', gears: [2, 1, 3] },
};
