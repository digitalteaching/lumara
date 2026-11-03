import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAppleMobile, isStandalone } from '../js/app/platform.js';

const IPAD = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

test('iPad, iPhone, Mac und andere', () => {
  assert.equal(isAppleMobile({ userAgent: IPAD, maxTouchPoints: 5 }), true);
  assert.equal(isAppleMobile({ userAgent: IPAD, maxTouchPoints: 0 }), false);
  assert.equal(isAppleMobile({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1', maxTouchPoints: 5 }), true);
  assert.equal(isAppleMobile({ userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_6 like Mac OS X) AppleWebKit/605.1.15 Version/16.6 Mobile/15E148 Safari/604.1', maxTouchPoints: 5 }), true);
  assert.equal(isAppleMobile({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/130.0 Safari/537.36', maxTouchPoints: 0 }), false);
  assert.equal(isAppleMobile({ userAgent: 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36', maxTouchPoints: 5 }), false);
});

test('vom Home-Bildschirm gestartet', () => {
  assert.equal(isStandalone({ navigatorStandalone: true, displayModeStandalone: false }), true);
  assert.equal(isStandalone({ navigatorStandalone: undefined, displayModeStandalone: true }), true);
  assert.equal(isStandalone({ navigatorStandalone: false, displayModeStandalone: false }), false);
});
