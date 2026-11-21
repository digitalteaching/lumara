// Das Antwort-Panel (js/ui/duelPanel.js) mit einem kleinen DOM im Speicher: Eine offene Rückmeldung
// endet, wenn das Panel geleert oder entfernt wird. Ihre Zuhörer für A und Tipp gehen dabei mit, sonst
// schluckten sie über input.consume() den ersten Druck der nächsten Szene.

import { test } from 'node:test';
import assert from 'node:assert/strict';

// Gerade so viel DOM, wie das Panel für eine Rückmeldung braucht. Eigene Datei, eigener Prozess:
// Die Globale document, window und Node gelten nur hier.
class FakeNode {
  constructor(tag = '#text', text = '') {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.parent = null;
    this.className = '';
    this.dataset = {};
    this.style = {};
    this.attrs = {};
    this.hidden = false;
    this.disabled = false;
    this.text = text;
    this.listeners = [];
  }
  get firstChild() {
    return this.children[0] ?? null;
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
  addEventListener(type, fn) {
    this.listeners.push([type, fn]);
  }
  removeEventListener(type, fn) {
    this.listeners = this.listeners.filter(([t, f]) => t !== type || f !== fn);
  }
  *descendants() {
    for (const c of this.children) {
      yield c;
      yield* c.descendants();
    }
  }
  querySelectorAll(selector) {
    const parts = selector.split(',').map(s => s.trim());
    const hit = n => parts.some(p => (p.startsWith('.') ? n.className.split(' ').includes(p.slice(1)) : n.tagName === p.toUpperCase()));
    return [...this.descendants()].filter(hit);
  }
  querySelector(selector) {
    return this.querySelectorAll(selector)[0] ?? null;
  }
}

const fakeWindow = new FakeNode('window');
globalThis.Node = FakeNode;
globalThis.window = fakeWindow;
globalThis.document = { createElement: tag => new FakeNode(tag), body: new FakeNode('body') };

const { createDuelPanel } = await import('../js/ui/duelPanel.js');

function fakeGame() {
  const a = new Set();
  const input = {
    consumed: 0,
    on(btn, fn) {
      assert.equal(btn, 'a');
      a.add(fn);
      return () => a.delete(fn);
    },
    consume() {
      input.consumed++;
    },
    pressA: () => [...a].forEach(fn => fn()),
    listenersA: () => a.size,
  };
  return { panel: new FakeNode('div'), state: null, input };
}

const pointerListeners = () => fakeWindow.listeners.filter(([type]) => type === 'pointerdown').length;

for (const how of ['remove', 'clear']) {
  test(`Panel ${how === 'remove' ? 'entfernt' : 'geleert'}: Die offene Rückmeldung endet, ihre Zuhörer sind weg und schlucken nichts`, async () => {
    const game = fakeGame();
    const panel = createDuelPanel(game);
    let ended = false;
    const shown = panel.feedback({ ok: false, title: 'Falsch', lines: ['Richtig ist: a'], minMs: 1500 }).then(() => {
      ended = true;
    });
    assert.deepEqual([pointerListeners(), game.input.listenersA()], [1, 1]);
    panel[how]();
    await shown;
    assert.ok(ended, 'die Rückmeldung ist zu Ende');
    assert.deepEqual([pointerListeners(), game.input.listenersA()], [0, 0], 'keine Zuhörer mehr');
    assert.equal(game.input.consumed, 0, 'kein Druck der nächsten Szene geht verloren');
    game.input.pressA();
    assert.equal(game.input.consumed, 0);
    assert.equal(game.panel.children.length, how === 'remove' ? 0 : 1);
  });
}

test('Rückmeldung wie bisher: endet nach autoMs von selbst und nimmt den Druck weg, der sie beendet', async () => {
  const game = fakeGame();
  const panel = createDuelPanel(game);
  await panel.feedback({ ok: true, title: 'Richtig', autoMs: 5 });
  assert.deepEqual([pointerListeners(), game.input.listenersA(), game.input.consumed], [0, 0, 1]);
  panel.remove();
  assert.equal(game.input.consumed, 1, 'eine beendete Rückmeldung endet nicht zweimal');
});
