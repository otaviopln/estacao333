/**
 * Gera os scripts do SteamCMD (app_build + depots) a partir de `steam/steam.config.json` — assim ninguém edita VDF à mão.
 *
 *   node scripts/steam-vdf.mjs      escreve em dist/steam/
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

/** Pasta que o electron-builder gera por sistema (release/<pasta>). */
export const DEPOT_FOLDERS = Object.freeze({ windows: 'win-unpacked', linux: 'linux-unpacked', mac: 'mac-universal' });

const q = (s) => `"${String(s).replace(/\\/g, '/').replace(/"/g, '')}"`;
const fwd = (p) => p.replace(/\\/g, '/');

export function renderDepot({ depotId, contentRoot }) {
  return `"DepotBuild"\n{\n\t"DepotID" ${q(depotId)}\n\t"ContentRoot" ${q(contentRoot)}\n\t"FileMapping"\n\t{\n\t\t"LocalPath" "*"\n\t\t"DepotPath" "."\n\t\t"Recursive" "1"\n\t}\n\t"FileExclusion" "*.pdb"\n}\n`;
}

export function renderAppBuild({ appId, description, branch, outputDir, depotScripts }) {
  const depots = Object.entries(depotScripts).map(([id, file]) => `\t\t${q(id)} ${q(file)}`).join('\n');
  return `"AppBuild"\n{\n\t"AppID" ${q(appId)}\n\t"Desc" ${q(description)}\n\t"BuildOutput" ${q(outputDir)}\n\t"ContentRoot" ""\n\t"SetLive" ${q(branch || '')}\n\t"Depots"\n\t{\n${depots}\n\t}\n}\n`;
}

/** Depots configurados (id inteiro positivo) → { sistema: id }. */
export function configuredDepots(config) {
  return Object.fromEntries(Object.entries(config.depots || {}).filter(([, id]) => Number.isInteger(id) && id > 0));
}

/** Escreve os .vdf e devolve o caminho do app_build. */
export function writeVdfs({ root = ROOT, config, releaseDir = path.join(root, 'release'), outDir = path.join(root, 'dist', 'steam') }) {
  const depots = configuredDepots(config);
  if (Object.keys(depots).length === 0) throw new Error('steam.config.json: nenhum depot configurado (depots.windows/linux/mac)');
  fs.mkdirSync(outDir, { recursive: true });
  const depotScripts = {};
  for (const [os, depotId] of Object.entries(depots)) {
    const file = path.join(outDir, `depot_${depotId}.vdf`);
    fs.writeFileSync(file, renderDepot({ depotId, contentRoot: fwd(path.join(releaseDir, DEPOT_FOLDERS[os])) }));
    depotScripts[depotId] = fwd(file);
  }
  const appFile = path.join(outDir, `app_build_${config.appId}.vdf`);
  fs.writeFileSync(appFile, renderAppBuild({
    appId: config.appId, description: config.description, branch: config.branch,
    outputDir: fwd(path.join(outDir, 'output')), depotScripts,
  }));
  return appFile;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const config = JSON.parse(fs.readFileSync(path.join(ROOT, 'steam', 'steam.config.json'), 'utf8'));
  console.log(`escrito ${path.relative(ROOT, writeVdfs({ config }))}`);
}
