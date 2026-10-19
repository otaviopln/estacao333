import test from 'node:test';
import assert from 'node:assert/strict';
import { CHANNELS, registerIpc } from '../main/ipc.js';
import { fakeLogger } from './helpers.mjs';

function setup() {
  const handlers = {}; const unlocked = []; let quits = 0; const logger = fakeLogger();
  registerIpc({
    ipcMain: { on: (ch, fn) => { handlers[ch] = fn; } },
    steam: { unlock: (id) => unlocked.push(id) },
    quit: () => { quits += 1; },
    trustedUrl: 'file:///app/index.html',
    logger,
  });
  return { handlers, unlocked, quits: () => quits, logger };
}
const from = (url) => ({ senderFrame: { url } });

test('registra os dois canais do contrato', () => {
  const { handlers } = setup();
  assert.deepEqual(Object.keys(handlers).sort(), Object.values(CHANNELS).sort());
});

test('aceita mensagens do jogo e repassa à Steam / encerra o app', () => {
  const { handlers, unlocked, quits } = setup();
  handlers[CHANNELS.unlockAchievement](from('file:///app/index.html'), 'CASE_1_SOLVED');
  handlers[CHANNELS.quit](from('file:///app/index.html'));
  assert.deepEqual(unlocked, ['CASE_1_SOLVED']);
  assert.equal(quits(), 1);
});

test('ignora remetentes não confiáveis (outra página, frame ausente)', () => {
  const { handlers, unlocked, quits, logger } = setup();
  handlers[CHANNELS.unlockAchievement](from('https://evil.example/'), 'CASE_1_SOLVED');
  handlers[CHANNELS.quit]({});
  handlers[CHANNELS.quit](null);
  assert.deepEqual(unlocked, []);
  assert.equal(quits(), 0);
  assert.equal(logger.lines.filter(([l]) => l === 'warn').length, 3);
});
