'use strict';
/**
 * Preload (sandbox): a ÚNICA superfície que o jogo enxerga do app desktop. Contrato v1 — ver
 * game/src/platform/host.js. Os nomes dos canais precisam coincidir com desktop/main/ipc.js (o teste confere).
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('estacao', Object.freeze({
  apiVersion: 1,
  achievements: Object.freeze({
    unlock: (id) => { if (typeof id === 'string') ipcRenderer.send('achievements:unlock', id); },
  }),
  app: Object.freeze({
    quit: () => ipcRenderer.send('app:quit'),
  }),
}));
