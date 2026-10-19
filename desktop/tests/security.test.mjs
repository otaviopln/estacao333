import test from 'node:test';
import assert from 'node:assert/strict';
import { hardenSession, hardenWebContents, isSafeExternalUrl } from '../main/security.js';
import { fakeEmitter } from './helpers.mjs';

test('só https é considerado link externo seguro', () => {
  assert.equal(isSafeExternalUrl('https://store.steampowered.com/app/1'), true);
  for (const u of ['http://x.com', 'file:///etc/passwd', 'javascript:alert(1)', 'steam://run/1', 'lixo', '']) assert.equal(isSafeExternalUrl(u), false, u);
});

test('hardenSession nega toda permissão', () => {
  let request, check;
  hardenSession({ setPermissionRequestHandler: (fn) => { request = fn; }, setPermissionCheckHandler: (fn) => { check = fn; } });
  let granted = 'nenhum';
  request({}, 'media', (ok) => { granted = ok; });
  assert.equal(granted, false);
  assert.equal(check(), false);
});

test('hardenWebContents bloqueia navegação, webview e janelas; abre só https no navegador', () => {
  const opened = []; let openHandler;
  const contents = fakeEmitter({ setWindowOpenHandler: (fn) => { openHandler = fn; } });
  hardenWebContents(contents, { shell: { openExternal: (u) => opened.push(u) }, trustedUrl: 'file:///app/index.html' });

  assert.deepEqual(openHandler({ url: 'https://exemplo.com' }), { action: 'deny' });
  assert.deepEqual(openHandler({ url: 'file:///c:/x' }), { action: 'deny' });
  assert.deepEqual(opened, ['https://exemplo.com']);

  const nav = (url) => { let prevented = false; contents.emit('will-navigate', { preventDefault: () => { prevented = true; } }, url); return prevented; };
  assert.equal(nav('https://evil.example'), true);
  assert.equal(nav('file:///app/index.html'), false);

  let webviewBlocked = false;
  contents.emit('will-attach-webview', { preventDefault: () => { webviewBlocked = true; } });
  assert.equal(webviewBlocked, true);
});
