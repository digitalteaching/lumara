import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evolutionAt } from '../js/gfx/evolution.js';
import { playEvolution } from '../js/scenes/evolution.js';
import { ownEnergyShown } from '../js/duel/plates.js';
import { evolutionLines, abilityRows, nameAtStage } from '../js/data/species.js';
import { setLanguage } from '../js/i18n/i18n.js';

const frames = reduced => Array.from({ length: 381 }, (_, i) => evolutionAt(i * 10, reduced));
const changes = list => list.flatMap((f, i) => (i && f.form !== list[i - 1].form ? [i * 10] : []));

test('Entwicklung: beginnt mit der alten Gestalt, endet nach 3,8 s mit der neuen', () => {
  assert.deepEqual([evolutionAt(0, false).form, evolutionAt(0, false).white], ['from', 0]);
  assert.equal(evolutionAt(3799, false).done, false);
  assert.deepEqual([evolutionAt(3800, false).done, evolutionAt(3800, false).form, evolutionAt(3800, false).white], [true, 'to', 0]);
});

test('Entwicklung: Wechselspiel, aber höchstens drei Wechsel pro Sekunde', () => {
  const at = changes(frames(false));
  assert.ok(at.length >= 4);
  for (const t of at) assert.ok(at.filter(u => u >= t && u < t + 1000).length <= 3, `ab ${t} ms`);
});

test('Bewegung reduzieren: ruhige Überblendung, ein Wechsel, kein Funkeln', () => {
  const f = frames(true);
  assert.equal(changes(f).length, 1);
  assert.ok(f.every(x => x.sparkle === 0));
  assert.ok(f.every((x, i) => !i || x.mix >= f[i - 1].mix));
});

test('Entwicklungstexte nennen alten und neuen Namen, jede neue Fähigkeit und die Energie', () => {
  assert.deepEqual(evolutionLines({ species: 'funki', nickname: null }, 1, 2), [
    'Funki entwickelt sich zu Funkelflug!',
    'Neue Fähigkeit: Zweite Chance!',
    'Einmal pro Duell darfst du nach einer falschen Antwort noch einmal antworten.',
    'Funkelflug hat jetzt 1 Energie mehr.',
  ]);
  assert.deepEqual(evolutionLines({ species: 'kiesel', nickname: 'Rocky' }, 1, 3), [
    'Rocky entwickelt sich zu Felsenwächter!',
    'Neue Fähigkeit: Zweite Chance!',
    'Einmal pro Duell darfst du nach einer falschen Antwort noch einmal antworten.',
    'Neue Fähigkeit: Schwung!',
    'Ein Volltreffer kommt schon nach 2 richtigen Antworten in Folge.',
    'Rocky hat jetzt 2 Energie mehr.',
  ]);
  setLanguage('en');
  try {
    assert.deepEqual(evolutionLines({ species: 'funki', nickname: null }, 1, 2), [
      'Funki evolves into Sparkwing!',
      'New ability: Second Chance!',
      'Once per duel, you can answer again after a wrong answer.',
      'Sparkwing now has 1 more energy.',
    ]);
  } finally {
    setLanguage('de');
  }
});

test('Fähigkeiten auf der Seite „Wesen“: freigeschaltet ab dem Level der Stufe', () => {
  assert.deepEqual(abilityRows(34).map(r => [r.stage, r.fromLevel, r.unlocked]), [[2, 15, true], [3, 35, false], [4, 60, false]]);
  assert.equal(abilityRows(60).every(r => r.unlocked), true);
  assert.equal(abilityRows(1)[0].name, 'Zweite Chance');
  assert.equal(nameAtStage({ species: 'pieks', nickname: null }, 4), 'Waldhüter');
  assert.equal(nameAtStage({ species: 'pieks', nickname: 'Spiky' }, 4), 'Spiky');
});

test('Entwicklung über der Welt: Anzeige und Menüknopf sind solange weg, danach ist die Welt wieder bereit', async () => {
  const game = { mode: 'walk', reducedMotion: true };
  const world = { onTick: [], afterRender: [] };
  const done = playEvolution(game, world, { species: 'funki', from: 1, to: 2 });
  assert.notEqual(game.mode, 'walk'); // HUD zeigt sonst schon den neuen Namen
  for (let i = 0; i < 100 && world.onTick.length; i++) world.onTick[0](50);
  await done;
  assert.equal(game.mode, 'walk');
  assert.deepEqual([world.onTick.length, world.afterRender.length], [0, 0]);
});

test('Schild nach der Entwicklung im Duell: Energie und Höchstwert des Wesens, nicht mehr die des Duells', () => {
  const duel = { playerEnergy: 4, playerMax: 4 };
  const c = { species: 'funki', level: 15, xpInLevel: 0, energy: 5, lifeStones: 0 };
  assert.deepEqual(ownEnergyShown(duel, c, false), { energy: 4, max: 4 });
  assert.deepEqual(ownEnergyShown(duel, c, true), { energy: 5, max: 5 });
});
