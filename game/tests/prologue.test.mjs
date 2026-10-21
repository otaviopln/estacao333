import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const GAME = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const ROOT = path.join(GAME, '..');

spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'build-game.mjs'), '--target', 'web'], { stdio: 'ignore' });

function run(mode, sex) {
  const r = spawnSync(process.execPath, [path.join(GAME, 'tests', 'prologue-run.mjs'), mode, sex], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const i = r.stdout.indexOf('@@RESULT@@');
  assert.ok(i >= 0, `falha ao rodar ${mode}/${sex}:\n${r.stderr}`);
  return JSON.parse(r.stdout.slice(i + 10));
}

const STEPS = ['car:move', 'car:interact', 'car:glasses', 'car:scan', 'room:room', 'room:call', 'room:light', 'room:wait', 'room:ambush', 'room:done'];

for (const sex of ['f', 'm']) {
  test(`prólogo + caso 0 completos (${sex === 'f' ? 'detetive mulher' : 'detetive homem'}): carro → hotel → prisão → estação`, () => {
    const r = run('esm', sex);
    assert.deepEqual(r.errors, [], r.errors.join('\n'));
    assert.ok(r.log.includes('prologue:office') && r.log.includes('prologue:street'), r.log.join(' > '));
    for (const step of STEPS) assert.ok(r.log.includes(step), `passo ausente: ${step}\n${r.log.join(' > ')}`);
    assert.deepEqual(r.clues, ['Fechadura eletrônica', 'Janela do quarto', 'Pasta do Departamento', 'Planta de evacuação', 'Telefone do quarto']);
    assert.equal(r.scene, 'station');
    assert.equal(r.caseIndex, 0);
    assert.equal(r.mode, 'play');
  });
}

test('o bundle (HTML único) joga o prólogo exatamente como os ES Modules', () => {
  const esm = run('esm', 'f'), bundle = run('bundle', 'f');
  assert.deepEqual(bundle.errors, []);
  assert.deepEqual(bundle.log, esm.log);
  assert.equal(bundle.digests.length, esm.digests.length);
  assert.deepEqual(bundle.digests, esm.digests, 'render e áudio idênticos entre src/ e dist/');
});
