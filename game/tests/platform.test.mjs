import test from 'node:test';
import assert from 'node:assert/strict';
import { createHost } from '../src/platform/host.js';
import { earnedAchievements } from '../src/platform/achievement-rules.js';
import { ACHIEVEMENT_IDS } from '../src/platform/achievement-ids.js';

test('host web é um no-op seguro', () => {
  const h = createHost({});
  assert.equal(h.isDesktop, false);
  assert.doesNotThrow(() => { h.unlockAchievement('X'); h.quit(); });
});

test('host desktop delega à API do preload', () => {
  const calls = [];
  const h = createHost({ estacao: { apiVersion: 1, achievements: { unlock: (id) => calls.push(['unlock', id]) }, app: { quit: () => calls.push(['quit']) } } });
  assert.equal(h.isDesktop, true);
  h.unlockAchievement('CASE_1_SOLVED'); h.quit();
  assert.deepEqual(calls, [['unlock', 'CASE_1_SOLVED'], ['quit']]);
});

test('conquistas seguem o progresso do jogo', () => {
  assert.deepEqual(earnedAchievements([false, false, false], null), []);
  assert.deepEqual(earnedAchievements([true, false, false], 'clock'), [ACHIEVEMENT_IDS.case1]);
  assert.deepEqual(earnedAchievements([true, true, true], 'credits'), [ACHIEVEMENT_IDS.case1, ACHIEVEMENT_IDS.case2, ACHIEVEMENT_IDS.case3, ACHIEVEMENT_IDS.credits]);
  assert.ok(earnedAchievements([true, true, true], 'end').includes(ACHIEVEMENT_IDS.platform4));
});
