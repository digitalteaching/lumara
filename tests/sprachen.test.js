// Jede Fremdsprache des Spiels (Design 10.6) hat alles, was das Deutsche hat: Oberfläche, Wesen,
// Welt, Geschichte und Aufträge, in derselben Form und mit denselben Platzhaltern. Dazu die Regeln,
// die erst Französisch und Spanisch brauchen: grammatisches Geschlecht, Einzahl und Mehrzahl auf den
// Nebelschildern und die Elision im Französischen.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { setLanguage, t } from '../js/i18n/i18n.js';
import { DE } from '../js/i18n/de.js';
import { EN } from '../js/i18n/en.js';
import { FR } from '../js/i18n/fr.js';
import { ES } from '../js/i18n/es.js';
import { EN_SPECIES } from '../js/i18n/en-species.js';
import { FR_SPECIES } from '../js/i18n/fr-species.js';
import { ES_SPECIES } from '../js/i18n/es-species.js';
import { EN_WORLD } from '../js/i18n/en-world.js';
import { FR_WORLD } from '../js/i18n/fr-world.js';
import { ES_WORLD } from '../js/i18n/es-world.js';
import { EN_STORY, EN_SECRET_STORY } from '../js/i18n/en-story.js';
import { FR_STORY, FR_SECRET_STORY } from '../js/i18n/fr-story.js';
import { ES_STORY, ES_SECRET_STORY } from '../js/i18n/es-story.js';
import { EN_QUEST_TEXT } from '../js/i18n/en-quests.js';
import { FR_QUEST_TEXT } from '../js/i18n/fr-quests.js';
import { ES_QUEST_TEXT } from '../js/i18n/es-quests.js';
import { SPECIES, speciesText, wildName } from '../js/data/species.js';
import { STORY, SECRET_STORY, storyPieces, secretStory } from '../js/data/story.js';
import { QUEST_TEXT, questText } from '../js/data/quests.js';
import { MAPS, mapOfArea, areaName, areaOf, destinationName, worldLines } from '../js/world/network.js';
import { fogEdgeLines } from '../js/world/fogEdge.js';
import { MOOR } from '../js/world/maps/moor.js';
import { DUENEN } from '../js/world/maps/duenen.js';
import { BUCHT } from '../js/world/maps/bucht.js';

const FOREIGN = {
  en: { ui: EN, species: EN_SPECIES, world: EN_WORLD, story: EN_STORY, secret: EN_SECRET_STORY, quests: EN_QUEST_TEXT },
  fr: { ui: FR, species: FR_SPECIES, world: FR_WORLD, story: FR_STORY, secret: FR_SECRET_STORY, quests: FR_QUEST_TEXT },
  es: { ui: ES, species: ES_SPECIES, world: ES_WORLD, story: ES_STORY, secret: ES_SECRET_STORY, quests: ES_QUEST_TEXT },
};

test.afterEach(() => setLanguage('de'));

