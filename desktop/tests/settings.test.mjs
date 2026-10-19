import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createSettings, DEFAULT_SETTINGS, sanitizeSettings } from '../main/settings.js';
import { fakeLogger, makeTmp, rmTmp } from './helpers.mjs';

test('sanitizeSettings aceita lixo e devolve padrões válidos', () => {
  assert.deepEqual(sanitizeSettings(null), DEFAULT_SETTINGS);
  assert.deepEqual(sanitizeSettings('x'), DEFAULT_SETTINGS);
  assert.deepEqual(sanitizeSettings({ fullscreen: 'sim', bounds: { width: 10, height: 10 } }), DEFAULT_SETTINGS);
  assert.deepEqual(sanitizeSettings({ fullscreen: true, bounds: { width: 1280.5, height: 720 } }).bounds, null);
  assert.deepEqual(sanitizeSettings({ fullscreen: true, bounds: { width: 1600, height: 900, x: 5 } }), { fullscreen: true, bounds: { width: 1600, height: 900 } });
});

test('createSettings persiste e relê; arquivo corrompido volta aos padrões', () => {
  const dir = makeTmp();
  try {
    const file = path.join(dir, 'sub', 'settings.json');
    const logger = fakeLogger();
    const s = createSettings({ file, fs, logger });
    assert.deepEqual(s.get(), DEFAULT_SETTINGS);
    s.update({ fullscreen: true });
    s.update({ bounds: { width: 1024, height: 576 } });
    assert.deepEqual(createSettings({ file, fs, logger }).get(), { fullscreen: true, bounds: { width: 1024, height: 576 } });
    assert.equal(fs.existsSync(`${file}.tmp`), false, 'não deixa arquivo temporário');

    fs.writeFileSync(file, '{ quebrado');
    assert.deepEqual(createSettings({ file, fs, logger }).get(), DEFAULT_SETTINGS);
    assert.ok(logger.lines.some(([level]) => level === 'warn'));
  } finally { rmTmp(dir); }
});

test('update ignora valores inválidos em vez de gravar lixo', () => {
  const dir = makeTmp();
  try {
    const s = createSettings({ file: path.join(dir, 's.json'), fs, logger: fakeLogger() });
    assert.deepEqual(s.update({ bounds: { width: -5, height: 99999 } }).bounds, null);
  } finally { rmTmp(dir); }
});
