// Klangerzeugung wie bei einem alten Handheld (Design 15): zwei Rechteck-Stimmen, eine Dreieck-Stimme
// und Rauschen. Jede Note hat eine kurze Hüllkurve (5 ms an, 30 ms aus), damit nichts knackt.
// Bekommt den AudioContext und die Ausgänge (music, sfx) von außen.

const VOICE = { sq1: ['square', 0.2], sq2: ['square', 0.12], tri: ['triangle', 0.32] };
const DRUM = { k: { dur: 0.14, rate: 0.35, level: 0.55 }, s: { dur: 0.1, rate: 1, level: 0.35 }, h: { dur: 0.035, rate: 1.6, level: 0.2 } };
const ATTACK = 0.005;
const RELEASE = 0.03;

export function createSynth(ctx, out) {
  // Eine Sekunde weißes Rauschen, einmal erzeugt und immer wieder abgespielt.
  const noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;

  function envelope(dest, when, dur, level) {
    const g = ctx.createGain();
    const end = when + Math.max(dur, ATTACK + RELEASE);
    g.gain.setValueAtTime(0, when);
    g.gain.linearRampToValueAtTime(level, when + ATTACK);
    g.gain.setValueAtTime(level, Math.max(when + ATTACK, end - RELEASE));
    g.gain.linearRampToValueAtTime(0, end);
    g.connect(dest);
    return { g, end };
  }

  function note(voice, freq, when, dur, level = VOICE[voice]?.[1] ?? 0.2, dest = out.music) {
    const [type] = VOICE[voice] ?? ['square'];
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, when);
    const { g, end } = envelope(dest, when, dur, level);
    osc.connect(g);
    osc.start(when);
    osc.stop(end + 0.01);
  }

  // channel: 'music' (Schlagzeug der Stücke) oder 'sfx' (Rauschen in Effekten).
  function drum(kind, when, { channel = 'music', scale = 1 } = {}) {
    const d = DRUM[kind] ?? DRUM.s;
    const dest = channel === 'sfx' ? out.sfx : out.music;
    const src = ctx.createBufferSource();
    src.buffer = noise;
    src.playbackRate.setValueAtTime(d.rate, when);
    const { g, end } = envelope(dest, when, d.dur, d.level * scale);
    src.connect(g);
    src.start(when);
    src.stop(end + 0.01);
  }

  // Für Effekte: ein Ton, der von einer Frequenz zur anderen gleitet.
  function sweep({ type = 'square', from, to = from, when, dur, level = 0.2, dest = out.sfx }) {
    const osc = ctx.createOscillator();
    osc.type = type;
    osc.frequency.setValueAtTime(from, when);
    if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, when + dur);
    const { g, end } = envelope(dest, when, dur, level);
    osc.connect(g);
    osc.start(when);
    osc.stop(end + 0.01);
  }

  return { note, drum, sweep };
}
