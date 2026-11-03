import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fogEdgeLines, fogSignLines } from '../js/world/fogEdge.js';
import { BUCHT } from '../js/world/maps/bucht.js';
import { WALD } from '../js/world/maps/wald.js';

const sign = { role: 'fogEdge', gate: 1, leadsTo: 2, leadsToName: 'der Flüsterwald', lines: ['Der Nebel ist hier zu dicht.'] };

test('vor dem Sieg: die eigenen Zeilen des Schilds', () => {
  assert.deepEqual(fogEdgeLines(sign, { gateBeaten: false, packHasNext: true, builtAreas: 1 }), sign.lines);
});

test('Paket ohne nächstes Thema: Hinweis auf die Lehrkraft (Design 10.4)', () => {
  assert.deepEqual(fogEdgeLines(sign, { gateBeaten: true, packHasNext: false, builtAreas: 1 }), ['Dieser Weg öffnet sich, sobald deine Lehrkraft das nächste Thema freigibt.']);
});

test('Gebiet in dieser Fassung noch nicht gebaut', () => {
  assert.deepEqual(fogEdgeLines(sign, { gateBeaten: true, packHasNext: true, builtAreas: 1 }), [
    'Hinter dem Nebel liegt der Flüsterwald.',
    'Der Weg dorthin entsteht gerade. In einer der nächsten Spielfassungen kannst du hindurch.',
  ]);
});

test('Weg offen', () => {
  assert.equal(fogEdgeLines(sign, { gateBeaten: true, packHasNext: true, builtAreas: 2 }), null);
});

test('die Bucht hat genau ein Nebelschild, und es führt zum Flüsterwald', () => {
  const s = BUCHT.objects.filter(o => o.role === 'fogEdge');
  assert.equal(s.length, 1);
  assert.equal(s[0].gate, 1);
  assert.equal(s[0].leadsTo, 2);
  assert.equal(s[0].leadsToName, 'der Flüsterwald');
});

test('Weg offen: Das Schild sagt nicht mehr, der Nebel sei zu dicht', () => {
  for (const def of [BUCHT, WALD]) {
    const s = def.objects.find(o => o.role === 'fogEdge');
    const open = fogSignLines(s, { gateBeaten: true, packHasNext: true, builtAreas: s.leadsTo });
    assert.notDeepEqual(open, s.lines, def.id);
    assert.ok(open.some(l => l.includes(s.leadsToName.replace(/^(der|die|das) /, ''))), def.id);
  }
  const s = BUCHT.objects.find(o => o.role === 'fogEdge');
  assert.deepEqual(fogSignLines(s, { gateBeaten: false, packHasNext: true, builtAreas: 2 }), s.lines);
});
