// Fragen (js/ui/dialog.js choose) mit einem kleinen DOM im Speicher: Kinder tippen oft schnell durch
// Gesprächszeilen, und die Frage danach erscheint genau unter dem Finger. Fragen nehmen deshalb länger
// nichts an als andere Knöpfe (CHOICE_FRESH_MS), und ein Finger, der beim Erscheinen schon auflag, wählt
// nie eine Antwort. Eigene Datei, eigener Prozess: document, window, Node und performance.now gelten nur
// hier.

import { test } from 'node:test';
import assert from 'node:assert/strict';

class FakeNode {
  constructor(tag = '#text', text = '') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.parent = null;
    this.className = '';
    this.dataset = {};
    this.style = {};
    this.attrs = {};
    this.text = text;
    this.listeners = [];
    const node = this;
    this.classList = {
      toggle(c, on) {
        const set = new Set(node.className.split(' ').filter(Boolean));
        if (on) set.add(c);
        else set.delete(c);
        node.className = [...set].join(' ');
      },
      contains: c => node.className.split(' ').includes(c),
    };
  }
  append(...nodes) {
    for (const n of nodes) {
      const c = n instanceof FakeNode ? n : new FakeNode('#text', String(n));
      c.remove();
      c.parent = this;
      this.children.push(c);
    }
  }
  remove() {
    if (this.parent) this.parent.children = this.parent.children.filter(c => c !== this);
    this.parent = null;
  }
  setAttribute(k, v) {
    this.attrs[k] = String(v);
  }
  addEventListener(type, fn, opt) {
    this.listeners.push({ type, fn, capture: opt === true || !!opt?.capture });
  }
  removeEventListener(type, fn, opt) {
    const capture = opt === true || !!opt?.capture;
    this.listeners = this.listeners.filter(l => l.type !== type || l.fn !== fn || l.capture !== capture);
  }
  *descendants() {
    for (const c of this.children) {
      yield c;
      yield* c.descendants();
    }
  }
  get textContent() {
    return this.tagName === '#TEXT' ? this.text : this.children.map(c => c.textContent).join('');
  }
}
globalThis.Node = FakeNode;
globalThis.document = { createElement: tag => new FakeNode(tag) };
// Das Fenster ist die Wurzel: Jedes Zeigerereignis kommt bei ihm vorbei (wie in main.js trackPointers).
const fakeWindow = new FakeNode('window');
const body = new FakeNode('body');
fakeWindow.append(body);
globalThis.window = fakeWindow;

let clock = 1000;
performance.now = () => clock;

const { choose } = await import('../js/ui/dialog.js');
const { CHOICE_FRESH_MS, FRESH_MS, trackPointers, pointerHeld } = await import('../js/ui/freshGuard.js');
trackPointers(fakeWindow);

// Ein Ereignis wie im Browser: erst Capture von außen nach innen, dann das Ziel, dann Bubble.
// detail: 1 bei Finger oder Maus, 0 bei einem Klick per Tastatur (Enter auf einem Knopf).
// isPrimary: der erste Finger (ein zweiter, solange einer liegt, ist es nicht).
function dispatch(target, type, { detail = 1, pointerId = 1, isPrimary = true } = {}) {
  const path = [];
  for (let n = target.parent; n; n = n.parent) path.unshift(n);
  const e = { type, target, detail, pointerId, isPrimary, stopped: false, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, stopPropagation() { this.stopped = true; } };
  const run = (n, ok) => {
    for (const l of [...n.listeners]) if (l.type === type && ok(l)) l.fn.call(n, e);
  };
  for (const n of path) {
    run(n, l => l.capture);
    if (e.stopped) return e;
  }
  run(target, () => true);
  for (const n of [...path].reverse()) {
    if (e.stopped) return e;
    run(n, l => !l.capture);
  }
  return e;
}
// Ein ganzer Tipp: Finger auf (pointerdown), los (pointerup) und click. Jeder Finger hat eine neue Nummer.
let fingers = 10;
const tap = btn => {
  const pointerId = fingers++;
  dispatch(btn, 'pointerdown', { pointerId });
  dispatch(btn, 'pointerup', { pointerId });
  dispatch(btn, 'click');
};

const settle = () => new Promise(r => setImmediate(r));

// Eine Frage mit Ja und Nein, erschienen bei clock = 1000, in einem eigenen Panel im Fenster.
function ask(opts = {}) {
  clock = 1000;
  const keys = { up: new Set(), down: new Set(), a: new Set(), b: new Set() };
  const game = {
    mode: 'walk',
    panel: new FakeNode('div'),
    input: {
      on(btn, fn) {
        keys[btn].add(fn);
        return () => keys[btn].delete(fn);
      },
      consume() {},
    },
  };
  for (const old of [...body.children]) old.remove(); // eine offene Frage von vorher stört nicht
  body.append(game.panel);
  const result = { answer: undefined };
  choose(game, 'Tauschen?', ['Ja', 'Nein'], { cancelIndex: 1, ...opts }).then(i => (result.answer = i));
  const box = game.panel.children[0];
  const buttons = [...box.descendants()].filter(n => n.tagName === 'BUTTON');
  const press = btn => [...keys[btn]].forEach(fn => fn());
  return { game, box, buttons, press, result, open: () => game.panel.children.includes(box) };
}

test('Fragen schützen 650 ms lang, alle anderen Knöpfe weiter 350 ms', () => {
  assert.equal(CHOICE_FRESH_MS, 650);
  assert.equal(FRESH_MS, 350);
});

