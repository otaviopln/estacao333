/**
 * Gera o jogo (build de src/ -> dist/index.html) e copia para desktop/app/index.html,
 * que é o que o Electron carrega e o electron-builder empacota.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, '..', '..');
const APP = path.join(HERE, '..', 'app');

const r = spawnSync(process.execPath, [path.join(ROOT, 'tools', 'build.mjs')], { stdio: 'inherit' });
if (r.status !== 0) process.exit(r.status || 1);
fs.mkdirSync(APP, { recursive: true });
fs.copyFileSync(path.join(ROOT, 'dist', 'index.html'), path.join(APP, 'index.html'));
console.log('desktop/app/index.html atualizado');
