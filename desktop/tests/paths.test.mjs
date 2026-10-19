import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { resolvePaths } from '../main/paths.js';

test('paths derivam de desktop/ e de userData', () => {
  const p = resolvePaths({ moduleUrl: new URL('../main/paths.js', import.meta.url).href, userData: path.join(path.sep, 'u') });
  assert.equal(path.basename(p.desktopDir), 'desktop');
  assert.equal(p.indexHtml, path.join(p.desktopDir, 'app', 'index.html'));
  assert.equal(p.preload, path.join(p.desktopDir, 'preload', 'index.cjs'));
  assert.match(p.indexUrl, /^file:\/\/.*\/desktop\/app\/index\.html$/);
  assert.equal(p.settingsFile, path.join(p.userData, 'settings.json'));
});
