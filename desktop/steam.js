'use strict';
/**
 * Integração com a Steamworks (via steamworks.js). Tudo é opcional: se a Steam não estiver aberta ou o módulo
 * nativo não existir (ex.: rodando `npm start` sem Steam), o jogo funciona normalmente, sem conquistas.
 */
const config = require('./steam-config.json');

let client = null;

function init() {
  try {
    const steamworks = require('steamworks.js');
    client = steamworks.init(config.appId);
    // Overlay da Steam (Shift+Tab) dentro do Electron
    steamworks.electronEnableSteamOverlay();
    console.log('[steam] conectado como', client.localplayer.getName());
    return true;
  } catch (err) {
    client = null;
    console.warn('[steam] indisponível:', err && err.message ? err.message : err);
    return false;
  }
}

/** Libera uma conquista (idempotente). */
function unlock(id) {
  if (!client || typeof id !== 'string' || !/^[A-Z0-9_]{1,64}$/.test(id)) return false;
  try {
    if (!client.achievement.isActivated(id)) client.achievement.activate(id);
    return true;
  } catch (err) {
    console.warn('[steam] falha ao liberar', id, err && err.message ? err.message : err);
    return false;
  }
}

module.exports = { init, unlock, isAvailable: () => client !== null };
