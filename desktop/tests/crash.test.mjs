import test from 'node:test';
import assert from 'node:assert/strict';
import { watchRenderer } from '../main/crash.js';
import { fakeEmitter, fakeLogger } from './helpers.mjs';

test('recarrega o jogo se o renderer cair, no máximo 2 vezes; ignora saída limpa', () => {
  let reloads = 0; const logger = fakeLogger();
  const contents = fakeEmitter({ reload: () => { reloads += 1; } });
  watchRenderer(contents, { logger });
  contents.emit('render-process-gone', {}, { reason: 'clean-exit', exitCode: 0 });
  contents.emit('render-process-gone', {}, { reason: 'killed', exitCode: 1 });
  assert.equal(reloads, 0);
  for (let i = 0; i < 4; i++) contents.emit('render-process-gone', {}, { reason: 'crashed', exitCode: 139 });
  assert.equal(reloads, 2);
  contents.emit('unresponsive');
  contents.emit('did-fail-load', {}, -6, 'ERR_FILE_NOT_FOUND', 'file:///x');
  assert.ok(logger.lines.some(([l, m]) => l === 'error' && m.includes('ERR_FILE_NOT_FOUND')));
});
