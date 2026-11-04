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
