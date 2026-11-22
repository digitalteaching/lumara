// Sequencer (Plan 6): plant die Noten eines Stücks mit kurzem Vorlauf ein (wie bei Web Audio üblich),
// damit nichts hakt, auch wenn ein Bild länger dauert. tick() wird regelmäßig aufgerufen. DOM-frei:
// Uhr (now) und Ausgabe (schedule) kommen von außen.

export function createSequencer({ now, schedule, lookahead = 0.12 }) {
  let cur = null; // { song, loop, start, from, next: { voice: { i, cycle } }, carry: [angefangene Töne bei from], onEnd, ended }

  // from: Sekunden im Stück, ab denen es zur Zeit at weitergeht (nach einem Jingle). Jede Stimme beginnt
  // beim ersten Ereignis ab from; eine Note, die bei from noch klingt (außer noise), wird mit der Restlänge
  // (mind. 0,12 s) bei at nachgeholt.
  function play(song, { loop = true, at = now() + 0.05, from = 0, onEnd = null } = {}) {
    const skip = loop && song.length > 0 ? Math.max(0, from) % song.length : Math.max(0, from);
    const next = {};
    const carry = []; // Töne, die bei from gerade klangen: Rest bei at (Kopie, Song bleibt unverändert)
    for (const [v, events] of Object.entries(song.voices)) {
      if (skip > 0 && v !== 'noise') {
        const ev = events.find(e => e.t < skip && skip < e.t + e.dur);
        if (ev && ev.t + ev.dur - skip >= 0.12) carry.push([v, { ...ev, dur: ev.t + ev.dur - skip }]);
      }
      const i = events.findIndex(ev => ev.t >= skip);
      next[v] = { i: i < 0 ? events.length : i, cycle: 0 };
    }
    cur = { song, loop, start: at - skip, from: skip, next, carry, onEnd, ended: false };
  }

  // Sekunden in der laufenden Schleife (modulo Länge), im Vorlauf die Stelle, an der es losgeht;
  // null, wenn keine Schleife läuft.
  function position() {
    if (!cur?.loop || !(cur.song.length > 0)) return null;
    return Math.max(now() - cur.start, cur.from) % cur.song.length;
  }

  function stop() {
    cur = null;
  }

  function tick() {
    if (!cur) return;
    const { song, start } = cur;
    const until = now() + lookahead;
    if (cur.carry.length && cur.start + cur.from <= until) {
      for (const [voice, ev] of cur.carry) schedule(voice, ev, cur.start + cur.from);
      cur.carry = [];
    }
    for (const [voice, events] of Object.entries(song.voices)) {
      const pos = cur.next[voice];
      while (events.length) {
        if (pos.i >= events.length) {
          if (!cur.loop) break;
          pos.i = 0;
          pos.cycle++;
        }
        const ev = events[pos.i];
        const when = start + pos.cycle * song.length + ev.t;
        if (when > until) break;
        schedule(voice, ev, when);
        pos.i++;
      }
    }
    if (!cur.loop && !cur.ended && now() >= start + song.length) {
      cur.ended = true;
      const done = cur.onEnd;
      cur = null;
      done?.();
    }
  }

  return { play, stop, tick, position, get playing() { return cur !== null; } };
}
