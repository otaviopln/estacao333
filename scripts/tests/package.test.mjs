import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const require = createRequire(import.meta.url);
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const builder = require('../../desktop/electron-builder.config.cjs');

test('package.json aponta para o processo principal existente e usa ESM', () => {
  assert.equal(pkg.type, 'module');
  assert.ok(fs.existsSync(path.join(ROOT, pkg.main)), pkg.main);
});

test('todo script npm que chama arquivos do repo aponta para arquivos existentes', () => {
  for (const [name, cmd] of Object.entries(pkg.scripts)) {
    for (const m of cmd.matchAll(/(?:node|--config)\s+"?([\w./-]+\.(?:mjs|cjs|js))/g)) assert.ok(fs.existsSync(path.join(ROOT, m[1])), `${name}: ${m[1]} não existe`);
  }
});

test('electron-builder: empacota só o necessário e o ícone/recursos existem', () => {
  assert.ok(fs.existsSync(path.join(ROOT, builder.directories.buildResources, 'icon.png')));
  assert.ok(builder.files.includes('desktop/app/**/*'));
  assert.ok(!builder.files.some((f) => /tests|game\/|scripts/.test(f)), 'testes, fontes do jogo e scripts ficam fora do pacote');
  assert.ok(builder.asarUnpack.some((g) => g.includes('steamworks.js')), 'módulo nativo precisa sair do asar');
  assert.equal(builder.win.target[0].target, 'dir', 'padrão Steam: pasta, não instalador');
});

test('steamworks.js é dependência opcional (build sem Steam não quebra o npm install)', () => {
  assert.ok(pkg.optionalDependencies['steamworks.js']);
  assert.ok(pkg.devDependencies.electron && pkg.devDependencies['electron-builder']);
});
