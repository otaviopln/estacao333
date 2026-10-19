import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const FONT = path.join(ROOT, 'game', 'src', 'assets', 'fonts', 'VT323-Regular.woff2');
const run = (script, args = []) => spawnSync(process.execPath, [path.join(ROOT, 'scripts', script), ...args], { encoding: 'utf8' });
const hasFont = fs.existsSync(FONT);

test('build desktop exige a fonte offline (falha com mensagem clara)', { skip: hasFont }, () => {
  const r = run('build-game.mjs', ['--target', 'desktop']);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr, /VT323-Regular\.woff2 ausente/);
});

test('build desktop (--allow-missing-font) injeta CSP restritiva e não referencia rede', () => {
  const r = run('build-game.mjs', ['--target', 'desktop', '--allow-missing-font']);
  assert.equal(r.status, 0, r.stderr);
  const html = fs.readFileSync(path.join(ROOT, 'dist', 'desktop', 'index.html'), 'utf8');
  assert.match(html, /http-equiv="Content-Security-Policy"/);
  assert.match(html, /connect-src 'none'/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com/);
  assert.doesNotMatch(html, /<script[^>]+src=/, 'sem scripts externos');
});

test('build web mantém Google Fonts sem CSP e gera .nojekyll', () => {
  const r = run('build-game.mjs', ['--target', 'web']);
  assert.equal(r.status, 0, r.stderr);
  const html = fs.readFileSync(path.join(ROOT, 'dist', 'web', 'index.html'), 'utf8');
  assert.doesNotMatch(html, /Content-Security-Policy/);
  assert.ok(fs.existsSync(path.join(ROOT, 'dist', 'web', '.nojekyll')));
});

test('alvo inválido é rejeitado', () => {
  assert.notEqual(run('build-game.mjs', ['--target', 'xbox']).status, 0);
});

test('desktop-prepare monta desktop/app com runtime.json coerente', () => {
  const r = spawnSync(process.execPath, [path.join(ROOT, 'scripts', 'desktop-prepare.mjs'), '--dev'], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  const app = path.join(ROOT, 'desktop', 'app');
  assert.deepEqual(fs.readdirSync(app).sort(), ['icon.png', 'index.html', 'runtime.json']);
  const runtime = JSON.parse(fs.readFileSync(path.join(app, 'runtime.json'), 'utf8'));
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  const steam = JSON.parse(fs.readFileSync(path.join(ROOT, 'steam', 'steam.config.json'), 'utf8'));
  assert.equal(runtime.version, pkg.version);
  assert.equal(runtime.appId, steam.appId);
  assert.ok(runtime.achievements.includes('CASE_1_SOLVED'));
  fs.rmSync(app, { recursive: true, force: true });
});
