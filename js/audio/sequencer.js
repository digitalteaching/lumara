// Sequencer (Plan 6): plant die Noten eines Stücks mit kurzem Vorlauf ein (wie bei Web Audio üblich),
// damit nichts hakt, auch wenn ein Bild länger dauert. tick() wird regelmäßig aufgerufen. DOM-frei:
// Uhr (now) und Ausgabe (schedule) kommen von außen.

export function createSequencer({ now, schedule, lookahead = 0.12 }) {
  let cur = null; // { song, loop, start, next: { voice: { i, cycle } }, onEnd, ended }

  function play(song, { loop = true, at = now() + 0.05, onEnd = null } = {}) {
    const next = {};
    for (const v of Object.keys(song.voices)) next[v] = { i: 0, cycle: 0 };
    cur = { song, loop, start: at, next, onEnd, ended: false };
  }

  function stop() {
    cur = null;
  }

  function tick() {
    if (!cur) return;
    const { song, start } = cur;
    const until = now() + lookahead;
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

  return { play, stop, tick, get playing() { return cur !== null; } };
}
