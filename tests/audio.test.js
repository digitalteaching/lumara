import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createAudio } from '../js/audio/audio.js';
import { SFX } from '../js/audio/sfx.js';

// Ein nachgebauter AudioContext: zählt Oszillatoren und Rauschquellen, die Zeit stellt der Test.
function fakeContext() {
  const param = v => ({ value: v, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {} });
  const node = extra => ({ connect() {}, disconnect() {}, ...extra });
  const ctx = {
    currentTime: 0,
    sampleRate: 8000,
    destination: node(),
    oscillators: 0,
    sources: 0,
    gains: [],
    createOscillator() { ctx.oscillators++; return node({ type: 'square', frequency: param(440), start() {}, stop() {} }); },
    createGain() { const g = node({ gain: param(1) }); ctx.gains.push(g); return g; },
    createBuffer(ch, len) { return { getChannelData: () => new Float32Array(len) }; },
    createBufferSource() { ctx.sources++; return node({ buffer: null, playbackRate: param(1), start() {}, stop() {} }); },
    resume() {},
  };
  return ctx;
}

const SONGS = {
  a: { tempo: 120, voices: { sq1: 'c4/4 d4/4', tri: 'c2/2' } },
  b: { tempo: 120, voices: { sq1: 'e4/2' } },
  win: { tempo: 120, voices: { sq1: 'g4/8 c5/8' } },
};
const setup = (settings = { music: true, sfx: true }) => {
  const ctx = fakeContext();
  const ticks = [];
  const audio = createAudio({ makeContext: () => ctx, settings, songs: SONGS, setTimer: fn => ticks.push(fn) });
  const tick = (t = ctx.currentTime) => { ctx.currentTime = t; ticks.forEach(f => f()); };
  return { ctx, audio, tick };
};

test('Vor der ersten Berührung entsteht kein Ton; danach beginnt die gewünschte Musik', () => {
  const { ctx, audio, tick } = setup();
  audio.music('a');
  tick();
  assert.equal(ctx.oscillators, 0);
  assert.equal(audio.state().unlocked, false);
  audio.unlock();
  tick(0.01);
  assert.ok(ctx.oscillators > 0);
  assert.equal(audio.state().playing, 'a');
});

test('Musik aus: keine neuen Töne; wieder an: die gewünschte Musik läuft weiter', () => {
  const { ctx, audio, tick } = setup();
  audio.unlock();
  audio.music('a');
  tick(0.01);
  audio.setMusicOn(false);
  const n = ctx.oscillators;
  tick(2);
  tick(4);
  assert.equal(ctx.oscillators, n);
  audio.setMusicOn(true);
  tick(4.1);
  assert.ok(ctx.oscillators > n);
});

test('Dasselbe Stück startet nicht neu, ein neues ersetzt das alte', () => {
  const { audio, tick } = setup();
  audio.unlock();
  audio.music('a');
  tick(0.01);
  const plays = audio.state().plays;
  audio.music('a');
  assert.equal(audio.state().plays, plays);
  audio.music('b');
  assert.equal(audio.state().playing, 'b');
  assert.equal(audio.state().plays, plays + 1);
});

test('Ein Jingle unterbricht die Schleife; danach läuft die Musik wieder', () => {
  const { audio, tick } = setup();
  audio.unlock();
  audio.music('a');
  tick(0.01);
  audio.jingle('win');
  assert.equal(audio.state().jingle, true);
  tick(0.3);
  tick(1.0);
  assert.equal(audio.state().jingle, false);
  assert.equal(audio.state().playing, 'a');
});

test('Effekte nur, wenn sie an sind; alle Effekte aus Design 15 gibt es', () => {
  const on = setup();
  on.audio.unlock();
  on.audio.sfx('correct');
  assert.ok(on.ctx.oscillators + on.ctx.sources > 0);
  const off = setup({ music: true, sfx: false });
  off.audio.unlock();
  off.audio.sfx('correct');
  assert.equal(off.ctx.oscillators + off.ctx.sources, 0);
  for (const id of ['menu', 'confirm', 'correct', 'wrong', 'hit', 'crit', 'tile', 'type', 'lift', 'transition', 'fog']) assert.ok(SFX[id], id);
});

test('Ohne Web Audio bleibt alles still und wirft keinen Fehler', () => {
  const audio = createAudio({ makeContext: () => { throw new Error('no audio'); }, settings: { music: true, sfx: true }, songs: SONGS, setTimer: () => {} });
  audio.unlock();
  audio.music('a');
  audio.sfx('menu');
  audio.jingle('win');
  assert.equal(audio.state().unlocked, false);
});
