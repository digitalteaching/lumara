import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SPECIES, STARTERS, AREA_WILD, TRAINER_CREATURES, displayName, speciesName, wildName } from '../js/data/species.js';
import { creatureRows } from '../js/gfx/art/creatures.js';
import { EN_SPECIES } from '../js/i18n/en-species.js';
import { setLanguage, t } from '../js/i18n/i18n.js';
import { speciesText } from '../js/data/species.js';

test('wilde Wesen mit dem richtigen Artikel', () => {
  assert.equal(wildName('eichhuscher', 1, 'a'), 'Ein wilder Eichhuscher');
  assert.equal(wildName('glimmqualle', 1, 'a'), 'Eine wilde Glimmqualle');
  assert.equal(wildName('haeuschel', 1, 'a'), 'Ein wildes Häuschel');
  assert.equal(wildName('gischtling', 1, 'the'), 'Der wilde Gischtling');
  assert.equal(wildName('glimmqualle', 1, 'the'), 'Die wilde Glimmqualle');
  for (const s of Object.values(SPECIES).filter(s => s.kind === 'wild')) assert.ok(['m', 'f', 'n'].includes(s.gender), s.id);
});

test('Gebiet 2 hat zwei häufige und eine seltene Art, die Trainer-Art ist weiterentwickelt', () => {
  assert.deepEqual(AREA_WILD[2], { common: ['moosling', 'eichhuscher'], rare: 'rindenwicht' });
  for (const id of ['moosling', 'eichhuscher', 'rindenwicht']) {
    assert.equal(SPECIES[id].area, 2);
    assert.ok(SPECIES[id].description.length > 20);
  }
  assert.equal(SPECIES.rindenwicht.rarity, 'rare');
  assert.equal(speciesName('eichhuscher', 2), 'Kronenhuscher');
  assert.equal(speciesName('moosling', 2), 'Moosmuffel');
  assert.deepEqual(TRAINER_CREATURES[2], { species: 'eichhuscher', stage: 2 });
});

test('fünf Startwesen mit je 4 Stufennamen und Besonderheit', () => {
  assert.deepEqual(SPECIES.funki.names, ['Funki', 'Funkelflug', 'Laternenfalter', 'Nordlichtfalter']);
  for (const id of STARTERS) {
    assert.equal(SPECIES[id].names.length, 4);
    assert.ok(SPECIES[id].special.name);
  }
});

test('Tabellen verweisen nur auf vorhandene Arten', () => {
  for (const t of Object.values(AREA_WILD)) for (const id of [...t.common, t.rare]) assert.ok(SPECIES[id], id);
  for (const t of Object.values(TRAINER_CREATURES)) assert.ok(SPECIES[t.species].names[t.stage - 1]);
});

test('Anzeigename: Spitzname oder Name der aktuellen Stufe', () => {
  assert.equal(displayName({ species: 'nixi', nickname: 'Blubb', level: 3 }), 'Blubb');
  assert.equal(displayName({ species: 'nixi', nickname: null, level: 20 }), 'Quellnix');
});

