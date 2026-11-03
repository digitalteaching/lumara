// Teilchen und Wetter (Design 5.3): Möwen und Gischt in der Bucht, Glühwürmchen und Blätter im
// Wald. Möwen, Blätter und Glühwürmchen leben in Bildkoordinaten und wandern mit halber Kamera-
// geschwindigkeit (Parallaxe 0,5). Gischt hängt an festen Uferstellen der Welt.
// Bei „Bewegung reduzieren“: höchstens ein Viertel, langsamer, kein Blinken. DOM-frei.

export const PARTICLE_LIMITS = { gull: 2, spray: 12, firefly: 14, leaf: 10 };

// Wie oft höchstens ein neues Teilchen dazukommt (ms)
const SPAWN_MS = { gull: 7000, spray: 260, firefly: 380, leaf: 650 };
const PARALLAX = 0.5;
const LEAF_COLORS = ['#7fae4a', '#c9a640', '#b7743a', '#5f8f3a'];

export function createParticles(kinds, { rng, reducedMotion = false, width = 240, height = 160, shore = [] } = {}) {
  const reduced = typeof reducedMotion === 'function' ? reducedMotion : () => reducedMotion;
  const list = [];
  const timers = Object.fromEntries(kinds.map(k => [k, SPAWN_MS[k] * rng.next()]));
  let last = null;

  const limit = k => (reduced() ? Math.ceil(PARTICLE_LIMITS[k] / 4) : PARTICLE_LIMITS[k]);
  const count = k => list.reduce((n, p) => n + (p.kind === k ? 1 : 0), 0);
  const between = (a, b) => a + (b - a) * rng.next();

  function spawn(kind, cam) {
    if (kind === 'gull') {
      const fromLeft = rng.next() < 0.5;
      return { kind, x: fromLeft ? -6 : width + 6, y: between(8, height * 0.45), vx: (fromLeft ? 1 : -1) * between(18, 26), vy: between(-2, 2), age: 0, flapHz: between(2, 3), alpha: 0.85, size: 1, flap: false };
    }
    if (kind === 'spray') {
      const seen = shore.filter(([wx, wy]) => wx >= cam.x - 8 && wx <= cam.x + width + 8 && wy >= cam.y - 8 && wy <= cam.y + height + 8);
      if (!seen.length) return null;
      const [wx, wy] = seen[Math.floor(rng.next() * seen.length)];
      return { kind, wx: wx + between(-6, 6), wy: wy + between(-6, 6), age: 0, life: between(500, 1100), alpha: 0, size: 1, color: '#fbfdff' };
    }
    if (kind === 'firefly') {
      return { kind, x: between(0, width), y: between(0, height), age: 0, life: between(6000, 12000), blinkHz: between(0.4, 1.2), phase: between(0, Math.PI * 2), drift: between(0, Math.PI * 2), alpha: 0, size: 1, color: '#fff2a0' };
    }
    if (kind === 'leaf') {
      return { kind, x: between(0, width), y: -3, vy: between(9, 15), swayHz: between(0.25, 0.5), swayPx: between(4, 9), phase: between(0, Math.PI * 2), sway: 0, age: 0, alpha: 0.9, size: 2, color: LEAF_COLORS[Math.floor(rng.next() * LEAF_COLORS.length)] };
    }
    return null;
  }

  function move(p, dt, cam, slow, still) {
    const s = dt / 1000;
    p.age += dt;
    if (p.kind === 'gull') {
      p.x += p.vx * s * slow;
      p.y += p.vy * s * slow;
      p.flap = !still && Math.sin((p.age / 1000) * p.flapHz * Math.PI * 2) > 0;
      return p.x > -10 && p.x < width + 10;
    }
    if (p.kind === 'spray') {
      p.x = p.wx - cam.x;
      p.y = p.wy - cam.y;
      const f = p.age / (p.life * (still ? 2 : 1));
      p.alpha = still ? 0.7 : Math.sin(Math.min(1, f) * Math.PI);
      return f < 1;
    }
    if (p.kind === 'firefly') {
      p.drift += s * 0.6 * slow;
      p.x += Math.cos(p.drift) * 4 * s * slow;
      p.y += Math.sin(p.drift * 1.3) * 3 * s * slow;
      const fade = Math.min(1, p.age / 800, (p.life - p.age) / 800);
      const glow = still ? 0.8 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin((p.age / 1000) * p.blinkHz * Math.PI * 2 + p.phase));
      p.alpha = Math.max(0, fade) * glow;
      return p.age < p.life;
    }
    if (p.kind === 'leaf') {
      // Blätter fallen gerade nach unten, das Taumeln (sway) kommt beim Zeichnen dazu.
      p.y += p.vy * s * slow;
      p.sway = still ? 0 : Math.sin((p.age / 1000) * p.swayHz * Math.PI * 2 + p.phase) * p.swayPx;
      return p.y < height + 4;
    }
    return false;
  }

  return {
    update(dt, cam) {
      // Parallaxe: Bildteilchen wandern mit halber Kamerabewegung mit.
      if (last) {
        const dx = (cam.x - last.x) * PARALLAX, dy = (cam.y - last.y) * PARALLAX;
        for (const p of list) {
          if (p.kind === 'spray') continue;
          p.x -= dx;
          p.y -= dy;
        }
      }
      last = { x: cam.x, y: cam.y };

      const still = reduced();
      const slow = still ? 0.35 : 1;
      for (let i = list.length - 1; i >= 0; i--) if (!move(list[i], dt, cam, slow, still)) list.splice(i, 1);

      for (const k of kinds) {
        // Zu viele, etwa nach dem Umschalten auf „Bewegung reduzieren“: die ältesten gehen.
        let extra = count(k) - limit(k);
        for (let i = 0; i < list.length && extra > 0; i++) {
          if (list[i].kind !== k) continue;
          list.splice(i--, 1);
          extra--;
        }
        timers[k] += dt;
        if (timers[k] < SPAWN_MS[k] || count(k) >= limit(k)) continue;
        timers[k] = 0;
        const p = spawn(k, cam);
        if (p) {
          move(p, 0, cam, slow, still);
          list.push(p);
        }
      }
    },
    each(fn) {
      for (const p of list) fn(p);
    },
  };
}
