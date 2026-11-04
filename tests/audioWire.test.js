import { test } from 'node:test';
import assert from 'node:assert/strict';
import { musicFor, duelMusic } from '../js/audio/choose.js';
import { setAudio, sound, jingle, musicTo, fanfare } from '../js/audio/bus.js';
import { DRUM, VOICE } from '../js/audio/synth.js';
import { createAudio } from '../js/audio/audio.js';
import { SONGS } from '../js/audio/songs.js';
import { MAPS } from '../js/world/network.js';
import { textIn } from '../js/i18n/i18n.js';
import { readFileSync } from 'node:fs';

test('Musik nach Ort: jedes Gebiet sein Stück, die Höhle eigens, geheime Orte wie ihr Gebiet', () => {
  for (const [id, song] of [['bucht', 'area1'], ['wald', 'area2'], ['wiese', 'area8'], ['eisgrotte', 'area7'], ['gezeiten', 'area1'], ['hoehle1', 'cave'], ['hoehle3', 'cave']]) {
    assert.equal(musicFor(MAPS[id]), song, id);
  }
  for (const def of Object.values(MAPS)) assert.ok(SONGS[musicFor(def)], def.id);
});

test('Musik nach Duell', () => {
  assert.deepEqual(['wild', 'trainer', 'boss', 'ascent'].map(kind => duelMusic({ kind })), ['wild', 'trainer', 'boss', 'ascent']);
  assert.equal(duelMusic({ kind: 'trainer', rematch: 2 }), 'trainer');
  assert.equal(duelMusic({ kind: 'note' }), 'wild');
});

test('Der Tonweg ruft das angemeldete Audio, ohne Audio passiert nichts', () => {
  const calls = [];
  setAudio(null);
  sound('menu');
  setAudio({ sfx: id => calls.push(['sfx', id]), jingle: id => calls.push(['jingle', id]), music: id => calls.push(['music', id]) });
  sound('menu');
  jingle('find');
  musicTo('title');
  assert.deepEqual(calls, [['sfx', 'menu'], ['jingle', 'find'], ['music', 'title']]);
  setAudio(null);
});

test('Die Einstellungen des Spielstands gelten, auch wenn sie erst nach dem Start geladen werden', () => {
  const state = { settings: { music: false, sfx: true } };
  const audio = createAudio({ makeContext: () => null, settings: () => state.settings, songs: SONGS, setTimer: () => {} });
  assert.equal(audio.state().musicOn, false);
  state.settings.music = true;
  assert.equal(audio.state().musicOn, true);
});

test('Texte der Toneinstellungen auf Deutsch und Englisch; alle Ton-Dateien im Service Worker', () => {
  for (const key of ['settings.sound', 'settings.music', 'settings.sfx', 'settings.on', 'settings.off']) assert.ok(textIn('de', key) && textIn('en', key), key);
  assert.equal(textIn('de', 'settings.music'), 'Musik');
  assert.equal(textIn('en', 'settings.sfx'), 'Sound effects');
  const sw = readFileSync(new URL('../sw.js', import.meta.url), 'utf8');
  for (const f of ['audio', 'bus', 'choose', 'notes', 'sequencer', 'sfx', 'songs', 'synth']) assert.ok(sw.includes(`"js/audio/${f}.js"`), f);
});

test('Sieg und Niederlage: Nach dem Jingle kommt die Duellmusik nicht wieder', () => {
  const calls = [];
  setAudio({ sfx() {}, jingle: id => calls.push(['jingle', id]), music: id => calls.push(['music', id]) });
  fanfare('victory');
  assert.deepEqual(calls, [['music', null], ['jingle', 'victory']]);
  const param = () => ({ setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} });
  const node = x => ({ connect() {}, disconnect() {}, ...x });
  const ctx = {
    currentTime: 0,
    sampleRate: 8000,
    state: 'running',
    destination: node(),
    resume() {},
    createOscillator: () => node({ frequency: param(), start() {}, stop() {} }),
    createGain: () => node({ gain: param() }),
    createBuffer: (c, len) => ({ getChannelData: () => new Float32Array(len) }),
    createBufferSource: () => node({ playbackRate: param(), start() {}, stop() {} }),
  };
  const ticks = [];
  const audio = createAudio({ makeContext: () => ctx, settings: { music: true, sfx: true }, songs: SONGS, setTimer: fn => ticks.push(fn), later: () => {} });
  setAudio(audio);
  audio.unlock();
  musicTo('wild');
  fanfare('victory');
  for (let t = 0; t <= 6; t += 0.05) {
    ctx.currentTime = t;
    ticks.forEach(f => f());
  }
  assert.equal(audio.state().jingle, false);
  assert.equal(audio.state().playing, null);
  setAudio(null);
});

test('Das Schlagzeug ist nicht lauter als die Melodie (ruhig genug für das Lernen)', () => {
  // Weißes Rauschen mit der Spitze a hat einen Effektivwert von a/√3, ein Rechteck einen von a.
  for (const [kind, d] of Object.entries(DRUM)) assert.ok(d.level / Math.sqrt(3) <= VOICE.sq1[1], `${kind}: ${d.level}`);
});
