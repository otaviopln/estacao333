import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadAchievements, renderIdsModule, TARGET } from '../gen-achievements.mjs';
import { configuredDepots, renderAppBuild, renderDepot, writeVdfs } from '../steam-vdf.mjs';
import { uploadProblems } from '../steam-upload.mjs';

test('achievement-ids.js está em dia com steam/achievements.json', () => {
  assert.equal(fs.readFileSync(TARGET, 'utf8'), renderIdsModule(loadAchievements()));
});

test('achievements.json: IDs válidos, únicos e com texto pt-BR e en', () => {
  const list = loadAchievements();
  assert.ok(list.length >= 5);
  for (const a of list) assert.ok(a.name.en && a.description.en, `${a.id} sem tradução en`);
});

test('VDF: app_build e depot têm a estrutura exigida pelo SteamCMD', () => {
  const depot = renderDepot({ depotId: 1001, contentRoot: 'C:\\jogo\\release\\win-unpacked' });
  assert.match(depot, /"DepotBuild"\n\{/);
  assert.match(depot, /"DepotID" "1001"/);
  assert.match(depot, /"ContentRoot" "C:\/jogo\/release\/win-unpacked"/);
  assert.match(depot, /"LocalPath" "\*"[\s\S]*"Recursive" "1"/);
  const app = renderAppBuild({ appId: 999, description: 'Build "teste"', branch: 'beta', outputDir: '/out', depotScripts: { 1001: '/x/depot_1001.vdf' } });
  assert.match(app, /"AppID" "999"/);
  assert.match(app, /"Desc" "Build teste"/, 'aspas removidas');
  assert.match(app, /"SetLive" "beta"/);
  assert.match(app, /"1001" "\/x\/depot_1001\.vdf"/);
});

test('writeVdfs gera só os depots configurados', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'vdf-'));
  try {
    const config = { appId: 999, description: 'd', branch: '', depots: { windows: 1001, linux: null, mac: 0 } };
    assert.deepEqual(configuredDepots(config), { windows: 1001 });
    const appFile = writeVdfs({ root: out, config, releaseDir: path.join(out, 'release'), outDir: path.join(out, 'steam') });
    assert.ok(fs.existsSync(appFile));
    assert.deepEqual(fs.readdirSync(path.join(out, 'steam')).sort(), ['app_build_999.vdf', 'depot_1001.vdf']);
    assert.throws(() => writeVdfs({ root: out, config: { ...config, depots: {} }, outDir: path.join(out, 's2') }), /nenhum depot/);
  } finally { fs.rmSync(out, { recursive: true, force: true }); }
});

test('upload é bloqueado com App ID de teste, sem depots ou sem build', () => {
  const none = () => false; const all = () => true;
  assert.equal(uploadProblems({ appId: 480, depots: { windows: 1 } }, { exists: all }).length, 1);
  assert.ok(uploadProblems({ appId: 1234, depots: {} }, { exists: all }).some((p) => p.includes('depot')));
  assert.ok(uploadProblems({ appId: 1234, depots: { windows: 5 } }, { exists: none }).some((p) => p.includes('win-unpacked')));
  assert.deepEqual(uploadProblems({ appId: 1234, depots: { windows: 5 } }, { exists: all }), []);
});
