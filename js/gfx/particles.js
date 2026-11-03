// Teilchen und Wetter (Design 5.3):
// - Bucht: Möwen und Gischt; Wald: Glühwürmchen und Blätter
// - Moor: Sporen, Blasen auf dem Moorwasser, Irrlichter; Dünen: Sandwehen und Glanzpunkte
// - Klippen: Windstreifen und kleine Wolken
// - Ruinen: Funken an den Zahnrädern und Dampf; See: Schnee und Nordlicht; Wiese: Sternschnuppen und Glimmen
// Die meisten leben in Bildkoordinaten und wandern mit halber Kamerageschwindigkeit (Parallaxe 0,5).
// Gischt, Blasen und Funken hängen an festen Stellen der Welt (anchors, Weltpixel). Das Nordlicht
// steht fest am Himmel und wandert nicht mit.
// Bei „Bewegung reduzieren“: höchstens ein Viertel, langsamer, kein Blinken; Nordlicht und Dampf stehen
// still, Sternschnuppen fallen keine. Glimmen und Funken bleiben bei höchstens 1 Hz. DOM-frei.

export const PARTICLE_LIMITS = {
  gull: 2, spray: 12, firefly: 14, leaf: 10, spore: 14, bubble: 8, wisp: 3, sand: 12, glint: 10, windstreak: 8, cloud: 4,
  spark: 10, steam: 6, snow: 16, aurora: 3, fallingstar: 2, glimmer: 12,
};

// Wie oft höchstens ein neues Teilchen dazukommt (ms)
const SPAWN_MS = {
  gull: 7000, spray: 260, firefly: 380, leaf: 650, spore: 450, bubble: 420, wisp: 2500, sand: 180, glint: 300, windstreak: 350, cloud: 3000,
  spark: 420, steam: 900, snow: 220, aurora: 2500, fallingstar: 3500, glimmer: 350,
};
const PARALLAX = 0.5;
const LEAF_COLORS = ['#7fae4a', '#c9a640', '#b7743a', '#5f8f3a'];
const ANCHORED = new Set(['spray', 'bubble', 'spark']);
const SKY = new Set(['aurora']); // fest am Himmel, ohne Parallaxe
const AURORA_COLORS = ['#7fe0a8', '#9be8c0', '#c49ad9'];

