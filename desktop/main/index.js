/**
 * @file Ponto de entrada do processo principal (Electron ≥ 28, ESM). É o ÚNICO arquivo que importa `electron` e
 * `steamworks.js`; o resto recebe dependências por parâmetro.
 */
import fs from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { app, BrowserWindow, ipcMain, Menu, session, shell } from 'electron';
import { startApp } from './app.js';
import { createLogger } from './logger.js';
import { resolvePaths } from './paths.js';
import { createSettings } from './settings.js';
import { createSteam } from './steam.js';

const require = createRequire(import.meta.url);

// Pasta de dados estável (não depende do nome do pacote): %APPDATA%/Estacao333
app.setName('Estacao333');
app.setPath('userData', path.join(app.getPath('appData'), 'Estacao333'));

const paths = resolvePaths({ moduleUrl: import.meta.url, userData: app.getPath('userData') });
const logger = createLogger({ dir: paths.logsDir, fs });
process.on('uncaughtException', (err) => logger.error('[main] uncaughtException', err));
process.on('unhandledRejection', (err) => logger.error('[main] unhandledRejection', err));

let runtime;
try {
  runtime = JSON.parse(fs.readFileSync(paths.runtimeJson, 'utf8'));
} catch (err) {
  logger.error('desktop/app/runtime.json ausente: rode `npm run desktop:prepare` antes de abrir o app.', err);
  app.exit(1);
}

if (runtime) {
  // A Steam precisa subir antes de qualquer janela (overlay).
  const steam = createSteam({
    appId: runtime.appId,
    achievementIds: runtime.achievements,
    loadSteamworks: () => require('steamworks.js'),
    logger,
  });
  steam.init();

  startApp({
    electron: { app, BrowserWindow, ipcMain, Menu, session, shell },
    steam,
    settings: createSettings({ file: paths.settingsFile, fs, logger }),
    logger,
    paths,
    isDev: !app.isPackaged,
    platform: process.platform,
    argv: process.argv,
  });
}