test('Ein Tipp 400 ms nach dem Erscheinen wählt nichts, einer nach 700 ms schon', async () => {
  const q = ask();
  assert.equal(q.buttons.length, 2);
  clock = 1400;
  tap(q.buttons[0]);
  await settle();
  assert.equal(q.result.answer, undefined, 'nach 400 ms noch nichts gewählt');
  assert.ok(q.open());
  clock = 1700;
  tap(q.buttons[0]);
  await settle();
  assert.equal(q.result.answer, 0);
  assert.equal(q.open(), false);
  assert.equal(q.game.mode, 'walk');
});

test('A nach 400 ms wählt nichts, A nach 700 ms die vorausgewählte Antwort', async () => {
  const q = ask({ selected: 1 });
  clock = 1400;
  q.press('a');
  await settle();
  assert.equal(q.result.answer, undefined, 'nach 400 ms noch nichts gewählt');
  clock = 1700;
  q.press('a');
  await settle();
  assert.equal(q.result.answer, 1);
});

test('B bricht weiterhin sofort ab (Abbrechen ist sicher)', async () => {
  const q = ask({ cancelIndex: 1 });
  q.press('b');
  await settle();
  assert.equal(q.result.answer, 1);
  assert.equal(q.open(), false);
});

// Der letzte Tipp auf eine Gesprächszeile beginnt (pointerdown), bevor die Frage erscheint. Bleibt der
// Finger länger liegen als die Schutzzeit, käme sein click sonst auf der Antwort darunter an.
test('Ein Finger, der beim Erscheinen schon lag, wählt nie eine Antwort, auch nach der Schutzzeit', async () => {
  clock = 900;
  const line = new FakeNode('div'); // die letzte Gesprächszeile
  body.append(line);
  dispatch(line, 'pointerdown', { pointerId: 7 });
  line.remove(); // say() endet, die Frage erscheint unter dem Finger
  assert.equal(pointerHeld(), true);
  const q = ask();
  clock = 1800; // der Finger lag 800 ms, jetzt geht er über „Ja“ hoch
  dispatch(q.buttons[0], 'pointerup', { pointerId: 7 });
  const e = dispatch(q.buttons[0], 'click');
  await settle();
  assert.equal(pointerHeld(), false);
  assert.equal(q.result.answer, undefined, 'nichts gewählt');
  assert.ok(e.stopped && e.defaultPrevented, 'der Klick kommt beim Knopf nicht an');
  clock = 1900; // ein neuer Tipp zählt
  tap(q.buttons[1]);
  await settle();
  assert.equal(q.result.answer, 1);
});

// VoiceOver und Schaltersteuerung lösen einen click ohne jedes Zeigerereignis aus.
test('Ein Klick ohne Finger (Hilfstechnik) wählt nach der Schutzzeit', async () => {
  const early = ask();
  clock = 1400;
  dispatch(early.buttons[0], 'click');
  await settle();
  assert.equal(early.result.answer, undefined, 'in der Schutzzeit nicht');
  const q = ask();
  assert.equal(pointerHeld(), false);
  clock = 1700;
  dispatch(q.buttons[1], 'click'); // detail 1, kein pointerdown
  await settle();
  assert.equal(q.result.answer, 1);
});

// iOS verliert manches pointerup, wenn das Ziel beim Aufsetzen verschwindet. Danach darf keine Frage
// für immer glauben, ein Finger liege noch (sonst wiese sie jeden Klick von Hilfstechnik ab).
test('Ein verlorenes pointerup hängt nicht fest: Der nächste erste Finger löst es, eine spätere Frage nimmt Klicks ohne Finger an', async () => {
  clock = 500;
  const line = new FakeNode('div');
  body.append(line);
  dispatch(line, 'pointerdown', { pointerId: 21 });
  line.remove(); // sein pointerup kommt nie an
  assert.equal(pointerHeld(), true);
  const canvas = new FakeNode('canvas');
  body.append(canvas);
  dispatch(canvas, 'pointerdown', { pointerId: 22 }); // ein neuer erster Finger
  dispatch(canvas, 'pointerup', { pointerId: 22 });
  assert.equal(pointerHeld(), false, 'nur Finger 22 lag, und der ist los');
  const q = ask();
  clock = 1700;
  dispatch(q.buttons[0], 'click'); // ohne Zeigerereignis (VoiceOver)
  await settle();
  assert.equal(q.result.answer, 0);
});

test('Der Daumen liegt auf dem Steuerkreuz, ein zweiter Finger tippt die Antwort: der Klick zählt', async () => {
  clock = 900;
  const dpad = new FakeNode('div');
  body.append(dpad);
  dispatch(dpad, 'pointerdown', { pointerId: 31 }); // erster Finger, bleibt liegen
  const q = ask(); // die Frage erscheint, während der Daumen liegt
  body.append(dpad);
  assert.equal(pointerHeld(), true);
  clock = 1700;
  dispatch(q.buttons[1], 'pointerdown', { pointerId: 32, isPrimary: false });
  dispatch(q.buttons[1], 'pointerup', { pointerId: 32, isPrimary: false });
  dispatch(q.buttons[1], 'click');
  await settle();
  assert.equal(q.result.answer, 1);
  assert.equal(pointerHeld(), true, 'der Daumen liegt noch');
  dispatch(dpad, 'pointerup', { pointerId: 31 });
  assert.equal(pointerHeld(), false);
});

test('Enter auf einem fokussierten Knopf (Klick ohne Finger) wählt nach der Schutzzeit wie bisher', async () => {
  const early = ask();
  clock = 1400;
  dispatch(early.buttons[0], 'click', { detail: 0 });
  await settle();
  assert.equal(early.result.answer, undefined, 'in der Schutzzeit auch nicht per Tastatur');
  const q = ask();
  clock = 1700;
  dispatch(q.buttons[0], 'click', { detail: 0 });
  await settle();
  assert.equal(q.result.answer, 0);
});
