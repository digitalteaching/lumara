// Eingabe: Tastatur und Steuerkreuz werden zu logischen Knöpfen.
// keyToButton und dpadDirection sind rein und in Node getestet.

const KEYS = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  w: 'up', s: 'down', a: 'left', d: 'right',
  Enter: 'a', ' ': 'a',
  Escape: 'b', Backspace: 'b',
  m: 'menu',
};

export const BUTTONS = ['up', 'down', 'left', 'right', 'a', 'b', 'menu'];
const DIRS = new Set(['up', 'down', 'left', 'right']);

export function keyToButton(key, inTextField) {
  if (inTextField) return null;
  const k = key.length === 1 ? key.toLowerCase() : key;
  return KEYS[k] ?? null;
}

export function dpadDirection(dx, dy, deadzone) {
  if (Math.hypot(dx, dy) < deadzone) return null;
  if (Math.abs(dx) >= Math.abs(dy)) return dx > 0 ? 'right' : 'left';
  return dy > 0 ? 'down' : 'up';
}

function isTextTarget(el) {
  if (!el || !el.tagName) return false;
  const tag = el.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

export function createInput({ target = window } = {}) {
  const holds = new Map(BUTTONS.map(b => [b, new Set()]));
  const keySource = new Map(); // event.code → button
  const listeners = new Map(BUTTONS.map(b => [b, new Set()]));
  let pressed = new Set();
  let dirOrder = [];

  function down(btn, src) {
    const set = holds.get(btn);
    const wasHeld = set.size > 0;
    set.add(src);
    if (wasHeld) return;
    pressed.add(btn);
    if (DIRS.has(btn)) dirOrder = [...dirOrder.filter(d => d !== btn), btn];
    for (const fn of [...listeners.get(btn)]) fn();
  }

  function up(btn, src) {
    const set = holds.get(btn);
    set.delete(src);
    if (set.size === 0 && DIRS.has(btn)) dirOrder = dirOrder.filter(d => d !== btn);
  }

  function releaseAll() {
    for (const set of holds.values()) set.clear();
    keySource.clear();
    dirOrder = [];
  }

  target.addEventListener('keydown', e => {
    const el = e.target;
    // Ein fokussierter Knopf reagiert selbst auf Enter und Leertaste.
    const own = isTextTarget(el) || (el?.tagName === 'BUTTON' && (e.key === 'Enter' || e.key === ' '));
    const btn = keyToButton(e.key, own);
    if (!btn) return;
    e.preventDefault();
    if (e.repeat) return;
    keySource.set(e.code, btn);
    down(btn, `key:${e.code}`);
  });

  target.addEventListener('keyup', e => {
    const btn = keySource.get(e.code);
    if (!btn) return;
    keySource.delete(e.code);
    up(btn, `key:${e.code}`);
  });

  target.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) releaseAll();
  });

  return {
    dir() {
      for (let i = dirOrder.length - 1; i >= 0; i--) if (holds.get(dirOrder[i]).size) return dirOrder[i];
      return null;
    },
    held: btn => holds.get(btn).size > 0,
    pressed: btn => pressed.has(btn),
    on(btn, fn) {
      listeners.get(btn).add(fn);
      return () => listeners.get(btn).delete(fn);
    },
    consume() {
      pressed = new Set();
    },
    endFrame() {
      pressed = new Set();
    },
    setVirtual(btn, isDown) {
      if (isDown) down(btn, `pad:${btn}`);
      else up(btn, `pad:${btn}`);
    },
    releaseAll,
  };
}
