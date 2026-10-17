'use strict';
const { contextBridge, ipcRenderer } = require('electron');

// Única API exposta ao jogo: liberar conquistas. O jogo (src/platform/steam-bridge.js) a usa se existir.
contextBridge.exposeInMainWorld('steam', {
  unlock: (id) => ipcRenderer.send('steam:unlock', String(id)),
});
