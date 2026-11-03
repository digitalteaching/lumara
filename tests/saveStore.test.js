import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSaveStore, SAVE_KEYS } from '../js/save/store.js';
import { encodeSave, decodeSave } from '../js/save/codec.js';
import { migrateState } from '../js/save/migrate.js';
import { newGameState } from '../js/state.js';
import { fakeStorage } from './helpers/fixtures.js';

const mia = level => {
  const s = newGameState({ name: 'Mia', species: 'nixi', nickname: null });
  s.creature.level = level;
  return s;
};
const levelIn = (mem, key) => migrateState(decodeSave(mem.getItem(key)).value).state.creature.level;

test('ohne Stand: none; speichern setzt savedAt, laden liefert denselben Stand', () => {
  const st = createSaveStore(fakeStorage(), { now: () => 1000 });
  assert.deepEqual(st.load(), { status: 'none' });
  const s = mia(3);
  assert.equal(st.save(s), true);
  assert.equal(s.savedAt, 1000);
  assert.deepEqual(st.load(), { status: 'ok', state: s });
});

test('der vorige Stand bleibt als Sicherung erhalten', () => {
  const mem = fakeStorage();
  const st = createSaveStore(mem);
  st.save(mia(1));
  st.save(mia(2));
  assert.equal(levelIn(mem, SAVE_KEYS.backup), 1);
  assert.equal(levelIn(mem, SAVE_KEYS.main), 2);
});

test('kaputter Hauptstand: Sicherung wird angeboten, beim Laden wird nichts geschrieben', () => {
  const mem = fakeStorage();
  const st = createSaveStore(mem);
  st.save(mia(1));
  st.save(mia(2));
  mem.setItem(SAVE_KEYS.main, 'kaputt');
  const writes = [];
  const orig = mem.setItem;
  mem.setItem = (k, v) => {
    writes.push(k);
    orig(k, v);
  };
  mem.removeItem = k => writes.push(`remove ${k}`);
  const r = st.load();
  assert.equal(r.status, 'backup');
  assert.equal(r.state.creature.level, 1);
  assert.deepEqual(writes, []);
});

test('kaputter Hauptstand verdrängt beim Speichern nicht die gute Sicherung', () => {
  const mem = fakeStorage();
  const st = createSaveStore(mem);
  st.save(mia(1));
  st.save(mia(2));
  mem.setItem(SAVE_KEYS.main, 'kaputt');
  st.save(mia(3));
  assert.equal(levelIn(mem, SAVE_KEYS.backup), 1);
  assert.equal(levelIn(mem, SAVE_KEYS.main), 3);
});

test('beides kaputt: damaged; neuere Fassung: newer, auch wenn die Sicherung gut ist', () => {
  const mem = fakeStorage();
  const st = createSaveStore(mem);
  mem.setItem(SAVE_KEYS.main, 'x');
  mem.setItem(SAVE_KEYS.backup, 'y');
  assert.deepEqual(st.load(), { status: 'damaged' });
  st.clear();
  assert.deepEqual(st.load(), { status: 'none' });
  st.save(mia(1));
  st.save(mia(1));
  mem.setItem(SAVE_KEYS.main, encodeSave({ ...mia(1), version: 99 }));
  assert.deepEqual(st.load(), { status: 'newer' });
});

test('voller Speicher oder privater Modus: false, keine Ausnahme', () => {
  const bad = {
    getItem() { throw new Error('SecurityError'); },
    setItem() { throw new Error('QuotaExceededError'); },
    removeItem() { throw new Error('x'); },
  };
  const st = createSaveStore(bad);
  assert.deepEqual(st.load(), { status: 'none' });
  assert.equal(st.save(mia(1)), false);
  st.clear();
  assert.equal(createSaveStore(undefined).save(mia(1)), false);
  assert.deepEqual(createSaveStore(undefined).load(), { status: 'none' });
});
