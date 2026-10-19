/** @file Composição do app: liga janela, IPC, segurança e diagnóstico. Recebe tudo por injeção (testável sem Electron). */
import { watchRenderer } from './crash.js';
import { registerIpc } from './ipc.js';
import { hardenSession, hardenWebContents } from './security.js';
import { createMainWindow } from './window.js';

/**
 * @param {{ electron: any, steam: any, settings: any, logger: any, paths: any, isDev: boolean, platform: string, argv: string[] }} deps
 * @returns {{ getWindow: () => any } | null} `null` quando é uma segunda instância (o app encerra).
 */
export function startApp({ electron, steam, settings, logger, paths, isDev, platform, argv }) {
  const { app, BrowserWindow, Menu, ipcMain, shell, session } = electron;

  app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
  // Steam Runtime no Linux não oferece o chrome-sandbox com setuid; o jogo só carrega o próprio HTML offline.
  if (platform === 'linux') app.commandLine.appendSwitch('no-sandbox');

  if (!app.requestSingleInstanceLock()) { app.quit(); return null; }

  let win = null;
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.on('web-contents-created', (_event, contents) => hardenWebContents(contents, { shell, trustedUrl: paths.indexUrl }));
  app.on('window-all-closed', () => app.quit());

  registerIpc({ ipcMain, steam, quit: () => app.quit(), trustedUrl: paths.indexUrl, logger });

  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    hardenSession(session.defaultSession);
    win = createMainWindow({ BrowserWindow, settings, paths, isDev, argv });
    watchRenderer(win.webContents, { logger });
    logger.info(`[app] iniciado (${platform}, ${isDev ? 'dev' : 'produção'}, steam ${steam.isAvailable() ? 'on' : 'off'})`);
  });

  return { getWindow: () => win };
}
