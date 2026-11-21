import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SONGS, LOOPS, JINGLES } from '../js/audio/songs.js';
import { parseSong } from '../js/audio/notes.js';

test('Alle Stücke und Jingles aus Design 15 gibt es', () => {
  assert.deepEqual(LOOPS, ['title', 'area1', 'area2', 'area3', 'area4', 'area5', 'area6', 'area7', 'area8', 'cave', 'wild', 'trainer', 'boss', 'ascent']);
  assert.deepEqual(JINGLES, ['victory', 'defeat', 'levelup', 'evolution', 'find', 'beacon', 'finale', 'friendship']);
  for (const id of [...LOOPS, ...JINGLES]) assert.ok(SONGS[id], id);
});

test('Jedes Stück lässt sich lesen: gleich lange Stimmen, passende Länge, Tempo und Tonumfang', () => {
  for (const id of [...LOOPS, ...JINGLES]) {
    const song = SONGS[id];
    assert.ok(song.tempo >= 60 && song.tempo <= 180, `${id}: Tempo ${song.tempo}`);
    const p = parseSong(song);
    if (LOOPS.includes(id)) assert.ok(p.length >= 6 && p.length <= 40, `${id}: ${p.length.toFixed(1)} s`);
    else assert.ok(p.length <= 4 + 1e-9, `${id}: ${p.length.toFixed(1)} s`);
    for (const [voice, events] of Object.entries(p.voices)) {
      for (const e of events) if (e.freq) assert.ok(e.freq >= 55 && e.freq <= 2100, `${id}.${voice}: ${e.freq.toFixed(1)} Hz`);
    }
    assert.ok(p.voices.sq1?.length, `${id}: Melodie`);
  }
});
