import { test } from 'node:test';
import assert from 'node:assert/strict';
import { noteFreq, parseVoice, parseSong } from '../js/audio/notes.js';
import { createSequencer } from '../js/audio/sequencer.js';

const near = (a, b) => Math.abs(a - b) < 0.01;

test('Tonhöhen gleichstufig: a4 = 440 Hz, mit Kreuz und b', () => {
  assert.equal(noteFreq('a4'), 440);
  assert.ok(near(noteFreq('c4'), 261.63));
  assert.ok(near(noteFreq('bb3'), 233.08));
  assert.ok(near(noteFreq('g#3'), 207.65));
  assert.equal(noteFreq('x4'), null);
});

test('Eine Stimme: Längen mit Punkt, Pausen ohne Ereignis, Taktstriche zählen nicht', () => {
  const v = parseVoice('c4/4 -/4 | e4/8. g4/16', 120);
  assert.deepEqual(v.events.map(e => [e.t, e.dur]), [[0, 0.5], [1, 0.375], [1.375, 0.125]]);
  assert.ok(near(v.events[1].freq, 329.63));
  assert.equal(v.length, 1.5);
  const drums = parseVoice('k/8 h/16 h/16 s/4', 120);
  assert.deepEqual(drums.events.map(e => e.drum), ['k', 'h', 'h', 's']);
  assert.equal(drums.length, 1);
  assert.throws(() => parseVoice('c4/4 q9/4', 120), /q9\/4.*2/);
});

test('Ein Stück: alle Stimmen gleich lang, sonst ein Fehler', () => {
  const song = { tempo: 120, voices: { sq1: 'c4/2', sq2: 'e3/4 g3/4', tri: 'c2/2', noise: 'k/4 s/4' } };
  const p = parseSong(song);
  assert.equal(p.length, 1);
  assert.deepEqual(Object.keys(p.voices).sort(), ['noise', 'sq1', 'sq2', 'tri']);
  assert.throws(() => parseSong({ tempo: 120, voices: { sq1: 'c4/2', tri: 'c2/4' } }), /gleich lang|length/i);
});

test('Sequencer: plant nur Ereignisse im Vorlauf, wiederholt die Schleife und plant nach stop nichts mehr', () => {
  let clock = 10;
  const planned = [];
  const seq = createSequencer({ now: () => clock, schedule: (voice, ev, when) => planned.push([voice, when]), lookahead: 0.6 });
  const song = parseSong({ tempo: 120, voices: { sq1: 'c4/4 d4/4' } }); // zwei Viertel, Länge 1 s
  seq.play(song, { loop: true, at: 10 });
  seq.tick();
  assert.deepEqual(planned, [['sq1', 10], ['sq1', 10.5]]);
  clock = 10.6;
  seq.tick();
  assert.deepEqual(planned.map(p => p[1]), [10, 10.5, 11]);
  seq.stop();
  clock = 13;
  seq.tick();
  assert.equal(planned.length, 3);
  let ended = 0;
  seq.play(song, { loop: false, at: 13, onEnd: () => ended++ });
  clock = 13.2;
  seq.tick();
  clock = 14.1;
  seq.tick();
  seq.tick();
  assert.equal(ended, 1);
  assert.equal(planned.length, 5);
});

// 1.3.2: Nach einem Jingle läuft die Gebietsmusik an derselben Stelle weiter. Dafür kann der Sequencer
// mitten im Stück beginnen (from) und sagt, wie weit die Schleife ist (position).
test('Sequencer: from beginnt beim ersten Ereignis ab from, mit den richtigen Zeiten; danach läuft die Schleife normal', () => {
  let clock = 10;
  const planned = [];
  const seq = createSequencer({ now: () => clock, schedule: (voice, ev, when) => planned.push([voice, ev.t, when]), lookahead: 3 });
  // Länge 2 s: sq1 vier Viertel (0, 0,5, 1, 1,5), tri eine lange Note ab 0.
  const song = parseSong({ tempo: 120, voices: { sq1: 'c4/4 d4/4 e4/4 f4/4', tri: 'c2/1' } });
  seq.play(song, { loop: true, at: 10, from: 0.7 });
  seq.tick(); // plant bis 13
  const sq1 = planned.filter(p => p[0] === 'sq1');
  assert.deepEqual(sq1.map(p => p[1]), [1, 1.5, 0, 0.5, 1, 1.5], 'zuerst das Ereignis bei 1 s, dann die Schleife von vorn');
  const at = [10.3, 10.8, 11.3, 11.8, 12.3, 12.8];
  sq1.forEach((p, i) => assert.ok(near(p[2], at[i]), `${p[2]} statt ${at[i]}`));
  const tri = planned.filter(p => p[0] === 'tri');
  assert.equal(tri.length, 1, 'die lange Note von 0 s fehlt im ersten Durchgang');
  assert.ok(near(tri[0][2], 11.3), 'und kommt mit der nächsten Runde');
  assert.ok(planned.every(p => p[2] >= 10), 'nichts liegt vor dem Start');
  // Ohne from wie bisher: alles ab 0.
  planned.length = 0;
  seq.play(song, { loop: true, at: 20 });
  clock = 20;
  seq.tick();
  assert.deepEqual(planned.filter(p => p[0] === 'sq1').slice(0, 2).map(p => p[2]), [20, 20.5]);
});

test('Sequencer: from bei einem Jingle endet zur rechten Zeit', () => {
  let clock = 5;
  let ended = 0;
  const planned = [];
  const seq = createSequencer({ now: () => clock, schedule: (voice, ev, when) => planned.push(when), lookahead: 0.5 });
  const song = parseSong({ tempo: 120, voices: { sq1: 'c4/4 d4/4' } }); // 1 s
  seq.play(song, { loop: false, at: 5, from: 0.4, onEnd: () => ended++ });
  seq.tick();
  assert.deepEqual(planned, [5.1]);
  clock = 5.59;
  seq.tick();
  assert.equal(ended, 0);
  clock = 5.61;
  seq.tick();
  assert.equal(ended, 1);
});

test('Sequencer: position() sagt, wie weit die laufende Schleife ist', () => {
  let clock = 10;
  const seq = createSequencer({ now: () => clock, schedule: () => {} });
  const song = parseSong({ tempo: 120, voices: { sq1: 'c4/4 d4/4 e4/4 f4/4' } }); // 2 s
  assert.equal(seq.position(), null, 'ohne Stück');
  seq.play(song, { loop: true, at: 10.05 });
  assert.equal(seq.position(), 0, 'im Vorlauf noch am Anfang');
  clock = 10.65;
  assert.ok(near(seq.position(), 0.6));
  clock = 12.75;
  assert.ok(near(seq.position(), 0.7), 'modulo Länge');
  seq.play(song, { loop: true, at: 20.05, from: 1.2 });
  clock = 20;
  assert.ok(near(seq.position(), 1.2), 'im Vorlauf an der Stelle, ab der es weitergeht');
  clock = 20.55;
  assert.ok(near(seq.position(), 1.7));
  clock = 21.05;
  assert.ok(near(seq.position(), 0.2));
  seq.play(song, { loop: false, at: 30 });
  clock = 30.5;
  assert.equal(seq.position(), null, 'ein Jingle ist keine Schleife');
  seq.play(song, { loop: true, at: 40 });
  seq.stop();
  assert.equal(seq.position(), null, 'nach stop');
});
