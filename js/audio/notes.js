// Notenschrift der Musik (Design 15, Plan 6). Eine Stimme ist eine Zeichenkette aus Tokens:
//   c4/8     Note c in Oktave 4 als Achtel      g#3/4.  punktierte Viertel   bb3/2  b-Note
//   -/2      halbe Pause                         k/8 s/8 h/16  Rauschen: tief, hell, sehr kurz
//   |        Taktstrich (wird übersprungen, hilft beim Lesen)
// Längen 1, 2, 4, 8, 16 (in Vierteln: 4, 2, 1, ½, ¼), ein Punkt verlängert um die Hälfte. Die
// Zeiten sind Sekunden; eine Viertel dauert 60 / tempo. DOM-frei.

const STEPS = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 };
const BEATS = { 1: 4, 2: 2, 4: 1, 8: 0.5, 16: 0.25 };
const DRUMS = new Set(['k', 's', 'h']);

// Gleichstufig, a4 = 440 Hz. null für unbekannte Namen.
export function noteFreq(name) {
  const m = /^([a-g])(#|b)?(\d)$/.exec(name);
  if (!m) return null;
  const semi = STEPS[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0);
  const midi = 12 * (Number(m[3]) + 1) + semi;
  return 440 * 2 ** ((midi - 69) / 12);
}

function beatsOf(len) {
  const m = /^(1|2|4|8|16)(\.)?$/.exec(len);
  if (!m) return null;
  return BEATS[m[1]] * (m[2] ? 1.5 : 1);
}

export function parseVoice(text, tempo) {
  const beat = 60 / tempo;
  const events = [];
  let t = 0;
  text.trim().split(/\s+/).forEach((tok, i) => {
    if (tok === '|' || tok === '') return;
    const [what, len] = tok.split('/');
    const beats = len === undefined ? null : beatsOf(len);
    const freq = what === '-' || DRUMS.has(what) ? null : noteFreq(what);
    if (beats === null || (what !== '-' && !DRUMS.has(what) && freq === null)) {
      throw new Error(`Unknown note token "${tok}" at position ${i + 1}`);
    }
    const dur = beats * beat;
    if (what !== '-') events.push(DRUMS.has(what) ? { t, dur, drum: what } : { t, dur, freq });
    t += dur;
  });
  return { events, length: t };
}

// Ein Stück: { tempo, voices: { sq1, sq2, tri, noise } }. Alle Stimmen müssen gleich lang sein.
export function parseSong(song) {
  const voices = {};
  let length = null;
  for (const [name, text] of Object.entries(song.voices)) {
    const v = parseVoice(text, song.tempo);
    if (length !== null && Math.abs(v.length - length) > 1e-6) {
      throw new Error(`Voices must have the same length: ${name} is ${v.length.toFixed(3)} s, not ${length.toFixed(3)} s`);
    }
    length = v.length;
    voices[name] = v.events;
  }
  return { tempo: song.tempo, voices, length: length ?? 0 };
}
