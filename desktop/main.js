'use strict';
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const fs = require('node:fs');
const path = require('node:path');
const steam = require('./steam');

const TITLE = 'Estação 3:33';
const ASPECT = 16 / 9;

// Steam primeiro: o overlay precisa ser habilitado antes de criar janelas.
steam.init();

app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
if (process.platform === 'linux') app.commandLine.appendSwitch('no-sandbox'); // Steam Runtime no Linux não tem chrome-sandbox com suid

/* ---- preferências simples (modo da janela) ---- */
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
function loadSettings() {
  try { return JSON.parse(fs.readFileSync(settingsFile(), 'utf8')); } catch { return {}; }
}
function saveSettings(patch) {
  try { fs.writeFileSync(settingsFile(), JSON.stringify({ ...loadSettings(), ...patch })); } catch { /* sem permissão: ignora */ }
}

let win = null;

function createWindow() {
  const settings = loadSettings();
  win = new BrowserWindow({
    title: TITLE,
    width: 1280,
    height: 720,
    minWidth: 640,
    minHeight: 360,
    useContentSize: true,
    backgroundColor: '#07060d',
    show: false,
    autoHideMenuBar: true,
    fullscreen: process.argv.includes('--fullscreen') || settings.fullscreen === true,
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      backgroundThrottling: false,
      devTools: !app.isPackaged,
    },
  });
  win.setAspectRatio(ASPECT);
  win.once('ready-to-show', () => win.show());
  win.on('enter-full-screen', () => saveSettings({ fullscreen: true }));
  win.on('leave-full-screen', () => saveSettings({ fullscreen: false }));
  win.on('page-title-updated', (e) => e.preventDefault());

  // F11 e Alt+Enter alternam tela cheia
  win.webContents.on('before-input-event', (event, input) => {
    if (input.type !== 'keyDown') return;
    if (input.key === 'F11' || (input.alt && input.key === 'Enter')) {
      win.setFullScreen(!win.isFullScreen());
      event.preventDefault();
    }
  });

  // O jogo é uma página única: nada de navegar para fora nem abrir janelas novas
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (event, url) => { if (!url.startsWith('file://')) event.preventDefault(); });

  win.loadFile(path.join(__dirname, 'app', 'index.html'));
}

ipcMain.on('steam:unlock', (_event, id) => { steam.unlock(id); });

if (!app.requestSingleInstanceLock()) {
  app.quit();
} else {
  app.on('second-instance', () => { if (win) { if (win.isMinimized()) win.restore(); win.focus(); } });
  app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();
  });
  app.on('window-all-closed', () => app.quit());
}
