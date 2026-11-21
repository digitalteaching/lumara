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
  for (const id of ['menu', 'confirm', 'correct', 'wrong', 'hit', 'crit', 'tile', 'type', 'lift', 'transition', 'fog', 'bagOpen', 'bagClose', 'trust']) assert.ok(SFX[id], id);
});

test('Ohne Web Audio bleibt alles still und wirft keinen Fehler', () => {
  const audio = createAudio({ makeContext: () => { throw new Error('no audio'); }, settings: { music: true, sfx: true }, songs: SONGS, setTimer: () => {} });
  audio.unlock();
  audio.music('a');
  audio.sfx('menu');
  audio.jingle('win');
  assert.equal(audio.state().unlocked, false);
});

// Ein AudioContext, der mitschreibt, wohin jeder Knoten führt und was mit den Lautstärken passiert.
function recordingContext(state = 'running') {
  const param = v => {
    const p = { value: v, calls: [] };
    for (const m of ['setValueAtTime', 'linearRampToValueAtTime', 'exponentialRampToValueAtTime', 'setTargetAtTime', 'cancelScheduledValues']) p[m] = (...a) => p.calls.push([m, ...a]);
    return p;
  };
  const node = extra => ({ dest: null, connected: true, connect(d) { this.dest = d; }, disconnect() { this.connected = false; }, ...extra });
  const ctx = {
    state,
    currentTime: 0,
    sampleRate: 8000,
    destination: node(),
    resumes: 0,
    started: [],
    gains: [],
    createOscillator() { const o = node({ type: 'square', frequency: param(440), start() { ctx.started.push(o); }, stop() {} }); return o; },
    createGain() { const g = node({ gain: param(1) }); ctx.gains.push(g); return g; },
    createBuffer(ch, len) { return { getChannelData: () => new Float32Array(len) }; },
    createBufferSource() { const s = node({ buffer: null, playbackRate: param(1), start() { ctx.started.push(s); }, stop() {} }); return s; },
    resume() { ctx.resumes++; return Promise.resolve(); },
    suspend() { return Promise.resolve(); },
  };
  return ctx;
}
const recorded = (state, settings = { music: true, sfx: true }) => {
  const ctx = recordingContext(state);
  const ticks = [];
  const later = [];
  const audio = createAudio({ makeContext: () => ctx, settings, songs: SONGS, setTimer: fn => ticks.push(fn), later: fn => later.push(fn) });
  const tick = t => { ctx.currentTime = t; ticks.forEach(f => f()); };
  return { ctx, audio, tick, later };
};
// Der Ausgang, an dem die Hüllkurve eines Tons hängt (Ton → Hüllkurve → Stück → Musik).
const songOf = src => src.dest?.dest;

test('iPad: Jede weitere Berührung weckt einen schlafenden Ton; solange er schläft, stauen sich keine Effekte', () => {
  const { ctx, audio } = recorded('suspended');
  audio.unlock();
  assert.equal(ctx.resumes, 1);
  audio.sfx('menu');
  audio.sfx('confirm');
  audio.jingle('win');
  assert.equal(ctx.started.length, 0, 'nichts wird für später aufgestaut');
  audio.unlock();
  assert.equal(ctx.resumes, 2, 'die nächste Berührung versucht es wieder');
  ctx.state = 'running';
  audio.unlock();
  assert.equal(ctx.resumes, 2, 'läuft er, passiert nichts');
  audio.sfx('menu');
  assert.ok(ctx.started.length > 0);
});

test('Nach einem Wechsel verklingt das alte Stück sofort, das neue hat einen eigenen Ausgang', () => {
  const { ctx, audio, tick, later } = recorded('running');
  audio.unlock();
  audio.music('a');
  tick(0.01);
  const old = songOf(ctx.started[0]);
  assert.ok(old && old !== ctx.gains[0], 'das Stück hängt nicht direkt an der Gesamtlautstärke');
  const n = ctx.started.length;
  tick(0.5);
  audio.music('b');
  tick(0.51);
  const fade = old.gain.calls.find(c => (c[0] === 'setTargetAtTime' || c[0] === 'setValueAtTime') && c[1] === 0);
  assert.ok(fade && fade[2] <= 0.51 && (fade[0] === 'setValueAtTime' || fade[3] <= 0.05), 'das alte Stück wird sofort leise');
  const fresh = ctx.started.slice(n).map(songOf).filter(g => g !== old);
  assert.ok(fresh.length > 0 && fresh.every(g => g === fresh[0]), 'neue Töne laufen über einen neuen Ausgang');
  later.forEach(f => f());
  assert.equal(old.connected, false, 'der alte Ausgang wird danach getrennt');
});

test('stopMusic während eines Jingles sperrt die Musik nicht', () => {
  const { audio, tick } = recorded('running');
  audio.unlock();
  audio.music('a');
  tick(0.01);
  audio.jingle('win');
  audio.stopMusic();
  assert.equal(audio.state().jingle, false);
  audio.music('b');
  tick(0.02);
  assert.equal(audio.state().playing, 'b');
});

test('Musik und Effekte aus: der Ton schläft (Akku); eines wieder an: er wacht auf', () => {
  const settings = { music: true, sfx: true };
  const { ctx, audio } = recorded('running', settings);
  let suspends = 0;
  ctx.suspend = () => { suspends++; ctx.state = 'suspended'; return Promise.resolve(); };
  audio.unlock();
  audio.setMusicOn(false);
  assert.equal(suspends, 0);
  audio.setSfxOn(false);
  assert.equal(suspends, 1);
  const r = ctx.resumes;
  audio.resume(); // App wieder sichtbar: bleibt still, weil beides aus ist
  assert.equal(ctx.resumes, r);
  audio.setSfxOn(true);
  assert.equal(ctx.resumes, r + 1);
});

test('Jingles bleiben bei Musik aus still; Effekte vor dem Entsperren still', () => {
  const off = recorded('running', { music: false, sfx: true });
  off.audio.unlock();
  off.audio.jingle('win');
  off.tick(0.1);
  assert.equal(off.ctx.started.length, 0);
  const early = recorded('running');
  early.audio.sfx('menu');
  assert.equal(early.ctx.started.length, 0);
});
