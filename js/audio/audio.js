// Musik und Ton steuern (Design 15). Erst nach der ersten Berührung oder Taste entsteht ein
// AudioContext (Vorgabe von iOS); vorher gewünschte Musik beginnt dann. Musik und Effekte lassen sich
// getrennt ausschalten: Musik aus heißt sofort Stille. Ohne Web Audio bleibt alles still.

import { parseSong } from './notes.js';
import { createSequencer } from './sequencer.js';
import { createSynth } from './synth.js';
import { SFX, playSfx } from './sfx.js';

export const MUSIC_LEVEL = 0.18; // die Musik startet leise
export const SFX_LEVEL = 0.35;

// resume() und suspend() geben ein Promise, das abgelehnt werden kann (ohne Berührung): kein Fehler.
const quiet = p => p?.catch?.(() => {});

export function createAudio({ makeContext, settings = {}, songs = {}, setTimer = (fn, ms) => setInterval(fn, ms), later = (fn, ms) => setTimeout(fn, ms) }) {
  let ctx = null;
  let synth = null;
  let seq = null;
  let gains = null;
  // Jedes Stück hat einen eigenen Ausgang vor der Musiklautstärke. Beim Wechsel wird er sofort
  // leise, sonst klängen schon eingeplante Töne (Bordun, lange Bassnoten) noch Sekunden nach.
  let song = null;
  const route = { music: null, sfx: null };
  let wanted = null; // gewünschte Schleife (auch vor dem Entsperren)
  let playing = null;
  let jingle = false;
  // Wo eine Schleife stand, als ein Jingle sie unterbrach: { id, pos } (Sekunden in der Schleife).
  // Gilt nur für diese Musik und nur einmal, danach (oder bei anderer Musik, Musik aus) null.
  let resumeAt = null;
  let plays = 0;
  // settings: ein Objekt oder eine Funktion (der Spielstand wird oft erst nach dem Start geladen).
  // setMusicOn/setSfxOn überschreiben; sonst gilt, was in den Einstellungen steht.
  const cfg = () => (typeof settings === 'function' ? settings() : settings) ?? {};
  let musicOverride = null;
  let sfxOverride = null;
  const isMusicOn = () => musicOverride ?? cfg().music !== false;
  const isSfxOn = () => sfxOverride ?? cfg().sfx !== false;
  const anyOn = () => isMusicOn() || isSfxOn();
  const cache = {};
  const parsed = id => (cache[id] ??= parseSong(songs[id]));

  function setLevel(node, value) {
    node.gain.cancelScheduledValues?.(ctx.currentTime);
    node.gain.setValueAtTime(value, ctx.currentTime);
  }

  // Läuft der Ton (noch) nicht, etwa auf dem iPad vor der ersten echten Berührung, wird nichts
  // eingeplant: Die Uhr steht dann, und alles käme später auf einmal.
  const running = () => !!ctx && (ctx.state === undefined || ctx.state === 'running');

  function cut() {
    if (!song) return;
    const old = song;
    song = null;
    old.gain.cancelScheduledValues?.(ctx.currentTime);
    if (old.gain.setTargetAtTime) old.gain.setTargetAtTime(0, ctx.currentTime, 0.015);
    else old.gain.setValueAtTime(0, ctx.currentTime);
    later(() => old.disconnect(), 150);
  }

  function begin(id, opts) {
    cut();
    song = ctx.createGain();
    song.gain.setValueAtTime(1, ctx.currentTime);
    song.connect(gains.music);
    route.music = song;
    seq.play(parsed(id), opts);
  }

  function startWanted() {
    if (!seq) return;
    setLevel(gains.music, isMusicOn() ? MUSIC_LEVEL : 0);
    if (!isMusicOn() || !wanted || !songs[wanted]) {
      seq.stop();
      cut();
      playing = null;
      resumeAt = null;
      return;
    }
    if (playing === wanted) return;
    const from = resumeAt?.id === wanted ? resumeAt.pos : 0;
    resumeAt = null;
    begin(wanted, { loop: true, from });
    playing = wanted;
    plays++;
  }

  // Bei jeder Berührung oder Taste: beim ersten Mal entsteht der Ton, danach wird ein schlafender
  // Ton geweckt (iOS lässt ihn erst bei einer echten Berührung laufen, oder nach einem Anruf).
  function unlock() {
    if (ctx) {
      if (!running() && anyOn()) quiet(ctx.resume?.());
      return;
    }
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
    route.music = gains.music;
    route.sfx = gains.sfx;
    synth = createSynth(ctx, route);
    seq = createSequencer({
      now: () => ctx.currentTime,
      schedule: (voice, ev, when) => (voice === 'noise' ? synth.drum(ev.drum, when) : synth.note(voice, ev.freq, when, ev.dur)),
    });
    setTimer(() => seq.tick(), 25);
    if (anyOn()) quiet(ctx.resume?.());
    else quiet(ctx.suspend?.());
    startWanted();
  }

  function music(id) {
    if (id === wanted) return;
    wanted = id;
    // Andere Musik gewünscht (Kartenwechsel, Duell): Die gemerkte Stelle gilt nicht mehr.
    if (resumeAt?.id !== id) resumeAt = null;
    if (!jingle) startWanted();
  }

  function stopMusic() {
    wanted = null;
    seq?.stop();
    if (ctx) cut();
    playing = null;
    jingle = false;
    resumeAt = null;
  }

  // Ein Jingle unterbricht die Schleife; danach läuft sie an derselben Stelle weiter (mit derselben
  // kurzen Blende wie bei jedem Wechsel). Wird inzwischen andere Musik gewünscht oder die Musik
  // ausgeschaltet, beginnt die neue Musik wie sonst von vorn.
  function playJingle(id) {
    if (!seq || !running() || !isMusicOn() || !songs[id]) return;
    // Ein Jingle im Jingle behält die Stelle der Schleife, die der erste unterbrochen hat.
    if (playing) resumeAt = { id: playing, pos: seq.position() ?? 0 };
    jingle = true;
    playing = null;
    begin(id, {
      loop: false,
      onEnd: () => {
        jingle = false;
        startWanted();
      },
    });
  }

  function sfx(id) {
    if (!synth || !running() || !isSfxOn() || !SFX[id]) return;
    playSfx(synth, id, ctx.currentTime + 0.01);
  }

  // Sind Musik und Effekte beide aus, schläft der Ton (spart Akku); ist eines wieder an, wacht er auf.
  function sleepOrWake() {
    if (!ctx) return;
    if (!anyOn()) quiet(ctx.suspend?.());
    else if (!running()) quiet(ctx.resume?.());
  }

  function setMusicOn(on) {
    musicOverride = on;
    sleepOrWake();
    if (!ctx) return;
    setLevel(gains.music, on ? MUSIC_LEVEL : 0);
    if (on) startWanted();
    else {
      seq.stop();
      cut();
      playing = null;
      jingle = false;
      resumeAt = null;
    }
  }

  function setSfxOn(on) {
    sfxOverride = on;
    sleepOrWake();
  }

  // Ist die App verdeckt, pausiert der Ton (spart Akku); sichtbar läuft er weiter.
  function suspend() {
    quiet(ctx?.suspend?.());
  }
  function resume() {
    if (anyOn()) quiet(ctx?.resume?.());
  }

  const state = () => ({ unlocked: !!ctx, running: ctx?.state === 'running', playing, jingle, plays, musicOn: isMusicOn(), sfxOn: isSfxOn() });

  return { unlock, music, stopMusic, jingle: playJingle, sfx, setMusicOn, setSfxOn, suspend, resume, state };
}
