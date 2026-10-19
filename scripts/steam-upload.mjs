/**
 * Envia a build para a Steam via SteamCMD.
 *
 *   STEAM_USER=conta_de_build npm run steam:upload [-- --dry-run]
 *
 * Variáveis: STEAM_USER (obrigatória), STEAMCMD (caminho do steamcmd; padrão "steamcmd").
 * Pré-requisito: `npm run desktop:dist:win` (e/ou linux/mac) já gerou release/<so>-unpacked.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { configuredDepots, DEPOT_FOLDERS, writeVdfs } from './steam-vdf.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEST_APP_ID = 480;

/** Lista de problemas que impedem o upload (vazia = pode enviar). */
export function uploadProblems(config, { releaseDir = path.join(ROOT, 'release'), exists = fs.existsSync } = {}) {
  const problems = [];
  if (!Number.isInteger(config.appId) || config.appId <= 0 || config.appId === TEST_APP_ID) {
    problems.push(`appId ${config.appId} é o app de teste/inválido: coloque o App ID real em steam/steam.config.json`);
  }
  const depots = configuredDepots(config);
  if (Object.keys(depots).length === 0) problems.push('nenhum depot configurado em steam/steam.config.json');
  for (const os of Object.keys(depots)) {
    const dir = path.join(releaseDir, DEPOT_FOLDERS[os]);
    if (!exists(dir)) problems.push(`falta ${path.relative(ROOT, dir)} — gere o build desse sistema antes`);
  }
  return problems;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const dryRun = process.argv.includes('--dry-run');
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'steam', 'steam.config.json'), 'utf8'));
  const problems = uploadProblems(config);
  if (problems.length && !dryRun) { console.error(`Upload bloqueado:\n - ${problems.join('\n - ')}`); process.exit(1); }
  if (problems.length) console.warn(`(dry-run) avisos:\n - ${problems.join('\n - ')}`);
  const appVdf = writeVdfs({ config });
  const user = process.env.STEAM_USER;
  const args = ['+login', user || '<STEAM_USER>', '+run_app_build', appVdf, '+quit'];
  const bin = process.env.STEAMCMD || 'steamcmd';
  if (dryRun) { console.log(`(dry-run) ${bin} ${args.join(' ')}`); process.exit(0); }
  if (!user) { console.error('Defina STEAM_USER (conta Steam de build).'); process.exit(1); }
  process.exit(spawnSync(bin, args, { stdio: 'inherit' }).status ?? 1);
}