const holes = v => [...String(v).matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort().join(',');
const lines = v => (Array.isArray(v) ? v.flat(Infinity) : [v]);
// Sprechblasen haben je Zeile höchstens etwa 90 Zeichen, mit Spielraum für längere Sprachen.
// Texte auf Menüseiten dürfen länger sein, sie brechen um.
const BUBBLES = /^(intro|eggs|world|duel|note|stone|cave|fog|trainer|recover)\./;
const BUBBLE_MAX = 110;
const WORLD_MAX = 130;
const FIELDS = ['lines', 'linesLit', 'linesOpen', 'linesNoClock', 'linesAfter', 'afterWin'];

for (const [lang, L] of Object.entries(FOREIGN)) {
  test(`${lang}: jeder deutsche Schlüssel, mit gleicher Art und gleichen Platzhaltern`, () => {
    for (const [k, v] of Object.entries(DE)) {
      assert.ok(k in L.ui, `${lang} fehlt: ${k}`);
      assert.equal(Array.isArray(L.ui[k]), Array.isArray(v), k);
      assert.equal(holes(L.ui[k]), holes(v), k);
    }
    assert.deepEqual(Object.keys(L.ui).filter(k => !(k in DE)), []);
  });

  test(`${lang}: Texte sind nicht leer, Sprechblasen je Zeile höchstens ${BUBBLE_MAX} Zeichen`, () => {
    for (const [k, v] of Object.entries(L.ui)) {
      for (const line of lines(v)) {
        assert.ok(line.trim(), k);
        if (BUBBLES.test(k)) assert.ok(line.length <= BUBBLE_MAX, `${k}: ${line.length} Zeichen`);
      }
    }
  });

  test(`${lang}: jedes Wesen mit allen Stufennamen, Beschreibung und Besonderheit`, () => {
    for (const [id, sp] of Object.entries(SPECIES)) {
      const s = L.species[id];
      assert.ok(s, `${lang}: ${id}`);
      assert.equal(s.names.length, sp.names.length, id);
      for (const n of s.names) assert.ok(n && n.length <= 16, `${id}: ${n}`);
      assert.ok(s.description?.trim(), id);
      assert.equal(!!s.special, !!sp.special, id);
      if (s.special) assert.ok(s.special.name && s.special.text, id);
    }
    assert.deepEqual(Object.keys(L.species).filter(id => !SPECIES[id]), []);
    const names = Object.values(L.species).flatMap(s => [...new Set(s.names)]);
    assert.deepEqual(names.filter((n, i) => names.indexOf(n) !== i), [], 'kein Name bei zwei Wesen');
  });

  test(`${lang}: jede Karte hat Gebietsnamen und jeden Text der Bewohner und Schilder`, () => {
    for (const def of Object.values(MAPS)) {
      const a = L.world.areas[def.id];
      assert.ok(a?.name && a?.of && a?.the, def.id);
      assert.ok(a.name.length <= 22, `${def.id}: ${a.name}`);
      const ids = new Set();
      for (const o of def.objects) {
        const fields = FIELDS.filter(f => o[f] != null);
        if (!fields.length) continue;
        const id = o.type === 'trainer' ? 'trainer' : o.id;
        assert.ok(id, `${def.id}: ${o.type} bei ${o.x},${o.y} ohne id`);
        assert.ok(!ids.has(id), `${def.id}: id ${id} doppelt`);
        ids.add(id);
        for (const f of fields) {
          const v = L.world.objects[def.id]?.[id]?.[f];
          assert.ok(Array.isArray(o[f]) ? Array.isArray(v) && v.length > 0 : typeof v === 'string' && v, `${lang}: ${def.id}.${id}.${f}`);
          for (const line of lines(v)) assert.ok(line.trim() && line.length <= WORLD_MAX, `${def.id}.${id}.${f}: ${line.length} Zeichen`);
        }
      }
      for (const id of Object.keys(L.world.objects[def.id] ?? {})) assert.ok(ids.has(id), `${def.id}: ${id} gibt es nicht auf der Karte`);
    }
  });

  test(`${lang}: Geschichte und Aufträge in derselben Form wie im Deutschen`, () => {
    for (const [area, pieces] of Object.entries(STORY)) assert.equal(L.story[area]?.length, pieces.length, `Gebiet ${area}`);
    for (const place of Object.keys(SECRET_STORY)) assert.ok(L.secret[place]?.trim(), place);
    for (const [id, src] of Object.entries(QUEST_TEXT)) {
      const q = L.quests[id];
      assert.ok(q, id);
      assert.deepEqual(Object.keys(q).sort(), Object.keys(src).sort(), id);
      for (const [k, v] of Object.entries(src)) {
        assert.equal(Array.isArray(q[k]), Array.isArray(v), `${id}.${k}`);
        if (k === 'steps' || k === 'hints') assert.equal(q[k].length, v.length, `${id}.${k}`);
        for (const line of lines(q[k])) assert.ok(typeof line === 'string' && line.trim(), `${id}.${k}`);
      }
    }
    assert.deepEqual(Object.keys(L.quests).filter(id => !QUEST_TEXT[id]), []);
  });

  test(`${lang}: das Spiel nimmt die Texte der Sprache`, () => {
    setLanguage(lang);
    assert.equal(t('app.title'), L.ui['app.title']);
    assert.equal(speciesText('nixi').names[0], L.species.nixi.names[0]);
    assert.equal(areaName(MOOR), L.world.areas.moor.name);
    assert.deepEqual(worldLines(BUCHT, BUCHT.objects.find(o => o.id === 'ilvy'), 'lines'), L.world.objects.bucht.ilvy.lines);
    assert.deepEqual(storyPieces(1), L.story[1]);
    assert.equal(secretStory('eiche'), L.secret.eiche);
    assert.equal(questText('q1').title, L.quests.q1.title);
  });
}

for (const lang of ['fr', 'es']) {
  const L = FOREIGN[lang];

  test(`${lang}: jedes Wesen hat ein grammatisches Geschlecht`, () => {
    for (const id of Object.keys(SPECIES)) assert.ok(['m', 'f'].includes(L.species[id].gender), `${lang}: ${id}`);
  });

  test(`${lang}: Nebelschilder mit Einzahl und Mehrzahl wie im Deutschen`, () => {
    const plural = lang === 'fr' ? /^les\s/i : /^(los|las)\s/i;
    for (const def of Object.values(MAPS)) {
      for (const sign of def.objects.filter(o => o.leadsTo)) {
        const target = mapOfArea(sign.leadsTo);
        assert.equal(plural.test(L.world.areas[target.id].the), !!sign.leadsToPlural, `${def.id}.${sign.id} → ${target.id}`);
      }
    }
  });

  test(`${lang}: wilde Wesen, Leuchtstein und Nebelschild im Satz`, () => {
    setLanguage(lang);
    const g = L.species.glimmqualle.gender;
    const name = L.species.glimmqualle.names[0];
    assert.equal(wildName('glimmqualle', 1, 'a'), L.ui[`wild.a.${g}`].replace('{name}', name));
    assert.equal(wildName('glimmqualle', 1, 'the'), L.ui[`wild.the.${g}`].replace('{name}', name));
    assert.ok(t('world.beaconRelit', { of: areaOf(MOOR) }).includes(L.world.areas.moor.of));
    const sign = DUENEN.objects.find(o => o.id === 'nebel-ost');
    const first = fogEdgeLines(sign, { gateBeaten: true, packHasNext: true, builtAreas: 4 }, DUENEN)[0];
    assert.equal(first, L.ui['fog.beyondMany'].replace('{name}', destinationName(sign)));
    assert.equal(destinationName(sign), L.world.areas.klippen.the);
  });
}

test('Spanisch: Fragen und Ausrufe haben ¿ … ? und ¡ … !', () => {
  const all = [
    ...Object.values(ES).flatMap(lines),
    ...Object.values(ES_WORLD.objects).flatMap(m => Object.values(m).flatMap(o => Object.values(o).flatMap(lines))),
    ...Object.values(ES_QUEST_TEXT).flatMap(q => Object.values(q).flatMap(lines)),
  ];
  // „? Todavía sin ver“ im Wesen-Buch: Das ? vorn ist ein Zeichen für „unbekannt“, keine Frage.
  for (const s of all.map(x => x.replace(/^\? /, '')).filter(x => !/^\?+$/.test(x))) {
    assert.equal((s.match(/¿/g) ?? []).length, (s.match(/\?/g) ?? []).length, s);
    assert.equal((s.match(/¡/g) ?? []).length, (s.match(/!/g) ?? []).length, s);
  }
});

test('Französisch: keine fehlende Elision vor Namen, kein Wesenname mit Vokal am Anfang', () => {
  const ELISION = /(^|[\s(«“"'])(de|que|le|la|je|ne|se|ce|me|te)\s+\{(name|wild|item|title|place|what|ability)\}/i;
  // „Le {name} sauvage“ ist richtig: Dort steht immer ein Wesenname, und der beginnt nie mit Vokal.
  const all = [
    ...Object.entries(FR).filter(([k]) => !k.startsWith('wild.')).flatMap(([, v]) => lines(v)),
    ...Object.values(FR_QUEST_TEXT).flatMap(q => Object.values(q).flatMap(lines)),
  ];
  for (const s of all) assert.ok(!ELISION.test(s), s);
  for (const [id, s] of Object.entries(FR_SPECIES)) for (const n of s.names) assert.ok(!/^[aeiouyhàâäéèêëîïôöûüœ]/i.test(n), `${id}: ${n}`);
  setLanguage('fr');
  assert.equal(wildName('eichhuscher', 1, 'the'), `${FR_SPECIES.eichhuscher.gender === 'f' ? 'La' : 'Le'} ${FR_SPECIES.eichhuscher.names[0]} sauvage`);
});

// Alle Zeichenketten in einem Wert, auch in Listen und verschachtelten Objekten (nur die Texte, kein Code).
const strings = v => (typeof v === 'string' ? [v] : v && typeof v === 'object' ? Object.values(v).flatMap(strings) : []);

test('Französisch: vor : ; ? ! steht nie ein normales Leerzeichen, sondern ein geschütztes', () => {
  const L = FOREIGN.fr;
  const all = [L.ui, L.species, L.world, L.story, L.secret, L.quests].flatMap(strings);
  assert.ok(all.length > 1000, `${all.length} Texte`);
  assert.deepEqual(all.filter(s => / [:;?!]/.test(s)), []);
  assert.ok(all.some(s => / [:;?!]/.test(s)), 'geschützte Leerzeichen gibt es');
});

test('Zahlen im Satz: Bei 1 steht keine Mehrzahl (Karte, Tasche)', () => {
  const PLURAL_AFTER_ONE = /\b1 (lampes|places|huecos|sitios|sockets|places used)\b|Brillan 1\b|\b1 \w+ are\b|\b1 of 8 sockets are\b/;
  for (const lang of ['en', 'fr', 'es']) {
    setLanguage(lang);
    for (const s of [t('map.sockets', { lit: 1 }), t('bag.foodSlots', { n: 1, max: 10 })]) assert.ok(!PLURAL_AFTER_ONE.test(s), `${lang}: ${s}`);
  }
});

test('Französisch: Die Revanche sagt „encore plus de force“ (sonst heißt es „keine Kraft mehr“)', () => {
  assert.ok(FR['rematch.offer'].includes('encore plus de force'), FR['rematch.offer']);
});

test('Schalter in den Einstellungen: „Musik: an“ kommt aus der Tabelle, im Französischen mit geschütztem Leerzeichen', () => {
  setLanguage('fr');
  assert.equal(t('settings.toggle', { what: 'Musique', state: 'oui' }), 'Musique : oui');
  setLanguage('de');
  assert.equal(t('settings.toggle', { what: 'Musik', state: 'an' }), 'Musik: an');
  const src = readFileSync(new URL('../js/menu/settings.js', import.meta.url), 'utf8');
  assert.ok(src.includes("t('settings.toggle'"), 'settings.js setzt den Text nicht selbst zusammen');
});

test('Aufstieg verloren: „erschöpft“ steht nicht zweimal hintereinander', () => {
  for (const lang of ['de', 'en', 'fr', 'es']) {
    setLanguage(lang);
    const tired = t('duel.ownTired', { name: 'Nixi' }).replace(/[.!]$/, '');
    assert.ok(!t('tower.lost', { name: 'Nixi' }).includes(tired), `${lang}: ${t('tower.lost', { name: 'Nixi' })}`);
  }
});

test('Kurze Texte auf dem kleinen Schirm: Zeitstein-Knopf und Kartenlegende', () => {
  for (const [lang, L] of Object.entries({ de: DE, ...Object.fromEntries(Object.entries(FOREIGN).map(([k, v]) => [k, v.ui])) })) {
    assert.ok(L['duel.timeBtn'].length <= DE['duel.timeBtn'].length + 2, `${lang}: ${L['duel.timeBtn']}`);
    for (const k of ['map.lit', 'map.dark', 'map.here']) assert.ok(L[k].length <= 24, `${lang}: ${L[k]}`);
  }
});
