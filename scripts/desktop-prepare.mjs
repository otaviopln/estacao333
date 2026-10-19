/**
 * Prepara o app desktop: builda o jogo (alvo desktop, com CSP) e monta `desktop/app/`
 * (index.html + runtime.json + icon.png) — o que o Electron carrega e o electron-builder empacota.
 *
 *   node scripts/desktop-prepare.mjs [--dev]     --dev tolera a ausência da fonte VT323 (somente desenvolvimento)
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadAchievements } from './gen-achievements.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Conteúdo de runtime.json: o que o processo principal precisa saber da Steam e da versão. */
export function buildRuntimeConfig({ steamConfig, achievements, version }) {
  return { version, appId: steamConfig.appId, achievements: achievements.map((a) => a.id) };
}

export function prepareDesktopApp({ root = ROOT, dev = false } = {}) {
  const build = spawnSync(process.execPath, [path.join(root, 'scripts', 'build-game.mjs'), '--target', 'desktop', ...(dev ? ['--allow-missing-font'] : [])], { stdio: 'inherit' });
  if (build.status !== 0) throw new Error('build do jogo (alvo desktop) falhou');

  const appDir = path.join(root, 'desktop', 'app');
  fs.rmSync(appDir, { recursive: true, force: true });
  fs.mkdirSync(appDir, { recursive: true });
  fs.copyFileSync(path.join(root, 'dist', 'desktop', 'index.html'), path.join(appDir, 'index.html'));
  fs.copyFileSync(path.join(root, 'build', 'icon.png'), path.join(appDir, 'icon.png'));

  const steamConfig = JSON.parse(fs.readFileSync(path.join(root, 'steam', 'steam.config.json'), 'utf8'));
  const { version } = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  const runtime = buildRuntimeConfig({ steamConfig, achievements: loadAchievements(), version });
  fs.writeFileSync(path.join(appDir, 'runtime.json'), `${JSON.stringify(runtime, null, 2)}\n`);
  console.log(`desktop/app pronto (v${version}, steam appId ${runtime.appId}, ${runtime.achievements.length} conquistas)`);
  return appDir;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) prepareDesktopApp({ dev: process.argv.includes('--dev') });
