import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { CHANNELS } from '../main/ipc.js';
import { createHost } from '../../game/src/platform/host.js';

const PRELOAD = new URL('../preload/index.cjs', import.meta.url);

/** Executa o preload com um `electron` falso e devolve a API exposta + as mensagens enviadas. */
function runPreload() {
  const sent = []; const exposed = {};
  const electron = { contextBridge: { exposeInMainWorld: (name, api) => { exposed[name] = api; } }, ipcRenderer: { send: (...a) => sent.push(a) } };
  vm.runInNewContext(fs.readFileSync(PRELOAD, 'utf8'), { require: (m) => { assert.equal(m, 'electron'); return electron; } });
  return { exposed, sent };
}

test('preload expõe só window.estacao v1 e usa os canais do processo principal', () => {
  const { exposed, sent } = runPreload();
  assert.deepEqual(Object.keys(exposed), ['estacao']);
  const api = exposed.estacao;
  assert.equal(api.apiVersion, 1);
  assert.deepEqual(Object.keys(api).sort(), ['achievements', 'apiVersion', 'app']);
  api.achievements.unlock('CASE_1_SOLVED');
  api.achievements.unlock({ nao: 'string' });
  api.app.quit();
  assert.deepEqual(sent, [[CHANNELS.unlockAchievement, 'CASE_1_SOLVED'], [CHANNELS.quit]]);
});

test('contrato: o host do jogo reconhece exatamente a API do preload', () => {
  const { exposed, sent } = runPreload();
  const host = createHost({ estacao: exposed.estacao });
  assert.equal(host.isDesktop, true);
  host.unlockAchievement('FINISHED_GAME');
  host.quit();
  assert.deepEqual(sent, [[CHANNELS.unlockAchievement, 'FINISHED_GAME'], [CHANNELS.quit]]);
  assert.equal(createHost({}).isDesktop, false);
  assert.equal(createHost({ estacao: { apiVersion: 2 } }).isDesktop, false, 'versão desconhecida cai no adaptador web');
});