test('Gebiete 3 bis 8: je zwei häufige und eine seltene Art, Trainer mit Stufe 2', () => {
  for (const a of [3, 4, 5, 6, 7, 8]) {
    const ids = [...AREA_WILD[a].common, AREA_WILD[a].rare];
    assert.equal(AREA_WILD[a].common.length, 2);
    assert.equal(SPECIES[AREA_WILD[a].rare].rarity, 'rare');
    assert.ok(ids.every(id => SPECIES[id].area === a && SPECIES[id].kind === 'wild'), `${a}`);
    assert.ok(ids.every(id => SPECIES[id].description.length > 20), `${a} Beschreibung`);
    const t = TRAINER_CREATURES[a];
    assert.equal(t.stage, 2);
    assert.equal(SPECIES[t.species].area, a);
    for (const id of ids) assert.equal(creatureRows(id, 1).length, 32, id);
    assert.equal(creatureRows(t.species, 2).length, 40);
  }
  assert.deepEqual(AREA_WILD[3], { common: ['tupfling', 'irrfunke'], rare: 'nebelunke' });
  assert.deepEqual(AREA_WILD[4], { common: ['glaskaefer', 'duenenhuepfer'], rare: 'flimmerfuchs' });
  assert.deepEqual(AREA_WILD[5], { common: ['drachling', 'klippbock'], rare: 'wolkenwal' });
  assert.deepEqual(AREA_WILD[6], { common: ['zahnmaus', 'dampfkobold'], rare: 'messingeule' });
  assert.deepEqual(AREA_WILD[7], { common: ['frostrobbe', 'flockenhase'], rare: 'aurorafink' });
  assert.deepEqual(AREA_WILD[8], { common: ['schnuppling', 'nachtschaf'], rare: 'sternhirsch' });
  assert.deepEqual([3, 4, 5, 6, 7, 8].map(n => speciesName(TRAINER_CREATURES[n].species, 2)), ['Schirmling', 'Spiegelkäfer', 'Himmelsdrachling', 'Uhrwerkmaus', 'Gletscherrobbe', 'Kometling']);
  assert.deepEqual([6, 7, 8].map(n => TRAINER_CREATURES[n]), [{ species: 'zahnmaus', stage: 2 }, { species: 'frostrobbe', stage: 2 }, { species: 'schnuppling', stage: 2 }]);
  assert.equal(wildName('nachtschaf', 1, 'a'), 'Ein wildes Nachtschaf');
  assert.equal(wildName('messingeule', 1, 'the'), 'Die wilde Messingeule');
  assert.equal(wildName('sternhirsch', 1, 'a'), 'Ein wilder Sternhirsch');
  assert.equal(wildName('nebelunke', 1, 'a'), 'Eine wilde Nebelunke');
  assert.equal(wildName('tupfling', 1, 'the'), 'Der wilde Tupfling');
  assert.equal(wildName('glaskaefer', 1, 'a'), 'Ein wilder Glaskäfer');
});

test('Die neuen Bilder sind verschieden: jede Art hat ihre eigene Silhouette', () => {
  const ids = [6, 7, 8].flatMap(a => [...AREA_WILD[a].common, AREA_WILD[a].rare]);
  const shapes = ids.map(id => creatureRows(id, 1).map(r => r.replace(/[^.]/g, '#')).join('/'));
  assert.equal(new Set(shapes).size, ids.length);
  for (const n of [6, 7, 8]) assert.notDeepEqual(creatureRows(TRAINER_CREATURES[n].species, 2), creatureRows(TRAINER_CREATURES[n].species, 1));
});

test('Jede Art hat englische Namen für jede Stufe, eine Beschreibung und, bei Startwesen, ihre Besonderheit', () => {
  for (const [id, sp] of Object.entries(SPECIES)) {
    assert.equal(EN_SPECIES[id]?.names.length, sp.names.length, id);
    assert.ok(EN_SPECIES[id].description, id);
    if (sp.kind === 'starter') assert.ok(EN_SPECIES[id].special?.name && EN_SPECIES[id].special?.text, id);
  }
  assert.deepEqual(Object.keys(EN_SPECIES).filter(id => !SPECIES[id]), []);
});

test('Namen und Sätze mit Wesen auf Englisch', () => {
  setLanguage('en');
  try {
    assert.equal(speciesName('kiesel', 4), 'Mountainheart');
    assert.equal(speciesText('pieks').special.name, 'Green Thumb');
    assert.equal(wildName('eichhuscher', 1, 'a'), 'A wild Oakscamper');
    assert.equal(wildName('gischtling', 1, 'the'), 'The wild Sprayling');
    assert.equal(t('duel.wildAppears', { wild: wildName('gischtling', 1, 'a') }), 'A wild Sprayling appears!');
    assert.equal(displayName({ species: 'pieks', level: 1, nickname: 'Spiky' }), 'Spiky');
    assert.equal(displayName({ species: 'pieks', level: 20, nickname: null }), 'Thornhog');
  } finally {
    setLanguage('de');
  }
  assert.equal(speciesName('kiesel', 4), 'Bergherz');
  assert.equal(wildName('eichhuscher', 1, 'a'), 'Ein wilder Eichhuscher');
});
