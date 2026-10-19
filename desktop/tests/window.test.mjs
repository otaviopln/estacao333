import test from 'node:test';
import assert from 'node:assert/strict';
import { resolvePaths } from '../main/paths.js';
import { buildWindowOptions, createMainWindow, DEFAULT_SIZE, handleShortcut } from '../main/window.js';
import { fakeEmitter } from './helpers.mjs';

const paths = resolvePaths({ moduleUrl: new URL('../main/paths.js', import.meta.url).href, userData: '/tmp/u' });

test('opções da janela: sandbox, isolamento, sem node e devtools só em dev', () => {
  const prod = buildWindowOptions({ settings: { fullscreen: false, bounds: null }, paths, isDev: false });
  assert.equal(prod.width, DEFAULT_SIZE.width);
  assert.deepEqual([prod.webPreferences.sandbox, prod.webPreferences.contextIsolation, prod.webPreferences.nodeIntegration, prod.webPreferences.devTools], [true, true, false, false]);
  assert.equal(prod.show, false);
  assert.equal(buildWindowOptions({ settings: { fullscreen: false, bounds: null }, paths, isDev: true }).webPreferences.devTools, true);
});

test('restaura tamanho salvo e respeita --fullscreen / preferência', () => {
  const o = buildWindowOptions({ settings: { fullscreen: false, bounds: { width: 1600, height: 900 } }, paths, isDev: false, argv: ['--fullscreen'] });
  assert.deepEqual([o.width, o.height, o.fullscreen], [1600, 900, true]);
  assert.equal(buildWindowOptions({ settings: { fullscreen: true, bounds: null }, paths, isDev: false }).fullscreen, true);
});

test('atalhos: F11 e Alt+Enter alternam tela cheia; DevTools só em dev', () => {
  let fs = false; let devtools = 0;
  const win = { isFullScreen: () => fs, setFullScreen: (v) => { fs = v; }, webContents: { toggleDevTools: () => { devtools += 1; } } };
  assert.equal(handleShortcut({ type: 'keyDown', key: 'F11' }, win, { isDev: false }), true);
  assert.equal(fs, true);
  assert.equal(handleShortcut({ type: 'keyDown', key: 'Enter', alt: true }, win, { isDev: false }), true);
  assert.equal(fs, false);
  assert.equal(handleShortcut({ type: 'keyUp', key: 'F11' }, win, { isDev: false }), false);
  assert.equal(handleShortcut({ type: 'keyDown', key: 'I', control: true, shift: true }, win, { isDev: false }), false);
  assert.equal(handleShortcut({ type: 'keyDown', key: 'I', control: true, shift: true }, win, { isDev: true }), true);
  assert.equal(devtools, 1);
});

test('createMainWindow liga eventos, carrega o jogo e salva tamanho/tela cheia', () => {
  const updates = []; const loaded = []; let ratio; let shown = 0;
  class FakeWindow {
    constructor(opts) { Object.assign(this, fakeEmitter()); this.opts = opts; this.webContents = fakeEmitter(); this.fullscreen = false; }
    setAspectRatio(r) { ratio = r; }
    loadFile(f) { loaded.push(f); }
    show() { shown += 1; }
    isFullScreen() { return this.fullscreen; }
    setFullScreen(v) { this.fullscreen = v; }
    isMinimized() { return false; }
    getContentBounds() { return { width: 1111, height: 625 }; }
  }
  const settings = { get: () => ({ fullscreen: false, bounds: null }), update: (p) => updates.push(p) };
  const win = createMainWindow({ BrowserWindow: FakeWindow, settings, paths, isDev: false });
  assert.equal(ratio, 16 / 9);
  assert.deepEqual(loaded, [paths.indexHtml]);
  win.emit('ready-to-show'); assert.equal(shown, 1);
  win.emit('enter-full-screen'); win.emit('leave-full-screen');
  win.emit('close');
  assert.deepEqual(updates, [{ fullscreen: true }, { fullscreen: false }, { bounds: { width: 1111, height: 625 } }]);
  let prevented = false;
  win.webContents.emit('before-input-event', { preventDefault: () => { prevented = true; } }, { type: 'keyDown', key: 'F11' });
  assert.equal(prevented, true);
});

test('fechar em tela cheia não sobrescreve o tamanho da janela', () => {
  const updates = [];
  class FakeWindow {
    constructor() { Object.assign(this, fakeEmitter()); this.webContents = fakeEmitter(); }
    setAspectRatio() {} loadFile() {} isFullScreen() { return true; } isMinimized() { return false; }
  }
  const win = createMainWindow({ BrowserWindow: FakeWindow, settings: { get: () => ({ fullscreen: true, bounds: null }), update: (p) => updates.push(p) }, paths, isDev: false });
  win.emit('close');
  assert.deepEqual(updates, []);
});
