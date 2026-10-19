/** @file Janela principal: 16:9, tela cheia (F11 / Alt+Enter) e preferências persistidas. */
import { MIN_HEIGHT, MIN_WIDTH } from './settings.js';

export const TITLE = 'Estação 3:33';
export const ASPECT_RATIO = 16 / 9;
export const DEFAULT_SIZE = Object.freeze({ width: 1280, height: 720 });

/** Opções do BrowserWindow (função pura, testável). */
export function buildWindowOptions({ settings, paths, isDev, argv = [] }) {
  const size = settings.bounds || DEFAULT_SIZE;
  return {
    title: TITLE,
    width: size.width,
    height: size.height,
    minWidth: MIN_WIDTH,
    minHeight: MIN_HEIGHT,
    useContentSize: true,
    backgroundColor: '#07060d',
    show: false,
    autoHideMenuBar: true,
    fullscreen: argv.includes('--fullscreen') || settings.fullscreen === true,
    icon: paths.icon,
    webPreferences: {
      preload: paths.preload,
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      backgroundThrottling: false,
      devTools: isDev,
    },
  };
}

/** Atalhos de janela. Devolve true se tratou a tecla. */
export function handleShortcut(input, win, { isDev }) {
  if (input.type !== 'keyDown') return false;
  if (input.key === 'F11' || (input.alt && input.key === 'Enter')) { win.setFullScreen(!win.isFullScreen()); return true; }
  if (isDev && input.control && input.shift && input.key.toLowerCase() === 'i') { win.webContents.toggleDevTools(); return true; }
  return false;
}

/**
 * @param {{ BrowserWindow: any, settings: ReturnType<typeof import('./settings.js').createSettings>, paths: ReturnType<typeof import('./paths.js').resolvePaths>, isDev: boolean, argv?: string[] }} deps
 */
export function createMainWindow({ BrowserWindow, settings, paths, isDev, argv = [] }) {
  const win = new BrowserWindow(buildWindowOptions({ settings: settings.get(), paths, isDev, argv }));
  win.setAspectRatio(ASPECT_RATIO);
  win.once('ready-to-show', () => win.show());
  win.on('page-title-updated', (event) => event.preventDefault());
  win.on('enter-full-screen', () => settings.update({ fullscreen: true }));
  win.on('leave-full-screen', () => settings.update({ fullscreen: false }));
  win.on('close', () => {
    if (win.isFullScreen() || win.isMinimized()) return;
    const { width, height } = win.getContentBounds();
    settings.update({ bounds: { width, height } });
  });
  win.webContents.on('before-input-event', (event, input) => { if (handleShortcut(input, win, { isDev })) event.preventDefault(); });
  win.loadFile(paths.indexHtml);
  return win;
}