// shore ist die Kurzform für anchors.spray.
export function createParticles(kinds, { rng, reducedMotion = false, width = 240, height = 160, shore = [], anchors = {} } = {}) {
  const reduced = typeof reducedMotion === 'function' ? reducedMotion : () => reducedMotion;
  const anchorsOf = { ...anchors, spray: anchors.spray ?? shore };
  const list = [];
  const timers = Object.fromEntries(kinds.map(k => [k, SPAWN_MS[k] * rng.next()]));
  let last = null;

  const limit = k => {
    if (!reduced()) return PARTICLE_LIMITS[k];
    return k === 'fallingstar' ? 0 : Math.ceil(PARTICLE_LIMITS[k] / 4);
  };
  const count = k => list.reduce((n, p) => n + (p.kind === k ? 1 : 0), 0);
  const between = (a, b) => a + (b - a) * rng.next();

  function spawn(kind, cam) {
    if (kind === 'gull') {
      const fromLeft = rng.next() < 0.5;
      return { kind, x: fromLeft ? -6 : width + 6, y: between(8, height * 0.45), vx: (fromLeft ? 1 : -1) * between(18, 26), vy: between(-2, 2), age: 0, flapHz: between(2, 3), alpha: 0.85, size: 1, flap: false };
    }
    if (ANCHORED.has(kind)) {
      const seen = (anchorsOf[kind] ?? []).filter(([wx, wy]) => wx >= cam.x - 8 && wx <= cam.x + width + 8 && wy >= cam.y - 8 && wy <= cam.y + height + 8);
      if (!seen.length) return null;
      const [wx, wy] = seen[Math.floor(rng.next() * seen.length)];
      if (kind === 'bubble') return { kind, wx: wx + between(-5, 5), wy: wy + between(-2, 4), rise: between(2, 4), age: 0, life: between(600, 1200), alpha: 0, size: 1, color: '#7fd0c0' };
      if (kind === 'spark') {
        // kurz und hell, steigt ein Stück auf; leuchtet höchstens einmal pro Sekunde auf
        const life = between(1000, 1500);
        return { kind, wx: wx + between(-5, 5), wy: wy + between(-3, 3), rise: between(3, 5), age: 0, life, blinkHz: 1000 / life, alpha: 0, size: 1, color: rng.next() < 0.5 ? '#ffe08a' : '#fffaf0' };
      }
      return { kind, wx: wx + between(-6, 6), wy: wy + between(-6, 6), age: 0, life: between(500, 1100), alpha: 0, size: 1, color: '#fbfdff' };
    }
    if (kind === 'spore') {
      return { kind, x: between(0, width), y: between(height * 0.2, height), vy: -between(3, 7), swayHz: between(0.2, 0.4), swayPx: between(2, 4), phase: between(0, Math.PI * 2), sway: 0, age: 0, life: between(4000, 7000), alpha: 0, size: 1, color: rng.next() < 0.5 ? '#d6e27a' : '#b9d86a' };
    }
    if (kind === 'wisp') {
      return { kind, x: between(10, width - 10), y: between(20, height - 20), age: 0, life: between(8000, 14000), blinkHz: between(0.3, 0.8), phase: between(0, Math.PI * 2), drift: between(0, Math.PI * 2), alpha: 0, size: 2, color: '#a8f0dc' };
    }
    if (kind === 'sand') {
      return { kind, x: width + 4, y: between(10, height - 6), vx: -between(60, 95), age: 0, alpha: 0.6, size: Math.round(between(2, 4)), color: '#f6e7c2' };
    }
    if (kind === 'glint') {
      const life = between(500, 800);
      return { kind, x: between(4, width - 4), y: between(30, height - 4), age: 0, life, blinkHz: 1000 / life, alpha: 0, size: 1, color: '#fffaf0' };
    }
    if (kind === 'windstreak') {
      return { kind, x: width + 10, y: between(6, height - 6), vx: -between(90, 140), age: 0, alpha: 0.5, size: Math.round(between(6, 10)), color: '#eef6ff' };
    }
    if (kind === 'cloud') {
      return { kind, x: between(-10, width), y: between(8, height - 12), vx: -between(3, 6), age: 0, life: between(20000, 30000), alpha: 0, size: 10, color: '#ffffff' };
    }
    if (kind === 'steam') {
      return { kind, x: between(0, width), y: between(height * 0.4, height), vy: -between(3, 6), phase: between(0, Math.PI * 2), age: 0, life: between(3500, 5500), alpha: 0, size: 3, color: '#eef2f8' };
    }
    if (kind === 'snow') {
      return { kind, x: between(-8, width + 8), y: -3, vy: between(8, 14), swayHz: between(0.2, 0.45), swayPx: between(2, 5), phase: between(0, Math.PI * 2), sway: 0, age: 0, alpha: 0.9, size: rng.next() < 0.3 ? 2 : 1, color: '#fffaf0' };
    }
    if (kind === 'aurora') {
      return { kind, x: between(-30, width - 50), y: between(4, 28), len: Math.round(between(70, 120)), waveHz: between(0.05, 0.12), phase: between(0, Math.PI * 2), age: 0, life: between(20000, 32000), alpha: 0, size: 1, color: AURORA_COLORS[Math.floor(rng.next() * AURORA_COLORS.length)] };
    }
    if (kind === 'fallingstar') {
      return { kind, x: between(width * 0.2, width), y: between(2, height * 0.35), vx: -between(110, 150), vy: between(45, 65), age: 0, life: between(450, 650), alpha: 0, size: 4, color: '#fffaf0' };
    }
    if (kind === 'glimmer') {
      return { kind, x: between(2, width - 2), y: between(height * 0.25, height - 2), age: 0, life: between(2500, 4500), blinkHz: between(0.4, 0.9), phase: between(0, Math.PI * 2), alpha: 0, size: 1, color: '#ffe08a' };
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
    if (p.kind === 'bubble') {
      // steigt ein wenig auf und platzt
      const f = p.age / (p.life * (still ? 2 : 1));
      p.x = p.wx - cam.x;
      p.y = p.wy - cam.y - p.rise * Math.min(1, f);
      p.alpha = still ? 0.6 : f < 0.85 ? 0.8 : 0.4;
      p.size = !still && f >= 0.85 ? 2 : 1; // kurz vor dem Platzen etwas größer
      return f < 1;
    }
    if (p.kind === 'spore') {
      p.y += p.vy * s * slow;
      p.sway = still ? 0 : Math.sin((p.age / 1000) * p.swayHz * Math.PI * 2 + p.phase) * p.swayPx;
      p.alpha = 0.75 * Math.max(0, Math.min(1, p.age / 900, (p.life - p.age) / 900));
      return p.age < p.life && p.y > -4;
    }
    if (p.kind === 'wisp') {
      // Irrlicht: treibt langsam und glimmt höchstens einmal pro Sekunde
      p.drift += s * 0.4 * slow;
      p.x += Math.cos(p.drift) * 5 * s * slow;
      p.y += Math.sin(p.drift * 0.7) * 3 * s * slow;
      const fade = Math.max(0, Math.min(1, p.age / 1500, (p.life - p.age) / 1500));
      const glow = still ? 0.7 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin((p.age / 1000) * p.blinkHz * Math.PI * 2 + p.phase));
      p.alpha = fade * glow;
      return p.age < p.life;
    }
    if (p.kind === 'sand' || p.kind === 'windstreak') {
      p.x += p.vx * s * slow;
      return p.x > -p.size - 4;
    }
    if (p.kind === 'glint') {
      // Ein kurzes Aufblitzen; bei „Bewegung reduzieren“ ein langsames, sanftes Aufleuchten
      const f = p.age / (p.life * (still ? 4 : 1));
      p.alpha = (still ? 0.5 : 1) * Math.sin(Math.min(1, f) * Math.PI);
      return f < 1;
    }
    if (p.kind === 'spark') {
      const f = p.age / (p.life * (still ? 2 : 1));
      p.x = p.wx - cam.x;
      p.y = p.wy - cam.y - (still ? 0 : p.rise * Math.min(1, f));
      p.alpha = (still ? 0.6 : 1) * Math.sin(Math.min(1, f) * Math.PI);
      return f < 1;
    }
    if (p.kind === 'steam') {
      // steigt langsam auf; bei „Bewegung reduzieren“ steht der Dampf still
      if (!still) p.y += p.vy * s;
      p.alpha = 0.3 * Math.max(0, Math.min(1, p.age / 1200, (p.life - p.age) / 1200));
      return p.age < p.life && p.y > -6;
    }
    if (p.kind === 'snow') {
      p.y += p.vy * s * slow;
      p.sway = still ? 0 : Math.sin((p.age / 1000) * p.swayHz * Math.PI * 2 + p.phase) * p.swayPx;
      return p.y < height + 4;
    }
    if (p.kind === 'aurora') {
      // lange weiche Bänder, die sich langsam wellen; bei „Bewegung reduzieren“ stehen sie still
      if (!still) p.phase += s * p.waveHz * Math.PI * 2;
      p.alpha = 0.32 * Math.max(0, Math.min(1, p.age / 3000, (p.life - p.age) / 3000));
      return p.age < p.life;
    }
    if (p.kind === 'fallingstar') {
      p.x += p.vx * s;
      p.y += p.vy * s;
      const f = p.age / p.life;
      p.alpha = Math.sin(Math.min(1, f) * Math.PI);
      return f < 1;
    }
    if (p.kind === 'glimmer') {
      const fade = Math.max(0, Math.min(1, p.age / 800, (p.life - p.age) / 800));
      const glow = still ? 0.6 : 0.3 + 0.7 * (0.5 + 0.5 * Math.sin((p.age / 1000) * p.blinkHz * Math.PI * 2 + p.phase));
      p.alpha = fade * glow;
      return p.age < p.life;
    }
    if (p.kind === 'cloud') {
      if (!still) p.x += p.vx * s; // bei „Bewegung reduzieren“ stehen die Wolken (Plan 3b)
      p.alpha = 0.35 * Math.max(0, Math.min(1, p.age / 2000, (p.life - p.age) / 2000));
      return p.age < p.life && p.x > -14;
    }
    return false;
  }

  return {
    update(dt, cam) {
      // Parallaxe: Bildteilchen wandern mit halber Kamerabewegung mit.
      if (last) {
        const dx = (cam.x - last.x) * PARALLAX, dy = (cam.y - last.y) * PARALLAX;
        for (const p of list) {
          if (ANCHORED.has(p.kind) || SKY.has(p.kind)) continue;
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
