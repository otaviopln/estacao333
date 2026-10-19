import test from 'node:test';
import assert from 'node:assert/strict';
import { createSteam } from '../main/steam.js';
import { fakeLogger } from './helpers.mjs';

function fakeSteamworks({ failInit = false } = {}) {
  const activated = new Set(); const calls = [];
  return {
    calls, activated,
    init: (appId) => {
      calls.push(['init', appId]);
      if (failInit) throw new Error('Steam não está aberta');
      return { achievement: { isActivated: (id) => activated.has(id), activate: (id) => { activated.add(id); calls.push(['activate', id]); } } };
    },
    electronEnableSteamOverlay: () => calls.push(['overlay']),
  };
}

const IDS = ['CASE_1_SOLVED', 'FINISHED_GAME'];

test('init conecta, habilita o overlay e libera só IDs conhecidos, uma vez', () => {
  const sw = fakeSteamworks();
  const steam = createSteam({ appId: 4242, achievementIds: IDS, loadSteamworks: () => sw, logger: fakeLogger() });
  assert.equal(steam.init(), true);
  assert.equal(steam.isAvailable(), true);
  assert.deepEqual(sw.calls.slice(0, 2), [['init', 4242], ['overlay']]);
  assert.equal(steam.unlock('CASE_1_SOLVED'), true);
  assert.equal(steam.unlock('CASE_1_SOLVED'), true);
  assert.equal(sw.calls.filter(([c]) => c === 'activate').length, 1, 'não reativa');
  assert.equal(steam.unlock('HACKED'), false);
  assert.equal(steam.unlock('case_1'), false);
  assert.equal(steam.unlock(42), false);
});

test('sem Steam (init lança) o jogo segue sem conquistas', () => {
  const logger = fakeLogger();
  const steam = createSteam({ appId: 4242, achievementIds: IDS, loadSteamworks: () => fakeSteamworks({ failInit: true }), logger });
  assert.equal(steam.init(), false);
  assert.equal(steam.isAvailable(), false);
  assert.equal(steam.unlock('CASE_1_SOLVED'), false);
  assert.ok(logger.lines.some(([l, m]) => l === 'warn' && m.includes('indisponível')));
});

test('módulo nativo ausente e appId inválido não quebram', () => {
  const missing = createSteam({ appId: 1, achievementIds: IDS, loadSteamworks: () => { throw new Error("Cannot find module 'steamworks.js'"); }, logger: fakeLogger() });
  assert.equal(missing.init(), false);
  const bad = createSteam({ appId: 0, achievementIds: IDS, loadSteamworks: () => fakeSteamworks(), logger: fakeLogger() });
  assert.equal(bad.init(), false);
});

test('erro ao ativar conquista é capturado', () => {
  const sw = fakeSteamworks();
  const steam = createSteam({ appId: 1, achievementIds: IDS, loadSteamworks: () => ({ ...sw, init: () => ({ achievement: { isActivated: () => false, activate: () => { throw new Error('rede'); } } }) }), logger: fakeLogger() });
  steam.init();
  assert.equal(steam.unlock('CASE_1_SOLVED'), false);
});
