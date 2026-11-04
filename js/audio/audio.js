// Musik und Ton steuern (Design 15). Erst nach der ersten Berührung oder Taste entsteht ein
// AudioContext (Vorgabe von iOS); vorher gewünschte Musik beginnt dann. Musik und Effekte lassen sich
// getrennt ausschalten: Musik aus heißt sofort Stille. Ohne Web Audio bleibt alles still.

import { parseSong } from './notes.js';
import { createSequencer } from './sequencer.js';
import { createSynth } from './synth.js';
import { SFX, playSfx } from './sfx.js';

export const MUSIC_LEVEL = 0.18; // die Musik startet leise
export const SFX_LEVEL = 0.35;

export function createAudio({ makeContext, settings = {}, songs = {}, setTimer = (fn, ms) => setInterval(fn, ms) }) {
  let ctx = null;
  let synth = null;
  let seq = null;
  let gains = null;
  let wanted = null; // gewünschte Schleife (auch vor dem Entsperren)
  let playing = null;
  let jingle = false;
  let plays = 0;
  // settings: ein Objekt oder eine Funktion (der Spielstand wird oft erst nach dem Start geladen).
  // setMusicOn/setSfxOn überschreiben; sonst gilt, was in den Einstellungen steht.
  const cfg = () => (typeof settings === 'function' ? settings() : settings) ?? {};
  let musicOverride = null;
  let sfxOverride = null;
  const isMusicOn = () => musicOverride ?? cfg().music !== false;
  const isSfxOn = () => sfxOverride ?? cfg().sfx !== false;
  const cache = {};
  const parsed = id => (cache[id] ??= parseSong(songs[id]));

  function setLevel(node, value) {
    node.gain.cancelScheduledValues?.(ctx.currentTime);
    node.gain.setValueAtTime(value, ctx.currentTime);
  }

  function startWanted() {
    if (!seq) return;
    setLevel(gains.music, isMusicOn() ? MUSIC_LEVEL : 0);
    if (!isMusicOn() || !wanted || !songs[wanted]) {
      seq.stop();
      playing = null;
      return;
    }
    if (playing === wanted) return;
    seq.play(parsed(wanted), { loop: true });
    playing = wanted;
    plays++;
  }

  function unlock() {
    if (ctx) return;
    try {
      ctx = makeContext();
    } catch {
      ctx = null;
    }
    if (!ctx) return;
    const out = level => {
      const g = ctx.createGain();
      g.gain.setValueAtTime(level, ctx.currentTime);
      g.connect(ctx.destination);
      return g;
    };
    gains = { music: out(isMusicOn() ? MUSIC_LEVEL : 0), sfx: out(SFX_LEVEL) };
    synth = createSynth(ctx, gains);
    seq = createSequencer({
      now: () => ctx.currentTime,
      schedule: (voice, ev, when) => (voice === 'noise' ? synth.drum(ev.drum, when) : synth.note(voice, ev.freq, when, ev.dur)),
    });
    setTimer(() => seq.tick(), 25);
    ctx.resume?.();
    startWanted();
  }

  function music(id) {
    if (id === wanted) return;
    wanted = id;
    if (!jingle) startWanted();
  }

  function stopMusic() {
    wanted = null;
    seq?.stop();
    playing = null;
  }

  // Ein Jingle unterbricht die Schleife; danach beginnt sie von vorn.
  function playJingle(id) {
    if (!seq || !isMusicOn() || !songs[id]) return;
    jingle = true;
    playing = null;
    seq.play(parsed(id), {
      loop: false,
      onEnd: () => {
        jingle = false;
        startWanted();
      },
    });
  }

  function sfx(id) {
    if (!synth || !isSfxOn() || !SFX[id]) return;
    playSfx(synth, id, ctx.currentTime + 0.01);
  }

  function setMusicOn(on) {
    musicOverride = on;
    if (!ctx) return;
    setLevel(gains.music, on ? MUSIC_LEVEL : 0);
    if (on) startWanted();
    else {
      seq.stop();
      playing = null;
      jingle = false;
    }
  }

  function setSfxOn(on) {
    sfxOverride = on;
  }

  // Ist die App verdeckt, pausiert der Ton (spart Akku); sichtbar läuft er weiter.
  function suspend() {
    ctx?.suspend?.();
  }
  function resume() {
    ctx?.resume?.();
  }

  const state = () => ({ unlocked: !!ctx, running: ctx?.state === 'running', playing, jingle, plays, musicOn: isMusicOn(), sfxOn: isSfxOn() });

  return { unlock, music, stopMusic, jingle: playJingle, sfx, setMusicOn, setSfxOn, suspend, resume, state };
}
