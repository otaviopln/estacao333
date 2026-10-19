/** @file Caminhos do app, iguais em desenvolvimento e empacotado (dentro do .asar). */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

/**
 * @param {{ moduleUrl: string, userData: string }} input `moduleUrl`: import.meta.url de qualquer arquivo de desktop/main
 */
export function resolvePaths({ moduleUrl, userData }) {
  const desktopDir = path.resolve(path.dirname(fileURLToPath(moduleUrl)), '..');
  const appDir = path.join(desktopDir, 'app');
  const indexHtml = path.join(appDir, 'index.html');
  return {
    desktopDir,
    appDir,
    indexHtml,
    indexUrl: pathToFileURL(indexHtml).href,
    runtimeJson: path.join(appDir, 'runtime.json'),
    icon: path.join(appDir, 'icon.png'),
    preload: path.join(desktopDir, 'preload', 'index.cjs'),
    userData,
    logsDir: path.join(userData, 'logs'),
    settingsFile: path.join(userData, 'settings.json'),
  };
}
