import test from 'node:test';
import assert from 'node:assert/strict';
import { startApp } from '../main/app.js';
import { resolvePaths } from '../main/paths.js';
import { CHANNELS } from '../main/ipc.js';
import { fakeEmitter, fakeLogger } from './helpers.mjs';

const paths = resolvePaths({ moduleUrl: new URL('../main/paths.js', import.meta.url).href, userData: '/tmp/u' });

function fakeElectron({ lock = true } = {}) {
  const switches = []; const ipc = {}; const events = {}; let quit = 0; let menu = 'unset'; let resolveReady;
  const ready = new Promise((r) => { resolveReady = r; });
  const sessionApi = { perm: null, setPermissionRequestHandler(fn) { this.perm = fn; } };
  const windows = [];
  class BrowserWindow {
    constructor(o) { Object.assign(this, fakeEmitter()); this.o = o; this.webContents = fakeEmitter({ reload() {}, setWindowOpenHandler() {} }); windows.push(this); }
    setAspectRatio() {} loadFile() {} isFullScreen() { return false; } isMinimized() { return false; }
    restore() {} focus() { this.focused = true; }
  }
  const app = {
    commandLine: { appendSwitch: (...a) => switches.push(a) },
    requestSingleInstanceLock: () => lock,
    quit: () => { quit += 1; },
    on: (n, fn) => { events[n] = fn; },
    whenReady: () => ready,
  };
  return { electron: { app, BrowserWindow, Menu: { setApplicationMenu: (m) => { menu = m; } }, ipcMain: { on: (c, fn) => { ipc[c] = fn; } }, shell: { openExternal() {} }, session: { defaultSession: sessionApi } },
    switches, ipc, events, windows, sessionApi, ready: () => resolveReady(), quits: () => quit, menu: () => menu };
}

const base = (fe, extra = {}) => ({ electron: fe.electron, steam: { isAvailable: () => false, unlock() {} }, settings: { get: () => ({ fullscreen: false, bounds: null }), update() {} }, logger: fakeLogger(), paths, isDev: false, platform: 'win32', argv: [], ...extra });

test('inicialização: autoplay liberado, menu removido, sessão endurecida, janela criada', async () => {
  const fe = fakeElectron();
  const app = startApp(base(fe));
  assert.deepEqual(fe.switches, [['autoplay-policy', 'no-user-gesture-required']]);
  assert.equal(app.getWindow(), null, 'janela só depois do ready');
  fe.ready(); await fe.ready; await Promise.resolve();
  assert.equal(fe.menu(), null);
  assert.equal(fe.windows.length, 1);
  assert.ok(fe.sessionApi.perm, 'permissões negadas por padrão');
  assert.deepEqual(Object.keys(fe.ipc).sort(), Object.values(CHANNELS).sort());
});

test('Linux adiciona --no-sandbox; Windows não', () => {
  const fe = fakeElectron();
  startApp(base(fe, { platform: 'linux' }));
  assert.ok(fe.switches.some(([n]) => n === 'no-sandbox'));
});

test('segunda instância encerra sem abrir janela', () => {
  const fe = fakeElectron({ lock: false });
  assert.equal(startApp(base(fe)), null);
  assert.equal(fe.quits(), 1);
  assert.equal(fe.windows.length, 0);
});

test('window-all-closed encerra o app; second-instance foca a janela existente', async () => {
  const fe = fakeElectron();
  startApp(base(fe));
  fe.ready(); await fe.ready; await Promise.resolve();
  fe.events['second-instance']();
  assert.equal(fe.windows[0].focused, true);
  fe.events['window-all-closed']();
  assert.equal(fe.quits(), 1);
});

test('IPC de sair só funciona vindo do jogo', async () => {
  const fe = fakeElectron();
  startApp(base(fe));
  fe.ipc[CHANNELS.quit]({ senderFrame: { url: 'https://x' } });
  assert.equal(fe.quits(), 0);
  fe.ipc[CHANNELS.quit]({ senderFrame: { url: paths.indexUrl } });
  assert.equal(fe.quits(), 1);
});
